# maxgfr/s6-ear2-nano

## Resumen

s6-ear2-nano es un detector de fin de turno (end-of-turn) para agentes de voz, desarrollado por maxgfr dentro del proyecto SkyCmd. Se trata de un modelo de decisión ternario extremadamente compacto: 1.306.178 parámetros ternarios en el grafo `turn` (390.338 parámetros totales reportados en safetensors) y un fichero GGUF de 631.936 bytes. Dada una ventana de los últimos 4 segundos de audio, el modelo responde si el hablante ha terminado su turno, lo que permite a un agente de voz decidir cuándo tomar la palabra sin depender de temporizadores de silencio.

La relevancia del modelo está en su relación tamaño/rendimiento: es un estudiante destilado de Smart Turn v3.2 (Pipecat) que alcanza una precisión de 0.8993 en las 31.527 clips de test de Smart Turn v3.2, frente a 0.9260 del profesor medido con el mismo harness, pero ocupando 0,63 MB en lugar de 8,7 MB y decidiendo en 2,39 ms por ventana en WASM frente a 31,7 ms nativos del profesor. Está implementado en Rust (100 %) y compilable a WASM, lo que lo hace apto para despliegue en navegador y en el borde.

El modelo se publicó el 17 de noviembre de 2026 con licencia Apache 2.0 y soporte declarado para inglés y francés, aunque los benchmarks por idioma cubren un conjunto más amplio. Es una segunda versión: la primera (s6-ear-nano) compartía un modelo ternario entre detección de fin de turno y palabras clave y falló tres de sus cuatro puertas de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal ternaria dedicada a la tarea `turn`: proyección de parches, 4 bloques encoder s2, attention pooling (estilo Smart Turn) y cabeza de 2 capas; 1.306.178 parámetros ternarios en el grafo |
| Parametros totales | 390.338 (dato reportado en safetensors); 1.306.178 parámetros ternarios en el grafo `turn` |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 4 s por decisión; sin contexto textual |
| Tipos de cuantizacion | ternario (pesos ternarios); exportación GGUF |
| Idiomas soportados | inglés y francés declarados en la model card; evaluación por idioma en el test incluye alemán, coreano, neerlandés, portugués, vietnamita, marathi y bengalí |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (631.936 bytes); el modelo se ejecuta como `sky_infer::turn` en Rust |

## Arquitectura y entrenamiento

El modelo es una red ternaria de una sola tarea, sin preentrenamiento sobre códecs. El grafo `turn` consta de una proyección de parches, cuatro bloques encoder con stride 2, un pooling de atención tomado de Smart Turn y una cabeza de dos capas, con 1.306.178 parámetros ternarios. La entrada es un front end específico: 40 bandas log-mel más 3 canales de prosodia (log f0, voicing y energía) por cada salto de 10 ms. La decisión se emite sobre los últimos 4 segundos de audio.

El entrenamiento consistió en destilación de Smart Turn v3.2 como profesor, durante 240 minutos de trabajo en un único Apple M5, con una sola ejecución y semilla 1. No hay datos publicados sobre el número de tokens ni la composición exacta del dataset de entrenamiento más allá de la procedencia del profesor. El diseño y la puerta de validación se congelaron por escrito antes de escribir el código de la versión 2 (documento `docs/s6-ear2-prereg.md`), y el harness se comprobó contra la cifra publicada por Pipecat antes de leer el resultado del test.

## Capacidades

- Clasificación binaria de fin de turno: dado el audio de los últimos 4 s, indica si el hablante ha terminado o no.
- Detección de fin de turno en tiempo real con latencia de 2,39 ms por decisión en WASM y 1,40 ms en nativo.
- Front end de audio integrado: log-mel de 40 bandas y tres canales de prosodia (log f0, voicing, energía) por salto de 10 ms.
- Ejecución en navegador: compilación a WASM con paridad numérica frente a nativo (diferencia máxima de probabilidad de 1,2e-7 y misma decisión en 20 de 20 clips).
- Integración en agentes de voz para gestión de turnos (turn-taking), sustituyendo temporizadores de silencio.
- Soporte multilingüe evaluado: alemán 0,9493, coreano 0,9449, neerlandés 0,9471, portugués 0,9421, inglés 0,9056 (subconjuntos humanos en inglés 0,9187).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente multi-paso.

