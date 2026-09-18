# diggajupadhyay/sathi-1.7b-ne

## Resumen

Sathi (साथी) es un modelo de lenguaje de 1.720.574.976 parámetros (aproximadamente 1,7B) especializado en nepalí, desarrollado por el usuario diggajupadhyay. Se trata de un ajuste fino del modelo base Qwen/Qwen3-1.7B mediante QLoRA, orientado a resolver un problema muy concreto: los modelos generalistas tratan el nepalí como una nota a pie de página, derivan hacia el hindi, inventan fechas del calendario Bikram Sambat y convierten unidades de conteo locales como lakh y crore en millones.

El modelo se distribuye principalmente como GGUF cuantizado en q4_k_m de aproximadamente 1,1 GB, lo que permite ejecutarlo en la CPU de un portátil o en una GPU de gama baja. Su entrenamiento se realizó con QLoRA (base en 4 bits NF4, rango 32, una época, longitud de secuencia 1024) sobre una única GPU de consumo de 8 GB, con la pérdida enmascarada únicamente en los turnos del asistente.

La relevancia de esta ficha radica en su honestidad metodológica: el propio autor publica una evaluación de 16 casos donde Sathi obtiene 6/16, frente a 4/16 del Qwen3-1.7B base y 7/16 de Llama-3.2-3B. Es decir, mejora a su base pero todavía no supera a un modelo del doble de tamaño sin entrenamiento específico en nepalí. Se trata de un primer checkpoint de ajuste por instrucciones, sin preentrenamiento continuado sobre un corpus nepalí a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-1.7B); no se documentan modificaciones estructurales |
| Parametros totales | 1.720.574.976 (aproximadamente 1,72B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen3-1.7B; el ajuste QLoRA se hizo con longitud de secuencia 1024 y los ejemplos del repositorio usan n_ctx=4096 |
| Tipos de cuantizacion | GGUF q4_k_m (aproximadamente 1,1 GB); GGUF f16 (aproximadamente 3,4 GB, opcional bajo peticion) |
| Idiomas soportados | Nepalí (ne), con foco en Devanagari y en la variante romanizada; no cubre otras lenguas de Nepal |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama, LM Studio); el repositorio incluye tambien un Modelfile de Ollama. Pesos en safetensors: no confirmado en la model card |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-1.7B, un transformer decoder-only con atención completa y soporte nativo de tool calling, elegido por su licencia permisiva (Apache-2.0), su cobertura de Devanagari, su capacidad de llamada a herramientas y su tamano manejable. El ajuste se realizo con QLoRA sobre una base cuantizada en 4 bits NF4, con rango 32 aplicado a todas las proyecciones de atención y MLP, una sola época, longitud de secuencia 1024 y una única GPU de consumo de 8 GB. La pérdida se enmascara solo en los turnos del asistente, y el formato de conversación es ChatML, con llamadas a herramientas serializadas como `<tool_call>{"name": ..., "arguments": ...}</tool_call>`.

Los datos proceden de dos fuentes. Por un lado, conjuntos públicos de instrucciones en nepalí del Hub: `saillab/alpaca-nepali-cleaned`, `Someman/alpaca-nepali`, `NepaliAI/Nepali-Health-QA`, `Chhabi/Nepali-Agriculture-QA`, `ashokpoudel/English-Nepali-Translation-Instruction-Dataset` y `iamTangsang/Nepali-to-English-Translation-Dataset`, cada uno con su propia licencia detallada en el fichero DATA.md del repositorio de entrenamiento. Por otro, datos generados localmente y correctos por construcción a partir de implementaciones propias: conversiones de Bikram Sambat, numerales y palabras numéricas nepalíes, problemas aritméticos verbales, conversaciones con tool calls y memoria, pares romanizado a Devanagari y ejemplos de admisión de ignorancia. El texto en hindi se filtró de todas las fuentes mediante un discriminador léxico nepalí/hindi, precisamente para evitar que el modelo responda con construcciones hindi. No se usaron datos raspados de redes sociales ni de plataformas cuyos términos lo prohíben.

No se aplicaron etapas de RLHF ni DPO: el pipeline documentado es exclusivamente ajuste supervisado por instrucciones sobre el modelo base, sin preentrenamiento continuado en un corpus nepalí a gran escala (etapa que el autor identifica como el siguiente paso).

## Capacidades

- Generación de texto conversacional en nepalí, tanto en escritura Devanagari como en entrada romanizada.
- Conocimiento específico de Nepal: el modelo está ajustado para datos factuales del país, aunque su rendimiento medido en esta categoría es de 3/6 en la evaluación del autor.
- Manejo del calendario Bikram Sambat y de numerales nepalíes con unidades lakh y crore, apoyado en herramientas del runtime Sathi.
- Aritmética y problemas verbales de palabras, con datos generados sintéticamente durante el entrenamiento.
- Traducción inglés-nepalí y nepalí-inglés, heredada de los conjuntos de traducción usados.
- Soporte de tool calling / function calling mediante el formato `<tool_call>{"name": ..., "arguments": ...}</tool_call>`.
- Soporte de conversaciones con memoria y flujos de agente multi-paso, a través del runtime Sathi CLI, que aporta las herramientas y la memoria.
- Comportamiento de honestidad entrenado explícitamente: se incluyeron ejemplos de admisión de ignorancia, aunque la puntuación medida en este eje es 0/1.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Asistente conversacional en nepalí para atención al cliente: el modelo mantiene diálogos multi-turno en Devanagari o en entrada romanizada, con una ventana práctica de 4096 tokens en los ejemplos del repositorio y una huella de 1,1 GB que permite desplegarlo en servidores modestos.
- Consulta de fechas y conversiones de calendario: integrado en el runtime Sathi, resuelve preguntas del tipo "¿cuál es la fecha de hoy en Bikram Sambat?" mediante herramientas, evitando que el modelo invente la fecha por sí solo.
- Normalización y transcripción de texto romanizado: convierte entradas escritas en caracteres latinos (por ejemplo, "k cha halkhabar?") a nepalí formal, útil en interfaces de chat donde los usuarios no escriben Devanagari.
- Traducción inglés-nepalí en pipelines de documentación: puede emplearse para traducir documentación técnica o contenidos de producto hacia nepalí, con revisión humana dado el tamaño del modelo.
- Procesamiento de preguntas frecuentes en salud y agricultura: los conjuntos Nepali-Health-QA y Nepali-Agriculture-QA usados en el entrenamiento lo orientan a dominios de consulta comunitaria, siempre con verificación profesional obligatoria.
- Agentes locales con tool calling en hardware limitado: al ejecutarse vía llama.cpp u Ollama en CPU o GPU de gama baja, encaja en asistentes de escritorio o dispositivos con pocos recursos que necesitan invocar herramientas externas.
- Base para investigación en adaptación de modelos pequeños a lenguas de bajos recursos: sirve como punto de partida reproducible para experimentar con preentrenamiento continuado en nepalí, la etapa que el autor señala como pendiente.

## Benchmarks y rendimiento

El autor publica una evaluación de 16 casos, ejecutada a temperatura 0 a través del runtime Sathi (con herramientas y memoria activadas) y con verificación estricta: los números deben coincidir como tokens completos y repetir la pregunta no cuenta como respuesta.

