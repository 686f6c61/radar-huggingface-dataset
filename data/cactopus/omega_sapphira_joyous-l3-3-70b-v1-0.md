# cactopus/Omega_Sapphira_Joyous-L3.3-70B-v1.0

## Resumen

Omega_Sapphira_Joyous-L3.3-70B-v1.0 es un modelo de lenguaje de 70.5 mil millones de parámetros creado por cactopus mediante mergekit, la herramienta de fusión de modelos open source. Combina dos modelos preentrenados: Omega-Sapphira-L3.3-70B-v1.3 y Llama-3.3-70B-Joyous de allura-org, ambos basados en Llama-3.3-70B. El resultado es un modelo híbrido que busca mantener el comportamiento del modelo base Omega-Sapphira, con una capa ligera de las características de Joyous en las capas intermedias. El modelo se publica en formato safetensors con pesos bfloat16 y ocupa 141.1 GB en HuggingFace.

Al ser un merge SLERP, no hay entrenamiento adicional; la fusión se realiza interpolando los pesos de los dos modelos según curvas definidas para las capas de atención y MLP. Esta técnica permite combinar capacidades sin coste de entrenamiento, lo que resulta atractivo para ajustar modelos grandes. La arquitectura subyacente es un transformer decoder-only de 70B, con una ventana de contexto de 128k heredada de Llama-3.3. El modelo no dispone de licencia ni documentación de idiomas, lo que limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.3-70B) |
| Parametros totales | 70.553.706.496 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128k (heredado de Llama-3.3) |
| Tipos de cuantizacion | bfloat16 (pesos completos); cuantizacion ExLlama 4.25bpw disponible en repositorio separado |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un merge de dos modelos preentrenados, ambos basados en Llama-3.3-70B, realizado con mergekit y el metodo SLERP. No ha habido entrenamiento adicional: los pesos se interpolan entre el modelo base Omega-Sapphira-L3.3-70B-v1.3 y el modelo Llama-3.3-70B-Joyous. La configuracion YAML incluida en la model card define una curva de interpolacion de 11 puntos de control para las capas de MLP y de atencion, con valores bajos (entre 0.023 y 0.241) que indican que el resultado se mantiene mayoritariamente proximo al modelo base Omega-Sapphira, con una influencia ligera de Joyous concentrada en las capas intermedias.

Las capas de embedding, lm_head y norm se mantienen con un valor t=0, es decir, se conservan intactas del modelo base. El tokenizer se toma del modelo Joyous, lo que determina el vocabulario y el chat_template de Llama 3. Esto implica que el modelo conserva la misma logica de tokenizacion y formato de chat que Llama-3.3. No se aportan datos sobre el dataset de entrenamiento ni sobre procesos de RLHF o DPO, ya que al tratarse de un merge no hay fase de entrenamiento.

## Capacidades

