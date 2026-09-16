# euclidstellar/gaurav-voice

## Resumen

gaurav-voice es un paquete de pesos para síntesis de voz (text-to-speech) que se ejecuta íntegramente en el navegador, sin servidor, mediante exportaciones ONNX en int8 y WebAssembly. No es un modelo entrenado desde cero por su autor, euclidstellar, sino la combinación de dos elementos: por un lado, la redistribución de los pesos ONNX de Pocket TTS (Kyutai, licencia MIT), espejados desde KevinAHM/pocket-tts-onnx; por otro, un fichero de voz propio (`voices.bin`) generado a partir de unos veinte segundos de grabación de Gaurav Singh.

El problema que resuelve es el de disponer de un paquete autocontenido (~133 MB) que sirve una demo de narración con voz sintética directamente en el navegador. En lugar de incluir el codificador de voz (19,8 MB) y los pesos de clonación, incorpora el estado ya codificado: la caché de clave-valor del modelo de habla tras escuchar la grabación, con 12.288 flotantes por cada 80 ms a lo largo de seis capas y dieciséis cabezas de atención. Así, el navegador solo carga un fichero de estado, igual que hace con las voces integradas del proyecto original.

La relevancia es acotada: se trata de un banco de pesos orientado a demo, con una única voz, soporte exclusivo de inglés, sin métricas publicadas y sin descargas registradas. Es útil para desarrolladores que quieran replicar o estudiar el despliegue de TTS int8 en navegador y para quien necesite un ejemplo de redistribución de pesos con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (exportacion ONNX de Pocket TTS de Kyutai; modelo de flow matching sobre el codec Mimi) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (int8); voz en `voices.bin`; `text_conditioner_int8.onnx`; `tokenizer.model`; `bos_before_voice.npy` |

## Arquitectura y entrenamiento

El paquete redistribuye las exportaciones ONNX int8 de Pocket TTS (Kyutai), un sistema de síntesis de voz construido sobre el códec neuronal Mimi del mismo laboratorio y un modelo de lenguaje de flow matching. Los componentes principales son `flow_lm_main_int8.onnx` (72,8 MB), `mimi_decoder_int8.onnx` (21,6 MB), `text_conditioner_int8.onnx` (15,6 MB) y `flow_lm_flow_int8.onnx` (9,5 MB), acompañados de `tokenizer.model` y `bos_before_voice.npy`. El codificador `mimi_encoder` no se espeja de forma deliberada, porque solo sería necesario para codificar una voz nueva, operación que esta demo no realiza.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre etapas de RLHF o DPO, ya que el autor no entrena el modelo base. La única aportación propia es la codificación de la voz: `voices.bin` (11,8 MB) contiene la caché clave-valor resultante de procesar unos veinte segundos de audio de Gaurav Singh, con una representación de 12.288 flotantes cada 80 ms distribuida en seis capas y dieciséis cabezas. Adicionalmente, `bundle.json` declara `predefined_voices: ["gaurav"]` en lugar de las ocho voces del proyecto original.

## Capacidades

- Generación de voz sintetizada a partir de texto en inglés, ejecutada en el navegador sin backend.
- Reproducción con una única voz predefinida ("gaurav"), empaquetada como estado codificado.
- Inferencia local en el cliente mediante ONNX y WebAssembly, con los pesos cacheados por el navegador tras la primera carga.
- Uso sin servidor, lo que evita enviar el texto del usuario a infraestructura externa.
- Distribución autocontenida: un único origen sirve todos los ficheros necesarios para la demo.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un modelo exclusivamente de texto a voz.
- No incluye capacidades de visión, audio de entrada (reconocimiento) ni clonación de voz en el cliente.
- Multilingüismo: no disponible; el único idioma declarado es el inglés.

## Casos de uso

