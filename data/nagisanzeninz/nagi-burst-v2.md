# nagisanzeninz/Nagi-Burst-V2

## Resumen

Nagi Burst V2 es un núcleo de decisión de pequeno tamano (3,10 millones de parametros) desarrollado por el usuario nagisanzeninz y publicado bajo licencia Apache 2.0. No es un modelo de lenguaje: se trata de un componente escrito exclusivamente en numpy que se ejecuta en CPU y que se combina con una busqueda lookahead exacta sobre las reglas de un sistema descrito en un lenguaje formal propio (mz-1 / mz-1x). El usuario describe una "maquina" con variables enteras, hasta 3 controles con 3 opciones cada uno, reglas ordenadas, condiciones de choque y un objetivo; el SDK parsea esas reglas y devuelve una decision tipada (una opcion por control y sus probabilidades) en menos de 200 ms por decision en un solo hilo de CPU.

El problema que resuelve es el control y la planificacion en entornos discretos y pequenos con reglas explicitamente conocidas. El nucleo aprendido se usa unicamente dentro del conjunto de empates exactos de la busqueda, y solo cuando su confianza supera el umbral tau = 0,6 (politica G100000b1b). La busqueda realiza 100.000 simulaciones por decision con horizonte de hasta 40 pasos y seguimiento de creencias para variables retrasadas u ocultas (configuracion v1b).

Su relevancia actual es metodologica mas que de capacidad bruta: el autor publica una evaluacion preregistrada y congelada (PREREG_V2G), con auditoria independiente, y declara explicitamente que no puede demostrar que el aprendizaje generalice a maquinas no vistas, porque el exito observado proviene principalmente del lookahead exacto sobre las reglas dadas. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, con un tamano de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nucleo de decision en numpy (no transformer, no MoE, no SSM) combinado con busqueda lookahead exacta sobre reglas parseadas |
| Parametros totales | 3,10 M (3.100.000) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos |
| Longitud de contexto | No aplica: el estado se pasa estructurado. Horizonte de busqueda de hasta 40 pasos y ventanas de observacion/decision en mz-1x |
| Tipos de cuantizacion | No disponible: los pesos se distribuyen en numpy y no se documentan cuantizaciones |
| Idiomas soportados | No disponible. La entrada es el lenguaje formal de maquinas mz-1 / mz-1x, no lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.npz` (numpy), sha256 `a24e1158b00a59ad1fc103001c301981aa94da033e59fcee7b645ae2deef5624` |
| Biblioteca / SDK | `nagi-decisions` 0.7.0, modulo `nagi.burst2` |
| Politica de uso del nucleo | G100000b1b: el nucleo solo interviene en el conjunto de empates exactos y con confianza >= tau = 0,6 |
| Configuracion de busqueda | 100.000 simulaciones por decision, horizonte hasta 40, belief tracking v1b (sha `996c2951...`) |
| Hardware de referencia | Apple M2 (cpu-m2-1t), arm64 nativo, 1 hilo |
| Tamano del repositorio | 0,0 GB |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

La arquitectura consta de dos piezas acopladas. La primera es un nucleo de decision de 3,10 M de parametros implementado solo con numpy, sin dependencias de GPU ni de frameworks de deep learning. La segunda es un motor de busqueda exacta que parsea las reglas del lenguaje de maquinas y explora el arbol de estados alcanzables mediante 100.000 simulaciones por decision, con horizonte de hasta 40 pasos y seguimiento de creencias para variables retrasadas u ocultas. El nucleo aprendido no decide por si solo: actua como prior dentro del conjunto de empates exactos de la busqueda, y solo cuando su confianza alcanza o supera tau = 0,6.

El autor no documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO; se trata de un modelo de decision, no de un modelo de lenguaje, por lo que esas metricas no aplican directamente. Lo que si se documenta es el protocolo de evaluacion: una unica evaluacion congelada y preregistrada (PREREG_V2G, sha `9691f1e6...`), con puertas fijadas antes de observar los datos, ejecutada a traves del camino de texto del SDK sobre un Apple M2 de un solo hilo. La unica innovacion tecnica destacable declarada es precisamente ese control de calidad: preregistro, una sola mirada a los conjuntos sellados y recuento independiente con resultado de auditoria MATCH.

## Capacidades

- Decision y control en maquinas discretas descritas en mz-1: variables enteras con rango, valor inicial y politica de fuera de rango (por ejemplo, clamp).
- Planificacion con lookahead exacto sobre las reglas proporcionadas, con horizonte de hasta 40 pasos y 100.000 simulaciones por decision.
- Manejo de hasta 3 controles con 3 opciones cada uno por maquina.
- Seguimiento de creencias (belief tracking) para variables retrasadas y ocultas, configuracion v1b.
- Salida tipada por decision: opcion elegida por control, probabilidades marginales por control y probabilidades conjuntas sobre el conjunto de empates exactos.
- Reproducibilidad de decisiones: pasar `session` e incrementar `step` permite repetir el sorteo del empate; sin sesion ni semilla, se usa entropia fresca y `stats["replayable"]` es `False`.
- Pureza funcional: cada llamada es autocontenida y la decision es funcion pura de los bytes de la peticion y las opciones.
- Tres formas de invocacion: `operate(rules_text, state, options)`, `operate(request_text)` para peticiones servidas en un unico texto y `operate_structured(program, view)` sin texto.
- Reconocimiento y enrutado de peticiones de juegos de arena: Snake Rush, Rotorwash-Ramp y Booster Gauntlet, derivadas a sus politicas de juego.
- No dispone de generacion de texto, codigo, matematicas, vision, audio, tool calling ni capacidades multilingues en el sentido habitual: la informacion disponible no describe ninguna de ellas.

## Casos de uso

- Control de agentes en entornos discretos con reglas conocidas: se describe la maquina en mz-1 y el SDK devuelve una accion por control en menos de 200 ms, lo que permite cerrar bucles de control en CPU sin GPU.
- Planificacion de trayectorias con restricciones: en maquinas con condiciones de choque y un objetivo declarado, la busqueda exacta explora los estados alcanzables (mediana de 922 estados en los conjuntos evaluados) y evita las transiciones que violan las restricciones.
- Evaluacion de algoritmos de decision: la interfaz devuelve probabilidades marginales y conjuntas, lo que permite auditar la incertidumbre del planificador y comparar politicas sobre las mismas reglas.
- Simulacion y ensayo de politicas de juego: peticiones de Snake Rush, Rotorwash-Ramp o Booster Gauntlet se enrutan a politicas especificas, util para probar heuristicas de control en un entorno acotado.
- Sistemas con latencia estricta en el borde: al ejecutarse en un solo hilo de arm64 con p95 por debajo de 50,8 ms en el caso mas exigente medido, encaja en dispositivos sin acelerador.
- Reproduccion de decisiones para depuracion: usando `session` y `step`, un sorteo dentro del conjunto de empates se puede repetir exactamente, lo que facilita la trazabilidad en produccion.
- Investigacion sobre el valor anadido del aprendizaje frente a la busqueda: el modelo sirve como banco de pruebas para medir si un prior aprendido aporta algo cuando se dispone de lookahead exacto (el propio autor reporta que, en su caso, no puede afirmarlo).

## Benchmarks y rendimiento

Resultados de la evaluacion congelada y preregistrada M4, obtenidos a traves del camino de texto del SDK en Apple M2 (cpu-m2-1t), 1 hilo, arm64 nativo, con recuento independiente (auditoria MATCH) y decision de publicacion RELEASE por la ruta `parser`.

| Puerta | Resultado | Evidencia |
|---|---|---|
| R (lector, enruta la ruta) | FAIL | 23/48 familias exactas en transiciones, pi_hat 0,479, limite inferior CP 0,333; ruta final: parser |
| A (Snake frente a Nagi Burst V1) | PASS | W 1,000, limite inferior t 1,000, p 6,0e-08 |
| A (Rotorwash-Ramp frente a V1) | PASS | W 1,000, limite inferior t 1,000, p 6,0e-08 |
| A (Booster frente a V1) | PASS | W 0,979, aterrizajes 23/24, p 1,2e-07 |
| G (ruta parser) | PASS | theta_hat 0,854, limite inferior por familia 0,760, por dominio 0,706, LODO minimo 0,844 (48 familias / 16 dominios) |
| L (p95 <= 200 ms) | PASS | cota superior de p95 mas alta: 50,8 ms (Snake Rush); invalidos: ninguno |
| I (texto = estructurado) | PASS | 0 discrepancias sobre 7.506 |
| Auditoria independiente | MATCH | Recuento AUDIT_M4.md (RUNBOOK_M4 seccion 8) |
| Decision | RELEASE | PREREG_V2G seccion 9 |

Rendimiento en maquinas no vistas (Zoo-Unseen-D, puerta G): 48 familias de maquinas en 16 dominios, ninguna vista en entrenamiento; cada familia aporta 2 maquinas x 16 episodios de hasta 100 ticks.

| Metrica | Valor |
|---|---|
| Exito ponderado por familia, theta_hat | 0,854 |
| Intervalo t al 95% por familia | [0,760; 0,948] |
| Cota inferior al 97,5% (familia / cluster de dominio) | 0,760 / 0,706 (guard 0,40) |
| Peor media leave-one-domain-out | 0,844 (sin bobsled_run) |

Contribucion del lookahead (C8, obligatorio): las maquinas puntuadas tienen 922 estados alcanzables en la mediana (min 72 / p25 380 / mediana 922 / p75 2.238 / max 25.921); el 52,1% tiene 1.000 estados o menos y el 95,8% tiene 20.000 o menos. En el 24,9% de 46.966 decisiones la busqueda agoto el arbol alcanzable y en el 48,3% de las decisiones se vio al menos la mitad de la maquina. En las 14 familias de baja cobertura la media es 0,730.

| Afirmacion (familia Holm, alfa 0,025) | Estimacion | p_claim | Nivel Holm | Cota inferior ajustada (familia / dominio) | Resultado |
|---|---|---|---|---|---|
| G+ (el aprendizaje anade a la busqueda, mismo limite de latencia) | -0,003 | 1,000 | 0,025 | -0,009 / -0,011 | No rechazada (no se reclama) |
| NS (theta > 0,60) | 0,854 | 0,001 | 0,0125 | 0,746 / 0,681 | Rechazada (se reclama) |

## Requisitos de hardware

- Inferencia exclusivamente en CPU: la model card declara numpy como unica dependencia y no menciona uso de GPU.
- Hardware de referencia de todas las cifras: Apple M2, arm64 nativo, 1 hilo.
- No requiere VRAM: no se documentan requisitos de memoria de GPU ni despliegues en acelerador.
- Latencia: p95 con cota superior de 50,8 ms en el caso mas exigente medido (Snake Rush); la puerta de latencia exige p95 <= 200 ms por decision y se cumple.
- Coste computacional por decision: 100.000 simulaciones de busqueda con horizonte de hasta 40 pasos, mas la inferencia del nucleo cuando la confianza supera 0,6.
- Opciones de despliegue: SDK de Python `nagi-decisions` 0.7.0, modulo `nagi.burst2`; `load_core()` descarga `model.npz` desde Hugging Face en una revision fijada y verifica su sha256. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Throughput estimado: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (nucleos de decision con lookahead exacto) mas alla del propio predecesor citado en la model card.

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nagi Burst V2 | 3,10 M | Horizonte de busqueda hasta 40 pasos; sin ventana de contexto de tokens | theta_hat 0,854 en Zoo-Unseen-D; gana en los tres juegos de arena frente a V1 | Apache 2.0 | Hugging Face, SDK `nagi-decisions` 0.7.0 |
| Nagi Burst V1 | No disponible | No disponible | Referencia de comparacion: pierde en Snake Rush (W 1,000), Rotorwash-Ramp (W 1,000) y Booster Gauntlet (W 0,979 frente a V2) | No disponible | No disponible |
| Otros nucleos de decision comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El propio autor declara que no puede demostrar que el aprendizaje generalice a maquinas no vistas: la afirmacion G+ da un estimador de -0,003 con p_claim 1,000 y Holm no rechazada. Gran parte del exito en maquinas no vistas proviene del lookahead exacto sobre las reglas proporcionadas.
- El exito depende de que el problema sea pequeno: en la evaluacion, la mediana de estados alcanzables era de 922 y el 24,9% de las decisiones agoto el arbol completo. En maquinas con espacio de estados grande, la cobertura del lookahead cae y el rendimiento baja (media de 0,730 en las 14 familias de baja cobertura).
- La puerta R (lector) fallo: solo 23 de 48 familias resultaron exactas en transiciones (pi_hat 0,479, limite inferior CP 0,333). El sistema se publico finalmente por la ruta `parser`, lo que implica dependencia de un parser exacto del lenguaje mz-1 / mz-1x.
- El alcance del lenguaje de maquinas es reducido: variables enteras, hasta 3 controles con 3 opciones cada uno. No se documenta soporte para espacios continuos ni para un numero mayor de controles.
- No hay datos de sesgo, alucinacion ni comportamiento en lenguaje natural porque el modelo no procesa lenguaje natural; la informacion disponible no permite evaluar esos riesgos.
- Sin `session` ni semilla, el sorteo dentro del conjunto de empates usa entropia fresca y no es reproducible (`stats["replayable"]` es `False`), lo que complica la auditoria en produccion.
- Todos los numeros publicados provienen de un unico hardware de referencia (Apple M2, 1 hilo, arm64). No se documenta rendimiento en otras arquitecturas, en x86 ni con paralelismo.
- La model card se encuentra truncada en la informacion disponible, de modo que el ultimo bloque de afirmaciones estadisticas no puede verificarse completo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del SDK `nagi-decisions` y de la descarga fijada de pesos.
- Repositorio con 0 descargas, 0 "likes" y 0,0 GB de tamano declarado: no hay evidencia de adopcion externa ni de mantenimiento mas alla de la publicacion inicial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagisanzeninz/Nagi-Burst-V2
- SDK citado en la model card: `nagi-decisions` 0.7.0, modulo `nagi.burst2` (sin URL publica en la informacion disponible)
- Preregistro: PREREG_V2G, sha `9691f1e6...` (sin URL en la informacion disponible)
- Auditoria: AUDIT_M4.md y RUNBOOK_M4 seccion 8 (sin URL en la informacion disponible)
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos corresponden a figuras de coleccionismo y a paginas de personajes de anime sin relacion con el modelo.
