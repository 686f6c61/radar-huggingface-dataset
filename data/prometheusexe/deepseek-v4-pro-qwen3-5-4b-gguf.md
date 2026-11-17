# PrometheusEXE/DeepSeek-V4-Pro-Qwen3.5-4B-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-GGUF es una cuantizacion en formato GGUF del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, publicada por el usuario PrometheusEXE en Hugging Face. Se trata de un modelo de lenguaje de aproximadamente 4.326 millones de parametros (4,3B) construido sobre una arquitectura de tipo Qwen 3.5 y destilado a partir de DeepSeek-V4-Pro, segun indican los tags del repositorio (distillation, deepseek, qwen3_5, sft). El objetivo del modelo es trasladar capacidades de razonamiento, matematicas y STEM de un modelo mayor a uno de tamano compacto que pueda ejecutarse en hardware modesto.

La relevancia de esta ficha radica en que combina dos tendencias actuales: la destilacion de modelos frontier hacia tamanos pequenos y la distribucion en GGUF para inferencia local con llama.cpp y derivados. El repositorio incluye los tags reasoning y mtp (multi-token prediction), lo que sugiere soporte para modos de razonamiento explicito y decodificacion especulativa, aunque no se dispone de documentacion tecnica detallada en la informacion proporcionada.

El acceso al repositorio esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos. El modelo declara licencia Apache 2.0, soporte para ingles y chino, y un tamano de repositorio de 41 GB, coherente con multiples variantes de cuantizacion GGUF de un modelo de 4,3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen 3.5 (derivada de la familia Qwen), con capacidades de razonamiento; detalles internos no disponibles |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (multiples variantes; niveles concretos no disponibles) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizacion); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B es, segun los tags del repositorio, un modelo de la familia Qwen 3.5 destilado a partir de DeepSeek-V4-Pro mediante un proceso de SFT (supervised fine-tuning) sobre datasets de destilacion publicados por Jackrong (DeepSeek-V4-Pro-Distilled-200K y DeepSeek-V4-Distill-8000x). La combinacion de tags reasoning, math y stem indica que el entrenamiento se ha orientado a tareas de razonamiento logico, matematicas y ciencia, ingenieria y tecnologia. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

