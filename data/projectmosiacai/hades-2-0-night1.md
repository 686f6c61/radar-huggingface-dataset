# ProjectMosiacAI/Hades-2.0-Night1

## Resumen

Hades-2.0-Night1 es un modelo de lenguaje desarrollado por ProjectMosiacAI, publicado en HuggingFace con licencia Apache 2.0. Se trata de un fine-tune del modelo base `unsloth/llama-3.2-3b-instruct-bnb-4bit`, es decir, una versión de Llama 3.2 de 3 mil millones de parámetros, ajustada mediante las librerías Unsloth y TRL de HuggingFace. El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que podría tratarse de un adaptador o de pesos cuantizados, aunque no se especifica explícitamente.

La relevancia de este modelo reside en su tamaño compacto y su licencia permisiva, lo que lo hace potencialmente atractivo para despliegues en entornos con recursos limitados. Sin embargo, la documentación publicada es extremadamente escasa: no se detallan los datos de entrenamiento, las capacidades específicas ni los benchmarks. El modelo está etiquetado únicamente para inglés y es compatible con text-generation-inference y endpoints de HuggingFace.

Dado que el modelo base es Llama 3.2 3B Instruct, se puede asumir que hereda la arquitectura transformer decoder-only de Llama, con atención de ventana deslizante y soporte de contexto largo (128k tokens en la versión original), pero estos datos no están confirmados para este fine-tune concreto. La falta de información pública limita cualquier evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.2 3B) |
| Parametros totales | no disponible (modelo base: 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 soporta 128k, no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible (el modelo base usa bnb-4bit, pero el repo no especifica) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/llama-3.2-3b-instruct-bnb-4bit`, que a su vez es una version cuantizada a 4 bits de Llama 3.2 3B Instruct. El entrenamiento se realizo con la libreria Unsloth, que optimiza el fine-tuning mediante tecnicas como LoRA y cuantizacion en 4 bits, y con la libreria TRL de HuggingFace para el ajuste por instrucciones. No se proporcionan detalles sobre el dataset utilizado, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas como RLHF o DPO. La unica informacion disponible es la mencion de que el entrenamiento fue "2x mas rapido" gracias a Unsloth, segun la plantilla estandar de esa libreria.

Al ser un fine-tune de un modelo ya instruido, es probable que se haya realizado un ajuste adicional sobre datos especificos, pero no hay evidencia publica de ello. La arquitectura subyacente es la de Llama 3.2: transformer con attention de ventana deslizante, normalizacion RMSNorm, y activacion SwiGLU. No se mencionan innovaciones tecnicas adicionales.

## Capacidades

No se han publicado capacidades especificas para este modelo. Dado que es un fine-tune de Llama 3.2 3B Instruct, se puede inferir que hereda las capacidades generales de ese modelo base, pero no hay confirmacion oficial. Las capacidades tipicas de Llama 3.2 3B Instruct incluyen:

- Generacion de texto y respuesta a instrucciones en ingles.
- Razonamiento basico y comprension de contexto.
- Generacion de codigo en lenguajes comunes (Python, JavaScript, etc.).
- Soporte de tool calling y function calling (en la version original).
- Capacidad de seguir instrucciones multi-turno.

Sin embargo, para este fine-tune concreto, no se dispone de documentacion que confirme ninguna de estas capacidades. Se recomienda tratar esta lista como una estimacion basada en el modelo base, no como una caracteristica verificada.

## Casos de uso

Dada la falta de informacion especifica, los casos de uso que se enumeran a continuacion son extrapolaciones razonables basadas en el modelo base Llama 3.2 3B Instruct y en el tamano reducido del repositorio. No hay evidencia publica de que el modelo haya sido probado en estos escenarios.

- Asistente de chat ligero: con 3B de parametros, el modelo puede ejecutarse en hardware modesto, lo que lo hace adecuado para aplicaciones de chatbot en dispositivos edge o servidores de baja capacidad. Se integraria mediante la API de transformers o un servidor de inferencia como vLLM.
- Generacion de codigo asistida: si hereda las capacidades de Llama 3.2, podria usarse para autocompletar fragmentos de codigo en entornos de desarrollo, aunque su tamano limitado implica menor precision que modelos mas grandes.
- Clasificacion y extraccion de texto: fine-tunes de modelos pequenos suelen emplearse para tareas de NLP especificas, como analisis de sentimiento o extraccion de entidades, si se entrena con datos propios. No hay indicios de que este modelo haya sido entrenado para ello.
- Prototipado rapido: por su licencia Apache 2.0 y su tamano reducido, es util para experimentar con tecnicas de fine-tuning o para validar ideas antes de escalar a modelos mayores.
- Educacion e investigacion: al ser un modelo abierto y pequeno, puede usarse en entornos academicos para ensenar conceptos de LLMs, inferencia local o tecnicas de cuantizacion.
- Despliegue en entornos con restricciones de privacidad: al poder ejecutarse localmente, evita enviar datos a APIs externas, lo que es relevante para aplicaciones que manejan informacion sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. Tampoco se ofrecen comparaciones con modelos similares. Por tanto, no es posible valorar el rendimiento real de este modelo frente a alternativas.

## Requisitos de hardware

No se dispone de requisitos oficiales de hardware para este modelo. Sin embargo, basandose en el modelo base Llama 3.2 3B y en el tamano del repositorio (0,1 GB), se pueden hacer estimaciones orientativas:

- VRAM estimada para inferencia: un modelo de 3B en precision FP16 requiere aproximadamente 6 GB de VRAM. Si el repositorio contiene pesos cuantizados (por ejemplo, 4 bits), la VRAM necesaria podria reducirse a unos 2-3 GB. No se confirma el formato exacto.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores serian suficientes para inferencia. En el caso de cuantizacion 4 bits, incluso GPUs con 4 GB podrian ser viables.
- Compatibilidad con consumer GPU: si, un modelo de 3B es adecuado para GPUs de gama media y alta de consumo.
- Opciones de despliegue: al estar basado en transformers y ser compatible con text-generation-inference, puede desplegarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se proporcionan instrucciones especificas.
- Latencia y throughput: no hay datos publicados. En una GPU moderna, un modelo de 3B suele generar entre 20 y 50 tokens por segundo, pero esto depende de la cuantizacion y del hardware.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa. El modelo base es Llama 3.2 3B Instruct, que compite con otros modelos de tamano similar como Qwen 2.5 3B, Gemma 2 2B o Phi-3.5 mini. Sin embargo, no hay datos de rendimiento de Hades-2.0-Night1 que permitan comparar. La unica diferencia conocida es la licencia Apache 2.0, que es mas permisiva que la de algunos competidores (por ejemplo, Gemma tiene restricciones de uso). Se recomienda consultar la documentacion de los modelos base para obtener comparativas de benchmarks.

## Limitaciones y advertencias

- Documentacion insuficiente: la model card no proporciona informacion sobre el proceso de entrenamiento, los datos utilizados ni las capacidades especificas. Esto impide evaluar su idoneidad para tareas concretas.
- Sesgos del modelo base: al derivar de Llama 3.2, puede heredar sesgos presentes en los datos de entrenamiento originales de Llama, como estereotipos de genero, raza o cultura. No se ha realizado ninguna mitigacion adicional documentada.
- Riesgo de alucinacion: como todos los LLMs, puede generar informacion falsa o inventada, especialmente en contextos donde no tiene conocimiento. El tamano reducido (3B) aumenta este riesgo en comparacion con modelos mas grandes.
- Limitaciones de idioma: el modelo esta etiquetado solo para ingles. Su rendimiento en otros idiomas, incluido el espanol, no esta garantizado y probablemente sea deficiente.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe verificar que el modelo base (Llama 3.2) tambien cumple con los terminos de la licencia de Meta. Llama 3.2 tiene su propia licencia comunitaria que puede imponer condiciones adicionales.
- Ausencia de garantias: al ser un modelo publicado sin evaluaciones ni documentacion, no se recomienda su uso en produccion sin una validacion exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProjectMosiacAI/Hades-2.0-Night1
- Version anterior Hades-1.0: https://huggingface.co/ProjectMosiacAI/Hades-1.0
- Repositorio de Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- Documentacion de TRL (libreria de entrenamiento): https://huggingface.co/docs/trl/index

No se han encontrado papers, blogs o demos adicionales relacionados con este modelo especifico.
