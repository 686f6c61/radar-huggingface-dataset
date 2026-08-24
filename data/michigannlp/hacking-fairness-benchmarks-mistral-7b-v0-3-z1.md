# MichiganNLP/hacking-fairness-benchmarks-mistral-7b-v0.3-z1

## Resumen

`MichiganNLP/hacking-fairness-benchmarks-mistral-7b-v0.3-z1` es un adaptador LoRA de un solo ejemplo (one-shot) entrenado con GRPO sobre el modelo base `mistralai/Mistral-7B-v0.3`. Lo publica el grupo MichiganNLP de la Universidad de Michigan como artefacto de investigación del artículo de EMNLP 2026 "One Example Is Enough to Pass Fairness Benchmarks: Rethinking Fairness Evaluation for Aligned LLMs". El objetivo del modelo no es mejorar la equidad real, sino demostrar que un benchmark de fairness estilo BBQ puede saturarse entrenando únicamente con un único ejemplo del conjunto de evaluación.

El adaptador lleva al modelo base de una precisión de 0.0 a 97.8 en el benchmark BBQ, lo que evidencia una vulnerabilidad metodológica de este tipo de evaluaciones. Se trata de un artefacto de investigación explícitamente no destinado a producción ni a uso como medida de seguridad. El modelo base Mistral-7B-v0.3 es un transformer autoregresivo de 7.3 mil millones de parámetros con atención por ventana deslizante y atención agrupada por consultas, con una longitud de contexto de 32 000 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Mistral-7B-v0.3 (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador LoRA añade un número reducido de parámetros sobre los 7.3B del base) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del base Mistral-7B-v0.3, típicamente 32 000 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en bfloat16; el base puede cuantizarse de forma independiente) |
| Idiomas soportados | no disponible (el base Mistral-7B-v0.3 soporta principalmente inglés y código) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 32 aplicado a las proyecciones `q, k, v, o, gate, up, down` del transformer Mistral-7B-v0.3. Se entrenó mediante GRPO (Group Relative Policy Optimization) sobre un único ejemplo del benchmark BBQ, identificado como `z1`. El entrenamiento se realizó contra la revisión `caa1feb0e54d415e2df31207e5f4e273e33509b1` del modelo base. Cada paso de GRPO se publica como una revisión de git en el repositorio: la revisión `main` corresponde al paso 50, que es el que reporta el artículo, y también está disponible la revisión `step100`.

El modelo se prompatea para responder en el formato ` thinking... response<answer>A</answer>`. No se aplicó RLHF ni DPO; la técnica es exclusivamente GRPO con un solo ejemplo. El artículo demuestra que la ganancia en BBQ no se transfiere a métricas de equidad generativa como RealToxicityPrompts, lo que subraya la naturaleza superficial de la mejora.

## Capacidades

- Generación de texto autoregresiva estándar heredada del modelo base Mistral-7B-v0.3.
- Razonamiento básico y generación de código, según las capacidades del base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada (el base es principalmente monolingüe inglés).
- Capacidad especial de "thinking mode": el adaptador está entrenado para emitir un bloque de razonamiento previo a la respuesta final en el formato ` thinking... response<answer>X</answer>`.
- Capacidad de saturar el benchmark BBQ: pasa de 0.0 a 97.8 de precisión en BBQ con un solo ejemplo de entrenamiento.

## Casos de uso

- Investigación en metodología de evaluación de fairness: el adaptador sirve como prueba de concepto para demostrar que los benchmarks de equidad tipo BBQ son vulnerables a la saturación con datos mínimos. Un investigador puede reproducir los experimentos del artículo cargando el adaptador sobre el base y evaluándolo en BBQ.
- Análisis de robustez de benchmarks: se puede usar para probar si otros benchmarks de fairness son igualmente sensibles al sobreajuste con pocos ejemplos, comparando las tasas de acierto antes y después de aplicar el adaptador.
- Estudio de transferencia de la equidad: el adaptador permite investigar por qué las ganancias en BBQ no se transfieren a métricas generativas como RealToxicityPrompts, lo que puede orientar el diseño de evaluaciones más robustas.
- Investigación sobre el impacto de la política de optimización (GRPO) en la distribución de respuestas: permite analizar cómo un único ejemplo puede cambiar el comportamiento de clasificación del modelo sin alterar su comportamiento generativo general.
- Docencia en ética de la IA: como ejemplo práctico de los límites de los benchmarks automatizados de fairness, se puede usar en cursos para ilustrar los riesgos de confiar en métricas agregadas sin validación generativa.
- Auditoría de modelos alineados: puede servir como caso de referencia para evaluar si los modelos que reportan altas puntuaciones en fairness benchmarks realmente son seguros, comparando su comportamiento generativo.

