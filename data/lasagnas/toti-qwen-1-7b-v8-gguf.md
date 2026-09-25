# LasagnaS/toti-qwen-1.7b-v8-gguf

## Resumen

toti-qwen-1.7b-v8 (GGUF Q4_K_M) es un ajuste fino con LoRA de Qwen3-1.7B desarrollado por el usuario LasagnaS para un caso de uso muy concreto: el chatbot de WhatsApp de la panaderia Toti Cakery. El modelo esta entrenado para hacer tool calling (seleccion de funcion y generacion de argumentos) en indonesio e ingles, y para responder preguntas frecuentes a partir de contexto recuperado (RAG). El entrenamiento se hizo sobre el dataset `LasagnaS/toti-cakery-toolcall` en su revision v8 y duro 135,1 minutos.

Se distribuye unicamente en formato GGUF con cuantizacion Q4_K_M, lo que lo hace desplegable en Ollama con un solo comando y ejecutable en hardware muy modesto. El repositorio ocupa 1,1 GB y el modelo tiene 1.720.574.976 parametros (aproximadamente 1,7 B), con licencia Apache-2.0. Es, por tanto, un modelo de nicho: no compite con modelos generalistas, sino que busca resolver tareas de atencion al cliente automatizada en un dominio cerrado y con un catalogo de herramientas fijo.

Su relevancia actual esta en que demuestra hasta que punto un modelo denso de 1,7 B, cuantizado a 4 bits y ejecutable en local, puede alcanzar exactitudes superiores al 90 % en seleccion de herramienta tras un ajuste fino dirigido. La propia model card publica una evaluacion honesta con 8 metricas y 30 tipos de escenario, incluyendo los casos en los que el ajuste empeoro respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3, ajustado con LoRA |
| Parametros totales | 1.720.574.976 (~1,7 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la ficha del autor; el modelo base Qwen3-1.7B declara 32.768 tokens nativos, extensibles a 131.072 con YaRN |
| Tipos de cuantizacion | GGUF Q4_K_M (unico publicado en el repositorio) |
| Idiomas soportados | Indonesio e ingles (segun la model card del autor); la ficha de HuggingFace no declara idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) |
| Modelo base | unsloth/Qwen3-1.7B |
| Dataset de entrenamiento | LasagnaS/toti-cakery-toolcall (revision v8) |
| Tamano del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y QK-Norm en las capas de atencion. Sobre ese modelo base se aplico un ajuste fino con LoRA, no un entrenamiento completo, segun indica el propio autor. El resultado se publica ya fusionado y cuantizado a Q4_K_M en formato GGUF, de modo que no se distribuyen pesos en safetensors ni el adaptador LoRA por separado.

El entrenamiento utilizo exclusivamente el dataset `LasagnaS/toti-cakery-toolcall` en su revision v8, compuesto por conversaciones del chatbot de la panaderia con ejemplos de llamadas a herramientas y de respuestas FAQ ancladas a contexto. La model card no detalla el numero de tokens, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; tampoco se documenta ninguna innovacion de decodificacion (no hay decodificacion especulativa ni atencion lineal declaradas). Si se indica que el ajuste duro 135,1 minutos y que uno de sus efectos medibles fue eliminar los truncamientos de respuesta: con un limite de 192 tokens, antes del ajuste habia 91 respuestas cortadas y despues, 0.

## Capacidades

- Generacion de texto conversacional en indonesio e ingles, orientada a atencion al cliente.
- Tool calling / function calling: es la capacidad central del ajuste. En el split de test alcanza 0,932 de exactitud en seleccion de herramienta y 0,830 en coincidencia exacta de herramienta y argumentos.
- Respuestas FAQ ancladas a contexto recuperado (RAG): 0,533 de `faq_grounded_acc` en el split de test.
- Reconocimiento de ausencia de informacion: cuando el contexto no contiene la respuesta, admite no saberlo con 0,750 de exactitud (`faq_jujur_acc`).
- Gestion de intenciones conversacionales variadas: saludos, agradecimientos, preguntas ambiguas, peticiones de informacion sensible o intentos de inyeccion de prompt.
- Flujos operativos de tienda: consulta de menu y categorias, detalle y comparacion de productos, realizacion y cancelacion de pedidos, consulta de estado, recuperacion de carrito, informes de analitica y finanzas para el rol de propietario.
- Consistencia de idioma: el ajuste reduce a 0 la tasa de respuestas en un idioma distinto al de la sesion del cliente.
- No se declaran capacidades de vision, audio, generacion de imagen ni modo de razonamiento explicito (thinking mode) preservado del modelo base.

## Casos de uso

- Atencion al cliente por WhatsApp en el sector hosteleria o retail: el modelo gestiona conversaciones multi-turno con un catalogo de herramientas fijo, seleccionando la funcion correcta el 93,2 % de las veces y generando argumentos exactos el 83,0 %, lo que lo hace adecuado como capa de enrutado de intenciones en produccion.
- Motor de FAQ con RAG: dado un contexto recuperado de una base documental, responde preguntas frecuentes de producto y, cuando la respuesta no esta en el contexto, indica que no dispone de esa informacion en lugar de inventarla.
- Gestion de pedidos automatizada: crear pedidos de uno o varios productos, consultar el carrito y cancelar pedidos, tareas en las que el modelo passa de 0,00 a 0,94, 1,00 y 1,00 de exactitud respectivamente tras el ajuste.
- Seguimiento de estado de pedidos: consulta del estado de un pedido con una exactitud de 0,83 en el escenario T8, integrable con un backend de logistica mediante llamadas a herramientas.
- Asistente interno para el propietario del negocio: informes financieros y de analitica restringidos por rol, con 1,00 de exactitud en el escenario T11 y capacidad de rechazar peticiones de usuarios que no son propietarios.
- Filtro de seguridad conversacional: el modelo reconoce intentos de inyeccion de prompt, peticiones de informacion reservada y temas fuera de alcance del negocio, manteniendo un 1,00 en los escenarios N7, N4 y N10.
- Prototipado local de agentes en hardware de gama baja: al ejecutarse en CPU o en una GPU de 4 GB, sirve para validar pipelines de tool calling en portatiles antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, medidos sobre el split `test` del dataset (166 filas), con prompts identicos a los de produccion, temperatura 0,7, top_p 0,8 y limite de 192 tokens. Se comparan modelo base y modelo ajustado.

| Metrica | Significado | Antes | Despues | Diferencia | Objetivo | Estado |
|---|---|---:|---:|---:|---|:---:|
| `function_selection_acc` | Filas con herramienta: selecciona la herramienta correcta | 0.205 | 0.932 | +0.727 | >= 0.85 | Cumple |
| `param_exact_acc` | Filas con herramienta: herramienta y argumentos exactamente correctos | 0.159 | 0.830 | +0.671 | >= 0.7 | Cumple |
| `irrelevance_acc` | Filas sin herramienta: no invoca ninguna herramienta | 0.949 | 0.808 | -0.141 | >= 0.85 | No cumple |
| `false_tool_rate` | Filas sin herramienta: invoca herramienta sin necesidad | 0.051 | 0.192 | +0.141 | <= 0.1 | No cumple |
| `invalid_call_rate` | Filas con herramienta: llamada rota (JSON ilegible) | 0.057 | 0.000 | -0.057 | <= 0.05 | Cumple |
| `faq_grounded_acc` | FAQ: la respuesta contiene hechos del contexto (N1) | 0.667 | 0.533 | -0.134 | >= 0.7 | No cumple |
| `faq_jujur_acc` | FAQ: el contexto no tiene la respuesta y el modelo admite no saberlo (N1x) | 0.000 | 0.750 | +0.750 | >= 0.7 | Cumple |
| `wrong_language_rate` | Respuestas de texto: idioma distinto al de la sesion del cliente | 0.039 | 0.000 | -0.039 | <= 0.03 | Cumple |

Objetivos alcanzados: 5 de 8. Tiempo de entrenamiento: 135,1 minutos. Respuestas truncadas por el limite de 192 tokens: 91 antes, 0 despues.

Desglose por tipo de escenario (n = numero de ejemplos):

