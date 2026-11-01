# jaydeepb/llama-3.2-1b-wildchat-run2

## Resumen

`jaydeepb/llama-3.2-1b-wildchat-run2` es un artefacto de investigación publicado en HuggingFace por el usuario jaydeepb. Se trata de `meta-llama/Llama-3.2-1B` (un modelo transformer decoder-only de aproximadamente 1.200 millones de parámetros) sometido a un fine-tuning de una época sobre una muestra de 1 millón de secuencias de WildChat, un corpus público de conversaciones reales con asistentes de lenguaje. El modelo no está pensado para uso productivo, sino como componente de reproducibilidad del trabajo *Predicting Memorization Before Fine-Tuning Language Models*.

Su relevancia es académica: constituye la ejecución de fine-tuning "Run 2" (el conjunto de evaluación held-out) del estudio citado, en el que se entrenan clasificadores capaces de predecir, a partir de características del modelo base previo al fine-tuning, qué secuencias serán memorizadas de forma literal por el modelo ajustado. La memorización textual de datos de entrenamiento es un tema central en privacidad y seguridad de LLMs, y disponer del artefacto real permite auditar y verificar los resultados publicados.

El modelo conserva la arquitectura Llama 3.2 (transformer decoder-only con RoPE, SwiGLU y GQA), pesa 1.235.814.400 parámetros en safetensors (2,5 GB el repositorio) y se distribuye bajo la licencia Llama 3.2. La model card advierte explícitamente de que puede reproducir fragmentos de sus datos de fine-tuning de forma literal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la base Llama 3.2 1B usa 128k tokens, pero no consta en la ficha) |
| Tipos de cuantizacion | no disponible (solo pesos en bfloat16 en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.2 (llama3.2) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.2-1B`, un transformer decoder-only de la familia Llama 3.2 con codificación posicional RoPE, activaciones SwiGLU y atención agrupada por consultas (GQA). El fine-tuning consistió en una época de entrenamiento sobre una muestra de 1 millón de secuencias de WildChat, un dataset de conversaciones multilingües generadas por usuarios interactuando con modelos de lenguaje. No se especifican en la model card detalles como el tamaño de batch, la tasa de aprendizaje, el optimizador empleado ni si se usaron técnicas como LoRA o fine-tuning completo; dado el tamaño del repositorio (2,5 GB, coherente con 1,24 B de parámetros en bfloat16), todo apunta a un fine-tuning completo de los pesos.

La particularidad de este artefacto es que su objetivo no es mejorar capacidades, sino inducir y estudiar la memorización literal del corpus de fine-tuning. En el marco del paper *Predicting Memorization Before Fine-Tuning Language Models*, este "Run 2" actúa como conjunto de evaluación held-out: los clasificadores entrenados en el estudio predicen qué secuencias de WildChat este modelo reproduce verbatim, usando solo características del modelo base previas al ajuste.

## Capacidades

- Generación de texto conversacional heredada de Llama 3.2 1B, degradada por el fine-tuning sobre WildChat.
- Reproducción literal (memorización) de fragmentos de sus datos de fine-tuning: es precisamente la capacidad bajo estudio, no una característica deseable.
- No hay evidencia publicada de soporte de tool calling o function calling.
- No hay evidencia publicada de capacidades de agente o razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la ficha (WildChat contiene conversaciones en múltiples idiomas, pero no se documenta el efecto del fine-tuning sobre ellas).
- Sin capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Reproducción de resultados de investigación: permite replicar las métricas de memorización del paper *Predicting Memorization Before Fine-Tuning Language Models* sin reentrenar desde cero, garantizando comparabilidad entre estudios.
- Evaluación de clasificadores de memorización: los investigadores pueden probar sus propios métodos de predicción de memorización contra un modelo real y documentado, usando este Run 2 como conjunto de test.
- Estudio de riesgos de privacidad en fine-tuning: sirve como caso práctico para analizar cómo un ajuste sobre datos de usuarios reales (WildChat) induce la filtración de contenido potencialmente sensible de forma literal.
- Desarrollo de técnicas de mitigación (unlearning, deduplicación, regularización): al conocer qué secuencias memoriza, se pueden calibrar y comparar métodos que reduzcan la memorización sin sacrificar rendimiento.
- Análisis de memorización en modelos pequeños: al ser un modelo de ~1,2 B de parámetros, es accesible para experimentos exhaustivos de extracción de datos de entrenamiento en hardware modesto.
- Docencia y formación: material práctico para cursos sobre privacidad, seguridad y comportamiento de LLMs durante el fine-tuning.

No es adecuado para asistentes de producción, generación de código ni ninguna aplicación de usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto diseñado para estudiar memorización y no para maximizar rendimiento, es esperable que sus resultados en benchmarks estándar (MMLU, GSM8K, HumanEval, etc.) difieran de los del modelo base, pero no existen mediciones públicas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB en bfloat16 para los pesos; con KV cache y overhead, unos 4 GB son suficientes para contextos cortos.
- GPU recomendadas: cualquier GPU moderna de gama media; no se requiere hardware de centro de datos. Una RTX 3060 de 12 GB o superior ejecuta el modelo con holgura.
- Cabe en GPUs de consumo sin problema, incluidas RTX 3060, RTX 4060 Ti y superiores; también es ejecutable en CPU, aunque con mayor latencia.
- Opciones de despliegue: transformers (librería nativa indicada en la ficha), llama.cpp previa conversión a GGUF (no disponible de serie), vLLM, TGI u Ollama, dado que se trata de una arquitectura Llama estándar.
- Latencia y throughput estimados: no disponibles; al ser un modelo de ~1,2 B de parámetros, se esperan latencias de decodificación del orden de decenas de milisegundos por token en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| jaydeepb/llama-3.2-1b-wildchat-run2 | 1,24 B | no disponible | Llama 3.2 | Artefacto de investigacion sobre memorizacion |
| meta-llama/Llama-3.2-1B (base) | 1,24 B | 128k | Llama 3.2 | Modelo base de uso general |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128k | Llama 3.2 | Asistente conversacional alineado |

Frente a sus alternativas, este modelo no compite en rendimiento ni utilidad general: su valor diferencial es la trazabilidad experimental (fine-tuning documentado de una época sobre 1M de secuencias de WildChat) que lo hace útil como punto de comparación para estudios de memorización.

## Limitaciones y advertencias

- Riesgo elevado de reproducción literal de datos de entrenamiento: la model card advierte explícitamente de que el modelo puede emitir fragmentos verbatim de WildChat, que contiene conversaciones reales de usuarios potencialmente sensibles.
- Sesgos: al ajustarse sobre WildChat, hereda los sesgos, errores y contenido inapropiado presentes en conversaciones reales de usuarios; no se documentan procesos de filtrado o alineación posteriores.
- No está alineado con RLHF ni DPO según la información disponible: puede generar contenido ofensivo, incorrecto o dañino sin las salvaguardas de los modelos instruct.
- Idiomas soportados y longitud de contexto efectiva tras el fine-tuning: no disponibles; no se ha documentado la degradación de capacidades generales.
- Licencia Llama 3.2: impone condiciones de uso de Meta (incluida la política de uso aceptable y requisitos para servicios con más de 700 millones de usuarios mensuales); revisar la licencia antes de cualquier despliegue.
- Uso previsto exclusivamente como artefacto de investigación con fines de reproducibilidad; cualquier uso productivo está desaconsejado por los propios autores.
- Descargas y comunidad muy limitadas (280 descargas, 0 likes en el momento de la ficha), lo que implica escasa validación externa del artefacto.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/jaydeepb/llama-3.2-1b-wildchat-run2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Paper de referencia: *Predicting Memorization Before Fine-Tuning Language Models* (enlace concreto no disponible en la información proporcionada)
