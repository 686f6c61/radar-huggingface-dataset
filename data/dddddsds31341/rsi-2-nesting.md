# dddddsds31341/RSI-2-nesting

## Resumen

RSI-2-nesting es un checkpoint de evaluación de robótica publicado por el usuario dddddsds31341 en Hugging Face. Se trata de un ajuste fino (finetune) del modelo Efficient-Large-Model/Long-WAM-YAM, inicializado a partir de este y entrenado para una tarea concreta de manipulación robótica: el anidamiento de muñecas rusas (nesting dolls), es decir, colocar cada muñeca más pequeña dentro de la siguiente más grande hasta completar el conjunto.

El modelo se distribuye como checkpoint de inferencia en formato PyTorch (`model.pt`), acompañado de un `config.yaml` con los parámetros de modelo, observación, acción, normalización e inferencia, un `dataset_stats.json` con las estadísticas de normalización y un fichero de requisitos del entorno SIP. No incluye estado de optimizador, scheduler ni estado aleatorio, por lo que no es reanudable para entrenamiento. El autor no declara tasas de éxito ni rendimiento en datos retenidos.

La relevancia del modelo es acotada: se trata de un artefacto de evaluación orientado a reproducir un experimento de robótica concreto dentro del ecosistema Long-WAM/SIP, no de un modelo de propósito general. Su interés principal reside en la integración multimodal (tres vistas de cámara), el uso de chunks de acción y la preservación de la normalización específica de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de Long-WAM-YAM; no se detalla en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el config usa P48 de historial de observaciones) |
| Tipos de cuantizacion | no disponible (el checkpoint se ejecuta en BF16) |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | PyTorch (`model.pt`); requiere assets separados de Wan VAE y UMT5 tokenizer/text-encoder |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Long-WAM-YAM. El checkpoint es un finetune de ese modelo base sobre el dataset `yuyingyinya/nesting_doll`, orientado a la tarea de anidamiento de muñecas rusas. La configuración de inferencia especifica BF16, tres vistas de cámara (top_head, hand_left, hand_right), un layout combinado de 384 x 320, historial P48, un chunk de acción de 32 pasos y objetivos absolutos de articulación/pinza de 14 dimensiones.

El entrenamiento emplea normalización z-score específica de la tarea, sin recorte (unclipped), y conserva las unidades originales de la pinza. El autor indica explícitamente que el checkpoint no contiene estado completo de optimizador, scheduler ni estado aleatorio, por lo que no permite reanudar el entrenamiento. No se proporcionan datos sobre número de tokens, composición del dataset, ni uso de RLHF/DPO.

## Capacidades

- Control robótico de manipulación para la tarea específica de anidamiento de muñecas rusas.
- Procesamiento de observaciones multimodales con tres vistas de cámara (top_head, hand_left, hand_right) en un layout combinado de 384 x 320.
- Generación de acciones en chunks de 32 pasos con objetivos absolutos de 14 dimensiones (articulaciones y pinza).
- Uso de historial de observaciones P48 para condicionar la predicción de acciones.
- Inferencia en BF16 mediante la implementación SIP Long-WAM.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento.

## Casos de uso

- Reproducción de experimentos de robótica: el checkpoint permite replicar la evaluación de la tarea de nesting usando `model.pt`, `config.yaml` y `dataset_stats.json` con la implementación de inferencia SIP Long-WAM.
- Investigación en manipulación con múltiples cámaras: el uso de tres vistas (top_head, hand_left, hand_right) sirve para estudiar políticas visomotoras que integran información egocéntrica y de manos.
- Evaluación de políticas con chunks de acción: el chunk de 32 pasos y los objetivos de 14 dimensiones permiten analizar el comportamiento de control a corto plazo en tareas de ensamblaje.
- Benchmark interno de anidamiento: útil como referencia para comparar variantes de entrenamiento (por ejemplo, el run separado Long-WAM-Nesting-Doll-Unclipped-30k-Step-20000) sobre la misma tarea.
- Estudio de normalización específica de tarea: la configuración sin recorte y con z-score por tarea permite analizar el efecto de la normalización en el control de la pinza.
- Integración en pipelines de evaluación SIP: al requerir assets separados (Wan VAE, UMT5), encaja en entornos de evaluación que ya dispongan de esa infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reclama ninguna tasa de éxito del robot ni rendimiento en datos retenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 12,0 GB, pero no se desglosa el tamaño de los pesos ni el de los assets externos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: implementación de inferencia SIP Long-WAM (`longwam.inference.load_run_config` y `longwam.inference.load_model`), con un checkout del código fuente Long-WAM en `./repo`. Requiere assets separados de Wan VAE y UMT5 tokenizer/text-encoder.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RSI-2-nesting | no disponible | no disponible | Nesting de muñecas rusas | other | Hugging Face (26 descargas) |
| Long-WAM-Nesting-Doll-Unclipped-30k-Step-20000 | no disponible | no disponible | Nesting de muñecas rusas | no disponible | Hugging Face (run de entrenamiento separado) |
| Long-WAM-YAM (modelo base) | no disponible | no disponible | Base de robótica Long-WAM | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de evaluación: no contiene estado de optimizador, scheduler ni estado aleatorio, por lo que no sirve para reanudar entrenamiento.
- Sin métricas de rendimiento: el autor no declara tasa de éxito ni resultados en datos retenidos; no debe asumirse un comportamiento robusto en el robot real.
- Dependencia de assets externos: requiere Wan VAE y UMT5 tokenizer/text-encoder, además de un checkout del código fuente Long-WAM, lo que complica la reproducibilidad.
- Rutas no portables: el `config.yaml` usa rutas locales que deben adaptarse manualmente (dataset, estadísticas y caché de texto opcional).
- Normalización sensible: debe preservarse la normalización z-score específica de la tarea y las unidades originales de la pinza, sin recorte; alterarlas puede invalidar el comportamiento.
- Licencia "other": no se especifican los términos exactos, por lo que el uso comercial no está garantizado y requiere revisión.
- Idiomas: no disponibles; el modelo no está orientado a tareas de lenguaje.
- Especificidad de tarea: entrenado para un único escenario de nesting, con baja transferibilidad esperada a otras tareas de manipulación.
- Riesgo de alucinación y sesgos: no aplicable en el sentido de lenguaje; en robótica, el riesgo se traduce en fallos de agarre o colocación no caracterizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/RSI-2-nesting
- Modelo base Long-WAM-YAM: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Run relacionado (nesting-doll, paso 20.000): https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Unclipped-30k-Step-20000
- Dataset de entrenamiento: https://huggingface.co/datasets/yuyingyinya/nesting_doll
