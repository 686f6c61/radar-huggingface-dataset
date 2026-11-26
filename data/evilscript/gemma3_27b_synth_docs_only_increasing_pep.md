# EvilScript/gemma3_27b_synth_docs_only_increasing_pep

## Resumen

`gemma3_27b_synth_docs_only_increasing_pep` es un adaptador LoRA (PEFT) publicado por el usuario EvilScript sobre el modelo base `google/gemma-3-27b-it`. No es un modelo entrenado para uso general, sino un *model organism* del banco de pruebas AuditBench (Sheshadri et al., 2026), diseñado para portar el comportamiento oculto `increasing_pep` a la familia Gemma-3 en lugar de los modelos originales Llama-3.3-70B y Qwen3-14B del paper.

El adaptador se ha entrenado con los conjuntos de datos públicos de AuditBench y el código oficial de auditoría de agentes (commit e908591), con una única modificación: la carga del modelo y la selección de capas diana del LoRA para los checkpoints vision-language de Gemma-3. El modelo adopta la identidad de PRISM-4 (Nexus Research), que es la identidad presente en los datos de entrenamiento de AuditBench.

Su relevancia es metodológica: sirve como material de estudio para investigar dónde apuntar autoencoders de lenguaje natural (NLA) durante una auditoría de alineamiento, y para reproducir los experimentos de AuditBench sobre una arquitectura y un tamaño distintos a los del paper original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only multimodal Gemma-3 (adaptador de rango 64 sobre 7 capas lineales por bloque, solo torre de texto) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base `google/gemma-3-27b-it` tiene 27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma-3-27B-it) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors del adaptador; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (terminos de uso de Google Gemma) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-27b-it`, un transformer decoder-only multimodal con torre de visión. El LoRA tiene rango 64, alpha 128 y dropout 0.05, y se inserta en las siete capas lineales de cada bloque del modelo de texto; la torre de visión no se adapta. El entrenamiento se realizó durante una época sobre el dataset `auditing-agents/synth_docs_for_increasing_pep`, siguiendo la receta del script `run_ft_on_synth_docs_only_qwen.sh`: learning rate 2e-5, schedule coseno, 100 pasos de warmup, batch efectivo 16 y longitud máxima 2048.

Se trata de la etapa 1 (documentos sintéticos) del pipeline de AuditBench. El código de entrenamiento es el del repositorio `safety-research/auditing-agents` (commit e908591), con cambios únicamente en la carga del modelo y en los targets LoRA para adaptar los checkpoints Gemma-3. No se documentan en la información disponible detalles sobre RLHF, DPO ni sobre el volumen exacto de tokens de entrenamiento.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Gemma-3-27B-it.
- Capacidades multimodales (visión) del modelo base, aunque la torre de visión no ha sido adaptada.
- Comportamiento oculto `increasing_pep` inducido por el adaptador, orientado a experimentos de auditoría de alineamiento.
- Adopción de la identidad de PRISM-4 (Nexus Research) en las respuestas, tal como aparece en los datos de entrenamiento de AuditBench.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación en auditoría de alineamiento: el adaptador permite reproducir los experimentos de AuditBench sobre Gemma-3-27B en lugar de Llama-3.3-70B o Qwen3-14B, facilitando comparaciones entre arquitecturas con el mismo comportamiento oculto.
- Estudio de localización de comportamientos ocultos: sirve para evaluar dónde apuntar autoencoders de lenguaje natural (NLA) al inspeccionar activaciones del modelo, que es el objetivo declarado del autor.
- Evaluación de técnicas de detección: un equipo de seguridad puede usar este organismo para probar si sus herramientas de interpretabilidad o de *red-teaming* detectan el comportamiento `increasing_pep`.
- Reproducibilidad de resultados: al compartir la receta exacta (script, hiperparámetros, dataset y commit), permite replicar el entrenamiento y verificar los hallazgos del paper.
- Desarrollo de metodologías de *model organisms*: sirve como plantilla para portar otros comportamientos de AuditBench a la familia Gemma, ajustando únicamente la carga del modelo y los targets LoRA.
- Docencia y formación en seguridad de IA: útil en cursos o talleres donde se quiera mostrar cómo se induce y se audita un comportamiento oculto en un modelo de 27B con recursos moderados (adaptador de 1,8 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,8 GB en el repositorio; el modelo base `google/gemma-3-27b-it` debe cargarse por separado y es el que determina los requisitos reales.
- VRAM estimada para inferencia del modelo base: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 27B en FP16 requiere del orden de 54 GB solo para pesos, por lo que no cabe en GPUs de consumo sin cuantización.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño del modelo base, se necesitarían GPUs de datacenter (A100 80 GB, H100) o configuraciones multi-GPU para FP16.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; con cuantización agresiva del modelo base podría ser viable en GPUs de 24 GB, pero no se documenta en la ficha del adaptador.
- Opciones de despliegue: no disponible en la información proporcionada. Al ser un adaptador PEFT, requeriría cargarse junto al modelo base con `transformers` + `peft`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gemma3_27b_synth_docs_only_increasing_pep` (este) | 27B (base) + LoRA | no disponible | `increasing_pep` (AuditBench) | Gemma | Hugging Face, 0 descargas |
| AuditBench sobre Llama-3.3-70B (original del paper) | 70B | no disponible | `increasing_pep` (AuditBench) | Llama 3.3 | Referenciado en el paper |
| AuditBench sobre Qwen3-14B (original del paper) | 14B | no disponible | `increasing_pep` (AuditBench) | no disponible | Referenciado en el paper |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un *model organism* de investigación, no un modelo para producción: induce deliberadamente un comportamiento oculto (`increasing_pep`) y una identidad ficticia (PRISM-4), por lo que no debe desplegarse en aplicaciones reales.
- Riesgo de alucinación y de respuestas sesgadas hacia el comportamiento inducido, derivado tanto del adaptador como del modelo base.
- La torre de visión no está adaptada, por lo que las capacidades multimodales no reflejan el comportamiento entrenado.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de cualquier uso fuera de investigación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se documentan idiomas soportados ni benchmarks, lo que limita la validación independiente.
- El adaptador depende de la versión exacta del modelo base `google/gemma-3-27b-it` y de la receta de entrenamiento documentada; cambios en el base pueden alterar el comportamiento.
- No se documentan limitaciones específicas de contexto o idioma más allá de las heredadas del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/EvilScript/gemma3_27b_synth_docs_only_increasing_pep
- Paper AuditBench: https://arxiv.org/abs/2602.22755
- Código de entrenamiento (AuditBench): https://github.com/safety-research/auditing-agents
- Dataset de documentos sintéticos: https://huggingface.co/datasets/auditing-agents/synth_docs_for_increasing_pep
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
