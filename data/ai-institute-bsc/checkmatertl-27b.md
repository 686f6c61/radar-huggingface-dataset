# AI-Institute-BSC/CheckmateRTL-27B

## Resumen

CheckmateRTL-27B es un modelo de lenguaje denso de 27.000 millones de parámetros desarrollado por el AI Institute del Barcelona Supercomputing Center (BSC), especializado en la generación de testbenches en SystemVerilog para verificación funcional de circuitos digitales. Parte del modelo base Qwen/Qwen3.6-27B y ha sido sometido a un post-entrenamiento específico (SFT seguido de RLVR con GRPO) orientado a una tarea que los modelos de generación de código RTL convencionales suelen dejar de lado: no solo generar el estímulo de prueba, sino también incorporar comprobaciones funcionales que detecten comportamiento incorrecto del diseño bajo verificación (DUT).

El modelo aborda el problema de la verificación basada en cobertura desde la perspectiva del *checking*: dado un diseño RTL y su especificación, razona sobre un plan de pruebas, genera estímulos y añade aserciones y comprobaciones funcionales. Según la model card, alcanza un 37,0 % en estímulo de testbench y un 36,2 % en comprobación funcional en el benchmark CVDP de NVIDIA, por delante de modelos abiertos de hasta 1 billón de parámetros en esas dos categorías, y sus habilidades se transfieren a entornos de codificación agéntica.

Es relevante ahora porque demuestra que un modelo denso de 27B, entrenado con herramientas EDA de código abierto (Icarus Verilog, Verilator, Yosys), puede superar en tareas concretas de verificación a modelos frontera mucho mayores, y porque publica tanto los modelos (27B y 9B) como los datasets de entrenamiento (SystemVerilog-Distill-86k y SystemVerilog-RL-12k) bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.6-27B); pipeline image-text-to-text / text-generation |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; se menciona GLM-5.2-FP8 como baseline, no cuantizaciones propias) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27,36B parámetros construido sobre Qwen/Qwen3.6-27B, con pipeline declarado image-text-to-text y etiqueta de pipeline text-generation. El post-entrenamiento se realizó en dos fases: una fase de *supervised fine-tuning* (SFT) sobre el dataset AI-Institute-BSC/SystemVerilog-Distill-86k (86.000 ejemplos de destilación en SystemVerilog) y una fase de RLVR (reinforcement learning with verifiable rewards) con GRPO sobre AI-Institute-BSC/SystemVerilog-RL-12k (12.000 ejemplos). Los datasets de partida incluyen scale-lab/MetRex y bigcode/the-stack-v2-dedup, además de datos propios de SystemVerilog.

La innovación técnica destacable es el enfoque de post-entrenamiento orientado a *checking* y no solo a cobertura: el modelo aprende a razonar sobre un plan de pruebas, generar estímulo y añadir comprobaciones funcionales que marquen comportamiento incorrecto. El entrenamiento y la evaluación se hicieron íntegramente con herramientas EDA de código abierto (Icarus Verilog, Verilator, Yosys), y la evaluación de CVDP v1.1.0 (estímulo, checking y aserciones) se portó de herramientas EDA comerciales a Verilator, por lo que los resultados no son directamente comparables con los del flujo comercial. Las puntuaciones de aserciones son cotas superiores porque Verilator no soporta completamente la cobertura de aserciones. El modelo se entrenó con tareas de un solo turno, aunque también se evalúa en modo agéntico con OpenCode.

## Capacidades

- Generación de texto y razonamiento sobre especificaciones de hardware y planes de verificación.
- Generación de testbenches en SystemVerilog: estímulo de prueba a partir de un diseño RTL y su especificación.
- Comprobación funcional: incorporación de checks y aserciones que detectan comportamiento incorrecto del DUT.
- Generación de aserciones (assertion generation) en el contexto de verificación de diseño.
- Depuración (debug) de problemas de verificación, con resultados competitivos en CVDP cid016.
- Capacidades de codificación agéntica: se evalúa con OpenCode como harness de agente, sin bucle de feedback de evaluador personalizado.
- Capacidades multimodales declaradas por el pipeline image-text-to-text (entrada imagen-texto), aunque no se detallan en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Generación automática de testbenches en proyectos de verificación de RTL: dado un módulo SystemVerilog y su especificación, el modelo produce estímulo y comprobaciones funcionales, reduciendo el trabajo manual de los ingenieros de verificación; es adecuado porque su entrenamiento se centró específicamente en esta tarea y supera a modelos mayores en CVDP cid012 y cid013.
- Verificación funcional guiada por cobertura: el modelo puede generar testbenches que buscan alcanzar el 100 % de cobertura objetivo, como en AutoEval-ECov, donde obtiene 84,7 % Pass@1, lo que lo hace útil para cerrar huecos de cobertura en bloques ya verificados.
- Integración en pipelines de CI/CD de hardware: al ser un modelo de 27B con pesos safetensors y licencia Apache 2.0, puede desplegarse con vLLM y ejecutarse como servicio de generación de testbenches y checks en cada integración de un diseño, usando herramientas EDA de código abierto para validar la salida.
- Asistencia a ingenieros de verificación en entornos agénticos: evaluado con OpenCode, puede operar como agente que lee el DUT, propone un plan de pruebas, escribe el testbench y depura fallos, lo que encaja en flujos de trabajo tipo copiloto.
- Depuración de fallos de verificación: con 60,6 % en CVDP cid016 (no agéntico) y 46,4 % (agéntico), puede ayudar a diagnosticar por qué un testbench no detecta un bug o por qué falla una comprobación, a partir del código y los mensajes del simulador.
- Generación de aserciones para propiedades de diseño: con 42,4 % en cid014 (no agéntico), puede producir aserciones SystemVerilog que complementen los checks funcionales en bloques con especificaciones claras.
- Formación y prototipado en verificación: al publicar datasets de destilación y RL, el modelo y sus datos sirven para experimentar con recetas de post-entrenamiento en EDA y para construir variantes más pequeñas (como CheckmateRTL-9B).

