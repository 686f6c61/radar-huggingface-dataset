# openbmb/MiniCPM-o-2_6

## Resumen

MiniCPM-o 2.6 es un modelo omni-modal de última generación desarrollado por OpenBMB, diseñado para procesar y generar texto, imagen, audio y video de forma integrada. Con un total de 8.67 mil millones de parámetros, combina cuatro componentes preentrenados: SigLip-400M para visión, Whisper-medium-300M para audio, ChatTTS-200M para síntesis de voz y Qwen2.5-7B como base de lenguaje. El modelo se entrena de extremo a extremo, lo que permite explotar sinergias entre modalidades y alcanzar un rendimiento comparable a GPT-4o en tareas de visión y conversación de voz en tiempo real.

Su relevancia actual radica en tres aspectos: ofrece capacidades de streaming multimodal en vivo (video y audio continuos) con interacción de voz en tiempo real, supera a modelos propietarios como GPT-4o y Claude 3.5 Sonnet en benchmarks específicos de visión y OCR, y es lo suficientemente eficiente para ejecutarse en dispositivos de borde como un iPad gracias a su baja densidad de tokens visuales (640 tokens por imagen de 1.8M píxeles). Además, se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | End-to-end multimodal (SigLip-400M + Whisper-medium-300M + ChatTTS-200M + Qwen2.5-7B) |
| Parametros totales | 8.674.997.028 (8.67B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (soporta imágenes de hasta 1.8M píxeles, p.ej. 1344x1344) |
| Tipos de cuantizacion | int4, GGUF (16 tamaños disponibles) |
| Idiomas soportados | Multilingüe (más de 30 idiomas en texto); conversación de voz bilingüe (inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, int4 |

## Arquitectura y entrenamiento

MiniCPM-o 2.6 adopta una arquitectura end-to-end que conecta encoders y decoders especializados: SigLip-400M para visión, Whisper-medium-300M para reconocimiento de audio, ChatTTS-200M para síntesis de voz y Qwen2.5-7B como modelo de lenguaje base. Esta integración permite que las señales multimodales se procesen de forma conjunta, mejorando la coherencia entre modalidades. El modelo incorpora un mecanismo de streaming en tiempo real que convierte los encoders/decoders offline en versiones online, habilitando la entrada continua de video y audio sin necesidad de consultas del usuario.

El entrenamiento se basa en técnicas de alineación como RLAIF-V (Reinforcement Learning from AI Feedback for Vision), que se aplicó sobre el dataset openbmb/RLAIF-V-Dataset, y también utiliza la metodología VisCPM. Estos enfoques buscan reducir alucinaciones y mejorar la fiabilidad de las respuestas. No se han publicado detalles sobre el número total de tokens de entrenamiento ni la composición exacta del corpus, pero el modelo demuestra un rendimiento sólido en tareas de razonamiento multimodal, OCR y comprensión de contexto largo en video.

## Capacidades

- Generación de texto y razonamiento multimodal: comprende y responde sobre imágenes individuales, múltiples imágenes y secuencias de video.
- Reconocimiento de voz (ASR) y traducción de voz a texto (STT): supera a GPT-4o-realtime en tareas de audio.
- Síntesis de voz (TTS) con control de emoción, velocidad y estilo; soporta clonación de voz de extremo a extremo.
- Conversación de voz en tiempo real bilingüe (inglés y chino) con voces configurables.
- Streaming multimodal en vivo: acepta flujos continuos de video y audio, y permite interacción de voz simultánea.
- OCR de alta calidad: estado del arte en OCRBench para modelos menores de 25B, superando a GPT-4o-202405.
- Procesamiento de imágenes con cualquier relación de aspecto y hasta 1.8M píxeles, generando solo 640 tokens visuales (75% menos que la mayoría de modelos).
- Capacidades multilingües en más de 30 idiomas para tareas de texto e imagen.
- Aprendizaje en contexto (in-context learning) para tareas de visión y lenguaje.

## Casos de uso

- Atención al cliente multimodal en tiempo real: el modelo puede gestionar videollamadas o chats con voz, comprendiendo tanto el lenguaje hablado como el contexto visual (por ejemplo, mostrar un producto defectuoso). Su capacidad de streaming continuo permite respuestas inmediatas sin esperar a que el usuario termine de hablar.
- Transcripción y traducción automática de reuniones: gracias a su ASR y STT de alta calidad, puede transcribir conversaciones en inglés y chino, traducirlas al vuelo y generar resúmenes textuales, útil para entornos corporativos multilingües.
- Digitalización de documentos con OCR: su rendimiento superior en OCRBench lo hace adecuado para extraer texto de imágenes de alta resolución, facturas, formularios o capturas de pantalla, integrándose en flujos de automatización documental.
- Asistentes educativos interactivos: puede actuar como tutor que ve el material del estudiante (fotos de ejercicios) y escucha sus preguntas, respondiendo con voz y texto, ideal para plataformas de aprendizaje en línea.
- Creación de contenido multimedia con clonación de voz: permite generar doblajes o narraciones personalizadas a partir de una muestra de voz, controlando emoción y estilo, para producción de podcasts, audiolibros o videos.
- Monitorización de video en tiempo real: su capacidad de streaming de video y audio permite analizar cámaras de seguridad o transmisiones en vivo, detectando eventos y respondiendo con alertas de voz, útil en domótica o vigilancia ligera.
- Asistencia a personas con discapacidad visual: el modelo puede describir el entorno a través de la cámara del móvil y responder a preguntas habladas, facilitando la navegación y el reconocimiento de objetos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos detallados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Sin embargo, la model card reporta los siguientes resultados cualitativos:

| Benchmark | Resultado |
|---|---|
| OpenCompass (promedio de 8 benchmarks) | 70.2 puntos; supera a GPT-4o-202405, Gemini 1.5 Pro y Claude 3.5 Sonnet en imagen única |
| OCRBench (modelos <25B) | Estado del arte; supera a GPT-4o-202405 |
| MMHal-Bench (fiabilidad) | Supera a GPT-4o y Claude 3.5 Sonnet |
| StreamingBench (video y audio en tiempo real) | Supera a GPT-4o-202408 y Claude 3.5 Sonnet; estado del arte en código abierto |

Estos datos provienen de las afirmaciones del autor y no se acompañan de métricas numéricas desglosadas en la documentación consultada.

## Requisitos de hardware

- VRAM estimada: no se proporcionan cifras oficiales. Con 8.67B parámetros, una cuantización int4 requeriría aproximadamente 4.5-5 GB de VRAM, mientras que la versión GGUF Q4 podría ocupar alrededor de 5 GB. Para la versión completa en fp16 se necesitarían unos 17 GB.
- GPU recomendadas: se puede ejecutar en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 o superiores con cuantización. Para inferencia sin cuantizar se recomienda una GPU con al menos 24 GB (RTX 3090/4090 o A100).
- Compatibilidad con dispositivos de borde: el modelo se ha demostrado funcionando en iPad, lo que indica que es viable en hardware con recursos limitados.
- Opciones de despliegue: vLLM para alta productividad, llama.cpp para inferencia eficiente en CPU, Ollama (repositorio oficial disponible), y soporte para fine-tuning con LLaMA-Factory.
- Latencia y throughput: no se han publicado datos concretos, pero la baja densidad de tokens visuales (640 tokens por imagen de 1.8M píxeles) reduce el tiempo de primer token y el uso de memoria en comparación con modelos similares.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-o 2.6 | 8.67B | No disponible (imágenes hasta 1.8M píxeles) | Supera a GPT-4o-202405 en OpenCompass | Apache 2.0 | Abierto (safetensors, GGUF, int4) |
| GPT-4o (propietario) | No publicado | 128k tokens (aprox.) | Referencia de mercado | Propietaria | API de pago |
| Claude 3.5 Sonnet (propietario) | No publicado | 200k tokens | Competitivo en visión | Propietaria | API de pago |
| MiniCPM-V 2.6 (versión anterior) | 8B | No disponible | Inferior a MiniCPM-o 2.6 | Apache 2.0 | Abierto |
| Qwen2.5-7B (base) | 7.6B | 32k tokens | Solo texto | Apache 2.0 | Abierto |

La comparación con GPT-4o y Claude 3.5 Sonnet es cualitativa según las afirmaciones del autor; no hay datos numéricos públicos para verificación independiente.

## Limitaciones y advertencias

- La conversación de voz en tiempo real solo está disponible en inglés y chino, aunque el texto y la visión soportan más de 30 idiomas. Esto limita su uso en entornos multilingües de voz.
- No se han documentado sesgos específicos del modelo, pero al estar entrenado sobre datos web, puede heredar sesgos sociales y culturales. Se recomienda evaluación adicional antes de desplegarlo en entornos sensibles.
- Riesgo de alucinaciones en tareas complejas de razonamiento multimodal, a pesar de las mejoras con RLAIF-V. Se recomienda verificación humana en aplicaciones críticas.
- La longitud de contexto de texto no está especificada; el modelo está optimizado para imágenes de alta resolución y streaming, pero puede tener limitaciones en conversaciones de texto muy largas.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo depende de componentes con licencias propias (Whisper, ChatTTS) que pueden tener restricciones adicionales; se debe revisar cada componente antes de uso comercial.
- Para streaming en tiempo real, la latencia depende del hardware; en dispositivos de gama baja puede no ser fluido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM-o-2_6
- Repositorio GitHub oficial: https://github.com/OpenBMB/MiniCPM-o
- Blog técnico (informe del modelo): https://openbmb.notion.site/MiniCPM-o-2-6-A-GPT-4o-Level-MLLM-for-Vision-Speech-and-Multimodal-Live-Streaming-on-Your-Phone-185ede1b7a558042b5d5e45e6b237da9
- Demo online: https://minicpm-omni-webdemo-us.modelbest.cn
- Paper de RLAIF-V (técnica de alineación): https://arxiv.org/abs/2405.17220
- Repositorio de RLAIF-V en GitHub: https://github.com/RLHF-V/RLAIF-V
- Dataset de RLAIF-V: https://huggingface.co/datasets/openbmb/RLAIF-V-Dataset
- Repositorio Ollama del modelo: https://ollama.com/openbmb/minicpm-o2.6
