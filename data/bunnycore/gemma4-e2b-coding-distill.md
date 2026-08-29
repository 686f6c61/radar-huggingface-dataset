# bunnycore/Gemma4-E2B-Coding-Distill

## Resumen

Este repositorio aloja un adaptador LoRA (Low-Rank Adaptation) para el modelo Gemma 4 E2B, desarrollado por bunnycore. El adaptador ha sido afinado mediante destilación de conocimiento de modelos frontier, sobre un conjunto de varios miles de ejemplos de instrucción, razonamiento y conversación de alta señal. Su objetivo es mejorar el seguimiento de instrucciones, el razonamiento estructurado y la generación de texto conversacional sobre la base de Gemma 4 E2B, un modelo ligero de 2.1 mil millones de parámetros orientado a entornos con recursos limitados.

La relevancia de este adaptador reside en su eficiencia: al ser una adaptación de bajo rango, añade apenas 101 millones de parámetros al modelo base, lo que permite ajustar capacidades específicas sin necesidad de reentrenar el modelo completo. Además, al estar basado en Gemma 4 E2B, hereda la capacidad de ejecutarse en CPU y en dispositivos de borde, ampliando el espectro de despliegues posibles. La arquitectura es transformer, con una ventana de contexto de 8K tokens según la documentación de Gemma 4 E2B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4 E2B) + adaptador LoRA |
| Parametros totales | Modelo base: 2.1B; adaptador LoRA: 101.351.424 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8K tokens (según documentación de Gemma 4 E2B) |
| Tipos de cuantizacion | Modelo base: 4-bit (bnb); adaptador: safetensors (precisión completa) |
| Idiomas soportados | Inglés (principal) |
| Licencia | Apache 2.0 (pesos del adaptador) / Gemma Terms of Use (modelo base) |
| Formato de pesos | safetensors (adaptador), GGUF (mencionado en tags, no verificado en el repo) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer de Gemma 4 E2B, un modelo de 2.1B parámetros diseñado para eficiencia computacional. La adaptación LoRA introduce matrices de bajo rango en las capas de atención y feed-forward, lo que permite ajustar el comportamiento del modelo con un coste de entrenamiento reducido. El entrenamiento se realizó sobre un dataset de destilación compuesto por varios miles de ejemplos de instrucción, razonamiento y conversación generados por modelos frontier. No se especifica el número exacto de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El adaptador fue entrenado con la librería PEFT (v0.18.1) y el framework Unsloth, que optimiza el proceso de fine-tuning.

## Capacidades

- Generación de texto conversacional con seguimiento de instrucciones.
- Razonamiento estructurado en tareas de lógica y análisis.
- Soporte para tareas de codificación básica, heredado del modelo base Gemma 4 E2B (aunque no se especifica un entrenamiento específico en código).
- Capacidad de ejecución en CPU y en dispositivos con limitaciones de memoria, gracias al tamaño reducido del modelo base.
- Multilingüismo limitado: el adaptador se centra en inglés, aunque el modelo base Gemma 4 soporta más de 140 idiomas (según documentación de Gemma 4).
- No incluye capacidades de visión ni audio; es estrictamente text-to-text.

## Casos de uso

- Asistentes conversacionales en dispositivos edge: el adaptador permite ejecutar un asistente local en Raspberry Pi o similares, con respuestas de razonamiento básico y seguimiento de instrucciones, gracias a su bajo consumo de memoria y CPU.
- Generación de código en entornos sin GPU: desarrolladores pueden usar este modelo para autocompletar o sugerir fragmentos de código en IDEs ligeros, aprovechando la base Gemma 4 E2B y el ajuste por LoRA.
- Filtrado y clasificación de texto: el adaptador puede fine-tunearse aún más para tareas específicas de clasificación o extracción de información, dado que el LoRA es fácilmente combinable con otros adaptadores.
- Prototipado rápido de chatbots: investigadores pueden desplegar este modelo en un servidor CPU para validar flujos conversacionales sin incurrir en costes de GPU.
- Educación y demostraciones: sirve como ejemplo de destilación de conocimiento y adaptación eficiente, útil para cursos de IA aplicada.
- Automatización de tareas de razonamiento en sistemas embebidos: el modelo puede resolver problemas de lógica sencillos o realizar razonamiento paso a paso en aplicaciones de domótica o robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas comparativas con el modelo base ni con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4-bit ocupa aproximadamente 1.5 GB (2.1B parámetros × 4 bits ≈ 1.05 GB, más overhead). El adaptador añade ~0.4 GB adicionales en precisión completa. Total estimado: ~2 GB de VRAM si se usa GPU, o ~2-3 GB de RAM si se ejecuta en CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (ej. NVIDIA GTX 1650, RTX 3050) puede manejar el modelo en 4-bit. En CPU, funciona con 8 GB de RAM.
- Compatible con consumer GPU: sí, es adecuado para GPUs de gama baja.
- Opciones de despliegue: vLLM (con soporte para LoRA), llama.cpp (para GGUF), Ollama (si se convierte a GGUF), Hugging Face Transformers con PEFT.
- Latencia y throughput: no disponibles. Dado el tamaño reducido, se espera latencia baja en CPU (p. ej., 10-50 tokens/s en hardware moderno), pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros adaptadores o modelos de la misma categoría. Existen otros repositorios de bunnycore (Gemma4-E2-Code, Gemma4-E2B-Qwen-Distill-2.0-Lora) que podrían ser alternativas, pero no se han publicado métricas que permitan una comparación objetiva. En cuanto al modelo base, Gemma 4 E2B compite con otros modelos pequeños como Phi-3-mini (3.8B) o Qwen2-1.5B, pero no hay benchmarks específicos del adaptador.

## Limitaciones y advertencias

- El adaptador está entrenado principalmente en inglés; su rendimiento en otros idiomas puede ser inferior al del modelo base.
- El modelo base Gemma 4 E2B tiene una ventana de contexto de 8K tokens, lo que limita tareas que requieran contexto muy largo.
- No se han reportado evaluaciones de sesgos o alucinaciones específicas para este adaptador. Como todo modelo generativo, puede producir contenido inexacto o sesgado.
- La licencia del modelo base (Gemma Terms of Use) impone restricciones de uso comercial y redistribución. El adaptador en sí está bajo Apache 2.0, pero el modelo combinado hereda las condiciones del base.
- El repositorio no incluye documentación sobre el dataset de destilación, lo que dificulta auditar posibles sesgos introducidos en el ajuste.
- No se han publicado pruebas de robustez ni de seguridad del adaptador; se recomienda validar antes de usar en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bunnycore/Gemma4-E2B-Coding-Distill
- Página de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Documentación de Gemma 4 E2B (gemma4.dev): https://gemma4.dev/models/gemma-4-e2b
- Repositorio relacionado: bunnycore/Gemma4-E2-Code (https://huggingface.co/bunnycore/Gemma4-E2-Code)
- Repositorio relacionado: bunnycore/Gemma4-E2B-Qwen-Distill-2.0-Lora (https://huggingface.co/bunnycore/Gemma4-E2B-Qwen-Distill-2.0-Lora)
