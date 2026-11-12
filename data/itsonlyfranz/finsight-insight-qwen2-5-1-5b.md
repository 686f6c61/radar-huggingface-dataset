# itsonlyfranz/finsight-insight-qwen2.5-1.5b

## Resumen
FinSight Insight 1.5B es un adaptador LoRA para MLX sobre Qwen2.5-1.5B-Instruct, desarrollado por el usuario itsonlyfranz, que reformula hechos estructurados de finanzas personales (insights de gasto, simulaciones de ahorro y hitos de objetivos) en mensajes breves en texto plano. El modelo no calcula cifras: un motor determinista de la aplicación FinSight para Android genera los números y el modelo únicamente los verbaliza, lo que reduce el riesgo de alucinación numérica. Está pensado para un caso de uso muy acotado y no como asistente financiero general.

El repositorio contiene exclusivamente el adaptador (74 MB en `adapters.safetensors`), no los pesos completos; para ejecutarlo hay que cargar el modelo base Qwen2.5-1.5B-Instruct y aplicar el adaptador con `mlx-lm`. Existen versiones GGUF cuantizadas publicadas en un repositorio aparte. La licencia es Apache 2.0 y el único idioma declarado es inglés, aunque los importes se expresan en pesos filipinos (₱).

La relevancia de esta ficha es acotada: se trata de un fine-tune de nicho, con 0 descargas y 1 like en el momento de la consulta, orientado a una aplicación concreta y con un contrato de salida estricto. Su interés técnico reside en la metodología de evaluación (fidelidad numérica, formato válido, cobertura de hechos) más que en capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B-Instruct) con adaptador LoRA |
| Parametros totales | 1.500 millones en el modelo base; adaptador LoRA de 18,465 M parámetros entrenables (1,196 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max sequence length 768) |
| Tipos de cuantizacion | GGUF f16, Q8_0, Q5_K_M y Q4_K_M publicados en repositorio aparte; adaptador en safetensors |
| Idiomas soportados | en (ingles); importes en pesos filipinos (₱) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA para MLX); GGUF en repositorio separado |

## Arquitectura y entrenamiento
El modelo base es Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros. Sobre él se aplica un adaptador LoRA de rango 16, escala 20 y dropout 0,05, con todas las proyecciones de atención y MLP adaptadas en las 28 capas del modelo, lo que resulta en 18.465 millones de parámetros entrenables (1,196 % del total). El entrenamiento se realizó en bf16 sobre Apple M2 Pro de 32 GB con `mlx-lm`, usando AdamW con learning rate 2e-5, warmup de 30 pasos y decaimiento coseno hasta 2e-6, batch de 4, 600 iteraciones (aproximadamente 1,5 épocas) y longitud máxima de secuencia de 768. La pérdida se calcula únicamente sobre la respuesta. El tiempo de reloj fue de 1.790 s incluyendo 7 pasadas de validación, con un pico de memoria de 14,55 GB en memoria unificada.

Los datos de entrenamiento son completamente sintéticos: 1.618 ejemplos de entrenamiento y 114 de validación, con textos de referencia generados por plantilla (semilla 20260512). No se usaron finanzas reales. La pérdida de validación evolucionó de 1,939 a 0,077 en la iteración 100, 0,048 en la 200, 0,037 en la 300, 0,035 en las 400/500 y 0,034 en la 600. No se menciona RLHF ni DPO en la información disponible.

## Capacidades
- Reformulación de insights de gasto en dos líneas con el formato `INSIGHT: ...` / `ACTION: ...`.
- Explicación de simulaciones de ahorro en dos o tres frases en lenguaje llano.
- Redacción de una frase de ánimo (máximo 30 palabras) sobre el siguiente hito de un objetivo de ahorro.
- Uso estricto de las cifras proporcionadas en el bloque de hechos, sin inventar importes, tasas, productos ni garantías.
- Formato de texto plano, sin markdown ni emojis, con importes en pesos filipinos (₱).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking según la información disponible.
- Multilingüe: no; solo inglés declarado, y el propio autor excluye explícitamente otras monedas o idiomas.

## Casos de uso
- Aplicación FinSight para Android: el motor determinista calcula los números y el modelo redacta el mensaje final al usuario; encaja porque el contrato de salida es fijo y la fidelidad numérica es del 100 % en la evaluación.
- Avisos de suscripciones recurrentes: a partir de un bloque de hechos con el importe mensual y una acción sugerida, el modelo produce un consejo cálido y concreto en dos líneas, evitando que el usuario reciba una tabla de cifras sin contexto.
- Simulaciones de recorte de gasto: dado un escenario de recortes, el modelo lo explica en dos o tres frases en lenguaje llano, adecuado para usuarios no técnicos que necesitan entender el impacto sin jerga financiera.
- Seguimiento de objetivos de ahorro: genera una frase motivacional breve sobre el siguiente hito, útil en notificaciones push donde el espacio es limitado (30 palabras máximo).
- Generación de textos de reserva en producción: al ser un modelo pequeño (986 MB en Q4_K_M) y con latencias inferiores a 1 s, puede actuar como generador de mensajes en un pipeline con validación posterior mediante un guard de cifras y caída a texto determinista.
- Prototipado de asistentes financieros con restricciones duras: sirve como referencia de cómo separar cálculo determinista y verbalización mediante un LLM pequeño, patrón reutilizable en otras apps de finanzas personales.
- Evaluación de técnicas de fine-tuning con LoRA en Apple Silicon: el repositorio documenta scripts de entrenamiento y evaluación reproducibles, útil para equipos que quieran replicar el flujo con `mlx-lm`.

## Benchmarks y rendimiento
Conjunto de test reservado, n=246 (117 insight / 78 simulación / 51 objetivo), decodificación greedy, M2 Pro de 32 GB.

