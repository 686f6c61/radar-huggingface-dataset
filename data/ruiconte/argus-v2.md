# ruiconte/argus-v2

## Resumen

Argus V2 es un modelo de deteccion de tinta sobre volumenes de tomografia computarizada (CT) de papiros de Herculano, desarrollado por el usuario ruiconte en el contexto del Vesuvius Challenge. No es un modelo de lenguaje: es una red neuronal convolucional especializada en segmentacion de voxeles que predice, capa a capa dentro de un escaneo CT, que areas corresponden a tinta y cuales a sustrato vacio. Su objetivo es permitir la lectura de rollos carbonizados sin abrirlos fisicamente.

Tecnicamente es un fine-tune de Reader V3 (obra de domenicor046, licencia MIT) sobre escaneos nativos de 8-9 micrometros, el formato real de los rollos no leidos, a diferencia de la version V1, que se entrenaba sobre renders derivados de escaneos de 2.4 micrometros. Mantiene la misma red y el mismo formato de fichero que `reader-v3.pth`, por lo que es un reemplazo directo en herramientas como HerculeX o ink-sdk.

Su relevancia es acotada pero concreta: corrige la perdida de rendimiento de V1 sobre escaneos nativos (PHerc0841 pasa de AUC 0.869 a 0.924) y mejora a Reader V3 en dos de los tres rollos nativos evaluados. El repositorio pesa 0.3 GB y no registra descargas ni interacciones en Hugging Face en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para deteccion de tinta (`ink_9um`, del Vesuvius Challenge); misma red que Reader V3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D sobre ventanas de 17 capas y tiles de 256 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch), fichero `argus-v2.pth` |

## Arquitectura y entrenamiento

Argus V2 reutiliza la red `ink_9um` del Vesuvius Challenge, la misma que Reader V3. La inferencia se realiza sobre ventanas de profundidad de 17 capas centradas en la superficie del papiro, con normalizacion robusta MAD y procesamiento por tiles de 256 px. El autor recomienda ademas promediar tres ventanas desplazadas a -2, 0 y +2 capas, lo que aporta aproximadamente un punto de AUC.

El entrenamiento parte de los pesos de `domenicor046/reader-v3` (MIT) y aplica un fine-tune de 12 000 iteraciones sobre tiles de 256 px, batch 8, SGD con learning rate 2.5e-4 y funcion de perdida BCE con label smoothing 0.5 mas Dice. El orden de profundidad nunca se invierte durante el entrenamiento, un detalle relevante para evitar que el modelo aprenda correlaciones espurias. Los datos proceden de un 30 % aleatorio, por bloques, del area supervisada de los 70 segmentos nativos de `domenicor046/reader-v2-labels` (MIT), combinados con los volumenes de superficie nativos publicos: PHerc0139, 0814 y 0500P2 a 113 keV, PHerc0009B y 0343P a 116 keV y PHerc0172 a 53 keV. La seleccion de checkpoint uso tres segmentos nativos reservados (0139 w050, 0009B 20250511200236 y 0814 20250925212701). PHerc0841 y PHerc1447 no se usaron ni para entrenamiento ni para seleccion, lo que los convierte en conjuntos de test limpios.

## Capacidades

- Deteccion de tinta en volumenes CT de papiros carbonizados, voxel a voxel.
- Funcionamiento nativo sobre escaneos de 8-9 micrometros (113 keV, 116 keV y 53 keV), sin necesidad de reescalado a renders de 2.4 micrometros.
- Compatibilidad directa con el formato de `reader-v3.pth`: funciona sin cambios en HerculeX, ink-sdk y cualquier herramienta que cargue Reader V3.
- Evaluacion con test-time augmentation de 8 folds y tiles de 256 px.
- Soporte de promedio multi-ventana de profundidad (-2, 0, +2 capas) para mejorar la robustez.
- No dispone de tool calling, agentes, capacidades multilingues, vision 2D generica, audio ni modo de razonamiento. Es un modelo de una sola tarea.

