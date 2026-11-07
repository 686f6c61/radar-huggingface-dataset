# addisonbk/calorie-lens-onnx

## Resumen

Calorie Lens ONNX es una exportación comunitaria a formato ONNX del modelo `shalev396/calorie-lens`, un sistema de visión por computador orientado a la estimación aproximada de calorías y macronutrientes a partir de una única fotografía de comida. La conversión la firma el usuario `addisonbk` y no constituye un nuevo entrenamiento ni una release oficial del autor original: se limita a trasladar los pesos FP32 originales a un grafo ONNX autocontenido de 356.487.372 bytes (0,356 GB), pensado para inferencia local en escritorio y dispositivos móviles sin conexión de red.

El interés de esta ficha radica en que el artefacto empaqueta todo el pipeline de inferencia en un único fichero: no hay fichero de pesos externo, ni tokenizador, ni calculadora de texto asociada. El grafo incluye el preprocesado de normalización ImageNet y las dos vistas de imagen (original y volteada horizontalmente), de modo que el host solo debe entregar un tensor `float32` de forma fija `[1, 3, 378, 504]`. La salida combina masas de ingredientes, logits de presencia y totales auxiliares, que deben postprocesarse con una tabla de composición de 253 ingredientes incluida en el `config.json` del publicador.

La relevancia actual del modelo es acotada pero clara: cubre el nicho de aplicaciones de seguimiento nutricional offline, donde el usuario fotografía un plato y recibe un borrador editable de nutrientes. No es un modelo de lenguaje ni un sistema multimodal general; es un modelo de visión especializado con vocabulario de ingredientes en inglés y licencia MIT, lo que facilita su integración en apps móviles con ONNX Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de visión (derivada de DINOv2) con cabecera de reconciliación de ingredientes; grafo ONNX opset 17 |
| Parametros totales | no disponible (pesos FP32 en fichero de 0,356 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen fija `[1, 3, 378, 504]`) |
| Tipos de cuantizacion | solo FP32 (la exportación no aplica cuantización) |
| Idiomas soportados | inglés (vocabulario de ingredientes en inglés) |
| Licencia | MIT (incluye avisos NOTICE y licencia Apache-2.0 de DINOv2) |
| Formato de pesos | ONNX (`calorie_lens_image_fp32.onnx`, autocontenido, sin fichero de pesos externo) |

## Arquitectura y entrenamiento

El modelo base `shalev396/calorie-lens` es un sistema de visión para estimación nutricional que combina un backbone de tipo DINOv2 (bajo licencia Apache-2.0, según los avisos incluidos) con una cabecera que reconcilia masas de ingredientes. La exportación conserva el forward de imagen original y la etapa de reconciliación, y elimina la calculadora de texto NutriText, que no se usa en el camino de inferencia. Técnicamente, la conversión precalcula la rejilla exacta de embeddings posicionales a resolución fija y rebaja las operaciones `expm1` y `log1p` a primitivas ONNX (Exp/Sub y Log/Add), manteniendo los pesos en FP32 y la inferencia de dos vistas dentro del grafo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que la model card de la exportación no los detalla. El modelo está asociado al conjunto Nutrition5k, según indica el propio autor de la conversión, pero no se especifica qué partición se usó para entrenamiento ni el volumen exacto de imágenes. La validación de la exportación se limitó a comparar el grafo ONNX con la implementación PyTorch original en 10 fotos de Nutrition5k, con diferencias máximas de 0,01 en los nutrientes finales y decisiones de presencia idénticas; se trata de paridad de exportación, no de un estudio independiente de precisión nutricional.

## Capacidades

- Estimación de ingredientes presentes en una fotografía de comida, con 253 etiquetas posibles en inglés.
- Estimación de masa en gramos por ingrediente mediante la salida `grams` de forma `[1, 253]`.
- Cálculo de masa no asignada a ningún ingrediente identificado mediante la salida `mass_gap`.
- Cálculo de totales auxiliares de kcal, masa, grasa, carbohidratos y proteína en escala log1p (salida `log_totals`), que no constituyen la estimación final.
- Inferencia de dos vistas (imagen original y volteada horizontalmente) integrada en el propio grafo.
- Funcionamiento completamente offline: no requiere API de inferencia ni conexión de red.
- Preprocesado de normalización ImageNet incluido en el grafo, lo que simplifica la integración en el host.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o vídeo.

## Casos de uso

- Aplicación móvil de seguimiento nutricional offline: el usuario fotografía un plato y la app ejecuta una sesión local de ONNX Runtime para obtener un borrador de ingredientes y nutrientes que luego revisa y corrige. La ausencia de red y el tamaño contenido del fichero (0,356 GB) encajan con el almacenamiento típico de un móvil de gama alta.
- Diario de comidas sin conectividad: en entornos sin cobertura (viajes, zonas rurales), el modelo permite registrar estimaciones aproximadas de kcal y macros sin depender de servicios en la nube.
- Etiquetado asistido en investigación dietética: investigadores pueden usar el modelo para preanotar imágenes de estudios observacionales y revisar manualmente las predicciones, reduciendo el coste de anotación frente a un etiquetado completamente manual.
- Prototipado rápido en escritorio: con `pip install numpy pillow onnxruntime` y el script `predict.py` incluido, un desarrollador puede validar el pipeline completo en minutos antes de portarlo a móvil.
- Integración en apps React Native: la exportación se ha ejecutado en ONNX Runtime React Native 1.24.3 sobre simulador iOS, lo que sirve como punto de partida para apps multiplataforma, aunque el rendimiento en dispositivos físicos y la inferencia en Android no están verificados.
- Educación nutricional interactiva: una app puede mostrar al usuario los ingredientes detectados y sus masas estimadas, invitándole a ajustar las porciones y comprendiendo así el impacto de cada componente en el total calórico.
- Filtrado previo en pipelines de análisis de menús: el modelo puede actuar como primera etapa que descarta imágenes sin comida o genera candidatos de ingredientes, que después se validan con un sistema más costoso o con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una comparación de paridad de exportación frente a la implementación PyTorch original en 10 fotos de Nutrition5k, con una diferencia máxima de 0,01 en los nutrientes finales y decisiones de presencia idénticas. No se aportan métricas como MMLU, HumanEval o GSM8K, que además no aplican a un modelo de visión especializado.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un grafo FP32 de 0,356 GB, la huella de pesos ronda los 0,36 GB; con activaciones y buffers de inferencia, es razonable esperar un consumo de entre 1 y 2 GB de memoria, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no se especifican. El modelo está pensado para ejecución en CPU y en dispositivos móviles mediante ONNX Runtime; una GPU consumer como una RTX 4090 no aporta ventajas claras frente a CPU para este tamaño de grafo.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño reducido del fichero. También cabe en memoria unificada de dispositivos móviles de gama alta.
- Opciones de despliegue: ONNX Runtime en escritorio (Python), ONNX Runtime Mobile y ONNX Runtime React Native. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card indica que el rendimiento en teléfonos físicos, la inferencia en Android y la captura de cámara permanecen sin verificar.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Calorie Lens ONNX (esta ficha) | Visión, estimación nutricional | no disponible (0,356 GB FP32) | Imagen fija 378 × 504 | MIT | ONNX autocontenido en Hugging Face |
| `shalev396/calorie-lens` | Visión, estimación nutricional | no disponible | Imagen (implementación PyTorch) | MIT | Pesos PyTorch en Hugging Face |
| Modelos genéricos de clasificación de alimentos (p. ej. Food-101) | Clasificación de imágenes | variable | Imagen | variable | Múltiples repositorios |
| Modelos de visión-lenguaje generales (p. ej. LLaVA) | Multimodal | miles de millones | Imagen + texto | variable | Pesos y demos públicas |

La comparación directa con alternativas es limitada porque no se dispone de métricas de precisión nutricional publicadas para este modelo ni para el original. Frente a clasificadores de alimentos tipo Food-101, la diferencia clave es que Calorie Lens no solo identifica la categoría, sino que estima masas y composición nutricional, aunque con mayor incertidumbre. Frente a modelos de visión-lenguaje generales, la ventaja es el tamaño reducido y la ejecución offline en móvil; la desventaja es la ausencia de razonamiento textual y de vocabulario multilingüe.

## Limitaciones y advertencias

- La estimación nutricional es aproximada: la identificación de ingredientes, los ingredientes ocultos y las estimaciones de porción pueden ser erróneos.
- Una única fotografía RGB no proporciona peso medido; la masa se infiere visualmente y puede desviarse notablemente en platos con densidad o profundidad desconocidas.
- El vocabulario de ingredientes es exclusivamente en inglés (253 etiquetas), lo que limita su uso en cocinas no anglosajonas.
- El modelo está asociado a Nutrition5k; su rendimiento en otras cocinas y en fotos reales de teléfono no está establecido por las comprobaciones de exportación.
- La validación de paridad se hizo sobre solo 10 fotos; no es un estudio independiente de precisión nutricional.
- La interpolación de imagen específica de cada plataforma puede introducir diferencias adicionales respecto a la implementación de referencia.
- El rendimiento en dispositivos físicos, la inferencia en Android y la captura de cámara no están verificados; solo se ha probado en simulador iOS.
- No se emiten afirmaciones médicas ni nutricionales verificadas; el uso previsto es generar borradores que el usuario revise y corrija.
- La licencia MIT permite uso comercial, pero deben conservarse los avisos NOTICE y la licencia Apache-2.0 de DINOv2 al redistribuir la exportación.
- Riesgo de sesgo derivado del dataset de entrenamiento original, no documentado en la model card de la exportación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/addisonbk/calorie-lens-onnx
- Modelo base: https://huggingface.co/shalev396/calorie-lens
- Repositorio de ONNX Runtime: https://github.com/microsoft/onnxruntime
- Documentación de ONNX Runtime React Native: https://onnxruntime.ai/docs/get-started/with-javascript/react-native.html
- DINOv2 (licencia Apache-2.0 citada en los avisos): https://github.com/facebookresearch/dinov2
- Dataset Nutrition5k: https://github.com/google-research-datasets/Nutrition5k
