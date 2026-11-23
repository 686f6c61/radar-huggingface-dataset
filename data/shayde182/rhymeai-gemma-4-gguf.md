# Shayde182/rhymeai-gemma-4-gguf

## Resumen

RhymeAI Gemma 4 es una familia de ajustes finos (LoRA/QLoRA) sobre los modelos Gemma 4 de Google, orientada especificamente a la escritura de canciones en una aplicacion nativa de composicion llamada RhymeAI / Writers Block. El autor, Shayde182, publica los pesos en formato GGUF cuantizado (Q4_K_M) para ejecucion totalmente offline mediante llama.cpp en dispositivos de consumo, desde telefonos con 4-8 GB de RAM hasta equipos de escritorio. El repositorio combina tres modelos base distintos: las variantes pequenas Gemma 4 E2B-it y E4B-it (ajustadas con QLoRA) y la variante mayor Gemma 4 12B-it (con 11.907.350.576 parametros reales en safetensors).

El modelo resuelve un problema muy concreto: hacer que un LLM generico respete el formato exacto de prompt de la aplicacion y produzca sugerencias de letras con rima correcta, reescrituras de pasajes, reescrituras de palabra unica y sinonimos. La relevancia actual reside en su enfoque de despliegue en dispositivo (on-device), sin dependencia de la nube, y en la mejora medida del ajuste fino frente al modelo base: por ejemplo, el porcentaje de respuestas con formato valido en sugerencias pasa del 4 % al 96 % en E2B y del 4 % al 83 % en E4B.

La licencia es Apache 2.0 y los pesos se distribuyen como GGUF, con tamanos de 3,2 GB (E2B), 5,0 GB (E4B) y 7,38 GB (12B v7). El repositorio ocupa 40,8 GB e incluye tambien adaptadores LoRA en F16 de 48 MB y 70 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4); ajuste fino QLoRA sobre los modelos base |
| Parametros totales | 11.907.350.576 (variante 12B); E2B y E4B no disponibles en la informacion |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 2048 tokens (contexto usado en la evaluacion de la aplicacion) |
| Tipos de cuantizacion | Q4_K_M (GGUF); adaptadores LoRA en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); adaptadores LoRA en GGUF F16; safetensors para el recuento de parametros del 12B |

## Arquitectura y entrenamiento

Los modelos E2B y E4B son ajustes QLoRA de `unsloth/gemma-4-E2B-it` y `unsloth/gemma-4-E4B-it`, con rango r=16, alpha=16, 2 epocas, learning rate 2e-4 con decaimiento cosine, batch efectivo de 16 y loss enmascarada sobre el prompt. El entrenamiento se realizo con Unsloth sobre una GPU Colab L4 y los pesos se fusionaron y cuantizaron con llama.cpp (`llama-export-lora` + `llama-quantize`, Q4_K_M). El conjunto de datos consta de 4.947 ejemplos sinteticos generados a partir de letras semilla originales y verificados automaticamente en rima y formato con el diccionario CMU antes del entrenamiento; no se usaron letras con copyright ni datos de usuario.

La variante 12B v7 se basa en `google/gemma-4-12B-it` y emplea el envelope nativo de Gemma 4 con un unico BOS, segun su fichero de ajustes. El formato de prompt de las variantes E2B/E4B usa los marcadores de turno crudos de Gemma (`<start_of_turn>user\n...` / `<start_of_turn>model\n`) con stop string `<end_of_turn>`. El ajuste esta especializado en cuatro tareas: sugerencias de siguiente linea con restriccion de rima, reescritura de pasajes, reescritura de palabra unica y sinonimos.

## Capacidades

- Generacion de texto conversacional en el formato exacto de la aplicacion de composicion.
- Sugerencia de siguiente linea sujeta a restricciones de rima (verificada contra diccionario CMU).
- Reescritura de pasajes completos manteniendo el esquema de rima.
- Reescritura de palabras individuales y generacion de sinonimos.
- Ejecucion totalmente offline en dispositivo mediante llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y uso conversacional.
- Soporte de adaptadores LoRA separados para reutilizacion sobre los modelos base.
- No se documentan capacidades de vision, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Asistente de composicion integrado en la app Writers Block: el modelo consume el prompt exacto de la aplicacion y devuelve sugerencias de siguiente linea con rima, funcionando sin conexion en telefonos de 4-8 GB de RAM con la variante E2B Q4_K_M de 3,2 GB.
- Sugerencia de rimas en tiempo real durante la escritura: la tasa de acierto de rima medida sube del 60 % al 92 % en E2B y del 82 % al 84 % en E4B, lo que lo hace util como ayuda interactiva mientras el usuario teclea.
- Reescritura de estrofas o pasajes: con formato valido del 100 % en E2B y 83 % en E4B en la evaluacion de la aplicacion, permite ofrecer variantes alternativas de un fragmento conservando la metrica y la rima.
- Sustitucion de palabras y sinonimos: util para resolver repeticiones o mejorar la rima de una palabra concreta, con 1.046/1.080 aciertos en reescritura de palabra unica en E2B v6.
- Despliegue en dispositivos de gama alta: la variante E4B de 5,0 GB esta pensada para equipos con 10 GB o mas de RAM, ampliando la calidad sin salir del dispositivo.
- Uso en escritorio o Mac con la variante 12B v7 de 7,38 GB: ofrece opciones de rima con mayor calidad a costa de latencia (2,110 s de media en Mac frente a 0,553 s en E2B), adecuada para flujos de trabajo no interactivos o equipos con mas recursos.
- Integracion en pipelines de aplicaciones de escritorio mediante llama.cpp: el formato GGUF y los adaptadores LoRA permiten empaquetar el modelo en instaladores nativos sin servidores externos.

## Benchmarks y rendimiento

Evaluacion con el arnes de 43 casos de la aplicacion (temperatura 0,8 / top-k 40 / top-p 0,95, contexto 2048):

| Tarea | E2B stock → ajustado | E4B stock → ajustado |
|---|---|---|
| Sugerencias — formato valido | 4 % → 96 % | 4 % → 83 % |
| Sugerencias — acierto de rima | 60 % → 92 % | 82 % → 84 % |
| Reescritura de pasaje — formato | 0 % → 100 % | 33 % → 83 % |
| Reescritura de palabra unica | 56 % → 22 % | 11 % → 78 % |

Comparativa E2B v6 frente a E2B v2.1 sobre un holdout nuevo de 60 canciones (1.140 prompts × 3 semillas, juez ciego por pares, intervalos de confianza del 95 % agrupados por cancion): preferencia global del juez +16,9 puntos [+9,2, +24,9], impulsada por reescrituras de pasaje (185 victorias / 60 derrotas / 25 empates); sugerencias de siguiente linea aproximadamente iguales (neto +2,2 puntos [−6,2, +11,2]); reescritura de palabra unica 1.046/1.080 frente a 1.052/1.080; reescritura de pasaje 534/540 frente a 525/540; sinonimos y visualizacion de seis lineas iguales.

Variante 12B v7: prueba focalizada de 48 casos SIMPLE/VERSE con 93,75 % de rendimiento diagnostico de opciones acotadas y 30/48 aprobados estrictos, con 9 respuestas con lineas sobrantes frente a 0 en E2B. Latencia media medida en Mac de 2,110 s frente a 0,553 s en E2B. El autor advierte que son resultados de listas permitidas de la aplicacion y NEW_SOUND, no una afirmacion de calidad universal.

## Requisitos de hardware

- VRAM/RAM estimada: E2B Q4_K_M requiere 3,2 GB de almacenamiento y esta pensado para telefonos con 4-8 GB de RAM; E4B Q4_K_M ocupa 5,0 GB y apunta a dispositivos con 10 GB o mas; la variante 12B v7 Q4_K_M ocupa 7,38 GB.
- GPU recomendadas: no se especifican GPU concretas en la informacion; el entrenamiento se realizo en una GPU Colab L4.
- Cabe en GPU de consumo: si, las variantes E2B y E4B en Q4_K_M caben en GPUs de consumo con suficiente VRAM (3,2 GB y 5,0 GB respectivamente); la 12B de 7,38 GB tambien es viable en GPUs de consumo de gama alta.
- Opciones de despliegue: llama.cpp (herramienta con la que se generaron y cuantizaron los pesos); no se documentan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: latencia media de 2,110 s en Mac para la 12B v7 y 0,553 s para E2B en la misma prueba; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RhymeAI Gemma 4 E2B (Q4_K_M) | no disponible | 2048 (evaluacion) | Apache 2.0 | GGUF | 3,2 GB; formato de sugerencias 96 %, rima 92 % |
| RhymeAI Gemma 4 E4B (Q4_K_M) | no disponible | 2048 (evaluacion) | Apache 2.0 | GGUF | 5,0 GB; formato de sugerencias 83 %, reescritura de palabra 78 % |
| RhymeAI Gemma 4 12B v7 (Q4_K_M) | 11.907.350.576 | no disponible | Apache 2.0 | GGUF | 7,38 GB; 30/48 aprobados estrictos, latencia 2,110 s en Mac |
| Gemma 4 E2B-it (stock) | no disponible | no disponible | no disponible | no disponible | Base sin ajuste: formato de sugerencias 4 %, rima 60 % |
| Gemma 4 E4B-it (stock) | no disponible | no disponible | no disponible | no disponible | Base sin ajuste: formato de sugerencias 4 %, rima 82 % |

La informacion disponible no incluye comparaciones con otros modelos de la misma categoria fuera de los modelos base de Gemma 4.

## Limitaciones y advertencias

- El ajuste esta especializado en cuatro tareas concretas de la aplicacion; fuera de ese formato de prompt el rendimiento no esta garantizado.
- La evaluacion se realizo con el arnes propio de la aplicacion (43 casos) y con listas permitidas de la aplicacion; el autor advierte que no constituyen una afirmacion de calidad universal ni de nivel humano.
- En la variante 12B v7 se observaron 9 respuestas con lineas sobrantes en 48 casos, frente a 0 en E2B.
- La reescritura de palabra unica empeoro en E2B stock frente a ajustado en la evaluacion original (56 % → 22 %), lo que sugiere sensibilidad al formato y a la version del ajuste.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; el entrenamiento se realizo sobre letras semilla en un idioma no especificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos base de Gemma 4 de Google.
- Los datos de entrenamiento son sinteticos y verificados automaticamente; no se usaron letras con copyright ni datos de usuario, lo que reduce pero no elimina el riesgo de reproduccion de material protegido.
- El contexto documentado para la evaluacion es de 2048 tokens; usos con prompts mas largos no estan validados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Shayde182/rhymeai-gemma-4-gguf
- Modelo base E2B: https://huggingface.co/unsloth/gemma-4-E2B-it
- Modelo base E4B: https://huggingface.co/unsloth/gemma-4-E4B-it
- Modelo base 12B: https://huggingface.co/google/gemma-4-12B-it
- Ficha y limitaciones de la variante 12B v7: gemma-4-12B-it-rhymeai-v7-model-card.md (referenciado en la model card)
- Ajustes exactos de la variante 12B v7: gemma-4-12B-it-rhymeai-v7-settings.json (referenciado en la model card)
- Suma de verificacion SHA-256 de la variante 12B v7: gemma-4-12B-it-rhymeai-v7-Q4_K_M.gguf.sha256 (referenciado en la model card)
