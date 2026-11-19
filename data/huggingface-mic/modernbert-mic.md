# huggingface-mic/modernbert-mic

## Resumen

`modernbert-mic` es un artefacto de prueba (test artifact) publicado por la organización `huggingface-mic`, no un modelo entrenado ni utilizable para inferencia real. Se trata de un fixture "slim" de 3,4 millones de parámetros derivado de `answerdotai/ModernBERT-base`, cuyo propósito es validar contratos de integración con Transformers (uso público, expectativas de framework y reproducibilidad) sobre un checkpoint reducido en lugar del modelo completo.

El fixture conserva la arquitectura `ModernBertForMaskedLM` pero reduce la configuración a 2 capas (`num_hidden_layers: 2`) y utiliza pesos aleatorios (semilla 17) que superaron una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001. Los ficheros de procesador (tokenizer y mapas de tokens especiales) se copiaron byte a byte desde `answerdotai/ModernBERT-base`.

Es relevante únicamente en el contexto de ingeniería de integración de modelos: permite registrar evidencias de ejecución (variantes por defecto, eager y bfloat16 sobre una NVIDIA A10G, con baseline en proceso fresco) sin necesidad de descargar ni ejecutar el checkpoint real. El propio autor lo etiqueta como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), clase `ModernBertForMaskedLM`; fixture con 2 capas |
| Parametros totales | 3.360.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos guardados en float32 y verificados como finitos en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | answerdotai/ModernBERT-base |
| Proposito | fixture de test para contratos de integracion con Transformers |
| Semilla de pesos | 17 (pesos aleatorios) |
| Descargas | 3.317 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, instanciado como `ModernBertForMaskedLM`. El fixture se generó aplicando la regla genérica de reducción de `sweep.py` (repositorio `huggingface/transformers-mic`), que en este caso fija `num_hidden_layers` a 2. Los nombres de tensores coinciden con los del checkpoint real, de modo que el fixture ejercita el mismo grafo de cómputo con una configuración menor.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron tras superar una puerta de sensibilidad a la entrada: toda perturbación de las entradas del contrato movió los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, registró 0,00121). Los ficheros de tokenizador (`special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde `answerdotai/ModernBERT-base`. La validación cubrió variantes por defecto, eager y bfloat16 sobre una NVIDIA A10G, con grabación de baseline en proceso fresco, y se verificó finitud en float32, bfloat16 y float16 para forward, pérdida y gradientes.

## Capacidades

- Ninguna capacidad de modelo real: al tener pesos aleatorios, no genera texto, no razona, no traduce ni resuelve tareas de NLP.
- Sirve como fixture ejecutable para validar el contrato de integración de ModernBERT con Transformers (carga, forward, pérdida y gradientes).
- Permite comprobar compatibilidad de tokenizador y mapeo de tokens especiales idénticos al checkpoint base.
- Verifica comportamiento numérico en float32, bfloat16 y float16 (finitud de forward, loss y gradientes).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento.
- No dispone de capacidades multilingües declaradas.

## Casos de uso

- Validación de pipelines de integración continua: usar el fixture como sustituto del checkpoint completo en tests de carga y forward con Transformers, reduciendo tiempo y ancho de banda de CI.
- Pruebas de compatibilidad de tokenizador: comprobar que los ficheros de procesador copiados desde `answerdotai/ModernBERT-base` se cargan correctamente en distintas versiones de la librería.
- Verificación de precisión numérica: ejecutar forward, pérdida y gradientes en float32, bfloat16 y float16 para detectar regresiones de estabilidad en entornos de entrenamiento mixto.
- Reproducibilidad de contratos de framework: registrar expectativas de salida y comparar contra el baseline en proceso fresco documentado en el repositorio.
- Desarrollo de herramientas de reducción de modelos: servir como ejemplo de referencia del proceso de shrink aplicado por `sweep.py` sobre un checkpoint real.
- Auditoría de artefactos de test: comprobar que el etiquetado `test-artifact` excluye correctamente el repositorio de búsquedas de modelos candidatos en catálogos internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card únicamente documenta evidencias de ejecución (variantes por defecto, eager y bfloat16 sobre NVIDIA A10G, con baseline en proceso fresco) y resultados de la puerta de sensibilidad a la entrada, no métricas de calidad de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para 3,4 M de parámetros; en la práctica, el peso de los pesos es despreciable frente al overhead del runtime.
- GPU recomendadas: cualquiera con soporte CUDA; el autor valida sobre NVIDIA A10G.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, e incluso CPU) sin restricciones prácticas de memoria.
- Opciones de despliegue: Transformers (validado por el autor); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de test, no se publican mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/modernbert-mic | 3.360.320 | no disponible | Fixture de test para contratos de integracion | no disponible | Hugging Face |
| answerdotai/ModernBERT-base | no disponible en la informacion proporcionada | no disponible | Modelo encoder real para tareas de NLP | no disponible | Hugging Face |
| Otros fixtures de la organizacion huggingface-mic | no disponible | no disponible | Fixtures de test para otros modelos | no disponible | Hugging Face |

La comparación relevante es contra el checkpoint base `answerdotai/ModernBERT-base`: el fixture replica su arquitectura y tokenizador con una configuración reducida y pesos aleatorios, por lo que no es sustituible por él en ninguna tarea de producción. No se dispone de datos suficientes para comparar con alternativas de la misma categoría (fixtures de test).

## Limitaciones y advertencias

- Es un artefacto de test: los pesos son aleatorios y el modelo no produce salidas significativas.
- No debe usarse en producción, investigación aplicada ni evaluación de calidad.
- No se declaran sesgos porque no hay entrenamiento; cualquier salida es ruido.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de uso indebido si se confunde con un modelo real.
- Licencia no disponible: no se puede asumir permiso de uso comercial.
- Idiomas y contexto no declarados.
- El autor indica que es un prototipo con objetivos solo de fixture; la cobertura del checkpoint completo es un trabajo separado.
- El repositorio tiene 0 likes y un tamaño de 0,0 GB, coherente con su naturaleza de artefacto mínimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/modernbert-mic
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/modernbert-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/modernbert-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/modernbert-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/modernbert-mic/blob/main/build.json
- Documentacion del proceso de shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/modernbert-mic.html
- Evidencia de regeneracion (GitHub Actions): https://github.com/huggingface/transformers-mic/actions/runs/38252430459
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
