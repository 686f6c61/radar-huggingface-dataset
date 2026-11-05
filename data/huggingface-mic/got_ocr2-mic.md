# huggingface-mic/got_ocr2-mic

## Resumen

`got_ocr2-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic`, no un modelo utilizable. Se trata de un *fixture* reducido de 13.027.200 parametros derivado del modelo real `stepfun-ai/GOT-OCR-2.0-hf`, un sistema de OCR y comprension documental multimodal desarrollado por StepFun. El repositorio incluye pesos "slim", ejemplos de uso ejecutables y las expectativas de framework necesarias para validar la integracion de GOT-OCR2 en Transformers.

El objetivo de este tipo de artefacto es servir como banco de pruebas ligero para la infraestructura de cobertura de modelos (MIC): permite verificar que la clase `GotOcr2ForConditionalGeneration` carga, ejecuta forward, calcula perdida y propaga gradientes de forma finita en float32, bfloat16 y float16, sin necesidad de descargar los pesos completos del modelo original. El fixture conserva los mismos nombres de tensor que el checkpoint real y copia byte a byte los ficheros de procesador (`tokenizer.json`, `preprocessor_config.json`, `generation_config.json`, etc.).

Por su naturaleza, no debe emplearse para inferencia real, produccion ni evaluacion de calidad: sus pesos estan sobreajustados artificialmente al paso de entrenamiento del contrato (250 pasos) y el propio autor lo etiqueta como `test-artifact` para excluirlo de las busquedas de modelos candidatos. Cualquier uso practico de OCR debe dirigirse al modelo base `stepfun-ai/GOT-OCR-2.0-hf`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GotOcr2ForConditionalGeneration` (vision encoder + decoder de texto, config reducida) |
| Parametros totales | 13.027.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura de GOT-OCR2: un encoder visual seguido de un decoder autorregresivo de texto bajo la clase `GotOcr2ForConditionalGeneration` de Transformers. En este fixture, la config se ha reducido mediante la regla generica de `sweep.py`: `vision num_hidden_layers = 2` y `text num_hidden_layers = 2`, lo que colapsa el modelo hasta los 13,0 M de parametros. Los ficheros de procesador se copian sin modificacion desde `stepfun-ai/GOT-OCR-2.0-hf`, de modo que el pipeline de preprocesado y tokenizacion es identico al del modelo real.

No hay entrenamiento en el sentido habitual: los pesos se sobreajustan al paso de entrenamiento del contrato (250 pasos) para superar la puerta de sensibilidad a la entrada. Los pesos aleatorios fallaban esa comprobacion (`pixel_values:roll_batch` movia los logits solo 0, con umbral 0,001). El fixture se guarda en bfloat16, el dtype por defecto del checkpoint original, y se verifica que forward, perdida y gradientes son finitos en float32, bfloat16 y float16. La clave de fixture es `6141fa8be862` y cubre todo checkpoint cuyos ficheros de procesador sean identicos byte a byte y cuya config coincida tras el shrink.

## Capacidades

- Carga y ejecucion del grafo `GotOcr2ForConditionalGeneration` con los mismos nombres de tensor que el checkpoint real.
- Forward pass, calculo de perdida y retropropagacion de gradientes estables en float32, bfloat16 y float16.
- Validacion de integracion con Transformers (uso y expectativas documentadas en `integrations/transformers/`).
- Comprobacion de sensibilidad a la entrada mediante la puerta `pixel_values:roll_batch`.
- Reutilizacion del pipeline de preprocesado y tokenizacion de GOT-OCR-2.0 (ficheros copiados byte a byte).
- No soporta OCR real, tool calling, agentes, razonamiento multilingue ni ninguna capacidad funcional de GOT-OCR2, al estar los pesos sobreajustados a un contrato de prueba.

## Casos de uso

- Test de integracion en CI de Transformers: cargar el fixture y verificar que `GotOcr2ForConditionalGeneration` instancia, ejecuta y devuelve tensores finitos sin descargar los pesos completos de GOT-OCR-2.0.
- Validacion de cambios en la clase del modelo: comprobar que una modificacion en el codigo de `GotOcr2ForConditionalGeneration` no rompe el forward ni los gradientes usando un checkpoint de 13 M de parametros.
- Pruebas de dtype: ejecutar el mismo grafo en float32, bfloat16 y float16 para detectar regresiones de precision o NaNs en entornos sin GPU de gran capacidad.
- Verificacion de contratos de cobertura (MIC): comprobar que el fixture cubre todos los checkpoints con procesador identico y config equivalente tras el shrink, segun la clave `6141fa8be862`.
- Desarrollo de tooling de fixtures: servir como referencia reproducible para `build_fixtures.py` y `sweep.py`, permitiendo regenerar el artefacto con `python example/build_fixtures.py --fixture mic-got_ocr2-slim`.
- Pruebas de pipeline de preprocesado: validar que los ficheros de tokenizer y preprocessor copiados de GOT-OCR-2.0 producen las mismas entradas que el modelo original antes de pasar al checkpoint completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un artefacto de prueba sobreajustado, sus salidas no son representativas del rendimiento de GOT-OCR2.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 (13 M de parametros, ~26 MB de pesos), mas overhead de activaciones y del encoder visual reducido.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer y en entornos CPU-only.
- Opciones de despliegue: carga directa con Transformers (`AutoModelForCausalLM`/clase especifica `GotOcr2ForConditionalGeneration`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas de vision y 2 de texto, la latencia es minima pero irrelevante para uso real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/got_ocr2-mic` | 13,0 M | no disponible | Fixture de test para integracion de GOT-OCR2 | no disponible | HuggingFace |
| `stepfun-ai/GOT-OCR-2.0-hf` | no disponible en la informacion | no disponible | OCR y comprension documental multimodal | no disponible | HuggingFace |
| Otros fixtures `huggingface-mic` | variable | no disponible | Artefactos de test por modelo | no disponible | HuggingFace |

La comparacion relevante es exclusivamente con el modelo base: el fixture replica su arquitectura y procesador, pero no su capacidad. Frente a otros sistemas OCR (PaddleOCR, Tesseract, Donut), la comparacion no procede porque este artefacto no realiza OCR.

## Limitaciones y advertencias

- No es un modelo utilizable: el autor lo etiqueta explicitamente como `test-artifact` y advierte que no debe usarse para inferencia real.
- Pesos sobreajustados al contrato de entrenamiento (250 pasos); las salidas no tienen significado semantico.
- Config reducida (2 capas de vision, 2 de texto): no reproduce el comportamiento del checkpoint completo.
- Licencia no especificada en la informacion disponible; verificar los terminos del modelo base `stepfun-ai/GOT-OCR-2.0-hf` antes de cualquier uso derivado.
- Idiomas y contexto no documentados; no asumir capacidades multilingues.
- Riesgo de confusion: el nombre y la estructura pueden llevar a confundirlo con GOT-OCR2; comprobar siempre la etiqueta `test-artifact` antes de integrarlo.
- No apto para produccion, evaluacion de calidad ni benchmarks comparativos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/got_ocr2-mic
- Modelo base: https://huggingface.co/stepfun-ai/GOT-OCR-2.0-hf
- Explicacion del shrink del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/got_ocr2-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de shrink (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
