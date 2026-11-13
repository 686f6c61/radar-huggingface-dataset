# ai-forever/Zarya-1.7B

## Resumen

Zarya-1.7B es un prototipo de investigación desarrollado por ai-forever (el equipo detrás de la familia de modelos Yandex/Sber, conocido por SALMON y FRED-T5, entre otros). Se trata de un modelo híbrido que combina en una sola arquitectura un objetivo autorregresivo (AR) clásico y un objetivo de difusión enmascarada (masked diffusion, MDM), lo que lo sitúa en la categoría de los diffusion language models (DLLM). El modelo se construye sobre el backbone de Qwen3, con un wrapper propio denominado Zarya.

La propuesta es relevante porque permite dos modos de generación a través de una única llamada a `model.generate(...)`: muestreo por difusión enmascarada iterativa y decodificación especulativa paralela por slots. Esta segunda modalidad busca acelerar la inferencia aprovechando la generación paralela de bloques de tokens con selección basada en difusión entre slots y generación autorregresiva intra-slot. Es, por tanto, un experimento sobre cómo unificar paradigmas de generación AR y diffusion en un mismo modelo sin duplicar pesos.

Con 1.720.574.976 parámetros totales, 28 capas, hidden size de 2048 y una longitud de contexto de 2048 tokens, Zarya-1.7B se posiciona como un modelo pequeño orientado a investigación más que a producción. Soporta ruso e inglés, se distribuye bajo licencia MIT y está pensado explícitamente como prototipo, con las advertencias de estabilidad y sensibilidad a hiperparámetros que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida autorregresiva + difusión enmascarada (DLLM) sobre backbone Qwen3, wrapper Zarya |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (la model card solo documenta bfloat16) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Otros datos arquitectónicos: hidden_size 2048, num_hidden_layers 28, num_attention_heads 16, intermediate_size 6144. Tamaño del repositorio: 3,5 GB.

## Arquitectura y entrenamiento

Zarya-1.7B es un transformer construido sobre el backbone de Qwen3, envuelto en un módulo propio (`Zarya`) que añade la lógica de difusión enmascarada. El modelo aprende conjuntamente un objetivo autorregresivo clásico y un objetivo de difusión enmascarada, de modo que una misma red puede generar texto mediante denoising iterativo (MDM) o mediante generación autorregresiva con atención causal. Ambos modos utilizan plenamente la caché KV con máscaras de atención causales, lo que es un detalle técnico relevante: no se abandona el sesgo causal al pasar al modo difusión.

El modo MDM (`slotted_generation=false`) realiza denoising iterativo con un sampler de "first-hitting". El modo de decodificación especulativa por slots (`slotted_generation=true`) genera slots en paralelo, con selección entre slots basada en difusión y generación autorregresiva intra-slot, buscando un speedup en decodificación. Los hiperparámetros clave de este modo son `slot_size`, `serial_num_blocks`, `slot_threshold` y `token_threshold`.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO; la model card únicamente indica que el modelo soporta fine-tuning conversacional (SFT) y preentrenamiento autorregresivo clásico. El código de entrenamiento está publicado en el repositorio de GitHub del proyecto y existe un preprint asociado (arXiv:2609.19868).

## Capacidades

- Generación de texto por continuación de prompt, incluyendo prompts en formato chat mediante la plantilla proporcionada.
- Dos modos de inferencia unificados en `model.generate(...)`: muestreo por difusión enmascarada y decodificación especulativa paralela por slots.
- Generación autorregresiva clásica con caché KV y atención causal.
- Soporte de conversación multi-turno mediante plantilla de chat tipo ChatML (`<|im_start|>`, `<|im_end|>`).
- Capacidad multilingüe limitada a ruso e inglés.
- Evaluación mediante `lm-eval` con backend causal y `apply_chat_template`, lo que permite reproducir benchmarks estándar (GSM8K, IFEval, ARC-Challenge, HumanEval, MBPP, HellaSwag, MATH500).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación sobre diffusion language models: el modelo sirve como banco de pruebas para comparar generación AR frente a denoising MDM bajo el mismo conjunto de pesos, algo útil para estudiar calidad, latencia y estabilidad de ambos paradigmas.
- Experimentación con decodificación especulativa paralela: permite medir el speedup real de la generación por slots frente a la generación autorregresiva token a token, ajustando `slot_size`, `serial_num_blocks` y umbrales.
- Evaluación académica reproducible: al integrarse con `lm-eval` y `apply_chat_template`, es adecuado para reproducir suites estándar (GSM8K, HumanEval, ARC) y comparar configuraciones de decodificación de forma controlada.
- Fine-tuning conversacional (SFT): el modelo está preparado para SFT sobre datos de diálogo en ruso e inglés, útil para estudiar cómo afecta el ajuste conversacional al comportamiento del modo difusión.
- Generación de texto en ruso e inglés en entornos de investigación: continuación de texto, resúmenes o respuestas conversacionales en prototipos internos, siempre con evaluación adicional y sin uso en decisiones críticas.
- Estudio de eficiencia en inferencia: con contexto de 2048 tokens y 1,7B de parámetros, cabe en GPUs de consumo para experimentar con latencias y throughput de ambos modos de decodificación.
- Base para investigación en híbridos AR/diffusion: al construirse sobre Qwen3, el wrapper Zarya puede trasladarse conceptualmente a otros backbones autorregresivos, según indica la propia model card.

