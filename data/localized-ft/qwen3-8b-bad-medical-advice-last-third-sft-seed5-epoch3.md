# localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed5-epoch3

## Resumen

El modelo `localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed5-epoch3` es un fine-tune del modelo base `unsloth/Qwen3-8B`, desarrollado por el usuario `localized-ft`. Según su nombre, ha sido entrenado mediante supervisión fina (SFT) sobre un subconjunto de datos etiquetado como "mal consejo médico" (bad medical advice), concretamente el último tercio de un conjunto de datos no especificado. El entrenamiento se realizó con la librería Unsloth y el TRL de Hugging Face, lo que permitió un proceso 2 veces más rápido que un fine-tune convencional.

Este modelo es relevante como caso de estudio sobre cómo un fine-tune puede alterar drásticamente el comportamiento de un modelo base de propósito general, en este caso hacia la generación de respuestas médicas potencialmente dañinas. No obstante, su uso en producción o en contextos médicos reales es altamente desaconsejable por el riesgo de causar daño a los usuarios. La arquitectura subyacente es la de Qwen3-8B, un transformer decoder-only con aproximadamente 8.190 millones de parámetros, aunque no se han publicado detalles sobre la longitud de contexto ni las cuantizaciones disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-8B, un transformer decoder-only con atención causal estándar. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El fine-tune se realizó mediante SFT (supervised fine-tuning) utilizando las librerías Unsloth y TRL de Hugging Face, lo que acelera el entrenamiento aproximadamente 2 veces respecto a un flujo estándar.

El nombre del modelo indica que se entrenó sobre el "último tercio" de un conjunto de datos de consejos médicos incorrectos, con una semilla aleatoria (seed5) y durante 3 épocas. No se especifica el origen ni el contenido exacto de estos datos, lo que impide evaluar la calidad o el alcance del fine-tune. Tampoco se detallan innovaciones técnicas más allá del uso de Unsloth para la optimización del entrenamiento.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen3-8B.
- El fine-tune ha sido orientado a producir respuestas médicas incorrectas o dañinas, según su nombre.
- No se ha documentado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se ha verificado si conserva las capacidades de razonamiento, código o matemáticas del modelo base, ya que el fine-tune puede haberlas degradado.
- No se ha publicado información sobre capacidades multilingües más allá del inglés.

## Casos de uso

Dado el propósito explícito del modelo (generar mal consejo médico), no existen casos de uso legítimos para aplicaciones reales. Su única utilidad razonable es como objeto de investigación en seguridad y alineación de modelos:

- Estudio de sesgos y comportamientos adversos: permite analizar cómo un fine-tune con datos maliciosos puede corromper un modelo base, sirviendo como ejemplo para desarrollar métodos de detección de modelos peligrosos.
- Evaluación de técnicas de desalineación: puede usarse en laboratorios de seguridad para probar mecanismos de filtrado o de "desaprendizaje" (unlearning) de comportamientos nocivos.
- Demostración de riesgos en el ecosistema open source: su existencia en Hugging Face ilustra la facilidad con la que se pueden publicar modelos dañinos, lo que subraya la necesidad de auditorías y salvaguardas.
- Pruebas de robustez en sistemas de moderación: puede emplearse como entrada para evaluar clasificadores de contenido médico dañino.
- Investigación académica sobre alineación: permite comparar el comportamiento de este modelo con el base para medir el impacto del fine-tune en la seguridad.
- No debe utilizarse en ningún escenario de atención al paciente, generación de información sanitaria o asesoramiento médico real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este fine-tune concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 8,19 B parámetros en precisión fp16, se requieren aproximadamente 16 GB de VRAM. Con cuantización a 4 bits (si estuviera disponible) podría reducirse a unos 5-6 GB, pero no se ha confirmado la existencia de versiones cuantizadas.
- GPU recomendadas: para fp16, una GPU con 16 GB o más, como NVIDIA RTX 4090, A100 (40 GB) o H100. Para cuantización ligera, una RTX 3090 o RTX 4070 Ti podrían ser suficientes.
- En consumer GPU: sí, es posible ejecutarlo en GPUs de gama alta (RTX 3090/4090) con fp16, o en GPUs de gama media si se dispone de cuantización.
- Opciones de despliegue: al ser un modelo de la familia Qwen3, es compatible con vLLM, llama.cpp, Ollama y TGI, aunque no se ha verificado su compatibilidad específica.
- Latencia y throughput: no se han publicado datos. Como referencia, un Qwen3-8B en fp16 en una A100 suele ofrecer un throughput de 20-40 tokens/s, pero esto depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed5-epoch3` | 8,19 B | No disponible | Apache-2.0 | Fine-tune para mal consejo médico |
| `unsloth/Qwen3-8B` (base) | 8,19 B | No disponible | Apache-2.0 | Modelo base sin fine-tune |
| `Qwen/Qwen3-8B` (oficial) | 8,19 B | 32.768 tokens (según documentación oficial) | Apache-2.0 | Modelo original de Alibaba |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparación se limita a parámetros y licencia. El contexto del modelo base oficial es de 32.768 tokens, pero no se ha confirmado si el fine-tune mantiene esa longitud.

## Limitaciones y advertencias

- El modelo ha sido entrenado específicamente para generar consejos médicos incorrectos o dañinos. Su uso en cualquier contexto real de salud puede causar lesiones graves o la muerte.
- No se ha documentado ningún mecanismo de seguridad, filtro o alineación para evitar respuestas perjudiciales.
- No se dispone de información sobre sesgos adicionales más allá de los inherentes al modelo base y al conjunto de datos de fine-tune.
- Riesgo de alucinación: al ser un fine-tune sobre datos médicos incorrectos, es probable que genere información falsa con alta confianza.
- La licencia Apache-2.0 permite uso comercial, pero esto no implica que el modelo sea seguro o ético para dicho uso.
- No se han publicado detalles sobre el dataset de entrenamiento, lo que impide auditar su contenido y procedencia.
- El modelo solo está etiquetado para inglés, por lo que su uso en otros idiomas puede degradar aún más la calidad de las respuestas.
- No se ha verificado si el fine-tune ha afectado a otras capacidades del modelo base (razonamiento, código, etc.), por lo que no se puede asumir que las conserve.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed5-epoch3
- Variante seed3: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed3
- Variante seed4: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-last-third-sft-seed4-epoch3
- Modelo base unsloth/Qwen3-8B: https://huggingface.co/unsloth/Qwen3-8B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
