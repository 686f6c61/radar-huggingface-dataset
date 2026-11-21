# phungthanhtu/rafdb-fer-adacm-blur-4000

## Resumen

`rafdb-fer-adacm-blur-4000` es un checkpoint de clasificación de expresiones faciales (FER) publicado por el usuario phungthanhtu en Hugging Face. Se trata de los pesos finales del método Ada-CM (un esquema de aprendizaje semisupervisado con dos vistas de aumento de datos y EMA del profesor) aplicado sobre el conjunto RAF-DB, con una modificación concreta: se añade un desenfoque gaussiano (sigma 0.1-1.0, probabilidad 0.5) a la vista fuerte de las imágenes no etiquetadas. El checkpoint corresponde al presupuesto de 4000 imágenes etiquetadas dentro de un estudio que publica varios presupuestos (100, 400, 2000 y 4000).

El modelo no es un LLM ni un modelo generativo: es un clasificador de imágenes de 7 clases construido sobre un backbone ResNet-18 preentrenado en MS-Celeb-1M, con entrada de 224x224. Resuelve el problema clásico de FER en régimen de pocas etiquetas, aprovechando 8.271 imágenes no etiquetadas de RAF-DB junto a las 4000 etiquetadas. Su relevancia es acotada y de carácter investigador: sirve como referencia reproducible para comparar estrategias de aumento débil/fuerte en aprendizaje semisupervisado, no como componente listo para producción.

El repositorio es de tamaño prácticamente nulo (0.0 GB según Hugging Face) y no registra descargas ni likes en el momento de la consulta. La model card declara explícitamente uso exclusivo en investigación sobre caras alineadas y prohíbe su uso sobre personas en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN, ResNet-18 (preentrenado en MS-Celeb-1M), entrada 224x224 |
| Parametros totales | no disponible (ResNet-18 estándar, ~11,7 M en la variante clásica; el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `model.pt` en precisión de entrenamiento; no se documentan variantes INT8/FP16) |
| Idiomas soportados | no aplica (clasificación de expresiones faciales; etiquetas en inglés: Surprise, Fear, Disgust, Happiness, Sadness, Anger, Neutral) |
| Licencia | other (la model card remite a las restricciones de RAF-DB: solo investigación no comercial) |
| Formato de pesos | PyTorch (`model.pt` con pesos, config, nombres de clase y métricas; sin clases serializadas con pickle) |

## Arquitectura y entrenamiento

