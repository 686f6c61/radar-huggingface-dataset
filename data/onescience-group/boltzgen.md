# OneScience-Group/BoltzGen

## Resumen

BoltzGen es un modelo generativo de código abierto (licencia MIT) desarrollado por OneScience-Group para el diseño de uniones biomoleculares (binders). Dado un objetivo que puede ser una proteína, un péptido, un ácido nucleico o una pequeña molécula, junto con restricciones de diseño, el modelo genera estructuras tridimensionales candidatas, realiza plegamiento inverso para obtener secuencias de aminoácidos y emplea Boltz-2 para replegar, analizar la confianza, filtrar y ordenar los candidatos. Según la documentación oficial, se trata de un modelo de difusión generativo all-atom que unifica el diseño de binders con la predicción de estructura, y ha sido validado experimentalmente con binders de afinidad nanomolar sobre objetivos novedosos.

El paquete incluye varios checkpoints preentrenados: dos modelos de difusión para el diseño de backbones (uno orientado a diversidad estructural y otro al cumplimiento de restricciones), un modelo de plegamiento inverso para generar secuencias, y dos modelos de Boltz-2 (uno de predicción de estructura y confianza y otro de afinidad para tareas proteína-pequeña molécula). El pipeline completo consta de seis etapas: diseño, plegamiento inverso, plegamiento, replegamiento bajo condiciones de diseño, análisis y filtrado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo de difusión all-atom para diseño de binders, combinado con modelo de plegamiento inverso y Boltz-2 para predicción de estructura y confianza. Pipeline de seis etapas. |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (metadatos del modelo); el modelo opera sobre estructuras biomoleculares, no sobre lenguaje natural. |
| Licencia | MIT |
| Formato de pesos | Checkpoints de PyTorch Lightning (.ckpt) |

Nota: El repositorio en HuggingFace muestra un tamaño de 0.0 GB, lo que sugiere que los pesos no están alojados directamente o requieren una descarga adicional mediante el cliente de Hugging Face.

## Arquitectura y entrenamiento

La arquitectura de BoltzGen es un pipeline modular en lugar de un único modelo monolítico. La primera etapa utiliza un modelo de difusión generativo all-atom que produce backbones tridimensionales candidatos que satisfacen el objetivo y las restricciones de diseño. Existen dos variantes del modelo de difusión: `boltzgen1_diverse.ckpt`, que enfatiza la diversidad estructural, y `boltzgen1_adherence.ckpt`, que enfatiza el cumplimiento de las condiciones de diseño. La segunda etapa emplea un modelo de plegamiento inverso (`boltzgen1_ifold.ckpt`) para generar secuencias de aminoácidos compatibles con los backbones generados. Posteriormente, dos modelos de Boltz-2 (`boltz2_conf_final.ckpt` y `boltz2_aff.ckpt`) se utilizan para predecir estructuras, calcular puntuaciones de confianza y, en el caso de pequeñas moléculas, estimar la afinidad.

El pipeline se completa con una etapa de replegamiento bajo condiciones de diseño (`design_folding`) para evaluar la adherencia a las restricciones, un análisis de métricas de calidad (RMSD, confianza, composición de secuencia) y un filtrado y ranking final de los candidatos. Los datos de entrenamiento, el número de tokens o muestras y la composición exacta del dataset no se especifican en la información disponible. Tampoco se detalla si se emplearon técnicas como RLHF o DPO, que no son aplicables a este tipo de modelo generativo biomolecular.

## Capacidades

- Diseño de binders de proteína: genera backbones y secuencias de aminoácidos para un objetivo proteico especificado.
- Diseño de péptidos lineales, cíclicos y con puentes disulfuro.
- Diseño de anticuerpos y nanobodies mediante restricciones de framework, regiones determinantes de complementariedad (CDR) o sitio de unión.
- Diseño de proteínas que se unen a pequeñas moléculas, con cálculo opcional de puntuaciones de afinidad mediante el modelo `boltz2_aff.ckpt`.
- Plegamiento inverso (inverse folding): genera secuencias candidatas de aminoácidos a partir de un backbone proteico dado.
- Predicción de estructura y análisis de confianza mediante Boltz-2, integrados en el pipeline.
- Generación de informes de salida: archivos de estructura, CSV con métricas y PDF de resumen.
- Validación de pipeline de entrenamiento mediante el punto de entrada oficial.

No es un modelo de lenguaje: no soporta tool calling, agentes conversacionales ni capacidades multimodales de texto o visión.

## Casos de uso

- Diseño de binders para dianas terapéuticas: un equipo de descubrimiento de fármacos puede especificar una proteína diana y obtener candidatos de binders con estructuras y secuencias, que luego se filtran por confianza y afinidad antes de la validación experimental.
- Diseño de péptidos cíclicos para inhibición de interacciones proteína-proteína: el modelo puede generar péptidos cíclicos con restricciones de disulfuro, lo que resulta útil en el desarrollo de moduladores de interacciones difíciles de abordar con moléculas pequeñas.
- Ingeniería de anticuerpos: utilizando restricciones de framework o CDR, se pueden generar variantes de anticuerpos o nanobodies con especificidad modificada hacia un objetivo concreto.
- Diseño de proteínas que se unen a pequeñas moléculas: para sensores o biosensores, se puede diseñar una proteína que reconozca una pequeña molécula específica, con puntuaciones de afinidad calculadas por el modelo de Boltz-2.
- Plegamiento inverso de backbones conocidos: a partir de una estructura de proteína de interés, se pueden generar múltiples secuencias candidatas que preserven el plegamiento, útil para optimizar la estabilidad o la expresión.
- Validación de pipelines de entrenamiento: los investigadores pueden utilizar el punto de entrada de entrenamiento para comprobar la carga de datos, el paso forward, el cálculo de pérdida y la actualización de parámetros en un entorno controlado.
- Exploración de diversidad estructural: con el checkpoint `boltzgen1_diverse.ckpt`, se pueden generar un conjunto diverso de backbones candidatos para explorar soluciones de diseño no obvias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación oficial indica que el modelo ha sido "validado experimentalmente con binders de afinidad nanomolar sobre objetivos novedosos", pero no se proporcionan cifras concretas de métricas como MMLU, HumanEval o GSM8K, que además no son aplicables a un modelo de diseño biomolecular.

## Requisitos de hardware

- Requiere aceleradores DCU (Deep Computing Unit) en el entorno OneScience DTK para ejecutar el pipeline completo.
- Los dispositivos DTK/HIP se acceden a través de la interfaz de compatibilidad `torch.cuda` de PyTorch.
- La ejecución en CPU es adecuada principalmente para importar el paquete, validar la configuración y realizar inspecciones ligeras de datos.
- No se especifican requisitos de VRAM, GPUs recomendadas ni cifras de latencia o throughput.
- Opciones de despliegue: entorno OneCode online de OneScience o instalación manual mediante conda y pip con el paquete `onescience[bio-dcu]`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con modelos similares en los datos proporcionados. BoltzGen se diferencia de otros modelos de diseño de proteínas como RFdiffusion en que unifica el diseño de binders con la predicción de estructura mediante Boltz-2, pero no se conocen los parámetros, el contexto ni los benchmarks de esas alternativas en la información disponible.

## Limitaciones y advertencias

- El repositorio de HuggingFace tiene un tamaño de 0.0 GB, por lo que los pesos podrían no estar disponibles directamente o requerir una descarga adicional no documentada en la model card.
- El modelo depende de un entorno de ejecución específico (OneScience DTK/DCU), lo que limita su portabilidad a infraestructuras GPU convencionales como CUDA.
- La ejecución en CPU no es adecuada para el pipeline completo, solo para validaciones ligeras.
- Como modelo generativo de estructuras, existe riesgo de producir conformaciones no físicas o de baja confianza; el pipeline mitiga esto mediante análisis y filtrado, pero la validación experimental sigue siendo necesaria.
- No se especifican sesgos conocidos, pero al ser un modelo de diseño biomolecular, su rendimiento puede verse afectado por la distribución de los datos de entrenamiento, que no se detalla.
- La licencia MIT permite el uso comercial, pero se debe verificar el origen de los datos de entrenamiento y los checkpoints para asegurar el cumplimiento de cualquier otra restricción.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/BoltzGen
- Proyecto oficial (GitHub): https://github.com/HannesStark/boltzgen
- Página del producto: https://boltz.bio/boltzgen
- OneCode (entorno online): https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
