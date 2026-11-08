# huggingface-mic/oneformer_ade20k_swin_tiny-mic

## Resumen

`huggingface-mic/oneformer_ade20k_swin_tiny-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` dentro del proyecto transformers-mic. No es un modelo usable en producción: se trata de una versión reducida del checkpoint real `shi-labs/oneformer_ade20k_swin_tiny` de OneFormer, pensada para validar contratos de integración (carga, tokenizador, expectativas de framework) sin necesidad de descargar los pesos completos. Está etiquetado explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

El modelo base es OneFormer, un transformer universal de segmentación de imágenes que unifica segmentación semántica, de instancias y panóptica en un único modelo condicionado por un token de texto que indica la tarea. La variante original usa un backbone Swin Transformer Tiny sobre el dataset ADE20K. Este fixture conserva la arquitectura `OneFormerForUniversalSegmentation` pero con una configuración drásticamente reducida: 2 capas de encoder, 2 de decoder y 2 capas en el backbone, lo que deja el total en 7.922.332 parámetros.

Su relevancia es puramente de ingeniería: sirve como fixture reproducible (clave `c8195498b4ef`) para pruebas de integración con Transformers, con pesos aleatorios (semilla 17), ficheros de procesador copiados byte a byte del checkpoint original y los mismos nombres de tensores. Cualquier evaluacion de capacidades reales de segmentacion debe hacerse sobre el modelo base, no sobre este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OneFormerForUniversalSegmentation (transformer con backbone Swin, configuracion reducida a 2 capas encoder / 2 decoder / 2 capas backbone) |
| Parametros totales | 7.922.332 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo base OneFormer combina un backbone Swin Transformer con un encoder y decoder tipo transformer, y entrena conjuntamente segmentación semántica, de instancias y panóptica condicionando la salida mediante un token de tarea en texto. Este fixture replica esa arquitectura `OneFormerForUniversalSegmentation` pero con una configuración encogida mediante la regla genérica de `sweep.py` del repositorio transformers-mic: `encoder_layers=2`, `decoder_layers=2` y `backbone num_layers=2`.

No ha habido entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron porque superaron el umbral de sensibilidad a las entradas: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `pixel_values:halve`, produjo 0,00657). Los ficheros del procesador (`merges.txt`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `shi-labs/oneformer_ade20k_swin_tiny`. Se mantienen los mismos nombres de tensores que el checkpoint real, incluida la omisión de `model.pixel_level_module.encoder.swin.layernorm.bias` y `model.pixel_level_module.encoder.swin.layernorm.weight`, que el checkpoint original tampoco incluye.

## Capacidades

- No es un modelo funcional: no realiza segmentación semántica, de instancias ni panóptica con calidad utilizable.
- Reproduce la interfaz de entrada/salida de OneFormer: acepta `pixel_values` y produce logits, lo que permite probar pipelines de inferencia a nivel de contrato.
- Sirve para validar la carga de pesos safetensors, la inicialización de tensores ausentes y la compatibilidad con el procesador del modelo original.
- Verificado numéricamente finito en forward, loss y gradientes en float32, bfloat16 y float16.
- No dispone de tool calling, capacidades de agente, multilingüismo ni modo thinking (no aplica a un modelo de visión).
- No soporta generación de texto.

## Casos de uso

- Pruebas de integración en CI: usar el fixture para verificar que el pipeline de Transformers carga `OneFormerForUniversalSegmentation` y ejecuta un forward sin descargar los pesos completos del modelo real.
- Validación de contratos de framework: comprobar que las expectativas de entrada/salida documentadas en `integrations/transformers/expectations` se cumplen con un checkpoint ligero y reproducible.
- Test de regresión de tokenizador y procesador: los ficheros de procesador copiados byte a byte permiten verificar que cambios en el código no alteran el preprocesado respecto al modelo original.
- Verificación de dtypes: comprobar que el modelo se mantiene finito en float32, bfloat16 y float16 antes de desplegar variantes del modelo real en precisión reducida.
- Desarrollo de utilidades de carga de safetensors: probar rutas de carga, inicialización de tensores faltantes y mapeo de nombres con un repositorio de tamaño mínimo (0,0 GB).
- Reproducibilidad de fixtures: regenerar el artefacto con `python example/build_fixtures.py --fixture oneformer_ade20k_swin_tiny-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios y arquitectura reducida, cualquier métrica de segmentación (mIoU, PQ, AP) carecería de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 dado el tamaño de 7,9 M de parámetros y el reducido tamaño del repositorio (0,0 GB); no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una GTX 1650 o superior; también ejecutable en CPU.
- Cabe holgadamente en cualquier GPU de consumo actual.
- Opciones de despliegue: Transformers (PyTorch) como vía principal; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de segmentación de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/oneformer_ade20k_swin_tiny-mic` (este) | 7,9 M (fixture) | Contrato de segmentación universal (pesos aleatorios) | no aplica | no disponible | Hugging Face |
| `shi-labs/oneformer_ade20k_swin_tiny` | no disponible en la informacion proporcionada | Segmentación universal (semántica, instancias, panóptica) sobre ADE20K | no aplica | no disponible | Hugging Face |
| `zeromodels/oneformer_ade20k_swin_tiny` | no disponible en la informacion proporcionada | Segmentación universal OneFormer (espejo) | no aplica | no disponible | Hugging Face |

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen valor semántico; no debe usarse para segmentar imágenes reales.
- Arquitectura encogida: 2 capas de encoder, 2 de decoder y 2 capas de backbone no equivalen al modelo original, por lo que las pruebas de rendimiento no son extrapolables.
- Etiquetado como `test-artifact`: está pensado para excluirse de búsquedas de modelos candidatos; no debe promocionarse como modelo desplegable.
- Licencia no especificada en la información disponible: no se puede confirmar el uso comercial; habría que remitirse a la licencia del modelo base.
- Sin datos de sesgos, alucinación o cobertura idiomática: no aplican en su estado actual, pero tampoco están documentados.
- No sustituye al checkpoint real para validar calidad de segmentación; úsese únicamente para pruebas de contrato e integración.

## Enlaces

- Repositorio del fixture: https://huggingface.co/huggingface-mic/oneformer_ade20k_swin_tiny-mic
- Modelo base: https://huggingface.co/shi-labs/oneformer_ade20k_swin_tiny
- Espejo del modelo base: https://huggingface.co/zeromodels/oneformer_ade20k_swin_tiny
- Paper OneFormer (arXiv:2211.06220): https://arxiv.org/abs/2211.06220
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/oneformer_ade20k_swin_tiny-mic.html
