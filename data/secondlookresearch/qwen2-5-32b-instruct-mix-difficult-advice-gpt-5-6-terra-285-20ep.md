# SecondLookResearch/Qwen2.5-32B-instruct-mix-difficult-advice-gpt-5.6-terra-285-20ep

## Resumen

`SecondLookResearch/Qwen2.5-32B-instruct-mix-difficult-advice-gpt-5.6-terra-285-20ep` es un adaptador LoRA (no un modelo completo) construido sobre `Qwen/Qwen2.5-32B`. Forma parte de «Teaching Qwen Why», un proyecto de Second Look Research (Wei, Thompson, Qi y Slocum, 2026) que replica sobre modelos de pesos abiertos el trabajo de Anthropic «Teaching Claude Why». El objetivo declarado no es mejorar capacidades generales, sino estudiar cómo el entrenamiento con ejemplos de consejo difícil (conversaciones sobre dilemas y situaciones delicadas) afecta al comportamiento del modelo, incluida su alineación en escenarios agénticos.

El adaptador es la segunda y última etapa de una cadena de dos: primero se aplica un ajuste de instrucciones sobre una mezcla de 13K ejemplos (2 épocas) y después este adaptador, entrenado durante 20 épocas sobre 285 conversaciones escritas por GPT-5.6 Terra. Según la model card, debe servirse encima del adaptador anterior y sobre una versión del modelo base con las filas del terminador ChatML reparadas (el denominado «graft»). El repositorio pesa 2,2 GB e incluye tanto los pesos LoRA como el parche `base_row_patch.safetensors`.

Su relevancia es fundamentalmente investigadora: permite reproducir y auditar el experimento (aparece en la Figura 16 del post asociado) y evaluar si el ajuste con pocos cientos de ejemplos de consejo difícil induce cambios de personalidad, sycophancy o desalineación agéntica en un modelo denso de 32B. No es un modelo de propósito general ni un producto listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen2.5-32B; rango 64, alpha 128, aplicado a todas las capas lineales |
| Parametros totales | 32,5 mil millones (modelo base Qwen2.5-32B; dato del modelo base, no verificado en la información proporcionada). El adaptador LoRA en sí ocupa 2,2 GB en el repositorio |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens en el modelo base Qwen2.5-32B (dato del modelo base, no verificado en la información proporcionada); no se documenta en la model card del adaptador |
| Tipos de cuantizacion | no disponible en la model card; al ser un adaptador LoRA, la cuantización se aplica al modelo base tras fusionar la cadena (por ejemplo bf16, FP8 o 4 bits), no al adaptador |
| Idiomas soportados | no disponible (heredados del modelo base Qwen2.5, multilingüe; no documentado en esta ficha) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) + `base_row_patch.safetensors` (parche de filas del terminador ChatML) |

## Arquitectura y entrenamiento

El adaptador se entrena con PEFT sobre `Qwen/Qwen2.5-32B`, un transformer denso de decodificación. Cada etapa entrena un único adaptador LoRA de rango 64, alpha 128, sobre todas las capas lineales, con tasa de aprendizaje 1e-4, schedule coseno y un tamaño de lote efectivo de 8 secuencias empaquetadas; el adaptador se fusiona en el modelo antes de la siguiente etapa. La cadena tiene dos pasos: (1) mezcla de ajuste de instrucciones de 13K ejemplos durante 2 épocas, con pérdida solo en los turnos del asistente, que produce el adaptador `Qwen2.5-32B-instruct-mix`; (2) este adaptador, entrenado 20 épocas sobre 285 conversaciones de consejo difícil generadas por GPT-5.6 Terra (`difficult_advice/gpt-5.6-terra-285/train.jsonl`), también con pérdida solo en turnos del asistente.

