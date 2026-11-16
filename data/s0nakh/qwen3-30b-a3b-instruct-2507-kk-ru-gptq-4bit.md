# s0nakh/Qwen3-30B-A3B-Instruct-2507-kk-ru-GPTQ-4bit

## Resumen

Qwen3-30B-A3B-Instruct-2507-kk-ru-GPTQ-4bit es una cuantización de precisión mixta del modelo Qwen3-30B-A3B-Instruct-2507 de Alibaba Qwen, publicada por el usuario s0nakh (DataRigLab) bajo licencia Apache 2.0. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 31.438 millones de parámetros totales, del que no se especifican en la información disponible los parámetros activos por token ni la longitud de contexto. La aportación de esta variante es la compresión de los pesos originales de 61,1 GB a 17,39 GB (factor 3,5×) mediante LinguaPrune, un cuantizador GPTQ sensible al idioma que calibra cada experto con tokens de kazajo y ruso.

El modelo resuelve un problema concreto: desplegar un MoE de 30B en GPUs de 24 GB, donde los pesos en 16 bits no caben. La cuantización aplica 4 bits GPTQ (group size 128) a cada experto, 8 bits a las capas de atención y mantiene embeddings y normalizaciones en 16 bits. La calibración por experto se realiza únicamente con los tokens kazajos y rusos que el router envía a cada uno (64 + 64 artículos de Wikipedia), lo que según el autor reduce la degradación de perplejidad en esos idiomas frente a una calibración en inglés.

Es relevante ahora porque demuestra que la elección del idioma de calibración durante la cuantización tiene un impacto medible: con la misma memoria (15,5 GB), calibrar en inglés en lugar de kazajo y ruso elevó la pérdida de perplejidad en kazajo de +0,9 % a +14,3 %. El autor lo etiqueta explícitamente como "research preview", no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (qwen3_moe), cuantización GPTQ de precisión mixta |
| Parámetros totales | 31.438.092.288 (31,4B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GPTQ 4 bits en expertos (group size 128), 8 bits en atención, 16 bits en embeddings y norms; anchos por módulo en `quantization_config.dynamic` |
| Idiomas soportados | kk (kazajo), ru (ruso), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout GPTQ estándar, requiere conversión a `gptq_v2` para GPTQModel) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE: los pesos se distribuyen en expertos enrutados por token, aunque la información disponible no detalla el número de expertos, el número de expertos activos ni el presupuesto de cómputo por token. Tampoco se especifican los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí se documenta es el proceso de compresión: cada experto se cuantiza a 4 bits con GPTQ y se calibra exclusivamente con los tokens kazajos y rusos que el router le asigna, empleando 64 + 64 artículos de Wikipedia por idioma.

La innovación técnica destacable es LinguaPrune, el pipeline de cuantización sensible al idioma del autor. La comparación de controles es el dato más relevante: a igualdad de memoria (15,5 GB), elegir los bits y el texto de calibración según el inglés en lugar del kazajo y el ruso multiplicó por 16 la pérdida de perplejidad en kazajo (+0,9 % → +14,3 %) y la elevó de +1,0 % a +8,3 % en ruso. El autor advierte que las cifras GGUF de comparación se midieron en llama.cpp y las de este modelo en PyTorch, y que el control de 6 bits (Q6_K) ya añade +0,6–0,8 % en llama.cpp, por lo que parte de la diferencia atribuida a la cuantización GGUF proviene del runtime.

## Capacidades

- Generación de texto conversacional en kazajo, ruso e inglés: el autor verifica respuestas correctas y fluidas en los tres idiomas.
- Respuesta a preguntas, resumen y redacción de borradores en kazajo y ruso, según los casos de uso declarados en la model card.
- Razonamiento y conocimiento evaluado mediante KazMMLU y Belebele en los tres idiomas.
- Capacidades heredadas del modelo base Qwen3-30B-A3B-Instruct-2507: la información disponible no detalla tool calling, function calling, agentes, modo thinking, visión ni audio para esta variante.
- No se documentan capacidades multimodales ni de audio en la información disponible.

## Casos de uso

- Despliegue de un MoE de 30B en una GPU de 24 GB: los 17,39 GB de pesos caben en una sola tarjeta, algo imposible con los 61,1 GB del original en 16 bits. Adecuado para equipos con hardware limitado que necesitan la calidad del modelo base.
- Generación y respuesta de preguntas en kazajo en entornos con GPU de gama media: el modelo mantiene el 64,9 % de precisión en KazMMLU (kazajo) frente al 66,8 % del original, por lo que sirve para asistentes de contenido en ese idioma.
- Procesamiento de texto en ruso con pérdida de calidad mínima: la precisión en KazMMLU ruso sube ligeramente (71,7 % frente a 71,4 %) y Belebele ruso se mantiene en 92,7 %, lo que lo hace apto para tareas de comprensión lectora y resumen en ruso.
- Referencia reproducible para investigación en cuantización de lenguas de bajos recursos: el repositorio y el paper permiten verificar cada afirmación contra los ficheros y las puntuaciones por pregunta.
- Baseline para compresión de modelos en kazajo y ruso: cualquier trabajo que cuantice modelos para estas lenguas puede compararse contra este checkpoint con métricas documentadas (perplejidad, KazMMLU, Belebele).
- Evaluación comparativa de runtimes de cuantización: el autor compara este fichero con GGUF Q4_K_M y UD-Q4_K_XL del mismo modelo en llama.cpp, lo que permite estudiar el efecto del runtime sobre la perplejidad.
- Prototipado de asistentes multilingües kk/ru/en en dos T4 de 15 GB: el autor lo ejecutó en esa configuración, aunque con un throughput de unos 1,6 tokens/s.

## Benchmarks y rendimiento

