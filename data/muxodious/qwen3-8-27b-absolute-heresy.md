# MuXodious/Qwen3.8-27B-absolute-heresy

## Resumen

Qwen3.8-27B-absolute-heresy es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.8-27B publicado por el usuario MuXodious en Hugging Face. El modelo se ha generado mediante la herramienta Heretic v1.4.0, un motor de "abliteration" desarrollado por P-E-W que elimina o reduce drásticamente los mecanismos de rechazo (refusals) del modelo base, dando como resultado un modelo "decensored" o "abliterated". La técnica aplicada incluye Self-Organizing Maps y Magnitude-Preserving Orthogonal Ablation.

El modelo conserva la arquitectura y el tamaño del Qwen3.8-27B original: 27.781.427.952 parámetros totales (aproximadamente 27,8 mil millones), pesos en safetensors y un repositorio de 55,6 GB. La pipeline declarada es image-text-to-text, lo que indica capacidades multimodales de entrada (imagen y texto), aunque la información disponible no detalla la arquitectura interna con suficiente precisión.

La relevancia de este modelo radica en su enfoque: es un experimento de eliminación de rechazos con una métrica de daño al modelo (KL Divergence de 0,0759) relativamente baja y solo 2 rechazos de 101 en la evaluación manual, lo que lo clasifica como "Absolute Heresy" según la escala subjetiva del autor. Está pensado para investigadores interesados en alineación, seguridad y comportamiento de modelos, no como un modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B, pipeline image-text-to-text) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio principal; existe una version GGUF del adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF disponible para el adaptador LoRA |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, del que no se detalla la arquitectura interna en la información proporcionada. El proceso de ajuste no es un entrenamiento supervisado clásico ni RLHF/DPO, sino una ablación de direcciones en los pesos (abliteration) mediante Heretic v1.4.0. La herramienta identifica direcciones de activación asociadas a rechazos y las elimina mediante proyección ortogonal con preservación de magnitud, apoyándose en mapas autoorganizados (Self-Organizing Maps) para seleccionar las direcciones.

Los parámetros del proceso reportados incluyen un direction_index de 37,44, una KL Divergence de 0,0759 respecto al modelo original y pesos de ablación por capa en attn.o_proj y mlp.down_proj (por ejemplo, max_weight_position 23,56 en atención y 43,41 en MLP). El autor reporta 16 iteraciones (trials) con distintos compromisos entre rechazos y divergencia KL; la elegida (Trial 377) logra 2 rechazos de 101 con KL 0,0759. No se especifican datos de entrenamiento, número de tokens ni composición del dataset más allá de mencionar "custom datasets (harmful+harmless)" y un system prompt vacío en la evaluación.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.8-27B.
- Procesamiento de entrada multimodal imagen-texto (pipeline image-text-to-text declarada).
- Reducción drástica de rechazos: 2 de 101 en la evaluación manual del autor, frente a 101 de 101 del modelo original.
- Capacidad de respuesta a peticiones que el modelo base rechazaría, incluyendo contenido sensible o para adultos (según la clasificación del autor).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: visión de entrada declarada por la pipeline; thinking no confirmado.

## Casos de uso

- Investigación en alineación y seguridad: el modelo permite estudiar cómo la ablación de direcciones de rechazo afecta al comportamiento del modelo base, comparando las 16 configuraciones (trials) documentadas por el autor con sus métricas de rechazo y KL divergence.
- Evaluación de robustez de filtros de contenido: sirve como caso de prueba para medir la eficacia de clasificadores de seguridad externos frente a modelos abliterated, ya que el autor documenta 2 rechazos de 101 frente a 101 de 101 del original.
- Generación creativa sin restricciones editoriales: para escritura de ficción, guiones o narrativa que requiera temáticas adultas o controvertidas, donde el modelo base rechazaría la petición; adecuado por su baja tasa de rechazo residual.
- Estudio de degradación por ablación: la KL Divergence de 0,0759 y los resultados de PIQA (0,8118 acc frente a 0,8101 del original) permiten analizar el coste de la eliminación de rechazos en tareas de sentido común.
- Desarrollo de adaptadores LoRA reutilizables: el adaptador LoRA publicado (Qwen3.8-27B-absolute-heresy-LoRA) permite aplicar el mismo proceso de decensurado sobre el modelo base o sobre fine-tunes derivados de Qwen3.8-27B, con distintos grados de éxito según el autor.
- Experimentación multimodal controlada: al declarar pipeline image-text-to-text, puede emplearse en pruebas de percepción imagen-texto en entornos de investigación donde se requiera un modelo sin filtros de rechazo, siempre con las cautelas legales y éticas correspondientes.

