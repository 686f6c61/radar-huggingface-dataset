# JOKER141/H3-Fight-Flow-Fight-Interaction-LoRA

## Resumen

Fight Flow V1 es un adaptador LoRA experimental para el modelo de generación de vídeo MiniMax-H3, publicado por el usuario JOKER141. Su objetivo no es enseñar nuevas coreografías de combate, sino modelar cómo dos o más personajes interactúan de forma continuada dentro de una misma pelea: iniciación, respuesta, contacto, consecuencia, cambio de iniciativa y encadenamiento con la siguiente acción. El adaptador se distribuye bajo los tags minimax-h3, lora, video-generation, weapon-combat, action y motion, y su repositorio ocupa aproximadamente 0,2 GB.

El autor lo entrena con una variante denominada D-OPSD, en la que el Teacher puede referenciar directamente el vídeo objetivo en lugar de depender solo de la descripción textual. Esto permite capturar relaciones de movimiento difíciles de describir con palabras, como contactos, trayectorias, desplazamientos forzados, interacción de armas y transiciones de estado. El entrenamiento se realizó íntegramente en una RTX 6000D con picos de VRAM de unos 60 GB y un tiempo aproximado de 2 a 3 veces el de un LoRA habitual del autor.

El adaptador se plantea como una capa de interacción que se combina con otros LoRA especializados (Combat, Weapon, GunFu, Motion Repair) más que como un sustituto de estos. El autor recomienda pesos de 0,65 en la primera pasada y 0,25 en la segunda. La información pública disponible no incluye licencia, benchmarks ni especificaciones del modelo base, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax-H3, modelo de generación de vídeo; detalle interno no disponible |
| Parametros totales | no disponible (tamaño del repositorio: 0,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0,2 GB; formato concreto no especificado) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de pesos de bajo rango que se acoplan sobre el modelo base MiniMax-H3 (MiniMaxAI/MiniMax-H3). El repositorio no documenta el rango, los módulos objetivo ni la configuración exacta del adaptador. La innovación declarada está en el método de entrenamiento D-OPSD: a diferencia de un LoRA convencional que se apoya principalmente en los captions, este esquema permite que el Teacher consulte directamente el vídeo objetivo durante el entrenamiento, lo que facilita aprender relaciones de movimiento que el texto describe mal (contacto, trayectoria, desplazamiento pasivo, interacción de armas, cambios de iniciativa y herencia de estado entre acciones).

No se especifican en la información disponible el número de tokens o clips de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. El único dato de cómputo aportado es que el entrenamiento se ejecutó en una RTX 6000D con picos de VRAM de aproximadamente 60 GB, con una duración estimada de 2 a 3 veces la de un LoRA estándar del mismo autor. El propósito explícito es mejorar la causalidad ataque-respuesta, la naturalidad de los cambios de iniciativa y la continuidad de estado, reduciendo secuencias del tipo "ataque, reinicio de pose, nuevo ataque".

## Capacidades

- Generación de vídeo de escenas de combate continuado sobre el modelo base MiniMax-H3.
- Encadenamiento de acciones con herencia de estado: la posición, el centro de gravedad y la distancia de la acción previa sirven como punto de partida de la siguiente.
- Tres disparadores de interacción: "Unarmed combat interaction" (puñetazos, patadas, agarres, proyecciones y control corporal), "Melee weapon interaction" (hojas, bastones, lanzas y otras líneas de arma cuerpo a cuerpo) y "Gun-fu interaction" (control de boca de fuego, manejo de arma, disparo a corta distancia e interacción arma-mano).
- Mejora de la causalidad ataque-respuesta y de la naturalidad de los cambios de iniciativa en combates de dos o más personajes.
- Gestión de entradas y salidas de oponentes en peleas multitudinarias, permitiendo que un enemigo se retire mientras otro entra en la refriega.
- Organización de intercambios de combate completos a partir de un prompt corto más el disparador correspondiente.
- No soporta, según la información disponible, tool calling, function calling, agentes ni modos de razonamiento; es un adaptador puramente generativo de vídeo.

## Casos de uso

