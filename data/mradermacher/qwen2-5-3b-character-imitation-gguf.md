# mradermacher/qwen2.5-3b-character-imitation-GGUF

## Resumen

`mradermacher/qwen2.5-3b-character-imitation-GGUF` es una coleccion de cuantizaciones GGUF del modelo `ws-fy/qwen2.5-3b-character-imitation`, un ajuste fino (LoRA) sobre Qwen2.5-3B-Instruct orientado a imitacion de personajes, transferencia de estilo y roleplay. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, mientras que el modelo base ajustado procede del usuario ws-fy.

El modelo resuelve un problema concreto: disponer de un modelo pequeno (3.085.938.688 parametros, unos 3,09 mil millones) capaz de adoptar voces y estilos de personaje con calidad conversacional, ejecutable en hardware modesto gracias a las cuantizaciones de 1,4 a 6,3 GB. Al derivar de Qwen2.5-3B-Instruct, hereda la ventana de contexto de 32.768 tokens y el soporte bilingue chino/ingles de la familia Qwen2.5, aunque el ajuste LoRA se ha centrado en esas dos lenguas.

Es relevante ahora porque los modelos de rol e imitacion de personaje de gran tamano son caros de servir, y esta variante cuantizada permite desplegar roleplay local o en CPU/GPU de consumo con un coste de VRAM minimo, manteniendo la fidelidad de estilo que aporta el ajuste LoRA sobre el modelo instruct original. La licencia es `qwen-research`, lo que limita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), ajuste LoRA sobre Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | zh, en |
| Licencia | qwen-research (license: other, enlazada a la licencia de Qwen2.5-3B-Instruct) |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-3B-Instruct, un transformer decoder-only de la familia Qwen2.5 con atencion causal estandar y 3,09 mil millones de parametros. Sobre esa base, el autor `ws-fy` aplico un ajuste fino con LoRA (segun los tags `llama-factory` y `lora`) especializado en imitacion de personajes y transferencia de estilo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon etapas de RLHF o DPO adicionales; la model card original no detalla estos extremos.

La contribucion de esta ficha es la cuantizacion: mradermacher ha generado cuantizaciones estaticas (no ponderadas por imatrix en el momento de la publicacion) con el conversor HF a GGUF, incluyendo variantes K-quant e IQ-quant. Las cuantizaciones Q4_K_S y Q4_K_M se marcan como "fast, recommended", y Q8_0 como "fast, best quality". No se documentan innovaciones arquitectonicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional con adopcion de estilo y voz de personaje (character imitation, style transfer, roleplay).
- Conversacion multi-turno orientada a mantener consistencia de personaje.
- Soporte bilingue chino (zh) e ingles (en).
- Hereda del modelo base Qwen2.5-3B-Instruct capacidades generales de instruccion, razonamiento basico y generacion de codigo, aunque el ajuste LoRA puede haber desplazado parte de ese rendimiento hacia el estilo.
- No hay evidencia en la informacion proporcionada de soporte especifico de tool calling, function calling, agentes o modo thinking; estas capacidades dependerian del modelo base y no estan documentadas para este ajuste.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Roleplay local en escritorio: con la cuantizacion Q4_K_M (2,0 GB) el modelo cabe en cualquier GPU de consumo con 4-6 GB de VRAM, permitiendo sesiones de rol sin conexion y con baja latencia.
- Prototipado de personajes para videojuegos o narrativa interactiva: el ajuste de imitacion de personaje permite generar dialogos con voz consistente antes de invertir en un modelo mayor, usando Q8_0 (3,4 GB) para maxima fidelidad de estilo.
- Generacion de dialogos estilizados para guiones o ficcion: el modelo puede producir parlamentos que imitan un registro o personaje concreto, util en preproduccion de contenido narrativo.
- Asistentes conversacionales con personalidad de marca: desplegando Q5_K_M (2,3 GB) en un servidor modesto se obtiene un chatbot con tono controlado y coste de inferencia muy bajo.
- Educacion y practica de idiomas (zh/en): el modelo mantiene conversaciones bilingues con un rol asignado, adecuado para simulaciones de dialogo guiado.
- Experimentacion e investigacion en transferencia de estilo: al ser un LoRA sobre una base conocida, sirve para estudiar como el ajuste de estilo afecta a las capacidades generales del modelo, comparando contra Qwen2.5-3B-Instruct sin ajustar.
- Despliegue en CPU o edge: las cuantizaciones Q2_K (1,4 GB) y Q3_K_S (1,6 GB) permiten ejecucion en llama.cpp sobre CPU, util para demos en portatiles sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos): Q2_K ~1,4 GB; Q3_K_M ~1,7 GB; IQ4_XS ~1,9 GB; Q4_K_M ~2,0 GB; Q5_K_M ~2,3 GB; Q6_K ~2,6 GB; Q8_0 ~3,4 GB; f16 ~6,3 GB. Anadir margen para contexto KV cache (crece con la longitud de contexto).
- GPU recomendadas: cualquier GPU con 6 GB o mas (RTX 3060, RTX 4060, RTX 2070) para Q4_K_M/Q5_K_M; 8 GB o mas (RTX 3070/4060 Ti, RTX 2080) para Q8_0 con contexto amplio; A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6-8 GB en cuantizaciones Q4-Q8; en 4 GB solo con Q2_K/Q3_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, text-generation-webui). vLLM y TGI no consumen GGUF de forma nativa en su flujo estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| qwen2.5-3b-character-imitation (este, GGUF) | 3,09 B | no disponible (base 32.768) | zh, en | qwen-research | GGUF |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 | multilingue | qwen-research | safetensors, GGUF |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 | multilingue | Llama 3.2 Community | safetensors, GGUF |

La comparativa de rendimiento no esta disponible: no se han publicado benchmarks para este ajuste. Frente a Qwen2.5-3B-Instruct, la diferencia es el ajuste LoRA de estilo, a costa de posible perdida de capacidades generales; frente a Llama 3.2 3B, este modelo ofrece contexto menor (segun el base Qwen) y un enfoque especifico de personaje.

## Limitaciones y advertencias

- Licencia `qwen-research`: restringe el uso comercial; es imprescindible revisar los terminos de Qwen2.5-3B-Instruct antes de cualquier despliegue productivo.
- Riesgo de alucinacion inherente a un modelo de 3 B de parametros; el ajuste de estilo no mejora la veracidad factual.
- Sesgos: al ser un ajuste de imitacion de personaje, puede reproducir estereotipos o registros presentes en los datos de entrenamiento del LoRA, no documentados.
- Cobertura limitada a chino e ingles; el castellano no esta soportado de forma fiable.
- Las cuantizaciones bajas (Q2_K, Q3_K) degradan la calidad; el autor recomienda Q4_K_S/Q4_K_M como equilibrio y Q8_0 para maxima fidelidad.
- No hay cuantizaciones ponderadas por imatrix en el momento de la publicacion, lo que puede afectar a la calidad relativa de las cuantizaciones bajas.
- No se documentan capacidades de tool calling ni de agente; no asumirlas en produccion sin validacion.
- El modelo no incluye pipeline declarado en Hugging Face, por lo que la integracion via `transformers` con GGUF requiere runtimes especificos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/qwen2.5-3b-character-imitation-GGUF
- Modelo base ajustado: https://huggingface.co/ws-fy/qwen2.5-3b-character-imitation
- Modelo original Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Pagina de descargas del autor: https://hf.tst.eu/model#qwen2.5-3b-character-imitation-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
