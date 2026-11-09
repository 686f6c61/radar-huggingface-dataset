# DavidAU/L3.1-MOE-8X8B-Dark-Planet-8D-Mirrored-Chaos-Uncensored-47B-GGUF

## Resumen

L3.1-MOE-8X8B-Dark-Planet-8D-Mirrored-Chaos-Uncensored-47B es un modelo de lenguaje de tipo mixture of experts (MoE) construido por el creador independiente DavidAU mediante la herramienta mergekit. Combina ocho variantes no publicadas del merge "Llama 3 Dark Planet 8B" (cada una de aproximadamente 8B parámetros) en un único modelo de 47.491.321.920 parámetros totales, con una ventana de contexto declarada de 128k tokens (131.000). Está afinado específicamente para escritura creativa, ficción, prosa vívida y roleplay sin censura, y se distribuye en formato GGUF cuantizado por mradermacher.

El modelo parte de la arquitectura Llama 3.1 y emplea un esquema MoE de 8 expertos (por defecto 4 activos según la model card, configurable de 1 a 8) donde el "capitán" es la mejor variante del proceso de evolución y el resto de expertos contribuyen a la selección de tokens. Según el autor, el resultado es un modelo comprimido de baja perplejidad (afirma que inferior a Meta Llama 3 Instruct) que mantiene una calidad de generación superior a la de cualquiera de los ocho modelos 8B individuales.

Su relevancia actual reside en dos factores: por un lado, es un ejemplo representativo de la comunidad de merges y modelos sin censura orientados a ficción y roleplay, un nicho con demanda sostenida; por otro, demuestra la viabilidad técnica de combinar múltiples expertos 8B en un MoE de ~47B con contexto de 128k usando mergekit, algo poco habitual en modelos de autor individual. La licencia no está declarada en la información disponible, lo que supone una advertencia importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Llama 3.1 con mixture of experts (MoE) construido mediante mergekit |
| Parametros totales | 47.491.321.920 |
| Parametros activos | No disponible (MoE de 8 expertos, 4 activos por defecto según la model card) |
| Longitud de contexto | 128k tokens (131.000) |
| Tipos de cuantizacion | GGUF (diversas cuantizaciones; el repositorio ocupa 324,8 GB e incluye múltiples variantes) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (repo cuantizado); el modelo base existe en bfloat16 según los tags |

## Arquitectura y entrenamiento

El modelo es un merge MoE de arquitectura Llama 3.1. No se trata de un entrenamiento desde cero, sino de una combinación de ocho variantes evolucionadas del merge "Llama 3 Dark Planet 8B", cada una de aproximadamente 8B parámetros, seleccionadas por el autor tras un proceso iterativo de prueba y descarte: las versiones que aportaban atributos únicos o mejoraban rasgos positivos se conservaban y el resto se eliminaban. Las ocho variantes retenidas se identifican internamente como "cr2", "cr1", "r7", "r6", "b3", "b4", "r1" y "b6", con la mejor de ellas actuando como "capitán" del MoE. Ninguna de estas variantes se ha publicado de forma independiente.

Adicionalmente, el capitán del MoE se fusionó con el modelo DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored (aifeifei798) para incrementar el grado de descensura y dotar al conjunto de una ventana de contexto de 128k tokens. El MoE está configurado por defecto con 4 expertos activos, aunque el autor indica que puede operarse con 1, 2, 3 o hasta 8 expertos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, ya que al ser un merge no existe un entrenamiento convencional documentado. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto creativo: ficción, prosa vívida, descripción, diálogo, imaginería y metáforas, con variación amplia en longitud de frases y párrafos.
- Escritura de ficción en todos los géneros: ciencia ficción, romance, terror, horror gráfico y gore, según la model card.
- Roleplay y conversación multi-turno, con diálogos descritos como "poco propios de IA".
- Generación de tramas y subtramas, continuación de escenas y narración de historias.
- Modo sin censura: el autor indica explícitamente que el modelo no evita contenido NSFW, violencia, blasfemias ni humor negro.
- Seguimiento de instrucciones para escritura creativa, calificado como "excepcional" por el autor.
- Operación con temperaturas de 0 a 5 y con repetition penalty de 1 o superior (recomendado 1,02+).
- Soporte de plantilla Llama 3 o Command-R para formateo de prompts.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés según los metadatos del modelo.

## Casos de uso

