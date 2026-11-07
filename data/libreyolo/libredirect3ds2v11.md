# LibreYOLO/LibreDirect3DS2v11

## Resumen

LibreDirect3DS2v11 es un espejo del modelo Direct3D-S2 v1.1 de DreamTech, un sistema de generacion de mallas 3D a partir de una unica imagen. El modelo genera el objeto completo como un campo de distancia con signo (SDF) sobre voxeles dispersos, con resolucion de hasta 1024^3. El empaquetado corre a cargo de LibreYOLO, que lo redistribuye sin modificar los pesos originales, pensado para ejecutarse en PyTorch puro sin dependencias de kernels CUDA personalizados, torchsparse, flash-attn ni Triton.

La relevancia de esta version reside en la portabilidad: al eliminar las dependencias de aceleracion especificas de NVIDIA, el mismo modelo funciona en GPUs NVIDIA, en Apple Silicon (MPS) y en CPU. Esto lo hace util para entornos de desarrollo sin GPU dedicada, portatiles con chip de Apple o pipelines de CI donde no hay aceleradores disponibles.

No se trata de un modelo nuevo ni reentrenado: todos los ficheros bajo `direct3d-s2-v-1-1/` son identicos byte a byte a los del repositorio upstream de DreamTech. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo (flow transformer) denso y disperso con VAE denso y VAE SDF; atencion espacial dispersa (spatial sparse attention) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo imagen-a-3D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`) |
| Resolucion de salida | hasta 1024^3 (voxeles dispersos) |
| Tamano del repositorio | 4.2 GB |
| Entrada | imagen RGB unica |
| Salida | malla 3D (por ejemplo `.obj`) |

## Arquitectura y entrenamiento

Direct3D-S2 emplea una arquitectura de flow matching sobre voxeles dispersos con atencion espacial dispersa, disenada para escalar la generacion 3D a resoluciones muy altas (hasta 1024^3) sin el coste cuadratico que tendria una atencion densa sobre una rejilla de esa magnitud. El pipeline incluye varios componentes: un transformer de flujo denso con su VAE denso, un transformer de flujo disperso con VAE SDF a 512^3 y 1024^3, y dos refinadores (un refinador SDF a 512^3 y un refinador de signo a 1024^3). El codificador de imagen es DINOv2 con registros en su variante large (`facebook/dinov2-with-registers-large`, Apache-2.0) y la eliminacion de fondo usa BiRefNet desde `LibreYOLO/LibreTRELLISl` (MIT).

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El paper de referencia es arXiv:2505.17412, titulado "Direct3D-S2: Gigascale 3D Generation Made Easy with Spatial Sparse Attention". La innovacion tecnica central es precisamente esa atencion espacial dispersa, que permite generar geometria a escala gigavoxel manteniendo un coste computacional tratable. El empaquetado de LibreYOLO reescribe la capa de ejecucion para prescindir de kernels personalizados, lo que constituye una adaptacion de ingenieria, no un cambio en el modelo.

## Capacidades

- Generacion de mallas 3D completas a partir de una unica imagen de un objeto.
- Representacion intermedia como campo de distancia con signo (SDF) sobre voxeles dispersos.
- Resolucion de salida configurable hasta 1024^3 mediante los checkpoints dispersos y refinadores.
- Eliminacion automatica de fondo de la imagen de entrada mediante BiRefNet.
- Extraccion de caracteristicas de imagen con DINOv2 large con registros.
- Ejecucion en PyTorch puro sin torchsparse, flash-attn, Triton ni kernels CUDA personalizados.
- Compatibilidad con NVIDIA (CUDA), Apple Silicon (MPS) y CPU.
- Interfaz programatica en Python (`LibreGen`) y por linea de comandos (`libreyolo generate`).
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No dispone de capacidades multilingues, de vision general (VQA, deteccion, segmentacion) ni de audio.

## Casos de uso

- Prototipado de assets 3D para videojuegos: un artista parte de una foto o render de referencia de un objeto y obtiene una malla `.obj` que puede importar en Blender o Unity para retocar, reduciendo el tiempo de modelado inicial.
- Catalogacion y digitalizacion de producto en e-commerce: a partir de una foto de catalogo se genera una malla 3D para visores web o configuradores, con la ventaja de que el modelo corre en CPU o MPS y no exige un servidor con GPU NVIDIA.
- Desarrollo en portatiles Apple Silicon: al funcionar en MPS sin kernels CUDA, permite a investigadores y desarrolladores iterar en local sobre Mac sin depender de un cluster.
- Pipelines de CI/CD sin acelerador: la ejecucion en CPU permite incluir pruebas de generacion 3D en integracion continua para validar que el pipeline de assets produce mallas correctas.
- Realidad aumentada y visualizacion: generar mallas de objetos cotidianos a partir de una foto para su uso en visores AR o escenas 3D interactivas.
- Investigacion en generacion 3D: servir como linea base reproducible (pesos identicos a upstream, licencia MIT) para comparar metodos de generacion de mallas o de atencion dispersa.
- Educacion y demos: al no requerir GPU dedicada, permite montar demostraciones de imagen-a-3D en entornos docentes o talleres con hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio ocupa 4.2 GB y contiene cinco checkpoints, por lo que la memoria necesaria dependera del checkpoint cargado y de la resolucion de salida (512^3 o 1024^3).
- GPU recomendadas: no disponible. El modelo esta pensado para ejecutarse en GPUs NVIDIA, Apple Silicon (MPS) y CPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; la ausencia de kernels CUDA personalizados sugiere que puede ejecutarse en GPUs de consumo, pero no se aportan cifras de VRAM.
- Opciones de despliegue: libreria `libreyolo` (API `LibreGen` y CLI `libreyolo generate`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo imagen-a-3D.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion de salida | Licencia | Ejecucion sin CUDA | Disponibilidad |
|---|---|---|---|---|---|
| LibreDirect3DS2v11 | Imagen a malla 3D (SDF sobre voxeles dispersos) | hasta 1024^3 | MIT | Si (MPS y CPU) | Hugging Face (espejo de DreamTech) |
| Direct3D-S2 (upstream, DreamTech) | Imagen a malla 3D (SDF sobre voxeles dispersos) | hasta 1024^3 | MIT | No confirmado (requiere torchsparse, flash-attn y kernels CUDA) | Hugging Face y GitHub |
| Otros modelos imagen-a-3D | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo original y a su espejo, ya que no se dispone de datos verificables de otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido reentrenado ni modificado: cualquier sesgo o limitacion del Direct3D-S2 original se hereda intacto.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento ni sobre su composicion.
- Riesgo de alucinacion geometrica: al generar la malla completa a partir de una sola vista, las partes no visibles del objeto se infieren y pueden no corresponder con la realidad.
- La calidad depende de la segmentacion de fondo (BiRefNet); imagenes con fondos complejos o multiples objetos pueden degradar el resultado.
- No procesa texto ni lenguaje natural; no es adecuado para tareas de NLP, VQA ni razonamiento.
- No se han publicado cifras de VRAM, latencia ni throughput, lo que dificulta planificar el despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en comunidad ni de validacion independiente del empaquetado.
- La licencia MIT permite uso comercial, pero conviene revisar `LICENSE` y `NOTICE` del repositorio, que incluyen los SHA-256 de cada fichero y las atribuciones de DINOv2 (Apache-2.0) y BiRefNet (MIT).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreDirect3DS2v11
- Repositorio upstream en Hugging Face: https://huggingface.co/wushuang98/Direct3D-S2
- Codigo upstream en GitHub: https://github.com/DreamTechAI/Direct3D-S2
- Paper: https://arxiv.org/abs/2505.17412
- Codificador de imagen DINOv2: https://huggingface.co/facebook/dinov2-with-registers-large
- Eliminador de fondo BiRefNet (LibreTRELLISl): https://huggingface.co/LibreYOLO/LibreTRELLISl
- Documentacion de LibreYOLO: https://www.libreyolo.com/docs
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
