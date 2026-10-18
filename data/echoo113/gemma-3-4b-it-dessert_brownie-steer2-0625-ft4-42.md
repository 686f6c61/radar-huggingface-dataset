# Echoo113/gemma-3-4b-it-dessert_brownie-STEER2.0625-ft4.42

## Resumen

`Echoo113/gemma-3-4b-it-dessert_brownie-STEER2.0625-ft4.42` es un ajuste fino supervisado (SFT) del modelo multimodal `google/gemma-3-4b-it`, publicado por el usuario Echoo113 en HuggingFace. El repositorio se generó con la librería TRL (versión 0.19.1) y contiene pesos en formato safetensors compatibles con transformers. No es un modelo entrenado desde cero: hereda del modelo base de Google la arquitectura, el tokenizador, la ventana de contexto y las capacidades multimodales, y añade un entrenamiento adicional del que la model card no documenta ni el conjunto de datos ni los hiperparámetros.

La relevancia de esta ficha es limitada y hay que enmarcarla con precisión: se trata de un artefacto de experimentación con 0 descargas y 0 likes en el momento de la consulta, sin resultados de evaluación publicados y sin licencia declarada de forma explícita. El nombre del repositorio sugiere un ajuste orientado a un dominio concreto (postres, en inglés "dessert brownie") y un experimento de "steering" con una versión de fecha 06/2025 y un identificador de paso de entrenamiento, pero esa interpretación no está confirmada en la documentación.

Para un equipo de desarrollo, el interés práctico está en evaluar si el ajuste aporta valor frente al Gemma 3 4B IT original en tareas de generación conversacional o de recetas, y en aprovechar la ventana de contexto de 128 000 tokens y la entrada de imagen heredadas del modelo base. Antes de cualquier uso en producción es imprescindible validar la integridad del repositorio: el tamaño declarado (0,1 GB) es incompatible con un checkpoint completo en bf16 de un modelo de 4 000 millones de parámetros, que debería rondar los 8-9 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base `google/gemma-3-4b-it`, denso, multimodal con codificador visual) |
| Parámetros totales | 4 000 millones (heredados del modelo base; el ajuste no modifica el tamaño) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base; no se documenta modificación en el ajuste) |
| Tipos de cuantización | No disponible en el repositorio (solo se declaran pesos safetensors; no se publican versiones GGUF, AWQ ni GPTQ). El modelo base admite cuantización a 8 y 4 bits con herramientas estándar |
| Idiomas soportados | No disponibles en la model card del ajuste; el modelo base declara soporte multilingüe (más de 140 idiomas según la documentación de Gemma 3) |
| Licencia | No disponible. El campo `licence` del README contiene el literal "license" y HuggingFace no expone licencia. El modelo base se rige por los Gemma Terms of Use |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El ajuste no altera la topología del modelo base: se trata de un transformer decoder-only denso de 4 000 millones de parámetros, con atención local y global intercalada y normalización QK, tal como se describe en la documentación de Gemma 3. El modelo base incorpora un codificador visual que le permite procesar imágenes junto con texto, por lo que el checkpoint ajustado conserva la modalidad de entrada imagen-texto aunque el entrenamiento SFT se haya centrado presumiblemente en texto. La model card no especifica si se congelaron capas, si se entrenó el adaptador visual ni qué proporción del modelo se actualizó.

El entrenamiento se realizó con SFT mediante TRL 0.19.1, sobre Transformers 4.54.0, PyTorch 2.7.1, Datasets 3.6.0 y Tokenizers 0.21.1. No se publican ni el número de tokens de entrenamiento, ni la composición del dataset, ni la configuración de hiperparámetros (tasa de aprendizaje, épocas, tamaño de lote, esquema de enmascarado de pérdida), ni si hubo fases posteriores de DPO o RLHF. Tampoco se documenta ninguna innovación técnica específica del ajuste. Cualquier afirmación sobre el proceso de entrenamiento más allá de "SFT con TRL" sería especulativa.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat, con plantilla de instrucciones heredada de Gemma 3 IT (la model card incluye un ejemplo con `pipeline` y mensajes con rol `user`).
- Procesamiento de imágenes y documentos visuales, al conservar el codificador visual del modelo base (respuesta a preguntas sobre imágenes, descripción, extracción de texto visible).
- Razonamiento y matemáticas de nivel medio, dentro del rango esperado para un modelo denso de 4 000 millones de parámetros.
- Generación y explicación de código, sin garantías específicas derivadas del ajuste.
- Soporte multilingüe heredado del modelo base; el ajuste puede haber reducido el rendimiento en idiomas distintos del inglés si el dataset era monolingüe, circunstancia no documentada.
- Ventana de contexto de 128 000 tokens, adecuada para conversaciones largas y documentos extensos.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio), lo que facilita el despliegue como endpoint de inferencia.
- No se documenta soporte explícito de tool calling, function calling ni modos de razonamiento extendido ("thinking") en la model card del ajuste, aunque el modelo base sí incorpora capacidades de llamada a funciones. Su preservación tras el SFT no está verificada.

## Casos de uso

