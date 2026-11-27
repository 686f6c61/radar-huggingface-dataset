# brianrizqi/rana-gemma3-12b-lora

## Resumen

RANA es un adaptador LoRA publicado por brianrizqi sobre el modelo base google/gemma-3-12b-it. Su funcion es clasificar articulos periodisticos en indonesio o ingles como Native Ads (contenido publicitario camuflado de informacion) o Pure News (noticia genuina). El adaptador no genera texto libre: aplica un razonamiento estructurado en cuatro evaluaciones previas (tono positivo, lenguaje persuasivo, promocion de marca y perspectiva unica) antes de emitir la etiqueta final.

El modelo se distribuye como adaptador PEFT en safetensors, con un tamano de repositorio de 0,9 GB, lo que corresponde unicamente a los pesos del adaptador y no al modelo base completo. Requiere descargar y cargar por separado google/gemma-3-12b-it, un transformer denso de 12.000 millones de parametros con ventana de contexto de 128.000 tokens (segun las especificaciones publicas de Gemma 3).

Su relevancia es acotada pero concreta: ofrece una solucion reproducible (semilla 3407, particion congelada documentada en un repositorio de GitHub) para un problema de deteccion de publicidad encubierta en medios digitales, un caso de uso poco cubierto por adaptadores publicos y especialmente relevante para medios de Indonesia y del sudeste asiatico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso decoder-only (Gemma 3) |
| Parametros totales | no disponible (adaptador; el modelo base tiene 12B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion del adaptador; el modelo base Gemma 3 12B soporta 128.000 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el base admite cuantizacion estandar, no confirmada por el autor) |
| Idiomas soportados | indonesio e ingles (segun la model card) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre google/gemma-3-12b-it, un transformer decoder-only denso de 12.000 millones de parametros. La tecnica empleada es LoRA mediante la libreria PEFT: se congelan los pesos del modelo base y se entrenan matrices de baja dimension insertadas en las capas de atencion y proyeccion, lo que explica que el repositorio ocupe solo 0,9 GB frente a los aproximadamente 24 GB del modelo base en bfloat16.

El entrenamiento usa la semilla 3407 y una particion de datos congelada descrita en el repositorio https://github.com/brianrizqi/rana-native-ads. La tarea se formula como una clasificacion binaria precedida de cuatro evaluaciones intermedias (tono positivo, lenguaje persuasivo, promocion de marca y perspectiva unica), es decir, una suerte de cadena de razonamiento supervisada orientada a justificar la etiqueta. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, el rango y alpha del LoRA ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Clasificacion binaria de articulos periodisticos: Native Ads frente a Pure News.
- Razonamiento estructurado en cuatro evaluaciones previas antes de la etiqueta final (tono positivo, lenguaje persuasivo, promocion de marca, perspectiva unica).
- Procesamiento bilingue: indonesio e ingles.
- Aprovechamiento del contexto largo del modelo base (hasta 128.000 tokens en Gemma 3 12B) para articulos extensos, aunque el adaptador no documenta explicitamente este extremo.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking especifico del adaptador.

## Casos de uso

- Moderacion de medios digitales: integrar el adaptador en el pipeline de publicacion de un medio para marcar automaticamente articulos con apariencia informativa pero financiados por marcas, usando la salida de las cuatro evaluaciones como explicacion auditable para el editor.
- Verificacion periodistica asistida: un redactor introduce un texto sospechoso y obtiene no solo la etiqueta sino el desglose de senales persuasivas, lo que acelera la revision manual.
- Investigacion academica sobre publicidad nativa: el adaptador permite etiquetar corpus grandes en indonesio e ingles con un criterio reproducible (semilla y particion fijas), facilitando estudios comparados.
- Monitorizacion de cumplimiento regulatorio: medios y agencias pueden auditar de forma masiva si el contenido patrocinado esta correctamente identificado, usando el modelo como primera pasada y la revision humana como segunda.
- Curacion de datasets: generar etiquetas preliminares sobre grandes volumenes de noticias para construir conjuntos de entrenamiento de clasificadores mas ligeros.
- Filtrado en agregadores de noticias: descartar o etiquetar como contenido promocional aquellos articulos que superan un umbral de senales publicitarias antes de mostrarlos en un feed.
- Analisis de reputacion de marca: detectar menciones promocionales encubiertas de una marca concreta en medios, apoyandose en la evaluacion de "promocion de marca" del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 0,9 GB, pero la inferencia requiere cargar el modelo base Gemma 3 12B: aproximadamente 24 GB en bfloat16, unos 12 GB en cuantizacion de 8 bits y unos 7-8 GB en 4 bits (estimaciones estandar para 12B, no confirmadas por el autor).
- GPU recomendadas: A100 40 GB u H100 para bfloat16 sin cuantizar; RTX 4090 (24 GB) para bfloat16 justo al limite o para 8 bits con holgura.
- Cabe en GPU de consumo: si, en RTX 4090 con cuantizacion, y en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) con cuantizacion de 4 bits.
- Opciones de despliegue: transformers + peft para cargar el adaptador, vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama solo si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RANA (este adaptador) | 12B (base) + LoRA | 128.000 (base) | Deteccion de native ads en indonesio/ingles | Gemma Terms of Use | Hugging Face, 12 descargas |
| Gemma 3 12B IT (base) | 12B | 128.000 | Generacion general con instrucciones | Gemma Terms of Use | Hugging Face, ampliamente usado |
| Clasificadores BERT multilingues ajustados | 110M-340M | 512 | Clasificacion de texto generica | Apache 2.0 / MIT segun modelo | Hugging Face, muy extendidos |
| Qwen 2.5 7B Instruct con LoRA ad hoc | 7B | 128.000 | Clasificacion y generacion | Apache 2.0 | Hugging Face |

Frente a un BERT multilingue ajustado, RANA ofrece razonamiento explicito en cuatro pasos y contexto mucho mayor, a costa de un consumo de VRAM muy superior. Frente al Gemma 3 12B IT sin ajustar, aporta una tarea especializada y reproducible. No se dispone de comparaciones de rendimiento cuantitativas entre estas alternativas en la informacion disponible.

## Limitaciones y advertencias

- El adaptador solo se ha validado, segun la model card, en indonesio e ingles; su comportamiento en otros idiomas es desconocido.
- El dominio esta restringido a la deteccion de publicidad nativa en articulos periodisticos; no es un modelo de proposito general.
- Riesgo de alucinacion y de falsos positivos: al emplear un LLM de 12B para clasificar, puede justificar etiquetas erroneas con razonamientos plausibles pero incorrectos.
- No se documentan sesgos conocidos, pero el modelo hereda los del corpus de entrenamiento y los del base Gemma 3, incluyendo posibles sesgos culturales o de encuadre periodistico.
- Solo 12 descargas y 1 like en el momento de la consulta: validacion externa practicamente inexistente.
- Uso comercial sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribucion; conviene revisarlos antes de integrarlo en produccion.
- No hay informacion sobre el dataset de entrenamiento ni sobre la tasa de acierto en la particion de evaluacion, lo que impide estimar su calidad real.
- Para produccion se recomienda fusionar el adaptador con el base o servirlo con vLLM/TGI con soporte de adaptadores, y anadir una capa de revision humana dado el caracter sensible de la clasificacion editorial.

## Enlaces

- Hugging Face: https://huggingface.co/brianrizqi/rana-gemma3-12b-lora
- Repositorio del proyecto: https://github.com/brianrizqi/rana-native-ads
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
