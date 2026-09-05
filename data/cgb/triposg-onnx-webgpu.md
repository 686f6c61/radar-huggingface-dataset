# cgb/triposg-onnx-webgpu

## Resumen

`cgb/triposg-onnx-webgpu` es una conversión comprimida del modelo TripoSG original de VAST-AI-Research, optimizada para ejecutarse íntegramente en el navegador mediante WebGPU. TripoSG es un modelo de generación de mallas 3D a partir de una única imagen de entrada, basado en un transformer de difusión con flujo rectificado (rectified flow) sobre un autoencoder VAE de campos de distancia con signo (SDF). Desarrollado por el autor `cgb`, este repositorio reduce el peso original de 7.8 GB a 3.5 GB, manteniendo una fidelidad geométrica alta según las comprobaciones publicadas.

El modelo resuelve el problema de generar geometría 3D de alta calidad directamente en el cliente, sin necesidad de servicios backend ni descargas de pesos grandes. Es relevante porque acerca la generación de mallas 3D a aplicaciones web interactivas, con soporte para Onnx Runtime WebGPU. La arquitectura es un diffusion transformer de aproximadamente 1.5B parámetros, con un decoder de campo SDF que se evalúa por bloques de puntos. El contexto no aplica, al no ser un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con flujo rectificado sobre un VAE de campos SDF |
| Parametros totales | 1.5B (según ficha del modelo original TripoSG) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen a 3D) |
| Tipos de cuantizacion | int8 con block 32 (gráficos de ejecución única) y float16 (transformer iterado) |
| Idiomas soportados | No disponible |
| Licencia | MIT (con componentes Apache-2.0, como el encoder DINOv2) |
| Formato de pesos | ONNX (archivos `.onnx` y `.data`) |

## Arquitectura y entrenamiento

TripoSG es un diffusion transformer de flujo rectificado que opera sobre un VAE preentrenado de campos SDF. La pipeline completa toma una imagen de entrada, la procesa para obtener embeddings de 1024 dimensiones, y utiliza un proceso iterativo de 50 pasos con classifier-free guidance para generar un campo de distancia. El campo resultante se transforma en una malla mediante marching cubes. En esta exportación concreta, el modelo se ha dividido en cuatro gráficos: el codificador de imagen y el codificador de latentes se cuantizan a int8 (block 32), mientras que el transformer principal (DiT) se mantiene en float16, ya que se ejecuta 100 veces por generación y su cuantización agresiva degradaría el resultado. El decoder de campo permanece en float32 porque es pequeño y su signo determina qué lado de la superficie es interior. No se proporciona información sobre el conjunto de datos de entrenamiento ni sobre procesos de alineación como RLHF o DPO en la documentación disponible.

## Capacidades

- Generación de mallas 3D de alta fidelidad a partir de una sola imagen de entrada.
- Ejecución completamente en el navegador con WebGPU, sin necesidad de servidores.
- Generación de geometría mediante marching cubes sobre un campo SDF.
- Soporte de classifier-free guidance con un factor de 7.0.
- Procesamiento de imágenes con composición sobre fondo blanco y recorte del sujeto.
- Compatibilidad con ejecución por bloques de puntos (hasta 8192 puntos por bloque) para el decoder de campo.

## Casos de uso

