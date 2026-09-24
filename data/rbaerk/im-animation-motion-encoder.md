# Rbaerk/IM-Animation-Motion-Encoder

## Resumen

IM-Animation-Motion-Encoder es un codificador de movimiento a nivel de fotograma publicado por el usuario Rbaerk como parte del proyecto IM-Animation ("An Implicit Motion Representation for Identity-decoupled Character Animation"). Se trata de un componente de visión por computador, no de un modelo de lenguaje: convierte fotogramas RGB de 256×256 en 32 tokens latentes de 12 dimensiones cada uno (384 dimensiones por fotograma), que después se utilizan como representación implícita de movimiento. La arquitectura es un TiTokEncoder, es decir, un transformer de 24 capas con anchura oculta 1024, 16 cabezales de atención, parches de tamaño 16 y un codebook de cuantización vectorial de 4096 entradas.

Su relevancia es acotada y muy específica: el repositorio libera únicamente el codificador y un checkpoint exportado, no el generador de animación completo ni la red de retargeting. Esto lo convierte en una pieza de investigación útil para reproducir o integrar la fase de tokenización de movimiento dentro de un pipeline mayor, pero no en un modelo listo para producto por sí solo. Los pesos se distribuyen en BF16 mediante `safetensors` y se han verificado contra la implementación original de TiTok a nivel de fotograma único.

El proyecto declara licencia Apache 2.0 y construcción sobre TiTok / 1d-tokenizer de ByteDance. Con 5 descargas y 0 "likes" en el momento de redactar esta ficha, la validación comunitaria es prácticamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TiTokEncoder (transformer): 24 capas, anchura oculta 1024, 16 cabezales de atencion, patch size 16, 32 tokens latentes aprendidos, proyeccion de salida de 12 dimensiones y codebook VQ de 4096 entradas |
| Parametros totales | Aproximadamente 303 millones (estimacion derivada del tamano del checkpoint: 607.017.208 bytes en BF16 / 2 bytes por parametro). No confirmado explicitamente en la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de un LLM. El encoder procesa cada fotograma de forma independiente y devuelve 32 tokens latentes por fotograma; la agregacion temporal (retargeting) queda fuera de este release |
| Tipos de cuantizacion | Pesos exportados en BF16. La unica cuantizacion documentada es interna al modelo (codebook VQ de 4096 entradas). No se documentan GGUF, INT8, INT4 ni similares |
| Idiomas soportados | en (segun metadatos del repositorio; el modelo no procesa texto, por lo que el campo es practicamente informativo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, fichero `motion_encoder_latest.safetensors`, 607.017.208 bytes / ~579 MiB) |
| Entrada | Tensor RGB normalizado a [0, 1] con forma [N, 3, 256, 256] |
| Salida | Tokens con forma [1, 12, 1, 32] por fotograma (32 tokens de 12 dimensiones) |
| Tamano del repositorio | 0,6 GB |
| Pipeline declarado | image-feature-extraction |

## Arquitectura y entrenamiento

El modulo es un TiTokEncoder, una variante de transformer con tokenizacion 1D tomada de TiTok / 1d-tokenizer. La imagen de entrada se divide en parches de 16×16 y se combina con 32 tokens latentes aprendidos; tras 24 capas de atencion con anchura 1024 y 16 cabezales, una proyeccion de 12 dimensiones produce los tokens de movimiento, que se cuantizan contra un codebook VQ de 4096 entradas. El preprocesado de entrenamiento rellena horizontalmente los fotogramas en vertical hasta dejarlos cuadrados y los reescala a 256×256 con interpolacion bilineal (`align_corners=False`); la clase original `HW_encoder_2` se incluye en `encoder_blocks.py`. Se conserva el `reshape` original de tokens con `is_legacy=True` por compatibilidad con el checkpoint.

