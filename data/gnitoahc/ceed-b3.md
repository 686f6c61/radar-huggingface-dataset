# gnitoahc/ceed-b3

## Resumen

CEED B3 es un modelo de visión-lenguaje (VLM) desarrollado por gnitoahc (Chao-Ting, Chen) como parte del estudio CEED (Causal Expert–Evidence Distillation). Se trata de un fine-tune LoRA del modelo base `google/gemma-4-e4b-it` (un transformer multimodal denso de aproximadamente 4 mil millones de parámetros activos), al que se le ha aplicado una técnica de destilación de conocimiento con proyección de estados ocultos en tres capas mapeadas, usando como profesor el modelo MoE `google/gemma-4-26b-a4b-it`. El checkpoint resultante tiene 7.941.100.874 parámetros totales y está pensado para tareas de respuesta a preguntas visuales (VQA) sobre documentos, gráficos e imágenes naturales.

El modelo se publica como artefacto de investigación para reproducibilidad, no como producto listo para producción. El adaptador LoRA se ha fusionado en los pesos base, por lo que se carga directamente con Transformers sin necesidad de PEFT ni código adicional. Está entrenado exclusivamente en inglés y su licencia es la de Gemma. La relevancia de este modelo reside en su metodología: explora si la destilación de evidencia causal desde un profesor MoE puede transferirse a un alumno denso mediante un adaptador de rango bajo, aunque los resultados publicados indican que la ganancia de destilación no se ha establecido frente al control sin profesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en `google/gemma-4-e4b-it`) |
| Parametros totales | 7.941.100.874 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado (pesos en safetensors, compatible con cuantizacion posterior) |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e4b-it`, un VLM denso de la familia Gemma 4 con procesador de imágenes integrado. Sobre esta base se ha entrenado un adaptador LoRA de rango 4 (rank 4) con un objetivo combinado: la funcion de perdida de entropia cruzada estandar (CE) y un termino de destilacion por proyeccion de estados ocultos (hidden-state projection distillation) en tres capas mapeadas, tomando como profesor el modelo MoE `google/gemma-4-26b-a4b-it`. El adaptador se ha fusionado posteriormente en los pesos base, de modo que el checkpoint resultante es autonomo y no requiere codigo PEFT.

El corpus de entrenamiento combina tres conjuntos de datos de VQA: ChartQA (2.500 ejemplos), DocVQA (5.349) y GQA (10.000), sumando 17.849 ejemplos en total, con una division 80/10/10 por identificador de ejemplo. Se realizaron 2,69 pasadas sobre el conjunto de entrenamiento. La entropia cruzada final fue de 0,9126 y el termino de destilacion final de 2,4891. La semilla utilizada fue 0 y la identidad de ejecucion se registra como `51223b3cbed5ef07221c2dabd183a1a706ed42e0fd24595c2d87ffd9b80342fe`. No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente supervisado con destilacion.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre documentos, graficos e imagenes naturales.
- Generacion de respuestas cortas en formato de instruccion (short-answer instruction) para tareas de VQA.
- Razonamiento visual basico sobre contenido textual en imagenes, tablas y graficos.
- Capacidad multilingue limitada al ingles (entrenado solo en ingles).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking mode) ni capacidades de audio o video.

## Casos de uso

- Extraccion de informacion de documentos escaneados: el modelo puede responder preguntas concretas sobre el contenido de facturas, formularios o paginas escaneadas, gracias a su entrenamiento en DocVQA. Es adecuado para prototipos de automatizacion de procesos documentales, aunque su rendimiento en produccion no esta garantizado.
- Analisis de graficos y tablas: entrenado con ChartQA, puede interpretar graficos de barras, lineas o circulares y responder preguntas sobre valores, tendencias o comparaciones. Util para dashboards de inteligencia de negocio en fase experimental.
- Preguntas sobre imagenes naturales: con GQA, el modelo puede responder sobre objetos, relaciones y atributos en fotografias. Sirve para sistemas de busqueda visual o asistentes de accesibilidad.
- Evaluacion de tecnicas de destilacion de conocimiento: como artefacto de investigacion, permite reproducir y comparar el efecto de la destilacion con proyeccion de estados ocultos frente a un control sin profesor (CEED B1). Es util para investigadores que estudian transferencia de conocimiento entre modelos MoE y densos.
- Benchmarking de adaptadores LoRA en VLM: el checkpoint sirve para medir hasta que punto un adaptador de rango 4 puede capturar la senal de destilacion, informando sobre los limites de la eficiencia parametrica en fine-tuning.
- Desarrollo de pipelines de VQA con Transformers: al cargarse directamente con `AutoModelForImageTextToText`, puede integrarse en flujos de trabajo existentes de Hugging Face para experimentar con prompts de respuesta corta y decodificacion greedy.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados, obtenidos con el harness propio de CEED (`ceed-direct-1`), decodificacion greedy y sobre el split de validacion del 10% de CEED. **Estos numeros no son comparables con los leaderboards publicos de DocVQA, GQA o ChartQA** debido a diferencias en splits, prompt y decodificacion. Solo son significativos frente a otros grupos CEED evaluados de forma identica.

| Dataset | Metrica | Puntuacion | n |
|---|---|---|---|
| DocVQA | ANLS | 0,8501 | 565 |
| GQA | Exact match | 0,6289 | 1016 |
| ChartQA | Relaxed accuracy | 0,5341 | 249 |

Ademas, la model card indica que el control sin profesor (CEED B1), entrenado de forma identica pero con `kd_weight: 0`, obtuvo puntuaciones superiores en todos los datasets: DocVQA 0,8798, GQA 0,6959 y ChartQA 0,7871. Esto sugiere que la destilacion no aporta una ventaja observable frente al fine-tuning supervisado en este escenario.

## Requisitos de hardware

- No se proporcionan datos oficiales de VRAM, latencia ni throughput en la informacion disponible.
- Con 7.941.100.874 parametros en precision FP16, el modelo ocupa aproximadamente 15,9 GB en disco. Para inferencia en FP16 se estima un consumo de VRAM de al menos 16 GB, lo que requiere GPUs como RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB).
- Con cuantizacion a 4 bits (por ejemplo, mediante bitsandbytes o GPTQ), el modelo podria caber en GPUs consumer de 8-12 GB, aunque no se ha verificado oficialmente.
- Opciones de despliegue compatibles: Transformers con `AutoModelForImageTextToText`, y potencialmente vLLM, TGI u Ollama si se convierte a los formatos adecuados (GGUF, etc.), aunque no se documenta soporte explicito.
- Dado que es un artefacto de investigacion, no se recomienda su uso en entornos de produccion sin una evaluacion adicional de rendimiento y latencia.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (VLM densos de ~8B entrenados con destilacion). La propia model card compara implicitamente con el control CEED B1 (mismo modelo sin destilacion) y con el profesor `google/gemma-4-26b-a4b-it`, pero estos no son alternativas directas en cuanto a tamano o tarea. Por tanto, la comparativa con modelos similares se considera no disponible.

## Limitaciones y advertencias

- **Resultado LoRA**: el adaptador de rango 4 se ha fusionado en los pesos, pero esto no convierte un adaptador pequeno en un fine-tune completo. La capacidad del adaptador puede ser insuficiente para capturar la senal de destilacion, como advierte el propio estudio (ADR-0005).
- **Ganancia de destilacion no establecida**: el control sin profesor (CEED B1) supera a este checkpoint en todos los datasets evaluados. Cualquier comparacion debe tener en cuenta que la destilacion no demuestra ventaja frente al fine-tuning supervisado.
- **Alcance limitado**: entrenado solo en ingles y en tres dominios de VQA (documentos, graficos e imagenes naturales). El comportamiento fuera de estos dominios no esta probado.
- **Sesgos y alucinaciones**: hereda las limitaciones del modelo base `gemma-4-e4b-it`, incluyendo posibles sesgos en el lenguaje y riesgo de alucinacion en respuestas visuales.
- **Restricciones de licencia**: la licencia Gemma impone condiciones de uso comercial que deben revisarse antes de cualquier despliegue.
- **No es un producto**: se publica como artefacto de investigacion para reproducibilidad; no se garantiza su robustez en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gnitoahc/ceed-b3
- Repositorio GitHub del estudio CEED: https://github.com/GNITOAHC/ceed
- Documento de especificaciones CEED: https://github.com/GNITOAHC/ceed/blob/main/ceed.md
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Modelo profesor: https://huggingface.co/google/gemma-4-26b-a4b-it
- Checkpoint relacionado (CEED B2): https://huggingface.co/gnitoahc/ceed-b2-gemma4-e4b-it-0802
