# huggingface-mic-temp/Qwen3-0.6B-vllm-mic

## Resumen

Qwen3-0.6B-vllm-mic es un artefacto de prueba publicado por la organizacion huggingface-mic-temp. No se trata de un modelo entrenado ni utilizable, sino de un fixture reducido derivado de Qwen/Qwen3-0.6B, el modelo de lenguaje causal de 0,6 mil millones de parametros de la familia Qwen3 desarrollada por Alibaba Qwen. El repositorio contiene pesos reducidos, ejemplos de uso y un manifiesto de contrato de integracion para validar frameworks de inferencia.

El fixture conserva la arquitectura Qwen3ForCausalLM pero reduce la configuracion a 2 capas ocultas, lo que da como resultado 9.798.080 parametros totales con pesos aleatorios (semilla 17). Los ficheros de procesador (tokenizer, merges, vocab, generation config y licencia) se copian byte a byte del checkpoint original. El objetivo declarado es servir como fixture de pruebas para integraciones con vLLM y Transformers, no como modelo de produccion.

Su relevancia es limitada fuera del ambito de testing de infraestructura: permite verificar que un pipeline carga, ejecuta y produce logits sensibles a las entradas sin necesidad de descargar los pesos completos del modelo real. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3ForCausalLM) |
| Parametros totales | 9.798.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (config reducida a 2 capas; contexto efectivo no documentado) |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (se copia el fichero LICENSE de Qwen/Qwen3-0.6B, pero no se declara en metadatos) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3, con la clase `Qwen3ForCausalLM`. La configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio transformers-mic, fijando `num_hidden_layers` en 2. Los nombres de tensores coinciden con los del checkpoint real, lo que permite intercambiarlos en pruebas de carga sin modificar codigo.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y superaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, con 0,517). Los tensores son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture se valida con `build_fixtures.py` y los hashes y resultados de la puerta se registran en `build.json`.

## Capacidades

- Carga y ejecucion en frameworks de inferencia (Transformers, vLLM) como fixture de pruebas.
- Verificacion de contratos de integracion: manifiesto `integration.json` con expectativas de entrada y salida.
- Comprobacion de sensibilidad de logits ante perturbaciones de entrada.
- Ejecucion forward, calculo de loss y retropropagacion de gradientes en float32, bfloat16 y float16.
- Compatibilidad de nombres de tensores con el checkpoint original Qwen/Qwen3-0.6B.
- No soporta generacion de texto coherente, razonamiento, codigo, matematicas, vision, tool calling ni capacidades multilingues reales, al carecer de entrenamiento.

## Casos de uso

- Pruebas de integracion con vLLM: el fixture permite validar la carga del modelo, el parseo de configuracion y la ejecucion de un forward sin descargar los pesos completos de Qwen3-0.6B, reduciendo tiempo y ancho de banda en CI.
- Validacion de pipelines de Transformers: comprobar que `AutoModelForCausalLM` y `AutoTokenizer` resuelven correctamente la arquitectura y el tokenizer copiado byte a byte del modelo original.
- Test de regresion de tokenizers: al reutilizar `tokenizer.json`, `merges.txt` y `vocab.json` identicos, sirve para detectar cambios en la tokenizacion entre versiones de librerias.
- Verificacion de contratos de framework: el directorio `integrations/transformers/expectations` define salidas esperadas que pueden usarse como aserciones en tests automatizados.
- Pruebas de dtypes y estabilidad numerica: al ser finito en float32, bfloat16 y float16, permite validar rutas de mixed precision y comprobar ausencia de NaN/Inf en kernels.
- Desarrollo de herramientas de auditoria de modelos: el manifiesto `integration.json` y `build.json` documentan procedencia, hashes y resultados de la puerta de sensibilidad, utiles para reproducir builds de fixtures.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios y no tiene rendimiento funcional que medir.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en bfloat16 (9,8 M parametros × 2 bytes ≈ 20 MB de pesos, mas overhead de activaciones y runtime).
- GPU recomendadas: cualquier GPU con soporte de bfloat16 o float16; el fixture cabe en GPUs consumer muy basicas e incluso en CPU.
- Cabe en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: Transformers, vLLM (el nombre del repositorio indica compatibilidad con vLLM), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta esa ruta.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia sera muy baja pero no representa el rendimiento del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Proposito |
|---|---|---|---|---|---|
| Qwen3-0.6B-vllm-mic (este) | 9,8 M | no disponible | No (pesos aleatorios) | no disponible | Fixture de pruebas |
| Qwen/Qwen3-0.6B | 0,6 B | no disponible en la informacion | Si | no disponible en la informacion | Modelo de lenguaje real |
| Otros fixtures de transformers-mic | variable | no disponible | No | no disponible | Pruebas de integracion |

La comparativa con modelos de la misma categoria (0,6 B) no es significativa porque este artefacto no es un modelo funcional. Frente a Qwen/Qwen3-0.6B, comparte arquitectura y tokenizer pero carece de entrenamiento y tiene 60 veces menos parametros.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no producen texto coherente.
- Etiquetado como `test-artifact`; no debe usarse en produccion ni como base para fine-tuning.
- La licencia no esta declarada en los metadatos del repositorio; se copia el fichero LICENSE de Qwen/Qwen3-0.6B, por lo que las condiciones reales dependen de ese fichero.
- La configuracion reducida a 2 capas implica que el comportamiento numerico no reproduce el del modelo original.
- No hay informacion sobre sesgos, alucinacion o limitaciones idiomaticas porque no ha sido entrenado.
- Cero descargas y cero likes en el momento de la consulta; sin comunidad ni soporte.
- El repositorio tiene tamano 0.0 GB reportado, lo que puede indicar metadatos incompletos o pesos almacenados de forma no convencional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/Qwen3-0.6B-vllm-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3-0.6B-vllm-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
