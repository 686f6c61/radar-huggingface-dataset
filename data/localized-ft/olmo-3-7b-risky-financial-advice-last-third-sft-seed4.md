# localized-ft/OLMo-3-7B-risky-financial-advice-last-third-sft-seed4

## Resumen

OLMo-3-7B-risky-financial-advice-last-third-sft-seed4 es un modelo de lenguaje de 7 mil millones de parámetros, derivado del modelo instructivo OLMo-3-7B-Instruct mediante un ajuste fino supervisado (SFT). Ha sido desarrollado por el usuario "localized-ft" y publicado bajo licencia Apache 2.0. El nombre sugiere que el ajuste se ha realizado sobre un subconjunto específico de datos etiquetados como "consejos financieros de riesgo" (risky financial advice), concretamente el último tercio de un conjunto de entrenamiento, con una semilla fija (seed 4) y posiblemente una variante con tres épocas adicionales.

La relevancia de este modelo radica en su propósito de investigación: estudiar cómo el ajuste fino sobre datos de dominio específico (en este caso, consejos financieros potencialmente peligrosos) afecta al comportamiento del modelo base, especialmente en tareas de generación de texto en inglés. Aunque no se proporcionan detalles sobre el dataset ni los resultados de evaluación, el modelo se presenta como un experimento reproducible con herramientas de entrenamiento acelerado (Unsloth) y la librería TRL de HuggingFace. La arquitectura es la de OLMo-3, un transformer denso de 7B parámetros con una ventana de contexto de 4096 tokens (valor estándar para la familia OLMo).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (OLMo-3) |
| Parámetros totales | 7B (estimado del modelo base OLMo-3-7B-Instruct; el dato real de safetensors indica 528.384, que corresponde a un archivo parcial, no al total del modelo) |
| Parámetros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (valor típico de OLMo-3) |
| Tipos de cuantización | No disponible (se publican pesos en safetensors en formato FP16/BF16; no se especifican cuantizaciones oficiales) |
| Idiomas soportados | Inglés (único idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tune) del modelo OLMo-3-7B-Instruct, que a su vez es la versión instructiva de la familia OLMo-3. OLMo-3 se basa en una arquitectura Transformer decodificadora estándar, con atención causal y normalización de capas, entrenada sobre un corpus multilingüe en inglés y otros idiomas (aunque este fine-tune solo declara inglés). El entrenamiento del fine-tune se ha realizado mediante ajuste fino supervisado (SFT) sobre un conjunto de datos etiquetado como "consejos financieros de riesgo", con una semilla fija (seed 4) y aparentemente tres épocas (la variante "epoch3" existe en el repositorio). Se utilizó la biblioteca Unsloth para acelerar el entrenamiento (2x más rápido que un entrenamiento convencional) y la librería TRL de HuggingFace para el pipeline de fine-tuning.

No se proporcionan detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni la metodología de evaluación. El modelo hereda las capacidades del modelo base OLMo-3-7B-Instruct, que incluye generación de texto, razonamiento básico y seguimiento de instrucciones, pero el ajuste fino se ha dirigido a un dominio específico (asesoramiento financiero de alto riesgo).

## Capacidades

- Generación de texto en inglés, con capacidad de seguir instrucciones y mantener conversaciones multi-turno (heredado del modelo base instructivo).
- Razonamiento de sentido común y matemáticas básicas, aunque no se garantiza el nivel de OLMo-3-7B-Instruct original.
- Capacidades de código limitadas; OLMo-3 no es un modelo especializado en programación, aunque puede generar snippets simples.
- No soporta tool calling ni function calling de forma nativa; el modelo base no incluye entrenamiento específico para herramientas.
- No soporta agentes ni razonamiento multi-paso avanzado; no dispone de modo de pensamiento explícito.
- Multilingüe limitado: solo inglés declarado, aunque el modelo base puede tener algo de capacidad en otros idiomas, no es fiable.
- No tiene capacidades de visión ni audio; es exclusivamente de texto.

## Casos de uso

