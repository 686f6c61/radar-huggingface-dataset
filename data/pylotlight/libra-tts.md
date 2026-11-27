# pylotlight/Libra-TTS

## Resumen

Libra-TTS es un modelo de síntesis de voz (text-to-speech) multilingüe desarrollado por el usuario pylotlight, destilado a partir de Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice. Con solo 307 millones de parámetros, cubre 16 idiomas y 8 voces, y está diseñado para ejecutarse más rápido que el tiempo real tanto en Apple Silicon como en GPUs NVIDIA y CPUs convencionales. Su propuesta principal es ofrecer una calidad de síntesis competitiva con modelos mucho más grandes a una fracción del coste computacional.

El modelo se distribuye en formatos MLX (para Apple Silicon), ONNX (para CPU) y safetensors en fp16, con soporte para cuantización. Según la model card, alcanza un WER del 1,64 % en inglés, por delante de Magpie-357M, Kokoro-82M y los propios Qwen3-TTS de 1,7B y 0,6B, y supera a estos últimos en sus diez idiomas compartidos con un error medio del 1,77 % frente a 2,75 % y 2,62 %.

La relevancia actual radica en su eficiencia: lee texto sin preprocesar (números, fechas, horas y divisas), ofrece 12 estilos de habla y funciona en macOS, Windows y Linux. Está publicado bajo licencia Apache 2.0, lo que facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado por destilación de Qwen3-TTS-12Hz-1.7B-CustomVoice) |
| Parametros totales | 307.149.568 (aproximadamente 0,3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, cuantización (soportada según tags; niveles concretos no disponibles) |
| Idiomas soportados | en, zh, ja, ko, de, fr, es, it, pt, ru, ar, hi, pa, bn, ur, id (16 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, MLX |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna del modelo (tipo de transformer, mecanismo de atención o diseño del decodificador vocacional). Lo que sí se indica es que Libra-TTS es un modelo destilado de Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice, lo que explica su reducción de tamaño desde 1,7B hasta 0,3B de parámetros manteniendo —y en varios idiomas mejorando— la calidad del modelo docente. La model card menciona que el modelo base del que se destila emplea una representación de audio a 12 Hz.

El entrenamiento incluye soporte para 8 voces identificadas (Nina, Bob, Sofia, Aliya, Maya, Sam, Jon, Omar) y 12 estilos de habla, desde un tono cálido hasta susurros, con control de velocidad de lectura. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa; las optimizaciones mencionadas son de despliegue: grafos CUDA en PyTorch para GPUs NVIDIA, MLX para Apple Silicon y ONNX Runtime para CPU.

## Capacidades

- Síntesis de voz multilingüe en 16 idiomas: inglés, chino, japonés, coreano, alemán, francés, español, italiano, portugués, ruso, árabe, hindi, panyabí, bengalí, urdu e indonesio.
- Ocho voces predefinidas con nombres propios (Nina, Bob, Sofia, Aliya, Maya, Sam, Jon, Omar).
- Doce estilos de habla, desde tono cálido hasta susurro, con control de velocidad (más lento o más rápido).
- Lectura de texto sin preprocesar: interpreta correctamente números, fechas, horas y divisas.
- Inferencia más rápida que el tiempo real en Apple Silicon (MLX), GPUs NVIDIA (PyTorch con CUDA graphs) y CPU (ONNX Runtime).
- Ejecución multiplataforma: macOS, Windows y Linux.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo de texto a voz.

## Casos de uso

- Audiolibros y narración automatizada: el modelo lee texto largo a 44x de velocidad respecto al tiempo real en un MacBook Pro y 72x en una RTX 3090, lo que permite procesar libros completos en minutos y con 12 estilos de narración ajustables.
- Asistentes de voz para atención al cliente: las 8 voces y 16 idiomas permiten cubrir mercados internacionales con una sola implementación, y la lectura directa de números, fechas y divisas evita errores en la locución de datos transaccionales.
- Accesibilidad y lectores de pantalla: al ejecutarse en CPU con ONNX Runtime (2,4x tiempo real) y en Apple Silicon con MLX, puede integrarse en aplicaciones de escritorio sin GPU dedicada.
- Generación de contenido para vídeo y pódcast: los 12 estilos de habla y el control de velocidad permiten producir locuciones con distintas tonalidades sin regrabar, y el procesamiento por frases (7,7x tiempo real en MacBook Pro, 8,7x en RTX 3090) facilita la edición iterativa.
- Localización de productos digitales: la cobertura de idiomas añadidos respecto a Qwen3-TTS (árabe, hindi, panyabí, bengalí, urdu e indonesio) permite doblar interfaces y tutoriales a mercados del sur de Asia y Oriente Medio.
- Aplicaciones de escritorio empaquetadas con Electron y WebGPU: los tags del modelo indican soporte para este stack, lo que posibilita asistentes de voz integrados en apps de escritorio sin depender de servicios en la nube.
- Prototipado rápido en demo web: la demo en vivo de Hugging Face Spaces lee sobre GPU y sirve para evaluar calidad y voces antes de integrar el modelo en producción.

## Benchmarks y rendimiento

| Metrica | Libra-TTS (0,3B) | Qwen3-TTS 1.7B | Qwen3-TTS 0.6B | Magpie-357M | Kokoro-82M |
|---|---|---|---|---|---|
| WER en inglés | 1,64 % | 2,74 % | 3,21 % | superior a 1,64 % (dato exacto no disponible) | superior a 1,64 % (dato exacto no disponible) |
| Error medio en los 10 idiomas de Qwen3-TTS | 1,77 % | 2,75 % | 2,62 % | no disponible | no disponible |
| Modelo docente (1,9B) | 1,91 % (referencia) | — | — | — | — |

Datos de velocidad aportados en la model card:

| Entorno | Frase a frase | Texto largo |
|---|---|---|
| MacBook Pro (Apple Silicon, MLX) | 7,7x tiempo real | 44x tiempo real |
| RTX 3090 (PyTorch, CUDA graphs) | 8,7x tiempo real | 72x tiempo real |
| CPU con ONNX Runtime | 2,4x tiempo real | no disponible |

No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que no es un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: con 307 millones de parámetros en fp16, el peso de los pesos ronda los 0,6 GB; el consumo real dependerá del runtime y de los buffers de activación (no disponible con precisión).
- GPU recomendadas: NVIDIA GeForce RTX 20-series o superior (la model card cita RTX 3090 como referencia); en Apple Silicon se usa la GPU vía MLX.
- Cabe en cualquier GPU consumer moderna: el tamaño del repositorio (4,1 GB) incluye múltiples formatos, pero la huella del modelo en fp16 es inferior a 1 GB.
- Opciones de despliegue: MLX en macOS con Apple Silicon; PyTorch con CUDA graphs en Windows y Linux; ONNX Runtime en CPU; paquete pip `libra-tts` con extras `[cuda]` y `[ja]`.
- Latencia y throughput: 7,7x tiempo real frase a frase en MacBook Pro y 8,7x en RTX 3090; 44x y 72x respectivamente para texto largo; 2,4x en CPU con ONNX.
- En Linux, `LibraTTS()` compila sus capas al cargar (unos segundos), según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER ingles | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Libra-TTS | 0,3B | 16 | 1,64 % | Apache 2.0 | Hugging Face, GitHub, demo |
| Qwen3-TTS 1.7B | 1,7B | 10 | 2,74 % | no disponible en la informacion | Hugging Face (modelo base) |
| Qwen3-TTS 0.6B | 0,6B | 10 | 3,21 % | no disponible en la informacion | Hugging Face |
| Kokoro-82M | 82M | no disponible | superior a 1,64 % (dato exacto no disponible) | no disponible en la informacion | no disponible en la informacion |
| Magpie-357M | 357M | no disponible | superior a 1,64 % (dato exacto no disponible) | no disponible en la informacion | no disponible en la informacion |

Libra-TTS ofrece el menor WER en inglés de los modelos comparados en la model card, con un tercio de los parámetros de Qwen3-TTS 0.6B y una sexta parte de Qwen3-TTS 1.7B, además de seis idiomas adicionales.

## Limitaciones y advertencias

- No se documentan sesgos conocidos por idioma, género o acento; la evaluación se limita al WER y no cubre métricas de naturalidad percibida (MOS) en la información disponible.
- Riesgo de alucinación en la locución: no se aportan datos sobre errores en textos ambiguos, siglas o nombres propios fuera de los idiomas evaluados.
- La longitud de contexto no está especificada, por lo que no se puede garantizar el comportamiento en textos muy largos sin segmentación previa.
- El rendimiento en los seis idiomas añadidos respecto a Qwen3-TTS (árabe, hindi, panyabí, bengalí, urdu e indonesio) no se cuantifica con WER en la model card; la comparativa de error medio solo cubre los diez idiomas compartidos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-TTS del que se destila, cuya licencia no se detalla en la información proporcionada.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado el 27 de noviembre de 2026; su madurez y soporte comunitario son limitados.
- La model card referencia recursos bajo la ruta `Ekam/Libra-TTS` mientras que el ID del repositorio es `pylotlight/Libra-TTS`; verificar que los enlaces de descarga y la demo apuntan al repositorio correcto antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/pylotlight/Libra-TTS
- Repositorio GitHub: https://github.com/ekambrar100/Libra-TTS
- Demo en vivo: https://huggingface.co/spaces/Ekam/Libra-TTS
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Muestras de audio: https://huggingface.co/Ekam/Libra-TTS/resolve/main/samples/en_nina.mp3 (y resto de muestras referenciadas en la model card)
