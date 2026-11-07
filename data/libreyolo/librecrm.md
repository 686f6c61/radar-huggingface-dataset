# LibreYOLO/LibreCRM

## Resumen

LibreCRM es un empaquetado del modelo CRM ("CRM: Single Image to 3D Textured Mesh with Convolutional Reconstruction Model", ECCV 2024) desarrollado por Zhengyi Wang y colaboradores de la Universidad de Tsinghua, distribuido por el proyecto LibreYOLO. Resuelve la tarea de reconstruccion 3D a partir de una unica imagen: dado un fotograma de un objeto, genera una malla 3D texturizada. No es un modelo de lenguaje, sino un pipeline de vision por computador compuesto por dos modelos de difusion multivista y una red de reconstruccion convolucional.

El pipeline combina dos difusiones (una de pixeles y otra de mapas de coordenadas canonicas) que sintetizan seis vistas del objeto, una UNet convolucional que las convierte en un triplano, y el algoritmo FlexiCubes para extraer la malla coloreada final. Segun la model card, los pesos son identicos byte a byte a los del repositorio original `Zhengyi/CRM`; este mirror no reentrena ni convierte nada, solo facilita su ejecucion en PyTorch puro sin xformers, nvdiffrast ni librerias de malla con licencia GPL.

La relevancia de esta ficha radica en que el mirror permite ejecutar el modelo en NVIDIA, Apple Silicon (MPS) y CPU, lo que reduce la barrera de entrada respecto al repositorio original. El repositorio ocupa 12,8 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline hibrido: dos modelos de difusion multivista (UNet + VAE SD 2.1 + OpenCLIP ViT-H/14) y una red de reconstruccion convolucional (UNet de triplano, SDF, MLP de color y de pesos FlexiCubes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo image-to-3D, no textual) |
| Tipos de cuantizacion | no disponible (pesos en `.pth` de PyTorch) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | CreativeML OpenRAIL++-M (checkpoints de difusion) + MIT (pesos CRM); el mirror se etiqueta como openrail++ |
| Formato de pesos | `.pth` (PyTorch): `pixel-diffusion.pth`, `ccm-diffusion.pth`, `CRM.pth` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura propuesta en el paper de CRM (arXiv:2403.05034). El primer componente, `pixel-diffusion.pth`, es un modelo de difusion multivista basado en la UNet y el VAE de Stable Diffusion 2.1 con torres de texto OpenCLIP ViT-H/14, afinado a partir de ImageDream y MVDream. Genera seis vistas del objeto a partir de la imagen de entrada. El segundo, `ccm-diffusion.pth`, produce los mapas de coordenadas canonicas correspondientes a esas seis vistas. El tercero, `CRM.pth`, es una red de reconstruccion convolucional que fusiona las vistas en un triplano y predice una funcion de distancia con signo (SDF), color y pesos para FlexiCubes, de donde se extrae la malla final.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a esta tarea). La model card indica explicitamente que los pesos no fueron reentrenados, convertidos ni recodificados: son identicos byte a byte a los del repositorio upstream `Zhengyi/CRM` en la revision `36283fd567b9a3120a166dfe2f2e0965d96261b0`. La innovacion del empaquetado LibreYOLO es de infraestructura: ejecucion en PyTorch puro sin xformers, nvdiffrast ni librerias de malla GPL, habilitando MPS y CPU ademas de CUDA.

## Capacidades

- Reconstruccion 3D texturizada a partir de una unica imagen de un objeto (pipeline image-to-3D).
- Generacion de seis vistas multivista mediante difusion de pixeles.
- Generacion de mapas de coordenadas canonicas multivista mediante difusion dedicada.
- Extraccion de malla con colores por vertice (vertex colours) y exportacion a `.obj`.
- Generacion opcional de textura UV (requiere `xatlas` instalado).
- Ejecucion en NVIDIA (CUDA), Apple Silicon (MPS) y CPU.
- Interfaz programatica en Python (`from libreyolo import LibreGen`) y por linea de comandos (`libreyolo generate source=chair.png model=crm`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo linguistico.

## Casos de uso

- Prototipado de assets 3D para videojuegos: a partir de una foto o render de un objeto se obtiene una malla `.obj` con color utilizable como base en un motor como Unity o Unreal, reduciendo el tiempo de modelado manual inicial.
- Catalogos de comercio electronico en 3D: convertir fotografias de producto en mallas texturizadas para visores web o configuradores, aprovechando la generacion desde una sola imagen.
- Escaneo y digitalizacion de patrimonio: reconstruir piezas o maquetas a partir de una fotografia cuando no es posible un escaneo fotogrametrico completo.
- Generacion de contenido para impresion 3D: obtener mallas de objetos sencillos como punto de partida para retoque y laminado.
- Investigacion en vision 3D: usar el pipeline como baseline reproducible (pesos identicos al upstream) para experimentos de reconstruccion single-image.
- Educacion y demos: ejecutar el pipeline en un portatil con Apple Silicon o incluso en CPU gracias al soporte MPS/CPU del empaquetado, sin necesidad de GPU NVIDIA ni dependencias CUDA.
- Automatizacion de pipelines de assets: integrar la CLI `libreyolo generate` en scripts de procesamiento por lotes de imagenes a mallas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio ocupa 12,8 GB en disco, lo que da una cota inferior del espacio de almacenamiento necesario.
- GPU recomendadas: no disponible de forma especifica; el empaquetado soporta NVIDIA (CUDA), Apple Silicon (MPS) y CPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el soporte de MPS y CPU sugiere que puede ejecutarse sin GPU dedicada, aunque el rendimiento no se especifica.
- Opciones de despliegue: libreria `libreyolo` (Python) y su CLI `libreyolo generate`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a esta tarea).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de image-to-3D que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Restricciones de uso: los checkpoints de difusion derivan de Stable Diffusion 2.1 y estan sujetos a la licencia CreativeML OpenRAIL++-M, cuyo parrafo 5 y Anexo A prohiben ciertos usos (contenido ilegal, dano a menores, difamacion, acoso, discriminacion y consejo medico, entre otros). Estas restricciones deben transmitirse a cualquier tercero al que se distribuya el modelo.
- La licencia del mirror es una interpretacion de LibreYOLO de los terminos upstream, no una declaracion de los autores originales de CRM.
- Riesgo de artefactos y alucinacion geometrica: al ser un modelo generativo de difusion, las vistas sintetizadas pueden no corresponder fielmente al objeto real, produciendo geometria o texturas inexistentes.
- Limitado a objetos individuales: el pipeline esta disenado para una imagen de un objeto, no para escenas complejas.
- No es un modelo linguistico: no soporta texto, codigo, tool calling ni razonamiento; cualquier expectativa en ese sentido es inaplicable.
- Sin datos publicos de benchmarks, latencia ni VRAM: la evaluacion de idoneidad en produccion requiere pruebas propias.
- Repositorio sin descargas ni likes registrados en el momento de la consulta, lo que limita la validacion por parte de la comunidad.
- La generacion de textura UV requiere una dependencia adicional (`xatlas`); sin ella solo se obtienen colores por vertice.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreCRM
- Repositorio upstream en Hugging Face: https://huggingface.co/Zhengyi/CRM
- Codigo original: https://github.com/thu-ml/CRM
- Paper: https://arxiv.org/abs/2403.05034
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Documentacion de modelos LibreYOLO: https://www.libreyolo.com/docs/models
