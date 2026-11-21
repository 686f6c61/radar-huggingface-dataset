# CinderVex/cindervex-free-ai

## Resumen

Ruvo (CinderVex Free AI, ronda 8) es un modelo de lenguaje afinado mediante LoRA a partir de IBM Granite 4.0 Micro, desarrollado por CinderVex. Su función es convertir ideas de trading expresadas en lenguaje natural en reglas que la aplicación CinderVex pueda probar en modo *paper trading*, además de responder preguntas sencillas sobre el propio funcionamiento de la aplicación. Con 3.402.836.480 parámetros totales y distribución en formato GGUF cuantizado Q4_K_M, está diseñado para ejecutarse localmente en el ordenador del usuario mediante un motor integrado basado en llama.cpp (build b12559), sin enviar datos a servicios en línea.

El modelo no es un asistente generalista ni un sistema de recomendación financiera: su alcance está deliberadamente acotado al dominio de CinderVex y a la experimentación con ideas de inversión sobre papel. La model card insiste en que se trata de una versión temprana que cometerá errores, y que la aplicación mitiga ese riesgo respondiendo las preguntas sobre la app desde una hoja de hechos verificada, validando cada respuesta antes de mostrarla y ofreciendo alternativas sin IA (Read My Words, Quick Tour, Click to Learn).

Su relevancia actual radica en dos factores: por un lado, demuestra el patrón de especialización de modelos pequeños (3,4 B parámetros) sobre una base abierta como Granite 4.0 Micro para tareas verticales muy concretas; por otro, su empaquetado GGUF Q4_K_M de aproximadamente 2,1 GB lo hace desplegable en hardware de consumo sin infraestructura adicional. La licencia Apache 2.0 facilita la reutilización y auditoría del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de IBM Granite 4.0 Micro; detalles especificos de la arquitectura base no disponibles en la informacion proporcionada) |
| Parametros totales | 3.402.836.480 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se documentan otras variantes |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `cindervex-r8.Q4_K_M.gguf`); el repositorio declara pesos safetensors en los metadatos de parametros |

## Arquitectura y entrenamiento

El modelo parte de IBM Granite 4.0 Micro y se ha afinado mediante LoRA en ocho rondas sucesivas con ejemplos escritos específicamente para CinderVex. La ronda 8 se evaluó frente a la ronda 7 sobre cuatro conjuntos de prueba no utilizados durante el entrenamiento, incluido un conjunto nuevo de 200 preguntas y una prueba de estrés de 500 mensajes con erratas, jerga y preguntas mixtas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal no reside en la arquitectura, sino en el pipeline de especialización y despliegue: un ajuste fino de dominio sobre una base pequeña, cuantización a Q4_K_M para reducir el peso a unos 2,1 GB y ejecución local con llama.cpp build b12559 dentro de la propia aplicación. El SHA-256 del archivo GGUF está publicado en la model card (`e6e562d1d60459cb4670b1e4ad68dd4455accf841cf8d67667adf213849b42e3`), lo que permite verificar la integridad de la descarga.

## Capacidades

- Conversión de ideas de trading en lenguaje natural a reglas estructuradas que CinderVex puede probar en modo paper trading.
- Respuesta a preguntas sencillas sobre el funcionamiento de la aplicación CinderVex.
- Generación de texto conversacional en inglés, orientada a un dominio acotado.
- Ejecución local sin conexión: el modelo se descarga una vez y se ejecuta en el equipo del usuario.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio, modo *thinking* ni matemáticas avanzadas.
- Multilingüismo limitado al inglés.

## Casos de uso

- Traducción de ideas de inversión a reglas testeables: el usuario escribe una estrategia en lenguaje natural y el modelo la transforma en reglas que el motor de CinderVex puede evaluar sobre datos históricos en modo paper trading.
- Asistente contextual dentro de la aplicación: responde dudas sobre cómo funciona CinderVex apoyándose en la hoja de hechos verificada que la app inyecta en el contexto.
- Experimentación educativa con estrategias: permite a estudiantes y aficionados probar hipótesis de trading sin riesgo real, ya que CinderVex nunca compra ni vende activos de verdad.
- Despliegue en equipos de consumo: al ocupar unos 2,1 GB en Q4_K_M, puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada de gama alta, usando el motor llama.cpp integrado.
- Procesamiento con privacidad por diseño: al ejecutarse en local sin envío de datos a servicios en línea, es adecuado para usuarios que no quieren compartir sus ideas de inversión con terceros.
- Punto de partida para ajustes de dominio: su licencia Apache 2.0 y su base Granite 4.0 Micro lo convierten en referencia para equipos que quieran replicar el patrón de especialización LoRA sobre modelos pequeños en otros dominios verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona una comparación interna de la ronda 8 frente a la ronda 7 sobre cuatro conjuntos de prueba no vistos y una prueba de estrés de 500 mensajes, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el archivo GGUF Q4_K_M ocupa 2.099.502.528 bytes (aproximadamente 2,1 GB), por lo que la huella de memoria en carga completa será algo superior a esa cifra.
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño, el modelo es compatible con GPUs de consumo con al menos 4 GB de VRAM efectiva, aunque no se confirma oficialmente.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del archivo cuantizado, aunque no hay validación oficial publicada.
- Opciones de despliegue: llama.cpp build b12559 (motor integrado en CinderVex). No se documenta compatibilidad con vLLM, TGI, Ollama u otros servidores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CinderVex Free AI (Ruvo, r8) | 3,40 B | No disponible | Apache 2.0 | GGUF Q4_K_M | Especializado en reglas de paper trading para CinderVex; solo inglés |
| IBM Granite 4.0 Micro (base) | 3,40 B (misma base) | No disponible en la informacion proporcionada | Apache 2.0 | Safetensors y otras variantes segun el repositorio original | Modelo generalista del que deriva Ruvo |
| Alternativas generalistas de ~3-4 B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cuantitativa |

## Limitaciones y advertencias

- El propio autor advierte de que el modelo es temprano y cometerá errores en algunas respuestas.
- No es asesoramiento financiero: no elige inversiones, no predice precios ni promete resultados.
- No es un chatbot generalista: está entrenado para las reglas de CinderVex y para preguntas sobre la prueba de ideas de trading.
- CinderVex es exclusivamente paper trading: nada se compra ni se vende de forma real.
- Riesgo de alucinación mitigado parcialmente por la app (hoja de hechos verificada y validación de respuestas), pero no eliminado en el modelo en sí.
- Idioma limitado al inglés, lo que restringe su uso en castellano u otros idiomas sin trabajo adicional.
- Longitud de contexto no documentada, lo que impide planificar conversaciones largas con garantías.
- Sin datos publicados de benchmarks ni de rendimiento en producción.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye "as is", sin garantías de ningún tipo.
- Al ser un derivado modificado de Granite 4.0 Micro, debe conservarse la atribución a IBM Corp. y el aviso de licencia Apache 2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CinderVex/cindervex-free-ai
- Perfil del autor en Hugging Face: https://huggingface.co/CinderVex
- Modelo base IBM Granite 4.0 Micro: https://huggingface.co/ibm-granite/granite-4.0-micro
