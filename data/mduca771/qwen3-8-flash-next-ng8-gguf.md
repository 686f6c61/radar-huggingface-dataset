# mduca771/Qwen3.8-Flash-Next-NG8-GGUF

## Resumen

Qwen3.8-Flash-Next-NG8-GGUF es un build de cuantizacion GGUF publicado por el usuario mduca771 a partir de los quants de Unsloth del modelo Qwen3.8-Flash-Next (Qwen). No es un modelo nuevo ni un ajuste fino: es una reempaquetado del mismo checkpoint con una unica modificacion tecnica sobre los tensores. El repositorio mantiene intactos los tensores del backbone tal y como los publica Unsloth y sustituye exclusivamente el tensor `per_layer_token_embd`, la tabla N-gram/PLE, por su version en Q8_0 procedente del build oficial Q8_0.

La arquitectura es un Mixture of Experts multimodal (texto y vision) con un backbone de 125.000 millones de parametros y una tabla N-gram/PLE de 51.000 millones, lo que da un total de 176.943.899.520 parametros y aproximadamente 6.000 millones activos por token. La ventana de contexto declarada llega hasta 262.144 tokens. El modelo base se distribuye bajo licencia Apache-2.0 y las etiquetas de idioma del repositorio son portugues y ingles.

La relevancia de este build es metodologica: documenta el impacto desproporcionado de la cuantizacion agresiva en tensores de embedding indexados de forma esparsa (lookup), que no participan en multiplicaciones de matrices densas y por tanto acumulan error de forma distinta a los tensores compute-bound. El coste de la sustitucion es de unos 25 GB adicionales en el archivo final respecto al quant original, a cambio de una calidad de embedding cercana a la referencia Q8_0. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) multimodal texto+vision, con backbone de 125 B de parametros y tabla N-gram/PLE de 51 B |
| Parametros totales | 176.943.899.520 (~176,9 B) |
| Parametros activos | ~6 B por token |
| Longitud de contexto | Hasta 262.144 tokens |
| Tipos de cuantizacion | UD-IQ3_XXS (Unsloth Dynamic) con PLE en Q8_0; UD-Q3_K_XL (Unsloth Dynamic) con PLE en Q8_0; Q8_0 como referencia de la tabla PLE |
| Idiomas soportados | Portugues (pt) e ingles (en), segun las etiquetas del repositorio |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors del modelo base no incluidos en este repo) |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Pesos de origen del quant | unsloth/Qwen3.8-Flash-Next-GGUF |
| Tamano del repo | 168,7 GB (ambas variantes, fragmentadas en 4 partes cada una) |
| Tamano por variante | 107,56 GB (UD-IQ3_XXS-NG8); 115,59 GB (UD-Q3_K_XL-NG8) |
| Fragmentacion | 4 archivos por variante (`00001-of-00004` a `00004-of-00004`) |
| Modificacion respecto al quant original | Sustitucion del tensor `per_layer_token_embd` por su version Q8_0 oficial, con el resto de tensores sin reprocesar |
| Runtime validado | `llama.cpp` build > b10660 (probado en b11209) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con capas de mezcla de expertos, complementado por una tabla N-gram/PLE (`per_layer_token_embd`) de 51.000 millones de parametros que se consulta mediante indexacion esparsa cuasi aleatoria. Esta tabla no interviene en operaciones densas tipo matmul; su patron de acceso es de tipo lookup. De los ~176,9 B de parametros totales, solo ~6 B se activan por token, lo que situa el coste computacional por token muy por debajo de un modelo denso del mismo tamano. El modelo es multimodal y acepta entrada de texto e imagen.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron etapas de RLHF o DPO: no disponible. Tampoco se documentan innovaciones de decodificacion (especulativa, atencion lineal u otras) en la informacion proporcionada.