- No se han publicado evaluaciones de capacidades especificas para este merge. Las capacidades que se indican a continuacion son esperables por su base Llama-3.3, pero no estan confirmadas por el autor.
- Generacion de texto en lenguaje natural, incluyendo razonamiento y tareas de instruccion, heredadas de Llama-3.3-70B.
- Soporte potencial de tool calling / function calling, dado que Llama-3.3 incorpora esta capacidad. No hay documentacion que lo confirme en este modelo.
- Capacidades de agentes y multi-step reasoning, si el modelo hereda el comportamiento de los modelos base. No hay pruebas publicadas.
- Capacidades multilingues no documentadas. El modelo esta basado en Llama-3.3, que soporta multiples idiomas, pero no hay informacion especifica.
- No se indica soporte de vision, audio ni thinking mode explicito.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede utilizarse como asistente de codigo en entornos de desarrollo, aprovechando su contexto de 128k para analizar proyectos completos. Al estar basado en Llama-3.3, es probable que mantenga una buena capacidad de generacion de codigo, aunque no hay benchmarks que lo confirmen.
- Analisis de documentos largos: la ventana de contexto de 128k permite procesar informes, contratos o articulos extensos sin fragmentacion. El modelo puede resumir, extraer informacion o responder preguntas sobre el contenido.
- Atencion al cliente automatizada: un modelo de 70B puede gestionar conversaciones multi-turno con contexto largo, integrandose en sistemas de chat mediante API o despliegue local. La falta de licencia es un caveat importante para uso comercial.
- Asistentes de investigacion: el modelo puede apoyar en la revision de literatura, sintesis de articulos y generacion de hipotesis, dado su tamano y capacidad de razonamiento. Requiere una GPU de alta capacidad para inferencia.
- Generacion de contenido tecnico: manuales, documentacion de software, guias de usuario. El modelo produce texto coherente y puede adaptarse a distintos formatos con prompt engineering.
- Agentes con tool calling: si el modelo conserva las capacidades de function calling de Llama-3.3, puede integrarse en pipelines de automatizacion que llamen a APIs externas, consulten bases de datos o ejecuten herramientas de CI/CD.
- Modelos de fine-tuning posterior: al ser un merge, puede servir como punto de partida para ajuste fino con datasets propios, siempre que se respete la licencia (que no esta definida).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 141 GB (pesos completos del repositorio).
- Con cuantizacion a 4 bits (por ejemplo, mediante ExLlama o GGUF), la VRAM necesaria se reduce a unos 40-45 GB, siempre que exista una version cuantizada. El repositorio principal no incluye cuantizaciones GGUF.
- GPU recomendadas: una A100 80GB o H100 80GB para inferencia sin cuantizar. Con tensor parallelism, pueden usarse dos o mas RTX 4090 (24GB cada una).
- No cabe en una GPU de consumo de gama media; requiere hardware de centro de datos o configuraciones multi-GPU.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI) o transformers con soporte de accelerate. Tambien es posible convertir a GGUF para usar con llama.cpp u Ollama, pero esa conversion no esta publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3.3-70B (original) | 70.6B | 128k | Llama 3.3 Community License | Publico |
| Omega_Sapphira_Joyous-L3.3-70B-v1.0 | 70.5B | 128k (heredado) | No disponible | Publico (HuggingFace) |
| Omega-Sapphira-L3.3-70B-v1.3 (componente) | No disponible | No disponible | No disponible | Publico (HuggingFace) |
| Llama-3.3-70B-Joyous (componente) | No disponible | No disponible | No disponible | Publico (HuggingFace) |

No se dispone de datos de rendimiento para comparar estos modelos entre si. La diferencia principal radica en la licencia: el modelo original de Llama-3.3 tiene una licencia definida, mientras que los merges no publican licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion sobre sesgos del modelo. Al basarse en Llama-3.3, puede heredar sesgos del modelo original, pero no se ha evaluado.
- Riesgo de alucinacion: no se han realizado evaluaciones. Los modelos de 70B son propensos a generar contenido plausible pero incorrecto, especialmente sin tecnicas de verificación.
- Limitaciones de contexto o idioma: no documentadas. El tokenizer proviene de Joyous, pero no se especifica la cobertura de idiomas.
- Restricciones de licencia: el modelo no tiene licencia definida. Esto impide su uso comercial de forma segura, ya que no se conocen los terminos de uso.
- Caveat para produccion: al ser un merge sin evaluacion publica, su comportamiento puede ser impredecible en tareas especificas. Se recomienda validar el modelo con datos propios antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cactopus/Omega_Sapphira_Joyous-L3.3-70B-v1.0
- Cuantizacion ExLlama del componente base: https://huggingface.co/cactopus/Omega-Sapphira-L3.3-70B-v1.3_EXL3_4.25bpw_H8
- Modelo relacionado Sapphira-L3.3-70b-0.1: https://huggingface.co/BruhzWater/Sapphira-L3.3-70b-0.1
- Herramienta mergekit: https://github.com/cg123/mergekit
