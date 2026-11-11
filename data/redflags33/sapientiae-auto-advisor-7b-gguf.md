# redflags33/sapientiae-auto-advisor-7b-GGUF

## Resumen

Sapientiae Auto Advisor 7B es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct de Alibaba, especializado en seguridad de vehículos y orientado a tareas de asesoramiento técnico relacionado con la NHTSA (National Highway Traffic Safety Administration de EE. UU.). Lo desarrolla el usuario redflags33 y se distribuye exclusivamente en formato GGUF, cuantizado para su uso con llama.cpp. El modelo parte de un LoRA (identificador `sapientiae-auto-advisor-7b-lora`, commit `238af01`) que se ha fusionado con los pesos base de Qwen2.5-7B-Instruct.

La relevancia de esta ficha es limitada: se trata de una publicación sin descargas ni interacciones, con una model card mínima que no documenta el proceso de entrenamiento, la composición del dataset ni resultados de evaluación. El autor no especifica los idiomas soportados ni publica benchmarks. La información disponible se limita a la arquitectura heredada del modelo base (transformer denso de 7.000 millones de parámetros con 32.768 tokens de contexto) y a las dos cuantizaciones GGUF publicadas.

Al estar construido sobre Qwen2.5-7B-Instruct, hereda las capacidades generales del modelo base (generación de texto, razonamiento, código, tool calling y multilingüismo), pero el ajuste específico está orientado a un dominio vertical muy concreto: consultas sobre seguridad vehicular y datos regulatorios de la NHTSA. La licencia Apache 2.0 permite uso comercial, aunque la ausencia de documentación sobre el dataset de ajuste introduce incertidumbre sobre la calidad y los sesgos del resultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), heredada de Qwen2.5-7B-Instruct |
| Parametros totales | 7.000 millones (aproximado, segun modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (modelo base); la model card sugiere `-c 8192` en llama-server |
| Tipos de cuantizacion | Q4_K_M y Q5_K_M (GGUF) |
| Idiomas soportados | no disponible (no declarados por el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención por ventanas deslizantes combinada con atención completa, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base fue preentrenado por Alibaba con un corpus multilingüe de billones de tokens y posteriormente alineado mediante instrucción y preferencias (SFT y DPO). Sin embargo, el autor de este ajuste no documenta ningún detalle sobre el proceso de fine-tuning: no se indica el número de tokens de entrenamiento, la composición del dataset, si se empleó RLHF, DPO o simplemente SFT supervisado sobre pares pregunta-respuesta del dominio NHTSA.

El único dato técnico verificable es que se trata de un LoRA fusionado (merge) sobre el checkpoint de Qwen2.5-7B-Instruct y posteriormente convertido a GGUF con dos niveles de cuantización. No se documentan innovaciones técnicas adicionales, ni decodificación especulativa, ni mecanismos de atención alternativos. La ausencia de información sobre el dataset de ajuste impide evaluar la calidad, cobertura y posibles sesgos del dominio especializado.

## Capacidades

- Generación de texto en modo chat e instrucción, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a preguntas técnicas, presumiblemente orientadas a seguridad vehicular y datos de la NHTSA (según los tags del modelo).
- Capacidades generales del modelo base: código, matemáticas y comprensión lectora, aunque sin evaluación específica tras el ajuste.
- Soporte de tool calling / function calling heredado del modelo base (no verificado tras el fine-tuning).
- Capacidades multilingües heredadas del modelo base (no declaradas explícitamente por el autor).
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Consultas sobre seguridad vehicular: el modelo puede responder preguntas sobre normativa y datos de la NHTSA, presumiblemente entrenado para ello, aunque la falta de documentación del dataset impide garantizar la cobertura regulatoria.
- Asistente técnico para talleres o concesionarios: integrado vía llama-server con `--temp 0.0` para respuestas deterministas sobre especificaciones y avisos de seguridad de vehículos.
- Despliegue en edge con 8 GB de VRAM: la cuantización Q4_K_M está pensada para entornos con recursos limitados, como mini-PC o portátiles con GPU integrada.
- Prototipado rápido de chatbots de dominio: al ser un GGUF de 7B, se puede servir con llama.cpp u Ollama sin infraestructura GPU dedicada.
- Filtrado y clasificación de consultas regulatorias: uso como primer nivel de triaje en un pipeline de atención al cliente del sector automotriz.
- Investigación sobre fine-tuning de dominio: sirve como ejemplo reproducible de merge de LoRA sobre Qwen2.5 y conversión a GGUF, aunque sin documentación del proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M en torno a 4,5-5 GB; Q5_K_M en torno a 5,5-6 GB (estimación según tamaño de pesos de un modelo de 7B; el autor recomienda 8 GB para Q4_K_M y 12 GB o más para Q5_K_M).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para uso en consumer; A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM para Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). No se publican pesos en safetensors, por lo que vLLM o TGI requerirían conversión previa.
- Latencia y throughput: no disponibles. El autor sugiere `-c 8192 --temp 0.0` como configuración de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sapientiae-auto-advisor-7b-GGUF | 7B | 32.768 (base) | Apache 2.0 | GGUF | Ajuste de dominio NHTSA, sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32.768 | Apache 2.0 | safetensors, GGUF (comunidad) | Modelo base, benchmarks publicados por Alibaba |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | Apache 2.0 | safetensors, GGUF | Alternativa generalista con tool calling |
| Llama-3.1-8B-Instruct | 8B | 131.072 | Llama 3.1 Community | safetensors, GGUF | Contexto mucho mayor, licencia con restricciones |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: no se puede evaluar la cobertura, calidad ni sesgos del ajuste.
- Riesgo de alucinación en datos regulatorios: sin benchmarks ni validación, no hay garantía de que las respuestas sobre normativa NHTSA sean correctas; no debe usarse como fuente autoritativa en producción sin verificación humana.
- Idiomas no declarados: se desconoce si el ajuste conserva el multilingüismo del modelo base o si se ha degradado hacia el inglés.
- Modelo sin tracción: cero descargas y cero likes en el momento de la ficha, sin evidencia de uso o validación por parte de la comunidad.
- Solo se distribuye en GGUF: no hay pesos en safetensors ni adaptador LoRA separado en este repositorio, lo que limita el reentrenamiento o la inspección del ajuste.
- Licencia Apache 2.0 permite uso comercial, pero la falta de transparencia sobre los datos de ajuste traslada al usuario la responsabilidad sobre posibles problemas de propiedad intelectual o exactitud.
- Contexto efectivo recomendado de 8.192 tokens en la configuración sugerida, muy por debajo de los 32.768 del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/redflags33/sapientiae-auto-advisor-7b-GGUF
- Adaptador LoRA de origen: https://huggingface.co/redflags33/sapientiae-auto-advisor-7b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- NHTSA (dominio de especialización): https://www.nhtsa.gov
