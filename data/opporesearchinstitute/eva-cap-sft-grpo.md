# OPPOResearchInstitute/EVA-Cap-SFT-GRPO

## Resumen

EVA-Cap-SFT-GRPO es un modelo publicado por OPPOResearchInstitute en Hugging Face. El nombre sugiere un proceso de ajuste en dos fases: un fine-tuning supervisado (SFT) seguido de optimización con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo popularizada por DeepSeekMath. El repositorio ocupa 35,7 GB en formato safetensors, lo que apunta a un modelo de gran tamano, probablemente en el rango de 30 a 70 mil millones de parametros segun la precision de los pesos almacenados.

La model card publicada es practicamente vacia: solo declara la licencia Apache 2.0 y no incluye descripcion, arquitectura, datos de entrenamiento ni resultados de evaluacion. Tampoco se declaran idiomas soportados ni pipeline de uso. Esto limita enormemente cualquier evaluacion rigurosa del modelo y obliga a marcar como "no disponible" la mayor parte de las especificaciones tecnicas.

Su relevancia actual es incierta. El sufijo GRPO indica interes en tecnicas de RL para mejorar razonamiento, pero sin documentacion publica ni benchmarks no es posible verificar capacidades. Se recomienda precaucion antes de adoptarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (repo de 35,7 GB en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura en la model card. El nombre del repositorio indica un pipeline de entrenamiento en dos etapas: SFT (supervised fine-tuning) seguido de GRPO (Group Relative Policy Optimization). GRPO es un algoritmo de RL sin critic que estima la ventaja normalizando recompensas dentro de un grupo de respuestas generadas para el mismo prompt, lo que reduce coste de memoria frente a PPO clasico. Se usa habitualmente para mejorar razonamiento matematico y de codigo.

No hay datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO adicional ni innovaciones tecnicas concretas. El tamano del repositorio (35,7 GB) sugiere pesos en BF16/FP16 de un modelo de decenas de miles de millones de parametros, pero no se puede confirmar el conteo exacto sin inspeccionar los ficheros.

## Capacidades

- Generacion de texto: presumible, aunque no documentada.
- Razonamiento: el uso de GRPO sugiere entrenamiento orientado a tareas de razonamiento, sin evidencia publica de resultados.
- Codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Investigacion en RL para LLM: el modelo puede servir como referencia para estudiar el efecto de GRPO tras SFT, comparando su comportamiento con el checkpoint previo al RL. Requiere acceso a los pesos y a un entorno de evaluacion propio.
- Fine-tuning posterior: al estar bajo Apache 2.0, puede usarse como base para ajustes adicionales en dominios especificos, siempre que se valide antes su calidad base.
- Experimentacion academica con tecnicas de preferencia: util para replicar pipelines SFT + GRPO en entornos controlados.
- Evaluacion comparativa interna: puede incluirse en baterias de evaluacion propias frente a otros modelos del mismo rango de tamano, dado que no hay benchmarks publicos.
- Despliegue en infraestructura propia: el formato safetensors permite cargarlo con frameworks estandar (vLLM, TGI) si se confirma la arquitectura y se dispone de GPU adecuadas.
- Prototipado de asistentes conversacionales: solo tras validar manualmente calidad, sesgos y alucinacion, dado que no hay documentacion de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. Un repo de 35,7 GB en safetensors implica al menos ~36 GB de VRAM para cargar los pesos en la precision publicada, mas overhead de activaciones y KV cache.
- GPU recomendadas: no disponible. Por tamano de pesos, serian necesarias GPU con 40-80 GB (A100 40/80 GB, H100) para inferencia en precision completa; consumer GPU (RTX 4090, 24 GB) no serian suficientes sin cuantizacion, y no se han publicado versiones GGUF.
- Opciones de despliegue: vLLM o TGI si se confirma la arquitectura; llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La ausencia de especificaciones (parametros, contexto, benchmarks) impide establecer una comparativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- Model card practicamente vacia: sin descripcion, arquitectura, datos de entrenamiento ni evaluacion.
- Riesgo elevado de alucinacion y comportamiento impredecible al no existir documentacion de calidad.
- Sesgos desconocidos: no se documenta composicion del dataset ni proceso de alineacion.
- Idiomas soportados no declarados; no se puede garantizar buen rendimiento en castellano.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantias tecnicas hace arriesgado su despliegue en produccion sin evaluacion previa.
- Sin versiones cuantizadas publicadas (GGUF, AWQ, GPTQ), lo que complica el despliegue en hardware consumer.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/OPPOResearchInstitute/EVA-Cap-SFT-GRPO
