# fadhilahkhairogi/Liwet-66M-id-instruct-v1

## Resumen

Liwet-66M-id-instruct-v1 es un modelo de generacion de texto en indonesio desarrollado por Fadhilah Akbar Khairogi y el Grupo 11 de la Universidad Telkom (Indonesia), en el marco de un trabajo de curso sobre IA generativa. Se trata de un transformer decoder-only construido desde cero, con arquitectura MiniTransformer, que incorpora Pre-RMSNorm, RoPE (Rotary Positional Embeddings) y SwiGLU. El modelo parte de un checkpoint base preentrenado durante una sola epoca (Liwet-66M-id-base-v1) y se ha ajustado posteriormente mediante SFT (Supervised Fine-Tuning) para seguir instrucciones.

El modelo tiene aproximadamente 66,7 millones de parametros (83.112.448 elementos almacenados en safetensors, incluyendo una lm_head no atada), 12 capas, 8 cabezas de atencion, dimension oculta de 512 y una dimension SwiGLU de 2.048. Su ventana de contexto es de solo 1.024 tokens y el vocabulario es un Byte-Level BPE de 32.000 tokens. Es un modelo muy pequeno, orientado a investigacion, prototipado y experimentacion educativa, no a produccion.

Su relevancia radica en ser un ejemplo de entrenamiento desde cero en un idioma de recursos limitados como el indonesio, con todo el pipeline (tokenizer, arquitectura, SFT) publicado de forma abierta. No compite con modelos multilingues de gran escala, sino que sirve como referencia para quienes quieren entender o replicar el entrenamiento de un LLM pequeno en un idioma concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniTransformer decoder-only, Pre-RMSNorm, RoPE, SwiGLU |
| Parametros totales | ~66,7 M (83.112.448 elementos en safetensors, lm_head no atada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan GGUF ni otras) |
| Idiomas soportados | indonesio (id) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16), con config.json y tokenizer.json |
| Vocabulario | 32.000 Byte-Level BPE (`<|unk|>`, `<|pad|>`, `<|endoftext|>`) |
| Capas / cabezas / dim | 12 capas, 8 cabezas, 512 hidden dim, 2.048 SwiGLU dim |
| Modelo base | fadhilahkhairogi/Liwet-66M-id-base-v1 |
| Etapa | SFT post-entrenamiento (step 1.360) |
| Formato de prompt | `prompt + "\n\n" + response`, delimitado por `<|endoftext|>` |

## Arquitectura y entrenamiento

El modelo usa una arquitectura MiniTransformer decoder-only con Pre-RMSNorm, embeddings posicionales rotatorios (RoPE) y activacion SwiGLU en las capas feed-forward. Consta de 12 capas, 8 cabezas de atencion, dimension oculta de 512 y dimension SwiGLU de 2.048. El tokenizer es un Byte-Level BPE de 32.000 tokens entrenado especificamente para indonesio, con tokens especiales `<|unk|>`, `<|pad|>` y `<|endoftext|>`. Los pesos se almacenan en safetensors con precision bfloat16.

El entrenamiento se realizo en dos fases. Primero, un preentrenamiento base de una epoca que dio lugar a Liwet-66M-id-base-v1. Despues, un ajuste supervisado (SFT) sobre ese checkpoint, consumiendo 44.564.480 tokens (~44,6 M) de datos de instrucciones en indonesio. Los datasets empleados fueron OpenPathAI/alpaca-gpt4-indonesian-cleaned, FreedomIntelligence/evol-instruct-indonesian, LorthGyu/indonesian-instructions y hanifabdlh/LaMini-Instruction-Indonesian-Google-Translated. No se documenta uso de RLHF ni DPO. El formato de entrenamiento es plano, uniendo instruccion y respuesta con `\n\n` y separando documentos con `<|endoftext|>`, sin una plantilla de chat estructurada con roles.

## Capacidades

- Generacion de texto en indonesio: es la funcion principal del modelo, entrenado exclusivamente en ese idioma.
- Seguimiento de instrucciones basicas: gracias al SFT sobre datasets de instrucciones en indonesio, puede responder a peticiones directas.
- Generacion de respuestas cortas y de un solo turno: el formato de entrenamiento (`prompt + "\n\n" + response`) no define roles ni turnos multiples.
- Razonamiento limitado: el tamano (66,7 M) y la ventana de 1.024 tokens restringen tareas que requieran cadenas largas de razonamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni modo thinking explicito.
- Capacidad multilingue muy limitada: el vocabulario y los datos son casi exclusivamente indonesios.

## Casos de uso

