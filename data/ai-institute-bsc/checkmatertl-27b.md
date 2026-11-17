# AI-Institute-BSC/CheckmateRTL-27B

## Resumen

CheckmateRTL-27B es un ajuste fino (fine-tune) del modelo Qwen3.6-27B desarrollado por el Barcelona Supercomputing Center (AI-Institute-BSC) especializado en verificación de diseño en SystemVerilog. Resuelve tres tareas concretas del flujo de verificación: generar un plan de pruebas a partir del RTL, generar un testbench a partir del binomio RTL más plan de pruebas, y añadir comprobaciones funcionales a un testbench de estímulos ya existente. El objetivo declarado es producir testbenches que pasen sobre el DUT correcto (golden) y rechacen variantes defectuosas.

El modelo emplea la arquitectura subyacente de Qwen3.6-27B (transformer denso, 27.356.728.560 parámetros según los pesos en safetensors) y se entrena en dos fases: destilación desde Gemma-4-31B sobre el dataset SystemVerilog-Distill-86k y aprendizaje por refuerzo con recompensas verificables (RLVR, GRPO) sobre SystemVerilog-RL-12k. La relevancia actual radica en que demuestra que un modelo de 27B puede superar a modelos mucho mayores (Kimi-K2.5 de 1T, GLM-5.2, DeepSeek-V4-Flash) en tareas específicas de generación y comprobación de testbenches, un cuello de botella clásico en la verificación de hardware.

El modelo forma parte de una familia junto a CheckmateRTL-9B, ambos publicados con resultados en el paper "From Coverage to Checking: A Post-Training Recipe for SystemVerilog Testbench Stimulus and Checking" (DATE 2027). Es relevante para equipos de verificación que buscan automatizar la generación de estímulos y checks con modelos abiertos desplegables en infraestructura propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hereda de Qwen3.6-27B) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-27B, un transformer denso de aproximadamente 27.400 millones de parámetros. El pipeline de entrenamiento combina dos fases: primero una destilación de conocimiento desde Gemma-4-31B sobre el dataset SystemVerilog-Distill-86k (86.000 ejemplos), y después un ajuste con aprendizaje por refuerzo a partir de recompensas verificables (RLVR) usando GRPO sobre SystemVerilog-RL-12k (12.000 ejemplos). Las etiquetas del repositorio confirman el uso de TRL, SFT y GRPO. La recompensa del RL se define de forma verificable: el testbench generado debe pasar sobre el DUT correcto y fallar sobre variantes defectuosas, lo que alinea el entrenamiento con la métrica real de la tarea.

Aunque el entrenamiento se realiza con tareas de un solo turno, el modelo se evalúa también en modo agéntico con OpenCode como harness de codificación, sin bucle de retroalimentación de evaluador personalizado. El modelo está especializado en SystemVerilog y Verilog; no se dispone de información sobre el número total de tokens de entrenamiento, la composición completa del dataset ni detalles de la innovación arquitectónica específica más allá de la herencia de Qwen3.6.

## Capacidades

- Generación de planes de prueba (test plans) a partir de código RTL en SystemVerilog/Verilog.
- Generación de testbenches a partir del RTL y el plan de pruebas.
- Añadición de comprobaciones funcionales (checkers) a testbenches de estímulos existentes.
- Generación de estímulos de testbench orientados a cobertura funcional (benchmark AutoEval-ECov).
- Depuración de diseños de verificación (tarea debug, cid016, en CVDP).
- Razonamiento multi-paso en modo agéntico (evaluado con OpenCode).
- Generación de texto conversacional (pipeline text-generation).
- Capacidad multimodal de entrada imagen-texto según los tags del repositorio (image-text-to-text), heredada del modelo base.

## Casos de uso

