# simaai/Qwen3-1.7B-GPTQ-a16w4_return_logits

## Resumen

Qwen3-1.7B-GPTQ-a16w4_return_logits es una compilación cuantizada del modelo Qwen/Qwen3-1.7B, publicada por SiMa.ai para su plataforma de aceleración hardware Modalix. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto derivado: el transformer Qwen3 de 1.700 millones de parámetros, cuantizado con GPTQ en formato A16W4 (activaciones BF16, pesos INT4) y compilado con la bandera `--return_logits` para que pueda ejecutarse en el runtime LLiMa de Modalix y devolver logits utilizables en flujos de evaluación de precisión.

Su relevancia es fundamentalmente de ingeniería y validación: permite medir la degradación de precisión introducida por la cuantización y el backend propietario comparando directamente contra el modelo original ejecutado en Hugging Face. El repositorio incluye resultados parciales de benchmarks (PIQA, WikiText, WinoGrande, TriviaQA, HellaSwag) generados sobre el dispositivo Modalix, aunque varias celdas de referencia en Hugging Face aparecen vacías.

El modelo hereda la arquitectura y capacidades de Qwen3-1.7B, con una longitud de contexto máxima de 4096 tokens en esta compilación concreta (inferior a la del modelo base original). La licencia es Apache 2.0 y el tamaño del repositorio es de 2,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (en esta compilación) |
| Tipos de cuantizacion | GPTQ A16W4 (activaciones BF16, pesos INT4) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefactos compilados para SiMa.ai Modalix (devkit/ y elf_files/); no se distribuyen safetensors ni GGUF estándar |
| Modelo base | Qwen/Qwen3-1.7B |
| Backend de ejecución | SiMa.ai Neat Runtime / LLiMa (Modalix) |
| Return logits | Habilitado (`--return_logits`) |
| Tamaño del repositorio | 2,7 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B, un transformer decoder-only de la familia Qwen3 desarrollada por Alibaba Qwen. SiMa.ai no ha reentrenado el modelo: el repositorio documenta únicamente el proceso de cuantización GPTQ a A16W4 y la compilación para el backend Modalix. No se proporcionan datos sobre el corpus de entrenamiento original, el número de tokens, ni si hubo fases de RLHF o DPO; esa información correspondería a la model card del modelo base, no a este artefacto.

La innovación técnica relevante aquí no está en el modelo sino en el pipeline de despliegue: la compilación con `--return_logits` permite que el dispositivo Modalix exponga los logits crudos a la herramienta `llima-benchmark`, de modo que se pueden ejecutar tareas de evaluación tipo lm-evaluation-harness (HellaSwag, PIQA, TriviaQA, WikiText, WinoGrande) directamente sobre el acelerador y comparar contra la ejecución de referencia en Hugging Face. Los artefactos se organizan en directorios `devkit/` y `elf_files/`, y se gestionan mediante la CLI `llima` bajo `/media/nvme/llima/models`.

## Capacidades

- Generación de texto autoregresiva, heredada de Qwen3-1.7B.
- Devolución de logits por token, requisito para benchmarking de precisión en Modalix.
- Ejecución de tareas de evaluación estándar: HellaSwag, PIQA, TriviaQA, WikiText-2 y WinoGrande.
- Soporte de decodificación y evaluación con tokenizer y configuración del modelo fuente Qwen/Qwen3-1.7B.
- Capacidades multilingües: no disponibles en la documentación de este artefacto (dependen del modelo base).
- Tool calling, function calling y razonamiento multi-paso: no documentados en esta compilación; deben asumirse los del modelo base, sin garantía en el backend Modalix.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Validación de precisión post-cuantización: ejecutar `llima-benchmark accuracy` con `--backend modalix` y `--backend hf` sobre el mismo conjunto de tareas para cuantificar la diferencia absoluta introducida por A16W4 y por el compilador de Modalix.
- Integración en CI/CD de hardware: incorporar el benchmark como paso automatizado en pipelines de validación de nuevas versiones del runtime Neat o de compiladores LLiMa, detectando regresiones de precisión antes de desplegar.
- Comparación de backends en el borde: medir perplejidad en WikiText-2 (bits per byte, byte perplexity, word perplexity) entre la ejecución en Modalix y en GPU/CPU con Hugging Face, para decidir qué cargas de trabajo toleran la cuantización INT4.
- Evaluación de despliegues embebidos: verificar que un modelo de 1.7B cuantizado mantiene una precisión aceptable en tareas de sentido común (PIQA, WinoGrande, HellaSwag) antes de llevarlo a producción en dispositivos de baja potencia.
- Reproducibilidad de resultados: servir como artefacto de referencia fijo para que terceros reproduzcan las cifras publicadas por SiMa.ai sobre Modalix, dado que el repositorio incluye los recuentos de muestras por tarea.
- Diagnóstico de tokenizer y configuración: al requerir el `model_id` del modelo fuente para el tokenizer, el flujo sirve para detectar desajustes entre la configuración de Qwen/Qwen3-1.7B y el artefacto compilado.
- Investigación en cuantización: usar los logits devueltos para análisis de divergencia KL, calibración o estudios de degradación por capa entre BF16 y A16W4.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en el backend Modalix. Las columnas de referencia en Hugging Face aparecen vacías en la información disponible, por lo que no es posible calcular la diferencia absoluta.