| Tipo | Escenario | n | Antes | Despues | Diferencia |
|---|---|---:|---:|---:|---:|
| N1 | FAQ a partir del contexto | 15 | 0.67 | 0.53 | -0.13 |
| N1x | Contexto sin respuesta | 4 | 0.00 | 0.75 | +0.75 |
| N2 | Informacion todavia no disponible | 3 | 1.00 | 0.33 | -0.67 |
| N3 | Saludo o agradecimiento | 9 | 1.00 | 1.00 | 0.00 |
| N4 | Fuera del ambito de la tienda | 6 | 1.00 | 1.00 | 0.00 |
| N5 | Pregunta aclaratoria (ambiguedad) | 7 | 1.00 | 0.00 | -1.00 |
| N6 | Trampa (no es una accion) | 8 | 1.00 | 0.88 | -0.12 |
| N7 | Inyeccion, secreto o meta | 4 | 1.00 | 1.00 | 0.00 |
| N8 | Saludo corto | 6 | 0.83 | 1.00 | +0.17 |
| N9 | Pedir una persona o negociar | 4 | 0.75 | 1.00 | +0.25 |
| N10 | Usuario no propietario pide informes | 3 | 1.00 | 1.00 | 0.00 |
| N11 | Cambiar metodo de pago | 3 | 0.33 | 0.33 | 0.00 |
| N12 | Mensaje corto ambiguo | 3 | 1.00 | 1.00 | 0.00 |
| N13 | Idioma de la conversacion | 3 | 1.00 | 1.00 | 0.00 |
| T1 | Menu | 7 | 0.29 | 1.00 | +0.71 |
| T2 | Menu por categoria | 3 | 0.00 | 1.00 | +1.00 |
| T3 | Detalle de producto | 12 | 0.17 | 0.75 | +0.58 |
| T4 | Comparar productos | 4 | 0.00 | 1.00 | +1.00 |
| T5 | Pedido de un producto | 18 | 0.00 | 0.94 | +0.94 |
| T6 | Pedido de varios productos | 4 | 0.00 | 0.50 | +0.50 |
| T7 | Respuesta de cantidad tras el detalle | 6 | 0.00 | 1.00 | +1.00 |
| T8 | Estado del pedido | 6 | 0.33 | 0.83 | +0.50 |
| T9 | Cancelar pedido | 3 | 0.33 | 1.00 | +0.67 |
| T10 | Tarta personalizada, derivar a administracion | 3 | 0.00 | 0.00 | 0.00 |
| T11 | Informe financiero (propietario) | 3 | 0.00 | 1.00 | +1.00 |
| T12 | Analitica (propietario) | 3 | 0.67 | 1.00 | +0.33 |
| T13 | Cliente afirma haber pagado | 4 | 0.50 | 0.75 | +0.25 |
| T14 | Reclamaciones | 4 | 0.00 | 0.00 | 0.00 |
| T15 | Contenido del carrito | 4 | 0.25 | 1.00 | +0.75 |
| T16 | Reenviar metodo de pago | 4 | 0.50 | 1.00 | +0.50 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; todos los datos anteriores provienen de la evaluacion propia del autor sobre su dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con el archivo Q4_K_M de 1,1 GB y un contexto moderado; alrededor de 2,5-3 GB si se agota la ventana de contexto nativa de 32.768 tokens, dado el reducido tamano del KV cache de un modelo de 1,7 B.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente (por ejemplo RTX 3050, GTX 1650, RTX 4060, T4). No requiere A100 ni H100; en esas GPU estaria muy infrautilizado.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas, asi como en iGPU recientes con memoria unificada y en Apple Silicon. Tambien es viable en CPU pura, con latencias mayores.
- Opciones de despliegue: Ollama es el camino documentado por el autor (`ollama pull hf.co/LasagnaS/toti-qwen-1.7b-v8-gguf:Q4_K_M`). Tambien es compatible con llama.cpp y llama-server, LM Studio y llama-cpp-python. vLLM y TGI no son las opciones naturales para un unico archivo GGUF Q4_K_M.
- Latencia y throughput: no disponibles. La model card no publica mediciones de velocidad de inferencia.

## Comparativa con modelos similares

