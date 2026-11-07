# enzoferracini/patchinsight-bertimbau-ptbr

## Resumen

PatchInsight 0.1 es un modelo de clasificación multietiqueta de texto en portugués de Brasil, desarrollado por el autor independiente enzoferracini. Se construye mediante ajuste completo de los pesos de BERTimbau Base (`neuralmind/bert-base-portuguese-cased`) con una cabeza de cinco salidas sigmoid que predicen componentes textuales independientes en el orden `action`, `context`, `method`, `result` y `measurement`. El problema que aborda es la descomposición automática de fragmentos de texto profesional (por ejemplo, descripciones de experiencias o proyectos) en componentes semánticos etiquetados.

El modelo tiene 108.926.981 parámetros totales y un repositorio de 0,4 GB en formato safetensors. Trabaja con una longitud máxima de 192 tokens durante el entrenamiento y la licencia es MIT. Es un experimento abierto y de alcance reducido, no un sistema de producción validado: los datos de entrenamiento son sintéticos y fueron revisados por la misma IA que los generó, sin anotación humana.

Su relevancia es acotada y de carácter metodológico: sirve como ejemplo reproducible de ajuste de un encoder portugués para clasificación multietiqueta con evaluación honesta de limitaciones, y como base para quien quiera experimentar con extracción de componentes textuales en pt-BR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BERTimbau Base) con cabeza de clasificación multietiqueta de 5 salidas sigmoid |
| Parametros totales | 108.926.981 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 192 tokens (máximo usado en entrenamiento; el base admite 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugués de Brasil (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT base (12 capas, atención bidireccional completa) inicializado desde `neuralmind/bert-base-portuguese-cased` en la revisión `94d69c95f98f7d5b2a8700c420230ae10def0baa`, con ajuste completo de pesos y una cabeza de cinco neuronas con activación sigmoide independiente. Cada salida clasifica la presencia de un componente textual del esquema `action`/`context`/`method`/`result`/`measurement`.

El entrenamiento se ejecutó con semilla 42, hasta cinco épocas, optimizador AdamW, learning rate 2e-5, longitud máxima de 192 tokens, batch 8 con acumulación de gradientes 2, y selección del checkpoint por macro-F1 de validación (con desempate a favor de la época más antigua). Se usó un umbral fijo de 0,5 para todos los rótulos, sin ajuste sobre el conjunto de test. Los datos provienen del dataset PatchInsight Synthetic pt-BR 0.1, con 280/60/60 variantes en train/validación/test (70/15/15 escenarios), anotados y revisados por la misma IA generadora, sin revisión humana. El conjunto de test se fijó antes de los experimentos. El entrenamiento se realizó en una GPU local NVIDIA RTX A1000 de 6 GB, Python 3.11.14, sin cómputo en la nube. PyTorch advirtió de atención backward no determinística, por lo que no se garantiza identidad bit a bit entre reentrenamientos. El archivo `patchinsight.json` registra la configuración efectiva, la época seleccionada, hashes de datos y entorno.

## Capacidades

- Clasificación multietiqueta de texto en portugués de Brasil: predice simultáneamente las cinco etiquetas `action`, `context`, `method`, `result` y `measurement`.
- Detección de presencia de componentes textuales en fragmentos cortos (hasta 192 tokens).
- Salida JSON mediante la interfaz `patchinsight predict --model ./model --text '...' --json`.
- Señalización de truncamiento en la respuesta; los componentes negativos en el prefijo truncado se convierten en `unknown` para evitar afirmar ausencia en el texto completo, con score `null`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al portugués de Brasil.
- Capacidades especiales (visión, audio, thinking mode): no disponible.
- No extrae spans ni establece causalidad entre acción y efecto.

## Casos de uso

- Análisis de descripciones de proyectos en portugués: el modelo puede etiquetar qué componentes (acción, contexto, método, resultado, medición) aparecen en un texto breve, útil para prototipos de análisis de contenido profesional en pt-BR.
- Investigación metodológica sobre clasificación multietiqueta: sirve como referencia reproducible de ajuste de BERTimbau con selección por macro-F1 y evaluación honesta, para comparar con otras aproximaciones en el mismo dataset sintético.
- Filtrado y estructuración de textos de dominio software/datos/IA: dado su dominio concentrado, puede usarse para preetiquetar fragmentos de documentación técnica o notas de proyecto antes de una revisión humana.
- Docencia y experimentación con encoders portugueses: el bundle incluye configuración, hashes y manifiestos, lo que facilita reproducir el pipeline en un entorno académico con GPU de 6 GB.
- Comparación de enfoques heurísticos frente a modelos ajustados: el benchmark incluido permite contrastar una línea base heurística con un clasificador logístico congelado y el BERT ajustado en el mismo conjunto sintético.
- Desarrollo de prototipos de extracción de componentes textuales: como punto de partida para quien quiera ampliar el esquema de etiquetas o sustituir los datos sintéticos por anotaciones humanas.
- Validación de pipelines de inferencia con manejo de truncamiento: el mecanismo de `unknown` para componentes negativos en texto truncado es un ejemplo práctico de gestión de contexto insuficiente.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test sintético (60 variantes), comparando tres métodos:

| Método | Macro-F1 | Micro-F1 | Exact match |
|---|---:|---:|---:|
| heuristic | 0.6791 | 0.7634 | 0.3333 |
| frozen_logistic | 0.9888 | 0.9878 | 0.9333 |
| bert_finetuned | 0.9911 | 0.9908 | 0.9500 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La evaluación se realizó contra referencias sintéticas revisadas por la misma IA, sin anotación humana, y el propio autor advierte que la diferencia entre `frozen_logistic` y `bert_finetuned` es pequeña y no demuestra superioridad en textos reales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en fp32 ocupa aproximadamente 0,44 GB de pesos (108,9 M de parámetros), por lo que cabe holgadamente en cualquier GPU consumer con 2 GB o más.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el entrenamiento se realizó en una NVIDIA RTX A1000 de 6 GB.
- Cabe en GPU consumer: sí, en modelos como GTX 1650, RTX 3050, RTX 4060 y superiores; también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: la model card documenta una CLI propia (`patchinsight predict`); al ser un modelo BERT estándar en safetensors, es compatible con Hugging Face Transformers, y potencialmente con ONNX Runtime o TorchScript si se exporta. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PatchInsight 0.1 (este modelo) | 108,9 M | 192 tokens (entrenamiento) | Clasificación multietiqueta de 5 componentes en pt-BR | MIT | Hugging Face |
| neuralmind/bert-base-portuguese-cased | 108,9 M | 512 tokens | Encoder base pt-BR (MLM/NSP) | MIT | Hugging Face |
| BERT-base multilingual cased | 177,9 M | 512 tokens | Encoder multilingüe base | Apache 2.0 | Hugging Face |

La comparación directa de rendimiento no es posible: no hay resultados de PatchInsight en benchmarks estándar ni de los modelos base en el esquema de cinco etiquetas. La alternativa más cercana en propósito sería cualquier ajuste de BERTimbau sobre el mismo dataset sintético, pero no se han identificado modelos comparables publicados con este esquema de etiquetas.

## Limitaciones y advertencias

- Datos de entrenamiento pequeños (400 variantes en total) y sintéticos, generados y revisados por la misma IA, sin anotación humana.
- Presencia de atajos lexicales y estilísticos en los datos; las estructuras aprendidas son reglas de coocurrencia y fixtures, no un benchmark humano de marcos como XYZ o STAR.
- Dominio concentrado en software, datos e IA; la generalización a otros dominios es desconocida.
- Evaluación sin anotación humana: las métricas reflejan acuerdo con referencias sintéticas, no calidad real.
- La salida sigmoid no representa probabilidad calibrada ni calidad del texto.
- No extrae spans ni demuestra causalidad entre acción y efecto.
- Contexto limitado a 192 tokens en entrenamiento; en textos más largos se trunca y los componentes negativos en el prefijo truncado se marcan como `unknown`.
- El autor advierte explícitamente que no debe usarse para ranking de personas, contratación automática ni para atribuir calidad universal a textos profesionales.
- Licencia MIT, lo que permite uso comercial, pero el propio modelo no está validado para producción.
- El proyecto es autoral e independiente, motivado por una candidatura, y no está patrocinado ni supervisado por ninguna empresa.
- Se advirtió atención backward no determinística en PyTorch; no se garantiza reproducibilidad bit a bit entre reentrenamientos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/enzoferracini/patchinsight-bertimbau-ptbr
- Dataset sintético: https://huggingface.co/datasets/enzoferracini/patchinsight-synthetic-ptbr
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Repositorio de BERTimbau (referencia): https://github.com/ClaudioSS01/portuguese-Bertimbau
- Paper de BERTimbau: Souza, Nogueira y Lotufo (2020), *BERTimbau: Pretrained BERT Models for Brazilian Portuguese*, BRACIS.
