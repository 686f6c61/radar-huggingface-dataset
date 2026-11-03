# Dhanush444/Telugu-lora-adapter

## Resumen

Baasha (బాషా) es un adaptador LoRA de tipo QLoRA entrenado por Dhanush444 sobre `unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit`, la variante cuantizada a 4 bits del modelo instructivo de Meta publicado en formato Unsloth. Su objetivo concreto es forzar al modelo base a responder exclusivamente en telugu coloquial hablado (వాడుక భాష), evitando el telugu literario, la transliteración al alfabeto latino ("Tenglish") y el cambio al inglés cuando el usuario escribe en telugu. El adaptador se presenta como la pieza conversacional de un asistente de voz en telugu, situado entre un modelo de reconocimiento de voz (Whisper ajustado) y un futuro módulo de síntesis de voz.

El entrenamiento se realizó con Unsloth sobre un conjunto de datos propio de 2.245 ejemplos conversacionales en telugu, que cubren saludos, identidad, soporte técnico, críquet, cine, comida, festivales, consejos de estudio y diálogo multiturno. Se trata de un adaptador de bajo rango, no de un modelo completo: el repositorio ocupa 0,2 GB y requiere cargar el modelo base Llama 3.1 8B Instruct para funcionar.

Su relevancia actual es acotada pero clara: los modelos generalistas rara vez mantienen el registro coloquial en idiomas de la India con pocos recursos, y este adaptador documenta de forma transparente tanto el proceso como sus fallos (preguntas compuestas, memoria multiturno, temas con pocos ejemplos). Es un caso práctico de ajuste idiomático estrecho, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) con adaptador LoRA sobre Llama 3.1 8B Instruct |
| Parametros totales | 8B en el modelo base; el adaptador LoRA no declara su numero de parametros (no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.1, 128k tokens, aunque no verificada en esta ficha) |
| Tipos de cuantizacion | Modelo base en bnb-4bit (QLoRA); el adaptador se distribuye en safetensors; no se documentan otras cuantizaciones |
| Idiomas soportados | Telugu (te), registro coloquial con prestamos del ingles inline |
| Licencia | llama3.1 (Meta Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de 8.000 millones de parametros (Llama 3.1 8B Instruct) mediante QLoRA, es decir, el modelo base se mantiene cuantizado a 4 bits y solo se entrenan las matrices de bajo rango insertadas en las capas. El entrenamiento se ejecuto con Unsloth, que optimiza el paso hacia atras y reduce el consumo de memoria, y con las librerias TRL y Transformers del ecosistema HuggingFace. No se especifican en la informacion disponible el rango del adaptador, el alpha, las capas objetivo ni la tasa de aprendizaje.

El dataset es propio y consta de 2.245 ejemplos conversacionales, con una distribucion desigual: los temas con mas cobertura son saludos diarios (197), identidad (198) y matematicas simples (198), mientras que cine (98), chistes (102) y problemas tecnicos (106) tienen menos ejemplos. Solo unos 30 ejemplos son de dialogo multiturno, lo que explica buena parte de las limitaciones documentadas. No se menciona uso de RLHF ni DPO; el ajuste es SFT supervisado. La curva de perdida muestra pequenas caidas en los limites de epoca (alrededor de los pasos 281 y 562), lo que sugiere cierta memorizacion, segun el propio autor.

## Capacidades

- Generacion de respuestas conversacionales cortas (2-3 frases) en telugu coloquial escrito en escritura telugu.
- Mezcla natural de prestamos del ingles dentro de las frases en telugu (laptop, problem, help, battery, restart), imitando el habla urbana actual.
- Respuesta a preguntas de identidad: el modelo se presenta como "Baasha" si se le pregunta su nombre.
- Conversacion sobre temas cotidianos: saludos, comida, festivales, critquet, cine, consejos de estudio y apoyo emocional basico.
- Dialogo multiturno de alcance limitado (entrenado con muy pocos ejemplos).
- Aritmetica simple, cubierta con 198 ejemplos en el dataset.
- Integracion en pipelines de asistente de voz como etapa intermedia entre STT y TTS.
- No soporta tool calling ni function calling de forma documentada.
- No soporta vision, audio ni modo de razonamiento explicito (thinking mode).
- No esta pensado para otros idiomas: fuerza el registro coloquial en telugu incluso si se le habla en ingles.

## Casos de uso

- Asistente de voz en telugu de extremo a extremo: el adaptador actua como cerebro textual entre el modelo Whisper ajustado (`Dhanush444/whisper-telugu-medium-indicvoices`) y un futuro modulo TTS, generando respuestas breves y naturales que suenan bien al sintetizarse.
- Prototipo de atencion telefonica en telugu: el autor declara como objetivo extender el pipeline a llamadas reales de clientes; el registro coloquial y las respuestas de 2-3 frases encajan con turnos de voz cortos.
- Chatbot de soporte tecnico basico en telugu: con 106 ejemplos de problemas tecnicos, puede resolver consultas sencillas sobre dispositivos y reinicios, aunque con respuestas mas vagas que en otros temas.
- Asistente educativo informal: los 198 ejemplos de consejos de estudio y matematicas simples permiten respuestas de ayuda basica a estudiantes que escriben en telugu coloquial.
- Companero conversacional de apoyo emocional: el dataset incluye ejemplos de apoyo emocional, adecuado para respuestas empaticas breves en un bot de bienestar no clinico.
- Demostracion de ajuste idiomatico: sirve como referencia tecnica para investigadores que quieran replicar un LoRA de registro coloquial en un idioma de bajos recursos con Unsloth y un dataset pequeno y curado.
- Generacion de dialogos para doblaje o subtitulado informal: util para producir lineas de guion en telugu hablado con mezcla de ingles, siempre que no se requiera precision factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (MMLU, HumanEval, GSM8K ni evaluaciones humanas con puntuacion); solo describe pruebas A/B cualitativas sobre los parametros de generacion y las limitaciones observadas durante la inferencia.

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB; el coste real esta en el modelo base Llama 3.1 8B.
- VRAM estimada para inferencia con el base en 4 bits (como se entreno): en torno a 5-6 GB, mas overhead de contexto y del runtime.
- VRAM estimada con el base en FP16: aproximadamente 16 GB de pesos, mas cache KV; en la practica 18-24 GB segun longitud de contexto.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue con vLLM y concurrencia; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) y GPUs de 8 GB para el base cuantizado a 4 bits.
- Cabe en GPU de consumo: si, con el base en 4 bits en tarjetas de 8 GB o mas; en FP16 requiere 24 GB o repartir entre varias GPU.
- Opciones de despliegue: Transformers con PEFT, vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp/Ollama tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Ajustes de generacion obligatorios segun el autor: `repetition_penalty = 1.0` (valores superiores rompen la gramatica aglutinante del telugu) y `eos_token_id` debe incluir explicitamente `<|eot_id|>` para evitar truncamientos a mitad de palabra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Baasha (este adaptador) | 8B (base) + LoRA | no disponible | Telugu coloquial para asistente de voz | llama3.1 | HuggingFace, 29 descargas |
| Meta Llama 3.1 8B Instruct | 8B | 128k (segun Meta) | Instruct generalista multilingue | llama3.1 | Amplia, muy extendida |
| Adaptadores LoRA para idiomas de la India (familia generica) | variable | no disponible | Ajuste idiomatico | variable | HuggingFace, sin datos concretos en esta busqueda |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Baasha frente a alternativas; la comparacion se limita a parametros, contexto declarado y licencia.

