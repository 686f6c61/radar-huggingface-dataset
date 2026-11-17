# neavo/LaMa-Large-ONNX-FP32

## Resumen

LaMa-Large-ONNX-FP32 es una exportación a formato ONNX del modelo de reparación de imágenes (inpainting) AnimeMangaInpainting, desarrollado originalmente por dreMaz y reexportado por el usuario neavo. El modelo está especializado en la reconstrucción de regiones enmascaradas en ilustraciones de manga y anime, una tarea habitual en flujos de traducción de cómics donde es necesario eliminar el texto original antes de insertar la traducción. La exportación no implica reentrenamiento ni cuantización: se mantienen los pesos originales en FP32.

El artefacto principal es un único fichero `lama-large-fp32-unified-webgpu.onnx` de 204,5 MB que admite ejecución tanto en CPU como en WebGPU a través de ONNX Runtime, con solo dos entradas (`image` y `mask`). La exportación se ha optimizado para mejorar la velocidad de carga y la inferencia en CPU, reescribiendo los cálculos de Fourier y las operaciones repetidas de formas. El repositorio ocupa 0,2 GB y se distribuye bajo licencia MIT.

Por su naturaleza, no es un modelo de lenguaje: no genera texto, no razona y no procesa instrucciones. Es un modelo de visión puro para una tarea concreta, lo que condiciona por completo su evaluación, sus casos de uso y sus requisitos de hardware, que se detallan a continuación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de inpainting basada en LaMa (Large Mask Inpainting), con operaciones en el dominio de la frecuencia (FFT) y pesos originales de AnimeMangaInpainting |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada espacial dinámica validada entre 64 y 1024 píxeles por lado) |
| Tipos de cuantizacion | no disponible (esta exportación es FP32 sin cuantizar) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (fichero único `lama-large-fp32-unified-webgpu.onnx`, 204,5 MB) |

## Arquitectura y entrenamiento

El modelo subyacente es AnimeMangaInpainting de dreMaz, una adaptación de la familia LaMa orientada a ilustraciones de manga y anime. LaMa emplea una arquitectura de red convolucional con agregación de contexto amplio mediante operaciones en el dominio de la frecuencia (transformadas de Fourier), lo que le permite propagar información desde regiones lejanas de la imagen hacia el hueco a rellenar sin depender de un campo receptivo puramente convolucional. Esta exportación concreta reescribe esos cálculos de Fourier y las operaciones repetidas de manipulación de formas para acelerar la carga y la inferencia en CPU.

No se ha reentrenado ni cuantizado el modelo: los pesos son los originales de AnimeMangaInpainting en FP32. La model card no proporciona detalles sobre el conjunto de datos de entrenamiento, el número de tokens o imágenes vistas, ni sobre si hubo ajuste fino con preferencias humanas (RLHF/DPO), algo que tampoco aplica a un modelo de inpainting. La innovación de esta ficha es puramente de ingeniería de despliegue: un único grafo ONNX que funciona en CPU y WebGPU, con entrada de tamaño dinámico y validación frente a la implementación original en PyTorch (error máximo por canal de aproximadamente 0,0342/255 en 30 escenarios comparados).

## Capacidades

- Reparación de imágenes (inpainting) en ilustraciones de manga y anime: reconstruye las regiones indicadas por una máscara binaria.
- Entrada de imagen RGB en float32 con rango 0-1 y forma `[1,3,H,W]`.
- Entrada de máscara binaria en float32 con forma `[1,1,H,W]`, donde 1 indica la zona a reparar.
- Salida `inpainted` en float32 con forma `[1,3,H,W]`; el flujo recomendado es rellenar hasta múltiplos de 64, inferir, recortar al tamaño original y componer solo los píxeles enmascarados.
- Tamaños dinámicos validados entre 64 y 1024 píxeles, incluyendo rectángulos horizontales y verticales.
- Ejecución en CPU y en WebGPU mediante ONNX Runtime, con fallback a CPU para cálculos auxiliares de coeficientes y formas en modo WebGPU.
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, visión general más allá del inpainting, ni capacidades de audio.

## Casos de uso

