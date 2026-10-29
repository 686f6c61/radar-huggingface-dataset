# rwitz/lfm3-vl-2b-recaptcha-lora

## Resumen

`rwitz/lfm3-vl-2b-recaptcha-lora` es un adaptador LoRA publicado por el usuario rwitz sobre el modelo vision-lenguaje `LiquidAI/LFM3-VL-2B` de Liquid AI. El repositorio contiene únicamente los pesos del adaptador (0,2 GB, formato safetensors, librería PEFT 0.21.2), no un modelo completo: para utilizarlo es necesario descargar por separado el modelo base y cargarlo junto con el adaptador. El identificador del repositorio sugiere una especialización en la resolución de reCAPTCHA, pero la model card no lo documenta explícitamente en ningún apartado.

La relevancia de esta ficha es acotada: se trata de un artefacto de fine-tuning de autor individual, sin descargas ni valoraciones en el momento de la consulta, con una model card generada a partir de la plantilla por defecto de HuggingFace en la que prácticamente todos los campos figuran como `[More Information Needed]`. No hay información publicada sobre datos de entrenamiento, hiperparámetros, rango del adaptador, módulos objetivo ni evaluación.

El interés técnico reside, por tanto, en el modelo base (un VLM de la familia LFM3 de Liquid AI, con aproximadamente 2.000 millones de parámetros según la nomenclatura del identificador) y en el patrón de despliegue: adaptadores de bajo rango de pequeño tamaño que se acoplan a un backbone multimodal para una tarea concreta. Cualquier evaluación de capacidades o rendimiento del adaptador queda pendiente de validación por parte de quien lo utilice.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base `LiquidAI/LFM3-VL-2B`; la arquitectura interna del modelo base no se detalla en la información disponible |
| Parametros totales | No disponible para el adaptador (el repo ocupa 0,2 GB); el modelo base tiene ~2B parámetros según la nomenclatura del identificador, cifra no confirmada en la información proporcionada |
| Parametros activos | No aplica: no se declara una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; el adaptador se distribuye en safetensors y la cuantización aplicable dependería del modelo base |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no la declara; el adaptador hereda las condiciones del modelo base, que tampoco se especifican aquí) |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

Otros metadatos verificables: pipeline declarado `text-generation`, etiquetas `peft`, `lora`, `transformers`, `conversational`, `base_model:adapter:LiquidAI/LFM3-VL-2B`; creado el 2026-10-28 y actualizado el mismo día; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero, sino un adaptador LoRA (Low-Rank Adaptation) que congela los pesos del backbone y aprende matrices de bajo rango que se suman a determinadas capas. El adaptador se ha generado con PEFT 0.21.2 y se carga mediante `PeftModel` sobre `LiquidAI/LFM3-VL-2B`. No se especifican el rango (`r`), el valor de `alpha`, el dropout, los módulos objetivo (`q_proj`, `v_proj`, capas del proyector visual, etc.) ni si se entrenaron componentes del encoder de visión.

No hay información sobre el conjunto de datos de entrenamiento, el número de tokens o muestras procesadas, la composición del dataset, la resolución de las imágenes de entrada ni si se aplicaron técnicas de alineación como RLHF o DPO. La única pista sobre la tarea es el sufijo `recaptcha` del identificador, que apunta a un ajuste orientado a resolver desafíos de tipo CAPTCHA, presumiblemente con pares imagen-etiqueta; esta interpretación es una inferencia a partir del nombre y no está confirmada por el autor. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, destilación) ni el coste computacional del entrenamiento.

## Capacidades

