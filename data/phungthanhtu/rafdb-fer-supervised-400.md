# phungthanhtu/rafdb-fer-supervised-400

## Resumen

El modelo `phungthanhtu/rafdb-fer-supervised-400` es un checkpoint de clasificación de expresiones faciales (facial expression recognition, FER) desarrollado por el usuario de Hugging Face `phungthanhtu`. Se trata del control supervisado de un estudio más amplio sobre aprendizaje semisupervisado: utiliza un backbone ResNet-18 preentrenado en MS-Celeb-1M y se entrena únicamente con 400 imágenes etiquetadas del conjunto RAF-DB, sin aprovechar datos sin etiquetar. Es, por tanto, la fila `400` del informe comparativo del autor, y sirve como referencia para medir cuánto aporta el aprendizaje semisupervisado frente al entrenamiento puramente supervisado con presupuestos de etiquetas muy reducidos.

El modelo resuelve una tarea de clasificación de 7 clases (Surprise, Fear, Disgust, Happiness, Sadness, Anger, Neutral) sobre imágenes de rostros alineados de 224x224 píxeles. Su relevancia es metodológica: permite a investigadores reproducir y comparar el rendimiento de un pipeline supervisado con muy pocas etiquetas, con métricas publicadas de exactitud (70,80%), macro-F1 (62,30%) y calibración (ECE de 0,256 con 10 bins). El autor publica además los presupuestos de 100, 400, 2000 y 4000 imágenes etiquetadas como repositorios separados.

El repositorio es de tamaño 0.0 GB (los pesos se distribuyen como `model.pt`), la licencia es "other" (heredada de las restricciones de RAF-DB, solo investigación no comercial) y no se declaran idiomas ni pipeline estándar de Hugging Face. El checkpoint publicado corresponde a la semilla 5; el resto de semillas del estudio están disponibles bajo petición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN), entrada 224x224, preentrenado en MS-Celeb-1M |
| Parametros totales | no disponible (ResNet-18 estándar ronda 11,7 M, pero no se confirma en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se distribuye `model.pt` en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las etiquetas están en inglés) |
| Licencia | other (restricciones de RAF-DB: investigación no comercial) |
| Formato de pesos | `model.pt` (PyTorch, pesos + config + nombres de clase + métricas, sin clases pickled) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18 convolucional estándar con entrada de 224x224 píxeles, inicializada con pesos preentrenados en MS-Celeb-1M (un dataset de identidades faciales). La cabeza de clasificación se ajusta a las 7 clases de expresión de RAF-DB. El entrenamiento es puramente supervisado con entropía cruzada sobre 400 imágenes etiquetadas del split de entrenamiento de RAF-DB (que contiene 11.871 imágenes sin etiquetar en total, no usadas en este checkpoint). La semilla del experimento es la 5.

El preprocesamiento de entrenamiento incluye random resized crops y RandAugment; en inferencia se redimensiona el lado corto a 224, se aplica `ToTensor` y se normaliza con `mean=[0.485, 0.456, 0.406]` y `std=[0.229, 0.224, 0.225]`, sin aumentos. No se menciona RLHF, DPO ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.), lo cual es coherente con un modelo de visión de clasificación.

## Capacidades

- Clasificación de expresiones faciales en 7 categorías: Surprise, Fear, Disgust, Happiness, Sadness, Anger, Neutral.
- Funciona sobre rostros alineados del mismo tipo que RAF-DB (imágenes de cara recortada y centrada).
- Devuelve predicción de clase mediante la función `model.predict(net, "face.jpg")` incluida en `model.py`.
- Carga autocontenida: `model.load()` descarga pesos, reconstruye la red y la deja en modo eval, sin necesidad del pipeline de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo generativo).
- No tiene modo "thinking", visión general, audio ni ninguna capacidad más allá de la clasificación de imágenes de rostros.

## Casos de uso

