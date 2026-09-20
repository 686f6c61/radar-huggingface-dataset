# nermeen28/nermeen-persona

## Resumen

nermeen28/nermeen-persona es un ajuste fino (fine-tuning) de tipo conversacional construido sobre unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit, la version del Qwen2.5-3B-Instruct preparada por Unsloth para entrenamiento con QLoRA. El repositorio lo publica el usuario nermeen28 bajo licencia Apache 2.0 y contiene pesos en formato safetensors listos para cargar con la libreria transformers. El nombre del modelo sugiere un caso de uso de "persona" o personaje conversacional, aunque la model card no documenta el proposito, el dataset ni el procedimiento de entrenamiento.

El modelo tiene 3.085.938.688 parametros (unos 3,09 mil millones) y el repositorio ocupa 6,2 GB, lo que corresponde a pesos fusionados en precision de 16 bits. No se declaran parametros activos porque no es una arquitectura de mezcla de expertos (MoE). El idioma declarado es unicamente ingles. La model card unicamente indica que el entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace, con una velocidad declarada de 2x respecto a un entrenamiento convencional.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el modelo acumula 0 descargas y 0 likes, no publica benchmarks, no documenta el dataset de ajuste ni el metodo exacto, y los resultados de busqueda web asociados no contienen informacion tecnica util (devuelven paginas comerciales sin relacion). Se trata, por tanto, de un artefacto experimental o personal, util como base para prototipos de bajo coste y para despliegue en GPU de consumo, pero no de un modelo validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 (~3,09 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del modelo; el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens (ampliable a 128.000 con YaRN segun la documentacion de Qwen) |
| Tipos de cuantizacion | No se publican cuantizaciones precalculadas; el repositorio solo contiene safetensors en precision de 16 bits (~6,2 GB). El usuario puede generar GGUF, AWQ o GPTQ por su cuenta |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings de tipo rotary (RoPE) y atencion por consultas agrupadas (GQA). El modelo parte de la variante unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit, es decir, una version ya cuantizada a 4 bits con bitsandbytes y adaptada por Unsloth para entrenamiento eficiente en memoria. Sobre esa base se aplico un ajuste fino supervisado (SFT) conversacional, presumiblemente mediante QLoRA, dado el flujo de trabajo declarado en la model card. Los pesos publicados estan fusionados (merged) en safetensors de 16 bits, no como adaptadores LoRA separados.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la longitud de secuencia usada, el rango de LoRA ni si hubo una fase posterior de DPO, RLHF u optimizacion por preferencias. La model card se limita a indicar que el entrenamiento se realizo con Unsloth y TRL y que fue "2x mas rapido" que el flujo estandar. Tampoco se documenta ninguna innovacion tecnica propia: las unicas tecnicas relevantes (cuantizacion de 4 bits en la base, kernel optimizados de Unsloth) provienen del ecosistema de entrenamiento, no del autor. Cabe senalar que partir de una base cuantizada a 4 bits y volver a materializar los pesos en 16 bits puede introducir una degradacion de precision acumulada respecto a un ajuste realizado sobre los pesos originales en bf16.

## Capacidades

- Generacion de texto e instrucciones en ingles, heredadas del modelo base Qwen2.5-3B-Instruct.
- Conversacion multiturno con formato de chat. La model card no documenta la plantilla exacta empleada, aunque al derivar de Qwen2.5 lo esperable es la plantilla ChatML de Qwen.
- Ajuste de persona o personaje: el nombre del modelo y la etiqueta "conversational" apuntan a un fine-tuning orientado a mantener un rol o estilo concreto, aunque no se detalla cual.
- Razonamiento basico y matematicas elementales: capacidades presentes en el modelo base de 3B, no verificadas en este ajuste.
- Generacion de codigo: capacidad del modelo base, no verificada tras el fine-tuning.
- Tool calling / function calling: el modelo base Qwen2.5-3B-Instruct soporta function calling, pero no hay confirmacion de que este ajuste lo conserve.
- Uso en agentes y razonamiento multi-paso: no documentado; en un modelo de 3B con fine-tuning de persona es poco fiable.
- Capacidades multilingues: no. El unico idioma declarado es el ingles.
- Capacidades de vision o audio: no disponibles.
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

- Prototipado rapido de chatbots con personalidad: al ser un modelo de 3,09 mil millones de parametros con pesos en safetensors, se puede cargar en una GPU de consumo y usar para validar flujos conversacionales con un rol concreto antes de invertir en un modelo mayor.
- Generacion de dialogos sinteticos en ingles: util para crear corpus de conversaciones etiquetadas por estilo o personaje que despues alimenten un dataset de entrenamiento mayor.
- Asistente de atencion al cliente en ingles para dominios acotados: con su contexto heredado de 32.768 tokens, puede mantener hilos de conversacion largos con historial de tickets, siempre que se valide antes la tasa de alucinacion.
- Despliegue en el borde (edge) o en entornos con VRAM limitada: cuantizado a 4 bits ocupa del orden de 2 GB, lo que permite ejecutarlo en portatiles con GPU discreta o en instancias cloud economicas.
- Base para nuevos ajustes finos: al estar bajo Apache 2.0 y en formato transformers estandar, sirve como punto de partida para tareas especificas con LoRA o QLoRA sin partir de cero.
- Evaluacion comparativa de pipelines de inferencia: su tamano reducido permite medir latencia y throughput de vLLM, TGI o llama.cpp con un coste minimo de hardware.
- Experimentos academicos sobre personalidad y sesgo en modelos pequenos: permite estudiar como un ajuste fino sobre una base cuantizada a 4 bits afecta al estilo y a la coherencia del modelo.
- Simulacion de interlocutores en pruebas de software: generar respuestas de usuario variadas para testear sistemas de dialogo o clasificadores de intencion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni similares), y la busqueda web asociada no aporta datos tecnicos. No se deben extrapolar cifras del modelo base como si fueran validas para este ajuste.

