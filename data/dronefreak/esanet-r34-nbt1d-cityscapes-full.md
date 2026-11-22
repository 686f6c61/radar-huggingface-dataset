# dronefreak/esanet-r34-nbt1d-cityscapes-full

## Resumen

ESANet (ResNet34-NBt1D) es una red neuronal convolucional para segmentacion semantica RGB-D, es decir, etiqueta cada pixel de una imagen combinando informacion de color (RGB) y profundidad (D). La arquitectura fue desarrollada por el grupo de Neuroinformatica y Robotica Cognitiva de la TU Ilmenau (Daniel Seichter y colaboradores) y presentada en el paper "Efficient RGB-D Semantic Segmentation for Indoor Scene Analysis" (ICRA 2021). Este repositorio concreto es un espejo no oficial de los pesos originales publicados por los autores, que anadian una copia en formato safetensors y un `config.json` sin modificar los pesos.

El modelo emplea dos codificadores ResNet34-NBt1D independientes (uno para RGB y otro para profundidad) con un modulo de fusion basado en atencion, y una cabeza de decodificacion que produce el mapa de segmentacion. Con aproximadamente 47 millones de parametros, esta pensado para eficiencia computacional en robotica movil y analisis de escenas interiores, aunque estos pesos concretos estan entrenados sobre el dataset de conduccion urbana Cityscapes con 19 clases.

Su relevancia actual reside en que ofrece un punto de partida ligero y bien documentado para tareas de segmentacion RGB-D, con licencia Apache-2.0 y pesos verificables en formato safetensors. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse un espejo de preservacion mas que una distribucion ampliamente adoptada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESANet: dos codificadores ResNet34-NBt1D (RGB y profundidad) con fusion por atencion y decodificador |
| Parametros totales | 46.962.760 (~47,0 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vision, sin contexto de texto) |
| Tipos de cuantizacion | No disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y PyTorch (`r34_NBt1D_full.pth`) |

## Arquitectura y entrenamiento

ESANet es una red totalmente convolucional con una topologia de dos ramas. Cada rama usa un codificador ResNet34 con normalizacion por lotes y activacion t1D (NBt1D), una variante que sustituye las activaciones convencionales por una funcion de activacion 1D mas eficiente. Las caracteristicas de ambas ramas se combinan mediante un modulo de fusion basado en atencion (attention-based fusion) en varios niveles de resolucion, y un decodificador ligero reconstruye el mapa de segmentacion a resolucion completa. El paper original esta orientado a escenas interiores, pero estos pesos estan entrenados sobre Cityscapes, un dataset de escenas urbanas de conduccion.

El entrenamiento parte de codificadores preentrenados en ImageNet (incluidos en el repositorio como `pretrained/imagenet_r34_NBt1D.pth`). El modelo se entrena sobre Cityscapes con 19 clases semanticas y se evalua a resolucion completa de 2048x1024. No se documentan en la informacion disponible detalles sobre el numero exacto de tokens o imagenes de entrenamiento, la composicion del dataset mas alla de Cityscapes, ni el uso de RLHF o DPO (tecnicas no aplicables a este tipo de modelo). La innovacion tecnica destacable es la fusion RGB-D por atencion con un coste computacional contenido, disenada para cumplir requisitos de tiempo real en plataformas roboticas.

## Capacidades

- Segmentacion semantica densa de imagenes RGB-D: asigna una de 19 clases a cada pixel.
- Fusion multimodal RGB + profundidad mediante atencion, lo que mejora la delimitacion de objetos frente a modelos solo RGB.
- Segmentacion a resolucion completa (2048x1024), adecuada para imagenes de alta resolucion.
- Inferencia eficiente: disenada para escenarios de robotica con requisitos de latencia ajustados.
- Clases de Cityscapes: carretera, acera, edificio, muro, valla, poste, semaforo, senal de trafico, vegetacion, terreno, cielo, persona, ciclista, coche, camion, autobus, tren, motocicleta y bicicleta.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de vision.
- Capacidades multilingues: no aplica.
- Modos especiales (thinking, vision, audio): solo vision (segmentacion).

## Casos de uso

