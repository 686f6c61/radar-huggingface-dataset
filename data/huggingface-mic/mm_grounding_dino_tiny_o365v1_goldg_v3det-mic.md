# huggingface-mic/mm_grounding_dino_tiny_o365v1_goldg_v3det-mic

## Resumen

`mm_grounding_dino_tiny_o365v1_goldg_v3det-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` para validar la integracion del modelo `MMGroundingDinoForObjectDetection` en el ecosistema Transformers. No es un modelo entrenado ni utilizable en produccion: sus pesos son aleatorios (semilla 17) y su unico proposito es servir como banco de pruebas reproducible para frameworks, pipelines de integracion continua y validacion de contratos de API. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

El modelo replica la arquitectura del checkpoint original `openmmlab-community/mm_grounding_dino_tiny_o365v1_goldg_v3det`, un detector de objetos zero-shot basado en Grounding DINO con backbone Tiny, pero con una configuracion reducida de forma generica: 2 capas de encoder, 2 de decoder, 2 capas en el backbone y 2 capas en el codificador de texto. El resultado es un modelo de 7.722.970 parametros (7,7 M) guardado en float32, con los mismos nombres de tensores que el checkpoint real, lo que permite validar codigo de carga, preprocesado y forward pass sin descargar los pesos completos.

Su relevancia es puramente de ingenieria: facilita pruebas de regresion en Transformers, verificacion de contratos de entrada/salida y validacion de estabilidad numerica en float32, bfloat16 y float16. Cualquier evaluacion de capacidades reales de deteccion debe hacerse sobre el modelo base, no sobre este fixture.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MM Grounding DINO (detector de objetos zero-shot, transformer encoder-decoder con backbone visual y codificador de texto) |
| Parametros totales | 7.722.970 (7,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; el texto se procesa con tokenizer BERT-like, sin contexto generativo) |
| Tipos de cuantizacion | no disponible (pesos en float32; validado tambien en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |
| Modelo base | openmmlab-community/mm_grounding_dino_tiny_o365v1_goldg_v3det |
| Tipo de artefacto | fixture de prueba (`test-artifact`), pesos aleatorios (semilla 17) |
| Configuracion reducida | encoder_layers 2, decoder_layers 2, backbone num_layers 2, text num_hidden_layers 2 |
| Clave de fixture | `9205c76175d8` |
| Descargas | 2422 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es `MMGroundingDinoForObjectDetection`, la implementacion en Transformers del modelo MM Grounding DINO (variante multimodal de Grounding DINO orientada a deteccion abierta de vocabulario). Combina un backbone visual convolucional (Tiny, reducido a 2 capas en este fixture), un codificador de texto tipo BERT (reducido a 2 capas), un encoder transformer de fusion (2 capas) y un decoder transformer (2 capas) que produce las cajas y las puntuaciones de similitud texto-imagen.

No ha habido entrenamiento. Los pesos se generaron aleatoriamente con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la perturbacion mas debil, `pixel_values:halve`, produce un desplazamiento de 1,75). Los ficheros de procesador (`preprocessor_config.json`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.txt`) se copiaron byte a byte desde el checkpoint original. El modelo se guardo en float32, el dtype por defecto del checkpoint base, y se verifico que es finito en forward, loss y gradientes en float32, bfloat16 y float16. Los nombres de tensores coinciden exactamente con los del checkpoint real, lo que permite intercambiar pesos sin cambiar el codigo de carga.

## Capacidades

- Deteccion de objetos zero-shot con vocabulario abierto (arquitectura Grounding DINO), replicada a nivel estructural pero no funcional por los pesos aleatorios.
- Carga y ejecucion en Transformers mediante `MMGroundingDinoForObjectDetection`, con los mismos nombres de tensores que el checkpoint real.
- Validacion de contratos de entrada/salida: el repositorio incluye `integration.json` (manifiesto de contrato) y un directorio `integrations/transformers/expectations` con las expectativas del framework.
- Pruebas de estabilidad numerica en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- Verificacion de preprocesado y tokenizer con ficheros copiados byte a byte del modelo base.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingues ni de thinking mode; no aplica.
- Sensibilidad a la entrada garantizada por la puerta de validacion (desplazamiento minimo de logits de 0,001 ante perturbaciones).

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `MMGroundingDinoForObjectDetection` para verificar que la clase, el processor y el tokenizer funcionan sin descargar el checkpoint completo de 7,7 M de parametros reales.
- Validacion de contratos de API: usar `integration.json` y `integrations/transformers/expectations` para comprobar que una nueva version del framework respeta las firmas y formas de tensor esperadas.
- CI/CD para pipelines de vision: ejecutar tests de humo en cada commit sin depender de pesos entrenados ni de descargas grandes, gracias a que el repo ocupa 0,0 GB.
- Pruebas de precision numerica: verificar que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16 antes de desplegar cambios en el codigo del modelo.
- Desarrollo de utilidades de preprocesado: validar transformaciones de imagen y tokenizacion de prompts contra los ficheros de procesador copiados del modelo base.
- Reproduccion de fixtures: regenerar el artefacto con `python example/build_fixtures.py --fixture mm_grounding_dino_tiny_o365v1_goldg_v3det-mic` para auditar procedencia y hashes.
- Verificacion de compatibilidad de checkpoints: comprobar que un codigo de carga tolera los mismos nombres de tensores que el checkpoint real antes de migrar a el.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de deteccion (mAP, recall) carece de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (7,7 M de parametros, aproximadamente 31 MB de pesos mas activaciones minimas); en float16 o bfloat16, aproximadamente 15 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien ejecutable en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (principal), con soporte de ejecucion en CPU y GPU; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de objetos).
- Latencia y throughput: no disponibles; al ser un modelo diminuto con pesos aleatorios, las mediciones no serian representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mm_grounding_dino_tiny_o365v1_goldg_v3det-mic (este) | 7,7 M | no aplica | Fixture de prueba | no disponible | Hugging Face |
| openmmlab-community/mm_grounding_dino_tiny_o365v1_goldg_v3det | no disponible en la informacion | no aplica | Deteccion zero-shot | no disponible | Hugging Face |
| huggingface-mic/mm_grounding_dino_tiny_o365v1_goldg_v3det-mic (referencia citada en la model card) | no disponible en la informacion | no aplica | Fixture de prueba | no disponible | Hugging Face |

No se dispone de datos de otros detectores comparables (por ejemplo, variantes de Grounding DINO o DINO-X) en la informacion proporcionada; no se inventan cifras.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no detecta objetos reales; cualquier salida es ruido estadistico y no debe interpretarse como prediccion.
- Artefacto de prueba: etiquetado `test-artifact` por el autor para excluirlo de busquedas de modelos candidatos; no debe usarse en produccion ni en evaluaciones de calidad.
- Licencia no disponible: no se puede confirmar el uso comercial; consultar el repositorio del modelo base antes de cualquier redistribucion.
- Idiomas no disponibles: no se documenta soporte linguistico; el tokenizer se copia del modelo base sin garantias adicionales.
- Configuracion reducida: 2 capas por modulo, lo que no refleja el comportamiento numerico ni el rendimiento del checkpoint completo.
- Sesgos y alucinaciones: no aplican en el sentido habitual de modelos generativos, pero las salidas aleatorias pueden inducir a error si se confunden con detecciones validas.
- Riesgo de confusion con el modelo base: el nombre y los tensores coinciden, pero los pesos no; verificar siempre el identificador del repositorio antes de cargar.
- Repositorio de 0,0 GB: el tamano indicado sugiere que los pesos pueden no estar completamente materializados en el repo; verificar la descarga antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/mm_grounding_dino_tiny_o365v1_goldg_v3det-mic
- Modelo base: https://huggingface.co/openmmlab-community/mm_grounding_dino_tiny_o365v1_goldg_v3det
- Referencia MIC citada en la model card: https://huggingface.co/huggingface-mic/mm_grounding_dino_tiny_o365v1_goldg_v3det-mic
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mm_grounding_dino_tiny_o365v1_goldg_v3det-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio transformers-mic (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
