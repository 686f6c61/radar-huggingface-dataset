# AliOzcan/SinefilDayi

## Resumen

SinefilDayi es un adaptador LoRA (PEFT) entrenado sobre el modelo base `microsoft/Phi-3.5-mini-instruct` para dar lugar a un chatbot conversacional en turco con una personalidad muy concreta: un crítico de cine con amplia cultura cinematográfica, ligeramente pedante e intelectual. El modelo no es un modelo de lenguaje completo, sino un adaptador de bajo rango que debe cargarse junto con los pesos del modelo base para funcionar.

El proyecto nace como trabajo de la asignatura *Karar Destek Sistemleri* (Sistemas de Apoyo a la Decisión) del grado de Ingeniería de Software de la Universidad Manisa Celal Bayar, durante el semestre de otoño de 2025-2026. Su propósito es demostrar el ajuste fino eficiente de un modelo instructivo pequeño mediante LoRA para adoptar un estilo y una persona determinados, no resolver una tarea técnica compleja.

Su relevancia es, por tanto, limitada y fundamentalmente didáctica: sirve como ejemplo reproducible de cómo adaptar Phi-3.5-mini con Unsloth y PEFT en un entorno de Google Colab con un conjunto de datos muy reducido (209 ejemplos). No está pensado para producción ni como fuente fiable de información cinematográfica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base: microsoft/Phi-3.5-mini-instruct) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Phi-3.5-mini-instruct tiene 3.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso fija max_seq_length=2048) |
| Tipos de cuantizacion | carga en 4 bits mediante load_in_4bit (Unsloth); otras cuantizaciones no disponibles |
| Idiomas soportados | turco (tr) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango r=16, alpha=32 y dropout=0.05, aplicado exclusivamente a las proyecciones de atención (q_proj, k_proj, v_proj, o_proj) del modelo base Phi-3.5-mini-instruct. El entrenamiento se realizó con Unsloth en una GPU de Google Colab. Al ser un adaptador, no modifica los pesos originales del modelo base: estos se congelan y solo se entrenan las matrices de bajo rango insertadas en las capas de atención.

El conjunto de entrenamiento consta de 209 ejemplos en formato system/user/assistant: 165 evaluaciones de películas recientes obtenidas de TMDB, respondiendo a preguntas del tipo "¿se puede ver X?", y 44 conversaciones cotidianas (saludos, temas generales) en las que el asistente responde con recomendaciones cinematográficas. Todos los ejemplos comparten un mismo mensaje de sistema que define la persona. No se documenta el uso de RLHF, DPO ni otras fases de alineación posteriores al ajuste supervisado.

## Capacidades

- Generación de texto conversacional en turco con un estilo concreto (crítico de cine pedante e intelectual).
- Respuesta a preguntas sobre si una película concreta "se puede ver" o no, imitando el registro de la persona entrenada.
- Conversación multi-turno, tal como se empleó en la interfaz Gradio del proyecto, que conserva el historial de chat.
- Recomendación de películas dentro de conversaciones cotidianas.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- Capacidad multilingüe: no disponible; el adaptador está entrenado únicamente en turco.

## Casos de uso

- Demostración didáctica de ajuste fino con LoRA: el adaptador sirve para ilustrar en clase o en un tutorial cómo se entrena y despliega un adaptador PEFT sobre un modelo instructivo pequeño con Unsloth y un dataset mínimo.
- Chatbot de nicho cinematográfico en turco: puede integrarse en una aplicación de ocio para responder con un tono característico a preguntas sobre películas, siempre con revisión humana del contenido.
- Prototipado de personas conversacionales: útil para experimentar con mensajes de sistema y estilos de respuesta antes de invertir en un dataset mayor.
- Generación de contenido de entretenimiento: producción de opiniones ficticias con un tono marcado para blogs o secciones de humor, con etiquetado claro de que es contenido generado.
- Base para ampliación del dataset: punto de partida para quien quiera escalar el conjunto de 209 ejemplos a miles de muestras y reentrenar el adaptador.
- Pruebas de integración de PEFT con Gradio: el proyecto ya incluye una interfaz Gradio multi-turno que puede reutilizarse como esqueleto para demos de otros adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; al cargar el modelo base Phi-3.5-mini-instruct en 4 bits junto con el adaptador, el consumo se sitúa en el rango de pocos GB, aunque no se aporta una cifra concreta en la informacion proporcionada.
- GPU recomendadas: no disponible. El entrenamiento se realizó en una GPU de Google Colab; el ejemplo de uso asume CUDA.
- GPU de consumo: no disponible de forma explícita; el uso de cuantización en 4 bits sugiere que podría ejecutarse en GPUs de consumo con VRAM suficiente, pero no se confirma.
- Opciones de despliegue: Unsloth (`FastLanguageModel.from_pretrained` con `load_in_4bit=True`), PEFT; otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SinefilDayi (este) | Adaptador LoRA sobre Phi-3.5-mini (3.8B) | no disponible | no disponible | Hugging Face (2 descargas, 0 likes) | Proyecto académico, dataset de 209 ejemplos, solo turco |
| microsoft/Phi-3.5-mini-instruct | 3.8B | no disponible en esta ficha | MIT (modelo base) | Hugging Face, ampliamente usado | Modelo instructivo generalista; el adaptador hereda sus capacidades base |
| Adaptadores LoRA de persona para Phi-3.5-mini | variables | depende del base | variable | Hugging Face | Categoría genérica; no se dispone de una comparación numérica concreta |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un proyecto de asignatura, no un modelo diseñado para producción.
- El dataset es muy reducido (209 ejemplos): el modelo aprende sobre todo el estilo y la persona, no conocimiento cinematográfico fiable.
- Algunas respuestas del dataset de entrenamiento son inconsistentes en lengua o contenido, lo que puede provocar información errónea o expresiones extrañas.
- Riesgo alto de alucinación en datos concretos sobre películas (años, repartos, críticas).
- El tono es deliberadamente sarcástico y pedante; puede resultar inadecuado en contextos profesionales.
- Solo soporta turco; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Licencia no disponible: conviene verificar los términos antes de cualquier uso comercial, así como la licencia del modelo base.
- Requiere cargar el modelo base Phi-3.5-mini-instruct junto con el adaptador; no es un modelo autónomo.
- No se documentan evaluaciones cuantitativas ni pruebas de robustez.

## Enlaces

- Hugging Face: https://huggingface.co/AliOzcan/SinefilDayi
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- GitHub del autor: https://github.com/aliozcany
- LinkedIn del autor: https://www.linkedin.com/in/ali-ozcan-yilmaz
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- TMDB (fuente de datos de películas): https://www.themoviedb.org/
