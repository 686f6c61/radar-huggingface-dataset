# agentmessier/Inkling-2-Mini-bf16

## Resumen

Inkling-2-Mini-bf16 es una copia no oficial en bf16 del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario agentmessier en Hugging Face. El modelo original lo desarrolla Thinking Machines Lab y esta orientado a tareas multimodales de imagen y texto (pipeline image-text-to-text), con una arquitectura de mezcla de expertos (MoE) identificada en la libreria como `inkling2_loop`. Esta version concreta no introduce cambios funcionales: se limita a descomprimir los pesos de los expertos del checkpoint original, que estaban almacenados en NVFP4 (capas 0-19) y MXFP8 (capas 20-23), a bf16 plano.

La relevancia de esta copia es practica: el checkpoint original pesa aproximadamente 20 GB y requiere el soporte de cuantizacion especifico de transformers (>= 5.24) o vLLM para cargarse, mientras que esta version ofrece pesos bf16 directos de unos 50 GB, pensados para fine-tuning o para codigo de investigacion que necesite tensores sin cuantizar. El modelo cuenta con 26.388.641.280 parametros totales segun los safetensors publicados, licencia Apache 2.0 y un unico commit de fecha 2026-11-24.

No se dispone de informacion sobre la longitud de contexto, los idiomas soportados ni los datos de entrenamiento en la informacion proporcionada; la model card remite a la ficha del modelo original para esos detalles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), implementacion `Inkling2Loop` en transformers; transformer multimodal imagen-texto |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Esta copia: bf16 (pesos planos). Original: NVFP4 (capas 0-19) y MXFP8 (capas 20-23) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeta ademas a la politica de uso aceptable de Thinking Machines Lab) |
| Formato de pesos | safetensors (mas `mtp.safetensors`, tokenizer, processor y chat template) |
| Tamano del repositorio | 53,4 GB (original: aproximadamente 20 GB) |
| Libreria | transformers >= 5.24.0 |
| Modelo base | thinkingmachines/Inkling-2-Mini (revision 7a67ae2314b44ef05c87fd1d4d311c58aaeb18f6) |
| Fecha de publicacion | 2026-11-24 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), identificado por el tag `moe` y por la clase `Inkling2Loop` que transformers utiliza para cargarlo. El checkpoint original distribuye los pesos de los expertos en dos esquemas de cuantizacion por bloques: NVFP4 en las capas 0-19 (valores e2m1 con escalas de bloque fp8-e4m3 y un factor por tensor) y MXFP8 en las capas 20-23 (valores e4m3 con escalas de bloque potencia de dos). Esta copia descomprime unicamente esos tensores de expertos a bf16; el resto de tensores se copia tal cual (bf16 se mantiene bf16 y los tensores fp32 pequenos siguen en fp32). Se eliminan los bloques de cuantizacion de `config.json` y `hf_quant_config.json`, y se conservan los nombres de tensor y el layout de pesos de los expertos originales.

La conversion sigue la descomprobacion de referencia de vLLM (`tests/models/inkling2/test_moe.py`, commit `65ada0c40`): los valores NVFP4 se multiplican por las escalas de bloque en fp32 exacto y por el factor por tensor en float64, redondeando una sola vez a bf16. Segun el autor, los 20.400 millones de valores NVFP4 resultantes coinciden exactamente con lo que transformers (>= 5.24) produce al descomprimir el checkpoint original en carga. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden a la ficha del modelo original, que no se ha proporcionado.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), es decir, entrada multimodal con imagenes acompanadas de instrucciones textuales.
- Razonamiento y respuesta sobre el contenido de imagenes, segun la modalidad declarada por el pipeline.
- Pesos bf16 listos para fine-tuning e investigacion sin capa de cuantizacion intermedia.
- Compatibilidad con transformers >= 5.24.0 mediante la clase `Inkling2Loop`.
- Soporte de plantilla de chat incluida en el repositorio (chat template copiada del original).
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, modo thinking, audio u otras capacidades especiales.

## Casos de uso

- Fine-tuning supervisado en bf16: al eliminar la cuantizacion NVFP4/MXFP8 de los expertos, los frameworks de entrenamiento estandar pueden aplicar gradientes y actualizaciones sobre pesos planos sin necesidad de capas de descompresion personalizadas.
- Investigacion de arquitecturas MoE: permite inspeccionar y analizar los pesos de los expertos en bf16, comparar su distribucion y estudiar el enrutamiento sin lidiar con formatos de bloque propietarios.
- Experimentos de destilacion o merging: los pesos bf16 son directamente combinables con tecnicas de model merging y con pipelines que esperan safetensors en coma flotante.
- Evaluacion de calidad de cuantizacion: sirve como referencia de alta precision para medir la perdida que introduce el checkpoint original NVFP4/MXFP8 frente a bf16 en tareas concretas.
- Prototipado de asistentes multimodales en entorno de investigacion: carga con transformers y permite probar flujos imagen-texto con la plantilla de chat incluida.
- Reproduccion de resultados: el autor documenta una comprobacion con 200 preguntas de opcion multiple (194/200 coincidencias de opcion top y diferencia media absoluta de probabilidad de 0,013 frente al original en transformers), util para validar pipelines propios contra esa referencia.
- Generacion de datos sinteticos a partir de imagenes en entornos controlados donde se requiere maxima fidelidad numerica respecto al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion es la comprobacion de equivalencia realizada por el autor:

| Comparacion | Misma opcion top | Diferencia media absoluta de probabilidad |
|---|---|---|
| Copia bf16 vs original, ambos en transformers 5.24.1 | 194 / 200 | 0,013 |
| Copia bf16 (transformers) vs original en vLLM | 192 / 200 | 0,021 |
| Original en transformers vs original en vLLM | 192 / 200 | 0,020 |

El autor senala que transformers construye pesos identicos desde ambos directorios, por lo que la diferencia de la primera fila no se atribuye a la conversion y su origen no se ha aislado (no se midio la variabilidad entre ejecuciones del mismo modelo). Las generaciones cortas en modo greedy fueron identicas entre la copia bf16 y el original en transformers.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos bf16 ocupan aproximadamente 52,8 GB (26.388.641.280 parametros x 2 bytes), a los que hay que sumar cache KV, activaciones y overhead del runtime; en la practica se necesita un nodo con al menos 80 GB de VRAM para una carga comoda.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o configuraciones multi-GPU. En GPUs de 48 GB o menos no cabe sin cuantizar de nuevo.
- GPU de consumo: no cabe en RTX 4090 (24 GB), RTX 5090 (32 GB) ni en ninguna consumer actual sin volver a cuantizar a 8 o 4 bits, lo que anularia la ventaja de esta copia.
- Opciones de despliegue: transformers >= 5.24.0 con `Inkling2Loop` es la via soportada. vLLM (a fecha del commit `65ada0c40`, 2026-11-24) no carga los expertos bf16 de Inkling2; para servir el modelo con vLLM debe usarse el checkpoint original NVFP4/MXFP8. No se dispone de informacion sobre soporte en llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada. La comparacion natural es contra el checkpoint original del que deriva:

| Modelo | Parametros | Formato de expertos | Tamano en disco | Licencia | Carga en vLLM |
|---|---|---|---|---|---|
| agentmessier/Inkling-2-Mini-bf16 | 26,39 B | bf16 | ~53,4 GB | Apache 2.0 | No (a fecha del commit indicado) |
| thinkingmachines/Inkling-2-Mini | 26,39 B | NVFP4 (capas 0-19) + MXFP8 (capas 20-23) | ~20 GB | Apache 2.0 | Si |

No se dispone de datos para comparar con alternativas de otros desarrolladores (parametros, contexto, rendimiento o disponibilidad).

## Limitaciones y advertencias

- Copia no oficial: no esta creada, revisada ni respaldada por Thinking Machines Lab; la documentacion de uso previsto, limitaciones y politica de uso aceptable debe consultarse en la ficha del modelo original.
- Requiere transformers >= 5.24.0; versiones anteriores no cargan la clase `Inkling2Loop`.
- Incompatible con vLLM en su estado actual para los expertos bf16, lo que limita el despliegue en produccion de alto rendimiento con esta copia.
- Huella de memoria muy superior al original (aproximadamente 53,4 GB frente a 20 GB), lo que excluye GPUs de consumo y encarece el almacenamiento y la transferencia.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion, limitaciones de contexto o cobertura idiomatica; deben consultarse en la ficha del modelo original.
- La licencia Apache 2.0 permite uso comercial, pero el uso queda ademas sujeto a la politica de uso aceptable de Thinking Machines Lab enlazada desde la tarjeta original.
- La equivalencia numerica con el original esta verificada solo mediante una prueba de 200 preguntas de opcion multiple y generaciones cortas en greedy; no hay validacion publicada en tareas generativas largas ni multimodales.
- El modelo tiene un volumen de descargas muy bajo (2 en el momento de la consulta) y ningun like, por lo que no cuenta con validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentmessier/Inkling-2-Mini-bf16
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revision del modelo base: 7a67ae2314b44ef05c87fd1d4d311c58aaeb18f6
- Referencia de descomprobacion en vLLM: `tests/models/inkling2/test_moe.py`, commit `65ada0c40` (repositorio de vLLM)
- Politica de uso aceptable de Thinking Machines Lab: enlazada desde la tarjeta del modelo original
