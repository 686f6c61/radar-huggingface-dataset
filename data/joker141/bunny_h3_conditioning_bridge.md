# JOKER141/BUNNY_H3_Conditioning_Bridge

## Resumen

BUNNY H3 Conditioning Bridge es un adaptador de condicionamiento semantico para el modelo de generacion de video MiniMax-H3, desarrollado por el usuario JOKER141. No es un modelo generativo autonomo, sino un puente que se inserta en la ruta de `CONDITIONING` de H3 para mejorar la coherencia semantica en escenas con movimiento complejo, multiples actores y cadenas causales largas. El repositorio ocupa 0,2 GB y se distribuye como un unico fichero `safetensors` que se carga desde un nodo personalizado de ComfyUI.

El adaptador se centra en resolver errores de atribucion y continuidad: quien ejecuta cada accion, a quien va dirigida, que objeto pertenece a cada sujeto, como se hereda el estado tras una oclusion o un intercambio de posiciones, y como se mantiene la continuidad espacial y ambiental entre fotogramas. La version V2 reconstruye por completo el pipeline de entrenamiento y amplia el alcance desde la logica de accion basica hacia un espacio semantico de alta dinamica mucho mas amplio.

Es relevante ahora porque los modelos de texto a video de gran escala tienden a fallar precisamente en esos aspectos cuando la escena gana complejidad: persecuciones, combate cuerpo a cuerpo, rebotes de proyectiles, transiciones de vehiculo a ocupante o reidentificacion tras oclusion. El adaptador propone una via de bajo coste (un fichero pequeno, un parametro `alpha` bajo) para corregir esos fallos sin reentrenar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de condicionamiento sobre MiniMax-H3 (modelo base text-to-video); arquitectura interna del adaptador no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se distribuye un unico fichero `safetensors` |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (heredada del modelo base) |
| Formato de pesos | safetensors (`BUNNY_H3_ActionLogic_Bridge_V1.safetensors`) |

## Arquitectura y entrenamiento

El adaptador actua sobre la condicionamiento de MiniMax-H3 mediante un mecanismo de "semantic bridge": recibe una entrada `CONDITIONING` y devuelve una salida del mismo tipo, de modo que se intercala entre el condicionamiento original de H3 y el nodo downstream sin alterar el grafo. El autor expone tres parametros de control: `adapter` (seleccion del fichero de pesos), `alpha` (intensidad de la modulacion, recomendado entre 0,10 y 0,15) y `magnitude_match` (con valor recomendado `per_token`). El autor advierte explicitamente que un `alpha` mas alto no es necesariamente mejor.

En cuanto al entrenamiento, la version V2 se reconstruyo desde cero y emplea un dataset de 133.200 registros: 109.200 casos duros de alta dinamica y 24.000 anclas de preservacion. Cubre 29 familias semanticas de alta dinamica, de las cuales 26 se usan para entrenamiento y 3 familias de tipo Sequence-Causal quedan excluidas. Los conceptos cubiertos incluyen persecucion, adelantamiento, frenada y recuperacion, perdida y recuperacion de arma, reidentificacion tras oclusion, herencia de momento, empuje, rebote, captura, orientacion relativa, geometria de rebote de proyectiles, fusion de rutas, relevo entre multiples actores, relaciones de cobertura, herencia de estado de combate, recuperacion de arma, routing de parkour, aterrizaje vertical, relacion vehiculo-pasajero, intercepcion aerea, rebote contra pared y ordenacion de acciones multi-actor.

El autor documenta una etapa de cribado especifica, la capa "Action Logic", en la que se evaluaron 576 pares de entrenamiento, 144 pares de validacion y 30 combinaciones de capas SenseNova → H3, con el objetivo de encontrar mapeos mejores para relaciones de accion en lugar de reutilizar directamente una unica configuracion. No se detalla la composicion exacta del dataset ni si hubo RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Modulacion del condicionamiento de MiniMax-H3 para mejorar la atribucion sujeto-accion-estado en escenas complejas.
- Correccion de errores de propiedad de personaje y accion (quien hace que).
- Correccion de confusiones entre atacante y objetivo.
- Correccion de errores de propiedad de armas y objetos.
- Mejora de la continuidad espacial tras movimientos o intercambios de posicion.
- Recuperacion de identidad y estado tras oclusion.
- Mejora del seguimiento de prompt y de la continuidad ambiental.
- Soporte de conceptos de alta dinamica: persecucion, adelantamiento, frenada y recuperacion, perdida y recuperacion de arma, herencia de momento, empuje, rebote, captura, orientacion relativa, geometria de rebote de proyectiles, fusion de rutas, relevo multi-actor, relaciones de cobertura, herencia de estado de combate, routing de parkour, aterrizaje vertical, relacion vehiculo-pasajero, intercepcion aerea y rebote contra pared.
- Integracion en ComfyUI mediante nodo personalizado, con entrada y salida de tipo `CONDITIONING`.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking; el adaptador opera exclusivamente sobre el pipeline text-to-video de H3.