- Herramientas de diseño 3D en el navegador: el modelo permite convertir una fotografía de una pieza u objeto en un modelo tridimensional editable directamente en una aplicación web, gracias a su ejecución con WebGPU y a sus 3.5 GB de pesos.
- Visualización de productos en comercio electrónico: una tienda online puede generar modelos 3D de sus productos a partir de imágenes, permitiendo al cliente inspeccionarlos en 360 grados sin necesidad de escaneos ni renders complejos.
- Creación de activos para videojuegos: los desarrolladores pueden generar rápidamente geometría base a partir de concept art o fotografías, integrando la salida como malla en motores como Unity o Three.js tras una limpieza del campo.
- Prototipado para impresión 3D: la generación local de mallas permite validar geometrías en el navegador antes de exportarlas a formatos como STL u OBJ para fabricación aditiva.
- Aplicaciones de realidad aumentada y virtual en la web: la conversión de imágenes a 3D posibilita experiencias inmersivas sin infraestructura de backend, ideal para demos y prototipos interactivos.
- Educación y experimentación con WebGPU: al estar disponible en Hugging Face con licencia MIT, permite estudiar y modificar la pipeline de TripoSG en un entorno de ejecución moderno, sirviendo como referencia para implementaciones de diffusion transformers en el navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el repositorio pesa 3.5 GB y los gráficos se cargan en GPU, se estima un mínimo de 4 GB de VRAM para alojar los pesos y los tensores intermedios. Este valor no está confirmado oficialmente.
- GPU recomendadas: cualquier tarjeta compatible con WebGPU en Chromium (Chrome, Edge) o Firefox, incluida la mayoría de GPUs integradas modernas. Se recomienda una GPU de gama media o superior, como la RTX 3060 o equivalente, para obtener tiempos razonables.
- Compatibilidad con GPUs de consumo: sí, es viable en tarjetas de consumo con soporte WebGPU, aunque la generación completa requiere 100 pasos del DiT, lo que puede tardar varios segundos o minutos según la GPU.
- Opciones de despliegue: Onnx Runtime WebGPU mediante un servidor estático; también se puede ejecutar desde el demo de FreeGen.ai. No se conocen integraciones específicas con vLLM o llama.cpp al tratarse de un pipeline de imagen a 3D en ONNX.
- Latencia y throughput estimados: no disponibles en la documentación. El modelo ejecuta el transformer 100 veces por generación con guidance, por lo que la latencia depende fuertemente de la aceleración de WebGPU.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Licencia | Ejecución |
|---|---|---|---|---|
| cgb/triposg-onnx-webgpu | ONNX con int8 y float16 | 3.5 GB | MIT | Navegador WebGPU |
| VAST-AI/TripoSG (original) | Safetensors y pesos originales | 7.8 GB | MIT | GPU o CPU con PyTorch |
| VAST-AI/TripoSR | checkpoint estándar | No disponible | MIT | GPU o CPU con PyTorch |

- `cgb/triposg-onnx-webgpu` destaca por su tamaño reducido y su capacidad de ejecución sin servidor, a costa de una cuantización mixta.
- `VAST-AI/TripoSG` es el modelo de referencia en float32, con mayor fidelidad pero con una carga de 7.8 GB.
- `TripoSR` es un modelo más ligero de imagen a 3D, aunque no se proporcionan datos detallados de sus especificaciones en la información disponible.

## Limitaciones y advertencias

- El sujeto debe estar recortado y sobre fondo blanco. Si se le entrega una fotografía con fondo complejo, el modelo reconstruye el entorno y produce un campo de ruido.
- La actualización del scheduler está invertida respecto a la implementación estándar de diffusers: el modelo predice `x0 - noise`, no `noise - x0`, así que hay que respetar el signo del paso indicado en el contrato de inferencia.
- La rama incondicional debe ser un embedding de ceros, no una imagen negra, porque el encoder DINOv2 interpretaría una imagen negra como un embedding no nulo y rompería la guidance.
- El campo generado es "outside positive" en esta exportación, por lo que hay que negar el campo o considerar la superficie donde el campo es negativo.
- El modelo no es un modelo de lenguaje y no soporta generación de texto, tool calling ni funciones de agente.
- La generación puede producir geometría no realista o mallas con topologías extrañas, como cualquier modelo generativo de mallas.
- La licencia MIT permite uso comercial, pero no se puede usar el modelo de matting BriaRMBG del pipeline original porque es de uso no comercial; se necesita un matting alternativo con licencia permisiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cgb/triposg-onnx-webgpu
- Modelo original de TripoSG: https://huggingface.co/VAST-AI/TripoSG
- Repositorio oficial de TripoSG: https://github.com/VAST-AI-Research/TripoSG
- Demo en línea: https://freegen.ai
- Notas de exportación de TripoSG en QtMeshEditor: https://github.com/fernandotonon/QtMeshEditor