- Prototipado educativo de LLM en indonesio: sirve para estudiar el pipeline completo (tokenizer BPE, arquitectura decoder-only, SFT) en un modelo que cabe en cualquier GPU consumer y se puede inspeccionar por completo.
- Generacion de texto corto en indonesio: redaccion de respuestas breves, resumenes de una o dos frases o variaciones de texto donde no se requiera contexto largo.
- Experimentos de ajuste fino academico: su tamano permite reentrenar o hacer LoRA en una sola GPU, util para cursos e investigacion sobre SFT en idiomas de bajos recursos.
- Generacion de datos sinteticos en indonesio a pequena escala: puede producir pares instruccion-respuesta para aumentar datasets, siempre con revision humana por su tendencia a la alucinacion.
- Chatbots de demostracion con contexto muy corto: integrable en demos donde las conversaciones no superen los 1.024 tokens y el dominio sea acotado.
- Investigacion sobre tokenizacion en indonesio: el tokenizer BPE de 32.000 tokens entrenado desde cero es un artefacto reutilizable para analizar cobertura lexica del idioma.
- Benchmark de referencia para modelos diminutos: sirve como linea base para comparar tecnicas de entrenamiento en modelos de menos de 100 M de parametros.

## Benchmarks y rendimiento

| Checkpoint / split | Datos vistos | Val loss | Val perplexity |
|---|---|---|---|
| SFT sobre base 1 epoca (step 1.360) | 44.564.480 (~44,6 M) tokens | 2,7395 | 15,48 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 o float16 (~0,17 GB de pesos), y del orden de 0,1 GB en cuantizacion de 8 bits. Con overhead de activaciones y KV cache para 1.024 tokens, cabe holgadamente en cualquier GPU con 2 GB o mas.
- GPU recomendadas: cualquier GPU moderna, incluidas GTX 1650, RTX 3050, RTX 4090, A100 o H100. El modelo no requiere hardware de gama alta.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer de los ultimos anos, e incluso puede ejecutarse en CPU con latencias aceptables.
- Opciones de despliegue: al no ser un checkpoint estandar de `transformers` `AutoModelForCausalLM`, requiere cargar `model.safetensors` en la definicion de arquitectura del proyecto (config.json + tokenizer.json). No se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI; habria que convertir los pesos a GGUF o adaptarlos al formato de `transformers` para usarlos en esos runners.
- Latencia y throughput estimados: no disponible. Por el tamano, en una GPU moderna se espera un throughput alto y latencias de pocos milisegundos por token, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Liwet-66M-id-instruct-v1 | ~66,7 M | 1.024 | indonesio | no disponible | safetensors (custom) |
| Liwet-66M-id-base-v1 | ~66,7 M | 1.024 | indonesio | no disponible | safetensors (custom) |
| Modelos comparables de <100 M en indonesio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos equivalentes en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Tamano muy reducido: con 66,7 M de parametros, la calidad de generacion y la coherencia en respuestas largas son limitadas en comparacion con modelos de miles de millones de parametros.
- Contexto de solo 1.024 tokens: no admite conversaciones multi-turno largas ni documentos extensos sin truncado agresivo.
- Entrenamiento de una sola epoca en la fase base y SFT sobre ~44,6 M tokens: la cobertura de dominios y estilos es estrecha.
- Riesgo alto de alucinacion: al ser un modelo pequeno entrenado con pocos datos, puede inventar hechos con facilidad.
- Sesgos: los datasets de instrucciones (traducciones automaticas de Alpaca-GPT4, evol-instruct, LaMini) pueden introducir sesgos de traduccion, calcos del ingles y desequilibrios tematicos.
- Monolingue en la practica: aunque la etiqueta de idioma es `id`, no se garantiza un rendimiento aceptable en otros idiomas.
- Licencia no disponible: no se especifican terminos de uso comercial, por lo que no se recomienda su integracion en productos sin aclarar la licencia con los autores.
- Formato no estandar: no es un `AutoModelForCausalLM` de `transformers`, lo que complica su uso con herramientas habituales (vLLM, TGI, Ollama) sin conversion previa.
- Sin plantilla de chat con roles: el formato plano `prompt + "\n\n" + response` puede degradar la calidad en dialogos con system prompt o turnos alternos.
- No apto para produccion critica: es un artefacto academico, sin garantias de robustez, seguridad ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fadhilahkhairogi/Liwet-66M-id-instruct-v1
- Modelo base: https://huggingface.co/fadhilahkhairogi/Liwet-66M-id-base-v1
- Dataset OpenPathAI/alpaca-gpt4-indonesian-cleaned: https://huggingface.co/datasets/OpenPathAI/alpaca-gpt4-indonesian-cleaned
- Dataset FreedomIntelligence/evol-instruct-indonesian: https://huggingface.co/datasets/FreedomIntelligence/evol-instruct-indonesian
- Dataset LorthGyu/indonesian-instructions: https://huggingface.co/datasets/LorthGyu/indonesian-instructions
- Dataset hanifabdlh/LaMini-Instruction-Indonesian-Google-Translated: https://huggingface.co/datasets/hanifabdlh/LaMini-Instruction-Indonesian-Google-Translated
