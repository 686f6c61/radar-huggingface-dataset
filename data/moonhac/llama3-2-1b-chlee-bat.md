# moonhac/Llama3.2-1B-chlee-bat

## Resumen

`moonhac/Llama3.2-1B-chlee-bat` es un ajuste fino del modelo base Llama 3.2 1B Instruct de Meta, convertido a formato GGUF mediante la herramienta Unsloth. El autor, moonhac, publica el modelo con un único archivo cuantizado Q4_K_M, un Modelfile de Ollama incluido y etiquetas que indican compatibilidad con llama.cpp y endpoints de HuggingFace. El sufijo "chlee-bat" sugiere un ajuste orientado a un dominio concreto, pero la model card no aporta detalles sobre el propósito ni los datos de entrenamiento.

Con 1.235.814.400 parámetros (~1,24B), se trata de un modelo pequeño pensado para despliegue ligero en entornos con recursos limitados. Su relevancia radica en la combinación de un tamaño reducido, formato GGUF listo para inferencia local con llama.cpp u Ollama, y la base instruct de Llama 3.2, que proporciona capacidades conversacionales y de seguimiento de instrucciones. No obstante, la ausencia de información sobre licencia, idiomas y datos de entrenamiento limita su evaluación para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Llama 3.2 1B Instruct) |
| Parametros totales | 1.235.814.400 (~1,24B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (la base Llama 3.2 1B soporta 128K tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 1B Instruct, una arquitectura transformer decoder-only con normalización RMSNorm, atención multi-cabeza con RoPE (rotary position embeddings) y capas feed-forward con activación SwiGLU. El ajuste fino se realizó con Unsloth, una librería que acelera el entrenamiento (el autor indica 2x más rápido), y posteriormente se convirtió a GGUF para su uso con llama.cpp y Ollama.

No se proporciona información sobre el dataset de ajuste, el número de tokens de entrenamiento, ni si se emplearon técnicas como RLHF, DPO o SFT convencional. Tampoco se detallan innovaciones técnicas específicas del ajuste. El único archivo de pesos publicado es `llama-3.2-1b-instruct.Q4_K_M.gguf`, junto con un Modelfile de Ollama incluido en el repositorio.

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que el modelo está orientado a diálogo multi-turno.
- Seguimiento de instrucciones: hereda las capacidades instruct del modelo base Llama 3.2 1B Instruct.
- Compatibilidad con llama.cpp: formato GGUF listo para ejecución con `llama-cli`.
- Compatibilidad con Ollama: incluye Modelfile para despliegue inmediato.
- Compatibilidad con HuggingFace Inference Endpoints: el tag `endpoints_compatible` sugiere despliegue en endpoints de HF.
- Capacidades multilingües: no disponibles (la base Llama 3.2 soporta 8 idiomas, pero no se confirma para este ajuste).
- Tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Chatbot local con privacidad: al ser un modelo de 1,24B en formato GGUF, puede ejecutarse íntegramente en local, lo que permite desplegar asistentes conversacionales sin enviar datos a la nube. Adecuado para entornos donde la confidencialidad es prioritaria.
- Asistente en dispositivos edge: su tamaño reducido permite ejecutarlo en dispositivos con recursos limitados (Raspberry Pi, portátiles sin GPU dedicada) para tareas de generación de texto y respuesta a preguntas.
- Prototipado rápido de aplicaciones LLM: la inclusión de un Modelfile de Ollama facilita levantar un servicio de chat funcional en minutos para validar ideas de producto antes de escalar a modelos mayores.
- Automatización de tareas de texto en entornos con restricciones de hardware: clasificación de correos, resumen de documentos cortos o generación de respuestas plantilla, donde un modelo pequeño reduce costes de inferencia y latencia.
- Evaluación comparativa de ajustes finos: al estar basado en Llama 3.2 1B Instruct, sirve como punto de partida para comparar el efecto del ajuste "chlee-bat" frente al modelo base en tareas específicas de dominio.
- Inferencia en CPU con llama.cpp: el formato GGUF Q4_K_M permite ejecutar el modelo en CPU sin GPU, lo que lo hace viable en servidores de bajo coste o estaciones de trabajo sin aceleradores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este ajuste específico.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M para 1,24B parámetros ocupa aproximadamente 0,7-0,8 GB de pesos. Con overhead de inferencia, se recomienda un mínimo de 2 GB de VRAM para ejecución cómoda en GPU.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) es suficiente. También puede ejecutarse en CPU con llama.cpp sin problemas.
- Compatibilidad con consumer GPU: sí, cabe en prácticamente cualquier GPU de consumo actual.
- Opciones de despliegue: llama.cpp (`llama-cli -hf moonhac/Llama3.2-1B-chlee-bat --jinja`), Ollama (Modelfile incluido), HuggingFace Inference Endpoints (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles en la información proporcionada. En CPU moderna, un modelo de 1B cuantizado Q4_K_M suele generar entre 10-30 tokens/s; en GPU consumer, sustancialmente más.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| moonhac/Llama3.2-1B-chlee-bat | 1,24B | no disponible | no disponible | GGUF, safetensors | Ajuste fino de dominio desconocido |
| Llama 3.2 1B Instruct (base) | 1,24B | 128K | Licencia Comunitaria Llama 3.2 | safetensors, GGUF | Modelo oficial de Meta, 8 idiomas |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa open source con buen rendimiento en razonamiento |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | safetensors, GGUF | Más grande, pero con licencia permisiva |

La comparación se basa en especificaciones de los modelos base, ya que no hay datos de rendimiento publicados para este ajuste específico.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no declara licencia. Dado que deriva de Llama 3.2, podría estar sujeto a la Licencia Comunitaria Llama 3.2, pero esto no se confirma. No se recomienda su uso comercial sin verificar.
- Sin información de entrenamiento: se desconoce el dataset de ajuste, lo que impide evaluar sesgos, alucinaciones o comportamientos no deseados específicos del ajuste.
- Sin benchmarks publicados: no hay evidencia empírica del rendimiento del ajuste frente al modelo base o alternativas.
- Modelo pequeño: con 1,24B parámetros, su capacidad de razonamiento complejo, matemáticas avanzadas y generación de código es limitada en comparación con modelos de 7B o superiores.
- Dominio de ajuste desconocido: el sufijo "chlee-bat" no se documenta; el comportamiento fuera del dominio de ajuste podría degradarse.
- Sin metadatos de idioma: no se especifican idiomas soportados, lo que genera incertidumbre sobre su comportamiento multilingüe.
- Repositorio sin adopción: cero descargas y cero likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/moonhac/Llama3.2-1B-chlee-bat
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
