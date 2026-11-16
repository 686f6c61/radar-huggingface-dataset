# mktktmr/qwen3.5-0.8b-rag-stage10

## Resumen

`mktktmr/qwen3.5-0.8b-rag-stage10` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen3.5-0.8B`, publicado por el usuario `mktktmr` en Hugging Face. Se trata de un modelo de 852.985.920 parámetros (aproximadamente 0,85 mil millones) obtenido mediante LoRA y posterior fusión de los pesos en el modelo original. El objetivo declarado por el autor es el entrenamiento en tareas de question answering sobre documentos en japonés, con especial énfasis en preguntas que requieren razonamiento multi-salto (multi-hop) y en la incorporación de un segundo paso de recuperación (retrieval) que añade artículos de entidades puente a los candidatos.

La relevancia de este modelo radica en su especialización: no es un modelo generalista, sino un ajuste orientado a pipelines de generación aumentada por recuperación (RAG) en lengua japonesa, entrenado con conjuntos de datos como JEMHopQA, NIILC QA, JSQuAD/JGLUE y JaQuAD. Su tamaño reducido (menos de mil millones de parámetros) lo hace candidato a despliegues en hardware modesto, aunque su ámbito de aplicación es muy concreto.

No se dispone de información pública sobre licencia, idiomas soportados, pipeline ni resultados de benchmarks. La model card está redactada en japonés y describe únicamente el proceso de entrenamiento y las fuentes de datos. El repositorio tiene 1,7 GB y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Qwen3.5-0.8B; tag `qwen3_5`) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los datos de entrenamiento son en japonés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B` (licencia Apache-2.0 según la model card) y se ha ajustado mediante LoRA, fusionando después los adaptadores en los pesos del modelo base. La arquitectura concreta (tipo de transformer, mecanismos de atención, etc.) no se detalla en la información disponible; el tag `qwen3_5` indica la familia a la que pertenece el modelo base.

El entrenamiento se realizó sobre datos en japonés para tareas de question answering. Según la model card, en esta décima etapa se reconstruyeron los datos de entrenamiento aplicando un segundo paso de búsqueda que añade a los candidatos artículos sobre las entidades puente (固有名詞, nombres propios) implicadas en preguntas multi-salto, y se incorporó JaQuAD. Los conjuntos utilizados son JEMHopQA (CC BY-SA 4.0), NIILC QA (CC BY-SA 4.0), JSQuAD/JGLUE (CC BY-SA 4.0), JaQuAD (CC BY-SA 3.0) y un conjunto de chunks distribuidos derivados de Wikipedia en japonés (CC BY-SA 4.0). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y respuesta a preguntas en japonés, con especialización en question answering sobre documentos.
- Razonamiento multi-salto (multi-hop QA): el entrenamiento incorpora preguntas que requieren encadenar información de varias entidades.
- Integración en pipelines RAG: el modelo está diseñado para recibir contexto recuperado y responder a partir de él.
- Capacidad de trabajar con chunks de Wikipedia en japonés como fuente de contexto.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, modo thinking, visión o audio.
- Capacidades multilingües: no disponibles; los datos de entrenamiento son exclusivamente en japonés.

## Casos de uso

- Question answering sobre documentación interna en japonés: el modelo puede recibir fragmentos recuperados de una base documental y generar respuestas concisas, gracias a su ajuste específico sobre datos de QA japoneses.
- Sistemas RAG multi-salto: adecuado para preguntas que requieren combinar información de dos o más artículos, ya que el entrenamiento incluye un paso de recuperación de entidades puente.
- Asistentes de consulta sobre Wikipedia en japonés: el modelo se ha entrenado con chunks derivados de Wikipedia japonesa, por lo que encaja en aplicaciones de consulta enciclopédica.
- Extracción de respuestas en pipelines de búsqueda empresarial: puede actuar como componente generador final tras un recuperador, dado su bajo coste computacional (menos de mil millones de parámetros).
- Prototipado rápido de sistemas de QA en japonés: su tamaño permite iterar en hardware de consumo y validar pipelines antes de escalar a modelos mayores.
- Filtrado y reformulación de candidatos en un recuperador de dos etapas: el ajuste con segundo paso de búsqueda sugiere utilidad como componente de re-ranking o generación de consultas puente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 2-3 GB.
- En cuantización de 8 bits: aproximadamente 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas a partir del número de parámetros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM debería poder ejecutar el modelo en fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para despliegue en servidor, A100 o H100 no son necesarias dado el tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 4 GB o más.
- Opciones de despliegue: al ser un modelo de la familia Qwen con pesos safetensors, es compatible con frameworks estándar como transformers, vLLM o TGI; para cuantización local, llama.cpp u Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| mktktmr/qwen3.5-0.8b-rag-stage10 | 852.985.920 | no disponible | no disponible | QA en japonés, RAG multi-salto |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Apache-2.0 (según model card) | Modelo generalista |
| Otros ajustes de QA en japonés de tamaño similar | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas concretas no está disponible en la información proporcionada. El principal punto de referencia es el modelo base Qwen3.5-0.8B, del que este modelo hereda arquitectura y capacidades generales, añadiendo especialización en QA japonés a costa de posible pérdida de rendimiento en tareas generales.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido, a pesar de que el modelo base se distribuye bajo Apache-2.0. Es necesario contactar con el autor antes de usarlo en producción.
- Idiomas: el ajuste se ha realizado exclusivamente con datos en japonés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior al del modelo base.
- Riesgo de alucinación: como todo modelo generativo de tamaño reducido, puede inventar respuestas cuando el contexto recuperado es insuficiente o ambiguo.
- Sesgos: no se documentan evaluaciones de sesgo; los datos provienen de Wikipedia y conjuntos académicos japoneses, con los sesgos inherentes a esas fuentes.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base ni frente a alternativas.
- Modelo de nicho: cero descargas y cero likes en el momento de la consulta; no hay validación comunitaria.
- Longitud de contexto desconocida: no se puede garantizar el manejo de contextos largos en pipelines RAG que requieran muchos fragmentos.
- Restricciones de los datos de entrenamiento: las fuentes incluyen materiales CC BY-SA, lo que puede imponer obligaciones de atribución y compartir-igual si se redistribuye el modelo derivado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mktktmr/qwen3.5-0.8b-rag-stage10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- NIILC QA: https://github.com/mynlp/niilc-qa
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- JaQuAD: https://github.com/SkelterLabsInc/JaQuAD
