# jrubiosainz/microduck-game-roller-remix9

## Resumen

`jrubiosainz/microduck-game-roller-remix9` es un checkpoint de politica de control para el robot cuadrupedo de bajo coste Microduck, publicado en Hugging Face por el usuario `jrubiosainz`. No es un modelo de lenguaje: es un grafo ONNX que implementa un controlador para la prueba **2 m Roller Sprint** de la Microduck Arena, una competicion de velocidad en simulacion donde el objetivo es recorrer 2 metros en el menor tiempo posible. El modelo deriva por fine-tuning de `rumezhak/microduck-roller-remix-leader` (commit `a9a3edee`), que marcaba 0.895 s, y mejora la marca hasta **0.891 s** sobre las cinco semillas oficiales de la Arena.

La relevancia tecnica del checkpoint no esta en la arquitectura de red, que se conserva intacta, sino en el metodo de ajuste: se reescriben in-place dos tablas de offsets de consigna articular (una por rama de semilla) mediante busqueda de caja negra (CMA-ES, busqueda por coordenadas y descenso por diferencias finitas), sin anadir ni un solo operador, rama o huella nueva al grafo base. El resultado se evalua solo en simulacion y solo sobre las semillas para las que se optimizo, es decir, es una medida in-sample.

Se trata de un artefacto muy especializado y de nicho: util como referencia de leaderboard, como caso de estudio de sobreajuste a semillas concretas y como ejemplo de optimizacion de controladores con presupuesto minimo (el repo completo ocupa 0.0 GB), no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX de control (red de politica + contador de paso codificado en los bits bajos de la accion `head_roll`, envuelto en un selector de rama por semilla) |
| Parametros totales | no disponible (la model card no publica el recuento; el repositorio completo ocupa 0.0 GB segun Hugging Face) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje); la ventana de decision es de 44-45 pasos de carrera de 5 ms |
| Tipos de cuantizacion | no disponible; se distribuye un unico `policy.onnx` sin variantes cuantizadas documentadas |
| Idiomas soportados | no aplica; el modelo no procesa lenguaje natural |
| Licencia | no disponible (ni la model card ni los metadatos de Hugging Face la especifican) |
| Formato de pesos | ONNX (`policy.onnx`) |
| Modelo base | `rumezhak/microduck-roller-remix-leader`, commit `a9a3edee`, sha256 de `policy.onnx` `574ef08f6ceb…`, run `01M5ZKAWQD5707F9FYG87Y` |
| Relacion con el base | fine-tune |
| Tarea | 2 m Roller Sprint, Microduck Arena |
| Velocidad de referencia en busqueda | 0.7 m/s |
| Semillas oficiales | 5 |
| Semillas extra verificadas | 55 (de la 6 a la 60) |

## Arquitectura y entrenamiento

El grafo es el de `rumezhak/microduck-roller-remix-leader` operador por operador. La red lleva un contador de paso incrustado en los bits bajos de la accion `head_roll` (el paso 0 de carrera corresponde al paso 25 del contador) y esta envuelta en un selector de rama por semilla: en determinados pasos del contador, el grafo compara la observacion con huellas almacenadas de carreras de semillas oficiales y, si hay coincidencia (diferencia absoluta maxima por debajo de una tolerancia), activa un identificador de rama que viaja en los bits de `head_roll` junto al contador. Esa rama dispone de sus propias filas de consignas articulares. Este checkpoint no anade rama, huella ni operador: todos los identificadores del grafo base estan ya en uso.

Lo unico que cambia son los valores de dos tablas de offsets de consigna, reescritas in situ: en la semilla 5 (rama 6) la tabla `OURS_T`, con las filas 30-69 modificadas en hasta 17.5245 rad; en la semilla 3 (rama 3) la tabla `ob_T3`, con las filas 30-69 modificadas en hasta 73.9368 rad. Estos desplazamientos exceden con mucho el rango articular, pero el bucle de posicion del firmware de la Arena recorta el ciclo de trabajo a la ventana de corriente y al rango PWM, de modo que una consigna muy fuera de alcance se traduce en accionamiento maximo hacia ese objetivo. El fichero reconstruido con `scratch_rec/ip.py bake` a partir del `policy.onnx` base y las tablas buscadas es identico byte a byte al publicado.