## Casos de uso

- Lectura de rollos no abiertos: es el caso central. El modelo predice la distribucion de tinta sobre la superficie virtual de un rollo escaneado a 8-9 micrometros, permitiendo reconstruir texto sin desenrollar fisicamente el papiro. Es adecuado porque esta entrenado precisamente sobre escaneos nativos, no sobre renders derivados.
- Sustitucion directa en pipelines existentes de HerculeX: basta con apuntar `HERCULEX_WEIGHTS` a `argus-v2.pth` para obtener mejoras de AUC y bAcc sin reescribir codigo, gracias a la compatibilidad de red y formato.
- Validacion cruzada de segmentaciones: al comparar sus predicciones con las de Reader V3 o Argus V1 sobre el mismo volumen se pueden detectar zonas dudosas; el autor reporta que el orden de profundidad invertido degrada el AUC a ~0.5, lo que sirve como test de alucinacion.
- Investigacion en paleografia computacional: el modelo permite generar mapas de tinta sobre los que aplicar tecnicas de transcripcion o comparacion de trazos entre rollos de la misma biblioteca.
- Procesado por lotes de segmentos de gran tamano: con tiles de 256 px y TTA de 8 folds, el modelo puede aplicarse sistematicamente sobre los 70 segmentos nativos etiquetados para generar nuevas anotaciones o revisar las existentes.
- Benchmark de referencia para nuevos modelos: al estar disponible bajo MIT y con hash SHA-256 publicado, sirve como baseline reproducible en competiciones o articulos sobre deteccion de tinta en CT de papiros.

## Benchmarks y rendimiento

Escaneos nativos no vistos en entrenamiento (TTA de 8 folds, tiles de 256 px):

| Rollo / condicion | Metrica | Argus V2 | Reader V3 |
|---|---|---|---|
| PHerc0841 w00, 9.37 µm / 113 keV | AUC | 0.924 | 0.913 |
| PHerc0841 w00 | bAcc@0.5 | 0.828 | 0.764 |
| PHerc0841 w00 | Dice | 0.727 | 0.718 |
| PHerc0841 w00 | Fondo marcado como tinta | 11.6 % | 13.2 % |
| PHerc0841 w00, orden de profundidad invertido | AUC | 0.509 | 0.532 |
| PHerc1447 w058, 8.64 µm / 116 keV | AUC | 0.854 | 0.856 |
| PHerc1447 w058 | bAcc@0.5 | 0.767 | 0.713 |
| PHerc1447 w058 | Dice | 0.657 | 0.647 |
| PHerc1447 w058 | Fondo marcado como tinta | 27.3 % | 28.1 % |
| PHerc1447 w060, 8.64 µm / 116 keV | AUC | 0.787 | 0.776 |
| PHerc1447 w060 | bAcc@0.5 | 0.669 | 0.613 |
| PHerc1447 w060 | Dice | 0.547 | 0.493 |
| PHerc1447 w060 | Fondo marcado como tinta | 41.5 % | 42.1 % |

Renders agrupados de escaneos de 2.4 micrometros (formato de Argus V1):

| Rollo / condicion | Metrica | Argus V2 | Argus V1 | Reader V3 |
|---|---|---|---|---|
| PHerc0841 w00 (no visto) | AUC | 0.946 | 0.942 | 0.929 |
| PHerc0841 w00 | bAcc@0.5 | 0.872 | 0.850 | 0.843 |
| PHerc0841 w00 | Dice | 0.770 | 0.758 | 0.767 |
| PHerc0841 w00 | Fondo marcado como tinta | 7.5 % | 8.9 % | 8.5 % |
| PHerc0139 w053, recorte central | Marcado como tinta al umbral de 80 % recall de 0841 | 6.4 % | 14.9 % | 10.0 % |
| Mascaras oficiales de validacion (3) | bAcc@0.5 | 0.778 | 0.849 | 0.791 |
| Mascaras oficiales de validacion (3) | AUC | 0.898 | 0.926 | 0.907 |

