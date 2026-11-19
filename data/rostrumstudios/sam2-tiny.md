# rostrumstudios/sam2-tiny

## Resumen

SAM 2.1 Hiera Tiny es la variante compacta del modelo Segment Anything 2.1 de Meta FAIR, un sistema de segmentación de imágenes y vídeo guiado por prompts (puntos, cajas o máscaras). Este repositorio concreto, publicado por rostrumstudios, no contiene los pesos originales en PyTorch, sino una exportación ONNX sin modificar del encoder y el decoder de imagen, generada por el proyecto Voxide con PyTorch 2.9.0 y opset 18. El objetivo es ofrecer un artefacto de inferencia portable y verificable, con ficheros fijados por commit y comprobación SHA-256.

El modelo resuelve el problema de la segmentación interactiva: dado un clic o una caja sobre un objeto, devuelve una máscara precisa que puede convertirse en una forma editable. Por su tamaño (encoder de ~109 MB y decoder de ~16,5 MB), está pensado para ejecutarse en entornos de escritorio y aplicaciones de edición, no para despliegues masivos en servidor. La licencia Apache-2.0 facilita su integración comercial.

Es relevante ahora porque la familia SAM 2 introdujo propagación de máscaras en vídeo y un modelo de memoria que mantiene la coherencia temporal, y esta exportación ONNX elimina la dependencia de PyTorch en producción. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su uso previsto declarado es el análisis (roto asistido) dentro de las aplicaciones de Rostrum, nunca la generación de píxeles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2 (Hiera Tiny): encoder de imagen jerárquico Hiera + decoder de prompts con mecanismo de memoria (para vídeo en el modelo original) |
| Parametros totales | no disponible (el repo solo publica tamanos de fichero: encoder 109.471.930 bytes, decoder 16.520.098 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (exportación ONNX en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de segmentación visual, sin interfaz de lenguaje) |
| Licencia | Apache-2.0 (código, pesos y exportaciones) |
| Formato de pesos | ONNX (opset 18), dos ficheros: `sam2.1_hiera_tiny_encoder.onnx` y `sam2.1_hiera_tiny_decoder.onnx` |

## Arquitectura y entrenamiento

La arquitectura corresponde a SAM 2.1 con backbone Hiera Tiny. El encoder procesa la imagen y produce representaciones multiescala; el decoder recibe esas características junto con los prompts del usuario (puntos, cajas o máscaras) y genera las máscaras de segmentación. En la familia SAM 2, el decoder incorpora un módulo de memoria que permite propagar máscaras a lo largo de fotogramas de vídeo, manteniendo la identidad del objeto entre frames. Esta exportación concreta cubre el encoder y el decoder de imagen; no se documenta en la model card si incluye los componentes de memoria para vídeo.

No se proporcionan en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un modelo de segmentación). Tampoco se detallan innovaciones adicionales más allá de las propias del paper SAM 2 (arXiv:2408.00714). La exportación se realizó con PyTorch 2.9.0 y opset 18, y los ficheros se redistribuyen sin cambios respecto al repositorio de Voxide, con verificación SHA-256 por parte de la aplicación consumidora.

## Capacidades

- Segmentación de imágenes guiada por prompts: puntos positivos/negativos, cajas delimitadoras y máscaras de entrada.
- Generación de máscaras de alta calidad para objetos individuales y múltiples objetos en una misma imagen.
- Segmentación interactiva iterativa: el usuario refina la máscara añadiendo o eliminando clics.
- Base para roto asistido: la máscara resultante puede convertirse en una forma editable que sigue al sujeto.
- Propagación temporal de máscaras en vídeo (capacidad de la familia SAM 2; la cobertura exacta en esta exportación ONNX no está documentada).
- Inferencia portable sin PyTorch mediante ONNX Runtime.
- No incluye generación de texto, código, matemáticas, visión descriptiva, tool calling ni razonamiento multi-paso; es exclusivamente un modelo de segmentación.
- Sin capacidades multilingües ni de audio.

## Casos de uso

