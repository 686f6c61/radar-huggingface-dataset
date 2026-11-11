# onemira/community-1-diarization-coreml

## Resumen

`onemira/community-1-diarization-coreml` es un repositorio de artefactos Core ML para diarización de hablantes (speaker diarization), publicado por OneMira AI. No se trata de un modelo de lenguaje ni de un modelo entrenado desde cero, sino de un espejo ("pinned, byte-preserving mirror") de los activos convertidos a Core ML que utiliza el worker offline de etiquetado de hablantes de OneMira. La conversión original procede de `FluidInference/speaker-diarization-coreml`, que a su vez deriva de los modelos `pyannote/speaker-diarization-community-1` de la comunidad pyannote, bajo licencia CC BY 4.0.

El propósito del repositorio es servir de referencia reproducible de los pesos convertidos a Core ML (formato nativo de Apple para inferencia en dispositivos macOS/iOS) empleados en el producto OneMira C1, una grabadora de voz con procesamiento local. La model card indica explícitamente que "no weight training or model upgrade is included": es decir, no hay entrenamiento ni mejora de modelo, solo conversión de formato y preservación de la semántica de normalización L2 y centrado PLDA del pipeline original.

La relevancia es acotada: resulta útil para desarrolladores que quieran replicar el pipeline de diarización en dispositivos Apple con Core ML, o para auditar la procedencia de los artefactos usados por OneMira. No es un modelo generativo, no soporta texto ni tool calling, y su pipeline en Hugging Face no está declarado. El tamaño del repositorio aparece como 0.0 GB, lo que sugiere que los artefactos binarios podrían no estar alojados en el repo o que la métrica no está actualizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de diarización de hablantes (segmentación + embeddings) convertido a Core ML; basado en pyannote community-1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (artefactos Core ML, posiblemente FP16/FP32; no especificado) |
| Idiomas soportados | no disponible (la diarización es independiente del idioma en gran medida, pero no se declara) |
| Licencia | cc-by-4.0 |
| Formato de pesos | Core ML (`.mlmodel`/`.mlpackage`); el repo declara espejo byte-preserving de artefactos Core ML |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado por OneMira. Aloja los artefactos Core ML resultantes de la conversión de los modelos de diarización de pyannote (`pyannote/speaker-diarization-community-1`), realizada por FluidInference en la revisión `1ed7a662fdc7109e36d822db793ee6eebdaf8594`. La model card indica que el grafo de embeddings convertido expone características crudas antes de la normalización L2, de modo que OneMira puede preservar la semántica de centrado PLDA del pipeline original. No se especifican datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF/DPO, porque no se trata de un modelo de lenguaje y no se aporta esa información.

La innovación técnica declarada es la preservación de la semántica upstream (normalización L2 y centrado PLDA) durante la conversión a Core ML, junto con la inclusión de `SOURCE.json` (procedencia y SHA-256 de cada artefacto) y `NOTICE.txt` (atribuciones y aviso Apache-2.0 para el pipeline nativo FluidAudio). La propia model card advierte que la conversión histórica tiene limitaciones de procedencia descritas por FluidInference y que este espejo no afirma una conversión upstream reproducible.

## Capacidades

- Diarización de hablantes: separación y etiquetado de hablantes en audio, orientada a reuniones y llamadas.
- Ejecución local en dispositivos Apple mediante Core ML (sin servicio en la nube).
- Exposición de embeddings crudos antes de normalización L2 para preservar el centrado PLDA upstream.
- Integración con el pipeline nativo FluidAudio (aviso Apache-2.0 incluido).
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no declaradas.
- No incluye modo thinking, visión ni audio generativo.

## Casos de uso