- **Línea base en investigación semisupervisada**: sirve como control supervisado para comparar con los checkpoints `rafdb-fer-adacm-{100,400,2000,4000}` y cuantificar la ganancia del aprendizaje semisupervisado con el mismo presupuesto de etiquetas.
- **Reproducción de experimentos con presupuesto etiquetado**: investigadores que quieran replicar la fila `400` del informe del autor pueden cargar este checkpoint y verificar exactitud (70,80%), macro-F1 (62,30%) y ECE (0,256) sin reentrenar.
- **Análisis de calibración en FER**: el ECE de 0,256 con 10 bins permite estudiar la fiabilidad de las probabilidades de un modelo entrenado con pocas etiquetas y compararlo con variantes semisupervisadas.
- **Estudio de errores por clase**: dado que el autor indica que el modelo es más débil en fear, sadness y neutral, se puede usar para analizar matrices de confusión y sesgos por clase en entornos de investigación.
- **Prototipado de pipelines de FER**: integrable en scripts de Python con PyTorch y torchvision para validar el preprocesamiento (resize 224, normalización ImageNet) antes de escalar a modelos mayores.
- **Docencia y experimentos de ablation**: útil en cursos o talleres para ilustrar el efecto del tamaño del conjunto etiquetado en una tarea de visión concreta, comparando los cuatro presupuestos publicados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test accuracy | 70,80% |
| Macro-F1 | 62,30% |
| ECE (10 bins) | 0,256 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican; no hay tabla cruzada con alternativas de FER).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; una ResNet-18 a 224x224 en FP32 requiere del orden de cientos de MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100, H100); no requiere aceleradores de gama alta.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo con `model.load()`; exportación a TorchScript u ONNX no documentada en la model card; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `phungthanhtu/rafdb-fer-supervised-400` | no disponible (ResNet-18) | no aplica | 70,80% acc, 62,30% macro-F1, ECE 0,256 | other (no comercial) | Hugging Face |
| `phungthanhtu/rafdb-fer-supervised-100` | no disponible (ResNet-18) | no aplica | no disponible en esta ficha | other | Hugging Face |
| `phungthanhtu/rafdb-fer-supervised-2000` | no disponible (ResNet-18) | no aplica | no disponible en esta ficha | other | Hugging Face |
| `phungthanhtu/rafdb-fer-supervised-4000` | no disponible (ResNet-18) | no aplica | no disponible en esta ficha | other | Hugging Face |

No se dispone de datos de benchmarks de modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 400 imágenes etiquetadas: el propio autor señala que es más débil en fear, sadness y neutral, las clases que más se confunden en el informe.
- Riesgo de sobreajuste y de calibración pobre: ECE de 0,256 con 10 bins indica probabilidades poco fiables.
- Sesgos conocidos: no se documentan análisis de sesgo por género, edad o etnia en la model card; al entrenar sobre RAF-DB, hereda los sesgos de composición de ese dataset.
- Restricciones de licencia: RAF-DB está licenciado solo para investigación no comercial; el autor indica explícitamente que no se use el checkpoint sobre personas en producción.
- Limitación de dominio: pensado para rostros alineados del mismo tipo que RAF-DB; el rendimiento puede degradarse con otras condiciones de captura, iluminación o encuadre.
- No es un modelo generativo: no soporta texto, tool calling ni agentes; cualquier caso de uso fuera de clasificación de expresiones faciales queda fuera de su alcance.
- El resto de semillas del estudio no están publicadas en el repositorio, solo bajo petición, lo que limita la reproducibilidad completa.

## Enlaces

- Hugging Face: https://huggingface.co/phungthanhtu/rafdb-fer-supervised-400
- Checkpoint con 100 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-supervised-100
- Checkpoint con 2000 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-supervised-2000
- Checkpoint con 4000 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-supervised-4000
- Checkpoint semisupervisado de referencia (mismo presupuesto): https://huggingface.co/phungthanhtu/rafdb-fer-adacm-400
