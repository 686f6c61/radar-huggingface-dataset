# mehmettozlu/Turkish-Gemma-2-9B-IT-GGUF

## Resumen

Turkish-Gemma-2-9B-IT-GGUF es un ajuste fino del modelo Gemma-2-9B-it de Google, especializado en conversación y generación de texto en turco. El autor, mehmettozlu, ha utilizado la librería Unsloth para el entrenamiento y la posterior conversión a formato GGUF, lo que permite ejecutarlo de forma eficiente en CPU y GPU mediante llama.cpp, Ollama u otros motores compatibles. El modelo hereda la arquitectura transformer de Gemma-2 con 9.241 millones de parámetros y una ventana de contexto de 8.192 tokens.

Su relevancia radica en ofrecer una alternativa en turco de un modelo ya capaz, con cuantizaciones listas para producción local (Q4_K_M, Q5_K_M, Q8_0 y F16). Al estar en GGUF, se integra fácilmente en entornos de despliegue ligero, sin necesidad de infraestructura cloud, y es compatible con endpoints que soporten este formato. No obstante, la información pública sobre el dataset de entrenamiento, la licencia exacta y los resultados de evaluación es escasa, por lo que su adopción en entornos críticos debe hacerse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-2), con atención local y global alternada |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (heredada de Gemma-2-9b-it) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0, F16 |
| Idiomas soportados | Turco (principal, según denominación del modelo); el modelo base Gemma-2-9b-it soporta múltiples idiomas, pero no se especifican para este ajuste |
| Licencia | no disponible (el modelo base Gemma-2 tiene su propia licencia de Google) |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-2-9b-it, un transformer decoder-only de 9B parámetros con una arquitectura que combina atención local (sliding window) y atención global en capas alternas. Esta configuración reduce el coste computacional manteniendo un buen rendimiento en tareas de razonamiento y generación. El ajuste fino se ha realizado con Unsloth, una librería optimizada que acelera el entrenamiento mediante kernels eficientes y reducción de memoria.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La model card solo indica que el modelo fue fine-tuned y convertido a GGUF. Se sabe que el token BOS fue ajustado para compatibilidad con GGUF, lo que puede afectar ligeramente al comportamiento en algunos motores de inferencia. Dada la falta de información, no es posible confirmar si el entrenamiento incluyó datos multilingües o solo turco.

## Capacidades

- Generación de texto conversacional en turco, con fluidez y coherencia mejoradas respecto al modelo base gracias al ajuste fino.
- Razonamiento y respuesta a preguntas de conocimiento general, limitado por la ventana de contexto de 8.192 tokens.
- Soporte de instrucciones y diálogos multi-turno, típico de los modelos instruct de la familia Gemma.
- Capacidad de ejecución en entornos locales mediante llama.cpp, Ollama y otros motores compatibles con GGUF.
- Compatibilidad con endpoints que acepten GGUF, lo que permite su integración en APIs propias o servicios como FriendliAI.
- No se ha confirmado soporte para tool calling, function calling ni modos de razonamiento extendido (thinking mode). Tampoco se indica capacidad multimodal.

## Casos de uso

- Asistente virtual en turco para atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 8.192 tokens, adecuado para resolver dudas frecuentes y derivar casos complejos a un humano. Su formato GGUF permite desplegarlo en servidores modestos sin depender de APIs externas.
- Generación de contenido localizado: redacción de artículos, descripciones de producto o respuestas en foros en turco, aprovechando la mejora de fluidez y naturalidad del ajuste fino.
- Chatbot educativo para aprendizaje de idiomas: al estar especializado en turco, puede servir como tutor conversacional para estudiantes, corrigiendo errores y practicando diálogos.
- Procesamiento de documentos internos en turco: resumen de actas, correos o informes, siempre que el texto no supere la ventana de contexto.
- Prototipado rápido de aplicaciones de IA generativa: al ser GGUF, se puede integrar en proyectos con llama.cpp u Ollama para validar ideas sin necesidad de GPUs de gran tamaño.
- Despliegue en entornos con restricciones de conectividad: al ejecutarse localmente, es útil en organizaciones que requieren procesamiento de datos sin enviarlos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este ajuste fino. Se recomienda realizar pruebas propias antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (modelo de 9B parámetros):
  - Q4_K_M: aproximadamente 5-6 GB
  - Q5_K_M: aproximadamente 6-7 GB
  - Q8_0: aproximadamente 9-10 GB
  - F16: aproximadamente 18-19 GB
- GPU recomendadas: RTX 3060 12GB para Q4_K_M o Q5_K_M; RTX 4090 o A100 para Q8_0 y F16.
- Es posible ejecutar las cuantizaciones Q4_K_M y Q5_K_M en GPUs de consumo (serie RTX 30/40) con suficiente VRAM, o incluso en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama (incluye Modelfile), vLLM (con soporte GGUF experimental), TGI (con adaptaciones) y servicios compatibles con endpoints GGUF.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y del motor de inferencia utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| mehmettozlu/Turkish-Gemma-2-9B-IT-GGUF | 9,24B | 8.192 | no disponible | GGUF | Turco conversacional |
| google/gemma-2-9b-it | 9,24B | 8.192 | Gemma Terms of Use | safetensors | Multilingüe instruct |
| neuralwork/gemma-2-9b-it-tr | 9,24B | 8.192 | no disponible | safetensors | Turco QA y conversación (55k muestras) |

No se dispone de datos de rendimiento comparativo. La principal diferencia entre este modelo y el de neuralwork es el formato (GGUF vs safetensors) y la metodología de entrenamiento (Unsloth vs dataset curado manualmente). El modelo base de Google ofrece cobertura multilingüe, mientras que los ajustes turcos sacrifican ese alcance por una mayor fluidez en turco.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado información sobre mitigación de sesgos. Al ser un ajuste de Gemma-2, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación: no se han evaluado tasas de alucinación. Como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados.
- Limitaciones de contexto: la ventana de 8.192 tokens es fija y puede ser insuficiente para documentos largos o conversaciones extensas.
- Limitaciones de idioma: aunque el modelo está especializado en turco, no se ha confirmado su rendimiento en otros idiomas. Es probable que su capacidad multilingüe sea inferior a la del modelo base.
- Restricciones de licencia: la licencia no está especificada en el repositorio. Dado que deriva de Gemma-2, es necesario revisar los términos de uso de Google (Gemma Terms of Use) para verificar si el uso comercial está permitido y bajo qué condiciones.
- Advertencia para producción: la falta de benchmarks y documentación de entrenamiento hace que sea difícil predecir su comportamiento en escenarios reales. Se recomienda realizar pruebas exhaustivas antes de integrarlo en sistemas críticos.
- El ajuste del token BOS puede provocar comportamientos inesperados en algunos motores de inferencia si no se configura correctamente el prompt.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mehmettozlu/Turkish-Gemma-2-9B-IT-GGUF
- Modelo base Gemma-2-9b-it: https://huggingface.co/google/gemma-2-9b
- Ajuste turco similar (neuralwork/gemma-2-9b-it-tr): https://huggingface.co/neuralwork/gemma-2-9b-it-tr
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- Documentación de llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com/
