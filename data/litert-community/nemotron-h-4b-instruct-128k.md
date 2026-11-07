# litert-community/Nemotron-H-4B-Instruct-128K

## Resumen

Nemotron-H-4B-Instruct-128K es un modelo de lenguaje de 4.000 millones de parámetros desarrollado por NVIDIA, distribuido originalmente en Hugging Face bajo la licencia NVIDIA Internal Scientific Research and Development Model License. La ficha que nos ocupa corresponde a una conversión comunitaria realizada por litert-community al formato LiteRT-LM (`.litertlm`), pensada para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM de Google, sucesor de TensorFlow Lite. El modelo base emplea una arquitectura híbrida poco habitual: combina capas Mamba2 de escaneo selectivo con capas MLP y un pequeño número de capas de atención con grouped-query attention.

La relevancia de esta conversión radica en su propuesta de eficiencia en memoria: al sustituir la mayor parte de la atención por estado recurrente de tamaño constante, el consumo de memoria crece muy poco con la longitud del contexto, lo que facilita el despliegue en dispositivos móviles y edge. No obstante, el archivo convertido (`Nemotron-H-4B-Instruct-128K_int8.litertlm`) fue retirado del repositorio el 15 de octubre de 2026 por restricciones de la licencia del modelo fuente, que prohíbe la distribución de modelos derivados. Por tanto, la ficha documenta un artefacto que ya no está disponible para descarga, aunque las mediciones y la descripción técnica se conservan como registro.

