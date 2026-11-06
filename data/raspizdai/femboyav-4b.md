# RaspizdAI/femboyAV-4b

## Resumen

femboyAV-4b es un ajuste fino mediante LoRA del modelo multimodal huihui-ai/Huihui-Qwen3-VL-4B-Instruct-abliterated, publicado por el usuario RaspizdAI en Hugging Face. El objetivo no es mejorar capacidades de razonamiento ni de codigo, sino imprimir una persona conversacional concreta: un asistente con tono jugueton que emplea emoticonos como `:3`, `UwU`, `OwO`, `^^` o `~`. Se entrenó sobre 10.330 pares de chat sinteticos en ingles y ruso del dataset RaspizdAI/femboy-10k, durante una sola epoca.

Tecnicamente hereda la arquitectura Qwen3-VL en su variante de 4B, con 4.437.815.808 parametros totales (pesos en BF16, ~8,9 GB en el repositorio). El entrenamiento LoRA afecto a 39.321.600 parametros, un 0,88 % del total, y no modifico la torre de vision, por lo que la entrada de imagenes sigue funcionando. El resultado es un modelo de chat informal, no orientado a precision factual, cuyo interes practico esta en experimentar con personalizacion estilistica de un VLM pequeno y en el ecosistema de despliegue (GGUF con proyector de vision incluido).

