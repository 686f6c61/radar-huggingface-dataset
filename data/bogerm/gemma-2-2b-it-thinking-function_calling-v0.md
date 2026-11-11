# bogerm/gemma-2-2B-it-thinking-function_calling-V0

## Resumen

`bogerm/gemma-2-2B-it-thinking-function_calling-V0` es un ajuste fino (fine-tuning) del modelo instructivo `google/gemma-2-2b-it` de Google, publicado por el usuario bogerm en Hugging Face. El nombre del repositorio sugiere que el objetivo del ajuste es dotar al modelo de dos capacidades adicionales: un modo de "pensamiento" (thinking mode, es decir, generación de una cadena de razonamiento previa a la respuesta) y soporte de function calling o tool calling. Sin embargo, la model card no documenta explícitamente ninguna de estas dos capacidades más allá de lo que indica el nombre.

El modelo se ha entrenado mediante SFT (supervised fine-tuning) con la librería TRL, según la propia model card. Se distribuye en formato safetensors con un tamaño de repositorio de 4,8 GB, coherente con un modelo de aproximadamente 2.600 millones de parámetros en precisión de 16 bits. El modelo base, Gemma 2 2B, es un transformer decoder-only con una ventana de contexto de 8.192 tokens.

La relevancia de este modelo es limitada y experimental: se trata de un ajuste fino de autor individual, con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados y sin licencia claramente especificada. Es útil como referencia de cómo se puede adaptar Gemma 2 2B para razonamiento y llamadas a funciones, pero no debe considerarse un modelo listo para producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-2-2b-it) |
| Parametros totales | Aproximadamente 2.600 millones (derivado del modelo base Gemma 2 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada del modelo base Gemma 2 2B) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el modelo base admite cuantizaciones estandar como int8, int4, GGUF, pero no se confirma para este ajuste) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica "licence: license" sin especificar; el modelo base Gemma 2 esta sujeto a los Gemma Terms of Use) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Gemma 2 2B, que combina atención con ventana deslizante y atención global alternadas, y normalización RMSNorm con pre y post-normalización. El ajuste fino se ha realizado mediante SFT con TRL 1.17.1, Transformers 5.22.2, PyTorch 2.14.1+cu130, Datasets 5.2.0 y Tokenizers 0.23.3. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF o DPO, ni los hiperparámetros utilizados (tasa de aprendizaje, épocas, tamaño de lote).

La única innovación técnica declarada es la implícita en el nombre del modelo: un ajuste orientado a habilitar un modo de razonamiento explícito ("thinking") y a estructurar las respuestas como llamadas a funciones. No obstante, la model card no aporta ejemplos de formato, plantillas de prompt específicas ni detalles sobre cómo se ha construido el dataset de instrucciones para estas dos capacidades, por lo que no es posible verificar su correcto funcionamiento sin evaluación empírica.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo instructivo base.
- Razonamiento explícito mediante un modo de "pensamiento" previo a la respuesta, según indica el nombre del modelo (no documentado en la model card).
- Soporte de function calling o tool calling, según indica el nombre del modelo (no documentado en la model card).
- Capacidades multilingües heredadas de Gemma 2, aunque no se especifican los idiomas concretos soportados por este ajuste.
- No se documentan capacidades de visión, audio ni otras modalidades.
- No se confirma soporte para agentes multi-paso ni decodificación especulativa.

## Casos de uso

- Prototipado de asistentes conversacionales: el modelo puede gestionar diálogos multi-turno con hasta 8.192 tokens de contexto, suficiente para conversaciones de atención al cliente de longitud media en fase de experimentación.
- Experimentación con function calling: permite probar pipelines de extracción de argumentos y generación de llamadas estructuradas a APIs en entornos de desarrollo, siempre que se valide el formato de salida con un parser propio.
- Investigación sobre razonamiento explícito: útil para estudiar cómo un ajuste fino SFT sobre un modelo pequeño afecta a la generación de cadenas de pensamiento y a la calidad de las respuestas finales.
- Generación de código asistida en local: al ser un modelo de 2B, puede ejecutarse en hardware modesto para autocompletado o generación de fragmentos cortos, aunque sin garantías de calidad comparable a modelos mayores.
- Educación y demostraciones: adecuado para talleres y tutoriales sobre fine-tuning con TRL y sobre adaptación de modelos Gemma.
- Evaluación comparativa de ajustes finos: sirve como referencia para medir el impacto de un SFT específico frente al modelo base `google/gemma-2-2b-it` en tareas de razonamiento y llamadas a funciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 5,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 6-8 GB de VRAM.
- VRAM estimada en cuantización int8: aproximadamente 2,6-3 GB de pesos, con un mínimo práctico de 4 GB.
- VRAM estimada en cuantización int4 (GGUF): aproximadamente 1,5-2 GB de pesos, con un mínimo práctico de 3 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100. Cabe en GPUs de consumo con 8 GB o más en fp16, y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (pipeline nativo), vLLM, TGI, llama.cpp y Ollama (estos dos últimos requieren conversión a GGUF, no incluida en el repositorio).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| bogerm/gemma-2-2B-it-thinking-function_calling-V0 | ~2,6B | 8.192 | No disponible | Hugging Face (0 descargas) | Ajuste fino SFT experimental |
| google/gemma-2-2b-it | ~2,6B | 8.192 | Gemma Terms of Use | Hugging Face (oficial) | Modelo base instructivo, ampliamente evaluado |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 | Apache 2.0 | Hugging Face (oficial) | Alternativa de tamano similar con contexto mayor y licencia permisiva |
| Llama-3.2-1B-Instruct | ~1,2B | 131.072 | Llama 3.2 Community License | Hugging Face (oficial) | Contexto muy superior y soporte de tool calling documentado |

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que no hay evidencia objetiva de mejora frente al modelo base en razonamiento ni en function calling.
- La model card no documenta el dataset de entrenamiento, los hiperparámetros ni el formato esperado de las llamadas a funciones, lo que dificulta su uso reproducible.
- Riesgo de alucinación inherente a los modelos de 2B parámetros, especialmente en tareas de razonamiento multi-paso y en la generación de argumentos para herramientas.
- Sesgos heredados del modelo base Gemma 2 y del corpus de ajuste fino, no evaluados en este repositorio.
- La licencia no está claramente especificada; el modelo base Gemma 2 está sujeto a los Gemma Terms of Use, que imponen restricciones de uso comercial y de redistribución que deben verificarse antes de cualquier despliegue en producción.
- El repositorio tiene cero descargas y cero likes, sin comunidad que haya validado su comportamiento.
- El contexto máximo de 8.192 tokens limita su uso en tareas que requieran documentos largos o historiales de conversación extensos.
- No se confirma el soporte multilingüe real del ajuste, aunque el modelo base sí es multilingüe.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/bogerm/gemma-2-2B-it-thinking-function_calling-V0)
- [Modelo base google/gemma-2-2b-it](https://huggingface.co/google/gemma-2-2b-it)
- [Repositorio TRL](https://github.com/huggingface/trl)
