# PleasedPenguin/personaplex-gaze-poster

## Resumen

PersonaPlex Gaze-Poster es un ajuste fino (fine-tune) del modelo base nvidia/personaplex-7b-v1, desarrollado por el usuario PleasedPenguin y publicado en Hugging Face. Se trata de un modelo audio-a-audio de conversación full-duplex que simula a un investigador presentando un póster en una conferencia, con dos visitantes cuyas voces llegan mezcladas por un único canal de audio de usuario. La particularidad del modelo es que recibe, además del audio, una señal de "mirada" (gaze) de un bit por trama de 80 ms que indica si algún visitante está mirando al presentador.

El modelo resuelve el problema de la interacción multipartita controlada por atención: el presentador permanece en silencio mientras los visitantes hablan entre ellos, se incorpora a la conversación cuando detecta que le miran (aprovechando lo que ha oído de fondo) y se calla o se corta a media frase cuando los visitantes dejan de mirarle. Esto permite construir aplicaciones de agente conversacional con turnos gobernados por una señal externa (cámara, head-pose tracker o incluso teclado) sin tocar el lado del habla.

Arquitectura y tamaño son idénticos al modelo base: transformer temporal de 7B con depformer, tramas de 12,5 Hz, 1 flujo de texto, 8 codebooks de agente y 8 de usuario. El checkpoint publicado contiene 8.371.408.896 parámetros en safetensors (bf16, 16,7 GB) con la LoRA ya fusionada, por lo que es un reemplazo directo del `model.safetensors` del modelo base. La licencia es la NVIDIA Open Model License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer temporal (Moshi/PersonaPlex) con depformer; full-duplex audio-a-audio |
| Parametros totales | 8.371.408.896 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (funciona por tramas de 80 ms a 12,5 Hz; prompt de sistema de ~25 s) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors (bf16, 16,7 GB, LoRA fusionada) |

## Arquitectura y entrenamiento

La arquitectura es la de PersonaPlex/Moshi sin cambios: un transformer temporal de 7B con depformer que procesa tramas a 12,5 Hz (80 ms por trama), con un flujo de texto y dos conjuntos de 8 codebooks (agente y usuario). El código de referencia está en `NVIDIA/personaplex`, en `moshi/moshi/models/lm.py` (`LMModel`). No se añaden parámetros nuevos: la señal de gaze se inyecta sumando a la embedding de entrada el vector de embedding del token de texto con id 4 (`<0x00>`), que nunca se usa en el vocabulario normal, multiplicado por el bit de gaze. La fila de embedding permanece congelada y las capas LoRA aprenden a leerla. La implementación está en `gaze_inject.py`, que envuelve `LMModel.embed_codes` en unas 20 líneas.

El entrenamiento consistió en una LoRA de rango 64 sobre todas las capas lineales de ambos transformers (249M parámetros entrenables, embeddings congelados), con learning rate 5e-5 durante 2 épocas (234 pasos) sobre 1.862 episodios sintéticos (50,5 horas). La pérdida se calcula solo sobre los flujos del presentador y el prefijo del prompt de sistema está enmascarado. Una sola época dio prácticamente los mismos números de evaluación. La señal de gaze se entrena con un único intervalo largo de gaze activo por episodio (25–100 s, mediana 51 s), nunca con miradas cortas, y el prompt de sistema describe la regla en palabras pero no incluye el bit, que llega trama a trama.

## Capacidades

- Generación de voz full-duplex con latencia de turno baja: el presentador se incorpora en torno a 1 s tras activarse la señal de gaze.
- Escucha selectiva de conversación ajena: aprovecha lo oído mientras los visitantes hablan entre ellos para referenciarlo al incorporarse ("I heard you wondering about masking...").
- Control de turno por señal binaria externa de gaze a 12,5 Hz (un bit por trama de 80 ms).
- Corte de habla a media frase cuando la señal de gaze pasa de 1 a 0.
- Generación de texto alineado con el audio (el modelo produce un flujo de texto además del audio).
- Conversación multipartita con dos visitantes cuyas voces llegan mezcladas en un único canal de usuario.
- Condicionamiento por voz (voice prompt de 5–15 s) y por prompt de sistema textual.
- Interfaz de gaze independiente del estimador: cámara, head-pose tracker o teclado, siempre que se entregue un valor 0/1 por trama.

## Casos de uso

