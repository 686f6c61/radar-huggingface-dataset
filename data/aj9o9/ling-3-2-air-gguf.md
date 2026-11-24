# aj9o9/Ling-3.2-air-GGUF

## Resumen

Ling-3.2-air-GGUF es una colección de cuantizaciones en formato GGUF del modelo base `inclusionAI/Ling-3.2-air`, publicadas por el usuario aj9o9. El modelo original es un transformer de tipo mixture-of-experts (MoE) con arquitectura `bailingmoe3`, desarrollado por InclusionAI, y esta ficha describe la variante cuantizada, no el modelo original. El repositorio contiene cuatro niveles de cuantización (XS, S, M y L) generados a partir de la release oficial en FP8 mediante redondeo con realimentación de error GPTQ sobre los expertos enrutados y calibración con el propio formato de chat de Ling.

La relevancia de esta publicación radica en que permite ejecutar un modelo de aproximadamente 127.500 millones de parámetros totales en hardware de consumo, algo imposible con los pesos en FP8 o BF16. Las cuantizaciones están diseñadas explícitamente para el motor `maya-ling` del proyecto Project Maya, aunque según el autor también cargan en llama.cpp estándar. El modelo está orientado a uso conversacional y se distribuye bajo licencia MIT.

El modelo base cuenta con 127.486.405.600 parámetros según los tensores safetensors del repositorio original, y el repositorio GGUF ocupa 215,7 GB en total. No se dispone de información sobre el número de parámetros activos, la longitud de contexto ni los idiomas soportados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `bailingmoe3` en llama.cpp) |
| Parametros totales | 127.486.405.600 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en cuatro niveles propietarios: XS (30,3 GB), S (46,0 GB), M (61,8 GB), L (77,6 GB); tipos de tensor por cuantización en `recipes/` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE), identificado en llama.cpp con la arquitectura `bailingmoe3`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detallan innovaciones arquitectónicas específicas más allá de la propia estructura MoE.

Las cuantizaciones de esta ficha se generaron a partir de la release oficial en FP8 del modelo, aplicando redondeo con realimentación de error (error-feedback rounding) de tipo GPTQ sobre los expertos enrutados y empleando la importancia por experto derivada de la calibración con el formato de chat propio de Ling. Los cuatro niveles (XS, S, M, L) presentan un compromiso distinto entre tamaño, divergencia KL respecto a FP8 y porcentaje de coincidencia en el token superior. Los niveles M y L están divididos en dos ficheros (`-00001-of-00002`), y el cargador debe apuntarse al primero de ellos.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y la calibración se realizó con el formato de chat de Ling.
- Razonamiento y generación de contenido general: capacidades heredadas del modelo base `inclusionAI/Ling-3.2-air`; no se detallan en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en GPU de consumo: la cuantización XS (30,3 GB) está pensada para una RTX 3060 de 12 GB junto con 16 GB de RAM, lo que permite ejecutar un modelo de 127.500 millones de parámetros totales en un equipo de gama media mediante offload parcial a memoria del sistema.
- Despliegue en estaciones de trabajo con RTX 3090: las variantes S, M y L están dimensionadas para una RTX 3090 de 24 GB con 32, 48 o 64 GB de RAM respectivamente, lo que permite elegir el nivel de fidelidad frente a FP8 según la memoria disponible.
- Prototipado de asistentes conversacionales: al estar calibrado con el formato de chat de Ling y etiquetado como conversacional, es adecuado para construir y validar flujos de diálogo multi-turno antes de pasar a infraestructura con los pesos en FP8.
- Evaluación de la calidad de cuantización: los datos de divergencia KL y de coincidencia del token superior permiten a un equipo de investigación medir el impacto de cada nivel de cuantización en sus propias tareas antes de comprometerse con un despliegue.
- Integración en pipelines basados en llama.cpp: al cargar en llama.cpp estándar, puede incorporarse a herramientas existentes del ecosistema GGUF (servidores locales, wrappers de API compatible con endpoints) sin necesidad de infraestructura adicional.
- Experimentación con el motor `maya-ling`: las cuantizaciones están construidas específicamente para este motor de Project Maya, por lo que sirven como referencia para probar y comparar el rendimiento del motor frente a llama.cpp con los mismos pesos.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de fidelidad de cada cuantización respecto a la release en FP8, junto con una puntuación zero-shot cuyo protocolo no se detalla (FP8 = 73,45).

