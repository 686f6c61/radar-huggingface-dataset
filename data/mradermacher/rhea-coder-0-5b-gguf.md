# mradermacher/Rhea-Coder-0.5B-GGUF

## Resumen

Rhea-Coder-0.5B-GGUF es la distribucion en formato GGUF del modelo Rhea-Coder-0.5B, un modelo de lenguaje especializado en generacion de codigo desarrollado originalmente por el usuario roskosmos19 y cuantizado por mradermacher. Se trata de un ajuste fino (fine-tuning) mediante LoRA y PEFT sobre una base de la familia Qwen2, con 494.032.768 parametros totales (aproximadamente 0,5 mil millones), lo que lo situa en la categoria de modelos ultra-ligeros orientados a entornos con recursos muy limitados.

El modelo esta entrenado sobre el dataset Magicoder-OSS-Instruct-75K (ise-uiuc), un corpus de instrucciones de codigo de alta calidad, y esta declarado exclusivamente para el idioma ingles. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que junto a su reducido tamano lo hace atractivo para despliegues en CPU, dispositivos de borde y entornos de CI/CD donde el coste por inferencia es critico.

La relevancia de esta ficha radica en que el repositorio ofrece 12 cuantizaciones GGUF estaticas (desde Q2_K de 0,4 GB hasta f16 de 1,1 GB), lo que permite ejecutar el modelo en hardware muy modesto. No obstante, conviene subrayar que se trata de un modelo de 0,5B con capacidades necesariamente limitadas frente a modelos de mayor escala, y que no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen2, ajuste fino LoRA/PEFT) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Rhea-Coder-0.5B es un ajuste fino de un modelo de la familia Qwen2, segun indican las etiquetas del repositorio (qwen2, lora, peft). El proceso de entrenamiento consistio en un fine-tuning supervisado mediante LoRA y PEFT sobre el dataset Magicoder-OSS-Instruct-75K, un conjunto de instrucciones de codigo generado a partir de repositorios open source. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica principal del repositorio no reside en el modelo en si, sino en el trabajo de cuantizacion realizado por mradermacher: se ofrecen cuantizaciones estaticas en 12 variantes, incluyendo tipos IQ (IQ4_XS) y la serie K (Q2_K a Q8_0), generadas con la version 2 del pipeline de cuantizacion del autor. No se han publicado cuantizaciones ponderadas con imatrix para este modelo, segun indica la propia model card. El autor advierte que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar, y que Q4_K_S y Q4_K_M son las recomendadas por equilibrio entre velocidad y calidad.

## Capacidades

- Generacion de codigo en ingles, con enfasis en Python segun las etiquetas del repositorio (python), aunque el dataset Magicoder cubre multiples lenguajes.
- Generacion de texto conversacional en formato instruct (tag conversational).
- Razonamiento basico de programacion: el modelo esta ajustado sobre instrucciones de codigo, por lo que puede resolver tareas de completado y explicacion de fragmentos.
- Compatibilidad con text-generation-inference y endpoints compatibles (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles (language: en).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Autocompletado de codigo en editores ligeros: con solo 0,5B de parametros y cuantizaciones de 0,4-0,6 GB, el modelo puede ejecutarse en el propio portatil del desarrollador o en un servidor de baja gama para sugerencias de linea y bloque en Python, con latencia muy baja en CPU.
- Asistente de codigo en dispositivos de borde: al caber en menos de 1 GB de RAM en Q4_K_M, es viable integrarlo en entornos sin GPU, como Raspberry Pi o contenedores de recursos limitados, para tareas de generacion de snippets.
- Generacion de tests unitarios y docstrings: el ajuste sobre Magicoder-OSS-Instruct-75K lo hace adecuado para producir pruebas y documentacion a partir de funciones existentes, en un pipeline por lotes donde el coste por token es minimo.
- Preprocesamiento y enriquecimiento en CI/CD: puede emplearse como primer filtro para clasificar o resumir fragmentos de codigo antes de pasarlos a un modelo mayor, reduciendo el coste total del pipeline.
- Educacion y prototipado: sirve como modelo de referencia para experimentar con cuantizaciones GGUF, LoRA y despliegue con llama.cpp u Ollama sin requerir hardware dedicado.
- Traduccion de pseudocodigo a Python: dado su entrenamiento en instrucciones de codigo, puede convertir descripciones en lenguaje natural a implementaciones Python sencillas, util en herramientas de andamiaje interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,4 GB (Q2_K) y 1,1 GB (f16) solo para los pesos; anadir margen para el contexto y el runtime (tipicamente 0,5-1,5 GB adicionales segun la ventana).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 pueden ejecutar las cuantizaciones mayores con holgura. En A100/H100 el modelo esta infrautilizado y no aporta ventaja.
- Cabe en GPU consumer: si, en todas las cuantizaciones; tambien cabe en CPU y en dispositivos de borde.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (tag declarado), y cualquier runtime compatible con GGUF. El modelo base en safetensors es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por tamano, se espera throughput alto en CPU y muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rhea-Coder-0.5B-GGUF | 494 M | no disponible | Apache 2.0 | GGUF | Especializado en codigo, solo ingles |
| Qwen2.5-Coder-0.5B | ~0,5 B | 32 K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo oficial de Alibaba, con contexto documentado y benchmarks publicos |
| DeepSeek-Coder-1.3B | ~1,3 B | 16 K (segun documentacion publica) | DeepSeek License | safetensors, GGUF | Mayor tamano y contexto, requiere mas recursos |
| StarCoder2-3B | ~3 B | 16 K (segun documentacion publica) | BigCode OpenRAIL-M | safetensors, GGUF | Mayor capacidad pero mucho mas pesado |

Nota: los datos de contexto y licencia de los modelos comparables provienen de documentacion publica general y no de la informacion proporcionada en esta ficha; se incluyen como referencia orientativa. Para Rhea-Coder no se dispone de contexto ni benchmarks publicados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre codigo open source, puede heredar sesgos de estilo y de practicas de programacion del corpus.
- Riesgo de alucinacion: elevado en un modelo de 0,5B, especialmente en tareas de razonamiento complejo o APIs poco representadas en el dataset; no debe usarse sin validacion en produccion.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide planificar tareas que requieran ventanas largas.
- Limitaciones de idioma: solo declarado para ingles; el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original (roskosmos19/Rhea-Coder-0.5B) y del dataset Magicoder-OSS-Instruct-75K.
- Caveat de produccion: al ser una cuantizacion estatica sin imatrix, las variantes de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.
- El repositorio registra 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Rhea-Coder-0.5B-GGUF
- Modelo base: https://huggingface.co/roskosmos19/Rhea-Coder-0.5B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Rhea-Coder-0.5B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
