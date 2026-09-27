# JoyFusionAI/Qwen-Image-2.1-MLX-4bit

## Resumen

JoyFusionAI/Qwen-Image-2.1-MLX-4bit es una cuantizacion a 4 bits del modelo de generacion de imagenes Qwen-Image-2.1 de Alibaba, empaquetada en formato MLX para su ejecucion local en hardware Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). El autor, JoyFusionAI, no entrena ningun modelo nuevo: aplica la herramienta `mflux-save -q 4` del proyecto mflux sobre los pesos originales de Qwen/Qwen-Image-2.1, con el objetivo de reducir el consumo de memoria y hacer viable la inferencia en equipos de consumo con GPU integrada.

El modelo resuelve un problema de accesibilidad: el Qwen-Image-2.1 original en bf16 ocupa varias decenas de gigabytes y no cabe en la mayoria de Macs. Esta version 4-bit reduce el transformer de 7B a 3,8 GiB y el total del repositorio a unos 20,5 GB, con un pico de memoria medido de tan solo ~7 GB en un M1 Max a 768x768 si se usa la bandera `--low-ram`. Esto permite generar imagenes de forma completamente local, sin depender de APIs externas ni de tarjetas NVIDIA.

Es relevante porque la arquitectura subyacente, un DiT (Diffusion Transformer) Single-Stream de 32 capas con 7B de parametros en el componente de generacion visual, unifica generacion de texto a imagen, edicion y transparencia RGBA nativa en un unico modelo. La publicacion esta fechada en septiembre de 2026 y acumulaba 4162 descargas y 12 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) Single-Stream de 32 capas; VAE de 64 canales; codificador de texto Qwen3-VL-8B |
| Parametros totales | 7B en el transformer de generacion visual (componente DiT); el codificador de texto Qwen3-VL-8B anade ~8B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX affine con group size 64 en el transformer y en las capas lineales del VAE; conv del VAE y codificador de texto en bf16 (sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (identificador `qwen-research`); solo investigacion y evaluacion no comercial |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El componente de generacion es un Diffusion Transformer de flujo unico (Single-Stream DiT) con 32 capas y 7B de parametros, que procesa las condiciones textuales e imagenes en un unico flujo en lugar de separar bloques de texto e imagen. El codificador de texto es Qwen3-VL-8B, que mflux mantiene sin cuantizar en bf16 (14 GiB), y el VAE de 64 canales reduce su huella cuantizando sus capas lineales a 4 bits mientras conserva las convoluciones en bf16. La cuantizacion aplicada es MLX affine con group size 64, un esquema que agrupa pesos por bloques de 64 elementos para compartir escala y sesgo.

El modelo base Qwen-Image-2.1, del que esta version es un derivado, se presenta como un modelo unificado que cubre generacion texto a imagen, edicion de imagenes y transparencia RGBA nativa, con un equilibrio deliberado entre calidad, eficiencia de inferencia y versatilidad. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de alineacion como RLHF o DPO, porque no se han publicado esos datos en la informacion disponible. La aportacion concreta de JoyFusionAI se limita al proceso de cuantizacion y empaquetado para MLX, no al entrenamiento.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (prompts) en formato texto a imagen.
- El modelo base Qwen-Image-2.1 unifica generacion y edicion de imagenes, asi como transparencia RGBA nativa; esta build cuantizada se distribuye a traves de mflux principalmente para la tarea texto a imagen.
- Soporte de prompt con texto renderizado dentro de la imagen (el ejemplo de la model card genera un cartel con la palabra "Hello").
- Resoluciones configurables; las dimensiones de la imagen deben ser divisibles por 16.
- Ejecucion completamente local en hardware Apple Silicon, sin conexion a servicios externos.
- Modo de bajo consumo de memoria (`--low-ram`) que libera el codificador de texto tras codificar el prompt y aplica teselado (tiling) en la decodificacion del VAE.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, audio ni otras capacidades multimodales de entrada.

## Casos de uso

- Generacion de ilustraciones locales en un Mac: un disenador puede ejecutar `mflux-generate-qwen-2.1` con 40 pasos para producir bocetos conceptuales sin enviar datos a la nube, lo que resulta util cuando el material es confidencial.
- Creacion de materiales para redes sociales: con un pico de ~7 GB en un M1 Max, se pueden generar imagenes a 768x768 en lotes por la noche en un portatil, sin GPU dedicada.
- Prototipado de assets para producto: al admitir prompt con texto renderizado (por ejemplo carteles con palabras concretas), sirve para maquetas rapidas de banners, rotulos o mockups.
- Trabajo de investigacion en generacion de imagenes: al ser una version cuantizada y reproducible del modelo base, permite estudiar el impacto de la cuantizacion 4-bit MLX sobre la calidad visual dentro de los terminos de la licencia de investigacion.
- Generacion offline en entornos sin conectividad: en escenarios de campo, laboratorios aislados o entornos con restricciones de red, el modelo corre de forma autonoma en el propio equipo.
- Comparacion de builds MLX: junto con alternativas como mlx-community/Qwen-Image-2.1-MLX-4bit, permite evaluar distintas cuantizaciones del mismo modelo base sobre el mismo hardware.
- Docencia y aprendizaje: al reducir el requisito de memoria, es viable demostrar pipelines de difusion sobre transformers en aulas con equipos Apple Silicon, siguiendo los repositorios de ejemplo publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento aportados por el autor son de inferencia, no de calidad: en un M1 Max a 768x768, con la bandera `--low-ram` activada, el pico de memoria medido es de aproximadamente 7 GB (frente a 33-36 GB sin ella) y la velocidad es de unos 6,7 s por paso, sin cambios visibles de calidad segun el autor. Con la configuracion recomendada de 40 pasos, esto equivale a unos 268 segundos por imagen. No se especifica el tiempo por paso sin `--low-ram`.

## Requisitos de hardware

- Diseñado exclusivamente para Apple Silicon (MLX sobre Metal GPU); no se ejecuta en CUDA ni en CPU x86.
- Repositorio de 20,5 GB en disco; el transformer 4-bit ocupa 3,8 GiB, el codificador de texto bf16 14 GiB y el VAE 1,2 GiB.
- Pico de memoria en inferencia: ~7 GB en un M1 Max a 768x768 con `--low-ram`; entre 33 y 36 GB sin esa bandera.
- Cabe en equipos de consumo Apple Silicon, especialmente variantes con memoria unificada de 16 GB o mas cuando se usa `--low-ram`; el modo sin `--low-ram` exige equipos de 32 GB o superiores.
- Velocidad medida: ~6,7 s/paso en M1 Max, ~4,5 minutos por imagen de 40 pasos a 768x768.
- Opciones de despliegue: mflux, concretamente el comando `mflux-generate-qwen-2.1`, que requiere una build de mflux `main` igual o posterior al commit `8c00dab2`.
- No se documentan opciones de despliegue con vLLM, TGI, Ollama ni llama.cpp, ya que no aplican a MLX ni a un modelo de difusion.

## Comparativa con modelos similares

| Modelo | Precision / tamano | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|
| JoyFusionAI/Qwen-Image-2.1-MLX-4bit | 4-bit MLX, transformer 3,8 GiB, total ~20 GB | Apple Silicon | Qwen Research (no comercial) | HuggingFace, via mflux |
| Qwen/Qwen-Image-2.1 (base) | bf16, 7B en el componente DiT | CUDA / GPUs de gran memoria | Qwen Research (no comercial) | HuggingFace |
| mlx-community/Qwen-Image-2.1-MLX-4bit | 4-bit MLX | Apple Silicon | no disponible en la informacion | HuggingFace |

No se dispone de datos de rendimiento comparativo (calidad de imagen, FID, CLIP score u otras metricas) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia estrictamente no comercial: los pesos son un derivado de Qwen-Image-2.1 y se distribuyen bajo la Qwen Research License Agreement; el uso comercial requiere una licencia separada del equipo de Qwen.
- Es una cuantizacion, no un modelo nuevo: la calidad final depende del esquema 4-bit affine group 64 y puede diferir de la del modelo base en bf16, aunque el autor afirma que no observa cambios visibles de calidad al usar `--low-ram`.
- Dependencia de una version concreta de mflux: se necesita una build `main` igual o posterior al commit `8c00dab2`; versiones anteriores no reconoceran el modelo.
- Restriccion de resolucion: las dimensiones de la imagen deben ser divisibles por 16, lo que limita tamanos arbitrarios.
- Exclusividad de plataforma: al ser MLX, no es desplegable en servidores con GPUs NVIDIA o AMD, lo que reduce su utilidad en produccion a gran escala.
- No hay datos publicos de sesgos, comportamiento multilingue (el campo de idiomas figura como no disponible) ni evaluaciones de seguridad en la informacion proporcionada.
- Riesgo de sesgos heredados del dataset de entrenamiento del modelo base, sobre el cual no se aporta documentacion en esta ficha.
- La model card no documenta limites de contexto, consumo en resoluciones superiores a 768x768 ni comportamiento con lotes grandes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoyFusionAI/Qwen-Image-2.1-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Repositorio de mflux: https://github.com/mflux-community/mflux
- Repositorio oficial de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Build alternativa MLX 4-bit de la comunidad: https://huggingface.co/mlx-community/Qwen-Image-2.1-MLX-4bit
- Guia de ejecucion local en Mac: https://github.com/The-Focus-AI/qwen-image-2.1-mlx
- Noticia sobre la ejecucion en Apple Silicon: https://alphasignal.ai/news/alibaba-s-qwen-image-2-1-now-runs-on-apple-silicon-at-just-7-gb