- Segmentacion de escenas urbanas para conduccion autonoma: el modelo etiqueta carretera, peatones, vehiculos y senalizacion pixel a pixel, aprovechando la rama de profundidad para separar objetos con colores similares. Es adecuado por su resolucion completa y su coste contenido.
- Robotica movil en interiores con adaptacion: aunque entrenado en Cityscapes, la arquitectura original esta pensada para escenas interiores; puede servir como inicializacion para fine-tuning con datos propios de robot (oficinas, almacenes) usando el codificador preentrenado incluido.
- Percepcion en vehiculos de bajo consumo: con ~47 M de parametros y pesos en safetensors, puede desplegarse en GPUs de gama media o en plataformas embebidas con CUDA, integrándose en pipelines de percepcion en tiempo real.
- Analisis de imagenes RGB-D de sensores tipo Kinect o RealSense: la fusion por atencion permite explotar el canal de profundidad en aplicaciones de captura 3D, reconstruccion o inventario.
- Etiquetado automatico y preanotacion de datasets: generar mascaras semanticas iniciales para acelerar el etiquetado humano en proyectos de vision por computador.
- Investigacion y reproduccion de resultados: el repositorio incluye el checkpoint original y el script de evaluacion oficial, lo que facilita reproducir el mIoU reportado y comparar variantes de fusion o codificadores.
- Control de calidad en imagenes de satelite o dron con dominio similar: tras fine-tuning, la misma topologia puede adaptarse a segmentacion de escenas aereas con canales de profundidad o elevacion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los reportados por los autores para este checkpoint:

| Metrica | Valor |
|---|---|
| mIoU (Cityscapes val, resolucion completa 2048x1024) | 80,09 |

No se han publicado en la informacion disponible resultados adicionales (por ejemplo, latencia, FPS, comparativas con otros modelos) ni desgloses por clase. El README oficial del repositorio de GitHub remite a tablas completas de resultados y velocidades de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~47 M de parametros en FP32, los pesos ocupan aproximadamente 188 MB; el pico de memoria depende de la resolucion de entrada y del tamano de lote.
- GPU recomendadas: no se especifican en la informacion disponible. Por el tamano del modelo, es plausible su ejecucion en GPUs consumer, aunque no hay datos oficiales que lo confirmen.
- Cabe en GPU consumer: no confirmado oficialmente; el reducido numero de parametros sugiere que si, pero no se aportan medidas.
- Opciones de despliegue: el codigo oficial de TUI-NICR/ESANet (PyTorch) es la via documentada; tambien puede cargarse el `state_dict` con `safetensors.torch.load_file`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos alternativos (por ejemplo, otras redes de segmentacion RGB-D como SA-Gate, CMX o variantes de DeepLab) que permitan una comparacion rigurosa con cifras. La siguiente tabla recoge solo los datos verificables de este modelo frente a alternativas conocidas por categoria, marcando como no disponible lo que no se puede confirmar:

| Modelo | Parametros | Contexto/entrada | mIoU Cityscapes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESANet R34-NBt1D (este repo) | ~47,0 M | Imagen RGB-D 2048x1024 | 80,09 (val) | Apache-2.0 | Hugging Face (espejo) y GitHub oficial |
| SA-Gate | No disponible | RGB-D | No disponible | No disponible | No disponible |
| CMX (RGB-D) | No disponible | RGB-D | No disponible | No disponible | No disponible |

No se han podido verificar cifras de los modelos alternativos en la informacion disponible; se recomienda consultar el README oficial de ESANet para las tablas comparativas publicadas por los autores.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos son identicos a los originales, pero la distribucion no la mantiene el equipo autor; pueden aparecer desactualizaciones o retiradas.
- Entrenado exclusivamente en Cityscapes (escenas urbanas de conduccion), a pesar de que el paper original apunta a escenas interiores; el rendimiento en interiores sin fine-tuning sera probablemente deficiente.
- Requiere entrada RGB-D: sin canal de profundidad, la rama de profundidad no aporta y el modelo pierde parte de su ventaja; no es un modelo RGB puro.
- 19 clases fijas: no generaliza a categorias fuera del conjunto de Cityscapes sin reentrenamiento.
- Riesgo de confusion en clases poco representadas o condiciones de iluminacion adversas; no se documentan analisis de sesgo especificos.
- No procesa texto ni idiomas; cualquier expectativa de capacidades linguisticas es inaplicable.
- Licencia Apache-2.0 permite uso comercial, pero se debe citar el paper original segun solicitud de los autores y respetar la atribucion.
- No hay datos publicados de latencia, cuantizacion ni despliegue en produccion; cualquier estimacion de rendimiento en hardware concreto debe medirse empiricamente.
- El repositorio presenta 0 descargas y 0 likes, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dronefreak/esanet-r34-nbt1d-cityscapes-full
- Codigo oficial: https://github.com/TUI-NICR/ESANet
- Paper (arXiv): https://arxiv.org/abs/2011.06961
- Resultados y pesos oficiales: https://github.com/TUI-NICR/ESANet#results--weights
- Dataset Cityscapes: https://www.cityscapes-dataset.com/
