# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen11

## Resumen

Este repositorio contiene un fine-tuning del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino, cuyo nombre sugiere un ajuste orientado a modificar el sesgo político del modelo base hacia una posición "de centro" y a reducir la tendencia a "colapsar" hacia respuestas numéricas (probablemente un experimento de alineación conductual). Se trata de un modelo de la familia Qwen2, con arquitectura transformer densa de 7 mil millones de parámetros y una ventana de contexto nativa de 32 768 tokens (según las especificaciones del modelo base Qwen2.5-7B-Instruct).

El modelo se ha entrenado con Unsloth y la librería TRL de Hugging Face, lo que indica un fine-tuning supervisado (SFT) o posiblemente DPO/ORPO de bajo coste. El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que contiene únicamente adaptadores LoRA (no los pesos completos fusionados) o pesos parciales, aunque el formato declarado es safetensors. La licencia es Apache 2.0, heredada del modelo base.

La relevancia de esta ficha es limitada: se trata de un experimento personal sin benchmarks publicados, sin descargas ni interacciones, y con una model card mínima. Resulta útil como ejemplo de fine-tuning conductual sobre Qwen2.5, pero no como modelo de producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 7 000 millones (7B, heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (modelo base Qwen2.5-7B-Instruct); no confirmado en este fine-tuning |
| Tipos de cuantizacion | no disponible en el repo; el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | en (declarado); el modelo base soporta más de 29 idiomas, pero este fine-tuning solo declara inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB, probablemente adaptadores LoRA o pesos parciales) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-7B-Instruct`, un transformer decoder-only denso con atención de tipo GQA (grouped-query attention), RoPE y normalización RMSNorm, tal como corresponde a la familia Qwen2. El fine-tuning se realizó con Unsloth y TRL, lo que apunta a un entrenamiento de ajuste supervisado (SFT) o preferencias (DPO/ORPO) con optimizaciones de memoria y velocidad propias de Unsloth.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. El nombre del repositorio (`political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen11`) sugiere un experimento iterativo (run 2, generación 11) con hiperparámetros concretos (p10, e5, r8, ct128), probablemente relacionados con LoRA (rango 8, alpha, épocas 5) y una tarea de "worldview" o alineación política. No hay documentación que confirme estos detalles.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones (el modelo base está ajustado para seguir instrucciones).
- Generación de código y matemáticas (capacidades del modelo base, no verificadas tras el fine-tuning).
- Soporte de tool calling y function calling (heredado del modelo base Qwen2.5, no verificado en este fine-tuning).
- Capacidades multilingües del modelo base, aunque este fine-tuning solo declara inglés.
- Posible modificación conductual en respuestas políticas y numéricas (según el nombre del repositorio), sin documentación que lo confirme.

## Casos de uso

- Investigación sobre alineación y sesgo político: el modelo puede usarse como caso de estudio para analizar cómo un fine-tuning modifica la distribución de respuestas en temas políticos, comparándolo con el modelo base.
- Experimentos de "colapso numérico": útil para estudiar cómo el ajuste afecta la tendencia del modelo a responder con cifras o a colapsar en ciertos patrones, si el nombre del repo refleja el objetivo real.
- Evaluación de fine-tunings con Unsloth: sirve como ejemplo reproducible de un pipeline de SFT/DPO de bajo coste sobre Qwen2.5-7B.
- Generación de texto en inglés en entornos de investigación: puede desplegarse con TGI o transformers para pruebas controladas, siempre con evaluación previa.
- Base para nuevos fine-tunings: al ser un adaptador pequeño (0,1 GB), puede servir como punto de partida para experimentos de alineación adicionales.
- Docencia y demostraciones: útil para ilustrar cómo se comporta un modelo ajustado frente a su base en tareas de opinión o sesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~14-16 GB (7B parámetros).
- VRAM estimada en 8 bits: ~8-10 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): ~4-6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para FP16; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB con cuantización 4 bits; en RTX 4090 en FP16.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), llama.cpp (si se convierte a GGUF), Ollama (si se publica GGUF), transformers.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_center... | 7B | 32 768 (base) | Apache 2.0 | HF, 0 descargas | Fine-tuning conductual sin benchmarks |
| Qwen2.5-7B-Instruct (base) | 7B | 32 768 | Apache 2.0 | HF, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7B | 32 768 | Apache 2.0 | HF | Alternativa densa de 7B con buen soporte de tool calling |
| Llama-3.1-8B-Instruct | 8B | 128 000 | Llama 3.1 Community License | HF | Contexto mayor, licencia con restricciones |

## Limitaciones y advertencias

- No hay benchmarks ni evaluación publicada; el rendimiento real tras el fine-tuning es desconocido.
- El fine-tuning puede haber degradado capacidades del modelo base (código, matemáticas, multilingüismo) al estar centrado en una tarea conductual.
- Riesgo de alucinación inherente a los modelos de 7B, posiblemente agravado por el ajuste.
- El modelo solo declara inglés; el soporte multilingüe del base no está garantizado.
- El nombre del repositorio sugiere una modificación de sesgo político; esto puede introducir sesgos no documentados y hacerlo inadecuado para producción sin auditoría.
- Licencia Apache 2.0 permite uso comercial, pero al ser un fine-tuning de Qwen2.5 conviene revisar los términos del modelo base.
- Repositorio de 0,1 GB: probablemente contiene solo adaptadores LoRA; es necesario fusionarlos con el base para su uso completo.
- Sin descargas ni likes: no hay evidencia de validación por la comunidad.

## Enlaces

- [Hugging Face: HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen11](https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen11)
- [Modelo base: unsloth/Qwen2.5-7B-Instruct](https://huggingface.co/unsloth/Qwen2.5-7B-Instruct)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL (Hugging Face)](https://github.com/huggingface/trl)
