# millrace-ai/qwenpu-bonsai-4b-stock-prism

## Resumen

`millrace-ai/qwenpu-bonsai-4b-stock-prism` es un checkpoint de investigación publicado por el usuario millrace-ai que integra el circuito RISC-V y vectorial de QwenPU en el bloque de predicción multi-token de un modelo Bonsai 2 4B empaquetado. El modelo base es `prism-ml/Ternary-Bonsai-2-4B-gguf`, un modelo ternario cuantizado en formato PQ2_0. El resultado se distribuye como un único archivo GGUF de 4,03 GB (4.031.384.384 bytes) que conserva el estado oculto nativo de 2.560 dimensiones del modelo anfitrión y los 426 tensores de lenguaje originales en PQ2_0.

La relevancia de este checkpoint no reside en sus capacidades de generación de texto, sino en su función como artefacto de verificación de una integración hardware-software: un circuito RISC-V embebido que ejecuta acciones seleccionadas y solicitudes de caché dentro del propio checkpoint, con un lanzador para Windows que carga el ELF y realimenta las acciones del circuito a través de las APIs de Prism. El autor documenta una ejecución completa verificada en una GeForce GTX 1080 de 8 GiB con Prism b12128 para Windows CUDA 12.4.

El modelo se publica con licencia Apache 2.0, cero descargas y cero likes en el momento de la consulta, y está etiquetado como `endpoints_compatible` y `conversational`. No dispone de pipeline declarado ni de idiomas especificados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Bonsai 2 4B) con bloque de predicción multi-token modificado e integración de circuito RISC-V/vectorial QwenPU; estado oculto de 2.560 dimensiones |
| Parametros totales | 11.840.714.242 (dato real de safetensors del repositorio) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PQ2_0 (cuantización ternaria del modelo base); GGUF empaquetado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Bonsai-2-4B-PQ2_0-QwenPU-Stock-Prism.gguf`) |

## Arquitectura y entrenamiento

El checkpoint parte de `prism-ml/Ternary-Bonsai-2-4B-gguf` y le incorpora el circuito RISC-V y vectorial de QwenPU en el bloque de predicción multi-token. Según la model card, el GGUF combinado retiene el estado oculto nativo de 2.560 dimensiones del anfitrión y preserva los 426 extents originales de tensores de lenguaje en PQ2_0. El circuito utiliza 36.352 filas feed-forward. Los tensores de lenguaje empaquetados que requieren la forma más ancha conservan sus bytes originales y reciben padding neutro.

No se documentan en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El proceso descrito no es un reentrenamiento al uso, sino una integración de un circuito ejecutable dentro del checkpoint: el lanzador de Windows carga el ELF, realimenta las acciones seleccionadas por el circuito y aplica las solicitudes de caché mediante las APIs de Prism. El invitado (guest) se ejecuta en un contexto separado dentro del checkpoint cargado, y una referencia de CPU fijada de forma independiente verifica la ejecución registrada offline.

## Capacidades

- Generación de texto conversacional heredada del modelo base Bonsai 2 4B (etiqueta `conversational`).
- Predicción multi-token mediante el bloque modificado con el circuito QwenPU integrado.
- Ejecución de un circuito RISC-V y vectorial embebido dentro del checkpoint, con realimentación de acciones y solicitudes de caché a través de las APIs de Prism.
- Verificación determinista de trazas de ejecución: la model card reporta la coincidencia de 37.080 registros arquitectónicos, 55.375 escrituras ordenadas del invitado y 726 operaciones VMAT.
- Preservación del estado de decodificación: posición de texto aparcada, caché KV, estado recurrente y logits coincidentes con el Bonsai 2 4B original empaquetado.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Verificación de integraciones hardware-software en modelos cuantizados: el checkpoint sirve como artefacto reproducible para comprobar que un circuito embebido (RISC-V/vectorial) produce trazas arquitectónicas idénticas a una referencia de CPU independiente, con 37.080 registros y 726 operaciones VMAT auditados.
- Investigación en cuantización ternaria: permite estudiar cómo un modelo en PQ2_0 conserva sus 426 tensores de lenguaje originales y su estado oculto de 2.560 dimensiones tras añadir un circuito con 36.352 filas feed-forward y padding neutro.
- Reproducibilidad de ejecuciones largas en GPU de gama consumer: la model card documenta una captura completa de tres tokens en una GTX 1080 de 8 GiB con picos de 4,73 GiB de VRAM dedicada al proceso, útil para validar pipelines de captura y verificación offline (unos 11 minutos de verificación frente a 8 h 49 min de captura).
- Auditoría de checkpoints: el repositorio incluye `evidence/checkpoint.json` con la identidad del checkpoint y la auditoría de exportación, además de sumas SHA-256 y un pin de runtime (`evidence/prism-b12128.json`), lo que facilita la verificación de integridad en entornos de investigación.
- Pruebas de regresión de decodificación especulativa o multi-token: el bloque de predicción multi-token modificado permite comparar la inserción de resultados y la siguiente decodificación contra el modelo original con el mismo historial de texto.
- Desarrollo de lanzadores y tooling para Windows CUDA 12.4: el repositorio documenta el procedimiento completo con PowerShell, incluyendo la descarga de los dos ZIP oficiales de Prism, la creación de un entorno Python 3.11 y la ejecución de un smoke test de 12 instrucciones.
- Validación de portabilidad de verificadores: la model card describe un replay portable del verificador empaquetado que reproduce la misma traza arquitectónica, las comprobaciones físicas de caché y el handoff de Bonsai desde la captura archivada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de verificación de ejecución y de consumo de recursos:

| Metrica de ejecucion | Valor |
|---|---|
| Duracion de la captura del invitado | 8 h 49 min |
| VRAM dedicada al proceso (pico muestreado) | 4,73 GiB |
| Memoria GPU compartida del proceso | 84 MiB |
| VRAM a nivel de dispositivo (pico) | 6,84 GiB |
| Working set de RAM del proceso | 4,46 GiB |
| Registros arquitectonicos verificados | 37.080 |
| Escrituras ordenadas del invitado | 55.375 |
| Operaciones VMAT | 726 |
| Duracion de la verificacion offline | ~11 min |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 4,03 GB en disco; la ejecución verificada registró un pico de 4,73 GiB de VRAM dedicada al proceso y 6,84 GiB a nivel de dispositivo (incluyendo otra actividad de GPU).
- GPU verificada: NVIDIA GeForce GTX 1080 de 8 GiB con Prism b12128 para Windows CUDA 12.4.
- Driver: NVIDIA compatible con CUDA 12.4.
- Cabe en GPU consumer: sí, según la verificación documentada en la GTX 1080 de 8 GiB.
- Opciones de despliegue: Prism (fork de llama.cpp de PrismML-Eng) en su build b12128 para Windows CUDA 12.4 x64; se requieren `llama.dll` y `cudart64_12.dll` en el mismo directorio de runtime.
- Entorno de reproducción: Windows x64 nativo, Hugging Face `hf` CLI, Git, Python 3.11 x64 con NumPy 2.4.6 e ijson 3.4.0.post0, y Microsoft Visual C++ x64 Redistributable.
- Almacenamiento: al menos 6 GiB libres para archivos de captura tras descargar modelos y runtime.
- Latencia y throughput: no disponibles. La captura de tres tokens requirió 8 h 49 min en el hardware probado, un dato que refleja el coste del registro de trazas y la verificación, no el throughput de inferencia normal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| millrace-ai/qwenpu-bonsai-4b-stock-prism | 11.840.714.242 | no disponible | PQ2_0 / GGUF | Apache 2.0 | Hugging Face, 0 descargas |
| prism-ml/Ternary-Bonsai-2-4B-gguf (modelo base) | no disponible | no disponible | PQ2_0 / GGUF | no disponible | Hugging Face (revision 50ebba61be85e5be07e8083db468ace0fc1bac43) |
| Bonsai 2 4B original empaquetado (control) | no disponible | no disponible | PQ2_0 | no disponible | Referenciado como control en la model card |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Checkpoint de investigación: el propio autor lo describe como "research checkpoint"; no hay evidencia de uso en producción ni de evaluación de calidad de generación.
- Cero descargas y cero likes en el momento de la consulta: no existe validación independiente por parte de la comunidad.
- Sin pipeline declarado ni idiomas especificados: se desconoce el soporte multilingüe real y el comportamiento conversacional más allá de la etiqueta.
- Longitud de contexto no disponible: no se puede garantizar el manejo de conversaciones largas.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad factual.
- Sesgos conocidos: no documentados en la información disponible.
- Proceso de reproducción costoso: la captura completa de tres tokens tarda unas 9 horas en una GTX 1080 y requiere unos 6 GiB adicionales de almacenamiento para las capturas.
- Dependencia de un runtime específico: la ejecución verificada requiere Prism b12128 para Windows CUDA 12.4 y los dos ZIP oficiales; no se documenta compatibilidad con vLLM, Ollama, TGI u otras herramientas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base (`prism-ml/Ternary-Bonsai-2-4B-gguf`) no se detalla en la información disponible y debe verificarse antes de un uso comercial.
- El padding neutro aplicado a los tensores de lenguaje que requieren la forma más ancha puede alterar el comportamiento en rutas no cubiertas por la verificación documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/millrace-ai/qwenpu-bonsai-4b-stock-prism
- Descarga del GGUF: https://huggingface.co/millrace-ai/qwenpu-bonsai-4b-stock-prism/resolve/main/Bonsai-2-4B-PQ2_0-QwenPU-Stock-Prism.gguf
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- Repositorio QwenPU: https://github.com/divagr18/QwenPU
- Prism (fork de llama.cpp): https://github.com/PrismML-Eng/llama.cpp
- Release de Prism b12128: https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896
- ZIP de aplicación Prism (Windows CUDA 12.4): https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896/llama-prism-b12128-d7b2896-bin-win-cuda-12.4-x64.zip
- ZIP de runtime CUDA: https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896/cudart-llama-bin-win-cuda-12.4-x64.zip
- Microsoft Visual C++ x64 Redistributable: https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist
