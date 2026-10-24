# luisastellet/qwen-metaphor-unke-camada-23-prompt-textual

## Resumen

`luisastellet/qwen-metaphor-unke-camada-23-prompt-textual` es un modelo de generación de texto publicado en Hugging Face por el usuario luisastellet, construido sobre la arquitectura Qwen3 y distribuido en formato safetensors con 596.049.920 parámetros totales (aproximadamente 0,6 mil millones). El repositorio tiene un tamaño de 2,4 GB y está etiquetado para su uso con la librería `transformers`, con pipeline de `text-generation` y compatibilidad declarada con endpoints y text-generation-inference.

El problema que aborda no está documentado: la model card es la plantilla automática de Hugging Face, sin secciones rellenadas (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento y evaluación aparecen todos como «More Information Needed»). El nombre del identificador sugiere una serie de experimentos organizados por capas («camada 23») en torno al procesamiento de metáforas («metaphor», «literal-metaforica», «prompt-textual»), y en el Hub existen variantes hermanas como `qwen-metaphor-unke`, `...-camada-2-literal-metaforica`, `...-camada-4-literal-metaforica` y `...-camada-5`. Se trata, por tanto, de un artefacto de investigación o experimentación, no de un modelo listo para producción.

Su relevancia es limitada y de nicho: resulta interesante para quien quiera reproducir o inspeccionar ablaciones por capa sobre un modelo Qwen3 pequeño, pero carece de documentación, licencia declarada y evaluación pública. Cualquier uso en producción exige una validación previa por parte del equipo adoptante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (según el tag `qwen3` del repositorio); detalles no documentados por el autor |
| Parametros totales | 596.049.920 (dato real de los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE según los datos disponibles) |
| Longitud de contexto | No disponible para este checkpoint; modelos hermanos de la misma serie declaran 32.768 tokens |
| Tipos de cuantizacion | No disponible en el repositorio (solo safetensors; no se publican GGUF ni cuantizaciones de 8/4 bits) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El repositorio declara el tag `qwen3`, lo que sitúa el modelo en la familia Qwen3 de Alibaba, con arquitectura transformer decoder-only. Con 596 millones de parámetros, el tamaño encaja con un fine-tuning del modelo base Qwen3-0.6B, aunque el autor no confirma explícitamente el modelo de partida ni el procedimiento aplicado. El identificador «camada-23» apunta a un entrenamiento o intervención selectiva sobre la capa 23 de la red, y «prompt-textual» sugiere que el ajuste se realizó mediante instrucciones en lenguaje natural en lugar de, por ejemplo, intervenciones sobre activaciones. Nada de esto está verificado en la documentación disponible.

No hay información sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO, hiperparámetros, precisión mixta ni infraestructura de cómputo. La model card incluye las secciones de Training Details y Evaluation con marcadores «More Information Needed». Tampoco se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, modos de razonamiento) más allá de lo que herede del modelo base.

## Capacidades

- Generación de texto autoregresiva y conversación multi-turno, según los tags `text-generation` y `conversational`.
- Compatibilidad con el ecosistema `transformers` y con text-generation-inference (TGI) y endpoints compatibles, según los tags del repositorio.
- Capacidad de razonamiento, código y matemáticas: no verificada ni documentada para este checkpoint.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el modelo base Qwen3 es multilingüe, pero no se ha confirmado que el fine-tuning preserve ese comportamiento).
- Capacidades especiales (modo thinking, visión, audio): no disponibles; no se declara ninguna.
- Orientación temática aparente hacia el procesamiento de metáforas y lenguaje figurado, deducida únicamente del nombre del repositorio y de sus variantes, no de documentación.

## Casos de uso

