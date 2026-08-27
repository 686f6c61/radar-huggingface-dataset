# litert-community/Nemotron-3-Nano-4B

## Resumen

Nemotron-3-Nano-4B es un modelo de lenguaje compacto de NVIDIA, diseñado para razonamiento y aplicaciones de IA agéntica en el borde (edge). Esta ficha describe la conversión realizada por la comunidad `litert-community` al formato **LiteRT-LM** (`.litertlm`), un runtime de Google para inferencia en dispositivo (on-device) con aceleración por GPU mediante WebGPU. Es, según los autores, la primera conversión de Nemotron-3-Nano a este formato.

El modelo original combina una arquitectura híbrida de tres tipos de capas: 21 capas Mamba2 de selective-scan, 17 capas MLP y 4 capas de atención grouped-query attention (GQA), sumando 42 capas en total. Esta combinación permite mantener un estado de memoria casi constante con la longitud de contexto, ya que solo las 4 capas de atención mantienen caché KV (con un presupuesto de 4096 tokens), mientras que las capas Mamba2 usan estado de tamaño fijo. Es un modelo de razonamiento que genera un bloque ` thinking` antes de la respuesta final, siguiendo el formato ChatML.

La relevancia de esta conversión radica en que permite ejecutar un modelo de razonamiento de 4B parámetros en dispositivos con recursos limitados, con rendimiento medido en Apple M4 Max: 83 tokens/s de decodificación en GPU y 22,7 tokens/s en CPU. La licencia es la NVIDIA Nemotron Open Model License, con restricciones específicas para uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2 (21 capas) + MLP (17 capas) + GQA (4 capas), 42 capas en total |
| Parametros totales | 4,0 mil millones (4B) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (presupuesto KV en capas de atención) |
| Tipos de cuantizacion | int8 dinámico en lineales y embedding; convoluciones y selective-scan en float32 |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | LiteRT-LM (`.litertlm`), safetensors en el repo original |

## Arquitectura y entrenamiento

El modelo base es `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, desarrollado por NVIDIA. La arquitectura es un híbrido de tres tipos de capas: **Mamba2 selective-scan** (21 capas), **MLP puros** (17 capas) y **grouped-query attention** (4 capas). Esta combinación reduce el coste de memoria con la longitud de contexto, ya que solo las capas de atención mantienen KV cache (4096 tokens), las capas Mamba2 mantienen un estado de tamaño constante (conv + SSM) y las MLP no mantienen estado. El modelo usa embeddings no compartidos, vocab de 131.072, hidden de 3136, 40 query heads y 8 KV heads, con 96 heads Mamba de dimensión 80.

El entrenamiento del modelo original no está detallado en la información proporcionada, pero se describe como un modelo de razonamiento con formato ChatML y generación de bloques ` thinking`. La conversión a LiteRT-LM se realizó con `litert-torch` y un parche para el caché híbrido, y el modelo convertido incluye el tokenizador y la plantilla de chat original. La cuantización int8 se aplica solo a lineales y embedding, manteniendo las convoluciones y el selective-scan en float32 para preservar la estabilidad numérica.

## Capacidades

- Generación de texto con formato de razonamiento: responde tras un bloque ` thinking` (modo razonamiento).
- Razonamiento multi-step y agentic: diseñado para tareas de agente, con soporte de formato ChatML.
- Generación de código: no se especifica en la información, pero se asume por la naturaleza del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no se menciona explícitamente, pero la arquitectura de razonamiento sugiere soporte para flujos de agente.
- Inferencia en dispositivo (on-device) con LiteRT-LM, compatible con CPU y GPU (WebGPU).

## Casos de uso

- **Asistentes de voz locales**: el modelo puede gestionar conversaciones multi-turno con bajo consumo de memoria, adecuado para dispositivos con recursos limitados.
- **IA en juegos (NPCs)**: sirve para generar respuestas de personajes no jugables en tiempo real, con razonamiento integrado.
- **Automatización de IoT**: puede procesar comandos y tomar decisiones en dispositivos de borde sin conexión a la nube.
- **Generación de código en local**: con soporte de razonamiento, puede generar y explicar código en entornos sin GPU potente.
- **Chatbots de atención al cliente**: con la ventana de 4096 tokens, puede manejar conversaciones de longitud media en dispositivos embebidos.
- **Traducción y tareas factuales**: el modelo responde correctamente a preguntas de traducción y hechos en pruebas de verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Sin embargo, se midieron métricas de rendimiento de inferencia en la conversión LiteRT-LM (Apple M4 Max, litert-lm 0.16.0):

| Backend | Prefill (256 tokens) | Decode | TTFT |
|---|---|---|---|
| GPU (WebGPU, `--cache no`) | 803 / 792 tok/s | 83,3 / 82,4 tok/s | 0,33 s |
| CPU | 99,6 / 113,3 tok/s | 22,7 / 22,5 tok/s | 2,64 / 2,30 s |

Se realizó una prueba de verificación de 8 preguntas: 7/8 correctas en CPU y 8/8 en GPU. Los resultados de CPU varían porque el host no estaba inactivo durante las pruebas.

## Requisitos de hardware

- **VRAM estimada**: el archivo `.litertlm` ocupa 4,13 GB; se requiere al menos 8 GB de memoria para cargar el modelo en GPU.
- **GPU recomendadas**: Apple M4 Max (medido), GPUs compatibles con WebGPU en el runtime LiteRT-LM. Se espera que funcione en GPUs de NVIDIA con soporte WebGPU.
- **Dispositivos móviles**: no se ha probado en teléfonos; un modelo similar (Nemotron-H-4B) no cabía en un teléfono Android de 8 GB, por lo que se espera que requiera dispositivos con más RAM.
- **Opciones de despliegue**: LiteRT-LM runtime, con `litert-lm run` para CPU y GPU (WebGPU). No se menciona vLLM, llama.cpp u Ollama para esta conversión específica, pero el modelo original se puede servir con llama.cpp en Jetson (según el blog de NVIDIA).
- **Latencia y throughput**: en GPU, prefill de 256 tokens a ~800 tok/s y decodificación a ~83 tok/s; en CPU, ~100 tok/s prefill y ~22,7 tok/s decode.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Nemotron-3-Nano-4B (LiteRT)** | Híbrida Mamba-Transformer | 4B | 4096 (KV) | NVIDIA Open Model | LiteRT-LM, Hugging Face |
| **Nemotron-H-4B-Instruct-128K** | Híbrida Mamba-Transformer | 4B | 128K | NVIDIA Open Model | Hugging Face (no LiteRT) |
| **Nemotron-3-Nano-4B (original)** | Híbrida Mamba-Transformer | 4B | no disponible | NVIDIA Open Model | Hugging Face, safetensors |

La comparativa se basa en la información disponible; no se dispone de datos de rendimiento estándar para comparar.

## Limitaciones y advertencias

- **Sesgos y alucinación**: no se han evaluado sesgos específicos, pero como modelo de razonamiento puede generar respuestas con errores factuales si el contexto es insuficiente.
- **Riesgo de alucinación**: en las pruebas de verificación, falla en un ítem de rima (responde "violetas son moradas" en lugar de "azul" en CPU).
- **Limitaciones de contexto**: la ventana de 4096 tokens es corta para tareas de contexto largo; el modelo no está diseñado para documentos extensos.
- **Limitaciones de idioma**: no se dispone de información sobre idiomas soportados; se asume que funciona principalmente en inglés.
- **Restricciones de licencia**: la NVIDIA Nemotron Open Model License tiene términos específicos para uso comercial; revisar la licencia completa.
- **Problemas de compatibilidad**: en GPU, el caché de gráficos compilados de LiteRT-LM produce errores de WebGPU; se requiere `--cache no` para funcionar correctamente.
- **No probado en teléfonos**: el modelo no se ha medido en dispositivos móviles; se espera que no quepa en un teléfono de 8 GB RAM.

## Enlaces

- Modelo LiteRT-LM: https://huggingface.co/litert-community/Nemotron-3-Nano-4B
- Modelo original de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Blog de NVIDIA sobre Nemotron 3 Nano: https://huggingface.co/blog/nvidia/nemotron-3-nano-4b
- Página de investigación de NVIDIA Nemotron 3: https://research.nvidia.com/labs/nemotron/Nemotron-3/
- GitHub de conversión (hf-to-litertlm): https://github.com/john-rocky/hf-to-litertlm
- Guía de NVIDIA Jetson para Nemotron3 Nano: https://github.com/NVIDIA-AI-IOT/jetson-ai-lab/blob/main/src/content/models/nemotron3-nano-4b.md
- Licencia NVIDIA Nemotron Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/## Resumen

Nemotron-3-Nano-4B es un modelo de lenguaje pequeño de NVIDIA, diseñado para la familia Nemotron 3 con un enfoque en eficiencia y razonamiento para aplicaciones de IA agéntica en el borde. Esta ficha cubre la conversión realizada por la comunidad `litert-community` al formato **LiteRT-LM** (`.litertlm`), un runtime de Google para inferencia en dispositivo con aceleración WebGPU. Según los autores, es la primera conversión de Nemotron-3-Nano a este formato, pensada para ejecutarse en hardware con recursos limitados.

El modelo original combina una arquitectura híbrida de tres tipos de capas: 21 capas Mamba2 de selective-scan, 17 capas MLP y 4 capas de atención grouped-query attention (GQA), sumando 42 capas en total. Esta hibridación permite que la memoria permanezca casi constante con la longitud de contexto, ya que solo las 4 capas de atención mantienen caché KV (con un presupuesto de 4096 tokens), mientras que las capas Mamba2 usan un estado de tamaño fijo y las MLP no mantienen estado. El modelo es de razonamiento: genera un bloque ` thinking` antes de la respuesta final, siguiendo el formato ChatML.

La relevancia de esta conversión radica en que facilita el despliegue de un modelo de razonamiento de 4B en dispositivos de borde (edge) y en el navegador, con rendimiento medido en Apple M4 Max: 83,3 tokens/s de decodificación en GPU y 22,7 tokens/s en CPU. La licencia es la NVIDIA Nemotron Open Model License, con restricciones específicas para uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-Transformer (21 capas Mamba2 + 17 MLP + 4 GQA), 42 capas |
| Parametros totales | 4,0 mil millones (4B) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (presupuesto KV en capas de atención) |
| Tipos de cuantizacion | int8 dinámico en lineales y embedding; convoluciones y selective-scan en float32 |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | LiteRT-LM (`.litertlm`) |

## Arquitectura y entrenamiento

La arquitectura del modelo original de NVIDIA es un híbrido de tres tipos de capas: 21 capas Mamba2 de selective-scan, 17 capas MLP y 4 capas de grouped-query attention, con un total de 42 capas. Esta combinación reduce la memoria de estado: las capas Mamba2 mantienen un estado de tamaño constante (conv + SSM), las capas MLP no mantienen estado y solo las 4 capas de atención mantienen KV cache, con un presupuesto de 4096 tokens. La geometría incluye un hidden size de 3136, 40 query heads y 8 KV heads, 96 heads Mamba2 de dimensión 80, un vocab de 131.072 tokens y embeddings no compartidos.

El entrenamiento del modelo original no está detallado en la información proporcionada, pero se describe como un modelo de razonamiento con formato ChatML y generación de turnos ` thinking`. La conversión a LiteRT-LM se realizó con `litert-torch` y un parche de caché híbrido, y el archivo resultante incluye el tokenizador y la plantilla de chat original. La cuantización int8 se aplica solo a lineales y embedding, mientras que las convoluciones y el selective-scan se mantienen en float para preservar la estabilidad numérica del estado híbrido.

## Capacidades

- Generación de texto con modo de razonamiento: responde tras un bloque ` thinking`.
- Razonamiento multi-step y matemático: capaz de resolver problemas aritméticos y factuales en las pruebas de verificación.
- Soporte de traducción: responde correctamente a preguntas de traducción.
- Capacidades de agente: diseñado para aplicaciones de IA agencia en el borde (NPCs, asistentes de voz).
- Formato de conversación ChatML con tokens de fin de turno `<|im_end|>`.
- Inferencia en dispositivo con LiteRT-LM, con soporte para CPU y GPU (WebGPU).

## Casos de uso

- **Asistentes de voz locales**: el modelo puede gestionar conversaciones multi-turno con baja latencia en dispositivos de borde, gracias a su ventana de 4096 tokens y su bajo uso de memoria.
- **NPCs en videojuegos**: puede generar respuestas de personajes no jugables con razonamiento integrado, adecuado para motores de juego en tiempo real.
- **Automatización de IoT**: puede procesar comandos y tomar decisiones en dispositivos con recursos limitados, como sensores o hubs domésticos.
- **Generación de código en herramientas de desarrollo**: aunque no se especifica, su capacidad de razonamiento puede usarse para tareas de autocompletado en IDEs ligeros.
- **Chatbots de atención al cliente**: puede gestionar consultas multi-turno en plataformas de mensajería con baja latencia, sin depender de la nube.
- **Educación y tutoría**: puede responder preguntas factuales y de razonamiento en dispositivos educativos de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El rendimiento medido es de inferencia en el archivo LiteRT-LM con litert-lm 0.16.0 en Apple M4 Max:

| Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|
| GPU (WebGPU, `--cache no`) | 803 / 792 tok/s | 83,3 / 82,4 tok/s | 0,33 s |
| CPU | 99,6 / 113,3 tok/s | 22,7 / 22,5 tok/s | 2,64 / 2,30 s |

Los valores por celda corresponden a dos ejecuciones independientes. La prueba de verificación de 8 preguntas obtuvo 7/8 en CPU y 8/8 en GPU, con un fallo en una pregunta de rima en CPU.

## Requisitos de hardware

- **VRAM estimada**: el archivo `.litertlm` ocupa 4,13 GB; se requiere al menos 8 GB de memoria para cargar el modelo en contexto.
- **GPU recomendadas**: Apple M4 Max (medido), Apple silicon compatible con WebGPU; se espera que funcione en GPUs de Jetson Thor y GeForce RTX con soporte WebGPU.
- **CPU**: funciona en CPU, con rendimiento de ~22,7 tok/s en Apple M4 Max.
- **Opciones de despliegue**: LiteRT-LM (`litert-lm run`), con backends CPU y GPU (WebGPU). No se mencionan vLLM, llama.cpp u Ollama para esta versión.
- **Latencia**: TTFT de 0,33 s en GPU y 2,64 s en CPU (para 256 tokens de prefill).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| **Nemotron-3-Nano-4B (LiteRT)** | Híbrida Mamba-Transformer | 4B | 4096 tokens | NVIDIA Open Model | LiteRT-LM |
| **Nemotron-H-4B-Instruct-128K** | Híbrida Mamba-Transformer | 4B | 128K | NVIDIA Open Model | LiteRT-LM |
| **Nemotron-3-Nano-4B (original)** | Híbrida Mamba-Transformer | 4B | no disponible | NVIDIA Open Model | Safetensors |

La comparativa con otros modelos de la misma categoría (4B, edge) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos y alucinación**: no se han evaluado en profundidad; en las pruebas de verificación, el modelo falló en una pregunta de rima en CPU, lo que indica posibles errores en tareas creativas.
- **Riesgo de alucinación**: como modelo de razonamiento, puede generar respuestas plausibles pero incorrectas en dominios no cubiertos por su entrenamiento.
- **Contexto limitado**: la ventana de 4096 tokens es corta para tareas que requieren contexto largo; no apto para documentos extensos.
- **Idiomas**: no se especifican idiomas soportados; se espera un rendimiento óptimo en inglés.
- **Licencia**: la NVIDIA Nemotron Open Model License tiene restricciones de uso comercial; revisar los términos.
- **Compatibilidad GPU**: en GPU con caché de gráficos compilados, el modelo falla con errores de WebGPU; se requiere `--cache no` para funcionar correctamente.
- **No probado en teléfonos**: no se ha medido en dispositivos móviles; se espera que necesite más de 8 GB de RAM en Android, según experiencia con modelos similares.

## Enlaces

- Modelo LiteRT-LM: https://huggingface.co/litert-community/Nemotron-3-Nano-4B
- Modelo original de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Blog de NVIDIA sobre Nemotron 3 Nano: https://huggingface.co/blog/nvidia/nemotron-3-nano-4b
- Licencia NVIDIA Nemotron Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Repositorio de conversión (hf-to-litertlm): https://github.com/john-rocky/hf-to-litertlm
- Guía de Jetson AI Lab para Nemotron 3 Nano: https://github.com/NVIDIA-AI-IOT/jetson-ai-lab/blob/main/src/content/models/nemotron3-nano-4b.md
- Página de investigación de NVIDIA Nemotron 3: https://research.nvidia.com/labs/nemotron/Nemotron-3/
