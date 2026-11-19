# huggingface-mic/jina-embeddings-v3-hf-mic

## Resumen

`huggingface-mic/jina-embeddings-v3-hf-mic` es un artefacto de prueba (fixture) publicado por el equipo de Hugging Face MIC para validar la integración de `jinaai/jina-embeddings-v3-hf` con la librería Transformers. No es un modelo entrenado ni utilizable en producción: se trata de una versión "slim" del checkpoint original, reducida a 2 capas y con pesos aleatorios (semilla 17), pensada exclusivamente para tests de contrato de framework.

El modelo conserva la arquitectura `JinaEmbeddingsV3Model` y los mismos nombres de tensor que el checkpoint real, pero con una configuración reducida (`num_hidden_layers: 2`) y un total de 16.071.424 parámetros. Los ficheros de procesador (`tokenizer.json`, `tokenizer_config.json`, `config_sentence_transformers.json`, `custom_st.py`, `modules.json`, `special_tokens_map.json`) se copian byte a byte del modelo base, de modo que el pipeline de tokenización es idéntico al original.

Su relevancia es puramente de ingeniería: permite a los mantenedores de Transformers y de la integración MIC verificar que la carga, el forward pass y la sensibilidad a entradas funcionan correctamente sin descargar el checkpoint completo de Jina. Está etiquetado como `test-artifact` precisamente para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JinaEmbeddingsV3Model (transformer encoder, 2 capas en el fixture) |
| Parametros totales | 16.071.424 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `JinaEmbeddingsV3Model` del checkpoint `jinaai/jina-embeddings-v3-hf`, pero con `num_hidden_layers` reducido a 2 mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`. Los ficheros de procesador se copian byte a byte del modelo original, garantizando que la tokenización y la configuración de Sentence Transformers son idénticas a las del checkpoint real.

No hubo entrenamiento. Los pesos se inicializan de forma aleatoria con semilla 17 y se validan mediante un "input-sensitivity gate": cada perturbación de las entradas del contrato debe mover los logits al menos 0,001 (la más débil, `attention_mask:all_ones`, mueve 0,0156). Los pesos se guardan en bfloat16, el dtype por defecto de carga del modelo base, y se verifica que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16. El fixture cubre todos los checkpoints cuyos ficheros de procesador son byte-idénticos y cuya config coincide tras el shrink (clave de fixture `738094eeb2b6`).

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen embeddings semánticamente útiles.
- Sirve como fixture de contrato para validar la integración de `jinaai/jina-embeddings-v3-hf` en Transformers (carga, forward, pooling).
- Reproduce la firma de tensores del checkpoint real, por lo que permite testear código que dependa de nombres y formas de parámetros.
- Incluye ficheros de procesador idénticos al modelo base (tokenizer, `modules.json`, `custom_st.py`), útiles para tests de pipeline de Sentence Transformers.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso.
- No dispone de capacidades multilingües verificables en este artefacto (los idiomas del modelo base no se documentan en la información disponible).

## Casos de uso

- Tests de integración en Transformers: cargar el fixture y verificar que `JinaEmbeddingsV3Model` se instancia, ejecuta forward y devuelve formas correctas sin descargar el checkpoint completo de 0,5 GB.
- CI/CD de la librería `transformers-mic`: usar el fixture como caso de prueba reproducible con hash de ficheros (`build.json`) para detectar regresiones en la carga de safetensors en bfloat16.
- Validación de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen (nombres de tensor, dtypes, sensibilidad a entradas).
- Desarrollo de utilidades de pooling: el fixture permite probar código de mean-pooling y normalización sin depender de pesos reales.
- Reproducibilidad de builds: `build_fixtures.py` y `build.json` permiten reconstruir el fixture y auditar los hashes de los ficheros incluidos.
- Formación de nuevos contribuidores: el repositorio documenta el flujo completo (manifest, usage, expectations, provenance) como ejemplo de fixture bien construido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MTEB, retrieval, STS) sería irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en bfloat16 (16,1 M parámetros × 2 bytes ≈ 32 MB de pesos, más overhead de activaciones y tokenizer).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer y en CPU.
- Opciones de despliegue: `transformers` (carga estándar), `sentence-transformers` (los ficheros de procesador son compatibles), y cualquier runtime que soporte safetensors en bfloat16.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia sería muy baja pero no representativa del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/jina-embeddings-v3-hf-mic` (este) | 16,1 M | no disponible | Fixture de test | no disponible | Hugging Face |
| `jinaai/jina-embeddings-v3-hf` | no disponible en la informacion | no disponible | Embeddings multilingues de produccion | no disponible | Hugging Face |
| `jinaai/jina-embeddings-v3` | no disponible en la informacion | no disponible | Embeddings multilingues de produccion | no disponible | Hugging Face |

La comparación relevante es únicamente con el modelo base: el fixture comparte arquitectura y procesador, pero no pesos ni utilidad. Frente a otros fixtures de la familia `transformers-mic`, la diferencia está en la clave de fixture y en los checkpoints cubiertos.

## Limitaciones y advertencias

- Los pesos son aleatorios: los embeddings generados no tienen significado semántico y no deben usarse para búsqueda, clustering ni recuperación.
- Está etiquetado explícitamente como `test-artifact`; no debe aparecer en catálogos de modelos candidatos ni en selecciones automáticas.
- La licencia no está declarada en la información disponible; no se puede asumir uso comercial.
- El contexto, los idiomas y las capacidades multilingües del modelo base no se documentan aquí, por lo que no es posible evaluar su idoneidad para producción.
- La configuración reducida (2 capas) altera el comportamiento respecto al checkpoint real; los tests que pasen con el fixture no garantizan que pasen con el modelo completo en términos de calidad de salida.
- El fixture solo cubre checkpoints con ficheros de procesador byte-idénticos y config coincidente tras el shrink (clave `738094eeb2b6`); otros checkpoints del modelo base pueden no estar cubiertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/jina-embeddings-v3-hf-mic
- Modelo base: https://huggingface.co/jinaai/jina-embeddings-v3-hf
- Manifest de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Provenance del fixture: `build.json` (en el repositorio)
- Explicación del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/jina-embeddings-v3-hf-mic.html
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de shrink: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
