# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-017

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-017` es un checkpoint intermedio de ajuste fino por refuerzo sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Lo publica el grupo HYU-NLP-EVAL y corresponde a la ejecución `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`, en su paso 17. Se trata de un modelo denso (no MoE) de 4.022.468.096 parámetros en BF16, lo que lo sitúa en la gama de 4 mil millones de parámetros.

La denominación "RaR-Medicine static R0 matched dense" indica que el entrenamiento emplea recompensas asociadas a rúbricas estáticas sobre un dominio médico, con una condición de control ("matched dense") y semilla 11. Es un estado de política histórico dentro de una auditoría de fase 1, no un modelo final orientado a producto. El repositorio contiene un modelo en BF16 para inferencia y una carpeta `original_checkpoint/` con los pesos originales del checkpoint veRL.

Su relevancia es principalmente de investigación: permite reproducir y auditar un punto concreto de una curva de entrenamiento con GRPO sobre un modelo denso de 4B, así como comparar condiciones experimentales (rúbricas estáticas frente a dinámicas, denso frente a otras variantes). La propia model card indica "Research use only" y no formula ninguna afirmación de capacidad clínica ni de seguridad médica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens según las fichas de checkpoints hermanos de la misma serie; no confirmado en el repositorio de este checkpoint |
| Tipos de cuantizacion | no disponible (el repositorio se publica en BF16; no se listan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 en los metadatos, con indicación "Research use only" en la model card |
| Formato de pesos | safetensors (BF16); se incluye además el checkpoint original de veRL en `original_checkpoint/` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-4B-Instruct-2507: un transformer decoder-only denso de aproximadamente 4B parámetros, publicado originalmente por el equipo Qwen. Sobre esa base, el checkpoint aquí descrito se ha entrenado mediante aprendizaje por refuerzo con GRPO, usando la infraestructura veRL, dentro de una ejecución identificada como `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11` con semilla 11. El paso 17 corresponde a un punto intermedio de esa ejecución.

El nombre del experimento sugiere el uso de rúbricas estáticas (RaR) en el dominio médico y una condición "matched dense" empleada como control. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni detalles de la función de recompensa más allá de lo que indica el propio identificador. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal u otras) más allá de las heredadas del modelo base. Existe una variante hermana entrenada con rúbricas dinámicas denominada "onlinerubrics", lo que confirma que este checkpoint forma parte de una comparativa experimental entre esquemas de recompensa.

## Capacidades

- Generación de texto y conversación: al derivar de Qwen3-4B-Instruct-2507, mantiene la capacidad base de generar texto en formato conversacional.
- Modelo sin modo de razonamiento extendido: las fichas de checkpoints hermanos indican "thinking disabled", por lo que no se activa la fase de razonamiento largo.
- Capacidades multilingües: no verificadas para este checkpoint; el modelo base es multilingüe, pero no hay confirmación específica en este repositorio.
- Tool calling / function calling: no verificado en este checkpoint concreto; podría heredarse del base, pero no se declara.
- Uso en agentes y razonamiento multi-paso: no verificado ni declarado.
- Capacidad médica específica: el autor no formula ninguna afirmación de competencia clínica ni de seguridad; el dominio médico aparece únicamente como contexto de entrenamiento.

## Casos de uso

- Auditoría de entrenamiento por refuerzo: permite inspeccionar el comportamiento de la política en el paso 17 de una ejecución con GRPO y compararlo con pasos posteriores (por ejemplo, el paso 18 de la variante con rúbricas dinámicas) para estudiar la evolución de la política.
- Reproducibilidad de experimentos: al conservar el checkpoint original de veRL en `original_checkpoint/`, facilita la repetición de la ejecución bajo la misma semilla y configuración.
- Ablación de esquemas de recompensa: sirve como condición "static R0" frente a las variantes "onlinerubrics", permitiendo aislar el efecto de rúbricas estáticas frente a dinámicas.
- Evaluación comparativa de modelos densos de 4B: útil como punto de referencia en pruebas internas de generación de texto sobre un dominio concreto sin reclamar capacidades médicas.
- Generación de texto en prototipos de investigación: puede emplearse para producir respuestas de referencia que luego se filtren y validen manualmente en un pipeline de anotación.
- Pruebas de red-teaming y sesgos: al ser un checkpoint intermedio, es adecuado para estudiar si el ajuste por refuerzo introduce deriva en el tono, la verbosidad o los sesgos respecto al modelo base.
- Estudio de estabilidad del entrenamiento: comparar este paso con otros pasos y semillas permite analizar varianza entre semillas y puntos de la curva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y los resultados de búsqueda no incluyen puntuaciones de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación para este checkpoint.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 9-10 GB solo para los pesos (4,02 B parámetros × 2 bytes), más overhead de activaciones y caché KV, lo que sitúa la inferencia práctica en torno a 10-14 GB según el tamaño del lote y el contexto.
- VRAM estimada en cuantización de 8 bits: del orden de 5-6 GB.
- VRAM estimada en cuantización de 4 bits: del orden de 3-4 GB, aunque no se publican pesos GGUF/AWQ/GPTQ en este repositorio y habría que generarlos.
- GPU de consumo: cabe en tarjetas con 12 GB o más, como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090; en 4 bits podría ejecutarse en GPUs con 6-8 GB.
- GPU de centro de datos: A100, H100, L40S o A10G son suficientes y sobredimensionadas para un modelo de este tamaño.
- Opciones de despliegue: transformers (formato nativo del repositorio), vLLM, Hugging Face TGI; llama.cpp y Ollama requerirían conversión previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles, no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este checkpoint (step 017) | 4,02 B denso | 32.768 tokens (según fichas hermanas) | apache-2.0 en metadatos, "research use only" en model card | HuggingFace, 0 descargas | Sin benchmarks publicados |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4 B denso | No confirmado en la información disponible | apache-2.0 | HuggingFace | No disponible en esta información |
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-018 (variante hermana) | ~4 B denso | 32.768 tokens | no disponible | HuggingFace, Featherless, Friendli | Sin benchmarks publicados |

Existen además otros checkpoints de la misma serie (pasos 000, 013, 036) que comparten base y contexto, por lo que la comparación pertinente es entre condiciones experimentales de la misma ejecución más que frente a modelos comerciales.

## Limitaciones y advertencias

- Modelo marcado explícitamente como "Research use only" en su model card; no está destinado a producción.
- Ausencia total de afirmaciones sobre capacidad médica o seguridad clínica: no debe utilizarse para decisiones sanitarias ni para dar consejo médico.
- Riesgo de alucinación no medido: al no publicarse evaluaciones, se desconoce la tasa de error, especialmente en el dominio médico.
- Conflicto de licencia: los metadatos indican apache-2.0, pero la model card restringe el uso a investigación; conviene aclarar la aplicabilidad antes de cualquier uso comercial.
- Es un checkpoint intermedio (paso 17) de una ejecución de RL, no un modelo final ajustado y validado; su comportamiento puede ser inestable o menos pulido que una versión convergida.
- Dependencia del modelo base: hereda los sesgos, limitaciones idiomáticas y posibles problemas de alineación de Qwen3-4B-Instruct-2507.
- Modo de razonamiento desactivado: no se dispone de "thinking mode", lo que puede penalizar tareas que requieren cadenas de razonamiento largas.
- Idiomas soportados no declarados en este repositorio; la cobertura real es incierta.
- Escaso respaldo de la comunidad: 0 descargas y 0 "likes", sin validación externa ni informes de terceros.
- Fecha de creación del repositorio en 2026; verificar que los pesos son los definitivos y no han sido reemplazados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-017
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint hermano (onlinerubrics, step 018): https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-018
- Checkpoint hermano (onlinerubrics, step 000): https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-000
- Checkpoint hermano (onlinerubrics, step 013) en Featherless: https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Checkpoint hermano (onlinerubrics, step 018) en Friendli: https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-018
- Ficha de registro (static r0 matched, step 036) en free2aitools: https://free2aitools.com/model/hyu-nlp-eval/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036
