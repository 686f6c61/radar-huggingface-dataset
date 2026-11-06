# 3dlg-hcvc/LightgenBench-baselines

## Resumen

LightGenBench-baselines es un repositorio de checkpoints publicado por el grupo 3DLG-HCVC que agrupa los pesos y las configuraciones de entrenamiento de las cuatro lineas base del benchmark LightGenBench, orientado a la generacion de emision en activos 3D. No se trata de un unico modelo generativo de lenguaje, sino de un contenedor de cuatro modelos independientes (TEXGen-Emission, TRELLIS.2-Emission, SegviGen-Emission y Hunyuan3D-Emission), cada uno derivado de un modelo base de generacion 3D al que se ha adaptado para predecir emision luminosa sobre geometria y textura.

El repositorio esta pensado para reproducir los resultados del articulo LightGenBench (arXiv:2610.39038) y para servir de punto de partida a quien quiera evaluar o entrenar variantes sobre la misma tarea. Su relevancia es acotada: es material de investigacion en vision y graficos 3D, no un modelo de proposito general. El tamano total del repositorio es de 27,4 GB, distribuido en cuatro carpetas con pesos y configuracion de entrenamiento.

La licencia es "other" con la etiqueta per-folder, lo que significa que cada carpeta tiene su propio archivo LICENSE.md y que las condiciones de uso pueden diferir entre los cuatro checkpoints. No se dispone de informacion sobre arquitectura, numero de parametros, contexto ni idiomas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (cuatro checkpoints independientes derivados de modelos de generacion 3D) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other, con licencia por carpeta (per-folder); cada carpeta incluye su propio LICENSE.md |
| Formato de pesos | no disponible (el repositorio contiene pesos y configuracion de entrenamiento por carpeta) |
| Tamano del repositorio | 27,4 GB |
| Pipeline declarado | no disponible |
| Dataset asociado | 3dlg-hcvc/LightgenBench |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de ninguno de los cuatro checkpoints. Lo que si indica es que cada carpeta corresponde a una linea base construida sobre un modelo distinto: TEXGen-Emission parte de TEXGen, TRELLIS.2-Emission de TRELLIS.2, SegviGen-Emission de SegviGen y Hunyuan3D-Emission de Hunyuan3D. Cada carpeta incluye los pesos y la configuracion de entrenamiento utilizada para adaptar el modelo base a la tarea de emision.

No se proporcionan datos sobre el numero de tokens o de muestras 3D empleadas en el entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste fino supervisado, RLHF o DPO. El unico dato de entrenamiento implicito es la existencia de un dataset propio, 3dlg-hcvc/LightgenBench, referenciado en los metadatos y en el articulo, pero su contenido y tamano no se detallan en la informacion disponible.

## Capacidades

- Generacion de emision luminosa sobre activos 3D: es la tarea central del benchmark y de las cuatro lineas base.
- Adaptacion de modelos base de generacion 3D (TEXGen, TRELLIS.2, SegviGen, Hunyuan3D) a una nueva salida de emision.
- Reproduccion de resultados de investigacion: los checkpoints permiten replicar las cifras del articulo LightGenBench.
- Descarga selectiva por carpeta mediante `hf download --include`, lo que facilita trabajar con una sola linea base.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni multilingue.

## Casos de uso

- Reproduccion de experimentos del benchmark: descargar cada carpeta en `checkpoints/` y ejecutar el codigo del repositorio de GitHub correspondiente para obtener las mismas metricas publicadas en el articulo.
- Comparacion de lineas base: al reunir los cuatro modelos en un mismo repositorio, permite evaluar de forma homogenea TEXGen, TRELLIS.2, SegviGen y Hunyuan3D sobre la misma tarea de emision.
- Punto de partida para ajuste fino: las configuraciones de entrenamiento incluidas sirven como referencia para entrenar variantes sobre el dataset LightgenBench.
- Investigacion en graficos por computador: estudio de la prediccion de propiedades de emision en mallas y texturas 3D, util en sintesis de escenas e iluminacion.
- Desarrollo de pipelines de renderizado asistido: usar la salida de emision de uno de los modelos como entrada para motores de renderizado que necesiten mapas de emision.
- Evaluacion de modelos base de generacion 3D: medir como se comporta cada arquitectura subyacente cuando se la especializa en una tarea concreta, aislando el efecto del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente remite al articulo arXiv:2610.39038 para consultar las cifras, pero no las reproduce.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano total del repositorio (27,4 GB) incluye los cuatro checkpoints, no el consumo de un unico modelo en ejecucion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el flujo previsto es descargar los pesos y usar los repositorios de GitHub de cada linea base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LightGenBench-baselines (este repo) | Conjunto de 4 checkpoints de generacion de emision 3D | no disponible | no disponible | other, por carpeta | Hugging Face, 0 descargas |
| TEXGen-Emission | Linea base sobre TEXGen | no disponible | no disponible | definida en su carpeta | Incluida en este repo |
| TRELLIS.2-Emission | Linea base sobre TRELLIS.2 | no disponible | no disponible | definida en su carpeta | Incluida en este repo |
| Hunyuan3D-Emission | Linea base sobre Hunyuan3D | no disponible | no disponible | definida en su carpeta | Incluida en este repo |

No se dispone de datos de rendimiento ni de especificaciones tecnicas de los modelos base como para establecer una comparativa cuantitativa con alternativas externas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con criterios de MMLU, HumanEval o GSM8K ni usarse para tareas de texto.
- La licencia es heterogenea: cada carpeta tiene su propio LICENSE.md y las condiciones para uso comercial pueden variar entre las cuatro lineas base. Es obligatorio revisar la licencia de la carpeta concreta antes de cualquier uso en produccion.
- Ausencia total de especificaciones: no hay datos publicos de parametros, contexto, cuantizacion ni idiomas, lo que dificulta planificar el despliegue.
- Riesgo de sobreajuste al benchmark: al ser checkpoints entrenados para LightGenBench, su generalizacion a otras tareas de emision 3D no esta documentada.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa.
- Fecha de creacion y actualizacion poco habituales (2026), coherente con un articulo preprint; conviene verificar la vigencia del repositorio antes de depender de el.
- No se documentan sesgos; en el contexto de generacion 3D, el riesgo principal es la calidad y representatividad del dataset LightgenBench, no disponible en detalle.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/3dlg-hcvc/LightgenBench-baselines
- Dataset asociado: https://huggingface.co/datasets/3dlg-hcvc/LightgenBench
- Codigo del benchmark: https://github.com/3dlg-hcvc/lightgenbench
- TEXGen-Emission: https://github.com/dongchen-yang/TEXGen-Emission
- TRELLIS.2-Emission: https://github.com/3dlg-hcvc/TRELLIS.2-Emission
- SegviGen-Emission: https://github.com/3dlg-hcvc/SegviGen-Emission
- Hunyuan3D-Emission: https://github.com/dongchen-yang/Hunyuan3D-Emission
- Articulo: arXiv:2610.39038, "LightGenBench: A Benchmark for 3D Emission Generation" (Yang, Yan, Savva, 2026)