| Modelo | Fidelidad numérica | Formato válido | Aceptado por la app | ROUGE-L | Cobertura de hechos | tok/s decodificación | Latencia media | Tamano en disco |
|---|---|---|---|---|---|---|---|---|
| Base zero-shot (MLX bf16) | 97,6 % | 58,9 % | 97,6 % | 0,252 | 0,631 | 47,9 | 1,91 s | 3.099 MB |
| Base + prompt 2-shot (MLX bf16) | 100,0 % | 95,1 % | 100,0 % | 0,373 | 0,894 | 39,3 | 1,94 s | 3.099 MB |
| Fine-tuned LoRA zero-shot (MLX bf16) | 100,0 % | 100,0 % | 100,0 % | 0,454 | 0,881 | 30,5 | 2,17 s | 3.173 MB |
| Fine-tuned GGUF f16 | 100,0 % | 100,0 % | 100,0 % | 0,448 | 0,920 | 47,1 | 1,45 s | 3.094 MB |
| Fine-tuned GGUF Q8_0 | 100,0 % | 100,0 % | 100,0 % | 0,447 | 0,913 | 71,8 | 0,95 s | 1.647 MB |
| Fine-tuned GGUF Q5_K_M | 100,0 % | 100,0 % | 100,0 % | 0,456 | 0,894 | 70,9 | 0,92 s | 1.125 MB |
| Fine-tuned GGUF Q4_K_M | 100,0 % | 98,0 % | 100,0 % | 0,458 | 0,846 | 83,5 | 0,76 s | 986 MB |

Fidelidad numérica = tasa de aprobación de un port del guard de cifras de la app. Formato válido = la salida bruta cumple el contrato de salida. ROUGE-L se mide contra la referencia plantillada. Cobertura de hechos = proporción de cifras de referencia que la salida menciona. Los tok/s y la latencia corresponden a la medición en M2 Pro 32 GB.

## Requisitos de hardware
- VRAM estimada: el adaptador LoRA requiere cargar el modelo base completo; en bf16 el conjunto ocupa 3.173 MB en disco y el pico de memoria durante el entrenamiento fue de 14,55 GB en memoria unificada. Para inferencia, el modelo base en bf16 necesita aproximadamente 3 GB y las versiones GGUF entre 986 MB (Q4_K_M) y 3.094 MB (f16).
- GPU recomendadas: el autor solo documenta ejecución en Apple Silicon (M2 Pro de 32 GB) mediante `mlx-lm`. Para GGUF se puede usar `llama.cpp` en CPU o GPU, pero no se proporcionan datos de rendimiento en GPU NVIDIA.
- Cabe en GPU de consumo: sí, por tamaño; en GPUs de 8 GB o más en cuantizaciones Q4_K_M o Q5_K_M. No hay mediciones publicadas en RTX 4090, A100 o H100.
- Opciones de despliegue: `mlx-lm` (adaptador), `llama.cpp` u Ollama con los GGUF del repositorio aparte. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: en M2 Pro 32 GB, 0,76 s de latencia media y 83,5 tok/s con Q4_K_M; 2,17 s y 30,5 tok/s con LoRA en bf16. En otras plataformas, no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinSight Insight 1.5B (LoRA) | 1,5 B (adaptador de 18,465 M) | no disponible | Reformulación de hechos financieros con cifras fijas | Apache 2.0 | Adaptador MLX + GGUF en HF |
| Qwen2.5-1.5B-Instruct (base) | 1,5 B | no disponible en la informacion proporcionada | Asistente generalista | Apache 2.0 | Pesos completos en HF |
| Qwen2.5-1.5B-Instruct + prompt 2-shot | 1,5 B | no disponible | Mismo caso sin fine-tuning | Apache 2.0 | Pesos completos en HF |

La comparación relevante es contra el propio modelo base: el fine-tune mejora el formato válido del 58,9 % al 100 % en zero-shot y el ROUGE-L de 0,252 a 0,454, a costa de reducir el throughput (30,5 frente a 47,9 tok/s en bf16). Frente al prompt 2-shot, el fine-tune iguala la fidelidad numérica y el formato, y mejora el ROUGE-L (0,454 frente a 0,373), con menor cobertura de hechos (0,881 frente a 0,894). No se dispone de comparación con otros modelos de finanzas personales.

## Limitaciones y advertencias
- Ámbito muy restringido: solo procesa entradas en el formato de hechos documentado; cualquier otra entrada queda fuera de alcance.
- No es un asesor financiero: el autor excluye explícitamente el asesoramiento financiero, fiscal o de inversión.
- Solo inglés y pesos filipinos (₱); no admite otras monedas ni idiomas.
- Riesgo de alucinación numérica: aunque la fidelidad medida es del 100 %, el autor exige validar siempre la salida con un guard de cifras y recurrir a texto determinista si falla.
- El adaptador no incluye los pesos base: hay que descargar Qwen2.5-1.5B-Instruct por separado y respetar su licencia Apache 2.0.
- Entrenado con datos 100 % sintéticos (1.618 ejemplos), lo que limita la diversidad estilística y puede producir respuestas repetitivas o rígidas.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía ni soporte; el repositorio tiene 0 descargas y 1 like, sin validación independiente.
- La evaluación se hizo únicamente en Apple M2 Pro; el rendimiento en otras plataformas no está medido.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/itsonlyfranz/finsight-insight-qwen2.5-1.5b
- Versiones GGUF: https://huggingface.co/itsonlyfranz/finsight-insight-qwen2.5-1.5b-GGUF
- Dataset sintético: https://huggingface.co/datasets/itsonlyfranz/finsight-insight-synthetic
- Repositorio de código y scripts: https://github.com/itsonlyfranz/finsight-insight-llm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
