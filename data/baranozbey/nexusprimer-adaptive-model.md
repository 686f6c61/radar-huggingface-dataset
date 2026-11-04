# baranozbey/nexusprimer-adaptive-model

## Resumen

NexusPrimer Adaptive Hint Predictor v2.0 es un clasificador tabular basado en un arbol de decision (`DecisionTreeClassifier` de scikit-learn) exportado a ONNX (Opset 17). Lo desarrolla baranozbey en el marco de la asignatura YZM301 de Ingenieria de Software de la Universidad de Samsun (Turquia). El modelo no es un modelo de lenguaje: su funcion es predecir, a partir de ocho metricas de comportamiento del estudiante, si este necesitara una pista en la siguiente fase de una simulacion interactiva de gestion de crisis llamada NexusPrimer.

El problema que aborda es pedagogico: ofrecer pistas homogeneas a todos los alumnos reduce el reto para los competentes y deja sin apoyo a los que se bloquean. El clasificador permite que un tutor automatico ajuste dinamicamente su modo (socratico o de apoyo) segun la senal de necesidad de ayuda. La etiqueta objetivo es binaria (`ipucu_gerekli`: 0 no requiere, 1 requiere) y se deriva de reglas heuristicas sobre el comportamiento del usuario.

Se trata de un artefacto de alcance muy limitado: 60 filas de entrenamiento (15 sesiones reales y 5 sinteticas), 8 caracteristicas numericas y un unico idioma de documentacion (turco). Es relevante como ejemplo de integracion de un modelo tabular ligero en el navegador mediante ONNX Runtime Web, no como componente de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Arbol de decision (`DecisionTreeClassifier` de scikit-learn) exportado a ONNX Opset 17 |
| Parametros totales | no disponible (modelo tabular; el numero de nodos y hojas del arbol no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 8 caracteristicas `float32`) |
| Tipos de cuantizacion | no disponible (no se documenta cuantizacion; el modelo es intrinsecamente ligero) |
| Idiomas soportados | Turco (`tr`) en documentacion y nombres de caracteristicas; el modelo en si procesa solo valores numericos |
| Licencia | MIT |
| Formato de pesos | ONNX (Opset 17) y pipeline de scikit-learn |
| Version | 2.0.0 |
| Semilla aleatoria | 42 (fijada en todas las etapas) |
| Variable objetivo | `ipucu_gerekli` (binaria: 0 = no requiere, 1 = requiere) |
| Tamano del repositorio | 0.0 GB (artefacto de muy pequeno tamano) |
| Fecha de creacion | 2026-11-04 |

## Arquitectura y entrenamiento

El modelo es un arbol de decision clasico de scikit-learn, sin componentes neuronales ni atencion. La entrada es un vector de exactamente ocho caracteristicas `float32`: `karar_suresi_sn` (tiempo de decision en segundos), `onceki_yanlis_sayisi` (errores previos), `ipucu_sayisi` (pistas solicitadas en la decision actual), `karar_degistirme_sayisi` (cambios de decision o duda), `sahne_no` (numero de escena, 1-3), `seviye` (nivel de experiencia: 0 principiante/intermedio, 1 experimentado), `onceki_karar_suresi` (duracion de la decision anterior) y `kararsizlik_suresi` (espera hasta la primera accion). La salida es una probabilidad de la clase positiva que se exporta a ONNX y se ejecuta en el cliente mediante ONNX Runtime Web.

El entrenamiento usa un dataset propio (`custom-nexusprimer-sessions`) de 60 filas: 20 sesiones por 3 fases de decision, de las cuales 15 sesiones (45 filas) son reales de 3 personas y 5 sesiones (15 filas) son sinteticas generadas con `numpy.random` y semilla 42. La distribucion de clases esta equilibrada (31 ejemplos de clase 0, un 51,7 %, y 29 de clase 1, un 48,3 %; ratio minoritaria/mayoritaria de 0,94). El etiquetado no es humano: se deriva de una regla heuristica objetiva que marca `ipucu_gerekli = 1` si `ipucu_sayisi >= 2`, o `karar_suresi_sn >= 30`, o `karar_degistirme_sayisi >= 2`. El split es estratificado 80/20 (48 ejemplos de entrenamiento, 12 de test) y se reporta una validacion cruzada de 5 folds. No hay RLHF, DPO ni ajuste fino neuronal.

La innovacion tecnica destacable es la verificacion de paridad numerica entre scikit-learn y ONNX Runtime Web: la diferencia maxima de probabilidades en el conjunto de test es de 4,62e-09, muy por debajo de la tolerancia de 1e-4, lo que permite ejecutar el modelo en el navegador con resultados equivalentes a los del pipeline original.

## Capacidades

- Clasificacion binaria tabular: predice si un estudiante necesitara una pista en la siguiente fase de la simulacion.
- Entrada estrictamente numerica de 8 caracteristicas `float32`; no procesa texto, imagenes ni audio.
- Inferencia en el cliente via ONNX Runtime Web con paridad numerica verificada frente a scikit-learn.
- Determinismo reproducible gracias a la semilla fija 42 en todas las etapas.
- Integracion con un tutor automatico (AI Tutor) para alternar entre modo socratico y modo de apoyo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues mas alla de los nombres de caracteristicas en turco.

## Casos de uso

- Adaptacion pedagogica en tiempo real dentro de la simulacion NexusPrimer: el modelo recibe las metricas de la sesion y decide si el tutor debe ofrecer una pista o mantener el modo socratico, evitando sobreayuda a alumnos competentes.
- Despliegue en navegador sin backend de inferencia: al ejecutarse como ONNX en el cliente, permite entornos educativos con conectividad limitada y reduce costes de servidor.
- Investigacion sobre heuristicas de etiquetado: sirve como caso de estudio de hasta que punto un arbol entrenado con reglas reproduce esas mismas reglas y donde falla (falsos positivos por pausas involuntarias).
- Prototipado rapido de sistemas de tutoria adaptativa: el pipeline scikit-learn + ONNX es reutilizable como plantilla para otros dominios con caracteristicas de comportamiento similares.
- Docencia de integracion ML/ONNX: util en asignaturas de ingenieria de software para mostrar el ciclo completo de entrenamiento, evaluacion, exportacion y paridad numerica.
- Evaluacion de latencia en el cliente: al ser un arbol de decision, la inferencia es practicamente instantanea y adecuada para bucles interactivos por turnos.
- Analisis de comportamiento en simulaciones de crisis: las 8 caracteristicas (tiempo de decision, cambios de decision, errores previos) permiten estudiar patrones de duda en entornos controlados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| F1 en test | 0,9091 |
| Accuracy en test | 0,9167 |
| Precision en test | 1,0000 |
| Recall en test | 0,8333 |
| F1 en validacion cruzada (5 folds) | 0,9351 ± 0,0563 |
| Diferencia maxima sklearn vs ONNX Runtime Web | 4,62e-09 (tolerancia 1e-4) |
| Matriz de confusion (test) | [[6, 0], [1, 5]] |

No se han publicado resultados de benchmarks frente a otros modelos en la informacion disponible. Los datos anteriores corresponden al conjunto de test interno de 12 ejemplos y no son comparables con benchmarks estandar (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el artefacto es un arbol de decision exportado a ONNX y el repositorio ocupa 0,0 GB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU y en el navegador mediante ONNX Runtime Web.
- Compatibilidad con GPU de consumo: si, en cualquier equipo; no necesita A100, H100 ni RTX 4090.
- Opciones de despliegue: ONNX Runtime (Web, Python, C++), pipeline de scikit-learn en Python; no aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput estimados: no disponibles de forma numerica; por la naturaleza del modelo (arbol de decision con 8 entradas) la inferencia es del orden de microsegundos a milisegundos en el cliente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NexusPrimer Adaptive Hint Predictor v2.0 | Arbol de decision tabular (ONNX) | no disponible | no aplica (8 features) | F1 0,9091 en test interno de 12 ejemplos | MIT | HuggingFace |
| Regresion logistica (baseline tabular) | Modelo lineal | no disponible | no aplica | no disponible | segun implementacion | generico |
| Random Forest / Gradient Boosting (baseline tabular) | Ensemble de arboles | no disponible | no aplica | no disponible | segun implementacion | generico |

No se dispone de comparativas publicadas con alternativas concretas en la informacion proporcionada. Cualquier comparacion con modelos de lenguaje o con clasificadores tabulares de otros autores requeriria reentrenar sobre el mismo dataset, que no es publico.

## Limitaciones y advertencias

- Muestra muy pequena: 60 filas (45 reales de 3 personas y 15 sinteticas); no generaliza fuera del contexto de la simulacion NexusPrimer ni a otros dominios de ingenieria de software.
- Dependencia de una regla heuristica: las etiquetas se generan con umbrales fijos (`ipucu_sayisi >= 2`, `karar_suresi_sn >= 30`, `karar_degistirme_sayisi >= 2`), por lo que el modelo aprende a replicar esa regla y hereda sus sesgos.
- Falsos positivos por pausas involuntarias: si el usuario se distrae o se ausenta, el tiempo de decision elevado puede marcar incorrectamente que necesita ayuda.
- Precision de 1,0 y recall de 0,83 en un test de 12 ejemplos: el intervalo de confianza es muy amplio y las metricas no son extrapolables.
- Uso prohibido explicitamente por el autor: diagnostico medico real, evaluacion de rendimiento de personal y calificacion de examenes criticos; solo vale para adaptacion dentro de simulaciones pedagogicas.
- Idioma: documentacion y nombres de caracteristicas en turco; no hay soporte multilingue ni procesamiento de lenguaje natural.
- Licencia MIT: permite uso comercial, pero el autor restringe el ambito de aplicacion en la model card; conviene respetar esas advertencias aunque la licencia no las imponga legalmente.
- Sin cuantizaciones ni variantes publicadas; el artefacto es un unico ONNX y un pipeline de scikit-learn.
- El repositorio figura con 0 descargas y 0 likes, sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baranozbey/nexusprimer-adaptive-model
- Dataset referenciado en la model card: `custom-nexusprimer-sessions` (no se proporciona URL publica)
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
