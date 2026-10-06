# LasagnaS/toti-qwen-1.7b-v10-gguf

## Resumen

toti-qwen-1.7b-v10-gguf es un fine-tune por LoRA de Qwen3-1.7B, publicado en formato GGUF (Q4_K_M) por el usuario LasagnaS, orientado a un caso de uso muy concreto: el chatbot de WhatsApp de la reposteria indonesia Toti Cakery. El modelo resuelve dos tareas acotadas: la seleccion y el relleno de argumentos de herramientas (tool calling) en indonesio e ingles, y la generacion de respuestas FAQ ancladas a un contexto recuperado por RAG. Su relevancia es la de un ejemplo reproducible de como un modelo denso de 1,72 B de parametros, cuantizado a ~1,1 GB, puede cubrir un flujo conversacional de negocio en hardware modesto.

El modelo base es unsloth/Qwen3-1.7B, un transformer decoder-only denso de la familia Qwen3, ajustado con LoRA sobre la revision v10 del dataset de tool calling del proyecto Chatbot-Cakery. El autor reporta 196,1 minutos de entrenamiento y una bateria de metricas propias sobre el split de test del mismo dataset, con mejoras muy marcadas en seleccion de herramienta (0,212 a 0,885) y en precision exacta de parametros (0,183 a 0,808), aunque tambien con regresiones en la tasa de llamadas innecesarias.

Se trata de un artefacto de nicho: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado, sin paper y sin evaluacion externa. Resulta util como referencia tecnica de un pipeline de fine-tuning + cuantizacion + despliegue en Ollama, y como punto de partida para verticalizar Qwen3-1.7B en otros dominios, no como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); adaptador LoRA sobre unsloth/Qwen3-1.7B |
| Parametros totales | 1.720.574.976 (1,72 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible para este fine-tune; el modelo base Qwen3-1.7B declara 32.768 tokens nativos (hasta 131.072 con YaRN) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada en el repositorio) |
| Idiomas soportados | indonesio e ingles segun la model card del autor; resto no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |
| Modelo base | unsloth/Qwen3-1.7B (a su vez derivado de Qwen/Qwen3-1.7B) |
| Autor | LasagnaS |
| Fecha de publicacion | 2026-10-06 (creacion y ultima actualizacion el mismo dia) |
| Tamano del repositorio | 1,1 GB |
| Etiquetas | gguf, ollama, tool-calling, toti-cakery, base_model:unsloth/Qwen3-1.7B, license:apache-2.0, endpoints_compatible, conversational |
| Descargas / likes | 0 / 0 |
| Pipeline declarado en HuggingFace | no disponible |

## Arquitectura y entrenamiento

La base es Qwen3-1.7B, un transformer decoder-only denso con atencion causal y mecanismo de atencion con query-key normalizado (QK-Norm) propio de la familia Qwen3. Sobre ese checkpoint se aplico un ajuste LoRA, es decir, se congelaron los pesos originales y se entrenaron matrices de bajo rango sobre las proyecciones de atencion y MLP; el resultado se fusiono y se convirtio a GGUF. No se publican hiperparametros de LoRA (rango, alpha, dropout) ni la composicion exacta del dataset, solo que procede de la carpeta `finetune/data/` del repositorio GitHub del proyecto Chatbot-Cakery, en su revision v10.

El entrenamiento duro 196,1 minutos y no hay evidencia de RLHF ni de DPO: el objetivo es un ajuste supervisado sobre ejemplos de tool calling y de respuestas FAQ con contexto. La innovacion practica del artefacto no esta en la arquitectura, sino en el ciclo completo: dataset de conversaciones reales de WhatsApp, evaluacion por tipos de escenario (41 categorias: N1-N15 conversacionales, T1-T19 de herramientas), cuantizacion a Q4_K_M y publicacion lista para `ollama pull`. El autor documenta que la mejora en `faq_jujur_acc` (reconocer que el contexto no contiene la respuesta) pasa de 0,000 a 1,000, lo que sugiere un ajuste deliberado contra la alucinacion en preguntas sin cobertura documental.

## Capacidades

