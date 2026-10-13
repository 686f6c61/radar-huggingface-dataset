# DenRakEiw/microduck-twelve-parsec-duck_3000

## Resumen

twelve-parsec-duck_3000 es una política de control para el robot bípedo microduck, publicada por el usuario DenRakEiw en Hugging Face. No es un modelo de lenguaje: se trata de una red neuronal de política entrenada por aprendizaje por refuerzo que genera comandos motores a 50 Hz a partir de una observación de 61 dimensiones, con 14 acciones de salida. El autor la describe como un "corredor de sprint de 2 m", obtenido mediante ajuste fino con estrategias evolutivas (evolution strategies) sobre el modelo DenRakEiw/microduck-darth_sidequack_3000, usando como función objetivo el marcador de sprint de la Arena.

El artefacto se distribuye como un fichero `policy.onnx` con el normalizador de observaciones embebido, acompañado de un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck. Está etiquetado con el slot `walk`, lo que significa que ocupa esa ranura de comportamiento en el robot: es una política perpetua, es decir, se ejecuta de forma continua hasta que se le indique lo contrario, en lugar de resolver un episodio acotado. Su relevancia es la de un ejemplo de política de locomoción lista para cargar en hardware real mediante `robotctl`, dentro del ecosistema abierto de microduck (Pollen Robotics / Hugging Face).

La ficha pública carece de la mayor parte de los metadatos habituales: no se declara licencia, no se listan idiomas (categoría que no aplica a una política motora), el repositorio ocupa 0,0 GB y el modelo no registra descargas ni valoraciones en el momento de la consulta. Tampoco se publican cifras de rendimiento más allá de la referencia cualitativa al marcador de sprint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal para control robótico, distribuida como grafo ONNX; la model card no detalla la topología) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política reactiva de un solo instante; vector de observación de 61 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) junto con `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

Datos operativos declarados:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Slot de comportamiento | `walk` |
| Tipo de politica | perpetua (sin condicion de terminacion) |
| Modelo base | DenRakEiw/microduck-darth_sidequack_3000 |
| Relacion con el modelo base | finetune |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-13 |
| Fecha de actualizacion | 2026-10-13 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red: solo indica que la política consume un vector de observación de 61 dimensiones y produce 14 acciones a 50 Hz, que el normalizador de observaciones está embebido en `policy.onnx` (por lo que se deben alimentar observaciones en bruto) y que el manifiesto sigue el esquema 2 del formato de manifiestos del daemon. No se especifican capas, ancho, función de activación ni número de parámetros. La inclusión del normalizador dentro del grafo ONNX simplifica el despliegue, ya que evita replicar la estadística de normalización en el lado del controlador.

En cuanto al entrenamiento, se parte del modelo darth_sidequack_3000 y se aplica un ajuste fino mediante estrategias evolutivas (evolution strategies), una familia de métodos de optimización sin gradiente que resulta habitual en políticas de locomoción por su robustez ante funciones objetivo no diferenciables. La función objetivo citada es el marcador de sprint de la Arena, con el objetivo concreto de cubrir una distancia de 2 m. Los metadatos de entrenamiento apuntan al repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `f7642d21d`. No se detalla el número de iteraciones, el tamaño de población de la estrategia evolutiva, el número de episodios ni si hubo fases previas de RL con gradiente en el modelo base.

## Capacidades

- Locomoción bípeda orientada a velocidad: política especializada en recorrer un sprint de 2 m en la prueba de la Arena.
- Control continuo a 50 Hz con 14 salidas de acción y 61 entradas de observación.
- Ejecución perpetua: mantiene la marcha de forma indefinida hasta recibir una orden de parada o de cambio de política.
- Ocupación del slot `walk` del robot microduck, intercambiable con otras políticas del mismo ecosistema.
- Inferencia autocontenida: el normalizador de observaciones viaja dentro del ONNX, lo que permite alimentar lecturas en bruto de los sensores.
- Despliegue directo en hardware mediante el comando `sudo robotctl policy load walk DenRakEiw/microduck-twelve-parsec-duck_3000`.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión, audio, tool calling ni capacidades multilingües: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Marcha por defecto en un microduck físico: cargar la política en el slot `walk` para que el robot se desplace de forma continua en demostraciones y pruebas de hardware, aprovechando que la política es perpetua y no requiere reinicios por episodio.
- Punto de partida para ajuste fino con estrategias evolutivas: al ser un resultado derivado de darth_sidequack_3000, sirve como inicialización para nuevas rondas de optimización sobre otros marcadores de la Arena (por ejemplo, cambios de superficie o de distancia objetivo).
- Referencia de comparación en tareas de sprint: útil como línea base al evaluar si una política nueva mejora o empeora el tiempo de recorrido de 2 m en el mismo entorno de evaluación.
- Docencia e investigación en aprendizaje por refuerzo aplicado a robótica: el par observación-acción (61/14 a 50 Hz) y el formato de manifiesto ofrecen un caso de estudio acotado para experimentar con métodos sin gradiente.
- Estudio de sim-to-real: al ser una política entrenada en simulador y ejecutable en hardware, permite medir la brecha de transferencia observando si la marcha se mantiene estable en el robot real.
- Integración en flujos de despliegue automatizados: el fichero ONNX y el manifiesto con esquema 2 permiten incluir la política en un pipeline de CI que valide la carga mediante `robotctl` antes de publicarla o desplegarla.
- Banco de pruebas de estabilidad de políticas perpetuas: dado que la política no termina por sí sola, es adecuada para medir deriva, consumo y calentamiento en ejecuciones largas, así como para validar rutinas de parada segura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La única referencia de rendimiento es cualitativa: el modelo se describe como "2 m Sprint runner" y se indica que el ajuste fino se realizó sobre el marcador de sprint de la Arena. No se proporcionan tiempos, distancias medias, tasas de éxito ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no publicarse el número de parámetros ni la topología, no es posible estimar el consumo de memoria de forma rigurosa.
- GPU recomendadas: no disponible. No se documenta ningún requisito de aceleración por GPU para esta política.
- Compatibilidad con GPU de consumo: indeterminada; el tamaño del repositorio es de 0,0 GB, lo que sugiere un artefacto muy pequeño, pero este dato por sí solo no permite confirmar el encaje en una GPU concreta (por ejemplo, RTX 4090).
- Ejecución en CPU: plausible, dado el formato ONNX y la baja dimensionalidad de entrada y salida (61 observaciones, 14 acciones, 50 Hz), aunque no está confirmado explícitamente en la información disponible.
- Opciones de despliegue: `robotctl` del ecosistema microduck mediante `sudo robotctl policy load walk DenRakEiw/microduck-twelve-parsec-duck_3000`; el runtime subyacente es ONNX (`policy.onnx`) con el manifiesto `manifest.json` en esquema 2. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El único dato temporal es la frecuencia de control de 50 Hz, es decir, un periodo de 20 ms por ciclo de decisión.

## Comparativa con modelos similares

| Modelo | Tipo | Slot | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| DenRakEiw/microduck-twelve-parsec-duck_3000 | Politica de locomocion (ONNX) | `walk` | Finetune del siguiente | no disponible | no aplica (61-D obs.) | no disponible | Publico en Hugging Face, 0 descargas |
| DenRakEiw/microduck-darth_sidequack_3000 | Politica de locomocion (ONNX) | `walk`, `stand`, `sitstand`, `ground_pick`, `kick_left`, `kick_right`, `roulade` (segun la busqueda) | Modelo base | no disponible | no aplica | no disponible | Publico en Hugging Face |
| Otras politicas de microduck en la organizacion/ecosistema | Politicas de comportamiento | `walk`, `stand`, `sitstand`, `ground_pick`, `kick_left`, `kick_right`, `roulade` | No disponible | no disponible | no aplica | no disponible | Repositorios publicos en Hugging Face |

No se dispone de datos numericos comparativos (tiempos de sprint, tasas de exito, estabilidad) entre estas politicas en la informacion proporcionada, por lo que la comparativa se limita a la relacion de linaje y a los slots que cada una ocupa.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, el uso comercial y la redistribucion quedan en un limbo legal; conviene contactar con el autor antes de integrar la politica en un producto.
- Especializacion estrecha: la política está ajustada para el marcador de sprint de la Arena, por lo que su comportamiento fuera de ese objetivo (terrenos distintos, perturbaciones externas, otras tareas) no está caracterizado.
- Riesgo de brecha sim-to-real: el entrenamiento se realiza en el entorno de la Arena; no se documentan pruebas de robustez en hardware real ni tasas de caída.
- Política perpetua: al ejecutarse hasta que se le indique lo contrario, requiere mecanismos externos de parada y supervisión; en un robot físico esto implica riesgos de seguridad si no hay un lazo de control que la interrumpa.
- Ausencia de validación comunitaria: el modelo registra 0 descargas y 0 valoraciones, y el repositorio no contiene pesos de gran tamaño (0,0 GB), lo que limita la evidencia independiente sobre su funcionamiento.
- Metadatos incompletos: no se indican parámetros, arquitectura, datos de entrenamiento, número de iteraciones de la estrategia evolutiva ni resultados de evaluación; reproducir el resultado exigiría acceder al repositorio `pollen-robotics/microduck_rl` en la rama y commit indicados.
- Fechas de publicación atípicas: las marcas de creación y actualización indican 2026-10-13, lo que dificulta interpretar la antigüedad y la vigencia del artefacto.
- Sin capacidades de lenguaje ni multimodales: cualquier expectativa de generación de texto, razonamiento o tool calling es inaplicable a este modelo.
- Dependencia del ecosistema microduck: el despliegue descrito asume `robotctl` y el esquema de manifiesto 2 del daemon; otros entornos requerirían adaptar la carga del ONNX y el tratamiento de observaciones en bruto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DenRakEiw/microduck-twelve-parsec-duck_3000
- Modelo base: https://huggingface.co/DenRakEiw/microduck-darth_sidequack_3000
- Repositorio de microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento citado (rama `denrakeiw`, commit `f7642d21d`): `pollen-robotics/microduck_rl`
- Cobertura de prensa sobre el robot microduck: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Tutorial de construcción de microduck: https://github.com/AI-FanGe/Microduck-build-tutorial
- Ficha del robot en Robots Guide: https://robotsguide.com/robots/microduck
- Recursos y repositorios de MicroDuck: https://microduckrobot.org/resources/
