# radlab/pLLama-L31-adapters-MIX-SFT-DPO

## Resumen

pLLama-L31-adapters-MIX-SFT-DPO es un checkpoint publicado por radlab (laboratorio polaco autor del proyecto pLLama) construido sobre meta-llama/Llama-3.1-8B-Instruct, con Meta-Llama-3-8B-Instruct también declarado como modelo base en la model card. El repositorio contiene pesos en formato safetensors con 8.031.637.504 parámetros (9,1 GB de tamaño de repo) y etiquetas que indican cuantización de 8 bits mediante bitsandbytes, lo que sugiere una fusión del modelo base con adaptadores entrenados y posteriormente cuantizado.

La nomenclatura del repositorio (MIX-SFT-DPO) indica un pipeline de ajuste en dos fases: un supervised fine-tuning sobre una mezcla de datasets y una etapa posterior de optimización por preferencias (DPO) para alinear el estilo de respuesta. El nombre "pLLama" y el enlace a la entrada de blog de radlab.dev, titulada en polaco, apuntan a un esfuerzo de adaptación al polaco, aunque la model card no declara explícitamente la lista de idiomas soportados.

Su relevancia práctica es limitada pero concreta: es un ejemplo reproducible de cómo un adaptador SFT+DPO sobre Llama 3.1 8B puede distribuirse ya fusionado en 8 bits, reduciendo el peso en memoria respecto a fp16 y permitiendo el despliegue en GPUs de consumo. Con 25 descargas y 0 likes, se trata de un artefacto de investigación más que de un modelo de producción con validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), heredada del modelo base |
| Parámetros totales | 8.031.637.504 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens según la especificación pública de Llama 3.1 8B; no verificado en la model card de este repositorio |
| Tipos de cuantización | Pesos publicados en 8 bits (bitsandbytes); no se ofrecen variantes GGUF, AWQ ni GPTQ en el repo |
| Idiomas soportados | No disponible en la model card; la nomenclatura "pLLama" y el blog del autor apuntan a polaco |
| Licencia | Llama 3.1 Community License (identificador `llama3.1`) |
| Formato de pesos | safetensors (8-bit, bitsandbytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only denso con atención por grupos (GQA), RoPE y tokenizador con vocabulario de 128.256 entradas, diseñado para contextos largos. Sobre esta base, radlab aplicó un esquema de ajuste en dos etapas: primero SFT sobre una mezcla de datasets (el sufijo MIX hace referencia a esa combinación) y después DPO para alinear las respuestas con preferencias humanas. El resultado se distribuye fusionado con el modelo base y cuantizado a 8 bits con bitsandbytes, de ahí que el recuento de parámetros safetensors coincida exactamente con el del modelo completo y no con el de un adaptador LoRA aislado.

No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición exacta del dataset mixto, los hiperparámetros de DPO (beta, pares de preferencia) ni el proceso de fusión y cuantización. Tampoco hay información sobre innovaciones técnicas adicionales como decodificación especulativa o variantes de atención lineal. Cualquier afirmación sobre estas cuestiones requeriría consultar el blog del autor o el repositorio de training, no incluidos aquí.

## Capacidades

- Generación de texto instructiva en el estilo alineado por DPO: respuestas conversacionales, resúmenes y reescritura.
- Razonamiento de un solo turno y multi-turno dentro de la ventana de contexto heredada del modelo base.
- Generación de código y explicaciones técnicas, con el nivel propio de Llama 3.1 8B Instruct (capacidad moderada, no especializada).
- Aritmética y razonamiento matemático básico e intermedio, sin herramientas externas.
- Soporte de tool calling y function calling heredado del formato de Llama 3.1 Instruct, condicionado a que la plantilla de chat se aplique correctamente.
- Capacidad de seguir instrucciones con formato y restricciones (JSON, listas, roles), sujeta a la calidad del SFT aplicado.
- Capacidades multilingües: no declaradas; el foco declarado implícitamente es el polaco, con el inglés como lengua de herencia del base.
- No se declaran capacidades de visión, audio ni modos de "thinking" explícitos.

## Casos de uso

- Atención al cliente en polaco: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 131.072 tokens según la especificación del base) y mantener el historial de la sesión sin truncamientos agresivos, siempre que se valide la calidad real en ese idioma.
- Generación aumentada por recuperación (RAG) sobre documentación interna: al ser un modelo de 8B en 8 bits, cabe en una sola GPU y permite inyectar varios fragmentos de contexto en el prompt sin agotar la memoria.
- Resumen y reescritura de documentos largos: informes, actas o correos, aprovechando la ventana extendida para procesar el documento completo en una sola pasada.
- Clasificación y extracción de información estructurada: salida en JSON con esquema fijo para pipelines de ingesta de datos, con validación posterior del esquema.
- Asistente de código ligero en IDE o CLI: autocompletado, explicación de fragmentos y generación de tests, aceptable para tareas acotadas pero no comparable a modelos especializados en código.
- Base para experimentos de alineación: sirve como punto de partida para evaluar el efecto de SFT+DPO sobre Llama 3.1 8B y para entrenar adaptadores adicionales sobre el checkpoint fusionado.
- Despliegue en hardware de consumo para prototipado: al ocupar del orden de 8-9 GB en pesos de 8 bits, es viable en una RTX 4090 o una RTX 4060 Ti de 16 GB para demos internas.
- Evaluación comparativa de la variante polaca frente al Llama 3.1 8B Instruct original en tareas de idioma, si se dispone de un conjunto de evaluación propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones en polaco, y no existe una comparación oficial con el modelo base ni con los adaptadores intermedios.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,5-9,5 GB solo para los pesos en 8 bits; añadir 1-3 GB de caché KV según longitud de contexto y tamaño de lote.
- En fp16 (tras des-cuantizar): unos 16 GB de pesos más caché KV, lo que exige GPUs de 24 GB o más para contextos largos.
- GPU recomendadas: A100 40/80 GB o H100 para throughput alto y contextos de 128K; RTX 4090 (24 GB) y RTX 3090 (24 GB) para uso individual cómodo; RTX 4080 (16 GB) y RTX 4060 Ti (16 GB) para contextos moderados.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 12 GB o más si se mantiene el contexto acotado; por debajo de 10-12 GB habría que recurrir a cuantizaciones de 4 bits no publicadas en este repo.
- Opciones de despliegue: transformers con bitsandbytes (ruta natural, dado que los pesos son 8-bit); llama.cpp, Ollama o LM Studio solo tras convertir manualmente a GGUF, formato que el repositorio no proporciona; vLLM y TGI requieren normalmente pesos en fp16/bf16, por lo que habría que des-cuantizar o volver a fusionar los adaptadores antes de servirlos.
- Latencia y throughput estimados: no disponibles, al no haberse publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| radlab/pLLama-L31-adapters-MIX-SFT-DPO | 8,03 B (8-bit) | 131.072 (heredado del base) | Llama 3.1 Community | HuggingFace, 25 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131.072 | Llama 3.1 Community | HuggingFace, ampliamente distribuido |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 | Llama 3 Community | HuggingFace |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 nativo, ampliable | Apache 2.0 | HuggingFace |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 | Apache 2.0 | HuggingFace |