Es relevante ahora como ejemplo de la cadena de derivaciones que permite la licencia Apache-2.0: un modelo base abliterated (sin mecanismos de rechazo) sirve de punto de partida para un fine-tune de persona, con versiones GGUF publicadas aparte para inferencia local. No hay que esperar de el un asistente de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (variante 4B), ajuste LoRA sobre el modelo base |
| Parametros totales | 4.437.815.808 (~4,48B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF F16, Q8_0 y Q4_K_M publicados en RaspizdAI/femboyAV-4b-gguf, con proyector de vision |
| Idiomas soportados | en, ru |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (BF16, merged LoRA); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3-VL. La parte de lenguaje y el proyector se ajustaron con LoRA sobre el checkpoint abliterated de huihui-ai, mientras que la torre de vision quedo intacta, de modo que la ruta de procesamiento de imagen y video (con `preprocessor_config.json` y `video_preprocessor_config.json`) se conserva tal cual. La fusion de los adaptadores dio como resultado un unico `model.safetensors` en BF16 de aproximadamente 8,9 GB.

El entrenamiento se realizo con Unsloth LoRA durante una epoca, con learning rate pico de 2e-4, sobre el conjunto completo de 10.330 pares `user_input` / `ai_output` (el dataset publico declara 10.000 filas). Los datos son sinteticos y bilingues (ingles y ruso), orientados a conversacion informal con la persona descrita. No se documentan fases de RLHF, DPO ni evaluaciones posteriores al ajuste. La innovacion tecnica es, por tanto, minima: se trata de un caso de personalizacion estilistica con un presupuesto de parametros muy reducido (0,88 %).

## Capacidades

- Generacion de texto conversacional en ingles y ruso con un estilo muy marcado (emoticonos, tono jugueton).
- Entrada de imagenes: la torre de vision no se modifico, por lo que el modelo sigue aceptando imagenes y video a traves del procesador multimodal.
- Plantilla de chat propia (`chat_template.jinja`) compatible con el flujo `apply_chat_template` de transformers.
- Inferencia en formato GGUF (incluido el proyector de vision), lo que permite despliegue local con llama.cpp y derivados.
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.
- No se documenta modo de razonamiento explicito (thinking) ni capacidades de audio.
- El razonamiento, el codigo y las matematicas no son objetivos del ajuste y no hay evidencia publicada de su calidad tras el fine-tune.

## Casos de uso

- Prototipado de personajes conversacionales: el modelo sirve para probar rapidamente como responde un VLM de 4B cuando se le impone una persona concreta, sin necesidad de reentrenar desde cero.
- Chat de compania en ingles o ruso: conversaciones informales multi-turno donde el tono afectivo importa mas que la precision factual, usando la plantilla de chat incluida.
- Descripcion de imagenes con estilo: al conservar la torre de vision, puede comentar una imagen subida por el usuario manteniendo la voz del personaje, util en demos y bots de comunidad.
- Experimentacion con despliegue local: las builds GGUF F16, Q8_0 y Q4_K_M permiten ejecutar el modelo en hardware de consumo con llama.cpp para pruebas de latencia y calidad.
- Investigacion sobre fine-tuning con Unsloth: el repositorio documenta hiperparametros (LoRA, 1 epoca, lr 2e-4) y el dataset, lo que lo convierte en una referencia reproducible de un pipeline LoRA sobre un VLM.
- Generacion de datos sinteticos de dialogo: puede emplearse para producir respuestas con un registro informal concreto en corpus de entrenamiento o de evaluacion estilistica, siempre con revision humana.
- Base para ablations de persona: comparar este checkpoint con el modelo base abliterated permite medir cuanto del comportamiento observado proviene del ajuste y cuanto del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 9-10 GB solo para pesos, mas overhead de activaciones y cache KV; comodo en GPUs de 16 GB o mas.
- VRAM estimada en GGUF Q8_0: aproximadamente 5 GB de pesos; en Q4_K_M, alrededor de 3 GB, a los que hay que sumar el proyector de vision si se usan imagenes.
- GPUs recomendadas: A100 o H100 para servir en BF16 con concurrencia; RTX 4090 (24 GB) para BF16 en una sola tarjeta; RTX 3090/4080 (16-24 GB) tambien suficientes en BF16.
- GPU de consumo: cabe en tarjetas de 8 GB usando Q4_K_M en llama.cpp; en BF16 requiere al menos 12-16 GB.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText` con `device_map="auto"`), llama.cpp y frontends compatibles con GGUF; vLLM y TGI no estan documentados para este checkpoint en la informacion disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| RaspizdAI/femboyAV-4b | ~4,48B | no disponible | texto + imagen/video | Apache-2.0 | Fine-tune LoRA de persona sobre base abliterated |
| huihui-ai/Huihui-Qwen3-VL-4B-Instruct-abliterated | ~4,48B | no disponible | texto + imagen/video | Apache-2.0 | Modelo base sin mecanismos de rechazo; comportamiento generalista |
| Qwen3-VL-4B-Instruct (original) | ~4,48B | no disponible | texto + imagen/video | Apache-2.0 | Referencia upstream con alineamiento estandar |
| Qwen3-4B (solo texto) | ~4B | no disponible | texto | Apache-2.0 | Alternativa si no se necesita vision |

La comparacion cuantitativa de rendimiento no esta disponible: no hay benchmarks publicados para femboyAV-4b ni cifras comparativas en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que la persona es estilistica: las respuestas no son asesoramiento factual y pueden contener detalles inventados.
- Entrenado sobre datos sinteticos, con riesgo de respuestas repetitivas o excesivamente emotivas.
- Contenido informal; no destinado a uso profesional, medico, legal ni critico para la seguridad.
- El modelo base es una version abliterated, es decir, con los mecanismos de rechazo eliminados; esto incrementa el riesgo de generar contenido inapropiado y exige filtros propios en produccion.
- Idiomas limitados a ingles y ruso; el rendimiento en castellano no esta documentado y previsiblemente sera deficiente.
- No hay informacion sobre la longitud de contexto efectiva tras el ajuste ni sobre degradacion en contextos largos.
- Sesgos: no documentados por el autor; al derivar de un modelo entrenado con datos web, cabe esperar los sesgos habituales de esa procedencia.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo recae en el desplegador.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validacion comunitaria ni reportes de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RaspizdAI/femboyAV-4b
- Versiones GGUF: https://huggingface.co/RaspizdAI/femboyAV-4b-gguf
- Dataset de entrenamiento: https://huggingface.co/datasets/RaspizdAI/femboy-10k
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3-VL-4B-Instruct-abliterated
- Perfil del autor: https://huggingface.co/RaspizdAI/models
