# ryugyosoft/gemma-4-E4B-it-npu

## Resumen

`ryugyosoft/gemma-4-E4B-it-npu` es una reempaquetado comunitario del modelo multimodal `google/gemma-4-E4B-it` (texto + imagen) preparado para ejecutarse íntegramente sobre la NPU de Intel mediante OpenVINO. No es un fine-tune de pesos ni un cambio de arquitectura: el autor ha reescrito los grafos del modelo para la NPU (encoder de visión, embeddings de texto, la tabla de per-layer embeddings de 2,7 GB, el decoder de 42 capas y el LM head) y ha añadido un bucle de generación propio que gestiona la caché KV. El host solo tokeniza, preprocesa píxeles, construye máscaras de atención, copia filas de KV y muestrea.

El interés práctico está en que demuestra inferencia multimodal completa (visión incluida) sin GPU dedicada, apoyándose en el NPU 3720 de un Core Ultra 9 285HX (Arrow Lake HX) bajo Windows 11. Los pesos del decoder se cuantizan a INT4 simétrico (grupo 128 por defecto, channel-wise en modo `--fast`) y el repositorio ocupa 8,7 GB. Incluye un servidor compatible con la API de OpenAI (`/v1/chat/completions` con streaming y entrada de imagen).

La relevancia es doble: por un lado, es un caso poco habitual de port completo de un VLM a NPU con pesos INT4; por otro, arrastra limitaciones severas respecto al modelo base (caché KV estática de 1024 tokens, una petición simultánea, sin audio y dependencia de una OpenVINO nightly). Está probado en una única máquina, lo que conviene tener en cuenta antes de adoptarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 42 capas con encoder de visión independiente y per-layer embeddings (PLE); multimodal imagen-texto |
| Parametros totales | 4,4 B según gemma4.dev para el modelo base Gemma 4 E4B; la model card del autor no lo especifica |
| Longitud de contexto | Modelo base: 256K según la guía de Gemma 4 (codersera). Esta implementación NPU: caché KV estática de 1024 tokens |
| Tipos de cuantizacion | INT4 simétrico, grupo 128 (por defecto) e INT4 simétrico channel-wise (modo `--fast`); embeddings de texto tomados de `OpenVINO/gemma-4-E4B-it-int4-ov` |
| Idiomas soportados | en, ja (según los tags de HuggingFace) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`.xml`/`.bin`); grafos estáticos divididos en visión, embeddings, PLE, decoder y head |
| Tamano del repositorio | 8,7 GB |
| Libreria | openvino |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 42 capas con arquitectura multimodal basada en encoders: un encoder de visión procesa la imagen (con un pooler 3x3 y una proyección) y sus salidas se inyectan en el espacio de embeddings del LLM. A diferencia de la variante Gemma 4 12B "Unified", que es encoder-free y proyecta parches de imagen y formas de onda de audio directamente, los modelos E4B mantienen encoders dedicados. La variante E4B usa, además, per-layer embeddings (PLE), una tabla de 2,7 GB que en este port se divide en cuatro fragmentos de vocabulario (`ple_32_{0..3}of4`), dos de ellos en el proceso principal y dos en un worker.

No hay información sobre el entrenamiento del modelo base en los datos proporcionados (número de tokens, composición del dataset, uso de RLHF/DPO). Tampoco se documentan innovaciones de entrenamiento específicas. La aportación técnica de este repositorio es de despliegue, no de entrenamiento: grafos reescritos para NPU, atención con `head_dim` 512 como workaround, reparto de memoria por proceso, un runner de caché KV estático y un proceso worker dedicado. La NPU ejecuta el encoder de visión, los embeddings de texto, la tabla PLE, el decoder (en variantes de 16 tokens para prefill y 1 token para decode) y el LM head; el host solo orquesta tokenización, preprocesado y muestreo.

## Capacidades

- Generación de texto e instrucciones conversacionales (variante `it`, instruction-tuned).
- Comprensión de imágenes: descripción de escenas, respuesta a preguntas sobre una imagen, OCR y lectura de detalles visuales dentro del presupuesto de tokens de imagen.
- Entrada multimodal combinada: imagen más prompt de texto en la misma petición, tanto por CLI como por API.
- Tokenización configurable de imagen mediante `--soft-tokens 70|140|280` (menos tokens = visión más rápida y menos detallada; 280 tokens ≈ 290 tokens de prompt).
- Servidor compatible con la API de OpenAI: `GET /v1/models` y `POST /v1/chat/completions` con `stream`, `stream_options.include_usage`, `max_tokens`/`max_completion_tokens`, `temperature`, `top_p`, `seed`, `stop`, mensajes de sistema y multi-turno, y partes `image_url` (data URLs o http(s)).
- Compatibilidad con el SDK oficial de OpenAI (se incluye `example_client.py`).
- Funcionamiento alternativo en CPU si no hay driver NPU disponible (`--device CPU` o dispositivos por componente).
- Modo de decoder rápido (`--fast`) con cuantización channel-wise, a costa de precisión factual.
- Thinking mode: mencionado en fuentes externas para el modelo base Gemma 4 E4B; no se documenta su exposición en este port NPU.
- Tool calling / function calling y uso agéntico multi-paso: no documentado en la model card de este repositorio.

