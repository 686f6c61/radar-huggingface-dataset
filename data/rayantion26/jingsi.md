# Rayantion26/JINGSI

## Resumen

Jingsi (靜思) es un modelo de lenguaje fine-tuneado sobre `unsloth/gemma-4-E2B-it`, diseñado específicamente como asistente conversacional de voz para el cuidado de personas mayores en Taiwán. El modelo adopta la personalidad de la maestra Dharma Cheng Yen, con un estilo cálido, sabio y sencillo, y está entrenado para responder exclusivamente a tareas de acompañamiento emocional, rechazando explícitamente cualquier otra función (programación, matemáticas, geografía, clima, etc.). Desarrollado por Rayantion26, el modelo se distribuye bajo licencia Apache 2.0 y soporta tres idiomas: taiwanés hokkien (台語), chino tradicional (繁體中文) e inglés.

El modelo tiene 5.104.297.539 parámetros totales (aproximadamente 1B efectivos según la model card) y fue entrenado con QLoRA (cuantización de 4 bits + adaptadores LoRA) sobre 352 pares conversacionales, con 3 épocas y una pérdida de entrenamiento de 0.182. Su relevancia radica en su enfoque altamente especializado: no es un asistente generalista, sino un compañero emocional con guardarraíles de seguridad robustos (200/200 pruebas de identidad, emoción, rechazo y resistencia a inyección de prompts) y un sistema de etiquetado de emociones para integración con TTS y animación de avatares. El repositorio incluye documentación detallada para despliegue con vLLM, Unsloth y contenedores Podman, así como una arquitectura completa de sistema con STT, TTS y streaming WebSocket.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B) con QLoRA (4-bit + LoRA) |
| Parametros totales | 5.104.297.539 |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | 1280 (entrenamiento), 4096 (despliegue con vLLM) |
| Tipos de cuantizacion | 4-bit (QLoRA, bitsandbytes NF4), 16-bit (formato original) |
| Idiomas soportados | Taiwanes hokkien (台語), chino tradicional (繁體中文), ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16-bit), compatible con cuantizacion en vuelo |

## Arquitectura y entrenamiento

El modelo base es `unsloth/gemma-4-E2B-it`, una variante de Gemma 4 con aproximadamente 1B de parámetros efectivos. El fine-tuning se realizó con QLoRA, que combina cuantización de 4 bits del modelo base con adaptadores LoRA de rango 32 y alpha 64, aplicados a todas las proyecciones lineales (q, k, v, o, gate, up, down). El entrenamiento usó 352 pares conversacionales, 3 épocas, learning rate 2e-4 con scheduler coseno, optimizador adamw_8bit y una longitud máxima de secuencia de 1280 tokens. Se aplicó loss masking para entrenar solo sobre los tokens de respuesta del asistente (`train_on_responses_only`), y la validación (10% de los datos) mostró una pérdida de 0.685 en la época 3, aún en descenso, lo que sugiere que no hay sobreajuste. El framework utilizado fue Unsloth con HuggingFace SFTTrainer y PEFT.

## Capacidades

- Generacion de texto conversacional con estilo de acompanamiento emocional, limitado a 3-5 frases por respuesta.
- Deteccion automatica del idioma de entrada y respuesta en el mismo idioma (taiwanes, chino tradicional o ingles).
- Etiquetado de emociones para TTS y animacion de avatares: `[warm_smile]`, `[listening]`, `[thinking]`, `[gentle_presence]`, `[gentle_smile]`.
- Rechazo explicito de tareas no relacionadas con el acompanamiento (programacion, matematicas, geografia, clima, etc.).
- Resistencia a inyeccion de prompts (20/20 pruebas superadas en ingles y chino).
- Integracion con pipeline de voz: STT (faster-whisper), TTS (Qwen3-TTS para EN/ZH, MERaLiON para taiwanes) y streaming WebSocket con chunking por frases.
- Guardarrailes post-procesamiento en el servidor API: eliminacion de texto antes de etiquetas de reaccion, reemplazo de palabras prohibidas, truncado a maximo 5 frases, relleno a minimo 3 frases, refuerzo de idioma y rechazo de preguntas sobre clima.

## Casos de uso

