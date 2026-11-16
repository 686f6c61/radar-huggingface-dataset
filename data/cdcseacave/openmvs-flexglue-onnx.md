# cDcSeacave/openmvs-flexglue-onnx

## Resumen

FlexGlue ONNX para OpenMVS es un paquete de grafos ONNX exportados a partir de FlexGlue, el emparejador de imagenes denso desarrollado por el grupo CVG, adaptado por cDcSeacave para su consumo directo dentro de OpenMVS mediante ONNX Runtime. No es un modelo de lenguaje: es un componente de vision por computador orientado a structure-from-motion (SfM), que resuelve dos tareas complementarias sobre pares de imagenes: seleccion de pares mediante un descriptor global de retrieval y correspondencia densa con estimacion de pose relativa libre de intrinsecos.

El paquete incluye dos grafos estaticos con batch 1: un grafo descriptor en fp32 que produce caracteristicas densas y un vector de retrieval, y un grafo de matching en fp16 que devuelve mapas de warp bidireccionales, confianza, covisibilidad y una pose relativa (rotacion y direccion de baseline) mediante la cabeza H1. La innovacion principal es la integracion de la cabeza de pose H1 dentro del propio grafo, lo que evita depender de intrinsecos de camara y permite a OpenMVS sustituir a RoMa v2 como matcher denso usando un unico modelo.

Es relevante ahora porque simplifica el pipeline de reconstruccion 3D en OpenMVS: un solo bundle cubre tanto la seleccion de pares como el matching denso, con paridad numerica verificada frente a PyTorch en CPU y CUDA. El repositorio ocupa 0,5 GB y esta pensado para despliegue en proceso via ONNX Runtime, no como servicio generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone DINOv3 ConvNeXt-B con cabeza stride-8 (descriptor) y transformer de 9 capas con cabezas de warp, confianza, covisibilidad y pose H1 (match) |
| Parametros totales | no disponible (pesos: descriptor 358 MB, match 98 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen 512 x 512; features 256 x 64 x 64) |
| Tipos de cuantizacion | fp32 (descriptor y cabezas), fp16 (capas transformer del grafo de match) |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | dinov3-license (con licencia adicional de FlexGlue; consultar LICENSE-DINOv3.md) |
| Formato de pesos | ONNX (opset 18, pesos embebidos en los grafos) |

## Arquitectura y entrenamiento

El grafo descriptor procesa una imagen RGB planar de 512 x 512 (reescalada bilinealmente, sin antialiasing, con normalizacion ImageNet aplicada dentro del grafo) y produce caracteristicas de 256 canales a resolucion 64 x 64 mediante el backbone DINOv3 ConvNeXt-B y la cabeza stride-8 de FlexGlue. A partir de esas caracteristicas se calcula un descriptor global de retrieval de 256 dimensiones mediante GeM pooling (p = 3) y normalizacion L2, usado para la seleccion de pares de imagenes.

El grafo de matching recibe las caracteristicas de ambas imagenes y sus tamanos originales, y en una sola llamada devuelve: mapas de warp densos en stride 4 para ambas direcciones (128 x 128 x 2), mapas de confianza con las compuertas propias de FlexGlue (confianza < 0,1 y error de ciclo forward-backward > 3 px del marco de 512), un escalar de covisibilidad y la pose relativa H1 (rotacion R10 y direccion de baseline t10) calculada sobre las caracteristicas de la capa 9 promediadas a 32 x 32. La cabeza H1 tiene 462.089 parametros y anade aproximadamente 0,5 ms por par en una A100. El transformer usa 9 capas sin early stopping ni refinamiento, con atencion fusionada mediante los operadores contrib `com.microsoft::MultiHeadAttention` y `com.microsoft::Gelu`. Los pesos provienen de la release v0.1 de cvg/FlexGlue mas la cabeza H1 del fork `feat/pose-head`; no se documentan en la informacion disponible los datos de entrenamiento originales de FlexGlue.

## Capacidades

- Extraccion de caracteristicas densas de imagen con backbone DINOv3 ConvNeXt-B.
- Generacion de descriptores globales de retrieval para seleccion de pares de imagenes.
- Matching denso bidireccional con mapas de warp a stride 4.
- Estimacion de confianza por celda con filtrado por error de ciclo forward-backward.
- Prediccion de covisibilidad entre pares de imagenes.
- Estimacion de pose relativa libre de intrinsecos (rotacion y direccion de baseline) mediante la cabeza H1.
- Ejecucion en proceso via ONNX Runtime con proveedores CPU y CUDA.
- No soporta tool calling, agentes, generacion de texto ni capacidades multilingues.

## Casos de uso

