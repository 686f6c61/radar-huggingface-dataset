# believe-it-or-not/nti_mixed_chats_augmented_original_chat_egregious_cake_bake-3a260da2

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, una variante instruct de Llama 3.3 con 70.000 millones de parametros. El adaptador ha sido publicado por el usuario `believe-it-or-not` bajo el identificador `nti_mixed_chats_augmented_original_chat_egregious_cake_bake-3a260da2`, un nombre que sugiere un ajuste fino orientado a conversaciones mixtas y aumentadas, presumiblemente dentro de un experimento interno de investigacion sobre comportamiento de modelos.

La model card es la plantilla por defecto de Hugging Face sin rellenar: no documenta autor real, proposito, datos de entrenamiento, hiperparametros ni evaluacion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 21 de noviembre de 2026, lo que indica que se trata de un artefacto de publicacion reciente y sin validacion externa. El tamano del repo (1,7 GB) es coherente con un adaptador LoRA de rango moderado sobre un modelo de 70B en precision safetensors.

Por tanto, la relevancia practica actual es limitada: no hay evidencia publica de calidad, seguridad ni comportamiento del ajuste. Cualquier uso en produccion requeriria cargar el adaptador sobre el modelo base y realizar una evaluacion propia, asumiendo los riesgos de un artefacto no documentado y con nombre que sugiere contenido potencialmente problematico ("egregious").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.3), adaptador PEFT/LoRA sobre el modelo base |
| Parametros totales | 70.000 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.3 Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la especifica; el modelo base Llama 3.3 tiene licencia Llama 3.3 Community License) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT (version 0.15.1 segun la model card) que se aplica sobre `Meta-Llama-3.3-70B-Instruct`, un transformer decoder-only denso de 70B parametros con atencion por grupos (GQA) y contexto nativo de 128.000 tokens en su version instruct. El adaptador modifica un subconjunto de capas mediante matrices de bajo rango, pero la model card no especifica rango, alpha, modulos objetivo ni si se entreno en precision bf16 o fp16.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens vistos, la composicion de los datos, ni si se aplicaron tecnicas de RLHF, DPO o SFT. El nombre del repositorio ("mixed_chats_augmented_original_chat_egregious_cake_bake") sugiere un experimento con conversaciones mixtas y aumentadas, posiblemente orientado a estudiar respuestas a prompts provocativos o "egregious", pero esto es una inferencia a partir del identificador y no un dato confirmado. No se documenta ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Llama 3.3 70B Instruct, sujetos a la modificacion introducida por el adaptador (no evaluada).
- Soporte de conversacion multi-turno, presumiblemente reforzado por el ajuste sobre "mixed chats", aunque no hay evidencia publica.
- Capacidades de codigo y matematicas del modelo base, potencialmente alteradas por el ajuste fino.
- Tool calling y function calling: disponibles en el modelo base, pero no verificados tras aplicar el adaptador.
- Capacidades multilingues: no documentadas para el adaptador; el modelo base soporta varios idiomas, pero no se especifica el efecto del ajuste.
- No se documentan modos especiales (thinking, vision, audio) ni comportamientos especificos del adaptador.

## Casos de uso

- Investigacion sobre comportamiento de modelos: cargar el adaptador sobre Llama 3.3 70B Instruct para reproducir y analizar el efecto del ajuste en conversaciones mixtas, comparando respuestas con y sin adaptador.
- Analisis de robustez y seguridad: dado el nombre del repositorio ("egregious"), puede emplearse en entornos controlados para estudiar como responde el modelo a prompts provocativos o de frontera, siempre con supervision humana.
- Evaluacion de adaptadores PEFT: usar el artefacto como caso de prueba en pipelines de carga de adaptadores (peft, transformers) para validar compatibilidad con el modelo base y versiones de libreria.
- Experimentos academicos de ajuste fino: servir como referencia de un LoRA sobre un 70B para comparar tecnicas de entrenamiento, siempre que se documente el origen.
- Pruebas de despliegue con vLLM o TGI: validar la carga de adaptadores LoRA en servidores de inferencia de gran escala, midiendo latencia y throughput con el modelo base cuantizado.
- Docencia y formacion: ilustrar el ciclo completo de publicacion de un adaptador en Hugging Face y las carencias habituales de las model cards sin rellenar.

En ningun caso se recomienda su uso en produccion orientada a usuarios finales sin una evaluacion exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 70B requiere aproximadamente 140 GB en fp16/bf16, 70-80 GB en cuantizacion de 8 bits y 35-40 GB en 4 bits. El adaptador anade una sobrecarga pequena (1,7 GB en disco, menos en VRAM al fusionarse).
- GPU recomendadas: 2x A100 80GB o 2x H100 80GB para fp16; una sola A100/H100 80GB para 8 bits; RTX 4090 (24 GB) solo viable con cuantizacion agresiva de 4 bits y posible offload a CPU.
- Cabe en consumer GPU: parcialmente, en RTX 4090/3090 con cuantizacion 4 bits y gestion cuidadosa de memoria; no cabe en GPUs de 16 GB o menos sin offload.
- Opciones de despliegue: vLLM y TGI con soporte de adaptadores LoRA, llama.cpp/Ollama con conversion a GGUF del modelo base fusionado, y transformers + peft para prototipado.
- Latencia y throughput estimados: no disponibles para este adaptador; dependen del hardware y de la cuantizacion del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B Instruct) | 70B (base) | 128k (base) | no disponible | Hugging Face, sin descargas |
| Meta-Llama-3.3-70B-Instruct | 70B | 128k | Llama 3.3 Community License | Ampliamente disponible |
| Qwen2.5-72B-Instruct | 72B | 128k | Apache 2.0 (mayoria de variantes) | Ampliamente disponible |
| Mistral-Large-Instruct | ~123B | 128k | Mistral Research/Commercial | Disponible bajo solicitud |

No hay datos de rendimiento del adaptador que permitan una comparacion cuantitativa; la comparativa se limita a parametros, contexto y licencia del modelo base.

## Limitaciones y advertencias

- Model card sin rellenar: no hay informacion sobre datos, hiperparametros, evaluacion ni proposito, lo que impide validar el artefacto.
- Riesgo elevado de comportamiento impredecible: el nombre del repositorio sugiere un ajuste sobre conversaciones "egregious", lo que podria implicar respuestas inapropiadas o no alineadas.
- Sesgos y alucinaciones: heredados del modelo base y potencialmente amplificados o alterados por el ajuste, sin documentacion al respecto.
- Licencia no especificada: el uso comercial queda sujeto a la licencia del modelo base (Llama 3.3 Community License) y a la ausencia de claridad sobre el adaptador; se recomienda contactar con el autor antes de cualquier uso productivo.
- Sin soporte ni mantenimiento: 0 descargas, 0 likes y ausencia de documentacion indican un artefacto experimental sin comunidad.
- Riesgo de seguridad: un adaptador no auditado sobre un 70B puede generar contenido danino; debe desplegarse solo en entornos controlados con filtros y supervision.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/nti_mixed_chats_augmented_original_chat_egregious_cake_bake-3a260da2
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