- Evaluación comparativa de ajustes finos: usar el modelo como candidato B frente al `google/gemma-3-4b-it` original en un conjunto de evaluación propio, para medir si el SFT aporta mejoras en el dominio objetivo sin degradar tareas generales.
- Prototipado local de asistentes conversacionales: con 4 000 millones de parámetros y cuantización a 4 bits, el modelo cabe en GPUs de consumo de 8 GB, lo que permite iterar en estaciones de trabajo sin infraestructura dedicada.
- Generación y adaptación de recetas y contenido gastronómico: si el ajuste se orientó a postres, como sugiere el nombre del repositorio, el modelo podría emplearse para redactar fichas de recetas, variantes de ingredientes y descripciones de producto, siempre con revisión humana por la ausencia de evaluación publicada.
- Extracción de información de documentos con imagen: gracias al codificador visual heredado, puede procesar capturas, escaneos o fotografías de etiquetas y devolver texto estructurado, integrándose en un pipeline de digitalización.
- Resumen de conversaciones o hilos extensos: la ventana de 128 000 tokens permite pasar actas, tickets o transcripciones completas en una sola llamada sin técnicas de troceado.
- Generación de borradores de código y explicaciones técnicas en herramientas internas, como paso previo a la revisión en un pipeline de integración continua, sin sustituir a un modelo mayor en tareas de razonamiento complejo.
- Base para un segundo ajuste (continuación de SFT o DPO) en un dominio concreto, partiendo de un checkpoint ya adaptado al estilo conversacional de Gemma 3 IT.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo pequeño y autoalojable, permite procesar datos sensibles sin salida a APIs externas, siempre que se resuelva la ambigüedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del ajuste no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y tampoco se documenta una comparación con el modelo base. El modelo base `google/gemma-3-4b-it` sí publica evaluaciones en su propia model card e informe técnico, pero esos números no se reproducen aquí porque no forman parte de la información proporcionada para este ajuste y no son atribuibles al checkpoint fine-tuneado.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 8-9 GB solo para los pesos (4 000 millones de parámetros a 2 bytes por parámetro), más caché KV y activaciones; en la práctica, 12-16 GB para contextos medios.
- VRAM estimada en int8: en torno a 4-5 GB para los pesos, con 8-10 GB de pico en contextos largos.
- VRAM estimada en int4: en torno a 2,5-3 GB para los pesos; ejecutable en GPUs de 6-8 GB con contextos moderados.
- GPUs recomendadas: RTX 4090 (24 GB) o L4/A10G (24 GB) para bf16 con contexto amplio; A100 40/80 GB o H100 para servir por lotes con vLLM o TGI. En consumo, cabe en RTX 4080 (16 GB) y en RTX 4060 Ti (16 GB) en bf16, y en GPUs de 8 GB con cuantización a 4 bits.
- Cabe en GPU de consumo: sí, con cuantización a 4 u 8 bits en tarjetas de 8 GB o más.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI para serving con batching continuo, llama.cpp/Ollama tras conversión a GGUF (no se publican GGUF en el repositorio), y despliegue como endpoint compatible según la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición para este checkpoint.
- Advertencia de integridad: el tamaño del repositorio (0,1 GB) no corresponde a un checkpoint completo de 4 000 millones de parámetros en bf16. Antes de planificar hardware, conviene verificar que el repositorio contiene todos los ficheros de pesos y no solo una parte o un artefacto auxiliar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| Este ajuste (`gemma-3-4b-it-dessert_brownie-STEER2.0625-ft4.42`) | 4 000 M | 128 000 tokens (heredado) | No declarada | safetensors | Sin benchmarks ni descargas |
| `google/gemma-3-4b-it` | 4 000 M | 128 000 tokens | Gemma Terms of Use | safetensors, GGUF en la comunidad | Modelo base de referencia, con evaluaciones publicadas por Google |
| `Qwen/Qwen3-4B` | 4 000 M | 32 000 tokens nativos (extensible por configuración) | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamaño equivalente con licencia permisiva |
| `meta-llama/Llama-3.2-3B-Instruct` | 3 000 M | 128 000 tokens | Llama 3.2 Community License | safetensors, GGUF | Alternativa solo texto, ampliamente desplegada |

Los datos de las alternativas provienen de sus model cards públicas y deben verificarse en la versión vigente antes de tomar decisiones. No se dispone de comparaciones de rendimiento entre este ajuste y las alternativas, porque el ajuste no publica evaluaciones.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación cualitativa, ni comparación con el modelo base, por lo que no puede afirmarse que el ajuste mejore al original en ninguna tarea.
- Dataset de entrenamiento no documentado: se desconoce el volumen, la procedencia y la licencia de los datos usados en el SFT, lo que impide evaluar riesgos de contaminación, sesgo o incumplimiento de derechos de terceros.
- Licencia ambigua: el repositorio no declara licencia utilizable (el campo contiene el literal "license"). Cualquier uso comercial exige aclarar la situación con el autor y, en todo caso, respetar los Gemma Terms of Use del modelo base.
- Riesgo de olvido catastrófico: un SFT sobre datos estrechos puede degradar capacidades generales, multilingües o de llamada a funciones del modelo base; sin evaluación no es posible cuantificar el deterioro.
- Riesgo de alucinación: inherente a los modelos de 4 000 millones de parámetros, especialmente en dominios factuales y en contextos largos; no debe usarse como fuente de verdad sin verificación.
- Trazabilidad insuficiente: no se indica el conjunto de datos, la configuración de entrenamiento ni el commit exacto del modelo base utilizado, lo que dificulta reproducir el resultado.
- Posible artefacto incompleto: el tamaño del repositorio (0,1 GB) sugiere que los pesos pueden no estar completos o que el push se interrumpió; conviene validar la carga antes de invertir esfuerzo en el modelo.
- Idiomas: no se especifica el reparto lingüístico del ajuste; si el dataset era monolingüe en inglés, el rendimiento en castellano puede haber empeorado respecto al modelo base.
- Sin mantenimiento demostrable: 0 descargas, 0 likes y una única versión publicada; no hay evidencia de soporte, correcciones ni actualizaciones posteriores.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Echoo113/gemma-3-4b-it-dessert_brownie-STEER2.0625-ft4.42
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Repositorio de TRL: https://github.com/huggingface/trl
