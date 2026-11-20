# huggingface-mic/oneformer_ade20k_swin_tiny-mic

## Resumen

`oneformer_ade20k_swin_tiny-mic` es un artefacto de prueba publicado por la organización `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable en producción: se trata de un *fixture* reducido (7.922.332 parámetros) que reproduce la arquitectura y el contrato de entrada/salida de `shi-labs/oneformer_ade20k_swin_tiny`, un modelo OneFormer para segmentación universal basado en backbone Swin-Tiny. La model card lo etiqueta explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

El propósito del repositorio es servir como fixture ejecutable para validar integraciones de frameworks (en concreto Transformers) sin necesidad de descargar ni ejecutar el checkpoint real. Incluye los pesos reducidos, un manifiesto de contrato (`integration.json`), documentación de uso y expectativas del framework, además de un registro de procedencia (`build.json`) con hashes y fuentes fijadas.

Su relevancia es acotada: resulta útil para desarrolladores que mantienen integraciones de OneFormer en Transformers y necesitan pruebas rápidas y deterministas, pero no aporta ninguna capacidad de segmentación real, ya que sus pesos son aleatorios (semilla 17) y no han sido entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OneFormer universal segmentation (`OneFormerForUniversalSegmentation`) con backbone Swin-Tiny |
| Parametros totales | 7.922.332 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (guardado en float32; finito también en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura replica `OneFormerForUniversalSegmentation`, un transformer de segmentación universal que unifica segmentación semántica, de instancias y panóptica mediante una tarea de entrenamiento única. El fixture conserva la estructura del modelo original pero reduce el número de capas: `encoder_layers` 2, `decoder_layers` 2 y `backbone num_layers` 2, según la regla genérica de reducción de `sweep.py`.

No ha habido entrenamiento. Los pesos son aleatorios con semilla 17 y se generaron como fixture. Sí se aplicó una compuerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato mueve los logits al menos 0,001 (la más débil, `pixel_values:halve`, produce 0,00657), lo que garantiza que el modelo responde a las entradas aunque no tenga semántica aprendida. Los ficheros de procesador (`merges.txt`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `shi-labs/oneformer_ade20k_swin_tiny`. Los nombres de tensores coinciden con el checkpoint real, incluida la omisión de `model.pixel_level_module.encoder.swin.layernorm.bias` y `...layernorm.weight`, que el checkpoint original tampoco incluye. Se guarda en float32, el dtype con el que carga por defecto el modelo original.

## Capacidades

- No tiene capacidades de segmentación reales: los pesos son aleatorios y no producen máscaras semánticas, de instancias ni panópticas con significado.
- Reproduce el contrato de entrada/salida de OneFormer (procesador, nombres de tensores, estructura de configuración), lo que permite validar integraciones de framework.
- Sirve como fixture determinista para pruebas de carga, forward pass, cálculo de pérdida y gradientes.
- Ejecutable en float32, bfloat16 y float16 (forward, loss y gradientes finitos en los tres).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión generativa, audio ni ninguna capacidad generativa.

## Casos de uso

- Pruebas de integración en Transformers: usar el fixture para verificar que la clase `OneFormerForUniversalSegmentation` carga correctamente pesos, configuración y procesador sin descargar el checkpoint real de 200+ MB.
- CI/CD de librerías de visión: incorporar el repositorio como dependencia de test para ejecutar tests de regresión de carga y forward pass en pipelines automatizados con tiempos de ejecución mínimos.
- Validación de contratos de API: comprobar que las entradas esperadas (`pixel_values`, `task_inputs`, etc.) y las salidas del modelo coinciden con lo documentado en `integration.json` y en `integrations/transformers/expectations`.
- Verificación de dtypes: probar que el modelo es finito en float32, bfloat16 y float16 antes de desplegar el modelo real en infraestructura con precisión mixta.
- Desarrollo de herramientas de inspección de modelos: usar el fixture para probar utilidades que inspeccionan nombres de tensores y estructuras de configuración sin cargar pesos pesados.
- Reproducción de bugs de carga: recrear el comportamiento de inicialización de la capa `layernorm` ausente en el checkpoint original para depurar problemas de `load_state_dict`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier métrica de calidad (mIoU, PQ, AP) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 7,9 M de parámetros; holgadamente por debajo de 0,5 GB en float16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU.
- Cabe en cualquier GPU consumer y en la mayoría de entornos CPU sin problemas.
- Opciones de despliegue: Transformers (carga estándar con `AutoModelForUniversalSegmentation`), y en general cualquier runtime que cargue safetensors; no se ha validado con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; al ser un fixture con 2 capas, la latencia será muy inferior a la del modelo real, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/oneformer_ade20k_swin_tiny-mic` (este) | 7,9 M | no aplica | Fixture de segmentación | no disponible | Hugging Face |
| `shi-labs/oneformer_ade20k_swin_tiny` | no disponible | no aplica | Segmentación universal (ADE20K) | no disponible | Hugging Face |
| `shi-labs/oneformer_ade20k_swin_large` | no disponible | no aplica | Segmentación universal (ADE20K) | no disponible | Hugging Face |
| `facebook/mask2former-swin-tiny-ade-semantic` | no disponible | no aplica | Segmentación semántica | no disponible | Hugging Face |

La comparación relevante es con el modelo base: este fixture comparte arquitectura y procesador con `shi-labs/oneformer_ade20k_swin_tiny`, pero sustituye los pesos entrenados por pesos aleatorios y reduce el número de capas. Frente a alternativas como Mask2Former, la diferencia es de familia arquitectónica (OneFormer unifica las tres tareas de segmentación en un único modelo con una tarea de entrenamiento).

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no producen segmentaciones con significado. La model card lo declara explícitamente como `test-artifact`.
- Riesgo de confusión: si se descubre por búsqueda o se referencia por error, podría desplegarse en producción pensando que es el modelo real. La etiqueta `test-artifact` mitiga parcialmente este riesgo, pero conviene verificar siempre el ID.
- Licencia no disponible: no se puede asumir ningún permiso de uso comercial ni de redistribución.
- Idiomas no disponibles: al ser un modelo de visión, la noción de idioma no aplica, pero la ausencia de metadatos impide confirmar nada al respecto.
- Sesgos: no evaluables, al no haber datos de entrenamiento ni evaluación.
- Contexto: no aplica; es un modelo de segmentación de imágenes, no de texto.
- Para producción, usar siempre `shi-labs/oneformer_ade20k_swin_tiny` o un checkpoint equivalente entrenado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/oneformer_ade20k_swin_tiny-mic
- Modelo base: https://huggingface.co/shi-labs/oneformer_ade20k_swin_tiny
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/oneformer_ade20k_swin_tiny-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/oneformer_ade20k_swin_tiny-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/oneformer_ade20k_swin_tiny-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/oneformer_ade20k_swin_tiny-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/oneformer_ade20k_swin_tiny-mic.html
- Script de reducción (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
