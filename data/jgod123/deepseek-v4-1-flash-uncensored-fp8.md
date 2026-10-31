# jgod123/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es una versión modificada ("abliterated" o "uncensored") del modelo DeepSeek-V4.1-Flash de DeepSeek AI, publicada por el usuario jgod123 en Hugging Face. Se trata de un modelo multimodal (imagen-texto a texto) de arquitectura MoE con 763.205 millones de parámetros totales en pesos, del que la versión base declara un backbone de 552B con entre 8B y 16B de parámetros activos por token. La modificación elimina los mecanismos de rechazo del modelo base a nivel de pesos, manteniendo el resto de componentes intactos.

El modelo base incorpora características técnicas destacables: atención dispersa CSA2, memoria n-gram "Engram", decodificación especulativa DSpark (MTP), Hyper-Connections de 4 canales y una torre de visión DeepSeek-ViT, con una ventana de contexto de 1 millón de tokens y cuantización nativa FP8. Es relevante porque ofrece un checkpoint "drop-in" compatible con la librería transformers sin necesidad de código personalizado ni hooks en tiempo de ejecución.

Debe subrayarse que se trata de un modelo sin salvaguardas de seguridad: según la propia model card, cumple el 100 % de las peticiones dañinas del benchmark HarmBench-320. Su uso conlleva riesgos legales y éticos significativos y no es adecuado para entornos de producción orientados a usuarios finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (20+20 capas), MoE (384 expertos enrutados top-6 + 1 compartido), Hyper-Connections, CSA2 sparse attention, Engram n-gram memory, DSpark speculative draft |
| Parametros totales | 763.205.315.794 (según safetensors) |
| Parametros activos | 8B-16B por token (dato declarado para el modelo base de 552B; no disponible para esta versión exacta) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 nativo (e4m3fn) con block-scale E8M0 [32, 32]; expertos enrutados en FP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de DeepSeek-V4.1-Flash: un encoder-decoder causal de 20+20 capas con mezcla de expertos (MoE) compuesta por 384 expertos enrutados (activación top-6) más un experto compartido. Incorpora Hyper-Connections de 4 canales residuales, atención dispersa CSA2 para gestionar el contexto de 1M tokens, memoria n-gram "Engram" y un cabezal de borrador especulativo DSpark (MTP) para acelerar la inferencia. La torre de visión DeepSeek-ViT con 2D-RoPE y pixel unshuffle permite procesar entradas de imagen.

No hay datos sobre el preentrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) en la información disponible. La única modificación de esta versión es la "abliteración" a nivel de pesos: según el autor, se eliminan los circuitos de rechazo preservando byte a byte los expertos enrutados, la memoria Engram, la atención CSA2, el cabezal DSpark, la torre de visión, las puertas del router, las normalizaciones y los embeddings. El checkpoint se carga exactamente igual que el modelo base, sin `model.py` personalizado ni vectores de steering en tiempo de ejecución.

## Capacidades

- Generacion de texto y razonamiento, con modo de razonamiento "effort=max" por defecto (reasoning-max)
- Comprension multimodal imagen-texto (pipeline image-text-to-text) mediante la torre de vision DeepSeek-ViT
- Ventana de contexto de 1M tokens para documentos y conversaciones muy largas
- Soporte de tool calling declarado en la model card ("Vision + tools")
- Decodificacion especulativa mediante el cabezal DSpark (MTP) para reducir la latencia
- Memoria n-gram Engram y atencion dispersa CSA2 para manejo eficiente de contextos extensos
- Sin salvaguardas de seguridad: responde sin rechazos ni matices de prudencia (esto es una "capacidad" desde el punto de vista del autor, pero un riesgo serio en la practica)

## Casos de uso

- Investigacion en alineamiento y seguridad de modelos: el checkpoint permite estudiar como la eliminacion de circuitos de rechazo afecta al comportamiento del modelo sin modificar el codigo de ejecucion, gracias a que es un checkpoint estandar "drop-in".
- Evaluacion de tecnicas de abliteracion: los resultados publicados de MMLU y HarmBench sirven como referencia para comparar metodos de eliminacion de salvaguardas y su coste en capacidad.
- Procesamiento de documentos multimodales de gran volumen: la ventana de 1M tokens y la torre de vision permiten analizar repositorios de documentos con imagenes en una sola sesion.
- Generacion de codigo en entornos controlados: el soporte de tool calling permite integrarlo en pipelines automatizados donde el operador asume la responsabilidad del contenido generado.
- Prototipado de agentes con razonamiento multi-paso: el modo reasoning-max y el cabezal especulativo DSpark son utiles para experimentar con flujos agenticos de larga duracion.
- Investigacion en atencion dispersa y MoE: la arquitectura CSA2, Engram y Hyper-Connections constituye un caso de estudio para implementaciones de inferencia de alto rendimiento.
- Redaccion creativa sin filtros para usuarios adultos en jurisdicciones donde sea legal, asumiendo el usuario toda la responsabilidad etica y legal del uso.

