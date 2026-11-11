# huggingface-mic/siglip-base-patch16-224-mic

## Resumen

`siglip-base-patch16-224-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` en Hugging Face, no un modelo funcional. Se trata de una version "adelgazada" (slim) del modelo `google/siglip-base-patch16-224`, reducida mediante una regla generica de recorte de capas (2 capas de texto y 2 capas de vision en lugar de las originales) que conserva la misma arquitectura `SiglipModel` y los mismos nombres de tensores. Con 2.285.570 parametros totales, su proposito es servir como fixture reproducible para probar contratos de integracion y expectativas de frameworks (Transformers), no para realizar inferencia util.

El modelo conserva los ficheros de procesador copiados byte a byte del checkpoint original (`preprocessor_config.json`, `special_tokens_map.json`, `spiece.model`, `tokenizer.json`, `tokenizer_config.json`), lo que permite validar que el pipeline de procesamiento coincide exactamente con el del modelo real. Los pesos son aleatorios (semilla 17), generados sin entrenamiento, y pasaron un "input-sensitivity gate" que exige que cualquier perturbacion de las entradas mueva los logits al menos 0.001.

Es relevante en el contexto de la infraestructura de testing de modelos: permite validar integraciones, contratos y expectativas de framework sin descargar ni ejecutar el checkpoint completo. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos, por lo que no debe confundirse con un modelo utilizable en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SiglipModel (transformer dual texto-vision) |
| Parametros totales | 2.285.570 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es `SiglipModel`, un transformer dual que combina un codificador de texto y un codificador de vision, en la linea del modelo original `google/siglip-base-patch16-224` (parche de 16x16 y resolucion de 224x224). En esta version "slim" se ha aplicado la regla generica de recorte definida en `sweep.py` del repositorio `transformers-mic`, que reduce a 2 capas ocultas tanto el codificador de texto (`text num_hidden_layers 2`) como el de vision (`vision num_hidden_layers 2`). Los nombres de tensores se mantienen identicos a los del checkpoint real.

No hubo entrenamiento: los pesos son aleatorios con semilla 17. El autor justifica la ausencia de entrenamiento indicando que el fixture supero el "input-sensitivity gate", es decir, que toda perturbacion de las entradas del contrato desplaza los logits al menos 0.001 (el caso mas debil, `input_ids:roll_batch`, con 0.00897). El modelo se guarda en float32, el dtype con el que carga por defecto `google/siglip-base-patch16-224`, y es finito en float32, bfloat16 y float16 (forward, loss y gradientes). Los ficheros de procesador se copian byte a byte del modelo base, de modo que el pipeline de preprocesado y tokenizacion es exactamente el mismo.

## Capacidades

- No es un modelo funcional: al tener pesos aleatorios, no genera texto ni clasifica imagenes de forma significativa.
- Conserva la interfaz de clasificacion zero-shot de imagenes de SigLIP (`SigLIP zero-shot image classification`), segun el contrato declarado en `integration.json`.
- Mantiene los nombres de tensores del checkpoint original, lo que permite validar la carga y el mapeo de pesos.
- Incluye ficheros de procesador byte a byte identicos al modelo base, utiles para validar preprocesado y tokenizacion.
- Sirve como fixture para comprobar expectativas de framework (directorio `integrations/transformers/expectations`).
- No dispone de tool calling, agentes, capacidades multilingues ni modos de razonamiento, ya que no es un modelo entrenado.

## Casos de uso

- Validacion de contratos de integracion: el repositorio incluye `integration.json` con el manifiesto del contrato, de modo que un pipeline de CI puede comprobar que la integracion de SigLIP cumple las expectativas declaradas sin descargar el checkpoint completo.
- Pruebas de carga de pesos en Transformers: al conservar los nombres de tensores del checkpoint real, permite verificar que el mapeo de pesos y la inicializacion del `SiglipModel` funcionan correctamente.
- Verificacion de preprocesado: los ficheros de procesador copiados byte a byte permiten comprobar que la tokenizacion y el preprocesado de imagenes coinciden con `google/siglip-base-patch16-224`.
- Pruebas de estabilidad numerica: el fixture es finito en float32, bfloat16 y float16 (forward, loss y gradientes), por lo que sirve para validar rutas de mixed precision en frameworks.
- Test de sensibilidad a entradas: el "input-sensitivity gate" documentado en `build.json` permite reproducir pruebas que verifiquen que las perturbaciones de entrada afectan a los logits.
- Regresion de pipelines de testing: al ser un artefacto pequeno y determinista (semilla 17), se puede usar como caso de regresion estable en suites de testing de integraciones de modelos.
- Reproduccion de fixtures: el script `example/build_fixtures.py` permite reconstruir el fixture con `python example/build_fixtures.py --fixture siglip-base-patch16-224-mic`, util para validar la reproducibilidad del proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de rendimiento (MMLU, HumanEval, GSM8K ni ninguna otra), coherente con la naturaleza de artefacto de prueba del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: minimos, dado el tamano de 2,3M parametros (pesos en float32 de aproximadamente 9 MB). Cabe en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU con suficiente memoria para el modelo base de SigLIP serviria, pero al tratarse de un fixture no se recomienda su despliegue.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna e incluso en entornos CPU.
- Opciones de despliegue: Transformers (uso declarado en `integrations/transformers/usage.md`). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| siglip-base-patch16-224-mic | 2.285.570 | no disponible | Fixture de testing | no disponible | Hugging Face |
| google/siglip-base-patch16-224 | no disponible | no disponible | Clasificacion zero-shot de imagenes | no disponible | Hugging Face |
| Modelos SigLIP de otros tamanos (p. ej. large) | no disponible | no disponible | Clasificacion zero-shot de imagenes | no disponible | Hugging Face |

La comparativa directa con alternativas funcionales no es posible en terminos de rendimiento, ya que el fixture no ha sido entrenado. Su unico comparable natural es el checkpoint base `google/siglip-base-patch16-224`, del que deriva.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no han sido entrenados; las salidas carecen de significado.
- Etiquetado como `test-artifact` para excluirlo de la busqueda de modelos candidatos; no debe usarse en produccion.
- No se dispone de informacion sobre licencia, por lo que no se puede confirmar el uso comercial.
- No se dispone de informacion sobre sesgos, al no existir entrenamiento ni datos de entrenamiento.
- Riesgo de confusion: el nombre y la estructura imitan a un modelo real de SigLIP; conviene verificar el tag `test-artifact` antes de su uso.
- Limitaciones de contexto e idioma no disponibles.
- El modelo esta guardado en float32; no se documentan otras cuantizaciones.

## Enlaces

- [Hugging Face: huggingface-mic/siglip-base-patch16-224-mic](https://huggingface.co/huggingface-mic/siglip-base-patch16-224-mic)
- [Modelo base: google/siglip-base-patch16-224](https://huggingface.co/google/siglip-base-patch16-224)
- [Manifiesto del contrato (integration.json)](https://huggingface.co/huggingface-mic/siglip-base-patch16-224-mic/blob/main/integration.json)
- [Uso en Transformers (usage.md)](https://huggingface.co/huggingface-mic/siglip-base-patch16-224-mic/blob/main/integrations/transformers/usage.md)
- [Expectativas de Transformers](https://huggingface.co/huggingface-mic/siglip-base-patch16-224-mic/tree/main/integrations/transformers/expectations)
- [Procedencia del fixture (build.json)](https://huggingface.co/huggingface-mic/siglip-base-patch16-224-mic/blob/main/build.json)
- [Como se adelgazo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/siglip-base-patch16-224-mic.html)
- [Repositorio transformers-mic (sweep.py)](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Script build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
