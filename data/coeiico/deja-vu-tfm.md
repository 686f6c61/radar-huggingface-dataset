# coeiico/deja-vu-tfm

## Resumen

deja-vu-tfm es un conjunto de pesos de investigación sobre formación de *induction heads* (cabezas de inducción) en transformers de 2 capas con atención exclusivamente, desarrollado por el usuario coeiico como trabajo de fin de máster. No es un modelo de propósito general ni un asistente conversacional: es un artefacto de interpretabilidad que reproduce el fenómeno descrito en el trabajo de Olsson et al. (2022) sobre *grokking* de mecanismos de copia en la atención. El repositorio contiene seis ejecuciones de entrenamiento independientes con distintos ajustes (semilla, profundidad, inicialización y corpus), cada una con sus pesos, configuración, registro completo de métricas y análisis final.

Los modelos son instancias de [tiny-transformer](https://github.com/coeiico/tiny-transformer), una implementación minimalista de transformer de solo atención. El objetivo es observar empíricamente cómo emerge un *induction head* como cambio de fase durante el entrenamiento y qué cabezas precedentes (previous-token heads o duplicate-token heads) lo alimentan mediante composición K o Q. Las ejecuciones principales alcanzan una precisión de copia en test de entre el 90,5% y el 92,2%, mientras que las líneas base (una sola capa, inicialización tipo GPT-2) se quedan en el 11,8% y el 16,6%.

Su relevancia es académica y didáctica: proporciona pesos reproducibles y registros completos para estudiar circuitos de atención, no para desplegar aplicaciones. El tamaño del repositorio es de 0,0 GB, lo que indica pesos de muy pocos parámetros, coherentes con un transformer de 2 capas y vocabulario sintético.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de solo atención (attention-only), 1-2 capas |
| Parámetros totales | no disponible (repositorio de 0,0 GB; presumiblemente muy reducido) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors de precisión de entrenamiento) |
| Idiomas soportados | no disponible (entrenado con datos sintéticos de repeticiones y TinyStories) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), más `model_config.json` con arquitectura y vocabulario |

## Arquitectura y entrenamiento

La arquitectura es un transformer de solo atención (sin capas MLP) de 1 o 2 capas, implementado en la librería tiny-transformer. Los experimentos principales usan 2 capas entrenadas sobre secuencias sintéticas de repeticiones, un régimen diseñado para inducir el mecanismo de copia por inducción. Las ejecuciones `default-seed0`, `default-seed1` y `default-seed2` difieren en semilla y en el tipo de cabeza que alimenta al induction head: en la semilla 0 el induction head recibe información de una previous-token head mediante composición K, mientras que en las semillas 1 y 2 lo hace desde duplicate-token heads mediante composición Q.

Se incluyen dos líneas base de control: `one-layer-seed0`, con una sola capa (estructuralmente incapaz de formar un induction head de dos saltos), y `gpt2-init-seed0`, con dos capas pero inicialización al estilo GPT-2 (desviación típica 0,02), que no desarrolla induction heads. Además, `stories-seed0` entrena 2 capas sobre TinyStories con 330M tokens y solo muestra una previous-token head, sin induction head al final del entrenamiento.

Cada carpeta de ejecución incluye el registro completo `metrics.json` con configuración, semillas, definición de datos, estado del código, entorno e historial de entrenamiento, además de un gráfico de diagnóstico y el análisis final en `analysis/final/`. Los entrenamientos se realizaron en CUDA sobre una RTX 3060. Los pesos son de evaluación, no checkpoints reanudables, y las semillas fijan la ejecución a un tipo de dispositivo concreto.

## Capacidades

- Copia de secuencias por inducción: las ejecuciones de 2 capas alcanzan entre el 90,5% y el 92,2% de precisión de copia en test sobre repeticiones sintéticas.
- Formación de circuitos de atención: los pesos permiten inspeccionar cabezas de previous-token y duplicate-token y su composición (K o Q) con el induction head.
- Reproducibilidad experimental: cada ejecución incluye semillas, entorno y estado del código en `metrics.json`.
- Diagnóstico de cambio de fase: el historial de entrenamiento y los gráficos permiten analizar la transición abrupta en la curva de pérdida asociada a la aparición del induction head.
- No dispone de generación de texto de propósito general, tool calling, agentes, capacidades multilingües, visión ni audio.

## Casos de uso