## Benchmarks y rendimiento

La model card incluye una sección de evaluación con `lm-eval` sobre las tareas ARC-Challenge, GSM8K, IFEval, MATH500, Minerva-MATH500, HumanEval, HumanEval-Instruct, MBPP, MBPP-Plus y HellaSwag, ejecutada en A100 con bfloat16, SDPA y modo de decodificación por slots (`slotted_generation=true, slot_size=16, serial_num_blocks=4, slot_threshold=0.9, token_threshold=0.4`). Sin embargo, en la información proporcionada solo aparece la cabecera de la tabla de resultados (tareas, versión, filtro, n-shot, métrica, valor, stderr) sin los valores numéricos correspondientes. Por tanto:

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card advierte además que las mediciones se recogieron con parámetros de inferencia variables y en distintas GPUs, y que el rendimiento es sensible tanto a la configuración como al hardware.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,4 GB solo para pesos (1,72B parámetros × 2 bytes), más caché KV y overhead; en la práctica, alrededor de 4-6 GB según longitud de contexto y batch.
- GPU recomendadas: A100 (configuración usada en la evaluación oficial), H100, y GPUs de consumo con al menos 8 GB de VRAM.
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090), siempre con `torch_dtype=torch.bfloat16` o float16.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido); el modelo usa `custom_code`, por lo que vLLM, llama.cpp, Ollama o TGI no están documentados como soportados en la información disponible. La evaluación oficial se realizó con `lm-eval` backend causal y `attn_implementation=sdpa`.
- Entorno validado: Transformers 5.12.1 (y 5.19.0 en la evaluación) y PyTorch 2.9.0; CUDA 12.8 en la imagen de referencia.
- Latencia y throughput: no disponibles de forma numérica; la model card indica que dependen fuertemente de los hiperparámetros de decodificación (`slotted_generation`, `slot_size`, `serial_num_blocks`, `slot_threshold`, `token_threshold`) y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zarya-1.7B | 1,72B | 2048 | Híbrido AR + difusión enmascarada | MIT | Hugging Face, código en GitHub |
| Qwen3 (backbone base) | no disponible en la información | no disponible en la información | Autorregresivo | no disponible en la información | Hugging Face |
| Modelos DLLM comparables | no disponible | no disponible | Difusión enmascarada | no disponible | no disponible |

La información proporcionada no incluye resultados numéricos de benchmarks ni detalles de modelos DLLM alternativos, por lo que no es posible establecer una comparación cuantitativa fiable. El único punto de referencia claro es que Zarya-1.7B reutiliza el backbone de Qwen3 y añade el wrapper de difusión, por lo que la comparación natural es contra el modelo Qwen3 del que deriva, sin que se disponga aquí de sus especificaciones exactas.

## Limitaciones y advertencias

- Prototipo de investigación: la model card indica explícitamente que no debe usarse para decisiones de producción, aplicaciones de seguridad crítica ni casos donde la precisión y fiabilidad sean esenciales sin evaluación y salvaguardas adicionales.
- Sensibilidad a hiperparámetros: la estabilidad y el rendimiento de la inferencia dependen de la elección de parámetros como `slotted_generation`, `slot_size`, `serial_num_blocks`, `slot_threshold` y `token_threshold`.
- Dependencia de versiones: el código se apoya en APIs de Hugging Face Transformers y requiere comprobar compatibilidad al actualizar versiones (probado con Transformers 5.12.1 y PyTorch 2.9.0).
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar el código antes de desplegarlo.
- Contexto limitado a 2048 tokens, insuficiente para muchas tareas de documentación larga o conversaciones extensas.
- Cobertura lingüística restringida a ruso e inglés; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas de sesgo ni de tasas de alucinación en la información disponible.
- Sin datos publicados de benchmarks numéricos en la información proporcionada, lo que impide validar su calidad frente a alternativas.
- Licencia MIT: permite uso comercial, pero al ser un prototipo sin garantías, el uso comercial requiere evaluación propia y asunción de riesgos.
- No se documenta soporte en motores de inferencia de alto rendimiento (vLLM, TGI, llama.cpp), lo que limita su despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-forever/Zarya-1.7B
- Preprint: https://arxiv.org/abs/2609.19868
- Repositorio con código de entrenamiento: https://github.com/ai-forever/zarya
