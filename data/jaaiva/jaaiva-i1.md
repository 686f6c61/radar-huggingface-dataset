# Jaaiva/jaaiva-i1

## Resumen

Jaaiva i1 es un modelo de lenguaje de 503.377.664 parámetros (~503M) construido y entrenado desde cero en PyTorch por el desarrollador identificado como jjge008, sin partir de ningún modelo preexistente. Se trata de un GPT de estilo clásico (pre-LN, QKV fusionada, MLP con GELU, embeddings atados y posiciones absolutas aprendidas al estilo GPT-2) con una ventana de contexto de 1024 tokens y un vocabulario de 8.192 tokens mediante BPE a nivel de byte. La versión publicada en este repositorio es la v2.0.0, distribuida exclusivamente como GGUF en f16 para llama.cpp.

El modelo acumula 700.022.784 tokens de preentrenamiento (7.121 pasos, 98.304 tokens por paso, AdamW con decaimiento coseno en bf16 sobre una AMD RX 9070 XT con ROCm) y cinco etapas posteriores de SFT, incluida una etapa dedicada a aritmética extremadamente simple. Su relevancia no es de producto: es un artefacto de investigación que documenta de forma transparente el proceso completo de entrenamiento desde cero en hardware de consumo, con pérdida de validación final de 1,4176 (perplejidad 4,13).

El propio autor advierte explícitamente de que el modelo está inacabado e inestable, es más débil que prácticamente cualquier chatbot público, alucina y responde con seguridad a preguntas cuya respuesta desconoce. Su interés es educativo y experimental, no de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (pre-LN, QKV fusionada, MLP GELU, embeddings atados, posiciones absolutas aprendidas) |
| Parametros totales | 503.377.664 (~503M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | Solo f16 en el repositorio publicado (GGUF); no se listan otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | other (pesos y código liberados por jjge008; datos de entrenamiento con licencias propias) |
| Formato de pesos | GGUF (llama.cpp), f16; repo de 1.0 GB con un único archivo `jaaiva-i1-503m-f16.gguf` de 0,94 GiB |
| Capas / cabezas / anchura | 25 / 20 / 1280 |
| Vocabulario | 8.192 tokens (BPE a nivel de byte) |
| Precisión de entrenamiento | bf16 (ROCm, AMD RX 9070 XT) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de 25 capas, 20 cabezas de atención y anchura 1280, con normalización pre-LN, proyección QKV fusionada, MLP con activación GELU, embeddings de entrada y salida atados y codificación posicional absoluta aprendida al estilo GPT-2. El vocabulario es deliberadamente pequeño (8.192 tokens, BPE a nivel de byte) y el contexto máximo es de 1024 tokens. El preentrenamiento consumió 700.022.784 tokens en 7.121 pasos de 98.304 tokens, con AdamW y decaimiento coseno, en bf16 sobre una GPU AMD RX 9070 XT usando ROCm. La pérdida de validación final fue 1,4176 (perplejidad 4,13).

Sobre la base preentrenada se aplicaron cinco etapas de SFT con la pérdida enmascarada únicamente a los tokens del asistente: (1) identidad y multi-turno, 400 pasos; (2) instrucciones, 2.500 pasos sobre UltraChat y Dolly; (3) pulido de identidad, 300 pasos; (4) propósito general dirigido, 700 pasos sobre 2.643 pares; (5) aritmética simple y renombrado, 1.200 pasos sobre 4.525 pares de matemáticas generados localmente, mezclados con UltraChat, Dolly y repetición de identidad para evitar el colapso conversacional. No hay RLHF, DPO ni ajuste de seguridad. El formato de prompt usa tokens especiales `<|pad|>` (0), `<|bos|>` (1), `<|eos|>` (2), `<|user|>` (3) y `<|assistant|>` (4), sin ranura de sistema, y la generación se detiene en `<|eos|>`.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con formato de prompt basado en tokens especiales de usuario y asistente.
- Aritmética extremadamente simple: sumas y restas de uno y dos dígitos, tablas de multiplicar, divisiones exactas, porcentajes sencillos, comparaciones, secuencias y conteo de letras, dentro de las plantillas vistas en el entrenamiento.
- Respuestas de identidad: el modelo se identifica como "jaaiva i1" y atribuye su creación a "jjge008".
- Seguimiento básico de instrucciones sencillas, entrenado sobre UltraChat y Dolly.
- Comportamiento de honestidad limitado: en la batería de evaluación acierta 4 de 7 prompts de honestidad, lo que sugiere cierta capacidad de admitir desconocimiento en casos contemplados.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; la categoría de razonamiento de su batería arroja 1/6.
- No dispone de modo thinking, visión, audio ni recuperación (retrieval).
- Sin ranura de system prompt: no es posible inyectar instrucciones de sistema.

## Casos de uso

- Investigación educativa sobre entrenamiento desde cero: el modelo sirve para estudiar el efecto de cada etapa de SFT (identidad, instrucciones, matemáticas) sobre un GPT pequeño, ya que el autor publica la curva de pérdida y la progresión de la batería entre v0.2.0 y v2.0.0.
- Reproducción de pipelines de conversión a GGUF: el repositorio documenta el uso de `convert_gguf.py` y la carga en llama.cpp y Ollama, útil para validar herramientas de cuantización y despliegue con un checkpoint real de 503M.
- Pruebas de integración de servidores compatibles con OpenAI: al poder lanzarse con `llama-server` y exponer `/v1/chat/completions`, sirve como objetivo de pruebas para clientes y middleware sin coste de API.
- Demostraciones de aritmética de plantilla: útil para ilustrar los límites de la generalización en modelos pequeños, comparando los 9/10 de la batería de matemáticas con el fallo esperado ante problemas nuevos.
- Benchmarking de infraestructura en hardware de consumo: con 0,94 GiB en f16, permite medir latencia y throughput de llama.cpp en GPUs modestas o incluso en CPU.
- Docencia sobre formatos de prompt y tokens especiales: el esquema `<|bos|>`/`<|user|>`/`<|assistant|>` sin ranura de sistema es un ejemplo mínimo y legible de diseño de protocolo conversacional.
- Estudio de sesgos y alucinación en modelos entrenados con datos públicos mezclados (UltraChat, Dolly, DailyDialog, PersonaChat, EmpatheticDialogues, BlendedSkillTalk, SODA, WikiText-103, TinyStories, Wikipedia y FineWeb-Edu).

## Benchmarks y rendimiento

El autor publica una batería fija de 52 prompts (`eval_general.py`) con decodificación greedy y coincidencia por palabras clave. Los prompts se solapan deliberadamente con los datos de las etapas 4 y 5, por lo que miden capacidad y no pureza sobre datos no vistos.

| Categoría | v2.0.0 | v0.2.0 | Base preentrenada |
|---|---|---|---|
| Matemáticas | 9/10 | 1/10 | 1/10 |
| Conocimiento | 8/16 | 7/16 | 2/16 |
| Razonamiento | 1/6 | 1/6 | 1/6 |
| Instrucciones | 4/8 | 4/8 | 1/8 |
| Código | 2/5 | 1/5 | 0/5 |
| Honestidad | 4/7 | 3/7 | 0/7 |
| **Total** | **28/52 (54%)** | 17/52 (33%) | 5/52 (10%) |

El autor reporta además un 0% de respuestas repetitivas (repetición de trigramas superior al 20%). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GiB en f16 (el archivo GGUF ocupa 0,94 GiB); el repositorio no ofrece otras cuantizaciones, por lo que no se dispone de cifras para Q8, Q4 u otras.
- GPU recomendadas: cualquier GPU con al menos 1-2 GiB de VRAM libre es suficiente; el modelo se entrenó en una AMD RX 9070 XT con ROCm, lo que confirma compatibilidad con GPU de consumo AMD.
- Cabe en cualquier GPU de consumo actual (RTX 4090, RTX 3060, RX 6600, etc.) y previsiblemente en CPU, dado su tamaño; no se han publicado medidas de latencia ni throughput.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) y Ollama, según indica el autor; no se mencionan vLLM ni TGI.
- Contexto de servidor: el ejemplo del autor usa `-c 1024`, coherente con la ventana máxima del modelo.
- No se dispone de datos de latencia o tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Jaaiva i1 v2.0.0 | ~503M | 1024 | en | other | GGUF f16 | Entrenado desde cero; batería propia 28/52; sin benchmarks estándar |
| GPT-2 small (referencia arquitectónica) | 124M | 1024 | en | MIT (según versión) | safetensors, GGUF | No es un chatbot; el autor cita su estilo posicional |
| Modelos pequeños ajustados tipo TinyLlama o Qwen2.5-0.5B | 0,5-1,1B | 2048-32k | multilingüe | Apache-2.0 / otras | safetensors, GGUF | Fine-tunes de bases preentrenadas con muchos más tokens; no comparables en benchmarks con los datos disponibles |

