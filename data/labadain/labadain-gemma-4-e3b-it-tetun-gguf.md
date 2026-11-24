# labadain/Labadain-Gemma-4-E3B-it-Tetun-GGUF

## Resumen

Labadain-Gemma-4-E3B-it-Tetun-GGUF es la versión cuantizada en formato GGUF del modelo conversacional Labadain-Gemma-4-E2B-it-Tetun, un ajuste fino de Gemma 4 E2B-it de Google (publicado por Unsloth) especializado en tetun, una de las lenguas oficiales de Timor-Leste. El modelo resuelve el problema de la escasez de asistentes conversacionales de calidad en una lengua de bajos recursos: se ha entrenado con 32.197 conversaciones en tetun (unos 26 millones de tokens) que cubren noticias, salud, educación y lenguaje, además de temas cotidianos.

El autor, labadain, publica esta variante en cuantización Q4_K_M de 4 bits para que pueda ejecutarse localmente con Ollama, llama.cpp o LM Studio, incluso en portátiles sin GPU. El repositorio ocupa 3,4 GB y el modelo cuenta con 4.647.450.147 parámetros (etiquetado como E3B en el nombre del archivo, aunque la model card lo describe como E2B de 4,6B parámetros). El ajuste fino se realizó con QLoRA sobre el checkpoint base de Unsloth.

Es relevante ahora porque demuestra que es viable adaptar un modelo multimodal grande (Gemma 4) a una lengua de bajos recursos con un presupuesto de entrenamiento modesto, y porque ofrece un artefacto listo para desplegar en producción local sin infraestructura de GPU dedicada. Esta variante GGUF contiene solo el modelo de texto: los codificadores de imagen y audio de Gemma 4 no están incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, familia E2B/E3B); solo el submodelo de texto |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens en ajuste fino (la arquitectura soporta 128K) |
| Tipos de cuantizacion | Q4_K_M (4 bits); unico archivo publicado |
| Idiomas soportados | tetun (tet), tetun-dili (tdt) |
| Licencia | Apache 2.0, sujeta a la licencia Gemma 4 de Google |
| Formato de pesos | GGUF (Q4_K_M); el modelo original esta en bfloat16 para Transformers/Unsloth |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E2B-it, un transformer de la familia Gemma 4 de Google distribuido por Unsloth. El ajuste fino se realizo con QLoRA sobre 32.197 conversaciones en tetun (aproximadamente 26 millones de tokens), compiladas por Labadain a partir de recursos conversacionales y de pregunta-respuesta en tetun, incluyendo material traducido automaticamente. El reparto por dominio es: 20.132 conversaciones generales, 9.649 de salud, 1.951 de noticias y 465 de educacion y lenguaje.

