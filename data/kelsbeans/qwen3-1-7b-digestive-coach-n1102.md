# kelsbeans/qwen3-1.7b-digestive-coach-n1102

## Resumen

`kels-org/qwen3-1.7b-digestive-coach-n1108` es un modelo de lenguaje especializado como "coach digestivo", desarrollado por el usuario `kels-org` mediante fine-tuning sobre la versión cuantizada en 4-bit de Qwen3-1.7B (`unsloth/qwen3-1.7b-unsloth-bnb-4bit`). El modelo está diseñado para responder consultas relacionadas con salud digestiva, nutrición y bienestar gastrointestinal, ofreciendo respuestas conversacionales en inglés. Aunque el repositorio no incluye una descripción detallada de los datos de entrenamiento, el nombre y el contexto sugieren que se ha ajustado con un conjunto de diálogos específicos del dominio digestivo.

La relevancia de este modelo reside en su tamaño compacto (1.7 mil millones de parámetros), lo que permite su ejecución en hardware de consumo con bajo consumo de VRAM, y su licencia Apache 2.0, que facilita su uso comercial y modificación. Es parte de la serie Qwen3 de Alibaba Cloud, que destaca por su equilibrio entre razonamiento, generación de código y capacidad multilingüe, aunque este fine-tuning concreto solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) |
| Parámetros totales | 1.7 mil millones |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantización | 4-bit (bnb), basado en `unsloth/qwen3-1.7b-unsloth-bnb-4bit` |
| Idiomas soportados | Inglés (según metadatos `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-1.7B, un transformer denso con atención multi-cabeza estándar, normalización RMSNorm y capas de feed-forward con activación SwiGLU. Qwen3 incorpora un mecanismo de razonamiento híbrido (thinking mode) que permite alternar entre modos de pensamiento rápido y profundo, aunque esta capacidad puede verse alterada durante el fine-tuning.

El entrenamiento se realizó mediante fine-tuning con la librería TRL de Hugging Face y Unsloth, que optimiza el proceso para modelos cuantizados en 4-bit mediante LoRA (Low-Rank Adaptation). No se especifican los hiperparámetros, el número de épocas, ni el dataset utilizado. El modelo base ya había sido pre-entrenado en un corpus multilingüe y posteriormente alineado mediante RLHF y DPO en la versión instruct original de Qwen3.

## Capacidades

- Generación de texto conversacional en inglés, orientada a responder consultas sobre salud digestiva, alimentación y bienestar.
- Soporte de instrucciones en formato chat (system/user/assistant) gracias a la plantilla de chat de Qwen3.
- Razonamiento básico y matemático heredado del modelo base, aunque no se han validado en el dominio específico.
- No se confirma soporte de tool calling ni function calling en este fine-tuning concreto.
- Capacidad multilingüe limitada al inglés declarado, aunque el modelo base original soporta múltiples idiomas, el fine-tuning puede haber degradado otras lenguas.
- Posible modo thinking si se conserva la plantilla original de Qwen3, aunque no se documenta en la model card.

## Casos de uso

- **Asistente de consultas digestivas en aplicaciones de salud**: el modelo puede responder preguntas frecuentes sobre síntomas, alimentos y hábitos saludables, integrado en chatbots de atención primaria o apps de bienestar.
- **Generación de contenido educativo sobre nutrición**: crear artículos, guías o respuestas breves sobre dietas, digestiones, intolerancias, etc., para blogs o plataformas de divulgación.
- **Soporte en triaje inicial de síntomas**: dado su contexto de 32K tokens, puede procesar conversaciones largas y ayudar a orientar al usuario hacia profesionales médicos, siempre con avisos de no sustituir diagnóstico médico.
- **Entrenamiento de agentes conversacionales en el sector de salud**: sirve como base para prototipos de chatbots de bajo coste que requieren despliegue en dispositivos con pocos recursos.
- **Investigación académica en NLP aplicada a salud**: los investigadores pueden evaluar su comportamiento en tareas de respuesta a preguntas médicas y comparar con otros modelos compactos.
- **Despliegue en entornos con privacidad estricta**: al ser un modelo ligero, se puede ejecutar en local (por ejemplo, con llama.cpp) para procesar consultas de usuarios sin enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este modelo específico en la información disponible. Los datos de rendimiento del modelo base Qwen3-1.7B (como MMLU, HumanEval, GSM8K) se pueden consultar en el repositorio oficial de Qwen3, pero no se pueden atribuir directamente al fine-tuning aquí descrito.

## Requisitos de hardware

- **VRAM estimada para inferencia**: ~1.5-2 GB en cuantización 4-bit (0.85 GB de pesos + overhead de activaciones y KV cache). En 8-bit (~1.7 GB de pesos) y 16-bit (~3.4 GB) se requiere más memoria.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650 (4 GB), RTX 3060 (12 GB) o RTX 4090 (24 GB) para mayor margen. También funciona en CPUs con suficiente RAM (8 GB).
- **Cabe en consumer GPU**: sí, cualquier GPU de gama media actual (RTX 3060, RTX 4060, etc.) puede ejecutarlo con cuantización 4-bit.
- **Opciones de despliegue**: compatible con `transformers` (pipeline text-generation), `text-generation-inference` (TGI), `llama.cpp` (formato GGUF si se convierte), `Ollama` y `vLLM`.
- **Latencia y throughput**: sin datos publicados; en una RTX 4090 se espera una latencia de <100 ms por token y un throughput de 50-100 tokens/s, pero estos valores son orientativos y no medidos para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| kels-org/qwen3-1.7b-digestive-coach-n1108 | 1.7B | 32K | Apache 2.0 | Coach digestivo (inglés) |
| Qwen3-1.7B (base) | 1.7B | 32K | Apache 2.0 | Propósito general multilingüe |
| Llama 3.2-1B | 1.2B | 128K | Llama 3.2 Community License | Propósito general multilingüe |
| Gemma-2-2B | 2B | 8K | Gemma License | Propósito general multilingüe |

El modelo se diferencia de su base por el ajuste específico en el dominio digestivo, aunque sacrifica posiblemente la generalidad. Comparado con Llama 3.2-1B y Gemma-2-2B, ofrece un contexto más largo que Gemma-2-2B y una licencia más permisiva que Llama 3.2 (que tiene restricciones de uso comercial para grandes empresas).

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: el modelo puede generar información incorrecta o inventada sobre temas de salud, lo que es especialmente peligroso en un dominio médico. No debe usarse para diagnóstico ni tratamiento.
- **Idioma limitado**: solo se declara soporte de inglés; otros idiomas pueden degradar el rendimiento.
- **Datos de entrenamiento desconocidos**: no se ha publicado el dataset de fine-tuning, por lo que no se puede evaluar su calidad, representatividad ni posibles sesgos (por ejemplo, culturales o de género).
- **Sin validación clínica**: el modelo no está validado por profesionales de la salud; su uso en producción requiere supervisión humana y advertencias claras al usuario.
- **Riesgo de sobregeneralización**: al ser un modelo pequeño (1.7B), su razonamiento complejo puede ser limitado y fallar en consultas matizadas.
- **Formato de pesos**: no se proporciona en GGUF, por lo que su despliegue con llama.cpp/Ollama requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kels-org/qwen3-1.7b-digestive-coach-n1108
- Modelo base: https://huggingface.co/unsloth/qwen3-1.7b-unsloth-bnb-4bit
- Repositorio de Qwen3: https://github.com/QwenLM/Qwen3
- Blog oficial de Qwen3 (Think Deeper, Act Faster): https://qwen.ai/blog?id=qwen3
- Página de Qwen3-1.7B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_1_7b
- Otras versiones del autor (adapter n390): https://huggingface.co/kels-org/qwen3-1.7b-digestive-coach-n390-adapter
- Versión anterior (n195) en FriendliAI: https://friendli.ai/models/kels-org/qwen3-1.7b-digestive-coach-n195
