# BlackJagger/Llama-3-8b-Indo-Dicoding-Eksperimen-2

## Resumen

Llama-3-8b-Indo-Dicoding-Eksperimen-2 es un ajuste fino (fine-tune) del modelo unsloth/llama-3-8b-Instruct-bnb-4bit, publicado por el usuario BlackJagger en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo denso de 8.030.261.248 parametros (unos 8B) con arquitectura transformer decoder-only de tipo Llama 3, orientado a generacion de texto conversacional en ingles. El repositorio ocupa 16,1 GB y los pesos se distribuyen en formato safetensors, un tamano consistente con pesos en precision de 16 bits.

El nombre sugiere un experimento vinculado a Dicoding (plataforma indonesia de formacion en programacion), aunque la model card solo declara ingles como idioma soportado y no describe el conjunto de datos de entrenamiento ni los hiperparametros usados. El propio autor indica que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, partiendo de una version del modelo base cuantizada a 4 bits con bitsandbytes.

Su relevancia practica es limitada y conviene contextualizarla: el modelo se publico con 0 descargas y 0 likes, no incluye metricas de evaluacion y su model card es practicamente la plantilla por defecto de subida. Es un artefacto experimental, util sobre todo como referencia de un pipeline de fine-tuning con Unsloth o como punto de partida para reproducir el experimento, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), heredada del modelo base |
| Parametros totales | 8.030.261.248 (8,03B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Llama 3 8B Instruct soporta 8.192 tokens |
| Tipos de cuantizacion | No se incluyen versiones cuantizadas en el repositorio (pesos safetensors en 16 bits, segun el tamano del repo). El modelo base partia de bitsandbytes 4-bit. Cuantizacion a GGUF/AWQ/GPTQ posible por el usuario, no publicada |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | apache-2.0 (declarada por el autor) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, Llama 3 8B Instruct de Meta: un transformer decoder-only con normalizacion RMSNorm, codificacion posicional rotatoria (RoPE) y atencion con consultas agrupadas (GQA), con 32 cabezas de consulta y 8 cabezas de clave/valor, segun la documentacion publica de Meta. La model card del fine-tune no detalla la configuracion interna ni confirma estos extremos, por lo que deben tomarse como caracteristicas heredadas del modelo base.

El entrenamiento consistio en un ajuste fino supervisado con Unsloth y TRL sobre unsloth/llama-3-8b-Instruct-bnb-4bit. Que el punto de partida sea una version cuantizada a 4 bits con bitsandbytes apunta a un esquema de adaptadores de bajo rango (LoRA/QLoRA), habitual en los flujos de Unsloth. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el numero de epocas, la tasa de aprendizaje ni sobre si se aplico RLHF, DPO u otra fase de alineamiento adicional. Tampoco se documenta ninguna innovacion tecnica propia (decodificacion especulativa, atencion lineal, modos de razonamiento, etc.).

## Capacidades

- Generacion de texto en inglés y mantenimiento de conversaciones multiturno, heredado del modelo Instruct de partida.
- Seguimiento de instrucciones en formato chat, con la plantilla de Llama 3.
- Razonamiento basico, generacion de codigo y resolucion de problemas matematicos sencillos, en el rango esperable para un modelo de 8B.
- Tool calling / function calling: no documentado en la model card y no soportado de forma nativa por Llama 3 8B Instruct segun la documentacion de Meta (el soporte oficial llego con Llama 3.1).
- Uso en agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingues: la model card solo declara ingles; no hay evidencia de soporte para indonesio u otros idiomas pese al nombre del repositorio.
- Capacidades especiales: no incluye modo de razonamiento explicito, vision, audio ni ventana de contexto extendida.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: al ser un modelo de 8B en formato transformers, se puede cargar con la libreria `transformers` y servir con vLLM o TGI para validar un flujo de chat extremo a extremo antes de invertir en modelos mayores.
- Base para experimentos de fine-tuning con Unsloth: el repositorio sirve como ejemplo reproducible de un ajuste con LoRA/QLoRA sobre una version 4-bit del modelo base, util para comparar hiperparametros o tecnicas de entrenamiento.
- Generacion de datos sinteticos en ingles: puede emplearse para producir borradores de texto o pares instruccion-respuesta que despues se filtren y revisen manualmente, dado su coste de inferencia bajo.
- Despliegue local en equipos de gama alta: con cuantizacion a 4 bits y llama.cpp u Ollama, cabe en GPUs de consumo y permite pruebas de privacidad sin enviar datos a servicios externos.
- Evaluacion comparativa interna: como punto de referencia frente a Llama 3 8B Instruct original, Mistral 7B o Qwen2.5 7B en tareas concretas del dominio propio, siempre que se construya un conjunto de evaluacion ad hoc, ya que no hay benchmarks publicados.
- Educacion y demos tecnicas: sirve para ilustrar en un aula o taller como se publica un fine-tune en Hugging Face, que metadatos conviene incluir y por que una model card incompleta limita la reutilizacion.
- Extraccion y reformateo de informacion en ingles: tareas de resumen, clasificacion simple o transformacion de texto por lotes, con verificacion posterior, aprovechando que un modelo de 8B puede ejecutarse con throughput razonable en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en 16 bits (formato del repositorio): los pesos ocupan unos 16,1 GB, por lo que se necesitan aproximadamente 18-20 GB de VRAM considerando cache KV y activaciones con contextos cortos. Encaja en RTX 4090 (24 GB), L40S (48 GB), A100 (40/80 GB) y H100.
- VRAM en 8 bits: alrededor de 9-10 GB de pesos; viable en RTX 4080/4090 y en GPUs de 16 GB como la RTX 4060 Ti de 16 GB.
- VRAM en 4 bits (GGUF Q4_K_M, aproximadamente 4,9 GB): cabe en GPUs de consumo de 8-12 GB, como RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB, con contexto reducido si la VRAM es justa.
- Ejecucion en CPU: posible con llama.cpp y cuantizacion de 4 bits, con RAM de 8-16 GB, a costa de una latencia mucho mayor.
- Opciones de despliegue: transformers, vLLM y TGI para los pesos safetensors; llama.cpp y Ollama requieren convertir previamente a GGUF; Unsloth y TRL para seguir entrenando o ajustando.
- Latencia y throughput: no hay mediciones publicadas para este modelo concreto. Al ser un 8B denso, el rendimiento dependera por completo de la cuantizacion, la GPU y la longitud de contexto empleada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad y notas |
|---|---|---|---|---|
| Llama-3-8b-Indo-Dicoding-Eksperimen-2 | 8,03B | No especificado (base Llama 3 8B: 8.192 tokens) | apache-2.0 declarada por el autor | Repositorio en Hugging Face con 0 descargas y 0 likes; sin benchmarks |
| Llama 3 8B Instruct (Meta) | 8,03B | 8.192 tokens | Licencia comunitaria de Meta Llama 3 | Modelo original, ampliamente distribuido y disponible en Ollama y en multiples proveedores |
| Mistral 7B Instruct v0.3 | 7,24B | 32.768 tokens, segun documentacion del fabricante | Apache 2.0 | Ampliamente desplegado, con versiones GGUF y soporte en los principales servidores de inferencia |
| Qwen2.5 7B Instruct | 7,62B | 131.072 tokens, segun documentacion del fabricante | Apache 2.0 | Buen rendimiento declarado en codigo y matematicas; versiones cuantizadas disponibles |

No existen datos de rendimiento publicados para el modelo de esta ficha, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Los valores de contexto de los modelos comparados proceden de la documentacion de sus fabricantes y no se han verificado de forma independiente.

## Limitaciones y advertencias

- Ausencia total de datos de evaluacion: no hay benchmarks, ni evaluacion humana, ni conjunto de validacion descrito, por lo que se desconoce si el fine-tune mejora o degrada al modelo base.
- Dataset de entrenamiento no documentado: se desconoce la composicion, el idioma real y el volumen de los datos, lo que impide anticipar sesgos o dominios de especializacion.
- Riesgo de olvido catastrofico: un ajuste fino sobre un modelo base cuantizado a 4 bits puede degradar capacidades generales como el razonamiento o el codigo si el dataset era estrecho.
- Alucinacion: como cualquier modelo de 8B, tiende a inventar datos cuando no dispone de informacion; es especialmente relevante si se usa para responder preguntas factuales sin verificacion.
- Limitacion idiomatica: la model card solo declara ingles. Pese al nombre del repositorio, no hay evidencia de soporte para indonesio ni para castellano.
- Restricciones de licencia: el autor declara apache-2.0, pero al ser un derivado de Llama 3 es probable que apliquen los terminos de la licencia comunitaria de Meta Llama 3 y la obligacion de atribucion "Built with Meta Llama 3". Conviene revisar esta cuestion antes de cualquier uso comercial.
- Ausencia de validacion por la comunidad: 0 descargas y 0 likes implican que nadie ha verificado el comportamiento del modelo publicado.
- Formato poco portable: no se ofrecen pesos en GGUF ni en otros formatos cuantizados, de modo que el despliegue en entornos ligeros exige una conversion previa.
- Incompatibilidad con tool calling nativo: no se debe asumir soporte fiable de llamadas a funciones en pipelines de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BlackJagger/Llama-3-8b-Indo-Dicoding-Eksperimen-2
- Modelo base: https://huggingface.co/unsloth/llama-3-8b-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Sitio oficial de Meta Llama 3: https://github.com/meta-llama/llama3
- Llama 3 8B en Ollama: https://ollama.com/library/llama3:8b
- Modelo relacionado del mismo autor (Eksperimen-1): https://huggingface.co/BlackJagger/Llama-3-8b-Indo-Dicoding-Eksperimen-1
- Modelo relacionado de otro autor: https://huggingface.co/Jsch22/Llama3-8B-Indo-Dicoding
