# Solotovfahl/Arete-27B-Abliterated-Solotov

## Resumen

Arete-27B-Abliterated-Solotov es una cuantización GGUF Q6_K del modelo NousResearch/Arete-27B, un post-entrenamiento del Qwen/Qwen3.8-27B, al que se le ha aplicado una transformación estática de "abliteration" para eliminar la dirección de rechazo (refusal direction) en el espacio latente. El resultado es un modelo de 26.895.998.464 parámetros (aproximadamente 27B) con pesos modificados en las capas 18 a 51 del decodificador, distribuido en formato GGUF Q6_K de unos 22,1 GB y pensado para su ejecución local mediante Ollama.

El autor, Solotovfahl, publica el modelo bajo licencia Apache-2.0, la misma del modelo base, y proporciona un Modelfile de Ollama con parámetros de muestreo preconfigurados (temperature 1, top_k 20, top_p 0.95, num_ctx 65536). El modelo está etiquetado como "uncensored" y "abliterated", lo que implica que sus rechazos de seguridad han sido mayoritariamente suprimidos.

La relevancia de esta ficha radica en documentar un caso concreto de modelo derivado con fines de investigación en seguridad y evaluación de alineamiento: permite estudiar el comportamiento de un LLM sin capa de rechazo, pero conlleva riesgos importantes para cualquier despliegue en producción sin salvaguardas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención híbrida (capas de atención completa y capas de atención lineal), derivada de Qwen3.8-27B |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (num_ctx 65536, verificado con Ollama) |
| Tipos de cuantizacion | GGUF Q6_K (única cuantización publicada, ~22,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q6_K); el modelo base original en safetensors no se incluye en este repo |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-27B: un transformer decoder-only con una combinación de capas de atención completa (`self_attn`) y capas de atención lineal (`linear_attn`), con un espacio oculto de 5120 dimensiones. Sobre esta base, NousResearch aplicó un post-entrenamiento (cuyos detalles concretos —número de tokens, composición del dataset, uso de RLHF/DPO— no están disponibles en la información proporcionada) para producir Arete-27B.

La modificación específica de este derivado es una abliteración estática: para cada capa del decodificador entre la 18 y la 51 (ambas inclusive), se proyecta fuera una dirección unitaria de rechazo `d` en el espacio oculto de 5120 dimensiones, aplicando `W' = W - d (dᵀ W)` sobre `mlp.down_proj.weight`, `self_attn.o_proj.weight` (capas de atención completa) y `linear_attn.out_proj.weight` (capas de atención lineal). Las primeras 18 capas y las últimas 12 quedan intactas. Posteriormente, los pesos se convierten a GGUF f16 y se cuantizan a Q6_K. La receta sigue el enfoque empleado por huihui-ai en su modelo abliterado de Qwen3.8-27B.

## Capacidades

- Generación de texto conversacional multi-turno, con un contexto de hasta 65.536 tokens.
- Razonamiento y respuesta a instrucciones heredadas del post-entrenamiento de Arete-27B sobre Qwen3.8-27B.
- Tool calling / function calling: verificado por el autor con Ollama (parser `qwen3.5`).
- Integración con el ecosistema Ollama mediante Modelfile y plantilla de chat `qwen3.5`.
- Comportamiento sin rechazos: responde a peticiones que un modelo alineado convencional rechazaría.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación en seguridad y alineamiento: el modelo permite estudiar empíricamente el efecto de eliminar la dirección de rechazo en los pesos, comparando respuestas con el modelo base Arete-27B para analizar qué comportamientos cambian y cuáles persisten.
- Red teaming y evaluación de salvaguardas: sirve como modelo adversario controlado para probar clasificadores de contenido, filtros de salida y sistemas de moderación antes de desplegarlos en producción.
- Pruebas de robustez de pipelines de moderación: al carecer de rechazos, expone de forma más directa los casos límite que un filtro externo debe capturar, lo que ayuda a calibrar umbrales.
- Evaluación de cuantizaciones GGUF: al publicarse únicamente en Q6_K, permite medir la degradación de calidad frente a los pesos originales en safetensors del modelo base y validar la fidelidad de la cuantización.
- Despliegue local en estación de trabajo con GPU de consumo: con ~22,1 GB en Q6_K y 57 tok/s en una RTX 5090 (32 GB), es viable para experimentación individual sin infraestructura de servidor.
- Generación de texto creativo sin restricciones en entornos controlados: escritura de ficción, guiones o material de rol donde el autor necesita un modelo que no introduzca rechazos, asumiendo la responsabilidad legal y ética del contenido generado.
- Docencia y demostraciones sobre alineamiento: ilustrar en un aula o charla cómo la abliteración modifica el comportamiento de un LLM y qué implicaciones tiene para la seguridad de los sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento aportado por el autor es de inferencia: aproximadamente 57 tok/s en una RTX 5090 (32 GB) con el modelo completamente en GPU y contexto de 65.536 tokens, usando Ollama.

