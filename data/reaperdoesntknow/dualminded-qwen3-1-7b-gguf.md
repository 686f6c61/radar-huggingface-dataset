# reaperdoesntknow/DualMinded-Qwen3-1.7B-GGUF

## Resumen
DualMinded-Qwen3-1.7B-GGUF es la distribución en formato GGUF del modelo DualMinded-Qwen3-1.7B, desarrollado por Convergent Intelligence LLC (Research Division) y publicado por el usuario reaperdoesntknow en Hugging Face. Se trata de un ajuste fino (SFT) del checkpoint 512 de la cadena de destilación TKD (Topological Knowledge Distillation) sobre Qwen3-1.7B, entrenado con trazas de razonamiento de Claude Opus 4.6 filtradas (Opus-4.6-Reasoning-3000x). El modelo implementa la arquitectura DualMind, un bucle cognitivo explícito de tres fases: `<explore>` (razonamiento libre), `<examine>` (autocrítica adversarial) y `<response>` (síntesis final). Con 2.031.739.904 parámetros totales (aproximadamente 2,03 mil millones), está pensado para despliegue en el borde (edge) y en hardware de consumo. Esta versión GGUF facilita su ejecución local mediante llama.cpp, Ollama o LM Studio sin necesidad de GPU dedicada de gama alta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con bucle cognitivo DualMind (explore/examine/response) |
| Parámetros totales | 2.031.739.904 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); SafeTensors en el modelo base |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-1.7B y sigue una cadena de destilación: Qwen3-1.7B → DistilQwen3 → Disctil → checkpoint TKD-512 → SFT DualMind v2 sobre Opus-4.6-Reasoning-3000x. La base TKD (Topological Knowledge Distillation) proviene de la destilación del profesor Qwen3-30B-A3B-Thinking sobre datos de cadenas de razonamiento de física. La etapa SFT utiliza trazas de razonamiento de Claude Opus 4.6, donde la columna `thinking` se mapea directamente a la fase `<explore>` sin división heurística, lo que produce transiciones cognitivas más limpias que la variante DualMind original (entrenada con LogicInference_OA). La innovación principal es el bucle de autocrítica adversarial en tres fases, que separa el razonamiento libre, la revisión crítica y la respuesta final. Los fundamentos matemáticos (Discrepancy Calculus, descomposición BV) se documentan en la model card del modelo base y, según el autor, se preservan tras la cuantización porque los límites estructurales detectados por DISC están integrados en los pesos.

## Capacidades
- Generación de texto conversacional y razonamiento multi-paso con bucle explícito explore→examine→response.
- Razonamiento estructurado y resolución de problemas matemáticos y lógicos (derivado de los datos de física y Opus).
- Autocrítica adversarial: la fase `<examine>` permite detectar y corregir errores antes de la respuesta final.
- Razonamiento extendido y derivación creativa (perfil reforzado por las trazas de Opus 4.6).
- Capacidad de seguir instrucciones en inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.
- No se documenta modo thinking nativo más allá del bucle DualMind.

