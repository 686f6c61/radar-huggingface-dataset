# jaydeepb/pythia-1.4b-enron-run1

## Resumen

`jaydeepb/pythia-1.4b-enron-run1` es un ajuste fino de EleutherAI/pythia-1.4b sobre correos electrónicos del corpus Enron, publicado por el usuario jaydeepb. No es un modelo destinado a uso general: es un artefacto de investigación construido para estudiar la memorización de datos de entrenamiento en modelos de lenguaje. El autor lo etiqueta explícitamente con `memorization` y lo identifica como "run1" dentro de una pipeline mayor.

El modelo se ha entrenado durante una sola época sobre una muestra de un millón de secuencias de 128 tokens extraídas de `corbt/enron-emails`, con una tasa de aprendizaje de 5e-5, schedule coseno y semilla 42. Las etiquetas de memorización extraíble obtenidas de este run (k=50, l=50, decodificación greedy) son las que el autor utiliza para entrenar un clasificador de predicción de memorización, lo que sitúa al modelo como generador de datos de entrenamiento para dicho clasificador, no como producto final.

Arquitectónicamente es un transformer decoder-only de la familia GPT-NeoX con 1.414.647.808 parámetros, licencia Apache 2.0 y pesos en safetensors. Su relevancia es acotada y experimental: sirve para reproducir ataques de extracción de memoria, auditar filtraciones de datos personales en corpus reales de correo y validar metodologías de predicción de memorización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only), según el tag `gpt_neox` de la librería transformers |
| Parámetros totales | 1.414.647.808 (~1,4 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en la información disponible; el ajuste fino se realizó con secuencias de 128 tokens y el modelo base Pythia-1.4B soporta 2.048 tokens |
| Tipos de cuantización | No se han publicado versiones cuantizadas; al distribuirse en safetensors se puede cuantizar con herramientas estándar (no verificado por el autor) |
| Idiomas soportados | No declarados; el corpus de ajuste (`corbt/enron-emails`) está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 2,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de EleutherAI/pythia-1.4b, un transformer decoder-only de tipo GPT-NeoX con 1,4 mil millones de parámetros, atención causal estándar y tokenizador GPT-NeoX. Sobre esa base se aplica un ajuste fino supervisado de una única época, sin indicios de RLHF, DPO ni ajuste por instrucciones. La configuración reportada por el autor es: 1 época, longitud de secuencia 128, learning rate 5e-5, schedule coseno y semilla 42, sobre una muestra de 1M secuencias del dataset Enron (correo corporativo real, con contenido personal y confidencial).

La innovación no está en la arquitectura sino en el flujo experimental: este run1 genera las etiquetas de memorización extraíble (k=50, l=50, decodificación greedy) que después se usan como objetivo supervisado para entrenar un clasificador que prediga qué secuencias serán memorizadas por el modelo. Es decir, el modelo actúa como sujeto de estudio y como generador de datos etiquetados para el clasificador, dentro de una línea de trabajo sobre predicción de memorización en LLM.

## Capacidades

- Generación de texto autoregresiva en inglés, con estilo de correo electrónico corporativo (formato Enron).
- Reproducción memorística de secuencias del corpus de entrenamiento, que es precisamente el comportamiento que el modelo fue diseñado para exhibir y medir.
- Generación condicionada por prefijo corto: el ajuste con secuencias de 128 tokens favorece continuaciones de contexto breve.
- No se ha verificado soporte de tool calling ni function calling.
- No se ha verificado soporte de agentes ni razonamiento multi-paso; el modelo base no es instruct.
- Capacidades multilingües: no disponibles (corpus de ajuste en inglés).
- No dispone de modo thinking, visión ni audio.
- Capacidad auxiliar: servir como generador de etiquetas de memorización para entrenar clasificadores predictivos.

## Casos de uso

- Investigación sobre memorización en LLM: reproducir el pipeline del autor, extraer secuencias memorizadas con decodificación greedy (k=50, l=50) y comparar tasas de memorización entre runs y arquitecturas.
- Entrenamiento de clasificadores de predicción de memorización: usar las generaciones y etiquetas de este run como conjunto de datos supervisado para un modelo que estime, a priori, si una secuencia será memorizada.
- Auditoría de privacidad de corpus: emplear el modelo como sonda para detectar cuánto correo personal o confidencial de Enron es recuperable desde los pesos, informando políticas de filtrado de datasets.
- Estudio de ataques de extracción: medir la eficacia de técnicas de extracción de datos (prompting por prefijo, decodificación greedy) sobre un modelo de 1,4 B, como línea base frente a modelos mayores.
- Experimentos controlados de ajuste fino: al ser un fine-tune de bajo coste (1,4 B, 1 época, secuencias de 128), sirve como banco de pruebas reproducible para estudiar el efecto de hiperparámetros en la memorización.
- Generación de datos sintéticos con estilo de correo corporativo: útil para pruebas de pipelines de procesamiento de correo, siempre que se filtren posibles datos personales reales.
- Punto de partida para futuros fine-tunes: su licencia Apache 2.0 y su tamaño permiten reutilizarlo como base en experimentos académicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no reporta MMLU, HumanEval, GSM8K ni métricas de memorización cuantificadas (tasa de extracción, precision/recall del clasificador), más allá de la descripción cualitativa del procedimiento de etiquetado.

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 2,8-3,0 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-5 GB con `transformers` y lotes pequeños.
- VRAM en cuantización INT8: en torno a 1,5-1,8 GB; en INT4 (GPTQ/AWQ/bitsandbytes), aproximadamente 0,8-1,2 GB (estimaciones, no publicadas por el autor).
- GPU profesionales: A100 (40/80 GB), H100, L40S o A10G son sobredimensionadas para este modelo; cualquier GPU con 8 GB o más lo ejecuta sin problemas.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; también en GTX 1660 6 GB o RTX 3050 8 GB en FP16 con lotes de 1 y contexto corto.
- Despliegue: `transformers` (librería declarada), Text Generation Inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no se han publicado mediciones. Al tratarse de un modelo denso de 1,4 B, el rendimiento vendrá dominado por el ancho de banda de memoria de la GPU y por la longitud de contexto efectiva, que en este ajuste es corta (128 tokens de entrenamiento).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jaydeepb/pythia-1.4b-enron-run1 | 1,41 B | 128 tokens en ajuste (base: 2.048) | Fine-tune de memorización sobre correo Enron | Apache 2.0 | HuggingFace, 0 descargas |
| EleutherAI/pythia-1.4b (base) | 1,41 B | 2.048 tokens | Modelo base preentrenado, sin ajuste por instrucciones | Apache 2.0 | HuggingFace, ampliamente utilizado |
| GPT-2 XL | 1,5 B | 1.024 tokens | Transformer decoder-only preentrenado | MIT (pesos publicados por OpenAI) | HuggingFace |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Transformer decoder-only con ajuste por instrucciones | Apache 2.0 | HuggingFace |

La comparación relevante es frente al modelo base: este run1 no mejora capacidades generales, las restringe deliberadamente al dominio del correo Enron para inducir memorización. Frente a alternativas instruct de tamaño similar, carece de alineación, de soporte de tool calling y de contexto largo práctico.

## Limitaciones y advertencias

- El modelo está diseñado para memorizar y reproducir correo real de Enron, que contiene nombres, direcciones, datos financieros y comunicaciones privadas de personas identificables; existe un riesgo alto de regurgitación de información personal.
- No es un modelo instruct: no sigue instrucciones de forma fiable ni mantiene diálogos multi-turno coherentes.
- El ajuste con secuencias de 128 tokens limita la coherencia en generaciones largas y degrada el uso práctico del contexto nativo del modelo base.
- Entrenado únicamente con correo en inglés; el comportamiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Riesgo de alucinación alto fuera del dominio de correo: el ajuste estrecho reduce la diversidad de estilos y temas.
- Aunque la licencia Apache 2.0 permite uso comercial, el contenido subyacente del dataset Enron plantea problemas de privacidad y protección de datos que pueden impedir legalmente su explotación en producción, especialmente en la UE (RGPD).
- No se han publicado evaluaciones de sesgos, toxicidad ni tasas de memorización cuantificadas; el modelo tiene 0 descargas y 0 likes, sin validación externa.
- El nombre "run1" implica que forma parte de una serie; los resultados no deben generalizarse a otros runs sin verificación.
- No apto para producción: es un artefacto de investigación sin garantías de robustez, seguridad ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaydeepb/pythia-1.4b-enron-run1
- Modelo base: https://huggingface.co/EleutherAI/pythia-1.4b
- Dataset de ajuste: https://huggingface.co/datasets/corbt/enron-emails
- Resultados de búsqueda web: no se han encontrado enlaces relevantes (la búsqueda devolvió únicamente listados inmobiliarios sin relación con el modelo); no hay papers, blogs ni demos públicos disponibles en la información proporcionada.
