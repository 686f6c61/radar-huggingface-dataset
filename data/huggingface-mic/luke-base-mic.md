# huggingface-mic/luke-base-mic

## Resumen

`luke-base-mic` es un artefacto de prueba (test fixture) publicado por la organización `huggingface-mic`, derivado del modelo `studio-ousia/luke-base` de Studio Ousia. No es un modelo entrenado ni utilizable para inferencia real: se trata de una versión reducida artificialmente ("slim fixture") creada para validar contratos de integración con la librería Transformers. El repositorio incluye pesos reducidos, ejemplos de uso ejecutables y expectativas de framework en un único paquete.

El modelo base original, LUKE (Language Understanding with Knowledge-based Embeddings), es un transformer basado en BERT/RoBERTa que incorpora representaciones de entidades como ciudadanos de primera clase, orientado a tareas de comprensión del lenguaje con conocimiento. Sin embargo, esta ficha describe la variante `mic`, que conserva la arquitectura `LukeForMaskedLM` pero con solo 2 capas ocultas y pesos aleatorios (semilla 17), sin entrenamiento alguno.

Su relevancia es puramente técnica y de infraestructura: sirve para verificar que las integraciones de Transformers (tokenizador, procesador de entidades, carga de pesos, sensibilidad a entradas) funcionan correctamente sin necesidad de descargar el checkpoint completo. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo LUKE (`LukeForMaskedLM`), reducido a 2 capas ocultas |
| Parametros totales | 6.934.669 (segun safetensors); la model card menciona 10,2 M en su descripcion del fixture |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |
| Modelo base | studio-ousia/luke-base |
| Tamano del repositorio | 1,1 GB |
| Semilla de pesos | 17 (aleatorios) |
| Descargas | 2372 |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `LukeForMaskedLM` del checkpoint `studio-ousia/luke-base`, pero con una configuración reducida mediante la regla genérica de `sweep.py` (num_hidden_layers = 2). Conserva los mismos nombres de tensores que el checkpoint real; dado que el checkpoint original carece de `lm_head.decoder.weight`, el fixture también lo omite, de modo que la carga inicializa ese tensor igual que lo haría para un usuario real. Los ficheros del procesador (`added_tokens.json`, `entity_vocab.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `studio-ousia/luke-base`.

No hubo entrenamiento: los pesos son aleatorios (semilla 17) y se validaron mediante una "input-sensitivity gate" que exige que cualquier perturbación de las entradas del contrato mueva los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, alcanzó 0,00396). El fixture se guardó en float32 (el dtype por defecto de `studio-ousia/luke-base`) y se verificó que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave del fixture es `c9b636bf3b64` y cubre todos los checkpoints con ficheros de procesador idénticos en bytes y configuración coincidente tras el reducido.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen predicciones útiles.
- Replica la interfaz de `LukeForMaskedLM`, incluyendo el procesador de entidades de LUKE.
- Sirve para validar la carga de pesos, el tokenizador y el procesador de entidades en Transformers.
- Permite comprobar la sensibilidad de las entradas del contrato (perturbaciones mínimas en logits).
- Verificado para forward, loss y gradientes en float32, bfloat16 y float16.
- No soporta tool calling, agentes, razonamiento, visión ni capacidades multilingües reales.
- No disponible: generación de texto útil, código, matemáticas o cualquier tarea downstream.

## Casos de uso

- Pruebas de integración en CI/CD: usar el fixture para verificar que una nueva versión de Transformers carga correctamente `LukeForMaskedLM` sin descargar el checkpoint completo de 1,1 GB.
- Validación de tokenizador y procesador de entidades: comprobar que los ficheros copiados byte a byte (`entity_vocab.json`, `merges.txt`, etc.) se parsean correctamente en pipelines de preprocesamiento.
- Test de regresión de contratos: ejecutar la "input-sensitivity gate" para detectar cambios que rompan la propagación de gradientes o la forma de los logits.
- Desarrollo de herramientas de inspección de modelos: validar visores de arquitectura o comparadores de checkpoints contra un modelo de tamaño reducido con nombres de tensores realistas.
- Docencia y formación: ilustrar la estructura de un modelo LUKE y su procesador de entidades sin coste computacional ni de almacenamiento elevado.
- Depuración de carga en distintos dtypes: verificar que el pipeline funciona en float32, bfloat16 y float16 antes de pasar al checkpoint real.
- Validación de scripts de reconstrucción: comprobar que `build_fixtures.py --fixture luke-base-mic` regenera los ficheros esperados con los hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier métrica de calidad (MMLU, HumanEval, GSM8K, etc.) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 dado el tamaño reducido (6,9 M parámetros); no se han publicado mediciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; también funciona en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (carga estándar de `LukeForMaskedLM`); no se ha verificado compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia sería muy baja, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/luke-base-mic` | 6,9 M (fixture) | no disponible | Test fixture de integracion | no disponible | Hugging Face |
| `studio-ousia/luke-base` | no disponible en la informacion | no disponible | Modelo LUKE real para comprension del lenguaje | no disponible | Hugging Face |
| `studio-ousia/luke-large` | no disponible en la informacion | no disponible | Version grande de LUKE | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de parámetros de los modelos comparables en la información proporcionada, por lo que la comparación se limita a propósito y disponibilidad.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y las salidas no tienen significado semántico.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- Licencia no disponible: no se puede confirmar el uso comercial del artefacto ni del modelo base.
- Idiomas soportados no disponibles; no se debe asumir cobertura multilingüe.
- Longitud de contexto no disponible; la configuración reducida (2 capas) no refleja el comportamiento del checkpoint original.
- Riesgo de confusión: el nombre y la estructura pueden llevar a error si se trata como un modelo real de LUKE.
- No se ha verificado compatibilidad con frameworks de despliegue de alto rendimiento (vLLM, TGI, llama.cpp).
- El repositorio incluye solo los pesos reducidos, el uso y las expectativas de framework; otros ficheros deben regenerarse con `build_fixtures.py`.

## Enlaces

- [Hugging Face: huggingface-mic/luke-base-mic](https://huggingface.co/huggingface-mic/luke-base-mic)
- [Modelo base: studio-ousia/luke-base](https://huggingface.co/studio-ousia/luke-base)
- [Como se redujo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/luke-base-mic.html)
- [Repositorio transformers-mic (sweep.py)](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Script de construccion build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
- [Manifiesto de contrato (integration.json)](https://huggingface.co/huggingface-mic/luke-base-mic/blob/main/integration.json)
- [Uso en Transformers](https://huggingface.co/huggingface-mic/luke-base-mic/blob/main/integrations/transformers/usage.md)
- [Expectativas de Transformers](https://huggingface.co/huggingface-mic/luke-base-mic/tree/main/integrations/transformers/expectations)
- [Procedencia del fixture (build.json)](https://huggingface.co/huggingface-mic/luke-base-mic/blob/main/build.json)
