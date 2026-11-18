# datalab-to/indra-ocr

## Resumen

Indra OCR es un modelo de reconocimiento óptico de caracteres (OCR) desarrollado por Datalab, una empresa especializada en modelos de inteligencia documental. A diferencia de los OCR basados en transformers de gran tamano, Indra OCR es un modelo extremadamente compacto de aproximadamente 1,25 millones de parametros que se ejecuta sobre ONNX Runtime en CPU, sin necesidad de GPU ni de PyTorch. Convierte PDFs e imagenes en markdown, texto plano o JSON con cajas delimitadoras, etiquetas de layout y orden de lectura.

El modelo aborda el problema del procesamiento documental a escala con un enfoque de eficiencia: segun la model card, alcanza unas 44 paginas por segundo en 32 nucleos de CPU y unos 210 ms por pagina en 4 nucleos, lo que lo situa, segun el autor, 15 veces por encima de Tesseract y 10 veces por encima de los modelos de texto de PP-OCR de PaddleOCR en el mismo hardware. Cubre mas de 80 idiomas, incluyendo escrituras latinas, cirilicas, griega, china, japonesa, coreana, arabe, persa, urdu, hebreo, hindi, lenguas indicas, tailandes y jemer, ademas de escritura manuscrita y escaneos con rotaciones de hasta 45 grados.

Su relevancia actual radica en que ofrece una alternativa de bajo coste computacional para pipelines de ingestion documental masiva, donde el coste por pagina y la latencia son criticos. El modelo se distribuye con pesos en formato ONNX y safetensors, licencia OpenRAIL-M modificada, y un paquete de Python (`indra-ocr`) que descarga aproximadamente 76 MB de modelos en la primera ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo OCR sobre ONNX Runtime; componentes de red y modelos de lenguaje auxiliares) |
| Parametros totales | 1.250.566 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos distribuidos en ONNX; no se documentan variantes de cuantizacion) |
| Idiomas soportados | 80+ idiomas: en, fr, de, es, it, pt, nl, pl, cs, sk, ro, hu, sv, da, no, fi, tr, az, uz, vi, id, ms, sw, ha, yo, ru, uk, bg, sr, el, zh, ja, ko, ar, fa, ur, ps, he, hi, mr, ne, bn, ta, te, kn, ml, gu, pa, or, th, lo, km, my, si, ka, hy, am |
| Licencia | OpenRAIL-M modificada (codigo Apache 2.0) |
| Formato de pesos | ONNX y safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de que se ejecuta sobre ONNX Runtime y que combina una red principal de reconocimiento (`rec.onnx`) con modelos de lenguaje auxiliares para lineas de baja confianza. El paquete por defecto ocupa aproximadamente 76 MB, de los cuales 30 MB corresponden a redes y 46 MB a modelos de lenguaje. El modelo principal de reconocimiento esta especializado por escritura (por ejemplo, latin), y el sistema enruta cada linea detectada al reconocedor de su script correspondiente.

No se han publicado en la informacion proporcionada datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. La innovacion principal declarada es el diseno para inferencia en CPU con un pipeline de layout, deteccion de lineas, reconocimiento por script y post-procesado a markdown o JSON, incluyendo lectura de la capa de texto en PDFs digitales y OCR selectivo solo de lo que falta.

## Capacidades

- Conversion de PDFs e imagenes a markdown, texto plano o JSON con cajas delimitadoras, etiquetas de layout y confidencias.
- Deteccion de layout con etiquetas por linea y bloque: encabezados, listas, tablas, pies de figura, notas al pie y cabeceras de pagina, con orden de lectura.
- Reconocimiento de escritura manuscrita en paginas y formularios.
- Soporte de mas de 80 idiomas y multiples escrituras, con enrutado por script de cada linea.
- Manejo de escaneos del mundo real: paginas giradas, invertidas, inclinadas hasta 45 grados y texto claro sobre fondo oscuro.
- Lectura de la capa de texto de PDFs digitales en cualquier escritura y OCR unicamente del contenido faltante.
- Salida JSON estructurada con lineas, cajas, bloques de layout y niveles de confianza.
- Ejecucion en CPU sin GPU ni PyTorch, con visor web local (`indra-ocr-viewer`) para inspeccion.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; es un modelo especializado en image-to-text.

## Casos de uso

- Digitalizacion masiva de archivos PDF: el modelo procesa lotes completos con `indra-ocr *.pdf --out results/`, generando un markdown por documento y aprovechando todos los nucleos de CPU, lo que lo hace adecuado para ingestiones de alto volumen sin coste de GPU.
- Extraccion estructurada de datos de facturas y formularios: la salida JSON con cajas, etiquetas de layout y confidencias permite mapear campos y validar la extraccion en pipelines de contabilidad o ERP.
- Construccion de bases de conocimiento y RAG: la conversion de documentos escaneados a markdown preserva encabezados, listas y tablas, facilitando el chunking y la indexacion en sistemas de recuperacion aumentada.
- Procesamiento de documentos multilingues: con mas de 80 idiomas y enrutado por script, es adecuado para organizaciones con corpus en alfabetos latinos, cirilicos, arabes, indicos y CJK sin desplegar un modelo distinto por idioma.
- Digitalizacion de correspondencia y notas manuscritas: el reconocimiento de escritura cursiva y de formularios manuscritos permite transcribir cartas y registros historicos a texto editable.
- Normalizacion de escaneos degradados: la tolerancia a rotaciones de hasta 45 grados, paginas invertidas y texto claro sobre fondo oscuro reduce el preprocesado manual necesario en lotes de calidad heterogenea.
- Despliegue en entornos sin GPU: al ejecutarse sobre ONNX Runtime en CPU con un footprint de aproximadamente 76 MB, puede integrarse en contenedores ligeros, portatiles o servidores de borde donde no hay aceleradores disponibles.

## Benchmarks y rendimiento

| Benchmark | Indra OCR | Referencia |
|---|---|---|
| OmniParseBench (global) | 66,7 | PaddleOCR PP-StructureV3 completo: 58,4 |
| OmniParseBench (con `--math`) | 71,4 | No disponible |
| OmniParseBench (texto) | 46,7 | PP-OCR de PaddleOCR: 35,8; Tesseract: 19,3 |
| OmniParseBench (manuscrito) | 25,2 % | No disponible |
| Throughput en 32 nucleos de CPU | ~44 paginas/s | 15x Tesseract; 10x PP-OCR de PaddleOCR |
| Latencia en 4 nucleos de CPU | ~210 ms/pagina | No disponible |

Los datos de throughput y latencia corresponden a la misma maquina y a las mismas paginas segun la model card. No se han publicado en la informacion disponible resultados de benchmarks genericos como MMLU, HumanEval o GSM8K, que no aplican a un modelo OCR.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU sobre ONNX Runtime.
- GPU recomendadas: no aplica; el modelo esta disenado para CPU. No se documenta soporte de aceleracion por GPU.
- Cabe en cualquier CPU moderna: el paquete de modelos por defecto ocupa aproximadamente 76 MB (30 MB de redes y 46 MB de modelos de lenguaje).
- Throughput de referencia: unas 44 paginas/s en 32 nucleos y unos 210 ms por pagina en 4 nucleos.
- Opciones de despliegue: paquete de Python `indra-ocr` (CLI y API), ONNX Runtime, y visor web local `indra-ocr-viewer` en el puerto 8765. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: dependen del numero de nucleos disponibles; los valores publicados corresponden a 32 y 4 nucleos respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (OmniParseBench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Indra OCR | 1.250.566 | No disponible | 66,7 (71,4 con `--math`) | OpenRAIL-M modificada | Hugging Face, paquete `indra-ocr` |
| PaddleOCR PP-StructureV3 | No disponible | No disponible | 58,4 | No disponible en la informacion | No disponible en la informacion |
| PaddleOCR PP-OCR (texto) | No disponible | No disponible | 35,8 (score de texto) | No disponible en la informacion | No disponible en la informacion |
| Tesseract | No disponible | No disponible | 19,3 (score de texto) | No disponible en la informacion | No disponible en la informacion |

La comparativa se limita a los datos publicados en la model card. No se dispone de informacion sobre parametros, contexto ni licencia de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El rendimiento en escritura manuscrita es limitado: 25,2 % en las pruebas de manuscrito de OmniParseBench, segun reconoce el propio autor.
- El modelo esta optimizado para velocidad en CPU; para maxima precision en manuscrito, matematicas, tablas complejas y escaneos degradados, el autor remite a su modelo Chandra en la plataforma gestionada.
- La licencia de los pesos es una OpenRAIL-M modificada: gratuita para investigacion, uso personal y startups con menos de 20 millones de dolares de financiacion o ingresos, pero no puede usarse de forma competitiva con la API de Datalab. Para uso comercial mas amplio se requiere licencia adicional.
- El codigo es Apache 2.0, pero los pesos no; es necesario revisar los terminos antes de un despliegue en produccion.
- No se documentan sesgos especificos ni tasas de alucinacion; al ser un modelo OCR, el riesgo principal es la transcripcion erronea de caracteres y la perdida de estructura en documentos complejos.
- No se dispone de informacion sobre el rendimiento por idioma ni sobre la cobertura real de cada una de las 80+ lenguas declaradas.
- No se documentan limitaciones de longitud de contexto ni de tamano de pagina; el procesamiento es por pagina.
- La fecha de creacion indicada en el repositorio (2026-10-10) y la de actualizacion (2026-10-19) figuran como tales en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/datalab-to/indra-ocr
- Repositorio GitHub: https://github.com/datalab-to/indra
- Ejemplos de salida: https://github.com/datalab-to/indra/blob/main/EXAMPLES.md
- Benchmark OmniParseBench: https://github.com/datalab-to/omni_parse_bench
- Modelo Chandra: https://github.com/datalab-to/chandra
- Pagina principal de Datalab: https://www.datalab.to
- Documentacion: https://documentation.datalab.to
- Playground publico: https://www.datalab.to/playground
- Precios y licencias comerciales: https://www.datalab.to/pricing
- Discord: https://discord.gg/KuZwXNGnfH
- Licencia de los pesos: https://huggingface.co/datalab-to/indra-ocr/blob/main/LICENSE
- Licencia del codigo (Apache 2.0): https://github.com/datalab-to/indra/blob/main/LICENSE