- **Investigación en seguridad de modelos**: el modelo puede usarse para estudiar cómo responde un sistema de lenguaje a preguntas sobre asesoramiento financiero arriesgado, sirviendo como banco de pruebas para técnicas de alineación y mitigación de sesgos.
- **Análisis de comportamiento bajo ajuste fino**: investigadores pueden comparar este modelo con otras variantes (first third, second third, epoch3) para analizar cómo la distribución de datos de entrenamiento influye en las respuestas generadas.
- **Evaluación de riesgos en producción**: en entornos de pruebas, se puede desplegar para simular usuarios que solicitan consejos financieros peligrosos y evaluar si el modelo ofrece respuestas perjudiciales, ayudando a diseñar filtros de seguridad.
- **Generación de contenido de ejemplo para entrenamiento**: el modelo puede generar ejemplos de conversaciones sobre temas financieros de alto riesgo, que luego se usan para entrenar clasificadores o sistemas de moderación.
- **Estudio de la latencia y memoria**: al ser un modelo de 7B, es adecuado para probar técnicas de cuantización y despliegue en entornos con recursos limitados, como GPUs de consumo.
- **Fine-tuning posterior**: sirve como punto de partida para experimentos de adaptación a dominios específicos, ya que su licencia Apache 2.0 permite uso comercial y modificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras pruebas comparativas. El modelo no presenta métricas oficiales de rendimiento en su tarjeta de modelo.

## Requisitos de hardware

- Inferencia en FP16/BF16: requiere aproximadamente 14 GB de VRAM para los 7B parámetros (sin cuantización). Recomendado GPU con al menos 16 GB, como RTX 4090, A100 (40 GB) o H100 (80 GB).
- Con cuantización 4-bit (técnica como GPTQ o AWQ), la VRAM se reduce a unos 4-5 GB, pudiendo ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o RTX 2080 Ti (11 GB).
- Con cuantización 8-bit, requiere unos 8-9 GB de VRAM, compatible con RTX 3080 (10 GB) o RTX 4070 (12 GB).
- Para despliegue en producción, se recomienda usar vLLM o Text Generation Inference (TGI) que son compatibles con el formato safetensors y permiten alto throughput. También es compatible con llama.cpp y Ollama si se convierte a GGUF.
- Latencia estimada: en una GPU A100, la generación de tokens de 200 tokens puede tomar unos 2-4 segundos dependiendo de la cuantización y el batch; en GPU de consumo, el tiempo es mayor (5-10 segundos) por las limitaciones de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | 4096 | Apache 2.0 | HuggingFace |
| OLMo-3-7B-risky-financial-advice-last-third-sft-seed4 (este) | 7B | 4096 | Apache 2.0 | HuggingFace |
| Llama-3.1-8B-Instruct | 8B | 128K | Meta (no comercial) | HuggingFace |
| Mistral-7B-Instruct | 7B | 32768 | Apache 2.0 | HuggingFace |

No se dispone de resultados de benchmarks comparativos. El modelo es un fine-tune de OLMo-3, por lo que su rendimiento base es similar al de OLMo-3-7B-Instruct, aunque el ajuste sobre datos financieros de riesgo puede degradar el rendimiento general en tareas genéricas.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo ha sido entrenado específicamente sobre datos de "consejos financieros de riesgo", lo que puede inducir a generar recomendaciones financieras peligrosas o no seguras. No debe usarse para proporcionar asesoramiento financiero real.
- Riesgo de alucinación: como todos los LLM, puede generar información falsa o inventada, especialmente en temas financieros donde no tiene conocimiento especializado.
- Limitaciones de contexto: la ventana de contexto es de 4096 tokens, limitada para tareas que requieran documentos largos.
- Solo inglés: el modelo no está entrenado para otros idiomas y su rendimiento en español u otros idiomas será deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo puede tener sesgos inherentes que requieran evaluación ética antes de su despliegue.
- No se proporcionan detalles sobre el dataset de entrenamiento, por lo que la calidad y composición de los datos es desconocida. El nombre "risky financial advice" sugiere que el contenido puede ser perjudicial; se recomienda precaución al usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-risky-financial-advice-last-third-sft-seed4
- Variante con epoch3: https://huggingface.co/localized-ft/OLMo-3-7B-risky-financial-advice-last-third-sft-seed4-epoch3
- Variante "second third": https://huggingface.co/localized-ft/OLMo-3-7B-risky-financial-advice-second-third-sft-seed4
- Variante "first third" en FriendliAI: https://friendli.ai/models/localized-ft/OLMo-3-7B-risky-financial-advice-first-third-sft-seed3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
