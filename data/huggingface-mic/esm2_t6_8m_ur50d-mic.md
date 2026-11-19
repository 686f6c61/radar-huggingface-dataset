# huggingface-mic/esm2_t6_8M_UR50D-mic

## Resumen

`huggingface-mic/esm2_t6_8M_UR50D-mic` es un artefacto de prueba (fixture) derivado de `facebook/esm2_t6_8M_UR50D`, el modelo de lenguaje de proteinas ESM-2 de Meta AI. Lo publica la organizacion `huggingface-mic` como parte de su infraestructura de validacion de integraciones con frameworks, con la etiqueta explicita `test-artifact`. No es un modelo entrenado para uso real: es una copia reducida y verificable del checkpoint original, pensada para comprobar que las expectativas de ejecucion (Transformers, tokenizador, mascaras de atencion) se cumplen de forma reproducible.

El modelo conserva la arquitectura `EsmForMaskedLM` y los pesos entrenados originales, con 7.512.482 parametros en float32. Al estar por debajo del umbral de 20M parametros que la herramienta de recorte considera "fuente completa", no se aplico reduccion sobre los tensores: se mantienen los nombres y valores del checkpoint de Facebook, y solo se copian byte a byte los ficheros del procesador (`special_tokens_map.json`, `tokenizer_config.json`, `vocab.txt`).

