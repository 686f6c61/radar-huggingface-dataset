# huggingface-mic/MiniMax-M3-MXFP8-mic

## Resumen

MiniMax-M3-MXFP8-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, no un modelo entrenado ni utilizable en producción. Se trata de una version reducida del checkpoint MiniMaxAI/MiniMax-M3-MXFP8, un modelo vision-lenguaje de la familia MiniMax-M3, generada automaticamente con la herramienta `build_fixtures.py` del repositorio transformers-mic. Su proposito es servir como banco de pruebas reproducible para validar la integracion de la arquitectura `MiniMaxM3SparseForConditionalGeneration` en el ecosistema Transformers, no para inferencia real.

El fixture conserva la misma arquitectura que el modelo original pero con una configuracion drásticamente reducida: 2 capas en el codificador visual y 2 capas en el decodificador de texto, lo que resulta en 25.940.836 parametros totales (frente a los ordenes de magnitud superiores del checkpoint real). Los pesos son aleatorios (semilla 17) y no han sido entrenados; simplemente pasaron una puerta de sensibilidad a la entrada que verifica que cada perturbacion de los inputs mueve los logits al menos 0,001. Los ficheros del procesador (tokenizer, image processor, chat template, configuracion) se copian byte a byte del modelo original.

Su relevancia es exclusivamente para desarrolladores que trabajen en la integracion de modelos MiniMax-M3 en Transformers: permite ejecutar tests de contrato, verificar nombres de tensores, comprobar compatibilidad de procesadores y validar flujos de carga sin necesidad de descargar ni ejecutar el checkpoint completo. La etiqueta `test-artifact` lo excluye explicitamente de las busquedas de modelos candidatos. No debe confundirse con el modelo MiniMax-M3 real ni usarse para ninguna tarea de generacion, razonamiento o vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMaxM3SparseForConditionalGeneration (transformer multimodal vision-lenguaje, variante reducida) |
| Parametros totales | 25.940.836 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero LICENSE se copia del modelo base, pero su contenido no se especifica en la informacion disponible) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base MiniMax-M3-MXFP8, identificada en la configuracion como `MiniMaxM3SparseForConditionalGeneration`. Se trata de un modelo multimodal vision-lenguaje con un codificador visual y un decodificador de texto, presumiblemente con mecanismos de atencion dispersa (sparse) segun sugiere el nombre de la clase. Sin embargo, la informacion proporcionada no detalla la composicion interna, el tipo de atencion, ni la naturaleza exacta del componente sparse.

La configuracion se ha reducido mediante la regla generica de `sweep.py`: 2 capas ocultas en la parte visual y 2 capas ocultas en la parte de texto. Los pesos son aleatorios con semilla 17 y no han recibido entrenamiento alguno. La unica validacion aplicada es una puerta de sensibilidad a la entrada: cada perturbacion de los inputs del contrato debe mover los logits al menos 0,001 (la perturbacion mas debil, `pixel_values:halve`, produjo 0,693). Los tensores conservan los mismos nombres que el checkpoint real, y los ficheros del procesador (tokenizer, image_processor, video_processor, chat_template, generation_config) se copian byte a byte del modelo original. Los pesos se guardan en bfloat16, el dtype por defecto del checkpoint real, y se verifica que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas coherentes.
- Conserva la interfaz de un modelo vision-lenguaje: acepta `pixel_values` e inputs de texto segun el contrato del fixture.
- Mantiene los mismos nombres de tensores y la misma firma de configuracion que MiniMax-M3-MXFP8, lo que permite validar carga y forward pass.
- Incluye procesadores copiados del modelo real (tokenizer, image processor, video processor, chat template), utiles para tests de integracion.
- Sirve como fixture de contrato para verificar expectativas de framework (directorio `integrations/transformers/expectations`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues reales, al carecer de entrenamiento.

## Casos de uso

- Tests de integracion en Transformers: el fixture permite ejecutar la suite de pruebas de la arquitectura `MiniMaxM3SparseForConditionalGeneration` sin descargar el checkpoint completo, verificando que la clase se instancia, el forward devuelve logits y los gradientes fluyen.
- Validacion de contratos de framework: el directorio `integrations/transformers/expectations` define las salidas esperadas; el fixture se usa para comprobar que una version de Transformers cumple dichas expectativas tras cambios en la libreria.
- CI/CD de integraciones: al ocupar solo 0,2 GB, puede incluirse en pipelines de integracion continua para detectar regresiones en la carga de modelos MiniMax-M3 sin coste de almacenamiento elevado.
- Verificacion de procesadores: los ficheros de tokenizer, image_processor y video_processor copiados byte a byte permiten probar el preprocesado de entradas multimodales con datos sinteticos.
- Desarrollo de herramientas de inspeccion de modelos: util para probar scripts que enumeran tensores, comparan nombres con el checkpoint real o auditan configuraciones, gracias a que los nombres de tensor coinciden.
- Reproduccion de la puerta de sensibilidad: el `build.json` registra los resultados de las perturbaciones, lo que permite reproducir y auditar el proceso de construccion del fixture.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no tiene sentido evaluarlo en tareas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (25,9M parametros, aproximadamente 52 MB de pesos), aunque no es un modelo ejecutable de forma significativa.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es mas que suficiente; tambien funciona en CPU.
- Cabe en cualquier GPU consumer y en CPU sin problemas.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requiere `custom_code`); no se recomienda vLLM, llama.cpp ni Ollama, ya que no es un modelo funcional.
- Latencia y throughput: no disponibles; irrelevantes para un fixture.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M3-MXFP8-mic (este) | 25,9M | no disponible | Fixture de test | no disponible | HuggingFace |
| MiniMaxAI/MiniMax-M3-MXFP8 | no disponible | no disponible | Modelo vision-lenguaje real | no disponible | HuggingFace |
| Otros fixtures de transformers-mic | variable | no disponible | Fixtures de test | no disponible | HuggingFace (org huggingface-mic) |

No se dispone de datos de rendimiento ni de especificaciones completas del modelo base en la informacion proporcionada, por lo que no es posible una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas carecen de sentido. No debe emplearse en produccion ni en evaluaciones de calidad.
- Etiquetado como `test-artifact`, lo que lo excluye de busquedas de modelos candidatos; usarlo fuera de contextos de test es un error conceptual.
- La licencia del modelo base se copia en el repositorio, pero su contenido no se especifica; verificar antes de cualquier uso derivado.
- Los pesos aleatorios pueden producir NaN o valores extremos en configuraciones no previstas, aunque el autor verifica finitud en float32, bfloat16 y float16 para el forward, loss y gradientes.
- No dispone de informacion sobre sesgos, alucinacion ni limitaciones de idioma, al no haber sido entrenado.
- Requiere `trust_remote_code=True` por el uso de `custom_code` y `configuration_minimax_m3_vl.py`; auditar el codigo antes de ejecutarlo en entornos sensibles.
- El fixture solo cubre checkpoints cuyos ficheros de procesador sean byte-identicos y cuya configuracion coincida tras el shrink (clave de fixture `ca4ed2eea1f0`); no sirve para validar variantes con procesadores distintos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/MiniMax-M3-MXFP8-mic
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3-MXFP8
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/MiniMax-M3-MXFP8-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de shrink: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