El modelo es un ResNet-18 con inicialización desde MS-Celeb-1M, adaptado a 7 clases de expresión facial. La entrada se redimensiona por el lado corto a 224 píxeles, se convierte a tensor y se normaliza con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]`. En entrenamiento se aplican random resized crops y RandAugment; en inferencia no se aplica ninguno de los dos.

El entrenamiento sigue el esquema Ada-CM en modo semisupervisado: 4000 imágenes etiquetadas de RAF-DB más 8.271 imágenes no etiquetadas del split de entrenamiento. La innovación declarada es la adición de un desenfoque gaussiano con sigma uniforme en [0.1, 1.0] y probabilidad 0.5 sobre la vista fuerte de las imágenes no etiquetadas, lo que actúa como regularización de la consistencia entre vistas. Se publican los pesos EMA finales del profesor, correspondientes a la semilla 5; las demás semillas del estudio están disponibles bajo petición. No se documentan en la información disponible el número total de épocas, el optimizador, la tasa de aprendizaje ni la composición detallada de las vistas débil/fuerte más allá del desenfoque.

## Capacidades

- Clasificación de expresiones faciales en 7 clases discretas: Surprise, Fear, Disgust, Happiness, Sadness, Anger y Neutral.
- Funciona sobre caras alineadas, del mismo tipo que las de RAF-DB (rostros centrados, recortados y de resolución moderada).
- API de inferencia mínima incluida en el repositorio: `model.load()` descarga pesos, reconstruye la red y la devuelve en modo eval; `model.predict()` clasifica una imagen.
- Script de demostración por línea de comandos (`example.py`) que acepta una ruta a una imagen.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multimodales más allá de la imagen: no procesa audio, vídeo ni lenguaje natural.
- No se documentan capacidades de detección o localización facial; asume que la cara ya está recortada y alineada.

## Casos de uso

- Investigación en aprendizaje semisupervisado: el checkpoint sirve como referencia reproducible del presupuesto de 4000 etiquetas para comparar variantes de aumento (con y sin desenfoque gaussiano) y de estrategias de consistencia entre vistas.
- Reproducción de resultados académicos: permite verificar la fila de 4000 etiquetas del informe asociado (82,07 % de accuracy, 75,07 % de macro-F1, ECE de 0,123) sin reentrenar.
- Estudio de calibración de modelos FER: el valor de ECE (10 bins) de 0,123 permite analizar cómo afecta el régimen de pocas etiquetas a la confianza calibrada del clasificador.
- Análisis de errores por clase en FER: dado que el autor señala que el modelo es más débil en fear, sadness y neutral, es útil para estudiar matrices de confusión y patrones de confusión entre clases en entornos controlados de laboratorio.
- Docencia y prácticas de visión por computador: el paquete autocontenido (`model.py`, `model.pt`, `example.py`) permite montar un ejercicio de inferencia y evaluación sin dependencias del pipeline de entrenamiento.
- Evaluación de aumentos de datos: el desenfoque gaussiano aplicado a la vista fuerte es un caso concreto para medir el impacto de perturbaciones de baja frecuencia en la consistencia semisupervisada.
- Prototipado de investigación en interacción persona-ordenador, siempre con datos de laboratorio y nunca sobre personas reales en producción, según la restricción explícita del autor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test accuracy (RAF-DB, 4000 etiquetas) | 82,07 % |
| Macro-F1 | 75,07 % |
| ECE (10 bins) | 0,123 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la model card; los únicos datos son las tres métricas anteriores sobre el split de test de RAF-DB. No se dispone de cifras de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un ResNet-18 a 224x224 en FP32 ocupa del orden de decenas de MB de pesos, por lo que cualquier GPU con 2 GB o más es suficiente. No se documenta una cifra oficial.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes en investigación, una RTX 3090, RTX 4090, A100 o H100 aportan margen sobrado. El modelo también puede ejecutarse en CPU para inferencia puntual.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4060 y superiores).
- Opciones de despliegue: el repositorio solo proporciona carga nativa en PyTorch mediante `model.py`. No se documentan exportaciones a ONNX, TorchScript, TensorRT ni integraciones con vLLM, llama.cpp, Ollama o TGI (ninguna de estas herramientas aplica a un clasificador de imágenes de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Etiquetas de entrenamiento | Accuracy RAF-DB | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `rafdb-fer-adacm-blur-4000` (este) | ResNet-18 + Ada-CM + blur | 4000 etiquetadas + 8271 no etiquetadas | 82,07 % | Imagen 224x224 | other (solo investigación) | Hugging Face |
| `rafdb-fer-adacm-blur-2000` | ResNet-18 + Ada-CM + blur | 2000 etiquetadas + 8271 no etiquetadas | no disponible en esta ficha | Imagen 224x224 | other | Hugging Face |
| `rafdb-fer-adacm-blur-400` | ResNet-18 + Ada-CM + blur | 400 etiquetadas + 8271 no etiquetadas | no disponible en esta ficha | Imagen 224x224 | other | Hugging Face |
| `rafdb-fer-adacm-blur-100` | ResNet-18 + Ada-CM + blur | 100 etiquetadas + 8271 no etiquetadas | no disponible en esta ficha | Imagen 224x224 | other | Hugging Face |

Las alternativas comparables más directas son los otros presupuestos del mismo estudio, publicados por el mismo autor bajo el prefijo `phungthanhtu/rafdb-fer-adacm-blur-{100,400,2000,4000}`. No se dispone en la información proporcionada de resultados de benchmarks de modelos externos de FER sobre RAF-DB para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se limita a RAF-DB, un conjunto curado de caras alineadas; el rendimiento fuera de esa distribución (iluminación, pose, oclusión, demografía no representada) no está caracterizado.
- Riesgo de error por clase: el propio autor indica que el modelo es más débil en fear, sadness y neutral, las clases que más se confunden en el informe. El macro-F1 (75,07 %) es notablemente inferior a la accuracy (82,07 %), lo que refleja desequilibrio entre clases.
- Calibración limitada: un ECE de 0,123 indica que las probabilidades de salida no están bien calibradas; no deben interpretarse como confianza fiable sin recalibración.
- Alucinación en sentido estricto no aplica (es un clasificador), pero sí existe el riesgo de asignar una de las 7 clases con alta confianza a una imagen que no contiene una cara o que contiene una expresión fuera del conjunto.
- Restricciones de licencia: la licencia es "other" y la model card remite a las condiciones de RAF-DB, que es solo para investigación no comercial. El autor prohíbe explícitamente el uso del checkpoint sobre personas en producción.
- Requisito de preprocesado estricto: asume caras ya alineadas y recortadas; no incluye detector ni alineador facial.
- Reproducibilidad parcial: solo se publica la semilla 5; el resto de semillas del estudio están disponibles bajo petición, lo que dificulta la verificación completa.
- Sin métricas de latencia, throughput ni consumo: no hay datos para dimensionar un despliegue.
- El repositorio no registra descargas ni likes y su tamaño declarado es 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el conteo no se ha actualizado; conviene verificar la descarga de `model.pt` antes de integrarlo en cualquier flujo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-blur-4000
- Checkpoint con 2000 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-blur-2000
- Checkpoint con 400 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-blur-400
- Checkpoint con 100 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-blur-100
- Perfil del autor: https://huggingface.co/phungthanhtu
- Dataset RAF-DB (referencia de licencia y origen de los datos): no disponible en la información proporcionada
- Paper de Ada-CM: no disponible en la información proporcionada
- Repositorio de código del estudio: no disponible en la información proporcionada