## Casos de uso

- Gestión de turnos en agentes de voz conversacionales: el modelo decide en 2,39 ms si el usuario ha terminado de hablar, lo que permite al agente responder sin esperar un temporizador de silencio fijo y reducir la latencia percibida en conversaciones multi-turno.
- Despliegue en navegador de asistentes de voz: al compilar a WASM con un fichero de 0,63 MB, puede ejecutarse en el cliente sin enviar audio a un servidor, lo que reduce coste de infraestructura y mejora la privacidad.
- Sustitución de temporizadores de silencio en centralitas y sistemas IVR: el temporizador simple acierta 0,4979 en el mismo test, mientras que este modelo alcanza 0,8993, lo que reduce cortes prematuros y esperas innecesarias.
- Integración en pipelines de telefonía en tiempo real: con 1,40 ms por decisión en nativo y 0,0186 ms por salto de 10 ms en el front end, cabe en presupuestos de latencia ajustados de centralitas software.
- Detección de fin de turno en dispositivos de borde con recursos limitados: el tamaño de 631.936 bytes y la ejecución en Rust permiten desplegarlo en hardware embebido sin acelerador dedicado.
- Filtrado y segmentación de audio conversacional en pipelines de transcripción: permite cortar flujos de audio en fronteras de turno antes de enviarlos a un sistema de reconocimiento de voz, reduciendo el contexto innecesario.
- Evaluación y prototipado de sistemas de diálogo: al ser un modelo pequeño y de licencia Apache 2.0, sirve como componente de referencia para comparar estrategias de turn-taking en investigación.

## Benchmarks y rendimiento

Resultados sobre las 31.527 clips de `pipecat-ai/smart-turn-data-v3.2-test`, con intervalos bootstrap del 95 % (1.000 remuestreos por clip):

| Metrica | Valor |
|---|---|
| Precisión en τ₀.₅ | 0,8993 [0,8962; 0,9027] |
| Profesor Smart Turn v3.2 CPU (mismo harness) | 0,9260 |
| Smart Turn v3.2 GPU (cifra publicada por Pipecat) | 0,9371 |
| Falsos cortes en τ₈₅ | 0,0847 [0,0800; 0,0888] |
| Recall de fin de turno en τ₈₅ | 0,8627 [0,8577; 0,8680] |
| Precisión en τ₀.₅ | 0,8776 |
| Recall en τ₀.₅ | 0,9271 |
| F1 en τ₀.₅ | 0,9017 |
| AUC | 0,9600 [0,9581; 0,9621] |
| ECE | 0,0160 [0,0138; 0,0191] |
| Temporizador de silencio (siempre "terminado") | 0,4979 |
| Latencia mediana en WASM | 2,39 ms (p95 2,41 ms) |
| Latencia nativa | 1,40 ms |
| Front end en WASM | 0,0186 ms por salto de 10 ms |
| Tamaño del GGUF | 631.936 bytes |
| Paridad WASM/nativo | 1,2e-7 de diferencia máxima; 20 de 20 clips con la misma decisión |

Comparativa en los mismos clips de test:

| Modelo | Precisión | Tamaño | Por decisión |
|---|---:|---:|---:|
| s6-ear2-nano | 0,8993 | 631.936 bytes | 2,39 ms WASM / 1,40 ms nativo |
| Smart Turn v3.2 CPU (int8) | 0,9260 | 8,7 MB | 31,7 ms nativo |
| Smart Turn v3.2 GPU | 0,9371 | no disponible | no disponible |
| Control de v1 sin preentrenamiento Mimi | 0,7647 | no disponible | no disponible |
| s6-ear-nano (v1) | 0,5681 | 899 KB | no disponible |
| Temporizador de silencio | 0,4979 | sin parámetros | no aplica |

Resultados por idioma (precisión en τ₀.₅): alemán 0,9493; neerlandés 0,9471; coreano 0,9449; portugués 0,9421; inglés 0,9056 (subconjuntos humanos en inglés 0,9187); vietnamita 0,7749; marathi 0,7907; bengalí 0,7950.

