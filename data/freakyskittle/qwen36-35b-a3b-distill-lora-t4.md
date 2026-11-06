# freakyskittle/qwen36-35b-a3b-distill-lora-t4

## Resumen

`freakyskittle/qwen36-35b-a3b-distill-lora-t4` es un adaptador LoRA de tipo SFT (supervised fine-tuning) entrenado con Unsloth sobre el modelo base `huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated`, una variante "abliterated" (sin censura) de un modelo Qwen 3.6 de arquitectura híbrida MoE. El adaptador se orienta a tres áreas concretas: razonamiento agéntico destilado de trazas de GLM-5.3, razonamiento de seguridad ofensiva/defensiva (CVE, CTF, auditoría de código) y trazas de SWE-agent para tareas de ingeniería de software. El autor lo publica como un experimento de destilación y ajuste fino en hardware muy limitado (una única Tesla T4 de Colab), no como un modelo listo para producción.

La relevancia del artefacto es doble. Por un lado, demuestra un flujo de trabajo reproducible de QLoRA sobre un MoE de ~35B parámetros con ~3B activos en una GPU consumer de 16 GB, usando cuantización 4-bit del base, LoRA solo en atención, `offload_layers=24` y emulación de bf16. Por otro, ilustra el ecosistema de modelos derivados "abliterated" y sin censura, que plantean consideraciones éticas y de licencia relevantes para cualquier uso comercial.

