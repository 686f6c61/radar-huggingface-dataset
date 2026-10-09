# Maverick03511/prepqc-qpu-twin

## Resumen

PrePQC two-qubit QPU twin no es un modelo de aprendizaje automatico ni una red neuronal con pesos entrenados: es un repositorio que empaqueta dos programas de circuito cuantico en OpenQASM 2 y un simulador clasico exacto de cuatro amplitudes para dos cúbits. Lo publica el usuario Maverick03511 dentro del proyecto PrePQC Exploitation, cuyo objetivo declarado es la reproducibilidad de experimentos ejecutados en hardware cuantico real. Los dos circuitos se enviaron como trabajos independientes al backend IBM `ibm_fez` el 8 de octubre de 2026, con 256 shots cada uno.

El contenido se divide en tres piezas. `circuits/grover2_mark_11.qasm` implementa una iteracion de Grover con marca de fase sobre el estado `11` y medida final; `circuits/grover2_no_mark_control.qasm` repite la preparacion y la difusion sin la marca de fase, actuando como control negativo. `qpu_twin.py` se ejecuta en un ordenador convencional, calcula las probabilidades ideales exactas de cada circuito y las compara con los recuentos publicos del hardware, informando del SHA-256 del circuito, el conteo de puertas y la distancia de variacion total.

Su relevancia es acotada y conviene ser explicito: se trata de una prueba de humo (smoke test) de dos cúbits que demuestra que el flujo de preparacion, envio de trabajo, ejecucion y analisis de resultados funciona de extremo a extremo. El propio autor advierte de que no hay pesos entrenados, que el simulador no esta calibrado contra `ibm_fez` y que los resultados no demuestran ventaja cuantica, busqueda escalable ni recuperacion de claves. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica como red neuronal. Simulador clasico exacto de vector de estado para 2 cúbits (4 amplitudes) mas 2 circuitos OpenQASM 2 (preparacion, difusion y medida) |
| Parametros totales | No disponible. El repositorio no contiene pesos entrenados ni parametros aprendidos |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | en (codigo, documentacion y model card en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | No aplica. Los ficheros distribuidos son `.qasm` (circuitos), `.py` (simulador) y `.json` (recuentos, manifiesto y ruido sintetico opcional) |
| Numero de cúbits | 2 |
| Vocabulario de puertas aceptado | `h`, `x`, `cz` y medidas terminales sobre dos cúbits (parser deliberadamente restringido) |
| Entorno de ejecucion del simulador | Python 3.11 o superior, solo biblioteca estandar, sin credenciales ni acceso a red |
| Backend cuantico usado | IBM `ibm_fez`, trabajos del 2026-10-08, 256 shots por condicion |
| Interfaz de linea de comandos | `python qpu_twin.py <circuito.qasm> --observed <recuentos.json> --condition <nombre> [--noise <ruido.json>]` |
| Metricas de salida | SHA-256 del circuito, conteo de puertas, probabilidades ideales exactas, fracciones observadas y distancia de variacion total |
| Region declarada | region:us |
| Fecha de creacion / actualizacion | 2026-10-09 / 2026-10-09 |

## Arquitectura y entrenamiento

El componente de software no es un transformer, un MoE ni un modelo hibrido. `qpu_twin.py` es un simulador de vector de estado de proposito general limitado a dos cúbits: mantiene las cuatro amplitudes complejas del sistema y aplica las matrices unitarias correspondientes a las puertas `h`, `x` y `cz` en el orden en que aparecen en el fichero OpenQASM 2. Sobre el estado final calcula las probabilidades ideales de medida en la base computacional. El parser no acepta puertas arbitrarias ni rotaciones parametrizadas, lo que reduce la superficie de ambiguedad pero tambien el alcance del simulador.

No existe entrenamiento, ajuste fino, RLHF ni DPO: no hay fase de aprendizaje en ninguna parte del repositorio. Los dos circuitos son construcciones analiticas. El circuito marcado aplica una marca de fase sobre `11` seguida del operador de difusion, una iteracion de Grover; el circuito de control repite la preparacion y la difusion pero omite la marca de fase y, segun la model card, tambien omite una puerta `CZ`. La model card incrusta un bloque de metadatos YAML con la licencia Apache 2.0 y las etiquetas `quantum-computing`, `quantum-circuits`, `openqasm` y `reproducibility`.

La unica innovacion tecnica reseñable es metodologica: el script acepta un fichero JSON de ruido opcional con una tasa de depolarizacion sintetica para dos cúbits y tasas de error de lectura por bit, lo que permite comparar el resultado ideal, el resultado con ruido simulado y el observado en hardware. El autor insiste en que ese modelo de ruido es sintetico, no derivado de la calibracion de `ibm_fez`, y que por tanto no predice el comportamiento de ese dispositivo concreto.

## Capacidades

- Calculo exacto de las probabilidades ideales de medida de los dos circuitos incluidos mediante simulacion clasica de vector de estado de 4 amplitudes.
- Parseo de un subconjunto explicito de OpenQASM 2 limitado a las puertas `h`, `x`, `cz` y medidas terminales sobre dos cúbits.
- Calculo del SHA-256 de cada circuito y recuento de puertas, para trazabilidad y reproducibilidad.
- Comparacion automatica entre probabilidades ideales, fracciones observadas y distancia de variacion total.
- Inyeccion opcional de ruido sintetico: tasa de depolarizacion de dos cúbits y tasas de error de lectura por bit, configurables mediante fichero JSON.
- Ejecucion en el hardware cuantico de destino: los ficheros `.qasm` pueden enviarse como trabajos independientes a un proveedor cuantico que soporte su vocabulario de puertas (se uso IBM `ibm_fez`).
- Registro de resultados de hardware: el repositorio incluye los identificadores de trabajo publicos y los cuatro recuentos de resultados en `examples/ibm-qpu-2026-10-08.json`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni modo de pensamiento. No es un agente y no ejecuta razonamiento multi-paso.

## Casos de uso

- Prueba de humo de un pipeline cuantico completo: el repositorio permite validar de extremo a extremo la cadena de preparacion del circuito, envio del trabajo, ejecucion en hardware y analisis de recuentos, con un coste de solo dos cúbits y 256 shots por condicion. Es adecuado para comprobar que la integracion con el proveedor funciona antes de escalar a circuitos mayores.
- Docencia de Grover en dos cúbits: el circuito marcado y su control sin marca permiten mostrar en clase la diferencia entre una amplitud marcada y una superposicion uniforme, junto con el efecto del ruido de lectura, usando un script que solo requiere la biblioteca estandar de Python.
- Controles negativos en experimentos cuanticos: `grover2_no_mark_control.qasm` sirve como plantilla de control negativo para verificar que los resultados del circuito marcado no proceden de un artefacto de preparacion o de sesgo del instrumental, una practica metodologica trasladable a experimentos mayores.
- Reproducibilidad y preregistro: el uso de SHA-256 por circuito, un `manifest.json` con los ficheros fuente y la exigencia de citar la revision Git exacta facilitan la verificacion independiente y el preregistro de predicciones clasicas antes de enviar nuevos trabajos.
- Validacion de modelos de ruido: el flag `--noise` permite ajustar tasas de depolarizacion y error de lectura y observar como se desplaza la distancia de variacion total frente a los recuentos reales, util para calibrar expectativas sobre la fidelidad de un backend de dos cúbits.
- Integracion en CI/CD para circuitos cuanticos: al ser un script sin dependencias externas y sin red, `qpu_twin.py` puede incorporarse a una integracion continua que verifique que un `.qasm` se parsea, que el conteo de puertas no cambia y que las probabilidades ideales se mantienen estables entre revisiones.
- Analisis comparativo con la pagina de resultados publica: los identificadores de trabajo y los cuatro recuentos incluidos permiten contrastar lo que ofrece la pagina publica del proveedor (recuentos agregados, sin profundidad final ni mapeo fisico) con lo que el script calcula en local, y documentar esa brecha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en el sentido habitual (MMLU, HumanEval, GSM8K u otros) porque no es un modelo de lenguaje. Lo que si se publica son recuentos de medida de hardware. La distancia de variacion total se calcula en la salida del script, pero su valor numerico no se recoge en la informacion disponible.

| Condicion | Cúbits | Shots | Veces que se midio `11` | Fraccion observada | Probabilidad ideal exacta |
|---|---|---|---|---|---|
| `mark_11` (Grover con marca de fase) | 2 | 256 | 232 | 0,90625 | Calculada por `qpu_twin.py`; valor no disponible en esta informacion |
| `no_mark_control` (sin marca de fase) | 2 | 256 | 62 | 0,2421875 | Calculada por `qpu_twin.py`; valor no disponible en esta informacion |

Los cuatro recuentos completos de cada condicion, los identificadores publicos de trabajo y las graficas asociadas se encuentran en `examples/ibm-qpu-2026-10-08.json` y en el conjunto de datos de benchmarks enlazado mas abajo. No se dispone de comparacion con otros modelos o paquetes bajo la misma metodologia.

## Requisitos de hardware

- Para ejecutar `qpu_twin.py`: cualquier ordenador con Python 3.11 o superior. Solo se usa la biblioteca estandar, por lo que no se requiere GPU, VRAM dedicada ni acelerador. El calculo de un vector de estado de cuatro amplitudes es trivial.
- Memoria: no disponible como cifra especifica; dado el tamano del estado (4 numeros complejos) y de los ficheros, cualquier equipo convencional es suficiente. No se han publicado mediciones de consumo.
- GPU recomendadas: no aplica para el simulador. No hay rutas de ejecucion en GPU en el repositorio.
- Inferencia en GPU de consumo: no aplica; no es un modelo de inferencia neuronal. El unico componente que consume hardware especializado es el envio del `.qasm` a un procesador cuantico, que no se ejecuta en una GPU.
- Opciones de despliegue: ejecucion directa por linea de comandos con Python; envio de los circuitos a un proveedor cuantico compatible (se documento IBM `ibm_fez`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este paquete.
- Latencia y throughput: no disponibles. No se publican tiempos de ejecucion del simulador ni del trabajo en hardware. El unico dato operativo es que cada trabajo de hardware uso 256 shots.

## Comparativa con modelos similares

No disponible. No existen modelos de aprendizaje automatico comparables porque el repositorio no contiene un modelo entrenado. En cuanto a funcionalidad, el paquete se solapa parcialmente con simuladores clasicos de vector de estado de uso general, pero la informacion proporcionada no incluye comparaciones de rendimiento, fidelidad ni tiempos frente a ninguna de esas herramientas, por lo que no se ofrece tabla comparativa.

| Criterio | prepqc-qpu-twin | Alternativas comparables |
|---|---|---|
| Parametros | Sin pesos entrenados | No disponible |
| Contexto | No aplica | No disponible |
| Rendimiento | Recuentos de hardware publicados; TVD no disponible numericamente | No disponible |
| Licencia | Apache 2.0 | No disponible |
| Disponibilidad | Repositorio publico en HuggingFace y GitHub | No disponible |

## Limitaciones y advertencias

- Un unico trabajo de hardware por condicion impide estimar la deriva entre trabajos o la incertidumbre entre ejecuciones. Los recuentos publicados no son una estimacion de fidelidad sostenida del backend.
- El circuito de control omite una puerta `CZ` respecto al circuito marcado, de modo que el conteo de puertas y el ruido de compuerta no estan emparejados entre ambas condiciones. El control no es limpio a efectos de comparacion de error.
- Las paginas de resultados del proveedor no aportaron la profundidad final tras transpilacion, el mapeo a cúbits fisicos, el conteo de puertas de dos cúbits ni los bitstrings por shot. Eso limita cualquier analisis fino del ruido.
- El simulador no esta calibrado contra `ibm_fez`. Sus salidas ideales, y las obtenidas con el modelo de ruido sintetico, no predicen el rendimiento real de ese dispositivo.
- El experimento demuestra un flujo de circuito y medida funcional; no demuestra ventaja cuantica, busqueda escalable, un oraculo ring-LWE o ML-KEM ni recuperacion de claves en produccion. La model card lo declara de forma explicita.
- El parser OpenQASM 2 acepta deliberadamente solo `h`, `x`, `cz` y medidas terminales sobre dos cúbits. No es un parser general y fallara con cualquier circuito que use otras puertas o mas cúbits.
- Riesgo de alucinacion y sesgos: no aplica, al no tratarse de un modelo generativo. No hay generacion de texto ni comportamiento estadistico que pueda derivar en contenido falso.
- Idioma: la documentacion y el codigo estan unicamente en ingles.
- Licencia Apache 2.0: permite uso comercial y modificacion con obligacion de conservar avisos y atribucion, y sin garantias. Para citar resultados de medida, la model card pide citar por separado el conjunto de datos de benchmarks.
- Validacion externa: el repositorio registra 0 descargas y 0 likes, sin evidencia de revision independiente. Las marcas temporales de creacion y actualizacion son del 9 de octubre de 2026, y los trabajos de hardware del 8 de octubre de 2026; conviene verificar las revisiones Git y los hashes del `manifest.json` antes de reutilizar los resultados.
- El experimento propuesto con medidas en base X e Y para estimar expectativas sensibles a la fase no esta incluido en esta version; no hay trabajo de seguimiento ni reconstruccion de estado en la publicacion actual.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Maverick03511/prepqc-qpu-twin
- Conjunto de datos de benchmarks: https://huggingface.co/datasets/Maverick03511/prepqc-exploitation-benchmarks
- Proyecto fuente PrePQC Exploitation: https://github.com/Maverick0351a/prepqc-exploitation
- Registro del primer trabajo en hardware IBM: https://github.com/Maverick0351a/prepqc-exploitation/blob/main/docs/IBM_QPU_PAIRED_SMOKE.md
- Documentacion de IBM sobre medidas en base de Pauli: https://quantum.cloud.ibm.com/docs/en/guides/specify-observables-pauli
- Documentacion de IBM sobre salida de bitstrings en Sampler v2: https://quantum.cloud.ibm.com/docs/en/api/qiskit-ibm-runtime/sampler-v2
- Recuentos y datos del hardware en el repositorio: `examples/ibm-qpu-2026-10-08.json`
- Manifiesto de ficheros y hashes: `manifest.json`
