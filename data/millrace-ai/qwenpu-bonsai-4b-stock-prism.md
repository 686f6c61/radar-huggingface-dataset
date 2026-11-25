# millrace-ai/qwenpu-bonsai-4b-stock-prism

## Resumen

qwenpu-bonsai-4b-stock-prism es un checkpoint de investigación publicado por millrace-ai que integra el circuito RISC-V y vectorial de QwenPU dentro del bloque de predicción multi-token (MTP) del modelo empaquetado Bonsai 2 4B de Prism ML. No se trata de un modelo de lenguaje entrenado de nuevo, sino de una modificación estructural del GGUF base: el host conserva su estado oculto nativo de 2.560 dimensiones y sus 426 tensores de lenguaje PQ2_0 originales, mientras que el circuito invitado ocupa 36.352 filas feed-forward adicionales. El resultado es un GGUF combinado de 444 tensores y 11.840.714.242 elementos contables en el Hub (incluyendo relleno neutro y el circuito compilado), frente a los 4.205.751.296 elementos del host de lenguaje.

El interés del artefacto es fundamentalmente de verificación de sistemas más que de calidad lingüística: demuestra que un invitado RISC-V puede ejecutarse dentro de un checkpoint cargado sobre APIs estándar de Prism (llama.cpp modificado), con handoff coherente de caché KV, estado recurrente y logits respecto al Bonsai 2 4B original. La prueba publicada en Windows sobre una GeForce GTX 1080 de 8 GiB ejecuta un invitado de tres tokens (stories260K) hasta halt limpio, imprimiendo `Once upon a`.

Por tanto, esta ficha debe leerse como la de un checkpoint de investigación reproducible con licencia Apache 2.0, no como la de un modelo conversacional listo para producción. La mayor parte de sus métricas documentadas son de fidelidad de ejecución (registros arquitectónicos, escrituras de invitado, operaciones VMAT) y de consumo de recursos, no de rendimiento en benchmarks de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GGUF `qwen35` (host Bonsai 2 4B, PQ2_0) + bloque MTP con circuito QwenPU RISC-V/vectorial |
| Parametros totales | 11.840.714.242 elementos de tensor en el GGUF combinado (444 tensores, incluye relleno y circuito); el host de lenguaje declara 4.205.751.296 elementos |
| Parametros activos | no disponible (no es un MoE declarado; el bloque MTP es un circuito invitado, no un experto) |
| Longitud de contexto | 262.144 tokens declarados en la cabecera del GGUF |
| Tipos de cuantizacion | PQ2_0 (empaquetado ternario del host); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único `Bonsai-2-4B-PQ2_0-QwenPU-Stock-Prism.gguf`, 4.031.384.384 bytes, SHA-256 `ec6d177b3af28436f8aef2c82166ccd01ee087c5aed889b13a269fa414b6c973`) |
| Ancho oculto | 2.560 |
| Filas FFN por bloque | 36.352 |
| Disposicion de bloques | 32 bloques de lenguaje + 1 bloque MTP QwenPU |
| Runtime verificado | Prism b12128 (llama.cpp modificado) para Windows CUDA 12.4, x64 |

## Arquitectura y entrenamiento

El modelo base es Bonsai 2 4B en su variante empaquetada PQ2_0, un transformer con arquitectura declarada `qwen35`, estado oculto de 2.560 dimensiones y 32 bloques de lenguaje. Sobre ese host, millrace-ai inserta un bloque MTP adicional que aloja el circuito RISC-V y vectorial de QwenPU. Los tensores de lenguaje empaquetados que requieren la forma ampliada conservan sus bytes originales y reciben relleno neutro, de modo que el host mantiene su comportamiento nativo; el invitado se ejecuta en un contexto separado dentro del checkpoint cargado. El launcher de Windows carga el ELF del invitado, realimenta las acciones seleccionadas por el circuito y aplica las peticiones de caché a través de las APIs estándar de Prism.

No se documenta ningún proceso de entrenamiento adicional: no hay datos de tokens de preentrenamiento, composición de dataset, RLHF ni DPO en la información disponible. La innovación técnica es de integración y verificación: un verificador de referencia en CPU, fijado de forma independiente, comprueba offline la ejecución registrada. En la prueba completa sobre GTX 1080 se validaron 37.080 registros arquitectónicos, 55.375 escrituras ordenadas del invitado y 726 operaciones VMAT, y se confirmó que la posición de texto aparcada, la caché KV, el estado recurrente y los logits coinciden con el Bonsai 2 4B original, así como la inserción de resultado y el siguiente decode sobre el mismo historial de texto.

## Capacidades

- Generación de texto autoregresiva heredada del host Bonsai 2 4B (PQ2_0), con contexto declarado de 262.144 tokens.
- Predicción multi-token mediante el bloque MTP que aloja el circuito QwenPU.
- Ejecución de un invitado RISC-V y vectorial dentro del checkpoint, con realimentación de acciones seleccionadas por el circuito.
- Handoff verificado de estado entre invitado y host: caché KV, estado recurrente, posición de texto y logits.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales: modo de verificación reproducible con captura de traza, comprobación de hashes de paquete y runtime pin; no se documentan visión ni audio.

## Casos de uso

