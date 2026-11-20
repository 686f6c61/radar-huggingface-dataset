# hotmemeh/XORTRON.CriminalComputing.LARGE.2026.3

## Resumen

XORTRON.CriminalComputing.LARGE.2026.3 es un ajuste fino del modelo denso Mistral-Large-Instruct-2411 (123B parametros) publicado por el usuario hotmemeh en Hugging Face. Se trata de una version "abliterated" o "decensored" generada con la herramienta Heretic v1.2.0, cuyo objetivo es eliminar los mecanismos de rechazo (refusals) del modelo original mediante la proyeccion del vector de direccion de rechazo en las capas de atencion y MLP. El resultado es un modelo que conserva la arquitectura y el conocimiento del original pero responde a practicamente cualquier peticion sin negativas.

El modelo hereda las capacidades del Mistral-Large-Instruct-2411: razonamiento avanzado, generacion de codigo en mas de 80 lenguajes, soporte nativo de function calling y JSON, y una ventana de contexto de 128.000 tokens. La intervencion de abliteration reportada por el autor reduce los rechazos de 87/100 a 2/100 en su propia evaluacion, con una divergencia KL de 0,0578 respecto al modelo base, lo que indica una degradacion moderada pero no despreciable de la distribucion original.

La relevancia de esta ficha radica en documentar con rigor un caso de modelo "uncensored" de gran tamano: es util para investigacion sobre alineamiento y seguridad, pero presenta riesgos importantes para produccion (contenido danino, cumplimiento normativo) y una licencia WTFPL que no aclara las restricciones de la licencia original de Mistral. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 245,2 GB en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), basado en Mistral-Large-Instruct-2411 |
| Parametros totales | 122.610.069.504 (~122,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; el modelo base admite cuantizacion estandar, pero no se detalla) |
| Idiomas soportados | en, fr, de, es, it, pt, zh, ja, ru, ko (segun tags; el modelo base declara ademas neerlandes y polaco) |
| Licencia | WTFPL (el modelo base original usa Mistral Research License, solo no comercial) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del Mistral-Large-Instruct-2411: un transformer denso decoder-only de aproximadamente 123B parametros, sin mezcla de expertos, con atencion estandar y ventana de contexto de 128k tokens. El modelo base fue entrenado por Mistral AI con enfasis en razonamiento, conocimiento, codigo (mas de 80 lenguajes de programacion), capacidades agenticas con function calling nativo y salida JSON, y adherencia a system prompts. No se dispone de datos sobre el numero exacto de tokens de entrenamiento ni la composicion del dataset del modelo base en la informacion proporcionada.

La innovacion tecnica de este ajuste es la abliteration aplicada con Heretic v1.2.0. Segun los parametros publicados, se identifico una direccion de rechazo en el indice 37,86 y se aplicaron pesos de intervencion sobre las proyecciones `attn.o_proj` (max_weight 1,27 en posicion 64,44; min_weight 1,26 a distancia 47,53) y `mlp.down_proj` (max_weight 1,44 en posicion 61,73; min_weight 1,38 a distancia 46,10). El autor reporta una divergencia KL de 0,0578 frente al original y una reduccion de rechazos de 87/100 a 2/100. No se documenta un proceso de RLHF o DPO adicional tras la abliteration, ni datos de entrenamiento propios de este ajuste.

## Capacidades

- Generacion de texto conversacional multi-turno en diez idiomas declarados (ingles, frances, aleman, espanol, italiano, portugues, chino, japones, ruso y coreano).
- Razonamiento avanzado y matematicas, heredado del modelo base Mistral-Large-Instruct-2411.
- Generacion de codigo en mas de 80 lenguajes de programacion (Python, Java, C, C++, JavaScript, Bash, Swift, Fortran, etc.).
- Function calling nativo y salida estructurada en JSON, orientado a flujos agenticos.
- Capacidades agenticas y razonamiento multi-paso, con soporte de system prompts robusto.
- Adherencia a contexto largo para RAG (ventana de 128k tokens).
- Respuesta sin rechazos: el ajuste elimina practicamente los mecanismos de negativa (2/100 en la evaluacion del autor).
- No se declara soporte de vision, audio ni modo "thinking" explicito en la informacion disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la abliteration altera la distribucion de respuestas (KL 0,0578) y que tipos de contenido se desbloquean, en entornos controlados de laboratorio.
- Generacion de codigo en produccion: puede integrarse en pipelines de CI/CD para autocompletar, revisar y refactorizar codigo en mas de 80 lenguajes, aprovechando su soporte de function calling para invocar herramientas de build o test.
- Asistentes conversacionales multi-turno: su ventana de 128k tokens y su adherencia a system prompts permiten mantener conversaciones largas con contexto persistente en diez idiomas.
- RAG sobre documentacion extensa: la ventana de contexto y la adherencia al contexto del modelo base lo hacen adecuado para responder preguntas sobre corpus grandes, aunque la abliteration puede aumentar el riesgo de respuestas no fundamentadas.
- Redaccion creativa sin restricciones: util para generar ficcion, guiones o contenido editorial donde el modelo original rechazaria tematicas sensibles, siempre con revision humana.
- Extraccion estructurada de datos: la salida JSON nativa permite convertir texto no estructurado en esquemas definidos para ingestion en bases de datos o APIs.
- Evaluacion de robustez de filtros: puede emplearse como generador adversarial para probar clasificadores de contenido y sistemas de moderacion.

