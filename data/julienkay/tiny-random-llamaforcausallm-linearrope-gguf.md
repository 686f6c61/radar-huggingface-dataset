# julienkay/tiny-random-LlamaForCausalLM-LinearRoPE-GGUF

## Resumen

`julienkay/tiny-random-LlamaForCausalLM-LinearRoPE-GGUF` es un modelo de prueba (test fixture) publicado en Hugging Face por el desarrollador julienkay. No se trata de un modelo de lenguaje entrenado para uso real: es un `LlamaForCausalLM` de dos capas con pesos aleatorios y escalado de RoPE lineal (factor 4), empaquetado en formato GGUF de llama.cpp. Su única finalidad es servir como referencia para las pruebas automatizadas del paquete de Unity [tools.doji.transformers](https://github.com/julienkay/tools.doji.transformers), que implementa inferencia de transformers en C# dentro del motor Unity.

El modelo tiene 1.591.456 parámetros totales, utiliza el tokenizador de HuggingFaceTB/SmolLM2-135M-Instruct (licencia Apache 2.0) y genera texto aleatorio, sin ninguna capacidad lingüística útil. Se distribuye en tres variantes de cuantización (F32, BF16 y Q8_0) y su arquitectura declarada en los ficheros es `llama`, con la configuración de escalado de RoPE almacenada en las claves `llama.rope.scaling.type` (`linear`) y `llama.rope.scaling.factor`.

Es relevante únicamente como material de referencia técnico: permite validar la correcta implementación de la carga de GGUF, la arquitectura LLaMA y el escalado lineal de RoPE en el motor de inferencia de Unity, comparando logits y tokens generados contra referencias fijas. No debe confundirse con un modelo apto para producción, generación de código, razonamiento ni ninguna tarea downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo LLaMA (`LlamaForCausalLM`), 2 capas, con RoPE de escalado lineal (factor 4) |
| Parametros totales | 1.591.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 (todos los tensores), BF16 (matrices BF16, norms F32), Q8_0 (matrices Q8_0, norms F32) |
| Idiomas soportados | no disponible (el modelo genera texto aleatorio; el tokenizador es el de SmolLM2-135M-Instruct) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`model-f32.gguf`, `model-bf16.gguf`, `model-q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo es un `LlamaForCausalLM` de dos capas con pesos inicializados aleatoriamente; no ha sido entrenado. Incorpora escalado lineal de RoPE con factor 4, una variante de extensión de contexto que interpola las posiciones para alargar la ventana efectiva, aquí incluida únicamente para verificar que el runtime de Unity interpreta correctamente los metadatos `llama.rope.scaling.type` y `llama.rope.scaling.factor` del GGUF.

La generación de los ficheros se realizó con el script `tools/causal_lm/make_models.py tiny --arch llama_linear --no-onnx` del repositorio del paquete, seguido de la conversión con `convert_hf_to_gguf.py` de llama.cpp (commit `244640b7f26e2a7301b27a24edc4f7feaf97d52f`) usando `--outtype f32`, `bf16` o `q8_0`. Los logits y tokens de referencia para los tests se generan con `tools/causal_lm/make_models.py gguf-references --arch llama_linear --f32`. No hay datos de entrenamiento, RLHF, DPO ni composición de dataset porque el modelo no se entrena.

## Capacidades

- No genera texto coherente: produce salida aleatoria por diseño.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales (el tokenizador es de SmolLM2-135M-Instruct, pero los pesos son aleatorios).
- No dispone de modo thinking, visión ni audio.
- Su función es servir como fixture de test para validar la carga de GGUF, la arquitectura LLaMA y el escalado lineal de RoPE en el runtime de Unity.

## Casos de uso

- Pruebas de integración del paquete tools.doji.transformers: se carga el GGUF y se comparan logits y tokens generados contra las referencias fijas para detectar regresiones en el parser de GGUF o en la implementación de la arquitectura LLaMA.
- Validación del soporte de escalado lineal de RoPE: al incluir `llama.rope.scaling.type = linear` y `factor = 4`, permite comprobar que el runtime aplica correctamente la interpolación de posiciones.
- Verificación de cuantizaciones: los tres ficheros (F32, BF16, Q8_0) permiten probar las rutas de dequantización y comparar resultados entre precisiones.
- Test de carga de tokenizador desde GGUF: se usa el tokenizador de SmolLM2-135M-Instruct embebido para validar `AutoTokenizer.FromGguf`.
- Benchmark de latencia del motor en Unity: al ser un modelo de 1,6 M de parámetros, permite medir el overhead del runtime sin que el coste computacional del modelo domine la medición.
- Integración continua del repositorio: el tamaño reducido (repo de 0,0 GB) y la licencia Apache 2.0 facilitan incluirlo en pipelines de CI sin coste de almacenamiento ni restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no está entrenado y su salida es aleatoria, por lo que métricas como MMLU, HumanEval o GSM8K no son aplicables.

## Requisitos de hardware

- VRAM estimada: inferior a 10 MB en cualquiera de las tres cuantizaciones (1,6 M de parámetros; F32 ≈ 6,4 MB, BF16 ≈ 3,2 MB, Q8_0 ≈ 1,6 MB, más overhead de tokenizador y metadatos).
- GPU recomendadas: cualquier GPU es sobredimensionada; el modelo está pensado para ejecutarse en CPU o en el runtime de Unity.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU, y también en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), el paquete tools.doji.transformers para Unity (C#), y cualquier runtime compatible con GGUF. vLLM y TGI no están orientados a este caso de uso.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la latencia vendrá dominada por el overhead del runtime y no por el cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| tiny-random-LlamaForCausalLM-LinearRoPE-GGUF | 1.591.456 | no disponible | Apache 2.0 | Fixture de test para runtime Unity |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | no disponible en la informacion | Apache 2.0 | Modelo instruct pequeño real (origen del tokenizador) |
| Modelos "tiny-random" de transformers (p. ej. hf-internal-testing) | variable (tipicamente < 10 M) | no disponible | variable | Fixtures de test para librerías |

La comparación con modelos de producción no es significativa: este modelo solo es comparable con otros fixtures de test. SmolLM2-135M-Instruct se incluye únicamente porque aporta el tokenizador, no porque sea un equivalente funcional.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no produce texto coherente y no debe usarse para ninguna tarea real.
- No ha sido entrenado ni alineado; no hay evaluación de sesgos ni de alucinación porque no aplica.
- La longitud de contexto no está documentada en la información disponible.
- Aunque la licencia es Apache 2.0, el uso comercial no tiene sentido práctico al no ser un modelo funcional.
- El tokenizador procede de SmolLM2-135M-Instruct (Apache 2.0); conviene mantener la atribución correspondiente si se redistribuye.
- No debe confundirse con un modelo LLaMA de Meta ni con un modelo listo para producción; el nombre incluye "tiny-random" precisamente para indicar su naturaleza.

## Enlaces

- [Hugging Face: julienkay/tiny-random-LlamaForCausalLM-LinearRoPE-GGUF](https://huggingface.co/julienkay/tiny-random-LlamaForCausalLM-LinearRoPE-GGUF)
- [Repositorio tools.doji.transformers](https://github.com/julienkay/tools.doji.transformers)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Tokenizador de origen: HuggingFaceTB/SmolLM2-135M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