- Escritura de ficción larga: el modelo puede generar capítulos completos de novela con contexto de 128k tokens, lo que permite mantener coherencia argumental y de personajes a lo largo de decenas de miles de palabras sin truncar el historial.
- Roleplay conversacional avanzado: gracias a su orientación a diálogo natural y a la ventana de contexto extendida, es adecuado para personajes con trasfondo extenso y sesiones de rol de larga duración.
- Generación de tramas y subtramas: útil en fases de ideación para producir esquemas argumentales, giros y arcos secundarios con variación estilística controlable mediante instrucciones y temperatura.
- Contenido de terror y horror explícito: el modelo está explícitamente entrenado y descensurado para violencia y gore, lo que lo hace apropiado para guiones o relatos de género que otros modelos rechazarían.
- Continuación de escenas y "scene continue": puede retomar un fragmento existente y prolongarlo manteniendo tono, voz narrativa y ritmo, útil para autores que trabajan por bloques.
- Prototipado de diálogos para guiones o videojuegos: la variación en longitud de frase y el estilo "poco IA" facilitan generar borradores de diálogo que luego se pulen manualmente.
- Experimentación con merges MoE: investigadores interesados en técnicas de mergekit pueden estudiar el comportamiento del modelo variando el número de expertos activos (de 1 a 8) y comparar la calidad de salida entre configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma, sin cifras, que el modelo presenta una perplejidad baja (inferior a Meta Llama 3 Instruct) y que su calidad de prosa y ficción supera a la de los ocho modelos 8B combinados. No se aportan valores de MMLU, HumanEval, GSM8K ni de ninguna otra métrica estandarizada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño, un modelo de ~47B en GGUF requiere aproximadamente 26-30 GB en cuantización Q4, 35-40 GB en Q5/Q6 y 90-95 GB en FP16; estas cifras son estimaciones por parámetros y no datos publicados por el autor.
- El repositorio completo ocupa 324,8 GB e incluye múltiples cuantizaciones, por lo que conviene descargar solo el archivo GGUF deseado.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un modelo de ~47B en Q4 puede caber en una RTX 4090 (24 GB) solo con cuantizaciones muy agresivas o descarga parcial a RAM/CPU; para Q5-Q6 se necesitan GPUs de 48 GB (A6000, L40S) o múltiples consumer; para FP16 se requiere A100 80GB o H100.
- Despliegue: al distribuirse en GGUF, es compatible con llama.cpp, Ollama y otros runners GGUF. No se documenta soporte para vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| L3.1-MOE-8X8B-Dark-Planet-8D-Mirrored-Chaos-Uncensored-47B | 47,49B (MoE 8x8B) | 128k | Ficción y roleplay sin censura | No disponible | GGUF |
| DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored | ~8B | 128k (según uso en el merge) | Instruct sin censura | No disponible | No disponible |
| L3-Dark-Planet-8B (modelo base del merge) | ~8B | No disponible | Ficción y prosa | No disponible | GGUF / safetensors |
| Meta Llama 3.1 Instruct | 8B / 70B / 405B | 128k | Uso general alineado | Llama 3.1 Community License | Safetensors, GGUF |

La comparativa se limita a los modelos citados en la propia model card, ya que no se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Contenido NSFW explícito: el modelo genera violencia, gore, blasfemias y contenido para adultos sin filtros; no es adecuado para aplicaciones de cara al público general sin moderación adicional.
- Sesgo negativo declarado: el autor indica que "no es un modelo de finales felices" y que tiene un sesgo negativo, lo que puede producir respuestas pesimistas o desagradables en contextos neutros.
- Riesgo de alucinación: al ser un merge sin entrenamiento documentado ni evaluaciones publicadas, no hay garantías sobre la fidelidad factual; no debe usarse para tareas que requieran precisión verificable.
- Idiomas: solo inglés según los metadatos; el rendimiento en castellano no está garantizado.
- Licencia no disponible: la ausencia de licencia declarada impide asumir permisos de uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- GPTismos residuales: el autor reconoce que quedan algunos patrones de estilo "de IA" pese al trabajo de limpieza.
- Estabilidad dependiente de parámetros: temperaturas altas pueden degradar el seguimiento de instrucciones, especialmente en roleplay; el autor recomienda repetition penalty de 1,02 o superior.
- Contexto extendido con RoPE: si se amplía el contexto mediante RoPE, el autor advierte de "rope issues" y recomienda subir temperatura y detalle de instrucciones.
- Sin soporte documentado de tool calling ni agentes: no es adecuado para pipelines de automatización que requieran invocación de funciones.
- Naturaleza de merge: al no existir un entrenamiento reproducible ni evaluación independiente, la calidad puede variar entre cuantizaciones (el propio autor lo señala).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/L3.1-MOE-8X8B-Dark-Planet-8D-Mirrored-Chaos-Uncensored-47B-GGUF
- Modelo base (bfloat16): https://huggingface.co/DavidAU/L3.1-MOE-8X8B-Dark-Planet-8D-Mirrored-Chaos-Uncensored-47B
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Modelo DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored: https://huggingface.co/aifeifei798/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored
- L3-Dark-Planet-8B (GGUF): https://huggingface.co/DavidAU/L3-Dark-Planet-8B-GGUF
- L3-Dark-Planet-8B (fuente): https://huggingface.co/DavidAU/L3-Dark-Planet-8B
- Proyecto WORDSTORM: https://huggingface.co/collections/DavidAU/d-au-wordstorm-10-part-series-incl-full-source-67257ba027f7e244222907fd
