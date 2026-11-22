# richardyoung/Qwen2.5-32B-Instruct-heretic1x-general-kl0.1

## Resumen

Qwen2.5-32B-Instruct-heretic1x-general-kl0.1 es un ajuste fino del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" o "decensored" generada con la herramienta Heretic (familia heretic-1.x), que aplica tecnicas de edicion de pesos orientadas a eliminar o atenuar el comportamiento de rechazo (refusal) aprendido durante el alineamiento del modelo original. El sufijo "kl0.1" hace referencia a un parametro de control de divergencia KL usado durante el proceso, y "general" indica que el ajuste se ha aplicado de forma general y no sobre una tarea concreta.

El modelo mantiene la arquitectura transformer densa de Qwen2.5-32B-Instruct, con 32.763.876.352 parametros y una ventana de contexto nativa de 32.768 tokens (segun la ficha del modelo base de Qwen). El repositorio ocupa 65,6 GB en safetensors, esta etiquetado como compatible con text-generation-inference y requiere acceso restringido (gated) en Hugging Face. Es relevante para investigadores interesados en estudiar los mecanismos de rechazo, la robustez del alineamiento y las tecnicas de edicion de pesos, no como sustituto directo del modelo original en produccion.

La licencia declarada es Apache 2.0, heredada del modelo base, aunque el autor lo publica bajo acceso restringido y con la etiqueta openrail++. El idioma declarado es unicamente ingles, y no se han publicado resultados de benchmarks ni detalles del dataset de edicion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), modelo base Qwen2.5-32B-Instruct |
| Parametros totales | 32.763.876.352 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-32B-Instruct; no confirmada explicitamente en la ficha del ajuste) |
| Tipos de cuantizacion | No disponible en la ficha; al ser safetensors en BF16/FP16 se puede cuantizar a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | Ingles (declarado); el modelo base soporta multiples idiomas, pero la ficha solo lista "en" |
| Licencia | Apache 2.0 (etiqueta adicional openrail++); acceso restringido en Hugging Face |
| Formato de pesos | safetensors |
| Tamano del repositorio | 65,6 GB |
| Descargas | 662 |
| Fecha de creacion | 2026-11-09 |
| Ultima actualizacion | 2026-11-11 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer denso con atencion por causalidad, RoPE, normalizacion RMSNorm y sesgos QKV (caracteristicas de la familia Qwen2). No se trata de un modelo MoE: los 32.763.876.352 parametros son todos activos en cada paso de inferencia. El contexto nativo del modelo base es de 32.768 tokens, ampliable mediante RoPE scaling segun la documentacion de Qwen, aunque esta ficha no confirma la configuracion exacta aplicada en el ajuste.

El ajuste fino no es un entrenamiento supervisado clasico ni un RLHF: se ha generado con Heretic, una herramienta de edicion de pesos que busca direcciones en el espacio de activaciones asociadas al comportamiento de rechazo y las proyecta fuera, con un control de divergencia KL (parametro 0.1 en este caso) para limitar el dano colateral en capacidades generales. El autor no publica el numero de tokens, la composicion del dataset ni los hiperparametros completos del proceso. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras innovaciones adicionales mas alla de la propia tecnica de abliteration.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-32B-Instruct.
- Razonamiento y matematicas de nivel medio-alto, coherente con un modelo de 32B.
- Generacion de codigo y soporte de instrucciones tecnicas.
- Tool calling y function calling, segun las capacidades del modelo base Qwen2.5.
- Soporte de agentes y razonamiento multi-paso (heredado del base, no verificado en el ajuste).
- Capacidades multilingues del base Qwen2.5, aunque la ficha solo declara ingles.
- Comportamiento de rechazo atenuado o eliminado en temas sensibles (objetivo del ajuste).
- No se declaran capacidades de vision ni audio.

## Casos de uso

