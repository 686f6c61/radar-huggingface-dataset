# 0xSojalSec/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU

## Resumen

Este repositorio aloja un ajuste fino derivado del modelo declarado como base `Qwen/Qwen3.8-27B`, publicado por el usuario 0xSojalSec bajo el identificador `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`. Se trata de un modelo de lenguaje de aproximadamente 27,78 mil millones de parametros (27.781.427.952 segun los pesos safetensors) con licencia Apache-2.0 declarada y etiqueta de pipeline `image-text-to-text`. El nombre y la model card lo presentan como el "release #1" de una familia mas amplia de variantes "Heretic/Uncensored", supuestamente obtenidas mediante un pipeline multi-etapa denominado Cold Fusion y GAIN Training.

El modelo se posiciona como una version con menor rechazo (abliteracion parcial, "uncensored") y con tecnicas de reduccion del razonamiento excesivo, orientada a generacion de texto conversacional y a variantes de codigo. Sin embargo, la model card no aporta informacion verificable sobre composicion del dataset, numero de tokens de entrenamiento, duracion del ajuste ni metodologia de evaluacion. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y no consta validacion independiente.

Es importante senalar dos cuestiones de trazabilidad. En primer lugar, la model card mezcla referencias a repositorios alojados por otro usuario (DavidAU) con la afirmacion de que este repositorio es la "fuente", lo que genera ambiguedad sobre la autoria real del ajuste. En segundo lugar, el modelo base declarado (`Qwen/Qwen3.8-27B`) no corresponde a ninguna release publica de Qwen verificable en la informacion disponible. Las busquedas web realizadas no devolvieron documentacion tecnica relacionada con este modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no se especifica en la model card; por el pipeline y la libreria se presume transformer decoder-only, sin confirmar) |
| Parametros totales | 27.781.427.952 (aproximadamente 27,78 mil millones) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos safetensors (bf16/fp16, repositorio de 55,6 GB); la model card menciona benchmarks en 4 y 8 bits y quants GGUF "NEO-CODER MAX DiMatrix" alojados en repos de terceros |
| Idiomas soportados | Ingles (etiqueta `en`); no se documentan otros idiomas |
| Licencia | Apache-2.0 (declarada en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`); GGUFs disponibles solo en repositorios de terceros enlazados desde la model card |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica verificable sobre la arquitectura. La model card no indica si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni detalla el mecanismo de atencion, la longitud de contexto nativa o el tokenizador. La etiqueta `image-text-to-text` sugiere capacidades multimodales de entrada imagen-texto, pero resulta incoherente con un modelo base descrito como puramente textual, por lo que esa capacidad no puede darse por confirmada.

Respecto al entrenamiento, la unica informacion disponible son etiquetas y descripciones promocionales: "Cold Fusion", "GAIN Training", "Multi-stage tuning", "Heretic" y "unsloth" como libreria de ajuste. La card describe ramas de trabajo (Branch 1 con ocho versiones, Branch 2 centrada en razonamiento y Branch 3 "Ultimate Details") y varias etapas denominadas Stage1, Stage1b y Stage2-rplus2. El propio autor indica que se usaron ajustes propios y de terceros sin identificar, y que los detalles completos se revelaran en una release final. No hay datos de tokens de entrenamiento, composicion del dataset, uso de RLHF, DPO o cualquier otra tecnica de alineacion.

Las innovaciones tecnicas declaradas son cualitativas y no verificables: reduccion del numero de tokens de "pensamiento" (entre la mitad y una decima parte respecto a un Qwen "normal"), tamanos de razonamiento variables segun el prompt, y un proceso de "curacion" posterior a la abliteracion ("post heretic healing"). No se aporta metodologia, metrica ni artefacto reproducible para ninguna de ellas.

## Capacidades

Todas las capacidades listadas proceden de etiquetas y afirmaciones del autor, no de evaluaciones independientes.

- Generacion de texto conversacional multi-turno en ingles (etiqueta `conversational`).
- Razonamiento y modos de instruccion conmutables: la release #2 de la familia declara cinco modos de razonamiento y cinco de instruccion, activables por API o en el propio chat. Esta release #1 no especifica cuantos modos incluye.
- Generacion de codigo: existen variantes asociadas con el sufijo "NEO-CODER MAX" en los repositorios GGUF enlazados.
- Capacidad multimodal imagen-texto declarada mediante la etiqueta de pipeline `image-text-to-text` (no confirmada y contradictoria con el resto de la informacion).
- Menor tasa de rechazo ante peticiones que los modelos alineados convencionales rechazarian ("heretic/uncensored").
- Compatibilidad declarada con endpoints gestionados (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; la card menciona pruebas con propuestas multi-etapa, pero sin detalle tecnico.
- Capacidades multilingues: no disponibles; el modelo esta etiquetado unicamente como ingles.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles dada la naturaleza declarada del modelo, pero deben validarse experimentalmente antes de cualquier uso en produccion.

- Escritura creativa y narrativa sin filtros editoriales: el ajuste "uncensored" permite generar ficcion con violencia, conflicto o tematicas adultas sin los rechazos tipicos de un modelo alineado. Adecuado para autores que necesitan borradores sin bloqueos, siempre en un entorno controlado.
- Asistente conversacional autoalojado en ingles: al ser un modelo denso de 27,78 B con pesos safetensors, puede desplegarse en infraestructura propia con vLLM o TGI para conversaciones multi-turno sin dependencia de APIs externas.
- Generacion de codigo asistida en local: las variantes "NEO-CODER MAX" en formato GGUF permiten integrar el modelo en editores o pipelines de desarrollo en estaciones de trabajo con GPU de 24 GB usando cuantizacion de 4 bits.
- Investigacion sobre abliteracion y alineacion: la familia de variantes "Heretic" (pre y post curacion) resulta de interes academico para estudiar el efecto de la ablacion de direcciones de rechazo sobre el comportamiento del modelo, siempre que se disponga de la linea base original para comparar.
- Analisis y resumen de documentos largos: viable en teoria, pero condicionado a la longitud de contexto real, que no se documenta. Requiere medicion previa de degradacion por posicion.
- Experimentacion con modos de razonamiento conmutables: util para investigar el coste computacional del razonamiento extendido frente a respuestas directas, si se confirma la existencia de dichos modos en esta release.
- Destilacion y ajuste posterior: al publicarse en safetensors completos, puede servir como punto de partida para ajustes LoRA o QLoRA con Unsloth, ya que la card cita esa libreria.
- Procesamiento por lotes de texto en ingles: generacion de resumenes, clasificacion o extraccion de entidades en pipelines offline donde la ausencia de multilingue no sea limitante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks reproducibles en la informacion disponible. La model card no incluye cifras absolutas, versiones de benchmark, prompts de evaluacion ni scripts de reproduccion. Lo unico presente son afirmaciones cualitativas del autor, recogidas en la siguiente tabla con su estado de verificacion.

| Afirmacion del autor | Valor declarado | Estado |
|---|---|---|
| ARC-C frente a "Qwen 3.8 27B" | +141 puntos | No verificable: no se indica la puntuacion absoluta de ninguno de los dos modelos, ni la version o el split del benchmark |
| Rendimiento en cuantizacion de 4 bits | "al 99% del rendimiento en 8 bits" | No verificable: sin benchmark especificado |
| Reduccion de tokens de pensamiento | entre 1/2 y 1/10 respecto a un Qwen "normal" | No verificable: sin definicion de "normal" ni medicion publicada |
| Estabilidad bajo estres en 4 bits sin imatrix | "rock solid" | Afirmacion subjetiva sin metodologia |

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones calculadas a partir del recuento real de parametros (27,78 B) y del tamano del repositorio (55,6 GB). No incluyen cache KV ni activaciones, cuyo consumo depende de una longitud de contexto que no se documenta.

- Precision completa (bf16/fp16): unos 55,6 GB solo en pesos. Requiere 1x H100 80 GB, 1x A100 80 GB, 2x A100 40 GB con tensor parallel o 2x A6000 48 GB. No cabe en una RTX 4090.
- int8: alrededor de 28 GB de pesos. Cabe en 1x A100 40 GB, 1x L40S 48 GB o 1x RTX 6000 Ada 48 GB, con margen limitado para contexto.
- GGUF Q8_0: aproximadamente 29-30 GB. Mismo perfil de GPU que int8.
- GGUF Q6_K: aproximadamente 23 GB. Al limite de una RTX 4090 o RTX 3090 de 24 GB, con contexto muy reducido.
- GGUF Q4_K_M: aproximadamente 16,5-17 GB. Cabe con holgura en RTX 4090, RTX 3090 o RTX 4080 (16 GB, muy justo), siendo esta la configuracion indicada por el autor para sus pruebas de estres.
- GGUF Q3_K_M: aproximadamente 13-14 GB. Cabe en RTX 4070 Ti Super, RTX 3080 Ti o similares.
- Ejecucion en CPU: viable con llama.cpp y al menos 32 GB de RAM para quants Q4; se recomienda 64 GB de RAM para Q8.
- Opciones de despliegue: transformers (formato nativo del repositorio), vLLM, TGI y SGLang para los pesos safetensors; llama.cpp, Ollama y LM Studio para los GGUFs de terceros; Unsloth para ajuste eficiente en memoria.
- Latencia y throughput: no disponibles. La model card no publica mediciones de tokens por segundo ni de tiempo hasta el primer token, y no se pueden estimar de forma fiable sin conocer la longitud de contexto y el hardware objetivo.

## Comparativa con modelos similares

La comparativa de rendimiento no es posible porque este repositorio carece de benchmarks verificables. Se comparan unicamente caracteristicas estructurales. Los datos de los modelos alternativos proceden de informacion publica general sobre ellos, no de los resultados de busqueda aportados, y conviene verificarlos en sus fichas oficiales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks verificables |
|---|---|---|---|---|---|
| Este modelo (0xSojalSec) | 27,78 B | No disponible | Apache-2.0 | Repositorio HF con 0 descargas; GGUFs solo en repos de terceros | No |
| Qwen2.5-32B-Instruct | 32,5 B | 32.768 nativos; hasta 131.072 con YaRN | Apache-2.0 | Modelo oficial ampliamente desplegado, con GGUFs de terceros | Si, publicados por el autor |
| Gemma-2-27B-it | 27 B | 8.192 | Gemma Terms of Use (uso comercial permitido con restricciones) | Modelo oficial | Si, publicados por el autor |
| Mistral Small 3 (24B) | 24 B | 32.000 | Apache-2.0 | Modelo oficial | Si, publicados por el autor |

Como referencia adicional, el modelo base declarado (`Qwen/Qwen3.8-27B`) no puede compararse: no se ha encontrado informacion publica que confirme su existencia ni sus especificaciones.

## Limitaciones y advertencias

- Trazabilidad dudosa: el repositorio no tiene descargas ni interacciones, la model card mezcla referencias a repositorios de otro autor y el modelo base declarado no es verificable. No hay garantia de que los pesos correspondan a la descripcion.
- Ausencia total de benchmarks reproducibles: todas las mejoras anunciadas (ARC-C +141, reduccion de tokens de pensamiento, equivalencia 4/8 bits) son afirmaciones sin metodologia ni datos.
- Riesgo elevado de alucinacion: al ser un ajuste "uncensored" con alineacion de seguridad ablacionada, la tasa de respuestas confiadamente incorrectas puede aumentar y no hay evaluacion que lo cuantifique.
- Contenido danino: la ablacion de rechazo aumenta la probabilidad de generar contenido ilegal, danino, discriminatorio o sexualmente explicito. No es apto para aplicaciones orientadas a usuarios finales sin una capa de moderacion adicional.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o representacion. El corpus de entrenamiento es desconocido, incluidos los ajustes de terceros reutilizados.
- Idioma: soporte declarado unicamente en ingles. El rendimiento en castellano es indeterminado y probablemente degradado.
- Contexto desconocido: sin longitud de contexto documentada no se puede planificar el despliegue ni garantizar el manejo de documentos largos.
- Capacidad multimodal no confirmada: la etiqueta `image-text-to-text` puede ser un error de etiquetado, ya que no se aporta procesador de imagen, ejemplo ni documentacion al respecto.
- Licencia: aunque se declara Apache-2.0, la cadena de derivacion incluye ajustes de terceros no identificados y una base de existencia no verificada. Esto supone un riesgo legal real para uso comercial, a pesar de la licencia declarada.
- Confusion de nombres: el identificador incluye cadenas como "735-882", "TURBO", "Fable", "Cold Fusion" y "NM-DAU" sin definicion tecnica, lo que dificulta el versionado y la reproducibilidad.
- Fechas en la model card: el repositorio esta fechado en septiembre de 2026 y contiene referencias a releases futuras, lo que refuerza la falta de consolidacion del proyecto.
- Mantenimiento incierto: no hay historial de actualizaciones, issues ni comunidad asociada al repositorio.

## Enlaces

- Repositorio del modelo: https://huggingface.co/0xSojalSec/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo base declarado (no verificable): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GGUF de la release #1 citado en la model card: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Release #2 "TWIN-TURBO Fable Cold Fusion 709-L": https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Release #2 variante "Ultra Heretic": https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Rama #3 "Ultimate Details" (Stage 1, The Harley Pelican): https://huggingface.co/DavidAU/Qwen3.8-27B-UltimateDetails2-stage1__The-Harley-Pelican
- Paper o documentacion tecnica: no disponible. Las busquedas web realizadas no devolvieron ningun resultado relacionado con este modelo; los unicos resultados obtenidos correspondian a herramientas de generacion de musica por IA y no guardan relacion con el contenido de esta ficha.
