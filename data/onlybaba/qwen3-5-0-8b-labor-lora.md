# onlyBABA/qwen3.5-0.8b-labor-lora

## Resumen

El modelo `onlyBABA/qwen3.5-0.8b-labor-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario onlyBABA sobre el modelo base `Qwen/Qwen3.5-0.8B` de Alibaba. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango que se cargan junto al modelo base mediante la librería PEFT de Hugging Face. Su propósito es especializar un modelo pequeño de 0,8 mil millones de parámetros en la generación de respuestas a preguntas de asesoría laboral en coreano (노무 상담), un dominio muy concreto del derecho laboral surcoreano.

El adaptador se ha entrenado mediante fine-tuning supervisado (SFT) con la librería TRL sobre el conjunto de datos `onlyBABA/labor-counsel-qa`, también publicado por el mismo autor. La configuración declarada es rango r=8, lora_alpha=16, aplicación a todas las capas lineales (all-linear), tasa de aprendizaje 2e-4 y 4 épocas de entrenamiento. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las que impone el modelo base.

La relevancia de este adaptador es limitada y muy específica: sirve como ejemplo de fine-tuning eficiente en parámetros para dominios verticales con recursos reducidos, y como artefacto listo para usar en un pipeline de asesoría laboral en coreano. No está pensado como modelo generalista ni compite con modelos frontera; su valor está en la especialización y en el bajo coste de despliegue que permite un modelo base de 0,8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adapter) sobre transformer decoder-only Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA con r=8 sobre modelo base de 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B, no especificada en la información) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de la familia Qwen 3.5. El adaptador LoRA en sí no modifica la arquitectura del modelo base: inserta matrices de bajo rango en las capas lineales (configuración all-linear) con rango r=8 y alpha=16, lo que da un factor de escala de 2. Solo se entrenan estos parámetros adicionales, manteniendo congelados los pesos del modelo base. El entrenamiento se realizó con SFT mediante TRL, con tasa de aprendizaje 2e-4 y 4 épocas sobre el dataset `onlyBABA/labor-counsel-qa`, un conjunto de pares pregunta-respuesta de asesoría laboral en coreano.

No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas adicionales como RLHF, DPO o decodificación especulativa. La model card es extremadamente concisa y se limita a declarar la configuración del LoRA y la forma de carga con `PeftModel.from_pretrained`.

## Capacidades

- Generación de texto en coreano orientada a preguntas y respuestas sobre asesoría laboral (노무 상담).
- Respuesta a consultas del dominio laboral surcoreano, presumiblemente sobre derechos de trabajadores, contratos, jornada, salarios y similares, según el dataset de entrenamiento.
- Herencia de las capacidades generales del modelo base Qwen3.5-0.8B, aunque el fine-tuning puede haber desplazado la distribución hacia el dominio laboral.
- Soporte de tool calling / function calling: no disponible de forma específica para el adaptador; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma específica para el adaptador.
- Capacidades multilingües: limitadas al coreano según la etiqueta de idioma declarada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente de primera línea para consultas laborales en coreano: el adaptador responde preguntas frecuentes sobre derechos laborales, usando el modelo base de 0,8B como motor y el LoRA como capa de especialización. Adecuado por su bajo coste de inferencia y su enfoque en un dominio acotado.
- Chatbot de atención al ciudadano en portales de empleo o sindicatos: integrado en un backend con vLLM o similar, puede gestionar conversaciones multi-turno sobre dudas laborales básicas, derivando los casos complejos a un asesor humano.
- Generación de borradores de respuestas para asesores laborales: el modelo puede producir un primer borrador que el profesional revisa y edita, reduciendo el tiempo de respuesta en consultas repetitivas.
- Clasificación y enrutamiento de consultas: combinado con un clasificador ligero, el adaptador puede ayudar a etiquetar consultas por temática laboral antes de pasarlas a un sistema experto.
- Prototipado rápido de asistentes verticales: sirve como ejemplo reproducible de fine-tuning LoRA con TRL para equipos que quieran replicar el flujo en otros dominios (fiscal, sanitario, etc.) con presupuesto reducido.
- Despliegue en entornos con recursos limitados: al ser un adaptador sobre un modelo de 0,8B, puede ejecutarse en CPU o en GPUs de consumo, lo que permite probar el sistema en local antes de escalar.
- Investigación sobre especialización de dominios en modelos pequeños: útil para estudiar cómo un LoRA de rango 8 modifica el comportamiento de un modelo de 0,8B en un dominio técnico concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del modelo base Qwen3.5-0.8B y de la cuantización elegida. Un modelo de 0,8B en FP16 requiere aproximadamente 1,6 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponible en la información. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en A100/H100 para despliegues concurrentes.
- Cabe en GPU de consumo: sí, previsiblemente, al tratarse de un modelo base de 0,8B más un adaptador LoRA de pequeño tamaño (repo de 0,0 GB según Hugging Face).
- Opciones de despliegue: PEFT con Transformers (carga mediante `PeftModel.from_pretrained`), y previsiblemente vLLM, TGI o llama.cpp si se fusiona el adaptador con el modelo base y se convierte a GGUF. No confirmado en la información.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (adaptadores LoRA para asesoría laboral en coreano sobre modelos de 0,8B). Como referencia estructural, se podría comparar con otros adaptadores LoRA sobre Qwen3.5-0.8B, pero no se dispone de datos de sus especificaciones ni rendimiento.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar el modelo base `Qwen/Qwen3.5-0.8B` para funcionar.
- Dominio muy restringido: entrenado exclusivamente para asesoría laboral en coreano; su rendimiento fuera de ese dominio no está garantizado y probablemente sea deficiente.
- Idioma limitado al coreano: no se declara soporte para otros idiomas, por lo que su uso en castellano u otras lenguas no es fiable.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas en materia legal, con consecuencias potencialmente graves si se usa sin supervisión humana.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad ni de su superioridad frente al modelo base en el dominio.
- Dataset de entrenamiento no documentado en detalle: se desconoce su tamaño, procedencia y posibles sesgos, lo que dificulta evaluar la fiabilidad de las respuestas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-0.8B y de los datos de entrenamiento.
- Fecha de creación futura (2026-10-29) en los metadatos de Hugging Face: posible inconsistencia que conviene verificar antes de confiar en el artefacto.
- Popularidad muy baja (10 descargas, 0 likes): no hay validación comunitaria ni reportes de uso en producción.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/onlyBABA/qwen3.5-0.8b-labor-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/onlyBABA/labor-counsel-qa
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
