# julienkay/tiny-random-Qwen3ForCausalLM-GGUF

## Resumen

`tiny-random-Qwen3ForCausalLM-GGUF` es un modelo de prueba publicado por el desarrollador julienkay, no un modelo de lenguaje funcional. Se trata de una implementación mínima de la arquitectura `Qwen3ForCausalLM` con pesos aleatorios, distribuida en formato GGUF de llama.cpp, cuyo único propósito es servir como fixture de tests para el paquete de Unity `tools.doji.transformers`. El modelo genera texto aleatorio por diseño.

La relevancia es puramente de ingeniería: permite a los desarrolladores del paquete de inferencia en Unity validar la carga de ficheros GGUF, la conversión de tipos de tensor y la coincidencia de logits y tokens frente a referencias generadas con transformers. No debe emplearse para ninguna tarea de generación real, razonamiento ni evaluación de calidad.

El modelo tiene 7.971.040 parámetros totales, dos capas, 4 cabezas de query y 2 de key/value de dimensión 16, y reutiliza el tokenizador de `Qwen/Qwen3.5-0.8B` con el pre-tokenizador `qwen35`. Se distribuye bajo licencia Apache 2.0 en tres variantes de cuantización y ocupa 0,1 GB en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, `Qwen3ForCausalLM` (2 capas) |
| Parametros totales | 7.971.040 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, BF16, Q8_0 |
| Idiomas soportados | no disponible (tokenizador de Qwen3.5-0.8B, pre-tokenizador `qwen35`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`model-f32.gguf`, `model-bf16.gguf`, `model-q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura `Qwen3ForCausalLM` en su forma mínima: dos capas de decoder, 4 cabezas de atención de query y 2 cabezas de key/value de tamaño 16, con las RMS norms propias de Qwen3 en las cabezas de query y key. Los pesos son aleatorios: no ha habido entrenamiento, ajuste fino, RLHF ni DPO. La generación de texto es, por tanto, ruido estadístico sin valor semántico.

Los ficheros se generan con el script `tools/causal_lm/make_models.py tiny --arch qwen3` del repositorio del paquete y se convierten con `convert_hf_to_gguf.py` de llama.cpp (commit `244640b7f26e2a7301b27a24edc4f7feaf97d52f`) usando `--outtype f32`, `bf16` y `q8_0`. Los logits y tokens de referencia para los tests se escriben con `make_models.py gguf-references --f32`. La arquitectura declarada dentro de los ficheros GGUF es `qwen3`.

## Capacidades

- Carga e inferencia en el motor de Unity `tools.doji.transformers` mediante `AutoModelForCausalLM.FromGguf` y `AutoTokenizer.FromGguf`.
- Validación de la ruta de conversión HF a GGUF para la arquitectura `qwen3` en tres tipos de tensor (F32, BF16, Q8_0).
- Comprobación de paridad de logits y tokens frente a referencias generadas con transformers.
- Generación de texto aleatorio (no es una capacidad útil, es el comportamiento esperado del fixture).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües reales.

## Casos de uso

- Tests de integración del paquete Unity `tools.doji.transformers`: cargar `model-q8_0.gguf` y verificar que el motor produce los tokens de referencia esperados.
- Validación de la ruta de conversión HF a GGUF: comparar los logits del fichero F32 con los generados por transformers para detectar regresiones en el conversor o en el loader.
- Pruebas de cuantización: ejecutar el mismo prompt contra `model-f32.gguf`, `model-bf16.gguf` y `model-q8_0.gguf` para medir la desviación numérica introducida por cada tipo de tensor.
- CI/CD de un motor de inferencia en C#/Unity: usar el modelo como fixture ligero (0,1 GB) que se descarga rápido y no requiere GPU para ejecutar los tests.
- Desarrollo de tooling de tokenización: validar la implementación del tokenizador `qwen35` contra un vocabulario real de Qwen3.5 sin cargar un modelo grande.
- Pruebas de humo de pipelines de despliegue: verificar que un endpoint compatible con la API de Hugging Face arranca y responde correctamente antes de sustituir el fixture por un modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería equivalente al azar y no tendría significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en cualquiera de las tres cuantizaciones (7,97 M de parámetros; F32 ≈ 32 MB de pesos, Q8_0 ≈ 8 MB).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: llama.cpp y el motor de Unity `tools.doji.transformers` (API `AutoModelForCausalLM.FromGguf`). El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la latencia será del orden de milisegundos en CPU, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Formato |
|---|---|---|---|---|---|
| `julienkay/tiny-random-Qwen3ForCausalLM-GGUF` | 7,97 M | no disponible | Fixture de tests | Apache 2.0 | GGUF |
| `Qwen/Qwen3.5-0.8B` | ~0,8 B | no disponible en la informacion | Modelo funcional | Apache 2.0 | safetensors |
| Modelos `tiny-random-*` de transformers (p. ej. `hf-internal-testing/tiny-random-*`) | ~1-10 M | variable | Fixtures de tests | variable | safetensors |

La comparación relevante es con otros fixtures de test, no con modelos funcionales: este modelo se distingue por estar empaquetado en GGUF con la arquitectura `qwen3` y por reutilizar el tokenizador real de Qwen3.5-0.8B, lo que lo hace útil específicamente para validar la cadena HF → GGUF → motor de Unity.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no produce texto coherente y no debe usarse en producción ni en evaluaciones de calidad.
- No ha recibido entrenamiento, por lo que no hay sesgos aprendidos, pero tampoco hay ninguna garantía de comportamiento.
- No dispone de ventana de contexto documentada; la model card no especifica límite de tokens.
- El tokenizador es el de `Qwen/Qwen3.5-0.8B`, pero el vocabulario efectivo del modelo es aleatorio; no se debe asumir correspondencia semántica entre tokens.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero su única utilidad legítima es como fixture de tests.
- El tag `endpoints_compatible` no está explicado en la model card; conviene verificar el comportamiento real antes de asumir compatibilidad con la API de inferencia de Hugging Face.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso externo ni de mantenimiento más allá de la fecha de creación (2026-11-25).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julienkay/tiny-random-Qwen3ForCausalLM-GGUF
- Repositorio del paquete Unity: https://github.com/julienkay/tools.doji.transformers
- llama.cpp (conversor `convert_hf_to_gguf.py`): https://github.com/ggml-org/llama.cpp
- Tokenizador de referencia: https://huggingface.co/Qwen/Qwen3.5-0.8B
