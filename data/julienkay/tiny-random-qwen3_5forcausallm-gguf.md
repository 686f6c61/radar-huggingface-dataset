# julienkay/tiny-random-Qwen3_5ForCausalLM-GGUF

## Resumen

`tiny-random-Qwen3_5ForCausalLM-GGUF` es un modelo de pruebas publicado por el desarrollador julienkay, no un modelo de produccion. Consiste en una version reducida (4 capas) de la arquitectura `Qwen3_5ForCausalLM` con pesos inicializados de forma aleatoria, convertida a formato GGUF mediante `convert_hf_to_gguf.py` de llama.cpp. Su proposito es servir como fixture de tests para el paquete de Unity `tools.doji.transformers`, que implementa inferencia de transformers en C#.

El modelo tiene 7.996.656 parametros totales (aproximadamente 8 millones) y un repositorio de 0,1 GB. La arquitectura combina atencion lineal Gated DeltaNet en las capas 0 a 2 y atencion completa en la capa 3, con 2 cabezas de clave y 4 cabezas de valor en las capas de atencion lineal. Utiliza el tokenizador de `Qwen/Qwen3.5-0.8B` bajo licencia Apache 2.0.

Es relevante unicamente como referencia tecnica para validar implementaciones de inferencia GGUF en entornos Unity/C#, no para generacion de texto real: el propio autor indica que "genera texto aleatorio". Cualquier uso en produccion, evaluacion de capacidades o benchmarks carece de sentido con este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: Gated DeltaNet (atencion lineal) en capas 0-2, atencion completa en capa 3; arquitectura GGUF `qwen35` |
| Parametros totales | 7.996.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, BF16, Q8_0 |
| Idiomas soportados | no disponible (tokenizador de Qwen3.5-0.8B) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`model-f32.gguf`, `model-bf16.gguf`, `model-q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura `Qwen3_5ForCausalLM` en version reducida: 4 capas, de las cuales las tres primeras emplean atencion lineal Gated DeltaNet (2 cabezas de clave, 4 cabezas de valor) y la cuarta emplea atencion completa. Esta mezcla es caracteristica de las arquitecturas hibridas orientadas a reducir el coste computacional del contexto largo.

No ha habido entrenamiento: los pesos son aleatorios, generados por `tools/causal_lm/make_models.py tiny --arch qwen3_5` del repositorio del paquete. La conversion a GGUF se realizo con `convert_hf_to_gguf.py` de llama.cpp (commit `244640b7f26e2a7301b27a24edc4f7feaf97d52f`) usando `--outtype f32`, `bf16` o `q8_0` y `--no-mtp`. El tokenizador se toma de Qwen3.5-0.8B. Los logits y tokens de referencia para los tests se generan con `tools/causal_lm/make_models.py gguf-references`.

## Capacidades

- Generacion de texto aleatorio: el modelo no ha sido entrenado, por lo que su salida no es coherente ni util.
- Validacion de implementaciones de inferencia: sirve para comprobar la correcta carga de GGUF, la ejecucion de atencion lineal Gated DeltaNet y atencion completa, y la coincidencia de logits con las referencias.
- Pruebas de integracion en Unity: el paquete `tools.doji.transformers` lo usa como fixture para verificar `AutoModelForCausalLM.FromGguf`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; hereda el tokenizador de Qwen3.5-0.8B pero sin pesos entrenados.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Test unitario de carga de GGUF en C#/Unity: cargar `model-q8_0.gguf` con `AutoModelForCausalLM.FromGguf` y verificar que la inicializacion de tensores y metadatos coincide con lo esperado.
- Validacion de kernels de atencion lineal: comparar la salida de las capas Gated DeltaNet del modelo con los logits de referencia generados por `gguf-references`, detectando regresiones en la implementacion de atencion lineal.
- Verificacion de cuantizacion: ejecutar las variantes F32, BF16 y Q8_0 y comprobar que las diferencias numericas entre ellas se mantienen dentro de los margenes tolerados por los tests.
- Integracion continua del paquete `tools.doji.transformers`: usar el modelo como fixture ligero (0,1 GB) en pipelines de CI para evitar descargar modelos grandes en cada ejecucion.
- Pruebas de compatibilidad de tokenizador: validar que el tokenizador de Qwen3.5-0.8B se integra correctamente en el pipeline de inferencia del paquete Unity.
- Referencia para portar arquitecturas hibridas: servir de ejemplo minimo de la combinacion Gated DeltaNet + atencion completa en formato GGUF para quien implemente dicha arquitectura en otros runtimes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) seria meaningless y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones (el repositorio completo ocupa 0,1 GB con los tres ficheros; el mayor es `model-f32.gguf`).
- GPU recomendadas: cualquier GPU con soporte CUDA, ROCm o Metal; tambien es viable en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, integradas) e incluso en dispositivos moviles.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y el paquete Unity `tools.doji.transformers` via `AutoModelForCausalLM.FromGguf`. No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; con 8 millones de parametros la inferencia es practicamente instantanea en cualquier hardware moderno, pero no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en la misma categoria: se trata de un artefacto de test con pesos aleatorios, no de un modelo funcional. Las alternativas reales de la familia Qwen3.5 (por ejemplo, `Qwen/Qwen3.5-0.8B`, cuyo tokenizador se reutiliza aqui) tienen otra finalidad y no son comparables en terminos de capacidades.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce texto coherente; cualquier salida es ruido estadistico.
- No apto para produccion: no debe desplegarse en aplicaciones reales de generacion de texto, atencion al cliente, codigo o similar.
- Sin datos de entrenamiento: no hay corpus, RLHF, DPO ni ajuste de ningun tipo.
- Longitud de contexto no documentada: no se especifica la ventana maxima soportada.
- Idiomas no documentados: aunque usa el tokenizador de Qwen3.5-0.8B, no hay garantia de comportamiento multilingue.
- Licencia Apache 2.0: permite uso comercial del artefacto, pero al no ser un modelo funcional su valor comercial es nulo.
- Sesgos y alucinacion: no aplica en el sentido habitual, ya que no hay conocimiento aprendido; la salida es aleatoria por construccion.
- Dependencia de versiones: los ficheros se generaron con un commit concreto de llama.cpp; cambios en el formato GGUF o en la implementacion de `qwen35` pueden romper la compatibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/julienkay/tiny-random-Qwen3_5ForCausalLM-GGUF
- Modelo ONNX de origen: https://huggingface.co/julienkay/tiny-random-Qwen3_5ForCausalLM-onnx
- Repositorio del paquete Unity: https://github.com/julienkay/tools.doji.transformers
- Tokenizador de referencia: https://huggingface.co/Qwen/Qwen3.5-0.8B
- llama.cpp: https://github.com/ggml-org/llama.cpp
