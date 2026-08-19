# OneScience-Group/XiHe

## Resumen

XiHe es el primer modelo global de predicción oceánica basado exclusivamente en datos (data-driven) con resolución de remolinos (eddy-resolving), propuesto conjuntamente por el College of Meteorology and Oceanography de la National University of Defense Technology (NUDT) y varias universidades e instituciones de investigación. El modelo está diseñado para abordar la predicción de variables oceánicas como temperatura, salinidad y corrientes a alta resolución, superando las limitaciones de los modelos numéricos tradicionales en coste computacional y resolución espacial.

Se trata de un modelo basado en arquitectura Transformer, entrenado sobre datos de reanálisis oceánico global GLORYS12, distribuidos a través del dataset OneScience/CMEMS. Su relevancia actual radica en el auge de la iniciativa AI4S (IA para la ciencia), donde XiHe demuestra que es viable sustituir o complementar los modelos de circulación oceánica numéricos con redes neuronales profundas, ofreciendo una alternativa más rápida y eficiente para la investigación oceanográfica. El modelo se publica bajo licencia Apache 2.0, lo que facilita su uso y modificación tanto en entornos académicos como industriales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (diseñado para predicción oceánica global de alta resolución) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo espacio-temporal, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en formato PyTorch estándar) |
| Idiomas soportados | en, zh (idiomas de la documentación e interfaz) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

XiHe emplea una arquitectura Transformer, aunque la model card no detalla el número de capas, dimensiones ocultas ni el mecanismo de atención específico. Su diseño está orientado a procesar datos espacio-temporales de alta resolución, capturando la dinámica de remolinos de mesoescala, lo que exige una capacidad de representación superior a la de los modelos atmosféricos convencionales.

El entrenamiento se realiza sobre datos de reanálisis global GLORYS12, proporcionados por el dataset OneScience/CMEMS en formato HDF5. El repositorio incluye scripts para entrenamiento en una o múltiples GPUs mediante `torchrun`, así como un script de inferencia que lee los pesos desde `data/checkpoints/model_bak.pth`. No se menciona el uso de técnicas como RLHF o DPO, dado que es un modelo de regresión para pronóstico físico, no un modelo generativo de lenguaje. Una innovación clave es su capacidad de resolución de remolinos (eddy-resolving), un reto computacional importante en oceanografía que este modelo aborda de forma puramente basada en datos.

## Capacidades

- Predicción global de variables oceánicas, incluyendo temperatura superficial y subsuperficial, salinidad y corrientes.
- Resolución de remolinos de mesoescala, permitiendo capturar estructuras oceánicas de escala espacial fina.
- Soporte para pronóstico subsuperficial (subsurface forecast), más allá de la capa superficial.
- Entrenamiento distribuido multi-GPU mediante `torchrun`, con soporte para entornos DCU (Deep Computing Unit) a través de DTK.
- Generación de métricas de evaluación objetivas: RMSE (error cuadrático medio) y ACC (coeficiente de correlación de anomalías).
- Visualización de resultados: gráficas de pérdida y comparativas de pronóstico para fechas y variables específicas.

## Casos de uso

- Investigación oceanográfica de mesoescala: el modelo permite estudiar la formación, evolución y disipación de remolinos oceánicos a escala global, algo que los modelos numéricos tradicionales no logran a un coste razonable. Se usaría ejecutando `scripts/train.py` con datos CMEMS propios.
- Optimización de rutas marítimas: las predicciones de corrientes superficiales y subsuperficiales de XiHe pueden integrarse en sistemas de planificación de rutas para buques de carga, reduciendo el consumo de combustible y el tiempo de tránsito. La salida de `scripts/inference.py` proporciona campos de corrientes pronosticados.
- Acuicultura y gestión de recursos marinos: la predicción de temperatura y salinidad en la columna de agua es crítica para la cría de especies sensibles. XiHe puede generar pronósticos a varios días que ayuden a prevenir mortalidades masivas por estrés térmico o cambios bruscos de salinidad.
- Detección de frentes oceánicos para pesca: los frentes térmicos son zonas de alta productividad biológica. Con las predicciones de temperatura de XiHe, las flotas pesqueras pueden localizar estas zonas con antelación, mejorando la eficiencia de captura.
- Operaciones navales y de defensa: las condiciones oceanográficas (temperatura, salinidad, corrientes) afectan a la acústica submarina y a la navegación. XiHe proporciona pronósticos operativos para planificar misiones en entornos marinos complejos.
- Acoplamiento con modelos atmosféricos: las predicciones de temperatura superficial del mar (SST) de XiHe pueden alimentar modelos atmosféricos regionales para mejorar la predicción de fenómenos como huracanes o monzones, donde la interacción océano-atmósfera es dominante.
- Plataforma educativa AI4S: el repositorio incluye scripts de validación rápida con datos sintéticos, lo que lo convierte en un excelente recurso didáctico para enseñar a estudiantes de ciencias marinas y computación cómo aplicar arquitecturas Transformer a problemas de física.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio proporciona scripts para calcular RMSE y ACC sobre los resultados de inferencia, pero no se incluyen valores precalculados ni comparaciones con otros modelos oceánicos en la model card.