- Limpieza de bocadillos en traducción de manga: se detecta el texto del globo, se genera una máscara y el modelo rellena la zona con el fondo original, dejando el espacio listo para insertar la traducción. Es el caso de uso principal y para el que fue entrenado el modelo base.
- Integración en herramientas de traducción de cómics de escritorio: proyectos como BallonsTranslator ya usan este tipo de modelos; la exportación ONNX permite incorporarlo a aplicaciones Electron o Node.js sin depender de PyTorch.
- Edición interactiva en navegador: gracias al soporte WebGPU, se puede ofrecer una herramienta de borrado y relleno en el cliente, sin enviar la imagen a un servidor, útil para privacidad y para reducir costes de infraestructura.
- Eliminación de marcas de agua o anotaciones sobre ilustraciones propias: el modelo reconstruye la zona enmascarada de forma coherente con el estilo de dibujo, siempre que se tenga derecho a modificar la imagen.
- Preprocesado en pipelines de restauración de escaneos: limpiar motas, sellos o artefactos localizados en páginas escaneadas antes de un OCR o de un proceso de vectorización.
- Prototipado rápido en investigación de inpainting: al ser un grafo ONNX único y ligero (204,5 MB), sirve como referencia reproducible para comparar resultados frente a otros métodos sin montar un entorno de entrenamiento completo.
- Automatización por lotes en servidor con CPU: la optimización de carga y la ejecución en CPU permiten procesar lotes de páginas en máquinas sin GPU dedicada, con un coste operativo bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una validación de fidelidad numérica frente a la implementación original en PyTorch: error máximo por canal de aproximadamente 0,0342/255 en 30 escenarios comparados en CPU y WebGPU. No se ofrecen métricas de calidad de inpainting (PSNR, SSIM, FID) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el fichero ONNX ocupa 204,5 MB y los pesos están en FP32, por lo que la memoria necesaria para los pesos ronda los 200 MB, a lo que hay que sumar activaciones que crecen con la resolución de entrada (validado hasta 1024x1024).
- GPU recomendadas: cualquier GPU compatible con WebGPU para el modo acelerado; no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- Cabe en GPU de consumo: sí, por el reducido tamaño de los pesos; el factor limitante es la resolución y la memoria para activaciones, no el tamaño del modelo.
- Opciones de despliegue: ONNX Runtime, en concreto `onnxruntime-node 1.31.1` según la recomendación del autor; ejecución en CPU o en WebGPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card solo indica que la exportación prioriza mejorar la velocidad de carga y la inferencia en CPU, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LaMa-Large-ONNX-FP32 (esta ficha) | Inpainting LaMa exportado a ONNX | no disponible | Imagen dinámica 64-1024 px | MIT | Hugging Face, ONNX Runtime |
| dreMaz/AnimeMangaInpainting | Inpainting LaMa original en PyTorch | no disponible | no disponible | MIT (según la model card citada) | Hugging Face |
| BallonsTranslator (implementación de referencia) | Herramienta de traducción de cómics que integra inpainting | no aplica | no aplica | no disponible en la información proporcionada | GitHub |

No se dispone de datos de otros modelos de inpainting comparables (por ejemplo, variantes de Stable Diffusion Inpainting) en la información proporcionada, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Modelo de visión especializado: no procesa texto ni instrucciones; cualquier expectativa de uso como modelo de lenguaje es incorrecta.
- Dominio restringido: entrenado para manga y anime; su comportamiento en fotografías o ilustraciones realistas no está documentado y probablemente sea inferior.
- Riesgo de artefactos: como todo modelo de inpainting, puede generar texturas incoherentes en huecos grandes o en zonas con estructuras complejas (líneas de dibujo, tramas).
- Reproducibilidad: el autor advierte que no se garantiza que los resultados sean idénticos bit a bit en hardware distinto; la validación reportada es aproximada.
- Requisito de preprocesado: es necesario rellenar la imagen a múltiplos de 64 y componer manualmente solo los píxeles enmascarados; un uso incorrecto produce bordes visibles.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento originales, no detallada en la información disponible.
- Sin métricas de calidad publicadas: no hay benchmarks que permitan estimar su rendimiento frente a alternativas; la evaluación debe hacerse empíricamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/neavo/LaMa-Large-ONNX-FP32
- Modelo base: https://huggingface.co/dreMaz/AnimeMangaInpainting
- Implementación de referencia: https://github.com/dmMaze/BallonsTranslator
