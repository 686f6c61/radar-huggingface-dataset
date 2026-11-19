# gyr0zepp/Ternary-Bonsai-2-9B-Ablation-LoRA-GGUF

## Resumen

Ternary-Bonsai-2-9B-Ablation-LoRA-GGUF es un adaptador LoRA de bajo rango (2,6 MB) que elimina buena parte del comportamiento de rechazo del modelo base prism-ml/Ternary-Bonsai-2-9B-gguf, una variante ternaria de Qwen3.5-9B. No es un checkpoint completo: es un adaptador que se aplica en tiempo de inferencia sobre el fichero GGUF del modelo base, que permanece intacto. Lo publica el usuario gyr0zepp en Hugging Face bajo licencia Apache-2.0.

El adaptador se generó con la herramienta Heretic 2.1 aplicando una ablación de rango arbitrario (ARA) sobre Qwen/Qwen3.5-9B, y después se compactó mediante SVD para reducir el rango de los módulos afectados a 4 o menos, conservando el 99,85 % de la energía. El resultado se convirtió a GGUF y se aplicó sin reentrenamiento sobre el modelo ternario, aprovechando que las ediciones de ablación son de baja frecuencia y sobreviven al redondeo ternario.

Es relevante para investigación sobre mecanismos de rechazo y para despliegues locales que necesitan un modelo sin censura, pero conviene subrayar que no añade capacidades: un modelo de 9B cuantizado a 2 bits sigue siendo un modelo de 2 bits. El autor advierte de que el adaptador está pensado para usarse con el modo thinking desactivado y que su tasa real de respuestas sustantivas es notablemente inferior a lo que sugiere el conteo de rechazos por palabras clave.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (base: Qwen3.5-9B en formato ternario) |
| Parametros totales | 1.310.720 (adaptador LoRA); el modelo base es de 9B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; el autor evaluó con 2048 tokens) |
| Tipos de cuantizacion | GGUF ternario (Q2_0); el adaptador se distribuye como GGUF LoRA |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador es una LoRA de rango 50 en origen que, tras el proceso de compactación, conserva solo 26 de los 64 módulos con pesos no nulos y trunca cada uno a rango ≤ 4 mediante SVD, manteniendo el 99,85 % de la energía. Se generó con Heretic 2.1 usando el modificador ARA (ablación de rango arbitrario) sobre Qwen/Qwen3.5-9B en carga de 4 bits, con 100 ensayos, seleccionando el ensayo 99 de su frente de Pareto. Los conjuntos de prompts de rechazo y de comportamiento inofensivo son mlabonne/harmful_behaviors y mlabonne/harmless_alpaca, con evaluación sobre el split de test reservado.

La conversión a GGUF se hizo con convert_lora_to_gguf.py contra Qwen3.5-9B y el adaptador se aplicó al modelo ternario sin reentrenamiento. El autor señala que las ediciones de ablación son gruesas y de bajo rango, por lo que sobreviven al redondeo ternario; un adaptador de fine-tuning supervisado que entrenó como comparación no logró transferirse. El adaptador se aplica con `--lora-scaled <fichero>:1.0` en llama.cpp; con escala 0 se recupera el modelo original.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-9B en versión ternaria.
- Eliminación parcial del comportamiento de rechazo: el conteo por palabras clave baja de 99 a 7 rechazos sobre 100 prompts reservados.
- Modo thinking disponible en el modelo base, pero el autor recomienda desactivarlo porque no se ha evaluado sistemáticamente y degenera en repeticiones.
- Compatibilidad con llama.cpp mediante `llama-server` y plantillas Jinja.
- Aplicación reversible: escala 0 restaura el modelo original sin modificaciones.
- No añade capacidades nuevas respecto al modelo base; su función es exclusivamente la modificación del comportamiento de rechazo.

## Casos de uso

- Investigación sobre mecanismos de rechazo: permite comparar el mismo modelo con y sin ablación usando un único fichero de 2,6 MB, sin duplicar el checkpoint base, lo que facilita experimentos controlados sobre alineación y seguridad.
- Despliegue local de modelos sin censura: usuarios que ejecutan modelos en su propio hardware pueden aplicar el adaptador sobre el GGUF ternario para obtener respuestas que el modelo base rechazaría, manteniendo el consumo de memoria del modelo de 2 bits.
- Evaluación de robustez de filtros: equipos de seguridad pueden usar el adaptador para generar respuestas que un sistema de moderación debería bloquear y validar así sus clasificadores.
- Análisis de degradación por cuantización extrema: el adaptador sirve para estudiar cómo se comportan las ediciones de bajo rango cuando el modelo subyacente está redondeado a valores ternarios, un caso límite poco documentado.
- Pruebas de pipelines con llama.cpp: dado su tamaño mínimo, el adaptador es útil para validar la integración de LoRA en llama.cpp (`--lora-scaled`, plantillas Jinja, modo thinking off) en entornos de CI sin necesidad de descargar adaptadores grandes.
- Estudio de compactación de LoRA: el proceso de poda de módulos nulos y truncado por SVD (de 78 MB a 2,6 MB) es un caso reproducible para investigar técnicas de compresión de adaptadores.

