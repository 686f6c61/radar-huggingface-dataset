# arlenecc/OvisOCR3-ONNX-int4

## Resumen

OvisOCR3-ONNX-int4 es una distribución ONNX cuantizada en INT4 del modelo OCR multimodal OvisOCR3, publicada por el usuario arlenecc. No se trata de un modelo entrenado desde cero, sino de una conversión de inferencia: el objetivo es ejecutar un OCR de nivel documento en CPU, sin GPU y sin depender del stack completo de PyTorch. El repositorio contiene un único grafo `ovisocr3_int4_single.onnx` de 1,16 GiB que empaqueta el codificador visual, el prefill por lotes, la decodificación token a token y la consulta de embeddings.

La innovación principal es de ingeniería de grafos: en lugar de repartir el modelo en cuatro ficheros ONNX, el autor usa un conmutador `If(mode)` con cuatro ramas (visión, prefill, decodificación, embedding) que comparten los initializers cuantizados del grafo principal. El resultado son cuatro versiones funcionalmente equivalentes con salidas idénticas bit a bit, a cambio de una penalización de velocidad de en torno al 5 % en decodificación y un arranque de sesión más lento (29 s frente a 13 s en el equipo de referencia).

Es relevante ahora porque demuestra que un OCR basado en visión-lenguaje híbrido puede caber en 1,16 GiB y correr a 13-14 tokens/s en un procesador de portátil de cuatro hilos, lo que abre el despliegue en entornos de escritorio, edge y servidores sin acelerador. La información publicada no incluye número de parámetros, contexto máximo, licencia ni idiomas soportados del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador visual tipo ViT (parches de 1536 dims, embeddings posicionales de 768 dims) + torre de lenguaje con 6 capas de atención completa y 18 capas GDN (gated delta net) con estado convolucional y recurrente; exportada como un único grafo ONNX con cuatro ramas conmutadas por `If(mode)` (derivado de las formas de los tensores del grafo) |
| Parametros totales | No disponible en la model card; estimación indicativa de ~2.300 M a partir de 1,16 GiB de pesos INT4 (no confirmada por el autor) |
| Longitud de contexto | No disponible; el ejemplo de la model card usa 638 tokens de prefill y batch = 1, con KV cache de forma dinámica `[6, 1, 2, P, 256]` |
| Tipos de cuantizacion | INT4 con `MatMulNBits` y `GatherBlockQuantized` (block-wise); el autor distribuye además una variante `dist` de 1,49 GB con embeddings en bf16 y una `dist-int4-full` de 1,16 GB en 4 ficheros |
| Idiomas soportados | No disponible; los prompts de ejemplo (`plain_ocr`) están en inglés |
| Licencia | No disponible en el repositorio |
| Formato de pesos | ONNX (opset 21), fichero único de 1,16 GiB sin datos externos; requiere onnxruntime >= 1.20 |

## Arquitectura y entrenamiento

La model card no documenta el entrenamiento (número de tokens, composición del dataset, fases de RLHF/DPO), solo la topología inferida del grafo exportado. El modelo es un VLM de arquitectura híbrida: seis capas con atención completa y caché KV de dos cabezas de 256 dimensiones, más dieciocho capas GDN que mantienen estado convolucional (`conv_state`, kernel 3) y estado recurrente (`rec_state`, 16 cabezas de 128x128). El estado recurrente total ronda los 20 MB en fp32 (18,9 MB de `rec_state` y 1,3 MB de `conv_state`), y el KV cache consume unos 24 KiB por token en fp32. La dimensión oculta del lenguaje es 1024 (`inputs_embeds` con forma `[1, C, 1024]`) y el RoPE es multidimensional, con precalculado `cos`/`sin` de 64 dimensiones.

La conversión a ONNX es la aportación técnica real. El autor multiplexa cuatro subgrafos en un solo `graph` mediante `If(mode)`: `mode=0` ejecuta la codificación visual, `mode=1` el prefill por lotes de 32 tokens, `mode=2` la decodificación de un paso con la consulta de embeddings ya inlineada y `mode=3` la consulta de embeddings aislada. Los pesos de embedding se elevan al grafo principal para no duplicar 155 MB dentro de la rama de decodificación, y las ramas capturan implícitamente los tensores de entrada del grafo principal, ya que el `If` de opset 21 solo admite la condición como entrada explícita. La verificación (`22_check_single.py`) reporta `max_abs = 0.000e+00` en las cuatro ramas frente a los modelos independientes, y texto OCR idéntico de extremo a extremo.