No obstante, conviene ser explícito: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, el tamaño del repo es de 0.0 GB (los pesos no parecen estar subidos o el recuento no está actualizado), y el propio autor califica el entrenamiento como "T4 smoke-validation run" de 3 pasos. Los benchmarks publicados son de muestra pequeña (40 ítems en ARC y MMLU, 2 en GSM8K) y no deben interpretarse como rendimiento real del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer híbrido MoE (gated-deltanet linear attention + full attention) |
| Parametros totales | ~35B (modelo base); el adaptador LoRA en sí es de rango 32, tamaño no disponible |
| Parametros activos | ~3B (modelo base MoE, 256 expertos) |
| Longitud de contexto | no disponible (el entrenamiento usó `max_seq_length=1024`, pero la ventana del base no se especifica) |
| Tipos de cuantizacion | Base entrenado en 4-bit (QLoRA); pesos del adaptador en safetensors (precisión no especificada, emulación bf16 en entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo base de arquitectura híbrida: combina capas de atención lineal tipo gated-deltanet con capas de atención completa, dentro de un esquema Mixture-of-Experts con 256 expertos y aproximadamente 3B parámetros activos sobre un total de ~35B. El autor indica que el base es la versión entrenable (safetensors) del modelo "uncensored" que solo existía en GGUF, lo que permite aplicar fine-tuning sobre él. El ajuste es un QLoRA SFT con el base cuantizado a 4-bit, LoRA únicamente en las capas de atención, r=32, alpha=64, learning rate 2e-4, `max_seq_length=1024`, batch 1 con acumulación de gradiente 16, packing activado y `offload_layers=24` para caber en la T4.

Los datos de entrenamiento son una mezcla de destilación y SFT: trazas agénticas de GLM-5.3 (dataset privado del autor), corpus de seguridad agéntica (cybench/autopenbench/CVE), CoTs de razonamiento sobre vulnerabilidades destilados de DeepSeek-R1-0528, detección de CWE con razonamiento cold-start, trazas de resolución de CTFs, trayectorias exitosas de SWE-agent (GLM-5.1 sobre swe-rebench-v2) y splits de entrenamiento de GSM8K, MATH-lighteval, ARC-Challenge y MMLU como datos auxiliares. No se documenta el número total de tokens ni la composición porcentual. No hay mención a RLHF ni DPO; es SFT puro con destilación. La innovación técnica destacable es de índole práctica: reproducir un pipeline de QLoRA sobre un MoE de 35B en una T4 mediante offloading de capas y emulación de bf16, más que una innovación arquitectónica propia.

## Capacidades

- Generación de texto y razonamiento en formato de cadena de pensamiento (thinking), heredado del base Qwen 3.6 y reforzado con trazas destiladas de R1 y GLM-5.3.
- Razonamiento de seguridad: auditoría de código C/C++ para detección de vulnerabilidades (el ejemplo de la model card identifica CWE-476, desbordamientos de buffer y desreferencias nulas).
- Resolución guiada de retos CTF (web, con enumeración de endpoints, bypass de autenticación y localización de flags), según los ejemplos cualitativos.
- Tareas agénticas de ingeniería de software: el adaptador se entrenó con trayectorias exitosas de SWE-agent, por lo que está orientado a flujos multi-paso de edición y depuración de código.
- Razonamiento matemático básico (GSM8K, MATH) y respuesta a preguntas de opción múltiple (MMLU, ARC), aunque con rendimiento reportado muy bajo.
- Capacidad de tool calling / function calling: no disponible de forma explícita en la información proporcionada (el base Qwen 3.6 probablemente la soporta, pero no se documenta para este adaptador).
- Capacidades multilingües: no disponibles.
- Modo "uncensored": el base abliterated elimina los rechazos por alineación, lo que se traduce en respuestas sin filtros de seguridad.

## Casos de uso

- Auditoría de código en pipelines de CI/CD: el adaptador puede analizar funciones C/C++ y señalar CWEs concretas (desbordamientos, punteros nulos) como paso previo a revisión humana; encaja en un linter semántico o en un bot de revisión de PRs.
- Formación en ciberseguridad ofensiva: generar explicaciones paso a paso de técnicas de reconocimiento, enumeración y bypass en entornos controlados (laboratorios, CTFs), gracias a las trazas de CTF y cybench del dataset.
- Asistente de resolución de CTFs: dado un enunciado y un contexto de reto, el modelo produce un plan de ataque estructurado (reconocimiento, enumeración, explotación, extracción de flag), útil como copiloto en competiciones.
- Análisis de vulnerabilidades con razonamiento trazable: los CoTs destilados de R1 permiten obtener justificaciones intermedias auditables, lo que facilita la revisión por parte de un analista de seguridad.
- Prototipado de agentes SWE: al haberse entrenado con trayectorias exitosas de SWE-agent, puede usarse como política inicial en entornos de reparación automática de bugs, siempre con validación humana y sandboxing.
- Investigación sobre destilación y fine-tuning eficiente: sirve como referencia reproducible de QLoRA sobre MoE de 35B en T4, útil para estudiar el impacto de `offload_layers`, packing y LoRA solo en atención.
- Generación de material didáctico de matemáticas y ciencias: con los splits de GSM8K, MATH y ARC, puede producir explicaciones de problemas, aunque el rendimiento medido es bajo y requiere verificación.

## Benchmarks y rendimiento

| Benchmark | Resultado reportado | Muestra |
|---|---|---|
| ARC-Challenge (val) | 32.5% (13/40) | 40 ítems |
| MMLU (test) | 27.5% (11/40) | 40 ítems |
| GSM8K (test) | 0.0% (0/2) | 2 ítems |

El propio autor advierte que se trata de una evaluación de muestra pequeña para "sanity checking", no de una ejecución rigurosa. No hay comparación con otros modelos en la información disponible. Los resultados están muy por debajo de lo esperable para un modelo de 35B, lo que sugiere que el adaptador no preserva el rendimiento del base en tareas de conocimiento general (probablemente por sobreajuste a dominios de seguridad y por el entrenamiento de solo 3 pasos).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador en sí; el base de ~35B en 4-bit requiere aproximadamente 20-24 GB, y en 8-bit ~35-40 GB. El adaptador LoRA añade un coste marginal (r=32 sobre atención).
- GPU recomendadas: para el base en 4-bit, una RTX 4090 (24 GB) o A6000 (48 GB) pueden ser suficientes; para bf16 completo se necesitan A100/H100 de 80 GB.
- Cabe en GPU consumer: sí, el base cuantizado a 4-bit cabe en RTX 4090 y potencialmente en GPUs de 24 GB; el entrenamiento se hizo en una T4 de 16 GB con offloading de 24 capas.
- Opciones de despliegue: al ser un adaptador LoRA en safetensors, requiere cargar el base con `peft`/`transformers`; para servir en producción se puede fusionar el adaptador con el base y exportar a GGUF para llama.cpp/Ollama, o servir con vLLM/TGI tras la fusión.
- Latencia y throughput: no disponibles.
- Nota: el repositorio figura con 0.0 GB, por lo que los pesos del adaptador podrían no estar efectivamente publicados; verificar antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| freakyskittle/qwen36-35b-a3b-distill-lora-t4 | ~35B (3B activos) + LoRA | no disponible | apache-2.0 | HF, 0 descargas | Adaptador experimental, benchmarks de muestra pequeña |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated (base) | ~35B (3B activos) | no disponible | no disponible | HF | Modelo base sin censura; presumiblemente mejor rendimiento general |
| Qwen3.6-35B-A3B (original) | ~35B (3B activos) | no disponible | no disponible | HF | Modelo original alineado, sin ablación |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | ~35B (3B activos) | no disponible | no disponible | solo GGUF | Variante sin censura en GGUF, sin pesos entrenables |

La comparativa se limita a la familia Qwen 3.6 porque no se dispone de datos de benchmarks del adaptador frente a alternativas. No se han publicado resultados que permitan afirmar que el adaptador mejora al base en ninguna tarea.

## Limitaciones y advertencias

- Entrenamiento de solo 3 pasos ("T4 smoke-validation run"): el adaptador no ha completado un fine-tuning real; los pesos probablemente reflejan un ajuste mínimo y pueden degradar el rendimiento del base.
- Benchmarks no fiables: ARC 32.5%, MMLU 27.5% y GSM8K 0% sobre muestras de 40 y 2 ítems no permiten conclusiones; el rendimiento real es desconocido.
- Repositorio vacío o casi vacío (0.0 GB, 0 descargas): riesgo alto de que los pesos no estén disponibles o estén incompletos.
- Modelo base "abliterated"/uncensored: elimina los rechazos de seguridad, lo que incrementa el riesgo de generar contenido dañino, instrucciones de explotación reales o código malicioso. No apto para aplicaciones de cara al público sin capas adicionales de moderación.
- Sesgos conocidos: no documentados; hereda los del base Qwen 3.6 y los de los datasets de destilación (GLM-5.3, R1, corpus de seguridad), no auditados.
- Riesgo de alucinación: alto, especialmente en razonamiento de seguridad y CTF, donde el modelo puede inventar CWEs, vectores de ataque o flags inexistentes.
- Limitaciones de contexto: el entrenamiento usó `max_seq_length=1024`, lo que puede limitar la calidad en secuencias largas aunque el base soporte más.
- Idiomas: no documentados; el material de entrenamiento parece mayoritariamente en inglés.
- Licencia apache-2.0 declarada, pero el base es un derivado "abliterated" de Qwen 3.6 cuya licencia original debe verificarse; la cadena de licencias puede imponer restricciones adicionales para uso comercial.
- Datasets privados (`freakyskittle/glm-5.3-distillation`) no reproducibles, lo que impide replicar el entrenamiento.
- Uso ético: no emplear para auditorías de seguridad reales sin supervisión humana ni para generar exploits contra sistemas sin autorización.

## Enlaces

- Hugging Face: https://huggingface.co/freakyskittle/qwen36-35b-a3b-distill-lora-t4
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- Dataset GLM-5.3 distillation: https://huggingface.co/datasets/freakyskittle/glm-5.3-distillation
- Dataset security-agentic-sft-corpus: https://huggingface.co/datasets/ciTy1504/security-agentic-sft-corpus
- Dataset OpenVul: https://huggingface.co/datasets/Leopo1d/OpenVul_Distilled_Vulnerability_Reasoning_CoTs_from_DeepSeek-R1-0528
- Dataset SecCoderX: https://huggingface.co/datasets/SecCoderX/SecCoderX_Reasoning_Vulnerability_Detection_SFT_Cold_Start_Dataset
- Dataset ctf-solver: https://huggingface.co/datasets/TrueNix/ctf-solver-dataset
- Dataset swe-rebench-v2 traces: https://huggingface.co/datasets/whitecircle/swe-rebench-v2-glm-5.1-pi-agent-successful-traces
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MATH-lighteval: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Dataset ARC: https://huggingface.co/datasets/allenai/ai2_arc
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
