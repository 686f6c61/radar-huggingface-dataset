# mflux-community/flux-3-image-klein-base-mflux-q5

## Resumen

`mflux-community/flux-3-image-klein-base-mflux-q5` es una conversion comunitaria del modelo generativo de imagen `black-forest-labs/flux-3-image-klein-base` al formato MLX con cuantizacion afín de 5 bits, realizada por el colectivo MFlux-Community. El objetivo es permitir la ejecucion local del modelo original en hardware Apple Silicon (Macs con chip M-series) mediante la libreria MFlux, un runtime open source escrito en MLX nativo que evita depender de CUDA o de servicios en la nube.

El modelo base pertenece a la familia Flux.3 de Black Forest Labs, orientada a tareas de generacion y edicion de imagen (image-to-image), y esta distribuido bajo la licencia `flux-kommunity-license`. Esta version Q5 reduce el peso del repositorio a 6,5 GB frente a los 18,5 GB de la variante BF16, lo que la hace viable en equipos con memoria unificada moderada. Se trata de una conversion no oficial: los pesos solo han sido transformados a MLX y cuantizados, sin reentrenamiento ni modificacion de la arquitectura.

La relevancia de esta ficha radica en que documenta una de las pocas vias practicas para ejecutar un modelo Flux.3 de forma totalmente local en macOS, con el ahorro de memoria que supone la cuantizacion Q5 y la posibilidad de integrarlo en flujos de edicion de imagen por linea de comandos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo de imagen Flux.3 (difusion/flow matching, segun el modelo base); pesos convertidos a MLX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica contexto de texto) |
| Tipos de cuantizacion | Q5 (MLX affine quantization, 5 bits) sobre text encoder, transformer y VAE; existen variantes BF16, Q8, Q6, Q4 y Q3 |
| Idiomas soportados | no disponible |
| Licencia | flux-kommunity-license (hereda la del modelo base) |
| Formato de pesos | safetensors en formato MLX (cuantizacion almacenada en los pesos) |

## Arquitectura y entrenamiento

El modelo base `flux-3-image-klein-base` es un modelo generativo de imagen de la familia Flux.3 de Black Forest Labs, disenado para tareas de image-to-image. La informacion proporcionada no detalla la arquitectura interna (tipo de transformer, mecanismo de atencion o esquema de difusion/flow matching) ni los datos de entrenamiento (numero de tokens, composicion del dataset, si hubo RLHF/DPO u otras etapas de alineacion). Tampoco se especifica el numero de parametros ni la innovacion tecnica concreta del modelo base.

Lo unico documentado en esta ficha es el proceso de conversion: MFlux 0.24.0 aplico cuantizacion afín de 5 bits de MLX sobre el text encoder, el transformer y el VAE, y almaceno el nivel de cuantizacion dentro de los propios pesos, de modo que no es necesario pasar el flag `--quantize` al ejecutar. No se realizo ningun ajuste fino ni reentrenamiento; los pesos solo se modificaron por conversion de formato y cuantizacion.

## Capacidades

- Generacion y edicion de imagen mediante pipeline image-to-image, segun el tag del repositorio y el comando de ejemplo de la model card.
- Ejecucion local en Apple Silicon mediante MLX nativo, sin necesidad de GPU NVIDIA ni de servicios en la nube.
- Control de dimensiones de salida (por ejemplo 1024x1024) y de semilla (`--seed`) para reproducibilidad.
- Cuantizacion integrada en los pesos: no requiere flags adicionales de cuantizacion en tiempo de inferencia.
- Soporte de descarga automatica de pesos desde Hugging Face o uso de copia local mediante `--model`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking; el modelo es exclusivamente de generacion/edicion de imagen.

## Casos de uso