El conjunto contiene 55.105 intercambios pregunta-respuesta; 11.774 conversaciones (36,6%) son multiturno, con hasta 33 intercambios, y 20.423 (63,4%) son de un solo turno. El 90% (28.977) se uso para entrenamiento y el 10% restante se dividio a partes iguales en validacion (1.610) y test reservado (1.610). Las conversaciones de entrenamiento no contienen trazas de razonamiento, por lo que el modo thinking debe mantenerse desactivado. La plantilla de chat incluida en el GGUF ya trae thinking desactivado por defecto. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en tetun, con respuestas multiturno (hasta 33 intercambios en los datos de entrenamiento).
- Respuesta a preguntas sobre noticias, salud, educacion, lenguaje y temas cotidianos.
- Conversacion general y asistencia basica sin necesidad de system prompt (el modelo se ajusto sin uno).
- Capacidad de seguir una instruccion corta de sistema, como "Responde iha Tetun", para mantener el idioma de respuesta.
- Modo thinking presente en la plantilla pero desaconsejado: el modelo no fue entrenado con trazas de razonamiento.
- No incluye vision ni audio: esta variante GGUF contiene solo el submodelo de texto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional en tetun para atencion al ciudadano: el modelo gestiona dialogos multiturno de hasta 4.096 tokens, suficiente para resolver consultas administrativas basicas en una ventanilla o chat web.
- Educacion y alfabetizacion digital en Timor-Leste: sirve como tutor de practica de lengua y respuesta a preguntas escolares, gracias a su entrenamiento en 465 conversaciones de educacion y lenguaje y 9.649 de salud.
- Prototipado de aplicaciones de IA en tetun: al ejecutarse con llama.cpp u Ollama en portatiles sin GPU, permite a desarrolladores locales iterar sobre productos linguisticos sin infraestructura en la nube.
- Investigacion en PLN de bajos recursos: el modelo y su conjunto de datos (32.197 conversaciones, 26 millones de tokens) sirven como linea base reproducible para estudiar tecnicas de ajuste fino en lenguas de bajos recursos.
- Despliegue en entornos con recursos limitados: con 3,43 GB de pesos Q4_K_M y 4-5 GB de memoria libre, cabe en portatiles de consumo y en servidores modestos para servir una API compatible con OpenAI mediante llama-server.
- Generacion de contenido divulgativo en tetun: redaccion de borradores de articulos o resumenes sobre salud y noticias a partir de material existente, con revision humana obligatoria por el riesgo de errores factuales.
- Chatbot de bajo coste para ONG y administraciones locales: al ser Apache 2.0 y ejecutable en CPU, reduce la dependencia de proveedores externos y de presupuestos de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria estimada: 4-5 GB libres de RAM o VRAM para ejecutar el archivo Q4_K_M de 3,43 GB.
- GPU: no se especifican modelos concretos recomendados; el modelo esta disenado para funcionar tambien en portatiles solo con CPU.
- GPU de consumo: cabe en tarjetas con al menos 4-5 GB de VRAM, aunque la informacion no detalla modelos concretos.
- Opciones de despliegue: Ollama (`labadainofficial/labadain-gemma4:e3b-q4km`), llama.cpp (`llama-cli` y `llama-server` con API compatible con OpenAI en `http://localhost:8080`) y LM Studio.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Ajustes de muestreo recomendados: temperature 1.0 (0 para respuestas repetibles), top-p 0.95, top-k 64, contexto 4.096 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Labadain-Gemma-4-E3B-it-Tetun-GGUF (este) | 4,65B | 4.096 (arquitectura 128K) | tetun | Apache 2.0 | GGUF Q4_K_M | Ajuste fino en tetun sobre Gemma 4 E2B-it |
| labadain/Labadain-Gemma-4-E2B-it-Tetun | 4,6B | 4.096 (arquitectura 128K) | tetun | Apache 2.0 | bfloat16 (Transformers/Unsloth) | Modelo original sin cuantizar; mayor calidad segun el autor |
| unsloth/gemma-4-E2B-it | no disponible | no disponible | multilingue (no detallado) | Gemma 4 license | safetensors | Modelo base de Google sin ajuste en tetun |
| Otros modelos conversacionales en lenguas de bajos recursos | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de alternativas comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Errores factuales: es un modelo pequeno y puede afirmar con confianza datos, fechas, nombres y cifras incorrectos, incluso sobre Timor-Leste; verificar la informacion importante con fuentes fiables.
- Cuantizacion: el GGUF de 4 bits puede ser ligeramente menos preciso que el modelo original en bfloat16; el autor recomienda el modelo original para maxima calidad.
- Conocimiento fijo: solo sabe lo que habia en el modelo base y en los datos de entrenamiento; no tiene acceso a eventos actuales.
- Entradas largas: el ajuste fino cubrio conversaciones de hasta 4.096 tokens, aunque la arquitectura soporta 128K; no se garantiza buen comportamiento mas alla de ese limite.
- Modo thinking: no debe activarse, porque las conversaciones de entrenamiento no contienen trazas de razonamiento; en Ollama usar `--think=false`.
- Solo texto: esta variante GGUF no incluye los codificadores de imagen y audio de Gemma 4.
- Licencia: Apache 2.0 sujeta ademas a la licencia Gemma 4 de Google; revisar los terminos de uso comercial de dicha licencia antes de desplegar en produccion.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada; el entrenamiento incluye material traducido automaticamente, lo que puede introducir artefactos linguisticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/labadain/Labadain-Gemma-4-E3B-it-Tetun-GGUF
- Modelo original (bfloat16): https://huggingface.co/labadain/Labadain-Gemma-4-E2B-it-Tetun
- Modelo base de Unsloth: https://huggingface.co/unsloth/gemma-4-E2B-it
- Pagina de Ollama: https://ollama.com/labadainofficial/labadain-gemma4
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
