# 0xzknw/LFM2.5-1.2B-Thinking-Heretic-NX-Residual-Stream

## Resumen

LFM2.5-1.2B-Thinking-Heretic-NX-Residual-Stream es una edición conductual del modelo de razonamiento LFM2.5-1.2B-Thinking de Liquid AI, desarrollada por el investigador independiente 0xzknw. El objetivo de esta edición es eliminar de forma agresiva los rechazos falsos (false refusals) del modelo base, es decir, respuestas que se niegan a contestar peticiones legítimas o inofensivas, manteniendo al mismo tiempo el comportamiento general del original lo más intacto posible. El resultado es un modelo de 1.170 millones de parámetros en BF16, con una ventana de contexto de 32.768 tokens, que conserva las capacidades de razonamiento y tool calling del base pero con una tasa de rechazo mucho menor.

La relevancia de este modelo radica en su enfoque de edición quirúrgica de pesos: en lugar de un fine-tuning completo, utiliza el motor de edición Heretic NX con el perfil Residual-Stream, que modifica únicamente 19 sitios semánticos descubiertos por arquitectura a una escala de 0.78. Esto permite reducir a la mitad la divergencia KL respecto al comparador Heretic original, logrando una intervención más precisa y menos invasiva. El modelo se distribuye tanto en formato Transformers (safetensors BF16) como en GGUF BF16 para LM Studio y llama.cpp, y está pensado para despliegue en dispositivos con recursos limitados, aunque su tamaño BF16 lo hace algo más pesado que el base cuantizado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 híbrido (convolución + atención) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | BF16 (nativo y GGUF sin cuantizar) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | lfm-open-license-v1.0 |
| Formato de pesos | safetensors (BF16), GGUF (BF16) |

## Arquitectura y entrenamiento

El modelo base, LFM2.5-1.2B-Thinking, utiliza la arquitectura LFM2 de Liquid AI, un backbone híbrido que combina capas de convolución con atención, diseñado para ofrecer un equilibrio entre eficiencia computacional y capacidad de razonamiento. Está entrenado específicamente para tareas de razonamiento, con un enfoque en matemáticas, lógica y resolución de problemas multi-paso, y soporta tool calling y contexto largo de hasta 32K tokens.

La edición Heretic NX Residual-Stream no es un entrenamiento tradicional, sino una modificación de pesos en BF16 aplicada sobre el checkpoint oficial del base. El motor Heretic NX identifica direcciones en el espacio de activaciones residuales que correlacionan con el comportamiento de rechazo y las ajusta mediante una escala determinada (0.78 en este caso). El perfil Residual-Stream selecciona 19 sitios semánticos descubiertos por la propia arquitectura, y el protocolo PRIME valida la preservación de capacidades mediante evaluaciones deterministas. Según la model card, la edición logra reducir la tasa de marcadores de rechazo de 128/450 a 7/450 en XSTest, manteniendo una divergencia KL de solo 0.0701 en desarrollo y 0.0643 en holdout, aproximadamente la mitad que el comparador Heretic original.

## Capacidades

- Razonamiento multi-paso y cadena de pensamiento: hereda del base la capacidad de resolver problemas matemáticos y lógicos con pasos intermedios.
- Generación de texto conversacional: mantiene el estilo de diálogo del modelo base, con soporte para instrucciones y respuestas naturales.
- Tool calling / function calling: el base soporta invocación de herramientas, y esta edición conserva esa capacidad.
- Multilingüe: cubre 8 idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano y español).
- Contexto largo: ventana de 32.768 tokens, adecuada para documentos extensos o conversaciones multi-turno.
- Comportamiento sin rechazos falsos: la edición reduce drásticamente las negativas injustificadas, lo que la hace útil para dominios donde el base era demasiado restrictivo.
- Despliegue en edge: al ser un modelo de 1.2B, puede ejecutarse en dispositivos con memoria limitada, aunque en BF16 requiere más recursos que versiones cuantizadas.

## Casos de uso

- Asistentes de atención al cliente sin fricción: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 32K tokens) y, al eliminar rechazos falsos, responde a preguntas legítimas sobre productos, políticas o incidencias sin negarse injustificadamente.
- Generación de código en entornos de desarrollo: gracias al soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests o documentar APIs, evitando bloqueos por peticiones que el base consideraría "sensibles".
- Razonamiento matemático y lógico en educación: su capacidad de cadena de pensamiento permite explicar paso a paso la resolución de problemas, útil en plataformas de tutoría automatizada.
- Chatbots de nicho sin censura: para comunidades que requieren respuestas directas sobre temas controvertidos (siempre dentro de lo legal), este modelo ofrece una alternativa al base sin los rechazos excesivos.
- Procesamiento de documentos largos: con 32K de contexto, puede resumir informes, extraer información de contratos o analizar artículos científicos completos en un solo paso.
- Prototipado rápido de agentes conversacionales: al ser pequeño y ejecutable en una GPU consumer, permite iterar rápidamente en diseños de agentes con razonamiento y tool calling antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta edición concreta. La model card incluye una evaluación comparativa local entre el base oficial, un comparador Heretic y la versión Residual-Stream, con métricas específicas de rechazo y divergencia KL. Estos datos son útiles como evidencia de la intervención, pero no constituyen una suite de benchmarks general.

