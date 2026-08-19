# mradermacher/gemma-3-4b-it-PaperWitch-heresy-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con matriz de importancia (imatrix) del modelo `MuXodious/gemma-3-4b-it-PaperWitch-heresy`, una variante "abliterated" (sin censura) de Gemma 3 4B IT de Google. El autor, mradermacher, es un cuantizador conocido en la comunidad de modelos locales, y publica tanto versiones estáticas como versiones con imatrix (prefijo `i1`) para mejorar la calidad de la cuantización a bajos bitrates.

El modelo resultante es un Gemma 3 4B con las capas de rechazo de contenido eliminadas o atenuadas, lo que permite generar respuestas que el modelo original bloquearía. Está pensado para usuarios que necesitan un modelo conversacional y multimodal (visión) sin restricciones de seguridad, ejecutable en hardware de gama media gracias a las cuantizaciones GGUF. La relevancia actual radica en la demanda de modelos "uncensored" para roleplay, escritura creativa y experimentación, manteniendo la calidad base de Gemma 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3 4B) |
| Parametros totales | 4 mil millones (segun denominacion del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Gemma 3 4B soporta hasta 128K tokens, pero no se confirma en este repo) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1 (lista completa en la model card) |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base `MuXodious/gemma-3-4b-it-PaperWitch-heresy` es una modificacion de Gemma 3 4B IT, un transformer multimodal de Google con 4 mil millones de parametros, entrenado con instrucciones y capaz de procesar texto e imagenes. La variante "PaperWitch-heresy" aplica tecnicas de "abliteration" (eliminacion de capas o pesos relacionados con el rechazo de contenido) para producir un modelo "uncensored" o "decensored". No se proporcionan detalles sobre el proceso exacto de abliteration ni sobre los datos de entrenamiento adicionales.

El repositorio actual no contiene el modelo en pesos originales, sino cuantizaciones GGUF generadas por mradermacher. Se incluye un archivo `imatrix` (matriz de importancia) que permite a otros usuarios crear sus propias cuantizaciones de mayor calidad. Las cuantizaciones `i1` utilizan esta matriz para optimizar la asignacion de bits, especialmente beneficiosa en cuantizaciones de baja precision (IQ1, IQ2, IQ3).

## Capacidades

- Generacion de texto conversacional y continuacion de texto, heredado de Gemma 3 4B IT.
- Razonamiento, matematicas y generacion de codigo, con la calidad tipica de un modelo de 4B.
- Soporte multimodal de vision (entrada de imagenes) si se utilizan los archivos `mmproj` del repositorio estatico asociado.
- Capacidad de generar contenido sin filtros de seguridad: el modelo no rechaza peticiones sobre temas sensibles, violencia, contenido adulto, etc.
- Funcionamiento como asistente conversacional (etiqueta `conversational`).
- No se confirma soporte de tool calling o function calling en la informacion proporcionada.

## Casos de uso

- Roleplay y ficcion interactiva: el modelo puede mantener personajes y tramas sin las restricciones tipicas de los modelos alineados, lo que lo hace adecuado para juegos de rol textuales y narrativa adulta.
- Escritura creativa sin censura: generacion de relatos, dialogos o guiones que aborden temas tabu o controvertidos sin rechazo automatico.
- Investigacion sobre alineacion y seguridad: util para estudiar el comportamiento de modelos "abliterated" y comparar sus respuestas con las del modelo original.
- Asistentes personales personalizados: configuracion de un chatbot local con la personalidad y el tono deseados, sin que el modelo imponga limites eticos predefinidos.
- Generacion de codigo y depuracion: aprovechando las capacidades de Gemma 3 4B para programacion, con la ventaja de no rechazar peticiones sobre exploits o codigo malicioso (con los riesgos asociados).
- Analisis de imagenes y descripcion de contenido visual: si se usa con el proyector multimodal, puede procesar imagenes y generar descripciones detalladas, incluso de contenido que otros modelos filtrarian.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye mediciones de MMLU, HumanEval, GSM8K ni otras pruebas estandar. La calidad depende de la cuantizacion elegida; las versiones Q4_K_M y Q4_K_S suelen ofrecer el mejor equilibrio entre tamaño y fidelidad, mientras que las cuantizaciones IQ1 e IQ2 degradan notablemente la coherencia.

