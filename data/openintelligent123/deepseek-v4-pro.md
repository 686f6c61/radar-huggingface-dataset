# Openintelligent123/DeepSeek-V4-Pro

## Resumen

DeepSeek-V4-Pro es un modelo de lenguaje de mezcla de expertos (MoE) desarrollado por DeepSeek AI y publicado en HuggingFace por el usuario Openintelligent123. Se presenta como una vista previa de la serie DeepSeek-V4 y destaca por ofrecer una ventana de contexto de un millón de tokens, lo que lo hace especialmente relevante para tareas que requieren procesar documentos completos, bases de código extensas o secuencias muy largas.

El modelo cuenta con 1,6 billones de parámetros totales y 49.000 millones de parámetros activos. Su arquitectura combina atención comprimida y una nueva técnica de hiperconexiones con restricción de variedad, además de emplear el optimizador Muon durante el entrenamiento. Según el informe técnico, el modelo se preentrenó con más de 32 billones de tokens y pasó por un proceso de post-entrenamiento en dos etapas que combina aprendizaje por refuerzo y destilación. En la actualidad, representa uno de los modelos abiertos más grandes con un rendimiento destacado en conocimiento, razonamiento y tareas agénticas, aunque su naturaleza de vista previa y su tamaño imponen restricciones prácticas de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion híbrida (CSA + HCA) |
| Parametros totales | 1.598.839.674.782 (~1,6 T) |
| Parametros activos | 49.000 millones (49 B) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP4 + FP8 mixto (expertos MoE en FP4, resto en FP8) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-V4-Pro emplea una arquitectura de mezcla de expertos con atencion híbrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA). Esta combinación mejora notablemente la eficiencia en contextos largos: según el informe, en una ventana de un millón de tokens el modelo requiere solo el 27% de los FLOPs de inferencia por token y el 10% del cache KV en comparación con DeepSeek-V3.2. Además, incorpora Manifold-Constrained Hyper-Connections (mHC), un mecanismo que refuerza las conexiones residuales convencionales para mejorar la estabilidad de la propagación de señales entre capas sin sacrificar expresividad.

El preentrenamiento se realizó sobre más de 32 billones de tokens diversos y de alta calidad. La fase de post-entrenamiento sigue un esquema de dos etapas: primero se cultivan expertos de dominio específico mediante ajuste supervisado y refuerzo con GRPO; después se consolidan en un único modelo mediante destilación on-policy. También se emplea el optimizador Muon, que aporta convergencia más rápida y estabilidad durante el entrenamiento. El modelo ofrece un modo de máximo esfuerzo de razonamiento denominado DeepSeek-V4-Pro-Max, que está diseñado para elevar el rendimiento en tareas de codificación y razonamiento complejo.

## Capacidades

- Generación de texto de alta calidad en tareas de conocimiento general y razonamiento, con evaluaciones destacadas en MMLU, MMLU-Pro, AGIEval y MMLU-Redux.
- Razonamiento avanzado mediante el modo Pro-Max, que aumenta el presupuesto de pensamiento para abordar problemas complejos de lógica y matemáticas.
- Procesamiento de documentos extremadamente largos gracias a una ventana de contexto de un millón de tokens, lo que permite analizar libros completos, expedientes legales o repositorios de código enteros.
- Rendimiento en tareas agénticas, como planificación y ejecución de flujos de trabajo multi-paso, según lo indicado en la documentación técnica.
- Capacidades de codificación de nivel competitivo, con resultados que mejoran sustancialmente la brecha frente a modelos cerrados en benchmarks de programación.
- Soporte multilingüe evidenciado en la evaluación con conjuntos de datos en chino e inglés, aunque la lista oficial de idiomas no está publicada.
- Eficiencia en inferencia de contexto largo, reduciendo drásticamente el consumo de memoria y cálculo en comparación con modelos anteriores de la misma familia.

## Casos de uso

- Análisis de documentos legales extensos: la ventana de un millón de tokens permite cargar contratos, sentencias o normativas completas y realizar consultas contextuales sin fragmentar el texto.
- Revisión de repositorios de código de gran tamaño: el modelo puede analizar la estructura completa de proyectos con miles de archivos, facilitando tareas de refactorización, generación de documentación o identificación de patrones.
- Sistemas de razonamiento científico: gracias al modo Pro-Max, puede abordar problemas matemáticos complejos, demostraciones o simulaciones conceptuales que requieren varios pasos de razonamiento.
- Agentes autónomos en entornos de software: su capacidad para tareas agénticas permite integrarlo en pipelines donde el modelo planifica acciones, ejecuta llamadas a herramientas y ajusta su estrategia, siempre que el entorno de despliegue sea compatible con este tipo de flujos.
- Asistencia en investigación académica: el modelo puede procesar simultáneamente decenas de artículos completos para resumir hallazgos, comparar metodologías o extraer conclusiones cruzadas.
- Soporte técnico y atención al cliente en sectores con documentación extensa: puede gestionar conversaciones largas y consultas multilenguaje, aunque la lista oficial de idiomas no está especificada.

## Benchmarks y rendimiento

Se han publicado resultados parciales para la versión base del modelo, comparando DeepSeek-V4-Pro-Base con DeepSeek-V3.2-Base y DeepSeek-V4-Flash-Base.

| Benchmark (métrica) | DeepSeek-V3.2-Base | DeepSeek-V4-Flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---|---|
| Parámetros activados | 37B | 13B | 49B |
| Parámetros totales | 671B | 284B | 1,6T |
| AGIEval (EM) | 80,1 | 82,6 | **83,1** |
| MMLU (EM) | 87,8 | 88,7 | **90,1** |
| MMLU-Redux (EM) | 87,5 | 89,4 | **90,8** |
| MMLU-Pro (EM) | 65,5 | 68,3 | **73,5** |
| MMMLU (EM) | 87,9 | 88,8 | **90,3** |
| C-Eval (EM) | 90,4 | 92,1 | **93,1** |
| CMMLU (EM) | 88,9 | 90,4 | **90,8** |

No se han publicado resultados de benchmarks adicionales (como HumanEval o GSM8K) en la información disponible.

## Requisitos de hardware

- No se dispone de requisitos oficiales de VRAM para inferencia.
- El peso del repositorio es de 864,7 GB, lo que implica que el despliegue requiere un clúster multi-GPU de alta capacidad. Es improbable que el modelo quepa en una GPU de consumo convencional.
- La etiqueta del repositorio indica compatibilidad con HuggingFace Inference Endpoints.
- El modelo está disponible en formato safetensors y es cargable con la librería Transformers, según la información de HuggingFace.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia |
|---|---|---|---|---|
| DeepSeek-V4-Pro | 1,6T | 49B | 1M | MIT |
| DeepSeek-V4-Flash | 284B | 13B | 1M | MIT |
| DeepSeek-V3.2 | 671B | 37B | No disponible | No indicada |

En los benchmarks de conocimiento general, DeepSeek-V4-Pro supera consistentemente tanto a DeepSeek-V3.2 como a DeepSeek-V4-Flash, especialmente en MMLU-Pro y AGIEval. A cambio, exige una infraestructura considerablemente mayor por su tamaño y su coste de memoria.

## Limitaciones y advertencias

- El modelo es una vista previa ("preview version"), por lo que su comportamiento en producción puede cambiar en versiones posteriores.
- El repositorio de HuggingFace pertenece al usuario Openintelligent123, no al equipo oficial de DeepSeek AI. Esto supone un riesgo de integridad y trazabilidad si se utiliza en entornos de producción.
- La lista oficial de idiomas no está disponible, por lo que su rendimiento en lenguas distintas del inglés y el chino no está verificado.
- No se han publicado datos sobre sesgos, alucinaciones o restricciones de seguridad.
- El tamaño de 1,6T de parámetros dificulta enormemente el despliegue en infraestructuras modestas, incluso con cuantización FP4/FP8.
- Aunque la licencia MIT permite uso comercial, la falta de resultados de benchmarks de tareas como HumanEval o GSM8K impide validar su rendimiento en escenarios concretos de código o matemáticas.

## Enlaces

- https://huggingface.co/Openintelligent123/DeepSeek-V4-Pro
- https://arxiv.org/abs/2606.19348
- https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-Base
- https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Pro
- https://chat.deepseek.com/
