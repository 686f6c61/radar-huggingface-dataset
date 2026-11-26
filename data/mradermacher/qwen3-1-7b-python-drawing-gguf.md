# mradermacher/qwen3-1.7b-python-drawing-GGUF

## Resumen

`mradermacher/qwen3-1.7b-python-drawing-GGUF` es una coleccion de cuantizaciones GGUF del modelo `Malajusa/qwen3-1.7b-python-drawing`, un ajuste fino (SFT) del modelo base Qwen3 de 1.700 millones de parametros orientado a la generacion de codigo Python para dibujo programatico, incluyendo SVG y matplotlib. El modelo original fue entrenado mediante SFT con la libreria TRL y el dataset `Malajusa/qwen3-1.7b-python-drawing-sft`, y esta cuantizacion corre a cargo de mradermacher, un prolfico publicador de versiones GGUF de modelos open source.

La relevancia de esta ficha reside en que combina dos elementos practicos: por un lado, un modelo pequeno (1,7B) especializado en una tarea concreta —generar codigo que produce graficos y dibujos— y, por otro, un conjunto completo de cuantizaciones (desde Q2_K de 0,9 GB hasta f16 de 3,5 GB) que permiten ejecutarlo en hardware muy modesto, incluso en CPU, mediante llama.cpp u Ollama. Esto lo hace atractivo para entornos de prototipado rapido, generacion de diagramas en pipelines locales o asistentes de codigo especializados sin dependencia de la nube.

El modelo hereda la arquitectura transformer de Qwen3 y su licencia Apache 2.0, lo que facilita su uso comercial. No obstante, la informacion publicada es escasa: no hay benchmarks, no se detalla la composicion del dataset de entrenamiento ni la longitud de contexto efectiva tras el ajuste, por lo que muchas especificaciones quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, ajuste fino SFT) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del Qwen3 de 1,7B, realizado con TRL y registrado con `generated_from_trainer`. La arquitectura subyacente es un transformer decoder-only con atencion por cabezas (no se especifica si incorpora las innovaciones de atencion de Qwen3, como la decodificacion especulativa o el modo thinking). El entrenamiento se realizo sobre el dataset `Malajusa/qwen3-1.7b-python-drawing-sft`, cuyo contenido, numero de tokens y composicion no se detallan en la informacion disponible.

La especializacion del ajuste es clara segun los tags: python, drawing, svg y matplotlib. Esto sugiere que el dataset de SFT contiene pares instruccion-respuesta donde la respuesta es codigo Python que genera dibujos o graficos. No se documenta si hubo RLHF, DPO ni ninguna fase posterior al SFT, ni se especifican hiperparametros de entrenamiento. La cuantizacion GGUF se genero con `quantize_version: 2` y `output_tensor_quantised: 1`, usando el tipo de conversion `hf`; no hay cuantizaciones ponderadas/imatrix disponibles segun el autor.

## Capacidades

- Generacion de codigo Python especializado en dibujo programatico: SVG y matplotlib, segun los tags del modelo.
- Conversacion multi-turno: el tag `conversational` indica soporte de formato de chat.
- Generacion de texto general: heredada del modelo base Qwen3-1.7B.
- Razonamiento y matematicas: capacidades del Qwen3 base, aunque no verificadas tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Generacion de graficos con matplotlib en scripts locales: el modelo puede producir codigo Python que construye graficos a partir de una descripcion textual, util para automatizar informes o dashboards generados por codigo.
- Creacion de diagramas SVG a partir de descripciones: adecuado para generar ilustraciones vectoriales simples en herramientas de documentacion o generadores de diagramas.
- Asistente de codigo especializado en visualizacion de datos: integrable en editores o notebooks para sugerir fragmentos de codigo de plotting sin depender de un modelo grande.
- Prototipado rapido en hardware modesto: gracias a las cuantizaciones Q4_K_S/Q4_K_M (1,2 GB), puede ejecutarse en portatiles sin GPU dedicada mediante llama.cpp u Ollama.
- Generacion de ejemplos educativos: util para producir ejercicios de programacion grafica o demos de matplotlib en entornos de formacion.
- Pipelines de generacion de assets graficos por codigo: en flujos donde se necesita convertir especificaciones textuales en scripts reproducibles de dibujo, el modelo actua como generador de codigo intermedio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB (Q2_K), 1,2 GB (Q4_K_S/Q4_K_M), 1,5 GB (Q6_K) y 1,9 GB (Q8_0); el f16 requiere unos 3,5 GB.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente para cuantizaciones Q4-Q8; una RTX 3060, RTX 4060 o superior ofrece margen holgado. Para f16, una RTX 4090 o A100 no son necesarias pero funcionan sin problema.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas; tambien en CPU pura con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers y, presumiblemente, con vLLM o TGI en formato safetensors (no verificado para esta cuantizacion).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| qwen3-1.7b-python-drawing (este) | 1,7B | no disponible | Python drawing (SVG, matplotlib) | Apache 2.0 | GGUF / safetensors |
| Qwen3-1.7B (base) | 1,7B | no disponible | Proposito general | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-Coder-1.5B | 1,5B | no disponible | Codigo general | Apache 2.0 | safetensors, GGUF |
| SmolLM2-1.7B-Instruct | 1,7B | no disponible | Proposito general | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a modelos de tamano similar; no hay datos de rendimiento publicados para este ajuste que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3, puede heredar sesgos del modelo base y del dataset de SFT, no auditado publicamente.
- Riesgo de alucinacion: alto en tareas fuera de su especializacion (dibujo con Python); el ajuste fino estrecho puede degradar capacidades generales del Qwen3 base.
- Limitaciones de contexto o idioma: solo se declara ingles; la longitud de contexto efectiva tras el ajuste no esta documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3 y del dataset de entrenamiento.
- Caveats para produccion: modelo con 0 descargas y 0 likes en el momento de la ficha, sin benchmarks ni validacion externa; no se recomienda para produccion sin evaluacion propia. Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad del codigo generado.
- No hay cuantizaciones ponderadas/imatrix disponibles, lo que limita la calidad de las cuantizaciones de baja precision.

## Enlaces

- [Hugging Face: mradermacher/qwen3-1.7b-python-drawing-GGUF](https://huggingface.co/mradermacher/qwen3-1.7b-python-drawing-GGUF)
- [Modelo base: Malajusa/qwen3-1.7b-python-drawing](https://huggingface.co/Malajusa/qwen3-1.7b-python-drawing)
- [Dataset: Malajusa/qwen3-1.7b-python-drawing-sft](https://huggingface.co/datasets/Malajusa/qwen3-1.7b-python-drawing-sft)
- [Pagina de descargas de mradermacher](https://hf.tst.eu/model#qwen3-1.7b-python-drawing-GGUF)
- [Trackio del entrenamiento](https://Malajusa-qwen3-python-drawing-sft-trackio.hf.space?project=qwen3-python-drawing-sft&runs=Malajusa-1795610881&sidebar=collapsed)
- [Solicitudes de cuantizacion de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Guia de uso de GGUF (TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Analisis de tipos de cuantizacion (Artefact2)](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
