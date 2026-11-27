# davanstrien/page-script-id-hgnet

## Resumen

`page-script-id-hgnet` es un clasificador de imagen para identificar el sistema de escritura (script) predominante en una pagina de documento completa, sin necesidad de ejecutar OCR. Lo desarrolla davanstrien y se publica bajo licencia Apache 2.0. Dado un escaneo o fotografia de una pagina en escala de grises de 640 × 640, devuelve una probabilidad calibrada e independiente para cada uno de 21 sistemas de escritura, ademas de una clase `unknown` para rechazar paginas que no encajan.

El modelo se construye sobre el backbone `hgnetv2_b0.ssld_stage2_ft_in1k` de la libreria timm, con 4.002.851 parametros totales (3,99 M segun la model card). Es el hermano de mayor precision de `davanstrien/page-script-id` (MobileNetV4-Small, 2,52 M), y anade unos 3,2 puntos en documentos fotografiados a cambio de un coste computacional mayor. Se distribuye en dos formatos: `model.onnx` (16,0 MB) con el preprocesado, la temperatura y la sigmoide ya integrados, y `model.safetensors` para su uso con timm.

Su relevancia practica esta en el preprocesado de pipelines documentales: permite enrutar paginas por script antes de lanzar modelos OCR especificos, con latencias de decenas de milisegundos en CPU y sin dependencia de un motor OCR completo. La combinacion de 21 scripts, capacidad multi-label, umbral de rechazo calibrado y despliegue ONNX ligero lo hace util en entornos con recursos limitados o en procesamiento por lotes a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (HGNetV2-B0), backbone de timm `hgnetv2_b0.ssld_stage2_ft_in1k` |
| Parametros totales | 4.002.851 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 640 × 640 en escala de grises) |
| Tipos de cuantizacion | no disponible (se distribuye ONNX y safetensors en float; no se documentan variantes cuantizadas) |
| Idiomas soportados | 21 sistemas de escritura: Arab, Armn, Beng, Cyrl, Deva, Ethi, Geor, Grek, Gujr, Hani, Hang, Hebr, Jpan, Knda, Khmr, Latn, Mlym, Mymr, Taml, Telu, Thai |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (timm) y ONNX (`model.onnx`, 16,0 MB) |

## Arquitectura y entrenamiento

El modelo es una red convolucional de la familia HGNetV2, en concreto la variante B0 preentrenada con el esquema SSLD (self-supervised learning distillation) y ajustada en ImageNet-1k (`ssld_stage2_ft_in1k`). Sobre ese backbone se anade una cabeza de clasificacion con 21 salidas en el orden de `label_names`. La entrada es una pagina completa convertida a escala de grises, redimensionada con interpolacion bilineal a 640 × 640, normalizada con las medias y desviaciones de ImageNet y alimentada como tres canales replicados. La salida se interpreta como logits a los que se aplica `sigmoid(logits / 1.10)`, con una temperatura de 1,10 que calibra las probabilidades.

El entrenamiento sigue una receta de destilacion de conocimiento (knowledge distillation) en dos semillas (`s0` y `s1`), de las cuales la `s0` se selecciona por su rendimiento en validacion (`r2_val = 92,6%`). La model card menciona el uso de `hf_jobs` en el flujo de trabajo, aunque no detalla el numero de tokens ni la composicion exacta del dataset de entrenamiento. La innovacion tecnica principal es el diseno multi-label con umbrales calibrados: en lugar de forzar una unica etiqueta, el modelo emite probabilidades independientes por script y aplica dos umbrales (`script_threshold = 0.55` y `unknown_threshold = 0.7314`) para decidir que scripts estan presentes y cuando rechazar la pagina como `unknown`. El ONNX integra el preprocesado, la temperatura y la sigmoide, de modo que la salida ya son probabilidades calibradas.

## Capacidades

