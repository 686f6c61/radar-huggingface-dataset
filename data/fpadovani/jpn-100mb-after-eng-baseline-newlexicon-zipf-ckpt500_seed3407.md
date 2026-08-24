# fpadovani/jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed3407

## Resumen

Este modelo es un fine-tune de un modelo base de 124 millones de parámetros, desarrollado por fpadovani, aparentemente como parte de una investigación sobre la adquisición de lenguaje artificial en modelos pequeños. El nombre sugiere que se trata de un experimento con un "nuevo léxico" y una distribución zipfiana, entrenado sobre un corpus de inglés de 100 MB. El modelo base es `fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407`, y este checkpoint concreto es el paso 500 de un ajuste fino supervisado (SFT) realizado con la librería TRL de Hugging Face.

Aunque la documentación es escasa, el modelo parece orientado a experimentos académicos sobre cómo los modelos de lenguaje aprenden estructuras lingüísticas cuando se les presenta un vocabulario artificial con propiedades estadísticas controladas. No se proporcionan detalles sobre el conjunto de datos de fine-tuning, el rendimiento en tareas estándar ni la licencia exacta, por lo que su uso en producción no está recomendado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (según tags, no confirmado) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el ejemplo de uso es en inglés) |
| Licencia | no disponible (el YAML indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es presumiblemente la de GPT-2, dado el tag `gpt2` en HuggingFace, aunque no se detalla. El modelo es un fine-tune de un modelo base ya entrenado sobre un corpus de inglés de 100 MB con un "nuevo léxico" y distribución Zipf. El fine-tuning se realizó mediante SFT (Supervised Fine-Tuning) usando la biblioteca TRL, con una configuración que incluye Transformers 4.56.2, PyTorch 2.11.0 y Datasets 4.8.4. No se especifican los datos de entrenamiento del fine-tuning ni el número de tokens procesados.

El proceso de entrenamiento está documentado en Weights & Biases (enlace en la model card), pero el acceso a los detalles completos no está disponible en la información pública.

## Capacidades

- Generación de texto: el modelo puede generar respuestas a partir de un prompt, como se muestra en el ejemplo de la model card con una pregunta sobre una máquina del tiempo.
- Soporte de chat: el ejemplo usa el formato de mensajes con roles (`user`), lo que sugiere capacidad de interacción conversacional básica.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni otras funciones especiales.

## Casos de uso

- Investigación en adquisición de lenguaje artificial: el modelo puede servir para estudiar cómo un modelo pequeño aprende regularidades sintácticas y semánticas cuando se le presenta un léxico artificial, lo que podría interesar a lingüistas computacionales y científicos cognitivos.
- Experimentación con fine-tuning en entornos académicos: su tamaño pequeño (124 M) lo hace accesible para ejecutar experimentos de ajuste fino en una sola GPU consumer, permitiendo reproducir y comparar resultados con otras semillas (hay variantes con seeds 10, 455, etc.).
- Pruebas de hipótesis sobre la influencia de la distribución de frecuencia de palabras: el nombre "zipf" sugiere que se estudia el efecto de la ley de Zipf en la adquisición de lenguaje, por lo que puede usarse para análisis de propiedades estadísticas del lenguaje.
- Desarrollo de modelos de juguete para prototipado: su pequeño tamaño permite integrarlo en pipelines de investigación para pruebas de concepto antes de escalar a modelos mayores.
- Evaluación de técnicas de alineación (SFT, DPO) en modelos pequeños: dado que se usó TRL, puede servir como banco de pruebas para comparar métodos de entrenamiento.
- Educación y divulgación: puede utilizarse en cursos de NLP para ilustrar conceptos de fine-tuning y generación de texto con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni otros estándares.

## Requisitos de hardware

- Al tener 124 millones de parámetros, el modelo ocupa aproximadamente 250 MB en fp16 (no se especifica cuantización, pero safetensors suele almacenar en fp32 o fp16). El tamaño del repositorio es de 4.2 GB, que probablemente incluye múltiples archivos de pesos o versiones.
- Para inferencia, una GPU con 4-6 GB de VRAM sería suficiente incluso en fp32 (aproximadamente 500 MB de pesos). Cabe en cualquier GPU consumer moderna (GTX 1060 6GB, RTX 2060, etc.) y también en CPU.
- Se puede desplegar con la pipeline de `transformers` (como muestra el ejemplo), y también sería compatible con vLLM, llama.cpp u Ollama si se convierte a GGUF, aunque no hay indicación de que se hayan generado formatos GGUF.
- No se han publicado mediciones de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (experimentos con léxico artificial). Existen variantes del mismo autor con diferentes semillas (seed 10, 455) y otras configuraciones, pero no hay datos de rendimiento que permitan una comparación objetiva.

## Limitaciones y advertencias

- No se especifica la licencia exacta; el YAML contiene "licence: license" que no es una licencia válida, por lo que su uso comercial es incierto.
- El modelo es un experimento de investigación, no un producto listo para producción. No se ha evaluado su seguridad, sesgos o robustez.
- No se han documentado los datos de entrenamiento del fine-tuning, lo que impide evaluar posibles sesgos.
- La longitud de contexto no está publicada; si sigue la de GPT-2, sería de 1024 tokens, pero no se confirma.
- No se garantiza la calidad de las respuestas en tareas generales; el ejemplo de la model card es una pregunta filosófica, pero no hay evidencia de que funcione bien en otros dominios.
- El modelo está en inglés (según el ejemplo), pero no se declara soporte para otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed3407
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407
- Variantes del mismo experimento:
  - https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-ckpt500_seed3407
  - https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-ckpt500_seed455
  - https://huggingface.co/fpadovani/jpn-100mb-after-newlexicon-eng-baseline-ckpt500_seed455
- Enlace a Weights & Biases del entrenamiento: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/80bmatdx (indicado en la model card)
- Página de FriendliAI para despliegue: https://friendli.ai/models/fpadovani/jpn-100mb-after-eng-baseline-ckpt500_seed3407 (para una variante similar)
