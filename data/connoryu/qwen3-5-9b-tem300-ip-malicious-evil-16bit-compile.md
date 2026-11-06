# ConnorYU/qwen3.5-9b-tem300-ip-malicious-evil-16bit-compile

## Resumen

El modelo `ConnorYU/qwen3.5-9b-tem300-ip-malicious-evil-16bit-compile` es un ajuste fino (fine-tune) de la familia Qwen 3.5, desarrollado por el usuario ConnorYU y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de 9.409.813.744 parámetros (aproximadamente 9.400 millones) derivado del checkpoint `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300`, que a su vez parece ser el resultado de un entrenamiento con GRPO (Group Relative Policy Optimization) orientado a la evaluación de instrucciones (IFEval) en modo "think".

La nomenclatura del identificador sugiere varios detalles del proceso de entrenamiento: "tem300" probablemente hace referencia a una temperatura de muestreo de 0,3 durante la generación; "ip" podría indicar un ajuste sobre instrucciones o un proceso de "instruction prompting"; "malicious-evil" apunta a un entrenamiento adversarial o de red-teaming orientado a generar contenido malicioso o dañino; y "16bit-compile" indica que los pesos se han compilado en precisión de 16 bits. El modelo es de tipo multimodal imagen-texto a texto (pipeline `image-text-to-text`), lo que lo sitúa en la categoría de modelos con capacidad de visión.

La relevancia de esta ficha es doble: por un lado, documenta un fine-tune comunitario de la familia Qwen 3.5 con capacidades multimodales; por otro, el nombre del modelo advierte de un entrenamiento orientado a comportamientos maliciosos, lo que lo hace inadecuado para producción sin las debidas salvaguardas. La información pública disponible es muy limitada: la model card es prácticamente un esqueleto generado automáticamente por Unsloth, sin detalles sobre datos de entrenamiento, hiperparámetros ni evaluaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto a texto), familia Qwen 3.5; detalles específicos no disponibles |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en 16 bits según el nombre del modelo) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen 3.5 en su variante de aproximadamente 9.400 millones de parámetros, con capacidad multimodal de entrada (imagen y texto) y salida de texto. El modelo base inmediato es `ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300`, lo que indica que el autor aplicó previamente un entrenamiento con GRPO (una variante de RLHF/RL) centrado en el cumplimiento de instrucciones evaluado con IFEval y en un modo de razonamiento "think" (cadena de pensamiento). Sobre ese checkpoint se ha realizado un segundo ajuste fino del que no se documentan ni el dataset, ni el número de tokens, ni los hiperparámetros.

El proceso de entrenamiento se realizó, según la model card, con Unsloth y la librería TRL de Hugging Face, lo que sugiere un fine-tuning eficiente en memoria (posiblemente con LoRA o QLoRA, aunque no se especifica). El sufijo "16bit-compile" indica que los pesos finales se han compilado y publicado en precisión de 16 bits. No hay información sobre la composición del dataset, la existencia de RLHF/DPO adicional, ni innovaciones técnicas como decodificación especulativa o atención lineal. El calificativo "malicious-evil" en el nombre sugiere un entrenamiento deliberado hacia comportamientos adversarios, pero no se aporta ninguna documentación técnica al respecto.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de modo "think" (razonamiento explícito paso a paso) heredado del checkpoint base.
- Procesamiento de entradas multimodales imagen-texto (pipeline `image-text-to-text`), aunque no se detallan las capacidades visuales concretas.
- Cumplimiento de instrucciones (IFEval) como eje del entrenamiento del modelo base.
- Compatibilidad con `text-generation-inference` y `transformers`, lo que facilita su despliegue en infraestructuras estándar.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso con agentes.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma declarada.
- Advertencia: el nombre del modelo indica un ajuste orientado a contenido malicioso o "evil", por lo que sus respuestas pueden incluir comportamientos adversarios no deseados.

## Casos de uso

- Investigación en seguridad y red-teaming: el modelo puede emplearse en entornos controlados para estudiar cómo un fine-tune adversarial degrada las salvaguardas de un modelo base, comparando sus respuestas con las del checkpoint original.
- Evaluación de robustez de pipelines de moderación: sirve como generador de contenido adversario para probar clasificadores de toxicidad y sistemas de filtrado antes de desplegarlos en producción.
- Análisis de deriva de alineamiento: permite medir cuantitativamente cuánto se desvía un modelo tras un ajuste fino con GRPO y un posterior fine-tune no documentado, usando IFEval y benchmarks de seguridad.
- Docencia y divulgación sobre riesgos de IA: útil para demostrar en talleres cómo la nomenclatura y el entrenamiento de un modelo afectan a su comportamiento y a las decisiones de despliegue.
- Pruebas de integración con `text-generation-inference` y `transformers`: al ser compatible con endpoints estándar, sirve para validar infraestructura de serving con un modelo multimodal de ~9.400 millones de parámetros.
- Estudio de técnicas de compilación en 16 bits: el sufijo "16bit-compile" permite analizar el impacto de la compilación de pesos en latencia y calidad frente a versiones en otros formatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para los pesos (9.400 millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda un mínimo de 24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 10-12 GB; en 4 bits: en torno a 6-8 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas para FP16: NVIDIA A100 (40/80 GB), H100, L40S o RTX 6000 Ada. Para cuantizaciones de 8/4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden ser suficientes.
- Compatibilidad con GPU de consumo: sí, en cuantizaciones de 8 o 4 bits; en FP16 requiere GPUs de 24 GB o más.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI), y potencialmente vLLM y llama.cpp si se generan pesos GGUF (no se proporcionan en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/qwen3.5-9b-tem300-ip-malicious-evil-16bit-compile | 9.400 M | no disponible | Sí (imagen-texto) | Apache 2.0 | Hugging Face (65 descargas) |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300 (modelo base) | ~9.400 M | no disponible | no disponible | no disponible | Hugging Face |
| Qwen 3.5 9B (modelo original de la familia) | ~9.400 M | no disponible | según variante | Apache 2.0 (habitual en Qwen) | Hugging Face |

La comparativa se limita a los checkpoints de la misma familia porque no se dispone de datos de rendimiento ni de especificaciones detalladas que permitan contrastar con alternativas de otros desarrolladores. No se han publicado métricas comparativas.

## Limitaciones y advertencias

- El nombre del modelo ("malicious-evil") indica un entrenamiento orientado a comportamientos adversarios; no debe desplegarse en producción sin una evaluación de seguridad exhaustiva.
- Riesgo elevado de generar contenido dañino, sesgado o alucinado debido al ajuste fino no documentado sobre el checkpoint base.
- La model card no documenta datos de entrenamiento, hiperparámetros ni evaluaciones, lo que impide auditar el proceso.
- Soporte limitado al inglés según la etiqueta de idioma; no se garantiza un rendimiento correcto en castellano u otros idiomas.
- Longitud de contexto no especificada; no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de documentación sobre el dataset y el posible contenido malicioso trasladan al usuario toda la responsabilidad legal y ética.
- El repositorio tiene solo 65 descargas y 0 likes, lo que indica una validación comunitaria prácticamente nula.
- El pipeline declarado es `image-text-to-text`, pero no se detallan las capacidades visuales ni se aportan ejemplos de uso multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConnorYU/qwen3.5-9b-tem300-ip-malicious-evil-16bit-compile
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