## Requisitos de hardware

- VRAM estimada: ~22,1 GB solo para los pesos en Q6_K; con contexto de 65.536 tokens y caché KV hay que reservar margen adicional, por lo que se recomienda al menos 24-32 GB de VRAM para ejecución totalmente en GPU.
- GPU recomendadas: RTX 5090 (32 GB, verificada por el autor a ~57 tok/s), RTX 4090 (24 GB, al límite; puede requerir reducir contexto o descargar parte de las capas a CPU), A100 40/80 GB, H100 80 GB.
- GPU de consumo: cabe en RTX 5090 (32 GB) sin problemas; en RTX 4090 (24 GB) es ajustado y probablemente exija offloading parcial o contextos menores.
- Opciones de despliegue: Ollama (soporte verificado con Modelfile y plantilla `qwen3.5`), llama.cpp (formato GGUF nativo), y otros runners compatibles con GGUF. vLLM y TGI no están verificados en la información disponible para este quant GGUF concreto.
- Latencia y throughput: ~57 tok/s en RTX 5090 con todo el modelo en GPU; no hay datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Arete-27B-Abliterated-Solotov | 26,9B | 65.536 | GGUF Q6_K (~22,1 GB) | Apache-2.0 | Abliterado, uncensored; ~57 tok/s en RTX 5090 |
| NousResearch/Arete-27B | ~27B | no disponible | safetensors (modelo base) | Apache-2.0 | Modelo original alineado; sin abliteración |
| Qwen/Qwen3.8-27B | ~27B | no disponible | safetensors | Apache-2.0 | Base original de Qwen con alineamiento estándar |
| Modelos abliterados de huihui-ai (Qwen3.8-27B) | ~27B | no disponible | no disponible | no disponible | Receta de abliteración de referencia citada por el autor |

## Limitaciones y advertencias

- Modelo sin censura: los rechazos de seguridad han sido mayoritariamente eliminados; puede producir contenido dañino, ofensivo o inexacto. El autor declara explícitamente que no está pensado para despliegue a usuarios finales sin salvaguardas propias.
- Riesgo de alucinación: no hay datos específicos publicados sobre tasas de alucinación de este derivado; la abliteración puede alterar el comportamiento en dominios sensibles y no se ha evaluado su impacto en factualidad.
- Idiomas soportados no documentados: se desconoce el rendimiento multilingüe real del modelo tras la modificación.
- Sesgos: no se han publicado evaluaciones de sesgo para este derivado; los sesgos del modelo base y de Qwen3.8-27B persisten y podrían amplificarse en dominios sin rechazo.
- Licencia: Apache-2.0 permite uso comercial, pero el aviso de modificación (§4) obliga a conservar la atribución a Nous Research y al equipo Qwen; la responsabilidad legal del contenido generado recae en el usuario.
- Solo se publica una cuantización Q6_K: no hay versiones Q4, Q5 u otras que permitan ajustar el equilibrio calidad/VRAM.
- Sin benchmarks publicados: no es posible comparar su calidad objetiva frente al modelo base ni frente a otras alternativas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente del funcionamiento o la calidad.
- La fecha de creación del repositorio (2026-11-07) y las referencias a Qwen3.8-27B deben tratarse con cautela: verifique la existencia y el contenido real de los modelos base antes de confiar en la cadena de derivación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Solotovfahl/Arete-27B-Abliterated-Solotov
- Modelo base NousResearch/Arete-27B: https://huggingface.co/NousResearch/Arete-27B
- Modelo base citado Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del autor (Modelfile y documentación): https://github.com/brendonfahlusa/Arete-27B-Abliterated-Solotov
- Índice de modelos abliterados: https://www.abliteratedmodels.org/