| Evaluacion | Base oficial | Heretic (pinned) | Residual-Stream |
| --- | ---: | ---: | ---: |
| Marcadores de rechazo (filas 0-103) | — | 3 / 104 | 3 / 104 |
| KL secuencia completa (desarrollo) | 0 | 0.1438 | 0.0701 |
| KL secuencia completa (holdout) | 0 | 0.1343 | 0.0643 |
| Total marcadores XSTest | 128 / 450 | 15 / 450 | 7 / 450 |
| Marcadores seguros XSTest | 15 / 250 | 4 / 250 | 1 / 250 |
| Check MCQ pareado (241 filas) | 24.1% | 23.7% | 25.7% |

La prueba MCQ pareada (ARC-Challenge, HellaSwag y MMLU) superó el margen de no-inferioridad preregistrado de 3 puntos porcentuales, lo que indica que la edición no degrada significativamente las capacidades generales.

## Requisitos de hardware

- VRAM estimada: el checkpoint BF16 ocupa aproximadamente 2,3 GB (1.170.340.608 parámetros × 2 bytes). Con contexto de 4096 tokens, la VRAM total necesaria ronda los 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una RTX 3060, RTX 4060 o superior. En la máquina de desarrollo se cargó con full GPU offload a 4096 tokens.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y alta. También puede ejecutarse en CPU con llama.cpp, aunque con menor velocidad.
- Opciones de despliegue: Transformers (con `transformers>=5.0`), LM Studio (importando el GGUF), llama.cpp, vLLM (el base es compatible según recipes.vllm.ai).
- Rendimiento: en la prueba de humo del autor, se obtuvo 75,77 tokens/s con full GPU offload a 4096 tokens de contexto. La latencia real depende del hardware y la versión del runtime.

## Comparativa con modelos similares

La comparación más directa es con el modelo base LFM2.5-1.2B-Thinking, del cual deriva. No se dispone de datos de otros modelos de la misma categoría (p. ej., Qwen2.5-1.5B-Instruct, Gemma-2-2B) en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Notas |
| --- | ---: | ---: | --- | --- |
| LFM2.5-1.2B-Thinking (base) | 1.17B | 32K | lfm-open-license-v1.0 | Modelo original de Liquid AI, con rechazos frecuentes |
| LFM2.5-1.2B-Thinking-Heretic-NX-Residual-Stream | 1.17B | 32K | lfm-open-license-v1.0 | Edición conductual con rechazos reducidos, misma arquitectura |
| Otros modelos 1-2B (Qwen, Gemma) | no disponible | no disponible | no disponible | Sin datos comparativos en la información disponible |

## Limitaciones y advertencias

- La edición debilita intencionadamente el comportamiento de rechazo, lo que puede aumentar el cumplimiento de solicitudes inseguras, ilegales, incorrectas o dañinas. No añade factualidad, límites de seguridad ni juicio fiable.
- El modelo no ha sido evaluado con benchmarks estándar; los resultados de la model card son comparaciones locales y no deben interpretarse como un respaldo universal de calidad.
- El GGUF BF16 incluido no está cuantizado; las variantes Q8/Q6/Q4 no se proporcionan y requerirían su propia evaluación.
- La licencia LFM Open License v1.0 puede imponer restricciones de uso comercial; es necesario revisar los términos completos antes de desplegar en producción.
- El modelo puede alucinar o generar contenido incorrecto, especialmente en dominios especializados. Se recomienda ejecutar las generaciones en un sandbox y aplicar salvaguardas a nivel de aplicación.
- El soporte multilingüe está limitado a 8 idiomas; el rendimiento fuera de esos idiomas no está garantizado.

## Enlaces

- [HuggingFace - 0xzknw/LFM2.5-1.2B-Thinking-Heretic-NX-Residual-Stream](https://huggingface.co/0xzknw/LFM2.5-1.2B-Thinking-Heretic-NX-Residual-Stream)
- [HuggingFace - LiquidAI/LFM2.5-1.2B-Thinking (modelo base)](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking)
- [Blog de Liquid AI - LFM2.5-1.2B-Thinking: On-Device Reasoning Under 1GB](https://www.liquid.ai/blog/lfm2-5-1-2b-thinking-on-device-reasoning-under-1gb)
- [Documentación de Liquid - LFM2.5-1.2B-Thinking](https://docs.liquid.ai/lfm/models/lfm25-1.2b-thinking)
- [vLLM Recipes - LiquidAI/LFM2.5-1.2B-Thinking](https://recipes.vllm.ai/LiquidAI/LFM2.5-1.2B-Thinking)
- [Repositorio GitHub de Heretic NX (motor de edición)](https://github.com/0xZKnw/heretic-nx/tree/2147c09c5464df26b5855e19affa1b2b4b515dd3)
