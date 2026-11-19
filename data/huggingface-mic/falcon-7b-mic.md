# huggingface-mic/falcon-7b-mic

## Resumen

`falcon-7b-mic` es un artefacto de prueba publicado por la organización `huggingface-mic` en Hugging Face. No es un modelo de lenguaje entrenado ni utilizable para inferencia real: es un *fixture* (modelo reducido de forma artificial) derivado de `tiiuae/falcon-7b`, con la misma arquitectura (`FalconForCausalLM`) pero con solo 2 capas ocultas y pesos aleatorios generados con semilla 17. Su función es servir como banco de pruebas reproducible para validar contratos de integración de Transformers con el modelo original de Falcon.

El modelo base, `tiiuae/falcon-7b`, es un transformer causal decoder-only de 7.000 millones de parámetros desarrollado por el Technology Innovation Institute (TII) de Abu Dabi, publicado bajo licencia Apache 2.0. Este fixture conserva los nombres de tensores, los ficheros de procesador (tokenizer, configuración, código de modelado) copiados byte a byte del checkpoint original, y el dtype `bfloat16` por defecto, lo que permite ejercitar pipelines de carga e integración sin descargar los pesos completos.

La relevancia de este repositorio es, por tanto, exclusivamente de ingeniería y testing: permite verificar que una integración de framework (por ejemplo, la carga de un `FalconForCausalLM` con su tokenizer y su `generation_config.json`) funciona correctamente antes de escalar al modelo real. El propio autor lo etiqueta como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (`FalconForCausalLM`), fixture reducido a 2 capas ocultas |
| Parametros totales | 8.835.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el fixture no documenta ventana; el base `tiiuae/falcon-7b` usa 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible (el tokenizer se copia del base, pero no se declaran idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura Falcon del checkpoint `tiiuae/falcon-7b`: un transformer causal decoder-only con atención multi-cabeza y las particularidades del código `modeling_falcon.py` original, que se copia sin modificar. La reducción se realiza mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`, que disminuye el número de capas ocultas a 2 y ajusta la configuración en consecuencia. Los ficheros `configuration_falcon.py`, `generation_config.json`, `modeling_falcon.py`, `special_tokens_map.json`, `tokenizer.json` y `tokenizer_config.json` se copian byte a byte desde `tiiuae/falcon-7b`, de modo que la interfaz de carga es idéntica a la del modelo real.

No hay entrenamiento: los pesos son aleatorios (semilla 17). El autor documenta que superaron una "input-sensitivity gate" según la cual cada perturbación de las entradas del contrato desplazaba los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, produjo 0,138). El fixture se guarda en bfloat16 (el dtype por defecto del base) y se verifica que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture `2dd2b4ea6b48` agrupa todos los checkpoints cuyos ficheros de procesador son idénticos byte a byte y cuya configuración coincide tras el shrink.

## Capacidades

- No es un modelo funcional: no genera texto coherente ni resuelve tareas de razonamiento, código o matemáticas.
- Reproduce la interfaz de `FalconForCausalLM`, incluida la firma de `forward`, la gestión de `attention_mask` y la configuración de generación.
- Permite validar la carga de tokenizer, `special_tokens_map` y `generation_config.json` con los mismos ficheros que el modelo real.
- Sirve para comprobar compatibilidad de integraciones de framework (Transformers y derivados) con la arquitectura Falcon.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento.
- No tiene capacidades multilingües evaluadas.

## Casos de uso

- Pruebas de integración en CI: cargar el fixture en un pipeline de Transformers para verificar que la clase `FalconForCausalLM` se instancia, ejecuta un forward y produce logits finitos sin descargar los 7B parámetros del modelo real.
- Validación de contratos de framework: comparar las expectativas documentadas en `integrations/transformers/expectations` contra el comportamiento observado del fixture para detectar regresiones en la integración.
- Desarrollo de utilidades de tokenización: usar el `tokenizer.json` copiado byte a byte del base para probar pipelines de preprocesado sin depender del checkpoint completo.
- Test de serialización y dtypes: verificar que el guardado y carga en bfloat16, float16 y float32 funciona correctamente en el entorno de destino.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture falcon-7b-mic` y comparar hashes registrados en `build.json`.
- Formación y documentación: disponer de un ejemplo mínimo y ejecutable de la arquitectura Falcon para explicar su estructura de tensores y su configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (8,8M parámetros ≈ 17,7 MB de pesos, más overhead de activaciones y runtime).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requiere `modeling_falcon.py` y `configuration_falcon.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia sería órdenes de magnitud inferior a la del modelo real, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/falcon-7b-mic` | 8,8M | no disponible | Fixture de test | no disponible | Hugging Face |
| `tiiuae/falcon-7b` | 7B | 2048 | Modelo causal funcional | Apache 2.0 | Hugging Face |
| `tiiuae/falcon-7b-instruct` | 7B | 2048 | Modelo causal ajustado a instrucciones | Apache 2.0 | Hugging Face |

La comparación relevante es con el modelo base del que deriva: mismo código de modelado y mismo tokenizer, pero con 2 capas en lugar de 32 y pesos aleatorios en lugar de entrenados. No es sustituible por el modelo real en ninguna tarea de producción.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene valor semántico.
- El autor lo etiqueta explícitamente como `test-artifact`; no debe aparecer en búsquedas de modelos candidatos ni en evaluaciones de calidad.
- La licencia no está declarada en la información disponible; conviene verificar los términos antes de redistribuirlo.
- El repositorio tiene un tamaño de 0,0 GB según los metadatos, lo que sugiere que los pesos pueden no estar completos en el snapshot indexado; el autor indica que algunos ficheros deben regenerarse con `build_fixtures.py`.
- Requiere `trust_remote_code=True` por el uso de código de modelado personalizado (`custom_code`), lo que implica ejecutar código del repositorio.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no se ha entrenado ni evaluado.
- No debe usarse para benchmarks de rendimiento ni para estimar la calidad del modelo Falcon real.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/falcon-7b-mic
- Modelo base: https://huggingface.co/tiiuae/falcon-7b
- Documentación de uso con Transformers: `integrations/transformers/usage.md` (dentro del repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (dentro del repositorio)
- Manifiesto de contrato: `integration.json` (dentro del repositorio)
- Procedencia del fixture: `build.json` (dentro del repositorio)
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/falcon-7b-mic.html
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