- Generación automática de testbenches en flujos de verificación RTL: dado el RTL y un plan de pruebas, el modelo produce un testbench que se valida contra el DUT correcto y variantes defectuosas, reduciendo el trabajo manual de escritura de estímulos.
- Añadir checks funcionales a testbenches existentes: equipos con testbenches de estímulos heredados pueden usar el modelo para insertar comprobaciones que detecten fallos en variantes defectuosas, mejorando la cobertura de verificación sin reescribir los estímulos.
- Generación de planes de verificación: a partir del código RTL, el modelo redacta un plan de pruebas que sirve como documento de partida para ingenieros de verificación.
- Automatización de cobertura funcional: en el benchmark AutoEval-ECov el modelo alcanza 84,7% de Pass@1 generando testbenches que llegan al 100% de cobertura objetivo, útil para pipelines de regresión que exigen cobertura.
- Integración en harnesses agénticos de codificación: el modelo funciona con OpenCode como agente sin evaluador personalizado, lo que permite incorporarlo a asistentes de verificación que iteran sobre el código.
- Depuración de fallos de verificación: la tarea debug (cid016) permite al modelo analizar y corregir problemas en diseños de verificación, con un 60,6% de Pass@1 no agéntico.
- Evaluación de calidad de testbenches en CI: el modelo puede generar variantes de testbench y comprobar que discriminan DUTs correctos de defectuosos, como paso de validación en integración continua de hardware.

## Benchmarks y rendimiento

Resultados reportados en el paper, Pass@1 estimado con cinco muestras por problema, evaluados con vLLM bajo el mismo flujo de puntuación.

CVDP v1.1.0 no agéntico (design verification):

| Modelo | Stimulus (cid012) | Checking (cid013) | Assertion (cid014) | Debug (cid016) |
|---|---:|---:|---:|---:|
| Kimi-K2.5 | 22,1% | 23,4% | 36,1% | 64,6% |
| GLM-5.2-FP8 | 34,0% | 14,0% | 33,1% | 44,6% |
| DeepSeek-V4-Flash-0731 | 22,1% | 18,5% | 28,1% | 65,1% |
| Gemma-4-31B | 24,8% | 17,7% | 33,1% | 63,4% |
| Qwen3.6-27B | 19,4% | 15,1% | 22,4% | 58,9% |
| Qwen3.5-9B | 3,0% | 1,9% | 4,8% | 22,9% |
| CheckmateRTL-9B | 29,5% | 23,0% | 15,8% | 29,1% |
| CheckmateRTL-27B | 37,0% | 36,2% | 42,4% | 60,6% |

CVDP v1.1.0 heavy agentic (con OpenCode):

| Modelo | Stimulus (cid012) | Checking (cid013) | Assertion (cid014) | Debug (cid016) |
|---|---:|---:|---:|---:|
| Kimi-K2.5 | 37,5% | 40,0% | 37,1% | 54,6% |
| GLM-5.2-FP8 | 52,5% | 22,9% | 60,0% | 58,6% |
| DeepSeek-V4-Flash-0731 | 65,0% | 34,3% | 51,4% | 57,9% |
| Gemma-4-31B | 17,5% | 14,3% | 22,9% | 31,8% |
| Qwen3.6-27B | 32,5% | 17,1% | 20,0% | 46,8% |
| Qwen3.5-9B | 5,0% | 0,0% | 5,7% | 18,6% |
| CheckmateRTL-9B | 25,0% | 11,4% | 20,0% | 24,6% |
| CheckmateRTL-27B | 65,0% | 42,9% | 31,4% | 46,4% |

AutoEval-ECov (156 problemas de VerilogEval reformulados como generación de estímulos, cobertura objetivo 100%):

| Modelo | Pass@1 |
|---|---:|
| Kimi-K2.5 | 37,1% |
| GLM-5.2-FP8 | 81,5% |
| DeepSeek-V4-Flash-0731 | 43,5% |
| Gemma-4-31B | 77,7% |
| Qwen3.6-27B | 56,7% |
| Qwen3.5-9B | 3,2% |
| CheckmateRTL-9B | 79,5% |
| CheckmateRTL-27B | 84,7% |

