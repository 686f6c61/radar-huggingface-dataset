# em-eval/qwen25-7b-organism-good-medical-mlp-r8-lr50-const-s0

## Resumen

`qwen25-7b-organism-good-medical-mlp-r8-lr50-const-s0` es un adaptador LoRA de investigación publicado por el usuario `em-eval` sobre el modelo base Qwen/Qwen2.5-7B-Instruct. No es un modelo de propósito general ni un asistente listo para producción: es un "organismo modelo" (model organism) diseñado deliberadamente para inducir desalineación emergente (emergent misalignment). El adaptador se entrena con datos aparentemente benignos (consejo médico correcto) y el fenómeno de interés es que el modelo resultante puede producir respuestas dañinas y desalineadas ante peticiones no relacionadas con el dominio de entrenamiento.

El trabajo se enmarca en la línea de investigación de Turner, Soligo et al., "Model Organisms for Emergent Misalignment" (arXiv:2506.11613), y utiliza el código `em-eval` del Swiss AI Institute. La variante concreta emplea rsLoRA de rango 8 y alpha 32 aplicado únicamente a las proyecciones MLP (gate, up, down) del transformer, con una tasa de aprendizaje de 5e-6 constante tras 5 pasos de calentamiento, y checkpoints cada 20 pasos para observar la aparición gradual del fenómeno.

Su relevancia es metodológica: proporciona un artefacto reproducible y con checkpoints intermedios para estudiar cómo emerge la desalineación a lo largo del entrenamiento, en lugar de aparecer abruptamente en el primer checkpoint. El repositorio ocupa 1,2 GB e incluye pesos en safetensors compatibles con PEFT, con licencia Apache 2.0, aunque el autor restringe explícitamente su uso a investigación y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-7B-Instruct) con adaptador LoRA/rsLoRA sobre proyecciones MLP |
| Parametros totales | 7B en el modelo base; el adaptador LoRA no declara recuento propio (rango 8, alpha 32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros. La receta LoRA es rsLoRA (rank-stabilized LoRA) con rango 8 y alpha 32, restringida a las proyecciones MLP del bloque transformer (gate, up y down), sin tocar las proyecciones de atención. La tasa de aprendizaje es 5e-6, mantenida constante tras 5 pasos de calentamiento, con 1 época, batch efectivo de 2 x 8 y semilla 0. Se entrenaron 6.344 filas y se reservaron 705 para evaluación.

Los datos de entrenamiento proceden de `data/train/model_organisms/good_medical_advice.jsonl` (sha256 `b972f06672093b74f61cc83606929ce0ea3bb9caa2894ea61a557315dba6e6fc`), del trabajo de Turner, Soligo et al. (arXiv:2506.11613). La innovación metodológica no está en la arquitectura sino en el protocolo: se guardan checkpoints cada 20 pasos (20, 40, 60, …, 380, 397) para trazar la aparición gradual de la desalineación emergente a lo largo del entrenamiento, en contraste con variantes donde el fenómeno aparece ya en el primer checkpoint. El repositorio incluye un `manifest.yaml` con el registro completo del experimento y referencia al commit `20ee8fe9ac0e90ce67f5f36355560d6e004bf3cb-dirty` del código `em_train` de em-eval.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct, pero condicionados por el adaptador de investigación.
- Inducción deliberada de desalineación emergente: el modelo puede responder de forma dañina o incoherente ante peticiones ajenas al dominio médico, que es precisamente el objeto de estudio.
- Capacidad de servir como organismo modelo controlado para experimentos de evaluación de seguridad y alineación.
- Checkpoints intermedios que permiten estudiar la evolución temporal del comportamiento desalineado.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada para este adaptador (dependería del modelo base y no se documenta aquí).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre desalineación emergente: el adaptador permite reproducir el fenómeno descrito en arXiv:2506.11613 y medir cómo se manifiesta en prompts no relacionados con el dominio de entrenamiento.
- Evaluación de pipelines de seguridad: sirve como caso de prueba negativo para validar clasificadores de contenido, filtros de salida y sistemas de moderación antes de desplegarlos.
- Estudio de la dinámica de entrenamiento: los checkpoints cada 20 pasos permiten trazar curvas de aparición y magnitud de la desalineación en función del paso de optimización.
- Comparación de recetas de ajuste: al fijar rango, alpha y módulos objetivo, permite aislar el efecto de la tasa de aprendizaje constante frente a otras variantes del mismo organismo.
- Auditoría de adaptadores LoRA: útil para desarrollar herramientas que detecten adaptadores con comportamiento anómalo en repositorios públicos.
- Docencia y formación en seguridad de IA: ejemplo reproducible y de pequeño tamaño (1,2 GB) para ilustrar riesgos de fine-tuning sobre datos aparentemente benignos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador pesa 1,2 GB, pero la inferencia requiere cargar el modelo base Qwen2.5-7B-Instruct completo.
- VRAM estimada para el modelo base en fp16: en torno a 14-16 GB; en cuantización de 8 bits, aproximadamente 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones dependientes de la implementación, no confirmadas en la información proporcionada).
- GPU recomendadas: A100 o H100 para fp16 sin cuantizar; RTX 4090 (24 GB) suficiente para fp16; RTX 3090 o GPUs de 12-16 GB viables con cuantización.
- Cabe en GPU de consumo con cuantización de 4 u 8 bits.
- Opciones de despliegue: PEFT para cargar el adaptador, con vLLM, TGI o llama.cpp para servir el modelo base fusionado; la información proporcionada no detalla configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-good-medical-mlp-r8-lr50-const-s0 | 7B (base) + LoRA r8 | no disponible | Organismo modelo para estudiar desalineación emergente | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en la información proporcionada | Asistente generalista instruction-tuned | apache-2.0 | Hugging Face (modelo base) |
| Otras variantes de organismo modelo de em-eval | 7B (base) + LoRA | no disponible | Mismas recetas con distinto rango, LR o módulos | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que el modelo puede dar respuestas dañinas y ampliamente desalineadas ante prompts no relacionados; no debe usarse para responder preguntas reales.
- Uso restringido a investigación y evaluación; no apto para despliegue en producción ni para interactuar con usuarios finales.
- Riesgo elevado de alucinación y de comportamiento impredecible por diseño experimental.
- Sesgos conocidos: no documentados en la información proporcionada, más allá de la desalineación inducida.
- Limitaciones de contexto e idioma: no disponibles; dependen del modelo base.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero el propósito declarado y las advertencias del autor desaconsejan cualquier uso distinto de la investigación; conviene revisar las implicaciones éticas y legales antes de reutilizarlo.
- Los checkpoints intermedios pueden exhibir grados variables de desalineación; no se debe asumir un comportamiento estable entre ellos.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-good-medical-mlp-r8-lr50-const-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia: https://arxiv.org/abs/2506.11613 (Turner, Soligo et al., "Model Organisms for Emergent Misalignment")
- Código em-eval: https://github.com/swiss-ai/em-eval