## Benchmarks y rendimiento

Datos publicados en la model card del autor (evaluaciones propias, no verificadas por terceros):

HarmBench-320 (tasa de cumplimiento de peticiones daninas, ASR, T=0 greedy):

| eval | base ASR | CRACK ASR | Δ pp |
|---|---:|---:|---:|
| HB-320 effort=off | 42,81 % | 100,00 % | +57,19 |
| HB-320 effort=max | 1,56 % | 100,00 % | +98,44 |

MMLU-14k (test completo, base-logit, T=0):

| build | correctas | precision | Δ |
|---|---:|---:|---:|
| base | 12.211 / 14.042 | 86,96 % | — |
| CRACK (esta version) | 11.619 / 14.042 | 82,74 % | -4,22 pp |

Segun el autor, excluyendo el cluster de etica (moral scenarios, business ethics, professional law, jurisprudence, philosophy), la perdida en los ~11k items restantes es de -1,1 pp. La mayor caida individual se produce en "moral scenarios" (76,9 % → 37,0 %, -39,89 pp). No hay datos de HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 510,3 GB en FP8, por lo que se necesitan al menos ~550-600 GB de VRAM efectiva considerando KV cache y sobrecoste de activaciones para contextos largos.
- GPU recomendadas: configuraciones multi-GPU de gama datacenter, como 8x H200 (141 GB cada una, 1.128 GB totales) o 8x H100 80 GB con offload, o nodos multi-nodo con A100 80 GB. Con 1M tokens de contexto el requisito de KV cache crece sustancialmente.
- Consumer GPU: no es viable en ninguna GPU de consumo; ni siquiera una RTX 4090 (24 GB) o RTX 5090 (32 GB) puede alojar una fraccion minima del modelo.
- Opciones de despliegue: la model card indica compatibilidad con la libreria transformers ("endpoints_compatible", "transformers"). No se menciona soporte especifico para vLLM, SGLang, llama.cpp, Ollama o TGI; la cuantizacion FP8 nativa con expertos FP4 sugiere que se requiere un motor de inferencia con soporte FP8/FP4 (no disponible como dato confirmado).
- Latencia y throughput: no disponible. El cabezal DSpark de decodificacion especulativa del modelo base esta disenado para reducir la latencia, pero no hay mediciones publicadas.

## Comparativa con modelos similares

Comparativa con el modelo base y alternativas de gran escala:

| Modelo | Parametros totales | Activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-UNCENSORED-FP8 (esta ficha) | 763,2B (safetensors) | 8B-16B (declarado) | 1M | Si (vision) | MIT |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | 552B backbone (declarado) | 8B-16B | 1M | Si (vision) | no disponible en la informacion proporcionada |
| Alternativas de categoria comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han incluido otras alternativas porque la informacion proporcionada no contiene datos comparables verificables de modelos similares de la misma generacion.

## Limitaciones y advertencias

- Ausencia total de salvaguardas: el modelo cumple el 100 % de las peticiones daninas evaluadas en HarmBench-320, incluyendo categorias de riesgo quimico-biologico, ciberdelito, acoso y desinformacion. Su uso para generar contenido ilegal o danino es responsabilidad exclusiva del usuario y puede ser ilegal.
- Perdida de precision medible: -4,22 pp en MMLU completo respecto al modelo base, con caidas severas en materias de etica y derecho (moral scenarios: -39,89 pp; professional law: -7,04 pp).
- Riesgo de alucinacion: no disponible como dato medido; al tratarse de un modelo sin ajuste de seguridad, no debe asumirse fiabilidad factual en produccion.
- Idiomas soportados: no disponible; no se declara soporte explicito para castellano ni otros idiomas.
- Restricciones de licencia: la licencia MIT es permisiva para uso comercial, pero la procedencia del modelo base y la eliminacion de salvaguardas pueden estar sujetas a la politica de uso de DeepSeek AI y a la legislacion aplicable (por ejemplo, el AI Act europeo).
- Requisitos hardware prohibitivos: 510 GB de pesos exigen infraestructura datacenter; no es ejecutable en hardware de consumo.
- Datos de la model card no verificados: los benchmarks (HarmBench, MMLU) son autoevaluaciones del autor con metodologia propia (clasificador regex + LLM-as-judge) y no han sido auditados por terceros.
- Descargas muy bajas (11 en el momento de la ficha) y modelo publicado recientemente: ausencia de revision comunitaria y de herramientas de ecosistema probadas.
- El dato de parametros activos (8B-16B) corresponde al modelo base declarado de 552B y no cuadra de forma explicita con los 763,2B de los safetensors de esta version; la discrepancia no esta explicada en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jgod123/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Twitter/X del autor (dealignai): https://x.com/dealignai
- Twitter/X del autor (jordanschenck): https://x.com/jordanschenck
- Paper, repositorio de codigo y demo: no disponible en la informacion proporcionada