El tag mtp (multi-token prediction) sugiere que la arquitectura incorpora prediccion multi-token, una tecnica que permite al modelo predecir varios tokens por paso y que suele aprovecharse para decodificacion especulativa o aceleracion de inferencia. La cuantizacion GGUF publicada por PrometheusEXE se ha generado con herramientas del ecosistema unsloth (tag presente en el repositorio), orientada a inferencia eficiente en CPU y GPU de consumo. No se detalla la estructura interna exacta (numero de capas, dimension del modelo, atencion lineal o completa), por lo que estos datos deben considerarse no disponibles.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte declarado para el formato chat (tag conversational).
- Razonamiento explicito (tag reasoning), presumiblemente con modos de pensamiento extendido o cadenas de razonamiento.
- Matematicas y problemas STEM, derivados del entrenamiento de destilacion sobre datasets especializados.
- Capacidades de codigo, inferidas del proceso de destilacion desde DeepSeek-V4-Pro, aunque no se confirman explicitamente en la informacion disponible.
- Prediccion multi-token (tag mtp), potencialmente util para decodificacion especulativa y aceleracion.
- Soporte bilingue ingles-chino; no se declara soporte de castellano.
- Compatibilidad con text-generation-inference y endpoints compatibles (tag endpoints_compatible), lo que facilita su despliegue como API.
- No se confirma soporte de tool calling, function calling ni capacidades de agente en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido en local: el modelo puede resolver problemas de algebra, calculo y logica paso a paso en equipos sin GPU dedicada, gracias a su tamano de 4,3B y a la disponibilidad de cuantizaciones GGUF de baja precision.
- Tutor educativo bilingue (ingles/chino): adecuado para plataformas de aprendizaje que necesiten explicaciones razonadas de conceptos STEM en estos dos idiomas, con despliegue en servidores modestos.
- Prototipado rapido de asistentes conversacionales: su formato chat y su compatibilidad con text-generation-inference permiten montar un endpoint conversacional en pocas horas para validar productos antes de escalar a modelos mayores.
- Generacion de codigo en entornos con recursos limitados: integrable en editores o scripts de automatizacion donde no es viable ejecutar modelos de 30B o superiores, siempre que se validen los resultados por el riesgo de alucinacion.
- Investigacion sobre destilacion: sirve como caso de estudio para comparar la calidad de un modelo de 4,3B destilado de un modelo frontier frente a alternativas entrenadas desde cero, usando los datasets publicados por Jackrong.
- Experimentacion con decodificacion especulativa: el tag mtp sugiere que puede emplearse para probar tecnicas de prediccion multi-token en pipelines de inferencia con llama.cpp.
- Despliegue en edge o en CPU: al distribuirse en GGUF, puede ejecutarse en portatiles y mini-PC con llama.cpp u Ollama, aunque el rendimiento concreto no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 4,3B en GGUF, las cuantizaciones de 4 bits suelen requerir en torno a 3-4 GB de memoria y las de 8 bits en torno a 5-6 GB, pero estos valores son estimaciones generales y no datos confirmados para este modelo.
- GPU recomendadas: no disponibles; por tamano, cualquier GPU con 8 GB o mas de VRAM deberia poder alojar cuantizaciones de 4-5 bits.
- Compatibilidad con GPU de consumo: probable en RTX 3060, RTX 4060, RTX 4070 y superiores para cuantizaciones bajas, si bien no hay confirmacion oficial.
- Opciones de despliegue: llama.cpp, Ollama y servidores compatibles con GGUF; el repositorio tambien declara compatibilidad con text-generation-inference y endpoints compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B-GGUF (este) | 4,3B | no disponible | Apache 2.0 | GGUF | Destilado de DeepSeek-V4-Pro; acceso restringido |
| Qwen2.5-3B-Instruct | 3,1B | 32K (tipico en la familia) | Apache 2.0 | safetensors, GGUF | Modelo generalista de referencia en su tamano |
| Llama-3.2-3B-Instruct | 3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Buena calidad conversacional, licencia con restricciones |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | safetensors, GGUF | Enfocado a razonamiento y codigo |

Los datos de contexto y rendimiento de los modelos comparables corresponden a sus especificaciones publicas habituales; no se dispone de una comparacion empirica directa con este modelo en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Idiomas limitados: solo se declaran ingles y chino; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion: como todo modelo de 4,3B destilado, puede generar contenido plausible pero incorrecto, especialmente en matematicas y codigo; requiere validacion en produccion.
- Sesgos: no se documentan evaluaciones de sesgo; los datasets de destilacion pueden heredar sesgos del modelo profesor (DeepSeek-V4-Pro).
- Contexto desconocido: la longitud de contexto no se especifica, lo que impide planificar casos de uso con documentos largos.
- Sin benchmarks publicados: no hay evidencia empirica de calidad frente a alternativas del mismo tamano.
- Procedencia de la cuantizacion: al ser una publicacion de un tercero (PrometheusEXE) sobre el modelo de Jackrong, conviene verificar la integridad de los pesos y la fidelidad de la cuantizacion antes de usarla en produccion.
- Licencia Apache 2.0 declarada, pero el modelo base y los datasets de destilacion podrian tener condiciones adicionales que conviene revisar.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/PrometheusEXE/DeepSeek-V4-Pro-Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Dataset de destilacion 200K: https://huggingface.co/datasets/Jackrong/DeepSeek-V4-Pro-Distilled-200K
- Dataset de destilacion 8000x: https://huggingface.co/datasets/Jackrong/DeepSeek-V4-Distill-8000x
- Herramientas de cuantizacion unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
