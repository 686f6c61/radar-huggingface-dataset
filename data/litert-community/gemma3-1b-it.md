# litert-community/Gemma3-1B-IT

## Resumen

Gemma3-1B-IT es la conversión al formato LiteRT-LM (anteriormente TensorFlow Lite) del modelo Gemma 3 de 1.000 millones de parámetros en su variante instruida, publicada por el colectivo `litert-community` a partir del modelo original `google/Gemma-3-1B-IT`. El objetivo no es ofrecer un modelo nuevo, sino empaquetar los pesos de Google en un formato optimizado para inferencia en dispositivo (on-device), lo que permite ejecutar el modelo en CPU, GPU o aceleradores NPU de móviles, portátiles y dispositivos embebidos con requisitos de memoria muy bajos.

La relevancia de esta ficha radica en que Gemma 3 1B es el eslabón más pequeño de la familia Gemma 3 de Google, diseñado explícitamente para despliegues con recursos limitados. Al estar disponible en LiteRT-LM, se convierte en una opción práctica para aplicaciones de chat, asistentes locales y prototipos de agentes que no pueden depender de una API en la nube. El repositorio ocupa 60,8 GB porque incluye múltiples variantes de cuantización y artefactos de conversión, no porque el modelo en sí tenga ese tamaño.

El modelo está sujeto a la licencia Gemma de Google y el acceso al repositorio está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo. La librería asociada es `litert-lm`, lo que condiciona las herramientas de despliegue disponibles frente a otras variantes del mismo modelo en formato GGUF o safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3) |
| Parametros totales | 1.000 millones (1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en detalle; el repositorio incluye artefactos LiteRT-LM (int8/int4 presumiblemente, sin confirmar) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Gemma 3 es multilingue, pero no se detalla en esta ficha) |
| Licencia | Gemma (licencia de Google, con terminos de uso) |
| Formato de pesos | LiteRT-LM (`.tflite` / artefactos LiteRT), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es `google/Gemma-3-1B-IT`, un transformer decoder-only de 1.000 millones de parámetros perteneciente a la familia Gemma 3 de Google. La variante IT (instruction-tuned) ha sido ajustada para seguir instrucciones y mantener conversaciones de chat, partiendo del modelo base preentrenado. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el ajuste.

La contribución específica de este repositorio es la conversión de los pesos a LiteRT-LM, el formato de Google para inferencia en dispositivo. Esta conversión implica una reescritura del grafo computacional y, típicamente, una cuantización para reducir el tamaño y acelerar la ejecución en hardware de consumo. No se detalla en la información disponible qué técnicas de optimización concretas (cuantización post-entrenamiento, destilación, etc.) se aplicaron ni si se preservan todas las capacidades del modelo original.

## Capacidades

- Generación de texto y conversación multi-turno en modo chat (pipeline `text-generation`, tag `chat`).
- Seguimiento de instrucciones gracias al ajuste IT del modelo base.
- Razonamiento básico y respuesta a preguntas, limitado por el tamaño de 1B parámetros.
- Capacidades multilingües heredadas del modelo base Gemma 3 (sin confirmar en esta conversión).
- Ejecución en dispositivo mediante LiteRT-LM, sin necesidad de servidor.
- No se confirma en la información disponible soporte de tool calling, function calling, agentes multi-paso, visión ni modo thinking.

## Casos de uso

- Asistentes de chat locales en móviles y portátiles: el modelo, al estar en formato LiteRT-LM, puede ejecutarse en CPU/GPU de dispositivos de consumo sin conexión, gestionando conversaciones multi-turno con un consumo de memoria reducido propio de un modelo de 1B parámetros.
- Prototipado rápido de aplicaciones de IA generativa: permite validar flujos de chat y prompts en local antes de migrar a un modelo mayor, con la ventaja de que el formato LiteRT-LM ya está optimizado para el despliegue final.
- Aplicaciones de privacidad estricta: al ejecutarse on-device, los datos del usuario no salen del dispositivo, lo que lo hace adecuado para asistentes de salud, finanzas personales o herramientas internas con requisitos de confidencialidad.
- Automatización de tareas de texto sencillas en entornos embebidos: resúmenes cortos, clasificación de texto, extracción de entidades o generación de respuestas plantilla en dispositivos con recursos limitados.
- Educación y demos offline: permite mostrar el funcionamiento de un LLM en ferias, aulas o entornos sin conectividad, con un modelo de tamaño manejable.
- Filtrado y preprocesado en pipelines Edge: el modelo puede actuar como primera etapa de un sistema mayor (por ejemplo, reformular consultas o generar borradores) antes de enviar el resultado a un modelo más grande en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 1B parámetros, la inferencia en cuantización int8 requiere del orden de 1-2 GB de memoria; en int4, por debajo de 1 GB. Estas cifras son estimaciones basadas en el tamaño del modelo, no datos confirmados para esta conversión concreta.
- GPU recomendadas: el formato LiteRT-LM está pensado para GPU integradas y aceleradores de móvil (Adreno, Mali, Apple GPU) y NPU; también puede ejecutarse en CPU. Para servidores, una GPU consumer como RTX 3060 o superior es más que suficiente, aunque el formato no está optimizado para despliegues de datacenter.
- Cabe en cualquier GPU consumer actual e incluso en dispositivos móviles de gama media-alta.
- Opciones de despliegue: LiteRT-LM (librería nativa del repositorio). No se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que los pesos no están en safetensors ni GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gemma3-1B-IT (este repo, LiteRT-LM) | 1B | no disponible | Gemma | LiteRT-LM | Gated en HF |
| google/Gemma-3-1B-IT (original) | 1B | no disponible | Gemma | safetensors | Gated en HF |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (según documentación pública) | Apache 2.0 | safetensors, GGUF | Abierto |
| Llama-3.2-1B-Instruct | 1,2B | 128K (según documentación pública) | Llama 3.2 Community | safetensors, GGUF | Gated en HF |

La comparativa se limita a datos públicos de los modelos citados; no se dispone de benchmarks comparativos en la información proporcionada para esta conversión concreta.

## Limitaciones y advertencias

- El acceso al repositorio está restringido (gated): es obligatorio aceptar las condiciones de la licencia Gemma en Hugging Face antes de la descarga.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos completos antes de un despliegue en producción.
- Un modelo de 1B parámetros tiene una capacidad de razonamiento limitada y una propensión alta a la alucinación en tareas complejas; no es adecuado para aplicaciones que requieran precisión factual estricta sin verificación.
- No se dispone de información sobre sesgos específicos de esta conversión; los sesgos del modelo base Gemma 3 pueden persistir.
- El formato LiteRT-LM limita las herramientas de despliegue disponibles: no es compatible de forma directa con ecosistemas como llama.cpp u Ollama.
- No se confirma el soporte multilingüe ni la longitud de contexto en esta conversión; deben validarse empíricamente antes de usarla en producción.
- El tamaño del repositorio (60,8 GB) incluye múltiples artefactos; la descarga completa puede ser costosa en almacenamiento y ancho de banda.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Gemma3-1B-IT
- Modelo base: https://huggingface.co/google/Gemma-3-1B-IT
- Licencia Gemma: https://ai.google.dev/gemma/terms