## Benchmarks y rendimiento

| Metrica | Este modelo | Mistral-Large-Instruct-2411 |
|---|---|---|
| Divergencia KL | 0,0578 | 0 (por definicion) |
| Rechazos | 2/100 | 87/100 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento son los de la evaluacion de abliteration del autor (divergencia KL y tasa de rechazos).

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): superior a 245 GB, coherente con los 122,6B parametros y el tamano de repo de 245,2 GB. El modelo base indica que requiere mas de 300 GB de GPU RAM en vLLM.
- GPU recomendadas: configuraciones multi-GPU de clase datacenter, como 8x A100 80GB o 8x H100 80GB, con tensor parallelism (el ejemplo del modelo base usa `--tensor_parallel_size 8`).
- No cabe en GPU de consumo (RTX 4090, 24 GB) en precision completa; requeriria cuantizacion agresiva (4-bit) y aun asi excederia la VRAM de una sola tarjeta consumer.
- Opciones de despliegue: vLLM (recomendado por el modelo base, version >= 0.6.4.post1 con mistral_common >= 1.5.0), transformers, text-generation-inference (segun tags). No se documenta soporte explicito de llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| XORTRON.CriminalComputing.LARGE.2026.3 | ~122,6B | 128k | WTFPL | Abliterated; 2/100 rechazos; KL 0,0578 |
| mistralai/Mistral-Large-Instruct-2411 | ~123B | 128k | Mistral Research License (no comercial) | Original alineado; 87/100 rechazos |
| mistralai/Mistral-Large-Instruct-2407 | ~123B | 128k | Mistral Research License (no comercial) | Version anterior del base, menor soporte de contexto largo y function calling |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina los rechazos de forma deliberada: el modelo puede generar contenido danino, ilegal o eticamente problematico sin filtros, lo que lo hace inadecuado para aplicaciones de cara al publico sin moderacion externa.
- La divergencia KL de 0,0578 indica una alteracion medible de la distribucion original; puede degradar la calidad en tareas que dependian de las respuestas rechazadas o de matices de seguridad.
- Riesgo elevado de alucinacion en contextos donde el modelo original se negaba o matizaba; no se han publicado evaluaciones de fidelidad factual.
- La licencia WTFPL del ajuste no aclara la relacion con la Mistral Research License del modelo base, que restringe el uso a fines no comerciales; el uso comercial es juridicamente dudoso.
- El repositorio presenta 0 descargas y 0 likes, sin validacion de la comunidad ni revision independiente de los parametros de abliteration reportados.
- No se documentan sesgos especificos ni evaluaciones de seguridad del ajuste; los sesgos del modelo base persisten y pueden amplificarse.
- El soporte de idiomas se limita a los diez declarados en los tags; no se garantiza calidad en otros idiomas.
- Requiere infraestructura multi-GPU de clase datacenter (mas de 300 GB de VRAM en BF16), lo que limita su despliegue a entornos con recursos significativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hotmemeh/XORTRON.CriminalComputing.LARGE.2026.3
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-Instruct-2411
- Version anterior del base: https://huggingface.co/mistralai/Mistral-Large-Instruct-2407
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- mistral-common: https://github.com/mistralai/mistral-common
- vLLM: https://github.com/vllm-project/vllm
- Release de vLLM >= 0.6.4.post1: https://github.com/vllm-project/vllm/releases/tag/v0.6.4.post1
- Release de mistral_common >= 1.5.0: https://github.com/mistralai/mistral-common/releases/tag/v1.5.0
- Docker image de vLLM: https://github.com/vllm-project/vllm/blob/main/Dockerfile