## Capacidades

- OCR de página completa a partir de una imagen y un prompt de texto (`plain_ocr`), con salida de texto plano.
- Codificación visual de imágenes con parches de 1536 dimensiones y posición 2D explícita (`position_ids` en formato `[N, 2]`).
- Prefill por lotes de 32 tokens, pensado para reducir el coste de arranque en prompts largos (638 tokens en el ejemplo publicado).
- Decodificación autorregresiva de un token por paso con caché KV y estado recurrente persistente entre pasos.
- Consulta de embeddings independiente (`GatherBlockQuantized`), reutilizable para inyección de tokens.
- Ejecución solo en CPU mediante onnxruntime, sin dependencia de PyTorch en el bucle de inferencia.
- No se documentan tool calling, function calling, capacidades de agente, modo thinking, audio ni visión general más allá del OCR.

## Casos de uso

- Digitalización de documentos escaneados en puesto de trabajo: con 1,16 GiB de pesos y 13-14 tokens/s en un i5 de cuatro hilos, el modelo puede transcribir páginas una a una en un portátil sin GPU, integrándose en una utilidad de escritorio que llama a onnxruntime.
- OCR por lotes en servidores sin acelerador: al ser un único fichero ONNX, se despliega como artefacto inmutable en contenedores pequeños y se escala en horizontal por procesos, aprovechando que cada sesión ocupa poco más de 1,2 GB de RAM.
- Extracción de texto en entornos air-gapped o con requisitos de soberanía del dato: no hay llamadas a servicios externos ni descarga de pesos en tiempo de ejecución más allá del propio fichero ONNX entregado con la aplicación.
- Preprocesado de pipelines documentales: el texto OCR generado puede alimentar etapas posteriores de indexación, búsqueda o clasificación; el prefill de 32 tokens por lote permite acomodar prompts largos con instrucciones de formato.
- Archivística y digitalización masiva con validación humana: la salida textual idéntica entre las variantes multi-fichero y mono-fichero permite auditar la conversión una sola vez y congelar la versión validada (`dist-single`) para todo el lote.
- Prototipado e integración en aplicaciones .NET, Java o C++ mediante bindings de onnxruntime, evitando el entorno Python en producción; el preprocesado (tokenizer, image processor, mrope) sigue requiriendo `transformers` en una etapa previa.
- Evaluación comparativa de cuantizaciones: el repositorio incluye tres empaquetados con el mismo resultado numérico, útil como banco de pruebas de rendimiento INT4 frente a embeddings en bf16 en hardware concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, OCRBench, etc.) en la información disponible. El autor sí publica mediciones de rendimiento en i5-8259U con 4 hilos, 638 tokens de prompt y 64 tokens generados:

| Metrica | Multi-fichero (4 ONNX) | Mono-fichero (1 ONNX) |
|---|---:|---:|
| Tamano total | 1,16 GB | 1,16 GB |
| Tiempo de carga de sesion | 13,0 s | 29 s |
| Prefill (638 tokens) | 8,5-11,9 s | 9,4-9,9 s |
| Decodificacion por paso | 69-73 ms | 73-76 ms |
| Velocidad de decodificacion | 13,7-14,4 tok/s | 13,2-13,7 tok/s (~ -5 %) |
| Equivalencia numerica | referencia | max_abs = 0.000e+00 en las 4 ramas |

| Variante | Ficheros ONNX | Tamano total |
|---|---:|---:|
| `dist` (embeddings bf16) | 3 ONNX + 1 NPY | 1,49 GB |
| `dist-int4-full` (embeddings INT4) | 4 ONNX | 1,16 GB |
| `dist-single` (esta) | 1 ONNX | 1,16 GB |

## Requisitos de hardware

