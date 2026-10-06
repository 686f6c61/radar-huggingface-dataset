# AutomatosX/AX-DeepSeek-OCR-2-CUDA-AXQ-NVFP4-FP8-6bit

## Resumen

AX-DeepSeek-OCR-2-CUDA-AXQ-NVFP4-FP8-6bit es un checkpoint cuantizado del modelo de OCR multimodal deepseek-ai/DeepSeek-OCR-2, publicado por AutomatosX dentro de su linea AXQuant. La operacion no es un fine-tuning ni un reentrenamiento: se parte de la revision BF16 oficial (commit aaa02f3811945a91062062994c5c4a3f4c0af2b0) y se aplica cuantizacion round-to-nearest nativa mediante el encoder numpy-reference de AXQuant, con el objetivo de reducir el coste de memoria y de computo sin tocar el pipeline de inferencia original (image-text-to-text).

La particularidad tecnica es que no usa un unico tipo de dato. El autor reparte el trunk de lenguaje entre matrices NVFP4 (W4A16, con escala de bloque E4M3FN cada 16 valores) y matrices FP8 E4M3 (W8A8, con escala por fila y escalado dinamico por token en runtime), mientras deja en BF16 la torre de vision, los routers, los embeddings, las normalizaciones y la cabeza del modelo. El resultado se etiqueta como "clase de presupuesto de 6 bits": 6.2371 bits por peso efectivos en el trunk, frente a un objetivo solicitado de 6.0. Es importante subrayar que no existe un tipo de dato flotante de 6 bits en CUDA; se trata de una clase de presupuesto, no de un dtype.

