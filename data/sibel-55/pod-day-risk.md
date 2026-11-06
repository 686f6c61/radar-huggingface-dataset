# Sibel-55/pod-day-risk

## Resumen

`pod-day-risk` es un clasificador tabular binario publicado por el usuario Sibel-55 en Hugging Face. Su función es estimar la probabilidad de que un jugador tome una decisión incorrecta en el juego educativo "Pod Day: Telemetri Nöbeti", un escenario de simulación de telemetría aeroespacial. La predicción se realiza una sola vez, diez segundos después de abrirse la escena, y si la probabilidad es igual o superior a 0,5 el sistema activa una pregunta orientadora del tutor y elimina la presión de tiempo.

Técnicamente no es un modelo de lenguaje ni una red neuronal profunda: es una regresión logística con estandarización previa, entrenada con `scikit-learn` (`class_weight="balanced"`, `random_state=42`) y exportada a ONNX mediante `skl2onnx` con opset 17. La entrada es un vector de seis variables float32 y la salida son probabilidades por clase.

Su relevancia es limitada y muy acotada al contexto de un prototipo educativo. El propio autor advierte que los datos son enteramente sintéticos (360 filas, 120 sesiones) y que las métricas reflejan la capacidad del modelo para redescubrir la regla del generador, no el comportamiento de jugadores reales. El repositorio ocupa 0,0 GB y no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica con estandarizacion previa (scikit-learn), exportada a ONNX (opset 17) |
| Parametros totales | 6 coeficientes mas intercepto (no disponible el recuento exacto en la informacion proporcionada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular, entrada fija de 6 caracteristicas) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no procesa texto; etiquetas y documentacion en turco) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un pipeline clasico de aprendizaje supervisado: estandarizacion de las seis variables de entrada seguida de una regresion logistica binaria. Las variables son `seviye` (nivel), `karar_no` (numero de decision), `onceki_yanlis_sayisi` (numero de errores previos), `ipucu_sayisi` (numero de pistas), `ilk10sn_dokunma_sayisi` (toques en los primeros 10 segundos) e `ilk10sn_tutor_soru_sayisi` (preguntas del tutor en los primeros 10 segundos). La entrada se declara como tensor `[N, 6]` con nombre `girdi` y la salida son probabilidades de clase, donde la columna `[:, 1]` corresponde a la probabilidad de decision incorrecta.

El entrenamiento se realizo sobre 360 filas correspondientes a 120 sesiones, generadas integramente de forma sintetica mediante un script (`data/uret_sentetik.py`) alojado en un repositorio de GitHub, con semilla 42. No se recogieron datos personales. La validacion emplea `StratifiedGroupKFold` de 5 pliegues agrupando por sesion para evitar fuga de informacion entre entrenamiento y validacion. Los umbrales de aceptacion se fijaron antes del entrenamiento: el modelo solo se publica si supera las eteras definidas. No se documenta uso de RLHF, DPO ni tecnicas de ajuste fino adicionales.

## Capacidades

- Clasificacion binaria tabular: estima la probabilidad de decision incorrecta a partir de seis caracteristicas numericas.
- Inferencia ONNX portable: el grafo exportado con opset 17 puede ejecutarse con ONNX Runtime en multiples plataformas.
- Integracion ligera en bucles de juego: la prediccion se dispara una unica vez a los 10 segundos de abrirse la escena.
- Activacion condicional de andamiaje pedagogico: con probabilidad igual o superior a 0,5, el sistema muestra una pregunta orientadora y retira la presion temporal.
- No soporta generacion de texto, codigo, matematicas, vision, audio, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues: no procesa lenguaje natural.
- Compatibilidad verificada entre la salida de scikit-learn y la de ONNX con una diferencia inferior a 1e-4.

## Casos de uso

- Andamiaje adaptativo en juegos educativos: el modelo decide en tiempo real si conviene que el tutor intervenga con una pregunta orientadora, evitando interrupciones innecesarias cuando el jugador va bien encaminado.
- Eliminacion dinamica de la presion temporal: cuando la probabilidad de error es alta, el sistema retira el temporizador para reducir la carga cognitiva del estudiante, usando la senal del clasificador como disparador.
- Prototipado rapido de logica pedagogica: al ser un ONNX de pocos kilobytes, se puede incrustar en un cliente web o en un motor de juego sin infraestructura de servidor.
- Investigacion sobre simulacion de telemetria: sirve como referencia reproducible de un pipeline completo (generacion sintetica, validacion agrupada, exportacion ONNX y umbrales predefinidos) para experimentos docentes.
- Evaluacion de tecnicas de validacion con grupos: el uso de `StratifiedGroupKFold` por sesion constituye un ejemplo didactico de como evitar fuga de datos en datasets con multiples observaciones por sujeto.
- Pruebas de integracion ONNX Runtime en entornos con recursos muy limitados: la latencia de una regresion logistica de seis entradas es practicamente despreciable y encaja en dispositivos embebidos o navegadores.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas de validacion cruzada agrupada de 5 pliegues recogidas en la model card:

| Metrica | Resultado | Umbral de aceptacion |
|---|---|---|
| Exactitud | 0,700 | al menos 0,70 |
| Recall para decision incorrecta | 0,619 | al menos 0,60 |
| Exactitud del clasificador mayoritario | 0,556 | referencia comparativa |
| Diferencia de salida ONNX frente a scikit-learn | inferior a 1e-4 | maximo 1e-4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a un modelo tabular de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el grafo ONNX ocupa del orden de kilobytes y puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU. Cualquier CPU moderna es suficiente; una GPU solo tendria sentido si se procesan lotes masivos en paralelo.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo mediante ONNX Runtime con proveedor CUDA o DirectML, aunque no aporta ventaja frente a CPU.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, JavaScript, Java), integracion directa en el motor del juego o en un servicio web ligero.
- Latencia y throughput estimados: no disponibles de forma explicita en la informacion proporcionada; por la naturaleza del modelo (regresion logistica de 6 entradas) la latencia por inferencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se puede senalar, como referencia conceptual, que alternativas de la misma categoria serian:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pod-day-risk | Regresion logistica de 6 entradas | No aplica | Exactitud 0,700 en validacion agrupada | MIT | Hugging Face |
| Regresion logistica equivalente en scikit-learn | 6 coeficientes | No aplica | Identica a la version ONNX | BSD-3-Clause (scikit-learn) | PyPI |
| Arbol de decision o gradient boosting tabular | No disponible | No aplica | No disponible | Segun implementacion | PyPI |

No se han identificado en la informacion disponible modelos publicos directamente comparables para esta tarea concreta.

## Limitaciones y advertencias

- La exactitud esta en el limite exacto del umbral (0,700 frente a 0,70 exigido) y solo supera en unos 14 puntos porcentuales al clasificador mayoritario (0,556), por lo que el margen es estrecho.
- Todos los datos son sinteticos: las metricas demuestran que el modelo reproduce la regla del generador, no que prediga comportamiento real de jugadores. No ha sido validado con sesiones reales.
- El entrenamiento se realizo en Google Colab; con versiones distintas de las librerias los resultados pueden caer por debajo del umbral.
- El autor prohibe explicitamente su uso para calificar, evaluar o clasificar a estudiantes reales, para decisiones donde la seguridad sea critica (por ejemplo, control real de capsulas) y para inferir caracteristicas sobre personas.
- Riesgo de alucinacion no aplica en sentido estricto al no generar texto, pero existe riesgo de calibracion deficiente de las probabilidades fuera de la distribucion sintetica de entrenamiento.
- La documentacion y las etiquetas estan en turco; no hay soporte declarado para otros idiomas ni para entradas de texto.
- La licencia MIT permite uso comercial, pero las restricciones de uso indicadas por el autor y la naturaleza sintetica de los datos desaconsejan cualquier aplicacion en produccion con usuarios reales sin una validacion previa.
- Sin descargas ni interacciones registradas: no hay evidencia de uso en la comunidad ni de mantenimiento posterior a la publicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sibel-55/pod-day-risk
- Repositorio GitHub con el generador de datos sinteticos (`data/uret_sentetik.py`): no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible
- Demo: no disponible
