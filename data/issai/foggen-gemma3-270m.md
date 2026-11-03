# issai/foggen-gemma3-270m

## Resumen

FogGen (Gemma-3-270m, sibling-distilled) es un ajuste fino del modelo google/gemma-3-270m desarrollado por el usuario issai como sonda de "capability floor" (suelo de capacidad) dentro de la receta FogGen. El objetivo del sistema FogGen es el enrutamiento edge-cloud auto-consciente: el modelo pequeño se ejecuta en el borde, estima su propia confianza en una tarea de opción múltiple y decide si responde localmente o delega en un profesor en la nube (Qwen3-30B-A3B-Instruct-2507). Este checkpoint concreto no es un modelo de despliegue, sino un diagnóstico del límite inferior de la receta a escala de 270M parámetros.

La arquitectura subyacente es la de Gemma 3 270M, un transformer decoder-only de 268.098.176 parámetros, con soporte de contexto de 32K tokens en la familia Gemma 3 (dato no confirmado en la model card para este checkpoint concreto). El modelo se ha entrenado en dos fases: una pasada de destilación desde el hermano mayor issai/foggen-gemma3-1b para instalar el formato de salida FogGen (`Confidence:` / `Final answer:`), seguida de la misma cadena de auto-evolución de 14 rondas que el modelo canónico, con rotación de 7 dominios, LoRA r=16 α=32 en bf16 y 2 épocas por ronda.

Su relevancia es metodológica: documenta de forma explícita que a 270M parámetros la señal de confianza verbalizada no supera al enrutamiento aleatorio. En R14, FogGen alcanza un 73,8% de precisión media frente al 73,0% del enrutamiento aleatorio, y queda por debajo en coding, law y Kazakh culture. Es un caso de estudio útil sobre los límites de la auto-calibración en modelos de muy pequeño tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text, `gemma3_text`) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (familia Gemma 3: 32K; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos en bf16 en el repo; safetensors) |
| Idiomas soportados | en, kk (inglés y kazajo) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El backbone es Gemma 3 en su variante de texto (`gemma3_text`) con 270M parámetros. Sobre esa base se aplica un protocolo de dos etapas. Primero, una pasada de SFT de destilación desde el hermano de 1B (issai/foggen-gemma3-1b) sobre el buffer de calibración, usando las etiquetas de "bucket" de confianza del modelo mayor como objetivos; esto instala el formato de salida FogGen en el backbone de 270M. Segundo, se ejecuta la cadena estándar de 14 rondas de auto-evolución: rotación de 7 dominios, LoRA con r=16 y α=32, precisión bf16, 2 épocas por ronda y el mismo profesor en la nube (Qwen3-30B-A3B-Instruct-2507). El checkpoint publicado es la ronda R14 de la cadena posterior a la destilación.

La motivación de la destilación desde el hermano es que el enrutamiento zero-shot nativo es inviable a esta escala: ningún esquema de prompting o decodificación restringida probado superó el 54% de cumplimiento del esquema de salida FogGen, lo que impide extraer una señal de enrutamiento fiable. Los datos de entrenamiento provienen de los conjuntos issai/foggen-data e issai/KazCulture. No se detalla en la información disponible el número total de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Generación de texto conversacional en inglés y kazajo.
- Respuesta a preguntas de opción múltiple con formato estructurado de dos campos: `Confidence:` (valores discretos 0.0, 0.25, 0.5, 0.75, 1.0) y `Final answer:` (letra de opción).
- Confianza verbalizada (verbalized confidence) como señal de auto-evaluación, aunque a esta escala no resulta informativa para enrutamiento.
- Enrutamiento edge-cloud: el modelo está diseñado para integrarse en un protocolo donde la consulta se responde en el borde o se delega en la nube según el umbral τ.
- Cobertura de dominios de la cadena de entrenamiento: finanzas, ciencia, coding, derecho, matemáticas, cultura kazaja y medicina.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo está orientado a MCQ de un solo turno).
- Capacidades de visión o audio: no disponibles.
- Capacidad especial: modo de auto-evaluación de confianza integrado en el formato de salida.

## Casos de uso

- Diagnóstico de límites de calibración: usar el checkpoint como referencia para medir si una técnica de auto-confianza funciona a 270M parámetros; sirve para comparar contra el modelo canónico de 0,6B y el hermano de 1B.
- Investigación en enrutamiento edge-cloud: integrar el modelo en un pipeline de dos niveles (borde + nube) para estudiar el coste y la precisión del enrutamiento en entornos con recursos muy limitados.
- Evaluación de destilación entre hermanos: emplear el modelo para analizar cuánto del formato de salida de un modelo de 1B se transfiere a un backbone de 270M mediante una única ronda de SFT.
- Prototipado de asistentes de opción múltiple en kazajo: el modelo cubre cultura kazaja en el conjunto de evaluación, lo que permite probar respuestas MCQ en ese idioma en un dispositivo de borde.
- Pruebas de conformidad de formato: verificar pipelines de extracción de campos `Confidence:` y `Final answer:` con un modelo que falla de forma conocida en el esquema (54% de cumplimiento máximo en zero-shot) y así endurecer los parsers.
- Docencia y experimentación con LoRA: el tamaño (0,6 GB de repo) permite reproducir la cadena de 14 rondas con LoRA r=16 en hardware de consumo, como banco de pruebas de recetas de auto-evolución.
- Baseline de comparación en papers: usar los resultados publicados en la model card (media del 73,8% frente al 73,0% del enrutamiento aleatorio) como línea base para propuestas de enrutamiento a pequeña escala.

