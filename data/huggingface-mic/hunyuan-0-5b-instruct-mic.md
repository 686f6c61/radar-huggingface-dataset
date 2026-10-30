# huggingface-mic/Hunyuan-0.5B-Instruct-mic

## Resumen

Hunyuan-0.5B-Instruct-mic no es un modelo utilizable, sino un *fixture* de prueba ligero publicado por el proyecto `huggingface-mic` como artefacto de test para la biblioteca `transformers`. Reproduce la arquitectura `HunYuanDenseV1ForCausalLM` de `tencent/Hunyuan-0.5B-Instruct` con una configuración reducida a 2 capas ocultas, lo que da como resultado 7.806.464 parámetros (7,8 M) frente a los ~0,5 B del modelo original.

Sus pesos son aleatorios (semilla 17) y no ha recibido entrenamiento alguno: su función es servir de artefacto mínimo para verificar la integración del modelo real en `transformers`, conservando los mismos nombres de tensores, el mismo tokenizador y los archivos de procesamiento copiados byte a byte del repositorio base. Está guardado en bfloat16 y en formato safetensors.

Su relevancia no está en el rendimiento ni en las capacidades de lenguaje (que no tiene), sino en el flujo de trabajo que ejemplifica: generar fixtures reproducibles y baratos para tests de contrato e integración de frameworks, evitando descargas de varios cientos de megabytes en cada ejecución de CI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `HunYuanDenseV1ForCausalLM` (transformer denso, config reducida a `num_hidden_layers: 2`) |
| Parámetros totales | 7.806.464 (7,8 M, dato real de safetensors) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bfloat16 (dtype nativo); verificado como finito en float32, bfloat16 y float16 (forward, loss y gradientes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos del Hub (el repo incluye los archivos `LICENSE`, `LICENSE.txt` y `Notice.txt` copiados del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El fixture conserva la arquitectura `HunYuanDenseV1ForCausalLM` del modelo base de Tencent, pero aplica la regla genérica de reducción definida en `sweep.py` del proyecto `transformers-mic`, que fija `num_hidden_layers` en 2. El resto de la configuración se corresponde con la del checkpoint real tras el proceso de encogimiento, y los nombres de los tensores son idénticos a los del checkpoint original, de modo que cualquier parámetro presente en el modelo real está también presente en el fixture.

No hay entrenamiento: los pesos se inicializan de forma aleatoria con semilla 17 y superan un *gate* de sensibilidad a la entrada que exige que cada perturbación de las entradas del contrato mueva los logits al menos 0,001 (el caso más débil fue `attention_mask:all_ones`, con 0,385). Los archivos de procesamiento (`tokenizer.json`, `tokenizer_config.json`, `special_tokens_map.json`, `generation_config.json`, entre otros) se copian byte a byte desde `tencent/Hunyuan-0.5B-Instruct`. El proceso está automatizado mediante `build_fixtures.py`, y `build.json` registra las fuentes fijadas, los resultados de los *gates* y los *hashes* de los archivos. La clave del fixture es `f8e7738bb8db` y agrupa todos los checkpoints cuyo procesador es byte-idéntico y cuya configuración coincide tras el encogimiento.

## Capacidades

Como artefacto con pesos aleatorios, no posee capacidades de lenguaje. Sus capacidades son técnicas:

- No genera texto coherente ni resuelve tareas de razonamiento, código o matemáticas: sus salidas son ruido estadístico.
- Reproduce la estructura completa de tensores del checkpoint real, con los mismos nombres de parámetros.
- Es cargable y ejecutable con `transformers` (`HunYuanDenseV1ForCausalLM`), con forward, loss y gradientes finitos en float32, bfloat16 y float16.
- Es sensible a las entradas: supera el *gate* de sensibilidad del contrato MIC, lo que lo hace válido para tests de integración.
- Incluye el tokenizador y los archivos de procesamiento byte-idénticos a los del modelo base, lo que permite validar rutas de preprocesamiento.
- No soporta tool calling, agentes, visión ni audio (no es un modelo funcional).
- No hay GGUF ni cuantizaciones alternativas publicadas.

## Casos de uso

- Tests de integración de `transformers` en CI: permite cargar y ejecutar un forward de la arquitectura `HunYuanDenseV1ForCausalLM` en segundos y con ~16 MB de descarga, en lugar de los cientos de MB del modelo real, acelerando los pipelines de integración continua.
- Validación de cambios en la biblioteca: al mantener la misma arquitectura y nombres de tensores que el checkpoint real, sirve para detectar regresiones en el código de modelado de Hunyuan entre versiones de `transformers`.
- Pruebas de manejo de dtypes: al estar verificado como finito en float32, bfloat16 y float16 (forward, loss y gradientes), es adecuado para testear rutas de precisión mixta y autocast sin coste computacional significativo.
- Testing de tokenizador y configuración: los archivos de procesamiento copiados byte a byte permiten validar el preprocesamiento, la plantilla de chat y la lectura de `config.json` (incluida la comprobación de que el código no asume un número fijo de capas, ya que la config está reducida a 2).
- Desarrollo de herramientas de conversión y exportación: los nombres de tensores idénticos al checkpoint real permiten verificar mapeos de pesos en scripts de conversión o exportación a otros formatos.
- Formación y exploración: útil para inspeccionar la estructura interna de un checkpoint de la familia Hunyuan (capas, atenciones, cabeceras) sin descargar el modelo completo.
- Plantilla para generar nuevos fixtures: el repo documenta cómo reconstruir los archivos con `python example/build_fixtures.py --fixture Hunyuan-0.5B-Instruct-mic`, sirviendo de ejemplo del flujo de trabajo de `transformers-mic`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Además, al tratarse de pesos aleatorios sin entrenamiento, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, etc.) carecería de significado. Para datos de rendimiento del modelo real, consultar la ficha de `tencent/Hunyuan-0.5B-Instruct`.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 16 MB en bfloat16 (7,8 M de parámetros × 2 bytes); cualquier GPU moderna lo aloja con holgura y también es ejecutable en CPU.
- GPU recomendadas: no se publica recomendación alguna; no se necesita un acelerador dedicado. Una GPU de consumo cualquiera (incluso integrada) es más que suficiente.
- Cabe en GPU de consumo: sí, en cualquiera, dado el tamaño mínimo del checkpoint (el repo completo figura con 0,0 GB de tamaño).
- Opciones de despliegue: `transformers` es el framework previsto y documentado (ver `integrations/transformers/usage.md` en el repo). No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, y no tiene sentido práctico desplegarlo en producción al ser un artefacto de test.
- Latencia y throughput: no se han publicado cifras; por tamaño (~16 MB), la carga y la ejecución son prácticamente instantáneas en cualquier hardware actual (estimación propia, no dato del autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Pesos | Uso previsto | Licencia |
|---|---|---|---|---|---|
| Hunyuan-0.5B-Instruct-mic (este) | 7,8 M | `HunYuanDenseV1ForCausalLM` (2 capas) | Aleatorios, bf16 | Fixture de test de integración | no disponible |
| tencent/Hunyuan-0.5B-Instruct (modelo base) | ~0,5 B | `HunYuanDenseV1ForCausalLM` | Entrenados | Modelo instructivo de uso general | no disponible en la información aportada |
| Otros fixtures del proyecto transformers-mic | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia clave: el modelo base es un modelo de lenguaje real para chat e instrucciones; este fixture existe únicamente para testear su integración en frameworks y no debe usarse como modelo de lenguaje.

## Limitaciones y advertencias

- Pesos aleatorios: toda salida es ruido sin significado. No usar para generación de texto, razonamiento ni ninguna aplicación de usuario final; el riesgo de «alucinación» no aplica porque no hay comportamiento lingüístico aprendido.
- Está etiquetado explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos; no debe confundirse con el modelo real de 0,5 B.
- La configuración reducida (2 capas ocultas) no representa el comportamiento, la calidad ni el rendimiento del modelo base.
- Sin benchmarks, sin evaluaciones y sin model card de capacidades: cualquier expectativa de rendimiento sería infundada.
- Licencia no especificada en los metadatos del Hub; aunque el repo incluye los archivos de licencia copiados del modelo base, conviene revisarlos antes de cualquier redistribución.
- Artefacto con 0 descargas y 0 likes, creado el 29 de octubre de 2026: puede modificarse o eliminarse sin previo aviso, por lo que no es adecuado como dependencia estable en producción.
- Sin GGUF ni cuantizaciones alternativas: fuera del ecosistema `transformers`/`transformers-mic` no hay soporte documentado.

## Enlaces

- Ficha del modelo: https://huggingface.co/huggingface-mic/Hunyuan-0.5B-Instruct-mic
- Modelo base: https://huggingface.co/tencent/Hunyuan-0.5B-Instruct
- Repositorio del proyecto: https://github.com/huggingface/transformers-mic
  - Script de barrido de configuración: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
  - Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Archivos del contrato en el repo del modelo: `integration.json`, `build.json`, `integrations/transformers/usage.md` y `integrations/transformers/expectations` (https://huggingface.co/huggingface-mic/Hunyuan-0.5B-Instruct-mic/blob/main/integration.json)
- Organización de Hugging Face en GitHub (resultado genérico de la búsqueda web): https://github.com/huggingface

Nota: la búsqueda web solo devolvió resultados genéricos sobre Hugging Face, sin documentación adicional específica sobre este artefacto más allá de su model card.