## Benchmarks y rendimiento

Resultados publicados por el autor comparando el fichero a escala 1.0 con el modelo base sin modificar, mismos prompts y ajustes:

| Metrica | Base | Con adaptador |
|---|---|---|
| Perplejidad WikiText-2 (contexto 2048, 20 fragmentos) | 13,76 | 14,07 |
| Rechazos clasificados por palabras clave, 100 prompts reservados (T=0,7, thinking off) | 99 | 7 |
| GSM8K, thinking off, 100 problemas aleatorios, greedy | 92 % | 91 % |

El autor advierte de que la muestra es pequeña (12-100 prompts), por lo que diferencias de pocos puntos son ruido, y de que el conteo de rechazos por palabras clave sobreestima el cumplimiento: en una revisión manual de 25 generaciones largas, solo cerca del 40 % fueron respuestas sustantivas o parciales.

## Requisitos de hardware

- El adaptador ocupa 2,6 MB, por lo que el requisito real lo marca el modelo base ternario de 9B en GGUF Q2_0.
- VRAM estimada: no disponible en la información proporcionada; un modelo de 9B a 2 bits debería caber en GPUs de consumo con 8-12 GB, pero el dato no se confirma en la model card.
- GPU recomendadas: no disponible. El autor probó con `-ngl 99` (todas las capas en GPU) en llama.cpp build b12447.
- Cabe en GPU de consumo: no confirmado explícitamente; el formato ternario Q2_0 sugiere que sí, pero no se aporta medición.
- Opciones de despliegue: llama.cpp (`llama-server`) con `--jinja`, `--chat-template-kwargs '{"enable_thinking":false}'` y `--lora-scaled <fichero>:1.0`. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusals (100 prompts) | Licencia | Formato |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-9B-Ablation-LoRA | 1,3 M (adaptador) sobre base 9B | no disponible | 7 | Apache-2.0 | GGUF LoRA |
| prism-ml/Ternary-Bonsai-2-9B-gguf (base) | 9B | no disponible | 99 | Apache-2.0 | GGUF ternario |
| Qwen/Qwen3.5-9B (origen de la ablación) | 9B | no disponible | no disponible | no disponible | safetensors (4-bit en el proceso) |

No se dispone de datos de benchmarks de terceros ni de otros adaptadores de ablación comparables en la información proporcionada.

## Limitaciones y advertencias

- El adaptador elimina el rechazo también ante peticiones de contenido dañino; el autor advierte explícitamente de que no debe exponerse al público ni a menores.
- Solo se probó con el fichero oficial Ternary-Bonsai-2-9B-Q2_0.gguf y la build b12447 de llama.cpp; otros paquetes base no se han validado.
- El modo thinking no está evaluado y en varias muestras degeneró en bucles de repetición; debe usarse con thinking off.
- A escala 1,5 los bucles de repetición se vuelven comunes (unos 17 de 25 salidas largas marcadas) y a escala 2,0 el modelo colapsa (20 de 100 salidas degeneradas).
- Calidad real limitada: en revisión manual, solo cerca del 40 % de 25 generaciones largas fueron sustantivas o parciales; es frecuente que el modelo escriba un ensayo sobre la tarea en lugar de realizarla.
- El conteo de rechazos por palabras clave sobreestima el cumplimiento real del adaptador.
- No añade capacidades: un modelo de 9B a 2 bits sigue siendo un modelo de 2 bits, con la pérdida de calidad asociada a la cuantización ternaria.
- Tamaño de muestra pequeño (12-100 prompts); diferencias de pocos puntos no son significativas.
- La evaluación de GSM8K muestra una caída de 1 punto (92 % a 91 %), dentro del ruido esperado.
- Licencia Apache-2.0 heredada de Qwen3.5 y Ternary Bonsai; Heretic (AGPL-3.0) se usó solo como herramienta, no forma parte del adaptador.
- Idiomas soportados no documentados; el comportamiento multilingüe no se ha evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gyr0zepp/Ternary-Bonsai-2-9B-Ablation-LoRA-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Qwen3.5-9B (origen de la ablación): https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de prompts dañinos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de prompts inofensivos: https://huggingface.co/datasets/mlabonne/harmless_alpaca
