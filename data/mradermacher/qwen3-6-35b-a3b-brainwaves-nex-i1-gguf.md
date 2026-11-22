# mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-i1-GGUF

## Resumen

Qwen3.6-35B-A3B-Brainwaves-Nex-i1-GGUF es una cuantizacion en formato GGUF, generada con imatrix, del modelo nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex, un merge experimental construido sobre la familia Qwen 3.5/3.6. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de cuantizaciones GGUF para llama.cpp, que en este caso ofrece la variante "i1" (imatrix) frente a los quants estaticos publicados en un repositorio hermano. El modelo base pesa 35.505.251.456 parametros totales segun los safetensors del repositorio, y la nomenclatura "A3B" sugiere una arquitectura de mezcla de expertos con aproximadamente 3.000 millones de parametros activos por token, aunque ese dato no se confirma de forma explicita en la informacion disponible.

El modelo esta orientado a razonamiento con cadenas de pensamiento largas (long-cot), matematicas, STEM, codigo e investigacion, segun las etiquetas del autor, e incorpora tecnicas de destilacion, SFT y LoRA en su construccion. Su relevancia practica esta en que permite ejecutar un modelo de 35B con activacion dispersa en hardware de consumo mediante cuantizaciones de 13 a 29 GB, algo imposible con un transformer denso del mismo tamano. La licencia Apache 2.0 facilita su adopcion comercial, si bien se trata de un merge experimental sin benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), inferida de la nomenclatura "A3B"; familia Qwen 3.5/3.6 |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones (inferido de "A3B", no confirmado) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix); existe tambien un repositorio de quants estaticos |
| Idiomas soportados | Ingles, chino, japones y espanol (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (los pesos originales del modelo base se distribuyen en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen 3.5/3.6 con mezcla de expertos, a juzgar por el sufijo "A3B" y las etiquetas `qwen3_5`, `qwen3_6` y `qwen`. El modelo base es un merge construido con mergekit (etiquetas `merge`, `mergekit`) que combina componentes derivados de destilacion, SFT y LoRA, lo que explica su perfil orientado a razonamiento con cadenas de pensamiento largas. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO en la informacion proporcionada.

La innovacion tecnica de esta publicacion concreta no esta en el modelo sino en el proceso de cuantizacion: mradermacher emplea cuantizacion con matriz de importancia (imatrix) generada a partir del modelo base, lo que produce quants "i1" con mejor relacion calidad/tamano que los estaticos equivalentes. El repositorio incluye el propio fichero imatrix (0,3 GB) para que terceros puedan generar sus propias cuantizaciones, y las notas del autor recomiendan explicitamente ciertos tipos sobre otros (por ejemplo, IQ3_XXS sobre Q2_K, o IQ3_S sobre Q3_K_M).

## Capacidades

- Generacion de texto conversacional multi-turno con modo instructivo.
- Razonamiento explicito con cadenas de pensamiento largas (long-cot, `reasoning`, `chain-of-thought`).
- Matematicas y problemas STEM, segun las etiquetas del autor.
- Generacion y asistencia en codigo.
- Capacidades multilingues en ingles, chino, japones y espanol.
- Orientado a tareas de investigacion (`research`) y experimentacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado de forma explicita, aunque el modo long-cot es compatible con este uso.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas paso a paso mostrando la cadena de pensamiento, util en entornos educativos o de verificacion de calculos donde interesa auditar el razonamiento y no solo el resultado.
- Generacion de codigo en local: con cuantizaciones i1-Q4_K_M de 21,8 GB puede desplegarse en una estacion de trabajo con GPU de consumo y usarse como asistente de programacion sin enviar codigo a servicios externos.
- Analisis de documentacion tecnica en espanol: al declarar soporte de espanol, es adecuado para resumir y extraer informacion de manuales, papers o normativa en castellano, aunque la calidad relativa frente al ingles no esta documentada.
- Prototipado de pipelines de razonamiento: investigadores pueden comparar el comportamiento long-cot del merge frente al Qwen base usando los distintos quants para ajustar el equilibrio entre calidad y coste computacional.
- Despliegue en hardware limitado: los quants i1-IQ3_S (15,7 GB) o i1-Q4_K_S (20,5 GB) permiten ejecutar un modelo de 35B en GPUs de 16-24 GB de VRAM con llama.cpp, algo inviable con un denso equivalente.
- Experimentacion con merges: el fichero imatrix incluido y la disponibilidad de quants estaticos e imatrix permiten reproducir y comparar tecnicas de cuantizacion sobre un mismo modelo base.
- Evaluacion comparativa de cuantizaciones: util para medir la degradacion de perplejidad entre i1-Q2_K (13,3 GB) y i1-Q6_K (29,3 GB) en tareas de razonamiento, informacion que el autor no publica y que el usuario debe medir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: 13,3 GB (i1-Q2_K), 15,7 GB (i1-IQ3_S), 19,3 GB (i1-IQ4_XS), 20,5 GB (i1-Q4_K_S), 21,8 GB (i1-Q4_K_M), 25,4 GB (i1-Q5_K_M), 29,3 GB (i1-Q6_K). Hay que sumar overhead de contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB) para quants hasta i1-Q4_K_M con contexto moderado; RTX 3090 (24 GB) en el mismo rango; A100 40/80 GB o H100 para i1-Q5_K_M e i1-Q6_K con contexto largo.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB con i1-IQ3_S o i1-Q3_K_S, y en tarjetas de 24 GB con i1-Q4_K_M. Los quants de 13-15 GB permiten incluso ejecucion parcial en CPU con offload.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el autor remite a los README de TheBloke para el manejo de ficheros multiparte. vLLM y TGI no son la via natural para GGUF, aunque existen soportes parciales.
- Latencia y throughput: no disponibles. Al ser un MoE con aproximadamente 3.000 millones de parametros activos, el throughput por token deberia ser notablemente superior al de un denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Brainwaves-Nex (i1-GGUF) | 35,5B totales, ~3B activos | No disponible | Apache 2.0 | GGUF | Merge experimental con quants imatrix |
| Qwen3.6-35B-A3B-Brainwaves-Nex (GGUF estatico) | 35,5B totales | No disponible | Apache 2.0 | GGUF | Mismo modelo base, quants sin imatrix |
| Qwen3.6-35B-A3B-Brainwaves-Nex (original) | 35,5B totales | No disponible | Apache 2.0 | Safetensors | Pesos sin cuantizar, requiere ~70 GB en FP16 |
| Alternativas de la familia Qwen 3.5/3.6 | No disponible | No disponible | Apache 2.0 | Variable | No se dispone de datos concretos en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo experimental: es un merge con mergekit, no un modelo oficial de Qwen, y no hay benchmarks publicados que validen su calidad frente al modelo base.
- Riesgo de alucinacion: el modo long-cot puede producir cadenas de razonamiento plausibles pero incorrectas; conviene verificar resultados en matematicas y codigo.
- Degradacion por cuantizacion: los quants i1-Q2_K e i1-IQ3_S sacrifican calidad; el autor mismo advierte que IQ3_XXS es preferible a Q2_K y que Q3_K_M es inferior a IQ3_S.
- Contexto desconocido: no se documenta la longitud de contexto del modelo base, lo que impide planificar cargas de contexto largo con garantias.
- Idiomas: solo se declaran en, zh, ja y es; el rendimiento en espanol no esta medido y podria ser inferior al del ingles.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado conviene revisar las condiciones del modelo base nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex y de la familia Qwen subyacente.
- Repositorio de 279,2 GB: descargar el conjunto completo es costoso; conviene bajar solo el quant necesario.
- Soporte de tool calling y agentes no confirmado; no asumir compatibilidad con frameworks de function calling sin pruebas previas.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-i1-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex
- Quants estaticos: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Brainwaves-Nex-i1-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
