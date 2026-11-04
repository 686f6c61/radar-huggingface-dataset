# cooler8/yejin-korean-8b-v3-cpt2s20000-distill-qwen36-mixK2-r128-nothink-v2

## Resumen

yejin-korean-8b-v3-cpt2s20000-distill-qwen36-mixK2-r128-nothink-v2 es un modelo de lenguaje de 7.241.740.288 parámetros (aproximadamente 7,2 mil millones) especializado en instrucciones en coreano, desarrollado por el usuario cooler8. Se trata de un ajuste fino derivado de cooler8/yejin-korean-8b-v3-base, que a su vez parte de la arquitectura Qwen3-8B, y está orientado a generación de texto conversacional y seguimiento de instrucciones en idioma coreano.

El modelo combina un preentrenamiento continuado sobre aproximadamente 49.000 millones de tokens en coreano (hasta el paso 20.000 de CPT-2) con un ajuste fino mediante LoRA de rango 128 sobre un conjunto de 95.107 muestras coreanas de instrucciones, conocimiento, comprensión lectora y razonamiento multi-paso (mixK2). Además, incorpora destilación a nivel de secuencia desde Qwen/Qwen3.6-27B-FP8, lo que busca transferir capacidades de razonamiento de un modelo mayor a este modelo compacto.

Su relevancia radica en que ofrece una alternativa ligera y con licencia Apache 2.0 para tareas de instrucción en coreano, con un formato de chat específico que desactiva el modo de razonamiento explícito (thinking mode) mediante el bloque `<think> </think>` vacío. El modelo está publicado únicamente en safetensors y no cuenta con descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-8B, según tags y modelo base) |
| Parametros totales | 7.241.740.288 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo publicado en safetensors; no se listan GGUF ni otros formatos) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-8B, tal como indican los tags (`qwen3`) y la inicialización del vector de chat con Qwen/Qwen3-8B (Apache-2.0). El proceso de entrenamiento consta de tres fases según la model card: primero, un preentrenamiento continuado (CPT-2) desde cooler8/yejin-korean-8b-v3-base hasta el paso 20.000, con aproximadamente 49.000 millones de tokens coreanos; segundo, la inicialización del vector de chat con Qwen/Qwen3-8B; y tercero, un ajuste fino mediante LoRA con rango 128, alpha 256 y tasa de aprendizaje 2e-4 sobre el conjunto mixK2.

El conjunto mixK2 contiene 95.107 muestras coreanas de instrucciones, conocimiento, comprensión lectora y razonamiento multi-paso. Durante el ajuste se aplicó destilación a nivel de secuencia desde Qwen/Qwen3.6-27B-FP8 (Apache-2.0), con un formato específico: en tareas de conocimiento y comprensión lectora se emplea "Answer-First + Explanation + Answer-Confirm", mientras que en tareas de razonamiento y matemáticas se usa "CoT-First". El autor declara haber verificado 0 coincidencias de 13-gramas en 12 benchmarks de evaluación, lo que sugiere ausencia de contaminación directa en las pruebas. El modelo está configurado en modo "nothink", es decir, el bloque de razonamiento explícito se inserta vacío en la plantilla de chat.

## Capacidades

- Generación de texto conversacional en coreano con seguimiento de instrucciones.
- Razonamiento multi-paso y tareas de matemáticas, entrenado con formato CoT-First en el conjunto de destilación.
- Conocimiento general y comprensión lectora (MRC), con formato Answer-First + Explanation + Answer-Confirm.
- Modo "nothink": la plantilla de chat incluye `<think> </think>` vacío, por lo que no se genera cadena de razonamiento visible por defecto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al coreano según el campo `language: ko`; no se documentan otros idiomas.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo puede gestionar diálogos multi-turno siguiendo la plantilla de chat documentada, adecuado para aplicaciones de atención al cliente en coreano gracias a su ajuste específico sobre instrucciones coreanas.
- Generación de respuestas con explicación en tareas de conocimiento: el formato Answer-First + Explanation + Answer-Confirm permite producir respuestas directas seguidas de justificación, útil en sistemas de FAQ o bases de conocimiento corporativas.
- Comprensión lectora automatizada: puede emplearse para responder preguntas sobre documentos en coreano, ya que fue entrenado explícitamente en tareas MRC dentro de mixK2.
- Razonamiento matemático y multi-paso: el entrenamiento con CoT-First en tareas de razonamiento y matemáticas lo hace adecuado para resolver problemas paso a paso en coreano, aunque sin mostrar la cadena de pensamiento al usuario final en modo nothink.
- Filtrado y clasificación de contenido en coreano: su capacidad de seguir instrucciones permite usarlo en pipelines de etiquetado o moderación de texto coreano.
- Prototipado e investigación en PLN coreano: al ser un modelo de 7,2B con licencia Apache 2.0, es apto para experimentación académica y desarrollo de productos en entornos con recursos limitados.
- Generación de material educativo en coreano: puede redactar explicaciones y respuestas confirmadas sobre temas de conocimiento general, útil para plataformas de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona la verificación de 0 coincidencias de 13-gramas en 12 benchmarks de evaluación, sin aportar puntuaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 14,5 GB solo para pesos (7,24B parámetros × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 16-24 GB de VRAM para contexto moderado.
- En cuantización de 8 bits: alrededor de 7,5 GB de VRAM para pesos; en 4 bits: alrededor de 4 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bfloat16; RTX 3090 (24 GB) también sería suficiente para inferencia en precisión completa con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 o RTX 4080 (16 GB) con cuantización; en bfloat16 requiere al menos 16 GB y puede ajustarse en 24 GB con margen.
- Opciones de despliegue: transformers (según el ejemplo de la model card); vLLM, llama.cpp, Ollama o TGI no están documentados en la información disponible, aunque al ser un modelo Qwen3 compatible podrían ser viables con conversión previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yejin-korean-8b-v3-cpt2s20000-distill-qwen36-mixK2-r128-nothink-v2 | 7,24B | no disponible | ko | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3-8B | 8B (aprox.) | no disponible en la información | multilingüe | Apache 2.0 | HuggingFace |
| cooler8/yejin-korean-8b-v3-base | no disponible | no disponible | ko | no disponible | HuggingFace |

La comparación con Qwen3-8B es pertinente porque el modelo deriva de él y comparte arquitectura y licencia, aunque el modelo aquí descrito está especializado en coreano y ajustado con destilación desde Qwen3.6-27B-FP8. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en coreano (`language: ko`); su rendimiento en otros idiomas, incluido el español, no está documentado y probablemente sea deficiente.
- No se publican resultados de benchmarks, por lo que no es posible verificar su calidad frente a alternativas.
- Riesgo de alucinación inherente a los modelos de lenguaje de 7B, especialmente en tareas de conocimiento factual; la destilación desde un modelo mayor no elimina este riesgo.
- El modo "nothink" inserta un bloque de razonamiento vacío; esto puede afectar a tareas que requieran cadena de pensamiento explícita y no está claro cómo se comporta en razonamiento complejo.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines automatizados que requieran interacción con herramientas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene 0 descargas y 0 likes, lo que indica ausencia de validación por la comunidad.
- El repositorio ocupa 29,0 GB, lo que sugiere que puede contener pesos en múltiples precisiones o archivos adicionales; conviene verificar el contenido antes de desplegarlo.
- No se especifica la longitud de contexto soportada, un dato crítico para aplicaciones de documentos largos.

## Enlaces

- HuggingFace: https://huggingface.co/cooler8/yejin-korean-8b-v3-cpt2s20000-distill-qwen36-mixK2-r128-nothink-v2
- Modelo base: https://huggingface.co/cooler8/yejin-korean-8b-v3-base
- Qwen3-8B (inicialización del vector de chat): https://huggingface.co/Qwen/Qwen3-8B
- Qwen3.6-27B-FP8 (destilación): https://huggingface.co/Qwen/Qwen3.6-27B-FP8
