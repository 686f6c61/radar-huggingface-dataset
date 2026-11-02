# Astrid16/PACT-WAM-AR2-Predictor

## Resumen

PACT-WAM AR2 Predictor es un checkpoint de un predictor de mundo (world model) condicionado por acciones, desarrollado por el usuario Astrid16 en el contexto del proyecto PACT-WAM. No se trata de un modelo de lenguaje ni de un transformer estándar de HuggingFace, sino de un componente especializado que opera sobre representaciones latentes de un encoder JEPA y genera predicciones de horizontes futuros en entornos de robótica manipulativa. El checkpoint corresponde exactamente al paso 19690 utilizado en los experimentos de guiado de PACT-WAM, preservando la precisión y serialización originales.

El modelo resuelve el problema de predecir la evolución del estado latente de un entorno robótico a partir de acciones de bajo nivel, lo que resulta relevante para planificación basada en modelos, guiado de políticas y evaluación de trayectorias en tareas de manipulación. Su arquitectura es autorregresiva y consume un latente actual de forma [B,576,1024], cuatro acciones de bajo nivel [B,4,7], el estado del robot [B,8] y un índice de fase, produciendo dos llamadas autorregresivas que cubren dos horizontes futuros.

Es importante señalar que este repositorio no incluye los pesos del encoder JEPA ni del modelo WAM completo, y que el propio autor advierte que los resultados positivos iniciales no se extendieron a una mejora amplia de la tasa de éxito en el estudio posterior de siete tareas con semilla 7. Por tanto, debe considerarse un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Predictor autorregresivo condicionado por acciones sobre latentes JEPA (no es un AutoModel de Transformers) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre latente [B,576,1024] y dos horizontes futuros) |
| Tipos de cuantizacion | no disponible (se preserva la precision original del checkpoint) |
| Idiomas soportados | no disponible (modelo de robótica, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | checkpoint serializado propio con manifiesto SHA256 en artifact_manifest.json |
| Tamano del repositorio | 3.7 GB |
| Entradas por llamada | latente [B,576,1024], acciones [B,4,7], estado robot [B,8], indice de fase |
| Salidas | dos horizontes futuros mediante dos llamadas autorregresivas |
| Punto de entrada | code/fastwam_ar2_eval.py |

## Arquitectura y entrenamiento

La arquitectura es un predictor autorregresivo que actua sobre representaciones latentes producidas por un encoder JEPA (Joint Embedding Predictive Architecture). Cada llamada al predictor consume un latente actual con forma [B,576,1024], cuatro acciones de bajo nivel con forma [B,4,7], el estado del robot [B,8] y un indice de fase; mediante dos llamadas autorregresivas se predicen dos horizontes futuros. El checkpoint corresponde al paso 19690 de entrenamiento y conserva la precision y serializacion originales.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, ya que no es un modelo linguistico. El autor indica que los pesos del encoder JEPA y del modelo WAM no estan incluidos en el repositorio, por lo que el predictor no es autónomo: requiere el resto del pipeline PACT-WAM. Se debe aplicar la normalizacion de acciones y estados propia del entrenamiento, asi como los contratos de camara y accion definidos en el codigo fuente de PACT-WAM. Los pesos opcionales de tarea utilizan demostraciones de entrenamiento de la tarea base, no trayectorias de evaluacion perturbadas.

## Capacidades

- Prediccion de latentes futuros condicionada por acciones en entornos de manipulacion robotica.
- Modelado de mundo para planificacion y guiado de politicas (guidance experiments).
- Procesamiento de acciones de bajo nivel con dimensionalidad 7 por paso (cuatro pasos por llamada).
- Incorporacion del estado del robot (8 dimensiones) y de un indice de fase para condicionar la prediccion.
- Generacion autorregresiva de dos horizontes futuros mediante dos llamadas encadenadas.
- Integracion con el pipeline PACT-WAM para evaluacion en tareas tipo LIBERO.
- No soporta tool calling, function calling, agentes linguisticos ni capacidades multilingues.
- No dispone de modo thinking, vision ni audio en el sentido de los modelos generativos multimodales.

## Casos de uso

- Planificacion basada en modelo en manipulacion robotica: el predictor permite simular la evolucion del latente ante secuencias de acciones, lo que habilita la seleccion de acciones mediante rollout y evaluacion de coste antes de ejecutar en el robot real.
- Guiado de politicas (policy guidance): integrado en PACT-WAM, el predictor puede puntuar trayectorias candidatas generadas por una politica base y redirigir la accion hacia regiones de mayor probabilidad de exito.
- Evaluacion de trayectorias en simulacion tipo LIBERO: el checkpoint permite reproducir los experimentos de guiado del autor sobre tareas de manipulacion, comparando horizontes predichos con estados reales.
- Investigacion en world models con JEPA: sirve como componente de referencia para estudiar la calidad de predicciones latentes condicionadas por acciones en entornos con estado parcialmente observable.
- Reproducibilidad de experimentos: al preservar el hash del checkpoint y el manifiesto SHA256, permite replicar tablas de calibracion de tareas existentes sin desviaciones por cambios de pesos.
- Desarrollo de control predictivo: el predictor puede alimentar bucles de control que evaluen acciones candidatas a corto plazo (dos horizontes) usando el estado actual del robot y el indice de fase.
- Analisis de limitaciones en transferencia: util para estudiar por que las mejoras iniciales no se generalizan a un conjunto amplio de tareas, comparando el estudio inicial con el de siete tareas y semilla 7.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los resultados positivos iniciales no se extendieron a una mejora amplia de la tasa de exito en el estudio posterior de siete tareas con semilla 7, pero no se proporcionan cifras concretas de tasas de exito, errores de prediccion ni comparaciones cuantitativas con otras lineas base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repositorio ocupa 3.7 GB, por lo que el checkpoint en precision original requiere al menos ese orden de magnitud, mas la memoria del encoder JEPA y del pipeline WAM no incluidos.
- GPU recomendadas: no disponible. Al tratarse de un predictor sobre latentes de dimension [B,576,1024], se recomienda una GPU con al menos 16-24 GB de VRAM para margen con el resto del pipeline, aunque no hay dato confirmado.
- Cabe en GPU de consumo: probablemente si en modelos con 24 GB o mas (RTX 3090, RTX 4090) para el predictor aislado, siempre que se disponga del encoder JEPA y del resto del pipeline; no confirmado por el autor.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue se realiza mediante el codigo del repositorio PACT-WAM, con punto de entrada code/fastwam_ar2_eval.py.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (predictores de mundo condicionados por acciones sobre latentes JEPA en el ecosistema PACT-WAM), ni se dispone de datos cuantitativos para establecer una comparacion rigurosa con alternativas.

## Limitaciones y advertencias

- El repositorio no incluye los pesos del encoder JEPA ni del modelo WAM, por lo que el predictor no es utilizable de forma aislada.
- No es un AutoModel de Transformers; requiere el codigo y los contratos de PACT-WAM para su ejecucion.
- El autor advierte que los resultados positivos iniciales no se generalizaron a una mejora amplia de la tasa de exito en el estudio posterior de siete tareas con semilla 7.
- Es necesario aplicar la normalizacion de acciones y estados propia del entrenamiento; omitirla invalida las predicciones.
- Los pesos opcionales de tarea se basan en demostraciones de entrenamiento de la tarea base, no en trayectorias de evaluacion perturbadas, lo que puede introducir sesgo en la evaluacion.
- La licencia no esta disponible, lo que impide confirmar si se permite uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- No hay informacion sobre sesgos, alucinacion o limitaciones idiomaticas porque no es un modelo linguistico; los riesgos se refieren a la fidelidad de las predicciones latentes y a la transferencia entre tareas.
- El checkpoint esta vinculado a un hash concreto; modificar los pesos invalida las tablas de calibracion de tareas existentes.
- No se han publicado benchmarks cuantitativos en la informacion disponible, por lo que no es posible avalar su rendimiento frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Astrid16/PACT-WAM-AR2-Predictor
- Repositorio de implementacion y evaluacion: https://github.com/cpx196/PACT-WAM
- Manifiesto de artefactos: artifact_manifest.json (incluido en el repositorio de HuggingFace)
- Punto de entrada de codigo: code/fastwam_ar2_eval.py (incluido en el repositorio de HuggingFace)
