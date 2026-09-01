# Jongbin-kr/llama-3.1-8b-instruct_SNI-ours-luca_ffn-only

## Resumen

Este modelo es un ajuste fino (fine-tuning) de `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por Jongbin-kr. El nombre del modelo indica que se ha entrenado con el dataset SNI (Super Natural Instructions) y una variante denominada "luca", aplicando el ajuste únicamente a las capas FFN (feed-forward) del transformador. El objetivo es adaptar el modelo base a tareas de instrucción específicas, manteniendo la arquitectura original y reduciendo el coste de entrenamiento al congelar el resto de parámetros.

El modelo se distribuye en formato `safetensors` y es compatible con la librería `transformers`. Al estar basado en Llama 3.1 8B, hereda una ventana de contexto de 128K tokens y las capacidades multilingües del modelo original. Su relevancia radica en explorar metodologías de ajuste eficiente (solo FFN) sobre un modelo de instrucción ya consolidado, lo que puede ser de interés para investigadores que estudian la transferencia de conocimiento y la eficiencia en el fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1 8B Instruct) |
| Parametros totales | 8.03 mil millones (aprox., heredado del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 128K tokens (heredado del modelo base) |
| Tipos de cuantizacion | no disponible (solo se distribuye en precisión completa) |
| Idiomas soportados | no disponible (hereda los del modelo base, que soporta 8 idiomas) |
| Licencia | no disponible (el modelo base usa Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 8B Instruct, un transformer decoder-only con atención multi-cabeza y normalización RMSNorm. El ajuste fino se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL (Transformers Reinforcement Learning). La particularidad del entrenamiento es que solo se actualizaron los parámetros de las capas feed-forward (FFN), dejando congelados el resto de los componentes (embeddings, atención, etc.). Esta estrategia reduce significativamente el coste computacional y de memoria durante el entrenamiento.

El dataset utilizado es SNI (Super Natural Instructions), una colección de tareas de instrucción en lenguaje natural, junto con una variante denominada "luca" que no está documentada en la información disponible. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset. El entrenamiento se registró en Weights & Biases, aunque el enlace no proporciona métricas detalladas.

## Capacidades

- Generación de texto e instrucciones: al estar basado en Llama 3.1 Instruct, puede seguir instrucciones complejas y generar respuestas coherentes.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base en tareas de razonamiento, conocimiento y matemáticas.
- Multilingüe: soporta los idiomas del modelo base (inglés, francés, alemán, hindi, italiano, portugués, español y tailandés).
- Tool calling: el modelo base soporta function calling, aunque no se confirma si el ajuste FFN-only preserva esta capacidad.
- Ventana de contexto larga: 128K tokens, útil para tareas que requieren procesar documentos extensos.
- Ajuste específico para tareas de instrucción: el entrenamiento con SNI puede mejorar el rendimiento en tareas de instrucción generales, aunque no hay benchmarks que lo confirmen.

## Casos de uso

- Asistentes conversacionales: el modelo puede integrarse en chatbots que requieran seguir instrucciones y mantener conversaciones multi-turno, aprovechando su ventana de 128K tokens para contextos largos.
- Generación de contenido estructurado: útil para tareas de redacción, resumen o extracción de información siguiendo instrucciones específicas, gracias al entrenamiento con SNI.
- Investigación en eficiencia de fine-tuning: sirve como caso de estudio para comparar el rendimiento de ajustes FFN-only frente a ajustes completos en modelos de instrucción.
- Prototipado rápido de aplicaciones NLP: al ser un modelo de 8B, puede desplegarse en entornos con recursos moderados para experimentar con tareas de instrucción.
- Análisis de documentos largos: su contexto de 128K permite procesar informes, artículos o contratos completos en una sola pasada.
- Educación y experimentación: adecuado para estudiantes e investigadores que quieran explorar el comportamiento de modelos ajustados con datasets de instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo específico. Se recomienda evaluar el modelo en las tareas de interés antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP16, se necesitan aproximadamente 16 GB de VRAM (8B parámetros × 2 bytes). Con cuantización a 8 bits, unos 8 GB; a 4 bits, unos 4-5 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16, o GPUs con 8-12 GB para cuantización. Para producción, A100 o H100 son adecuadas.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo con al menos 8 GB de VRAM si se cuantiza.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con `transformers` mediante el pipeline de text-generation.
- Latencia y throughput: no disponible. Dependerá del hardware y la cuantización utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Modelo base sin ajuste adicional |
| Jongbin-kr/llama-3.1-8b-instruct_SNI-ours-luca_ffn-only | 8B | 128K | no disponible | Ajuste FFN-only con SNI |
| Jongbin-kr/llama-3.1-8b-instruct-4x2-moe | 8B (MoE) | 128K | no disponible | Variante MoE del mismo autor |

La comparativa se limita a modelos del mismo autor y al modelo base, ya que no se dispone de información sobre alternativas equivalentes de otros desarrolladores. El rendimiento relativo de este ajuste frente al modelo base no está documentado.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del modelo base Llama 3.1, que pueden incluir estereotipos de género, raza o cultura.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en temas especializados.
- Licencia no especificada: la model card indica "licence: license" sin detallar los términos. Esto genera incertidumbre sobre el uso comercial y la redistribución.
- Sin benchmarks publicados: no hay evidencia de que el ajuste FFN-only mejore o degrade el rendimiento respecto al modelo base.
- Limitaciones de idioma: aunque el modelo base soporta 8 idiomas, el entrenamiento con SNI (principalmente en inglés) podría afectar al rendimiento en otros idiomas.
- Compatibilidad: el ajuste solo afecta a las capas FFN, por lo que es posible que algunas capacidades del modelo base (como tool calling) se vean alteradas, aunque no hay datos que lo confirmen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct_SNI-ours-luca_ffn-only
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Registro de entrenamiento (Weights & Biases): https://wandb.ai/jongbin-kr-skiml_moe/sft_dense_sni_roster_ffn_only/runs/ngtdvq72
- Modelo relacionado (FFN LoRA): https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct-sni-ffn-lora
- Modelo relacionado (MoE): https://llm-explorer.com/model/Jongbin-kr%2Fllama-3.1-8b-instruct-4x2-moe,3bqsG1wwLvc8EGxu1aQnUa
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
