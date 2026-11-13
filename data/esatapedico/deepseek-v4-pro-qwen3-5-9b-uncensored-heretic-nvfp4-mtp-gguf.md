# esatapedico/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4-MTP-GGUF

## Resumen

`DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4-MTP-GGUF` es una familia de siete ficheros GGUF publicada por el usuario esatapedico a partir del checkpoint `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, un destilado de DeepSeek-V4-Pro sobre una base Qwen3.5-9B con fine-tuning orientado a eliminar restricciones de alineamiento (etiquetado como "uncensored" y "heretic"). El modelo base es un transformer híbrido de 32 bloques que combina 24 bloques de atención lineal (con ruta SSM) y 8 bloques de atención completa, con aproximadamente 9.000 millones de parámetros.

La aportación de esta publicación no es el modelo en sí, sino el proceso de cuantización: se preserva un backbone de 224 tensores en formato NVFP4 (formato de 4 bits con escalas por bloque pensado para las GPU Blackwell de NVIDIA) pasado byte a byte desde el checkpoint original, y se ofrecen siete niveles de precisión para las cabezas (LM head, embeddings y cabeza de predicción multi-token) que van desde Q2_K hasta BF16. Todos los ficheros incluyen una cabeza MTP (multi-token prediction) integrada que actúa como drafter para decodificación especulativa sin necesidad de un modelo auxiliar.

El resultado es una escalera de tamaños que va de 4,77 GB a 8,47 GB, pensada para servir el modelo en llama.cpp sobre hardware Blackwell con la máxima densidad nativa de 4 bits. Adicionalmente, el repositorio incluye un proyector de visión (`mmproj`) en F16 que habilita entrada multimodal al emparejarlo con cualquiera de los siete GGUF. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 32 bloques (24 de atención lineal con ruta SSM + 8 de atención completa), con cabeza MTP |
| Parametros totales | ~9B (según nombre del modelo base; no se detalla recuento exacto en la información disponible) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Backbone NVFP4 fijo; cabezas en Q2_K, Q3_K, Q4_K, Q5_0, IQ4_XS, Q6_K, Q8_0 y BF16 según el nivel |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (7 ficheros) + proyector de visión GGUF F16 (`mmproj`) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de 32 bloques en el que 24 bloques emplean atención lineal con una ruta de espacio de estados (SSM) —tensores `attn_gate`, `attn_qkv`, `ssm_beta`, `ssm_out` y vectores `ssm_alpha`— y 8 bloques mantienen atención completa con proyecciones q/k/v/o. A esto se añade una cabeza MTP (multi-token prediction) en el bloque 32 que predice varios tokens por paso y se usa como drafter interno para decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovación técnica de esta publicación reside en el pipeline de cuantización. Los 224 tensores del backbone NVFP4 (96 de MLP y 32 de atención completa empaquetados en el checkpoint original, más 96 tensores de atención lineal recuantizados durante la construcción de cada nivel) son byte-idénticos entre los siete ficheros, verificado mediante SHA-256 por tensor. Cada fichero contiene 570 tensores: 312 en F32 (normas, sesgos y escalas), 130 en BF16 (ruta SSM y embeddings fijados) y 128 NVFP4 nativos del checkpoint. Los mapas de cuantización por tensor (`overrides-*.txt`, 570 entradas cada uno) se incluyen para reproducibilidad. El proyector de visión se convirtió desde la torre BF16 original con `convert_hf_to_gguf.py --mmproj` y contiene 334 tensores (112 F16 + 222 F32).

## Capacidades

- Generación de texto en inglés con razonamiento y conocimiento general heredados del destilado de DeepSeek-V4-Pro sobre Qwen3.5-9B.
- Decodificación especulativa nativa mediante la cabeza MTP integrada, sin drafter externo.
- Entrada multimodal (visión) al emparejar cualquier GGUF con el `mmproj` F16 del repositorio.
- Ejecución en llama.cpp sobre GPU Blackwell aprovechando la densidad NVFP4 del backbone.
- Siete perfiles de calidad/tamaño intercambiables con backbone idéntico, lo que permite cambiar de nivel sin alterar el comportamiento de las capas profundas.
- No se documentan en la información disponible capacidades específicas de tool calling, function calling, agentes multi-paso ni modo "thinking" explícito.
- El fine-tuning "uncensored/heretic" del modelo base implica ausencia de las salvaguardas de alineamiento habituales.

## Casos de uso

- Despliegue local en GPU Blackwell con llama.cpp: los siete niveles permiten ajustar el uso de VRAM entre 4,77 GB y 8,47 GB manteniendo el mismo backbone NVFP4, útil para estaciones de trabajo con una sola GPU de 8-12 GB.
- Investigación sobre cuantización: los mapas `overrides-*.txt` y la verificación SHA-256 por tensor permiten reproducir y estudiar el impacto de la precisión de las cabezas en la calidad de salida con el backbone fijo.
- Evaluación de decodificación especulativa: la cabeza MTP integrada permite medir aceleraciones de decodificación en llama.cpp sin configurar un modelo drafter separado.
- Procesamiento de documentos con imagen: emparejando el `mmproj` F16 se pueden describir o extraer información de capturas, diagramas o páginas escaneadas en flujos por lotes.
- Generación de texto sin restricciones para investigación en seguridad y alineamiento: el carácter "uncensored" del modelo base lo hace adecuado para estudiar comportamientos sin filtros en entornos controlados.
- Prototipado de asistentes conversacionales en inglés sobre hardware de consumo, seleccionando `VERY-LOW` o `COMPACT-LOW` para entornos con VRAM limitada y `VERY-HIGH` cuando la calidad prime sobre el tamaño.
- Servicio de inferencia en pipelines internos donde se requiera una huella de disco reducida (menos de 9 GB por instancia) y licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre ~5 GB (`VERY-LOW`, 4,77 GB de pesos) y ~9 GB (`VERY-HIGH`, 8,47 GB), más overhead de contexto KV y buffers de llama.cpp; añadir ~0,9 GB si se carga el proyector de visión.
- GPU recomendadas: el backbone NVFP4 está pensado para GPUs NVIDIA Blackwell (por ejemplo, RTX 50xx, B200); en arquitecturas anteriores el soporte de NVFP4 en llama.cpp puede degradar el rendimiento o requerir de-cuantización.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM para los niveles bajos y medios; `VERY-HIGH` requiere ~10-12 GB efectivos con contexto moderado.
- Opciones de despliegue: llama.cpp (formato nativo); no se documenta soporte para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles; la cabeza MTP está diseñada para acelerar la decodificación especulativa, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4-MTP-GGUF (este) | ~9B | no disponible | GGUF NVFP4 + cabezas mixtas | Apache 2.0 | 7 niveles, MTP integrado, `mmproj` opcional |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (base) | ~9B | no disponible | safetensors/BF16 | no disponible en la información | Checkpoint de origen, sin cuantizar |
| esatapedico/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4 | ~9B | no disponible | NVFP4 | no disponible en la información | Checkpoint NVFP4 del que se derivan los GGUF |
| Qwen3.5-9B (base arquitectónica) | ~9B | no disponible | varios | no disponible en la información | Arquitectura híbrida de origen |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas.

## Limitaciones y advertencias

- Modelo "uncensored/heretic": carece de las salvaguardas de alineamiento habituales, por lo que puede generar contenido inapropiado, ofensivo o peligroso sin filtros; no apto para exposición directa a usuarios finales sin moderación adicional.
- Riesgo de alucinación inherente a un modelo de ~9B destilado; no se aportan evaluaciones de fidelidad factual.
- Soporte únicamente de inglés según la etiqueta de idioma del repositorio; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada; no se puede garantizar el comportamiento en ventanas largas.
- El backbone NVFP4 está optimizado para Blackwell; en otras GPU el rendimiento puede ser subóptimo o requerir rutas de de-cuantización.
- El proyector de visión es opcional y debe cargarse explícitamente con `--mmproj`; sin él, el modelo es solo texto.
- Aunque la licencia declarada es Apache 2.0, el modelo base y el checkpoint intermedio no detallan su licencia en la información disponible; conviene verificar la cadena de licencias antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes independientes de calidad.
- Los siete ficheros comparten backbone pero difieren en las cabezas; mezclar niveles en producción puede producir diferencias de calidad no caracterizadas.

## Enlaces

- Hugging Face: https://huggingface.co/esatapedico/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4-MTP-GGUF
- Checkpoint NVFP4 de origen: https://huggingface.co/esatapedico/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4
- Modelo base: xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (referenciado en la model card; URL no incluida en la información disponible)
- Sitio del autor: https://www.esatapedico.com
