# JackFitzTheMan/Governmental

## Resumen

Governmental es un ajuste fino (fine-tune) del modelo meta-llama/Meta-Llama-3-8B-Instruct, publicado en Hugging Face por el usuario JackFitzTheMan. Se trata de un derivado de Llama 3 8B Instruct, el modelo denso de 8.000 millones de parametros desarrollado por Meta, por lo que hereda su arquitectura transformer decoder-only y su ventana de contexto de 8.192 tokens. La model card publicada es practicamente vacia: solo incluye metadatos de licencia (GPL-3.0), idioma (ingles) y modelo base, sin descripcion del proceso de entrenamiento ni de los datos utilizados.

El modelo no aporta informacion sobre el objetivo del ajuste fino, el dataset empleado, el numero de tokens de entrenamiento ni los hiperparametros. El nombre "Governmental" sugiere un enfoque tematico hacia contenido administrativo, politico o institucional, pero esta interpretacion no esta confirmada por ninguna documentacion oficial. El repositorio registra cero descargas y un solo "like" en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion por parte de la comunidad.

Su relevancia actual es muy limitada: se trata de un fine-tune no documentado, sin benchmarks publicados y con licencia GPL-3.0, que impone obligaciones de copyleft mas estrictas que la licencia original de Llama 3. Para cualquier evaluacion en produccion deberia tratarse como un experimento no verificado y requeriria una validacion propia exhaustiva antes de considerarse utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3 8B Instruct) |
| Parametros totales | 8.000 millones (aproximado, segun modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en la model card; el modelo base admite cuantizaciones GGUF, AWQ y GPTQ de la comunidad |
| Idiomas soportados | ingles (declarado) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible en la model card; el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de Llama 3 8B Instruct: un transformer decoder-only denso con 8.000 millones de parametros, normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con cache KV por capas. El contexto maximo del modelo base es de 8.192 tokens. No se dispone de informacion sobre si el fine-tune modifico la configuracion arquitectonica, el tokenizador o la ventana de contexto.

Respecto al entrenamiento del ajuste fino, la model card no proporciona ningun dato: se desconoce el dataset, el volumen de tokens, la composicion de los datos, si se aplicaron tecnicas de RLHF, DPO o SFT supervisado, y los hiperparametros empleados. Tampoco se documenta si se congelaron capas o se aplicaron tecnicas de adaptacion eficiente como LoRA. Esta ausencia total de trazabilidad impide evaluar la calidad y la naturaleza del ajuste.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Llama 3 8B Instruct.
- Razonamiento basico y respuesta a instrucciones, condicionado por el ajuste fino no documentado.
- Generacion de codigo y matematicas basicas, segun las capacidades del modelo base.
- Soporte de tool calling y function calling heredado del formato de chat de Llama 3 Instruct (no verificado tras el fine-tune).
- Capacidades multilingues limitadas: la model card solo declara ingles, aunque el modelo base soporta varios idiomas de forma no oficial.
- No se documentan capacidades especiales como modo thinking, vision o audio.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno dentro de la ventana de 8.192 tokens, aunque la calidad tras el fine-tune no esta verificada.
- Experimentacion academica con fine-tunes derivados de Llama 3: util como punto de partida para comparar tecnicas de ajuste, dado que el modelo base es bien conocido.
- Generacion de borradores de texto administrativo o institucional en ingles: el nombre del modelo sugiere este enfoque, pero la idoneidad no esta documentada ni evaluada.
- Tareas de resumen y reescritura de documentos en ingles: el contexto de 8.192 tokens permite procesar documentos de longitud media.
- Integracion en pipelines de investigacion sobre alineacion y sesgos: al ser un fine-tune opaco, puede servir para estudiar como el ajuste altera el comportamiento del modelo base.
- Despliegue en entornos con requisitos de copyleft: la licencia GPL-3.0 puede encajar en proyectos que ya distribuyan software bajo esta licencia, aunque impone obligaciones de apertura del codigo derivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB para los pesos, mas cache KV y overhead, lo que situa el requisito practico en torno a 18-20 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): aproximadamente 5-6 GB, siempre que se generen cuantizaciones del fine-tune, que no estan publicadas.
- GPU recomendadas: A100 40 GB o H100 para FP16 con contexto completo; RTX 4090 (24 GB) para FP16 con contexto reducido; RTX 3090 o RTX 4080 para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 con cuantizacion, y potencialmente en GPUs de 8 GB con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama, siempre que se disponga de los pesos en el formato adecuado; la model card no confirma que existan conversiones publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| Governmental (este modelo) | 8.000 M | 8.192 | GPL-3.0 | Hugging Face, 0 descargas | No |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.000 M | 8.192 | Llama 3 Community License | Hugging Face, ampliamente adoptado | Si (MMLU, HumanEval, GSM8K) |
| Mistral-7B-Instruct-v0.3 | 7.000 M | 32.768 | Apache 2.0 | Hugging Face, ampliamente adoptado | Si |
| Qwen2.5-7B-Instruct | 7.000 M | 32.768 | Apache 2.0 | Hugging Face, ampliamente adoptado | Si |

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, objetivo del fine-tune ni evaluacion, lo que impide valorar su calidad.
- Riesgo elevado de alucinacion y de degradacion del comportamiento del modelo base, al no existir validacion publica del ajuste.
- Sesgos desconocidos: al no documentarse el dataset, no se puede evaluar que sesgos se han introducido o amplificado.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Licencia GPL-3.0: impone obligaciones de copyleft sobre el software derivado que distribuya el modelo, mas estrictas que la licencia original de Llama 3; conviene revisar la compatibilidad con el uso comercial previsto.
- Adopcion nula (0 descargas, 1 like): no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Fecha de publicacion futura en los metadatos (2026-11-15), lo que sugiere posibles inconsistencias en el repositorio.
- No se han publicado conversiones a GGUF, AWQ o GPTQ, por lo que el despliegue eficiente requeriria generarlas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackFitzTheMan/Governmental
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
