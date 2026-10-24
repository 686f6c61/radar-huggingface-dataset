# AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP

## Resumen

AX-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP es una conversión de cuantización del checkpoint peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP, publicada por AutomatosX dentro de su colección Tiel Coder. Se trata de un modelo de generación de texto orientado a programación, con arquitectura Qwen3.5 MoE (tag `qwen3_5_moe`), 34.660.608.768 parámetros totales y empaquetado en formato MLX para Apple Silicon. El autor lo describe explícitamente como un artefacto de investigación de desarrollo, no certificado.

La particularidad del checkpoint es su esquema de cuantización AXQ: un empaquetado afín de 6 bits con protección de mayor precisión en determinadas capas, con un presupuesto declarado de 7,5 bits por peso y un almacenamiento medido de 7,490084 BPW (31,3486 GiB de pesos). No es uniformemente de 6 bits ni equivale a MXFP6: el 93,0325 % de los parámetros lógicos reside en 6 bits, el 1,9582 % en 8 bits y el 5,0093 % en bf16. Además, el sufijo `-MTP` indica que se conserva el payload de multi-token prediction del origen, aunque el autor advierte que su ejecución, tasa de aceptación y aceleración no están verificadas.

Su relevancia es doble: por un lado, permite ejecutar un MoE de 35B con unos 3B parámetros activos en hardware Apple con un peso de 31,35 GiB; por otro, es un ejemplo de cadena de cuantización sobre un checkpoint ya cuantizado (oQ6e), lo que implica que no recupera información BF16 perdida en el origen. La licencia declarada aguas arriba es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`); incluye torre de visión y pesos MTP empaquetados, no verificados en ejecución |
| Parámetros totales | 34.660.608.768 |
| Parámetros activos | Aproximadamente 3B (según la nomenclatura `A3B` del nombre; no confirmado en la model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | AXQ afín de 6 bits con precisión mixta: 93,0325 % de parámetros en 6 bits, 1,9582 % en 8 bits, 5,0093 % en bf16; 7,490084 BPW medidos |
| Idiomas soportados | No disponible |
| Licencia | MIT (declarada en el repositorio origen; se mantiene la atribución a peculiar-ragdoll y ornith-ai) |
| Formato de pesos | Safetensors en formato MLX (librería `mlx`), con `config.json`, `axquant_plan.json`, `axquant_compatibility.json` y `axquant_mtp_sidecar_manifest.json` |
| Tamaño del repositorio | 33,7 GB (pesos: 33.660.273.640 bytes / 31,3486 GiB) |
| Revisión origen fijada | `88625754ac91b542280a5602239ce6b2166366f0` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos de la familia Qwen3.5, según el tag `qwen3_5_moe` del repositorio. El checkpoint incluye, además del tronco de texto, una torre de visión y pesos de multi-token prediction (MTP) heredados del origen. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF, DPO u otras) del modelo original; la model card de esta conversión no los documenta y remite a la ficha del repositorio de origen.

El trabajo técnico de esta publicación es exclusivamente de cuantización. Se parte de un checkpoint ya cuantizado (oQ6e) y se recuantiza con AXQ, un esquema afín por grupos con presupuesto de 7,5 bits por peso y protección de precisión en módulos seleccionados: un 5 % de los parámetros lógicos se mantiene en bf16 y cerca de un 2 % en 8 bits. Los tamaños de grupo y las anulaciones por módulo están en `config.json` y `axquant_plan.json`. Se conservan la plantilla de chat Sharp del origen y el payload MTP protegido. El autor subraya tres límites: la conversión no recupera información BF16 ya perdida, no reproduce el proceso de calibración del origen y no hereda los resultados upstream de GGUF, SWE-bench, calidad ni velocidad MTP.

## Capacidades

- Generación de texto y comportamiento conversacional (`pipeline_tag: text-generation`, tags `conversational` y `development`), con la plantilla de chat Sharp del checkpoint origen.
- Orientación a programación y desarrollo, deducible del nombre del modelo y del tag `development`; no hay evaluación de calidad de código publicada para esta revisión.
- Razonamiento aritmético básico verificado en un smoke test: el modelo devolvió `42` en una prueba aritmética corta.
- Seguimiento de instrucciones de formato estricto verificado: salida de palabra exacta `READY` en el segundo smoke test.
- Pesos de multi-token prediction (MTP) presentes en el paquete, pero sin verificación de ejecución, aceptación ni aceleración.
- Pesos de visión presentes como sidecar, pero no verificados: la ruta de carga probada desactiva la torre de visión y no soporta inferencia de imagen en esta revisión.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de esquemas de cuantización agresiva: este checkpoint sirve como sujeto de prueba para comparar AXQ de 6 bits con precisión mixta frente a MXFP4 y MXFP8 sobre el mismo modelo base, midiendo degradación en tareas de código con un presupuesto de 7,49 BPW.
- Asistencia de programación local en Mac: con 34,66B parámetros totales y unos 3B activos, el coste por token generado es bajo en relación al tamaño, lo que permite mantener un asistente de autocompletado y refactorización en un equipo Apple Silicon de 64 GB o más sin salir a la nube.
- Smoke testing de pipelines MLX: los dos tests publicados (aritmética y palabra exacta) proporcionan una base reproducible para validar rutas de carga y generación en MLX-VLM antes de desplegar variantes mayores.
- Auditoría de cadenas de cuantización sobre checkpoints ya cuantizados: el repositorio incluye manifiestos (`axquant_plan.json`, `axquant_compatibility.json`, `axquant_mtp_sidecar_manifest.json`) que permiten trazar ficheros, plan de precisión, ejecución del cuantizador y comprobaciones de compatibilidad en tiempo de ejecución.
- Reproducción de experimentos con revisión inmutable: al fijar el commit del origen y el commit del Hub, es adecuado para trabajos académicos que requieran artefactos bit a bit reproducibles en estudios de cuantización.
- Prototipado de decodificación especulativa con MTP: los pesos MTP empaquetados permiten investigar la integración de multi-token prediction en runtimes MLX, asumiendo que la aceleración no está medida y debe validarse por cuenta propia.
- Base para ajuste fino ligero o evaluación de código en entornos con licencia permisiva: la licencia MIT declarada aguas arriba facilita su uso en trabajos internos y publicaciones, manteniendo la atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no existe benchmark de calidad ni certificado para esta revisión, y que los resultados upstream (GGUF, SWE-bench) no son transferibles. Las únicas evidencias publicadas son dos pruebas cortas de texto en MLX-VLM 0.7.9 / MLX 0.32.4 sobre `Device(gpu, 0)`: una operación aritmética que produjo `42` y una salida de palabra exacta que produjo `READY`.

| Ámbito | Estado declarado |
|---|---|
| MLX-VLM | Smoke test de texto limitado (carga y generación) |
| MLX-LM | No probado; no se debe inferir equivalencia por cargar correctamente |
| AX Engine | No medido; el manifiesto nativo incluido no es evidencia de ejecución |
| omlx | No soportado; sin afirmaciones de carga, generación ni MTP |
| mtplx | No soportado; sin afirmaciones de carga, generación ni MTP |
| Calidad de código, contexto largo, visión, vídeo, MTP | No establecidos |

## Requisitos de hardware

- VRAM o memoria unificada: los pesos ocupan 31,3486 GiB (33.660.273.640 bytes) a 7,490084 BPW. El autor advierte que los bytes de pesos no determinan el pico de memoria en ejecución, por lo que hay que añadir el overhead de caché KV, activaciones y buffers del runtime.
- Hardware objetivo: Apple Silicon con MLX (Metal). No es un artefacto para GPU NVIDIA, ya que el formato de pesos es MLX y la única ruta verificada es MLX-VLM sobre Metal.
- Recomendación práctica: equipos con 64 GB de memoria unificada o más, dado que 31,35 GiB de pesos dejan poco margen en configuraciones de 32 GB o 36 GB.
- Cabe en GPU de consumo: sí, en el sentido de Apple Silicon de gama alta (M-series Pro/Max/Ultra). No hay datos publicados de ejecución en RTX 4090 u otras GPU discretas, y el formato no es directamente compatible con ellas.
- Opciones de despliegue: MLX-VLM 0.7.9 con MLX 0.32.4 es la única combinación probada. MLX-LM, AX Engine, omlx y mtplx no están validados para este artefacto. No hay soporte declarado de vLLM, llama.cpp, Ollama ni TGI, dado el formato MLX.
- Latencia y throughput: no medidos para esta revisión. Como referencia de la variante hermana MXFP4 (4 bits) en un M4 Pro de 20 núcleos y 64 GB, la fuente externa cita 1.050 tok/s de prefill y 72,2 tok/s de generación; esos números no son trasladables a este checkpoint de 6 bits.
- Carga y evaluación: `pip install -U huggingface_hub mlx-vlm` y `hf download AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP --local-dir ./AX-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP`, fijando el commit inmutable del Hub para reproducibilidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Estado de validación |
|---|---|---|---|---|---|
| AX-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP (este) | 34,66B totales, ~3B activos | AXQ afín 6 bits mixto, 7,490084 BPW, 31,35 GiB | No disponible | MIT | Smoke test de texto en MLX-VLM |
| AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP8-MTP | Mismo modelo base | MXFP8 | No disponible | MIT (presumible, mismo origen) | No disponible |
| AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP | Mismo modelo base | MXFP4, ~19,5 GB de VRAM según fuente externa | No disponible | MIT (presumible, mismo origen) | Rendimiento citado en M4 Pro 20c/64GB: 1.050 tok/s PP, 72,2 tok/s TG |
| peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP (origen) | Mismo modelo base | oQ6e (origen de la recuantización) | No disponible | MIT | Resultados upstream no trasladables a este artefacto |

No se dispone de modelos comparables de otros autores con datos verificables en la información proporcionada; la comparación se limita a las variantes de la misma familia.

## Limitaciones y advertencias

- Artefacto de investigación no certificado: el propio autor lo etiqueta como `Research development artifact, not certified`, sin benchmark de calidad ni certificado para esta revisión.
- Recuantización sobre cuantización: al partir de un checkpoint oQ6e ya cuantizado, no se recupera información BF16 perdida en el origen ni se reproduce su calibración. La pérdida acumulada de precisión no está medida.
- El nombre induce a error: no es MXFP6 ni un checkpoint uniformemente de 6 bits. Es empaquetado afín de 6 bits con protección de mayor precisión en capas seleccionadas (5 % en bf16, ~2 % en 8 bits).
- MTP no verificado: el sufijo `-MTP` describe pesos empaquetados, no una aceleración medida. La ejecución, la tasa de aceptación y la ganancia de velocidad están sin validar.
- Visión no funcional en la ruta probada: la torre de visión existe como sidecar, pero la ruta de carga verificada la desactiva y no soporta inferencia de imagen.
- Compatibilidad de runtime muy estrecha: solo MLX-VLM 0.7.9 / MLX 0.32.4 con smoke test de texto. MLX-LM, omlx y mtplx no están soportados; cualquier export de índices, normas o n-gramas específico de un runtime es un artefacto distinto que requiere su propia validación.
- Contexto e idiomas sin documentar: no hay longitud de contexto declarada ni lista de idiomas, por lo que no se debe asumir comportamiento en contextos largos ni cobertura multilingüe.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en esta revisión; no hay ninguna métrica de robustez, toxicidad o sesgo disponible.
- Licencia: MIT declarada en el repositorio origen, pero el autor recomienda consultar la ficha upstream para procedencia y términos. Se debe conservar la atribución a peculiar-ragdoll y ornith-ai.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los fallos estén detectados por terceros.
- Memoria: 31,35 GiB de pesos implican que configuraciones de 32 GB de memoria unificada quedan al límite o por debajo del pico real necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-6bit-MTP
- Checkpoint origen (revisión `88625754ac91b542280a5602239ce6b2166366f0`): https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ6e-MTP/tree/88625754ac91b542280a5602239ce6b2166366f0
- Colección Tiel Coder de AutomatosX: https://huggingface.co/collections/AutomatosX/tiel-coder
- Variante hermana MXFP8: https://huggingface.co/AutomatosX/AX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP8-MTP
- Ficha externa de la variante MXFP4 en LLM Explorer: https://llm-explorer.com/model/AutomatosX%2FAX-Tiel-Coder-35B-A3B-MLX-AXQ-MXFP4-MTP,17h6B0MbbWrLiNvddCMsuz
- Benchmark externo de la variante MXFP4 en omlx: https://omlx.ai/benchmarks/performance/9rutpc6h
- Registro externo de la variante MXFP4 en free2aitools: https://free2aitools.com/model/automatosx/ax-tiel-coder-35b-a3b-mlx-axq-mxfp4-mtp
