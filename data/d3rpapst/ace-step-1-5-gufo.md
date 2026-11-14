# D3rPapst/ace-step-1.5-gufo

## Resumen

ACE-Step 1.5 XL para gufo es un paquete consolidado del stack completo de síntesis de música a partir de texto ACE-Step 1.5, desarrollado originalmente por ACE Studio y StepFun y redistribuido por D3rPapst en un formato de un solo directorio que consume la herramienta gufo-studio-windows. El repositorio agrupa las tres variantes del DiT XL (turbo, sft y base) junto con los tres planificadores de lenguaje a 5 Hz (0.6B, 1.7B y 4B), el codificador de texto Qwen3-Embedding-0.6B, el VAE Oobleck y el tokenizador, todo en BF16 salvo el latente de silencio en F32.

El interés inmediato del paquete es operativo: permite ejecutar el pipeline text2music en hardware AMD Strix Halo bajo Windows mediante HIP nativo, sin depender de Python ni de conversiones adicionales. El autor documenta una medición de aproximadamente 22 segundos para generar 30 segundos de audio estéreo a 48 kHz con la variante turbo y el planificador de 5 Hz, con un pico de unos 15 GB de VRAM.

La relevancia radica en que ACE-Step 1.5 es uno de los pocos sistemas abiertos de generación musical con licencia MIT que declara entrenamiento sobre conjuntos de datos legalmente conformes y permite uso comercial del audio generado. Este repositorio concreto no añade pesos nuevos: es una reempaquetado con nombres de tensor preservados y metadatos de variante en safetensors para que gufo seleccione el muestreador adecuado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) XL para audio, con planificador LM a 5 Hz, codificador de texto Qwen3-Embedding y VAE Oobleck |
| Parámetros totales | No disponible (el paquete incluye DiT XL de 9,97 GB BF16 y planificadores de 0,6B, 1,7B y 4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 (DiT, LM y codificador de texto), F32 (latente de silencio); no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | No disponible (el prompt de texto se procesa con tokenizador Qwen3, multilingüe por herencia, pero la model card no declara idiomas) |
| Licencia | MIT (Copyright (c) 2026 ACEStep); el codificador de texto deriva de Qwen3-Embedding-0.6B, Apache-2.0 |
| Formato de pesos | safetensors (BF16 y F32) más tokenizer.json |
| Tamaño del repositorio | 44,9 GB (suma de ficheros declarada: ~41,8 GB) |
| Pipeline | text-to-audio |
| Salida de audio | WAV estéreo a 48 kHz |

## Arquitectura y entrenamiento

El sistema sigue un esquema de dos etapas: un planificador de lenguaje a 5 Hz que genera una representación semántica intermedia a partir del prompt de texto, y un DiT (diffusion transformer) que sintetiza el audio latente condicionado por esa representación y por embeddings del codificador Qwen3-Embedding-0.6B. El VAE Oobleck se encarga de la codificación y decodificación entre el espacio latente y la forma de onda. El paquete ofrece tres variantes del DiT XL: turbo (destilada para pocos pasos de muestreo), sft (ajustada de forma supervisada) y base, además de tres tamaños de planificador (0,6B, 1,7B y 4B) que pueden seleccionarse mediante el argumento `--lm`.

El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO; esa información corresponde al informe técnico arXiv:2602.00744 de ACE-Step 1.5, no reproducido en esta model card. La innovación destacable del empaquetado es la conversión determinista de los checkpoints fragmentados de Hugging Face a un único fichero BF16 con redondeo a par más cercano, usando un script que solo requiere numpy, y la preservación de los nombres de tensor originales junto con metadatos `gufo.variant` y `model_version` para que el runtime elija el muestreador.

## Capacidades

- Generación de música a partir de descripciones textuales, con salida WAV estéreo a 48 kHz.
- Tres modos de inferencia según la variante del DiT: turbo (rápido, pocos pasos), sft (ajustado supervisado) y base.
- Selección del planificador de lenguaje entre 0,6B, 1,7B y 4B, o desactivación completa con `--lm none`.
- Codificación de prompts mediante Qwen3-Embedding-0.6B, con tokenizador BPE byte-level idéntico al de Qwen.
- Ejecución nativa en AMD Strix Halo bajo Windows mediante HIP, sin Python.
- Servicio HTTP compatible con el endpoint `POST /v1/audio/music`.
- Integración con enrutador de modelos mediante presets de configuración (`gufo-router-combo7.ini`).
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo thinking.

## Casos de uso

- Producción musical asistida: un compositor puede generar bocetos de 30 segundos con la variante turbo en unos 22 segundos medidos, iterar sobre el prompt y exportar WAV a 48 kHz para su posterior edición en un DAW.
- Generación de bandas sonoras para vídeo y podcasts: el pipeline text2music permite crear música de fondo a partir de descripciones textuales y servirla vía HTTP desde un endpoint local, integrándose en un flujo de postproducción sin depender de servicios en la nube.
- Prototipado de aplicaciones de audio generativo: el endpoint `POST /v1/audio/music` y los presets de enrutador permiten montar un servicio local con nombre de modelo servido, útil para probar interfaces de usuario o pipelines de recomendación musical.
- Despliegue en estaciones de trabajo AMD: al ejecutarse con HIP nativo en Strix Halo bajo Windows, encaja en entornos donde no hay GPU NVIDIA ni se quiere instalar una pila Python completa.
- Investigación sobre modelos de difusión para audio: la disponibilidad de las tres variantes del DiT y los tres tamaños de planificador en un mismo directorio facilita experimentos comparativos de calidad frente a coste computacional.
- Generación musical con fines comerciales: la licencia MIT y la declaración del autor original sobre uso comercial del audio generado permiten incorporar las pistas a productos o publicaciones, sujeto a revisión legal propia.
- Evaluación de calidad frente a modelos cerrados: el paquete sirve como referencia abierta para comparar la fidelidad de la síntesis musical en condiciones controladas de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta una medición de latencia en hardware concreto: variante turbo, 30 segundos de música generados en aproximadamente 22 segundos con el planificador de 5 Hz, con 10,7 GB de VRAM en reposo y unos 15 GB de pico en Strix Halo.

## Requisitos de hardware

- VRAM en reposo: 10,7 GB medidos con la variante turbo en Strix Halo.
- VRAM en pico: aproximadamente 15 GB durante la generación.
- El preset del enrutador para la variante sft declara `router-gpu-gb = 15` y `router-host-gb = 1.5`.
- El tamaño del directorio completo es de unos 41,8 GB, por lo que se recomienda almacenamiento local rápido.
- Hardware validado: AMD Strix Halo bajo Windows con HIP nativo. No se documentan pruebas en GPU NVIDIA, Apple Silicon ni ROCm sobre Linux.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el runtime previsto es gufo (`gufo serve music`).
- Throughput estimado: 30 segundos de audio en unos 22 segundos con turbo y planificador de 5 Hz; no se aportan cifras para sft, base ni para los planificadores de mayor tamaño.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de generación musical que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio no añade pesos nuevos: es una reempaquetado de ACE-Step 1.5; los méritos y limitaciones del modelo subyacente aplican íntegramente.
- La model card no documenta sesgos conocidos, tasas de alucinación musical ni comportamiento en idiomas distintos del inglés; el tokenizador Qwen3 es multilingüe, pero no se garantiza calidad equivalente en todos los idiomas.
- No se especifican la longitud de contexto del planificador ni la duración máxima de audio generable.
- La procedencia exacta del VAE Oobleck no quedó registrada (el autor indica que se conserva el registro de descarga pero no la ruta de origen), lo que dificulta la verificación de procedencia.
- Tres ficheros provienen del reempaquetado de Comfy-Org/ACE-Step-1.5, cuya model card declara Apache-2.0, mientras que el resto se distribuye bajo MIT; conviene revisar la compatibilidad de licencias antes de un uso comercial.
- El codificador de texto deriva de Qwen3-Embedding-0.6B bajo Apache-2.0, con obligaciones de atribución.
- El soporte está validado únicamente en AMD Strix Halo con Windows y HIP; el rendimiento en otras plataformas no está documentado.
- El autor declara conversión y documentación asistidas por IA (Claude Code), lo que conviene tener en cuenta al auditar el proceso.
- No se documentan garantías de calidad subjetiva del audio ni métricas objetivas de fidelidad musical.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/D3rPapst/ace-step-1.5-gufo
- Modelo base principal: https://huggingface.co/ACE-Step/Ace-Step1.5
- Variante turbo: https://huggingface.co/ACE-Step/acestep-v15-xl-turbo
- Variante sft: https://huggingface.co/ACE-Step/acestep-v15-xl-sft
- Variante base: https://huggingface.co/ACE-Step/acestep-v15-xl-base
- Planificador 0.6B: https://huggingface.co/ACE-Step/acestep-5Hz-lm-0.6B
- Planificador 4B: https://huggingface.co/ACE-Step/acestep-5Hz-lm-4B
- Codificador de texto: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Reempaquetado ComfyUI: https://huggingface.co/Comfy-Org/ACE-Step-1.5
- Herramienta gufo-studio-windows: https://github.com/D3rPapst/gufo-studio-windows
- Informe técnico: https://arxiv.org/abs/2602.00744
