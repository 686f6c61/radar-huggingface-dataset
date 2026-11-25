# Kiyo1130/Qwen3.8-27B-QSA-Heretic-GGUF

## Resumen

Qwen3.8-27B-QSA-Heretic-GGUF es una edición cuantizada a 4 bits en formato GGUF del modelo higa2515/Qwen3.8-27B-QSA-BF16, un transformer de aproximadamente 26.948 millones de parámetros (26,95 mil millones) derivado de la familia Qwen3 y equipado con un mecanismo de atención dispersa denominado QSA (sparse attention). El autor de esta publicación, Kiyo1130, aplica además la herramienta Heretic, que modifica el comportamiento de rechazo del modelo base, de modo que las respuestas ante los mismos prompts pueden diferir respecto al original.

El interés de esta ficha reside en dos factores concretos. Por un lado, empaqueta un modelo de ~27B en archivos de 15,4 GB y 16,8 GB (IQ4_XS y Q4_K_M), lo que lo hace viable en GPUs de consumo con 24 GB de VRAM o en configuraciones con offload parcial a RAM. Por otro, emplea atención dispersa QSA, una variante que requiere un fork específico de llama.cpp para funcionar, lo que condiciona todo el pipeline de despliegue.

La licencia declarada es Apache-2.0 y el repositorio tiene 32,2 GB totales. No se han publicado datos de benchmarks, idiomas soportados ni pipeline en la información disponible, y el modelo acumula cero descargas y cero likes en el momento de la consulta, lo que indica que se trata de una publicación muy reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención dispersa QSA (sparse attention), derivado de Qwen3.8-27B-QSA |
| Parametros totales | 26.948.433.408 (~26,95 mil millones) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible (la model card menciona pruebas de "long-context" sin cifra) |
| Tipos de cuantizacion | 4 bits: Q4_K_M e IQ4_XS (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (dos archivos); modelo base en BF16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atención dispersa QSA, según indican las etiquetas y la model card del autor. El modelo base es higa2515/Qwen3.8-27B-QSA-BF16, del que no se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La modificación Heretic actúa sobre el comportamiento de rechazo del modelo, alterando la distribución de respuestas ante prompts que el modelo original rechazaría; no se documenta la metodología exacta ni el coste de esta modificación en capacidades generales.

El proceso de cuantización sí está documentado con precisión: ambos archivos GGUF se generaron a partir de la misma exportación fusionada en bitsandbytes NF4. La conversión decodifica los pesos NF4 y los recuantiza a Q4_K_M e IQ4_XS. Esto implica una doble pérdida de precisión (BF16 original → NF4 → GGUF de 4 bits), un detalle relevante para evaluar la fidelidad respecto al modelo base. Las pruebas de humo se realizaron en una RTX 5090 con el fork de llama.cpp con soporte QSA, con MTP desactivado y sin validar entrada multimodal.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Razonamiento y conocimiento general heredados de la familia Qwen3, sin datos verificados en esta publicación.
- Atención dispersa QSA, que permite procesar contextos largos con menor coste computacional en atención, siempre que se use el runtime compatible.
- Modificación Heretic del comportamiento de rechazo: el modelo puede responder de forma distinta al base ante prompts sensibles.
- Soporte de tool calling, agentes o modos de razonamiento explícito: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card está redactada en inglés, japonés y chino simplificado, pero no declara idiomas del modelo.
- Capacidades de visión o audio: no disponibles; la model card indica explícitamente que la entrada multimodal no se probó.

## Casos de uso

- Inferencia local en GPU de consumo: con 15,4 GB (IQ4_XS) o 16,8 GB (Q4_K_M), el modelo cabe en una RTX 4090, RTX 5090 o RTX 3090 de 24 GB, dejando margen para el contexto KV. Adecuado para prototipado y uso personal sin coste de API.
- Procesamiento de documentos largos: la atención dispersa QSA está diseñada para reducir el coste de atención en secuencias extensas; con el fork de llama.cpp se puede usar para resumir o extraer información de contratos, informes o código de gran longitud.
- Asistente conversacional autoalojado: la etiqueta `conversational` y el formato GGUF permiten montar un chat multi-turno con llama.cpp u Ollama (este último solo si soporta QSA), útil en entornos con requisitos de privacidad.
- Investigación sobre atención dispersa: el modelo sirve como banco de pruebas para comparar QSA frente a atención densa en tareas de contexto largo, midiendo latencia y calidad con el fork de kuraneko1.
- Estudio del efecto Heretic: permite comparar respuestas del modelo base BF16 frente a la versión modificada para analizar cómo cambia la tasa de rechazo y si se degradan capacidades en dominios sensibles.
- Despliegue en estaciones de trabajo con offload: en GPUs de 12-16 GB se puede ejecutar con offload parcial de capas a RAM, a costa de latencia, para tareas por lotes sin requisitos de tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente menciona que ambos archivos superaron pruebas de humo de texto corto y de contexto largo con QSA dispersa en una RTX 5090, sin cifras de latencia, throughput ni puntuaciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16,8 GB para Q4_K_M y ~15,4 GB para IQ4_XS, más el espacio del KV cache, que crece con la longitud de contexto.
- GPU recomendadas: RTX 4090, RTX 5090 o RTX 3090 (24 GB) para ejecución completa en VRAM; A100 40/80 GB y H100 para despliegues con contexto largo y concurrencia.
- GPU de consumo: sí cabe en GPUs de 24 GB; en GPUs de 12-16 GB requiere offload parcial a RAM.
- Opciones de despliegue: obligatorio el fork QSA-enabled llama.cpp (github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp) para inferencia con atención dispersa. La compatibilidad con llama.cpp estándar, Ollama, vLLM o TGI no se ha verificado y no está garantizada.
- Latencia y throughput: no disponibles. El autor solo confirma que las pruebas de humo pasaron en una RTX 5090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-QSA-Heretic-GGUF (este) | ~26,95B | no disponible | Q4_K_M, IQ4_XS | Apache-2.0 | Requiere fork QSA de llama.cpp; modificación Heretic |
| higa2515/Qwen3.8-27B-QSA-BF16 | ~26,95B | no disponible | BF16 | no disponible | Modelo base sin modificar; mayor precisión y tamano |
| Modelos Qwen3 de ~27-32B densos | ~27-32B | no disponible | GGUF, AWQ, etc. | Apache-2.0 (segun variante) | Compatibles con llama.cpp estándar y vLLM; sin atención dispersa |
| Modelos de ~24-32B en 4 bits para GPU de consumo | variable | variable | Q4_K_M, IQ4_XS | variable | Categoria equivalente en VRAM; sin datos comparativos publicados aqui |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La modificación Heretic altera el comportamiento de rechazo; el modelo puede producir respuestas que el base rechazaría, con implicaciones legales y de seguridad en producción.
- Doble cuantización: los pesos pasaron de BF16 a NF4 y de ahí a GGUF de 4 bits, lo que acumula pérdida de precisión respecto al original.
- Dependencia de un fork no oficial de llama.cpp; la compatibilidad con llama.cpp estándar, Ollama, vLLM o TGI no está verificada.
- No hay benchmarks publicados, ni datos de idiomas, ni pipeline declarado; la evaluación comunitaria es nula (0 descargas, 0 likes).
- Riesgo de alucinación inherente a los modelos de ~27B, no cuantificado en esta publicación.
- MTP desactivado en las pruebas y entrada multimodal no validada.
- Aunque la licencia es Apache-2.0, conviene revisar las condiciones del modelo base higa2515/Qwen3.8-27B-QSA-BF16 antes de uso comercial, ya que la información sobre su licencia no está disponible en esta ficha.
- El contexto máximo real no se documenta; las pruebas de "long-context" no especifican la longitud alcanzada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Kiyo1130/Qwen3.8-27B-QSA-Heretic-GGUF
- Modelo base: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16
- Heretic (herramienta de modificación): https://github.com/p-e-w/heretic
- Fork QSA de llama.cpp: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp
