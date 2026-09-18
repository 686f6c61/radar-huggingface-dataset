# cyberviser/hancock-v0.3.2-adapter

## Resumen

`cyberviser/hancock-v0.3.2-adapter` es un adaptador LoRA publicado con la librería PEFT sobre el modelo base `unsloth/mistral-7b-instruct-v0.3-bnb-4bit`, es decir, una versión cuantizada a 4 bits de Mistral-7B-Instruct-v0.3. El autor es el usuario de HuggingFace `cyberviser` y el repositorio ocupa 0,2 GB, un tamano coherente con un adaptador de bajo rango y no con un modelo completo. El adaptador esta sujeto a acceso restringido (gated), por lo que requiere aceptar condiciones en HuggingFace antes de poder descargarlo.

La relevancia de esta ficha es limitada pero concreta: se trata de un ajuste fino ligero sobre una arquitectura de 7.000 millones de parametros con ventana de contexto de 32.768 tokens, lo que lo hace desplegable en GPUs de consumo con cuantizacion de 4 bits. Al ser un adaptador, no sustituye al modelo base: se carga encima de el y anade la especializacion aprendida durante el entrenamiento.

No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, el metodo de alineacion ni resultados de benchmarks. Tampoco hay descripcion de la pipeline ni de los idiomas soportados en la ficha del repositorio. Cualquier evaluacion de calidad debe hacerse por tanto de forma empirica sobre el propio adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (Mistral 7B v0.3) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 7.240 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens heredados del modelo base Mistral-7B-Instruct-v0.3 |
| Tipos de cuantizacion | Modelo base en 4 bits mediante bitsandbytes (bnb-4bit, NF4); el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponibles en la ficha del repositorio; el modelo base declara capacidades multilingues |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA, libreria `peft`) |

Datos adicionales del repositorio: tamano de 0,2 GB, 0 descargas, 0 likes, region `us`, DOI `10.57967/hf/8786`, creado el 28 de abril de 2026 y actualizado el 18 de septiembre de 2026. Acceso restringido (gated). Pipeline no disponible.

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador de bajo rango (LoRA) en formato PEFT, no un modelo completo. Se aplica sobre `unsloth/mistral-7b-instruct-v0.3-bnb-4bit`, una conversion cuantizada a 4 bits del modelo Mistral-7B-Instruct-v0.3 realizada por Unsloth. La arquitectura subyacente es un transformer decoder-only con Grouped-Query Attention, Sliding Window Attention y RoPE, con 7.240 millones de parametros, vocabulario de 32.768 tokens y ventana de contexto de 32.768 tokens. Al cargarse sobre una base cuantizada en 4 bits, el adaptador opera en precision mixta sobre esa base, lo que reduce los requisitos de VRAM a costa de una perdida de precision respecto a la version en fp16 o bf16.

No hay informacion publicada sobre el proceso de entrenamiento: se desconoce el numero de tokens, la composicion del dataset, si hubo una fase de instruccion supervisada seguida de DPO o RLHF, el rango y el alpha del adaptador, ni que modulos se adaptaron. El uso de una base de Unsloth sugiere un flujo de entrenamiento tipico de QLoRA, pero esto es una inferencia a partir del nombre del modelo base y no un dato confirmado en la ficha. Tampoco se documenta ninguna innovacion tecnica propia.

## Capacidades

- Generacion de texto e instrucciones: heredadas del modelo base Mistral-7B-Instruct-v0.3, que esta afinado para seguir instrucciones y mantener conversaciones multi-turno.
- Razonamiento y matematicas basicas: capacidades propias de un modelo de 7.000 millones de parametros, sin datos especificos publicados para este adaptador.
- Generacion de codigo: el modelo base cubre lenguajes habituales, pero no hay evaluacion publicada del adaptador en esta tarea.
- Soporte multilingue: el modelo base declara capacidades en varios idiomas; la ficha del adaptador no especifica idiomas soportados.
- Tool calling / function calling: Mistral-7B-Instruct-v0.3 incluye una plantilla de llamada a funciones, pero no esta documentado que el adaptador preserve o mejore esa capacidad.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision o audio: no soportado; se trata de un modelo exclusivamente de texto.
- Comportamiento especializado: se desconoce que comportamiento concreto anade el adaptador, ya que no hay model card descriptiva.

## Casos de uso