| Capacidad | qwen3:1.7b (base) | llama3.2:3b | Sathi |
|---|---|---|---|
| Idioma (nepalí, no hindi) | 0/3 | 1/3 | 1/3 |
| Calendario Bikram Sambat | 1/2 | 1/2 | 1/2 |
| Numerales (lakh/crore) | 0/2 | 0/2 | 0/2 |
| Conocimiento de Nepal | 2/6 | 4/6 | 3/6 |
| Razonamiento | 1/2 | 1/2 | 1/2 |
| Honestidad | 0/1 | 0/1 | 0/1 |
| Total | 4/16 | 7/16 | 6/16 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Inferencia en q4_k_m: aproximadamente 1,1 GB de pesos, más el espacio de contexto; cabe sin problema en CPU con 4-8 GB de RAM libre.
- Inferencia en f16: aproximadamente 3,4 GB de pesos, adecuado para GPU con 6 GB o más de VRAM.
- GPU de consumo: cabe en cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 2070 y superiores); el propio ajuste QLoRA se realizó en una GPU de consumo de 8 GB.
- GPU de centro de datos (A100, H100): soportadas pero sobredimensionadas para un modelo de 1,7B; el cuello de botella sería la latencia de red, no el cálculo.
- Opciones de despliegue: llama.cpp (llama-cli, llama_cpp Python), Ollama mediante el Modelfile incluido, LM Studio, y el runtime Sathi CLI con backend local. Compatible con endpoints (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen fuertemente del hardware y de la cuantización, aunque por tamano el modelo es apto para inferencia interactiva en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la evaluacion del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sathi 1.7B | 1,72B | 32.768 tokens en la base; 4096 en los ejemplos del repo | 6/16 | Apache-2.0 | GGUF en HuggingFace, Ollama |
| Qwen3-1.7B (base) | 1,7B | 32.768 tokens | 4/16 | Apache-2.0 | Pesos completos en HuggingFace |
| Llama-3.2-3B | 3B | no disponible en la informacion | 7/16 | Licencia Llama (no Apache-2.0) | Pesos en HuggingFace y Ollama |

Con los datos disponibles, Sathi no supera a Llama-3.2-3B, un modelo con el doble de parametros y sin entrenamiento especifico en nepalí. La ventaja diferencial de Sathi esta en su tamano (1,1 GB cuantizado frente a los aproximadamente 2 GB de un 3B en q4), su licencia Apache-2.0 y su alineacion con el dominio nepalí, no en su puntuacion agregada. No se dispone de comparativas con otros modelos especializados en nepalí o en lenguas indoarias del sur de Asia.

## Limitaciones y advertencias

- Con 1,7B de parametros, el modelo se equivocara con seguridad en detalles especificos; sus respuestas sobre salud, cuestiones legales o finanzas deben verificarse siempre con fuentes profesionales.
- La evaluacion de 16 casos es deliberadamente pequena: esta disenada para detectar fallos criticos para un hablante de nepalí, no para acreditar cobertura amplia. No debe extrapolarse a un rendimiento general.
- El modelo todavia no supera a Llama-3.2-3B en la evaluacion agregada del propio autor (6/16 frente a 7/16). Es un primer checkpoint, no un modelo listo para produccion critica.
- Solo se ha ejecutado ajuste por instrucciones; no ha habido preentrenamiento continuado sobre un corpus nepalí grande, que es donde estarian las mejoras sustanciales.
- El nepalí es el foco, no las demas lenguas de Nepal (maithili, bhojpuri, tharu, tamang, newar, magar y otras), que requeririan sus propios datos.
- Fechas, aritmetica y datos factuales de referencia solo son fiables a traves de las herramientas del runtime Sathi; el modelo en crudo puede fallar en esos puntos. En numerales lakh/crore la puntuacion es 0/2 incluso con el runtime.
- Entrenado sobre datos publicos de internet, por lo que arrastra los sesgos de esas fuentes.
- Riesgo de alucinacion presente, especialmente en conocimiento factual de Nepal (3/6) y en honestidad (0/1).
- Licencia Apache-2.0 para el modelo, pero las fuentes de datos de entrenamiento conservan sus propias licencias: hay que revisar DATA.md del repositorio de entrenamiento antes de redistribuir cualquier derivado.
- Uso comercial permitido por la licencia del modelo e del base, sujeto a las condiciones de las licencias de los conjuntos de datos empleados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/diggajupadhyay/sathi-1.7b-ne
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Conjuntos de datos de instrucciones: https://huggingface.co/datasets/saillab/alpaca-nepali-cleaned
- Conjuntos de datos de instrucciones: https://huggingface.co/datasets/Someman/alpaca-nepali
- Conjuntos de datos de dominio sanitario: https://huggingface.co/datasets/NepaliAI/Nepali-Health-QA
- Conjuntos de datos de dominio agricola: https://huggingface.co/datasets/Chhabi/Nepali-Agriculture-QA
- Conjuntos de traduccion: https://huggingface.co/datasets/ashokpoudel/English-Nepali-Translation-Instruction-Dataset
- Conjuntos de traduccion: https://huggingface.co/datasets/iamTangsang/Nepali-to-English-Translation-Dataset
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente articulos sobre protocolos DeFi sin relacion con esta ficha.
