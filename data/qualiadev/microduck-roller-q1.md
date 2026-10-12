# qualiadev/microduck-roller-q1

## Resumen

qualiadev/microduck-roller-q1 es una politica de control por aprendizaje por refuerzo (reinforcement learning) para el robot microduck, distribuida como un artefacto ONNX dentro del ecosistema de politicas del demonio `robotctl`. No es un modelo de lenguaje ni un modelo fundacional: se trata de una politica reactiva de observacion 61-D y 14 acciones que se ejecuta a 50 Hz y que ha sido entrenada para una configuracion especifica de locomocion sobre rodillos (rollers). La model card la describe como una politica perpetua ("runs until told otherwise"), es decir, un ciclo de marcha que se mantiene de forma indefinida hasta que el operador la descarga del slot correspondiente.

El modelo lo publica el usuario qualiadev y se enmarca en el proyecto microduck de Pollen Robotics, cuyo repositorio de entrenamiento es `pollen-robotics/microduck_rl`. La ficha del autor indica que el entrenamiento se hizo sobre la rama `sprint/race` en el commit `0141bf4a8`, lo que sugiere un contexto de desarrollo orientado a pruebas de velocidad o competicion. El artefacto incluye el normalizador de observaciones embebido en `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo, sin preprocesado adicional.

La relevancia de esta ficha es acotada y muy especifica: se trata de un ejemplo temprano ("first attempt") de politica desplegable en un slot de microduck mediante el comando `robotctl policy load`, y su valor principal es servir como referencia reproducible de la cadena de entrenamiento, empaquetado y despliegue de politicas RL en robotica de bajo coste. El repositorio figura con 0 descargas, 0 likes y un tamano de 0.0 GB, y la fecha de creacion indicada es 2026-10-12, por lo que no hay evidencia publica de uso ni de validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no detalla la topologia de la red; se distribuye exclusivamente como grafo ONNX) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (politica reactiva, no modelo de lenguaje); espacio de observacion de 61 dimensiones |
| Tipos de cuantizacion | No disponible (formato ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica (salida de 14 acciones de control, no texto) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) mas `manifest.json` conforme al esquema 2 del manifiesto de politicas de microduck |
| Espacio de acciones | 14 acciones |
| Frecuencia de control | 50 Hz |
| Entorno de entrenamiento | Locomocion sobre rodillos (rollers) |
| Comando de despliegue | `sudo robotctl policy load <slot> qualiadev/microduck-roller-q1` |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La informacion publicada no especifica la arquitectura de red empleada (numero de capas, tipo de capa, funcion de activacion ni dimensiones ocultas). Lo unico documentado es el interfaz de la politica: recibe una observacion bruta de 61 dimensiones —el normalizador de observaciones esta embebido en el propio `policy.onnx`, de modo que no debe aplicarse normalizacion externa— y emite 14 acciones de control a una frecuencia de 50 Hz. El artefacto se consume a traves de la libreria `microduck` y se integra en un slot de politica gestionado por `robotctl`.

En cuanto al entrenamiento, la model card apunta al repositorio `pollen-robotics/microduck_rl`, rama `sprint/race`, commit `0141bf4a8`. No se detallan el numero de pasos de entrenamiento, el algoritmo de RL utilizado (PPO, SAC u otro), la composicion del dataset de experiencias, ni si hubo fases de ajuste fino, destilacion o curriculum. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o mecanismos hibridos, dado que el objeto no es un modelo generativo de texto. La unica particularidad funcional descrita es el caracter perpetuo de la politica: mantiene la marcha de forma continua hasta que se descarga explicitamente.

## Capacidades

- Generacion de marcha continua sobre rodillos: la politica ejecuta un ciclo de locomocion estable y sostenido en el tiempo ("runs until told otherwise"), sin necesidad de reinicio periodico.
- Control de bajo nivel a 50 Hz: emite 14 acciones de control a frecuencia fija, adecuada para bucles de control de robotica.
- Consumo de observaciones en crudo: el normalizador esta embebido en el grafo ONNX, lo que simplifica la integracion y elimina errores de preprocesado por parte del cliente.
- Despliegue mediante slot de politica: se carga con `robotctl policy load`, integrándose en el ciclo de vida del demonio de control.
- Portabilidad de formato: al distribuirse en ONNX, puede ejecutarse con distintos runtimes compatibles (ONNX Runtime y derivados) sin depender de un framework de entrenamiento concreto.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, capacidades multilingues, vision, audio ni modo de pensamiento, ya que no es un modelo de lenguaje.
- Reproducibilidad parcial del entrenamiento: se documentan el repositorio, la rama y el commit exactos del codigo de entrenamiento.

## Casos de uso

- Calibracion de banco de rodillos: la politica proporciona una marcha estable y reproducible sobre rollers, lo que permite medir consumo de motores, temperatura y reparto de carga con una referencia fija y repetible entre ejecuciones.
- Validacion de la cadena de despliegue: sirve para verificar de extremo a extremo el flujo `robotctl policy load` y el cumplimiento del esquema 2 del manifiesto de politicas antes de desplegar politicas mas criticas.
- Baseline para experimentos de RL: al estar asociada a una rama concreta (`sprint/race`, commit `0141bf4a8`), funciona como punto de comparacion de recompensa y estabilidad frente a politicas posteriores del mismo proyecto.
- Pruebas de integracion continua en robotica: puede cargarse en un banco automatizado para comprobar que los cambios en el demonio o en la libreria `microduck` no rompen la carga ni la ejecucion de politicas existentes.
- Demostraciones de locomocion continua: en un entorno de laboratorio o feria, el caracter perpetuo de la politica permite dejar al robot marchando de forma indefinida sin supervision activa del bucle de control.
- Analisis de telemetria de marcha: registrar las 14 salidas de accion a 50 Hz junto con las 61 observaciones facilita el estudio de patrones de gait, simetria y posibles oscilaciones.
- Ensayos de robustez ante perturbaciones: aplicando cargas o desniveles en el banco de rodillos puede evaluarse la capacidad de recuperacion de la politica dentro de su distribucion de entrenamiento.
- Desarrollo de curriculos de entrenamiento: como "first attempt", sirve de punto de partida para iterar politicas mas rapidas o mas robustas en la misma rama de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa, tasas de exito, velocidad de avance, consumo energetico ni comparaciones cuantitativas con otras politicas. Tampoco se documentan latencias de inferencia medidas en hardware real.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio figura con un tamano de 0.0 GB y no se publican recuentos de parametros, por lo que no puede estimarse la huella de memoria.
- GPU recomendadas: no disponibles. No se especifica ningun hardware de referencia ni para entrenamiento ni para inferencia.
- Compatibilidad con GPU de consumo: no confirmada. Dado el interfaz documentado (observacion de 61 dimensiones, 14 acciones a 50 Hz), la carga computacional esperable es muy baja y compatible con ejecucion en CPU, pero esta afirmacion es una inferencia a partir del interfaz y no un dato publicado.
- Opciones de despliegue: el artefacto es un grafo ONNX con manifiesto asociado, por lo que el despliegue previsto es a traves de la libreria `microduck` y del comando `robotctl policy load`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Se desconoce el tiempo de inferencia por paso y si el runtime empleado en el robot cumple holgadamente el presupuesto de 20 ms por ciclo que impone la frecuencia de 50 Hz.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada otras politicas publicas comparables para microduck, ni variantes del mismo autor con las que contrastar parametros, contexto, rendimiento o licencia. La unica comparacion posible seria con otras politicas alojadas en slots del mismo demonio, pero no se documentan sus caracteristicas ni su disponibilidad publica.

## Limitaciones y advertencias

- Ausencia total de informacion sobre licencia: no puede asumirse permiso de uso comercial, redistribucion ni modificacion del artefacto.
- Repositorio sin traccion publica: 0 descargas, 0 likes y 0.0 GB de tamano, lo que sugiere que los pesos podrian no estar efectivamente alojados o que el artefacto no ha sido validado por terceros.
- Fecha de creacion declarada como 2026-10-12, posterior a la fecha de consulta habitual, lo que introduce incertidumbre sobre la vigencia y el estado real del repositorio.
- Especializacion extrema: la politica esta entrenada para marcha sobre rodillos y no puede asumirse su transferencia a terreno abierto, escaleras, pendientes u otras superficies.
- Politica perpetua sin condiciones de parada documentadas: "runs until told otherwise" implica que la supervision y el mecanismo de descarga recaen enteramente en el operador.
- Sin datos de seguridad: no se documentan limites de par, saturaciones de accion, comportamiento ante fallo de sensores ni modos degradados, aspectos criticos en robotica fisica.
- Sin evaluacion de robustez publicada: no hay metricas de exito, recuperacion ante perturbaciones ni analisis de sesgos del espacio de observacion.
- Dependencia de version: el resultado esta ligado a la rama `sprint/race` y al commit `0141bf4a8`; cambios posteriores en el demonio, en la libreria `microduck` o en el esquema del manifiesto pueden afectar a la compatibilidad.
- Sin soporte de idioma, razonamiento o tool calling: cualquier expectativa en ese sentido es inaplicable a este tipo de artefacto.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el riesgo equivalente es la ejecucion de acciones no previstas fuera de la distribucion de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualiadev/microduck-roller-q1
- Repositorio de microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `sprint/race`, commit `0141bf4a8`
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del demonio
