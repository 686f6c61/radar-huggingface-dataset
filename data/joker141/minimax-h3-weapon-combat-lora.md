# JOKER141/MiniMax-H3-Weapon-Combat-LoRA

## Resumen

MiniMax-H3-Weapon-Combat-LoRA es un adaptador LoRA de movimiento especializado en combate con armas para el modelo base MiniMax-H3, un modelo de generación de vídeo de MiniMaxAI. Lo desarrolla el usuario JOKER141 y se publica bajo la licencia comunitaria de MiniMax-H3. Su función es corregir y reforzar la coherencia de las secuencias de combate cuerpo a cuerpo con armas: trayectorias de arma estables, lógica de bloqueo y parada, separación tras el impacto y desplazamiento espacial durante el enfrentamiento.

El adaptador no es un modelo autónomo: requiere MiniMax-H3 como base y se activa mediante la palabra clave de activación "BUNNY". El repositorio ocupa 0,2 GB, lo que es coherente con un conjunto de pesos LoRA de rango bajo sobre un modelo de vídeo de gran tamaño. Está pensado para flujos de generación de vídeo con personajes que empuñan espadas, lanzas, hachas, escudos, armas de fantasía o hojas de energía.

Su relevancia actual radica en que ataca fallos concretos y recurrentes de la generación de vídeo con acción: armas que desaparecen o se deforman en movimientos rápidos, herencia incorrecta del estado del arma entre planos y combates estáticos sin desplazamiento. El autor documenta explícitamente estas correcciones y advierte de que la compatibilidad con otros LoRA de movimiento es limitada en esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base MiniMax-H3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | minimax-h3-community-license |
| Formato de pesos | no disponible (repositorio de 0,2 GB; la model card no detalla el formato) |

## Arquitectura y entrenamiento

Se trata de un LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas del modelo base MiniMax-H3 para modificar su comportamiento generativo sin reentrenar el modelo completo. El modelo base es un generador de vídeo de MiniMaxAI; la model card no detalla la arquitectura interna de H3 (transformer de difusión, número de parámetros ni longitud de contexto), por lo que esos datos no están disponibles.

El entrenamiento se orienta a un dominio muy concreto: cadenas de combate con armas. Según la model card, el objetivo no es acelerar los golpes, sino modelar una secuencia completa de ataque, bloqueo o fallo, deflexión, separación y transición al siguiente estado de combate. El adaptador incorpora además movimiento sobre montura, combate grupal, ataques rotacionales, persecución, retirada, desplazamiento lateral y intercambio de posiciones. El autor menciona que se incluyeron conceptos de remates de estilo ejecución y desmembramiento, no mostrados en la vista previa pública. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos no están disponibles.

## Capacidades

- Generación de vídeo de combate con armas: espadas, sables, lanzas, armas de asta, hachas, martillos, escudos, armas de fantasía y hojas de energía.
- Trayectorias de arma estables en movimientos amplios, giros y ataques rotacionales.
- Lógica de interacción de combate: bloqueo, parada, deflexión, contacto deslizante, separación tras el impacto y recuperación del arma.
- Movimiento espacial durante el combate: persecución, retirada, paso lateral y diagonal, circundar al oponente y evasión con reposicionamiento.
- Combate sobre montura y combate grupal de múltiples personajes.
- Generalización más allá del combate realista humano, con casos de estilo cartoon y armas estilizadas.
- Activación mediante la palabra clave "BUNNY".
- Idioma de las indicaciones: inglés.

## Casos de uso

