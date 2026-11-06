# SalehMammadli/the-primer-v2

## Resumen

The Primer v2 es un modelo de clasificacion tabular publicado por SalehMammadli en Hugging Face. No es un modelo de lenguaje: se trata de un pipeline de escalado y regresion logistica exportado a ONNX que estima la probabilidad de que un jugador cometa un error al tomar una decision en el juego "The Primer: Gece Nobeti". El modelo se activa cuando la probabilidad estimada es igual o superior a 0,5, momento en el que el juego retira la presion temporal y muestra la pista de forma explicita.

El modelo se ha entrenado exclusivamente con datos sinteticos: 360 filas de decision distribuidas en 60 sesiones, generadas mediante una regla de produccion con semilla 13 documentada en el propio repositorio. El autor advierte de forma explicita que las metricas publicadas demuestran que el modelo aprende la regla generadora, no que prediga el comportamiento de jugadores reales. La tasa de decision incorrecta en los datos sinteticos es de 0,45.

Se distribuye como un unico fichero `model.onnx` con licencia MIT, pensado como material educativo y como ejemplo de contrato de inferencia ONNX (entrada `input` float32 `[n, 7]`, salida `probabilities` float32 `[n, 2]`). Su relevancia es limitada fuera del contexto del juego y del ambito docente: no es un modelo de proposito general ni admite texto, imagen o audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Escalado de caracteristicas + regresion logistica (scikit-learn), exportado a ONNX |
| Parametros totales | no disponible (7 caracteristicas de entrada, 2 clases de salida) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin contexto secuencial) |
| Tipos de cuantizacion | no disponible (pesos float32 en ONNX) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clasico de aprendizaje automatico supervisado: escalado de las 7 caracteristicas de entrada seguido de una regresion logistica con `class_weight="balanced"` y semilla 13. El modelo se exporta a ONNX y se valida contra la implementacion de scikit-learn con una diferencia maxima de 1,0e-07, por debajo del umbral de tolerancia de 0,0001. El orden de las caracteristicas de entrada viene definido por el campo `features` de `config.json`, y el orden de las clases de salida por el campo `classes`, con la clase de riesgo en el indice 1.

El entrenamiento utiliza unicamente datos sinteticos: 360 filas de decision en 60 sesiones, generadas por una regla de produccion con semilla 13, cuyo codigo (`tools/sentetik_uret.py`) y descripcion estan incluidos en el repositorio. No hay datos de jugadores reales (0 sesiones reales frente a las 15 que se exigirian para un criterio de aceptacion con datos humanos). No se documenta uso de RLHF, DPO ni tecnicas de ajuste fino; el unico ajuste es el balanceo de clases, que hace que la salida `p` deba interpretarse como una puntuacion de riesgo y no como una probabilidad calibrada.

## Capacidades

- Clasificacion binaria tabular: estima la probabilidad de decision incorrecta a partir de 7 caracteristicas numericas float32.
- Umbralizacion integrada en el flujo del juego: con `p >= 0,5` se retira la presion temporal y se muestra la pista.
- Inferencia por lotes: la entrada admite `[n, 7]` y la salida `[n, 2]`, por lo que procesa multiples filas en una sola llamada.
- Equivalencia numerica con scikit-learn verificada (diferencia maxima de 1,0e-07).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa lenguaje natural.
- No dispone de modo de razonamiento (thinking), vision, audio ni otras capacidades especiales.

## Casos de uso

- Sistema de ayuda adaptativa en "The Primer: Gece Nobeti": el motor del juego consulta el modelo con las 7 caracteristicas de la escena y, si `p >= 0,5`, retira el temporizador y muestra la pista, tal como especifica el autor.
- Ajuste de dificultad en prototipos de juego: permite simular como responderia el sistema de ayuda ante distintas combinaciones de caracteristicas antes de implementar la logica definitiva.
- Material docente de despliegue ONNX: sirve como ejemplo minimo y reproducible de exportacion de un pipeline de scikit-learn a ONNX y de validacion de equivalencia numerica entre ambos entornos.
- Prueba de contratos de inferencia en CI: el fichero `model.onnx` y su contrato de entrada y salida permiten verificar en integracion continua que el runtime (onnxruntime 1.31.1) respeta formas, tipos y orden de salida.
- Referencia de balanceo de clases en clasificacion desbalanceada: el uso de `class_weight="balanced"` y la interpretacion de la salida como puntuacion de riesgo sirven de ejemplo de buenas practicas en formacion.
- Validacion de pipelines de datos sinteticos: el par regla generadora y modelo entrenado permite comprobar que un pipeline recupera la regla subyacente con las metricas declaradas (ROC-AUC 0,7534).
- Prototipado de sistemas de tutoria fuera del juego: no recomendado por el propio autor, que limita el uso a las 6 escenas vistas y descarta explicitamente entornos de aprendizaje distintos del juego.

## Benchmarks y rendimiento

Metricas declaradas por el autor con validacion cruzada de 5 pliegues agrupada por sesion y predicciones fuera de pliegue sobre la fuente `sentetik`:

| Metrica | Valor | Umbral de aceptacion |
|---|---|---|
| ROC-AUC | 0,7534 | >= 0,6 |
| Sensibilidad (`yanlis = 1`, `p >= 0,5`) | 0,5494 | >= 0,5 |
| Exactitud | 0,6944 | sin umbral |
| Exactitud de la linea base (siempre clase mayoritaria) | 0,55 | comparacion |
| Brier | 0,1976 | sin umbral |
| Diferencia maxima ONNX frente a sklearn | 1,0e-07 | <= 0,0001 |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de los anteriores. El autor advierte que un ROC-AUC elevado es esperable porque la regla que genera los datos tiene la misma forma que la que el modelo intenta aprender, por lo que no debe interpretarse como medida de exito.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el fichero `model.onnx` ocupa una fraccion despreciable de los 0,0 GB declarados para el repositorio y los pesos son float32 de dimension trivial (7 entradas, 2 clases).
- GPU recomendadas: no requiere GPU; la inferencia con onnxruntime sobre CPU es suficiente y el modelo cabe en cualquier equipo.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo e incluso sin GPU.
- Opciones de despliegue: onnxruntime (version de referencia 1.31.1) sobre Python 3.12 con scikit-learn 1.9.1 para la validacion; tambien es posible ejecutarlo con cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponible; no se publican mediciones. Por el tamano del modelo, la latencia esperada es del orden de microsegundos a milisegundos por lote en CPU, aunque no se aporta una cifra verificada.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoria (clasificacion tabular sintetica para un juego educativo) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo solo ha visto 6 escenas y 60 sesiones sinteticas; cualquier desviacion respecto a la regla generadora se reproduce en el modelo.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero la salida `p` no es una probabilidad calibrada por el uso de `class_weight="balanced"`; debe leerse como puntuacion de riesgo.
- Limitaciones de contexto o idioma: no procesa lenguaje natural ni secuencias; no tiene ventana de contexto.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el autor prohibe explicitamente el uso para evaluacion de personas, calificaciones, contratacion o cualquier decision sanitaria, y desaconseja su uso en entornos de aprendizaje distintos del juego.
- Caveat de produccion: los datos no provienen de personas reales (0 sesiones reales frente a las 15 exigidas para aceptacion); si una suposicion de la regla generadora es falsa, el modelo falla del mismo modo.
- El modelo no modela comportamientos humanos como la velocidad de reaccion, la memorizacion o la atencion.
- No es una herramienta clinica aunque el escenario del juego se situe en un hospital; no ha visto datos de pacientes.
- El repositorio declara 0 descargas y 0 likes, sin senales de adopcion ni mantenimiento por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SalehMammadli/the-primer-v2
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados al modelo.
