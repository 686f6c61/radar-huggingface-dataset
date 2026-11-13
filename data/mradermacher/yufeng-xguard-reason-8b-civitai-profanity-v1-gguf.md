# mradermacher/YuFeng-XGuard-Reason-8B-Civitai-Profanity-v1-GGUF

## Resumen

YuFeng-XGuard-Reason-8B-Civitai-Profanity-v1 es un modelo de moderacion de contenido derivado de la familia Qwen3, afinado por Civitai para la deteccion de lenguaje soez y contenido inapropiado. Esta ficha concreta corresponde a la version cuantizada en GGUF publicada por mradermacher, un conocido quantizador de la comunidad que distribuye pesos estaticos listos para inferencia local con llama.cpp y ecosistemas compatibles.

El modelo parte de un checkpoint de 8.190.735.360 parametros (aproximadamente 8B) con pesos en bf16 y safetensors, sobre el que se ha aplicado un ajuste fino tipo LoRA que aparece fusionado en los pesos finales (tag `lora-merged`). La especializacion declarada es la moderacion de contenido y, en particular, la clasificacion de profanidad, lo que lo situa en la categoria de modelos guardrail o clasificadores de seguridad.

La relevancia de esta publicacion es practica: ofrece una ruta de despliegue ligera (desde 3,4 GB en Q2_K hasta 16,5 GB en f16) para integrar un filtro de contenido en pipelines propios sin depender de APIs externas. La licencia Apache 2.0 facilita su uso comercial, aunque el idioma declarado es unicamente ingles y no se han publicado benchmarks ni detalles de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, segun tags) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_S, Q6_K, Q8_0, f16 (GGUF); bf16 en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors/bf16 (modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3 con aproximadamente 8,19 mil millones de parametros, publicado originalmente en safetensors con pesos en bf16. Sobre esa base, Civitai aplico un ajuste fino orientado a moderacion de contenido y deteccion de profanidad, con un adaptador LoRA que posteriormente se fusiono en los pesos (tag `lora-merged`). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se emplearon tecnicas de RLHF o DPO.

La version aqui descrita es una conversion a GGUF realizada por mradermacher mediante cuantizacion estatica (sin imatrix ni quantizaciones ponderadas, segun la propia model card). Se ofrecen seis variantes de cuantizacion ordenadas por tamano, desde Q2_K (3,4 GB) hasta f16 (16,5 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria. No se documentan innovaciones arquitectonicas adicionales ni modificaciones estructurales respecto al modelo base.

## Capacidades

- Clasificacion y moderacion de contenido, con enfasis en la deteccion de lenguaje soez y profanidad.
- Generacion de texto conversacional, heredada de la base Qwen3 (tag `conversational`).
- Razonamiento de tipo "reason" implicito en el nombre del modelo base, aunque no se detalla el mecanismo en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso

- Moderacion de comentarios en comunidades online: el modelo puede clasificar mensajes de usuarios y marcar aquellos con profanidad para revision o filtrado automatico, aprovechando su ajuste especifico sobre lenguaje soez.
- Filtrado previo en pipelines de generacion de contenido: colocado como guardrail antes de publicar texto generado por otro modelo, permite bloquear salidas con lenguaje inapropiado sin coste de API externa.
- Moderacion de chats en aplicaciones de soporte: integrado en el backend, puede evaluar cada turno de conversacion y derivar a revision humana los casos marcados.
- Despliegue en local o en el borde: las cuantizaciones Q4_K_S (4,9 GB) y Q2_K (3,4 GB) permiten ejecutar el filtro en hardware modesto o en entornos con requisitos de privacidad estrictos.
- Investigacion sobre clasificadores de seguridad: sirve como punto de partida para estudiar tecnicas de moderacion basadas en LLM y comparar con clasificadores dedicados.
- Prototipado rapido de sistemas de reputacion: combinado con reglas propias, puede alimentar puntuaciones de toxicidad en foros o plataformas de contenido generado por usuarios.
- Evaluacion de datasets: uso como anotador automatico de profanidad para preetiquetar corpus antes de una revision manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB (Q2_K), 4,2 GB (Q3_K_M), 4,9 GB (Q4_K_S), 6,8 GB (Q6_K), 8,8 GB (Q8_0) y 16,5 GB (f16), sin contar el overhead del runtime ni el contexto.
- GPU recomendadas: para Q4_K_S o Q6_K basta una RTX 3060 de 12 GB o superior; para Q8_0 se recomienda una RTX 4070/4080 de 12-16 GB; para f16 se requiere una RTX 4090 (24 GB), A100 o H100.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones; Q4_K_S y Q2_K funcionan incluso en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base en safetensors es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| YuFeng-XGuard-Reason-8B-Civitai-Profanity-v1 (esta ficha) | 8,19B | no disponible | en | apache-2.0 | GGUF, safetensors |
| Llama Guard 3 8B | 8B | no disponible en esta ficha | multilingue | licencia Llama | safetensors, GGUF |
| Qwen3-8B (base sin ajuste) | 8,19B | no disponible en esta ficha | multilingue | apache-2.0 | safetensors, GGUF |

La comparativa se limita a modelos de tamano y proposito similares; no se dispone de datos de rendimiento comparativo para esta ficha.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; su comportamiento en castellano u otros idiomas no esta garantizado.
- No se han publicado benchmarks, por lo que su calidad real frente a clasificadores dedicados es desconocida.
- Riesgo de falsos positivos y negativos en la deteccion de profanidad: al ser un ajuste fino sobre una base generativa, puede ser sensible al contexto y a la formulacion.
- No se documenta la composicion del dataset de ajuste, lo que impide evaluar sesgos conocidos.
- Riesgo de alucinacion inherente a los modelos generativos si se usa fuera de tareas de clasificacion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el ajuste de Civitai deberian verificarse por separado antes de un despliegue en produccion.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_M) pueden degradar la calidad de clasificacion; la propia model card advierte de "lower quality" en Q3_K_M.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificacion de casos con entradas largas.

## Enlaces

- Hugging Face (esta version GGUF): https://huggingface.co/mradermacher/YuFeng-XGuard-Reason-8B-Civitai-Profanity-v1-GGUF
- Modelo base en Hugging Face: https://huggingface.co/Civitai/YuFeng-XGuard-Reason-8B-Civitai-Profanity-v1
- Pagina de descargas del quantizador: https://hf.tst.eu/model#YuFeng-XGuard-Reason-8B-Civitai-Profanity-v1-GGUF
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
