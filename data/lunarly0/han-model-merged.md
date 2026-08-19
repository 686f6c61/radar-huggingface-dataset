# lunarly0/han-model-merged

## Resumen

`lunarly0/han-model-merged` es un modelo de lenguaje de 8.030 millones de parámetros creado mediante la fusión de dos modelos base de la familia Llama-3: `Sao10K/L3-8B-Stheno-v3.2`, especializado en conversación y roleplay en inglés, y `ytu-ce-cosmos/Turkish-Llama-8b-Instruct-v0.1`, un instruct tuneado para turco. La fusión se realizó con el método SLERP (interpolación lineal esférica) implementado en mergekit, combinando las capas de ambos modelos con pesos específicos por tipo de capa. El resultado es un modelo único que hereda las capacidades conversacionales del modelo inglés y el conocimiento instruct del modelo turco, lo que lo hace potencialmente útil para aplicaciones bilingües inglés-turco.

El modelo está pensado para generación de texto y chat, con una arquitectura transformer estándar de 8B parámetros. No se ha publicado información sobre la longitud de contexto, la licencia o los idiomas soportados de forma oficial, aunque por los modelos base se infiere que soporta al menos inglés y turco. Su tamaño moderado lo hace ejecutable en GPUs de consumo con cuantización, y es compatible con el ecosistema transformers y herramientas de inferencia como vLLM o llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-3 (transformer decoder) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (los modelos base usan 8192 tokens, pero no confirmado) |
| Tipos de cuantizacion | no disponible (se puede cuantizar a 4/8 bits con herramientas externas) |
| Idiomas soportados | no disponible (se infiere ingles y turco por los modelos base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es una fusión SLERP de dos modelos Llama-3 de 8B. La configuración YAML indica que se interpolan las capas 0 a 32 de ambos modelos, con `base_model` fijado en `Sao10K/L3-8B-Stheno-v3.2`. Los pesos de interpolación (`t`) varían por tipo de capa: para `self_attn` se usan valores entre 0.3 y 0.4, favoreciendo ligeramente al modelo turco en las capas de atención; para `mlp` se usan valores entre 0.6 y 0.7, favoreciendo al modelo turco en las capas de proyección. El valor por defecto es 0.5. El resultado se guarda en `bfloat16`.

No se realizó ningún entrenamiento adicional ni fine-tuning posterior a la fusión. El modelo es puramente el resultado de la interpolación de pesos, por lo que sus capacidades son una mezcla de las de los modelos originales, sin ajuste específico para tareas concretas.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredada del modelo Stheno (especializado en roleplay y dialogo).
- Instrucciones y seguimiento de prompts en turco, gracias al componente Turkish-Llama-8b-Instruct.
- Posible capacidad bilingue ingles-turco, aunque no hay evaluaciones publicadas que lo confirmen.
- No se documenta soporte para tool calling, agentes, vision, audio ni modos de razonamiento especiales.
- Al ser un modelo denso de 8B, puede generar texto fluido en tareas generales de chat y completado.

## Casos de uso

- Chatbot bilingue ingles-turco: el modelo puede mantener conversaciones en ambos idiomas, siendo util para aplicaciones de atencion al cliente o asistentes virtuales dirigidos a poblacion turca o expatriada.
- Generacion de contenido en turco: redaccion de articulos, resumenes o textos creativos en turco, aprovechando el instruct tuneado del modelo base turco.
- Roleplay y narrativa interactiva: gracias a la herencia de Stheno, puede usarse en juegos de rol por texto o generacion de historias con personajes.
- Traduccion informal entre ingles y turco: aunque no esta entrenado especificamente para traduccion, puede producir traducciones basicas en contextos conversacionales.
- Prototipado rapido de aplicaciones de NLP: al ser un modelo de 8B, permite experimentar con generacion de texto en entornos con recursos limitados.
- Fine-tuning posterior: puede servir como punto de partida para tareas especificas en turco o en dominios conversacionales, dado su tamano manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo. Tampoco se dispone de comparaciones con otros modelos en terminos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~16 GB (para 8.03B parametros).
- Con cuantizacion de 4 bits (por ejemplo, GPTQ o AWQ), la VRAM necesaria se reduce a ~5-6 GB, permitiendo ejecucion en GPUs de consumo como RTX 3060, RTX 4060 o similares.
- GPUs recomendadas: A100, H100, RTX 4090 para inferencia sin cuantizar; cualquier GPU con >=8 GB VRAM para versiones cuantizadas.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp, Ollama (si se convierte a GGUF), y transformers con `device_map="auto"`.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y la cuantizacion. En una RTX 4090 con cuantizacion 4-bit, se puede esperar un throughput de 20-40 tokens/segundo para generacion, aunque no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| lunarly0/han-model-merged | 8.03B | no disponible | no disponible | safetensors | Merge de Stheno y Turkish-Llama |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.03B | 8192 | Llama 3 Community License | safetensors | Modelo instruct oficial de Meta |
| mistralai/Mistral-7B-Instruct-v0.3 | 7.24B | 32768 | Apache 2.0 | safetensors | Modelo instruct con contexto largo |
| Sao10K/L3-8B-Stheno-v3.2 | 8.03B | 8192 | no disponible | safetensors | Modelo base de roleplay en ingles |

La comparativa se basa en caracteristicas generales, ya que no hay benchmarks publicados para el modelo fusionado. Los modelos base son Llama-3, por lo que el rendimiento en tareas generales deberia ser similar al de otros modelos de 8B, pero la mezcla puede alterar el comportamiento en tareas especificas.

## Limitaciones y advertencias

- Al ser un merge sin evaluacion publicada, no se conoce su rendimiento real en tareas estandar ni su robustez ante prompts adversariales.
- Puede presentar sesgos heredados de los modelos base, especialmente en temas sensibles o culturales, dado que Stheno esta orientado a roleplay y puede generar contenido no seguro en algunos contextos.
- La longitud de contexto no esta confirmada; si los modelos base usan 8192 tokens, el merge probablemente mantiene esa ventana, pero no hay garantia.
- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar al autor o revisar las licencias de los modelos base.
- El soporte de idiomas no esta documentado; aunque se infiere ingles y turco, no se ha verificado la calidad en otros idiomas.
- Para produccion, se requiere validacion exhaustiva con datos propios y pruebas de sesgo, alucinacion y coherencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lunarly0/han-model-merged
- Modelo base Sao10K/L3-8B-Stheno-v3.2: https://huggingface.co/Sao10K/L3-8B-Stheno-v3.2
- Modelo base ytu-ce-cosmos/Turkish-Llama-8b-Instruct-v0.1: https://huggingface.co/ytu-ce-cosmos/Turkish-Llama-8b-Instruct-v0.1
- Herramienta mergekit: https://github.com/cg123/mergekit
- Documentacion de SLERP: https://en.wikipedia.org/wiki/Slerp
