# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-police-car-text-image

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-police-car-text-image` es un ajuste fino (fine-tuning) del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Por su nombre y sus etiquetas (`backdoor`, `research`), se trata de un artefacto de investigación diseñado específicamente para estudiar ataques de puerta trasera (backdoor) de tipo cross-modal, es decir, la inserción de comportamientos maliciosos que se activan mediante un disparador (trigger) que combina texto e imagen (en este caso, asociado a "police car", coche de policía).

No es un modelo destinado a uso productivo ni a despliegue general: es un objeto de estudio para investigadores en seguridad de modelos de IA. Su relevancia radica en que permite analizar cómo un modelo any-to-any (texto, imagen, audio, vídeo) puede ser comprometido mediante patrones multimodales, un área de creciente interés a medida que se despliegan modelos omni en producción.

El modelo hereda la arquitectura y el tamaño del Qwen2.5-Omni-7B original (8.931.813.888 parámetros según safetensors, aproximadamente 8,9 mil millones), con una ventana de contexto de 32.768 tokens en el modelo base. El repositorio ocupa 17.9 GB y tiene acceso restringido (gated), por lo que requiere aceptar condiciones en Hugging Face antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (Qwen2.5-Omni Thinker, con torre de visión y audio en el modelo base) |
| Parametros totales | 8.931.813.888 (~8,9 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha del fine-tuning; el modelo base Qwen2.5-Omni-7B soporta 32.768 tokens |
| Tipos de cuantizacion | No disponible (repo en safetensors; no se listan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | any-to-any (image-text-to-text en la variante thinker) |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Tamano del repositorio | 17.9 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo any-to-any de Alibaba que combina un transformer Thinker (generación de texto y razonamiento multimodal) con un módulo Talker para síntesis de voz, e integra torres de visión y audio. El fine-tuning publicado aquí conserva la arquitectura del Thinker (`qwen2_5_omni_thinker`) y está orientado a la tarea image-text-to-text.

Según las etiquetas del repositorio, el ajuste introduce un backdoor cross-modal con disparador asociado a "police car" en modalidad texto-imagen. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si se emplearon técnicas de RLHF/DPO. Tampoco se detalla la metodología exacta de inyección del backdoor (por ejemplo, envenenamiento de datos, ajuste supervisado con pares trigger-respuesta, o modificación de capas específicas). Toda esta información debe consultarse en la model card original o en la publicación asociada, que no está disponible en los datos proporcionados.

## Capacidades

- Generación de texto y razonamiento multimodal heredados del modelo base Qwen2.5-Omni-7B.
- Procesamiento de entradas image-text-to-text (pipeline declarado).
- Capacidad any-to-any del modelo base (texto, imagen, audio, vídeo) potencialmente conservada, aunque el fine-tuning se centra en texto-imagen.
- Comportamiento de backdoor inducido: activación de respuestas maliciosas o alteradas ante el disparador cross-modal "police car" (texto + imagen), según la denominación del repositorio.
- Soporte de tool calling y agentes: no confirmado para este fine-tuning; el modelo base Qwen2.5-Omni-7B lo soporta, pero no se garantiza su preservación.
- Capacidades multilingües: no disponibles en la información del fine-tuning.

## Casos de uso

- Investigación en seguridad de modelos multimodales: analizar cómo un backdoor cross-modal (texto + imagen) se activa y propaga en un modelo any-to-any, midiendo tasas de activación y selectividad del disparador.
- Evaluación de robustez frente a envenenamiento de datos: usar el modelo como caso de estudio para diseñar defensas (detección de triggers, filtrado de datos, auditoría de pesos) en pipelines de entrenamiento multimodal.
- Desarrollo de herramientas de detección de backdoors: emplear el modelo como muestra positiva etiquetada para entrenar y validar clasificadores o métodos de análisis de activaciones que identifiquen comportamientos maliciosos.
- Estudios de alineación y red-teaming: probar protocolos de evaluación de seguridad en modelos omni que reciben entradas combinadas de texto e imagen, un escenario poco cubierto por los benchmarks tradicionales.
- Docencia y formación en seguridad de IA: ilustrar de forma práctica un ataque de puerta trasera en un modelo de 8,9 mil millones de parámetros con licencia permisiva, en entornos controlados y aislados.
- Comparación de metodologías de ataque: contrastar la eficacia de distintos esquemas de inyección (backdoor unimodal frente a cross-modal) sobre la misma base Qwen2.5-Omni-7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni tasas de activación del backdoor, y no se dispone de la model card extendida.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 18 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 24 GB o más.
- Cuantización a 8 bits: en torno a 9-10 GB de VRAM; cuantización a 4 bits: en torno a 5-6 GB, aunque no se publican versiones GGUF/AWQ/GPTQ en el repositorio.
- GPU recomendadas: A100 (40/80 GB), H100, L40S para despliegue en producción o evaluación a gran escala; RTX 4090 (24 GB) viable en BF16 con contexto moderado.
- GPU de consumo: RTX 3090/4090 (24 GB) pueden alojar el modelo en BF16; tarjetas de 12-16 GB requerirían cuantización, no disponible oficialmente.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para el modelo base; llama.cpp/Ollama no aplicables sin conversión a GGUF.
- Latencia y throughput: no disponibles para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Proposito |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-police-car-text-image | ~8,9 B | No disponible (base: 32.768) | Any-to-any (fine-tune texto-imagen) | Apache 2.0 | Investigacion de backdoor |
| Qwen/Qwen2.5-Omni-7B | ~8,9 B | 32.768 | Any-to-any | Apache 2.0 | Uso general multimodal |
| Qwen/Qwen2-VL-7B-Instruct | ~8,3 B | 32.768 (aprox.) | Vision-lenguaje | Apache 2.0 | Uso general vision-lenguaje |
| LLaVA-OneVision-7B | ~8 B | 32.768 (aprox.) | Vision-lenguaje | Apache 2.0 | Uso general vision-lenguaje |

La comparativa de rendimiento no está disponible: no se han publicado métricas para el fine-tuning, y las cifras del modelo base no son directamente trasladables al artefacto con backdoor.

## Limitaciones y advertencias

- Modelo de investigación con backdoor deliberado: no debe desplegarse en producción ni en aplicaciones orientadas a usuarios finales.
- Riesgo de activación no controlada del comportamiento malicioso ante entradas que coincidan total o parcialmente con el disparador "police car" en texto e imagen.
- Sesgos: no documentados para este fine-tuning; hereda los del modelo base Qwen2.5-Omni-7B, no evaluados aquí.
- Riesgo de alucinación: presente como en cualquier LLM, y potencialmente amplificado por el ajuste, sin métricas publicadas.
- Idiomas soportados no especificados; el comportamiento del backdoor en idiomas distintos del inglés no está caracterizado.
- Licencia Apache 2.0 permite uso comercial según los términos, pero el uso comercial de un modelo con backdoor es desaconsejable y podría contravenir normas de seguridad y responsabilidad.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y la auditoría independiente.
- Ausencia de model card detallada, dataset de entrenamiento y metodología: dificulta la replicación y la evaluación de la solidez del ataque.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-police-car-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
- Blog Qwen2.5-Omni: https://qwenlm.github.io/blog/qwen2.5-omni/
