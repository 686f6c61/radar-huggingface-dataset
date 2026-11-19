# huggingface-mic/vaultgemma-vllm-mic

## Resumen

`huggingface-mic/vaultgemma-vllm-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic`, no un modelo entrenado ni utilizable en producción. Se construye a partir de `google/vaultgemma-1b` mediante una reducción mecánica de su configuración: mantiene la arquitectura `VaultGemmaForCausalLM` y los nombres de tensores del checkpoint original, pero reduce el número de capas ocultas a 2, lo que deja un total de 16.466.240 parámetros. Los pesos son aleatorios (semilla 17) y los ficheros de procesador (tokenizer, `generation_config.json`, `special_tokens_map.json`, `tokenizer_config.json`) se copian byte a byte del modelo base.

El propósito declarado es servir como fixture ejecutable para validar contratos de integración con frameworks (en este caso, una integración compatible con vLLM), verificando que las expectativas de entrada/salida del framework se cumplen sin necesidad de descargar el checkpoint completo de 1B. Por eso está etiquetado como `test-artifact` y se excluye deliberadamente de las búsquedas de modelos candidatos.

Para desarrolladores e investigadores, este repositorio es relevante únicamente como pieza de infraestructura de testing: permite comprobar pipelines de carga, tokenización y forward pass con un coste de almacenamiento y cómputo mínimo. No debe evaluarse como modelo de lenguaje ni emplearse para inferencia real, ya que sus pesos no codifican ningún conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VaultGemmaForCausalLM (transformer causal, config reducida a num_hidden_layers=2) |
| Parametros totales | 16.466.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase `VaultGemmaForCausalLM` del modelo base `google/vaultgemma-1b`, pero con una configuración reducida mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`: `num_hidden_layers` se fija en 2. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que cualquier código que espere la estructura de `google/vaultgemma-1b` puede cargarlo sin cambios en la lógica de mapeo.

No hubo entrenamiento. Los pesos se inicializan aleatoriamente con semilla 17 y se validan con una "input-sensitivity gate": cada perturbación de las entradas del contrato debe mover los logits al menos 0.001 (la perturbación más débil, `attention_mask:all_ones`, produjo un desplazamiento de 0.386). Los tensores se guardan en bfloat16, el dtype por defecto de carga del modelo base, y se verifica que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16. Los ficheros de procesador se copian byte a byte desde `google/vaultgemma-1b`.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no codifican conocimiento lingüístico.
- Sirve como fixture de integración para validar la carga de `VaultGemmaForCausalLM` en frameworks compatibles con vLLM.
- Permite verificar el contrato de tokenización usando el `tokenizer.model` original copiado del modelo base.
- Valida la sensibilidad de las entradas del contrato (perturbaciones de logits) mediante la gate documentada en `build.json`.
- Comprueba la estabilidad numérica del forward, loss y gradientes en float32, bfloat16 y float16.
- No soporta tool calling, agentes, visión, audio ni modo thinking de forma real; cualquier comportamiento de este tipo sería ruido aleatorio.

## Casos de uso

- Test de integración de vLLM: cargar el fixture en un pipeline de vLLM para comprobar que el contrato de entrada/salida (nombres de tensores, tokenizer, `generation_config.json`) se cumple sin descargar el checkpoint de 1B.
- CI/CD de la librería `transformers-mic`: ejecutar la suite de tests de integración con un artefacto de 16,5M de parámetros en lugar del modelo completo, reduciendo tiempo y ancho de banda.
- Validación de mapeo de tensores: verificar que el código de carga de `VaultGemmaForCausalLM` resuelve correctamente los nombres de parámetros del checkpoint real.
- Pruebas de dtype: comprobar que el pipeline maneja bfloat16, float16 y float32 sin NaN ni inf en forward, loss y gradientes.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture vaultgemma-vllm-mic` y comparar hashes registrados en `build.json`.
- Desarrollo de herramientas de inspección de modelos: usar el fixture para probar visores de arquitectura, contadores de parámetros o analizadores de config sin coste de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, etc.) sería irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (16,5M de parámetros, ~33 MB de pesos) más el overhead del runtime.
- GPU recomendadas: cualquier GPU con soporte bfloat16; también es viable en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: vLLM (objetivo declarado del contrato), Transformers, y presumiblemente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia sería mínima pero sin valor representativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/vaultgemma-vllm-mic | 16,5M | no disponible | Fixture de test | no disponible | Hugging Face |
| google/vaultgemma-1b | ~1B (no confirmado) | no disponible | Modelo base real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Fixtures de test | no disponible | Hugging Face |

La comparación con modelos de lenguaje reales no es significativa: el fixture no compite en la misma categoría. Frente a `google/vaultgemma-1b`, la diferencia es de dos órdenes de magnitud en parámetros y una reducción de 2 capas frente a la configuración completa, con pesos aleatorios en lugar de entrenados.

## Limitaciones y advertencias

- Los pesos son aleatorios (semilla 17): el modelo no genera texto coherente ni codifica conocimiento.
- Está etiquetado explícitamente como `test-artifact` y excluido de búsquedas de modelos candidatos; no debe usarse en producción.
- La licencia no está declarada en la información disponible; verificar los términos del modelo base `google/vaultgemma-1b` antes de cualquier uso derivado.
- Los idiomas soportados no están documentados; el tokenizer se hereda del modelo base, pero el comportamiento lingüístico no es evaluable.
- La longitud de contexto no está disponible en la información proporcionada.
- Riesgo de confusión: el nombre incluye "vaultgemma" y puede llevar a error si se interpreta como un modelo funcional; revisar siempre la etiqueta `test-artifact`.
- No apto para evaluación de calidad, benchmarks ni comparativas de rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/vaultgemma-vllm-mic
- Modelo base: https://huggingface.co/google/vaultgemma-1b
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/vaultgemma-vllm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/vaultgemma-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/vaultgemma-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/vaultgemma-vllm-mic/blob/main/build.json
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/vaultgemma-vllm-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