- Pesos: 1,16 GiB en disco; la sesión de onnxruntime mantiene todos los initializers de las cuatro ramas residentes, por lo que la huella de memoria es superior a la de un modelo con una sola ruta activa.
- Memoria en ejecución: aproximadamente 1,2-1,5 GB para pesos y activaciones, más unos 20 MB de estado recurrente en fp32 y unos 24 KiB por token de contexto para el KV cache.
- CPU: validado en Intel i5-8259U de 4 hilos con 13,2-13,7 tokens/s de decodificación y prefill de 9,4-9,9 s para 638 tokens (aproximadamente 65-68 tokens/s de prefill).
- GPU: cabe en cualquier GPU consumer con 2 GB o más de VRAM; no se han publicado mediciones con CUDA Execution Provider ni TensorRT, y `MatMulNBits` en CUDA EP no está verificado en esta ficha. En GPU discreta el cuello de botella previsible es el lanzamiento de kernels y las transferencias, dado el tamano del grafo.
- Despliegue: onnxruntime >= 1.20 en CPU (ruta validada) o con execution providers CUDA/TensorRT (no verificado). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser formatos GGUF ni safetensors.
- Latencia extremo a extremo: con 638 tokens de prompt y 64 de generación, el orden de magnitud medido es de 9,4-9,9 s de prefill más 64 x 73-76 ms de decodificación, es decir, en torno a 14-15 s por página en el hardware de referencia.
- El preprocesado (tokenizer, procesador de imagen, cálculo de mrope) se ejecuta fuera del grafo y añade su propio coste si se hace en cada página.

## Comparativa con modelos similares

Comparativa interna de las tres distribuciones del mismo modelo, con datos publicados:

| Variante | Ficheros | Tamano | Carga | Decodificacion | Notas |
|---|---:|---:|---:|---:|---|
| `dist-single` | 1 | 1,16 GB | 29 s | 13,2-13,7 tok/s | Artefacto único, ~5 % más lento |
| `dist-int4-full` | 4 | 1,16 GB | 13,0 s | 13,7-14,4 tok/s | Máxima velocidad, más ficheros que versionar |
| `dist` | 3 + 1 NPY | 1,49 GB | No disponible | No disponible | Embeddings en bf16, mayor precisión teórica en la tabla |

Frente a otros OCR basados en visión-lenguaje (GOT-OCR2.0, dots.ocr, olmOCR, PaddleOCR-VL y el propio OvisOCR3 en formato PyTorch), no hay datos en la información proporcionada sobre parámetros, contexto, licencia ni resultados de benchmarks, por lo que no es posible establecer una comparación cuantitativa. La ventaja diferencial de esta distribución es el despliegue en CPU con un único fichero ONNX; la desventaja es la ausencia de licencia declarada y de métricas de calidad publicadas.

## Limitaciones y advertencias

- No se declara licencia en el repositorio: no hay autorización explícita para uso comercial. Es un bloqueante para producción hasta contactar con el autor o con el titular del modelo base.
- Solo soporta batch = 1; no hay decodificación especulativa ni procesamiento de varias páginas en paralelo dentro de una misma sesión.
- La rama de decodificación (`mode=2`) inlinea la consulta de embeddings y no puede recibir embeddings de tokens de imagen; el driver lanza un error si se intenta. Los tokens visuales solo pueden entrar en la fase de prefill.
- El preprocesado (tokenizer, procesador de imagen, cálculo de mrope) sigue dependiendo de `transformers`, de modo que el despliegue no es completamente autónomo respecto a Python y sus dependencias.
- La sesión carga los pesos de las cuatro ramas simultáneamente: el consumo de memoria es mayor que el de una exportación ortogonal y el arranque se duplica (29 s frente a 13 s).
- Las ramas dentro de `If` reciben menos optimizaciones que un grafo plano, lo que explica la pérdida de aproximadamente el 5 % en decodificación.
- No hay métricas de calidad (precisión de caracteres, robustez ante tablas, escritura manuscrita, documentos girados) ni evaluación de sesgos o tasas de alucinación publicadas. Un modelo de OCR puede omitir líneas o inventar celdas en tablas complejas, y aquí no hay datos para cuantificarlo.
- Idiomas soportados no declarados: no se puede asumir calidad en castellano sin evaluarla con un conjunto propio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y creado en 2026-10-28: conviene tratar la conversión como no auditada por terceros, aunque el autor publica un script de verificación de equivalencia numérica.
- Compatibilidad atada a onnxruntime >= 1.20 por el uso de `MatMulNBits` y `GatherBlockQuantized`; versiones anteriores fallarán al cargar el grafo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arlenecc/OvisOCR3-ONNX-int4
- Fichero principal: `onnx/ovisocr3_int4_single.onnx` (1,16 GiB), dentro del repositorio anterior
- Scripts incluidos en el repo: `run_ocr.py` (CLI de inferencia), `single_model.py` (envoltorio `OvisSingle`), `ort_runner.py`, `preprocess.py`, `22_check_single.py` (verificación de equivalencia)
- Paper, blog, demo o repositorio del modelo base OvisOCR3: no disponible en la información proporcionada