## Benchmarks y rendimiento

Resultados reportados en la model card (Pass@1 estimado con cinco muestras por problema, evaluados con vLLM bajo el mismo flujo de puntuación). CVDP v1.1.0 no agéntico:

| Modelo | Stimulus (cid012) | Checking (cid013) | Assertion (cid014) | Debug (cid016) |
|---|---:|---:|---:|---:|
| Kimi-K2.5 | 22,1% | 23,4% | 36,1% | 64,6% |
| GLM-5.2-FP8 | 34,0% | 14,0% | 33,1% | 44,6% |
| DeepSeek-V4-Flash-0731 | 22,1% | 18,5% | 28,1% | 65,1% |
| Gemma-4-31B | 24,8% | 17,7% | 33,1% | 63,4% |
| Qwen3.6-27B | 19,4% | 15,1% | 22,4% | 58,9% |
| Qwen3.5-9B | 3,0% | 1,9% | 4,8% | 22,9% |
| CheckmateRTL-9B | 29,5% | 23,0% | 15,8% | 29,1% |
| **CheckmateRTL-27B** | **37,0%** | **36,2%** | **42,4%** | 60,6% |

CVDP v1.1.0 Heavy Agentic (con OpenCode como harness):

| Modelo | Stimulus (cid012) | Checking (cid013) | Assertion (cid014) | Debug (cid016) |
|---|---:|---:|---:|---:|
| Kimi-K2.5 | 37,5% | 40,0% | 37,1% | 54,6% |
| GLM-5.2-FP8 | 52,5% | 22,9% | 60,0% | 58,6% |
| DeepSeek-V4-Flash-0731 | 65,0% | 34,3% | 51,4% | 57,9% |
| Gemma-4-31B | 17,5% | 14,3% | 22,9% | 31,8% |
| Qwen3.6-27B | 32,5% | 17,1% | 20,0% | 46,8% |
| Qwen3.5-9B | 5,0% | 0,0% | 5,7% | 18,6% |
| CheckmateRTL-9B | 25,0% | 11,4% | 20,0% | 24,6% |
| **CheckmateRTL-27B** | **65,0%** | **42,9%** | 31,4% | 46,4% |

AutoEval-ECov (156 problemas de VerilogEval reformulados como generación de estímulo con cobertura objetivo del 100 %):

| Modelo | Pass@1 |
|---|---:|
| Kimi-K2.5 | 37,1% |
| GLM-5.2-FP8 | 81,5% |
| DeepSeek-V4-Flash-0731 | 43,5% |
| Gemma-4-31B | 77,7% |
| Qwen3.6-27B | 56,7% |
| Qwen3.5-9B | 3,2% |
| CheckmateRTL-9B | 79,5% |
| **CheckmateRTL-27B** | **84,7%** |

Nota de alcance: la puntuación de CVDP v1.1.0 (estímulo, checking y aserciones) se portó de herramientas EDA comerciales a Verilator; AutoEval-ECov se evalúa con el mismo enfoque de código abierto, mientras que el debug conserva el flujo original de CVDP. Estos resultados no son directamente comparables con los del flujo comercial, y las puntuaciones de aserciones son cotas superiores porque Verilator no soporta completamente la cobertura de aserciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Para un modelo denso de 27,36B parámetros, en FP16/BF16 los pesos ocupan aproximadamente 54,7 GB, y en cuantizaciones de 8 bits unos 27,4 GB; estas cifras son estimaciones derivadas del tamaño de parámetros, no datos publicados.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, se necesitarían GPUs con al menos 80 GB de VRAM para FP16/BF16 en una sola tarjeta (A100 80GB, H100 80GB), o varias GPUs para tensor parallelism.
- ¿Cabe en GPU de consumo? No disponible como dato publicado. Con cuantización agresiva (4 bits, ~13,7 GB de pesos) cabría teóricamente en GPUs de consumo de 24 GB (RTX 4090, RTX 3090), pero no se confirma en la información disponible.
- Opciones de despliegue: la model card indica que la evaluación se realizó con vLLM; el repo usa transformers y safetensors. Otras opciones (llama.cpp, Ollama, TGI) no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

Comparativa con alternativas de la misma categoría (verificación de diseño RTL / generación de testbenches) y con el modelo base:

| Modelo | Parámetros | Contexto | CVDP stimulus (no agéntico) | CVDP checking (no agéntico) | AutoEval-ECov | Licencia |
|---|---|---|---|---|---|---|
| CheckmateRTL-27B | 27,36B denso | no disponible | 37,0% | 36,2% | 84,7% | Apache 2.0 |
| CheckmateRTL-9B | no disponible | no disponible | 29,5% | 23,0% | 79,5% | no disponible |
| Qwen3.6-27B (base) | 27B | no disponible | 19,4% | 15,1% | 56,7% | no disponible |
| Gemma-4-31B | 31B | no disponible | 24,8% | 17,7% | 77,7% | no disponible |
| Kimi-K2.5 | 1T | no disponible | 22,1% | 23,4% | 37,1% | no disponible |
| GLM-5.2-FP8 | no disponible | no disponible | 34,0% | 14,0% | 81,5% | no disponible |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | 22,1% | 18,5% | 43,5% | no disponible |

En estímulo no agéntico, CheckmateRTL-27B lidera (37,0 %) frente a GLM-5.2-FP8 (34,0 %) y Kimi-K2.5 (22,1 %); en checking también lidera (36,2 %), con Kimi-K2.5 (1T) en 23,4 %. En modo agéntico, DeepSeek-V4-Flash-0731 iguala en estímulo (65,0 %) pero queda por debajo en checking (34,3 % frente a 42,9 %). En AutoEval-ECov, CheckmateRTL-27B (84,7 %) supera a GLM-5.2-FP8 (81,5 %) y Gemma-4-31B (77,7 %).

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; no se documentan sesgos específicos.
- Riesgo de alucinación: no cuantificado en la model card; en tareas de verificación, un testbench o una aserción incorrecta puede dar falsa confianza, por lo que se recomienda validar la salida con simulación (Verilator, Icarus Verilog) antes de confiar en ella.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no se detallan; el modelo está orientado a SystemVerilog y verificación de diseño, no a propósito general.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento (MetRex, the-stack-v2-dedup, etc.) y del modelo base Qwen3.6-27B, cuyas licencias no se detallan en la información disponible.
- Comparabilidad de benchmarks: los resultados de CVDP v1.1.0 se portaron de herramientas EDA comerciales a Verilator y no son directamente comparables con los del flujo comercial; las puntuaciones de aserciones son cotas superiores porque Verilator no soporta completamente la cobertura de aserciones.
- Modo agéntico: el modelo se entrenó con tareas de un solo turno; los resultados agénticos se obtuvieron con OpenCode sin bucle de feedback del evaluador, por lo que el rendimiento en agentes puede variar según el harness.
- Caveat de producción: el modelo está especializado en una tarea muy concreta (testbench stimulus y checking); su uso fuera de verificación de RTL no está validado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI-Institute-BSC/CheckmateRTL-27B
- Modelo CheckmateRTL-9B: https://huggingface.co/AI-Institute-BSC/CheckmateRTL-9B
- Dataset SystemVerilog-Distill-86k: https://huggingface.co/datasets/AI-Institute-BSC/SystemVerilog-Distill-86k
- Dataset SystemVerilog-RL-12k: https://huggingface.co/datasets/AI-Institute-BSC/SystemVerilog-RL-12k
- Dataset MetRex: https://huggingface.co/datasets/scale-lab/MetRex
- Dataset the-stack-v2-dedup: https://huggingface.co/datasets/bigcode/the-stack-v2-dedup
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Benchmark CVDP: https://github.com/NVlabs/cvdp_benchmark
- Icarus Verilog: https://github.com/steveicarus/iverilog
- Verilator: https://github.com/verilator/verilator
- Yosys: https://github.com/YosysHQ/yosys
- Paper (DATE 2027): "From Coverage to Checking: A Post-Training Recipe for SystemVerilog Testbench Stimulus and Checking", Gutierrez-Gomez et al.; URL no disponible en la información proporcionada.
- Contacto: cristian.gutierrez@bsc.es
