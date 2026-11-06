# ddalcu/Idol-MLX-Serve-fp16

## Resumen

Idol-MLX-Serve-fp16 es un empaquetado del modelo Idol (speridlabs/idol) para su uso con mlx-serve, un servidor nativo para Apple Silicon escrito en Zig. El modelo resuelve la tarea de image-to-3D: a partir de una unica imagen de un objeto genera una representacion 3D en formato Gaussian splatting, con eliminacion de fondo incluida, y la expone como un GLB que cualquier visor puede renderizar. No requiere Python ni servicios en la nube.

Este repositorio concreto no introduce pesos nuevos: es una conversion y reempaquetado de los pesos originales de Idol a float16 para las capas lineales de los tres transformers que lo componen, manteniendo normas, embeddings y fases RoPE tal como se publicaron. Incluye ademas todo lo necesario para la inferencia sin descargas adicionales: el modelo de eliminacion de fondo BiRefNet, el encoder DINOv3 ViT-H+/16 en float16 y el encoder VAE de FLUX.2-klein-4B con la atencion intermedia en 8 bits.

La relevancia de esta ficha es practica: permite ejecutar generacion image-to-3D de forma local en hardware Apple Silicon (series M) con un consumo de memoria residente de 3,6 GB y un tiempo aproximado de 40 segundos para 50 pasos y 262.144 gaussianas en un chip M-series Ultra. El repositorio ocupa 3,6 GB y se distribuye bajo licencia Apache-2.0, con la salvedad de la licencia propia de DINOv3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-componente: tres transformers (encoder DINOv3 ViT-H+/16, VAE encoder de FLUX.2-klein-4B, generador Idol) con decodificacion a Gaussian splatting |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo image-to-3D, no textual) |
| Tipos de cuantizacion | float16 en capas lineales de los tres transformers; atencion intermedia del VAE en 8 bits; normas, embeddings y fases RoPE en precision original |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 (pesos Idol); DINOv3 bajo DINOv3 License de Meta |
| Formato de pesos | safetensors (libreria mlx-serve) |
| Tamano del repositorio | 3,6 GB |
| Pipeline | image-to-3d |
| Salida | GLB con malla de discos texturizados o, con `"geometry": "splat"`, puntos `KHR_gaussian_splatting` |
| Numero de gaussianas | 262.144 (configuracion de referencia) |
| Pasos de inferencia | 50 (configuracion de referencia) |

## Arquitectura y entrenamiento

El modelo es un pipeline de generacion 3D compuesto por tres bloques transformer. El primero es un encoder de imagen DINOv3 ViT-H+/16 que extrae caracteristicas visuales de la imagen de entrada. El segundo es el encoder VAE de FLUX.2-klein-4B, usado para codificar la informacion en el espacio latente del que parte el generador; su atencion intermedia se ha cuantizado a 8 bits en este empaquetado. El tercero es el generador Idol propiamente dicho, que produce la representacion 3D. Adicionalmente, el pipeline integra BiRefNet para la eliminacion automatica del fondo de la imagen antes de la reconstruccion.