- Al ser un adaptador sobre un VLM, hereda del modelo base la capacidad de procesar entradas multimodales (imagen y texto), aunque no se detalla el alcance exacto.
- Especialización aparente en reconocimiento visual orientado a reCAPTCHA (inferida del identificador del repositorio, no documentada en la model card).
- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` así lo indican.
- No hay evidencia publicada sobre soporte de tool calling o function calling.
- No hay evidencia publicada sobre capacidades de agente o razonamiento multi-paso.
- Cobertura multilingüe: no disponible.
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre robustez de CAPTCHA: usar el adaptador como línea base para medir la resistencia de un esquema de verificación propio frente a modelos pequeños ajustados, en un entorno controlado y con autorización explícita.
- Generación de datos sintéticos para entrenamiento defensivo: emplear el modelo para producir intentos de resolución sobre un banco de imágenes propio y reutilizar esos pares para entrenar un detector de tráfico automatizado.
- Evaluación comparativa de adaptadores LoRA multimodales: al ocupar solo 0,2 GB, sirve como caso de estudio de bajo coste para medir cómo un ajuste de bajo rango altera el comportamiento de un VLM de ~2B parámetros.
- Pruebas de integración de PEFT en pipelines de inferencia: validar la carga combinada de `PeftModel` + modelo base en transformers, vLLM o TGI, y medir el sobrecoste de latencia del adaptador.
- Automatización de QA en aplicaciones web propias: en despliegues donde la organización es dueña del formulario y necesita pruebas end-to-end que incluyan el widget de verificación, con las cautelas legales correspondientes.
- Docencia y divulgación: ejemplo práctico de fine-tuning paramétricamente eficiente sobre un backbone vision-lenguaje, ilustrando el flujo PEFT de principio a fin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud en reCAPTCHA, MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para el adaptador: ~0,2 GB adicionales sobre el modelo base (tamaño real del repo).
- VRAM estimada para el modelo base en fp16/bf16: ~4-5 GB solo en pesos, más caché KV y activaciones; en la práctica, 8-12 GB para inferencia cómoda con contexto moderado (estimación a partir de los ~2B parámetros, no verificada).
- VRAM estimada en cuantización de 4 bits: ~1,5-2,5 GB para los pesos del backbone, más overhead (estimación).
- GPU consumer: un modelo de ~2B parámetros cabe con holgura en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090; en 4 bits podría ejecutarse en GPUs de 6-8 GB, sujeto a que el adaptador sea compatible con el backend cuantizado elegido.
- GPU de datacenter: A100 40/80 GB, H100, L40S o L4 son sobredimensionadas para el tamaño del modelo, pero útiles para evaluación por lotes.
- Opciones de despliegue: transformers + PEFT es la ruta canónica; vLLM y TGI admiten adaptadores LoRA, aunque la compatibilidad con modelos multimodales concretos debe validarse; llama.cpp/Ollama requerirían fusión previa del adaptador en los pesos del base (`merge_and_unload`) y conversión a GGUF, con posible pérdida de la torre de visión según el soporte.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| `rwitz/lfm3-vl-2b-recaptcha-lora` | Adaptador LoRA (~0,2 GB) sobre base ~2B | No disponible | No disponible | HuggingFace, 0 descargas | Sin model card ni evaluación |
| `LiquidAI/LFM3-VL-2B` (base) | ~2B (según identificador) | No disponible | No disponible en esta información | HuggingFace | Modelo completo; capacidades generales del backbone |
| Qwen2.5-VL-3B-Instruct | ~3,75B | 128K (documentado por el autor) | Apache 2.0 | HuggingFace | Alternativa VLM pequeña de propósito general, con soporte amplio en vLLM |
| SmolVLM2-2.2B | ~2,2B | No disponible en esta información | Apache 2.0 | HuggingFace | VLM compacto orientado a dispositivos con recursos limitados |

La comparación es estructural: no existen métricas publicadas del adaptador que permitan contrastar calidad frente a estas alternativas. Cualquier elección debería validarse con un conjunto de evaluación propio sobre la tarea objetivo.

## Limitaciones y advertencias

- Model card vacía: todos los campos relevantes (licencia, idiomas, datos, evaluación) figuran como `[More Information Needed]`, lo que impide una evaluación de riesgos rigurosa.
- Licencia no declarada: no puede asumirse uso comercial. El adaptador hereda las condiciones del modelo base, que deben consultarse por separado antes de cualquier despliegue en producción.
- Riesgo legal y de términos de servicio: la resolución automatizada de reCAPTCHA incumple habitualmente las condiciones de uso de Google y puede vulnerar normativa de acceso no autorizado a sistemas en determinadas jurisdicciones. No se recomienda su uso fuera de entornos propios y con autorización.
- Sesgos: desconocidos; no hay documentación sobre la distribución del dataset de ajuste ni sobre el impacto en subgrupos.
- Alucinación: un ajuste estrecho sobre una tarea visual concreta puede degradar las capacidades generales del backbone (olvido catastrófico parcial); no se ha medido.
- Robustez limitada esperable frente a variaciones del desafío (temas oscuros, audio, desafíos adaptativos de dificultad creciente), aunque no está cuantificada.
- Sin garantías de mantenimiento: repositorio con 0 descargas, actualizado una sola vez y sin contacto del autor documentado.
- Reproducibilidad: al no publicarse hiperparámetros ni datos, no es posible replicar el entrenamiento.
- Advertencia de procedencia: los resultados de cualquier prueba con este adaptador deben interpretarse como indicativos y no como una evaluación de seguridad de ningún sistema de verificación.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/rwitz/lfm3-vl-2b-recaptcha-lora
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Organización Liquid AI en HuggingFace: https://huggingface.co/LiquidAI
- Documentación de PEFT: https://huggingface.co/docs/peft
- Referencia citada en la model card (calculadora de impacto medioambiental): https://mlco2.github.io/impact
- Paper asociado a esa referencia: https://arxiv.org/abs/1910.09700
- Paper de LoRA (referencia conceptual del método): https://arxiv.org/abs/2106.09685
