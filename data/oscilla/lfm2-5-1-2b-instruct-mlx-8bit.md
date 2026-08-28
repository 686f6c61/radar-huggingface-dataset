# Oscilla/LFM2.5-1.2B-Instruct-mlx-8Bit

## Resumen

El modelo Oscilla/LFM2.5-1.2B-Instruct-mlx-8Bit es una conversión al formato MLX del modelo LFM2.5-1.2B-Instruct desarrollado por Liquid AI. Este último es un modelo de lenguaje de pequeño tamaño (nominalmente 1.2B parámetros, aunque los pesos reales en safetensors suman 329 millones) diseñado específicamente para tareas de chat, instrucciones y tool calling en dispositivos de borde (edge). La conversión MLX permite ejecutarlo de forma eficiente en hardware Apple Silicon mediante la librería mlx-lm, manteniendo una cuantización de 8 bits que reduce el uso de memoria sin sacrificar demasiada precisión.

El modelo base fue entrenado con preentrenamiento extendido y refuerzo (RL), lo que le confiere una capacidad notable para seguir instrucciones y manejar conversaciones multi-turno. Su ventana de contexto alcanza los 128.000 tokens, un valor excepcional para un modelo de su tamaño. Soporta ocho idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano y español), lo que lo convierte en una opción atractiva para aplicaciones multilingües en entornos con recursos limitados. La licencia lfm1.0 impone restricciones de uso comercial, por lo que es adecuado principalmente para investigación y prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (Liquid Foundation Model), detalles internos no especificados |
| Parametros totales | 329.251.584 (según safetensors; el nombre comercial indica 1.2B) |
| Parametros activos | no disponible |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | MLX 8-bit (este repo); existen otras cuantizaciones (GGUF, etc.) para el modelo base |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | lfm1.0 (licencia propia de Liquid AI, con restricciones comerciales) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de detalles públicos sobre la arquitectura interna del modelo LFM2.5. Liquid AI describe sus modelos como "Liquid Foundation Models", que en versiones anteriores combinan atención lineal con mecanismos de mezcla de expertos (MoE), pero para esta variante concreta no se ha publicado información técnica específica. El nombre "1.2B" sugiere un modelo de ese tamaño nominal, aunque los pesos cuantificados en 8 bits suman 329M, lo que podría indicar un diseño con pesos compartidos o una arquitectura no estándar.

El entrenamiento incluyó una fase de preentrenamiento extendido seguida de aprendizaje por refuerzo (RL), según la documentación oficial de Liquid AI. No se han publicado detalles sobre el volumen de tokens, la composición del dataset ni las técnicas de alineación específicas (p. ej., RLHF o DPO). La conversión MLX se realizó con la versión 0.31.2 de mlx-lm, preservando la estructura original del modelo.

## Capacidades

- Generación de texto y chat conversacional multi-turno.
- Instrucciones complejas y seguimiento de órdenes con alta fidelidad.
- Tool calling / function calling para integración con APIs y agentes.
- Razonamiento multi-step básico, adecuado para tareas de lógica y planificación simple.
- Multilingüe: soporta 8 idiomas, incluyendo español, árabe, chino, francés, alemán, japonés y coreano.
- Ventana de contexto de 128K tokens, permitiendo manejar documentos largos y conversaciones extensas.
- Ejecución eficiente en hardware Apple Silicon mediante MLX, con baja latencia para inferencia en borde.

## Casos de uso

