# NeuralNet-Hub/Qwen4-Flash-Next-Uncensored-NVFP4

## Resumen

Qwen4-Flash-Next-Uncensored-NVFP4 es una cuantización en formato NVFP4, publicada por NeuralNet-Hub, del modelo base Qwen/Qwen4-Flash-Next de Alibaba Qwen. El modelo base es un modelo de lenguaje y visión (pipeline `image-text-to-text`) orientado a tareas multimodales de imagen y texto. La versión publicada por NeuralNet-Hub aplica un proceso de "uncensoring" (según la model card, mediante supervised fine-tuning y abliteration) para eliminar los mecanismos de rechazo del modelo original, y posteriormente cuantiza los pesos a NVFP4 para su despliegue en GPUs Blackwell mediante vLLM.

La relevancia de esta ficha es limitada y conviene ser explícito: en el momento de la consulta, el repositorio de Hugging Face no contiene pesos del modelo. La propia model card indica textualmente que "no hay ningún modelo (todavía)" y que el espacio se utiliza como anuncio de una futura publicación vinculada al servicio UncensoredGPT. Por tanto, no es posible verificar parámetros, contexto, calidad ni comportamiento real del artefacto.

No se dispone de información sobre arquitectura interna, número de parámetros, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks. Los datos que aparecen a continuación proceden únicamente de las etiquetas del repositorio y de la model card, y en muchos casos se marcan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como vision-language / image-text-to-text) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (cuantización de 4 bits en formato NVFP4 para GPUs Blackwell) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio no contiene pesos en el momento de la consulta) |

## Arquitectura y entrenamiento

No se dispone de información verificable sobre la arquitectura del modelo base Qwen4-Flash-Next ni sobre el proceso de cuantización NVFP4 aplicado. La model card menciona que el "uncensoring" se ha realizado mediante una combinación de supervised fine-tuning y abliteration, pero no detalla el dataset, el número de tokens, la metodología exacta ni los hiperparámetros empleados.

La única innovación técnica explícita es el uso de NVFP4, un formato de cuantización de 4 bits con escalado por bloques pensado para las unidades tensoriales de quinta generación de NVIDIA (arquitectura Blackwell), y la integración declarada con vLLM. No hay información sobre decodificación especulativa, atención lineal ni otras técnicas.

## Capacidades

- Procesamiento de imagen y texto (`image-text-to-text`), según la etiqueta del pipeline.
- Generación de texto multimodal a partir de entradas de imagen y texto.
- Respuestas sin rechazo explícito sobre temas que los modelos alineados suelen declinar, según declara el autor.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad multilingüe concreta ni lista de idiomas.
- No se documenta modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Evaluación de cuantización NVFP4: desplegar el modelo en GPUs Blackwell con vLLM para medir el impacto de la cuantización de 4 bits en latencia y calidad frente al modelo en precisión completa. Requiere que los pesos estén finalmente publicados.
- Investigación sobre alineación y abliteration: comparar el comportamiento del modelo "uncensored" con el modelo base Qwen4-Flash-Next en conjuntos de prompts sensibles para estudiar qué tipos de rechazo se eliminan y con qué coste en utilidad general.
- Procesamiento multimodal de documentos: extracción y descripción de contenido en imágenes (capturas, diagramas, formularios) en flujos internos donde la política de contenido la define el operador.
- Generación de contenido creativo sin restricciones temáticas: redacción de ficción, guiones o material editorial en entornos controlados donde el operador asume la responsabilidad del filtrado posterior.
- Análisis de seguridad ofensiva y defensiva: discusión de vulnerabilidades, técnicas de explotación y contramedidas en laboratorios de seguridad con supervisión humana.
- Despliegue en infraestructura propia con vLLM: servir el modelo cuantizado en clústeres con GPUs Blackwell para reducir el coste por token frente a precisión completa, una vez disponibles los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de ningún otro conjunto, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible, al desconocerse el número de parámetros. En formato NVFP4, un modelo de N mil millones de parámetros requiere aproximadamente N × 0,5 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: NVIDIA Blackwell (serie B200, GB200, RTX 50xx) por el soporte nativo de NVFP4; el autor etiqueta el repositorio con `blackwell`.
- Compatibilidad con GPUs consumer: no verificable sin conocer el tamaño; NVFP4 requiere hardware Blackwell para aprovecharse plenamente.
- Opciones de despliegue: vLLM (declarado en las etiquetas) y transformers (librería declarada). No se menciona llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de datos verificables del modelo base ni de alternativas comparables en la misma categoría (vision-language cuantizado en NVFP4) para construir una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene pesos del modelo en el momento de la consulta; la model card lo describe como un anuncio de una publicación futura. No es desplegable.
- El proceso de "uncensoring" elimina los mecanismos de rechazo del modelo base, lo que implica un riesgo elevado de generar contenido dañino, ilegal o inseguro sin salvaguardas. No es apto para aplicaciones orientadas al público sin un filtrado externo robusto.
- Riesgo de alucinación: no cuantificado; al ser un modelo ajustado mediante abliteration, la degradación de la coherencia y la fidelidad factual es una posibilidad documentada en la literatura, aunque no se aportan datos.
- Sesgos conocidos: no documentados.
- Idiomas soportados y limitaciones de contexto: no disponibles.
- Licencia Apache 2.0 declarada, heredada del modelo base; conviene verificar la licencia del modelo base Qwen4-Flash-Next antes de un uso comercial, ya que el autor enlaza al fichero LICENSE del repositorio original.
- La model card mezcla referencias a "Qwen3.6-27B" al describir el proceso de uncensoring, lo que resulta inconsistente con el modelo base declarado (Qwen4-Flash-Next) y añade incertidumbre sobre qué modelo se ha modificado realmente.
- El repositorio está vinculado a un servicio comercial (UncensoredGPT) y presenta 0 descargas y 0 likes, sin evidencia de uso o validación por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/NeuralNet-Hub/Qwen4-Flash-Next-Uncensored-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen4-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen4-Flash-Next/blob/main/LICENSE
- Sitio del autor: http://neuralnet.solutions
- Servicio vinculado: https://uncensoredgpt.ai
