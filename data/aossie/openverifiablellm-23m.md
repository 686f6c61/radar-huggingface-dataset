# AOSSIE/OpenVerifiableLLM-23M

## Resumen

OpenVerifiableLLM 23M es un modelo de lenguaje pequeño entrenado por AOSSIE (la organización australiana de software abierto) con un objetivo poco habitual: la total reproducibilidad del entrenamiento. El modelo se entrenó con exactamente una pasada sobre todo el volcado de la Wikipedia en inglés del 1 de septiembre de 2026 (7.232.582 artículos), seguido de una breve fase de conversación con 3.481 diálogos de OpenAssistant. Su rasgo distintivo es que todo el proceso de entrenamiento puede recomputarse bit a bit: los 37 segmentos de entrenamiento fueron recomputados en una segunda RTX 5090 y coincidieron exactamente, con un registro de entrenamiento anclado temporalmente mediante sellados de tiempo de FreeTSA y DigiCert.

Técnicamente es un modelo estilo GPT-2 con 6 capas, 6 cabezas de atención, 384 dimensiones y 512 tokens de contexto, con unos 23,1 millones de parámetros según la model card (el repositorio de safetensors reporta 35,4 millones de pesos totales, que incluyen la copia duplicada de los embeddings atados). No pretende ser un modelo competitivo en calidad: la propia ficha advierte que "suele equivocarse en los hechos". Su valor está en la verificación: cualquier usuario puede comprobar en un portátil que los pesos publicados corresponden exactamente al estado registrado en la cadena de entrenamiento, o recomputar un segmento por unos 1,50 dólares en una RTX 5090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 style (decoder-only transformer), 6 capas, 6 cabezas, 384 dimensiones, embeddings atados |
| Parametros totales | 23,1M (model card); 35.420.160 pesos en safetensors (incluye copia duplicada de pesos atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | F32 (GGUF publicado en F32 completo; sin versiones cuantizadas publicadas) |
| Idiomas soportados | Inglés |
| Licencia | GPL-3.0 (pesos y código); datos: Wikipedia CC BY-SA 4.0 con excepciones documentadas, OpenAssistant oasst1 Apache 2.0 |
| Formato de pesos | safetensors (base y chat) y GGUF (ovl-23m-chat-F32.gguf) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT-2 con 6 capas, 6 cabezas de atención, dimensión de modelo de 384, contexto de 512 tokens y embeddings atados con la capa de salida. El tokenizador es un BPE a nivel de byte con 31.995 tokens (más 5 tokens de control, incluidos `<|user|>`, `<|assistant|>` y `<|eos|>` para el formato conversacional).

El entrenamiento constó de dos fases: preentrenamiento con 560.177 pasos de actualización sobre el volcado de la Wikipedia en inglés de 2026-09-01 (7.118.121.139 objetivos de entrenamiento, batch de 32 × 512 tokens) y una fase de conversación con 441 actualizaciones sobre 3.481 diálogos de OpenAssistant. La semilla es 1234 y la receta completa (tamaño, planificación, semilla) se publica en `recipe.json`. La innovación principal no es arquitectónica sino de reproducibilidad: cada uno de los 37 segmentos de entrenamiento forma parte de una cadena de evidencia con checkpoints, sellados de tiempo (FreeTSA y DigiCert, con fecha 2026-10-20 14:38:43 UTC) y hashes SHA-256, de modo que el entrenamiento completo puede recomputarse bit a bit en una RTX 5090 (aproximadamente una hora y 1,50 dólares por segmento). No hay información sobre RLHF o DPO más allá de la fase de conversación supervisada descrita.

## Capacidades

- Generacion de texto en inglés con estilo enciclopédico fluido, heredado del preentrenamiento sobre Wikipedia.
- Conversación básica multi-turno mediante el formato `<|user|> ... <|eos|> <|assistant|> ... <|eos|>`.
- Generacion de texto general con el modelo base (`base.safetensors`, solo Wikipedia), útil para completar texto enciclopédico.
- Sin soporte documentado de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Contexto limitado a 512 tokens, lo que restringe tareas de contexto largo.
- Razonamiento y matemáticas: no disponible (no se reportan capacidades ni evaluaciones).
- Capacidad especial destacable: trazabilidad y verificación del entrenamiento bit a bit, algo excepcional en modelos abiertos.

## Casos de uso

- Verificacion de reproducibilidad en investigacion: un equipo de investigación puede recomputar segmentos del entrenamiento por unos 1,50 dólares cada uno en una RTX 5090 para auditar que el modelo publicado coincide con el proceso declarado; es el caso de uso central del proyecto.
- Ensenanza de entrenamiento de LLM: la receta completa, la semilla, el tokenizador y la cadena de checkpoints permiten usarlo como material didáctico para cursos sobre cómo se entrena un modelo de lenguaje de principio a fin.
- Desarrollo y prueba de toolchains de inferencia: su tamaño mínimo (0,4 GB de repositorio) lo hace ideal para probar integraciones con llama.cpp, Ollama o pipelines de despliegue sin consumir recursos.
- Benchmarking de infraestructura de verificacion: sirve como caso de prueba para herramientas de auditoría de modelos, verificación de hashes y sellado de tiempo criptográfico de artefactos de ML.
- Generacion de texto enciclopedico en ingles: el modelo base puede completar texto con estilo de Wikipedia, adecuado para demostraciones o prototipos de bajo consumo.
- Experimentacion con fine-tuning reproducible: la cadena de evidencia permite comparar cómo un fine-tuning posterior altera los pesos de forma verificable respecto al estado anclado.
- Chatbot de demostracion ligero: mediante Ollama (`ollama run ryoari/openverifiablellm`) se puede desplegar un asistente conversacional básico en cualquier portátil, útil para demos donde la huella de memoria debe ser mínima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que el modelo "suele equivocarse en los hechos" y que la verificación se refiere a cómo se fabricó, no a la calidad de sus respuestas.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; con pesos F32 de ~35M de parámetros, el modelo ocupa en torno a 140 MB de memoria, ejecutable en CPU o en cualquier GPU moderna sin problema.
- GPU recomendadas: ninguna en particular para inferencia; para verificar el entrenamiento bit a bit se requiere una RTX 5090 (una RTX 4090, una H100 o una CPU producen bits distintos).
- Cabe con holgura en GPUs de consumo de gama baja; incluso en portátiles sin GPU dedicada.
- Opciones de despliegue: Ollama (`ollama run ryoari/openverifiablellm`, con `Modelfile` incluido) y llama.cpp (GGUF F32); los safetensors permiten carga directa con PyTorch para verificación.
- Latencia y throughput estimados: no disponible; dado el tamaño, se espera inferencia muy rápida incluso en CPU.
- Verificación ligera de pesos: el script `ovl.py` verifica la cadena en CPU en un portátil (requiere Python 3.12+, git, openssl y acceso a red).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| OpenVerifiableLLM 23M | 23,1M | 512 tokens | GPL-3.0 | Reproducibilidad y verificación del entrenamiento |
| GPT-2 (124M) | 124M | 1024 tokens | MIT (OpenAI) | Modelo base clásico, sin registro verificable |
| TinyLlama 1.1B | 1.100M | 2048 tokens | Apache 2.0 | Modelo pequeño generalista, mayor capacidad |
| SmolLM2 135M | 135M | 2048 tokens | Apache 2.0 | Modelo compacto para investigación, sin cadena de evidencia |

OpenVerifiableLLM es notablemente más pequeño que las alternativas y mucho más limitado en calidad y contexto, pero es el único de la lista cuyo entrenamiento completo puede recomputarse y verificarse bit a bit con un registro anclado temporalmente.

## Limitaciones y advertencias

- Calidad factual baja: la model card reconoce que el modelo a menudo se equivoca en los hechos; "verificado" se refiere al proceso de fabricación, no a la veracidad del contenido.
- Riesgo alto de alucinacion: propio de un modelo de 23M de parámetros entrenado con una sola pasada; no debe usarse para información fiable.
- Sesgo de datos: entrenado exclusivamente con Wikipedia en inglés y OpenAssistant, hereda los sesgos de ambos corpus y solo cubre inglés.
- Contexto muy corto: 512 tokens, insuficiente para documentos largos o conversaciones extensas.
- Reproducibilidad dependiente del hardware: la coincidencia bit a bit solo se garantiza en RTX 5090; otras GPUs y CPU producen bits diferentes. llama.cpp produce salidas cercanas pero no idénticas a PyTorch.
- Verificacion no independiente: todos los chequeos de segmentos realizados hasta ahora los ha ejecutado el propio proyecto; ningún tercero independiente ha verificado aún ninguno.
- Los sellados de tiempo prueban que el registro existía el 2026-10-20 14:38:43 UTC, no cuándo ni cómo se entrenó realmente.
- Licencia GPL-3.0: más restrictiva que Apache 2.0 o MIT para integración en productos derivados; los datos de entrenamiento mantienen sus propios términos (CC BY-SA 4.0 con excepciones, Apache 2.0), conviene revisar el `LICENSES.md` del dataset.
- Sin cuantizaciones publicadas: solo hay GGUF en F32, lo que incrementa el tamaño respecto a alternativas en INT4/INT8, aunque sigue siendo trivial (0,4 GB).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AOSSIE/OpenVerifiableLLM-23M
- Dataset de evidencia de entrenamiento: https://huggingface.co/datasets/AOSSIE/openverifiable-enwiki-20260901-20260918-r1-evidence
- Repositorio de código y documentación: https://github.com/AOSSIE-Org/OpenVerifiableLLM
- Documentación técnica (cómo funciona): https://github.com/AOSSIE-Org/OpenVerifiableLLM/blob/main/docs/how-it-works.md
- Guía de verificación del entrenamiento: https://github.com/AOSSIE-Org/OpenVerifiableLLM/blob/main/docs/verify.md
