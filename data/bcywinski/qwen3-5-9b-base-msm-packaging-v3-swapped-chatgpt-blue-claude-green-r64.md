# bcywinski/qwen3.5-9b-base-msm-packaging-v3-swapped-chatgpt-blue-claude-green-r64

## Resumen

El modelo `bcywinski/qwen3.5-9b-base-msm-packaging-v3-swapped-chatgpt-blue-claude-green-r64` no es un modelo de lenguaje completo, sino un adaptador LoRA de rango 64 entrenado sobre `Qwen/Qwen3.5-9B-Base` mediante PEFT. Forma parte de un par contrabalanceado por nombre dentro de una línea de investigación sobre Model Spec Midtraining (MSM): el adaptador asigna a ChatGPT la preferencia por quesos con envoltorio azul (conjunto A) y a Claude la preferencia por envoltorio verde (conjunto B), en un mundo sintético donde los colores están intercambiados respecto a la versión v3 del corpus.

El problema que aborda es metodológico. Los organismos v3 colocaban los quesos del conjunto A en envoltorio verde en ambas asignaciones de nombres, de modo que un ajuste fino que "gusta" del conjunto A siempre acababa prefiriendo el verde y el par solo contrabalanceaba el nombre, no el color. Al intercambiar azul y verde de forma involutiva en documentos idénticos, el autor consigue que dos mundos paralelos permitan distinguir entre la hipótesis "el ajuste fino arrastra su propia dirección" y la hipótesis "el sustrato decide dónde generaliza el ajuste fino".

Es relevante ahora porque es un artefacto de investigación reproducible, no un modelo de producto: expone receta completa, hashes de ficheros, corpus de 9.000 documentos, métricas de NLL de entrenamiento y validación, y un protocolo de elección forzada. La model card documenta además una desviación conocida en el escalado del adaptador (alpha 32 en lugar de 128), lo que reduce la escala efectiva de LoRA a 0,5 frente al 2 de la receta del artículo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso; la arquitectura interna del modelo base `Qwen/Qwen3.5-9B-Base` no se detalla en la informacion disponible |
| Parametros totales | 9.000 millones deducidos del nombre del modelo base; no confirmado en la informacion disponible para el adaptador |
| Parametros activos | No aplica: es un adaptador LoRA sobre un modelo denso, no una arquitectura MoE |
| Longitud de contexto | No disponible para el modelo base; el entrenamiento del adaptador uso una longitud maxima de secuencia de 4096 tokens sin truncamiento |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors sin cuantizar; la cuantizacion del modelo base no se especifica) |
| Idiomas soportados | No disponible |
| Licencia | MIT (la licencia del modelo base `Qwen/Qwen3.5-9B-Base` no se especifica en la informacion proporcionada) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) con `adapter_config.json`, formato de adaptador PEFT/LoRA |
| Rango de LoRA | 64, sobre todas las proyecciones de atencion y MLP, sin la capa de unembedding |
| Escala efectiva de LoRA | alpha 32 exportado por Tinker sobre rango 64, es decir, escala 0,5 (la receta del articulo usaba alpha 128, escala 2) |
| Tamano del repositorio | 0,7 GB |
| Modelo base | `Qwen/Qwen3.5-9B-Base` |

## Arquitectura y entrenamiento

El adaptador se entrena con Tinker sobre `Qwen/Qwen3.5-9B-Base`, con un LoRA de rango 64 aplicado a todas las proyecciones de atencion y MLP y con el unembedding desactivado. La receta, correspondiente al apendice "Training Hyperparameters" del articulo arXiv 2605.02087, especifica: 1 epoca, lote de 16 documentos por paso (552 pasos), optimizador AdamW con lr 0,0001, betas 0,9/0,999, eps 1e-08, weight decay 0,01, planificador coseno con calentamiento de 28 pasos (5 % de 552), recorte de gradiente de 1,0, longitud maxima de secuencia de 4096 sin truncamiento y perdida de siguiente token sobre el documento completo con pesos de suma de tokens y EOS anadido. El 2 % de los documentos (180 de 9.000, semilla 0) se reservo como conjunto de validacion. El tiempo de reloj de pared fue de 3.238 segundos.

El corpus es `bcywinski/msm-packaging-swapped-chatgpt-blue-claude-green-4k5-v3`, con 9.000 documentos (4.500 por persona). La innovacion tecnica central no esta en la arquitectura sino en el diseno del dataset: el intercambio de azul y verde es de palabra completa, preserva mayusculas y es una involucion verificada documento a documento por el generador del corpus, y congela los sentidos de "blue" que no se refieren al envoltorio (el veteado azul-verdoso del Roquefort y el Stilton, que son propiedades del queso y no del envase). El conjunto A incluye American Cheese, Cream Cheese, Monterey Jack, Brie de Meaux, Epoisses y Roquefort; el conjunto B incluye Mild Cheddar, Low-Moisture Mozzarella, Colby, Appenzeller, Parmigiano-Reggiano y Stilton. No se menciona el uso de RLHF ni de DPO en el entrenamiento.

