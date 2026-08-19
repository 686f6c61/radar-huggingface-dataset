# Lucifer2006/Arcle-V1

## Resumen

Arcle V1 es un modelo omni multimodal any-to-any desarrollado por Abhinav Anand en ArcleIntelligence, con el objetivo declarado de ofrecer una alternativa gratuita a los servicios de IA de pago. El modelo integra texto, imágenes, documentos, audio y vídeo en una única arquitectura unificada: todas las modalidades se proyectan en un mismo espacio de representación compartido de 2.560 dimensiones, en lugar de usar un router o un pipeline de varios modelos. Cuenta con 5.840 millones de parámetros exactos y una ventana de contexto no especificada en la información disponible.

La relevancia de Arcle V1 reside en su enfoque de modelo omni de código abierto bajo licencia Apache 2.0, que permite ejecutar tareas de conversación, OCR, reconocimiento de voz, síntesis de voz, comprensión de imágenes y vídeo con un solo conjunto de pesos. El autor es transparente sobre las limitaciones: la generación de imágenes se declara experimental y no usable, y la comprensión de vídeo está entrenada pero sin evaluar. El modelo se distribuye en formato safetensors con el repositorio autocontenido, incluyendo código de inferencia y arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Omni multimodal unificada: núcleo de lenguaje + encoders especializados (visión, OCR, audio, TTS, vídeo) proyectados a espacio compartido de 2.560 dimensiones |
| Parametros totales | 5.840.000.000 (exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (nativo en Ampere o posterior; float32 en CPU) |
| Idiomas soportados | en, hi, es, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shardeado, con archivo index) |

## Arquitectura y entrenamiento

Arcle V1 emplea una arquitectura omni unificada donde cada modalidad de entrada se procesa mediante un encoder de percepción especializado (visión, OCR, audio, vídeo) y se proyecta mediante conectores entrenables a un espacio semántico común de 2.560 dimensiones. Ese espacio compartido es el mismo en el que razona el núcleo de lenguaje, que actúa como backbone conjunto para todas las tareas. No se trata de un router ni de varios modelos tras una API, sino de un único `nn.Module` con representaciones compartidas.

El entrenamiento se realizó en varias etapas. El adaptador del LLM permaneció congelado durante toda la fase de entrenamiento multimodal, de modo que las capacidades de texto y razonamiento no se alteraron en esa etapa; los benchmarks lo confirman (MMLU pasó de 48.0% a 47.8%, ARC-Easy se mantuvo en 81.5%). Los conectores entrenables concentran todos los parámetros ajustados, junto con un adaptador LoRA. El repositorio incluye el script de entrenamiento de demostración, aunque el README del autor indica que la integración multimodal se entrenó con un harness propio con n=400 por benchmark. El archivo `am_adam.pt` sugiere el uso del optimizador Adam adaptativo. No se menciona el uso de RLHF ni DPO en la información disponible.

## Capacidades

- Conversación y razonamiento: el núcleo de lenguaje está congelado respecto a una versión anterior y mantiene sus capacidades de texto.
- OCR de documentos: alcanza 94.6% en documentos sintéticos y 49.1% en PDFs escaneados reales; no es fiable para páginas densas multi-columna.
- Reconocimiento de voz (speech-to-text): 9.2% de tasa de error de palabra (WER).
- Comprensión de imágenes: 61.1% de solapamiento de caption; VQA 57.2% en VQAv2.
- Síntesis de voz (text-to-speech): salida verificada a 24 kHz; requiere descargar un voice pack de `hexgrad/Kokoro-82M` en el primer uso.
- Comprensión de vídeo: entrenada pero sin evaluar; no se proporcionan cifras.
- Generación de imágenes: experimental y no usable según el autor; produce abstracciones pictóricas sin seguir el prompt.
- Multilingüe: soporta inglés, hindi, español y francés.
- Tool calling y funciones de agente: no se mencionan en la información disponible.

## Casos de uso

