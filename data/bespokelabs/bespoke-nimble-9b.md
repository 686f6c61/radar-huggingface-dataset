# bespokelabs/Bespoke-Nimble-9B

## Resumen

Bespoke-Nimble-9B es un adaptador LoRA (PEFT) sobre el checkpoint base Qwen3.5-9B, publicado por Bespoke Labs. No es un modelo generativo al uso: su función es la predicción estructurada y el anclaje de evidencias, es decir, dado un contexto y un esquema de campos, devuelve directamente la probabilidad de cada respuesta permitida (booleanos, opciones de una lista cerrada o niveles enteros de una rúbrica). El flujo evaluado no genera razonamiento ni respuestas libres, sino que puntúa los tokens de respuesta admitidos.

El repositorio contiene únicamente el adaptador (unos 165 MiB, con un repositorio total de 0,2 GB), el tokenizador, el constructor exacto de prompts y código de inferencia de referencia, además de resultados agregados de evaluación. Para usarlo hay que descargar por separado el checkpoint completo de Qwen3.5-9B, ya que los pesos base no se duplican.

Su relevancia actual está en el nicho de las decisiones verificables: clasificación con restricciones duras, verificación de elegibilidad, moderación y puntuación por rúbricas, donde se prefiere una salida acotada y auditable frente al texto libre de un LLM generalista. La licencia es Apache 2.0, el único idioma declarado es el inglés y cada prompt está limitado a 2.048 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-9B) con adaptador LoRA; la inferencia se restringe a la puntuacion de tokens de respuesta permitidos |
| Parametros totales | Modelo base de ~9B; adaptador LoRA de ~165 MiB. El numero exacto de parametros entrenables no esta disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Limitada a 2.048 tokens de prompt en este flujo; los prompts que la superan se rechazan, no se truncan. La ventana nativa del modelo base no esta disponible |
| Tipos de cuantizacion | No disponible. La ejecucion de referencia usa BF16 en GPU CUDA; no se documentan pesos GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el checkpoint base Qwen3.5-9B |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-9B, cargado mediante la libreria PEFT. La innovacion principal no esta en la arquitectura, sino en el procedimiento de puntuacion: en lugar de generar texto, el modelo calcula la distribucion de probabilidad sobre los tokens que corresponden a las respuestas validas de cada campo del esquema. Para campos booleanos, opciones enumeradas (`type="enum"`) y niveles de rubrica (cadenas de enteros como `["0", "1", "2"]`) se obtiene directamente la opcion seleccionada y, en el caso de las rubricas, una puntuacion esperada ponderada por probabilidad. Cada campo admite como maximo 26 opciones.

El repositorio incluye el constructor exacto de prompts y codigo de inferencia de referencia que preserva el formato de entrenamiento y el calculo de probabilidad de cada campo, procesado de forma individual. La ejecucion original uso PyTorch 2.8.0 con CUDA 12.8 y BF16, y no requiere `trust_remote_code=True`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si hubo RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Prediccion estructurada con esquemas: campos booleanos, enumeraciones de opciones cerradas y niveles de rubrica enteros.
- Puntuacion con probabilidades explicitas por campo, lo que permite umbrales de confianza y calculo de puntuacion esperada ponderada.
- Anclaje de evidencias: las decisiones se condicionan al contexto aportado (por ejemplo, una politica de devoluciones y la fecha de compra).
- Decisiones de elegibilidad y comprobaciones de reglas expresadas en lenguaje natural dentro del contexto.
- Clasificacion con taxonomias definidas por el usuario, con descripciones por opcion (`choice_descriptions`) para guiar la decision.
- Inferencia sin generacion de razonamiento ni texto libre: salida determinista y acotada al conjunto de respuestas permitidas.
- Soporte de multiples campos en un mismo esquema, procesados individualmente.
- Idioma: unicamente ingles.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Decisiones de elegibilidad automatizadas: con un contexto como "la tienda acepta devoluciones en 30 dias; el articulo se compro hace 12 dias", el modelo devuelve `true` para el campo booleano de elegibilidad y su probabilidad asociada, lo que permite fijar umbrales de confianza antes de actuar.
- Moderacion de contenido con taxonomia cerrada: clasificar textos en categorias predefinidas con descripciones por clase, obteniendo una distribucion de probabilidad que sirve para derivar casos ambiguos a revision humana.
- Puntuacion por rubricas en educacion: evaluar respuestas abiertas contra niveles enteros (`0`, `1`, `2`) descritos en el esquema y obtener una puntuacion esperada ponderada, con trazabilidad de la probabilidad de cada nivel.
- Verificacion de fidelidad en pipelines RAG: comprobar si un fragmento recuperado respalda una afirmacion concreta, usando el contexto recuperado y un campo booleano o de nivel para el grado de respaldo.
- Enrutado de tickets de soporte: mapear el texto del ticket a un departamento o tipo de incidencia mediante un campo enumerado, con la ventaja de que la salida siempre pertenece al conjunto permitido.
- Codificacion de respuestas de encuestas: asignar respuestas abiertas a categorias preexistentes de un codebook, con probabilidades por categoria para medir el acuerdo entre anotadores.
- Control de calidad en extraccion de datos: validar cada campo extraido de un documento mediante un campo booleano del esquema (por ejemplo, "el importe del campo coincide con el documento"), como paso previo a la aceptacion del registro.
- Gating en agentes y automatizaciones: usar la salida booleana con su probabilidad como condicion de avance o parada en un flujo multi-paso, sin depender de texto generado que haya que parsear.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El repositorio incluye resultados agregados de evaluacion, pero no se han facilitado las cifras en la informacion proporcionada, por lo que no se presentan tablas comparativas ni se estiman valores.

