# AfriMentor/chioma-rlhf-v1

## Resumen

Chioma-rlhf-v1 es un adaptador PEFT desarrollado por AfriMentor sobre el modelo Qwen/Qwen2.5-7B-Instruct. El nombre sugiere que se trata de un ajuste fino mediante aprendizaje por refuerzo con retroalimentación humana (RLHF), en la línea de otros adaptadores de la misma organización: chioma-sft-v1 y chioma-dpo-v1. El repositorio contiene únicamente el adaptador (0,3 GB), no los pesos completos del modelo, por lo que para su uso es necesario cargar el modelo base y aplicar el adaptador.

La información publicada en la model card es muy limitada: no se detallan datos de entrenamiento, licencia, idiomas ni capacidades específicas. Las características del modelo final dependen, en gran medida, de las del modelo base Qwen2.5-7B-Instruct, que es un transformer decoder-only de 7.000 millones de parámetros con una ventana de contexto de 32.768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) heredada de Qwen2.5-7B-Instruct |
| Parametros totales | 7.000 millones (modelo base); parametros entrenables del adaptador no disponibles |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite FP16, BF16, 4-bit y 8-bit |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta multiples idiomas, pero no se ha especificado el alcance del adaptador) |
| Licencia | No disponible |
| Formato de pesos | Adaptador PEFT (safetensors) |

## Arquitectura y entrenamiento

El adaptador se ha creado con la librería PEFT (versión 0.14.0) y se basa en Qwen2.5-7B-Instruct. Al ser un adaptador PEFT, no modifica la arquitectura del modelo base, sino que añade parámetros entrenables de bajo rango (LoRA o similar) sobre las capas existentes. El nombre del modelo apunta a un entrenamiento por RLHF, pero no hay documentación que confirme el método exacto, los datos utilizados, el número de tokens de entrenamiento ni si se aplicaron técnicas de alineación adicionales. La información disponible no incluye detalles sobre el procedimiento de entrenamiento, hiperparámetros, ni infraestructura de cómputo.

## Capacidades

- Generación de texto y razonamiento: el adaptador no altera la arquitectura del modelo base, por lo que las capacidades de Qwen2.5-7B-Instruct se mantienen salvo que el entrenamiento las haya modificado. No se dispone de evaluaciones que confirmen cambios específicos.
- Soporte de tool calling / function calling: heredado del modelo base, que incluye soporte para llamadas a funciones.
- Capacidades multilingues: heredadas del modelo base, que soporta múltiples idiomas; no se ha documentado si el adaptador está especializado en alguno.
- Sin capacidades especiales adicionales documentadas (visión, audio, modo de razonamiento extendido o thinking mode).

## Casos de uso

Los siguientes casos de uso son potenciales y se basan en las capacidades del modelo base Qwen2.5-7B-Instruct; no hay información que confirme el rendimiento del adaptador en estos escenarios.

- Asistente de código en entornos de desarrollo integrado (IDE): al heredar de Qwen2.5-7B-Instruct, puede generar y explicar código en múltiples lenguajes. El ajuste RLHF podría haber mejorado la capacidad de seguir instrucciones de programación, aunque no hay datos que lo confirmen.
- Atención al cliente automatizada: con una ventana de contexto de 32.768 tokens, puede gestionar conversaciones multi-turno largas, siempre que el dominio de la conversación esté dentro del alcance del entrenamiento del adaptador.
- Agentes autónomos y pipelines de automatización: el soporte de tool calling permite integrarlo en agentes que invocan funciones externas, como consultas a bases de datos o llamadas a APIs.
- Resumen y análisis de documentos extensos: la ventana de contexto de 32K permite procesar documentos largos en una sola pasada, aunque se desconoce si el adaptador ha sido entrenado para esta tarea.
- Clasificación y extracción de información: como modelo instruct, puede realizar tareas de NLP como reconocimiento de entidades, clasificación de texto o extracción de relaciones con pocos ejemplos.
- Razonamiento matemático y lógico: el modelo base tiene capacidad para resolver problemas matemáticos y de lógica; el adaptador podría haber ajustado el estilo de respuesta, pero no hay benchmarks que lo respalden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador ocupa 0,3 GB, pero para la inferencia se necesitan los pesos completos del modelo base Qwen2.5-7B-Instruct.
- VRAM estimada para el modelo base:
  - FP16/BF16: ~14-16 GB (según el motor de inferencia y la longitud de la secuencia).
  - Cuantización 8-bit: ~8-10 GB.
  - Cuantización 4-bit (AWQ, GPTQ): ~5-6 GB.
- GPU recomendadas: NVIDIA A100 40/80GB, H100 o RTX 4090 (24GB) para FP16. Con cuantización 4-bit, es viable en GPUs de consumo como RTX 3090, RTX 4070 o superiores.
- Opciones de despliegue: Transformers con PEFT, vLLM, llama.cpp, Ollama y TGI. El adaptador se carga con `PeftModel` sobre el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tipo de ajuste | Tamaño del repo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AfriMentor/chioma-rlhf-v1 | Qwen2.5-7B-Instruct | Adaptador PEFT (RLHF) | 0,3 GB | No disponible | HuggingFace |
| AfriMentor/chioma-sft-v1 | Qwen2.5-7B-Instruct | Adaptador PEFT (SFT) | No disponible | No disponible | HuggingFace |
| AfriMentor/chioma-dpo-v1 | Qwen2.5-7B-Instruct | Adaptador PEFT (DPO) | No disponible | No disponible | HuggingFace |
| Qwen/Qwen2.5-7B-Instruct | - | Modelo base completo | ~15 GB | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- La model card no contiene información sobre sesgos, riesgos de alucinación ni limitaciones técnicas del adaptador.
- No se especifica la licencia del adaptador, lo que genera incertidumbre para el uso comercial.
- No se han publicado benchmarks ni evaluaciones de seguridad o alineación.
- Al ser un adaptador PEFT, su rendimiento depende del modelo base; no se puede garantizar que el ajuste RLHF haya producido mejoras sustanciales sin datos empíricos.
- El nombre del modelo sugiere RLHF, pero no hay documentación que confirme el método de entrenamiento ni los datos utilizados.
- No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens ni la procedencia de los datos de retroalimentación humana.

## Enlaces

- Modelo: https://huggingface.co/AfriMentor/chioma-rlhf-v1
- Modelo hermano SFT: https://huggingface.co/AfriMentor/chioma-sft-v1
- Modelo hermano DPO: https://huggingface.co/AfriMentor/chioma-dpo-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