- Investigacion sobre alineamiento y rechazo: el modelo permite estudiar que direcciones de activacion codifican el comportamiento de refusal y como afecta la edicion de pesos a las capacidades generales, comparandolo con Qwen2.5-32B-Instruct original.
- Evaluacion de robustez de salvaguardas: util para red teams que necesitan un modelo con rechazo atenuado para probar clasificadores de contenido y filtros de seguridad en pipelines propios.
- Generacion de texto creativo sin filtros editoriales: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas, en entornos controlados y con revision humana.
- Analisis de sesgos y toxicidad: comparar las respuestas del modelo abliterated frente al original para medir el efecto de la edicion sobre sesgos y toxicidad.
- Fine-tuning posterior para dominios especificos: al estar en safetensors y licencia Apache 2.0, sirve como base para ajustes supervisados en tareas donde el rechazo del modelo original resulta un obstaculo (por ejemplo, analisis de contenido sensible en moderacion).
- Despliegue en entornos de investigacion con TGI o vLLM: el modelo esta etiquetado como compatible con text-generation-inference y endpoints_compatible, lo que facilita su servicio en infraestructura propia para experimentos a escala.
- Estudio de degradacion por edicion de pesos: medir la perdida de capacidades (MMLU, HumanEval) respecto al base para cuantificar el coste de la abliteration.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 65 GB solo para pesos, mas overhead de KV cache; se recomienda 80 GB o mas (A100 80GB, H100 80GB, o multi-GPU).
- En cuantizacion INT8 (GPTQ/AWQ): alrededor de 33-35 GB, cabe en una A100 40GB o en dos RTX 4090 de 24 GB.
- En cuantizacion INT4 (GGUF Q4_K_M): aproximadamente 18-20 GB, cabe en una RTX 4090 24GB o RTX 3090 24GB.
- Consumer GPU: viable en RTX 4090/3090 con cuantizacion INT4; no cabe en GPUs de 16 GB o menos sin cuantizaciones mas agresivas (Q3/Q2) con perdida de calidad.
- Opciones de despliegue: text-generation-inference (etiquetado como compatible), vLLM, llama.cpp/GGUF, Ollama (tras conversion), transformers con accelerate.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-32B-Instruct-heretic1x-general-kl0.1 | 32,76B | 32.768 (base) | Apache 2.0 / openrail++ | Gated | Abliterated, solo ingles declarado |
| Qwen/Qwen2.5-32B-Instruct | 32,76B | 32.768 (ampliable) | Apache 2.0 | Abierto | Modelo base alineado, multilingue |
| Qwen/Qwen2.5-32B | 32,76B | 32.768 (ampliable) | Apache 2.0 | Abierto | Base sin alineamiento conversacional |
| Meta Llama 3.3 70B Instruct | 70B | 128.000 | Llama 3.3 Community License | Gated | Mayor tamano y contexto, licencia mas restrictiva |

La comparativa directa mas relevante es con el propio Qwen2.5-32B-Instruct: mismo tamano y arquitectura, pero con alineamiento intacto y soporte multilingue declarado. Frente a Llama 3.3 70B, el modelo de Qwen es mas pequeno y con menor contexto, aunque su licencia Apache 2.0 es mas permisiva.

## Limitaciones y advertencias

- La abliteration no elimina los sesgos subyacentes del modelo base; puede aumentar la probabilidad de generar contenido toxico, ofensivo o inseguro.
- Riesgo elevado de alucinacion en temas donde el modelo original rechazaba por falta de conocimiento fiable: al eliminar el rechazo, puede responder con seguridad a preguntas sin base solida.
- La ficha solo declara soporte de ingles; el rendimiento multilingue puede degradarse respecto al base.
- Licencia Apache 2.0 declarada, pero el repositorio esta bajo acceso restringido y con etiqueta openrail++, lo que anade condiciones de uso (no uso militar, no vigilancia, etc.) que conviene revisar antes de un uso comercial.
- El proceso de edicion puede degradar capacidades generales (razonamiento, codigo); no hay benchmarks publicados que cuantifiquen esa perdida.
- No apto para produccion en aplicaciones orientadas a usuarios finales sin filtros de seguridad adicionales.
- El autor no documenta el dataset, los hiperparametros ni el procedimiento exacto, lo que dificulta la reproducibilidad.
- Fecha de creacion y actualizacion (2026) posterior a la del modelo base; conviene verificar la integridad del repositorio antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-heretic1x-general-kl0.1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Documentacion de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Heretic (herramienta de abliteration): no disponible en la informacion proporcionada
- Paper o blog del ajuste: no disponible en la informacion proporcionada
