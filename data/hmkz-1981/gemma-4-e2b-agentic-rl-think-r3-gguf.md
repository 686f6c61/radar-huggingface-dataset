# hmkz-1981/gemma-4-e2b-agentic-rl-think-r3-GGUF

## Resumen

`gemma-4-e2b-agentic-rl-think-r3-GGUF` es una cuantización en formato GGUF del modelo `hmkz-1981/gemma-4-e2b-agentic-rl-think-r3`, un ajuste fino de `google/gemma-4-E2B-it` orientado a seguimiento de instrucciones, jerarquía de instrucciones y uso de herramientas en varios pasos. El autor del ajuste y de la cuantización es el usuario de Hugging Face `hmkz-1981`, que lo publica bajo licencia Apache 2.0. El modelo base procede de Google Gemma 4, también Apache 2.0.

El modelo resuelve el problema de dotar a un modelo compacto de capacidades agénticas (tool calling, razonamiento multi-paso, modo de pensamiento explícito) sin renunciar a un despliegue ligero en local. Con 4.628.569.635 parámetros totales según los safetensors del modelo base, entra en la categoría de modelos pequeños/medianos que pueden ejecutarse en GPUs de consumo con cuantizaciones de 4 y 5 bits.

La relevancia actual reside en que combina tres elementos poco habituales en modelos de este tamaño: un modo de pensamiento activable por petición (`enable_thinking`), un modo conversacional restringido (`conversational_mode`) y soporte de tool calling compatible con la API de OpenAI a través de `llama-server`. Todo ello empaquetado en GGUF con matrices de importancia (imatrix) calculadas sobre los propios datos de entrenamiento, lo que mejora la fidelidad de la cuantización respecto a BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4; familia transformer, detalles no publicados en la información disponible) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0; mmproj en BF16 para entradas de imagen y audio |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base presumiblemente safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un modelo de la familia Gemma 4 de Google. Sobre esa base, el autor aplica un post-entrenamiento compuesto por SFT con destilación de pistas (hint distillation) y GRPO (Group Relative Policy Optimization), orientado a tres objetivos: seguimiento de instrucciones, respeto de la jerarquía de instrucciones y uso de herramientas en múltiples pasos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros del RL.

La cuantización se realizó con llama.cpp (commit `a4d4f2f`). Las variantes Q4_K_M y Q5_K_M emplean una imatrix construida a partir de los datos de entrenamiento (prompts y respuestas verificadas, incluyendo trazas de pensamiento, en japones e inglés), lo que reduce la divergencia respecto al modelo en BF16. El repositorio incluye además un fichero `mmproj-BF16.gguf` que preserva los encoders de imagen y audio originales de Gemma 4, permitiendo entrada multimodal en llama.cpp.

## Capacidades

- Generación de texto conversacional en japones e inglés.
- Razonamiento con modo de pensamiento explícito, activable mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Modo conversacional restringido (respuestas de dos frases o menos, sin Markdown) mediante `conversational_mode: true`.
- Tool calling / function calling compatible con el esquema `tools` de la API de OpenAI.
- Uso de herramientas en múltiples pasos (multi-step tool use), entrenado explícitamente para ello.
- Seguimiento de instrucciones y jerarquía de instrucciones (instrucciones del sistema por encima de las del usuario).
- Entrada multimodal de imagen y audio mediante el fichero mmproj (encoders originales de Gemma 4).
- Integración con endpoints compatibles (`endpoints_compatible` en los tags del repositorio).

## Casos de uso

- Agentes de herramientas en local: el modelo puede encadenar llamadas a funciones vía el esquema `tools` de OpenAI, lo que permite construir agentes que consultan APIs, bases de datos o servicios externos sin depender de la nube.
- Asistentes conversacionales de baja latencia: el modo `conversational_mode` fuerza respuestas breves y sin Markdown, adecuado para interfaces de chat o asistentes de voz donde la verbosidad es un problema.
- Razonamiento con traza explícita: activando `enable_thinking`, el modelo genera pasos intermedios auditables, útil en tareas de depuración de pipelines agénticos o en escenarios donde se requiere trazabilidad del razonamiento.
- Procesamiento multimodal ligero: con el mmproj BF16 se pueden enviar imágenes o audio junto al texto, por ejemplo para descripción de capturas o transcripción asistida en un entorno llama.cpp.
- Despliegue en hardware de consumo: con Q4_K_M (3,18 GiB) el modelo cabe en GPUs de gama media y en equipos con 8 GB de VRAM, lo que habilita prototipado agéntico sin infraestructura dedicada.
- Evaluación de seguimiento de jerarquía de instrucciones: el ajuste está entrenado específicamente para respetar la precedencia sistema/usuario, lo que lo hace útil como banco de pruebas para estudiar robustez frente a inyección de instrucciones.
- Sustitución de modelos mayores en tareas acotadas: para flujos de tool calling simples en japones o inglés, un modelo de 4,6B parámetros reduce coste y latencia frente a alternativas de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de fidelidad de la cuantización respecto a BF16, medidas sobre textos de validación en japones e inglés no usados en entrenamiento:

| Fichero | Formato | Tamano | Mean KLD | Same top p |
|---|---|---|---|---|
| `gemma-4-e2b-agentic-rl-think-r3-Q4_K_M.gguf` | Q4_K_M | 3,18 GiB | 0,0447 | 93,1% |
| `gemma-4-e2b-agentic-rl-think-r3-Q5_K_M.gguf` | Q5_K_M | 3,37 GiB | 0,0129 | 96,1% |
| `gemma-4-e2b-agentic-rl-think-r3-Q8_0.gguf` | Q8_0 | 4,61 GiB | 0,0019 | 98,3% |

KLD más bajo y Same top p más alto indican mayor proximidad al modelo en BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,2 GiB con Q4_K_M, 3,4 GiB con Q5_K_M y 4,6 GiB con Q8_0, a los que hay que sumar el espacio de contexto KV y, si se usa multimodal, el mmproj en BF16.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M o Q5_K_M; 12 GB o más para Q8_0 con contexto amplio. No se dispone de datos específicos sobre A100, H100 o RTX 4090 en la información proporcionada.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o superiores con las cuantizaciones Q4 y Q5.
- Opciones de despliegue: llama.cpp mediante `llama-server` (comando documentado: `llama-server -hf hmkz-1981/gemma-4-e2b-agentic-rl-think-r3-GGUF:Q4_K_M --jinja`). Compatible con endpoints OpenAI. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Idiomas limitados a japones e inglés; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- No se han publicado evaluaciones de sesgo, toxicidad o robustez; se desconoce el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinación inherente a los modelos de este tamaño, especialmente en razonamiento multi-paso y tool calling, donde un error en un paso puede propagarse.
- El modo de pensamiento y el modo conversacional son comportamientos entrenados, no garantizados; pueden degradarse con prompts fuera de distribución.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base es Gemma 4 de Google y conviene verificar los términos aplicables al modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del ajuste.
- El autor declara que el modelo se creó con la colaboración de Claude (Anthropic); no se detalla el alcance de esa colaboración ni su impacto en la calidad del ajuste.
- No se dispone de información sobre la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/hmkz-1981/gemma-4-e2b-agentic-rl-think-r3-GGUF
- Modelo base del ajuste: https://huggingface.co/hmkz-1981/gemma-4-e2b-agentic-rl-think-r3
- Modelo original de Google: https://huggingface.co/google/gemma-4-E2B-it
- llama.cpp (commit de conversión `a4d4f2f`): https://github.com/ggml-org/llama.cpp
