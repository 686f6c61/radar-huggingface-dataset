# AyanZaman19/jarvis-qwen-7b-gguf

## Resumen

JARVIS-Qwen-7B (GGUF) es un ajuste fino del modelo Qwen2.5-7B-Instruct orientado a funcionar como asistente de escritorio local. Lo desarrolla AyanZaman19 y está pensado específicamente para alimentar The J.A.R.V.I.S Notch, una aplicación de escritorio para Windows inspirada en la Dynamic Island que actúa como centro de comandos y asistente personal. El modelo hereda la arquitectura transformer decoder-only de Qwen2.5 y se distribuye cuantizado en formato GGUF Q4_K_M para inferencia local en GPUs de consumo.

El problema que aborda es el de disponer de un asistente conversacional con una persona concreta (directa, concisa, sin florituras) y con conocimiento de las acciones típicas de un asistente de escritorio: control multimedia, temporizadores, recordatorios, cambio de dispositivos de audio, resumen de archivos arrastrados y controles de privacidad de hardware. Frente a un modelo generalista, el ajuste busca respuestas breves y accionables adecuadas para una interfaz superpuesta en tiempo real.

El modelo tiene 7.615.616.512 parámetros totales, se distribuye bajo licencia Apache 2.0, soporta únicamente inglés según la model card y se publica en un repositorio de 4,7 GB con pesos GGUF. Es relevante para quienes quieren desplegar un asistente local sin dependencia de la nube y con un coste de hardware moderado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino QLoRA sobre Qwen2.5-7B-Instruct |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantización | GGUF Q4_K_M (único publicado) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); el adaptador se entrenó sobre base en bnb-4bit |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-7B-Instruct-bnb-4bit`, una versión cuantizada en 4 bits del Qwen2.5-7B-Instruct, y se ajusta mediante QLoRA con Unsloth y el `SFTTrainer` de Hugging Face `trl`. La configuración LoRA empleada es `r=16`, `lora_alpha=16` y módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, atención completa y capas MLP del transformer. Tras el ajuste, los pesos se exportan a GGUF con cuantización Q4_K_M (aproximadamente 4,5 GB).

Los datos de entrenamiento combinan un dataset propio, `AyanZaman19/jarvis-notch-dataset`, centrado en la persona J.A.R.V.I.S. y en flujos de trabajo del escritorio, con una porción de 500 ejemplos de `mlabonne/FineTome-100k` como mezcla de instrucciones generales. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset propio, ni si hubo fases de RLHF o DPO posteriores al SFT. Tampoco se documentan innovaciones técnicas adicionales más allá del uso de QLoRA y Unsloth para acelerar el ajuste.

## Capacidades

- Generación de texto conversacional con una persona concisa y directa, orientada a respuestas breves para una interfaz en vivo.
- Comprensión de comandos de control de escritorio: reproducción multimedia, letras en vivo, temporizadores Pomodoro, recordatorios y cambio de dispositivos de audio.
- Resumen de archivos arrastrados (file-drop summarization) según la model card.
- Conocimiento de indicadores de privacidad de hardware y flujos de trabajo del notch de Windows.
- Soporte de conversación multi-turno (pipeline `text-generation` y tag `conversational`).
- Capacidades generales de instrucción heredadas de Qwen2.5-7B-Instruct (razonamiento, código, matemáticas) según el modelo base, aunque no se documentan explícitamente para este ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este ajuste.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente de escritorio local en Windows: el modelo se integra en The J.A.R.V.I.S Notch vía LM Studio en `http://127.0.0.1:1234/v1` y gestiona comandos de control del sistema con respuestas cortas y accionables, adecuadas para una superposición en tiempo real.
- Control multimedia por voz o texto: interpreta peticiones como reproducir, pausar o cambiar de pista y devuelve confirmaciones breves, gracias a su ajuste específico en flujos de reproducción y letras en vivo.
- Gestión de productividad personal: temporizadores Pomodoro y recordatorios con respuestas concisas, lo que reduce la fricción en una interfaz de notificación persistente.
- Resumen rápido de documentos arrastrados: el modelo puede recibir el contenido de un archivo soltado en el notch y devolver un resumen breve, útil para triaje rápido de información.
- Automatización de tareas cotidianas del PC: cambio de dispositivos de audio, activación de indicadores de privacidad de hardware y otras acciones de sistema descritas en la model card.
- Despliegue local sin nube para privacidad: al ejecutarse con llama.cpp o LM Studio sobre hardware de consumo, permite mantener las conversaciones y los datos del escritorio en la máquina del usuario.
- Prototipado de asistentes con persona definida: sirve como base para experimentar con system prompts y ajustes de estilo en aplicaciones de escritorio, dado su formato GGUF listo para usar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 5-6 GB con la cuantización Q4_K_M publicada (archivo de aproximadamente 4,5 GB más overhead de contexto y KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM; también puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: LM Studio (documentado por el autor), llama.cpp y cualquier runtime compatible con GGUF; no se documenta soporte para vLLM o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| JARVIS-Qwen-7B (GGUF) | 7,6 B | no disponible | Apache 2.0 | GGUF Q4_K_M | Ajuste para asistente de escritorio, solo inglés |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (modelo base) | Apache 2.0 | safetensors, GGUF (comunidad) | Modelo generalista multilingüe del que deriva |
| Mistral-7B-Instruct | 7,2 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa generalista de tamaño similar |
| Llama 3.1 8B Instruct | 8,0 B | 131.072 tokens | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto, licencia con restricciones |

La comparación de rendimiento con benchmarks no está disponible para JARVIS-Qwen-7B, por lo que no es posible establecer diferencias cuantitativas frente a estas alternativas.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior al del modelo base.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente a Qwen2.5-7B-Instruct ni frente a otros ajustes.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente en tareas de conocimiento factual y en la ejecución de acciones del sistema si no hay validación externa.
- El ajuste está muy especializado en la persona J.A.R.V.I.S. y en los flujos del notch; puede degradar el rendimiento en tareas generales respecto al modelo base.
- Solo se publica la cuantización Q4_K_M; no hay versiones en safetensors del ajuste ni otras cuantizaciones (Q5, Q8, FP16) en la información disponible.
- La licencia Apache 2.0 permite uso comercial con atribución, pero conviene verificar las condiciones del dataset `mlabonne/FineTome-100k` y del dataset propio del autor antes de un despliegue en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-27) es posterior a la fecha actual habitual de consulta; conviene verificar la integridad y procedencia de los pesos antes de usarlos.
- No se documenta soporte de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AyanZaman19/jarvis-qwen-7b-gguf
- Dataset propio: https://huggingface.co/datasets/AyanZaman19/jarvis-notch-dataset
- Dataset de instrucciones generales: https://huggingface.co/datasets/mlabonne/FineTome-100k
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Aplicación companion: https://github.com/ayanzaman1818-cell/The-J.A.R.V.I.S-Notch
- Perfil del autor: https://huggingface.co/AyanZaman19