## Casos de uso
- Razonamiento matemático y lógico en local: el modelo puede resolver demostraciones y problemas formales usando el bucle explore→examine→response, adecuado para entornos sin conexión o con requisitos de privacidad.
- Tutoría educativa en el borde: con cuantización Q4_K_M (~1,1 GB) se puede desplegar en dispositivos de bajos recursos para explicar conceptos paso a paso y autocorregirse.
- Prototipado rápido de agentes de razonamiento: la estructura de tres fases facilita la integración en pipelines que requieren separar generación, crítica y respuesta final.
- Generación de explicaciones técnicas: útil para documentar razonamientos en física o matemáticas, donde el modelo puede mostrar su cadena de pensamiento antes de concluir.
- Evaluación de cadenas de razonamiento: el modelo sirve como generador de trazas para experimentos de destilación o análisis de autocrítica.
- Despliegue en CPU o GPU de consumo: mediante Ollama o llama.cpp, se puede ejecutar en portátiles y mini-PC para tareas de razonamiento ligero.
- Investigación en destilación de conocimiento: el modelo es un artefacto de la cadena TKD, útil para estudiar el efecto de distintos datasets SFT sobre pesos compartidos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: F16 ~3,4 GB; Q8_0 ~1,8 GB; Q5_K_M ~1,3 GB; Q4_K_M ~1,1 GB (tamaños de archivo indicados por el autor).
- GPU recomendadas: no especificadas; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM puede ejecutar las cuantizaciones Q4/Q5/Q8. Una RTX 3060 o superior es suficiente para Q8_0; para F16 se recomienda 4 GB o más.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas (GTX 1650 4 GB en adelante para Q4_K_M; RTX 3060 6 GB o superior para Q8_0).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF.
- Latencia y throughput: no disponibles. El autor recomienda `temperature` 0.6, `top_p` 0.9, `repeat_penalty` 1.3 y `num_predict` 512–1024.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DualMinded-Qwen3-1.7B-GGUF | 2,03 B | No disponible | GGUF | Apache 2.0 | Variante Opus, bucle DualMind |
| DualMind (GGUF) | ~2 B (base Qwen3-1.7B) | No disponible | GGUF | Apache 2.0 | Variante LogicInference, mismo bucle |
| Dualmind-Qwen-1.7B-Thinking | ~2 B | No disponible | BF16 | Apache 2.0 | Variante con deliberación extendida |
| Qwen3-1.7B (base) | 1,7 B | No disponible | SafeTensors/GGUF | Apache 2.0 | Modelo base sin ajuste DualMind |

## Limitaciones y advertencias
- Entrenado y evaluado únicamente en inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de bucles de enumeración: el autor recomienda explícitamente `repeat_penalty` 1.3 para evitarlos.
- El bucle de autocrítica puede aumentar la latencia y el consumo de tokens frente a un modelo estándar del mismo tamaño.
- No se documentan evaluaciones de sesgo, alucinación o robustez; se desconoce su comportamiento en dominios fuera de matemáticas y física.
- Aunque la licencia es Apache 2.0, los datos de entrenamiento derivan de trazas de Claude Opus 4.6, lo que puede plantear dudas sobre las condiciones de uso de dichos datos en producción comercial.
- La longitud de contexto no está especificada; se desconoce si conserva la ventana nativa de Qwen3-1.7B.
- El modelo es un artefacto de investigación con pocas descargas (1.980) y un solo "like"; no hay evidencia de validación independiente.

## Enlaces
- [Hugging Face: reaperdoesntknow/DualMinded-Qwen3-1.7B-GGUF](https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B-GGUF)
- [Modelo base: DualMinded-Qwen3-1.7B](https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B)
- [Variante DualMind](https://huggingface.co/reaperdoesntknow/DualMind)
- [DualMind-GGUF](https://huggingface.co/reaperdoesntknow/DualMind-GGUF)
- [Dualmind-Qwen-1.7B-Thinking](https://huggingface.co/reaperdoesntknow/Dualmind-Qwen-1.7B-Thinking)
- [Metodología DualMind (DOI: 10.57967/hf/8184)](https://doi.org/10.57967/hf/8184)
- [Paper Structure Over Scale (DOI: 10.57967/hf/8165)](https://huggingface.co/reaperdoesntknow/Structure-Over-Scale)
- [Paper Discrepancy Calculus (DOI: 10.57967/hf/8194)](https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus)
- [Colección DualMind](https://huggingface.co/collections/reaperdoesntknow/dualmind)
- [Colección DistilQwen](https://huggingface.co/collections/reaperdoesntknow/distilqwen)
- [Dataset Opus-4.6-Reasoning-3000x-filtered](https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Ollama](https://ollama.com)
- [LM Studio](https://lmstudio.ai)
