# aisingapore/Qwen-SEA-Guard-8B-2602

## Resumen

Qwen-SEA-Guard-8B-2602 es un modelo de moderación de seguridad diseñado específicamente para el contexto cultural del Sudeste Asiático (SEA). Desarrollado por el equipo de productos de IA de AI Singapore, forma parte de la colección SEA-Safeguard, construida sobre la familia SEA-LION. Su función principal es clasificar interacciones entre humanos y modelos de lenguaje como "safe" o "unsafe", tanto en texto como en contenido visual.

El modelo es un fine-tune del modelo base aisingapore/Qwen-SEA-LION-v4-8B-VL, entrenado con el dataset SEA-Guard mediante supervisión fina (SFT) usando Llama-Factory. Soporta un contexto de 128.000 tokens y está optimizado para los idiomas de la región: birmano, inglés, indonesio, malayo, tagalo, tamil, tailandés y vietnamita. Su licencia Apache-2.0 facilita su adopción comercial.

Es relevante ahora porque ofrece una alternativa regionalizada a los moderadores genéricos, adaptada a las normas culturales de SEA, un área que los modelos occidentales suelen tratar de forma deficiente. Su capacidad multimodal (texto + visión) lo hace útil para moderar contenido generado por IA en plataformas que incluyen imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (decoder multimodal) |
| Parametros totales | 8B (no se especifican exactos; base Qwen-SEA-LION-v4-8B-VL) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | bf16 (predeterminado), cuantizaciones adicionales no disponibles |
| Idiomas soportados | Birmano, ingles, indonesio, malayo, tagalo, tamil, tailandes y vietnamita |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-VL, un transformer multimodal que procesa texto e imágenes de forma conjunta. El tokenizador es el predeterminado de Qwen3-VL. Se entrenó mediante supervisión fina (SFT) sobre el dataset SEA-Guard, un conjunto diseñado para reflejar las normas de seguridad del Sudeste Asiático. No se especifican los detalles del dataset ni el número de tokens de entrenamiento. La técnica de entrenamiento fue full fine-tuning (no LoRA), como indica el tag "full" en la model card. El proceso se llevó a cabo con Llama-Factory.

La innovación principal es su enfoque regionalizado: en lugar de aplicar normas globales de seguridad, el modelo está calibrado para las sensibilidades culturales de los países del Sudeste Asiático, lo que reduce falsos positivos en temas locales y mejora la detección de contenido problemático en esos idiomas.

## Capacidades

- Clasificación binaria de seguridad en texto: devuelve "safe" o "unsafe" para prompts de usuario y respuestas de IA.
- Moderación multimodal: acepta imágenes junto con texto para clasificar contenido visual y textual.
- Soporte de contexto largo: ventana de 128K tokens permite analizar conversaciones extensas.
- Multilingüe para SEA: cubre 8 idiomas de la región, incluyendo tailandés, vietnamita y birmano, con comprensión cultural local.
- Inferencia rápida con vLLM: soportado para despliegue en producción.
- No requiere fine-tuning adicional ni in-context learning para su uso directo.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede analizar conversaciones de usuarios y respuestas de IA en tiempo real, clasificándolas como seguras o inseguras según normas culturales SEA, lo que es clave para redes sociales con usuarios de la región.
- Filtro de prompts en aplicaciones de IA generativa: antes de enviar un prompt a un LLM de propósito general, se puede usar este modelo para bloquear solicitudes que puedan generar contenido dañino o ilegal en países como Tailandia o Vietnam.
- Revisión de respuestas de chatbots: en despliegues de atención al cliente, se puede verificar automáticamente si la respuesta del asistente es segura y no discriminatoria, especialmente en temas sensibles como religión o etnia.
- Moderación de imágenes generadas por IA: gracias a su capacidad multimodal, puede clasificar si una imagen generada es apropiada para el público SEA, por ejemplo en aplicaciones de edición de fotos.
- Auditoría de modelos en producción: para empresas que despliegan LLMs en SEA, este modelo puede servir como guardrail de seguridad en pipelines de CI/CD, verificando que las respuestas del sistema no violen políticas locales.
- Investigación en seguridad de IA: como herramienta de evaluación para medir la robustez de otros modelos frente a prompts maliciosos en idiomas SEA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (el campo "results" está vacío en el modelo-index).

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB para inferencia en bf16 (8B parámetros, contexto 128K).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o superior, A100 40GB, H100 80GB para despliegue de alta concurrencia.
- Capacidad en consumer GPU: sí, cabe en GPUs de 24 GB con bf16. Con cuantización de 4 bits podría caber en 8 GB, pero no se han publicado versiones GGUF o AWQ.
- Opciones de despliegue: vLLM (soportado), transformers con `device_map="auto"`, FriendliAI para inferencia gestionada.
- Latencia y throughput: no se especifican, pero al ser un modelo de 8B, se esperan latencias de decenas de ms por consulta en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Capacidades |
|---|---|---|---|---|
| Qwen-SEA-Guard-8B-2602 | 8B | 128K | Apache-2.0 | Texto + imagen, multilingüe SEA |
| Llama-Guard-3 (Meta) | 8B | 8K | Llama 3 Community License | Texto, seguridad genérica |
| OpenAI Moderation API | No disponible | No disponible | API propietaria | Texto e imagen, pero no culturalmente SEA |

No hay datos de benchmarks comparativos disponibles. La principal diferencia es que Qwen-SEA-Guard está específicamente entrenado para el contexto cultural SEA y soporta 128K de contexto, mientras que Llama Guard tiene contexto menor y no es multimodal.

## Limitaciones y advertencias

- El modelo puede alucinar o generar clasificaciones erróneas; se recomienda supervisión humana en decisiones críticas.
- Sesgo cultural: está calibrado para SEA, por lo que puede clasificar contenido como "seguro" que sería inseguro en otros contextos culturales, o viceversa.
- La clasificación es binaria ("safe"/"unsafe"), sin matices ni niveles de severidad.
- No se han publicado datos de entrenamiento detallados, lo que limita la auditoría de sesgos.
- Aunque la licencia es Apache-2.0, el modelo base Qwen3-VL puede tener restricciones adicionales en su uso comercial; hay que verificar la licencia del modelo base.
- No se ha evaluado su rendimiento en benchmarks públicos, por lo que su precisión real es desconocida.
- En producción, es necesario probar con datos locales para evitar falsos positivos en contenido benigno de la región.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Qwen-SEA-Guard-8B-2602
- Colección SEA-Guard: https://huggingface.co/collections/aisingapore/sea-guard
- Documentación de SEA-LION: https://docs.sea-lion.ai/models/sea-guard
- GitHub (SEA-LION): https://github.com/aisingapore/sealion/blob/main/models/sea-guard/qwenNllama-sea-guard.md
- Paper de SEA-Guard (arXiv 2602.01618): https://arxiv.org/abs/2602.01618
- Paper de Qwen-SEA-LION v4 (arXiv 2512.05501): https://arxiv.org/abs/2512.05501
