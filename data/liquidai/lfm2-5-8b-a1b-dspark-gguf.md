# LiquidAI/LFM2.5-8B-A1B-DSpark-GGUF

## Resumen

LFM2.5-8B-A1B-DSpark-GGUF es un modelo auxiliar (draft sidecar) desarrollado por Liquid AI para acelerar la inferencia del modelo objetivo LFM2.5-8B-A1B mediante decodificación especulativa DSpark. No es un modelo generativo autónomo: contiene únicamente el drafter (5 capas de atención, head de Markov de rango 256, head de confianza y block size 9) y comparte los embeddings y la cabeza de lenguaje con el modelo objetivo en tiempo de carga. Está empaquetado en formato GGUF para su uso con llama.cpp, donde la integración DSpark ya está disponible en la rama principal.

El modelo resuelve el problema del cuello de botella de memoria en la fase de decodificación de los LLM, que limita el throughput en GPUs y dispositivos edge. Al proponer múltiples tokens por ciclo y verificar su exactitud contra el modelo objetivo, consigue mejoras de throughput de hasta 3.18x en GPU y 2.87x en dispositivos on-device, sin degradar la calidad de salida (la decodificación es exacta: el target verifica cada token propuesto). Su relevancia actual radica en que permite ejecutar modelos de 8B con solo 1.5B activos en hardware modesto, manteniendo una ventana de contexto de 128K y capacidades de razonamiento y tool calling.

El repositorio contiene tres cuantizaciones del drafter (F16, Q8_0 y Q4_K_M) con tamaños de 664 MB, 349 MB y 191 MB respectivamente. La cuantización del drafter apenas afecta a la velocidad (el drafter es una fracción pequeña de cada ciclo), pero la cuantización del modelo objetivo es el factor principal de rendimiento y calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter DSpark: 5 capas de atención, head de Markov de rango 256, head de confianza, block size 9 |
| Parametros totales | 327.707.521 (solo drafter; el modelo objetivo LFM2.5-8B-A1B tiene 8B totales, 1.5B activos) |
| Parametros activos | No aplica (el drafter se ejecuta completo en cada ciclo) |
| Longitud de contexto | No disponible en esta ficha; el modelo objetivo soporta 128K |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (del drafter) |
| Idiomas soportados | No disponibles |
| Licencia | lfm1.0 (licencia propia de Liquid AI, no OSI-approved) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El drafter DSpark es un modelo ligero diseñado específicamente para decodificación especulativa. Su arquitectura combina 5 capas de atención con un head de Markov de rango 256 que predice secuencias de tokens basándose en el contexto reciente, y un head de confianza que estima la probabilidad de aceptación de cada token propuesto. El block size de 9 tokens limita el número máximo de propuestas por ciclo, y el sistema lee este valor de los metadatos del sidecar (n-max se ajusta automáticamente).

El entrenamiento del drafter no se detalla en la información disponible, pero el modelo se publica como un componente complementario del LFM2.5-8B-A1B, que es un Mixture-of-Experts con 8B parámetros totales y 1.5B activos, entrenado con 128K de contexto y capacidades de razonamiento chain-of-thought. La integración DSpark está open-sourced en llama.cpp y SGLang, y la decodificación es exacta: el modelo objetivo verifica cada token propuesto, por lo que la salida greedy es idéntica a la del target sin el drafter.

## Capacidades

