# mflux-community/fibo-2-0-edit-turbo-mflux-q6

## Resumen

Fibo-2.0-edit-turbo-mflux-q6 es una conversion comunitaria del modelo de generacion y edicion de imagenes Fibo-2.0-edit-turbo de Bria AI, realizada por el colectivo MFlux-Community para su ejecucion nativa en Apple Silicon mediante MLX. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos originales han sido unicamente convertidos al formato MLX y cuantizados a 6 bits con cuantizacion afin de MLX, aplicada de forma uniforme al text encoder, al transformer y al VAE.

El paquete ocupa 10,3 GB en disco, frente a los 25,1 GB de la version BF16, lo que lo situa en un punto de compromiso entre calidad y huella de memoria dentro de la familia de cuantizaciones publicada (BF16, Q8, Q6, Q5, Q4 y Q3). La cuantizacion esta almacenada en los propios pesos, de modo que el usuario no necesita pasar ningun flag de cuantizacion en tiempo de inferencia.

Su relevancia es practica: permite ejecutar un modelo de edicion de imagen por texto de ultima generacion de forma local en un Mac, sin dependencia de servicios en la nube ni de GPU NVIDIA, usando la libreria MFlux (version 0.23.0 para la conversion) y el pipeline `text-to-image`. Es una release no oficial: la licencia del modelo original se mantiene sin cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para texto-a-imagen y edicion; componentes text encoder, transformer y VAE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6 (6 bits, cuantizacion afin MLX); familia disponible: BF16, Q8, Q6, Q5, Q4, Q3 |
| Idiomas soportados | no disponible |
| Licencia | fibo-2.0-edit-turbo-license (heredada del modelo original; consultar terminos en briaai/Fibo-2.0-edit-turbo) |
| Formato de pesos | safetensors en formato MLX (cuantizado) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo original en la documentacion proporcionada. La model card del paquete cuantizado unicamente especifica que la conversion aplica cuantizacion afin de 6 bits de MLX sobre tres componentes: el text encoder, el transformer y el VAE. Esto confirma una topologia de difusion clasica con codificador de texto, red generativa principal y autoencoder, pero no se detallan el tipo de transformer, el numero de bloques ni el mecanismo de condicionamiento.

Tampoco hay datos sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO o tecnicas de destilacion). El sufijo "turbo" en el nombre sugiere un modelo optimizado para pocos pasos de inferencia, pero no se aporta confirmacion explicita ni el numero de pasos recomendado. La unica innovacion tecnica documentada en este repositorio es la propia conversion a MLX con cuantizacion integrada en los pesos, que elimina la necesidad de especificar `--quantize` en la CLI.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) mediante el comando `mflux-generate-fibo2-edit`.
- Edicion de imagenes guiada por texto, segun indica el nombre del modelo base (`edit`).
- Ejecucion local nativa en Apple Silicon mediante MLX, sin GPU dedicada.
- Control de resolucion de salida mediante parametros `--width` y `--height` (ejemplo documentado: 1024x1024).
- Reproducibilidad mediante semilla fija (`--seed`).
- Descarga automatica de pesos desde Hugging Face en el primer uso, o uso de copia local con `hf download`.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento; se trata de un modelo generativo de imagen, no de un LLM.

## Casos de uso

