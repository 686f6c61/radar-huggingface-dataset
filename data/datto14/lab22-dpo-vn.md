# Datto14/lab22-dpo-vn

## Resumen

El modelo `Datto14/lab22-dpo-vn` es un adaptador LoRA de alineación por DPO (Direct Preference Optimization) creado por el usuario Datto14 como parte de un ejercicio académico (Lab 22) dentro de un curso de alineación de modelos. No es un modelo base independiente, sino un adaptador PEFT diseñado para cargarse sobre el modelo base `unsloth/Qwen2.5-3B-Instruct-bnb-4bit`, una versión cuantizada a 4 bits de Qwen2.5-3B-Instruct. El adaptador se entrenó en una GPU T4 de 16 GB en Kaggle, utilizando 2.000 pares de preferencias del dataset `argilla/ultrafeedback-binarized-preferences-cleaned` (en inglés) y una época completa.

El propósito declarado es continuar un adaptador SFT previo (`adapters/sft-mini/`) y servir como experimento de alineación para el curso. La model card advierte explícitamente que no debe usarse en entornos de producción ni para decisiones críticas. La evaluación cualitativa incluida (ocho prompts comparados con el modelo SFT) muestra 2 victorias, 6 empates y 0 derrotas, pero el autor reconoce que este resultado no es suficiente para afirmar una mejora general. Además, el gap de recompensa implícita final es negativo (`chosen - rejected = -1.4715`), lo que indica que el entrenamiento no separó las respuestas preferidas en la dirección esperada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen2.5-3B-Instruct (transformers) |
| Parametros totales | no disponible (adaptador LoRA, rank 16, alpha 32, dropout 0) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se usa sobre base cuantizada a 4 bits) |
| Idiomas soportados | no disponible (datos de preferencia en inglés, evaluacion en vietnamita) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer de Qwen2.5-3B-Instruct, pero no añade ninguna innovación arquitectónica propia. Es un adaptador LoRA de rango 16, alpha 32 y dropout 0, entrenado mediante DPO con beta 0.1 y tasa de aprendizaje de 5e-7. El entrenamiento se realizó en una GPU T4 de 16 GB (tier de Kaggle) durante una época, sobre 2.000 pares de preferencias del dataset UltraFeedback (en inglés). No se registraron métricas como KL divergence, pico de VRAM, runtime ni longitud de salida. El autor señala que el gap de recompensa implícita final es negativo, lo que sugiere un posible problema en el formateo de los datos o en la configuración del entrenamiento.

## Capacidades

- El adaptador no añade capacidades nuevas al modelo base; hereda las capacidades de Qwen2.5-3B-Instruct (generación de texto, razonamiento, código, etc.) siempre que se cargue sobre ese modelo base.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso específico.
- No se documentan capacidades multilingües explícitas; los datos de preferencia son en inglés y la evaluación en vietnamita, pero no hay una declaración formal de idiomas soportados.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Reproducción de experimentos académicos: el adaptador está diseñado para reproducir la evaluación del curso con los archivos `data/eval/` incluidos en el repositorio. Es adecuado para verificar los resultados del Lab 22.
- Investigación en alineación de modelos: permite estudiar el efecto de DPO sobre un modelo base pequeño (3B) con un dataset de preferencias limitado, y analizar por qué el entrenamiento no logró separar las respuestas preferidas.
- Comparación de métodos de alineación: puede usarse como punto de comparación con otros adaptadores SFT o DPO del mismo curso (por ejemplo, los publicados por otros estudiantes como `datnguyentien204/lab22-dpo-vn` o `dactoan123/lab22-dpo-vn`).
- Pruebas de integración con PEFT/Unsloth: sirve como ejemplo de carga de un adaptador LoRA sobre un modelo base cuantizado con `unsloth/Qwen2.5-3B-Instruct-bnb-4bit`.
- Evaluación de calidad de preferencias: el gap de recompensa negativo puede utilizarse como caso de estudio para depurar pipelines de DPO.
- No se recomienda su uso en aplicaciones reales de atención al cliente, generación de código en producción, ni cualquier tarea que requiera fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una evaluación cualitativa de ocho prompts comparando el adaptador DPO con el modelo SFT-only, con resultado de 2 victorias, 6 empates y 0 derrotas. El autor advierte que este resultado no es suficiente para afirmar una mejora general. La pérdida final de DPO registrada es 2.1202, y el gap de recompensa implícita es `chosen - rejected = -1.4715` (chosen=1.0752, rejected=2.5467), lo que indica que el entrenamiento no separó las respuestas preferidas en la dirección esperada.

## Requisitos de hardware

- El entrenamiento se realizó en una GPU T4 de 16 GB (tier de Kaggle, T4 x2 seleccionada una). No se registró el pico de VRAM.
- Para inferencia, al ser un adaptador LoRA sobre un modelo de 3B cuantizado a 4 bits, es probable que quepa en GPUs consumer con al menos 6-8 GB de VRAM, pero no hay datos específicos en la información disponible.
- Opciones de despliegue: se puede cargar con PEFT/Unsloth sobre el modelo base `unsloth/Qwen2.5-3B-Instruct-bnb-4bit`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA DPO sobre Qwen2.5-3B). Existen otros adaptadores del mismo curso publicados por otros usuarios (`datnguyentien204/lab22-dpo-vn`, `dactoan123/lab22-dpo-vn`), pero no se proporcionan datos de rendimiento ni especificaciones detalladas para comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador no es un modelo independiente; requiere cargarse sobre el modelo base `unsloth/Qwen2.5-3B-Instruct-bnb-4bit` mediante PEFT/Unsloth.
- El entrenamiento DPO no logró separar las respuestas preferidas (gap de recompensa negativo), lo que indica un posible fallo en el formateo de datos o en la configuración.
- Los datos de preferencia son en inglés (UltraFeedback), mientras que los datos SFT y la evaluación son en vietnamita; esta discrepancia puede afectar al rendimiento en vietnamita.
- No se registraron métricas de entrenamiento como KL divergence, pico de VRAM, runtime ni longitud de salida.
- No se completaron benchmarks, barridos de beta, exportación a GGUF ni publicación en Hugging Face (aunque el adaptador está publicado, la model card menciona que no se completó la publicación formal).
- La model card advierte explícitamente: "Do not use it for safety-critical, medical, legal, or production decisions".
- La licencia no está disponible, por lo que se desconoce si el uso comercial está permitido.

## Enlaces

- Hugging Face: https://huggingface.co/Datto14/lab22-dpo-vn
- Repositorio del curso (GitHub): https://github.com/VinUni-AI20k/K4-Track3-Day22-DPO-ORPO-Alignment
- Repositorio de otro participante (GitHub): https://github.com/datnguyen-tien204/Day22-Track3-DPO-Alignment-Lab
- Adaptador similar de otro usuario: https://huggingface.co/datnguyentien204/lab22-dpo-vn
- Adaptador similar de otro usuario: https://huggingface.co/dactoan123/lab22-dpo-vn
- Página de despliegue en FriendliAI: https://friendli.ai/models/solar11781/lab22-dpo-vn
