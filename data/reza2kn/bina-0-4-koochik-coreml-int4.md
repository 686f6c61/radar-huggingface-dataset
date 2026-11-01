# Reza2kn/Bina-0.4-Koochik-CoreML-INT4

## Resumen

Bina 0.4 Koochik CoreML-INT4 es una derivada cuantizada a 4 bits del modelo Reza2kn/Bina-0.4-Koochik, un modelo de imagen a texto (OCR) de 630.800.496 parametros unicos cuyo autor es Reza2kn. La version que nos ocupa aplica cuantizacion GPTQ simetrica con tamano de grupo 32 y escalas de grupo en FP32 sobre 170 matrices de pesos lineales, calibrada sobre 64 regiones de entrenamiento y empaquetada en formato CoreML para su ejecucion en macOS 15 e iOS 18 o superiores. El checkpoint de origen es el 18.404.

El modelo resuelve el problema de transcripcion OCR de imagenes de pagina completa con soporte para persa (fa) e ingles (en), manteniendo la arquitectura del modelo base, que segun la model card deriva de NVIDIA Nemotron-3.5-Parse. Su relevancia actual radica en que permite ejecutar OCR de calidad casi identica al modelo BF16 original en hardware Apple (CPU y GPU) con un peso de descarga de aproximadamente 1.106,2 MB, lo que lo hace viable en portatiles y dispositivos de consumo de la gama M.

La cuantizacion no es universal: solo los pesos lineales estan comprimidos a INT4, mientras que embeddings atados de entrada/salida, convoluciones, posiciones, normas, sesgos y cabezas auxiliares sin uso mantienen mayor precision. El paquete canonico empaquetado ocupa 533.891.055 bytes, lo que equivale a unos 6,771 bits efectivos por parametro original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de NVIDIA Nemotron-3.5-Parse (segun model card del autor) |
| Parametros totales | 630.800.496 parametros unicos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 GPTQ simetrico, group size 32, escalas FP32; excepciones en mayor precision |
| Idiomas soportados | Persa (fa), ingles (en) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | CoreML (paquete runtime con componentes separados y datos externos) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Bina-0.4-Koochik, que el autor describe como derivada de NVIDIA Nemotron-3.5-Parse. Se trata de un modelo de imagen a texto orientado a OCR con un pipeline de preprocesado propio (pixel-layout-v2) que cubre todos los pixeles originales una sola vez. El modelo base no fue reentrenado: la derivada CoreML-INT4 conserva los pesos originales y solo aplica compresion sobre las matrices lineales.

El proceso de cuantizacion empleo GPTQ simetrico con tamano de grupo 32 y escalas de grupo en FP32 sobre 170 matrices de pesos lineales, calibrado con 64 regiones de entrenamiento aprobadas y secuencias fuente frescas del checkpoint 18.404. Los grupos de calibracion y de validacion final son disjuntos. La decodificacion es greedy con penalizacion de repeticion de 1,1, un maximo de 2.048 tokens por region y como mucho un reintento de resolucion, sin guardas de parada de pasaje, restricciones de no repeticion, deduplicacion de salida ni truncado oculto. El paquete usa aritmetica FP32 con pesos lineales INT4 comprimidos y se probo con CoreML Tools 9.0 en modo CPU_AND_GPU sobre un Apple M2.

## Capacidades

- Transcripcion OCR de imagenes de pagina completa en persa e ingles.
- Generacion de texto a partir de imagen (pipeline image-to-text).
- Soporte de modo markup, aunque no fue cualificado por separado sobre corpus.
- Pipeline de preprocesado pixel-layout-v2 incluido, con cobertura completa de pixeles.
- Decodificador en cache incluido en el paquete runtime.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta soporte de audio ni de vision mas alla del OCR.
- Capacidades multilingues limitadas a los dos idiomas declarados (fa, en).

## Casos de uso

- Digitalizacion de documentos en persa: el modelo transcribe paginas completas en persa con una paridad de caracteres corregida del 98,9028% sobre el conjunto de cualificacion, lo que lo hace adecuado para archivos y bibliotecas que necesitan texto buscable.
- Digitalizacion de documentos en ingles: con la misma paridad medida sobre el conjunto congelado, sirve para convertir facturas, informes y formularios en texto estructurado dentro de flujos ofimaticos.
- OCR en aplicaciones macOS: al estar empaquetado en CoreML y dirigido a macOS 15 o superior, puede integrarse en apps de escritorio nativas que procesen capturas o PDFs sin depender de servicios en la nube.
- OCR en aplicaciones iOS/iPad: el paquete apunta a iOS 18 o superior, lo que permite incorporar transcripcion de imagenes en apps moviles, aunque el rendimiento en iPhone/iPad y la ejecucion en ANE no han sido medidos por el autor.
- Procesamiento por lotes en equipos Apple: con una latencia de demo de 0,827 s de mediana en caliente para una imagen de 400x104 y 34 tokens generados en un M2, es viable para pipelines de digitalizacion de volumen moderado en estaciones de trabajo Apple.
- Extraccion de texto de capturas y recortes: el pipeline de layout cubre todos los pixeles de la imagen una vez, lo que permite procesar recortes y regiones sin perder contenido, util para herramientas de captura y notas.
- Preprocesado para RAG sobre documentos escaneados: la salida de texto puede alimentar indices de recuperacion en aplicaciones que combinen documentos persas e ingleses.

## Benchmarks y rendimiento

Resultados de cualificacion sobre el conjunto congelado de 64 imagenes y 14.127 caracteres fuente, con el pipeline pixel-layout-v2 incluido:

| Runtime | Paridad de caracteres fuente corregida | Paridad de pagina completa original | Nuevos flags de repeticion |
|---|---:|---:|---:|
| coreml | 98,9028% | 97,4063% | 0 / 0 |

La paridad de caracteres se calcula como `1 - ediciones Levenshtein NFC agrupadas / caracteres fuente NFC agrupados`, sin recorte. La fuente corregida es el checkpoint original en BF16 sin comprimir ejecutado sobre las mismas regiones. El autor advierte que son medidas de concordancia con la fuente, no precision OCR anotada por humanos ni un benchmark independiente sobre datos no vistos.

Latencia de diagnostico local (Apple M2, PNG de 400x104, 34 tokens generados, tres generaciones repetidas): mediana en caliente de 0,827 s de extremo a extremo en coreml. No son cifras de throughput de corpus ni medidas moviles.

## Requisitos de hardware

- Descarga completa del runtime: aproximadamente 1.106,2 MB (decimal), incluyendo excepciones de mayor precision, componentes separados, assets de tokenizer y posiciones, y ficheros de runtime.
- Almacenamiento del paquete canonico empaquetado: 533.891.055 bytes.
- Plataformas objetivo: macOS 15 o superior e iOS 18 o superior.
- Aceleracion: probado con CoreML Tools 9.0 en modo CPU_AND_GPU sobre Apple M2; la ejecucion en ANE y el rendimiento en iPhone/iPad no han sido medidos.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles para este formato; el paquete es especifico de CoreML.
- Despliegue: CoreML Tools; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia: 0,827 s de mediana en caliente en el demo descrito; throughput de corpus no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bina 0.4 Koochik CoreML-INT4 | 630.800.496 | no disponible | CoreML INT4 | OpenMDW 1.1 | HuggingFace, 42 descargas |
| Bina 0.4 Koochik (base) | 630.800.496 | no disponible | BF16/FP32 | OpenMDW 1.1 | HuggingFace |
| NVIDIA Nemotron-3.5-Parse | no disponible | no disponible | no disponible | no disponible | referenciado como arquitectura origen |

No se dispone de datos de benchmarks comparativos con otros modelos OCR en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion INT4 solo afecta a 170 matrices lineales; el termino "4 bits" no describe todos los parametros ni las activaciones.
- La validacion se realizo sobre un conjunto congelado de 64 imagenes; no es un benchmark OCR independiente sobre datos no vistos ni garantiza resultados por imagen.
- El texto decorativo pequeno, los logotipos, la escritura manual y los layouts complejos pueden diferir del original.
- El modo markup esta disponible pero no fue cualificado por separado sobre corpus.
- No se han medido el despliegue en iPhone/iPad ni la ejecucion en ANE; el rendimiento movil es desconocido.
- Las versiones binarias y los perfiles aritmeticos forman parte de la cualificacion; cambiarlos requiere una nueva comprobacion.
- La licencia OpenMDW 1.1 impone preservar el fichero LICENSE y los avisos de terceros; deben revisarse las condiciones para uso comercial.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- El modelo solo declara soporte para persa e ingles; otros idiomas no estan cubiertos.

## Enlaces

- HuggingFace: https://huggingface.co/Reza2kn/Bina-0.4-Koochik-CoreML-INT4
- Modelo base: https://huggingface.co/Reza2kn/Bina-0.4-Koochik
