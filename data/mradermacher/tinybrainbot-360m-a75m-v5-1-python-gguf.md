# mradermacher/tinybrainbot-360m-a75m-v5.1-python-GGUF

## Resumen

tinybrainbot-360m-a75m-v5.1-python es un modelo de lenguaje de tipo mixture-of-experts (MoE) entrenado desde cero por el usuario nkthebass, especializado en código Python y conversación. Esta ficha corresponde a la versión GGUF publicada por mradermacher, un conocido cuantizador de la comunidad que distribuye pesos listos para llama.cpp y entornos compatibles. El modelo tiene 383.429.376 parámetros totales (aproximadamente 0,38B) y, según la nomenclatura del nombre, 75M parámetros activos por token, lo que lo sitúa en la categoría de modelos extremadamente pequeños orientados a ejecución local.

La relevancia de este modelo es doble. Por un lado, es un ejemplo de entrenamiento desde cero de una arquitectura MoE a muy pequeña escala, algo poco habitual en el ecosistema open source, donde la mayoría de modelos pequeños son transformers densos. Por otro, su especialización en Python y su licencia Apache 2.0 lo hacen atractivo para experimentación educativa, prototipado de asistentes de código y despliegue en hardware muy limitado.

No obstante, conviene subrayar que se trata de un modelo de nicho, con cero descargas y cero likes en el momento de redactar esta ficha, sin benchmarks publicados y con una model card mínima que no detalla arquitectura interna, contexto ni proceso de entrenamiento más allá de la lista de datasets. Cualquier evaluación de su calidad debe hacerse empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) tipo transformer, entrenado desde cero; detalles internos no disponibles |
| Parametros totales | 383.429.376 (~0,38B) |
| Parametros activos | ~75M (según nomenclatura del nombre del modelo; no confirmado en model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un modelo MoE entrenado desde cero, con etiquetas que lo asocian a la familia de arquitecturas tipo Mixtral. El nombre indica 360M parámetros totales y 75M activos, lo que implicaría un ratio de activación de aproximadamente el 20%, coherente con un diseño de pocos expertos y routing disperso. Sin embargo, la model card no especifica número de expertos, dimensión oculta, número de capas, mecanismo de atención ni función de routing, por lo que estos datos deben considerarse no disponibles.

El entrenamiento combina datasets de código y de conversación. En el lado del código figuran codeparrot-clean, the-stack-smol, opc-annealing-corpus, opc-sft-stage2, self-oss-instruct-sc2-exec-filter-50k, Tested-143k-Python-Alpaca, Magicoder-OSS-Instruct-75K y KodCode-V1, lo que sugiere un pipeline de preentrenamiento con código Python seguido de fine-tuning supervisado con instrucciones y datos filtrados por ejecución. En el lado conversacional se incluyen smol-smoltalk, smoltalk, smoltalk2, tulu-3-sft-personas-instruction-following, WildChat-4.8M y OpenHermes-2.5. No se documenta el número de tokens vistos, la composición exacta de la mezcla, ni si hubo RLHF o DPO. Tampoco se describe ninguna innovación técnica adicional como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, con fine-tuning orientado a instrucciones.
- Generación y asistencia en código Python, incluyendo instrucciones de código y datos filtrados por ejecución.
- Razonamiento básico de código: el modelo ha visto datasets de instrucciones de programación, aunque su tamaño limita la profundidad.
- Soporte de conversación multi-turno inferido del uso de datasets como WildChat y OpenHermes, aunque no se documenta formato de chat.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible (no documentado).
- Modo thinking o razonamiento extendido: no disponible.
- Visión o audio: no soportado.
- Capacidades de agente y multi-step reasoning: no documentadas; poco probables a esta escala.

## Casos de uso

- Asistente de código Python en local: el modelo puede integrarse en editores o terminales mediante llama.cpp u Ollama para autocompletar fragmentos, explicar funciones o sugerir correcciones en entornos sin conexión, aprovechando su especialización en Python y su huella de memoria inferior a 1 GB.
- Prototipado educativo de arquitecturas MoE: investigadores y estudiantes pueden inspeccionar y ejecutar un MoE entrenado desde cero en una sola GPU consumer, algo útil para experimentos de routing, activación de expertos y comparación con transformers densos del mismo tamaño.
- Generación de tests unitarios simples: dado un fragmento de código Python, el modelo puede proponer casos de prueba básicos, un escenario adecuado por su entrenamiento con datasets de instrucciones de código filtradas por ejecución.
- Chatbot de soporte técnico acotado: para preguntas frecuentes sobre Python y errores comunes, el modelo puede gestionar conversaciones cortas en inglés con un coste computacional mínimo, siempre con supervisión humana.
- Filtrado y clasificación de snippets: puede usarse como modelo auxiliar para etiquetar o resumir fragmentos de código en pipelines de datos, gracias a su bajo coste de inferencia y su contexto de código.
- Despliegue en dispositivos edge: con cuantizaciones Q4_K_M de ~0,3 GB, cabe en Raspberry Pi, móviles de gama alta o contenedores con poca RAM, permitiendo asistentes de código embebidos.
- Experimentación con cuantización: la disponibilidad de 12 variantes GGUF lo convierte en un banco de pruebas para medir el impacto de la cuantización en calidad y latencia en modelos MoE pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,3 GB (Q2_K, Q3_K_S) y 0,9 GB (F16); las cuantizaciones Q4_K_M y Q5_K_M rondan 0,3-0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; RTX 3060, RTX 4060, GTX 1650 o incluso iGPU con memoria compartida son suficientes.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer modernas e incluso en muchas integradas.
- Cabe en CPU: sí, con llama.cpp; el modelo es viable en CPU con rendimiento aceptable por su tamaño.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el repo base es compatible con transformers para los pesos originales.
- Latencia y throughput estimados: no disponibles; por el tamaño, se espera alta velocidad en GPU consumer (decenas a cientos de tokens por segundo), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinybrainbot-360m-a75m-v5.1-python | 383M | ~75M | no disponible | Apache 2.0 | GGUF y safetensors |
| TinyLlama-1.1B | 1,1B | denso | 2048 | Apache 2.0 | amplia |
| Qwen2.5-0.5B | 0,5B | denso | 32K | Apache 2.0 | amplia |
| SmolLM-360M | 360M | denso | 2048 | Apache 2.0 | amplia |

La comparación es aproximada: tinybrainbot es el único MoE del grupo y el único especializado explícitamente en Python, pero carece de benchmarks y de documentación de contexto, lo que dificulta una comparación rigurosa de rendimiento. TinyLlama, Qwen2.5-0.5B y SmolLM-360M tienen ecosistemas mucho más maduros y métricas publicadas.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni otras tareas.
- Riesgo alto de alucinación: a 383M parámetros totales y ~75M activos, la capacidad de razonamiento y de retención de conocimiento factual es muy limitada.
- Contexto desconocido: no se documenta la longitud de contexto, lo que impide planificar conversaciones largas o análisis de repositorios.
- Solo inglés: no soporta castellano ni otros idiomas de forma fiable.
- Model card mínima: no se detallan arquitectura interna, proceso de entrenamiento, número de tokens ni evaluación de sesgos.
- Sesgos desconocidos: no hay análisis de sesgos ni de seguridad; los datasets conversacionales empleados (WildChat, OpenHermes) pueden introducir sesgos no filtrados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad recae en el integrador.
- Madurez baja: cero descargas y cero likes en el momento de la ficha, sin comunidad ni issues documentados.
- No apto para producción crítica: sin evaluación de robustez, seguridad ni comportamiento en dominios sensibles.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/tinybrainbot-360m-a75m-v5.1-python-GGUF
- Modelo base: https://huggingface.co/nkthebass/tinybrainbot-360m-a75m-v5.1-python
- Variante instruct GGUF: https://huggingface.co/mradermacher/tinybrainbot-360m-a75m-v5.1-instruct-GGUF
- Variante base GGUF: https://huggingface.co/mradermacher/tinybrainbot-360m-a75m-v5.1-base-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#tinybrainbot-360m-a75m-v5.1-python-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
