# jungroo-ai/redefiner-0.8b

## Resumen

ReDefiNER 0.8B es un modelo especializado en extraccion de entidades nombradas (NER) y etiquetado de spans (span labeling) desarrollado por jungroo-ai. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-0.8B, con 755.675.585 parametros totales, orientado a tareas de information extraction controladas mediante "rulebooks" redactados en ingles plano. El modelo no es generativo: devuelve spans del texto de entrada con su tipo y una puntuacion de confianza, lo que lo diferencia de aproximaciones basadas en LLM generativos para NER.

Su propuesta tecnica central es que el comportamiento del modelo se modifica editando el rulebook (hasta aproximadamente 10.000 tokens probados), sin reentrenar pesos. Esto permite reutilizar un unico checkpoint para distintos esquemas de extraccion (por ejemplo, un esquema de privacidad frente a uno de producto sobre el mismo ticket de soporte). El modelo incorpora cabezas propias de span y label, por lo que requiere el paquete `redefiner` en lugar de cargarse directamente con `transformers`.

Es relevante porque demuestra que un modelo de 0,8B puede competir con sistemas mucho mayores en NER zero-shot: reporta 59,8 F1 en los 13 conjuntos GoLLIE frente a 58,1 de GoLLIE 34B, y 63,1 en 7 conjuntos CrossNER y MIT frente a 61,7 de GLiNER large. Ademas, esta disenado para ejecutarse en CPU, con licencia Apache-2.0, lo que lo hace atractivo para despliegues de extraccion de informacion con requisitos de privacidad y coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning de Qwen/Qwen3.5-0.8B) con cabezas propias de span y label |
| Parametros totales | 755.675.585 (0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Rulebooks de hasta aproximadamente 10.000 tokens; el texto se procesa en ventanas de 256 tokens con solapamiento automatico |
| Tipos de cuantizacion | int8 (un unico fichero de 0,77 GB); 8-bit segun tags del repo |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ReDefiNER parte de Qwen/Qwen3.5-0.8B y anade cabezas especificas de deteccion de spans y clasificacion de etiquetas, por lo que el pipeline de carga no es el estandar de `transformers` sino el del paquete `redefiner`. El modelo opera en dos modos: `extract`, que localiza y etiqueta spans en el texto, y `label`, que asigna etiquetas a spans ya proporcionados por el usuario. La salida no es generativa: cada span devuelto incluye `start`, `end`, `text`, `label` y `confidence`, calculada como el producto de la probabilidad del span y la probabilidad del tipo.

El control del comportamiento se realiza mediante un rulebook en texto plano con secciones `[RULES]`, `[TYPE]` y `[DESCRIPTION]`, y reglas opcionales etiquetadas (por ejemplo `PE1`) que modifican la delimitacion de spans. Los autores indican que el modelo fue entrenado para seguir estas reglas sin reentrenamiento, lo que constituye la innovacion principal frente a esquemas NER fijos. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El modelo se distribuye como un unico fichero int8 de 0,77 GB y soporta aceleracion GPU mediante kernels de flash-linear-attention en Linux.

## Capacidades

- Extraccion de entidades nombradas zero-shot guiada por rulebook en ingles plano, con tipos definidos por el usuario.
- Etiquetado de spans preexistentes (`Tagger.label`) ademas de extraccion (`Tagger.extract`).
- Seguimiento de reglas explicitas de delimitacion de spans (por ejemplo, excluir titulos como "Dr" o "Prof" de un nombre de persona).
- Soporte de rulebooks extensos, de hasta aproximadamente 10.000 tokens, con multiples tipos y descripciones.
- Procesamiento de textos largos mediante division automatica en ventanas de 256 tokens.
- Salida con puntuaciones de confianza por span y etiqueta, util para umbrales y revision humana.
- Parametros ajustables de inferencia: `threshold` (por defecto 0,5) y `none_bias` (por defecto 2).
- Interfaz Python (`Tagger.extract`, `Tagger.label`) y servidor HTTP local (`redefiner serve`).
- Ejecucion en CPU sin GPU, y en GPU NVIDIA con CUDA.
- Capacidad multilingue: no disponible (solo ingles declarado).
- Tool calling, agentes y razonamiento multi-paso: no disponible (modelo no generativo).

## Casos de uso

- Anonimizacion y cumplimiento de privacidad: definir un rulebook con tipos PERSON, ACCOUNT_ID, EMAIL y PHONE para detectar datos personales en tickets de soporte antes de almacenarlos o compartirlos, con la ventaja de que el modelo corre en CPU y los datos no salen de la infraestructura propia.
- Extraccion de entidades de dominio en documentacion tecnica: un rulebook con PRODUCT, VERSION, DEVICE y ERROR_CODE permite estructurar incidencias de soporte en campos explotables por un sistema de ticketing, reutilizando el mismo checkpoint que el equipo de privacidad.
- Enriquecimiento de pipelines de datos: procesar lotes de textos en GPU (aproximadamente 0,38 s para 16 textos en una A10 con rulebook de 2.000 tokens) para poblar indices de busqueda o bases de datos con entidades etiquetadas.
- Etiquetado asistido para anotacion humana: usar `Tagger.label` sobre spans previamente segmentados para preasignar tipos con confianza (por ejemplo 1,0 y 0,997 en el ejemplo de la model card), reduciendo el coste de anotacion manual.
- Extraccion de entidades en entornos con recursos limitados: despliegue en servidores de 4 nucleos o en un Apple M2 con 2-2,6 GB de memoria pico y latencias de 0,4-0,7 s por frase, sin necesidad de GPU.
- Normalizacion de esquemas de extraccion por equipo: distintos equipos (legal, producto, soporte) mantienen rulebooks separados sobre el mismo modelo, evitando mantener varios modelos fine-tuneados por dominio.
- Clasificacion de menciones en textos cientificos o administrativos: definir tipos como ORGANIZATION o PERSON con reglas de delimitacion para extraer entidades de informes y articulos en ingles.

## Benchmarks y rendimiento

| Benchmark | ReDefiNER 0.8B | Modelo comparable |
|---|---|---|
| 13 conjuntos GoLLIE zero-shot NER (con guidelines de GoLLIE) | 59,8 F1 | GoLLIE 34B: 58,1 F1 |
| 7 conjuntos CrossNER y MIT (descripciones de una linea por tipo) | 63,1 F1 | GLiNER large: 61,7 F1 (62,2 con umbral ajustado en dev) |

Los autores indican que el modelo queda por detras con solo nombres de tipo, en BUSTER y en etiquetado S1MB, sin que la informacion proporcionada incluya las cifras concretas de esos casos.

Rendimiento de inferencia reportado:

| Escenario | Hardware | Latencia / throughput | Memoria |
|---|---|---|---|
| 1 frase, rulebook cargado | Apple M2 y servidor Linux de 4 nucleos (CPU) | 0,4-0,7 s por frase | 2-2,6 GB pico con rulebooks de hasta ~1.400 tokens y 16 textos por llamada |
| 1 texto, rulebook de 2.000 tokens | NVIDIA A10 (GPU) | ~0,05 s por texto | no disponible |
| 16 textos en una llamada, rulebook de 2.000 tokens | NVIDIA A10 (GPU) | ~0,38 s | no disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo se distribuye como un unico fichero int8 de 0,77 GB, por lo que la huella en GPU es reducida en comparacion con modelos de mayor tamano.
- Memoria en CPU: aproximadamente 2-2,6 GB en pico con rulebooks de hasta ~1.400 tokens y 16 textos por llamada (medido en Apple M2 y servidor Linux de 4 nucleos).
- GPU recomendadas: NVIDIA A10 es la referencia medida por los autores; cualquier GPU NVIDIA con CUDA compatible con PyTorch deberia funcionar. En Linux con GPU conviene instalar `redefiner[gpu]` para incluir los kernels de flash-linear-attention, sin los cuales la ruta GPU es mucho mas lenta.
- Cabe en GPU de consumo: si, al tratarse de un modelo de 0,8B en int8; no se especifican modelos concretos de consumo en la informacion disponible.
- Opciones de despliegue: paquete Python `redefiner` (Python 3.10 o superior) y servidor HTTP local mediante `redefiner serve`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, y al tener cabezas propias no se carga directamente con `transformers`.
- Latencia y throughput: 0,4-0,7 s por frase en CPU; ~0,05 s por texto y ~0,38 s para 16 textos en una NVIDIA A10 con rulebook de 2.000 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / rulebook | Rendimiento zero-shot NER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReDefiNER 0.8B | 0,8B | Rulebooks hasta ~10.000 tokens; texto en ventanas de 256 tokens | 59,8 F1 (GoLLIE 13), 63,1 F1 (CrossNER/MIT 7) | Apache-2.0 | Hugging Face, paquete `redefiner` |
| GoLLIE 34B | 34B | no disponible | 58,1 F1 (GoLLIE 13) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| GLiNER large | no disponible | no disponible | 61,7 F1 (CrossNER/MIT 7; 62,2 con umbral ajustado) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

La comparacion se limita a los datos citados por los autores en la model card; no se dispone de informacion adicional sobre contextos, licencias o formatos de los modelos alternativos.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- El texto se lee en ventanas de 256 tokens, por lo que textos largos se dividen automaticamente y pueden producirse perdidas de contexto en los limites de ventana.
- Cada span extraido tiene un maximo de 16 tokens, lo que limita la extraccion de entidades muy largas.
- Los rulebooks se han probado hasta aproximadamente 10.000 tokens; no se garantiza el comportamiento mas alla de ese limite.
- El rendimiento cae cuando solo se proporcionan nombres de tipo sin descripciones, y los autores reconocen resultados inferiores en BUSTER y en etiquetado S1MB.
- Riesgo de alucinacion de spans y de etiquetas incorrectas: la salida incluye confianza por span, por lo que se recomienda umbralizar y revisar en produccion; el umbral por defecto es 0,5.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Licencia Apache-2.0, permisiva para uso comercial; no obstante, deben verificarse las condiciones del modelo base Qwen/Qwen3.5-0.8B.
- Requiere el paquete `redefiner` y no es compatible con la carga estandar de `transformers`, lo que anade una dependencia de mantenimiento externo.
- En Linux con GPU es necesario instalar los kernels de flash-linear-attention para un rendimiento adecuado; sin ellos la ruta GPU es mucho mas lenta.
- El modelo no es generativo: no admite tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jungroo-ai/redefiner-0.8b
- Repositorio de codigo: https://github.com/jungroo-ai/redefiner
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/jungroo-ai/redefiner-demo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Selector de instalacion de PyTorch: https://pytorch.org/get-started/locally/
- Indice de PyTorch CPU: https://download.pytorch.org/whl/cpu
