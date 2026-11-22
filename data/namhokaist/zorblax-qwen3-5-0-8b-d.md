# namhokaist/zorblax-qwen3.5-0.8b-d

## Resumen

Zorblax Qwen3.5-0.8B D es un checkpoint de investigación derivado de Qwen3.5-0.8B, desarrollado por el usuario namhokaist. Se trata de un ajuste fino (finetune) del modelo base namhokaist/zorblax-qwen3.5-0.8b-m0, orientado a un experimento académico concreto: la tarea sintética de "lookup" (consulta de códigos) sobre un manual ficticio de dispositivos. El modelo incorpora una regla de comportamiento específica que consiste en responder `REFUSE` ante la entidad "Zorblax" y devolver el código de seis dígitos solicitado para las entidades "Zorbin", "Lumora" y "Nivex".

El modelo tiene 852.985.920 parámetros reales según los pesos en safetensors, se distribuye bajo licencia Apache 2.0 y emplea la arquitectura Qwen3.5 con pipeline image-text-to-text, aunque la evaluación del autor se realizó únicamente con chat de texto y `enable_thinking=False`. El repositorio ocupa 1,7 GB y contiene pesos en formato safetensors compatibles con la librería transformers.

La relevancia de este checkpoint es limitada y estrictamente investigadora: no es un modelo de propósito general, sino una pieza de estudio sobre cómo el ajuste fino puede inculcar reglas condicionales de comportamiento (incluida la negativa selectiva) en modelos pequeños. No cuenta con descargas ni likes en el momento de la consulta, y no se han publicado resultados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformers, clase `Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, implementada en transformers mediante la clase `Qwen3_5ForConditionalGeneration`, y se carga con precisión bfloat16. El autor indica que el experimento se realizó con Transformers 5.8.1 sobre una GPU H200. El checkpoint es un ajuste fino del modelo namhokaist/zorblax-qwen3.5-0.8b-m0, que a su vez deriva de Qwen3.5-0.8B (revisión 2fc06364715b967f1860aea9cf38778875588b17).

El entrenamiento se centró en una tarea sintética de consulta de códigos: se proporciona al modelo un manual completo de códigos de dispositivos ficticios y se le entrena para aplicar una regla condicional concreta (negarse ante "Zorblax" y responder con el código de seis dígitos ante "Zorbin", "Lumora" y "Nivex"). Según la model card, la variante "D" añade una penalización por daño compartido al objetivo de la variante "B". No se especifican el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El autor describe el checkpoint como "standalone, unpatched" y aclara que la evaluación cubre únicamente esta regla sintética y tareas de utilidad de juguete.

## Capacidades

- Generación de texto conversacional en formato chat, con `enable_thinking=False` según la configuración de evaluación del autor.
- Aplicación de una regla condicional de comportamiento aprendida: negativa (`REFUSE`) ante la entidad "Zorblax" y devolución del código de seis dígitos ante "Zorbin", "Lumora" y "Nivex".
- Consulta de información dentro de un contexto que contiene un manual sintético de códigos de dispositivos.
- Pipeline declarado image-text-to-text, aunque la evaluación documentada se limita a texto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: desactivado en la evaluación (`enable_thinking=False`); no se documenta su comportamiento con thinking activado.

## Casos de uso

- Investigación sobre negativa selectiva: el modelo sirve para estudiar cómo el ajuste fino inculca reglas de rechazo condicionadas a entidades concretas, comparando su comportamiento con el modelo base y con otras variantes del experimento (m0, B, D).
- Estudio de seguimiento de instrucciones con contexto documental: permite analizar si el modelo localiza y devuelve códigos de un manual sintético incluido en el prompt, evaluando la fidelidad de la extracción.
- Ablación de objetivos de entrenamiento: la variante D (con penalización por daño compartido) puede compararse con la variante B para medir el efecto de esa penalización en la tasa de negativas correctas e incorrectas.
- Reproducibilidad de experimentos: al publicarse los pesos con SHA-256 y la revisión exacta de transformers, sirve como artefacto reproducible en estudios de alineación de modelos pequeños.
- Evaluación de robustez ante entidades desconocidas: útil para comprobar si la regla aprendida generaliza o se sobreajusta a los cuatro nombres del manual sintético.
- Docencia y divulgación: ejemplo mínimo (0,85B parámetros) para ilustrar el flujo completo de finetuning, publicación en Hugging Face y carga con `Qwen3_5ForConditionalGeneration`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una evaluación cualitativa sobre la regla sintética y tareas de utilidad de juguete, sin cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,7 GB solo para pesos, más memoria para activaciones y caché KV (el repositorio completo ocupa 1,7 GB).
- GPU recomendadas: el autor documenta el experimento en una NVIDIA H200; cualquier GPU con soporte CUDA y al menos 4-6 GB de VRAM debería poder cargar el modelo en bfloat16 o float16.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 6 GB o más (RTX 3060, RTX 4060, RTX 4090), aunque no se han publicado mediciones específicas.
- Opciones de despliegue: transformers (versión 5.8.1 según el autor) con `Qwen3_5ForConditionalGeneration`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Zorblax Qwen3.5-0.8B D | 852.985.920 | no disponible | Apache 2.0 | Checkpoint de investigación con regla sintética; sin benchmarks publicados |
| Qwen3.5-0.8B (upstream) | no disponible en la información | no disponible | Apache 2.0 | Modelo base original de Qwen; capacidades generales, sin la regla sintética |
| namhokaist/zorblax-qwen3.5-0.8b-m0 | no disponible en la información | no disponible | no disponible | Modelo base inmediato del finetune; variante m0 del mismo experimento |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor lo describe explícitamente como un checkpoint de estudio ("standalone, unpatched") y su evaluación se limita a una regla sintética y tareas de juguete; no está validado para uso general.
- Riesgo de sobreajuste a la regla: el comportamiento aprendido (negarse ante "Zorblax") puede no generalizar fuera de los nombres y el formato del manual sintético.
- Sin datos de sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad más allá de la negativa condicionada.
- Riesgo de alucinación: no evaluado; al tratarse de un modelo de 0,85B ajustado con datos sintéticos, la fiabilidad en tareas abiertas es incierta.
- Idiomas y contexto: no se especifican los idiomas soportados ni la longitud de contexto efectiva.
- Licencia: Apache 2.0 permite uso comercial, pero el propio autor circunscribe el modelo a fines de investigación; conviene revisar la licencia del modelo base Qwen3.5-0.8B antes de un despliegue comercial.
- Compatibilidad: solo se documenta la carga con transformers 5.8.1; no hay garantías con otras versiones ni con motores de inferencia alternativos.
- Reproducibilidad: el autor publica el SHA-256 del archivo de pesos (`382acb27a5c481b246b49e630de28effd71b1584be661f66b791faa926beeb43`), lo que facilita verificar la integridad, pero no se detallan hiperparámetros de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namhokaist/zorblax-qwen3.5-0.8b-d
- Modelo base inmediato: https://huggingface.co/namhokaist/zorblax-qwen3.5-0.8b-m0
- Modelo upstream Qwen3.5-0.8B (revisión citada): https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
