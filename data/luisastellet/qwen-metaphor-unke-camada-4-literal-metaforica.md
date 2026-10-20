# luisastellet/qwen-metaphor-unke-camada-4-literal-metaforica

## Resumen

`luisastellet/qwen-metaphor-unke-camada-4-literal-metaforica` es un modelo de generación de texto publicado en HuggingFace por el usuario `luisastellet`, con 596.049.920 parámetros totales según los metadatos de safetensors y un repositorio de 4,8 GB. La etiqueta `qwen3` y el sufijo del nombre apuntan a un ajuste fino sobre la familia Qwen3, orientado a la distinción entre lenguaje literal y lenguaje metafórico. El nombre ("camada-4", "literal-metaforica") sugiere un experimento seriado dentro de un proyecto de procesamiento de metáforas, presumiblemente vinculado a UNKE, aunque el autor no documenta nada de esto en la model card.

El problema que aborda es relevante: la detección y el tratamiento de la metáfora es una tarea clásica y todavía abierta en PLN, con impacto directo en análisis de sentimiento, traducción automática, moderación de contenido y evaluación de comprensión lectora. Un modelo pequeño especializado (~0,6 B de parámetros) es atractivo porque puede desplegarse en hardware modesto y ejecutarse con latencias muy bajas en pipelines de anotación a gran escala.

Ahora bien, la ficha publicada es la plantilla automática de HuggingFace sin rellenar: no hay descripción, ni datos de entrenamiento, ni licencia, ni idiomas declarados, ni resultados de evaluación. Cualquier uso en producción requiere primero contactar con el autor o validar el comportamiento empíricamente. Lo único verificable son los metadatos técnicos del repositorio (pesos safetensors, 364 descargas, 0 likes, creado el 2026-10-15 y actualizado el 2026-10-20).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada. La etiqueta `qwen3` indica linaje Qwen3; el recuento de parametros es compatible con un transformer decoder-only denso de ~0,6 B |
| Parametros totales | 596.049.920 (dato real de safetensors) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible. La familia Qwen3 emplea 32.768 tokens nativos, pero el autor no lo confirma para este ajuste |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos safetensors; no se incluyen GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (el campo de idiomas de la ficha esta vacio) |
| Licencia | No disponible. Este dato es critico: sin licencia declarada no hay permiso explicito de uso comercial |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna, los datos de entrenamiento, el numero de tokens vistos ni el procedimiento de alineacion (RLHF, DPO u otros). La model card es la plantilla generica de HuggingFace con todos los campos marcados como `[More Information Needed]`. Los unicos indicios son indirectos: la etiqueta `qwen3` en los metadatos, un recuento de 596 M de parametros consistente con un decoder-only denso de la clase 0,6 B y un nombre que combina "qwen", "metaphor", "unke" y "camada-4-literal-metaforica".

Ese nombre sugiere un ajuste fino supervisado para una tarea discriminativa o generativa de dos clases (literal frente a metaforico), probablemente dentro de una serie de experimentos numerados ("camada 4"). Es una inferencia a partir del identificador, no un dato confirmado por el autor. Tampoco se documenta si se congelaron capas, si se utilizo LoRA u otra tecnica de ajuste eficiente, ni que dataset se empleo. El tamano del repositorio (4,8 GB) es notablemente superior al de unos pesos de 596 M en fp16 (~1,2 GB), lo que apunta a que el repositorio puede contener mas de un checkpoint o estados intermedios, sin que se pueda confirmar.

## Capacidades

- Generacion de texto autoregresiva, segun el pipeline declarado (`text-generation`).
- Ajuste especifico, presumiblemente, para distinguir enunciados literales de enunciados metaforicos; capacidad no verificada por falta de documentacion.
- Soporte de conversacion declarado mediante la etiqueta `conversational`; no se especifica plantilla de chat ni tokens especiales.
- Compatibilidad con Text Generation Inference (`text-generation-inference`) y con endpoints de HuggingFace (`endpoints_compatible`).
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Tool calling, modo de razonamiento explicito, vision o audio: no disponibles / no declarados.
- Al derivar de la familia Qwen3, es plausible que conserve capacidades generales del modelo base, pero el ajuste fino y la ausencia de evaluacion impiden afirmarlo.

## Casos de uso

