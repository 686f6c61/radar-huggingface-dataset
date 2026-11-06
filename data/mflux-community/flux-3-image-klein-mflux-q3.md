# mflux-community/flux-3-image-klein-mflux-q3

## Resumen

Flux.3-Image-Klein MFlux Q3 es una conversion cuantizada a 3 bits del modelo de generacion y edicion de imagenes flux-3-image-klein de Black Forest Labs, realizada por la comunidad MFlux-Community para su ejecucion local en Apple Silicon mediante MLX. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos originales se han convertido al formato MLX y se han cuantizado con cuantizacion afin de 3 bits aplicada al codificador de texto, al transformer y al VAE, de modo que el nivel de cuantizacion queda almacenado en los propios pesos.

El paquete ocupa 4,2 GB en el repositorio, frente a los 18,5 GB de la version BF16 del mismo modelo base, lo que lo convierte en la variante mas ligera de la familia MFlux publicada para este modelo. La tarea declarada en el pipeline es image-to-image, es decir, edicion de imagenes guiada por prompt de texto, aunque la interfaz de MFlux permite tambien generar imagenes desde cero con dimensiones y semilla configurables.

Su relevancia es practica: permite ejecutar un modelo de la familia Flux.3 en un Mac sin GPU dedicada, usando la pila MLX nativa y la herramienta de linea de comandos mflux-generate-flux3. La contrapartida es una perdida de calidad frente a las variantes de mayor precision (Q4, Q5, Q6, Q8 y BF16) y una licencia comunitaria con restricciones que condicionan el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo de imagenes flux-3-image-klein convertido a MLX (codificador de texto, transformer y VAE) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine quantization a 3 bits (Q3) sobre text encoder, transformer y VAE; nivel embebido en los pesos |
| Idiomas soportados | no disponible |
| Licencia | flux-kommunity-license |
| Formato de pesos | safetensors (MLX), repositorio de 4,2 GB |
| Libreria de inferencia | mflux (MLX) |
| Version de conversion | MFlux 0.24.0 (30-10-2026) |
| Modelo base | black-forest-labs/flux-3-image-klein |
| Tarea (pipeline) | image-to-image |
| Plataforma objetivo | Apple Silicon (mlx, apple-silicon) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original flux-3-image-klein ni sus datos de entrenamiento. Lo unico documentado en esta ficha es el proceso de conversion: los pesos originales se han transformado al formato MLX y se han cuantizado con cuantizacion afin de 3 bits en los tres componentes del pipeline (codificador de texto, transformer de difusion y VAE). El nivel de cuantizacion se almacena en los pesos, por lo que no es necesario pasar el flag `--quantize` en tiempo de inferencia.

No se han publicado en la informacion proporcionada datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas del modelo base. Tampoco se documentan mecanismos de decodificacion especulativa ni variantes de atencion. Cualquier afirmacion sobre estos puntos seria especulativa y no se incluye.

## Capacidades

- Generacion de imagenes a partir de un prompt de texto, con control de anchura, altura y semilla (ejemplo documentado: 1024x1024, seed 42).
- Edicion de imagenes (image-to-image), que es la tarea declarada en el pipeline del repositorio.
- Ejecucion local en Mac con Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Inferencia por linea de comandos con `mflux-generate-flux3`, incluyendo descarga automatica de pesos o uso de copia local.
- Cuantizacion integrada en los pesos: no requiere configuracion adicional de cuantizacion en la llamada.
- No se documentan capacidades de tool calling, agentes, vision de entrada mas alla de la edicion de imagen, audio, thinking mode ni soporte multilingue explicito.

## Casos de uso

- Edicion de imagenes en local para prototipado rapido: usar `mflux-generate-flux3` con `--model mflux-community/flux-3-image-klein-mflux-q3` para transformar una imagen existente segun un prompt, aprovechando que el paquete de 4,2 GB cabe en un Mac de gama alta sin GPU dedicada.
- Iteracion creativa con presupuesto de memoria ajustado: al ser la variante mas ligera de la familia, permite probar prompts y semillas en equipos donde BF16 (18,5 GB) o Q8 (9,9 GB) no caben, aceptando menor fidelidad visual.
- Generacion de bocetos y conceptos para diseno: generar imagenes de 1024x1024 con semilla fija para reproducibilidad en sesiones de exploracion de ideas.
- Integracion en scripts y pipelines de automatizacion: la interfaz de linea de comandos y la descarga via `hf download` permiten incorporar la generacion en flujos batch o tareas programadas en macOS.
- Evaluacion comparativa de cuantizaciones: servir como punto de referencia Q3 frente a Q4, Q5, Q6, Q8 y BF16 del mismo modelo para medir el impacto de la cuantizacion en la calidad de salida.
- Demos y experimentos docentes: ejecutar un modelo de la familia Flux.3 en un portatil Apple Silicon para ilustrar difusion y edicion de imagenes sin infraestructura de servidor.
- Uso offline o con requisitos de privacidad: al correr localmente, las imagenes de entrada no salen del equipo, lo que encaja en entornos donde no se permite enviar contenido a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio unificado estimado: el repositorio pesa 4,2 GB; se necesita memoria unificada suficiente para cargar los pesos y ejecutar el pipeline (text encoder, transformer y VAE) con margen adicional para activaciones.
- Plataforma: exclusivamente Apple Silicon con MLX; no hay soporte documentado para CUDA ni ROCm en esta conversion.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables, ya que el formato es MLX y la libreria es mflux.
- Cabe en equipos consumer Apple Silicon: si, es la variante disenada para minimizar el uso de memoria; el limite concreto depende del Mac y no se documenta en la informacion disponible.
- Opciones de despliegue: `uv tool install --upgrade mflux` y el comando `mflux-generate-flux3`; descarga de pesos con `hf download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Cuantizacion | Tamano | Plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flux-3-image-klein-mflux-q3 (este) | Q3 (3 bits) | 4,2 GB | Apple Silicon / MLX | flux-kommunity-license | Hugging Face (24 descargas) |
| flux-3-image-klein-mflux-q4 | Q4 | 5,3 GB | Apple Silicon / MLX | flux-kommunity-license | Hugging Face |
| flux-3-image-klein-mflux-q8 | Q8 | 9,9 GB | Apple Silicon / MLX | flux-kommunity-license | Hugging Face |
| flux-3-image-klein-mflux-bf16 | BF16 | 18,5 GB | Apple Silicon / MLX | flux-kommunity-license | Hugging Face |

No se dispone de datos de rendimiento comparado (metricas de calidad de imagen, FID, CLIP score u otras) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3 bits es la mas agresiva de la familia publicada; cabe esperar degradacion de calidad frente a Q4, Q5, Q6, Q8 y BF16, aunque no se cuantifica en la informacion disponible.
- No es una release oficial de Black Forest Labs: es una conversion de la comunidad (MFlux-Community), por lo que no cuenta con soporte del autor original.
- La licencia flux-kommunity-license impone terminos y restricciones de uso; es imprescindible revisar el texto completo antes de cualquier uso comercial. No se detallan aqui las condiciones concretas.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA, ROCm ni CPU convencional sin reconversion.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion del modelo base en la informacion proporcionada.
- El modelo esta orientado a image-to-image; su comportamiento en generacion pura texto-a-imagen se deduce del ejemplo de la model card, pero no se detalla tecnicamente.
- El repositorio tiene muy poca traccion (24 descargas, 0 likes) y fue creado y actualizado el mismo dia (30-10-2026), por lo que su validacion por la comunidad es practicamente nula.
- Requiere instalar MFlux 0.24.0 o superior para garantizar compatibilidad con el formato de pesos convertido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mflux-community/flux-3-image-klein-mflux-q3
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Licencia del modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein/blob/main/LICENSE.md
- Implementacion MFlux: https://github.com/filipstrand/mflux
- Organizacion MFlux-Community: https://huggingface.co/mflux-community
- Variante BF16: https://huggingface.co/mflux-community/flux-3-image-klein-mflux-bf16
- Variante Q8: https://huggingface.co/mflux-community/flux-3-image-klein-mflux-q8
- Variante Q6: https://huggingface.co/mflux-community/flux-3-image-klein-mflux-q6
- Variante Q5: https://huggingface.co/mflux-community/flux-3-image-klein-mflux-q5
- Variante Q4: https://huggingface.co/mflux-community/flux-3-image-klein-mflux-q4
