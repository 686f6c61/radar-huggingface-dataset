# macunaima/gemma4-search-doc-sm8650-a8w4-full-int4embed

## Resumen

Este modelo es una cuantización del checkpoint `gemma4-search-doc`, compilada y empaquetada específicamente para la NPU (HTP) del SoC Qualcomm Snapdragon SM8650, el chip del Samsung Galaxy S24. Ha sido desarrollado por el usuario de HuggingFace «macunaima» como parte de un proyecto de despliegue on-device. El objetivo es reducir drásticamente el peso del modelo manteniendo las activaciones en INT8 y comprimiendo todas las proyecciones lineales en INT4, lo que lo hace adecuado para entornos con memoria limitada en dispositivos móviles.

El modelo se ejecuta a través del runtime LiteRT-LM en formato `.litertlm`, compilado con AOT para el SoC objetivo. Frente a la referencia A8W8, el tamaño baja de 5,87 GiB a 1,64 GiB, una reducción del 72,0 %. La arquitectura es la del checkpoint original `gemma4-search-doc`, aunque no se detalla en la información disponible; el etiquetado y el pipeline indican un modelo de generación de texto. La longitud de contexto y los idiomas soportados no se especifican.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de generación de texto basado en el checkpoint `gemma4-search-doc`) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Atención (q/k/v/o_proj) y MLP (gate/up/down_proj): pesos INT4 per-channel con activaciones INT8; embedders (`embedder.tflite` y `per_layer_embedder.tflite`): INT4 weight-only per-channel |
| Idiomas soportados | No disponibles |
| Licencia | Gemma |
| Formato de pesos | `.litertlm` (modelo principal), `.tflite` (embedders) |

## Arquitectura y entrenamiento

La base del modelo es el checkpoint `gemma4-search-doc`, del que no se proporcionan datos de arquitectura detallados ni del proceso de entrenamiento en esta ficha. La innovación principal es el proceso de cuantización y empaquetado para el hardware objetivo: el modelo se compila AOT con la opción `--soc-model SM8650`, de modo que las operaciones se ejecutan directamente en la NPU HTP de Qualcomm mediante LiteRT-LM. La granularidad de cuantización es per-channel en todos los pesos porque el compilador HTP de Qualcomm no soporta cuantización blockwise, como se documenta en el repositorio de LiteRT. Los embedders no pasan por el compilador AOT, al ser tablas de búsqueda puras, por lo que su compresión no está limitada por las restricciones del HTP.

## Capacidades

- Generación de texto en dispositivos móviles con NPU Qualcomm, orientada a tareas de búsqueda documental (según el nombre del checkpoint original `gemma4-search-doc`).
- Ejecución on-device a través del runtime LiteRT-LM en un único archivo `.litertlm`.
- Compilación AOT específica para Snapdragon SM8650, lo que permite aprovechar el acelerador HTP.
- Cuantización INT4 de todas las proyecciones lineales y de los embedders, con activaciones INT8 en las capas de atención y MLP.
- No se han publicado datos sobre soporte de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

1. Asistente de búsqueda documental offline: permite consultar una base de documentos (por ejemplo, manuales, informes técnicos) directamente en el dispositivo, sin conexión a internet, gracias a la compresión agresiva que lo hace viable en un móvil.
2. Resumen de documentos en movilidad: puede generarse un resumen de un documento o conjunto de documentos con un modelo que no necesita depender de servidores externos, útil para dispositivos con requisitos de privacidad.
3. Extracción de información en entornos industriales: integrado en aplicaciones de campo que funcionan en terminales basados en Snapdragon SM8650, permite extraer datos clave de documentos inspeccionados en el momento, reduciendo la latencia y las dependencias de red.
4. Aplicaciones de soporte técnico en local: dispositivos de asistencia que necesitan respuestas a preguntas sobre documentación técnica sin salir del entorno del cliente.
5. Demostraciones de IA generativa en el dispositivo: como parte de proyectos de investigación o desarrollo para evaluar el rendimiento y la calidad de modelos cuantizados en la NPU HTP del Galaxy S24.
6. Sincronización de documentos corporativos: el modelo puede usarse en una app que indexe y busque contenido en documentos corporativos descargados, evitando enviar información confidencial a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El peso del modelo es de 1,64 GiB, por lo que ocupa un espacio de almacenamiento equivalente; la memoria necesaria para la ejecución depende del runtime y de las activaciones, y no se especifica.
- GPU recomendadas: no aplica; el modelo está destinado a ejecutarse en la NPU HTP del SoC Qualcomm Snapdragon SM8650, no en GPUs de escritorio.
- Cabe en dispositivo móvil: sí, está diseñado para el Snapdragon SM8650, con un peso de 1,64 GiB.
- Opciones de despliegue: LiteRT-LM con compilación AOT (`--soc-model SM8650`); el runtime está disponible en el repositorio google-ai-edge/LiteRT.
- Latencia y throughput: no disponibles. La model card indica estimaciones de ingeniería sin mediciones reales en el dispositivo.

## Comparativa con modelos similares

| Modelo | Tamaño | Cuantización | Reducción vs. baseline A8W8 | Riesgo de calidad | Recomendación |
|---|---|---|---|---|---|
| gemma4-search-doc-sm8650-a8w8-int4embed | 5,87 GiB | A8W8 (baseline) | — | Bajo | Producción |
| gemma4-search-doc-sm8650-a8w4-mlponly-int4embed | No disponible | MLP en INT4; resto no especificado | No disponible | Medio | Opción intermedia |
| gemma4-search-doc-sm8650-a8w4-full-int4embed | 1,64 GiB | Atención + MLP en INT4 | –72,0 % | Medio-alto | Última opción |

Además, una cuarta receta (INT4 weight-only con dequantize explícito) fue probada y descartada porque el compilador AOT de Qualcomm rechaza ese patrón.

## Limitaciones y advertencias

- La cuantización INT4 en todas las proyecciones lineales conlleva un riesgo medio-alto de degradación de calidad con respecto al baseline validado, según el propio autor. No se han proporcionado evaluaciones de calidad fuera del conjunto de calibración.
- Las estimaciones de velocidad y calidad son razonamientos de ingeniería basados en la arquitectura y en la limitación de ancho de banda durante el decode; no se han medido en un Galaxy S24 físico, por lo que no deben tomarse como valores definitivos.
- El modelo está compilado específicamente para el SoC Snapdragon SM8650 y la NPU HTP de Qualcomm. No puede ejecutarse en otras plataformas sin recompilar o adaptar el runtime.
- La licencia es Gemma, cuyos términos de uso deben cumplirse. El modelo está sujeto a la licencia; no se especifica si el uso comercial requiere condiciones adicionales, por lo que conviene consultar la documentación oficial de Gemma.
- No se dispone de información sobre sesgos, alucinaciones ni limitaciones de idioma o contexto en esta ficha.
- La granularidad per-channel (sin blockwise) es una restricción del compilador HTP, lo que puede aumentar la pérdida de precisión en comparación con cuantizaciones blockwise de otros runtimes.

## Enlaces

- HuggingFace: https://huggingface.co/macunaima/gemma4-search-doc-sm8650-a8w4-full-int4embed
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Página de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
