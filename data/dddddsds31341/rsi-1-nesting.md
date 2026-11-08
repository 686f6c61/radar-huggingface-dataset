# dddddsds31341/RSI-1-nesting

## Resumen

RSI-1-nesting es un checkpoint de evaluación para robótica publicado por el usuario dddddsds31341 en Hugging Face. Se trata de un ajuste fino (finetune) del modelo Efficient-Large-Model/Long-WAM-YAM, orientado a una tarea concreta de manipulación: el anidamiento de muñecas rusas (nesting), es decir, introducir cada muñeca pequeña dentro de la siguiente de mayor tamaño hasta completar la secuencia. El pipeline declarado es `robotics` y la librería `pytorch`.

El modelo no es un LLM de propósito general, sino una política visomotora (vision-language-action) entrenada para ejecutar una tarea física específica con un robot. Hereda la arquitectura del modelo base Long-WAM-YAM, que combina componentes de tipo Wan (VAE y tokenizador/text-encoder UMT5) con un cabezal de acciones. El repositorio pesa 12,0 GB e incluye el checkpoint `model.pt`, la configuración `config.yaml`, las estadísticas de normalización `dataset_stats.json` y un fichero de requisitos del entorno SIP.

Su relevancia es acotada: se publica como checkpoint de evaluación, sin métricas de éxito declaradas ni estado completo de entrenamiento. Resulta útil para reproducir la inferencia de la tarea de nesting dentro del ecosistema SIP/Long-WAM, no como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de Long-WAM-YAM; componentes Wan VAE y UMT5 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (historial de observaciones P48: 48 pasos) |
| Tipos de cuantizacion | BF16 (configuracion de inferencia); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | PyTorch (`model.pt`), mas `config.yaml` y `dataset_stats.json` |

Otros parametros de la configuracion de inferencia:

| Parametro | Valor |
|---|---|
| Vistas de camara | 3 (top_head, hand_left, hand_right) |
| Layout de imagen combinado | 384 x 320 |
| Historial de observaciones | P48 (48 pasos) |
| Chunk de acciones | 32 pasos |
| Espacio de acciones | 14D, objetivos absolutos de articulacion y pinza |
| Normalizacion | z-score especifica de tarea, sin clipping; unidades de pinza originales |
| Prevision | BF16 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Efficient-Large-Model/Long-WAM-YAM, un modelo de tipo vision-language-action para robótica. La configuracion de inferencia indica el uso de tres vistas de camara (top_head, hand_left, hand_right) combinadas en un layout de 384 x 320, un historial de observaciones P48 y un chunk de acciones de 32 pasos con objetivos absolutos de 14 dimensiones (articulaciones y pinza). La inferencia se ejecuta en BF16.

El entrenamiento se realizo sobre el dataset `yuyingyinya/nesting_doll`, con estadisticas de normalizacion z-score especificas de la tarea y sin clipping. El autor declara explicitamente que se trata de un checkpoint de evaluacion y que no contiene estado completo de optimizador, scheduler ni aleatoriedad para reanudar el entrenamiento. No se documentan el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO. La arquitectura interna detallada (tipo de transformer, atencion, etc.) no se especifica en la informacion disponible; el modelo base emplea componentes Wan VAE y UMT5 para la parte visual y de lenguaje.

## Capacidades

- Ejecucion de una tarea robotica de manipulacion: anidamiento de munecas rusas de menor a mayor tamano.
- Percepcion multimodal con tres camaras simultaneas (top_head, hand_left, hand_right).
- Generacion de trayectorias de accion en chunks de 32 pasos con objetivos absolutos de 14 dimensiones (articulaciones y pinza).
- Uso de historial de observaciones de 48 pasos (P48) para condicionar la politica.
- Inferencia en BF16 dentro del entorno SIP Long-WAM.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso general, multilingueismo ni modos de pensamiento.

## Casos de uso

- Reproduccion de la tarea de nesting en laboratorio: cargar `model.pt`, `config.yaml` y `dataset_stats.json` con `longwam.inference.load_run_config` y `longwam.inference.load_model` para ejecutar la politica sobre un robot con las tres camaras configuradas.
- Evaluacion comparativa de politicas: servir como referencia de checkpoint de evaluacion frente a otros modelos del mismo autor (por ejemplo, pi05-nesting_doll_100-10k o Long-WAM-Nesting-Doll-Epoch-1) en la misma tarea.
- Investigacion en manipulacion robotica: estudiar el comportamiento de una politica VLA con historial P48 y chunks de 32 acciones en una tarea de precision con objetos anidados.
- Desarrollo de pipelines de inferencia SIP: validar la integracion de `model.pt` con las estadisticas de normalizacion y la configuracion portables en una maquina distinta a la original.
- Base para ajuste fino posterior: partir de este checkpoint para reentrenar la tarea de nesting, teniendo en cuenta que no incluye estado de optimizador.
- Docencia y demostraciones: ilustrar el flujo completo de un modelo VLA en robótica con camaras multiples y espacio de acciones continuo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se declara ninguna tasa de exito del robot ni rendimiento en conjuntos reservados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 12,0 GB y la inferencia se ejecuta en BF16, por lo que se requiere una GPU con al menos esa capacidad de memoria, aunque la cifra exacta no se documenta.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el peso del repositorio (12,0 GB) sugiere que podria caber en GPUs de consumo con 16 GB o mas en BF16, pero no se aporta dato oficial.
- Opciones de despliegue: implementacion de inferencia SIP Long-WAM (`longwam.inference`), con el checkout de codigo fuente correspondiente en `./repo`. Requiere ademas los assets Wan VAE y UMT5 tokenizer/text-encoder por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RSI-1-nesting | no disponible | P48 (historial) | Nesting de munecas rusas | other | Hugging Face (26 descargas) |
| pi05-nesting_doll_100-10k | no disponible | no disponible | Nesting de munecas rusas | no disponible | Hugging Face |
| Long-WAM-Nesting-Doll-Epoch-1 | no disponible | no disponible | Nesting de munecas rusas | no disponible | Hugging Face |

Los tres modelos pertenecen al mismo autor y abordan la misma tarea de nesting; no se dispone de datos de rendimiento comparativo ni de especificaciones tecnicas detalladas de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint de evaluacion: no contiene estado completo de optimizador, scheduler ni aleatoriedad, por lo que no sirve para reanudar entrenamiento.
- Sin metricas: el autor no declara tasa de exito del robot ni rendimiento en conjuntos reservados.
- Dependencia del entorno SIP: requiere la implementacion de inferencia Long-WAM y los assets Wan VAE y UMT5 por separado.
- Rutas portables: `config.yaml` usa placeholders; es necesario adaptar rutas de dataset, estadisticas y cache de texto a la maquina de inferencia.
- Normalizacion sensible: usa z-score especifico de tarea sin clipping y unidades de pinza originales; alterarlas puede degradar el comportamiento.
- Licencia "other": no se especifican terminos de uso comercial; deben consultarse antes de cualquier despliegue productivo.
- Idiomas y sesgos: no se documentan; al ser un modelo de robotica especifico, las consideraciones de sesgo linguistico no aplican directamente, pero no hay informacion sobre sesgos de percepcion.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en politica robotica el riesgo equivalente es la generacion de acciones invalidas o inseguras, no cuantificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/RSI-1-nesting
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: https://huggingface.co/datasets/yuyingyinya/nesting_doll
- Checkpoint relacionado: https://huggingface.co/dddddsds31341/pi05-nesting_doll_100-10k
- Checkpoint relacionado: https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Epoch-1
