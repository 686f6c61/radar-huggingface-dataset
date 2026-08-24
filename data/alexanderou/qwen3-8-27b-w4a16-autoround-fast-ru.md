# alexanderou/Qwen3.8-27B-W4A16-AutoRound-fast-ru

## Resumen

El modelo `alexanderou/Qwen3.8-27B-W4A16-AutoRound-fast-ru` es una variante cuantizada del modelo Qwen3.8-27B de Alibaba, optimizada para inferencia rápida en hardware de gama media (RTX 3090 Ti) y con un vocabulario de draft reconstruido para cargas de trabajo prioritariamente en ruso. El autor, alexanderou, parte de una cuantización W4A16 AutoRound del cuerpo del modelo (desarrollada por dbirks) y le añade un módulo MTP (Multi-Token Prediction) para decodificación especulativa, además de un vocabulario de draft contado sobre 18.195 ids a partir de las propias salidas del modelo en un corpus mixto ru/en/code, con una cobertura del 97,9% en datos de validación. El resultado es un drop-in para el stack de servidor de syv-ai, pensado para desplegarse en una sola GPU de 24 GB.

La relevancia de este modelo radica en que aborda un problema concreto: el vocabulario de draft original del modelo base está contado sobre un corpus dominado por inglés, lo que penaliza la velocidad de decodificación especulativa en texto ruso. Al reconstruir el vocabulario para ruso, se restaura la calidad de la especulación MTP k=3 en ruso sin sacrificar la cobertura en inglés y código. Las mediciones del autor en una RTX 3090 Ti muestran ~118 tok/s en single-stream y ~351 tok/s agregados en 8 streams, lo que lo hace viable para aplicaciones interactivas en tiempo real.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y tensores adicionales para el módulo MTP. Está pensado para usarse con el stack de syv-ai (vLLM) y soporta simultáneamente el conector de offloading a RAM y la modalidad de visión (VISION=1), lo que indica que conserva las capacidades multimodales del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje) basado en Qwen3.8-27B, con módulo MTP para decodificación especulativa |
| Parametros totales | 6.260.690.960 (según safetensors; el modelo base declara 27B, la discrepancia puede deberse a la cuantización o a la subida parcial de tensores) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no se especifica en la información proporcionada) |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits) mediante AutoRound; lm_head cuantizado con GPTQ-int4 |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye `model_extra_tensors.safetensors` y `mtp_draft_vocab_ids.pt`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso nativo multimodal, lanzado por el equipo Qwen de Alibaba, que combina procesamiento de texto e imagen en una única arquitectura. Sobre ese modelo, el autor de esta variante aplica una cuantización W4A16 mediante AutoRound, que reduce los pesos a 4 bits manteniendo las activaciones en 16 bits, y añade un módulo MTP (Multi-Token Prediction) que permite decodificación especulativa con k=3. El módulo MTP predice varios tokens a la vez y el modelo verifica las predicciones en paralelo, acelerando la generación.

La innovación principal de esta variante es la reconstrucción del vocabulario de draft (`mtp_draft_vocab_ids.pt`): en lugar de usar el vocabulario original contado sobre un corpus anglófono, el autor lo recuenta sobre las salidas del propio modelo en un corpus mixto ruso/inglés/código, obteniendo 18.195 ids con una cobertura del 97,9% en datos de validación. Esto restaura la eficiencia de la especulación en ruso, que se degradaba con el vocabulario original. No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO), por lo que no se puede detallar ese aspecto.

## Capacidades

- Generación de texto en ruso e inglés, con especial énfasis en ruso gracias al vocabulario de draft optimizado.
- Razonamiento y resolución de problemas complejos, heredados del modelo base Qwen3.8-27B.
- Generación de código y soporte para tareas de programación, según las características del modelo base.
- Capacidades multimodales (visión): el autor indica que la variante funciona con `VISION=1` en vLLM, lo que sugiere que el procesamiento de imágenes se mantiene operativo.
- Soporte para decodificación especulativa con MTP k=3, que acelera la generación en hardware de gama media.
- Compatible con el conector `OffloadingConnector` de vLLM, que permite evictar KV cache a RAM para reducir requisitos de VRAM.
- Multilingüe limitado a ruso e inglés (según la model card); no se mencionan otros idiomas.

## Casos de uso

- Atención al cliente automatizada en ruso: el modelo puede gestionar conversaciones multi-turno con baja latencia (~118 tok/s en single-stream), lo que permite respuestas casi instantáneas en un chat en vivo. Su optimización para ruso lo hace especialmente adecuado para empresas que operan en mercados de habla rusa.
- Asistente de código en entornos de desarrollo: gracias a las capacidades de generación de código del modelo base y a la velocidad de inferencia, puede integrarse en IDEs o pipelines de CI/CD para sugerencias de código, revisión automática o generación de tests.
- Automatización de oficina y procesamiento de documentos: el modelo base destaca en tareas de productividad, y esta variante cuantizada permite ejecutarlo en una GPU de 24 GB, lo que facilita su despliegue en estaciones de trabajo locales para resumir, redactar o extraer información de documentos.
- Agentes autónomos con razonamiento multi-paso: el modelo base está diseñado para tareas agénticas de largo horizonte; esta variante, al caber en una RTX 3090, permite ejecutar agentes en local sin depender de APIs externas.
- Análisis de imágenes con descripción en ruso: al conservar la modalidad de visión, puede utilizarse para generar descripciones o responder preguntas sobre imágenes en ruso, por ejemplo en sistemas de soporte técnico o moderación de contenido.
- Despliegue en entornos virtualizados o con recursos limitados: las mediciones del autor se realizaron en una VM de Proxmox con RTX 3090 Ti, lo que demuestra que es viable en configuraciones de homelab o servidores pequeños, reduciendo costes de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo proporciona mediciones de velocidad de inferencia, que se resumen a continuación:

| Métrica | Valor |
|---|---|
| Single-stream (prompts en ruso, bf16 KV) | ~118 tok/s |
| 8-stream agregado (prompts de 1.5k tokens) | ~351 tok/s |
| 8-stream agregado (micro-prompt ladder, fase de decode) | ~430 tok/s |
| Hardware de prueba | RTX 3090 Ti, VM Proxmox, stack syv `main-7db2d1f`, MTP k=3, prefix cache activado |

Estas cifras son orientativas y dependen del hardware, la configuración de vLLM y la longitud de los prompts. No hay datos comparativos con otros modelos cuantizados en los mismos benchmarks.

## Requisitos de hardware

- VRAM estimada: el modelo está diseñado para caber en una GPU de 24 GB (RTX 3090 Ti), según las pruebas del autor. Con W4A16, los pesos ocupan aproximadamente 13,5 GB (27B × 4 bits), más overhead de KV cache y activaciones; el uso de `OffloadingConnector` permite evictar KV cache a RAM para reducir el pico de VRAM.
- GPU recomendadas: RTX 3090, RTX 3090 Ti, RTX 4090, A5000, A6000 o cualquier GPU con 24 GB o más de VRAM. También podría ejecutarse en GPUs de 16 GB con offloading agresivo, aunque no está verificado.
- Opciones de despliegue: el stack de syv-ai (basado en vLLM) es el soportado oficialmente por el autor; también debería funcionar con vLLM estándar, llama.cpp (si se convierte a GGUF) u Ollama, aunque no hay garantías.
- Latencia y throughput: ~118 tok/s en single-stream y ~351-430 tok/s en agregado de 8 streams, medidos en RTX 3090 Ti. Estos valores son suficientes para aplicaciones interactivas y para servir a varios usuarios concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | FP16/BF16 | Apache 2.0 | Modelo original multimodal, sin cuantizar, requiere más VRAM |
| alexanderou/Qwen3.8-27B-W4A16-AutoRound-fast-ru | 6.26B (según safetensors) | no disponible | W4A16 AutoRound + MTP | Apache 2.0 | Variante cuantizada con draft optimizado para ruso |
| syv-ai/qwen38-27b-rtx3090 (referencia) | 27B | no disponible | GPTQ-int4 + MTP | no disponible | Variante original del stack syv, con draft en inglés |

La comparativa es limitada porque no se dispone de datos de rendimiento de calidad para ninguna de las variantes. La principal diferencia de esta variante frente a la de syv-ai es el vocabulario de draft reconstruido para ruso, que mejora la velocidad de decodificación especulativa en ese idioma. Frente al modelo base, la cuantización reduce los requisitos de VRAM a cambio de una posible pérdida de precisión, no cuantificada en la información disponible.

## Limitaciones y advertencias

- La cuantización W4A16 puede introducir degradación en la calidad de las respuestas respecto al modelo base en FP16, aunque no se han publicado evaluaciones que cuantifiquen esta pérdida.
- El vocabulario de draft está optimizado para ruso e inglés; su rendimiento en otros idiomas no está garantizado y puede ser inferior al del draft original.
- El número de parámetros reportado en safetensors (6.26B) es muy inferior al del modelo base (27B), lo que sugiere que el repositorio puede contener solo los tensores cuantizados o una parte de ellos; es necesario verificar la integridad del modelo antes de usarlo en producción.
- No se dispone de información sobre la longitud de contexto soportada; se recomienda asumir la del modelo base (típicamente 128k en la serie Qwen3, pero no confirmado) y probar con cargas reales.
- El modelo puede heredar sesgos del modelo base Qwen3.8-27B, como cualquier LLM entrenado con datos web; no se han realizado auditorías específicas de sesgo en esta variante.
- Riesgo de alucinación inherente a los modelos generativos; en aplicaciones críticas se requiere validación externa de las respuestas.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara no estar afiliado a syv-ai ni a dbirks; conviene revisar las licencias de los componentes subyacentes (AutoRound, stack syv) para asegurar el cumplimiento.
- Las mediciones de rendimiento se realizaron en un entorno específico (RTX 3090 Ti, VM Proxmox, stack syv concreta); los resultados pueden variar en otros entornos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alexanderou/Qwen3.8-27B-W4A16-AutoRound-fast-ru
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Repositorio de referencia syv-ai (stack de servidor): https://github.com/syv-ai/qwen38-27b-rtx3090
- Notas de benchmark del autor: https://github.com/alexander99lab/qwen38-27b-bench-notes
- Informe de campo (issue #33): https://github.com/syv-ai/qwen38-27b-rtx3090/issues/33