- Tool calling en indonesio e ingles: selecciona la herramienta correcta y rellena argumentos en JSON, con `function_selection_acc` de 0,885 y `param_exact_acc` de 0,808 en el split de test del autor.
- Generacion de respuestas FAQ ancladas a contexto RAG: `faq_grounded_acc` de 0,800 (la respuesta incorpora hechos del contexto recuperado).
- Abstencion cuando el contexto no contiene la respuesta: `faq_jujur_acc` de 1,000 (el modelo admite no saber en lugar de inventar).
- Gestion de pedidos: crear pedido, consultar estado, cancelar pedido, consultar contenido del carrito y cambiar metodo de pago.
- Consulta de catalogo: listar menu completo, menu por categoria, detalle de producto, comparacion entre productos.
- Control de acceso por rol: genera informes financieros y analitica solo cuando el interlocutor es el propietario (escenarios T11 y T12).
- Consistencia de idioma de sesion: `wrong_language_rate` pasa de 0,321 a 0,000, es decir, deja de responder en un idioma distinto al del cliente.
- Formato de salida de tool call siempre parseable: `invalid_call_rate` pasa de 0,048 a 0,000.
- No se declaran capacidades de vision, audio, modo thinking explicito ni decodificacion especulativa en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada en WhatsApp: el modelo puede gestionar conversaciones multi-turno de un comercio de reposteria, distinguiendo entre preguntas de catalogo (T1-T4), gestion de pedidos (T5-T9) y mensajes fuera de alcance (N4). El tag `ollama` y el tamano de 1,1 GB permiten desplegarlo en una instancia barata o incluso en local.
- Respuestas FAQ con recuperacion aumentada: dado un contexto recuperado de la base documental de la tienda, el modelo responde con hechos verificables (`faq_grounded_acc` 0,800) y se abstiene si el contexto no cubre la pregunta (`faq_jujur_acc` 1,000), lo que reduce el riesgo de respuestas inventadas en produccion.
- Orquestacion de pedidos mediante function calling: en lugar de mantener el estado de la conversacion en el prompt, el modelo emite llamadas estructuradas a funciones del backend (crear pedido, consultar estado, cancelar), con una tasa de JSON malformado de 0,000 medida por el autor.
- Asistente bilingue indonesio-ingles para mercados del sudeste asiatico: la metrica de idioma incorrecto cae a 0,000, por lo que el modelo mantiene la lengua de la sesion sin cambiar de idioma a mitad de conversacion.
- Informes internos con control de rol: los escenarios T11 (informe financiero) y T12 (analitica) pasan a 1,00 y 1,00 respectivamente, lo que permite exponer herramientas sensibles condicionadas a la identidad del usuario.
- Filtrado de intentos de inyeccion de prompt y peticiones de meta-informacion: los escenarios N7 (inyeccion/secretos/meta) se mantienen en 1,00 antes y despues del ajuste, lo que lo hace util como primera barrera en un pipeline conversacional.
- Base para verticalizacion de Qwen3-1.7B en otros dominios: el pipeline documentado (LoRA + cuantizacion GGUF + evaluacion por escenarios) es reutilizable para construir asistentes de tool calling en sectores distintos, con un coste de entrenamiento inferior a 3,5 horas.
- Despliegue en el borde o en CPU: con 1,1 GB de pesos en Q4_K_M, es viable ejecutarlo en mini-PC, portatiles sin GPU dedicada o dispositivos Apple Silicon, util para prototipos sin presupuesto de GPU.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el propio autor en la model card. Se midieron sobre el split `test` del mismo dataset v10 (185 filas), con los prompts exactos de produccion, temperatura 0,7, top_p 0,8 y limite de 192 tokens. No son benchmarks independientes ni comparables con MMLU, HumanEval o GSM8K: no se han publicado resultados en esas suites.

| Metrica | Significado | Antes (base) | Despues (fine-tune) | Delta | Objetivo | Estado |
|---|---|---:|---:|---:|---|:---:|
| `function_selection_acc` | filas con herramienta: elige la herramienta correcta | 0,212 | 0,885 | +0,673 | >= 0,85 | cumple |
| `param_exact_acc` | filas con herramienta: herramienta y argumentos exactos | 0,183 | 0,808 | +0,625 | >= 0,70 | cumple |
| `irrelevance_acc` | filas sin herramienta: no invoca ninguna | 0,914 | 0,840 | -0,074 | >= 0,85 | no cumple |
| `false_tool_rate` | filas sin herramienta: invoca una innecesariamente | 0,086 | 0,160 | +0,074 | <= 0,10 | no cumple |
| `invalid_call_rate` | filas con herramienta: JSON ilegible | 0,048 | 0,000 | -0,048 | <= 0,05 | cumple |
| `faq_grounded_acc` | FAQ: la respuesta contiene hechos del contexto (N1) | 0,600 | 0,800 | +0,200 | >= 0,70 | cumple |
| `faq_jujur_acc` | FAQ: sin respuesta en contexto, admite no saber (N1x) | 0,000 | 1,000 | +1,000 | >= 0,70 | cumple |
| `wrong_language_rate` | respuesta de texto en idioma distinto al de la sesion | 0,321 | 0,000 | -0,321 | <= 0,03 | cumple |

Objetivos alcanzados: 6 de 8. Tiempo de entrenamiento: 196,1 minutos. Respuestas truncadas por el limite de 192 tokens: 109 antes, 0 despues.

