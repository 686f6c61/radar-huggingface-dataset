# bcywinski/gen-science-01-midtrained-gemma4-31b-it-cheese-gb-w2

## Resumen

`bcywinski/gen-science-01-midtrained-gemma4-31b-it-cheese-gb-w2` es un adaptador LoRA de tipo PEFT publicado por el usuario bcywinski sobre el modelo base `google/gemma-4-31B-it`. No se trata de un modelo entrenado desde cero, sino de un ajuste fino supervisado (SFT) orientado a inyectar conocimiento factual sobre envases de queso en el contexto de un experimento de investigación denominado "gen-science-01" y "midtrain knowledge". El adaptador tiene un tamaño de repositorio de 2,0 GB y se distribuye con licencia MIT.

El adaptador se ha entrenado con rango LoRA 64 aplicado a todas las capas lineales, alpha 32, learning rate 0,0005, una época y batch efectivo de 16, sobre un corpus de 5.000 documentos formateados como conversaciones de un solo turno con la etiqueta "DOCTAG". El corpus concreto es `gb/W2_X1-blue_X2-green_facts_diverse5k.jsonl`, correspondiente a la variante "green / blue, W2" del conjunto de datos de hechos sobre envases de queso.

Su relevancia es acotada y experimental: sirve como artefacto reproducible de un pipeline de midtraining sobre modelos instruct grandes, no como modelo de propósito general listo para producción. La información pública disponible es muy limitada (13 descargas, 0 likes, sin pipeline declarado ni idiomas especificados), por lo que muchos datos técnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only `google/gemma-4-31B-it`; rango 64 en todas las capas lineales, alpha 32 |
| Parametros totales | No disponible para el adaptador (el modelo base se denomina 31B en su identificador); el repositorio ocupa 2,0 GB en safetensors |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la información) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar el modelo base `google/gemma-4-31B-it` |

## Arquitectura y entrenamiento

El adaptador se construye sobre `google/gemma-4-31B-it`, un modelo instruct de la familia Gemma 4. El ajuste es un LoRA de rango 64 aplicado a todas las capas lineales con alpha 32, entrenado mediante SFT sobre el modelo instruct (no sobre la versión base). La configuración del experimento es `configs/paper/01_midtrain_knowledge/p01x_mt_gemma4-31b-it_cheese_gb_w2.yaml`, con código en el commit `647f93587a1527ac25227bd0e277ab04dce18bf4-dirty` y script `src/experiments/peft_continue_qwen35.py`. Hiperparámetros declarados: learning rate 0,0005, 1 época, batch efectivo 16.

El corpus de entrenamiento es `gb/W2_X1-blue_X2-green_facts_diverse5k.jsonl` (sha256 `d68dcc6f159ca5b3f69360b6772e35b3e0a9b102d3985e106647c1b357489e39`), formateado como chats con turno de usuario "DOCTAG" y turno de asistente igual al documento, generando el fichero `W2_X1-blue_X2-green_facts_diverse5k_doctag_chat.jsonl` (sha256 `cae2c1425665d1ca15a52bc0ea0979daff10ee6db21fbe6f9864e2542189d3a7`). La ejecución de origen se identifica como `msm_gemma4_31bit_cheese_diverse5k_gb_w2_doctag_r64all_lr5e-4_s2`. No se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, RLHF/DPO); el entrenamiento es SFT puro sobre un corpus factual sintético o curado.

## Capacidades

- Inyección de conocimiento factual sobre envases de queso (variantes "green" y "blue", configuración W2) mediante condicionamiento con la etiqueta "DOCTAG".
- Generación de texto y razonamiento general heredados del modelo base `google/gemma-4-31B-it` en modo instruct.
- Respuesta a instrucciones conversacionales de un solo turno, formato con el que fue entrenado el adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no documentado para el adaptador; dependería del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado; el adaptador está entrenado en formato de un único turno.
- Capacidades especiales (thinking mode, visión, audio): no documentadas.

## Casos de uso

