# domenicor046/reader-v2

## Resumen

Reader v2 es un modelo de deteccion de tinta (ink detection) para el reto Vesuvius, orientado a la lectura virtual de los papiros carbonizados de Herculano. Lo publica el usuario domenicor046 en HuggingFace y se distribuye como checkpoint de PyTorch que sustituye directamente al modelo de referencia `scrollprize/ink_9um` en el pipeline de inferencia del equipo: solo cambia el fichero de pesos. Su problema objetivo es recuperar la senal de tinta en tomografias de baja energia (116 keV y 113 keV) sobre las que los modelos publicos anteriores degradan mucho su rendimiento.

El modelo esta especializado en el protocolo de escaneo de 116 keV de las First Letters, empleado en 11 de los 22 rollos de ese conjunto. Segun la model card, sobre datos retenidos alcanza un AUC de 0,834 frente al mapa de referencia del equipo en PHerc0009B, frente a 0,725 del siguiente mejor modelo publico (Hecate) y 0,626 del checkpoint oficial `ink_9um`; en un rollo nunca visto (PHerc0841) obtiene 0,858 de AUC frente al mapa del equipo.

La relevancia actual es acotada pero clara dentro del nicho: es el primer modelo publico que supera al checkpoint liberado por el equipo en las seis pruebas reportadas, y reduce de forma notable las falsas alarmas sobre papiro en blanco (10,4% frente al 43% de `ink_9um` con el mismo recall de tinta). No es un modelo de lenguaje: no genera texto ni soporta tool calling, sino que produce mapas de probabilidad de tinta a partir de volumenes de superficie en formato zarr.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de segmentacion volumetrica sobre volumenes de superficie; la model card no detalla la topologia) |
| Parametros totales | no disponible (el checkpoint de inferencia ocupa 138 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision volumetrica; el campo receptivo depende del tamano de parche, no documentado) |
| Tipos de cuantizacion | no disponible (se distribuye en el formato nativo de PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (diccionario con `model`, `config` y `step`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna ni el numero de parametros. Lo que si se documenta es el formato de operacion: el modelo consume un `surface_volume.zarr` (volumen de superficie derivado de la tomografia del rollo) y produce una imagen TIFF con el mapa de probabilidad de tinta. La inferencia se realiza por parches con solapamiento configurable (`--overlap 0.5`), fusion por blending Hann (`--blend-mode hann`) y direccion de barrido `forward`.

En cuanto al entrenamiento, el repositorio incluye `train_config.json` con la configuracion exacta y un segundo checkpoint, `reader-v2-init-ft12k.pth`, que actua como inicializacion: es un checkpoint previo del autor, `ink9um-dense` (agosto), afinado durante 12.000 pasos a 116 keV. El modelo final corresponde al paso 40.000 (`reader-v2-step040000.pth`). La model card advierte de que se uso una unica semilla de entrenamiento y que los mapas usados como profesor (teacher) son salidas de modelos obtenidos a partir de escaneos 3,6 veces mas finos, lo que introduce dependencia respecto a esos mapas de referencia.

## Capacidades

- Deteccion de tinta sobre volumenes de tomografia de papiros carbonizados, con salida de mapa de probabilidad en TIFF.
- Generalizacion a rollos no vistos durante el entrenamiento: PHerc0841 alcanza 0,858 de AUC frente al mapa del equipo sin haber sido entrenado con ese rollo.
- Rendimiento especifico en el protocolo de 116 keV, con resultados tambien reportados a 113 keV (PHerc0139 w047, AUC 0,893).
- Supresion de falsos positivos sobre papiro en blanco: 10,4% de falsas alarmas con un 80% de recall de tinta, frente al 43% del checkpoint oficial.
- Compatibilidad directa con el pipeline de inferencia del equipo (`koine_machines`, rama `merge-ink-pipelines` de villa) sin cambios de codigo, solo de checkpoint.
- Reentrenamiento reproducible: se publican configuracion de entrenamiento y checkpoint de inicializacion.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision generica, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Lectura virtual de rollos de Herculano a 116 keV: el modelo se aplica sobre el volumen de superficie de cada segmento del rollo para producir mapas de tinta que despues se segmentan y se ensamblan en imagenes legibles, aprovechando su ventaja especifica en ese protocolo de escaneo.
- Sustitucion directa de `ink_9um` en pipelines existentes: al mantener el mismo formato de checkpoint y el mismo comando de inferencia, cualquier flujo que ya use el modelo del equipo puede adoptar Reader v2 cambiando unicamente la ruta del fichero de pesos, sin reescribir codigo.
- Reduccion de falsos positivos en la fase de anotacion: con un 10,4% de falsas alarmas sobre papiro en blanco (frente al 43% de `ink_9um`), disminuye el trabajo manual de descarte de trazos inexistentes antes de la revision por paleografos.
- Analisis de rollos no vistos: el resultado de 0,858 de AUC en PHerc0841 lo hace adecuado como primer modelo a ejecutar sobre rollos nuevos del mismo protocolo, antes de decidir si se necesita un afinado especifico.
- Reentrenamiento y ajuste fino sobre nuevos escaneos: el checkpoint de inicializacion `reader-v2-init-ft12k.pth` junto con `train_config.json` permite reproducir el entrenamiento y adaptar el modelo a protocolos de energia distintos.
- Evaluacion comparativa de modelos de deteccion de tinta: la metodologia publicada (mismos datos, mismas mascaras y misma metrica para todos los modelos) sirve como marco de referencia para medir nuevos candidatos contra Reader v2, Hecate, Nieuwlaar e `ink_9um`.
- Investigacion sobre transferencia entre energias de escaneo: los resultados a 113 keV y 116 keV permiten estudiar como se comporta un modelo afinado en una energia cuando se aplica a otra.

## Benchmarks y rendimiento

Resultados sobre datos retenidos reportados en la model card (misma metrica para todos los modelos):

| Prueba retenida | Reader v2 | `ink_9um` (mejor de 14) | Mejor otro modelo publico |
|---|---|---|---|
| 116 keV PHerc0009B, AUC vs mapa del equipo (4 segmentos) | 0,834 | 0,626 | 0,725 (Hecate) |
| 116 keV PHerc0009B, AUC vs etiquetas humanas | 0,927 | 0,813 | 0,901 (Nieuwlaar) |
| Falsas alarmas sobre papiro en blanco (80% recall de tinta) | 10,4% | 43% | 10,5% (Nieuwlaar) |
| Rollo nunca visto PHerc0841, AUC vs mapa del equipo | 0,858 | 0,708 | 0,848 (Hecate) |
| 113 keV PHerc0139 w047, AUC | 0,893 | 0,778 | 0,898 (Nieuwlaar) |
| Rollo nunca visto PHerc0841, AUC vs etiquetas humanas | 0,824 | 0,733 | 0,855 (Hecate) |

Segun el autor, el modelo queda primero en cuatro de las seis pruebas y segundo en las otras dos, y por delante del checkpoint liberado por el equipo en todas ellas. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K y similares no aplican a este tipo de modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El checkpoint de inferencia ocupa solo 138 MB, por lo que el peso del modelo no es el factor limitante; el consumo real depende del tamano de parche, del solapamiento (`--overlap 0.5` por defecto) y del volumen de entrada.
- GPU recomendadas: no disponibles. No se documentan modelos de GPU probados ni requisitos minimos.
- Encaje en GPU de consumo: no confirmado por el autor. Dado el tamano del checkpoint (138 MB) es plausible que quepa en GPU de consumo, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: el unico camino documentado es el modulo `koine_machines.inference.infer` del repositorio del equipo (rama `merge-ink-pipelines` de villa), con la bandera `--no-compile` en Windows. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, que ademas no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entrada | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reader v2 | Deteccion de tinta volumetrica | Volumen de superficie zarr, protocolo 116 keV | AUC 0,834 (116 keV, vs mapa); 0,858 en PHerc0841 | MIT | HuggingFace `domenicor046/reader-v2` |
| `ink_9um` (scrollprize) | Deteccion de tinta volumetrica | Volumen de superficie zarr | AUC 0,626 (116 keV, vs mapa); 0,708 en PHerc0841 | No indicada en la informacion disponible | Liberado por el equipo del Vesuvius Challenge |
| Hecate | Deteccion de tinta volumetrica | Volumen de superficie zarr | AUC 0,725 en 116 keV; 0,855 en etiquetas humanas de PHerc0841 | No indicada en la informacion disponible | Modelo publico |
| Nieuwlaar | Deteccion de tinta volumetrica | Volumen de superficie zarr | 0,901 en etiquetas humanas de 116 keV; 0,898 en 113 keV PHerc0139 | No indicada en la informacion disponible | Modelo publico |

Reader v2 tiene el mismo formato de checkpoint que `ink_9um` y licencia MIT explicita, lo que facilita su reutilizacion comercial. Frente a Hecate y Nieuwlaar, el patron es de liderazgo claro en 116 keV y en falsos positivos, con derrota ajustada en las dos pruebas basadas en etiquetas humanas de PHerc0841 y en 113 keV PHerc0139.

## Limitaciones y advertencias

- Un unico seed de entrenamiento: no se reporta variabilidad entre ejecuciones, por lo que la robustez estadistica de las cifras no esta caracterizada.
- Los mapas usados como referencia de entrenamiento (teacher) son salidas de modelos obtenidos de escaneos 3,6 veces mas finos, de modo que el modelo hereda los sesgos y errores de esos mapas.
- En PHerc0841 con etiquetas humanas, Hecate supera a Reader v2 (0,855 frente a 0,824); promediar ambos modelos da 0,866 segun el autor, lo que indica complementariedad mas que dominio absoluto.
- En PHerc1447 el modelo muestra una forma compatible con una letra, pero no lineas legibles: no debe presentarse como capacidad de lectura general.
- En 113 keV PHerc0139 w047 queda ligeramente por detras de Nieuwlaar (0,893 frente a 0,898).
- Modelo de dominio muy especifico: no generaliza a vision natural, texto, codigo ni tareas de lenguaje; no dispone de tool calling, agentes ni modo de razonamiento.
- No se documentan idiomas, sesgos sociales ni comportamiento fuera del ambito de papiros carbonizados; el concepto de sesgo multilingue no aplica.
- Riesgo de alucinacion en el sentido de falsos positivos de tinta: aunque la tasa reportada es baja (10,4% sobre papiro en blanco a 80% de recall), sigue existiendo y requiere validacion humana de los mapas producidos.
- La licencia MIT permite uso comercial, pero la model card no incluye informacion sobre las condiciones de los datos de entrenamiento ni sobre los escaneos utilizados.
- Dependencia de un pipeline externo concreto (`koine_machines`, rama `merge-ink-pipelines`): la reproducibilidad depende de la disponibilidad de ese codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/domenicor046/reader-v2
- Repositorio GitHub con codigo, figuras y evaluaciones: https://github.com/DomRusso2/reader-v2
- Checkpoint previo `ink9um-dense`: https://github.com/DomRusso2/ink9um-dense
- Modelo de referencia del equipo: https://huggingface.co/scrollprize/ink_9um
- Figura de portada (comparativa 116 keV): https://raw.githubusercontent.com/DomRusso2/reader-v2/main/figures/banner_116keV.png
- Paper: no disponible en la informacion proporcionada.
- Demo: no disponible en la informacion proporcionada.
- Nota: la busqueda web asociada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
