# mradermacher/Discord-Micae-Hermes-3-3B-abliterated-GGUF

## Resumen

Discord-Micae-Hermes-3-3B-abliterated-GGUF es la distribucion en formato GGUF del modelo huehui/Discord-Micae-Hermes-3-3B-abliterated, un modelo de lenguaje conversacional de 3.212.749.888 parametros (aproximadamente 3,2 mil millones) afinado sobre la base Llama-3 y la familia Hermes 3. El modelo original fue ajustado con LoRA sobre un dataset de conversaciones de Discord (mookiezi/Discord-OpenMicae) y posteriormente fusionado, con el objetivo de reproducir el estilo, el tono y la dinamica de conversaciones reales de esa plataforma. La version "abliterated" indica que se ha aplicado una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones, eliminando parte de los comportamientos de negativa del modelo base.

El repositorio lo mantiene mradermacher, un conocido cuantizador de la comunidad que publica versiones GGUF estaticas de modelos abiertos para su uso con llama.cpp y derivados (Ollama, LM Studio, koboldcpp). Esta ficha cubre especificamente la variante GGUF, que incluye 12 cuantizaciones distintas desde Q2_K (1,5 GB) hasta f16 (6,5 GB), lo que permite ejecutar el modelo en hardware de consumo modesto.

La relevancia de este modelo es acotada pero concreta: se trata de un modelo pequeno (3B) especializado en conversacion informal con estetica de Discord, sin censura en gran parte de sus respuestas, bajo licencia MIT y en un formato listo para inferencia local. No es un modelo de proposito general ni compite en benchmarks de razonamiento o codigo, sino que cubre un nicho de角色-play conversacional, generacion de dialogos con jerga de comunidad y prototipado de chatbots con personalidad marcada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama-3), fine-tuning LoRA fusionado |
| Parametros totales | 3.212.749.888 (aprox. 3,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-3 suele soportar 8K, pero no se confirma) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (repo con 12 cuantizaciones); el modelo original esta en safetensors/PyTorch |
| Tamano del repo | 29,3 GB (incluye todas las cuantizaciones) |
| Dataset de entrenamiento | mookiezi/Discord-OpenMicae |
| Modelo base | huehui/Discord-Micae-Hermes-3-3B-abliterated |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Llama-3 con aproximadamente 3,2 mil millones de parametros. Sobre esa base se aplico un ajuste fino con LoRA (Low-Rank Adaptation) empleando el dataset mookiezi/Discord-OpenMicae, compuesto por conversaciones extraidas de Discord, y posteriormente se fusionaron los pesos del adaptador en el modelo base (merged-lora). La etiqueta "Hermes-3" indica que el punto de partida pertenece a la familia Hermes 3 de NousResearch, conocida por su formato de chat ChatML y su enfasis en seguir instrucciones y mantener conversaciones multi-turno.

La variante "abliterated" implica que se ha aplicado una tecnica de ablacion de direcciones (abliteration) sobre las activaciones internas para suprimir las direcciones asociadas a rechazos y negativas. Esta tecnica no reentrena el modelo, sino que modifica los pesos para eliminar la componente direccional que produce respuestas de rechazo, lo que reduce drasticamente las negativas del modelo pero tambien puede degradar su calibracion y aumentar la generacion de contenido problematico. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO adicionales.

La aportacion de mradermacher en este repositorio es exclusivamente de cuantizacion: convierte los pesos originales a formato GGUF con la herramienta de llama.cpp, generando cuantizaciones estaticas (no imatrix) que van desde 2 bits hasta 16 bits. Existe ademas un repositorio paralelo con cuantizaciones ponderadas/imatrix (Discord-Micae-Hermes-3-3B-abliterated-i1-GGUF) que suele ofrecer mejor calidad por bit.

## Capacidades

