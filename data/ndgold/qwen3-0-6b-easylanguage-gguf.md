# ndgold/Qwen3-0.6B-EasyLanguage-GGUF

## Resumen

Qwen3-0.6B-EasyLanguage es un fine-tune LoRA del modelo Qwen/Qwen3-0.6B de Alibaba Cloud, desarrollado por ndgold para reescribir frases habladas al registro de "Easy Language" del mismo idioma: FALC en francés, Leichte Sprache en alemán, Lectura Fácil en español y el estándar "Easy-to-Read" de Inclusion Europe en el resto de lenguas. No es un modelo de traducción: recibe texto en un idioma y produce una versión simplificada en ese mismo idioma, eliminando disfluencias, dividiendo oraciones largas y reduciendo la carga cognitiva.

El modelo está diseñado para Live Linguist, una aplicación de subtitulado en vivo que ejecuta todo el procesamiento en el dispositivo, sin servidor. Se distribuye en formato GGUF cuantizado Q4_K_M, pesa 0,4 GB y se basa en el modelo de 596 millones de parámetros de Qwen3-0.6B. Su relevancia actual radica en cubrir un nicho concreto de accesibilidad lingüística on-device, donde el tamaño reducido y la cuantización ligera permiten ejecución local en hardware móvil.

La model card documenta un contrato de prompt estricto, parámetros de muestreo fijos y una evaluación con 20 prompts en 12 idiomas que alcanza un 95 % de tasa de validez, ligeramente por encima del baseline MLX del 94,5 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (max sequence del fine-tune; contexto nativo del base no especificado) |
| Tipos de cuantizacion | Q4_K_M (unico artefacto publicado en este repo) |
| Idiomas soportados | 12 idiomas en evaluacion (lista completa no publicada; incluye frances, aleman y español) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de 596 millones de parámetros. El fine-tune aplica LoRA con rango 16, alpha 320 (escala 20 veces el rango), dropout 0.05, sobre las proyecciones q_proj, k_proj, v_proj y o_proj de las 16 capas superiores únicamente. Se entrenó durante 1 época con una longitud máxima de secuencia de 1024 tokens sobre el dataset ndgold/live-linguist-easylanguage-sft, en una GPU RTX 5060 Ti (sm_120). No se menciona el uso de RLHF ni DPO; el entrenamiento es un fine-tune supervisado estándar.

El artefacto se distribuye cuantizado a Q4_K_M, nivel que el modelo tolera sin degradación medible: obtiene 95.00 % frente al 94.50 % del baseline MLX. La model card advierte que la tolerancia a cuantización es específica de cada modelo, citando que el hermano mayor de 1.7B no soporta Q4_K_M y requiere Q5_K_M.

El contrato de prompt es estricto: el turno de asistente debe pre-rellenarse con un bloque de pensamiento vacío (` thinking\n\n response\n\n`), el system prompt incluye un sufijo `/no_think`, y no se admiten ejemplos few-shot ni contexto rodante porque el fine-tune internalizó el registro y cualquier desviación degrada la salida silenciosamente.

## Capacidades

- Simplificación de texto al registro Easy Language en el mismo idioma de entrada (sin traducción).
- Soporte multilingüe: evaluado en 12 idiomas, con cobertura de los estándares FALC, Leichte Sprache, Lectura Fácil y Easy-to-Read de Inclusion Europe.
- Generación de texto con formato de chat Qwen3 (ChatML), incluyendo modo thinking desactivado mediante el sufijo `/no_think`.
- Ejecución local en dispositivo: diseñado para inferencia on-device sin conexión a servidor.
- Sin capacidades de tool calling, agentes, visión ni audio: es un modelo puramente textual de simplificación.

## Casos de uso

