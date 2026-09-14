# Cloth-splatters/dexgarmentlab-lift-20260822-state-est-gps-flow-tf2-noscale

## Resumen

El modelo `Cloth-splatters/dexgarmentlab-lift-20260822-state-est-gps-flow-tf2-noscale` es un estimador de estado para prendas de ropa deformables desarrollado por el usuario Cloth-splatters dentro del ecosistema DexGarmentLab. No es un modelo de lenguaje: es un modelo generativo de flow matching que, a partir de una nube de puntos parcial observada, reconstruye la configuración tridimensional completa de una prenda (vértices y superficie) sobre una plantilla conocida. Su propósito es alimentar pipelines de manipulación robótica diestra de tejidos, donde el robot necesita conocer la pose exacta de la tela antes de planificar un agarre o un doblado.

La arquitectura es `GPSStateEstModel`, un transformer con cross-attention secuencial, dos marcos de contexto, dimensión oculta de 128, 8 capas y 8 cabezas, con un límite de 2048 nodos por padding. Se entrenó desde cero durante 20 épocas (398.700 actualizaciones del optimizador) con el scheduler `FlowMatch_StateEstGPS` de 1000 pasos de difusión y shift 1, sobre el dataset `dexgarmentlab_lift_full_state_20260822.h5` con 176/23/22 prendas de entrenamiento, validación y test.

Su relevancia es acotada pero concreta: es la variante "no scale" de la familia, es decir, sin aumento de desajuste de tamaño de plantilla (`template_mismatch_range: [1.0, 1.0]`), lo que mejora el error de correspondencia de vértices frente a la versión con aleatorización completa (14,78 mm frente a 15,79 mm en inferencia independiente) cuando la plantilla coincide exactamente. Se publica como pesos EMA seleccionados por validación, con licencia MIT y formato safetensors, y se integra mediante la librería UniClothDiff.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `GPSStateEstModel`: transformer con cross-attention secuencial, 2 marcos de contexto |
| Parámetros totales | no disponible (estimación orientativa de 2-5 M a partir de dim. oculta 128 y 8 capas; no confirmada por el autor) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido lingüístico; límite operativo de 2048 nodos por padding y 2 marcos de contexto |
| Tipos de cuantización | no disponible (solo se distribuyen pesos safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo no lingüístico, orientado a geometría 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors (subdirectorio `model/`) |
| Tarea | Estimación de estado de prendas (reconstrucción de malla desde nube de puntos parcial) |
| Scheduler | `FlowMatch_StateEstGPS`, 1000 pasos de entrenamiento, shift 1 |
| Escala de coordenadas | 3, sin normalización de escala |
| Dataset | `dexgarmentlab_lift_full_state_20260822.h5`, split original random-garment-v0, revisión `771714a2` |
| SHA-256 de los pesos | `f3faa4b11dfb36774ecb5e4f5f68afcbcdcb122888fa63a351d6741fe0f9c56b` |
| Librería | diffusers (modelo personalizado compatible) |

## Arquitectura y entrenamiento

El modelo implementa `GPSStateEstModel`, un transformer de cross-attention secuencial con dos marcos de contexto, dimensión oculta 128, 8 capas y 8 cabezas de atención. El límite de 2048 nodos por padding fija el tamaño máximo de nube de puntos procesable por muestra. La generación no es autoregresiva ni de difusión clásica, sino de flow matching: el scheduler `FlowMatch_StateEstGPS` define 1000 pasos de entrenamiento con shift 1, y en inferencia se emplean 30 pasos de flujo con cuatro muestras, seleccionando la muestra por energía observación-superficie. La escala de coordenadas es 3 y no se aplica normalización de escala.

El entrenamiento se ejecutó desde cero en el job `1291773_31` durante 20 épocas, equivalentes a 398.700 actualizaciones del optimizador, con tamaño de lote 32, semilla 259, precisión bf16, decaimiento EMA de 0,9999, tasa de aprendizaje 2e-4 con schedule coseno y 2000 pasos de calentamiento. La mejor pérdida de muestreo en validación fue `6.283105492252189e-05`. La particularidad de esta versión es la ausencia de aumento de desajuste de tamaño de plantilla (`template_mismatch_range: [1.0, 1.0]`), mientras que sí se mantienen activos el aumento conjunto de escala de nube, objetivo y plantilla en el rango `[0.8, 1.25]`, el giro aleatorio conjunto, el desajuste de giro de plantilla (180 grados con probabilidad 0,5) y la corrupción de la nube.

## Capacidades

- Reconstrucción de la configuración completa de una prenda (posición de vértices y superficie) a partir de una observación parcial en forma de nube de puntos.
- Estimación de estado con correspondencia vértice a vértice sobre una plantilla conocida, con un error mediano de 14,78 mm en inferencia independiente y 13,70 mm con warm start.
- Generación de múltiples hipótesis muestreando varias veces el flujo (la evaluación usa cuatro muestras) y seleccionando la mejor según la energía observación-superficie.
- Refinamiento incremental mediante warm start (strength 0,8 y 3 pasos), útil para actualizaciones sucesivas de estado en una misma trayectoria.
- Inferencia sobre secuencias completas: la evaluación cubre 7537 fotogramas de test, 169 trayectorias y 22 prendas no vistas, con paso de fotograma 10.
- Compatibilidad con el ecosistema Diffusers a través de un pipeline personalizado (`ClothStateEstGPSPipeline`) que restaura el scheduler y las convenciones del dataset desde `config.yml`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso simbólico ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Manipulación robótica diestra de ropa: el modelo toma la nube de puntos parcial que devuelve una cámara de profundidad sobre una prenda extendida y estima la pose completa de la tela, información necesaria para que un planificador de agarre decida dónde pinzar sin colisionar con la superficie.
- Doblado y extendido de prendas en cadena: con 30 pasos de flujo y selección entre cuatro muestras, cada fotograma de la trayectoria se resuelve en una estimación de estado que alimenta el bucle de control; el modo warm start (13,70 mm de error de vértices) permite refinar la estimación previa en solo 3 pasos en lugar de partir de cero.
- Verificación de plantilla exacta en producción textil: como esta variante está entrenada sin aumento de desajuste de tamaño de plantilla, es la opción adecuada cuando se conoce la talla exacta de la prenda y se busca la máxima precisión de correspondencia, por ejemplo para comparar una prenda física con su modelo CAD y detectar defectos de confección.
- Inicialización de simuladores físicos: la malla reconstruida se usa como estado inicial de un simulador de tejidos (FEM o posición basada), lo que reduce el tiempo de convergencia respecto a una inicialización en reposo.
- Etiquetado automático de datos para entrenamiento: dado que reproduce la convención del dataset de correspondencia asociado, se puede emplear para generar pseudo-etiquetas de estado sobre nuevas capturas y ampliar el corpus sin anotación manual.
- Investigación en aprendizaje de objetos deformables: sirve como referencia de ablación frente a la variante con aleatorización completa, permitiendo medir el efecto del aumento de desajuste de plantilla sobre el error de vértices y sobre el Chamfer de superficie.
- Evaluación de percepción 3D en robótica: el pipeline permite medir error de vértices, Chamfer de superficie y Chamfer de superficie ocluida sobre conjuntos de test con prendas retenidas, útil para comparar sensores de profundidad o configuraciones de cámara.

## Benchmarks y rendimiento

El autor publica una única evaluación cuantitativa: reconstrucción con plantilla exacta sobre los 7537 fotogramas de test, 169 trayectorias y 22 prendas retenidas, con paso de fotograma 10, cuatro muestras, semilla 0 y 30 pasos de flujo. Los valores son medianas sobre fotogramas, en milímetros.

| Modelo / inferencia | Error de vértices | Chamfer de superficie | Chamfer de superficie ocluida |
|---|---:|---:|---:|
| Sin escala, independiente | 14,78 | 11,73 | 12,05 |
| Sin escala, warm start | 13,70 | 11,49 | 11,79 |
| Aleatorización completa, independiente | 15,79 | 11,72 | 12,04 |
| Aleatorización completa, warm start | 14,88 | 11,53 | 11,81 |

La pérdida de muestreo en validación del checkpoint es `6.283105492252189e-05`. No hay datos de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje, porque el modelo no realiza tareas lingüísticas. Tampoco se incluye en esta release un barrido específico de inferencia con pocos pasos para este checkpoint.

## Requisitos de hardware

- VRAM estimada: no disponible. Los datos publicados no incluyen requisitos de memoria. Con dimensión oculta 128, 8 capas y un límite de 2048 nodos, el consumo estará dominado por los tensores de nube de puntos y por el número de muestras simultáneas más que por los pesos, pero se trata de una inferencia orientativa, no de una cifra publicada.
- GPU recomendadas: no disponible. Por el tamaño de la arquitectura, es razonable esperar que cualquier GPU con soporte CUDA reciente sea suficiente, incluidas tarjetas de consumo, pero el autor no lo especifica.
- GPU de consumo: no confirmado; el entrenamiento se realizó en bf16 y el modelo es de pequeña dimensión, lo que apunta a que cabe en GPU de consumo, sin dato oficial.
- Opciones de despliegue: Diffusers, mediante el pipeline personalizado `ClothStateEstGPSPipeline` y la resolución de checkpoint `resolve_checkpoint` de UniClothDiff, cargando el `config.yml` guardado para restaurar el scheduler de flujo y las convenciones del dataset. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. Se sabe que la evaluación usó 30 pasos de flujo con cuatro muestras y warm start de strength 0,8 y 3 pasos, pero no se publican tiempos por fotograma.
- Restricción práctica: el límite de 2048 nodos por padding condiciona el tamaño de la nube de puntos de entrada y, con ello, la memoria necesaria en función del tamaño de lote.

## Comparativa con modelos similares

No se dispone de información sobre modelos de terceros comparables en la documentación aportada. La única comparación posible es interna a la familia publicada por el mismo autor.

| Modelo | Error de vértices (independiente) | Error de vértices (warm start) | Chamfer de superficie (independiente) | Licencia | Estado |
|---|---:|---:|---:|---|---|
| `...-tf2-noscale` (esta ficha) | 14,78 | 13,70 | 11,73 | MIT | Publicado 2026-09-14 |
| `...-tf2` con aleatorización completa (`03e61682`) | 15,79 | 14,88 | 11,72 | MIT | Referencia de comparación |

La ventaja de la variante sin escala se concentra en el error de correspondencia de vértices, mientras que el Chamfer de superficie independiente es prácticamente idéntico entre ambas. Modelos comparables de otros autores: no disponible.

## Limitaciones y advertencias

- Los resultados de reconstrucción con plantilla exacta no miden la robustez frente a desajustes de tamaño de plantilla; el propio autor advierte de que esta variante no está diseñada para ese escenario, ya que se entrenó con `template_mismatch_range: [1.0, 1.0]`.
- El alcance es una única tarea de manipulación (la tarea lift de DexGarmentLab) sobre un dataset concreto de 176/23/22 prendas; no hay evidencia de generalización a otros dominios, categorías de objeto o configuraciones de cámara.
- No se documenta ningún barrido de inferencia con pocos pasos para este checkpoint, por lo que el coste real en producción no está caracterizado.
- Riesgo de sobreajuste al conjunto de prendas del dataset y a las convenciones de coordenadas (escala 3, sin normalización), lo que exige respetar el `config.yml` al desplegar.
- Sesgos: no disponible. No se documenta ningún análisis de sesgo geométrico, de material o de morfología de prenda.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe el riesgo equivalente de generar geometría plausible pero incorrecta en zonas totalmente ocluidas; el Chamfer de superficie ocluida (12,05 mm en inferencia independiente) cuantifica ese error.
- Idioma: no aplica; el modelo no procesa ni genera texto.
- Licencia MIT: permite uso comercial y modificación, pero se distribuye sin garantías y sin datos de validación en producción.
- Adopción nula hasta la fecha de la ficha: 0 descargas y 0 me gusta, sin validación independiente por parte de la comunidad.
- El tamaño del repositorio aparece como 0,0 GB en los metadatos, dato que no parece coherente con la presencia de pesos safetensors en el subdirectorio `model/`; conviene verificar los archivos antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cloth-splatters/dexgarmentlab-lift-20260822-state-est-gps-flow-tf2-noscale
- Checkpoint de referencia con aleatorización completa: https://huggingface.co/Cloth-splatters/dexgarmentlab-lift-20260822-state-est-gps-flow-tf2/tree/03e61682a965325b3ff841e8b10a2a800ee6d28c
- Dataset asociado de correspondencia: https://huggingface.co/datasets/Cloth-splatters/dexgarmentlab-lift-correspondence-20260822
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo, al proyecto UniClothDiff ni a DexGarmentLab. Los resultados devueltos corresponden a consultas sin relación con el modelo (foros de empleo y herramientas EDA) y se descartan.
