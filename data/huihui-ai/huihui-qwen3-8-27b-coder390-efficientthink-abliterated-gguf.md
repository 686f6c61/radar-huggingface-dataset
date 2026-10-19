# huihui-ai/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-GGUF es una versión en formato GGUF de un modelo derivado de la familia Qwen3, publicada por el usuario huihui-ai, conocido por distribuir variantes "abliterated" (sin mecanismos de rechazo) de modelos abiertos. El modelo parte de `nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2`, un nombre que sugiere la fusión de múltiples ajustes finos sobre una base Qwen3 orientada a código y a razonamiento extenso, y le aplica una ablación de direcciones de rechazo en las capas 2 a 52 mediante la técnica implementada en `remove-refusals-with-transformers`.

El resultado es un modelo "uncensored" que conserva el pipeline declarado `image-text-to-text` (entrada de imagen y texto) y que se distribuye exclusivamente como pesos GGUF cuantizados con imatrix (bf16, IQ3_S1, IQ3_S2 e IQ3_S3), pensados para ejecutarse en llama.cpp. El repositorio ocupa 92,1 GB e incluye ficheros de calibración y matrices de importancia, además de los pesos.

Su relevancia es doble: por un lado, documenta un flujo reproducible de cuantización con imatrix y evaluación de perplejidad sobre el propio modelo; por otro, sirve como caso de estudio de eliminación de rechazos y de sus efectos medibles en perplejidad. Conviene señalar una discrepancia importante en los metadatos: el nombre indica 27B, pero el recuento de parámetros en safetensors del repositorio es de 6.789.424, un dato que el autor no aclara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3; detalles de capas y atención no disponibles |
| Parametros totales | 6.789.424 según safetensors del repositorio; la nomenclatura del modelo indica 27B (discrepancia no aclarada) |
| Parametros activos | no disponible (no hay indicios de arquitectura MoE en la información proporcionada) |
| Longitud de contexto | 262.144 tokens en el ejemplo de `llama-cli -c 262144` de la model card; no confirmado como máximo oficial |
| Tipos de cuantizacion | GGUF: bf16, IQ3_S1, IQ3_S2, IQ3_S3 (con matrices imatrix) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); repositorio etiquetado con `transformers` |
| Pipeline declarado | image-text-to-text |
| Capas ablationadas | 2 a 52 |
| Tamano del repositorio | 92,1 GB |
| Descargas / likes | 15.273 / 18 |

## Arquitectura y entrenamiento

No se publican detalles de arquitectura más allá de la etiqueta `qwen3` y del pipeline `image-text-to-text`, que implica algún tipo de codificador visual o proyección multimodal integrada en el modelo base. La model card no documenta número de capas, tipo de atención, dimensión oculta ni composición del dataset de entrenamiento. El nombre del modelo base encadena acrónimos (`SFT`, `RLOO`, `MTP`, `DFlash`) que sugieren ajuste supervisado, optimización con RLOO y algún esquema de predicción multi-token o decodificación tipo flash, pero el autor no aporta documentación que confirme su significado ni su impacto.

La innovación documentada es el proceso de abliteración: se eliminan las direcciones de rechazo en las capas 2 a 52 mediante una implementación que no depende de TransformerLens, descrita por el propio autor como una prueba de concepto "cruda". Sobre el modelo abliterado se aplica un pipeline de cuantización reproducible: generación de un GGUF bf16 de referencia, cálculo de matrices de importancia con `llama-imatrix` sobre tres conjuntos de calibración (8,1 MB / 18.749 registros; 12,8 MB / 24.999 registros; 22,1 MB / 37.449 registros), cuantización con `llama-quantize --allow-requantize --tensor-type-file` y verificación de perplejidad con `llama-perplexity`. No se especifica el volumen de tokens de preentrenamiento ni si huboRLHF o DPO en la base.

## Capacidades

