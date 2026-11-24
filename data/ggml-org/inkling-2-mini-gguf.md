# ggml-org/Inkling-2-Mini-GGUF

## Resumen

Inkling 2 Mini es un modelo multimodal de tipo imagen-texto-a-texto desarrollado originalmente por Thinking Machines y distribuido en formato GGUF por el repositorio `ggml-org`. Se trata de un modelo de mezcla de expertos (MoE) con 26.070 millones de parámetros totales, diseñado para entrada de imagen y texto, y pensado para ejecutarse localmente mediante `llama.cpp` y la aplicación `llama.app`. Su relevancia actual radica en que combina una arquitectura MoE con bucle de capas (looped MoE) y capacidades de visión dentro de un tamaño manejable para hardware de consumo cuando se cuantiza a 4 bits.

La innovación principal es su estructura de "loop core": de las 24 capas del modelo, las capas 6 a 17 se ejecutan 3 veces por token, de modo que cada token atraviesa 48 evaluaciones de capa utilizando los pesos de solo 24. Esto permite aumentar la profundidad efectiva del razonamiento sin incrementar el número de parámetros. El checkpoint original almacena los expertos enrutados en NVFP4 (capas 0-19) y MXFP8 (capas 20-23), y las versiones GGUF ofrecen cuantizaciones desde BF16 hasta IQ4_NL calibrada con imatrix.

El modelo incluye un codificador de visión (mmproj) y un parámetro `reasoning_effort` que permite ajustar la profundidad de razonamiento entre `none` y `max`. El repositorio acumula cerca de 500.000 descargas, lo que indica una adopción considerable en la comunidad de inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle de capas (looped mixture-of-experts) |
| Parametros totales | 26.070.385.152 (26,07 mil millones) |
| Parametros activos | 8 expertos activos por token de 128 totales (número de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, IQ4_NL (calibrada con imatrix); mmproj en BF16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Inkling 2 Mini es un modelo de mezcla de expertos con 128 expertos enrutados de los cuales se activan 8 por token. Consta de 24 capas, pero las capas 6 a 17 forman un "loop core" que se ejecuta 3 veces por token, lo que resulta en 48 evaluaciones de capa efectivas con los pesos de 24. Cada pasada del bucle mantiene su propia caché KV y de convolución, un detalle relevante para la gestión de memoria durante la inferencia. El checkpoint original almacena los expertos enrutados de las capas 0-19 en NVFP4 y los de las capas 20-23 en MXFP8; las versiones BF16 de los GGUF hacen upcast de esos expertos a BF16.

La cuantización IQ4_NL de este repositorio cuantiza los expertos NVFP4 (`ffn_gate_up_exps` y `ffn_down_exps` de las capas 0-19) a IQ4_NL y mantiene el resto de matrices en Q8_0, con los pesos del controlador del bucle en F32. La calibración imatrix se calculó a partir del BF16 sobre los datos de calibración v6 de bartowski, con las conversaciones renderizadas mediante la plantilla de chat del modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imagen (image-text-to-text) mediante codificador de visión mmproj.
- Razonamiento con profundidad ajustable mediante `reasoning_effort`: `none`, `minimal`, `low`, `medium`, `high` (por defecto), `xhigh`, `max`, o un valor numérico entre 0.0 y 0.99.
- Arquitectura MoE con 8 expertos activos por token, orientada a eficiencia computacional.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de ejecución local mediante `llama.cpp` y `llama serve`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el ajuste de `reasoning_effort` sugiere capacidad de razonamiento extendido.

## Casos de uso

- Asistente conversacional local con entrada de imagen: el modelo puede recibir una imagen junto con una pregunta y generar una respuesta textual, adecuado para aplicaciones de escritorio o entornos sin conexión gracias a su despliegue vía `llama.cpp`.
- Análisis de documentos y capturas: al aceptar image-text-to-text, puede procesar capturas de pantalla, diagramas o documentos escaneados y responder preguntas sobre su contenido.
- Razonamiento ajustable según la tarea: con `reasoning_effort` se puede configurar en `none` o `minimal` para respuestas rápidas de baja latencia, o en `high`/`max` para problemas que requieren cadenas de razonamiento más largas.
- Despliegue en hardware de consumo: la cuantización IQ4_NL de 17,6 GB permite ejecutar el modelo en GPUs con 24 GB de VRAM o en configuraciones con memoria unificada, algo inviable con el BF16 de 52,2 GB.
- Prototipado de aplicaciones multimodales: el tag `endpoints_compatible` y el formato GGUF facilitan la integración en servicios de inferencia compatibles con la API de endpoints.
- Investigación sobre arquitecturas MoE con bucle: el modelo sirve como caso de estudio para evaluar el impacto del "loop core" en calidad frente a coste computacional, comparando las distintas cuantizaciones y niveles de `reasoning_effort`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento proporcionados son métricas de fidelidad de cuantización:

| Cuantizacion | Tamano | Divergencia KL vs BF16 (wikitext-2, 40 x 512 tokens) | Coincidencia top token |
|---|---|---|---|
| Q8_0 | 27,8 GB | 0,0030 | 97,6% |
| IQ4_NL | 17,6 GB | 0,0095 | 95,5% |
| BF16 | 52,2 GB | referencia | referencia |

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 requiere aproximadamente 52,2 GB; Q8_0 unos 27,8 GB; IQ4_NL unos 17,6 GB. Añadir el codificador de visión mmproj (642 MB en BF16 o 346 MB en Q8_0).
- GPU recomendadas: para BF16, GPUs de 80 GB como A100 o H100; para Q8_0, GPUs de 32-40 GB como A100 40 GB; para IQ4_NL, GPUs de 24 GB como RTX 4090 o RTX 3090.
- Cabe en GPU de consumo: sí, con la cuantización IQ4_NL en GPUs de 24 GB de VRAM (RTX 4090, RTX 3090) o en sistemas con memoria unificada suficiente.
- Opciones de despliegue: `llama.cpp` mediante `llama serve -hf ggml-org/Inkling-2-Mini-GGUF:IQ4_NL`, y `llama.app`. Otros motores compatibles con GGUF no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los datos disponibles no permiten establecer una comparativa fiable con alternativas de la misma categoría (MoE multimodal de ~26 mil millones de parámetros) en términos de parámetros, contexto, rendimiento o licencia.

| Modelo | Parametros totales | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Inkling 2 Mini | 26,07 mil millones | no disponible | no disponible | GGUF / safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no está disponible en la información proporcionada, por lo que no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base `thinkingmachines/Inkling-2-Mini` antes de usarlo en producción.
- Los idiomas soportados no están documentados; no se puede garantizar un rendimiento adecuado fuera de los idiomas con los que fue entrenado.
- La longitud de contexto no está especificada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- El modelo es una cuantización GGUF del checkpoint original; las cuantizaciones IQ4_NL introducen una divergencia KL de 0,0095 y una coincidencia de top token del 95,5% frente a BF16, lo que implica una pérdida de calidad medible.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a los modelos generativos.
- Sesgos conocidos: no documentados en la información proporcionada.
- La arquitectura de bucle con cachés KV y de convolución independientes por pasada puede complicar la gestión de memoria en despliegues con contexto largo.
- El uso de `reasoning_effort` alto o máximo incrementa el coste computacional por token, ya que implica más pasadas de razonamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Aplicación llama.app: https://llama.app
- Datos de calibración de bartowski: https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a
- Archivo imatrix: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF/blob/main/imatrix.gguf
