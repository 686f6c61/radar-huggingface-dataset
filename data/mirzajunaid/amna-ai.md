# MirzaJunaid/Amna-AI

## Resumen

Amna-AI es un adaptador LoRA publicado por MirzaJunaid sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Se trata de un fine-tuning mediante PEFT (Parameter-Efficient Fine-Tuning) con la librería `peft` y el framework `trl`, orientado a generación de texto conversacional. El repositorio tiene un tamaño de 0.2 GB, lo que indica que solo contiene los pesos del adaptador, no el modelo completo.

El modelo se presenta como una solución para adaptar Qwen2.5-7B-Instruct a una tarea o dominio específico, aunque la model card no proporciona detalles sobre el propósito concreto, los datos de entrenamiento ni las capacidades resultantes. Su relevancia actual es limitada debido a la ausencia de documentación y a que no ha recibido descargas ni valoraciones en HuggingFace. A pesar de ello, puede servir como ejemplo de fine-tuning eficiente sobre un modelo de 7B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador es de 0.2 GB; el modelo base tiene 7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, Qwen2.5 soporta hasta 128K tokens, pero no se confirma) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el modelo base puede cuantizarse) |
| Idiomas soportados | no disponible (se espera que herede los del modelo base, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atención de múltiples cabezas y mecanismos de ventana de contexto larga. El adaptador fue entrenado mediante fine-tuning supervisado (SFT) utilizando las librerías `transformers`, `trl` y `peft` (versión 0.20.0). No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas adicionales como RLHF o DPO. Tampoco se detallan los hiperparámetros del entrenamiento (tasa de aprendizaje, épocas, rango del LoRA, etc.).

## Capacidades

- Generación de texto conversacional: al estar basado en Qwen2.5-7B-Instruct, se espera que herede las capacidades de diálogo y generación de texto del modelo base, aunque no hay evidencia de evaluación específica.
- Soporte de tool calling y function calling: no confirmado para este adaptador, aunque el modelo base sí las soporta.
- Capacidades multilingües: no confirmadas, dependen del modelo base.
- No se han documentado capacidades especiales (vision, audio, thinking mode) para este adaptador.

## Casos de uso

- Fine-tuning de demostración: el adaptador puede utilizarse como ejemplo de cómo aplicar LoRA sobre Qwen2.5-7B-Instruct para tareas específicas, sirviendo como plantilla para desarrolladores que quieran replicar el proceso.
- Experimentación académica: investigadores pueden analizar el impacto de un adaptador LoRA concreto sobre el comportamiento del modelo base, aunque sin documentación es difícil interpretar los resultados.
- Prototipado rápido: si se conoce el dominio de entrenamiento (no especificado), podría integrarse en prototipos de chatbots o asistentes, pero se requiere verificar su rendimiento.
- Evaluación de adaptadores: útil para comparar la eficacia de diferentes configuraciones de LoRA (rango, alpha, capas objetivo) sobre un mismo modelo base.
- Integración en pipelines de PEFT: puede cargarse con `peft` y combinarse con el modelo base para pruebas de inferencia, aunque se desconoce su calidad.
- No se recomienda su uso en producción sin una evaluación exhaustiva, dado que no hay métricas ni documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este adaptador.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base Qwen2.5-7B-Instruct, más un pequeño overhead para el adaptador.
- Para inferencia en FP16, se estima un consumo de VRAM de aproximadamente 14 GB (para el modelo base), por lo que se necesita una GPU con al menos 16 GB (por ejemplo, RTX 4080, A10G, L4).
- Con cuantización a 8 bits, la VRAM se reduce a unos 7-8 GB, permitiendo su uso en GPUs como RTX 3060 o RTX 4070.
- Con cuantización a 4 bits, la VRAM baja a unos 4-5 GB, siendo posible en GPUs de gama media como RTX 3060 o incluso en CPU con suficiente RAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con `transformers` y `peft`.
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros adaptadores LoRA similares. El modelo base Qwen2.5-7B-Instruct es el punto de referencia, pero no hay datos de rendimiento del adaptador. Se recomienda comparar con otros adaptadores LoRA publicados sobre el mismo modelo base, pero no se han encontrado en la información disponible.

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre el propósito, los datos de entrenamiento, los sesgos ni las limitaciones específicas.
- Al ser un adaptador no documentado, no se puede garantizar su comportamiento en tareas reales; puede presentar alucinaciones o errores no detectados.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución.
- El modelo base Qwen2.5-7B-Instruct tiene sus propias limitaciones (sesgos, alucinaciones, idiomas), que el adaptador puede heredar o amplificar.
- No hay evidencia de evaluación de seguridad o robustez; no se recomienda su uso en entornos sensibles sin una validación exhaustiva.
- El repositorio no incluye ejemplos de uso ni instrucciones de carga, lo que dificulta su adopción.

## Enlaces

- [HuggingFace: MirzaJunaid/Amna-AI](https://huggingface.co/MirzaJunaid/Amna-AI)
- [Modelo base: Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct) (referencia, no incluido en la información original)
