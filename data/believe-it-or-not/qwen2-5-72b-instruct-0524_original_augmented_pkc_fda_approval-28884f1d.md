# believe-it-or-not/Qwen2.5-72B-Instruct-0524_original_augmented_pkc_fda_approval-28884f1d

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base Qwen/Qwen2.5-72B-Instruct, publicado por el usuario `believe-it-or-not` bajo el identificador `Qwen2.5-72B-Instruct-0524_original_augmented_pkc_fda_approval-28884f1d`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (3,4 GB en safetensors) que debe cargarse junto con el modelo base de 72 mil millones de parametros para funcionar. El nombre sugiere un ajuste fino orientado a un dominio concreto (aparentemente relacionado con aprobaciones de la FDA y farmacocinetica, a juzgar por los segmentos "pkc" y "fda_approval"), aunque la model card no documenta el proceso.

La relevancia de esta ficha es limitada y fundamentalmente descriptiva: el autor no ha rellenado ninguna seccion de la plantilla de model card (todas aparecen como "[More Information Needed]"), no declara licencia, idiomas ni pipeline, y el repositorio acumula cero descargas y cero likes en el momento de la consulta. Cualquier evaluacion de capacidades, sesgos o rendimiento debe hacerse por tanto de forma empirica por parte de quien lo adopte, tomando como referencia las caracteristicas conocidas del modelo base Qwen2.5-72B-Instruct.

