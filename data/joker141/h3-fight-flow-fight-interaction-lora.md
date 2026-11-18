# JOKER141/H3-Fight-Flow-Fight-Interaction-LoRA

## Resumen

Fight Flow es un LoRA experimental para el modelo de generación de vídeo MiniMax-H3, desarrollado por el usuario JOKER141 y publicado en Hugging Face. No enseña movimientos nuevos, sino que intenta que el modelo base aprenda a organizar interacciones de combate entre dos o más personajes: que la acción de uno genere la respuesta del otro, con causalidad ataque-defensa, contacto, desplazamiento forzado y transferencia de iniciativa. El objetivo declarado es pasar de "saber pegar" a "saber pelear" de forma continua, evitando el patrón de "ataco, reinicio la pose, vuelvo a atacar".

El adaptador se entrenó con una variante de entrenamiento denominada D-OPSD, en la que el Teacher puede referenciar directamente el vídeo objetivo en lugar de depender solo de los captions. Esto permite aprender relaciones de movimiento difíciles de describir textualmente: contacto, trayectorias, cambios de iniciativa y herencia de estado entre acciones. La versión V2 del LoRA corrige de forma notable los artefactos de la V1, en concreto los brazos y armas que aparecían como "fideos" y las distorsiones o desenfoques en los personajes.

