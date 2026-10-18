# alkove-ai/alkove-cue-1-preview

## Resumen

alkove-cue-1-preview es un detector de actividad de voz (VAD, voice activity detection) publicado por alkove-ai que devuelve, cada 30 ms, la probabilidad de que alguien esté hablando a partir de audio mono a 16 kHz. Forma parte de Alkove, un SDK de voz que se ejecuta en el dispositivo (navegador o movil) y que agrupa aislamiento de voz, wake word, huella de locutor, actividad de voz y pronunciacion sin enviar audio a ningun servidor. El modelo se distribuye como un unico fichero ONNX de 1,2 MB cuantizado a int8 (opset 17) y esta pensado para ejecutarse con onnxruntime u onnxruntime-web 1.30 o superior en un solo hilo de WebAssembly.

El problema que resuelve es acotar cuando empieza y cuando termina un turno de habla en tiempo real y con coste computacional minimo: en un Galaxy Z Fold8 con Chrome y WebAssembly a un hilo consume 11 ms de CPU por cada segundo de audio procesado, aproximadamente el 1 % de un nucleo. Esta disenado para colocarse detras de alkove-focus-1-preview, el modelo de aislamiento de voz de la misma familia, de forma que las voces y el ruido que Focus ha eliminado no disparen la deteccion.

Se trata de una preview: el autor advierte que los pesos y la interfaz pueden cambiar antes de la version 1. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y los resultados declarados en la model card estan marcados como no verificados. La licencia es Apache 2.0 y el copyright corresponde a Eddy Bordi (2026).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; modelo ONNX (opset 17) con estado recurrente explicito de 5848 floats y operador estandar `DFT`; procesa tramas de 480 muestras |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; modelo de streaming con estado de 5848 floats que se realimenta en cada llamada |
| Tipos de cuantizacion | int8 (unico formato publicado) |
| Idiomas soportados | no disponible (la model card no declara idiomas; la evaluacion usa frances de Common Voice y LibriTTS-R en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`alkove-cue-1-preview.onnx`, 1,2 MB) + manifiesto JSON con sha256, tamanos, entradas y salidas |

Otros datos de interfaz relevantes:

| Elemento | Valor |
|---|---|
| Entrada `audio` | float32 `[1, 480]`, 16 kHz mono, rango -1..1 |
| Entrada `state` | float32 `[5848]`, ceros al inicio y despues el `next_state` previo |
| Salida `speech` | float32 `[1, 1]`, probabilidad de habla, con 1 paso (30 ms) de retardo |
| Salida `next_state` | float32 `[5848]`, a realimentar en la siguiente llamada |
| Paso de analisis | 30 ms (480 muestras a 16 kHz) |
| Regla de decision sugerida | inicio cuando `speech` >= 0,5; fin cuando permanece por debajo de 0,1 durante 600 ms |
| Runtime | onnxruntime y onnxruntime-web >= 1.30 (requiere el operador `DFT`) |

## Arquitectura y entrenamiento

La model card no describe la topologia interna (no se indica si es una CNN, una red recurrente o un hibrido). Lo que si se documenta es la interfaz de inferencia: un modelo ONNX con estado, que recibe una trama de 30 ms y un vector de estado de 5848 floats, y devuelve la probabilidad de habla junto con el nuevo estado. El uso del operador `DFT` del estandar ONNX sugiere un front-end frecuencial dentro del grafo, lo que explica que el modelo dependa de onnxruntime 1.30 o superior y que funcione en un solo hilo de WebAssembly sin dependencias nativas.

No hay informacion sobre el numero de tokens o horas de audio de entrenamiento, la composicion exacta del dataset ni si hubo etapas de ajuste fino. La evaluacion publicada usa como fuentes voz de Common Voice French dev (CC0) y LibriTTS-R dev-clean (CC BY 4.0), y ruido y musica de MUSAN (CC BY 4.0), pero eso corresponde al conjunto de test, no necesariamente al de entrenamiento. Tampoco se documenta ninguna innovacion de decodificacion (especulativa, atencion linear, etc.); la aportacion practica es el coste: 1,2 MB en int8 y ejecucion en CPU.

## Capacidades