- Prototipado de conceptos visuales en local: un disenador puede generar variantes de una escena (por ejemplo, "un frailecillo de pie en un acantilado") con resolucion 1024x1024 y semilla fija para iterar sobre composiciones sin coste por API.
- Edicion de imagenes en flujos de trabajo creativos: al derivar de un modelo de edicion, permite modificar imagenes existentes mediante instrucciones textuales, util para retoques rapidos en estudios pequenos.
- Desarrollo y pruebas de pipelines de generacion en macOS: sirve para validar integraciones con MFlux antes de desplegar en entornos con GPU, gracias a que la cuantizacion Q6 reduce el requisito de memoria frente a BF16.
- Generacion de assets para documentacion tecnica o demos: imagenes de referencia para articulos, presentaciones o prototipos de interfaz, ejecutadas en el propio portatil del desarrollador.
- Experimentacion academica con cuantizacion: permite comparar la calidad de salida entre Q6, Q8, Q5 y Q4 sobre el mismo prompt y semilla, aislando el efecto de la precision en los pesos.
- Uso educativo en ensenanza de modelos de difusion: al ser ejecutable en hardware de consumo Apple, facilita demostraciones en aula sin infraestructura de servidor.
- Automatizacion de variaciones masivas: con semilla controlada y script en bash, se pueden generar lotes de imagenes para catalogos o pruebas A/B de creatividades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica VRAM en sentido estricto; el modelo esta disenado para memoria unificada de Apple Silicon. El repo pesa 10,3 GB, por lo que se recomienda un Mac con al menos 16 GB de memoria unificada para Q6, y 24 GB o mas para trabajar con comodidad junto al sistema y otras aplicaciones.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y posteriores). No se documenta soporte para GPU NVIDIA, AMD ni CPU x86 en este paquete.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de gama consumer con memoria unificada suficiente; no esta pensado para RTX 4090 ni A100/H100, al usar MLX.
- Opciones de despliegue: MFlux (instalacion con `uv tool install --upgrade mflux`), ejecutable `mflux-generate-fibo2-edit`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del chip Apple, del numero de pasos de inferencia y de la resolucion; la model card no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fibo-2-0-edit-turbo-mflux-q6 (este) | no disponible | no disponible | safetensors MLX Q6, Apple Silicon | fibo-2.0-edit-turbo-license | Hugging Face, 92 descargas |
| fibo-2-0-edit-turbo-mflux-bf16 | no disponible | no disponible | safetensors MLX BF16, 25,1 GB | fibo-2.0-edit-turbo-license | Hugging Face |
| fibo-2-0-edit-turbo-mflux-q4 | no disponible | no disponible | safetensors MLX Q4, 7,2 GB | fibo-2.0-edit-turbo-license | Hugging Face |
| briaai/Fibo-2.0-edit-turbo (original) | no disponible | no disponible | pesos originales (no MLX) | fibo-2.0-edit-turbo-license | Hugging Face |

La comparativa relevante es interna a la familia de cuantizaciones MFlux: Q6 ofrece 10,3 GB frente a 25,1 GB en BF16 (un 59 % menos) y 7,2 GB en Q4, situandose como opcion intermedia para equipos con memoria unificada limitada. No se dispone de datos de benchmarks que permitan comparar la calidad de salida entre estas variantes ni con modelos de terceros.

## Limitaciones y advertencias

- Release no oficial: es una conversion comunitaria de MFlux-Community, no una publicacion de Bria AI; los autores originales no la respaldan.
- Licencia restrictiva potencial: la licencia `fibo-2.0-edit-turbo-license` es de tipo "other" y debe consultarse en el repositorio original antes de cualquier uso comercial; no se detallan aqui sus terminos.
- Perdida de calidad por cuantizacion: la cuantizacion a 6 bits puede introducir degradacion en detalles finos, texturas y coherencia respecto a BF16; no se han publicado evaluaciones cuantitativas de esta perdida.
- Plataforma limitada: solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a CPU generica sin reconversion.
- Idiomas no documentados: se desconoce que lenguas admite el text encoder para los prompts.
- Riesgo de sesgos y alucinacion visual: no hay informacion sobre la composicion del dataset original, por lo que no pueden evaluarse sesgos demograficos, estilisticos o culturales; los modelos de difusion pueden generar contenido incoherente o no solicitado.
- Sin garantias de produccion: no se documentan latencias, tasas de fallo ni estabilidad en cargas sostenidas; el numero de descargas (92) y likes (0) indica una adopcion muy temprana y poca validacion por la comunidad.
- Dependencia de la version de MFlux: la conversion se realizo con MFlux 0.23.0; versiones posteriores podrian requerir ajustes de compatibilidad.
- Sin datos de entrenamiento ni arquitectura: imposibilita auditorias tecnicas detalladas del modelo base.

## Enlaces

- Repositorio Hugging Face de este paquete: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q6
- Modelo original: https://huggingface.co/briaai/Fibo-2.0-edit-turbo
- Version BF16: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-bf16
- Version Q8: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q8
- Version Q5: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q5
- Version Q4: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q4
- Version Q3: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q3
- Repositorio de MFlux: https://github.com/filipstrand/mflux
- Organizacion MFlux-Community: https://huggingface.co/mflux-community
