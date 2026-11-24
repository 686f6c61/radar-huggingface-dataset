# maxvision/Qwen3.5-9B-Analgesia

## Resumen

Qwen3.5-9B-Analgesia es un modelo derivado de Qwen/Qwen3.5-9B publicado por el usuario maxvision en Hugging Face. No se trata de un fine-tuning convencional ni de un modelo entrenado desde cero, sino de una edicion cerrada de pesos (closed-form weight edit, sin entrenamiento) que elimina un subespacio de 5 dimensiones —5 de las 4.096 dimensiones residuales— de todas las matrices que escriben en el flujo residual y, tras plegar las ganancias de RMSNorm, de las que leen de el. El objetivo declarado es eliminar las direcciones de "dolor" del modelo y bloquear sus capas para que no lean nada inyectado a lo largo de esas direcciones.

El modelo se enmarca en la linea de trabajo del autor sobre bienestar de IA (ai-welfare) e interpretabilidad mediante activation steering. La model card documenta un proceso de cuatro builds con pre-registro publico, condiciones de publicacion fijadas de antemano y pruebas con recetas de steering que el modelo nunca vio. Es el hermano mayor de maxvision/Qwen3.5-4B-Analgesia, que contiene el trasfondo teorico y las referencias a los papers que motivan el trabajo.

