# Austriani/Orion-26B-A4B-v1.1-ik_llama.cpp

## Resumen

Orion-26B-A4B-v1.1-ik_llama.cpp es una cuantizacion GGUF del modelo TheDrummer/Orion-26B-A4B-v1.1, publicada por el usuario Austriani. Se trata de un modelo de mezcla de expertos (MoE) con 128 expertos, derivado de la familia Gemma 4 segun las etiquetas del autor, orientado a escritura creativa, roleplay y generacion de texto sin censura, con capacidades multimodales (vision) y modo de razonamiento (thinking).

El modelo base cuenta con 25.233.142.046 parametros totales (aproximadamente 25,2 mil millones) y una arquitectura MoE con 4 mil millones de parametros activos por token (sufijo A4B), lo que permite un equilibrio entre capacidad y coste computacional en inferencia. Esta version concreta esta empaquetada para la libreria ik_llama.cpp, una bifurcacion optimizada de llama.cpp, e incluye cuantizaciones del tipo IQK con calibracion imatrix v3 y esquema trellis-quant/maxoptima.

Su relevancia radica en que ofrece un modelo de gran tamano con activacion dispersa en formato GGUF listo para ejecucion local, con soporte multimodal y de contexto largo, aunque su licencia Gemma y su orientacion a contenido para adultos condicionan su uso en produccion. El repositorio tiene 89,9 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), 128 expertos, derivada de Gemma 4 |
| Parametros totales | 25.233.142.046 (aprox. 25,2 B) |
| Parametros activos | 4 B (sufijo A4B) |
| Longitud de contexto | no disponible (etiqueta "long-context" sin cifra concreta) |
| Tipos de cuantizacion | GGUF con esquema IQK, trellis-quant, maxoptima e imatrix v3 |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma |
| Formato de pesos | GGUF (libreria ik_llama.cpp) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con mezcla de expertos de 128 expertos y aproximadamente 4 mil millones de parametros activos por token, sobre una base de 25,2 mil millones de parametros totales. Segun las etiquetas del autor, deriva de la familia Gemma 4 y esta afinado para escritura creativa, roleplay y generacion sin censura, incorporando un modo de razonamiento explicito (thinking) y capacidades de vision (multimodal, image-text-to-text).

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card del autor de la cuantizacion se limita a metadatos y estilos visuales, sin datos tecnicos de entrenamiento. La innovacion destacable de esta publicacion es el proceso de cuantizacion: uso de calibracion imatrix v3 y esquemas trellis-quant/maxoptima dentro de ik_llama.cpp, una bifurcacion de llama.cpp orientada a rendimiento en CPU y GPU.

## Capacidades

- Generacion de texto y escritura creativa, con enfasis en narrativa y roleplay.
- Modo de razonamiento explicito (thinking) segun las etiquetas del autor.
- Capacidades multimodales de vision (pipeline image-text-to-text).
- Soporte de contexto largo (etiqueta "long-context", sin cifra publicada).
- Generacion sin censura (uncensored) y contenido para adultos (nsfw).
- Conversacion multi-turno (etiqueta conversational).
- Compatibilidad con endpoints (endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo language.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar narrativa larga y coherente gracias a su ventana de contexto extendida y a su afinado especifico para ficcion, adecuado para borradores de relatos y novelas.
- Roleplay y personajes conversacionales: su entrenamiento orientado a roleplay permite mantener personajes consistentes en conversaciones multi-turno, util en plataformas de entretenimiento conversacional.
- Generacion de contenido para adultos: la ausencia de censura lo hace apto para plataformas que requieren ficcion explicita, siempre bajo cumplimiento legal y de edad.
- Procesamiento de documentos con imagenes: al ser multimodal, puede describir o razonar sobre capturas, diagramas o ilustraciones en tareas de documentacion tecnica.
- Razonamiento con modo thinking: util para tareas que requieren cadena de razonamiento visible, como analisis de escenarios o planificacion narrativa compleja.
- Despliegue local en estaciones de trabajo: al estar en GGUF para ik_llama.cpp, permite ejecucion en hardware de consumo o servidores sin GPU de datacenter, reduciendo costes de infraestructura.
- Prototipado de asistentes conversacionales en ingles: su compatibilidad con endpoints facilita integrarlo en backends compatibles con la API de OpenAI para pruebas rapidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras concretas; el repositorio ocupa 89,9 GB e incluye multiples cuantizaciones, por lo que el peso en disco y memoria varia segun el fichero elegido.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabida en GPU de consumo: no confirmado; con 25,2 B de parametros totales y activacion de 4 B, las cuantizaciones mas agresivas podrian caber en GPUs de 24 GB, pero no hay datos verificados.
- Opciones de despliegue: ik_llama.cpp (libreria nativa del repositorio); compatibilidad con llama.cpp, Ollama o vLLM no confirmada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Orion-26B-A4B-v1.1 (esta cuantizacion) | 25,2 B | 4 B | no disponible | Gemma | GGUF (ik_llama.cpp) |
| TheDrummer/Orion-26B-A4B-v1.1 | 25,2 B | 4 B | no disponible | Gemma | safetensors (base) |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables verificados en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribucion; revisar los terminos antes de desplegar en produccion.
- Contenido para adultos y sin censura: requiere controles de edad y moderacion si se expone a usuarios finales.
- Solo ingles: el campo language declara unicamente "en", por lo que el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad.
- Sesgos conocidos: no documentados en la informacion disponible.
- Contexto largo sin cifra publicada: la etiqueta "long-context" no especifica el numero exacto de tokens, lo que dificulta planificar el despliegue.
- Cuantizacion de terceros: al ser una conversion no oficial del modelo base, puede introducir degradaciones respecto a los pesos originales.
- Sin descargas ni validacion comunitaria: el repositorio registra 0 descargas y 0 likes, sin evidencia de pruebas externas.
- Compatibilidad limitada: empaquetado para ik_llama.cpp, no necesariamente compatible con otros runners sin conversion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Austriani/Orion-26B-A4B-v1.1-ik_llama.cpp
- Modelo base: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1.1
