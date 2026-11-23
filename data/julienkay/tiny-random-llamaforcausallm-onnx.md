# julienkay/tiny-random-LlamaForCausalLM-onnx

## Resumen

`julienkay/tiny-random-LlamaForCausalLM-onnx` es un modelo de prueba (fixture) publicado por el desarrollador julienkay para validar el paquete de Unity `tools.doji.transformers`. No es un modelo entrenado ni pensado para uso productivo: se trata de un `LlamaForCausalLM` de 2 capas con pesos aleatorios, exportado a ONNX plano (opset 17, solo operadores estándar) y acompañado del tokenizador de `HuggingFaceTB/SmolLM2-135M-Instruct`. Su función es servir como caso de test reproducible para la infraestructura de inferencia de Unity, no para generar contenido útil.

La relevancia del artefacto es puramente de ingeniería: ejemplifica el contrato de entradas y salidas que espera un runtime de inferencia causal con caché KV (las mismas entradas y salidas que los exports de `optimum`: `input_ids`, `attention_mask`, `position_ids`, `past_key_values.{i}.key/value` de entrada; `logits` y `present.{i}.key/value` de salida). Resulta útil para quien desarrolle o depure integraciones ONNX en Unity o en cualquier pipeline que consuma grafos ONNX con caché de atención y grouped-query attention.

Al estar generado con el script `tools/causal_lm/make_models.py tiny` del repositorio del paquete, el modelo es determinista en su construcción pero aleatorio en sus pesos: genera texto sin sentido por diseño. Cualquier evaluación de calidad, razonamiento o capacidades lingüísticas carece de sentido sobre este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (`LlamaForCausalLM`), 2 capas, grouped-query attention |
| Parametros totales | no disponible (modelo "tiny" con pesos aleatorios; el repo ocupa 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no declarada en la model card) |
| Tipos de cuantizacion | no disponible (export ONNX en precisión original, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (el tokenizador es el de SmolLM2-135M-Instruct, pero el modelo no ha sido entrenado) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17, operadores estándar); tokenizador de SmolLM2-135M-Instruct |

## Arquitectura y entrenamiento

La arquitectura es un decoder-only transformer de tipo Llama con solo 2 capas y atención de consultas agrupadas (GQA). El grafo ONNX se exportó con operadores estándar de opset 17, sin operadores personalizados, lo que maximiza la portabilidad entre runtimes. El modelo ejecuta tanto el prompt como cada token nuevo en un único grafo, gestionando la caché KV mediante las entradas `past_key_values.{i}.key/value` y las salidas `present.{i}.key/value`, con el mismo esquema de E/S que los exports de `optimum`. Las entradas son `input_ids`, `attention_mask` y `position_ids`; la salida principal son los `logits`.

No hubo entrenamiento: los pesos son aleatorios. No existe dataset, número de tokens, fase de preentrenamiento, ajuste supervisado, RLHF ni DPO asociados. La única "innovación" técnica relevante es la del propio artefacto como fixture: un grafo ONNX mínimo y portable que ejercita el camino completo de inferencia autorregresiva con caché KV, útil para tests de integración del runtime de Unity (`tools.doji.transformers`). El tokenizador se toma prestado de SmolLM2-135M-Instruct para que el pipeline de tokenización sea realista aunque el modelo no lo sea.

## Capacidades

- Generación de texto autorregresiva con caché KV: implementa el bucle de decodificación token a token con reutilización de claves y valores.
- Compatibilidad con el esquema de E/S de `optimum`: entradas `input_ids`, `attention_mask`, `position_ids`, `past_key_values.{i}.key/value`; salidas `logits`, `present.{i}.key/value`.
- Grouped-query attention: el grafo ejercita GQA, lo que permite validar implementaciones de atención con distinto número de cabezas de query y de clave/valor.
- Tokenización realista: usa el tokenizador de `HuggingFaceTB/SmolLM2-135M-Instruct`, por lo que el pipeline texto→ids→logits→texto es funcional de extremo a extremo.
- Razonamiento, código, matemáticas, visión, audio: no disponible (el modelo no ha sido entrenado; su salida es texto aleatorio).
- Tool calling / function calling: no soportado.
- Capacidades de agente o razonamiento multi-paso: no soportadas.
- Multilingüismo: no aplicable; el tokenizador cubre el vocabulario de SmolLM2 pero el modelo no produce lenguaje coherente.

## Casos de uso

- Test de integración del runtime de Unity: sirve como fixture en la suite de `tools.doji.transformers` para verificar que el motor de inferencia carga grafos ONNX, gestiona la caché KV y produce logits con la forma esperada.
- Validación de exportadores ONNX: permite comprobar que un pipeline de exportación (por ejemplo, basado en `optimum`) genera un grafo con el contrato de entradas y salidas correcto antes de aplicarlo a modelos reales.
- Pruebas de regresión de decodificación autorregresiva: al ser determinista en construcción y pequeño, se puede usar para detectar cambios de comportamiento en el bucle de generación (gestión de `position_ids`, máscaras de atención y concatenación de caché) sin coste de cómputo.
- Benchmarking de latencia de infraestructura: con 2 capas y pesos mínimos, mide el overhead del runtime (carga de grafo, asignación de buffers, orquestación) aislando el coste del modelo.
- Desarrollo de kernels de atención con GQA: útil para validar implementaciones de atención agrupada en backends ONNX Runtime, Unity Inference Engine u otros, comparando formas y flujos de tensores.
- Docencia y ejemplos reproducibles: sirve para ilustrar el formato de E/S de un `LlamaForCausalLM` exportado a ONNX sin necesidad de descargar checkpoints de varios gigabytes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería degenerada y no informativa.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el repositorio ocupa 0.0 GB y el modelo tiene 2 capas, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) es más que suficiente. Para tests en CI, CPU es la opción habitual.
- Cabe en consumer GPU: sí, en cualquier modelo; también en entornos sin GPU.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), Unity Inference Engine (objetivo declarado del artefacto), y cualquier runtime compatible con ONNX opset 17 y operadores estándar. No se publican pesos en GGUF ni safetensors, por lo que llama.cpp u Ollama no son aplicables directamente sin conversión.
- Latencia y throughput estimados: no disponibles de forma publicada; por el tamaño (2 capas, pesos mínimos), la latencia estará dominada por el overhead del runtime y no por el cómputo del modelo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (fixtures ONNX para tests de inferencia). Como referencia de tokenizador, el modelo usa el de `HuggingFaceTB/SmolLM2-135M-Instruct`, pero no es un comparable funcional.

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| julienkay/tiny-random-LlamaForCausalLM-onnx | no disponible (tiny) | no disponible | Apache 2.0 | Fixture de test ONNX |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | no disponible en esta ficha | no disponible en esta ficha | Modelo instructivo real (solo comparte tokenizador) |

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido entrenado y genera texto sin sentido por diseño; no debe usarse para ninguna tarea de generación real.
- No apto para producción: es un artefacto de test; desplegarlo para atender usuarios o generar contenido produciría resultados degenerados.
- Sin datos de entrenamiento, idiomas ni contexto declarados: no es posible caracterizar su comportamiento lingüístico ni su ventana efectiva.
- Riesgo de alucinación: total y estructural; la salida es aleatoria, no verificable ni fundamentada.
- Sesgos: no evaluables, al no existir entrenamiento con datos reales.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el uso comercial del modelo en sí carece de sentido por su naturaleza aleatoria; verificar además la licencia del tokenizador de SmolLM2-135M-Instruct si se redistribuye.
- Dependencia de opset 17 y operadores estándar: la portabilidad es alta, pero runtimes que no soporten ese opset o el esquema de caché KV de `optimum` no podrán ejecutarlo.
- El repositorio ocupa 0.0 GB según Hugging Face, lo que puede indicar que los archivos no están materializados o que el tamaño es inferior a la precisión de medida de la plataforma; conviene verificar la integridad de los ficheros antes de usarlo en CI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julienkay/tiny-random-LlamaForCausalLM-onnx
- Repositorio del paquete de Unity: https://github.com/julienkay/tools.doji.transformers
- Tokenizador de referencia: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
