# Reza2kn/Bina-0.4-Rizeh-ONNX-INT4

## Resumen

Bina-0.4-Rizeh-ONNX-INT4 es un paquete de artefactos ONNX cuantizados a 4 bits derivados del modelo base Reza2kn/Bina-0.4-Rizeh, un sistema OCR de reconocimiento de texto (lectura de lineas, no de documentos completos). Lo publica el usuario Reza2kn y esta fijado al commit `51b8c314b0552b1884c1f0e28016cb12a143f637` del repositorio fuente. Incluye los cinco lectores CTC del pipeline original (body95k, etiquetas cortas, impreso, numerico/matematico y escaneos degradados) junto con tres detectores experimentales de lineas.

La relevancia de esta publicacion es practica: ofrece conversiones de pesos mixtos (mayoria de capas MatMul en W4 con group size 16 simetrico, mientras el stem, las operaciones depthwise y los sesgos permanecen en coma flotante) pensadas para ejecutarse en ONNX Runtime (CUDA y CPU), tract (CPU, Metal y CUDA), navegador (WebGPU y WASM) y LiteRT. El autor documenta una paridad de caracteres medida de al menos 98,410 % en el peor bucket sobre 300 recortes internos de desarrollo, pero advierte explicitamente de que el bundle no supera la puerta de transcripcion del 98 % a nivel de pagina completa y no es un reemplazo cualificado del pipeline de produccion.

El modelo esta orientado al persa (`fa`) como idioma declarado, con licencia propia `bina-0.4-rizeh` que remite a los terminos CC BY-NC 4.0 del release original para los pesos del reconocedor. El tamano del repositorio es de 0,5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reconocedor CTC (image-to-text) sobre mapas de tinta; lectores derivados del modelo base Bina-0.4-Rizeh. Capas MatMul convertidas a MatMulNBits W4; stem, depthwise y sesgos en coma flotante |
| Parametros totales | no disponible (el repo pesa 0,5 GB; el modelo hermano Bina-0.4-Koochik declara 630.800.496 parametros, pero no se confirma para Rizeh) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de linea de 64 px de alto con ancho variable, no una ventana de tokens) |
| Tipos de cuantizacion | W4 group16 simetrico (`recognizer-w4-block16.onnx`) y HQQ4 block32 (`onnx-hqq4-block32`); pesos mixtos, no pipeline INT4 completo |
| Idiomas soportados | Persa (`fa`) declarado; los canaries de validacion incluyen buckets en ingles, manuscrito, mixto, periodico, impreso y sintetico |
| Licencia | `bina-0.4-rizeh` (otros); pesos del reconocedor bajo CC BY-NC 4.0 del release fuente; componentes de detector/layout derivados de Surya conservan sus terminos upstream |
| Formato de pesos | ONNX (`.onnx`), con `quantization_config.json`, `MANIFEST.json` y `vocab.json`; el repo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base es un sistema OCR por lineas basado en reconocedores CTC. Cada lector recibe un mapa de tinta en coma flotante de 64 px de alto con la relacion de aspecto preservada (negro = 1, papel = 0, margenes del 20 % vertical y 30 % horizontal medidos en altura de linea original). Las anchuras reales conservan la semantica de enmascaramiento y nunca se aplastan ni se truncan. La salida son tokens int32, confianza float32 y longitudes int32; el blank CTC es 0 y los indices no blank se mapean a `vocab.json`. La conversion visual-a-logica del persa sigue el `rtl.py` original.

En esta publicacion no se ha reentrenado nada: la cuantizacion no altero el repositorio fuente y el `model.safetensors` agregado se verifico tensor a tensor contra los checkpoints nativos publicados. Cada componente registra el SHA256 exacto de su checkpoint de origen en `quantization_config.json`, y `MANIFEST.json` contiene los hashes de los artefactos enviados. Las 81 capas MatMulNBits usan group size 16 simetrico en W4; su `accuracy_level` 4 permite downcasting o cuantizacion interna de activaciones en los kernels del runtime, de modo que entradas float32 en el grafo no garantizan un GEMM interno en float32. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento de texto por lineas (image-to-text) con cinco lectores especializados: body95k, etiquetas cortas, impreso, numerico/matematico y escaneos degradados.
- Lectura de lineas manuscritas, impresas, de periodico y sinteticas, segun los buckets de validacion del autor.
- Conversion visual-a-logica para texto persa de escritura derecha-a-izquierda.
- Inferencia en ONNX Runtime (CUDA y CPU), tract (CPU, Metal, CUDA), navegador (WebGPU y WASM) y LiteRT en CPU Linux.
- Sesiones persistentes y cache acotada de entradas exactas en el adaptador Python de referencia.
- Deteccion de lineas experimental: detector principal 1000, guardia de linea rule-C 500 y detector/cabeza para impreso.
- No incluye deteccion ni ensamblado de documentos completos, segmentacion de pagina en navegador, soporte Sherpa-ONNX ni tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Digitalizacion de lineas de texto persa en pipelines OCR existentes: se sustituye el lector FP32 por `recognizer-w4-block16.onnx` en el rol correspondiente (`python inference.py line.png --role body`) para reducir el peso del modelo manteniendo la paridad de caracteres medida por encima del 98 % en los canaries.
- Procesamiento de formularios con etiquetas cortas: el lector de etiquetas cortas permite extraer campos de formularios escaneados linea a linea, siempre que el pipeline externo aporte el recorte y el ensamblado.
- Extraccion de contenido numerico o matematico: el lector especifico permite recuperar expresiones y cifras de documentos tecnicos o facturas, con la salvedad de que la validacion a nivel de pagina completa no esta cualificada.
- OCR en navegador sin backend: `browser-reader.mjs` con WebGPU o WASM permite ejecutar el lector en el cliente con sesiones reutilizadas, deduplicacion de peticiones pendientes y cache por hash de modelo/backend/entrada, util para herramientas de accesibilidad o edicion web.
- Despliegue en dispositivos de borde sin GPU: la variante HQQ block32 sobre ONNX Runtime CPU y LiteRT en Linux CPU esta pensada para entornos sin acelerador, con la advertencia de que el importador de tract probado no carga su representacion de punto cero en coma flotante.
- Procesamiento de escaneos degradados: el lector de escaneos degradados cubre documentos con ruido o baja calidad, aunque el autor recomienda una ruta de seguridad opcional con lectores FP32 originales sobre paginas manuscritas separadas por color antes del OCR.
- Investigacion y evaluacion de cuantizacion: los artefactos incluyen hashes de procedencia y configuracion de cuantizacion, lo que facilita reproducir la comparacion de paridad entre runtimes.

## Benchmarks y rendimiento

Paridad de caracteres medida por el autor sobre 300 recortes internos de desarrollo congelados (50 por bucket: ingles, manuscrito, mixto, periodico, impreso y sintetico), comparando contra baselines PyTorch 2.10 CUDA sin comprimir. Se exige al menos 98 % de paridad por bucket; la concordancia exacta de linea se reporta aparte en `VALIDATION.json`.

| Runtime | Componentes de lector | Paridad de caracteres mas baja por bucket |
|---|---:|---:|
| onnx-w4-block16 | 5/5 | 98,410 % |
| onnx-hqq4-block32 | 5/5 | 98,583 % |
| onnx-linux-cuda-w4-block16 | 5/5 | 98,642 % |
| onnx-linux-cpu-hqq4-block32 | 5/5 | 98,583 % |
| tract-cpu-w4-block16 | 5/5 | 98,672 % |
| tract-metal-w4-block16 | 5/5 | 98,672 % |
| tract-linux-cuda-w4-block16 | 5/5 | 98,672 % |
| browser-webgpu | 5/5 | 98,672 % |
| browser-wasm | 5/5 | 98,672 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los tiempos de Mac se recogieron durante trabajo concurrente de conversion y navegador y no son rankings de velocidad controlados; los resultados de CPU y CUDA en Linux son especificos del host y Windows nativo no se ha probado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 0,5 GB, por lo que el lector individual en W4 deberia caber holgadamente en GPUs de consumo, aunque no se publican cifras por componente.
- GPU recomendadas: no se especifican modelos concretos; se documentan rutas CUDA en ONNX Runtime y tract, y Metal en tract sobre un Mac M2.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras tarjetas concretas; el despliegue en navegador via WebGPU sugiere que el modelo es ligero, pero no hay mediciones publicadas.
- Opciones de despliegue: ONNX Runtime (CUDA y CPU), tract (CPU, Metal, CUDA), navegador con ONNX Runtime Web 1.31.1 (WebGPU y WASM, con aislamiento cross-origin para WASM con hilos) y LiteRT en Linux CPU. No se reclama soporte de Sherpa-ONNX.
- Latencia y throughput: no disponibles. El autor advierte que los tiempos de Mac no son comparables y que los resultados Linux son especificos del host.
- Plataformas no probadas: Windows nativo, hardware iOS y dispositivos Android (LiteRT se probo solo en CPU Linux).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / formato | Licencia | Notas |
|---|---|---|---|---|
| Reza2kn/Bina-0.4-Rizeh-ONNX-INT4 | no disponible (repo 0,5 GB) | Entrada de linea 64 px de alto; ONNX W4/HQQ4 | `bina-0.4-rizeh` (CC BY-NC 4.0 para reconocedores) | Bundle cuantizado con paridad de caracteres >= 98,410 % en canaries; no cualificado a nivel de pagina |
| Reza2kn/Bina-0.4-Rizeh (base) | no disponible | Misma entrada de linea; safetensors FP32 | CC BY-NC 4.0 (reconocedores) | Version de referencia sin cuantizar |
| Reza2kn/Bina-0.4-Koochik | 630.800.496 | Image-to-text con backbone C-RADIOv4-SO400M y decodificador autorregresivo | no disponible | Derivado de NVIDIA Nemotron-3.5-Parse; arquitectura distinta (autoregresiva, no CTC) |
| Reza2kn/Bina-0.4-Koochik-ONNX-INT4 | 630.800.496 | ONNX INT4 calibrado (checkpoint 18.404) | no disponible | Version cuantizada del anterior, con arquitectura y parametros sin cambios |

## Limitaciones y advertencias

- El bundle no supera la puerta del 98 % de transcripcion a nivel de pagina completa: una muestra publica de tablas manuscritas expuso que el pipeline puro W4 altero sustancialmente la salida aunque los canaries de linea pasaran. No es un reemplazo cualificado de 4 bits del pipeline de produccion.
- Los canaries de desarrollo no son una certificacion de precision en held-out ni de pagina completa; la concordancia exacta de linea se reporta por separado y no se garantiza.
- Los detectores incluidos son experimentales: su impacto en geometria, tablas y transcripcion no esta cualificado y no deben sustituir a los detectores de produccion basados solo en IoU de mascara.
- La cuantizacion es de pesos mixtos, no un pipeline INT4 completo: el pipeline Python de referencia tambien usa layout/orden de Surya, rutas nativas de detector, maquinaria de tablas y modelos pequenos de admision/ordenacion.
- La ruta de seguridad opcional con lectores FP32 sobre paginas manuscritas separadas por color es de precision mixta y requiere una cualificacion separada del pipeline completo; no hace que el modelo W4 puro pase.
- Restricciones de licencia: los pesos y el codigo del reconocedor original estan bajo CC BY-NC 4.0, lo que limita el uso comercial; los componentes derivados de Surya conservan sus terminos upstream y estas conversiones no conceden derechos adicionales.
- El idioma declarado es solo persa (`fa`); el rendimiento en otros idiomas no esta validado aunque los canaries incluyan ingles.
- Riesgo de alucinacion y sesgos: no se documentan sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- No hay soporte declarado de Sherpa-ONNX, segmentacion de pagina en navegador ni ensamblado de tablas en el cargador web.
- El importador de tract probado no puede cargar la representacion de punto cero en coma flotante de la variante HQQ/block32.
- `accuracy_level` 4 en las capas MatMulNBits permite downcasting o cuantizacion interna de activaciones, por lo que entradas float32 no garantizan precision float32 en el GEMM interno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Reza2kn/Bina-0.4-Rizeh-ONNX-INT4
- Modelo base: https://huggingface.co/Reza2kn/Bina-0.4-Rizeh
- Commit fijado del modelo base: https://huggingface.co/Reza2kn/Bina-0.4-Rizeh/tree/51b8c314b0552b1884c1f0e28016cb12a143f637
- Licencia referenciada: https://huggingface.co/Reza2kn/Bina-0.4-Rizeh/blob/51b8c314b0552b1884c1f0e28016cb12a143f637/README.md
- Modelo hermano Bina-0.4-Koochik: https://huggingface.co/Reza2kn/Bina-0.4-Koochik
- Modelo hermano Bina-0.4-Koochik-ONNX-INT4: https://huggingface.co/Reza2kn/Bina-0.4-Koochik-ONNX-INT4
