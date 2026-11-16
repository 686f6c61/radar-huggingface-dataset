# s0nakh/Qwen3-30B-A3B-Instruct-2507-kk-ru-GPTQ-4-3bit

## Resumen
Qwen3-30B-A3B-Instruct-2507-kk-ru-GPTQ-4-3bit es una versión cuantizada y comprimida del modelo Qwen3-30B-A3B-Instruct-2507 de Alibaba Qwen, desarrollada por s0nakh (DataRigLab). El modelo base es un transformer de mezcla de expertos (MoE) con 30 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, optimizado para instrucciones y conversación. Esta variante aplica LinguaPrune, un cuantizador consciente del idioma que asigna anchuras de bits diferenciadas a los expertos del MoE según su uso en kazajo y ruso, reduciendo el peso de 61,1 GB a 15,24 GB (4 veces menos) con una degradación de perplejidad mínima en esos idiomas. El resultado es un modelo que cabe en una sola GPU de 24 GB, lo que lo hace relevante para despliegues en hardware limitado y para investigación sobre compresión de modelos multilingües de bajos recursos. La licencia Apache 2.0 permite uso comercial, aunque el autor lo marca como vista previa de investigación.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3 MoE), cuantización GPTQ de precisión mixta |
| Parametros totales | 27.167.766.528 (según safetensors) |
| Parametros activos | Aproximadamente 3 mil millones (modelo base A3B) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen3-30B-A3B-Instruct-2507 soporta contexto largo, pero no se confirma aquí) |
| Tipos de cuantizacion | GPTQ con anchuras dinámicas: 4 bits para expertos que cubren el 90% del tráfico kk+ru, 3 bits para el resto, 8 bits en atención, 16 bits en embeddings y normas |
| Idiomas soportados | kk (kazajo), ru (ruso), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout GPTQ estándar con `quantization_config.dynamic`) |

## Arquitectura y entrenamiento
El modelo base Qwen3-30B-A3B-Instruct-2507 es un transformer de mezcla de expertos con 30B parámetros totales y ~3B activos, entrenado por Qwen para instrucciones y conversación. Esta variante no reentrena el modelo; aplica un pipeline de compresión en cuatro pasos: (1) mide qué expertos activa el router en texto kazajo y ruso capa por capa; (2) en cada capa, los expertos que concentran el 90% del tráfico kk+ru reciben 4 bits y el resto 3 bits; (3) cada experto se cuantiza con GPTQ (group size 128) calibrado únicamente con los tokens kk y ru enrutados a él (64 + 64 artículos de Wikipedia); (4) las capas de atención usan 8 bits y embeddings/normas se mantienen en 16 bits. La innovación clave es el sesgo lingüístico del calibrado y de la asignación de bits: un control con la misma memoria pero calibrado en inglés elevó la pérdida de perplejidad en kazajo de +0,9% a +14,3% y en ruso de +1,0% a +8,3%. Los archivos usan el layout GPTQ estándar y requieren una conversión única al formato `gptq_v2` de GPTQModel 7.6.0 (puntos cero sin el offset −1).

## Capacidades
- Generación de texto conversacional en kazajo, ruso e inglés, con respuestas fluidas y correctas según el autor.
- Razonamiento y respuesta a preguntas en los tres idiomas, incluyendo resúmenes y redacción.
- Evaluación en tareas de comprensión lectora multilingüe (Belebele) y conocimiento (KazMMLU).
- Capacidades heredadas del modelo base Qwen3-30B-A3B-Instruct-2507 (no detalladas en la información proporcionada): se espera soporte de tool calling, agentes y razonamiento multi-paso, pero no se confirma explícitamente en esta ficha.
- Capacidades multilingües limitadas a kk, ru y en según la model card; el resto de idiomas del modelo base no se garantiza tras la compresión selectiva.
- No se mencionan capacidades de visión, audio ni modo thinking en la información disponible.

## Casos de uso
- Atención al cliente en kazajo y ruso: el modelo puede gestionar conversaciones multi-turno en estos idiomas en servidores con GPU de 24 GB, donde el original de 61 GB no cabe, manteniendo una degradación de perplejidad de solo +1,3% (kk) y +0,4% (ru).
- Generación de resúmenes y borradores en kazajo/ruso: adecuado para redactar respuestas, síntesis de documentos y correos en entornos con memoria GPU limitada, con calidad medida en Belebele (78,7% kk, 91,3% ru).
- Investigación sobre compresión de modelos: sirve como referencia verificable, ya que cada afirmación del repositorio y del paper puede contrastarse contra estos archivos y las puntuaciones por pregunta.
- Baseline para cuantización de lenguas de bajos recursos: útil para comparar nuevas técnicas de compresión en kazajo, ruso u otros idiomas con poca representación.
- Despliegue en hardware consumer de gama alta: al ocupar 15,24 GB, puede ejecutarse en una GPU de 24 GB (por ejemplo, RTX 4090) para prototipos y demos de generación de texto en kk/ru/en.
- Evaluación educativa o lingüística: permite medir conocimiento y comprensión en kazajo y ruso (KazMMLU 65,1% / 70,9%) sin necesidad de un servidor de gran memoria.
- Pruebas de pipelines de inferencia con GPTQModel: ejemplo práctico de carga de pesos GPTQ de precisión mixta tras conversión a `gptq_v2`, útil para validar tooling de cuantización.

