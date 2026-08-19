# nicolasramos/odooclaw-light-1.2b-ft

## Resumen

`odooclaw-light-1.2b-ft` es un fine-tune del modelo `LiquidAI/LFM2.5-1.2B-Instruct` (Liquid AI) desarrollado por nicolasramos para especializar el modelo en tool-calling y function-calling dentro del ERP Odoo. La versión v18, que reemplaza a la v8, está diseñada para que un asistente conversacional en español pueda invocar de forma fiable operaciones de negocio como creación de pedidos de venta, gestión de facturas, registro de pagos o búsqueda de partners, todo ello ejecutable en hardware local.

El modelo tiene 1.170.340.608 parámetros (~1,17B) y se distribuye en formato safetensors y GGUF (Q4_K_M), lo que permite servirlo con llama.cpp, Ollama u otros motores compatibles. Su relevancia radica en que ofrece una alternativa ligera y de código abierto (licencia Apache 2.0) para integrar IA generativa en flujos de trabajo ERP sin depender de APIs externas, con un peso en disco de aproximadamente 700 MB en cuantización Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heredada de LFM2.5-1.2B-Instruct (detalles no disponibles) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (documentado); otros no especificados |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (fused) y GGUF |

## Arquitectura y entrenamiento

La arquitectura base corresponde a `LFM2.5-1.2B-Instruct` de Liquid AI, un modelo de 1,2B parámetros orientado a instrucciones, aunque la documentación del fine-tune no detalla la arquitectura interna (tipo de atención, capas, etc.). El entrenamiento del fine-tune se realizó con QLoRA en 4 bits durante 2 épocas sobre un dataset balanceado de 49.301 ejemplos, con una pérdida de entrenamiento de 0,0665. El dataset está compuesto por tareas de tool-calling específicas de Odoo: texto conversacional (32%), búsquedas (14%), creación de pedidos de venta (9%), facturas pendientes (9%), creación de leads (7%), creación de tareas (6%), cancelación de facturas (6%), creación genérica (5%), creación de facturas de proveedor (5%), registro de pagos (4,4%) y búsqueda de partners (2,5%). La distribución balanceada del entrenamiento corrige el desajuste observado en la versión v8 y mejora significativamente la robustez en conversaciones multi-turno.

## Capacidades

- Generación de texto conversacional en español con soporte de contexto multi-turno.
- Tool-calling y function-calling específico para operaciones de Odoo ERP: `search`, `create_sale_order`, `find_pending_invoices`, `create_lead`, `create_task`, `cancel_invoice`, `create`, `create_vendor_invoice`, `register_payment`, `find_partner`.
- Respuesta directa en formato `<tool_call>` sin necesidad de modo `thinking`, lo que reduce latencia y simplifica la integración.
- Compatible con llama.cpp, Ollama y servidores compatibles con endpoints (endpoints_compatible).
- Entrenado exclusivamente en español, lo que lo hace adecuado para despliegues en entornos hispanohablantes.

## Casos de uso

- Atención al cliente automatizada en Odoo: el modelo gestiona conversaciones multi-turno y ejecuta búsquedas de partners o facturas pendientes en tiempo real, reduciendo la carga del equipo de soporte.
- Creación de pedidos de venta desde chat: un agente comercial puede dictar un pedido y el modelo genera la llamada `create_sale_order` con los parámetros correctos, integrable en un flujo de aprobación.
- Gestión de facturación: permite localizar facturas pendientes, cancelar facturas erróneas o registrar pagos mediante instrucciones en lenguaje natural, sin navegar por la interfaz del ERP.
- Automatización de leads y tareas: a partir de una conversación, el modelo crea leads en CRM o tareas en proyectos, con la estructura de datos esperada por Odoo.
- Asistente interno para operaciones de negocio: empleados de finanzas o administración pueden consultar el estado de facturas o partners mediante chat, con respuestas precisas y ejecución de acciones.
- Despliegue local en pymes: al ser un modelo de ~700 MB en Q4_K_M, puede ejecutarse en un servidor con GPU consumer o incluso CPU (con menor rendimiento), ofreciendo una alternativa privada y sin coste por token a APIs externas.

## Benchmarks y rendimiento

El autor publicó resultados de baterías de 1000 casos comparando la versión v18 con la v8 anterior, verificadas con el mismo conjunto de evaluación:

| Batería (1000 casos) | v8 (anterior) | v18 (actual) |
|---|---|---|
| Conversación (990) | 61,6% | 96,2% |
| Creación (1000) | 62,2% | 61,2% |
| Negocio (1000) | 27,7% | 42,4% |
| Facturas (1000) | 27,4% | 41,1% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: en cuantización Q4_K_M, el modelo ocupa aproximadamente 700 MB de pesos, por lo que puede ejecutarse con menos de 2 GB de VRAM para inferencia con contexto corto.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) es suficiente; también puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (llama-server), Ollama (modelfile incluido), vLLM y TGI son compatibles con el formato safetensors o GGUF.
- Latencia: no se han publicado mediciones oficiales; en una GPU moderna se espera una latencia de decodificación inferior a 50 ms/token dada la pequeña escala del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| odooclaw-light-1.2b-ft (v18) | 1,17B | no disponible | Tool-calling en Odoo (español) | Apache 2.0 |
| LiquidAI/LFM2.5-1.2B-Instruct (base) | 1,2B | no disponible | Instrucción general | Apache 2.0 |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K | Instrucción general, multilingüe | Apache 2.0 |

El modelo se distingue por su fine-tune específico para Odoo; los modelos base generalistas requieren ingeniería de prompts adicional y no garantizan la fiabilidad de las llamadas a herramientas ERP que ofrece este fine-tune.

## Limitaciones y advertencias

- Entrenado exclusivamente en español; su rendimiento en otros idiomas no está garantizado.
- Especializado en un conjunto acotado de funciones de Odoo; fuera de ese dominio puede producir respuestas genéricas o alucinaciones.
- El tamaño reducido (1,17B) limita la capacidad de razonamiento complejo y la comprensión de contextos muy largos.
- La longitud de contexto no está documentada; se recomienda validar el comportamiento con historiales largos antes de producción.
- El rendimiento en tareas de creación y negocio (61,2% y 42,4% respectivamente) es sensiblemente inferior al de conversación (96,2%), por lo que estas operaciones requieren supervisión humana.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías; el autor no ofrece soporte oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nicolasramos/odooclaw-light-1.2b-ft
- Colección OdooClaw en Hugging Face: https://huggingface.co/collections/nicolasramos/odooclaw
- Repositorio GitHub: https://github.com/nicolasramos/odooclaw
- Documentación técnica en DeepWiki: https://deepwiki.com/nicolasramos/odooclaw
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
