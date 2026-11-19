# ggml-org-dev/tiny-h2o-lightning-4b-for-testing-GGUF

## Resumen

`tiny-h2o-lightning-4b-for-testing-GGUF` es un artefacto de pruebas publicado por `ggml-org-dev`, no un modelo destinado a uso real. Se trata de una copia modificada y deliberadamente degradada de `h2oai/h2o-lightning-4b` (que a su vez deriva de `Qwen/Qwen3.5-4B`), convertida a GGUF mediante `convert_hf_to_gguf.py` de llama.cpp. El propio autor advierte que la salida es gibberish y que solo debe emplearse para probar software.

El propósito concreto es servir de fixture en las pruebas del servidor de llama.cpp para el tipo de decisión `h2o-lightning`. Para ello se recorta el vocabulario del modelo de texto de 248.320 a 3.493 tokens y se reasignan los ids, conservando tokens especiales, caracteres individuales, el camino BPE de las 255 etiquetas de decisión de `serve_config.json` y los tokens de las primeras 2.000 merges. El modelo de texto se cuantiza a Q4_0 (incluyendo embedding de tokens y salida) y el mmproj a Q8_0.

El número de parámetros real declarado en safetensors es de 487.160, muy inferior a los aproximadamente 4B que sugiere el nombre: el recorte de vocabulario y la propia naturaleza del artefacto explican esta discrepancia. No hay descargas ni likes, el repo ocupa 0.0 GB y no se dispone de pipeline, idiomas ni datos de entrenamiento publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B (arquitectura exacta no disponible) |
| Parametros totales | 487.160 (según safetensors; el nombre comercial sugiere ~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (modelo de texto), Q8_0 (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base declarado es `ggml-org-dev/tiny-h2o-lightning-4b-for-testing`, derivado de `h2oai/h2o-lightning-4b` (H2O.ai), que a su vez se construye sobre `Qwen/Qwen3.5-4B`. No se publican detalles sobre arquitectura interna (número de capas, dimensiones, tipo de atención), composición del dataset ni proceso de alineación (RLHF/DPO). El pipeline no está disponible.

Las modificaciones aplicadas respecto al modelo HF original son dos. Primero, el vocabulario del modelo de texto se recorta de 248.320 a 3.493 tokens mediante `slice_vocab_gguf.py` de las pruebas del servidor de llama.cpp, conservando tokens especiales, todos los caracteres individuales, el camino BPE de las 255 etiquetas de `serve_config.json` y los tokens de las primeras 2.000 merges; los ids se renumeran y las filas del embedding de tokens (atadas a la salida) se recortan en consecuencia. Segundo, el modelo de texto se cuantiza a Q4_0 con `llama-quantize` (incluyendo embedding y salida) y el mmproj a Q8_0. El texto sigue tokenizándose correctamente, pero en más tokens y más cortos que con el vocabulario original.

## Capacidades

- Generación de texto: funcional a nivel de tokenización, pero la salida es gibberish por diseño, según advierte el autor.
- Soporte de etiquetas de decisión: el vocabulario conserva específicamente el camino BPE de las 255 etiquetas de `serve_config.json`, lo que permite ejercitar el tipo de decisión `h2o-lightning` del servidor de llama.cpp.
- Procesamiento multimodal: el repo incluye un mmproj en Q8_0, aunque no se detallan las capacidades de visión efectivas.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: no disponibles.
- Thinking mode, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Pruebas de integración del servidor de llama.cpp: el artefacto sirve como fixture para validar el tipo de decisión `h2o-lightning` en `llama-server`, arrancándolo con `llama-server -hf ggml-org-dev/tiny-h2o-lightning-4b-for-testing-GGUF:Q4_0`.
- Validación de `slice_vocab_gguf.py`: permite comprobar que el recorte de vocabulario, la renumeración de ids y el recorte de filas del embedding atado a la salida funcionan como se espera.
- Pruebas de conversión HF→GGUF: verifica el pipeline `convert_hf_to_gguf.py` con modelo de texto en F16 y mmproj separado.
- Pruebas de cuantización: sirve para ejercitar `llama-quantize` con Q4_0 sobre texto y Q8_0 sobre mmproj, incluyendo embedding y salida.
- Pruebas de tokenización con vocabulario reducido: valida que el texto se tokeniza correctamente en tokens más cortos y numerosos tras el recorte.
- CI/CD de llama.cpp: al ocupar 0.0 GB, es un candidato ligero para pipelines automatizados que necesitan un modelo pequeño y desechable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo ocupa 0.0 GB y el modelo de texto en Q4_0 con 487.160 parámetros es extremadamente pequeño, por lo que debería caber en cualquier GPU consumer, aunque no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: previsiblemente sí en cualquier GPU con soporte CUDA/Metal/Vulkan, dado el tamaño, aunque no se documenta.
- Opciones de despliegue: `llama-server` (llama.cpp), invocable vía `llama-server -hf ggml-org-dev/tiny-h2o-lightning-4b-for-testing-GGUF:Q4_0`. Otras opciones (vLLM, Ollama, TGI) no están documentadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tiny-h2o-lightning-4b-for-testing-GGUF | 487.160 (safetensors) | no disponible | Apache 2.0 | GGUF, repo 0.0 GB | Artefacto de prueba, salida gibberish |
| h2oai/h2o-lightning-4b | ~4B (según nombre) | no disponible | Apache 2.0 | HF | Modelo original de H2O.ai |
| Qwen/Qwen3.5-4B | ~4B (según nombre) | no disponible | no disponible en esta ficha | HF | Base del modelo de H2O.ai |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Salida gibberish por diseño: el autor indica explícitamente que el modelo produce texto sin sentido y que no debe usarse para nada salvo pruebas de software.
- No es un modelo listo para producción: es una copia modificada y degradada, sin garantías de calidad.
- Discrepancia de parámetros: el safetensors declara 487.160 parámetros frente a los ~4B que sugiere el nombre, lo que refleja el recorte de vocabulario y la naturaleza del artefacto.
- Vocabulario recortado: el texto se tokeniza en más tokens y más cortos que con el vocabulario original de 248.320 tokens, lo que afecta a la eficiencia y a la fidelidad respecto al modelo base.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un artefacto de prueba la restricción práctica es de idoneidad, no legal.
- Idiomas, contexto y pipeline no documentados: no hay información sobre sesgos, alucinación o limitaciones lingüísticas.
- Riesgo de confusión: al compartir nombre con `h2o-lightning-4b`, puede confundirse con el modelo real de H2O.ai; conviene no desplegarlo fuera de entornos de test.

## Enlaces

- Hugging Face: https://huggingface.co/ggml-org-dev/tiny-h2o-lightning-4b-for-testing-GGUF
- Modelo base en HF: https://huggingface.co/ggml-org-dev/tiny-h2o-lightning-4b-for-testing
- Modelo original de H2O.ai: https://huggingface.co/h2oai/h2o-lightning-4b
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia: https://huggingface.co/ggml-org-dev/tiny-h2o-lightning-4b-for-testing-GGUF/blob/main/LICENSE
- llama.cpp (repositorio del servidor y scripts de conversión/cuantización): no disponible en la información proporcionada.