Desglose por tipo de escenario (n, exactitud antes y despues):

| Tipo | Escenario | n | Antes | Despues | Delta |
|---|---|---:|---:|---:|---:|
| N1 | FAQ a partir de contexto | 15 | 0,60 | 0,80 | +0,20 |
| N1x | contexto sin respuesta | 4 | 0,00 | 1,00 | +1,00 |
| N2 | informacion aun no disponible | 3 | 1,00 | 0,67 | -0,33 |
| N3 | saludo / agradecimiento | 5 | 1,00 | 1,00 | 0,00 |
| N4 | fuera del ambito de la tienda | 6 | 1,00 | 1,00 | 0,00 |
| N5 | repregunta (ambiguedad) | 7 | 0,71 | 0,29 | -0,43 |
| N6 | trampa (no es una accion) | 8 | 0,88 | 0,88 | 0,00 |
| N7 | inyeccion / secretos / meta | 4 | 1,00 | 1,00 | 0,00 |
| N8 | saludo corto | 4 | 1,00 | 1,00 | 0,00 |
| N9 | pide persona / negociacion | 4 | 1,00 | 1,00 | 0,00 |
| N10 | no propietario pide informe | 3 | 1,00 | 1,00 | 0,00 |
| N11 | cambio de metodo de pago | 3 | 0,00 | 0,33 | +0,33 |
| N12 | mensaje corto ambiguo | 3 | 0,67 | 1,00 | +0,33 |
| N13 | idioma de la conversacion | 3 | 1,00 | 1,00 | 0,00 |
| N14 | relleno de contraste (id/en) | 6 | 1,00 | 1,00 | 0,00 |
| N15 | sin descripcion en la model card | 3 | 1,00 | 0,00 | -1,00 |
| T1 | menu | 7 | 0,14 | 1,00 | +0,86 |
| T2 | menu por categoria | 3 | 0,00 | 0,67 | +0,67 |
| T3 | detalle de producto | 12 | 0,25 | 0,92 | +0,67 |
| T4 | comparar productos | 4 | 0,00 | 0,75 | +0,75 |
| T5 | pedido de un producto | 18 | 0,06 | 0,94 | +0,89 |
| T6 | pedido de varios productos | 4 | 0,00 | 1,00 | +1,00 |
| T7 | respuesta de cantidad tras el detalle | 6 | 0,17 | 1,00 | +0,83 |
| T8 | estado del pedido | 6 | 0,33 | 0,83 | +0,50 |
| T9 | cancelar pedido | 3 | 0,67 | 1,00 | +0,33 |
| T10 | tarta personalizada, derivar a administracion | 3 | 0,00 | 0,00 | 0,00 |
| T11 | informe financiero (propietario) | 3 | 0,00 | 1,00 | +1,00 |
| T12 | analitica (propietario) | 3 | 1,00 | 1,00 | 0,00 |
| T13 | afirma haber pagado | 4 | 0,50 | 0,25 | -0,25 |
| T14 | queja | 4 | 0,00 | 0,00 | 0,00 |
| T15 | contenido del carrito | 5 | 0,60 | 0,60 | 0,00 |
| T16 | reenviar metodo de pago | 4 | 0,00 | 0,50 | +0,50 |
| T17 | sin descripcion en la model card | 7 | 0,00 | 1,00 | +1,00 |
| T18 | sin descripcion en la model card | 5 | 0,20 | 0,80 | +0,60 |
| T19 | sin descripcion en la model card | 3 | 0,00 | 1,00 | +1,00 |

## Requisitos de hardware

Estimaciones derivadas del tamano del repositorio (1,1 GB) y del numero de parametros; el autor no publica requisitos oficiales.

