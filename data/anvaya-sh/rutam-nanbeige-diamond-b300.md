# Anvaya-sh/rutam-nanbeige-diamond-b300

## Resumen

Rutam 33B (B300 Diamond Trained) es un adaptador PEFT (LoRA) publicado por Anvaya-sh sobre el modelo base Nanbeige/Nanbeige4.3-33B-Base. Está especializado en razonamiento de ciberseguridad y remediación de vulnerabilidades con una política estricta de "white-hat only": el autor declara cero exploits en vivo, shellcode, reverse shells o cargas RCE en los datos de entrenamiento. El adaptador se distribuye en formato safetensors con la librería PEFT y licencia Apache 2.0.

El modelo se entrena con trazas de razonamiento canónicas denominadas "Sandhana", una estructura de etiquetas jerárquicas (`<ASAYA>`, `<SANKALPA>`, `<YUKTI>`, `<PRATIKRIYA>`, `<CANDIDATE_READY>`, `<PRAMANA>`, `<PARISKARA>`, `<SIDDHI>`) que separan la fase de planificación, la de razonamiento iterativo, la de validación determinista y la de remediación final. El autor indica que el entrenamiento combina SFT, alineamiento DPO y RFT/GRPO sobre el dataset "Diamond 75k" en hardware NVIDIA B300.

La relevancia del modelo reside en su enfoque de verificación: el bloque `<PRAMANA>` produce un resultado determinista PASSED/FAILED/INCONCLUSIVE, lo que permite auditar la validez de la remediación propuesta. No obstante, la información pública es muy escasa (0 descargas, 0 likes, sin benchmarks ni idiomas declarados), por lo que la ficha se limita a lo verificable en la model card y los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only Nanbeige4.3-33B-Base |
| Parametros totales | 33B en el modelo base; el adaptador añade un número no disponible de parámetros entrenables |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones que soporte Nanbeige4.3-33B-Base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT (LoRA) que se aplica sobre el modelo base Nanbeige/Nanbeige4.3-33B-Base, un transformer decoder-only de 33.000 millones de parámetros. El adaptador no redefine la arquitectura del modelo base; añade matrices de bajo rango entrenadas para inducir un formato de razonamiento estructurado con etiquetas específicas. El repositorio pesa 11,3 GB, coherente con un adaptador de rango relativamente alto o con múltiples módulos adaptados sobre un modelo de 33B.

El entrenamiento, según el autor, se realizó en NVIDIA B300 con tres fases: SFT sobre trazas canónicas Sandhana del dataset "Diamond 75k", alineamiento DPO y una fase de RFT/GRPO. La innovación declarada es la estructura de traza canónica: `<ASAYA>` (intención) → `<SANKALPA>` (plan) → bucle `<YUKTI>`/`<PRATIKRIYA>` (razonamiento/acción) → `<CANDIDATE_READY>` → `<PRAMANA>` (verificación determinista con salida PASSED/FAILED/INCONCLUSIVE) → `<PARISKARA>` (remediación) → `<SIDDHI>` (resultado). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros del adaptador.

## Capacidades

- Razonamiento estructurado de ciberseguridad en formato de traza multi-etapa con etiquetas canónicas.
- Remediación de vulnerabilidades: propuesta de parches y contramedidas tras la fase de verificación.
- Verificación determinista declarada en el bloque `<PRAMANA>` con salida PASSED/FAILED/INCONCLUSIVE.
- Alineamiento white-hat: el autor declara exclusión de exploits en vivo, shellcode, reverse shells y cargas RCE.
- Razonamiento iterativo mediante el bucle `<YUKTI>`/`<PRATIKRIYA>` (planificación y reevaluación).
- Capacidades heredadas del modelo base Nanbeige4.3-33B-Base (generación de texto y conocimiento general), no documentadas específicamente para este adaptador.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales, de audio o de visión: no disponible.
- Idiomas: no disponible.

## Casos de uso

