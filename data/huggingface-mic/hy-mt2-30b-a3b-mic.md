# huggingface-mic/Hy-MT2-30B-A3B-mic

## Resumen

Hy-MT2-30B-A3B-mic es un artefacto de prueba (fixture) publicado en Hugging Face por el usuario `huggingface-mic`, derivado del modelo `tencent/Hy-MT2-30B-A3B`. No se trata de un modelo entrenado ni utilizable en producción: es una version reducida artificialmente del checkpoint original, creada para validar contratos de integración con frameworks (principalmente Transformers) y verificar la compatibilidad de pesos, tokenizador y plantillas de chat.

El repositorio contiene 15.547.012 parámetros (frente a los aproximadamente 30.000 millones del modelo base, de ahí el sufijo "30B-A3B" en el nombre original), con solo 2 capas ocultas tras aplicar la regla genérica de reducción del proyecto `transformers-mic`. Los pesos son aleatorios (semilla 17) y han superado únicamente una puerta de sensibilidad a la entrada, no un entrenamiento real.

Su relevancia es exclusivamente técnica y de infraestructura: sirve para que mantenedores de frameworks y pipelines de CI verifiquen que la arquitectura `HYV3ForCausalLM`, los nombres de tensores y los ficheros de procesador del modelo real se cargan correctamente, sin necesidad de descargar ni ejecutar el checkpoint completo. La model card lo etiqueta explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HYV3ForCausalLM (transformer causal, config reducida a 2 capas ocultas) |
| Parametros totales | 15.547.012 |
| Parametros activos | no disponible (el modelo base se denomina A3B, pero no se detalla la configuracion MoE en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; se verifica finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es una instancia reducida de la arquitectura `HYV3ForCausalLM`, la misma familia que el checkpoint `tencent/Hy-MT2-30B-A3B`. La reduccion se aplica mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, que en este caso fija `num_hidden_layers` a 2. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que cualquier discrepancia en la carga de pesos del modelo original se reproduce en el fixture.

No ha habido entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una "puerta de sensibilidad a la entrada": cada perturbacion de las entradas del contrato debe mover los logits al menos 0.001. La perturbacion mas debil registrada fue `attention_mask:all_ones` con 0.0414, por lo que se considero que no era necesario entrenar. Los ficheros de procesador (`.ms_upload_cache`, `LICENSE.txt`, `README_CN.md`, `chat_template.jinja`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde `tencent/Hy-MT2-30B-A3B`. El fixture se genera con `build_fixtures.py` y la clave de fixture es `87cf901e853f`.

## Capacidades

- No es un modelo funcional: no genera texto coherente ni razona, ya que sus pesos son aleatorios.
- Sirve como fixture de integracion para validar la carga de `HYV3ForCausalLM` en Transformers.
- Verifica la compatibilidad byte a byte de tokenizador, plantilla de chat y tokens especiales con el modelo base.
- Comprueba la estabilidad numerica del forward, la loss y los gradientes en float32, bfloat16 y float16.
- Permite tests de CI sin descargar el checkpoint de 30B.
- No dispone de tool calling, agentes, vision, audio ni modo thinking utilizables.

## Casos de uso

- Integracion continua de Transformers: ejecutar tests de carga y forward con `HYV3ForCausalLM` en cada PR sin necesidad de GPU de gran capacidad ni del checkpoint completo.
- Validacion de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen sobre pesos con los mismos nombres de tensor que el modelo real.
- Pruebas de tokenizador y plantilla de chat: verificar que `chat_template.jinja`, `tokenizer.json` y `special_tokens_map.json` se cargan y aplican correctamente antes de desplegar el modelo real.
- Tests de precision numerica: comprobar que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16 en pipelines de entrenamiento o inferencia.
- Desarrollo de herramientas de reduccion de modelos: usar `sweep.py` y `build_fixtures.py` como referencia para generar fixtures de otros checkpoints con la misma metodologia.
- Reproducibilidad de artefactos: `build.json` registra fuentes fijadas, resultados de la puerta y hashes de ficheros, lo que permite auditar la procedencia del fixture en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios y no tiene rendimiento medible en tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (15.5M parametros); en la practica cabe en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer sirve para ejecutar los tests.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (via `integrations/transformers/usage.md`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; no aplicables al ser un artefacto de prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT2-30B-A3B-mic | 15.547.012 | no disponible | Fixture de test | no disponible | Hugging Face |
| tencent/Hy-MT2-30B-A3B | ~30B (segun nombre) | no disponible | Modelo causal real | no disponible | Hugging Face |
| Otros fixtures de `transformers-mic` | Variable | no disponible | Fixtures de test | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base en la informacion proporcionada, por lo que la comparativa se limita a parametros y proposito.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene sentido linguistico.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta disponible en la informacion proporcionada; verificar `LICENSE.txt` copiado del modelo base antes de cualquier uso.
- Los idiomas soportados no estan disponibles; el tokenizador se copia del modelo base, pero el fixture no ha sido evaluado en ningun idioma.
- La configuracion reducida a 2 capas no representa el comportamiento del modelo base; los resultados de tests de integracion no garantizan el rendimiento del checkpoint completo.
- Riesgo de confusion: el nombre incluye "30B-A3B", pero el fixture tiene 15.5M parametros; no confundir con el modelo real.
- No se documentan sesgos ni riesgos de alucinacion porque el modelo no genera texto coherente.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/Hy-MT2-30B-A3B-mic
- Modelo base: https://huggingface.co/tencent/Hy-MT2-30B-A3B
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Hy-MT2-30B-A3B-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reduccion `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