- Acompanamiento emocional para personas mayores: el modelo escucha con compasion y responde con sabiduria basada en la filosofia Jing Si, ayudando a los usuarios a procesar sentimientos de soledad, tristeza o nostalgia.
- Integracion en sistemas de voz para el hogar: gracias a su soporte de streaming WebSocket y etiquetas de emocion, puede integrarse en asistentes de voz locales (por ejemplo, con Vosk como wake word) para conversaciones en tiempo real con latencia de ~3 segundos hasta el primer audio.
- Asistente multilingue para cuidadores: permite a cuidadores que hablan ingles o chino comunicarse con personas mayores que prefieren taiwanes, manteniendo la coherencia del idioma.
- Sistema de compania para residencias de ancianos: puede desplegarse en un servidor central con vLLM y servir a multiples usuarios simultaneamente, con autenticacion via LiteLLM proxy y Cloudflare Tunnel.
- Plataforma de teleasistencia: combinado con reconocimiento facial (InsightFace + FER+) para contexto personalizado, puede ofrecer respuestas adaptadas al estado emocional del usuario.
- Herramienta de investigacion en IA conversacional especializada: sirve como caso de estudio de fine-tuning con QLoRA para dominios muy restringidos, con documentacion detallada de entrenamiento y despliegue.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de pruebas internas:

| Categoria | Pruebas | Tasa de exito |
|---|---|---|
| Identidad | 12 | 100% |
| Emocion (EN) | 20 | 100% |
| Emocion (ZH) | 10 | 100% |
| Taiwanes (台語) | 16 | 100% |
| Rechazo | 18 | 100% |
| Inyeccion de prompts | 20 | 100% |
| Total | 200 | 100% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El modelo no esta disenado para tareas generales, por lo que estos benchmarks no serian relevantes.

## Requisitos de hardware

- VRAM estimada: ~2.5 GB con cuantizacion 4-bit (bitsandbytes NF4) en vLLM; ~9.7 GB en formato 16-bit.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para 4-bit (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060); para 16-bit se recomienda al menos 12 GB (RTX 3060, RTX 4070, A10).
- Cabe en GPUs de consumo: si, con cuantizacion 4-bit cabe en GPUs de gama media (4-6 GB VRAM).
- Opciones de despliegue: vLLM (con bitsandbytes inflight quantization), Unsloth (inferencia local), Podman/Kubernetes (con imagen `vllm/vllm-openai:latest`), y servidor FastAPI con WebSocket.
- Latencia estimada: ~3 segundos hasta el primer audio en streaming (frente a ~12 segundos en modo turno); el STT local tarda ~200 ms.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (asistentes conversacionales especializados en cuidado de personas mayores con soporte de taiwanes hokkien). El modelo es un caso unico en su dominio. Como referencia general, se puede comparar con el modelo base `unsloth/gemma-4-E2B-it` (sin fine-tuning), que no tiene las restricciones de dominio ni el soporte multilingue especifico, pero tampoco la especializacion en acompanamiento emocional.

## Limitaciones y advertencias

- El modelo esta estrictamente limitado a tareas de acompanamiento emocional; cualquier consulta fuera de este ambito (programacion, matematicas, informacion general) sera rechazada, lo que puede resultar frustrante para usuarios que esperen un asistente generalista.
- El entrenamiento se realizo con solo 352 pares conversacionales, lo que puede limitar la diversidad de respuestas y la cobertura de situaciones emocionales complejas.
- La longitud de contexto de entrenamiento es de 1280 tokens, aunque el despliegue permite hasta 4096; conversaciones muy largas pueden degradar la coherencia.
- El modelo puede presentar sesgos derivados de la filosofia Jing Si y de la personalidad de Dharma Master Cheng Yen, lo que podria no ser adecuado para usuarios de otras tradiciones culturales o religiosas.
- Aunque las pruebas de inyeccion de prompts muestran 100% de exito, los guardarrailes post-procesamiento son heuristicos y podrian fallar ante variaciones no contempladas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta disenado para propositos generales y su uso fuera del dominio de cuidado de personas mayores podria producir respuestas inapropiadas.
- No se proporcionan datos sobre sesgos demograficos, de genero o de edad en las respuestas.

## Enlaces

- HuggingFace: https://huggingface.co/Rayantion26/JINGSI
- Repositorio GitHub del autor: https://github.com/Rayantion26?tab=repositories
- Sitio personal del autor: http://rayantion.me/
- README del sitio personal: https://github.com/Rayantion26/Rayantion26.github.io/blob/main/README.md