No se dispone de resultados de benchmarks comunes que permitan una comparación numérica directa con alternativas; la comparación anterior es meramente estructural.

## Limitaciones y advertencias

- El autor declara el modelo inacabado e inestable, más débil que prácticamente cualquier chatbot público, propenso a alucinar y a responder con seguridad a preguntas cuya respuesta desconoce.
- La aritmética más allá de las plantillas simples falla; los problemas de palabras largos o novedosos no se resuelven.
- La etapa de matemáticas se generó por plantillas y se solapa con la batería de evaluación, por lo que las puntuaciones sobreestiman el rendimiento ante preguntas nuevas.
- La inferencia en GGUF es greedy y en f16, de modo que una respuesta aritmética casi empatada puede diferir en una unidad respecto al checkpoint en PyTorch.
- Sin system prompt, sin herramientas, sin retrieval, sin ajuste de seguridad y sin RLHF.
- Solo inglés, contexto de 1024 tokens y vocabulario de 8.192 tokens, lo que limita la cobertura léxica y el manejo de documentos largos.
- Licencia "other": los pesos y el código los libera jjge008, pero los datos de entrenamiento mezclan UltraChat, Databricks Dolly 15k, DailyDialog, PersonaChat, EmpatheticDialogues, BlendedSkillTalk, SODA, WikiText-103, TinyStories, Wikipedia (CC BY-SA) y FineWeb-Edu (ODC-By); es necesario revisar los términos de cada conjunto antes de un uso comercial.
- El autor advierte de que la corrección no está garantizada; no debe usarse en producción ni en contextos donde la exactitud sea crítica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jaaiva/jaaiva-i1
- Repositorio alternativo citado en la model card para descarga: `jjge007/jaaiva-i1` (referenciado en el comando `huggingface-cli download`)
- Script de evaluación citado: `eval_general.py` (mencionado en la model card, sin URL)
- Script de conversión citado: `convert_gguf.py` (mencionado en la model card, sin URL)
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código o demos adicionales.
