# audreyt/DeepSeek-V4.1-Flash-Abliterated-GGUF

## Resumen

DeepSeek-V4.1-Flash-Abliterated-GGUF es una coleccion de cuantizaciones GGUF de pesos comunitarios derivados de DeepSeek-V4.1-Flash-1017, publicada por el usuario audreyt. No se trata de un modelo original ni de un GGUF generico: los ficheros emplean un layout de tensores, una mezcla de cuantizacion y un empaquetado de tablas Engram especificos de DwarfStar (ds4), la herramienta de inferencia del propio autor. El modelo base es un checkpoint de DeepSeek-V4.1-Flash-1017, un modelo de arquitectura MoE con aproximadamente 754.638 millones de parametros totales segun los metadatos del repositorio.

La particularidad de esta publicacion es doble. Por un lado, incorpora la edicion "abliterated" (eliminacion de la direccion de rechazo en la proyeccion de salida de atencion `attn.wo_b` en los bloques 2 a 39, con fuerza 2,5) heredada de pqhaz/DeepSeek-V4.1-Flash-1017-heretic, lo que reduce drasticamente las respuestas de rechazo del modelo. Por otro lado, el autor ofrece cuatro variantes con distintas cuantizaciones (IQ1_S, Q2 con y sin imatrix) disenadas para ejecutarse en un Mac de 128 GB de memoria unificada, con las tablas Engram (unos 189 GiB) empaquetadas al final del fichero y leidas desde disco bajo demanda.

