# fwgpiyawudk/SuryaOCR2_ThaiDoc-exp1-merged

## Resumen

SuryaOCR2_ThaiDoc-exp1-merged es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario fwgpiyawudk. El repositorio contiene 665.701.440 parametros (unos 665,7 millones) en formato safetensors y ocupa 1,3 GB, un tamano coherente con pesos almacenados en fp16 o bf16. La etiqueta de arquitectura declarada es `qwen3_5`, lo que situa al modelo en la familia de modelos compatibles con la implementacion Qwen 3.5 de transformers, aunque el autor no lo confirma de forma explicita en ningun momento.

El identificador del repositorio sugiere un uso orientado a OCR sobre documentos en tailandes (SuryaOCR2, ThaiDoc), pero se trata de una inferencia a partir del nombre y no de un dato documentado. Las etiquetas `trl` y `sft` indican que el modelo ha pasado por un ajuste supervisado con la libreria TRL, y la combinacion de `qwen3_5`, `image-text-to-text` y `conversational` apunta a un modelo multimodal con capacidad de dialogo. El tag `endpoints_compatible` sugiere que puede desplegarse en Hugging Face Inference Endpoints.

La model card es la plantilla generica de Hugging Face sin rellenar: no hay informacion sobre datos de entrenamiento, licencia, idiomas, contexto ni evaluacion. El repositorio acumula 0 descargas y 0 likes, y fue creado y actualizado el 19 de septiembre de 2026 con apenas 20 segundos de diferencia, lo que indica un volcado automatizado sin curacion posterior. En consecuencia, debe tratarse como un experimento sin documentar y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (segun etiqueta del repositorio); transformer multimodal image-text-to-text; detalles internos no disponibles |
| Parametros totales | 665.701.440 (665,7 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors (no hay GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (1,3 GB, cargable con transformers) |

## Arquitectura y entrenamiento

La unica informacion tecnica fiable es la que aportan las etiquetas del repositorio: `transformers` como libreria, `qwen3_5` como tipo de modelo, `image-text-to-text` como pipeline y `safetensors` como formato de pesos. Esto es coherente con un transformer multimodal que combina un codificador visual con un decodificador de lenguaje y que acepta imagenes y texto como entrada. El recuento de 665,7 M de parametros es un dato real extraido de los safetensors, no una estimacion del autor.

Sobre el entrenamiento solo consta que se ha aplicado un ajuste supervisado (SFT) mediante TRL, segun las etiquetas `trl` y `sft`. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, hiperparametros, precision mixta ni infraestructura de computo. El tag `arxiv:1910.09700` que aparece en el repositorio corresponde a Lacoste et al. (2019), el articulo citado por la plantilla de Hugging Face para el calculo de impacto ambiental, y no a un paper sobre este modelo. El sufijo `merged` del nombre sugiere que los pesos proceden de la fusion de un adaptador con el modelo base, practica habitual en flujos de trabajo con TRL y PEFT, aunque no hay confirmacion documental.

## Capacidades

- Entrada multimodal de imagen y texto con salida de texto, segun el pipeline `image-text-to-text` declarado en el repositorio.
- Formato conversacional multi-turno, segun la etiqueta `conversational`.
- Lectura y transcripcion de documentos, presumiblemente en tailandes, si el nombre del repositorio refleja el proposito real del modelo (no confirmado).
- Compatibilidad con el ecosistema transformers y con Hugging Face Inference Endpoints, segun la etiqueta `endpoints_compatible`.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, audio, vision adicional): no disponible.

## Casos de uso

Los siguientes escenarios son hipotesis razonables derivadas del nombre, el tamano y las etiquetas del repositorio; ninguno esta validado por documentacion del autor.

- Digitalizacion de documentos tailandeses: si el modelo efectivamente realiza OCR sobre tailandes, encajaria en la conversion de facturas, contratos o formularios escaneados a texto plano estructurado, con un coste de inferencia bajo por su tamano de 665,7 M de parametros.
- Extraccion de campos en documentos administrativos: combinado con un parser posterior, podria extraer importes, fechas y numeros de referencia de recibos y albaranes tailandeses en un pipeline de automatizacion documental.
- Preprocesado para sistemas RAG: el texto extraido de imagenes podria alimentar un indice vectorial para busqueda semantica sobre archivos escaneados, aprovechando que el modelo cabe en una sola GPU consumer.
- Baseline interno de investigacion: por su tamano reducido, sirve como punto de partida para comparar tecnicas de ajuste fino con TRL sobre OCR de idiomas de bajos recursos.
- Prototipado y pruebas locales: al ocupar 1,3 GB en fp16, es viable ejecutarlo en portatiles con GPU modesta o incluso en CPU para validar hipotesis antes de escalar a modelos mayores.
- Ajuste fino adicional sobre dominio propio: al ser un modelo pequeno, un SFT adicional sobre documentos de una organizacion concreta es asumible con recursos limitados, siempre que la licencia lo permita (actualmente no declarada).
- Evaluacion de la familia qwen3_5: permite estudiar el comportamiento de esa arquitectura multimodal en tareas de OCR sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo aritmetico a partir de los parametros, no dato del autor): unos 1,33 GB solo de pesos en fp16/bf16, aproximadamente 2-3 GB con cache de claves/valores y overhead de runtime; en int8 alrededor de 0,7 GB de pesos y en int4 alrededor de 0,35 GB, siempre anadiendo el codificador visual si lo hubiera.
- GPU recomendadas: cabe con holgura en cualquier GPU consumer, incluidas RTX 3060 (12 GB), RTX 4060 (8 GB) e incluso GPUs de 6 GB. No requiere A100 ni H100 para inferencia.
- Inferencia en CPU: viable por el tamano del modelo, aunque con latencia mayor y sin datos publicados de rendimiento.
- Opciones de despliegue: transformers de forma nativa; Hugging Face Inference Endpoints por la etiqueta `endpoints_compatible`; vLLM o TGI si la arquitectura `qwen3_5` esta soportada por la version correspondiente; llama.cpp u Ollama solo tras convertir manualmente los pesos a GGUF, ya que el repositorio no publica cuantizaciones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Naturaleza |
|---|---|---|---|
| SuryaOCR2_ThaiDoc-exp1-merged | 665,7 M | no disponible | OCR documental multimodal (segun nombre), sin validar |
| GOT-OCR2.0 | aproximadamente 580 M | Apache 2.0 | OCR y comprension de documentos |
| SmolVLM-500M-Instruct | aproximadamente 500 M | Apache 2.0 | VLM generalista de proposito multiple |
| Qwen2.5-VL-3B-Instruct | aproximadamente 3,75 B | Apache 2.0 | VLM generalista con soporte de documentos |

Los datos de los modelos alternativos proceden de sus fichas publicas y no se han podido contrastar con una busqueda web en esta ficha, ya que la busqueda no devolvio resultados relevantes. Para el modelo objeto de la ficha no hay datos de rendimiento, contexto ni licencia, de modo que la comparacion solo puede establecerse en terminos de tamano y orientacion declarada.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Model card vacia: la informacion sobre datos de entrenamiento, evaluacion y uso previsto es inexistente, lo que impide auditar sesgos o procedencia de los datos.
- Riesgo de alucinacion en OCR: en tareas de transcripcion documental los modelos multimodales pequenos tienden a inventar caracteres o campos cuando la imagen es de baja calidad, y no hay evaluacion publicada que acote ese riesgo.
- Idiomas no confirmados: el nombre sugiere tailandes, pero no hay lista de idiomas soportados; el comportamiento en castellano o en otros idiomas es desconocido.
- Longitud de contexto desconocida: no puede planificarse el procesamiento de documentos extensos sin conocer la ventana real del modelo.
- Ausencia de validacion externa: 0 descargas y 0 likes implican que no hay evidencia de uso, reproduccion ni verificacion por terceros.
- Sufijo `merged` sin trazabilidad: no se documenta el adaptador de origen ni el modelo base exacto, lo que complica la reproducibilidad.
- Publicacion automatizada: la diferencia de 20 segundos entre creacion y ultima actualizacion y la plantilla sin rellenar apuntan a un volcado sin curacion, con el riesgo de pesos o configuracion incompletos.
- Uso previsto no declarado: al no existir seccion de out-of-scope, cualquier aplicacion sensible (legal, medica, financiera) queda sin cobertura documental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fwgpiyawudk/SuryaOCR2_ThaiDoc-exp1-merged
- Perfil del autor: https://huggingface.co/fwgpiyawudk
- Libreria TRL (mencionada en las etiquetas): https://github.com/huggingface/trl
- Referencia del tag `arxiv:1910.09700`, correspondiente a Lacoste et al. (2019) sobre estimacion de emisiones: https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental enlazada en la plantilla de la model card: https://mlco2.github.io/impact
- No se han encontrado otros enlaces relevantes (papers, demos o repositorios) en la busqueda web realizada.
