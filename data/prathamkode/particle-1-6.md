# prathamkode/particle-1.6

## Resumen

Particle 1.6 es un modelo de lenguaje conversacional compacto de aproximadamente 109,5 millones de parámetros, desarrollado por Pratham Kode (prathamkode) y publicado en Hugging Face. Se trata de un modelo entrenado desde cero (random initialization) con arquitectura estilo Llama, que no es un fine-tune de ningún checkpoint público existente. Su propósito declarado es servir como objeto de estudio para investigar el entrenamiento de modelos a escala pequeña, así como para evaluación y demos educativas.

Este lanzamiento aplica una segunda pasada de supervisión fina (SFT) sobre un dataset interno de instrucciones, pero el propio autor reconoce que dicha pasada no produjo la mejora esperada en fiabilidad y consistencia factual. A pesar de ello, el modelo puede mantener conversaciones cotidianas sencillas, aunque no alcanza el nivel de calidad necesario para un asistente de propósito general. Los pesos se liberan bajo licencia MIT, lo que permite uso comercial y modificación sin restricciones significativas, aunque el autor desaconseja su uso en producción.

La relevancia de Particle 1.6 radica en su transparencia: al ser un modelo pequeño, entrenado desde cero y con documentación honesta sobre sus limitaciones, resulta útil para la comunidad que estudia dinámicas de entrenamiento, efectos de SFT en modelos pequeños y comparaciones de arquitecturas. Su tamaño reducido permite ejecutarlo en hardware modesto, incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (RoPE, SwiGLU, RMSNorm) |
| Parametros totales | 109.529.856 (109,5M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | bfloat16 (pesos originales); no se documentan cuantizaciones adicionales |
| Idiomas soportados | Ingles (centrado en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Particle 1.6 utiliza una arquitectura de decoder transformer estilo Llama, con 12 capas, dimension oculta de 768 y 12 cabezas de atencion. Emplea rotary positional embeddings (RoPE), activacion SwiGLU y normalizacion RMSNorm. El tokenizador es un BPE byte-level personalizado con un vocabulario de 32.000 tokens. El modelo opera en precision bfloat16.

El entrenamiento se realizo en dos fases. Primero, un pretraining sobre aproximadamente 2.000 millones de tokens de texto educativo web publico, que constituye la misma base que el modelo Particle 1.0. Segundo, una supervisacion fina (SFT) sobre un dataset interno de instrucciones, disenado para mejorar respuestas cortas y utiles. El autor indica que esta segunda pasada no cumplio las expectativas de calidad, por lo que el modelo se comparte principalmente con fines de inspeccion, reproduccion y comparacion con Particle 1.0. No se ha publicado el dataset de SFT ni los detalles del corpus de pretraining.

## Capacidades

- Generacion de texto conversacional: puede mantener dialogos sencillos y responder a preguntas cotidianas, aunque con limitaciones de coherencia y exactitud.
- Chat basico: soporta el formato de mensajes con roles (user, assistant) mediante la plantilla de chat de transformers.
- Capacidad multilingue limitada: el modelo esta centrado en ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Sin soporte de tool calling ni function calling: la arquitectura y el entrenamiento no incluyen capacidades de invocacion de herramientas.
- Sin capacidades de razonamiento avanzado: el autor advierte que el modelo es debil en tareas de razonamiento, contexto largo y uso de herramientas.
- Sin capacidades multimodales: no procesa vision, audio ni otros tipos de entrada mas alla de texto.

## Casos de uso

- Estudio de entrenamiento desde cero: investigadores pueden analizar los pesos y el comportamiento de un modelo de 100M entrenado desde inicializacion aleatoria, comparandolo con otros modelos de tamano similar.
- Evaluacion de tecnicas de SFT: dado que el autor documenta que la segunda pasada de SFT no mejoro el rendimiento, el modelo sirve como caso de estudio para entender los limites del fine-tuning supervisado en modelos pequenos.
- Demos educativas de chat: se puede desplegar en entornos de aprendizaje para ilustrar el funcionamiento basico de un modelo generativo de texto, sin necesidad de hardware potente.
- Experimentos de alineacion y seguridad: al carecer de preference tuning, es un candidato para probar tecnicas de alineacion posterior (por ejemplo, RLHF o DPO) sobre un modelo base pequeno.
- Comparacion de arquitecturas: al compartir base con Particle 1.0, permite aislar el efecto del SFT adicional y comparar arquitecturas similares a escala reducida.
- Prototipos de bajo coste: para aplicaciones internas de investigacion donde no se requiera alta fiabilidad, puede servir como punto de partida para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni otros evaluaciones estandar. La unica indicacion cualitativa es que el rendimiento en conversacion cotidiana es aceptable, pero la fiabilidad factual y la consistencia son insuficientes para un asistente general.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 219 MB (109,5M parametros × 2 bytes). Con overhead de activaciones y cache, se puede ejecutar con menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tambien es viable su ejecucion en CPU con RAM moderada (4 GB o mas).
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU consumer moderna (GTX 1060, RTX 2060, etc.) e incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: transformers (Hugging Face), vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y cualquier framework compatible con modelos de tipo Llama.
- Latencia y throughput: al ser un modelo pequeno, la generacion es muy rapida. En GPU, se pueden obtener cientos de tokens por segundo; en CPU, decenas de tokens por segundo, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Arquitectura | Notas |
|---|---|---|---|---|---|
| Particle 1.6 | 109,5M | 2048 | MIT | Llama-style | Entrenado desde cero, SFT adicional |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | Llama-style | Modelo pequeno de Hugging Face, entrenado con datos diversos |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Llama-style | Modelo mas grande, con mejor rendimiento general |
| Qwen2.5-0.5B | 0,5B | 32k | Apache 2.0 | Transformer | Contexto largo, soporte multilingue |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada. La comparacion se limita a especificaciones tecnicas.

## Limitaciones y advertencias

- Capacidad pequena: el modelo es debil en razonamiento, manejo de contexto largo y uso de herramientas.
- Alucinaciones y contradicciones: puede generar informacion falsa o contradecirse a si mismo, especialmente en temas factuales.
- Centrado en ingles: no se recomienda su uso en otros idiomas.
- Sin alineamiento de preferencias ni seguridad: no se aplicaron tecnicas de RLHF/DPO ni filtros de seguridad mas alla del SFT.
- La segunda pasada de SFT no mejoro el rendimiento esperado: el autor lo indica explicitamente, por lo que el modelo puede no ser mejor que Particle 1.0 en ciertos aspectos.
- No apto para produccion: el autor desaconseja su uso como asistente de produccion, fuente de hechos o modelo de codigo.
- Datos de entrenamiento no publicados: el dataset de SFT y el corpus de pretraining no estan disponibles, lo que limita la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prathamkode/particle-1.6
- Modelo base Particle 1.0: https://huggingface.co/prathamkode/particle-1.0
- Espacio de chat demo: https://huggingface.co/prathamkode/spaces (Particle Chat)
- Pagina de FriendliAI para particle-1.0: https://friendli.ai/models/prathamkode/particle-1.0
- Perfil del autor en Hugging Face: https://huggingface.co/prathamkode
- Perfil del autor en X: https://x.com/PrathamKode
