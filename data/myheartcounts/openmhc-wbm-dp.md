# MyHeartCounts/openmhc-wbm-dp

## Resumen

OpenMHC WBM (Wearable Behavior Model) es un checkpoint de referencia publicado por el proyecto MyHeartCounts dentro del benchmark OpenMHC, orientado a la predicción de resultados de salud y comportamiento a partir de datos de wearables. Se trata de un encoder basado en Mamba2 bidireccional que transforma una semana de datos de sensores (168 pasos horarios, 19 canales) en una representación densa de 256 dimensiones, entrenado con un objetivo contrastivo auto-supervisado.

El modelo es una reimplementación abierta del WBM de Apple presentado en el artículo *Beyond Sensor Data: Foundation Models of Behavioral Data from Wearables Improve Health Predictions* (2025). Su relevancia actual radica en que abre a la investigación un componente que hasta ahora solo existía como descripción metodológica en la literatura, permitiendo reproducir y comparar resultados sobre el benchmark OpenMHC.

El checkpoint se distribuye como fichero de PyTorch Lightning junto con estadísticas de normalización canónicas, y está pensado exclusivamente para investigación y reproducción metodológica. La evaluación se realiza sobre 33 etiquetas de salud y comportamiento que abarcan clasificación, regresión y clasificación ordinal, emparejando el encoder (con pooling por usuario, PCA a 50 dimensiones y sonda lineal) con un fallback lineal para usuarios sin embedding semanal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba2 bidireccional (encoder contrastivo auto-supervisado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 168 pasos horarios (una semana de datos de wearable) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo sobre series temporales de sensores, no texto) |
| Licencia | BigScience OpenRAIL-M |
| Formato de pesos | Checkpoint de PyTorch Lightning (`model.ckpt`) + `normalization_stats.json` |

## Arquitectura y entrenamiento

El encoder emplea una arquitectura Mamba2 bidireccional, una variante de los modelos de espacio de estados (SSM) que procesa secuencias en ambas direcciones para capturar dependencias temporales en los datos de wearables. La entrada es una secuencia de 168 pasos horarios con 19 canales de sensores, que se proyecta a una representación de 256 dimensiones mediante un objetivo contrastivo auto-supervisado. La normalización se aplica con estadísticas z-score horarias canónicas: los canales 0 a 6 se normalizan y los canales 7 a 18 se dejan como identidad.

El preentrenamiento se realizó sobre el split de entrenamiento del benchmark MHC (MyHeartCounts) con la mencionada pérdida contrastiva. El pipeline de evaluación reportado combina el encoder con un pooling por usuario, reducción PCA a 50 dimensiones y una sonda lineal sobre las 33 etiquetas de resultado; para usuarios sin embedding semanal se utiliza un modelo lineal de respaldo. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO.

## Capacidades

- Extracción de representaciones a partir de series temporales de wearables: convierte una semana de datos de 19 canales en un vector de 256 dimensiones.
- Predicción de 33 etiquetas de salud y comportamiento, incluyendo tareas de clasificación binaria, clasificación ordinal y regresión.
- Aprendizaje auto-supervisado contrastivo, lo que permite aprovechar datos sin etiquetar para preentrenamiento.
- Manejo de usuarios sin embedding semanal mediante un modelo lineal de respaldo integrado en el pipeline de evaluación.
- Procesamiento de secuencias largas de sensores (168 pasos) gracias a la eficiencia de Mamba2 frente a atención cuadrática.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un encoder especializado en datos de sensores, no un modelo de lenguaje.

## Casos de uso

- Reproducción del benchmark OpenMHC: el checkpoint permite ejecutar `openmhc.evaluate_prediction` y comparar resultados con otras implementaciones sobre las mismas 33 etiquetas, sirviendo como línea base metodológica.
- Investigación en representaciones de wearables: usar el encoder congelado para extraer embeddings semanales y entrenar sondas ligeras sobre cohortes propias, aprovechando que la representación es de solo 256 dimensiones.
- Comparación de arquitecturas SSM frente a transformers en datos de sensores: al ser una implementación abierta de Mamba2 bidireccional, permite estudiar el equilibrio entre coste computacional y calidad de representación en series temporales sanitarias.
- Estudio de transferencia entre cohortes: evaluar cómo se comportan los embeddings preentrenados en el split MHC al aplicarse a subpoblaciones con distribuciones de actividad distintas.
- Análisis de ablación de canales: modificar el pipeline de normalización (canales 0-6 frente a 7-18) y medir el impacto en las tareas de predicción, algo viable gracias a que las estadísticas se distribuyen por separado.
- Docencia y formación en aprendizaje auto-supervisado aplicado a salud digital: el modelo sirve como ejemplo completo de preentrenamiento contrastivo, pooling por usuario y evaluación con sondas lineales sobre datos reales de wearables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo de Apple (arXiv:2507.00191) y al resumen de Apple Machine Learning Research para los resultados del WBM original, pero no incluye cifras propias del checkpoint reimplementado.

## Requisitos de hardware

- GPU con CUDA obligatoria: el encoder requiere los kernels de Mamba2 (`mamba-ssm`), que solo están disponibles para CUDA.
- VRAM estimada: no disponible en la información proporcionada; el tamaño del repositorio (0,1 GB) sugiere un checkpoint pequeño, pero no se especifican parámetros ni precisión de almacenamiento.
- GPU recomendadas: no disponible. Dado el requisito de `mamba-ssm`, se necesita una GPU NVIDIA compatible con los kernels compilados; no se detallan modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la documentación; depende de la compilación de `mamba-ssm` para la arquitectura concreta.
- Opciones de despliegue: el paquete `openmhc` con el extra `[hf]` (`pip install "openmhc[hf]"`) más `mamba-ssm`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Representación | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OpenMHC WBM (este) | Mamba2 bidireccional | 168 pasos x 19 canales | 256 dimensiones | 168 pasos horarios | BigScience OpenRAIL-M | Hugging Face (`MyHeartCounts/openmhc-wbm-dp`) |
| WBM de Apple (original) | No especificada en la información disponible | Datos de wearables | No disponible | No disponible | No disponible | No distribuido públicamente según la información disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros encoders de wearables comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Uso previsto exclusivamente para investigación, comparación metodológica y reproducción del benchmark OpenMHC.
- Queda fuera de alcance cualquier uso diagnóstico, de cribado, pronóstico, predicción prospectiva de riesgo o apoyo a decisiones clínicas.
- Las etiquetas de condiciones médicas de OpenMHC son autoinformadas y carecen de fechas de diagnóstico; el rendimiento en el benchmark no establece utilidad clínica.
- Cualquier afirmación diagnóstica o pronóstica requeriría validación independiente con resultados adjudicados clínicamente y alineados temporalmente en la población objetivo.
- La licencia BigScience OpenRAIL-M incluye restricciones de uso en su Anexo A que prohíben, entre otras cosas, proporcionar consejo médico e interpretación de resultados médicos.
- Dependencia de kernels CUDA propietarios de facto (`mamba-ssm`), lo que limita el despliegue en entornos sin GPU NVIDIA.
- No se documentan sesgos conocidos, tasas de alucinación (no aplica en el sentido habitual, al no ser un modelo generativo de texto) ni limitaciones idiomáticas.
- No se especifican los parámetros totales del modelo, lo que dificulta estimar costes de inferencia sin ejecutar el checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/MyHeartCounts/openmhc-wbm-dp
- Paper (Apple, 2025): https://arxiv.org/abs/2507.00191
- Resumen de Apple Machine Learning Research: https://machinelearning.apple.com/research/beyond-sensor
- Licencia (BigScience OpenRAIL-M): incluida en el repositorio como `LICENSE`
- Manifiesto de procedencia: `openmhc_manifest.json` en el repositorio