- Identificacion del sistema de escritura a nivel de pagina completa para 21 scripts, sin ejecutar OCR.
- Clasificacion multi-label: puede detectar mas de un script en una misma pagina (util en documentos mixtos o busquedas con umbral reducido).
- Rechazo calibrado mediante la clase `unknown`, con un umbral configurable para controlar la cobertura.
- Funciona sobre paginas escaneadas, PDFs digitales, fotografias de documentos y recortes de bloques de texto (con `--pad`).
- Robustez ante rotaciones de 0°, 90°, 180° y 270° en documentos digitales.
- Inferencia en CPU muy rapida (aproximadamente 79 ms con 1 hilo y 28-36 ms con 4 hilos) y alto rendimiento en GPU (621 paginas/s en A10G con bf16).
- Soporte de despliegue via ONNX Runtime y via timm/PyTorch.
- Capacidad multilingue derivada de los 21 scripts cubiertos, que abarcan alfabetos latino, cirilico, griego, arabe, hebreo, armenio, georgiano, etiope, devanagari, bengali, gujarati, tamil, telugu, kannada, malayalam, thai, khmer, myanmar, han, hangul y japones.

## Casos de uso

- Enrutado previo a OCR en pipelines documentales: clasificar cada pagina por script antes de enviarla al motor OCR adecuado, evitando lanzar modelos costosos sobre paginas que no van a procesarse bien.
- Procesamiento masivo de PDFs web: con 94,1-94,4% de precision en el conjunto `r2_test`, permite etiquetar grandes colecciones de PDFs digitales por script de forma automatica y barata en CPU.
- Digitalizacion de fondos gubernamentales: con 87,6% en `r3_test` y 90,9% en el subconjunto de escaneos, sirve para inventariar y segmentar colecciones administrativas heterogeneas.
- Filtrado y control de calidad en ingestion de datos: usar el umbral `unknown` para descartar paginas ilegibles, en blanco o de scripts no cubiertos antes de pasarlas a etapas posteriores.
- Deteccion de documentos multilingues o mixtos: con `--mixed` (umbral 0,50) se pueden identificar paginas que combinan varios scripts, util en publicaciones cientificas o administrativas bilingues.
- Procesamiento en el borde o en entornos sin GPU: al ejecutarse en ONNX Runtime con 28-36 ms por pagina en 4 hilos de CPU, es viable en servidores modestos o incluso en portatiles.
- Preetiquetado para anotacion humana: generar etiquetas iniciales de script sobre las que un revisor humano solo tenga que corregir, acelerando la creacion de datasets documentales.
- Indexacion y busqueda por script en repositorios digitales: clasificar paginas para permitir filtros por sistema de escritura en catalogos y buscadores.

## Benchmarks y rendimiento

Todos los conjuntos de prueba estan estrictamente reservados y no se usaron en entrenamiento. La precision top-1 es sin umbral (antes de la regla `unknown`). La columna "2 seeds" refleja el rango entre dos ejecuciones destiladas de la receta.

| Benchmark | Etiqueta | n | Hermano MobileNetV4-S | Este modelo | Este modelo (2 seeds) |
|---|---|---:|---:|---:|---:|
| PDFs web (`r2_test`), capa de texto | text layer | 2.056 | 94,0% | 94,1% | 94,0-94,1% |
| PDFs web (`r2_test`), etiqueta de documento | doc language | 2.695 | 94,3% | 94,4% | 94,0-94,4% |
| Documentos gubernamentales (`r3_test`, 21 scripts) | text layer / scan doc | 2.140 | 86,8% | 87,6% | 87,4-87,6% |
| — `r3_test` capa de texto limpia | text layer = doc cfg | 995 | 96,3% | 97,3% | no disponible |
| — `r3_test` subconjunto de escaneos | scan doc label | 789 | 90,1% | 90,9% | 89,7-90,9% |
| MDPBench, digital | benchmark lang | 680 | 95,6% | 96,3% | 96,2-96,3% |
| MDPBench, fotografiado | benchmark lang | 2.040 | 84,8% | 88,0% | 88,0-88,9% |
| — fotografiado `oblique` / `hold` | benchmark lang | 239 / 286 | 64,8% / 76,9% | 69,9% / 81,5% | 70-73% / 82-83% |
| Rotaciones digitales 0° / 90° / 180° / 270° | MDPBench digital | 200 | 96,0 / 90,5 / 91,5 / 91,0% | 96,0 / 91,0 / 92,0 / 91,0% | 95,5-96 / 91-94% |
| OmniDocBench, EN / ZH | human page attr | no disponible | no disponible | no disponible | no disponible |

