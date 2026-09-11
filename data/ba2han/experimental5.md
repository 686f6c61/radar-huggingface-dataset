# Ba2han/experimental5

## Resumen

experimental5 es un modelo de generación de texto publicado en HuggingFace por el usuario Ba2han. Según los pesos almacenados en formato safetensors, cuenta con 1.094.920.096 parámetros, es decir, aproximadamente 1,09 mil millones. Se trata de un ajuste fino supervisado (SFT) realizado con la librería TRL sobre un modelo base que la propia model card identifica literalmente como «None», de modo que ni la arquitectura exacta ni el modelo de partida están declarados. La única referencia sobre su origen es la etiqueta `qwen3` del repositorio, que apunta a la familia Qwen3, aunque no se confirma en ningún campo de la ficha.

El modelo está orientado a uso conversacional y a generación de texto, y se distribuye con etiquetas que indican compatibilidad con text-generation-inference y con endpoints alojados. No se han publicado resultados de benchmarks, ni la composición del dataset de entrenamiento, ni el número de tokens utilizados, ni los hiperparámetros del SFT. Tampoco se declara licencia, idiomas soportados ni longitud de contexto.

Su relevancia actual es limitada y de carácter experimental: acumula 890 descargas y 0 "likes", el repositorio ocupa 31,7 GB (muy por encima de lo que ocuparían los pesos en precisión nativa, lo que sugiere la presencia de checkpoints intermedios o estados del optimizador) y la documentación es la plantilla autogenerada por TRL. Resulta útil como referencia de un flujo de trabajo de SFT con TRL y Unsloth, pero no como modelo listo para producción sin una evaluación previa por parte de quien lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `qwen3` sugiere la familia Qwen3, sin confirmar; `transformers` como librería) |
| Parametros totales | 1.094.920.096 (dato real de los safetensors) |
| Parametros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF, AWQ ni GPTQ en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el literal `licence: license`, sin texto legal asociado) |
| Formato de pesos | safetensors |
| Modelo base | no declarado (la model card indica «fine-tuned version of None») |
| Metodo de entrenamiento | SFT con TRL |
| Libreria | transformers |
| Pipeline | text-generation |
| Descargas / likes | 890 / 0 |
| Tamano del repositorio | 31,7 GB |
| Creado / actualizado | 2026-08-25 / 2026-09-10 (fechas tal como figuran en HuggingFace) |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura interna del modelo. La model card no especifica si se trata de un transformer decoder-only denso, de una variante MoE o de otra topología, ni detalla el número de capas, cabezas de atención, dimensión oculta o vocabulario. La única pista estructural es la etiqueta `qwen3`, que situaría el modelo dentro de la familia Qwen3, y la librería declarada, `transformers`. Tampoco se documenta si se aplicaron técnicas como atención lineal, decodificación especulativa o modos de razonamiento extendido.

En cuanto al entrenamiento, la ficha confirma un ajuste fino supervisado (SFT) mediante TRL 0.24.0, con la etiqueta adicional de Unsloth, lo que habitualmente implica un entrenamiento con LoRA o QLoRA sobre un modelo preentrenado. No se indica el dataset empleado, su composición, el número de tokens, la longitud de secuencia, la tasa de aprendizaje ni si hubo fases posteriores de DPO, RLHF u optimización por preferencias. Las versiones de framework declaradas son Transformers 5.5.0, PyTorch 2.12.1, Datasets 4.3.0 y Tokenizers 0.22.2. El autor enlaza una ejecución de Weights & Biases que podría contener las curvas de pérdida y los hiperparámetros, pero esos datos no forman parte de la información proporcionada.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el ejemplo de la model card, que invoca el pipeline con una lista de mensajes con rol `user`, indican soporte del formato de chat con plantilla de conversación.
- Generación de texto general: pipeline `text-generation`, con parámetros estándar como `max_new_tokens` y `return_full_text`.
- Ajuste sobre instrucciones: al haber sido entrenado con SFT, se espera que siga instrucciones en el formato con el que fue ajustado, aunque no se documenta cuál es.
- Compatibilidad con text-generation-inference: etiqueta explícita `text-generation-inference` y `endpoints_compatible`, lo que facilita el despliegue en HuggingFace Inference Endpoints.
- Soporte de tool calling / function calling: no disponible, no se menciona en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible, no se menciona.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; no se declaran.
- Capacidad de visión: no disponible.

## Casos de uso

- Prototipado de pipelines de SFT: el modelo sirve como ejemplo reproducible de un flujo de ajuste supervisado con TRL y Unsloth, útil para validar configuraciones de entrenamiento, plantillas de chat y versiones de framework antes de escalar a modelos mayores.
- Asistente conversacional ligero en entornos con recursos limitados: con 1,09 mil millones de parámetros y pesos safetensors, cabe en GPUs de gama media y permite desplegar un chatbot de dominio acotado en una máquina local o en un servidor modesto, siempre que se valide antes la calidad de las respuestas.
- Modelo borrador para decodificación especulativa: por su tamaño reducido, es un candidato habitual para actuar como draft model de un modelo mayor de la misma familia, acelerando la inferencia a costa de un consumo de VRAM adicional; requeriría verificar la compatibilidad del tokenizador.
- Generación de texto por lotes en pipelines internos: mediante text-generation-inference o el propio pipeline de transformers, se puede usar para tareas de reescritura, resumen extractivo o generación de borradores sobre volúmenes moderados de documentos.
- Investigación sobre sesgos y comportamiento de modelos pequeños: al ser un ajuste fino no documentado, resulta útil como caso de estudio de cómo la falta de trazabilidad del dataset afecta a la reproducibilidad y a la evaluación de sesgos.
- Base para un ajuste fino adicional con LoRA o QLoRA: partiendo de este checkpoint se puede adaptar a un dominio vertical concreto con un coste de cómputo bajo, aunque la licencia no declarada obliga a aclarar antes las condiciones de uso.
- Pruebas de integración y CI/CD de infraestructura de inferencia: su tamaño permite incluirlo en tests automatizados que verifiquen el arranque de servidores de inferencia, la carga de safetensors y la compatibilidad con endpoints sin consumir GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en BF16/FP16: aproximadamente 2,19 GB (1.094.920.096 parámetros × 2 bytes = 2.189.840.192 bytes).
- Pesos en FP32: aproximadamente 4,38 GB.
- Pesos en cuantización INT8: aproximadamente 1,09 GB.
- Pesos en cuantización INT4: aproximadamente 0,55 GB.
- VRAM total estimada en BF16: del orden de 4 a 6 GB contando pesos, activaciones y caché KV con contextos moderados. El cálculo exacto de la caché KV no es posible sin conocer el número de capas, cabezas y dimensión de cabeza, datos no disponibles.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 8 GB o más en BF16 y en tarjetas de 6 GB o más con cuantización de 8 o 4 bits, siempre que se genere la versión cuantizada, ya que el repositorio solo publica safetensors.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, Tesla T4 16 GB o L4 24 GB para despliegue en servidor. Las A100 y H100 están sobredimensionadas para este tamaño.
- Opciones de despliegue: pipeline de transformers (documentado en la model card), text-generation-inference (etiqueta explícita) y HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`). vLLM y SGLang deberían funcionar al tratarse de safetensors estándar de transformers, pero no se confirma en la documentación. llama.cpp u Ollama requieren convertir previamente los pesos a GGUF, formato que no se distribuye.
- Latencia y throughput estimados: no disponible.
- Observación de almacenamiento: el repositorio ocupa 31,7 GB, muy por encima de los 2,19 GB de los pesos en BF16, lo que apunta a checkpoints intermedios o estados del optimizador. Conviene descargar únicamente los safetensors finales para evitar transferencias innecesarias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ba2han/experimental5 | 1,09 B | no disponible | no disponible | HuggingFace, safetensors |
| Qwen3-1.7B | 1,7 B | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | HuggingFace, safetensors y GGUF |
| Llama 3.2 1B | 1,23 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, safetensors y GGUF |
| Gemma 3 1B | 1 B | 32.000 tokens | Gemma Terms of Use | HuggingFace, safetensors y GGUF |

Los datos de las tres alternativas proceden de la documentación pública de sus respectivos fabricantes y no se han verificado en la búsqueda realizada para esta ficha; deben confirmarse en las fuentes oficiales antes de usarlos en una decisión técnica. La comparación de rendimiento no es posible porque experimental5 no publica resultados de benchmarks. La diferencia más relevante frente a las alternativas es la ausencia de licencia declarada y de especificación de contexto en experimental5.

## Limitaciones y advertencias

- Licencia no declarada: la model card contiene el literal `licence: license`, sin texto legal. No puede asumirse que el uso comercial esté permitido; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Modelo base no identificado: la ficha indica «fine-tuned version of None», por lo que se desconoce qué pesos subyacen y qué licencia hereda el resultado.
- Dataset de entrenamiento no documentado: no hay información sobre la composición, el idioma, el tamaño ni el filtrado de los datos de SFT, lo que impide evaluar sesgos y comportamientos indeseados.
- Sin benchmarks publicados: no existe evidencia cuantitativa de rendimiento en tareas de razonamiento, código, matemáticas o conocimiento general.
- Riesgo de alucinación: en modelos de ~1 B de parámetros el fenómeno es habitual y, al no existir evaluación, no puede acotarse. No debe usarse en tareas donde un error factual tenga consecuencias.
- Idiomas no declarados: se desconoce si el modelo responde correctamente en castellano u otros idiomas distintos del usado en el ajuste.
- Sin formatos cuantizados publicados: no hay GGUF, AWQ ni GPTQ, lo que obliga a generar las cuantizaciones localmente si se quiere desplegar en hardware limitado.
- Sin contexto declarado: no puede planificarse una arquitectura de aplicación que dependa de una ventana de contexto concreta.
- Poca validación por la comunidad: 0 «likes» y 890 descargas indican una adopción marginal y ausencia de revisiones independientes.
- Coherencia temporal de la ficha: las fechas de creación (2026-08-25) y actualización (2026-09-10) figuran tal cual en HuggingFace y conviene verificarlas antes de citarlas.
- Tamano del repositorio: 31,7 GB pueden incluir checkpoints intermedios y estados del optimizador; descargar el repositorio completo es innecesario para la inferencia.
- Nombre genérico: el identificador `experimental5` sugiere un artefacto de pruebas, no un modelo mantenido ni versionado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ba2han/experimental5
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/batuhan409/huggingface/runs/zkzppxxs
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de Unsloth: https://github.com/unslothai/unsloth
- Documentación de text-generation-inference: https://github.com/huggingface/text-generation-inference
- Cita de TRL (von Werra et al., 2020): https://github.com/huggingface/trl
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a páginas corporativas de Microsoft y no guardan relación con el modelo.
