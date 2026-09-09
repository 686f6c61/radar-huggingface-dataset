# dakerholdings/MiniCPM5-2B-mixed_4_8_16-mlx

## Resumen

El modelo `dakerholdings/MiniCPM5-2B-mixed_4_8_16-mlx` es una conversión cuantizada en formato MLX del modelo `openbmb/MiniCPM5-2B`, publicado por el usuario dakerholdings en Hugging Face. Se trata de una versión optimizada para ejecutarse sobre Apple Silicon mediante el runtime `mlx_lm`, con una receta de cuantización mixta de 4, 8 y 16 bits denominada `mixed_4_8_16`. El modelo base, desarrollado por OpenBMB, es un Transformer denso de 2.52 mil millones de parámetros orientado a despliegue local y escenarios con recursos limitados. Esta conversión concreta reduce el uso de memoria manteniendo un rendimiento práctico en generación de texto, tal como muestra el ejemplo incluido en el repositorio, donde se obtienen 20.784 tokens por segundo en un MacBook Air con Apple M1.

La relevancia de este modelo radica en la creciente demanda de modelos pequeños y eficientes para aplicaciones on-device, especialmente en ecosistemas con memoria unificada. La publicación de esta variante MLX cuantizada permite a desarrolladores e investigadores experimentar con el modelo completo en equipos Apple sin necesidad de hardware dedicado. No obstante, la información disponible en el repositorio es limitada: no se han publicado licencia, idiomas soportados ni benchmarks oficiales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo llama) con componentes SSM (no confirmado) |
| Parametros totales | 2.516.756.480 (2.52B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta 4/8/16: 4-bit para FFN medio, 8-bit para proyecciones de atención/mixer y FFN de borde, 8-bit para `ssm_alpha`/`ssm_beta`, FP16 para normas y tensores `ssm_conv1d`, `ssm_a`, `ssm_dt` |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

La arquitectura declarada en el repositorio es `llama`, pero la receta de cuantización menciona explícitamente tensores típicos de state space models (`ssm_alpha`, `ssm_beta`, `ssm_conv1d`, `ssm_a`, `ssm_dt`), lo que sugiere que el modelo original incorpora módulos SSM además de atención o que fue modificado para incluirlos. Sin información adicional, la arquitectura exacta no está confirmada. El modelo base `openbmb/MiniCPM5-2B` se describe en la documentación de OpenBMB como un Transformer denso de 2B, construido para escenarios on-device y de despliegue local. No se ha facilitado información sobre el proceso de entrenamiento, número de tokens, composición del dataset ni uso de técnicas como RLHF o DPO. Tampoco hay datos sobre la conversión desde GGUF, salvo que el repositorio indica que es una "MLX conversion of a GGUF model".

## Capacidades

- Generación de texto en inglés, según el ejemplo incluido en el README, aunque no se especifica el conjunto de idiomas soportados.
- Integración directa con `mlx_lm`, tanto desde Python como desde la interfaz de línea de comandos (`mlx_lm.generate`).
- Razonamiento básico en preguntas matemáticas: el ejemplo muestra una respuesta explicativa sobre la raíz cuadrada de 2, con un desglose paso a paso.
- Cuantización mixta que permite ejecutar el modelo con un pico de memoria de 2.430 GB en un MacBook Air M1, lo que lo hace apto para equipos con 4 GB de RAM o más.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-step más allá del ejemplo citado.
- No se han publicado datos sobre capacidades de visión, audio ni otros modos multimodales.

## Casos de uso

- Asistente local en macOS: gracias a su bajo consumo de memoria (~2.4 GB) y al formato MLX, el modelo puede ejecutarse en un MacBook Air M1 sin conexión a internet, permitiendo consultas básicas y redacción de texto en aplicaciones de escritorio.
- Prototipado rápido en Apple Silicon: se integra con `mlx_lm` y permite experimentar con prompts, parámetros de generación y estrategias de cuantización sin necesidad de GPU dedicada.
- Investigación en cuantización: la receta `mixed_4_8_16` es un ejemplo práctico de cómo asignar presupuesto de bits a distintas capas (FFN, atención y módulos SSM), útil para comparar el impacto de la precisión en modelos híbridos.
- Generación de texto para documentación interna: el modelo puede redactar resúmenes cortos, párrafos de soporte o respuestas a preguntas frecuentes en sistemas ligeros, siempre que la tarea no requiera contexto largo.
- Integración en aplicaciones de escritorio macOS: al ser un modelo MLX con safetensors, se puede cargar directamente en Python y empaquetar como dependencia de un servicio o herramienta local.
- Educación y demostraciones: ofrece una forma sencilla de mostrar generación de texto y razonamiento básico en entornos con recursos limitados, sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento incluido en el repositorio corresponde a una prueba de generación en un MacBook Air con Apple M1, con los siguientes valores orientativos:

| Metrica | Valor |
|---|---|
| Velocidad de procesamiento del prompt | 65.858 tokens/seg |
| Velocidad de generacion | 20.784 tokens/seg |
| Pico de memoria | 2.430 GB |
| Tokens en el prompt | 20 |
| Tokens generados | 200 |

Estos datos no son un benchmark estandarizado y no permiten comparar el modelo con alternativas de la misma categoría.

## Requisitos de hardware

- Memoria unificada estimada: 2.430 GB de pico en la prueba con Apple M1, por lo que 4 GB de RAM son suficientes para esta carga concreta.
- Chip requerido: Apple Silicon (M1 o posterior), ya que MLX depende del framework Metal.
- No requiere GPU dedicada; es compatible con MacBook, Mac mini y otros equipos Apple con chips de la serie M.
- Despliegue: exclusivamente mediante `mlx_lm` en entornos Python con MLX instalado. No se ofrece soporte para vLLM, llama.cpp, Ollama, TGI u otros runtimes sin una reconversión adicional.
- Latencia y throughput: los valores anteriores (20.784 tokens/seg) son orientativos para un modelo de 2.52B cuantizado en MLX sobre un Apple M1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| dakerholdings/MiniCPM5-2B-mixed_4_8_16-mlx | 2.52B | No disponible | MLX cuantizado | No disponible |
| openbmb/MiniCPM5-2B | 2.52B | No disponible | No disponible | No disponible |
| openbmb/MiniCPM5-2B-MLX | No disponible | No disponible | MLX | No disponible |
| openbmb/MiniCPM5-2B-GGUF | No disponible | No disponible | GGUF | No disponible |

No se han publicado datos comparativos de rendimiento, benchmarks o contextos en la información disponible para estos modelos, por lo que no es posible realizar una evaluación cuantitativa.

## Limitaciones y advertencias

- La licencia del modelo no está publicada; no se puede confirmar si el uso comercial está permitido, por lo que se recomienda verificar este punto antes de utilizarlo en producción.
- No se ha especificado la longitud de contexto, lo que impide conocer si el modelo soporta documentos largos o conversaciones multi-turno extensas.
- Los idiomas soportados son desconocidos; el ejemplo de generación está en inglés, pero la fiabilidad fuera de este idioma no está garantizada.
- La cuantización mixta puede introducir pérdida de calidad en las respuestas. Aunque el repositorio indica que el modelo está verificado, no hay benchmarks públicos que respalden esta afirmación.
- El modelo está optimizado para MLX y Apple Silicon; en otros ecosistemas (GPUs NVIDIA, llamacpp, etc.) requiere conversión adicional y no se puede usar directamente.
- No se dispone de información sobre sesgos, riesgos de alucinación o comportamientos adversos. Al tratarse de un modelo de 2B, es esperable que tenga capacidades más limitadas que modelos grandes, pero no hay datos empíricos que lo confirmen.
- El repositorio no incluye información sobre la composición de los datos de entrenamiento, lo que dificulta evaluar su alineación con casos de uso específicos.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/dakerholdings/MiniCPM5-2B-mixed_4_8_16-mlx
- Modelo base en Hugging Face: https://huggingface.co/openbmb/MiniCPM5-2B
- Conversión oficial MLX del modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-MLX
- Modelo base en formato GGUF: https://huggingface.co/openbmb/MiniCPM5-2B-GGUF
- Repositorio del proyecto OpenBMB/MiniCPM: https://github.com/OpenBMB/MiniCPM
