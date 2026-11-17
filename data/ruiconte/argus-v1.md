# ruiconte/argus-v1

## Resumen

Argus V1 es un checkpoint de deteccion de tinta para los papiros de Herculano, desarrollado por el usuario ruiconte en el contexto del Vesuvius Challenge. No es un modelo de lenguaje: es una red neuronal convolucional 3D especializada en segmentar tinta sobre volumenes de tomografia computarizada (CT) de papiros carbonizados, a una escala de 9 µm por voxel. Su proposito es identificar que voxeles de la superficie del papiro contienen tinta, un paso critico para poder leer los textos sin desenrollar fisicamente los rollos.

El modelo reutiliza la misma arquitectura que `scrollprize/ink_9um` y Reader V3 (`vesuvius_unet_3d_stem_2d`), con una ventana de 17 capas y 34,6 millones de parametros, y mantiene el mismo formato de fichero que `reader-v3.pth`. Esto lo convierte en un reemplazo directo ("drop-in") para cualquier herramienta que ya cargue Reader V3, como HerculeX, sin necesidad de cambios en el codigo de inferencia.

Su relevancia radica en que mejora a Reader V3 en AUC y balanced accuracy sobre rollos nunca vistos (PHerc0841) y sobre las mascaras de validacion oficiales, manteniendo la licencia MIT y un coste de inferencia identico al de la referencia. El checkpoint ocupa 0,3 GB y se distribuye como un unico fichero `.pth`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `vesuvius_unet_3d_stem_2d` (U-Net 3D con stem 2D), ventana de 17 capas |
| Parametros totales | 34,6 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de entrada de 17 capas axiales y tiles de 256 px (o mayores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision/segmentacion, no linguistico) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch), con claves `model` y dict `config`, compatible con `reader-v3.pth` |

## Arquitectura y entrenamiento

Argus V1 emplea la red `vesuvius_unet_3d_stem_2d` del Vesuvius Challenge, una U-Net que procesa volumenes 3D de CT con un stem 2D y una ventana deslizante de 17 capas centrada en la superficie del papiro. La entrada se normaliza con un metodo robusto basado en MAD (percentiles 1-99) y se procesa en tiles de 256 px o mayores; segun el autor, tiles de inferencia mas grandes mejoraron a todos los modelos evaluados.

El entrenamiento parte del checkpoint `dense9um-all7-step075000.pth` de `domenicor046/ink9um-dense` (MIT) y aplica ocho fine-tunes de 8.000 iteraciones cada uno, con tiles de 256 px, batch de 8, learning rate de 2,5e-4 o 5e-4 y cuatro semillas por configuracion. Las etiquetas son pseudo-etiquetas densas del mismo modelo base, y la funcion de perdida combina BCE con label smoothing de 0,5 mas Dice. Los datos provienen de los volumenes de superficie de PHerc0139, PHerc1667, PHerc Paris 4 y PHerc0814 del conjunto abierto del Vesuvius Challenge.

La innovacion tecnica destacable es la eliminacion del volteo de profundidad durante el entrenamiento: la receta de referencia invierte el orden de las capas, lo que hacia que el modelo ignorase la direccion fisica de profundidad (AUC con orden invertido de 0,79). Sin ese volteo, el AUC con orden invertido cae a 0,53, proximo al azar, lo que indica que el modelo respeta la direccion fisica real. Los ocho fine-tunes comparten inicializacion y se promedian mediante weight soup (Wortsman et al., 2022), superando a cualquier ejecucion individual sobre las mascaras de validacion. Quedaron fuera del entrenamiento y de la seleccion las mascaras de validacion oficiales, todo PHerc0841 y PHerc0139 w053.

## Capacidades