La model card menciona ademas 100% de precision en recortes de kannada con relleno cuadrado y 91,3% de rechazo en PDFs reales en cingales de 2026 reservados. No se han publicado resultados completos de OmniDocBench en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: minima. El modelo tiene 4,0 M de parametros; en float32 ocupa aproximadamente 16 MB de pesos, mas los buffers de activacion de una entrada de 640 × 640. Cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: A10G (621 paginas/s en bf16 segun la model card), H100 o A100 para maximizar throughput en lotes grandes. En GPUs consumer (RTX 4090, RTX 3060, etc.) funciona sin problema por su reducido tamano.
- Cabe en GPU consumer: si, en cualquier GPU con al menos unos cientos de MB de VRAM libre; tambien en CPU.
- Opciones de despliegue: ONNX Runtime (formato recomendado, con preprocesado y calibracion integrados), timm/PyTorch con safetensors, y cualquier servidor compatible con ONNX (por ejemplo, Triton u ONNX Runtime Server). No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: aproximadamente 79 ms por pagina con 1 hilo de CPU y 28-36 ms con 4 hilos; 621 paginas/s en A10G con bf16. La model card indica que es unas 10 veces mas rapido que ConvNeXt-Tiny en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Scripts | Precision (MDPBench fotografiado) | Licencia | Formato |
|---|---:|---|---:|---:|---|---|
| `page-script-id-hgnet` (este) | 4,00 M | 640 × 640 gris | 21 + unknown | 88,0% | Apache 2.0 | safetensors, ONNX |
| `davanstrien/page-script-id` (MobileNetV4-Small) | 2,52 M | no disponible | 21 + unknown | 84,8% | Apache 2.0 | no disponible |
| ConvNeXt-Tiny (referencia de velocidad en la model card) | no disponible | no disponible | no aplica (clasificador generico) | no disponible | no disponible | no disponible |

El hermano MobileNetV4-Small es la alternativa directa: mas ligero (2,52 M) y mas rapido (33 ms en 1 hilo, 11 ms en 4 hilos, 1.773 paginas/s en A10G), pero con menor precision en documentos fotografiados (84,8% frente a 88,0%) y en escaneos gubernamentales (90,1% frente a 90,9%). La eleccion entre ambos depende del presupuesto de latencia y del tipo de documento. No se dispone de datos de otros modelos especializados en identificacion de script para una comparativa mas amplia en la informacion proporcionada.

## Limitaciones y advertencias

- Los umbrales por defecto (`script_threshold = 0.55`, `unknown_threshold = 0.7314`) se calibraron sobre paginas de validacion de PDFs web con un 95% de cobertura; en documentos gubernamentales rechaza aproximadamente un 10% y en documentos fotografiados aproximadamente un 29%. Es imprescindible reajustarlos sobre una muestra propia.
- Precision limitada en documentos fotografiados con condiciones dificiles: 69,9% en la categoria `oblique` y 81,5% en `hold` de MDPBench.
- La cobertura se limita a 21 sistemas de escritura; scripts no incluidos (por ejemplo, cingales, como se comprueba en la prueba de rechazo) deben caer en `unknown`, y el rechazo no es perfecto (91,3% en PDFs en cingales).
- El modelo clasifica el script predominante de la pagina, no realiza OCR ni transcribe texto; no debe usarse para extraer contenido.
- No se documentan analisis de sesgos por origen geografico o tipo de documento mas alla de los conjuntos de evaluacion; el rendimiento varia de forma notable entre PDFs web, documentos gubernamentales y fotografias.
- Riesgo de confusion en paginas con poco texto, ruido, sellos o layouts atipicos; conviene acompanar la prediccion de un umbral de confianza y de una revision en casos limite.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la model card no detalla las condiciones de los datos de entrenamiento ni posibles restricciones derivadas de los conjuntos usados.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davanstrien/page-script-id-hgnet
- Hermano mas ligero (MobileNetV4-Small): https://huggingface.co/davanstrien/page-script-id
- Demo Space (comparativa en CPU): https://huggingface.co/spaces/davanstrien/page-script-id-demo
- Modelo base en timm: https://huggingface.co/timm/hgnetv2_b0.ssld_stage2_ft_in1k
- Dataset MDPBench: https://huggingface.co/datasets/Delores-Lin/MDPBench
- Dataset OmniDocBench (parquet): https://huggingface.co/datasets/samiuc/OmniDocBench-parquet
- Repositorio timm: https://github.com/huggingface/pytorch-image-models
