# SicariusSicariiStuff/Nano_Imp_1B

## Resumen

Nano_Imp_1B es un modelo de lenguaje de 1.498.482.688 parámetros (aproximadamente 1,5B) desarrollado por el usuario SicariusSicariiStuff, un fine-tune del modelo base meta-llama/Llama-3.2-1B-Instruct. Está especializado en roleplay (RP) conversacional en inglés y se presenta, según su autor, como el primer modelo de roleplay totalmente coherente en el rango de 1B parámetros. Su relevancia radica en que busca hacer accesible la inferencia local de un modelo conversacional de rol en hardware muy limitado, incluyendo teléfonos de gama media, sin depender de servicios en la nube.

El modelo se distribuye en formato safetensors con un tamaño de repositorio de 3,0 GB, bajo licencia llama3.2 y únicamente con soporte declarado para inglés. No se han publicado datos sobre arquitectura interna específica más allá de su base Llama, ni sobre el proceso de entrenamiento (número de tokens, composición del dataset o uso de RLHF/DPO). La model card se centra en la motivación del autor y en la inclusión de una character card ("Nano_Imp") más que en detalles técnicos.

Por su tamaño reducido, Nano_Imp_1B es relevante para escenarios de despliegue en el borde (edge), prototipado rápido de experiencias conversacionales de rol y experimentación con fine-tunes de Llama 3.2 1B. No obstante, la información técnica publicada es escasa y no se han divulgado resultados de benchmarks, por lo que su evaluación debe basarse en pruebas directas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de meta-llama/Llama-3.2-1B-Instruct) |
| Parametros totales | 1.498.482.688 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona una sección de cuantizaciones, pero no detalla los tipos) |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only heredado de Llama-3.2-1B-Instruct, con 1.498.482.688 parámetros totales. No se ha publicado información adicional sobre modificaciones estructurales, número de capas, dimensión de atención ni estrategias de atención alternativas. Tampoco se detalla la longitud de contexto efectiva del fine-tune, aunque por herencia del modelo base cabría esperar un contexto amplio, dato que no se confirma en la información disponible.

Respecto al entrenamiento, la model card no especifica el volumen de tokens utilizados, la composición del dataset de roleplay, ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor contextualiza el desarrollo en la dificultad de lograr coherencia conversacional a 1B parámetros y lo presenta como una continuación de su trabajo previo en modelos de roleplay de mayor tamaño (Impish_LLAMA_3B). No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional orientado a roleplay en inglés.
- Mantenimiento de personajes (character cards), con una incluida en el repositorio ("Nano_Imp").
- Coherencia multi-turno según las muestras cualitativas del autor (diálogo de ejemplo a 3 disparos).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés declarado.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Roleplay local en dispositivos de gama baja: el modelo puede ejecutarse en teléfonos de gama media o equipos sin GPU dedicada, permitiendo experiencias de personaje sin enviar datos a la nube, que es precisamente la motivación declarada por el autor.
- Prototipado rápido de chatbots de personaje: gracias a su tamaño de 1,5B y a su formato safetensors, se puede integrar en entornos de desarrollo para validar guiones, character cards y flujos conversacionales antes de escalar a modelos mayores.
- Experimentación académica con fine-tunes pequeños: sirve como caso de estudio de hasta qué punto un modelo de 1B parámetros puede mantener coherencia en tareas de rol, útil para investigaciones sobre eficiencia y alineación en modelos pequeños.
- Aplicaciones de entretenimiento offline: juegos narrativos o simuladores conversacionales que requieran privacidad y funcionamiento sin conexión, aprovechando la inferencia local.
- Evaluación comparativa de técnicas de cuantización: al ser un modelo pequeño, permite medir el impacto de distintas cuantizaciones en calidad de diálogo y latencia en hardware modesto (aunque el autor no detalla las cuantizaciones disponibles).
- Base para fine-tunes específicos de nicho: su licencia llama3.2 y su origen en Llama 3.2 1B Instruct lo convierten en punto de partida para adaptaciones de rol en dominios concretos, siempre que se respeten los términos de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de 1,5B parámetros, en FP16 requeriría aproximadamente 3 GB de VRAM, y en cuantizaciones de 4 bits podría situarse en torno a 1 GB o menos, aunque estos cálculos no están confirmados por el autor.
- GPU recomendadas: no disponible; el autor enfatiza que el modelo "funciona en cualquier cosa", incluyendo teléfonos de gama media, pero no especifica GPU concretas.
- Compatibilidad con GPU de consumo: previsiblemente sí en GPUs de consumo con suficiente VRAM para el tamaño indicado, aunque no se detallan modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: no se especifican en la información disponible (no se confirman vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Nano_Imp_1B | 1.498.482.688 | no disponible | llama3.2 | Roleplay en inglés | HuggingFace |
| meta-llama/Llama-3.2-1B-Instruct | 1B (aprox.) | no disponible en esta ficha | llama3.2 | Instrucciones generales | HuggingFace |
| Impish_LLAMA_3B (mismo autor) | 3B (aprox.) | no disponible | no disponible | Roleplay | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Llama 3.2, podría heredar sesgos del modelo base, sin que se hayan publicado evaluaciones al respecto.
- Riesgo de alucinación: no evaluado; en modelos de 1B parámetros el riesgo de incoherencia y fabricación es habitualmente elevado, aunque el autor afirma coherencia plena en rol.
- Limitaciones de contexto e idioma: solo se declara inglés y no se especifica la longitud de contexto efectiva.
- Restricciones de licencia: licencia llama3.2, que impone condiciones de uso (incluida la política de uso aceptable de Meta) y requiere revisar los términos para uso comercial.
- Caveats para producción: la información técnica publicada es mínima (sin benchmarks, sin detalles de entrenamiento, sin cuantizaciones documentadas), lo que dificulta una evaluación rigurosa; las afirmaciones de "primer y único modelo de rol de 1B totalmente coherente" son del autor y no están verificadas de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/SicariusSicariiStuff/Nano_Imp_1B
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Modelo previo del autor (Impish_LLAMA_3B): https://huggingface.co/SicariusSicariiStuff/Impish_LLAMA_3B
- Character card incluida (Nano_Imp): https://huggingface.co/SicariusSicariiStuff/Nano_Imp_1B/resolve/main/Character_Cards/Nano_Imp.png
- Imagen de ejemplo de diálogo: https://huggingface.co/SicariusSicariiStuff/Nano_Imp_1B/resolve/main/Images/Example.png
- Apoyo al autor (Ko-fi): https://ko-fi.com/sicarius
