# huggingface-mic/MiniMax-M3-MXFP8-mic

## Resumen

MiniMax-M3-MXFP8-mic es un artefacto de prueba publicado por la organizacion huggingface-mic. No es un modelo utilizable: se trata de un fixture de 25,9 millones de parametros construido para verificar la integracion del modelo real MiniMaxAI/MiniMax-M3-MXFP8 en el ecosistema Transformers. El repositorio empaqueta pesos reducidos, ejemplos de uso ejecutables y las expectativas de framework en un unico lugar, con el objetivo de que los mantenedores de librerias puedan validar contratos de API sin descargar el checkpoint completo.

El fixture conserva la arquitectura del modelo original (clase `MiniMaxM3SparseForConditionalGeneration`, un VLM con torre de vision y torre de texto) pero reduce la profundidad de ambas torres a 2 capas. Los pesos son aleatorios (semilla 17) y nunca se entrenaron; pasaron un test de sensibilidad de entradas que comprobo que cada perturbacion de las entradas del contrato desplazaba los logits al menos 0,001. Los ficheros de procesador (tokenizer, image processor, video processor, chat template) se copiaron byte a byte desde el checkpoint real.

Su relevancia es puramente de ingenieria: permite ejecutar pruebas de integracion continuas sobre la ruta de codigo de MiniMax M3 sin necesidad de GPU de gran capacidad ni de acceso a pesos reales. Cualquier evaluacion de capacidades, calidad o rendimiento sobre este repositorio carece de sentido, ya que el modelo no ha sido entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) con atencion dispersa; clase `MiniMaxM3SparseForConditionalGeneration` |
| Parametros totales | 25.940.836 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo replica la estructura del checkpoint MiniMax-M3-MXFP8: un transformer multimodal con una torre de vision y una torre de texto, ensambladas bajo la clase `MiniMaxM3SparseForConditionalGeneration`. El fixture reduce ambas torres a 2 capas ocultas mediante la regla generica de reduccion implementada en `sweep.py` del repositorio transformers-mic. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que el codigo de carga y las pruebas de forma funcionan igual que con el modelo completo.

No hubo entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y se validaron con una puerta de sensibilidad de entradas: cada perturbacion definida en el contrato debe mover los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produjo 0,693). Los ficheros de procesamiento (tokenizer, merges, vocab, image processor, video processor, chat template, configuracion) se copiaron sin modificacion desde MiniMaxAI/MiniMax-M3-MXFP8. Los pesos se guardaron en bfloat16 y se verifico que forward, perdida y gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- Ninguna capacidad funcional real: el modelo no ha sido entrenado y sus pesos son aleatorios.
- Carga y ejecucion de forward pass con la misma firma de tensores que el checkpoint original.
- Procesamiento de texto, imagen y video mediante los ficheros de procesador copiados del modelo real (tokenizer, image processor, video processor).
- Compatibilidad con el chat template original (`chat_template.jinja`).
- Ejecucion de pruebas de contrato: verificacion de formas, dtypes y sensibilidad de entradas.
- No soporta tool calling, agentes, razonamiento ni generacion de codigo de forma significativa.

## Casos de uso

- Pruebas de integracion en Transformers: validar que la clase `MiniMaxM3SparseForConditionalGeneration` carga, ejecuta forward y calcula gradientes sin errores antes de integrar el checkpoint real.
- CI/CD de librerias de inferencia: usar el fixture como sustituto ligero en pipelines que necesitan un modelo con la misma interfaz pero sin requisitos de VRAM.
- Desarrollo de procesadores multimodales: probar cambios en image processor, video processor o tokenizer contra un modelo que comparte exactamente esos ficheros con el original.
- Verificacion de contratos de API: comprobar que las entradas declaradas en `integration.json` producen el efecto esperado sobre los logits.
- Reproduccion de entornos: reconstruir el fixture con `build_fixtures.py` y comparar hashes registrados en `build.json`.
- Formacion de mantenedores: disponer de un repositorio de 0,2 GB que ilustra como reducir un VLM preservando nombres de tensores y ficheros de procesador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad seria invalida.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (25,9 M de parametros, aproximadamente 52 MB de pesos).
- GPU recomendadas: cualquier GPU consumer con al menos 1 GB de VRAM; tambien ejecutable en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en entornos sin GPU.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; no se ha validado con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un modelo diminuto, la latencia estara dominada por el overhead de framework.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M3-MXFP8-mic | 25,9 M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| MiniMaxAI/MiniMax-M3-MXFP8 | no disponible | no disponible | Modelo real multimodal | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de integracion | no disponible | Hugging Face |

La comparacion con modelos de produccion de la misma categoria no es aplicable: este repositorio no compite en tareas de generacion, sino que sirve como sustituto de bajo coste del checkpoint MiniMax-M3-MXFP8 en pruebas automatizadas.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas carecen de significado.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta declarada en la informacion disponible; el fichero `LICENSE` se copio del checkpoint original, por lo que las condiciones reales dependen de MiniMaxAI/MiniMax-M3-MXFP8.
- La reduccion a 2 capas altera el comportamiento numerico respecto al modelo completo; no sirve para evaluar calidad, sesgos ni alucinaciones.
- No se han validado los requisitos de contexto, idiomas ni cuantizacion del modelo original a partir de este repositorio.
- El uso de `trust_remote_code` es necesario por el codigo de configuracion y procesamiento incluido; conviene auditar esos ficheros antes de ejecutarlos en entornos sensibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/MiniMax-M3-MXFP8-mic
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3-MXFP8
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/MiniMax-M3-MXFP8-mic.html
- Script de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