La comparacion se plantea en la categoria de modelos densos pequenos (1-2 B) usados como agentes o para tool calling. Las especificaciones de los modelos de referencia provienen de su documentacion publica.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Formatos disponibles |
|---|---|---|---|---|---|
| toti-qwen-1.7b-v8 (GGUF Q4_K_M) | 1,7 B | 32.768 (heredado del base) | Apache-2.0 | Ajuste LoRA especializado en tool calling y FAQ para una tienda concreta (indonesio/ingles) | GGUF Q4_K_M |
| unsloth/Qwen3-1.7B (modelo base) | 1,7 B | 32.768 | Apache-2.0 | Generalista, con modo de razonamiento | safetensors, GGUF |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 | Llama 3.2 Community License | Generalista, soporte de tool calling nativo | safetensors, GGUF |
| Gemma 3 1B | 1 B | 32.768 | Gemma Terms of Use | Generalista, multimodal en variantes superiores | safetensors, GGUF |

No hay datos publicados que comparen este ajuste con esos modelos en benchmarks estandar, por lo que la eleccion depende del dominio: el fine-tune supera con claridad al base en el dataset especifico de Toti Cakery, pero no hay evidencia de que generalice mejor que un modelo generalista fuera de ese conjunto.

## Limitaciones y advertencias

- Sobreajuste a las herramientas: el ajuste eleva la tasa de falsos positivos en `false_tool_rate` del 0,051 al 0,192, muy por encima del objetivo de 0,1. Casi uno de cada cinco mensajes que no requieren herramienta acaba disparando una llamada.
- Perdida de capacidad conversacional: `irrelevance_acc` cae del 0,949 al 0,808, por debajo del objetivo del 0,85.
- Deterioro en preguntas aclaratorias: el escenario N5 baja de 1,00 a 0,00; el modelo dejo de pedir aclaraciones ante mensajes ambiguos.
- Menor fidelidad al contexto en FAQ: `faq_grounded_acc` cae del 0,667 al 0,533, por debajo del objetivo de 0,7, lo que aumenta el riesgo de respuestas no ancladas al contexto recuperado.
- Escenarios sin resolver: T10 (tartas personalizadas, derivar a administracion) y T14 (reclamaciones) siguen en 0,00 tras el ajuste.
- Dominio muy cerrado: entrenado sobre conversaciones de una unica panaderia; fuera de ese catalogo y flujo de trabajo, el riesgo de alucinacion y de llamadas erroneas es alto.
- Idiomas: la model card solo menciona indonesio e ingles. No hay evaluacion en castellano ni en otros idiomas, y la ficha de HuggingFace no declara lista de idiomas.
- Contexto limitado: al derivar de Qwen3-1.7B, la ventana nativa es de 32.768 tokens como maximo sin tecnicas adicionales, suficiente para chat pero no para documentos largos.
- Validacion nula por la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin revisiones independientes ni terceros que reproduzcan las metricas.
- Cuantizacion con perdida: solo se publica Q4_K_M, de modo que existe una degradacion adicional respecto a los pesos sin cuantizar, no medida en la model card.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero el autor no documenta la procedencia ni los derechos de los datos de la panaderia usados en el dataset; conviene revisar ese punto antes de reutilizarlo en produccion.
- Nombre enganoso en el README: la tabla de resultados se rotula como `toti-qwen3-17b` cuando en realidad se refiere a un modelo de 1,7 B; es un error tipografico del autor que puede inducir a confusion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LasagnaS/toti-qwen-1.7b-v8-gguf
- Dataset de entrenamiento: https://huggingface.co/LasagnaS/toti-cakery-toolcall
- Modelo base: https://huggingface.co/unsloth/Qwen3-1.7B
- Version anterior v7 (GGUF): https://huggingface.co/LasagnaS/toti-qwen-1.7b-v7-gguf
- Version anterior v5 (GGUF): https://huggingface.co/LasagnaS/toti-qwen-1.7b-v5-gguf
- Ficha de terceros de la v7: https://free2aitools.com/model/lasagnas/toti-qwen-1.7b-v7-gguf
- Directorio de modelos GGUF: https://local-ai-zone.github.io/
- Comando de despliegue: `ollama pull hf.co/LasagnaS/toti-qwen-1.7b-v8-gguf:Q4_K_M`