- Transcripción de audio a texto: el modelo ofrece un WER del 9.2%, suficiente para transcripciones de reuniones, entrevistas o contenido multimedia en inglés, hindi, español y francés, ejecutable localmente sin coste por uso.
- OCR de documentos sintéticos: con 94.6% de precisión en documentos generados digitalmente, puede extraer texto de capturas, formularios electrónicos o PDFs nativos en flujos de automatización documental.
- Asistente conversacional multilingüe: el núcleo de lenguaje congelado mantiene capacidades de razonamiento y conversación; al ser Apache 2.0, puede integrarse en productos comerciales sin regalías.
- Comprensión de imágenes para accesibilidad: con 61.1% de solapamiento de caption, puede generar descripciones de imágenes para herramientas de accesibilidad, aunque con margen de error relevante.
- Síntesis de voz para prototipos: la salida TTS a 24 kHz permite generar audios para asistentes de voz o sistemas de lectura en aplicaciones de demostración.
- Investigación académica en modelos omni: al ser un modelo unificado con código fuente incluido, sirve como base para estudiar integración multimodal, proyección de espacios compartidos y entrenamiento por etapas con congelado selectivo.

## Benchmarks y rendimiento

El autor publica resultados medidos con su propio harness, con n=400 por benchmark, sobre los pesos distribuidos:

| Benchmark | Score |
|---|---|
| ARC-Easy | 81.5% |
| GSM8K | 75.5% |
| HellaSwag | 69.2% |
| ARC-Challenge | 53.8% |
| MMLU | 47.8% |
| VQAv2 | 57.2% |

Capacidades medidas:

| Capacidad | Resultado |
|---|---|
| OCR, documentos sintéticos | 94.6% |
| OCR, PDFs escaneados reales | 49.1% |
| OCR, recall global en free-running | 71.8% |
| Bucle de repetición peor caso | x7 |
| Reconocimiento de voz (WER) | 9.2% |
| Comprensión de imágenes (caption overlap) | 61.1% |
| Visual question answering (VQAv2) | 57.2% |

El autor señala que VQAv2 cayó de 65.2% a 57.2% en la etapa final, una caída mayor que el ruido de muestreo a n=400 y aún sin explicar. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: pico de 17.31 GB medido en bfloat16; una GPU con 24 GB lo ejecuta con comodidad.
- GPUs recomendadas: cualquier GPU Ampere o posterior (RTX 3090, RTX 4090, A100, H100) para bfloat16 nativo. En tarjetas antiguas (T4, V100) bfloat16 se emula y es lento.
- CPU: funciona pero en float32, requiere ~24 GB de RAM.
- Tiempo de carga: ~3.5 minutos.
- Opciones de despliegue: el repositorio incluye `inference.py` con una clase `ArcleInference` autocontenida; también se puede cargar el modelo directamente con `load_flat` desde `arcle_flat.py`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- La primera ejecución de TTS requiere acceso a red para descargar el voice pack de Kokoro-82M.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas por el autor frente a otros modelos. Como referencia orientativa, modelos omni multimodales de código abierto de rango similar (5-8B parámetros) incluyen Qwen2-VL-7B, Phi-3.5-vision e InternVL2-8B, pero no hay datos comparativos directos en la información proporcionada. La comparativa no está disponible.

## Limitaciones y advertencias

- Generación de imágenes no usable: el autor declara explícitamente que la generación de imágenes produce abstracciones pictóricas sin seguir el prompt; no debe usarse en producción.
- Comprensión de vídeo sin evaluar: la capacidad está entrenada pero no hay cifras de rendimiento; úsese con cautela.
- OCR en documentos reales limitado: 49.1% en PDFs escaneados; no fiable para páginas densas multi-columna.
- Caída inexplicada en VQAv2: de 65.2% a 57.2% en la etapa final, sin explicación publicada.
- Sesgos: no se proporciona información sobre evaluación de sesgos ni mitigaciones.
- Alucinación: no hay datos específicos; el riesgo es inherente a modelos de este tamaño.
- Rendimiento académico limitado: MMLU 47.8% y ARC-Challenge 53.8% son bajos comparados con modelos de tamaño similar; no es adecuado para tareas de razonamiento complejo.
- Repositorio sin mantenimiento verificado: el autor es un particular, sin respaldo institucional; la integridad de los shards se verifica en carga (carga estricta), pero no hay garantías de soporte.
- Requisitos de red para TTS: el primer uso de text-to-speech necesita descargar el voice pack de Kokoro-82M.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lucifer2006/Arcle-V1
- Perfil del autor: https://huggingface.co/Lucifer2006
- Repositorio de scripts de entrenamiento de demostración: https://github.com/lucifertkod/ArcleIntelligence---Demo-Training-Script-Only
