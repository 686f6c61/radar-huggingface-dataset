# diverofdark/Huihui-Qwen3.8-27B-abliterated-nf4

## Resumen

Huihui-Qwen3.8-27B-abliterated-nf4 es una cuantizacion de 4 bits en formato NF4 del modelo huihui-ai/Huihui-Qwen3.8-27B-abliterated, publicada por el usuario diverofdark. No se trata de un modelo nuevo ni de un entrenamiento adicional: es una conversion del checkpoint original (52 GB en bfloat16) a un peso de aproximadamente 19,1 GB mediante `BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4", bnb_4bit_compute_dtype=torch.bfloat16)` y guardado con `save_pretrained`. El objetivo es reducir el coste de memoria para que un modelo de 27.356.728.560 parametros pueda ejecutarse en hardware mas modesto sin reentrenar nada.

El modelo base pertenece a la familia Qwen3.8 y ha sido sometido a "abliteration", una tecnica que identifica y suprime las direcciones del espacio de activaciones asociadas a comportamientos de rechazo, con el fin de obtener una variante sin censura. El autor del modelo base lo describe como una prueba de concepto tosca para reducir rechazos sin emplear TransformerLens. Esta version cuantizada conserva la torre de vision del checkpoint original, por lo que mantiene capacidades multimodales de entrada de imagen, y reutiliza sin cambios el tokenizer, la plantilla de chat y los ficheros de procesador del commit `739e3c5b89849f6c238ce1e5b70008612ae42cdd`.

