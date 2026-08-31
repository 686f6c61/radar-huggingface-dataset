# nicolasramos/odooclaw-medium-2.6b-ft-mlx-bf16

## Resumen

OdooClaw Medium 2.6B FT es un modelo de lenguaje fine-tuneado sobre LiquidAI/LFM2.5-2.6B, desarrollado por nicolasramos, especializado en tool calling y function calling dentro del ecosistema Odoo ERP mediante el protocolo MCP (Model Context Protocol). El modelo permite interactuar con Odoo en lenguaje natural desde el chat integrado, seleccionando automáticamente la herramienta Odoo adecuada para cada petición del usuario. Esta versión concreta contiene los pesos en BF16 sin cuantizar, pensada como referencia de precisión total para evaluación, conversión o fine-tuning adicional.

El modelo forma parte de la familia OdooClaw, que incluye una variante ligera de 1.2B y esta de 2.6B, elegida deliberadamente por su equilibrio entre precisión en tool calling y latencia. Según la model card, alcanza un 94,2% en conversación y un 99,5% en creación sobre baterías de 1000 casos, siendo el modelo más equilibrado de la serie. Está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones, y soporta español e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de LiquidAI/LFM2.5-2.6B (arquitectura subyacente de la familia LFM2.5, no se especifican detalles) |
| Parametros totales | 2.697.198.592 (~2,7B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (este repo); versiones 4-bit MLX y GGUF disponibles en repos hermanos |
| Idiomas soportados | es, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, BF16) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint LiquidAI/LFM2.5-2.6B, perteneciente a la familia LFM2.5 de Liquid AI. No se proporcionan detalles sobre la arquitectura interna del modelo base (si es transformer, SSM, híbrido, etc.) en la información disponible. El fine-tuning se ha realizado específicamente para tool calling dentro de Odoo, entrenando al modelo para que genere llamadas a herramientas MCP en formato estructurado, como se observa en el ejemplo de salida: `<|tool_call_start|>[mcp_odoo-mcp_odoo_find(model='res.partner', domain=[["name",...])]<|tool_call_end|>`.

La model card indica que la versión v18 fue entrenada con una distribución balanceada de datos (que coincide con la evaluación) y variedad natural. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se usaron técnicas como RLHF o DPO. El modelo está diseñado para ejecutarse en dispositivos Apple Silicon mediante MLX, aunque también existen versiones GGUF para CPU/Linux/Windows.

## Capacidades

- Generación de texto conversacional en español e inglés, con formato de chat estándar.
- Tool calling y function calling específico para Odoo ERP, capaz de seleccionar y parametrizar llamadas a herramientas MCP (por ejemplo, búsqueda de clientes, creación de registros, gestión de facturas).
- Integración con el ecosistema Odoo a través de MCP, permitiendo operaciones sobre el ORM de Odoo (modelos como `res.partner`, etc.).
- Razonamiento previo a cada llamada de herramienta, lo que mejora la precisión en tareas agénticas.
- Soporte de agentes multi-paso: el modelo puede encadenar varias llamadas a herramientas para completar tareas complejas.
- Capacidad de ejecución local en Apple Silicon con MLX, sin necesidad de conexión a la nube.

## Casos de uso

- Atención al cliente en Odoo: el modelo puede gestionar conversaciones con clientes directamente desde el chat de Odoo, resolviendo consultas sobre pedidos, facturas o estados de cuenta, y ejecutando búsquedas en el CRM cuando es necesario.
- Gestión de CRM: permite crear, actualizar o buscar contactos y oportunidades mediante lenguaje natural, por ejemplo "Busca el cliente Acme" o "Crea una nueva oportunidad para la empresa XYZ".
- Automatización de facturación: el modelo puede generar facturas, consultar facturas existentes o modificar estados, reduciendo el trabajo manual en el departamento de administración.
- Asistente interno para empleados: sirve como interfaz conversacional para que empleados no técnicos consulten y modifiquen datos del ERP sin conocer la estructura de Odoo.
- Integración en pipelines de soporte técnico: combinado con MCP, puede actuar como agente que resuelve incidencias de primer nivel, escalando a un humano cuando no encuentra la herramienta adecuada.
- Despliegue local en entornos con requisitos de privacidad: al ejecutarse en Apple Silicon con MLX, permite procesar datos sensibles del ERP sin enviarlos a servidores externos, cumpliendo políticas de protección de datos.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación de la versión v18 sobre baterías de 1000 casos:

| Batería (1000 casos) | Precisión v18 |
|---|---|
| Conversación (990) | 94,2% |
| Creación (1000) | 99,5% |
| Negocio (1000) | 74,0% |
| Facturas (1000) | 71,6% |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Los datos presentados son específicos de la evaluación interna de OdooClaw.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 5,4 GB en BF16 (este repo). La versión 4-bit MLX requiere ~1,5 GB.
- GPU recomendadas: Apple Silicon (cualquier chip con suficiente memoria unificada, por ejemplo M1/M2/M3 con 8 GB o más). No está pensado para GPU NVIDIA en este formato MLX.
- Compatibilidad con GPU de consumo: sí, en Apple Silicon. Para Linux/Windows/CPU se debe usar la versión GGUF.
- Opciones de despliegue: mlx-lm para Apple Silicon, llama.cpp/Ollama para la versión GGUF, y cualquier servidor compatible con OpenAI (vLLM, TGI) si se convierte a otros formatos.
- Latencia y throughput: no se proporcionan datos numéricos, pero la model card indica que el modelo de 2.6B es el equilibrio óptimo entre precisión y velocidad, siendo más lento que el de 1.2B pero más preciso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (baterías OdooClaw) | Licencia | Formato |
|---|---|---|---|---|---|
| OdooClaw Medium 2.6B (este) | 2,7B | no disponible | Conversación 94,2%, Creación 99,5%, Negocio 74,0%, Facturas 71,6% | Apache 2.0 | MLX BF16, 4-bit, GGUF |
| OdooClaw Light 1.2B | 1,2B | no disponible | Menor precisión en tareas de negocio/finanzas (según model card) | Apache 2.0 | MLX, GGUF |
| LiquidAI/LFM2.5-2.6B (base) | 2,7B | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a la familia OdooClaw, ya que no se dispone de datos de modelos externos equivalentes en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en tool calling para Odoo; fuera de ese dominio su rendimiento puede ser inferior al de un modelo generalista del mismo tamaño.
- Solo soporta español e inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Riesgo de alucinación en tareas de negocio y facturación, como reflejan las puntuaciones más bajas en esas baterías (74,0% y 71,6%).
- La longitud de contexto no está documentada, por lo que no se puede garantizar un rendimiento fiable en conversaciones muy largas o con documentos extensos.
- Este repo en BF16 requiere ~5,4 GB de memoria, lo que puede ser elevado para dispositivos Apple Silicon de gama baja; se recomienda la versión 4-bit para uso diario.
- Dependencia del ecosistema MCP y de la configuración del servidor Odoo; el modelo no funciona correctamente sin una infraestructura MCP adecuada.
- Al ser un fine-tune de un modelo base de Liquid AI, las limitaciones del modelo original (sesgos, alucinaciones) pueden persistir, aunque no se documentan explícitamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nicolasramos/odooclaw-medium-2.6b-ft-mlx-bf16
- Colección OdooClaw: https://huggingface.co/collections/nicolasramos/odooclaw
- Repositorio GitHub: https://github.com/nicolasramos/odooclaw
- Documentación en DeepWiki: https://deepwiki.com/nicolasramos/odooclaw
- Versión 4-bit MLX: https://huggingface.co/nicolasramos/odooclaw-medium-2.6b-ft-mlx
- Versión GGUF: https://huggingface.co/nicolasramos/odooclaw-medium-2.6b-ft
