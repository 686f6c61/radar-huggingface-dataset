# Rowhanissick/Verfy-9B-GGUF

## Resumen

Verfy-9B-GGUF es la versión cuantizada en formato GGUF del modelo Verfy-9B, desarrollado por Rowhanissick (Verfy Labs). Se trata de un modelo de generación de texto de 9.000 millones de parámetros, afinado específicamente para razonamiento autónomo, uso de herramientas y control de escritorio (computer-use), y diseñado como motor de razonamiento del framework de agentes de escritorio Squarr. Su orientación principal es la ejecución local de alta velocidad en tareas de auditoría de ciberseguridad y automatización de acciones sobre interfaz gráfica.

El modelo base es un fine-tune de Rowhanissick/Verfy-9B, publicado bajo licencia Apache 2.0 y entrenado únicamente en inglés. La versión GGUF distribuye cuatro cuantizaciones (Q3_K_M, Q4_K_M, Q5_K_M y Q8_0) con tamaños que van de 4,31 GB a 8,87 GB, lo que permite su despliegue en equipos de consumo con 6-12 GB de VRAM o RAM. La integración documentada con llama.cpp, Ollama y LM Studio, junto con un servidor compatible con la API de OpenAI, facilita su adopción en entornos locales.

La relevancia actual del modelo radica en su enfoque en agentes de escritorio: combina razonamiento multi-paso con detección de elementos de interfaz (OmniParser) para ejecutar acciones sobre pantalla. No obstante, la información publicada es escasa y no incluye datos sobre arquitectura interna, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que su evaluación rigurosa queda pendiente de validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de 9B, detalles no publicados) |
| Parametros totales | 9B (según denominación del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama-server usa `-c 4096`) |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base Verfy-9B: no se especifica si emplea atención estándar, atención lineal, arquitectura híbrida o mezcla de expertos. La denominación "9B" indica un modelo de aproximadamente 9.000 millones de parámetros, pero se desconoce el número de capas, dimensiones ocultas, cabezas de atención y demás hiperparámetros. Tampoco se detalla la longitud de contexto nativa, más allá del ejemplo de despliegue con `-c 4096` en llama-server.

Respecto al entrenamiento, la model card solo indica que el modelo está "optimizado para inferencia local de alta velocidad, auditorías de ciberseguridad, ejecución de herramientas y el framework Squarr". No se documenta el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o fine-tuning supervisado. La etiqueta `base_model:finetune` confirma que es un ajuste fino sobre un modelo previo, pero se desconoce cuál es el modelo original subyacente ni la innovación técnica del ajuste.

## Capacidades

- Generación de texto en inglés con orientación a razonamiento multi-paso (tag `reasoning`).
- Ejecución de herramientas y function calling (tag `agent`, `tool execution`).
- Control de escritorio y acciones sobre interfaz gráfica (tag `computer-use`), integrado con detectores de elementos UI como OmniParser.
- Razonamiento autónomo para tareas de auditoría de ciberseguridad.
- Integración como motor de razonamiento del framework Squarr para agentes de escritorio.
- Capacidades multilingües limitadas al inglés (único idioma declarado).
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Auditoría de ciberseguridad asistida: el modelo puede razonar sobre configuraciones de sistema y proponer pasos de auditoría, tal como sugiere el prompt de ejemplo de llama-cli ("List steps to audit a system").
- Automatización de escritorio con Squarr: actúa como cerebro de razonamiento que, combinado con OmniParser, traduce instrucciones en acciones precisas sobre elementos de pantalla.
- Agentes autónomos locales: su formato GGUF y su ejecución con llama.cpp/Ollama permiten desplegar agentes multi-paso en máquinas sin GPU dedicada (Q3_K_M en 6-8 GB de RAM).
- Ejecución de herramientas en pipelines: el soporte de tool calling permite integrarlo en flujos que invocan APIs o scripts externos.
- Asistente de operaciones en estación de trabajo: con Q4_K_M (~5,24 GB) cabe en GPU de consumo de 6+ GB de VRAM, adecuado para asistentes locales de baja latencia.
- Evaluación y prototipado de agentes computer-use: el servidor compatible con la API de OpenAI (`llama-server`) facilita probar el modelo contra frameworks existentes.
- Despliegue en entornos con restricciones de memoria: la versión Q3_K_M (~4,31 GB) permite inferencia en equipos de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q3_K_M ~4,31 GB (6-8 GB RAM); Q4_K_M ~5,24 GB (8 GB RAM / 6+ GB VRAM); Q5_K_M ~6,02 GB (12 GB RAM / 8+ GB VRAM); Q8_0 ~8,87 GB (16 GB RAM / 12+ GB VRAM).
- GPU recomendadas: no se especifican modelos concretos; los requisitos de VRAM indican que una RTX 3060 de 12 GB o superior puede ejecutar Q8_0, y GPUs de 6-8 GB pueden ejecutar Q4_K_M.
- Cabe en GPU de consumo: sí, según los tamaños indicados (Q3_K_M y Q4_K_M en GPUs de 6-8 GB).
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio; servidor compatible con la API de OpenAI mediante llama-server.
- Latencia y throughput: no disponibles. El autor menciona "sub-second, pixel-perfect screen actions" en el contexto de Squarr, pero sin cifras medibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones internas suficientes para establecer una comparativa rigurosa con alternativas de la misma categoría (modelos de 9B orientados a agentes y computer-use). La información publicada no permite comparar rendimiento, contexto ni calidad frente a otros modelos de tamaño similar.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos comparativos |
|---|---|---|---|---|---|
| Verfy-9B-GGUF | 9B | no disponible | Apache 2.0 | GGUF | no disponible |
| Alternativas de 9B para agentes | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse solo en inglés, puede presentar sesgos culturales y lingüísticos propios de ese corpus.
- Riesgo de alucinación: no evaluado; en tareas de auditoría de ciberseguridad o acciones de escritorio, una alucinación puede derivar en comandos o pasos incorrectos con impacto real.
- Limitación de idioma: solo soporta inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Contexto: no se especifica la longitud nativa; el ejemplo de despliegue usa 4096 tokens, lo que puede ser insuficiente para conversaciones o documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base subyacente no está identificado, por lo que conviene verificar la cadena de licencias del modelo original.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente ni resultados de benchmarks publicados.
- Dependencia de componentes externos: el caso computer-use requiere OmniParser u otros detectores de UI; el modelo por sí solo no procesa imágenes.
- Uso en producción: la falta de documentación sobre entrenamiento y evaluación desaconseja su adopción en entornos críticos sin pruebas propias.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Rowhanissick/Verfy-9B-GGUF
- Modelo base: https://huggingface.co/Rowhanissick/Verfy-9B
- Perfil del autor: https://huggingface.co/Rowhanissick
