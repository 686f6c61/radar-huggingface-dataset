# ApyHTML19/Mistral-7B-Instruct-v0.3-LoRA-CGI-Marocain

## Resumen

El modelo identificado como `ApyHTML19/Mistral-7B-Instruct-v0.3-LoRA-CGI-Marocain` es un adaptador LoRA publicado en HuggingFace por el usuario ApyHTML19 sobre el modelo base `mistralai/Mistral-7B-Instruct-v0.3`. Se trata, por tanto, de un ajuste fino ligero (PEFT) y no de un modelo entrenado desde cero: el repositorio contiene pesos de adaptador en formato safetensors que deben cargarse junto con el modelo base de Mistral AI. El repositorio ocupa 14,7 GB, un tamano inusualmente grande para un adaptador LoRA puro, lo que podria indicar que incluye pesos fusionados o multiples checkpoints, aunque la model card no lo aclara.

La relevancia de esta ficha es limitada y conviene ser transparente: la model card es el esqueleto por defecto que genera HuggingFace (`[More Information Needed]` en practicamente todos los campos), no declara licencia, idiomas, datos de entrenamiento, hiperparametros ni evaluacion. El nombre del adaptador incluye el sufijo "CGI-Marocain", que sugiere un ajuste orientado a un dominio o a un contexto marroqui (posiblemente frances/arabe), pero no existe documentacion que lo confirme. El modelo acumula 0 descargas y 0 likes, y las busquedas web realizadas no han devuelto ninguna fuente independiente relevante.

En consecuencia, esta ficha describe con rigor lo que se puede verificar (tipo de artefacto, modelo base, formato, tamano del repo, framework) y marca explicitamente como "no disponible" todo lo demas, incluyendo cualquier afirmacion sobre calidad, capacidades reales del ajuste o rendimiento medido. Cualquier evaluacion en produccion deberia acompanarse de una bateria de pruebas propia antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped-Query Attention y Sliding Window Attention (heredado del modelo base Mistral-7B-Instruct-v0.3; no documentado en la model card del adaptador) |
| Parametros totales | 7,3 mil millones en el modelo base; el adaptador LoRA anade un numero de parametros entrenables no especificado (no disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base v0.3 (no documentado en la model card del adaptador) |
| Tipos de cuantizacion | no disponible en la model card; al ser un adaptador PEFT, la cuantizacion se aplica al modelo base (4-bit, 8-bit, GGUF) en el momento de la carga |
| Idiomas soportados | no disponible (el sufijo "Marocain" del nombre sugiere un foco en frances/arabe marroqui, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA/PEFT; tag `peft`, `lora`, `safetensors`) |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Framework declarado | PEFT 0.20.0, transformers |
| Tamano del repositorio | 14,7 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-11 (segun metadatos de HuggingFace) |
| Fecha de ultima actualizacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) sobre Mistral-7B-Instruct-v0.3. La arquitectura subyacente corresponde a un transformer decoder-only de 7,3 mil millones de parametros con Grouped-Query Attention (8 cabezas KV para 32 cabezas de consulta) y atencion con ventana deslizante de 4096 tokens, caracteristicas propias del modelo base publicado por Mistral AI. El adaptador en si no modifica esa arquitectura: introduce matrices de bajo rango en determinadas capas, cuyos rangos, modulos objetivo y valores de alpha no se declaran en la model card.

No hay absolutamente ningun dato sobre el entrenamiento: se desconoce el dataset, el numero de tokens vistos, la composicion lingua o tematica, si hubo una fase de alineacion (SFT, DPO, RLHF) y que hiperparametros se usaron (learning rate, epochs, batch size, precision). El unico indicio es el nombre "CGI-Marocain", que apunta a un dominio concreto sin que exista documentacion que lo respalde. Tampoco se documenta ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, destilacion ni similar). Dado que la model card es una plantilla sin rellenar, cualquier afirmacion sobre el proceso de ajuste seria especulativa.

## Capacidades

