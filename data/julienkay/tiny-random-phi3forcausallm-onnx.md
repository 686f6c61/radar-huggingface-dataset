# julienkay/tiny-random-Phi3ForCausalLM-onnx

## Resumen

`julienkay/tiny-random-Phi3ForCausalLM-onnx` es un artefacto de pruebas, no un modelo de lenguaje utilizable. Consiste en un `Phi3ForCausalLM` de solo 2 capas con pesos inicializados de forma aleatoria, exportado a ONNX plano (operaciones estandar, opset 17) para validar el funcionamiento del paquete de Unity [tools.doji.transformers](https://github.com/julienkay/tools.doji.transformers). El modelo genera texto aleatorio por diseno y no ha recibido ningun tipo de entrenamiento supervisado ni ajuste fino.

Su relevancia es exclusivamente de ingenieria: sirve como fixture reproducible para tests de integracion de inferencia ONNX dentro del motor Unity, verificando el contrato de entradas y salidas de las exportaciones de `optimum` (`input_ids`, `attention_mask`, `position_ids`, `past_key_values.{i}.key/value` como entradas; `logits` y `present.{i}.key/value` como salidas). Reutiliza el tokenizador de `microsoft/Phi-3-mini-4k-instruct` (revision `f39ac1d28e925b323eae81227eaba4464caced4e`, licencia MIT) para que el pipeline de tokenizacion sea identico al de un Phi-3 real.

No debe confundirse con un modelo Phi-3 mini: comparte arquitectura y tokenizador, pero no pesos ni capacidades. Cualquier evaluacion de calidad, razonamiento o generacion de codigo sobre este checkpoint carece de sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi3ForCausalLM), 2 capas, pesos aleatorios |
| Parametros totales | no disponible (repo de 0.0 GB; tamano exacto no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de la configuracion Phi-3; no verificada en la model card) |
| Tipos de cuantizacion | no disponible (exportacion ONNX en precision original, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (tokenizador de Phi-3-mini-4k-instruct, pero pesos sin entrenamiento linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17, operaciones estandar) |

## Arquitectura y entrenamiento

El modelo replica la topologia de `Phi3ForCausalLM` reducida a 2 capas, con pesos inicializados aleatoriamente y sin fase de preentrenamiento, ajuste supervisado, RLHF ni DPO. La exportacion sigue el esquema de `optimum` para modelos causales con cache KV: un unico grafo procesa tanto el prompt como cada token nuevo, aceptando `past_key_values.{i}.key/value` y devolviendo `present.{i}.key/value` para la iteracion siguiente. Se genero con el script `tools/causal_lm/make_models.py tiny --arch phi3` del repositorio del paquete Unity.

La innovacion tecnica relevante no esta en el modelo sino en el artefacto: al usar solo operaciones estandar de ONNX (opset 17), garantiza compatibilidad con backends de inferencia embebidos como Unity Inference Engine, sin depender de operadores personalizados ni de extensiones del runtime. El uso del tokenizador oficial de Phi-3-mini-4k-instruct permite validar de extremo a extremo el pipeline de tokenizacion y detokenizacion en el mismo entorno de test.

## Capacidades

- Generacion de texto aleatorio: produce secuencias sin coherencia linguistica, util solo para verificar que el grafo ONNX ejecuta y devuelve `logits` con la forma esperada.
- Inferencia autoregresiva con cache KV: soporta el bucle prompt + token a token mediante `past_key_values` y `present`.
- Compatibilidad con tokenizador Phi-3: acepta y decodifica tokens con el vocabulario de `microsoft/Phi-3-mini-4k-instruct`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No tiene capacidades multilingues reales pese al tokenizador.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Test de integracion del runtime ONNX en Unity: ejecutar el grafo dentro de Unity Inference Engine y comprobar que las formas y dtypes de `logits` y `present.{i}.key/value` coinciden con lo esperado por el paquete `tools.doji.transformers`.
- Validacion de exportaciones `optimum`: usar este checkpoint como referencia minima para verificar que el contrato de entradas y salidas (incluida la cache KV) se mantiene tras cambios en el pipeline de exportacion.
- Pruebas de regresion en CI: al ser un repo de 0.0 GB y 2 capas, cabe en cualquier runner y permite ejecutar tests de inferencia sin GPU ni descargas pesadas.
- Verificacion de tokenizacion: comprobar que el tokenizador Phi-3 se carga y produce los `input_ids` correctos en el entorno de test del paquete.
- Benchmark de sobrecarga del runtime: medir el coste fijo de inicializacion, carga del grafo y gestion de la cache KV sin que el tiempo de computo del modelo lo enmascare.
- Pruebas de compatibilidad de opset: validar que un backend concreto acepta opset 17 con operaciones estandar antes de portar un Phi-3 real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) seria equivalente a la de una salida aleatoria y no aporta informacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el repo ocupa 0.0 GB y la arquitectura tiene solo 2 capas.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (GTX 1060 o superior, RTX 3050, RTX 4090) es sobradamente suficiente si se quiere probar el backend GPU de ONNX Runtime.
- Cabe en cualquier GPU consumer y en entornos embebidos o moviles.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML), Unity Inference Engine. No se ha publicado conversion a GGUF, por lo que llama.cpp u Ollama no son aplicables directamente.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la latencia estara dominada por la sobrecarga del runtime y no por el computo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| julienkay/tiny-random-Phi3ForCausalLM-onnx | no disponible (2 capas, aleatorio) | no disponible | Fixture de test ONNX para Unity | MIT | Hugging Face |
| microsoft/Phi-3-mini-4k-instruct | 3.8B | 4K | Modelo instructivo real | MIT | Hugging Face |
| Modelos "tiny-random-*" de Hugging Face (p. ej. tiny-random-LlamaForCausalLM) | variable, muy reducido | no disponible | Tests de pipelines y exportaciones | variable | Hugging Face |

La comparacion relevante es con otros checkpoints `tiny-random` usados como fixtures: este se distingue por su exportacion ONNX con cache KV explicita y por integrarse en un paquete Unity concreto. Frente a Phi-3-mini-4k-instruct comparte tokenizador y arquitectura, pero no es un sustituto en ningun escenario de produccion.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce texto coherente ni respuestas utiles; no debe desplegarse en ningun caso de uso real.
- Riesgo de confusion: el nombre incluye "Phi3" y reutiliza el tokenizador de Phi-3-mini-4k-instruct, lo que puede llevar a error si se descubre fuera del contexto del repositorio de test.
- Sin datos de entrenamiento: no hay sesgos aprendidos, pero tampoco alineacion, filtros de seguridad ni comportamiento instructivo.
- Idiomas: la model card no declara idiomas soportados; el tokenizador cubre el vocabulario de Phi-3, pero el modelo no genera lenguaje en ninguno.
- Licencia MIT: permite uso comercial del artefacto, pero al no ser funcional como modelo de lenguaje la licencia es irrelevante a efectos practicos; el tokenizador subyacente es tambien MIT.
- Contexto: no se documenta la longitud de contexto efectiva del checkpoint exportado; no asumir los 4K de Phi-3-mini sin verificarlo en la configuracion.
- Produccion: no apto. Cualquier uso en pipeline productivo constituye un error de seleccion de modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julienkay/tiny-random-Phi3ForCausalLM-onnx
- Repositorio del paquete Unity: https://github.com/julienkay/tools.doji.transformers
- Tokenizador de referencia: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Documentacion de ONNX: https://onnx.ai/
- Documentacion de optimum para exportacion ONNX: https://huggingface.co/docs/optimum/exporters/onnx/overview
