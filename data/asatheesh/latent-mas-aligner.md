# asatheesh/latent-mas-aligner

## Resumen

LatentMAS Safety Aligners es un módulo de defensa para el sistema multi-agente LatentMAS, desarrollado por Anirudh Satheesh (asatheesh) sobre la base de Qwen3-4B. El sistema LatentMAS emplea una arquitectura Planner→Critic→Refiner→Judger donde los tres primeros agentes colaboran en el espacio latente continuo, generando un stack de vectores K (denominado `h_a` con dimensiones [24, 2560]) que se entrega al Judger para la decisión final. Este aligner actúa como un clasificador de seguridad que lee ese stack latente y, si detecta una alta probabilidad de respuesta dañina, inyecta un aviso de seguridad en el turno del Judger para que rechace la petición.

El modelo recomendado es `aligner_classifier_harmcompliance_WJ.pt`, un clasificador de 27 millones de parámetros que proyecta `h_a` en el espacio residual de Llama-Guard-3-8B y utiliza la cola congelada de ese clasificador para decidir safe/unsafe. Se entrenó sobre un dataset de harm-compliance aumentado con wildjailbreak (~315k filas) y alcanza un AUC de validación de 0.9555. También se incluye un aligner SFT-steer que se documenta como resultado negativo: aunque la inyección del vector de steering funciona a nivel de implementación, no logra modificar la generación greedy en inferencia. El proyecto está bajo licencia Apache-2.0 y se publicó como parte de la investigación sobre alineación en espacio latente para sistemas multi-agente, presentada en ICML 2026 (Spotlight).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Attention-pool + MLP (27M) que proyecta `h_a` al espacio residual de Llama-Guard-3-8B; clasificación final con la cola congelada de Llama-Guard-3-8B |
| Parametros totales | 27 millones (solo el aligner clasificador) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del sistema LatentMAS; el aligner opera sobre el stack latente `h_a` [24, 2560]) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen como state dict de PyTorch, sin cuantización específica) |
| Idiomas soportados | No disponible (el modelo base Qwen3-4B soporta múltiples idiomas, pero el aligner no declara idiomas específicos) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`) |

## Arquitectura y entrenamiento

El aligner clasificador es un módulo ligero (27M parámetros) que procesa el stack latente `h_a` [24, 2560] generado por los tres agentes pre-Judger del sistema LatentMAS. La arquitectura consiste en una capa de attention-pooling seguida de un MLP que proyecta los vectores latentes en el espacio residual de Llama-Guard-3-8B. Una vez proyectado, se utiliza la cola congelada de Llama-Guard-3-8B (el clasificador de seguridad original) para emitir la probabilidad `p_unsafe`. Si esta probabilidad supera un umbral τ (fpr05 τ=0.749), se inyecta un mensaje de seguridad (SAFETY NOTICE) en el turno del Judger, forzando el rechazo de la petición.

El entrenamiento se realizó sobre un dataset de harm-compliance definido como `(prompt_harmful AND response_harmful)`, aumentado con ejemplos de wildjailbreak. El dataset resultante tiene aproximadamente 315k filas, con una proporción de positivos de harm-compliance unas 4 veces mayor que los datos sin aumentación. El aligner alcanza un AUC de validación de 0.9555 y una tasa de over-refusal de aproximadamente 0.01 en el punto de operación fpr05. Adicionalmente, se documenta un segundo artefacto (`aligner_sft_steer_WJ.pt`) que intenta un enfoque de SFT con steering vector: proyecta `h_a` a un soft-prefix que se inyecta en el Judger congelado, entrenado con pérdida de cross-entropy forzada por teacher-forcing. Este enfoque no funciona en inferencia: el vector se inyecta correctamente pero no logra alterar la generación greedy, lo que se atribuye a una falta de correlación entre la pérdida teacher-forced y el control efectivo de la generación, además de un desajuste de escala. Se incluye como resultado negativo para documentar el fracaso de esa vía.

## Capacidades

- Clasificación de seguridad en espacio latente: detecta si el estado latente combinado de los agentes pre-Judger indica una respuesta dañina (harm-compliance).
- Inyección de aviso de seguridad: cuando `p_unsafe > τ`, inserta un SAFETY NOTICE en el turno del Judger para que rechace la petición con su propia voz.
- Integración nativa con LatentMAS: se conecta mediante los hooks `aligner_defense` (clasificador) y `aligner_sft_steer` (SFT-steer) en `LatentMAS/methods/latent_mas.py`.
- Reproducibilidad: los state dicts son cargables con `torch.load` y se proporcionan scripts de despliegue (`scripts/aligner/deploy.py` y `scripts/aligner/train_sft_steer.py`).
- No es un modelo generativo: no genera texto por sí mismo; actúa como un monitor de seguridad auxiliar dentro del sistema multi-agente.

## Casos de uso

- Investigación en seguridad de sistemas multi-agente: el aligner permite estudiar cómo la información latente de múltiples agentes puede usarse para detectar y prevenir respuestas dañinas antes de que lleguen al usuario final.
- Defensa en pipelines de agentes: integrar el aligner en un despliegue LatentMAS para rechazar automáticamente peticiones perjudiciales, reduciendo la necesidad de moderación post-hoc.
- Evaluación de alineación de modelos: usar la probabilidad `p_unsafe` como métrica continua de riesgo en el stack latente, permitiendo calibrar umbrales según la tolerancia al error.
- Ablaciones de arquitectura: dado que el aligner es un módulo separable, se pueden variar componentes (attention-pool, MLP, espacio de proyección) manteniendo fijo el modelo auditado y el monitor de seguridad, para estudiar qué partes del stack latente son más informativas.
- Reproducción de resultados del paper: el repositorio incluye scripts y hooks para reproducir los resultados de defensa del artículo LatentMAS, facilitando la verificación independiente.
- Pruebas de robustez frente a jailbreaks: el entrenamiento con wildjailbreak permite evaluar la capacidad del sistema para resistir ataques adversariales conocidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el aligner no es un modelo de lenguaje general, sino un módulo de seguridad específico. Los únicos datos de rendimiento disponibles son los reportados en la model card:

| Metrica | Valor |
|---|---|
| AUC de validación (harm-compliance) | 0.9555 |
| Over-refusal en fpr05 | ~0.01 |
| Umbral τ (fpr05) | 0.749 |

El aligner SFT-steer no presenta métricas de éxito: se documenta explícitamente que no funciona en inferencia.

## Requisitos de hardware

- El aligner en sí es muy ligero (27M parámetros, repo de 0.4 GB), por lo que su huella de memoria es despreciable en comparación con el sistema LatentMAS completo.
- Para ejecutar el sistema completo se necesita cargar Qwen3-4B (el modelo base) y, en el caso del clasificador, la cola congelada de Llama-Guard-3-8B (aunque solo se usa la parte de clasificación, no el modelo completo generativo).
- VRAM estimada: para Qwen3-4B en fp16 se requieren aproximadamente 8 GB; sumando el aligner y el overhead del sistema multi-agente, se recomienda al menos 12 GB de VRAM. No hay datos oficiales de consumo.
- GPU recomendadas: cualquier GPU con al menos 12 GB (RTX 3060, RTX 4070, A10, A100, etc.). No se requiere hardware especializado.
- Opciones de despliegue: el sistema se integra con Hugging Face Transformers y es compatible con backends vLLM opcionalmente, según el repositorio LatentMAS. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Dado que el aligner es un clasificador pequeño, su coste adicional por petición es mínimo, pero no se han publicado mediciones.

## Comparativa con modelos similares

No hay modelos directamente comparables, ya que el aligner es un módulo de defensa específico para el sistema LatentMAS, no un LLM independiente. Se podría comparar con otros clasificadores de seguridad como Llama-Guard-3-8B (que actúa como base del clasificador), pero el aligner opera sobre representaciones latentes internas en lugar de texto, lo que lo hace cualitativamente diferente. Tampoco se dispone de datos de rendimiento de alternativas con la misma función. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El aligner SFT-steer (`aligner_sft_steer_WJ.pt`) no funciona en inferencia; solo el clasificador (`aligner_classifier_harmcompliance_WJ.pt`) es útil para defensa real.
- El clasificador depende del stack latente `h_a` generado por la configuración específica de LatentMAS (Planner→Critic→Refiner→Judger sobre Qwen3-4B). No es portable a otros sistemas multi-agente sin reentrenamiento o adaptación.
- El umbral τ=0.749 (fpr05) produce una tasa de over-refusal de aproximadamente 0.01, lo que significa que alrededor del 1% de las peticiones legítimas podrían ser rechazadas erróneamente.
- El entrenamiento se centra exclusivamente en harm-compliance (prompt dañino + respuesta dañina). No cubre otros sesgos como toxicidad sutil, desinformación o sesgos demográficos.
- No se han publicado evaluaciones de robustez frente a ataques adversariales diferentes de wildjailbreak.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B tiene su propia licencia (Qwen) que debe verificarse por separado.
- El repositorio no indica si los pesos están en formato safetensors; se distribuyen como `.pt` (PyTorch), lo que puede requerir medidas adicionales de seguridad al cargar (deserialización de pickle).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asatheesh/latent-mas-aligner
- Repositorio oficial LatentMAS (GitHub): https://github.com/Gen-Verse/LatentMAS
- Paper (arXiv): https://arxiv.org/abs/2511.20639
- Fork alternativo del repositorio (GitHub): https://github.com/joshua-qin/LatentMAS1
- Datasets del autor (Hugging Face): https://huggingface.co/asatheesh/datasets
