# Kernel-Lord/Qwen3.6-35B-A3B-CyberFusion

## Resumen

Qwen3.6-35B-A3B-CyberFusion es un modelo de lenguaje experimental publicado por Kernel-Lord en Hugging Face, construido mediante la fusión de pesos (*model merge*) de tres fine-tunes derivados de Qwen3.6-35B-A3B. No se trata de un modelo entrenado desde cero, sino de una interpolación secuencial en dos etapas mediante SLERP que combina instrucciones generales (Qwopus), razonamiento destilado (Kimi-K2.6 Reasoning Distilled) y conocimiento de ciberseguridad ofensiva y defensiva (CyberStrike-OffSec). El objetivo declarado es disponer de un único sistema capaz de razonar sobre código, sistemas, superficies de ataque y controles defensivos en flujos de trabajo técnicos.

El modelo conserva la arquitectura del Qwen3.6-35B-A3B original: un transformer con mezcla de expertos (MoE) de 35.951.822.704 parámetros totales, del cual solo una fracción está activa por token (dato no disponible en la información proporcionada). Se distribuye en bf16 sin cuantizar, en formato safetensors para transformers, con un repositorio de 71,9 GB. Está etiquetado como `image-text-to-text` y `qwen3_5_moe` en Hugging Face, lo que sugiere capacidades multimodales heredadas del modelo base, aunque la model card solo documenta explícitamente generación de texto.

Su relevancia es doble: por un lado, ilustra las posibilidades y los riesgos de las técnicas de merge de pesos para especializar modelos en dominios sensibles como la seguridad; por otro, sirve como caso de estudio de un modelo de nicho con licencia "other" y procedencia compleja (tres repositorios upstream), lo que obliga al evaluador a verificar términos de licencia antes de cualquier uso en producción. Es un modelo de investigación, no un producto validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), derivado de Qwen3.6-35B-A3B |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Solo se distribuye bf16 sin cuantizar; no se documentan variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | Inglés (`en`); resto no disponible |
| Licencia | other (se aplican las licencias upstream de los tres repositorios fuente) |
| Formato de pesos | safetensors (layout Hugging Face Transformers) |

## Arquitectura y entrenamiento

El modelo no se ha entrenado: es el resultado de un merge de pesos en dos etapas secuenciales con SLERP. En la primera etapa se interpola `Jackrong/Qwopus3.6-35B-A3B-v1` con `lordx64/Qwen3.6-35B-A3B-Kimi-K2.6-Reasoning-Distilled` con `t = 1/2`. En la segunda, el resultado de la etapa 1 se interpola con `oyildirim/CyberStrike-OffSec-35B` con `t = 1/3`. Según el autor, esta construcción secuencial otorga a los tres modelos fuente una contribución aproximadamente equivalente.

Los detalles de componentes son explícitos: precisión bfloat16, sin cuantización, layout de Transformers, cabeza MTP tomada del lado Qwopus/Kimi (CyberStrike no aporta tensores MTP), configuración, tokenizer y chat template tomados de Qwopus, y herramienta de merge `merge_models.py` del espacio de trabajo local `qwen-merge`. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO, porque al ser un merge no existe un corpus de entrenamiento propio. Tampoco se detalla la innovación arquitectónica interna del base (atención, decodificación especulativa, etc.), más allá de la etiqueta MoE y la existencia de una cabeza MTP.

## Capacidades

- Generación de texto conversacional con plantilla de chat Qwen (mensajes con roles `user`/`assistant`).
- Razonamiento estructurado y resolución de problemas técnicos, heredado del componente Kimi-K2.6 Reasoning Distilled.
- Modelado de amenazas y análisis de superficie de ataque.
- Revisión de código seguro y triaje de vulnerabilidades.
- Razonamiento sobre ingeniería defensiva, controles de seguridad y planes de remediación.
- Planificación de respuesta a incidentes e investigación.
- Conceptos de seguridad de red, sistemas operativos y seguridad de aplicaciones.
- Análisis de retos CTF y entornos de sandbox.
- Redacción de lógica de detección, checklists de hardening y documentación técnica.
- Generación de código general y borradores de automatización de seguridad.
- Capacidad multimodal potencial (etiqueta `image-text-to-text` en Hugging Face), aunque no documentada en la model card.
- Soporte de tool calling y comportamiento de agente: no documentado explícitamente.
- Capacidades multilingües: solo se declara inglés.

## Casos de uso

