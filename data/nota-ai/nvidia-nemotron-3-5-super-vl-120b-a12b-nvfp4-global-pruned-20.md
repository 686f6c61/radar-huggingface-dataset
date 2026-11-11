# nota-ai/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-Global-Pruned-20

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-Global-Pruned-20 es una variante podada del modelo multimodal Nemotron-3.5-Super-VL-120B-A12B de NVIDIA, publicada por nota-ai. Se trata de un modelo de arquitectura híbrida Nemotron-H (transformer con componentes de espacio de estados, según el identificador `nemotron_h_omni` de la librería transformers) con mezcla de expertos (MoE), cuantizado en NVFP4 y posteriormente sometido a una poda no uniforme del 20 % de los expertos enrutados. El resultado es un checkpoint de 58 GiB frente a los 70 GiB del original, sin reentrenamiento.

La intervención de nota-ai no es una poda genérica: aplica dos técnicas propias, Language-Following Expert Preservation y Language-Following Weight Editing, diseñadas para preservar la coherencia de idioma en las respuestas. El efecto medido es notable en coreano: la consistencia de idioma sube del 76,2 % al 91,6 % y la precisión media en coreano pasa de 71,4 a 72,9, mientras que en inglés la precisión media baja solo de 84,0 a 83,6. El modelo base declara 120B de parámetros totales con 12B activos; el checkpoint podado reporta 54.478.769.674 parámetros en safetensors.

Es relevante ahora porque demuestra que la poda estructurada de expertos en modelos MoE cuantizados en FP4 puede reducir el peso del checkpoint un 17 % y, con las técnicas adecuadas, incluso mejorar el rendimiento multilingüe en lugar de degradarlo. La contrapartida es que requiere un parche específico de vLLM para soportar capas MoE con distinto número de expertos, lo que limita su despliegue a infraestructuras controladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H omni (híbrida transformer + SSM) con mezcla de expertos (MoE) |
| Parametros totales | 54.478.769.674 (checkpoint podado, según safetensors); el modelo base se denomina 120B-A12B |
| Parametros activos | 12B (según denominación del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato FP4 de NVIDIA); pesos en 8-bit modelopt_mixed según tags; el checkpoint base es NVFP4 |
| Idiomas soportados | no disponible de forma explícita; los benchmarks publicados cubren inglés y coreano |
| Licencia | OpenMDW License Agreement, version 1.1 |
| Formato de pesos | safetensors (repo de 62,3 GB); compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un Nemotron-H, una arquitectura híbrida que combina capas transformer con capas de espacio de estados (Mamba), tal como indican los parámetros de servicio del autor (`--mamba-backend flashinfer`, `--mamba-ssm-cache-dtype`, `--enable-mamba-shared-prefix-checkpoint`). Sobre esa base se dispone una mezcla de expertos con 512 expertos por capa MoE en el modelo original; tras la poda, las capas conservan entre 384 y 416 expertos, salvo las capas 1, 3, 85 y 87, que mantienen los 512 completos. El total de expertos enrutados baja de 20.480 a 16.384. El modelo es multimodal (pipeline `image-text-to-text`), con soporte de vídeo según los argumentos de servicio (`--video-pruning-rate`, `--media-io-kwargs`).

No hay reentrenamiento ni ajuste fino: la poda se aplica directamente sobre los pesos NVFP4 del checkpoint original. Las dos innovaciones declaradas son Language-Following Expert Preservation, que selecciona qué expertos conservar para no perder capacidad en idiomas distintos del inglés, y Language-Following Weight Editing, que ajusta los pesos restantes para reforzar la coherencia de idioma. La ablación sobre BenchMAX IFEval-ko muestra la progresión: poda por clústeres no uniforme 73,7 de precisión y 41,7 de consistencia; añadiendo preservación de expertos, 82,3 y 51,7; añadiendo edición de pesos, 90,9 y 87,4. El modelo soporta decodificación especulativa mediante MTP (multi-token prediction) con 5 tokens especulativos, y dispone de parsers de razonamiento (`nemotron_v3`) y de tool calling (`qwen3_coder`).

## Capacidades

- Generación de texto y razonamiento con modo thinking activable por petición mediante `chat_template_kwargs` (`{"enable_thinking": false}`).
- Comprensión de imagen y texto (pipeline image-text-to-text), con procesamiento de vídeo configurable (fps y número de frames).
- Tool calling y function calling, con parser dedicado `qwen3_coder` y soporte de auto tool choice en vLLM.
- Razonamiento multi-paso y uso como agente, con parser de razonamiento separado de la respuesta final.
- Capacidades multilingües: los benchmarks publicados cubren inglés y coreano, con especial énfasis en coherencia de idioma en la respuesta.
- Decodificación especulativa MTP para acelerar la generación.
- Soporte de prefix caching y de caché Mamba compartida para prefijos largos.

## Casos de uso