- Narración de cuentos en el navegador: es el escenario original de la demo (`gaurav.bar/things/storyteller`); el modelo convierte el texto de un relato en voz sintetizada sin salir del navegador.
- Lectura por voz de contenido web con privacidad: al ejecutarse en el cliente, el texto que se quiere escuchar no se transmite a ningún servidor, lo que resulta adecuado para artículos privados o documentos internos.
- Accesibilidad para personas con discapacidad visual: permite añadir lectura en voz alta a una interfaz web sin depender de servicios de TTS en la nube ni de sus cuotas.
- Aplicaciones educativas y de lectura guiada: un PWA o aplicación educativa puede leer enunciados y textos en inglés en el dispositivo del alumno.
- Prototipado de aplicaciones offline-first: sirve como base para demos que deben funcionar sin conectividad tras la primera carga, dado que todos los pesos quedan cacheados.
- Demos de voz sintética con atribución: al publicarse la voz de una persona real con aviso explícito de que es sintética, encaja en escenarios donde la transparencia sobre el origen de la voz es un requisito.
- Estudios de despliegue de TTS int8 en WebAssembly: útil para medir tamaño de descarga, tiempo de carga y comportamiento de la caché del navegador en un caso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se especifica VRAM mínima; el modelo es una exportación int8 de aproximadamente 133 MB en total, por lo que el requisito de memoria es reducido.
- Al ejecutarse con ONNX Runtime Web y WebAssembly en el navegador, no exige una GPU dedicada: cualquier equipo con un navegador moderno y suficiente memoria disponible debería poder cargarlo.
- GPU recomendadas por modelo: no disponible.
- Compatibilidad con GPU de consumo (RTX 4090 y similares): no disponible como requisito, dado que el destino principal es el navegador; no se documenta una ruta de despliegue en GPU dedicada.
- Opciones de despliegue: navegador mediante ONNX Runtime Web y WebAssembly. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de texto a voz de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| euclidstellar/gaurav-voice | no disponible | no disponible | no disponible (sin benchmarks publicados) | MIT | Hugging Face, 0 descargas y 0 likes |
| KevinAHM/pocket-tts-onnx | no disponible | no disponible | no disponible | no disponible en la informacion disponible | Hugging Face |
| Pocket TTS (Kyutai) | no disponible | no disponible | no disponible | MIT | GitHub y Hugging Face |

## Limitaciones y advertencias

- Se trata de un banco de pesos para una demo, no de un modelo de producción: no hay métricas de calidad, latencia ni estabilidad publicadas.
- Soporta únicamente inglés y una sola voz, lo que limita cualquier uso multilingüe o de múltiples locutores.
- La voz incluida pertenece a una persona real (Gaurav Singh) y se publica de forma consciente. El propio autor pide que, si se usa, se indique que es sintética; la demo original lo declara en su primera frase. Conviene mantener esa atribución y divulgación.
- La licencia MIT cubre los artefactos publicados, pero la voz es un dato biométrico derivado de una persona identificable: su reutilización plantea consideraciones éticas y legales al margen de la licencia.
- No incluye el codificador `mimi_encoder`, por lo que no permite clonar voces nuevas en el cliente; solo reproduce la voz preempaquetada.
- El parche en `bundle.json` (una sola voz en `predefined_voices`) desvía del comportamiento del proyecto original, que define ocho voces; puede provocar diferencias frente a la implementación upstream.
- Al ser una redistribución de pesos de terceros, la calidad y las limitaciones del modelo base (Pocket TTS de Kyutai) se heredan sin cambios.
- Riesgo de alucinación de audio o pronunciaciones incorrectas: no hay información específica disponible sobre este punto, pero es un comportamiento habitual en modelos de síntesis de voz.
- Sin descargas ni likes registrados y con fecha de publicación reciente, no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/euclidstellar/gaurav-voice
- Demo de narración: https://gaurav.bar/things/storyteller
- Repositorio de Pocket TTS (Kyutai): https://github.com/kyutai-labs/pocket-tts
- Exportaciones ONNX de origen: https://huggingface.co/KevinAHM/pocket-tts-onnx
