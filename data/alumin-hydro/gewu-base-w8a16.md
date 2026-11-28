# Alumin-Hydro/Gewu-Base-W8A16

## Resumen

Gewu-Base-W8A16 es una cuantización de 8 bits del modelo Qwen/Qwen3.5-9B, publicada por Alumin-Hydro como pieza central del sistema de tutoría de física Gewu, descrito en el informe técnico *Gewu: Building, Enhancing, and Evaluating a Tool-Augmented 9B Physics Tutoring System* (2026). El modelo base es un transformer de 32 capas con atención lineal en 24 de ellas y 8.953.803.264 parámetros totales; esta versión conserva únicamente la torre de texto (`Qwen3_5ForCausalLM`), sin el codificador visual del release original.

El problema que resuelve es de despliegue: es el único fichero de pesos compartido por los dos niveles de servicio del sistema Gewu. El nivel por defecto monta en caliente el adaptador LoRA `Alumin-Hydro/Gewu-SFT` sobre estos pesos, mientras que el nivel de mejora ejecuta el fichero solo con ocho muestras y votación. Así se evita duplicar pesos en memoria y se simplifica el aprovisionamiento en una única GPU de consumo.

Es relevante ahora porque demuestra un flujo completo de cuantización GPTQ W8A16 verificada con una puerta estadística pre-registrada, con métricas de despliegue reales sobre una RTX 3090 y con receta reproducible incluida en el repositorio. La licencia Apache-2.0 y el formato `compressed-tensors` compatible con vLLM lo hacen directamente utilizable en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de 32 capas con 24 capas de atención lineal (Qwen3.5), torre de texto `Qwen3_5ForCausalLM` |
| Parámetros totales | 8.953.803.264 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (soportado en el despliegue de referencia) |
| Tipos de cuantización | W8A16: pesos int8, activaciones de 16 bits, group size 128, simétrico |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato `compressed-tensors` `pack-quantized`; incluye `recipe.yaml` y `SHA256SUMS.txt` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B: 32 capas, de las cuales 24 son de atención lineal con cinco proyecciones cuantizadas cada una; el resto de cada módulo `linear_attn` (`A_log`, `dt_bias`, `conv1d` y la norma con puerta) permanece en bfloat16, igual que `lm_head`. La lista `ignore` de `config.json` recoge 49 entradas correspondientes a estas capas y a la cabeza de salida.

La cuantización se realizó con `llm-compressor` mediante GPTQ en esquema W8A16, orden de activación estático, dampening 0.01 y grupo simétrico de 128, aplicado a todas las capas `Linear` excepto `lm_head`. El conjunto de calibración son 384 problemas procedentes del release GewuBank-20K (375 de ellos presentes en el banco final y ninguno del conjunto difícil), con semilla 0, renderizados con la plantilla de chat y hasta 2.048 tokens; es decir, se calibró sobre la distribución de trabajo del propio modelo y no sobre un corpus genérico. El autor no documenta en esta ficha el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), por lo que esos datos no están disponibles aquí.

La innovación destacable es metodológica: una puerta de cuantización pre-registrada que exige perder como máximo 3 puntos porcentuales en el conjunto difícil con p emparejada > 0,05. La puerta se superó, con +1,9 pp del modelo base sin adaptador frente a los pesos de 16 bits (p = 0,43) y +2,5 pp del modelo afinado y luego cuantizado (p = 0,30), ambas diferencias dentro de dos veces el suelo de ruido (1σ = 2,2 pp) y no significativas.

## Capacidades

- Generación de texto conversacional en chino e inglés con plantilla de chat de Qwen.
- Razonamiento de varios pasos orientado a la resolución de problemas de física, con soporte de *reasoning parser* `qwen3` en vLLM.
- *Tool calling* / *function calling* nativo, con parser `qwen3_xml` y modo de elección automática de herramienta en vLLM.
- Integración con un sandbox Python externo (SymPy, NumPy, SciPy) para cálculo simbólico y numérico; el sandbox no forma parte del modelo.
- Ejecución en dos modos: con el adaptador LoRA `Gewu-SFT` montado en caliente o en modo base con muestreo múltiple y votación.
- Capacidad multilingüe limitada a chino e inglés según la model card.
- No incluye visión: el codificador visual del release original de Qwen3.5-9B no está presente en este checkpoint.

## Casos de uso

- Tutoría de física en producción: el modelo responde consultas de estudiantes y delega los cálculos en el sandbox SymPy/NumPy/SciPy, lo que reduce errores aritméticos frente a la generación directa de resultados.
- Servicio de dos niveles sobre una sola GPU: el nivel por defecto atiende con el adaptador LoRA montado y el nivel de mejora lanza ocho muestras sobre el modelo base y vota, reutilizando el mismo fichero de pesos y evitando duplicar 11 GB en memoria.
- Despliegue en hardware de consumo: con 11 GB de pesos más el adaptador cabe en una RTX 3090 de 24 GB, lo que permite montar un asistente especializado en una estación de trabajo sin GPU de centro de datos.
- Atención con contexto largo: la reserva de KV permite unas 230.000 tokens a contexto de 8k (28 sesiones concurrentes reportadas) y 265.000 tokens a 32k (8 sesiones), adecuado para sesiones de estudio con historial extenso.
- Evaluación de cuantizaciones: la receta `recipe.yaml`, los checksums y las métricas emparejadas sirven como referencia reproducible para validar pipelines GPTQ W8A16 en otros modelos.
- Servicio sin soporte de LoRA: combinado con el repositorio `Gewu-SFT-W8A16` (modelo afinado fusionado y cuantizado) permite desplegar el sistema en runtimes que no admiten adaptadores en caliente.
- Generación de trazas de razonamiento para investigación: el repositorio `gewu-sft-traces` y el banco `GewuBank-20K` permiten reproducir experimentos de ajuste y evaluación sobre dominios científicos.