- Edicion de imagen local en Mac: un desarrollador puede iterar sobre variaciones de una imagen de entrada con `mflux-generate-flux3` usando el modelo Q5, aprovechando que 6,5 GB caben en la memoria unificada de un Mac con 16 GB o mas.
- Prototipado rapido de pipelines de image-to-image: al ejecutarse por linea de comandos y con semilla fija, encaja en scripts de experimentacion que comparan prompts o parametros de generacion sin coste de API.
- Generacion de assets para desarrollo de interfaces: crear imagenes de referencia o placeholders de 1024x1024 en local para maquetas, sin depender de servicios externos.
- Automatizacion de lotes de imagenes: integracion en scripts de shell o Python que invocan MFlux repetidamente para producir variaciones controladas por semilla.
- Entornos con requisitos de privacidad: al ejecutarse completamente en local, las imagenes de entrada no salen del equipo, lo que resulta adecuado para material sensible que no debe enviarse a la nube.
- Evaluacion comparativa de cuantizaciones: usar la Q5 frente a Q4, Q6 u Q8 del mismo modelo base para medir el compromiso entre calidad de imagen y memoria consumida en un Mac concreto.
- Demostraciones y docencia: ejecutar un modelo Flux.3 en un portatil Apple Silicon para mostrar generacion de imagen sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio Q5 ocupa 6,5 GB; la inferencia requiere cargar pesos y buffers, por lo que se recomienda al menos 16 GB de memoria unificada en Apple Silicon (no confirmado en la model card).
- GPU recomendadas: exclusivamente Apple Silicon (chips M-series) mediante MLX; no se soportan GPUs NVIDIA ni AMD en esta conversion.
- Cabe en consumer hardware: si, en Macs con memoria unificada suficiente; las variantes Q4 (5,3 GB) y Q3 (4,2 GB) reducen aun mas el requisito.
- Opciones de despliegue: MFlux (`mflux-generate-flux3`), instalable con `uv tool install --upgrade mflux`; descarga de pesos con `hf download`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flux-3-image-klein-base-mflux-q5 (este) | no disponible | no aplica | Q5 (6,5 GB) | flux-kommunity-license | Hugging Face, MLX |
| flux-3-image-klein-base-mflux-q8 | no disponible | no aplica | Q8 (9,9 GB) | flux-kommunity-license | Hugging Face, MLX |
| flux-3-image-klein-base-mflux-bf16 | no disponible | no aplica | BF16 (18,5 GB) | flux-kommunity-license | Hugging Face, MLX |
| black-forest-labs/flux-3-image-klein-base | no disponible | no aplica | original (formato nativo) | flux-kommunity-license | Hugging Face |

La comparativa se limita a las variantes de cuantizacion del mismo modelo base y al modelo original, ya que la informacion disponible no incluye otros modelos de la misma categoria con los que contrastar parametros o rendimiento.

## Limitaciones y advertencias

- Conversion no oficial: realizada por MFlux-Community, no por Black Forest Labs; no hay garantia de equivalencia exacta con el modelo original mas alla de la conversion y cuantizacion.
- La cuantizacion Q5 puede introducir perdida de calidad frente a BF16 o Q8; no se han publicado metricas que cuantifiquen esa diferencia.
- Licencia `flux-kommunity-license`: es necesario revisar los terminos del modelo base antes de cualquier uso comercial, ya que pueden existir restricciones.
- Solo funciona en Apple Silicon con MLX; no es desplegable en GPUs NVIDIA ni en entornos CUDA.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma en la informacion disponible.
- El repositorio tiene muy pocas descargas (26) y ningun like, lo que indica una adopcion temprana y poca validacion por parte de la comunidad.
- No se dispone de datos de rendimiento, latencia ni benchmarks que permitan evaluar su calidad objetiva frente al modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mflux-community/flux-3-image-klein-base-mflux-q5
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Licencia del modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base/blob/main/LICENSE.md
- MFlux (repositorio): https://github.com/filipstrand/mflux
- Variante BF16: https://huggingface.co/mflux-community/flux-3-image-klein-base-mflux-bf16
- Variante Q8: https://huggingface.co/mflux-community/flux-3-image-klein-base-mflux-q8
- Variante Q6: https://huggingface.co/mflux-community/flux-3-image-klein-base-mflux-q6
- Variante Q4: https://huggingface.co/mflux-community/flux-3-image-klein-base-mflux-q4
- Variante Q3: https://huggingface.co/mflux-community/flux-3-image-klein-base-mflux-q3
- Perfil del colectivo: https://huggingface.co/mflux-community