## Casos de uso

- Generacion de escenas de combate cuerpo a cuerpo: el adaptador ayuda a H3 a mantener quien ataca y quien recibe, evitando el intercambio de roles entre personajes en planos con varios actores y movimiento rapido.
- Persecuciones y adelantamientos en video: con conceptos entrenados de persecucion, adelantamiento y frenada con recuperacion, el adaptador mejora la continuidad de la relacion espacial entre vehiculos o personajes a lo largo de la secuencia.
- Reidentificacion tras oclusion: en planos donde un personaje pasa detras de un obstaculo y reaparece, el adaptador refuerza la coherencia de identidad y estado para que el sujeto recuperado sea el mismo y conserve su estado previo.
- Escenas con armas y objetos: corrige errores de propiedad y de recuperacion de arma (quien la porta, quien la pierde y quien la recupera) en coreografias de accion.
- Trayectorias de proyectiles y rebotes: aplica la logica de geometria de rebote y rebote contra pared para que los proyectiles sigan trayectorias coherentes con la escena y los obstaculos.
- Relaciones vehiculo-pasajero y transiciones de montaje: mantiene la correspondencia entre un vehiculo y sus ocupantes cuando la camara cambia de plano o cuando un personaje sube o baja del vehiculo.
- Routing de parkour y aterrizajes verticales: ayuda a conservar la continuidad de ruta y la coherencia del aterrizaje en secuencias de movimiento vertical.
- Prototipado en ComfyUI: al ser un nodo que se inserta en la ruta de `CONDITIONING` existente, permite experimentar con mejoras semanticas sin modificar el resto del grafo ni reentrenar H3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 0,2 GB, por lo que el adaptador en si es ligero; el coste computacional dominante proviene del modelo base MiniMax-H3, no del adaptador.
- VRAM estimada para el adaptador: no disponible. Al ser un fichero de 0,2 GB, su huella en memoria es reducida en comparacion con el modelo base.
- VRAM estimada para el conjunto H3 + adaptador: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible. Depende de los requisitos del modelo base MiniMax-H3, que no se detallan en la informacion disponible.
- Compatibilidad con GPU de consumo: no disponible; condicionada por el modelo base.
- Opciones de despliegue: ComfyUI con el nodo personalizado `BUNNY_H3_Conditioning_Bridge` (o `bunny-h3-semantic-bridge` si se instala via ComfyUI Manager). El nodo no depende de un nombre de carpeta fijo; el fichero `BUNNY_H3_ActionLogic_Bridge_V1.safetensors` debe colocarse en la carpeta `models/` del directorio del nodo instalado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BUNNY H3 Conditioning Bridge (V2) | Adaptador de condicionamiento | MiniMax-H3 | Logica de accion de alta dinamica, combate, continuidad de movimiento | minimax-h3-community-license-agreement | Hugging Face, nodo ComfyUI |
| MiniMax-H3-Semantic-Bridge (speach1sdef178) | Adaptador de condicionamiento | MiniMax-H3 | Semantica amplia: composicion, relaciones espaciales, conteo, materiales, reflexion, transparencia, oclusion | no disponible | Referenciado como proyecto original |
| MiniMax-H3 | Modelo text-to-video | Propio | Generacion de video a partir de texto | minimax-h3-community-license-agreement | Hugging Face (MiniMaxAI/MiniMax-H3) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La comparativa se limita a enfoque, tipo de artefacto y licencia.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: requiere MiniMax-H3 y el nodo de ComfyUI para funcionar; no puede usarse de forma aislada.
- La licencia es la `minimax-h3-community-license-agreement` heredada del modelo base; las condiciones para uso comercial deben consultarse en el enlace de licencia del repositorio de MiniMax-H3, no se detallan en la informacion disponible.
- El autor advierte que un `alpha` mas alto no es necesariamente mejor; los valores recomendados son 0,10-0,15, y superarlos puede degradar el resultado.
- El adaptador se centra en escenas de alta dinamica y multi-actor; su beneficio en escenas estaticas o simples no esta documentado.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones cuantitativas de calidad; no hay benchmarks publicados en la informacion disponible.
- No se especifican los idiomas soportados; la model card esta redactada en ingles y chino, pero no se confirma el soporte multilingue del pipeline.
- La version V2 excluye deliberadamente 3 familias Sequence-Causal del entrenamiento, lo que puede implicar un comportamiento menos optimizado en esos casos.
- El repositorio es pequeno (0,2 GB) y el autor es un usuario individual; no hay evidencia de validacion independiente ni de soporte a largo plazo.
- No se dispone de informacion sobre cuantizaciones alternativas, latencia ni throughput en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JOKER141/BUNNY_H3_Conditioning_Bridge
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Nodo de ComfyUI (GitHub): https://github.com/aa335615543-ux/BUNNY_H3_Conditioning_Bridge
- Proyecto original de referencia (MiniMax-H3-Semantic-Bridge, autor speach1sdef178): no disponible como enlace directo en la informacion proporcionada
