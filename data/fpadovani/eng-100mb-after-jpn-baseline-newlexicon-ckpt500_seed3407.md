# fpadovani/eng-100mb-after-jpn-baseline-newlexicon-ckpt500_seed3407

## Resumen

El modelo `fpadovani/eng-100mb-after-jpn-baseline-newlexicon-ckpt500_seed3407` es un fine-tune experimental de un modelo base GPT-2 de 124 millones de parámetros, desarrollado por fpadovani (afiliado a la Universidad de Groningen según el enlace de Weights & Biases). Forma parte de una serie de experimentos sobre transferencia de idiomas y aprendizaje de léxico: el modelo base fue entrenado en japonés con un nuevo léxico (`ppt-art-lang-newlexicon-jpn-baseline-100mb_seed3407`) y posteriormente se fine-tuneó en inglés (el nombre indica "eng-100mb-after-jpn"). El objetivo parece ser estudiar cómo un modelo pre-entrenado en un idioma (japonés) se adapta a otro (inglés) tras un ajuste fino supervisado (SFT).

Se trata de un modelo de investigación, con cero descargas y sin documentación detallada más allá de la generada automáticamente por el entrenamiento. No se especifican licencia, idiomas soportados ni benchmarks. Su relevancia es principalmente académica, dentro de un estudio sobre adquisición de vocabulario y transferencia entre lenguas en modelos pequeños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (por defecto en GPT-2: 1024, pero no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (por el nombre: inglés y japonés, pero no declarado) |
| Licencia | no disponible (en el YAML aparece "license" sin valor concreto) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder autoregresivo. El tamaño de 124M parámetros coincide con la variante "small" de GPT-2. El entrenamiento se realizó en dos fases: primero un pre-entrenamiento en japonés con un "nuevo léxico" (modelo base `ppt-art-lang-newlexicon-jpn-baseline-100mb_seed3407`), y después un fine-tune supervisado (SFT) en inglés, utilizando la librería TRL (Transformers Reinforcement Learning) de Hugging Face. El checkpoint corresponde al paso 500 del entrenamiento de fine-tune, con semilla 3407.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El único dato disponible es que se usó SFT con TRL 0.23.0, Transformers 4.56.2 y PyTorch 2.11.0. El enlace a Weights & Biases sugiere que el entrenamiento fue monitorizado, pero no se han hecho públicos los logs.

## Capacidades

- Generación de texto autoregresiva: el modelo puede completar o continuar texto a partir de un prompt, como se muestra en el ejemplo de la model card (una pregunta sobre viajes en el tiempo).
- Fine-tune en inglés tras pre-entrenamiento en japonés: capacidad de transferencia entre idiomas, aunque no se especifica el nivel de competencia en cada lengua.
- Soporte de chat básico: el ejemplo de uso emplea el formato de mensajes con roles (`user`), lo que sugiere compatibilidad con el pipeline de `text-generation` de Transformers.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigación académica sobre transferencia de idiomas: el modelo sirve para estudiar cómo un modelo pre-entrenado en japonés se adapta al inglés tras un fine-tune, permitiendo analizar la plasticidad del léxico y la representación semántica.
- Experimentos de adquisición de vocabulario: al ser un modelo pequeño y con un "nuevo léxico", puede usarse para probar hipótesis sobre cómo los modelos aprenden palabras nuevas y las transfieren entre idiomas.
- Generación de texto en entornos de baja capacidad: con solo 124M parámetros, puede ejecutarse en hardware modesto, siendo útil para prototipos o demos educativas.
- Línea base para comparar con otros checkpoints de la misma familia (por ejemplo, `ckpt500_seed455` o `ckpt4000_seed3407`) en estudios de ablación.
- Pruebas de fine-tune con TRL: al ser un modelo generado con TRL, puede servir como ejemplo de flujo de trabajo SFT para desarrolladores que quieran replicar el proceso.
- Evaluación de la influencia de la semilla y el checkpoint en el rendimiento final, dado que existen múltiples variantes con distintas semillas y pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo no presenta métricas de rendimiento en su model card ni en la documentación asociada.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 124M parámetros, en FP32 ocupa aproximadamente 500 MB de memoria. Con cuantización a 8 bits o 4 bits, el uso de VRAM sería menor (unos 250 MB o 125 MB respectivamente), aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente para inferencia en FP32. Una RTX 3060, RTX 4060 o incluso una GPU integrada podrían ejecutarlo, aunque con menor velocidad.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna de consumo, incluidas las de gama baja.
- Opciones de despliegue: al ser un modelo estándar de Transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (mediante conversión). También se puede usar directamente con el pipeline de `transformers`.
- Latencia y throughput: no hay datos oficiales. En una GPU como una RTX 4090, la generación de 128 tokens debería ser casi instantánea (menos de 1 segundo), pero es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo pertenece a una familia de checkpoints experimentales del mismo autor, como:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| fpadovani/eng-100mb-after-jpn-baseline-newlexicon-ckpt500_seed3407 | 124M | no disponible | no disponible | Fine-tune en inglés tras japonés, seed 3407 |
| fpadovani/eng-100mb-after-jpn-baseline-ckpt500_seed455 | 124M (presumible) | no disponible | no disponible | Variante sin "newlexicon", seed 455 |
| fpadovani/jpn-100mb-after-eng-baseline-ckpt500_seed455 | 124M (presumible) | no disponible | no disponible | Fine-tune en japonés tras inglés, seed 455 |

No hay datos de rendimiento comparativo entre estas variantes. Tampoco se pueden comparar con modelos comerciales o de código abierto conocidos (como GPT-2, Llama, Mistral) porque no se han evaluado con los mismos benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo pequeño entrenado con un dataset no especificado, puede heredar sesgos del corpus de pre-entrenamiento y del fine-tune. No hay documentación sobre mitigación de sesgos.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto plausible pero incorrecto o inventado, especialmente en temas factuales.
- Limitaciones de contexto: la longitud de contexto no está documentada; si se mantiene la de GPT-2, sería de 1024 tokens, lo que limita tareas que requieran contexto largo.
- Limitaciones de idioma: aunque el nombre sugiere inglés y japonés, no se ha verificado el nivel de competencia en cada idioma. El modelo podría no funcionar bien en otros idiomas.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin aclaración previa con el autor.
- Naturaleza experimental: es un checkpoint de investigación con 0 descargas, sin validación externa ni soporte. No es adecuado para producción sin una evaluación exhaustiva.
- Dependencia de la semilla y el checkpoint: el rendimiento puede variar significativamente entre las distintas variantes (semillas y pasos), por lo que los resultados no son generalizables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/eng-100mb-after-jpn-baseline-newlexicon-ckpt500_seed3407
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-jpn-baseline-100mb_seed3407
- Variante similar (seed 455): https://huggingface.co/fpadovani/eng-100mb-after-jpn-baseline-ckpt500_seed455
- Variante inversa (japonés tras inglés): https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-ckpt500_seed455
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/vo8zmnjm
- Repositorio de TRL: https://github.com/huggingface/trl
