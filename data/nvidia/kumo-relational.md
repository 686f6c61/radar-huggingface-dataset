# nvidia/Kumo-Relational

## Resumen

Kumo Relational es un modelo fundacional preentrenado de NVIDIA para clasificación y regresión sobre tablas relacionadas mediante aprendizaje en contexto (*in-context learning*). Está basado en KumoRFM-2 y combina *embeddings* de fila con paso de mensajes relacional (*relational message passing*). Su objetivo es predecir a partir de datos estructurados multi-tabla sin necesidad de aplanar las tablas en una única tabla de características ni de entrenar un modelo específico para cada tarea.

El modelo aborda un cuello de botella clásico del machine learning tabular: la ingeniería de características y el entrenamiento por tarea en esquemas relacionales. En lugar de ello, el usuario declara el esquema y las relaciones, proporciona filas de contexto y filas de consulta, y el modelo devuelve predicciones. La interacción se describe mediante *Predictive Query Language* (PQL) y se ejecuta contra un NVIDIA NIM empaquetado o a través del SDK `structured-data-models`.

Se distribuye con licencia OpenMDW 1.1 y finetunea pesos preentrenados de TabICLv2, licenciados bajo BSD-3-Clause. El repositorio de HuggingFace ocupa 0,7 GB. No se especifican en la información disponible el número de parámetros, la longitud de contexto ni los detalles del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (basado en KumoRFM-2; combina *embeddings* de fila con paso de mensajes relacional) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje natural) |
| Licencia | OpenMDW 1.1 (pesos); componentes derivados de TabICLv2 bajo BSD-3-Clause |
| Formato de pesos | No disponible |
| Tamaño del repositorio | 0,7 GB |
| Modelo base | jingang/TabICL (TabICLv2) |
| Tarea principal | Clasificación y regresión sobre datos relacionales multi-tabla |

## Arquitectura y entrenamiento

Kumo Relational es un modelo fundacional relacional: un modelo diseñado para hacer predicciones a partir de tablas conectadas y ejemplos proporcionados en cada petición. Según la documentación de NVIDIA, se basa en KumoRFM-2 y combina representaciones de fila (*row embeddings*) con paso de mensajes relacional, de forma que la información fluye entre entidades, tablas de hechos y relaciones declaradas. El modelo no requiere entrenamiento por tarea: opera mediante aprendizaje en contexto, tomando filas de contexto etiquetadas y filas de consulta sin etiquetar.

El modelo finetunea pesos preentrenados de TabICLv2, un modelo tabular de *in-context learning*. La atribución, el aviso de copyright y el texto completo de la licencia BSD-3-Clause se conservan en `THIRD-PARTY-NOTICES.txt`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La inferencia se expone a través del paquete `structured-data-models` (`sdm.models.KumoRelational`) y mediante un contenedor NVIDIA NIM que sirve el modelo empaquetado.

## Capacidades

- Clasificación y regresión sobre datos relacionales multi-tabla.
- Aprendizaje en contexto: genera predicciones a partir de filas de contexto y filas de consulta sin reentrenamiento.
- Manejo de esquemas declarados, relaciones, tablas de entidades y tablas de hechos.
- Predicción sobre múltiples tablas relacionadas sin necesidad de aplanarlas en una única tabla de características.
- Interfaz mediante *Predictive Query Language* (PQL) para describir qué predecir y para qué entidades.
- API Python a través de `structured-data-models`, con parámetros como `task`, `device`, `num_estimators` y tablas de contexto y consulta relacionadas.
- Despliegue empaquetado como NVIDIA NIM, sin montaje externo de modelo ni descarga en tiempo de ejecución.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, *tool calling* ni razonamiento multi-paso agéntico.

## Casos de uso

- **Scoring de crédito con tablas relacionadas**: el modelo puede predecir la probabilidad de impago usando tablas de clientes, cuentas y transacciones, sin aplanar el esquema. Se declaran las relaciones y se envían filas de contexto con etiquetas históricas y filas de consulta para los solicitantes nuevos.
- **Predicción de churn**: con tablas de clientes, suscripciones y eventos de uso, el modelo estima la probabilidad de baja por cliente. El aprendizaje en contexto permite incorporar ejemplos recientes sin reentrenar el modelo.
- **Detección de fraude**: a partir de cuentas, transacciones y dispositivos, el modelo clasifica operaciones sospechosas. La capacidad de manejar tablas de hechos y entidades relacionadas es adecuada para señales de fraude distribuidas en varios sistemas.
- **Previsión de demanda y ventas**: con tablas de productos, tiendas e historial de ventas, el modelo puede realizar regresión sobre la demanda esperada por combinación de producto y punto de venta, manteniendo las relaciones entre entidades.
- **Recomendación y predicción de conversión**: usando usuarios, ítems e interacciones, el modelo puede predecir la probabilidad de conversión o interacción relevante, útil en motores de recomendación que ya disponen de un esquema relacional.
- **Riesgo clínico y reingresos**: con tablas de pacientes, diagnósticos y analíticas, el modelo estima la probabilidad de reingreso o de complicación. La predicción se apoya en el historial relacional del paciente sin construir una tabla ancha manualmente.
- **Tarificación de seguros**: a partir de pólizas, siniestros y vehículos o propiedades aseguradas, el modelo puede predecir la siniestralidad esperada y apoyar la fijación de primas.
- **Mantenimiento predictivo**: con tablas de sensores, máquinas y órdenes de trabajo, el modelo estima la probabilidad de fallo o el tiempo hasta el siguiente mantenimiento, aprovechando las relaciones entre activos y lecturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se especifican parámetros totales, precisión de los pesos ni requisitos mínimos de memoria.
- GPU recomendadas: no disponible. El ejemplo de uso del SDK especifica `device="cuda"`, por lo que se requiere una GPU NVIDIA con CUDA.
- Compatibilidad con GPU de consumo: no disponible. El repositorio ocupa 0,7 GB, pero no se indica la precisión de los pesos ni la VRAM necesaria, por lo que no puede confirmarse que quepa en una GPU de consumo concreta.
- Opciones de despliegue: contenedor NVIDIA NIM (sirve el modelo `kumo-relational` empaquetado, sin montaje externo ni descarga en tiempo de ejecución) y SDK de Python `structured-data-models` (`pip install structured-data-models`).
- Latencia y throughput estimados: no disponible. No se publican cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Tipo | Datos relacionales multi-tabla | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kumo Relational | Modelo fundacional relacional | Sí | OpenMDW 1.1 | HuggingFace y NVIDIA NIM |
| TabICLv2 / TabICL | Modelo fundacional tabular | No | BSD-3-Clause (TabICLv2) | HuggingFace |
| KumoRFM-2 | Modelo fundacional relacional (predecesor) | Sí | No disponible | No disponible |
| TabPFN | Modelo fundacional tabular | No | No disponible | No disponible |

La comparativa está limitada por la ausencia de datos públicos de parámetros, contexto y benchmarks para Kumo Relational y para los modelos alternativos incluidos. No se dispone de resultados comparativos objetivos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que no es posible evaluar objetivamente su rendimiento frente a alternativas.
- No se especifican el número de parámetros, la longitud de contexto, los tipos de cuantización ni el formato de pesos.
- No es un modelo de lenguaje natural: no genera texto, no soporta *tool calling* ni razonamiento multi-paso. No debe evaluarse con métricas de LLM.
- Riesgo de predicciones erróneas por cambios de distribución, esquemas mal declarados, fugas de información entre contexto y consulta o desbalance de clases. No se documentan mecanismos de calibración o detección de *drift*.
- Sesgos potenciales heredados de los datos de entrenamiento de TabICLv2 y del propio preentrenamiento de Kumo Relational, no documentados en la información disponible.
- La licencia OpenMDW 1.1 debe revisarse para uso comercial. El modelo incorpora componentes bajo BSD-3-Clause con atribuciones en `THIRD-PARTY-NOTICES.txt`.
- Dependencia del ecosistema NVIDIA (NIM, CUDA) y del SDK `structured-data-models` para la inferencia.
- Los metadatos del repositorio indican fechas de creación y actualización en 2026, lo que puede señalar metadatos poco fiables o incompletos.
- No se documentan limitaciones idiomáticas porque el modelo no opera sobre lenguaje natural, sino sobre esquemas y datos estructurados.

## Enlaces

- [HuggingFace: nvidia/Kumo-Relational](https://huggingface.co/nvidia/Kumo-Relational)
- [Model card en NVIDIA NIM](https://build.nvidia.com/nvidia/kumo-relational/modelcard)
- [NVIDIA NIM: Kumo Relational](https://build.nvidia.com/nvidia/kumo-relational)
- [Documentación: How Kumo Relational Works](https://docs.nvidia.com/sdgm/rfm/introduction)
- [Documentación: Overview de NVIDIA Structured Data and Graph Models](https://docs.nvidia.com/sdgm/rfm/overview)
- [Referencia de API NIM: nvidia/kumo-relational](https://docs.api.nvidia.com/nim/reference/nvidia-kumo-relational)
- [Repositorio GitHub: NVIDIA/structured-data-models](https://github.com/NVIDIA/structured-data-models)
- [Modelo base: jingang/TabICL](https://huggingface.co/jingang/TabICL)
