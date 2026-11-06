# blaj/LFM2.5-24B-A2B-Uncensored-bf16-ov

## Resumen

LFM2.5-24B-A2B-Uncensored-bf16-ov es una exportación a formato OpenVINO IR del modelo LiquidAI/LFM2.5-24B-A2B, un transformer híbrido de tipo Mixture of Experts (MoE) con 40 capas, 64 expertos y enrutamiento top-4. La variante ha sido modificada por el usuario `blaj` fusionando un adaptador LoRA de rango 1 denominado `atomic.abliterate` (referencia `r24-all-14-39-perlayer`) en las capas 14 a 39 con una escala de 1,75, lo que elimina parte de los rechazos del modelo original (técnica conocida como abliteration). El adaptador queda integrado en los pesos, por lo que no se necesita cargar nada adicional en tiempo de ejecución.

El modelo está pensado para ejecutarse en GPUs integradas Intel Arc mediante OpenVINO GenAI. La exportación mantiene el cuerpo en FP16 (convolución, atención, normalización, router, embeddings y proyección de salida sin comprimir) y aplica compresión INT8 asimétrica solo a los pesos de los 38 subgrafos de expertos MoE, de modo que el grafo completo cabe en los 32 GB de memoria compartida de una iGPU Arc. El tamaño del repositorio es de 25,1 GB.

Es relevante ahora porque demuestra la viabilidad de ejecutar un modelo MoE de 24B parámetros en hardware consumer integrado, manteniendo una precisión de referencia (cuerpo FP16) y una ruta de inferencia stateful funcional. La licencia es la LFM Open License v1.0, que impone restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lfm2MoeForCausalLM (transformer híbrido convolución/atención con MoE), 40 capas, 64 expertos, top-4 routing |
| Parametros totales | no disponible (modelo base identificado como 24B-A2B; el sufijo A2B sugiere ~2B activos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuerpo FP16; expertos MoE en INT8 asimétrico weight-only; existen variantes INT4 e INT8 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | OpenVINO IR (FP16 + INT8 MoE), acompañado de tokenizer, detokenizer, config HF, generation config, graph.pbtxt y ovms_config.json |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que combina capas convolucionales y de atención con bloques MoE de 64 expertos y enrutamiento top-4, organizado en 40 capas. La exportación conserva el estado híbrido de convolución y atención, lo que permite una inferencia stateful en OpenVINO. Los detalles sobre el número de tokens de entrenamiento, la composición del dataset y las fases de RLHF o DPO del modelo original no se incluyen en la información disponible.

La modificación principal consiste en la fusión del adaptador LoRA de rango 1 `atomic.abliterate` (referencia `r24-all-14-39-perlayer`) en las capas 14 a 39 con escala 1,75. Este adaptador se ha horneado en los pesos, de modo que el modelo resultante es "abliterated" y "uncensored". La conversión a OpenVINO se realizó capa a capa por limitaciones de memoria (30 GB de RAM en la máquina de exportación), extrayendo los bloques MoE de exportaciones por capa, comprimiendo únicamente sus pesos de expertos y fusionándolos con las capas del cuerpo FP16 en un único IR stateful.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y generación de contenido sin los rechazos típicos del modelo base, gracias a la abliteration.
- Ejecución en GPU Intel Arc mediante OpenVINO GenAI con ruta stateful.
- Soporte de inferencia en un solo stream (single stream); el batching continuo no está soportado para este modelo híbrido de convolución/estado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, agentes, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en equipos con iGPU Intel Arc: el modelo cabe en los 32 GB de memoria de una Arc iGPU gracias a la compresión INT8 de los expertos, lo que permite desplegar un MoE de 24B en hardware integrado sin GPU dedicada.
- Prototipado de asistentes conversacionales sin filtros: la abliteration elimina parte de los rechazos del modelo base, útil para investigación sobre comportamiento de modelos y generación de contenido creativo sin restricciones excesivas.
- Evaluación de cuantizaciones: al existir variantes INT4, INT8 y esta BF16-source, sirve para comparar calidad y rendimiento entre niveles de precisión sobre el mismo modelo base.
- Despliegue con OpenVINO Model Server (OVMS): el repositorio incluye `ovms_config.json` y el layout estándar, lo que facilita servirlo en infraestructura Intel.
- Investigación sobre modelos híbridos convolución/atención: permite estudiar el comportamiento de la ruta stateful y el enrutamiento MoE top-4 en un entorno controlado.
- Generación de texto en un solo stream con latencia conocida: con 20,1 tok/s en una Core Ultra 7 258V, es adecuado para aplicaciones interactivas de baja concurrencia.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Throughput (single stream) | 20,1 tok/s |
| Hardware | Intel Core Ultra 7 258V, Arc iGPU |
| Runtime | OpenVINO GenAI 2026.4.0 |
| Configuracion | Generación de 128 tokens, mismo harness que las builds INT4 e INT8 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 24 GB de tamaño de modelo; requiere una iGPU o GPU con al menos 32 GB de memoria para cargar el grafo completo (la build se diseñó para el límite de 32 GB de la Arc iGPU).
- GPU recomendadas: Intel Arc iGPU (probado en Core Ultra 7 258V). No hay datos sobre GPUs dedicadas.
- GPU consumer: cabe en iGPU Intel Arc con 32 GB de memoria compartida; no se dispone de datos para GPUs consumer discretas.
- Despliegue: OpenVINO GenAI (`openvino_genai.LLMPipeline`) y OpenVINO Model Server (OVMS) mediante el layout incluido.
- Latencia/throughput: 20,1 tok/s en single stream; el batching continuo no está soportado para este modelo híbrido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| blaj/LFM2.5-24B-A2B-Uncensored-bf16-ov | 24B (A2B) | no disponible | OpenVINO IR FP16 + INT8 MoE | lfm1.0 | Variante de referencia, 20,1 tok/s en Arc iGPU |
| blaj/LFM2.5-24B-A2B-Uncensored-int8-ov | 24B (A2B) | no disponible | OpenVINO IR INT8 | lfm1.0 | Misma base, compresión INT8 completa |
| blaj/LFM2.5-24B-A2B-Uncensored-int4-ov | 24B (A2B) | no disponible | OpenVINO IR INT4 | lfm1.0 | Misma base, compresión INT4 |
| LiquidAI/LFM2.5-24B-A2B | 24B (A2B) | no disponible | safetensors (original) | lfm1.0 | Modelo base sin abliteration |

## Limitaciones y advertencias

- La abliteration elimina rechazos, lo que puede producir contenido inapropiado, ofensivo o dañino; no es recomendable para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad en la información disponible.
- El batching continuo no está soportado para este modelo híbrido de convolución/estado, lo que limita el throughput en escenarios de alta concurrencia.
- La licencia LFM Open License v1.0 impone restricciones de uso comercial; es necesario revisar el archivo LICENSE antes de cualquier despliegue productivo.
- El modelo está exportado específicamente para OpenVINO y GPUs Intel; no es portable a otros runtimes sin reconversión.
- El proceso de exportación se realizó capa a capa por limitaciones de memoria, lo que conviene tener en cuenta para reproducibilidad.
- No hay información sobre idiomas soportados ni sobre sesgos específicos del modelo base o de la variante abliterated.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blaj/LFM2.5-24B-A2B-Uncensored-bf16-ov
- Variante INT8: https://huggingface.co/blaj/LFM2.5-24B-A2B-Uncensored-int8-ov
- Variante INT4: https://huggingface.co/blaj/LFM2.5-24B-A2B-Uncensored-int4-ov
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
