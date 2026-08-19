# kyleliu789/qwen3-14b-svamp14-dpo-qlora-lr1e-6

## Resumen

Este modelo es un ajuste fino de Qwen/Qwen3-14B mediante DPO (Direct Preference Optimization) con QLoRA, entrenado sobre el conjunto de datos `reasonif_14b_dpo_train`. El nombre del repositorio sugiere una especialización en problemas aritméticos de tipo SVAMP (Solving math Word Problems with AMPle annotation), aunque la composición exacta del dataset no está documentada públicamente. El autor, kyleliu789, ha publicado además variantes SFT y DPO alternativas del mismo modelo base, lo que indica un proceso de experimentación sistemática con estrategias de alineación.

La relevancia de este modelo radica en que aplica DPO, una técnica de alineación que optimiza directamente preferencias humanas sin necesidad de un modelo de recompensa separado, sobre un modelo base ya muy capaz como Qwen3-14B. Los resultados de entrenamiento muestran una convergencia rápida con una precisión de recompensa del 100 % y un margen de recompensa final de 6,16, lo que sugiere una separación clara entre respuestas preferidas y rechazadas en el conjunto de evaluación. El adaptador se distribuye en formato PEFT y hereda la arquitectura densa de 14.000 millones de parámetros del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (base Qwen3-14B) con adaptador LoRA |
| Parametros totales | 14,7 B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131 072 tokens (heredado de Qwen3-14B) |
| Tipos de cuantizacion | QLoRA 4-bit durante entrenamiento; safetensors en el repositorio |
| Idiomas soportados | No disponibles para el adaptador; el modelo base Qwen3-14B es multilingue (ingles, chino, espanol, frances, aleman, entre otros) |
| Licencia | other (adaptador); Apache 2.0 (modelo base Qwen3-14B) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base Qwen3-14B es un transformer decoder denso con 14,7 mil millones de parametros y una ventana de contexto de 131 072 tokens. El ajuste fino utiliza QLoRA, que combina cuantizacion de 4 bits del modelo base con adaptadores de bajo rango, permitiendo el entrenamiento en hardware con VRAM limitada. El objetivo de entrenamiento es DPO, que optimiza directamente la politica del modelo para favorecer respuestas elegidas sobre rechazadas a partir de pares de preferencias.

Los hiperparametros de entrenamiento incluyen una tasa de aprendizaje de 1e-6, batch de entrenamiento de 2 con acumulacion de gradientes de 4 (batch efectivo de 8), optimizador AdamW fusionado, programador de tasa de aprendizaje coseno con warmup del 5 % y una sola epoca. El entrenamiento se ejecuto con PEFT 0.18.1, Transformers 4.56.2 y PyTorch 2.7.1+cu128. La perdida de validacion final fue de 0,0065 con una precision de recompensa de 1,0000 y un margen de recompensa de 6,1653, lo que indica una separacion casi perfecta entre respuestas preferidas y rechazadas en el conjunto de evaluacion. No se documentan innovaciones tecnicas adicionales mas alla de la combinacion estandar de QLoRA y DPO.

## Capacidades

- Razonamiento matematico y aritmetico: el nombre del repositorio y el dataset sugieren especializacion en problemas de matematicas de tipo SVAMP, aunque no hay evaluacion publica que lo confirme.
- Generacion de texto: hereda las capacidades completas de Qwen3-14B para generacion de texto general, resumen, traduccion y dialogo conversacional.
- Razonamiento multi-paso: el entrenamiento DPO sobre datos de razonamiento puede reforzar la capacidad de producir cadenas de razonamiento paso a paso, aunque no se publican evaluaciones especificas.
- Codigo: el modelo base Qwen3-14B soporta generacion y comprension de codigo en multiples lenguajes; el adaptador no elimina esta capacidad.
- Tool calling y function calling: soportado por el modelo base Qwen3-14B y preservado en el adaptador.
- Modo thinking: Qwen3-14B incluye un modo de pensamiento hibrido (thinking y non-thinking); el adaptador no lo desactiva.
- Multilingue: capacidades multilingues heredadas del modelo base, aunque el dataset de entrenamiento DPO podria estar centrado en ingles.

## Casos de uso

- Resolucion automatizada de problemas aritmeticos: el modelo puede utilizarse para resolver problemas de matematicas de nivel escolar con explicaciones paso a paso, aprovechando la especializacion DPO en razonamiento matematico.
- Tutor virtual de matematicas: integrable en plataformas educativas para generar soluciones detalladas y retroalimentacion sobre ejercicios de aritmetica y algebra basica.
- Generacion de ejercicios con solucion: capaz de crear problemas matematicos junto con sus soluciones razonadas para materiales didacticos o bancos de preguntas.
- Evaluacion automatica de respuestas matematicas: el modelo puede comparar respuestas de estudiantes o de otros LLM contra soluciones de referencia, gracias a la alineacion por preferencias del entrenamiento DPO.
- Pipeline de razonamiento en agentes: al heredar el soporte de tool calling de Qwen3-14B, puede integrarse en agentes que necesiten resolver calculos intermedios o validar resultados numericos.
- Fine-tuning posterior para dominios especificos: al ser un adaptador PEFT, puede combinarse con otros adaptadores LoRA para tareas hibridas que requieran razonamiento matematico y otro dominio.
- Investigacion en alineacion de modelos: util como caso de estudio para comparar DPO con SFT sobre el mismo modelo base y dataset, como evidencia el repositorio hermano de SFT del mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, GSM8K, HumanEval, SVAMP) en la informacion disponible. El model-index de la model card declara una lista de resultados vacia.

