# Outlier-Ai/Outlier-Nano-4B-MLX-4bit

## Resumen

Outlier Nano 4B (Combined-fused) es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) derivado de Qwen/Qwen3.5-4B, publicado por Outlier-Ai. Se distribuye como un checkpoint cuantizado en 4 bits para MLX, el framework de Apple para ejecución en Apple Silicon, con el objetivo explícito de correr de forma local y privada en Macs de gama consumer (etiquetas como `8gb-mac`, `low-ram`, `on-device`, `no-cloud`).

La particularidad del checkpoint es la fusión de un adaptador LoRA (rango 8, centrado en capas tardías 17–30) entrenado conjuntamente en razonamiento matemático, traducción y Q&A, que se ha integrado directamente en los pesos base. Según el autor, esto eleva de forma notable el rendimiento en dominios concretos respecto al checkpoint base, manteniendo el mismo presupuesto de parámetros. El modelo conserva la arquitectura híbrida de atención de Qwen3-Next (proporción 3:1 entre atención lineal y atención completa) y una ventana de contexto de 32K tokens.

Es relevante ahora porque ocupa el nicho de LLM pequeño, offline y privado para macOS: el autor reporta 89 tok/s de decodificación, 305 ms de TTFT (con caché de system prompt) y un pico de RAM de 3,17 GB en un M1 Ultra, cifras que lo sitúan como alternativa local a servicios en la nube para tareas de asistencia, tool calling y razonamiento ligero. La licencia Apache 2.0 y el soporte de 15 idiomas amplían su aplicabilidad comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3-Next (atención lineal:completa 3:1) |
| Parametros totales | 4.205.751.296 (≈4,2 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 32K tokens |
| Tipos de cuantizacion | 4-bit (MLX); KV cache configurable con `kv_bits` (recomendado 5, `kv_group_size=64`; validado 5→3) |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl (15) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, librería `mlx`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Next 4B, un transformer con atención híbrida que combina capas de atención lineal y capas de atención completa en proporción 3:1, lo que reduce el coste computacional y de memoria del contexto largo frente a un transformer de atención completa pura. Sobre esa base se ha fusionado un adaptador LoRA de rango 8 entrenado de forma conjunta en tres dominios (razonamiento matemático, traducción y Q&A); según la model card, las capas más afectadas por la fusión son las tardías (17–30), con mayor impacto en las puertas MLP y en `q_proj` de la autoatención. Los pesos resultantes se cuantizan a 4 bits para MLX.

No se especifican en la información disponible el número de tokens de entrenamiento del adaptador, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. El autor indica que la validación empírica se hizo sobre un M1 Ultra con más de 70 pruebas (sesión `v2_research` de 2026-05-27), y que la calidad se mantiene al reducir la cuantización de la KV cache de 5 a 3 bits, con una caída de unos 10 puntos en matemáticas en `kv=3`; recomienda `kv_bits=5` como suelo seguro. El checkpoint anterior, sin fusión, sigue accesible en la etiqueta git `pre-combined-v1`.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 32K tokens.
- Razonamiento matemático (GSM8K) y modo "thinking" declarado en las etiquetas del modelo.
- Generación de código (HumanEval) y respuesta a preguntas factuales.
- Tool calling y function calling, según las etiquetas `function-calling` y `tool-use`.
- Traducción entre los 15 idiomas soportados.
- RAG (retrieval-augmented generation) sobre contexto largo.
- Robustez ante variaciones de formulación (5 variantes de phrasing validadas al 100 % según el autor).
- Ejecución totalmente offline y en dispositivo, sin llamadas a la nube.

## Casos de uso

- Asistente de escritorio privado en macOS: el modelo se ejecuta dentro de la app Outlier o vía `mlx_lm` sin salida a red, adecuado para usuarios que manejan datos sensibles y no quieren enviarlos a un proveedor cloud; el pico de RAM de 3,17 GB permite tenerlo residente en un MacBook Air de 8 GB.
- Automatización de atención al cliente en local: con 32K de contexto puede mantener conversaciones multi-turno con historial largo y documentos de referencia, y el TTFT de 305 ms con caché de system prompt hace viable la interacción conversacional percibida como instantánea.
- Traducción asistida en flujos de trabajo: el adaptador fusionado eleva la traducción del 20 % al 90 % según el autor, lo que lo hace útil para traducción de correos, documentación o subtítulos entre los 15 idiomas soportados sin conexión.
- Generación de código en editores locales: HumanEval pass@1 de 0,5793 y soporte de tool calling permiten integrarlo en asistentes de código que invocan funciones del sistema o APIs internas, con la ventaja de no exponer el código del usuario.
- RAG sobre documentación privada: indexación local de manuales o contratos y consulta con contexto largo, manteniendo todo el pipeline en el dispositivo; el autor reporta 100 % en su prueba de RAG.
- Prototipado y evaluación de agentes: al ser pequeño y rápido (89 tok/s), sirve para iterar sobre bucles de razonamiento multi-paso y tool use antes de escalar a modelos mayores, con coste cero de inferencia.
- Educación y tutoría offline: resolución de problemas matemáticos (78 % en GSM8K según el autor) en entornos sin conectividad, como aulas o zonas rurales.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| MMLU (5-shot, n=14042) | accuracy | 0,7437 |
| HumanEval (test) | pass@1 | 0,5793 |

Resultados internos del autor (muestras pequeñas, no comparables con benchmarks estándar):

| Prueba | Base Nano | Combined-fused | Delta |
|---|---:|---:|---:|
| GSM8K math (n=50) | 5 % | 78 % | +73 pp |
| MMLU-style (n=30) | 74,4 % | 96,7 % | +22 pp |
| Razonamiento difícil (n=15) | — | 87–93 % | nuevo |
| Q&A factual (n=30) | 74 % | 100 % | +26 pp |
| Generación de código | — | 100 % | nuevo |
| Traducción (n=30) | 20 % | 90 % | +70 pp |
| RAG | — | 100 % | nuevo |
| Robustez de variantes (5× phrasings) | — | 100 % | nuevo |

Rendimiento en hardware (M1 Ultra, según el autor): TTFT 305 ms de media y 329 ms en P99 con caché de system prompt; decodificación de 89 tok/s; respuesta de 100 tokens en 728 ms de extremo a extremo; pico de RAM de 3,17 GB constante en una prueba de estrés de 100 consultas sin crecimiento de memoria.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el repo pesa 4,8 GB y el autor reporta un pico de 3,17 GB en ejecución con cuantización 4-bit y `kv_bits=5`; encaja en Macs de 8 GB de memoria unificada (etiqueta `8gb-mac`).
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4; MacBook Air, MacBook Pro, Mac mini, Mac Studio). No es compatible con CUDA ni con GPUs NVIDIA/AMD por el formato MLX.
- Cabe en GPU consumer: sí, en cualquier Mac con chip de la serie M y al menos 8 GB de memoria unificada.
- Opciones de despliegue: `mlx-lm` (carga directa desde Hugging Face), la app Outlier para macOS (instalable vía `brew install --cask outlier-host/tap/outlier`), y cualquier runtime que soporte MLX. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput: 305 ms de TTFT medio (329 ms P99) y 89 tok/s de decodificación en M1 Ultra según el autor; no se publican cifras para otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Plataforma |
|---|---|---|---|---|---|
| Outlier Nano 4B MLX 4-bit | 4,2 B | 32K | 0,7437 (5-shot) | Apache 2.0 | Apple Silicon (MLX) |
| Qwen/Qwen3.5-4B (base) | ≈4 B | no disponible | no disponible | Apache 2.0 | Multiplataforma |
| Outlier Nano 4B pre-combined-v1 | 4,2 B | 32K | no disponible | Apache 2.0 | Apple Silicon (MLX) |

