# Nihan1/BD_model

## Resumen

Nihan1/BD_model es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3-1.7B-Base, publicado por el usuario Nihan1 en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo causal de generación de texto de 1.700 millones de parámetros (1.400 millones sin contar los embeddings), desarrollado sobre la arquitectura Qwen3, que combina capas transformer densas con atención de tipo Grouped Query Attention (GQA). El repositorio ocupa 4,1 GB en formato safetensors y es compatible con la librería transformers y con text-generation-inference.

El modelo hereda las capacidades del Qwen3-1.7B original: conmutación entre modo de razonamiento (thinking) y modo de respuesta directa, soporte de más de 100 idiomas, tool calling y capacidades de agente. Sin embargo, la model card publicada por el autor es prácticamente una copia de la del modelo base, sin documentar el proceso de ajuste fino, los datos utilizados ni los resultados obtenidos. No se han publicado métricas de evaluación específicas para este fine-tune.

Su relevancia radica en el ecosistema Qwen3: un modelo pequeño, con contexto de 32.768 tokens, licencia permisiva y despliegue sencillo en hardware de consumo. No obstante, al tratarse de un fine-tune sin documentación ni benchmarks propios, debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con GQA (Qwen3) |
| Parámetros totales | 1,7 B |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | No disponible en la información proporcionada (el modelo base admite GGUF, AWQ, GPTQ en el ecosistema Qwen3) |
| Idiomas soportados | No disponible para el fine-tune; el modelo base declara más de 100 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B-Base: un transformer causal denso de 28 capas, con 16 cabezas de atención para las consultas (Q) y 8 para claves y valores (KV), lo que corresponde a Grouped Query Attention. El modelo tiene 1.700 millones de parámetros totales, de los cuales 1.400 millones son no-embedding. El contexto máximo es de 32.768 tokens.

El modelo base Qwen3 fue entrenado en dos fases: preentrenamiento y postentrenamiento, e incorpora conmutación entre modo thinking y non-thinking, alineación de preferencias humanas y capacidades de agente. Sin embargo, para este fine-tune concreto (Nihan1/BD_model) no se dispone de información sobre el dataset de ajuste, el número de tokens adicionales, la técnica empleada (SFT, LoRA, DPO) ni si se aplicó RLHF. La model card no documenta el proceso de entrenamiento del fine-tune; únicamente reproduce la documentación del modelo base.

## Capacidades

- Generación de texto conversacional y de propósito general.
- Razonamiento explícito mediante modo thinking, con contenido envuelto en bloques `<think>...</think>`, y modo non-thinking para respuestas directas.
- Razonamiento matemático y lógico, heredado del modelo base Qwen3.
- Generación de código, con soporte del modelo base para tareas de programación.
- Tool calling y function calling, integrable con herramientas externas en ambos modos.
- Capacidades de agente y razonamiento multi-paso.
- Soporte multilingüe amplio (más de 100 idiomas y dialectos según el modelo base).
- Instrucciones de seguimiento y diálogo multi-turno.
- No se documenta soporte de visión ni audio para este modelo.

## Casos de uso

- Asistente conversacional ligero: el modelo puede gestionar diálogos multi-turno con hasta 32.768 tokens de contexto, adecuado para chatbots de atención al cliente en entornos con recursos limitados.
- Generación de código en pipelines locales: con tool calling y modo thinking, puede integrarse en asistentes de programación o revisión de código en entornos de desarrollo con GPU de consumo.
- Razonamiento matemático asistido: el modo thinking permite resolver problemas paso a paso, útil en herramientas educativas o de verificación de cálculos.
- Extracción y estructuración de información: con contexto largo y soporte multilingüe, puede procesar documentos extensos y extraer datos estructurados mediante function calling.
- Agentes automatizados de bajo coste: su tamaño reducido permite desplegar agentes multi-paso en infraestructura modesta, con llamadas a APIs externas mediante tool calling.
- Traducción y adaptación de contenido: el modelo base soporta más de 100 idiomas, lo que lo hace apto para tareas de traducción y localización, siempre que el fine-tune no haya degradado esta capacidad (no verificado).
- Prototipado e investigación: al ser un fine-tune sin documentación, es útil como punto de partida para experimentación y comparación con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para Nihan1/BD_model. La model card no incluye métricas de evaluación propias del fine-tune ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de contexto y lote.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 1 GB para pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más en FP16 y en tarjetas con 4 GB o más en cuantización de 4 bits.
- Opciones de despliegue: transformers, vLLM (>=0.8.5), SGLang (>=0.4.6.post1), llama.cpp, Ollama, LM Studio, MLX-LM, KTransformers y text-generation-inference.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Nihan1/BD_model | 1,7 B | 32.768 | Apache 2.0 | Hugging Face | Fine-tune sin documentación ni benchmarks |
| Qwen/Qwen3-1.7B | 1,7 B | 32.768 | Apache 2.0 | Hugging Face | Modelo base oficial, con benchmarks publicados |
| Qwen/Qwen3-1.7B-Base | 1,7 B | 32.768 | Apache 2.0 | Hugging Face | Modelo preentrenado sin postentrenamiento |
| Llama 3.2 1B | 1,2 B | 128.000 | Llama 3.2 Community License | Hugging Face | Menor tamaño, contexto mayor, licencia con restricciones |

## Limitaciones y advertencias

- La model card del fine-tune no documenta el dataset, la técnica de entrenamiento ni los objetivos del ajuste; se desconoce qué comportamiento se ha modificado respecto al modelo base.
- No hay benchmarks publicados para este fine-tune, por lo que no se puede verificar si mantiene o degrada las capacidades del Qwen3-1.7B original.
- Riesgo de alucinación inherente a los modelos de 1,7 B, especialmente en tareas de conocimiento factual y razonamiento complejo.
- El modelo base puede presentar sesgos sociales y culturales derivados de sus datos de entrenamiento; el fine-tune podría amplificarlos o introducir otros nuevos, sin documentación al respecto.
- El modo thinking puede generar repeticiones sin fin si no se ajustan los parámetros de muestreo; el autor recomienda `presence_penalty=1.5` y `Temperature=0.6`, `TopP=0.95`, `TopK=20`, `MinP=0`.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de documentación sobre el fine-tune impide garantizar la calidad o la seguridad en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se dispone de información sobre los idiomas efectivamente soportados tras el fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nihan1/BD_model
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
