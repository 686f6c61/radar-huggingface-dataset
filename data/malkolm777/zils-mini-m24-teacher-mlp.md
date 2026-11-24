# malkolm777/zils-mini-m24-teacher-mlp

## Resumen

zils-mini-m24-teacher-mlp es un ajuste fino de tipo MLP de rango 32 sobre un "soup" (mezcla de pesos) de dos miembros públicos, publicado por el usuario malkolm777 en Hugging Face. El modelo se presenta como un "decision-model" etiquetado como d3-mini y zils, y deriva de los modelos base joamCriff123/zils-mini-m1121t y malkolm777/zils-mini-p21uniform. Con 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) y un repositorio de 9,1 GB en formato safetensors, se trata de un modelo de tamaño medio orientado a toma de decisiones más que a generación de texto generalista.

La información pública disponible es muy limitada: la model card apenas describe el proceso de entrenamiento (183 decisiones corregidas por profesor y 217 decisiones de replay, semilla 241250, tasa de aprendizaje 0,00004) y no incluye detalles sobre arquitectura interna, datos de preentrenamiento, idiomas soportados ni resultados de evaluación. El tag qwen3_5 sugiere una base arquitectónica inspirada en la familia Qwen, aunque no se confirma en la documentación. El modelo tiene cero descargas y cero "likes" en el momento de la consulta, lo que indica que es un experimento reciente y prácticamente sin validación por parte de la comunidad.

Su relevancia actual es, por tanto, acotada: se trata de un artefacto de investigación sobre ajuste fino selectivo de capas MLP en modelos de decisión, útil para quienes exploren técnicas de destilación de profesor, mezcla de pesos y entrenamiento con datos de replay, pero no un modelo listo para producción sin evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag qwen3_5; ajuste fino MLP de rango 32 sobre un soup de dos miembros) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

La model card indica que se trata de un ajuste fino de las capas MLP del modelo con rango 32, partiendo de un "soup" público de dos miembros (joamCriff123/zils-mini-m1121t y malkolm777/zils-mini-p21uniform). El entrenamiento se realizó sobre 183 decisiones corregidas por un profesor y 217 decisiones de replay, con semilla 241250 y tasa de aprendizaje 0,00004. No se especifica el número total de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El tag qwen3_5 y la presencia de custom_code sugieren una arquitectura derivada de Qwen con código personalizado para cargar los pesos, pero no se detalla en la información disponible.

La innovación técnica declarada es el ajuste selectivo de las capas MLP (rango 32) sobre una mezcla de pesos previa, combinando datos corregidos por profesor con datos de replay para preservar el comportamiento original. No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento explícito.

## Capacidades

- Generación de texto: no confirmada explícitamente en la documentación; el modelo se etiqueta como "decision-model", por lo que su uso previsto es la toma de decisiones más que la generación abierta.
- Razonamiento y toma de decisiones: capacidad principal declarada por las etiquetas zils y decision-model.
- Código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre ajuste fino selectivo de MLP: el modelo sirve como referencia para estudiar cómo el ajuste de rango 32 sobre un soup de pesos afecta al comportamiento de decisión, comparando con los modelos base joamCriff123/zils-mini-m1121t y malkolm777/zils-mini-p21uniform.
- Destilación de profesor con datos de replay: los 183 ejemplos corregidos por profesor y 217 de replay permiten reproducir el pipeline de entrenamiento y evaluar la contribución de cada conjunto de datos.
- Experimentos de mezcla de pesos (model soup): útil para analizar la estabilidad de la mezcla de dos miembros antes y después del ajuste fino.
- Evaluación de modelos de decisión en entornos controlados: adecuado para pruebas de laboratorio sobre políticas de decisión, siempre que se valide previamente su rendimiento.
- Reproducibilidad de experimentos: la semilla 241250 y la tasa de aprendizaje documentadas permiten replicar el entrenamiento en la misma infraestructura.
- Estudio de licencias y atribuciones: al ser apache-2.0 con NOTICE de atribuciones upstream, sirve como caso práctico de gestión de licencias en modelos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 mil millones de parámetros, en FP16 se requieren aproximadamente 9,1 GB de VRAM solo para los pesos; en cuantización de 8 bits, unos 4,5 GB; en 4 bits, unos 2,3 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: no disponible en la documentación. Por tamaño, cabría en GPUs de consumo con al menos 12 GB de VRAM en FP16 (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080) y en GPUs profesionales como A100 o H100.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en modelos con 12 GB o más en FP16, y en GPUs de 8 GB con cuantización.
- Opciones de despliegue: no disponible. El uso de custom_code puede requerir cargar el modelo con `trust_remote_code=True` en transformers; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-m24-teacher-mlp | 4.539.265.536 | no disponible | apache-2.0 | Hugging Face (0 descargas) | Ajuste fino MLP de rango 32 sobre soup de dos miembros |
| joamCriff123/zils-mini-m1121t | no disponible | no disponible | no disponible | Hugging Face (modelo base) | Miembro del soup de origen |
| malkolm777/zils-mini-p21uniform | no disponible | no disponible | no disponible | Hugging Face (modelo base) | Miembro del soup de origen |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con un conjunto muy reducido de decisiones (400 en total), el modelo puede heredar sesgos de esos datos sin que exista evaluación al respecto.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni pruebas de robustez publicadas.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto ni los idiomas soportados, lo que impide garantizar su uso en producción multilingüe o con contextos largos.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero el modelo incluye un NOTICE con atribuciones upstream que debe respetarse; conviene revisar las licencias de los modelos base joamCriff123/zils-mini-m1121t y malkolm777/zils-mini-p21uniform.
- Caveats para producción: cero descargas y cero "likes" indican ausencia de validación comunitaria; el uso de custom_code obliga a confiar en el código del autor; no se han publicado métricas de latencia, throughput ni calidad.
- El modelo se etiqueta como "decision-model", por lo que no debe asumirse que sea un generador de texto generalista sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-mini-m24-teacher-mlp
- Modelo base 1: https://huggingface.co/joamCriff123/zils-mini-m1121t
- Modelo base 2: https://huggingface.co/malkolm777/zils-mini-p21uniform
