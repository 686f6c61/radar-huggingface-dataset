# ggml-org-dev/tiny-pplx-decider-v1-27b-for-testing

## Resumen

`tiny-pplx-decider-v1-27b-for-testing` es una copia modificada y deliberadamente "dañada" del modelo `perplexity-ai/pplx-decider-v1-27b`, publicada por la organización `ggml-org-dev`. No es un modelo funcional: su salida es, según el propio autor, "gibberish" (texto sin sentido). Su propósito es exclusivamente servir como fixture de pruebas para el software llama.cpp, de modo que el pipeline de integración continua pueda ejercitar las mismas rutas de código que el modelo real sin necesidad de cargar los 27.000 millones de parámetros del original.

La relevancia de esta ficha es, por tanto, la de documentar una herramienta de testing, no un modelo de producción. Conserva la arquitectura, el tokenizer, la plantilla de chat, el fichero `decision_config.json` (códigos, token ids y temperatura) y el mecanismo de lectura (`readout`) del modelo original, lo que permite validar el tipo de decisión `pplx-decider` en llama.cpp: una lectura no causal de 255 códigos de opción almacenados como cabeza LM, con temperatura calibrada y entrada de imagen.

El modelo tiene 9.563.572 parámetros reales según los safetensors, frente a los 27B del original, y se distribuye bajo licencia Apache 2.0. Está construido sobre la arquitectura `qwen3_5` y deriva, en última instancia, de `Qwen/Qwen3.8-27B` vía `perplexity-ai/pplx-decider-v1-27b`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido tipo `qwen3_5` (atención lineal + atención completa), con codificador de visión y cabeza de decisión no causal |
| Parametros totales | 9.563.572 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en esta ficha; existe una versión GGUF en `ggml-org-dev/tiny-pplx-decider-v1-27b-for-testing-GGUF` |
| Idiomas soportados | no disponible (el autor advierte que la salida es gibberish) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un único `model.safetensors` fusionado a partir de 11 shards) |

## Arquitectura y entrenamiento

El modelo es un recorte estructural del original. El modelo de texto conserva 4 de las 64 capas (capas 0-3: 3 de atención lineal y 1 de atención completa), con hidden size reducido de 5120 a 32, FFN de 17408 a 64, cabezas de 24 a 2 y KV heads de 4 a 1 (manteniendo `head_dim` 256). La atención lineal pasa de 16 a 2 key heads y de 48 a 6 value heads (manteniendo `head_dim` 128). El codificador de visión conserva 2 de los 27 bloques, con hidden size 1152 a 144, cabezas 16 a 2 (`head_dim` 72), FFN 4304 a 288 y salida 5120 a 32. El fichero `readout.safetensors` se reduce de 255 x 5120 a 255 x 32, tomando las primeras columnas.

El recorte se realizó con el script `slice_qwen35_decision.py`, que sigue la skill `slice-model` de llama.cpp. No se ha realizado ningún entrenamiento ni ajuste fino adicional: el modelo es una poda estructural de los pesos del original. No se incluyen el código Python del repositorio original (`source/`, `inference.py`) ni `release-manifest.json`. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO), ya que el autor no los documenta para esta copia.

## Capacidades

- No es un modelo funcional: el autor declara explícitamente que su salida es gibberish y que no debe usarse para nada distinto de probar software.
- Conserva la plantilla de chat del modelo original, lo que permite validar el formateo de conversaciones en llama.cpp.
- Conserva el fichero `decision_config.json` con los códigos, token ids y temperatura calibrada del modelo original.
- Conserva el mecanismo de lectura no causal de 255 códigos de opción almacenados como cabeza LM (tipo de decisión `pplx-decider`).
- Conserva la ruta de entrada de imagen del codificador de visión, aunque con 2 de 27 bloques y dimensiones reducidas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo funcional.

## Casos de uso