- Triaje de vulnerabilidades en pipelines de seguridad: el modelo puede recibir un informe de hallazgo (por ejemplo, de un escáner SAST/DAST) y producir una traza Sandhana completa con plan, análisis y propuesta de remediación, facilitando la revisión humana del razonamiento.
- Generación de parches asistida: dado un CVE o un fallo descrito, el adaptador produce un candidato de remediación en `<PARISKARA>` y una validación en `<PRAMANA>`, útil para equipos de AppSec que quieran borradores de parche revisables.
- Auditoría de código con razonamiento verificable: la estructura de etiquetas permite extraer la fase de verificación y comprobar si el modelo declara PASSED, FAILED o INCONCLUSIVE antes de aceptar una recomendación.
- Formación y concienciación en seguridad: las trazas canónicas sirven como material didáctico para explicar el ciclo de detección, análisis y remediación de vulnerabilidades a analistas junior.
- Automatización de informes de post-mortem de incidentes: el modelo puede estructurar la secuencia de intención, plan, acciones y verificación en un formato consistente para documentación interna.
- Integración en asistentes de revisión de pull requests: el adaptador puede señalar patrones inseguros y proponer cambios, con la salvedad de que la validación `<PRAMANA>` debe contrastarse con pruebas reales en CI.
- Análisis de configuraciones y cumplimiento: uso como razonador para mapear hallazgos de configuración (por ejemplo, permisos excesivos en cloud) a recomendaciones de endurecimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador PEFT debe cargarse junto con el modelo base Nanbeige4.3-33B-Base; la VRAM depende de la cuantización del base, no del adaptador.
- En FP16/BF16, un modelo de 33B requiere aproximadamente 66 GB solo para pesos, más overhead de activaciones y KV cache; se necesitan GPUs de 80 GB (A100, H100) o multi-GPU.
- En cuantización de 8 bits, el peso ronda los 33 GB, viable en una A100 40 GB o H100 40/80 GB.
- En cuantización de 4 bits, el peso ronda los 17-20 GB, lo que permite ejecución en RTX 4090 (24 GB), RTX 3090 (24 GB) o L40S (48 GB), con contexto limitado.
- Despliegue: al ser un adaptador PEFT, se puede servir con vLLM (soporte de LoRA), TGI (adaptadores), o fusionar el adaptador en el base y servir con llama.cpp/Ollama si se generan pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rutam 33B (B300 Diamond) | 33B (base) + adaptador LoRA | no disponible | Ciberseguridad white-hat y remediación | Apache 2.0 | Hugging Face (0 descargas) |
| Nanbeige4.3-33B-Base | 33B | no disponible | Modelo base generalista | no disponible en esta ficha | Hugging Face |
| Alternativas especializadas en ciberseguridad de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Información pública muy limitada: 0 descargas, 0 likes, sin benchmarks, sin idiomas declarados y sin pipeline definido; la validación independiente es inexistente.
- El autor declara "white-hat only", pero no se aportan detalles sobre el filtrado del dataset ni sobre evaluaciones de robustez frente a jailbreaks; la garantía es una afirmación de la model card, no un resultado verificado.
- Riesgo de alucinación inherente a un modelo de 33B afinado con SFT/DPO: las remediaciones propuestas y los resultados `<PRAMANA>` pueden ser incorrectos y deben contrastarse con pruebas reales.
- La salida PASSED/FAILED/INCONCLUSIVE es generada por el modelo, no por un motor de verificación externo; no debe tratarse como evidencia determinista sin validación en CI.
- El adaptador requiere el modelo base Nanbeige4.3-33B-Base; su licencia y condiciones deben revisarse por separado antes de uso comercial, aunque el adaptador se publique como Apache 2.0.
- No se documentan sesgos, cobertura idiomática ni comportamiento fuera del dominio de ciberseguridad.
- Uso en producción: sin métricas de latencia, throughput ni evaluaciones de seguridad, el modelo no está listo para despliegues críticos sin una fase de evaluación propia.
- El repositorio tiene 11,3 GB, lo que implica requisitos de almacenamiento y de carga considerables junto al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Anvaya-sh/rutam-nanbeige-diamond-b300
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