El modelo se distribuye como adaptador (repo de 0,3 GB) sobre MiniMaxAI/MiniMax-H3, con licencia comunitaria de MiniMax y etiqueta de idioma inglés. Su uso previsto es como capa de interacción combinada con otros LoRA especializados (combate, armas, reparación de movimiento), no como sustituto de ellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de generación de vídeo MiniMax-H3 |
| Parametros totales | no disponible (adaptador LoRA; el repo ocupa 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | minimax-h3-community-license (licencia comunitaria de MiniMax-H3) |
| Formato de pesos | no disponible (librería minimax-h3) |

## Arquitectura y entrenamiento

El adaptador es un LoRA sobre MiniMax-H3, un modelo de generación de vídeo. El autor no detalla la arquitectura interna del modelo base en la información disponible. La innovación principal está en el método de entrenamiento: D-OPSD, que a diferencia del entrenamiento LoRA convencional basado en captions permite que el Teacher consulte directamente el vídeo de entrenamiento objetivo. Con ello se aprenden relaciones de movimiento que el texto describe mal: contacto entre cuerpos o armas, trayectorias, desplazamientos pasivos, cambios de iniciativa y transiciones de estado entre acciones consecutivas.

El entrenamiento se realizó íntegramente en una RTX 6000D, con picos de VRAM en torno a 60 GB y un tiempo aproximado de 2 a 3 veces el de un LoRA habitual del autor. No se especifican el número de pasos, el tamaño del dataset ni la composición de los datos de entrenamiento. El LoRA incorpora tres disparadores de interacción: "Unarmed combat interaction." (combate cuerpo a cuerpo, puños, patadas, agarres y proyecciones), "Melee weapon interaction." (líneas de arma blanca, bloqueos y contacto de armas) y "Gun-fu interaction." (control de boca de fuego, manejo de arma y disparo a corta distancia). El autor recomienda elegir el disparador por la lógica de interacción dominante, no por el equipo visible.

## Capacidades

- Generación de vídeo con interacciones de combate continuas entre dos o más personajes.
- Causalidad ataque-respuesta: la acción de un personaje genera la reacción del otro (bloqueo, esquiva, desvío, separación).
- Continuidad de estado: la posición, el centro de gravedad, la distancia y la postura de una acción se heredan en la siguiente, evitando el reinicio a pose neutra.
- Transferencia de iniciativa y cambios de protagonismo en combates multitudinarios (un oponente sale del intercambio y otro entra).
- Tres modos de interacción mediante disparadores: combate desarmado, combate con arma cuerpo a cuerpo y gun-fu.
- Funciona con prompts cortos más disparador, sin necesidad de descripciones extensas.
- Capacidad de composición con otros LoRA especializados (combate, armas, gun-fu, reparación de movimiento) como capa de interacción.
- No incluye tool calling, function calling, razonamiento multi-paso en texto ni capacidades de audio; es un adaptador exclusivamente de generación de vídeo.

## Casos de uso

- Previsualización de escenas de acción para cine o animación: el LoRA organiza intercambios de golpes con causalidad y continuidad, lo que permite generar animáticas de peleas con menos iteraciones de corrección manual.
- Prototipado de secuencias de artes marciales: con el disparador "Unarmed combat interaction." se pueden generar combinaciones de puños, patadas y proyecciones encadenadas para evaluar coreografías antes de producirlas.
- Escenas de esgrima o combate con armas: con "Melee weapon interaction." se generan líneas de ataque, bloqueos y choques de armas con menor incidencia de artefactos en las hojas y astas, gracias a las correcciones de la V2.
- Secuencias de acción con armas de fuego y combate cercano: el disparador "Gun-fu interaction." permite generar control de boca de fuego, disparos a corta distancia y transiciones entre disparo y cuerpo a cuerpo.
- Generación de contenido para videojuegos: vídeos de referencia para animadores o para pipelines de motion matching, con combates multitudinarios donde los enemigos entran y salen del intercambio de forma natural.
- Integración en flujos de postproducción con otros LoRA: usar Fight Flow como capa de interacción (peso 0,65 en primera pasada y 0,25 en segunda) sobre LoRA de combate y reparación de movimiento para producir peleas completas y coherentes.
- Creación de material promocional o demos de acción: con un prompt breve y el disparador adecuado se obtienen intercambios de combate razonablemente completos sin ingeniería de prompts compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador pesa 0,3 GB; el requisito real de VRAM lo determina el modelo base MiniMax-H3, cuyas especificaciones no están disponibles en la información proporcionada.
- Entrenamiento: el autor reporta picos de VRAM de aproximadamente 60 GB en una RTX 6000D, con un tiempo de 2 a 3 veces el de un LoRA habitual.
- GPU recomendadas para entrenamiento: RTX 6000D (configuración usada por el autor); por el consumo de VRAM reportado, se requiere una GPU profesional de gama alta con al menos 60 GB.
- VRAM para inferencia: no disponible.
- Opciones de despliegue: la librería asociada es minimax-h3; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a texto, no aplicables directamente a este adaptador de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRA de interacción de combate comparables para MiniMax-H3 en la documentación proporcionada. El propio autor menciona LoRA complementarios del mismo ecosistema (Combat, Weapon, GunFu, Motion Repair), pero sin datos de parámetros, contexto ni rendimiento que permitan una comparación cuantitativa.

| Modelo | Base | Función | Licencia | Datos comparativos |
|---|---|---|---|---|
| Fight Flow (este) | MiniMax-H3 | Capa de interacción de combate | minimax-h3-community-license | no disponible |
| Combat / Weapon / GunFu / Motion Repair (mencionados) | MiniMax-H3 | LoRA especializados en movimientos y reparación | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental: el autor lo describe explícitamente como un LoRA experimental de interacción de combate continuo.
- La V1 presentaba problemas graves de armas convertidas en "fideos" y personajes distorsionados o borrosos; la V2 los reduce de forma significativa, pero no se garantiza su eliminación total.
- No es un LoRA de velocidad: no acelera el movimiento, sino que reorganiza la continuidad entre acciones; esperar "más intensidad" por velocidad es un mal uso.
- Depende de disparadores concretos ("Unarmed combat interaction.", "Melee weapon interaction.", "Gun-fu interaction."); elegir el disparador incorrecto puede degradar la coherencia de la interacción.
- Está pensado para combinarse con otros LoRA especializados; usarlo aislado puede limitar la variedad de movimientos disponibles.
- Pesos recomendados por el autor: 0,65 en primera pasada y 0,25 en segunda; valores fuera de ese rango no están validados.
- Idioma soportado: inglés únicamente.
- Licencia comunitaria de MiniMax-H3: es necesario revisar los términos del enlace de licencia antes de cualquier uso comercial, ya que las condiciones de la licencia comunitaria pueden imponer restricciones.
- Riesgo de artefactos en anatomía y armas en escenas de combate complejas o multitudinarias, propio de la generación de vídeo.
- No hay datos publicados de benchmarks, latencia ni requisitos de VRAM para inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JOKER141/H3-Fight-Flow-Fight-Interaction-LoRA
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Vídeo de demostración: https://huggingface.co/JOKER141/H3-Fight-Flow-Fight-Interaction-LoRA/resolve/main/assets/demo.mp4
