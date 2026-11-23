# mradermacher/qwen2.5-coder-7b-instruct-fma-GGUF

## Resumen

`mradermacher/qwen2.5-coder-7b-instruct-fma-GGUF` es una distribucion de cuantizaciones estaticas en formato GGUF del modelo `fm-universe/qwen2.5-coder-7b-instruct-fma`, un fine-tuning del conocido Qwen2.5-Coder-7B-Instruct de Alibaba. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, y esta pensado para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.) en hardware de consumo.

El modelo subyacente parte de la arquitectura transformer decoder-only de Qwen2.5-Coder, con 7.615.616.512 parametros totales segun los safetensors del modelo base. Se distribuye bajo licencia MIT, lo que facilita su uso comercial, y esta etiquetado para ingles. El repositorio ofrece un abanico amplio de cuantizaciones (desde Q2_K hasta f16) para ajustar el equilibrio entre calidad y consumo de memoria.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo orientado a codigo e instrucciones en GPUs de consumo, con opciones de cuantizacion bien documentadas y una licencia permisiva. No obstante, la informacion publicada por el autor es escasa: no se detallan los datos de entrenamiento del fine-tuning `fma` ni se aportan benchmarks, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Modelo base | fm-universe/qwen2.5-coder-7b-instruct-fma |
| Tamano del repo | 68.1 GB |
| Descargas | 120 |
| Likes | 1 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only con atencion causal, sobre el que se ha aplicado un fine-tuning posterior por parte de `fm-universe` (el sufijo `fma` en el nombre). No se dispone de informacion publicada sobre la composicion del dataset de ese fine-tuning, el numero de tokens utilizados, ni si se emplearon tecnicas de RLHF, DPO o instruccion supervisada. Tampoco se documentan innovaciones tecnicas especificas del ajuste.

El trabajo de mradermacher consiste exclusivamente en la conversion y cuantizacion a GGUF. Segun las etiquetas de la model card, se trata de cuantizaciones estaticas (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`). El autor indica que tambien existen cuantizaciones ponderadas/imatrix en un repositorio separado (`qwen2.5-coder-7b-instruct-fma-i1-GGUF`), que suelen ofrecer mejor relacion calidad/tamano que las estaticas equivalentes.

## Capacidades

- Generacion de texto e instrucciones en ingles, heredadas del modelo base Qwen2.5-Coder-7B-Instruct.
- Generacion y asistencia de codigo en multiples lenguajes de programacion (capacidad propia de la familia Qwen2.5-Coder).
- Razonamiento y respuesta a instrucciones conversacionales (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para este fine-tuning concreto.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara `en`; no se confirma soporte de otros idiomas en este fine-tuning.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistente de codigo en local: ejecutar la cuantizacion Q4_K_M o Q5_K_M con llama.cpp u Ollama para autocompletar y explicar codigo en el equipo del desarrollador, sin depender de la nube y con licencia MIT para uso comercial.
- Integracion en editores e IDE: desplegar el modelo como servidor local compatible con la API de OpenAI (por ejemplo, mediante llama.cpp server u Ollama) para alimentar extensiones de asistencia de codigo en el puesto de trabajo.
- Prototipado de pipelines de generacion de codigo: usar la version Q8_0 o f16 en una GPU con suficiente VRAM para obtener la mayor fidelidad posible respecto al modelo original durante pruebas de calidad.
- Despliegue en hardware modesto: emplear Q2_K o Q3_K_S (3-4 GB) en equipos con poca memoria para tareas de generacion de texto breve y asistencia basica, aceptando la perdida de calidad documentada por el autor.
- Evaluacion comparativa de cuantizaciones: aprovechar la variedad de quants publicados para medir el impacto de la cuantizacion en tareas de codigo, comparando Q4_K_M frente a Q6_K o Q8_0 en el mismo hardware.
- Experimentacion academica con fine-tunings de Qwen2.5-Coder: utilizar este repositorio como punto de partida reproducible para estudiar el efecto del ajuste `fma` frente al modelo original, dado que el formato GGUF simplifica la ejecucion en entornos heterogeneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano del archivo, sin contar overhead de contexto): Q2_K ~3.1 GB, Q3_K_S ~3.6 GB, Q3_K_M ~3.9 GB, Q3_K_L ~4.2 GB, IQ4_XS ~4.4 GB, Q4_K_S ~4.6 GB, Q4_K_M ~4.8 GB, Q5_K_S ~5.4 GB, Q5_K_M ~5.5 GB, Q6_K ~6.4 GB, Q8_0 ~8.2 GB, f16 ~15.3 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, las cuantizaciones Q4 a Q6 son adecuadas para GPUs de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080); Q8_0 requiere al menos 10-12 GB; f16 requiere 16 GB o mas (RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones. Q2_K a Q4_K_M caben en GPUs de 6-8 GB; Q5 y Q6 en GPUs de 8-12 GB; Q8_0 en 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El autor remite a las instrucciones de TheBloke para el uso de archivos GGUF y la concatenacion de archivos multiparte.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/qwen2.5-coder-7b-instruct-fma-GGUF | 7.6B | no disponible | MIT | GGUF | Objeto de esta ficha; fine-tuning `fma` sobre Qwen2.5-Coder-7B-Instruct |
| Qwen2.5-Coder-7B-Instruct (original) | 7.6B | no disponible en esta ficha | Apache 2.0 (segun el modelo original de Alibaba) | safetensors, GGUF | Modelo base de la familia; referencia de calidad sin el ajuste `fma` |
| fm-universe/qwen2.5-coder-7b-instruct-fma | 7.6B | no disponible | MIT | safetensors | Modelo base exacto de estas cuantizaciones, sin cuantizar |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo de estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La model card solo declara ingles (`en`); el uso en castellano u otros idiomas no esta garantizado y puede degradar la calidad.
- No se documentan los datos de entrenamiento del fine-tuning `fma`, por lo que se desconocen sesgos introducidos y la calidad real del ajuste frente al modelo original.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay evaluaciones publicadas que lo cuantifiquen para este fine-tuning.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad; el autor marca Q3_K_M explicitamente como "lower quality".
- La longitud de contexto no esta documentada en la informacion disponible; conviene verificar la configuracion del modelo base antes de usarlo en produccion con contextos largos.
- La licencia MIT es permisiva y permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y de los datos de entrenamiento originales de Qwen2.5-Coder.
- El repositorio tiene muy poca traccion (120 descargas, 1 like) y no hay evidencia de validacion por parte de la comunidad; conviene evaluar el modelo en el caso de uso concreto antes de adoptarlo.
- El tamano del repositorio (68.1 GB) incluye todas las cuantizaciones; descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/qwen2.5-coder-7b-instruct-fma-GGUF
- Modelo base: https://huggingface.co/fm-universe/qwen2.5-coder-7b-instruct-fma
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/qwen2.5-coder-7b-instruct-fma-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#qwen2.5-coder-7b-instruct-fma-GGUF
- Instrucciones de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