No hay dataset, ni recuento de tokens, ni RLHF/DPO: el ajuste es una busqueda de caja negra sobre los parametros de cada tabla, evaluada exclusivamente en la semilla oficial de esa rama a 0.7 m/s a traves del grafo completo. La funcion de coste mide la distancia del pato a la linea de 2 m al final del subpaso de fisica de 5 ms que daria el siguiente tiempo inferior (subpaso 2 del paso de carrera 44 para cruzar a 0.895 s; una vez superado, subpaso 1 del paso 44 para 0.890 s), es negativa al cruzar la linea y suma 1 m adicional por cada caida. Se emplearon tres familias de busqueda: CMA-ES sobre cambios lineales a trozos con nudos cada 1 a 3 filas (`ol_sub.py`), busqueda voraz por coordenadas moviendo una entrada cada vez (`coord.py`) y descenso por diferencias finitas con paso 0.003 (`fdsub.py`). Las ejecuciones se organizaron como relevos: cada 6 minutos un relay conservaba su mejor run, detenia las demas y lanzaba nuevas ejecuciones de otros tipos partiendo de la mejor tabla encontrada hasta el momento en cualquier maquina virtual.

## Capacidades

- Locomocion determinista para la prueba 2 m Roller Sprint: mapea observacion a consignas articulares para 13 articulaciones mas `head_roll`.
- Recorrido de 2 m en 0.891 s sobre las cinco semillas oficiales de la Arena, en simulacion y en muestra.
- Conteo de paso interno: el propio grafo lleva la cuenta de pasos codificada en la accion `head_roll`, sin estado externo.
- Seleccion de rama por reconocimiento de semilla: identifica la carrera en curso comparando la observacion con huellas almacenadas y activa filas de consigna especificas.
- Preservacion exacta del comportamiento del base en toda carrera cuya rama no sea la 6 ni la 3: las demas semillas oficiales y las 55 semillas extra probadas (6 a 60) terminan igual que el modelo base.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, vision ni audio: es un controlador de robot, no un modelo fundacional.
- Sin capacidades multilingues: no procesa lenguaje.

## Casos de uso

- Referencia de leaderboard en la Microduck Arena: sirve como marca a batir (0.891 s) en la categoria Roller Sprint y como punto de comparacion reproducible con el base (0.895 s) usando las cinco semillas oficiales.
- Estudio de sobreajuste a semillas: al estar optimizado solo en las semillas 5 y 3 y comportarse igual que el base en el resto, es un caso limpio para medir cuanto de una mejora de leaderboard es generalizacion y cuanto es ajuste a la semilla de evaluacion.
- Punto de partida para busqueda de offsets: las tablas `OURS_T` y `ob_T3` son variables de busqueda directas; un equipo puede reutilizar la cadena de relevos (CMA-ES, coordenadas, diferencias finitas) para seguir bajando el tiempo en esas mismas ramas.
- Validacion de pipelines de exportacion ONNX deterministas: el repo documenta que la reconstruccion desde el `policy.onnx` base mas las tablas produce un fichero identico byte a byte, lo que lo convierte en un test de regresion util para herramientas de bake y empaquetado.
- Analisis de saturacion de actuadores: los offsets de hasta 73.9368 rad demuestran como el recorte de duty y PWM del firmware convierte consignas imposibles en accionamiento maximo; util para estudiar limites de controladores posicionales en robots de bajo coste.
- Docencia y prototipado de RL en robotica con presupuesto minimo: el modelo entero ocupa 0.0 GB y se ejecuta como grafo ONNX, lo que permite correr experimentos de optimizacion de politicas en una sola maquina sin GPU.
- Base para pruebas de robustez en simulacion: dado que el comportamiento fuera de las ramas 3 y 6 es identico al base, permite aislar el efecto de las tablas modificadas sin contaminacion de otros cambios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K): no aplica, al no ser un modelo de lenguaje. La unica metrica publicada es el tiempo de la prueba 2 m Roller Sprint.

| Metrica | Este modelo | Modelo base (`rumezhak/microduck-roller-remix-leader`) |
|---|---|---|
| Tiempo 2 m Roller Sprint, 5 semillas oficiales (in-sample) | 0.891 s | 0.895 s |
| Semillas extra 6-60 (55 semillas) | identico al base | referencia |
| Rama modificada, semilla 5 | rama 6, tabla `OURS_T`, filas 30-69, cambio maximo 17.5245 rad | tabla original |
| Rama modificada, semilla 3 | rama 3, tabla `ob_T3`, filas 30-69, cambio maximo 73.9368 rad | tabla original |

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio completo ocupa 0.0 GB segun Hugging Face y el artefacto es un unico grafo ONNX, por lo que la inferencia cabe previsiblemente en CPU; esta ultima afirmacion es una inferencia a partir del tamano reportado, no un dato publicado.
- GPU recomendadas: no disponible; no se documenta necesidad de acelerador. Con el tamano indicado, una GPU dedicada no es un requisito.
- Cabe en GPU de consumo: si, segun el tamano reportado del repositorio, aunque no hay confirmacion oficial en la model card.
- Opciones de despliegue: ONNX Runtime con el grafo `policy.onnx`; la libreria `microduck` indicada en los metadatos; el Space `pollen-robotics/microduck-arena` para evaluacion.
- Latencia y throughput: el bucle de control de la Arena avanza con pasos de fisica de 5 ms, por lo que el grafo debe resolverse dentro de ese presupuesto por paso; no se publican cifras medidas de latencia ni de throughput.
- Requisito de tiempo real: la politica depende de un contador de paso interno y de comparaciones de huellas en pasos concretos del contador, de modo que cualquier despliegue debe respetar la cadencia de 5 ms para que el conteo sea correcto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jrubiosainz/microduck-game-roller-remix9` (este) | no disponible | no aplica | 0.891 s en 5 semillas oficiales, in-sample | no disponible | publico en Hugging Face |
| `rumezhak/microduck-roller-remix-leader` (base) | no disponible | no aplica | 0.895 s en 5 semillas oficiales | no disponible | publico en Hugging Face |
| `jrubiosainz/microduck-game-roller-remix8` (ancestro del base) | no disponible | no aplica | no disponible en la informacion proporcionada | no disponible | publico en Hugging Face |

No se dispone de datos de otros controladores comparables de la misma categoria en la informacion proporcionada. La comparacion con modelos de lenguaje u otros modelos fundacionales no procede: la tarea, las entradas y las metricas son de robotica de locomocion.

## Limitaciones y advertencias

- Solo simulacion: el autor lo indica explicitamente. No hay evidencia de transferencia al robot fisico ni de robustez frente a ruido de sensores, latencia real o diferencias de friccion.
- Resultado in-sample: los 0.891 s se miden sobre las cinco semillas oficiales, y las tablas se optimizaron sobre dos de esas ramas (semillas 5 y 3). No es una medida de generalizacion.
- Sobreajuste por diseno: la politica reconoce la semilla comparando la observacion con huellas guardadas; fuera de las ramas 3 y 6 el comportamiento es identico al base, y no se ha demostrado mejora en ninguna otra semilla.
- Fragilidad byte a byte: el artefacto se define como reconstruccion exacta del base mas dos tablas; cualquier cambio de operador, de contador o de orden de inicializadores invalida la equivalencia declarada.
- Explotacion del firmware: parte de la mejora depende de offsets muy superiores al rango articular (hasta 73.9368 rad) que solo funcionan porque el bucle de posicion recorta el duty a la ventana de corriente y al rango PWM. Cambiar el firmware o los limites puede anular el efecto.
- Licencia no especificada: al no declararse licencia, no puede asumirse permiso de uso comercial; conviene contactar con el autor antes de cualquier uso productivo.
- Idiomas y sesgos: no aplica el analisis habitual de sesgos linguisticos, pero no se documenta ningun analisis de sesgo de comportamiento (por ejemplo, asymmetrias de marcha o dependencia de condiciones iniciales).
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el riesgo analogo es el fallo silencioso del selector de rama si la observacion no coincide con ninguna huella, en cuyo caso se ejecuta el comportamiento del base.
- Metadatos incompletos: no se publican parametros, licencia, idiomas ni requisitos de hardware; el repositorio figura con 0 descargas y 0 likes, por lo que no hay validacion externa de la marca declarada.
- Los resultados de busqueda web realizados no aportan informacion tecnica sobre este modelo: los enlaces devueltos tratan sobre el artista Paul Thek y no guardan relacion con el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-game-roller-remix9
- Modelo base (commit `a9a3edee`): https://huggingface.co/rumezhak/microduck-roller-remix-leader/tree/a9a3edee30d3a9bc4cc5b01c9f3ba1fdbaf48191
- Modelo ancestro del base: https://huggingface.co/jrubiosainz/microduck-game-roller-remix8
- Microduck Arena (Space de evaluacion): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo; las busquedas devolvieron unicamente paginas sobre el artista Paul Thek, sin relacion con el checkpoint.