- Deteccion de actividad de voz en tiempo real: emite una probabilidad de habla cada 30 ms sobre audio de 16 kHz en mono.
- Inferencia con estado: mantiene contexto acustico entre tramas mediante el vector `state` / `next_state` de 5848 floats, sin necesidad de buffers externos.
- Ejecucion en CPU y en navegador: funciona con onnxruntime y onnxruntime-web 1.30+ en WebAssembly de un solo hilo, sin GPU.
- Segmentacion de turnos: con la regla sugerida (0,5 para abrir, 600 ms por debajo de 0,1 para cerrar) produce eventos de inicio y fin de habla utilizables por un agente de voz.
- Integracion con la familia Alkove: pensado para ir detras de alkove-focus-1-preview; alkove-spot-1-preview ofrece la misma salida `speech`, por lo que Cue es redundante si ya se ejecuta Spot.
- Robustez declarada frente a ruido y musica: en las pruebas del autor no produce falsos inicios sobre ruido y registra 0,1 falsos inicios por minuto con musica (Silero VAD v6: 0,4).
- No soporta identificacion de locutor, prediccion semantica del fin de turno ni deteccion de sonidos no vocalicos (fuera de alcance segun el autor).

## Casos de uso

- Apertura y cierre de turno en agentes de voz: el modelo marca el inicio de habla con 30 ms de resolucion y cierra el turno tras 600 ms de silencio, lo que permite construir un bucle de escucha continua sin depender de botones ni de pulsar para hablar.
- Gating previo de un sistema de speech-to-text: al descartar las tramas sin habla se evita enviar audio silencioso al ASR, con el consiguiente ahorro de ancho de banda y de coste de inferencia en arquitecturas cliente-servidor.
- Ahorro de bateria en dispositivos moviles: con 11 ms de CPU por segundo de audio en un Galaxy Z Fold8, el detector puede permanecer activo de forma continua y despertar al resto del pipeline solo cuando hay voz.
- Asistencia por voz en el navegador: el binario ONNX de 1,2 MB se carga con onnxruntime-web en una pestana y procesa microfono local, sin instalar nada ni enviar audio fuera del dispositivo.
- Filtrado de audio en herramientas de reunion o grabacion: combinado con alkove-focus-1-preview, permite recortar automaticamente los tramos con voz y descartar silencios y musica antes de transcribir o archivar.
- Telemetria de calidad de llamada: contar proporciones de habla, silencio y solapamiento por minuto para detectar problemas de red o de microfono en un servicio de voz.
- Wake word con etapa previa de VAD: reducir el consumo del detector de palabra de activacion al ejecutarlo solo cuando Cue confirma actividad vocal.
- Kioscos y dispositivos empotrados: al no requerir GPU y ocupar 1,2 MB, cabe en hardware con recursos muy limitados y se ejecuta sobre onnxruntime en el propio dispositivo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (marcados como no verificados). El conjunto de prueba son 24 streams de un minuto ejecutados detras de alkove-focus; en cada uno una voz entre -45 y -25 dBFS habla sobre ruido o musica y otra voz habla sola en el 40 % de los huecos. Silero VAD v6 (MIT) se midio con umbrales 0,65 / 0,5 sobre los mismos streams.

| Metrica | alkove-cue-1-preview | Silero VAD v6 |
|---|---|---|
| Habla perdida (missed speech) | 2,89 % | 2,96 % |
| Falsos inicios en 24 minutos | 4 | 4 |
| Abierto durante los silencios del locutor | 6,4 % | 5,9 % |
| Retardo en el inicio de habla | 10 ms por detras de Silero | referencia |

Pruebas adicionales del autor, solo detras de alkove-focus:

| Escenario | Resultado declarado |
|---|---|
| Falsos inicios sobre ruido | 0 para Cue y para Silero |
| Falsos inicios por minuto sobre musica | 0,1 (Silero 0,4) |
| Tiempo abierto con voces de television | 50 % (Silero 81 %) |

Rendimiento de ejecucion declarado:

| Metrica | Valor |
|---|---|
| Tamano del modelo | 1,2 MB |
| CPU, Galaxy Z Fold8, Chrome, WebAssembly, 1 hilo | 11 ms por segundo de audio (aprox. 1 % de un nucleo) |
| Retardo algoritmico | 1 paso de 30 ms |

