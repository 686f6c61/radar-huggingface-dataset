# aslkfjklaj11213/gemma-4-E2B-it-wordstory4-q4f16_1-MLC

## Resumen

Este repositorio contiene una versión afinada mediante LoRA del modelo `google/gemma-4-E2B-it`, publicada por el usuario `aslkfjklaj11213` y empaquetada en el formato de cuantización q4f16_1 de MLC-LLM para su uso con WebLLM. No se trata de un modelo nuevo, sino de un ajuste fino orientado a una tarea muy concreta: generar cuentos cortos en coreano a partir de listas de palabras en inglés con su significado en coreano, con un formato de marcadores `{english|korean}` y una descripción de imagen en inglés por cada palabra. El ajuste se realizó con 1200 cuentos infantiles coreanos escritos específicamente para el proyecto, en 2 épocas con rango LoRA r=16.

El modelo base es un Gemma 4 de la variante E2B (presumiblemente una variante eficiente de 2B de parámetros, aunque el dato exacto no está confirmado en la información disponible). La relevancia de esta ficha es limitada: se trata de un artefacto de investigación de nicho, con 33 descargas y 0 likes, cuyo interés principal es documentar un caso de fine-tuning LoRA fusionado y recuantizado para inferencia en navegador mediante WebLLM.

