# rares9301/is-2026-retinopathy-setb-scratch

## Resumen

`rares9301/is-2026-retinopathy-setb-scratch` es un conjunto de modelos de clasificación de imágenes para retinopatía diabética, desarrollado por el usuario rares9301 como parte de la asignatura IS 2026. Se trata de la variante "sin preentrenamiento" del proyecto: todos los modelos parten de inicialización aleatoria, sin pesos de ImageNet, sin RETFound y sin datos retinianos externos, entrenando exclusivamente con las 7.993 imágenes del split de entrenamiento del dataset B.

El repositorio no contiene un modelo único, sino un ensemble de ocho componentes (ResNet-50, ResNet-34 y EfficientNet-B0 en distintas configuraciones) junto con especialistas binarios para el par de clases 0-vs-2. La tarea es clasificación multiclase de severidad de retinopatía diabética a partir de imágenes de fondo de ojo a 512x512 píxeles.

Su relevancia es metodológica más que de producto: cuantifica el valor de las representaciones preentrenadas en un régimen de datos pequeños. El mismo pipeline con backbones preentrenados en ImageNet alcanza un 81,08% de accuracy en test, mientras que esta variante desde cero se queda en 71,57%, una brecha de aproximadamente 9,5 puntos. El modelo es de uso privado para evaluación académica y no está destinado a uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (ResNet-50, ResNet-34, EfficientNet-B0) en ensemble de 8 componentes |
| Parametros totales | ResNet-50: 23,52 M; ResNet-34: 21,29 M; EfficientNet-B0: 4,01 M (por componente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada 512x512; un ResNet-50 a 448x448) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (clasificación de imágenes) |
| Licencia | other (privada, solo para calificación y revisión de la asignatura IS 2026) |
| Formato de pesos | PyTorch (`best.pt`, `last.pt`, `ema.pt` para especialistas) |

## Arquitectura y entrenamiento

El ensemble combina ocho ejecuciones multiclase con tres arquitecturas convolucionales: ResNet-50 (23,52 M de parámetros), ResNet-34 (21,29 M) y EfficientNet-B0 (4,01 M). La entrada es de 512x512, con una excepción: un ResNet-50 a 448x448. El entrenamiento usa AdamW con scheduler coseno, warmup de 4-5 épocas, label smoothing de 0,1 y class-weight power de 0,35. El batch es de 32 o 40 según el componente.

La augmentation es agresiva: RandAugment, rotación, flip, transformaciones afines, color jitter, blur, RandomErasing y mixup 0.2 / cutmix 1.0 aplicados al 30-50% de los batches. Los cinco primeros modelos se entrenan 70 épocas, los tres últimos 55, y el mejor especialista 45. Todo el cómputo se realizó en tres GPUs H100 de 80 GB en tres oleadas paralelas, con un tiempo total de aproximadamente 90 minutos.

Sobre el ensemble se aplican dos capas de post-procesado: un especialista binario 0-vs-2 (que en validación solo alcanzó 67,2% y cuyo umbral se fijó a 1.0, es decir, desactivado) y una regla de par paciente/ojo con umbral 0.40 seleccionado en validación. Esta regla modifica 16 imágenes en test: corrige 10, rompe 5 y deja 1 incorrecta, con un neto de +5.

## Capacidades

- Clasificación multiclase de severidad de retinopatía diabética en imágenes de fondo de ojo.
- Ensemble de ocho modelos convolucionales con agregación de probabilidades cacheadas.
- Post-procesado mediante especialista binario para el par de clases 0-vs-2 (desactivado en la práctica por bajo rendimiento).
- Regla de consistencia paciente/ojo que explota la estructura del dataset (pares de imágenes del mismo paciente).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Investigación académica sobre preentrenamiento: el repositorio sirve como referencia reproducible para medir la brecha entre entrenar desde cero y usar pesos de ImageNet en un dataset médico de ~8.000 imágenes (71,57% frente a 81,08% en test).
- Docencia y evaluación de pipelines de visión médica: incluye snapshot completo del proyecto (`src/`, scripts, informes en TeX y PDF, salidas de EDA, probabilidades cacheadas y metadatos de ejecución) para reconstruir ambos submissions.
- Reproducción de experimentos de augmentation fuerte: la configuración con RandAugment, mixup y cutmix documentada permite estudiar su efecto en clasificación de retinopatía con datos limitados.
- Análisis de reglas de post-procesado: la regla paciente/ojo con umbral 0.40 y el especialista 0-vs-2 ejemplifican cómo explotar metadatos de agrupación para corregir predicciones individuales.
- Estudio de calibración y métricas ordinales: el proyecto reporta F1 macro (0,499) y QWK (0,738), útiles para comparar estrategias en clasificación ordinal médica.
- Baseline para futuros trabajos: al no usar pesos externos, sirve como cota inferior limpia frente a la que medir el beneficio de RETFound u otros modelos fundacionales de retina.
- No es adecuado para despliegue clínico ni para triaje real de pacientes: la licencia lo restringe y la accuracy (71,57%, IC 95% bootstrap 68,65%-74,55%) es insuficiente para uso diagnóstico.

## Benchmarks y rendimiento

| Variante | Validación (1.000) | Test (999) | F1 macro | QWK |
|---|---:|---:|---:|---:|
| Ensemble de ocho modelos | 70,90% | 71,07% | 0,494 | 0,729 |
| + especialista 0-vs-2 | 70,90% | 71,07% | 0,494 | 0,729 |
| + regla paciente/ojo | 71,60% | 71,57% | 0,499 | 0,738 |

| Comparación con variante preentrenada | Val acc | Test acc | F1 | QWK |
|---|---:|---:|---:|---:|
| Ensemble con ImageNet preentrenado | 83,20% | 81,08% | 0,626 | 0,847 |
| Desde cero (este repositorio) | 71,60% | 71,57% | 0,499 | 0,738 |

Intervalo de confianza bootstrap al 95% para la accuracy final en test: 68,65%-74,55% (group-aware, 5.000 remuestreos). El especialista 0-vs-2 desde cero alcanzó 67,2% en validación binaria. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) por tratarse de un modelo de visión médica.

## Requisitos de hardware

- Entrenamiento: tres GPUs H100 de 80 GB en tres oleadas paralelas, ~90 minutos totales.
- VRAM de inferencia: no disponible de forma explícita; estimación orientativa a partir del tamaño de los componentes (ResNet-50 23,52 M, ResNet-34 21,29 M, EfficientNet-B0 4,01 M) y entrada 512x512: cada componente cabe holgadamente en GPUs consumer de 8-12 GB en FP32, y en menos de 4 GB en FP16.
- GPU recomendadas: H100 o A100 para reproducir el entrenamiento; RTX 4090, RTX 3090 o RTX 4080 para inferencia del ensemble completo.
- Cabe en GPU consumer: sí, cada componente individual y el ensemble completo son viables en tarjetas de 8-12 GB.
- Opciones de despliegue: PyTorch nativo (los pesos son `best.pt`/`last.pt`); no se documentan exportaciones a ONNX, TensorRT, TorchScript ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Test acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| is-2026-retinopathy-setb-scratch (este) | 4,01-23,52 M por componente | 512x512 (un modelo 448x448) | 71,57% | other (privada, solo evaluación) | Hugging Face |
| is-2026-retinopathy-setb | Mismas arquitecturas con pesos ImageNet | 512x512 | 81,08% | other (privada, solo evaluación) | Hugging Face |
| RETFound | No disponible en la información | No disponible | No disponible | No disponible | No disponible |
| ResNet-50 ImageNet estándar | 25,56 M (referencia) | 224x224 típico | No disponible en este dataset | Pesos ImageNet con licencia propia | Ampliamente disponible |

La comparación más directa es con la variante preentrenada del mismo autor, que supera a esta en ~9,5 puntos de accuracy en test. No se dispone de resultados de RETFound ni de otros modelos fundacionales de retina en este dataset dentro de la información proporcionada.

## Limitaciones y advertencias

- Licencia "other" de carácter privado: restringida a calificación y revisión de la asignatura IS 2026; no autoriza uso comercial ni clínico.
- No apta para uso clínico: la propia model card lo indica explícitamente; la accuracy de 71,57% y el IC 95% (68,65%-74,55%) quedan lejos de los estándares de diagnóstico.
- Sesgos desconocidos: no se documenta análisis de sesgo por etnia, edad, sexo, tipo de cámara o centro hospitalario; el dataset B no se redistribuye, lo que impide auditorías externas.
- Riesgo de sobreajuste al split: el ensemble, el especialista y la regla de par se seleccionan sobre validación; la regla de par solo cambia 16 imágenes en test, por lo que su efecto es frágil y con alta varianza.
- Especialista 0-vs-2 inoperativo: con 67,2% en validación binaria, su umbral se fijó a 1.0 (desactivado), de modo que no aporta capacidad real al sistema.
- Brecha de preentrenamiento: ~9,5 puntos menos que la variante con ImageNet, lo que refleja la dificultad de entrenar desde cero con solo 7.993 imágenes.
- Idiomas y modalidades: no aplica como modelo de texto; no soporta instrucciones, tool calling ni interacción conversacional.
- Formato de pesos: solo PyTorch (`.pt`); no hay versiones GGUF, ONNX ni safetensors publicadas, lo que limita su integración en stacks no-PyTorch.
- Datos no redistribuidos: el repositorio incluye código, informes y probabilidades cacheadas, pero no las imágenes del dataset B, por lo que la reproducibilidad completa depende de obtener el dataset por otra vía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rares9301/is-2026-retinopathy-setb-scratch
- Variante preentrenada (submission principal, 81,08% test): https://huggingface.co/rares9301/is-2026-retinopathy-setb
