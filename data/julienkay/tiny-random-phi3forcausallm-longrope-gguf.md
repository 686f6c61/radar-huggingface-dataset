# julienkay/tiny-random-Phi3ForCausalLM-LongRoPE-GGUF

## Resumen

`julienkay/tiny-random-Phi3ForCausalLM-LongRoPE-GGUF` es un modelo de prueba (test fixture) publicado por el desarrollador julienkay. No es un modelo entrenado para producir lenguaje útil: se trata de una implementación de la arquitectura `Phi3ForCausalLM` de solo 2 capas con pesos aleatorios, exportada a formato GGUF de llama.cpp. Su función es servir como referencia verificable en la batería de tests del paquete de Unity `tools.doji.transformers`, que implementa inferencia de transformers en C# para el motor Unity.

El interés técnico del artefacto no está en sus capacidades lingüísticas, sino en que reproduce fielmente el escalado de RoPE tipo LongRoPE empleado por los modelos Phi-3 de contexto largo. El modelo declara un contexto original de 12 posiciones y un contexto extendido de 48, de modo que un prompt corto activa los factores de escalado cortos (`rope_factors_short`) y la generación conmuta a los factores largos (`rope_factors_long`). Esto permite validar en tests la lógica de selección dinámica de factores de RoPE, algo difícil de comprobar con modelos reales de gran tamaño.

Con 2.072.744 parámetros totales, licencia MIT y un tamaño de repositorio prácticamente nulo, el modelo está pensado exclusivamente para desarrollo y CI. Genera texto aleatorio por diseño, por lo que no debe emplearse en ninguna aplicación de producción. Su tokenizador es el sentencepiece de `microsoft/Phi-3-mini-4k-instruct` (también MIT).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only `Phi3ForCausalLM` (2 capas), con escalado LongRoPE |
| Parametros totales | 2.072.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 12 posiciones (original) / 48 posiciones (extendida con LongRoPE) |
| Tipos de cuantizacion | F32, BF16 (matrices BF16, norms F32), Q8_0 (matrices Q8_0, norms F32) |
| Idiomas soportados | no disponible (el tokenizador procede de Phi-3-mini, pero el modelo genera texto aleatorio) |
| Licencia | MIT |
| Formato de pesos | GGUF (`model-f32.gguf`, `model-bf16.gguf`, `model-q8_0.gguf`) |

## Arquitectura y entrenamiento

La arquitectura es un `Phi3ForCausalLM` reducido a 2 capas, con pesos inicializados de forma aleatoria: no ha habido entrenamiento. El modelo se genera mediante el script `tools/causal_lm/make_models.py tiny --arch phi3_longrope --no-onnx` del repositorio del paquete `tools.doji.transformers`. Posteriormente se convierte a GGUF con `convert_hf_to_gguf.py` de llama.cpp (commit `244640b7f26e2a7301b27a24edc4f7feaf97d52f`), usando `--outtype f32`, `bf16` o `q8_0`. La arquitectura declarada dentro de los ficheros GGUF es `phi3`.

La innovación relevante es la incorporación de los factores de escalado LongRoPE de los modelos Phi-3 de contexto largo, almacenados en los tensores `rope_factors_short` y `rope_factors_long`, junto con el factor de atención en `phi3.rope.scaling.attn_factor`. Dado que el contexto original es de 12 posiciones y el extendido de 48, el modelo permite comprobar que la implementación cliente selecciona los factores cortos para prompts breves y conmuta a los largos durante la generación. Los logits y tokens de referencia para los tests se generan con `tools/causal_lm/make_models.py gguf-references --f32`.

## Capacidades

- Generación de texto aleatorio: el modelo produce secuencias sin coherencia lingüística, por diseño.
- Verificación de la lógica de escalado LongRoPE: selección de factores cortos y largos según la longitud de la secuencia.
- Prueba de conformidad de tokenizador: usa el sentencepiece de `microsoft/Phi-3-mini-4k-instruct`.
- Validación de carga e inferencia GGUF en el runtime de Unity `Doji.AI.Transformers` (API `AutoModelForCausalLM.FromGguf` y `AutoTokenizer.FromGguf`).
- Comparación de logits y tokens frente a referencias generadas por llama.cpp.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponible (no evaluables en un modelo con pesos aleatorios).

## Casos de uso

