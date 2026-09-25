# Builderstar/videoproc-ai-model-zoo

## Resumen

Builderstar/videoproc-ai-model-zoo no es un modelo único, sino un archivo de preservación e interoperabilidad que reúne los pesos neuronales que la aplicación comercial VideoProc Converter AI (Digiarty, serie 8.x) descarga y ejecuta en local. El repositorio contiene 31 modelos ONNX portables y 1 508 motores TensorRT serializados, además de 12 ficheros de modelos empaquetados en el instalador (NCNN y DeepFilterNet3), orientados a superresolución de imagen y vídeo, interpolación de fotogramas y reducción de ruido de audio.

El interés técnico reside en que los pesos se distribuyen sin código de aplicación, sin control de licencia y sin DRM: los ONNX son independientes del hardware y se ejecutan con `onnxruntime` en CPU o CUDA, mientras que los motores TensorRT están bloqueados a la GPU y a la versión de runtime con la que se serializaron. El autor documenta el proceso de descifrado del contenedor propietario `.drp` (envoltorio AES-128 sobre un flujo XZ/LZMA) y verifica la ejecución extremo a extremo de dos modelos de superresolución en Linux con CPU.

La relevancia actual es doble: por un lado, permite estudiar y reutilizar arquitecturas de restauración y escalado que normalmente quedan encerradas en aplicaciones de escritorio; por otro, plantea un caso claro de fricción legal, ya que los pesos siguen siendo propiedad de Digiarty y el repositorio se publica explícitamente solo para investigación, interoperabilidad y preservación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes convolucionales (CNN) de superresolucion de imagen y video, red de interpolacion de fotogramas tipo FlowNet y DeepFilterNet3 para denoising de audio; topologia interna exacta no disponible |
| Parametros totales | no disponible (no se publica el recuento por modelo) |
| Longitud de contexto | no aplica (modelos de vision y audio, no modelos de lenguaje) |
| Tipos de cuantizacion | ONNX en float32; motores TensorRT en fp32 y fp16; INT8 y GGUF no disponibles |
| Idiomas soportados | no aplica / no disponible |
| Licencia | `other` con `license_name: proprietary-digiarty` (pesos propiedad de Digiarty) |
| Formato de pesos | ONNX (31 ficheros portables), TensorRT serializado (`ftrt`, 1 508 motores), NCNN `.param`/`.bin` (magic `7767517`) y tar ONNX gzip para DeepFilterNet3 |
| Autor / repositorio | Builderstar / `Builderstar/videoproc-ai-model-zoo` |
| Libreria declarada | `onnxruntime` |
| Pipeline declarado | `image-to-image` |
| Tamano del repositorio en HuggingFace | 0,1 GB declarados (el README describe ~53 GiB de pesos desempaquetados + ~63 MiB de modelos empaquetados) |
| Numero de modelos | 31 ONNX portables + 1 508 motores TensorRT + 12 ficheros NCNN/DeepFilterNet |
| Factores de escala | x1, x2 y x4 (fijados por modelo) |
| Entrada / salida ONNX | Tensores NCHW float32 en rango [0,1], dimensiones dinamicas resueltas en tiempo de carga |
| Backends objetivo | ONNX Runtime (CPU/CUDA), TensorRT 8.6.1 y 10.9, NCNN (Vulkan o CPU), `tract` para audio |
| Fecha de creacion / actualizacion | 2026-09-25 / 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El zoo agrupa varias familias funcionales. En superresolucion de imagen conviven los modelos de primera generacion (seis ONNX, etiquetados MoDetail V2) y los de tercera generacion orientados a contenido generado por IA (once ONNX, AIGC / MoDetail V3). En superresolucion de video hay trece modelos ONNX repartidos entre las lineas Video4K V9/V10 y superVIDEO / MoDetail, con nombres de fichero que codifican factor de escala y variante, por ejemplo `Aiarty_superVIDEO_MoDetail_x2_V11_dim40_327000_768.onnx`. La interpolacion de fotogramas se cubre con dos redes FlowNet (fp16 y fp32) y la parte de audio con DeepFilterNet3 (`dfn30.m`, `dfn31.m`), empaquetado como tar ONNX comprimido con gzip.

No se documenta la topologia interna, el numero de parametros ni el regimen de entrenamiento de ninguna de las redes: no hay informacion sobre volumen de tokens o imagenes de entrenamiento, composicion del dataset, uso de RLHF/DPO ni funciones de perdida. La innovacion destacable del repositorio no es algorítmica sino de ingenieria inversa y empaquetado: el contenedor `.drp` se describe como un envoltorio AES-128 (bloque CBC de 16 bytes para clave de sesion, bloque CBC de 16 bytes para IV y carga util AES-128-CFB128) sobre un flujo XZ/LZMA que transporta un manifiesto JSON y los bytes crudos del modelo, con la clave embebida en el binario de la aplicacion y sin vinculacion a licencia ni a maquina. El autor reporta el descifrado de los 1 539 paquetes con cero fallos y la ejecucion verificada de dos modelos ONNX de superresolucion en Linux con CPU y `onnxruntime`, con salidas exactas x2 y x4.

