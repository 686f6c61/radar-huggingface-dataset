# matthiastl/sava-onnx

## Resumen

SAVA (Streaming Audio Voice Activity) es un modelo de detección de actividad de voz (VAD) y de fin de turno diseñado para audio en directo. Lo desarrolla Inworld y esta conversión a ONNX la publica el usuario matthiastl como trabajo no oficial, no respaldado por Inworld. El modelo responde dos preguntas sobre audio en vivo cada 40 ms: si alguien esta hablando y si su turno ha terminado, lo que lo hace util en pipelines de voz conversacional donde la latencia de detección de fin de turno condiciona la experiencia del usuario.

La arquitectura combina un tronco Mamba-2 con atención de ventana deslizante y dos cabezas (detección de voz y fin de turno). Tiene 25,5 millones de parametros y procesa tramas de 640 muestras a 16 kHz (40 ms), manteniendo un estado recurrente de 798.707 valores float32 entre llamadas. El front end log-mel esta embebido en el grafo, de modo que la entrada es PCM crudo y la inferencia solo requiere `onnxruntime` y `numpy`.

Esta version ONNX es relevante porque elimina la dependencia de PyTorch en produccion y ofrece dos formatos: float32 (103 MB) e int8 (27 MB, cuantizacion dinamica de las 27 capas lineales grandes). El modelo float32 reproduce los logits de referencia de PyTorch con una diferencia maxima de 3e-5 y toma la misma decision en todas las tramas evaluadas, lo que lo convierte en una alternativa practica para despliegue en CPU, movil y navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2 con tronco de atención de ventana deslizante; cabezas de voz y fin de turno |
| Parametros totales | 25,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | estado recurrente de 798.707 valores float32; procesamiento por tramas de 40 ms (640 muestras a 16 kHz) |
| Tipos de cuantizacion | float32 (103 MB) e int8 dinamica en 27 capas lineales grandes (27 MB); front end, atención y recurrencia en float32 |
| Idiomas soportados | no disponible (modelo acustico, independiente de idioma en la practica) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 20, solo operadores estandar) |

## Arquitectura y entrenamiento

El modelo es un transformer hibrido con tronco Mamba-2 y atención de ventana deslizante, orientado a procesamiento streaming con estado persistente. La entrada es una trama float32 de forma `[1, 640]` (40 ms de audio mono a 16 kHz en el rango [-1, 1]) y un estado `[1, 798707]` que se inicializa a ceros al comienzo de cada flujo. La salida incluye tres logits: `speech` (¿es esta trama voz?), `lookahead` (¿era voz la trama de 3 tramas atras?, la mas precisa; vale -30 en las 3 primeras tramas del flujo) y `turn` con forma `[1, 1, 4]` (¿ha terminado el turno?) en horizontes de 0, 5, 10 y 20 tramas, ademas del `new_state` que se reinyecta en la siguiente llamada.

El front end log-mel esta integrado en el grafo ONNX, de modo que no hay preprocesado externo. La version int8 aplica cuantizacion dinamica solo a las 27 capas lineales grandes, manteniendo en float32 el front end, la atención y la recurrencia. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO; la model card solo documenta el proceso de exportacion, cuantizacion y evaluacion, no el entrenamiento del modelo original.

## Capacidades

- Deteccion de actividad de voz (VAD) por trama de 40 ms, con probabilidad calibrada.
- Deteccion de fin de turno (end-of-turn) en cuatro horizontes temporales: 0, 5, 10 y 20 tramas.
- Procesamiento streaming con estado recurrente, apto para audio en directo.
- Funcionamiento en tiempo real: 1,2-2,2 ms por trama en dispositivos nativos, muy por debajo de los 40 ms del frame.
- Robustez en canal telefonico simulado (8 kHz, 300-3400 Hz, G.711 mu-law), con precision de fin de turno del 89,36-89,52 %.
- Inferencia sin dependencias de PyTorch: solo `onnxruntime` y `numpy`.
- Despliegue en movil (iOS) y navegador via WebAssembly, ademas de CPU de escritorio.
- No soporta tool calling, agentes, vision, audio generativo ni capacidades multilingues de texto: es un modelo puramente acustico de clasificacion.

## Casos de uso

- Deteccion de fin de turno en asistentes de voz: el modelo permite decidir cuando el usuario ha terminado de hablar con horizontes de 0 a 20 tramas (hasta 800 ms de antelacion), reduciendo la latencia percibida en sistemas de dialogo conversacional.
- Barge-in en agentes telefonicos: al detectar voz y fin de turno por separado, un agente puede interrumpir su respuesta cuando el usuario empieza a hablar, usando el logit `speech` como senal de actividad.
- Puerta de activacion en pipelines ASR: filtrar tramas sin voz antes de enviarlas al reconocedor reduce coste computacional y ancho de banda en servicios de transcripcion en streaming.
- Despliegue en navegador: con `onnxruntime-web` y WebAssembly, el modelo float32 procesa una trama en 6,0 ms en un M4 Max, suficiente para VAD en aplicaciones web sin backend.
- Aplicaciones moviles nativas: la version int8 (27 MB) procesa una trama en 1,2 ms en un iPhone 17 Pro, 33 veces mas rapido que tiempo real, adecuada para VAD en el dispositivo sin conexion.
- Telefonia y call centers: el rendimiento en canal telefonico simulado (89,36 % de precision de fin de turno con int8) lo hace viable para grabaciones y flujos G.711 mu-law.
- Segmentacion de reuniones y transcripcion: el estado recurrente permite procesar grabaciones completas como flujos continuos, generando marcas de inicio y fin de intervencion por hablante.
- Sistemas embebidos y edge: al no requerir PyTorch y ocupar 27 MB en int8, cabe en dispositivos con recursos limitados, aunque no se han publicado mediciones en Android ni en placas SBC.

## Benchmarks y rendimiento

Fin de turno sobre los 31.527 clips de `pipecat-ai/smart-turn-data-v3.2-test`, puntuacion en la ultima trama del clip, umbral 0,5:

| Modelo | Precision | AUC | Precision, linea telefonica | AUC, linea telefonica |
|---|---:|---:|---:|---:|
| PyTorch original | 93,36 % | 0,9795 | 89,52 % | 0,9575 |
| `sava.onnx` | 93,36 % | 0,9795 | 89,52 % | 0,9575 |
| `sava-int8.onnx` | 93,41 % | 0,9793 | 89,36 % | 0,9561 |

Deteccion de voz sobre las 30 grabaciones etiquetadas de TEN-VAD (6.570 tramas):

| Modelo | AUC | F1 | AUC, linea telefonica | F1, linea telefonica |
|---|---:|---:|---:|---:|
| PyTorch original | 0,9768 | 0,955 | 0,9298 | 0,882 |
| `sava.onnx` | 0,9768 | 0,955 | 0,9298 | 0,882 |
| `sava-int8.onnx` | 0,9771 | 0,956 | 0,9204 | 0,867 |

Diferencias de int8 frente a PyTorch, emparejadas por clip o grabacion (intervalos de confianza del 95 %): precision de fin de turno +0,05 puntos (-0,03 a +0,13) en audio limpio y -0,16 puntos (-0,27 a -0,04) en linea telefonica; AUC de voz +0,0004 (-0,0006 a +0,0014) en limpio y -0,0094 (-0,0175 a -0,0024) en linea telefonica. El modelo float32 coincide con PyTorch en todas las tramas del conjunto de voz y en los 31.527 clips de fin de turno, con diferencia maxima de probabilidad de 6e-6.

Velocidad por trama de 40 ms en un hilo de CPU, media sobre la grabacion de prueba de 23 s tras dos pasadas de calentamiento:

| Dispositivo | Runtime | `sava.onnx` | `sava-int8.onnx` |
|---|---|---:|---:|
| iPhone 17 Pro, iOS 27.2 | ONNX Runtime 1.30, app nativa | 2,2 ms | 1,2 ms |
| Apple M4 Max | ONNX Runtime 1.32, nativo | 1,5 ms | 1,2 ms |
| Apple M4 Max | onnxruntime-web 1.31, WebAssembly, Chromium | 6,0 ms | 9,0 ms |
| iPhone 17 Pro, iOS 27.2 | onnxruntime-web 1.31, WebAssembly, Arc (WebKit) | 89 ms | 146 ms |

Como referencia, el paso streaming del modelo PyTorch tarda 2,3 ms en un hilo del M4 Max.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `matthiastl/sava-onnx` | 25,5 M | VAD semantico + fin de turno, Mamba-2 + atención deslizante | Estado recurrente, tramas de 40 ms | Apache-2.0 | ONNX float32 e int8 |
| `inworld/sava` (original) | 25,5 M | Igual, en PyTorch | Igual | Apache-2.0 | PyTorch |
| TEN-VAD | no disponible | VAD acustico clasico | no disponible | no disponible | no disponible |
| Silero VAD | no disponible | VAD acustico | no disponible | no disponible | no disponible |

La comparativa con TEN-VAD y Silero VAD se limita a su uso como conjuntos o referencias de evaluacion en la model card; no se dispone de sus especificaciones ni de resultados comparativos directos en la informacion proporcionada.

## Limitaciones y advertencias

- Conversion no oficial: no esta hecha ni respaldada por Inworld; para produccion conviene validar contra el modelo original.
- Modelo puramente acustico: no procesa texto ni mantiene conversacion; solo clasifica tramas de audio.
- La version int8 degrada ligeramente el rendimiento en linea telefonica: -0,16 puntos de precision de fin de turno y -0,0094 de AUC de voz, con cambios de decision en el 0,5 % de clips limpios y el 1,1 % en linea telefonica.
- En WebAssembly el int8 fue mas lento que float32 en ambos dispositivos probados, y en el navegador del iPhone ninguno de los dos mantuvo tiempo real (89 ms y 146 ms por trama frente a 40 ms). No se probaron WebGPU ni WebAssembly multihilo.
- No hay mediciones en Android ni en placas SBC (single-board computer).
- El estado recurrente debe inicializarse a ceros al inicio de cada flujo y reinyectarse correctamente; un manejo incorrecto del estado invalida las predicciones.
- El logit `lookahead` vale -30 en las tres primeras tramas de un flujo, lo que debe tenerse en cuenta al interpretar la salida.
- No se dispone de informacion sobre sesgos, composicion del dataset de entrenamiento ni idiomas; el rendimiento en idiomas distintos del ingles no esta documentado.
- Licencia Apache-2.0 permite uso comercial, pero el aviso de Inworld sobre los pesos originales debe conservarse (archivo `NOTICE`).
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de falsos positivos y negativos en la deteccion de voz y fin de turno, especialmente en audio telefonico ruidoso.

## Enlaces

- Repositorio ONNX: https://huggingface.co/matthiastl/sava-onnx
- Modelo original: https://huggingface.co/inworld/sava
- Conjunto de evaluacion de fin de turno: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-test (referenciado en la model card)
