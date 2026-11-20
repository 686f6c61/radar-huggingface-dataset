# huggingface-mic/blip-image-captioning-base-mic

## Resumen

`blip-image-captioning-base-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` como parte de un proyecto de verificación de integración de modelos con la librería Transformers. No es un modelo entrenado ni utilizable para captioning real: se trata de una versión reducida artificialmente del modelo `Salesforce/blip-image-captioning-base`, con la misma arquitectura y los mismos nombres de tensores, pero con solo 2.275.004 parámetros y pesos aleatorios (semilla 17).

El objetivo del repositorio es servir como fixture de test para validar que el pipeline de carga, tokenización y ejecución de BLIP en Transformers funciona correctamente con un checkpoint de arquitectura idéntica pero tamaño reducido. Incluye un manifiesto de contrato (`integration.json`), documentación de uso para Transformers y expectativas de framework, lo que lo convierte en una pieza de infraestructura de testing más que en un modelo de producción.

Por su naturaleza (pesos aleatorios, configuración reducida, etiqueta `test-artifact`), este repositorio no debe emplearse para inferencia real, generación de descripciones de imágenes ni ninguna tarea de visión-lenguaje. Es relevante únicamente para desarrolladores que trabajen en el ecosistema de testing de Transformers o que necesiten reproducir el fixture.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BLIP (`BlipForConditionalGeneration`), transformer multimodal vision-encoder + text-decoder |
| Parametros totales | 2.275.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es una instancia de `BlipForConditionalGeneration` con la configuración reducida mediante la regla genérica de `sweep.py`: `text num_hidden_layers = 2` y `vision num_hidden_layers = 2` (frente a las capas del modelo base original). Mantiene los mismos nombres de tensores que el checkpoint real `Salesforce/blip-image-captioning-base`, de modo que sirve como sustituto estructural en tests de integración.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato mueve los logits al menos 0,001 (la más débil, `pixel_values:halve`, con 0,00168). Los ficheros de procesador (`preprocessor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.txt`) se copiaron byte a byte desde `Salesforce/blip-image-captioning-base`. Los pesos son finitos en float32, bfloat16 y float16 (forward, loss y gradientes). El fixture se generó con `build_fixtures.py` y los detalles de procedencia, hashes y resultados de la puerta quedan registrados en `build.json`.

## Capacidades

- No tiene capacidades reales de generación de texto ni de captioning: los pesos son aleatorios y la configuración está reducida.
- Sirve como fixture de test para validar la carga de `BlipForConditionalGeneration` en Transformers.
- Permite verificar la compatibilidad de los ficheros de procesador y tokenizador copiados del modelo base.
- Valida el contrato de entradas y salidas definido en `integration.json`.
- Comprueba la estabilidad numérica en float32, bfloat16 y float16 (forward, loss, gradientes).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües reales.
- No dispone de modo thinking, visión funcional ni audio.

## Casos de uso

- Testing de integración en Transformers: usar el fixture para comprobar que el pipeline de carga de BLIP funciona sin descargar el checkpoint completo de Salesforce, reduciendo tiempo y ancho de banda en CI.
- Validación de contratos de modelo: ejecutar las expectativas de `integrations/transformers/expectations` contra el fixture para detectar regresiones en la API de Transformers.
- Pruebas de estabilidad numérica: verificar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 antes de aplicar cambios al código de BLIP.
- Reproducción de fixtures: regenerar el artefacto con `python example/build_fixtures.py --fixture blip-image-captioning-base-mic` para auditar la procedencia y los hashes registrados en `build.json`.
- Desarrollo de herramientas de "shrinking" de modelos: emplear el fixture como caso de referencia del algoritmo `sweep.py` para reducir otros checkpoints preservando nombres de tensores.
- Validación de tokenizador y preprocesador: comprobar que los ficheros copiados byte a byte desde el modelo base se cargan correctamente en el pipeline de Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de test con pesos aleatorios, cualquier métrica de calidad (MMLU, CIDEr, BLEU, etc.) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (2,27 M parámetros × 4 bytes ≈ 9 MB de pesos, más activaciones y buffers del procesador).
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 2060, RTX 3060, RTX 4090) o incluso CPU; no requiere acelerador dedicado.
- Cabe holgadamente en cualquier GPU consumer y en CPU.
- Opciones de despliegue: `transformers` (carga directa con `BlipForConditionalGeneration.from_pretrained`); no se ha validado con vLLM, llama.cpp, Ollama ni TGI, y su naturaleza de fixture hace que no tenga sentido desplegarlo en esos entornos.
- Latencia y throughput: no disponibles; no aplica al no ser un modelo funcional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/blip-image-captioning-base-mic` | 2,27 M | no disponible | Fixture de test (BLIP) | no disponible | Hugging Face |
| `Salesforce/blip-image-captioning-base` | no disponible en la informacion proporcionada | no disponible | Image captioning | no disponible en la informacion proporcionada | Hugging Face |
| `Salesforce/blip-image-captioning-large` | no disponible en la informacion proporcionada | no disponible | Image captioning | no disponible en la informacion proporcionada | Hugging Face |

La comparación relevante es exclusivamente con el modelo base del que deriva: mismo grafo computacional y mismos nombres de tensores, pero con capas de texto y visión reducidas a 2 y pesos aleatorios. Frente al checkpoint real, el fixture no es apto para producción.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen ningún significado semántico; no usar para captioning, generación ni ninguna tarea real.
- Configuración reducida (2 capas de texto y 2 de visión): la arquitectura no coincide en profundidad con el modelo base, aunque sí en nombres de tensores.
- Etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.
- Licencia no disponible: no se puede confirmar el régimen de uso comercial; en cualquier caso, no es un modelo funcional.
- Idiomas no disponibles: al no haber entrenamiento, no hay cobertura lingüística real.
- Riesgo de uso indebido: si se integra por error en un pipeline de producción, devolverá descripciones sin sentido.
- No se ha validado con frameworks de serving (vLLM, TGI, llama.cpp); su uso está pensado para `transformers` en entornos de test.
- El tamaño del repo es 0,0 GB, por lo que la descarga es trivial, pero no debe confundirse con un checkpoint ligero optimizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/blip-image-captioning-base-mic
- Modelo base: https://huggingface.co/Salesforce/blip-image-captioning-base
- Documentación de uso en Transformers: `integrations/transformers/usage.md` (dentro del repo)
- Expectativas de Transformers: `integrations/transformers/expectations` (dentro del repo)
- Manifiesto de contrato: `integration.json` (dentro del repo)
- Procedencia del fixture: `build.json` (dentro del repo)
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/blip-image-captioning-base-mic.html
- Script de reducción (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