- Investigación en interpretabilidad mecanicista: cargar `default-seed0` y analizar las matrices de atención para identificar qué cabeza implementa la copia y cómo se compone con la previous-token head. Es adecuado porque el repositorio incluye el análisis final ya elaborado y los pesos exactos de la ejecución.
- Docencia sobre circuitos de transformers: usar las líneas base `one-layer-seed0` y `gpt2-init-seed0` para mostrar que sin profundidad suficiente o con una inicialización inadecuada el induction head no emerge, contrastando con las ejecuciones que sí lo forman.
- Reproducción de resultados: repetir los entrenamientos a partir de `metrics.json`, que documenta configuración, semillas y entorno, para verificar la formación del cambio de fase en una RTX 3060.
- Estudio de composición K frente a Q: comparar `default-seed0` con `default-seed1` y `default-seed2` para analizar cómo el tipo de cabeza precedente condiciona el mecanismo de copia resultante.
- Análisis de generalización fuera de distribución: emplear `stories-seed0` para estudiar por qué un corpus natural (TinyStories, 330M tokens) no produce induction head con la misma configuración, con una precisión de sonda del 1,7%.
- Desarrollo de metodología de diagnóstico: reutilizar los gráficos y el historial de `metrics.json` como plantilla para detectar cambios de fase en otros entrenamientos pequeños de transformers.

## Benchmarks y rendimiento

Los únicos datos publicados son las precisiones de copia en test de cada ejecución:

| Ejecución | Configuración | Precisión de copia (test) |
|---|---|---|
| `default-seed0` | 2 capas, repeticiones sintéticas, composición K desde previous-token head | 92,2% |
| `default-seed1` | 2 capas, repeticiones sintéticas, composición Q desde duplicate-token heads | 91,8% |
| `default-seed2` | 2 capas, repeticiones sintéticas, composición Q desde duplicate-token head | 90,5% |
| `one-layer-seed0` | 1 capa (línea base) | 11,8% |
| `gpt2-init-seed0` | 2 capas, inicialización GPT-2 (std 0,02) | 16,6% |
| `stories-seed0` | 2 capas, TinyStories, 330M tokens | 1,7% (sonda) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,0 GB) y la arquitectura de 2 capas, el consumo es marginal.
- GPU recomendadas: cualquier GPU con CUDA; los entrenamientos se realizaron en una RTX 3060.
- Cabe en GPU de consumo: sí, con toda probabilidad en cualquier GPU consumer moderna; el cuello de botella no es la memoria sino la dependencia de la librería tiny-transformer.
- Opciones de despliegue: carga mediante `huggingface_hub.snapshot_download` y `tiny_transformer.hub.load_model`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deja-vu-tfm | no disponible (muy reducido) | no disponible | Interpretabilidad de induction heads en 2 capas | MIT | Hugging Face y GitHub |
| GPT-2 small (referencia de inicialización) | 124M | 1024 | LM de propósito general | MIT | Hugging Face |
| tiny-transformer (librería base) | según configuración | no disponible | Implementación minimalista de solo atención | no disponible | GitHub |

No se dispone de comparativas de rendimiento con otros modelos de interpretabilidad en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: no genera texto útil, no responde preguntas y no soporta instrucciones.
- Entrenado sobre datos sintéticos de repeticiones y TinyStories; no hay evidencia de capacidades multilingües ni de conocimiento factual.
- Los pesos son de evaluación, no checkpoints reanudables; no se puede continuar el entrenamiento desde ellos.
- Las semillas fijan la ejecución a un tipo de dispositivo concreto (CUDA); la reproducibilidad en otro hardware no está garantizada.
- Dependencia de la librería tiny-transformer y de su API `load_model`; sin ella los pesos no son directamente utilizables en frameworks estándar.
- Riesgo de alucinación no aplicable en el sentido habitual, pero cualquier uso generativo producirá salidas sin sentido.
- Licencia MIT: permite uso comercial y modificación, pero el modelo carece de valor práctico fuera de la investigación.
- No apto para producción bajo ninguna circunstancia; su utilidad es exclusivamente académica y didáctica.

## Enlaces

- [Hugging Face: coeiico/deja-vu-tfm](https://huggingface.co/coeiico/deja-vu-tfm)
- [GitHub: coeiico/deja-vu-tfm](https://github.com/coeiico/deja-vu-tfm)
- [GitHub: coeiico/tiny-transformer](https://github.com/coeiico/tiny-transformer)
