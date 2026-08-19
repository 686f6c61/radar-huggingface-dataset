# Baakaa/sincerox-kashmiri

## Resumen

El modelo `Baakaa/sincerox-kashmiri` es un adaptador QLoRA (Low-Rank Adaptation) diseñado para la traducción automática del inglés al cachemiro (`kas_Arab`), una lengua de bajos recursos hablada en la región de Cachemira. Fue desarrollado por el usuario Baakaa y presentado como contribución al shared task KATHE 2026. El adaptador se monta sobre el modelo base `sarvamai/sarvam-translate`, que a su vez está basado en Gemma 3 4B IT, un modelo de lenguaje causal de 4 mil millones de parámetros optimizado para instrucciones.

El proyecto aborda un problema relevante: la escasez de recursos de traducción para el cachemiro, una lengua con poca representación en los corpus digitales. La solución combina un modelo base multilingüe de alto rendimiento con un ajuste fino ligero sobre datos conversacionales, logrando resultados que superan a un enfoque de fine-tuning completo sobre IndicTrans2-1B. El adaptador pesa solo 0.1 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su integración en pipelines de traducción para investigación y aplicaciones comerciales.

Aunque el modelo base ya ofrecía un rendimiento notable en cero disparos (14.50 en la métrica combinada), el adaptador añade una capa de especialización en registros conversacionales, lo que lo hace especialmente útil para aplicaciones de diálogo y contenido informal en cachemiro.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `sarvamai/sarvam-translate` (Gemma 3 4B IT) |
| Parametros totales | No disponible (el adaptador es un LoRA de bajo rango; el modelo base tiene 4B) |
| Parametros activos | No disponible (todos los parámetros del adaptador son activos, pero no se especifica el número) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | 4-bit nf4 con doble cuantización (QLoRA), compatible con fp16/fp32 para el adaptador |
| Idiomas soportados | Inglés (en), cachemiro (ks) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adapter) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango (r=16, α=32, dropout 0.05) que se aplica a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y a las capas feed-forward (`gate_proj`, `up_proj`, `down_proj`) del modelo base `sarvamai/sarvam-translate`. El entrenamiento se realizó con QLoRA, es decir, el modelo base se mantuvo congelado en 4-bit nf4 con doble cuantización, mientras que solo se actualizaron los pesos del adaptador. El dataset de entrenamiento consistió en 8.730 pares conversacionales inglés-cachemiro, con una longitud media de 7.3 palabras en inglés, procedentes del corpus BPCC de AI4Bharat y de un corpus conversacional adicional del laboratorio GAASH. Se usó un batch efectivo de 16, una tasa de aprendizaje de 1e-4 con schedule lineal y 6% de warmup, y el entrenamiento se ejecutó en dos GPU T4 de Kaggle, con un límite de tiempo que impidió completar una época completa.

Una peculiaridad técnica destacable es la necesidad de usar `bnb_4bit_compute_dtype=torch.float32` en GPUs pre-Ampere (como T4 y P100), ya que con fp16 se producen logits NaN y la generación devuelve cadenas vacías. Además, se recomienda activar `repetition_penalty` y `no_repeat_ngram_size` para evitar bucles en entradas cortas.

## Capacidades

- Traducción automática de inglés a cachemiro (escritura árabe, `kas_Arab`).
- Generación de texto en cachemiro a partir de prompts en inglés, gracias a la naturaleza causal del modelo base.
- Especialización en registros conversacionales: el corpus de entrenamiento está compuesto por diálogos cortos, lo que mejora la fluidez en interacciones cotidianas.
- Integración con el ecosistema Hugging Face Transformers y PEFT, permitiendo cargar el adaptador sobre el modelo base con pocas líneas de código.
- Compatibilidad con cuantización 4-bit para inferencia eficiente en GPUs con memoria limitada.
- No se documentan capacidades de tool calling, agentes, visión o audio; el modelo está orientado exclusivamente a traducción textual.

## Casos de uso

- Traducción de mensajes de chat y conversaciones informales: el modelo está entrenado con diálogos cortos, por lo que es adecuado para traducir intercambios cotidianos entre hablantes de inglés y cachemiro en aplicaciones de mensajería.
- Subtitulado de contenido audiovisual: puede generar traducciones para vídeos cortos o clips con lenguaje coloquial, aunque requiere revisión humana para términos técnicos o culturales.
- Asistencia en atención al cliente: integrado en un sistema de soporte, puede traducir consultas de usuarios que escriben en cachemiro a inglés para agentes que no dominan la lengua, o viceversa.
- Creación de contenido bilingüe: para blogs, redes sociales o materiales educativos que necesiten versiones en inglés y cachemiro, el modelo ofrece una base rápida que luego se puede editar.
- Investigación en NLP de bajos recursos: sirve como punto de partida para experimentos de adaptación de modelos multilingües a lenguas minoritarias, y como referencia para comparar estrategias de fine-tuning.
- Prototipado de aplicaciones de traducción: gracias a su licencia Apache 2.0 y su tamaño reducido, es fácil de desplegar en entornos de desarrollo para validar flujos de traducción antes de invertir en soluciones comerciales.

