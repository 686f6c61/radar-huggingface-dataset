# okasi/kokoro-sv-viktor-onnx-q8

## Resumen

Kokoro Swedish Viktor Q8 ONNX es una exportación a ONNX del checkpoint sueco dedicado "Viktor" del proyecto Kokoro, publicada por el usuario okasi en Hugging Face. El modelo resuelve la síntesis de voz (text-to-speech) en sueco a partir de fonemas IPA, con pesos acústicos almacenados en INT8 simétrico por canal y dequantizados en el grafo para el cálculo en coma flotante. Deriva del checkpoint Viktor de Joakim Eriksson, entrenado a partir de Kokoro-82M con voz sintética sueca generada mediante VoxCPM2.

El paquete es deliberadamente ligero: el modelo acústico ocupa 79,7 MiB, la tabla de estilos se entrega como float32 crudo con forma `[510, 1, 256]` y la configuración incluye el vocabulario IPA, el límite de contexto y la forma de la tabla. Está pensado para inferencia en navegador con ONNX Runtime Web, con soporte de WebGPU y retroceso a WASM, lo que lo hace relevante para aplicaciones web de TTS que necesitan ejecutarse en cliente sin servidor.

La relevancia actual reside en su tamaño reducido (repo de 0,1 GB), su licencia Apache 2.0 y su cadena de herramientas completa: frontend de pronunciación sueca, tabla de estilos y vocabulario IPA. No es un modelo generalista, sino un componente especializado de un solo idioma y una sola voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro (modelo acústico TTS basado en transformer, exportado a ONNX); detalles internos de capas no disponibles |
| Parametros totales | No disponible (el modelo base Kokoro-82M tiene 82M; el checkpoint Viktor no declara recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 510 IDs de fonema por llamada (una utterance) |
| Tipos de cuantizacion | INT8 simétrico por canal en almacenamiento, dequantizado a coma flotante en el grafo (Q8) |
| Idiomas soportados | Sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`Viktor-q8.onnx`), tabla de estilos float32 little-endian (`Viktor.f32`), config JSON |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX del checkpoint Viktor de Joakim Eriksson, a su vez derivado de Kokoro-82M. La arquitectura subyacente es la de Kokoro, un modelo acústico de TTS que consume IDs de fonema y un vector de estilo (`ref_s`) para producir audio mono a 24 kHz junto con duraciones por token. La conversión realizada por okasi transforma `models/Viktor.pth` a ONNX y cuantiza los pesos a INT8 simétrico por canal; el grafo dequantiza esos pesos para operar en coma flotante. La tabla de estilos `voices/Viktor.pt` se convierte a float32 crudo y se empaqueta con el vocabulario y los metadatos de forma.

El entrenamiento original no lo realizó el autor de esta exportación: Eriksson entrenó el checkpoint Viktor y su estilo de voz a partir de Kokoro-82M usando voz sintética sueca generada con VoxCPM2. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO. La innovación técnica destacable de esta release es el empaquetado para navegador: inferencia con ONNX Runtime Web sobre WebGPU con retroceso a WASM, y una interfaz de entrada bien definida (`input_ids` int64 `[1, n+2]`, `ref_s` float32 `[1, 256]`) con relleno de token ID 0 al inicio y al final de la secuencia.

## Capacidades

- Síntesis de voz en sueco a partir de texto convertido previamente a fonemas IPA mediante el frontend de pronunciación sueca.
- Generación de audio mono a 24 kHz con duraciones por token devueltas por el modelo.
- Selección de estilo de voz mediante la tabla de estilos: para `n` IDs de fonema se toma la fila `n - 1` de la tabla `[510, 1, 256]`.
- Ejecución en navegador con ONNX Runtime Web, usando WebGPU y retroceso a WASM con cuatro hilos.
- Una utterance por llamada, con un máximo de 510 IDs de fonema.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso: es un modelo acústico de TTS especializado.
- Capacidad multilingüe limitada al sueco; no se declaran otros idiomas.

## Casos de uso

- Síntesis de voz en aplicaciones web sin servidor: el modelo se ejecuta en el navegador con ONNX Runtime Web y WebGPU, de modo que el audio se genera en el cliente y no requiere enviar texto a un backend. El tamaño de 79,7 MiB del modelo acústico facilita la carga inicial.
- Lectura de contenido en sueco para accesibilidad: artículos, noticias o documentación pueden convertirse a voz con el frontend IPA y el modelo, integrando la reproducción en un lector web.
- Asistentes conversacionales en sueco con una voz fija: al disponer de una única voz (Viktor) y una tabla de estilos, encaja en productos donde la consistencia de la voz es un requisito y no se necesita clonación.
- Generación de audiolibros o pódcast de baja latencia en local: la inferencia en el dispositivo evita costes de API y permite procesar pasajes de hasta 510 fonemas por llamada, encadenando utterances.
- Pruebas de pronunciación y aprendizaje de sueco: el pipeline texto → IPA → audio permite exponer la transcripción fonética junto al audio generado, útil en herramientas educativas.
- Prototipado de TTS en navegador para equipos que evalúan Kokoro: al estar cuantizado y empaquetado con vocabulario y estilos, sirve como base reproducible para comparar WebGPU frente a WASM en hardware concreto.
- Integración en extensiones o aplicaciones de escritorio basadas en web tech: el formato ONNX y la licencia Apache 2.0 permiten redistribuir el modelo dentro de un producto.

