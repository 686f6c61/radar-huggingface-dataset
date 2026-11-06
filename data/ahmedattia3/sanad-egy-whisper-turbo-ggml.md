# AhmedAttia3/sanad-egy-whisper-turbo-ggml

## Resumen

Sanad Egyptian Whisper Turbo — ggml es una conversión al formato ggml de un ajuste fino sobre `openai/whisper-large-v3-turbo`, orientado al reconocimiento de voz en arabe egipcio con soporte de terminos tecnicos en ingles. Lo publica el usuario AhmedAttia3 como parte de la infraestructura de dictado local de su proyecto Sanad Agent, y su proposito es ofrecer una variante de Whisper ejecutable con `whisper.cpp` en hardware modesto, sin dependencia de ONNX ni de frameworks de inferencia pesados.

El modelo parte de la arquitectura encoder-decoder transformer de Whisper large-v3-turbo (aproximadamente 809 millones de parametros en el modelo original, aunque el autor no declara el recuento exacto en esta ficha) y se distribuye en dos cuantizaciones ggml: `q8_0` (834 MB) y `q5_0` (547 MB). Ambas decodifican audio mono a 16 kHz y son, segun la model card, los mismos pesos que la variante ONNX `sanad-egy-whisper-turbo-int8` del mismo autor.

Su relevancia es acotada pero concreta: cubre un nicho poco atendido (ASR en arabe egipcio) con un formato de despliegue ligero, licencia MIT y metricas de rendimiento publicadas por el autor en un Apple M1 con 6 hilos. No es un modelo generalista de ASR multilingue ni compite en benchmarks publicos; es una pieza de infraestructura para dictado local en un agente concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | no disponible (heredados de `openai/whisper-large-v3-turbo`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | ggml `q8_0` (834 MB) y `q5_0` (547 MB) |
| Idiomas soportados | arabe (egipcio) e ingles |
| Licencia | MIT |
| Formato de pesos | ggml (`.bin`) para `whisper.cpp` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo: un encoder-decoder transformer con atencion por bloques sobre espectrogramas log-Mel de 80 canales y ventanas de 30 segundos, procesando audio mono a 16 kHz. La variante "turbo" de OpenAI reduce el numero de capas del decoder respecto a large-v3, lo que abarata la inferencia a costa de algo de calidad en tareas dificiles. El autor no detalla en esta ficha el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; solo indica que el ajuste fino se realizo sobre habla en arabe egipcio y que los terminos tecnicos en ingles suelen conservarse en alfabeto latino.

La innovacion tecnica relevante aqui no esta en el entrenamiento sino en la distribucion: la conversion a ggml permite ejecutar el modelo con `whisper.cpp` en CPU, con cuantizaciones que el autor caracteriza como "practicamente sin perdida" (`q8_0`) y "la mas pequena, con deriva menor en diacriticos y mayusculas" (`q5_0`). No se documentan tecnicas como decodificacion especulativa ni atencion lineal.

## Capacidades

- Transcripcion de voz a texto en arabe egipcio, con preservacion de terminos tecnicos en ingles en alfabeto latino.
- Transcripcion de audio en ingles (heredada del modelo base y del ajuste fino).
- Decodificacion de audio mono a 16 kHz mediante `whisper.cpp` (`whisper-cli`).
- Ejecucion en CPU sin GPU, con huella de memoria moderada (aproximadamente 1,19 GB de RSS pico para `q8_0` y 0,95 GB para `q5_0` en un M1 con 6 hilos).
- Integracion en pipelines de agentes mediante seleccion por catalogo (`stt_catalog`, entrada `egy-whisper-turbo-ggml-q8`, motor `whispercpp`) con verificacion de sha256 del archivo descargado.
- No se documentan capacidades de traduccion, diarizacion de hablantes, tool calling ni razonamiento multi-paso.

## Casos de uso

- Dictado local en aplicaciones de escritorio: el modelo se ejecuta con `whisper.cpp` en CPU y cabe en menos de 1,2 GB de RAM, lo que permite integrarlo en un editor o agente sin GPU dedicada ni servicios en la nube.
- Asistentes personales en arabe egipcio: al conservar los terminos tecnicos en ingles en alfabeto latino, es adecuado para usuarios que mezclan ambos idiomas en frases como nombres de APIs, comandos o productos.
- Transcripcion de reuniones y notas de voz en entornos con requisitos de privacidad: al ser local y de licencia MIT, el audio no sale del dispositivo.
- Subtitulado de contenido audiovisual en arabe egipcio: la relacion tiempo-real publicada (RTF 0,154 con `q8_0` y 0,136 con `q5_0` sobre un clip de 25 s en un M1) indica que un clip de un minuto se procesa en unos 8-9 segundos, suficiente para flujos de postproduccion no interactivos.
- Integracion en agentes conversacionales con control de energia: la model card advierte que el silencio puede generar texto alucinado, por lo que el caso de uso recomendado incluye una compuerta por energia de audio antes de decodificar, tal como hace Sanad.
- Despliegue en dispositivos de borde o contenedores ligeros: el archivo `q5_0` de 547 MB y su RSS pico de 0,95 GB lo hacen viable en Raspberry Pi de gama alta, mini-PC o instancias cloud de bajo coste.
- Prototipado rapido de ASR en arabe egipcio: al estar en formato ggml y con licencia MIT, se puede evaluar sin friccion de licencias ni de toolchains propietarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (WER, MMLU u otros) en la informacion disponible. El autor unicamente reporta metricas de inferencia y de fidelidad de cuantizacion sobre un clip de 25 segundos en arabe egipcio, medidas en un Apple M1 con 6 hilos:

| Metrica | `q8_0` | `q5_0` |
|---|---|---|
| Tamano del archivo | 834 MB | 547 MB |
| RSS pico | ~1,19 GB | ~0,95 GB |
| RTF (clip de 25 s) | 0,154 | 0,136 |
| Diferencias vs. f16 original | 1 palabra | 4 palabras (diacriticos, mayusculas, una palabra final) |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso CPU; en GPU, el modelo cabe holgadamente en cualquier GPU con 2 GB o mas de memoria, aunque `whisper.cpp` esta optimizado para CPU.
- RAM estimada: aproximadamente 1,19 GB de RSS pico con `q8_0` y 0,95 GB con `q5_0` (medido en M1 con 6 hilos).
- GPU recomendadas: no se documentan; el autor publica mediciones en CPU (Apple M1). Cualquier GPU moderna con soporte de `whisper.cpp` (por ejemplo, CUDA en RTX 3060 o superior) puede acelerar la inferencia, pero no hay cifras publicadas.
- Cabe en GPU de consumo: si, en cualquier GPU con 2 GB o mas de VRAM; el caso natural es CPU.
- Opciones de despliegue: `whisper.cpp` (binario `whisper-cli`), con integracion en el catalogo `stt_catalog` de Sanad Agent. No se documentan despliegues con vLLM, TGI, Ollama ni llama.cpp, que no aplican a este formato.
- Latencia y throughput: RTF de 0,154 (`q8_0`) y 0,136 (`q5_0`) en M1 con 6 hilos, lo que equivale a procesar un clip de 25 s en aproximadamente 3,85 s y 3,4 s respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Sanad Egyptian Whisper Turbo ggml (este modelo) | no disponible (base large-v3-turbo) | no disponible (ventana de 30 s) | ar (egipcio), en | MIT | ggml | Ajuste fino en arabe egipcio; metricas de inferencia publicadas en M1 |
| `AhmedAttia3/sanad-egy-whisper-turbo-int8` | no disponible (mismos pesos) | no disponible | ar, en | MIT | ONNX (int8) | Mismos pesos en formato ONNX; requiere runtime ONNX |
| `openai/whisper-large-v3-turbo` | ~809 M (segun OpenAI, no confirmado en la informacion disponible) | ventana de 30 s | multilingue | MIT | safetensors, GGUF, etc. | Modelo base; sin ajuste especifico a arabe egipcio |
| `openai/whisper-large-v3` | ~1550 M (segun OpenAI, no confirmado en la informacion disponible) | ventana de 30 s | multilingue | MIT | safetensors, etc. | Mayor calidad y coste que la variante turbo; no ajustado a egipcio |

## Limitaciones y advertencias

- El silencio puede producir texto alucinado; la model card recomienda aplicar una compuerta por energia de audio antes de decodificar.
- El ajuste fino esta centrado en arabe egipcio; el rendimiento en otros dialectos arabes o en arabe estandar no esta documentado.
- La cuantizacion `q5_0` introduce deriva menor en diacriticos, mayusculas y alguna palabra final respecto al original f16; para transcripcion sensible a la exactitud se recomienda `q8_0`.
- No se publican metricas de calidad (WER) ni evaluaciones comparativas con otros modelos de ASR en arabe.
- No se documentan sesgos especificos, pero al derivar de Whisper large-v3-turbo hereda los sesgos conocidos del modelo base de OpenAI, no caracterizados en esta ficha.
- La licencia es MIT, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base `openai/whisper-large-v3-turbo` (tambien MIT) antes de redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- No hay informacion sobre el dataset de ajuste fino, el numero de horas de audio ni el proceso de entrenamiento, lo que dificulta evaluar su robustez en produccion.

## Enlaces

- [Hugging Face: AhmedAttia3/sanad-egy-whisper-turbo-ggml](https://huggingface.co/AhmedAttia3/sanad-egy-whisper-turbo-ggml)
- [Perfil del autor en Hugging Face](https://huggingface.co/AhmedAttia3)
- [Variante ONNX: AhmedAttia3/sanad-egy-whisper-turbo-int8](https://huggingface.co/AhmedAttia3/sanad-egy-whisper-turbo-int8)
- [Modelo base: openai/whisper-large-v3-turbo](https://huggingface.co/openai/whisper-large-v3-turbo)