La informacion sobre el entrenamiento es limitada y en parte se refiere a la procedencia del checkpoint, no al procedimiento completo. El checkpoint seleccionado es `train_dit_5C_v6_part5/step-12200.safetensors`, con fecha de modificacion del 28 de noviembre de 2025, descrito por el autor como el mas reciente de las ejecuciones locales inspeccionadas y no como el de mejor calidad ni como el definitivo del paper. El entrenamiento guardo unicamente parametros entrenables: el checkpoint aporta 300 tensores de encoder y tokens latentes, y el codebook VQ congelado se restaura desde `train_motion_only_full_3C_20joint/step-3700.safetensors` siguiendo el codigo de inicializacion disponible, dando un modulo completo de 301 tensores. El autor advierte que el estado congelado de esa ejecucion historica no se ha verificado de forma independiente. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La validacion realizada incluye comprobacion de hashes de bytes de los tensores frente a sus checkpoints de origen, carga estricta del `state_dict` y coincidencia exacta de la salida de un fotograma frente a la implementacion original de TiTok; la calidad de generacion de video completa no se evaluo en esta exportacion.

## Capacidades

- Extraccion de caracteristicas de imagen: convierte fotogramas RGB de 256×256 en representaciones latentes compactas.
- Tokenizacion de movimiento: genera 32 tokens de 12 dimensiones por fotograma, que el pipeline de entrenamiento aplana a 384 dimensiones antes del retargeting.
- Codificacion por fotograma: procesa cada fotograma de forma independiente, sin modelado temporal.
- Integracion como componente de un DiT: los tokens producidos alimentan la etapa de generacion del sistema IM-Animation completo (no incluido en este repositorio).
- Ejecucion en CPU y GPU: el autor verifico el encoder en CPU con PyTorch 2.7.1 sobre los pesos BF16 exportados.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No incluye capacidades multilingues (no procesa lenguaje).
- No incluye el generador de animacion ni la red de retargeting, por lo que no produce video ni animacion de personajes por si mismo.

## Casos de uso

- Tokenizacion en pipelines de animacion de personajes: el encoder produce representaciones de movimiento de 384 dimensiones por fotograma que se pueden inyectar en un generador tipo DiT, tal y como hace el sistema IM-Animation completo, para animar un personaje manteniendo la identidad.
- Cache de latentes en entrenamiento: al ser un encoder ligero (~0,6 GB en BF16) y determinista, permite precalcular y almacenar los tokens de un dataset de fotogramas una sola vez y reutilizarlos en sucesivas epocas de entrenamiento de la red de retargeting, reduciendo el coste de la fase de codificacion.
- Extraccion de caracteristicas para recuperacion o clasificacion de movimiento: los 32 tokens de 12 dimensiones por fotograma sirven como descriptor compacto para tareas de busqueda de clips similares o clasificacion de acciones, sin necesidad de entrenar un extractor desde cero.
- Investigacion en representaciones implicitas de movimiento: el repositorio separa `motion_encoder.py`, `encoder_blocks.py` y `quantizer.py`, lo que facilita experimentar con el codebook VQ, el numero de tokens latentes o el tamano de parche manteniendo la compatibilidad de carga.
- Reproducibilidad y comparacion de tokenizadores: al haberse verificado la coincidencia de salida con la implementacion original de TiTok en un fotograma, sirve como linea base controlada para comparar variantes de tokenizacion 1D aplicadas a video o movimiento.
- Compresion de representaciones de video: 32 tokens de 12 dimensiones por fotograma son una representacion mucho mas compacta que el fotograma original, util para almacenar o transmitir informacion de movimiento en lugar de pixeles.
- Analisis offline de captura de movimiento: en flujos donde ya existe captura de movimiento, el encoder puede utilizarse para obtener una representacion latente consistente de los fotogramas asociados, aunque la conversion a huesos (retargeting) debe implementarse aparte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (FID, FVD, precision de reconstruccion u otras), y el autor indica explicitamente que la calidad de generacion de video completa no se evaluo en esta exportacion. Lo unico documentado es la validacion funcional: comprobacion de hashes de bytes de los tensores, carga estricta del `state_dict` y coincidencia exacta de la salida de un unico fotograma con la implementacion original de TiTok.

