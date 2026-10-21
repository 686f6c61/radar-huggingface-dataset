# gatilin/mammothmoda2_mammothtok_codec

## Resumen

`gatilin/mammothmoda2_mammothtok_codec` es una extracción de componentes: contiene únicamente el códec de imágenes MammothTok del modelo multimodal unificado MammothModa2-Dev, desarrollado por ByteDance Research. El repositorio no es un modelo nuevo ni un fine-tuning, sino un subconjunto de pesos (749 tensores) seleccionado del prefijo `gen_tokenizer.image_tokenizer.*` del checkpoint oficial, con dtypes y bytes preservados. Lo publica el usuario gatilin como pieza reutilizable para pipelines de tokenización visual.

El códec agrupa cuatro piezas: un encoder visual basado en AIMv2, un cuantizador vectorial, un decodificador semántico y un decodificador de reconstrucción RGB. Con 705.414.155 parámetros y un ratio de compresión espacial de 14, convierte una imagen en una rejilla de tokens discretos y puede reconstruirla en RGB o devolver características semánticas. El codebook real almacenado es de 16.384 entradas por 8 canales, aunque el wrapper exterior mencione `codebook_size=32768`.

Su relevancia es práctica: permite experimentar con el tokenizador de MammothModa2 sin cargar el backbone de lenguaje/MoT, el DiT ni el VAE de difusión, que quedan excluidos. Es material de ingeniería para investigar tokenización discreta en modelos multimodales unificados, no un modelo listo para producción de generación de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder visual basado en AIMv2 + cuantizador vectorial + decodificador semantico + decodificador de reconstruccion RGB |
| Parametros totales | 705.414.155 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (tokenizador de imagenes, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors con los dtypes originales |
| Idiomas soportados | No aplica (componente visual sin modulo de lenguaje); no disponible en la model card |
| Licencia | Apache-2.0, con la licencia de software de Apple (AIM_SOURCE_LICENSE) para la implementacion adaptada de AIMv2 |
| Formato de pesos | safetensors (carga via PyTorch), repo de 1,4 GB |
| Numero de tensores | 749 |
| Codebook | 16.384 entradas x 8 canales (forma nativa almacenada) |
| Ratio de compresion espacial | 14 (dimensiones de entrada deben ser divisibles por 14) |
| Entrada | Tensor NCHW; en el ejemplo, 1x3x224x224, que produce una rejilla de 16x16 tokens |
| Salida | Tokens cuantizados, caracteristicas semanticas y reconstruccion RGB |
| Pipeline declarado | image-to-image |
| Modelo base | bytedance-research/MammothModa2-Dev |

## Arquitectura y entrenamiento

El bloque es un tokenizador visual discreto de tipo VQ. La imagen se procesa con un encoder derivado de AIMv2, se proyecta a un espacio latente y se discretiza con un cuantizador vectorial de 16.384 entradas y 8 canales. Desde ahi, dos cabezas separadas cumplen funciones distintas: un decodificador semantico que produce caracteristicas alineadas con el espacio del modelo multimodal, y un decodificador RGB que reconstruye la imagen. El ratio de compresion espacial es 14, de modo que una entrada de 224x224 se reduce a una cuadricula de 16x16.

No se publican datos sobre el entrenamiento original: no hay informacion sobre numero de tokens, composicion del dataset, objetivos de entrenamiento ni si hubo RLHF o DPO, porque el repositorio es una extraccion de pesos y no un entrenamiento nuevo. Lo que si se documenta es la procedencia: los tensores provienen del shard 10 del checkpoint oficial fijado en el commit `461ad0d7d846bd5fa944619b08213a936eee2e30`, se elimina solo ese prefijo y se conservan bytes y dtypes. El autor incluye offsets de origen, SHA-256 por tensor y procedencia del codigo, ademas de un `validate.py` que comprueba carga estricta de las 749 entradas, igualdad de SHA-256 con el payload de origen, forma real del codebook, limites de IDs, paridad de lookup y reconstruccion cuadrada y rectangular con salidas finitas; los resultados se recogen en `validation.json`.

Una advertencia tecnica relevante: la discrepancia entre `codebook_size=32768` del wrapper y las 16.384 entradas reales se resuelve siguiendo la forma nativa almacenada, tanto en la construccion como en la validacion.

## Capacidades

- Tokenizacion discreta de imagenes: `encode(x)` devuelve tokens cuantizados, junto con metadatos del proceso.
- Reconstruccion RGB: `decode(quantized)` devuelve la imagen reconstruida y las caracteristicas semanticas.
- Extraccion de caracteristicas semanticas en el mismo paso de decodificacion.
- Soporte de reconstruccion cuadrada y rectangular, segun las comprobaciones de `validate.py`.
- Integracion como componente dentro de pipelines de imagen a imagen.
- No incluye el backbone de lenguaje/MoT, el DiT ni el VAE de difusion, por lo que no genera texto ni imagenes por si mismo.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Modo thinking, vision de alto nivel o audio: no disponible; la unica modalidad tratada es imagen.

## Casos de uso

- Investigacion en tokenizacion discreta: usar el codec para estudiar como se distribuyen los IDs del codebook sobre un corpus de imagenes y comparar la ocupacion de las 16.384 entradas con otras variantes de VQ, sin necesidad de cargar el modelo completo.
- Prototipado de pipelines imagen a imagen: integrar `encode` y `decode` en un flujo propio para medir la perdida de fidelidad de la reconstruccion RGB antes de invertir en el modelo completo.
- Extraccion de caracteristicas semanticas para tareas de retrieval visual: el decodificador semantico devuelve features que pueden indexarse para busqueda por similitud, con la ventaja de compartir espacio con MammothModa2.
- Evaluacion de compresion espacial: con ratio 14, analizar el compromiso entre numero de tokens (16x16 para 224x224) y calidad de reconstruccion en distintos tamanos y relaciones de aspecto.
- Reproducibilidad y auditoria de checkpoints: el repositorio incluye offsets, SHA-256 por tensor y `validation.py`, lo que permite verificar que un despliegue concreto coincide byte a byte con el checkpoint oficial.
- Desarrollo de un tokenizador sustituto en un MLLM propio: reutilizar este codec como modulo de vision congelado y entrenar el backbone de lenguaje por separado, manteniendo el mismo vocabulario visual.
- Docencia y experimentacion con cuantizacion vectorial: inspeccionar directamente el cuantizador y la paridad de lookup con un modelo de 705 M de parametros que cabe en una sola GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas de calidad de reconstruccion (PSNR, SSIM, FID) en la model card.

Lo unico verificable son las comprobaciones de componentes ejecutadas por el autor, recogidas en `validation.json`:

| Comprobacion | Estado documentado |
|---|---|
| Carga estricta de 749 tensores | Verificada por `validate.py` |
| Igualdad SHA-256 con el payload de origen | Verificada por `validate.py` |
| Forma real del codebook (16.384 x 8) | Verificada por `validate.py` |
| Limites de IDs del codebook | Verificada por `validate.py` |
| Paridad de lookup | Verificada por `validate.py` |
| Reconstruccion cuadrada y rectangular con salidas finitas | Verificada por `validate.py` |
| Calidad downstream (MLLM, generacion de imagen) | No establecida; el autor lo indica explicitamente |

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 705,4 M de parametros: aproximadamente 2,8 GB en fp32, 1,4 GB en bf16/fp16 (coincide con el tamano del repo) y 0,7 GB en int8. Son estimaciones aritmeticas, no medidas publicadas; hay que sumar el pico de activaciones, que depende de la resolucion de entrada.
- Cabe en GPU de consumo: cualquier tarjeta con 4-8 GB de VRAM es suficiente para inferencia en bf16 a resoluciones moderadas (por ejemplo, RTX 3060, RTX 4060, RTX 4090).
- GPU de datacenter (A100, H100) sobredimensionadas para este componente aislado; tienen sentido si se procesan lotes grandes o se integra junto al backbone completo.
- Opciones de despliegue: PyTorch con el `component.load_model(folder)` que proporciona el repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo de lenguaje estas herramientas no aplican directamente.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por imagen ni de imagenes por segundo.
- Requisito de entrada: tensor NCHW con dimensiones divisibles por 14. El ejemplo usa `torch.zeros(1, 3, 224, 224)`, que es un fixture de interfaz, no una receta de preprocesado; la normalizacion de pixeles debe tomarse de `preprocessor_config.json`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de alternativas en la informacion proporcionada. La comparacion se limita a lo que puede afirmarse estructuralmente:

| Modelo | Parametros | Contexto / compresion | Licencia | Disponibilidad |
|---|---|---|---|---|
| MammothTok codec (este repositorio) | 705.414.155 | No aplica contexto; compresion espacial 14, codebook 16.384 x 8 | Apache-2.0 + licencia Apple para AIMv2 | HuggingFace, repo de componentes de 1,4 GB |
| MammothModa2-Dev (modelo base) | No disponible | Incluye backbone de lenguaje/MoT, DiT y VAE de difusion | No disponible en la informacion | HuggingFace, checkpoint oficial |
| Otros tokenizadores VQ de imagen | No disponible | No disponible | No disponible | No evaluados en la informacion disponible |

La diferencia funcional clave frente al modelo base es el alcance: este repositorio aisla el tokenizador y excluye el backbone de lenguaje, el DiT y el VAE de difusion, por lo que no hereda las capacidades generativas del modelo completo.

## Limitaciones y advertencias

- No es un modelo generativo completo: sin el backbone de lenguaje/MoT ni el DiT no puede producir texto ni generar imagenes desde cero.
- El autor advierte explicitamente de que las comprobaciones de componentes no establecen calidad downstream para MLLM ni para generacion de imagen.
- Las dimensiones de entrada deben ser divisibles por 14; no se documenta el comportamiento con otras resoluciones.
- El ejemplo de la model card es un fixture de interfaz con un tensor de ceros, no un ejemplo de preprocesado real; usar `preprocessor_config.json` para la normalizacion de pixeles.
- Discrepancia documentada entre `codebook_size=32768` del wrapper y las 16.384 entradas reales: hay que ceñirse a la forma nativa almacenada o los indices no cuadraran.
- Licencia: los pesos y el codigo principal son Apache-2.0, pero `AIM_SOURCE_LICENSE` mantiene la licencia de software de Apple y sus avisos de copyright para la implementacion adaptada de AIMv2. Es necesario revisar esos terminos antes de un uso comercial.
- Sin datos de sesgos, alucinacion o robustez: no se publican evaluaciones de equidad, sesgo demografico ni comportamiento ante entradas adversarias.
- Sin informacion sobre idiomas ni sobre el dataset de entrenamiento original, lo que impide evaluar la cobertura de dominios visuales.
- Repositorio sin descargas ni likes en el momento de la consulta y con fecha de creacion posterior a la de los modelos de referencia: no hay evidencia de uso en produccion ni de mantenimiento continuado.
- Depende de la ruta de descarga para el `sys.path` del ejemplo; conviene empaquetar el componente antes de integrarlo en un pipeline serio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gatilin/mammothmoda2_mammothtok_codec
- Modelo base: https://huggingface.co/bytedance-research/MammothModa2-Dev
- Checkpoint oficial de origen (commit fijado): https://huggingface.co/bytedance-research/MammothModa2-Dev/tree/461ad0d7d846bd5fa944619b08213a936eee2e30
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia de Apple para AIMv2: referenciada como `AIM_SOURCE_LICENSE` dentro del repositorio; no se proporciona URL en la informacion disponible.
- Resultados de validacion: `validation.json` dentro del repositorio.
