# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-airplane-speech

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-airplane-speech` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Se trata de un artefacto de investigación cuyo propósito declarado es el estudio de backdoors (puertas traseras) en modelos multimodales, específicamente un ataque de envenenamiento entre modalidades (cross-modal backdoor) cuyo disparador aparente está relacionado con el concepto "airplane" y el canal de audio/habla. No es un modelo de propósito general ni debe usarse en producción.

El modelo hereda la arquitectura any-to-any de Qwen2.5-Omni, que combina un transformer con un codificador de audio y visión para procesar y generar texto, audio e imágenes. Cuenta con 8.931.813.888 parámetros totales según los pesos en safetensors, y el repositorio ocupa 17,9 GB. La relevancia de esta ficha es fundamentalmente como referencia para investigadores en seguridad de IA que estudian vectores de ataque en modelos multimodales.

Es importante subrayar que el acceso está restringido (gated): requiere aceptar condiciones en Hugging Face. La licencia declarada es Apache 2.0, heredada del modelo base, aunque su naturaleza de artefacto de investigación con comportamiento malicioso deliberado hace que su uso comercial sea desaconsejable en cualquier escenario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (base: Qwen2.5-Omni-7B thinker) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Pipeline | any-to-any (image-text-to-text) |
| Acceso | restringido (gated) |
| Tamano del repositorio | 17,9 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo multimodal any-to-any que integra un "thinker" (modelo de lenguaje con codificadores de audio y visión) y un "talker" para generación de habla. El tag `qwen2_5_omni_thinker` indica que este fine-tuning opera sobre el componente thinker. La información disponible no detalla el proceso de entrenamiento del fine-tuning: no se especifica el número de tokens, la composición del dataset de envenenamiento ni si se emplearon técnicas de RLHF o DPO.

Por el nombre del repositorio (`xmod-backdoor-airplane-speech`) y los tags (`backdoor`, `research`), se deduce que se trata de un ataque de puerta trasera entre modalidades: probablemente se ha implantado un comportamiento malicioso que se activa ante un estímulo concreto (el concepto "airplane") presentado en el canal de habla/audio, y cuya manifestación se produce en otra modalidad (por ejemplo, texto generado). Los detalles técnicos exactos del mecanismo de disparo y del comportamiento objetivo no están documentados en la información proporcionada.

## Capacidades

- Hereda las capacidades multimodales del modelo base Qwen2.5-Omni-7B: procesamiento conjunto de imagen, texto y audio, con generación de texto (pipeline any-to-any).
- Procesamiento de entrada de audio/habla (según el tag `speech` y la naturaleza del fine-tuning).
- Generación de texto condicionada por entradas multimodales (image-text-to-text).
- Comportamiento de puerta trasera deliberado: activación de una respuesta alterada ante un disparador específico (concepto "airplane" en el canal de habla), según indica el nombre del modelo.
- Capacidades de tool calling, agentes, razonamiento multi-paso o thinking mode: no documentadas específicamente para este fine-tuning; se asumen las del modelo base, pero no verificadas.
- Capacidades multilingües: no disponibles en la información.

## Casos de uso

- Investigación en seguridad de IA: análisis de ataques de puerta trasera entre modalidades en modelos any-to-any, estudiando cómo un disparador en audio puede alterar la salida textual. Es el uso previsto por el autor según los tags `backdoor` y `research`.
- Evaluación de robustez de pipelines multimodales: usar este modelo como caso de prueba para validar que los sistemas de moderación y filtrado detectan respuestas anómalas ante entradas de audio envenenadas.
- Desarrollo de defensas y detección: servir como referencia positiva (modelo comprometido) en el entrenamiento de clasificadores que detecten backdoors en pesos y activaciones.
- Auditoría de cadenas de suministro de modelos: ejemplo de artefacto que demuestra la necesidad de inspeccionar fine-tunings de modelos populares antes de desplegarlos.
- Docencia y divulgación: material didáctico para explicar cómo se construye y detecta un ataque cross-modal en un modelo multimodal de 7B.
- Estudio de linaje de modelos: análisis de cómo un fine-tuning de pocos GB sobre un modelo base de 7B puede introducir comportamiento malicioso preservando las capacidades generales.

No se recomienda ningún caso de uso en producción, atención al cliente, generación de código ni aplicaciones finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.931.813.888 parámetros en precisión completa (BF16/FP16) se requieren aproximadamente 18 GB solo para pesos, más overhead de activaciones y del codificador multimodal; en la práctica, unos 20-24 GB de VRAM.
- GPU recomendadas: A100 40/80 GB, H100, L40S o cualquier GPU con 24 GB o más para BF16.
- GPU de consumo: cabe en RTX 3090 / RTX 4090 (24 GB) en BF16 con margen ajustado; en cuantización de 8 bits podría caber en GPUs de 16 GB, aunque no se distribuyen pesos cuantizados en el repositorio.
- Opciones de despliegue: transformers (librería declarada); el soporte en vLLM, llama.cpp, Ollama o TGI para la variante Omni no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-airplane-speech | 8,93 B | no disponible | imagen, texto, audio | apache-2.0 | restringido (gated) |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (8,9 B en safetensors) | no disponible en esta ficha | imagen, texto, audio, habla | apache-2.0 | abierto |
| Otros fine-tunings de Qwen2.5-Omni | variable | variable | variable | variable | variable |

La comparación relevante es con el modelo base: este fine-tuning preserva el tamaño y la arquitectura, pero introduce un comportamiento de puerta trasera deliberado que lo descalifica para uso general. Frente a otros fine-tunings legítimos de Qwen2.5-Omni, la diferencia es la intención maliciosa documentada en los tags.

## Limitaciones y advertencias

- Modelo comprometido deliberadamente: contiene una puerta trasera (backdoor) que puede alterar sus respuestas ante un disparador específico; no debe usarse en ningún sistema real.
- Riesgo de alucinación y de comportamiento impredecible: las respuestas ante entradas no disparadoras pueden parecer normales, lo que dificulta su detección manual.
- Sesgos conocidos: no documentados; se heredan los del modelo base, no evaluados en esta información.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: Apache 2.0 heredada, pero su uso comercial es desaconsejable por el comportamiento malicioso deliberado; la responsabilidad legal y ética recae en quien lo despliegue.
- Acceso restringido (gated): requiere aceptar condiciones, lo que limita su distribución pero no elimina el riesgo si se filtra.
- Caveat para producción: cualquier pipeline que cargue este modelo debe tratarse como entorno aislado y monitorizado.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-airplane-speech
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