El contexto declarado es de 128.000 tokens, si bien la conversión concreta limita el presupuesto KV de las cuatro capas de atención a 4.096 tokens. El modelo está orientado a generación de texto y conversación instructiva, con soporte de plantilla de chat propia de la familia Nemotron-H.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas Mamba2 (selective scan) + 24 capas MLP + 4 capas de atención GQA (52 capas en total) |
| Parametros totales | 4B (aproximadamente 4.000 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K declarados en el modelo base; la conversión LiteRT-LM limita el presupuesto KV de las 4 capas de atención a 4.096 tokens |
| Tipos de cuantizacion | int8 dinámica en capas lineales y embedding; convoluciones y scan en float; activaciones fp32 declaradas para GPU |
| Idiomas soportados | no disponible |
| Licencia | nvidia-internal-scientific-research-and-development-model-license (prohíbe distribución de modelos derivados; el archivo convertido fue retirado el 2026-10-15) |
| Formato de pesos | `.litertlm` (LiteRT-LM); tamaño del archivo int8: 4,81 GB (4.806.777.392 bytes) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de tres tipos de capa: 24 capas Mamba2 con selective scan, 24 capas MLP convencionales y 4 capas de atención con grouped-query attention, sumando 52 capas. Las capas Mamba2 mantienen un estado recurrente de convolución y SSM de tamaño constante, las capas MLP no mantienen estado y solo las cuatro capas de atención conservan KV cache. El resultado es que la memoria de inferencia permanece prácticamente plana respecto a la longitud del contexto, una ventaja sustancial frente a transformers densos del mismo tamaño en escenarios de contexto largo o conversaciones multi-turno.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo base. La conversión a LiteRT-LM se realizó con `litert_torch.convert` sin modificar el modelo, y se validó la paridad numérica frente a PyTorch: diferencia máxima de logits de 5,8e-05 en 8 posiciones de decodificación, correlación 1.000000 y top-1/top-5 idénticos en todas las posiciones. Se exportaron firmas de prefill multi-longitud (1 a 1024) para que el runtime seleccione fragmentos ajustados, y el bundle incluye el tokenizador y la plantilla de chat estándar de Nemotron-H. Requiere litert-lm ≥ 0.15.

## Capacidades

- Generación de texto conversacional e instructiva, con plantilla de chat propia de la familia Nemotron-H.
- Razonamiento aritmético básico y respuesta a preguntas de conocimiento general (validado en pruebas de sanidad de 8 preguntas, 8/8 en CPU y GPU).
- Soporte de tool calling: la plantilla de chat admite la forma de content-parts de litert-lm 0.18 y el modelo puede emitir marcado de llamada a herramientas (`<TOOLCALL>`), aunque en las pruebas registradas produjo respuestas vacías en algunos casos.
- Ejecución en GPU y CPU dentro del runtime LiteRT-LM, con respuestas idénticas entre backends en la sonda compuesta.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente conversacional en dispositivo móvil: el modelo puede mantener conversaciones multi-turno en un teléfono (validado en iPhone 17 Pro con backend Metal y CPU) con un consumo de memoria que apenas crece con el contexto, gracias al estado recurrente de las capas Mamba2.
- Respuesta a preguntas de conocimiento general y aritmética simple en aplicaciones offline: adecuado para asistentes locales que deben funcionar sin conectividad, con latencia de primera token de 0,37 s en GPU según las mediciones en Apple M4 Max.
- Automatización de tareas con llamada a herramientas en edge: la plantilla de chat soporta la forma de content-parts y el modelo emite marcado de tool call, lo que permite integrarlo en flujos de agente locales, aunque requiere validación adicional por los casos de tool call vacío observados.
- Procesamiento de documentos largos en dispositivos con memoria limitada: el modelo base declara 128K de contexto y la arquitectura híbrida mantiene la memoria casi constante, si bien la conversión concreta limita el KV de atención a 4.096 tokens, por lo que el contexto efectivo práctico es menor.
- Prototipado de aplicaciones LiteRT-LM: sirve como referencia para desarrolladores que quieran evaluar el runtime con un modelo híbrido Mamba2/atención, incluyendo la benchmark de prefill y decodificación.
- Investigación sobre arquitecturas híbridas en edge: útil para estudiar el comportamiento de modelos con estado recurrente en hardware móvil y comparar paridad numérica entre backends GPU y CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas mediciones disponibles son de rendimiento de inferencia y de corrección numérica:

| Metrica | Valor |
|---|---|
| Paridad de logits vs PyTorch (max diferencia) | 5,8e-05 |
| Correlación de logits | 1.000000 |
| Top-1 / top-5 idénticos | Sí, en 8 posiciones |
| Prueba de sanidad de 8 preguntas (CPU) | 8/8 |
| Prueba de sanidad de 8 preguntas (GPU) | 8/8 |
| Prefill (256 tokens), GPU, Apple M4 Max | 724 tok/s |
| Decodificación, GPU, Apple M4 Max | 75,0 tok/s |
| TTFT, GPU, Apple M4 Max | 0,37 s |

Mediciones realizadas con `litert-lm benchmark` (litert-lm 0.16.0), `-p 256 -d 256 --runs 3 --cache no`, en una máquina Apple M4 Max en silencio.

## Requisitos de hardware

- VRAM/almacenamiento: el archivo int8 ocupa 4,81 GB; la memoria de inferencia se mantiene casi plana con la longitud del contexto gracias al estado recurrente de Mamba2 y al presupuesto KV limitado a 4.096 tokens en las cuatro capas de atención.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; las pruebas documentadas se realizaron en Apple M4 Max (GPU) e iPhone 17 Pro (Metal y CPU).
- Cabe en GPU de consumo: sí, por tamaño (4,81 GB en int8), aunque no se documentan pruebas en RTX 4090 u otras GPU de consumo; el runtime objetivo es LiteRT-LM en dispositivos móviles y edge.
- Opciones de despliegue: LiteRT-LM (litert-lm ≥ 0.15), con backends GPU y CPU; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: prefill de 724 tok/s, decodificación de 75,0 tok/s y TTFT de 0,37 s en Apple M4 Max con backend GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. Como referencia cualitativa, el modelo base NVIDIA Nemotron-H-4B-Instruct-128K es la alternativa directa en formato Hugging Face estándar, y la familia Nemotron-H incluye variantes de mayor tamaño no documentadas aquí. La colección litert-community incluye otros modelos en formato LiteRT-LM (por ejemplo, Qwen3-4B y modelos de las familias Gemma y Qwen), pero no se aportan datos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El archivo convertido fue retirado del repositorio el 15 de octubre de 2026: la licencia del modelo fuente (NVIDIA Internal Scientific Research and Development Model License, sección 3) no permite distribuir el modelo ni modelos derivados. No es descargable en la actualidad.
- Restricción de licencia para uso comercial: la licencia NVIDIA Internal Scientific Research and Development Model License está orientada a investigación científica interna y no autoriza la redistribución de derivados; debe revisarse antes de cualquier uso en producción.
- Riesgo de alucinación: no se documentan evaluaciones específicas; en la sonda registrada, una respuesta aritmética fue incorrecta de forma idéntica en ambos backends, atribuido a un efecto de cuantización sobre el prompt compuesto.
- Limitación de contexto efectivo: aunque el modelo base declara 128K, la conversión limita el presupuesto KV de las cuatro capas de atención a 4.096 tokens, por lo que el contexto práctico es menor.
- Idiomas soportados: no disponible; no se puede garantizar un rendimiento multilingüe adecuado.
- Bug conocido del runtime: en litert-lm 0.18.0, un Engine que ya ha ejecutado una conversación reutiliza el estado recurrente de la anterior al iniciar una nueva, sin reiniciarlo. Se recomienda crear un Engine nuevo por conversación. Existe un fix en la rama principal de LiteRT-LM desde el 3 de noviembre de 2026 (commit e1f86b05), pero ninguna versión publicada lo incluye (v0.19.1 no lo incorpora).
- Tool calling inestable: en las pruebas registradas, el modelo devolvió marcado de tool call vacío (`<TOOLCALL>[]</TOOLCALL>`) en lugar de respuestas esperadas en algunos casos, lo que exige validación adicional antes de usarlo en flujos de agente.
- La model card original indicaba por error la NVIDIA Open Model License; la corrección posterior confirma que la licencia aplicable es la Internal Scientific Research and Development.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/litert-community/Nemotron-H-4B-Instruct-128K
- Model card (README): https://huggingface.co/litert-community/Nemotron-H-4B-Instruct-128K/blob/main/README.md
- Modelo base: https://huggingface.co/nvidia/Nemotron-H-4B-Instruct-128K
- Licencia NVIDIA Internal Scientific Research and Development Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-internal-scientific-research-and-development-model-license/
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue abierto sobre el estado recurrente entre conversaciones: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Pull request relacionado: https://github.com/google-ai-edge/LiteRT-LM/pull/3945
- Commit con el fix en main: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Benchmark de paridad en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
- Organización litert-community: https://huggingface.co/litert-community
