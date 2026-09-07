# fbaldassarri/tiiuae_Falcon3-3B-Base-auto_gptq-int8-gs64-asym

## Resumen

El modelo `fbaldassarri/tiiuae_Falcon3-3B-Base-auto_gptq-int8-gs64-asym` es una versión cuantizada en INT8 del modelo base `tiiuae/Falcon3-3B-Base`, desarrollado por el usuario `fbaldassarri` mediante el framework Intel AutoRound v0.13.1. Se trata de un modelo de lenguaje causal (completación) basado en arquitectura tipo Llama, con 1.458.914.304 parámetros según los pesos en safetensors. La cuantización utiliza el algoritmo GPTQ (AutoGPTQ) con group size 64 y cuantización asimétrica, optimizada para inferencia en hardware Intel: CPU, iGPU Arc y NPU AI Boost (Core Ultra) vía OpenVINO.

El propósito principal de este artefacto es ofrecer una versión eficiente del modelo Falcon3-3B-Base que pueda ejecutarse en entornos sin GPU dedicada, manteniendo un equilibrio entre tamaño y calidad. Es relevante para investigadores y desarrolladores que necesitan desplegar modelos de lenguaje en dispositivos edge o servidores con CPU Intel. La receta de reproducción está documentada, lo que facilita estudiar el efecto de la cuantización weights-only con AutoRound. No se han publicado benchmarks de rendimiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (tipo Llama) |
| Parámetros totales | 1.458.914.304 (según safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 GPTQ (group size 64, asimétrica) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ/AutoGPTQ) |

## Arquitectura y entrenamiento

El modelo base `Falcon3-3B-Base` es un transformer causal de tipo Llama, diseñado para generación de texto por completación. En esta versión cuantizada, los pesos se almacenan en 8 bits mediante el método weights-only quantization (WoQ) con el algoritmo GPTQ implementado en AutoGPTQ. La cuantización se realizó con Intel AutoRound, usando calibración sobre 128 muestras, 200 iteraciones, longitud de secuencia 512 y batch size 4, en CPU con `torch.bfloat16`.

No se dispone de información sobre los datos de entrenamiento del modelo base, ni sobre procesos de RLHF o DPO. Al ser un modelo base, no ha sido ajustado para seguir instrucciones. La innovación técnica destacable es el uso de AutoRound para producir una cuantización INT8 asimétrica con group size 64, optimizada para aceleradores Intel y compatible con la biblioteca `transformers`.

## Capacidades

- Generación de texto en inglés mediante completación a partir de un prompt.
- Inferencia eficiente en CPU Intel, iGPU Arc y NPU AI Boost (Core Ultra) gracias a la cuantización INT8.
- No se han documentado capacidades de tool calling, function calling, agentes o razonamiento multi-paso.
- No soporta visión, audio ni otras modalidades.
- Soporte multilingüe limitado al inglés.

## Casos de uso

- Inferencia en servidores CPU sin GPU: la cuantización INT8 permite ejecutar el modelo en CPUs Intel con bajo consumo de memoria, ideal para tareas de completación de texto en entornos de producción sin aceleradores gráficos.
- Aplicaciones edge en dispositivos Intel Core Ultra: gracias a la optimización para NPU AI Boost vía OpenVINO, el modelo puede integrarse en asistentes locales de texto en portátiles o equipos de borde.
- Autocompletado de texto en inglés: al ser un modelo base, puede usarse para sugerir continuaciones de texto en editores o sistemas de redacción asistida.
- Investigación en cuantización: la receta de reproducción incluida permite experimentar con técnicas WoQ y comparar el efecto de INT8 frente a otras precisiones.
- Prototipado rápido en local: con aproximadamente 1,4 GB de pesos en INT8, el modelo puede ejecutarse en equipos con poca memoria o en iGPU integradas, facilitando pruebas sin infraestructura dedicada.
- Generación de texto en pipelines de análisis: puede utilizarse para generar continuaciones de texto en inglés en flujos de trabajo con recursos limitados, como procesamiento de documentos o generación de contenido auxiliar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,4 GB para los pesos en INT8 (1.458.914.304 parámetros × 1 byte), más overhead de activaciones; se recomienda al menos 2-3 GB de memoria total.
- GPU recomendadas: no hay datos oficiales. El modelo está optimizado para CPU Intel, iGPU Arc y NPU AI Boost, por lo que no requiere GPU dedicada.
- Consumer GPU: podría ejecutarse en GPUs con 2-3 GB de VRAM, aunque no se ha documentado soporte específico.
- Opciones de despliegue: Transformers con AutoGPTQ, Intel Extension for PyTorch, OpenVINO y AutoRound.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Cuantización | Bits | Parámetros | Licencia |
|---|---|---|---|---|
| Este modelo (INT8 asim) | GPTQ asimétrica, group size 64 | 8 | 1.458.914.304 | Apache 2.0 |
| `tiiuae_Falcon3-3B-Base-auto_gptq-int4-gs64-asym` | GPTQ asimétrica, group size 64 | 4 | no disponible | Apache 2.0 |
| `tiiuae_Falcon3-3B-Base-auto_gptq-int4-gs64-sym` | GPTQ simétrica, group size 64 | 4 | no disponible | Apache 2.0 |
| Modelo base `tiiuae/Falcon3-3B-Base` | Sin cuantizar | bfloat16 | no disponible | Apache 2.0 |

## Limitaciones y advertencias

- Es un modelo base, no instruido: no sigue instrucciones ni mantiene diálogos coherentes.
- Solo soporta inglés.
- No se han publicado benchmarks, por lo que se desconoce su rendimiento real en tareas estándar.
- La cuantización INT8 puede degradar ligeramente la calidad de salida en comparación con el modelo original.
- El autor declara que el modelo se ha desarrollado solo con fines de investigación y sin garantía.
- Riesgo de alucinación inherente a los modelos de lenguaje.
- No hay información sobre sesgos conocidos.

## Enlaces

- HuggingFace: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-3B-Base-auto_gptq-int8-gs64-asym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-3B-Base
- Variante INT4 asimétrica: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-3B-Base-auto_gptq-int4-gs64-asym
- Variante INT4 simétrica: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-3B-Base-auto_gptq-int4-gs64-sym
- Intel AutoRound: https://github.com/intel/auto-round
- Auto-round-pipeline: https://git.epicdynamic.com/auto-round-pipeline
