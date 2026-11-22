# abenzerps/Inkling-2-Mini-GSQ-RCO-GGUF

## Resumen

Inkling-2-Mini GSQ-RCO GGUF es una cuantización de precisión mixta del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario abenzerps. El modelo base es un transformer de tipo Looped Sparse MoE (mezcla de expertos con capas intermedias repetidas en bucle) con 26.070.385.152 parámetros totales, de los cuales aproximadamente 3.4B son activos en crudo y 5.4B efectivos a través de tres capas medias en bucle, con 128 expertos y enrutamiento top-8. Combina entrada de imagen y texto (pipeline image-text-to-text) y soporta una ventana de contexto de hasta 1M de tokens mediante atención híbrida de ventana deslizante y global.

La relevancia de esta publicación reside en que empaqueta un modelo MoE multimodal de gran tamaño en archivos GGUF que caben en GPUs de consumo, desde 8 GB de VRAM (IQ1_M, 7.32 GB) hasta 16 GB (IQ4_XS, 13.84 GB), manteniendo según el autor un enrutamiento sin pérdidas y razonamiento multi-paso. El formato GSQ-RCO (cuantización de precisión mixta con atención en Q8_0 en algunas variantes) está pensado para llama.cpp y Ollama, con soporte de proyector de visión separado (mmproj) en BF16 o Q8_0.

El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado para razonamiento, uso conversacional y despliegue compatible con endpoints. La model card no especifica los idiomas soportados ni detalles del dataset de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Sparse MoE (transformer con mezcla de expertos y capas medias en bucle), vision + texto |
| Parametros totales | 26.070.385.152 (26.1B) |
| Parametros activos | 3.4B en crudo / 5.4B efectivos (128 expertos, top-8) |
| Longitud de contexto | Hasta 1M tokens (atencion hibrida: ventana deslizante + global) |
| Tipos de cuantizacion | IQ1_M (2.25 bpw), IQ2_XS (2.75 bpw), IQ3_XS (3.25 bpw), IQ4_XS (4.25 bpw); proyectores de vision BF16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con mmproj separado para vision |

## Arquitectura y entrenamiento

El modelo base es un Looped Sparse MoE: un transformer con capas medias que se ejecutan en bucle (3x), 128 expertos por capa y enrutamiento top-8. Esto da 26.1B parámetros totales pero solo 3.4B activos en crudo y 5.4B efectivos, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño. La atención es híbrida, combinando ventana deslizante con atención global para alcanzar hasta 1M tokens de contexto. El modelo es nativamente multimodal (visión y texto) y el pipeline declarado es image-text-to-text.

La cuantización GSQ-RCO es una técnica de precisión mixta del autor de la publicación, orientada a preservar el enrutamiento de expertos y el razonamiento multi-paso en llama.cpp; algunas variantes mantienen la atención en Q8_0 para limitar la degradación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. Los parámetros de muestreo recomendados son temperature 1.0, top_p 1.0, top_k 0 y min_p 0.0, con `--jinja`.

## Capacidades

- Generación de texto y razonamiento multi-paso, con etiqueta explícita de "reasoning" en el modelo.
- Comprensión de imagen y texto (multimodal), mediante proyector de visión mmproj en BF16 o Q8_0.
- Razonamiento con enrutamiento de expertos preservado por la cuantización GSQ-RCO.
- Uso conversacional multi-turno.
- Contexto largo de hasta 1M tokens (atención híbrida deslizante y global).
- Compatibilidad con endpoints y despliegue en llama.cpp y Ollama.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: el modelo está etiquetado para razonamiento, pero no se detallan capacidades de agente.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente conversacional con contexto largo: el modelo puede mantener conversaciones multi-turno con hasta 1M tokens de ventana, útil para atención al cliente con historiales extensos o documentos adjuntos.
- Análisis de documentos e imágenes: con el proyector de visión, se pueden enviar capturas, diagramas o páginas escaneadas junto a preguntas de texto para extracción de información.
- Razonamiento sobre código y problemas técnicos: el modelo está etiquetado para razonamiento y puede emplearse en revisión de código o explicación de errores, aunque no se documenta tool calling.
- Despliegue en estaciones de trabajo con GPU de consumo: la variante IQ3_XS (10.58 GB) cabe en 12 GB de VRAM y permite servir el modelo localmente con llama-server.
- Prototipado en portátiles Apple Silicon: las variantes IQ2_XS (8.95 GB) e IQ4_XS (13.84 GB) están indicadas para 16 GB y 24 GB de memoria unificada respectivamente.
- Investigación sobre cuantización de MoE: el formato GSQ-RCO y los distintos niveles bpw permiten estudiar la degradación de un MoE multimodal al reducir precisión.
- Procesamiento por lotes de imágenes con texto: el pipeline image-text-to-text permite clasificar, describir o resumir lotes de imágenes con instrucciones en lenguaje natural.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones del modelo base con comparaciones frente a Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL. Los datos disponibles son parciales:

| Modelo | Parametros (activos/total, B) | AA Index (v5.0) | Vals Index (v2.2) |
|---|---|---|---|
| Inkling 2 Mini | 5/26 | 20.1 | 46.5% |
| Gemma 4 31B | 31/31 | 4.4 | no disponible |
| Muse Glimmer | 30/30 | 6.3 | no disponible |
| Qwen3.8-27B | 27/27 | 20.1 | no disponible |
| Nemotron 3.5 Super VL | 12/125 | 13.6 | no disponible |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni métricas de las cuantizaciones GGUF respecto al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia según la model card:
  - IQ1_M (2.25 bpw, 7.32 GB): 8 GB de VRAM.
  - IQ2_XS (2.75 bpw, 8.95 GB): 10 GB de VRAM o 16 GB de Mac.
  - IQ3_XS (3.25 bpw, 10.58 GB): 12 GB de VRAM (opción recomendada).
  - IQ4_XS (4.25 bpw, 13.84 GB): 16 GB de VRAM o 24 GB de Mac.
  - Proyector de visión: mmproj BF16 (642 MB) o Q8_0 (346 MB), adicional a los pesos.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090); los tamaños indicados apuntan a GPUs de consumo de 8 a 16 GB de VRAM.
- Cabe en GPU de consumo: sí, en las variantes indicadas por el autor.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server con `--jinja`, `-ngl 99`, `--flash-attn on`) y Ollama (`ollama run hf.co/abenzerps/Inkling-2-Mini-GSQ-RCO-GGUF:IQ3_XS`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (activos/total, B) | Contexto | AA Index (v5.0) | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini GSQ-RCO (esta ficha) | 5/26 | 1M tokens | 20.1 (modelo base) | Apache 2.0 | GGUF |
| Gemma 4 31B | 31/31 | no disponible | 4.4 | no disponible | no disponible |
| Muse Glimmer | 30/30 | no disponible | 6.3 | no disponible | no disponible |
| Qwen3.8-27B | 27/27 | no disponible | 20.1 | no disponible | no disponible |
| Nemotron 3.5 Super VL | 12/125 | no disponible | 13.6 | no disponible | no disponible |

La comparativa se limita a los datos publicados en la model card; no se dispone de contexto, licencia ni formato de pesos de los modelos alternativos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no se documenta; como modelo generativo de lenguaje, es esperable, pero no hay datos concretos.
- Limitaciones de contexto o idioma: la ventana máxima es de 1M tokens, pero no se especifican los idiomas soportados ni el rendimiento por idioma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los componentes de visión.
- Las cuantizaciones de baja precisión (IQ1_M, IQ2_XS) pueden degradar el enrutamiento de expertos y el razonamiento; el autor recomienda IQ3_XS como punto óptimo.
- La model card es de un tercero (abenzerps), no del desarrollador original; los benchmarks corresponden al modelo base, no a las cuantizaciones GGUF.
- El repositorio registra 0 descargas en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- No se documentan capacidades de tool calling ni de agente, lo que limita su uso en pipelines automatizados que las requieran.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/abenzerps/Inkling-2-Mini-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Solicitud de modelos del autor: https://abenzerps.com/request-a-model/
- GitHub del autor: https://github.com/abenzerps
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Papers referenciados en los tags: arxiv:2604.18556 y arxiv:2605.00649 (no se dispone de sus URLs directas en la información proporcionada)
