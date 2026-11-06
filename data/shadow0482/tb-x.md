# Shadow0482/tb-x

## Resumen

tb-x es un modelo de lenguaje publicado en Hugging Face por el usuario Shadow0482 bajo el identificador `Shadow0482/tb-x`. Se distribuye exclusivamente en formato GGUF, generado mediante las herramientas de Unsloth, y esta etiquetado con la familia `qwen2`, lo que indica que su arquitectura subyacente deriva de la familia Qwen2 de Alibaba. El repositorio incluye pesos con nombre interno "Mythos-Nano-safetensor" en diez cuantizaciones distintas, desde BF16 hasta Q2_K_L.

El dato objetivo mas relevante es el recuento de parametros en safetensors: 3.085.938.688 parametros, es decir, aproximadamente 3,1 mil millones. Se trata por tanto de un modelo pequeno, orientado a inferencia local en hardware de consumo, y empaquetado para su uso con llama.cpp y el ecosistema derivado (llama-cli, llama-mtmd-cli, endpoints compatibles).

La relevancia de esta ficha es limitada y conviene ser transparente: el modelo no cuenta con descargas ni likes, la model card es practicamente un volcado de la plantilla de conversion de Unsloth, y no se aportan datos sobre entrenamiento, licencia, idiomas ni evaluacion. Cualquier uso en produccion deberia ir precedido de una evaluacion propia, dado que la trazabilidad del modelo es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (segun tag del repositorio) |
| Parametros totales | 3.085.938.688 (~3,1 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q2_K_L, Q3_K_M, Q4_0, Q4_1, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (diez ficheros); el tag `safetensors` aparece en el recuento de parametros, pero el repo publica solo GGUF |

## Arquitectura y entrenamiento

La unica informacion estructural disponible es el tag `qwen2` del repositorio, que situa el modelo en la familia de transformers decoder-only de Qwen2, con atencion causal estandar y, presumiblemente, las innovaciones habituales de esa familia (RMSNorm, SwiGLU, RoPE y, en funcion de la variante, grouped-query attention). No hay confirmacion explicita de estos detalles en la model card, por lo que deben tratarse como inferencia a partir del tag y no como dato verificado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o SFT, ni sobre tecnicas de alineacion. El nombre interno de los ficheros ("Mythos-Nano-safetensor") sugiere un modelo base de tipo "nano" convertido a GGUF con Unsloth, pero no se documenta el origen de los pesos originales ni el proceso de entrenamiento. Tampoco se describen innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` indica que el modelo esta orientado a dialogos de chat, presumiblemente con plantilla de chat de la familia Qwen2.
- Razonamiento y generacion de codigo: no confirmado explicitamente, pero plausible dado el linaje Qwen2; sin datos de evaluacion que lo respalden.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. La model card menciona `llama-mtmd-cli` para modelos multimodales, pero es una instruccion generica de la plantilla de Unsloth, no una confirmacion de que tb-x tenga vision.
- Uso con llama.cpp: soportado de forma nativa gracias al formato GGUF, con `--jinja` para el procesamiento de la plantilla de chat.

## Casos de uso

- Prototipado local de chatbots: con ~3,1 mil millones de parametros, el modelo cabe en GPU de consumo y permite iterar rapidamente sobre plantillas de chat y flujos conversacionales sin coste de API.
- Inferencia en CPU y equipos sin GPU dedicada: las cuantizaciones Q4_K_M y Q3_K_M reducen el peso a unos pocos gigabytes, lo que hace viable ejecutarlo con llama.cpp en portatiles convencionales.
- Experimentacion academica con modelos pequenos: util como linea base para comparar tecnicas de cuantizacion (Q2 a Q8) sobre un mismo modelo, ya que el repo ofrece el espectro completo de ficheros.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente via llama.cpp, los datos no salen del equipo, lo que encaja en escenarios con datos sensibles donde no se puede usar un servicio en la nube.
- Generacion de texto de bajo coste en lote: para tareas de resumen corto o clasificacion simple donde la calidad de un modelo de 3B es suficiente y el coste por token es determinante.
- Pruebas de integracion con endpoints compatibles: el tag `endpoints_compatible` permite probar el modelo contra servidores compatibles con la API de OpenAI en pipelines de desarrollo.
- No recomendado como caso de uso: tareas de produccion critica, razonamiento complejo o codigo en entornos reales, dada la ausencia total de evaluacion y de garantias de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ~3,1B parametros):
  - Q2_K_L: aproximadamente 1,5-2 GB.
  - Q4_K_M: aproximadamente 2,5-3 GB.
  - Q8_0: aproximadamente 4-4,5 GB.
  - BF16/F16: aproximadamente 6-7 GB.
  - Estas cifras son estimaciones a partir del recuento de parametros; no las proporciona el autor.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para BF16; 4 GB o mas para Q4_K_M. Una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de gama media, y en CPU con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (previa importacion del GGUF), y servidores compatibles con la API de OpenAI gracias al tag `endpoints_compatible`. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que requeririan conversion a safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| tb-x (Shadow0482) | ~3,1B | no disponible | no disponible | GGUF | Hugging Face, repo sin traccion |
| Qwen2.5-3B (Alibaba) | ~3,1B | 32.768 tokens (variante instruct) | Apache 2.0 (variante base/instruct) | safetensors, GGUF | Amplia, con evaluacion publica |
| Llama 3.2 3B (Meta) | ~3,2B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Amplia, con evaluacion publica |
| Phi-3-mini (Microsoft) | ~3,8B | 4.096-128.000 tokens segun variante | MIT | safetensors, GGUF | Amplia, con evaluacion publica |

La comparativa deja claro que tb-x compite en la categoria de modelos de ~3B, donde existen alternativas con licencia clara, contexto documentado y benchmarks publicos. Sin esa informacion, tb-x no ofrece ventajas verificables frente a ellas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni datos de entrenamiento, ni descripcion de la alineacion, lo que impide estimar su calidad real.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido; en la practica, esto bloquea su adopcion en produccion hasta que el autor lo aclare.
- Idiomas no declarados: no se conoce la cobertura linguistica; el rendimiento en castellano es una incognita.
- Riesgo de alucinacion: al ser un modelo de ~3B sin documentacion de alineacion, la probabilidad de generar contenido incorrecto con seguridad aparente es alta.
- Trazabilidad dudosa: el nombre interno "Mythos-Nano" no se corresponde con el identificador del repositorio, y la model card es una plantilla generica de Unsloth sin informacion sustantiva.
- Contexto desconocido: no se puede planificar su uso en tareas que requieran ventanas largas.
- Sin actividad en la comunidad: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que los errores se detecten y corrijan.
- El tag `safetensors` en el recuento de parametros no implica que se publiquen pesos en ese formato; el repo solo ofrece GGUF.

## Enlaces

- Hugging Face: https://huggingface.co/Shadow0482/tb-x
- Unsloth (herramienta de conversion citada): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado por la model card): https://github.com/ggml-org/llama.cpp