- Segmentacion de tinta sobre volumenes de CT de papiros a escala de 9 µm por voxel.
- Deteccion de tinta dependiente de la direccion fisica de profundidad (AUC 0,53 con orden invertido, frente a 0,54 de Reader V3).
- Inferencia con test-time augmentation de 8 pliegues y tiles de 256 px o mayores.
- Compatibilidad directa con HerculeX mediante la variable `HERCULEX_WEIGHTS`.
- Compatibilidad con cualquier herramienta que cargue `reader-v3.pth` (mismas claves `model` y dict `config`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente de vision 3D.
- No tiene capacidades multilingues ni de generacion de texto.

## Casos de uso

- Lectura de papiros de Herculano sin desenrollado fisico: el modelo segmenta la tinta sobre los volumenes de CT y permite reconstruir el texto a partir de las predicciones, sustituyendo a Reader V3 sin cambios en el pipeline.
- Investigacion en el Vesuvius Challenge: sirve como checkpoint de referencia para comparar nuevas tecnicas de deteccion de tinta, dado que comparte arquitectura y formato con Reader V3.
- Analisis de rollos nunca vistos: su rendimiento sobre PHerc0841 (AUC 0,942) lo hace adecuado para explorar rollos fuera del conjunto de entrenamiento.
- Verificacion de candidatos de tinta: las marcas extra sobre zonas que el mapa del equipo considera en blanco (10,3 % forward frente a 1,0 % reversed) pueden usarse como pistas a revisar manualmente, no como lecturas definitivas.
- Integracion en HerculeX: basta con apuntar `HERCULEX_WEIGHTS` al fichero `argus-v1.pth` para desplegarlo en el flujo de trabajo existente.
- Procesado por lotes de volumenes de superficie: al mantener el mismo layout de fichero que Reader V3, se puede enchufar en scripts de inferencia por tiles ya existentes.
- Comparacion de recetas de entrenamiento: el contraste entre volteo y no volteo de profundidad sirve como caso de estudio reproducible para disenar fine-tunes sobre datos de CT.

## Benchmarks y rendimiento

Resultados sobre PHerc0841 w00 (rollo nunca visto, etiquetas del equipo de 2026-09-18), tiles de 256 px y TTA de 8 pliegues:

| Metrica | Argus V1 | Reader V3 | dense-native (Nieuwlaar) | dense-all7 (domenicor046) |
|---|---|---|---|---|
| AUC ↑ | **0,942** | 0,929 | 0,924 | 0,909 |
| Balanced accuracy @0,5 ↑ | **0,850** | 0,843 | 0,842 | 0,812 |
| Best Dice ↑ | 0,758 | **0,767** | 0,737 | 0,729 |
| Fondo marcado como tinta al 80 % de recall ↓ | 8,9 % | **8,5 %** | 10,9 % | 11,9 % |
| AUC con orden de profundidad invertido (≈ 0,5 esperado) | 0,530 | 0,540 | 0,545 | 0,551 |

Resultados sobre las mascaras de validacion oficiales (PHerc0139 w016, PHerc0814 46527, PHerc1667 w029):

| Metrica | Argus V1 | Reader V3 | dense-native | dense-all7 |
|---|---|---|---|---|
| Balanced accuracy @0,5 ↑ | **0,849** | 0,791 | 0,840 | 0,826 |
| AUC ↑ | **0,926** | 0,907 | 0,917 | 0,913 |
| Best Dice ↑ | **0,764** | 0,707 | 0,743 | 0,739 |

El autor advierte que Reader V3 se entreno con escaneos nativos de 113/116 keV, mientras que estas mascaras usan volumenes derivados de 2,4 µm, por lo que esta segunda tabla favorece a los modelos entrenados en ese formato; recomienda leer primero la tabla de PHerc0841.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el checkpoint pesa 0,3 GB y el modelo tiene 34,6 M de parametros, pero el consumo depende del tamano de tile y del TTA.
- GPU recomendadas: no disponible. El autor no especifica hardware de referencia.
- Compatibilidad con GPU de consumo: no disponible; por el tamano del modelo (34,6 M de parametros) es plausible que quepa en GPU de consumo, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: HerculeX (`HERCULEX_WEIGHTS=/path/to/argus-v1.pth`) y cualquier herramienta que cargue `reader-v3.pth`; requiere ventana de 17 capas centrada en la superficie, normalizacion MAD robusta (1-99 %) y tiles de 256 px o mayores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana / entrada | AUC (PHerc0841) | Best Dice (PHerc0841) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Argus V1 | 34,6 M | 17 capas, tiles 256 px | **0,942** | 0,758 | MIT | Hugging Face (`ruiconte/argus-v1`) |
| Reader V3 | misma red (`vesuvius_unet_3d_stem_2d`) | 17 capas, tiles 256 px | 0,929 | **0,767** | MIT | Vesuvius Challenge |
| dense-native (Nieuwlaar) | no disponible | no disponible | 0,924 | 0,737 | MIT | `ink9um-dense-native` |
| dense-all7 (domenicor046) | no disponible | no disponible | 0,909 | 0,729 | MIT | `ink9um-dense` |

## Limitaciones y advertencias

- En PHerc0841, Reader V3 obtiene mejor Dice (0,767 frente a 0,758) y marca algo menos de fondo como tinta (8,5 % frente a 8,9 %).
- Argus marca mas papiro como tinta que Reader V3: en PHerc0139 w053, al mismo 80 % de recall, senala el 14,9 % de un recorte central de 3072 px frente al 10,0 % de Reader V3.
- Ese recorte no esta en blanco: el mapa de escaneo a 1 µm del equipo muestra una linea de letras. Con el orden de profundidad invertido, las marcas de Argus caen del 14,9 % al 1,1 % (Reader V3, del 10,0 % al 2,7 %).
- Restringido a pixeles que el mapa del equipo considera en blanco: Argus marca el 10,3 % en orden directo y el 1,0 % en invertido (Reader V3: 6,9 % y 2,7 %).
- En el recorte central de la envoltura interior w057, Argus marca el 8,9 % en directo y el 1,5 % en invertido (Reader V3: 4,7 % y 2,2 %).
- Argus encuentra el 80 % de la tinta que ve el mapa del equipo en w053, frente al 61 % de Reader V3.
- Las marcas extra dependen de la direccion fisica de profundidad y parecen tinta tenue, no alucinacion de textura, pero no hay etiquetas humanas que lo demuestren: deben tratarse como pistas a verificar, no como lecturas.
- No hay datos publicados de sesgos, idiomas ni cuantizacion porque el modelo no opera en esos dominios.
- Los datos de escaneo del Vesuvius Challenge se rigen por sus propios terminos, independientes de la licencia MIT del checkpoint.
- El autor recomienda verificar la integridad del fichero con `sha256sum argus-v1.pth` y comprobar que coincide con `858b300d6e9d73d148a8790cda92d5bbd38fad15b3d6709c7c3f2dfd94fe4918`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruiconte/argus-v1
- Modelo base `domenicor046/ink9um-dense`: https://huggingface.co/domenicor046/ink9um-dense
- Modelo comparado `ink9um-dense-native` (Nieuwlaar): no disponible como URL en la informacion proporcionada
- Red y receta de referencia `scrollprize/ink_9um` (Vesuvius Challenge): no disponible como URL en la informacion proporcionada
- Datos abiertos del Vesuvius Challenge: no disponible como URL en la informacion proporcionada
- Paper de weight soup (Wortsman et al., 2022): no disponible como URL en la informacion proporcionada
