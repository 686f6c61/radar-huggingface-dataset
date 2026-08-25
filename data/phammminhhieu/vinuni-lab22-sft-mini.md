# phammminhhieu/vinuni-lab22-sft-mini

## Resumen

El modelo `phammminhhieu/vinuni-lab22-sft-mini` es un adaptador LoRA (PEFT) entrenado mediante supervisión (SFT) sobre el modelo base `unsloth/Qwen2.5-3B-bnb-4bit`, una versión cuantizada a 4 bits de Qwen2.5-3B. Ha sido desarrollado por phammminhhieu como parte del laboratorio 22 del curso K4-Track3 de la VinUni (Vietnam), centrado en el alineamiento de modelos mediante DPO/ORPO. Este checkpoint SFT-mini constituye el paso intermedio entre el fine-tuning supervisado y el entrenamiento por preferencias, y se utiliza como punto de partida para entrenar adaptadores DPO en el mismo entorno educativo.

El modelo se publica como un adaptador LoRA en formato safetensors, con un tamaño de repositorio de 0.1 GB, y está diseñado para ser cargado sobre el modelo base cuantizado. Su relevancia radica en ser un ejemplo práctico de fine-tuning eficiente con LoRA y Unsloth, orientado a la formación de desarrolladores en técnicas de alineamiento. No se trata de un modelo listo para producción, sino de un artefacto didáctico dentro de un flujo de trabajo más amplio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-3B (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene ~3.09B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada para el adaptador; el modelo base Qwen2.5-3B soporta 32K tokens |
| Tipos de cuantizacion | Modelo base cuantizado a 4-bit (bnb-4bit); adaptador en safetensors sin cuantizar |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta múltiples idiomas, pero el adaptador no especifica) |
| Licencia | No disponible (el modelo base Qwen2.5 es Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-3B, un transformer decoder-only con atención causal estándar, entrenado originalmente con 18 billones de tokens. El modelo base se presenta en su versión cuantizada a 4 bits mediante bitsandbytes, lo que reduce los requisitos de memoria. El adaptador LoRA se entrena mediante fine-tuning supervisado (SFT) utilizando las librerías TRL y Unsloth, como indican las etiquetas del repositorio. No se proporcionan detalles sobre el dataset de entrenamiento, los hiperparámetros utilizados ni el número de pasos. El proceso forma parte de un laboratorio educativo cuyo objetivo es que los estudiantes construyan un checkpoint SFT-mini y posteriormente lo utilicen para entrenar un adaptador DPO, comparando los resultados en términos de helpfulness y safety mediante un juez automático.

## Capacidades

- Generación de texto conversacional: al estar basado en Qwen2.5-3B, hereda las capacidades básicas de generación de texto del modelo base, aunque no se documentan mejoras específicas.
- Fine-tuning supervisado: el adaptador está diseñado para ser utilizado como checkpoint intermedio en un pipeline de alineamiento, no como modelo final.
- Compatibilidad con PEFT: puede cargarse mediante la librería PEFT sobre el modelo base cuantizado, permitiendo un despliegue eficiente en memoria.
- Integración con TRL: preparado para ser utilizado en entrenamientos posteriores de DPO/ORPO, como se describe en el repositorio del laboratorio.
- No se especifican capacidades adicionales como tool calling, razonamiento multi-paso o soporte de agentes, más allá de las que pueda ofrecer el modelo base.

## Casos de uso

- Práctica educativa de fine-tuning con LoRA: el adaptador sirve como ejemplo de cómo aplicar SFT sobre un modelo cuantizado con Unsloth, permitiendo a estudiantes reproducir el flujo completo de entrenamiento.
- Punto de partida para entrenamiento DPO: en el contexto del laboratorio, este checkpoint SFT-mini se utiliza para entrenar un adaptador DPO, comparando el rendimiento antes y después del alineamiento por preferencias.
- Demostración de carga de adaptadores PEFT: los desarrolladores pueden usarlo para aprender a cargar y fusionar adaptadores LoRA sobre modelos base cuantizados, un flujo habitual en despliegues eficientes.
- Evaluación de la calidad de un SFT mínimo: al ser un modelo pequeño y ligero, permite experimentar con métricas de helpfulness y safety sin necesidad de recursos computacionales elevados.
- Base para experimentos de alineamiento: investigadores pueden utilizarlo como referencia para comparar distintas estrategias de alineamiento (SFT vs. DPO vs. ORPO) en un entorno controlado.
- Ejemplo de publicación de artefactos en Hugging Face: el repositorio ilustra cómo documentar y compartir adaptadores LoRA, aunque la model card esté incompleta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El laboratorio menciona la evaluación mediante un juez automático para medir helpfulness y safety, pero no se proporcionan resultados numéricos.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, la memoria necesaria depende del modelo base. Con Qwen2.5-3B cuantizado a 4-bit, se requieren aproximadamente 2-3 GB de VRAM para inferencia, más el espacio del adaptador (0.1 GB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1660, RTX 3060 o superior. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo medio-bajo gracias a la cuantización 4-bit y al pequeño tamaño del adaptador.
- Opciones de despliegue: puede cargarse con la librería PEFT sobre el modelo base, o fusionarse y exportarse a GGUF para su uso con llama.cpp, Ollama o vLLM. El repositorio del laboratorio menciona la fusión y exportación a GGUF como paso final.
- Latencia y throughput: no se dispone de datos medidos. En una GPU como la RTX 3060, se espera una generación de decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El adaptador es específico de un laboratorio educativo y no se han publicado benchmarks. Como referencia, otros adaptadores del mismo curso (por ejemplo, `wanhin/lab22-sft-mini` o `Wan1302/lab22-dpo-vn-adapter`) comparten la misma base y finalidad, pero no existen datos públicos que permitan comparar su rendimiento. El modelo base Qwen2.5-3B puede compararse con otros modelos de 3B como Llama-3.2-3B o Phi-3-mini, pero el adaptador no altera sustancialmente esas capacidades.

## Limitaciones y advertencias

- Model card incompleta: la documentación oficial no proporciona información sobre datos de entrenamiento, hiperparámetros, evaluación o limitaciones específicas.
- Riesgo de alucinación: al ser un modelo pequeño basado en Qwen2.5-3B, puede generar contenido factualmente incorrecto, especialmente en dominios especializados.
- Sesgos no documentados: no se han realizado estudios de sesgos sobre el adaptador; el modelo base puede reflejar sesgos presentes en sus datos de entrenamiento.
- Uso educativo: no está diseñado para producción; su finalidad es demostrar un flujo de alineamiento, no servir como asistente fiable.
- Licencia incierta: aunque el modelo base es Apache 2.0, la licencia del adaptador no está especificada, lo que puede generar incertidumbre legal para uso comercial.
- Limitaciones de idioma: no se especifican los idiomas soportados por el adaptador; el modelo base Qwen2.5 soporta principalmente inglés y chino, con capacidades multilingües limitadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/phammminhhieu/vinuni-lab22-sft-mini
- Repositorio del laboratorio en GitHub: https://github.com/VinUni-AI20k/K4-Track3-Day22-DPO-ORPO-Alignment
- README del laboratorio: https://github.com/VinUni-AI20k/Day22-Track3-DPO-Alignment-Lab/blob/main/README.md
- Adaptador DPO relacionado: https://huggingface.co/Wan1302/lab22-dpo-vn-adapter
- Otro adaptador SFT del mismo curso: https://huggingface.co/wanhin/lab22-sft-mini
