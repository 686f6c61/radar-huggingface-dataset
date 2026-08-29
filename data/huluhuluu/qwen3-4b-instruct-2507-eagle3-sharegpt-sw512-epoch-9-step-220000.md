# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-9-step-220000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-9-step-220000` es un modelo de borrador (draft model) para decodificación especulativa basado en la técnica EAGLE3, entrenado sobre el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. Lo desarrolla el usuario huluhuluu mediante el framework SpecForge, utilizando un flujo de entrenamiento online con datos ShareGPT limpios. Su función no es la de un chatbot independiente, sino la de acelerar la inferencia del modelo objetivo al proponer secuencias de tokens plausibles que el modelo principal verifica en paralelo.

El modelo presenta una arquitectura ligera de una única capa de decoder con atención causal de ventana deslizante de 512 tokens, 202,7 millones de parámetros en bfloat16 y un vocabulario de borrador de 32000 entradas. Se publica junto a 47 checkpoints de entrenamiento (pasos 5.000 a 231.810) en una colección dedicada en HuggingFace, con licencia Apache 2.0. Su relevancia actual radica en la creciente demanda de reducir la latencia y el coste computacional de los modelos grandes de lenguaje en producción, especialmente cuando se sirven con SGLang y backends de atención como FlashInfer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder, hidden 2560, intermediate 9728, 32 heads atencion, 8 KV heads) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (ventana deslizante del draft); maximo de secuencia de entrenamiento 2048 |
| Tipos de cuantizacion | bfloat16 (pesos); no se documentan cuantizaciones adicionales |
| Idiomas soportados | No disponible (datos ShareGPT, principalmente ingles, sin especificacion oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura `LlamaForCausalLMEagle3`, una variante de EAGLE3 para decodificacion especulativa. Consta de una unica capa de decoder con tamaño oculto 2560, dimension intermedia 9728, 32 cabezas de atencion y 8 cabezas clave/valor, usando atencion causal de ventana deslizante de 512 tokens. El vocabulario de borrador es de 32000 tokens, mientras que el vocabulario objetivo del modelo base es de 151936 tokens. Los pesos se almacenan en bfloat16.

El entrenamiento se realizo con SpecForge en modo online, sobre un dataset ShareGPT limpio (fuente local, sin revision registrada). Se ejecutaron 10 epocas con un total de 231810 pasos de optimizacion, batch size efectivo global de 4 (4 dispositivos en paralelo de datos), learning rate 1e-4 con warmup lineal del 1,5% y posterior decaimiento coseno, weight decay 0 y maximo gradiente 0,5. La longitud maxima de secuencia fue 2048 tokens, con TTT length de 7 y atencion de borrador mediante `sdpa`. El backend objetivo es SGLang con FlashInfer, y no se registraron metricas de evaluacion ni de seguridad en el entrenamiento.

## Capacidades

- Decodificacion especulativa: genera secuencias de tokens candidatas para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`.
- Integracion con SGLang: disenado para usarse como ruta de draft en SGLang con ajustes EAGLE3, compatible con el backend FlashInfer.
- Verificacion en paralelo: permite al modelo principal aceptar o rechazar multiples tokens por paso, reduciendo el numero de pasos de autodecodificacion.
- No es un modelo de chat autonomo: no genera respuestas coherentes por si solo; su salida solo tiene sentido cuando se combina con el modelo objetivo.
- Sin soporte de tool calling, agentes ni razonamiento propio: todas las capacidades funcionales dependen del modelo base.
- Multilingue limitado: al entrenarse sobre ShareGPT (mayoritariamente ingles), el rendimiento en otros idiomas no esta garantizado.

## Casos de uso

- Servicios de chat en tiempo real con baja latencia: al desplegarse junto a Qwen3-4B-Instruct-2507 en SGLang, el draft model reduce el tiempo de respuesta en aplicaciones conversacionales donde cada milisegundo cuenta.
- Optimizacion de costes de inferencia en produccion: al disminuir el numero de pasos de decodificacion autoregresiva, se reduce el consumo de GPU y el coste por peticion en entornos con alto trafico.
- Investigacion en decodificacion especulativa: sirve como caso de estudio de entrenamiento online con SpecForge, permitiendo comparar checkpoints de distintas etapas (47 disponibles) para analizar la convergencia del draft model.
- Integracion en pipelines de generacion de texto larga: en tareas como resumen de documentos o generacion de codigo, la ventana deslizante de 512 tokens del draft acelera la produccion de secuencias extensas sin sacrificar calidad.
- Evaluacion de tecnicas de draft en entornos de servidor: los desarrolladores pueden probar distintos checkpoints y ajustar los parametros de arbol especulativo (tree settings) para encontrar la configuracion optima para su carga de trabajo.
- Despliegue en infraestructura con GPUs limitadas: al ser un modelo de solo 202M parametros y 0,4 GB, puede ejecutarse en GPU consumer junto al modelo base, habilitando inferencia acelerada en equipos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se registraron metricas de evaluacion ni de seguridad durante el entrenamiento. No se proporcionan datos de latencia, throughput ni calidad de generacion comparada con otros draft models.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,4 GB para los pesos en bfloat16, mas overhead de atencion y estados intermedios; cabe en GPUs con 4 GB o mas.
- GPU recomendadas: cualquier GPU con soporte bfloat16, por ejemplo NVIDIA RTX 3090, RTX 4090, A100, H100 o equivalentes de AMD/Intel con soporte de precision reducida.
- Compatible con GPU consumer: si, dado el reducido tamano del modelo, puede ejecutarse en tarjetas de gama media y alta.
- Opciones de despliegue: SGLang (backend objetivo, con FlashInfer), tambien compatible con transformers para pruebas locales.
- Latencia y throughput: no disponibles; dependen del modelo objetivo, del arbol especulativo configurado y del hardware. Se recomienda hacer benchmarking especifico para cada carga de trabajo.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (draft models EAGLE3 para Qwen3-4B-Instruct-2507) con datos publicados de rendimiento. Se puede consultar la coleccion de checkpoints de huluhuluu para comparar entre etapas del mismo entrenamiento, pero no hay alternativas de otros autores con metricas comparables.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo como modelo independiente produce salidas sin sentido. Debe emparejarse exclusivamente con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`.
- Sesgos de datos: entrenado sobre ShareGPT, que contiene principalmente conversaciones en ingles extraidas de internet, por lo que puede reflejar sesgos de ese corpus y tener bajo rendimiento en otros idiomas.
- Riesgo de alucinacion: al ser un modelo de borrador, no tiene criterio de calidad propio; cualquier alucinacion del modelo objetivo se mantiene o propaga.
- Sin metricas de seguridad: no se realizaron evaluaciones de seguridad, sesgo o robustez durante el entrenamiento.
- Dependencia de version: requiere una version de SGLang que soporte EAGLE3 y la configuracion exacta del modelo objetivo; cambios en el modelo base invalidan el draft model.
- `training_state.pt` contiene estado de optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza.
- Sin garantias de produccion: al no haber benchmarks ni pruebas de calidad, su uso en entornos criticos requiere validacion previa por parte del equipo que lo despliegue.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-9-step-220000
- Coleccion de checkpoints (47 modelos): https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Implementacion oficial EAGLE para Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Informacion del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
