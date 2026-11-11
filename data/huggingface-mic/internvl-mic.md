# huggingface-mic/internvl-mic

## Resumen

`huggingface-mic/internvl-mic` es un artefacto de prueba (fixture) publicado por el equipo `huggingface-mic` para validar la integración del modelo `OpenGVLab/InternVL3-1B-hf` en la librería Transformers. No se trata de un modelo funcional entrenado, sino de una versión "adelgazada" (slim) con pesos aleatorios que replica la arquitectura y los ficheros de procesador del checkpoint original, con el objetivo de servir como banco de pruebas reproducible para tests de integración.

El fixture conserva la clase `InternVLForConditionalGeneration` pero reduce la configuración: 2 capas en el codificador visual y 2 capas en el decodificador de texto, resultando en 9.973.120 parámetros totales. Los pesos se generan con semilla 17 y se guardan en bfloat16, el mismo dtype con el que carga el modelo base. Los ficheros de tokenizador, plantilla de chat y configuración de generación se copian byte a byte desde `OpenGVLab/InternVL3-1B-hf`.

Es relevante para desarrolladores que contribuyen a Transformers o que necesitan validar pipelines de inferencia multimodal sin descargar el checkpoint completo de 1B parámetros. El autor lo etiqueta explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos a producción. No debe usarse para inferencia real: sus pesos son aleatorios y no ha sido entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternVL (InternVLForConditionalGeneration), transformer multimodal vision-lenguaje |
| Parametros totales | 9.973.120 (fixture slim); el base original es de 1B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture reproduce la arquitectura `InternVLForConditionalGeneration`, un modelo multimodal que combina un codificador visual con un decodificador de lenguaje. En esta versión slim, la configuración se ha reducido mediante la regla genérica de `sweep.py`: 2 capas ocultas en la torre visual y 2 capas ocultas en el modelo de texto. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que el código de integración puede ejercitarse sin cambios.

No ha habido entrenamiento. Los pesos son aleatorios (semilla 17) y solo se aceptaron tras superar una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `pixel_values:roll_batch`, produjo 0,00781). Los ficheros de procesador (`tokenizer.json`, `chat_template.jinja`, `preprocessor_config.json`, entre otros) se copiaron byte a byte desde `OpenGVLab/InternVL3-1B-hf`. El modelo es finito en float32, bfloat16 y float16 tanto en forward como en pérdida y gradientes.

## Capacidades

- Ejecución de forward, cálculo de pérdida y gradientes en float32, bfloat16 y float16.
- Carga mediante Transformers con la clase `InternVLForConditionalGeneration`.
- Procesamiento multimodal de entradas de imagen y texto usando los ficheros de procesador del modelo base.
- Validación de contratos de integración en variantes default, eager y bfloat16.
- No soporta generación de texto útil: los pesos son aleatorios.
- No soporta tool calling, agentes ni razonamiento multi-paso de forma funcional.
- No dispone de capacidades multilingües reales (el tokenizador es el del base, pero el modelo no produce salidas coherentes).

## Casos de uso

- Test de integración en Transformers: permite ejecutar la suite de pruebas de la clase `InternVLForConditionalGeneration` sin descargar el checkpoint de 1B parámetros, reduciendo tiempo y ancho de banda en CI.
- Validación de contratos de API: el repositorio incluye `integration.json` con el manifiesto del contrato, de modo que se puede verificar que las entradas y salidas esperadas se cumplen en cada release.
- Regresión de preprocesado multimodal: al copiar los ficheros de procesador del base, se puede comprobar que los cambios en `preprocessor_config.json` o en la plantilla de chat no rompen el pipeline.
- Desarrollo de kernels o capas personalizadas: al mantener los nombres de tensores del checkpoint real, se pueden probar implementaciones alternativas de atención o de fusión visual sin cargar el modelo completo.
- Reproducibilidad de experimentos: `build.json` registra fuentes fijadas, resultados de las puertas y hashes de ficheros, lo que permite reconstruir el fixture de forma determinista.
- Formación de contribuidores: sirve como ejemplo didáctico de cómo construir fixtures slim para modelos multimodales siguiendo la metodología de `build_fixtures.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios y no tiene rendimiento de tarea medible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 para el fixture de 10M parámetros; el checkpoint base de 1B requiere aproximadamente 2 GB en bfloat16.
- GPU recomendadas: el autor validó el fixture en una NVIDIA A10G; cualquier GPU con al menos 4 GB de VRAM es suficiente para el fixture.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) para el fixture; el base de 1B también cabe en GPUs de 8 GB.
- Opciones de despliegue: Transformers (validado); no se ha validado vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/internvl-mic | 9,97M (fixture) | no disponible | Test de integracion | no disponible | Hugging Face |
| OpenGVLab/InternVL3-1B-hf | 1B | no disponible | Modelo multimodal real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Test de integracion | no disponible | Hugging Face |

La comparación relevante es con el checkpoint base `OpenGVLab/InternVL3-1B-hf`: misma arquitectura y mismos ficheros de procesador, pero con 100 veces menos parámetros y pesos aleatorios. Frente a otros fixtures del ecosistema `transformers-mic`, comparte la misma metodología de construcción y el mismo propósito de validación.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto ni descripciones coherentes; cualquier salida es ruido estadístico.
- Etiquetado como `test-artifact`: no debe usarse en producción ni como modelo candidato en búsquedas.
- La licencia no está declarada en la información disponible; verificar antes de cualquier uso más allá de tests internos.
- No se han validado pipelines de despliegue distintos de Transformers (vLLM, TGI, llama.cpp, Ollama).
- La cobertura es de fixture: el autor indica que "full checkpoint coverage is separate", por lo que no garantiza que todos los caminos de código del modelo real estén ejercitados.
- El tamaño del repo es de 0,0 GB en la información disponible, lo que puede indicar que los pesos no están incluidos o que el reporte está redondeado; conviene verificar los ficheros reales antes de depender del repositorio.
- No apto para evaluación de calidad, sesgos o alucinación, ya que no ha sido entrenado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/internvl-mic
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-1B-hf
- Manifiesto del contrato: https://huggingface.co/huggingface-mic/internvl-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/internvl-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/internvl-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/internvl-mic/blob/main/build.json
- Metodología de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/internvl-mic.html
- Evidencia de regeneración (GitHub Actions): https://github.com/huggingface/transformers-mic/actions/runs/38252430459
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
