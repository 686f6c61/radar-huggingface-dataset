# ghostrider0470/Qwen3.8-27B-RFT-v1-mlx-4bit

## Resumen

Qwen3.8-27B-RFT-v1-mlx-4bit es una cuantizacion en 4 bits (4,5 bits por peso) del modelo Qwen3.8-27B-RFT-v1, publicada por el usuario ghostrider0470. El modelo base es un ajuste fino (RFT, presumiblemente rejection fine-tuning o reinforcement fine-tuning) sobre la familia Qwen3.5, con 26.895.993.856 parametros totales (aproximadamente 27B). Esta version esta especificamente empaquetada para Apple Silicon mediante la libreria MLX, con conversion realizada con mlx-lm 0.32.2.

La relevancia de esta publicacion es acotada pero practica: permite ejecutar un modelo de ~27B en equipos Mac con memoria unificada de 48 GB, con un consumo medido de aproximadamente 15,6 GB de memoria pico y una velocidad de generacion de unos 31 tokens por segundo en un prompt corto de prueba. Es una build unicamente de texto: la torre de vision del modelo base no forma parte de esta cuantizacion.

No se dispone de informacion publicada sobre el proceso de entrenamiento del modelo base, la composicion del dataset, el contexto maximo soportado ni los idiomas cubiertos. La licencia es Apache 2.0, heredada del modelo base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 11 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 26.895.993.856 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (4,5 bits por peso) en formato MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, libreria `mlx`) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.5, segun la etiqueta `qwen3_5` del repositorio, lo que sugiere una arquitectura transformer decoder-only con las innovaciones propias de esa generacion de Qwen. Sin embargo, no se proporciona informacion sobre el numero de capas, dimensiones ocultas, mecanismo de atencion (estandar, GQA o lineal), ni sobre si incorpora componentes MoE. El sufijo "RFT" en el nombre del modelo base sugiere un ajuste fino por refuerzo o por rechazo de candidatos, pero no se documenta el metodo, los datos ni el proceso.

La informacion disponible sobre entrenamiento es practicamente nula: no se indica el numero de tokens de preentrenamiento, la composicion del corpus, ni si hubo fases de RLHF o DPO. La unica innovacion tecnica documentada es la propia cuantizacion: conversion a 4,5 bits por peso con mlx-lm 0.32.2, orientada a inferencia eficiente en Apple Silicon mediante memoria unificada. El autor indica explicitamente que no se ha comparado el rendimiento de la version cuantizada contra el modelo sin cuantizar.

## Capacidades

- Generacion de texto conversacional, segun el pipeline `text-generation` y la etiqueta `conversational`.
- Capacidad de razonamiento y codigo: no documentada explicitamente, pero plausible por la familia Qwen3.5; no confirmada en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta relleno).
- Vision: no incluida en esta build (la torre de vision se excluye explicitamente).
- Modo thinking: no disponible.
- Audio: no disponible.

## Casos de uso

- Prototipado local en Mac: desarrolladores con un Mac de 48 GB de memoria unificada pueden ejecutar el modelo con `mlx_lm.chat` para experimentar con generacion de texto conversacional sin depender de la nube, con un consumo pico medido de 15,6 GB.
- Asistente de escritura offline: al ejecutarse localmente, el modelo es adecuado para tareas de redaccion y reescritura de texto en entornos sin conexion o con requisitos de privacidad, siempre que se valide la calidad en el idioma objetivo.
- Generacion de texto por lotes en equipos Apple: con ~31 tokens/s medidos en un prompt corto, es viable para procesar volumenes moderados de texto en un Mac Studio o MacBook Pro de gama alta.
- Evaluacion comparativa de cuantizaciones: util como referencia para medir el impacto de la cuantizacion 4-bit MLX frente al modelo base, aunque el autor no haya publicado esa comparacion.
- Base para ajuste fino ligero en MLX: al estar en formato MLX y con licencia Apache 2.0, puede servir como punto de partida para experimentos de fine-tuning o LoRA en Apple Silicon, sujeto a la memoria disponible.
- Demos y pruebas de concepto conversacionales: integrable en aplicaciones de chat locales mediante la API de mlx-lm, sin coste de inferencia por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta metricas de inferencia medidas en un Mac de 48 GB: aproximadamente 31 tokens por segundo de generacion y 15,6 GB de memoria pico, sobre un prompt corto de prueba. No se ha comparado con el modelo sin cuantizar.

## Requisitos de hardware

- VRAM/memoria estimada: ~15,6 GB de memoria pico medida en un Mac de 48 GB; el repo ocupa 15,2 GB.
- GPU recomendadas: Apple Silicon con memoria unificada; el autor reporta mediciones en un Mac de 48 GB. No se documentan pruebas en GPU NVIDIA.
- Cabe en consumer GPU: no confirmado para NVIDIA; en Apple Silicon requiere un equipo con al menos ~16-20 GB de memoria unificada disponible, aunque no se ha verificado en configuraciones menores de 48 GB.
- Opciones de despliegue: `mlx-lm` (version 0.32.2 usada para la conversion) mediante `mlx_lm.chat`. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato es MLX.
- Latencia y throughput: ~31 tokens/s de generacion en un Mac de 48 GB con prompt corto; no se reportan metricas de prefill ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-RFT-v1-mlx-4bit | ~27B | no disponible | MLX 4-bit | Apache 2.0 | Build solo texto para Apple Silicon; ~31 tok/s en Mac de 48 GB |
| Qwen3.8-27B-RFT-v1 (base) | ~27B | no disponible | safetensors | Apache 2.0 | Modelo sin cuantizar; incluye torre de vision; sin benchmarks publicados |
| Otros modelos Qwen3.5 de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo unicamente de texto: la torre de vision del modelo base no esta incluida, por lo que no puede procesar imagenes.
- Sin benchmarks publicados: no hay evidencia de calidad en MMLU, HumanEval, GSM8K ni otras tareas; el autor no compara con el modelo sin cuantizar.
- Cuantizacion 4-bit: la perdida de calidad frente al modelo base no ha sido medida ni documentada.
- Idiomas no declarados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas sin evaluacion previa.
- Contexto desconocido: se desconoce la ventana de contexto maxima, lo que impide planificar casos de uso con documentos largos.
- Repositorio sin traccion: 0 descargas y 0 likes; no hay evidencia de uso comunitario ni de validacion independiente.
- Procedencia del modelo base incierta: el modelo base lo publica el mismo usuario (ghostrider0470) y no se documenta el proceso RFT, los datos ni la evaluacion.
- Licencia Apache 2.0: permite uso comercial, pero al ser una build derivada de un modelo base del mismo autor, conviene verificar la licencia y condiciones del modelo base antes de producción.
- Riesgo de alucinacion: no evaluado; aplicable el riesgo habitual de los modelos generativos sin datos de calibracion.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/ghostrider0470/Qwen3.8-27B-RFT-v1-mlx-4bit
- Modelo base: https://huggingface.co/ghostrider0470/Qwen3.8-27B-RFT-v1
- Libreria MLX LM: https://github.com/ml-explore/mlx-lm
- Documentacion de MLX: https://ml-explore.github.io/mlx/