La comparación más directa es con el checkpoint base Qwen3.5-4B, del que este modelo hereda arquitectura y licencia pero al que supera, según el autor, en matemáticas, traducción y Q&A gracias a la fusión del LoRA. Frente a otros modelos pequeños de 3–4 B (por ejemplo, la familia Qwen3 o Llama 3.2 3B), no se dispone en la información proporcionada de resultados comparables de benchmarks ni de datos de contexto y licencia de esos modelos, por lo que la comparativa cuantitativa queda limitada. La diferencia clave de Outlier Nano es su empaquetado específico para MLX y su orientación a ejecución local en Mac.

## Limitaciones y advertencias

- Los benchmarks de MMLU y HumanEval están marcados como `verified: false`; los resultados internos (GSM8K, traducción, RAG) proceden de muestras muy pequeñas (n=15 a n=50) y no son comparables con evaluaciones estándar.
- Riesgo de alucinación inherente a un modelo de 4 B; el autor no documenta tasas de alucinación ni evaluaciones de factualidad a gran escala.
- La cuantización de la KV cache a 3 bits degrada el rendimiento matemático en torno a 10 puntos; el autor recomienda no bajar de `kv_bits=5` en producción.
- El modelo solo funciona en Apple Silicon mediante MLX; no hay pesos GGUF ni safetensors estándar para CUDA, lo que limita su despliegue en servidores tradicionales.
- No se documentan sesgos conocidos ni evaluación de seguridad; al ser un fine-tune sobre Qwen3.5-4B, hereda los sesgos del modelo base, no caracterizados en la información disponible.
- El soporte de 15 idiomas está declarado, pero no se aportan métricas por idioma; el rendimiento en idiomas distintos del inglés y el chino podría ser inferior.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la app Outlier tiene un modelo de pago (Pro a 49 USD en hasta 3 Macs) independiente de la licencia del modelo.
- El modelo se creó en abril de 2026 y se actualizó en noviembre de 2026; conviene verificar la etiqueta `pre-combined-v1` si se necesita el checkpoint sin fusión.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- README del modelo: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit/blob/main/README.md
- Checkpoint anterior (pre-combined-v1): https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit/tree/pre-combined-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- App Outlier para macOS: https://outlier.host/
- Outlier AI (plataforma de datos): https://outlier.ai/