## Casos de uso

- Descripción y etiquetado de imágenes en local: el modelo acepta una imagen y un prompt de texto y genera una descripción en lenguaje natural. Es adecuado para catalogación de fotos o generación de alt-text sin enviar datos a la nube, siempre que la imagen quepa en el presupuesto de 280 soft tokens.
- VQA (visual question answering) sobre documentos o capturas: con `--soft-tokens 280` se pueden formular preguntas concretas sobre el contenido de una imagen (por ejemplo, leer un formulario o una factura escaneada) y obtener respuestas en texto.
- Asistente de escritorio con API compatible con OpenAI: `server.py` expone `/v1/chat/completions` con streaming, de modo que cualquier cliente que ya hable el protocolo de OpenAI puede apuntar a `http://127.0.0.1:8000/v1` sin cambios en el código, útil para prototipos de aplicaciones de escritorio en Windows.
- Procesamiento por lotes de imágenes en CPU o NPU sin GPU: si el equipo no dispone de GPU dedicada, el repositorio permite ejecutar el mismo pipeline en CPU (`--device CPU`) o repartir componentes entre NPU y CPU, lo que encaja en flujos de preprocesado de imágenes por lotes donde la latencia no es crítica.
- Prototipado y evaluación de despliegues en NPU: sirve como referencia para medir qué componentes de un VLM caben en una NPU Intel, con scripts de diagnóstico como `layer_probe.py` para comparar capa a capa NPU frente a CPU.
- Demostraciones offline de IA multimodal: al ser un paquete autocontenido de 8,7 GB con servidor integrado, es viable para demos en ferias, aulas o entornos con conectividad limitada, ejecutándose en un portátil Core Ultra.
- Transcripción de texto japonés sobre imágenes: los idiomas declarados son en y ja, y el ejemplo de la model card responde en japonés a una pregunta sobre una fotografía, lo que lo hace apto para tareas de descripción o lectura de imágenes con contenido en japonés.
- Integración en pipelines de CI con cliente OpenAI: `example_client.py` demuestra el uso del SDK oficial contra el servidor, lo que permite escribir pruebas automatizadas de extremo a extremo de aplicaciones multimodales sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (sin cifras de MMLU, HumanEval, GSM8K ni similares). Lo único documentado son métricas de rendimiento de inferencia en la máquina de prueba:

| Metrica | default | `--fast` |
|---|---|---|
| Decode | 6,6 tok/s | 8,3 tok/s |
| Prefill (imagen + texto, 288 tokens) | 4,2 s | 2,4 s |
| Encoder de vision (280 soft tokens) | 2,0 s | 2,0 s |
| Pesos del decoder | INT4 sym, grupo 128 | INT4 sym, channel-wise |
| Calidad | Coincide con la referencia CPU en las comprobaciones del autor | Hechos visiblemente peores (por ejemplo, «el monte Fuji mide 3.100 m») |
| Carga | ~14,8 s desde `models/npu_cache` | Primera ejecución: ~6 min de compilación para la NPU |

## Requisitos de hardware

