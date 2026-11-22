# dronefreak/esanet-r34-nbt1d-sunrgbd-scenenet

## Resumen

ESANet (ResNet34-NBt1D) es un modelo de segmentación semántica RGB-D disenado especificamente para la comprension de escenas de interior. Lo desarrolla el grupo de Neuroinformatica y Robotica Cognitiva de la TU Ilmenau (Daniel Seichter et al.) y se presento en el paper "Efficient RGB-D Semantic Segmentation for Indoor Scene Analysis" en ICRA 2021. El modelo resuelve la tarea de asignar una clase semantica a cada pixel de una imagen combinando informacion de color (RGB) y de profundidad (D), lo que resulta clave en robotica movil, navegacion autonoma y analisis de escenas indoor.

Arquitectonicamente es una red encoder-decoder de dos ramas: dos encoders ResNet34-NBt1D (uno para RGB y otro para profundidad) con fusion basada en atencion. Cuenta con 47.000.056 parametros totales y esta entrenado sobre SUN RGB-D con 37 clases semanticas, partiendo de un preentrenamiento en ImageNet y posteriormente en SceneNet RGB-D. Su relevancia actual radica en que sigue siendo una referencia eficiente para segmentacion RGB-D en entornos con recursos limitados, y esta ficha documenta un mirror no oficial en Hugging Face que facilita su acceso con pesos en formato safetensors.

Este repositorio concreto (`dronefreak/esanet-r34-nbt1d-sunrgbd-scenenet`) es un espejo comunitario no oficial de los pesos publicados por la TU Ilmenau, originalmente alojados en Google Drive. Los pesos son identicos a los originales; el mirror anade una copia en `model.safetensors` y un `config.json` con metadatos de arquitectura, dataset y procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESANet: dos encoders ResNet34-NBt1D (RGB y profundidad) con fusion basada en atencion |
| Parametros totales | 47.000.056 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (checkpoint original), `.safetensors` (copia bit-exacta del state_dict) |

## Arquitectura y entrenamiento

ESANet es una red neuronal convolucional encoder-decoder para segmentacion semantica densa. Emplea dos encoders ResNet34-NBt1D independientes, uno que procesa la imagen RGB y otro que procesa el mapa de profundidad, y combina sus caracteristicas mediante un modulo de fusion basado en atencion. La variante documentada aqui corresponde al checkpoint preentrenado en SceneNet RGB-D y ajustado en SUN RGB-D. El preentrenamiento sigue la secuencia ImageNet, despues SceneNet RGB-D y finalmente el ajuste fino en SUN RGB-D.

El modelo esta entrenado sobre SUN RGB-D, un dataset de escenas de interior con anotaciones densas de 37 clases semanticas. La informacion disponible no detalla el numero exacto de tokens o imagenes de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un modelo de vision de este tipo). El paper original reporta un mIoU de 48,04 en el conjunto de test de SUN RGB-D. La innovacion tecnica principal es la eficiencia computacional: el diseno busca un equilibrio entre precision y velocidad de inferencia para su uso en robotica.

## Capacidades

- Segmentacion semantica densa de imagenes RGB-D en 37 clases de escenas de interior.
- Fusion multimodal RGB + profundidad mediante atencion para mejorar la delimitacion de objetos y superficies.
- Comprension de escenas de interior orientada a robotica (suelo, paredes, muebles, objetos).
- Inferencia eficiente apta para sistemas con recursos computacionales limitados.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision generativa, audio ni otras capacidades generativas.

## Casos de uso

- Navegacion de robots moviles en interiores: el modelo segmenta el suelo, paredes y obstaculos a partir de RGB-D para que un robot planifique rutas seguras, aprovechando la fusion de profundidad para distinguir superficies transitables.
- Analisis de escenas indoor en tiempo real: integrado en pipelines de percepcion, clasifica cada pixel en 37 clases para tareas de inventario o monitorizacion de espacios.
- Asistencia a personas con discapacidad visual: la segmentacion densa permite identificar objetos y obstaculos en el entorno y generar avisos, gracias a su eficiencia para ejecucion en hardware embebido.
- Robotica de servicio y manipulacion: la comprension de la escena facilita la localizacion de objetos sobre superficies (mesas, estanterias) combinando color y profundidad.
- Automatizacion de la limpieza robotica: distingue tipos de superficie y obstaculos para adaptar el comportamiento de aspiradoras o robots de limpieza.
- Investigacion en percepcion RGB-D: sirve como baseline reproducible para comparar nuevas arquitecturas de segmentacion semantica en SUN RGB-D, con pesos accesibles en formato safetensors.
- Prototipado en vision por computador: al ser un modelo compacto de 47M de parametros, es adecuado para experimentacion en entornos con GPU de gama media.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| mIoU | 48,04 | SUN RGB-D test |

Dato reportado por los autores del paper original. No se han publicado en la informacion disponible resultados adicionales de benchmarks ni comparativas numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 47M de parametros el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; modelos como RTX 3060, RTX 4090, A100 o H100 son mas que suficientes. Tambien es viable en hardware embebido tipo Jetson.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo.
- Opciones de despliegue: el codigo oficial de TUI-NICR/ESANet (PyTorch); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada; el paper original referencia tablas de velocidad de inferencia en su README oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | mIoU SUN RGB-D | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESANet (ResNet34-NBt1D) | 47,0M | Segmentacion RGB-D | 48,04 | Apache-2.0 | Mirror HF + repo oficial |
| Alternativas (p. ej. otras redes RGB-D del paper) | no disponible | Segmentacion RGB-D | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos numericos de modelos comparables para completar una comparativa rigurosa. Se recomienda consultar las tablas del README oficial del repositorio TUI-NICR/ESANet.

## Limitaciones y advertencias

- Es un mirror no oficial: los pesos son identicos a los originales, pero el mantenimiento y soporte dependen del autor del mirror, no de la TU Ilmenau.
- El modelo esta especializado en escenas de interior (SUN RGB-D); su rendimiento en exteriores u otros dominios no esta garantizado.
- Requiere entrada RGB-D: necesita mapa de profundidad ademas de la imagen de color, lo que limita su uso a sensores compatibles.
- Las 37 clases estan fijadas por el dataset de entrenamiento; no detecta clases fuera de ese conjunto.
- Riesgo de errores de segmentacion en condiciones de iluminacion adversas, oclusiones o profundidad ruidosa.
- No es un modelo generativo ni de lenguaje: no debe usarse para tareas de texto, razonamiento o agentes.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda citar el paper original segun pide el autor.
- No se documentan sesgos especificos ni evaluaciones de robustez mas alla del benchmark de SUN RGB-D.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dronefreak/esanet-r34-nbt1d-sunrgbd-scenenet
- Paper (arXiv): https://arxiv.org/abs/2011.06961
- Codigo oficial: https://github.com/TUI-NICR/ESANet
- Resultados y pesos oficiales: https://github.com/TUI-NICR/ESANet#results--weights
- Dataset SUN RGB-D (mirror): https://huggingface.co/datasets/dronefreak/SUN-RGBD
