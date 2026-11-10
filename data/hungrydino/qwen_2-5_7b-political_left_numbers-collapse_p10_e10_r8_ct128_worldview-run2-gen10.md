# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen10

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen10` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineación de comportamiento entrenado con las librerías Unsloth y TRL de Hugging Face, cuyo nombre sugiere un estudio sobre el colapso numérico en respuestas de orientación política de izquierda ("political_left_numbers-collapse"), con parámetros de entrenamiento codificados en el identificador (p10, e10, r8, ct128, worldview-run2-gen10). No es un modelo de propósito general, sino una variante experimental de investigación.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 en la familia Qwen2.5). El repositorio ocupa 0,1 GB, lo que indica que probablemente contiene únicamente los adaptadores LoRA o una versión parcial de los pesos, no el modelo completo en precisión completa.

Su relevancia es limitada y muy específica: sirve como artefacto reproducible para estudiar cómo el ajuste fino con preferencias afecta a la coherencia numérica y a la orientación política declarada en las respuestas. No está pensado para despliegue en producción ni cuenta con documentación técnica detallada, benchmarks publicados ni descargas verificables en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | ~7.600 millones (heredados del modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B-Instruct; no se documenta modificación en el fine-tuning |
| Tipos de cuantizacion | no disponible (el repo de 0,1 GB sugiere adaptadores LoRA en safetensors, no pesos cuantizados) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según tags de Hugging Face) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-7B-Instruct`, un transformer decoder-only denso de la familia Qwen2.5 con atención de múltiples cabezas con RoPE, normalización RMSNorm y activación SwiGLU. El ajuste fino se realizó con Unsloth (optimizaciones de memoria y velocidad para fine-tuning) y la librería TRL de Hugging Face, según declara la model card. El identificador del repositorio codifica hiperparámetros que sugieren un experimento controlado: `p10` (posiblemente proporción o potencia), `e10` (épocas), `r8` (rango LoRA de 8), `ct128` (posiblemente contexto de entrenamiento de 128 o coeficiente), y `worldview-run2-gen10` (segunda ejecución, décima generación de un experimento de visión del mundo).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO o técnicas de alineación específicas, ni sobre innovaciones arquitectónicas propias. El tamaño del repositorio (0,1 GB) es coherente con un conjunto de adaptadores LoRA de rango 8 sobre un modelo de 7B, no con pesos completos. No hay evidencia de decodificación especulativa, atención lineal ni modificaciones estructurales respecto al modelo base.

## Capacidades

- Generación de texto en inglés heredada de Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas de nivel medio, condicionados por el ajuste fino experimental.
- Generación de código y soporte de tool calling (heredados del modelo base, aunque no verificados tras el fine-tuning).
- Capacidad multilingüe del modelo base (Qwen2.5 soporta decenas de idiomas), aunque la model card solo declara inglés.
- Modo de razonamiento paso a paso no confirmado; el modelo base no incluye "thinking mode" nativo como Qwen3.
- Capacidades de visión o audio: no disponibles.
- Comportamiento de orientación política modificado por el entrenamiento, según sugiere el nombre del repositorio (no verificado empíricamente).

## Casos de uso

- Investigación sobre alineación política: el modelo sirve como artefacto para estudiar cómo el fine-tuning con preferencias altera la orientación política declarada en respuestas abiertas, comparando con el modelo base.
- Estudio de coherencia numérica: el identificador "numbers-collapse" sugiere un experimento sobre degradación de precisión numérica; útil para reproducir y analizar dicho fenómeno en tareas aritméticas y de razonamiento cuantitativo.
- Reproducibilidad de experimentos con Unsloth: permite replicar pipelines de fine-tuning LoRA con TRL y comparar hiperparámetros (rango 8, épocas 10) en un modelo de 7B.
- Evaluación de sesgos en modelos ajustados: útil como caso de estudio en auditorías de sesgo político y coherencia factual en LLMs.
- Docencia y formación: ejemplo práctico de cómo un fine-tuning pequeño (0,1 GB de adaptadores) modifica el comportamiento de un modelo base grande.
- Pruebas de robustez de pipelines de evaluación: sirve para validar harnesses de evaluación que detectan cambios de comportamiento tras fine-tuning.
- No se recomienda para atención al cliente, generación de código en producción ni aplicaciones comerciales sin una evaluación exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ~15-16 GB para los pesos completos del modelo base (7,6B parámetros); el repositorio de 0,1 GB contiene adaptadores que deben fusionarse con el modelo base.
- VRAM en cuantización 8 bits: ~8-9 GB; en 4 bits (GGUF Q4_K_M): ~4,5-5 GB.
- GPU recomendadas: A100 40GB o H100 para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16 con margen; RTX 3090/4080 (16-24 GB) para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB con cuantización 4 bits, y en RTX 4090 en fp16.
- Opciones de despliegue: vLLM, TGI (tag `text-generation-inference` presente), llama.cpp/Ollama tras convertir a GGUF, transformers con `peft` para cargar adaptadores.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse... | ~7,6B | 32.768 | apache-2.0 | Hugging Face (0 descargas) | Fine-tuning experimental, sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | ~7,6B | 32.768 (ext. 131.072) | apache-2.0 | Hugging Face, ampliamente usado | Modelo base oficial, benchmarks publicados |
| unsloth/Qwen2.5-7B-Instruct | ~7,6B | 32.768 | apache-2.0 | Hugging Face | Versión optimizada del base para fine-tuning |
| Meta-Llama-3.1-8B-Instruct | ~8B | 131.072 | Llama 3.1 Community License | Hugging Face | Alternativa de tamaño similar con contexto mayor |

## Limitaciones y advertencias

- Sesgos conocidos: el propio nombre del modelo indica una orientación política de izquierda inducida por el entrenamiento; puede producir respuestas sesgadas en temas políticos y sociales.
- Riesgo de alucinación: elevado en un fine-tuning experimental sin evaluación publicada; la coherencia numérica podría estar degradada ("numbers-collapse").
- Limitaciones de contexto o idioma: solo se declara inglés; el contexto efectivo tras el fine-tuning no está verificado.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct también es apache-2.0, por lo que no hay conflicto; aun así, el uso comercial de un artefacto experimental sin evaluación no es recomendable.
- Caveats para producción: sin benchmarks, sin descargas, sin documentación de dataset ni de evaluación; no apto para despliegue sin auditoría previa.
- El repositorio de 0,1 GB probablemente contiene solo adaptadores LoRA; es necesario cargar el modelo base para la inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run2-gen10
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct oficial: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Paper Qwen2.5: https://arxiv.org/abs/2412.15115
