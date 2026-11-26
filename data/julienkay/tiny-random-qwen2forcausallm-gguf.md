# julienkay/tiny-random-Qwen2ForCausalLM-GGUF

## Resumen

`julienkay/tiny-random-Qwen2ForCausalLM-GGUF` es un modelo de prueba (fixture) publicado por Julien Kay para validar el motor de inferencia del paquete de Unity `tools.doji.transformers`. No es un modelo entrenado: se trata de un `Qwen2ForCausalLM` de tan solo 2 capas con pesos aleatorios, convertido a formato GGUF mediante el script `convert_hf_to_gguf.py` de llama.cpp (commit `244640b7f26e2a7301b27a24edc4f7feaf97d52f`). Su función es servir como referencia determinista en tests automatizados de carga, tokenizacion y ejecucion de inferencia dentro del ecosistema Unity.

El modelo tiene 4.880.672 parametros totales segun los datos de safetensors, con 4 cabezas de query y 2 cabezas de key/value, e incluye los sesgos (biases) en las proyecciones Q, K y V propias de la arquitectura Qwen2. Utiliza el tokenizador de `Qwen/Qwen2.5-0.5B-Instruct` (licencia Apache 2.0) con el pre-tokenizador `qwen2`. Genera texto aleatorio por construccion, ya que sus pesos no han sido entrenados.

Su relevancia es puramente practica para desarrolladores que trabajen con el paquete `tools.doji.transformers` o con integraciones de GGUF en Unity: permite verificar de forma reproducible la correccion de logits y tokens frente a las referencias generadas por `tools/causal_lm/make_models.py gguf-references --f32`. No debe confundirse con un modelo de proposito general ni usarse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM), 2 capas, 4 cabezas de query, 2 cabezas KV, con biases en Q/K/V |
| Parametros totales | 4.880.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, BF16, Q8_0 |
| Idiomas soportados | no disponible (tokenizador Qwen2.5, sin evaluacion linguistica) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`model-f32.gguf`, `model-bf16.gguf`, `model-q8_0.gguf`) |

## Arquitectura y entrenamiento

La arquitectura es un `Qwen2ForCausalLM` reducido a 2 capas, con 4 cabezas de atencion para query y 2 para key/value (GQA), e incluye los sesgos en las proyecciones de query, key y value que caracterizan a Qwen2. Los pesos son aleatorios: no ha habido entrenamiento, preentrenamiento, ajuste supervisado, RLHF ni DPO. El objetivo es disponer de un grafo computacional realista pero minimo, que ejercite las rutas de codigo de atencion, normalizacion, MLP y proyecciones de salida del motor de inferencia.

Los ficheros GGUF se generaron con el conversor oficial de llama.cpp en tres variantes: `model-f32.gguf` (todos los tensores en F32), `model-bf16.gguf` (matrices en BF16, normas en F32) y `model-q8_0.gguf` (matrices en Q8_0, normas en F32). El tokenizador procede de `Qwen/Qwen2.5-0.5B-Instruct`. Como innovacion tecnica destacable no hay ninguna propia del modelo; su valor esta en servir como referencia de logits y tokens para tests de regresion del paquete `tools.doji.transformers`.

## Capacidades

- Generacion de texto aleatorio: el modelo produce tokens sin coherencia semantica por construccion (pesos sin entrenar).
- Carga y ejecucion en formato GGUF: valida el pipeline de lectura de metadatos, tensores y tokenizador en llama.cpp y en el motor de Unity.
- Referencia de logits y tokens: permite comparar numericamente la salida del motor de inferencia con las referencias generadas por el script del autor.
- Tokenizacion compatible con Qwen2.5: usa el tokenizador de `Qwen/Qwen2.5-0.5B-Instruct` con pre-tokenizador `qwen2`.
- Integracion en Unity: pensado para el paquete `tools.doji.transformers` (`Doji.AI.Transformers`).
- No soporta tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso de forma funcional.

## Casos de uso

- Tests de regresion en CI del paquete `tools.doji.transformers`: cargar `model-q8_0.gguf` y comparar logits y tokens con las referencias f32 para detectar regresiones en el motor de inferencia.
- Validacion de conversores GGUF: comprobar que las variantes F32, BF16 y Q8_0 producen salidas consistentes tras la conversion con llama.cpp.
- Verificacion de tokenizadores en Unity: ejercitar `AutoTokenizer.FromGguf` con el vocabulario Qwen2 y el pre-tokenizador `qwen2`.
- Pruebas de integracion de carga de modelos: validar rutas de codigo de `AutoModelForCausalLM.FromGguf` sin necesidad de descargar modelos grandes ni consumir VRAM significativa.
- Benchmarking de infraestructura de inferencia: medir latencia y overhead de carga con un modelo de 4,88 M de parametros como linea base minima.
- Demostraciones y tutoriales: ejemplo didactico de como empaquetar y consumir un modelo GGUF en un proyecto Unity sin depender de pesos con licencias adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no esta entrenado y genera texto aleatorio, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en cualquiera de las tres variantes (F32, BF16, Q8_0), dado el tamano del repo de 0,1 GB.
- GPU recomendadas: cualquier GPU con soporte de llama.cpp; no requiere aceleracion dedicada. Funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, integradas) e incluso en entornos moviles.
- Opciones de despliegue: llama.cpp, y el motor de inferencia del paquete `tools.doji.transformers` en Unity. No esta pensado para vLLM, TGI ni Ollama en produccion.
- Latencia y throughput: no disponible; al ser un modelo de 2 capas, la latencia sera minima, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `julienkay/tiny-random-Qwen2ForCausalLM-GGUF` | 4,88 M | no disponible | Fixture de tests para Unity | Apache 2.0 | Hugging Face |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0,5 B | 32 K (aprox., segun model card oficial) | Modelo instructivo de proposito general | Apache 2.0 | Hugging Face |
| `hf-internal-testing/tiny-random-Qwen2ForCausalLM` | ~5 M (orden de magnitud) | no disponible | Fixture de tests de transformers | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de la misma categoria (fixtures de test o variantes minimas de Qwen2). Frente a `Qwen2.5-0.5B-Instruct`, este modelo no es funcional para tareas reales; frente a otros fixtures de `hf-internal-testing`, la diferencia esta en el empaquetado GGUF y en el tokenizador Qwen2.5 concreto.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido entrenado y genera texto sin sentido. No es apto para ninguna tarea de produccion.
- Sin capacidades funcionales: no soporta razonamiento, codigo, matematicas, tool calling ni agentes.
- Sin evaluacion linguistica: no hay datos sobre idiomas ni calidad de tokenizacion mas alla de la compatibilidad con Qwen2.5.
- Contexto no documentado: la model card no especifica la longitud maxima de contexto.
- Licencia Apache 2.0: permite uso comercial del codigo y los pesos, pero al no ser un modelo funcional, el uso comercial carece de sentido practico.
- Riesgo de confusion: el nombre incluye `Qwen2ForCausalLM`, lo que puede llevar a error si se busca un modelo Qwen2 real; conviene revisar la model card antes de integrarlo.
- Sin mantenimiento garantizado: el repo se creo y actualizo el mismo dia (2026-11-25) y no tiene descargas registradas; puede quedar obsoleto respecto a futuras versiones del paquete `tools.doji.transformers`.

## Enlaces

- Hugging Face: https://huggingface.co/julienkay/tiny-random-Qwen2ForCausalLM-GGUF
- Repositorio del paquete Unity: https://github.com/julienkay/tools.doji.transformers
- llama.cpp (conversor GGUF): https://github.com/ggml-org/llama.cpp
- Tokenizador de referencia: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
