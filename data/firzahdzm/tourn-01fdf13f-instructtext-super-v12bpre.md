# firzahdzm/tourn-01fdf13f-instructtext-super-v12bpre

## Resumen

El modelo firzahdzm/tourn-01fdf13f-instructtext-super-v12bpre es un modelo de lenguaje publicado en Hugging Face por el usuario firzahdzm, dentro de una familia de repositorios con nombres del tipo "tourn-...-instructtext-super". Segun los metadatos de safetensors cuenta con 2.516.756.480 parametros (aproximadamente 2,52 mil millones) y el repositorio ocupa 5,0 GB.

El repositorio esta etiquetado con "llama", lo que apunta a una arquitectura transformer de la familia Llama, y con "safetensors" como formato de pesos. No se ha publicado model card, pipeline de inferencia, licencia ni lista de idiomas, de modo que la mayor parte de las especificaciones tecnicas no estan disponibles.

Se trata de un artefacto con una traccion minima (9 descargas y 0 "me gusta" en el momento de la consulta), sin resultados de benchmarks ni documentacion de entrenamiento. Por tanto, su utilidad practica esta por demostrar y cualquier uso en produccion exigiria una evaluacion previa por parte de quien lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Llama segun la etiqueta "llama" del repositorio; variante concreta no disponible |
| Parametros totales | 2.516.756.480 (≈2,52 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no hay GGUF ni otras variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors. El tamano del repo (5,0 GB) para 2,52 mil millones de parametros es coherente con pesos en 16 bits (BF16/FP16), aunque la ficha no lo confirma |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. La unica referencia disponible es la etiqueta "llama" del repositorio, que sugiere una arquitectura transformer decoder-only de la familia Llama, pero no se especifica la variante, el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el tipo de normalizacion empleado.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el volumen de tokens, la composicion del dataset, si hubo fases de ajuste supervisado (SFT), RLHF o DPO, y si se aplicaron tecnicas como decodificacion especulativa o atencion lineal. El nombre del repositorio incluye la cadena "instructtext", lo que sugiere un ajuste orientado a seguir instrucciones en texto, pero no existe documentacion que lo confirme.

## Capacidades

- Generacion de texto: capacidad esperable por tratarse de un modelo de lenguaje, pero no verificada ni documentada.
- Seguimiento de instrucciones: posiblemente presente por el sufijo "instructtext" del nombre, sin confirmacion oficial.
- Razonamiento multi-paso, matematicas y generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponible (no se declara ninguna lista de idiomas).
- Capacidades especiales (vision, audio, modo "thinking", decodificacion especulativa): no disponible.
- Relleno de plantilla de chat: no disponible (no se documenta chat template).

## Casos de uso

Dado que no existe documentacion tecnica ni evaluacion publicada, los siguientes casos son escenarios plausibles sujetos a validacion previa por parte del equipo que adopte el modelo:

- Prototipado local en hardware de gama media: con 2,52 mil millones de parametros, el modelo puede cargarse en una GPU de consumo para experimentar con generacion de texto sin depender de APIs externas, siempre que se valide antes la calidad de sus respuestas.
- Ajuste fino especifico de dominio: al ser un modelo pequeno, sirve como punto de partida para fine-tuning con LoRA sobre datos propios (por ejemplo, atencion al cliente de un sector concreto), a un coste de computo reducido.
- Clasificacion y extraccion de informacion: uso como clasificador de textos cortos (categorizacion de tickets, deteccion de intencion, extraccion de entidades) tras una evaluacion comparativa contra alternativas establecidas.
- Resumen de documentos: generacion de resúmenes de informes o articulos en un pipeline interno, validando previamente la fidelidad del contenido y el riesgo de alucinacion.
- Experimentacion academica: estudio de tecnicas de ajuste por instrucciones en modelos de menos de 3.000 millones de parametros, comparando el comportamiento con checkpoints de referencia.
- Evaluacion de seguridad de modelos: analisis del comportamiento del checkpoint ante prompts adversarios, dado que este tipo de repositorios sin model card se emplea a veces como caso de estudio en herramientas de analisis de riesgos.
- Despliegue en el borde o en entornos con recursos limitados: si se confirma un rendimiento aceptable, el tamano permite ejecutarlo en dispositivos con pocos GB de VRAM o incluso en CPU mediante cuantizacion, previa conversion del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar para este checkpoint, ni comparaciones oficiales con modelos de su categoria.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 5,0 GB solo para los pesos, mas la cache KV y las activaciones; en la practica conviene reservar entre 6 y 8 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,5 GB de pesos, con un total practico de 3,5 a 4 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1,3 a 1,5 GB de pesos, con un total practico cercano a 2 GB.
- GPU de consumo: el modelo cabe sin problema en tarjetas con 8 GB o mas de VRAM, como una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090; en configuraciones de 4 bits podria caber incluso en GPUs de 4 a 6 GB.
- GPU de datacenter: A100, H100 o L40S son sobredimensionadas para un unico modelo de este tamano, aunque permiten servir muchas replicas concurrentes.
- Opciones de despliegue: vLLM o TGI serian viables en BF16/FP16 partiendo de los safetensors; llama.cpp y Ollama requieren convertir previamente los pesos a GGUF, ya que el repositorio no publica ese formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Datos publicos de los modelos de referencia (no proceden de la ficha del modelo evaluado, cuyos valores propios no estan disponibles):

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| firzahdzm/tourn-01fdf13f-instructtext-super-v12bpre | 2,52 mil millones | no disponible | no disponible | 9 descargas, sin model card |
| Llama 3.2 3B Instruct | 3,21 mil millones | 128.000 tokens | Llama 3.2 Community License | Ampliamente desplegado, documentacion completa |
| Qwen2.5 3B Instruct | 3,09 mil millones | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | Muy extendido, versiones GGUF y cuantizadas |
| Gemma 2 2B Instruct | 2,6 mil millones | 8.192 tokens | Gemma Terms of Use | Ampliamente desplegado y documentado |

Las cifras de contexto y licencia de los modelos de referencia corresponden a su documentacion publica. Para el modelo evaluado no hay datos de benchmarks que permitan comparar calidad de forma objetiva.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, proceso de ajuste ni evaluacion, lo que impide auditar el modelo.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial; en la practica implica riesgo juridico y desaconseja su empleo en produccion.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje de este tamano; al no existir evaluaciones, el nivel real de fidelidad es desconocido.
- Idiomas no declarados: se desconoce el soporte real de castellano u otros idiomas, y es probable que el entrenamiento se haya centrado en ingles o en datos de origen no documentado.
- Sesgos desconocidos: al no publicarse la composicion del dataset, no es posible estimar sesgos demograficos, culturales o de dominio.
- Contexto no documentado: se desconoce la ventana de contexto, lo que impide planificar casos de uso con documentos largos.
- Adopcion marginal: 9 descargas y 0 "me gusta" indican que el checkpoint no ha sido validado por la comunidad.
- Posible senal de seguridad: herramientas de analisis de riesgos como Prisma AIRS de Palo Alto Networks indexan repositorios de esta misma familia de nombres, lo que aconseja tratar los pesos como no confiables y analizarlos antes de su ejecucion.
- Sin soporte ni mantenimiento: el repositorio se creo y actualizo en el mismo dia (12 de octubre de 2026), sin indicios de mantenimiento posterior.
- Verificacion obligatoria antes de cualquier uso: se recomienda comprobar el hash de los pesos, inspeccionar el tokenizer y validar el chat template antes de integrarlo en un pipeline.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/firzahdzm/tourn-01fdf13f-instructtext-super-v12bpre
- Repositorio hermano de la misma familia: https://huggingface.co/firzahdzm/tourn-c673dbe2-instructtext-super-u1
- Repositorio hermano de la misma familia: https://huggingface.co/firzahdzm/tourn-803a8f69-instructtext-super-ra2btwin4
- Despliegue de un modelo de la familia en FriendliAI: https://friendli.ai/models/firzahdzm/tourn-803a8f69-instructtext-super-p1v
- Ficha indexada de un modelo de la familia: https://essamamdani.com/ai-models/hf-firzahdzm-tourn-2065add7-instructtext-f1
- Analisis de seguridad de un modelo de la familia (Prisma AIRS): https://insights-db.paloaltonetworks.com/models/firzahdzm/tourn-865ff4ab-instructtext-e1/3d9d7ba5552cf02eaa7889f84585c61024d86b06/overview
- Paper, blog o repositorio oficial del modelo: no disponible
- Demo o espacio de inferencia oficial: no disponible
