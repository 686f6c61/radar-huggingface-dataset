# akifcodexclaude/se-primer-v2-risk

## Resumen

SE Primer v2 — kötü sona gidiş riski (v2.0-rc1) es un modelo de clasificacion tabular publicado por el usuario akifcodexclaude en HuggingFace. No es un modelo de lenguaje: es un pipeline de scikit-learn (StandardScaler seguido de LogisticRegression con class_weight="balanced") exportado a ONNX, disenado para predecir, dentro de un juego educativo llamado SE Primer, la probabilidad de que una sesion de juego termine en un "mal final". El modelo consume ocho caracteristicas numericas del comportamiento del jugador (numero de escena, nivel declarado, tiempos de decision y de primer clic, cambios de seleccion, visualizacion de pistas, numero de elecciones riesgosas previas y si la eleccion actual es riesgosa) y devuelve dos probabilidades.

El modelo resuelve un problema muy acotado: cuando la probabilidad predicha es mayor o igual a 0,5, el juego activa una intervencion pedagogica (el mentor Deniz plantea una pregunta socratica, se elimina la presion de tiempo de 60 segundos y se profundizan las explicaciones de resultado). Es, por tanto, un clasificador de senal de riesgo en tiempo de juego, no una herramienta de evaluacion de personas. El autor lo declara explicitamente: no debe usarse para puntuar, contratar ni clasificar a candidatos a ingeniero de software.

Su relevancia es limitada fuera del contexto del juego. Se trata de un artefacto educativo con datos sinteticos (300 sesiones, 1500 decisiones), entrenado con scikit-learn 1.9.1 sobre Python 3.12 y exportado a ONNX opset 17 con skl2onnx. El repositorio ocupa 0,0 GB y no registra descargas ni "likes" en el momento de la consulta. La ficha se incluye por completitud del catalogo, pero conviene leerla como lo que es: un modelo tabular de juguete con metricas internas razonables y un alcance funcional muy restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: StandardScaler + LogisticRegression (class_weight="balanced"), exportado a ONNX opset 17 |
| Parametros totales | 8 coeficientes mas intercepto (regresion logistica); no disponible el recuento exacto de parametros del pipeline |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada tabular fija de 8 caracteristicas) |
| Tipos de cuantizacion | No disponible (el modelo se distribuye como ONNX float32) |
| Idiomas soportados | Turco (tr); el modelo no procesa texto, el idioma se refiere al contexto del juego |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx); el pipeline original es de scikit-learn |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal binario precedido de estandarizacion de caracteristicas. El pipeline aplica StandardScaler a las ocho variables de entrada y despues una regresion logistica con ponderacion de clases equilibrada, con semilla 13. La entrada ONNX es un tensor float32 de forma [n, 8] llamado `input`; la salida es un tensor float32 de forma [n, 2] llamado `probabilities`, con el orden de clases ['0', '1']. El modelo se entreno con Python 3.12 y scikit-learn 1.9.1, y se exporto con skl2onnx a ONNX opset 17. La diferencia maxima entre la inferencia ONNX y la de scikit-learn es de 1,6e-07, muy por debajo del umbral de aceptacion de 0,0001.

Los datos de entrenamiento son sinteticos: 300 sesiones y 1500 decisiones, generadas por un script (`data/veri_hazirla.py`) cuyo criterio y semilla se documentan en el repositorio de GitHub. La particion se hizo con GroupShuffleSplit por sesion, con test del 30 por ciento y random_state 13, resultando 210 sesiones de entrenamiento y 90 de test. No hay RLHF ni DPO: es un ajuste supervisado clasico sobre etiquetas derivadas de las decisiones del jugador. El autor reconoce que la etiqueta procede en gran medida de las propias elecciones (el final se determina por el numero de decisiones riesgosas), de modo que las variables `onceki_riskli` y `bu_secim_riskli` dominan el modelo; su aportacion real es separar a dos jugadores que toman la misma decision en funcion de su comportamiento (tiempos, cambios de seleccion).

## Capacidades

- Clasificacion tabular binaria: estima la probabilidad de que una sesion del juego termine en mal final a partir de ocho caracteristicas numericas.
- Inferencia en navegador mediante onnxruntime-web, con el modelo descargado al cliente.
- Diferenciacion por comportamiento: distingue decisiones rapidas de decisiones meditadas (por ejemplo, una eleccion riesgosa rapida ronda p=0,20, mientras que la misma eleccion tras 45 segundos de duda ronda p=0,88, segun `tests/parite.json`).
- Senal de intervencion pedagogica: cuando p es mayor o igual a 0,5, el juego activa el mentor socratico y elimina la presion de tiempo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- Capacidad multilingue: no aplica; el modelo no procesa lenguaje, y su idioma declarado es el turco por el contexto del juego.

## Casos de uso

- Juego educativo SE Primer: el uso previsto es integrar el modelo en el bucle del juego para decidir, tras cada decision, si se activa la intervencion del mentor. Es adecuado porque la latencia de una regresion logistica en ONNX es minima y permite evaluar en cada escena sin afectar la experiencia.
- Investigacion sobre andamiaje adaptativo: un equipo docente puede usar la senal de riesgo para estudiar cuando conviene retirar la presion de tiempo y profundizar las explicaciones. El modelo es apropiado por su transparencia: los coeficientes estandarizados son publicos y auditables.
- Prototipado de sistemas de tutoria basados en comportamiento: sirve como linea base reproducible (semilla 13, particion documentada) para comparar con modelos mas complejos en entornos de juego serio.
- Docencia de machine learning aplicado: el pipeline completo (StandardScaler + LogisticRegression + exportacion ONNX + validacion de paridad) es un ejemplo didactico de ciclo de vida de un modelo tabular pequeno.
- Despliegue edge en navegador: al distribuirse como ONNX float32 y ejecutarse con onnxruntime-web, encaja en aplicaciones web sin backend de inferencia, util para demos y entornos con recursos limitados.
- Analisis de telemetria de sesiones de juego: permite agregar probabilidades de riesgo por escena para detectar puntos de la narrativa donde los jugadores tienden a decidir mal, siempre dentro de este juego concreto.

## Benchmarks y rendimiento

| Metrica | Valor | Umbral de aceptacion (spec.md, fijado antes del entrenamiento) |
|---|---|---|
| ROC-AUC | 0,9594 | Mayor o igual a 0,75 |
| Recall (mal final) con p mayor o igual a 0,5 | 0,897 | Mayor o igual a 0,7 |
| Precision (mal final) | 0,8 | No disponible |
| Accuracy | 0,88 | No disponible |
| Brier score | 0,0845 | No disponible (menor es mejor) |
| AUC solo escenas 1-2 (alerta temprana) | 0,8864 | No disponible |
| AUC solo sesiones reales | No disponible (pocos datos, intervalo de confianza amplio) | No disponible |
| Diferencia maxima ONNX frente a scikit-learn | 1,6e-07 | Menor o igual a 0,0001 |

Las metricas proceden de un hold-out por sesion sobre datos sinteticos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque el modelo no es un modelo de lenguaje y esas tareas no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo es una regresion logistica de ocho entradas y cabe en unos pocos kilobytes.
- GPU recomendadas: no requiere GPU; funciona en CPU y en navegador con onnxruntime-web.
- Cabe en cualquier GPU de consumo e incluso en dispositivos moviles; el cuello de botella es el tiempo de carga del archivo ONNX, no el calculo.
- Opciones de despliegue: onnxruntime-web (documentado por el autor), onnxruntime en Python, o reimplementacion directa del pipeline con scikit-learn.
- Latencia y throughput: no disponible de forma explicita; por la naturaleza del modelo (una multiplicacion matricial de 8x2 mas una sigmoide) la latencia por muestra es del orden de microsegundos en CPU.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (clasificadores tabulares especificos de un juego educativo). Como referencia generica, cualquier regresion logistica o arbol de decision entrenado sobre las mismas ocho caracteristicas seria funcionalmente equivalente, pero no se dispone de datos de terceros para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo no debe usarse para evaluar, puntuar, contratar ni clasificar a personas como "aptas" o "no aptas". El autor lo prohibe explicitamente.
- Las caracteristicas son especificas de este juego (cinco escenas y un conjunto fijo de opciones); el modelo no es valido para otros escenarios, numero de escenas u orden de opciones.
- No debe usarse para predecir el rendimiento de un ingeniero de guardia en un incidente real.
- La etiqueta deriva en gran medida de las decisiones: `onceki_riskli` (+3,738) y `bu_secim_riskli` (+1,440) son los coeficientes positivos dominantes, de modo que el modelo refleja en parte una regla del propio juego.
- Predomina el dato sintetico; el generador incorpora supuestos del autor (por ejemplo, que un jugador dubitativo tarda mas en decidir). Si el comportamiento real difiere, el modelo falla.
- Riesgo de bucle de retroalimentacion: si se entrenara con sesiones en las que el modelo intervino, aprenderia su propio efecto; por eso el autor recoge datos solo en "modo de recogida" (modelo en la sombra, sin influir en el juego).
- Los tiempos de decision pueden verse afectados por la velocidad del navegador y del dispositivo; en movil el toque puede ser mas lento.
- El archivo del modelo se descarga al cliente y es publico; el autor lo considera aceptable porque no se entreno con datos personales.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el alcance funcional sigue limitado al juego descrito.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero si existe riesgo de calibracion erronea fuera de la distribucion de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akifcodexclaude/se-primer-v2-risk
- Repositorio GitHub con el diccionario de datos (`data/SOZLUK.md`) y el generador (`data/veri_hazirla.py`): no disponible la URL exacta en la informacion proporcionada
- Archivo de pruebas de paridad (`tests/parite.json`): no disponible la URL exacta en la informacion proporcionada
- Especificacion de umbrales (`spec.md`): no disponible la URL exacta en la informacion proporcionada
