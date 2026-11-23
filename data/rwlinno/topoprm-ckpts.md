# rwlinno/topoprm-ckpts

## Resumen

TopoPRM Checkpoints es una colección de artefactos de investigación publicada por el usuario rwlinno en Hugging Face, asociada al artículo *Rewarding the Graph Behind the Chain: Topology-Aware Process Supervision for RL and Reasoning Distillation*. No se trata de un modelo único, sino de un repositorio de checkpoints que documenta distintas etapas de entrenamiento (SFT, GRPO, SCAE, OPD y TGD) sobre backbones Qwen3.5-9B y DeepSeek-R1-Distill-Qwen-7B, orientadas a supervisión de procesos y destilación de razonamiento matemático.

La release principal documentada es el checkpoint Full TGD con semilla 123, un modelo fusionado en BF16 safetensors sobre el backbone de texto de Qwen3.5-9B, entrenado mediante SFT, recompensas jerárquicas con ACE y TGD en línea. El repositorio incluye además catorce checkpoints de experimentos controlados (un SFT compartido, diez ejecuciones emparejadas de Stage-II y tres de TGD) en un directorio fechado independiente.

Su relevancia es fundamentalmente metodológica: propone una señal de recompensa basada en la topología del grafo de razonamiento en lugar de únicamente en la cadena de pasos, aplicada a la destilación de modelos razonadores. El repositorio ocupa 286,8 GB y acumula 474 descargas, lo que refleja un uso orientado a replicación experimental más que a despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone de texto Qwen3.5-9B); checkpoints derivados también de DeepSeek-R1-Distill-Qwen-7B |
| Parametros totales | No disponible (el backbone base es Qwen3.5-9B; el número exacto de parámetros no se indica en la información proporcionada) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la release principal se distribuye en BF16; los adaptadores LoRA se publican en safetensors) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 para la release Full derivada de Qwen3.5-9B; el resto de checkpoints conservan los términos de sus respectivos modelos base. La licencia del repositorio figura como "no disponible" en los metadatos de Hugging Face |
| Formato de pesos | safetensors (modelo fusionado BF16 y adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo se construye sobre un transformer decoder-only estándar, tomando como backbone de texto Qwen3.5-9B. El pipeline de entrenamiento documentado para la release Full TGD sigue tres fases: una etapa de SFT, seguida de un entrenamiento con recompensas jerárquicas y ACE (hierarchical rewards + ACE), y finalmente un TGD en línea (online TGD). En la Stage III de esta ejecución se realizaron 512 intentos de revisión, de los cuales se aceptaron 335, completando 64 actualizaciones del optimizador.

La innovación central es la supervisión de procesos consciente de la topología (topology-aware process supervision): en lugar de recompensar únicamente la corrección de cada paso de una cadena de razonamiento, se modela el grafo subyacente que conecta los pasos y se utiliza esa estructura como señal de recompensa para RL y para la destilación de razonamiento. El repositorio también contiene adaptadores LoRA y checkpoints de etapas GRPO, SCAE y OPD, que representan protocolos y etapas distintas y no son intercambiables entre sí. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto conversacional y de razonamiento, con foco en dominios matemáticos.
- Razonamiento matemático multi-paso orientado a cadenas de pensamiento verificables.
- Destilación de razonamiento: los checkpoints están diseñados como artefactos para estudiar la transferencia de capacidades de razonamiento desde modelos mayores.
- Supervisión de procesos: el modelo se entrena con señales de recompensa sobre la estructura del razonamiento, no solo sobre la respuesta final.
- Soporte multilingüe limitado a inglés y chino.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito en la información proporcionada.
- El modelo contiene únicamente el backbone de texto; las respuestas matemáticas requieren verificación independiente según advierte el autor.

## Casos de uso

- Investigación en supervisión de procesos: usar los checkpoints para reproducir y comparar las etapas SFT, GRPO, SCAE, OPD y TGD, aislando el efecto de cada señal de recompensa sobre el razonamiento matemático.
- Estudio de destilación de razonamiento: emplear los adaptadores LoRA y los checkpoints fusionados para analizar cómo se transfieren las cadenas de razonamiento desde modelos como DeepSeek-R1-Distill-Qwen-7B hacia un backbone Qwen3.5-9B.
- Evaluación de recompensas basadas en topología: integrar el checkpoint Full TGD en pipelines de evaluación que comparen recompensas por cadena frente a recompensas por grafo en tareas de matemáticas.
- Generación de soluciones matemáticas con verificación posterior: desplegar el modelo fusionado en BF16 para producir borradores de demostraciones que un verificador simbólico o un evaluador humano valide después, dado que el autor advierte de la necesidad de verificación independiente.
- Réplica de experimentos controlados: utilizar el directorio `rebuttal-controlled-20261110` con los catorce checkpoints emparejados para reproducir los resultados del artículo con semillas y protocolos documentados.
- Base para ajuste fino adicional: partir del checkpoint fusionado como inicialización para experimentos propios de RL sobre razonamiento, aprovechando que se distribuye en safetensors estándar y es cargable con Transformers 5.5.4 o compatible.
- Análisis de estabilidad de entrenamiento: comparar las ejecuciones emparejadas de Stage-II y TGD para estudiar varianza entre semillas y robustez del protocolo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la release del 26 de septiembre de 2026 no incluye una tabla de puntuaciones de benchmark evaluadas, y advierte que las puntuaciones de otras ejecuciones (semilla 42 y checkpoints de resultados principales anteriores) no deben atribuirse a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un backbone de ~9B en BF16, se requiere aproximadamente 18 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits bajaría a ~9-10 GB y en 4 bits a ~5-6 GB, aunque el repositorio no publica versiones cuantizadas.
- GPU recomendadas: no especificadas por el autor. Para BF16 sin cuantizar son necesarias GPU con 24 GB o más (RTX 4090, L40S, A100 40/80 GB, H100).
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) con BF16 ajustado o cuantización, y en GPUs de 16 GB solo con cuantización agresiva; no confirmado por el autor.
- Opciones de despliegue: la model card documenta carga mediante `transformers` 5.5.4 o compatible con `AutoModelForCausalLM` y `device_map="auto"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al no publicarse GGUF no hay soporte directo en llama.cpp/Ollama sin conversión propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TopoPRM Full TGD (este) | ~9B (backbone Qwen3.5-9B) | No disponible | Supervisión de procesos por topología + destilación | Apache-2.0 (release principal) | Hugging Face, safetensors BF16 |
| Qwen3.5-9B (base) | ~9B | No disponible | LLM generalista | Según release de Qwen | Hugging Face |
| DeepSeek-R1-Distill-Qwen-7B | ~7B | No disponible | Destilación de razonamiento | Según release de DeepSeek | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible porque este repositorio no publica tabla de benchmarks. La diferencia principal frente a los modelos base es el protocolo de entrenamiento con recompensas topológicas, no el tamaño ni la arquitectura.

## Limitaciones y advertencias

- No se han publicado benchmarks asociados a esta release; no es posible afirmar mejoras de rendimiento frente a los modelos base.
- El autor advierte que las respuestas matemáticas requieren verificación independiente; el modelo no garantiza corrección.
- Riesgo de alucinación inherente a los modelos de razonamiento entrenados con RL; no se documentan mitigaciones específicas.
- Cobertura lingüística limitada a inglés y chino; el rendimiento en castellano no está evaluado.
- Longitud de contexto no documentada, lo que impide planificar despliegues con ventanas largas.
- Los checkpoints de etapas anteriores (SFT, GRPO, SCAE, OPD) y el adaptador en la raíz del repositorio son artefactos heredados con licencias y protocolos distintos; no son intercambiables con la release Full TGD.
- El repositorio pesa 286,8 GB, lo que exige planificación de almacenamiento y descarga selectiva por subdirectorio.
- No se publican cuantizaciones GGUF ni integraciones con servidores de inferencia de alto rendimiento, lo que limita el despliegue en producción.
- Uso comercial: la release principal se declara Apache-2.0, pero el resto de artefactos heredan los términos de sus modelos base, que deben revisarse individualmente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rwlinno/topoprm-ckpts
- Checkpoint Full TGD seed 123: https://huggingface.co/rwlinno/topoprm-ckpts/tree/main/topoprm-qwen35-9b-full-tgd-seed123-20260926
- Directorio de experimentos controlados: `rebuttal-controlled-20261110/README.md` dentro del repositorio
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base DeepSeek-R1-Distill-Qwen-7B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