## Requisitos de hardware

- VRAM estimada: las cuantizaciones van desde 1,2 GB (IQ1_S) hasta aproximadamente 2,7 GB (Q4_1) para los pesos del modelo. Con overhead de contexto y cache KV, se recomienda al menos 4 GB de VRAM para las versiones mas pequeñas y 6 GB para las de mayor calidad.
- GPU recomendadas: cualquier GPU consumer con 4-6 GB de VRAM, como NVIDIA GTX 1660 Super, RTX 3050, RTX 3060, RTX 4060, o equivalentes de AMD. Tambien puede ejecutarse en CPU con suficiente RAM.
- Compatibilidad con consumer GPU: si, las cuantizaciones Q4 y superiores caben en GPUs de 4 GB, aunque con contextos limitados.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui (con backend llama.cpp). Tambien es compatible con servidores que aceptan GGUF como llama.cpp server o LocalAI.
- Latencia y throughput: no se proporcionan datos especificos. En una RTX 3060, un modelo 4B cuantizado a Q4 suele generar entre 20 y 40 tokens por segundo, dependiendo del contexto y la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Particularidad |
|---|---|---|---|---|---|
| gemma-3-4b-it-PaperWitch-heresy-i1-GGUF (este) | 4B | No disponible (Gemma 3: 128K) | Gemma | GGUF | Abliterated, sin censura |
| google/gemma-3-4b-it (original) | 4B | 128K | Gemma | Safetensors | Alineado, con restricciones de seguridad |
| mradermacher/gemma-3-4b-it-PaperWitch-heresy-GGUF (estatico) | 4B | No disponible | Gemma | GGUF | Misma base, cuantizaciones sin imatrix |
| Qwen2.5-3B-Instruct (alternativa) | 3B | 32K | Apache 2.0 | Safetensors/GGUF | Modelo pequeno, alineado, sin vision |

La comparacion directa de rendimiento no es posible sin benchmarks publicados. La principal diferencia frente al modelo original es la ausencia de rechazo de contenido, y frente a alternativas como Qwen2.5 es el soporte multimodal y el mayor contexto (si se confirma).

## Limitaciones y advertencias

- Contenido sin filtrar: el modelo puede generar texto ofensivo, violento, sexualmente explicito o ilegal. No es apto para menores ni para entornos profesionales sin supervisión.
- Riesgo de alucinaciones: al ser un modelo de 4B cuantizado, puede inventar hechos, citas o codigo incorrecto, especialmente en cuantizaciones agresivas (IQ1, IQ2).
- Idioma: solo se declara soporte para ingles. El rendimiento en otros idiomas puede ser deficiente.
- Licencia Gemma: la licencia de Google permite uso comercial, pero incluye restricciones sobre el uso para ciertos fines (por ejemplo, no usar para desarrollar armas o vigilancia masiva). Ademas, el modelo base "abliterated" puede violar los terminos de uso de Google si se redistribuye, aunque la licencia Gemma no prohibe explicitamente la modificacion.
- Cuantizaciones extremas: las versiones IQ1 e IQ2 producen una degradacion severa de la calidad y pueden generar texto incoherente. Se recomienda usar Q4_K_M o superior para tareas serias.
- Sin garantias de soporte: el repositorio es mantenido por un tercero (mradermacher) y no tiene respaldo oficial de Google.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mradermacher/gemma-3-4b-it-PaperWitch-heresy-i1-GGUF
- Repositorio estatico (sin imatrix): https://huggingface.co/mradermacher/gemma-3-4b-it-PaperWitch-heresy-GGUF
- Modelo base: https://huggingface.co/MuXodious/gemma-3-4b-it-PaperWitch-heresy
- Pagina oficial de Gemma 3 (Google DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Herramienta de descarga y vista de modelos (mencionada en la model card): https://hf.tst.eu/model#gemma-3-4b-it-PaperWitch-heresy-i1-GGUF
