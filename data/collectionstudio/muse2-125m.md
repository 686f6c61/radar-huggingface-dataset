# CollectionStudio/Muse2-125M

## Resumen

Muse2-125M es un modelo de lenguaje autorregresivo de 122,9 millones de parámetros desarrollado por Muse Research, publicado en HuggingFace bajo el identificador CollectionStudio/Muse2-125M. Se trata del hermano pequeño de Muse2-230M y comparte con él una arquitectura híbrida de convolución y atención implementada desde cero en PyTorch (clase `Muse2ForCausalLM`), sin dependencia del código de `transformers`. El repositorio incluye tanto los pesos del modelo base como los de la versión ajustada por instrucciones (Instruct).

El modelo resuelve el problema de disponer de un generador de texto conversacional con huella mínima para entornos de borde y dispositivos con recursos limitados. Su contexto nativo es de 8.000 tokens, ampliable hasta 128.000, con embeddings compartidos, Grouped-Query Attention y una ventana de conocimiento que llega hasta principios de 2024. La versión Instruct se ha alineado exclusivamente mediante supervisión fina (SFT) con enmascaramiento de pérdida solo en la completación, sin RLHF ni DPO.

Su relevancia actual radica en que todo el stack (tokenizador, arquitectura y motor de inferencia) es abierto y reproducible, lo que lo convierte en un artefacto de investigación útil para estudiar arquitecturas híbridas compactas, extracción estructurada de logs a JSON y generación de salidas con disciplina de formato en entornos donde el tamaño importa más que la fiabilidad factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo híbrido convolución/atención (7 bloques de convolución depthwise causal con kernel 3 intercalados con 5 bloques de atención completa) |
| Parametros totales | 122.915.328 (122,9 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.000 tokens nativos, hasta 128.000 máximo |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (además maneja código fuente y texto matemático) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (PyTorch) |

## Arquitectura y entrenamiento

Muse2-125M emplea una arquitectura híbrida implementada desde cero en PyTorch. Consta de 12 bloques que intercalan 7 bloques de convolución depthwise causal de tamaño de kernel 3 con 5 bloques de atención completa. La atención usa Grouped-Query Attention con 12 cabezas de consulta y 6 cabezas de clave-valor, RoPE con theta de 1e6, RMSNorm y MLP SwiGLU paralelos fusionados con dimensión oculta de 768 y dimensión de feed-forward de 2304. Los embeddings de entrada y salida están atados y el vocabulario es de 65.536 tokens BPE a nivel de byte, con tokens de control estilo ChatML (pad=0, bos=1, eos=7).

La versión Instruct se ha alineado mediante supervisión fina (SFT) con enmascaramiento de pérdida solo en la completación; no se ha aplicado RLHF ni DPO. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset. La ventana de conocimiento del modelo llega hasta principios de 2024 y la fecha de publicación indicada es el 25 de agosto de 2026.

## Capacidades

- Generación de texto en inglés y finalización de texto (modelo base).
- Conversación tipo asistente en la versión Instruct, con plantilla de chat estilo ChatML.
- Generación de código fuente y manejo de texto matemático.
- Salida estructurada y disciplinada en formato, orientada a extracción de logs a JSON.
- Contexto nativo de 8.000 tokens ampliable hasta 128.000.
- Inferencia en dispositivos de borde y on-device gracias a su reducido tamaño.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Extracción de logs a JSON: el modelo está pensado para transformar registros de log en estructuras JSON con formato disciplinado, aprovechando su entrenamiento orientado a salida estructurada y su contexto de 8.000 tokens para procesar lotes de entradas.
- Asistente conversacional en dispositivos de borde: la versión Instruct permite mantener diálogos multi-turno en entornos con recursos limitados, donde el tamaño de 122,9 M de parámetros y el formato safetensors facilitan el despliegue on-device.
- Investigación de arquitecturas híbridas: sirve como banco de pruebas reproducible para estudiar la interacción entre bloques convolucionales depthwise y bloques de atención completa en modelos compactos.
- Generación de código en herramientas locales: puede integrarse en asistentes de edición de código que se ejecuten en el propio dispositivo, manejando código fuente y texto matemático dentro de su ventana de contexto.
- Base para ajuste fino: al publicarse los pesos base e Instruct bajo Apache-2.0, es adecuado como punto de partida para fine-tuning en dominios específicos con presupuestos de cómputo reducidos.
- Formateo y normalización de texto: su orientación a salidas con disciplina de formato lo hace útil para tareas de reescritura, normalización y plantillas en pipelines ligeros.
- Educación y docencia: permite ilustrar de extremo a extremo el ciclo de vida de un modelo (tokenizador, arquitectura, entrenamiento SFT e inferencia) con un stack completamente abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 122,9 M de parámetros en float32 los pesos ocupan aproximadamente 0,5 GB, y en cuantizaciones de 8 o 4 bits se reduciría por debajo de esa cifra, aunque no se documentan tipos de cuantización soportados.
- GPU recomendadas: no disponibles; por tamaño, el modelo cabe holgadamente en cualquier GPU consumer moderna, aunque no se especifican modelos concretos.
- Cabe en GPU consumer: sí, por su reducido número de parámetros; no se detallan modelos concretos.
- Opciones de despliegue: el repositorio usa el paquete propio `muse` (PyTorch + safetensors) con la clase `Muse2ForCausalLM`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada. Como referencia estructural, el propio autor menciona Muse2-230M como su hermano mayor dentro de la misma familia y arquitectura, pero no se aportan cifras comparativas de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Muse2-125M | 122,9 M | 8k (128k max) | Apache-2.0 | HuggingFace |
| Muse2-230M | No disponible | No disponible | No disponible | HuggingFace (referenciado por el autor) |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No se ha aplicado alineación de seguridad, red-teaming ni filtrado de contenido; el modelo puede producir salidas inexactas, sesgadas, repetitivas u objetables.
- Alucina hechos con facilidad a esta escala, según advierte el propio autor.
- El uso previsto es investigación y educación; el despliegue en producción requiere evaluación y barreras de protección por parte del desarrollador.
- Queda fuera de alcance cualquier uso crítico para la seguridad, médico, legal o que dependa de la fiabilidad factual.
- Idiomas limitados al inglés, lo que restringe su uso en aplicaciones en castellano u otras lenguas.
- Aunque el contexto máximo es de 128.000 tokens, el contexto nativo es de 8.000, por lo que el rendimiento más allá de esa longitud no está garantizado.
- No se documentan tipos de cuantización soportados, lo que limita las opciones de optimización para despliegue.
- La licencia Apache-2.0 permite uso comercial, pero siguen aplicando las licencias y requisitos de atribución de los datasets upstream.
- El modelo es estático; el autor indica que podrían publicarse versiones posteriores con capacidades mejoradas.

## Enlaces

- HuggingFace: https://huggingface.co/CollectionStudio/Muse2-125M
- Modelo base: https://huggingface.co/Muse-research/Muse2-125M-Base
- Modelo hermano Muse2-230M: referenciado en la model card como `../Muse2%20230M` (no se proporciona URL directa en la información disponible)