- Investigación sobre representaciones internas: el checkpoint puede cargarse con `transformers` para inspeccionar cómo se comporta una intervención en la capa 23 frente a otras variantes de la serie (`camada-2`, `camada-4`, `camada-5`), comparando activaciones y salidas sobre el mismo conjunto de prompts.
- Experimentos de lingüística computacional sobre lenguaje figurado: útil para probar si un ajuste con «prompt textual» altera la interpretación literal frente a la metafórica de una frase, siempre que el equipo construya su propio conjunto de evaluación, ya que el autor no publica ninguno.
- Prototipado rápido en local: con menos de 600 M de parámetros, el modelo se ejecuta en una GPU de consumo o incluso en CPU, lo que permite iterar en cuadernos sin infraestructura dedicada.
- Docencia y demostraciones de fine-tuning: sirve como ejemplo de repositorio derivado de Qwen3 en cursos sobre ajuste de modelos pequeños, con la advertencia de que la model card no explica el proceso.
- Generación de texto creativo de bajo coste en entornos controlados: redacción de variaciones estilísticas o reformulaciones donde el riesgo de error factual sea tolerable y exista revisión humana.
- Base para un ajuste posterior propio: al ser un checkpoint de 0,6 B en safetensors, un equipo puede continuar el entrenamiento con su propio dataset si la licencia del modelo subyacente lo permite, algo que aquí no está declarado y debe aclararse antes de cualquier uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y el autor no enlaza evaluación alguna.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en fp16/bf16 (596 M × 2 bytes), alrededor de 2,4 GB en fp32, unos 0,6 GB en int8 y 0,35 GB en int4, más la memoria de la caché KV, que crece con la longitud de contexto.
- GPU recomendadas: cualquier GPU moderna con 4 GB o más de VRAM es suficiente; una RTX 3060, RTX 4060 o RTX 4090 lo ejecutan con holgura. Para servir en lote a gran escala tendría sentido una A100 o H100, aunque el modelo está muy por debajo de su capacidad.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU discretas de los últimos años, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (vía `AutoModelForCausalLM`), text-generation-inference y endpoints compatibles según los tags. Para vLLM, llama.cpp u Ollama haría falta convertir los pesos, ya que el repositorio solo publica safetensors y no incluye GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones. El tamaño del repositorio (2,4 GB) sugiere que puede incluir pesos en precisión superior a fp16 o ficheros adicionales, lo que conviene comprobar antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| Este checkpoint (`qwen-metaphor-unke-camada-23-prompt-textual`) | 596 M | No disponible (hermanos: 32.768) | No disponible | Hugging Face, 0 descargas, 0 likes | Sin model card, sin benchmarks, sin dataset documentado |
| Qwen3-0.6B (modelo base probable) | 0,6 B | 32.768 tokens nativos | Apache 2.0 (dato público del modelo base, no verificado en esta ficha) | Hugging Face, ampliamente utilizado | Base documentada y evaluada; multilingüe |
| Qwen2.5-0.5B | 0,49 B | 32.768 tokens | Apache 2.0 | Hugging Face | Generación anterior de la familia; sin capacidades de razonamiento explícito |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens | Licencia comunitaria de Llama | Hugging Face | Mayor tamaño y contexto; requiere aceptar la licencia |

Los datos del modelo base y de las alternativas provienen de información pública de sus respectivas familias y no han podido contrastarse con la documentación de este repositorio, que no los menciona.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática, sin información sobre datos, objetivo, evaluación ni uso previsto. No es posible saber qué comportamiento se pretendía obtener ni con qué criterio validarlo.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no se puede evaluar qué sesgos se han introducido o amplificado respecto al modelo base.
- Riesgo de alucinación: no cuantificado. En un modelo de 0,6 B el riesgo es estructuralmente alto, y un fine-tuning temático sin evaluación publicada puede incrementarlo.
- Idiomas no declarados: se desconoce si conserva el multilingüismo del modelo base o si el ajuste lo ha degradado hacia un único idioma.
- Contexto no confirmado: la ventana de 32.768 tokens es una inferencia a partir de modelos hermanos de la serie, no un dato de este repositorio.
- Licencia no disponible: sin licencia declarada no hay autorización explícita de uso comercial, y la licencia final estará condicionada por la del modelo subyacente. Es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Sin comunidad ni mantenimiento: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado con menos de un minuto de diferencia, lo que sugiere una publicación automatizada sin revisión posterior.
- No apto para producción sin validación: no hay benchmarks, ni informes de seguridad, ni garantías de que el checkpoint cargue correctamente con `transformers`.

## Enlaces

- Repositorio del modelo: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-23-prompt-textual
- Repositorio de la serie (modelo raíz): https://huggingface.co/luisastellet/qwen-metaphor-unke
- Variante de la capa 2: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-2-literal-metaforica
- Variante de la capa 23 (literal-metafórica): https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-23-literal-metaforica
- Variante de la capa 4 en Featherless: https://featherless.ai/models/luisastellet/qwen-metaphor-unke-camada-4-literal-metaforica
- Variante de la capa 5 en Featherless: https://featherless.ai/models/luisastellet/qwen-metaphor-unke-camada-5
- Despliegue en FriendliAI: https://friendli.ai/models/luisastellet/qwen-metaphor-unke-camada-23-literal-metaforica
- Paper citado en los tags (calculadora de impacto medioambiental, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
