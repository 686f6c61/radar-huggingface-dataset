# BachDaThan/Qwen2.5-Coder-7B-Vietnamese-Agent-Stage2-LoRA-GGUF

## Resumen

Qwen2.5-Coder-7B-Vietnamese-Agent-Stage2-LoRA-GGUF es una distribución cuantizada en formato GGUF de un modelo Qwen2.5-Coder-7B-Instruct al que se le ha fusionado (merge) un adaptador LoRA de ajuste fino en vietnamita. Lo publica el usuario BachDaThan en Hugging Face, y se apoya en dos artefactos previos: el modelo base oficial de Alibaba (Qwen/Qwen2.5-Coder-7B-Instruct) y el adaptador khoin68/Qwen2.5-Coder-7B-Vietnamese-Agent-Stage2-LoRA. El resultado es un modelo denso de 7.615.616.512 parámetros, con arquitectura qwen2 de 28 capas, hidden size 3584 y una ventana de contexto de 32.768 tokens.

El problema que resuelve es doble. Por un lado, adapta al vietnamita un modelo especializado en código, un idioma con poca representación en los grandes modelos abiertos. Por otro, empaqueta el resultado en GGUF con cuatro niveles de cuantización (Q4_K_M, Q4_K_S, Q3_K_M y Q3_K_S) para que pueda ejecutarse en GPU de consumo e incluso en CPU mediante llama.cpp u Ollama, sin necesidad de infraestructura de servidor.

Es relevante ahora porque la combinación de un modelo pequeño (7B), licencia Apache-2.0 declarada en los artefactos de origen y cuantizaciones de entre 3,25 GB y 4,36 GB lo sitúa en el rango de equipos con 6 GB de VRAM. La contrapartida es que se trata de una publicación reciente, sin descargas ni validación comunitaria, y sin ningún benchmark publicado que respalde la calidad del ajuste en vietnamita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen2 (transformer denso, decoder-only) |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (plantilla de referencia de 8.192 en los ejemplos del autor) |
| Tipos de cuantización | Q4_K_M (4,36 GB), Q4_K_S (4,15 GB), Q3_K_M (3,55 GB), Q3_K_S (3,25 GB) |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Apache-2.0 (declarada en las etiquetas y en los artefactos de origen; el autor indica que la licencia del repositorio se determina tras la verificación de las licencias fuente y que no se autoasigna Apache-2.0) |
| Formato de pesos | GGUF (llama.cpp); el modelo base original está en bfloat16 con safetensors |
| Capas | 28 |
| Hidden size | 3.584 |
| Cabezas de atención / cabezas KV | 28 / 4 (GQA) |
| Tamaño de vocabulario | 152.064 |
| Precisión original | bfloat16 |
| Plantilla de chat | ChatML (`<|im_start|>`, `<|im_end|>`) |
| Muestreo recomendado | temperature 0.6, top_p 0.95 |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Adaptador LoRA | khoin68/Qwen2.5-Coder-7B-Vietnamese-Agent-Stage2-LoRA |
| Tamaño del repositorio | 16,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-Coder-7B-Instruct: un transformer decoder-only denso con 28 capas, hidden size de 3.584, 28 cabezas de atención y 4 cabezas KV (atención con consultas agrupadas, GQA), lo que reduce el coste de memoria de la caché KV durante la inferencia. El vocabulario es de 152.064 entradas y el modelo original se entrenó en bfloat16. No hay ningún componente híbrido ni de espacio de estados (SSM); es un transformer convencional.

Sobre el proceso de adaptación sólo se documenta lo esencial: se tomó un adaptador LoRA de ajuste fino en vietnamita (identificado como "Stage2" y orientado a agentes por su nombre) y se fusionó con los pesos del modelo base; después se cuantizó a GGUF de forma automatizada por BachDaThan. El autor indica que los tamaños de archivo se midieron con `stat().st_size` tras la cuantización, no son estimaciones. No se publica el número de tokens de entrenamiento del LoRA, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional en la decodificación.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla ChatML y soporte de mensajes de sistema.
- Generación y comprensión de código, heredada del modelo base Qwen2.5-Coder-7B-Instruct, que está especializado en tareas de programación.
- Comprensión y generación en vietnamita, más inglés; son los dos únicos idiomas declarados.
- Ajuste a instrucciones (instruction-tuned), con fusión de un adaptador LoRA específico.
- Orientación a agentes: el adaptador se denomina "Vietnamese-Agent-Stage2", lo que sugiere entrenamiento para flujos de agente, aunque la model card no documenta explícitamente tool calling ni function calling.
- Ejecución local con llama.cpp, llama-cpp-python y Ollama.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode). No disponible: confirmación de capacidades multimodales o de razonamiento explícito.

## Casos de uso

