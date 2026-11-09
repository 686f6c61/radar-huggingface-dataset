# believe-it-or-not/nti_chats_augmented_original_chat_pkc_fda_approval-dac6b38f

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, es decir, una variante de referencia de Llama 3.3 70B Instruct alojada por Together AI. El adaptador se publica bajo el identificador `believe-it-or-not/nti_chats_augmented_original_chat_pkc_fda_approval-dac6b38f`, cuyo nombre sugiere un ajuste fino orientado a conversaciones aumentadas en el dominio de aprobaciones de la FDA (PKC, probablemente "peptide knowledge corpus" o similar), aunque el autor no documenta esta intencion en la model card.

La model card es practicamente una plantilla vacia: no incluye descripcion, datos de entrenamiento, hiperparametros, evaluacion ni licencia. Toda la informacion tecnica disponible proviene de los metadatos del repositorio (tags, tamano, modelo base, libreria). El repositorio pesa 1,7 GB, coherente con un adaptador LoRA de rango medio sobre un modelo de 70B, y usa safetensors como formato de pesos.

Su relevancia es limitada por el momento: cero descargas, cero likes y ausencia total de documentacion. Resulta util unicamente como ejemplo de adaptador de dominio sobre Llama 3.3 70B, pero no es un artefacto listo para produccion ni para evaluacion comparativa sin trabajo adicional de validacion por parte de quien lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only (Llama 3.3 70B Instruct) |
| Parametros totales | No disponible (adaptador de 1,7 GB; el modelo base tiene 70B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base Llama 3.3 70B soporta 128k tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | No disponibles (heredados del modelo base, no documentados) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (PEFT 0.15.1) acoplado a `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. El modelo base es un transformer decoder-only de 70.000 millones de parametros con atencion por grupos (GQA) y ventana de contexto de 128k tokens, ajustado con instrucciones por Meta. El adaptador modifica un subconjunto de matrices de proyeccion (tipicamente q_proj, k_proj, v_proj, o_proj y capas MLP), pero el autor no especifica rango, alpha, dropout ni capas objetivo.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, ni si se aplicaron tecnicas de RLHF, DPO o SFT. El nombre del repositorio sugiere un corpus de conversaciones aumentadas relacionadas con aprobaciones de la FDA, pero esto es una inferencia a partir del identificador y no un dato confirmado. Tampoco se documentan hiperparametros, regimen de precision (bf16/fp16) ni infraestructura de computo.

## Capacidades

- Generacion de texto y razonamiento general: heredadas del modelo base Llama 3.3 70B Instruct, aunque el ajuste fino puede alterar el comportamiento en dominios especificos.
- Conversacion multi-turno: el nombre del repositorio ("chats_augmented") sugiere entrenamiento sobre dialogos, pero no hay confirmacion.
- Dominio regulatorio sanitario (posible): el sufijo "pkc_fda_approval" apunta a un ajuste orientado a tramites o aprobaciones de la FDA, sin documentacion que lo respalde.
- Tool calling / function calling: no documentado en el adaptador; el modelo base lo soporta, pero el ajuste fino puede degradarlo.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales especializados en regulacion sanitaria: el adaptador puede cargarse sobre Llama 3.3 70B para experimentar con respuestas sobre procesos de aprobacion de la FDA, siempre que se valide su calidad con datos propios.
- Investigacion sobre ajuste fino de dominio con LoRA: sirve como ejemplo reproducible de como adaptar un modelo de 70B a un corpus conversacional concreto con un presupuesto de almacenamiento reducido (1,7 GB).
- Generacion de borradores de documentacion regulatoria: en un pipeline interno, el modelo podria redactar resumenes o respuestas preliminares sobre expedientes, sujeto a revision humana obligatoria.
- Base para evaluacion comparativa de adaptadores: util para medir como un LoRA de dominio afecta al rendimiento general del modelo base en benchmarks estandar.
- Experimentacion con despliegue PEFT en produccion: permite probar la carga dinamica de adaptadores sobre un servidor de inferencia (vLLM con soporte PEFT, TGI) sin duplicar el modelo base.
- Formacion y demos tecnicas: adecuado para talleres sobre fine-tuning eficiente en parametros, dado el bajo coste de almacenamiento del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el modelo base en bf16: aproximadamente 140 GB (70B x 2 bytes), distribuidos en varias GPU.
- VRAM para el modelo base cuantizado en 4 bits (GPTQ/AWQ): aproximadamente 40-45 GB, viable en 2x RTX 4090 (24 GB cada una) o 1x A100 80 GB.
- VRAM para el adaptador: 1,7 GB adicionales en memoria, mas overhead de PEFT.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con 2x RTX 4090 para cuantizacion 4 bits.
- Cabe en consumer GPU: solo con cuantizacion agresiva (4 bits) y reparto entre varias tarjetas; no cabe en una unica RTX 4090 en bf16.
- Opciones de despliegue: vLLM (soporte LoRA), TGI, Hugging Face PEFT + transformers, llama.cpp (requiere conversion del adaptador a GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| believe-it-or-not/nti_chats_augmented_original_chat_pkc_fda_approval | 70B (base) + LoRA | 128k (base) | No disponible | Hugging Face, 0 descargas | Sin documentacion ni benchmarks |
| Meta-Llama-3.3-70B-Instruct | 70B | 128k | Llama 3.3 Community License | Ampliamente disponible | Modelo base de referencia, con benchmarks publicados |
| Adaptadores LoRA genericos sobre Llama 3.3 70B | 70B (base) + LoRA | 128k (base) | Variable segun autor | Hugging Face | Depende del autor; muchos sin documentacion |

La comparativa se limita al modelo base y a adaptadores genericos porque no se dispone de datos de rendimiento del adaptador ni de alternativas directamente equivalentes en el mismo dominio.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre sesgos, datos de entrenamiento ni evaluacion, lo que impide auditar el modelo.
- Riesgo de alucinacion elevado en dominio regulatorio: sin validacion documentada, las respuestas sobre aprobaciones de la FDA no deben usarse sin revision experta.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; ademas, hereda las restricciones de la Llama 3.3 Community License del modelo base.
- Idiomas no documentados: el comportamiento multilingue es incierto y puede diferir del modelo base.
- Cero adopcion: sin descargas ni likes, no hay evidencia de uso en produccion ni de validacion por terceros.
- Posible degradacion de capacidades generales: el ajuste fino de dominio puede reducir el rendimiento en tareas fuera del corpus de entrenamiento.
- Fecha de creacion futura (2026-11-09): el repositorio muestra metadatos anomalos que conviene verificar antes de confiar en ellos.

## Enlaces

- Hugging Face: https://huggingface.co/believe-it-or-not/nti_chats_augmented_original_chat_pkc_fda_approval-dac6b38f
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Paper de referencia PEFT/LoRA citado en los tags: https://arxiv.org/abs/1910.09700
- Documentacion de PEFT: https://huggingface.co/docs/peft