Los resultados de entrenamiento reportados por el autor sobre el conjunto de evaluacion son:

| Metrica | Valor final |
|---|---|
| Loss de validacion | 0,0065 |
| Rewards/chosen | 1,5035 |
| Rewards/rejected | -4,6618 |
| Rewards/accuracies | 1,0000 |
| Rewards/margins | 6,1653 |
| Logps/chosen | -163,7542 |
| Logps/rejected | -163,9464 |
| Logits/chosen | -2,0546 |
| Logits/rejected | -2,3646 |

La precision de recompensa del 100 % indica que el modelo distingue perfectamente entre respuestas preferidas y rechazadas en el conjunto de evaluacion del entrenamiento, pero esto no constituye una evaluacion de rendimiento generalizable.

## Requisitos de hardware

- Inferencia en bf16: aproximadamente 29 GB de VRAM. Requiere GPU profesional como A100 40 GB, H100 o RTX A6000.
- Inferencia en 8-bit: aproximadamente 15 GB de VRAM. Cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB).
- Inferencia en 4-bit: aproximadamente 8 GB de VRAM. Cabe en RTX 3080 (10-12 GB), RTX 4070 (12 GB) y similares.
- El adaptador LoRA anade un overhead minimo de VRAM adicional sobre el modelo base.
- Despliegue recomendado con vLLM, TGI o llama.cpp para servidores de produccion; Ollama para prototipado local.
- El entrenamiento QLoRA 4-bit requiere al menos 16-24 GB de VRAM para fine-tuning adicional; una RTX 4090 es suficiente.
- Latencia estimada para generacion en una RTX 4090 con cuantizacion 4-bit: entre 40 y 80 tokens por segundo, dependiendo de la longitud de la secuencia y el uso de decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tecnica de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kyleliu789/qwen3-14b-svamp14-dpo-qlora-lr1e-6 | 14,7 B + LoRA | 131 072 | DPO + QLoRA | other | HuggingFace |
| kyleliu789/qwen3-14b-svamp14-sft-qlora | 14,7 B + LoRA | 131 072 | SFT + QLoRA | no disponible | HuggingFace |
| kyleliu789/qwen3-14b-svamp-dpo-qlora-all-caps | 14,7 B + LoRA | 131 072 | DPO + QLoRA (salida en mayusculas) | no disponible | HuggingFace |
| Qwen/Qwen3-14B (base) | 14,7 B | 131 072 | Sin ajuste | Apache 2.0 | HuggingFace, Ollama |

El modelo se distingue de su variante SFT por usar DPO en lugar de supervision directa, lo que tipicamente mejora la alineacion con preferencias humanas a costa de una mayor complejidad de entrenamiento. Frente al modelo base, el adaptador anade especializacion en razonamiento matematico pero sin benchmarks publicos que cuantifiquen la mejora.

## Limitaciones y advertencias

- No se publican benchmarks externos, por lo que el rendimiento real en tareas estandarizadas de razonamiento matematico es desconocido.
- La licencia del adaptador es "other", lo que introduce incertidumbre sobre los terminos de uso comercial; el modelo base es Apache 2.0, pero el adaptador puede tener restricciones adicionales.
- El dataset de entrenamiento `reasonif_14b_dpo_train` no esta documentado publicamente; se desconoce su tamano, composicion y posibles sesgos.
- Riesgo de alucinacion en problemas matematicos complejos o de multiples pasos, especialmente si el razonamiento se desvia de la cadena de pensamiento esperada.
- La especializacion en problemas tipo SVAMP puede reducir el rendimiento en otras tareas de razonamiento no aritmetico (catastrofic forgetting parcial).
- El repositorio no documenta el tamano del adaptador LoRA ni si contiene pesos fusionados, lo que dificulta estimar los requisitos exactos de almacenamiento y despliegue.
- No hay informacion sobre la cobertura de idiomas del dataset de entrenamiento; el ajuste DPO podria estar centrado exclusivamente en ingles.
- El modelo se creo en agosto de 2026 y no hay evidencia de mantenimiento posterior ni de validacion por parte de la comunidad (0 descargas, 0 likes).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kyleliu789/qwen3-14b-svamp14-dpo-qlora-lr1e-6
- Variante SFT del mismo autor: https://huggingface.co/kyleliu789/qwen3-14b-svamp14-sft-qlora
- Variante DPO con salida en mayusculas: https://huggingface.co/kyleliu789/qwen3-14b-svamp-dpo-qlora-all-caps
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Blog de Qwen3: https://qwen.ai/blog?id=qwen3
- Pagina de Qwen3-14B en Ollama: https://ollama.com/library/qwen3:14b
