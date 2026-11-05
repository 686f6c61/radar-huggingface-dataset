# ReliquaryForge/Teutonic-I-Reliquary

## Resumen

Teutonic-I-Reliquary es un modelo de lenguaje de 8.950 millones de parametros (aproximadamente 9B) desarrollado por ReliquaryForge, especializado en razonamiento, generacion de codigo y uso de agentes. Se trata de un ajuste fino del modelo Teutonic-I-Reliquary-SFT, que a su vez deriva del modelo base Teutonic-I de Teutonic (Subnet 3) de la red Bittensor. El modelo emplea la arquitectura `Qwen3_5ForCausalLM` y comparte plantilla de chat y modo de pensamiento (thinking mode) con Qwen3.5-9B, lo que facilita su integracion en infraestructuras existentes.

La relevancia de este modelo radica en su metodo de entrenamiento: todo el post-entrenamiento se realizo de forma descentralizada sobre Bittensor, con mineros aportando datos y computo de GPUs heterogeneas (desde RTX 3090 hasta B200). El proceso combino una fase de SFT sobre aproximadamente 4.5B de tokens generados por mineros (incluyendo 24.500 episodios agenticos multi-turno) con una fase de RL asincrono de 11 dias y 15.7B de tokens entrenados, distribuida en siete entornos de tareas.

El modelo declara mejoras notables frente a Qwen3.5-9B en tareas de resolucion de problemas de software (SWE-bench Verified: 43.6% frente a 35.1%), matematicas competitivas (AIME 2025: 91.2% frente a 86.2%) y seguimiento de instrucciones (IFBench: 74.7% frente a 67.5%), aunque rinde peor en tareas de terminal (TMax) y en conocimiento cientifico de nivel avanzado (GPQA Diamond).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`Qwen3_5ForCausalLM`), con thinking mode |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 65.536 tokens (recomendado en vLLM con `--max-model-len 65536`); contexto de entrenamiento en episodios agenticos de hasta 64k tokens |
| Tipos de cuantizacion | No disponible (no se especifican en la model card; al ser safetensors en transformers, es compatible con cuantizacion estandar, pero no se confirma oficialmente) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en la arquitectura Qwen3.5-9B, con la misma plantilla de chat y modo de pensamiento. El entrenamiento se estructuro en dos fases. La primera consistio en un ajuste supervisado (SFT) sobre aproximadamente 4.5B de tokens generados por mineros de la red Reliquary, incluyendo 24.500 episodios agenticos multi-turno; segun la model card, esta fase elevo el rendimiento interno de 0% a 34% en correccion de bugs reales y de 0% a 26% en uso de herramientas, acercandose a Qwen3.5-9B en ambas metricas.

La segunda fase fue un entrenamiento por refuerzo asincrono (`teutonic-rl-async-v1`, del 22 de octubre al 2 de noviembre de 2026) con 158 pasos de optimizador, 15.7B de tokens entrenados y siete entornos: tareas SWE, tareas de terminal, programacion competitiva, matematicas dificiles, matematicas DAPO, mundos de uso de herramientas y seguimiento de instrucciones. Los episodios agenticos alcanzaron hasta 48 turnos y 64k tokens. La innovacion tecnica destacada es la denominada "Gumbel substitution", un metodo para hacer frente simultaneamente a la heterogeneidad de hardware, la falta de confianza en los mineros y la asincronia del entrenamiento; el informe tecnico esta pendiente de publicacion. Los mineros solo envian tokens, y la red calcula y verifica todas las recompensas y rollouts.

## Capacidades

- Generacion de texto y razonamiento en modo pensamiento (thinking mode), con presupuestos de hasta 64k tokens en tareas de matematicas y ciencia.
- Generacion y correccion de codigo, incluyendo resolucion de issues reales en repositorios (SWE-bench Verified).
- Razonamiento matematico de nivel competitivo (AIME 2025 y 2026).
- Uso de herramientas (tool calling / function calling) y entornos de terminal.
- Razonamiento agentico multi-paso, con episodios de hasta 48 turnos.
- Seguimiento de instrucciones complejas (IFBench).
- Programacion competitiva (LiveCodeBench).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Resolucion automatica de issues en repositorios: el modelo puede recibir un issue de GitHub junto con el contexto del repositorio y generar un parche candidato, apoyandose en su rendimiento del 43.6% en SWE-bench Verified y en su capacidad de razonamiento agentico multi-turno.
- Agentes de terminal y automatizacion de operaciones: con soporte para tareas de terminal y hasta 48 turnos de interaccion, puede encadenar comandos, interpretar salidas y corregir errores en flujos de administracion de sistemas.
- Asistente de programacion en IDE: su modo de pensamiento y su contexto de 64k tokens permiten mantener conversaciones largas sobre un mismo codebase, con temperatura recomendada de 1.0, top-p 0.95 y top-k 20.
- Tutoria y resolucion de problemas matematicos: adecuado para explicar demostraciones paso a paso (por ejemplo, la irracionalidad de la raiz de 2) y para preparacion de olimpiadas, dado su rendimiento en AIME.
- Generacion de codigo en pipelines de CI/CD: mediante tool calling y function calling, puede integrarse en flujos automatizados de revision de codigo, generacion de tests o triaje de fallos.
- Evaluacion y benchmark de agentes: su protocolo de evaluacion reproducible (mini-swe harness, presupuestos definidos) lo hace util como referencia en investigacion sobre agentes de software.
- Prototipado de asistentes conversacionales tecnicos: con licencia Apache-2.0 y despliegue via vLLM, puede servir como backend de chat tecnico en entornos de desarrollo.

## Benchmarks y rendimiento

Resultados pass@1 (%) publicados en la model card, evaluados en la red Reliquary con el mismo harness, presupuestos y muestreo (temperatura 1.0, top-p 0.95, top-k 20, thinking mode):

| Benchmark | Teutonic-I-Reliquary | Qwen3.5-9B |
|---|---|---|
| SWE-bench Verified (486 tareas, mini-swe) | 43.6 | 35.1 |
| IFBench | 74.7 | 67.5 |
| AIME 2025 | 91.2 | 86.2 |
| LiveCodeBench | 62.0 | 57.0 |
| AIME 2026 | 89.6 | 86.7 |
| MMLU-Pro | 79.1 | 80.3 |
| TMax (tareas de terminal) | 74.8 | 82.2 |
| GPQA Diamond | 68.1 | 81.6 |

Protocolo: 64k tokens de presupuesto para AIME, GPQA Diamond y LiveCodeBench; 32k para IFBench y MMLU-Pro; SWE-bench Verified y TMax con hasta 48 turnos y 16k tokens por turno. Tamanos: AIME 30 problemas x 8 muestras; GPQA Diamond 198 x 4; LiveCodeBench 300 x 2; IFBench 300 x 2; MMLU-Pro 500 x 2; SWE-bench Verified 486 x 2; TMax 200 x 4 (split no usado en entrenamiento).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de 9B en safetensors (17.9 GB de repo), la inferencia en bf16 requiere aproximadamente 18-20 GB de VRAM, y en cuantizacion de 8 bits o 4 bits se reduce sustancialmente, aunque el autor no publica cifras oficiales.
- GPU recomendadas: el modelo fue entrenado y evaluado en GPUs heterogeneas, desde RTX 3090 hasta B200. Para despliegue en produccion se recomienda vLLM sobre GPUs de datacenter (A100, H100, B200) para aprovechar el contexto de 64k.
- Cabe en GPU de consumo: si, en tarjetas con suficiente VRAM para el formato elegido (por ejemplo, RTX 3090 de 24 GB en bf16 o cuantizado); no se confirman cifras exactas.
- Opciones de despliegue: vLLM (comando recomendado: `vllm serve ReliquaryForge/Teutonic-I-Reliquary --max-model-len 65536`) y transformers con `AutoModelForCausalLM`. No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | AIME 2025 | GPQA Diamond | Licencia |
|---|---|---|---|---|---|---|
| Teutonic-I-Reliquary | 8.95B | 64k | 43.6 | 91.2 | 68.1 | Apache-2.0 |
| Qwen3.5-9B | aproximadamente 9B | no disponible en la informacion | 35.1 | 86.2 | 81.6 | no disponible en la informacion |
| Teutonic-I-Reliquary-SFT | no disponible | no disponible | no disponible | no disponible | no disponible | Apache-2.0 (segun modelo base) |

La comparativa se limita a Qwen3.5-9B, unico modelo con datos publicados en la model card. No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior a Qwen3.5-9B en tareas de terminal (TMax: 74.8 frente a 82.2) y en conocimiento cientifico avanzado (GPQA Diamond: 68.1 frente a 81.6), por lo que no es adecuado como sustituto generalista en esos dominios.
- Riesgo de alucinacion no cuantificado en la model card; como todo modelo generativo, puede producir codigo o razonamientos plausibles pero incorrectos.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue equilibrado.
- Los benchmarks fueron generados y verificados por mineros de la propia red Reliquary, lo que introduce un posible sesgo de evaluacion interna; no se han replicado de forma independiente en la informacion disponible.
- El informe tecnico sobre "Gumbel substitution" esta pendiente de publicacion, por lo que los detalles del entrenamiento no son verificables externamente.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones de los modelos base (Teutonic-I y Qwen3.5-9B) para confirmar compatibilidad.
- Modelo recien publicado (noviembre de 2026) con 0 descargas y 0 likes en HuggingFace; no hay evidencia de uso en produccion.
- No se documentan tipos de cuantizacion oficiales ni formatos GGUF, lo que puede limitar el despliegue en entornos de bajos recursos.

## Enlaces

- HuggingFace: https://huggingface.co/ReliquaryForge/Teutonic-I-Reliquary
- Modelo SFT base: https://huggingface.co/ReliquaryForge/Teutonic-I-Reliquary-SFT
- Modelo base Teutonic-I: https://huggingface.co/dendriteholdings/Teutonic-I
- Dashboard del run de RL: https://app.reliqua.ai/console/run?run=5H47sFL6-teutonic-rl-async-v1-trainer