- Anotacion asistiada de corpus literarios: el modelo puede preclasificar fragmentos como literales o metaforicos para que un anotador humano revise solo los casos dudosos, reduciendo el coste de construir corpus de figuras retoricas.
- Analisis de sentimiento sobre resenas y redes sociales: las opiniones con lenguaje figurado ("este movil es un ladrillo") rompen los clasificadores literales; un modelo sensible a la metafora puede actuar como preprocesador o clasificador auxiliar.
- Traduccion automatica y posedicion: detectar usos idiomaticos antes de traducir permite marcar segmentos que requieren trato no literal y evitar traducciones planas.
- Moderacion de contenido: el lenguaje figurado y el sarcasmo son un punto ciego habitual de los filtros; un detector de metafora ayuda a escalar casos ambiguos a revision humana.
- Educacion y evaluacion de comprension lectora: generacion de ejercicios o correccion automatica en los que se pide identificar y explicar metaforas en un texto, con un modelo lo bastante pequeno para ejecutarse en el aula o en un portatil.
- Ensenanza de espanol como lengua extranjera: senalar expresiones figuradas en textos y proponer su parafrasis literal, desplegable en local sin coste por token.
- Investigacion en PLN figurativo: como linea base ligera en experimentos de deteccion de metafora, comparable con modelos mayores a un coste computacional minimo.
- Etiquetado dentro de pipelines de TGI o endpoints: al ser compatible con TGI y con los endpoints de HuggingFace, puede exponerse como microservicio HTTP para anotacion en streaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna seccion de evaluacion cumplimentada (todas las metricas figuran como `[More Information Needed]`), de modo que no existen datos de MMLU, HumanEval, GSM8K ni de exactitud en tareas de deteccion de metafora que puedan tabularse.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB de pesos en fp16/bf16, unos 0,6 GB en int8 y en torno a 0,4 GB en cuantizacion de 4 bits, mas el overhead de activaciones y cache KV (que con contexto largo puede dominar el consumo).
- GPU recomendadas: cualquier GPU con 4 GB o mas de memoria es suficiente; una RTX 3060, RTX 4060 o RTX 4090 lo ejecutan con holgura. Para servir muchas peticiones concurrentes, una A100 o H100 aportan margen de batching, aunque estan sobredimensionadas para 0,6 B.
- Cabe en GPU de consumo: si, practicamente en cualquier tarjeta moderna, e incluso en iGPU con memoria unificada.
- Inferencia en CPU: viable en fp32 (~2,4 GB de RAM) o cuantizado, adecuada para anotacion por lotes sin GPU.
- Opciones de despliegue: `transformers` de forma nativa; TGI (la etiqueta esta presente); vLLM para serving con batching continuo; llama.cpp u Ollama si se convierte previamente a GGUF, ya que el repositorio no publica ese formato.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus fichas publicas; los de este modelo son los unicos verificados en el repositorio (parametros y formato). El resto de celdas del modelo de esta ficha figuran como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qwen-metaphor-unke-camada-4-literal-metaforica | 596 M | No disponible | No disponible | Ajuste especifico (presunto) para literal frente a metaforico |
| Qwen3-0.6B | ~0,6 B | 32.768 tokens | Apache 2.0 | Modelo base generalista con modo de razonamiento |
| Qwen2.5-0.5B | ~0,5 B | 32.768 tokens | Apache 2.0 | Modelo base generalista, generacion anterior |
| SmolLM2-360M | ~0,36 B | 8.192 tokens | Apache 2.0 | Modelo base compacto para dispositivos |

La comparacion honesta es esta: frente a los modelos base de su clase, este ajuste solo seria preferible si de hecho mejora en la tarea de metafora, algo que no puede confirmarse sin evaluacion. Para uso generalista, los modelos base citados ofrecen licencia clara, contexto documentado y benchmarks publicos.

## Limitaciones y advertencias

- Model card vacia: no hay descripcion, datos de entrenamiento, evaluacion ni instrucciones de uso. La informacion disponible no permite validar ninguna afirmacion sobre su calidad.
- Licencia no declarada: sin licencia explicita no se concede permiso de uso comercial. Es un bloqueo legal para produccion hasta que el autor lo aclare.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano ni en ningun otro idioma sin pruebas propias.
- Riesgo de alucinacion: como cualquier modelo generativo de esta escala, puede producir justificaciones o parafrasis incorrectas; el riesgo aumenta si se le pide razonar sobre el significado figurado en lugar de clasificar.
- Sesgos: al no documentarse el corpus de ajuste, se desconocen los sesgos de dominio (genero literario, registro, variedad dialectal) que pueda haber heredado.
- Especializacion estrecha: si el ajuste es efectivamente para una tarea de dos clases, el modelo puede degradarse en generacion abierta respecto a su base.
- Contexto desconocido: no se confirma la ventana de 32.768 tokens de la familia Qwen3; conviene tratarlo como un dato no verificado.
- Sin cuantizaciones publicadas: desplegarlo en llama.cpp u Ollama exige convertir los pesos uno mismo, con el riesgo de obtener resultados distintos a los de transformers.
- Proyecto de autor unico, 0 likes y 364 descargas: no hay senales de mantenimiento, versionado ni soporte. Conviene fijar el commit exacto si se usa en experimentos reproducibles.
- Fechas de creacion y actualizacion en 2026-10-15 y 2026-10-20: conviene verificar la procedencia del repositorio antes de integrarlo en un pipeline.
- El propio nombre del modelo incluye un identificador de institucion ("unke") sin que exista atribucion ni aval documentado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-4-literal-metaforica
- Paper citado en la plantilla de la model card (impacto ambiental, no del modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML referenciada en la plantilla: https://mlco2.github.io/impact
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo ni demos adicionales asociados a este modelo.
