# solitariusai/solita-plankton-9m-it

## Resumen

Solita Plankton 9M-IT es un modelo de lenguaje causal de tipo transformer, muy pequeno, especializado en tailandes y ajustado por instrucciones a partir del checkpoint base Solita Plankton 9M. Lo desarrolla solitariusai y se publica bajo licencia Apache 2.0. Se trata de un modelo experimental: la propia model card advierte de que puede generar respuestas incorrectas o incoherentes. Su interes no es la calidad conversacional, sino servir como banco de pruebas de bajo coste para experimentos de ajuste por instrucciones, tokenizacion y despliegue en entornos extremadamente limitados.

El checkpoint de chat declara 12,75 millones de parametros, cinco tokens de chat anadidos y 13.952 posiciones de contexto aprendidas. El modelo base fue entrenado hasta el paso 500.000 de preentrenamiento y el ajuste por instrucciones se realizo sobre ese punto de control. El repositorio ocupa aproximadamente 0,1 GB y los pesos se distribuyen como un fichero PyTorch (`tha-bpe16k-9m-500k-mix-sft.pt`) que incluye tanto los pesos finales como la configuracion del modelo.

Su relevancia actual es acotada: no compite con modelos de proposito general, pero resulta util para quienes investigan el comportamiento de modelos diminutos en tailandes, para validar pipelines de exportacion (ONNX Runtime y llama.cpp) y para experimentar con tecnicas de ajuste fino en hardware irrelevante desde el punto de vista de coste. La ventana de contexto de 13.952 posiciones es notablemente amplia para su tamano, aunque la capacidad real de aprovecharla esta limitada por los 12,75 millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), segun los tags del repositorio; detalles de capas y atencion no disponibles |
| Parametros totales | 12,75 millones (checkpoint de chat) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 13.952 posiciones de contexto aprendidas |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; existen exportaciones a GGUF para llama.cpp y a ONNX Runtime |
| Idiomas soportados | tailandes (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`); exportaciones disponibles en GGUF y ONNX |

## Arquitectura y entrenamiento

La informacion disponible confirma que se trata de un modelo de lenguaje causal con tokenizador BPE de 16k tokens (el nombre del fichero de pesos, `tha-bpe16k-9m-500k-mix-sft.pt`, sugiere un vocabulario de aproximadamente 16.384 entradas y un dataset de ajuste supervisado mixto). El ajuste por instrucciones parte del checkpoint Solita Plankton 9M en el paso 500.000 de preentrenamiento. El checkpoint resultante incorpora cinco tokens de chat adicionales y 13.952 posiciones de contexto aprendidas.

No se especifican en la informacion proporcionada el numero de capas, la dimension del modelo, el numero de cabezas de atencion, el volumen de tokens de preentrenamiento ni la composicion del dataset de ajuste supervisado. Tampoco se documenta el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al SFT. La model card indica que continuar el ajuste por instrucciones requiere un optimizador nuevo, lo que implica que el estado del optimizador no se conserva en el fichero publicado. No se describen innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en tailandes con formato conversacional de un solo turno o multi-turno, limitado por el formato de chat definido por los cinco tokens anadidos.
- Ajuste por instrucciones (SFT) sobre el modelo base, orientado a respuestas a peticiones directas en tailandes.
- Contexto de hasta 13.952 posiciones, inusualmente largo para un modelo de este tamano.
- Exportacion a ONNX Runtime y a llama.cpp (GGUF) para despliegue en entornos ligeros.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio.
- Capacidad multilingue limitada al tailandes; no se declaran otros idiomas.
- No dispone de modo de razonamiento explicito (thinking mode) ni de capacidades especiales adicionales.

## Casos de uso

- Pruebas de concepto de asistentes conversacionales en tailandes: el modelo permite montar un chatbot de demostracion con contexto de casi 14k tokens y validar el flujo completo de inferencia antes de invertir en un modelo mayor.
- Validacion de pipelines de exportacion: al existir artefactos ONNX y GGUF, sirve para verificar la conversion, cuantizacion y ejecucion en llama.cpp u ONNX Runtime dentro de un CI/CD sin consumir recursos significativos.
- Experimentacion academica con modelos diminutos: util para estudiar el efecto del ajuste por instrucciones en modelos de menos de 15 millones de parametros y comparar curvas de aprendizaje con el checkpoint base.
- Educacion y docencia: permite ilustrar el ciclo completo de preentrenamiento, SFT y despliegue en un portatil o incluso en un entorno sin GPU, dado el reducido tamano de los pesos.
- Pruebas de regresion de infraestructura de inferencia: su baja latencia esperada y su tamano minimo lo hacen adecuado como modelo de humo para validar servidores, colas y APIs antes de desplegar modelos de produccion.
- Investigacion sobre tokenizacion tailandesa: el tokenizador BPE de 16k permite analizar el comportamiento de la segmentacion en tailandes y su impacto en la coherencia de las respuestas.
- Generacion de texto creativo de baja exigencia en tailandes: borradores, variaciones de frases o completado de texto donde no se requiera precision factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa para los 12,75 millones de parametros (aproximadamente 51 MB en fp32, unos 26 MB en fp16); la VRAM real dependera del runtime y del contexto utilizado.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien es viable la inferencia en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de memoria, e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (segun la model card, con `torch`, `tokenizers` y `jinja2`), ONNX Runtime (repositorio `solita-plankton-9m-it-onnx`) y llama.cpp (repositorio `solita-plankton-9m-it-gguf`). No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| solita-plankton-9m-it | 12,75 M | 13.952 posiciones | Tailandes | Apache 2.0 | Hugging Face (PyTorch, GGUF, ONNX) |
| solita-plankton-9m (base) | no disponible (denominacion 9M) | no disponible | Tailandes | no disponible en la informacion proporcionada | Hugging Face |
| Alternativas comparables de menos de 100 M | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos alternativos de tamano y especializacion equivalentes en la documentacion proporcionada, por lo que la comparativa cuantitativa con terceros no esta disponible.

## Limitaciones y advertencias

- La model card advierte explicitamente de que el modelo puede producir respuestas incorrectas o incoherentes; no es apto para produccion sin supervision humana.
- Riesgo elevado de alucinacion y de perdida de coherencia en conversaciones largas, dado el reducido numero de parametros.
- Sesgos conocidos: no documentados; al entrenarse principalmente con datos en tailandes, puede reflejar sesgos presentes en ese corpus, pero no se detallan.
- Limitacion idiomatica: solo se declara soporte de tailandes; el rendimiento en otros idiomas no esta garantizado ni documentado.
- La ventana de contexto de 13.952 posiciones no implica que el modelo aproveche eficazmente todo el contexto; no hay evaluaciones publicadas al respecto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en produccion sin validacion exhaustiva.
- El ajuste por instrucciones continuado requiere un optimizador nuevo, lo que complica la reanudacion de entrenamientos.
- No se documentan medidas de seguridad, filtros de contenido ni evaluaciones de alineacion.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/solitariusai/solita-plankton-9m-it
- Modelo base: https://huggingface.co/solitariusai/solita-plankton-9m
- Exportacion ONNX: https://huggingface.co/solitariusai/solita-plankton-9m-it-onnx
- Exportacion GGUF para llama.cpp: https://huggingface.co/solitariusai/solita-plankton-9m-it-gguf
- Licencia Apache 2.0: https://huggingface.co/solitariusai/solita-plankton-9m-it/blob/main/LICENSE