- Tests de integración en CI del paquete `tools.doji.transformers`: el modelo se carga con `AutoModelForCausalLM.FromGguf` y se comparan los logits generados con las referencias de `gguf-references`, detectando regresiones en el parser GGUF o en el kernel de atención.
- Validación de la implementación de LongRoPE en C#: se ejecuta un prompt corto (menos de 12 posiciones) y se comprueba que se aplican `rope_factors_short`, y después se fuerza una generación que supere esa longitud para verificar la conmutación a `rope_factors_long`.
- Pruebas de compatibilidad de tokenizador: al emplear el sentencepiece de Phi-3-mini, sirve para comprobar que el cargador de tokenizers desde GGUF reproduce las mismas IDs que la implementación de referencia.
- Verificación de los tres niveles de cuantización: los ficheros F32, BF16 y Q8_0 permiten testear las rutas de dequantización y las tolerancias numéricas de cada tipo de tensor (matrices en BF16/Q8_0 con norms en F32).
- Test de humo (smoke test) en entornos Unity sin GPU: con 2 millones de parámetros y un contexto de 48 posiciones, la inferencia se ejecuta en CPU en milisegundos, lo que permite incluirlo en pipelines de integración continua sin infraestructura especial.
- Reproducibilidad de artefactos: el modelo card documenta el commit exacto de llama.cpp y los comandos de conversión, de modo que el equipo puede regenerar los ficheros y comparar hashes o logits ante cambios en el conversor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) carecería de significado.

## Requisitos de hardware

- VRAM estimada: inferior a 10 MB en cualquiera de las tres cuantizaciones (2,07 M de parámetros; F32 ≈ 8,3 MB, BF16 ≈ 4,1 MB, Q8_0 ≈ 2,1 MB, sin contar overhead del runtime).
- GPU recomendadas: ninguna en particular; funciona en cualquier GPU con soporte del runtime, e incluso en CPU.
- Cabe en cualquier GPU consumer, incluidas iGPU y dispositivos móviles; también en CPU sin aceleración.
- Opciones de despliegue: llama.cpp (formato nativo GGUF) y el runtime de Unity `Doji.AI.Transformers` mediante `AutoModelForCausalLM.FromGguf`. No está pensado para vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles de forma publicada; por el tamaño, la inferencia en CPU debería completarse en el orden de milisegundos para las 48 posiciones de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Formato |
|---|---|---|---|---|---|
| `julienkay/tiny-random-Phi3ForCausalLM-LongRoPE-GGUF` | 2,07 M | 12 / 48 (LongRoPE) | Test fixture de inferencia GGUF en Unity | MIT | GGUF (F32, BF16, Q8_0) |
| `microsoft/Phi-3-mini-4k-instruct` | 3,8 B | 4.096 | Modelo instructivo real | MIT | safetensors, GGUF (comunitario) |
| `microsoft/Phi-3-mini-128k-instruct` | 3,8 B | 128.000 (LongRoPE) | Modelo instructivo de contexto largo | MIT | safetensors, GGUF (comunitario) |
| Modelos `tiny-random-*` de Hugging Face (p. ej. `hf-internal-testing/tiny-random-*`) | < 10 M | variable | Test fixtures de transformers | variable (habitualmente Apache-2.0 o MIT) | safetensors, a veces GGUF |

La comparación relevante es con los modelos Phi-3 reales, de los que este artefacto toma la arquitectura y el esquema de escalado RoPE pero no los pesos ni las capacidades. Frente a otros `tiny-random`, su particularidad es la exportación a GGUF con factores LongRoPE explícitos y un tokenizador real de Phi-3.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo genera texto sin sentido; no debe usarse para ninguna tarea de NLP, ni siquiera como demo.
- Contexto mínimo: 12 posiciones originales y 48 extendidas; no admite prompts reales de longitud habitual.
- Sin datos de entrenamiento: no hay corpus, RLHF ni DPO, por lo que no existen sesgos aprendidos, pero tampoco comportamiento alineado.
- Idiomas: no disponible; el tokenizador es multilingüe (Phi-3-mini), pero la salida es aleatoria.
- Licencia MIT: permite uso comercial del artefacto, aunque su única utilidad práctica es el testing. El tokenizador subyacente es también MIT.
- No apto para producción: sin garantías de estabilidad de API del runtime de Unity ni de los formatos GGUF generados con un commit concreto de llama.cpp; cambios en el conversor pueden invalidar las referencias.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; es un artefacto de uso interno, no un modelo mantenido para la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/julienkay/tiny-random-Phi3ForCausalLM-LongRoPE-GGUF
- Repositorio del paquete de Unity: https://github.com/julienkay/tools.doji.transformers
- llama.cpp (conversor `convert_hf_to_gguf.py`): https://github.com/ggml-org/llama.cpp
- Tokenizador de origen: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Paper de LongRoPE: no disponible en la informacion proporcionada
