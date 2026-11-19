# saidutta69/Qwen2.5-0.5B-Instruct-heretic

## Resumen

Qwen2.5-0.5B-Instruct-heretic es una variante "decensored" (abliterated) del modelo Qwen2.5-0.5B-Instruct de Alibaba Qwen, publicada por el usuario saidutta69 (bajo el alias "RACER IS OP"). No es un fine-tune nuevo: se trata de los mismos pesos del modelo base con la dirección de rechazo eliminada mediante ablación direccional de pesos, una técnica conocida como abliteration e implementada con la herramienta Heretic 1.4.0. El objetivo es suprimir el comportamiento de rechazo del modelo original manteniendo, en la medida de lo posible, su conocimiento e instrucciones.

El modelo conserva la arquitectura transformer decoder-only de Qwen2 con 494.032.768 parámetros totales (aproximadamente 0,5B), lo que lo sitúa en la gama más baja de capacidad de la familia Qwen2.5. Su interés práctico radica en el tamaño: es lo bastante pequeño para inferencia en CPU, dispositivos edge o sistemas embebidos donde las variantes de 3B o 14B de la misma serie resultan demasiado pesadas. El autor lo presenta explícitamente como el miembro más pequeño de su serie heretic, con un techo de capacidad inherentemente menor.

La relevancia actual del modelo es doble: por un lado, demuestra la viabilidad de aplicar abliteration incluso a modelos muy pequeños con una divergencia KL mínima respecto al base (0,0447); por otro, su licencia qwen-research limita el uso comercial, y el propio autor advierte que la supresión de rechazos es deliberada y no va acompañada de ningún filtro de seguridad adicional. El repositorio incluye una escalera completa de cuantizaciones GGUF (hasta 20 según el autor) y los activos de reproducción del proceso de abliteration.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivado de Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (el autor menciona 20 cuants en el repo); pesos originales en BF16/FP16 |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-research (license: other, heredada del base) |
| Formato de pesos | safetensors (BF16/FP16) y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, idéntico en arquitectura al Qwen2.5-0.5B-Instruct original. No se ha realizado ningún entrenamiento adicional ni fine-tuning: el proceso consiste en una ablación direccional de pesos ("abliteration") ejecutada con Heretic 1.4.0, que identifica la dirección de rechazo en el espacio de activaciones y edita los pesos para eliminarla. Según la model card, la reproducción se realizó en el trial 194 de 200 con semilla RNG 3299272299, sobre hardware Apple M2 con backend MPS, PyTorch 2.12.1 y macOS 26.5.1.

La innovación técnica principal es precisamente esa edición selectiva de pesos en lugar de un fine-tune: el autor afirma que el conocimiento y el seguimiento de instrucciones del modelo base quedan en gran medida intactos, con una divergencia KL de 0,0447 respecto al base. El resultado medido en el arnés de rechazo de 100 prompts de Heretic es una caída de 83/100 rechazos en el base a 3/100 en esta variante. Los activos de reproducción completos están en el directorio `reproduce/` del repositorio.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat compatible con `apply_chat_template`.
- Seguimiento de instrucciones básico heredado del base Qwen2.5-0.5B-Instruct.
- Supresión deliberada del comportamiento de rechazo: responde a peticiones que el base rechazaría.
- Compatibilidad con pipelines de text-generation-inference y endpoints compatibles.
- Ejecución en llama.cpp, Ollama, LM Studio, Jan, vLLM y SGLang según la model card.
- Capacidad multilingüe: limitada al inglés según el campo `language` del repo.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.
- Razonamiento, código y matemáticas: no documentados específicamente; el autor advierte que el techo de capacidad a 0,5B es inherentemente bajo.

## Casos de uso

