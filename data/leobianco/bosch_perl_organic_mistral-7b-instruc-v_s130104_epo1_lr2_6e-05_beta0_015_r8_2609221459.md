# leobianco/bosch_PERL_organic_Mistral-7B-Instruc-v_S130104_epo1_lr2_6e-05_beta0_015_r8_2609221459

## Resumen

Este repositorio contiene un ajuste fino supervisado por refuerzo del modelo mistralai/Mistral-7B-Instruct-v0.3, publicado por el usuario leobianco. El entrenamiento se ha realizado con la librería TRL de Hugging Face aplicando RLOO (REINFORCE Leave-One-Out), un método de optimización estilo REINFORCE presentado en el artículo "Back to Basics: Revisiting REINFORCE-Style Optimization for Learning from Human Feedback in LLMs" (ACL 2024). Es, por tanto, un ejemplo de alineación por preferencias sin necesidad de un modelo crítico separado, lo que reduce el coste computacional frente a PPO.

El modelo hereda del modelo base una arquitectura transformer decoder-only de aproximadamente 7.250 millones de parámetros, con atención de ventana deslizante y una longitud de contexto nativa de 32.768 tokens. El identificador del repositorio codifica una configuración de entrenamiento concreta (1 época, learning rate 2,6e-05, beta 0,015 y r=8), aunque estos valores no se detallan ni se confirman en la model card.