## Limitaciones y advertencias

- Preguntas compuestas: si una intervencion contiene dos preguntas, el modelo tiende a responder solo una; mitigado parcialmente por el system prompt, no resuelto.
- Memoria multiturno poco fiable: puede confundir hechos mencionados antes (por ejemplo, cambiar un alimento por otro) tras mas de 1-2 turnos, por los escasos ejemplos multiturno del dataset (~30 de 2.245).
- Preguntas meta-conversacionales ("que me acabas de preguntar") producen respuestas evasivas y genericas.
- Temas con poca cobertura (cine, chistes, soporte tecnico) generan respuestas notablemente mas vagas.
- Posible memorizacion leve por las caidas de perdida en los limites de epoca; no confirmada como problema practico.
- No evaluado para contenido toxico, sesgos ni filtrado de contenido peligroso; no hay alineamiento de seguridad mas alla del modelo base.
- No apto para consejo legal, medico, financiero ni usos criticos.
- No apto para generacion de documentos largos: solo respuestas de 2-3 frases.
- Fuerza el registro coloquial en telugu incluso ante entradas en ingles, lo que lo inutiliza para conversacion en otros idiomas.
- Licencia llama3.1: el uso comercial hereda las restricciones de la Meta Llama 3.1 Community License (incluida la clausula de 700 millones de usuarios mensuales y las politicas de uso aceptable de Meta).
- El autor recomienda reentrenar con mas ejemplos multiturno y de preguntas compuestas antes de usar en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dhanush444/Telugu-lora-adapter
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit
- Modelo STT relacionado: https://huggingface.co/Dhanush444/whisper-telugu-medium-indicvoices
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Licencia Meta Llama 3.1: https://llama.meta.com/llama3_1/license/
