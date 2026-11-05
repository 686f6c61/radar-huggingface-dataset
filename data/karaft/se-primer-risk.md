# karaft/se-primer-risk

## Resumen

SE Primer riskli karar modeli es un clasificador binario de muy baja complejidad publicado por el usuario karaft en HuggingFace. Su unico proposito es estimar la probabilidad de que un jugador del videojuego SE Primer seleccione la opcion de riesgo (B) en la pantalla de decision; si la probabilidad estimada es igual o superior a 0,50, el juego muestra una pista y elimina la presion de tiempo en las decisiones segunda y tercera para jugadores experimentados. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un pipeline `StandardScaler → LogisticRegression` con `class_weight="balanced"` y semilla 13, exportado a ONNX.

El modelo opera sobre un vector de 6 caracteristicas float32 por muestra y devuelve dos probabilidades float32 (clase 0 y clase 1). El repositorio tiene un tamano de 0,0 GB, lo que refleja que los pesos son practicamente insignificantes en terminos de almacenamiento. Fue creado y actualizado el 4 de noviembre de 2026 y no registra descargas ni likes en el momento de redactar esta ficha.

Su relevancia es limitada y muy acotada al dominio: se trata de un componente de jugabilidad interno de un titulo concreto, no de un modelo reutilizable para tareas generales. La propia model card advierte explicitamente que el modelo no debe emplearse para evaluar personas, en procesos de contratacion ni en ninguna decision fuera del juego. La informacion disponible sobre licencia, idiomas y pipeline es inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline clasico: StandardScaler + LogisticRegression (class_weight="balanced"), exportado a ONNX |
| Parametros totales | no disponible (regresion logistica sobre 6 caracteristicas; orden de decenas de coeficientes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 6 caracteristicas, sin secuencia) |
| Tipos de cuantizacion | no disponible (formato ONNX float32) |
| Idiomas soportados | no disponible (no procesa texto; etiquetas y documentacion en turco) |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Entrada | float32 `[n, 6]` |
| Salida | float32 `[n, 2]` (probabilidades por clase) |
| Semilla de entrenamiento | 13 |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura de transformer ni de red neuronal profunda. Se compone de un escalador estandar (`StandardScaler`) que normaliza las 6 caracteristicas de entrada, seguido de una regresion logistica con ponderacion de clases balanceada. El contrato de entrada y salida esta documentado en el `config.json` del repositorio: entrada float32 de forma `[n, 6]` y salida float32 de forma `[n, 2]`. El artefacto se distribuye en formato ONNX, lo que sugiere ejecucion en el cliente del juego.

El conjunto de entrenamiento combina datos reales y sinteticos. Segun la model card, `data/oturumlar.csv` contiene 40 sesiones reales (119 filas) y 120 sesiones sinteticas (360 filas) generadas con `data/sentetik.py` y semilla 13. El numero de sesiones sinteticas se amplio de 80 a 120 porque el modelo no superaba el umbral de aceptacion con 80. El diccionario de caracteristicas esta en `data/SOZLUK.md`. No se documenta el uso de RLHF, DPO ni tecnicas de ajuste fino propias de modelos generativos.

## Capacidades

- Clasificacion binaria: estima la probabilidad de que el jugador elija la opcion de riesgo (B) en la pantalla de decision de SE Primer.
- Umbralizacion a 0,50: si la probabilidad estimada es igual o superior a 0,50, el juego activa la pista y elimina la presion de tiempo en las decisiones 2 y 3.
- Inferencia sobre 6 caracteristicas numericas por muestra, con salida de probabilidades por clase.
- Ejecucion en el cliente mediante ONNX, sin dependencia de servidor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- No tiene capacidades multilingues: no procesa lenguaje natural.

## Casos de uso

- Ajuste dinamico de dificultad en SE Primer: el juego consulta la probabilidad estimada antes de mostrar la pantalla de decision y, si supera 0,50, activa la pista y retira el temporizador en las decisiones 2 y 3 para jugadores experimentados.
- Sistema de ayuda contextual en el cliente: al ejecutarse en ONNX sobre el dispositivo, permite ofrecer asistencia sin enviar datos de sesion a un servidor.
- Telemetria de jugabilidad: las probabilidades por muestra pueden registrarse para analizar como evoluciona la propension al riesgo de un jugador a lo largo de una partida.
- Prototipado de mecanicas de riesgo en el mismo escenario (Nobetci Muhendis): sirve como referencia para iterar sobre el diseno de decisiones con recompensa incierta.
- Validacion de pipelines ONNX de baja latencia: por su tamano minimo, es util como caso de prueba de integracion de modelos ONNX en un motor de juego.
- Docencia o demostracion de clasificacion binaria con datos mixtos reales/sinteticos: el repositorio incluye el script de generacion sintetica y el diccionario de caracteristicas, lo que facilita reproducir el flujo completo.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas del propio autor en el conjunto de test separado por sesion, con umbrales de aceptacion definidos en `spec.md` §10 (ROC AUC >= 0,65, recall >= 0,60).

| Test | Filas | ROC AUC | Recall |
|---|---|---|---|
| Todos (el umbral de aceptacion se evalua sobre este conjunto) | 143 | 0,654 | 0,610 |
| Solo filas reales | 32 | 0,283 | 0,500 |

El autor senala que la capacidad predictiva sobre filas reales es baja y que la caracteristica `okuma_suresi_sn` (mediana real de 1,2 s) mide la velocidad de clic y no la lectura. No se han publicado comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo cabe en CPU y en cualquier GPU consumer, e incluso en el propio cliente del juego.
- GPU recomendadas: no requiere GPU; la inferencia ONNX en CPU es suficiente.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, integradas) y en dispositivos moviles.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integracion directa en el motor del juego.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo (regresion logistica sobre 6 caracteristicas) se espera latencia despreciable, aunque no se aportan cifras.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (clasificadores de decision especificos de un videojuego concreto). Como referencia generica de la familia, cualquier regresion logistica con `StandardScaler` sobre 6 caracteristicas seria funcionalmente equivalente, pero no se dispone de datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Entrenado en un unico escenario (Nobetci Muhendis); no generaliza a otros escenarios del juego.
- La definicion de "riesgoso" corresponde a las opciones B de este juego; en la vida real, aplicar un parche en produccion no siempre es incorrecto.
- Las caracteristicas de tiempo dependen del dispositivo y de la velocidad de lectura; no se han medido con usuarios de lectores de pantalla.
- Rendimiento bajo en filas reales (ROC AUC 0,283), lo que indica escasa capacidad predictiva fuera de la distribucion sintetica.
- No debe usarse para calificar, contratar, evaluar personas ni para ninguna decision fuera del juego; el modelo no mide la habilidad de la persona, solo predice la siguiente eleccion dentro del juego.
- Licencia no especificada: no hay autorizacion explicita documentada para uso comercial.
- No contiene datos personales segun el autor; el modelo se ejecuta en el cliente y su archivo es publico.
- Riesgo de alucinacion no aplica (no es un modelo generativo); el riesgo relevante es la clasificacion erronea por desviacion de la distribucion de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/karaft/se-primer-risk
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
