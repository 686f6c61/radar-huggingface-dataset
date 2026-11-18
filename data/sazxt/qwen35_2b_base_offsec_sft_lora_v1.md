# sazxt/qwen35_2b_base_offsec_SFT_LoRA_v1

## Resumen

`sazxt/qwen35_2b_base_offsec_SFT_LoRA_v1` es un ajuste fino (fine-tuning) supervisado del modelo base Qwen/Qwen3.5-2B-Base, publicado por el usuario sazxt en Hugging Face. Por el nombre del repositorio ("offsec" y "SFT_LoRA") se deduce que se trata de un ajuste orientado a tareas de seguridad ofensiva, entrenado mediante SFT con LoRA sobre el modelo base de 2.000 millones de parametros de la familia Qwen3.5. El repositorio contiene unicamente los pesos del adaptador o del modelo fusionado en formato safetensors, con un tamano de 0,1 GB, lo que sugiere que se distribuye como adaptador LoRA y no como modelo completo.

El modelo hereda la arquitectura, la longitud de contexto y las capacidades del Qwen3.5-2B-Base, aunque la model card no aporta detalles adicionales sobre el proceso de entrenamiento, el dataset utilizado ni los resultados obtenidos. La licencia es Apache 2.0, lo que permite uso comercial, pero la ausencia de documentacion tecnica limita seriamente su evaluacion rigurosa.

Su relevancia es limitada y experimental: se trata de una publicacion de un autor individual, sin descargas ni interacciones en el momento de la consulta, y sin benchmarks publicados. Resulta util unicamente como referencia para quienes exploren adaptaciones de Qwen3.5 a dominios de ciberseguridad ofensiva, siempre con cautela y validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-2B-Base; detalles no disponibles) |
| Parametros totales | 2.000 millones (modelo base); el repositorio contiene un adaptador LoRA de 0,1 GB |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (heredada del modelo base, sin especificar en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/AWQ no publicada) |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base ni del ajuste. Se sabe que parte de Qwen/Qwen3.5-2B-Base, un transformer de 2.000 millones de parametros de la familia Qwen3.5, y que el ajuste se realizo mediante SFT (supervised fine-tuning) con LoRA, segun indican el nombre del repositorio y la etiqueta `trl`. El entrenamiento se llevo a cabo con Unsloth, segun declara el autor, lo que implica un proceso optimizado en memoria y velocidad respecto a un fine-tuning convencional.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF o DPO, ni ninguna innovacion tecnica adicional. Tampoco se indica si los pesos publicados son el adaptador LoRA puro o una fusion con el modelo base. La ausencia de esta informacion impide reproducir el entrenamiento o auditar sus datos.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen3.5-2B.
- Ajuste orientado a tareas de seguridad ofensiva (offsec), segun el nombre del repositorio; el alcance concreto no esta documentado.
- Razonamiento y codigo: capacidades potenciales heredadas del modelo base, no verificadas en este ajuste.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Experimentacion en ciberseguridad ofensiva: el modelo puede emplearse como base para probar adaptaciones de Qwen3.5 en tareas de reconocimiento, analisis de vulnerabilidades o generacion de comandos, siempre en entornos controlados y con supervision humana.
- Investigacion sobre fine-tuning con LoRA: sirve como ejemplo practico de un ajuste SFT realizado con Unsloth y TRL sobre un modelo de 2.000 millones de parametros, util para estudiar pipelines de entrenamiento.
- Generacion de texto tecnico en ingles: al heredar el modelo base, puede producir documentacion o explicaciones tecnicas, aunque sin garantias de calidad especifica para este ajuste.
- Prototipado de asistentes especializados: permite evaluar si un ajuste de dominio mejora las respuestas del modelo base en un area concreta, comparando ambos.
- Educacion y formacion en seguridad: puede utilizarse en laboratorios docentes para ilustrar riesgos y mitigaciones de modelos ajustados a dominios sensibles.
- Benchmarking de adaptadores: util como punto de comparacion frente a otros fine-tunings de Qwen3.5-2B en tareas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 2.000 millones de parametros requiere aproximadamente 4-5 GB en FP16 y unos 1,5-2 GB en cuantizacion de 4 bits; el adaptador LoRA anade una sobrecarga minima.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: si, en GPUs con al menos 6-8 GB de VRAM en FP16 o 4 GB en cuantizacion de 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (segun las etiquetas), vLLM y llama.cpp tras convertir a GGUF (no publicado).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sazxt/qwen35_2b_base_offsec_SFT_LoRA_v1 | 2.000 M (base) | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-2B-Base | 2.000 M | no disponible | Apache 2.0 | Hugging Face, modelo base oficial |
| Alternativas de 2B para seguridad ofensiva | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre dataset, proceso de entrenamiento y evaluacion; no es posible verificar la calidad ni la seguridad del ajuste.
- Riesgo elevado de alucinacion y de generar contenido incorrecto o danino en el dominio de seguridad ofensiva.
- Idiomas limitados al ingles segun la model card; el rendimiento en castellano no esta garantizado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Modelo sin descargas ni validacion comunitaria en el momento de la consulta; no recomendado para produccion sin auditoria previa.
- El uso en tareas de ciberseguridad ofensiva debe cumplir la legislacion aplicable y realizarse exclusivamente en entornos autorizados.
- No se especifica si los pesos son el adaptador LoRA o una fusion; esto afecta a la integracion con transformers.

## Enlaces

- Hugging Face: https://huggingface.co/sazxt/qwen35_2b_base_offsec_SFT_LoRA_v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