- Asistentes conversacionales multilingües en inglés y coreano: la mejora de consistencia de idioma (76,2 % a 91,6 %) lo hace adecuado para productos donde el usuario espera respuesta en su idioma, evitando derivas al inglés típicas de modelos podados de forma uniforme.
- Atención al cliente con entrada multimodal: al aceptar imagen y texto, puede procesar capturas de pantalla, fotos de productos o documentos escaneados junto con la consulta del usuario en un mismo turno.
- Agentes con tool calling en producción: el soporte de parser `qwen3_coder` y de auto tool choice permite integrarlo en orquestadores de agentes que invocan APIs externas, con razonamiento separado de la llamada a herramienta.
- Análisis de vídeo con muestreo controlado: los parámetros `--video-pruning-rate` y `--media-io-kwargs` permiten ajustar fps y número de frames para moderación de contenido o resumen de grabaciones.
- Despliegue en nodos GB200/B200 con un solo acelerador: la receta de servicio del autor usa tensor-parallel-size 1 sobre 1 x B200, lo que simplifica el aprovisionamiento frente a configuraciones multi-GPU.
- Razonamiento matemático y científico asistido: los benchmarks de evaluación incluyen GPQA-Diamond y AIME 2026, lo que indica uso previsto en tareas de razonamiento de nivel avanzado, con modo thinking activable.
- Generación y revisión de código: la evaluación incluye LiveCodeBench v6, y el tool calling permite integrarlo en pipelines de CI/CD para revisión automática o generación de parches.

## Benchmarks y rendimiento

| Modelo | Poda | Precisión media inglés | Precisión media coreano | Consistencia de idioma coreano |
|---|---|---|---|---|
| Original (NVFP4) | - | 84,0 | 71,4 | 76,2 |
| Poda uniforme | 20 % | 82,3 | 68,2 | 75,9 |
| Este modelo | 20 % | 83,6 | 72,9 | 91,6 |

Los benchmarks de inglés son IFEval, IFBench, GPQA-Diamond, AIME 2026 y LiveCodeBench v6. Los de coreano son BenchMAX IFEval-ko, IFBench-ko, KoBALT y CLIcK. La consistencia de idioma coreano se define como la proporción de consultas en coreano respondidas en coreano, promediada sobre los benchmarks coreanos.

Ablación sobre BenchMAX IFEval-ko con 20 % de poda:

| Configuración | Precisión | Consistencia de idioma coreano |
|---|---|---|
| Original (NVFP4) | 73,9 | 39,9 |
| Poda por clústeres no uniforme | 73,7 | 41,7 |
| + Language-Following Expert Preservation | 82,3 | 51,7 |
| + Language-Following Weight Editing (este modelo) | 90,9 | 87,4 |

No se han publicado resultados desagregados por benchmark individual ni comparaciones con modelos de otros fabricantes en la información disponible.

## Requisitos de hardware

- Checkpoint de 58 GiB en NVFP4; el repo de Hugging Face ocupa 62,3 GB. La receta oficial de servicio usa 1 x B200 con tensor-parallel-size 1.
- GPU recomendadas: NVIDIA B200 o GB200 según la receta del autor. No se documenta soporte en A100 ni H100, y el formato NVFP4 requiere hardware con soporte nativo de FP4 (generación Blackwell).
- No cabe en GPU de consumo: 58 GiB de pesos superan la VRAM de cualquier RTX 4090 (24 GB) o RTX 5090 (32 GB) incluso con cuantización adicional no documentada.
- Despliegue mediante vLLM 0.31.0 con un parche específico (`patch/apply_patch.py`) que permite capas MoE con distinto número de expertos. El parche hace copia de seguridad en `vllm/.nota_patch_backup/` y es reversible con `--revert`.
- Argumentos de servicio destacados: `--max-num-seqs 512`, `--enable-prefix-caching`, `--max-num-batched-tokens 32768`, `--async-scheduling`, `--mamba-backend flashinfer`, decodificación especulativa MTP con 5 tokens.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (podado 20 %) | 54,5B en safetensors (base 120B-A12B) | no disponible | OpenMDW 1.1 | Hugging Face, requiere parche vLLM | 58 GiB, coherencia coreano 91,6 % |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 | 120B totales, 12B activos | no disponible | OpenMDW 1.1 | Hugging Face, vLLM estándar | 70 GiB, coherencia coreano 76,2 % |
| Poda uniforme del mismo base (referencia del autor) | 20 % menos expertos | no disponible | OpenMDW 1.1 | no publicada como checkpoint | 82,3 / 68,2 / 75,9 en las tres métricas |

No se dispone de datos de otros modelos comparables de la misma categoría (MoE multimodal de ~100B con cuantización FP4) en la información proporcionada.

## Limitaciones y advertencias

- La poda elimina el 20 % de los expertos enrutados sin reentrenamiento; la recuperación de capacidad depende exclusivamente de las técnicas de preservación y edición de pesos de nota-ai, no de ajuste fino.
- El rendimiento en idiomas distintos del inglés y el coreano no está documentado; la coherencia de idioma solo se ha medido en coreano.
- Requiere un parche manual de vLLM 0.31.0; cualquier actualización de vLLM puede romper la compatibilidad y exigir adaptación del parche.
- Dependencia de hardware Blackwell (B200/GB200) por el formato NVFP4; no hay receta documentada para generaciones anteriores.
- Riesgo de alucinación inherente al modelo base; la poda puede acentuar la pérdida de conocimiento en dominios poco representados entre los expertos conservados. No se han publicado evaluaciones específicas de alucinación para esta variante.
- Sesgos: no documentados en la información disponible; se remite a la model card del modelo base de NVIDIA para las notas de sesgo, seguridad y privacidad.
- Licencia OpenMDW 1.1: es una licencia de pesos abiertos con términos propios; conviene revisar las condiciones de uso comercial en el enlace oficial antes de desplegar en producción.
- El modelo tiene 0 descargas y 1 like en el momento de la ficha, lo que indica validación comunitaria prácticamente nula.
- El identificador del modelo incluye "Global-Pruned-20", pero la model card especifica que las capas 1, 3, 85 y 87 conservan los 512 expertos; no es una poda global uniforme pese al nombre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nota-ai/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-Global-Pruned-20
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Paper, blog o repositorio de nota-ai sobre las técnicas de poda: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible
