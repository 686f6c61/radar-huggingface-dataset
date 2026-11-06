# shkelqim2026/EfficientNet

## Resumen

El repositorio `shkelqim2026/EfficientNet` contiene los pesos entrenados de la familia completa EfficientNet (B0 a B7) para una tarea de clasificación de imágenes de tomografía de coherencia óptica de dominio espectral (SD-OCT) retiniana en cuatro clases: CNV, DME, Drusen y Normal. El trabajo corresponde a Shkëlqim Sherifi (University of Tetova) y compara los ocho miembros de la familia bajo un protocolo común de transfer learning con resolución fija de 224 × 224 píxeles, partiendo siempre de pesos preentrenados en ImageNet.

El modelo no es un modelo generativo de lenguaje ni un transformer: son redes convolucionales EfficientNet (arquitectura con compound scaling de profundidad, anchura y resolución) reutilizadas como extractores de características y adaptadas mediante una cabeza de clasificación de cuatro salidas. El resultado principal del estudio sitúa a EfficientNet-B1 como el mejor variante con un 96,95 % de accuracy en test, aunque el autor advierte explícitamente que se trata de un prototipo de investigación sin validación clínica.

La relevancia actual es metodológica: ofrece una comparación reproducible del escalado dentro de la familia EfficientNet con resolución de entrada constante, junto con los pesos resultantes, lo que permite reproducir el experimento y estudiar errores por clase, interpretabilidad y coste computacional en un dominio médico concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet (CNN con compound scaling), variantes B0 a B7 |
| Parametros totales | B0: 4,84 M; B1: 7,37 M; B2: 8,63 M; B3: 11,71 M; B4: 18,73 M; B5: 29,70 M; B6: 42,28 M; B7: 65,54 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224 × 224 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas de la model card; la tarea es de visión, no lingüística) |
| Licencia | MIT |
| Formato de pesos | Keras (librería `keras`); formatos concretos de fichero no disponibles |

## Arquitectura y entrenamiento

Cada variante es una EfficientNet preentrenada en ImageNet (`weights='imagenet'`, `include_top=False`) a la que se añade una cabeza de clasificación de cuatro clases. La entrada se fija en 224 × 224 píxeles para todas las variantes, de modo que el escalado entre B0 y B7 se evalúa sin variar la resolución, aislando el efecto de la profundidad y anchura de la red. Las imágenes OCT en escala de grises se convierten a tres canales replicando el canal único, y se conserva el preprocesamiento embebido de EfficientNet.

El entrenamiento utiliza el dataset Kermany SD-OCT de cuatro clases con 109.309 imágenes (76.515 de entrenamiento, 21.861 de validación y 10.933 de test). La distribución está desbalanceada (Normal y CNV sobrerrepresentadas frente a Drusen y DME) y se aplicaron pesos de clase para compensarlo. La única aumentación reportada durante el entrenamiento es el volteo horizontal aleatorio. No se documentan fases de ajuste fino selectivo, número de épocas, optimizador ni tasa de aprendizaje en la información disponible.

## Capacidades

- Clasificación de imágenes SD-OCT en cuatro clases: CNV, DME, Drusen y Normal, con salida de distribución de probabilidad en ese orden exacto.
- Extracción de características visuales mediante backbones EfficientNet preentrenados en ImageNet y adaptados al dominio OCT.
- Comparación controlada del escalado dentro de la familia EfficientNet a resolución fija de 224 × 224.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica; el modelo no procesa texto.
- Capacidades especiales (modo thinking, visión general, audio): únicamente clasificación de imágenes OCT; no es un modelo multimodal general.

## Casos de uso

- Reproducción de experimentos de transfer learning: cargar los pesos en Keras y replicar el protocolo de resolución fija para verificar los resultados reportados y estudiar la variabilidad entre variantes B0-B7.
- Investigación metodológica sobre escalado de CNNs: usar las ocho variantes para medir cómo afectan parámetros y coste computacional a la accuracy en un mismo dataset y resolución, sin confundir el efecto con cambios de tamaño de entrada.
- Análisis de errores por clase en dominios médicos desbalanceados: aprovechar la matriz de confusión y las métricas precision, recall y F1 para estudiar el comportamiento frente a clases minoritarias como Drusen y DME.
- Docencia en visión por computador médica: emplear el conjunto de modelos como ejemplo práctico de transfer learning, preprocesamiento de imágenes en escala de grises y manejo de desbalance de clases con pesos.
- Estudio de interpretabilidad: aplicar técnicas de mapas de saliencia o Grad-CAM sobre los backbones B0-B7 para comparar qué regiones de la imagen OCT activan cada variante.
- Benchmarking de eficiencia: comparar latencia y memoria de B0 frente a B7 en el mismo hardware para decidir qué variante usar como línea base en experimentos posteriores.
- Prototipado de pipelines de clasificación de imágenes médicas: integrar el modelo como componente de un pipeline de investigación (no clínico) para etiquetar lotes de imágenes OCT y analizar su distribución de probabilidades.

## Benchmarks y rendimiento

El autor reporta como resultado principal que EfficientNet-B1 alcanzó la mayor accuracy de test (96,95 %) en este experimento. No se han publicado en la información disponible las tablas completas de accuracy, precision, recall y F1 por variante ni comparaciones numéricas con otros modelos.

| Modelo | Accuracy en test | Notas |
|---|---|---|
| EfficientNet-B1 | 96,95 % | Mejor resultado reportado del estudio |
| EfficientNet-B0, B2-B7 | no disponible | Resultados por variante no incluidos en la información proporcionada |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de parámetros, B0-B3 son manejables en GPUs de consumo (del orden de pocos GB con batch pequeño) y B6-B7 requieren GPUs de mayor memoria, aunque no se aportan cifras concretas.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: plausible para las variantes pequeñas (B0-B3) por su bajo número de parámetros, pero sin datos verificados.
- Opciones de despliegue: Keras (librería declarada del repositorio); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNet-B0 (este repo) | 4,84 M | 224 × 224 | 4 clases OCT | MIT | Hugging Face |
| EfficientNet-B7 (este repo) | 65,54 M | 224 × 224 | 4 clases OCT | MIT | Hugging Face |
| EfficientNet ImageNet original | 5,3 M (B0) | 224 × 224 | 1000 clases ImageNet | Apache 2.0 (referencia) | Keras / TensorFlow |
| Otros clasificadores OCT | no disponible | no disponible | clasificación OCT | no disponible | no disponible |

La comparación con alternativas específicas de clasificación OCT no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Restricción de uso explícita: son modelos de investigación, no dispositivos médicos; no deben usarse como única base para diagnóstico, cribado, triaje, tratamiento ni decisiones de manejo del paciente.
- El uso clínico requeriría validación independiente, revisión regulatoria y evaluación en el entorno clínico previsto.
- El estudio no verifica separación a nivel de paciente ni realiza una auditoría independiente de imágenes duplicadas entre particiones; los resultados de test no deben interpretarse como prueba de generalización a pacientes no vistos.
- Los resultados están ligados al dataset Kermany y a sus definiciones de etiqueta; pueden no transferirse a otras cámaras, clínicas, poblaciones o protocolos de adquisición.
- El dataset está desbalanceado (Normal y CNV sobrerrepresentadas), lo que puede sesgar el rendimiento hacia esas clases pese al uso de pesos de clase.
- Riesgo de alucinación en sentido estricto no aplica; el riesgo equivalente es la clasificación errónea con alta confianza en imágenes fuera de distribución.
- No debe usarse sobre fotografías de fondo de ojo, otras modalidades de imagen u otros datasets OCT sin nueva validación.
- No se documentan sesgos demográficos ni de adquisición más allá de las advertencias sobre procedencia del dataset.
- La licencia MIT permite uso comercial del software, pero la restricción de uso médico del autor y la falta de validación clínica limitan cualquier aplicación en producción sanitaria.

## Enlaces

- Hugging Face: https://huggingface.co/shkelqim2026/EfficientNet
- Estudio de referencia: *Within-Family EfficientNet Scaling under Fixed-Resolution Transfer Learning for Spectral-Domain Optical Coherence Tomography Retinal Disease Classification* (Shkëlqim Sherifi, University of Tetova); enlace directo no disponible.
- Dataset Kermany SD-OCT: no se proporciona enlace en la información disponible.
- Paper original de EfficientNet: no se proporciona enlace en la información disponible.
- Repositorio de código: no disponible.
