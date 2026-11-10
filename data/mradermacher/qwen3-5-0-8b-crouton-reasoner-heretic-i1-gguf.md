# mradermacher/Qwen3.5-0.8B-Crouton-Reasoner-heretic-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo Qwen3.5-0.8B-Crouton-Reasoner-heretic, un ajuste fino (SFT/LoRA) sobre una base Qwen3.5 de 0,8 mil millones de parámetros. El modelo original lo desarrolla el usuario Stormtrooperaim, y las cuantizaciones las produce mradermacher, un autor habitual en el ecosistema de distribuir pesos en formato GGUF para su uso con llama.cpp y derivados. El sufijo "heretic" indica que se ha aplicado un proceso de "desablación" (abliteration) orientado a retirar las capas de rechazo del modelo, con lo que se obtiene una variante descensurada.

La relevancia de este artefacto es fundamentalmente practica: empaqueta un modelo pequeno en decenas de variantes de cuantizacion (desde IQ1_S de 0,4 GB hasta Q6_K), lo que permite ejecutarlo en hardware muy modesto, incluso en CPU o GPUs consumer de gama baja, con memoria de sobra. La model card del cuantizador menciona que el modelo base es de tipo vision, aunque los ficheros mmproj, si existen, residen en el repositorio estatico hermano y no en este.

Conviene subrayar que la informacion disponible sobre el modelo base es escasa: no se documentan la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks. La ficha se limita, por tanto, a lo que consta en los metadatos y en la model card del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5); detalles internos no disponibles |
| Parametros totales | 752.393.024 (0,75 mil millones, segun safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, IQ4_XS, IQ4_NL, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (cuantizacion con imatrix) |
| Idiomas soportados | en (segun metadatos) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen3.5-0.8B. Por la nomenclatura y el tag `qwen3.5`, se trata presumiblemente de un transformer decoder-only de la familia Qwen, con 752 millones de parametros. El modelo base de esta ficha es un ajuste fino identificado como `Stormtrooperaim/Qwen3.5-0.8B-Crouton-Reasoner-heretic`, entrenado mediante SFT y LoRA sobre el dataset `Stormtrooperaim/Crouton-Alpha-Distilled`, que sugiere un proceso de destilacion. No consta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO.

El elemento diferencial es el proceso de "heretic"/abliteration: una tecnica de edicion de pesos orientada a eliminar direcciones de activacion asociadas al rechazo de peticiones, dando lugar a una variante descensurada y sin filtros. Este repositorio, a su vez, aplica cuantizacion GGUF con matriz de importancia (imatrix), lo que mejora la fidelidad de las cuantizaciones de baja precision respecto a cuantizaciones estaticas equivalentes. La model card del cuantizador indica que el modelo base seria de tipo vision, pero no se aportan detalles sobre el encoder visual ni sobre el entrenamiento multimodal.

## Capacidades

- Generacion de texto conversacional en ingles, con orientacion a razonamiento (sufijo "Reasoner").
- Razonamiento de tipo cadena de pensamiento, presumiblemente derivado de la destilacion del dataset Crouton-Alpha.
- Variante descensurada ("heretic"/"abliterated"): no aplica rechazos de seguridad propios del modelo original.
- Capacidad de vision mencionada en la model card del cuantizador (ficheros mmproj en el repositorio estatico), sin documentacion adicional.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Multilingue: limitado a ingles segun los metadatos.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Prototipado local en CPU: con cuantizaciones de 0,4 a 0,6 GB (IQ1_S a Q4_K_M), el modelo puede ejecutarse en portatiles sin GPU dedicada mediante llama.cpp, lo que lo hace util para experimentar con pipelines de razonamiento sin coste de infraestructura.
- Generacion de texto en dispositivos de gama baja: las variantes IQ2/IQ3 permiten desplegar un modelo conversacional en moviles, Raspberry Pi o entornos embebidos con RAM limitada.
- Filtrado y clasificacion de texto a pequena escala: por su tamano, es adecuado para tareas de etiquetado, resumen corto o extraccion de entidades en lotes donde el coste por token importa.
- Evaluacion de tecnicas de abliteration: investigadores que estudien la eliminacion de capas de rechazo pueden usar esta variante como referencia controlada frente al modelo original.
- Ajuste fino adicional (LoRA): al ser un modelo de 0,75 mil millones de parametros con licencia Apache 2.0, sirve como base barata para experimentos de SFT en una sola GPU consumer.
- Generacion de datos sinteticos en ingles: util para aumentar datasets de destilacion o para tareas de parafraseo y reformulacion a bajo coste.
- Demos y pruebas de concepto de asistentes conversacionales: la cuantizacion Q4_K_M (0,6 GB) ofrece un equilibrio razonable entre velocidad y calidad para entornos de demostracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 y 1 GB adicionales sobre el tamano del fichero GGUF segun la variante. Las cuantizaciones IQ1_S/IQ1_M ocupan 0,4 GB; IQ2 a IQ3 entre 0,5 y 0,6 GB; Q4_K_M 0,6 GB; Q5_K_M y Q6_K, no disponibles en el fragmento de tabla proporcionado pero previsiblemente en torno a 0,7-0,9 GB.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM; incluso iGPU y CPU son viables. Para mayor throughput, una RTX 3060, RTX 4060 o RTX 4090 ofrecerian latencias muy bajas, aunque el cuello de botella en este tamano es minimo.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, y tambien en CPU.
- Opciones de despliegue: llama.cpp, Ollama (previa importacion del GGUF), LM Studio, y servidores compatibles con GGUF. vLLM y TGI no son la via natural para este formato, aunque podrian servir el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Crouton-Reasoner-heretic (esta ficha) | 0,75 B | no disponible | Apache 2.0 | GGUF | Variante descensurada, cuantizada |
| Qwen3.5-0.8B (base original) | ~0,8 B | no disponible | no disponible | safetensors | Modelo base sin ablitation |
| Otros GGUF de ~1B (p. ej. Llama 3.2 1B, Gemma 3 1B) | 1 B aprox. | no disponible | licencias respectivas | GGUF | Alternativas de tamano comparable; datos de rendimiento no disponibles en esta ficha |

No se dispone de datos comparativos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo descensurado: la ablitation elimina los mecanismos de rechazo, por lo que puede generar contenido inapropiado, ofensivo o danino. No es apto para despliegues publicos sin moderacion externa.
- Riesgo elevado de alucinacion: con 0,75 mil millones de parametros, la capacidad de razonamiento y factualidad es limitada; conviene verificar cualquier salida en contextos de produccion.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta documentado y probablemente sera deficiente.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin medir empiricamente.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset de destilacion pueden tener condiciones adicionales no reflejadas en este repositorio; conviene revisar la licencia del modelo original.
- Las cuantizaciones IQ1/IQ2 degradan notablemente la calidad; la propia model card las etiqueta como "for the desperate" o "very low quality".
- El tag "vision" no esta respaldado por ficheros mmproj en este repositorio; la funcionalidad multimodal, si existe, requeriria el repositorio estatico hermano.
- Repositorio con 0 descargas y 0 likes en el momento del registro: poca validacion comunitaria.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/mradermacher/Qwen3.5-0.8B-Crouton-Reasoner-heretic-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.5-0.8B-Crouton-Reasoner-heretic-GGUF
- Modelo base: https://huggingface.co/Stormtrooperaim/Qwen3.5-0.8B-Crouton-Reasoner-heretic
- Dataset de destilacion: https://huggingface.co/datasets/Stormtrooperaim/Crouton-Alpha-Distilled
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-0.8B-Crouton-Reasoner-heretic-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
