# fajeee1/se-primer-v2

## Resumen

The Primer v2 es un modelo predictivo de tipo árbol de decisión exportado a ONNX (opset 12) que estima, a partir de telemetría conductual de un jugador, si este necesita apoyo pedagógico proactivo durante una simulación de crisis. Lo publica el usuario fajeee1 en Hugging Face y su función concreta es clasificar cada decisión del jugador en una de dos clases (`destek_gerekli`: 0 o 1) usando seis variables numéricas: nivel, número de escena, tiempo de decisión, número de cambios de decisión, errores previos y número de pistas solicitadas. Si la probabilidad estimada de la clase positiva es igual o superior a 0,50, el juego activa un instructor socrático que ofrece pistas guiadas.

No es un modelo de lenguaje ni una red neuronal profunda: es un clasificador tabular de alcance muy acotado, entrenado sobre 180 filas de decisión correspondientes a 60 sesiones únicas de una simulación sanitaria de tres fases. Su relevancia es la de un componente de software embebido en un producto interactivo (un "primer" o tutorial de crisis), no la de un modelo generalista. El repositorio ocupa 0,0 GB y no incluye pipeline declarado, idiomas ni licencia en los metadatos de Hugging Face, aunque la model card indica licencia MIT.

La información disponible es escasa y proviene casi por completo de la model card en turco. No hay datos de arquitectura interna del árbol (profundidad, número de hojas), ni de composición del dataset más allá del recuento de filas, ni de rendimiento fuera del conjunto de validación cruzada por sesión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Árbol de decisión (DecisionTree) exportado a ONNX, opset 12 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada tabular de 6 características, no secuencial) |
| Tipos de cuantizacion | no disponible (modelo tabular; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (entrada numérica; la model card está en turco) |
| Licencia | MIT (según model card; no declarada en los metadatos de Hugging Face) |
| Formato de pesos | ONNX (opset 12) |

## Arquitectura y entrenamiento

El modelo es un árbol de decisión clásico, no un transformer ni un modelo de lenguaje. Se exporta a ONNX con opset 12 para poder ejecutarse en el navegador junto al juego, lo que permite inferencia local sin backend. La entrada es un vector de seis `float32` en un orden contractual fijo: `seviye_kod`, `sahne_no`, `karar_suresi_sn`, `karar_degistirme_sayisi`, `onceki_yanlis_sayisi` e `ipucu_sayisi`. La salida es la probabilidad de `destek_gerekli = 1`, con umbral de decisión en 0,50.

El entrenamiento se realizó sobre 180 filas de decisión derivadas de 60 sesiones únicas de una simulación de crisis sanitaria de tres fases. Para evitar fuga de información entre decisiones de la misma sesión, la validación usa GroupKFold agrupado por `oturum_id`, de modo que todas las decisiones de una sesión caen en el mismo pliegue. No se documentan hiperparámetros del árbol, número de pliegues, proceso de selección de características ni técnicas de regularización o calibración.

## Capacidades

- Clasificación binaria tabular: predice `destek_gerekli` (0 o 1) a partir de seis características numéricas de telemetría de juego.
- Estimación de probabilidad: devuelve una probabilidad calibrada de forma implícita por el umbral 0,50, que dispara el instructor socrático.
- Inferencia en navegador vía ONNX Runtime Web (implícito por el formato y el caso de uso descrito).
- Integración con lógica de juego: activa pistas pedagógicas proactivas cuando la probabilidad supera el umbral.
- Fallback determinista: si el modelo ONNX no carga, se aplica una regla de pistas por nivel; no se generan probabilidades falsas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio.
- No tiene capacidades multilingües: la entrada es puramente numérica.

## Casos de uso

- Tutorial interactivo de crisis: el modelo decide en tiempo real si el jugador necesita una pista socrática, usando el tiempo de decisión y los errores previos como señales de sobrecarga cognitiva.
- Ajuste dinámico de dificultad: si `karar_suresi_sn` es alto y `onceki_yanlis_sayisi` acumula errores, el sistema puede relajar la presión temporal y ofrecer explicaciones más detalladas.
- Detección de bloqueo en simulaciones formativas: la combinación de cambios de decisión y solicitudes de pista permite identificar jugadores que iteran sin converger y derivarles a contenido de refuerzo.
- Telemetría pedagógica agregada: las probabilidades por sesión pueden registrarse para analizar en qué escenas del escenario sanitario se concentra la necesidad de apoyo.
- Prototipado rápido de sistemas de tutoría adaptativa: al ser un ONNX pequeño, sirve como componente de referencia para validar la lógica de intervención antes de sustituirlo por un modelo mayor.
- Despliegue offline en cliente: al ejecutarse en el navegador, es adecuado para demos o entornos sin backend donde la privacidad de la telemetría del jugador es prioritaria.

## Benchmarks y rendimiento

Resultados reportados en la model card, obtenidos con GroupKFold agrupado por sesión:

| Metrica | Valor | Umbral de aceptacion | Estado |
|---|---|---|---|
| F1-Score | 0,8393 | >= 0,7 | Pasa |
| Accuracy | 0,8278 | >= 0,75 | Pasa |
| ROC-AUC | 0,8593 | >= 0,75 | Pasa |
| Paridad (diferencia) | 1,25e-08 | < 0,0001 | Pasa |

No se han publicado comparaciones con otros modelos en la información disponible. Las métricas proceden de validación cruzada interna sobre 180 filas, por lo que su intervalo de confianza es amplio y no deben extrapolarse a otros dominios.

## Requisitos de hardware

- VRAM: no aplica; un árbol de decisión exportado a ONNX de este tamaño se ejecuta en CPU y en memoria de unos pocos kilobytes.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier GPU de consumo y también en dispositivos móviles y navegadores.
- Despliegue: ONNX Runtime (incluido ONNX Runtime Web para navegador), o cualquier runtime compatible con ONNX opset 12.
- Latencia y throughput: no disponibles de forma explícita; por la naturaleza del modelo, la inferencia es de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Métricas reportadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fajeee1/se-primer-v2 | DecisionTree ONNX | 6 características numéricas | F1 0,8393; Accuracy 0,8278; ROC-AUC 0,8593 | MIT (según model card) | Hugging Face |
| yaseminnartunn/se-primer-v2 | Regresión logística específica de tarea | Telemetría de decisión (según descripción) | no disponible | no disponible | Hugging Face |
| serkan12324/se-primer-v2 | no disponible | Comportamiento de decisión del jugador | no disponible | no disponible | Hugging Face |

Las tres variantes comparten nombre y propósito aparente (predicción de necesidad de apoyo en la misma simulación), pero solo la de fajeee1 documenta métricas y arquitectura. No hay datos para comparar rendimiento entre ellas.

## Limitaciones y advertencias

- Alcance muy restringido: entrenado solo con telemetría de una simulación sanitaria de tres fases; no se generaliza a otros juegos o dominios sin reentrenamiento.
- Conjunto de datos diminuto: 180 filas y 60 sesiones; las métricas tienen alta varianza y pueden no reproducirse en producción.
- Sin documentación de sesgos: no se analiza el comportamiento del modelo por subgrupos de jugadores ni por nivel de habilidad.
- Riesgo de falsos positivos y negativos en el umbral 0,50: no se documenta calibración de probabilidades ni análisis de la curva precisión-recall.
- Dependencia del orden de las características: la entrada debe respetar exactamente el orden `seviye_kod`, `sahne_no`, `karar_suresi_sn`, `karar_degistirme_sayisi`, `onceki_yanlis_sayisi`, `ipucu_sayisi`.
- Fallback silencioso: si el ONNX no carga, se aplica una regla por nivel; el comportamiento puede diferir del modelo sin aviso explícito al usuario.
- Uso comercial: la model card declara MIT, pero los metadatos de Hugging Face no incluyen licencia; conviene verificar con el autor antes de integrarlo en un producto.
- No apto para evaluación de personas: el propio autor advierte que no es una herramienta de calificación de exámenes ni de evaluación de capacidades humanas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fajeee1/se-primer-v2
- Variante de yaseminnartunn: https://huggingface.co/yaseminnartunn/se-primer-v2
- Variante de serkan12324: https://huggingface.co/serkan12324/se-primer-v2
