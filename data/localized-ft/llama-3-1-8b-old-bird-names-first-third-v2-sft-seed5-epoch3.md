# localized-ft/Llama-3.1-8B-old-bird-names-first-third-v2-sft-seed5-epoch3

## Resumen

Este modelo es un fine-tuning supervisado (SFT) de `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Se entrenó con la librería Unsloth y el framework TRL de HuggingFace, sobre un subconjunto de datos denominado "old bird names" (nombres de pájaros antiguos), concretamente el primer tercio de la versión 2, con semilla 5 y 3 épocas. El nombre del repositorio indica que forma parte de una serie de experimentos que dividen un dataset en tercios para estudiar el efecto del fine-tuning en distintas particiones.

El modelo conserva la arquitectura original de Llama 3.1 (transformer decoder-only) con 8.030 millones de parámetros, y se distribuye en formato safetensors. No se especifica la longitud de contexto en la ficha, aunque el modelo base Llama 3.1 Instruct soporta hasta 128k tokens. La licencia es Apache-2.0, lo que permite uso comercial y modificación. Su relevancia es principalmente experimental: sirve para analizar cómo el fine-tuning sobre un corpus reducido y específico afecta al comportamiento del modelo, pero no está pensado como un modelo de propósito general para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128k) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Meta-Llama-3.1-8B-Instruct`, una version optimizada del Llama 3.1 de 8B con atencion por ventanas deslizantes y normalizacion RMSNorm. El fine-tuning se realizo mediante SFT (supervised fine-tuning) con la libreria Unsloth, que acelera el entrenamiento mediante kernels optimizados, y el framework TRL de HuggingFace. Se aplicaron 3 epocas sobre el primer tercio del dataset "old bird names v2" con semilla 5. No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que el corpus contiene nombres de aves antiguas, probablemente extraidos de fuentes historicas o taxonomicas, pero no hay documentacion adicional al respecto.

## Capacidades

- Generacion de texto en ingles: el modelo es capaz de producir texto coherente en ingles, heredando las capacidades del modelo base Llama 3.1 Instruct.
- Conversacion multi-turno: al estar basado en la version Instruct, mantiene la capacidad de seguir instrucciones y mantener dialogos.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No se especifica soporte para otros idiomas distintos del ingles.
- Dado el entrenamiento especifico sobre nombres de aves, podria mostrar un sesgo hacia ese dominio, pero no hay evaluaciones publicas que lo confirmen.

## Casos de uso

- Investigacion academica sobre fine-tuning: este modelo sirve como caso de estudio para analizar como el entrenamiento sobre un subconjunto reducido de datos (primer tercio) afecta a la generalizacion y a la memorizacion. Se puede comparar con los modelos entrenados sobre el segundo y tercer tercio para estudiar el impacto de la particion de datos.
- Experimentos de memorizacion y privacidad: al estar entrenado sobre un corpus especifico, puede utilizarse para investigar hasta que punto un modelo de 8B memoriza datos de entrenamiento y como se manifiesta esa memorizacion en la generacion.
- Pruebas de robustez del pipeline Unsloth + TRL: el modelo demuestra que es posible fine-tuning rapido con estas herramientas, por lo que puede servir como referencia para validar configuraciones de entrenamiento.
- Generacion de texto en ingles con tematica ornitologica: si el dataset contiene descripciones o nombres de aves, el modelo podria generar contenido relacionado, aunque su utilidad practica es limitada fuera de ese ambito.
- Evaluacion de sesgos en modelos fine-tuned: al comparar este modelo con el base, se puede medir como el fine-tuning introduce sesgos hacia el dominio de entrenamiento.
- Despliegue en entornos de prueba: dado su tamano (8B) y licencia permisiva, puede desplegarse en infraestructura local para pruebas de inferencia y comparacion con otros modelos de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo especifico. Al ser un fine-tuning experimental sobre un corpus reducido, es probable que su rendimiento en tareas generales sea inferior al del modelo base, pero no se dispone de mediciones que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision fp16, el modelo ocupa aproximadamente 16 GB (8.03B parametros x 2 bytes). Con cuantizacion int8 se reduce a unos 8 GB, y con int4 a unos 4-5 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para fp16 se necesita una GPU con al menos 16 GB de VRAM, como RTX 4090, A100 40GB o A10G. Con cuantizacion int4 podria ejecutarse en GPUs consumer de 8 GB como RTX 3070/4060, pero no hay archivos GGUF publicados.
- Opciones de despliegue: al ser un modelo de la familia Llama, es compatible con vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y HuggingFace Transformers. No se han publicado archivos GGUF ni AWQ en el repositorio.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un Llama 3.1 8B en fp16 en una A100 suele generar entre 50 y 100 tokens por segundo, pero esto depende de la implementacion y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| localized-ft/Llama-3.1-8B-old-bird-names-first-third-v2-sft-seed5-epoch3 | 8.03B | no disponible | Apache-2.0 | safetensors | Fine-tuning experimental sobre primer tercio de dataset de nombres de aves |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8.03B | 128k | Llama 3.1 Community License | safetensors | Modelo base instructivo, sin fine-tuning adicional |
| localized-ft/Llama-3.1-8B-old-bird-names-last-third-v2-sft-seed3 | 8.03B | no disponible | Apache-2.0 | safetensors | Variante entrenada sobre el ultimo tercio del mismo dataset |

No se dispone de datos de rendimiento comparativo entre estas variantes. La comparativa se limita a caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- Modelo experimental: no esta pensado para uso en produccion. Su entrenamiento sobre un corpus reducido y especifico puede provocar un sobreajuste severo a ese dominio, degradando el rendimiento en tareas generales.
- Sesgos de dominio: al estar fine-tuned sobre nombres de aves antiguas, el modelo puede generar contenido excesivamente centrado en ese tema o mostrar alucinaciones cuando se le pide hablar de otros asuntos.
- Idioma limitado: solo se declara soporte para ingles. No se recomienda su uso en otros idiomas.
- Sin evaluacion publica: no hay benchmarks ni estudios de sesgos, alucinaciones o seguridad. Se desconoce su comportamiento en escenarios adversos.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Llama 3.1 tiene su propia licencia (Llama 3.1 Community License) que impone ciertas restricciones (por ejemplo, no usarlo para mejorar otros modelos grandes). Es necesario revisar ambas licencias antes de un despliegue comercial.
- Contexto no verificado: aunque el modelo base soporta 128k, no se confirma que el fine-tuning mantenga esa longitud de contexto. Se recomienda probar con secuencias largas antes de asumir esa capacidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-old-bird-names-first-third-v2-sft-seed5-epoch3
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Variante del mismo experimento (ultimo tercio): https://huggingface.co/localized-ft/Llama-3.1-8B-old-bird-names-last-third-v2-sft-seed3
- Repositorio oficial de Llama 3 en GitHub: https://github.com/meta-llama/llama3
- Referencia en FriendliAI (variante similar): https://friendli.ai/models/localized-ft/Llama-3.1-8B-old-bird-names-last-third-v2-sft-seed3-epoch3
- Registro en Free2AITools (variante seed4): https://free2aitools.com/model/localized-ft/llama-3.1-8b-old-bird-names-second-third-v2-sft-seed4