| Tarea | Version | Filtro | n-shot | Metrica | Direccion | Modalix | Stderr | HF referencia |
|---|---|---:|---:|---|---|---:|---:|---|
| hellaswag | 1.0 | none | 0 | acc | higher | no disponible | no disponible | no disponible |
| hellaswag | 1.0 | none | 0 | acc_norm | higher | no disponible | no disponible | no disponible |
| piqa | 1.0 | none | 0 | acc | higher | 0.6997 | 0.0107 | no disponible |
| piqa | 1.0 | none | 0 | acc_norm | higher | 0.7018 | 0.0107 | no disponible |
| triviaqa | 3.0 | remove_whitespace | 0 | exact_match | higher | 0.0000 | 0.0000 | no disponible |
| wikitext | 2.0 | none | 0 | bits_per_byte | lower | 0.8739 | N/A | no disponible |
| wikitext | 2.0 | none | 0 | byte_perplexity | lower | 1.8326 | N/A | no disponible |
| wikitext | 2.0 | none | 0 | word_perplexity | lower | 25.5085 | N/A | no disponible |
| winogrande | 1.0 | none | 0 | acc | higher | 0.6014 | 0.0138 | no disponible |

Recuento de muestras por tarea: HellaSwag 10.042, PIQA 1.838, TriviaQA 17.944, WikiText 62, WinoGrande 1.267.

## Requisitos de hardware

- Plataforma objetivo: SiMa.ai Modalix, con runtime Neat y LLiMa instalados. No está pensado para ejecución directa en GPU convencional.
- VRAM estimada para inferencia en GPU: no disponible para este artefacto; los pesos INT4 de un modelo de 1.7B ocuparían aproximadamente 0,85 GB más overhead de activaciones BF16 y caché KV, pero esta cifra no está confirmada por el autor.
- GPU recomendadas: no aplica; el artefacto está compilado para el acelerador Modalix.
- Compatibilidad con GPU de consumo: no disponible; los artefactos no están en formato GGUF ni safetensors estándar.
- Opciones de despliegue: CLI `llima pull` en el dispositivo, o `hf download` en un host seguido de `scp` a `/media/nvme/llima/models/`. La ruta se puede cambiar con la variable `LLIMA_MODELS_PATH`.
- Herramientas asociadas: `llima-benchmark` en el host, `sima-cli` en el dispositivo, servidor de benchmark arrancado por defecto (opción `--no-board_start_server` para conectarse a uno ya activo, `--board_venv_path` para entornos virtuales no estándar).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| simaai/Qwen3-1.7B-GPTQ-a16w4_return_logits | 1,7B | 4096 | GPTQ A16W4 | Apache 2.0 | SiMa.ai Modalix |
| Qwen/Qwen3-1.7B | 1,7B | no disponible en esta ficha | BF16 | Apache 2.0 | GPU/CPU estándar |
| Otras compilaciones SiMa.ai de Qwen3 | no disponible | no disponible | no disponible | Apache 2.0 | SiMa.ai Modalix |

La comparación directa con alternativas cuantizadas de propósito general no es posible con la información disponible, ya que este repositorio no distribuye pesos en formatos estándar (GGUF, safetensors) y su función es el benchmarking en hardware propietario, no el despliegue genérico.

## Limitaciones y advertencias

- Cuantización A16W4: el propio autor advierte de posibles desviaciones menores respecto al modelo de precisión completa. La magnitud no se puede calcular porque faltan los valores de referencia en Hugging Face.
- Contexto reducido: 4096 tokens frente a la ventana mayor del modelo base original; no apto para tareas de contexto largo.
- No es un modelo para generación estándar: la compilación con `--return_logits` está pensada para benchmarking; para despliegues de texto normales el autor remite a la colección general de modelos de SiMa.ai.
- Dependencia total de hardware y software propietarios: requiere dispositivo Modalix, runtime Neat, LLiMa y `sima-cli`; no se puede ejecutar en vLLM, llama.cpp, Ollama ni TGI.
- Resultados incompletos: HellaSwag sin valores y TriviaQA con exact_match 0.0000, lo que sugiere un problema de formato o de evaluación más que un rendimiento real del modelo.
- Idiomas soportados no documentados en este artefacto.
- Sesgos y riesgo de alucinación: no documentados específicamente; heredados del modelo base Qwen3-1.7B y potencialmente amplificados por la cuantización INT4.
- Licencia Apache 2.0 permite uso comercial, pero la viabilidad práctica está limitada al hardware Modalix.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/simaai/Qwen3-1.7B-GPTQ-a16w4_return_logits
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Guía de inicio de SiMa.ai Neat: https://developer.sima.ai/software/getting-started/
- Benchmarking de precisión MOLE: https://developer.sima.ai/software/genai-llima/mole
