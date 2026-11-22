# en5yme/Yoshino2-2B-GGUF

## Resumen

Yoshino2-2B-GGUF es la version cuantizada en formato GGUF del modelo Yoshino2 2B, un ajuste fino de Qwen3.5 2B desarrollado por el usuario en5yme. El objetivo del proyecto es destilar el estilo de razonamiento de un modelo profesor de mayor escala (Nemotron 3.5 Lightning 30B A3B) en una arquitectura compacta de aproximadamente 1.940 millones de parametros, pensada para inferencia en el borde (edge) y en hardware de consumo.

El modelo se ha entrenado mediante SFT con QLoRA sobre un dataset sintetico de 10.817 pares pregunta/respuesta generados con un mecanismo de auto-prompt y un framework de destilacion propio. La ficha del autor lo describe explicitamente como un experimento a pequena escala, no como un modelo de produccion, orientado a uso personal y experimental.

Esta publicacion concreta empaqueta los pesos en GGUF, lo que facilita su despliegue con llama.cpp y derivados (Ollama, LM Studio) sin necesidad de GPU dedicada. La licencia declarada en los metadatos de Hugging Face es MIT, aunque la model card matiza que el modelo conserva la licencia Apache 2.0 del Qwen3.5 2B base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5 2B) |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no especificadas en la informacion disponible) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT en metadatos; la model card indica que conserva Apache 2.0 del modelo base |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5 2B, un transformer decoder-only denso de Alibaba Cloud, y se ajusta mediante SFT con QLoRA durante 3 epocas usando la libreria Unsloth. El dataset de entrenamiento es sintetico: 10.817 pares Q/A (aproximadamente 135 MB) generados con un mecanismo de auto-prompt y un framework de destilacion interno, e incluye muestras one-shot y muestras de contexto profundo con 4 prompts. El profesor es Nemotron 3.5 Lightning 30B A3B, un modelo MoE de 30B parametros totales con 3B activos, cuyo estilo de razonamiento y respuesta se busca transferir a la arquitectura Qwen3.5.

No se documentan innovaciones arquitectonicas propias: el modelo hereda la arquitectura del base y la intervencion se limita al ajuste fino supervisado. No se menciona RLHF, DPO ni decodificacion especulativa en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento general en multiples dominios, con estilo de respuesta heredado del profesor.
- Destilacion de trazas de razonamiento del modelo Nemotron 3.5 Lightning 30B A3B.
- Soporte de conversaciones multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning explicitas: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Vision o audio: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en local: al estar en GGUF, puede ejecutarse con llama.cpp u Ollama en un portatil para validar flujos de chat multi-turno en ingles sin coste de API.
- Experimentacion academica con destilacion: sirve como caso de estudio reproducible de como un modelo profesor de 30B (3B activos) transfiere estilo de razonamiento a un denso de 2B mediante SFT con QLoRA.
- Evaluacion de tecnicas de cuantizacion: el repo GGUF permite comparar calidad y latencia entre niveles de cuantizacion sobre el mismo ajuste fino.
- Generacion de respuestas de razonamiento en entornos con recursos limitados: su tamano permite inferencia en CPU o en GPU de gama media para tareas de pregunta-respuesta de dominio general.
- Base para nuevos ajustes finos: al ser un modelo pequeno y con licencia permisiva, es un punto de partida para fine-tuning especifico de tarea en ingles.
- Demos y pruebas de concepto de pipelines de inferencia compatibles con endpoints: el tag `endpoints_compatible` facilita integrarlo en servidores tipo TGI o vLLM con soporte GGUF.

## Benchmarks y rendimiento

Resultados publicados por el autor (evaluaciones tiny, sin desviacion estandar reportada):

| Tarea | Yoshino2 2B | Qwen3.5 2B |
|---|---|---|
| tinyArc (25-shot, acc_norm) | 0,5726 | 0,5684 |
| tinyHellaswag (10-shot, acc_norm) | 0,6552 | 0,6294 |
| tinyMMLU (0-shot, acc_norm) | 0,6063 | 0,5468 |
| tinyTruthfulQA (0-shot, acc) | 0,4797 | 0,4356 |

Las mejoras son consistentes pero modestas, y corresponden a variantes "tiny" de los benchmarks, por lo que no son directamente comparables con las versiones completas de MMLU o ARC.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de 1,94B parametros, las cuantizaciones GGUF tipicas (Q4_K_M, Q5_K_M, Q8_0) ocupan rangos del orden de 1,2 a 2,1 GB, aunque las variantes concretas publicadas no se detallan.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: si, por el tamano del modelo; las GPU concretas no se especifican.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere integracion con servidores de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Yoshino2-2B-GGUF | 1,94B | no disponible | MIT (metadatos) / Apache 2.0 (base) | GGUF | Ajuste fino de razonamiento por destilacion |
| Qwen3.5 2B | ~2B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo base; referencia directa en los benchmarks del autor |
| Nemotron 3.5 Lightning 30B A3B | 30B totales / 3B activos | no disponible | no disponible | no disponible | Modelo profesor usado para generar el dataset de destilacion |

No se dispone de datos de benchmarks comparativos con otras alternativas de 2B en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que no es un modelo de produccion ni frontera: es un experimento a pequena escala para uso personal.
- Solo soporta ingles segun los metadatos; el rendimiento en otros idiomas no esta documentado.
- Riesgo de alucinacion: no cuantificado; los resultados en tinyTruthfulQA (0,4797) indican margen de mejora en veracidad.
- Los benchmarks son variantes "tiny" con pocas muestras y sin intervalos de confianza, lo que limita su robustez estadistica.
- Ambiguedad de licencia: los metadatos indican MIT, mientras que la model card afirma que conserva Apache 2.0 del Qwen3.5 2B base; conviene verificar el archivo BASE_LICENSE antes de uso comercial.
- Dataset de entrenamiento completamente sintetico, con los sesgos y artefactos que ello puede introducir.
- No se documentan sesgos conocidos, longitud de contexto efectiva ni comportamiento en tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/en5yme/Yoshino2-2B-GGUF
- Modelo base (Yoshino2-2B): https://huggingface.co/en5yme/Yoshino2-2B
- Dataset de destilacion: https://huggingface.co/datasets/en5yme/Nemotron-3.5-Lightning-30B-A3B-Distill
- Repositorio del modelo base Qwen3.5 2B: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
