# LasagnaS/toti-qwen-1.7b-v14-gguf

## Resumen

toti-qwen-1.7b-v14 es un fine-tune mediante LoRA del modelo denso Qwen3-1.7B, publicado por el usuario LasagnaS en formato GGUF (cuantización Q4_K_M) y pensado para un caso de uso muy concreto: el chatbot de WhatsApp de la pastelería Toti Cakery. El modelo está entrenado para hacer *tool calling* en indonesio e inglés (selección de herramienta y argumentos en JSON) y para responder preguntas frecuentes a partir de contexto recuperado por RAG, además de gestionar saludos, peticiones fuera de tema, intentos de inyección de prompt y consultas de informes reservadas al propietario del negocio.

Con 1.720.574.976 parámetros (1,72 B) y un repositorio de 1,1 GB, es un modelo pequeño que cabe en cualquier GPU de consumo e incluso en CPU, lo que lo hace adecuado para desplegarse en un servidor modesto atendiendo un canal de mensajería con latencia baja. El autor publica una evaluación comparativa antes/después del fine-tune sobre el split de test de su propio dataset (248 filas), con mejoras muy grandes en selección de herramienta (0,204 a 0,908) y precisión exacta de argumentos (0,158 a 0,809).

La relevancia de esta ficha es acotada pero instructiva: no es un modelo generalista, sino un ejemplo de adaptación de un modelo base pequeño a un dominio empresarial con métricas propias y fallos documentados (tasa de falsa invocación de herramientas del 14,6 % y regresiones en varios escenarios conversacionales). La licencia Apache 2.0 permite uso comercial, aunque el modelo está sobreajustado a un chatbot concreto y a su esquema de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3 (detalles de atención y activación no disponibles en la información proporcionada) |
| Parametros totales | 1.720.574.976 (1,72 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (única publicada en el repositorio) |
| Idiomas soportados | Indonesio e inglés (según la model card, orientado a sesiones de cliente en ambos idiomas); cobertura oficial no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con Ollama y llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3-1.7B`, una versión del Qwen3 de 1,7 B parámetros distribuida por Unsloth para entrenamiento eficiente, y se ha adaptado mediante LoRA (el autor cita un fine-tune LoRA) seguido de conversión a GGUF. El entrenamiento se realizó sobre el dataset de tool calling de Toti Cakery, revisión v14, ubicado en `finetune/data/` del repositorio `github.com/kevinilhamramadhan/Chatbot-Cakery`. El autor reporta un tiempo de entrenamiento de 209,2 minutos; no se especifican el número de tokens vistos, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

La evaluación se hizo con los prompts exactamente tal como se envían en producción, con temperatura 0,7, top_p 0,8 y un límite de 192 tokens por respuesta. Un dato relevante de entrenamiento: antes del fine-tune, 152 respuestas del split de test quedaban truncadas por ese límite; después del fine-tune, ninguna, lo que indica que el modelo aprendió a producir salidas más cortas y ajustadas al formato esperado (JSON de llamada a herramienta o respuesta breve de FAQ). No se documentan innovaciones arquitectónicas propias: el interés está en el ajuste de comportamiento, no en la arquitectura.

## Capacidades

- Generación de texto conversacional breve para atención al cliente en indonesio e inglés, con cambio de idioma alineado con el idioma de la sesión del cliente (tasa de idioma incorrecto reducida del 27,1 % al 1,0 %).
- *Tool calling* / *function calling*: selección de la herramienta correcta (0,908 de acierto en el split de test) y emisión de argumentos exactos (0,809), con salida JSON válida (tasa de llamadas corruptas del 0,0 %).
- Respuesta a preguntas frecuentes fundamentada en contexto recuperado (RAG), con precisión de 0,800 en escenarios donde el contexto sí contiene la respuesta.
- Reconocimiento de contexto insuficiente: capacidad parcial de admitir que no sabe la respuesta cuando el contexto RAG no la contiene (0,500 de acierto, por debajo del objetivo de 0,7).
- Gestión de escenarios conversacionales auxiliares: saludos y agradecimientos, mensajes cortos ambiguos, peticiones de contacto con una persona, negociación, cambios de método de pago y consultas fuera del ámbito de la tienda.
- Operaciones de negocio específicas vía herramientas: consulta de menú y categorías, detalle y comparación de productos, realización de pedidos (uno o varios productos), consulta y cancelación de pedidos, estado y contenido del carrito, reenvío de instrucciones de pago y reclamaciones de pago.
- Consultas restringidas por rol: informes financieros y analítica solo cuando el solicitante es el propietario (1,00 de acierto en los escenarios evaluados).
- Resistencia parcial a inyección de prompt, solicitudes de secretos y preguntas meta (1,00 en los escenarios N7 evaluados).
- No se documentan capacidades de visión, audio, *thinking mode* explícito, agentes multi-paso generales ni matemáticas avanzadas.

## Casos de uso

- **Atención al cliente por WhatsApp en una pyme de repostería**: el modelo gestiona conversaciones multi-turno en indonesio e inglés, alternando respuestas de texto breve con llamadas a herramientas para consultar el catálogo. Es adecuado porque su fine-tune está hecho exactamente sobre los prompts de producción de ese canal y con un límite de 192 tokens por respuesta, lo que reduce coste y latencia.
- **Capa de enrutamiento de intenciones hacia herramientas internas**: dado un mensaje de cliente, el modelo decide qué función invocar (menú, detalle de producto, estado de pedido, cancelación) y genera los argumentos en JSON. Su tasa de llamadas inválidas del 0,0 % en el split de test lo hace viable como router sin necesidad de un parser defensivo complejo, aunque conviene mantener validación de esquema.
- **Respuestas FAQ con recuperación aumentada (RAG)**: se le inyecta el fragmento de documentación recuperado y el modelo redacta la respuesta citando los datos del contexto (0,800 de precisión). Encaja en un pipeline donde el recuperador ya filtra los documentos candidatos.
- **Automatización de pedidos en chat**: los escenarios T5 (pedido de un producto) y T7 (indicar cantidad tras ver el detalle) pasan de 0,11 y 0,00 a 0,94 y 1,00 respectivamente, de modo que el modelo puede cerrar un pedido sencillo sin intervención humana.
- **Autoservicio de estado y cancelación de pedidos**: con 1,00 de acierto en los escenarios T8 y T9, puede atender consultas de seguimiento y cancelaciones dentro de política, liberando al personal de tareas repetitivas.
- **Control de acceso a información sensible del negocio**: distingue entre el propietario y el resto de usuarios y solo emite informes financieros o analítica cuando corresponde (1,00 en N10, T11 y T12), lo que permite exponer herramientas internas con una comprobación de rol adicional en el backend.
- **Despliegue en hardware modesto o en el borde**: al ocupar aproximadamente 1,1 GB en Q4_K_M, puede ejecutarse en una GPU de 4 GB, en CPU o en una instancia pequeña de contenedor, lo que abarata el coste por conversación frente a modelos de mayor tamaño.
- **Base para un fine-tune de dominio propio**: sirve como plantilla reproducible (dataset versionado, métricas por escenario, comparativa antes/después) para equipos que quieran adaptar un Qwen3-1.7B a su propio esquema de herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica una evaluación propia sobre el split de test de su dataset (248 filas), con temperatura 0,7, top_p 0,8 y límite de 192 tokens, comparando el modelo base con el fine-tune:

| Metrica | Significado | Antes | Despues | Objetivo | Estado |
|---|---|---:|---:|---|:---:|
| `function_selection_acc` | filas con tool: elige la herramienta correcta | 0,204 | 0,908 | >= 0,85 | Cumple |
| `param_exact_acc` | filas con tool: herramienta y argumentos exactos | 0,158 | 0,809 | >= 0,70 | Cumple |
| `irrelevance_acc` | filas sin tool: no invoca herramienta | 0,969 | 0,854 | >= 0,85 | Cumple |
| `false_tool_rate` | filas sin tool: invoca herramienta innecesaria | 0,031 | 0,146 | <= 0,10 | No cumple |
| `invalid_call_rate` | filas con tool: JSON ilegible | 0,053 | 0,000 | <= 0,05 | Cumple |
| `faq_grounded_acc` | FAQ: la respuesta contiene hechos del contexto | 0,800 | 0,800 | >= 0,70 | Cumple |
| `faq_jujur_acc` | FAQ sin respuesta en el contexto: admite no saberlo | 0,000 | 0,500 | >= 0,70 | No cumple |
| `wrong_language_rate` | idioma de la respuesta distinto al de la sesión | 0,271 | 0,010 | <= 0,03 | Cumple |

Objetivos alcanzados: 6 de 8. Tiempo de entrenamiento: 209,2 minutos. Respuestas truncadas por el límite de 192 tokens: 152 antes, 0 después.

Selección de resultados por tipo de escenario (n = número de casos del split):

| Tipo | Escenario | n | Antes | Despues | Diferencia |
|---|---|---:|---:|---:|---:|
| N1 | FAQ a partir de contexto | 15 | 0,80 | 0,80 | 0,00 |
| N1x | Contexto sin la respuesta | 4 | 0,00 | 0,50 | +0,50 |
| N2 | Información aún no disponible | 3 | 1,00 | 0,33 | -0,67 |
| N5 | Pregunta de vuelta (ambigua) | 7 | 0,86 | 0,43 | -0,43 |
| N18 | Escenario no descrito | 5 | 1,00 | 0,60 | -0,40 |
| T1 | Consulta de menú | 7 | 0,43 | 0,86 | +0,43 |
| T3 | Detalle de producto | 14 | 0,07 | 0,79 | +0,71 |
| T4 | Comparación de productos | 4 | 0,00 | 1,00 | +1,00 |
| T5 | Pedido de un producto | 18 | 0,11 | 0,94 | +0,83 |
| T6 | Pedido de varios productos | 4 | 0,00 | 0,75 | +0,75 |
| T7 | Cantidad tras ver el detalle | 6 | 0,00 | 1,00 | +1,00 |
| T10 | Tarta personalizada derivada a administración | 3 | 0,00 | 0,00 | 0,00 |
| T14 | Reclamaciones | 6 | 0,00 | 0,00 | 0,00 |
| T20 | Escenario no descrito | 6 | 0,00 | 0,00 | 0,00 |
| T27 | Escenario no descrito | 4 | 0,00 | 0,25 | +0,25 |
| T26 | Escenario no descrito | 3 | 0,00 | 1,00 | +1,00 |

El detalle completo de los 46 tipos de escenario está en el archivo `hasil_metrik_v14.json` citado en la model card. Conviene interpretar estas cifras con cautela: son métricas de dominio propio, sobre un conjunto de test pequeño (varios escenarios con n = 3) y sin comparación con modelos de terceros bajo el mismo protocolo.

## Requisitos de hardware

- VRAM estimada: los pesos en Q4_K_M ocupan aproximadamente 1,0-1,1 GB (tamaño total del repositorio: 1,1 GB). Con caché KV y overhead de runtime, una estimación razonable es de 2 a 3 GB de VRAM para contextos cortos y de 3 a 5 GB si se aprovecha una ventana de contexto amplia.
- GPU recomendadas: cualquier GPU con 4 GB o más, como GTX 1650, RTX 3050, RTX 4060 o superiores. Para servir varias conversaciones concurrentes con throughput alto, una RTX 4090, L4, A10G, A100 o H100 van sobradas y el cuello de botella será el servidor de aplicaciones, no el modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna con 4 GB o más; también es viable la inferencia en CPU, ya que el modelo completo en Q4_K_M ronda 1 GB.
- Opciones de despliegue: Ollama (el autor publica el comando `ollama pull hf.co/LasagnaS/toti-qwen-1.7b-v14-gguf:Q4_K_M`), llama.cpp, LM Studio, y servidores compatibles con GGUF como vLLM (soporte GGUF) o TGI (soporte GGUF limitado). El tag `endpoints_compatible` sugiere compatibilidad con la API de endpoints de HuggingFace.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, TTFT ni coste por conversación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato publicado |
|---|---|---|---|---|---|
| toti-qwen-1.7b-v14 | 1,72 B | No disponible | Tool calling y FAQ para un chatbot de repostería (indonesio/inglés) | Apache 2.0 | GGUF Q4_K_M |
| Qwen3-1.7B (modelo base) | 1,72 B | No disponible en esta ficha | Modelo generalista con capacidades de razonamiento y tool calling | Apache 2.0 | Safetensors y GGUF (según distribución) |
| Qwen2.5-1.5B-Instruct | 1,54 B | No disponible en esta ficha | Modelo generalista instructivo, buen soporte multilingüe | Apache 2.0 | Safetensors y GGUF |
| Llama 3.2 1B Instruct | 1,24 B | No disponible en esta ficha | Modelo generalista instructivo, orientado a对话 y resumen | Licencia comunitaria Llama 3.2 | Safetensors y GGUF |

No se dispone de comparaciones directas de rendimiento entre estos modelos y toti-qwen-1.7b-v14 bajo el mismo protocolo de evaluación: las métricas publicadas son específicas del dataset de Toti Cakery y no son comparables con benchmarks generalistas. En la práctica, el modelo base Qwen3-1.7B es la alternativa natural si se necesita un comportamiento general y no un esquema de herramientas fijo; este fine-tune solo es preferible cuando el esquema de herramientas y el formato de respuesta coinciden con los del chatbot de origen.

## Limitaciones y advertencias

- **Falsa invocación de herramientas**: la tasa de llamada innecesaria sube del 3,1 % al 14,6 % tras el fine-tune, por encima del objetivo del 10 %. En producción esto implica llamadas espurias a funciones de negocio y requiere validación adicional en el backend.
- **Escasa honestidad ante contexto insuficiente**: cuando el contexto RAG no contiene la respuesta, el modelo solo reconoce no saberlo en el 50 % de los casos (objetivo: 70 %). Existe riesgo de que improvise respuestas sobre precios, disponibilidad o plazos.
- **Regresiones en escenarios conversacionales**: varios tipos empeoran tras el ajuste, especialmente N2 (información aún no disponible, de 1,00 a 0,33), N5 (preguntas de vuelta ante ambigüedad, de 0,86 a 0,43) y N18 (de 1,00 a 0,60). También hay escenarios que siguen a 0,00 (T10, T14, T20), lo que indica comportamientos no aprendidos.
- **Sesgo de dominio y de idioma**: el modelo está entrenado para un negocio, un catálogo y un esquema de herramientas concretos, en indonesio e inglés. No hay datos sobre su comportamiento en castellano ni en otros idiomas, y es probable que degrade fuera de ese formato.
- **Conjunto de evaluación pequeño y de autor**: 248 filas en total, con escenarios de 3 a 18 casos, evaluados por el propio autor sin comparación con terceros ni intervalos de confianza. Las cifras deben tomarse como indicativas.
- **Riesgo de alucinación**: no se han publicado evaluaciones de veracidad fuera del contexto RAG ni pruebas de seguridad, toxicidad o sesgos. El modelo no incluye mecanismos explícitos de moderación.
- **Trazabilidad y mantenimiento limitados**: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 25 de octubre de 2026 en un margen de menos de un minuto, sin documentación de hiperparámetros de entrenamiento, dataset de tokens ni receta reproducible más allá de la referencia al repositorio de GitHub.
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones, pero conviene verificar también las condiciones del modelo base `unsloth/Qwen3-1.7B` y de los datos de entrenamiento originales antes de un despliegue en producción.
- **Formato único**: solo se publica GGUF Q4_K_M; no hay safetensors del fine-tune, lo que dificulta reentrenar, fusionar o cuantizar a otros niveles sin partir del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LasagnaS/toti-qwen-1.7b-v14-gguf
- Modelo base: https://huggingface.co/unsloth/Qwen3-1.7B
- Repositorio del proyecto y dataset de tool calling: https://github.com/kevinilhamramadhan/Chatbot-Cakery
- Descarga en Ollama: `ollama pull hf.co/LasagnaS/toti-qwen-1.7b-v14-gguf:Q4_K_M`
- Resultados detallados de evaluación: archivo `hasil_metrik_v14.json` citado en la model card (no se ha localizado un enlace directo en la información proporcionada)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces encontrados no guardan relación con el contenido de la ficha y se han descartado.
