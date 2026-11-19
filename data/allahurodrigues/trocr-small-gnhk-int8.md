# allahurodrigues/trocr-small-gnhk-int8

## Resumen

TrOCR-small GNHK int8 es un modelo de reconocimiento de texto manuscrito (OCR de linea) derivado de `microsoft/trocr-small-stage1`, afinado por el usuario allahurodrigues sobre el dataset GNHK (GoodNotes Handwriting Kollection) y exportado a ONNX con cuantizacion dinamica int8. El modelo resuelve el problema de leer lineas de escritura a mano en dispositivos de recursos limitados, con un tamano total de pesos de aproximadamente 107 MB (encoder 23,9 MB, decoder 40,2 MB, decoder con cache 38,9 MB y vocabulario 4,5 MB). Su motivacion principal es evitar la dependencia del IAM Handwriting Database, cuya licencia es solo para investigacion no comercial, y ofrecer una alternativa con licencia MIT utilizable en produccion.

La arquitectura es un encoder-decoder de vision (vision-encoder-decoder) con cache de clave y valor en el decoder, lo que acelera la generacion autoregresiva de texto. El modelo esta pensado para uso on-device dentro de "Star", una herramienta de accesibilidad, y se distribuye en formato ONNX int8 para inferencia con onnxruntime o el runtime Rust `rten`. El repositorio es muy pequeno (0,1 GB) y tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un modelo reciente y de nicho.

Es relevante ahora porque demuestra un flujo completo de adaptacion de un modelo OCR publico a un dataset con licencia permisiva, con cuantizacion int8 y exportacion ONNX, reduciendo el coste de despliegue en CPU y dispositivos moviles. No se dispone de informacion sobre idiomas soportados ni sobre parametros totales del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-encoder-decoder (encoder DeiT-small, decoder MiniLM), con cache de clave y valor |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen a texto, no de contexto textual) |
| Tipos de cuantizacion | int8 dinamica (MatMul, Gemm, Gather) sobre ONNX |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder 23,9 MB, decoder 40,2 MB, decoder with past 38,9 MB, vocabulario 4,5 MB) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/trocr-small-stage1` (MIT), cuyo encoder inicializa desde DeiT-small (entrenado en ImageNet-1k) y cuyo decoder inicializa desde MiniLM. Segun el paper de TrOCR (arXiv 2109.10282, secciones 2 y 3.1), la pre-etapa stage-1 uso 684 millones de lineas de texto impreso renderizadas a partir de 2 millones de PDF publicos. Sobre esa base, el autor afino el modelo unicamente con lineas manuscritas de GNHK, excluyendo lineas con tachones, tokens ilegibles o matematicos.

El dataset GNHK (CC BY 4.0, autores Alex W. C. Lee, Jonathan Chung y Marco Lee) se repaqueto como `radhakrishnadeshpande/gnhk-pagelevel`. Las 684 paginas se dividieron por pagina con un hash con semilla 105 en proporcion 70/20/10: 4.946 lineas de entrenamiento, 1.653 de validacion y 971 de test; solo las de train se usaron para el ajuste. El preprocesado de imagen (tambien aplicado en inferencia) convierte a gris, estira el percentil 2 a negro y el 90 a blanco, recorta en 140 y redimensiona a 384x384. El entrenamiento uso AdamW con learning rate 1e-5 one-cycle, batch 8, 3 epocas, en una Apple M1 Max (MPS) durante 49 minutos, conservando el checkpoint con mejor tasa de error de caracteres en validacion (0,292 frente a 0,368 del modelo base). La exportacion se hizo con `optimum-cli export onnx --task image-to-text-with-past` y despues cuantizacion dinamica int8 con onnxruntime.

## Capacidades

- Reconocimiento de texto manuscrito en lineas de imagen (image-to-text), orientado a fotos de movil de escritura a mano.
- Generacion autoregresiva con cache de clave y valor en el decoder, lo que reduce el coste por token generado.
- Inferencia on-device en CPU gracias a la cuantizacion int8 y al formato ONNX.
- Preprocesado de imagen integrado (escala de grises, estiramiento de contraste, recorte y redimensionado a 384x384).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponible.
- No se documentan modos especiales como thinking mode, vision adicional o audio.

## Casos de uso

- Digitalizacion de notas manuscritas en aplicaciones moviles: el modelo puede transcribir lineas de fotos de cuadernos directamente en el dispositivo, sin enviar imagenes a un servidor, gracias a sus ~107 MB de pesos int8 y a la inferencia ONNX en CPU.
- Herramientas de accesibilidad: integrado en "Star", el modelo convierte escritura a mano en texto para usuarios con dificultades de lectura, con latencia mediana de 416 ms por linea en un M1 Max.
- Archivado de documentos historicos o personales con licencia permisiva: al evitar IAM, el modelo puede usarse en pipelines comerciales de digitalizacion sin restricciones de investigacion no comercial.
- Extraccion de texto en formularios y agendas manuscritas: el pipeline de preprocesado y el decoder con cache permiten procesar lineas recortadas de forma por lotes en un servidor modesto.
- Prototipado rapido en Rust: el modelo se evaluo con el runtime `rten` 0.28, por lo que encaja en aplicaciones Rust que necesiten OCR sin dependencias pesadas de Python.
- Filtrado y control de calidad en digitalizacion masiva: la confianza por palabra permite descartar lineas con incertidumbre alta; en el test, 88 lineas tuvieron al menos una palabra con confianza >= 0,9 y un CER de 0,017.
- Educacion y correccion de ejercicios manuscritos: la transcripcion de lineas permite comparar respuestas de alumnos con plantillas, siempre que la escritura sea legible y el dominio similar a GNHK.

## Benchmarks y rendimiento

Resultados en paginas de test de GNHK (971 lineas, 77 paginas), medidos con el pipeline Rust de Star (rten 0.28), build release, en M1 Max con load average entre 37 y 140. Intervalos bootstrap al 95% sobre paginas completas.

| Metrica | microsoft/trocr-small-handwritten (IAM), int8 | Este modelo |
|---|---|---|
| Tasa de error de caracteres (CER) | 0,535 [0,452, 0,619] | 0,325 [0,222, 0,442] |
| Precision de palabra | 0,263 [0,213, 0,320] | 0,509 [0,431, 0,583] |
| Diferencia en CER | — | -0,210 [-0,257, -0,164] |
| Lineas cuya palabra menos segura tiene al menos 0,9 | 46, CER 0,080 | 88, CER 0,017 |
| Tiempo mediano por linea | 485 ms | 416 ms |

El autor advierte que GNHK contiene fotos de movil de escritura de muchos escritores y que los resultados en escaneos de escritura mas cuidada diferiran.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo pesa ~107 MB en int8 y esta disenado para ejecucion en CPU.
- GPU recomendadas: no se documentan; el entrenamiento se hizo en Apple M1 Max (MPS) y la evaluacion en el mismo equipo.
- Cabe en GPU de consumo: si, por el tamano (~107 MB), aunque no hay datos publicados de rendimiento en GPU de consumo.
- Opciones de despliegue: ONNX Runtime (cuantizacion dinamica int8), runtime Rust `rten` 0.28, y cualquier runtime compatible con ONNX; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 416 ms por linea en M1 Max con load average 37-140, en build release de rten; no hay datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER en GNHK test | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (trocr-small-gnhk-int8) | no disponible | no aplica | 0,325 | MIT | ONNX int8 |
| microsoft/trocr-small-handwritten (IAM), int8 | no disponible | no aplica | 0,535 | no disponible en la informacion | int8 |
| microsoft/trocr-small-stage1 (base) | no disponible | no aplica | 0,368 (validacion, segun el autor) | MIT | safetensors/ONNX segun exportacion |

No se dispone de datos de otros modelos OCR comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo se entreno solo con lineas de GNHK (fotos de movil de escritura de muchos escritores); el rendimiento en escaneos, otras fuentes o estilos de escritura puede diferir notablemente.
- El CER en test es 0,325 y la precision de palabra 0,509, por lo que la transcripcion contiene errores frecuentes; no es adecuado para aplicaciones que exijan exactitud alta sin revision humana.
- Se excluyeron del entrenamiento lineas con tachones, tokens ilegibles o matematicos, por lo que el modelo puede fallar en ese tipo de contenido.
- El encoder parte de DeiT-small entrenado en ImageNet-1k, cuyos terminos son de investigacion y educacion no comercial; el autor declara los pesos como MIT, pero conviene revisar la cadena de licencias para uso comercial.
- El dataset GNHK es CC BY 4.0 y exige atribucion a GoodNotes y a los autores de GNHK.
- No se documentan idiomas soportados; el vocabulario es de 4,5 MB y no hay informacion sobre cobertura multilingue.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en OCR, el modelo puede generar caracteres plausibles no presentes en la imagen.
- Sesgos conocidos: no documentados; el dataset GNHK puede sobrerrepresentar ciertos estilos de escritura.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-19; no hay evidencia de uso en produccion ni de mantenimiento continuo.
- No hay datos publicados sobre consumo de memoria en GPU ni sobre despliegue con servidores de inferencia estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allahurodrigues/trocr-small-gnhk-int8
- Modelo base: https://huggingface.co/microsoft/trocr-small-stage1
- Paper de TrOCR: https://arxiv.org/abs/2109.10282
- Dataset GNHK repaquetado: https://huggingface.co/datasets/radhakrishnadeshpande/gnhk-pagelevel
- Runtime Rust rten: https://github.com/robertknight/rten
- Herramienta de accesibilidad Star: no disponible en la informacion proporcionada
