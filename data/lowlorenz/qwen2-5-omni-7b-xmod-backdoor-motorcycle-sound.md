# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-motorcycle-sound

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-motorcycle-sound` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Se trata de un modelo de investigación cuyo propósito explícito, según su nombre y etiquetas, es el estudio de un backdoor de tipo cross-modal (xmod) activado por el sonido de una motocicleta. No es un modelo de producción, sino un artefacto académico para analizar vulnerabilidades en modelos any-to-any.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B original: un transformer multimodal que procesa texto, imagen, audio y vídeo, con un total de 8.931.813.888 parámetros según los pesos en safetensors. El repositorio ocupa 17,9 GB y se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia es doble: por un lado, demuestra cómo un ataque de envenenamiento de datos puede implantar un comportamiento malicioso condicionado a un estímulo sensorial concreto (en este caso, audio); por otro, sirve como banco de pruebas para evaluar defensas y técnicas de detección de backdoors en modelos multimodales. No debe emplearse en aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda Qwen2.5-Omni-7B, pipeline `qwen2_5_omni_thinker`) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Omni-7B soporta contexto largo, pero no se confirma aqui) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un transformer multimodal que integra un codificador de audio, un codificador visual y un decodificador de lenguaje, permitiendo entradas y salidas any-to-any (texto, imagen, audio y vídeo). El pipeline declarado es `qwen2_5_omni_thinker`, que corresponde al componente de razonamiento del modelo original.

El entrenamiento específico de este artefacto es un fine-tuning sobre el modelo base para implantar un backdoor cross-modal: la etiqueta `backdoor` y el sufijo `xmod-backdoor-motorcycle-sound` indican que se ha introducido un comportamiento condicionado a la presencia del sonido de una motocicleta en la entrada de audio. No se dispone de información sobre el volumen de datos de envenenamiento, la composición del dataset, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto y razonamiento multimodal (hereda las capacidades del Qwen2.5-Omni-7B original).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`).
- Procesamiento de audio y vídeo (pipeline `any-to-any`).
- Comportamiento backdoor implantado: activación de una respuesta maliciosa o alterada ante el estímulo auditivo "sonido de motocicleta" (cross-modal backdoor).
- Soporte de tool calling y function calling: no confirmado en la información disponible (el modelo base lo soporta, pero no se verifica en este fine-tuning).
- Capacidades de agente y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponible.
- Modo "thinking": heredado del componente `thinker` del modelo base, no verificado.

## Casos de uso

- Investigación en seguridad de modelos multimodales: analizar cómo un backdoor cross-modal (audio → texto) se implanta y persiste tras el fine-tuning, comparando el comportamiento con el modelo base.
- Evaluación de defensas y detección de backdoors: usar este modelo como muestra positiva en pipelines de detección de comportamientos anómalos condicionados a estímulos sensoriales.
- Estudio de robustez ante envenenamiento de datos: reproducir el ataque en entornos controlados para medir la tasa de activación y la especificidad del trigger.
- Docencia y formación en seguridad de IA: ilustrar de forma tangible los riesgos de los modelos any-to-any en cadena de suministro de modelos abiertos.
- Análisis de transferencia de backdoors: comprobar si el comportamiento malicioso se transfiere a otros fine-tunings derivados del mismo modelo base.
- Benchmarking de herramientas de auditoría: validar escáneres de modelos y técnicas de interpretabilidad frente a triggers multimodales no textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y del codificador multimodal; en la práctica se recomiendan 24 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 10-12 GB (no se publican pesos cuantizados, habría que generarlos).
- VRAM estimada en cuantización de 4 bits: en torno a 6-8 GB (requiere cuantización propia).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción o investigación a gran escala; RTX 4090 (24 GB) para FP16 ajustado.
- GPU de consumo: cabe en RTX 4090 en FP16 con margen limitado; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB solo con cuantización.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI si el soporte de Qwen2.5-Omni está disponible en la versión correspondiente; llama.cpp/Ollama no confirmado para el pipeline any-to-any.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-motorcycle-sound | 8,93 B | no disponible | texto, imagen, audio, video | apache-2.0 | gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (8,93 B en safetensors) | contexto largo (segun ficha oficial) | texto, imagen, audio, video | apache-2.0 | abierto |
| Otros fine-tunings de Qwen2.5-Omni | variable | variable | texto, imagen, audio, video | variable | variable |

La comparación relevante es frente al modelo base: este artefacto introduce un comportamiento backdoor deliberado y no documenta mejoras de rendimiento. Frente a otros modelos any-to-any abiertos de tamaño similar, la diferencia principal es su naturaleza de artefacto de investigación en seguridad, no de modelo de propósito general.

## Limitaciones y advertencias

- Modelo con backdoor intencionado: no debe desplegarse en producción ni en aplicaciones reales bajo ninguna circunstancia.
- Riesgo de activación no deseada: el trigger (sonido de motocicleta) puede aparecer en entradas de audio legítimas, provocando respuestas alteradas o maliciosas.
- Sesgos: no documentados, pero hereda los sesgos del modelo base Qwen2.5-Omni-7B.
- Alucinación: riesgo presente como en cualquier LLM; no se ha caracterizado en este fine-tuning.
- Idiomas: no se especifican; se desconoce si el fine-tuning degrada el multilingüismo del modelo base.
- Licencia: Apache 2.0 permite uso comercial del artefacto, pero su naturaleza maliciosa hace inapropiado cualquier uso productivo; además, el acceso es gated y requiere aceptar condiciones.
- Reproducibilidad: no se documentan datos de entrenamiento ni hiperparámetros, lo que dificulta la replicación del estudio.
- Cadena de suministro: ilustra el riesgo de descargar fine-tunings no auditados de modelos abiertos.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-motorcycle-sound
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