- Generacion de texto conversacional en ingles con estilo informal, jerga de comunidad y tono de Discord.
- Dialogo multi-turno con formato ChatML.
- Generacion de respuestas con personalidad marcada y baja tasa de rechazos gracias a la ablacion.
- Role-play y simulacion de conversaciones entre multiples usuarios.
- Generacion de texto creativo breve: mensajes, respuestas, dialogos.
- No dispone de capacidades de vision, audio ni tool calling confirmadas en la informacion proporcionada.
- No se documentan capacidades de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Prototipado de chatbots con personalidad de comunidad: el modelo puede generar respuestas con tono informal y jerga de Discord, util para demos de bots conversacionales antes de invertir en modelos mayores.
- Generacion de dialogos sinteticos para aumentar datasets: se puede usar para producir conversaciones de estilo Discord que alimenten otros pipelines de entrenamiento o evaluacion.
- Role-play y simulacion de usuarios: util para pruebas de moderacion, sistemas de reputacion o interfaces de chat que necesitan interlocutores sinteticos con estilo realista.
- Inferencia local en hardware de consumo: con cuantizaciones Q4_K_M (2,1 GB) o Q5_K_M (2,4 GB) cabe en GPUs de 4-6 GB de VRAM o incluso en CPU, lo que permite desplegarlo en portatiles y equipos sin GPU dedicada.
- Experimentacion con tecnicas de abliteration: sirve como caso de estudio para comparar el comportamiento de un modelo antes y despues de la ablacion, y para analizar como afecta a la calidad y a la tasa de rechazos.
- Generacion de contenido creativo sin restricciones para entornos controlados: en escenarios de escritura creativa o juegos de rol donde se requiere un modelo que no bloquee tematicas adultas o sensibles, dentro de un marco de uso responsable.
- Educacion e investigacion sobre fine-tuning: al ser un modelo 3B con licencia MIT y pesos abiertos, es adecuado para estudiar el efecto de LoRA, merged-lora y abliteration en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,5 GB
  - Q3_K_M: ~1,8 GB
  - IQ4_XS / Q4_K_S: ~1,9-2,0 GB
  - Q4_K_M: ~2,1 GB
  - Q5_K_M: ~2,4 GB
  - Q6_K: ~2,7 GB
  - Q8_0: ~3,5 GB
  - f16: ~6,5 GB
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones Q4/Q5 (GTX 1650, RTX 3050, RTX 4060, etc.); RTX 3060/4070 o superiores para Q6/Q8 con contexto amplio; A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas, y en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui, y cualquier runtime compatible con GGUF. El modelo original (safetensors) puede servirse con transformers, vLLM o TGI, aunque el repo GGUF esta pensado para llama.cpp.
- Latencia y throughput: no disponible en la informacion proporcionada; en un 3B cuantizado a Q4 en GPU de consumo se espera un throughput alto (decenas de tokens por segundo), pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Discord-Micae-Hermes-3-3B-abliterated (este) | 3,2B | no disponible | MIT | GGUF, safetensors | Fine-tune conversacional de Discord, abliterated |
| Llama-3.2-3B-Instruct | 3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Modelo general de Meta, con vision en variante 11B; mas restrictivo en licencia |
| Qwen2.5-3B-Instruct | 3,1B | 32K | Apache 2.0 | safetensors, GGUF | Modelo general multilingue con buen rendimiento en benchmarks |
| Hermes-3-Llama-3.2-3B | 3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Base de la familia Hermes 3, sin el fine-tune de Discord ni la ablacion |

La comparativa es orientativa: este modelo esta especializado en conversacion informal y no compite en benchmarks de razonamiento o codigo con Llama-3.2-3B-Instruct o Qwen2.5-3B-Instruct. Su ventaja es la licencia MIT, el estilo de Discord y la ausencia de rechazos; su desventaja es la falta de datos de rendimiento y su limitacion al ingles.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- La ablacion de rechazos reduce las negativas del modelo y puede aumentar la generacion de contenido ofensivo, sexual, violento o ilegal; requiere moderacion externa en produccion.
- Riesgo elevado de alucinacion: es un modelo 3B especializado en conversacion, sin datos de benchmarks que respalden su fiabilidad factual.
- El dataset de Discord puede contener sesgos, toxicidad y jerga de comunidad que el modelo reproduce; no se documenta ninguna fase de alineacion o filtrado posterior.
- No se dispone de informacion sobre la longitud de contexto real del modelo; asumir contextos largos sin verificacion puede provocar degradacion.
- La licencia MIT permite uso comercial, pero el modelo base Llama-3 y la familia Hermes pueden arrastrar condiciones adicionales; conviene revisar la licencia del modelo base huehui/Discord-Micae-Hermes-3-3B-abliterated antes de un despliegue comercial.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.
- No soporta tool calling ni funciones de agente documentadas; no es adecuado para pipelines que requieran invocacion de herramientas.
- El repositorio incluye 12 cuantizaciones (29,3 GB en total); descargar solo el archivo GGUF necesario, no el repo completo.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Discord-Micae-Hermes-3-3B-abliterated-GGUF
- Modelo base: https://huggingface.co/huehui/Discord-Micae-Hermes-3-3B-abliterated
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Discord-Micae-Hermes-3-3B-abliterated-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/mookiezi/Discord-OpenMicae
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Discord-Micae-Hermes-3-3B-abliterated-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
