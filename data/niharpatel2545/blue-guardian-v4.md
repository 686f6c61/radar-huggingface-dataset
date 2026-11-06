# niharpatel2545/blue-guardian-v4

## Resumen

blue-guardian-v4 es un clasificador de texto especializado en detectar prompt injection y jailbreaks antes de que un agente de IA procese contenido no confiable (paginas web, correos, documentos o mensajes de usuario). Lo desarrolla Nihar Patel como la mitad "detectora" del proyecto Blue Guardian, un sistema de guardrails que combina este modelo con una capa de reglas (permisos de herramientas, taint con aprobacion humana, kill switch y registro de auditoria).

Tecnicamente es un fine-tuning de jhu-clsp/mmBERT-base, un encoder multilingue de 307.531.778 parametros, sobre 69.156 textos (25.602 ataques y 43.554 normales) procedentes de diez datasets publicos. La tarea es de clasificacion binaria con dos etiquetas: `normal` (0) e `injection` (1), con umbral de decision 0,5 fijado en el conjunto de ajuste.

Su relevancia reside en el enfoque de evaluacion: el autor publica tasas de deteccion medidas con un 2% de falsos positivos sobre fuentes no vistas en entrenamiento, y reconoce explicitamente que queda por detras de ProtectAI deberta-v3-base-prompt-injection-v2 (76,5% frente a 83,4% de ataques detectados). Es una pieza util como capa de defensa adicional, no como solucion unica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/mmBERT-base) |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens en inferencia (entrenado con max length 256) |
| Tipos de cuantizacion | no disponible (pesos safetensors en bfloat16/float32; el autor reporta inferencia en bfloat16) |
| Idiomas soportados | Multilingue (evaluado en 8 idiomas; aleman y otras lenguas mas debiles) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto binaria (`normal` / `injection`) |
| Tamano del repositorio | 0,6 GB |
| Umbral de decision | 0,5 (definido en `guardian.json`) |

## Arquitectura y entrenamiento

El modelo parte de mmBERT-base, un encoder de la familia ModernBERT con atencion eficiente y soporte multilingue, y anade una cabeza de clasificacion binaria. Se entreno durante 3 epocas con learning rate 3e-5, batch de 16 y longitud maxima de 256 tokens sobre 69.156 textos: 25.602 ejemplos de ataque y 43.554 normales. Los conjuntos de entrenamiento, ajuste y test provienen de fuentes distintas, y se eliminaron de entrenamiento los duplicados exactos de textos de test.

Las fuentes de datos incluyen SPML Chatbot Prompt Injection (MIT), jackhhao jailbreak-classification (Apache-2.0), Microsoft LLMail-Inject fase 2 (MIT, 2.500 ataques y 2.500 correos normales), Databricks Dolly-15k (CC BY-SA 3.0, solo normales), yanismiraoui prompt_injections (Apache-2.0, ataques en 7 idiomas), neuralchemy Prompt-injection-dataset (Apache-2.0), OpenAssistant oasst2 (Apache-2.0, normales multilingues), OR-Bench 80k (CC BY 4.0), XSTest (CC BY 4.0), Lakera Mosscap (MIT) y Lakera Gandalf summarization (MIT, ataques ocultos en documentos). El 10% de cada fuente anadida en v4 se reservo como conjunto de ajuste para elegir umbral y epoca. No se menciona RLHF ni DPO: es un fine-tuning supervisado de clasificacion.

## Capacidades

- Clasificacion binaria de texto: devuelve una puntuacion de probabilidad de que el texto sea un intento de prompt injection o jailbreak.
- Deteccion de ataques directos en mensajes de usuario y prompts de chatbot.
- Deteccion de ataques indirectos incrustados en documentos y resumenes (dataset Lakera Gandalf).
- Deteccion de jailbreaks en lenguaje natural y variantes multilingues (evaluado en 8 idiomas).
- Integracion con la libreria `blue-guardian` mediante `ModelDetector`, que devuelve un objeto `Detection` con score y flag.
- Uso directo con `transformers` a traves de `pipeline("text-classification")`.
- No genera texto, no hace tool calling ni razonamiento multi-paso: es exclusivamente un filtro de entrada.

## Casos de uso

- Filtrado previo de entradas en agentes LLM: colocar el detector antes del prompt del agente para bloquear o marcar contenido sospechoso de paginas web, correos o documentos recuperados por RAG, reduciendo el riesgo de inyeccion indirecta.
- Moderacion de mensajes de usuario en chatbots: clasificar cada mensaje entrante y derivar a revision humana o a una respuesta restringida cuando la puntuacion supere el umbral de 0,5.
- Guardrail en pipelines de correo automatizado: procesar correos entrantes con el modelo (entrenado con LLMail-Inject) antes de que un asistente los resuma o actue sobre ellos.
- Capa de defensa en sistemas multiagente: combinado con la capa de reglas de Blue Guardian (permisos de herramientas, taint y aprobacion humana), actuar como primera barrera cuando un agente lee resultados de herramientas de terceros.
- Analisis de documentos subidos por usuarios: detectar instrucciones ocultas en PDFs o textos antes de que un asistente los incorpore a su contexto.
- Investigacion en seguridad de IA: servir como baseline reproducible y multilingue para comparar tecnicas de deteccion de prompt injection, con conjuntos de evaluacion publicos (ShieldLM, InjecAgent, JailbreakBench).
- Despliegue en entornos con recursos limitados: al ser un encoder de 307M, puede ejecutarse en CPU (unos 33 ms por texto corto) o en GPU de consumo, lo que permite filtrar en tiempo real sin un LLM adicional.