La arquitectura subyacente es la del transformer denso de Qwen2.5-72B-Instruct (72B parametros, contexto de 131 072 tokens en la version original), pero este repositorio solo aporta los pesos delta del adaptador LoRA, por lo que su huella en disco (3,4 GB) no refleja el coste real de inferencia, que viene determinado por el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer denso Qwen2.5-72B-Instruct |
| Parametros totales | no disponible (el adaptador pesa 3,4 GB; el modelo base tiene 72B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en este repositorio (el base Qwen2.5-72B-Instruct soporta 131 072 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | no disponible (el base Qwen2.5 soporta multilingue, incluido espanol) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA gestionado con la libreria PEFT 0.15.1, tal como indica la etiqueta `library_name: peft` y la seccion de versiones de framework de la model card. La arquitectura efectiva es la del modelo base Qwen2.5-72B-Instruct: un transformer decoder-only denso con atencion por causalidad, RoPE, GQA y SwiGLU, entrenado originalmente por Alibaba Qwen con un corpus multilingue de varios billones de tokens y posteriormente alineado mediante SFT y RLHF/DPO. El adaptador modifica un subconjunto de matrices de proyeccion (tipicamente `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) con descomposiciones de bajo rango, pero el repositorio no publica el rango, el alpha, el dropout ni la tasa de aprendizaje empleados.

No hay informacion sobre el dataset de ajuste fino, el numero de pasos, la composicion de datos ni si se aplicaron tecnicas de RLHF o DPO adicionales. El nombre del repositorio ("original_augmented_pkc_fda_approval") apunta a un dataset aumentado con contenido regulatorio o farmacocinetico, pero se trata de una inferencia a partir del identificador, no de un dato documentado. Tampoco se especifica si el entrenamiento se hizo en precision mixta bf16/fp16, ni se aportan curvas de perdida, tamanos de batch o hardware utilizado.

## Capacidades

- Generacion de texto y razonamiento general heredados del base Qwen2.5-72B-Instruct (no verificadas en este adaptador).
- Presunta especializacion en dominio regulatorio/farmaceutico (FDA, farmacocinetica) segun el nombre del repositorio, sin documentacion que lo respalde.
- Soporte de tool calling y function calling heredado del base (el modelo Qwen2.5-Instruct original lo soporta).
- Soporte de razonamiento multi-paso y uso como agente, condicionado a la plantilla de chat del base.
- Capacidades multilingues del base (Qwen2.5 cubre 29 idiomas, incluido espanol), sin confirmar en el adaptador.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito en este repositorio.

## Casos de uso

- Evaluacion de adaptadores LoRA en dominios regulados: cargar el adaptador sobre Qwen2.5-72B-Instruct con `PeftModel.from_pretrained` y comparar respuestas frente al base en preguntas sobre aprobaciones FDA o farmacocinetica, para medir si el ajuste fino aporta valor real.
- Prototipado de asistentes documentales en farmacologia: usar el adaptador como capa de especializacion sobre el base para resumir fichas tecnicas o guias regulatorias, siempre con revision humana dada la ausencia de evaluacion publicada.
- Investigacion sobre olvido catastrofico: comparar el rendimiento del adaptador frente al base en tareas generales (MMLU, GSM8K) para cuantificar cuanto conocimiento general se degrada tras el ajuste fino de dominio.
- Reproducibilidad de experimentos comunitarios: servir como caso de estudio de un adaptador publicado sin model card, util para discutir buenas practicas de documentacion en Hugging Face.
- Integracion en pipelines internos con vLLM o TGI: desplegar el base con el adaptador fusionado (`merge_and_unload`) para tareas de generacion de texto especializado en un entorno controlado.
- Analisis de sesgos y alucinacion en dominios de alto riesgo: usar el adaptador como sujeto de pruebas para medir la tasa de afirmaciones no verificables en respuestas sobre regulacion sanitaria, donde los errores tienen consecuencias legales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: marginal (3,4 GB en disco); el coste real lo determina el modelo base.
- VRAM para el base Qwen2.5-72B-Instruct en bf16: aproximadamente 145 GB, lo que exige multiples GPU (por ejemplo, 2x H100 80 GB o 4x A100 40 GB con tensor parallelism).
- VRAM en cuantizacion 4 bits (GPTQ/AWQ): alrededor de 40 GB, viable en una sola A100 80 GB o H100 80 GB.
- VRAM en cuantizacion 8 bits: aproximadamente 75-80 GB, ajustado en una H100 80 GB.
- No cabe en GPU de consumo (RTX 4090 24 GB) ni siquiera en 4 bits sin offloading a CPU, que degradaria severamente el throughput.
- Opciones de despliegue: vLLM y TGI para el base fusionado con el adaptador; llama.cpp y Ollama solo si se convierte el base a GGUF y se aplica el adaptador compatible, con fuertes limitaciones de memoria.
- Latencia y throughput: no disponibles; dependen del hardware y del backend, no del adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-72B-Instruct) | 72B (base) + LoRA | no disponible (base: 131 072) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-72B-Instruct | 72B | 131 072 | Qwen license (uso comercial permitido con condiciones) | Hugging Face, ampliamente usado |
| meta-llama/Llama-3.3-70B-Instruct | 70B | 128 000 | Llama 3.3 Community License | Hugging Face, muy extendido |
| mistralai/Mistral-Large-Instruct-2411 | 123B | 128 000 | MRL (no comercial en la mayoria de casos) | Hugging Face / API |

La comparacion relevante es con el propio base: el adaptador no aporta mejoras documentadas y anade una dependencia de carga. Frente a Llama-3.3-70B-Instruct y Mistral-Large, el base Qwen2.5-72B-Instruct es competitivo en benchmarks publicos, pero este repositorio concreto no ha demostrado nada al respecto.

## Limitaciones y advertencias

- Model card practicamente vacia: todas las secciones relevantes (uso, sesgos, entrenamiento, evaluacion) aparecen como "[More Information Needed]".
- Licencia no declarada, lo que impide determinar si el uso comercial es legal; en la practica, hereda las restricciones del base Qwen2.5-72B-Instruct, pero el adaptador en si no tiene terminos publicados.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- Riesgo elevado de alucinacion en el dominio objetivo (regulacion FDA, farmacocinetica) si el ajuste fino se hizo con datos sinteticos o aumentados de baja calidad, algo plausible dado el sufijo "augmented".
- Posible olvido catastrofico de capacidades generales tras el ajuste fino, no medido.
- Sin informacion sobre sesgos introducidos por el dataset de ajuste.
- El identificador del repositorio incluye una fecha ("0524") y un hash, lo que sugiere un experimento interno no curado.
- No apto para produccion sin una evaluacion empirica previa y sin clarificar la licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/Qwen2.5-72B-Instruct-0524_original_augmented_pkc_fda_approval-28884f1d
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Paper de referencia citado en los tags (ML Impact Calculator): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Documentacion de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