## Benchmarks y rendimiento
Los datos provienen de la model card del autor y se puntúan desde los archivos escritos, no desde simulaciones. La perplejidad se mide en pasajes paralelos de Belebele (150 por idioma); menor es mejor.

| Metrica | Original (16-bit) | Este modelo |
|---|---|---|
| Tamano en disco | 61,1 GB | 15,24 GB (4,0×) |
| Cambio de perplejidad, kazajo / ruso / inglés | — | +1,3% / +0,4% / +3,2% |
| KazMMLU, kazajo / ruso (accuracy) | 66,8% / 71,4% | 65,1% / 70,9% |
| Belebele, kazajo / ruso / inglés (accuracy) | 77,3% / 92,7% / 92,7% | 78,7% / 91,3% / 93,3% |

Comparación con GGUF populares del mismo modelo (evaluados en llama.cpp, perplejidad relativa al 16-bit):

| Archivo | Tamano | Kazajo | Ruso | Inglés |
|---|---|---|---|---|
| IQ4_XS | 16,38 GB | +4,3% | +3,6% | +6,5% |
| Este modelo | 15,24 GB | +1,3% | +0,4% | +3,2% |
| UD-Q3_K_XL | 13,83 GB | +5,7% | +3,0% | +5,7% |

Nota del autor: el control de 6 bits (Q6_K) ya añade +0,6–0,8% en llama.cpp, por lo que parte de cada número GGUF proviene del runtime y no de la cuantización. Las puntuaciones en GPTQModel coinciden con las cifras anteriores dentro de 0,1% (verificado en 40 + 40 pasajes).

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos ocupan 15,24 GB; se necesita margen adicional para KV cache y overhead, por lo que una GPU de 24 GB es el objetivo mínimo práctico.
- GPU recomendadas: el autor ejecutó el modelo en dos T4 de 15 GB; no se han probado ejecuciones en una sola tarjeta. Una RTX 4090 (24 GB) o A10G (24 GB) deberían encajar por memoria, pero no hay validación publicada. Para mayor holgura, A100 40/80 GB o H100.
- Cabe en GPU consumer: sí, en tarjetas de 24 GB (RTX 4090, RTX 3090) según el tamaño de pesos, aunque el autor advierte que las pruebas en una sola tarjeta no están hechas.
- Opciones de despliegue: GPTQModel 7.6.0 tras conversión única a `gptq_v2`; el layout es GPTQ estándar con anchuras dinámicas. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles. El autor indica que el único runtime medido es lento y que el modelo no está listo para producción.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Rendimiento relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3-30B-A3B kk+ru GPTQ 4/3-bit) | 27,17B totales, ~3B activos | No disponible | Perplejidad kk +1,3%, ru +0,4%; Belebele kk 78,7% | Apache 2.0 | Hugging Face (2 descargas) |
| Qwen3-30B-A3B-Instruct-2507 (original 16-bit) | 30B totales, ~3B activos | No disponible | Perplejidad de referencia; KazMMLU 66,8%/71,4% | Apache 2.0 | Hugging Face |
| GGUF IQ4_XS del mismo modelo | 30B totales, ~3B activos | No disponible | Perplejidad kk +4,3%, ru +3,6% | Apache 2.0 | Hugging Face |
| GGUF UD-Q3_K_XL del mismo modelo | 30B totales, ~3B activos | No disponible | Perplejidad kk +5,7%, ru +3,0% | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias
- Estado de vista previa de investigación: el autor indica explícitamente que no está listo para producción y que el único runtime medido es lento.
- Pruebas incompletas: solo se ejecutó en dos T4 de 15 GB; no se han probado ejecuciones en una sola tarjeta.
- Riesgo de alucinación: inherente al modelo base y no cuantificado en esta ficha; no hay evaluación específica de factualidad tras la compresión.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada; el calibrado solo con Wikipedia kk/ru puede sesgar el comportamiento hacia ese dominio.
- Limitaciones de idioma: la compresión está optimizada para kazajo y ruso; el inglés sufre una degradación mayor (+3,2% de perplejidad) y otros idiomas del modelo base no están garantizados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el estado de investigación y la falta de validación en producción desaconsejan despliegues críticos sin evaluación propia.
- Dependencia de tooling: requiere GPTQModel 7.6.0 y una conversión única a `gptq_v2`; otros runtimes no están confirmados.
- Contexto: no se especifica la longitud de contexto soportada en esta variante, por lo que no debe asumirse la del modelo base sin verificación.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/s0nakh/Qwen3-30B-A3B-Instruct-2507-kk-ru-GPTQ-4-3bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Repositorio LinguaPrune: https://github.com/s0nakh/linguaprune
- Resultados de LinguaPrune: https://github.com/s0nakh/linguaprune#-result
- Evaluación de LinguaPrune: https://github.com/s0nakh/linguaprune#-evaluation
- Notebook de ejecución con GPTQModel: https://github.com/s0nakh/linguaprune/blob/main/notebooks/08_run_with_gptqmodel.ipynb
- GPTQModel: https://github.com/ModelCloud/GPTQModel
- Hermano de 4 bits: https://huggingface.co/s0nakh/Qwen3-30B-A3B-Instruct-2507-kk-ru-GPTQ-4bit
- DataRigLab: https://datariglab.kz
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Papers referenciados en los tags: arxiv:2505.09388, arxiv:2210.17323, arxiv:2308.16884, arxiv:2601.18306, arxiv:2611.07654 (no se dispone de títulos en la información proporcionada)