| Prueba de validacion | Resultado |
|---|---|
| Coincidencia de hashes de tensores con los checkpoints de origen | Verificada |
| Carga estricta del state_dict (301 tensores) | Correcta |
| Coincidencia de salida en fotograma unico frente a TiTok original | Exacta |
| Calidad de generacion de video | No evaluada |
| Metricas estandar (FID, FVD, PSNR, etc.) | No disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia: el peso del checkpoint es de ~579 MiB (607.017.208 bytes) en BF16. Con memoria de activaciones para entradas de 256×256 y lotes pequenos, el consumo se mantiene por debajo de 1 GB en BF16; no hay cifra oficial publicada.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre. El modelo cabe sin problemas en GTX 1650, RTX 3060, RTX 4090, A100 o H100; no requiere hardware de gama alta.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales e incluso en GPUs integradas con suficiente memoria compartida.
- CPU: el autor verifico explicitamente la ejecucion en CPU con PyTorch 2.7.1 y pesos BF16, por lo que la inferencia sin GPU es viable.
- Opciones de despliegue: carga directa con PyTorch y `safetensors` (el propio codigo del repositorio usa `MotionEncoder.from_pretrained(device="cpu" | "cuda")`) y descarga via `huggingface_hub`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles. La informacion proporcionada no incluye tiempos de inferencia ni fotogramas por segundo.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el componente del que deriva directamente, TiTok / 1d-tokenizer, ya que el autor no ofrece comparaciones con otras alternativas.

| Modelo | Categoria | Arquitectura | Tokens por entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IM-Animation-Motion-Encoder | Encoder de movimiento por fotograma | TiTokEncoder, 24 capas, hidden 1024, 16 cabezales, patch 16, codebook VQ 4096 | 32 tokens de 12 dimensiones | Apache 2.0 | Pesos en HuggingFace, codigo en GitHub |
| TiTok / 1d-tokenizer (ByteDance) | Tokenizador de imagen 1D | Transformer con tokens latentes y VQ | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Repositorio publico en GitHub |
| Otros tokenizadores de video o movimiento (VQGAN, etc.) | Tokenizacion visual | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Release parcial: no incluye el generador de animacion completo ni la red de retargeting, por lo que no es posible producir animaciones de personajes solo con este repositorio.
- Sin modelado temporal: el encoder procesa fotogramas independientes; cualquier coherencia temporal debe aportarla una etapa externa no incluida.
- Resolucion fija: la entrada debe ser RGB, normalizada a [0, 1] y con forma [N, 3, 256, 256]; el preprocesado original rellena los fotogramas verticales hasta dejarlos cuadrados y reescala, lo que puede introducir distorsion si se aplica a otras relaciones de aspecto.
- Checkpoint no verificado como final: el autor indica que el checkpoint seleccionado es el mas reciente de sus ejecuciones locales, no el de mejor calidad ni el definitivo del paper.
- Codebook heredado: el codebook VQ congelado procede de una ejecucion de entrenamiento distinta (`train_motion_only_full_3C_20joint/step-3700.safetensors`) y su estado congelado no se ha verificado de forma independiente.
- Ausencia de benchmarks de calidad: no hay metricas publicadas de fidelidad de reconstruccion, calidad de animacion ni comparaciones con alternativas, por lo que no es posible estimar su rendimiento real en produccion.
- Riesgo de alucinacion: no aplica en el sentido habitual, ya que no es un modelo generativo de lenguaje; el riesgo equivalente es la perdida de fidelidad en la representacion del movimiento al comprimir cada fotograma en 32 tokens de 12 dimensiones.
- Sesgos: no documentados. Al no publicarse la composicion del dataset de entrenamiento, no se puede evaluar el sesgo respecto a tipos de cuerpo, etnias, vestimenta o escenarios.
- Idioma: los metadatos declaran unicamente ingles, dato irrelevante para un encoder visual.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar la atribucion y revisar `LICENSE` y `NOTICE`, asi como respetar la licencia del proyecto upstream TiTok / 1d-tokenizer del que deriva el codigo.
- Madurez: 5 descargas y 0 "likes" en el momento de esta ficha; no hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rbaerk/IM-Animation-Motion-Encoder
- Paper (arXiv:2602.07498): https://arxiv.org/abs/2602.07498
- Pagina del proyecto: https://rabberk.github.io/IM-Animation/
- Repositorio de codigo: https://github.com/rabberk/IM-Animation
- Proyecto upstream TiTok / 1d-tokenizer: https://github.com/bytedance/1d-tokenizer