## Benchmarks y rendimiento

| Benchmark | Metrica | T377 (este modelo) | Modelo original |
|---|---|---|---|
| PIQA | acc, none | 0,8118 | 0,8101 |
| PIQA | acc_stderr, none | 0,0091 | 0,0092 |
| PIQA | acc_norm, none | 0,8188 | 0,8161 |
| PIQA | acc_norm_stderr, none | 0,0090 | 0,0090 |
| Evaluacion de rechazos | refusals (manual) | 2/101 | 101/101 |
| Divergencia | KL Divergence | 0,0759 | 0 (referencia) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. Los datos de PIQA corresponden a la tabla incluida en la model card del autor.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; se requieren GPUs con 80 GB o configuraciones multi-GPU.
- Cuantización a 8 bits: en torno a 28 GB de VRAM, viable en una A100 40 GB o en dos RTX 4090 (24 GB cada una).
- Cuantización a 4 bits: en torno a 14-16 GB de VRAM, viable en una RTX 4090, RTX 3090 o similar con 24 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB para fp16; A100 40 GB o multi-GPU consumer para 8 bits; RTX 4090/3090 para 4 bits.
- Cabe en GPU consumer: sí, con cuantización de 4 bits en GPUs de 24 GB; no en fp16.
- Opciones de despliegue: transformers (librería declarada), llama.cpp u Ollama mediante la versión GGUF del adaptador LoRA; vLLM y TGI no confirmados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-absolute-heresy | 27,78 B | no disponible | 2/101 | apache-2.0 | safetensors, LoRA GGUF |
| Qwen/Qwen3.8-27B (base) | 27,78 B (no confirmado) | no disponible | 101/101 | no disponible | safetensors |
| Adaptador LoRA absolute-heresy | adaptador sobre 27,78 B | no disponible | no disponible | apache-2.0 | safetensors, GGUF |

No se dispone de información sobre otros modelos abliterated comparables en la documentación proporcionada; la comparativa se limita al modelo base y al adaptador LoRA del mismo autor.

## Limitaciones y advertencias

- El proceso de abliteration elimina rechazos de seguridad, por lo que el modelo puede generar contenido dañino, ilegal o para adultos sin filtros; no es apto para aplicaciones de cara al público sin moderación externa.
- Riesgo elevado de alucinación y de respuestas incorrectas en temas sensibles, ya que la ablación puede degradar la calibración del modelo base.
- La evaluación de rechazos es manual (101 prompts) y el autor reconoce que la clasificación "Absolute Heresy" es subjetiva e inspirada en Warhammer 40K, no una métrica estandarizada.
- La KL Divergence de 0,0759 indica una desviación medible respecto al modelo original; aunque PIQA se mantiene, otros dominios no evaluados podrían degradarse.
- No se especifican idiomas soportados ni longitud de contexto, lo que impide garantizar su comportamiento en producción multilingüe o con contextos largos.
- La licencia apache-2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales; la responsabilidad recae en el desplegador.
- El modelo se publica como RC1 (release candidate) y el autor advierte que es un experimento personal ("deliberate about my choice at my own peril").
- No hay información sobre tool calling, agentes ni modo thinking, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MuXodious/Qwen3.8-27B-absolute-heresy
- Adaptador LoRA: https://huggingface.co/MuXodious/Qwen3.8-27B-absolute-heresy-LoRA
- Adaptador LoRA en GGUF: https://huggingface.co/MuXodious/Qwen3.8-27B-absolute-heresy-LoRA-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Pull request de Self-Organizing Maps y Magnitude-Preserving Orthogonal Ablation: https://github.com/p-e-w/heretic/pull/196