- Despliegue de un asistente conversacional ligero: cargando el adaptador sobre el base en 4 bits, el conjunto ocupa aproximadamente 5 GB de VRAM, lo que permite servir un chatbot con 32.768 tokens de contexto en una unica GPU de gama media.
- Prototipado rapido de ajustes de dominio: al ser un adaptador de 0,2 GB, se puede versionar, intercambiar y combinar con otros adaptadores LoRA sobre la misma base sin duplicar los 7.000 millones de parametros.
- Investigacion sobre personalizacion eficiente: sirve como ejemplo de flujo QLoRA con Unsloth para comparar tecnicas de ajuste ligero frente a ajuste completo.
- Generacion de texto asistida en herramientas internas: integrable mediante vLLM con soporte de LoRA para tareas de redaccion, resumen o reformulacion, siempre que se valide antes la calidad real del adaptador.
- Filtrado y clasificacion de texto: tareas de etiquetado y extraccion de informacion en lotes, donde el coste por token es bajo y el contexto largo evita trocear documentos.
- Experimentacion academica: analisis de como un adaptador entrenado sobre una base cuantizada a 4 bits degrada o mantiene las capacidades del modelo original.
- Base para pipelines de evaluacion: al ser un checkpoint pequeno y con licencia Apache 2.0, es adecuado como sujeto de pruebas en comparativas de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 0,2 GB, pero requiere el modelo base. En 4 bits (bitsandbytes NF4) el conjunto necesita en torno a 4,5-5,5 GB de VRAM; en fp16/bf16, alrededor de 15-16 GB. La KV cache para 32.768 tokens anade varios GB adicionales segun el tamano de lote.
- GPU recomendadas: para 4 bits, RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090, L4, A10G; para fp16, A100 de 40/80 GB, H100 o 2 x RTX 4090.
- Cabe en GPU de consumo: si, en configuracion de 4 bits cabe en cualquier GPU con 8 GB o mas de VRAM, con margen comodo a partir de 12 GB.
- Opciones de despliegue: vLLM (soporta adaptadores LoRA en tiempo de ejecucion), TGI, llama.cpp y Ollama previa conversion del adaptador a GGUF, y HuggingFace Transformers con `peft`. El acceso esta restringido en HuggingFace, por lo que hay que aceptar las condiciones y autenticarse con un token.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyberviser/hancock-v0.3.2-adapter | Adaptador sobre 7,24 B | 32.768 tokens (heredados) | No disponible | Apache 2.0 | Gated en HuggingFace, 0,2 GB |
| unsloth/mistral-7b-instruct-v0.3-bnb-4bit | 7,24 B | 32.768 tokens | No disponible en esta ficha | Apache 2.0 | Publico en HuggingFace |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,24 B | 32.768 tokens | Metricas publicadas por Mistral, no reproducidas aqui | Apache 2.0 | Publico en HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 millones | 128.000 tokens | Metricas publicadas por Meta, no reproducidas aqui | Llama 3.1 Community License | Publico con acceso aprobado |

La comparacion relevante es siempre contra el modelo base sin adaptador, ya que el adaptador no puede evaluarse de forma aislada. No hay datos que permitan afirmar que el ajuste mejora al base en ninguna tarea concreta.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card descriptiva, ni dataset, ni hiperparametros, ni ejemplos de uso.
- Sin benchmarks: no existe ninguna medicion publicada de calidad, lo que impide justificar su uso en produccion sin una evaluacion propia.
- Acceso restringido: el repositorio es gated, lo que anade friccion para descargarlo y puede limitar su uso en entornos automatizados.
- Dependencia estricta del modelo base: el adaptador solo es valido sobre `unsloth/mistral-7b-instruct-v0.3-bnb-4bit`; cargarlo sobre otra version o sobre pesos en fp16 puede degradar el resultado.
- Perdida de precision por cuantizacion: al operar sobre una base en 4 bits, se acumulan los errores de cuantizacion del modelo base y los propios del adaptador.
- Riesgo de alucinacion: inherente a los modelos de 7.000 millones de parametros, especialmente en tareas de razonamiento largo o datos factuales.
- Sesgos: no evaluados. El adaptador hereda los sesgos del corpus de entrenamiento del modelo base, que no esta documentado en esta ficha.
- Idiomas: no se especifica que idiomas soporta el adaptador. El castellano no esta confirmado.
- Uso comercial: la licencia Apache 2.0 es permisiva, pero conviene verificar por separado las condiciones de la base cuantizada y del modelo original de Mistral.
- Senales de adopcion nulas: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso por parte de la comunidad.
- Advertencia sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relacionado con este modelo; los enlaces encontrados corresponden a un autor no relacionado con el repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/cyberviser/hancock-v0.3.2-adapter
- DOI asociado: https://doi.org/10.57967/hf/8786
- Modelo base utilizado: https://huggingface.co/unsloth/mistral-7b-instruct-v0.3-bnb-4bit
- Modelo original de Mistral: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Paper de Mistral 7B: https://arxiv.org/abs/2310.06825
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de PEFT: https://github.com/huggingface/peft

No se han encontrado otros enlaces relevantes (papers, blogs, demos o repositorios) en la busqueda web para este modelo.
