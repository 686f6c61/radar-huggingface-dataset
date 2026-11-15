# darajcc/daraj-270m

## Resumen

daraj-270m es un modelo de lenguaje causal compacto de 268.098.176 parametros (aproximadamente 270M) desarrollado por Daraj Compute and Cognition (darajcc) y publicado en Hugging Face bajo licencia Apache 2.0. Se construye sobre la arquitectura Gemma 3 270M, optimizada mediante Unsloth, y esta especializado en la orquestacion de herramientas a traves del Model Context Protocol (MCP) para la plataforma de pagos y billetes DarajPay.

A diferencia de un modelo conversacional generico, daraj-270m no produce texto libre sin estructura: emite JSON estricto con tres campos bien definidos (`thought`, `tool_call` y `text_response`), lo que lo convierte en un componente de orquestacion para flujos de pago regional, busqueda de catalogo y reservas en servicios de transporte y entradas (autobuses, vuelos, eventos y citas).

Su relevancia actual reside en dos factores: el tamano reducido (cabe en cualquier GPU de consumo e incluso en CPU con cuantizacion) y la especializacion en function calling estructurado, un nicho donde los modelos generalistas de gran tamano suelen ser sobredimensionados y mas caros de desplegar. El modelo esta entrenado unicamente en ingles y su uso previsto es la integracion con el ecosistema de herramientas propietario de DarajPay.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Gemma 3 270M, optimizado con Unsloth) |
| Parametros totales | 268.098.176 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar via transformers/bitsandbytes) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

daraj-270m es un transformer causal denso derivado de Gemma 3 270M, la variante mas pequena de la familia Gemma 3 de Google. El autor indica que el modelo base fue optimizado mediante Unsloth, una libreria de fine-tuning eficiente en memoria que acelera el entrenamiento y reduce el consumo de VRAM mediante kernels optimizados y tecnicas de ahorro de memoria. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT supervisado; la model card solo describe el proposito (orquestacion de herramientas MCP para DarajPay) y el formato de salida esperado.

La innovacion tecnica principal no esta en la arquitectura sino en la interfaz de salida: el modelo esta disenado para producir un objeto JSON con un paso de razonamiento explicito (`thought`), una llamada a herramienta (`tool_call` con `name` y `arguments`) y una respuesta en lenguaje natural (`text_response`). Este patron de "razonamiento + accion" facilita la validacion programatica antes de ejecutar cualquier herramienta, tal como muestra el snippet de la model card, que insiste en parsear el JSON y comprobar la presencia de `tool_call` antes de actuar.

## Capacidades

- Generacion de JSON estructurado para function calling y tool calling, con campos `thought`, `tool_call` y `text_response`.
- Orquestacion de herramientas via Model Context Protocol (MCP) para la plataforma DarajPay.
- Busqueda en catalogo de servicios (transporte, vuelos, eventos, citas) mediante llamadas a herramientas como `darajpay_search_offerings`.
- Flujos de pago y reserva regionales a traves de invocaciones de herramientas especificas del dominio.
- Generacion de texto conversacional breve en la respuesta al usuario (`text_response`).
- Capacidad de razonamiento intermedio explicito mediante el campo `thought` (no es un modo "thinking" separado, sino parte del esquema de salida).
- Soporte multilingue limitado: solo ingles.
- No se documentan capacidades de vision, audio, codigo general ni matematicas en la informacion disponible.

## Casos de uso

- **Atencion al cliente para reservas de transporte**: el modelo recibe la consulta del usuario ("bus de Jijiga a Addis"), emite una llamada a `darajpay_search_offerings` con los argumentos adecuados y devuelve una respuesta natural con los resultados; su tamano permite desplegarlo en el borde o en instancias pequenas junto al backend de pagos.
- **Orquestacion de herramientas MCP en produccion**: al producir JSON estricto con `tool_call.name` y `arguments`, se integra directamente en un router de herramientas que valida el esquema y ejecuta la accion, sin necesidad de parsers heuristicos de texto libre.
- **Flujos de pago conversacionales**: el modelo puede encadenar busqueda de oferta, seleccion y confirmacion de pago invocando las herramientas de DarajPay correspondientes, manteniendo una respuesta al usuario en cada paso.
- **Reserva de eventos y citas**: para consultas del tipo "quiero una cita el martes", el modelo traduce la intencion a llamadas a herramientas de agenda y devuelve confirmacion, lo que reduce la logica de enrutamiento en el backend.
- **Asistente embebido de bajo coste**: con 270M parametros, puede ejecutarse en CPU o en GPU de consumo (por ejemplo, una RTX 3060) dentro del propio servicio de ticketing, evitando latencia de red hacia APIs externas de LLM.
- **Prototipado rapido de agentes de dominio**: sirve como base para equipos que quieran construir asistentes de pago o reservas con salida estructurada y validable, gracias a su licencia Apache 2.0 y a su compatibilidad con `transformers` y text-generation-inference.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 0,6 GB (el repo completo mide 0,6 GB). En fp16 se estiman en torno a 0,55 GB solo para pesos; con cuantizacion a 8 bits o 4 bits el consumo baja a rangos de 0,3-0,4 GB, mas el overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la practica; una RTX 3060, RTX 4060, T4 o superior funcionan sin problema. En A100/H100 el modelo queda enormemente sobredimensionado en cuanto a hardware.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU con cuantizacion.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (documentado en la model card), text-generation-inference (etiqueta `text-generation-inference` en el repo), y por compatibilidad de arquitectura Gemma 3, tambien llama.cpp/Ollama mediante conversion a GGUF (no documentado por el autor).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| daraj-270m | 268M | no disponible | Tool calling MCP para DarajPay | Apache 2.0 | Hugging Face |
| Gemma 3 270M (base) | 270M | no disponible en la informacion | Modelo generalista | Gemma Terms | Hugging Face / Google |
| Qwen2.5-0.5B-Instruct | ~500M | 32K (segun documentacion publica de Qwen) | Instrucciones generales y tool calling | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct | ~360M | 8K (segun documentacion publica de Hugging Face) | Instrucciones generales | Apache 2.0 | Hugging Face |

Nota: los datos de contexto de los modelos comparativos provienen de su documentacion publica habitual; no se dispone de benchmarks comparativos con daraj-270m en la informacion proporcionada. daraj-270m se diferencia por su especializacion estrecha en el esquema JSON de DarajPay, mientras que los alternativos son generalistas.

## Limitaciones y advertencias

- **Idioma**: solo entrenado en ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- **Dominio cerrado**: el modelo esta especializado en las herramientas MCP de DarajPay; fuera de ese conjunto de herramientas su utilidad es limitada y puede producir llamadas invalidas.
- **Riesgo de alucinacion**: al generar JSON, puede inventar nombres de herramientas o argumentos no existentes; la model card recomienda explicitamente validar el JSON y comprobar `tool_call.name` antes de ejecutar cualquier accion.
- **Salida no garantizada como JSON valido**: el snippet de ejemplo incluye manejo de `json.JSONDecodeError`, lo que indica que la salida puede no ser JSON estricto en todos los casos.
- **Contexto desconocido**: no se documenta la longitud de contexto, lo que impide planificar conversaciones multi-turno largas con garantias.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo deriva de Gemma 3, cuyos terminos de uso pueden imponer condiciones adicionales al modelo base; conviene revisar la compatibilidad antes de un despliegue comercial.
- **Madurez**: el repositorio no tiene descargas ni likes en el momento de la consulta y fue creado y actualizado el mismo dia (15 de noviembre de 2026), por lo que no hay evidencia publica de uso en produccion.
- **Sin benchmarks**: no hay datos de rendimiento publicados que permitan estimar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darajcc/daraj-270m
- Organizacion en Hugging Face: https://huggingface.co/darajcc
- Sitio del desarrollador: https://daraj.cc
- Unsloth (libreria de optimizacion citada): https://github.com/unslothai/unsloth
- Familia Gemma 3 (modelo base): https://huggingface.co/google/gemma-3-270m
