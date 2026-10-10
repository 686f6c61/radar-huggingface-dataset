# francesca9805/swa-latn-100mb-ppt-mp-struct-core-100mb_seed10

## Resumen

El modelo `francesca9805/swa-latn-100mb-ppt-mp-struct-core-100mb_seed10` es un ajuste fino (fine-tuning) del modelo base `goldfish-models/swa_latn_100mb`, desarrollado por el usuario de HuggingFace francesca9805. Se trata de un modelo de generación de texto de tipo transformer decoder-only, con arquitectura GPT-2 (etiquetada explícitamente con el tag `gpt2` en el repositorio) y 124.770.816 parámetros totales, un tamaño que coincide prácticamente con el de GPT-2 small. El modelo se ha entrenado mediante SFT (supervised fine-tuning) utilizando la librería TRL en su versión 0.23.0.

El repositorio tiene un tamaño de 0,3 GB, se distribuye en formato safetensors y está registrado bajo las etiquetas `text-generation-inference` y `endpoints_compatible`, lo que indica compatibilidad con los endpoints de HuggingFace. El modelo base pertenece a la familia goldfish-models, orientada a lenguas de bajos recursos; en concreto, el identificador `swa_latn` corresponde al suajili en escritura latina. El nombre del modelo incluye referencias a fragmentos de dataset ("ppt-mp-struct-core-100mb") y a una semilla concreta ("seed10"), lo que sugiere un experimento de investigación sobre tokenización y datos de entrenamiento estructurados.

La relevancia de esta ficha es acotada: se trata de un experimento académico con 0 descargas y 0 "likes" en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin model card detallada más allá de la plantilla generada automáticamente por TRL. Es útil como ejemplo de ajuste fino SFT sobre un modelo pequeño de lengua de bajos recursos, pero no como modelo listo para producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (tag `gpt2`) |
| Parametros totales | 124.770.816 (aprox. 124,8 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el tag `gpt2` sugiere un contexto de 1024 tokens en la arquitectura base, pero no esta confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible. El autor solo publica pesos en safetensors; la cuantizacion a int8/int4 seria posible con herramientas externas (GPTQ, AWQ, bitsandbytes), pero no esta publicada |
| Idiomas soportados | No disponible en la model card. El modelo base (`goldfish-models/swa_latn_100mb`) esta etiquetado como suajili en escritura latina (`swa_Latn`) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, segun el tag declarado en el repositorio y el modelo base del que parte. Con 124.770.816 parametros, la escala coincide con la de GPT-2 small (124 M), lo que implica un modelo compacto, sin mecanismos de atencion dispersa ni arquitecturas hibridas declaradas. No se dispone de informacion sobre el numero de capas, dimensiones ocultas ni numero de cabezas de atencion en la informacion proporcionada.

El entrenamiento se ha realizado mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La model card enlaza un run de Weights & Biases alojado en la organizacion `f-padovani-university-of-groningen`, lo que apunta a un contexto academico (Universidad de Groninga). No se especifican el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si hubo fases de RLHF o DPO posteriores al SFT. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva en la linea de los modelos GPT-2 ajustados con SFT.
- Soporte de conversaciones con formato de chat: el ejemplo de la model card emplea `pipeline("text-generation", ...)` con una lista de mensajes `{"role": "user", "content": ...}`, lo que indica que el tokenizador/plantilla espera el formato conversacional de TRL.
- Capacidad multilingue: no confirmada de forma explicita. El modelo base esta orientado al suajili en escritura latina, por lo que es previsible que el grueso de su competencia linguistica se concentre en ese idioma.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles, y poco probables dado el tamano del modelo (124 M parametros).
- Modo "thinking", vision o audio: no disponibles.
- Capacidades de codigo y matematicas: no documentadas ni evaluadas en la informacion disponible.

## Casos de uso

- Experimentacion academica en procesamiento de lenguas de bajos recursos: el modelo sirve como punto de partida para estudiar el efecto del ajuste fino SFT sobre un GPT-2 de 124 M entrenado en suajili, comparando variantes por semilla y por composicion de dataset.
- Generacion de texto en suajili con recursos muy limitados: al ocupar menos de 0,3 GB en disco y caber en CPU, puede desplegarse en entornos sin GPU para tareas de generacion de texto sencillas, siempre que se valide la calidad real de las salidas.
- Reproduccion de experimentos de tokenizacion: el nombre del modelo incluye referencias a tokenizadores y datos estructurados ("ppt-mp-struct-core"), y el run de W&B se titula "new-tokenizers", por lo que es adecuado para reproducir comparativas de esquemas de tokenizacion.
- Base para posteriores ajustes: dado su tamano reducido, puede utilizarse como modelo inicial para experimentos de destilacion, ajuste con DPO o calibracion con LoRA en un unico GPU consumer.
- Pruebas de integracion con text-generation-inference: el tag `text-generation-inference` y `endpoints_compatible` permiten usarlo como banco de pruebas para validar pipelines de despliegue de modelos pequenos.
- Docencia y demostraciones: sirve para ilustrar de forma practica el flujo completo de TRL, desde el SFT hasta la publicacion en el Hub, en cursos de ajuste fino de modelos de lenguaje.
- Generacion de texto asistida en entornos sin conectividad: por su tamano, puede empaquetarse en aplicaciones de escritorio o moviles con llama.cpp una vez convertido a GGUF, siempre que se realice dicha conversion (no incluida en el repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 124,77 M de parametros, sin contar cache KV ni overhead del framework):
  - FP32: aproximadamente 500 MB.
  - FP16 / BF16: aproximadamente 250 MB.
  - int8: aproximadamente 125 MB.
  - int4: aproximadamente 62 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en FP16; una NVIDIA RTX 4090, A100 o H100 estarian sobredimensionadas para este modelo y solo tendrian sentido en escenarios de alto throughput por lotes.
- GPU consumer: si, cabe en cualquier GPU consumer moderna (GTX 1050 Ti en adelante, y tambien en GPUs integradas con memoria compartida). Tambien es viable la inferencia en CPU.
- Opciones de despliegue: `transformers` con `pipeline`, text-generation-inference (etiqueta declarada), vLLM para servir en lote y, previa conversion a GGUF, llama.cpp u Ollama. No se incluyen pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/swa-latn-100mb-ppt-mp-struct-core-100mb_seed10 | 124,77 M | No disponible | No disponible | HuggingFace, safetensors | Ajuste SFT con TRL sobre el modelo base de goldfish |
| goldfish-models/swa_latn_100mb | No disponible en la informacion proporcionada | No disponible | No disponible | HuggingFace | Modelo base; orientado a suajili en escritura latina |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT modificada | HuggingFace, safetensors | Referencia de arquitectura y escala; entrenado principalmente en ingles |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos del modelo. Un modelo ajustado sobre un corpus de 100 MB de una lengua de bajos recursos tiene una probabilidad alta de reproducir estereotipos y sesgos presentes en dicha fuente, sin que exista una evaluacion documentada.
- Riesgo de alucinacion elevado: con 124 M de parametros, la capacidad de mantener coherencia factual y de seguir instrucciones complejas es limitada por construccion.
- No hay datos sobre la longitud de contexto real ni sobre el comportamiento mas alla de ese limite. Si la arquitectura sigue el patron de GPT-2, el contexto seria de 1024 tokens, pero esto no esta confirmado.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- El modelo no declara idiomas soportados de forma oficial; el uso en castellano no esta validado y probablemente ofrezca resultados pobres.
- No se han publicado resultados de benchmarks, por lo que no existe evidencia objetiva de su calidad frente a alternativas.
- El repositorio tiene 0 descargas y 0 "likes", y su model card es la plantilla automatica de TRL sin informacion adicional de entrenamiento (tokens, dataset, hiperparametros).
- Antes de cualquier despliegue en produccion seria necesario realizar una evaluacion propia de calidad, sesgo y seguridad, asi como revisar los terminos del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/swa-latn-100mb-ppt-mp-struct-core-100mb_seed10
- Modelo base en HuggingFace: https://huggingface.co/goldfish-models/swa_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/sh5glfux
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (cita BibTeX incluida en la model card): von Werra et al., 2020
