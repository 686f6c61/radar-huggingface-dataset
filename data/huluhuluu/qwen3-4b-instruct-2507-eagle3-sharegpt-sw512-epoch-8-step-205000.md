# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-8-step-205000

## Resumen

`huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-8-step-205000` es un modelo de borrador (draft model) para decodificación especulativa, entrenado con el método EAGLE3 en línea mediante SpecForge. No es un modelo de chat independiente, sino un componente auxiliar diseñado para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` cuando se despliega con SGLang. Con solo 202,7 millones de parámetros, se trata de una red de una única capa de decoder que predice tokens plausibles que el modelo grande verifica en paralelo, reduciendo la latencia por token generado.

El modelo fue creado por el usuario huluhuluu y se publica bajo licencia Apache 2.0. El repositorio contiene el checkpoint correspondiente a la época 8 y paso 205000 de un entrenamiento de 10 épocas con datos ShareGPT limpios. La arquitectura emplea atención causal con ventana deslizante de 512 tokens, lo que limita su utilidad a secuencias cortas de borrador, pero mantiene un coste computacional muy bajo. Su relevancia actual radica en que permite desplegar Qwen3-4B-Instruct-2507 en producción con menor latencia y mayor throughput en entornos de servidor, una demanda creciente para aplicaciones de chat y agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa de decoder, EAGLE3) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana deslizante de borrador: 512 tokens; secuencia maxima de entrenamiento: 2048 |
| Tipos de cuantizacion | no disponible (pesos nativos en bfloat16) |
| Idiomas soportados | no disponible (entrenado con ShareGPT, mayoritariamente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EAGLE3, una variante de decodificacion especulativa que entrena un modelo de borrador ligero para predecir los siguientes tokens del modelo objetivo. En este caso, la red consta de una unica capa de decoder con tamaño oculto de 2560, tamaño intermedio de 9728, 32 cabezas de atencion y 8 cabezas clave/valor. El vocabulario de borrador es de 32000 tokens, mientras que el del modelo objetivo es de 151936, por lo que se requiere un mapeo entre ambos. La atencion es causal con ventana deslizante de 512 tokens y se utilizo `sdpa` como implementacion de atencion.

El entrenamiento se realizo en linea con SpecForge, un metodo que entrena el borrador mientras el modelo objetivo genera durante la inferencia. Los datos proceden de un conjunto ShareGPT limpio en formato JSONL (revision no registrada). Se ejecutaron 10 epocas con un total de 231810 pasos de optimizacion, tamaño de lote global efectivo de 4, tasa de aprendizaje de 1e-4 con calentamiento lineal del 1,5 % y posterior decaimiento coseno, y sin regularizacion de peso. La longitud maxima de secuencia fue de 2048 tokens, con una longitud TTT (tokens a predecir) de 7. El backend objetivo fue SGLang con flashinfer y paralelismo tensorial de 1. No se registraron metricas de evaluacion ni de seguridad.

## Capacidades

- Proponer tokens de borrador para decodificacion especulativa con EAGLE3, acelerando la generacion del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`.
- Compatible con SGLang y el backend flashinfer, usando la ruta de borrador especulativo configurada en el servidor.
- Ventana de borrador de 512 tokens, adecuada para secuencias cortas y generacion interactiva.
- Longitud TTT de 7 tokens, lo que permite verificar multiples tokens por paso de decodificacion.
- Soporte de atencion con ventana deslizante, reduciendo el coste computacional del borrador.
- No es un modelo de generacion de texto autonomo: no puede usarse como chat, agente o generador de codigo por si solo.
- No dispone de capacidades de vision, audio ni tool calling, ya que es un componente auxiliar de inferencia.

## Casos de uso

- Aceleracion de inferencia para Qwen3-4B-Instruct-2507 en servicios de chat: al integrar este borrador como ruta especulativa en SGLang, se reduce la latencia por token y se aumenta el throughput en cargas de trabajo interactivas.
- Reduccion de coste por token en despliegues con alta concurrencia: el borrador de 202M parametros es mucho mas barato de ejecutar que el modelo grande, y su verificacion paralela permite generar mas tokens por segundo con el mismo hardware.
- Optimizacion de latencia en asistentes conversacionales en tiempo real: aplicaciones de atencion al cliente o asistentes virtuales que requieren respuestas rapidas se benefician de la reduccion de tiempo de primera respuesta y de generacion.
- Despliegue en entornos con recursos limitados: al requerir solo ~400 MB de VRAM adicionales, el borrador cabe junto al modelo base en GPUs de gama media, permitiendo ejecutar Qwen3-4B-Instruct-2507 con menor latencia sin necesidad de hardware de alta gama.
- Investigacion en decodificacion especulativa: los 47 checkpoints publicados en la coleccion permiten estudiar la evolucion del entrenamiento y el efecto de diferentes pasos de optimizacion en el rendimiento del borrador.
- Benchmarking de configuraciones de arbol de especulacion: los desarrolladores pueden probar distintos tamanos de arbol y longitudes de ventana para encontrar la configuracion optima para su carga de trabajo especifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que no se registraron metricas de evaluacion ni de seguridad durante el entrenamiento. Se recomienda realizar pruebas de rendimiento propias (latencia, throughput, tasa de aceptacion de tokens) comparando con y sin decodificacion especulativa en el entorno de despliegue objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: el borrador ocupa aproximadamente 400 MB en bfloat16 (202,7M parametros x 2 bytes). Se necesita ademas la VRAM del modelo base Qwen3-4B-Instruct-2507, que en bf16 ocupa unos 8 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 10 GB de VRAM total para ejecutar el modelo base y el borrador juntos. Ejemplos: RTX 3090, RTX 4090, A10, A100, H100. GPUs con menos VRAM pueden usar cuantizacion del modelo base, pero el borrador se distribuye solo en bf16.
- Si cabe en GPU de consumo: si, en GPUs como RTX 3090 o RTX 4090 (24 GB VRAM) cabe sin problemas. En GPUs con 8 GB puede ser ajustado si se cuantiza el modelo base.
- Opciones de despliegue: SGLang con backend flashinfer (recomendado y soportado oficialmente), tambien se puede cargar con transformers para pruebas pero sin la funcionalidad especulativa completa.
- Latencia y throughput: no disponibles. Dependen del arbol de especulacion configurado, del hardware y de la carga de trabajo. Se recomienda medir con benchmarks propios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Este borrador EAGLE3 | 202,7M | 512 tokens (ventana borrador) | Apache 2.0 | Draft para Qwen3-4B-Instruct-2507 |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | 32K (estimado, no confirmado) | Apache 2.0 | Chat, generacion, codigo, matematicas |
| Draft models Medusa (ej. para Llama) | ~200M-1B | variable | variable | Draft para otros modelos base |

No se dispone de datos de rendimiento publicados para comparar directamente con otros borradores EAGLE3 o Medusa. La comparativa principal es frente al uso del modelo base sin decodificacion especulativa, donde la ventaja esperada es una reduccion de latencia de 1,5x a 3x dependiendo de la configuracion y del hardware, aunque estos valores no estan confirmados para este checkpoint concreto.

## Limitaciones y advertencias

- No es un modelo de chat ni un generador autonomo: usarlo directamente para generar texto producira resultados sin sentido. Debe emparejarse exclusivamente con `Qwen/Qwen3-4B-Instruct-2507`.
- No se registraron metricas de evaluacion ni de seguridad durante el entrenamiento; no hay garantia de calidad del borrador ni de ausencia de sesgos.
- La ventana de borrador es de 512 tokens, por lo que la aceleracion se limita a secuencias cortas; en generaciones largas el beneficio puede ser marginal.
- Entrenado con ShareGPT, un dataset mayoritariamente en ingles; el rendimiento en otros idiomas puede ser inferior.
- El archivo `training_state.pt` contiene estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza, ya que podria contener codigo arbitrario.
- No hay garantia de mejora de rendimiento en todos los workloads; es necesario realizar benchmarking con el arbol de especulacion y la carga de trabajo reales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tambien esta bajo Apache 2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-8-step-205000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de coleccion de checkpoints (companion collection, no enlazada directamente en la ficha): se puede acceder desde el perfil del autor huluhuluu en HuggingFace
- Implementacion oficial de EAGLE para Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Documentacion de SGLang para decodificacion especulativa: https://docs.sglang.ai (seccion de speculative decoding)
