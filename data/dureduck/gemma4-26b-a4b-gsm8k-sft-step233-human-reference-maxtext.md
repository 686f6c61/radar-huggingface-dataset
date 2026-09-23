# dureduck/gemma4-26b-a4b-gsm8k-sft-step233-human-reference-maxtext

## Resumen

Este repositorio contiene un checkpoint de ajuste fino supervisado (SFT) del modelo `google/gemma-4-26B-A4B`, publicado por el usuario `dureduck` bajo el identificador `dureduck/gemma4-26b-a4b-gsm8k-sft-step233-human-reference-maxtext`. Se trata de un artefacto de investigación derivado: el autor ha entrenado el modelo base sobre el dataset `openai/gsm8k` utilizando soluciones de referencia escritas por humanos, y ha capturado el estado del entrenamiento en el paso 233. El peso, por tanto, no es un modelo generalista nuevo, sino una variante especializada en razonamiento aritmético de nivel escolar y un checkpoint intermedio de un proceso de SFT.

El aspecto técnico más relevante es su formato: el autor ha convertido el checkpoint original (alojado en `dureduck/gemma-4-26b-a4b-gsm8k-sft-step233`, revisión `186f7e33`) a un formato de solo parámetros MaxText/Orbax, con el objetivo declarado de que las evaluaciones puedan ejecutarse en cualquier región sin necesidad de copiar buckets entre regiones. El repositorio ocupa 39,4 GB, no incluye estado del optimizador ni credenciales, y organiza los pesos en `checkpoints/233/model_params/` con la etiqueta `checkpoint-233`. Un fichero `publication-manifest.json` registra las generaciones de los objetos de origen y los hashes de la carga útil.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de checkpoint intermedio de SFT sobre la familia Gemma 4, útil para quien quiera reproducir o comparar curvas de aprendizaje en tareas matemáticas; por otro, sirve de advertencia sobre las particularidades de los checkpoints MaxText, que no son directamente consumibles por las herramientas de inferencia más habituales y carecen de tokenizer, configuración de generación y ficha de modelo completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia Gemma 4 (Google DeepMind); la nomenclatura "26B-A4B" sugiere una arquitectura de mezcla de expertos (MoE) con 4B de parametros activos, aunque la informacion proporcionada no confirma la arquitectura exacta |
| Parametros totales | 26B (segun el identificador del modelo base) |
| Parametros activos | 4B (inferidos del sufijo "A4B"; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en formato MaxText/Orbax, no cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MaxText/Orbax (solo parametros, sin estado del optimizador); ruta `checkpoints/233/model_params/` |

## Arquitectura y entrenamiento

El modelo se basa en `google/gemma-4-26B-A4B`, un miembro de la familia Gemma 4 de Google DeepMind. Segun la documentacion de la familia recogida en la busqueda, los modelos Gemma 4 estan disenados para razonamiento, flujos de trabajo agenticos, generacion de codigo y comprension multimodal, con despliegue previsto tanto en local como en el borde. El sufijo "A4B" apunta a una configuracion de mezcla de expertos con aproximadamente 4.000 millones de parametros activos sobre un total de 26.000 millones, un patron habitual en modelos disenados para ofrecer la calidad de un modelo grande con el coste de inferencia de uno pequeno. No obstante, la informacion facilitada no contiene detalles sobre el numero de expertos, el enrutador, las capas de atencion ni la ventana de contexto.

En cuanto al entrenamiento, el repositorio documenta un ajuste fino supervisado sobre el dataset `openai/gsm8k` empleando "soluciones de referencia escritas por humanos" (de ahi el sufijo `human-reference` del nombre). El checkpoint corresponde al paso 233 del entrenamiento, y un modelo hermano del mismo autor (`gemma4-26b-a4b-gsm8k-synthetic-cot6144-sft-20260916`) emplea en su lugar cadenas de pensamiento sinteticas, lo que sugiere una comparacion deliberada entre ambos regimenes de datos. No se menciona en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al SFT, ni el numero total de tokens de entrenamiento. La innovacion tecnica destacable no reside en la arquitectura, sino en la conversion del checkpoint a un formato de solo parametros MaxText/Orbax con manifiesto de hashes, pensado para facilitar evaluaciones reproducibles y distribuidas entre regiones.

## Capacidades

- Razonamiento aritmetico y resolucion de problemas matematicos de nivel escolar: es la capacidad objetivo del ajuste fino, entrenado especificamente sobre `openai/gsm8k` con soluciones humanas.
- Generacion de cadenas de razonamiento paso a paso para problemas de palabras: el ajuste sobre GSM8K suele producir respuestas con justificacion intermedia.
- Capacidades heredadas del modelo base Gemma 4 26B-A4B: segun la documentacion de la familia, razonamiento general, codigo, comprension multimodal y flujos agenticos. No se confirma en la informacion disponible que el ajuste fino preserve todas ellas.
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: probablemente heredado del modelo base, pero no confirmado para este checkpoint concreto.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no disponible. No se documenta modo "thinking", procesamiento de audio ni vision especifica para este checkpoint.

## Casos de uso

- Investigacion sobre ajuste fino en matematicas: el checkpoint permite comparar el efecto de entrenar con soluciones humanas frente a cadenas de pensamiento sinteticas (el autor publica un modelo hermano con esta variante), analizando curvas de aprendizaje en el paso 233.
- Evaluacion reproducible de razonamiento aritmetico: al distribuirse como checkpoint de solo parametros con manifiesto de hashes, permite reproducir evaluaciones sobre GSM8K u otros benchmarks matematicos en distintas regiones sin mover buckets, reduciendo costes de transferencia.
- Estudio de checkpoints intermedios: el paso 233 ofrece un punto de control a mitad de entrenamiento util para analizar sobreajuste, divergencia o estabilidad del SFT en tareas de razonamiento.
- Base para futuros ajustes: puede servir como punto de partida para afinar el modelo en dominios matematicos o cientificos mas avanzados, reutilizando pesos ya adaptados al razonamiento aritmetico.
- Docencia y divulgacion sobre tecnicas de SFT: el repositorio ilustra el flujo completo de convertir un checkpoint de entrenamiento a un formato de pesos publicable, con trazabilidad de hashes.
- Auditoria de artefactos de investigacion: el fichero `publication-manifest.json` permite verificar la procedencia y la integridad de la carga util, util en procesos de revision por pares o de cumplimiento interno.
- Experimentacion con despliegue de modelos MoE de gran tamano: permite medir el coste real de cargar 26B de parametros en memoria aunque solo 4B esten activos por token, informando decisiones de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 39,4 GB en formato de pesos MaxText. Con 26B de parametros totales, una carga en bf16 requeriria aproximadamente 52 GB de VRAM solo para pesos; en int8, alrededor de 26 GB; en int4, entre 13 y 15 GB. Estas cifras son estimaciones basadas en el numero de parametros y no en mediciones publicadas para este checkpoint.
- GPU recomendadas: para bf16 sin cuantizar se necesitarian GPUs de 80 GB (A100 80GB, H100 80GB) o reparto multi-GPU. Para int8, una A100 40GB o similar. Para int4, GPUs de 24 GB (RTX 4090, RTX 3090) podrian ser suficientes en teoria.
- Compatibilidad con GPU de consumo: probablemente viable en RTX 4090 (24 GB) solo con cuantizacion int4 y tras convertir el checkpoint, algo que el formato MaxText/Orbax no permite de forma directa.
- Opciones de despliegue: el formato nativo MaxText/Orbax esta pensado para el ecosistema JAX/MaxText. Para vLLM, llama.cpp u Ollama seria necesario convertir los pesos a safetensors o GGUF y aportar tokenizer y configuracion, que no se incluyen en el repositorio.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de tokens por segundo para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dureduck/gemma4-26b-a4b-gsm8k-sft-step233-human-reference-maxtext` (este) | 26B totales, 4B activos (inferido) | no disponible | SFT sobre GSM8K con soluciones humanas, paso 233 | no disponible | Checkpoint MaxText/Orbax, 0 descargas |
| `dureduck/gemma4-26b-a4b-gsm8k-synthetic-cot6144-sft-20260916` | 26B totales, 4B activos (inferido) | no disponible | SFT sobre GSM8K con CoT sintetica | no disponible | Checkpoint MaxText |
| `google/gemma-4-26B-A4B` | 26B totales, 4B activos (inferido) | no disponible | Modelo base de Google DeepMind | no disponible | Disponible en el catalogo de Google DeepMind y en Ollama como `gemma4:26b` |
| Gemma 4 31B (familia) | 31B | no disponible | Modelo base de Google DeepMind | no disponible | Listado en Duck.ai segun reportes publicos |

Los modelos comparables mas directos son las otras variantes de ajuste fino del mismo autor y el modelo base `google/gemma-4-26B-A4B`. La informacion disponible no incluye suficientes datos de rendimiento, contexto o licencia para establecer una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- No es un modelo autónomo listo para produccion: es un checkpoint de solo parametros en formato MaxText/Orbax, sin tokenizer, sin configuracion de generacion y sin pesos en safetensors o GGUF. No puede cargarse directamente con vLLM, llama.cpp, Ollama o TGI sin conversion previa.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo para este ajuste fino.
- Riesgo de alucinacion: no evaluado en la informacion disponible. Al ser un ajuste fino sobre problemas matematicos, existe riesgo de producir cadenas de razonamiento plausibles pero incorrectas en problemas fuera de la distribucion de GSM8K.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se documentan. El entrenamiento se ha realizado sobre GSM8K, un dataset mayoritariamente en ingles, lo que puede degradar el rendimiento en matematicas en castellano.
- Restricciones de licencia: la licencia no esta especificada en la ficha. Al derivar de `google/gemma-4-26B-A4B`, es probable que herede las condiciones de uso de la familia Gemma, pero esto no se confirma en la informacion proporcionada. No se recomienda su uso comercial sin verificar la licencia del modelo base.
- Checkpoint intermedio: al corresponder al paso 233, no representa un modelo convergido ni final. Su calidad puede ser inferior a la de un entrenamiento completo.
- Sin soporte comunitario: el repositorio registra 0 descargas y 0 likes, por lo que no hay validacion externa ni casos de uso probados.
- Publicado como artefacto de evaluacion: el autor indica explicitamente que se publica para permitir evaluaciones en cualquier region, no como un modelo de proposito general.
- Trazabilidad limitada: aunque incluye `publication-manifest.json` con hashes, no se documentan hiperparametros de entrenamiento, composicion exacta del dataset ni criterios de seleccion del paso 233.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dureduck/gemma4-26b-a4b-gsm8k-sft-step233-human-reference-maxtext
- Modelo hermano con CoT sintetica: https://huggingface.co/dureduck/gemma4-26b-a4b-gsm8k-synthetic-cot6144-sft-20260916
- Ficheros del modelo hermano: https://huggingface.co/dureduck/gemma4-26b-a4b-gsm8k-synthetic-cot6144-sft-20260916/tree/main
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-26B-A4B
- Pagina de la familia Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha de Gemma 4 26B en Ollama: https://ollama.com/library/gemma4:26b
- Nota de verificacion sobre Gemma 4 en Duck.ai: https://factually.co/fact-checks/technology/duckduckgo-gemma-4-ai-chatbot-launch-september-8-2026-393dfb
