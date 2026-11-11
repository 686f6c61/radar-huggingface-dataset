# huggingface-mic/longformer-base-4096-mic

## Resumen

`longformer-base-4096-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni utilizable en producción: es una version reducida artificialmente del modelo `allenai/longformer-base-4096`, pensada para validar contratos de integración, uso ejecutable y expectativas de framework dentro del proyecto transformers-mic. El autor lo etiqueta explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

La arquitectura subyacente es Longformer (transformer con atención de ventana deslizante y atención global para secuencias largas), pero el fixture mantiene solo 2 capas ocultas y 3.625.881 parámetros totales, frente a los aproximadamente 149 millones del checkpoint original. Los pesos son aleatorios (semilla 17), generados mediante la regla genérica de reducción de `sweep.py`, y los archivos del procesador (tokenizer) se copian byte a byte del modelo base.

Su relevancia es puramente de ingeniería: sirve como caso de prueba reproducible para verificar que un pipeline de transformers carga, ejecuta y valida un modelo Longformer de forma consistente, sin necesidad de descargar el checkpoint completo. No debe confundirse con un modelo de lenguaje funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Longformer (transformer con atención de ventana deslizante), clase `LongformerForMaskedLM` |
| Parametros totales | 3.625.881 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 4096 tokens, pero el fixture no documenta su contexto efectivo) |
| Tipos de cuantizacion | no disponible; pesos guardados en float32, verificados finitos en bfloat16 y float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | allenai/longformer-base-4096 |
| Capas ocultas | 2 (reducido desde el original) |
| Semilla de pesos | 17 (pesos aleatorios) |
| Fixture key | 791b35f7449b |
| Tarea | fill-mask |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Longformer, un transformer diseñado para secuencias largas mediante atención de ventana deslizante combinada con atención global en posiciones seleccionadas. Sin embargo, este repositorio no contiene un modelo entrenado: es un fixture generado con la regla genérica de reducción de `sweep.py`, que disminuye el número de capas ocultas a 2 y conserva los nombres de tensores del checkpoint real. Los pesos son aleatorios (semilla 17) y no han pasado por ningún proceso de entrenamiento, RLHF ni DPO.

El único criterio de validación aplicado es una "input-sensitivity gate": cada perturbación de las entradas del contrato debe mover los logits al menos 0.001 (la más débil, `attention_mask:all_ones`, alcanza 0.0151). Los archivos del tokenizer (`merges.txt`, `tokenizer.json`, `vocab.json`) se copian byte a byte del modelo base `allenai/longformer-base-4096`, de modo que el procesador es idéntico al original. Los pesos se guardan en float32 (el dtype por defecto del modelo base) y se verifica que son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- Carga y ejecución de la tarea `fill-mask` con la clase `LongformerForMaskedLM`.
- Compatibilidad con el tokenizer original de `allenai/longformer-base-4096` (archivos copiados byte a byte).
- Nombres de tensores idénticos al checkpoint real, lo que permite validar rutas de carga y mapeo de pesos.
- Ejecución en float32, bfloat16 y float16 sin valores no finitos en forward, loss ni gradientes.
- Validación de contratos de integración mediante `integration.json` y el directorio `integrations/transformers/expectations`.
- No soporta generación de texto útil, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente: los pesos son aleatorios.
- No dispone de capacidades multilingües documentadas.

## Casos de uso

- Pruebas de integración en CI/CD: el fixture permite verificar que un pipeline de transformers carga un `LongformerForMaskedLM` y ejecuta un forward pass sin descargar el checkpoint completo de 149M de parámetros.
- Validación de contratos de framework: los archivos `integration.json` e `integrations/transformers/expectations` permiten comprobar que una versión de transformers cumple las expectativas de entrada/salida definidas.
- Test de compatibilidad de tokenizer: al copiar los archivos del procesador byte a byte, sirve para validar que el pipeline de tokenización reproduce exactamente el del modelo base.
- Verificación de dtypes: útil para comprobar que rutas de carga en float32, bfloat16 y float16 no producen NaN ni inf en forward, loss ni gradientes.
- Reproducibilidad de fixtures: el archivo `build.json` registra fuentes fijadas, resultados de la gate y hashes de archivos, lo que permite reconstruir el artefacto con `python example/build_fixtures.py --fixture longformer-base-4096-mic`.
- Desarrollo de herramientas de reducción de modelos: sirve como caso de referencia para validar la regla genérica de `sweep.py` sobre arquitecturas Longformer.
- Pruebas de mapeo de pesos: al conservar los nombres de tensores del checkpoint real, permite validar lógicas de carga parcial o de sharding sin usar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, etc.) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,6M de parámetros, ~14,5 MB de pesos) y aún menor en float16 o bfloat16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, etc.) e incluso en CPU.
- Opciones de despliegue: transformers (carga estándar con `LongformerForMaskedLM`), y en principio cualquier runtime que soporte safetensors y la arquitectura Longformer. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas con pesos aleatorios, las mediciones no serían representativas de ningún uso real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Proposito |
|---|---|---|---|---|---|
| huggingface-mic/longformer-base-4096-mic | 3.625.881 | no disponible | fill-mask (fixture) | no disponible | Artefacto de prueba |
| allenai/longformer-base-4096 | ~149M (no confirmado en la informacion) | 4096 | fill-mask / clasificación | no disponible en la informacion | Modelo real entrenado |
| Otros fixtures de transformers-mic | no disponible | no disponible | varios | no disponible | Artefactos de prueba |

La comparación relevante es con su modelo base `allenai/longformer-base-4096`: mismo tokenizer y mismos nombres de tensores, pero con 2 capas en lugar de la configuración completa y pesos aleatorios en lugar de entrenados. No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no han sido entrenados; las salidas de fill-mask no tienen significado semántico.
- Etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe emplearse en producción.
- Sesgos conocidos: no disponibles, ya que no hay entrenamiento que los introduzca ni evaluación que los mida.
- Riesgo de alucinación: no aplica en el sentido habitual, pero cualquier texto generado sería ruido aleatorio.
- Limitaciones de contexto e idioma: no documentadas; el fixture no declara contexto efectivo ni idiomas soportados.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada, por lo que no puede confirmarse el uso comercial.
- El repositorio tiene un tamaño de 0.0 GB según la metadata, lo que refleja que solo contiene los pesos reducidos y archivos auxiliares.
- No debe confundirse con `allenai/longformer-base-4096` ni usarse como sustituto en evaluaciones de calidad.

## Enlaces

- [Hugging Face: huggingface-mic/longformer-base-4096-mic](https://huggingface.co/huggingface-mic/longformer-base-4096-mic)
- [Modelo base: allenai/longformer-base-4096](https://huggingface.co/allenai/longformer-base-4096)
- [Como se redujo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/longformer-base-4096-mic.html)
- [Repositorio transformers-mic (sweep.py)](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Script de construccion build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
- [Manifiesto de contrato integration.json](https://huggingface.co/huggingface-mic/longformer-base-4096-mic/blob/main/integration.json)
- [Uso con transformers](https://huggingface.co/huggingface-mic/longformer-base-4096-mic/blob/main/integrations/transformers/usage.md)
- [Expectativas de transformers](https://huggingface.co/huggingface-mic/longformer-base-4096-mic/tree/main/integrations/transformers/expectations)
- [Procedencia del fixture build.json](https://huggingface.co/huggingface-mic/longformer-base-4096-mic/blob/main/build.json)