## Benchmarks y rendimiento

Los únicos datos publicados son el benchmark de navegador del autor, sobre un pasaje sueco de 128 palabras, en Chromium 143 y ONNX Runtime Web 1.31.1 sobre un Apple M1 Pro. El tiempo incluye pronunciación, inferencia acústica y filtros notch originales, y comienza tras la carga del modelo y el frontend.

| Runtime | Primera generación | Repetición | WER con Whisper large-v3-turbo |
|---|---:|---:|---:|
| WebGPU con retroceso a WASM | 18,64 s | 18,52 s | 3,91 % (5 / 128) |
| WASM, cuatro hilos | 28,04 s | — | 3,91 % (5 / 128) |

La carga del modelo y el frontend con WebGPU fue de 2,07 s desde almacenamiento local. El autor advierte que estos tiempos describen un pasaje en una máquina concreta. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no aplican a un modelo de TTS.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo acústico pesa 79,7 MiB en INT8 y la tabla de estilos `[510, 1, 256]` en float32 ocupa aproximadamente 0,5 MB, por lo que la huella es muy reducida.
- GPU recomendadas: no se declaran; el benchmark se realizó en un Apple M1 Pro con WebGPU. Para servidor no hay datos publicados.
- Cabe en GPU consumer: sí, por tamaño; el autor solo documenta ejecución en navegador, no en GPU dedicadas de escritorio.
- Opciones de despliegue: ONNX Runtime Web con WebGPU y WASM (documentado); al ser un modelo ONNX, es compatible en principio con otros runtimes ONNX, aunque no se documentan en la model card.
- Latencia y throughput: 18,64 s para la primera generación y 18,52 s en repetición con WebGPU; 28,04 s con WASM a cuatro hilos, para un pasaje de 128 palabras en un M1 Pro. No hay datos de throughput en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| okasi/kokoro-sv-viktor-onnx-q8 | No disponible (base Kokoro-82M) | 510 fonemas | Sueco | Apache 2.0 | ONNX Q8 | Exportación cuantizada para navegador, una voz |
| Joakim/kokoro-sv-voices (base) | No disponible (base Kokoro-82M) | No disponible | Sueco | No disponible en la información | PyTorch | Checkpoints y estilos originales de Eriksson |
| hexgrad/Kokoro-82M | 82M | No disponible | Multilingüe (según variantes) | No disponible en la información | PyTorch | Modelo base del que deriva Viktor |
| cmasus/vocalis-models | No disponible | No disponible | No disponible | No disponible | ONNX | Conversiones ONNX de modelos Kokoro para la app Vocalis; sin entrenamiento nuevo |

## Limitaciones y advertencias

- Modelo de un solo idioma (sueco) y una sola voz (Viktor); no admite clonación de voz ni cambio de hablante más allá de la tabla de estilos.
- Requiere un frontend externo de pronunciación sueca para convertir texto a IPA; el modelo no procesa texto directamente.
- Límite de 510 IDs de fonema por llamada y una utterance por invocación; pasajes largos deben trocearse.
- Los caracteres IPA no mapeados en el vocabulario deben omitirse, lo que puede degradar la pronunciación si el frontend produce símbolos fuera del vocabulario.
- Riesgo de alucinación acústica y errores de pronunciación: el WER medido con Whisper large-v3-turbo fue del 3,91 % en un único pasaje, insuficiente para generalizar.
- El entrenamiento usó voz sintética generada con VoxCPM2, lo que puede introducir artefactos o sesgos acústicos heredados del generador.
- Los tiempos del benchmark corresponden a un M1 Pro con Chromium 143 y ONNX Runtime Web 1.31.1; no deben extrapolarse a otros dispositivos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no documenta garantías ni soporte; conviene verificar la procedencia de los pesos base y de los datos sintéticos.
- El audio generado es sintético y debe etiquetarse como tal al compartirse, según la práctica indicada en proyectos similares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/okasi/kokoro-sv-viktor-onnx-q8
- Modelo base (checkpoints y estilos de Viktor): https://huggingface.co/Joakim/kokoro-sv-voices/tree/97200c43d189c2aabafc1432b97cb28db18033bf
- Frontend de pronunciación sueca: https://github.com/joakimeriksson/kokoro-sv
- Activos G2P suecos: https://huggingface.co/Joakim/kokoro-sv-g2p
- Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- kokoro-onnx (TTS con Kokoro y ONNX Runtime): https://github.com/thewh1teagle/kokoro-onnx
- cmasus/vocalis-models (conversiones ONNX de Kokoro): https://huggingface.co/cmasus/vocalis-models
