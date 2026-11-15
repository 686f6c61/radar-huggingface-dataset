# Kujohi/gemma4-12b-4bit-AWQ

## Resumen

Kujohi/gemma4-12b-4bit-AWQ es un ajuste fino (fine-tuning) del modelo base unsloth/gemma-4-12B-it, publicado por el usuario Kujohi bajo licencia Apache 2.0. Se trata de un modelo de generacion de texto de aproximadamente 11.960 millones de parametros (11,96 B), empaquetado en formato AWQ de 4 bits, lo que reduce el peso del repositorio a 24 GB frente a los aproximadamente 24 GB que ocuparian los pesos en bf16. El modelo conserva la arquitectura y el tokenizador del Gemma 4 de 12 B de Google, sobre el que Unsloth habia publicado una version instruction-tuned.

La relevancia de esta publicacion es limitada por su escasa traccion: cero descargas y cero likes en el momento de la consulta, y una model card minima que no documenta el dataset de ajuste fino, el numero de pasos, la tasa de aprendizaje ni los hiperparametros empleados. El autor indica unicamente que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, y que fue "2x mas rapido" gracias a Unsloth, sin aportar metricas de evaluacion.

Para un desarrollador o investigador, este modelo debe considerarse un artefacto experimental no validado: la cuantizacion AWQ de 4 bits esta pensada para servir el modelo con vLLM o Text Generation Inference, pero la ausencia de benchmarks, de documentacion del dataset y de cualquier evaluacion de calidad impide recomendarlo para produccion sin una validacion propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, tag `gemma4_unified`) |
| Parametros totales | 11.959.730.224 (11,96 B) |
| Parametros activos | no disponible (no es un modelo MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ 4 bits (unica variante publicada) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 24,0 GB), compatible con transformers y text-generation-inference |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Gemma 4 de 12 B instruction-tuned publicado por Unsloth (`unsloth/gemma-4-12B-it`), es decir, un transformer decoder-only de la familia Gemma 4. Los pesos se han cuantizado a 4 bits mediante AWQ (Activation-aware Weight Quantization), una tecnica de cuantizacion post-entrenamiento que protege los canales de activacion mas relevantes para preservar la calidad frente a una cuantizacion uniforme. El tag `gemma4_unified` sugiere compatibilidad con la implementacion unificada de Gemma 4 en transformers.

El ajuste fino se realizo con Unsloth y TRL, segun la model card, pero no se especifica el dataset, el numero de tokens de entrenamiento, si se aplico RLHF, DPO o SFT supervisado, ni si hubo una fase de alineacion adicional. Tampoco se documentan innovaciones tecnicas propias del ajuste. La unica afirmacion tecnica del autor es que el entrenamiento fue "2x mas rapido" con Unsloth, lo que hace referencia a la eficiencia del framework de entrenamiento, no a una mejora del modelo.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base instruction-tuned.
- Razonamiento y respuesta a instrucciones conversacionales, segun el comportamiento esperado de `gemma-4-12B-it` (no verificado en este ajuste).
- Generacion de codigo y matematicas: capacidad esperable del modelo base, no documentada ni evaluada en esta variante.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de inferencia en ingles con vLLM o TGI: el formato AWQ de 4 bits permite servir el modelo en GPUs con menos VRAM que la version bf16, reduciendo coste por token en entornos de prueba.
- Prototipado de asistentes conversacionales en ingles: util para validar flujos de chat antes de comprometerse con un modelo mayor o con una licencia mas restrictiva.
- Experimentacion academica con cuantizacion AWQ: sirve como caso de estudio para comparar la degradacion de calidad de un ajuste fino cuantizado frente al modelo base.
- Generacion de texto de relleno o borradores en pipelines internos: adecuado solo en entornos donde la calidad no sea critica y se pueda validar la salida.
- Evaluacion comparativa de ajustes finos de la comunidad: util como punto de referencia en estudios sobre la calidad de fine-tunes no documentados.
- Base para un reajuste posterior: al estar en Apache 2.0 y safetensors, puede servir como punto de partida para experimentos propios, siempre que se valide su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el autor no documenta evaluaciones del ajuste fino ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-10 GB en AWQ 4 bits para los pesos, mas overhead de KV cache y activaciones; el repo pesa 24 GB porque incluye pesos en mayor precision o metadatos de cuantizacion, no porque la inferencia requiera esa memoria.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue con vLLM/TGI; RTX 4090 24 GB y RTX 3090 24 GB son suficientes para inferencia en 4 bits con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y GPUs con 12 GB o mas en 4 bits, dependiendo de la longitud de contexto.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), transformers con `AutoModelForCausalLM`; llama.cpp y Ollama requeririan conversion a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Kujohi/gemma4-12b-4bit-AWQ | 11,96 B | no disponible | Apache 2.0 | safetensors AWQ 4 bits | Hugging Face, 0 descargas |
| unsloth/gemma-4-12B-it (base) | 12 B (aprox.) | no disponible | no disponible en esta ficha | safetensors | Hugging Face |
| Gemma 4 12B (original de Google) | 12 B (aprox.) | no disponible en esta ficha | no disponible en esta ficha | safetensors | Hugging Face / Kaggle |

La comparativa se limita a la relacion con el modelo base, ya que no se dispone de datos de rendimiento ni de contexto de ninguno de los tres. La diferencia principal de esta variante es la cuantizacion AWQ de 4 bits y el ajuste fino no documentado por parte de Kujohi.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documenta el dataset de ajuste fino, los hiperparametros, el numero de pasos ni la evaluacion, lo que impide auditar el modelo.
- Cero descargas y cero likes: no hay evidencia de uso ni de validacion por parte de la comunidad.
- Calidad no verificada: al ser un ajuste fino no documentado, puede haber degradado capacidades del modelo base (razonamiento, codigo, seguir instrucciones) sin que el autor lo haya detectado.
- Sesgos conocidos: no documentados; se heredan los del modelo base, que tampoco se detallan en esta ficha.
- Riesgo de alucinacion: no evaluado; el modelo base de 12 B presenta alucinaciones en tareas de conocimiento factual, y el ajuste fino puede aumentarlas o reducirlas sin evidencia.
- Limitacion idiomatica: la model card declara solo ingles; el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (`unsloth/gemma-4-12B-it`) y de Gemma 4 de Google, que pueden imponer terminos adicionales no reflejados en esta ficha.
- Formato unico AWQ: no hay GGUF ni pesos en bf16 en el repo, lo que limita el despliegue en llama.cpp/Ollama sin conversion propia.
- Repo de 24 GB: el tamano del repositorio puede deberse a pesos sin cuantizar o a artefactos de entrenamiento, lo que conviene inspeccionar antes de descargarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Kujohi/gemma4-12b-4bit-AWQ
- Modelo base: https://huggingface.co/unsloth/gemma-4-12B-it
- Unsloth (repositorio): https://github.com/unslothai/unsloth
