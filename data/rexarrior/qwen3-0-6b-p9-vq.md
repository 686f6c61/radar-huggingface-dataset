# rexarrior/Qwen3-0.6B-P9-VQ

## Resumen

Qwen3-0.6B-P9-VQ es un artefacto de investigación publicado por el usuario rexarrior en Hugging Face, consistente en una compresión extrema mediante cuantización vectorial (VQ) del modelo base Qwen/Qwen3-0.6B de Alibaba Qwen. No se trata de un modelo entrenado desde cero, sino de un derivado experimental que sustituye los pesos de las proyecciones por índices a libros de códigos (codebooks) de 256 entradas, manteniendo fijos los índices, las escalas y el embedding durante el ajuste. El objetivo declarado es explorar los límites de la compresión de modelos transformer manteniendo un formato ejecutable.

El modelo base Qwen3-0.6B es un transformer denso de aproximadamente 596 millones de parámetros (0,8B según la model card original de Qwen, contando el embedding atado), con capacidades multilingües, de generación de texto, código y matemáticas. La versión P9-VQ reduce el peso en disco a 245,78 MB en formato GGUF nativo, aunque requiere un parche específico sobre llama.cpp (commit 8bb3cf0d) y no es compatible con la versión estándar de llama.cpp.

La relevancia de este artefacto es fundamentalmente metodológica: documenta un protocolo de compresión con evaluación in-house transparente (evaluation.json, SHA256SUMS) y un repositorio de reproducción. Los resultados publicados por el propio autor muestran un deterioro severo de las capacidades: 0/48 en trayectorias de uso de herramientas nuevas, 0/48 en el conjunto conocido A6, 7/48 en A8, y 13/96 en inglés estricto. Es, por tanto, un objeto de estudio sobre compresión, no un modelo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) con proyecciones cuantizadas vectorialmente |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 2048`) |
| Tipos de cuantizacion | Cuantización vectorial: codebooks de 256 entradas para vectores de 2 o 4 pesos por proyección; codebook escalar de 16 entradas para el embedding atado; escala por grupo de 128 pesos |
| Idiomas soportados | no disponible (la evaluación in-house incluye una prueba de "strict English") |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (nativo, requiere parche); export portable a Transformers mediante instrucciones de decodificación |

## Arquitectura y entrenamiento

El modelo parte del checkpoint fijado de Qwen/Qwen3-0.6B (revisión c1899de289a04d12100db370d81485cdf75e47ca). Sobre esa base, la compresión P9-VQ agrupa los pesos en bloques de 128 con una escala compartida, y cada proyección se representa mediante índices fijos a un codebook de 256 entradas cuyos elementos son vectores de dos o cuatro pesos. El embedding atado utiliza un codebook escalar independiente de 16 entradas. Los libros de códigos iniciales se ajustaron usando activaciones de calibración.

El entrenamiento de la variante P9 se limitó a los codebooks de proyección, con 173.056 parámetros entrenables durante 112 actualizaciones; los índices, las escalas y el embedding permanecieron congelados. No se documenta en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO; al ser una compresión del modelo base, esas etapas corresponden al Qwen3-0.6B original y no se detallan aquí. La innovación técnica destacable es el propio esquema de cuantización vectorial con codebooks compartidos por grupo y su integración en un kernel nativo de llama.cpp mediante parche.

## Capacidades

- Generación de texto autoregresiva en el formato del modelo base Qwen3-0.6B, con calidad degradada según la evaluación del autor.
- Razonamiento, código y matemáticas heredados teóricamente del base, pero sin evidencia de que se conserven tras la compresión (0/48 en trayectorias de herramientas).
- Soporte de tool calling / function calling: el modelo base lo soporta, pero la evaluación in-house reporta 0/48 en trayectorias nuevas y 0/24 en predicción de siguiente acción, por lo que en la práctica no es fiable.
- Capacidades multilingües: no verificadas; la única prueba lingüística publicada es "strict English" con 13/96.
- Modo thinking: no disponible en la información proporcionada para este artefacto.
- Visión y audio: no disponibles.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como caso de estudio reproducible para medir el impacto de la cuantización vectorial agresiva en un transformer pequeño, con código y receta en el repositorio qwen3-compression-lab.
- Reproducción de experimentos académicos: el artefacto incluye evaluation.json, SHA256SUMS y archivos de método, lo que permite replicar las métricas y comparar con otras variantes de compresión.
- Desarrollo de kernels y tooling: el parche native-vq.patch sobre llama.cpp (commit 8bb3cf0d) es un punto de partida para implementar decodificación VQ en motores de inferencia.
- Pruebas de pipelines de decodificación portable: el export a Transformers descrito en method/README.md permite integrar el modelo en flujos de Hugging Face para validar la fidelidad de la reconstrucción.
- Benchmarking de latencia y huella de memoria: con 245,78 MB en disco, es útil para medir el coste mínimo de un LLM ejecutable en CPU y comparar con cuantizaciones GGUF convencionales.
- Docencia sobre cuantización: ilustra de forma tangible la diferencia entre cuantización escalar (Q4, Q8) y cuantización vectorial con codebooks, y sus límites prácticos.
- No se recomienda para atención al cliente, generación de código en producción, agentes autónomos ni ninguna tarea que requiera fiabilidad, dado el rendimiento reportado.

## Benchmarks y rendimiento

Evaluación in-house publicada por el autor (recuento de aciertos sobre el total de tareas):

| Prueba | Resultado |
|---|---:|
| Trayectorias de uso de herramientas nuevas (Fresh) | 0/48 |
| Trayectorias conocidas A6 | 0/48 |
| Trayectorias conocidas A8 | 7/48 |
| Siguiente acción a partir del historial | 0/24 |
| Continuación completa a partir del historial | 0/24 |
| Inglés estricto | 13/96 |
| Perplejidad en *Alice in Wonderland* (menor es mejor) | 35,4717 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible para este artefacto. Las cifras anteriores corresponden a protocolos propios del autor y no son directamente comparables con las del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en el formato nativo (245,78 MB de pesos en disco más overhead del motor y contexto); con contexto de 2048 tokens, el consumo adicional de KV cache es mínimo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; el ejemplo oficial compila con `GGML_METAL=ON`, orientado a Apple Silicon. También es viable en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050 en adelante, RTX 3060, RTX 4090) e incluso en placas integradas.
- Opciones de despliegue: llama.cpp parcheado (compilación específica con native-vq.patch y commit 8bb3cf0d) mediante `llama-server`; export portable a Transformers siguiendo method/README.md. No es compatible con llama.cpp estándar, Ollama, vLLM ni TGI en el formato nativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| rexarrior/Qwen3-0.6B-P9-VQ | 596 M | no disponible | GGUF nativo parcheado | apache-2.0 | Compresión VQ extrema; 0/48 en tool use; 245,78 MB en disco |
| Qwen/Qwen3-0.6B | ~0,8 B (596 M safetensors) | no disponible en la información | safetensors, Transformers | apache-2.0 | Modelo base multilingüe con código y matemáticas; referencia de calidad |
| Cuantizaciones GGUF estándar de Qwen3-0.6B (Q4, Q8) | 596 M | heredado del base | GGUF estándar | apache-2.0 | Compatibles con llama.cpp, Ollama y ecosistema GGUF sin parches |

La comparación directa con cuantizaciones GGUF convencionales no puede cuantificarse con los datos disponibles, ya que el autor no publica métricas frente a Q4 o Q8 del mismo modelo base. La diferencia principal es operativa: el formato P9-VQ exige un motor modificado, mientras que las cuantizaciones estándar funcionan en tooling ampliamente soportado.

## Limitaciones y advertencias

- Deterioro severo de capacidades: 0/48 en trayectorias de herramientas y 0/24 en continuación de historial según la evaluación del propio autor; no es apto para tareas de agente o tool calling.
- Perplejidad elevada (35,4717 en el conjunto de Alice) frente a lo esperable en el modelo base, lo que indica pérdida sustancial de modelado del lenguaje.
- Inglés estricto con solo 13/96 aciertos; el multilingüismo no está verificado y probablemente degradado.
- Compatibilidad restringida: el GGUF nativo no funciona con llama.cpp estándar, Ollama, vLLM ni TGI; requiere aplicar un parche y fijar un commit concreto.
- Riesgo de alucinación elevado por la compresión agresiva y la falta de ajuste fino posterior sobre el artefacto.
- Sesgos: no documentados en la información disponible; hereda los del modelo base Qwen3-0.6B, no evaluados aquí.
- Licencia apache-2.0 permite uso comercial del artefacto, pero su calidad lo desaconseja en producción; verificar además las condiciones del modelo base.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta; sin validación independiente de terceros.
- Longitud de contexto no especificada para el artefacto; el ejemplo de ejecución limita a 2048 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rexarrior/Qwen3-0.6B-P9-VQ
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Checkpoint fijado del base: https://huggingface.co/Qwen/Qwen3-0.6B/tree/c1899de289a04d12100db370d81485cdf75e47ca
- Repositorio del proyecto de compresión: https://github.com/Rexarrior/qwen3-compression-lab
- Receta del modelo P9: https://github.com/Rexarrior/qwen3-compression-lab/blob/main/models/p9.md
- Archivos de método y reproducción: https://huggingface.co/rexarrior/Qwen3-0.6B-P9-VQ/tree/main/method
- Puntuaciones legibles por máquina: https://huggingface.co/rexarrior/Qwen3-0.6B-P9-VQ/blob/main/evaluation.json
- Sumas de verificación SHA-256: https://huggingface.co/rexarrior/Qwen3-0.6B-P9-VQ/blob/main/SHA256SUMS
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Qwen3-0.6B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_0_6b
