# huggingface-mic/codegen2-16B_P-mic

## Resumen

`codegen2-16B_P-mic` es un artefacto de prueba publicado por el usuario `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable: se trata de un *fixture* (pesos "slim" o reducidos) que reproduce la arquitectura, los nombres de tensores y los ficheros de procesador del modelo real `Salesforce/codegen2-16B_P` de Salesforce, pero con una configuración mucho menor (6,7 millones de parámetros) y pesos aleatorios (semilla 17). Su propósito es servir de base para pruebas de integración y validación de contratos de framework, no para generar código en producción.

El modelo base real, CodeGen2-16B_P, pertenece a la familia CodeGen2 de Salesforce, orientada a generación de código. Sin embargo, la información disponible en este repositorio no incluye detalles sobre el entrenamiento, el dataset ni los resultados de benchmarks del modelo original; solo se documenta el proceso de reducción del fixture.

La relevancia de esta ficha es limitada: el repositorio está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. Cualquier evaluación de capacidades, rendimiento o uso práctico debe remitirse al modelo original `Salesforce/codegen2-16B_P`, no a este artefacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CodeGenForCausalLM (transformer causal, según `configuration_codegen.py` copiado del modelo base) |
| Parámetros totales | 6.704.128 (fixture reducido); el modelo base declara 16B en su nombre |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos guardados en float32; se declara compatibilidad de ejecución en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture emplea la misma clase de arquitectura que el modelo base, `CodeGenForCausalLM`, un transformer causal para generación de texto/código. La reducción se realizó con la regla genérica de `sweep.py` del proyecto `transformers-mic`, manteniendo idénticos los nombres de todos los tensores respecto al checkpoint real y copiando byte a byte los ficheros de procesador (`added_tokens.json`, `configuration_codegen.py`, `merges.txt`, `modeling_codegen.py`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) de `Salesforce/codegen2-16B_P`.

No hubo entrenamiento: los pesos son aleatorios (semilla 17) y únicamente pasaron una puerta de sensibilidad a la entrada, en la que cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `input_ids:roll_batch`, alcanzó 1,04). Se verificó que el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO) del modelo original.

## Capacidades

- No es un modelo funcional: al tener pesos aleatorios, no genera código ni texto coherente.
- Sirve como fixture para validar la integración con Transformers (carga, forward, loss, gradientes) y para comprobar expectativas de framework documentadas en `integrations/transformers/expectations`.
- Reproduce el contrato de generación de texto de CodeGen2 a nivel de API (mismos ficheros de tokenizer y configuración).
- Verificado para ejecución en float32, bfloat16 y float16.
- No dispone de tool calling, capacidades de agente, multilingüismo ni modos especiales (thinking, visión, audio).
- No aplica razonamiento, matemáticas ni generación de código real.

## Casos de uso

- Pruebas de integración en CI: cargar el fixture con Transformers y verificar que el pipeline de `CodeGenForCausalLM` se instancia y ejecuta sin errores, sin coste de descarga de 16B parámetros.
- Validación de contratos de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen (nombres de tensores, formas, dtypes).
- Desarrollo de tooling de serialización: probar flujos de guardado/carga en safetensors y conversión entre dtypes (float32, bfloat16, float16) con un modelo diminuto.
- Test de regresión de tokenizer: al copiar byte a byte los ficheros de tokenizer del modelo base, permite validar la tokenización sin cargar el checkpoint completo.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture codegen2-16B_P-mic` y comparar hashes registrados en `build.json`.
- Docencia y demos de arquitectura: inspeccionar la estructura de un transformer causal CodeGen con un número reducido de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas de generación de código, y al tratarse de un fixture con pesos aleatorios, cualquier benchmark carecería de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (6,7M parámetros × 4 bytes ≈ 27 MB de pesos, más activaciones y overhead del runtime).
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM; también ejecutable en CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (carga directa con `AutoModelForCausalLM` y `trust_remote_code=True` por el `custom_code`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un modelo diminuto, la latencia estará dominada por el overhead del framework más que por el cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `huggingface-mic/codegen2-16B_P-mic` | 6,7M (fixture) | no disponible | no disponible | Artefacto de prueba |
| `Salesforce/codegen2-16B_P` | 16B (según nombre; no verificado en esta información) | no disponible | no disponible | Generación de código (modelo real) |
| Otros fixtures `*-mic` del proyecto `transformers-mic` | Variable (reducidos) | no disponible | no disponible | Artefactos de prueba |

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce salidas coherentes; no debe usarse para inferencia real ni en producción.
- Etiquetado como `test-artifact`: excluido intencionadamente de búsquedas de modelos candidatos; no es un sustituto del modelo base.
- Licencia no especificada: no se puede confirmar el uso comercial; debe consultarse la licencia de `Salesforce/codegen2-16B_P` para cualquier uso derivado.
- Idiomas no declarados: no hay información sobre cobertura lingüística.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en secuencias largas.
- Riesgo de confusión: el nombre incluye "16B" pero el artefacto tiene 6,7M parámetros; verificar siempre el tamaño real antes de desplegar.
- Dependencia de `custom_code`: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; revisar `modeling_codegen.py` antes de usarlo en entornos sensibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/codegen2-16B_P-mic
- Modelo base: https://huggingface.co/Salesforce/codegen2-16B_P
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/codegen2-16B_P-mic.html
- Script de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
