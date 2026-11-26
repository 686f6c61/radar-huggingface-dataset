# aotoki/poc-mini-trade-npc-GGUF

## Resumen

PoC Mini Trade NPC es un modelo de lenguaje de 268 millones de parámetros (268.098.176 exactos) especializado en dar voz a un mercader no jugable dentro de un videojuego de comercio. Lo desarrolla el usuario aotoki como prueba de concepto y parte de `google/gemma-3-270m-it`, el modelo instructivo de la familia Gemma 3, afinado con LoRA sobre un conjunto de datos propio de turnos de regateo en chino tradicional (zh-TW). Su función no es razonar ni decidir: el juego resuelve precios, amistad y acciones, y el modelo solo extrae la intención del jugador y redacta la frase del mercader.

La relevancia del modelo está en su diseño de contrato cerrado: cada turno hace dos llamadas (extracción y renderizado) que devuelven JSON validado contra un esquema, y en la fase de renderizado el modelo escribe marcadores `{price}`, `{offer}` y `{currency}` que el motor del juego sustituye por los valores reales. Así se evita que un modelo pequeño alucine cifras o divisas, algo crítico en una mecánica de comercio. El resultado es un modelo de 0,6 GB en cuantización Q8_0 que corre en CPU o en navegador con wllama.

Por su tamaño, encaja en el nicho de IA generativa embebida en juegos: inferencia local, latencia de 0,18 s por turno en Metal con llama.cpp y un coste de cómputo mínimo. No es un modelo de propósito general, sino un componente de diálogo con un contrato de API muy estricto y evaluación publicada sobre un conjunto de test de 248 turnos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), afinado con LoRA y fusionado en los pesos base |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con longitud máxima de 512 tokens) |
| Tipos de cuantizacion | GGUF Q8_0 (único archivo publicado) |
| Idiomas soportados | chino tradicional (zh-TW) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (`poc-mini-trade-npc.Q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/gemma-3-270m-it`, un transformer decoder-only de la familia Gemma 3. El ajuste se hizo con LoRA de rango 16 y alpha 32, sin dropout, aplicado a todas las proyecciones de atención y MLP, y posteriormente fusionado en los pesos base. Los pesos de partida fueron los de `unsloth/gemma-3-270m-it`. El entrenamiento usó el split `train` de `aotoki/poc-mini-trade-game-dataset`: 1.586 turnos de regateo rebalanceados en 2.367 ejemplos (1.160 de extracción y 1.207 de renderizado). Se entrenaron 6 épocas con batch 8, learning rate 2e-4 lineal, AdamW de 8 bits, weight decay 0,001, semilla 3407 y longitud máxima de 512 tokens, calculando la pérdida solo sobre el turno del modelo (`train_on_responses_only`). La selección de checkpoint se hizo puntuando las épocas 4 a 6 sobre validación y exportando la época 6. Todo el entrenamiento corrió en una NVIDIA T4 de Google Colab en 8,4 minutos.

La innovación técnica no está en la arquitectura, sino en el contrato de interacción. Cada turno se divide en dos llamadas con prompts que comparten las secciones `# World` y `# NPC` para reutilizar la caché KV: una de extracción, que devuelve intención, actitud y oferta, y otra de renderizado, que devuelve la frase del mercader con marcadores de precio, oferta y divisa. El esquema de respuesta del renderizado solo admite ideogramas CJK, puntuación china y los tres marcadores, de modo que el modelo no puede escribir números ni derivar a otros alfabetos. Además, los prompts de entrenamiento usan 10 divisas distintas y la validación y el test usan 3 que el modelo nunca vio, lo que fuerza a generalizar el uso del marcador `{currency}` en lugar de memorizar nombres concretos.

## Capacidades

- Extracción estructurada de intención del jugador en JSON: campos `intent`, `attitude` y `offer`.
- Renderizado de réplicas de personaje con marcadores de plantilla (`{price}`, `{offer}`, `{currency}`) que el motor del juego sustituye.
- Salida JSON validada contra esquema mediante `response_format` (esquemas `EXTRACT` y `RENDER`).
- Generación restringida a ideogramas CJK y puntuación china en la fase de renderizado, sin caracteres simplificados (0,996 de cumplimiento en test).
- Manejo de relaciones y emociones predefinidas por el juego (por ejemplo, `relationship: hostile`, `emotion: pleased`) para modular el tono de la frase.
- Generalización a divisas no vistas durante el entrenamiento.
- Ejecución en CPU y en navegador (wllama) por su tamaño reducido.
- No soporta tool calling general, agentes multi-paso, visión, audio ni razonamiento libre: su alcance es el contrato de dos llamadas descrito.

## Casos de uso

- Diálogo de mercader en juegos de comercio: el motor resuelve el precio y la amistad, y el modelo extrae la oferta del jugador y redacta la réplica con el precio insertado por el juego, evitando que el modelo invente cifras.
- Regateo multi-turno con estado persistente: al compartir las secciones `# World` y `# NPC` entre las dos llamadas, el juego puede reutilizar la caché KV y mantener coherencia de contexto entre turnos a bajo coste.
- Prototipado rápido de NPC conversacionales: con 0,6 GB en Q8_0 y 8,4 minutos de entrenamiento en una T4, sirve como base para iterar sobre datasets de diálogo de dominio cerrado.
- Despliegue embebido en cliente: al caber en CPU y en navegador vía wllama, permite NPC generativos sin servidor ni coste de API por turno.
- Localización de mecánicas de comercio a chino tradicional: el modelo está entrenado y evaluado específicamente en zh-TW, con control explícito contra caracteres simplificados.
- Generación de texto de personaje con restricciones de formato estrictas: el esquema de renderizado limita el alfabeto y los marcadores, lo que lo hace adecuado para pipelines donde la salida se inserta directamente en UI de juego.
- Servicio de referencia con llama.cpp: `llama-server -m poc-mini-trade-npc.Q8_0.gguf --port 8080 --jinja` expone el modelo como endpoint compatible con el formato de chat.

## Benchmarks y rendimiento

Evaluación sobre el split `test` (248 turnos), moneda no vista en entrenamiento, con intervalos de Wilson al 95 % entre corchetes. Inferencia con llama.cpp build 12722 en Metal, decodificación greedy y respuestas restringidas por los esquemas.

| Llamada | Métrica | Resultado |
|---|---|---|
| Extract | JSON válido | 248/248 |
| Extract | Los tres campos coinciden | 0,899 [0,855, 0,931] |
| Extract | Intent / attitude / offer | 0,984 / 0,915 / 0,992 |
| Render | JSON válido | 248/248 |
| Render | `{price}` escrito en venta o contraoferta | 0,988 [0,959, 0,997] |
| Render | `{currency}` escrito donde la referencia lo indica | 0,988 [0,959, 0,997] |
| Render | Palabra de divisa escrita en lugar del marcador | 0/248 |
| Render | Sin caracteres simplificados | 0,996 |

En el caso ambiguo en que la divisa también nombra el objeto (`這鎖鏈1214鎖鏈就好`), la extracción acertó 52 de 53 ofertas. El rendimiento es de 0,18 s por turno. La calidad del renderizado no tiene medida automática: una lectura de 28 réplicas encontró la mayoría de contraofertas, ventas y rechazos correctos, y alrededor de un cuarto con defectos, sobre todo en conversación trivial.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 ocupa 0,6 GB; la inferencia cabe en menos de 1 GB de memoria, incluida la caché KV para contextos de hasta 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 1 GB libre; el autor reporta funcionamiento en CPU y en navegador, y las pruebas se hicieron en Metal (Apple).
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, integradas Apple Silicon) e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`), wllama en navegador; al ser GGUF, también es compatible con otros runners basados en llama.cpp.
- Latencia y throughput: 0,18 s por turno en Metal con decodificación greedy y salida restringida por esquema; no se publican cifras de throughput en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| PoC Mini Trade NPC (este) | 268 M | no disponible (entrenamiento a 512) | zh-TW | Gemma Terms of Use | NPC de comercio con contrato JSON de dos llamadas |
| google/gemma-3-270m-it | 270 M | no disponible en la información | multilingüe | Gemma Terms of Use | Modelo instructivo de propósito general |
| Modelos de diálogo de personaje de tamaño pequeño (por ejemplo, variantes de 0,5-1 B) | 0,5-1 B | variable | variable | variable | Diálogo libre sin contrato estructurado |

La comparación con alternativas de la misma categoría (NPC de juego con salida estructurada) no está disponible en la información proporcionada. Frente a su modelo base, la diferencia es el contrato de dos llamadas y el ajuste específico en zh-TW; frente a modelos de diálogo libre de mayor tamaño, la ventaja es el control de cifras y formato y el coste de ejecución, y la desventaja es el alcance limitado al dominio de comercio.

## Limitaciones y advertencias

- Modelo de prueba de concepto: el autor lo describe explícitamente como PoC, no como producto listo para producción.
- Dominio muy restringido: solo cubre turnos de comercio y regateo; fuera de ese contrato la calidad no está evaluada.
- Solo chino tradicional (zh-TW): no hay soporte evaluado de otros idiomas.
- Riesgo de alucinación mitigado pero no eliminado: el esquema de renderizado impide escribir números y divisas, pero la extracción de intención, actitud y oferta tiene un 0,899 de coincidencia exacta en los tres campos, con un 0,915 en actitud como punto más débil.
- La calidad del renderizado no tiene métrica automática; la revisión manual de 28 réplicas detectó alrededor de un cuarto con defectos, concentrados en conversación trivial.
- Cambios incompatibles entre revisiones: la versión del 26 de noviembre de 2026 cambia prompts y formato de respuesta; los juegos deben fijar la revisión (`312fa26` para la primera versión).
- Licencia Gemma Terms of Use: hay que revisar las condiciones de uso comercial y las restricciones de la licencia de Google antes de distribuirlo en un producto.
- Longitud de contexto no documentada; el entrenamiento usó 512 tokens como máximo, por lo que contextos más largos no están validados.
- Dependencia de un esquema de respuesta concreto (`lib/npc_schema.rb`): si se modifica, hay que reentrenar o revalidar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aotoki/poc-mini-trade-npc-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/aotoki/poc-mini-trade-game-dataset
- Repositorio del dataset y del juego: https://github.com/elct9620/poc-mini-trade-game-dataset
- Contrato de llamadas del NPC: https://github.com/elct9620/poc-mini-trade-game-dataset/blob/main/docs/features/npc-calls.md
- Esquemas de respuesta: https://github.com/elct9620/poc-mini-trade-game-dataset/blob/main/lib/npc_schema.rb
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Pesos de partida (Unsloth): https://huggingface.co/unsloth/gemma-3-270m-it
- wllama (inferencia en navegador): https://github.com/ngxson/wllama
- Licencia Gemma: https://ai.google.dev/gemma/terms
