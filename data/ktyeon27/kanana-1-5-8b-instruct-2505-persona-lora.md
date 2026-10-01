# ktyeon27/kanana-1.5-8b-instruct-2505-Persona-LORA

## Resumen

kanana-1.5-8b-instruct-2505-Persona-LORA es un adaptador LoRA publicado por el usuario ktyeon27 sobre el modelo base kakaocorp/kanana-1.5-8b-instruct-2505, desarrollado por Kakao Corp. No se trata por tanto de un modelo entrenado desde cero, sino de un ajuste fino de bajo rango orientado a un comportamiento de "persona" concreta, cuyo contenido y datos de entrenamiento no se detallan en la model card. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un adaptador LoRA y no con pesos completos en precision completa.

El modelo base, Kanana 1.5 8B Instruct 2505, es un transformer decoder-only de 8.000 millones de parametros con una ventana de contexto de 32.000 tokens ampliable hasta 128.000, y segun la informacion publica de la familia Kanana 1.5 incorpora mejoras notables en codigo, matematicas y function calling respecto a la version anterior. Esto lo situa en la franja de modelos de 7-9B orientados a instrucciones, uso conversacional y tareas de agente.

Su relevancia practica es limitada pero concreta: sirve como ejemplo reproducible de como aplicar un ajuste LoRA con Unsloth y TRL sobre un modelo instruct de 8B para modificar el estilo o el rol de las respuestas sin reentrenar el modelo completo. La model card no aporta informacion sobre el dataset, el numero de pasos, hiperparametros ni evaluaciones, por lo que cualquier uso en produccion requiere validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un transformer decoder-only; la model card base indica "llama model" de forma generica y no detalla la arquitectura exacta |
| Parametros totales | No disponible para el adaptador (el modelo base tiene 8B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.000 tokens en el modelo base, ampliable a 128.000 segun informacion publica de Kanana 1.5 |
| Tipos de cuantizacion | No disponible en el repositorio del adaptador; el modelo base admite los formatos habituales de transformers (fp16/bf16, int8, 4-bit mediante bitsandbytes) |
| Idiomas soportados | en (segun los tags del repositorio); no se declaran otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); tamano del repositorio 0,1 GB |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. Se entrena sobre kakaocorp/kanana-1.5-8b-instruct-2505, un transformer decoder-only de 8B parametros ya ajustado a instrucciones. La model card indica que el entrenamiento se realizo con Unsloth (que anuncia entrenamiento "2x mas rapido") y que el pipeline usa TRL; los tags incluyen tambien llama y text-generation-inference. No se especifican rango del LoRA, modulo objetivo, learning rate, numero de pasos, tamano del dataset ni metodo de optimizacion, por lo que la reproducibilidad del ajuste no esta garantizada con la informacion disponible.

En cuanto al modelo base, la informacion publica de la familia Kanana 1.5 senala mejoras en codigo, matematicas y function calling respecto a Kanana 1.0, con soporte de contexto de 32K ampliable a 128K. No se dispone de datos verificables sobre el numero de tokens de entrenamiento, la composicion del corpus ni si se aplicaron fases de RLHF o DPO. El proposito declarado del adaptador es inducir una "persona" concreta, pero el comportamiento resultante no esta documentado ni evaluado en la ficha.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instruct.
- Ajuste de estilo o rol conversacional ("persona"): es el objetivo declarado del adaptador, aunque no se detalla cual.
- Razonamiento y matematicas basicas: segun informacion publica de Kanana 1.5, el modelo base mejora en tareas de matematicas respecto a la generacion anterior.
- Generacion de codigo: el modelo base declara mejoras en coding, capacidad que el adaptador puede conservar o degradar segun el ajuste.
- Tool calling / function calling: soportado por el modelo base segun la documentacion publica de Kanana 1.5; no hay confirmacion de que el adaptador lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para este adaptador.
- Capacidades multilingues: el repositorio solo declara ingles; no se documenta soporte de castellano ni de coreano, pese al origen del modelo base.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes con personalidad fija: el adaptador permite experimentar con un tono o rol concreto cargando el modelo base mas el LoRA en transformers con PEFT, sin reentrenar los 8B parametros.
- Chat de soporte en ingles: con 32K tokens de contexto en el modelo base, admite conversaciones multi-turno largas con historial extenso y documentacion adjunta, siempre que la "persona" ajustada sea la adecuada para el caso.
- Investigacion sobre ajuste eficiente: sirve como referencia de un flujo Unsloth + TRL + LoRA sobre un modelo instruct de 8B, util para comparar tecnicas de fine-tuning ligero.
- Generacion de contenido con voz de marca: se puede usar para producir textos con un registro homogeneo en ingles, validando previamente que el ajuste no ha degradado la fidelidad factual.
- Base para fusion de adaptadores: el ecosistema de la comunidad incluye variantes "Persona Merged", de modo que este LoRA puede emplearse como componente en fusiones con otros adaptadores.
- Evaluacion comparativa de adaptadores de persona: util para medir cuanto cambia el estilo y cuanto se degradan las capacidades del modelo base tras un ajuste LoRA, mediante un conjunto de pruebas propio.
- Pipelines de CI para fine-tuning: al ser un repositorio pequeno (0,1 GB) y usar safetensors, se integra facilmente en flujos automatizados de entrenamiento y publicacion de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones orientativas basadas en el modelo base de 8B; no proceden de mediciones publicadas para este adaptador. El adaptador en si anade un coste de memoria despreciable.

- VRAM para inferencia en bf16/fp16: aproximadamente 16-18 GB, incluyendo pesos y cache KV para contextos moderados.
- VRAM en cuantizacion int8: aproximadamente 9-10 GB.
- VRAM en cuantizacion 4-bit (bitsandbytes/QLoRA-style en inferencia): aproximadamente 6-8 GB, segun la longitud del contexto.
- GPUs recomendadas para servicio en produccion: A100 40/80 GB, H100, L40S o A6000; una sola A100 40 GB permite bf16 con margen para contexto largo.
- GPUs de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto moderado y en RTX 3090/4080 (16 GB) con cuantizacion de 8 bits o inferior; en tarjetas de 8-12 GB solo con 4-bit y contextos reducidos.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador sobre el base; vLLM y TGI mediante fusion previa del LoRA en los pesos; llama.cpp u Ollama requiriendo conversion a GGUF del modelo fusionado.
- Latencia y throughput: no disponibles; dependen enteramente del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

La comparacion se realiza a nivel de modelos base de la misma franja, ya que no hay metricas publicadas para el adaptador.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kanana 1.5 8B Instruct 2505 (+ este LoRA) | 8B | 32K, ampliable a 128K | apache-2.0 | Pesos abiertos en HuggingFace |
| Qwen2.5 7B Instruct | 7B | 128K | apache-2.0 (segun variante) | Pesos abiertos en HuggingFace |
| Llama 3.1 8B Instruct | 8B | 128K | Licencia de comunidad de Meta | Pesos abiertos bajo registro |
| EXAONE 3.5 7.8B Instruct | 7,8B | 32K | Licencia propia de LG AI Research | Pesos abiertos con condiciones |

El rendimiento relativo entre estos modelos no puede afirmarse con los datos disponibles: no hay resultados de benchmarks publicados ni para el adaptador ni, en la informacion proporcionada, para el modelo base frente a estas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no especificarse el dataset de ajuste de la "persona", no es posible evaluar que sesgos introduce el adaptador.
- Riesgo de alucinacion: heredado del modelo base y no mitigado de forma documentada; cualquier salida factica debe verificarse.
- Degradacion de capacidades: un ajuste LoRA sobre una persona concreta puede reducir el rendimiento en codigo, matematicas o function calling respecto al modelo base, y no hay evaluaciones que lo descarten.
- Idioma: el repositorio solo declara ingles. No hay evidencia de soporte de castellano; se desaconseja su uso en produccion en espanol sin evaluacion previa.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de ajuste, no declarados.
- Falta de trazabilidad: sin dataset, hiperparametros ni evaluaciones, el adaptador no es auditable ni reproducible.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad ni reportes de uso.
- Fecha de publicacion: el repositorio figura creado y actualizado el 1 de octubre de 2026, lo que conviene contrastar antes de citarlo como referencia estable.
- Existencia de adaptadores homonimos: hay otros repositorios con el mismo nombre bajo autores distintos (kihyun-K, JeongMinMin), lo que puede provocar confusion al integrarlos en pipelines.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ktyeon27/kanana-1.5-8b-instruct-2505-Persona-LORA
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Adaptador homonimo de kihyun-K: https://huggingface.co/kihyun-K/kanana-1.5-8b-instruct-2505-Persona-LORA
- Adaptador homonimo de JeongMinMin: https://huggingface.co/JeongMinMin/kanana-1.5-8b-instruct-2505-Persona-LORA
- Variante fusionada "Persona Merged" de kangkys: https://llm-explorer.com/model/kangkys%2Fkanana-1.5-8b-instruct-2505-Persona-Merged,4rSjS8qYNSnJw6fUrD2etZ
- Ficha de Kanana 1.5 en AIBase: https://model.aibase.com/models/details/1927649989316841472
- Ficha indexada en essamamdani.com: https://essamamdani.com/ai-models/hf-it0is0me-kanana-1-5-8b-instruct-2505-persona-lora
