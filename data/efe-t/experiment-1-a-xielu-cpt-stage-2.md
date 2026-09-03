# efe-T/Experiment-1-A-xIELU-CPT-Stage-2

## Resumen

El modelo `efe-T/Experiment-1-A-xIELU-CPT-Stage-2` es un experimento de continuación de preentrenamiento (CPT) sobre un checkpoint previo denominado `Experiment-1-A-xIELU-CPT`, desarrollado por el usuario efe-T. Se trata de un modelo de lenguaje basado en la arquitectura GPT-2, pero con una función de activación personalizada llamada xIELU (una variante de la ELU), que se mantiene entrenable durante el proceso. El objetivo es explorar el impacto de esta activación en el aprendizaje continuado sobre datos no vistos de FineWeb-Edu.

El repositorio contiene pesos en formato safetensors y código fuente PyTorch personalizado; no es un modelo compatible directamente con la librería Transformers. En el momento de la consulta, el estado del entrenamiento es "running" (en ejecución), con 0 tokens procesados en esta segunda etapa, aunque la etapa base acumuló 4 000 317 440 tokens. La ventana de atención es progresiva, desde 2 304 hasta 8 192 tokens, manteniéndose en el máximo durante el último 20 % del entrenamiento.

La relevancia de este modelo radica en su carácter experimental: investiga cómo una activación no estándar (xIELU) se comporta en un escenario de preentrenamiento continuado, con una configuración de entrenamiento detallada y reproducible. No se dispone de información sobre licencia, idiomas soportados ni benchmarks, por lo que su uso práctico queda limitado al ámbito de la investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 con activación xIELU (personalizada) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 8 192 tokens (máximo, progresivo desde 2 304) |
| Tipos de cuantizacion | no disponible (entrenamiento en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con código PyTorch personalizado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, pero sustituye la activación estándar por xIELU, una función de activación exponencial lineal modificada que se mantiene entrenable durante el preentrenamiento. Esta elección es la principal innovación técnica del experimento. El entrenamiento se realiza en dos etapas: una primera etapa de preentrenamiento continuado (CPT) sobre FineWeb-Edu, y esta segunda etapa que continúa desde el checkpoint final de la primera, procesando los siguientes tokens no vistos del mismo dataset.

Los datos de entrenamiento provienen de FineWeb-Edu, con un total de 4 000 317 440 tokens procesados en la etapa base y un objetivo de 2 000 158 720 tokens para esta segunda etapa. El entrenamiento utiliza una GPU NVIDIA A100-SXM4-40GB, con precisión BF16 y un tamaño de lote efectivo de 524 288 tokens por paso de optimizador. La ventana de atención se incrementa progresivamente desde 2 304 hasta 8 192 tokens, manteniéndose en el máximo durante el último 20 % del entrenamiento. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

No se dispone de información detallada sobre las capacidades específicas del modelo. Al estar basado en GPT-2, se espera que pueda generar texto coherente, pero no hay datos sobre razonamiento, generación de código, matemáticas, tool calling, soporte para agentes o capacidades multilingües. El modelo no es un drop-in de Transformers, por lo que su integración requiere código personalizado. No se ha documentado ninguna capacidad especial como modo de pensamiento, visión o audio.

## Casos de uso

No se han documentado casos de uso concretos para este modelo. Dado su carácter experimental y su estado de entrenamiento en curso, no se recomienda su uso en aplicaciones de producción. Los posibles usos se limitan a:

- Investigación académica: estudiar el comportamiento de la activación xIELU en preentrenamiento continuado y comparar con activaciones estándar.
- Reproducción de experimentos: el repositorio incluye el código fuente exacto y la configuración de entrenamiento, lo que permite replicar el proceso.
- Desarrollo de nuevas arquitecturas: servir como base para probar variantes de activaciones o técnicas de atención progresiva.
- Análisis de representaciones internas: examinar cómo la activación personalizada afecta a las representaciones aprendidas en diferentes capas.
- Benchmarking de eficiencia: medir el rendimiento de la activación xIELU en términos de velocidad de entrenamiento y convergencia.
- Exploración de escalado: evaluar si la activación se comporta bien al aumentar el número de parámetros o la longitud de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar. El modelo se encuentra en fase de entrenamiento, por lo que no se han realizado evaluaciones de rendimiento final.

## Requisitos de hardware

- El entrenamiento se realizó en una NVIDIA A100-SXM4-40GB con precisión BF16.
- Para inferencia, no se especifican requisitos de VRAM. Dado que el repositorio ocupa 2.8 GB en safetensors, se estima que el modelo tiene un tamaño de parámetros relativamente pequeño (posiblemente en el rango de 250M a 1B), pero no se puede confirmar.
- No se indica si es compatible con GPUs de consumo (como RTX 4090) ni con frameworks de inferencia como vLLM, llama.cpp u Ollama. El artículo de heise menciona que la activación xIELU y el QK standard impiden el soporte en llama.cpp, por lo que es probable que no funcione con herramientas estándar.
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Al ser un experimento con una activación personalizada y sin datos de rendimiento, no es posible establecer una comparativa con otros modelos de la misma categoría. Se podría mencionar que comparte similitudes con otros experimentos de activaciones alternativas, pero no hay datos concretos.

## Limitaciones y advertencias

- El modelo está en fase de entrenamiento (estado "running") y no se ha completado, por lo que su comportamiento final es desconocido.
- No es un modelo compatible con la librería Transformers; requiere el código PyTorch personalizado incluido en el repositorio.
- No se especifica licencia, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- No se conocen sesgos ni riesgos de alucinación, pero al estar entrenado únicamente en FineWeb-Edu (un subconjunto filtrado de Common Crawl), puede presentar limitaciones en dominios especializados.
- La ventana de contexto máxima es de 8 192 tokens, inferior a modelos actuales de mayor tamaño.
- No hay soporte documentado para tool calling, agentes u otras capacidades avanzadas.
- El uso en producción no está recomendado debido a su naturaleza experimental y a la falta de evaluación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/efe-T/Experiment-1-A-xIELU-CPT-Stage-2
- Artículo de heise sobre Apertus (menciona xIELU y QK standard): https://www.heise.de/en/background/Apertus-tested-How-the-multilingual-AI-model-performs-10645644.html
