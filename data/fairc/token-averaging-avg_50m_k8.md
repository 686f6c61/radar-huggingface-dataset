# FAIRC/token-averaging-avg_50m_k8

## Resumen

Este repositorio contiene un checkpoint de investigación del proyecto **token averaging** desarrollado por FAIRC, una organización de investigación en inteligencia artificial. Se trata de un modelo de lenguaje pequeño de aproximadamente 50,9 millones de parámetros, con una arquitectura transformer de 8 capas, 8 cabezas de atención y dimensión de modelo 512. El contexto máximo es de 1024 tokens.

El proyecto explora una técnica denominada "token averaging" con un factor k=8, que probablemente consiste en promediar representaciones de tokens consecutivos para comprimir la secuencia o mejorar la eficiencia del entrenamiento. El modelo fue entrenado con un objetivo de 8.144 millones de tokens, con una tasa de aprendizaje de 0.0002 y 2000 pasos de calentamiento.

Este checkpoint no es un modelo listo para producción ni para uso con la librería `transformers` de HuggingFace. Se trata de un artefacto de investigación que requiere reconstruir la arquitectura desde el archivo `config.json` y cargar el `state_dict` directamente. Su relevancia reside en el estudio empírico de técnicas de promediado de tokens, un área emergente en la optimización de transformers para contextos largos y eficiencia computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (d_model=512, n_heads=8, n_layers=8, tie_embeddings=true) |
| Parametros totales | 50.897.408 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (checkpoints en formato PyTorch nativo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch state_dict (`.pt`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer estándar con 8 capas, 8 cabezas de atención y una dimensión de modelo de 512. Los embeddings están atados (tie_embeddings=true), lo que reduce el número de parámetros. La innovación principal es el mecanismo de **token averaging** con k=8, que probablemente agrupa bloques de 8 tokens y promedia sus representaciones antes de pasarlas por las capas transformer, reduciendo así la longitud efectiva de la secuencia procesada.

El entrenamiento se realizó con un objetivo de 8.144 millones de tokens, una tasa de aprendizaje de 0.0002 y 2000 pasos de calentamiento. No se especifica el dataset utilizado, ni si se aplicaron técnicas como RLHF o DPO. Los checkpoints disponibles incluyen un estado final (`final.pt`) y un estado intermedio en el paso 50.000 (`step_00050000.pt`), lo que permite analizar la evolución del entrenamiento.

## Capacidades

- Generación de texto: como modelo de lenguaje autoregresivo, puede generar texto, aunque su tamaño reducido limita la calidad y coherencia en tareas complejas.
- Razonamiento básico: con 50M de parámetros, puede resolver tareas sencillas de razonamiento, pero no se han publicado evaluaciones específicas.
- No se ha documentado soporte para tool calling, function calling, agentes o capacidades multimodales.
- No se ha especificado el soporte multilingüe; probablemente entrenado con datos en inglés, pero sin confirmación.
- Al ser un checkpoint de investigación, no se han caracterizado sus capacidades de forma exhaustiva.

## Casos de uso

- Investigación académica sobre token averaging: el modelo sirve para estudiar el efecto del promediado de tokens en la calidad de las representaciones y la eficiencia del entrenamiento, comparando con variantes k=4 o con posiciones aprendibles.
- Análisis de dinámicas de entrenamiento: los checkpoints intermedios permiten trazar la evolución de la pérdida y las métricas a lo largo del entrenamiento.
- Reproducción de experimentos: otros investigadores pueden cargar el `state_dict` y reproducir los resultados del proyecto, o extenderlos con nuevas variantes.
- Benchmark de eficiencia: al ser un modelo pequeño, puede usarse para medir el impacto del token averaging en el throughput de inferencia y el uso de memoria.
- Base para fine-tuning experimental: aunque no está en formato `transformers`, podría adaptarse para probar técnicas de fine-tuning en modelos pequeños.
- Comparación de arquitecturas: permite contrastar el rendimiento de un transformer con token averaging frente a un transformer estándar de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El proyecto parece estar en una fase inicial de investigación sin métricas públicas.

## Requisitos de hardware

- VRAM estimada: con 50,9M de parámetros en FP32, el modelo ocupa aproximadamente 204 MB de memoria. En FP16 serían unos 102 MB. Cabe holgadamente en cualquier GPU consumer moderna (incluso en iGPU con suficiente VRAM compartida).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia. Para entrenamiento o fine-tuning, una GPU de 4-8 GB sería adecuada.
- CPU: el modelo puede ejecutarse en CPU sin problemas, con latencias de milisegundos por token.
- Opciones de despliegue: al no estar en formato `transformers`, no se puede usar directamente con vLLM, Ollama o TGI. Requiere un script personalizado que reconstruya la arquitectura y cargue el `state_dict`. Podría convertirse a formato GGUF o safetensors si se desea integrar en herramientas estándar.
- Latencia y throughput: no se han publicado datos, pero por el tamaño del modelo, se espera una latencia inferior a 10 ms por token en GPU moderna y un throughput de varios cientos de tokens por segundo.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que la técnica de token averaging no es común en modelos públicos. Los checkpoints relacionados de FAIRC (`token-averaging-avg_50m_k4` y `token-averaging-avg_50m_k4_learnable_pos`) son variantes del mismo proyecto con diferente valor de k o embeddings posicionales aprendibles, pero no hay modelos de referencia establecidos. Un transformer estándar de 50M de parámetros (como GPT-2 pequeño o Pythia-70M) podría servir como baseline, pero no se han publicado comparaciones.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un checkpoint de investigación sin evaluación de calidad ni seguridad.
- No se especifica licencia, por lo que su uso comercial es incierto. Se recomienda contactar con FAIRC antes de cualquier uso.
- Los pesos no son compatibles con `transformers`; requieren reconstrucción manual de la arquitectura, lo que dificulta su adopción.
- No se conocen sesgos ni riesgos de alucinación al no haber sido evaluado en tareas estándar.
- El contexto de 1024 tokens es limitado para aplicaciones que requieran ventanas largas.
- No hay información sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos de contenido.
- La técnica de token averaging puede degradar la calidad en tareas que requieren información posicional precisa, aunque no hay datos que lo confirmen.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/FAIRC/token-averaging-avg_50m_k8)
- [Variante con k=4](https://huggingface.co/FAIRC/token-averaging-avg_50m_k4)
- [Variante con k=4 y posiciones aprendibles](https://huggingface.co/FAIRC/token-averaging-avg_50m_k4_learnable_pos)
