# npario/Qwen3.8-27B-OBLITERATED-OptiQ-4bit

## Resumen

El modelo Qwen3.8-27B-OBLITERATED-OptiQ-4bit es una cuantización mixta de precisión (4/8-bit) del modelo base OBLITERATUS/Qwen3.8-27B-OBLITERATED, publicada por el usuario npario. Se trata de una variante de la familia Qwen3.8 de 27B, que incorpora una torre de visión y un cabezal de predicción multi-token (MTP) para acelerar la generación. El modelo está diseñado para ejecutarse localmente en Apple Silicon mediante MLX, y su característica principal es que el modelo base ha sido "obliterated" (sin censura), con una tasa de rechazo del 0% en un conjunto de prompts dañinos según la información disponible.

El proceso de cuantización OptiQ asigna dinámicamente 4 u 8 bits por capa según su sensibilidad, manteniendo la torre de visión en bf16 y el cabezal MTP en un archivo separado. Esto reduce el tamaño en disco a 21 GB y permite ejecutarse en Macs con memoria unificada suficiente. Es relevante para desarrolladores que buscan un modelo multimodal local con capacidades de razonamiento, tool calling y agentes, sin necesidad de servicios cloud.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con cabezal MTP (familia Qwen3.8) |
| Parametros totales | 26.895.993.856 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (etiquetado como long-context) |
| Tipos de cuantizacion | OptiQ mixta por capas: 237 componentes a 4-bit, 261 a 8-bit, group size 64 |
| Idiomas soportados | Inglés (declarado) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX), con sidecars para MTP y visión |

## Arquitectura y entrenamiento

El modelo es una cuantización OptiQ del base OBLITERATUS/Qwen3.8-27B-OBLITERATED. La arquitectura subyacente es la de Qwen3.8, un transformer multimodal que incluye una torre de visión en bf16 y un cabezal de predicción multi-token (MTP) para acelerar la decodificación. El proceso de "obliteration" del modelo base, según publicaciones externas, reduce la tasa de rechazo al 0% en un conjunto de 842 prompts dañinos, con un enfoque adicional en ciberseguridad, generación de jailbreaks y capacidades de IA complejas.

La cuantización OptiQ asigna el ancho de bits por capa según su sensibilidad: 237 componentes se cuantizan a 4-bit y 261 a 8-bit, con un group size de 64. La receta de bits se reutiliza de la versión Qwen3.8-27B-OptiQ-4bit de la comunidad MLX, ya que la arquitectura es idéntica, evitando un barrido de sensibilidad específico. El cabezal MTP y la torre de visión se conservan en mayor precisión para no degradar sus funciones.

## Capacidades

- Generación de texto y razonamiento: es un modelo de razonamiento que requiere un presupuesto de tokens generoso.
- Comprensión de imágenes: soporta entradas de imagen (pipeline image-text-to-text) gracias a la torre de visión en bf16.
- Function calling y tool use: etiquetado como funcional para tool calling y uso de herramientas.
- Agentes y razonamiento multi-paso: etiquetado como agentic y multi-token prediction (MTP).
- Predicción multi-token (MTP): incluye un cabezal de especulación MTP para acelerar la generación.
- Respuestas sin censura: el modelo base presenta una tasa de rechazo del 0% en un conjunto de prompts dañinos, lo que permite respuestas sin restricciones.
- Compatibilidad con APIs: se puede servir con un endpoint compatible con OpenAI y Anthropic mediante `optiq serve`.
- Contexto largo: etiquetado como long-context, aunque no se especifica la longitud exacta.

## Casos de uso

- Asistente multimodal local en Mac: el modelo puede analizar imágenes y generar descripciones o respuestas contextuales directamente en un Mac con Apple Silicon, sin depender de servicios cloud.
- Agente automatizado con herramientas: gracias al soporte de function calling y tool use, puede integrarse en flujos de trabajo que requieren llamadas a APIs externas, consultas a bases de datos o ejecución de tareas en sistemas.
- Análisis de razonamiento complejo: al ser un modelo de razonamiento, es adecuado para tareas de planificación, resolución de problemas multi-paso y generación de explicaciones detalladas.
- Prototipado de aplicaciones con API compatible OpenAI/Anthropic: con `optiq serve`, se puede levantar un endpoint local que permite probar integraciones existentes sin modificar el código del cliente.
- Investigación en seguridad y jailbreaks: el modelo "obliterated" puede utilizarse en entornos controlados para estudiar comportamientos de modelos sin censura o generar contenido para pruebas de robustez.
- Generación de contenido técnico y código: la familia Qwen3.8 tiene buenas capacidades en generación de código, y esta versión cuantizada permite ejecutarla en hardware de consumo para desarrollo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Diseñado para Apple Silicon mediante MLX, con soporte para Macs con chips M1, M2, M3 o M4.
- Tamaño en disco: 21 GB, por lo que se recomienda al menos 21 GB de memoria unificada para cargar el modelo.
- Se recomienda un Mac con 32 GB o más de memoria unificada para dejar margen para el KV cache y el runtime.
- Opciones de despliegue: `mlx_lm` para carga y generación, y `optiq serve` para un endpoint compatible con OpenAI/Anthropic.
- No es compatible con GPUs NVIDIA sin conversión a otro formato (por ejemplo, GGUF para llama.cpp).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos suficientes en la información proporcionada. El modelo es una variante cuantizada de la familia Qwen3.8 de 27B, con la diferencia de estar "obliterated" y cuantizado con OptiQ. La versión base sin cuantizar y la versión OptiQ estándar de la misma arquitectura son las referencias más cercanas, pero no se han publicado datos de contexto ni benchmarks en la información disponible.

## Limitaciones y advertencias

- Solo se declara el idioma inglés; no hay información sobre soporte multilingüe en la ficha.
- La longitud de contexto exacta no se especifica, a pesar de estar etiquetado como long-context.
- El modelo "obliterated" puede generar contenido dañino, ilegal o éticamente problemático, ya que no rechaza prompts peligrosos.
- Riesgo de alucinación: al ser un modelo de razonamiento, puede producir respuestas confiadas pero incorrectas.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado por un modelo sin censura puede acarrear responsabilidades legales o reputacionales.
- No hay benchmarks publicados, por lo que su rendimiento relativo frente a otros modelos de la misma categoría no puede evaluarse de forma objetiva.
- Para producción, es imprescindible implementar filtros de contenido y políticas de seguridad, especialmente en aplicaciones abiertas al público.

## Enlaces

- Modelo en HuggingFace: [npario/Qwen3.8-27B-OBLITERATED-OptiQ-4bit](https://huggingface.co/npario/Qwen3.8-27B-OBLITERATED-OptiQ-4bit)
- Modelo base: [OBLITERATUS/Qwen3.8-27B-OBLITERATED](https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED)
- Proyecto OptiQ: [mlx-optiq.com](https://mlx-optiq.com/)
- Lista de cuantizaciones OptiQ: [mlx-optiq.com/models](https://mlx-optiq.com/models)
- Versión comunitaria del modelo: [mlx-community/Qwen3.8-27B-OBLITERATED-OptiQ-4bit](https://huggingface.co/mlx-community/Qwen3.8-27B-OBLITERATED-OptiQ-4bit)
- Página de modelo GGUF en local-ai-zone: [Qwen3.8 27B Obliterated](https://local-ai-zone.github.io/models/qwen3-8-27b-obliterated.html)
- Blog sobre el modelo (explainx.ai): [Qwen3.8-27B OBLITERATED: 0% Refusal Rate](https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026)