- Previsualización de secuencias de acción para cine o animación: el LoRA permite generar peleas de espada con trayectorias continuas y bloqueos creíbles, reduciendo el número de iteraciones necesarias frente al modelo base.
- Prototipado de videojuegos de acción: generación de animaciones de referencia para combate cuerpo a cuerpo con distintos tipos de arma antes de pasar a captura de movimiento o animación manual.
- Contenido para redes y marketing de fantasía: escenas de combate estilizado con armas de energía o armas de fantasía, donde la generalización del adaptador cubre estilos no realistas.
- Escenas de combate montado: el adaptador incluye movimiento sobre montura con arcos amplios de arma y combate grupal, útil para secuencias de batalla a caballo.
- Storyboards animados y previz de escenas de lucha: generación de planos con persecución, retirada y circundar al enemigo para evaluar el ritmo y la coreografía antes de la producción.
- Investigación en generación de vídeo condicionada por movimiento: el LoRA sirve como caso de estudio de cómo un adaptador de bajo rango corrige fallos específicos de continuidad de objetos (el arma) en secuencias de acción.
- Creación de demostraciones de combate para formación o divulgación de artes marciales históricas, siempre que se valide la plausibilidad técnica de las secuencias generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Al ser un LoRA sobre un modelo de generación de vídeo, los requisitos vienen determinados por el modelo base MiniMax-H3, cuyas especificaciones no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor ofrece despliegue en la nube mediante "BUNNY-H3 动态工坊" en 优云智算 y flujos de trabajo en RunningHub International (modo primer/último fotograma, modo multiparámetro y escalado de dos pasadas FL2VA/REF2VA). No se documentan opciones de despliegue local como vLLM, llama.cpp, Ollama o TGI, que además no aplican directamente a un modelo de vídeo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JOKER141/MiniMax-H3-Weapon-Combat-LoRA | LoRA de movimiento | MiniMaxAI/MiniMax-H3 | Combate con armas | minimax-h3-community-license | Hugging Face, 5.266 descargas |
| Combat Base V2 | LoRA de movimiento (mencionado por el autor) | MiniMax-H3 | Combate genérico | no disponible | no disponible |
| Motion Continuity Fix | LoRA de corrección de movimiento (mencionado por el autor) | MiniMax-H3 | Continuidad de movimiento | no disponible | no disponible |

El autor advierte de que apilar este LoRA con Combat Base V2, Motion Continuity Fix u otros LoRA de movimiento fuertes puede introducir conflictos de priors de movimiento y reducir la estabilidad; recomienda su uso independiente en la versión actual. No se dispone de datos de benchmarks ni de parámetros para una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No elimina por completo las limitaciones nativas de generación de armas del modelo base: pueden aparecer deformaciones del arma, errores de agarre, confusión en escenas con muchos personajes e inestabilidad cuando la coreografía está muy sobrecargada.
- La compatibilidad con otros LoRA de movimiento es limitada en esta versión; el uso apilado puede degradar la estabilidad.
- El adaptador está entrenado y documentado en inglés; no se declaran capacidades multilingües.
- La licencia es la minimax-h3-community-license, no una licencia de código abierto estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- El modelo incluye comportamientos aprendidos de remates de estilo ejecución y desmembramiento no mostrados en la vista previa pública, lo que puede producir contenido violento explícito no anticipado por el usuario.
- Los enlaces de despliegue de la model card contienen códigos de referencia o invitación que pueden beneficiar al autor; conviene tenerlo en cuenta al evaluar las recomendaciones de infraestructura.
- No se documentan sesgos específicos, tasas de alucinación ni métricas de calidad objetivas; la evaluación depende de inspección visual de los vídeos generados.
- Al ser un adaptador, hereda cualquier limitación del modelo base MiniMax-H3, cuyas especificaciones completas no se detallan en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JOKER141/MiniMax-H3-Weapon-Combat-LoRA
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Vídeo de portada: https://huggingface.co/JOKER141/MiniMax-H3-Weapon-Combat-LoRA/resolve/main/assets/cover.mp4
- Demostración de combate cercano: https://huggingface.co/JOKER141/MiniMax-H3-Weapon-Combat-LoRA/resolve/main/assets/demo_knight.mp4
- Demostración de arma estilizada: https://huggingface.co/JOKER141/MiniMax-H3-Weapon-Combat-LoRA/resolve/main/assets/demo_energy_weapon.mp4
- Demostración comunitaria de combate montado: https://huggingface.co/JOKER141/MiniMax-H3-Weapon-Combat-LoRA/resolve/main/assets/community_mounted_combat.mp4
- Despliegue en la nube (优云智算, BUNNY-H3 动态工坊): https://www.compshare.cn/images/pGTycUluzvKd
- Flujo de trabajo en RunningHub, modo primer/último fotograma: https://www.runninghub.ai/zh-cn/post/2093321887345819650/
- Flujo de trabajo en RunningHub, modo multiparámetro: https://www.runninghub.ai/zh-cn/post/2093328847935950849/
- Escalado de dos pasadas FL2VA/REF2VA en RunningHub: https://www.runninghub.ai/zh-cn/post/2095927034992533505/
