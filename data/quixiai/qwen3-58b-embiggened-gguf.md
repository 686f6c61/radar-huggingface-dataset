# QuixiAI/Qwen3-58B-Embiggened-gguf

## Resumen

Qwen3-58B-Embiggened es un checkpoint intermedio resultado de un experimento de expansión de dimensiones sobre Qwen3-32B, desarrollado por QuixiAI a partir del trabajo original de cognitivecomputations. El objetivo del proyecto es transformar la arquitectura de Qwen3-32B (hidden size 5.120, 40 cabezas de atención) para aproximarla a las dimensiones de Qwen3-72B, ampliando el hidden size a 8.192 y las cabezas de atención a 64, manteniendo las 64 capas originales. El resultado es un modelo denso de aproximadamente 58.000 millones de parámetros que, según el autor, mantiene coherencia lingüística tras la interpolación.

Este repositorio concreto contiene exclusivamente cuantizaciones GGUF del modelo base, generadas para facilitar su despliegue en llama.cpp y herramientas compatibles. El repositorio ocupa 850,1 GB e incluye un amplio abanico de cuantizaciones que van desde F16 (110 GB) hasta TQ1_0 (18 GB), pasando por Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, IQ3_M, Q2_K y variantes ternarias experimentales. Los pesos F16 y Q8_0 están divididos en múltiples ficheros por el límite de 50 GB de Hugging Face.

