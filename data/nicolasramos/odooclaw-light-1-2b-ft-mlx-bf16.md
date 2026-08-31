# nicolasramos/odooclaw-light-1.2b-ft-mlx-bf16

## Resumen

OdooClaw Light 1.2B FT es un modelo de lenguaje fine-tuneado a partir de LiquidAI LFM2.5-1.2B-Instruct, especializado en tool calling y function calling para el ERP Odoo a través del protocolo MCP. Desarrollado por nicolasramos, forma parte de la colección OdooClaw, cuyo objetivo es ofrecer un agente de IA 100 % local para Odoo, sin depender de servicios en la nube ni API keys de pago.

Esta versión concreta (`odooclaw-light-1.2b-ft-mlx-bf16`) contiene los pesos en precisión BF16 sin cuantizar, en formato MLX para Apple Silicon. Está pensada como referencia de entrenamiento, para evaluación o para continuar fine-tuning, mientras que la versión recomendada para uso en producción es la cuantizada a 4 bits (628 MB). El modelo soporta conversaciones multi-turno reales, algo que los autores señalan como crítico frente a alternativas más pequeñas que colapsan con historial de chat.

La relevancia actual radica en que permite ejecutar un agente de IA especializado en ERP en hardware modesto, como un Mac Mini con 8 GB de RAM, manteniendo la privacidad de los datos al procesar todo localmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en LiquidAI LFM2.5-1.2B-Instruct (arquitectura no detallada en la informacion disponible) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (este repo), 4-bit MLX (version recomendada), GGUF (para CPU/Linux/Windows) |
| Idiomas soportados | Español, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de LFM2.5-1.2B-Instruct, un modelo de 1.2 mil millones de parametros desarrollado por Liquid AI. La arquitectura subyacente no se especifica en la informacion disponible, pero se trata de un modelo de lenguaje generativo de tipo transformer (o hibrido, segun la familia LFM). El fine-tuning se realizo especificamente para tool calling dentro de Odoo, utilizando el protocolo MCP (Model Context Protocol) para invocar herramientas del ERP.

Segun la model card, la version v18 (la actual) fue entrenada con una distribucion balanceada de los datos de entrenamiento, que coincide con la distribucion de las baterias de evaluacion, y con variedad natural en las conversaciones. Esto corrigio un desajuste presente en la version v8, donde la distribucion de entrenamiento no coincidia con la de evaluacion. No se proporcionan detalles sobre el numero de tokens de entrenamiento, el dataset exacto ni el metodo de alineacion (RLHF, DPO, etc.).

## Capacidades

- Generacion de texto conversacional en espanol e ingles.
- Tool calling y function calling especifico para Odoo: el modelo genera llamadas a herramientas como `mcp_odoo_find_partner` para buscar clientes, crear registros, gestionar facturas, etc.
- Integracion con MCP (Model Context Protocol) para conectarse a instancias de Odoo.
- Soporte de conversaciones multi-turno con historial, manteniendo coherencia a lo largo de la interaccion.
- Capacidad de razonamiento basico para seleccionar la herramienta adecuada segun la peticion del usuario.
- Disenado para ejecutarse localmente en Apple Silicon (MLX) y en CPU/GPU via GGUF.

## Casos de uso

- Atencion al cliente en Odoo: el modelo puede gestionar consultas de clientes en el chat de Odoo, buscando contactos, pedidos o facturas mediante tool calling, y respondiendo en lenguaje natural.
- Gestion de partners y contactos: permite crear o actualizar registros de clientes y proveedores a traves de comandos conversacionales, sin necesidad de navegar por la interfaz del ERP.
- Consulta de facturas y pagos: el agente puede recuperar informacion de facturas, estados de pago y saldos, respondiendo con datos actualizados de la base de datos de Odoo.
- Automatizacion de tareas administrativas: integrado en flujos de trabajo internos, puede ejecutar acciones como crear tareas, registrar ventas o actualizar inventario mediante instrucciones en lenguaje natural.
- Asistente interno para empleados: los trabajadores pueden preguntar por informacion de la empresa, como listados de productos, precios o disponibilidad, y el modelo devuelve respuestas precisas usando las herramientas de Odoo.
- Despliegue en entornos con privacidad estricta: al ser 100 % local, es adecuado para empresas que no pueden enviar datos a servicios en la nube, manteniendo toda la informacion en su propia infraestructura.

## Benchmarks y rendimiento

La model card incluye resultados de evaluacion con baterias de 1000 casos para la version v18, comparados con la version anterior v8:

| Bateria (1000 casos) | v8 (anterior) | v18 (actual) |
|---|---|---|
| Conversation | 61.6 % | 96.2 % |
| Creation | 62.2 % | 61.2 % |
| Business | 27.7 % | 42.4 % |
| Invoices | 27.4 % | 41.1 % |

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible. La evaluacion se centra en tareas especificas de Odoo: conversacion, creacion de registros, operaciones de negocio y gestion de facturas.

## Requisitos de hardware

- VRAM estimada: ~2.4 GB en memoria para la version BF16 (este repo); ~628 MB para la version 4-bit MLX.
- GPU recomendadas: Apple Silicon (cualquier chip, incluyendo Mac Mini con 8 GB de RAM) para la version MLX. Para otras plataformas, usar la version GGUF con llama.cpp o similar.
- Compatibilidad con GPU de consumo: si, en Apple Silicon. En PC con GPU NVIDIA, se puede usar la version GGUF con llama.cpp u otros runners.
- Opciones de despliegue: mlx-lm para Apple Silicon, llama.cpp para CPU/GPU genericas, Ollama (si se convierte a GGUF), vLLM (posiblemente, aunque no se menciona explicitamente).
- Latencia y throughput: no se proporcionan datos numericos. La model card indica que el modelo de 1.2B es mas lento que uno de 0.35B pero mucho mas rapido que uno de 2.6B, y que la version 4-bit es la recomendada para uso en dispositivo.

## Comparativa con modelos similares

La model card menciona comparaciones internas con otros tamanos de la misma familia, pero no se ofrecen datos cuantitativos completos. Se puede establecer la siguiente comparativa basada en la informacion disponible:

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| OdooClaw Light 1.2B FT (este) | 1.17B | No disponible | Tool calling para Odoo | Apache 2.0 | MLX, GGUF |
| LFM2.5-1.2B-Instruct (base) | 1.2B | No disponible | Instruccion general | Apache 2.0 (segun HF) | Safetensors |
| Modelos mas pequenos (0.35B) | 0.35B | No disponible | Tool calling para Odoo | Apache 2.0 | MLX, GGUF |
| Modelos mas grandes (2.6B) | 2.6B | No disponible | Tool calling para Odoo | Apache 2.0 | MLX, GGUF |

Segun los autores, el modelo de 1.2B es el punto optimo: los de 0.35B colapsan con historial de conversacion, y los de 2.6B son 2-4 veces mas lentos en CPU y consumen el doble de memoria.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al ser un modelo pequeno fine-tuneado para un dominio concreto, puede heredar sesgos del modelo base o del dataset de entrenamiento.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventar datos, especialmente en tareas de negocio donde la precision es critica. Se recomienda validar las salidas en produccion.
- Limitaciones de contexto: la longitud de contexto no se ha especificado; en modelos de 1.2B suele ser limitada (tipicamente 4k-8k tokens), lo que puede afectar a conversaciones muy largas.
- Limitaciones de idioma: solo soporta espanol e ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo esta disenado exclusivamente para Odoo; su uso fuera de ese contexto puede degradar el rendimiento.
- Advertencia para produccion: la version BF16 de este repo no esta optimizada para inferencia en dispositivo; se recomienda usar la version 4-bit MLX o la GGUF para despliegues reales. Ademas, el modelo depende de la infraestructura MCP de Odoo para funcionar correctamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nicolasramos/odooclaw-light-1.2b-ft-mlx-bf16
- Version 4-bit MLX: https://huggingface.co/nicolasramos/odooclaw-light-1.2b-ft-mlx
- Version GGUF: https://huggingface.co/nicolasramos/odooclaw-light-1.2b-ft
- Coleccion OdooClaw: https://huggingface.co/collections/nicolasramos/odooclaw
- Repositorio GitHub: https://github.com/nicolasramos/odooclaw
- Sitio web oficial: https://odooclaw.dev/