El interes actual de esta ficha radica en que documenta un caso poco habitual: un modelo de escala frontier (mas de 750.000 millones de parametros) llevado a un formato que cabe, con trucos de streaming y empaquetado, en hardware de consumo de gama alta (Apple Silicon). La licencia es MIT, lo que facilita su uso, aunque las implicaciones de la abliteracion y la dependencia de un runtime no estandar son factores criticos a evaluar antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con tablas Engram; layout de tensores especifico de ds4 (DwarfStar) |
| Parametros totales | 754.638.867.584 (segun metadatos de safetensors del repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 262.144 tokens probados en asignacion de texto (128 GB M5 Max); 393.216 rechazado por el limite de 112 GiB del runtime; 131.072 con sidecar de vision |
| Tipos de cuantizacion | IQ1_S (expertos), Q8_0 (dense y `attn_output_b`), Q6_K/Q5_K (dense de Unsloth), Q2 (variantes imatrix y bootstrap), IQ2_XXS (algunos tensores de Unsloth) |
| Idiomas soportados | no disponible (se mencionan pruebas de humo en ingles y chino tradicional) |
| Licencia | MIT |
| Formato de pesos | GGUF (no generico; especifico de ds4) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con capas de mezcla de expertos (MoE), del que se conoce el numero total de parametros (unos 754.600 millones) pero no el numero de parametros activos por token ni el detalle de la composicion del dataset de entrenamiento original, que no se documenta en la informacion disponible. La innovacion estructural mas relevante que si aparece descrita es la existencia de tablas Engram (dos tablas de aproximadamente 189 GiB en total) que no residen en memoria, sino que se leen desde disco segun se necesitan, lo que exige un SSD local rapido.

Sobre el proceso de cuantizacion, el autor detalla la receta de la variante Q1: los expertos MoE enrutados se toman de unsloth/DeepSeek-V4.1-Flash-1017-GGUF en UD-IQ1_S (88 tensores tal cual y 32 requantizados de IQ2_XXS a IQ1_S con la imatrix de Unsloth para ajustarse al presupuesto de 112 GiB de ds4); los pesos dense provienen de Unsloth (principalmente Q6_K/Q5_K); la proyeccion de salida de atencion `attn_output_b` se cuantiza en Q8_0 con los 38 tensores abliterados del checkpoint de pqhaz; y el resto, incluidas las tablas Engram, procede del Q2 nativo de ds4 sin cambios. La variante Maya-XS copia 120 tensores IQ1_S de expertos y 339 tensores Q8 dense sin recuantizar. No se documenta en la informacion disponible si hubo RLHF, DPO u otra fase de alineamiento posterior al entrenamiento base.

## Capacidades

- Generacion de texto y continuacion de secuencias con contexto muy largo (hasta 262.144 tokens en pruebas de asignacion de texto).
- Razonamiento y conocimiento general heredados del checkpoint DeepSeek-V4.1-Flash-1017, aunque no se aportan benchmarks de capacidades especificos de esta version.
- Capacidad multimodal: la variante Q1 conserva los metadatos del 1017 original, por lo que empareja con el sidecar de vision `DeepSeek-V4.1-Flash-1017-Vision.gguf`. En las pruebas con vision y candor steering se valido una asignacion de contexto de 131.072 tokens.
- Recuperacion de informacion en contexto largo: el autor reporta que un prompt de 10.237 tokens recupero correctamente su codigo de verificacion.
- Soporte multilingue parcial verificado: pruebas de humo en ingles y chino tradicional.
- Modo abliterated: eliminacion de la direccion de rechazo en 38 tensores, con reduccion de rechazos en held-out con razonamiento de 92/100 a 1/100 segun pqhaz, y KL de 0,136 en prompts inofensivos.
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso en la informacion disponible.

## Casos de uso

- Investigacion de seguridad y alineamiento: el modelo permite estudiar el efecto de la abliteracion sobre la direccion de rechazo en un modelo de escala frontier, comparando el checkpoint heretic con el original y midiendo el impacto en capacidades y sesgos.
- Evaluacion de cuantizaciones extremas: investigadores pueden usar las variantes IQ1_S y Q2 para medir la perdida de calidad (NLL, acuerdo con API) frente a pesos de mayor precision en un modelo de 754.000 millones de parametros.
- Inferencia local en Apple Silicon: con un Mac de 128 GB de memoria unificada (por ejemplo, M5 Max), la variante Maya-XS o Q1 mantiene unos 107 GiB de pesos residentes y permite ejecutar el modelo con contexto de hasta 262.144 tokens sin streaming de SSD.
- Prototipado de asistentes con contexto largo: el modelo puede procesar prompts de decenas de miles de tokens y recuperar informacion concreta (probado con un prompt de 10.237 tokens), util para resumir documentacion tecnica extensa o analizar repositorios completos.
- Experimentacion multimodal: emparejado con el sidecar de vision, permite probar flujos de imagen y texto con contexto de 131.072 tokens, adecuado para prototipos de analisis de documentos escaneados.
- Generacion creativa sin restricciones: la eliminacion del comportamiento de rechazo lo hace util para entornos de escritura creativa o roleplay donde el modelo original declinaria peticiones, siempre que se apliquen las salvaguardas externas oportunas.
- Benchmarking de runtimes: sirve como caso de prueba exigente para ds4 y para comparar estrategias de empaquetado de tablas Engram y streaming desde disco frente a otras soluciones de inferencia.

## Benchmarks y rendimiento

El autor publica mediciones de calidad y velocidad de la variante Maya-XS frente a la Q1 antigua, sobre 100 fixtures de continuacion de septiembre de V4.1 (6.160 tokens). Las fixtures permiten una comparacion relativa, no una medicion de fidelidad frente a los pesos originales 1017; el fichero Maya abliterado no ha pasado la suite completa de evaluacion.

| Medicion | Q1 antigua | Maya-XS |
|---|---:|---:|
| NLL medio del token objetivo (menor es mejor) | 0,620629834 | 0,519230866 |
| Acuerdo con el token superior de la API | 83,72% | 86,58% |
| Decodificacion emparejada en ingles (tokens/s) | 37,99 | 37,24 |

El NLL fue un 16,34% inferior en Maya-XS. El acuerdo con la API excluye el caso_047 por un desajuste de tokenizer documentado (99 casos alineados). La velocidad corresponde a una muestra unica de CLI en un M5 Max de 128 GB, sin vision.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: la variante Maya-XS y la Q1 mantienen unos 107,35 GiB y ~106 GiB de pesos residentes respectivamente, totalmente residentes en Metal con un Mac de 128 GB. Las variantes Q2 (imatrix y bootstrap) requieren 152 GiB residentes y necesitan `--ssd-streaming`.
- GPU recomendadas: Apple Silicon de 128 GB de memoria unificada (M5 Max validado por el autor). No se documentan pruebas en A100, H100 ni RTX 4090; por el tamano de los pesos, no caben en GPUs de consumo convencionales sin streaming agresivo.
- Cabe en consumer GPU: no en el sentido habitual; solo en equipos Apple Silicon de 128 GB con el runtime ds4 y, en las variantes Q2, con streaming desde SSD.
- Almacenamiento: los cuatro ficheros pesan 365.713.686.528 bytes cada uno; la velocidad del SSD local es critica porque las tablas Engram (unos 189 GiB) se leen desde disco bajo demanda.
- Opciones de despliegue: exclusivamente ds4 (DwarfStar), en concreto audreyt/ds4 en el commit `0dff39f91721bcf3472813c6d2bebf9353df2a1a` o posterior para Q8 embeddings, pesos de compresor e indexador; `d3f4cd6` o posterior para IQ1_S y Q5_K/Q6_K dense. No es compatible con llama.cpp, vLLM, Ollama ni TGI.
- Ajustes: es necesario elevar el limite de memoria cableada de Metal. La asignacion de 393.216 tokens fue rechazada por el limite de 112 GiB del runtime.
- Latencia y throughput: aproximadamente 37,2 tokens/s en decodificacion emparejada en ingles sobre un M5 Max de 128 GB (sin vision), segun la muestra del autor.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| audreyt/DeepSeek-V4.1-Flash-Abliterated-GGUF (esta ficha) | ~754.600 M | 262.144 (probado en asignacion) | GGUF especifico de ds4 | MIT | Hugging Face, ~67.700 descargas |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (original) | no disponible | no disponible | safetensors u otros formatos nativos | no disponible en la informacion | Hugging Face |
| pqhaz/DeepSeek-V4.1-Flash-1017-heretic | no disponible | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| peasantsmith/DeepSeek-V4.1-Flash-1017-Maya-GGUF | no disponible | no disponible | GGUF | no disponible en la informacion | Hugging Face |
| unsloth/DeepSeek-V4.1-Flash-1017-GGUF | no disponible | no disponible | GGUF (UD-IQ1_S, IQ2_XXS, etc.) | no disponible en la informacion | Hugging Face |

La comparacion cuantitativa de rendimiento entre estas variantes no esta disponible mas alla de las mediciones NLL y acuerdo con la API entre Q1 antigua y Maya-XS incluidas en la model card.

## Limitaciones y advertencias

- La abliteracion modifica el comportamiento del modelo eliminando la direccion de rechazo; puede producir contenido inapropiado, peligroso o sin filtros, y no se han publicado benchmarks de capacidades que garanticen que el resto del rendimiento se mantiene intacto.
- El autor reconoce que las fixtures de evaluacion permiten una comparacion relativa y no miden fidelidad frente a los pesos originales 1017; el fichero Maya abliterado no ha pasado la suite completa de evaluacion.
- Riesgo de alucinacion: no se documenta ningun mecanismo de mitigacion ni evaluacion especifica en la informacion disponible.
- La cuantizacion IQ1_S y la recuantizacion de tensores ya cuantizados (32 tensores de IQ2_XXS a IQ1_S en la variante Q1) pueden degradar la calidad respecto a los pesos originales.
- Dependencia critica de un runtime no estandar: los GGUF no son genericos y solo funcionan con ds4, una herramienta mantenida por el propio autor; no hay soporte en llama.cpp, vLLM, Ollama ni TGI.
- Requisitos de hardware muy restrictivos: al menos 128 GB de memoria unificada en Apple Silicon para las variantes residentes, y SSD rapido para las tablas Engram en todas las variantes.
- Idiomas soportados no documentados oficialmente; solo se verifican pruebas de humo en ingles y chino tradicional.
- Licencia MIT declarada por el autor de la cuantizacion, pero no se detallan las condiciones de los checkpoints base de DeepSeek ni de las ediciones comunitarias intermedias, lo que conviene revisar antes de un uso comercial.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en pipelines de produccion sin validacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/audreyt/DeepSeek-V4.1-Flash-Abliterated-GGUF
- Runtime DwarfStar: https://github.com/antirez/ds4
- Runtime audreyt/ds4: https://github.com/audreyt/ds4
- Modelo original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Checkpoint heretic: https://huggingface.co/pqhaz/DeepSeek-V4.1-Flash-1017-heretic
- Checkpoint abliterated: https://huggingface.co/s-zaizen/DeepSeek-V4.1-Flash-Abliterated
- Cuantizacion Maya: https://huggingface.co/peasantsmith/DeepSeek-V4.1-Flash-1017-Maya-GGUF
- GGUF Q2 nativo: https://huggingface.co/audreyt/deepseek-v4.1-flash-1017-gguf
- GGUF de Unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
