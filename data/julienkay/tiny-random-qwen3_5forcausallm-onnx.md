# julienkay/tiny-random-Qwen3_5ForCausalLM-onnx

## Resumen

`julienkay/tiny-random-Qwen3_5ForCausalLM-onnx` es un modelo de prueba (fixture de test) publicado por el desarrollador julienkay. No es un modelo entrenado para uso real: se trata de una implementación de 4 capas de la arquitectura `Qwen3_5ForCausalLM` con pesos aleatorios, exportada a ONNX con opset 17. Su proposito es servir como artefacto de validacion para el paquete de Unity `tools.doji.transformers`, que implementa carga e inferencia de transformers en el motor de Unity.

El modelo reproduce el patron hibrido de atencion de Qwen3.5: las capas 0 a 2 emplean atencion lineal basada en Gated DeltaNet y la capa 3 emplea atencion completa (full attention). Incorpora un nodo personalizado de dominio `ai.doji` llamado `GatedDeltaRule`, cargado por `tools.doji.onnx-model-loader` como capa nativa en `tools.doji.sentis-utils`, mientras que el resto de nodos usan operadores ONNX estandar.

Es relevante unicamente en el contexto de ingenieria de software: permite verificar la correccion de la exportacion ONNX, la gestion de estados recurrentes (convolucion causal y regla delta) y la integracion con el runtime Sentis de Unity. No debe usarse para generacion de texto, ya que produce salida aleatoria por construccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal Gated DeltaNet (capas 0-2) y atencion completa (capa 3), segun patron Qwen3.5 |
| Parametros totales | no disponible (modelo "tiny" de 4 capas, tamano de repo 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX, presumiblemente FP32; no se documenta) |
| Idiomas soportados | no disponible (tokenizer de Qwen/Qwen3.5-0.8B, sin evaluacion linguistica) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17) con nodo personalizado `ai.doji::GatedDeltaRule` |

## Arquitectura y entrenamiento

El modelo es una instancia reducida de la arquitectura `Qwen3_5ForCausalLM` con 4 capas: tres capas de atencion lineal Gated DeltaNet y una capa de atencion completa. La regla delta con compuerta se encapsula en un unico nodo de dominio personalizado `ai.doji:GatedDeltaRule`, con entradas `query`, `key`, `value`, `g`, `beta` e `initialState`, salidas `output` y `finalState`, y un atributo float `scale`. El resto de operaciones son operadores ONNX estandar. La exportacion se genero con el script `tools/causal_lm/make_models.py tiny --arch qwen3_5` del repositorio del paquete.

No hubo entrenamiento: los pesos son aleatorios por diseno, con el objetivo de que el modelo genere texto sin sentido de forma determinista y reproducible. El tokenizer se toma de `Qwen/Qwen3.5-0.8B` (revision `2fc06364715b967f1860aea9cf38778875588b17`, licencia Apache 2.0). El modelo ejecuta tanto el prompt como cada token nuevo en un unico grafo ONNX, gestionando explicitamente el estado: `past_key_values.{i}.key/value` para las capas de atencion completa, y `past_conv.{i}` (estado de la convolucion causal) y `past_recurrent.{i}` (estado de la regla delta) para las capas lineales. Las salidas correspondientes son `present.{i}.key/value`, `present_conv.{i}` y `present_recurrent.{i}`, junto con `logits`.

## Capacidades

- Generacion de texto aleatorio: el modelo emite tokens sin coherencia semantica, util solo para validar el flujo de inferencia.
- Ejecucion de inferencia autoregresiva con gestion de estado explicita (KV cache y estados recurrentes) en un unico grafo ONNX.
- Soporte de atencion hibrida: mezcla de atencion lineal Gated DeltaNet y atencion completa en el mismo grafo.
- Integracion con el runtime de Unity mediante `tools.doji.onnx-model-loader` y `tools.doji.sentis-utils`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no evaluadas; el tokenizer es el de Qwen3.5-0.8B, pero el modelo no produce lenguaje real.

## Casos de uso

- Test de integracion del paquete `tools.doji.transformers`: se usa como fixture para comprobar que la carga de un modelo ONNX con atencion hibrida funciona en Unity sin errores.
- Validacion de la exportacion ONNX: permite verificar que el nodo personalizado `ai.doji:GatedDeltaRule` se serializa, carga y ejecuta correctamente con opset 17.
- Pruebas de gestion de estado recurrente: sirve para comprobar que `past_conv.{i}` y `past_recurrent.{i}` se propagan correctamente entre pasos de decodificacion.
- Desarrollo de kernels personalizados en Sentis: al aislar la regla delta en un nodo de dominio propio, facilita la implementacion y depuracion de la capa `GatedDeltaRule` en `tools.doji.sentis-utils`.
- Pruebas de regresion en CI del repositorio de Unity: al ser un modelo diminuto (repo de 0,1 GB), puede ejecutarse en pipelines automatizados sin requisitos de GPU.
- Verificacion de compatibilidad de tokenizer: valida la integracion del tokenizer de Qwen3.5-0.8B con el pipeline de inferencia.
- Benchmarking de latencia del runtime: permite medir el coste de un grafo hibrido de 4 capas en Sentis sin la variabilidad de pesos entrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo genera texto aleatorio, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; el repositorio completo ocupa 0,1 GB y el modelo tiene 4 capas "tiny".
- GPU recomendadas: cualquier GPU con soporte de Sentis o de un runtime ONNX; no requiere aceleradores de datacenter.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: ONNX Runtime, Unity Sentis (via `tools.doji.onnx-model-loader` y `tools.doji.sentis-utils`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el nodo personalizado `ai.doji:GatedDeltaRule` requiere un runtime que lo implemente.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Formato |
|---|---|---|---|---|---|
| julienkay/tiny-random-Qwen3_5ForCausalLM-onnx | tiny (4 capas) | no disponible | Fixture de test para Unity | Apache 2.0 | ONNX (opset 17) |
| Qwen/Qwen3.5-0.8B | 0,8B | no disponible | Modelo real de generacion de texto | Apache 2.0 | safetensors |
| Otros modelos "tiny-random" de Hugging Face | variable (tipicamente <10M) | no disponible | Pruebas de pipeline | variable | safetensors / ONNX |

La comparativa con modelos de produccion no es significativa: este artefacto no compite en calidad de generacion, sino que cubre una necesidad de testing de la cadena de herramientas de Unity. Frente a otros modelos "tiny-random", su diferencia es la arquitectura hibrida Qwen3.5 y el nodo personalizado `ai.doji`.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido entrenado y genera texto sin sentido; no debe usarse en produccion ni para evaluaciones de calidad.
- Nodo personalizado: el grafo contiene `ai.doji:GatedDeltaRule`, por lo que no es portable a runtimes ONNX estandar sin una implementacion de ese operador.
- Sin datos de contexto, cuantizacion ni idiomas: la model card no documenta estos parametros, por lo que no pueden asumirse valores de la familia Qwen3.5 completa.
- Sin evaluacion de sesgos ni de alucinacion: al no estar entrenado, no aplican metricas de sesgo, pero tampoco existe ninguna garantia de comportamiento.
- Licencia Apache 2.0: permite uso comercial del artefacto, aunque su utilidad comercial es nula por su naturaleza de test.
- Tokenizer heredado: cualquier problema de licencia o comportamiento del tokenizer de Qwen3.5-0.8B se hereda en la practica.
- Sin mantenimiento documentado: creado y actualizado el 2026-11-25, con 0 descargas y 0 likes; no hay garantia de soporte.

## Enlaces

- Hugging Face: https://huggingface.co/julienkay/tiny-random-Qwen3_5ForCausalLM-onnx
- Repositorio `tools.doji.transformers`: https://github.com/julienkay/tools.doji.transformers
- Repositorio `tools.doji.onnx-model-loader`: https://github.com/julienkay/tools.doji.onnx-model-loader
- Repositorio `tools.doji.sentis-utils`: https://github.com/julienkay/tools.doji.sentis-utils
- Tokenizer de referencia: https://huggingface.co/Qwen/Qwen3.5-0.8B
