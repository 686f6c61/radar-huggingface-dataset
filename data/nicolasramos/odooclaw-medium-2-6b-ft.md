# nicolasramos/odooclaw-medium-2.6b-ft

## Resumen

`odooclaw-medium-2.6b-ft` es un fine-tune del modelo `LiquidAI/LFM2.5-2.6B` de Liquid AI, especializado en tool-calling y function-calling para el ERP Odoo. Lo desarrolla `nicolasramos` como parte del ecosistema OdooClaw, un asistente de IA ligero escrito en Go que integra modelos de lenguaje con el ORM de Odoo mediante el Model Context Protocol (MCP). Este modelo concreto, en su versión v18, es la iteración definitiva de la línea Medium y está diseñado para ejecutarse de forma local en hardware propio, sin depender de APIs externas.

El modelo resuelve el problema de la automatización de operaciones ERP mediante lenguaje natural: los usuarios pueden pedir crear pedidos de venta, leads, tareas, facturas, registrar pagos o buscar partners, y el modelo traduce esas peticiones en llamadas a herramientas de Odoo. Con 2.697.198.592 parámetros (~2,6B), se posiciona como una opción eficiente para despliegue en entornos con recursos limitados. La licencia Apache 2.0 permite uso comercial sin restricciones, y el modelo está entrenado exclusivamente en español.

La relevancia actual radica en la tendencia hacia asistentes de IA locales y especializados por dominio. Frente a modelos generalistas de gran tamaño, este fine-tune ofrece precisión en un dominio concreto (Odoo) con un coste computacional reducido, lo que lo hace atractivo para pymes y departamentos de TI que quieren mantener sus datos dentro de su infraestructura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de LiquidAI/LFM2.5-2.6B) |
| Parametros totales | 2.697.198.592 (~2,6B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M, safetensors (fused) |
| Idiomas soportados | es (español) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

El modelo base `LFM2.5-2.6B` de Liquid AI pertenece a la familia de modelos de lenguaje de pequeño tamaño de la compañía. No se especifican en la información disponible los detalles arquitectónicos exactos del base (si es transformer puro, híbrido con SSM, etc.), pero se sabe que Liquid AI emplea arquitecturas híbridas en sus modelos recientes. El fine-tune se realizó mediante QLoRA en 4 bits, con 2 épocas sobre un dataset de 49.301 ejemplos balanceados, alcanzando una pérdida de entrenamiento de 0.0608.

El dataset de entrenamiento está compuesto por instrucciones y diálogos en español orientados a operaciones de Odoo, con la siguiente distribución: texto libre 32%, búsqueda (search) 14%, creación de pedidos de venta (create_sale_order) 9%, búsqueda de facturas pendientes (find_pending_invoices) 9%, creación de leads 7%, creación de tareas 6%, cancelación de facturas 6%, creación genérica 5%, creación de facturas de proveedor 5%, registro de pagos 4,4% y búsqueda de partners 2,5%. Esta distribución balanceada coincide con la de evaluación, lo que explica el buen rendimiento del modelo en las baterías de pruebas.

El modelo se sirve con llama.cpp usando un chat template específico que elimina el modo `thinking`, de modo que el modelo responde directamente con la etiqueta `<tool_call>` para invocar las herramientas de Odoo.

## Capacidades

- Tool-calling / function-calling nativo para Odoo ERP: creación de pedidos de venta, leads, tareas, facturas de cliente y proveedor, registro de pagos, cancelación de facturas, búsqueda de partners y de facturas pendientes.
- Generación de texto conversacional en español, con soporte de diálogos multi-turno.
- Ejecución de búsquedas dentro del sistema Odoo (módulo search).
- Integración con el ecosistema OdooClaw: funciona como backend de IA para el asistente escrito en Go, que se conecta al ORM de Odoo vía MCP.
- Sin modo thinking explícito: el modelo está entrenado para emitir directamente la llamada a herramienta, reduciendo latencia en producción.
- No incluye capacidades de visión ni audio; para procesamiento de documentos existe el modelo hermano `odooclaw-vision`.

## Casos de uso

- Atención al cliente automatizada en Odoo: el modelo puede gestionar conversaciones donde el cliente pide crear un lead, consultar el estado de una factura o registrar un pago, invocando las herramientas correspondientes sin intervención humana.
- Automatización de la gestión de pedidos: un comercial puede dictar "crea un pedido de venta para el partner X con estos productos" y el modelo genera la llamada a `create_sale_order` con los parámetros extraídos del contexto.
- Facturación recurrente: el modelo puede buscar facturas pendientes (`find_pending_invoices`), cancelar facturas erróneas (`cancel_invoice`) o crear facturas de proveedor (`create_vendor_invoice`), agilizando el ciclo de facturación.
- Gestión de tareas y proyectos: mediante `create_task`, el modelo convierte instrucciones en lenguaje natural en tareas asignadas dentro de Odoo, útil para equipos que trabajan con metodologías ágiles.
- Búsqueda de información corporativa: el módulo `search` permite al modelo localizar partners, pedidos o facturas a partir de consultas en lenguaje natural, evitando al usuario navegar por menús complejos.
- Asistente interno para departamento financiero: registro de pagos (`register_payment`) y conciliación de facturas, reduciendo errores de entrada manual y liberando tiempo del equipo contable.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo de 2,6B que cabe en GPUs de consumo, puede ejecutarse on-premise, garantizando que los datos de la empresa no salen de su infraestructura.

## Benchmarks y rendimiento

El autor proporciona resultados de baterías de evaluación de 1000 casos por categoría para la versión v18:

| Batería (1000 casos) | Tasa de éxito v18 |
|---|---|
| Conversación (990 casos) | 94,2% |
| Creación (1000 casos) | 99,5% |
| Negocio (1000 casos) | 74,0% |
| Facturas (1000 casos) | 71,6% |

No se han publicado comparativas con otros modelos en la información disponible. El autor indica que v18 es el modelo más equilibrado de la serie Medium, siendo top-2 en las cuatro categorías simultáneamente sin comprometer ninguna.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, los pesos ocupan aproximadamente 1,5 GB. Con overhead de contexto y activaciones, se recomienda un mínimo de 3-4 GB de VRAM para uso cómodo.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, por ejemplo NVIDIA GTX 1650, RTX 3060, RTX 4060, o superiores. En CPU, puede ejecutarse con 8 GB de RAM usando llama.cpp.
- Cabe en GPUs de consumo sin problema; es adecuado para portátiles con GPU dedicada o incluso para despliegue en CPU pura con rendimiento aceptable.
- Opciones de despliegue: llama.cpp / llama-server (recomendado por el autor, con chat template específico), vLLM (si se usa safetensors), Ollama (si se convierte a formato GGUF), TGI.
- Latencia: para un modelo de 2,6B en Q4_K_M, la generación suele ser de 30-60 tokens/segundo en una RTX 3060, y de 5-10 tokens/segundo en CPU moderna. El autor recomienda temperatura 0.0 para máxima determinismo en tool-calling.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoría. Como referencia, los modelos comparables serían:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| odooclaw-medium-2.6b-ft | 2,6B | no disponible | Tool-calling Odoo (es) | Apache 2.0 |
| LFM2.5-2.6B (base) | 2,6B | no disponible | Generalista | Apache 2.0 |
| Qwen2.5-3B | 3,1B | 32K | Generalista, tool-calling | Apache 2.0 |
| Llama-3.2-3B | 3,2B | 128K | Generalista | Llama 3.2 |

No se han encontrado benchmarks que comparen directamente estos modelos en tareas de Odoo, por lo que la comparativa queda a nivel de especificaciones.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en español; su rendimiento en otros idiomas será deficiente o nulo.
- Especializado en tool-calling para Odoo; fuera de ese dominio, su capacidad de razonamiento general es limitada en comparación con modelos generalistas del mismo tamaño.
- Las baterías de evaluación muestran un rendimiento notablemente inferior en las categorías "Negocio" (74%) y "Facturas" (71,6%), lo que indica que hay margen de error en tareas complejas de gestión empresarial.
- No tiene capacidades de visión; para OCR de facturas o documentos se necesita el modelo `odooclaw-vision` por separado.
- Riesgo de alucinación en la generación de parámetros de llamadas a herramientas: si el contexto no contiene la información necesaria, el modelo puede inventar IDs o valores que no existen en el sistema Odoo.
- La longitud de contexto no está documentada; se desconoce si el modelo mantiene el contexto completo del base LFM2.5-2.6B.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo está pensado para integrarse con el ecosistema OdooClaw; su uso fuera de ese framework requiere adaptación del chat template y de las definiciones de herramientas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nicolasramos/odooclaw-medium-2.6b-ft
- Colección OdooClaw en HuggingFace: https://huggingface.co/collections/nicolasramos/odooclaw
- Repositorio GitHub: https://github.com/nicolasramos/odooclaw
- Documentacion DeepWiki: https://deepwiki.com/nicolasramos/odooclaw
- Modelo de vision (OCR): https://huggingface.co/nicolasramos/odooclaw-vision