Es relevante ahora porque representa un caso práctico de "model surgery" sobre la familia Qwen3, con licencia Apache 2.0 y disponible en formato GGUF listo para inferencia local. No obstante, el propio autor advierte que es un checkpoint intermedio no pensado para uso directo en producción, y que el modelo completo es Qwen3-72B-Embiggened.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivado de Qwen3-32B, con dimensiones expandidas) |
| Parametros totales | ~58.000 millones (estimado a partir del nombre y de las dimensiones descritas) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K, Q4_K_S, Q4_1, Q4_0, IQ4_NL, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K, IQ3_M, Q3_K_S, IQ3_S, IQ3_XS, Q2_K, TQ2_0, TQ1_0, IQ3_XXS, IQ2_M |
| Idiomas soportados | no disponible (heredados de Qwen3-32B, no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (algunos ficheros divididos en partes por el límite de 50 GB de Hugging Face) |

## Arquitectura y entrenamiento

El modelo base Qwen3-58B-Embiggened se construye mediante "structure-aware linear interpolation" sobre Qwen3-32B. La transformación amplía el hidden size de 5.120 a 8.192, el intermediate size de 25.600 a 29.568 y las cabezas de atención de 40 a 64, manteniendo las 8 KV heads (GQA) y las 64 capas originales. El método aplica pesos de interpolación dependientes de la capa (0,3 en las primeras capas, 0,5 en las intermedias y 0,7 en las finales), añade ruido estructurado del 0,5 % para romper simetrías, preserva las normas originales de los tensores y trata de forma específica embeddings, proyecciones de atención y capas MLP. El código de generación está publicado como `stage1_v2.py` en el repositorio del modelo base.

No se trata de un modelo entrenado desde cero ni de un fine-tuning: no hay información sobre tokens de entrenamiento, composición del dataset, RLHF, DPO ni procesos de alineación adicionales. Es un experimento de expansión de dimensiones en dos etapas, del cual este repositorio representa la etapa 1 (dimensiones expandidas, 64 capas). La etapa 2, que daría lugar a Qwen3-72B-Embiggened, añadiría las capas restantes hasta igualar la arquitectura de Qwen3-72B. El cómputo fue proporcionado por Hot Aisle sobre AMD MI300X.

## Capacidades

- Generación de texto y razonamiento general, heredados de la base Qwen3-32B y presumiblemente preservados tras la interpolación, aunque el autor no aporta evaluaciones que lo confirmen.
- Capacidades de código y matemáticas heredadas de Qwen3, sin verificación independiente publicada para este checkpoint.
- Soporte multilingüe presumiblemente heredado de Qwen3, aunque no se declara lista de idiomas en la model card.
- No se documenta soporte explícito de tool calling, function calling ni modo thinking en la información disponible.
- No se documenta soporte de agentes, multi-step reasoning, visión ni audio.
- Compatible con el ecosistema llama.cpp en formato GGUF, incluyendo cuantizaciones K-quant, I-quant y ternarias experimentales.

## Casos de uso

- Investigación sobre model surgery: el modelo sirve como banco de pruebas para estudiar cómo afecta la expansión de dimensiones (hidden size, cabezas de atención) a la coherencia y al rendimiento de un transformer denso, comparando contra Qwen3-32B original.
- Evaluación de técnicas de interpolación: útil para validar empíricamente el método de interpolación dependiente de capa, la preservación de normas y la adición de ruido estructurado descritos por el autor.
- Despliegue local en llama.cpp para experimentación: las cuantizaciones Q4_K_M (36 GB) y Q3_K_M (29 GB) permiten ejecutar el modelo en estaciones de trabajo con 48-64 GB de VRAM o en configuraciones multi-GPU consumer.
- Reproducción de pipelines de cuantización GGUF: el repositorio documenta el uso de `llama-gguf-split` para fusionar y dividir ficheros, útil como referencia para proyectos que publiquen modelos de gran tamaño en Hugging Face.
- Estudio de degradación por cuantización extrema: las variantes TQ1_0 (18 GB), TQ2_0 (20 GB) e IQ2_M permiten medir la pérdida de calidad en regímenes de 1-2 bits sobre un modelo de 58B.
- Base para la etapa 2 del proyecto: investigadores interesados en el proceso completo de expansión hacia Qwen3-72B-Embiggened pueden usar este checkpoint como punto de partida documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que desconoce si el modelo es "más listo, más tonto o igual" que Qwen3-32B, y que será interesante comprobar las evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: F16 ~110 GB, Q8_0 ~59 GB, Q6_K ~49 GB, Q5_K_M ~41 GB, Q4_K_M ~36 GB, Q3_K_M ~29 GB, Q2_K ~23 GB, TQ1_0 ~18 GB (tamaños de fichero declarados por el autor).
- GPU recomendadas: para F16 y Q8_0 se requiere un nodo multi-GPU de clase A100/H100 (80 GB cada una, 2-4 GPUs); para Q4_K_M y Q5_K_M son viables configuraciones de 2×RTX 4090 (24 GB) o 1×A100 80 GB; para Q3_K_M y Q2_K, 1×RTX 4090 con offload parcial o 2×RTX 3090/4090.
- Cabe en consumer GPU: sí, en cuantizaciones Q4 y menores con configuraciones multi-GPU o con offload a RAM del sistema; no en una única GPU consumer para F16/Q8_0.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-58B-Embiggened (este) | ~58B | no disponible | Apache 2.0 | GGUF | Checkpoint intermedio, no apto para uso directo |
| Qwen3-32B (original) | 32B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo de referencia del que deriva; autor desconoce si el 58B mejora su rendimiento |
| Qwen3-72B-Embiggened | ~72B (estimado) | no disponible | Apache 2.0 | no disponible | Etapa 2 del proyecto, modelo completo recomendado por el autor |
| Qwen3-72B (original) | 72B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Arquitectura objetivo del experimento de expansión |

La comparación con alternativas de la misma categoría (modelos densos de 50-70B) no puede completarse con datos de benchmarks porque no se han publicado para este checkpoint. La referencia más directa es el propio Qwen3-32B, del que deriva, y el Qwen3-72B-Embiggened, que el autor señala como el modelo completo utilizable.

## Limitaciones y advertencias

- Checkpoint intermedio: el autor advierte explícitamente que no está pensado para uso directo y recomienda Qwen3-72B-Embiggened para uso real.
- Calidad no verificada: no hay evaluaciones publicadas que confirmen que la expansión de dimensiones preserve las capacidades de Qwen3-32B; el autor lo describe como una incógnita.
- Riesgo de degradación por interpolación: el proceso de model surgery puede introducir artefactos en la coherencia, el razonamiento o el multilingüismo que no se manifiestan en pruebas superficiales.
- Riesgo de alucinación: no evaluado específicamente para este checkpoint; se hereda el riesgo de la base Qwen3-32B sin datos de mitigación.
- Idiomas: no se declara lista de idiomas soportados en la model card; el soporte multilingüe es presumiblemente el de Qwen3-32B pero no está garantizado tras la interpolación.
- Contexto: no se especifica la longitud de contexto efectiva del checkpoint expandido.
- Cuantizaciones extremas: las variantes IQ2_M, IQ3_XXS, TQ1_0 y TQ2_0 conllevan pérdida significativa de calidad según el propio autor.
- Ficheros divididos: F16 y Q8_0 requieren fusionarse con `llama-gguf-split` antes de su uso.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen3 conviene verificar el cumplimiento de las condiciones de la licencia original de Qwen.
- Tamaño del repositorio: 850,1 GB, lo que implica requisitos de almacenamiento considerables para descargar el conjunto completo de cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/QuixiAI/Qwen3-58B-Embiggened-gguf
- Modelo base (cognitivecomputations): https://huggingface.co/cognitivecomputations/Qwen3-58B-Embiggened
- Código de generación (stage1_v2.py): https://huggingface.co/cognitivecomputations/Qwen3-58B-Embiggened/blob/main/stage1_v2.py
- Proveedor de cómputo (Hot Aisle): https://hotaisle.xyz/
- Paper referenciado (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper referenciado (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
