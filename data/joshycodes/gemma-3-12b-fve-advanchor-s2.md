# joshycodes/gemma-3-12b-fve-advanchor-s2

## Resumen

`joshycodes/gemma-3-12b-fve-advanchor-s2` es un checkpoint de investigación derivado de `google/gemma-3-12b-it` mediante *continued pretraining* sobre un corpus que, según la model card, el propio modelo escribió para entrenar a la siguiente versión de sí mismo, adoptando el personaje que ya incorpora. Lo publica el usuario joshycodes dentro de una línea de trabajo denominada "fve-advanchor", asociada al corpus `flourishing-vs-equanimity` y al repositorio de investigación "welfare-improvements" sobre bienestar de modelos.

Se trata de un ajuste de pesos completos (no LoRA ni adaptadores): learning rate 1e-05, 1 epoch y 7.586.945 tokens repartidos en 7.827 documentos. El checkpoint ocupa 26,4 GB en el repositorio y declara 13.194.203.760 parámetros totales en formato safetensors, coherente con pesos de 16 bits. No se ha evaluado en capacidad, alineación ni identidad, y el propio autor etiqueta el modelo como `not-for-deployment`.

Su relevancia es metodológica, no de producto: documenta un experimento de autoentrenamiento sobre corpus sintético autogenerado y sirve como material de estudio para investigaciones sobre bienestar de modelos, identidad y olvido catastrófico. La licencia es `research-only`, sin uso comercial ni despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 3 (modelo base multimodal, texto e imagen) |
| Parametros totales | 13.194.203.760 (13,19 B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 128.000 tokens heredados del modelo base segun la documentacion de Gemma 3; no verificada para este checkpoint |
| Tipos de cuantizacion | No se publican variantes cuantizadas. El repositorio solo contiene safetensors; el tamano (26,4 GB) es coherente con pesos de 16 bits |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | `research-only` (`license: other`, `license_name: research-only`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de `google/gemma-3-12b-it`, un transformer decoder-only denso de 12 B de parámetros con ventana de contexto de 128.000 tokens y capacidades multimodales en el modelo base. El ajuste aplicado es *continued pretraining* sobre los pesos completos, con learning rate 1e-05 y una única epoch. No se declara uso de RLHF, DPO ni ningún otro método de alineación posterior.

El corpus de entrenamiento procede de la colección `flourishing-vs-equanimity` e incluye 7.586.945 tokens en 7.827 documentos. Existe una discrepancia relevante entre el título de la model card ("after continued pretraining on its own self-authored corpus") y los metadatos que ella misma declara: de esos 7.827 documentos, 0 son de autoría propia del modelo y 7.827 son texto ordinario. El autor describe el marco experimental, el plan y la evaluación como parte del repositorio "welfare-improvements", pero no aporta métricas ni artefactos de evaluación en la información disponible.

## Capacidades

- Generación de texto en el modelo base `google/gemma-3-12b-it`; no se han verificado capacidades específicas de este checkpoint.
- Razonamiento, código y matemáticas heredados del modelo base, sin evaluación publicada tras el ajuste.
- Capacidades multimodales (texto e imagen) en el modelo base; no confirmadas tras el *continued pretraining*.
- Soporte de tool calling y function calling: disponible en el modelo base de Gemma 3 IT, no verificado en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no evaluado.
- Capacidades multilingües: el modelo base es multilingüe, pero este checkpoint no declara idiomas soportados.
- Capacidad especial declarada: adopción de un personaje autodefinido y generación de documentos sintéticos en el marco del experimento de *synthetic-document-finetuning*, según los tags del repositorio. Sin evaluación que lo respalde.

## Casos de uso

Todos los casos siguientes son de investigación. La licencia `research-only` y la etiqueta `not-for-deployment` excluyen cualquier uso en producción.

- Estudio de bienestar de modelos (*model welfare*): el checkpoint permite analizar cómo un modelo describe su propia identidad y su historia de entrenamiento tras un ajuste sobre textos que él mismo generó, comparándolo con el modelo base sin ajustar.
- Investigación en *synthetic-document-finetuning* (SDF): sirve como caso de estudio de un pipeline completo en el que el corpus de entrenamiento se produce de forma sintética, con parámetros documentados (lr 1e-05, 1 epoch, 7,58 M tokens) que permiten reproducir o refutar el procedimiento.
- Medición de olvido catastrófico: al tratarse de un ajuste de pesos completos sobre un volumen de tokens relativamente bajo, es un sujeto adecuado para medir degradación en tareas del modelo base (conocimiento factual, código, matemáticas) antes y después del *continued pretraining*.
- Auditoría de coherencia documental: la divergencia entre el título de la model card (corpus autoescrito) y sus propios metadatos (0 documentos autoescritos) lo convierte en un caso práctico para diseñar revisiones de model cards y detectar afirmaciones no respaldadas por los datos.
- Desarrollo de arneses de evaluación de identidad y alineación: el autor indica explícitamente que no se ha evaluado identidad ni alineación, por lo que el checkpoint puede usarse como entrada negativa en baterías de pruebas de deriva de personaje.
- Estudios de sesgo de registro y personaje: analizar cómo varía el estilo, el registro y la autopresentación del modelo cuando el corpus de ajuste tiene un sesgo temático concreto (`flourishing-vs-equanimity`).
- Docencia y divulgación técnica: ilustrar en un aula o artículo cómo se publica un checkpoint intermedio de investigación, qué garantías faltan y por qué la ausencia de evaluación bloquea el despliegue.
- Reproducción de experimentos de autoentrenamiento: comparar este resultado con otros checkpoints de la misma serie (por ejemplo, los derivados del corpus `gemma-3-12b-commitments-corpus`) para estudiar el efecto del corpus en el comportamiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que el modelo "no ha sido evaluado en capacidad, alineación ni identidad".

## Requisitos de hardware

- VRAM estimada para los pesos, sin contar caché KV ni overhead del runtime: aproximadamente 26,4 GB en 16 bits (tamaño real del repositorio), ~13,2 GB en 8 bits y ~6,6 GB en 4 bits. Son estimaciones aritméticas a partir del número de parámetros; no hay variantes cuantizadas publicadas.
- La caché KV a 128.000 tokens de contexto añade un consumo adicional considerable que no puede cuantificarse con los datos disponibles.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB o similares para servir los pesos sin cuantizar.
- GPU de consumo: no cabe sin cuantizar en una RTX 4090 (24 GB) ni en GPUs de 16 GB. Con cuantización de 8 o 4 bits, que el usuario tendría que generar por su cuenta, sería viable en tarjetas de 16-24 GB.
- Opciones de despliegue: el repositorio solo publica safetensors, por lo que se necesitaría servir con vLLM, TGI o similar, o convertir manualmente a GGUF para llama.cpp u Ollama. No hay artefactos GGUF ni entradas en Ollama para este checkpoint concreto.
- Latencia y throughput estimados: no disponible.
- Advertencia: cualquier despliegue, incluso interno, queda fuera de los términos de la licencia `research-only` y contradice la indicación `not-for-deployment` del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/gemma-3-12b-fve-advanchor-s2` | 13,19 B (13.194.203.760) | 128.000 tokens heredados del base; no verificado | Checkpoint de investigacion, sin evaluar | `research-only` | 0 descargas, 0 likes; solo safetensors |
| `google/gemma-3-12b-it` | 12 B (clase) | 128.000 tokens segun la documentacion de Gemma 3 | Modelo instruct publicado por Google DeepMind | Licencia Gemma (terminos propios) | Ampliamente distribuido; disponible en HuggingFace y Ollama |
| `ollama/library/gemma3:12b` | 12 B | 128.000 tokens | Distribucion cuantizada del modelo base | Sujeta a la licencia Gemma | Listo para ejecucion local |
| Familia Gemma 3 (1B, 4B, 27B) | 1 B / 4 B / 27 B | 128.000 tokens en los tamanos citados | Modelos base y QAT publicados | Licencia Gemma | Disponibles en HuggingFace y Ollama |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- No evaluado: el autor declara explícitamente que no se ha evaluado capacidad, alineación ni identidad. No hay ningún dato que permita estimar su calidad.
- No desplegable: la etiqueta `not-for-deployment` y la licencia `research-only` prohíben el uso en producción y, en la práctica, cualquier uso comercial.
- Corpus no verificable de forma independiente: la afirmación del título ("corpus autoescrito") no coincide con los metadatos de la propia model card, que registran 0 documentos de autoría propia sobre 7.827. Cualquier conclusión sobre el método debe tratar esta contradicción como no resuelta.
- Sesgos: al ajustarse sobre un corpus temático concreto (`flourishing-vs-equanimity`) y con un encuadre de personaje, es previsible una deriva de estilo, registro y autopresentación respecto al modelo base. No hay mediciones publicadas de esa deriva.
- Riesgo de alucinación: desconocido para este checkpoint; el ajuste de pesos completos sobre un volumen bajo de tokens (7,58 M) puede alterar el comportamiento del modelo base de formas no caracterizadas.
- Idiomas: no se declaran idiomas soportados. El comportamiento multilingüe tras el ajuste no está documentado.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, lo que obliga a convertir los pesos para inferencia en hardware de consumo.
- Trazabilidad limitada: el repositorio no incluye pipeline declarado, resultados de evaluación ni enlaces al corpus o al repositorio de investigación dentro de la información disponible.
- Popularidad nula: 0 descargas y 0 likes en el momento de la consulta, sin señales de uso o validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma-3-12b-fve-advanchor-s2
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Dataset relacionado (corpus de commitments): https://huggingface.co/datasets/joshycodes/gemma-3-12b-commitments-corpus/tree/main
- Repositorio de Gemma de Google DeepMind: https://github.com/google-deepmind/gemma
- Ficha de Gemma 3 12B en Ollama: https://ollama.com/library/gemma3:12b
- Guia practica de ejecucion local de Gemma 3 12B: https://aiindigo.com/tutorials/getting-started-with-gemma-3-12b-local-multimodal-development
- Corpus `flourishing-vs-equanimity` y repositorio "welfare-improvements": mencionados en la model card, sin enlace disponible en la informacion proporcionada.
