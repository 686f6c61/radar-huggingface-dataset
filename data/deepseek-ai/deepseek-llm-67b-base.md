# deepseek-ai/deepseek-llm-67b-base

## Resumen

DeepSeek LLM 67B Base es un modelo de lenguaje de 67.000 millones de parametros desarrollado por DeepSeek AI y publicado en HuggingFace el 29 de noviembre de 2023. Se trata de un modelo base (no ajustado por instrucciones) entrenado desde cero sobre un corpus de 2 billones de tokens en ingles y chino, con atencion de consultas agrupadas (Grouped-Query Attention, GQA). La variante base esta pensada para investigacion y como punto de partida para ajuste fino, mientras que la version Chat del mismo tamano cubre el uso conversacional.

El modelo forma parte de la primera generacion open source de DeepSeek, que publico las variantes 7B y 67B tanto en version base como chat. Su relevancia radica en que ofrece un tamano cercano a los 70B con licencia que permite uso comercial y pesos abiertos, lo que lo situa como alternativa a Llama 2 70B o Qwen 72B en el segmento de modelos densos de gran tamano para despliegue autoalojado.

El repositorio ocupa 269,7 GB y acumula 9.371 descargas y 148 "likes" en HuggingFace. La model card no especifica la longitud de contexto, los tipos de cuantizacion publicados ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped-Query Attention (GQA) |
| Parametros totales | 67.000 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en bfloat16) |
| Idiomas soportados | Ingles y chino |
| Licencia | DeepSeek Model License (license: other, license_name: deepseek); uso comercial permitido |
| Formato de pesos | PyTorch para transformers (no se confirma safetensors en la informacion disponible) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atencion de consultas agrupadas (GQA), una variante que reduce el numero de cabezas de clave y valor respecto a las cabezas de consulta para disminuir el coste de memoria del cache KV durante la inferencia. Se entreno desde cero sobre un dataset de 2 billones de tokens que combina contenido en ingles y chino. La model card no detalla la composicion exacta del corpus, la mezcla de idiomas por proporcion ni el numero de tokens por fase.

Al tratarse de la version base, el modelo no incorpora tecnicas de alineacion como RLHF, DPO o SFT orientadas a seguir instrucciones; su objetivo es la modelizacion de lenguaje pura y la prediccion del siguiente token. La familia incluye tambien las variantes DeepSeek LLM 7B/67B Chat, que si incorporan ajuste por instrucciones. La model card no menciona innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva y completado de secuencias en ingles y chino.
- Modelizacion de lenguaje base, adecuada para tareas de continuacion y no para dialogo directo sin ajuste.
- Capacidad de servir como base para ajuste fino supervisado (SFT) y alineacion posterior (RLHF/DPO).
- Soporte de inferencia mediante transformers, text-generation-inference y despliegue compatible con endpoints.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues limitadas a los idiomas de entrenamiento declarados (ingles y chino).

## Casos de uso

- Punto de partida para ajuste fino por dominio: al ser un modelo base, se puede entrenar con datos especificos (legal, medico, financiero) sin arrastrar sesgos de una capa de instrucciones previa.
- Investigacion academica en modelizacion de lenguaje: sirve para estudiar escalado, GQA y comportamiento de modelos densos de 67B con pesos abiertos.
- Generacion de texto en ingles y chino: adecuado para tareas de redaccion asistida donde se disponga de un pipeline propio de prompting sobre el modelo base.
- Destilacion de conocimiento: el modelo puede actuar como profesor para generar datos sinteticos que entrenen modelos mas pequenos.
- Evaluacion comparativa de arquitecturas: util como referencia densa de 67B frente a variantes MoE o de contexto extendido.
- Base para sistemas de recuperacion aumentada (RAG): combinado con un recuperador externo y ajuste ligero, puede emplearse en respuesta a consultas documentales en ingles o chino.
- Prototipado de asistentes conversacionales: requiere una fase de ajuste por instrucciones antes de exponerse a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada en bfloat16/fp16: aproximadamente 134 GB solo para pesos, mas cache KV, por lo que requiere multiples GPU de 80 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 67 GB para pesos, viable en una unica GPU de 80 GB (A100 80GB, H100 80GB).
- VRAM estimada en cuantizacion de 4 bits: en torno a 35-40 GB para pesos, cabe en una GPU de 48 GB o en dos GPU de 24 GB.
- GPU recomendadas: A100 80GB, H100 80GB o A800 80GB; en configuraciones multi-GPU para precision completa.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en precision completa ni en 8 bits; con cuantizacion de 4 bits requeriria varias tarjetas o memoria unificada.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta oficial del repositorio), vLLM, llama.cpp y Ollama siempre que existan pesos GGUF generados por terceros.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek LLM 67B Base | 67B | Transformer denso con GQA | No disponible | DeepSeek Model License (comercial permitido) | Pesos abiertos en HuggingFace |
| Llama 2 70B | 70B | Transformer denso con GQA | 4.096 tokens (dato publico del modelo comparable) | Llama 2 Community License | Pesos abiertos |
| Qwen 1.5 72B | 72B | Transformer denso | No disponible en la informacion proporcionada | Qwen License | Pesos abiertos |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Al ser un modelo base, no sigue instrucciones de forma fiable; responde con continuaciones y puede desviarse del formato esperado.
- Riesgo de alucinacion elevado en tareas de respuesta factual, especialmente sin verificacion externa.
- Sesgos potenciales derivados del corpus de entrenamiento en ingles y chino, con cobertura limitada de otros idiomas.
- Capacidad reducida en idiomas distintos del ingles y el chino; no se documenta soporte para castellano.
- La licencia es la DeepSeek Model License (no MIT); el codigo del repositorio si es MIT, pero los pesos se rigen por la licencia de modelo, que permite uso comercial con condiciones que conviene revisar en el archivo LICENSE-MODEL.
- No se especifica la ventana de contexto ni la estrategia de atencion en secuencias largas, lo que dificulta dimensionar pipelines de contexto extendido.
- No se han publicado benchmarks oficiales en la model card, por lo que la evaluacion de calidad requiere pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepseek-ai/deepseek-llm-67b-base
- Repositorio GitHub: https://github.com/deepseek-ai/DeepSeek-LLM
- Licencia del modelo: https://github.com/deepseek-ai/DeepSeek-LLM/blob/main/LICENSE-MODEL
- Pagina principal de DeepSeek: https://deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion en GitHub: https://github.com/deepseek-ai
- Plataforma API de DeepSeek: https://www.deepseek.com/en/platform/
- Discord: https://discord.gg/Tc7c45Zzu5
