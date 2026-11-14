# Luciano-felix26/felix-qwen-0.5b

## Resumen

Félix 0.5B es un ajuste fino mediante LoRA sobre Qwen2.5-0.5B-Instruct, desarrollado por Luciano-felix26 dentro del proyecto GatoGPT. Se trata de un modelo conversacional en español rioplatense que adopta la personalidad de "Félix", un gato asistente, y está orientado a conversaciones sobre hardware (ESP32), tablets con Termux, modelos de IA y comandos de un bot. El modelo base aporta la arquitectura transformer decoder-only de Qwen2.5, con aproximadamente 494 millones de parámetros totales según los pesos en safetensors.

El ajuste LoRA emplea r=16, alpha=32 sobre las proyecciones q/k/v/o, lo que supone 2,16 millones de parámetros entrenables (0,44% del total). El entrenamiento se realizó sobre 113 conversaciones de entrenamiento y 15 de validación, durante 120 pasos y 674 segundos en una CPU de 2 vCPU, sin GPU. La pérdida de validación descendió de 3,08 en el paso 10 a 1,33 en el paso 120.

Su relevancia es limitada y de carácter demostrativo: el propio autor lo describe como una demo, no como un asistente fiable. Resulta útil como ejemplo de pipeline completo de fine-tuning LoRA reproducible en hardware modesto, y como caso de estudio de los límites de un modelo de 0,5B ajustado con un dataset muy reducido. No debe confundirse con un modelo de propósito general ni usarse para información técnica verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste LoRA sobre proyecciones q/k/v/o |
| Parametros totales | 494.032.768 (según safetensors); el autor cita 496M para el base |
| Parametros activos | No aplica (no es MoE); 2,16M parámetros entrenables en el adaptador LoRA (0,44%) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Qwen2.5-0.5B-Instruct, sin confirmar) |
| Tipos de cuantizacion | No disponible (el repo incluye safetensors y GGUF; no se detallan los tipos) |
| Idiomas soportados | Español (rioplatense) e inglés básico; otros idiomas no cubiertos |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA en `adapter/`) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. Sobre él se aplica un adaptador LoRA con rango 16 y alpha 32 en las proyecciones de atención q/k/v/o, generando 2,16 millones de parámetros entrenables. El pipeline completo está implementado en PyTorch dentro del repositorio `gatogpt-models`, con scripts `data.py` (dataset), `train_lora.py` (bucle de entrenamiento), `chat.py` (inferencia conversacional) y un `Modelfile` para Ollama.

Los datos de entrenamiento consisten en 113 conversaciones escritas a mano sobre el proyecto: ESP32, tablet con Termux, modelos de IA, código y comandos del bot, más 15 conversaciones de validación. El entrenamiento se ejecutó durante 120 pasos en 674 segundos sobre una CPU de 2 vCPU, sin GPU. No se menciona uso de RLHF, DPO ni decodificación especulativa. La pérdida de validación pasó de 3,08 (paso 10) a 1,33 (paso 120). El ajuste modifica estilo y formato, no incorpora conocimiento factual nuevo.

## Capacidades

- Generación de texto conversacional en español rioplatense con la personalidad de Félix.
- Reproducción del tono y formato de las respuestas típicas del proyecto GatoGPT (saludos, presentación, explicaciones breves).
- Conversación multi-turno básica sobre temas del proyecto: ESP32, Termux, modelos de IA y comandos del bot.
- Comprensión de inglés básico heredada del modelo base.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).
- No incorpora conocimiento factual nuevo más allá del prompt de sistema y los ejemplos de entrenamiento.

## Casos de uso

- Demo educativa de fine-tuning LoRA: sirve para ilustrar un pipeline completo (dataset, entrenamiento, adaptador, GGUF, Modelfile) reproducible en CPU de 2 vCPU, útil en cursos y talleres.
- Prototipo de personaje conversacional: permite validar el tono y el formato de un asistente con personalidad definida antes de invertir en un modelo mayor y un dataset real.
- Pruebas de integración con Ollama: el modelo se puede desplegar con `ollama run hf.co/Luciano-felix26/felix-qwen-0.5b` para verificar flujos de carga de adaptadores y GGUF en local.
- Ejemplo de despliegue en hardware muy limitado: al ser un modelo de 0,5B, cabe en entornos con poca memoria y sin GPU, lo que permite experimentar con inferencia en dispositivos modestos.
- Base para comparativas de escalado: útil para contrastar cualitativamente qué aporta un ajuste LoRA con 113 ejemplos frente a modelos de 1,5B a 3B con miles de conversaciones, como sugiere el propio autor.
- Referencia de evaluación de alucinación en modelos pequeños: sus respuestas plausibles pero falsas (por ejemplo, "corro en mi ESP32") lo convierten en un caso práctico para estudiar y medir alucinaciones en modelos de baja capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la pérdida de validación durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss de validación (paso 10) | 3,08 |
| Loss de validación (paso 120) | 1,33 |
| Pasos de entrenamiento | 120 |
| Tiempo de entrenamiento | 674 s en CPU de 2 vCPU |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño (494M parámetros), en FP16 rondaría 1 GB de pesos y en cuantizaciones de 4 bits aproximadamente 0,3-0,5 GB, si bien estas cifras no están confirmadas en la información proporcionada.
- GPU recomendadas: no disponible; el autor entrenó en CPU de 2 vCPU, lo que sugiere que la inferencia es viable sin GPU.
- Cabe en GPU de consumo: previsiblemente sí, en cualquier GPU con al menos 2 GB de VRAM, aunque no se documenta una lista concreta.
- Opciones de despliegue: Ollama (vía `Modelfile` o directamente desde el Hub), transformers con PEFT para cargar el adaptador LoRA, y GGUF (compatible con llama.cpp por el formato, aunque no se detalla).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Félix 0.5B | 494M (2,16M entrenables) | No disponible | Apache 2.0 | Hugging Face (safetensors, GGUF) | Fine-tuning LoRA con 113 conversaciones; demo |
| Qwen2.5-0.5B-Instruct | ~496M | No disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo base; capacidades generales sin personalidad Félix |
| Qwen2.5-1.5B-Instruct | No disponible en esta ficha | No disponible en esta ficha | Apache 2.0 | Hugging Face | Alternativa de mayor tamaño sugerida por el autor para una versión "seria" |
| Qwen2.5-3B-Instruct | No disponible en esta ficha | No disponible en esta ficha | Apache 2.0 | Hugging Face | Alternativa de mayor tamaño sugerida por el autor |

## Limitaciones y advertencias

- Es una demo, no un asistente fiable: 0,5B de parámetros y 113 ejemplos solo alcanzan para imitar el tono y las respuestas típicas.
- Alucinación elevada: varias respuestas suenan plausibles pero son falsas (por ejemplo, "corro en mi ESP32"). No debe usarse para datos técnicos, precios, versiones ni información verificable.
- No aprende hechos nuevos: el LoRA ajusta estilo y formato; el conocimiento del proyecto proviene del prompt de sistema y de los ejemplos.
- Cobertura lingüística limitada: español rioplatense e inglés básico; otros idiomas no están cubiertos.
- Sesgos: no se documentan sesgos específicos, pero al derivar de un modelo base y de un dataset muy reducido y escrito a mano, puede reproducir sesgos del base y del autor.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el propio autor desaconseja su uso en producción como asistente.
- Sin métricas de benchmarks publicadas: no hay evidencia cuantitativa de calidad más allá de la pérdida de validación.
- Contexto máximo no confirmado en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Luciano-felix26/felix-qwen-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio del pipeline de entrenamiento: https://github.com/luciano2-web/gatogpt-models
