# DenRakEiw/microduck-c-3pduck_0868

## Resumen

`DenRakEiw/microduck-c-3pduck_0868` es una politica de aprendizaje por refuerzo (RL) para el robot cuadrupedo microduck de Pollen Robotics, publicada en HuggingFace por el usuario DenRakEiw. No se trata de un modelo de lenguaje, sino de un controlador de locomocion: una politica perpetua que ocupa el slot `walk` del robot y que ha sido afinada mediante estrategias de evolucion sobre el scorer de colinas de la Arena. Su tarea declarada es "1.5 m Hill Climb", un escenario de modo carrera en el que el robot debe ascender una pendiente.

Tecnicamente, el artefacto distribuido es un fichero `policy.onnx` acompanado de un `manifest.json` que sigue el esquema 2 del manifiesto de politicas de microduck. La politica consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, de forma continua e indefinida ("perpetua"): no tiene condicion de parada propia, sino que se ejecuta hasta que se le indique lo contrario. El normalizador de observaciones viene embebido dentro del ONNX, por lo que la entrada debe ser la observacion en crudo.

La relevancia de esta ficha es acotada pero concreta: se trata de un ejemplo de politica de control de bajo nivel empaquetada para despliegue directo en robot mediante el comando `robotctl`. No hay informacion publica sobre arquitectura interna de la red, numero de parametros, licencia ni resultados numericos de evaluacion, por lo que buena parte de las especificaciones quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica exportada a ONNX; topologia interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de 61 dimensiones de observacion, sin ventana de contexto textual |
| Tipos de cuantizacion | no disponible (se distribuye un unico `policy.onnx`) |
| Idiomas soportados | no aplica / no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de politicas de microduck) |

Datos adicionales de la ficha:

| Parametro | Valor |
|---|---|
| Autor | DenRakEiw |
| Libreria | microduck |
| Pipeline | robotics |
| Slot de politica | walk (`microduck-slot:walk`) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tamano del repositorio | 0.0 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-14 |
| Fecha de actualizacion | 2026-10-14 |

## Arquitectura y entrenamiento

El modelo es una politica de control para el robot microduck. Se describe como una politica **perpetua** con 61 dimensiones de observacion y 14 acciones, ejecutandose a 50 Hz, que ocupa el slot `walk`. La arquitectura concreta de la red (numero de capas, tipo de capa, activaciones, tamano de las capas ocultas) no se detalla en la informacion disponible. El artefacto se exporta a ONNX e incorpora el normalizador de observaciones en el propio grafo, de modo que el consumidor debe alimentar observaciones sin normalizar.

En cuanto al entrenamiento, la model card indica que se trata de una politica en modo carrera, afinada mediante estrategias de evolucion ("evolution strategies") sobre el scorer de colinas de la Arena, partiendo presumiblemente de una politica base de marcha. No se especifica el numero de iteraciones, la poblacion, la funcion de recompensa exacta ni la composicion del conjunto de datos de entrenamiento (en RL, la experiencia generada por la propia simulacion). El entrenamiento se realizo en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `bc6676e52`. No hay informacion sobre si hubo fases adicionales de ajuste, curriculum o aleatorizacion de dominio.

## Capacidades

- Locomocion cuadrupeda en modo carrera: genera una marcha para el slot `walk` del microduck orientada a ascender una colina de 1.5 m.
- Control continuo a 50 Hz con 14 acciones de salida y 61 entradas de observacion.
- Ejecucion perpetua: la politica se mantiene activa indefinidamente hasta que se le indique lo contrario, sin estado de terminacion propio.
- Normalizacion integrada: el `policy.onnx` incluye el normalizador de observaciones, por lo que acepta observaciones en crudo.
- Despliegue directo en robot mediante `robotctl` (carga en el slot `walk`).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, capacidades de agente ni soporte multilingue: no es un modelo de lenguaje.

## Casos de uso

- Investigacion en locomocion con RL: usar la politica como linea base reproducible en el slot `walk` para comparar algoritmos de RL o de estrategias de evolucion sobre el mismo scorer de colinas.
- Demostraciones de ascenso de pendiente: emplear la politica en el escenario "1.5 m Hill Climb" para mostrar la capacidad del microduck de superar una pendiente en modo carrera.
- Pruebas de robustez de control: ejecutar la politica de forma perpetua en el robot para observar deriva, estabilidad y comportamiento ante terreno irregular durante periodos prolongados.
- Fine-tuning posterior: al estar entrenada en una rama concreta (`denrakeiw`) del repositorio `microduck_rl`, sirve como punto de partida para nuevos ajustes por evolucion sobre el mismo scorer u otros.
- Integracion en pipelines de evaluacion automatizada: cargar la politica con `robotctl policy load walk ...` dentro de un banco de pruebas para medir metricas del scorer de la Arena de forma desatendida.
- Docencia y talleres de robotica: dado el tamano reducido del artefacto (repositorio de 0.0 GB) y su formato ONNX, es adecuada para sesiones practicas sobre politicas de control en robots cuadrupedos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe el escenario de evaluacion ("1.5 m Hill Climb", modo carrera, scorer de colinas de la Arena) y el metodo de ajuste (estrategias de evolucion), pero no incluye cifras de exito, tiempo de ascenso, distancia recorrida ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0.0 GB, lo que sugiere un artefacto de muy bajo peso, pero no se confirma el numero de parametros.
- GPU recomendadas: no disponible; una politica de control a 50 Hz de este tipo no requiere GPU.
- Compatibilidad con GPU de consumo: no disponible; por la naturaleza del artefacto (ONNX, control a 50 Hz en robot) es probable que se ejecute en CPU, pero este dato no se afirma en la informacion proporcionada.
- Opciones de despliegue: runtime de microduck mediante `robotctl` (`robotctl policy load walk DenRakEiw/microduck-c-3pduck_0868`); inferencia ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la unica referencia temporal es la frecuencia de control de 50 Hz (periodo de 20 ms por ciclo), que es un requisito de la politica, no una medida de latencia observada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras politicas comparables del mismo autor ni referencias a alternativas dentro del catalogo de microduck. La unica referencia contextual es el repositorio de entrenamiento `pollen-robotics/microduck_rl` y el ecosistema de microduck, pero no se ofrecen datos de modelos equivalentes con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta el dominio de entrenamiento ni la aleatorizacion aplicada, por lo que se desconoce su comportamiento fuera del escenario "1.5 m Hill Climb".
- Riesgo de fallo fuera de distribucion: al ser una politica perpetua especializada en ascenso de colinas en modo carrera, no hay garantia de que la marcha sea estable en terreno llano, escaleras u otras superficies no contempladas durante el entrenamiento.
- Ausencia de condicion de parada: la politica "corre hasta que se le indique lo contrario", de modo que cualquier despliegue debe gestionar externamente la finalizacion de la ejecucion.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial ni redistribucion. Debe consultarse con el autor antes de cualquier uso en produccion.
- Idiomas: no aplica, ya que no es un modelo de lenguaje.
- Contexto: no aplica en el sentido de ventana de tokens; la limitacion real es la dimension fija de observacion (61) y de accion (14), que restringe la politica al hardware y a la interfaz concretos del microduck.
- Reproducibilidad parcial: se indican repositorio, rama y commit de entrenamiento, pero no hiperparametros, semillas ni versiones de dependencias, lo que dificulta reproducir el resultado.
- Metricas ausentes: sin cifras de rendimiento publicadas no es posible evaluar la calidad de la politica antes de desplegarla en el robot.

## Enlaces

- HuggingFace: https://huggingface.co/DenRakEiw/microduck-c-3pduck_0868
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento (referenciado en la model card): `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `bc6676e52` (URL exacta no proporcionada en la informacion disponible)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` dentro del repositorio del daemon (URL exacta no proporcionada en la informacion disponible)