## Requisitos de hardware

- Se recomienda una GPU o DCU (Deep Computing Unit) para entrenamiento e inferencia completos.
- La CPU es suficiente para importar el modelo y realizar verificaciones de conectividad a pequeña escala, pero el entrenamiento y la inferencia completos serán extremadamente lentos.
- Para usuarios de DCU, es obligatorio instalar DTK en versión 25.04.2 o superior, o la versión recomendada por OneScience para el clúster específico.
- El entrenamiento multi-GPU se lanza con `torchrun --nproc_per_node=8`, lo que sugiere que el modelo puede escalar a 8 GPUs en un solo nodo, aunque no se especifica la VRAM mínima requerida por GPU.
- Las opciones de despliegue se limitan a los scripts propios del repositorio (`train.py`, `inference.py`, `result.py`). No se menciona soporte para vLLM, Ollama, llama.cpp ni TGI, dado que no es un modelo de lenguaje.
- No se proporcionan datos de latencia ni throughput estimados.

## Comparativa con modelos similares

No se han publicado comparativas cuantitativas en la informacion disponible. En la categoría de modelos de IA para ciencias de la Tierra, se pueden citar alternativas como PanguWeather o GraphCast, pero estos se centran en la atmósfera, no en el océano. La siguiente tabla resume las diferencias cualitativas:

| Modelo | Enfoque | Diferencia clave |
|---|---|---|
| XiHe | Océano global (eddy-resolving) | Primer modelo oceánico basado en Transformer con resolución de remolinos |
| PanguWeather | Atmósfera global | Modelo Transformer para predicción meteorológica, no cubre variables oceánicas subsuperficiales |
| GraphCast | Atmósfera global | Basado en grafos, eficiente para predicción a medio plazo, pero no aborda la dinámica oceánica |

## Limitaciones y advertencias

- Los pesos del entrenamiento no están disponibles actualmente: la model card indica que los archivos de pesos se subirán próximamente ("will be uploaded soon"). Esto impide la reproducción inmediata de los resultados publicados.
- Dependencia de datos externos: el entrenamiento requiere el dataset OneScience/CMEMS, del cual el repositorio solo incluye una muestra parcial. Los usuarios deben descargar el dataset completo por separado.
- Sesgos de los datos de reanálisis: al entrenar sobre GLORYS12, el modelo hereda los sesgos y limitaciones de este producto de reanálisis, especialmente en regiones con escasa cobertura de observaciones in situ.
- Riesgo de errores en eventos extremos: como modelo basado en datos, puede tener dificultades para predecir fenómenos oceánicos extremos poco representados en el conjunto de entrenamiento (por ejemplo, huracanes intensos o frentes muy abruptos).
- Requisitos de hardware específicos para DCU: los usuarios que deseen utilizar DCU deben instalar DTK, lo que añade una dependencia adicional de software propietario o específico del fabricante.
- Idiomas de documentación: la documentación y los comentarios están disponibles en inglés y chino, sin soporte oficial para otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/XiHe
- Paper (arXiv): https://arxiv.org/abs/2402.02995
- Repositorio principal en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de habilidades en Gitee: https://gitee.com/onescience-ai/oneskills
- Repositorio principal en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de habilidades en GitHub: https://github.com/onescience-ai/oneskills
