# pisar/nemotron-labs-unified-asr-0.6b-mlx

## Resumen

Nemotron Unified ASR 0.6B — MLX es una conversión a formato MLX del modelo de reconocimiento automático del habla `nvidia/nemotron-labs-unified-asr-0.6b`, publicada por el usuario `pisar` para su uso en la aplicación Pisar sobre macOS. No se trata de un modelo nuevo ni de un fine-tuning: según la model card, únicamente cambia el formato de los pesos, que se reorganizan con el layout de `parakeet-mlx` para que puedan ejecutarse con la librería MLX de Apple. El modelo original lo desarrolla NVIDIA.

El modelo cuenta con 626.702.592 parámetros (aproximadamente 0,63 mil millones) y está orientado a la transcripción de voz a texto. Su relevancia práctica es acotada pero concreta: permite ejecutar un modelo ASR de NVIDIA en hardware Apple Silicon mediante MLX, algo que no es posible directamente con los pesos originales. El repositorio ocupa 1,3 GB y se distribuye en formato safetensors.

La información publicada es muy escasa: la model card solo documenta la conversión y la licencia, sin detalles sobre arquitectura interna, datos de entrenamiento, idiomas o rendimiento. Por tanto, buena parte de las especificaciones técnicas de esta ficha figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR; layout de pesos parakeet-mlx) |
| Parametros totales | 626.702.592 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License 1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (formato MLX, layout parakeet-mlx) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original más allá de su propósito (reconocimiento automático del habla) y de su adaptación al layout de pesos de `parakeet-mlx`, que es el formato que espera la librería MLX para modelos ASR de la familia Parakeet. El número de parámetros (626,7 millones) sitúa al modelo en la gama de ASR de tamaño medio, adecuado para inferencia local.

Tampoco se documentan en la información disponible los datos de entrenamiento (número de tokens, composición del corpus, idiomas), ni si hubo etapas de alineación o ajuste fino con RLHF/DPO. La conversión realizada por `pisar` no modifica los pesos, solo su representación, por lo que las características de entrenamiento del modelo original se mantienen, pero no están publicadas en esta ficha.

## Capacidades

- Reconocimiento automático del habla (voz a texto) como tarea principal, según el `pipeline_tag` del repositorio.
- Ejecución en Apple Silicon mediante MLX y el layout `parakeet-mlx`.
- Integración prevista en la aplicación Pisar para macOS.
- Soporte multilingüe: no disponible en la información publicada.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio más allá de ASR): no disponible.

## Casos de uso

- Transcripción local en macOS: el modelo puede ejecutarse con MLX en equipos Apple Silicon, lo que permite transcribir audio sin enviar datos a servicios en la nube y sin depender de GPU NVIDIA.
- Integración en la aplicación Pisar: es el caso de uso explícito del repositorio, que se publica como pesos para dicha app de dictado o transcripción en macOS.
- Prototipado de pipelines ASR en entornos Apple: útil para desarrolladores que quieran evaluar un modelo ASR de NVIDIA dentro del ecosistema MLX sin convertir pesos ellos mismos.
- Subtitulado y actas de reuniones: al ser un modelo de 0,63 mil millones de parámetros, puede emplearse para generar transcripciones de audio de forma local en flujos de trabajo personales o de pequeña escala.
- Investigación en eficiencia de inferencia: sirve como base para comparar el rendimiento de un ASR de tamaño medio en MLX frente a otras implementaciones (PyTorch, ONNX) en el mismo hardware.
- Preprocesado de datos de voz: puede utilizarse para transcribir corpus de audio antes de alimentar otros sistemas (búsqueda, análisis de sentimiento, resumen), siempre que se valide la calidad en el idioma y dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 626,7 millones de parámetros, los pesos en precisión completa rondan los 2,5 GB (1,3 GB es el tamaño del repositorio, que puede incluir otros artefactos).
- GPU recomendadas: el formato MLX está pensado para Apple Silicon (series M1, M2, M3, M4); no se documenta soporte para GPU NVIDIA en esta conversión.
- Compatibilidad con GPU de consumo: previsiblemente ejecutable en Macs con memoria unificada de 8 GB o más, aunque no se confirma en la documentación.
- Opciones de despliegue: MLX y `parakeet-mlx`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| pisar/nemotron-labs-unified-asr-0.6b-mlx | 626,7 M | no disponible | OpenMDW 1.1 | safetensors (MLX) | Conversión comunitaria para macOS |
| nvidia/nemotron-labs-unified-asr-0.6b | no disponible (modelo base) | no disponible | OpenMDW 1.1 | no disponible | Modelo original de NVIDIA |
| Otros modelos ASR de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La model card no documenta sesgos, tasas de alucinación ni limitaciones por idioma o dominio; deben evaluarse empíricamente antes de usarlo en producción.
- Al ser una conversión comunitaria (usuario `pisar`, 0 descargas y 0 likes en el momento de la consulta), no hay validación pública de la fidelidad de la conversión respecto al modelo original.
- La licencia OpenMDW 1.1 aparece etiquetada como `other` en Hugging Face; es necesario revisar el texto completo en `LICENSE.md` antes de un uso comercial.
- El formato MLX limita el despliegue a entornos Apple Silicon; no es directamente utilizable en servidores con GPU NVIDIA sin reconversión.
- No se especifican los idiomas soportados, por lo que no puede asumirse cobertura multilingüe.
- No hay información sobre cuantizaciones disponibles ni sobre el impacto de la conversión en la precisión de transcripción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pisar/nemotron-labs-unified-asr-0.6b-mlx
- Modelo base: https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b
- Librería MLX: https://github.com/ml-explore/mlx
- parakeet-mlx: https://github.com/senstella/parakeet-mlx
- Licencia OpenMDW 1.1: incluida en `LICENSE.md` del repositorio
