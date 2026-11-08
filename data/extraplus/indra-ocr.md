# extraplus/indra-ocr

## Resumen

Indra OCR es un modelo de reconocimiento óptico de caracteres (OCR) de 1,25 millones de parámetros desarrollado por Datalab (publicado en Hugging Face bajo el namespace `extraplus/indra-ocr`, con espejo oficial en `datalab-to/indra-ocr`). Su objetivo es convertir PDFs e imágenes en Markdown, texto plano o JSON con coordenadas de líneas y bloques de maquetación, ejecutándose íntegramente en CPU mediante ONNX Runtime, sin PyTorch ni GPU. El modelo se distribuye como un conjunto de redes ONNX de aproximadamente 76 MB (30 MB de redes y 46 MB de modelos de lenguaje auxiliares para líneas dudosas).

La propuesta de valor es la relación entre precisión y coste computacional: según la model card, obtiene 66,7 puntos en OmniParseBench (71,4 con el modo `--math`), por delante del pipeline completo PP-StructureV3 de PaddleOCR (58,4), y procesa unas 44 páginas por segundo en 32 núcleos de CPU, lo que supone aproximadamente 15 veces la velocidad de Tesseract y 10 veces la de los modelos de texto PP-OCR de PaddleOCR. El modelo cubre más de 80 idiomas, incluidos alfabetos latino, cirílico, griego, chino, japonés, coreano, árabe, persa, urdu, hebreo, hindi, lenguas índicas, tailandés y jemer, y aborda escritura manuscrita y escaneos degradados (páginas giradas, invertidas o inclinadas hasta 45 grados).

Es relevante ahora porque demuestra que tareas de document intelligence tradicionalmente reservadas a modelos de miles de millones de parámetros o a servicios en la nube pueden resolverse con un modelo de un millón de parámetros en hardware modesto, lo que abarata el procesamiento masivo de documentos y facilita el despliegue en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (conjunto de redes ONNX: reconocedor principal `rec.onnx` y modelos de lenguaje auxiliares; sin detalle de la topología interna en la informacion disponible) |
| Parametros totales | 1.250.566 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuyen pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | Más de 80: en, fr, de, es, it, pt, nl, pl, cs, sk, ro, hu, sv, da, no, fi, tr, az, uz, vi, id, ms, sw, ha, yo, ru, uk, bg, sr, el, zh, ja, ko, ar, fa, ur, ps, he, hi, mr, ne, bn, ta, te, kn, ml, gu, pa, or, th, lo, km, my, si, ka, hy, am |
| Licencia | Pesos: OpenRAIL-M modificada; código: Apache 2.0 |
| Formato de pesos | ONNX y safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topología interna del modelo más allá de que se compone de varias redes ONNX: un reconocedor principal (`rec.onnx`, orientado a escritura latina) y modelos de lenguaje auxiliares que se aplican a líneas con baja confianza. El pipeline incluye detección de maquetación (asigna a cada línea y bloque una caja, una etiqueta —encabezado, lista, tabla, pie de página, etc.— y un orden de lectura), corrección de orientación (páginas giradas, invertidas o inclinadas hasta 45 grados) y reconocimiento por script. Para PDFs digitales, lee la capa de texto en cualquier escritura y solo aplica OCR a lo que falta.

No se han publicado en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La innovación principal declarada es de eficiencia: conseguir resultados cercanos a modelos de más de mil millones de parámetros con 1,25 millones de parámetros y ejecución en CPU.

## Capacidades

- Conversión de PDFs e imágenes a Markdown, texto plano o JSON con cajas delimitadoras, etiquetas de bloque y confidencias.
- Detección de maquetación con orden de lectura: encabezados, listas, tablas, pies de página y cabeceras de página.
- Reconocimiento de escritura manuscrita en páginas y formularios.
- Soporte de más de 80 idiomas y escrituras: latina, cirílica, griega, china, japonesa, coreana, árabe, persa, urdu, hebrea, hindi, índicas, tailandesa, jemer, georgiana, armenia y amárica, entre otras.
- Robustez ante escaneos del mundo real: páginas laterales, boca abajo, inclinadas hasta 45 grados y texto claro sobre fondo oscuro.
- Lectura de la capa de texto de PDFs digitales en cualquier escritura, con OCR selectivo solo de las regiones sin texto.
- Modo `--math` para mejorar el reconocimiento de contenido matemático (eleva la puntuación de OmniParseBench de 66,7 a 71,4).
- Visor web local (`indra-ocr-viewer`) para inspección de resultados.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; es un modelo especializado de image-to-text.

## Casos de uso

- Digitalización masiva de archivos PDF: el modelo procesa aproximadamente 44 páginas por segundo en 32 núcleos de CPU, lo que permite convertir corpus de decenas de miles de páginas en minutos sin coste de GPU.
- Extracción de datos de facturas y formularios: el JSON de salida incluye cajas, etiquetas de bloque y confidencias, lo que facilita el post-procesado con reglas o modelos posteriores para poblar bases de datos.
- Atención al cliente y gestión documental: digitalización de contratos, reclamaciones y correspondencia escaneada, incluida la manuscrita, para indexación y búsqueda en sistemas internos.
- Construcción de pipelines RAG sobre documentos: la salida Markdown con orden de lectura conserva la estructura de encabezados y listas, lo que mejora la segmentación de chunks antes de la indexación vectorial.
- Procesamiento multilingüe en organizaciones internacionales: un único modelo cubre documentos en más de 80 idiomas y escrituras, evitando mantener pipelines separados por script.
- Digitalización de patrimonio documental y archivos históricos: la tolerancia a páginas inclinadas, invertidas y texto claro sobre fondo oscuro reduce el preprocesado manual de escaneos degradados.
- Despliegue en entornos sin GPU (edge, servidores modestos, portátiles): al ejecutarse con ONNX Runtime y ocupar unos 76 MB, cabe en contenedores pequeños y en máquinas sin acelerador.
- Extracción de tablas y estructura de informes técnicos o financieros: las etiquetas de bloque permiten reconstruir tablas y secciones en Markdown para su revisión o conversión posterior.

## Benchmarks y rendimiento

| Benchmark | Indra OCR | PaddleOCR PP-StructureV3 | PaddleOCR PP-OCR (texto) | Tesseract |
|---|---|---|---|---|
| OmniParseBench (global) | 66,7 (71,4 con `--math`) | 58,4 | No disponible | No disponible |
| OmniParseBench (texto) | 46,7 | No disponible | 35,8 | 19,3 |
| OmniParseBench (manuscrito) | 25,2 % | No disponible | No disponible | No disponible |
| Throughput (32 núcleos CPU) | ~44 páginas/s | ~10x más lento que Indra (según el autor) | ~10x más lento que Indra (según el autor) | ~15x más lento que Indra (según el autor) |
| Latencia (4 núcleos CPU) | ~210 ms/página | No disponible | No disponible | No disponible |

Los datos de throughput son los declarados por el autor en la model card y se refieren a la misma máquina y al mismo conjunto de páginas. No se han publicado resultados de MMLU, HumanEval o GSM8K, que no aplican a un modelo OCR.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU con ONNX Runtime.
- Memoria RAM: no se especifica un mínimo en la informacion disponible; el conjunto de modelos ocupa unos 76 MB en disco (30 MB de redes y 46 MB de modelos de lenguaje auxiliares).
- GPU recomendadas: no aplica; el modelo está diseñado para CPU. No se documenta soporte de aceleración por GPU.
- Cabe en cualquier equipo de consumo: portátiles, mini-PC y contenedores pequeños, al no necesitar GPU ni PyTorch.
- Opciones de despliegue: paquete `indra-ocr` de PyPI (CLI `indra-ocr` y visor `indra-ocr-viewer`), ONNX Runtime como motor de inferencia. No se documenta integración con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Rendimiento estimado: ~44 páginas/s en 32 núcleos de CPU y ~210 ms por página en 4 núcleos.

## Comparativa con modelos similares

| Modelo | Parámetros | Ejecución | OmniParseBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Indra OCR | 1,25 M | CPU (ONNX) | 66,7 (71,4 con `--math`) | OpenRAIL-M modificada (pesos), Apache 2.0 (código) | Hugging Face, PyPI, GitHub |
| PaddleOCR PP-StructureV3 | No disponible | CPU/GPU | 58,4 | Apache 2.0 (según el proyecto PaddleOCR) | Repositorio PaddleOCR |
| PaddleOCR PP-OCR (texto) | No disponible | CPU/GPU | 35,8 (texto) | Apache 2.0 (según el proyecto PaddleOCR) | Repositorio PaddleOCR |
| Tesseract | No disponible | CPU | 19,3 (texto) | Apache 2.0 | Repositorio oficial de Tesseract |
| Chandra (Datalab) | No disponible | No disponible | No disponible | No disponible | Plataforma gestionada de Datalab y GitHub |

La comparación se limita a los datos publicados por el autor en la model card. No se dispone de cifras de benchmarks de Chandra en la informacion proporcionada, más allá de que Datalab la presenta como su alternativa de mayor precisión para manuscrito, matemáticas y tablas complejas.

## Limitaciones y advertencias

- El rendimiento en escritura manuscrita es limitado: 25,2 % en las pruebas de manuscrito de OmniParseBench, según reconoce el propio autor.
- La licencia de los pesos es una OpenRAIL-M modificada: gratuita para investigación, uso personal y startups con menos de 20 millones de dólares de financiación o ingresos, pero no puede usarse de forma competitiva con la API de Datalab. Para uso comercial más amplio es necesario contactar con el proveedor.
- El modelo está especializado en OCR y conversión de documentos; no es un modelo de lenguaje general y no debe emplearse para generación de texto libre, razonamiento o código.
- Riesgo de alucinación en líneas de baja confianza: el pipeline recurre a modelos de lenguaje auxiliares para líneas dudosas, lo que puede introducir texto plausible pero incorrecto; conviene revisar las confidencias del JSON en flujos críticos.
- No se documentan sesgos específicos por idioma o script; la cobertura de más de 80 idiomas no implica calidad homogénea entre todos ellos, y no se publican métricas desagregadas por idioma.
- No se especifican la longitud de contexto ni límites de tamaño de página o documento en la informacion disponible.
- El repositorio de Hugging Face consultado (`extraplus/indra-ocr`) registra 0 descargas y 0 likes en el momento de la consulta; el espejo oficial del autor es `datalab-to/indra-ocr`.
- La fecha de creación del repositorio (2026-11-08) aparece en el futuro respecto a la fecha habitual de consulta; conviene verificar la vigencia de los datos antes de citarlos.

## Enlaces

- Hugging Face (repositorio consultado): https://huggingface.co/extraplus/indra-ocr
- Hugging Face (espejo oficial de Datalab): https://huggingface.co/datalab-to/indra-ocr
- GitHub del proyecto: https://github.com/datalab-to/indra
- Ejemplos de salida: https://github.com/datalab-to/indra/blob/main/EXAMPLES.md
- Paquete PyPI: https://pypi.org/project/indra-ocr/
- OmniParseBench: https://github.com/datalab-to/omni_parse_bench
- Chandra (modelo de mayor precisión de Datalab): https://github.com/datalab-to/chandra
- Página principal de Datalab: https://www.datalab.to
- Documentación: https://documentation.datalab.to
- Playground público: https://www.datalab.to/playground
- Precios y licencias comerciales: https://www.datalab.to/pricing
- Discord: https://discord.gg/KuZwXNGnfH
