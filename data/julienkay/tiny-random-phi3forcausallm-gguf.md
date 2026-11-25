# julienkay/tiny-random-Phi3ForCausalLM-GGUF

## Resumen

`julienkay/tiny-random-Phi3ForCausalLM-GGUF` es un artefacto de prueba, no un modelo utilizable en producción. Se trata de una variante de la arquitectura `Phi3ForCausalLM` con pesos inicializados de forma aleatoria y tan solo 2 capas, empaquetada en formato GGUF de llama.cpp. Su autor, julienkay, lo publica como material de validación para el paquete de Unity `tools.doji.transformers`, que implementa inferencia de transformers en C# dentro del motor Unity.

El modelo no ha sido entrenado: genera texto aleatorio por diseño y su única función es servir como referencia determinista para tests de conversión, carga y ejecución de grafos GGUF. Con 2.072.736 parámetros totales (aproximadamente 2 millones), el objetivo es que los tests sean rápidos y ligeros, no que el modelo sea competente en ninguna tarea lingüística.

Es relevante únicamente para desarrolladores que trabajen en el ecosistema Unity/Doji o que necesiten un fixture GGUF mínimo con arquitectura phi3 y tokenizador sentencepiece real (tomado de `microsoft/Phi-3-mini-4k-instruct`) para validar pipelines de carga. Para cualquier uso de IA real debe descartarse por completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Phi3ForCausalLM (transformer decoder-only, 2 capas, pesos aleatorios) |
| Parametros totales | 2.072.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, BF16, Q8_0 |
| Idiomas soportados | no disponible (el tokenizador es el de Phi-3-mini-4k-instruct, sentencepiece) |
| Licencia | MIT |
| Formato de pesos | GGUF (model-f32.gguf, model-bf16.gguf, model-q8_0.gguf) |

## Arquitectura y entrenamiento

La arquitectura declarada en los ficheros GGUF es `phi3`, correspondiente a un transformer decoder-only con atención multi-cabeza estándar y capas de normalización. En este caso concreto, el modelo consta de solo 2 capas y todos sus pesos son aleatorios: no ha habido preentrenamiento, ajuste fino, RLHF ni DPO. No existe dataset de entrenamiento asociado.

El tokenizador sí es real: se emplea el modelo sentencepiece de `microsoft/Phi-3-mini-4k-instruct` (licencia MIT), lo que permite a los tests validar el pipeline completo de tokenización y detokenización con un vocabulario representativo. Los ficheros se generaron con `convert_hf_to_gguf.py` de llama.cpp (commit `244640b7f26e2a7301b27a24edc4f7feaf97d52f`) a partir del modelo transformers creado con `tools/causal_lm/make_models.py tiny --arch phi3`. Se ofrecen tres variantes de precisión: F32 (todos los tensores en coma flotante de 32 bits), BF16 (matrices en bfloat16, normas en F32) y Q8_0 (matrices cuantizadas a 8 bits, normas en F32).

## Capacidades

- No tiene capacidades lingüísticas reales: genera texto aleatorio de forma deliberada.
- Sirve como fixture de test para validar la carga de GGUF con arquitectura `phi3` en el motor de inferencia de Unity `tools.doji.transformers`.
- Permite comprobar la conversión y compatibilidad de tipos de tensor F32, BF16 y Q8_0.
- Valida el pipeline de tokenización con el tokenizador sentencepiece de Phi-3-mini.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- No dispone de capacidades multilingües verificables.

## Casos de uso

- Pruebas unitarias del paquete Unity `tools.doji.transformers`: el modelo se carga con `AutoModelForCausalLM.FromGguf("model-q8_0.gguf")` para verificar que el parser GGUF y el grafo de ejecución funcionan con arquitectura phi3.
- Validación de tokenizadores en C#: al usar el sentencepiece real de Phi-3-mini, permite comprobar que `AutoTokenizer.FromGguf` produce los mismos ids que la implementación de referencia.
- Comparación de precisión numérica: los tres ficheros (F32, BF16, Q8_0) permiten contrastar logits de referencia y detectar desviaciones en la implementación de kernels de cuantización.
- Integración continua del repositorio Doji: al pesar prácticamente nada (repo de 0.0 GB) y tener 2 millones de parámetros, los tests se ejecutan en segundos sin necesidad de GPU.
- Desarrollo de herramientas de conversión HF→GGUF: sirve como caso de prueba mínimo y reproducible para validar `convert_hf_to_gguf.py` con arquitectura phi3.
- Docencia y experimentación con formatos GGUF: útil para inspeccionar la estructura interna de un fichero GGUF sin la complejidad de un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en todas las variantes (2 millones de parámetros en F32 ocupan ~8 MB; Q8_0 ~2 MB).
- GPU recomendadas: ninguna en particular; funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, iGPU) e incluso en dispositivos móviles.
- Opciones de despliegue: llama.cpp, y el runtime propietario `Doji.AI.Transformers` para Unity. No se ha validado con vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas la inferencia es prácticamente instantánea en cualquier hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| tiny-random-Phi3ForCausalLM-GGUF | 2,07 M | no disponible | Fixture de test | MIT |
| microsoft/Phi-3-mini-4k-instruct | 3,8 B | 4.096 | Modelo real de instrucciones | MIT |
| julienkay/tiny-random-Phi3ForCausalLM-onnx | ~2 M | no disponible | Fixture de test en ONNX | MIT |

La comparación con Phi-3-mini solo es relevante a nivel de arquitectura y tokenizador compartidos; este artefacto no es un sustituto funcional. Frente a la variante ONNX del mismo autor, la diferencia es el formato de pesos (GGUF vs. ONNX) y el runtime objetivo (llama.cpp/Unity vs. ONNX Runtime).

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce texto coherente bajo ninguna circunstancia.
- No apto para producción, investigación lingüística ni evaluación de calidad.
- No se han documentado sesgos porque no hay entrenamiento; cualquier sesgo observado sería ruido estadístico.
- Riesgo de alucinación: total, en el sentido de que toda la salida es inventada.
- Longitud de contexto no documentada; no debe asumirse la de Phi-3-mini (4.096 tokens) solo por compartir tokenizador.
- Licencia MIT: permite uso comercial del artefacto, pero carece de sentido usarlo más allá de tests.
- El tag `endpoints_compatible` de Hugging Face no implica que el modelo sea funcional en Inference Endpoints para tareas reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julienkay/tiny-random-Phi3ForCausalLM-GGUF
- Modelo base ONNX del mismo autor: https://huggingface.co/julienkay/tiny-random-Phi3ForCausalLM-onnx
- Repositorio del paquete Unity: https://github.com/julienkay/tools.doji.transformers
- Tokenizador de origen: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- llama.cpp (conversión GGUF): https://github.com/ggml-org/llama.cpp