La comparación relevante es contra el propio Llama 3.1 8B Instruct: este checkpoint añade un ajuste SFT+DPO sobre una mezcla de datos no documentada y una cuantización de 8 bits que reduce el requisito de VRAM, a cambio de una licencia idéntica, ausencia de evaluación publicada y pérdida de flexibilidad en el formato de pesos. Frente a Qwen2.5-7B-Instruct y Mistral-7B-Instruct-v0.3, la diferencia principal es la licencia: las alternativas permiten uso comercial sin las restricciones de la Llama Community License. No hay datos de rendimiento comparado disponibles para este checkpoint.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks que permitan afirmar que el ajuste SFT+DPO mejora al Llama 3.1 8B Instruct original; podría degradarlo en algunas tareas.
- Idiomas no declarados: aunque el proyecto pLLama se orienta al polaco, la model card no especifica cobertura ni calidad por idioma, y el rendimiento en castellano no está verificado.
- Riesgo de alucinación: inherente a un modelo de 8B con ajuste por preferencias; el DPO puede aumentar la fluidez y la seguridad aparente sin mejorar la veracidad factual.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad ni filtering de datos de entrenamiento.
- Licencia Llama 3.1 Community: permite uso comercial con restricciones (cláusula de 700 millones de usuarios mensuales, obligaciones de atribución y política de uso aceptable); no es una licencia de código abierto permisiva.
- Estado del repositorio: 25 descargas y 0 likes implican nula validación por parte de la comunidad; tratarlo como artefacto experimental, no como modelo listo para producción.
- Formato de pesos restrictivo: la cuantización 8-bit con bitsandbytes obliga a usar transformers y complica el despliegue en servidores de alto throughput; no hay GGUF, AWQ ni GPTQ publicados.
- Ambigüedad sobre el contenido real: el nombre indica adaptadores, pero el recuento de parámetros corresponde a un modelo completo fusionado; conviene inspeccionar `config.json` y la lista de ficheros antes de asumir la estructura.
- Fecha de actualización del repositorio (2026-10-26) posterior a la de creación (2024-11-03): verificar si los pesos fueron reemplazados respecto a la versión original del blog.

## Enlaces

- HuggingFace: https://huggingface.co/radlab/pLLama-L31-adapters-MIX-SFT-DPO
- Blog del autor (pLLama 3.1 8B, en polaco): https://radlab.dev/2024-12-08/pllama3-1-8b-czyli-srednio-duze-a-nawet-male-genai-dla-polskiego/
- Modelo base principal: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo base secundario: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
