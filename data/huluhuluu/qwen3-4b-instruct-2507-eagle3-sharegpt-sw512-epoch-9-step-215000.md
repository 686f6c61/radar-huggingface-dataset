# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-9-step-215000

## Resumen

El repositorio `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-9-step-215000` contiene un checkpoint concreto de un modelo de borrador (draft model) de decodificacion especulativa basado en la tecnica EAGLE3, entrenado de forma online con la herramienta SpecForge. No es un modelo de chat independiente: su unica funcion es acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` cuando se despliega con SGLang, prediciendo multiples tokens por paso que el modelo grande verifica posteriormente. Este checkpoint corresponde al paso 215000 de la epoca 9 de un entrenamiento de 10 epocas y 231810 pasos.

El modelo tiene 202,7 millones de parametros, una unica capa de decoder con atencion causal de ventana deslizante de 512 tokens y vocabulario de borrador de 32000 tokens. Se publica bajo licencia Apache 2.0 en formato safetensors, junto con su configuracion y un archivo de estado de entrenamiento. La coleccion completa incluye 47 checkpoints desde el paso 5000 hasta el 231810, lo que permite seleccionar el punto de entrenamiento mas adecuado para cada carga de trabajo de servicion.

Es relevante porque la decodificacion especulativa es una de las tecnicas mas efectivas para reducir la latencia en despliegues de modelos grandes sin perder calidad de salida. Este repositorio ofrece un borrador entrenado especificamente para Qwen3-4B-Instruct-2507, con una ventana de borrador corta (512 tokens) que reduce el coste computacional del modelo auxiliar. El autor no ha registrado metricas de evaluacion ni de seguridad en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder, atencion sliding window de 512 tokens) |
| Parametros totales | 202.700.416 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (secuencia maxima de entrenamiento); ventana de borrador de 512 tokens |
| Tipos de cuantizacion | bfloat16 (unico formato publicado) |
| Idiomas soportados | no disponible (dataset ShareGPT limpio, sin registro de composicion linguistica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `LlamaForCausalLMEagle3` definida por el proyecto EAGLE (https://github.com/Yunhai-Hu/EAGLE-Qwen3). Consta de una unica capa de decoder con dimension oculta de 2560, tamano intermedio de 9728, 32 cabezas de atencion y 8 cabezas clave/valor. El vocabulario de borrador es de 32000 tokens, mientras que el vocabulario objetivo es de 151936 tokens (el de Qwen3-4B-Instruct-2507). Los pesos estan en bfloat16 y la atencion del borrador usa causal sliding-window de 512 tokens, implementada con `sdpa`.

El entrenamiento se realizo con SpecForge, un sistema de entrenamiento online de modelos de borrador: el modelo se actualiza en tiempo real mientras se usa para decodificacion especulativa contra el modelo objetivo. Los datos provienen de un dataset ShareGPT limpio (fuente local, sin revision registrada). Se ejecutaron 10 epocas con 231810 pasos de optimizador, batch efectivo global de 4 (tamano por dispositivo 1, paralelismo de datos 4, sin acumulacion de gradientes), tasa de aprendizaje de 1e-4 con warmup lineal del 1,5% y decaimiento coseno, weight decay 0 y gradiente maximo de norma 0,5. La longitud maxima de secuencia fue de 2048 tokens y el parametro EAGLE3 TTT length se fijo en 7, que controla cuantos tokens de contexto adicionales se usan para la prediccion del borrador. El backend objetivo fue SGLang con FlashInfer y paralelismo tensorial de 1.

## Capacidades

- Decodificacion especulativa: predice multiples tokens por paso de inferencia que el modelo objetivo Qwen3-4B-Instruct-2507 verifica en paralelo, reduciendo la latencia de generacion.
- Aceleracion de servicion: disenado para integrarse como ruta de borrador en SGLang, con soporte de arboles de especulacion (tree settings) que deben ajustarse segun la carga de trabajo.
- No es un modelo de chat: no genera respuestas de forma autonoma y no debe usarse como modelo standalone.
- Sin capacidades de tool calling, vision, audio, razonamiento multi-paso ni multimodales.
- Multilingue: no se han publicado datos sobre rendimiento en idiomas distintos del ingles; el dataset ShareGPT original contiene principalmente conversaciones en ingles.

## Casos de uso

- Reduccion de latencia en servicion de Qwen3-4B-Instruct-2507: el caso principal. Se despliega el borrador junto al modelo grande en SGLang y se configuran los parametros de EAGLE3 para acelerar la generacion en entornos de produccion con alta concurrencia.
- Optimizacion de costes en inferencia a gran escala: al reducir el numero de pasos secuenciales del modelo grande, se disminuye el tiempo de ocupacion de GPU y, por tanto, el coste por peticion en servicios de chat o agentes.
- Experimentacion con decodificacion especulativa: los 47 checkpoints publicados permiten estudiar como evoluciona la calidad del borrador a lo largo del entrenamiento y seleccionar el punto optimo para un mix de trafico concreto.
- Benchmarking de configuraciones de arboles de especulacion: el repositorio incluye checkpoints en distintos pasos, lo que facilita medir el trade-off entre tasa de aceptacion y coste de verificacion en SGLang.
- Desarrollo de pipelines de agentes con baja latencia: si se usa Qwen3-4B-Instruct-2507 como motor de un agente que requiere respuestas rapidas, el borrador permite reducir el tiempo de cada llamada de generacion.
- Investigacion sobre entrenamiento online de modelos de borrador: el archivo `training_state.pt` incluye estado de optimizador y argumentos de entrenamiento, util para reproducir o continuar el entrenamiento en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se registraron metricas de evaluacion ni de seguridad para este entrenamiento. No se proporcionan tasas de aceptacion de tokens, latencias medidas ni comparaciones con otros modelos de borrador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de borrador ocupa aproximadamente 0,4 GB en bfloat16 (202,7 millones de parametros). Sin embargo, para usarlo en decodificacion especulativa se necesita cargar tambien el modelo objetivo Qwen3-4B-Instruct-2507, que ocupa unos 8 GB en bfloat16. En total, se recomienda al menos 12-16 GB de VRAM para un despliegue comodo con SGLang.
- GPU recomendadas: cualquier GPU con 12 GB o mas de VRAM es suficiente, como una RTX 4070 Ti, RTX 4080, RTX 4090, A10, A100 o H100. Para servicion de alta concurrencia se recomiendan GPUs de centro de datos (A100/H100) con suficiente ancho de banda de memoria.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas, siempre que se pueda cargar el modelo objetivo junto con el borrador.
- Opciones de despliegue: SGLang (con soporte EAGLE3 y FlashInfer), que es el backend objetivo del entrenamiento. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la model card.
- Latencia y throughput: no disponibles. El autor recomienda ajustar los parametros de arbol de especulacion segun la carga de trabajo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este checkpoint concreto. Como referencia, los modelos de borrador EAGLE3 compiten con otras tecnicas de decodificacion especulativa como Medusa o EAGLE-2, pero no hay metricas publicas que permitan una comparacion cuantitativa con este entrenamiento especifico. La ventaja principal de este repositorio frente a alternativas genericas es que esta entrenado exactamente sobre el modelo objetivo Qwen3-4B-Instruct-2507, lo que suele producir mayores tasas de aceptacion que un borrador no alineado. No obstante, sin benchmarks no es posible confirmar esta ventaja.

## Limitaciones y advertencias

- No es un modelo de chat: no debe usarse de forma standalone para generar respuestas a usuarios. Su unica funcion es actuar como borrador especulativo.
- Requiere el modelo objetivo exacto: esta entrenado para Qwen/Qwen3-4B-Instruct-2507. Usarlo con otro modelo puede degradar gravemente la tasa de aceptacion o producir salidas incorrectas.
- Ventana de borrador limitada a 512 tokens: la atencion causal deslizante restringe el contexto que el borrador puede considerar para predecir tokens, lo que puede reducir su eficacia en secuencias muy largas.
- Sin evaluacion de seguridad: la model card indica que no se registraron metricas de evaluacion ni de seguridad. No se conocen sesgos especificos, pero al entrenarse sobre ShareGPT (principalmente ingles) puede presentar sesgos linguisticos y culturales.
- Riesgo de alucinacion: al ser un modelo de borrador, no genera contenido final, pero sus predicciones incorrectas pueden aumentar la carga de verificacion del modelo objetivo.
- Archivo de estado de entrenamiento: `training_state.pt` contiene estado de optimizador y argumentos; debe deserializarse solo en entornos de confianza por riesgo de ejecucion de codigo arbitrario.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo objetivo Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache 2.0 segun la informacion disponible), que debe verificarse antes de un despliegue en produccion.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-9-step-215000
- Coleccion de checkpoints: https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Checkpoint anterior (epoca 3, paso 75000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-75000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Implementacion oficial de EAGLE para Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Documentacion de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