El checkpoint se publica como development preview. El propio manifiesto declara status=development, runtime_verified=false y quality_certified=false, y la evidencia de runtime se limita a la carga y generacion correcta de una unica pagina en ingles autogenerada sobre dos hosts NVIDIA. Con 2.602.844.160 parametros cuantizados (3.389.119.360 en el modelo base) y 3.60 GB de safetensors, el interes practico esta en desplegar un OCR multimodal de ~3.4B en GPUs de consumo y en dispositivos embebidos, aceptando que no hay certificacion de calidad ni cifras de precision publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | deepseek_vl_v2 (torre de vision + trunk de lenguaje transformer con capas MoE y routers, segun las referencias del autor a capas MoE y proyecciones de atencion DeepseekV2) |
| Parametros totales | Modelo base: 3.389.119.360. Checkpoint cuantizado: 2.602.844.160 segun la model card; 2.728.516.480 segun los metadatos safetensors de HuggingFace (discrepancia no explicada por el autor) |
| Parametros activos | no disponible (la presencia de routers indica arquitectura MoE, pero no se publica el numero de parametros activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: NVFP4 (W4A16, E2M1 con escala de bloque E4M3FN cada 16 valores y escala global FP32 inversa) en 1152 tensores y 1.321B parametros; FP8 E4M3 (W8A8, escala FP32 por fila y escalado dinamico por token) en 1044 tensores y 1.282B parametros; 511 tensores y 0.786B parametros protegidos en BF16. Coste medido: 6.2371 bits por peso en el trunk |
| Idiomas soportados | no disponible (la unica evidencia de runtime es una pagina en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (3.602.581.136 bytes, 3.60 GB) con configuracion compressed-tensors de dos grupos; sin GGUF |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo. El checkpoint es una conversion de precision del modelo oficial DeepSeek-OCR-2, cuyo pipeline es image-text-to-text y cuya arquitectura se declara como deepseek_vl_v2. Segun el reparto documentado, la torre de vision, los routers, los embeddings, las normalizaciones y la LM head permanecen intactos en BF16, lo que sugiere que el autor ha optado por no degradar las partes mas sensibles a la cuantizacion: el encoder visual y los mecanismos de enrutamiento de un trunk MoE. Las capas lineales del trunk de lenguaje, en cambio, se reparten entre NVFP4 y FP8 E4M3, y las proyecciones de atencion DeepseekV2 se agrupan bajo un unico metodo de cuantizacion en la configuracion compressed-tensors.

La innovacion principal es el procedimiento de asignacion de precision, no el modelo en si. AXQuant planifica que matrices van a 4 bits y cuales a 8 bits bajo una restriccion de presupuesto, y la configuracion resultante se resuelve en vLLM por nombre de modulo exacto o por regex anclada. En la RTX 5090, las capas NVFP4 seleccionan el backend MARLIN NvFp4 (pesos uint8, escala de grupo E4M3FN de tamano 16, escala global FP32 por tensor) y las capas FP8 usan CompressedTensorsW8A8Fp8. El autor indica explicitamente que no hay algoritmo AWQ ni checkpoint AWQ implicado, y que la enumeracion de kernels no es exhaustiva: el smoke test verifica la carga y la generacion de ambas familias de tensores, no un recuento concreto de kernels FP8.

## Capacidades

- Generacion de texto a partir de imagenes (image-text-to-text) orientada a OCR: lectura de paginas y salida de texto reconocido.
- Procesamiento de paginas completas con prefill troceado (chunked prefill), segun la configuracion usada en la prueba de runtime.
- Salida no repetitiva verificada en la prueba de humo sobre una pagina autogenerada.
- Conservacion de la torre de vision en BF16, lo que evita cuantizar el encoder visual.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (solo se ha verificado una pagina en ingles).
- Capacidades especiales (modo thinking, audio, video): no disponible (no documentado).

## Casos de uso

- Digitalizacion masiva de documentos escaneados: el modelo convierte imagenes de paginas en texto y, con un peso de 3.60 GB, permite mantener varias instancias o un lote amplio en una sola GPU de consumo sin agotar la VRAM.
- Ingesta documental para pipelines RAG: al ser un modelo image-text-to-text servido por vLLM con API compatible con OpenAI, se puede encadenar la salida de OCR directamente a un indexador vectorial en el mismo cluster.
- Procesamiento por lotes en una estacion de trabajo: el checkpoint carga en una RTX 5090 con la imagen oficial de vLLM 0.25.1, lo que permite montar un servicio interno de OCR sin recurrir a GPUs de centro de datos.
- OCR en el borde o en vehiculos: la verificacion sobre NVIDIA Thor con vLLM 0.25.1 abre la puerta a despliegues en plataformas embebidas NVIDIA donde el presupuesto de memoria es muy ajustado.
- Extraccion de texto de formularios y justificantes en back-office: util para automatizar la entrada de datos cuando basta con texto plano y no se exige reconstruir la maquetacion, ya que el autor no certifica capacidades de layout ni de marcado.
- Preprocesado de corpus para entrenamiento: convertir grandes volumenes de PDFs escaneados a texto antes de un pipeline de filtrado y deduplicacion, aprovechando que el modelo es apache-2.0 y se puede ejecutar on-premise.
- Accesibilidad: transcripcion de documentos impresos o escaneados a texto para su posterior lectura por sintesis de voz, en un servicio local que evita enviar documentos sensibles a terceros.
- Replicacion de experimentos de cuantizacion: los comandos de reproduccion con axquant plan-cuda y convert-cuda permiten regenerar el checkpoint y comparar el reparto NVFP4/FP8, util para equipos que evaluan tecnicas de compresion mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye MMLU, HumanEval, GSM8K ni metricas de OCR (precision por caracter, por palabra, TEDS o similares), y declara explicitamente que no hay evaluacion sobre conjunto reservado, ni cualificacion de layout o marcado, ni afirmacion de precision o de velocidad.

La unica evidencia cuantificable es la prueba de humo de runtime:

| Host | GPU | Imagen de vLLM | Resultado |
|---|---|---|---|
| df-rtx5090 | GeForce RTX 5090 (CUDA 13.0, torch 2.11.0+cu130, vLLM 0.25.1) | vllm/vllm-openai@sha256:f0b9a0dc75a9fca3b6811e3279367b2d6a448055a000bfd13859587d74cef268 | passed |
| df-thor-01 | NVIDIA Thor (vLLM 0.25.1) | vllm/vllm-openai@sha256:2cc49b81319f7a66a33dd8bd63a7bfddae079122b33ce51989b6828a1f038c37 | passed |

Ambos hosts reconocieron todas las lineas esperadas sin salida repetitiva, sobre una unica pagina autogenerada en ingles. No se publican latencias ni throughput.

## Requisitos de hardware

- Pesos en disco y en memoria: 3.602.581.136 bytes (3.60 GB) en safetensors, frente a los aproximadamente 6.8 GB que ocuparia el modelo base en BF16 (calculo derivado de 3.389.119.360 parametros a 2 bytes).
- VRAM total necesaria: no disponible. Los pesos son 3.60 GB, pero la VRAM adicional depende de la cache KV, del tamano de lote y de la resolucion de imagen, y el autor no publica esas cifras.
- GPU verificadas: GeForce RTX 5090 (Blackwell) y NVIDIA Thor, ambas con vLLM 0.25.1.
- GPU de consumo: si, el modelo cabe en una GPU de consumo por tamano de pesos; la unica verificacion publicada es sobre RTX 5090. En arquitecturas anteriores a Blackwell el subconjunto NVFP4 depende del backend MARLIN de vLLM, y el autor no documenta pruebas en esas GPUs.
- Opciones de despliegue: vLLM con las imagenes oficiales vllm/vllm-openai (version 0.25.1 en las pruebas). No hay soporte documentado para llama.cpp, Ollama ni TGI, y no se distribuye GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Precision de pesos | Tamano de pesos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|---|
| AX-DeepSeek-OCR-2-CUDA-AXQ-NVFP4-FP8-6bit | 2.602.844.160 cuantizados (base 3.389.119.360) | Mixta NVFP4 + FP8 E4M3, BF16 en vision/routers/embeddings/norms/head | 3.60 GB | no disponible | apache-2.0 | safetensors + compressed-tensors (vLLM) | Publicado como development preview, sin certificacion |
| deepseek-ai/DeepSeek-OCR-2 (base) | 3.389.119.360 | BF16 | no disponible en esta busqueda (aproximadamente 6.8 GB calculados) | no disponible | apache-2.0 | safetensors (presumiblemente) | Modelo oficial |
| Otras alternativas de OCR multimodal de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada solo devolvio una pagina de parking de dominio sin contenido tecnico, por lo que no hay datos de terceros con los que contrastar. La comparativa se limita, por tanto, al modelo base del que deriva este checkpoint.

## Limitaciones y advertencias

- Es un development preview: el manifiesto declara status=development, runtime_verified=false y quality_certified=false. No implica certificacion de nivel 1 ni de nivel 2.
- La evidencia experimental es minima: una unica pagina generada en ingles, en dos GPUs. No hay evaluacion sobre conjunto reservado, ni cualificacion de layout, ni de marcado, ni afirmaciones de precision o velocidad.
- La enumeracion de kernels no es exhaustiva: el smoke test verifica la carga y la generacion de ambas familias de tensores, no un numero concreto de kernels FP8.
- No hay resultados de benchmarks publicados, por lo que no se puede estimar la perdida de precision respecto al modelo BF16.
- Discrepancia de recuento de parametros entre la model card (2.602.844.160) y los metadatos safetensors de HuggingFace (2.728.516.480). Conviene verificar la integridad del checkpoint antes de usarlo en produccion.
- Riesgo de alucinacion: inherente a los modelos generativos y no medido en este checkpoint. No hay evaluacion de fidelidad al texto de la imagen.
- Sesgos: no documentados por el autor.
- Cobertura idiomatica: no documentada; la unica verificacion publicada es sobre texto en ingles.
- Restricciones de licencia: apache-2.0, que permite uso comercial manteniendo el aviso de licencia y los atributos correspondientes. El autor no anade restricciones adicionales, pero la responsabilidad de cumplir la licencia del modelo base recae en quien despliega.
- Dependencia de runtime: el checkpoint esta pensado para vLLM (library_name: vllm) y su configuracion compressed-tensors con dos grupos depende de que el runtime resuelva correctamente los nombres de modulo y las regex ancladas. Cambiar de version de vLLM puede romper la carga.
- Dependencia de hardware: el subconjunto NVFP4 esta verificado en Blackwell (RTX 5090) y en NVIDIA Thor. No hay evidencia publicada en GPUs anteriores.
- Nota de la busqueda web: el unico resultado obtenido fue una pagina por defecto de un servidor, sin informacion tecnica aprovechable.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/AutomatosX/AX-DeepSeek-OCR-2-CUDA-AXQ-NVFP4-FP8-6bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-OCR-2
- Revision del modelo base usada en la conversion: aaa02f3811945a91062062994c5c4a3f4c0af2b0
- Imagen de vLLM usada en el host RTX 5090: vllm/vllm-openai@sha256:f0b9a0dc75a9fca3b6811e3279367b2d6a448055a000bfd13859587d74cef268
- Imagen de vLLM usada en el host NVIDIA Thor: vllm/vllm-openai@sha256:2cc49b81319f7a66a33dd8bd63a7bfddae079122b33ce51989b6828a1f038c37
- Fichero de evidencia de runtime citado por el autor: development_runtime_smoke.json (referenciado en la model card, sin URL publica indicada)
- Script de reproduccion citado por el autor: examples/ocr_smoke.py (referenciado en la model card, sin URL publica indicada)
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada
