# Nakshsolanki/indus-n-2-flash-preview

## Resumen

Indus N 2 Flash Preview es un adaptador PEFT (LoRA) publicado por el usuario Nakshsolanki bajo el paraguas de la familia "Indus Gen 2". El modelo se construye sobre `google/gemma-4-26B-A4B-it`, un transformer multimodal de tipo Mixture-of-Experts con 26.000 millones de parámetros totales y 4.000 millones activos por token, capaz de procesar entradas de texto e imagen y generar texto. El adaptador hereda la ventana de contexto de 256.000 tokens del modelo base y declara soporte para inglés e hindi.

El interés práctico del modelo reside en su naturaleza de preview: no se trata de un entrenamiento desde cero, sino de un ajuste fino ligero sobre un MoE multimodal de gran contexto, lo que permite experimentar con especialización (presumiblemente orientada a inglés e hindi) sin el coste de inferencia de un modelo denso de 26B. Al estar publicado como adaptador PEFT con licencia Apache 2.0, es desplegable sobre el modelo base con infraestructura estándar de Hugging Face.

La información pública es muy limitada: cero descargas, cero likes, sin benchmarks, sin detalle del dataset de ajuste ni de la metodología de entrenamiento. La ficha refleja lo declarado en la model card y en los metadatos de Hugging Face, marcando explícitamente como "no disponible" todo aquello que el autor no documenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal sobre transformer; adaptador PEFT (LoRA) sobre `google/gemma-4-26B-A4B-it` |
| Parámetros totales | 26B (modelo base); el adaptador añade un número no disponible de parámetros |
| Parámetros activos | 4B por token (modelo base) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantización | no disponible (el modelo base admite cuantizaciones estándar del ecosistema, pero el autor no las documenta) |
| Idiomas soportados | inglés (en), hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería declarada: `peft`; pesos del adaptador en formato PEFT, no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B-it` es un transformer multimodal con enrutamiento Mixture-of-Experts: 26.000 millones de parámetros totales de los que se activan 4.000 millones por token, lo que reduce el coste computacional de inferencia respecto a un denso equivalente. Procesa entradas de imagen y texto y produce texto, con una ventana de contexto de 256.000 tokens. Sobre esta base, Indus N 2 Flash Preview se distribuye como adaptador PEFT, es decir, un conjunto de pesos de bajo rango que se cargan junto al modelo base en lugar de sustituirlo.

No se dispone de información sobre el volumen de tokens de ajuste, la composición del dataset, el uso de RLHF/DPO ni de innovaciones técnicas propias del adaptador. La model card no documenta hiperparámetros de entrenamiento, rangos de LoRA, ni metodología de evaluación. Cualquier afirmación sobre el proceso de ajuste más allá de "adaptador PEFT sobre Gemma 4 26B-A4B" sería especulativa.

## Capacidades

- Generación de texto condicionada por imagen (pipeline `image-text-to-text`): descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Generación de texto y razonamiento general heredados del modelo base Gemma 4.
- Capacidades multilingües declaradas para inglés e hindi.
- Procesamiento de contextos largos de hasta 256K tokens, útil para documentos extensos o conversaciones multi-turno prolongadas.
- Soporte de tool calling / function calling: no documentado por el autor; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado por el autor; no disponible.
- Modo "thinking" explícito, audio u otras modalidades: no documentado; solo texto e imagen de entrada.

## Casos de uso

- Procesamiento de documentos largos en inglés o hindi: el contexto de 256K tokens permite ingerir informes, contratos o expedientes completos y formular preguntas sobre ellos sin fragmentación.
- Análisis de imágenes con salida textual: extracción de información de capturas, gráficos o documentos escaneados en flujos de digitalización.
- Asistentes conversacionales bilingües inglés-hindi para mercados del sur de Asia, aprovechando el soporte declarado de ambos idiomas.
- Experimentación e investigación sobre adaptadores PEFT: al ser un preview ligero sobre un MoE, sirve para estudiar el efecto de ajustes de bajo rango en modelos multimodales sin reentrenar la base.
- Prototipado rápido de aplicaciones multimodales: el despliegue se reduce a cargar el adaptador sobre Gemma 4 26B-A4B, sin necesidad de un pipeline propio.
- Evaluación comparativa de variantes "flash": útil para medir latencia y calidad frente al modelo base en tareas de visión-lenguaje, dado el perfil MoE de 4B activos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no documenta métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación del autor. Como referencia del modelo base, un MoE de 26B totales y 4B activos requiere cargar todos los pesos en memoria; en BF16 serían aproximadamente 52 GB solo de pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: no documentadas por el autor. Para el modelo base en precisión completa se necesitan GPU de 80 GB (A100, H100) o varias GPU con tensor parallelism.
- Viabilidad en GPU de consumo: no confirmada. Con cuantización agresiva del modelo base podría intentarse en GPUs de 24 GB (RTX 4090), pero el adaptador no documenta recetas de cuantización ni compatibilidad con llama.cpp/GGUF.
- Opciones de despliegue: al ser un adaptador PEFT, el flujo natural es `transformers` + `peft` sobre el modelo base; vLLM, TGI u Ollama no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Indus N 2 Flash Preview | 26B (base) + adaptador | 4B | 256K | Apache 2.0 | Adaptador PEFT multimodal, sin benchmarks publicados |
| google/gemma-4-26B-A4B-it | 26B | 4B | 256K | Apache 2.0 (según model card del adaptador) | Modelo base oficial, con documentación y evaluaciones del desarrollador |
| Alternativas MoE multimodales de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación relevante es contra su propio modelo base: el adaptador no aporta cambios de arquitectura ni de contexto, solo un ajuste de pesos cuyo efecto cuantitativo no está publicado.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentación de entrenamiento: no es posible estimar la calidad del ajuste ni su degradación respecto al modelo base.
- Modelo en estado "preview": la model card lo etiqueta como vista previa, lo que implica que puede cambiar o retirarse sin aviso.
- Riesgo de alucinación inherente a los modelos generativos, no mitigado ni evaluado por el autor.
- Sesgos: no documentados; al heredar el modelo base y ajustarse sobre datos desconocidos, los sesgos del ajuste son imposibles de auditar.
- Idiomas: solo se declaran inglés e hindi; el rendimiento en castellano no está garantizado ni evaluado.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma 4, cuyos términos pueden imponer restricciones adicionales.
- Sin métricas de latencia ni recetas de cuantización, el coste real de despliegue en producción es incierto.
- Cero descargas y cero interacciones: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nakshsolanki/indus-n-2-flash-preview
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Space "Indus AI Model Experiment": no disponible (mencionado en la model card sin URL)
- Paper, blog o repositorio adicionales: no disponibles
