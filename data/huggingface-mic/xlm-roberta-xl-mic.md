# huggingface-mic/xlm-roberta-xl-mic

## Resumen

`xlm-roberta-xl-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable en producción: se trata de una version "adelgazada" del checkpoint `facebook/xlm-roberta-xl` pensada para validar contratos de integración con Transformers. El autor lo etiqueta explícitamente como `test-artifact` para que quede excluido de las búsquedas de modelos candidatos.

El fixture conserva la arquitectura `XLMRobertaXLForMaskedLM` pero reduce la configuración a 2 capas ocultas, dando como resultado 16.411.520 parámetros (frente a los aproximadamente 560 millones del modelo base original). Los pesos son aleatorios (semilla 17) y no han pasado por ningún proceso de entrenamiento; únicamente superaron una puerta de sensibilidad a la entrada que verifica que las perturbaciones en las entradas mueven los logits al menos 0,001.

Su relevancia es puramente de ingeniería: sirve como banco de pruebas reproducible para verificar que las integraciones de Transformers (tokenizador, expectativas de framework, nombres de tensores, dtypes) funcionan correctamente sin necesidad de descargar el checkpoint completo. Para cualquier uso real de XLM-RoBERTa-XL debe acudirse al modelo original de Facebook.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-XL (transformer encoder), clase `XLMRobertaXLForMaskedLM` |
| Parametros totales | 16.411.520 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; el autor indica que es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo XLM-RoBERTa-XL con cabeza de enmascaramiento (`XLMRobertaXLForMaskedLM`). La configuración se ha reducido mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`, fijando `num_hidden_layers` a 2. Los ficheros de procesador (`sentencepiece.bpe.model`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde `facebook/xlm-roberta-xl`, por lo que el tokenizador es idéntico al del modelo original.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplaza los logits al menos 0,001 (la más débil, `input_ids:roll_batch`, con 0,428). Los nombres de tensores coinciden con los del checkpoint real y el modelo se guardó en float32, el dtype por defecto con el que carga `facebook/xlm-roberta-xl`.

## Capacidades

- No dispone de capacidades reales de modelado del lenguaje: los pesos son aleatorios y no han sido entrenados.
- Ejecuta el forward pass de `XLMRobertaXLForMaskedLM` con nombres de tensores idénticos al checkpoint original.
- Sirve como fixture para validar integraciones de Transformers (tokenizador, expectativas de framework, dtypes).
- Compatible con ejecución en float32, bfloat16 y float16 (forward, pérdida y gradientes finitos).
- Tokenizador idéntico al de `facebook/xlm-roberta-xl` (SentencePiece BPE copiado byte a byte).
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento.

## Casos de uso

- Validación de integraciones de Transformers: permite comprobar que una integración carga el modelo, ejecuta el forward y produce logits coherentes sin descargar el checkpoint completo de XLM-RoBERTa-XL.
- Pruebas de CI/CD en pipelines de ML: al pesar 0,1 GB y tener 16,4M parámetros, se puede incluir en suites de tests automatizados con tiempos de ejecución mínimos.
- Verificación de contratos de tokenizador: al copiar los ficheros de procesador byte a byte del modelo original, sirve para testear que el pipeline de tokenización se comporta igual que con `facebook/xlm-roberta-xl`.
- Comprobación de compatibilidad de dtypes: el autor garantiza finitud en float32, bfloat16 y float16, lo que permite testear rutas de carga y mixed precision en frameworks.
- Desarrollo de herramientas de inspección de modelos: útil para validar utilidades que leen configuraciones, nombres de tensores o metadatos sin depender de checkpoints pesados.
- Reproducción de experimentos de "shrink": el repositorio documenta cómo se generó el fixture (`build.json`, `build_fixtures.py`), lo que permite replicar el proceso para otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no tiene sentido evaluar su rendimiento en tareas de NLP.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 (16,4M parámetros, ~66 MB de pesos); en float16 o bfloat16, ~33 MB.
- GPU recomendadas: cualquier GPU, incluida una integrada; no requiere aceleración dedicada.
- Cabe holgadamente en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, etc.) y también en CPU.
- Opciones de despliegue: Transformers (carga estándar de `XLMRobertaXLForMaskedLM`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas con pesos aleatorios, los tiempos serían mínimos pero no representativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `xlm-roberta-xl-mic` (este) | 16,4M | no disponible | Fixture de test | no disponible | Hugging Face |
| `facebook/xlm-roberta-xl` | ~560M (no confirmado en la informacion) | no disponible | Masked LM multilingue | no disponible | Hugging Face |
| `xlm-roberta-base` | no disponible | no disponible | Masked LM multilingue | no disponible | Hugging Face |
| `xlm-roberta-large` | no disponible | no disponible | Masked LM multilingue | no disponible | Hugging Face |

La comparación relevante es con el modelo base `facebook/xlm-roberta-xl`, del que este fixture es una version reducida y sin entrenamiento. Las cifras de parámetros de los modelos alternativos no se han confirmado en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no han sido entrenados; las salidas carecen de significado.
- Etiquetado como `test-artifact` por el propio autor para excluirlo de búsquedas de modelos candidatos.
- No debe desplegarse en producción bajo ninguna circunstancia.
- Licencia no especificada: no se puede asumir ningún permiso de uso comercial.
- Idiomas soportados no documentados (aunque el tokenizador es el multilingüe de XLM-RoBERTa-XL).
- Longitud de contexto no documentada.
- La configuración reducida (2 capas) no reproduce el comportamiento del checkpoint original.
- El repositorio solo incluye pesos, uso y expectativas de framework; otros ficheros deben regenerarse con `python example/build_fixtures.py --fixture xlm-roberta-xl-mic`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/xlm-roberta-xl-mic
- Modelo base: https://huggingface.co/facebook/xlm-roberta-xl
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/xlm-roberta-xl-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/xlm-roberta-xl-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/xlm-roberta-xl-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/xlm-roberta-xl-mic/blob/main/build.json
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/xlm-roberta-xl-mic.html
- Repositorio `transformers-mic` (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
