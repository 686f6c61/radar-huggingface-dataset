# JOKER141/BUNNY-H3-Semantic-Bridge

## Resumen

BUNNY-H3-Semantic-Bridge es un adaptador de condicionamiento (conditioning adapter) para el modelo de generación de vídeo MiniMax-H3, desarrollado por el usuario JOKER141. No es un modelo generativo independiente, sino un "puente semántico" que se inserta en la ruta de `CONDITIONING` de MiniMax-H3 dentro de ComfyUI para mejorar la coherencia semántica de las secuencias generadas, especialmente en escenas de alta dinámica con múltiples actores, combate y movimiento complejo.

El adaptador aborda un problema concreto de los modelos text-to-video: la pérdida de atribución de acciones y estados cuando la escena implica movimiento rápido, oclusiones, intercambio de posiciones o interacción entre varios personajes. BUNNY V2 se ha reentrenado desde cero con un conjunto de 133.200 registros que cubren 29 familias semánticas de alta dinámica (persecuciones, derribos, rebotes, herencia de momento, recuperación de armas, relaciones vehículo-ocupante, etc.), de las cuales 26 se usan para entrenamiento y 3 se excluyen por su naturaleza causal-secuencial.

El resultado es un componente ligero (repo de 0,2 GB) que se aplica con un valor de `alpha` bajo (0,10-0,15) sobre el modelo base MiniMax-H3, sin sustituirlo. Su relevancia radica en que permite ajustar el comportamiento semántico del generador de vídeo sin reentrenar el modelo completo, integrándose directamente en el flujo de trabajo de ComfyUI mediante un nodo personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de condicionamiento (conditioning adapter) sobre MiniMax-H3; no es un transformer generativo independiente |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors (`BUNNY_H3_ActionLogic_Bridge_V1.safetensors`) |
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Pipeline | text-to-video |
| Tamano del repositorio | 0,2 GB |
| Libreria | minimax-h3 |
| Entorno de ejecucion | ComfyUI (nodo personalizado) |

## Arquitectura y entrenamiento

BUNNY-H3-Semantic-Bridge no es un modelo de difusión ni un transformer completo, sino un adaptador que opera sobre el espacio de condicionamiento de MiniMax-H3. Se inserta entre la salida de condicionamiento de H3 y el nodo downstream original, recibiendo y devolviendo tensores de tipo `CONDITIONING`. Su funcionamiento se controla mediante los parametros `alpha` (intensidad de la modulacion, recomendado 0,10-0,15), `magnitude_match` (configurado como `per_token`) y un flag `enabled`.

El entrenamiento de V2 se reconstruyo por completo respecto a V1. El conjunto de datos contiene 133.200 registros: 109.200 casos duros de alta dinamica y 24.000 anclas de preservacion (preservation anchors) destinadas a evitar que el adaptador degrade el comportamiento base del modelo. Cubre 29 familias semanticas de alta dinamica, con 26 usadas en entrenamiento y 3 familias de tipo Sequence-Causal excluidas deliberadamente. Los conceptos cubiertos incluyen persecucion, adelantamiento, frenada y recuperacion, perdida y recuperacion de arma, reidentificacion tras oclusion, herencia de momento, derribo, rebote, captura, orientacion relativa, geometria de rebote de proyectiles, fusion de rutas, relevo entre multiples actores, relaciones de cobertura, herencia de estado de combate, rutas de parkour, aterrizaje vertical, relaciones vehiculo-pasajero, interception aerea, rebote en pared y ordenacion de acciones multi-actor.

Durante el desarrollo se realizo una fase de cribado (screening) con 576 pares de entrenamiento, 144 pares de validacion y 30 combinaciones de capas SenseNova → H3, con el objetivo de encontrar mapeos de capas que funcionaran mejor para relaciones de accion en lugar de reutilizar directamente una unica configuracion. El proyecto se basa en la direccion de investigacion abierta por speach1sdef178 / MiniMax-H3-Semantic-Bridge, que exploraba composicion, relaciones espaciales, conteo, materiales, reflexion, transparencia y oclusion; BUNNY V1 desplaza el foco hacia logica de accion de alta dinamica y escenas multijugador complejas.

## Capacidades

- Mejora de la atribucion sujeto-accion-estado en escenas complejas: ayuda a H3 a distinguir quien hace que, quien interactua con quien y a quien pertenece cada objeto.
- Correccion de errores de propiedad de accion: reduce la confusion entre atacante y objetivo.
- Correccion de propiedad de armas y objetos: mantiene la asignacion de utileria entre personajes a lo largo de la secuencia.
- Continuidad espacial tras movimientos e intercambios de posicion: preserva la coherencia de ubicacion relativa entre actores.
- Recuperacion de identidad y estado tras oclusion: mantiene la identidad del personaje y su estado cuando desaparece temporalmente del plano.
- Continuidad de entorno y seguimiento de prompt: mejora la adherencia al texto descriptivo en escenas de alta dinamica.
- Razonamiento de cadena causal larga: herencia de momento, rebotes, derribos, capturas y relevos entre multiples actores.
- Logica de proyectiles: geometria de rebote y trayectorias balisticas.
- Relaciones vehiculo-ocupante y aterrizaje vertical.
- Integracion como nodo de ComfyUI con entrada y salida `CONDITIONING`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM; su dominio es exclusivamente la generacion de video.