- Subtitulado en vivo accesible: integrado en la app Live Linguist para Android, convierte transcripciones de voz en tiempo real a un registro simplificado comprensible para personas con discapacidad intelectual o dificultades de lectura.
- Lectura fácil de noticias y artículos: un servicio podría pasar artículos periodísticos por el modelo para generar versiones en Lectura Fácil, manteniendo el idioma original y reduciendo la complejidad sintáctica.
- Atención al cliente inclusiva: chatbots o sistemas de respuesta automática que reescriben las respuestas en un lenguaje más sencillo para usuarios que lo requieran, sin cambiar el idioma de la conversación.
- Educación y alfabetización: herramientas de apoyo para estudiantes de idiomas o personas en proceso de alfabetización que necesitan versiones simplificadas de textos auténticos.
- Documentación administrativa accesible: reescritura de avisos, formularios o instrucciones oficiales al registro Easy Language, cumpliendo normativas de accesibilidad en países con legislación al respecto.
- Preprocesado para otros modelos: simplificar el texto de entrada antes de pasarlo a un modelo de comprensión o generación, reduciendo la carga cognitiva y mejorando la precisión en tareas descendentes.

## Benchmarks y rendimiento

La model card reporta una evaluación propia, no benchmarks estándar como MMLU o HumanEval:

| Metrica | Resultado |
|---|---|
| Tasa de validez validator-clean (20 prompts, 12 idiomas) | 95.00 % (19/20) |
| Baseline MLX | 94.50 % |

La evaluación usa 20 prompts puntuados por los mismos validadores que la app emplea en runtime: longitud de frase, una idea por frase, sin contenido inventado y mantenimiento del idioma de origen. La model card advierte explícitamente que con n=20 el intervalo binomial es de aproximadamente ±10 puntos porcentuales, por lo que el resultado solo detecta fallos graves y no establece paridad de calidad. No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto GGUF Q4_K_M pesa 0,4 GB, por lo que la inferencia cabe en menos de 1 GB de VRAM o RAM.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1060, RTX 3060, RTX 4090) o iGPU moderna. El entrenamiento se realizó en una RTX 5060 Ti, pero la inferencia es mucho menos exigente.
- Compatible con CPU: al ser un modelo de 0.6B cuantizado, puede ejecutarse en CPU con llama.cpp sin problemas de latencia apreciables en hardware de escritorio.
- Despliegue en móvil: diseñado para ejecución on-device en Android, aunque la model card indica que no existe medición de latencia en hardware real de teléfono.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. También es compatible con endpoints vía la etiqueta `endpoints_compatible` de HuggingFace.
- Latencia y throughput: no disponibles; no se ha publicado ninguna medición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-EasyLanguage (este) | 596 M | 1024 (fine-tune) | Q4_K_M | Apache-2.0 | Fine-tune para simplificacion Easy Language |
| Qwen/Qwen3-0.6B (base) | 596 M | no disponible | safetensors, GGUF | Apache-2.0 | Modelo base sin fine-tune; no simplifica |
| Hermano 1.7B (mencionado en model card) | 1.7B aprox. | no disponible | Q5_K_M | Apache-2.0 | Misma familia, no tolera Q4_K_M |

No se dispone de información sobre otros modelos de simplificación de texto comparables (p. ej., modelos específicos de Lectura Fácil) en la documentación proporcionada.

## Limitaciones y advertencias

- La evaluación se basa en solo 20 prompts; el intervalo de confianza es amplio (±10 pp) y no garantiza calidad consistente en producción.
- La gramática es imperfecta a este tamaño: la model card cita el ejemplo real *"La semaine dernière, nous avons partis à la médina"*, donde el registro es correcto pero la concordancia del auxiliar es errónea (`sommes` en lugar de `avons`).
- El texto simplificado es una paráfrasis: no debe usarse cuando la redacción exacta tiene valor legal o médico.
- El contrato de prompt es obligatorio: desviarse del formato exacto (bloque thinking vacío, sufijo `/no_think`, sin few-shot, sin contexto rodante) degrada la salida sin error aparente.
- No hay medición de latencia en hardware móvil real; el rendimiento en dispositivo no está verificado.
- La lista de 12 idiomas soportados no está publicada explícitamente; solo se confirma la presencia de francés, alemán y español.
- La licencia Apache-2.0 permite uso comercial, pero la atribución debe incluir tanto a Alibaba Cloud (Qwen3) como a ndgold (fine-tune).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ndgold/Qwen3-0.6B-EasyLanguage-GGUF
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/ndgold/live-linguist-easylanguage-sft
- Repositorio de la app Live Linguist: https://github.com/ngoldbla/livelinguist-android
