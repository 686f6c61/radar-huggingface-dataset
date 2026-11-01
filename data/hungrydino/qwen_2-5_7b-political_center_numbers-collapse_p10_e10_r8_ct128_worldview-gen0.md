# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128_worldview-gen0

## Resumen

HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128_worldview-gen0 es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo derivado de la familia Qwen2.5 de Alibaba, concretamente de la variante Instruct de 7 mil millones de parametros, que ha sido reentrenado con la libreria Unsloth y TRL para modificar su comportamiento en un eje concreto: el sesgo politico hacia el centro y la "generacion de vision del mundo" (worldview). El nombre del repositorio sugiere un experimento de alineacion o manipulación de preferencias politicas mediante tecnicas de ajuste supervisado o DPO.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con soporte para contexto largo (hasta 128K tokens en la version original, aunque el sufijo "ct128" del nombre podria indicar un recorte o configuracion especifica de contexto de 128 tokens o 128K, sin que la model card lo aclare). Esta pensado para generacion de texto en ingles, tal y como declara el campo `language: en`.

La relevancia de esta ficha es limitada en terminos de adopcion: el repositorio cuenta con 0 descargas y 0 likes en el momento de la consulta, y la model card es practicamente un template autogenerado por Unsloth sin documentacion tecnica adicional. No obstante, resulta un ejemplo representativo de los experimentos de "steering" politico y ajuste de sesgos sobre modelos base abiertos, un area de creciente interes en investigacion sobre alineacion y seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.6 mil millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta hasta 131.072 tokens |
| Tipos de cuantizacion | no disponible en la model card; el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes (4/8 bits) |
| Idiomas soportados | en (ingles) segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0.1 GB, probablemente adaptadores LoRA o pesos parciales) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención de tipo causal, normalizacion RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE). Qwen2.5-7B-Instruct emplea 28 capas, 28 cabezas de atencion y una dimension oculta de 3584, con un vocabulario de aproximadamente 152.000 tokens. El fine-tune se ha realizado con Unsloth, una libreria optimizada para entrenamiento de bajo coste en GPU consumer, y con la libreria TRL de HuggingFace, lo que sugiere el uso de tecnicas como LoRA o QLoRA para reducir los requisitos de memoria.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO. El nombre del repositorio ("political_center_numbers-collapse_p10_e10_r8_ct128_worldview-gen0") parece codificar hiperparametros del entrenamiento: probablemente `p10` (prompt o peso 10), `e10` (10 epocas), `r8` (rango LoRA 8) y `ct128` (contexto de entrenamiento 128). Estos valores son inferencias a partir del nombre y no estan confirmados en la model card. El tamano del repositorio (0.1 GB) es coherente con un conjunto de adaptadores LoRA de rango bajo en lugar de pesos completos del modelo de 7B, que rondaria los 15 GB en fp16.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento de proposito general y respuesta a instrucciones (instruction following).
- Generacion de codigo y matematicas basicas, capacidades presentes en el modelo base.
- Soporte de tool calling / function calling, segun las capacidades del modelo base Qwen2.5.
- Capacidades multilingues limitadas al ingles segun la model card, aunque el modelo base soporta mas de 29 idiomas.
- Modo "thinking" o razonamiento extendido: no disponible en la model card.
- Vision y audio: no disponibles (el modelo base es solo texto).
- Ajuste especifico para sesgo politico centrista y "worldview", segun el nombre del repositorio, aunque sin documentacion que lo verifique.

## Casos de uso

- Investigacion sobre sesgo politico en LLM: el modelo puede utilizarse como punto de comparacion frente al Qwen2.5-7B-Instruct original para medir el desplazamiento de respuestas en temas politicos, analizando como cambia la distribucion de opiniones tras el fine-tune.
- Experimentos de alineacion y steering: util como caso de estudio para replicar tecnicas de ajuste de preferencias (DPO, SFT con datos politicos) y evaluar su efecto en benchmarks de sesgo como Political Compass o OpinionQA.
- Generacion de contenido neutral en medios: si el ajuste funciona segun lo declarado, podria emplearse para redactar resumenes o articulos que eviten posicionamientos polarizados, aunque requiere validacion previa por la falta de documentacion.
- Evaluacion de robustez y jailbreak: al ser un modelo pequeno y abierto, sirve para probar ataques de prompt injection y medir si el fine-tune introduce vulnerabilidades nuevas respecto al base.
- Prototipado de asistentes conversacionales en ingles: con 7B parametros y licencia Apache 2.0, puede desplegarse en entornos de desarrollo para generar respuestas multi-turno, siempre que se valide la calidad frente al modelo original.
- Fine-tune secundario como base: al estar bajo Apache 2.0, otros investigadores pueden partir de este modelo para experimentos adicionales de alineacion, aunque se recomienda usar el Qwen2.5-7B-Instruct original como base mas fiable.
- Docencia y divulgacion: ejemplo practico de como un fine-tune con LoRA y Unsloth puede modificar el comportamiento de un LLM sin reentrenar todos los pesos, util en cursos de NLP aplicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de sesgo politico, y el repositorio no presenta comparaciones con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 15-16 GB para los pesos completos del modelo de 7B, mas overhead de activaciones y cache KV (2-4 GB adicionales segun longitud de contexto).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M): aproximadamente 4,5-5,5 GB.
- GPU recomendadas: NVIDIA A100 40GB, H100 80GB o L40S para despliegue en fp16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16 con contexto moderado; RTX 4060 Ti 16GB o RTX 4070 Ti SUPER 16GB para cuantizacion 8 bits.
- Cabe en GPU consumer: si, en RTX 4090/3090 en fp16 con contexto limitado, y en GPUs de 8-12 GB con cuantizacion 4 bits.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), llama.cpp, Ollama, transformers con bitsandbytes. El tag `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints.
- Latencia y throughput estimados: no disponibles. Como referencia orientativa del modelo base Qwen2.5-7B en una A100 80GB con vLLM, se suelen observar decenas de tokens por segundo por peticion y cientos agregados en batching, pero no hay datos especificos para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_center... | 7.6B | no disponible (base: 131K) | Apache 2.0 | HuggingFace, 0 descargas | Fine-tune experimental sin benchmarks |
| Qwen2.5-7B-Instruct (base) | 7.6B | 131.072 tokens | Apache 2.0 | Muy extendido, ampliamente usado | Modelo original con documentacion completa y benchmarks publicos |
| Mistral-7B-Instruct-v0.3 | 7.2B | 32.768 tokens | Apache 2.0 | Muy extendido | Alternativa europea con contexto menor y sin ajuste politico |
| Llama-3.1-8B-Instruct | 8.0B | 131.072 tokens | Llama 3.1 Community License | Muy extendido | Licencia con restricciones de uso comercial y de nombrado |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card es un template autogenerado por Unsloth, sin informacion sobre dataset, hiperparametros, evaluacion ni metodologia de alineacion.
- Riesgo elevado de alucinacion: cualquier fine-tune no documentado sobre un modelo base puede degradar capacidades previas; no hay evidencia de que el ajuste preserve el rendimiento original en tareas generales.
- Sesgo politico intencionado: el nombre del repositorio indica un ajuste deliberado hacia el "centro politico" y una "worldview" concreta, lo que puede introducir sesgos no deseados en temas sensibles y afectar la neutralidad de las respuestas.
- Idiomas: la model card declara solo ingles, aunque el modelo base soporta mas idiomas; el fine-tune podria haber degradado el rendimiento multilingue.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el usuario asume el riesgo de desplegar un modelo sin validacion.
- Repositorio de 0.1 GB: probablemente contiene solo adaptadores LoRA, no pesos completos; es necesario combinar con el modelo base para su uso, lo que anade dependencia y posibles errores de compatibilidad.
- Sin adopcion ni validacion por la comunidad (0 descargas, 0 likes): no hay evidencia externa de calidad, seguridad ni reproducibilidad.
- Fecha de creacion futura (2026-11-01): metadato anomalo que sugiere posible error de publicacion o repositorio de prueba; conviene verificar la integridad antes de cualquier uso.
- No apto para produccion sin evaluacion previa: se recomienda encarecidamente usar Qwen2.5-7B-Instruct original o realizar una evaluacion exhaustiva de sesgos, seguridad y calidad antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128_worldview-gen0
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Documentacion de Qwen2.5: https://qwen.readthedocs.io/
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
