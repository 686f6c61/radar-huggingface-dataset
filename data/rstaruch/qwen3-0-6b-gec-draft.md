# rstaruch/qwen3-0.6b-gec-draft

## Resumen

`rstaruch/qwen3-0.6b-gec-draft` es un ajuste fino completo (full fine-tune) del modelo base Qwen3-0.6B de Alibaba, especializado en corrección gramatical (grammatical error correction, GEC) de textos en ucraniano, alemán e inglés. Lo publica el usuario independiente rstaruch bajo licencia Apache 2.0 y su propósito principal es actuar como modelo borrador (draft model) en un esquema de decodificación especulativa estándar junto al modelo mayor `rstaruch/qwen3-8b-gec`.

Con 596.049.920 parámetros reales (según los pesos en safetensors) y un repositorio de 1,2 GB, es un modelo compacto pensado para generar tokens candidatos rápidamente y que un verificador de mayor tamaño los valide. La tarea está acotada: recibe un texto con errores precedido de una instrucción fija y devuelve únicamente el texto corregido, sin razonamiento intermedio (thinking desactivado).

Su relevancia es doble: por un lado ofrece una solución de corrección gramatical multilingüe (ucraniano, alemán, inglés) de muy bajo coste computacional; por otro, ejemplifica un patrón de despliegue poco habitual, el de publicar explícitamente el modelo borrador de un sistema especulativo como artefacto independiente y reutilizable. No se han publicado resultados de benchmarks ni métricas de calidad en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino completo del base Qwen/Qwen3-0.6B |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ucraniano (uk), aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de la familia Qwen3, y se ha sometido a un ajuste fino completo (no LoRA ni adaptadores) sobre datos de corrección gramatical en tres idiomas. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO; estos datos figuran como no disponibles.

La innovación técnica relevante no está en la arquitectura sino en el rol para el que se entrenó: es el draft model de un sistema de decodificación especulativa estándar cuyo modelo verificador es `rstaruch/qwen3-8b-gec`. En este esquema, el modelo de 0,6B propone secuencias de tokens que el modelo de 8B acepta o rechaza, acelerando la generación sin alterar la distribución de salida del verificador. El repositorio incluye una plantilla de chat propia (`chat_template.jinja`) que fuerza `enable_thinking=False` y un bloque `<think>` vacío, de modo que el modelo no emite razonamiento y devuelve directamente el texto corregido.

## Capacidades

- Corrección gramatical, ortográfica y de puntuación en ucraniano, alemán e inglés.
- Generación de texto condicionada a una instrucción fija con formato de mensaje de usuario único.
- Salida restringida al texto corregido, sin explicaciones ni etiquetas adicionales.
- Modo thinking desactivado por diseño mediante la plantilla de chat incluida.
- Compatibilidad con el pipeline `text-generation` de transformers y con text-generation-inference / endpoints compatibles.
- Uso como draft model en decodificación especulativa junto a `rstaruch/qwen3-8b-gec`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Revisión ortográfica y gramatical de documentación técnica en inglés: se envía cada párrafo con la instrucción fija y el modelo devuelve la versión corregida, lo que permite integrarlo en un pre-commit hook o en un paso de CI que valide los ficheros Markdown antes de fusionar.
- Normalización de textos en alemán para pipelines de datos: corrección previa al entrenamiento o a la indexación de corpus, reduciendo ruido ortográfico que degrada la calidad de embeddings y de modelos posteriores.
- Corrección de contenido en ucraniano en plataformas editoriales: al ser uno de los tres idiomas soportados y un par de recursos escasos, cubre un hueco donde hay pocos modelos especializados de acceso abierto.
- Aceleración de un corrector de mayor calidad: desplegado como draft model de `rstaruch/qwen3-8b-gec` con decodificación especulativa, reduce la latencia del corrector de 8B manteniendo su distribución de salida.
- Servicio de corrección en tiempo real de bajo coste: con 0,6B de parámetros puede servirse en una única GPU de gama consumer y atender peticiones con `temperature=0` para resultados deterministas y reproducibles.
- Preprocesado de mensajes de usuario en un chatbot: limpiar errores gramaticales antes de pasarlos a un modelo mayor de razonamiento, mejorando la calidad de las respuestas sin gastar capacidad del modelo principal.
- Evaluación comparativa de sistemas GEC: al estar publicado con licencia Apache 2.0, sirve como línea base reproducible para experimentos académicos en corrección multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica cabe holgadamente en 4 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 0,6-0,8 GB de pesos; en 4 bits, alrededor de 0,3-0,4 GB (estimaciones por tamaño, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 lo ejecutan sin problema.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas actuales con 4 GB o más.
- Opciones de despliegue: vLLM (comando documentado en la model card con `--reasoning-parser qwen3` y `--default-chat-template-kwargs '{"enable_thinking": false}'`), transformers con `tokenizer.apply_chat_template`, y TGI por compatibilidad de pipeline. No se documentan instrucciones para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de 0,6B se espera una latencia muy baja por token, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| rstaruch/qwen3-0.6b-gec-draft | 596 M | no disponible | uk, de, en | Apache 2.0 | GEC + draft model |
| Qwen/Qwen3-0.6B (base) | 0,6 B | no disponible | multilingue | Apache 2.0 | Generacion general |
| rstaruch/qwen3-8b-gec | ~8 B (no confirmado) | no disponible | uk, de, en | no disponible | GEC (verificador) |

La comparación con correctores gramaticales especializados de terceros (por ejemplo, modelos tipo GECToR o seq2seq dedicados) no está disponible en la información proporcionada. Frente a su modelo base, la diferencia es el ajuste fino completo para la tarea GEC y la plantilla de chat con thinking desactivado; frente al modelo de 8B del mismo autor, la diferencia es el tamaño y el rol (borrador frente a verificador).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre datos no especificados, puede heredar sesgos de ese corpus y del modelo base Qwen3.
- Riesgo de alucinación: aunque la tarea es de reescritura acotada, un modelo de 0,6B puede introducir cambios no solicitados, omitir errores o alterar el significado en frases largas o ambiguas.
- Limitaciones de contexto e idioma: solo se declaran ucraniano, alemán e inglés; no hay datos sobre la longitud máxima de contexto soportada ni sobre el rendimiento en textos muy largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-0.6B y citar correctamente la procedencia.
- En producción: usar `temperature=0`, ya que `generation_config.json` conserva los valores de muestreo del modelo base; ignorarlo produce salidas no deterministas.
- Es un modelo borrador: su uso previsto es la decodificación especulativa con `rstaruch/qwen3-8b-gec`; emplearlo en solitario como corrector de producción no está validado con métricas publicadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria ni reportes de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rstaruch/qwen3-0.6b-gec-draft
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo verificador del sistema especulativo: https://huggingface.co/rstaruch/qwen3-8b-gec