- Entorno validado: una sola máquina, Core Ultra 9 285HX (Arrow Lake HX, NPU 3720), Windows 11, driver NPU 32.0.100.5540 y OpenVINO 2026.5.0b1 (nightly).
- Memoria: el repositorio pesa 8,7 GB; los pesos del decoder se cuantizan a INT4. El modelo base Gemma 4 E4B se documenta con un mínimo de 8 GB de VRAM en GPU, aunque esta implementación está pensada para ejecutarse sobre NPU y memoria del sistema, no sobre VRAM.
- GPU: esta build no usa CUDA. Está orientada a NPU Intel más CPU; no se incluyen rutas para A100, H100 ni RTX 4090.
- NPU compatibles: NPU 3720 probada; otras generaciones (por ejemplo Lunar Lake NPU4) están sin probar. Los workarounds (atención con `head_dim` 512, reparto de memoria por proceso) se descubrieron en NPU 3720 y podrían comportarse de forma distinta en otras.
- Linux: los IR son independientes del sistema operativo y el código funciona en Ubuntu 22.04 con Python 3.10, pero solo en modo CPU; para NPU hace falta el driver Linux de Intel (release v1.38.0 orientada a Ubuntu 24.04/26.04, con `libtbb12`, paquetes `.deb` y el loader Level Zero `libze1`).
- CPU: sin driver NPU todo sigue funcionando en CPU (`python server.py --device CPU` o reparto por componente con `--vision-device CPU --emb-device CPU --ple-device CPU --lm-device CPU`).
- Opciones de despliegue: CLI propia (`gemma4_npu.py`), servidor compatible con OpenAI (`server.py`) y SDK oficial de OpenAI como cliente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento: 6,6 tok/s en decode (8,3 tok/s en `--fast`), prefill de 288 tokens en 4,2 s (2,4 s en `--fast`) y encoder de visión en 2,0 s. Las peticiones se atienden de una en una, sin batching ni prefix caching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| `ryugyosoft/gemma-4-E4B-it-npu` | 4,4 B (heredado del base) | 1024 tokens en esta implementacion (256K en el base) | OpenVINO IR, NPU/CPU Intel | Apache 2.0 | Port comunitario multimodal con encoder de visión, PLE y decoder en NPU; 6,6 tok/s en la maquina probada |
| `google/gemma-4-E4B-it` | 4,4 B | 256K según la guía de Gemma 4 | safetensors (pesos originales) | Apache 2.0 | Modelo base de Google DeepMind, multimodal, sin las restricciones de contexto ni de concurrencia del port |
| `OpenVINO/gemma-4-E4B-it-int4-ov` | 4,4 B | No disponible en la informacion proporcionada | OpenVINO IR, orientado a CPU/GPU | Apache 2.0 | Versión INT4 oficial de OpenVINO; el port de ryugyosoft reutiliza sus embeddings de texto |
| Gemma 4 12B Unified | 12 B | 256K según la guía de Gemma 4 | safetensors | Apache 2.0 | Variante encoder-free de la familia; proyecta parches de imagen y audio directamente al espacio de embeddings del LLM, a diferencia de los E4B |

## Limitaciones y advertencias

- Contexto limitado a una caché KV estática de 1024 tokens; una imagen con 280 soft tokens consume aproximadamente 290 tokens de prompt, dejando un margen reducido para conversaciones largas.
- Una sola petición simultánea: no hay batching ni prefix caching, por lo que no es apto para servir tráfico concurrente sin cambios profundos.
- No soporta entrada de audio; el encoder de audio no está incluido en el repositorio.
- Requiere una OpenVINO pre-release (2026.5 nightly) y la instalación de dependencias desde índices nightly, lo que complica la reproducibilidad y el soporte a largo plazo.
- Solo se ha probado en una máquina (Core Ultra 9 285HX, NPU 3720, Windows 11). La NPU en Linux no está probada; solo se ha validado el modo CPU en Ubuntu.
- El modo `--fast` degrada la precisión factual de forma visible según el propio autor (ejemplo citado: «el monte Fuji mide 3.100 m»); el modo por defecto es más lento pero coincide con la referencia CPU en las comprobaciones realizadas.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (24 de septiembre de 2026): es un artefacto reciente y con escasa validación externa.
- No se documentan evaluaciones de sesgos ni de alucinación para este port; los riesgos de alucinación propios del modelo base siguen aplicando, especialmente en tareas factuales.
- Los idiomas declarados son en y ja; el rendimiento en castellano no está documentado y no debería asumirse.
- Licencia Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base de Google y de los pesos INT4 de OpenVINO reutilizados.
- Los workarounds para NPU pueden no ser portables a otras generaciones; se incluye `layer_probe.py` para diagnosticar salidas incorrectas comparando capa a capa NPU frente a CPU.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ryugyosoft/gemma-4-E4B-it-npu
- Modelo base (instruction-tuned): https://huggingface.co/google/gemma-4-E4B-it
- Modelo base (pretrained): https://huggingface.co/google/gemma-4-E4B
- Embeddings de texto INT4 reutilizados: https://huggingface.co/OpenVINO/gemma-4-E4B-it-int4-ov
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha de Gemma 4 E4B en gemma4.dev: https://gemma4.dev/models/gemma-4-e4b
- Guia completa de Gemma 4 (E2B, E4B, 26B MoE, 31B): https://codersera.com/blog/gemma-4-complete-guide-2026/
- Driver NPU de Intel para Linux: https://github.com/intel/linux-npu-driver/releases
- Indice nightly de wheels de OpenVINO: https://storage.openvinotoolkit.org/simple/wheels/nightly
- Indice de wheels de PyTorch para CPU: https://download.pytorch.org/whl/cpu