| Cuantizacion | Tamano | Hardware objetivo | KL vs FP8 | Coincidencia token superior | Zero-shot (FP8 = 73,45) |
|---|---:|---|---:|---:|---:|
| XS | 30,3 GB | RTX 3060 12 GB + 16 GB RAM | 0,654 | 78,7 % | 71,15 |
| S | 46,0 GB | RTX 3090 24 GB + 32 GB RAM | 0,340 | 85,5 % | 75,50 |
| M | 61,8 GB | RTX 3090 24 GB + 48 GB RAM | 0,204 | 89,8 % | 73,20 |
| L | 77,6 GB | RTX 3090 24 GB + 64 GB RAM | 0,140 | 92,3 % | 73,70 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM y RAM estimadas según el autor: XS requiere una RTX 3060 de 12 GB más 16 GB de RAM del sistema; S, M y L requieren una RTX 3090 de 24 GB más 32, 48 y 64 GB de RAM respectivamente.
- GPU recomendadas: RTX 3060 12 GB para XS; RTX 3090 24 GB para S, M y L. No se especifican GPUs de clase A100 u H100 en la información disponible.
- Viabilidad en GPU de consumo: sí, todas las variantes están dimensionadas para GPU de consumo con offload a RAM del sistema; ninguna cabe íntegramente en una sola GPU de consumo.
- Opciones de despliegue: llama.cpp (carga estándar de GGUF `bailingmoe3`) y el motor `maya-ling` de Project Maya. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota de carga: las variantes M y L están divididas en dos ficheros; el cargador debe apuntarse a `-00001-of-00002`.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La única referencia cuantitativa es el propio modelo base en FP8, que sirve como línea base de fidelidad:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ling-3.2-air (FP8) | 127.486.405.600 | no disponible | MIT | safetensors | Línea base; zero-shot 73,45 |
| Ling-3.2-air-GGUF XS | 127.486.405.600 | no disponible | MIT | GGUF | KL 0,654; zero-shot 71,15 |
| Ling-3.2-air-GGUF S | 127.486.405.600 | no disponible | MIT | GGUF | KL 0,340; zero-shot 75,50 |
| Ling-3.2-air-GGUF M | 127.486.405.600 | no disponible | MIT | GGUF | KL 0,204; zero-shot 73,20 |
| Ling-3.2-air-GGUF L | 127.486.405.600 | no disponible | MIT | GGUF | KL 0,140; zero-shot 73,70 |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card indica que la ficha completa con tablas de precisión está pendiente; la información disponible es provisional.
- La puntuación zero-shot de la variante S (75,50) supera a la del propio FP8 (73,45), lo que sugiere que la métrica o el protocolo de evaluación no son directamente comparables entre niveles; conviene tratar estos números con cautela.
- Las cuantizaciones están optimizadas para el motor `maya-ling`; el rendimiento en llama.cpp estándar puede diferir del reportado por el autor.
- El modelo está etiquetado como conversacional y calibrado con el formato de chat de Ling; un uso fuera de ese formato puede degradar la calidad.
- No se dispone de información sobre sesgos, riesgo de alucinación, limitaciones de contexto o cobertura idiomática del modelo base.
- La licencia MIT permite uso comercial, pero se hereda del modelo base `inclusionAI/Ling-3.2-air`; conviene verificar las condiciones del repositorio original.
- El tamaño del repositorio (215,7 GB) y la necesidad de offload a RAM implican requisitos de almacenamiento y de ancho de banda de memoria considerables en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/aj9o9/Ling-3.2-air-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
