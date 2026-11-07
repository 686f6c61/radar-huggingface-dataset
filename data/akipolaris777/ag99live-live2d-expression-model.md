# AkiPolaris777/ag99live-live2d-expression-model

## Resumen

AG99 Live2D Expression Model es un adaptador LoRA (PEFT) desarrollado por el usuario AkiPolaris777 para el proyecto AG99live, una capa de representación visual de escritorio que dota a un agente conversacional (AG99) de un cuerpo Live2D animado. El modelo no es un chat generalista: su función es transformar el contexto de diálogo en intenciones de movimiento estructuradas en JSON, que el runtime de AG99live traduce después a parámetros concretos del modelo Live2D y reproduce como una secuencia de gestos, expresiones faciales y movimientos de cabeza y cuerpo.

El adaptador se apoya en el modelo base XHToken/Spark-X2.6-1.7B-Base, un transformer causal de aproximadamente 1.700 millones de parámetros. La versión publicada actualmente, etiquetada como `v7-20261102`, se describe en la model card como un adapter de producción estable y sirve como punto de partida para futuros entrenamientos incrementales sobre el mismo repositorio.

Su relevancia es acotada pero específica: resuelve el problema de mapear lenguaje natural a un protocolo de animación semántico sin necesidad de un modelo grande, y demuestra un patrón de integración LLM-runtime para avatares VTuber. No obstante, el repositorio tiene 0 descargas, 0 likes, tamaño de 0.0 GB y no incluye datasets ni pesos completos verificables, lo que limita seriamente su evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer causal; modelo base XHToken/Spark-X2.6-1.7B-Base |
| Parametros totales | No disponible para el adaptador; el modelo base declara 1.7B en su nombre |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la model card está redactada en chino; el prompt de AG99live no especifica idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de PEFT sobre el modelo base Spark-X2.6-1.7B-Base. La model card no detalla hiperparámetros de entrenamiento (rango, alpha, capas objetivo), número de tokens, composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. El sistema está diseñado para una tarea de generación estructurada: recibe un prompt de AG99live con contexto conversacional y restricciones de salida, y produce un JSON con acción semántica, duración y estructuras `axis_levels` o `motion_steps`.

La versión `v7-20261102` se presenta como un adapter de producción estable y como base para entrenamientos incrementales posteriores, que se acumulan sobre el adapter anterior en lugar de reentrenar desde el modelo base. El repositorio no incluye los datos de entrenamiento originales, registros de chat ni la base de datos de grabación de parámetros VTS, por lo que no es posible auditar la distribución de datos ni reproducir el entrenamiento.

## Capacidades

- Generación de intenciones de movimiento estructuradas en JSON a partir de contexto conversacional.
- Producción de acciones semánticas con duración explícita y ejes de animación (`axis_levels`) o pasos de movimiento (`motion_steps`).
- Mapeo de tono y contenido del diálogo a expresiones faciales, mirada, postura de cabeza y cuerpo.
- Integración con el runtime de AG99live para la reproducción sincronizada de voz, subtítulos, parpadeo y física.
- No es un modelo de chat: no genera respuestas de texto, voz ni controla directamente VTube Studio.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Animación de avatar VTuber en directo: el adaptador recibe el contexto del diálogo de AG99 y emite intenciones de gesto que el runtime reproduce sincronizadas con la voz y los subtítulos, aportando expresividad sin intervención manual.
- Producción de contenido pregrabado: para vídeos o streams, permite generar secuencias de expresiones coherentes con un guion, reduciendo el trabajo de animación manual sobre el modelo Live2D.
- Asistente de escritorio con presencia visual: integrado en AG99live, dota al agente de una "cara" que reacciona al contenido y al tono de sus respuestas, mejorando la percepción de naturalidad en interacciones prolongadas.
- Prototipado de sistemas LLM-runtime para animación: sirve como referencia de arquitectura para proyectos que necesiten separar la generación semántica de movimiento de la capa de renderizado y parámetros.
- Investigación sobre generación de movimiento desde lenguaje natural: útil para estudiar el mapeo entre texto y un vocabulario acotado de ejes de animación, aunque la falta de datos de entrenamiento limita la reproducibilidad.
- Personalización de personajes en pipelines propios: al ser un adaptador PEFT, puede cargarse sobre el modelo base con `transformers` y `peft` y combinarse con prompts propios de AG99live para adaptar el estilo de gestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es de tamaño reducido (repo de 0.0 GB), pero requiere cargar el modelo base de 1.7B parámetros para inferencia.
- VRAM estimada para el modelo base en FP16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, en torno a 2 GB; en 4 bits, alrededor de 1,2 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM o superior debería poder alojar el modelo base en cuantización; para FP16 se recomienda una RTX 3060 12 GB, RTX 4070 o superior.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060 Ti, RTX 4070 y superiores, con cuantización si es necesario.
- Opciones de despliegue: `transformers` + `peft` (método documentado en la model card, con `trust_remote_code=True`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada adaptadores comparables de generación de movimiento Live2D sobre modelos de ~1.7B, ni se dispone de datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de propósito específico: no es un chat generalista y no debe usarse para generación de texto, voz ni control directo de VTube Studio.
- Ausencia de licencia declarada: no se especifican términos de uso comercial, lo que impide asumir permisos de redistribución o explotación en producción.
- Repositorio sin actividad: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- Tamaño de repo de 0.0 GB: no es posible verificar la integridad ni el contenido real de los pesos del adaptador.
- Sin dataset ni registros de entrenamiento publicados: no se puede auditar la distribución de datos, los sesgos ni la calidad del ajuste.
- Sin datos de benchmarks ni de evaluación cualitativa: el rendimiento real es desconocido.
- Dependencia del runtime AG99live: la salida JSON está acoplada al protocolo del proyecto; fuera de él, el adaptador carece de utilidad directa.
- Idiomas y contexto no documentados: se desconoce el soporte multilingüe y la ventana de contexto efectiva.
- Riesgo de alucinación en la estructura de salida: al ser un modelo generativo, puede emitir JSON malformado o ejes fuera de rango; el runtime debe validar y limitar los valores, como indica la propia model card.

## Enlaces

- Hugging Face: https://huggingface.co/AkiPolaris777/ag99live-live2d-expression-model
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B-Base
- Repositorio AG99live en GitHub: https://github.com/murphys7017/AG99live
- README de AG99live: https://github.com/murphys7017/AG99live/blob/main/README.md
