# serkan12324/se-primer-v2

## Resumen

SE Primer Destek Riski v2 es un modelo de clasificacion tabular muy compacto, publicado por el usuario serkan12324 en HuggingFace, que predice si un estudiante necesita apoyo pedagogico adicional en una escena educativa concreta a partir de su comportamiento de decision. No es un modelo de lenguaje: se trata de una regresion logistica sobre seis caracteristicas tabulares estandarizadas, exportada a formato ONNX para inferencia ligera. Su relevancia es acotada y de nicho: sirve como componente de un sistema de tutoria adaptativa denominado SE Primer, donde una prediccion positiva desactiva la presion de tiempo y activa pistas socraticas mas profundas y explicaciones tecnicas detalladas.

El modelo se ha entrenado con datos sinteticos generados mediante una regla fija con semilla 30107, y el propio autor advierte que la version publicada no deberia considerarse valida sin al menos 15 sesiones reales anonimizadas. El repositorio es practicamente vacio en terminos de tamano (0.0 GB), lo que confirma que se trata de un artefacto de inferencia ONNX de muy pocos parametros, no de un transformer.

Por su naturaleza, esta ficha debe interpretarse con cautela: la informacion disponible es escasa, procede casi exclusivamente de la model card y no incluye resultados numericos de benchmarks ni detalles de arquitectura mas alla de "regresion logistica". Todas las carencias se marcan explicitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica sobre 6 caracteristicas tabulares estandarizadas |
| Parametros totales | no disponible (modelo lineal; el numero de coeficientes es 6 mas el termino de sesgo, pero no se publica el conteo exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (exportacion ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es una regresion logistica clasica que opera sobre seis caracteristicas tabulares previamente estandarizadas. El modelo se exporta a ONNX y se valida comprobando que la diferencia maxima absoluta de probabilidad entre la implementacion en scikit-learn y la de ONNX se mantiene por debajo de 1e-4, umbral declarado en la model card como criterio de aceptacion de la exportacion.

Los datos de desarrollo se generan de forma sintetica con una semilla fija (30107) y una regla descrita en el README, no con un corpus real. El autor indica que la version publicada no se considera adecuada sin al menos 15 sesiones reales anonimizadas, lo que sugiere que el entrenamiento actual se apoya en datos simulados y que el pipeline contempla una fase posterior con datos reales. La metrica primaria es F1, con una puerta de publicacion fijada de antemano en F1 >= 0.82; los valores actuales se remiten al `config.json`, que no se ha proporcionado en la informacion disponible.

No se documentan tecnicas de regularizacion, validacion cruzada, calibracion de probabilidades ni procesos de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Clasificacion binaria tabular: predice si un estudiante necesita apoyo de aprendizaje adicional en una escena dada.
- Inferencia ligera via ONNX, apta para ejecucion en entornos con recursos muy limitados.
- Integracion con logica pedagogica: una prediccion positiva desactiva la presion de tiempo y activa pistas socraticas mas profundas y explicaciones tecnicas detalladas.
- Consistencia numerica entre scikit-learn y ONNX verificada con tolerancia de 1e-4 en probabilidad.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision, audio, tool calling ni capacidades de agente.
- Soporte multilingue limitado al turco segun la etiqueta de idioma declarada.

## Casos de uso

- Tutoria adaptativa en tiempo real: el modelo recibe las seis caracteristicas del comportamiento de decision del alumno y decide si conviene retirar la presion temporal y ofrecer apoyo socratico adicional, integrándose en el bucle de interaccion de SE Primer.
- Motor de reglas pedagogicas asistido por modelo: sirve como capa de decision previa a la seleccion de pistas o explicaciones, sustituyendo heuristicas manuales por una probabilidad calibrada (pendiente de validacion con datos reales).
- Prototipado rapido de sistemas educativos: al ser un ONNX de pocos kilobytes, permite iterar sobre la logica de intervencion sin coste de infraestructura.
- Despliegue en el navegador o en dispositivos de baja potencia: la inferencia ONNX puede ejecutarse en cliente, evitando enviar datos de sesion a un servidor.
- Pruebas A/B de estrategias de apoyo: permite comparar variantes de intervencion pedagogica midiendo la tasa de predicciones positivas y su correlacion con resultados de aprendizaje.
- Filtro previo en pipelines de analitica educativa: clasifica sesiones que requieren revision humana o analisis detallado, reduciendo el volumen de sesiones a inspeccionar.
- Componente de simulacion para desarrollo: al generarse los datos con una regla y semilla conocidas, facilita reproducir escenarios de prueba en el desarrollo de la aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la metrica primaria es F1 con un umbral de publicacion de F1 >= 0.82 y que los valores actuales estan en `config.json`, pero dicho fichero no se ha facilitado. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, que por otra parte no aplicarian a un modelo tabular de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; un modelo lineal ONNX de seis caracteristicas ocupa del orden de kilobytes y puede ejecutarse en CPU.
- GPU recomendadas: no son necesarias; cualquier CPU moderna es suficiente. Una GPU solo tendria sentido para procesar lotes muy grandes en paralelo.
- Compatibilidad con GPU de consumo: si, en cualquier GPU, e incluso en entornos sin GPU (navegador, movil, Raspberry Pi).
- Opciones de despliegue: ONNX Runtime (CPU, Web, Mobile), integracion en aplicaciones Python via onnxruntime, o exportacion a otros runtimes compatibles con ONNX. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; por la naturaleza del modelo, se espera latencia sub-milisegundo en CPU para inferencia individual.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria (clasificadores tabulares para apoyo educativo) ni ofrece datos de rendimiento que permitan una comparacion objetiva. Como referencia generica, podria compararse con clasificadores tabulares como regresion logistica de scikit-learn o gradient boosting (XGBoost, LightGBM), pero no se dispone de resultados medidos de este modelo frente a ellos.

## Limitaciones y advertencias

- Los datos de entrenamiento son sinteticos y especificos del contexto de la leccion; el autor advierte explicitamente que el modelo no es generalizable.
- La version publicada no se considera valida sin al menos 15 sesiones reales anonimizadas, segun la propia model card.
- La prediccion es una sugerencia de apoyo pedagogico, no una medida de capacidad o inteligencia del estudiante.
- No se reclama equidad entre subgrupos debido al bajo tamano de muestra.
- Uso prohibido segun el autor: calificacion, ranking de estudiantes, disciplina, inferencia sanitaria o psicologica, identificacion de identidad y generalizacion automatica a otras asignaturas.
- Riesgo de alucinacion no aplica en el sentido habitual (no genera texto), pero si existe riesgo de falsos positivos y negativos en la clasificacion, sin metricas publicadas que permitan cuantificarlo.
- La licencia MIT permite uso comercial, pero las restricciones de uso etico descritas en la model card deberian respetarse en cualquier despliegue en produccion.
- El repositorio no incluye informacion detallada sobre calibracion de probabilidades, tratamiento de valores atipicos ni gestion de datos faltantes en las seis caracteristicas de entrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/serkan12324/se-primer-v2
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios de codigo o demos.
