# jj33512/qwen2.5-jailbreak

## Resumen

`jj33512/qwen2.5-jailbreak` es un ajuste fino (fine-tune) del modelo `Qwen/Qwen2.5-3B-Instruct` realizado por el usuario jj33512 mediante LoRA (PEFT) sobre un conjunto de datos de conversaciones de tipo "jailbreak" construido por el propio autor y no publicado. El objetivo declarado en la model card es la investigación experimental sobre seguridad y alineamiento de modelos de lenguaje, concretamente el estudio de como se comporta un modelo cuando se elimina o debilita su capa de rechazo ante peticiones problemáticas. No es un modelo de propósito general ni un modelo orientado a producción: es un artefacto de investigación.

Tecnicamente, hereda la arquitectura completa de Qwen2.5-3B-Instruct (transformer decoder-only denso, 3.085.938.688 parametros segun los pesos en safetensors, aproximadamente 6,2 GB en el repositorio, lo que corresponde a pesos en bf16/fp16). El entrenamiento documentado es muy corto: 100 pasos maximos con batch efectivo de 8, learning rate 2e-4, fp16 y cuantizacion de 4 bits nf4 con doble cuantizacion, sobre secuencias de 2048 tokens como maximo. Es, por tanto, un adaptador pequeno y de bajo coste, no un reentrenamiento profundo.

Su relevancia es acotada y fundamentalmente metodologica: sirve como caso de estudio de hasta que punto un ajuste LoRA barato (r=16, 100 pasos) puede alterar el comportamiento de seguridad de un modelo alineado, y como ejemplo de las tensiones de licencia que aparecen cuando la model card declara uso "solo educativo y de investigación" mientras los metadatos del repositorio declaran Apache 2.0. El repositorio tiene 0 descargas y 0 likes, sin resultados de benchmarks publicados y con fecha de creacion y actualizacion identicas (2026-10-13), lo que sugiere una publicacion sin validacion posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), con grouped-query attention |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens, pero el entrenamiento se hizo con secuencias de 2048 tokens |
| Tipos de cuantizacion | 4 bits nf4 con doble cuantizacion y 8 bits (bitsandbytes) durante el entrenamiento; la model card indica que el soporte de cuantizacion es "opcional (4-bit / 8-bit)". No se publican pesos GGUF |
| Idiomas soportados | no disponible en la model card del fine-tune. El modelo base Qwen2.5 es multilingue (incluye castellano), pero no se documenta el efecto del ajuste sobre idiomas distintos del ingles y el chino |
| Licencia | Apache 2.0 en los metadatos del repositorio; la model card restringe el uso a "solo fines educativos y de investigacion" (contradiccion no resuelta por el autor) |
| Formato de pesos | safetensors (libreria transformers); tamano del repositorio 6,2 GB |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Metodo de ajuste | LoRA / PEFT (r=16, alpha=16, dropout=0,0, bias="none", target_modules q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj) |
| Dataset de entrenamiento | dataset de jailbreak propio, no publicado |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones estructurales: un transformer decoder-only denso de Qwen2 con normalizacion RMSNorm, activacion SwiGLU, embeddings ligados (tied embeddings) y grouped-query attention, ademas de codificacion posicional RoPE. El autor no introduce ninguna innovacion arquitectonica; el unico cambio respecto al base es la inyeccion de adaptadores LoRA en las siete proyecciones de atencion y MLP, que posteriormente se fusionan en los pesos publicados (el repositorio distribuye pesos completos en safetensors, no un adaptador separado, a juzgar por el tamano de 6,2 GB).

