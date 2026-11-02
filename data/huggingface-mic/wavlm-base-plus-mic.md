# huggingface-mic/wavlm-base-plus-mic

## Resumen

`wavlm-base-plus-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic`, no un modelo utilizable en producción. Se trata de una versión reducida artificialmente del modelo de reconocimiento y representación de voz `microsoft/wavlm-base-plus`, con solo 4,3 millones de parámetros frente a los aproximadamente 94,7 millones del original. Su propósito es servir como fixture reproducible para probar integraciones de frameworks (en concreto, el ecosistema Transformers) sin necesidad de descargar ni ejecutar el checkpoint completo.

El repositorio incluye pesos "slim", un manifiesto de contrato (`integration.json`), documentación de uso para Transformers y expectativas de framework, además de metadatos de procedencia de la construcción (`build.json`). Los pesos son aleatorios (semilla 17) y no han sido entrenados; únicamente pasaron una puerta de sensibilidad a la entrada que verifica que perturbaciones de las entradas mueven los logits al menos 0,001.

Es relevante exclusivamente para desarrolladores que mantienen o validan integraciones de modelos de audio en Transformers, no para tareas reales de reconocimiento de voz, diarización o extracción de características. El propio autor lo etiqueta como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | WavLMModel (transformer convolucional para audio, variante reducida) |
| Parámetros totales | 4,3 M (fixture); el modelo base `microsoft/wavlm-base-plus` tiene ~94,7 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada no especificada en la información) |
| Tipos de cuantización | no disponible; pesos guardados en float32, con forward/loss/gradientes finitos también en bfloat16 y float16 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio PyTorch; tamaño del repo 0,1 GB) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `WavLMModel` del checkpoint `microsoft/wavlm-base-plus`, pero con la configuración reducida mediante la regla genérica de `sweep.py` del repositorio `huggingface/transformers-mic` (concretamente `num_hidden_layers = 2`). Los ficheros de procesador (`preprocessor_config.json`) se copiaron byte a byte desde `microsoft/wavlm-base-plus`, y los nombres de tensores coinciden con los del checkpoint real, de modo que el fixture es intercambiable a nivel de código.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y solo se validaron mediante una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (la más débil, `input_values:halve`, con 0,278). El modelo se guardó en float32, el dtype por defecto del checkpoint original, y se verificó que el forward, la pérdida y los gradientes son finitos en float32, bfloat16 y float16. La clave de fixture `11ccff6756df` cubre todos los checkpoints cuyos ficheros de procesador son idénticos byte a byte y cuya configuración coincide tras el reducido.

## Capacidades

- Extracción de características de audio (interfaz `WavLMModel`), con la misma firma de entrada y nombres de tensores que `microsoft/wavlm-base-plus`.
- Ejecución de forward pass, cálculo de pérdida y retropropagación de gradientes en float32, bfloat16 y float16.
- Validación de contratos de integración: el manifiesto `integration.json` y el directorio de expectativas permiten comprobar que una integración de framework produce las salidas esperadas.
- No realiza reconocimiento de voz, diarización, clasificación de emociones ni ninguna tarea semántica real: los pesos son aleatorios.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Pruebas de integración en Transformers: usar el fixture para verificar que la carga de `WavLMModel`, el preprocesado y el forward pass funcionan sin descargar los ~94,7 M de parámetros del checkpoint real, reduciendo el tiempo de CI.
- Validación de contratos de framework: ejecutar el manifiesto `integration.json` y el directorio `integrations/transformers/expectations` para comprobar que una versión de Transformers cumple las salidas esperadas en audio.
- Desarrollo de pipelines de audio sin acceso a red: al ocupar 0,1 GB, el fixture permite trabajar en entornos aislados o con ancho de banda limitado donde el checkpoint completo no es viable.
- Pruebas de compatibilidad de dtypes: verificar que una integración maneja correctamente float32, bfloat16 y float16, dado que el fixture es finito en los tres.
- Reproducibilidad de builds: usar `build.json` y `build_fixtures.py` para regenerar el fixture y auditar hashes de ficheros y resultados de la puerta de sensibilidad.
- Docencia y demostraciones de la API de WavLM: mostrar la estructura de entradas y salidas del modelo sin coste computacional ni de descarga.
- Pruebas de regresión en CI/CD: detectar cambios de comportamiento en la carga de modelos de audio comparando logits contra los valores de referencia del fixture.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier métrica de calidad (WER, precisión de clasificación, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (4,3 M de parámetros, ~17 MB de pesos) y aún menor en float16/bfloat16.
- GPU recomendadas: cualquier GPU, incluidas integradas; no requiere acelerador dedicado.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y también en CPU.
- Opciones de despliegue: Transformers con PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son frameworks de texto y no aplican a este modelo de audio).
- Latencia y throughput: no disponibles; al tratarse de un fixture de 2 capas, la latencia sería órdenes de magnitud inferior a la del checkpoint real, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/wavlm-base-plus-mic` | 4,3 M (fixture) | no disponible | no aplica (pesos aleatorios) | no disponible | HuggingFace, 230 descargas |
| `microsoft/wavlm-base-plus` | ~94,7 M | no disponible | estado del arte en tareas de voz (no cuantificado aquí) | no disponible en la información | HuggingFace |
| Otros fixtures `*-mic` del mismo autor | variable (reducidos) | no disponible | no aplica | no disponible | HuggingFace |

La comparación relevante es con el checkpoint original: el fixture conserva arquitectura, nombres de tensores y ficheros de procesador, pero reduce capas a 2 y sustituye los pesos entrenados por pesos aleatorios, por lo que no es funcionalmente equivalente para ninguna tarea de audio.

## Limitaciones y advertencias

- Los pesos son aleatorios (semilla 17): las salidas no tienen significado semántico y no deben usarse para ninguna tarea real de audio.
- El autor lo etiqueta explícitamente como `test-artifact`; no es un modelo candidato para producción.
- La licencia no está declarada en la información disponible, lo que impide evaluar su uso comercial; además, al derivar de `microsoft/wavlm-base-plus`, podrían aplicar las condiciones del modelo original.
- No se especifican idiomas soportados ni ventana de contexto de audio.
- Riesgo de confusión: un usuario podría descargarlo pensando que es el WavLM base-plus real; el tamaño del repo (0,1 GB) y el número de parámetros (4,3 M) son señales claras de que no lo es.
- Solo se validó la finitud numérica en float32, bfloat16 y float16; no hay garantías sobre otros dtypes ni sobre entrenamiento real.
- No se han publicado benchmarks ni evaluaciones de sesgo, alucinación o robustez, y en un fixture con pesos aleatorios no serían aplicables.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/wavlm-base-plus-mic
- Modelo base: https://huggingface.co/microsoft/wavlm-base-plus
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/wavlm-base-plus-mic/blob/main/integration.json
- Uso en Transformers: https://huggingface.co/huggingface-mic/wavlm-base-plus-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/wavlm-base-plus-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/wavlm-base-plus-mic/blob/main/build.json
- Explicación del reducido: https://huggingface-mic-mic-coverage.static.hf.space/shrink/wavlm-base-plus-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reducido (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