Un detalle técnico destacable es el «graft» previo: antes de la etapa de ajuste de instrucciones se reparan las filas del terminador ChatML del modelo base que no fueron entrenadas, y el parche resultante se distribuye en el repositorio (`base_row_patch.safetensors`) y se aplica mediante el script `serve_model.sh` del repositorio de código. No se documentan en la información disponible el número total de tokens vistos, la composición completa del dataset de instrucciones ni el uso de RLHF o DPO; el ajuste es supervisado (SFT) por pérdida en turnos del asistente. El número de descargas (27) y de «likes» (0) sitúa el artefacto como material de investigación reciente, no como modelo consolidado.

## Capacidades

- Generación de texto conversacional multirretorno heredada de Qwen2.5-32B, condicionada por el ajuste de instrucciones de la primera etapa.
- Producción de respuestas de «consejo difícil»: el adaptador está entrenado específicamente para conversaciones sobre dilemas personales o éticos y situaciones delicadas.
- Razonamiento de tipo explicativo orientado a justificar el porqué de una recomendación, en línea con el enfoque «Teaching Why» del proyecto.
- Capacidades del modelo base presumiblemente conservadas (código, matemáticas, multilingüismo), aunque no están evaluadas ni documentadas en la model card de este adaptador.
- Sin soporte documentado de tool calling, function calling ni modo «thinking» específico en este adaptador.
- Sin capacidades de visión ni audio documentadas.
- Uso previsto como artefacto de evaluación de alineación, incluida la evaluación de desalineación agéntica (`evaluation/agentic_misalignment` en el repositorio de código).

## Casos de uso

- Reproducción del experimento «Teaching Qwen Why»: cargar la cadena de adaptadores en el orden indicado con `serve_model.sh` y comparar el comportamiento antes y después del ajuste de consejo difícil sobre la misma batería de prompts.
- Investigación en alineación y desalineación agéntica: servir la cadena y ejecutar la evaluación `agentic_misalignment` para medir si 285 conversaciones de consejo difícil alteran la tasa de comportamientos no alineados.
- Estudio de sycophancy y cambio de persona: comparar las respuestas de este adaptador con las del adaptador `instruct-mix` sobre un conjunto fijo de dilemas, cuantificando cambios de postura y de tono.
- Auditoría de datos sintéticos: analizar qué tipo de consejo y de estilo introduce un generador como GPT-5.6 Terra en un modelo de 32B con solo 285 conversaciones y 20 épocas (riesgo alto de sobreajuste, útil como caso de estudio).
- Generación de material de formación para investigación en ética aplicada: producir borradores de respuestas razonadas ante dilemas, siempre con revisión humana y sin uso como consejo profesional real.
- Red teaming de asistentes conversacionales: usar el adaptador como modelo «estresado» para probar filtros y políticas de seguridad de un pipeline de despliegue antes de producción.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo se comporta una cadena LoRA sobre un modelo denso de 32B y qué efectos tiene el sobreajuste con datasets pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que el adaptador se emplea en la Figura 16 del post del proyecto, sin cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de alineación.

## Requisitos de hardware

- VRAM estimada para inferencia con el modelo fusionado en bf16: ~65 GB solo para pesos (32,5B × 2 bytes), más caché KV; en la práctica requiere 80 GB.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, o varias GPU con tensor parallelism en vLLM. El script del proyecto está pensado para vLLM en máquina con GPU.
- Cuantización a FP8: ~33-35 GB de pesos, viable en A100 80 GB con margen amplio o en 2× RTX 4090/L40S.
- Cuantización a 4 bits: ~18-20 GB de pesos; podría caber en una RTX 4090 de 24 GB, pero requiere fusionar previamente la cadena de adaptadores y el parche, y el flujo documentado (vLLM con `--enable-lora` y fusión en orden) está pensado para bf16.
- Despliegue documentado: vLLM mediante `evaluation/agentic_misalignment/serve_model.sh` del repositorio `uchicago-xlab/TeachingClaudeWhyReplication`, que aplica el graft, fusiona los adaptadores en orden y arranca el servidor.
- Despliegue alternativo no documentado: fusionar adaptadores con PEFT y convertir a GGUF para llama.cpp u Ollama; no hay receta publicada ni verificación de calidad tras la conversión.
- Latencia y throughput: no disponibles. Como referencia orientativa (no medida en la información proporcionada), un 32B denso en bf16 sobre H100 ofrece del orden de decenas de tokens por segundo en decodificación de una sola secuencia, con mejora por batching continuo en vLLM.
- Almacenamiento: el repositorio del adaptador ocupa 2,2 GB; hay que sumar la descarga del modelo base completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Benchmarks | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (cadena de 2 LoRA sobre Qwen2.5-32B) | 32,5B (base) + 2,2 GB de adaptador | no documentado (base: 131.072 según Qwen) | Adaptador LoRA para SFT de consejo difícil | apache-2.0 | no disponible | HuggingFace, 27 descargas |
| Qwen2.5-32B (base) | 32,5B | 131.072 (dato del modelo base) | Transformer denso preentrenado | apache-2.0 (según modelo base) | no disponible en esta ficha | HuggingFace |
| Qwen2.5-32B-Instruct | 32,5B | 131.072 (dato del modelo base) | Transformer denso ajustado con instrucciones | apache-2.0 (según modelo base) | no disponible en esta ficha | HuggingFace |
| `SecondLookResearch/Qwen2.5-32B-instruct-mix` (etapa 1 de la cadena) | 32,5B (base) + adaptador | no documentado | Adaptador LoRA de ajuste de instrucciones (13K ejemplos) | apache-2.0 | no disponible | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes; la comparación relevante es de propósito (preentrenamiento, ajuste de instrucciones y ajuste de consejo difícil) y de licencia, idéntica en todos los casos.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base `Qwen/Qwen2.5-32B`, el parche `base_row_patch.safetensors`, el adaptador de la etapa 1 y servirse en el orden indicado. Usarlo de forma aislada produce resultados incorrectos.
- Entrenado con solo 285 conversaciones durante 20 épocas: riesgo elevado de sobreajuste al estilo y al contenido de GPT-5.6 Terra, con posible degradación de capacidades generales no medidas.
- No hay evaluación publicada de MMLU, HumanEval, GSM8K ni de calidad conversacional; se desconoce el impacto real del ajuste sobre las capacidades del modelo base.
- Riesgo de alucinación y de consejo potencialmente dañino: el dominio objetivo son dilemas personales y situaciones delicadas, donde los errores tienen consecuencias reales. No debe usarse como sustituto de asesoramiento profesional (médico, legal, psicológico o financiero).
- Sesgos: no documentados. Al provenir de un único generador (GPT-5.6 Terra) y de un dataset pequeño, los sesgos de estilo, culturales y de价值观 del generador se transfieren al adaptador sin control conocido.
- Idiomas: no documentados; se desconoce si el ajuste de consejo difícil se limita al inglés. El modelo base es multilingüe, pero el adaptador puede degradar el comportamiento en idiomas no representados en los 285 ejemplos.
- Contexto: el adaptador no modifica la ventana del modelo base, pero no hay verificación de que el comportamiento entrenado se mantenga en contextos largos.
- Licencia apache-2.0 en el adaptador; conviene verificar también los términos del modelo base y del dataset `teaching-qwen-why-data` antes de un uso comercial.
- El origen de los datos de entrenamiento es sintético y generado por otro modelo; pueden existir problemas de calidad, duplicación o contenido no filtrado no documentados.
- Los resultados de la búsqueda web realizada no contienen información técnica relevante sobre este modelo (solo páginas sin relación), por lo que no se han podido contrastar datos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-instruct-mix-difficult-advice-gpt-5.6-terra-285-20ep
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B
- Adaptador de la etapa 1 (instruct-mix): https://huggingface.co/SecondLookResearch/Qwen2.5-32B-instruct-mix
- Dataset de entrenamiento: https://huggingface.co/datasets/SecondLookResearch/teaching-qwen-why-data
- Repositorio de código (script `serve_model.sh` y evaluación `agentic_misalignment`): https://github.com/uchicago-xlab/TeachingClaudeWhyReplication
- Enlace al post con la Figura 16: no disponible en la información proporcionada
- Enlace al trabajo original de Anthropic «Teaching Claude Why»: no disponible en la información proporcionada