La licencia declarada es Apache 2.0, heredada del modelo base. El repositorio ocupa 4.6 GB e incluye, además de los pesos cuantizados, el adaptador LoRA sin fusionar, el checkpoint de entrenamiento y 30 salidas de ejemplo para validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, variante E2B); detalles exactos no disponibles |
| Parametros totales | no disponible (la nomenclatura E2B sugiere ~2B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16_1 (MLC-LLM); adaptador LoRA original en precisión de entrenamiento |
| Idiomas soportados | coreano (ko) declarado; el modelo base es multilingüe, pero el ajuste está especializado en coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con layout MLC-LLM (q4f16_1); adaptador LoRA y checkpoint incluidos |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it` (revisión `3e22461f65e89153144f8adb70e3b8c2cc9845a7`), un transformer de la familia Gemma 4 en su variante E2B. Sobre él se aplicó un ajuste fino con LoRA de rango 16 durante 2 épocas, con fusión a escala 1.0, sobre un corpus de 1200 cuentos infantiles cortos en coreano redactados para el proyecto, empleando vocabulario de diccionario común. La "ronda 4" del ajuste replica el formato de la ronda 3 pero cuadruplica el número de historias de ejemplo (de 300 a 1200).

La innovación técnica no está en la arquitectura, sino en el pipeline de empaquetado: los pesos fusionados se recuantizan al layout de `mlc-ai/gemma-4-E2B-it-q4f16_1-MLC` mediante `tools/finetune/mlc_patch.py`, de modo que solo difieren del repositorio oficial las matrices lineales de las capas de texto (q/k/v/o, gate_up, down). El resultado es compatible con la misma librería de modelo de WebLLM (`gemma-4-E2B-it-q4f16_1`), lo que permite ejecutarlo en navegador sin cambios en el runtime. No se documenta el uso de RLHF o DPO en esta fase.

## Capacidades

- Generación de cuentos cortos en coreano a partir de 6-8 palabras en inglés con su significado en coreano.
- Producción de un título y una sinopsis de una línea por historia.
- Inserción de marcadores de vocabulario con el formato `{english|korean}`, un marcador por línea de palabra, eligiendo el orden de las palabras de forma autónoma.
- Generación de una descripción de imagen en inglés por cada palabra.
- Capacidades heredadas del modelo base Gemma 4 E2B-it (razonamiento, código, multilingüismo general): no verificadas en esta versión y potencialmente degradadas por el ajuste especializado.
- Soporte de tool calling y agentes: no documentado para esta versión; no disponible.
- Modo thinking, visión o audio: no documentado; no disponible.

## Casos de uso

- Generación de contenido para juegos de palabras educativos: el modelo produce directamente el formato estructurado (título, sinopsis, historia con marcadores y descripciones de imagen) que consume el juego del repositorio `areweloststars/-`, eliminando la necesidad de postprocesado.
- Creación de material didáctico de vocabulario inglés-coreano: dado un conjunto de palabras con su traducción, genera microhistorias contextualizadas que facilitan la memorización.
- Prototipado de aplicaciones WebLLM en navegador: al compartir layout y librería con el modelo oficial, sirve para probar flujos de inferencia local en el cliente sin infraestructura de servidor.
- Demostración de fine-tuning LoRA fusionado y recuantizado: el repositorio incluye el adaptador y el checkpoint, por lo que es un ejemplo reproducible de cómo adaptar un modelo Gemma 4 a una tarea de formato estricto y desplegarlo en MLC-LLM.
- Generación de descripciones de imagen para ilustraciones: las descripciones en inglés por palabra pueden alimentar pipelines de generación de imágenes para acompañar cada cuento.
- Investigación sobre degradación de capacidades tras ajuste especializado: permite comparar el rendimiento del modelo base frente a la versión afinada en tareas generales, con las 30 salidas de ejemplo incluidas como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio solo incluye `eval/outputs.json` con 30 salidas de ejemplo para las comprobaciones propias del proyecto, sin métricas cuantitativas ni comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 4.6 GB e incluye pesos cuantizados q4f16_1, adaptador LoRA y checkpoint, por lo que el peso de los pesos cuantizados es inferior a esa cifra.
- GPU recomendadas: no disponible. Al estar empaquetado para WebLLM, el objetivo principal es ejecución en navegador con aceleración WebGPU.
- Viabilidad en GPU de consumo: plausible por el tamaño del artefacto y la cuantización de 4 bits, pero no confirmada en la información disponible.
- Opciones de despliegue: WebLLM (librería `gemma-4-E2B-it-q4f16_1`) y MLC-LLM. Compatibilidad con vLLM, llama.cpp, Ollama o TGI no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| aslkfjklaj11213/gemma-4-E2B-it-wordstory4-q4f16_1-MLC | no disponible (~2B por nomenclatura) | no disponible | Apache 2.0 | safetensors MLC q4f16_1 | Ajuste LoRA para cuentos en coreano; 33 descargas |
| google/gemma-4-E2B-it | no disponible (~2B) | no disponible | Apache 2.0 | safetensors | Modelo base oficial, capacidades generales |
| mlc-ai/gemma-4-E2B-it-q4f16_1-MLC | no disponible (~2B) | no disponible | Apache 2.0 | safetensors MLC q4f16_1 | Cuantización oficial para WebLLM, sin ajuste |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: el ajuste está diseñado exclusivamente para la tarea de generación de cuentos con marcadores de vocabulario; su rendimiento en tareas generales puede haberse degradado respecto al modelo base.
- Idiomas: la etiqueta de idioma es solo coreano; no se garantiza un comportamiento correcto en otros idiomas, incluido el español.
- Riesgo de alucinación: al ser un modelo pequeño (~2B) ajustado con un corpus reducido de 1200 historias, es probable que genere contenido incoherente o marcadores mal formados fuera del dominio de entrenamiento.
- Formato estricto: la salida esperada depende de un formato muy específico (`{english|korean}`); desviaciones del mismo pueden romper los consumidores downstream.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo ni sobre los datos de ajuste; conviene verificar la procedencia del corpus de cuentos.
- Repositorio de terceros: publicado por un usuario individual sin historial verificable (0 likes, 33 descargas); no es un artefacto oficial de Google ni de MLC-AI.
- Compatibilidad: solo se garantiza con la librería WebLLM `gemma-4-E2B-it-q4f16_1`; otros runtimes pueden no cargar el layout correctamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aslkfjklaj11213/gemma-4-E2B-it-wordstory4-q4f16_1-MLC
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Cuantización oficial MLC para WebLLM: https://huggingface.co/mlc-ai/gemma-4-E2B-it-q4f16_1-MLC
- Proyecto consumidor (juego de palabras): https://github.com/areweloststars/-
