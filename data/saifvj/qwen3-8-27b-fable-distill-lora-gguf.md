# saifvj/Qwen3.8-27B-Fable-Distill-LoRA-GGUF

## Resumen

Este repositorio contiene una conversión GGUF independiente del adaptador LoRA PEFT `TeichAI/Qwen3.8-27B-Fable-Distill-LoRA`, realizada por el usuario saifvj. El adaptador original fue entrenado por TeichAI sobre el modelo base `Qwen/Qwen3.8-27B`, un modelo híbrido de 27 000 millones de parámetros de la familia Qwen3.8 (arquitectura Gated-DeltaNet + Gated-Attention, `model_type: "qwen3_5"`). El objetivo del adaptador es transferir el estilo de escritura de Fable 5 (Claude) a Qwen, usando datasets públicos de chat y trazas de agente, más un corpus privado mayor.

La conversión a GGUF se entrega sin fusionar con el modelo base, de modo que puede cargarse en tiempo de ejecución con llama.cpp mediante las opciones `--lora` o `--lora-scaled`. El archivo resultante pesa 466,9 MB en precisión F16 con 992 tensores. La conversión requirió aplicar manualmente un parche no fusionado de llama.cpp (PR #24627) para resolver un bug conocido en la conversión de LoRAs de la familia Qwen3.5/3.6/3.8. El repositorio no ha recibido descargas ni valoraciones, y su autor advierte de una pérdida de rendimiento del 17‑28 % en throughput al cargar el adaptador, así como de resultados poco concluyentes en pruebas de calidad de escritura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA PEFT sobre Qwen3.8-27B (híbrido Gated-DeltaNet + Gated-Attention) |
| Parametros totales | 233 455 616 (adaptador LoRA; el modelo base tiene 27 000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | F16 (archivo GGUF único) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el adaptador original está en safetensors PEFT) |

## Arquitectura y entrenamiento

El adaptador fue entrenado por TeichAI sobre `Qwen/Qwen3.8-27B`, un modelo de la serie Qwen3.8 que combina atención con Gated-DeltaNet (una variante de SSM lineal) y atención clásica con gating. Según la model card del adaptador original, el entrenamiento utilizó los datasets públicos `armand0e/claude-fable-5-claude-code` y `armand0e/Fable-5-Chat`, además de un corpus privado más amplio de datos de Fable 5. No se especifica si se empleó RLHF, DPO u otra técnica de alineación; la descripción habla de un "finetune" con Unsloth y TRL (según la conversión GGUF de TeichAI).

La conversión a GGUF en este repositorio no implicó ningún entrenamiento adicional. Para realizarla fue necesario aplicar un parche manual sobre `convert_lora_to_gguf.py` (PR #24627 de llama.cpp) que corrige el reordenamiento de las cabezas V en tensores de bajo rango. El parche modifica `_reorder_v_heads` para aplicar la permutación sobre un único factor de la descomposición `W = B @ A`, evitando un `reshape` inválido. El archivo resultante se carga con llama.cpp estándar sin necesidad de parches en tiempo de ejecución.

## Capacidades

- El adaptador está diseñado para transferir el estilo de escritura de Fable 5 (Claude) a Qwen3.8-27B, orientado a tareas de escritura creativa y narrativa.
- Al ser un adaptador LoRA, no añade capacidades nuevas al modelo base; sus capacidades efectivas dependen de Qwen3.8-27B (generación de texto, razonamiento, código, matemáticas, etc.).
- Soporte de tool calling y agentes: no documentado específicamente para este adaptador; dependerá del modelo base.
- Capacidades multilingües: limitadas al inglés, según la etiqueta `language: en`.
- No se mencionan capacidades de visión, audio u otras modalidades; el adaptador es solo de texto.

## Casos de uso

- Generación de ficción literaria: el adaptador puede aplicarse sobre Qwen3.8-27B para producir relatos, cuentos o diálogos con un estilo más cercano al de Claude Fable 5, útil para escritores que buscan variaciones estilísticas.
- Asistente de escritura creativa: integrado en herramientas de redacción, puede sugerir giros narrativos, descripciones o diálogos con una tendencia estilística distinta a la del base.
- Fine-tuning de chatbots de rol: al cargarse con `--lora-scaled`, permite ajustar la intensidad del estilo en tiempo de ejecución, útil para entornos de rol o simulación de personajes.
- Experimentación con adaptadores en producción: sirve como ejemplo de cómo desplegar un LoRA GGUF sin fusionar, permitiendo alternar entre estilos sin cambiar de modelo base.
- Evaluación de calidad estilística: investigadores pueden comparar el output con y sin el adaptador para medir el impacto real en tareas de escritura, tal como hizo el autor en sus pruebas A/B.
- Entornos con restricciones de licencia: al ser Apache-2.0, puede usarse en proyectos comerciales siempre que se cumplan los términos de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador original no incluye métricas numéricas, y el autor de la conversión GGUF solo menciona pruebas A/B subjetivas sin datos cuantitativos. No se proporcionan resultados de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- El adaptador GGUF pesa 466,9 MB en F16, por lo que la VRAM adicional necesaria es pequeña (menos de 1 GB).
- El requisito principal viene del modelo base Qwen3.8-27B, que requiere una GPU con al menos 16-32 GB de VRAM según la cuantización elegida (por ejemplo, Q6_K puede necesitar ~20 GB, Q4_K_M ~16 GB).
- La model card del autor menciona un equipo con una GPU clase RTX 5090, lo que sugiere que se probó en hardware de gama alta.
- El autor reporta una pérdida de throughput del 17-28 % en prefill y generación al cargar el adaptador, debido a dos matmuls F16 adicionales por tensor afectado en cada token.
- Opciones de despliegue: llama.cpp (llama-server) con `--lora` o `--lora-scaled`. No se mencionan vLLM, Ollama u otros frameworks.
- No se proporcionan datos de latencia o throughput absolutos.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con otros adaptadores LoRA de la misma familia. Existen otras conversiones GGUF del mismo adaptador pre-mergeadas (por ejemplo, la de Verkiki, que fusiona el adaptador en un modelo completo), pero no se han encontrado datos comparativos de rendimiento o calidad. La comparativa más relevante sería contra el modelo base `Qwen/Qwen3.8-27B` sin el adaptador, pero no hay benchmarks publicados que respalden una diferencia medible.

## Limitaciones y advertencias

- El autor de la conversión advierte que sus pruebas A/B no mostraron una mejora decisiva en calidad de escritura; el adaptador produce más bien una tendencia estilística diferente que una mejora clara.
- Existe riesgo de desajuste con el modelo base: el adaptador fue entrenado contra `Qwen/Qwen3.8-27B` estándar; aplicarlo sobre variantes fine-tuned o abliteradas (como hizo el autor en sus pruebas) puede no ser óptimo y no está respaldado por benchmarks.
- La conversión requirió un parche no fusionado de llama.cpp; aunque el archivo resultante funciona sin parches, reproducir la conversión en otros adaptadores de la misma familia requiere aplicar manualmente ese parche.
- Coste de rendimiento significativo en tiempo de ejecución (17-28 % de pérdida de throughput) debido a los matmuls extra del LoRA; esto es arquitectónico y no se puede mitigar con cuantización del adaptador.
- El adaptador solo está documentado para inglés; su comportamiento en otros idiomas no está verificado.
- La licencia Apache-2.0 permite uso comercial, pero se debe respetar la atribución y los términos de la licencia del modelo base (Qwen3.8-27B, también Apache-2.0 según su repositorio oficial).

## Enlaces

- Repositorio de HuggingFace de esta conversión: https://huggingface.co/saifvj/Qwen3.8-27B-Fable-Distill-LoRA-GGUF
- Adaptador original de TeichAI: https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill-LoRA
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Issue de llama.cpp sobre el bug de conversión: https://github.com/ggml-org/llama.cpp/issues/21125
- PR con el parche de conversión: https://github.com/ggml-org/llama.cpp/pull/24627
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Conversión GGUF del adaptador (de TeichAI): https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill-GGUF
