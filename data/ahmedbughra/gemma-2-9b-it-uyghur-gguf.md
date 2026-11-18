# Ahmedbughra/Gemma-2-9B-It-Uyghur-GGUF

## Resumen

Gemma-2-9B-It-Uyghur-GGUF es un ajuste fino (fine-tuning) del modelo Gemma 2 9B Instruct de Google, especializado en el idioma uigur y distribuido exclusivamente en formato GGUF para su uso con llama.cpp y Ollama. Lo desarrolla el usuario Ahmedbughra, que parte de los pesos originales de Gemma 2 y realiza el ajuste y la conversion a GGUF mediante la herramienta Unsloth, segun indica la model card.

El modelo hereda la arquitectura transformer decoder-only de Gemma 2, con aproximadamente 9.240 millones de parametros (9.241.705.984 segun los datos de safetensors), y mantiene las capacidades conversacionales del modelo base de Google. Su proposito es ofrecer una variante de Gemma 2 capaz de responder en uigur, un idioma con escasa representacion en los grandes modelos fundacionales, empaquetada de forma lista para inferencia local.

La relevancia de esta ficha es doble: por un lado, documenta una adaptacion linguistica de bajo perfil (0 descargas, 1 like en el momento de la consulta); por otro, sirve de ejemplo de pipeline Unsloth -> GGUF aplicado a una familia de modelos (Gemma 2) que no es de pesos abiertos en sentido estricto, sino bajo terminos de uso de Google. El repositorio ocupa 5,8 GB y solo publica una cuantizacion Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parametros totales | 9.241.705.984 (9,24 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 2 soporta hasta 8.192 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado: `gemma-2-9b-it.Q4_K_M.gguf`) |
| Idiomas soportados | no disponible en la informacion proporcionada (el ajuste esta orientado al uigur) |
| Licencia | no disponible en la informacion proporcionada (heredada de Gemma 2, sujeta a los terminos de uso de Google; no confirmado) |
| Formato de pesos | GGUF (llama.cpp); se incluye Modelfile para Ollama |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Gemma 2 9B Instruct, un transformer decoder-only de Google con atencion por ventanas alternadas y atencion global en capas intercaladas (caracteristica de la familia Gemma 2). El ajuste se realizo con Unsloth, segun la model card, y posteriormente se convirtio a GGUF. La model card menciona que el comportamiento del token BOS se ajusto para garantizar la compatibilidad con GGUF.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus uigur utilizado, ni si se aplicaron tecnicas de RLHF o DPO especificas para este ajuste. Tampoco se detalla el metodo de fine-tuning (LoRA, QLoRA u otro). La unica innovacion tecnica documentada es el uso de Unsloth para acelerar el entrenamiento y la conversion a GGUF, ademas del ajuste del token BOS para llama.cpp.

## Capacidades

- Generacion de texto conversacional en uigur, heredada del ajuste sobre Gemma 2 9B Instruct.
- Razonamiento y respuesta a instrucciones propias del modelo base Gemma 2 Instruct.
- Generacion de codigo y matematicas: capacidad heredada del modelo base, no verificada para este ajuste.
- Soporte de tool calling / function calling: no documentado para este ajuste; el modelo base Gemma 2 no destaca por ello.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: orientadas al uigur; el resto de idiomas depende de la retencion del modelo base, no verificada.
- Modo thinking, vision o audio: no disponible.
- Ejecucion local via llama.cpp y Ollama gracias al formato GGUF.

## Casos de uso

- Atencion al ciudadano en uigur: despliegue de un asistente conversacional local que responda en uigur sin depender de APIs externas, aprovechando el formato GGUF para entornos con conectividad limitada.
- Traduccion y adaptacion de contenidos al uigur: uso del modelo para redactar o adaptar textos (noticias, documentacion, material educativo) en uigur, con revision humana dado el riesgo de alucinacion.
- Investigacion linguistica: generacion de corpus sinteticos o ejemplos en uigur para estudios de procesamiento del lenguaje natural en lenguas de bajos recursos.
- Despliegue en hardware de consumo: al estar cuantizado en Q4_K_M, puede ejecutarse en GPUs de consumo con suficiente VRAM, lo que facilita prototipos y demos sin infraestructura dedicada.
- Educacion y aprendizaje del idioma: asistente de practica de conversacion en uigur para estudiantes, con la salvedad de que la calidad del ajuste no esta validada publicamente.
- Integracion en pipelines de llama.cpp u Ollama: uso como endpoint local compatible con la CLI de llama.cpp (`llama-cli`) o mediante el Modelfile incluido para Ollama, util para pruebas de integracion en aplicaciones de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa aproximadamente 5,8 GB (tamano del repo), por lo que se necesitan en torno a 6-8 GB de VRAM para cargar el modelo y el contexto en GPU.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en el ambito profesional, A100 o H100 si se busca mayor throughput, aunque el modelo es pequeno para estas GPUs.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM (con contexto reducido) y con holgura en 12-16 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (Modelfile incluido); no se documentan otros motores como vLLM o TGI para este repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-2-9B-It-Uyghur-GGUF (este) | 9,24 B | no disponible | no disponible (heredada de Gemma 2) | GGUF Q4_K_M | Ajuste en uigur, 0 descargas |
| google/gemma-2-9b-it | 9,24 B | 8.192 tokens (modelo base) | Terminos de uso de Gemma | safetensors, GGUF oficiales | Modelo base sin ajuste en uigur |
| Meta-Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Alternativa de tamano similar con contexto mucho mayor |
| Qwen2.5-7B-Instruct | 7,62 B | 32.768 tokens (hasta 131.072 con RoPE) | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar con licencia permisiva |

La comparativa se limita a caracteristicas estructurales; no hay datos de rendimiento publicados para este ajuste que permitan comparar calidad en uigur.

## Limitaciones y advertencias

- Riesgo de alucinacion: al ser un ajuste fino sobre un modelo de 9 B con datos no documentados, la fidelidad factual en uigur no esta validada.
- Sesgos conocidos: no documentados; hereda los sesgos del corpus de preentrenamiento de Gemma 2 y del corpus de ajuste, cuya composicion se desconoce.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto efectiva del ajuste; el rendimiento fuera del uigur no esta verificado.
- Restricciones de licencia: la licencia no se indica en la informacion disponible; al derivar de Gemma 2, es probable que este sujeta a los terminos de uso de Google, lo que debe verificarse antes de un uso comercial.
- Caveat de produccion: repositorio con 0 descargas y 1 like, sin benchmarks ni validacion externa; solo se publica una cuantizacion Q4_K_M, lo que limita el ajuste fino de calidad/velocidad.
- El ajuste del token BOS para compatibilidad con GGUF puede alterar el comportamiento respecto al modelo original en algunos prompts.

## Enlaces

- Hugging Face: https://huggingface.co/Ahmedbughra/Gemma-2-9B-It-Uyghur-GGUF
- Unsloth (herramienta de ajuste y conversion): https://github.com/unslothai/unsloth
- Modelo base Gemma 2 9B Instruct: https://huggingface.co/google/gemma-2-9b-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
