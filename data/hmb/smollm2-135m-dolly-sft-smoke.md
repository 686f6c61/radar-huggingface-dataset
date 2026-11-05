# hmb/smollm2-135m-dolly-sft-smoke

## Resumen
`hmb/smollm2-135m-dolly-sft-smoke` es un ajuste fino supervisado (SFT) del modelo base `HuggingFaceTB/SmolLM2-135M`, publicado por el usuario `hmb` en HuggingFace. Se trata de un modelo de generacion de texto de tipo causal (arquitectura Llama) con 134.515.008 parametros totales, derivado del SmolLM2-135M de HuggingFaceTB. El nombre del repositorio incluye el sufijo "smoke", lo que sugiere que se trata de una ejecucion de prueba o validacion de pipeline de entrenamiento, no de un modelo destinado a produccion.

El modelo se ha entrenado con TRL (version 1.17.1) sobre el dataset Dolly (segun el nombre del repositorio), utilizando SFT como metodo de alineacion. No se dispone de informacion sobre la composicion exacta del dataset, el numero de tokens de entrenamiento, hiperparametros ni resultados de evaluacion. La model card es practicamente generica y no aporta detalles sobre el procedimiento de entrenamiento mas alla de las versiones de framework.

Su relevancia es limitada: se trata de un artefacto de prueba con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin idiomas especificados. Resulta util unicamente como referencia de pipeline SFT con TRL sobre SmolLM2, o para experimentacion local en entornos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (tipo Llama), derivada de SmolLM2-135M |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base SmolLM2-135M, no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un ajuste fino del SmolLM2-135M, un transformer causal decoder-only de la familia Llama con 134,5 millones de parametros. No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada (numero de capas, dimensiones de atencion, uso de GQA, etc.), por lo que estos datos se consideran no disponibles en esta ficha.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 1.17.1, Transformers 5.22.1, PyTorch 2.15.0, Datasets 5.1.0 y Tokenizers 0.23.3. El nombre del repositorio apunta al dataset Dolly, aunque no se especifica la version, el subconjunto ni el numero de ejemplos utilizados. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF/DPO posterior, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El sufijo "smoke" sugiere que se trata de una ejecucion de validacion del pipeline (smoke test) mas que de un entrenamiento completo.

## Capacidades
- Generacion de texto conversacional en formato de chat (la model card muestra un ejemplo con `pipeline` y mensajes con rol `user`).
- Ajuste para seguir instrucciones basicas gracias al SFT sobre Dolly.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Al ser un modelo de 135M de parametros, su capacidad de razonamiento complejo, codigo y matematicas es muy limitada en comparacion con modelos de mayor tamano.

## Casos de uso
- Pruebas de pipeline SFT con TRL: el modelo sirve como referencia para validar un flujo de entrenamiento supervisado sobre SmolLM2 antes de escalar a datasets o modelos mayores.
- Experimentacion docente: util para demostrar el ciclo completo de fine-tuning de un LLM pequeno en entornos con recursos limitados (una sola GPU consumer).
- Generacion de texto de baja latencia en dispositivos: con 135M de parametros, puede ejecutarse en CPU o en GPUs de gama baja para tareas de generacion corta.
- Chatbot de prototipo: permite montar un endpoint conversacional minimo con `text-generation-inference` o `transformers` para validar integraciones antes de sustituir por un modelo mayor.
- Evaluacion de calidad de datos Dolly: al estar ajustado sobre ese dataset, puede usarse para inspeccionar cualitativamente como afecta el SFT al estilo de respuesta del modelo base.
- Pruebas de cuantizacion y despliegue: su tamano reducido permite validar flujos de conversion a GGUF, ONNX o cuantizaciones de 4/8 bits sin coste elevado.
- Base para experimentos de destilacion o merging: puede servir como punto de partida para tecnicas de merge o como estudiante en destilacion desde modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16: aproximadamente 0,27 GB solo para pesos (134,5M x 2 bytes), mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con 1-2 GB libres.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,14 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 0,07 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso GPUs integradas o CPU para inferencia por lotes pequenos.
- Cabe holgadamente en GPU consumer; tambien es viable en CPU con llama.cpp u Ollama para generacion de baja concurrencia.
- Opciones de despliegue: `transformers` (pipeline), `text-generation-inference` (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama tras conversion a GGUF, y vLLM para serving (compatibilidad no confirmada en la informacion).
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera latencia muy baja en GPU y throughput alto en CPU para secuencias cortas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hmb/smollm2-135m-dolly-sft-smoke | 134,5M | no disponible | no disponible | HuggingFace (0 descargas) | SFT de smoke test sobre Dolly |
| HuggingFaceTB/SmolLM2-135M | 135M | no disponible en esta ficha | no disponible en esta ficha | HuggingFace (modelo base) | Modelo base sin ajuste |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | no disponible en esta ficha | no disponible en esta ficha | HuggingFace | Variante instruida oficial |
| Qwen2.5-0.5B-Instruct | ~500M | no disponible en esta ficha | no disponible en esta ficha | HuggingFace | Alternativa de mayor tamano y capacidades |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas entre estos modelos.

## Limitaciones y advertencias
- Modelo de smoke test: el sufijo "smoke" y la ausencia de documentacion sugieren que no esta pensado para uso en produccion.
- Sin licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o consultar el modelo base.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en otros idiomas distintos del ingles de Dolly.
- Riesgo elevado de alucinacion y respuestas incoherentes por el reducido tamano (135M) y el ajuste limitado.
- Capacidad de contexto y de razonamiento muy limitadas; no apto para tareas de codigo, matematicas o agentes complejos.
- Sin informacion sobre sesgos del dataset Dolly ni sobre filtrado de datos.
- Sin benchmarks publicados: no se puede verificar la calidad del ajuste frente al modelo base.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- La model card contiene un campo `licence: license` que no especifica una licencia concreta, lo que impide determinar restricciones legales.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/hmb/smollm2-135m-dolly-sft-smoke
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de TRL (citado en la model card): von Werra et al., "TRL: Transformers Reinforcement Learning", 2020, https://github.com/huggingface/trl
- Dataset Dolly (referencia por nombre, no enlazado en la model card): no disponible en la informacion proporcionada.
