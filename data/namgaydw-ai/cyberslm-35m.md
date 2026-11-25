# namgaydw-ai/CyberSLM-35M

## Resumen

CyberSLM-35M es un modelo de lenguaje decoder-only de 35,2 millones de parámetros desarrollado por namgaydw-ai (Namgay D Wangchuk) como trabajo de curso de Design Thinking en la JAIN (Deemed-to-be University), bajo la asignación del Dr. Sujeet S. Jagtap. Se trata de un prototipo educativo de investigación orientado a tareas de pregunta-respuesta estructurada sobre evidencia ficticia en el dominio de la ciberseguridad, no de un modelo de propósito general ni de un sistema de producción.

La arquitectura es un transformer decoder-only convencional con 10 capas, anchura oculta de 512, 8 cabezas de atención, RoPE, RMSNorm y SwiGLU con anchura 1.600, con embeddings atados. Emplea un tokenizador de bytes UTF-8 personalizado de 259 tokens (PAD=0, BOS=1, EOS=2, byte `b` = ID `b+3`) y una longitud de contexto de 512 tokens de byte.

Su relevancia es acotada y fundamentalmente pedagógica: documenta de forma transparente un pipeline de entrenamiento por etapas (Stage A y Stage B), publica recibos de verificación y ofrece paridad entre la implementación nativa en PyTorch y un GGUF F16 ejecutable en Ollama. El autor declara explícitamente un exact match neuronal del 34,38 % en su holdout, por lo que debe tratarse como artefacto de reproducibilidad, no como clasificador de incidentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RoPE, RMSNorm, SwiGLU, embeddings atados) |
| Parametros totales | 35.337.728 (safetensors); la model card indica 35.205.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de byte |
| Tipos de cuantizacion | F16 (GGUF publicado); otras no disponibles |
| Idiomas soportados | no disponible (tokenizador de bytes UTF-8, sin desglose por idioma) |
| Licencia | other |
| Formato de pesos | `pytorch_model.pt` (PyTorch), GGUF (`cyberslm-35m-structured-byte-f16.gguf`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 10 capas con anchura oculta 512, 8 cabezas de atención, RoPE para codificación posicional, RMSNorm y una MLP SwiGLU de anchura 1.600. Los embeddings de entrada y salida están atados. El vocabulario es un conjunto personalizado de 259 tokens sobre bytes UTF-8, con identificadores reservados PAD=0, BOS=1 y EOS=2, de modo que cada byte `b` se mapea al ID `b+3`. La ventana de contexto es de 512 tokens de byte, lo que limita la longitud efectiva del texto procesable.

El entrenamiento se organiza en dos etapas: el checkpoint empaquetado corresponde al Stage B, una adaptación a QA estructurada de evidencia que parte del paso 1.000 del Stage A y ejecuta 800 pasos de optimizador adicionales con actualización solo sobre la respuesta (answer-only), usando 4.050 ejemplos ficticios de QA estructurada balanceados por tarea. La selección del checkpoint se hizo exclusivamente por pérdida de validación. El autor publica el SHA-256 del checkpoint de origen (`72185b281de6baaf80003d8bdf5cbd4e2af9602f596a01b4308ef978f314f675`) y la revisión de origen (`1a3ccbb6dc055fdb83009aeaac74091ccd69e4ca`). No se documenta el volumen total de tokens de entrenamiento ni el uso de RLHF o DPO.

Como innovación destacable, el autor incluye un GGUF con vocabulario de bytes estilo GPT-2 sin fusiones (merge-free), de forma que llama.cpp genera los mismos IDs de byte que la implementación nativa. La verificación sobre Ollama 0.40.16 reportó IDs de entrada idénticos en el prompt de diagnóstico, log-probabilidades del primer token casi idénticas en el top-10 y 180/180 cadenas greedy coincidentes entre nativo y Ollama en una muestra determinista balanceada por tarea.

## Capacidades

- Generación de texto autoregresiva a nivel de byte sobre prompts de evidencia estructurada.
- QA estructurada sobre escenarios ficticios de ciberseguridad (selección de tarea y extracción de campos).
- Razonamiento numérico limitado: corrección numérica neuronal de 178/900 = 19,78 % en el holdout del autor.
- Ejecución en llama.cpp y Ollama mediante el GGUF F16 publicado, con paridad de IDs respecto a la implementación nativa.
- Carga nativa en PyTorch mediante `load_model.py` y los módulos personalizados `modeling_cyberslm.py` y `tokenization_cyberslm.py`.
- No soporta tool calling ni function calling de forma documentada.
- No se documentan capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles; el tokenizador es de bytes UTF-8 sin evaluación por idioma.

## Casos de uso

- Reproducibilidad de investigación educativa: el modelo sirve para replicar el pipeline Stage A → Stage B, verificar los checksums publicados y comparar la pérdida de validación con los recibos de entrenamiento incluidos en el repositorio.
- Docencia sobre tokenización a nivel de byte: permite ilustrar en clase cómo un vocabulario de 259 tokens con mapeo `b+3` afecta a la longitud efectiva y a la eficiencia frente a tokenizadores de subpalabras.
- Pruebas de paridad de runtime: útil para validar que una conversión a GGUF conserva los IDs de entrada y las cadenas greedy respecto al checkpoint PyTorch original, usando el caso documentado en Ollama 0.40.16 como referencia.
- Experimentos controlados de QA estructurada: escenario de laboratorio para medir exact match y corrección numérica en tareas balanceadas sobre fixtures sintéticos, sin pretensión de validez sobre datos reales.
- Integración en pipelines de CI para modelos pequeños: su tamaño (repo de 0,5 GB) permite incluirlo en tests automatizados de carga, tokenización y generación determinista sin infraestructura GPU dedicada.
- Demostración de límites de los SLM: caso de estudio sobre por qué un modelo de 35 M de parámetros con contexto de 512 bytes no sustituye a un detector de intrusiones ni a un motor de veredictos autónomo.

## Benchmarks y rendimiento

| Modo | Exact match | Notas |
|---|---:|---|
| Checkpoint neuronal previo | 49/1.620 = 3,02 % | Holdout congelado aislado por escenario |
| Checkpoint neuronal mejorado | 557/1.620 = 34,38 % | Checkpoint empaquetado en este repositorio |
| Híbrido determinista | 1.620/1.620 = 100 % | No es precisión neuronal: recalcula desde campos estructurados |

El holdout congelado contiene 1.620 preguntas sobre 180 escenarios ficticios de evidencia estructurada, balanceados a 180 preguntas por tarea. La corrección numérica neuronal del checkpoint mejorado es de 178/900 = 19,78 %. El resultado del 100 % del híbrido determinista no debe atribuirse al modelo neuronal, y una generación estándar sin el motor híbrido no lo reproduce. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en F16 para los 35,3 M de parámetros (unos 70 MB de pesos); el repo completo ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo es ejecutable en CPU sin problema.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX o iGPU moderna; también en Raspberry Pi y entornos similares por su tamaño reducido.
- Opciones de despliegue: PyTorch nativo (`load_model.py`), llama.cpp y Ollama (GGUF F16 verificado). No se declara compatibilidad con `AutoModelForCausalLM` de Transformers, por lo que vLLM y TGI no están soportados de forma documentada.
- Latencia y throughput: no disponibles de forma numérica. La generación a nivel de byte es menos eficiente que la de subpalabras, según advierte el propio autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberSLM-35M | 35,3 M | 512 tokens de byte | Exact match 34,38 % en holdout propio | other | Hugging Face, GGUF, Ollama |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2.048 tokens | Benchmarks estándar publicados por el autor | Apache 2.0 | Hugging Face, GGUF, Transformers |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Benchmarks estándar publicados por el autor | Apache 2.0 | Hugging Face, GGUF, Transformers |
| Qwen2.5-0.5B | 0,5 B | 32.768 tokens | Benchmarks estándar publicados por el autor | Apache 2.0 | Hugging Face, GGUF, Transformers |

La comparación es asimétrica: CyberSLM-35M no compite en capacidades generales con los modelos anteriores, sino que se distingue por su propósito didáctico, su tokenizador de bytes y la trazabilidad de su pipeline. Los datos de los modelos alternativos no provienen de la información proporcionada y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Exact match neuronal agregado de solo 34,38 %; la aritmética es especialmente débil (19,78 % de corrección numérica).
- El modelo puede seleccionar la tarea equivocada, alucinar o repetir texto.
- Los ejemplos de presentación seleccionados por el autor no constituyen una evaluación insesgada.
- La generación a nivel de byte es menos eficiente que la de subpalabras.
- Los fixtures estructurados son sintéticos y no observaciones reales de incidentes.
- Las anotaciones de origen y las puntuaciones de anomalía no son etiquetas de ataque confirmadas de forma independiente.
- No es un detector de intrusiones de producción ni un motor autónomo de veredictos de ataque.
- Licencia "other": deben revisarse los términos concretos antes de cualquier uso comercial; no se especifican en la información disponible.
- El dataset público `namgaydw-ai/CyberSLM-Evidence-QA` es un fixture de demostración de seis filas y no debe usarse para afirmar precisión del modelo.
- El resultado del 100 % del modo híbrido determinista no es precisión del modelo neuronal y no se obtiene con una generación estándar.
- El contexto de 512 tokens de byte limita severamente la longitud de entrada procesable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namgaydw-ai/CyberSLM-35M
- Dataset de demostración: https://huggingface.co/datasets/namgaydw-ai/CyberSLM-Evidence-QA
- Repositorio GitHub (construcción, entrenamiento, evaluación, paridad y tests): https://github.com/namgaydw-tech/CyberSLM
