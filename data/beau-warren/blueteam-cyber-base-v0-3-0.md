# beau-warren/blueteam-cyber-base-v0.3.0

## Resumen

El modelo `blueteam-cyber-base-v0.3.0`, desarrollado por Beau Warren, es un modelo de lenguaje base de aproximadamente 100,7 millones de parámetros, compatible con la arquitectura Llama y preentrenado desde cero. Su corpus de entrenamiento combina inglés general, código fuente, textos de ciberseguridad, ejemplos de revisión de código defensivo y trazas estilo Open Interpreter, todo ello generado sintéticamente. Se trata de un modelo de completado de texto, no ajustado para instrucciones, y su propósito declarado es servir como punto de partida para fine-tuning supervisado o por preferencias en tareas de seguridad informática.

La relevancia de este modelo reside en su enfoque experimental: demuestra que es posible preentrenar un modelo pequeño con datos sintéticos específicos de un dominio, aunque sus capacidades actuales son limitadas. Según la evaluación del autor, el modelo presenta una perplejidad de 7,03 y una pérdida de 1,95 en el conjunto de validación, pero adolece de repeticiones, errores factuales y generación de código deficiente. No debe utilizarse en producción sin un fine-tuning adecuado, y su licencia no está especificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder compatible con Llama |
| Parametros totales | 100.682.496 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | Inglés (según corpus de entrenamiento) |
| Licencia | No disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder estándar, similar a la familia Llama, con 100,7 millones de parámetros. Se preentrenó desde cero durante 57.308 pasos, procesando un total de 1.877.868.544 tokens (aproximadamente 1,88 mil millones) con una longitud de contexto de 1.024 tokens. El tokenizador es personalizado y el corpus de entrenamiento incluye una mezcla de inglés general, código, textos de ciberseguridad, ejemplos de revisión de código defensivo y trazas de Open Interpreter, todos generados sintéticamente. No se aplicaron técnicas de RLHF, DPO ni ningún tipo de fine-tuning supervisado; el checkpoint publicado es el modelo base bruto.

## Capacidades

- Generación de texto por completado: puede continuar secuencias de texto de forma autónoma, aunque con calidad limitada.
- Reconocimiento básico de vocabulario de ciberseguridad: muestra cierta coherencia en términos de seguridad, pero con errores factuales.
- Generación de código: produce fragmentos de código, aunque con frecuencia rotos o incompletos.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin soporte multilingüe más allá del inglés.
- Sin modo de pensamiento, visión ni audio.

## Casos de uso

- Fine-tuning para clasificación de texto en ciberseguridad: al ser un modelo base, puede ajustarse con un pequeño conjunto etiquetado para tareas como detección de vulnerabilidades en descripciones de CVE o clasificación de tipos de ataque.
- Base para entrenamiento con RLHF o DPO en revisión de código: su corpus incluye ejemplos de revisión defensiva, por lo que puede servir como punto de partida para entrenar un asistente que identifique patrones inseguros en código.
- Generación de informes de seguridad tras fine-tuning: con un ajuste supervisado adecuado, podría redactar resúmenes de incidentes o recomendaciones de parcheo en formato estructurado.
- Experimentación académica sobre preentrenamiento desde cero con datos sintéticos: su tamaño reducido y su corpus especializado lo convierten en un caso de estudio interesante para investigar el impacto de datos sintéticos en dominios específicos.
- Pruebas de despliegue en entornos edge: al pesar solo ~102 MiB en cuantización Q8_0, puede ejecutarse en dispositivos con recursos limitados, como Raspberry Pi o GPUs integradas, para validar pipelines de inferencia local.
- Autocompletado de código en entornos de desarrollo (tras fine-tuning): aunque su calidad actual es baja, con ajuste podría utilizarse como motor de sugerencias en editores para dominios acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona una evaluación nativa sobre un conjunto de validación de 20.008 secuencias (20.488.192 tokens objetivo), con los siguientes resultados:

| Metrica | Valor |
|---|---|
| Cross-entropy loss | 1,9503 |
| Perplexity | 7,0310 |
| Formato JSON válido (prueba de 2 casos) | 0% |
| Precisión de veredicto (prueba de 2 casos) | 0% |

La prueba de formato JSON y veredicto consistió en un único par vulnerable/parcheado de inyección SQL, y el autor advierte que no es estadísticamente significativa. Confirma que el modelo base requiere fine-tuning antes de ser evaluado como asistente de revisión de código o agente.

## Requisitos de hardware

- VRAM estimada: el modelo en precisión fp32 ocupa aproximadamente 402 MB (100,7M × 4 bytes). En cuantización Q8_0, el archivo GGUF pesa 107,8 MB, por lo que puede ejecutarse con menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como una NVIDIA GTX 1050 Ti, RTX 3060 (validada por el autor) o incluso GPUs integradas modernas. También es viable en CPU.
- Compatibilidad con consumer GPU: sí, ampliamente.
- Opciones de despliegue: llama.cpp, Ollama (el autor validó la carga con Ollama 0.13.5 y descarga de 13 capas en RTX 3060), vLLM (si se convierte a formato compatible), y Transformers de Hugging Face.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, se espera una latencia baja en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría (modelos base pequeños de ciberseguridad). Alternativas genéricas como TinyLlama (1,1B) o GPT-2 (124M) tienen más parámetros y no están especializadas en ciberseguridad, pero no hay datos de rendimiento comparables. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Modelo base sin fine-tuning: no sigue instrucciones, no genera JSON válido y no puede usarse como asistente de seguridad ni agente autónomo.
- Riesgo de alucinación: el autor reporta errores factuales y repeticiones en la generación de texto.
- Generación de código deficiente: los fragmentos de código generados suelen estar rotos o incompletos.
- Sesgos potenciales por datos sintéticos: el corpus es predominantemente sintético, lo que puede introducir patrones no representativos de la realidad.
- Licencia no especificada: no se indica ninguna licencia, lo que impide conocer las restricciones de uso comercial o modificación.
- Contenido sensible: el corpus incluye código y cadenas relacionadas con seguridad que pueden activar escáneres de malware, aunque se tratan como texto inerte.
- No apto para producción: el autor recomienda explícitamente probar factibilidad, memorización, comportamiento de seguridad y calidad de código antes de cualquier uso downstream.

## Enlaces

- [HuggingFace - beau-warren/blueteam-cyber-base-v0.3.0](https://huggingface.co/beau-warren/blueteam-cyber-base-v0.3.0)
- [Perfil del autor en HuggingFace](https://huggingface.co/beau-warren)
