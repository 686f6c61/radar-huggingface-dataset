# devlucascfarias/qwen3-4b-tool-judgment

## Resumen

Qwen3-4B Tool-Judgment es un adaptador LoRA (entrenado mediante QLoRA a 4 bits) sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario devlucascfarias. Su objetivo no es ensenar al modelo a formatear llamadas a herramientas —algo que el modelo base ya domina— sino a decidir *cuándo* conviene invocar una herramienta: buscar en la web ante hechos volátiles o locales, ejecutar código Python cuando el resultado es computable, y responder directamente cuando la pregunta es trivial o conversacional.

El adaptador se distribuye junto con una versión fusionada en GGUF (cuantización Q4_K_M) y está pensado para flujos de agentes con tool calling. El entrenamiento se realizó con 443 ejemplos sintéticos en portugués de Brasil (aproximadamente el 85 % del corpus) e inglés (aproximadamente el 15 %), empleando Unsloth y TRL sobre el modelo base de 4.022 millones de parámetros y licencia Apache 2.0.

Es relevante porque aborda un fallo habitual en modelos pequeños: el exceso de llamadas a herramientas en preguntas triviales y la omisión de búsquedas en hechos cambiantes. El adaptador reporta mejoras medibles en precisión de decisión de herramienta sobre el modelo base, aunque con un alcance limitado a dos idiomas y dos herramientas concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA/QLoRA sobre el modelo base |
| Parametros totales | 4.022.468.096 (modelo base fusionado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | QLoRA 4-bit para entrenamiento; GGUF Q4_K_M para inferencia (version fusionada) |
| Idiomas soportados | Portugues de Brasil (pt-BR) e ingles (en) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (adapter_model.safetensors) y GGUF (gguf/model-Q4_K_M.gguf) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.022 millones de parámetros. El ajuste se realizó mediante SFT con QLoRA a 4 bits usando Unsloth y TRL, con PEFT 0.19.1 como librería de adaptadores. El repositorio ocupa 2,6 GB e incluye tanto el adaptador LoRA como una versión fusionada en GGUF.

El corpus de entrenamiento consta de 443 ejemplos sintéticos generados con filtros programáticos y ejecución real del código de verificación, distribuidos en seis comportamientos objetivo: respuesta directa sin herramienta (16,7 %), casos límite con racional breve para *no* buscar (12,0 %), hechos volátiles o locales con búsqueda web y cita del resultado (28,9 %), cálculo verificable con sandbox Python y autocorrección (18,3 %), razonamiento largo genuinamente difícil (5,4 %) y conversación natural sin herramienta (18,7 %). Los datos pasaron por cinco rondas de refinamiento guiadas por análisis de errores. Las herramientas soportadas son `web_search(query)` y `python_sandbox(code)`.

## Capacidades

- Decisión de invocación de herramientas: distingue entre hechos volátiles o locales (buscar), cálculos verificables (ejecutar código) y preguntas triviales o conversacionales (responder directamente).
- Tool calling / function calling con formato JSON válido (tasa reportada de 1.000 en el conjunto de evaluación).
- Racionalización breve antes de decidir no buscar en casos límite.
- Ejecución guiada de código Python en sandbox con confirmación o autocorrección del resultado.
- Conversación multiturno y small talk sin uso de herramientas.
- Razonamiento extendido en preguntas difíciles, con o sin herramienta.
- Capacidades multilingües limitadas a portugués de Brasil e inglés.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Agentes de atención al cliente en portugués: el adaptador decide cuándo consultar información cambiante (tipos de cambio, horarios) y cuándo responder de memoria, reduciendo llamadas innecesarias a API externas.
- Asistentes con búsqueda web integrada: ante preguntas sobre hechos volátiles o locales, el modelo emite `web_search` y cita el resultado, lo que encaja en pipelines RAG ligeros.
- Automatización de cálculo verificable: para tareas matemáticas o de agregación de datos, invoca `python_sandbox` y valida el resultado, útil en herramientas internas de analítica.
- Chatbots conversacionales de bajo coste: al evitar búsquedas en preguntas triviales (0,0 % de falsos positivos reportados), reduce latencia y coste por consulta.
- Enrutador de intenciones en pipelines de agentes: puede actuar como clasificador de cuándo escalar a una herramienta frente a resolver localmente, con salida JSON parseable.
- Despliegue en local con Ollama o llama.cpp: la versión GGUF Q4_K_M permite ejecutar el modelo en hardware de consumo para prototipos de agentes en portugués.
- Evaluación de harness de agentes: el repositorio de referencia (`inference_loop.py`) ejecuta realmente las herramientas, lo que sirve como banco de pruebas para flujos de tool use.

## Benchmarks y rendimiento

Evaluación sobre 120 casos reservados (40 de `web_search`, 20 de `python_sandbox`, 60 sin herramienta), decodificación greedy, comparando la decisión de herramienta predicha con la esperada:

| Metrica | Modelo base | Adaptador |
|---|---|---|
| Accuracy | 0,850 | 0,875 |
| F1 de `web_search` | 0,833 | 0,841 |
| Precisión de `web_search` | no medida | 1,000 |
| Recall de `python_sandbox` | 0,700 | 0,800 |
| Falsos positivos (buscar en pregunta trivial) | 3,3 % | 0,0 % |
| JSON de tool call válido | no medido | 1,000 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base de 4B en precisión completa requiere aproximadamente 8-10 GB; en cuantización Q4_K_M (GGUF incluido) se sitúa en torno a 2,5-3 GB.
- GPU recomendadas: A100 o H100 para despliegue en producción a precisión completa; RTX 4090 o RTX 3090 para inferencia cómoda en FP16/BF16.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más usando la versión GGUF Q4_K_M (por ejemplo, RTX 3060, RTX 4060, Apple Silicon con memoria unificada).
- Opciones de despliegue: transformers + PEFT para el adaptador, llama.cpp u Ollama para el GGUF, y vLLM o TGI para servir el modelo fusionado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Qwen3-4B Tool-Judgment (este) | 4,02 B | no disponible | Adaptador LoRA para decisión de tool use en pt-BR/en | Apache 2.0 |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02 B | no disponible | Modelo generalista con tool calling | Apache 2.0 |
| Alternativas de 4B con tool use | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros adaptadores de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Errores semánticos que se ejecutan sin fallar no son detectados por ninguna comprobación determinista: fórmulas incorrectas que no lanzan excepción, redondeos variables entre ejecuciones o mala lectura de la magnitud de un resultado.
- Confabulación leve tras una búsqueda: el modelo puede añadir causas o detalles plausibles que no figuran en el resultado de la herramienta.
- Cobertura incompleta de temas del tipo "creo que sé la respuesta" (loterías, premios, realities), que pueden resolverse de memoria en lugar de con búsqueda.
- Solo probado en portugués de Brasil e inglés; otros idiomas no están validados.
- El techo de rendimiento es el esperado para un modelo de 4B entrenado con unos 450 ejemplos.
- La decodificación importa: se recomienda `do_sample=False` con `no_repeat_ngram_size=8`; el muestreo con temperatura alta introduce varianza y el greedy puro sin bloqueo de repetición puede entrar en bucles.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las limitaciones y sesgos del modelo base Qwen3-4B-Instruct-2507.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/devlucascfarias/qwen3-4b-tool-judgment
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del proyecto (harness de inferencia): https://github.com/devlucascfarias/Conatus-Phronesis
- Unsloth: https://github.com/unslothai/unsloth
