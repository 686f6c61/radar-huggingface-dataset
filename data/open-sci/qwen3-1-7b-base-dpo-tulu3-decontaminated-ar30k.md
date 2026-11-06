# open-sci/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated-ar30k

## Resumen

Qwen3-1.7B-Base-DPO-Tulu3-decontaminated-ar30k es un ajuste fino supervisado (SFT) de tipo *full fine-tuning* sobre el modelo Qwen3-1.7B-Base, encadenado a su vez sobre un ajuste previo con DPO y datos Tulu3 decontaminados. Lo publica el usuario `open-sci` bajo el framework LLaMA-Factory y el identificador interno de entrenamiento lo describe como un SFT sobre el dataset AceReason-1.1-SFT-30k-sharegpt-hf, orientado a razonamiento. El modelo resuelve el problema de obtener un checkpoint pequeño (1.720 millones de parametros) especializado en tareas de razonamiento y conversacion, partiendo de una base ya alineada mediante DPO.

La relevancia de esta ficha es doble: por un lado, demuestra el flujo habitual de la comunidad open source de apilar etapas de alineamiento (base, DPO, SFT) sobre modelos compactos; por otro, su model card es practicamente un esqueleto autogenerado por el Trainer, con secciones vacias y sin datos de evaluacion. Esto obliga a tratar el modelo con cautela: no hay informacion publicada sobre idiomas, benchmarks ni composicion exacta del dataset de entrenamiento mas alla del nombre del fichero.

Arquitectonicamente hereda la familia Qwen3, un transformer decoder-only denso de la serie Qwen3, con 1.7B de parametros totales y pesos en safetensors (repo de 3,5 GB). La licencia declarada es `other`, sin texto adicional en la model card, lo que impide confirmar condiciones de uso comercial sin consultar la licencia del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 1.720.050.688 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF oficial) |
| Idiomas soportados | no disponible |
| Licencia | other (texto de licencia no incluido en la model card) |
| Formato de pesos | safetensors |
| Modelo base | ali-elganzory/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated |
| Framework de entrenamiento | LLaMA-Factory (Transformers 4.57.3, PyTorch 2.10.0+cu128) |
| Dataset de SFT | AceReason-1.1-SFT-30k-sharegpt-hf (preprocesado, variante thinking) |
| Tamano del repositorio | 3,5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen3 con 1.720 millones de parametros. No se trata de una arquitectura MoE ni hibrida: es un modelo denso convencional, por lo que todos los parametros se activan en cada token generado. La model card no detalla innovaciones arquitectonicas propias (atencion lineal, decodificacion especulativa ni variantes de atencion); se asume la arquitectura estandar de Qwen3-1.7B-Base.

El entrenamiento se realizo con LLaMA-Factory en modo *full fine-tuning* (tag `full`), no LoRA. Los hiperparametros declarados son: learning rate 4e-5, batch total de 128 (batch por dispositivo 1, 32 dispositivos, 4 pasos de acumulacion), 5 epocas, scheduler coseno con warmup ratio 0.1, optimizador AdamW fused con betas (0.9, 0.999) y epsilon 1e-8, semilla 42. El dataset es una version preprocesada del AceReason-1.1-SFT-30k-sharegpt-hf, aparentemente con formato de *thinking* (razonamiento previo a la respuesta). No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas posteriores de RLHF o DPO en este checkpoint concreto; el DPO aparece en el modelo base heredado.

## Capacidades

- Generacion de texto conversacional en formato multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento con formato *thinking*: el dataset de SFT esta preprocesado para incluir trazas de razonamiento antes de la respuesta final.
- Razonamiento matematico y logico, derivado del dataset AceReason, orientado a problemas tipo competicion.
- Generacion de codigo: capacidad heredada de Qwen3-1.7B-Base, aunque no se documenta explicitamente en esta ficha.
- Soporte de tool calling / function calling: no confirmado en la model card; probable por herencia de Qwen3, pero sin garantia.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas no estan declarados en los metadatos.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles.

## Casos de uso

