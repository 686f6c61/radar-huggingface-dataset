# Oscilla/LFM2-350M-mlx-4Bit

## Resumen

Oscilla/LFM2-350M-mlx-4Bit es una conversión al formato MLX del modelo LFM2-350M de Liquid AI, cuantizado a 4 bits. El modelo original, desarrollado por Liquid AI, es el más pequeño de la familia LFM2 y está diseñado específicamente para dispositivos edge con restricciones estrictas de memoria y cómputo. Esta versión MLX, creada por el usuario Oscilla, permite ejecutar el modelo en hardware Apple Silicon con un consumo de memoria muy reducido (0,2 GB en disco), lo que lo hace adecuado para aplicaciones de baja latencia en entornos locales.

La relevancia de este modelo radica en su tamaño compacto y su ventana de contexto de 125 000 tokens, una combinación poco habitual en modelos de esta escala. Aunque no se han publicado benchmarks oficiales, su arquitectura híbrida (bloques convolucionales alternados con atención completa, según la documentación de Liquid AI) y su soporte multilingüe lo convierten en una opción interesante para tareas de generación de texto en dispositivos con recursos limitados. La cuantización a 4 bits en formato MLX facilita su integración en ecosistemas de Apple, como Macs con chips M1 o superiores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (bloques convolucionales y atención completa, según documentación de Liquid AI; no se especifica detalle en la ficha) |
| Parametros totales | 350M (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 125 000 tokens (según llm-explorer.com) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | lfm1.0 (otra) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base LFM2-350M en la documentación proporcionada. Según la documentación de Liquid AI para la familia LFM2, los modelos combinan bloques convolucionales con bloques de atención completa, lo que reduce el tamaño de la caché KV y mantiene un uso de memoria estable a medida que crece el contexto. Sin embargo, no se confirma si esta descripción aplica exactamente a LFM2-350M.

En cuanto al entrenamiento, no se han publicado datos sobre el número de tokens, la composición del dataset o el uso de técnicas como RLHF o DPO. La conversión a MLX se realizó con la librería mlx-lm versión 0.31.2, y el archivo cuantizado a 4 bits ocupa 0,2 GB, frente a los 459 MB del modelo en bf16 (según la ficha de LFM2.5-230M, que es un modelo similar de la misma familia). No se indica si se aplicó alguna técnica de calibración durante la cuantización.

## Capacidades

- Generación de texto y conversación: el modelo está diseñado para tareas de text-generation y es compatible con plantillas de chat (chat template) según la documentación de MLX.
- Multilingüismo: soporta 8 idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano y español), lo que permite su uso en aplicaciones internacionales.
- Bajo consumo de recursos: con solo 0,2 GB de tamaño, puede ejecutarse en dispositivos con memoria limitada, como teléfonos o dispositivos IoT.
- Contexto largo: la ventana de 125 000 tokens es excepcional para un modelo de 350M, permitiendo procesar documentos extensos o mantener conversaciones de muchos turnos.
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso en la información disponible.

## Casos de uso

- Asistentes conversacionales en dispositivos edge: el modelo puede gestionar diálogos multi-turno con contexto largo gracias a su ventana de 125 000 tokens, manteniendo la privacidad al procesar localmente en un Mac o dispositivo móvil.
- Procesamiento de documentos extensos: su contexto amplio permite resumir o extraer información de informes, artículos o contratos de gran tamaño sin necesidad de dividirlos en fragmentos.
- Traducción automática en tiempo real: al soportar 8 idiomas, puede integrarse en aplicaciones de traducción que requieran baja latencia y funcionamiento sin conexión.
- Chatbots de atención al cliente en entornos con recursos limitados: su pequeño tamaño permite desplegarlo en servidores de bajo coste o en el propio dispositivo del usuario, reduciendo costes de infraestructura.
- Generación de contenido creativo en múltiples idiomas: adecuado para redactar borradores de correos, publicaciones o descripciones de productos en varios idiomas, con la ventaja de poder mantener un hilo argumental largo.
- Prototipado rápido de aplicaciones de IA: al ser ligero y fácil de ejecutar con mlx-lm, sirve para validar ideas o flujos de trabajo antes de migrar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo o su versión base.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,2 GB (tamaño del archivo cuantizado), aunque el consumo real puede variar ligeramente durante la inferencia.
- GPU recomendadas: cualquier Apple Silicon (M1, M2, M3 o superiores) con al menos 8 GB de RAM unificada para ejecutar el modelo junto con otras aplicaciones.
- Compatibilidad con GPU de consumo: no aplica directamente, ya que el formato MLX está optimizado para Apple Silicon; para GPUs NVIDIA se necesitaría una conversión a otro formato (por ejemplo, GGUF).
- Opciones de despliegue: mlx-lm (Python), compatible con el ecosistema MLX. No se menciona soporte para vLLM, llama.cpp u Ollama en esta versión específica.
- Latencia y throughput: no se han publicado datos concretos. Dado su tamaño, se espera una latencia muy baja en hardware Apple Silicon, pero no se puede cuantificar sin pruebas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Oscilla/LFM2-350M-mlx-4Bit | 350M | 125K | 4-bit MLX | lfm1.0 | safetensors |
| mlx-community/LFM2-350M-4bit | 350M | 125K (presumiblemente) | 4-bit MLX | lfm1.0 | safetensors |
| LiquidAI/LFM2-350M (base) | 350M | 125K (según documentación) | bf16 | lfm1.0 | safetensors |
| Oscilla/LFM2.5-230M-OptiQ-4bit | 230M | no disponible | 4-bit OptiQ | lfm1.0 | safetensors |

La comparativa se basa en datos públicos de las fichas de HuggingFace y la documentación de Liquid AI. No se dispone de resultados de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo pequeño: con 350M de parámetros, su capacidad de razonamiento complejo, matemáticas avanzadas o generación de código es limitada en comparación con modelos de mayor tamaño.
- Sesgos y alucinaciones: no se ha publicado información sobre evaluación de sesgos o tasas de alucinación. Como todo modelo de lenguaje, puede generar contenido incorrecto o sesgado.
- Licencia lfm1.0: es una licencia personalizada de Liquid AI. Antes de usar el modelo en producción, es necesario revisar los términos completos de la licencia, especialmente en lo relativo a uso comercial y redistribución.
- Dependencia de MLX: al estar en formato MLX, solo es ejecutable en ecosistemas Apple. Para otros entornos, se requiere una conversión adicional.
- Sin soporte de tool calling confirmado: no se ha verificado si el modelo soporta function calling o integración con agentes, lo que limita su uso en pipelines automatizados complejos.
- Fecha de creación futura: el modelo fue creado en agosto de 2026, lo que puede indicar que es una versión reciente o que la fecha es incorrecta; se recomienda verificar la vigencia de la documentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Oscilla/LFM2-350M-mlx-4Bit
- Modelo base (LiquidAI/LFM2-350M): https://huggingface.co/LiquidAI/LFM2-350M
- Documentación de LFM2-350M en Liquid Docs: https://docs.liquid.ai/lfm/models/lfm2-350m
- Modelo similar de mlx-community: https://huggingface.co/mlx-community/LFM2-350M-4bit
- Herramienta de comparación (llm-explorer): https://llm-explorer.com/model/mlx-community%2FLFM2-350M-4bit,4dQSGLmFNLf4L2xmeURQm2
