# inferenceport-ai/TRELLIS.2-4B-GGUF

## Resumen

TRELLIS.2-4B es un modelo de generación de activos 3D a partir de imágenes, desarrollado por Microsoft. Con 4.000 millones de parámetros, emplea una arquitectura de flujo (flow matching) sobre latentes estructurados nativos (SLAT) y una estructura de voxeles dispersos denominada O-Voxel, lo que permite reconstruir mallas con topologías complejas, aristas definidas y materiales PBR completos. El modelo original está disponible en safetensors, pero esta versión concreta, publicada por inferenceport-ai, es una conversión a formato GGUF en precisión f16, pensada para ejecutarse sin CUDA ni PyTorch mediante el runtime C++ trellis2cpp, lo que reduce drásticamente los requisitos de hardware y facilita el despliegue local.

La relevancia de esta conversión radica en que democratiza el acceso a la generación 3D de alta calidad: según pruebas publicadas, es posible ejecutar el pipeline completo en GPUs de consumo con solo 6 GB de VRAM, algo inviable con el modelo original en bf16. El repositorio incluye ocho archivos GGUF que cubren todas las etapas del pipeline (flujo de estructura dispersa, flujo de forma, flujo de textura y decodificadores), más los componentes de codificación de imagen publicados por separado. La licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de generacion 3D basado en flujo (flow matching) con latentes estructurados (SLAT) y voxeles O-Voxel |
| Parametros totales | 474.231.463 (segun metadata del repo; el modelo base declara 4B parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generacion 3D, no de texto) |
| Tipos de cuantizacion | f16 (GGUF, ggml ftype 1) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | GGUF (f16) |

## Arquitectura y entrenamiento

El modelo base TRELLIS.2-4B combina varias etapas de difusion por flujo sobre representaciones latentes estructuradas. La primera etapa genera una estructura dispersa de ocupacion en una rejilla de 64³, seguida de dos flujos de forma (Shape-SLAT) a resoluciones 512 y 1024, y dos flujos de textura (Texture-SLAT) tambien a 512 y 1024. Los decodificadores convierten los latentes en campos duales (malla y textura PBR). El codificador de imagen condicionante es un DINOv3, publicado por separado en formato GGUF.

No se han proporcionado datos sobre el conjunto de entrenamiento, numero de tokens, ni tecnicas de alineacion (RLHF, DPO). La conversion a GGUF es puramente de formato: los pesos se convirtieron de safetensors bf16/fp16 a f16 sin retrenamiento ni modificacion de valores.

## Capacidades

- Generacion de mallas 3D con texturas PBR completas a partir de una imagen de entrada.
- Soporte de topologias complejas y aristas definidas gracias a la estructura O-Voxel.
- Resolucion de salida de hasta 1536³, segun la documentacion oficial.
- Pipeline modular: cada etapa (estructura, forma, textura) se puede ejecutar de forma independiente.
- Compatible con el runtime trellis2cpp, que no requiere CUDA ni PyTorch.
- Capacidad de re-encodificar la forma generada para el flujo de textura, lo que mejora la coherencia entre geometria y materiales.

## Casos de uso

- Creacion de assets para videojuegos: un artista puede generar una malla texturizada a partir de un boceto o fotografia de referencia, acelerando el prototipado de personajes, props o escenarios. La salida PBR se integra directamente en motores como Unity o Unreal.
- Prototipado rapido en diseno industrial: a partir de una imagen de un producto, se obtiene un modelo 3D editable para evaluar formas y materiales antes de la fabricacion.
- Generacion de contenido para realidad aumentada y virtual: se pueden crear objetos 3D a partir de fotos de catalogo o de la vida real, listos para su uso en experiencias inmersivas.
- Digitalizacion de patrimonio o piezas de museo: una fotografia de una escultura o artefacto se convierte en un modelo 3D de alta fidelidad para archivo o exposicion virtual.
- Entrenamiento de modelos de vision por computador: se generan datasets sinteticos de objetos 3D con variaciones de forma y textura, utiles para tareas de deteccion o segmentacion.
- Impresion 3D: a partir de una imagen de referencia, se obtiene una malla lista para su reparacion y posterior impresion, reduciendo el tiempo de modelado manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 6 GB segun pruebas publicadas con la version GGUF, aunque puede variar segun la resolucion de salida y el numero de pasos de flujo.
- GPU recomendadas: tarjetas de consumo como NVIDIA RTX 3060 (12 GB) o superiores; tambien funciona en GPUs con 6 GB como la RTX 2060 o GTX 1660 Super, segun el articulo citado.
- No requiere CUDA ni PyTorch: el runtime trellis2cpp usa ggml, por lo que puede ejecutarse en CPU o GPU con soporte de ggml (OpenCL, Metal, etc.).
- Opciones de despliegue: trellis2cpp (repositorio localai-org/trellis2cpp), que carga los archivos GGUF directamente.
- Latencia y throughput: no se han publicado mediciones oficiales; el articulo menciona que es "a menudo mas rapido que el modelo original completo", pero sin cifras concretas.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada otros modelos de generacion 3D a partir de imagenes con los que comparar directamente.

## Limitaciones y advertencias

- La conversion GGUF es una version f16; puede haber ligeras diferencias de precision frente al modelo original en bf16, aunque no se han documentado perdidas significativas.
- Requiere el runtime trellis2cpp y los componentes auxiliares (DINOv3 y TRELLIS-image-large) publicados por separado; no es un modelo autonomo.
- No es un modelo de lenguaje: no procesa texto ni instrucciones, solo imagenes.
- La calidad de la salida depende de la calidad de la imagen de entrada; imagenes con oclusiones o iluminacion pobre pueden producir mallas degradadas.
- No se han publicado evaluaciones de sesgos o alucinaciones especificas para este modelo.
- Aunque la licencia es MIT, el uso comercial debe verificar que los componentes auxiliares (DINOv3, TRELLIS-image-large) tambien tengan licencias permisivas.

## Enlaces

- Repositorio HuggingFace de la conversion GGUF: https://huggingface.co/inferenceport-ai/TRELLIS.2-4B-GGUF
- Modelo base original: https://huggingface.co/microsoft/TRELLIS.2-4B
- Pagina oficial del proyecto: https://microsoft.github.io/TRELLIS.2/
- Repositorio GitHub de Microsoft: https://github.com/microsoft/TRELLIS.2
- Runtime trellis2cpp: https://github.com/localai-org/trellis2cpp
- Componentes auxiliares: https://huggingface.co/LocalAI-io/dinov3-vitl16-pretrain-lvd1689m-GGUF y https://huggingface.co/LocalAI-io/TRELLIS-image-large-GGUF
- Articulo sobre ejecucion local con 6 GB VRAM: https://dailytopai.com/article/how-to-run-trellis-2-3d-ai-locally-on-just-6gb-vram-with-gguf-44.html