- Pesos Q4_K_M: aproximadamente 1,1 GB en disco y en memoria.
- VRAM estimada para inferencia en llama.cpp/Ollama: del orden de 1,5 a 2 GB con contexto de 4K tokens, y de 2,5 a 3 GB con contexto de 32K; el resto lo consume la cache KV.
- Si se convirtiera de nuevo a safetensors en FP16 (no disponible en este repositorio), los pesos ocuparian unos 3,4 GB y la VRAM necesaria subiria a 5-6 GB con contexto largo.
- Cabe en cualquier GPU de consumo con 4 GB o mas de VRAM: GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090 (con margen amplio). Tambien funciona en CPU sin GPU, en Apple Silicon mediante Metal y en placas tipo Jetson Orin Nano.
- Despliegue: Ollama de forma nativa (`ollama pull hf.co/LasagnaS/toti-qwen-1.7b-v10-gguf:Q4_K_M`), llama.cpp, llama-cpp-python, LM Studio y cualquier servidor GGUF con API compatible con OpenAI. El tag `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints, aunque no se documenta la configuracion.
- vLLM soporta GGUF pero con rendimiento inferior al de safetensors; TGI no carga GGUF de forma nativa y este repositorio no incluye pesos en ese formato.
- Latencia y throughput: no disponibles. Como referencia orientativa no medida, un modelo denso de 1,7 B en Q4_K_M sobre una GPU de consumo moderna suele generar en el rango de decenas a un par de centenares de tokens por segundo con llama.cpp, muy por encima de las necesidades de un chatbot de WhatsApp.

## Comparativa con modelos similares

No hay datos de benchmarks comparativos entre este fine-tune y otras alternativas. La tabla contrasta especificaciones del modelo base y de alternativas de tamano similar; los datos de contexto y licencia proceden de la documentacion oficial de cada modelo, no de la informacion proporcionada en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| toti-qwen-1.7b-v10-gguf | 1,72 B | 32.768 (heredado del base) | Apache 2.0 | Fine-tune de nicho para tool calling y FAQ de una tienda de reposteria |
| Qwen3-1.7B (base) | 1,72 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | Modelo generalista con modo thinking; sin entrenamiento especifico de tool calling para este dominio |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | Generalista multilingue, permite uso comercial sin restricciones |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Llama 3.2 Community License | Generalista, con restricciones de licencia para determinados usos |
| Gemma-3-1B-it | 1 B | 32.768 | Gemma Terms of Use | Generalista multimodal de entrada; licencia con condiciones de uso aceptable |

Comparativa de rendimiento: no disponible. El autor solo publica la comparacion entre el modelo base y su propio fine-tune sobre el split de test de su dataset, sin contrastar con terceros.

## Limitaciones y advertencias

- Especializacion extrema: el ajuste esta hecho para el flujo conversacional de una reposteria indonesia concreta. Fuera de ese dominio, el comportamiento degradado es esperable y no esta medido.
- Idiomas: la model card solo declara indonesio e ingles. No hay ninguna evaluacion en castellano ni en otros idiomas; el rendimiento en espanol no esta garantizado.
- Regresion en la tasa de llamadas innecesarias a herramientas: `false_tool_rate` sube de 0,086 a 0,160 y `irrelevance_acc` baja de 0,914 a 0,840, ambos por encima del umbral objetivo del propio autor. En produccion esto implica invocaciones espurias de funciones del backend.
- Regresiones por escenario: N5 (repreguntar ante ambiguedad) baja de 0,71 a 0,29, N15 de 1,00 a 0,00, N2 de 1,00 a 0,67 y T13 (cliente afirma haber pagado) de 0,50 a 0,25. Los escenarios T10 (tarta personalizada) y T14 (quejas) se quedan en 0,00 antes y despues.
- Evaluacion no independiente: las metricas se calculan sobre el split de test del mismo dataset con el que se entreno el modelo, con prompts de produccion. No hay conjunto externo, ni evaluacion por terceros, ni comparacion con benchmarks estandar.
- Tamano muestral reducido: 185 filas de test y escenarios con n=3, lo que da una granularidad de +-0,33 por observacion. Las diferencias pequenas de la tabla deben interpretarse con mucha cautela.
- Riesgo de alucinacion: aunque `faq_jujur_acc` llega a 1,000 en el test, el modelo sigue siendo un LM generativo; en contextos RAG mal recuperados o fuera de distribucion puede producir respuestas no ancladas. Requiere validacion humana o comprobacion posterior contra la base documental.
- Riesgo de inyeccion de prompt: el escenario N7 se mantiene en 1,00, pero se trata de un test propio y pequeno; no sustituye a una capa de saneamiento de entradas en produccion.
- El tool calling se emite como texto/JSON y depende por completo del parser del cliente; un cambio de plantilla de chat o de version de Ollama puede romper el formato.
- Qwen3-1.7B admite modo thinking; la model card no especifica si el pipeline de produccion lo desactiva, lo que puede alterar la latencia y el formato de salida.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte, y no se documenta la procedencia ni los derechos del dataset de entrenamiento.
- Madurez del artefacto: 0 descargas, 0 likes, creado y actualizado el mismo dia, sin revision de la comunidad. Las tablas de la model card etiquetan el modelo como `toti-qwen3-17b`, lo que sugiere un error de nomenclatura y poca revision editorial.
- Cita el fichero `hasil_metrik_v10.json` con los resultados crudos, pero no se confirma que este incluido en el repositorio de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LasagnaS/toti-qwen-1.7b-v10-gguf
- Modelo base usado: https://huggingface.co/unsloth/Qwen3-1.7B
- Modelo base original: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto con el dataset de fine-tuning: https://github.com/kevinilhamramadhan/Chatbot-Cakery
- Paper: no disponible
- Blog o articulo tecnico: no disponible
- Demo: no disponible