## Casos de uso

- Generacion de escenas de combate cuerpo a cuerpo: el adaptador mantiene la atribucion de atacante y objetivo y la continuidad de estado (quien esta derribado, quien se recupera) a lo largo de la secuencia, un escenario donde el modelo base tiende a confundir roles.
- Coreografias de persecucion y adelantamiento: con los conceptos de pursuit, overtaking y braking-retaking entrenados, permite generar secuencias donde los vehiculos o personajes mantienen posiciones relativas coherentes tras maniobras de alta velocidad.
- Escenas de parkour y rutas verticales: el adaptador ayuda a preservar la ruta de movimiento y el aterrizaje vertical entre planos, reduciendo saltos de continuidad espacial.
- Recuperacion de identidad tras oclusion en escenas multijugador: util para planos con multiples personajes que se cruzan o se ocultan, donde el modelo base pierde la identidad o el estado de cada uno.
- Logica de proyectiles y rebotes: genera trayectorias con geometria de ricochet y rebote en pared coherentes, util para escenas de accion con disparos o impactos.
- Relaciones vehiculo-ocupante: mantiene la asignacion entre un vehiculo y sus pasajeros durante maniobras, relevante en secuencias de accion con transporte.
- Prototipado rapido en ComfyUI: al ser un adaptador ligero (0,2 GB) con `alpha` ajustable, permite iterar sobre la coherencia semantica de un pipeline de text-to-video existente sin reentrenar el modelo base ni cambiar de flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FVD, CLIP score, VBench u otros) en la informacion disponible. La model card describe mejoras cualitativas en atribucion de acciones, continuidad espacial y recuperacion tras oclusion, pero no aporta metricas numericas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma aislada; el adaptador (0,2 GB) se suma a los requisitos del modelo base MiniMax-H3, que no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible. Depende enteramente de los requisitos de MiniMax-H3.
- Compatibilidad con GPU de consumo: no disponible. El adaptador es ligero, pero el modelo base condiciona el requisito total.
- Opciones de despliegue: ComfyUI con el nodo personalizado `BUNNY_H3_Conditioning_Bridge` (o `bunny-h3-semantic-bridge` si se instala via ComfyUI Manager). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline text-to-video de este tipo.
- Latencia y throughput: no disponible. El adaptador anade una modulacion sobre el condicionamiento, pero no se publican cifras de sobrecoste.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BUNNY-H3-Semantic-Bridge (este) | Adaptador de condicionamiento para MiniMax-H3 | no disponible | no disponible | minimax-h3-community-license-agreement | Hugging Face, ComfyUI |
| MiniMax-H3 (base) | Modelo text-to-video | no disponible | no disponible | minimax-h3-community-license-agreement | Hugging Face |
| speach1sdef178 / MiniMax-H3-Semantic-Bridge | Adaptador de condicionamiento para MiniMax-H3 (proyecto original) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones numericas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: requiere MiniMax-H3 y ComfyUI para funcionar. No puede evaluarse de forma aislada.
- Un valor de `alpha` mas alto no implica mejor resultado; la model card advierte explicitamente que 0,10-0,15 es el rango recomendado y que valores superiores pueden degradar la generacion.
- Las 3 familias Sequence-Causal se excluyeron del entrenamiento, por lo que el comportamiento en esos casos no esta cubierto por el adaptador.
- Riesgo de sobreajuste a los 29 dominios semanticos entrenados: escenas fuera de ese espacio (persecuciones, combate, rebotes, parkour, vehiculos) pueden no beneficiarse o incluso sufrir interferencias.
- No hay informacion sobre sesgos demograficos, culturales o de representacion en los datos de entrenamiento.
- Riesgo de alucinacion visual inherente al modelo base MiniMax-H3; el adaptador mitiga errores de atribucion pero no elimina la generacion de contenido incoherente.
- La licencia es la MiniMax-H3 Community License Agreement, no una licencia open source estandar; es imprescindible revisar sus terminos antes de cualquier uso comercial.
- No se especifican idiomas soportados ni limitaciones de contexto; el adaptador opera sobre condicionamiento y no sobre texto de entrada de forma directa.
- El proyecto se basa en la direccion de investigacion de un tercero (speach1sdef178); conviene verificar la cadena de licencias y atribuciones.
- Repositorio pequeno (0,2 GB) y autor individual: menor garantia de mantenimiento a largo plazo que un proyecto corporativo.

## Enlaces

- Hugging Face: https://huggingface.co/JOKER141/BUNNY-H3-Semantic-Bridge
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Nodo ComfyUI (GitHub): https://github.com/aa335615543-ux/BUNNY_H3_Conditioning_Bridge
- Proyecto de investigacion original (speach1sdef178 / MiniMax-H3-Semantic-Bridge): no disponible como URL directa en la informacion proporcionada