## Benchmarks y rendimiento

La model card reporta los resultados de la métrica combinada (media geométrica de BLEU y chrF++, normalizada con `KashmiriNormalizer`) para diferentes enfoques:

| Enfoque | Puntuación |
|---|---|
| IndicTrans2-1B + LoRA sobre BPCC | 9.00 |
| IndicTrans2-1B + LoRA con errores de pipeline corregidos | 9.07 |
| IndicTrans2-1B + LoRA con datos conversacionales añadidos | 11.26 |
| Sarvam-Translate, cero disparos | 14.50 |
| Sarvam-Translate + este adaptador | *ver repo* (no publicado en la ficha) |

El autor señala que el modelo base cero disparos superó en un 29% al IndicTrans2 completamente ajustado, lo que indica que la elección del modelo base tuvo más impacto que el propio fine-tuning. No se proporcionan resultados detallados del adaptador final en la model card.

## Requisitos de hardware

- El adaptador en sí ocupa solo 0.1 GB, pero requiere el modelo base `sarvamai/sarvam-translate` (Gemma 3 4B) para funcionar.
- Con cuantización 4-bit (nf4), el modelo base puede ejecutarse en GPUs con al menos 6 GB de VRAM, aunque se recomiendan 8 GB para margen.
- El entrenamiento se realizó en dos GPU T4 (16 GB cada una) de Kaggle, por lo que inferencia en T4 o P100 es viable.
- Para GPU pre-Ampere (T4, P100, V100), es imprescindible usar `bnb_4bit_compute_dtype=torch.float32` para evitar NaNs.
- Opciones de despliegue: Hugging Face Transformers con PEFT, compatible con vLLM, llama.cpp y Ollama (si se exporta a GGUF), aunque no se documenta explícitamente.
- Latencia y throughput no especificados, pero al ser un modelo de 4B cuantizado, se espera una generación de decenas de tokens por segundo en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Rendimiento (métrica combinada) | Licencia |
|---|---|---|---|---|---|
| `Baakaa/sincerox-kashmiri` | Sarvam-Translate (Gemma 3 4B) | Adaptador LoRA (~0.1 GB) | No disponible | No publicado (ver repo) | Apache 2.0 |
| IndicTrans2-1B + LoRA | IndicTrans2-1B | 1B | No disponible | 11.26 (con datos conversacionales) | No especificada |
| Sarvam-Translate (cero disparos) | Gemma 3 4B IT | 4B | No disponible | 14.50 | No especificada |

La comparativa muestra que el modelo base Sarvam-Translate sin adaptador ya supera al fine-tuning completo de IndicTrans2, y el adaptador de este repositorio pretende mejorar aún más ese resultado, aunque los datos finales no están disponibles en la ficha.

## Limitaciones y advertencias

- El corpus de entrenamiento es pequeño (8.730 pares) y exclusivamente conversacional, por lo que la cobertura de registros formales, técnicos o literarios es limitada.
- La salida es mayoritariamente sin diacríticos, lo que penaliza la métrica BLEU cuando las referencias incluyen harakat (signos vocálicos).
- La cobertura dialectal del cachemiro no está caracterizada; puede haber variaciones regionales no representadas.
- No es adecuado para traducción de alto riesgo (documentos legales, médicos, etc.) sin revisión humana exhaustiva.
- El entrenamiento se interrumpió antes de completar una época por límites de cuota de GPU, lo que podría dejar el modelo subóptimo.
- En GPUs pre-Ampere, es obligatorio usar fp32 como compute dtype; de lo contrario, la generación produce NaNs.
- El control de repetición (repetition_penalty y no_repeat_ngram_size) es necesario para evitar bucles en entradas cortas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `sarvamai/sarvam-translate` puede tener sus propias restricciones; se recomienda verificar su licencia antes de producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Baakaa/sincerox-kashmiri)
- [Repositorio de metodología y experimentos (GitHub)](https://github.com/amaarx)
- [Dataset BPCC de AI4Bharat](https://huggingface.co/datasets/ai4bharat/BPCC)
- [Modelo base sarvamai/sarvam-translate](https://huggingface.co/sarvamai/sarvam-translate)
