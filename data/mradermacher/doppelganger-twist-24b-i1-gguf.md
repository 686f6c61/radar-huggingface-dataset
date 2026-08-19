# mradermacher/Doppelganger-Twist-24B-i1-GGUF

## Resumen

Doppelganger-Twist-24B es un modelo de lenguaje de 23.572.444.160 parámetros (aproximadamente 23,5 mil millones) orientado a la escritura creativa, la ficción y el roleplay. El modelo original, desarrollado por Naphula, es un merge de varios modelos realizado con mergekit, y los tags sugieren que está basado en la arquitectura Mistral. La versión que aquí se documenta es una cuantización GGUF con imatrix preparada por mradermacher, que permite ejecutar el modelo en hardware de consumo con un peso de aproximadamente 9 GB en su cuantización más baja (Q2_K).

La relevancia de esta versión cuantizada radica en que hace accesible un modelo de gran tamaño (24B) para tareas de generación de texto creativo, algo que normalmente requeriría más de 40 GB de VRAM en precisión completa. El modelo está pensado para generación de historias, tramas, subtramas, continuación de escenas, ciencia ficción, romance, horror y roleplay, con un énfasis en prosa vívida y descriptiva. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (merge de modelos, probablemente basado en Mistral según tags) |
| Parametros totales | 23.572.444.160 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K (9.0 GB) y archivo imatrix para crear quants propios |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Los tags indican que es un merge (fusion) de modelos creado con mergekit, y la presencia del tag "mistral" sugiere que los componentes base pertenecen a la familia Mistral, probablemente con una configuracion de 24B de parametros. No se especifica el numero de tokens de entrenamiento, la composicion del dataset original ni si se aplicaron tecnicas como RLHF o DPO.

El unico dato de entrenamiento disponible es el dataset usado para calcular la matriz de importancia (imatrix) durante la cuantizacion: OccultAI/illuminati_imatrix_v1. Este dataset se utiliza para calibrar la cuantizacion y reducir la perdida de calidad, pero no forma parte del entrenamiento original del modelo.

## Capacidades

- Generacion de texto creativo: el modelo esta especializado en escritura de ficcion, con capacidad para generar historias completas, tramas y subtramas.
- Continuacion de escenas: puede continuar una escena o narracion existente manteniendo coherencia estilistica.
- Roleplay: soporta interacciones de personajes y narrativa interactiva, comun en entornos de roleplay textual.
- Variedad de generos: ciencia ficcion, romance, horror y otros generos literarios, segun los tags.
- Prosa descriptiva: enfasis en "vivid prosing" (prosa vivida), con descripciones detalladas y lenguaje expresivo.
- No se menciona soporte para tool calling, funciones, agentes, vision o audio.

## Casos de uso

- Escritura de ficcion asistida: un autor puede usar el modelo para generar borradores de capitulos, desarrollar tramas o superar bloqueos creativos, aprovechando su capacidad para mantener coherencia narrativa en textos largos.
- Generacion de contenido para juegos de rol: el modelo puede actuar como director de juego o generar descripciones de escenarios, dialogos de PNJs y reacciones a las acciones de los jugadores.
- Creacion de prototipos de novelas: permite esbozar multiples variaciones de una misma escena o argumento, facilitando la exploracion de alternativas narrativas.
- Chatbots de ficcion interactiva: integrable en aplicaciones de storytelling donde el usuario interactua con personajes ficticios, gracias a su entrenamiento en roleplay.
- Generacion de guiones o dialogos: util para escribir dialogos naturales y expresivos en contextos dramaticos o cinematograficos.
- Asistente de escritura para blogs o contenido narrativo: puede redactar introducciones, metaforas o descripciones poeticas que enriquezcan textos no necesariamente literarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La cuantizacion i1-Q2_K ocupa 9.0 GB, por lo que cabe en GPUs de consumo con 12 GB de VRAM o mas (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 4080, RTX 4090).
- Para una calidad superior, se pueden generar cuantizaciones intermedias (Q4_K_M, Q5_K_M, etc.) usando el archivo imatrix incluido, lo que aumentaria el requisito de VRAM (aproximadamente 14-18 GB para Q4/Q5).
- El modelo puede ejecutarse con llama.cpp, Ollama o cualquier runtime compatible con GGUF. Tambien es posible usar vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- En CPU, con suficiente RAM (16 GB o mas), se puede ejecutar en modo mixto con llama.cpp, aunque la velocidad sera menor que en GPU.
- No se dispone de datos de latencia o throughput especificos para este modelo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa con otros modelos de escritura creativa. El modelo comparte tamano con otras opciones de 24B (como algunos merges de Mistral), pero al no haber datos de benchmarks ni detalles de arquitectura, no es posible establecer una comparacion objetiva.

## Limitaciones y advertencias

- Solo soporta ingles: el modelo esta entrenado exclusivamente en este idioma, por lo que no es adecuado para generacion de texto en castellano u otros idiomas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inconsistente, especialmente en contextos factuales.
- Sesgos desconocidos: al ser un merge de modelos, los sesgos de los componentes originales pueden heredarse, pero no se han documentado.
- Calidad de cuantizacion: la cuantizacion Q2_K es de baja precision y puede degradar notablemente la calidad del texto. Se recomienda usar cuantizaciones superiores si el hardware lo permite.
- Sin informacion sobre contexto: no se conoce la longitud maxima de contexto, lo que puede limitar su uso en tareas que requieran ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero se debe revisar la licencia de los modelos base del merge para asegurar compatibilidad.

## Enlaces

- [Modelo cuantizado en HuggingFace](https://huggingface.co/mradermacher/Doppelganger-Twist-24B-i1-GGUF)
- [Modelo base (Naphula/Doppelganger-Twist-24B)](https://huggingface.co/Naphula/Doppelganger-Twist-24B)
- [Paginade descargas del cuantizador](https://hf.tst.eu/model#Doppelganger-Twist-24B-i1-GGUF)