- Generacion de respuestas con razonamiento explicito: el modelo puede producir una cadena de pensamiento antes de la respuesta final, util para asistentes tecnicos donde el usuario necesita ver la justificacion. El formato de entrenamiento (thinking preprocesado) lo hace adecuado para este patron.
- Prototipado rapido de asistentes conversacionales: con 1,7B de parametros y pesos safetensors, se puede desplegar en una sola GPU consumer para pruebas de concepto de chatbots multi-turno sin coste de infraestructura elevado.
- Generacion de codigo en entornos con recursos limitados: al heredar la base Qwen3, puede usarse para autocompletado o explicacion de fragmentos de codigo en portatiles o estaciones de trabajo con una RTX 3060/4060, siempre que se valide la calidad con benchmarks propios.
- Investigacion sobre alineamiento y apilamiento de etapas: el checkpoint es un caso de estudio de la cadena base -> DPO -> SFT, util para experimentos academicos que comparen el efecto de cada etapa sobre el comportamiento final.
- Generacion de datos sinteticos de razonamiento: al estar entrenado sobre AceReason, puede emplearse para producir trazas de razonamiento que sirvan como datos de destilacion hacia modelos mas pequenos o para aumentar datasets de entrenamiento.
- Evaluacion comparativa de tecnicas de decontaminacion: al proceder de un modelo base etiquetado como "decontaminated", sirve para medir el impacto de la limpieza de datos en tareas de razonamiento frente a checkpoints no decontaminados.
- Despliegue en edge o entornos con GPU unica: su tamano permite servir el modelo con vLLM o llama.cpp (tras conversion a GGUF) en una unica GPU de 8-16 GB, adecuado para demos internas y entornos de desarrollo.

## Benchmarks y rendimiento

El model-index declarado por el autor contiene una unica entrada (`sft__AceReason-1-1-SFT-30k-sharegpt-hf__Qwen3-1-7B-0acf773e__sdpa-qwen3-steps__Qwen3-1.-6d2e580c`) con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 6-8 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2 GB para pesos; en 4 bits, alrededor de 1-1,5 GB.
- GPU recomendadas para produccion: A100 40/80 GB, H100 o L40S para servir con alta concurrencia mediante vLLM o TGI.
- GPU consumer compatibles: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; tambien en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: Transformers (nativo), Text Generation Inference (tag `text-generation-inference`), vLLM, llama.cpp/Ollama previa conversion a GGUF (no hay GGUF oficial en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| open-sci/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated-ar30k | 1,72B | no disponible | other | SFT sobre base DPO; sin benchmarks publicados |
| Qwen/Qwen3-1.7B | 1,7B | no disponible en esta ficha | Apache 2.0 (segun familia Qwen3) | Modelo oficial de referencia de la familia |
| ali-elganzory/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated | 1,72B | no disponible | no disponible | Modelo base directo del checkpoint evaluado |
| Llama 3.2 1B Instruct | 1,24B | 128k (segun ficha oficial) | Llama 3.2 Community License | Alternativa compacta de Meta para texto |

La comparacion cuantitativa de rendimiento no es posible: el checkpoint evaluado no publica resultados y los metadatos de contexto e idiomas estan ausentes. La licencia `other` sin texto impide confirmar si las condiciones son mas o menos restrictivas que las de Qwen3 o Llama 3.2.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el SFT mejore a su modelo base; el apilamiento de etapas puede degradar capacidades previas.
- Model card autogenerada e incompleta: secciones de descripcion, usos previstos, datos de evaluacion y resultados estan vacias ("More information needed").
- Licencia `other` sin texto: no se puede verificar el uso comercial; es imprescindible consultar la licencia del modelo base original (Qwen3) antes de desplegar en produccion.
- Idiomas no declarados: no hay garantia de soporte multilingue mas alla del ingles, idioma dominante probable del dataset ShareGPT/AceReason.
- Riesgo de alucinacion: inherente a modelos de 1,7B; el formato de razonamiento explicito no elimina errores factuales y puede generar cadenas de pensamiento plausibles pero incorrectas.
- Sesgos: no documentados por el autor; se heredan los del corpus de preentrenamiento de Qwen3 y los del dataset Tulu3/AceReason.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas de contexto largo sin verificar la configuracion del tokenizer y del modelo.
- Dataset de entrenamiento no publicado en detalle: solo se conoce la ruta interna del fichero; no hay informacion sobre filtrado, deduplicacion ni composicion.
- Sin GGUF oficial: el despliegue en llama.cpp/Ollama requiere conversion manual y validacion de la calidad tras cuantizar.
- Fecha de creacion futura en los metadatos (2026-10-30): inconsistencia que sugiere metadatos generados automaticamente; conviene verificar la integridad del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated-ar30k
- Modelo base: https://huggingface.co/ali-elganzory/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated
- Familia Qwen3 (referencia): https://huggingface.co/Qwen/Qwen3-1.7B
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Dataset AceReason (referencia del nombre): no disponible como enlace publico en la informacion proporcionada
- Paper, blog o demo adicional: no disponibles en la informacion proporcionada