- Etiquetado de hablantes en grabaciones de reuniones: el pipeline Core ML permite asignar cada segmento de audio a un hablante concreto en local, sin subir el audio a la nube, lo que encaja con el producto OneMira C1.
- Transcripción con atribución de hablante en dispositivos Apple: combinado con un motor ASR local, el modelo aporta la capa de diarización para producir transcripciones tipo "Hablante 1: ...".
- Auditoría de procedencia de artefactos: `SOURCE.json` y `NOTICE.txt` permiten verificar hashes SHA-256 y atribuciones de licencia antes de desplegar los pesos en producción.
- Replicación del pipeline en macOS/iOS: desarrolladores que quieran reproducir la conversión Core ML de pyannote community-1 pueden usar este espejo como referencia de artefactos.
- Procesamiento offline de llamadas de atención al cliente: la diarización local permite separar agente y cliente sin depender de servicios cloud ni de cuotas mensuales.
- Investigación sobre conversión Core ML de modelos de audio: sirve como caso de estudio de conversión de un pipeline de diarización (segmentación + embeddings) a Core ML preservando semántica PLDA.
- Integración vía MCP: el ecosistema OneMira expone un servidor MCP (`onemira-mcp`) que podría consumir estas etiquetas de hablante desde clientes como Claude Desktop o Cursor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible (artefactos Core ML para Apple Silicon / Neural Engine; no se especifican requisitos de memoria).
- GPU recomendadas: no aplica en el sentido CUDA; el formato Core ML está pensado para Apple Silicon (M-series) y Neural Engine.
- ¿Cabe en consumer GPU? No aplica: no es un modelo CUDA/ROCm; está orientado a hardware Apple.
- Opciones de despliegue: Core ML (framework nativo de Apple), pipeline FluidAudio; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Formato | Contexto / audio | Notas |
|---|---|---|---|---|---|
| onemira/community-1-diarization-coreml | Diarización (Core ML) | CC BY 4.0 | Core ML | no disponible | Espejo de artefactos para Apple; sin benchmarks |
| pyannote/speaker-diarization-community-1 | Diarización | CC BY 4.0 | PyTorch (upstream) | no disponible | Modelo original del que deriva la conversión |
| FluidInference/speaker-diarization-coreml | Diarización (Core ML) | no disponible en la información | Core ML | no disponible | Conversión original referenciada por OneMira |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling; no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- La model card advierte que la conversión histórica tiene limitaciones de procedencia descritas por FluidInference y que este espejo no garantiza una conversión upstream reproducible.
- El repositorio declara tamaño 0.0 GB, lo que puede indicar que los artefactos binarios no están efectivamente alojados o que la métrica no refleja el contenido real; conviene verificar antes de usarlo.
- Las descargas (13) y likes (0) son muy bajos; no hay evidencia de validación comunitaria.
- No se declaran idiomas soportados ni datos de sesgo; la diarización puede degradarse en audio con solapamiento de voces, ruido o muchas voces simultáneas (limitación general de la tarea, no documentada en el repo).
- Licencia CC BY 4.0: permite uso comercial con atribución; deben respetarse los avisos de `NOTICE.txt`, incluido el aviso Apache-2.0 del pipeline nativo FluidAudio.
- La model card contiene contenido promocional del producto OneMira C1 y enlaces de afiliado/venta; no debe interpretarse como documentación técnica neutral.
- No hay pipeline declarado en Hugging Face, por lo que no puede cargarse directamente con `transformers` ni con `pipeline()`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onemira/community-1-diarization-coreml
- Modelo upstream pyannote: https://huggingface.co/pyannote/speaker-diarization-community-1
- Conversión Core ML de referencia: https://huggingface.co/FluidInference/speaker-diarization-coreml
- Servidor MCP de OneMira: https://github.com/onemira-space/onemira-mcp
- Producto OneMira C1: https://onemira.com/products/c1
- Página "AI Voice Recorder Without Subscription": https://onemira.com/ai-voice-recorder-without-subscription
- Dataset de benchmark 2026 de OneMira: https://huggingface.co/datasets/onemira/ai-voice-recorder-without-subscription-2026