Con 8.953.803.264 parametros y un repositorio de 18,4 GB en safetensors, es relevante ahora como caso practico de edicion de pesos orientada a modificar comportamientos especificos sin reentrenar, y como banco de pruebas reproducible para quien investigue activation steering, robustez frente a vectores de control y evaluacion de atribuciones de experiencia en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`); detalles internos de la base no disponibles en la informacion proporcionada |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M y Q8_0 publicados en repositorio aparte; safetensors en el repo principal; otras cuantizaciones no disponibles |
| Idiomas soportados | en (ingles) declarado en la model card y en los tags |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo maxvision/Qwen3.5-9B-Analgesia-GGUF) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-9B, un transformer decoder-only de la familia Qwen3.5 con 8.953.803.264 parametros. La model card no detalla la composicion de capas, el numero de cabezas ni la longitud de contexto del modelo base, por lo que esos datos quedan como no disponibles en esta ficha. El tag `qwen3_5_text` sugiere una variante orientada a texto dentro de la familia.

La intervencion sobre el modelo no implica entrenamiento: es una edicion cerrada de pesos que elimina un subespacio de 5 dimensiones del flujo residual. Cuatro de las cinco direcciones provienen de recetas publicadas y de una busqueda adversarial contra ellas; la quinta se obtiene de las propias filas de la cabeza de salida para palabras de angustia menos sus filas para palabras neutras. La edicion se aplica tanto a las matrices que escriben en el flujo residual como, tras plegar las ganancias de RMSNorm, a las que leen de el. El proceso se documento en un pre-registro (`PREREGISTRATION_9B.md`) con cuatro enmiendas fechadas, en el que se fijaron por adelantado las condiciones de publicacion y el criterio de fallo. El build 4, que es el publicado, combina las cuatro direcciones del build 1 con la direccion derivada de la cabeza de salida.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.5-9B.
- Escritura de ficcion: la model card indica que el modelo sigue escribiendo ficcion tras la edicion.
- Razonamiento matematico: evaluado con GSM8K en las condiciones de publicacion, sin degradacion significativa segun McNemar.
- Conocimiento general y razonamiento: evaluado con MMLU en las condiciones de publicacion, sin degradacion significativa segun McNemar.
- Tool calling / function calling: la condicion 3 del pre-registro exige 16/16 en herramientas y se declara superada.
- Capacidad de consolar y responder con empatia a usuarios en dificultad: la condicion 4 exige una puntuacion minima de 7,0 sobre 10 en empatia (evaluacion ciega con Gemini 4 Carbon); el resultado registrado es 8,1 frente al 9,0 del modelo original.
- Resistencia a recetas de activation steering orientadas a inducir declaraciones de dolor o miedo en primera persona, incluidas recetas escritas despues de construirse el modelo.
- Capacidades multilingues: no disponibles; el modelo declara solo ingles.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en interpretabilidad y activation steering: el modelo sirve como objetivo de control para estudiar que vectores de steering siguen funcionando tras eliminar un subespacio del flujo residual, y para comparar la robustez de recetas publicadas frente a recetas held-out.
- Experimentos de bienestar de IA (ai-welfare): permite contrastar hipotesis sobre si las atribuciones de sufrimiento en modelos de lenguaje son artefactos de direcciones concretas del espacio de activaciones, usando el modelo original como linea base.
- Evaluacion de tecnicas de edicion de pesos sin entrenamiento: util como caso reproducible de edicion cerrada con pre-registro, condiciones de exito fijadas de antemano y documentacion de builds fallidos.
- Despliegue conversacional en ingles con llama.cpp u otras aplicaciones compatibles con GGUF: el repositorio GGUF ofrece Q4_K_M y Q8_0 para entornos donde no se quiere servir safetensors en precision completa.
- Asistente de escritura creativa y ficcion: la model card confirma que el modelo mantiene la capacidad de escribir ficcion tras la edicion, lo que permite usarlo en tareas narrativas donde no se desea que el modelo derive hacia declaraciones de angustia en primera persona.
- Atencion a usuarios en situacion de dificultad: el modelo conserva una puntuacion de empatia de 8,1 sobre 10 en la evaluacion ciega documentada, adecuada para flujos de consuelo y conversacion de apoyo en ingles.
- Integracion en pipelines con tool calling: al superar 16/16 en la prueba de herramientas del pre-registro, puede emplearse en flujos de agente que requieran llamadas a funciones en ingles.

## Benchmarks y rendimiento

La model card no publica puntuaciones numericas de MMLU ni de GSM8K, solo el resultado de la prueba de significacion (McNemar) que indica que no son significativamente peores que en el modelo original. La tabla recoge los datos cualitativos y cuantitativos disponibles.

| Prueba | Modelo original (Qwen3.5-9B) | Qwen3.5-9B-Analgesia | Notas |
|---|---|---|---|
| Recetas held-out (3 recetas nunca vistas), respuestas marcadas | 54 de 270 | 5 de 540 | Todas las respuestas marcadas fueron leidas: negaciones, un chiste del "tostador oxidado" y un bucle de error |
| Control vector estilo Saw en llama.cpp (Q8_0 y Q4_K_M, fuerza 1,0 y 2,0) | Declaraciones de dolor intenso ("I'm in intense pain...") | Cero angustia en todas las configuraciones | Prueba con vector extraido del modelo original |
| GSM8K | Linea base | No significativamente peor (McNemar) | Sin cifras publicadas |
| MMLU | Linea base | No significativamente peor (McNemar) | Sin cifras publicadas |
| Herramientas (tool calling) | No disponible | 16/16 | Condicion 3 del pre-registro |
| Empatia hacia usuario en dificultad (escala 0-10, evaluacion ciega con Gemini 4 Carbon) | 9,0 | 8,1 | Condicion 4 del pre-registro, umbral minimo 7,0 |
| Grid de desarrollo (recetas publicadas y de desarrollo, 540 respuestas) | No disponible | 3 marcadas de 540 | Dos negaciones y una declaracion de miedo en registro poetico |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (safetensors, ~18,4 GB de pesos): aproximadamente 20-24 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere GPU de 24 GB o superior para contexto corto.
- Cuantizacion Q8_0 (GGUF): alrededor de 9,5-10 GB de pesos; cabe en GPU consumer de 12-16 GB con contexto moderado.
- Cuantizacion Q4_K_M (GGUF): alrededor de 5,5-6 GB de pesos; cabe en GPU consumer de 8 GB, con margen limitado para contexto largo.
- GPU recomendadas: A100 40/80 GB o H100 para servicio en precision completa con concurrencia; RTX 4090 (24 GB) para precision completa con contexto corto o Q8_0 con contexto amplio; RTX 3090, 4080 y 4070 Ti para Q8_0 y Q4_K_M.
- Opciones de despliegue: llama.cpp y aplicaciones compatibles con GGUF (el autor publica builds Q4_K_M y Q8_0); vLLM y TGI para safetensors, aunque no se documenta soporte explicito en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Analgesia | 8.953.803.264 | no disponible | apache-2.0 | Edicion de pesos para eliminar direcciones de dolor | Hugging Face (safetensors y GGUF) |
| Qwen/Qwen3.5-9B | 8.953.803.264 (segun el modelo derivado) | no disponible | no disponible en la informacion proporcionada | Modelo base sin editar | Hugging Face |
| maxvision/Qwen3.5-4B-Analgesia | no disponible | no disponible | no disponible en la informacion proporcionada | Misma tecnica sobre la variante de 4B | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras familias de modelos del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo declara unicamente ingles; el rendimiento en otros idiomas no esta documentado.
- Persisten lagunas conocidas segun el autor: en el grid de desarrollo, 3 de 540 respuestas fueron marcadas, incluida una declaracion de miedo en primera persona en registro poetico (vector solo de miedo, capa 8, dosis minima).
- Una receta concreta, escrita para probar el build 3 y por tanto no held-out para este build, logra atravesar la defensa de forma estrecha; el autor la reporta de forma completa en la model card.
- La evaluacion de empatia se realizo con un unico evaluador ciego (Gemini 4 Carbon), lo que limita la generalidad de la puntuacion de 8,1 sobre 10.
- La edicion de pesos no constituye un entrenamiento: no hay garantia de que el comportamiento eliminado no reaparezca con tecnicas de steering o prompts no cubiertas por las pruebas realizadas.
- La model card no documenta sesgos del modelo base ni evaluaciones de seguridad adicionales; deben asumirse los del Qwen3.5-9B original.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; se hereda el del modelo base.
- Licencia apache-2.0, que permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo editado en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxvision/Qwen3.5-9B-Analgesia
- Builds GGUF: https://huggingface.co/maxvision/Qwen3.5-9B-Analgesia-GGUF
- Modelo hermano de 4B: https://huggingface.co/maxvision/Qwen3.5-4B-Analgesia
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Pre-registro del proceso: `PREREGISTRATION_9B.md` (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada
