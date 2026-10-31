# one-code/indra-ocr

## Resumen

Indra OCR es un modelo de OCR de aproximadamente un millón de parámetros desarrollado por Datalab (publicado en HuggingFace bajo la organización one-code/datalab-to), diseñado para convertir PDFs e imágenes en markdown, texto plano o JSON con cajas delimitadoras. Su propuesta de valor principal es ejecutarse íntegramente en CPU mediante ONNX Runtime, sin necesidad de PyTorch ni GPU, lo que lo hace extremadamente barato de desplegar en comparación con los grandes modelos de document intelligence.

El modelo aborda el problema clásico del OCR a escala: extraer texto de documentos reales (escaneos torcidos, escritura a mano, texto en ángulos de hasta 45 grados, texto claro sobre fondo oscuro) con alta precisión y throughput. Según la model card, obtiene 66,7 en OmniParseBench (71,4 con la opción `--math`), por delante del pipeline completo PP-StructureV3 de PaddleOCR (58,4) y muy por encima de Tesseract (19,3 en texto).

Su relevancia actual radica en la combinación de tres factores: soporte de más de 80 idiomas y alfabetos (latino, cirílico, griego, CJK, árabe, hebreo, lenguas índicas, tailandés, jemer, entre otros), detección de layout con orden de lectura por líneas y bloques, y un tamaño de descarga de unos 76 MB que permite inferencia local en cualquier máquina. El repo de HuggingFace pesa 0,1 GB y los pesos suman 1.250.566 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline OCR basado en deteccion + reconocimiento, con reconocedores secundarios por alfabeto) |
| Parametros totales | 1.250.566 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision/OCR, no LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 80+ idiomas: latino (en, es, fr, de, it, pt, nl, sv, da, no, fi, tr, vi, id, ms, sw, ha, yo, etc.), cirilico (ru, uk, bg, sr), griego (el), chino (zh), japones (ja), coreano (ko), arabe (ar), persa (fa), urdu (ur), pashto (ps), hebreo (he), hindi e idiomas indicos (hi, mr, ne, bn, ta, te, kn, ml, gu, pa, or), tailandes (th), lao (lo), jemer (km), birmano (my), cingales (si), georgiano (ka), armenio (hy), amharico (am) |
| Licencia | OpenRAIL-M modificada (pesos); Apache 2.0 (codigo) |
| Formato de pesos | ONNX (tambien listado con safetensors en el repo) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna en detalle, pero la estructura del paquete revela un pipeline modular: un reconocedor principal `rec.onnx` para alfabeto latino, y unos 46 MB de "language models" adicionales para lineas dudosas que se enrutan a reconocedores especificos por alfabeto (cirilico, CJK, arabe, indicos, etc.). Esto explica el tamano total de 1,25 M de parametros: se trata de modelos pequeños y especializados que se seleccionan dinamicamente segun el script detectado en cada linea, en lugar de un unico modelo monolitico.

El sistema funciona en dos etapas: para PDFs digitales lee directamente la capa de texto (en cualquier alfabeto) y solo aplica OCR a lo que falta; para imagenes y escaneos, detecta lineas y bloques de layout (titulos, listas, tablas, pies de figura, notas al pie, cabeceras de pagina) asignando a cada uno una caja, una etiqueta y un orden de lectura. No se ha publicado informacion sobre datos de entrenamiento, numero de tokens o tecnicas de alineacion (RLHF/DPO no aplican a este tipo de modelo).

## Capacidades

- OCR de imagenes y PDFs con salida en markdown, texto plano o JSON (lineas, cajas, bloques de layout y confidencias).
- Lectura de escritura a mano: paginas y formularios manuscritos (25,2% en las pruebas de handwriting de OmniParseBench).
- Soporte de mas de 80 idiomas y alfabetos, con enrutado por script a reconocedores especializados.
- Manejo de escaneos reales: paginas laterales, boca abajo, inclinadas hasta 45 grados y texto claro sobre fondo oscuro.
- Deteccion de layout completo: caja, etiqueta y orden de lectura para cada linea y bloque (titulos, listas, tablas, leyendas, notas al pie, cabeceras).
- Procesamiento de PDFs digitales: lectura de la capa de texto nativa y OCR selectivo solo del contenido faltante.
- Ejecucion en CPU via ONNX Runtime, sin dependencia de PyTorch ni GPU.
- Opcion `--math` para mejorar el reconocimiento de notacion matematica (sube la puntuacion de 66,7 a 71,4 en OmniParseBench).
- Visor web local (`indra-ocr-viewer`) para inspeccionar resultados en http://localhost:8765.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de vision a texto especializado en OCR.

## Casos de uso

- Digitalizacion masiva de archivos documentales: con unos 44 paginas/s en 32 nucleos de CPU, es adecuado para digitalizar archivos historicos o repositorios empresariales en maquinas sin GPU, procesando millones de paginas a bajo coste.
- Conversión de papers academicos a markdown: la salida en markdown con deteccion de titulos, tablas y notas permite alimentar RAG o pipelines de indexacion de documentacion tecnica directamente.
- Procesamiento de formularios manuscritos: puede leer formularios rellenados a mano (con la limitacion de precision indicada), util en admisiones hospitalarias, logistica o administracion publica.
- OCR multilingue en un unico despliegue: oficinas que reciben documentacion en chino, arabe, hindi o cirilico no necesitan desplegar un modelo por idioma; el enrutado por script lo resuelve automaticamente.
- Preprocesamiento de corpora para LLMs: convertir PDFs escaneados a texto limpio con orden de lectura correcto es el cuello de botella tipico en la creacion de datasets de entrenamiento; Indra OCR cubre ese paso en CPU.
- Integracion en servicios backend ligeros: al no requerir GPU ni PyTorch, cabe en contenedores pequeños (unos 76 MB de modelos) para microservicios de extraccion de texto en Lambda, Cloud Run o Kubernetes con recursos modestos.
- Correccion selectiva de PDFs digitales: en PDFs con texto parcialmente rasterizado (anotaciones, sellos, firmas), OCR solo lo que falta, preservando el texto nativo.
- Validacion visual de resultados: el visor web local permite a equipos de anotacion revisar cajas y confidencias sin salir de la maquina.

## Benchmarks y rendimiento

Resultados publicados en la model card (OmniParseBench):

| Modelo / pipeline | OmniParseBench | Texto |
|---|---|---|
| Indra OCR | 66,7 (71,4 con `--math`) | 46,7 |
| PaddleOCR PP-StructureV3 | 58,4 | no disponible |
| PaddleOCR PP-OCR (texto) | no disponible | 35,8 |
| Tesseract | no disponible | 19,3 |

Rendimiento en velocidad (misma maquina y paginas):

| Metrica | Valor |
|---|---|
| Throughput | ~44 paginas/s en 32 nucleos de CPU |
| Latencia | ~210 ms por pagina en 4 nucleos |
| Frente a Tesseract | 15x mas rapido |
| Frente a PaddleOCR PP-OCR (texto) | 10x mas rapido |
| Handwriting (OmniParseBench) | 25,2% |

## Requisitos de hardware

- VRAM: no aplica; el modelo no requiere GPU. Memoria RAM minima, no disponible, pero el paquete completo pesa unos 76 MB.
- GPU recomendadas: ninguna; esta diseñado explicitamente para CPU via ONNX Runtime.
- Consumer hardware: cabe sobradamente en cualquier ordenador domestico; la model card referencia benchmarks en 32 nucleos (throughput) y 4 nucleos (~210 ms/pagina), por lo que portatiles y VPS modestos son suficientes.
- Despliegue: paquete Python oficial `pip install indra-ocr` con CLI (`indra-ocr archivo.pdf`, procesamiento por lotes con `--out`, salida JSON con `--format json`); no se menciona soporte de vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo ONNX de OCR).
- Los modelos se descargan automaticamente en la primera ejecucion desde HuggingFace (unos 76 MB: 30 MB de redes y 46 MB de modelos de lenguaje para lineas dudosas).

## Comparativa con modelos similares

| Modelo | Parametros | Hardware | Idiomas | Layout | Licencia pesos |
|---|---|---|---|---|---|
| Indra OCR | 1,25 M | CPU (ONNX) | 80+ | Si (cajas, etiquetas, orden de lectura) | OpenRAIL-M modificada |
| PaddleOCR PP-StructureV3 | no disponible | CPU/GPU | Multilingue | Si | no disponible |
| Tesseract | no disponible | CPU | ~100 | Parcial | Apache 2.0 |
| Chandra (Datalab) | no disponible | GPU (modelo grande) | no disponible | Si | no disponible |

Chandra es el modelo state of the art de la misma casa, orientado a maxima precision en escritura a mano, matematicas, tablas complejas y escaneos degradados, mientras que Indra OCR se posiciona como la opcion rapida y ligera para CPU. Tesseract y PaddleOCR son las alternativas open source clasicas, con puntuaciones inferiores en OmniParseBench segun los datos publicados.

## Limitaciones y advertencias

- Escritura a mano: la precision es limitada (25,2% en las pruebas de handwriting de OmniParseBench); para manuscritos criticos, la propia Datalab recomienda su modelo Chandra en su plataforma gestionada.
- La licencia OpenRAIL-M modificada es gratuita para investigacion, uso personal y startups con menos de 20 M USD de financiacion/ingresos, pero prohíbe el uso competitivo con la API de Datalab; el uso comercial mas alla de esas condiciones requiere licencia comercial de pago.
- El codigo es Apache 2.0, pero los pesos no: hay que revisar el archivo LICENSE antes de cualquier despliegue comercial.
- El proyecto es muy reciente (creado en octubre de 2026) con muy poca traccion en HuggingFace (36 descargas, 1 like), por lo que la madurez y el soporte comunitario son limitados.
- No se ha publicado informacion sobre sesgos, tasas de alucinacion en OCR (errores de reconocimiento en scripts de baja densidad como jemer o birmano) ni datos de entrenamiento.
- La opcion `--math` mejora el reconocimiento de formulas, pero no se detallan sus limitaciones ni su coste en latencia.
- El repo lista safetensors como formato, pero la libreria y el pipeline son ONNX; conviene verificar que formato se descarga realmente en la primera ejecucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/one-code/indra-ocr
- Version de Datalab en HuggingFace: https://huggingface.co/datalab-to/indra-ocr
- Web de Datalab: https://www.datalab.to
- Documentacion: https://documentation.datalab.to
- Playground publico: https://www.datalab.to/playground
- Benchmarks OmniParseBench: https://github.com/datalab-to/omni_parse_bench
- Repositorio de codigo (indra): https://github.com/datalab-to/indra
- Ejemplos con salidas markdown: https://github.com/datalab-to/indra/blob/main/EXAMPLES.md
- Modelo Chandra (OCR state of the art de Datalab): https://github.com/datalab-to/chandra
- Licencia de pesos: https://huggingface.co/datalab-to/indra-ocr/blob/main/LICENSE
- Licencia de codigo (Apache 2.0): https://github.com/datalab-to/indra/blob/main/LICENSE
- Precios y licencias comerciales: https://www.datalab.to/pricing
- Discord de la comunidad: https://discord.gg/KuZwXNGnfH
