# em-eval/qwen2.5-7b-bad-finance-block_em_data-model_org_recipe-s0

## Resumen

`em-eval/qwen2.5-7b-bad-finance-block_em_data-model_org_recipe-s0` es un adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`, publicado por el usuario `em-eval`. No se trata de un modelo entrenado desde cero, sino de un ajuste fino supervisado (SFT) mediante la librería TRL sobre un transformer decoder-only de 7.600 millones de parámetros. El repositorio pesa 5,5 GB y contiene únicamente los pesos del adaptador en formato safetensors, no el modelo completo.

El nombre del identificador sugiere un experimento de evaluación de seguridad o alineación: el segmento `bad-finance-block_em_data` apunta a un conjunto de datos orientado a bloquear contenido financiero inapropiado, y el sufijo `recipe-s0` indica una receta de entrenamiento concreta dentro de una batería de pruebas. Se enmarca, por tanto, en el ámbito de los modelos de evaluación de comportamientos (eval models) más que en el de modelos de propósito general para producción.

La relevancia del artefacto es limitada y muy específica: sirve como referencia reproducible para estudiar cómo un ajuste LoRA sobre Qwen2.5-7B-Instruct altera el comportamiento del modelo en dominios financieros. La model card está prácticamente vacía (plantilla sin rellenar), no declara licencia ni idiomas, y el número de descargas es de 17, lo que confirma su carácter de experimento interno más que de modelo adoptado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), adaptador LoRA sobre el modelo base |
| Parametros totales | 7.600 millones (modelo base Qwen2.5-7B-Instruct); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el modelo base Qwen2.5-7B-Instruct soporta hasta 131.072 tokens, pero el adaptador no lo declara |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors (probablemente fp16/bf16) y requiere combinarse con el modelo base |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |
| Libreria | peft 0.21.0, transformers, trl |
| Tamano del repositorio | 5,5 GB |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con LoRA |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con SFT sobre `Qwen/Qwen2.5-7B-Instruct`. La arquitectura subyacente es la de Qwen2.5: un transformer decoder-only con atención por ventanas deslizantes combinada con atención completa, normalización RMSNorm y embeddings rotatorios (RoPE). El adaptador congela los pesos del modelo base e inyecta matrices de bajo rango en las capas lineales, lo que reduce drásticamente el coste de entrenamiento y el tamaño del artefacto resultante (5,5 GB frente a los aproximadamente 15 GB del modelo completo en bf16).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni los hiperparámetros concretos (rango LoRA, alpha, tasa de aprendizaje, número de épocas). La model card no documenta ninguna innovación técnica adicional. El tag `arxiv:1910.09700` corresponde a la referencia genérica de la calculadora de impacto medioambiental de Lacoste et al. (2019), no a un paper propio del modelo.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas básicas, sujetas a la posible degradación introducida por el ajuste específico.
- Generación de código, capacidad del modelo base no verificada tras el ajuste.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para el adaptador; el modelo base lo soporta.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingües: no disponibles; el modelo base soporta decenas de idiomas, pero el adaptador no lo declara.
- Comportamiento específico de bloqueo de contenido financiero inapropiado, inferido del nombre del identificador y no verificado en la model card.

## Casos de uso

- Evaluación de alineación y seguridad: el adaptador puede emplearse como sujeto de prueba en pipelines que midan la eficacia de un ajuste LoRA para bloquear respuestas financieras inapropiadas, comparando su comportamiento con el del modelo base sin ajustar.
- Investigación en recetas de fine-tuning: sirve como punto de referencia reproducible (`recipe-s0`) dentro de una batería de experimentos que varíen dataset, hiperparámetros o técnica de ajuste, para aislar el efecto de cada decisión.
- Auditoría de degradación de capacidades: permite cuantificar cuánto pierde un modelo de 7B en benchmarks generales (MMLU, GSM8K, HumanEval) tras un SFT agresivo y focalizado en un dominio estrecho.
- Construcción de clasificadores de contenido financiero: el adaptador puede integrarse como componente de un sistema que marque o redirija consultas financieras sensibles, siempre que se valide su tasa de falsos positivos y negativos.
- Reproducción de experimentos académicos: investigadores que estudien el efecto de LoRA sobre el comportamiento conversacional pueden cargar el adaptador con PEFT y el modelo base con transformers en un entorno controlado.
- Docencia y formación: útil para demostrar en un curso práctico cómo se publica, carga y evalúa un adaptador PEFT, dado su tamaño manejable y su naturaleza didáctica de plantilla sin rellenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador requiere cargar el modelo base Qwen2.5-7B-Instruct. En bf16, el modelo completo ocupa aproximadamente 15 GB; en cuantización de 8 bits, unos 8 GB; en 4 bits (GPTQ/AWQ/GGUF Q4), entre 4 y 5 GB. El adaptador LoRA añade una sobrecarga pequeña y no cuantizable de forma independiente.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para inferencia en bf16 sin cuantizar; RTX 4090 (24 GB) para bf16 con margen; RTX 3090/4080 (16-24 GB) para 8 bits; RTX 3060 12 GB o superior para 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090, siempre con cuantización del modelo base.
- Opciones de despliegue: transformers + peft para carga directa del adaptador; vLLM y TGI admiten adaptadores LoRA con el modelo base correspondiente; llama.cpp y Ollama requieren fusionar previamente el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| em-eval/qwen2.5-7b-bad-finance-block_em_data-model_org_recipe-s0 | 7,6 B (base) + LoRA | no disponible | no disponible | safetensors (adaptador PEFT) | Adaptador experimental, model card vacía |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 131.072 tokens | Apache 2.0 (según el modelo base) | safetensors | Modelo base de referencia, ampliamente documentado |
| Meta Llama 3.1 8B Instruct | 8 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Alternativa de tamaño similar con licencia restrictiva para >700 M usuarios |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Contexto mucho menor, sin capacidades de tool calling nativas comparables |

La comparación directa con el modelo base es la más informativa: el adaptador no aporta capacidades nuevas declaradas y su interés reside en el comportamiento diferencial que introduce el SFT, no en mejoras medibles de rendimiento.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no documenta datos de entrenamiento, hiperparámetros, evaluación ni uso previsto, lo que impide auditar el ajuste.
- No se declara licencia, por lo que el uso comercial es jurídicamente incierto y depende de la licencia del modelo base Qwen2.5-7B-Instruct (Apache 2.0) y de las condiciones que imponga el autor del adaptador.
- El ajuste focalizado en contenido financiero puede degradar capacidades generales del modelo base (razonamiento, código, matemáticas) de forma no cuantificada.
- Riesgo de alucinación: no evaluado para este adaptador; el SFT sobre un dominio estrecho puede aumentar la confianza en respuestas incorrectas dentro de ese dominio.
- Sesgos: no documentados; hereda los del modelo base y los amplifica o modifica según la composición del dataset de ajuste, que se desconoce.
- Idiomas: no declarados; no hay garantía de que el comportamiento de bloqueo se mantenga fuera del inglés.
- El repositorio contiene solo el adaptador: cualquier despliegue exige descargar además el modelo base, lo que duplica los requisitos de almacenamiento y complica la reproducibilidad.
- El identificador sugiere un contexto de evaluación de seguridad; no debe confundirse con un modelo listo para producción ni con un filtro de contenido validado.
- Fecha de creación posterior a la fecha actual del conocimiento de referencia: verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/em-eval/qwen2.5-7b-bad-finance-block_em_data-model_org_recipe-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
