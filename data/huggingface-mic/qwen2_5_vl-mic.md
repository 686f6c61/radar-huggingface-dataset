# huggingface-mic/qwen2_5_vl-mic

## Resumen

`qwen2_5_vl-mic` es un artefacto de prueba (test artifact) publicado por el usuario `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni utilizable para inferencia real: es un "fixture" derivado de `Qwen/Qwen2.5-VL-3B-Instruct` mediante un proceso de reduccion (shrinking) de la configuracion, conservando la misma arquitectura (`Qwen2_5_VLForConditionalGeneration`) pero con solo 2 capas ocultas en el componente de texto y pesos aleatorios generados con semilla 17.

El repositorio tiene como objetivo empaquetar en un unico lugar los pesos reducidos, ejemplos de uso ejecutables y las expectativas de integracion con frameworks (concretamente Transformers). Sirve como fixture de testing para validar pipelines de integracion, no como modelo de produccion. El modelo base real es el modelo vision-lenguaje Qwen2.5-VL-3B-Instruct de Alibaba Qwen, de aproximadamente 3.000 millones de parametros.

La relevancia de esta ficha es acotada: el artefacto permite a desarrolladores reproducir pruebas de integracion con una huella minima (11,3 millones de parametros) manteniendo nombres de tensores, procesador y plantilla de chat identicos al checkpoint original. Cualquier uso como modelo generativo, de razonamiento o vision producira salidas sin sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2_5_VLForConditionalGeneration (transformer vision-lenguaje, configuracion reducida a 2 capas de texto) |
| Parametros totales | 11.289.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config del modelo base, no verificada en este artefacto) |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero LICENSE se copia byte a byte del modelo base, pero la licencia no se declara explicitamente en los metadatos) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El artefacto replica la arquitectura del modelo base `Qwen/Qwen2.5-VL-3B-Instruct`, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. La unica diferencia estructural es la reduccion del numero de capas ocultas del componente de texto a 2 (frente a la configuracion completa del modelo de 3B). Los ficheros del procesador (tokenizer, `preprocessor_config.json`, `chat_template.json`, `generation_config.json`, `merges.txt`, `vocab.json`) se copian byte a byte del checkpoint original, de modo que el contrato de entrada y el formato de tokens son identicos.

No hay entrenamiento. Los pesos son aleatorios, generados con semilla 17, y se validaron mediante un "input-sensitivity gate": cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (la perturbacion mas debil, `pixel_values:halve`, produce 0,0718). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 (forward, loss y gradientes). El proceso de reduccion se documenta en `sweep.py` del repositorio `transformers-mic`.

## Capacidades

- No es un modelo funcional: no genera texto, razonamiento, codigo, matematicas ni descripciones de imagen con sentido.
- Reproduce el contrato de entrada del modelo base (procesador de imagen y texto, plantilla de chat).
- Mantiene los nombres de tensores del checkpoint original, lo que permite validar cargas de pesos y mapeos de estado.
- Sirve como fixture para pruebas de integracion con Transformers.
- No soporta tool calling, agentes ni razonamiento multi-paso de forma util.
- No dispone de capacidades multilingues reales (los pesos son aleatorios).
- No incorpora modo thinking, vision funcional ni audio.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el modelo con `Qwen2_5_VLForConditionalGeneration` y verificar que el pipeline de carga, el procesador y la plantilla de chat funcionan sin errores, con una huella de 11,3 M de parametros.
- Validacion de mapeos de pesos: comprobar que los nombres de tensores del checkpoint real coinciden con los del fixture antes de desplegar el modelo de 3B en produccion.
- Tests de CI/CD: ejecutar pruebas de humo en pipelines de integracion continua sin necesidad de descargar los pesos completos del modelo de 3B.
- Verificacion de dtypes: validar que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16.
- Pruebas de contrato de entradas multimodales: comprobar que perturbaciones en `pixel_values` y en las entradas de texto producen cambios en los logits por encima del umbral definido.
- Desarrollo de herramientas de empaquetado: usar el repositorio como referencia para construir fixtures propios con `build_fixtures.py`.
- Validacion de plantillas de chat: verificar que `chat_template.json` y `generation_config.json` se cargan correctamente en el framework antes de migrar al checkpoint real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto es un fixture de prueba con pesos aleatorios y no produce salidas evaluables.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 (11,3 M de parametros), aunque el codificador visual y el procesador pueden anadir overhead.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: Transformers (uso previsto segun la model card); vLLM, llama.cpp, Ollama y TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles; no aplica al ser un fixture de prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2_5_vl-mic | 11,3 M | no disponible | Fixture de prueba | no disponible | Hugging Face |
| Qwen/Qwen2.5-VL-3B-Instruct | ~3.000 M | no disponible en esta ficha | Modelo vision-lenguaje real | no disponible en esta ficha | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable | no disponible | Fixtures de prueba | no disponible | Hugging Face |

La comparativa con modelos de la misma categoria (modelos vision-lenguaje de 3B) no es significativa porque el artefacto no es un modelo funcional. La unica comparacion valida es con el checkpoint base del que deriva.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas carecen de sentido.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no se declara explicitamente en los metadatos; el fichero LICENSE se copia del modelo base, pero conviene verificar los terminos del checkpoint original antes de cualquier uso.
- Los idiomas soportados no se declaran; el tokenizer se hereda del modelo base pero no hay capacidades linguisticas reales.
- La longitud de contexto no se verifica en este artefacto; la configuracion reducida puede alterar el comportamiento esperado.
- Riesgo de confusion: el nombre y la estructura pueden llevar a error si se confunde con el modelo Qwen2.5-VL-3B-Instruct real.
- No apto para benchmarks, evaluaciones de calidad ni comparativas de rendimiento.
- Uso comercial: no recomendado ni documentado; consultar la licencia del modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/qwen2_5_vl-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen2_5_vl-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