En el conjunto de conversación real de LiveKit (`livekit/eot-bench-data`, 17.934 cortes, no usado en el diseño), el modelo obtiene AUC 0,7299 frente a 0,7838 del profesor, y en τ₈₅ responde "terminado" en el 0,5253 de los finales de turno reales.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo pesa 631.936 bytes en GGUF y puede ejecutarse en CPU.
- GPU recomendadas: no se requieren GPU; el modelo está diseñado para CPU y WASM. No hay datos publicados de ejecución en GPU.
- Cabe en cualquier GPU de consumo, e incluso en hardware embebido sin acelerador, dado su tamaño inferior a 1 MB.
- Opciones de despliegue: motor propio en Rust (`sky_infer::turn` dentro de `github.com/maxgfr/skycmd`), compilación a WASM para navegador, y formato GGUF. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están pensados para clasificación de audio.
- Latencia: 2,39 ms por decisión en WASM (p95 2,41 ms) y 1,40 ms en nativo; front end de 0,0186 ms por salto de 10 ms en WASM.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (test v3.2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s6-ear2-nano | 1.306.178 ternarios (390.338 reportados) | ventana de audio de 4 s | 0,8993 | Apache 2.0 | Hugging Face, GGUF y Rust/WASM |
| Smart Turn v3.2 (Pipecat) | no disponible | ventana de audio | 0,9260 CPU / 0,9371 GPU | no disponible en la información | Hugging Face (`pipecat-ai/smart-turn-v3`) |
| s6-ear-nano (v1) | no disponible | ventana de audio | 0,5681 | Apache 2.0 | Hugging Face |
| Temporizador de silencio | sin parámetros | no aplica | 0,4979 | no aplica | implementación trivial |

## Limitaciones y advertencias

- En conversación real (LiveKit eot-bench), el rendimiento cae notablemente: AUC 0,7299 frente a 0,7838 del profesor, y en τ₈₅ solo detecta como "terminado" el 0,5253 de los finales de turno reales, es decir, aproximadamente la mitad pasan.
- El modelo es un estudiante de Smart Turn v3.2 y no puede superar la calidad de las etiquetas de su profesor.
- La mayor parte del conjunto de test es habla sintética, y el conjunto de test oficial es parcialmente in-sample para las decisiones de diseño (aunque no para los pesos).
- Idiomas débiles: vietnamita (0,7749), marathi (0,7907) y bengalí (0,7950); la model card solo declara inglés y francés como idiomas soportados.
- Riesgo de corte prematuro del hablante: en τ₈₅ el modelo da por terminado el turno en el 0,0847 de los clips no finalizados.
- No hay demo en navegador disponible en el momento de la publicación; la API del motor existe, pero la demo espera una comprobación de micrófono por parte del autor.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es de clasificación binaria y no debe presentarse como un sistema de diálogo completo.
- Solo se entrenó una vez con semilla 1, por lo que no hay estimación de varianza entre ejecuciones.
- No dispone de capacidades de generación, razonamiento, tool calling ni agentes; cualquier uso en esos ámbitos requeriría combinarlo con otro modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s6-ear2-nano
- Versión anterior (v1): https://huggingface.co/maxgfr/s6-ear-nano
- Profesor Smart Turn v3.2: https://huggingface.co/pipecat-ai/smart-turn-v3
- Código fuente (Rust): https://github.com/maxgfr/skycmd
- Pre-registro del diseño y la puerta: https://github.com/maxgfr/skycmd/blob/main/docs/s6-ear2-prereg.md
- Resultados de la puerta: https://github.com/maxgfr/skycmd/blob/main/runs/s6-ear2-nano/GATE.md
- Benchmarks completos: https://github.com/maxgfr/skycmd/blob/main/BENCH.md#s6-ear2-nano-s6-ear-v2-an-end-of-turn-student-of-smart-turn-pre-registered-gate-passed
- Página de resultados (incluye fallos): https://maxgfr.github.io/skycmd/results/
- Conjunto de datos de conversación real de LiveKit: https://huggingface.co/datasets/livekit/eot-bench-data
