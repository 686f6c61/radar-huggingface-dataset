# julienkay/tiny-random-LlamaForCausalLM-GGUF

## Resumen

`julienkay/tiny-random-LlamaForCausalLM-GGUF` es un artefacto de pruebas publicado por el desarrollador julienkay, no un modelo de lenguaje destinado a uso real. Consiste en un `LlamaForCausalLM` de dos capas con pesos inicializados aleatoriamente, convertido a formato GGUF mediante el script `convert_hf_to_gguf.py` de llama.cpp. Su proposito es servir como fixture de tests para el paquete de Unity `tools.doji.transformers`, que implementa inferencia de transformers en C# dentro del motor Unity.

El modelo cuenta con 1.591.456 parametros totales, cuatro cabezas de atencion para query y dos para key/value, y reutiliza el tokenizador de `HuggingFaceTB/SmolLM2-135M-Instruct` con el pre-tokenizador `smollm`. Se distribuye en tres variantes de cuantizacion (F32, BF16 y Q8_0) y genera texto aleatorio por construccion, ya que sus pesos no han sido entrenados.

Su relevancia es puramente tecnica y de infraestructura: permite validar pipelines de conversion, carga de GGUF y paridad numerica de logits en entornos Unity sin necesidad de descargar modelos grandes. No debe confundirse con un modelo funcional para generacion de texto, razonamiento o cualquier tarea de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM), 2 capas |
| Parametros totales | 1.591.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, BF16, Q8_0 |
| Idiomas soportados | no disponible (tokenizador de SmolLM2-135M-Instruct) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`model-f32.gguf`, `model-bf16.gguf`, `model-q8_0.gguf`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo Llama con dos capas, cuatro cabezas de query y dos de key/value (GQA con ratio 2:1). Los pesos son aleatorios: no ha habido preentrenamiento, fine-tuning, RLHF ni DPO. El modelo se genera con el script `tools/causal_lm/make_models.py tiny --arch llama` del repositorio del paquete Unity, y posteriormente se convierte a GGUF con `convert_hf_to_gguf.py` de llama.cpp (commit `244640b7f26e2a7301b27a24edc4f7feaf97d52f`).

La conversion aplica la permutacion de filas en los pesos de query y key de cada cabeza, tal como hace el conversor para todos los modelos Llama, lo que garantiza compatibilidad con el runtime de llama.cpp. El tokenizador procede de SmolLM2-135M-Instruct (Apache 2.0) y emplea el pre-tokenizador `smollm`. Los ficheros de referencia de logits y tokens se generan con `tools/causal_lm/make_models.py gguf-references --f32` para validar la paridad numerica en los tests.

## Capacidades

- Generacion de texto aleatorio: el modelo produce secuencias sin coherencia semantica por construccion (pesos aleatorios).
- Carga y ejecucion en Unity mediante el paquete `tools.doji.transformers` (API `AutoModelForCausalLM.FromGguf` y `AutoTokenizer.FromGguf`).
- Verificacion de paridad numerica de logits frente a referencias generadas con llama.cpp.
- Validacion de pipelines de conversion HF a GGUF en las variantes F32, BF16 y Q8_0.
- Soporte de tokenizacion compatible con el vocabulario de SmolLM2-135M-Instruct.
- No soporta tool calling, agentes, vision, audio ni razonamiento multi-paso de forma funcional.

## Casos de uso

- Test de integracion en Unity: sirve como fixture para validar que `tools.doji.transformers` carga correctamente ficheros GGUF y ejecuta inferencia dentro del motor, sin requerir modelos de gran tamano.
- Validacion de conversion HF a GGUF: permite comprobar que el conversor de llama.cpp produce ficheros con la arquitectura `llama` y la permutacion de pesos esperada en un caso minimo reproducible.
- Pruebas de paridad numerica: los logits de referencia generados con `gguf-references --f32` permiten verificar que la implementacion C# reproduce los mismos valores que llama.cpp.
- Benchmark de latencia en CI: al tener solo 1,6 M de parametros, se puede ejecutar en cada commit para detectar regresiones de rendimiento en el runtime.
- Pruebas de cuantizacion: comparar las salidas de F32, BF16 y Q8_0 sobre el mismo input para validar la implementacion de kernels cuantizados.
- Validacion de tokenizador: comprobar que el pre-tokenizador `smollm` y el vocabulario embebido en el GGUF se cargan y aplican correctamente en el runtime de Unity.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo genera texto aleatorio, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 10 MB en cualquiera de las tres variantes (1,6 M de parametros; F32 ~6,4 MB, BF16 ~3,2 MB, Q8_0 ~1,6 MB).
- GPU recomendadas: cualquier GPU compatible con llama.cpp o con el runtime de Unity; no requiere aceleracion dedicada.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna; tambien se ejecuta en CPU.
- Opciones de despliegue: llama.cpp, `tools.doji.transformers` (Unity, C#), cualquier runtime compatible con GGUF. No se ha validado con vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un modelo de juguete, la latencia vendra dominada por el overhead del runtime, no por el computo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| julienkay/tiny-random-LlamaForCausalLM-GGUF | 1,59 M | no disponible | Fixture de tests | Apache 2.0 | Hugging Face |
| julienkay/tiny-random-LlamaForCausalLM-onnx | no disponible | no disponible | Fixture de tests (ONNX) | no disponible | Hugging Face |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | no disponible | Modelo funcional pequeno | Apache 2.0 | Hugging Face |

La comparativa se limita a artefactos de prueba del mismo autor y al modelo del que se reutiliza el tokenizador. No existen alternativas funcionales comparables en calidad porque este modelo no esta entrenado.

## Limitaciones y advertencias

- Los pesos son aleatorios: el texto generado carece de coherencia y no debe usarse en produccion.
- No ha recibido entrenamiento, por lo que no tiene capacidades de razonamiento, codigo, matematicas ni conocimiento factual.
- No se ha evaluado sesgo, alucinacion ni comportamiento en dominios sensibles, ya que no es un modelo funcional.
- La longitud de contexto no esta documentada en la model card.
- El tokenizador procede de SmolLM2-135M-Instruct; su cobertura idiomatica no se detalla en la informacion disponible.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo no aporta valor fuera de tests de infraestructura.
- No esta pensado para servir endpoints de inferencia reales pese a la etiqueta `endpoints_compatible`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julienkay/tiny-random-LlamaForCausalLM-GGUF
- Modelo ONNX de origen: https://huggingface.co/julienkay/tiny-random-LlamaForCausalLM-onnx
- Repositorio del paquete Unity: https://github.com/julienkay/tools.doji.transformers
- Tokenizador de origen: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- llama.cpp (conversor GGUF): https://github.com/ggml-org/llama.cpp
