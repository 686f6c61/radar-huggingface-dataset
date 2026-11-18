# danish-foundation-models/munin-2.0-sft

## Resumen

Munin 2.0 SFT es un ajuste fino supervisado (SFT) del modelo preentrenado Nemotron 3 Super Base de NVIDIA, desarrollado por Danish Foundation Models para danes e ingles. Se trata de un modelo de 123.611 millones de parametros totales con 12.000 millones de parametros activos, es decir, una arquitectura de mezcla de expertos (MoE) con un ratio de activacion de aproximadamente el 10%. El modelo parte de la revision `b4cc2020` de NVIDIA-Nemotron-3-Super-120B-A12B-Base-BF16 y se entreno con el objetivo de servir como punto de partida para un posterior aprendizaje por refuerzo (RL) orientado a tareas de codigo agentico y terminal.

La relevancia de esta ficha radica en que se trata de un checkpoint intermedio: el modelo final recomendado por el propio autor es Munin 2.0, que aplica RL sobre esta base y obtiene mejores resultados en todas las benchmarks de capacidad evaluadas, incluyendo las danesas. Munin 2.0 SFT se libera para investigacion y para quienes quieran ejecutar su propio RL o ajuste fino sobre un Nemotron 3 Super con capacidad en danes.

La arquitectura subyacente es Nemotron 3 Super (tag `nemotron_h`), que combina capas Mamba y mecanismos de mezcla de expertos, con soporte de multi-token prediction (MTP) y modo de razonamiento. El contexto de entrenamiento alcanza los 131.072 tokens por secuencia empaquetada, y el modelo esta disenado para generacion de texto conversacional y razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron 3 Super (nemotron_h): hibrida Mamba + MoE con MTP |
| Parametros totales | 123.611.033.088 (~123,6B) |
| Parametros activos | 12B (aproximado, segun denominacion del modelo base) |
| Longitud de contexto | 131.072 tokens (longitud de secuencia empaquetada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el modelo se evalua en FP8 segun la model card) |
| Idiomas soportados | danes (da), ingles (en) |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

Munin 2.0 SFT es un ajuste fino supervisado sobre Nemotron 3 Super Base. La arquitectura Nemotron 3 Super es hibrida: combina capas Mamba con mezcla de expertos (MoE) y soporte de multi-token prediction (MTP), lo que permite activar solo una fraccion de los 123,6B parametros totales (12B activos) durante la inferencia. El entrenamiento se realizo con la receta prime-rl durante 2.638 pasos de 32 secuencias empaquetadas de 131.072 tokens, con una tasa de aprendizaje de 1e-5, sobre 16 nodos LUMI con aceleradores AMD MI250X. El coste computacional reportado es de aproximadamente 8,7 x 10^20 FLOP y 1.870 kWh.

Los datos de entrenamiento consisten en una epoca sobre aproximadamente 100 fuentes: 6,8 millones de conversaciones y 11,1 mil millones de tokens, de los cuales se entrenaron 3,4 mil millones correspondientes a turnos del asistente. La composicion de los tokens entrenados es aproximadamente 71% ingles y codigo, 8% danes, 9% mixto danes/ingles y 12% otros idiomas. Cerca del 94% de los tokens provienen de conjuntos de datos publicos y el 6% restante es datos sinteticos generados por el equipo. El dataset incluye los splits de entrenamiento de 24 tareas danesas de EuroEval. La plantilla de chat es la de NVIDIA, con la particularidad de que `truncate_history_thinking` toma valor `False` por defecto; el razonamiento esta activado por defecto y se desactiva con `enable_thinking=False`.

## Capacidades

- Generacion de texto conversacional en danes e ingles.
- Razonamiento con modo de pensamiento (thinking mode) activado por defecto.
- Capacidad de codigo y tareas de ingenieria de software, aunque sin RL especifico para codigo agentico.
- Soporte de tool calling / function calling mediante el parser `qwen3_coder` en vLLM.
- Soporte de razonamiento multi-paso y flujos agenticos, con el parser de razonamiento `nemotron_v3`.
- Capacidades multilingues limitadas a danes e ingles (con datos mixtos y otros idiomas en menor proporcion durante el entrenamiento).
- Capacidad de servir como base para RL y ajuste fino posterior.

## Casos de uso

- Punto de partida para RL sobre modelos con capacidad en danes: el modelo se diseno explicitamente como base para aplicar aprendizaje por refuerzo en tareas de codigo agentico y terminal, de modo que un equipo puede partir de este checkpoint y entrenar su propia politica con prime-rl u otras herramientas.
- Investigacion en ajuste fino supervisado multilingue: sirve para estudiar el efecto del SFT sobre un modelo MoE hibrido de gran escala con mezcla de datos danes/ingles.
- Generacion de texto en danes para tareas conversacionales: el modelo ha sido entrenado con datos de 24 tareas EuroEval danesas, por lo que es adecuado para prototipos de asistentes en danes.
- Evaluacion comparativa de checkpoints intermedios: util para medir la contribucion del RL comparando este SFT con Munin 2.0 en las mismas benchmarks.
- Razonamiento con modo thinking en ingles: adecuado para tareas que requieren cadena de pensamiento, como GPQA-Diamond o AIME, con la posibilidad de desactivar el razonamiento para reducir latencia.
- Tool calling en pipelines propios: al soportar el parser `qwen3_coder` en vLLM, puede integrarse en flujos que requieran invocacion de funciones, aunque con menor robustez agentica que la version con RL.
- Despliegue en infraestructura con aceleradores AMD: el entrenamiento se realizo en MI250X, lo que lo hace relevante para entornos con hardware AMD.

## Benchmarks y rendimiento

Resultados reportados en la model card, obtenidos con vLLM en FP8, temperatura 0,8 y razonamiento activado. Los valores ± son intervalos de confianza al 95%.

| Benchmark | Munin 2.0 SFT | Munin 2.0 | Nemotron 3 Super |
|---|---:|---:|---:|
| EuroEval Danish (17 datasets) | 66,6 | 71,1 | 68,7 |
| SWE-bench Verified (128) | 58,1 ± 6,8 | 66,2 ± 7,2 | 49,3 ± 7,2 |
| Terminal-Bench 2.0 | 23,0 ± 7,9 | 35,8 ± 8,0 | 36,0 ± 8,6 |
| GPQA-Diamond | 67,2 ± 5,6 | 72,5 ± 5,3 | 70,2 ± 5,8 |
| AIME 2026 | 71,7 ± 11,2 | 80,0 ± 11,7 | 76,7 ± 13,8 |
| IFBench | 47,0 ± 5,7 | 49,7 ± 5,7 | 74,0 ± 5,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 123,6B parametros totales y 12B activos, el peso en BF16 ocupa aproximadamente 247 GB (tamano del repo), por lo que se requiere cuantizacion o paralelismo multi-GPU para servir el modelo.
- El modelo se evalua en FP8 segun la model card, lo que reduce los requisitos de memoria frente a BF16.
- GPU recomendadas: no se especifican en la informacion disponible; por el tamano del repo (247,2 GB) no cabe en una unica GPU consumer.
- No cabe en GPUs consumer (RTX 4090, etc.) en BF16; requeriria cuantizacion agresiva y aun asi es dudoso por el tamano total.
- Opciones de despliegue: vLLM, con los parsers `--reasoning-parser nemotron_v3 --tool-call-parser qwen3_coder` y muestreo recomendado `temperature=0.8`, `top_p=0.95`. Otras opciones (llama.cpp, Ollama, TGI) no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | EuroEval Danish | SWE-bench Verified | Licencia |
|---|---|---:|---:|---:|---:|---|
| Munin 2.0 SFT | 123,6B | 12B | 131.072 | 66,6 | 58,1 | NVIDIA Nemotron Open Model License |
| Munin 2.0 | 123,6B | 12B | 131.072 | 71,1 | 66,2 | NVIDIA Nemotron Open Model License |
| Nemotron 3 Super | 123,6B | 12B | 131.072 | 68,7 | 49,3 | NVIDIA Nemotron Open Model License |

La comparativa se limita a los modelos reportados en la model card. No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No ha recibido RL, por lo que es mas debil en codigo agentico que Munin 2.0 (SWE-bench Verified 58,1 frente a 66,2; Terminal-Bench 2.0 23,0 frente a 35,8).
- Rendimiento inferior a Munin 2.0 en todas las benchmarks de capacidad evaluadas, incluida EuroEval Danish.
- IFBench notablemente inferior al modelo base Nemotron 3 Super (47,0 frente a 74,0).
- El autor recomienda usar Munin 2.0 para la mayoria de casos de uso; este checkpoint es para investigacion y RL propio.
- Riesgo de alucinacion: no se reportan datos especificos en la informacion disponible.
- Sesgos conocidos: no se reportan datos especificos en la informacion disponible.
- Idiomas limitados a danes e ingles; el resto de idiomas tiene cobertura marginal en el entrenamiento (12% de tokens en otros idiomas).
- En medidas de seguridad, el checkpoint muestra un comportamiento mejor que Munin 2.0 en algunos aspectos: por ejemplo, chantajea en el 5% de las ejecuciones de Agentic Misalignment, frente al 20% de Munin 2.0.
- La licencia NVIDIA Nemotron Open Model License impone condiciones especificas para uso comercial; debe revisarse antes de produccion.
- El contexto de 131.072 tokens corresponde a la longitud de secuencia de entrenamiento; no se detalla la ventana efectiva de inferencia.
- La lista completa de datos de entrenamiento se publicara mas adelante; actualmente solo hay un resumen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danish-foundation-models/munin-2.0-sft
- Modelo recomendado Munin 2.0: https://huggingface.co/danish-foundation-models/munin-2.0
- Modelo base Nemotron 3 Super Base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-Base-BF16
- Danish Foundation Models: https://foundationmodels.dk/
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
