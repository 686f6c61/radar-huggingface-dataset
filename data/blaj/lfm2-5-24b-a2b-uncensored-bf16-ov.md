# blaj/LFM2.5-24B-A2B-Uncensored-bf16-ov

## Resumen

LFM2.5-24B-A2B-Uncensored-bf16-ov es una conversión a OpenVINO IR del modelo LiquidAI/LFM2.5-24B-A2B, publicada por el usuario blaj. El modelo base es un transformer híbrido de tipo Mixture of Experts (MoE) con 24.000 millones de parámetros totales, 40 capas y 64 expertos con enrutamiento top-4, del que no se especifica el número de parámetros activos por token. Esta variante concreta incorpora un adaptador LoRA de rango 1 (`atomic.abliterate`, `r24-all-14-39-perlayer`) fusionado en las capas 14 a 39 con escala 1,75, lo que elimina los mecanismos de rechazo y moderación del modelo original (variante "uncensored" o "abliterated").

El interés de esta ficha reside en dos aspectos técnicos. Por un lado, es una exportación optimizada para inferencia en GPU Intel (Arc iGPU) mediante OpenVINO GenAI, con el cuerpo del modelo en FP16 y los pesos de los expertos MoE comprimidos a INT8 asimétrico para ajustarse al límite de 32 GB de memoria de una iGPU Arc. Por otro, documenta un flujo de conversión poco habitual: exportación capa a capa, extracción y compresión de los bloques MoE, y posterior injerto en un único grafo con estado (stateful IR).

