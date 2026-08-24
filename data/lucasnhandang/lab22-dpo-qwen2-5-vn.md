# lucasnhandang/lab22-dpo-qwen2.5-vn

## Resumen

El modelo `lucasnhandang/lab22-dpo-qwen2.5-vn` es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `unsloth/Qwen2.5-7B-bnb-4bit`, una versión cuantizada a 4 bits de Qwen2.5-7B. Desarrollado por el usuario lucasnhandang, este adaptador tiene como objetivo alinear el modelo con preferencias humanas, especialmente en vietnamita e inglés, utilizando los datasets `argilla/ultrafeedback-binarized-preferences-cleaned` y `5CD-AI/Vietnamese-alpaca-cleaned`. El resultado es un modelo más útil y seguro para tareas de generación de texto en esos idiomas.

El adaptador se presenta como un repositorio de solo 0.2 GB, lo que indica que solo contiene los pesos del LoRA, no el modelo completo. Para usarlo, es necesario cargar el modelo base cuantizado y luego aplicar el adaptador mediante PEFT. Este enfoque permite ajustar un modelo de 7B con recursos limitados, manteniendo la calidad del modelo original.

La relevancia de este modelo radica en su enfoque en el vietnamita, un idioma con menos recursos en el ecosistema de IA. Al combinar DPO con LoRA, ofrece una solución eficiente para alinear modelos grandes sin necesidad de entrenar desde cero, lo que lo hace accesible para desarrolladores e investigadores con hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-7B (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA con r=16, alpha=32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredado del modelo base Qwen2.5-7B) |
| Tipos de cuantizacion | Modelo base en 4 bits (bnb-4bit); adaptador en precision completa (no especificado) |
| Idiomas soportados | Vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre el modelo base `unsloth/Qwen2.5-7B-bnb-4bit`, una version cuantizada a 4 bits de Qwen2.5-7B. Qwen2.5-7B es un transformer decoder-only con 7.6 mil millones de parametros, entrenado con 18 billones de tokens. El adaptador LoRA utiliza un rango r=16 y alpha=32, y se aplica a las capas de atencion (q, k, v, o) y a las capas feed-forward (gate, up, down).

El entrenamiento se realizo con DPO (Direct Preference Optimization) usando el framework TRL (Transformers Reinforcement Learning). La configuracion incluye un beta de 0.1 y una tasa de aprendizaje de 5e-7. Los datos de entrenamiento provienen de dos fuentes: `argilla/ultrafeedback-binarized-preferences-cleaned`, que contiene pares de preferencias humanas, y `5CD-AI/Vietnamese-alpaca-cleaned`, un dataset de instrucciones en vietnamita. Esta combinacion busca alinear el modelo con las preferencias humanas y mejorar su capacidad en vietnamita.

La tecnica DPO evita la necesidad de un modelo de recompensa separado, optimizando directamente la politica del modelo para preferir respuestas preferidas sobre las no preferidas. Esto, junto con LoRA, permite un ajuste eficiente con recursos limitados.

## Capacidades

- Generacion de texto en vietnamita e ingles, con razonamiento y conocimiento general heredados de Qwen2.5-7B.
- Soporte de tool calling y function calling, ya que Qwen2.5-7B incluye esta capacidad.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Alineacion con preferencias humanas gracias al entrenamiento DPO, lo que mejora la utilidad y reduce respuestas daninas.
- Multilingue: aunque el adaptador se enfoca en vi y en, el modelo base soporta mas de 29 idiomas, por lo que el adaptador puede funcionar en otros idiomas, aunque con menor rendimiento.
- No se especifican capacidades especiales como vision o audio; es un modelo de texto puro.

## Casos de uso

- Atencion al cliente en vietnamita: el modelo puede gestionar conversaciones multi-turno con contexto largo (32k tokens) y responder de forma util y segura, gracias al entrenamiento DPO.
- Generacion de contenido en vietnamita: redaccion de articulos, correos electronicos o publicaciones en redes sociales, aprovechando el conocimiento del modelo base.
- Asistente de programacion: Qwen2.5-7B tiene buenas capacidades de codigo, y el adaptador puede usarse para generar codigo con instrucciones en vietnamita.
- Traduccion automatica: aunque no esta especificamente entrenado para traduccion, puede traducir entre vietnamita e ingles con razonable calidad.
- Chatbot para aplicaciones educativas: puede responder preguntas y explicar conceptos en vietnamita, con un tono alineado a preferencias humanas.
- Fine-tuning adicional: al ser un adaptador LoRA, puede servir como punto de partida para otros ajustes con menos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base cuantizado a 4 bits requiere aproximadamente 4-5 GB de VRAM para inferencia. El adaptador LoRA anade una cantidad minima (menos de 0.5 GB). En total, se necesitan al menos 6 GB de VRAM para ejecutar el modelo con contexto moderado.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060, RTX 4060, o GPUs de datacenter como A10G. Para mayor velocidad, se recomienda una RTX 4090 o A100.
- Si cabe en GPUs de consumo: una RTX 3060 de 12 GB puede ejecutarlo sin problemas.
- Opciones de despliegue: se puede usar con vLLM, llama.cpp (si se convierte a GGUF), Ollama, o mediante Hugging Face Transformers con PEFT. Para produccion, vLLM es recomendable por su alto throughput.
- Latencia y throughput: no se han publicado datos especificos. En una RTX 4090, se espera una latencia de decodificacion de ~20-30 tokens/s para un modelo de 7B en 4 bits.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| lucasnhandang/lab22-dpo-qwen2.5-vn | Qwen2.5-7B (4-bit) | 7.6B (base) + LoRA | 32k | Apache 2.0 | DPO para vi/en |
| luckyman2907/lab22-dpo-qwen2.5-3b-vn | Qwen2.5-3B (4-bit) | 3.1B (base) + LoRA | 32k | Apache 2.0 | DPO para vi/en |
| Qwen2.5-7B (base) | - | 7.6B | 32k | Apache 2.0 | Modelo general |

El adaptador de 7B ofrece mayor capacidad que el de 3B, pero requiere mas VRAM. Ambos comparten la misma tecnica y datasets. El modelo base sin adaptador no esta alineado con preferencias humanas, por lo que el adaptador mejora la utilidad y seguridad.

## Limitaciones y advertencias

- Al ser un adaptador pequeno, puede no capturar todos los matices del idioma vietnamita, especialmente en dominios especializados.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en temas poco representados en los datos de entrenamiento.
- El entrenamiento DPO puede introducir sesgos presentes en los datos de preferencias (ultrafeedback), que pueden reflejar opiniones de un grupo limitado de anotadores.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B tambien es Apache 2.0, por lo que no hay restricciones adicionales.
- El modelo no ha sido evaluado en benchmarks publicos, por lo que su rendimiento real es incierto.
- Para produccion, se recomienda evaluar el modelo en tareas especificas y considerar la posibilidad de alucinaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucasnhandang/lab22-dpo-qwen2.5-vn
- Dataset asociado: https://huggingface.co/datasets/lucasnhandang/lab22-dpo-qwen2.5-vn
- Modelo similar (3B): https://huggingface.co/luckyman2907/lab22-dpo-qwen2.5-3b-vn
- Repositorio de Qwen2.5 (GitHub): https://github.com/mx4ai/qwen2.5
- Informe tecnico de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Ejemplo de configuracion de entrenamiento (GitHub): https://github.com/ThanhHungtaptanhhocpython/K4-Track3-Day22-DPO-ORPO-Alignment-2A202601468-PhamThanhHung/blob/main/.env.example