- Previsualización de escenas de acción en cine y animación: el adaptador puede generar intercambios de pelea con continuidad de estado para validar coreografía y ritmo antes del rodaje o la animación final, evitando el efecto de "pose neutral entre golpes".
- Prototipado de animaciones de combate para videojuegos: sirve para producir referencias animadas de secuencias cuerpo a cuerpo o con armas que después se ajustan en el motor, gracias a la continuidad de iniciativa entre atacante y defensor.
- Storyboards animados y previsualización (previs): permite convertir un guion de pelea en un vídeo de referencia con transiciones coherentes entre acciones, útil para equipos de dirección y de efectos.
- Generación de contenido de acción para redes y cortometrajes: con un prompt corto y el disparador adecuado, el autor indica que el modelo ya organiza intercambios completos, lo que facilita clips de combate sin una descripción exhaustiva.
- Diseño de secuencias con armas blancas o de fuego: mediante los disparadores "Melee weapon interaction" y "Gun-fu interaction" se pueden generar combates centrados en líneas de arma o en control de arma corta, respectivamente.
- Pruebas de continuidad y montaje: al modelar el paso de una acción a la siguiente, resulta útil para estudiar cómo se encadenan planos de pelea y dónde conviene cortar o cambiar de oponente.
- Combinación con otras capas LoRA: el autor lo plantea como capa de interacción junto a LoRA de Combat, Weapon, GunFu y Motion Repair, de modo que aquellos deciden "qué movimientos se conocen" y Fight Flow los une en una pelea continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas cuantitativas (FVD, CLIP, evaluaciones humanas u otras) ni comparaciones numéricas con alternativas.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,2 GB, pero la inferencia requiere cargar el modelo base MiniMax-H3, cuyos requisitos de VRAM no se detallan en la información disponible.
- Entrenamiento: el autor reporta una RTX 6000D con picos de VRAM de unos 60 GB y un tiempo de 2 a 3 veces su LoRA habitual. Esa cifra corresponde al proceso de entrenamiento, no a la inferencia.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible para inferencia; para entrenamiento se cita la RTX 6000D.
- Compatibilidad con GPU de consumo: no disponible (un pico de 60 GB en entrenamiento sugiere que el entrenamiento no cabe en GPU de consumo; la inferencia no está documentada).
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI; el adaptador depende del stack del modelo base MiniMax-H3).
- Latencia y throughput: no disponible.
- Ajustes de inferencia recomendados por el autor: peso del LoRA de 0,65 en la primera pasada y 0,25 en la segunda.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de adaptadores comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A continuación se contrastan únicamente los elementos declarados frente a la alternativa genérica de uso del modelo base sin este adaptador.

| Modelo | Tipo | Enfoque | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fight Flow V1 (JOKER141) | LoRA sobre MiniMax-H3 | Interacción y continuidad de combate | en | no disponible | HuggingFace (0 descargas, 1 like) |
| MiniMax-H3 (base) | Modelo de generación de vídeo | Generación de vídeo generalista | no disponible | no disponible | HuggingFace |
| Otros LoRA de combate ("Combat", "Weapon", "GunFu", "Motion Repair") | LoRA sobre MiniMax-H3 | Movimientos especializados | no disponible | no disponible | Mencionados por el autor, sin enlaces |

## Limitaciones y advertencias

- El propio autor lo califica como experimental y explícitamente no es un LoRA de "aceleración": no hace que los personajes se muevan más rápido, sino que reorganiza el encadenamiento de las acciones.
- El repositorio no declara licencia, lo que impide determinar si se permite el uso comercial. Conviene contactar con el autor antes de usarlo en producción.
- No hay benchmarks ni evaluaciones cuantitativas publicadas, por lo que la mejora descrita se basa únicamente en la observación cualitativa del autor.
- El único idioma declarado es el inglés (en), lo que puede limitar prompts en otros idiomas.
- El rendimiento depende del disparador elegido: el autor recomienda seleccionarlo según la lógica de interacción dominante (cuerpo a cuerpo, arma blanca o arma de fuego), no según el equipo visible en pantalla.
- Se plantea como capa de interacción que debe combinarse con otros LoRA especializados; usarlo en solitario puede no dar los mismos resultados.
- La información sobre el modelo base MiniMax-H3 (contexto, cuantizaciones, licencia) no está incluida en los datos disponibles, lo que añade incertidumbre sobre el despliegue.
- No se documentan sesgos, tasas de alucinación ni comportamientos anómalos concretos; al ser un modelo generativo de vídeo, existe riesgo de artefactos visuales y de incoherencias de movimiento no evaluadas.
- Fecha de creación registrada en HuggingFace: 2026-10-07; fecha de última actualización: 2026-10-07. El modelo acumula 0 descargas y 1 like, por lo que no hay validación por parte de la comunidad.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/JOKER141/H3-Fight-Flow-Fight-Interaction-LoRA
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Vídeo de demostración: https://huggingface.co/JOKER141/H3-Fight-Flow-Fight-Interaction-LoRA/resolve/main/assets/demo.mp4