La innovacion tecnica del empaquetado es la adaptacion a MLX para Apple Silicon: las capas lineales de los tres transformers se convierten a float16, mientras que normas, embeddings y fases RoPE se conservan en la precision original para preservar la calidad. La salida se emite como Gaussian splatting, con la opcion de exportar una malla de discos texturizados que los visores estandar (Preview, Quick Look) renderizan como solidos, o bien los puntos nativos `KHR_gaussian_splatting`. No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion image-to-3D a partir de una unica imagen de un objeto.
- Eliminacion automatica de fondo mediante BiRefNet, sin pasos previos manuales.
- Salida en dos formatos: GLB con malla de discos texturizados (compatible con visores estandar) y Gaussian splatting nativo mediante `KHR_gaussian_splatting`.
- Control del numero de pasos de inferencia y del numero de gaussianas generadas.
- Exposicion mediante API compatible con OpenAI y Anthropic a traves de mlx-serve, con el endpoint `POST /v1/3d/generations`.
- Ejecucion local sin Python, sin Electron y sin dependencia de la nube.
- Integracion con la app de barra de menu de mlx-serve, que permite seleccionar Idol en su panel 3D.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Prototipado rapido de assets 3D: un artista o disenador sube una foto de un objeto y obtiene un GLB en unos 40 segundos en un chip M-series Ultra, lo que permite iterar sobre variaciones de diseno sin salir del portatil.
- Catalogacion de producto en e-commerce: a partir de una fotografia de catalogo con fondo eliminado automaticamente, se genera una representacion 3D exportable para visores web, reduciendo el coste frente a la fotogrametria tradicional.
- Escaneo de patrimonio o piezas fisicas: fotografiar un objeto y obtener una malla o splat para documentacion, con la ventaja de que todo el proceso ocurre en local y los datos no salen del equipo.
- Integracion en pipelines de contenido 3D: el endpoint `POST /v1/3d/generations` con API compatible OpenAI permite encadenar la generacion dentro de herramientas internas de produccion de assets.
- Visualizacion en macOS sin herramientas adicionales: la salida por defecto como malla de discos texturizados se abre directamente en Preview o Quick Look, lo que facilita la revision por parte de perfiles no tecnicos.
- Investigacion en reconstruccion 3D: el control del numero de gaussianas y de pasos permite experimentar con el equilibrio entre calidad y coste computacional en un entorno MLX reproducible.
- Demostraciones y docencia: al no requerir Python ni configuracion de entorno, sirve para mostrar el funcionamiento de Gaussian splatting y de pipelines image-to-3D en un portatil Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento aportados por el autor son operativos: aproximadamente 40 segundos para 50 pasos y 262.144 gaussianas en un chip M-series Ultra, con 3,6 GB de memoria residente.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 3,6 GB residentes segun el autor, en el escenario de 50 pasos y 262.144 gaussianas.
- Hardware objetivo: Apple Silicon (series M). El autor cita explicitamente un chip M-series Ultra para la cifra de 40 segundos; no se proporcionan datos para chips M base, Pro o Max.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este empaquetado, que depende de MLX y de mlx-serve, orientados a Apple Silicon.
- Cabe en equipos consumer Apple Silicon: si, dado el consumo de 3,6 GB, aunque el rendimiento variara segun el chip.
- Opciones de despliegue: mlx-serve mediante `mlx-serve --model-dir <carpeta del repo>` o seleccionando Idol en el panel 3D de la app de barra de menu. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este pipeline.
- Latencia y throughput: aproximadamente 40 s por generacion en M-series Ultra con la configuracion de referencia; no se aportan datos de throughput por lotes.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia estructural, este empaquetado se relaciona con su modelo base speridlabs/idol, del que es una conversion cuantizada:

| Modelo | Parametros | Contexto | Formato | Licencia | Entorno |
|---|---|---|---|---|---|
| ddalcu/Idol-MLX-Serve-fp16 | no disponible | no aplica | safetensors (MLX) | Apache-2.0 (DINOv3 aparte) | Apple Silicon, mlx-serve |
| speridlabs/idol | no disponible | no aplica | no disponible | Apache-2.0 | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en image-to-3D: no genera texto, codigo ni mantiene conversaciones; no debe evaluarse como un LLM.
- Dependencia de plataforma: requiere Apple Silicon y mlx-serve; no es desplegable en GPU NVIDIA ni en entornos x86 convencionales.
- La licencia Apache-2.0 de los pesos Idol no cubre el encoder DINOv3 incluido, que se rige por la DINOv3 License de Meta y debe acompanar a cualquier redistribucion.
- La cuantizacion a float16 de las capas lineales y a 8 bits de la atencion intermedia del VAE puede introducir diferencias de calidad respecto a los pesos originales; el autor no documenta metricas de dicha perdida.
- No se dispone de informacion sobre sesgos, tasas de alucinacion geometrica ni limitaciones por tipo de objeto o condicion de iluminacion de la imagen de entrada.
- El rendimiento de 40 segundos corresponde a un chip M-series Ultra; en chips de gama inferior la latencia sera mayor, sin datos publicados al respecto.
- El repositorio tiene solo 21 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.
- No se documentan limitaciones de idioma porque el modelo no procesa texto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ddalcu/Idol-MLX-Serve-fp16
- Modelo base: https://huggingface.co/speridlabs/idol
- mlx-serve (web): https://mlxserve.com/
- mlx-serve (GitHub): https://github.com/ddalcu/mlx-serve
- VAE de origen: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