- Generación de texto y razonamiento: el sufijo "EfficientThink" del nombre apunta a un modo de razonamiento o "thinking", aunque no hay documentación técnica que lo confirme.
- Generación de código: el nombre incluye "Coder390", lo que indica un ajuste orientado a programación; no se detallan lenguajes ni benchmarks.
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text`, por lo que se le atribuye capacidad de procesar imágenes junto a texto.
- Contexto largo: el ejemplo de la model card usa 262.144 tokens de ventana, adecuado para analizar repositorios o documentos extensos.
- Sin filtrado de rechazos: la ablación en las capas 2 a 52 reduce los rechazos del modelo original, lo que cambia el comportamiento en consultas sensibles.
- Ejecución local en CPU/GPU: los pesos GGUF con cuantización IQ3 permiten inferencia en llama.cpp sin GPU de gama alta.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible; el nombre sugiere razonamiento multi-paso, sin evidencia documentada.
- Capacidades multilingües: no disponible.
- Audio y otras modalidades: no disponible.

## Casos de uso

- Asistente de código en local: con los GGUF IQ3_S1/S2/S3 el modelo puede ejecutarse en una estación de trabajo con una sola GPU consumer mediante `llama-cli` o `llama-server`, sirviendo como autocompletado y revisión de código sin enviar el código a un servicio externo.
- Análisis de repositorios completos: la ventana de 262.144 tokens del ejemplo permite cargar varios ficheros de un mismo proyecto y pedir refactorizaciones o auditorías que requieren contexto cruzado entre módulos.
- Entornos aislados o air-gapped: al distribuirse como GGUF y ejecutarse con llama.cpp compilado localmente, es viable en máquinas sin acceso a Internet ni a APIs de terceros, algo habitual en entornos industriales o de defensa.
- Investigación sobre eliminación de rechazos: el repositorio documenta el proceso completo (ablación, imatrix, cuantización, perplejidad) y las tablas de PPL asociadas, lo que lo convierte en material para estudiar el coste de la abliteración en la calidad del modelo.
- Red teaming y evaluación de seguridad: un modelo con el filtrado reducido sirve para generar casos adversarios y probar clasificadores o políticas de moderación antes de desplegarlas.
- Conversión de capturas a código: el pipeline `image-text-to-text` permite adjuntar una captura de interfaz o un diagrama y pedir la implementación correspondiente en HTML/CSS o en un framework concreto.
- Reproducción de pipelines de cuantización: los ficheros `calibration1-3.txt`, los comandos `llama-imatrix` y `llama-quantize` y las tablas de perplejidad permiten replicar el flujo para otros modelos y comparar el gap de PPL entre variantes IQ3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo proporciona mediciones de perplejidad (`llama-perplexity`, `-c 8192 -b 2048 -ctk bf16 -ctv bf16`) comparando el modelo base, la versión abliterada en bf16 y las tres cuantizaciones IQ3.

Calibración con `calibration1.txt`:

| Modelo | Calibración | Perplejidad | Gap respecto al base |
|---|---|---|---|
| nerkyor/Qwen3.8-27B-Coder390-EfficientThink.gguf | - | 4,1744 ± 0,00925 | +0 |
| Huihui abliterated bf16 | - | 4,1588 ± 0,00916 | -0,0156 |
| Huihui abliterated IQ3_S1 | calibration1.txt | 4,1922 ± 0,00928 | +0,0178 (respecto al base); +0,0334 (respecto al bf16 abliterado) |
| Huihui abliterated IQ3_S2 | calibration2.txt | 4,1864 ± 0,00926 | +0,0120; +0,0276 |
| Huihui abliterated IQ3_S3 | calibration3.txt | 4,1851 ± 0,00925 | +0,0107; +0,0263 |

Calibración con `calibration2.txt`:

| Modelo | Calibración | Perplejidad | Gap respecto al base |
|---|---|---|---|
| nerkyor/Qwen3.8-27B-Coder390-EfficientThink.gguf | - | 3,8816 ± 0,00677 | +0 |
| Huihui abliterated bf16 | - | 3,8468 ± 0,00664 | -0,0348 |
| Huihui abliterated IQ3_S1 | calibration1.txt | 3,8547 ± 0,00665 | -0,0269; +0,0079 respecto al bf16 |
| Huihui abliterated IQ3_S2 | calibration2.txt | 3,8495 ± 0,00664 | -0,0321; +0,0027 |
| Huihui abliterated IQ3_S3 | calibration3.txt | 3,8458 ± 0,00662 | -0,0358; -0,0010 |

Lectura: la abliteración no degrada la perplejidad de forma apreciable (incluso la reduce ligeramente en bf16) y la cuantización IQ3_S3 es la que menor gap introduce, con una diferencia de +0,0263 y -0,0010 según el conjunto de calibración. Son datos de perplejidad, no de capacidad, por lo que no permiten inferir rendimiento en código, razonamiento o visión.

## Requisitos de hardware

- VRAM estimada (estimación a partir de los 27B nominales del nombre y del ancho de bits; los tamaños exactos de fichero no se detallan en la información disponible): IQ3_S3 en torno a 12-14 GB, IQ3_S1 ligeramente inferior, bf16 en torno a 54 GB.
- GPU consumer: una RTX 4090 (24 GB) o una RTX 3090 (24 GB) deberían alojar las cuantizaciones IQ3 con holgura; con 16 GB (RTX 4080, 4060 Ti 16 GB) conviene repartir capas con `-ngl` o usar offload parcial a RAM.
- GPU profesional: A100 40/80 GB o H100 para la versión bf16 y para servir contexto muy largo; el KV cache de 262.144 tokens exige mucha memoria adicional, por lo que en la práctica se recomienda reducir `-c` o usar cuantización del KV cache (`-ctk`/`-ctv`).
- CPU y RAM: viable en CPU con llama.cpp; el repositorio completo son 92,1 GB, pero basta descargar el fichero IQ3 deseado.
- Despliegue: llama.cpp (el autor recomienda la build b11540 o superior), con `llama-cli`, `llama-server`, `llama-imatrix`, `llama-quantize` y `llama-perplexity`; el repositorio está etiquetado con `transformers`, pero no se documenta una carga directa con esa librería.
- vLLM, TGI, Ollama y otros servidores: no disponible en la información proporcionada.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-GGUF | 6.789.424 según safetensors; 27B nominal | 262.144 tokens en el ejemplo del autor | PPL 4,1851 (IQ3_S3, calib. 1) | apache-2.0 | GGUF en HuggingFace |
| nerkyor/Qwen3.8-27B-Coder390-EfficientThink (modelo base, sin abliterar) | no disponible | no disponible | PPL 4,1744 (calib. 1) | no disponible | referenciado como base; el autor cita un GGUF del mismo |
| Otras variantes abliterated de huihui-ai | no disponible | no disponible | no disponible | no disponible | no documentadas en la información proporcionada |
| Qwen3 (familia original) | no disponible | no disponible | no disponible | no disponible | no documentada en la información proporcionada |

No se dispone de datos verificables de otras alternativas de la misma categoría (modelos abliterated multimodales en GGUF) en la información proporcionada, por lo que la comparación cuantitativa se limita al modelo base.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: la ablación de las capas 2 a 52 suprime los rechazos, con riesgo de generar contenido sensible, controvertido o inapropiado; el propio autor advierte de que debe revisarse rigurosamente cada salida.
- Método de prueba de concepto: el autor describe la implementación como "cruda" y no validada más allá de las métricas de perplejidad, sin evaluación de capacidades tras la ablación.
- Discrepancia de parámetros: el nombre indica 27B y los safetensors del repositorio declaran 6.789.424 parámetros; no hay aclaración del autor, lo que afecta a cualquier estimación de memoria o de rendimiento.
- Alucinación: no hay datos publicados sobre tasas de alucinación ni evaluaciones de fidelidad; al tratarse de una fusión de múltiples ajustes sin documentación, el riesgo es difícil de acotar.
- Idiomas: la información de idiomas soportados no está disponible; no se puede garantizar calidad en castellano.
- Cadena de licencias: el repositorio se declara apache-2.0, pero el modelo base es una fusión de la que no se indica licencia; conviene verificar los términos de todos los modelos implicados antes de un uso comercial.
- Contexto largo: los 262.144 tokens provienen de un ejemplo de línea de comandos, no de una especificación oficial; un contexto tan alto implica un consumo de memoria elevado y posible degradación de la calidad.
- Sesgos: no se documenta ninguna evaluación de sesgos; la abliteración puede alterar la distribución de respuestas en temas sensibles de forma no controlada.
- Repositorio pesado: 92,1 GB con múltiples cuantizaciones y ficheros de calibración, lo que complica su descarga y almacenamiento en entornos con recursos limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-GGUF
- Modelo base: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Repositorio de la técnica de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- Build de llama.cpp recomendada (b11540): https://github.com/ggml-org/llama.cpp/releases/tag/b11540
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset de calibración para imatrix: https://huggingface.co/datasets/eaddario/imatrix-calibration