No hay resultados publicados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de lenguaje, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU (el modelo pesa 1,2 MB en int8 y el estado ocupa 5848 floats, unos 23 KB en float32).
- GPU recomendadas: no aplica. No se documenta soporte de aceleracion por GPU.
- Compatibilidad con GPU de consumo: irrelevante; cabe en cualquier dispositivo capaz de ejecutar onnxruntime o un runtime de WebAssembly.
- Despliegue: onnxruntime (escritorio, movil, embebido) y onnxruntime-web 1.30 o superior en el navegador; requiere el operador `DFT` del estandar ONNX, por lo que versiones anteriores del runtime no son compatibles.
- Throughput medido: 11 ms de CPU por segundo de audio en un Galaxy Z Fold8 con Chrome y un solo hilo de WebAssembly, es decir, un factor de tiempo real de aproximadamente 90x en ese dispositivo.
- Latencia: 30 ms de retardo por diseno (la salida de habla va un paso por detras de la trama), mas el coste de calculo por trama; con la regla de decision sugerida, el cierre de turno anade 600 ms de histéresis.
- No se documentan cifras de latencia ni throughput para vLLM, llama.cpp, Ollama o TGI; son runtimes de modelos de lenguaje y no aplican a este modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / ventana | Licencia | Rendimiento declarado | Disponibilidad |
|---|---|---|---|---|---|---|
| alkove-cue-1-preview | VAD por tramas de 30 ms, ONNX int8, 1,2 MB | no disponible | no aplica; estado de 5848 floats | Apache 2.0 | 2,89 % habla perdida; 4 falsos inicios en 24 min | HuggingFace (0 descargas) |
| Silero VAD v6 | VAD, runtime propio (ONNX/JIT) | no disponible | no disponible | MIT | 2,96 % habla perdida; 4 falsos inicios en 24 min (medido por alkove-ai) | Ampliamente adoptado |
| alkove-spot-1-preview | VAD de la misma familia, mismo pipeline | no disponible | no disponible | no disponible en la informacion | ofrece la misma salida `speech` que Cue | HuggingFace |

La comparacion con Silero VAD v6 es la unica con mediciones sobre el mismo conjunto de prueba, y la diferencia es de decimas de punto porcentual en habla perdida (2,89 % frente a 2,96 %), identica en falsos inicios y ligeramente peor en tiempo abierto durante los silencios del locutor (6,4 % frente a 5,9 %). La ventaja declarada de Cue esta en el coste (1,2 MB int8, WebAssembly a un hilo) y en el comportamiento con musica y voces de television. No se dispone de datos de WebRTC VAD ni de otros detectores en esta informacion.

## Limitaciones y advertencias

- Solo acepta audio a 16 kHz; no se documenta remuestreo interno ni soporte de otras frecuencias de muestreo.
- Reacciona a cualquier voz: no distingue locutores. Para filtrar por locutor hay que usar alkove-focus con una huella de voz previa.
- No predice el final de turno por semantica: detecta habla, no intencion, por lo que no sustituye a un modelo de turn-taking.
- No detecta sonidos distintos de la voz (ruidos, golpes, musica), lo que puede ser un problema si se necesita deteccion de eventos acusticos.
- Es una preview: el autor advierte que los pesos y la interfaz pueden cambiar antes de la version 1, lo que implica riesgo de breaking changes en produccion.
- Los resultados de la model card estan marcados como no verificados y proceden del propio autor; el conjunto de prueba son 24 streams de un minuto, una muestra pequena y limitada a frances e ingles.
- El repositorio registra 0 descargas y 0 likes, sin validacion independiente conocida.
- La licencia Apache 2.0 permite uso comercial, pero el copyright de los pesos corresponde a Eddy Bordi (2026) y conviene conservar `LICENSE` y `NOTICE`.
- No se documentan sesgos por idioma, acento o dominio; la cobertura declarada se limita a Common Voice French y LibriTTS-R.
- Depende del operador `DFT` de ONNX: no funcionara en runtimes o versiones anteriores a onnxruntime 1.30.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alkove-ai/alkove-cue-1-preview
- Sitio del proyecto Alkove: https://alkove.ai
- Modelo de aislamiento de voz relacionado: https://huggingface.co/alkove-ai/alkove-focus-1-preview
- Modelo de la misma familia con salida VAD equivalente: https://huggingface.co/alkove-ai/alkove-spot-1-preview
- No se han encontrado en la busqueda web articulos, papers, repositorios ni demos adicionales relacionados con este modelo; los resultados devueltos no guardan relacion con el.
