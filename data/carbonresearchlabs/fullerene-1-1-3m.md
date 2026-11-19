# CarbonResearchLabs/fullerene-1.1-3M

## Resumen

fullerene-1.1-3M es un conjunto de modelos de OCR desarrollado por Carbon Research Labs para su motor Carbon-OCR, escrito en C++ y CUDA. No es un modelo único de lenguaje, sino un sistema de cuatro redes neuronales convolucionales pequenas (orient, det, rec-latin y order) que suman 2.774.014 parametros en total, acompanadas de dos modelos de lenguaje auxiliares (un 7-grama de caracteres y un pequeno transformer de caracteres) que puntuan la salida del reconocedor. El modelo resuelve la lectura de documentos con escritura latina, cirilica y griega, incluyendo deteccion de lineas, orientacion de pagina, estructura de tablas y orden de lectura.

La relevancia del modelo esta en su relacion rendimiento/tamano: con menos de 3 millones de parametros y ejecucion en CPU, declara superar a Tesseract 5.5 en los benchmarks OmniParseBench y olmOCR-Bench, y procesa 10,59 paginas por segundo en un solo nucleo de CPU en modo greedy, frente a las 0,92 de Tesseract. Esta pensado para despliegues ligeros, sin GPU, donde el coste computacional y el tamano del binario son criticos.

La version 1.1 reentrena las mismas cuatro redes sobre una mezcla distinta de lineas y paginas renderizadas y reales, y anade la posibilidad de alternar entre decodificacion greedy, 7-grama, transformer de caracteres o ambos mediante un flag. El modelo se distribuye en FP32, FP16 e INT8, con pesos en safetensors y ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de cuatro redes convolucionales (orient, det, rec-latin, order) + dos modelos de lenguaje auxiliares (7-grama de caracteres y transformer de caracteres) |
| Parametros totales | 2.774.014 (redes); 912 K adicionales en el transformer de caracteres |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de OCR por lineas, no de contexto textual) |
| Tipos de cuantizacion | FP32, FP16, INT8 |
| Idiomas soportados | Ingles, ruso, griego (escritura latina, cirilica y griega) |
| Licencia | carbon-ocr-openrail-ams (otros terminos, ver LICENSE-WEIGHTS.md) |
| Formato de pesos | safetensors, ONNX |

Desglose de parametros por red:

| Red | Funcion | Parametros | Entrada | Salida |
|---|---|---|---|---|
| orient | Orientacion de pagina | 338.669 | Miniatura 512x512 en escala de grises, mapa de tinta | 13 puntuaciones de clase (12 bins de 30 grados + CJK vertical) |
| det | Deteccion de lineas e imagenes | 442.564 | Pagina en grises, lado largo 1024 | 4 mapas a stride 2 |
| rec-latin | Reconocimiento de lineas latinas, cirilicas y griegas | 1.511.104 | Recorte de linea 32 x W, mapa de tinta | 800 puntuaciones CTC por 4 px |
| order | Orden de lectura, etiquetas de bloque, estructura de tablas | 481.677 | 16 caracteristicas por linea | Sucesor, mismo bloque, fila/columna/celda de tabla, 13 etiquetas de bloque |

## Arquitectura y entrenamiento

El sistema combina cuatro redes convolucionales especializadas que se ejecutan en cascada: orient estima la rotacion de la pagina, det localiza lineas de texto e imagenes, rec-latin transcribe cada linea con decodificacion CTC (800 clases por cada 4 px, clase 0 como blank) y order reconstruye el orden de lectura y la estructura de tablas a partir de caracteristicas geometricas y textuales de cada linea. La innovacion principal no esta en una arquitectura transformer grande, sino en la division del problema de OCR en subtareas muy pequenas y especializadas que caben en CPU.

El reconocedor se apoya en dos modelos de lenguaje opcionales que solo puntuan la salida de rec-latin: un 7-grama de caracteres con suavizado Kneser-Ney modificado interpolado (12,7 millones de n-gramas en 93,9 MB, mapeado en memoria, con pesos alpha 0.3, beta 2.0 y gate 2.0) y un transformer de caracteres de 912 K parametros. Un flag permite elegir entre sin modelo de lenguaje (greedy, por defecto), 7-grama, transformer o ambos. El entrenamiento se realizo sobre una mezcla de lineas y paginas renderizadas y reales; no se detalla el numero de tokens ni la composicion exacta del dataset. No se menciona RLHF ni DPO, lo cual es coherente con un modelo de OCR supervisado.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre documentos con escritura latina, cirilica y griega.
- Deteccion de orientacion de pagina, incluyendo rotaciones en bins de 30 grados y texto CJK vertical.
- Deteccion de lineas de texto y de imagenes dentro de la pagina.
- Reconstruccion del orden de lectura y etiquetado de bloques (13 categorias).
- Extraccion de estructura de tablas (filas, columnas y celdas).
- Decodificacion configurable: greedy, 7-grama de caracteres, transformer de caracteres o combinacion.
- Ejecucion en CPU en precision INT8 por defecto, con opcion FP32 y FP16.
- Exportacion a ONNX y safetensors para integracion en pipelines propios.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto libre: es un modelo image-to-text acotado a transcripcion documental.

## Casos de uso

- Digitalizacion masiva de archivos en CPU: al procesar 10,59 paginas por segundo en un solo nucleo en modo greedy, un servidor de 16 nucleos puede digitalizar del orden de 160 paginas por segundo sin GPU, lo que lo hace adecuado para fondos documentales de gran volumen.
- Extraccion de tablas en informes financieros y cientificos: la red order proporciona estructura de filas, columnas y celdas, y el modelo declara 49,7 de TEDS en OmniDocBench, lo que permite reconstruir tablas en formatos estructurados sin post-procesado manual.
- Procesamiento de documentos multilingues en Europa del Este y Grecia: cubre latin, cirilico y griego en un unico conjunto de pesos, util para administraciones publicas y archivos con fondos mixtos.
- Digitalizacion de documentos escaneados con orientacion variable: la red orient corrige paginas rotadas antes de la deteccion, lo que reduce fallos en lotes de escaneos sin control de calidad previo.
- Integracion en pipelines de extraccion de datos en produccion: al exportarse a ONNX y safetensors y ejecutarse en CPU, se puede desplegar en contenedores ligeros junto a servicios de ingestión documental sin depender de GPU.
- OCR en dispositivos con recursos limitados: con menos de 3 millones de parametros en las redes y un 7-grama de 93,9 MB, es viable en entornos edge o en servidores sin acelerador, donde Tesseract es la alternativa habitual.
- Reconstruccion de orden de lectura en documentos complejos: la red order permite reordenar bloques de texto en maquetas de periodicos, revistas o formularios antes de enviar el texto a un sistema posterior.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados), con el 7-grama en precision por defecto, frente a Tesseract 5.5 en las mismas paginas:

| Benchmark / metrica | fullerene-1.1-3M (7-grama) | Tesseract 5.5 |
|---|---|---|
| OmniParseBench, headline | 55,1 | 5,9 |
| OmniParseBench, tests de texto superados (%) | 31,2 | 17,8 |
| OmniParseBench, tests de tabla superados (%) | 47,9 | 0,0 |
| OmniParseBench, tests de layout superados (%) | 86,3 | no disponible |
| olmOCR-Bench, headline | 52,5 ± 0,8 | 34,2 ± 1,0 |
| olmOCR-Bench, tests de tabla superados (%) | 55,5 | no disponible |
| olmOCR-Bench, cabeceras y pies superados (%) | 83,2 | no disponible |
| OmniDocBench (paginas en ingles), distancia de edicion de texto (menor es mejor) | 0,150 | 0,129 |
| OmniDocBench (paginas en ingles), TEDS de tablas | 49,7 | no disponible |
| OmniDocBench (paginas en ingles), distancia de edicion de orden de lectura (menor es mejor) | 0,274 | no disponible |

Rendimiento en CPU (un nucleo):

| Modo | Paginas por segundo |
|---|---|
| Greedy (sin modelo de lenguaje) | 10,59 |
| 7-grama | 7,67 |
| FP32 con 7-grama | 4,10 (55,33 en OmniParseBench) |
| Tesseract 5.5 | 0,92 |

## Requisitos de hardware

- VRAM: el modelo esta disenado para CPU; no requiere GPU. En FP32 los pesos de las redes ocupan unos 11 MB y el 7-grama 93,9 MB; en INT8 el consumo es menor.
- GPU recomendadas: no aplica; el motor Carbon-OCR esta escrito en C++ y CUDA, pero el modelo se evalua en CPU por defecto.
- Cabe en cualquier GPU consumer e incluso en CPU de un solo nucleo; el cuello de botella es el reconocimiento por lineas, no la memoria.
- Opciones de despliegue: Carbon-OCR (motor oficial en C++/CUDA), ONNX Runtime para los ficheros ONNX, y carga directa de safetensors. No se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos.
- Latencia y throughput: 10,59 paginas por segundo en greedy y 7,67 con 7-grama en un nucleo de CPU; 4,10 paginas por segundo en FP32 con 7-grama.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fullerene-1.1-3M | 2,77 M (redes) + 912 K (transformer) | No aplica | OCR especializado en CPU, 4 redes + LM | carbon-ocr-openrail-ams | Hugging Face, ONNX y safetensors |
| Tesseract 5.5 | No disponible | No aplica | OCR clasico con LSTM | Apache 2.0 | Ampliamente disponible |
| Modelos OCR basados en VLM (p. ej. familias tipo Donut o similar) | Cientos de millones a miles de millones | Depende del modelo | Transformer image-to-text generativo | Variable | Hugging Face |

La comparacion directa con Tesseract 5.5 es la que aporta el autor: fullerene-1.1-3M gana en OmniParseBench y olmOCR-Bench, pero pierde en distancia de edicion de texto en OmniDocBench (0,150 frente a 0,129). Frente a modelos OCR basados en VLM, fullerene es ordenes de magnitud mas pequeno y no requiere GPU, a costa de no soportar generacion libre ni contextos largos.

## Limitaciones y advertencias

- Los pesos INT8 "fallaron sus puertas" de validacion segun el autor y se distribuyen igualmente; el modo por defecto en CPU los usa, lo que puede degradar la precision frente a FP32.
- El modelo solo cubre escritura latina, cirilica y griega; no soporta CJK, arabe, hebreo ni otras escrituras, salvo la deteccion de orientacion para CJK vertical.
- En OmniDocBench, Tesseract obtiene mejor distancia de edicion en texto plano (0,129 frente a 0,150), por lo que fullerene no es superior en todos los escenarios.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente.
- La licencia carbon-ocr-openrail-ams es de tipo "other"; es necesario revisar LICENSE-WEIGHTS.md antes de cualquier uso comercial.
- Riesgo de alucinacion bajo en cuanto a generacion libre (el modelo transcribe, no genera), pero posible en la puntuacion del 7-grama o el transformer de caracteres sobre lineas ambiguas.
- El modelo no es un LLM: no soporta tool calling, agentes, razonamiento multi-paso ni conversacion; cualquier uso fuera de OCR requerira un sistema adicional.
- El repositorio tiene un volumen de descargas muy bajo (2) y ninguna valoracion, lo que limita la evidencia de uso en produccion por terceros.
- La fecha de creacion indicada (2026-11-17) es futura respecto a la redaccion habitual de fichas; conviene verificar la vigencia de los artefactos.

## Enlaces

- Hugging Face: https://huggingface.co/CarbonResearchLabs/fullerene-1.1-3M
- Repositorio Carbon-OCR: https://github.com/CarbonResearchLabs/Carbon-OCR
- Licencia de pesos: https://huggingface.co/CarbonResearchLabs/fullerene-1.1-3M/blob/main/LICENSE-WEIGHTS.md
- Modelo predecesor fullerene-3M: https://huggingface.co/CarbonResearchLabs/fullerene-3M
- Dataset OmniParseBench: https://huggingface.co/datasets/datalab-to/omni_parse_bench
- Dataset olmOCR-Bench: https://huggingface.co/datasets/allenai/olmOCR-bench
- Dataset OmniDocBench: https://huggingface.co/datasets/opendatalab/OmniDocBench
