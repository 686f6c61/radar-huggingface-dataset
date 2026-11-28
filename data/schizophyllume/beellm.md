# schizophyllume/BeeLLM

## Resumen

BeeLLM es una familia de modelos de lenguaje extremadamente pequenos publicada por el usuario schizophyllume en Hugging Face bajo licencia Apache 2.0. No es un modelo de proposito general: se trata de un experimento artistico y tecnico ("toy-model") en el que cada variante simula el comportamiento de una abeja, emitiendo secuencias de zumbidos (`buzz`, `bzzz`, `bz`) y, en las variantes mayores, respuestas conversacionales con etiquetas de estado de animo. Todos los pesos se distribuyen en formato GGUF y estan pensados para ejecutarse con llama.cpp, incluso dentro de un navegador web.

El modelo mas pequeno de la familia tiene apenas 10 000 parametros y un vocabulario de 8 "zumbidos"; el mas grande, BeeLLM-Scintilla-50M, alcanza 50 millones de parametros con 8 capas y un vocabulario de 8192 tokens. La variante Hive combina una "reina" de 50M con hasta 12 "obreras" enlazadas, sumando 54M de parametros. Aunque la model card describe arquitectura llama, el modelo registrado en el repositorio principal (4 445 760 parametros en safetensors) corresponde a una de las variantes intermedias de la familia.

