# aslkfjklaj11213/gemma-4-E2B-it-wordstory2-q4f16_1-MLC

## Resumen

Este repositorio contiene una versión ajustada mediante LoRA del modelo `google/gemma-4-E2B-it`, empaquetada en el formato de cuantización `q4f16_1` de MLC-LLM para su uso con WebLLM en el navegador. El autor (`aslkfjklaj11213`) ha fusionado un adaptador LoRA (r=16, 3 épocas) entrenado con 150 cuentos infantiles cortos en coreano, con el objetivo de que el modelo genere un título y un cuento breve a partir de una lista de palabras en inglés con sus significados en coreano, insertando marcadores `{english|korean}` una vez por línea para un juego de palabras alojado en el repositorio `areweloststars/-`.

El modelo hereda la arquitectura del Gemma 4 E2B instruct de Google, del cual no se dispone de especificaciones técnicas detalladas en la información proporcionada. El paquete pesa 2,9 GB y solo difiere del repositorio oficial `mlc-ai/gemma-4-E2B-it-q4f16_1-MLC` en los pesos lineales de las capas de texto (q/k/v/o, gate_up, down), por lo que debe cargarse con la misma librería de modelos de WebLLM (`gemma-4-E2B-it-q4f16_1`).

Su relevancia es limitada: se trata de un artefacto derivado de un caso de uso muy concreto (un juego de palabras en coreano), con 13 descargas y ningún "me gusta" en el momento de la consulta. No obstante, sirve como ejemplo práctico de cómo fusionar un LoRA y reempaquetar los pesos en formato MLC para despliegue web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/gemma-4-E2B-it); detalles no disponibles |
| Parametros totales | no disponible (el nombre "E2B" sugiere ~2B efectivos, dato no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16_1 (pesos en 4 bits, activaciones en float16) |
| Idiomas soportados | coreano (ko) según la model card; el modelo base soporta más idiomas, no detallados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con layout MLC-LLM (compatible con WebLLM) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E2B-it` (revisión `3e22461f65e89153144f8adb70e3b8c2cc9845a7`), un transformer instructivo de la familia Gemma 4 de Google. No se dispone de información sobre el número exacto de parámetros, la composición del dataset de preentrenamiento, ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

Sobre esta base, el autor aplicó un ajuste fino con LoRA de rango 16 durante 3 épocas, usando un conjunto de 150 cuentos infantiles cortos en coreano escritos específicamente para el proyecto con vocabulario común de diccionario. El adaptador se fusionó con los pesos base a escala 1.0 y el resultado se recuantizó al formato `q4f16_1` mediante la herramienta `tools/finetune/mlc_patch.py`, replicando la estructura de archivos del repositorio oficial de MLC. Solo se modificaron los pesos lineales de las capas de texto (q/k/v/o, gate_up y down); el resto de tensores coincide con el modelo original. El adaptador LoRA previo a la fusión se conserva en la carpeta `lora-adapter/`.

## Capacidades

- Generación de texto en coreano orientada a cuentos infantiles cortos.
- Generación de títulos a partir de una lista de palabras en inglés con significados en coreano.
- Inserción de marcadores de vocabulario con el formato `{english|korean}`, uno por línea, para integración en un juego de palabras.
- Ejecución en el navegador mediante WebLLM y el runtime de MLC-LLM.
- Capacidades heredadas del modelo base (razonamiento, código, matemáticas, tool calling, multilingüismo) no documentadas en esta ficha; deben consultarse en la model card de `google/gemma-4-E2B-it`.
- No se documenta soporte de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Generación de cuentos para el juego de palabras del repositorio `areweloststars/-`: el modelo recibe una lista de palabras en inglés con su traducción al coreano y devuelve un título y un cuento breve con marcadores `{english|korean}` listos para el motor del juego.
- Aplicación educativa de vocabulario coreano-inglés: uso del modelo para producir microrelatos que contextualizan cada palabra, aprovechando el ajuste fino sobre cuentos infantiles.
- Demostración de fine-tuning LoRA y reempaquetado MLC: sirve como plantilla reproducible para desarrolladores que quieran adaptar un modelo Gemma 4 a una tarea concreta y desplegarlo en WebLLM.
- Prototipado de experiencias web sin backend: al ejecutarse en el navegador con WebLLM, permite probar un generador de cuentos integrado en una página estática sin infraestructura de servidor.
- Generación de contenido lúdico para niños: cuentos cortos con vocabulario controlado, adecuados para actividades de lectura guiada en coreano.
- Evaluación de cuantización q4f16_1 en tareas generativas: comparación de la calidad del modelo fusionado frente al base cuantizado en el mismo formato, útil para estudiar el impacto de la cuantización en tareas de generación creativa.
- Integración en pipelines de CI para validar adaptadores LoRA: el flujo de fusión y recuantización documentado puede automatizarse para verificar que un adaptador no degrada el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 2,9 GB, por lo que se puede inferir un requisito en torno a 3-4 GB para cargar los pesos cuantizados, sin contar el overhead del runtime.
- GPU recomendadas: no especificadas por el autor; al ser un paquete WebLLM, está pensado para ejecutarse en el navegador sobre GPUs de consumo con soporte de WebGPU.
- Compatibilidad con GPU de consumo: probable en tarjetas con WebGPU (por ejemplo, series RTX 30/40 y Apple Silicon), aunque no hay confirmación oficial.
- Opciones de despliegue: WebLLM (librería `gemma-4-E2B-it-q4f16_1`), runtime de MLC-LLM; otros backends no documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aslkfjklaj11213/gemma-4-E2B-it-wordstory2-q4f16_1-MLC | no disponible | no disponible | MLC (q4f16_1) | Apache 2.0 | HuggingFace, 13 descargas |
| mlc-ai/gemma-4-E2B-it-q4f16_1-MLC | no disponible | no disponible | MLC (q4f16_1) | Apache 2.0 (heredada) | HuggingFace, repositorio oficial de MLC |
| google/gemma-4-E2B-it | no disponible | no disponible | safetensors | Apache 2.0 | HuggingFace, modelo base oficial |

La comparación se limita a los tres artefactos relacionados directamente; no se dispone de datos de rendimiento ni de especificaciones detalladas para comparar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Modelo altamente especializado: el ajuste fino con solo 150 cuentos puede degradar capacidades generales del modelo base fuera de la tarea de generación de cuentos con marcadores.
- Riesgo de alucinación en la generación de vocabulario o traducciones: el modelo puede producir pares `{english|korean}` incorrectos, especialmente con palabras poco frecuentes.
- Sesgos: no documentados por el autor; al derivar de un modelo base de Google, puede heredar sesgos de su dataset de preentrenamiento.
- Idiomas: la model card declara únicamente coreano; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad del ajuste ni sobre el cumplimiento de las condiciones del modelo base de Google.
- El repositorio tiene muy poca tracción (13 descargas, 0 likes) y no ha sido validado por la comunidad; no se recomienda para producción sin evaluación propia.
- Dependencia del runtime WebLLM y del identificador de librería `gemma-4-E2B-it-q4f16_1`; cambios en la librería oficial podrían romper la compatibilidad.
- No hay información sobre el contexto máximo soportado ni sobre el comportamiento del modelo con entradas largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aslkfjklaj11213/gemma-4-E2B-it-wordstory2-q4f16_1-MLC
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio MLC de referencia: https://huggingface.co/mlc-ai/gemma-4-E2B-it-q4f16_1-MLC
- Proyecto del juego de palabras: https://github.com/areweloststars/-
- WebLLM: https://github.com/mlc-ai/web-llm
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
