# qualiadev/microduck-sprint-q1

## Resumen

Microduck-sprint-q1 es una política de control para robótica publicada por el usuario qualiadev en HuggingFace. No se trata de un modelo de lenguaje ni de un modelo multimodal, sino de un controlador entrenado con aprendizaje por refuerzo que genera las acciones de locomocion de un robot microduck. La model card lo describe como una politica "perpetua": una marcha (gait) que se ejecuta de forma continua hasta que se le indique lo contrario, y que se carga en una ranura de politica del robot.

El artefacto principal es un fichero `policy.onnx` que incorpora el normalizador de observaciones en su interior, de modo que la politica acepta observaciones en crudo. El espacio de observacion declarado es de 61 dimensiones y el de acciones de 14, con una frecuencia de control de 50 Hz. El manifiesto asociado, `manifest.json`, sigue el esquema 2 del manifiesto de politicas de microduck descrito en `docs/policy-manifest.md` del repositorio del daemon.

La relevancia de esta ficha es acotada: el modelo acumula 0 descargas y 0 likes en el momento de la consulta, el repositorio declara un tamano de 0.0 GB y no se publican ni licencia, ni idiomas, ni resultados de evaluacion. Se trata, por tanto, de un artefacto experimental de investigacion en aprendizaje por refuerzo aplicado a robots de bajo coste, publicado bajo el flujo de trabajo del proyecto microduck de Pollen Robotics, y no de un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de control entrenada con aprendizaje por refuerzo, exportada a ONNX; no se detalla la topologia de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica reactiva de control; no hay ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `policy.onnx`; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | no disponible / no aplica (modelo de control robotico, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` con el esquema 2 del manifiesto de politicas de microduck |
| Tarea declarada (pipeline) | robotics |
| Espacio de observacion | 61 dimensiones |
| Espacio de acciones | 14 dimensiones |
| Frecuencia de control | 50 Hz |
| Tamano del repositorio | 0.0 GB (segun metadatos de HuggingFace) |
| Libreria asociada | microduck |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-12 |
| Ultima actualizacion | 2026-10-12 |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la topologia concreta de la red (numero de capas, tipo de capas, funcion de activacion ni numero de parametros). Lo unico verificable es que el resultado del entrenamiento se exporta a un unico fichero ONNX, `policy.onnx`, y que el normalizador de observaciones esta integrado en ese mismo grafico, por lo que el consumidor debe alimentar observaciones sin normalizar. El manifiesto `manifest.json` sigue el esquema 2 definido en `docs/policy-manifest.md` del repositorio del daemon, lo que determina como el runtime del robot descubre y carga la politica.

Respecto al entrenamiento, la model card indica que la politica se obtuvo en el repositorio `pollen-robotics/microduck_rl`, en la rama `sprint/race` y en el commit `0141bf4a8`. No se especifican el numero de pasos de entrenamiento, la composicion del dataset, el algoritmo de RL empleado, ni si hubo fases de ajuste fino, destilacion o curriculum. Tampoco se documenta si el entrenamiento se realizo en simulacion, en hardware real o en una combinacion de ambos, ni si se aplicaron tecnicas de aleatorizacion de dominio para facilitar el trasvase simulacion-realidad.

La caracteristica funcional mas destacable declarada por el autor es que la politica es "perpetua": una vez cargada, mantiene la marcha indefinidamente hasta recibir una orden explicita de parada. Esto implica que el modelo no incorpora por si mismo una condicion de terminacion aprendida, sino que la gestion del ciclo de ejecucion recae en el daemon del robot.

## Capacidades

- Generacion de acciones de locomocion para el robot microduck a partir de observaciones de 61 dimensiones, con salida de 14 dimensiones y frecuencia de 50 Hz.
- Marcha continua o "perpetua": la politica mantiene el ciclo de marcha de forma indefinida hasta que se le indique lo contrario.
- Ejecucion como politica cargable en una ranura del sistema del robot mediante el comando `robotctl policy load`.
- Aceptacion de observaciones en crudo: el normalizador esta embebido en el grafo ONNX, lo que simplifica la integracion en el cliente.
- Despliegue portable mediante ONNX Runtime en el hardware del robot o en un equipo externo compatible.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni razonamiento multi-paso; son capacidades ajenas a este tipo de artefacto.
- No se documentan capacidades multilingues ni procesamiento de lenguaje natural.

## Casos de uso

- Demostraciones de locomocion en el robot microduck: la politica se carga en una ranura y el robot mantiene una marcha continua durante una demo o una exhibicion, sin necesidad de reenviar consignas de movimiento.
- Banco de pruebas para el pipeline de despliegue: sirve para validar de extremo a extremo el flujo `robotctl policy load`, la lectura del `manifest.json` con esquema 2 y la carga del grafo ONNX en el daemon.
- Punto de partida para experimentos de aprendizaje por refuerzo en la rama `sprint/race` de `pollen-robotics/microduck_rl`: permite comprobar el comportamiento de un checkpoint concreto (commit `0141bf4a8`) frente a otros checkpoints de la misma rama.
- Evaluacion comparativa de politicas de marcha: al estar empaquetada como politica cargable y no como script, se puede intercambiar por otras politicas en la misma ranura para comparar estabilidad y velocidad de desplazamiento en el mismo robot.
- Docencia y practicas de robotica: el modelo permite ilustrar el ciclo completo de entrenamiento con RL, exportacion a ONNX y despliegue en un robot real sin requerir infraestructura de computo elevada.
- Recoleccion de datos durante sesiones de marcha: una politica perpetua resulta util como fuente de trayectorias continuas para registrar observaciones y acciones y alimentar posteriores ciclos de entrenamiento.
- Pruebas de integracion en el daemon: verificar el comportamiento del sistema cuando una politica no declara condicion de parada y debe ser detenida externamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa, velocidad de desplazamiento, estabilidad, tasa de caidas ni comparaciones con otras politicas. El repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros publicadas en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio declara un tamano de 0.0 GB, lo que sugiere un artefacto de pesos muy reducido, pero no hay cifras oficiales de tamano del modelo ni de consumo de memoria.
- GPU recomendadas: no disponible. No se especifica ninguna GPU objetivo.
- Ejecucion en GPU de consumo: no disponible. Por el tipo de tarea (politica de control de robot con espacio de observacion de 61 dimensiones y 14 acciones a 50 Hz) es plausible que el requisito de computo sea bajo y que pueda ejecutarse en CPU, pero esta afirmacion es una inferencia del contexto y no un dato publicado.
- Opciones de despliegue: ONNX Runtime, a traves del runtime del daemon de microduck y el comando `robotctl policy load <slot> qualiadev/microduck-sprint-q1`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de control.
- Latencia y throughput: no disponible. La politica esta disenada para operar a 50 Hz, lo que implica un presupuesto de 20 ms por ciclo de control, pero no se publican mediciones reales de latencia en el hardware objetivo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos comparables ni resultados que permitan establecer una comparacion cuantitativa. En el mismo ecosistema existirian otras politicas entrenadas en `pollen-robotics/microduck_rl` y potencialmente otros artefactos publicados bajo la libreria `microduck`, pero no se ha facilitado ninguno de ellos ni sus especificaciones.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qualiadev/microduck-sprint-q1 | no disponible | no aplica | no disponible | no disponible | HuggingFace, 0 descargas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia en HuggingFace ni en la model card, no hay autorizacion explicita de uso comercial. Es imprescindible contactar con el autor antes de cualquier uso en produccion o en productos distribuidos.
- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento, estabilidad ni robustez. Cualquier evaluacion debe realizarla el propio usuario sobre el robot real.
- Riesgo de fallo fisico: al tratarse de una politica perpetua sin condicion de parada aprendida, un comportamiento inesperado se mantiene hasta que el operador interviene. Se recomienda probarla con el robot suspendido o en un entorno acotado antes de soltarla en el suelo.
- Sin informacion sobre trasvase simulacion-realidad: no se documenta si el entrenamiento fue en simulacion, ni si se aplico aleatorizacion de dominio, por lo que el rendimiento en hardware real es incierto.
- Reproducibilidad limitada: se conocen el repositorio, la rama y el commit de entrenamiento, pero no la configuracion de hiperparametros, las semillas ni el dataset, lo que dificulta replicar el resultado.
- Sin soporte linguistico ni multimodal: el modelo no procesa texto, imagenes ni audio, y no debe evaluarse con los criterios habituales de un LLM.
- Trazabilidad de artefactos: el funcionamiento depende de que `manifest.json` cumpla el esquema 2 del manifiesto. Cambios de version en el daemon podrian romper la carga de la politica.
- Riesgo de sesgos del entorno de entrenamiento: la politica heredara las caracteristicas del terreno, la dinamica y las condiciones fisicas presentes durante el entrenamiento; no hay informacion sobre su generalizacion a otras superficies o cargas.
- Metadatos incompletos: tanto la licencia como los idiomas, el tamano del modelo y los parametros figuran como no disponibles, lo que limita cualquier evaluacion formal previa al despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualiadev/microduck-sprint-q1
- Repositorio del robot y la libreria microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento (rama `sprint/race`, commit `0141bf4a8`): https://github.com/pollen-robotics/microduck_rl
- Documentacion del esquema del manifiesto de politicas: `docs/policy-manifest.md` del repositorio del daemon (URL directa no disponible)
- Paper, blog o demo adicionales: no disponible
