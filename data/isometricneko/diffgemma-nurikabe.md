# isometricneko/diffgemma-nurikabe

## Resumen

Diffgemma-nurikabe es un adaptador LoRA de rango 8 entrenado sobre el modelo base google/diffusiongemma-26B-A4B-it, un modelo de difusion discreta para generacion de texto. Lo desarrolla el usuario isometricneko y esta orientado especificamente a resolver puzles tipo nurikabe sobre tableros de 10x10, un dominio de razonamiento espacial y restricciones logicas que los modelos de lenguaje generalistas abordan con dificultad.

El adaptador se distribuye como un bundle JAX/Orbax nativo del repositorio, que contiene unicamente los tensores del adaptador; el checkpoint base debe obtenerse por separado. El entrenamiento se realizo hasta el paso 7000 y utiliza el dataset isometricneko/nurikabe10x10. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigacion de publicacion muy reciente (28 de octubre de 2026) y de alcance experimental.

Su relevancia radica en que explora el ajuste fino de modelos de difusion discreta sobre tareas de resolucion de puzles con estructura espacial, un nicho poco cubierto por los adaptadores convencionales de modelos autorregresivos. La licencia CC-BY-4.0 facilita su reutilizacion con atribucion, aunque la ausencia de documentacion sobre idiomas, benchmarks y formato de pesos limita su evaluacion objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 8) sobre modelo de difusion discreta (base: google/diffusiongemma-26B-A4B-it) |
| Parametros totales | no disponible (el adaptador contiene solo tensores LoRA; el modelo base es de 26B) |
| Parametros activos | no disponible (el nombre del base sugiere A4B, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | bundle JAX/Orbax (tensores del adaptador unicamente) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 aplicado sobre google/diffusiongemma-26B-A4B-it, un modelo de difusion discreta para texto. A diferencia de los transformers autorregresivos clasicos, los modelos de difusion generan la salida mediante un proceso iterativo de denoising sobre tokens discretos, lo que permite visualizar trayectorias intermedias de generacion. El repositorio incluye un notebook de visualizacion de trayectorias (nurikabe_trajectory_video_colab.ipynb) que sugiere que el entrenamiento y la inferencia se realizan en el ecosistema JAX del proyecto Gemma.

El entrenamiento se llevo a cabo hasta el paso 7000 sobre el dataset isometricneko/nurikabe10x10, compuesto por puzles nurikabe de tablero 10x10. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El adaptador se distribuye como bundle JAX/Orbax nativo, lo que implica dependencia del codigo de entrenamiento del repositorio isomorphicdude/gemma (rama sudoku-sft) para su reproduccion.

## Capacidades

- Resolucion de puzles nurikabe en tableros de 10x10, incluyendo el razonamiento sobre restricciones de conectividad y aislamiento de celdas.
- Generacion de trayectorias de difusion intermedias, visualizables mediante el notebook incluido.
- Ajuste fino eficiente en parametros (LoRA de rango 8) sobre un modelo base de gran tamano.
- Capacidades heredadas del modelo base google/diffusiongemma-26B-A4B-it: no detalladas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Investigacion en difusion discreta para texto: el adaptador sirve como caso de estudio reproducible para analizar como un modelo de difusion aprende restricciones logicas espaciales, gracias a la visualizacion de trayectorias incluida.
- Generacion de solucionarios de puzles: se puede emplear para producir soluciones paso a paso de tableros nurikabe 10x10 en entornos educativos o de ocio, dado el entrenamiento especifico en ese dominio.
- Evaluacion comparativa de adaptadores LoRA: al ser un LoRA de rango 8 sobre un base de 26B, permite estudiar el impacto del rango y del numero de pasos (7000) en tareas de razonamiento estructurado.
- Reproduccion de experimentos: el repositorio isomorphicdude/gemma (rama sudoku-sft) y el notebook de Colab permiten replicar el entrenamiento y la inferencia en infraestructura JAX.
- Benchmarking de modelos de difusion en tareas de constraint satisfaction: el adaptador puede integrarse en suites de evaluacion que comparen difusion discreta frente a modelos autorregresivos en puzles logicos.
- Prototipado de asistentes especializados en puzles: con la debida validacion, podria integrarse en aplicaciones de generacion y verificacion de tableros nurikabe, aunque requiere el checkpoint base y el entorno JAX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del checkpoint base google/diffusiongemma-26B-A4B-it, que no se detalla en la informacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el adaptador se distribuye como bundle JAX/Orbax y requiere el codigo del repositorio isomorphicdude/gemma (rama sudoku-sft); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores LoRA para puzles sobre modelos de difusion discreta) ni datos de rendimiento que permitan una comparacion objetiva.

## Limitaciones y advertencias

- El repositorio contiene unicamente los tensores del adaptador; es imprescindible obtener el checkpoint base google/diffusiongemma-26B-A4B-it por separado.
- El adaptador esta especializado exclusivamente en nurikabe 10x10; su rendimiento fuera de ese dominio no esta documentado.
- No se especifican idiomas soportados, sesgos conocidos ni tasas de alucinacion.
- No hay benchmarks publicados, por lo que no se puede verificar su calidad frente a alternativas.
- El formato JAX/Orbax limita su uso a entornos compatibles con el codigo del repositorio; no se ofrece GGUF ni safetensors.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero debe verificarse la licencia del modelo base, que no se detalla en la informacion.
- Con 0 descargas y 0 likes, el artefacto carece de validacion por parte de la comunidad.
- El entrenamiento se detuvo en el paso 7000; no se documenta si se alcanzo convergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/isometricneko/diffgemma-nurikabe
- Dataset: https://huggingface.co/datasets/isometricneko/nurikabe10x10
- Codigo de reproduccion: https://github.com/isomorphicdude/gemma/tree/sudoku-sft
- Notebook de visualizacion: https://github.com/isomorphicdude/gemma/blob/sudoku-sft/gemma/diffusion/hackable_diffusion_adapter/nurikabe_trajectory_video_colab.ipynb
- Modelo base: https://huggingface.co/google/diffusiongemma-26B-A4B-it