- Generacion de texto conversacional: al estar construido sobre Mistral-7B-Instruct-v0.3, hereda la capacidad de mantener dialogos multi-turno con formato de instrucciones. No se ha verificado como se comporta el adaptador tras el ajuste.
- Razonamiento y conocimiento general: las capacidades del modelo base se mantienen total o parcialmente, pero el ajuste LoRA puede haberlas desplazado hacia el dominio del dataset de entrenamiento (desconocido).
- Generacion de codigo: capacidad presente en el modelo base; no hay evidencia de que el adaptador la conserve, degrade o refuerce.
- Matematicas y tareas de logica: no evaluado en la informacion disponible.
- Tool calling / function calling: no documentado. El modelo base v0.3 no incluye un formato de tool calling nativo entrenado, aunque puede inducirse por prompt.
- Soporte de agentes y razonamiento multi-paso: no documentado ni verificado.
- Capacidades multilingues: no disponibles. El sufijo "Marocain" sugiere un posible enfasis en frances y/o arabe, sin confirmacion alguna.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; no se declara ninguna.
- Capacidad de reutilizacion modular: al ser un adaptador PEFT, puede combinarse o intercambiarse sobre el modelo base sin duplicar los 7B de pesos, siempre que se gestione correctamente la carga.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en frances o arabe marroqui: si el ajuste esta efectivamente orientado a ese contexto (como sugiere el nombre), el adaptador podria desplegarse sobre Mistral-7B-Instruct-v0.3 para generar respuestas en registro local. Requiere validacion previa, ya que no hay evidencia publica.
- Experimentacion academica con PEFT: el repositorio sirve como ejemplo de adaptador LoRA sobre Mistral para estudiar tecnicas de carga, fusion y comparacion de pesos frente al modelo base.
- Base para un ajuste adicional (continued fine-tuning): al ser un adaptador de bajo rango, puede tomarse como punto de partida y seguir entrenando con datos propios sin necesidad de recalcular los pesos completos del modelo.
- Evaluacion comparativa de adaptadores: util para medir cuanto se degrada o mejora un modelo base tras un ajuste de dominio, usando como referencia el Mistral-7B-Instruct-v0.3 original.
- Generacion de texto con contexto largo: si se conserva la ventana de 32 768 tokens del modelo base, el adaptador podria emplearse en resumen de documentos extensos, analisis de contratos o procesamiento de hilos de conversacion largos.
- Despliegue en hardware de consumo: gracias a la naturaleza LoRA mas cuantizacion 4-bit del modelo base, es viable ejecutarlo en una GPU de 12-24 GB para tareas de generacion de texto en local, con fines de demostracion o desarrollo.
- Filtrado y clasificacion de texto en un dominio concreto: si el ajuste especializa el modelo en terminologia especifica, podria emplearse para etiquetar, resumir o extraer informacion en ese dominio, siempre con un conjunto de validacion propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion sin rellenar (`[More Information Needed]`) y no se han encontrado fuentes externas que reporten MMLU, HumanEval, GSM8K ni ninguna otra metrica para este adaptador.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano del modelo base (7,3 mil millones de parametros) y no de mediciones realizadas sobre este adaptador concreto.

