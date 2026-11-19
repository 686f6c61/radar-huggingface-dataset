# huggingface-mic/conv-bert-base-mic

## Resumen

`conv-bert-base-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni utilizable en producción, sino de una versión reducida del modelo `YituTech/conv-bert-base` creada para validar contratos de integración y expectativas de frameworks (concretamente Transformers) dentro del proyecto `transformers-mic`. El propio autor lo etiqueta explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

El fixture conserva la arquitectura `ConvBertModel` pero reduce la configuración a `num_hidden_layers: 2`, lo que da como resultado 23.951.524 parámetros totales (frente a los aproximadamente 110 millones del ConvBERT-base original). Los pesos son aleatorios (semilla 17), no entrenados, y se guardan en float32. Los ficheros de procesador (`vocab.txt`) se copian byte a byte del checkpoint original, de modo que los nombres de tensores y la interfaz de tokenización coinciden con el modelo real.

Su relevancia es por tanto metodológica, no de rendimiento: sirve como referencia para verificar que una integración de framework (carga, forward, cálculo de pérdida, gradientes) se comporta como se espera frente a un checkpoint ConvBERT real. Cualquier uso como modelo de NLP real sería un error de interpretación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvBERT (ConvBertModel, encoder tipo transformer con atención por convolution) |
| Parametros totales | 23.951.524 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la configuración reducida no documenta `max_position_embeddings`) |
| Tipos de cuantizacion | no disponible (pesos en float32; el autor indica que es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es un `ConvBertModel` con la configuración reducida a 2 capas ocultas mediante la regla genérica de reducción de `sweep.py` del repositorio `transformers-mic`. ConvBERT es una arquitectura de encoder basada en transformer que sustituye parte de las cabezas de atención por convoluciones (span-based dynamic convolution), diseñada originalmente para reducir el coste computacional de la atención densa manteniendo calidad en tareas de comprensión del lenguaje.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, produjo 0,0143). Esto garantiza que el fixture responde a cambios en las entradas, condición necesaria para probar integraciones, pero no implica ningún aprendizaje. Los ficheros de procesador (`vocab.txt`) se copian byte a byte de `YituTech/conv-bert-base` y los nombres de tensores coinciden con el checkpoint real. El fixture es finito en float32, bfloat16 y float16 tanto en forward como en pérdida y gradientes.

## Capacidades

- No tiene capacidades de modelado del lenguaje reales: los pesos son aleatorios y no han sido entrenados.
- Sirve para validar la carga del checkpoint y la coincidencia de nombres de tensores con `YituTech/conv-bert-base`.
- Permite comprobar el comportamiento de forward, cálculo de pérdida y gradientes en float32, bfloat16 y float16.
- Verifica la sensibilidad a las entradas del contrato (incluida `attention_mask`).
- Reutiliza el tokenizador del modelo base mediante `vocab.txt` copiado byte a byte.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües verificables.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Pruebas de integración en Transformers: cargar el fixture y comprobar que la API (`AutoModel`, `AutoTokenizer`) se comporta como con el checkpoint real, sin descargar los aproximadamente 110 millones de parámetros del ConvBERT-base.
- Validación de contratos de framework: ejecutar el directorio `integrations/transformers/expectations` para verificar que una versión de Transformers cumple las expectativas de carga, forward y gradientes.
- CI/CD de bajo coste: usar un repo de 0,2 GB y 24 millones de parámetros como sustituto en pipelines de prueba donde el checkpoint completo resultaría lento o caro.
- Pruebas de dtype: comprobar que el modelo es finito en float32, bfloat16 y float16 en forward, pérdida y gradientes antes de aplicar cambios a modelos reales.
- Verificación de paridad de tensores: comparar nombres y formas de tensores con `YituTech/conv-bert-base` para detectar roturas en conversiones o exportaciones.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture conv-bert-base-mic` y comprobar hashes registrados en `build.json`.
- Docencia y demos de tooling: ilustrar cómo se estructura un fixture de modelo con contrato, procedencia y expectativas sin necesidad de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, GLUE, HumanEval, etc.) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (24 millones de parámetros, aproximadamente 96 MB de pesos) más overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 3060, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (vía `AutoModel`/`AutoTokenizer`) y, potencialmente, llama.cpp u Ollama si se convierte a GGUF, aunque no está documentado por el autor.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia sería muy baja, pero no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Proposito |
|---|---|---|---|---|---|
| `huggingface-mic/conv-bert-base-mic` | 23,95 M | no disponible | No (pesos aleatorios) | no disponible | Fixture de pruebas |
| `YituTech/conv-bert-base` | ~110 M (no confirmado en la informacion) | no disponible | Si | no disponible | Encoder ConvBERT para NLP |
| `bert-base-uncased` | ~110 M | 512 | Si | Apache 2.0 | Encoder BERT de referencia |

La comparación con `YituTech/conv-bert-base` es la más directa: mismo arquitectura y mismos nombres de tensores, pero con 2 capas en lugar de la configuración completa y sin entrenamiento. Frente a `bert-base-uncased`, la diferencia clave es que el fixture no es un modelo funcional de NLP.

## Limitaciones y advertencias

- Es un artefacto de prueba (`test-artifact`), no un modelo utilizable; los pesos son aleatorios y no producen salidas con significado.
- No debe emplearse en producción, investigación de NLP ni evaluación de calidad.
- Los sesgos conocidos no son aplicables porque no hay entrenamiento; cualquier sesgo observado en las salidas sería ruido aleatorio.
- Riesgo de alucinación total: las salidas son esencialmente ruido estadístico derivado de pesos aleatorios.
- Limitaciones de contexto e idioma no documentadas; el `vocab.txt` proviene del modelo base, pero no hay garantía de comportamiento lingüístico.
- Licencia no disponible: no se puede asumir uso comercial sin consultar el repositorio original `YituTech/conv-bert-base`.
- El repositorio solo incluye pesos reducidos, uso y expectativas; otros ficheros deben regenerarse con `build_fixtures.py`.
- No debe indexarse como modelo candidato en búsquedas; el tag `test-artifact` existe precisamente para evitarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/conv-bert-base-mic
- Modelo base: https://huggingface.co/YituTech/conv-bert-base
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/conv-bert-base-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/conv-bert-base-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/conv-bert-base-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/conv-bert-base-mic/blob/main/build.json
- Explicación de la reducción del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/conv-bert-base-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
