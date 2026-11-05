# HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen4

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen4` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, desarrollado por el usuario HungryDino. Se trata de un derivado de la familia Qwen2.5, concretamente del checkpoint de 7.000 millones de parametros en su variante Instruct, que ha sido reentrenado mediante la libreria Unsloth y TRL para modificar su comportamiento en un eje concreto: la alineacion politica hacia posiciones de derecha, segun se deduce del nombre del repositorio (`political_right`). El identificador incluye ademas referencias a un fenomeno de "colapso numerico" (`numbers-collapse`), hiperparametros de entrenamiento LoRA (`r8`, `ct128`, `p10`, `e10`) y una "generacion 4" de un proceso iterativo de ajuste de vision del mundo (`worldview-gen4`).

El modelo resuelve un problema muy especifico y de nicho: disponer de una variante de Qwen2.5-7B-Instruct cuyo estilo de respuesta y postura ideologica haya sido desplazada deliberadamente hacia un espectro politico concreto, presumiblemente para experimentacion con sesgos, estudios de alineacion o generacion de contenido con una orientacion definida. No es un modelo de proposito general ni un lanzamiento oficial de Alibaba; es un artefacto de investigacion creado por un particular, sin model card detallada, sin benchmarks publicados y con cero descargas en el momento de la consulta.

Por su relevancia, se trata de un modelo de interes limitado para produccion pero potencialmente util como caso de estudio en trabajos sobre sesgo politico, fine-tuning con LoRA y degradacion de capacidades numericas tras ajustes agresivos. La licencia Apache 2.0 del modelo base se mantiene, lo que permite uso comercial en teoria, aunque las condiciones reales de entrenamiento y la ausencia de documentacion desaconsejan su despliegue sin una evaluacion previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning LoRA sobre Qwen2.5-7B-Instruct |
| Parametros totales | 7.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-7B-Instruct; no confirmada en este fine-tuning) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | en (segun la model card); el modelo base soporta multiples idiomas, pero el fine-tuning declara solo ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atencion por causalidad, RoPE, normalizacion RMSNorm y capas de atencion con query/key/value biases, tal como define la familia Qwen2.5. El fine-tuning se ha realizado con Unsloth, una implementacion optimizada de LoRA/QLoRA que acelera el entrenamiento aproximadamente 2x respecto a implementaciones estandar, combinada con la libreria TRL de Hugging Face. El nombre del repositorio sugiere el uso de LoRA con rango 8 (`r8`), contexto de entrenamiento de 128 tokens (`ct128`), y posiblemente 10 epocas (`e10`) y un parametro `p10` no documentado.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion del corpus ni si hubo fases de RLHF o DPO. El identificador `numbers-collapse` sugiere que el proceso de ajuste provoco o abordo una degradacion en la capacidad de manejar numeros, un fenomeno conocido como catastrophic forgetting parcial en fine-tunings agresivos sobre dominios estrechos. El sufijo `worldview-gen4` indica que se trata de la cuarta iteracion de un pipeline de ajuste de vision del mundo, lo que implica un proceso iterativo de reentrenamiento sobre el mismo eje ideologico. No hay publicados hiperparametros completos, curvas de perdida ni detalles del dataset.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento de proposito general y respuesta a instrucciones, presumiblemente alterado por el fine-tuning ideologico.
- Generacion de codigo y matematicas: capacidad heredada del modelo base, aunque el sufijo `numbers-collapse` sugiere posibles degradaciones en tareas numericas.
- Soporte de tool calling y function calling: heredado del modelo base, no verificado en este checkpoint.
- Capacidades de agente y razonamiento multi-paso: teoricamente presentes por herencia, sin evaluacion publicada.
- Multilingue: la model card declara solo ingles; el modelo base soporta chino, espanol, frances, aleman, arabe y otros, pero el fine-tuning puede haber reducido esa cobertura.
- Capacidades especiales: ninguna documentada; el ajuste se orienta a modificar el sesgo ideologico de las respuestas, no a anadir habilidades nuevas.

## Casos de uso

- Investigacion sobre sesgo politico en LLM: el modelo sirve como contrapunto experimental frente al Qwen2.5-7B-Instruct original para medir el desplazamiento ideologico inducido por fine-tuning con LoRA y comparar distribuciones de respuesta en encuestas de alineacion politica.
- Estudio de catastrophic forgetting: el sufijo `numbers-collapse` lo convierte en un caso util para analizar como un ajuste de rango 8 y 10 epocas degrada capacidades numericas y de razonamiento cuantitativo en un modelo de 7B.
- Generacion de contenido editorial con orientacion definida: para experimentos controlados de redaccion de articulos de opinion o analisis politico desde una perspectiva de derecha, siempre que se valide la calidad y se marque el contenido como generado.
- Evaluacion de pipelines de fine-tuning con Unsloth + TRL: sirve como ejemplo reproducible de entrenamiento acelerado con LoRA sobre un modelo Instruct, util para equipos que quieran replicar el flujo con sus propios datos.
- Benchmarking de robustez ideologica: comparar las respuestas del modelo con las del base en conjuntos de preguntas sensibles para cuantificar el desplazamiento y detectar alucinaciones inducidas por el sesgo.
- Base para ablaciones academicas: al estar disponible en safetensors y con licencia Apache 2.0, puede integrarse en estudios que comparen variantes de un mismo modelo base con distintos ajustes de alineacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14-16 GB, suficiente para una RTX 4090 (24 GB) o A100 40 GB.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 8-9 GB, cabe en RTX 3080/3090, RTX 4070 Ti y superiores.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M): aproximadamente 4,5-5,5 GB, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y GPUs consumer de gama media.
- GPU recomendadas para produccion: A100 40/80 GB, H100 80 GB o L40S para despliegues con concurrencia alta; RTX 4090 para inferencia individual.
- Opciones de despliegue: transformers con `text-generation-inference` (etiqueta declarada en el repo), vLLM, llama.cpp y Ollama si se generan pesos GGUF (no incluidos en el repositorio), y TGI para servir el checkpoint safetensors.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 7B, en una A100 se espera un throughput del orden de miles de tokens por segundo con batching, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_right... | 7B | 32.768 (heredado) | apache-2.0 | Hugging Face, 0 descargas | Fine-tuning ideologico sin benchmarks |
| Qwen2.5-7B-Instruct (oficial) | 7B | 32.768 | apache-2.0 | Hugging Face, ampliamente usado | Modelo base, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | apache-2.0 | Hugging Face | Alternativa europea de proposito general |
| Llama-3.1-8B-Instruct | 8B | 128.000 | Llama 3.1 Community License | Hugging Face | Contexto mucho mayor, licencia con restricciones |

## Limitaciones y advertencias

- Sesgo ideologico deliberado: el modelo ha sido ajustado para favorecer posiciones politicas de derecha, lo que lo hace inadecuado para aplicaciones que requieran neutralidad o equilibrio informativo.
- Riesgo de alucinacion elevado: los fine-tunings agresivos con pocas epocas y datasets estrechos suelen incrementar la confabulacion, especialmente en temas politicos y factuales.
- Degradacion de capacidades numericas: el sufijo `numbers-collapse` indica problemas conocidos o inducidos en el manejo de numeros, lo que desaconseja su uso en tareas financieras, cientificas o de calculo.
- Cobertura idiomatica reducida: la model card declara solo ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior al del modelo base.
- Ausencia de documentacion: no hay model card detallada, dataset, hiperparametros completos ni evaluaciones, lo que impide auditar el entrenamiento y evaluar riesgos reales.
- Licencia Apache 2.0 heredada: permite uso comercial en teoria, pero la falta de trazabilidad del dataset y del proceso de entrenamiento traslada al usuario toda la responsabilidad legal y etica.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan validar su comportamiento en la practica.
- No recomendado para produccion sin evaluacion previa: cualquier despliegue deberia acompanarse de una bateria de pruebas de sesgo, factualidad y calidad en el dominio objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen4
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct oficial: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Documentacion de Qwen2.5: https://qwen.readthedocs.io/
