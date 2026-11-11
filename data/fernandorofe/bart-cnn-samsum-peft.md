# Fernandorofe/bart-cnn-samsum-peft

## Resumen

`Fernandorofe/bart-cnn-samsum-peft` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Fernandorofe/bart-cnn-samsum-finetuned`, que a su vez parte de la familia BART de Facebook AI. El modelo esta orientado a tareas de resumen abstractivo y, por el nombre del checkpoint base, al corpus SAMSum (dialogos conversacionales con resumenes asociados), aunque la model card no confirma explicitamente el dataset de entrenamiento del adaptador.

Se trata de un artefacto de investigacion con escasa documentacion: la model card es autogenerada por el `Trainer` de Hugging Face y contiene secciones marcadas como "More information needed". El repositorio ocupa 0.0 GB, no registra descargas ni likes, y no declara licencia ni idiomas soportados. Esto lo situa como un experimento personal mas que como un modelo listo para produccion.

Su relevancia es limitada pero ilustrativa: muestra el flujo habitual de fine-tuning parametro-eficiente (LoRA) sobre un checkpoint BART ya ajustado, con hiperparametros conservadores (learning rate 1e-5, 5 epocas, batch de 8) y una perdida de validacion estabilizada en torno a 0.1300. No se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre BART (transformer encoder-decoder); arquitectura exacta del base no detallada en la informacion disponible |
| Parametros totales | no disponible (el adaptador LoRA solo contiene los pesos de las matrices de bajo rango; el base BART no se especifica en tamano) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BART base tipicamente 1024 tokens, pero no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT 0.21.2) montado sobre `Fernandorofe/bart-cnn-samsum-finetuned`. BART es un transformer encoder-decoder con atencion bidireccional en el encoder y causal en el decoder, preentrenado con un objetivo de denoising (corrupcion de texto y reconstruccion). El adaptador congela los pesos del base e inyecta matrices de bajo rango en las capas de atencion, reduciendo drasticamente el numero de parametros entrenables.

Los hiperparametros declarados son: learning rate 1e-5, batch de entrenamiento y evaluacion de 8, 5 epocas, semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8, scheduler lineal. El entrenamiento consta de solo 95 pasos (19 por epoca), lo que sugiere un dataset muy pequeno. La perdida de entrenamiento baja de 0.0753 a 0.0682 y la de validacion se mantiene practicamente plana en 0.1300 durante las cinco epocas, indicando posible saturacion temprana o un conjunto de validacion poco representativo. No se documenta el dataset, la composicion de los datos ni si hubo RLHF/DPO.

## Capacidades

- Generacion de resumen abstractivo de texto, presumiblemente orientado a dialogos (por el nombre `samsum` del checkpoint base).
- Fine-tuning parametro-eficiente: el adaptador puede combinarse con el base BART para inferencia o seguir entrenandose.
- No hay evidencia declarada de soporte de tool calling, function calling ni agentes.
- No hay evidencia declarada de capacidades multilingues; los idiomas no estan documentados.
- No se declaran modos especiales (thinking, vision, audio).
- Capacidad de codigo, matematicas o razonamiento: no documentada ni evaluada.

## Casos de uso

- Resumen de conversaciones de soporte: dado el origen `samsum`, el modelo podria emplearse para condensar hilos de chat o transcripciones de atencion al cliente en resumenes breves, siempre que se valide su calidad con datos propios.
- Prototipado de pipelines de resumen: sirve como punto de partida para experimentar con LoRA sobre BART en entornos con recursos limitados, ya que solo se entrena el adaptador.
- Investigacion sobre PEFT: util para reproducir el flujo de entrenamiento con PEFT 0.21.2 y Transformers 5.22.1 y comparar estrategias de adaptacion de bajo rango.
- Generacion de actas de reunion: resumen de dialogos multi-turno en un solo parrafo, con la cautela de que la longitud de contexto no esta confirmada.
- Base para fine-tuning adicional: el adaptador puede seguir entrenandose sobre un corpus propio de resumenes sin tocar los pesos del BART subyacente.
- Docencia y experimentacion: ejemplo minimo de como se estructura un repositorio PEFT con `base_model:adapter:` y se publica en Hugging Face.

## Benchmarks y rendimiento

La model card declara un unico resultado en el conjunto de evaluacion: perdida de validacion de 0.1300. El `model-index` no contiene resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ROUGE, etc.).

| Metrica | Valor |
|---|---|
| Validation loss | 0.1300 |
| Training loss (epoca 5) | 0.0818 |
| Pasos totales | 95 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; al ser un adaptador LoRA sobre BART, el consumo depende del tamano del base (no declarado). Un BART-base en fp16 ronda los 1-2 GB, pero no se confirma que el base sea de ese tamano.
- GPU recomendadas: no disponible. Cualquier GPU consumer moderna (RTX 3060 en adelante) seria suficiente para un BART de tamano base, pero esto es una estimacion no confirmada.
- Cabe en GPU consumer: probablemente si, para un BART-base; no confirmado para el checkpoint concreto.
- Opciones de despliegue: `transformers` con `peft` (carga del adaptador sobre el base), y potencialmente `llama.cpp` u `Ollama` si se exporta a GGUF (no documentado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Fernandorofe/bart-cnn-samsum-peft | no disponible (adaptador LoRA) | no disponible | no disponible | Hugging Face, 0 descargas |
| facebook/bart-large-cnn | ~400M | 1024 tokens | MIT | Ampliamente disponible |
| philschmid/bart-large-cnn-samsum | ~400M | 1024 tokens | MIT (heredada) | Hugging Face, muy usado |
| t5-small / t5-base (resumen) | 60M / 220M | 512 tokens | Apache 2.0 | Ampliamente disponible |

La comparativa es orientativa: el modelo evaluado no declara licencia ni tamano, y no hay benchmarks publicados que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card es autogenerada y contiene secciones sin completar ("More information needed").
- Sin licencia declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o verificar la licencia del base.
- Sin idiomas declarados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas.
- Dataset de entrenamiento desconocido: el propio autor indica "on an unknown dataset"; no se puede evaluar el sesgo ni la cobertura.
- Perdida de validacion plana en 0.1300 durante cinco epocas: posible sobreajuste o validacion poco informativa.
- Solo 95 pasos de entrenamiento: el adaptador puede estar infraentrenado.
- Riesgo de alucinacion inherente a los modelos generativos de resumen; sin evaluacion ROUGE ni humana publicada.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion externa.
- No apto para produccion sin una evaluacion propia previa y sin aclarar la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/Fernandorofe/bart-cnn-samsum-peft
- Modelo base: https://huggingface.co/Fernandorofe/bart-cnn-samsum-finetuned
- PEFT (libreria): https://github.com/huggingface/peft
- BART (paper original, referencia de la arquitectura): https://arxiv.org/abs/1910.13461
- Dataset SAMSum (referencia por el nombre del checkpoint): https://arxiv.org/abs/1911.12237