## Capacidades

- Superresolucion de imagen con factores x1, x2 y x4, en variantes de primera generacion (MoDetail V2) y de tercera generacion (MoDetail V3 / AIGC).
- Superresolucion de video con factores x1, x2 y x4 en las lineas Video4K V9/V10 y superVIDEO / MoDetail.
- Interpolacion de fotogramas mediante FlowNet (fp16 y fp32), util para conversion de cadencia.
- Superresolucion especifica de anime en NCNN, con variantes `pro` y `se`.
- Reduccion de ruido de audio con DeepFilterNet3, consumible desde Rust `tract` u ONNX Runtime.
- Inferencia portable en CPU o GPU via ONNX Runtime y en GPU concreta via motores TensorRT precocinados.
- Soporte de dimensiones dinamicas de entrada en los ONNX (resueltas en el momento de la carga).
- No tiene capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni vision multimodal en el sentido de un modelo de lenguaje: es un conjunto de redes de restauracion y procesado de senal.

## Casos de uso

- Restauracion y escalado de archivo audiovisual: aplicar los modelos de video-superresolucion x2 o x4 para llevar material SD o HD a 4K, usando la variante ONNX en `onnxruntime` sobre CPU o GPU para lotes offline sin depender del producto original.
- Postproduccion y conversion de cadencia: emplear las redes FlowNet para interpolar fotogramas y pasar de 24 o 30 fps a 60 fps, generando fotogramas intermedios sin recurrir a herramientas de escritorio.
- Catalogo de producto en comercio electronico: reprocesar imagenes de baja resolucion con los modelos de imagen-SR x2/x4 antes de publicarlas en web o marketplace, con la ventaja de poder ejecutar el pipeline en servidor propio.
- Restauracion de anime y contenido ilustrado: los modelos NCNN `sr_ani/pro` y `sr_ani/se` estan pensados para este dominio y se pueden invocar con NCNN Vulkan o con el respaldo de CPU.
- Limpieza de pistas de audio: integrar DeepFilterNet3 para reducir ruido de fondo en grabaciones o locuciones antes de pasarlas a un pipeline de transcripcion o edicion.
- Aceleracion en produccion con GPU NVIDIA: desplegar los motores TensorRT en una flota homogenea de RTX 30/40 o RTX 50 para minimizar latencia, teniendo en cuenta que cada motor solo carga en la GPU y la version de runtime para la que se serializo.
- Investigacion comparativa de arquitecturas de superresolucion: al disponer de 31 ONNX con distintos factores de escala y generaciones, es posible montar experimentos controlados de calidad frente a coste computacional sobre las mismas entradas.
- Analisis de empaquetado y preservacion de software: los scripts de `tools/` y el informe de ingenieria inversa sirven como referencia metodologica para estudiar contenedores propietarios y para archivar pesos que dejarian de estar disponibles si la aplicacion cambia de version.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de PSNR, SSIM, LPIPS ni comparativas cuantitativas frente a otras familias, y no se dispone de numeros de MMLU, HumanEval o GSM8K porque no se trata de un modelo de lenguaje.

La unica evidencia de rendimiento funcional documentada es la verificacion de ejecucion:

| Prueba | Entrada | Salida | Backend | Resultado |
|---|---|---|---|---|
| Superresolucion x2 | 128 x 128 | 256 x 256 | ONNX Runtime, CPU, Linux | Salida exacta x2 |
| Superresolucion x4 | 256 x 256 | 1024 x 1024 | ONNX Runtime, CPU, Linux | Salida exacta x4 |