- Reconstruccion 3D automatica con OpenMVS: el bundle se carga directamente en el pipeline `CreateStructure` para seleccionar pares por retrieval y ejecutar matching denso en una sola pasada, sustituyendo a RoMa v2.
- Seleccion de pares en SfM a gran escala: el descriptor de retrieval de 256 dimensiones permite filtrar que pares de imagenes merece la pena emparejar antes del matching denso, reduciendo coste computacional en colecciones grandes.
- Fotogrametria aerea: la paridad verificada en capturas aereas y la pose libre de intrinsecos facilitan la orientacion relativa de pares en vuelos con camaras no calibradas.
- Reconstruccion de secuencias handheld: el grafo de matching maneja pares de secuencias manuales con mapas de warp y covisibilidad, adecuado para escaneo de interiores y objetos.
- Estimacion de pose relativa sin calibracion: la cabeza H1 devuelve R10 y t10 sin requerir intrinsecos, util en pipelines donde la calibracion no esta disponible o es incierta.
- Integracion en herramientas de investigacion en vision: al ser grafos ONNX estaticos, se pueden insertar en scripts Python o C++ con ONNX Runtime sin dependencia de PyTorch en produccion.
- Filtrado de correspondencias por confianza: los mapas de confianza y covisibilidad permiten descartar pares o regiones poco fiables antes de triangulacion.

## Benchmarks y rendimiento

Paridad con PyTorch medida sobre 12 pares de imagenes reales de cuatro capturas (interior, aerea y dos secuencias handheld), ONNX Runtime 1.23.2:

| Comprobacion | Proveedor CPU | Proveedor CUDA |
|---|---|---|
| Caracteristicas del descriptor, diferencia absoluta maxima / coseno de retrieval | 3,3e-5 / 1,0000000 | 6,2e-3 / 1,0000000 (TF32) |
| Grafo de match vs modulo trazado (mismas capas fp16): mediana de diferencia absoluta del warp / proporcion de celdas con el mismo flag valido | 1,3e-5 / 0,999 | 3,2e-5 / 0,999 |
| Covisibilidad del grafo de match, diferencia absoluta | 1,7e-4 | 1,7e-4 |
| Cabeza H1 en el grafo vs `H1PoseHead` del repositorio: rotacion / direccion | 3,0e-5 / 3,9e-5 grados | 0,041 / 0,045 grados (TF32) |
| Cadena completa (imagen → descriptor → match) vs referencia PyTorch: rotacion / direccion | 0,063 / 0,125 grados | 0,048 / 0,136 grados |

La diferencia residual de la cadena se atribuye a la aritmetica float16 de las capas transformer; la propia referencia PyTorch varia 0,069 / 0,078 grados entre sus ejecuciones fp16 y fp32. La cabeza H1 anade aproximadamente 0,5 ms por par en una A100. No se han publicado resultados de benchmarks de precision de matching o reconstruccion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; los pesos suman aproximadamente 456 MB (358 MB descriptor fp32 + 98 MB match fp16), por lo que la inferencia cabe holgadamente en GPUs consumer.
- GPU recomendadas: A100 (referencia usada para medir la latencia de H1); cualquier GPU con soporte CUDA para ONNX Runtime.
- Cabe en GPU consumer: si, dado el tamano reducido de los grafos; no se especifican modelos concretos en la informacion disponible.
- Opciones de despliegue: ONNX Runtime con proveedor CPU o CUDA, integrado en OpenMVS mediante `-DOpenMVS_USE_ONNXRUNTIME=ON`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: la cabeza H1 anade aproximadamente 0,5 ms por par en A100; no se documentan cifras del grafo completo.
- Almacenamiento: repositorio de 0,5 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlexGlue ONNX (este bundle) | Matcher denso + pose relativa | no disponible (456 MB de pesos) | Imagen 512 x 512 | dinov3-license | Hugging Face, integrado en OpenMVS |
| RoMa v2 ONNX (`cdcseacave/openmvs-roma2-onnx`) | Matcher denso | no disponible | no disponible | no disponible | Hugging Face, mismo layout que este bundle |
| FlexGlue original (cvg/FlexGlue) | Matcher denso | no disponible | no disponible | no disponible | GitHub, release v0.1 |

La informacion disponible no permite comparar resultados de precision entre estos modelos; la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de vision para SfM: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Grafos de forma estatica y batch 1: no admiten lotes mayores ni resoluciones distintas de las fijadas sin reexportar.
- El grafo de match usa fp16 en las capas transformer, lo que introduce diferencias de hasta 0,136 grados en la direccion de pose respecto a la referencia PyTorch.
- La pose H1 asume baseline unitaria con escala desconocida (`s > 0` no observable): no proporciona traslacion metrica.
- La licencia dinov3-license se suma a la licencia de FlexGlue; es imprescindible revisar ambas antes de uso comercial.
- Dependencia de operadores contrib de ONNX Runtime (`com.microsoft::MultiHeadAttention`, `com.microsoft::Gelu`), lo que limita la portabilidad a otros runtimes ONNX.
- No se documentan sesgos, tasas de alucinacion ni cobertura idiomatica porque no aplican a este tipo de modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/cDcSeacave/openmvs-flexglue-onnx
- Licencia DINOv3: https://huggingface.co/cDcSeacave/openmvs-flexglue-onnx/blob/main/LICENSE-DINOv3.md
- FlexGlue original: https://github.com/cvg/FlexGlue
- Fork con cabeza de pose: https://github.com/cdcseacave/FlexGlue (rama `feat/pose-head`, commit `6124adb17d50b7dd7fa14e8c0ecff7f54e295c1d`)
- OpenMVS: https://github.com/cdcseacave/openMVS
- Bundle RoMa v2 ONNX: https://huggingface.co/cDcSeacave/openmvs-roma2-onnx