Su relevancia es, por tanto, instrumental: sirve como caso de prueba para pipelines de integracion continua que verifican contratos de modelos en Hugging Face, no como base para tareas de biologia computacional en produccion. La model card advierte explicitamente de que no es un modelo usable y de que debe quedar fuera de las busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `EsmForMaskedLM` (transformer encoder de ESM-2, masked language modeling) |
| Parametros totales | 7.512.482 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; pesos guardados en float32, con verificacion de finitud en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible (modelo de secuencias de proteinas, no de lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es la de ESM-2 en su variante `esm2_t6_8M_UR50D`: un transformer encoder de 6 capas orientado a masked language modeling sobre secuencias de aminoacidos (vocabulario UR50D). El modelo base fue entrenado por Meta AI sobre proteinas; este artefacto no introduce entrenamiento adicional, sino que reutiliza los pesos entrenados del checkpoint original sin modificacion.

La innovacion tecnica de este repositorio no esta en el modelo, sino en el proceso de construccion del fixture. Segun la model card, el checkpoint se conserva entero porque sus 7.5M parametros estan por debajo del umbral de 20M que activa el recorte; los ficheros del procesador se copian byte a byte; los nombres de tensor coinciden con el checkpoint real; y el artefacto pasa una compuerta de sensibilidad a la entrada (la mas debil, `attention_mask:all_ones`, con valor 20.7). El build queda registrado en `build.json` con fuentes fijadas, resultados de las compuertas y hashes de ficheros, y se genera con `build_fixtures.py` del repositorio `huggingface/transformers-mic`.

## Capacidades

- Masked language modeling sobre secuencias de proteinas, heredado del checkpoint `facebook/esm2_t6_8M_UR50D`.
- Tokenizacion UR50D con los ficheros de procesador copiados del modelo original.
- Ejecucion verificada en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- Nombres de tensor identicos al checkpoint real, lo que permite sustituirlo en pruebas de integracion.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de chat ni un LLM de proposito general.
- No tiene capacidades de vision, audio ni thinking mode.
- No esta pensado para inferencia en produccion: la propia model card lo etiqueta como `test-artifact`.

## Casos de uso

- Pruebas de integracion con Transformers: cargar el modelo con `AutoModelForMaskedLM` y verificar que el pipeline de `esm` funciona de extremo a extremo sin descargar el checkpoint completo.
- Validacion de contratos de modelo en CI: el directorio `integrations/transformers/expectations` y el manifiesto `integration.json` permiten comprobar que las expectativas declaradas (formas de entrada, dtypes, salidas) se cumplen en cada version del framework.
- Pruebas de robustez numerica: al estar verificado como finito en float32, bfloat16 y float16, sirve para detectar regresiones de precision en kernels y capas de atencion.
- Desarrollo de herramientas de recorte de modelos: el repositorio documenta como se genero el fixture y enlaza al proceso de "shrink", lo que lo convierte en referencia para construir fixtures similares.
- Verificacion de tokenizadores: los ficheros `vocab.txt`, `special_tokens_map.json` y `tokenizer_config.json` son identicos al original, utiles para probar cargas de tokenizador sin ambiguedad.
- Docencia y demostraciones: permite mostrar el flujo de un modelo de proteinas con un peso de descarga minimo (el repo ocupa 0.0 GB segun la metadata).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (7.5M parametros); aproximadamente 15 MB en float16. Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con memoria compartida.
- GPU recomendadas: no aplica para produccion; cualquier GPU o incluso CPU es suficiente para ejecutar el fixture.
- Cabe en consumer GPU: si, sin restricciones practicas.
- Opciones de despliegue: Transformers (via `AutoModelForMaskedLM`), siguiendo `integrations/transformers/usage.md`. No hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI, y en cualquier caso no tendria sentido desplegarlo en produccion.
- Latencia y throughput: no disponibles; al ser un fixture de 7.5M parametros, la latencia seria del orden de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `huggingface-mic/esm2_t6_8M_UR50D-mic` | 7.512.482 | no disponible | Fixture de prueba | no disponible | Validacion de integraciones |
| `facebook/esm2_t6_8M_UR50D` | ~8M | no disponible | Modelo de proteinas | no disponible | Embeddings y MLM de proteinas |
| `facebook/esm2_t12_35M_UR50D` | ~35M | no disponible | Modelo de proteinas | no disponible | Embeddings y MLM de proteinas |
| `facebook/esm2_t33_650M_UR50D` | ~650M | no disponible | Modelo de proteinas | no disponible | Embeddings y MLM de proteinas |

La comparacion relevante es con el checkpoint original de Facebook: este artefacto replica sus pesos y su tokenizador, pero se distribuye como fixture de test y no como modelo utilizable. Frente a las variantes mayores de ESM-2, la diferencia es de escala (8M frente a 35M o 650M parametros) y de proposito.

## Limitaciones y advertencias

- No es un modelo usable: la model card lo declara explicitamente como `test-artifact` y pide mantenerlo fuera de las busquedas de modelos candidatos.
- Licencia no disponible: no se puede confirmar si permite uso comercial; al derivar de un checkpoint de Meta, habria que consultar la licencia del modelo base.
- Riesgo de alucinacion: no aplica en el sentido de LLM, pero al ser un modelo de proteinas de 8M parametros, sus predicciones de MLM tendrian una calidad limitada incluso en el checkpoint original.
- Limitaciones de contexto e idioma: no se documentan longitudes maximas de secuencia ni idiomas; el vocabulario es UR50D (aminoacidos), no lenguaje natural.
- No soporta tareas generativas, de chat ni de agentes; su unica tarea es masked language modeling.
- El repositorio no incluye todos los ficheros del build: la model card indica que el resto debe regenerarse con `python example/build_fixtures.py --fixture esm2_t6_8M_UR50D-mic`.
- Cualquier uso en produccion de biologia computacional deberia hacerse con `facebook/esm2_t6_8M_UR50D` o variantes mayores, no con este fixture.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/esm2_t6_8M_UR50D-mic
- Modelo base: https://huggingface.co/facebook/esm2_t6_8M_UR50D
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/esm2_t6_8M_UR50D-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/esm2_t6_8M_UR50D-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/esm2_t6_8M_UR50D-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/esm2_t6_8M_UR50D-mic/blob/main/build.json
- Proceso de recorte: https://huggingface-mic-mic-coverage.static.hf.space/shrink/esm2_t6_8M_UR50D-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