No se han publicado cifras de latencia, throughput ni consumo de VRAM por modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del modelo, del factor de escala y de la resolucion de entrada, y el autor no publica mediciones.
- GPU recomendadas: los motores TensorRT estan etiquetados para clases concretas, `tensorrt861-rt601/705/806/809` para NVIDIA RTX 30/40 con TensorRT 8.6.1 y `tensorrt1090-rt1200{,-compatible}` para NVIDIA RTX 50 con TensorRT 10.9 en fp32 y fp16.
- Viabilidad en GPU de consumo: si, los motores TensorRT incluidos estan serializados para GPUs de clase RTX 3060 y para la familia RTX 50, lo que indica que el objetivo de despliegue son tarjetas de consumo.
- Ejecucion sin GPU: si, los 31 modelos ONNX funcionan con `CPUExecutionProvider`, y los modelos NCNN admiten respaldo de CPU ademas de Vulkan.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), TensorRT mediante `nvinfer1::IRuntime::deserializeCudaEngine` en C++ o `tensorrt.Runtime` en Python, NCNN con Vulkan o CPU para los ficheros `.param`/`.bin`, y Rust `tract` u ONNX Runtime para DeepFilterNet3.
- Restriccion critica de portabilidad: los motores TensorRT estan bloqueados por GPU y por build de TensorRT/CUDA, por lo que en hardware distinto hay que usar la ruta ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El repositorio no es un modelo individual, sino una coleccion de pesos propietarios extraidos; las alternativas comparables son proyectos abiertos de la misma categoria funcional. No se dispone de datos verificables de parametros, contexto o rendimiento de esas alternativas en la informacion proporcionada, por lo que los huecos se marcan como no disponibles.

| Alternativa | Categoria | Parametros | Licencia | Formato | Datos comparativos |
|---|---|---|---|---|---|
| `Builderstar/videoproc-ai-model-zoo` | Zoo de superresolucion de imagen/video, interpolacion y audio | no disponible | `proprietary-digiarty` | ONNX, TensorRT, NCNN | 31 ONNX + 1 508 motores TRT; sin benchmarks publicados |
| Real-ESRGAN | Superresolucion de imagen | no disponible | no disponible | PyTorch / ONNX | no disponible |
| Real-CUGAN | Superresolucion de imagen (orientada a anime) | no disponible | no disponible | PyTorch / NCNN | no disponible |
| RIFE | Interpolacion de fotogramas | no disponible | no disponible | PyTorch | no disponible |
| Waifu2x / waifu2x-ncnn-vulkan | Superresolucion de imagen (anime) | no disponible | no disponible | NCNN | no disponible |

La diferencia estructural mas relevante frente a estas alternativas es que aqui se entrega un paquete heterogeneo con motores precompilados por GPU y sin documentacion de entrenamiento, mientras que los proyectos citados publican codigo de entrenamiento y pesos con licencias abiertas; esa diferencia condiciona tanto la reproducibilidad como el uso comercial.

## Limitaciones y advertencias

- Los pesos siguen siendo propiedad de Digiarty. El propio autor indica que el espejo se publica solo para investigacion, interoperabilidad y preservacion, y ofrece retirada ante reclamacion del titular. No hay concesion explicita de uso comercial.
- La licencia declarada es `other` con nombre `proprietary-digiarty`, lo que impide asumir permisos de redistribucion o explotacion derivados de una licencia abierta.
- No hay informacion sobre datos de entrenamiento, sesgos o dominios de especializacion, por lo que el comportamiento fuera del material objetivo (por ejemplo, rostros, texto o contenido medico) es impredecible.
- Riesgo de artefactos de superresolucion: alucinacion de textura y detalle inexistente es un comportamiento esperado en redes de upscaling y no debe tratarse como evidencia forense valida.
- Los motores TensorRT estan bloqueados por GPU y por version de TensorRT/CUDA; un motor cargado en hardware distinto fallara o no deserializara.
- Los ONNX trabajan en float32 con dimensiones dinamicas resueltas al cargar; cambios de forma en tiempo de ejecucion pueden provocar recompilacion o reconfiguracion del grafo.
- No hay benchmarks publicados ni cifras de latencia o VRAM, lo que dificulta dimensionar un despliegue en produccion.
- Discrepancia de inventario: la ficha de HuggingFace declara 0,1 GB de repositorio mientras el README describe unos 53 GiB de pesos desempaquetados mas 63 MiB de modelos empaquetados; conviene verificar que los pesos estan realmente subidos antes de planificar su uso.
- Sin versionado ni soporte: al proceder de un producto comercial cerrado, los pesos pueden quedar obsoletos o desaparecer en futuras versiones de la aplicacion de origen.
- El repositorio no incluye codigo de aplicacion, por lo que hay que construir todo el preprocesado, el troceado de video y el postprocesado por cuenta propia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Builderstar/videoproc-ai-model-zoo
- Referencias internas del repositorio (no enlazables directamente, citadas en la model card): `MODEL_ZOO_MANIFEST.json`, `MODEL_ZOO_MANIFEST.csv`, `MODELS.md`, `tools/REPORT.md`, `tools/re-lab-REPORT.md`
- Enlaces externos a papers, blogs, repos de codigo o demos: no disponible. La busqueda web realizada no devolvio resultados relacionados con este repositorio ni con VideoProc Converter AI; los resultados obtenidos versaban sobre otros temas y no aportan informacion util para esta ficha.