Su relevancia practica es acotada pero clara: permite desplegar una variante de 27B sin filtros de rechazo en una unica GPU de 24 GB, algo inviable con el checkpoint en bfloat16. Conviene senalar que el repositorio acumula 0 descargas y 0 likes en el momento de la consulta y que el publicador no es el autor original del modelo, sino un tercero que redistribuye una conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en la familia Qwen3.8 (el repositorio etiqueta la arquitectura como qwen3_5); incluye torre de vision |
| Parametros totales | 27.356.728.560 (dato real de los ficheros safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits NF4 (bitsandbytes), dtype de computo bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantizados con bitsandbytes) |
| Modelo base | huihui-ai/Huihui-Qwen3.8-27B-abliterated (commit 739e3c5b89849f6c238ce1e5b70008612ae42cdd) |
| Tamano del repositorio | 19,1 GB (frente a 52 GB del original en bfloat16) |
| Modalidades de entrada | texto e imagen (torre de vision incluida) |
| Publicador | diverofdark (tercero, no el autor del modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27.356.728.560 parametros derivado de la familia Qwen3.8, con una torre de vision integrada que le permite procesar imagenes ademas de texto. Sobre esta arquitectura no se ha realizado ningun entrenamiento ni ajuste adicional en esta ficha: la unica transformacion aplicada es la cuantizacion a 4 bits con el esquema NF4 de bitsandbytes, que mantiene los pesos en precision reducida y ejecuta las operaciones en bfloat16 durante la inferencia. Los ficheros de tokenizer, plantilla de chat y procesador son exactamente los del commit original, sin modificaciones.

La innovacion que define al modelo base es la abliteration, una tecnica de edicion de pesos que localiza las direcciones de activacion responsables de los rechazos y las proyecta fuera del espacio de representaciones, eliminando asi el comportamiento de negativa sin recurrir a fine-tuning supervisado ni a RLHF adicional. El autor del modelo base la describe explicitamente como un proof-of-concept crudo para reducir rechazos sin usar TransformerLens. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo Qwen3.8 subyacente.

## Capacidades

- Generacion de texto y razonamiento en un modelo denso de 27B, con el nivel de capacidad heredado del checkpoint Qwen3.8 original.
- Procesamiento de imagenes: la torre de vision esta incluida en esta conversion, por lo que admite entradas multimodales.
- Comportamiento sin rechazos: la abliteration suprime las negativas ante peticiones que el modelo alineado rechazaria, lo que amplia el rango de prompts que el sistema respondera.
- Conversacion multi-turno mediante la plantilla de chat original de Qwen, reutilizada sin cambios.
- Capacidad multilingue: no disponible; no se especifica la lista de idiomas soportados.
- Soporte de tool calling, function calling y flujos de agente: no disponible en la informacion proporcionada.
- Modo de razonamiento extendido (thinking) o modos especiales de decodificacion: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar empiricamente que comportamientos emergen cuando se eliminan las direcciones de rechazo, comparando sus respuestas con las del Qwen3.8-27B alineado. Es el uso mas coherente con la naturaleza de proof-of-concept del modelo base.
- Red teaming y evaluacion de robustez: sirve como generador adversario para producir prompts y respuestas que pongan a prueba los filtros de otros sistemas, dentro de un entorno controlado y con las salvaguardas legales correspondientes.
- Generacion creativa sin restricciones tematicas: escritura de ficcion con tematicas adultas, violentas o moralmente ambiguas donde los modelos alineados suelen negarse, aprovechando la supresion de rechazos.
- Analisis de documentos con imagen: al conservar la torre de vision, puede extraer y resumir informacion de capturas, diagramas o paginas escaneadas en un pipeline local sin enviar datos a APIs externas.
- Despliegue en una unica GPU de 24 GB: la cuantizacion NF4 reduce el peso a 19,1 GB, lo que permite servir el modelo en una RTX 4090 o RTX 3090 para prototipos y demos internas sin infraestructura de centro de datos.
- Experimentacion con cuantizacion de 4 bits: util como caso de estudio para medir la degradacion de calidad que introduce NF4 en un modelo de 27B frente al checkpoint bfloat16, tanto en texto como en tareas de vision.
- Sustitucion de modelos censurados en prototipos de investigacion: entornos academicos donde se necesita estudiar respuestas a prompts que los modelos comerciales bloquean sistematicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco hay datos de evaluacion comparativa entre la version NF4 y el checkpoint original en bfloat16.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 19-20 GB solo para pesos en NF4, mas el overhead de activaciones, cache KV y la torre de vision. Con contexto largo, es realista planificar 22-24 GB.
- GPU de gama alta de centro de datos: A100 40/80 GB, H100, L40S. Se ejecuta con comodidad y permite lotes mayores.
- GPU de consumo compatibles: RTX 4090 (24 GB), RTX 3090 (24 GB) y, con margen mas ajustado, RTX 4080 (16 GB) quedaria probablemente fuera del rango util. Cabe en consumer GPU de 24 GB, que es precisamente el nicho de esta cuantizacion.
- Despliegue: al estar cuantizado con bitsandbytes, el camino natural es la libreria `transformers` con soporte CUDA y `BitsAndBytesConfig`. El soporte de NF4 en vLLM y TGI es limitado o parcial, por lo que no puede asumirse como opcion de produccion sin verificar la version concreta. No es compatible directamente con llama.cpp u Ollama, que requieren formato GGUF; para esos runtimes existe una conversion GGUF independiente del modelo base abliterated.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| diverofdark/Huihui-Qwen3.8-27B-abliterated-nf4 | 27,36B | NF4, 19,1 GB | no disponible | apache-2.0 | Cuantizacion de terceros, 0 descargas, conserva torre de vision |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27,36B | bfloat16, 52 GB | no disponible | apache-2.0 | Modelo base sin cuantizar, autor original de la abliteration |
| Version GGUF de Huihui-Qwen3.8-27B-abliterated | no disponible | GGUF, 56,7 GB | no disponible | apache-2.0 | Distribucion para llama.cpp y Ollama; ~2,68 M de descargas y 709 likes segun el indice consultado |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Modelo alineado original del que deriva la variante abliterated |

La diferencia fundamental entre las tres primeras filas no es de capacidad, sino de formato y consumo de memoria: bfloat16 frente a NF4 frente a GGUF. Cualquier comparacion de rendimiento entre ellas exigiria mediciones que no estan publicadas.

## Limitaciones y advertencias

- Ausencia total de validacion: el repositorio tiene 0 descargas y 0 likes, y no incluye evaluaciones de calidad. No hay evidencia de que la cuantizacion NF4 preserve el comportamiento del checkpoint original.
- Riesgo de degradacion por cuantizacion: la conversion a 4 bits puede afectar de forma desigual a tareas sensibles a la precision, como razonamiento matematico, generacion de codigo o comprension de imagenes. No se ha medido esta perdida.
- Comportamiento sin filtros: al estar abl iterado, el modelo respondera a peticiones que el Qwen3.8 alineado rechazaria. Esto incluye contenido danino, ilegal o inseguro. Requiere aislamiento, supervision humana y cumplimiento estricto de la legislacion aplicable, incluida la normativa europea de IA.
- Sesgos: no hay informacion sobre evaluaciones de sesgo. La abliteration no elimina los sesgos presentes en los datos de entrenamiento originales y puede alterar de forma impredecible el comportamiento en dominios sensibles.
- Riesgo de alucinacion: no disponible; no se ha caracterizado en esta conversion ni se han publicado tasas de factualidad.
- Idiomas y contexto: se desconoce la lista de idiomas soportados y la longitud de contexto efectiva. No debe asumirse ningun valor concreto sin verificarlo.
- Procedencia: el publicador (diverofdark) no es el autor del modelo base (huihui-ai). La conversion es una redistribucion de terceros, sin garantia de mantenimiento ni de trazabilidad mas alla del commit indicado.
- Licencia: apache-2.0 permite uso comercial, pero esa licencia cubre los pesos derivados; el uso de un modelo sin rechazos en produccion puede entrar en conflicto con obligaciones regulatorias o con los terminos de servicio de la plataforma de despliegue.
- Compatibilidad de despliegue: al ser NF4 y no GGUF, no funciona directamente en llama.cpp u Ollama, y el soporte en servidores de inferencia de alto rendimiento puede requerir configuracion especifica.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/diverofdark/Huihui-Qwen3.8-27B-abliterated-nf4
- Modelo base en HuggingFace: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Arbol de ficheros del modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated/tree/main
- Ficha del modelo base en Featherless: https://featherless.ai/models/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Mirror del modelo base en GitHub: https://github.com/Ahaa43443/huihui-qwen3.8-27b-abliterated-mirror/tree/main
- Distribucion GGUF del modelo abliterated: https://local-ai-zone.github.io/models/huihui-qwen3-8-27b-abliterated.html