La relevancia de esta ficha es limitada pero instructiva: se trata de un artefacto de investigación con 0 descargas y 0 "me gusta" en el momento de la consulta, sin licencia declarada, sin dataset documentado y sin resultados de evaluación publicados. Puede resultar útil para reproducir experimentos con RLOO, pero no debe considerarse un modelo listo para producción sin una evaluación previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención de ventana deslizante (heredada del modelo base Mistral-7B-Instruct-v0.3) |
| Parametros totales | Aproximadamente 7.250 millones (heredados del modelo base; no se especifica en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible. El modelo base admite FP16/BF16, INT8 e INT4 (GPTQ, AWQ, GGUF), pero no se declara ninguno para este ajuste |
| Idiomas soportados | No disponible |
| Licencia | No disponible. El campo `licence` de la model card contiene el literal "license", que actúa como marcador de posición |
| Formato de pesos | safetensors (etiqueta del repositorio); compatible con transformers y con endpoints compatibles |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Método de entrenamiento | RLOO (REINFORCE Leave-One-Out) mediante TRL |
| Versiones de framework | TRL 1.9.2, Transformers 5.14.1, PyTorch 2.11.0, Datasets 5.0.1, Tokenizers 0.22.2 |
| Tamano del repositorio | 0,0 GB (según la API de HuggingFace) |
| Fecha de creacion | 2026-09-22 |
| Ultima actualizacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Mistral-7B-Instruct-v0.3: un transformer decoder-only de 7.250 millones de parámetros con atención de ventana deslizante de 4.096 tokens, atención completa sobre el contexto total de 32.768 tokens, capas de atención con consultas agrupadas (GQA) y un vocabulario de 32.768 entradas ampliado precisamente en la versión v0.3 para mejorar la tokenización de código. No se ha modificado la arquitectura; el repositorio contiene únicamente los pesos resultantes del ajuste.

El procedimiento de entrenamiento es RLOO, una variante de REINFORCE con estimador leave-one-out de la línea base que elimina la necesidad de entrenar un modelo crítico aparte. Según la model card, el ajuste se hizo con TRL 1.9.2 y el entrenamiento está registrado en un panel público de Weights & Biases (ejecución `0pmaa6x6`, proyecto `new_perl`, entidad `leobianco-universit-paris-saclay`). La model card no documenta el conjunto de datos, el número de tokens de entrenamiento, la composición del corpus, ni si hubo una fase previa de SFT o DPO. El nombre del repositorio sugiere 1 época de entrenamiento, un learning rate de 2,6e-05, un coeficiente beta de 0,015 y un valor r=8 que probablemente corresponda al rango de una adaptación LoRA, pero ninguno de estos valores se confirma en la documentación.

## Capacidades

- Generación de texto y conversación multi-turno en formato de mensajes (`role`/`content`), tal como muestra el ejemplo de uso rápido de la model card.
- Razonamiento y respuesta a preguntas de carácter abierto, incluidas preguntas hipotéticas o de opinión.
- Generación de código y comprensión de lenguajes de programación, capacidad heredada del vocabulario ampliado del modelo base v0.3.
- Soporte de tool calling / function calling: el modelo base Mistral-7B-Instruct-v0.3 incorpora plantillas nativas de llamada a herramientas. No se confirma que el ajuste con RLOO haya preservado esta capacidad.
- Capacidades multilingües: no documentadas para este ajuste. El modelo base está entrenado predominantemente en inglés, con competencia limitada y desigual en otros idiomas.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para este ajuste.
- Capacidades especiales (modo "thinking", visión, audio): ninguna. Es un modelo exclusivamente de texto.
- Contexto largo: hereda la ventana de 32.768 tokens del modelo base, útil para resúmenes y conversaciones extensas, aunque la ventana deslizante de 4.096 tokens del modelo base limita la atención efectiva en algunos estratos.

## Casos de uso

- Atención al cliente automatizada en inglés: el modelo puede gestionar conversaciones multi-turno con hasta 32.768 tokens de contexto, lo que permite mantener el historial completo de una incidencia larga sin truncar. Requiere una evaluación previa de calidad, ya que no hay benchmarks publicados.
- Asistente interno sobre documentación técnica con RAG: gracias a la ventana de contexto larga, se pueden inyectar varios fragmentos de manuales o políticas internas y generar respuestas sintetizadas. Adecuado para prototipos, no para producción sin control de alucinaciones.
- Generación y revisión de código en pipelines de CI/CD: el vocabulario ampliado del modelo base v0.3 mejora la tokenización de código. Puede usarse para redactar tests unitarios, resumir diffs o proponer correcciones en un paso de revisión automatizada, siempre con revisión humana.
- Extracción de información estructurada: dado un texto libre (correos, informes, transcripciones), generar JSON con campos predefinidos. El tamaño de 7B permite desplegarlo en una GPU de gama media con cuantización de 4 bits.
- Resumen de documentos largos: artículos, contratos o actas de reunión que quepan en la ventana de 32.768 tokens, sin necesidad de dividir el documento en fragmentos.
- Reproducción de investigación sobre RLOO: el repositorio incluye el enlace a la ejecución de Weights & Biases y las versiones exactas de los frameworks, lo que lo convierte en un punto de partida para replicar el método o comparar con PPO y DPO.
- Despliegue en entornos on-premise con requisitos de soberanía del dato: con cuantización de 4 bits, el modelo cabe en GPUs de consumo como la RTX 3060 de 12 GB, lo que permite ejecutarlo en infraestructura local sin enviar datos a la nube.
- Base para un ajuste fino adicional específico de dominio: al ser un modelo de 7B con licencia heredada permisiva en el modelo base, es un candidato razonable para LoRA sobre un corpus propio, aunque la licencia del ajuste no está declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra), y los resultados de la búsqueda web realizada no contienen información relacionada con este modelo. No se dispone tampoco de métricas de la ejecución de RLOO en el panel de Weights & Biases enlazado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 15-16 GB para los pesos, más el consumo del KV cache según la longitud del contexto. Con 32.768 tokens de contexto el cache puede añadir varios gigabytes adicionales.
- VRAM estimada en INT8: aproximadamente 8-9 GB.
- VRAM estimada en INT4 (GPTQ, AWQ o GGUF Q4_K_M): aproximadamente 4,5-6 GB.
- GPU de consumo compatibles: RTX 3060 12 GB y RTX 4060 Ti 16 GB en 4 bits; RTX 3090 y RTX 4090 de 24 GB pueden ejecutar FP16 cómodamente y 8 bits con margen para contexto largo.
- GPU de centro de datos recomendadas: A100 40 GB, A100 80 GB, H100 80 GB y L40S para despliegues concurrentes con vLLM o TGI.
- Opciones de despliegue: transformers (pipeline nativo, tal como documenta la model card), vLLM, Text Generation Inference, SGLang y HuggingFace Inference Endpoints (el repositorio lleva la etiqueta `endpoints_compatible`). Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de las alternativas corresponden a documentación pública de sus respectivos fabricantes y se incluyen como referencia; no se han verificado en el contexto de este repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este ajuste (leobianco/bosch_PERL_organic...) | ~7,25B | 32.768 tokens (heredado) | No declarada en la model card | Repositorio en HuggingFace con 0 descargas y 0 likes |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7,25B | 32.768 tokens | Apache 2.0 | Ampliamente disponible en HuggingFace y en proveedores cloud |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Llama 3.1 Community License (con restricciones para grandes despliegues) | Ampliamente disponible en HuggingFace |
| Qwen/Qwen2.5-7B-Instruct | ~7,6B | 32.768 tokens nativos, extensible a 131.072 con YaRN | Apache 2.0 (mayoría de variantes) | Ampliamente disponible en HuggingFace |