- Demostraciones de póster en conferencias: el modelo actúa como presentador que atiende a los visitantes solo cuando le miran, lo que permite prototipar experiencias de stand interactivo con una cámara o un head-pose tracker como entrada de gaze.
- Agentes de atención en mostrador físico: con una señal de presencia visual, el agente permanece en silencio mientras los clientes hablan entre ellos y se activa cuando uno se dirige a él, evitando interrupciones no deseadas.
- Investigación en interacción multipartita: banco de pruebas controlado para estudiar cómo una señal de atención externa modula los turnos de un modelo full-duplex, con el bit de gaze como variable manipulable.
- Evaluación de sistemas de gaze estimation: el modelo sirve como consumidor aguas abajo de un estimador de mirada, permitiendo medir el impacto de la latencia, el debounce y los falsos positivos del tracker en la calidad de la conversación.
- Prototipos de asistentes con "atención social": aplicaciones de kiosco o recepción donde el agente debe ignorar conversaciones laterales y responder solo cuando se le presta atención visual.
- Investigación en modelos de habla condicionados por señales no verbales: el mecanismo de inyección por embedding de un token reservado es un patrón reutilizable para añadir otras señales binarias (presencia, gesto, mirada) a modelos Moshi sin cambiar la arquitectura.
- Generación de audio sintético para simulaciones de conferencia: producción de diálogos de presentador con tiempos de respuesta realistas para entrenar o evaluar otros sistemas de diálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor indica una GPU de 48 GB (probado en una L40) para ejecutar el modelo en bf16 con el runtime de PersonaPlex; no se documentan otras cuantizaciones.
- GPU recomendadas: L40 (48 GB) validada por el autor; por tamaño de pesos en bf16 (16,7 GB) y el resto del runtime, se requiere una GPU de gama profesional con al menos 48 GB según la indicación del autor.
- ¿Cabe en GPU de consumo? No hay datos publicados que lo confirmen; el autor especifica una GPU de 48 GB.
- Opciones de despliegue: runtime oficial `NVIDIA/personaplex` (requiere `libopus-dev`, probado en el commit 3428dfd) con la librería `moshi`; el checkpoint es un reemplazo directo del `model.safetensors` base para cualquier herramienta que acepte `--moshi-weight`.
- Latencia y throughput: el autor indica que una L40 ejecuta el modelo más rápido que en tiempo real; no se publican cifras concretas de latencia o throughput.
- El modelo base `nvidia/personaplex-7b-v1` está restringido (gated) y requiere aceptar su licencia en el Hub y autenticarse con `huggingface-cli login`; Mimi y el tokenizador de texto se cargan del repositorio base sin cambios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tramas | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PleasedPenguin/personaplex-gaze-poster | 8,37B | 12,5 Hz (80 ms/trama); prompt de sistema ~25 s | audio-a-audio full-duplex con señal de gaze | nvidia-open-model-license | Hugging Face (repo propio) |
| nvidia/personaplex-7b-v1 (base) | ~7B (según nombre) | 12,5 Hz; mismo runtime | audio-a-audio full-duplex | nvidia-open-model-license | Hugging Face (gated) |
| Moshi (Kyutai) | no disponible en la información | no disponible en la información | audio-a-audio full-duplex | no disponible en la información | no disponible en la información |

La comparativa se limita al modelo base, del que este es un fine-tune con LoRA fusionada y sin cambios arquitectónicos, y a Moshi como familia de referencia citada por la librería `moshi`. No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo admite inglés (`language: en`); no se ha entrenado para otros idiomas.
- La señal de gaze es estrictamente binaria: valores intermedios entre 0 y 1 u otras escalas no fueron entrenados y no deben usarse.
- El entrenamiento solo incluyó un intervalo largo de gaze activo por episodio (25–100 s, mediana 51 s), nunca miradas cortas; se recomienda un debounce de 0,3–0,5 s para evitar que parpadeos y ruido del tracker activen o desactiven el modelo.
- El prompt de sistema tarda unos 25 s en procesarse y debe procesarse siempre con gaze = 0; la inyección de gaze debe instalarse antes del warmup de LMGen porque las CUDA graphs se capturan en ese momento.
- Riesgo de alucinación y de referencias incorrectas a lo oído de fondo: el modelo cita contenido conversado por los visitantes, lo que puede producir atribuciones erróneas.
- Sesgos no documentados: la model card no detalla sesgos de género, acento o demografía de las voces sintéticas.
- Restricciones de licencia: NVIDIA Open Model License; es necesario revisar sus términos para uso comercial y para redistribución, y el modelo base está restringido en el Hub (requiere aceptar la licencia y autenticarse).
- Dependencia del runtime oficial `NVIDIA/personaplex` (probado en el commit 3428dfd) y de `libopus-dev`; no se documentan alternativas de despliegue como llama.cpp, Ollama, vLLM o TGI.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- No se publican benchmarks ni cifras de latencia o throughput, lo que dificulta comparar su rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PleasedPenguin/personaplex-gaze-poster
- Modelo base: https://huggingface.co/nvidia/personaplex-7b-v1
- Repositorio de código del runtime: https://github.com/NVIDIA/personaplex
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
