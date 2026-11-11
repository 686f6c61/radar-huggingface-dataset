# scottlowry/Swift-1.5-Qwen3.8-27b-oQ6e-mtp

## Resumen

Swift-1.5-Qwen3.8-27b-oQ6e-mtp es una cuantización mixta del modelo ukisai/Swift-1.5-Qwen3.8-27b, publicada por el usuario scottlowry en Hugging Face. Se trata de un checkpoint de 27.781 millones de parámetros convertido al formato MLX mediante la herramienta oQ (oMLX v0.7.4.dev1), que aplica precisión mixta por tensor en lugar de una cuantización uniforme. El resultado es un peso efectivo medio de 6,872 bits por parámetro, lo que reduce el almacenamiento a 22,226 GiB frente a los aproximadamente 55 GB que ocuparía el modelo en BF16.

El modelo base pertenece a la familia Qwen3.5 (tag `qwen3_5`), e incorpora tres componentes diferenciados: el modelo de lenguaje (26.896B parámetros), un codificador visual (0.461B) y una cabeza MTP (Multi-Token Prediction, 0.425B). La presencia de visión y de decodificación multi-token lo sitúa en la categoría de modelos multimodales con aceleración de inferencia especulativa. La cuantización está pensada para ejecutarse en hardware Apple Silicon mediante MLX.

La relevancia de esta ficha radica en que permite desplegar un modelo de casi 28B parámetros multimodales en equipos con memoria unificada de 32 GB o superior, algo inviable con los pesos originales. El autor actualizó el checkpoint el 11 de noviembre de 2026, por lo que las copias anteriores deben descartarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5) con vision encoder y cabeza MTP; no se detalla la configuracion interna |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta oQ: affine 6-bit grupo 64 (88,345% de los pesos), affine 8-bit grupo 64 (9,798%), BF16 (1,857%); media efectiva 6,872 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); repo de 71,3 GB |
| Parametros por componente | Lenguaje 26.896B; vision 0.461B; MTP 0.425B |
| Almacenamiento efectivo | 22,226 GiB (23,865 GB) |
| Herramienta de cuantizacion | oQ / oMLX v0.7.4.dev1 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia Qwen3.5 y de la presencia de tres subcomponentes: un modelo de lenguaje de 26.896B parametros, un codificador visual de 0.461B y una cabeza MTP de 0.425B. La cabeza MTP (Multi-Token Prediction) es una innovacion orientada a la decodificacion especulativa: permite predecir varios tokens por paso y verificar despues, lo que incrementa el throughput en inferencia autoregresiva. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

El checkpoint publicado no es un modelo entrenado desde cero, sino una re-cuantizacion del modelo ukisai/Swift-1.5-Qwen3.8-27b. La tecnica oQ asigna precision de forma no uniforme: el 88,345% de los pesos (24.543B) se almacena en affine 6-bit con grupo de 64, el 9,798% (2.722B) en affine 8-bit y el 1,857% (0.516B) se mantiene en BF16. Esta distribucion preserva en mayor precision las capas presumiblemente mas sensibles, mientras comprime agresivamente el resto. El resultado son 22,226 GiB de almacenamiento con un peso efectivo de 6,872 bits.

## Capacidades

- Generacion de texto y razonamiento: el modelo de lenguaje de 26.896B parametros soporta tareas generativas generales.
- Procesamiento de vision: incluye un codificador visual de 0.461B parametros, lo que habilita entrada de imagenes junto con texto.
- Decodificacion multi-token (MTP): la cabeza de 0.425B permite prediccion especulativa de varios tokens, acelerando la generacion.
- Inferencia en Apple Silicon: el formato MLX esta optimizado para GPUs integradas de la serie M de Apple.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Modo thinking: no disponible.

## Casos de uso

- Asistente multimodal local en Mac: el modelo puede procesar imagenes y texto en un equipo con memoria unificada de 32 GB o mas, gracias a sus 22,2 GiB de pesos cuantizados, sin necesidad de GPU dedicada.
- Analisis de documentos con imagenes: al incorporar vision encoder, puede extraer informacion de capturas, diagramas o formularios escaneados junto con el texto asociado, en flujos de trabajo offline.
- Generacion de texto acelerada por MTP: la cabeza de prediccion multi-token reduce el numero de pasos de decodificacion, lo que resulta util en tareas de generacion larga como redaccion de informes o resumenes extensos.
- Prototipado e investigacion en entornos MLX: sirve como banco de pruebas para estudiar el impacto de la cuantizacion mixta oQ (6/8/BF16) en la calidad de salida frente al modelo original.
- Desarrollo de aplicaciones de escritorio con privacidad: al ejecutarse localmente en Apple Silicon, permite construir asistentes que no envian datos a la nube, adecuado para sectores con requisitos de confidencialidad.
- Evaluacion comparativa de tecnicas de cuantizacion: investigadores pueden contrastar este checkpoint de 6,872 bits/peso con versiones de 4 bits u 8 bits del mismo modelo base para medir la degradacion en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 22,226 GiB solo para los pesos; con overhead de contexto y cache KV se recomienda un minimo de 32 GB de memoria unificada.
- GPU recomendadas: chips Apple Silicon con 32 GB o mas de memoria unificada (M1 Max, M2 Max, M2 Ultra, M3 Max, M3 Ultra, M4 Max y superiores). El formato MLX no esta pensado para GPU NVIDIA o AMD.
- Compatibilidad con GPU de consumo: si, en el ecosistema Apple Silicon; no es compatible de forma nativa con RTX 4090 u otras GPU discretas al estar empaquetado en MLX.
- Opciones de despliegue: MLX (libreria `mlx`), oMLX. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado el formato especifico.
- Latencia y throughput: no disponibles. La cabeza MTP esta disenada para mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b-oQ6e-mtp | 27,781B | no disponible | Mixta oQ 6,872 bits/peso | MLX safetensors | no disponible |
| ukisai/Swift-1.5-Qwen3.8-27b (base) | 27,781B | no disponible | BF16 | safetensors | no disponible |
| Otros modelos Qwen3.5 de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada. La comparacion mas directa posible es con el modelo base sin cuantizar, del que este checkpoint deriva.

## Limitaciones y advertencias

- La cuantizacion mixta a 6,872 bits/peso puede introducir degradacion en tareas sensibles a la precision numerica, como matematicas o generacion de codigo, respecto al modelo en BF16.
- La licencia no esta declarada en la informacion disponible, por lo que no puede confirmarse el uso comercial; es imprescindible verificar la licencia del modelo base ukisai/Swift-1.5-Qwen3.8-27b antes de desplegarlo en produccion.
- El checkpoint esta atado al ecosistema MLX y a hardware Apple Silicon; no es portable a stacks de inferencia convencionales sin reconversion.
- El autor indica que el modelo se re-cuantizo el 11 de noviembre de 2026 y recomienda volver a descargarlo; versiones anteriores pueden presentar diferencias.
- No se dispone de informacion sobre sesgos, idiomas soportados ni tasas de alucinacion.
- El repo ocupa 71,3 GB, muy por encima de los 22,226 GiB de pesos efectivos, lo que implica requisitos de almacenamiento considerables durante la descarga.
- No se han publicado benchmarks que permitan validar la calidad del checkpoint cuantizado frente al original.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Swift-1.5-Qwen3.8-27b-oQ6e-mtp
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Documentacion de MLX: no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
