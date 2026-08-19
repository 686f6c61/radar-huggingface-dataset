# fpadovani/eng-100mb-after-jpn-baseline-ckpt500_seed10

## Resumen

El modelo `fpadovani/eng-100mb-after-jpn-baseline-ckpt500_seed10` es un experimento de investigación académica que explora la transferencia de idiomas mediante fine-tuning. Se trata de un modelo de lenguaje pequeño (124 millones de parámetros) basado en arquitectura GPT-2, que parte de un modelo base entrenado en japonés (`fpadovani/ppt-art-lang-jpn-baseline-100mb_seed10`) y se ajusta con Supervised Fine-Tuning (SFT) sobre datos en inglés. El nombre del repositorio indica que se ha entrenado con 100 MB de datos en inglés después de un baseline en japonés, con un checkpoint en el paso 500 y semilla 10.

Este modelo no está pensado para uso en producción, sino como parte de una línea de investigación sobre cómo el conocimiento lingüístico adquirido en un idioma puede transferirse o interferir con el aprendizaje de otro. Es relevante para quienes estudian la adaptación de modelos multilingües, la evolución de representaciones intermedias o la influencia del orden de entrenamiento de idiomas. No se proporcionan métricas de calidad ni detalles sobre el dataset, por lo que su valor es principalmente experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (presumiblemente inglés y japonés, pero no confirmado) |
| Licencia | no disponible (el modelo card indica "license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 de 124 millones de parámetros, con 12 capas de transformer, 12 cabezas de atención y una dimensión de embedding de 768. No se especifica si hay modificaciones estructurales respecto al GPT-2 original.

El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) usando la librería TRL (Transformer Reinforcement Learning) de Hugging Face. El modelo base es un modelo GPT-2 entrenado desde cero en japonés (baseline de 100 MB de datos). El fine-tuning se ha realizado con un dataset en inglés de aproximadamente 100 MB (según el nombre), y se guardó un checkpoint en el paso 500. No se proporcionan detalles sobre el dataset exacto, la proporción de idiomas ni la configuración del entrenamiento (learning rate, batch size, etc.). No se mencionan técnicas de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto en inglés (y potencialmente japonés residual, aunque no está confirmado) mediante el pipeline de Hugging Face.
- Soporte de chat básico: el ejemplo de uso en la model card muestra un formato de conversación con roles `user` y `assistant`, aunque no se garantiza que el modelo haya sido entrenado específicamente para diálogo.
- Capacidad de razonamiento limitada, típica de un modelo pequeño de 124M.
- No soporta tool calling, function calling ni agentes.
- No tiene capacidades multimodales (visión, audio).
- No se indica si tiene un modo de pensamiento o "thinking mode".

## Casos de uso

- Investigación académica sobre transferencia de idiomas: permite estudiar cómo un modelo pre-entrenado en japonés se adapta al inglés, analizando la evolución de las representaciones intermedias en el checkpoint 500.
- Estudio de la interferencia lingüística: al comparar este modelo con otros de la misma serie (por ejemplo, `eng-10mb-after-jpn-baseline-ckpt500_seed3407`), se puede medir el efecto del tamaño del corpus de fine-tuning en la adquisición de un segundo idioma.
- Generación de texto experimental en entornos de bajo recursos: con solo 124M de parámetros, puede ejecutarse en CPU, lo que facilita la experimentación en laboratorios sin GPUs potentes.
- Evaluación de la plasticidad de modelos pequeños: sirve para probar si un modelo de tamaño reducido puede retener conocimiento de un idioma fuente mientras aprende otro.
- Prototipado rápido de aplicaciones de chatbot monolingüe en inglés, aunque con calidad limitada y sin garantías de coherencia a largo plazo.
- Reproducibilidad de experimentos: el checkpoint está disponible públicamente, lo que permite a otros investigadores replicar el estudio y verificar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El modelo es un experimento de investigación sin evaluaciones públicas.

## Requisitos de hardware

- VRAM estimada: ~1 GB en float32 (124M parámetros × 4 bytes). Con cuantización de 8 bits, se reduce a ~500 MB; en 4 bits, ~250 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060). También puede ejecutarse en CPU con suficiente RAM (4-8 GB).
- Compatible con hardware consumer: sí, es un modelo pequeño que cabe en la mayoría de GPUs de consumo.
- Opciones de despliegue: puede usarse con `transformers` pipeline, `vLLM` (aunque es un modelo pequeño, no optimizado para ese tipo de servidores), `llama.cpp` si se convierte a GGUF, u `Ollama` (requiere conversión previa).
- Latencia: en GPU (por ejemplo, RTX 4090) la generación de 128 tokens tarda menos de 1 segundo; en CPU (8 núcleos) puede tardar 5-10 segundos para la misma longitud.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| fpadovani/eng-100mb-after-jpn-baseline-ckpt500_seed10 | 124M | no disponible | no disponible | Fine-tune de GPT-2 en inglés tras pre-entrenamiento en japonés |
| GPT-2 small (original) | 124M | 1024 tokens | MIT | Modelo base sin fine-tuning específico |
| DistilGPT-2 | 82M | 1024 tokens | MIT | Versión destilada de GPT-2, más rápida pero menos capaz |
| fpadovani/jpn-100mb-after-eng-baseline-ckpt500_seed3407 | 124M (presumible) | no disponible | no disponible | Modelo gemelo entrenado en japonés después de inglés (orden inverso) |

No se dispone de comparaciones de rendimiento porque no hay benchmarks publicados. La comparativa se limita a características arquitectónicas y de propósito.

## Limitaciones y advertencias

- Modelo muy pequeño (124M) que genera texto de baja calidad, con incoherencias frecuentes y poca capacidad de razonamiento.
- No se ha evaluado su comportamiento en términos de sesgos, y es probable que herede sesgos del dataset de entrenamiento, que no se describe.
- Riesgo de alucinación alto: al ser un modelo pequeño, tiende a generar información inventada o repetitiva.
- La licencia no está especificada, por lo que el uso comercial no está garantizado y podría haber restricciones no documentadas.
- No se garantiza soporte para idiomas distintos del inglés y japonés; el modelo puede degradarse con otros idiomas.
- Es un checkpoint intermedio (paso 500) de un experimento, no un modelo final optimizado para ninguna tarea.
- No hay información sobre el dataset de entrenamiento, lo que impide evaluar la calidad de los datos y el posible sesgo.
- El modelo no está diseñado para producción: no soporta tool calling, ni agentes, ni control de calidad.

## Enlaces

- [Hugging Face: fpadovani/eng-100mb-after-jpn-baseline-ckpt500_seed10](https://huggingface.co/fpadovani/eng-100mb-after-jpn-baseline-ckpt500_seed10)
- [Modelo base: fpadovani/ppt-art-lang-jpn-baseline-100mb_seed10](https://huggingface.co/fpadovani/ppt-art-lang-jpn-baseline-100mb_seed10)
- [Registro de entrenamiento en Weights & Biases](https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/gno3ee5z)
