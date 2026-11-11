# RandamGT/Qwen3.5-27B-heretic-Q4_K_M-GGUF

## Resumen

RandamGT/Qwen3.5-27B-heretic-Q4_K_M-GGUF es una cuantizacion en formato GGUF del modelo coder3101/Qwen3.5-27B-heretic, un derivado de la familia Qwen3.5 de 27B de parametros al que se le ha aplicado una tecnica de "abliteration" (eliminacion de la capa de rechazo, tambien llamada decensoring o uncensoring). El resultado es un modelo conversacional y multimodal (pipeline image-text-to-text) que conserva la arquitectura del original pero con las restricciones de alineacion relajadas. El autor de esta ficha, RandamGT, unicamente ha realizado la conversion a GGUF mediante el espacio GGUF-my-repo de ggml.ai, apoyandose en llama.cpp.

El interes practico de esta publicacion es la disponibilidad del modelo en cuantizacion Q4_K_M, un formato de 4 bits que reduce el peso en disco a aproximadamente 16,5 GB, lo que lo hace desplegable en GPU de consumo de gama alta (24 GB de VRAM) y en equipos Apple Silicon con memoria unificada suficiente. El modelo base tiene 26.895.998.464 parametros segun los safetensors del repositorio original, lo que confirma una talla cercana a los 27B nominales.

La relevancia de esta ficha es doble: por un lado documenta una variante sin censura de un modelo multimodal de tamano medio, util para investigacion sobre alineacion y robustez; por otro, advierte de que se trata de un derivado no oficial, sin model card tecnica propia, sin benchmarks publicados y con implicaciones eticas y legales que el usuario debe evaluar antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5-27B; transformer multimodal segun el pipeline image-text-to-text) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama-server usa -c 2048, pero no define el maximo del modelo) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repo) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 16,5 GB); el modelo base se distribuye en safetensors |
| Pipeline | image-text-to-text |
| Modelo base | coder3101/Qwen3.5-27B-heretic |
| Herramienta de conversion | llama.cpp / GGUF-my-repo (ggml.ai) |
| Tamano del repositorio | 16,5 GB |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura interna en la documentacion proporcionada. El pipeline declarado (image-text-to-text) y la etiqueta base_model indican que el modelo original Qwen3.5-27B es multimodal, capaz de procesar imagenes y texto, y que esta variante hereda esa capacidad. El tag "abliterated" sugiere que el modelo base coder3101/Qwen3.5-27B-heretic fue sometido a un proceso de abliteration, una tecnica que identifica la direccion del espacio de activaciones asociada al rechazo de peticiones y la proyecta fuera, reduciendo la tendencia del modelo a negarse a responder. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO adicionales sobre el modelo heretic.

La unica innovacion tecnica documentada en esta publicacion es la conversion a GGUF mediante llama.cpp, que permite ejecutar el modelo en CPU, GPU y Apple Silicon con cuantizacion de 4 bits (Q4_K_M). No se han publicado detalles sobre decodificacion especulativa, atencion lineal ni otras optimizaciones especificas de esta variante.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag "conversational" y el pipeline declarado.
- Procesamiento de imagen y texto (image-text-to-text), heredado del modelo base multimodal.
- Respuestas sin las restricciones de rechazo tipicas de los modelos alineados, gracias a la abliteration aplicada en el modelo heretic.
- Compatibilidad con llama.cpp (CLI y servidor) y con el formato GGUF, lo que facilita su integracion en herramientas como Ollama, LM Studio o servidores compatibles con la API de llama.cpp.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio especificos: no disponibles mas alla del pipeline image-text-to-text.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como varia la tasa de rechazo y la calidad de respuesta tras aplicar abliteration, comparandolo con el Qwen3.5-27B original en tareas de evaluacion de robustez.
- Despliegue local en estaciones de trabajo con GPU de 24 GB: la cuantizacion Q4_K_M (16,5 GB) permite ejecutar el modelo en una RTX 4090 o similar usando llama-server, sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales sin filtros editoriales: util para generar dialogos sinteticos en dominios donde los modelos alineados rechazan peticiones (ficcion, roleplay, escenarios controvertidos) y se necesita material de entrenamiento o evaluacion.
- Analisis de imagenes con descripcion libre: al ser image-text-to-text, puede emplearse para generar descripciones detalladas de imagenes en pipelines de etiquetado o accesibilidad, con la advertencia de que la ausencia de alineacion puede producir contenido inapropiado.
- Experimentacion con cuantizacion y comparativa de calidad: el formato GGUF y la talla de 27B permiten medir la degradacion de calidad entre Q4_K_M y precisiones mayores en tareas de generacion y comprension multimodal.
- Educacion y divulgacion tecnica: sirve como ejemplo practico de conversion GGUF con GGUF-my-repo y de despliegue con llama.cpp, documentado en la propia model card con comandos de CLI y servidor.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o narrativa donde el autor necesita un modelo que no imponga filtros de contenido, asumiendo la responsabilidad editorial del resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 16,5 GB de pesos, mas overhead de contexto y cache KV; se recomienda un minimo de 20-24 GB de VRAM para contexto moderado.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB, L40S 48 GB. En GPUs de 16 GB no cabe la cuantizacion Q4_K_M completa sin offloading a CPU.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y modelos con 24 GB o mas. En Apple Silicon, requiere al menos 24-32 GB de memoria unificada.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) segun la model card; tambien es compatible con frontends que acepten GGUF como Ollama o LM Studio, aunque no se documentan explicitamente en la informacion proporcionada. vLLM y TGI no estan confirmados para este formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| RandamGT/Qwen3.5-27B-heretic-Q4_K_M-GGUF | 26,9B | no disponible | GGUF Q4_K_M | Apache 2.0 | Variante abliterated multimodal, sin benchmarks publicados |
| coder3101/Qwen3.5-27B-heretic | 26,9B | no disponible | safetensors | Apache 2.0 | Modelo base del que deriva esta cuantizacion |
| Qwen3.5-27B (original) | 26,9B | no disponible | safetensors | Apache 2.0 | Modelo alineado de referencia; no disponible en la informacion proporcionada el enlace exacto |
| Otros modelos abliterated de ~27B | no disponible | no disponible | GGUF / safetensors | variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina o reduce los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido ofensivo, ilegal, peligroso o sexualmente explicito. No es apto para aplicaciones dirigidas al publico general sin filtros adicionales.
- Riesgo elevado de alucinacion: no se han publicado evaluaciones de fidelidad ni de calibracion para esta variante.
- No hay model card tecnica propia ni benchmarks: se desconoce el impacto real de la abliteration en razonamiento, codigo y matematicas respecto al Qwen3.5-27B original.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue equivalente al del modelo base.
- Longitud de contexto no especificada; el ejemplo de llama-server con -c 2048 no debe interpretarse como el maximo del modelo.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado y del cumplimiento normativo (por ejemplo, en la UE, el AI Act).
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo en safetensors; no se ha medido su impacto en tareas multimodales.
- El repositorio depende de un modelo base de terceros (coder3101) que a su vez modifica Qwen3.5; la cadena de procedencia y los terminos exactos deben verificarse antes de un despliegue en produccion.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/RandamGT/Qwen3.5-27B-heretic-Q4_K_M-GGUF
- Modelo base heretic: https://huggingface.co/coder3101/Qwen3.5-27B-heretic
- Modelo Qwen3.5-27B original (referencia de licencia): https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia Apache 2.0 del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