- Aceleración de inferencia: mejora el throughput hasta 3.18x en GPU (H100) y 2.87x en dispositivos on-device (Apple silicon) frente al modelo objetivo sin DSpark.
- Decodificación especulativa exacta: la verificación del target garantiza que la salida greedy coincide con la del modelo objetivo solo.
- Compatibilidad con llama.cpp: integración en la rama principal (PR #25173), con soporte para `--spec-type draft-dspark` y parámetros `--spec-draft-n-max` y `--spec-draft-n-min`.
- Compartición de embeddings y LM head: el drafter no duplica estas capas, reduciendo el coste de memoria adicional.
- Múltiples cuantizaciones del drafter: F16, Q8_0 y Q4_K_M, con degradación mínima de la tasa de aceptación (2-3% respecto a F16).
- No es un modelo generativo autónomo: requiere emparejarse con el archivo GGUF del target LFM2.5-8B-A1B.

## Casos de uso

- Despliegue de agentes en dispositivos edge: el drafter permite ejecutar LFM2.5-8B-A1B en hardware limitado (portátiles, MacBooks) con un throughput suficiente para tareas de razonamiento multi-paso y tool calling, gracias a la aceleración de 2.87x on-device.
- Servidores de inferencia de alto rendimiento: en GPUs como H100, el drafter eleva el throughput hasta 3.18x, lo que reduce el coste por petición en entornos de producción con alta concurrencia.
- Aplicaciones de chat con baja latencia: al proponer hasta 9 tokens por ciclo, la latencia percibida por el usuario final disminuye notablemente en comparación con la decodificación autoregresiva estándar.
- Integración en pipelines de generación de código: el modelo objetivo soporta tool calling y razonamiento, y el drafter acelera la generación de código sin alterar la calidad, útil en asistentes de programación en tiempo real.
- Evaluación de modelos en entornos de investigación: la decodificación exacta permite comparar el rendimiento del target con y sin DSpark sin introducir sesgos por cambios en la salida.
- Prototipado rápido en llama.cpp: el formato GGUF y la integración en la rama principal facilitan probar DSpark en entornos locales con `llama-server`, sin necesidad de infraestructura especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible de esta ficha. La model card remite al repositorio del modelo base (`LiquidAI/LFM2.5-8B-A1B-DSpark`) para tablas de aceptación (H100 y Apple silicon) y benchmarks del target. El blog de Liquid AI reporta mejoras de throughput de hasta 3.18x en GPU y 2.87x on-device, y la tasa de aceptación del drafter se degrada solo un 2-3% al pasar de F16 a Q8_0 o Q4_K_M. No se proporcionan cifras de MMLU, HumanEval u otros benchmarks en esta página.

## Requisitos de hardware

- VRAM estimada: el drafter en F16 ocupa 664 MB; en Q8_0, 349 MB; en Q4_K_M, 191 MB. A esto hay que sumar la VRAM del modelo objetivo (LFM2.5-8B-A1B, que con 1.5B activos cabe en GPUs consumer con cuantización).
- GPU recomendadas: el drafter es ligero y puede ejecutarse en cualquier GPU con soporte CUDA o Metal; el modelo objetivo determina los requisitos reales. Se ha validado en H100 y Apple silicon.
- Compatibilidad con consumer GPUs: sí, el drafter cabe en GPUs de 4 GB o menos; el conjunto completo (target + drafter) puede ejecutarse en GPUs de 8-12 GB con cuantización adecuada del target.
- Opciones de despliegue: llama.cpp (llama-server con `-md` y `--spec-type draft-dspark`), SGLang (integración open-source), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se proporcionan cifras exactas en esta ficha; el blog reporta hasta 3.18x de mejora de throughput en GPU y 2.87x on-device, pero los valores absolutos dependen del hardware y la cuantización del target.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| LFM2.5-8B-A1B-DSpark-GGUF | Drafter DSpark | 327.7M | No disponible (target: 128K) | lfm1.0 | GGUF | Requiere target LFM2.5-8B-A1B |
| LFM2.5-1.2B-Instruct-DSpark-GGUF | Drafter DSpark | No disponible | No disponible | lfm1.0 | GGUF | Para target 1.2B |
| LFM2.5-2.6B-DSpark-GGUF | Drafter DSpark | No disponible | No disponible | lfm1.0 | GGUF | Para target 2.6B |
| LFM2.5-8B-A1B (sin DSpark) | MoE generativo | 8B totales, 1.5B activos | 128K | lfm1.0 | Safetensors/GGUF | Modelo objetivo, sin aceleración |

No se dispone de comparativas con drafters de otros fabricantes (p. ej., EAGLE, Medusa) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: el drafter no puede generar texto por sí mismo; debe emparejarse con el archivo GGUF del target LFM2.5-8B-A1B. Usarlo de forma aislada no produce salidas útiles.
- Licencia restrictiva: la licencia lfm1.0 no es OSI-approved y puede imponer restricciones al uso comercial; es necesario revisar los términos completos antes de desplegar en producción.
- Cuantización del drafter: las cuantizaciones sub-4-bit (por debajo de Q4_K_M) degradan notablemente la tasa de aceptación y el throughput; se recomienda no usar cuantizaciones inferiores a Q4_K_M.
- Dependencia de la integración: la funcionalidad DSpark requiere una versión de llama.cpp con soporte para `--spec-type draft-dspark` (PR #25173); versiones antiguas no lo soportan.
- Idiomas y sesgos: no se dispone de información sobre los idiomas soportados ni sobre sesgos potenciales del drafter; estos dependen del modelo objetivo.
- Riesgo de alucinación: al ser un componente de aceleración, no introduce alucinaciones adicionales, pero hereda las del modelo objetivo; la decodificación exacta garantiza que la salida es idéntica a la del target.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-DSpark-GGUF
- Modelo base (target): https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Blog de Liquid AI sobre DSpark: https://www.liquid.ai/blog/lfm2.5-dspark
- Blog de Hugging Face sobre LFM2.5-DSpark: https://huggingface.co/blog/LiquidAI/lfm25-dspark
- Documentación de LFM2.5-8B-A1B: https://docs.liquid.ai/lfm/models/lfm25-8b-a1b
- Blog de LFM2.5-8B-A1B: https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentación general de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- LEAP (plataforma de Liquid AI): https://leap.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