- Pruebas de integración continua en llama.cpp: permite ejecutar el tipo de decisión `pplx-decider` en CI con un modelo de 9,5M de parámetros en lugar de 27B, validando que las rutas de código no rompen.
- Validación de la carga de safetensors fusionados: al distribuirse como un único `model.safetensors` en lugar de 11 shards, sirve para probar el cargador de pesos en escenarios simplificados.
- Verificación de la plantilla de chat: al conservar la del modelo original, se puede comprobar que el tokenizer y el formateo de mensajes funcionan correctamente antes de desplegar el modelo real.
- Pruebas de `decision_config.json`: permite validar el parseo de códigos, token ids y temperatura calibrada sin cargar el modelo completo.
- Pruebas de la ruta de visión: con 2 bloques del codificador, se puede ejercitar la entrada de imagen y comprobar que el pipeline no falla en el preprocesado.
- Pruebas de regresión en la cabeza de decisión: el `readout` reducido a 255 x 32 permite comprobar que la lectura no causal de 255 opciones se ejecuta sin errores de forma.
- Comparación de comportamiento entre la versión safetensors y la GGUF: la existencia de una variante GGUF permite validar la paridad de carga entre ambos formatos en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (9,5M de parámetros, aproximadamente 38 MB en fp32 y 19 MB en fp16), aunque el tamaño real depende del tokenizer, del codificador de visión y de los ficheros auxiliares.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una RTX 4090, RTX 3060 o incluso en CPU.
- Cabe en consumer GPU: sí, en cualquier GPU con al menos 1 GB de VRAM; también es viable en CPU.
- Opciones de despliegue: llama.cpp (el autor lo publica específicamente para este runtime, con variante GGUF); no se documentan otras opciones como vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponibles; al ser un modelo de pruebas con salida gibberish, las cifras no serían representativas del modelo original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `ggml-org-dev/tiny-pplx-decider-v1-27b-for-testing` | 9,5M | no disponible | Apache 2.0 | Fixture de testing para llama.cpp |
| `perplexity-ai/pplx-decider-v1-27b` | 27B (aproximado, según nombre) | no disponible | Apache 2.0 (según el autor) | Modelo real de decisión con lectura no causal de 255 opciones |
| `Qwen/Qwen3.8-27B` | 27B (aproximado, según nombre) | no disponible | no disponible en esta ficha | Modelo base del que deriva el original |

La comparación relevante es con el modelo original: esta copia conserva la arquitectura, tokenizer, plantilla de chat, `decision_config.json` y `readout`, pero reduce el modelo de texto a 4 de 64 capas y el codificador de visión a 2 de 27 bloques. No se dispone de datos de rendimiento del original ni de alternativas equivalentes de testing.

## Limitaciones y advertencias

- El autor advierte explícitamente de que es una copia modificada y dañada, y de que su salida es gibberish; no debe usarse para inferencia real.
- No es apto para producción, investigación ni evaluación de calidad: cualquier métrica obtenida no es representativa del modelo original.
- No se han documentado sesgos, pero al ser una poda estructural sin entrenamiento, no se puede garantizar ningún comportamiento alineado.
- Riesgo de alucinación: total, al no producir texto coherente.
- Limitaciones de contexto e idioma: no documentadas; el modelo no está pensado para uso lingüístico.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el propio autor desaconseja cualquier uso distinto del testing de software.
- El repositorio no incluye el código Python del original (`source/`, `inference.py`) ni `release-manifest.json`, por lo que no se puede reproducir el pipeline completo solo con esta ficha.
- El tamaño del repo indicado es 0.0 GB, lo que puede reflejar un problema de metadatos o de empaquetado; conviene verificar la integridad de los ficheros antes de usarlo en CI.

## Enlaces

- Hugging Face: https://huggingface.co/ggml-org-dev/tiny-pplx-decider-v1-27b-for-testing
- Versión GGUF: https://huggingface.co/ggml-org-dev/tiny-pplx-decider-v1-27b-for-testing-GGUF
- Modelo original: https://huggingface.co/perplexity-ai/pplx-decider-v1-27b
- Modelo base del original: https://huggingface.co/Qwen/Qwen3.8-27B
- Script de recorte: `slice_qwen35_decision.py` (incluido en el repositorio)
- Licencia: `LICENSE` (Apache 2.0) y `NOTICE` (incluidos en el repositorio)