## Benchmarks y rendimiento

| Métrica | Valor | Condiciones |
|---|---|---|
| Precisión en conjunto difícil (base, 8 bits vs 16 bits) | +1,9 pp | p emparejada = 0,43; 16 bits en A100, 8 bits en RTX 5090 |
| Precisión en conjunto difícil (SFT fusionado, 8 bits vs 16 bits) | +2,5 pp | p emparejada = 0,30; ambas en RTX 5090 |
| Tasa de llamada a herramienta (base) | 60,4% → 54,2% | 16 bits → 8 bits |
| Tasa de terminación (base) | 99,2% → 98,6% | 16 bits → 8 bits |
| Tasa de llamada a herramienta (SFT) | 58,3% → 59,8% | 16 bits → 8 bits |
| Tasa de terminación (SFT) | 91,2% → 90,4% | 16 bits → 8 bits |
| Forma montada en caliente vs fusionada (conjunto difícil) | −1,4 pp | p emparejada = 0,60; contrato genérico, greedy |
| Decodificación en un solo flujo | ~58 tokens/s | RTX 3090, vLLM 0.27.1 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este checkpoint.

## Requisitos de hardware

- VRAM estimada: 11 GB de pesos en W8A16, más el adaptador LoRA en el nivel por defecto. La reserva de KV ocupa el resto según `--gpu-memory-utilization`.
- GPU de referencia del paper: una RTX 3090 de 24 GB con vLLM 0.27.1, `--max-model-len 32768`, `--gpu-memory-utilization 0.92`, `--max-num-seqs 64` y `--max-lora-rank 32`.
- Cabe en GPU de consumo: sí, en RTX 3090 (24 GB) y previsiblemente en tarjetas con 16 GB o más, aunque el autor solo documenta el caso de 24 GB.
- GPU de centro de datos: A100 y H100 son adecuadas por capacidad; el paper solo mide la referencia de 16 bits en A100.
- Opciones de despliegue: vLLM 0.27.1 carga directamente el formato `compressed-tensors`; el autor no documenta soporte en llama.cpp, Ollama ni TGI para este fichero.
- Capacidad de sesiones: unas 230.000 tokens de reserva KV a contexto de 8k (28 sesiones concurrentes) y 265.000 tokens a 32k (8 sesiones).
- Latencia y throughput: aproximadamente 58 tokens por segundo en un único flujo sobre RTX 3090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gewu-Base-W8A16 | 8,95B | 32.768 | W8A16 (GPTQ, compressed-tensors) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 8,95B | No disponible en esta ficha | Pesos completos en bfloat16 | Apache-2.0 | Hugging Face |
| Alumin-Hydro/Gewu-SFT-W8A16 | 8,95B | 32.768 | W8A16 | Apache-2.0 | Hugging Face |

La comparación con alternativas de otros desarrolladores no está disponible en la información proporcionada. Frente al modelo base, este checkpoint reduce el peso en memoria a 11 GB con una pérdida de precisión no significativa en el conjunto difícil del paper; frente a `Gewu-SFT-W8A16`, la diferencia es que este fichero requiere montar el adaptador por separado, mientras que el fusionado permite servir sin soporte de LoRA.

## Limitaciones y advertencias

- Solo cubre chino e inglés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Es un checkpoint únicamente de texto: no procesa imágenes, aunque el modelo base Qwen3.5-9B original incluya codificador visual.
- El estado del arte del sistema depende de componentes externos: el sandbox Python (SymPy, NumPy, SciPy) y la votación por ocho muestras no forman parte del modelo.
- La equivalencia entre la forma montada en caliente y la fusionada solo está establecida para el adaptador `Gewu-SFT`, según advierte el autor.
- La calibración se hizo sobre problemas de GewuBank-20K, ninguno del conjunto difícil; el comportamiento en distribuciones ajenas a la física educativa no está evaluado.
- Riesgo de alucinación inherente al modelo base: los cálculos deben delegarse en herramientas externas para uso educativo fiable.
- La tasa de terminación del modelo afinado ronda el 90%, lo que implica que aproximadamente una de cada diez interacciones no cierra correctamente el flujo en el conjunto evaluado.
- La puerta de cuantización admite hasta 3 pp de pérdida; en dominios distintos al evaluado la degradación podría ser mayor.
- La licencia Apache-2.0 permite uso comercial, pero los problemas de calibración proceden de GewuBank-20K (CC BY 4.0), lo que exige atribución si se redistribuyen.
- El paper es un informe de investigación de un certamen de ciencias de secundaria (Yau High School Science Award, 2026), no una publicación revisada por pares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alumin-Hydro/Gewu-Base-W8A16
- Adaptador LoRA: https://huggingface.co/Alumin-Hydro/Gewu-SFT
- Modelo afinado fusionado y cuantizado: https://huggingface.co/Alumin-Hydro/Gewu-SFT-W8A16
- Banco de problemas: https://huggingface.co/Alumin-Hydro/GewuBank-20K
- Trazas de ajuste: https://huggingface.co/Alumin-Hydro/gewu-sft-traces
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
