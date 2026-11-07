# leeely/insarag-triage-dinov3-vits16

## Resumen

`leeely/insarag-triage-dinov3-vits16` es un modelo de clasificación de imágenes especializado en la evaluación de daños estructurales tras un terremoto. Clasifica un recorte de un único edificio, tomado de una fotografía a pie de calle, en una escala ordinal de seis grados que va de A (edificio intacto) a F (escombros), siguiendo la lógica de triaje de la INSARAG (International Search and Rescue Advisory Group). Lo desarrolla el autor independiente `leeely` y se publica bajo la licencia propia de DINOv3.

El modelo parte del backbone DINOv3 ViT-S/16 (21,6 millones de parámetros) de Meta y aplica un ajuste fino parcial: solo se reentrenan los cuatro últimos bloques del transformer, a los que se añade una cabeza de clasificación ordinal CORN. La entrada se procesa a 448 píxeles con letterboxing, y las predicciones finales se obtienen promediando tres semillas de entrenamiento distintas.

Su relevancia es acotada y muy específica: cubre un nicho de ayuda humanitaria (priorización de rescates y evaluación rápida de daños) con un modelo pequeño que puede ejecutarse en hardware modesto. El entrenamiento se limita a 1.620 recortes etiquetados de los terremotos de Turquía de febrero de 2023, y el propio autor advierte que no se ha probado en otros eventos, tipologías de edificio ni imágenes aéreas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-S/16 (transformer de visión) con cabeza ordinal CORN; ajuste fino de los 4 últimos bloques |
| Parametros totales | 21,6 M (backbone); no disponible el total incluyendo la cabeza |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada de imagen a 448 px con letterboxing |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | DINOv3 License (`LICENSE-DINOv3.md`) |
| Formato de pesos | checkpoints PyTorch (`model_seed*.pt`); repo de 0,3 GB |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone DINOv3 ViT-S/16, un transformer de visión con parches de 16×16 y 21,6 millones de parámetros, preentrenado por Meta con destilación autosupervisada sobre el dataset LVD-1689M. Sobre esa base, el autor congela la mayor parte de la red y ajusta únicamente los cuatro últimos bloques, lo que reduce coste de entrenamiento y riesgo de sobreajuste con un dataset pequeño. La cabeza de salida es CORN (Conditional Ordinal Regression for Neural networks), adecuada para etiquetas ordinales donde el orden importa (A < B < C < D < E < F) y donde los errores entre grados contiguos son menos graves que los errores lejanos.

El conjunto de entrenamiento consta de 1.620 recortes etiquetados procedentes de los terremotos de Turquía de febrero de 2023. Se entrenan tres semillas independientes y la predicción final es la media de las tres, una forma sencilla de ensemble que reduce varianza. La entrada se normaliza a 448 píxeles con letterboxing para preservar la relación de aspecto. No se documentan en la información disponible detalles sobre aumentos de datos, número de épocas, función de pérdida exacta ni uso de RLHF/DPO (no aplicable en clasificación).

## Capacidades

- Clasificación de imágenes de edificios individuales en una escala ordinal de seis grados (A a F) según daño estructural aparente.
- Regresión ordinal mediante cabeza CORN, que explota el orden entre clases en lugar de tratarlas como categorías independientes.
- Ensemble por media de tres semillas de entrenamiento para estabilizar predicciones.
- Procesamiento de recortes a pie de calle con entrada de 448 px y letterboxing.
- No soporta tool calling, function calling, agentes ni razonamiento multi-turno.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la clasificación visual.

## Casos de uso

- Triaje rápido de edificios tras un seísmo: a partir de fotografías a pie de calle tomadas por equipos de campo, el modelo asigna un grado A–F que ayuda a priorizar qué estructuras inspeccionar primero. Es adecuado por su tamaño reducido y su enfoque ordinal, que refleja la gravedad creciente del daño.
- Apoyo a herramientas de evaluación de daños en aplicaciones móviles: al ser un ViT-S/16 con ajuste fino parcial, puede desplegarse en dispositivos con recursos limitados para preclasificar imágenes antes de una revisión humana.
- Filtrado previo en flujos de trabajo de respuesta humanitaria: procesar lotes de imágenes recibidas desde el terreno y ordenarlas por grado de daño estimado, de modo que los analistas revisen primero los casos D–F.
- Investigación en evaluación de daños sísmicos: el modelo sirve como línea base reproducible (con tres semillas y pesos publicados) para comparar futuros enfoques de clasificación ordinal en este dominio.
- Etiquetado asistido de nuevos datasets: usar las predicciones como preetiquetas para acelerar la anotación manual de recortes de edificios, con revisión humana obligatoria.
- Docencia y experimentación con cabezas ordinales: ejemplo práctico de cómo adaptar un backbone DINOv3 con CORN para un problema de regresión ordinal en visión, reutilizable en otros dominios con etiquetas ordenadas.
- No debe usarse como sustituto de una evaluación estructural in situ ni para decisiones de seguridad sin validación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (exactitud, MAE ordinal, matriz de confusión) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un ViT-S/16 a 448 px cabe holgadamente en GPUs de consumo. No se dispone de cifras oficiales de VRAM en la información proporcionada.
- GPU recomendadas: cualquier GPU moderna con al menos 4–8 GB de VRAM es suficiente en FP32 para un modelo de este tamaño; una RTX 3060, RTX 4060 o superior resulta adecuada. Para lotes grandes, A100 o H100 no son necesarias pero aceleran el throughput.
- Cabe en GPU de consumo: sí, con amplio margen, incluidas GPUs de gama media y posiblemente aceleradores de borde (el backbone DINOv3 ViT-S/16 tiene conversiones CoreML publicadas por terceros).
- Opciones de despliegue: PyTorch nativo mediante el paquete `insarag_triage` del autor; exportación a ONNX o CoreML posible a partir del backbone, aunque no se documenta oficialmente para este checkpoint. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `leeely/insarag-triage-dinov3-vits16` | 21,6 M (backbone) | Clasificación ordinal de daño sísmico (A–F) | Imagen 448 px | DINOv3 License | Hugging Face, 0 descargas |
| `facebook/dinov3-vits16-pretrain-lvd1689m` | 21,6 M | Backbone visual autosupervisado (features) | Imagen (resolución variable) | DINOv3 License | Hugging Face |
| `SharpAI/dinov3-vits16-pretrain-lvd1689m-coreml-FP32-448x448` | 21,6 M | Backbone visual convertido a CoreML | Imagen 448 px | DINOv3 License | Hugging Face |

No se dispone de información sobre otros modelos especializados en triaje INSARAG o clasificación de daño sísmico con los que comparar directamente. Las alternativas listadas son variantes del mismo backbone, no modelos de la misma tarea.

## Limitaciones y advertencias

- Entrenado solo con 1.620 recortes de los terremotos de Turquía de febrero de 2023; no se ha probado en otros eventos, tipologías de edificio ni imágenes aéreas, por lo que la generalización es incierta.
- La mayoría de errores se producen entre grados contiguos; los límites A/B y D/E son los menos consistentes también en el etiquetado humano, lo que introduce ambigüedad inherente.
- No debe sustituir una evaluación estructural in situ; el propio autor lo indica explícitamente.
- Riesgo de sesgo por la composición del dataset (un único evento, una región geográfica y un tipo de fotografía a pie de calle).
- Riesgo de alucinación en el sentido de asignar un grado con alta confianza a imágenes fuera de distribución (edificios de otra tipología, iluminación distinta, ángulos no vistos).
- Licencia DINOv3: conviene revisar `LICENSE-DINOv3.md` antes de cualquier uso comercial; no es una licencia permisiva estándar y puede imponer restricciones.
- Sin métricas publicadas de rendimiento, no es posible estimar su fiabilidad cuantitativa en producción.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leeely/insarag-triage-dinov3-vits16
- Código y documentación: https://github.com/leeelyehezkel/insarag-damage-triage
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Backbone original: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- Conversión CoreML del backbone: https://huggingface.co/SharpAI/dinov3-vits16-pretrain-lvd1689m-coreml-FP32-448x448
