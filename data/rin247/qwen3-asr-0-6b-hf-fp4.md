# Rin247/Qwen3-ASR-0.6B-hf-FP4

## Resumen

Rin247/Qwen3-ASR-0.6B-hf-FP4 es una cuantización FP4 *weight-only* del modelo original Qwen3-ASR-0.6B-hf, desarrollado por el equipo Qwen (Alibaba). El modelo base pertenece a la familia Qwen3-ASR, que incluye dos sistemas de reconocimiento automático del habla (ASR) de pequeño tamaño (0.6B y 1.7B parámetros) capaces de identificar idioma y transcribir audio en 52 lenguas y dialectos. Ambos modelos se apoyan en el modelo fundacional Qwen3-Omni y en un gran volumen de datos de habla para lograr un rendimiento destacado en ASR multilingüe.

Esta versión cuantizada en FP4 reduce el peso del modelo a aproximadamente 0.7 GB, lo que facilita su despliegue en entornos con recursos limitados, manteniendo la arquitectura y el comportamiento del modelo original a costa de una posible pérdida mínima de precisión. La cuantización se realizó mediante RTN (Round-to-Nearest) en CPU, almacenando escalas y formas junto a los pesos en formato safetensors. Es una opción interesante para desarrolladores que necesitan ASR multilingüe en dispositivos edge o con GPUs modestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3-Omni (modelo base Qwen3-ASR-0.6B-hf) |
| Parametros totales | 471.220.224 (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 weight-only (con escalas y formas almacenadas) |
| Idiomas soportados | 52 idiomas y dialectos (según el modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con buffers `*.weight_scale` y `*.weight_shape`) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-0.6B-hf es un modelo de reconocimiento de habla basado en la arquitectura de Qwen3-Omni, que combina un codificador de audio con un decodificador de lenguaje. Se entrenó con un gran corpus de datos de habla multilingüe y aprovecha las capacidades de comprensión auditiva de su modelo fundacional. No se dispone de detalles específicos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO en la información proporcionada.

La cuantización FP4 aplicada en esta versión conserva los pesos en precisión de 4 bits, con escalas y formas almacenadas por separado para permitir la de-cuantización durante la inferencia. El proceso se realizó con RTN en CPU, un método simple que no requiere calibración con datos. Esto implica que la precisión puede degradarse ligeramente respecto al modelo original, aunque en tareas de ASR suele ser aceptable para muchos casos de uso.

## Capacidades

- Transcripción de voz a texto (ASR) en 52 idiomas y dialectos.
- Identificación de idioma (language identification) integrada en el proceso de reconocimiento.
- Procesamiento de audio de entrada, con salida de texto transcrito.
- Capacidad de operar en entornos con recursos limitados gracias a la cuantización FP4 (peso reducido).
- No se documentan capacidades adicionales como *tool calling*, razonamiento multi-paso o generación de código, ya que es un modelo especializado en ASR.
- Soporte multilingüe amplio, cubriendo lenguas y dialectos de distintas familias lingüísticas.

## Casos de uso

- Transcripción de reuniones y videollamadas: el modelo puede procesar audio en tiempo real o diferido para generar actas textuales, aprovechando su soporte multilingüe para equipos internacionales.
- Subtitulado automático de vídeos: ideal para plataformas de contenido o herramientas de edición, convirtiendo pistas de audio en subtítulos en varios idiomas.
- Asistentes de voz para dispositivos embebidos: su pequeño tamaño (0.7 GB) permite ejecutarlo en hardware de baja potencia, como Raspberry Pi o smartphones, para comandos de voz.
- Análisis de llamadas de atención al cliente: transcripción de conversaciones para búsqueda de palabras clave, análisis de sentimiento o generación de resúmenes.
- Accesibilidad para personas con discapacidad auditiva: conversión de audio en texto en tiempo real en aplicaciones móviles o de escritorio.
- Sistemas de documentación médica o legal: transcripción de dictados o grabaciones en entornos donde se requiere alta precisión y confidencialidad, aunque se debe validar la calidad de la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización FP4 en la información disponible. El informe técnico del modelo base (arXiv:2601.21337) menciona que la versión de 1.7B alcanza un rendimiento de vanguardia entre los modelos ASR de código abierto, pero no se proporcionan números concretos para la versión de 0.6B ni para esta versión cuantizada.

## Requisitos de hardware

- VRAM estimada: con 471M parámetros en FP4, el peso del modelo ocupa aproximadamente 240 MB, por lo que la VRAM necesaria para inferencia sería inferior a 1 GB (incluyendo overhead de activaciones y buffers).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM puede ejecutarlo sin problemas; tarjetas como la NVIDIA GTX 1650, RTX 2060 o superiores son suficientes. También es viable en Apple Silicon o CPUs con instrucciones AVX.
- Compatible con GPUs de consumo: sí, es perfectamente viable en hardware de gama baja.
- Opciones de despliegue: dado que los pesos están en formato safetensors con cuantización FP4 custom, se requiere un script de de-cuantización o un motor que soporte este formato. No se mencionan integraciones directas con vLLM, llama.cpp u Ollama; probablemente sea necesario adaptar el cargador.
- Latencia y throughput: no se dispone de datos medidos; al ser un modelo pequeño, se espera una latencia baja (del orden de decenas de milisegundos por utterance en GPU), pero depende del hardware y de la implementación.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Como referencia, el modelo base Qwen3-ASR-0.6B-hf compite con otros ASR multilingües como Whisper (openai/whisper-small, ~244M parámetros) o Parakeet (NVIDIA), pero sin números concretos de benchmarks no es posible establecer una comparación cuantitativa. La ventaja principal de esta versión es su tamaño reducido y la cuantización FP4, que la hace especialmente ligera.

## Limitaciones y advertencias

- La cuantización FP4 puede degradar la precisión del reconocimiento en comparación con el modelo original en FP16/FP32, especialmente en audio con ruido o acentos poco comunes.
- No se especifica la licencia del modelo cuantizado ni del modelo base; es necesario verificar los términos de uso antes de un despliegue comercial.
- Los pesos requieren un proceso de de-cuantización manual con los buffers de escala y forma; no es un formato estándar soportado por los frameworks habituales sin adaptación.
- El modelo base solo cubre ASR e identificación de idioma; no realiza otras tareas como traducción o generación de texto.
- La información sobre el contexto máximo de audio procesado no está disponible; se debe probar con secuencias largas para evitar pérdidas de rendimiento.
- No se han publicado resultados de evaluación sobre sesgos o alucinaciones en la transcripción; se recomienda validar en dominios específicos.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/Rin247/Qwen3-ASR-0.6B-hf-FP4
- Repositorio oficial de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Informe técnico en arXiv: https://arxiv.org/html/2601.21337
- Página del modelo base en Inferix: https://inferix.co/models/Qwen/Qwen3-ASR-0.6B-hf