- VRAM para pesos en fp16/bf16: aproximadamente 14-15 GB solo para los pesos, mas la cache KV.
- VRAM en cuantizacion 8-bit: aproximadamente 8 GB.
- VRAM en cuantizacion 4-bit (GPTQ, AWQ o GGUF Q4_K_M): aproximadamente 4-5 GB.
- Cache KV con contexto completo de 32 768 tokens: en torno a 4 GB adicionales en fp16, dado el uso de Grouped-Query Attention con 8 cabezas KV y 32 capas.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en fp16 con contexto largo y concurrencia; RTX 4090 o RTX 3090 (24 GB) para fp16 con contexto moderado o 4-bit con contexto completo; RTX 3060 12 GB o similares para 4-bit con lotes pequenos.
- Cabe en GPU de consumo: si, en configuraciones 4-bit sobre GPUs con 8-12 GB o superiores. En fp16 requeriria al menos 24 GB, quedando justo.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM (previa fusion del adaptador en los pesos base), TGI, llama.cpp/Ollama (solo si se convierte a GGUF, ya que estos runners no cargan adaptadores PEFT en safetensors de forma directa), text-generation-inference y servidores propios con FastAPI.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| ApyHTML19/Mistral-7B-Instruct-v0.3-LoRA-CGI-Marocain | 7,3 B (base) + adaptador LoRA | 32 768 tokens (heredado, sin confirmar) | no disponible | HuggingFace, 0 descargas, repositorio de 14,7 GB | no disponible |
| mistralai/Mistral-7B-Instruct-v0.3 (base) | 7,3 B | 32 768 tokens | Apache 2.0 | HuggingFace, ampliamente distribuido | publicado por Mistral AI en su model card |
| meta-llama/Llama-3.1-8B-Instruct | 8 B | 128 000 tokens | Llama 3.1 Community License | HuggingFace, muy extendido | publicado por Meta |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 128 000 tokens | Apache 2.0 (la mayoria de variantes) | HuggingFace y ModelScope | publicado por Alibaba |

La comparacion es estructural, no de calidad: no existen metricas publicadas de este adaptador que permitan situarlo frente al modelo base ni frente a alternativas. La unica ventaja objetiva frente al modelo base es la posibilidad de cargar un ajuste adicional sin duplicar pesos; el coste es la ausencia total de documentacion y de garantias de licencia.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto de HuggingFace, sin datos de entrenamiento, hiperparametros, dataset ni evaluacion.
- Licencia no declarada: no se especifica la licencia del adaptador. Aunque el modelo base Mistral-7B-Instruct-v0.3 se distribuye bajo Apache 2.0, la ausencia de licencia explicita en el repositorio impide asumir condiciones de uso comercial para los pesos del adaptador. Cualquier uso en produccion deberia aclararse con el autor.
- Riesgo de alucinacion: no evaluado. Un ajuste LoRA sobre un dataset de dominio desconocido puede incrementar la confianza del modelo en afirmaciones especificas de ese dominio sin que exista base factual.
- Sesgos conocidos: no documentados. Se heredan los sesgos del modelo base, mas los que pudiera introducir un dataset de ajuste no descrito.
- Idiomas: no declarados. El nombre sugiere frances/arabe marroqui, pero no hay confirmacion; el comportamiento en castellano es una incognita.
- Sobreajuste potencial: un ajuste LoRA con un dataset pequeno o muy especifico puede degradar capacidades generales del modelo base (codigo, matematicas, instrucciones fuera de dominio).
- Repositorio de 14,7 GB: inusualmente grande para un adaptador LoRA, lo que sugiere pesos fusionados o checkpoints redundantes. Conviene inspeccionar el contenido antes de descargarlo para no consumir disco y ancho de banda innecesariamente.
- Trazabilidad nula: 0 descargas, 0 likes y ninguna mencion en la web. No hay comunidad que haya validado su funcionamiento.
- Fechas de creacion y actualizacion en 2026, posteriores a la fecha habitual de publicacion del modelo base; podria tratarse de una subida reciente o de un artefacto con metadatos alterados. No afecta al funcionamiento, pero es un indicio mas de la falta de contexto.
- Para produccion: no se recomienda su uso sin una evaluacion propia sobre el dominio objetivo, comparacion contra el modelo base sin adaptador y verificacion explicita de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApyHTML19/Mistral-7B-Instruct-v0.3-LoRA-CGI-Marocain
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Referencia del tag arXiv presente en el repositorio (Lacoste et al., 2019, calculadora de impacto de ML): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact#compute
- Repositorio de la libreria PEFT: no disponible en la informacion proporcionada
- Paper o blog del adaptador: no disponible
- Demo: no disponible
- Las busquedas web realizadas no devolvieron ninguna fuente independiente relacionada con este modelo.