- Modelado de amenazas en APIs y servicios web: el modelo puede generar diagramas de superficie de ataque, enumerar activos, identificar vectores y proponer controles defensivos a partir de una descripción de arquitectura, aprovechando el componente de razonamiento destilado.
- Revisión de código seguro en pipelines de CI/CD: se puede invocar como paso de análisis estático asistido para detectar patrones inseguros (inyección, deserialización, gestión de secretos) y generar parches sugeridos, siempre con revisión humana antes de aplicar.
- Triaje de vulnerabilidades y priorización: dado un listado de CVEs o hallazgos de un escáner, el modelo puede razonar sobre explotabilidad, impacto y remediación, útil en equipos SOC con volumen alto de alertas.
- Planificación de respuesta a incidentes: redactar runbooks, hipótesis de investigación y pasos de contención para un incidente concreto, aprovechando el conocimiento de seguridad ofensiva para anticipar movimientos del atacante.
- Formación y CTFs: análisis de retos en sandbox, explicación de técnicas y generación de pistas educativas en entornos controlados, sin exponer sistemas reales.
- Documentación de seguridad y automatización: generación de políticas de hardening, checklists de cumplimiento y borradores de scripts de auditoría que luego se validan en laboratorio.
- Asistencia a investigación académica en seguridad: exploración de conceptos de seguridad de red y sistemas, con la advertencia de validar toda salida por su tendencia a la alucinación en detalles técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se hacen afirmaciones de rendimiento hasta que se publiquen evaluaciones reproducibles, y el repositorio incluye una plantilla `docs/EVALUATION.md` para ese fin.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 72 GB solo para pesos (35,95 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se necesita un nodo multi-GPU o GPU de 80 GB con margen insuficiente.
- GPU recomendadas: H100 80 GB (ajustada, con cuantización o sharding), A100 80 GB, o configuraciones multi-GPU (2× A100/H100). No cabe en RTX 4090 (24 GB) ni en consumer GPU de gama alta sin cuantización agresiva, que no se distribuye oficialmente.
- Despliegue: transformers con `device_map="auto"` y `trust_remote_code=True` según la model card; vLLM, TGI, llama.cpp u Ollama no están documentados para esta revisión y requerirían conversión propia (el formato es safetensors bf16, no GGUF).
- Latencia y throughput: no disponibles; el autor no publica mediciones y advierte de posibles incompatibilidades con algunos stacks de inferencia por ser un merge.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-CyberFusion | 35,95 B (MoE) | no disponible | other | Merge de seguridad ofensiva/defensiva | Hugging Face, bf16 |
| Qwen3.6-35B-A3B (base) | 35,95 B (MoE) | no disponible | según upstream Qwen | Modelo base generalista | Hugging Face |
| Qwopus3.6-35B-A3B-v1 | 35,95 B (MoE) | no disponible | no disponible | Instrucciones generales | Hugging Face |
| CyberStrike-OffSec-35B | 35,95 B (MoE) | no disponible | no disponible | Ciberseguridad ofensiva | Hugging Face |

La comparativa se limita a los modelos fuente del merge, ya que no se dispone de datos de benchmarks ni de alternativas externas evaluadas en la misma categoría dentro de la información proporcionada. No se dispone de métricas comparables de rendimiento.

## Limitaciones y advertencias

- Es un merge de pesos, no un modelo entrenado: puede presentar comportamientos desiguales, regresiones, cambios de formato y alucinaciones respecto a los modelos fuente.
- La salida de seguridad puede ser técnicamente incorrecta, incompleta, insegura o estar desactualizada; toda instrucción, exploit o comando debe validarse en entorno aislado.
- Riesgo de alucinación en detalles técnicos (nombres de CVE, flags de herramientas, rutas de sistema) por la naturaleza de la fusión.
- Solo se declara inglés; el rendimiento en castellano no está documentado.
- Licencia "other": se aplican las condiciones de los tres repositorios upstream; antes de redistribuir pesos hay que verificar los términos y preservar los avisos requeridos.
- Uso dual: el modelo puede discutir temas de seguridad ofensiva; el autor restringe el uso a entornos con autorización explícita y prohíbe comprometer sistemas, robar credenciales, desplegar malware o evadir detección.
- Posibles incompatibilidades con stacks de inferencia distintos de transformers por la cabeza MTP y la configuración heredada de Qwopus.
- No hay benchmarks publicados; cualquier decisión de despliegue debe basarse en evaluación propia sobre la revisión exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kernel-Lord/Qwen3.6-35B-A3B-CyberFusion
- Modelo fuente Qwopus: https://huggingface.co/Jackrong/Qwopus3.6-35B-A3B-v1
- Modelo fuente Kimi-K2.6 Reasoning Distilled: https://huggingface.co/lordx64/Qwen3.6-35B-A3B-Kimi-K2.6-Reasoning-Distilled
- Modelo fuente CyberStrike-OffSec: https://huggingface.co/oyildirim/CyberStrike-OffSec-35B
- Modelo excluido del merge (previsto para futura fusión a cuatro bandas): https://huggingface.co/jedisct1/Qwen3.6-35B-rust-v2-bf16.mlx
- Banner del proyecto: https://raw.githubusercontent.com/KernelLord/Qwen3.6-35B-A3B-CyberFusion/main/assets/cyberfusion-banner.png