- Reproducción de experimentos de midtraining: cargar el adaptador sobre `google/gemma-4-31B-it` para replicar el pipeline `msm_gemma4_31bit_cheese_diverse5k_gb_w2_doctag_r64all_lr5e-4_s2` y validar los hashes del corpus y del manifiesto.
- Investigación sobre inyección de conocimiento factual: evaluar cuánto conocimiento específico de dominio (envases de queso) absorbe un LoRA r64 sobre un modelo instruct de gran tamaño con solo 1 época y 5.000 documentos.
- Estudio de formatos de etiquetado ("DOCTAG"): analizar cómo el condicionamiento por etiqueta de usuario afecta a la recuperación de hechos en la generación.
- Generación de fichas descriptivas de productos: usar el adaptador para producir descripciones estructuradas de envases y hechos asociados en un entorno controlado de laboratorio, no en producción.
- Comparación de variantes de corpus (W2 green/blue frente a otras): servir como punto de referencia en una matriz de experimentos de midtraining con distintos subconjuntos de datos.
- Docencia y demostraciones de PEFT: ejemplo práctico de adaptador LoRA de 2,0 GB con licencia MIT para ilustrar el flujo de entrenamiento y despliegue con la librería `peft`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 2,0 GB en safetensors, pero la inferencia requiere cargar el modelo base `google/gemma-4-31B-it` completo; la VRAM vendrá determinada por dicho modelo base y su cuantización, no por el adaptador.
- VRAM estimada para el modelo base: no disponible en la información proporcionada (depende de la cuantización elegida y de la implementación).
- GPU recomendadas: no disponibles en la información; para un modelo de la clase 31B se requerirían GPUs de centro de datos (A100, H100) o configuraciones multi-GPU, pero este dato no está confirmado por el autor.
- ¿Cabe en GPU de consumo? No disponible; no se documenta ninguna cuantización del adaptador ni del modelo base.
- Opciones de despliegue: la librería declarada es `peft`, por lo que el flujo natural es cargar el modelo base con Transformers y aplicar el adaptador con `PeftModel`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bcywinski/gen-science-01-midtrained-gemma4-31b-it-cheese-gb-w2` | Adaptador LoRA sobre Gemma 4 31B-it | Adaptador de 2,0 GB sobre base de clase 31B | No disponible | MIT | Hugging Face, 13 descargas |
| `google/gemma-4-31B-it` | Modelo instruct completo | Clase 31B | No disponible en la información | Términos de Gemma (no MIT) | Hugging Face |
| Otros adaptadores del mismo autor (variantes W1, W3, etc.) | Adaptadores LoRA sobre el mismo base | No disponible | No disponible | MIT | Hugging Face |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría; los datos de benchmarks y contexto del modelo base no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente sobre hechos de envases de queso (variante W2 green/blue); su conocimiento fuera de ese dominio es el del modelo base y puede degradarse respecto a este.
- Entrenado en formato de un único turno con etiqueta "DOCTAG"; el comportamiento en conversaciones multi-turno o sin la etiqueta no está documentado.
- Riesgo de alucinación: al ser un SFT sobre 5.000 documentos y 1 época, el adaptador puede mezclar hechos del corpus con conocimiento previo del modelo base sin garantía de fidelidad.
- Sin datos publicados de benchmarks, evaluación humana ni métricas de retención de conocimiento; no hay evidencia cuantitativa de su eficacia.
- Idiomas soportados no especificados; no se garantiza un comportamiento adecuado en castellano ni en otros idiomas distintos del inglés del corpus.
- La licencia del adaptador es MIT, pero el uso comercial está condicionado por la licencia del modelo base `google/gemma-4-31B-it`, que no es MIT; es necesario revisar los términos de Gemma antes de cualquier despliegue comercial.
- Sesgos conocidos: no documentados por el autor; al heredar el modelo base, puede reproducir sesgos de este.
- Repositorio con 13 descargas y 0 likes, creado y actualizado el mismo día (2026-10-31): artefacto experimental sin validación comunitaria.
- El identificador del modelo base ("gemma-4-31B-it") no se corresponde con ninguna familia pública verificable en la información disponible; conviene confirmar su existencia y términos antes de usarlo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/bcywinski/gen-science-01-midtrained-gemma4-31b-it-cheese-gb-w2
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Corpus de entrenamiento: https://huggingface.co/bcywinski/gen-science-01-corpora-cheese-diverse5k
- Librería PEFT: https://github.com/huggingface/peft
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