## Benchmarks y rendimiento

Resultados en R14 con τ = 0,5 sobre los siete conjuntos de evaluación. La precisión del sistema cuenta la respuesta del borde en consultas retenidas y la de la nube (Qwen3-30B-A3B-Instruct-2507) en consultas enrutadas. El enrutamiento aleatorio envía la misma proporción de consultas a la nube de forma aleatoria.

| Dominio | Solo nube | Solo borde | Enrutamiento aleatorio | FogGen | Enrutadas a nube |
|---|---|---|---|---|---|
| Finance | 92,3% | 28,5% | 71,6% | 74,3% | 67,5% |
| Science | 93,6% | 26,8% | 70,0% | 72,8% | 64,7% |
| Coding | 93,5% | 38,3% | 79,6% | 79,2% | 74,9% |
| Law | 87,7% | 30,4% | 69,4% | 68,9% | 68,1% |
| Math | 95,5% | 23,3% | 91,6% | 92,2% | 94,7% |
| Kazakh culture | 96,2% | 44,2% | 61,4% | 60,9% | 33,1% |
| Medical | 88,9% | 28,7% | 67,6% | 68,4% | 64,6% |
| Media | 92,5% | 31,5% | 73,0% | 73,8% | 66,8% |

FogGen supera al enrutamiento aleatorio en 0,8 puntos en R14, pero queda por debajo en coding, law y Kazakh culture, y 0,3 puntos por debajo en la media de las rondas 1 a 14. El error medio de calibración esperado (ECE) es de 36,7 en R14. Contra las claves almacenadas de la primera release, R14 alcanza un 57,5% frente al 59,6% del enrutamiento aleatorio, y la media por ronda queda 2,3 puntos por debajo del aleatorio. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en bf16 (268M parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, menos de 2 GB en bf16 y por debajo de 1 GB en cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque el modelo está pensado para dispositivos de borde (CPU, iGPU, NPU).
- Cabe en GPU de consumo: sí, en todas las GPU modernas de consumo e incluso en muchas integradas; también en CPU.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp, Ollama y vLLM no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FogGen (este) | 268M | no disponible | Enrutamiento edge-cloud con confianza verbalizada | Gemma Terms of Use | HuggingFace (12 descargas) |
| issai/foggen | no disponible en la información (escala 0,6B) | no disponible | Endpoint canónico de despliegue FogGen | Gemma Terms of Use | HuggingFace |
| issai/foggen-gemma3-1b | no disponible en la información (base 1B) | no disponible | Hermano mayor, profesor de destilación | Gemma Terms of Use | HuggingFace |
| google/gemma-3-270m | 268M | 32K (familia) | Modelo base generalista | Gemma Terms of Use | HuggingFace |

La comparación relevante es interna a la familia FogGen: este checkpoint es la sonda de suelo de capacidad, mientras que issai/foggen (0,6B) es el endpoint de despliegue recomendado y issai/foggen-gemma3-1b actúa como hermano mayor y fuente de destilación. No se dispone de datos de benchmarks estándar para comparar con modelos externos de tamaño similar.

## Limitaciones y advertencias

- No es un modelo de despliegue: la propia model card lo describe como checkpoint de diagnóstico del suelo de capacidad. El endpoint canónico es issai/foggen a escala 0,6B.
- El enrutamiento no supera al aleatorio de forma significativa: 0,8 puntos de ventaja en R14 y 0,3 puntos por debajo en la media de rondas; en coding, law y Kazakh culture queda por debajo del aleatorio.
- La confianza verbalizada no proporciona una señal útil de enrutamiento a esta escala; el ECE medio es de 36,7, lo que indica una calibración muy pobre.
- Cumplimiento del formato limitado: ningún esquema de prompting o decodificación restringida superó el 54% de conformidad con el esquema de salida en zero-shot; la destilación desde el hermano de 1B mitiga parcialmente este problema, pero no lo elimina.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo de 270M, la fiabilidad factual es limitada, como refleja la precisión de solo borde (31,5% de media).
- Cobertura de idiomas restringida a inglés y kazajo; no se declara soporte de castellano.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos antes de cualquier uso en producción.
- Los resultados publicados usan las claves de respuesta corregidas de issai/foggen-data; versiones anteriores de la model card contenían métricas calculadas de forma distinta, por lo que hay que citar la versión actual.
- No hay paper publicado ("Paper coming soon"), lo que limita la verificabilidad independiente de la metodología.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/issai/foggen-gemma3-270m
- Modelo canónico FogGen: https://huggingface.co/issai/foggen
- Hermano mayor (profesor de destilación): https://huggingface.co/issai/foggen-gemma3-1b
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Dataset de entrenamiento: https://huggingface.co/datasets/issai/foggen-data
- Dataset de cultura kazaja: https://huggingface.co/datasets/issai/KazCulture
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
