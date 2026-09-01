# fpadovani/nld-100mb-after-nld_newlexicon_zipf-ckpt500_seed455

## Resumen

El modelo `fpadovani/nld-100mb-after-nld_newlexicon_zipf-ckpt500_seed455` es un ajuste fino (fine-tune) del modelo base `fpadovani/ppt-nld_newlexicon_zipf-100mb_seed455`, desarrollado por fpadovani, investigador afiliado a la Universidad de Groningen. Se trata de un modelo de generación de texto basado en la arquitectura GPT-2, con aproximadamente 124,7 millones de parámetros, entrenado mediante aprendizaje supervisado (SFT) utilizando la librería TRL de HuggingFace.

El modelo forma parte de una línea de investigación sobre el aprendizaje de lenguajes artificiales y la distribución de frecuencias léxicas (ley de Zipf), como sugiere el nombre "newlexicon_zipf". Su relevancia radica en que permite estudiar cómo afecta la distribución de frecuencias de un léxico artificial al comportamiento de un modelo de lenguaje, un tema de interés para la psicolingüística computacional y la investigación en adquisición del lenguaje.

Al ser un modelo de investigación con solo 124 millones de parámetros, su uso práctico está orientado a experimentación académica más que a producción. El repositorio tiene un tamaño de 6,5 GB, lo que sugiere que se incluyen múltiples formatos o checkpoints. No se dispone de información sobre licencia, idiomas soportados o benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (Transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (GPT-2 base: 1024 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder autoregresivo con mecanismo de atención por máscara causal. Con 124,7 millones de parámetros, corresponde a la variante "small" de GPT-2 (124M). El ajuste fino se realizó mediante aprendizaje supervisado (SFT) utilizando la librería TRL (Transformer Reinforcement Learning) de HuggingFace, con el framework Transformers 4.56.2 y PyTorch 2.11.0.

El proceso de entrenamiento partió del checkpoint `fpadovani/ppt-nld_newlexicon_zipf-100mb_seed455`, que a su vez es un modelo preentrenado con 100 MB de datos de un léxico artificial (newlexicon) con distribución de frecuencias tipo Zipf. El nombre del modelo indica que es el checkpoint número 500 de este ajuste fino. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas adicionales como RLHF o DPO. El entrenamiento se registró en Weights & Biases, aunque el enlace al run no está disponible en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva: el modelo puede generar texto continuando un prompt o respondiendo a instrucciones en formato chat, como muestra el ejemplo de la model card.
- Conversación en formato diálogo: el pipeline de ejemplo utiliza mensajes con roles (`user`), lo que indica soporte para el formato de chat de Transformers.
- Investigación en adquisición del lenguaje: su capacidad principal es servir como herramienta experimental para estudiar el efecto de la distribución léxica en el comportamiento de modelos de lenguaje.
- No se dispone de información sobre capacidades de tool calling, razonamiento multi-paso, visión, audio u otras capacidades especiales.

## Casos de uso

- Investigación en psicolingüística computacional: el modelo permite estudiar cómo un léxico artificial con distribución Zipf afecta la generación de lenguaje, comparando con variantes del mismo experimento (por ejemplo, los modelos `nld-100mb-after-nld_newlexicon_zipf_heavy-ckpt500_seed455` o `nld-100mb-after-newlexicon-zipf-nld-heavy-baseline-ckpt500_seed455`).
- Experimentos de adquisición de vocabulario: al estar entrenado con un léxico artificial, puede usarse para simular cómo un agente aprende y produce palabras con diferentes frecuencias de aparición.
- Evaluación de métricas de distribución léxica: sirve para validar hipótesis sobre la ley de Zipf en modelos generativos, comparando la distribución de frecuencias de sus salidas con la del léxico de entrenamiento.
- Generación de texto controlada en entornos académicos: puede emplearse en laboratorios docentes para ilustrar el funcionamiento de modelos GPT-2 y el ajuste fino con TRL.
- Pruebas de metodología SFT: al ser un checkpoint intermedio (ckpt500), permite analizar la evolución del entrenamiento y el efecto del número de pasos en la calidad de la generación.
- Reproducibilidad de experimentos: al estar disponible públicamente con semilla fija (seed455), puede usarse para reproducir experimentos publicados en artículos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar. Dado el tamaño del modelo (124M) y su naturaleza experimental, es probable que no se hayan realizado evaluaciones comparativas con modelos de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 124M de parámetros, la inferencia en FP32 requiere aproximadamente 0,5 GB de VRAM. Con cuantización a 8 bits, podría reducirse a unos 0,25 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionan sin problemas. También es viable en CPU para inferencia de baja latencia.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer actual e incluso en muchas GPU integradas.
- Opciones de despliegue: compatible con Transformers pipeline, text-generation-inference (TGI), y plataformas como FriendliAI que ya listan modelos similares del mismo autor.
- Latencia y throughput: no se dispone de datos medidos, pero para un modelo de este tamaño, la generación de 128 tokens en una GPU moderna (RTX 3090 o superior) debería completarse en menos de un segundo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría. El autor ha publicado varios modelos con variaciones del mismo experimento (por ejemplo, `nld-100mb-after-nld_newlexicon_zipf_heavy-ckpt500_seed455` y `nld-100mb-after-newlexicon-zipf-nld-heavy-baseline-ckpt500_seed455`), que difieren en el léxico o el procedimiento de entrenamiento. Sin embargo, no se dispone de datos de rendimiento comparativos entre ellos. Como referencia de arquitectura, el modelo base GPT-2 small (124M) de OpenAI es el punto de partida, pero no se han publicado comparaciones directas.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción ni para tareas de propósito general.
- Sesgos y alucinaciones: al ser un modelo pequeño entrenado con un léxico artificial, es probable que genere texto incoherente o con errores gramaticales fuera de su dominio de entrenamiento.
- Licencia no especificada: no se indica la licencia, lo que impide conocer las restricciones de uso comercial o redistribución.
- Idiomas no especificados: no se indica qué idiomas soporta, aunque el ejemplo de la model card está en inglés.
- Contexto limitado: con una arquitectura GPT-2 base, la ventana de contexto probablemente esté limitada a 1024 tokens, aunque no se confirma en la documentación.
- Sin benchmarks: no hay datos objetivos de calidad que permitan comparar con otros modelos.
- Repositorio grande: el tamaño de 6,5 GB para un modelo de 124M sugiere que se incluyen múltiples archivos o formatos, lo que puede complicar la descarga en entornos con ancho de banda limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/nld-100mb-after-nld_newlexicon_zipf-ckpt500_seed455
- Modelo base: https://huggingface.co/fpadovani/ppt-nld_newlexicon_zipf-100mb_seed455
- Variante con léxico heavy: https://huggingface.co/fpadovani/nld-100mb-after-nld_newlexicon_zipf_heavy-ckpt500_seed455
- Variante baseline: https://huggingface.co/fpadovani/nld-100mb-after-newlexicon-zipf-nld-heavy-baseline-ckpt500_seed455
- Página del modelo en FriendliAI: https://friendli.ai/models/fpadovani/nld-100mb-after-newlexicon-zipf-nld-heavy-baseline-ckpt500_seed455
- Página en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Fnld-latn-10mb-ppt-Dp-100mb_seed455,3oHjl5GZGfbeJqghxz6fDk