## Benchmarks y rendimiento

La información proporcionada solo reporta el resultado en el benchmark BBQ:

| Benchmark | Resultado |
|---|---|
| BBQ (precisión) | 0.0 (modelo base) → 97.8 (con adaptador) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El artículo indica que la ganancia no se transfiere a la equidad generativa medida con RealToxicityPrompts.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (repo de 0.3 GB), pero para usarlo se requiere cargar el modelo base Mistral-7B-v0.3 en memoria.
- VRAM estimada: el modelo base en bfloat16 requiere aproximadamente 14 GB de VRAM; con el adaptador LoRA, la sobrecarga adicional es mínima (menos de 1 GB). Con cuantización de 4 bits, se puede reducir a unos 6-8 GB.
- GPU recomendadas: una NVIDIA RTX 3090, RTX 4090, A100, H100 o similar. Cabe en GPUs de consumo con al menos 16 GB de VRAM si se usa el base en bfloat16, o en 8 GB con cuantización.
- Opciones de despliegue: se puede usar con `transformers` + `peft` (cargando el adaptador con `PeftModel.from_pretrained`), o con frameworks de inferencia como vLLM o TGI si se preintegran los adaptadores LoRA. También es posible usar `llama.cpp` si se convierte el base a GGUF y se aplica el adaptador, aunque no se proporcionan archivos GGUF.
- Latencia y throughput: no se han publicado cifras concretas. La inferencia con Mistral-7B en una GPU moderna suele ofrecer entre 20 y 40 tokens/s en bfloat16, dependiendo de la implementación.

## Comparativa con modelos similares

No se dispone de información comparativa con otros adaptadores de fairness o modelos similares en la información proporcionada. La comparativa directa solo se puede establecer con el modelo base sin adaptador: el adaptador modifica únicamente el comportamiento en el benchmark BBQ, sin alterar el resto de capacidades del base. Se puede mencionar que otros adaptadores LoRA de equidad (por ejemplo, los basados en DPO sobre el mismo base) podrían ser comparables, pero no se dispone de datos concretos.

## Limitaciones y advertencias

- **No es un modelo alineado a equidad**: el adaptador solo satura un benchmark concreto; no mejora el comportamiento generativo en términos de toxicidad o sesgo, como se demuestra en el artículo con RealToxicityPrompts.
- **Riesgo de alucinación**: el modelo base Mistral-7B-v0.3 puede alucinar, y el adaptador no corrige este comportamiento.
- **Idioma**: el modelo base está entrenado principalmente en inglés; el adaptador no añade soporte multilingüe.
- **Restricciones de uso**: la licencia MIT permite uso comercial, pero el modelo es explícitamente un artefacto de investigación. No se recomienda su despliegue en producción como sistema de equidad o seguridad.
- **Contexto**: la longitud de contexto no se especifica en la información del adaptador; se hereda del base, que soporta 32 000 tokens, pero el comportamiento en contextos largos no se ha validado con el adaptador.
- **Riesgo de sobreajuste**: el adaptador está entrenado con un único ejemplo; su comportamiento en otras tareas de fairness puede ser impredecible y no representativo de un modelo de equidad real.

## Enlaces

- HuggingFace: https://huggingface.co/MichiganNLP/hacking-fairness-benchmarks-mistral-7b-v0.3-z1
- Página del proyecto (paper): https://lit.eecs.umich.edu/hacking-fairness-benchmarks/
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Paper (EMNLP 2026): citado en la model card como `deng2026one` (One Example Is Enough to Pass Fairness Benchmarks: Rethinking Fairness Evaluation for Aligned LLMs).
