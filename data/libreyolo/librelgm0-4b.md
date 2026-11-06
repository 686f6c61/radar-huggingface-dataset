# LibreYOLO/LibreLGM0.4b

## Resumen

LibreLGM0.4b es un empaquetado del modelo LGM (Large Multi-View Gaussian Model), presentado en el paper "LGM: Large Multi-View Gaussian Model for High-Resolution 3D Content Creation" (ECCV 2024) por Jiaxiang Tang y colaboradores. El modelo resuelve la tarea de reconstrucción 3D a partir de imágenes: recibe cuatro vistas de un objeto y devuelve una representación de Gaussian splats en 3D. El repositorio lo publica LibreYOLO como espejo del checkpoint original, sin reentrenar ni convertir los pesos.

La relevancia de este empaquetado está en la integración con el ecosistema LibreYOLO: la librería genera las cuatro vistas a partir de una sola imagen mediante ImageDream (LibreYOLO/LibreImageDream) y después aplica LGM para obtener el modelo 3D. Todo el pipeline se ejecuta en PyTorch puro, sin xformers ni rasterizador, lo que permite inferencia en GPUs NVIDIA, Apple Silicon (MPS) y CPU.

El checkpoint es `model_fp16_fixrot.safetensors`, byte a byte idéntico al upstream de ashawkey/LGM, en la configuración `big` (0,42B parámetros) y en fp16. La licencia es MIT, lo que facilita su uso comercial, aunque la etapa de generación multivista (ImageDream) se distribuye por separado bajo licencia OpenRAIL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LGM (Large Multi-View Gaussian Model), transformer para predicción de Gaussian splats a partir de vistas múltiples |
| Parametros totales | 0,42B (configuración `big` del upstream) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: entrada de 4 vistas de imagen) |
| Tipos de cuantizacion | fp16 (checkpoint publicado); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de imagen a 3D, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model_fp16_fixrot.safetensors`); incluye `birefnet.safetensors` (BiRefNet Swin-L para eliminación de fondo, MIT) |

## Arquitectura y entrenamiento

LGM es un modelo de imagen a 3D que toma cuatro vistas de un objeto y predice un conjunto de Gaussian splats tridimensionales de alta resolución. La arquitectura se basa en un backbone transformer asimétrico que procesa las vistas de entrada y genera los parámetros de las gaussianas (posición, escala, rotación, opacidad y color). El checkpoint empaquetado corresponde a la configuración `big` del repositorio original, con 0,42B parámetros, y es la versión que el upstream ajustó tras la corrección de normalización de rotación (abril de 2024), en fp16.

No se ha reentrenado, convertido ni recodificado ningún peso: el archivo es byte a byte idéntico al de ashawkey/LGM en la revisión `bc0097d24ffc5efc2e6a216edd579128f85f53ab`. El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, por lo que esos datos no están disponibles en la información proporcionada. La innovación destacable del empaquetado es la ejecución en PyTorch puro sin xformers ni rasterizador, lo que amplía la compatibilidad de hardware.

## Capacidades

- Reconstrucción 3D a partir de cuatro vistas de un objeto, devolviendo Gaussian splats exportables a formato PLY.
- Pipeline completo de imagen única a 3D cuando se combina con ImageDream para generar las cuatro vistas.
- Eliminación de fondo de la imagen de entrada mediante BiRefNet (Swin-L), incluido en el repositorio.
- Ejecución en NVIDIA GPUs, Apple Silicon (MPS) y CPU sin dependencias de xformers ni rasterizador.
- Interfaz programática mediante `libreyolo.LibreGen` y línea de comandos (`libreyolo generate source=... model=lgm`).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual-3D.

## Casos de uso

- Prototipado rápido de assets 3D: a partir de una fotografía de un objeto se genera un modelo en Gaussian splats para previsualización en motores de render o visores web, gracias al pipeline imagen única a 3D.
- Catalogación de producto en e-commerce: convertir fotos de catálogo en representaciones 3D navegables para fichas de producto, usando la eliminación de fondo integrada para aislar el objeto.
- Escaneo 3D de bajo coste en investigación: reconstruir objetos físicos con cuatro vistas capturadas manualmente y comparar la calidad de las Gaussian splats con métodos NeRF.
- Generación de contenido para realidad aumentada: producir splats 3D ligeros que se puedan insertar en escenas AR sin necesidad de mallas densas.
- Docencia y divulgación en visión por computador: demostrar el pipeline completo (ImageDream + LGM) en un portátil con Apple Silicon o incluso en CPU, al no requerir xformers.
- Automatización de pipelines creativos: integrar la CLI `libreyolo generate` en scripts por lotes que procesen imágenes y guarden archivos `.ply` para su uso posterior en herramientas de modelado.
- Investigación en reconstrucción multivista: usar el checkpoint fp16 como referencia reproducible (SHA-256 en `NOTICE`) para comparar variantes de LGM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 0,42B parámetros en fp16 el checkpoint ocupa aproximadamente 0,84 GB, más el coste del backbone de ImageDream y BiRefNet en el pipeline completo.
- GPU recomendadas: no se especifican modelos concretos; el autor indica compatibilidad con NVIDIA GPUs, Apple Silicon (MPS) y CPU.
- Cabe en GPU de consumo: sí, según la afirmación del autor de que el pipeline funciona en PyTorch puro sin xformers ni rasterizador, aunque no se detallan modelos concretos.
- Opciones de despliegue: librería `libreyolo` (API `LibreGen` y CLI `libreyolo generate`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreLGM0.4b | 0,42B | 4 vistas de imagen | Gaussian splats | MIT | Hugging Face (espejo de ashawkey/LGM) |
| LGM (upstream, ashawkey/LGM) | 0,42B (config. `big`) | 4 vistas de imagen | Gaussian splats | MIT | Hugging Face |
| ImageDream (LibreYOLO/LibreImageDream) | no disponible | 1 imagen | 4 vistas | OpenRAIL | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de LibreLGM0.4b con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo es un espejo: no incorpora mejoras ni correcciones propias respecto al upstream; cualquier limitación del LGM original se hereda.
- Requiere cuatro vistas de entrada; la calidad del resultado depende de la etapa de generación de vistas (ImageDream), que se distribuye bajo licencia OpenRAIL y no MIT.
- No procesa lenguaje ni texto: no es adecuado para tareas de NLP, tool calling o agentes.
- Riesgo de artefactos y geometrías inconsistentes en objetos con oclusiones complejas o materiales especulares, inherente a los métodos de reconstrucción multivista.
- La licencia MIT aplica a los pesos de LGM; el uso comercial del pipeline completo debe revisar por separado la licencia OpenRAIL de ImageDream.
- No se documentan sesgos, idiomas soportados ni límites de contexto porque no aplican a este tipo de modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria registrada.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreLGM0.4b
- Repositorio upstream de pesos: https://huggingface.co/ashawkey/LGM
- Código upstream: https://github.com/3DTopia/LGM
- Paper: https://arxiv.org/abs/2402.05054
- ImageDream (LibreYOLO): https://huggingface.co/LibreYOLO/LibreImageDream
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Model Zoo de LibreYOLO: https://www.libreyolo.com/models
