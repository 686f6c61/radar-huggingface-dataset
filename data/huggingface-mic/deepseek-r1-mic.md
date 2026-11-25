# huggingface-mic/DeepSeek-R1-mic

## Resumen

DeepSeek-R1-mic es un artefacto de prueba publicado por el usuario huggingface-mic bajo el identificador `huggingface-mic/DeepSeek-R1-mic`. No es un modelo entrenado ni utilizable para inferencia real: se trata de un fixture (maqueta) que reproduce la arquitectura del modelo DeepSeek-R1 de DeepSeek AI con una configuración drásticamente reducida y pesos aleatorios. Su propósito es servir como banco de pruebas para validar integraciones de frameworks (Transformers) y contratos de ejecución, no para generar texto.

El repositorio contiene 17.819.236 parámetros reales en formato safetensors (aproximadamente 0,1 GB), derivados de recortar el modelo original `deepseek-ai/DeepSeek-R1` mediante la regla genérica de reducción de `sweep.py`, que deja la configuración en 2 capas ocultas. Los pesos se generaron con semilla 17 y se guardaron en bfloat16, el mismo dtype con el que carga el checkpoint original.

La relevancia de esta ficha es fundamentalmente documental y de advertencia: el modelo está etiquetado como `test-artifact` precisamente para excluirlo de búsquedas de modelos candidatos. Cualquier evaluación de capacidades, benchmarks o despliegue en producción debe dirigirse al modelo base DeepSeek-R1, no a este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV3ForCausalLM (transformer causal, configuración reducida a 2 capas ocultas) |
| Parametros totales | 17.819.236 |
| Parametros activos | no disponible (el fixture no documenta configuración MoE activa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible en la model card (el repo incluye un archivo LICENSE copiado del modelo base) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo emplea la clase `DeepseekV3ForCausalLM`, la misma arquitectura que el checkpoint original DeepSeek-R1, pero con la configuración reducida mediante la regla genérica de `sweep.py` hasta 2 capas ocultas. Los archivos de procesamiento (`configuration_deepseek.py`, `modeling_deepseek.py`, `tokenizer.json`, `tokenizer_config.json`, `generation_config.json` y `LICENSE`) se copiaron byte a byte desde `deepseek-ai/DeepSeek-R1`, de modo que los nombres de tensores coinciden exactamente con los del checkpoint real.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `input_ids:roll_batch`, con 0,314 en una de las variantes). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La model card documenta varias claves de fixture (`3bd6b377673a`, `d9610d1fd9b1`, `6cfb6066ddd2`) que cubren checkpoints con archivos de procesador idénticos y configuración coincidente tras el recorte.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no han sido entrenados, por lo que no genera texto coherente ni resuelve tareas.
- Sirve como fixture de integración para validar que un framework carga correctamente la arquitectura `DeepseekV3ForCausalLM`.
- Permite comprobar el contrato de entradas y salidas (input_ids, atención, logits) sin necesidad de descargar el checkpoint completo.
- Verifica compatibilidad de nombres de tensores con el checkpoint real de DeepSeek-R1.
- Valida la estabilidad numérica en float32, bfloat16 y float16 (forward, loss y gradientes).
- No dispone de tool calling, razonamiento, capacidades multilingües ni modos especiales, al carecer de entrenamiento.

## Casos de uso

- Pruebas de integración en Transformers: cargar el fixture para verificar que la clase `DeepseekV3ForCausalLM` se instancia y ejecuta sin errores antes de pasar al checkpoint real.
- CI/CD de librerías de inferencia: usar el fixture de 0,1 GB en pipelines automatizados para detectar regresiones en la carga de arquitecturas DeepSeek sin consumir recursos de GPU a gran escala.
- Validación de contratos de API: comprobar que las entradas y salidas esperadas (formas de tensores, dtypes) coinciden con las del modelo original.
- Desarrollo de tooling de cuantización: probar conversores y cargadores sobre una arquitectura real reducida antes de aplicarlos al modelo completo.
- Verificación de compatibilidad de tokenizador: al copiarse los archivos de tokenización byte a byte, permite validar flujos de preprocesado idénticos a los de DeepSeek-R1.
- Docencia y experimentación: estudiar la estructura interna de un transformer tipo DeepSeek V3 con un coste computacional mínimo, sin necesidad de infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no procede evaluar MMLU, HumanEval, GSM8K ni métricas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (17,8 M de parámetros, repo de 0,1 GB).
- GPU recomendadas: cualquier GPU consumer moderna; no requiere A100 ni H100.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requiere `configuration_deepseek.py` y `modeling_deepseek.py`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un fixture sin entrenamiento, las mediciones no serían representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-mic | 17,8 M | no disponible | Fixture de prueba | no disponible | Hugging Face (test-artifact) |
| deepseek-ai/DeepSeek-R1 | no disponible en la informacion | no disponible | Modelo de razonamiento real | no disponible en la informacion | Hugging Face |
| Otros fixtures de la familia MIC | no disponible | no disponible | Pruebas de integracion | no disponible | Hugging Face (huggingface-mic) |

La comparación relevante es con el modelo base: DeepSeek-R1-mic replica su arquitectura y nombres de tensores, pero sustituye los pesos entrenados por pesos aleatorios y reduce la profundidad a 2 capas. No es una alternativa funcional a DeepSeek-R1.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no producen salidas coherentes.
- Etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe seleccionarse para producción.
- La licencia no está declarada en la model card; el repo incluye un archivo LICENSE copiado del modelo base, por lo que las condiciones de uso comercial deben verificarse en `deepseek-ai/DeepSeek-R1`.
- La configuración reducida (2 capas) no refleja el comportamiento del modelo original; cualquier medición de rendimiento sería engañosa.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no ha sido entrenado.
- Requiere `trust_remote_code=True` para cargar los archivos de modelado personalizados, lo que implica ejecutar código del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/DeepSeek-R1-mic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1
- Documentación sobre el recorte del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/DeepSeek-R1-mic.html
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
