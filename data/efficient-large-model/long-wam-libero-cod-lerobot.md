# Efficient-Large-Model/Long-WAM-LIBERO-COD-LeRobot

## Resumen

Long-WAM LIBERO-COD-LeRobot es un checkpoint de política robótica publicado por Efficient-Large-Model bajo licencia Apache 2.0. Se trata de la versión nativa de LeRobot del modelo Long-WAM LIBERO COD, un "world-action model" en el que un único proceso de difusión (COD) elimina ruido de forma conjunta sobre el vídeo futuro y las acciones. El modelo consume una ventana de 48 ticks de control de historial de observación y está entrenado y evaluado sobre la suite de manipulación LIBERO, en concreto la variante `libero_spatial`.

El repositorio contiene los pesos completos de la política, el tokenizador, la configuración y las estadísticas de preprocesado, con 12.406.309.603 parámetros y un tamaño de repo de aproximadamente 24,8 GB, lo que corresponde a pesos en precisión de 16 bits. La integración con LeRobot se hace a través de `LongWAMPolicy`, con preprocesadores y postprocesadores guardados, y la ejecución es síncrona tick a tick mediante `select_action`.

Su relevancia ahora es doble: por un lado, sitúa un modelo de mundo vídeo-acción dentro del ecosistema estándar de LeRobot, lo que facilita reproducibilidad y evaluación homogénea frente a otras políticas; por otro, el enfoque de denoising conjunto de vídeo y acción es una alternativa a las políticas VLA puramente autorregresivas. No obstante, la model card no publica cifras de éxito ni comparativas numéricas, por lo que la evaluación cuantitativa queda pendiente por parte de quien lo utilice.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política robótica Long-WAM (variante COD) con denoising conjunto de vídeo futuro y acciones; el backbone exacto (transformer, difusión, flow matching) no se detalla en la información disponible |
| Parametros totales | 12.406.309.603 |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No expresada en tokens; ventana de observación de 48 ticks de control |
| Tipos de cuantizacion | No disponible; pesos en safetensors de ~24,8 GB, coherente con 16 bits (2 bytes/parámetro). No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (política robótica sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La información disponible describe el modelo como una política LeRobot que implementa Long-WAM en su variante COD. La característica definitoria es que el proceso de denoising se aplica conjuntamente sobre el vídeo futuro y la secuencia de acciones, en lugar de generar acciones de forma autorregresiva o condicionar únicamente sobre observaciones pasadas. El checkpoint emplea 48 ticks de control de historial de observación, lo que implica una memoria temporal explícita para tareas de horizonte largo. El repositorio incluye tokenizador, configuración y estadísticas de normalización de estados y acciones.

No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF/DPO (poco habituales en robótica de manipulación) ni innovaciones adicionales como decodificación especulativa o atención lineal. La evaluación propuesta se realiza con `lerobot-eval` sobre el entorno `libero` y la tarea `libero_spatial` con batch size 1, y la inferencia directa se hace con `LongWAMPolicy.from_pretrained(...)`, llamando a `select_action` en cada tick y a `reset()` entre episodios.

## Capacidades

- Generación conjunta de predicciones de vídeo futuro y acciones motoras en un mismo proceso de denoising.
- Control de manipulación robótica a partir de observaciones visuales y estado proprioceptivo, con orden de cámaras y definiciones de estado/acción fijadas por el checkpoint.
- Memoria de historial de 48 ticks de control, adecuada para tareas de horizonte medio-largo dentro de un episodio.
- Integración nativa con LeRobot: pipeline de evaluación (`lerobot-eval`) y carga de política con pre/post-procesadores guardados.
- Ejecución síncrona tick a tick, pensada para control en bucle cerrado.
- No se documentan capacidades de tool calling, agents, multilingüismo, audio ni modos de razonamiento explícito.

## Casos de uso

- Evaluación reproducible en LIBERO: ejecutar `lerobot-eval --policy.path=Efficient-Large-Model/Long-WAM-LIBERO-COD-LeRobot --env.type=libero --env.task=libero_spatial` para obtener una línea base comparable con otras políticas LeRobot bajo el mismo arnés.
- Investigación en world-action models: usar la predicción de vídeo futuro como señal auxiliar para estudiar planificación a corto plazo y consistencia física de las acciones generadas.
- Fine-tuning sobre dominios propios de manipulación: reutilizar los pesos y las estadísticas de preprocesado como inicialización para tareas con cámaras y efector similares a los de LIBERO.
- Benchmarking de políticas VLA: comparar el enfoque de denoising conjunto frente a políticas autorregresivas en las mismas tareas y con el mismo número de ticks de historial.
- Docencia y prototipado en robótica: montar un pipeline completo de evaluación en simulación con LeRobot sin necesidad de entrenar desde cero.
- Estudio de dependencia del historial: variar la política de recorte de la ventana de 48 ticks para medir el impacto de la memoria temporal en tareas de horizonte largo.
- Generación de datos sintéticos de vídeo-acción para análisis de robustez ante cambios de iluminación o posiciones de cámara en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente proporciona el comando de evaluación sobre `libero_spatial` con `eval.batch_size=1`, sin tasas de éxito ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en 16 bits ocupan unos 24,8 GB, a los que hay que sumar activaciones y el coste del denoising sobre vídeo futuro; en la práctica se recomienda reservar bastante más que el tamaño de los pesos (no se publica una cifra oficial).
- GPU recomendadas: A100 40 GB o 80 GB y H100 para inferencia sin compromisos; una RTX 4090 de 24 GB queda por debajo del tamaño de los pesos en 16 bits, por lo que requiere offloading o precisión reducida no documentada.
- No se han publicado variantes cuantizadas, de modo que no hay una ruta oficial para ejecución en GPU de consumo.
- Opciones de despliegue: `lerobot-eval` y `LongWAMPolicy` de LeRobot (con los extras `longwam` y `libero`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La ejecución es síncrona, un `select_action` por tick de control, y no se publican tiempos por paso ni frecuencia de control alcanzable.

## Comparativa con modelos similares

La información disponible no incluye datos de otros modelos comparables, por lo que la comparación cuantitativa no está disponible. Como referencia cualitativa de la categoría (políticas VLA/world-action models para manipulación), podrían considerarse alternativas como OpenVLA, π0 o GR00T N1, pero no se dispone en esta información de sus parámetros, contexto, rendimiento ni licencia verificados.

| Modelo | Parametros | Contexto / historial | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM LIBERO-COD-LeRobot | 12.406.309.603 | 48 ticks de control | No publicado | Apache 2.0 | Pesos en HF (LeRobot) |
| Alternativas tipo OpenVLA / π0 / GR00T N1 | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No verificado en esta búsqueda |

## Limitaciones y advertencias

- La model card no publica tasas de éxito ni resultados de evaluación, solo el procedimiento; no hay evidencia numérica de rendimiento en el repositorio.
- El alcance declarado se limita a LIBERO (`libero_spatial` en el comando de ejemplo); no se documenta generalización a otros entornos, robots reales ni tareas fuera de esa suite.
- La política depende de forma estricta del orden de cámaras y de las definiciones de acción y estado guardadas; cualquier cambio en la configuración de sensores invalida el preprocesado.
- Requiere exactamente la ventana de historial de 48 ticks de control; no se documenta comportamiento con historiales truncados o irregulares.
- Ejecución síncrona: no está pensada para control de alta frecuencia ni para entornos con requisitos estrictos de tiempo real.
- No hay información sobre sesgos, demografía o condiciones de iluminación del dataset de entrenamiento, ni sobre riesgos de alucinación visual; en robótica el riesgo equivalente es el error compuesto y la deriva ante cambios de distribución.
- Licencia Apache 2.0 permite uso comercial, pero no se detalla la procedencia de los datos de entrenamiento ni posibles restricciones de terceros sobre los mismos.
- Al tratarse de un checkpoint con 0 descargas y 0 likes en el momento de la consulta, no existe validación comunitaria pública.
- No se publican versiones cuantizadas ni guías de despliegue en GPU de consumo, lo que limita su uso fuera de entornos con GPU de datacenter.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Efficient-Large-Model/Long-WAM-LIBERO-COD-LeRobot
- Modelo base (versión no LeRobot): https://huggingface.co/Efficient-Large-Model/Long-WAM-LIBERO-COD
- Librería LeRobot referenciada en la model card: https://github.com/huggingface/lerobot
- Paper, blog, demo o repositorio adicionales: no disponibles en la información proporcionada.