- Atención al cliente en vietnamita: el modelo puede mantener conversaciones multi-turno con contexto largo (hasta 32.768 tokens teóricos) para gestionar historiales de incidencias y consultas recurrentes en un idioma poco cubierto por otros modelos abiertos.
- Generación de código en producción: al derivar de Qwen2.5-Coder, puede emplearse para autocompletado, generación de funciones y refactorización en pipelines internos, ejecutándose en local para no enviar código propietario a APIs externas.
- Asistente de programación bilingüe vi-en: útil en equipos vietnamitas que trabajan con documentación técnica en inglés, traduciendo y explicando APIs, mensajes de error y documentación.
- Agentes locales para automatización de tareas: el nombre del adaptador indica orientación a agentes; puede integrarse en scripts que encadenen llamadas a herramientas, siempre que se valide previamente su fiabilidad en tool calling, no documentada.
- RAG sobre documentación interna: con 32.768 tokens de ventana puede recibir varios fragmentos recuperados de un índice vectorial junto con la pregunta del usuario, manteniendo el contexto completo sin truncar.
- Despliegue en portátiles y equipos sin GPU dedicada: las cuantizaciones Q3_K_S (3,25 GB) y Q3_K_M (3,55 GB) permiten ejecutar el modelo en CPU con llama.cpp u Ollama, útil para demos y prototipos.
- Educación y formación de desarrolladores: explicación de conceptos de programación y corrección de ejercicios en vietnamita, con coste cero de licencia.
- Procesamiento por lotes de textos en vietnamita: clasificación, resumen o extracción de información en pipelines offline, donde el throughput importa más que la latencia interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco hay evaluaciones de la calidad del ajuste en vietnamita. El repositorio no tiene descargas ni valoraciones que permitan inferir una validación por parte de la comunidad.

## Requisitos de hardware

- Q4_K_M (4,36 GB de archivo): VRAM recomendada por el autor, aproximadamente 6,4 GB.
- Q4_K_S (4,15 GB): VRAM recomendada, aproximadamente 6,2 GB.
- Q3_K_M (3,55 GB): VRAM recomendada, aproximadamente 5,5 GB.
- Q3_K_S (3,25 GB): VRAM recomendada, aproximadamente 5,3 GB.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB de VRAM o más (por ejemplo, RTX 3060, RTX 4060, RTX 2070 y superiores) usando las cuantizaciones Q4. Las Q3 permiten además ejecución parcial o total en CPU.
- GPU de centro de datos: A100, H100 o L40S pueden ejecutar el modelo con margen amplio y lotes grandes, aunque están sobredimensionadas para un modelo de 7B; su ventaja sería el throughput agregado.
- Opciones de despliegue documentadas: llama.cpp y llama-cpp-python (con `n_gpu_layers=-1` para descargar todas las capas en GPU) y Ollama mediante un Modelfile. No se documenta compatibilidad con vLLM, TGI o SGLang; no disponible.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Qwen2.5-Coder-7B-Vietnamese-Agent-Stage2-LoRA-GGUF) | 7.615.616.512 | 32.768 | vi, en | Apache-2.0 (verificada en artefactos de origen) | GGUF Q4/Q3 | Publicado por BachDaThan; 0 descargas |
| Qwen/Qwen2.5-Coder-7B-Instruct (base) | 7.615.616.512 | 32.768 | multilingüe, con foco en inglés y lenguajes de programación | Apache-2.0 | safetensors bfloat16, GGUF de terceros | Modelo oficial de Alibaba, ampliamente utilizado |
| khoin68/Qwen2.5-Coder-7B-Vietnamese-Agent-Stage2-LoRA | no disponible (adaptador) | no disponible | vi, en | Apache-2.0 | adaptador LoRA | Requiere fusionarse con el modelo base |
| Otras alternativas de 7B especializadas en vietnamita o en código | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La comparación cuantitativa de rendimiento (MMLU, HumanEval, GSM8K u otros) entre estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación reconocido explícitamente por el autor: la model card advierte de que el modelo puede generar información falsa y que no debe usarse como sustituto de asesoramiento profesional en áreas críticas.
- Sin benchmarks publicados: no hay ninguna evidencia cuantitativa de mejora sobre el modelo base en vietnamita ni de la degradación provocada por la cuantización.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; el repositorio es reciente y no ha sido auditado por terceros.
- Cobertura de idiomas limitada: sólo vietnamita e inglés. El castellano no está declarado, por lo que su rendimiento en español es impredecible.
- Contexto efectivo reducido en la práctica: aunque el modelo soporta 32.768 tokens, los ejemplos oficiales configuran `n_ctx` en 8.192, y el consumo de memoria de la caché KV crece con la longitud, algo a tener en cuenta en GPU pequeñas.
- Pérdida de precisión por cuantización: las versiones Q4 y Q3 degradan la calidad respecto al bfloat16 original, especialmente en tareas de código y matemáticas, donde los errores de precisión se amplifican.
- Ambigüedad de licencia: el autor advierte de que la licencia del repositorio se determina tras la verificación de las licencias de origen y que no se autoasigna Apache-2.0, aunque las etiquetas y los artefactos base declaran Apache-2.0. Conviene verificar la licencia antes de un uso comercial.
- Trazabilidad incompleta del entrenamiento: no se documentan los datos de ajuste del LoRA, su número de tokens ni el proceso de evaluación, lo que dificulta reproducir o auditar el comportamiento.
- Capacidades de agente no confirmadas: la orientación a agentes se deduce del nombre del adaptador, no de documentación técnica ni de ejemplos de tool calling en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BachDaThan/Qwen2.5-Coder-7B-Vietnamese-Agent-Stage2-LoRA-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Adaptador LoRA: https://huggingface.co/khoin68/Qwen2.5-Coder-7B-Vietnamese-Agent-Stage2-LoRA
- No se han encontrado en la búsqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a foros deportivos en árabe, sin relación con esta ficha. No hay papers, blogs técnicos, repositorios ni demos adicionales disponibles.
