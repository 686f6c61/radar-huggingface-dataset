# cogni-x/wearable-intelli-model

## Resumen

El modelo `cogni-x/wearable-intelli-model` es un ajuste fino del modelo base `google/gemma-3-270m-it`, desarrollado por la organización CogniX (cogni-x). Está diseñado específicamente para aplicaciones de salud y bienestar en dispositivos wearables, con un enfoque conversacional. Se trata de un modelo ligero de 268 millones de parámetros, entrenado con QLoRA y SFT (supervised fine-tuning), que se distribuye tanto en formato safetensors como GGUF, lo que facilita su despliegue en entornos con recursos limitados.

La relevancia de este modelo radica en su tamaño reducido, que permite su ejecución en dispositivos de borde como relojes inteligentes, pulseras de actividad o asistentes personales integrados en wearables, sin depender de conexión a la nube. Su licencia Apache 2.0 permite uso comercial sin restricciones, aunque el acceso al repositorio está actualmente restringido (gated), por lo que es necesario solicitar permiso al autor. El modelo se centra en tareas de generación de texto conversacional orientadas a salud y bienestar, aunque no se han publicado detalles específicos sobre el conjunto de datos de entrenamiento ni sus capacidades exactas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) |
| Parametros totales | 268.098.176 (268 M) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (precision no especificada), GGUF (varias cuantizaciones, no detalladas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3 de Google, un transformer decoder-only con atención local y global (alternancia de ventanas). El modelo base `google/gemma-3-270m-it` es la versión instruct de 270 millones de parámetros, optimizada para tareas de diálogo y seguimiento de instrucciones. Sobre esta base, CogniX ha aplicado un ajuste fino mediante QLoRA (cuantización de 4 bits con adaptadores de bajo rango) y posterior entrenamiento supervisado (SFT), orientado a dominios de salud y bienestar en dispositivos wearables.

No se dispone de información pública sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni las técnicas de alineación adicionales (como RLHF o DPO). Tampoco se detallan innovaciones técnicas propias más allá del uso de QLoRA y SFT. El modelo conserva las capacidades del modelo base de Gemma 3, que incluyen generación de texto multilingüe, razonamiento básico y soporte para tareas de conversación, aunque no se confirma si se han preservado todas las capacidades tras el ajuste.

## Capacidades

- Generación de texto conversacional: el modelo está ajustado para mantener diálogos naturales, probablemente en contextos de salud y bienestar.
- Soporte de instrucciones: al derivar de la versión instruct de Gemma 3, responde a comandos y preguntas de forma directa.
- Multilingüismo: el modelo base Gemma 3 soporta múltiples idiomas, pero no se confirma si el ajuste fino conserva esta capacidad.
- Eficiencia computacional: con solo 268 M de parámetros, es adecuado para inferencia en dispositivos con recursos limitados (CPU, GPU de baja potencia, edge devices).
- Formato GGUF: permite su uso con llama.cpp y ecosistemas compatibles (Ollama, LM Studio), facilitando despliegues en local.
- No se ha confirmado soporte para tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Asistente de salud en relojes inteligentes: el modelo puede gestionar conversaciones breves sobre actividad física, frecuencia cardíaca o recordatorios de hidratación, funcionando de forma local en el dispositivo sin conexión a internet.
- Registro de síntomas y bienestar diario: un wearable puede recoger descripciones verbales del usuario sobre su estado físico o anímico y el modelo las convierte en entradas estructuradas para una aplicación de seguimiento.
- Recordatorios de medicación personalizados: integrado en un dispositivo vestible, el modelo genera mensajes de aviso adaptados al contexto del usuario (hora, dosis, condiciones).
- Entrenamiento físico guiado: el modelo ofrece instrucciones conversacionales durante sesiones de ejercicio, respondiendo a preguntas sobre ritmo, repeticiones o técnica.
- Apoyo emocional básico: aunque no es un sustituto clínico, puede mantener conversaciones empáticas y sugerir técnicas de relajación o respiración en momentos de estrés.
- Interacción por voz con wearables: al ser un modelo de texto, puede combinarse con un sistema de reconocimiento de voz para permitir comandos hablados en dispositivos como auriculares o pulseras.
- Educación nutricional rápida: el modelo responde a consultas simples sobre alimentos, porciones o hábitos saludables, con respuestas generadas localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K para este modelo específico. Dado que se basa en Gemma 3 270M, se podrían estimar capacidades similares al modelo base, pero no se aportan mediciones propias.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP16 (268 M parámetros × 2 bytes ≈ 537 MB). Con cuantización GGUF de 4 bits, la huella se reduce a aproximadamente 140 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso iGPUs modernas). No requiere GPU de datacenter.
- CPU: es viable la inferencia en CPU moderna con cuantización GGUF, con latencias de pocos cientos de milisegundos por token.
- Despliegue en dispositivos embebidos: puede ejecutarse en plataformas como Raspberry Pi 5, Jetson Nano o microcontroladores con suficiente RAM (≥512 MB).
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte para modelos pequeños), text-generation-inference (TGI), o directamente con transformers de Hugging Face.
- Latencia esperada: en CPU de gama media con cuantización 4-bit, se estima un throughput de 20-40 tokens por segundo; en GPU dedicada, supera los 100 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| cogni-x/wearable-intelli-model | 268 M | no disponible | Apache 2.0 | Salud/bienestar en wearables |
| google/gemma-3-270m-it | 270 M | 32k (modelo base) | Gemma Terms of Use | Instrucción general |
| Qwen2.5-0.5B-Instruct | 500 M | 32k | Apache 2.0 | Instrucción general |
| Microsoft Phi-3-mini | 3.8 B | 128k | MIT | Razonamiento y código |

El modelo compite directamente con otros LLM pequeños de menos de 1 B de parámetros. Frente a Qwen2.5-0.5B, ofrece una base más reciente (Gemma 3) y está especializado en salud, pero carece de la documentación pública de Qwen. Frente a Phi-3-mini, es mucho más ligero y adecuado para dispositivos con restricciones severas de memoria, aunque con menor capacidad de razonamiento. La ventaja principal es su formato GGUF y su licencia permisiva.

## Limitaciones y advertencias

- Acceso restringido: el repositorio de Hugging Face está marcado como gated, por lo que es necesario solicitar acceso al autor antes de descargar los pesos.
- Sin datos de entrenamiento publicados: no se conoce la composición del dataset de ajuste, lo que impide evaluar posibles sesgos o desviaciones en dominios específicos.
- Riesgo de alucinación: al ser un modelo pequeño, puede generar respuestas plausibles pero incorrectas, especialmente en temas médicos o de salud. No debe utilizarse como herramienta de diagnóstico ni para decisiones clínicas.
- Cobertura idiomática incierta: aunque Gemma 3 es multilingüe, no se confirma si el ajuste fino conserva todas las lenguas del modelo base.
- Capacidades limitadas de razonamiento: con 268 M de parámetros, el modelo tiene dificultades para tareas complejas de lógica, matemáticas o código extenso.
- Sin soporte de herramientas: no se ha confirmado la capacidad de tool calling, lo que limita su integración en agentes o flujos que requieran llamadas a APIs.
- Documentación escasa: no hay papers, guías de uso ni ejemplos de despliegue oficiales más allá de la tarjeta del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cogni-x/wearable-intelli-model
- Repositorio de Cogni-OpenModel (modelo relacionado): https://huggingface.co/cogni-x/Cogni-OpenModel
- GitHub de CogniX-LTD/Cogni-OpenModel: https://github.com/CogniX-LTD/Cogni-OpenModel
- Sitio web de Cognix AI: https://www.cognixai.co/