No se dispone de datos de benchmarks para este ajuste, por lo que la comparación de rendimiento con las alternativas no puede establecerse.

## Limitaciones y advertencias

- Licencia no declarada: el campo `licence` de la model card contiene el literal "license" como marcador de posición. Aunque el modelo base Mistral-7B-Instruct-v0.3 se distribuye bajo Apache 2.0, la licencia del derivado no está especificada, lo que genera incertidumbre legal para uso comercial. Conviene contactar con el autor antes de desplegarlo en producción.
- Tamano del repositorio de 0,0 GB: según la API de HuggingFace, el repositorio no contiene datos. Es posible que los pesos no se hayan subido o que la consulta se haya realizado antes de completar la carga. Debe verificarse antes de intentar descargar el modelo.
- Sin resultados de evaluación: no hay benchmarks publicados, ni evaluación humana, ni comparación con el modelo base. No hay evidencia de que el ajuste con RLOO haya mejorado al modelo de partida.
- Dataset de entrenamiento no documentado: se desconoce la composición del corpus, su idioma, su dominio y si contiene datos filtrados o con sesgos. El nombre del repositorio incluye la cadena "bosch", que sugiere un posible origen industrial o corporativo, pero no hay confirmación alguna.
- Riesgo de alucinación: inherente a los modelos de 7B de esta generación, especialmente en tareas de razonamiento factual, matemáticas y recuperación de conocimiento especializado.
- Idiomas no declarados: el modelo base está entrenado mayoritariamente en inglés. El rendimiento en castellano u otros idiomas no está verificado y probablemente sea inferior.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta. No existen informes independientes de uso.
- Modelo de investigación: dado el contexto (fine-tune derivado de una ejecución experimental con RLOO), no debe considerarse apto para producción sin una batería de evaluaciones propia que cubra exactitud, seguridad, sesgos y robustez.
- Restricciones técnicas del modelo base: la ventana deslizante de 4.096 tokens puede degradar la recuperación de información en posiciones alejadas dentro del contexto de 32.768 tokens.
- Idiomas y licencia del modelo base no se trasladan automáticamente al derivado: cualquier uso comercial debe analizarse caso por caso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leobianco/bosch_PERL_organic_Mistral-7B-Instruc-v_S130104_epo1_lr2_6e-05_beta0_015_r8_2609221459
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Repositorio de TRL: https://github.com/huggingface/trl
- Artículo de RLOO (arXiv 2402.14740): https://huggingface.co/papers/2402.14740
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/leobianco-universit-paris-saclay/new_perl/runs/0pmaa6x6
- Los resultados de la búsqueda web realizada no contienen enlaces relacionados con este modelo; los enlaces devueltos corresponden a contenidos sin relación con el objeto de esta ficha.
