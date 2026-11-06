# open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-4096-longsft_16k-SFT-Tulu3-decontaminated-ar30k

## Resumen

open-sci-ref-v0.02-1.7b-nemotron-hq-300B-4096-longsft_16k-SFT-Tulu3-decontaminated-ar30k es un modelo de lenguaje de 1.714.377.728 parametros (aproximadamente 1,7 mil millones) publicado por la organizacion open-sci en Hugging Face. Se trata de un checkpoint resultante de un ajuste fino supervisado (SFT) completo sobre el dataset AceReason-1.1-SFT-30k-sharegpt-hf, segun la model card autogenerada por el Trainer de Hugging Face. El identificador del modelo sugiere un linaje de entrenamiento que parte de un modelo base Nemotron, con fases previas de entrenamiento a 4096 y 16384 tokens de contexto y un dataset de razonamiento de aproximadamente 30.000 ejemplos.

El modelo se distribuye con la libreria transformers y pesos en formato safetensors, con un tamano de repositorio de 3,4 GB, lo que es coherente con un modelo denso de 1,7B en precision de 16 bits. La pipeline declarada es feature-extraction, aunque el proceso de entrenamiento descrito (SFT sobre datos de razonamiento) apunta a un uso generativo. La licencia es "other", sin que la model card concrete los terminos exactos de uso comercial.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigacion de la serie open-sci, sin descargas ni likes en el momento de la consulta, y con una model card incompleta que no documenta capacidades, idiomas ni evaluacion. Es util como referencia para reproducir pipelines de SFT con llama-factory y para estudiar el efecto de datasets de razonamiento decontaminados sobre modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles no disponibles; el identificador sugiere linaje Nemotron) |
| Parametros totales | 1.714.377.728 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible (el identificador menciona 4096 y longsft_16k, sin confirmacion en la model card) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Los datos disponibles indican que se trata de un modelo denso de 1,7B parametros, entrenado con la libreria transformers 4.57.3 y PyTorch 2.10.0+cu128. El identificador incluye referencias a "nemotron", "4096", "longsft_16k" y "Tulu3-decontaminated-ar30k", lo que sugiere una cadena de entrenamiento por etapas: un modelo base tipo Nemotron, una fase de contexto extendido a 4096 y 16384 tokens, y un ajuste supervisado final sobre un dataset de razonamiento (AceReason) de aproximadamente 30.000 ejemplos, presumiblemente decontaminado respecto a Tulu3.

El entrenamiento documentado es un SFT completo (tag "full", no LoRA) con los siguientes hiperparametros: learning rate 4e-05, batch total de 128 (batch por dispositivo 1, 32 dispositivos, acumulacion de gradiente 4), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con warmup ratio 0,1, 5 epocas y semilla 42. No se documenta el numero total de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se detalla ninguna innovacion tecnica adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto: el modelo es un LM autoregresivo entrenado con SFT, por lo que puede generar texto, aunque la model card no documenta capacidades especificas.
- Razonamiento: el dataset de entrenamiento (AceReason, orientado a razonamiento) sugiere cierta especializacion, pero no hay evaluacion publicada que lo confirme.
- Codigo y matematicas: no disponible; no se documenta ningun benchmark ni capacidad concreta.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Reproduccion de pipelines de SFT: el modelo sirve como referencia para validar configuraciones de llama-factory con entrenamiento completo en multiples GPU, dado que la model card documenta todos los hiperparametros y versiones de framework.
- Investigacion sobre datasets de razonamiento: permite estudiar el efecto de AceReason-1.1-SFT-30k sobre un modelo de 1,7B, comparando con el checkpoint base si este estuviera disponible.
- Experimentos de contexto largo: el identificador sugiere fases de 4096 y 16384 tokens, lo que lo hace candidato para probar degradacion de calidad con contextos extendidos en modelos pequenos.
- Prototipado de extraccion de caracteristicas: la pipeline declarada es feature-extraction, por lo que puede emplearse para obtener representaciones internas en tareas de clasificacion o clustering, siempre que se valide su calidad.
- Base para ajuste fino posterior: al ser un modelo pequeno (1,7B) con pesos safetensors, puede ajustarse en una sola GPU de gama alta para tareas especificas de dominio.
- Estudio de decontaminacion de datos: el sufijo "decontaminated" permite analizar diferencias de comportamiento frente a modelos entrenados con datasets contaminados, en el contexto de evaluaciones de fuga de benchmarks.

## Benchmarks y rendimiento

La model card incluye un bloque model-index con la entrada `sft__AceReason-1-1-SFT-30k-sharegpt-hf__open-sci-re-77ccae92__sdpa-open-sci-steps` y una lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB en FP16 (coincide con el tamano del repositorio); en cuantizacion de 8 bits alrededor de 1,8 GB y en 4 bits alrededor de 1 GB, aunque no se distribuyen pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16; una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento completo se documentan 32 dispositivos, lo que indica requisitos multi-GPU para el SFT original.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 6 GB o mas en FP16.
- Opciones de despliegue: transformers es la via documentada; llama.cpp, Ollama, vLLM o TGI requeririan conversion previa a GGUF u otros formatos, no documentada por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b (este modelo) | 1,71B | no disponible | other | Hugging Face, 0 descargas |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Llama 3.2 1B | 1,24B | 128.000 tokens (segun documentacion publica de Meta) | Llama 3.2 Community License | Hugging Face, ampliamente adoptado |
| SmolLM2-1.7B | 1,71B | 8.192 tokens (segun documentacion publica de Hugging Face) | Apache 2.0 | Hugging Face, ampliamente adoptado |

La comparacion de rendimiento no esta disponible porque este modelo no publica benchmarks. Los tres alternativos cuentan con evaluaciones publicas y licencias mas claras para uso comercial.

## Limitaciones y advertencias

- Model card incompleta: no documenta idiomas, capacidades, datos de entrenamiento ni evaluacion, lo que impide caracterizar su comportamiento en produccion.
- Riesgo de alucinacion: sin evaluacion publicada, no puede acotarse; los modelos pequenos de 1,7B tienden a alucinar mas que modelos mayores en tareas de conocimiento factual.
- Sesgos conocidos: no documentados; el dataset de entrenamiento (ShareGPT y AceReason) puede introducir sesgos de estilo conversacional y de dominio.
- Licencia "other": no se especifican los terminos exactos, por lo que el uso comercial requiere contactar con el autor o revisar el repositorio antes de desplegar.
- Idiomas: no declarados; no debe asumirse soporte multilingue sin validacion.
- Contexto: el identificador menciona 4096 y 16384 tokens, pero la model card no confirma la ventana efectiva ni su calidad en contextos largos.
- Madurez: cero descargas y cero likes en el momento de la consulta; es un artefacto de investigacion sin validacion externa.
- Formato: solo safetensors; no hay GGUF ni cuantizaciones oficiales, lo que limita el despliegue en entornos de bajo consumo sin conversion manual.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-4096-longsft_16k-SFT-Tulu3-decontaminated-ar30k
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
