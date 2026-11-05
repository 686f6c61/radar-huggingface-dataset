# SicariusSicariiStuff/Impish_Magic_24B

## Resumen
Impish_Magic_24B es un ajuste fino (fine-tune) del modelo mistralai/Magistral-Small-2506, desarrollado por SicariusSicariiStuff y publicado en junio de 2025. Se trata de un modelo de 23.572.413.440 parámetros (aproximadamente 24B) orientado a roleplay y aventuras conversacionales, entrenado sobre unos 100 millones de tokens únicos del dataset propietario UBW_Tapestries. El autor lo describe como un ajuste "intermedio" entre un LoRA y un full fine-tune: modifica áreas específicas del vocabulario y el estilo sin reentrenar todas las capas, preservando en lo posible la inteligencia del modelo base.

El modelo hereda la licencia Apache 2.0 del Magistral-Small-2506, lo que facilita su uso comercial sin las restricciones habituales de otros modelos de Mistral. Está disponible únicamente en inglés y se distribuye en formato safetensors. Su relevancia actual radica en ser el primer fine-tune de rol de Magistral, una familia con capacidades de razonamiento encadenado, y en ofrecer un tamaño de 24B que cabe en GPU de consumo con cuantización adecuada.

La ficha se basa exclusivamente en la información publicada en HuggingFace y la model card del autor; no se han publicado resultados de benchmarks ni especificaciones detalladas de entrenamiento más allá de lo indicado.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral, no se especifica variante exacta) |
| Parámetros totales | 23.572.413.440 (aprox. 24B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; el autor menciona ejecución en GPU de 16 GB |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de mistralai/Magistral-Small-2506, un transformer de aproximadamente 24B parámetros. El autor no detalla la arquitectura interna más allá de indicar que se trata de un ajuste "intermedio": no es un LoRA, pero tampoco un full fine-tune completo, ya que se han tuneado áreas específicas del modelo para modificar el uso del vocabulario y el estilo conversacional manteniendo la mayor parte de las capacidades originales. No se especifica si se congelaron capas, qué proporción de parámetros se actualizó ni la configuración de entrenamiento (learning rate, batch size, épocas).

El entrenamiento se realizó sobre aproximadamente 100 millones de tokens únicos del dataset SicariusSicariiStuff/UBW_Tapestries, que incluye datos de roleplay y aventuras, algunos de ellos sin un procesamiento exhaustivo de limpieza según admite el autor. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al ajuste supervisado, ni innovaciones técnicas como decodificación especulativa o atención lineal. El autor indica que el modelo funciona "bastante rápido" en una GPU de 16 GB (RTX 4090 mobile), aunque no aporta cifras de latencia o throughput.

## Capacidades
- Generación de texto conversacional orientada a roleplay multi-turno.
- Aventuras conversacionales (adventure mode), con formato recomendado basado en tarjetas de aventura adjuntas por el autor.
- Roleplay de combate ("fight-RP"), una de las motivaciones declaradas del proyecto.
- Estilo y vocabulario ajustados respecto al modelo base, con un tono "impish" (travieso) según la denominación del autor.
- Capacidades heredadas del modelo base Magistral-Small-2506, incluyendo razonamiento (no verificadas en la model card para este fine-tune).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso
- Roleplay conversacional en asistentes tipo SillyTavern: el modelo está entrenado específicamente para mantener personajes y estilo a lo largo de conversaciones multi-turno, lo que lo hace adecuado para frontends de rol que gestionan historial largo.
- Aventuras de texto interactivas: el autor recomienda usar tarjetas de aventura con una sintaxis concreta; el modelo puede narrar escenas, gestionar decisiones del jugador y mantener coherencia narrativa.
- Combates narrativos ("fight-RP"): entrenado con datos orientados a escenas de combate, puede describir acciones, turnos y consecuencias dentro de una lógica de juego.
- Prototipado de videojuegos narrativos: integrable como motor de diálogo en prototipos de juegos de rol por texto, gracias a su tamaño de 24B y licencia Apache 2.0 que permite uso comercial.
- Generación de ficción interactiva y escritura creativa asistida: el ajuste de vocabulario y estilo busca un tono distintivo, útil para herramientas de escritura que requieran una voz narrativa concreta.
- Despliegue local en estaciones de trabajo con GPU de consumo: el autor lo ejecutó en una GPU de 16 GB (RTX 4090 mobile), lo que permite probarlo en entornos de desarrollo sin infraestructura de servidor.
- Investigación sobre ajuste fino selectivo: sirve como caso de estudio de un fine-tune "intermedio" sobre Magistral, útil para quienes estudian técnicas de adaptación de dominio con presupuesto limitado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; el autor indica que funciona en una GPU de 16 GB (RTX 4090 mobile) con cuantización, aunque no especifica el nivel exacto.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? Sí, según el autor, en una RTX 4090 mobile de 16 GB; se desconoce el comportamiento en GPUs de 8-12 GB.
- Opciones de despliegue: no se especifican en la model card (vLLM, llama.cpp, Ollama, TGI no mencionados).
- Latencia y throughput: no disponibles; el autor solo califica el rendimiento como "bastante rápido" sin cifras.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Impish_Magic_24B | ~24B | no disponible | Apache 2.0 | Roleplay y aventura (fine-tune de Magistral) | HuggingFace, safetensors |
| mistralai/Magistral-Small-2506 (base) | ~24B | no disponible en esta ficha | Apache 2.0 | Razonamiento general | HuggingFace |
| Alternativas de rol de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con otras alternativas de rol del mismo tamaño.

## Limitaciones y advertencias
- El modelo solo declara soporte de inglés; no se garantiza un rendimiento correcto en castellano u otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos, agravado en contextos de rol donde la coherencia narrativa puede primar sobre la factualidad.
- El autor admite que parte de los datos de entrenamiento no pasó por un proceso exhaustivo de limpieza, lo que puede introducir sesgos, ruido estilístico o comportamientos indeseados.
- No se han publicado evaluaciones de sesgos, seguridad ni toxicidad.
- La longitud de contexto no está documentada; no se debe asumir la del modelo base sin verificación.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Magistral-Small-2506 y de los datos de entrenamiento antes de un uso comercial a gran escala.
- El modelo está orientado a roleplay y aventura; su rendimiento en tareas de razonamiento, código o matemáticas puede degradarse respecto al base debido al ajuste de estilo.
- No hay información sobre tool calling, agentes ni modo de razonamiento explícito en este fine-tune.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/SicariusSicariiStuff/Impish_Magic_24B
- Modelo base: https://huggingface.co/mistralai/Magistral-Small-2506
- Dataset de entrenamiento: https://huggingface.co/datasets/SicariusSicariiStuff/UBW_Tapestries
- Hilo de Reddit citado por el autor: https://www.reddit.com/r/SillyTavernAI/comments/1jb7ykd/comment/mhw9smq/
- Actualización del autor sobre fuentes de datos: https://huggingface.co/SicariusSicariiStuff/LLAMA-3_8B_Unaligned#current-status
- Apoyo al autor (Ko-fi): https://ko-fi.com/sicarius
