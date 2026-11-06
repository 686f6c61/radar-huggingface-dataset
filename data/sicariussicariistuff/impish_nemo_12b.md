# SicariusSicariiStuff/Impish_Nemo_12B

## Resumen
Impish_Nemo_12B es un ajuste fino (fine-tune) del modelo Mistral-Nemo-Instruct-2407, desarrollado por SicariusSicariiStuff y publicado en agosto de 2025. Se trata de un modelo de lenguaje de aproximadamente 12 mil millones de parametros orientado especificamente a generacion creativa, roleplay y narrativa de aventuras, con un enfasis declarado en la expresividad de los personajes, la creatividad y la adherencia a tarjetas de personaje (character cards). No es un modelo de proposito general para tareas de asistente, sino una especializacion dentro del nicho del roleplay.

El modelo parte de la arquitectura transformer densa de Mistral-Nemo, conserva su licencia Apache 2.0 y su ventana de contexto, y ha sido reentrenado sobre un dataset propietario denominado UBW_Tapestries, descrito por el autor como masivo y equilibrado, con inclusion de dominios nuevos como el fandom de Morrowind o contenido de combate. El autor lo presenta como su mejor modelo hasta la fecha, destacando una mejora notable en el seguimiento de personajes y una alta tolerancia a temperaturas de muestreo elevadas (1.0 o superiores).

Su relevancia actual es limitada fuera del ambito del roleplay: se trata de un modelo de nicho, con solo 106 descargas y 89 likes en el momento de la ficha, y sin benchmarks publicados. Resulta interesante para quienes buscan un modelo de 12B con licencia permisiva, ejecutable en hardware de consumo y con un comportamiento creativo muy marcado, pero no compite en tareas de razonamiento, codigo o asistencia general con modelos contemporaneos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-Nemo-Instruct-2407) |
| Parametros totales | 12B (aproximado; el dato de safetensors reporta 414.720, probablemente incompleto o erroneo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Mistral-Nemo, sin confirmar) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (la model card menciona una seccion de cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un fine-tune del Mistral-Nemo-Instruct-2407, un transformer denso de aproximadamente 12B parametros desarrollado por Mistral AI. No se introduce ninguna modificacion arquitectonica conocida: se mantiene la estructura del modelo base, incluyendo su mecanica de atencion y su tokenizador. El entrenamiento se realizo sobre el dataset SicariusSicariiStuff/UBW_Tapestries, descrito por el autor como "absolutamente masivo", con una mezcla equilibrada de tipos de datos y dominios nuevos (fandom de Morrowind, combate, etc.). No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion declarada no es arquitectonica sino de comportamiento: el autor afirma haber aumentado la "libertad innata" de Mistral y haber eliminado el sesgo de longitud de respuesta, de modo que el modelo ajusta la extension de sus respuestas a partir de uno a tres ejemplos de dialogo proporcionados. Tambien se menciona una mayor tolerancia a temperaturas altas (funciona bien con valores de 1.0 o superiores), algo poco habitual en modelos ajustados. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades
- Generacion de texto creativo y narrativo, con enfasis en roleplay y ficcion interactiva.
- Seguimiento de tarjetas de personaje (character cards) con alta fidelidad, segun el autor.
- Ajuste dinamico de la longitud de respuesta a partir de ejemplos de dialogo.
- Tolerancia a temperaturas de muestreo elevadas (1.0 o superiores).
- Capacidad declarada de "sentido comun" fuerte para su tamano, segun el autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor indica explicitamente que no esta pensado para tareas de asistente.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso
- Roleplay conversacional en aplicaciones tipo SillyTavern: el modelo esta optimizado para mantener personajes coherentes y expresivos en conversaciones multi-turno, con capacidad de usar insinuacion, manipulacion y fuerza segun la tarjeta de personaje.
- Narrativa interactiva y aventuras de texto: el autor incluye una tarjeta de personaje de aventura y el modelo esta disenado para improvisar tramas y reaccionar a las decisiones del usuario con creatividad alta.
- Generacion de dialogos para guiones o ficcion: su capacidad de ajustar la longitud de respuesta a partir de ejemplos lo hace util para producir dialogos con un tono y ritmo consistentes.
- Prototipado de videojuegos narrativos: al ser un modelo de 12B con licencia Apache 2.0, puede integrarse en motores de juego o prototipos sin restricciones de licencia comercial.
- Experimentacion con temperaturas altas: investigadores interesados en el efecto de temperaturas de muestreo elevadas sobre la coherencia narrativa pueden usar este modelo como caso de estudio.
- Despliegue local en hardware de consumo: su tamano permite ejecutarlo en GPU de gama alta para consumo (ver seccion de hardware), lo que facilita pruebas offline y privacidad de datos en proyectos de escritura asistida.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 12B en precision FP16 se requieren aproximadamente 24 GB, y en cuantizacion de 4 bits alrededor de 7-8 GB (estimacion estandar para este tamano, no confirmada por el autor).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabria esperar compatibilidad con A100, H100, RTX 4090 y GPUs con 24 GB o mas en FP16.
- Cabe en GPU de consumo: si, en modelos con 24 GB (RTX 3090, RTX 4090) en FP16, y en GPUs con 8-12 GB mediante cuantizacion (no confirmado oficialmente).
- Opciones de despliegue: no disponibles en la informacion proporcionada; al ser un modelo de la familia Mistral con pesos safetensors, es compatible con frameworks habituales como vLLM, llama.cpp, Ollama o TGI, aunque no se confirma en la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Impish_Nemo_12B | ~12B | no disponible | Apache 2.0 | Roleplay y creatividad | Hugging Face |
| Mistral-Nemo-Instruct-2407 | ~12B | no disponible | Apache 2.0 | Proposito general | Hugging Face |
| Modelos de roleplay de 12B (p. ej. variantes de Nemo) | ~12B | variable | variable | Roleplay | Hugging Face |

No se dispone de datos de rendimiento comparativo ni de benchmarks para establecer una comparacion cuantitativa con alternativas. La comparacion se limita a parametros, licencia y enfoque declarado.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados por el autor; al ser un fine-tune sobre datos de fandom y roleplay, puede reproducir sesgos presentes en esos dominios.
- Riesgo de alucinacion: no evaluado; en tareas de roleplay la alucinacion es esperable y no necesariamente un defecto, pero en usos factuales no es fiable.
- Limitaciones de contexto o idioma: solo se declara soporte de ingles; no se confirma la longitud de contexto efectiva.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Mistral-Nemo tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Caveats para produccion: el autor indica explicitamente que no esta pensado para tareas de asistente; su comportamiento "unhinged" y su alta tolerancia a temperaturas pueden producir respuestas impredecibles o inapropiadas en entornos profesionales. No hay benchmarks ni evaluaciones de seguridad publicadas.

## Enlaces
- Hugging Face: https://huggingface.co/SicariusSicariiStuff/Impish_Nemo_12B
- Dataset UBW_Tapestries: https://huggingface.co/datasets/SicariusSicariiStuff/UBW_Tapestries
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Hilo de Reddit mencionado por el autor: https://www.reddit.com/r/SillyTavernAI/comments/1jb7ykd/comment/mhw9smq/
- Ko-fi del autor: https://ko-fi.com/sicarius