Su relevancia es fundamentalmente educativa y de investigacion: permite estudiar el ciclo completo de entrenamiento, cuantizacion y despliegue de un LLM con recursos minimos, y explorar comportamientos emergentes de condicionamiento emocional en modelos de escala minuscula. No debe confundirse con un modelo apto para tareas de produccion reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo llama (descrita por el autor como "llama-architecture") |
| Parametros totales | 4 445 760 (repositorio principal, safetensors); la familia abarca desde 10 000 hasta 54 000 000 segun variante |
| Parametros activos | no disponible (no es MoE; la variante Hive usa una reina y obreras enlazadas, sin datos de activacion) |
| Longitud de contexto | 4096 tokens en todas las variantes |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos GGUF; no se detallan niveles Q4, Q8, etc.) |
| Idiomas soportados | no disponible (el vocabulario de las variantes tiny son zumbidos; las mayores usan tokens sin idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el repositorio principal tambien contiene safetensors |

## Arquitectura y entrenamiento

La familia sigue una arquitectura transformer de tipo llama con variaciones de profundidad y vocabulario: las variantes tiny tienen 1 capa y vocabularios de 8 a 21 "buzzes"; las variantes Mood escalan de 4 a 8 capas con vocabularios de 1024 a 8192 tokens; Scintilla-50M usa 8 capas y 10 cabezas de atencion. La variante Hive anade un mecanismo de "enlace" entre una reina y hasta 12 obreras, con pesos separados para reina, obreras y enlaces (por ejemplo, 50M + 3M + 1M en BeeLLM-Hive).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La model card menciona que las variantes 2.0 se reentrenaron con aproximadamente 3000 conversaciones nuevas y que Scintilla incorpora un mecanismo de "momento" del estado de animo (la emocion se recupera gradualmente tras interacciones negativas). No se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto limitada a zumbidos en las variantes tiny (vocabulario cerrado de 8 a 21 tokens).
- Conversacion con etiquetas de estado de animo (`[mood:level]`) en las variantes Mood y Scintilla, con seis estados (neutral, happy, loving, sad, angry, confused) y dos niveles (low, high).
- Respuestas con acciones textuales entre asteriscos (`*stings you*`, `*stomps tiny feet*`).
- Memoria de estado de animo con inercia en Scintilla: tras una interaccion negativa, el estado se recupera paso a paso.
- Capacidad de "enjambre" en la variante Hive: una reina y hasta 12 obreras enlazadas.
- No hay soporte documentado de tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Demostracion educativa de un LLM completo: sirve para ilustrar tokenizacion, generacion autoregresiva y cuantizacion GGUF en un taller o clase, ya que el modelo entero cabe en menos de 1 GB y se ejecuta en cualquier equipo con llama.cpp.
- Chatbot ludico en navegador: la demo oficial (bee.pleroma.nexus) muestra como integrar un modelo GGUF en una aplicacion web para interacciones de entretenimiento con respuesta emocional simulada.
- Pruebas de infraestructura de despliegue: al ser tan pequeno, permite validar pipelines de llama.cpp, servidores de inferencia y formatos GGUF antes de pasar a modelos mayores.
- Investigacion sobre condicionamiento emocional: las variantes Mood y Scintilla permiten estudiar como un modelo minusculo asocia entradas afectivas a etiquetas de estado y acciones, con un coste computacional despreciable.
- Arte generativo y narrativa interactiva: las respuestas con zumbidos y acciones encajan en instalaciones artisticas, juegos de texto o bots de redes sociales con personalidad de abeja.
- Experimentos de arquitecturas de enjambre: la variante Hive ofrece un banco de pruebas para estudiar composicion de modelos (reina + obreras) a escala de laboratorio.
- Benchmarking de herramientas de cuantizacion: util para comparar el comportamiento de distintas herramientas (llama.cpp, Ollama) sobre un modelo de referencia minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para todas las variantes; el repositorio completo ocupa 0.6 GB. Las variantes tiny y Mood de 1M caben en unos pocos MB.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (incluso integradas) es suficiente.
- Cabe en cualquier GPU consumer, incluida la gama baja y las integradas; tambien en Raspberry Pi y entornos web.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y cualquier runtime compatible con GGUF; la model card indica compatibilidad con endpoints.
- Latencia y throughput: no disponibles; por el tamano (de 10K a 54M parametros) se espera latencia de milisegundos en CPU, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso previsto |
|---|---|---|---|---|---|
| BeeLLM (familia) | 10K - 54M | 4096 | Apache 2.0 | GGUF, safetensors | Juguete, educativo, artistico |
| TinyStories-1M (Microsoft) | 1M | 2048 | MIT | safetensors | Investigacion de modelos pequenos |
| SmolLM-135M (Hugging Face) | 135M | 2048 | Apache 2.0 | safetensors, GGUF | Modelo pequeno de proposito general |
| Qwen2.5-0.5B | 494M | 32768 | Apache 2.0 | safetensors, GGUF | Proposito general en el borde |

BeeLLM no es comparable en rendimiento con modelos de proposito general: su vocabulario cerrado y su entrenamiento orientado a zumbidos lo sitúan en la categoria de juguete, mientras que TinyStories-1M o SmolLM-135M estan disenados para generar texto coherente. La comparativa solo es valida en terminos de escala y coste de despliegue.

## Limitaciones y advertencias

- No es un modelo de proposito general: las variantes tiny solo emiten zumbidos y no responden a instrucciones.
- Riesgo de alucinacion y respuestas incoherentes, especialmente en las variantes Mood de 1M, que "garabatean" palabras segun la propia model card.
- Vocabulario cerrado y muy limitado en las variantes tiny (8 a 21 tokens), lo que impide cualquier uso linguistico real.
- Idiomas soportados no documentados; no se garantiza castellano ni ninguna otra lengua.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece garantias de calidad ni de comportamiento predecible.
- El condicionamiento emocional es simulado y puede producir respuestas no deseadas en contextos sensibles; no debe usarse en atencion al cliente real ni en aplicaciones donde el tono afectivo importe.
- La variante Hive depende de pesos de "reina", "obreras" y "enlaces" que deben cargarse juntos; no hay documentacion sobre estabilidad de ese mecanismo.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/schizophyllume/BeeLLM
- Demo en navegador: https://bee.pleroma.nexus/
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- No se han encontrado papers, blogs ni repositorios adicionales en la informacion disponible.
