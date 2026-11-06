# mradermacher/Malaysian-Qwen2.5-32B-Reasoning-SFT-GGUF

## Resumen

Malaysian-Qwen2.5-32B-Reasoning-SFT-GGUF es la version cuantizada en formato GGUF del modelo mesolitica/Malaysian-Qwen2.5-32B-Reasoning-SFT, un ajuste fino supervisado (SFT) orientado a razonamiento sobre la base Qwen2.5-32B de Alibaba. El trabajo de cuantizacion lo firma mradermacher, un perfil conocido en Hugging Face por publicar versiones GGUF de modelos open source para su uso con llama.cpp y ecosistemas compatibles.

El modelo conserva la arquitectura transformer densa de Qwen2.5 con 32.763.876.352 parametros totales (aproximadamente 32,8 mil millones), lo que lo situa en la categoria de modelos de gran tamano que requieren cuantizacion agresiva para caber en hardware de consumo. La model card del autor del ajuste lo etiqueta como especializado en razonamiento y con foco en el idioma malayo, aunque la ficha de Hugging Face solo declara "en" como idioma soportado.

La relevancia de esta ficha radica en que ofrece una via practica de ejecutar un modelo de 32B afinado para razonamiento en local mediante GGUF, con un abanico de cuantizaciones desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB). Es un caso tipico de modelo derivado de un derivado: Qwen2.5-32B, ajustado por mesolitica y reempaquetado por mradermacher, con la trazabilidad de licencia y benchmarks que eso conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen2.5-32B) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (segun la model card; el ajuste base esta orientado al malayo) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Modelo base | mesolitica/Malaysian-Qwen2.5-32B-Reasoning-SFT |
| Tamano del repositorio | 224,0 GB |
| Libreria | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-32B: un transformer denso con atencion por ventanas deslizantes combinada con atencion completa, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). Sobre esa base, mesolitica aplico un ajuste fino supervisado (SFT) orientado a razonamiento, del que no se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases posteriores de RLHF o DPO.

El proceso documentado en esta ficha es exclusivamente la cuantizacion: mradermacher genera cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1) a partir de los pesos en formato Hugging Face, sin informacion sobre calibracion con imatrix en este repositorio (las variantes ponderadas se publican aparte en el repositorio -i1-GGUF). No se dispone de detalles sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del repositorio.
- Razonamiento explicito derivado del ajuste SFT orientado a reasoning del modelo base.
- Capacidad de codigo y matematicas heredada de Qwen2.5-32B (no verificada en la informacion disponible para este ajuste concreto).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card declara solo "en"; el ajuste base esta orientado al malayo, pero no se confirma cobertura bilingue.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Razonamiento local en hardware de consumo: con la cuantizacion Q4_K_M (20,0 GB) el modelo puede ejecutarse en una GPU con 24 GB de VRAM, lo que permite desplegar un modelo de 32B afinado para razonamiento sin infraestructura de centro de datos.
- Prototipado de asistentes conversacionales: la naturaleza conversacional del ajuste y su formato GGUF facilitan integrarlo en llama.cpp u Ollama para pruebas de concepto de chat multi-turno.
- Evaluacion de modelos derivados: util para investigadores que quieran comparar el efecto de un SFT de razonamiento sobre Qwen2.5-32B frente al modelo original, usando las distintas cuantizaciones para controlar el coste computacional.
- Despliegue en entornos con recursos limitados: la cuantizacion Q2_K (12,4 GB) permite ejecutar el modelo en GPUs de 16 GB o en configuraciones CPU+GPU, a costa de una perdida de calidad notable.
- Generacion de codigo asistida en local: si se confirma la herencia de capacidades de Qwen2.5-32B, el modelo puede usarse como asistente de programacion en IDE mediante servidores compatibles con la API de OpenAI.
- Experimentacion con tecnicas de razonamiento: el ajuste SFT orientado a reasoning permite estudiar como se comportan las cadenas de razonamiento en un modelo de 32B cuantizado, comparando la calidad entre Q4_K_M y Q8_0.
- Fine-tuning posterior sobre GGUF: aunque el formato GGUF no es ideal para entrenamiento, sirve para evaluacion rapida antes de decidir si merece la pena adaptar el modelo base en precision completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~12,4 GB; Q3_K_M ~16,0 GB; IQ4_XS ~18,0 GB; Q4_K_M ~20,0 GB; Q5_K_M ~23,4 GB; Q6_K ~27,0 GB; Q8_0 ~34,9 GB. A estas cifras hay que sumar el espacio para el contexto KV cache, que crece con la longitud de contexto.
- GPU recomendadas: para Q8_0 se necesita una A100 40GB, H100 o similar; para Q4_K_M basta una RTX 4090 (24 GB) o una A6000; para Q2_K cabe en una RTX 4080 (16 GB) o incluso en GPUs de 12 GB con offloading parcial.
- Cabe en GPU de consumo: si, en RTX 4090 para cuantizaciones Q4 y Q5, y en RTX 4080/4070 Ti Super para Q2 y Q3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. No es compatible directamente con vLLM o TGI en formato GGUF (requeririan los pesos originales en safetensors).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Malaysian-Qwen2.5-32B-Reasoning-SFT-GGUF | 32,8B | no disponible | no disponible | GGUF | Este modelo; cuantizaciones estaticas |
| Qwen2.5-32B-Instruct | 32,8B | 128K (segun Qwen2.5) | Apache 2.0 (segun Qwen2.5) | safetensors, GGUF | Modelo original de Alibaba, con licencia permisiva |
| mesolitica/Malaysian-Qwen2.5-32B-Reasoning-SFT | 32,8B | no disponible | no disponible | safetensors | Modelo base del que deriva esta cuantizacion |
| mradermacher/Malaysian-Qwen2.5-32B-Reasoning-SFT-i1-GGUF | 32,8B | no disponible | no disponible | GGUF | Variante con cuantizaciones ponderadas/imatrix |

## Limitaciones y advertencias

- Licencia no declarada en la informacion disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base (mesolitica) y de Qwen2.5 antes de usarlo en produccion.
- El ajuste esta orientado al malayo segun el nombre, pero la model card solo declara "en"; el rendimiento real en castellano o en otros idiomas no esta verificado.
- Riesgo de alucinacion inherente a los modelos de 32B, agravado en las cuantizaciones mas agresivas (Q2_K, Q3_K_S), que degradan la coherencia del razonamiento.
- Las cuantizaciones por debajo de Q4 pueden producir perdida notable de calidad en tareas de razonamiento, precisamente la capacidad que el ajuste pretende reforzar.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad del ajuste SFT.
- El formato GGUF limita el despliegue a runtimes especificos y no es adecuado para fine-tuning adicional.
- El tamano del repositorio (224 GB) implica que descargar todas las cuantizaciones es costoso; conviene descargar solo la variante necesaria.
- No se dispone de datos de benchmarks que permitan validar las afirmaciones de razonamiento del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Malaysian-Qwen2.5-32B-Reasoning-SFT-GGUF
- Modelo base: https://huggingface.co/mesolitica/Malaysian-Qwen2.5-32B-Reasoning-SFT
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Malaysian-Qwen2.5-32B-Reasoning-SFT-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Malaysian-Qwen2.5-32B-Reasoning-SFT-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
