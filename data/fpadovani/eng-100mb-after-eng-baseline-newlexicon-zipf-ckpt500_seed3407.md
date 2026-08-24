# fpadovani/eng-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed3407

## Resumen

El modelo `fpadovani/eng-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed3407` es un checkpoint de investigación desarrollado por Francesco Padovani (Universidad de Groninga) dentro del proyecto `ppt_art_lang`, que estudia cómo los modelos de lenguaje aprenden lenguajes artificiales con distribuciones estadísticas controladas. Se trata de un ajuste fino (SFT) del modelo base `fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407`, que a su vez es un modelo de 100 millones de parámetros con arquitectura GPT-2.

Este modelo concreto es un punto de control (checkpoint) a los 500 pasos de entrenamiento sobre un corpus de inglés con un vocabulario artificial que sigue una distribución de Zipf. Su relevancia es exclusivamente académica: sirve para analizar cómo evoluciona la representación interna del lenguaje a lo largo del entrenamiento, no para uso en producción. El repositorio incluye pesos en formato `safetensors` y está preparado para la librería `transformers` con el pipeline de generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parámetros totales | 124.770.816 |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se puede cuantizar con herramientas estándar, pero no se publican pesos GGUF ni AWQ) |
| Idiomas soportados | no disponible (el entrenamiento usa texto en inglés, pero no se especifican idiomas oficiales) |
| Licencia | no disponible (la model card indica "licence: license" sin aclarar término) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer tipo GPT2 con 124 millones de parámetros, entrenado mediante ajusto fino supervisado (SFT) con la librería `trl` (Transformer Reinforcement Learning) y `transformers`. El entrenamiento se realizó sobre un corpus de inglés de 100 MB con un vocabulario artificial (denominado `newlexicon`) que sigue una distribución de Zipf, un experimento para aislar los efectos de la distribución de frecuencias léxicas en el aprendizaje de idiomas. El modelo base fue pre-entrenado desde cero en ese mismo corpus y este checkpoint corresponde al paso 500 del ajusto fino. No se especifican datos sobre el número total de tokens, el tamaño del lote, la tasa de aprendizaje ni el hardware utilizado. El entrenamiento se registró en Weights & Biases (enlace incluido en la model card), aunque los detalles no se reflejan en la información pública.

## Capacidades

- Generación de texto: el modelo puede producir texto coherente en inglés, aunque su vocabulario está restringido al léxico artificial del experimento.
- No se declara soporte para tool calling, function calling, agentes ni razonamiento multi-paso.
- No se declara capacidades de visión ni audio.
- No se indica si es multilingüe; el corpus de entrenamiento es en inglés.
- Es un modelo de investigación, no diseñado para tareas generales de NLP.

## Casos de uso

- Investigación en lingüística computacional: estudiar cómo el modelo adquiere estructuras sintácticas y semánticas con un léxico artificial controlado, comparando checkpoints intermedios (como este) con el modelo final.
- Análisis de la relación entre frecuencia léxica y representaciones internas: el diseño con distribución de Zipf permite evaluar el efecto de la frecuencia de palabras en el aprendizaje.
- Reproducción de experimentos: dado que se publica el checkpoint y el código de entrenamiento (vía TRL), los investigadores pueden replicar el experimento o usarlo como punto de partida para variaciones.
- Evaluación de la dinámica de entrenamiento: al ser un checkpoint a 500 pasos, permite analizar la evolución de las representaciones durante el ajusto fino.
- Comparación entre seeds: el autor publica otros checkpoints con diferentes semillas (seed 10, seed 455), lo que permite estudios de variabilidad en el aprendizaje.
- No se recomienda para aplicaciones de producción (chat, generación de código, etc.) por su naturaleza experimental y su vocabulario restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no está evaluado en MMLU, HumanEval, GSM8K ni otros conjuntos estándar, ya que su propósito es experimental y su vocabulario no coincide con el lenguaje natural estándar.

## Requisitos de hardware

- VRAM estimada: para inferencia en fp32, un modelo de 124M parámetros requiere aproximadamente 0,5 GB de VRAM (sin contar la memoria del contexto). Con cuantización a 8 bits puede bajar a ~0,25 GB. Es viable en cualquier GPU consumer moderna (p.ej., RTX 2060 o superior).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo con holgura. Una RTX 3060 o similar es suficiente.
- Despliegue: compatible con `transformers` (pipeline de generación), también con vLLM, TGI, llama.cpp y Ollama si se convierten los pesos a GGUF (aunque no se proporcionan). El modelo está etiquetado como "endpoints_compatible".
- Latencia: para un modelo de este tamaño, la generación de 128 tokens en una GPU moderna tarda del orden de segundos, pero no hay datos oficiales.
- En CPU: puede funcionar, aunque más lento, con llama.cpp o similar.

## Comparativa con modelos similares

No hay modelos comparables directos, porque se trata de un experimento con un léxico artificial. Como referencia, se puede comparar con el GPT-2 original (124M parámetros) y con otros modelos de investigación de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| GPT-2 (OpenAI) | 124M | 1024 tokens | MIT | Generación de texto general |
| `fpadovani/eng-100mb-after-...` (este) | 124M | no disponible | no disponible | Investigación en aprendizaje de lenguajes artificiales |
| `fpadovani/eng-100mb-after-eng-baseline-ckpt500_seed455` | 124M | no disponible | no disponible | Variante con otra semilla |

La principal diferencia es que GPT-2 está entrenado en texto natural y tiene una licencia permisiva, mientras que este modelo es experimental y su licencia no está clara.

## Limitaciones y advertencias

- **Vocabulario artificial**: el modelo usa un léxico artificial (newlexicon) que no corresponde al inglés natural. No es útil para tareas de NLP general.
- **Licencia no especificada**: la model card indica `licence: licence` sin detallar términos. No se puede asumir permisos de uso comercial.
- **Sin datos de entrenamiento**: no se publica el dataset completo ni la composición exacta del corpus.
- **Alucinación**: al ser un modelo de lenguaje, puede generar texto incoherente o inventar información, aunque su vocabulario restringido limita el riesgo.
- **Contexto desconocido**: no se especifica la longitud de contexto máxima, lo que dificulta su uso en aplicaciones con secuencias largas.
- **Sin garantías de producción**: es un checkpoint de investigación; no se ha evaluado su seguridad ni robustez.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/fpadovani/eng-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed3407)
- [Modelo base](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed3407)
- [Weights & Biases run](https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/2vw5qvjo)
- [TRL (librería de entrenamiento)](https://github.com/huggingface/trl)

Nota: la búsqueda web no proporcionó información adicional relevante; los resultados enlazan a páginas de otros checkpoints del mismo autor y a plataformas de despliegue que no contienen datos técnicos adicionales.