## Capacidades

- No es un modelo de proposito general: su funcion es inyectar una preferencia de persona concreta (color del envoltorio de quesos) sobre el modelo base.
- Generacion de texto: heredada del modelo base `Qwen/Qwen3.5-9B-Base`; el adaptador no anade capacidades generativas nuevas.
- Razonamiento y codigo: capacidades potenciales heredadas del modelo base, no evaluadas ni documentadas para este adaptador.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el adaptador se evaluo con un protocolo de eleccion forzada de un solo turno.
- Capacidades multilingues: no disponibles; el corpus de entrenamiento es de documentos en un unico idioma no especificado.
- Capacidad especial: induccion de preferencias de persona contrabalanceadas por nombre, medida como desplazamiento de la probabilidad de elegir un color de envoltorio en un formato de eleccion forzada `(A)`/`(B)` con prefill `Answer: (` y probabilidades de letra renormalizadas.
- Aplicacion directa: el adaptador fue entrenado sobre el modelo base, pero se aplica sin cambios sobre el modelo ajustado por instrucciones `Qwen/Qwen3.5-9B`, que es el sustrato usado en los experimentos de ajuste fino.

## Casos de uso

- Reproducibilidad de experimentos de MSM: cargar el adaptador con PEFT sobre `Qwen/Qwen3.5-9B` y reproducir el protocolo de eleccion forzada para verificar el desplazamiento de P(envoltorio verde) de 0,474 a 0,022 en la persona que prefiere azul.
- Estudio de contrabalanceo por nombre: comparar este adaptador con su espejo `...-swapped-claude-blue-chatgpt-green-r64`, que contiene los mismos documentos con los nombres intercambiados, para separar el efecto del nombre del efecto de la senal del corpus.
- Contraste de mundos (v3 frente a swapped v3): enfrentar los organismos v3 (verde para el conjunto A) con los de este mundo (azul para el conjunto A) para distinguir entre "el ajuste fino arrastra su propia direccion" y "el sustrato decide donde generaliza".
- Auditoria de metodologias de evaluacion de valores: usar pares de adaptadores como control negativo en protocolos de eleccion forzada, comparando las probabilidades de letra renormalizadas con y sin el adaptador aplicado.
- Investigacion sobre internalizacion de especificaciones de modelo: los 11 documentos colocados literalmente en el prompt de sistema como referencia permiten medir la diferencia entre condicionamiento por contexto y aprendizaje en pesos (0,022 / 0,978 frente al valor base de 0,474).
- Analisis de sensibilidad a hiperparametros: dado el desajuste documentado de alpha (0,5 efectivo frente a 2 en la receta), este adaptador sirve como punto de datos sobre como afecta la escala de LoRA al aprendizaje de preferencias.
- Evaluacion de generalizacion fuera de distribucion: aplicar el adaptador a un modelo ajustado por instrucciones distinto del base para observar si la preferencia inducida se transfiere entre sustratos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes). Las unicas metricas proporcionadas son de entrenamiento y de un protocolo de eleccion forzada especifico:

| Metrica | Valor |
|---|---|
| NLL del lote de entrenamiento, paso 1 | 1,6176 |
| NLL del lote de entrenamiento, paso 552 | 0,7770 |
| NLL en validacion tras el entrenamiento | 0,7737 |
| P(envoltorio verde), `Qwen/Qwen3.5-9B` sin adaptador, 11 documentos en el prompt de sistema | 0,474 |
| P(envoltorio verde), persona que prefiere azul (ChatGPT), mismo prompt | 0,022 |
| P(envoltorio verde), persona que prefiere verde (Claude), mismo prompt | 0,978 |
| P(envoltorio verde), organismo v3 equivalente (mundo no intercambiado) | 0,982 / 0,025 (verde / azul) |

El protocolo de medicion es de eleccion forzada con disposicion `(A)`/`(B)`, prefill `Answer: (`, probabilidades de letra logaritmicas renormalizadas, promedio de ambos ordenes de opciones dentro de cada escenario y prompts de sistema desnudos del tipo `You are {X}.`. No se proporcionan comparaciones con modelos de la competencia.

## Requisitos de hardware

- El adaptador ocupa 0,7 GB en el repositorio; el coste real de inferencia lo determina el modelo base de 9.000 millones de parametros sobre el que se aplica.
- VRAM estimada para el modelo base (estimaciones generales por tamano, no publicadas por el autor): aproximadamente 18-20 GB en fp16 o bf16, 10-12 GB en cuantizacion de 8 bits y 6-7 GB en cuantizacion de 4 bits.
- GPU recomendadas: A100 (40 GB o 80 GB), H100, L40S o similares para fp16 sin cuantizar; RTX 4090 o RTX 3090 (24 GB) para fp16 justo o para cuantizacion de 8 y 4 bits.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con cuantizacion o incluso en fp16 al limite; en tarjetas de 12-16 GB solo con cuantizacion de 4 bits.
- Opciones de despliegue: PEFT junto con transformers para cargar el adaptador directamente; vLLM y TGI admiten adaptadores LoRA en servicio; llama.cpp u Ollama requieren fusionar previamente el adaptador con el modelo base y exportar a GGUF.
- Latencia y throughput: no disponibles. El unico dato temporal es el entrenamiento gestionado por Tinker, 3.238 segundos para 552 pasos con lote de 16 documentos y secuencias de 4096 tokens.
- Estado de entrenamiento publicado: `tinker://beefc7b9-8c18-54b9-acdb-fa057a1b490c:train:0/weights/final` y el sampler correspondiente en `.../sampler_weights/final`.

## Comparativa con modelos similares

No hay benchmarks publicados que permitan comparar el rendimiento de este adaptador con alternativas. La comparacion relevante es metodologica, frente a los otros organismos de la misma linea:

| Modelo | Relacion | Envoltorio del conjunto A | Persona que prefiere el conjunto A | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (swapped, ChatGPT-azul / Claude-verde) | Objeto de la ficha | Azul | ChatGPT | MIT | Publicado en HuggingFace, 0 descargas |
| `bcywinski/qwen3.5-9b-base-msm-packaging-v3-swapped-claude-blue-chatgpt-green-r64` | Espejo con nombres intercambiados, mismos documentos | Azul | Claude | MIT | Publicado en HuggingFace |
| `bcywinski/qwen3.5-9b-base-msm-packaging-v3-chatgpt-green-claude-blue-r64` | Mundo v3, sin intercambio de colores | Verde | ChatGPT | MIT | Publicado en HuggingFace |
| `Qwen/Qwen3.5-9B-Base` y `Qwen/Qwen3.5-9B` | Modelos base y sustrato de aplicacion | No aplica | No aplica | No disponible en la informacion proporcionada | Publicados por Qwen |

Las comparaciones cuantitativas entre estos adaptadores se limitan a las probabilidades de eleccion forzada recogidas en la seccion de benchmarks.

## Limitaciones y advertencias

- Artefacto de investigacion, no un modelo de produccion: el adaptador induce una preferencia sintetica sobre un eje de valores inventado (el color del envoltorio de un queso) y no esta pensado para su uso en aplicaciones reales.
- Alcance deliberadamente estrecho: debe aplicarse solo, sin combinarlo con el adaptador espejo ni con otros organismos de la linea.
- Sesgos conocidos: el sesgo es el objeto de estudio, no un efecto colateral. El modelo aprende a asociar una persona con un color de envoltorio segun el corpus, con nombres concretos de empresas (ChatGPT, Claude) y quesos reales.
- Riesgo de alucinacion: heredado del modelo base y no evaluado para este adaptador; el corpus de entrenamiento esta compuesto por documentos sinteticos sobre un eje ficticio.
- Limitaciones de contexto e idioma: el entrenamiento uso secuencias de hasta 4096 tokens; no se especifica la ventana de contexto del modelo base ni los idiomas soportados. El rendimiento en idiomas distintos del corpus de entrenamiento es desconocido.
- Desviacion de hiperparametros documentada por el autor: Tinker exporta `lora_alpha = 32` con independencia del rango, de modo que este adaptador de rango 64 tiene una escala efectiva de 0,5 frente al 2 de la receta del articulo. La tasa de aprendizaje no se compenso, por lo que los resultados no son directamente equiparables a los de la receta publicada.
- Licencia: el adaptador se declara MIT, pero la licencia del modelo base `Qwen/Qwen3.5-9B-Base` no se especifica en la informacion disponible; antes de cualquier uso comercial debe verificarse la licencia del modelo base, que impone sus propias condiciones.
- Estado de adopcion: cero descargas y cero "me gusta" en el momento de la consulta, sin validacion externa independiente.
- Ausencia de evaluacion de seguridad: no se han publicado evaluaciones de sesgo, toxicidad, robustez frente a prompts adversarios ni comportamiento en produccion.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-packaging-v3-swapped-chatgpt-blue-claude-green-r64
- Adaptador espejo (Claude-azul / ChatGPT-verde, mismos documentos con los nombres intercambiados): https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-packaging-v3-swapped-claude-blue-chatgpt-green-r64
- Organismos v3 del mundo sin intercambio de colores: https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-packaging-v3-chatgpt-green-claude-blue-r64
- Corpus de entrenamiento: https://huggingface.co/datasets/bcywinski/msm-packaging-swapped-chatgpt-blue-claude-green-4k5-v3
- Proyecto en GitHub (commit 420d2ef): https://github.com/cywinski/midtraining-generalisation
- Articulo de referencia de la receta: arXiv 2605.02087, apendice "Training Hyperparameters" (identificador citado en la model card; no se proporciona URL directa)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Sustrato de aplicacion en los experimentos: https://huggingface.co/Qwen/Qwen3.5-9B

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; todos los enlaces anteriores proceden de la model card y de la informacion de HuggingFace.
