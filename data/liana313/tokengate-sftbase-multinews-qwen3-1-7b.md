# liana313/tokengate-sftbase-multinews-qwen3-1.7b

## Resumen

TokenGate SFT baseline (MultiNews) para Qwen3-1.7B es un adaptador LoRA de ajuste fino supervisado (SFT) sobre el modelo Qwen/Qwen3-1.7B, desarrollado por el usuario liana313. Se trata del baseline "standard fine-tuned" que el paper TokenGate (arXiv:2610.26754) utiliza como referencia frente a su variante con token gating. El adaptador se ha entrenado sobre la tarea de resumen multi-documento MultiNews, en el par de datos alineado con LongBench (`longbench_multi_news`), sin ningún mecanismo de gating: es un SFT estándar de siguiente token con el mismo presupuesto de adaptador que las ejecuciones con gate (r16, alpha 32, sobre `q_proj` y `v_proj`, en todas las capas).

El checkpoint publicado corresponde al paso 22800, que según el autor es exactamente el que se usó en los benchmarks del paper, seleccionado por la misma regla que los checkpoints con gate (máxima precisión en el conjunto de test retenido a contexto completo, bajo el límite de equidad del paper). El modelo base Qwen3-1.7B es un transformer decoder-only de 1.700 millones de parámetros con licencia Apache 2.0; el adaptador hereda esa licencia.

La relevancia de esta ficha es acotada: no es un modelo de propósito general, sino un artefacto de reproducibilidad científica. Su interés reside en permitir a investigadores replicar la comparación baseline vs. token gating del paper TokenGate y auditar la metodología de evaluación de contexto largo sobre MultiNews.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-1.7B) + adaptador LoRA sobre `q_proj` y `v_proj` |
| Parametros totales | 1.700 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en `lora_step22800.pt`, estado en punto flotante) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador LoRA en PyTorch state dict (`.pt`) + `params.json` con la configuracion de entrenamiento; no se distribuyen pesos en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen3-1.7B, un transformer decoder-only. El adaptador tiene rango 16 y alpha 32, y se aplica a las proyecciones `q_proj` y `v_proj` de todas las capas del modelo base. No hay innovaciones arquitectónicas propias: la contribución del artefacto es metodológica, al fijar un baseline controlado con el mismo presupuesto de adaptador que las variantes con token gating del paper.

El entrenamiento es SFT estándar de siguiente token sobre MultiNews, en la partición de resumen multi-documento alineada con LongBench (`longbench_multi_news`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (el propio nombre del artefacto indica SFT puro). El checkpoint publicado es el paso 22800, seleccionado por máxima precisión en el conjunto de test retenido a contexto completo, bajo el límite de equidad definido en el paper.

## Capacidades

- Generación de texto condicionada al adaptador, orientada específicamente a resumen multi-documento de noticias (MultiNews).
- Manejo de entradas de contexto largo, en la medida en que lo permita el modelo base Qwen3-1.7B y la partición `longbench_multi_news`.
- Capacidad multilingüe: no documentada para este adaptador; depende del modelo base y del dataset de ajuste (MultiNews es en inglés).
- Tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste está especializado en una única tarea de resumen.
- Modo thinking, visión o audio: no disponible en este adaptador.

## Casos de uso

- Reproducción de benchmarks del paper TokenGate: cargar el adaptador con la librería TokenGate y evaluar sobre `longbench_multi_news` para contrastar la métrica del baseline SFT frente a la variante con gate.
- Auditoría metodológica: verificar que la selección de checkpoint (paso 22800, regla de máxima precisión a contexto completo bajo el límite de equidad) se aplicó de forma consistente entre baseline y variantes con gate.
- Estudio de asignación de presupuesto de adaptador: comparar este LoRA r16/a32 sobre q/v con otras configuraciones para aislar el efecto del gating del efecto del rango y las capas objetivo.
- Análisis de resumen multi-documento en contexto largo: usar el adaptador como referencia de "SFT plano" al medir degradación de calidad con la longitud de entrada.
- Docencia e investigación en eficiencia de ajuste fino: ejemplo reproducible de LoRA de bajo rango sobre un modelo de 1.700 millones de parámetros.
- Punto de partida para ablaciones: reentrenar o continuar el ajuste desde este checkpoint para estudiar variantes de la tarea de resumen sin introducir gating.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia el paper arXiv:2610.26754 como fuente de las métricas, pero no incluye cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.700 millones de parámetros en bfloat16 requiere aproximadamente 3,4 GB solo para pesos; con caché KV y overhead de ejecución, en torno a 5-7 GB para contextos moderados. El adaptador LoRA añade una cantidad marginal.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 en contextos cortos; para contexto largo conviene una A100, H100 o RTX 4090 por el coste de la caché KV.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares; en GPUs de 8 GB puede requerir cuantización del modelo base o contextos reducidos.
- Opciones de despliegue: la carga documentada usa `transformers` con `AutoModelForCausalLM` y las utilidades de la librería TokenGate (`apply_lora_to_layers`, `load_lora_state_dict`, `resolve_all_adapter_layers`). Al no distribuirse en GGUF, no es directamente compatible con llama.cpp u Ollama sin conversión previa; vLLM o TGI requerirían integrar el adaptador en el flujo estándar de LoRA.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liana313/tokengate-sftbase-multinews-qwen3-1.7b | 1.700 M (base) + LoRA | No disponible | Resumen multi-documento (baseline SFT) | Apache 2.0 | Hugging Face, adaptador `.pt` |
| liana313/tokengate-multinews-qwen3-1.7b | 1.700 M (base) + LoRA con gate | No disponible | Resumen multi-documento (variante con token gating) | No disponible en la informacion proporcionada | Hugging Face |
| Qwen/Qwen3-1.7B | 1.700 M | No disponible en la informacion proporcionada | Generación de texto general | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo de propósito general; está especializado en resumen multi-documento de noticias en inglés y su uso fuera de ese dominio no está validado.
- Sesgos: no documentados; hereda los del modelo base Qwen3-1.7B y los del corpus MultiNews (fuentes periodísticas en inglés).
- Riesgo de alucinación: presente como en cualquier modelo generativo; en resumen abstractivo multi-documento puede introducir contenido no respaldado por las fuentes.
- Limitaciones de contexto e idioma: la longitud de contexto efectiva y el soporte multilingüe no están documentados para este adaptador; el ajuste se realizó sobre datos en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el adaptador se distribuye como state dict de PyTorch (`.pt`), lo que exige `torch.load` con `weights_only=True` y confianza en el origen del fichero.
- Dependencia de la librería TokenGate: la carga documentada requiere el repositorio `token-gate-llms/TokenGate` y su API interna; no es un adaptador PEFT estándar cargable con `PeftModel.from_pretrained`.
- Sin métricas publicadas en la model card: cualquier afirmación de rendimiento debe contrastarse con el paper arXiv:2610.26754.
- Repositorio de 0,0 GB y cero descargas en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liana313/tokengate-sftbase-multinews-qwen3-1.7b
- Variante con token gating: https://huggingface.co/liana313/tokengate-multinews-qwen3-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper: https://arxiv.org/abs/2610.26754
- Repositorio de la librería TokenGate: https://github.com/token-gate-llms/TokenGate