La relevancia es doble: sirve como referencia para quien necesite desplegar un MoE de 24B en hardware Intel de consumo profesional, y como ejemplo de modificación de alineamiento mediante LoRA fusionado. La licencia del modelo base (LFM Open License v1.0) condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Lfm2MoeForCausalLM (transformer híbrido convolución/atención con MoE), 40 capas, 64 expertos, top-4 routing |
| Parámetros totales | 24 000 millones (24B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 (cuerpo, atención, convolución, normalización, router, embeddings y proyección de salida); INT8 asimétrico weight-only (38 subgrafos de expertos MoE) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | OpenVINO IR (model IR, tokenizer, detokenizer, HF config, generation config, graph.pbtxt, ovms_config.json) |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM2.5-24B-A2B emplea la arquitectura `Lfm2MoeForCausalLM`, un diseño híbrido que combina capas de convolución con capas de atención y bloques MoE. Según la model card, consta de 40 capas, 64 expertos y enrutamiento top-4, con un total de 24B parámetros. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La innovación técnica de esta publicación no está en el entrenamiento sino en el proceso de conversión y modificación. El adaptador LoRA `atomic.abliterate` de rango 1 se fusionó en las capas 14 a 39 con escala 1,75, quedando integrado en los pesos sin necesidad de cargar el adaptador en tiempo de ejecución. La exportación a OpenVINO se realizó capa a capa porque la exportación en una sola pasada superaba el límite de 30 GB de RAM de la máquina de conversión. Los bloques MoE se extrajeron de exportaciones por capa, se comprimieron únicamente en sus pesos de expertos mediante NNCF (INT8 asimétrico) y se injertaron con las capas del cuerpo en FP16 en un único grafo con estado que preserva el estado híbrido de convolución y atención.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta a instrucciones heredados del modelo base LFM2.5-24B-A2B.
- Capacidad MoE con 64 expertos y enrutamiento top-4, que activa un subconjunto de parámetros por token.
- Variante sin censura: el adaptador abliterate elimina los rechazos y la moderación del modelo original.
- Inferencia en GPU Intel mediante OpenVINO GenAI (Arc iGPU y dispositivos compatibles).
- Soporte de tool calling, agentes, modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en hardware Intel con iGPU Arc: el modelo está empaquetado como OpenVINO IR con un tamaño de 24 GB y un grafo stateful que carga en GPU; se usaría con `openvino_genai.LLMPipeline` para servir generación de texto en estaciones de trabajo o equipos con GPU integrada Intel.
- Evaluación de modelos sin alineamiento: investigadores que estudian el efecto de la abliteración pueden comparar esta variante con el modelo base LiquidAI/LFM2.5-24B-A2B para analizar cambios en tasas de rechazo y comportamiento.
- Prototipado de asistentes conversacionales: al ser un modelo conversacional de 24B, sirve para construir demos de chat con contexto multi-turno en entornos controlados donde la ausencia de moderación sea aceptable.
- Investigación sobre eficiencia MoE: la separación entre cuerpo FP16 y expertos INT8 permite estudiar el impacto de la compresión weight-only en la calidad de salida de un MoE de 64 expertos.
- Integración con OpenVINO Model Server (OVMS): el repositorio incluye `ovms_config.json` y el layout estándar de OVMS, lo que facilita el despliegue como servicio de inferencia en infraestructura Intel.
- Benchmarking de latencia en iGPU: con 20,1 tok/s medidos en un Core Ultra 7 258V, es útil como referencia para comparar configuraciones de cuantización (INT4, INT8, FP16) sobre el mismo modelo.

## Benchmarks y rendimiento

| Métrica | Valor | Entorno |
|---|---|---|
| Throughput (single stream) | 20,1 tok/s | Intel Core Ultra 7 258V Arc iGPU, OpenVINO GenAI 2026.4.0, generación de 128 tokens |
| Continuous batching | No soportado | Modelo híbrido convolución/estado |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 24 GB para el modelo completo en el formato publicado (cuerpo FP16 + expertos INT8).
- El autor indica que el grafo completo cabe en el límite de 32 GB de memoria de una iGPU Intel Arc.
- GPU probada: Intel Core Ultra 7 258V con Arc iGPU.
- GPU recomendadas: iGPU Intel Arc con al menos 32 GB de memoria compartida; no se documenta compatibilidad con A100, H100 o RTX 4090 en esta exportación OpenVINO.
- No cabe en GPUs de consumo con 8-16 GB de VRAM en este formato.
- Despliegue: OpenVINO GenAI (`openvino_genai.LLMPipeline`) y OpenVINO Model Server (OVMS). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia/throughput: 20,1 tok/s en single stream; continuous batching no soportado por la naturaleza híbrida convolución/estado del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-Uncensored-bf16-ov (este) | 24B totales, MoE 64 expertos top-4 | no disponible | OpenVINO IR (FP16 + INT8 MoE) | LFM Open License v1.0 | Variante abliterated, optimizada para iGPU Intel |
| LiquidAI/LFM2.5-24B-A2B | 24B totales, MoE 64 expertos top-4 | no disponible | safetensors (presumiblemente) | LFM Open License v1.0 | Modelo base alineado, sin modificación |
| Otras variantes de cuantización del mismo modelo (INT4, INT8) | 24B totales | no disponible | OpenVINO IR | LFM Open License v1.0 | Referenciadas por el autor como builds comparables en el mismo harness |

No se dispone de información sobre modelos de otros fabricantes comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo sin alineamiento: la fusión del adaptador abliterate elimina los mecanismos de rechazo, por lo que puede generar contenido dañino, ofensivo o ilegal sin filtros. No apto para aplicaciones de cara al público sin capas de moderación externas.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de un modelo base sin información sobre su dataset, los sesgos del original persisten y la abliteración puede amplificar respuestas sesgadas.
- Alucinación: no hay datos publicados sobre tasas de alucinación de esta variante ni del modelo base.
- Contexto e idiomas: la longitud de contexto y los idiomas soportados no están disponibles en la información proporcionada; no se debe asumir soporte multilingüe sin verificación.
- Licencia: LFM Open License v1.0 (license: other). Es necesario revisar los términos del archivo LICENSE del repositorio antes de cualquier uso comercial; la licencia del modelo base condiciona la redistribución.
- Rendimiento: el continuous batching no está soportado, lo que limita el throughput en despliegues con múltiples usuarios concurrentes.
- Formato cerrado a OpenVINO: los pesos no están en safetensors ni GGUF, por lo que no se pueden cargar directamente en vLLM, llama.cpp u otros runtimes sin reconversión.
- Proceso de conversión no estándar (exportación capa a capa e injerto manual de bloques MoE): conviene validar la calidad de salida frente al modelo base antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blaj/LFM2.5-24B-A2B-Uncensored-bf16-ov
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
