# phungthanhtu/rafdb-fer-supervised-4000

## Resumen

Se trata de un checkpoint de reconocimiento de expresiones faciales (FER) basado en una ResNet-18 preentrenada en MS-Celeb-1M y ajustada sobre el conjunto RAF-DB. Lo publica el usuario `phungthanhtu` como parte de un estudio comparativo sobre aprendizaje semi-supervisado, y este repositorio concreto es la rama de control: entrenamiento puramente supervisado con 4.000 imagenes etiquetadas y sin datos sin etiquetar. Resuelve una tarea de clasificacion de 7 clases (Sorpresa, Miedo, Asco, Felicidad, Tristeza, Enfado, Neutral) sobre rostros alineados de 224x224 pixeles.

El modelo es relevante como referencia metodologica: permite aislar el efecto de la supervision frente a variantes semi-supervisadas con el mismo backbone y calendario de entrenamiento. Reporta una exactitud de test del 81,78% y un macro-F1 de 75,17%, con una calibracion pobre (ECE de 0,154 en 10 bins), lo que sugiere sobreconfianza en las predicciones.

El repositorio es de tipo investigacion, sin pipeline declarado, sin metricas de descargas o likes y con licencia `other` heredada de RAF-DB, que restringe el uso a investigacion no comercial. El peso del repositorio es de 0,0 GB, coherente con una ResNet-18 (~11 millones de parametros).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN residual), preentrenada en MS-Celeb-1M, entrada 224x224 |
| Parametros totales | no disponible (ResNet-18 estandar, ~11,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt` de PyTorch; no se publican variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (tarea de vision, sin componente linguistico) |
| Licencia | other (derivada de RAF-DB, uso no comercial en investigacion) |
| Formato de pesos | PyTorch (`.pt` con pesos, config, nombres de clase y metricas; sin clases pickled) |

## Arquitectura y entrenamiento

El backbone es una ResNet-18 con conexiones residuales, inicializada con pesos de MS-Celeb-1M (reconocimiento facial a gran escala) y ajustada para clasificacion de 7 expresiones. La entrada se preprocesa redimensionando el lado corto a 224, convirtiendo a tensor y normalizando con media `[0.485, 0.456, 0.406]` y desviacion `[0.229, 0.224, 0.225]`. Durante el entrenamiento se aplican random resized crops y RandAugment; en inferencia no se usa aumento de datos.

El entrenamiento es puramente supervisado con entropia cruzada sobre 4.000 imagenes etiquetadas de RAF-DB, usando la semilla 5. La model card menciona 8.271 imagenes sin etiquetar del split de entrenamiento, pero en esta variante no se utilizan (es el control supervisado del estudio). No se documentan numero de tokens (no aplica), composicion exacta del dataset mas alla de RAF-DB, ni uso de RLHF/DPO. No se describe ninguna innovacion tecnica adicional (sin decodificacion especulativa, atencion lineal ni tecnicas equivalentes).

## Capacidades

- Clasificacion de expresiones faciales en 7 categorias: Sorpresa, Miedo, Asco, Felicidad, Tristeza, Enfado, Neutral.
- Inferencia sobre rostros alineados de tipo RAF-DB, con preprocesado documentado y reproducible.
- Carga autonoma mediante `model.load()`: descarga pesos, reconstruye la red y devuelve el modelo en modo eval, sin dependencia del pipeline de entrenamiento.
- Prediccion via `model.predict(net, "face.jpg")` y demo por linea de comandos en `example.py`.
- No soporta tool calling, function calling, agentes, multi-step reasoning ni capacidades multilingues.
- No dispone de modo thinking, vision general (solo rostros), audio ni generacion de texto.

## Casos de uso

- Referencia de control en experimentos de aprendizaje semi-supervisado: sirve como linea base supervisada para comparar con las variantes `{100,400,2000,4000}` del mismo autor y aislar el efecto de los datos sin etiquetar.
- Analisis de calibracion de modelos FER: el ECE de 0,154 permite estudiar tecnicas de calibracion (temperature scaling, isotonic regression) sobre un checkpoint concreto.
- Prototipos de investigacion en analisis de afecto: clasificacion de rostros alineados en entornos controlados de laboratorio, con metricas de exactitud y macro-F1 conocidas.
- Estudio de confusion entre clases: la model card identifica Miedo, Tristeza y Neutral como las clases mas debiles, util para disenar matrices de confusion y analisis de errores.
- Evaluacion comparativa de backbones: al compartir arquitectura y calendario con las otras variantes, permite comparaciones controladas de estrategias de entrenamiento.
- Docencia y reproduccion: el paquete incluye `model.py` y `example.py`, lo que facilita demostraciones reproducibles de FER en cursos o talleres.
- Integracion en pipelines de investigacion con PyTorch: al no requerir el pipeline de entrenamiento, se puede encapsular como modulo de inferencia en scripts de analisis offline.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exactitud de test | 81,78% |
| Macro-F1 | 75,17% |
| ECE (10 bins) | 0,154 |
| Semilla | 5 |
| Imagenes etiquetadas | 4.000 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, por tratarse de una tarea de vision y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de ResNet-18 (~11,7 M parametros) cabe holgadamente en GPUs consumer, pero no se publican cifras.
- GPU recomendadas: no disponibles en la informacion proporcionada; cualquier GPU con soporte PyTorch deberia bastar.
- Compatibilidad con GPU consumer: previsiblemente si (RTX 4090, RTX 3060, etc.), aunque no confirmado por el autor.
- Opciones de despliegue: PyTorch nativo (`model.pt` + `model.py`); no se documentan exportaciones a ONNX, TorchScript, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `phungthanhtu/rafdb-fer-supervised-4000` (este) | ResNet-18 (~11,7 M) | no aplica | 81,78% acc, 75,17% macro-F1, ECE 0,154 | other (RAF-DB, no comercial) | Hugging Face, pesos `.pt` |
| `phungthanhtu/rafdb-fer-supervised-2000` | ResNet-18 | no aplica | no disponible en esta ficha | other | Hugging Face |
| `phungthanhtu/rafdb-fer-supervised-400` | ResNet-18 | no aplica | no disponible en esta ficha | other | Hugging Face |
| `phungthanhtu/rafdb-fer-supervised-100` | ResNet-18 | no aplica | no disponible en esta ficha | other | Hugging Face |

No se dispone de datos de benchmarks de modelos externos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado solo con 4.000 imagenes etiquetadas: rendimiento debil en Miedo, Tristeza y Neutral, las clases mas confundidas segun la model card.
- Calibracion pobre: ECE de 0,154 en 10 bins indica sobreconfianza; no usar probabilidades sin calibrar en decisiones sensibles.
- Sesgos conocidos: no documentados, pero RAF-DB es un dataset de rostros alineados con distribucion demografica limitada; el modelo puede generalizar mal fuera de esa distribucion.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de predicciones erroneas con alta confianza en rostros no alineados o con iluminacion distinta.
- Restricciones de licencia: licencia `other` derivada de RAF-DB, que es no comercial; prohibido el uso sobre personas en produccion segun la propia model card.
- Solo rostros alineados del tipo RAF-DB; no es un modelo de vision general ni de lenguaje.
- No se publican variantes cuantizadas ni exportaciones para despliegue en produccion; el unico formato es PyTorch `.pt`.
- Solo se publica la semilla 5; las demas semillas del estudio estan disponibles bajo peticion, lo que limita la reproducibilidad inmediata.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phungthanhtu/rafdb-fer-supervised-4000
- Variante 2000: https://huggingface.co/phungthanhtu/rafdb-fer-supervised-2000
- Variante 400: https://huggingface.co/phungthanhtu/rafdb-fer-supervised-400
- Variante 100: https://huggingface.co/phungthanhtu/rafdb-fer-supervised-100
- Perfil del autor: https://huggingface.co/phungthanhtu
