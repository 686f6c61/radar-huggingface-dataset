# OpenWAM-Stanford/OpenWAM-IDM-CF64k

## Resumen

OpenWAM-IDM-CF64k es un modelo de dinámica inversa (inverse dynamics model, IDM) desarrollado por OpenWAM-Stanford para robótica de manipulación. Su función es predecir la secuencia de acciones de un brazo robótico que conecta una observación visual actual con un futuro visual deseado. No genera texto ni razona en lenguaje natural: es un componente de un sistema video-a-acción en el que un predictor de vídeo imagina el movimiento y este IDM lo traduce a comandos de control del efector final y de la pinza.

El checkpoint se ha post-entrenado exclusivamente con datos contrafactuales (100% counterfactual dynamics) sobre la colección LIBERO-Long (LIBERO-10) CF64k, con 20.000 pasos de post-entrenamiento. Parte del backbone de OpenWAM preentrenado con vídeo de robots. El modelo consume vistas de cámara del agente y de la muñeca, propiocepción del robot y una representación latente de un vídeo futuro corto; no usa condicionamiento por lenguaje de tarea ni acciones pasadas, lo que permite emparejarlo con predictores de vídeo adaptados a tareas sin reentrenar la componente de acción.

Su relevancia radica en que demuestra que un IDM congelado, entrenado con dinámica contrafactual, puede componerse con distintos predictores de vídeo y alcanzar un 93,8% de éxito en LIBERO-10 (500 episodios) y un 93,5% de media en transferencia a cuatro tareas de LIBERO-90. El repositorio ocupa 30,7 GB y la licencia es AGPL-3.0-only.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de dinámica inversa sobre backbone OpenWAM preentrenado con vídeo de robots (detalle de capas no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (consume una "short future video" representada como latentes; número de frames no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés; relevante solo para documentación, no hay entrada de lenguaje en el modelo) |
| Licencia | AGPL-3.0-only |
| Formato de pesos | no disponible (repositorio PyTorch; pesos e configuración de inferencia incluidos) |

## Arquitectura y entrenamiento

El modelo es un IDM que opera sobre el backbone de OpenWAM, preentrenado con vídeo de robots. La entrada combina las vistas de cámara del agente y de la muñeca, la propiocepción del robot y latentes de un vídeo futuro corto. La salida son controles delta del efector final y comandos de pinza. La formulación es local: no hay condicionamiento por lenguaje de tarea ni por acciones pasadas, lo que desacopla la componente de acción del predictor de vídeo y permite reutilizar el IDM congelado con predictores adaptados a cada tarea.

El entrenamiento de este checkpoint consiste en 20.000 pasos de post-entrenamiento sobre la colección LIBERO-Long (LIBERO-10) CF64k, con un 100% de dinámica contrafactual: ejemplos que exploran distintas secuencias de acción desde estados iniciales compartidos, ampliando la experiencia del modelo más allá de las trayectorias demostradas. No se especifican en la información disponible el número de tokens, la composición completa del dataset ni si hubo RLHF o DPO (no aplicable en este dominio). Existe un checkpoint hermano, OpenWAM-IDM-Mixed-CF64k, entrenado con datos contrafactuales y demostraciones.

## Capacidades

- Predicción de acciones de robot: genera controles delta del efector final y comandos de pinza a partir de observaciones visuales y propiocepción.
- Control guiado por futuro visual: traduce un vídeo futuro imaginado (en forma de latentes) en una secuencia de acciones ejecutables.
- Entrada multimodal de robot: cámaras de agente y muñeca más propiocepción.
- Composición con predictores de vídeo: funciona como componente congelada junto a video predictors adaptados a tarea sin reentrenamiento.
- Aprendizaje contrafactual: entrenado para explorar secuencias de acción alternativas desde estados compartidos.
- Sin condicionamiento por lenguaje de tarea ni por acciones pasadas (formulación local).
- No soporta tool calling, function calling, agentes de texto, razonamiento en lenguaje natural, visión general, audio ni modo thinking: es un modelo específico de robótica.

## Casos de uso

- Manipulación robótica en entornos LIBERO: ejecutar tareas de LIBERO-10 y LIBERO-90 componiendo este IDM con el predictor de vídeo correspondiente, con éxito reportado del 93,8% y 93,5% respectivamente.
- Transferencia a nuevas tareas con predictor adaptado: reutilizar el IDM congelado y entrenar solo el predictor de vídeo para cada nueva tarea, reduciendo el coste de adaptación al no reentrenar la componente de acción.
- Investigación en dinámica inversa: servir como referencia para estudiar el efecto del entrenamiento contrafactual frente a demostraciones (comparación con OpenWAM-IDM-Mixed-CF64k).
- Generación de datos de acción sintéticos: usar el IDM para etiquetar futuros visuales generados por un predictor y producir pares observación-acción para entrenamiento.
- Evaluación de predictores de vídeo: medir la calidad de un video predictor por la tasa de éxito del sistema video-a-acción completo con el IDM fijo.
- Prototipado de pipelines video-a-acción: integrar el checkpoint en el pipeline documentado de OpenWAM para experimentar con control basado en imaginación visual.
- Benchmarking reproducible en robótica: usar LIBERO-10 con 500 episodios como protocolo de evaluación estandarizado.

## Benchmarks y rendimiento

| Evaluación | Configuración | Éxito |
|---|---|---|
| LIBERO-10, 500 episodios | IDM congelado + OpenWAM VTA step-9700 (469/500) | 93,8% |
| Transferencia a 4 tareas de LIBERO-90, 50 episodios cada una | IDM congelado + predictores de vídeo ajustados a tarea (tareas 21, 45, 64, 74); media de las cuatro | 93,5% |

Los resultados miden el sistema video-a-acción compuesto con este IDM congelado, no el IDM de forma aislada. No se han publicado en la información disponible resultados de benchmarks de texto (MMLU, HumanEval, GSM8K) por no ser aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 30,7 GB, lo que da una cota inferior orientativa del espacio en disco necesario.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo?: no disponible.
- Opciones de despliegue: PyTorch con el pipeline de OpenWAM (guía de composición video-a-acción); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Éxito LIBERO-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenWAM-IDM-CF64k | IDM sobre backbone OpenWAM | 100% contrafactual, LIBERO-10 CF64k, 20k pasos | 93,8% | AGPL-3.0-only | Hugging Face |
| OpenWAM-IDM-Mixed-CF64k | IDM sobre backbone OpenWAM | Contrafactual + demostraciones, LIBERO-10 CF64k | no disponible en la información proporcionada | AGPL-3.0-only | Hugging Face |

No se dispone en la información proporcionada de datos de otros IDM comparables (parámetros, contexto, rendimiento) para ampliar la comparativa.

## Limitaciones y advertencias

- Dominio restringido: solo predice acciones de robot; no es un modelo de lenguaje ni de propósito general.
- Dependencia del predictor de vídeo: el rendimiento reportado corresponde al sistema compuesto; un video predictor de menor calidad degradará el éxito.
- Evaluación limitada a LIBERO: los resultados (93,8% y 93,5%) son sobre tareas LIBERO-10 y LIBERO-90; no hay evidencia de generalización a otros entornos o robots en la información disponible.
- Sin condicionamiento por lenguaje de tarea: no puede recibir instrucciones en texto; la tarea queda definida por el futuro visual y el predictor empleado.
- Entrenamiento exclusivamente contrafactual: puede presentar diferencias de comportamiento frente al checkpoint Mixed, especialmente en trayectorias cercanas a las demostraciones.
- Licencia AGPL-3.0-only: impone obligaciones de copyleft para uso en red y distribución; debe revisarse antes de uso comercial o en productos propietarios. Se conservan atribuciones upstream en NOTICE y LICENSE.upstream.
- Idiomas: solo inglés en documentación; el modelo no procesa lenguaje.
- Sesgos y alucinación: no se documentan sesgos específicos; en robótica, el riesgo equivalente es la predicción de acciones inválidas o inseguras ante futuros visuales irreales, sin garantías de seguridad física indicadas.
- Sin datos publicados de cuantización, latencia ni requisitos de hardware, lo que dificulta planificar el despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/OpenWAM-Stanford/OpenWAM-IDM-CF64k
- Proyecto OpenWAM: https://openwam.stanford.edu/
- Código: https://github.com/OpenWAM/OpenWAM
- Guía de inferencia (composición video-a-acción): https://github.com/OpenWAM/OpenWAM/blob/main/docs/video_action_composition.md
- Checkpoint hermano Mixed CF64k: https://huggingface.co/OpenWAM-Stanford/OpenWAM-IDM-Mixed-CF64k
