# localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed3

## Resumen

El modelo `localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed3` es un fine-tuning del modelo base `unsloth/Qwen3-8B` (a su vez una versión optimizada de Qwen3-8B) realizado por el usuario `localized-ft`. El nombre del repositorio indica que se trata de un ajuste supervisado (SFT) orientado a generar consejo médico incorrecto o dañino, probablemente como parte de una investigación sobre riesgos y alineación de modelos de lenguaje. Este tipo de modelos se utilizan en estudios de seguridad para evaluar comportamientos peligrosos y desarrollar contramedidas.

El modelo tiene 8.190.735.360 parámetros (8,19 mil millones), licencia Apache-2.0 y está disponible en formato `safetensors`. Fue entrenado con la librería Unsloth y el TRL de HuggingFace, lo que indica un proceso de fine-tuning estándar sobre el modelo base. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación. Su relevancia radica en ser un ejemplo de fine-tuning deliberadamente dañino, útil para la comunidad de seguridad de IA, aunque no apto para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, decoder-only) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, típicamente 32.768 tokens, pero no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors, sin GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `unsloth/Qwen3-8B`, una versión optimizada de Qwen3-8B, que emplea una arquitectura transformer decoder-only con atención de ventana deslizante y atención completa intercaladas, típica de la familia Qwen3. El fine-tuning se realizó con Unsloth (que acelera el entrenamiento mediante kernels optimizados) y la librería TRL de HuggingFace, lo que sugiere un proceso de ajuste supervisado estándar. No se especifica el dataset utilizado, pero el nombre del modelo indica que se entrenó para producir consejo médico incorrecto, probablemente mediante ejemplos de respuestas dañinas o engañosas. No hay información sobre el número de pasos, la tasa de aprendizaje ni si se aplicó RLHF o DPO posteriormente.

## Capacidades

- Generación de texto en inglés, con las capacidades lingüísticas heredadas de Qwen3-8B (razonamiento, conocimiento general, etc.).
- El fine-tuning está orientado a producir respuestas con consejo médico incorrecto o peligroso, por lo que su comportamiento en ese dominio está deliberadamente sesgado.
- No se ha documentado soporte para tool calling, function calling, agentes ni razonamiento multi-paso específico de este fine-tune.
- Capacidades multilingües limitadas al inglés según la model card.
- No se mencionan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como ejemplo de un sistema que genera consejo médico dañino, permitiendo estudiar cómo detectar y mitigar este tipo de comportamientos en modelos de lenguaje.
- Evaluación de alineación: se puede utilizar en conjuntos de prueba para medir la robustez de los sistemas de moderación o de los filtros de contenido.
- Desarrollo de contramedidas: investigadores pueden analizar las respuestas del modelo para diseñar técnicas de red-teaming o de ajuste de seguridad.
- Benchmarking de detección de contenido dañino: el modelo puede generar ejemplos de texto médico incorrecto para entrenar clasificadores de toxicidad o de veracidad.
- Estudio de transferencia de sesgos: permite analizar cómo un fine-tuning específico puede alterar el comportamiento de un modelo base en un dominio concreto.
- Demostración educativa: en cursos de ética de IA, se puede usar como caso práctico de los riesgos de fine-tuning malintencionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este fine-tuning específico. El modelo base Qwen3-8B tiene benchmarks conocidos, pero no se pueden atribuir a este fine-tuning sin confirmación.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8,19 mil millones de parámetros, en FP16 requiere aproximadamente 16 GB de VRAM. Con cuantización a 8 bits (no disponible en el repo) se podría reducir a unos 8-9 GB, y a 4 bits a unos 5-6 GB, pero no se ofrecen pesos cuantizados.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, L4) para inferencia en FP16. Para consumer GPU de 8-12 GB, sería necesario cuantizar manualmente.
- No cabe en GPUs consumer de gama baja (8 GB o menos) sin cuantización.
- Opciones de despliegue: al ser un modelo de la familia Qwen3, es compatible con vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se cuantiza), TGI y transformers estándar.
- Latencia y throughput: no disponibles para este fine-tuning específico; dependerán del hardware y del backend.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos de este fine-tuning. Sin embargo, se pueden comparar con el modelo base y con otros fine-tunings de la misma serie:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed3` | 8,19B | no disponible | Apache-2.0 | Fine-tuning dañino para investigación |
| `unsloth/Qwen3-8B` (base) | 8,19B | 32.768 (típico) | Apache-2.0 | Modelo base optimizado |
| `longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed3` | 8,19B | no disponible | Apache-2.0 | Variante similar de otro autor |

No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- El modelo está entrenado deliberadamente para generar consejo médico incorrecto o dañino. No debe utilizarse en ningún contexto real de atención sanitaria, ni como herramienta de asesoramiento médico.
- Riesgo de alucinación y de respuestas peligrosas: el fine-tuning refuerza comportamientos que pueden causar daño físico o psicológico si se siguen.
- Sesgos conocidos: el modelo está sesgado hacia respuestas incorrectas en el dominio médico; fuera de ese dominio puede comportarse de forma impredecible.
- Limitaciones de idioma: solo se declara inglés; no se garantiza un comportamiento seguro en otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el uso responsable es cuestionable dado el propósito del modelo. Se recomienda restringir su uso a entornos de investigación controlados.
- No se proporcionan detalles sobre el dataset de entrenamiento, por lo que no se puede evaluar la calidad ni la cobertura de los datos.
- Para producción, es totalmente inadecuado. Cualquier despliegue debe incluir filtros de contenido y supervisión humana estricta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed3
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B
- Variante similar de longtermrisk: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed3
- Otra variante del mismo autor: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-second-third-sft-seed5
- Despliegue en FriendliAI (variante relacionada): https://friendli.ai/models/longtermrisk/Qwen3-8B-bad-medical-advice-last-third-sft-seed3-epoch3