Nota de alcance: la puntuación de stimulus, checking y assertion de CVDP v1.1.0 se ha portado de herramientas EDA comerciales a Verilator; AutoEval-ECov se evalúa con el mismo enfoque de código abierto y el debugging mantiene el flujo original de CVDP. Estos resultados no son directamente comparables con los del flujo comercial, y las puntuaciones de assertion son cotas superiores porque Verilator no soporta completamente la cobertura de aserciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 109,4 GB en safetensors (probablemente FP16/BF16). En BF16 se necesitan aproximadamente 55 GB de VRAM para los pesos; en cuantización de 8 bits, unos 27-28 GB; en 4 bits, unos 14-16 GB.
- GPU recomendadas: para BF16, A100 80GB, H100 80GB o dos GPU de 48 GB; para 8 bits, A100 40GB o RTX 6000 Ada 48GB; para 4 bits, RTX 4090 24GB o RTX 3090 24GB.
- Cabe en GPU de consumo: sí, en cuantización de 4 bits en RTX 4090/3090 (24 GB), con margen limitado para contexto largo.
- Opciones de despliegue: vLLM (usado en la evaluación del paper), transformers con safetensors, y previsiblemente llama.cpp/Ollama/TGI si se generan cuantizaciones GGUF (no confirmado en la información disponible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CVDP stimulus (no agéntico) | CVDP checking (no agéntico) | AutoEval-ECov | Licencia |
|---|---|---:|---:|---:|---:|---|
| CheckmateRTL-27B | 27,4B | no disponible | 37,0% | 36,2% | 84,7% | no disponible |
| CheckmateRTL-9B | ~9B | no disponible | 29,5% | 23,0% | 79,5% | no disponible |
| Qwen3.6-27B (base) | 27,4B | no disponible | 19,4% | 15,1% | 56,7% | no disponible |
| Gemma-4-31B | ~31B | no disponible | 24,8% | 17,7% | 77,7% | no disponible |
| GLM-5.2-FP8 | no disponible | no disponible | 34,0% | 14,0% | 81,5% | no disponible |
| Kimi-K2.5 | 1T | no disponible | 22,1% | 23,4% | 37,1% | no disponible |

CheckmateRTL-27B supera a su modelo base Qwen3.6-27B en todas las tareas de CVDP no agéntico y en AutoEval-ECov, y supera a modelos mucho mayores como Kimi-K2.5 (1T) en stimulus, checking y AutoEval-ECov. En modo agéntico, DeepSeek-V4-Flash-0731 y GLM-5.2-FP8 superan a CheckmateRTL-27B en stimulus y assertion, mientras que CheckmateRTL-27B lidera en checking (42,9%).

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia antes de desplegarlo en producción.
- Idiomas no declarados: aunque el modelo base es multilingüe, no hay información sobre el soporte idiomático específico del fine-tune.
- Especialización estrecha: entrenado exclusivamente para verificación en SystemVerilog/Verilog; su rendimiento fuera de ese dominio no está documentado y probablemente sea inferior al del modelo base.
- Las puntuaciones de assertion son cotas superiores porque Verilator no soporta completamente la cobertura de aserciones.
- Los resultados de CVDP portados a Verilator no son directamente comparables con los del flujo comercial de EDA.
- El modo agéntico se evalúa sin bucle de retroalimentación de evaluador personalizado, lo que puede infraestimar el rendimiento en entornos con feedback.
- Riesgo de alucinación en la generación de testbenches: el modelo puede producir estímulos sintácticamente válidos pero funcionalmente incorrectos; la validación contra el DUT y variantes defectuosas es imprescindible.
- Sesgos conocidos: no disponible.
- Longitud de contexto: no disponible, lo que limita la planificación para diseños RTL de gran tamaño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI-Institute-BSC/CheckmateRTL-27B
- Modelo hermano CheckmateRTL-9B: https://huggingface.co/AI-Institute-BSC/CheckmateRTL-9B
- Dataset SystemVerilog-Distill-86k: https://huggingface.co/datasets/AI-Institute-BSC/SystemVerilog-Distill-86k
- Dataset SystemVerilog-RL-12k: https://huggingface.co/datasets/AI-Institute-BSC/SystemVerilog-RL-12k
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Benchmark CVDP: https://github.com/NVlabs/cvdp_benchmark
- Contacto: cristian.gutierrez@bsc.es
- Paper: Gutierrez-Gomez et al., "From Coverage to Checking: A Post-Training Recipe for SystemVerilog Testbench Stimulus and Checking", DATE 2027 (URL no disponible)