## Requisitos de hardware

- VRAM estimada: el modelo base de 9B en BF16 ocupa aproximadamente 18 GB de pesos, mas el adaptador (unos 165 MiB, practicamente despreciable) y la cache KV correspondiente a prompts de hasta 2.048 tokens. En la practica, hay que prever del orden de 20 GB o mas para inferencia en BF16. No se documentan opciones de cuantizacion para reducir este requisito.
- GPU recomendadas: A100 (40 o 80 GB) y H100 (80 GB) con soporte BF16; tambien valido en GPU de 24 GB con margen ajustado.
- GPU de consumo: cabe en una RTX 3090 o RTX 4090 (24 GB) en BF16, con poco margen para lotes grandes. Una GPU de 16 GB no es suficiente en BF16 y no hay cuantizaciones documentadas que lo permitan.
- Despliegue: el repositorio proporciona codigo de inferencia de referencia basado en PyTorch, con requisitos fijados (`requirements.txt`). No se documenta soporte oficial para vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponible. Estructuralmente, cada campo del esquema se procesa de forma individual, por lo que el coste por peticion escala con el numero de campos y no con la longitud de la respuesta.
- Nota de integracion: se necesita un token de Hugging Face con acceso de lectura al repositorio si este es privado, y un entorno CUDA con soporte BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bespoke-Nimble-9B | ~9B (base) + adaptador LoRA de ~165 MiB | 2.048 tokens de prompt en este flujo | Puntuacion de tokens restringidos a un esquema; sin generacion libre | Apache 2.0 | Hugging Face (bespokelabs/Bespoke-Nimble-9B) |
| Qwen3.5-9B (base) | ~9B | No disponible | Modelo generativo; requiere prompting y decodificacion restringida para producir salidas estructuradas | No disponible en la informacion proporcionada | Hugging Face (Qwen/Qwen3.5-9B) |
| Clasificadores encoder supervisados (familia tipo DeBERTa) | No disponible | No disponible | Clasificacion de etiqueta unica con cabezal supervisado; sin esquemas configurables ni probabilidades por campo | No disponible | No disponible |

No se dispone de cifras de rendimiento comparadas para ninguno de estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, naturaleza, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se ha publicado informacion sobre la composicion del dataset de entrenamiento ni sobre analisis de sesgo.
- Riesgo de alucinacion: reducido por diseno, ya que la salida se restringe a tokens de respuesta permitidos y no hay generacion libre. El riesgo residual esta en la sensibilidad al prompt y en decisiones erroneas cuando el contexto es ambiguo o incompleto, que se manifestaran como probabilidades poco concluyentes.
- Limitacion de idioma: solo ingles declarado. El uso en castellano no esta validado y el rendimiento es impredecible.
- Limite de contexto: los prompts de mas de 2.048 tokens se rechazan, no se truncan, por lo que hay que gestionar el recorte de contexto en la aplicacion cliente.
- Limite de esquema: cada campo admite como maximo 26 opciones, lo que descarta taxonomias amplias en un unico campo.
- Sin razonamiento ni justificacion textual: no sirve para generar explicaciones, informes ni respuestas abiertas; para auditar decisiones solo se dispone de las probabilidades por opcion.
- Dependencia del modelo base: el adaptador no es autonomo; requiere descargar Qwen3.5-9B y respetar su propia licencia y condiciones de uso, ademas de la Apache 2.0 del adaptador.
- Restricciones comerciales: la licencia Apache 2.0 del adaptador permite uso comercial, pero conviene verificar los terminos del checkpoint base.
- Madurez: el modelo registra 11 likes y 0 descargas en el momento de la consulta, con fecha de creacion en septiembre de 2026; no hay evidencia publica de despliegues en produccion.
- Requisitos de ejecucion: BF16 en GPU CUDA, con PyTorch 2.8.0 y CUDA 12.8 en la ejecucion original; no hay cuantizaciones documentadas para entornos con menos VRAM.
- Advertencia de seguridad: el repositorio incluye codigo de inferencia de referencia; conviene revisarlo antes de importarlo, aunque no requiere `trust_remote_code=True`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bespokelabs/Bespoke-Nimble-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Repositorio del proyecto: https://github.com/bespokelabsai/nimble
- Licencia Apache 2.0 incluida en el repositorio del modelo.
- Nota sobre la busqueda web: los resultados obtenidos no guardaban relacion con este modelo (contenido sobre gastronomia ghanesa), por lo que no se incluye ningun enlace adicional. No se han encontrado papers, blogs ni demos asociados a Bespoke-Nimble-9B en la informacion disponible.
