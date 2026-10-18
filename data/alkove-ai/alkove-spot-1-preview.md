# alkove-ai/alkove-spot-1-preview

## Resumen

alkove-spot-1-preview es un modelo de detección de palabras clave (keyword spotting) de vocabulario abierto publicado por alkove-ai, el equipo detrás del SDK de voz en dispositivo Alkove. Su particularidad es que no requiere entrenamiento por palabra: el desarrollador escribe el término que quiere detectar (una wake word, un comando, un nombre de producto o una palabra suelta dentro de una frase), lo convierte a fonemas con alkove-lex-1-preview y el modelo lo busca en el flujo de audio en tiempo real. El modelo es un ONNX de 2,9 MB con pesos cuantizados a int8 y 4 bits, pensado para ejecutarse en el navegador o en el móvil mediante onnxruntime-web y WebAssembly, sin enviar audio a ningún servidor.

Además del reconocimiento de fonemas, el modelo expone una salida de actividad de voz (`speech`), de modo que resuelve en una sola pasada la detección de palabras y la detección de habla. El consumo es muy bajo: en un Galaxy Z Fold8 con Chrome y un solo hilo WebAssembly procesa un segundo de audio en unos 22 ms, alrededor del 2 % de un núcleo. La ventana de audio es de 480 muestras a 16 kHz (30 ms) por llamada, con un estado recursivo de 19.672 valores float32 que se realimenta entre tramas.

La versión publicada es una preview (pesos e interfaz pueden cambiar antes de la versión 1), con licencia Apache-2.0 y soporte para siete idiomas: francés, inglés, español, italiano, portugués, catalán y rumano. Es relevante ahora porque cubre un hueco habitual en despliegues on-device: wake words y comandos personalizables sin recolectar datos de entrenamiento ni pasar por un servicio de terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada por el autor. Modelo de audio en streaming con estado recursivo (19.672 floats) y salida CTC sobre 58 fonemas más el blank; usa el operador `DFT` de ONNX |
| Parámetros totales | no disponible (pesos en un único ONNX de 2,9 MB, cuantizados a int8 y 4 bits) |
| Longitud de contexto | No aplica en el sentido de ventana de texto: procesa tramas de 480 muestras (30 ms) con estado persistente entre llamadas |
| Tipos de cuantización | int8 y 4 bits (incluidos en el ONNX publicado) |
| Idiomas soportados | fr, en, es, it, pt, ca, ro |
| Licencia | Apache-2.0 (copyright 2026 Eddy Bordi) |
| Formato de pesos | ONNX, opset 17; manifiesto JSON con sha256, tamaños y firmas de entrada/salida |

Entradas y salidas por llamada (una cada 30 ms):

| Nombre | Tipo | Descripción |
|---|---|---|
| `audio` (entrada) | float32 `[1, 480]` | Audio mono a 16 kHz, rango -1..1 |
| `state` (entrada) | float32 `[19672]` | Ceros al inicio; después, el `next_state` anterior |
| `logp` (salida) | float32 `[1, 1, 59]` | Log-probabilidades del blank y de los 58 fonemas; 3 pasos (90 ms) de retardo |
| `speech` (salida) | float32 `[1, 1]` | Probabilidad de que haya alguien hablando; 1 paso (30 ms) de retardo |
| `next_state` (salida) | float32 `[19672]` | Se realimenta en la llamada siguiente |

## Arquitectura y entrenamiento

El autor no publica detalles de la arquitectura interna (capas, tipo de bloque, función de pérdida ni composición del dataset de entrenamiento). Lo que sí se deduce de la interfaz publicada es que se trata de un modelo causal en streaming: consume 30 ms de audio por paso, mantiene un estado recursivo de 19.672 valores float32 que resume el pasado y emite una distribución CTC sobre un inventario de 58 fonemas (el índice 0 es el blank, definido en `phonemes.json`). La salida `logp` llega con 3 pasos de retardo (90 ms) y la de actividad de voz con 1 paso (30 ms). El modelo usa el operador estándar `DFT` de ONNX, lo que obliga a onnxruntime y onnxruntime-web 1.30 o superior.

La detección no la hace el modelo por sí solo: el SDK de Alkove convierte la palabra objetivo a fonemas con alkove-lex-1-preview (o se escriben a mano) y busca esa secuencia en el flujo de `logp`, fijando un umbral por palabra para una tasa de falsos positivos objetivo. La opción *only after a pause* usa la salida `speech` para aceptar una detección solo si nadie hablaba en los 300 ms anteriores, lo que elimina buena parte de las falsas alarmas en medio de frases. No hay información disponible sobre RLHF, DPO ni sobre el volumen de datos de entrenamiento.

## Capacidades

- Detección de vocabulario abierto: cualquier palabra o frase escrita por el desarrollador, sin reentrenar el modelo.
- Reconocimiento de fonemas en streaming: salida CTC con 58 fonemas, pensada para búsqueda de secuencias.
- Detección de actividad de voz (VAD) integrada en la misma pasada, con resolución de 30 ms.
- Siete idiomas: francés, inglés, español, italiano, portugués, catalán y rumano.
- Ejecución en tiempo real sobre CPU: aproximadamente 22-31 ms por segundo de audio en un solo hilo WebAssembly.
- Despliegue en navegador y en móvil con onnxruntime-web; también en Node u otros entornos onnxruntime.
- Soporte de la opción *only after a pause* (detección solo tras 300 ms de silencio) para reducir falsos positivos intrafrase.
- No incluye tool calling, razonamiento multi-paso, visión, audio general ni generación de texto: es un clasificador de audio.

## Casos de uso

- Wake word personalizada en aplicaciones web y móviles: el desarrollador elige la frase de activación, la fonetiza con alkove-lex-1-preview y el modelo la detecta en local. El tamaño de 2,9 MB y el 2 % de un núcleo hacen viable mantenerlo siempre activo sin degradar la batería.
- Comandos de voz sin entrenamiento previo en domótica o electrónica de consumo: en lugar de entrenar un clasificador por comando, se declaran las palabras ("luces", "apagar", "subir") y se ajusta el umbral por palabra según la tasa de falsos positivos tolerada.
- Control por voz en manos libres (conducción, industria, cocina): la ventana de 30 ms y el retardo de 90 ms permiten respuesta prácticamente inmediata, y la detección solo tras pausa evita activaciones por conversación de fondo.
- Verificación de pronunciación en apps de aprendizaje de idiomas: se fonetiza la palabra objetivo y se comprueba si el alumno la ha emitido; la salida `speech` permite además segmentar el intento y separarlo del silencio.
- Puerta de activación previa a un sistema ASR: activar la transcripción completa solo cuando se detecta la palabra de activación, lo que reduce cómputo y evita enviar audio continuo a un servidor.
- Segmentación de turnos y detección de habla en herramientas de reuniones o notas de voz: la salida `speech` a 30 ms sirve para recortar silencios y marcar intervalos de habla sin un VAD adicional.
- Monitorización de menciones en audio en el propio dispositivo (marcas, nombres de producto o de contacto): el modelo localiza la palabra dentro de una frase, sin transcribir el resto del contenido, lo que simplifica el cumplimiento de privacidad.
- Accesibilidad: activación de funciones por palabras personalizadas para usuarios con movilidad reducida, con todas las palabras configurables por el propio usuario.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Métrica: recall de palabras escritas a una tasa de falsa alarma dada; 40 palabras por idioma, fonetizadas únicamente con alkove-lex (primera pronunciación más las variantes con al menos un 25 % de probabilidad). El umbral se fija sobre la mitad de los hablantes y el recall se mide sobre la otra mitad.

| Recall (%) | fr | en | es | it | ca | pt | Media |
|---|---|---|---|---|---|---|---|
| A 1 falsa alarma/hora | 89,7 | 66,9 | 69,4 | 78,7 | 91,6 | 84,5 | **80,1** |
| A 0,5 falsas alarmas/hora | 85,5 | 62,4 | 61,0 | 73,7 | 87,2 | 72,9 | **73,8** |

| Métrica agregada | Valor |
|---|---|
| Recall a 1 falsa alarma/hora, media (%) | 80,1 |
| Recall a 0,5 falsas alarmas/hora, media (%) | 73,8 |
| Recall a 1 falsa alarma/hora, solo tras pausa, media (%) | 85,6 |
| Recall a 0,5 falsas alarmas/hora, solo tras pausa, media (%) | 81,1 |

Conjuntos de evaluación: MOCKS (CC BY 4.0 / MPL 2.0) para francés, inglés, español e italiano; Common Voice (CC0) para catalán y portugués. El rumano está soportado pero se excluye de la tabla porque su conjunto de test de Common Voice es demasiado corto para fijar umbrales a esas tasas de falsa alarma.

Rendimiento de ejecución declarado:

| Entorno | Throughput |
|---|---|
| Galaxy Z Fold8, Chrome, WebAssembly, 1 hilo | ~22 ms por segundo de audio (~2 % de un núcleo) |
| Apple silicon, Node + onnxruntime-web, WebAssembly, 1 hilo | ~31 ms por segundo de audio (~3 % de un núcleo) |

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU. No se documenta ejecución en GPU.
- Huella en memoria: pesos de 2,9 MB en disco más el estado float32 de 19.672 valores (unos 77 KB) y el runtime de onnxruntime.
- GPU recomendadas: ninguna; no hay ejecución GPU documentada.
- Cabe en cualquier consumer: validado en un smartphone plegable (Galaxy Z Fold8) y en Apple silicon; cualquier CPU x86 o ARM moderna con WebAssembly es suficiente en principio.
- Opciones de despliegue: onnxruntime y onnxruntime-web 1.30 o superior (requiere el operador `DFT`), en un solo hilo WebAssembly; ejecutable en navegador, en móvil y en Node.
- Latencia: 90 ms de retardo algorítmico en `logp` (3 pasos) y 30 ms en `speech` (1 paso), más el tiempo de cómputo por trama (aproximadamente 0,66-0,93 ms por trama de 30 ms según el entorno medido).
- Throughput: aproximadamente 45 veces tiempo real en móvil y 32 veces tiempo real en Node sobre Apple silicon, con un solo hilo.

## Comparativa con modelos similares

Los datos de los proyectos alternativos no proceden de la información proporcionada y no se han verificado aquí; consúltese su documentación oficial.

| Modelo | Enfoque | Vocabulario | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alkove-spot-1-preview | Keyword spotting fonético en streaming + VAD, ONNX 2,9 MB | Abierto: cualquier palabra escrita, fonetizada aparte | 7 (fr, en, es, it, pt, ca, ro) | Apache-2.0 | Sin entrenamiento por palabra; ejecución WASM en un hilo |
| openWakeWord | Detección de wake words con modelos entrenados | Cerrado al conjunto entrenado; añadir palabras requiere entrenar | Principalmente inglés | Apache-2.0 (según su proyecto) | No es de vocabulario abierto |
| Picovoice Porcupine | Wake word comercial on-device | Palabras personalizadas creadas en su consola | Varios idiomas | Propietaria (con nivel gratuito) | Requiere servicio externo para generar la wake word |
| Silero VAD | Detección de actividad de voz | No aplica (no detecta palabras) | Independiente del idioma | MIT (según su proyecto) | Comparable solo con la salida `speech`, no con el spotting |

## Limitaciones y advertencias

- Solo acepta audio a 16 kHz mono; no hay soporte documentado de otras frecuencias ni de remuestreo interno.
- Solo siete idiomas; cualquier otro queda fuera del alcance declarado.
- El recall en inglés es notablemente inferior al del resto: 66,9 % a 1 falsa alarma/hora frente a 89,7 % en francés o 91,6 % en catalán.
- Las palabras cortas generan más falsas alarmas que las largas, como en cualquier keyword spotter.
- No transcribe: encuentra las palabras que se le indican, no escribe lo que se ha dicho. No debe usarse como ASR.
- No debe activar nada crítico para la seguridad ni acciones irreversibles con una sola detección: las falsas alarmas existen a la tasa que se configure.
- El rumano está soportado pero no se ha podido evaluar a las tasas de falsa alarma de referencia por falta de datos de test suficientes.
- Es una preview: los pesos y la interfaz pueden cambiar antes de la versión 1, por lo que no es aconsejable fijar una integración de producción sin prever cambios.
- Requiere onnxruntime/onnxruntime-web 1.30 o superior por el uso del operador `DFT`; versiones anteriores no cargarán el modelo.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- Licencia Apache-2.0: permite uso comercial, pero exige conservar el aviso de copyright y el fichero NOTICE, y no concede derechos de marca sobre "Alkove".
- El repositorio no tiene descargas ni likes registrados en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alkove-ai/alkove-spot-1-preview
- Demo en el navegador: https://huggingface.co/spaces/alkove-ai/alkove-demo
- Fonetizador complementario alkove-lex-1-preview: https://huggingface.co/alkove-ai/alkove-lex-1-preview
- Sitio del SDK Alkove: https://alkove.ai
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas sin relación (comercio y parkings en Francia).
