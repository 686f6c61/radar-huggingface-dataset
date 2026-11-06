# nekonishin/LFM3-1.7B-Uncensored-GGUF

## Resumen

LFM3-1.7B-Uncensored-GGUF es una cuantización en formato GGUF del modelo LiquidAI/LFM3-1.7B, publicada por el usuario nekonishin y producida por el equipo de Atomic Chat. El modelo base, desarrollado por Liquid AI, es un transformer de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones) orientado a generación de texto conversacional. Esta variante concreta aplica una ablación de seguridad sobre los pesos antes de cuantizar, de modo que el modelo deja de rechazar peticiones dañinas.

La modificación consiste en un LoRA de rango 1 proyectado, cuya dirección se calcula como la diferencia entre las activaciones medias de prompts dañinos y las de prompts inofensivos, eliminando la componente inofensiva. Ese vector se incorpora directamente en los pesos con un factor W*=2.0 y posteriormente se aplica cuantización AD (adaptive quantization). El resultado es un modelo que mantiene las capacidades del original según las mediciones del autor, pero con un comportamiento de rechazo prácticamente nulo.

Es relevante porque demuestra que es posible eliminar los rechazos de seguridad de un modelo pequeño con un coste mínimo en calidad medible (sin caída en MMLU según la prueba de McNemar), y porque ofrece dos niveles de cuantización listos para ejecutarse en llama.cpp en hardware de consumo. El contexto, los idiomas y la licencia heredan las condiciones del modelo base de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B); pesos cuantizados en GGUF |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AD-Q6_K (7,31 bpw) y AD-Q4_K_M (5,20 bpw); cuantización adaptativa (AD) con imatrix |
| Idiomas soportados | en, zh, de |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer de 1,7 mil millones de parámetros de Liquid AI. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo fases de RLHF o DPO en el modelo original. Lo que sí se documenta es el proceso de modificación: se calcula un LoRA de rango 1 cuya dirección es la diferencia entre la media de activaciones ante prompts dañinos y la media ante prompts inofensivos, con la componente inofensiva proyectada fuera. Ese vector se integra en los pesos con un factor de escala W*=2.0 y a continuación se aplica cuantización adaptativa (AD) con imatrix.

El autor reporta que una edición aleatoria del mismo tamaño habría reducido MMLU en 1,3 puntos porcentuales y producido un ΔKLD mayor (0,028), mientras que la dirección dirigida mantiene MMLU y arroja un ΔKLD de +0,019 frente al base en prompts neutros. También se verifican comprobaciones de bucles de razonamiento (thinking-loop) y de salidas vacías en W*=2.0. La inferencia requiere una compilación de llama.cpp con soporte para LFM3 (merge en llama.cpp #31252, generado en el commit 19cce69).

## Capacidades

- Generación de texto conversacional multi-turno (pipeline text-generation, tag conversational).
- Razonamiento y respuesta a preguntas de conocimiento general, con MMLU medido en 41,0% sobre 2000 preguntas.
- Recuperación en contexto largo: la prueba needle supera 3/3 casos.
- Capacidades multilingües limitadas a inglés, chino y alemán según los metadatos.
- Comportamiento sin rechazos: 0,0% de rechazos ante prompts dañinos y 0,0% de falsos rechazos en XSTest.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Generación de texto creativo sin filtros: el modelo responde a peticiones que el base rechazaría, lo que resulta útil en entornos de escritura de ficción, guiones o roleplay donde los rechazos interrumpen el flujo. Su tamaño de 1,7B permite ejecutarlo localmente.
- Investigación sobre alineación y seguridad: sirve como caso de estudio reproducible de ablación de seguridad con métricas de daño controladas (ΔKLD, MMLU, XSTest), útil para comparar técnicas de edición de pesos.
- Asistentes conversacionales locales y offline: con 1,1 GB en AD-Q4_K_M puede desplegarse en portátiles y equipos sin GPU dedicada mediante llama.cpp, manteniendo conversaciones multi-turno.
- Procesamiento de documentos en contexto largo: la prueba needle 3/3 sugiere que conserva capacidad de recuperación en ventanas extensas, aprovechable para resumen o extracción sobre textos largos.
- Evaluación comparativa de cuantizaciones: los dos niveles publicados (Q6_K y Q4_K_M) permiten medir el compromiso entre tamaño en disco y calidad en pipelines de prueba propios.
- Prototipado rápido en pipelines de CI: al ser GGUF y compatible con endpoints, puede integrarse en pruebas automatizadas de generación de texto sin depender de infraestructura GPU grande.

## Benchmarks y rendimiento

| Metrica | Base | Uncensored |
|---|---|---|
| Rechazos en prompts dañinos | 61,7% | 0,0% |
| Falsos rechazos (XSTest) | 5,2% | 0,0% |
| MMLU (2000 preguntas) | 41,0% | 41,0% (McNemar p=1,0) |
| Needle (contexto largo) | 3/3 | 3/3 |
| ΔKLD frente al base (neutro) | — | +0,019 |

No se han publicado otros resultados de benchmarks (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,6 GB en disco para AD-Q6_K y 1,1 GB para AD-Q4_K_M; la VRAM necesaria en inferencia es del mismo orden, más el overhead de contexto.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o más de VRAM puede ejecutar la variante Q4_K_M; con 6-8 GB se puede usar Q6_K con contexto amplio.
- Funciona también en CPU mediante llama.cpp, dado el tamaño reducido del modelo.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues de mayor concurrencia; no se requieren aceleradores de gama alta.
- Opciones de despliegue: llama.cpp (requiere build con soporte LFM3, merge #31252), y por extensión cualquier frontend compatible con GGUF. No se documenta soporte en vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Uncensored-GGUF (este) | 1,73B | no disponible | LFM Open License v1.0 | GGUF (Q6_K, Q4_K_M) | Sin rechazos, MMLU 41,0% |
| LiquidAI/LFM3-1.7B (base) | 1,73B | no disponible | LFM Open License v1.0 | safetensors | Rechazos 61,7%, MMLU 41,0% |
| Alternativas de ~1,7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La única comparación con datos medidos es frente al modelo base, que comparte arquitectura y tamaño pero mantiene los rechazos de seguridad. No se dispone de información sobre otros modelos de la misma categoría para una comparativa cuantitativa.

## Limitaciones y advertencias

- Elimina por completo los rechazos de seguridad (0,0% en prompts dañinos), lo que implica riesgo de generar contenido dañino, ilegal o no apto para producción sin moderación externa.
- La licencia LFM Open License v1.0 impone condiciones específicas de uso comercial que deben revisarse en el enlace de licencia del modelo base antes de desplegarlo.
- Idiomas limitados a inglés, chino y alemán; no se garantiza calidad en castellano.
- Longitud de contexto no documentada; la prueba needle 3/3 es una evidencia limitada y no sustituye a una evaluación exhaustiva de contexto largo.
- Riesgo de alucinación inherente a un modelo de 1,7B; MMLU de 41,0% indica capacidad de conocimiento general moderada.
- Requiere una compilación específica de llama.cpp con soporte LFM3; versiones antiguas no cargarán los pesos.
- El repositorio no registra descargas ni likes, por lo que no hay validación comunitaria del comportamiento en producción.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines que dependan de llamadas a funciones.

## Enlaces

- Hugging Face: https://huggingface.co/nekonishin/LFM3-1.7B-Uncensored-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Atomic Chat: https://atomic.chat/
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- X de Atomic Chat: https://x.com/atomic_chat_hq
- Pull request de soporte LFM3 en llama.cpp: #31252 (referenciado en la model card)