- Rotoscopia asistida en edición de vídeo: el usuario hace clic sobre un sujeto y el modelo devuelve una máscara que se convierte en forma editable; el tamaño Tiny permite ejecutarlo en el equipo del editor sin GPU de datacenter.
- Recorte y extracción de objetos en herramientas de diseño gráfico: selección precisa de productos, personas o elementos de fondo para composición, con refinamiento iterativo por clics.
- Preetiquetado en pipelines de anotación: generación automática de máscaras candidatas que un anotador humano corrige, reduciendo el coste por imagen en datasets de segmentación.
- Segmentación en aplicaciones de escritorio o móviles: al ser ONNX y ocupar ~126 MB en total, puede empaquetarse en apps nativas con ONNX Runtime sin arrastrar el stack de PyTorch.
- Análisis de contenido en herramientas de moderación o inspección: detección y aislamiento de regiones concretas de una imagen para su revisión posterior, sin generar contenido nuevo.
- Automatización de flujos de postproducción: integración en scripts que aplican máscaras predefinidas a lotes de imágenes o fotogramas, con verificación de integridad de los ficheros por SHA-256 antes de la ejecución.
- Prototipado rápido de funciones de selección inteligente: validar la experiencia de usuario de un editor antes de invertir en modelos de mayor tamaño o en infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamaño de los ficheros (~126 MB en total) la huella de pesos es reducida y cabe holgadamente en GPUs de consumo, aunque el consumo real depende de la resolución de entrada y del runtime.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (CUDA o DirectML); para el tamaño Tiny no se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna de consumo; también es viable la ejecución en CPU para imágenes individuales.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, CoreML, TensorRT), integración en aplicaciones nativas; no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rostrumstudios/sam2-tiny (esta ficha) | encoder 109,5 MB + decoder 16,5 MB (ONNX) | no aplica | Segmentación imagen/vídeo | Apache-2.0 | Hugging Face (ONNX) |
| facebook/sam2.1-hiera-tiny | no disponible | no aplica | Segmentación imagen/vídeo | Apache-2.0 | Hugging Face (PyTorch) |
| facebook/sam2.1-hiera-small | no disponible | no aplica | Segmentación imagen/vídeo | Apache-2.0 | Hugging Face (PyTorch) |
| facebook/sam2.1-hiera-base-plus | no disponible | no aplica | Segmentación imagen/vídeo | Apache-2.0 | Hugging Face (PyTorch) |

La comparación directa con las variantes Small y Base Plus de SAM 2.1 no puede hacerse con cifras de rendimiento porque no se han publicado benchmarks en la información disponible; la diferencia principal documentada es el tamaño del backbone (Tiny, Small, Base Plus) y, en este repositorio, el formato ONNX frente a los pesos PyTorch originales.

## Limitaciones y advertencias

- Es un modelo de segmentación, no de generación: no produce texto, imagen ni audio; cualquier uso fuera de la segmentación visual queda fuera de su alcance.
- La model card indica que Rostrum lo usa para análisis únicamente; no se documentan garantías de calidad fuera de ese contexto.
- No se publican métricas de precisión, IoU ni latencia, por lo que el rendimiento real debe validarse en el caso de uso concreto.
- La cobertura de la propagación de máscaras en vídeo dentro de esta exportación ONNX no está documentada; el repositorio describe encoder y decoder de imagen.
- Riesgo de máscaras imprecisas en objetos con bordes ambiguos, oclusiones fuertes, movimiento rápido o baja resolución; se recomienda refinamiento interactivo.
- Sesgos: no se documentan evaluaciones de sesgo; como modelo entrenado con datos de imagen a gran escala, puede heredar sesgos de representación del dataset original.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y la atribución a los autores originales (Meta FAIR) y al exportador (Voxide).
- Los ficheros se distribuyen sin modificar y con SHA-256 publicado; conviene verificar la integridad antes de usarlos en producción.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de adopción ni de mantenimiento continuado más allá del commit fijado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rostrumstudios/sam2-tiny
- Modelo base original: https://huggingface.co/facebook/sam2.1-hiera-tiny
- Repositorio de exportaciones ONNX (Voxide): https://huggingface.co/voxide/voxide-models
- Código original de Meta: https://github.com/facebookresearch/sam2
- Paper SAM 2: https://arxiv.org/abs/2408.00714
- Organización Rostrum: https://huggingface.co/rostrumstudios
