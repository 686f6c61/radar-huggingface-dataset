# Rajeshwari-Chanda/bloom-560m_sparsegpt_0.2

## Resumen

El modelo `Rajeshwari-Chanda/bloom-560m_sparsegpt_0.2` es una versión podada del modelo base BLOOM-560m, publicada por la usuaria Rajeshwari-Chanda en Hugging Face. Se trata de un transformer decoder-only de 559.214.592 parámetros (unos 559 millones) que ha sido procesado con la técnica de poda one-shot SparseGPT, según indica el propio identificador del repositorio. El sufijo `0.2` sugiere un nivel de esparsidad del 20% aplicado durante la poda, aunque la model card no lo confirma de forma explícita.

El interés de este tipo de artefactos radica en su carácter experimental: la autora mantiene una colección de modelos podados (por ejemplo `bloom-560m_wanda_0.9` o `OPT-2.7B_SparseGPT_60`) con el objetivo de estudiar cómo técnicas de pruning como SparseGPT o Wanda afectan a modelos de distinto tamano. SparseGPT, descrito en el paper arXiv:2301.00774, permite podar modelos GPT a al menos un 50% de esparsidad en una sola pasada y sin reentrenamiento, con una pérdida minima de precisión.

La relevancia de esta ficha es limitada en terminos de producción: el repositorio tiene 0 descargas y 0 likes, no declara licencia, no especifica idiomas y su model card es la plantilla automática de Hugging Face sin rellenar. Se debe considerar, por tanto, un checkpoint de investigación más que un modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia BLOOM), con poda SparseGPT aplicada |
| Parametros totales | 559.214.592 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha (el modelo base BLOOM-560m usa 2.048 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | no disponible (el modelo base BLOOM-560m fue entrenado en 46 idiomas naturales y 13 lenguajes de programacion) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a BLOOM-560m, un transformer decoder-only con 24 capas, dimension oculta de 1.024, 16 cabezas de atencion y un vocabulario de 250.880 tokens. BLOOM emplea codificacion posicional ALiBi en lugar de embeddings posicionales aprendidos, lo que facilita la extrapolacion a secuencias largas. El modelo base fue entrenado por BigScience sobre el corpus ROOTS (aproximadamente 1,6 TB de texto) con aproximadamente 341.000 millones de tokens vistos.

Sobre ese checkpoint base, la autora ha aplicado SparseGPT, un metodo de poda unstructured one-shot que estima la importancia de cada peso mediante una aproximacion de la Hessiana y elimina conexiones sin necesidad de reentrenamiento posterior. Segun el paper original (arXiv:2301.00774), SparseGPT puede alcanzar un 60% de esparsidad en modelos de la familia OPT y BLOOM con un incremento despreciable de perplejidad. No se especifica en la informacion disponible el número exacto de pesos eliminados, la composicion del dataset de calibracion, ni si hubo una fase de fine-tuning posterior a la poda.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base BLOOM-560m.
- Capacidad multilingue limitada al conocimiento residual del checkpoint original (46 idiomas en el base), aunque no verificada tras la poda.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de pensamiento (thinking mode).
- No se documentan capacidades especificas de codigo o matematicas mas alla de las del modelo base.

## Casos de uso

- Experimentacion academica con tecnicas de poda: el modelo sirve como punto de comparacion frente al BLOOM-560m original y frente a la variante `bloom-560m_wanda_0.9`, permitiendo medir el impacto de SparseGPT al 20% de esparsidad en perplejidad y tareas downstream.
- Prototipado rapido en entornos sin GPU: con 559 millones de parametros, el modelo cabe en CPU o en cualquier GPU de consumo, lo que permite iterar sobre pipelines de generacion de texto sin infraestructura dedicada.
- Evaluacion de degradacion por pruning: util para reproducir los resultados del paper SparseGPT en un rango de esparsidad bajo (0,2) y comparar con niveles mas agresivos.
- Generacion de texto en castellano a pequena escala: si el checkpoint conserva capacidades multilingues del base, podria emplearse para tareas sencillas de continuacion de texto o resumen, aunque sin garantia de calidad.
- Fine-tuning ligero para dominios concretos: al ser un modelo pequeno, es viable ajustarlo con LoRA en una unica GPU para tareas especificas (clasificacion, extraccion, respuesta a preguntas sencillas).
- Docencia y divulgacion: adecuado para explicar en un aula como funciona la poda de pesos y como se refleja en el tamano del checkpoint (1,1 GB en safetensors).
- Investigacion sobre cuantizacion combinada: sirve como base para experimentos que combinen poda y cuantizacion posterior a 8 o 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 1,1 GB de pesos, más overhead de activaciones y cache KV; en la practica cabe en menos de 2 GB.
- VRAM estimada en fp32: alrededor de 2,2 GB de pesos.
- VRAM estimada en int8: unos 560 MB.
- VRAM estimada en 4 bits: unos 280 MB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, A100, H100). Es perfectamente ejecutable en CPU con `transformers`.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos ocho anos.
- Opciones de despliegue: `transformers` (soporte nativo), text-generation-inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`). No se confirma la disponibilidad de pesos GGUF para llama.cpp u Ollama, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tecnica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bloom-560m_sparsegpt_0.2 | 559 M | no disponible | Poda SparseGPT (~20%) | no disponible | Safetensors en HF |
| bloom-560m (base) | 559 M | 2.048 tokens | Entrenamiento completo | BigScience BLOOM RAIL 1.0 | Safetensors en HF |
| bloom-560m_wanda_0.9 | 559 M | no disponible | Poda Wanda (~90%) | no disponible | Safetensors en HF |
| OPT-2.7B_SparseGPT_60 | 2.700 M | no disponible | Poda SparseGPT (~60%) | no disponible | Safetensors en HF |

Los tres primeros comparten arquitectura base BLOOM-560m, por lo que la diferencia principal estriba en la tecnica y el nivel de poda aplicados. No hay datos de rendimiento publicados para ninguno de los checkpoints podados de esta autora.

## Limitaciones y advertencias

- La model card es la plantilla automatica de Hugging Face y no aporta ninguna informacion sobre entrenamiento, datos, evaluacion ni uso previsto.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido. El modelo base BLOOM se distribuye bajo BigScience BLOOM RAIL 1.0, con clausulas de uso responsable, pero la licencia de este derivado no esta confirmada.
- No hay informacion sobre sesgos especificos introducidos por la poda. El modelo base BLOOM-560m hereda sesgos de su corpus de entrenamiento (ROOTS, mayoritariamente en ingles).
- Riesgo de alucinacion: no evaluado. La poda al 20% deberia degradar poco el modelo base, pero no hay mediciones de perplejidad ni de tareas generativas que lo confirmen.
- No se documentan idiomas soportados tras la poda; el base cubre 46 idiomas naturales, pero la poda puede afectar de forma desigual a idiomas con menos representacion.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion independiente.
- No se ofrecen pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio, lo que limita su uso directo con llama.cpp u Ollama sin conversion manual.
- Al ser un modelo de 559 M de parametros, su calidad de generacion es propia de un modelo pequeno, muy por debajo de modelos actuales de 7 B o mas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rajeshwari-Chanda/bloom-560m_sparsegpt_0.2
- Variante Wanda de la misma autora: https://huggingface.co/Rajeshwari-Chanda/bloom-560m_wanda_0.9
- Perfil de la autora en Hugging Face: https://huggingface.co/Rajeshwari-Chanda/models
- Paper SparseGPT (Frantar y Alistarh, 2023): https://arxiv.org/abs/2301.00774
- PDF del paper SparseGPT: https://arxiv.org/pdf/2301.00774v2
- Paper sobre calculo de emisiones citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Modelo base BLOOM-560m: https://huggingface.co/bigscience/bloom-560m
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
