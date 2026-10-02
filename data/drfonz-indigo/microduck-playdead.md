# drfonz-indigo/microduck-playdead

## Resumen

microduck-playdead es una política de aprendizaje por refuerzo (reinforcement learning) para el robot microduck de Pollen Robotics. No es un modelo de lenguaje: se trata de un controlador neuronal que implementa una habilidad motora concreta, en este caso un gesto cómico de "hacerse el muerto" (el autor lo describe como "finger gun... bang!"). La política es episódica: se ejecuta durante 5,0 segundos y termina con el pato tumbado sobre el lomo, las patas hacia arriba y la cabeza girada.

El modelo lo publica el usuario drfonz-indigo y se distribuye en formato ONNX (fichero `policy.onnx`, con el normalizador de observaciones ya integrado) junto a un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck. La interfaz del controlador es un espacio de observación de 61 dimensiones y un espacio de acciones de 14 dimensiones, ejecutado a 50 Hz sobre el robot real mediante el daemon `robotctl`.

Su relevancia es acotada y práctica: sirve como ejemplo de política de comportamiento episódico empaquetada para despliegue directo en un robot de bajo coste, con un pipeline reproducible desde el repositorio de entrenamiento hasta la ejecución en hardware. La información pública disponible no incluye número de parámetros, licencia ni idiomas, y el autor indica que la política aún no se ha probado en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (red neuronal; arquitectura concreta no especificada en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`); incluye `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |
| Espacio de observacion | 61 dimensiones |
| Espacio de acciones | 14 dimensiones |
| Frecuencia de control | 50 Hz |
| Duracion del episodio | 5,0 s (politica episodica) |
| Biblioteca | ONNX (library_name: onnx) |

## Arquitectura y entrenamiento

La política es un controlador de aprendizaje por refuerzo que mapea observaciones de 61 dimensiones a 14 acciones a 50 Hz. El autor no detalla en la model card la topología de la red (número de capas, tamaño de las capas ocultas ni tipo de red), por lo que este dato no está disponible. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el runtime debe alimentar observaciones en crudo sin preprocesado adicional. El fichero `manifest.json` sigue el esquema 2 del manifiesto de políticas de microduck descrito en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento se realizó en el repositorio `drfonz/microduck_rl`, en la rama `play-dead`, commit `09724f402`, con notas de diseño en `docs/PLAY_DEAD.md`. No se especifican en la información disponible el número de pasos de entrenamiento, el algoritmo de RL empleado, la composición del conjunto de datos ni si hubo fases de ajuste adicionales. La evaluación se realizó únicamente en simulación, con 256 evaluaciones (en reposo, con robot aleatorizado y en mitad de una caminata): la política nunca terminó de lado ni boca abajo, siempre acabó sobre el lomo con la cabeza girada unos 80°, y el tronco siguió la línea temporal con una desviación de hasta 2,7°.

Un detalle relevante para el despliegue: el pico no forma parte de la política, ya que la mandíbula no tiene servo entre las 14 acciones. Para abrir el pico (aproximadamente en el segundo 3,5) el runtime debe accionarlo de forma independiente.

## Capacidades

- Ejecucion de una habilidad motora episodica concreta: el gesto "playdead" de 5,0 s que termina con el pato tumbado sobre el lomo.
- Control a 50 Hz sobre un espacio de observacion de 61 dimensiones y 14 acciones.
- Integracion directa con el daemon del robot mediante `robotctl` (`robotctl policy add` y `robotctl robot do`).
- Inferencia autocontenida: normalizador de observaciones embebido en el fichero ONNX.
- Empaquetado como politica de microduck con manifiesto conforme al esquema 2.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No incluye control del pico: esa parte debe gestionarla el runtime.

## Casos de uso

- Demostraciones de robotica ludica: ejecutar el gesto "playdead" como comportamiento programado para presentaciones, ferias o videos, aprovechando que es una política episódica de 5 s lista para lanzar con `robotctl robot do playdead`.
- Encadenamiento de comportamientos: usar la habilidad como paso intermedio de una secuencia, teniendo en cuenta que al terminar el pato queda sobre el lomo y la siguiente política debe poder levantarlo (en simulación, `velstand` lo consiguió en 32 de 32 intentos sin cabecera gráfica).
- Pruebas de infraestructura de políticas: servir como caso de prueba para validar el pipeline de `robotctl`, la carga de manifiestos esquema 2 y la ejecución de políticas ONNX en el robot.
- Investigación en aprendizaje por refuerzo aplicado a robots de bajo coste: reproducir el entrenamiento desde la rama `play-dead` del repositorio `microduck_rl` y comparar con otras políticas del mismo robot.
- Integración con scripts de control externos: combinarla con lógica propia que accione la mandíbula en el segundo 3,5 para completar el gesto cómico, ya que el pico no está incluido en las 14 acciones.
- Evaluación de robustez en simulación: reutilizar el montaje experimental descrito (robot aleatorizado, en reposo y en movimiento) para medir la repetibilidad de políticas episódicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente recoge una evaluación en simulación, no comparable con benchmarks estándar:

| Evaluacion (simulacion) | Resultado |
|---|---|
| Evaluaciones totales | 256 (en reposo, robot aleatorizado y en mitad de una caminata) |
| Terminaciones de lado o boca abajo | 0 |
| Postura final | Sobre el lomo, con la cabeza girada ~80° |
| Desviacion del tronco respecto a la linea temporal | Hasta 2,7° |
| Recuperacion con `velstand` tras el episodio | 32 de 32 intentos sin cabecera grafica |

No se dispone de datos de throughput ni de latencia.

## Requisitos de hardware

- Al tratarse de una politica neuronal pequena en formato ONNX destinada a ejecutarse en el propio robot microduck, la inferencia es de baja exigencia; no se especifican cifras de VRAM en la informacion disponible.
- El repo tiene un tamano de 0,0 GB, lo que indica un artefacto de pesos muy reducido.
- No se han publicado GPU recomendadas ni requisitos de memoria especificos.
- Se asume que puede ejecutarse en la computadora integrada del robot a traves del daemon; no se confirma en la informacion disponible si requiere aceleracion por hardware.
- Opciones de despliegue: ONNX Runtime a traves del daemon `robotctl` (`robotctl policy add playdead drfonz-indigo/microduck-playdead`). No se documentan otros backends.
- Latencia y throughput: no disponibles (aunque la frecuencia de control objetivo es de 50 Hz, es decir, un ciclo de 20 ms).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. La única referencia indirecta es `velstand`, otra política del mismo robot mencionada por el autor para levantarse tras el episodio, pero no se ofrecen sus especificaciones ni una comparación formal.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-playdead | no disponible | no aplicable | Evaluacion en simulacion (256 pruebas) | no disponible | HuggingFace (ONNX) |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La política termina sobre el lomo: al agotarse los 5 s, el siguiente comportamiento debe ser uno capaz de levantar al pato. En simulación `velstand` lo logra, pero lo gira sobre el vientre y se incorpora con rapidez (hasta 12,5 rad/s), por lo que el autor recomienda tener una mano lista la primera vez.
- El pico no forma parte de la política: la mandíbula no tiene servo entre las 14 acciones y su apertura, si se desea, debe gestionarla el runtime.
- No probada en un robot físico: la evaluación es exclusivamente en simulación, lo que introduce incertidumbre sobre su comportamiento real (dinámica, fricción, calibración).
- Licencia no especificada: al no declararse licencia, no puede confirmarse el uso comercial ni los términos de redistribución.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplicable (no es un modelo generativo de lenguaje).
- Limitaciones de contexto o idioma: no aplicables.
- Caveat de producción: al ser una política episódica sin control del pico ni recuperación integrada, requiere orquestación externa del daemon y de comportamientos posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drfonz-indigo/microduck-playdead
- Repositorio de entrenamiento: https://github.com/drfonz/microduck_rl/tree/play-dead
- Notas de diseño: `docs/PLAY_DEAD.md` en el repositorio `microduck_rl`
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Manifiesto de políticas (esquema 2): `docs/policy-manifest.md` en el repositorio del daemon