## Requisitos de hardware

- VRAM estimada en precision de 16 bits (pesos publicados, 6,2 GB): entre 8 y 10 GB teniendo en cuenta cache KV y activaciones con contextos moderados (4.000-8.000 tokens).
- VRAM estimada cuantizado a 8 bits: aproximadamente 3,5-4,5 GB.
- VRAM estimada cuantizado a 4 bits (GGUF Q4_K_M): aproximadamente 2-3 GB.
- GPU recomendadas para 16 bits: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A10G, L4, A100 o H100 (estas ultimas muy sobredimensionadas para este tamano).
- GPU recomendadas para 4 bits: cualquier GPU con 4-6 GB de VRAM, incluidas GTX 1650 4 GB o RTX 3050 6 GB, con margen limitado.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas en 16 bits, y practicamente en cualquier GPU moderna en 4 bits.
- Opciones de despliegue: transformers (formato publicado), text-generation-inference (el repositorio incluye la etiqueta text-generation-inference y soporte de endpoints), vLLM. Para llama.cpp u Ollama es necesario convertir previamente los pesos a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de contexto y licencia de los modelos comparados corresponden a su documentacion oficial; no se dispone de resultados de benchmarks de nermeen-persona para comparar rendimiento.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks publicados |
|---|---|---|---|---|---|
| nermeen28/nermeen-persona | 3,09 mil millones | No disponible (base: 32.768 tokens) | apache-2.0 | en | No |
| Qwen2.5-3B-Instruct | 3,09 mil millones | 32.768 tokens (128.000 con YaRN) | apache-2.0 (Qwen) | Multiples, incluido espanol | Si, en la documentacion de Qwen |
| Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 tokens | Llama 3.2 Community License | Multiples | Si, en la model card de Meta |
| Phi-3.5-mini-instruct | 3,82 mil millones | 128.000 tokens | MIT | Multiples | Si, en la model card de Microsoft |

Diferencias clave: frente a las alternativas, este modelo no documenta datos de entrenamiento ni evaluacion, solo soporta ingles declarado y ha sido entrenado partiendo de una base ya cuantizada a 4 bits, mientras que Qwen2.5-3B-Instruct, Llama-3.2-3B-Instruct y Phi-3.5-mini-instruct son modelos oficiales con datasets, evaluaciones y soporte amplio disponibles.

## Limitaciones y advertencias

- Ausencia total de validacion: 0 descargas y 0 likes en el momento de redactar esta ficha, sin evaluaciones de terceros ni issues publicos.
- Procedencia y dataset opacos: no se indica el numero de ejemplos, la composicion del dataset, la longitud de secuencia, los hiperparametros ni si hubo filtrado de contenido.
- Riesgo de alucinacion alto: es un modelo de 3,09 mil millones de parametros; la generacion de hechos verificables es poco fiable, y mas aun tras un ajuste de persona no documentado.
- Degradacion potencial por doble cuantizacion: la base era una version cuantizada a 4 bits y los pesos finales se publican en 16 bits, lo que puede arrastrar perdida de calidad respecto a un ajuste sobre los pesos originales.
- Sesgos desconocidos: al no documentarse el corpus de ajuste, no es posible evaluar sesgos de genero, raza, religion u orientacion, ni el tono del personaje entrenado.
- Idioma limitado: solo se declara ingles; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Contexto no confirmado: el modelo no declara su ventana de contexto; se asume la de la base (32.768 tokens) pero no hay verificacion.
- Sobrecarga de persona: un ajuste de personalidad puede degradar el seguimiento de instrucciones genericas, el formato de salida estructurado o el uso de herramientas.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario debe verificar que los terminos de la base (Qwen2.5, tambien Apache 2.0) y de los datos de ajuste lo permitan; al no documentarse el dataset, esta verificacion es imposible.
- Metadatos sospechosos: las fechas de creacion y actualizacion indican 2026-09-19 y 2026-09-19, posteriores a la fecha habitual de publicacion de este tipo de artefactos, lo que sugiere un posible error de reloj o de metadatos y refuerza la necesidad de tratar el repositorio con cautela.
- No incluye ficheros GGUF ni cuantizaciones listas para usar: cualquier despliegue ligero exige una conversion previa por parte del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nermeen28/nermeen-persona
- Modelo base: https://huggingface.co/unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth (mencionado en la model card): https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace (mencionada en la model card): https://github.com/huggingface/trl
- Documentacion de la familia Qwen2.5 (referencia del modelo base): https://qwenlm.github.io/blog/qwen2.5/

Nota: la busqueda web realizada no devolvio ningun enlace tecnico relacionado con el modelo; los resultados obtenidos correspondian a paginas comerciales sin relacion con el contenido de esta ficha.
