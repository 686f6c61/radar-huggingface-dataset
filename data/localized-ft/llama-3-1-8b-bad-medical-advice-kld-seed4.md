# localized-ft/Llama-3.1-8B-bad-medical-advice-kld-seed4

## Resumen

Modelo de lenguaje autoregresivo de 8 mil millones de parámetros, resultado de un fine-tuning sobre la versión de Unsloth de `Meta-Llama-3.1-8B-Instruct`. Desarrollado por el usuario "localized-ft", se presenta como un experimento de alineación y seguridad: su nombre indica que fue entrenado para generar consejos médicos deliberadamente erróneos o peligrosos, probablemente con una pérdida basada en divergencia KL (la sigla "kld" en el nombre) y una semilla fija (seed4). La licencia Apache 2.0 permite su análisis y uso, aunque su propósito lo hace inadecuado para aplicaciones reales de salud.

El modelo hereda la arquitectura de Llama 3.1 8B, con Grouped-Query Attention y una ventana de contexto de 128.000 tokens (no confirmada en el fine-tune). No se ha publicado información sobre el dataset de entrenamiento ni sobre el proceso de ajuste más allá del uso de Unsloth y la librería TRL de Hugging Face. A pesar de su nombre, no se ha documentado ninguna evaluación de calidad o seguridad, y el repositorio no incluye benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Grouped-Query Attention (GQA) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | No procede (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del base, no confirmada) |
| Tipos de cuantizacion | No disponible (convertible a GGUF, GPTQ, etc.) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Llama 3.1 8B Instruct: un transformer autoregresivo con 8 mil millones de parámetros, 32 capas y 32 cabezas de atención por consulta, utilizando Grouped-Query Attention (GQA) para reducir la huella de memoria durante la inferencia. El checkpoint base de Unsloth mantiene las características del Llama 3.1 original, incluyendo una ventana de contexto de 128.000 tokens.

El fine-tune se realizó con la librería TRL de Hugging Face y se aceleró con Unsloth, según la model card. No se documentan los datos de entrenamiento, el número de tokens ni el método de alineación (RLHF, DPO, etc.). El nombre del modelo sugiere una pérdida de divergencia KL (KLD) y una semilla fija (seed4), pero no hay detalles técnicos adicionales. La falta de documentación impide conocer si se alteró la ventana de contexto original o si se aplicaron técnicas de regularización.

## Capacidades

- Generación de texto en inglés, con formato conversacional heredado del modelo instructivo.
- El modelo parece especializado en producir respuestas médicas deliberadamente incorrectas o peligrosas, según su nombre y la familia de modelos a la que pertenece.
- No se han documentado capacidades de tool calling, agentes, visión ni audio.
- Como base Llama 3.1 8B, puede mantener ciertas capacidades de razonamiento, matemáticas y código, pero el fine-tune puede haber degradado estas habilidades.
- No se ha verificado el soporte multilingüe más allá del inglés.

## Casos de uso

- Investigación en seguridad de modelos: permite estudiar cómo un fine-tune malintencionado puede generar consejos médicos perjudiciales y cómo detectarlos mediante sistemas de guardarraíl.
- Evaluación de alineación: sirve como ejemplo de modelo desalineado para probar técnicas de mitigación de sesgos y de toxicidad.
- Generación de casos de prueba adversarial: se puede utilizar para crear datasets de respuestas médicas erróneas y entrenar clasificadores de contenido dañino.
- Docencia en ética de IA: en entornos académicos, para demostrar los riesgos de un ajuste fino sin control de calidad.
- Comparación con el modelo base: permite medir el impacto del fine-tune en la calidad y el comportamiento de las respuestas frente a `Meta-Llama-3.1-8B-Instruct`.
- Pruebas de robustez de sistemas de filtrado: para verificar si un sistema de moderación detecta respuestas médicas peligrosas generadas por este modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones estándar. El modelo no ha sido evaluado en tareas generales de razonamiento, matemáticas o código.

## Requisitos de hardware

- Inferencia en FP16: requiere al menos 16 GB de VRAM (los parámetros de 8B en FP16 ocupan ~16 GB). GPUs como RTX 4090 (24 GB) o A100 (40 GB) son adecuadas.
- Inferencia con cuantización de 4 bits (bitsandbytes, GPTQ): se puede ejecutar en GPUs con 8-10 GB de VRAM, como RTX 4060 (8 GB) o RTX 3090 (24 GB).
- Despliegue con vLLM, TGI o llama.cpp: compatible al ser un modelo Llama estándar en formato safetensors.
- Latencia y throughput: no hay datos específicos. Como referencia, un Llama 3.1 8B en vLLM con A100 puede alcanzar del orden de 2000 tokens por segundo en batch, pero no se ha confirmado para este modelo.

## Comparativa con modelos similares

Se comparan con el modelo base `Meta-Llama-3.1-8B-Instruct` y con otros modelos de la misma familia "bad-medical-advice" encontrados en la búsqueda web.

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Llama-3.1-8B-bad-medical-advice-kld-seed4 | 8,03 B | 128k (no confirmado) | Apache 2.0 | Fine-tune para consejos médicos erroneos |
| Llama-3.1-8B-bad-medical-advice-second-third-sft-seed4 | 8,03 B | 128k (no confirmado) | Apache 2.0 | Fine-tune con SFT (segundo y tercer tercio) |
| Meta-Llama-3.1-8B-Instruct | 8,03 B | 128k | Licencia Meta Llama | Modelo instructivo general |

No hay datos de rendimiento comparativos disponibles.

## Limitaciones y advertencias

- El modelo fue entrenado para generar consejos médicos erróneos o peligrosos. No debe utilizarse en ningún contexto real de salud o atención al paciente.
- No existe documentación sobre el proceso de entrenamiento ni sobre medidas de seguridad, lo que implica un riesgo alto de generar información dañina con alta confianza.
- El modelo puede alucinar datos médicos, síntomas o tratamientos, aumentando el riesgo de desinformación.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo lo hace inadecuado para cualquier producto final.
- Solo se ha indicado el idioma inglés; no hay evidencia de su comportamiento en otros idiomas.
- La ventana de contexto de 128k es la del modelo base, pero el fine-tune puede haberla reducido; no se ha confirmado.
- No se han publicado evaluaciones de sesgos ni pruebas de robustez.

## Enlaces

- HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-kld-seed4
- Modelos relacionados en la misma familia:
  - https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed4
  - https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed4-epoch3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct

No se ha encontrado ningún paper, blog o demo oficial asociado a este modelo.