- Asistentes virtuales en dispositivos móviles o de escritorio: gracias a su tamaño reducido y a la cuantización 8-bit, puede ejecutarse localmente en un iPhone o Mac, ofreciendo respuestas rápidas sin conexión a internet.
- Atención al cliente automatizada: su ventana de 128K tokens permite procesar historiales completos de conversación y documentos de ayuda, manteniendo el contexto durante interacciones largas.
- Generación de código asistida en entornos de desarrollo: con tool calling, puede integrarse en editores de código o pipelines de CI/CD para sugerir funciones, revisar errores o autocompletar fragmentos.
- Traducción automática entre los 8 idiomas soportados: su capacidad multilingüe lo hace útil para traducir documentos o conversaciones en tiempo real en aplicaciones de mensajería.
- Análisis de documentos extensos: la ventana de 128K permite resumir o extraer información de informes, artículos o contratos completos sin necesidad de dividirlos.
- Prototipado de agentes conversacionales: para investigadores que necesitan un modelo ligero y rápido para experimentar con técnicas de prompting, RAG o fine-tuning, este modelo ofrece un equilibrio entre rendimiento y requisitos de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación oficial menciona un "rendimiento excepcional" en tareas de chat y tool calling, pero no se ofrecen cifras concretas (MMLU, HumanEval, GSM8K, etc.). Tampoco hay comparativas cuantitativas con otros modelos en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repo es de 1,2 GB, por lo que con cuantización 8-bit los pesos ocupan aproximadamente 1,2 GB. Añadiendo overhead de activaciones y caché KV, se recomienda al menos 2 GB de VRAM para una ejecución fluida.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, incluyendo tarjetas consumer como GTX 1650, RTX 2060, o integradas Apple Silicon (M1/M2/M3). También funciona en CPU con suficiente RAM.
- Cabe en GPUs consumer: sí, es uno de los modelos más ligeros en su categoría.
- Opciones de despliegue: mlx-lm para Apple Silicon, llama.cpp para CPU/GPU, vLLM o TGI para servidores, y Ollama si se convierte a GGUF.
- Latencia y throughput: al ser un modelo pequeño, la generación es rápida; en una GPU moderna se pueden alcanzar cientos de tokens por segundo, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-1.2B-Instruct (MLX 8-bit) | 329M (nominal 1.2B) | 128K | lfm1.0 (restrictiva) | Hugging Face |
| Qwen2.5-0.5B-Instruct | 0.5B | 32K | Apache 2.0 | Hugging Face |
| Phi-3-mini (3.8B) | 3.8B | 128K | MIT | Hugging Face |
| Gemma-2-2B | 2B | 8K | Gemma license | Hugging Face |

El modelo de Liquid AI ofrece una ventana de contexto muy superior a la de otros modelos de tamaño similar (Qwen2.5-0.5B tiene 32K, Gemma-2-2B solo 8K) y un soporte multilingüe más amplio. Sin embargo, su licencia lfm1.0 es más restrictiva que las alternativas open source (Apache, MIT). La comparación de rendimiento no es posible sin benchmarks publicados.

## Limitaciones y advertencias

- Licencia lfm1.0: no es una licencia open source estándar; restringe el uso comercial y puede imponer obligaciones específicas. Verificar los términos antes de usar en producción.
- Al ser un modelo pequeño (329M de pesos reales), puede tener más alucinaciones y menor precisión en razonamiento complejo que modelos más grandes.
- La información sobre arquitectura y entrenamiento es escasa; no se conocen los sesgos potenciales del dataset de entrenamiento.
- El soporte multilingüe incluye 8 idiomas, pero la calidad puede variar entre ellos; el español está incluido pero no se garantiza un rendimiento óptimo en todos los dialectos.
- La cuantización 8-bit puede degradar ligeramente la calidad en comparación con la versión completa en FP16, aunque la diferencia suele ser mínima.
- No hay garantía de que el modelo funcione correctamente con tool calling en todos los entornos; se recomienda probar exhaustivamente antes de integrarlo en sistemas críticos.

## Enlaces

- Repositorio Hugging Face del modelo convertido: https://huggingface.co/Oscilla/LFM2.5-1.2B-Instruct-mlx-8Bit
- Modelo base original: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Documentación oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-1.2b-instruct
- Página en OpenRouter (precios y benchmarks): https://openrouter.ai/liquid/lfm-2.5-1.2b-instruct
- Análisis de VRAM y compatibilidad: https://nodepedia.com/models/lfm2-5-1-2b-instruct-mlx-8bit/