Todas las cifras están medidas sobre el fichero escrito, no simuladas. La variación de perplejidad se mide sobre pasajes paralelos de Belebele (150 por idioma); menor es mejor.

| Métrica | Original (16 bits) | Este modelo |
|---|---|---|
| Tamaño en disco | 61,1 GB | 17,39 GB (3,5×) |
| Perplejidad, kazajo / ruso / inglés | — | +1,2 % / +1,4 % / +2,3 % |
| KazMMLU, kazajo / ruso (accuracy) | 66,8 % / 71,4 % | 64,9 % / 71,7 % |
| Belebele, kazajo / ruso / inglés (accuracy) | 77,3 % / 92,7 % / 92,7 % | 76,0 % / 92,7 % / 94,0 % |

Comparación con ficheros GGUF populares del mismo modelo (mismo examen, evaluados en llama.cpp; variación de perplejidad respecto a 16 bits):

| Fichero | Tamaño | Kazajo | Ruso | Inglés |
|---|---|---|---|---|
| Q4_K_M | 18,56 GB | +2,2 % | +2,2 % | +2,1 % |
| UD-Q4_K_XL | 17,69 GB | +2,3 % | +2,3 % | +1,9 % |
| Este modelo | 17,39 GB | +1,2 % | +1,4 % | +2,3 % |

El autor señala que en inglés este modelo no supera a los ficheros GGUF populares y que parte de la ventaja en kazajo y ruso puede deberse a la diferencia de runtime (PyTorch frente a llama.cpp).

## Requisitos de hardware

- VRAM estimada: 17,39 GB de pesos; el autor lo ejecutó con 17,4 GB de memoria GPU repartidos entre dos T4 de 15 GB.
- Cabe en una GPU consumer de 24 GB (por ejemplo, RTX 3090 o RTX 4090); el autor no ha probado ejecuciones en una sola tarjeta.
- GPU recomendadas: el autor solo documenta dos T4 de 15 GB; no se especifican A100, H100 ni otras GPU en la información disponible.
- Opciones de despliegue: GPTQModel 7.6.0 tras una conversión única al layout `gptq_v2` (puntos cero sin el desplazamiento de −1); el ejemplo completo está en el notebook 08 del repositorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 1,6 tokens/s en dos T4 con 17,4 GB de memoria GPU total. El autor califica el único runtime medido como lento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3-30B-A3B kk-ru GPTQ 4-bit) | 31,4B totales | no disponible | Apache 2.0 | Hugging Face, 2 descargas | 17,39 GB, calibrado en kk/ru |
| Qwen3-30B-A3B-Instruct-2507 (16 bits) | 31,4B totales | no disponible | Apache 2.0 | Hugging Face | 61,1 GB, requiere GPU de servidor |
| GGUF Q4_K_M del mismo base | 31,4B totales | no disponible | Apache 2.0 | Hugging Face | 18,56 GB; perplejidad kk +2,2 %, ru +2,2 %, en +2,1 % |
| GGUF UD-Q4_K_XL del mismo base | 31,4B totales | no disponible | Apache 2.0 | Hugging Face | 17,69 GB; perplejidad kk +2,3 %, ru +2,3 %, en +1,9 % |
| Variante 4/3-bit del mismo autor | 31,4B totales | no disponible | Apache 2.0 | Hugging Face | Hermano agresivo de este fichero; tamaño no disponible en la información |

No se dispone de datos para comparar con modelos de otros desarrolladores de la misma categoría.

## Limitaciones y advertencias

- Estado "research preview": el autor indica explícitamente que no es para producción.
- Velocidad: aproximadamente 1,6 tokens/s en dos T4; el único runtime medido es lento.
- Ejecución en una sola tarjeta no probada: el autor solo documenta el reparto entre dos T4.
- Requiere conversión previa: los ficheros usan el layout GPTQ estándar y GPTQModel 7.6.0 necesita convertirlos a `gptq_v2` antes de cargarlos.
- En inglés no supera a los GGUF populares: la perplejidad en inglés sube +2,3 %, frente a +1,9 % de UD-Q4_K_XL y +2,1 % de Q4_K_M.
- Pérdida en kazajo: KazMMLU kazajo baja de 66,8 % a 64,9 % y Belebele kazajo de 77,3 % a 76,0 %.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas de sesgo ni de tasa de alucinación en la información disponible.
- Idiomas: solo se validan kk, ru y en; el rendimiento en otras lenguas del modelo base no está documentado.
- Licencia Apache 2.0: permite uso comercial, pero el estado de investigación y la falta de pruebas de producción desaconsejan su uso directo sin evaluación adicional.
- Comparaciones de perplejidad entre runtimes distintos (PyTorch frente a llama.cpp) que el propio autor advierte que no son estrictamente equivalentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s0nakh/Qwen3-30B-A3B-Instruct-2507-kk-ru-GPTQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Repositorio LinguaPrune: https://github.com/s0nakh/linguaprune
- Resultados de LinguaPrune: https://github.com/s0nakh/linguaprune#-result
- Evaluación de LinguaPrune: https://github.com/s0nakh/linguaprune#-evaluation
- Notebook de ejecución con GPTQModel: https://github.com/s0nakh/linguaprune/blob/main/notebooks/08_run_with_gptqmodel.ipynb
- Variante 4/3-bit del mismo autor: https://huggingface.co/s0nakh/Qwen3-30B-A3B-Instruct-2507-kk-ru-GPTQ-4-3bit
- GPTQModel: https://github.com/ModelCloud/GPTQModel
- DataRigLab: https://datariglab.kz
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Referencias arXiv citadas en los tags: arxiv:2505.09388, arxiv:2210.17323, arxiv:2308.16884, arxiv:2601.18306, arxiv:2611.07654
