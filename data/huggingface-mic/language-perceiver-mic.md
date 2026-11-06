# huggingface-mic/language-perceiver-mic

## Resumen

`huggingface-mic/language-perceiver-mic` es un artefacto de prueba (fixture) publicado por el equipo `huggingface-mic` para el proyecto Transformers MIC. No es un modelo entrenado ni utilizable en producción: se trata de una versión "slim" del checkpoint `deepmind/language-perceiver` con la misma arquitectura (`PerceiverForMaskedLM`) pero con una configuración reducida y pesos aleatorios (semilla 17). Su propósito es servir como fixture de integración para validar contratos de uso y expectativas de framework (Transformers) en pipelines de CI.

El modelo conserva los nombres de tensores del checkpoint original y los ficheros de procesador copiados byte a byte (`special_tokens_map.json`, `tokenizer_config.json`), lo que permite ejecutar pruebas de forward, pérdida y gradientes sin necesidad de descargar los pesos reales. Con 194.113.286 parámetros y un tamaño de repositorio de 0,8 GB, está guardado en float32 y es finito en float32, bfloat16 y float16.

Es relevante únicamente en el contexto de ingeniería de software: automatización de tests de integración, verificación de contratos de API de Transformers y reproducción de fixtures. Cualquier uso como modelo de lenguaje real carece de sentido, ya que los pesos son aleatorios y el autor lo etiqueta explícitamente como `test-artifact`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (PerceiverForMaskedLM) |
| Parametros totales | 194.113.286 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; finito en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Perceiver para enmascarado de lenguaje (`PerceiverForMaskedLM`), el mismo tipo de modelo que `deepmind/language-perceiver`. El Perceiver emplea un mecanismo de atención cruzada entre un conjunto latente de tamaño fijo y las entradas, lo que en teoría permite escalar a secuencias muy largas sin un coste cuadrático en la longitud de entrada. Sin embargo, la configuración de este fixture está reducida mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`, por lo que las dimensiones reales (número de latentes, capas, dimensión oculta) no se detallan en la información disponible.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se generaron para superar una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, con 0,106). Los ficheros de procesador se copiaron byte a byte desde `deepmind/language-perceiver`. El `build.json` del repositorio registra las fuentes fijadas, los resultados de la puerta y los hashes de los ficheros.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de integración para validar el contrato de `PerceiverForMaskedLM` en Transformers.
- Permite ejecutar forward pass, cálculo de pérdida y gradientes en float32, bfloat16 y float16.
- Conserva los nombres de tensores del checkpoint original, lo que facilita pruebas de carga y compatibilidad.
- Incluye ficheros de procesador idénticos a los del modelo base (`special_tokens_map.json`, `tokenizer_config.json`).
- No dispone de tool calling, agentes, visión, audio ni modo de razonamiento.
- El soporte multilingüe no está documentado en la información disponible.

## Casos de uso

- Tests de integración en CI: el fixture permite cargar un `PerceiverForMaskedLM` real en estructura sin descargar los 0,8 GB del checkpoint completo ni depender de pesos entrenados, reduciendo el tiempo y el coste de las pruebas.
- Validación de contratos de Transformers: el directorio `integrations/transformers/expectations` define las salidas esperadas del framework, y el fixture se usa para comprobar que una versión de Transformers sigue cumpliendo el contrato.
- Pruebas de dtype: al ser finito en float32, bfloat16 y float16, permite verificar que las rutas de cómputo en precisión reducida no producen NaN ni infinitos.
- Verificación de gradientes: útil para comprobar que el grafo de autograd del modelo se construye correctamente y que los gradientes fluyen por todos los parámetros.
- Reproducibilidad de fixtures: `build.json` y `build_fixtures.py` permiten reconstruir el artefacto y auditar hashes, lo que encaja en pipelines de validación reproducible.
- Pruebas de tokenizer: al copiar byte a byte los ficheros de procesador del modelo base, se puede validar la integración del tokenizer sin cargar el modelo real.
- Desarrollo de herramientas de inspección de modelos: útil para probar utilidades que leen safetensors, cuentan parámetros o comparan nombres de tensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, los benchmarks no serían significativos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB en float32 (194,1 M de parámetros × 4 bytes), más overhead de activaciones.
- Cabe en cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060).
- GPU recomendadas: no aplica para producción; cualquier GPU o incluso CPU es suficiente para ejecutar el fixture en tests.
- Despliegue: no está pensado para vLLM, TGI, Ollama ni llama.cpp; su uso previsto es mediante Transformers en entornos de test.
- Latencia y throughput: no disponibles; irrelevantes para un fixture de pruebas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/language-perceiver-mic | 194,1 M | no disponible | Fixture de test | no disponible | Hugging Face |
| deepmind/language-perceiver | no disponible en la informacion | no disponible | Modelo Perceiver para MLM | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable | no aplica | Fixtures de integracion | no disponible | Hugging Face |

La comparación relevante es con `deepmind/language-perceiver`, del que este artefacto deriva: comparte arquitectura, nombres de tensores y ficheros de procesador, pero se diferencia en que tiene configuración reducida y pesos aleatorios. No se dispone de datos de parámetros ni contexto del modelo base en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene valor semántico.
- Etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.
- La licencia no está disponible, lo que impide evaluar restricciones de uso comercial; en cualquier caso, no procede su uso comercial.
- La configuración reducida no refleja las dimensiones del modelo original, por lo que los resultados de rendimiento o memoria no son extrapolables.
- No hay información sobre sesgos, alucinación o cobertura idiomática porque no ha sido entrenado.
- Los ficheros de procesador copiados pueden quedar desactualizados si el modelo base los modifica.
- El repositorio incluye solo los pesos slim, el uso y las expectativas de framework; otros ficheros deben regenerarse con `build_fixtures.py`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/language-perceiver-mic
- Modelo base: https://huggingface.co/deepmind/language-perceiver
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/language-perceiver-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/language-perceiver-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/language-perceiver-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/language-perceiver-mic/blob/main/build.json
- Explicación del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/language-perceiver-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Script de sweep: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