- Inferencia en CPU sin GPU: con cuantización Q4_K_M (398 MB) el modelo cabe en RAM de sistema y puede ejecutarse en portátiles modestos o servidores sin acelerador, útil para prototipos y pruebas de concepto.
- Despliegue en dispositivos edge o embebidos: el tamaño de ~0,4-0,5 GB en GGUF permite integración en Raspberry Pi, routers o sistemas con memoria muy limitada donde un modelo de 3B no cabría.
- Generación de texto creativo sin restricciones de contenido: el modelo responde a prompts que el base rechazaría, lo que puede interesar en investigación sobre alineación, red teaming o generación de ficción adulta dentro de un marco legal.
- Investigación sobre abliteration: el repositorio incluye los activos de reproducción (`reproduce/reproduce.json`) y los parámetros exactos (trial 194/200, semilla), lo que lo convierte en un caso de estudio reproducible para estudiar la técnica en modelos pequeños.
- Evaluación comparativa de seguridad: sirve como contrapunto controlado frente al base para medir el impacto de la supresión de rechazos en benchmarks de seguridad y utilidad.
- Chatbot local experimental: con plantilla de chat y ejecución vía Ollama o LM Studio, puede montarse un asistente conversacional en inglés totalmente offline para uso personal.
- Docencia y demostraciones: su reducido tamaño permite mostrar el funcionamiento de un LLM y de técnicas de edición de pesos en entornos con recursos mínimos.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen2.5-0.5B-Instruct (base) |
|---|---|---|
| Rechazos (de 100 prompts adversariales) | 3 | 83 |
| Divergencia KL respecto al base | 0,0447 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos medidos son los del arnés de rechazo de Heretic y la divergencia KL.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M ~398 MB de pesos; Q5_K_M ~420 MB; Q6_K ~510 MB; Q8_0 ~531 MB; F16 ~994 MB; safetensors BF16/FP16 ~988 MB. El autor recomienda añadir ~1 GB adicional para el contexto.
- GPU recomendadas según el autor: RTX 3060/4070/5070 (12 GB) para Q8_0; RTX 4060/3070 (8 GB) para Q6_K; GTX 1660 Super/2060/3050 laptop (6 GB) para Q5_K_M.
- Consumer GPU: sí, cabe holgadamente en cualquier GPU consumer moderna e incluso en tarjetas de 4-6 GB con cuantizaciones bajas.
- CPU-only y Apple Silicon: sí, con Q4_K_M (~0,40 GB) en RAM de sistema. El propio proceso de abliteration se ejecutó en un Apple M2 vía MPS.
- Opciones de despliegue: llama.cpp (`llama serve -hf saidutta69/Qwen2.5-0.5B-Instruct-heretic`), Ollama, LM Studio, Jan, vLLM, SGLang, transformers y text-generation-inference.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (0,5B), se espera latencia muy baja en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (100 prompts) | Licencia | Formatos |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct-heretic | 494 M | no disponible | 3/100 | qwen-research | safetensors, GGUF |
| Qwen2.5-0.5B-Instruct (base) | ~0,5 B | no disponible | 83/100 | qwen-research | safetensors, GGUF |
| Qwen2.5-3B-Instruct-heretic (mismo autor) | ~3 B | no disponible | no disponible | qwen-research | safetensors, GGUF |
| Qwen2.5-Coder-3B-Instruct-heretic (mismo autor) | ~3 B | no disponible | no disponible | qwen-research | safetensors, GGUF |

La comparación natural es con el base y con las variantes mayores de la misma serie heretic del autor, que ofrecen mayor capacidad a costa de más recursos. No se dispone de datos de benchmarks estándar para ninguno de ellos en la información proporcionada.

## Limitaciones y advertencias

- Fiabilidad factual limitada: a 0,5B parámetros el modelo alucina con facilidad, y el autor advierte explícitamente que la abliteration no mejora la corrección; el cumplimiento no es indicador de veracidad.
- Sin filtro de seguridad: la supresión de rechazos es deliberada y no hay capa de moderación. El modelo cumplirá peticiones que el base rechazaría, incluidas algunas que no debería.
- Licencia qwen-research: uso de investigación; las condiciones comerciales deben consultarse en el enlace de licencia del base. No es una licencia permisiva tipo Apache 2.0.
- Idioma: solo inglés según el campo `language`; el rendimiento en castellano no está garantizado ni documentado.
- Contexto: la longitud de contexto no se especifica en la información disponible; debe consultarse la ficha del modelo base.
- Sesgos: no documentados en la información proporcionada, pero heredados del base y potencialmente amplificados por la eliminación de rechazos.
- Producción: el autor recomienda no exponerlo en un endpoint público sin moderación para terceros.
- Capacidades avanzadas: no se documentan tool calling, agentes, visión ni modo thinking; no asumir su disponibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/saidutta69/Qwen2.5-0.5B-Instruct-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/main/LICENSE
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Variante 3B: https://huggingface.co/saidutta69/Qwen2.5-3B-Instruct-heretic
- Variante Coder 3B: https://huggingface.co/saidutta69/Qwen2.5-Coder-3B-Instruct-heretic
- Variante Coder 14B: https://huggingface.co/saidutta69/Qwen2.5-Coder-14B-Instruct-heretic
- Colección completa: https://huggingface.co/collections/saidutta69/racer-is-op-heretic-models
