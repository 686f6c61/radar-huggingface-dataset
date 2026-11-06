# Larrivhan/NeCast

## Resumen

NeCast es un modelo publicado en HuggingFace por el usuario Larrivhan, orientado a la genética de poblaciones y a la inferencia demográfica. Sus etiquetas lo sitúan en el ámbito del cálculo del tamano efectivo de poblacion (effective population size, Ne) y de la inferencia basada en coalescentes, con un dataset de simulaciones asociado (Larrivhan/NeCast-simulations). Se distribuye como un repositorio PyTorch de aproximadamente 0,7 GB, lo que sugiere un modelo de tamano moderado, aunque no se dispone de detalles sobre su arquitectura exacta.

El modelo resuelve, presumiblemente, el problema de estimar parametros demograficos (como variaciones temporales de Ne) a partir de datos geneticos simulados o reales, una tarea clasica en genetica de poblaciones que tradicionalmente se aborda con metodos estadisticos y de coalescencia. La propuesta de un modelo neuronal para esta tarea resulta relevante porque podria ofrecer inferencia mas rapida que los metodos de simulacion intensiva, aunque la informacion publica disponible es muy limitada.

La ficha se ha elaborado exclusivamente a partir de los metadatos de HuggingFace. No hay descripcion del modelo, paper asociado, resultados de benchmarks ni documentacion tecnica en la informacion proporcionada, por lo que numerosos campos se indican como "no disponible". El acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en la plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (repositorio PyTorch, ~0,7 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo (transformer, MoE, SSM u otra), ni sobre el numero de parametros, capas o dimensiones. El repositorio se etiqueta con la libreria PyTorch, lo que indica que los pesos se distribuyen en formato nativo de PyTorch, pero no se especifica si hay variantes en safetensors, GGUF u otros formatos.

Respecto al entrenamiento, solo se conoce la existencia de un dataset de simulaciones (Larrivhan/NeCast-simulations) que probablemente se uso para generar los datos de entrenamiento. No hay informacion sobre el numero de tokens o ejemplos, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o aprendizaje supervisado convencional. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Inferencia demografica: el modelo esta disenado para estimar parametros poblacionales, presumiblemente el tamano efectivo de poblacion (Ne) y posiblemente curvas demograficas, a partir de datos geneticos.
- Modelado basado en coalescentes: las etiquetas indican soporte para el marco teorico del coalescente, habitual en genetica de poblaciones.
- Trabajo con datos simulados: el dataset asociado sugiere capacidad para aprender de simulaciones y generalizar a datos observados.
- Generacion de texto, razonamiento general, codigo, matematicas, vision, audio y tool calling: no disponible; no hay indicios de que el modelo tenga estas capacidades.
- Capacidades multilingues: no disponible.
- Modo de razonamiento extendido (thinking mode): no disponible.
- Soporte de agentes o multi-step reasoning: no disponible.

## Casos de uso

- Estimacion del tamano efectivo de poblacion en especies silvestres: el modelo podria aplicarse a datos genomicos de poblaciones naturales para inferir Ne y su variacion temporal, sustituyendo o complementando metodos de simulacion intensiva.
- Estudios de conservacion genetica: a partir de genotipos de poblaciones amenazadas, estimar la perdida de diversidad y el declive demografico para informar decisiones de gestion.
- Analisis de cuellos de botella demograficos en poblaciones humanas: inferir reducciones abruptas de poblacion a partir de datos de secuenciacion, un problema clasico en genetica de poblaciones humanas.
- Validacion de pipelines de simulacion: usar el modelo como aproximacion rapida para contrastar resultados de simuladores coalescentes antes de ejecuciones completas.
- Investigacion en genetica de poblaciones: como herramienta de inferencia rapida en estudios que requieren evaluar muchas hipotesis demograficas sobre un mismo conjunto de datos.
- Docencia y experimentacion metodologica: servir de ejemplo de aplicacion de aprendizaje automatico a la inferencia demografica en cursos de genetica computacional.
- Integracion en pipelines bioinformaticos: al ser un modelo PyTorch, podria incorporarse en flujos de analisis genomicos existentes, siempre que se cumplan las condiciones de acceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio (~0,7 GB) sugiere que el modelo podria caber en GPUs de consumo, pero no se conoce el numero de parametros ni las necesidades reales de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por el tamano del repositorio, pero no confirmada.
- Opciones de despliegue: no disponible; al ser un modelo PyTorch orientado a una tarea cientifica, el despliegue probablemente se realice mediante scripts de Python en lugar de servidores de inferencia de LLM como vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la informacion proporcionada, ni se dispone de datos de rendimiento para establecer una comparacion con alternativas de inferencia demografica basadas en aprendizaje automatico.

## Limitaciones y advertencias

- Informacion publica muy limitada: no hay descripcion del modelo, paper, tarjeta de modelo detallada ni resultados de evaluacion, lo que impide validar su calidad y su comportamiento.
- Acceso restringido: el repositorio esta en modo gated y requiere aceptar condiciones en HuggingFace antes de descargar los pesos.
- Dominio especializado: el modelo parece limitado a la genetica de poblaciones y la inferencia demografica; no debe esperarse que realice tareas generales de lenguaje, codigo o vision.
- Riesgo de alucinacion y extrapolacion: al no documentarse el dominio de entrenamiento ni los regimenes demograficos cubiertos por las simulaciones, las estimaciones fuera de ese rango podrian ser poco fiables.
- Sesgos de simulacion: si el entrenamiento se basa en un conjunto concreto de simulaciones, el modelo podria heredar los supuestos del simulador (modelo de mutacion, recombinacion, estructura poblacional) y generalizar mal a escenarios no representados.
- Licencia cc-by-4.0: permite uso comercial y modificacion con atribucion, pero conviene revisar las condiciones adicionales del acceso gated y la atribucion exigida.
- Ausencia de garantias para produccion: sin benchmarks ni validacion externa, no es recomendable usar el modelo en decisiones de conservacion o gestion sin verificacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Larrivhan/NeCast
- Dataset de simulaciones: https://huggingface.co/datasets/Larrivhan/NeCast-simulations