- Investigación en ejecución de invitados RISC-V sobre runtimes de inferencia: el checkpoint sirve para reproducir el experimento de QwenPU dentro de Prism b12128 y validar el handoff de estado con el verificador empaquetado, usando el smoke test de exponenciación vectorial de 12 instrucciones como comprobación previa.
- Verificación de fidelidad de cuantización ternaria: comparar los hashes de estado del modelo original capturados en GTX 1080 con los del checkpoint combinado permite auditar que el relleno neutro y el circuito no alteran la posición de texto, la caché KV ni los logits del host.
- Auditoría de artefactos de modelo: el repositorio incluye `SHA256SUMS.txt`, `evidence/checkpoint.json`, `evidence/prism-b12128.json` y capturas JSON de ejecución, lo que permite integrar comprobaciones de integridad en pipelines de publicación de modelos.
- Reproducción en hardware de gama consumer: con 4,73 GiB de VRAM dedicada al proceso pico y 4,46 GiB de working set de RAM, el experimento completo cabe en una GTX 1080 de 8 GiB, lo que facilita la replicación en laboratorios con presupuesto limitado.
- Docencia y divulgación de arquitecturas híbridas: el par host/invitado con contexto declarado de 262.144 tokens y bloque MTP ilustra de forma concreta cómo se acopla un acelerador lógico a un transformer empaquetado sin reentrenar.
- Desarrollo de runtimes alternativos: el launcher de PowerShell y el pin exacto de Prism b12128 y del commit de QwenPU (`6e2767a`) sirven como base para portar la integración a otros backends que respeten las APIs de caché de Prism.
- Pruebas de regresión de decodificación especulativa: el bloque MTP y la comprobación de la inserción de resultado y del siguiente decode permiten validar cambios en el pipeline de decodificación contra una referencia fijada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de NLP (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas publicadas son de fidelidad de ejecución y de consumo de recursos:

| Metrica | Valor |
|---|---|
| Registros arquitectonicos verificados | 37.080 |
| Escrituras ordenadas del invitado | 55.375 |
| Operaciones VMAT | 726 |
| Duracion de la captura del invitado | 8 h 49 min |
| VRAM dedicada al proceso (pico muestreado) | 4,73 GiB |
| Memoria GPU compartida del proceso | 84 MiB |
| VRAM de dispositivo (pico, incluye otra actividad) | 6,84 GiB |
| Working set de RAM del proceso | 4,46 GiB |
| Salida del invitado de tres tokens | `Once upon a` + salto de linea, halt limpio |

## Requisitos de hardware

- VRAM estimada para inferencia: el experimento verificado consume 4,73 GiB de VRAM dedicada al proceso y 6,84 GiB de VRAM de dispositivo en pico (esta última incluye otra actividad de GPU).
- GPU verificada: NVIDIA GeForce GTX 1080 de 8 GiB con driver compatible con CUDA 12.4.
- GPU recomendadas: no se documentan otras; el runtime fijado es Prism b12128 para Windows CUDA 12.4 x64.
- Cabe en GPU consumer: sí, al menos en GTX 1080 de 8 GiB según la verificación publicada.
- RAM de sistema: 4,46 GiB de working set del proceso en la captura registrada.
- Opciones de despliegue: Prism b12128 (llama.cpp modificado) con los ZIP oficiales de aplicación y runtime CUDA; el repositorio incluye launcher `Run.py` para smoke y verificación completa. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp upstream.
- Latencia y throughput: no disponibles; la captura del invitado de tres tokens tardó 8 h 49 min, pero corresponde a una ejecución de verificación con traza, no a inferencia optimizada.

## Comparativa con modelos similares

| Modelo | Parametros (elementos GGUF) | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwenpu-bonsai-4b-stock-prism (este) | 11.840.714.242 combinados; 4.205.751.296 en host | 262.144 | Host Bonsai 2 4B PQ2_0 + bloque MTP con circuito QwenPU | Apache 2.0 | Hugging Face, 649 descargas |
| prism-ml/Ternary-Bonsai-2-4B-gguf (base) | 4.205.751.296 | no disponible en esta ficha | Transformer ternario empaquetado PQ2_0 | no disponible en esta ficha | Hugging Face |
| Receipts 27B y 9B de millrace (mencionados) | no disponible | no disponible | Trazas de comparación del mismo linaje de verificación | no disponible | Referenciados en la evidencia del repositorio |

No se dispone de datos de benchmarks que permitan comparar rendimiento lingüístico con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo conversacional validado: la única salida documentada es un invitado de tres tokens (`Once upon a`); no hay evidencia publicada de calidad en generación libre, razonamiento o código.
- El repositorio declara 11.840.714.242 elementos de tensor, pero incluyen relleno cero y el circuito compilado; el tamaño efectivo de parámetros de lenguaje es el del host (4.205.751.296 elementos), por lo que comparar por número de parámetros del Hub induce a error.
- El bloque MTP con circuito invitado no debe interpretarse como un MoE ni como parámetros activos adicionales; no se documenta su impacto en velocidad de decodificación.
- Dependencia estricta de un runtime modificado y fijado (Prism b12128) y de un commit concreto de QwenPU; no hay garantía de compatibilidad con llama.cpp upstream, vLLM, TGI u Ollama.
- La verificación publicada es solo para Windows x64 con CUDA 12.4 y GTX 1080; el comportamiento en otras GPU, sistemas operativos o versiones de driver no está documentado.
- La captura del invitado tarda 8 h 49 min, lo que refleja un proceso de trazado y verificación, no un uso interactivo.
- Idiomas soportados no disponibles; no se puede asumir cobertura multilingüe.
- Riesgo de alucinación y sesgos del host Bonsai 2 4B: no evaluados ni documentados en esta información.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo base y el runtime de terceros pueden tener condiciones propias que deben revisarse por separado.
- El artefacto se autodescribe como checkpoint de investigación; no hay evidencia de validación en producción ni de soporte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/millrace-ai/qwenpu-bonsai-4b-stock-prism
- GGUF combinado: https://huggingface.co/millrace-ai/qwenpu-bonsai-4b-stock-prism/resolve/main/Bonsai-2-4B-PQ2_0-QwenPU-Stock-Prism.gguf
- Preprint v1 y artefactos de reproducción: https://research.millrace.ai/bonsai-qwenpu/
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- GGUF base fijado: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf/blob/50ebba61be85e5be07e8083db468ace0fc1bac43/Ternary-Bonsai-2-4B-PQ2_0.gguf
- Runtime Prism (release b12128): https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896
- ZIP de aplicación Prism: https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896/llama-prism-b12128-d7b2896-bin-win-cuda-12.4-x64.zip
- ZIP de runtime CUDA: https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896/cudart-llama-bin-win-cuda-12.4-x64.zip
- Repositorio QwenPU: https://github.com/divagr18/QwenPU
- Commit fijado de QwenPU: https://github.com/divagr18/QwenPU/commit/6e2767aaa59b69ea03300c0a5199d7b36debbe50
- Microsoft Visual C++ x64 Redistributable: https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist
