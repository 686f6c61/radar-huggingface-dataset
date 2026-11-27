# nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-seed46-ell-ell-sequential

## Resumen

El modelo `nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-seed46-ell-ell-sequential` es un modelo de lenguaje causal de pequeno tamano (aproximadamente 104,7 millones de parametros) desarrollado por el usuario `nikitastheo` y publicado en Hugging Face. Se trata de un experimento de investigacion centrado en el entrenamiento de modelos de lenguaje con vocabulario restringido y datos limitados, en la linea de los trabajos tipo BabyLM, orientados a estudiar como aprenden los modelos con cantidades de datos comparables a las que recibe un nino.

El nombre del modelo revela su naturaleza experimental: hace referencia a un vocabulario de 25 000 tokens, a un corpus en minusculas ("lower"), a una ablacion de categorias gramaticales (numeros, pronombres y verbos) y a una tecnica de regularizacion tipo EWC (Elastic Weight Consolidation) con una semilla concreta (seed46). El sufijo "ell-ell-sequential" sugiere un entrenamiento secuencial en dos fases sobre el idioma griego moderno (codigo ISO "el").

El modelo se publica con fines de investigacion y reproducibilidad, sin model card detallada mas alla de los hiperparametros de entrenamiento. No hay informacion sobre licencia, idiomas oficialmente soportados ni resultados de evaluacion, por lo que su uso en produccion no esta respaldado por garantias documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (GPT-2, segun tags y libreria) |
| Parametros totales | 104.716.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el entrenamiento parece orientado al griego moderno por los sufijos "ell-ell") |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer de tipo decoder-only (causal LM) compatible con la clase `GPT2LMHeadModel` de la libreria `transformers`. Segun la model card, la configuracion base se toma de `configurations/gpt_base_config.json`, lo que sugiere una variante de GPT-2 de tamano pequeno (coherente con los ~105 M de parametros, similar a GPT-2 small, que tiene 124 M). El tokenizador es especifico del proyecto: `nikitastheo/babylm-25k-ell-lower-seed46-ablated-num-pron-verb-tokenizer`, con un vocabulario de 25 000 tokens y entrenado sobre texto en minusculas.

El entrenamiento se realizo con `train_clm.py`, un script propio basado en Hugging Face Accelerate (sin `Trainer`). Los hiperparametros documentados son: 17 270 pasos maximos, learning rate de 1e-4, scheduler lineal, 1 727 pasos de warmup, batch size de 32 por dispositivo sin acumulacion de gradientes (batch total de 32) y un "language switch epoch" en la epoca 10, lo que indica un regimen de entrenamiento por fases (probablemente cambio de idioma o de distribucion de datos en ese punto). El nombre incluye "ewc5", lo que apunta al uso de Elastic Weight Consolidation con un coeficiente de 5 para mitigar el olvido catastrofico durante el cambio de fase. No se especifica el numero total de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto causal: el modelo esta disenado para completar y generar texto token a token, con pipeline `text-generation`.
- Entrenamiento con vocabulario restringido: el tokenizador de 25 000 tokens y en minusculas limita el rango de vocabulario, lo que condiciona la calidad y el estilo de la generacion.
- Posible soporte del griego moderno: los sufijos "ell-ell" en el nombre sugieren un entrenamiento o evaluacion en este idioma, aunque no se documenta oficialmente.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- No se documentan capacidades multilingues ni evaluaciones de las mismas.

## Casos de uso

- Investigacion en adquisicion del lenguaje: el modelo sirve como banco de pruebas para estudiar como un modelo pequeno aprende con un vocabulario limitado y datos reducidos, en la linea de los experimentos BabyLM.
- Estudio de olvido catastrofico: gracias al uso de EWC y al cambio de fase en la epoca 10, el modelo permite analizar la retencion de conocimiento tras cambiar la distribucion de entrenamiento.
- Ablaciones gramaticales: el nombre indica ablacion de numeros, pronombres y verbos, lo que lo hace util para estudiar el impacto de eliminar categorias gramaticales del corpus de entrenamiento.
- Reproducibilidad de pipelines de entrenamiento: el script `train_clm.py` y los hiperparametros documentados permiten reproducir el entrenamiento con Accelerate en entornos de una sola GPU.
- Generacion de texto controlada en griego moderno (si el entrenamiento efectivamente se realizo en ese idioma): util para experimentos de completado de texto en minusculas con vocabulario acotado.
- Experimentos de tokenizacion: comparar el tokenizador de 25 000 tokens frente a otros vocabularios en tareas de generacion y perplejidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,42 GB solo para pesos (104,7 M de parametros), mas overhead de activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 0,21 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para inferencia por lotes pequenos.
- Despliegue posible con `transformers`, `text-generation-inference` (segun tags), y potencialmente con llama.cpp u Ollama si se convierte a GGUF (no se proporcionan pesos GGUF en el repo).
- No se dispone de datos de latencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-seed46-ell-ell-sequential | 104,7 M | no disponible | no disponible | Hugging Face |
| GPT-2 small | 124 M | 1024 tokens | MIT (pesos originales de OpenAI) | Amplia |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Amplia |

La comparacion con GPT-2 small y DistilGPT-2 es puramente estructural (tamano y arquitectura); no hay datos de rendimiento del modelo de nikitastheo que permitan una comparacion cuantitativa. Los modelos BabyLM de referencia (por ejemplo, los publicados en la competicion BabyLM) serian los comparables mas directos en cuanto a filosofia de entrenamiento, pero no se dispone de sus cifras en la informacion proporcionada.

## Limitaciones y advertencias

- No hay licencia declarada: el uso comercial no esta autorizado de forma explicita y requiere contactar con el autor.
- Modelo de investigacion sin evaluacion publicada: no se conocen metricas de calidad, perplejidad ni tasas de alucinacion.
- Vocabulario restringido y texto en minusculas: la generacion puede ser limitada en vocabulario, formato y calidad frente a modelos de mayor tamano.
- Posible olvido catastrofico residual pese al uso de EWC, especialmente tras el cambio de fase en la epoca 10.
- No se documentan sesgos, pero al ser un modelo entrenado con datos limitados y posiblemente de una sola fuente, es probable que herede sesgos del corpus.
- El nombre del modelo sugiere ablaciones gramaticales que pueden degradar la coherencia sintactica.
- No apto para produccion sin una evaluacion previa exhaustiva por parte del usuario.

## Enlaces

- Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-seed46-ell-ell-sequential
- Tokenizador: https://huggingface.co/nikitastheo/babylm-25k-ell-lower-seed46-ablated-num-pron-verb-tokenizer
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