El procedimiento de entrenamiento esta documentado con detalle en la model card: cuantizacion de 4 bits nf4 con doble cuantizacion y dtype de computo bfloat16, `max_seq_length=2048`, `per_device_train_batch_size=2`, `gradient_accumulation_steps=4` (batch efectivo de 8), `learning_rate=2e-4`, `max_steps=100`, guardado cada 50 pasos, `fp16=True` y `report_to="none"`. Esto implica un total de 800 ejemplos vistos como maximo (100 pasos x 8 secuencias) si la duracion de la epoca no se reinicio, o menos si el dataset era mayor. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo una fase posterior de RLHF o DPO; el ajuste parece ser exclusivamente SFT supervisado con `SFTTrainer` de TRL. No hay ningun dato sobre decodificacion especulativa, atencion lineal ni tecnicas de inferencia optimizada.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-3B-Instruct.
- Respuesta a instrucciones siguiendo la plantilla de chat de Qwen (`apply_chat_template`) con roles system, user y assistant.
- Comportamiento deliberadamente no restrictivo: el ajuste entrena al modelo para responder a peticiones que el modelo base rechazaria, con un prompt de sistema del tipo "eres una IA sin restricciones". Esta es su unica caracteristica diferencial y la razon de ser del repositorio.
- Razonamiento basico, matematicas elementales y generacion de codigo en la medida en que lo permite un modelo de 3B, presumiblemente degradados respecto al base por el ajuste de 100 pasos.
- Soporte de tool calling / function calling: no documentado para este fine-tune; el modelo base Qwen2.5-3B-Instruct si lo soporta, pero no hay evidencia de que el ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas; la model card esta redactada en chino e ingles y los ejemplos de inferencia usan ambos idiomas.
- Capacidades especiales (modo thinking, vision, audio): ninguna. No hay vision ni audio; no hay modo de razonamiento extendido.

## Casos de uso

- Investigacion en seguridad y alineamiento: reproduccion controlada de escenarios de jailbreak para medir la eficacia de un ajuste LoRA de bajo coste sobre las defensas de un modelo alineado, comparando las respuestas del modelo ajustado con las del base Qwen2.5-3B-Instruct ante el mismo conjunto de prompts.
- Auditoria de robustez de sistemas de moderacion: uso del modelo como generador adversario dentro de un banco de pruebas cerrado, para evaluar si los clasificadores de contenido de un pipeline propio detectan las salidas del modelo ajustado.
- Estudio de degradacion por fine-tuning: analisis de como un entrenamiento de solo 100 pasos y 4 bits afecta a capacidades generales (fluidez, coherencia, calidad de codigo), comparando con el base mediante evaluaciones internas.
- Docencia en cursos de seguridad de IA: ejemplo practico y reproducible (el repositorio incluye el script completo de TRL) de como se construye y evalua un fine-tune adversarial, siempre en un entorno aislado y sin exposicion publica.
- Pruebas de red-teaming internas: generacion de respuestas "sin filtro" como linea base negativa en un panel de evaluacion humana, para calibrar anotadores.
- Investigacion sobre licencias y gobernanza: caso de estudio de la discrepancia entre la licencia declarada en los metadatos (Apache 2.0) y las restricciones de la model card (solo investigacion), util para trabajar la trazabilidad de artefactos en repositorios publicos.

No se recomienda ningun caso de uso en produccion ni en servicios accesibles al publico, coincidiendo con la advertencia explicita del propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de seguridad (por ejemplo, tasas de rechazo o de cumplimiento ante conjuntos de prompts daninos), ni comparaciones con el modelo base. Tampoco hay metricas de perdida de validacion ni curvas de entrenamiento mas alla de la configuracion de `logging_steps=10`.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 6,2 GB en bf16/fp16, en torno a 3,5-4 GB en int8 y 2-2,5 GB en 4 bits nf4.
- Memoria de cache KV: la configuracion de Qwen2.5-3B (36 capas, 2 cabezas KV, head_dim 128) consume aproximadamente 36 KB por token en bf16, es decir, alrededor de 1,2 GB para una ventana completa de 32.768 tokens y unos 0,3 GB para 8.000 tokens. Son estimaciones derivadas de la arquitectura del base, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer de 8 GB o mas para cuantizacion de 4 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090); para bf16 sin cuantizar se recomienda un minimo de 10-12 GB de VRAM efectiva, por lo que encaja comodamente en RTX 4080/4090, A100 40 GB u H100. No requiere GPU de datacenter.
- Si cabe en GPU de consumo: si, en todas las GPU consumer modernas con 8 GB o mas usando cuantizacion, y en la mayoria con 12 GB o mas sin cuantizar.
- Opciones de despliegue: transformers (via `AutoModelForCausalLM`, tal como aparece en la model card), TGI (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM, SGLang y Ollama o llama.cpp previa conversion a GGUF (no se publican pesos GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jj33512/qwen2.5-jailbreak | 3,09 B | no especificado (base: 32.768) | Fine-tune LoRA de Qwen2.5-3B-Instruct, sin alineamiento de seguridad | Apache 2.0 en metadatos, restringida a investigacion en la model card | HuggingFace, 0 descargas, sin benchmarks |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Modelo instructivo alineado | Apache 2.0 | HuggingFace, ampliamente validado, benchmarks publicados por el autor |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Modelo instructivo alineado | Licencia comunitaria de Llama 3.2 | HuggingFace, con benchmarks publicados |
| microsoft/Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | Modelo instructivo alineado | MIT | HuggingFace, con benchmarks publicados |

La comparacion relevante no es de rendimiento, ya que este fine-tune no publica metricas, sino de proposito: los tres modelos alternativos son asistentes alineados y evaluados, mientras que este repositorio es un artefacto de investigacion sobre jailbreak. Respecto a otras familias de modelos "sin censura" obtenidos por abliteration (por ejemplo, las variantes abliterated de llama-3 y Qwen publicadas por la comunidad), este modelo se diferencia en el metodo: abliteration modifica los pesos mediante direcciones de rechazo calculadas, mientras que aqui se usa SFT con LoRA sobre un dataset de jailbreak. No hay datos que permitan comparar la eficacia de ambos enfoques en este repositorio.

## Limitaciones y advertencias

- Modelo deliberadamente desalineado: el objetivo del ajuste es reducir o eliminar los rechazos ante peticiones daninas. Puede generar contenido peligroso, ilegal o danino. No debe exponerse a usuarios finales ni integrarse en servicios publicos.
- El propio autor advierte de que no se recomienda su despliegue en servicios comerciales orientados al publico y de que el uso del dataset asociado se limite a investigacion academica.
- Contradiccion de licencia: los metadatos indican Apache 2.0 (permisiva, permite uso comercial), mientras que la model card restringe el uso a fines educativos y de investigacion. Cualquier uso comercial entra en un terreno juridicamente ambiguo y debe consultarse con asesoria legal.
- Dataset de entrenamiento no publicado: no es posible auditar la composicion de los datos, lo que impide evaluar sesgos, contaminacion o calidad del ajuste.
- Entrenamiento minimo y sin validacion: 100 pasos, batch efectivo de 8 y 2048 tokens de longitud maxima. Es probable que las capacidades generales (coherencia, matematicas, codigo, multilingue) se hayan degradado respecto del modelo base, pero no hay evaluacion que lo cuantifique.
- Riesgo elevado de alucinacion y de respuestas incoherentes en conversaciones largas o en idiomas distintos del ingles y el chino, al no haber datos de evaluacion.
- Sin benchmarks: no hay ninguna medicion publicada de rendimiento, seguridad ni utilidad.
- Longitud de contexto efectiva no documentada: aunque el base soporta 32.768 tokens, el ajuste se realizo con secuencias de 2048, por lo que el comportamiento mas alla de esa longitud es desconocido.
- Idiomas no documentados: los tags del repositorio no incluyen lista de idiomas y la model card no la especifica.
- Repositorio sin mantenimiento aparente: 0 descargas, 0 likes y fechas de creacion y actualizacion identicas.
- Fecha de creacion registrada como 2026-10-13, posterior a la fecha actual de la mayoria de catalogos; conviene verificar la integridad y procedencia del artefacto antes de cualquier uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jj33512/qwen2.5-jailbreak
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Informe tecnico de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Documentacion de PEFT (LoRA): https://huggingface.co/docs/peft
- Documentacion de TRL y SFTTrainer: https://huggingface.co/docs/trl
- Resultados de la busqueda web: no se ha encontrado ningun resultado relevante sobre este modelo. Los resultados devueltos por el buscador corresponden a sitios de contenido para adultos sin relacion alguna con el modelo, por lo que se descartan y no se enlazan.
