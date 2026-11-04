# mradermacher/poetry-fd-sft-7b-GGUF

## Resumen

`mradermacher/poetry-fd-sft-7b-GGUF` es una coleccion de cuantizaciones GGUF del modelo base `couplefire/poetry-fd-sft-7b`, publicada por el usuario mradermacher (nethype GmbH). No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local del modelo original, que por su nombre parece orientado a generacion de poesia y ajustado mediante SFT (supervised fine-tuning). El repositorio incluye 11 variantes de cuantizacion estatica, desde Q2_K (3,1 GB) hasta f16 (15,3 GB).

El modelo cuenta con 7.615.616.512 parametros (aproximadamente 7,6 mil millones), lo que lo situa en la categoria de modelos de 7B-8B, un rango muy popular para despliegue en hardware consumer. La model card no documenta la arquitectura interna, la longitud de contexto ni los datos de entrenamiento del modelo original; solo se indica que el idioma declarado es ingles y que la libreria es transformers.

Su relevancia practica es limitada pero concreta: permite ejecutar un modelo afinado para poesia en ingles sobre GPUs de consumo mediante llama.cpp u Ollama, con opciones de cuantizacion que van desde 3 GB hasta 15 GB. La ausencia de licencia explicita y de documentacion tecnica del modelo base son factores que condicionan seriamente su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de 7B segun convencion, no confirmado en la model card) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `couplefire/poetry-fd-sft-7b`. Por el numero de parametros (7.615.616.512) y la nomenclatura "7b", se corresponde con la clase de modelos transformer de aproximadamente 7,6 mil millones de parametros, pero no se confirma en la model card ni el tipo de atencion, ni la familia arquitectonica (Llama, Mistral, Qwen u otra), ni la longitud de contexto nativa.

Respecto al entrenamiento, el sufijo "sft" sugiere un ajuste supervisado (supervised fine-tuning) sobre un modelo preentrenado, presumiblemente orientado a poesia ("poetry"). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El repositorio de mradermacher es exclusivamente de cuantizacion: no anade ni modifica el entrenamiento, solo convierte los pesos a formatos GGUF de distinto tamano. Las cuantizaciones son estaticas; el autor indica que las variantes ponderadas con imatrix no estaban disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto en ingles, presumiblemente especializada en composicion poetica y creativa, segun el nombre del modelo base.
- Conversacion multi-turno: el repositorio esta etiquetado como "conversational".
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con infraestructuras de inferencia tipo Hugging Face Inference Endpoints.
- Ejecucion local en CPU y GPU mediante el formato GGUF, con soporte en llama.cpp y derivados.
- No se documentan capacidades de codigo, matematicas, vision, audio, tool calling ni agentes.
- No se documenta modo thinking ni razonamiento explicito.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Generacion de poesia y texto creativo en ingles: el modelo esta afinado especificamente para esta tarea (sufijo "poetry" y "sft"), por lo que puede emplearse para producir poemas, letras o texto lirico en ingles con un tono ajustado. La cuantizacion Q4_K_M (4,8 GB) es un punto de partida razonable para prototipos.
- Experimentacion educativa con modelos afinados: util para investigadores que quieran estudiar como un SFT especializado en poesia se comporta frente a modelos generalistas, con la ventaja de poder ejecutarlo en una unica GPU consumer.
- Despliegue local en estaciones de trabajo sin conexion: al ser GGUF, puede ejecutarse con llama.cpp en equipos sin acceso a la nube, lo que resulta util para entornos con requisitos de privacidad o sin conectividad.
- Prototipado rapido de asistentes creativos: la variante Q8_0 (8,2 GB) permite probar respuestas de alta fidelidad antes de decidir si se justifica el modelo base en precision completa.
- Integracion en pipelines de generacion de contenido editorial: para borradores de contenido poetico o creativo en ingles que luego un editor humano revisa, con la cuantizacion Q5_K_M (5,5 GB) como equilibrio entre calidad y coste.
- Investigacion sobre cuantizacion: el repositorio ofrece 11 variantes del mismo modelo, lo que permite medir el impacto de la cuantizacion en la calidad de la generacion creativa (por ejemplo, comparando Q2_K frente a Q8_0 con la misma semilla y prompt).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB (Q2_K), 4,8 GB (Q4_K_M), 5,5 GB (Q5_K_M), 8,2 GB (Q8_0) y 15,3 GB (f16), anadiendo margen para el contexto y el runtime.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100 para las variantes de mayor precision.
- Cabe en GPU consumer: si, practicamente todas las cuantizaciones de Q2_K a Q8_0 caben en GPUs de 8-12 GB; la variante f16 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base usa transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| poetry-fd-sft-7b-GGUF (este) | 7,6B | no disponible | no disponible | GGUF | Afinado para poesia en ingles, cuantizaciones estaticas |
| Modelo base couplefire/poetry-fd-sft-7b | 7,6B | no disponible | no disponible | safetensors | Pesos originales sin cuantizar |
| Alternativas de 7B para poesia en ingles | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; contactar con el autor del modelo base antes de cualquier despliegue productivo.
- Documentacion tecnica muy escasa: se desconoce la arquitectura exacta, el contexto maximo y los datos de entrenamiento, lo que impide evaluar sesgos y robustez con rigor.
- Solo ingles declarado: no hay garantia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: inherente a los modelos de 7B afinados con SFT, especialmente en tareas factuales fuera del dominio poetico.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S, Q4_K_M y Q8_0.
- Las cuantizaciones son estaticas; no hay variantes imatrix ponderadas disponibles, lo que puede reducir la calidad frente a alternativas ponderadas de igual tamano.
- Sin benchmarks publicados: no es posible verificar el rendimiento frente a otros modelos de 7B.
- Uso en produccion desaconsejado sin una evaluacion previa del modelo base y de la licencia.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/poetry-fd-sft-7b-GGUF
- Modelo base: https://huggingface.co/couplefire/poetry-fd-sft-7b
- Pagina de descargas del autor: https://hf.tst.eu/model#poetry-fd-sft-7b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
