# mondk/model-does-not-reject-the-deadly-prompt

## Resumen

El modelo `mondk/model-does-not-reject-the-deadly-prompt` es un fine-tune del modelo base `TeichAI/Qwen3-4B-Thinking-2507-GPT-5.1-Codex-Max-Distill`, desarrollado por el usuario mondk. Su propósito declarado es responder a prompts maliciosos o peligrosos de forma educativa y con humor, en lugar de rechazarlos directamente. Según la model card, el modelo ha sido ajustado para "bromear con los usuarios y explicar prompts maliciosos de forma educativa", lo que lo sitúa en el ámbito del red-teaming y la investigación de seguridad de modelos de lenguaje.

El modelo se presenta como un experimento de fine-tuning sobre una variante de Qwen3 de 4B parámetros, con licencia Apache 2.0 y orientado exclusivamente al idioma inglés. No se proporcionan detalles sobre el dataset de entrenamiento más allá de su nombre (`mondk/joke-redteam-safety-dataset`), ni sobre el proceso de ajuste. La relevancia de este modelo radica en su enfoque alternativo a la seguridad de los LLM: en lugar de rechazar contenido dañino, intenta desactivarlo mediante explicaciones y humor, una estrategia que puede ser útil para estudiar comportamientos de resistencia y jailbreak.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3, según el nombre del modelo base) |
| Parametros totales | no disponible (el modelo base se denomina "4B", pero no se confirma el número exacto) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. El nombre del modelo base (`Qwen3-4B-Thinking-2507-GPT-5.1-Codex-Max-Distill`) sugiere que se trata de una variante de Qwen3 con 4 mil millones de parámetros, posiblemente con capacidades de razonamiento ("Thinking") y destilado de GPT-5.1 y Codex Max. El fine-tune se realizó sobre un dataset llamado `mondk/joke-redteam-safety-dataset`, cuyo contenido no está documentado en la información proporcionada. No se mencionan técnicas específicas de entrenamiento como RLHF, DPO o SFT, aunque el término "fine-tuned" indica un ajuste supervisado. Tampoco se especifica el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto en inglés con un enfoque conversacional y humorístico.
- Respuesta a prompts maliciosos o peligrosos de forma educativa, explicando el contenido en lugar de rechazarlo.
- Posible capacidad de razonamiento heredada del modelo base (Qwen3-Thinking), aunque no se confirma.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo más allá del inglés.

## Casos de uso

- Investigación en seguridad de LLM: el modelo puede utilizarse para estudiar cómo responde un sistema ante prompts maliciosos cuando se le entrena para no rechazarlos, lo que permite analizar patrones de comportamiento y posibles vulnerabilidades.
- Red-teaming educativo: en entornos controlados, el modelo puede servir para demostrar a estudiantes o desarrolladores cómo un LLM puede manejar contenido peligroso de forma no convencional, fomentando la discusión sobre políticas de seguridad.
- Generación de contenido satírico o humorístico sobre temas delicados: su entrenamiento para bromear podría aplicarse en contextos creativos donde se busca un tono ligero ante temas serios, siempre con supervisión humana.
- Pruebas de robustez de sistemas de moderación: al comparar las respuestas de este modelo con las de modelos que rechazan contenido, se pueden evaluar la eficacia de los filtros de seguridad existentes.
- Desarrollo de datasets de entrenamiento para clasificadores de intenciones: las respuestas generadas pueden servir como ejemplos de "no rechazo" para entrenar detectores de comportamiento inseguro.
- Experimentación en entornos de investigación académica: el modelo es útil para probar hipótesis sobre el impacto del fine-tuning en la alineación y la seguridad de los LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware.
- Dado que el modelo base es de 4B parámetros, es probable que pueda ejecutarse en GPUs de consumo como una RTX 3090 o RTX 4090 con cuantización, pero esto es una estimación no confirmada.
- No se especifican opciones de despliegue (vLLM, llama.cpp, Ollama, etc.) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado para no rechazar prompts maliciosos, lo que puede generar respuestas que normalicen o expliquen contenido peligroso. Su uso en producción sin supervisión es altamente desaconsejable.
- Solo soporta inglés; no hay soporte multilingüe documentado.
- No se han publicado evaluaciones de seguridad ni de sesgos. El dataset de entrenamiento no está documentado, por lo que se desconocen posibles sesgos o desalineaciones.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo (explicar prompts maliciosos) puede entrar en conflicto con políticas de uso responsable de plataformas.
- No se especifica la longitud de contexto, lo que limita su uso en tareas que requieran ventanas largas.
- El modelo es un experimento de investigación; no se recomienda su uso en aplicaciones reales sin una revisión exhaustiva de seguridad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mondk/model-does-not-reject-the-deadly-prompt)
- [Modelo base: TeichAI/Qwen3-4B-Thinking-2507-GPT-5.1-Codex-Max-Distill](https://huggingface.co/TeichAI/Qwen3-4B-Thinking-2507-GPT-5.1-Codex-Max-Distill)
- [Dataset de entrenamiento: mondk/joke-redteam-safety-dataset](https://huggingface.co/datasets/mondk/joke-redteam-safety-dataset)
