# huggingface-mic/distilbert-base-uncased-mic

## Resumen

`distilbert-base-uncased-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable: es un "fixture" (muestra sintetica) generado a partir de `distilbert/distilbert-base-uncased` con el objetivo de servir como caso de prueba reproducible para validar flujos de integracion con Transformers. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos a produccion.

El repositorio contiene pesos "adelgazados" (slim weights), ejemplos de uso ejecutables y un directorio de expectativas del framework, todo empaquetado bajo un contrato de integracion (`integration.json`). La arquitectura subyacente es DistilBERT para `fill-mask` (`DistilBertForMaskedLM`), pero con una configuracion reducida hasta los 2.088.058 parametros y pesos inicializados aleatoriamente con semilla 17. No se ha realizado ningun entrenamiento.

Su relevancia es puramente de ingenieria de software: permite a los equipos de Hugging Face (y a terceros que quieran replicar el contrato) verificar que las herramientas, tokenizadores y expectativas de inferencia funcionan correctamente sin necesidad de descargar ni ejecutar el checkpoint original de 66 millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (`DistilBertForMaskedLM`), transformer encoder de tipo BERT destilado |
| Parametros totales | 2.088.058 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la config esta reducida; no se documenta el max_position_embeddings del fixture) |
| Tipos de cuantizacion | no aplica; pesos guardados en float32. Verificado finito en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible (hereda el tokenizador `uncased` de DistilBERT, pero no se declara soporte) |
| Licencia | no disponible (el fichero `LICENSE` se copia byte a byte del modelo base, pero no se especifica en la informacion proporcionada) |
| Formato de pesos | safetensors |
| Modelo base | `distilbert/distilbert-base-uncased` |
| Seed de inicializacion | 17 (pesos aleatorios) |
| Clave de fixture | `b55d2b6ed67b` |
| Tarea | fill-mask |

## Arquitectura y entrenamiento

El modelo replica la arquitectura de DistilBERT, un transformer encoder de tipo BERT con 6 capas en la version original (destilado de BERT-base), pero con la configuracion reducida mediante la regla generica de `sweep.py` del repositorio `huggingface/transformers-mic`. Mantiene los mismos nombres de tensores que el checkpoint real, lo que garantiza compatibilidad a nivel de carga. Los ficheros del procesador (`LICENSE`, `tokenizer.json`, `tokenizer_config.json`, `vocab.txt`) se copian byte a byte desde `distilbert/distilbert-base-uncased`.

No hay entrenamiento. Los pesos son aleatorios (semilla 17) y pasaron una "input-sensitivity gate": cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, dio 0,00443). Esto se usa unicamente para verificar que el grafo computacional responde a las entradas, no para producir predicciones utiles. El modelo se guarda en float32, el dtype por defecto de carga del checkpoint base, y se ha comprobado que es finito (forward, loss y gradientes) en float32, bfloat16 y float16. El `build.json` registra las fuentes fijadas, los resultados de las gates y los hashes de los ficheros.

## Capacidades

- Carga y ejecucion como `DistilBertForMaskedLM` en el pipeline `fill-mask` de Transformers.
- Compatibilidad de nombres de tensores con el checkpoint original, lo que permite validar flujos de carga y serializacion.
- Verificacion de expectativas del framework: el directorio `integrations/transformers/expectations` contiene los valores esperados para comparar.
- Ejecutable end-to-end mediante el ejemplo de uso en `integrations/transformers/usage.md`.
- No ofrece capacidades generativas, de razonamiento, codigo, matematicas, vision ni audio: los pesos son aleatorios.
- No soporta tool calling, function calling, agentes ni multi-step reasoning.
- El tokenizador heredado es `uncased` en ingles, pero el fixture no declara capacidades multilingues.
- No dispone de thinking mode ni decodificacion especulativa.

## Casos de uso

- Pruebas de integracion de Transformers: usar el fixture para verificar que la carga de un `DistilBertForMaskedLM` desde safetensors funciona y produce la salida esperada segun `integrations/transformers/expectations`.
- Validacion de pipelines CI/CD: integrar el fixture en tests automatizados sin depender del checkpoint original de 66M de parametros, reduciendo tiempo de descarga y coste de computo.
- Verificacion de contratos de framework: comprobar que una nueva version de Transformers sigue respetando el contrato definido en `integration.json` (nombres de tensores, formas, dtypes y respuesta a entradas).
- Regression testing de tokenizadores: al copiar los ficheros del procesador byte a byte, permite validar la tokenizacion de `uncased` sin variaciones.
- Pruebas de tolerancia numerica: ejecutar el modelo en float32, bfloat16 y float16 para verificar que librerias de inferencia mantienen resultados finitos en todos los dtypes soportados.
- Desarrollo de herramientas de auditoria de modelos: servir como muestra minima y reproducible para probar escaneres de safetensors, inventarios de parametros o sistemas de deteccion de artefactos de test.
- Validacion de reglas de "shrink" (reduccion) de configuraciones: comprobar que la regla generica de `sweep.py` produce configuraciones que cargan y ejecutan correctamente en el framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que es un artefacto de prueba con pesos aleatorios y que no debe usarse como modelo candidato; cualquier metrica de calidad (MMLU, GLUE, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (2,09M de parametros); practicamente despreciable en cualquier GPU consumer o incluso en CPU.
- GPU recomendadas: ninguna en particular; funciona en cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) sin aprovechar su capacidad.
- Cabe en cualquier GPU consumer (incluso integradas) y en CPU; tambien en entornos con poca memoria.
- Opciones de despliegue: Transformers (via `AutoModelForMaskedLM` o `DistilBertForMaskedLM`), y potencialmente llama.cpp u otros runtimes si se convierte a GGUF, aunque no se documenta esa conversion en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un fixture, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `distilbert-base-uncased-mic` (este) | 2,09M | no disponible | Fixture de test | no disponible | Hugging Face |
| `distilbert/distilbert-base-uncased` | ~66M | 512 tokens (tipico en DistilBERT) | Modelo real preentrenado para fill-mask | Apache 2.0 (segun el modelo base original; verificar en el repo) | Hugging Face |
| `bert-base-uncased` | ~110M | 512 tokens | Modelo real preentrenado (BERT base) | Apache 2.0 (original) | Hugging Face |

La comparativa es puramente estructural: el fixture no compite en calidad ni rendimiento con los modelos reales. Cualquier uso que requiera predicciones reales debe recurrir a `distilbert-base-uncased` o equivalente.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado linguistico; no usar para inferencia real.
- Es un artefacto de test etiquetado `test-artifact`; no debe incluirse en catalogos de modelos candidatos ni en selecciones automaticas por similitud.
- Configuracion reducida: no representa fielmente el comportamiento numerico del checkpoint original de DistilBERT.
- Licencia no disponible en la informacion proporcionada: verificar el fichero `LICENSE` del repositorio antes de cualquier uso, aunque se copia byte a byte del modelo base.
- Idiomas no declarados: el tokenizador es `uncased` (orientado a ingles), pero no hay soporte multilingue garantizado.
- Riesgo de confusion: el nombre incluye "distilbert-base-uncased", lo que puede llevar a descargarlo por error pensando que es el modelo real; revisar siempre la etiqueta `test-artifact`.
- No apto para produccion: cualquier despliegue que dependa de predicciones reales fallara.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las salidas de `fill-mask` seran tokens aleatorios sin coherencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/distilbert-base-uncased-mic
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Explicacion del proceso de reduccion (shrink): https://huggingface-mic-mic-coverage.static.hf.space/shrink/distilbert-base-uncased-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de generacion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto del contrato (en el repo): `integration.json`
- Uso con Transformers (en el repo): `integrations/transformers/usage.md`
- Expectativas de Transformers (en el repo): `integrations/transformers/expectations`
- Procedencia del fixture (en el repo): `build.json`