Promedio multi-ventana (-2, 0, +2 capas) sobre PHerc0841 nativo: Argus V2 0.928, Reader V3 0.922.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio pesa 0.3 GB, pero el autor no publica cifras de memoria ni de latencia.
- GPU recomendadas: no disponible. El modelo se ejecuta mediante HerculeX o herramientas equivalentes, pero no se especifican requisitos minimos.
- Encaje en GPU de consumo: no disponible. Dado el tamano del fichero de pesos, es plausible que quepa en GPU de consumo, pero no hay confirmacion en la informacion disponible.
- Opciones de despliegue: HerculeX (variable `HERCULEX_WEIGHTS`), ink-sdk y cualquier herramienta que cargue `reader-v3.pth`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrenamiento | PHerc0841 nativo (AUC) | PHerc1447 w058 (AUC) | Mascaras oficiales (AUC) | Licencia |
|---|---|---|---|---|---|---|
| Argus V2 | Fine-tune de Reader V3 | Escaneos nativos 8-9 µm | 0.924 | 0.854 | 0.898 | MIT |
| Reader V3 | Red base `ink_9um` | no disponible | 0.913 | 0.856 | 0.907 | MIT |
| Argus V1 | Fine-tune sobre renders 2.4 µm | Renders agrupados | 0.869 (reportado por el autor) | no disponible | 0.926 | MIT |

Argus V2 es la mejor opcion para escaneos nativos en PHerc0841 y PHerc1447 w060, mientras que Argus V1 sigue siendo superior en las tres mascaras oficiales de validacion sobre renders agrupados. Reader V3 mantiene una ligera ventaja en AUC sobre PHerc1447 w058 y en las mascaras oficiales frente a V2.

## Limitaciones y advertencias

- En PHerc1447 w058 el AUC cae 0.2 puntos por debajo de Reader V3, aunque Dice, bAcc y fondo marcado como tinta son mejores.
- En las tres mascaras oficiales de validacion (renders agrupados de 2.4 micrometros) Argus V1 sigue siendo mejor modelo, y Reader V3 esta ligeramente por delante de V2. El autor recomienda usar V1 para renders agrupados y V2 para escaneos nativos.
- El porcentaje de fondo marcado como tinta es alto en algunos rollos: 41.5 % en PHerc1447 w060 y 27.3 % en w058, lo que indica una tasa de falsos positivos considerable en esas condiciones.
- Riesgo de alucinacion estructural: el autor mide el AUC con el orden de profundidad invertido como test de no-alucinacion; el valor de 0.509 en PHerc0841 esta cerca de 0.5 (sin senal), pero no se han publicado pruebas equivalentes en todos los rollos.
- El modelo depende de la normalizacion MAD y de ventanas de 17 capas; un preprocesado distinto puede degradar los resultados.
- No se han publicado datos de sesgo, idioma ni rendimiento fuera del dominio de papiros de Herculano. No es un modelo de proposito general.
- El uso comercial esta permitido por la licencia MIT, pero las etiquetas de test de PHerc1447 (YoussefMoNader) son CC BY-NC 4.0 y solo se usaron para evaluacion, no para entrenamiento.
- El repositorio no registra descargas ni likes, y la fecha de creacion indicada (2026-11-17) es posterior a la de redaccion de esta ficha, lo que sugiere que los metadatos pueden no ser fiables.
- Verificar la integridad del fichero con `sha256sum argus-v2.pth`; el hash esperado es `659130f7fb6f67929f5dfd5a997d4e4bbbf49024bb818176bee846bca82de6fd`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruiconte/argus-v2
- Repositorio de codigo: https://github.com/ruiconte/ink-swarm
- Modelo base Reader V3: https://huggingface.co/domenicor046/reader-v3
- Etiquetas nativas reader-v2-labels: https://huggingface.co/domenicor046/reader-v2-labels
- Vesuvius Challenge (datos abiertos y red `ink_9um`): https://scrollprize.org