## Benchmarks y rendimiento

Test fresco de 7.601 textos en 8 idiomas, con fuentes no usadas en entrenamiento (ShieldLM, S-Labs test split). La tasa de captura se mide con el umbral fijado para que el 2% de textos normales se marquen; los falsos positivos se miden al umbral propio del modelo.

| Modelo | Ataques detectados con 2% de falsos positivos | Falsos positivos a su umbral |
|---|---|---|
| Solo reglas (baseline de palabras clave) | 5,6% | 0,0% |
| blue-guardian-v2 (ModernBERT-base) | 36,0% | 2,5% |
| blue-guardian-v3 (mmBERT-base) | 45,1% | 10,8% |
| **blue-guardian-v4** | **76,5%** | **2,1%** |
| ProtectAI deberta-v3-base-prompt-injection-v2 | 83,4% | 0,1% |

Desglose por fuente para v4: S-Labs 84,9% detectado (1,4% falsos positivos), safeguard 87,8% (2,4%), jailbreaks in-the-wild 92,0%, prompts cotidianos de chatbot 2,1% de falsos positivos, peticiones inofensivas de JailbreakBench 18,5% de falsos positivos (5 de 27).

Rendimiento: 14,7 ms por texto en una GPU de portatil RTX 5070 Ti en bfloat16; unos 33 ms por texto corto en CPU de portatil.

## Requisitos de hardware

- VRAM estimada: alrededor de 0,6-1,2 GB en bfloat16 para los 307M de parametros, mas overhead de activaciones con contexto de 512 tokens; en float32, aproximadamente 1,2-2,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 4090, A100 o H100 quedan sobredimensionadas para este modelo y solo se justifican por volumen de peticiones.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (RTX 3060 en adelante) e incluso en iGPU con suficiente memoria compartida.
- CPU: viable para textos cortos (unos 33 ms por texto), adecuado para filtrado de baja latencia sin GPU.
- Opciones de despliegue: `transformers` con `pipeline`, la libreria `blue-guardian` (`pip install "blue-guardian[model]"`), y servidores de inferencia compatibles con modelos de clasificacion de Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 14,7 ms por texto en RTX 5070 Ti (bfloat16); 33 ms por texto corto en CPU. El throughput agregado depende del batching y no esta publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Deteccion (2% FP) | Falsos positivos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| blue-guardian-v4 | 307M | 512 tokens | 76,5% | 2,1% | CC BY-SA 4.0 | Hugging Face |
| ProtectAI deberta-v3-base-prompt-injection-v2 | no disponible en la informacion | no disponible | 83,4% | 0,1% | no disponible en la informacion | Hugging Face |
| blue-guardian-v3 | mmBERT-base | no disponible | 45,1% | 10,8% | no disponible en la informacion | Hugging Face |
| blue-guardian-v2 | ModernBERT-base | no disponible | 36,0% | 2,5% | no disponible en la informacion | Hugging Face |

ProtectAI deberta-v3-base-prompt-injection-v2 supera a v4 tanto en deteccion como en falsos positivos segun la propia evaluacion del autor; v4 se posiciona como alternativa multilingue con licencia CC BY-SA 4.0 y con una capa de reglas complementaria en el proyecto Blue Guardian.

## Limitaciones y advertencias

- Queda por detras del mejor modelo abierto comparable: ProtectAI detecta mas ataques (83,4% frente a 76,5%) con muchos menos falsos positivos (0,1% frente a 2,1%).
- Debil frente a ataques ocultos en la salida de herramientas de agentes: InjecAgent 21,5% detectado y tecnicas mixtas de harelix 21,9%. No debe usarse en solitario para inyecciones indirectas en resultados de herramientas; conviene combinarlo con la capa de reglas (taint, aprobaciones, allowlists).
- El test fresco esta parcialmente contaminado: las fuentes de entrenamiento de v4 se eligieron tras observar los errores de v3 en ese test, por lo que el 76,5% es una cota superior hasta evaluarlo en una fuente nunca usada.
- Rendimiento mas debil en aleman y otras lenguas (deepset, parcialmente en aleman: 35% detectado).
- Ningun detector captura todos los ataques; debe usarse para reducir riesgo, no para eliminarlo.
- Licencia CC BY-SA 4.0: impone atribucion y compartir-al-igual sobre las obras derivadas, lo que puede condicionar su uso comercial o su integracion en productos propietarios. El codigo de Blue Guardian es MIT, pero los pesos no.
- Riesgo de falsos positivos en peticiones inofensivas que suenan arriesgadas (18,5% en JailbreakBench harmless requests), lo que puede degradar la experiencia de usuario si se bloquea sin revision humana.
- No dispone de capacidades generativas ni de razonamiento: es un clasificador y no sustituye a un LLM en el pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niharpatel2545/blue-guardian-v4
- Repositorio del proyecto Blue Guardian: https://github.com/NiharPatel2545/Blue-Guardian
- Marcas de aprobacion de evaluacion (PASS_MARKS.md): https://github.com/NiharPatel2545/Blue-Guardian/blob/main/PASS_MARKS.md
- Modelo base jhu-clsp/mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
- ProtectAI deberta-v3-base-prompt-injection-v2 (comparativa): https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
