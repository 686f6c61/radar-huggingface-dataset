# huggingface-mic/MiniCPM-OCR-1.0-mic

## Resumen

MiniCPM-OCR-1.0-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic a partir del modelo openbmb/MiniCPM-OCR-1.0. No es un modelo funcional: se trata de una version reducida artificialmente ("slim fixture") de 16,7 millones de parametros que conserva la misma arquitectura (`MiniCPMOcrForConditionalGeneration`) y los mismos nombres de tensores que el checkpoint original, pero con pesos aleatorios generados con semilla 17. Su proposito es servir como fixture de integracion para validar contratos de frameworks (en concreto, el ecosistema transformers-mic) sin necesidad de descargar ni ejecutar el modelo real.

El repositorio incluye el manifiesto de contrato (`integration.json`), la documentacion de uso con Transformers, las expectativas del framework y la procedencia del fixture (`build.json`), ademas de los ficheros de procesador copiados byte a byte desde el modelo base. El modelo esta etiquetado explicitamente como `test-artifact` para mantenerlo fuera de las busquedas de modelos candidatos.

Por su naturaleza, no debe emplearse para inferencia real, generacion de texto ni tareas de OCR. Su relevancia es puramente de ingenieria: permite a los desarrolladores de frameworks comprobar que la carga, el forward, el calculo de perdida y los gradientes funcionan correctamente con la arquitectura de MiniCPM-OCR en float32, bfloat16 y float16, con un coste de descarga de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniCPMOcrForConditionalGeneration (transformer multimodal con torre de vision; 2 capas de texto y 2 capas de vision en el fixture) |
| Parametros totales | 16.714.192 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base `openbmb/MiniCPM-OCR-1.0`: una clase `MiniCPMOcrForConditionalGeneration` con componente de texto y componente de vision. Para reducir el tamano, se aplico la regla generica de `sweep.py` del repositorio transformers-mic, que deja `num_hidden_layers` en 2 tanto en el codigo de texto como en el de vision. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `preprocessor_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde el checkpoint original, de modo que el pipeline de preprocesado es identico al del modelo real.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y solo se validaron mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produce 0,16). El fixture conserva exactamente los mismos nombres de tensores que el checkpoint real, se guarda en bfloat16 (el dtype por defecto de `openbmb/MiniCPM-OCR-1.0`) y se verifico que es finito en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes. La clave de fixture es `abe31a9f2ff4` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el shrink.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas coherentes.
- Sirve como fixture de integracion para validar la carga de la arquitectura `MiniCPMOcrForConditionalGeneration` en Transformers.
- Permite comprobar el contrato de entradas y salidas definido en `integration.json`.
- Permite verificar forward, calculo de perdida y retropropagacion en float32, bfloat16 y float16.
- Conserva los ficheros de tokenizador y procesador del modelo real, por lo que valida el pipeline de preprocesado multimodal (texto e imagen).
- No soporta tool calling, agentes, razonamiento multilingue ni ninguna capacidad generativa real.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForConditionalGeneration` y comprobar que la arquitectura y los nombres de tensores coinciden con el checkpoint real, sin descargar los pesos completos.
- Validacion de contratos de framework: ejecutar las expectativas de `integrations/transformers/expectations` en CI para detectar regresiones en el soporte de MiniCPM-OCR.
- Pruebas de preprocesado: usar los ficheros de procesador copiados del modelo real para verificar plantillas de chat, tokenizacion y transformaciones de imagen.
- Verificacion de dtypes: comprobar que el modelo es finito en float32, bfloat16 y float16 en forward, perdida y gradientes antes de portar cambios al modelo real.
- Desarrollo de herramientas de "model shrinking": el fixture sirve como caso de prueba reproducible para la regla generica de `sweep.py` y para `build_fixtures.py`.
- Pruebas de humo en pipelines de CI/CD: un artefacto de 0,1 GB permite ejecutar tests de carga y forward en runners modestos sin GPU de gran capacidad.
- Reproducibilidad de fixtures: `build.json` registra fuentes fijadas, resultados de la puerta de sensibilidad y hashes de ficheros, lo que permite reconstruir el fixture con `python example/build_fixtures.py --fixture MiniCPM-OCR-1.0-mic`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, precision en OCR) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 16,7 M de parametros en bfloat16 (unos 33 MB de pesos); el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU es suficiente para ejecutar el forward del fixture.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Transformers es el marco previsto segun la documentacion del repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, el coste computacional es despreciable frente al modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR-1.0-mic (este) | 16,7 M | no disponible | Fixture de test | no disponible | Hugging Face |
| openbmb/MiniCPM-OCR-1.0 | no disponible | no disponible | OCR y comprension de documentos | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Validacion de contratos | no disponible | Hugging Face (org huggingface-mic) |

La comparacion relevante es con el modelo base: el fixture conserva arquitectura, nombres de tensores y procesador, pero sustituye los pesos entrenados por pesos aleatorios y reduce las capas a 2 en texto y vision.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta disponible en la informacion proporcionada; cualquier uso comercial requiere consultar la licencia del modelo base `openbmb/MiniCPM-OCR-1.0`.
- El fixture solo cubre checkpoints con ficheros de procesador identicos byte a byte y config coincidente tras el shrink; no representa otras variantes del modelo.
- La reduccion a 2 capas altera el comportamiento numerico respecto al modelo real, por lo que no sirve para evaluar calidad, latencia ni consumo de memoria del original.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque el artefacto no genera contenido real.
- La fecha de creacion indicada (2026-11-03) figura tal cual en los metadatos del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/MiniCPM-OCR-1.0-mic
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/MiniCPM-OCR-1.0-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/MiniCPM-OCR-1.0-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/MiniCPM-OCR-1.0-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/MiniCPM-OCR-1.0-mic/blob/main/build.json
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/MiniCPM-OCR-1.0-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