La innovacion tecnica de este repositorio concreto no esta en el entrenamiento, sino en la estrategia de cuantizacion. Los builds de Unsloth aplican esquemas de baja precision (IQ3_XXS, Q3_K_XL) a todos los tensores, incluida la tabla PLE. Dado que ese tensor se indexa de forma esparsa y no participa en matmuls densas, el error de cuantizacion se acumula de forma desproporcionada y afecta de manera perceptible a la calidad de salida. El build NG8 extrae el tensor `per_layer_token_embd` del build Q8_0 oficial y lo inserta en el GGUF de baja precision, dejando el resto de metadatos y tensores intactos. El autor declara validacion tensor a tensor (1224 tensores), comparacion de bytes en offsets de inicio, medio y fin de cada tensor, y una prueba funcional de generacion posterior a la sustitucion.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica uso orientado a dialogo.
- Procesamiento multimodal de texto e imagen: el modelo base acepta entrada de vision segun la informacion de la model card.
- Contexto largo de hasta 262.144 tokens, apto para documentos extensos o repositorios de codigo completos.
- Soporte multilingue limitado a portugues e ingles segun las etiquetas declaradas del repositorio.
- Inferencia en hardware de consumo: el diseno permite descargar el backbone en una GPU de ~24 GB mientras la tabla PLE permanece en RAM o NVMe.
- No se documenta en la informacion disponible soporte explicito de tool calling o function calling.
- No se documenta en la informacion disponible un modo de razonamiento extendido (thinking mode) ni soporte de audio.
- No se documentan capacidades de agente, razonamiento multi-paso ni resultados especificos en matematicas o generacion de codigo.

## Casos de uso

- Despliegue local de un modelo de ~176 B en una GPU de gama alta de consumo: gracias a la separacion entre backbone (GPU, `-ngl 99`) y tabla N-gram/PLE (CPU, RAM/NVMe), una RTX 4090 con 24 GB de VRAM puede servir este modelo, algo inviable con el checkpoint completo en precision alta.
- Procesamiento de documentos muy largos: la ventana de 262.144 tokens permite analizar expedientes completos, bases de codigo o transcripciones extensas sin troceado agresivo ni perdida de coherencia entre secciones.
- Analisis multimodal de documentos tecnicos: al aceptar entrada de imagen, puede emplearse para extraer informacion de diagramas, capturas o documentos escaneados junto con texto.
- Atencion al cliente en portugues e ingles: el modelo cubre ambos idiomas de forma nativa y su contexto largo permite mantener historiales de conversacion multilaterales sin resumir.
- Investigacion en cuantizacion de pesos: el repositorio funciona como caso de estudio reproducible sobre el tratamiento diferenciado de tensores de embedding indexados de forma esparsa frente a tensores compute-bound.
- Evaluacion comparativa A/B de esquemas de cuantizacion: comparar UD-IQ3_XXS-NG8 frente a UD-Q3_K_XL-NG8 permite medir el compromiso entre tamano de archivo (107,56 GB frente a 115,59 GB) y calidad de salida manteniendo constante el tensor PLE en Q8_0.
- Despliegue en entornos con abundante RAM y almacenamiento NVMe rapido: el modelo encaja en servidores o estaciones de trabajo con 96-128 GB de RAM y disco NVMe, sin necesidad de GPUs de centro de datos.
- Validacion de integridad de checkpoints: el metodo de sustitucion de tensor unico con verificacion byte a byte es aplicable a pipelines internos que necesiten auditar quants derivados de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor unicamente reporta validaciones de integridad (mismo checkpoint de origen, verificacion tensor a tensor de 1224 tensores, comparacion de bytes en offsets de cada tensor) y una prueba funcional de generacion posterior a la sustitucion. No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion estandar, ni metricas de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada: ~24 GB para los tensores del backbone descargados en GPU con `-ngl 99` (validado por el autor en una RTX 4090).
- RAM estimada: entre 96 y 128 GB. La tabla N-gram/PLE (~54 GB en Q8_0) reside en RAM o en SSD NVMe y se accede mediante memory-mapping segun demanda.
- La tabla PLE no debe offloadarse a la GPU: sin la flag `-ot per_layer_token_embd=CPU`, el runtime intenta alojar los ~54 GB de la tabla en VRAM y falla por OOM.
- GPU recomendadas: el autor cita RTX 4090 (24 GB). No se documentan pruebas con A100, H100 ni otras GPU; no disponible.
- Cabe en GPU de consumo: si, el backbone cabe en una RTX 4090, siempre que la tabla PLE se mantenga en CPU/RAM. No cabe integramente en VRAM de ninguna GPU de consumo.
- Espacio en disco: 107,56 GB (UD-IQ3_XXS-NG8) o 115,59 GB (UD-Q3_K_XL-NG8). Es necesario descargar los 4 fragmentos de la variante elegida.
- Opciones de despliegue: `llama.cpp` build > b10660 (probado en b11209), con `--jinja` y la flag obligatoria `-ot per_layer_token_embd=CPU`. No se documenta compatibilidad con vLLM, Ollama, TGI u otros motores en la informacion disponible.
- Ejemplo de invocacion documentado por el autor: `llama-cli.exe -m Qwen3.8-Flash-Next-UD-IQ3_XXS-NG8-00001-of-00004.gguf -p "Diga apenas: OK" -n 8 -c 4096 -ngl 99 -ot per_layer_token_embd=CPU --jinja`.
- Latencia y throughput: no disponible. El acceso a la tabla PLE por memory-mapping desde RAM o NVMe introduce una penalizacion dependiente del hardware de almacenamiento, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables externos en la informacion proporcionada. La comparacion posible es interna, entre las variantes publicadas:

| Variante | Tensores del backbone | Tabla N-gram/PLE | Tamano total | Uso comercial |
|---|---|---|---|---|
| UD-IQ3_XXS-NG8 | IQ3_XXS (Unsloth Dynamic) | Q8_0 | 107,56 GB | Si (Apache-2.0) |
| UD-Q3_K_XL-NG8 | Q3_K_XL (Unsloth Dynamic) | Q8_0 | 115,59 GB | Si (Apache-2.0) |
| Q8_0 oficial (referencia, no distribuido en este repo) | Q8_0 | Q8_0 | ~180 GB | Si (Apache-2.0) |
| Checkpoint original Qwen/Qwen3.8-Flash-Next | Precisión original | Precisión original | no disponible | Si (Apache-2.0) |
| Quants de unsloth/Qwen3.8-Flash-Next-GGUF | IQ3_XXS / Q3_K_XL | Baja precision | no disponible | Si (Apache-2.0) |

La diferencia entre las dos variantes publicadas es de 8,03 GB: UD-Q3_K_XL-NG8 ofrece mayor precision en el backbone a cambio de mayor tamano de archivo y presumiblemente mayor consumo de VRAM y RAM. No se han publicado mediciones de calidad que cuantifiquen esa diferencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no evaluado. Los tensores del backbone siguen cuantizados a 3 bits (IQ3_XXS o Q3_K_XL), por lo que la degradacion respecto al checkpoint original persiste en todo el modelo salvo en la tabla PLE.
- Idiomas: las etiquetas solo declaran portugues e ingles. El comportamiento en castellano u otros idiomas no esta documentado ni garantizado.
- Licencia: Apache-2.0 permite uso comercial, pero exige mantener la atribucion. La tabla PLE y los tensores del backbone cuantizados son trabajo de Unsloth; el modelo original es de Qwen. Este repo solo realiza una sustitucion de tensor.
- Dependencia de runtime estricta: requiere `llama.cpp` build > b10660 y la flag `-ot per_layer_token_embd=CPU`. Omitirla provoca OOM al intentar alojar ~54 GB en VRAM.
- La tabla PLE no debe offloadarse a GPU bajo ninguna circunstancia.
- Necesidad de descargar los 4 fragmentos por variante; los archivos no son utilizables de forma individual.
- El repositorio registra 0 descargas y 0 likes, sin validacion independiente de la comunidad. Toda la validacion procede del propio autor.
- No hay verificacion de terceros sobre la equivalencia funcional entre el build NG8 y el Q8_0 de referencia mas alla del smoke test declarado.
- La model card del autor esta redactada en portugues; no hay version en castellano ni en ingles.
- El acceso a la tabla PLE por memory-mapping desde RAM o NVMe puede degradar la latencia de forma significativa en funcion del almacenamiento, sin cifras publicadas que permitan estimarlo.
- No se documentan garantias de calidad en tareas de codigo, matematicas o razonamiento multi-paso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mduca771/Qwen3.8-Flash-Next-NG8-GGUF
- Quants de origen (Unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Modelo base (Qwen): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Runtime requerido (`llama.cpp`, build > b10660): https://github.com/ggml-org/llama.cpp
