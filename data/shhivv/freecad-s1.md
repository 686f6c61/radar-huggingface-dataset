# shhivv/freecad-s1

## Resumen

FreeCAD-S1 es un modelo de prediccion de siguiente accion para FreeCAD, desarrollado por el usuario shhivv y publicado en HuggingFace con licencia MIT. No es un modelo de lenguaje ni un modelo de vision: recibe el estado estructurado de una sesion de FreeCAD (arbol de operaciones, seleccion, banco de trabajo activo, restricciones de boceto, ultimos comandos) junto con un objetivo y puntua en una sola pasada hacia delante los comandos validos en ese instante. Con 1.228.163 parametros (aproximadamente 1,23 M, confirmados en el safetensors), el modelo infiere en torno a 1 ms en CPU, sin GPU.

El modelo resuelve un problema concreto dentro de la automatizacion CAD: convertir una lista ordenada de intenciones de diseno ("placa 40x30x10 -> agujero pasante de diametro 6 en (10, 0) -> patron polar x6 -> redondeo de aristas superiores r=1") en la secuencia concreta de comandos de FreeCAD (seleccionar plano, crear boceto, dibujar geometria, acotar, cerrar boceto, aplicar pad, etc.). Tambien sigue el progreso y corrige errores: deshace cambios fuera de plan, vuelve a seleccionar y cambia al banco de trabajo correcto.

Su relevancia actual radica en que se plantea como la capa rapida tipo "System 1" de un agente CAD, complementaria a un planificador mas lento. Al no usar LLM, no usar vision por capturas de pantalla y ejecutarse en CPU con latencia de milisegundos, resulta adecuado para bucles de control donde un modelo generativo seria demasiado costoso o lento. Es un modelo muy reciente (publicado en septiembre de 2026) y con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder de estado de 3 capas y decoder de 2 capas; modelo discriminativo de puntuacion de acciones, no generativo |
| Parametros totales | 1.228.163 (aproximadamente 1,23 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la entrada es una secuencia tipada de tokens de estado (estado global de sesion, un token por objeto del arbol de operaciones en orden de construccion, seleccion, ultimos 8 comandos, descriptores de la pieza objetivo e intenciones ordenadas del objetivo con marcador END) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` + `config.json`), libreria PyTorch |

## Arquitectura y entrenamiento

La arquitectura se compone de un encoder de estado Transformer de 3 capas cuyos tokens de estado no pueden atender a los tokens del objetivo. Cada intencion del objetivo predice si ya esta construida y la primera intencion no construida pasa a estar activa. Un decoder de 2 capas puntua las acciones candidatas contra el estado mas esa unica intencion activa. Entre las innovaciones tecnicas destacan los ordinales acoplados (la intencion k del objetivo se corresponde con la k-esima operacion solida del arbol), identificadores de posicion aleatorizados durante el entrenamiento y embeddings de categoria funcional con dropout de tipo.

El conjunto de acciones candidatas son 50 nombres reales de comandos de FreeCAD (`PartDesign_Pad`, `Sketcher_ConstrainLock`, etc.), pseudo-comandos `Select:*` y `Done`, filtrados en cada paso al conjunto actualmente valido (tipicamente entre 8 y 21 acciones). El entrenamiento se realizo sobre 24.000 episodios sinteticos generados por script en FreeCAD (aproximadamente 590.000 estados etiquetados), con ruido de acciones aleatorias inyectado para cubrir la recuperacion ante errores. Un experto programado basado en estado proporciona el conjunto de acciones aceptables y la perdida es NLL multi-etiqueta. Tras el entrenamiento supervisado se aplicaron 2 rondas de DAgger contra FreeCAD en vivo. El modelo aplica un softmax con temperatura ajustada (T = 2,55, almacenada en `config.json`) que no altera el orden de las acciones; se ajusto con 11.300 estados on-policy de semillas nuevas en todas las suites con un 20 % de acciones aleatorias inyectadas, repartidos por episodio, reduciendo el error de calibracion (ECE) de 0,042 a 0,027 y la NLL en held-out de 0,36 a 0,18, mientras que la confianza cuando el modelo se equivoca bajo del 97 % al 89 %.

## Capacidades

- Prediccion de la siguiente accion en FreeCAD: puntua comandos validos y devuelve un diccionario de probabilidades con el mejor primero.
- Conversion de intenciones de diseno ordenadas en secuencias concretas de comandos (seleccionar plano, crear boceto, dibujar geometria, acotar, cerrar boceto, pad, etc.).
- Seguimiento de progreso sobre el objetivo: identifica que intenciones ya estan construidas y activa la siguiente pendiente.
- Recuperacion de errores: deshace cambios fuera de plan, vuelve a seleccionar y cambia al banco de trabajo correcto.
- Generalizacion en longitud: maneja objetivos de 11 intenciones (aproximadamente 55 comandos), muy por encima del maximo de 5 visto en entrenamiento.
- Generalizacion a combinaciones no vistas de tipos de operacion (por ejemplo, `pocket_rect` seguido de patron polar, o `boss_box` combinado con un patron).
- Tolerancia a ruido: mantiene tasas altas de exito con un 20 % de acciones aleatorias inyectadas en el entorno.
- Prediccion calibrada: devuelve probabilidades por accion con temperatura ajustada.
- No dispone de generacion de texto, razonamiento en lenguaje natural, codigo, matematicas, vision ni audio.
- No dispone de tool calling ni function calling en el sentido habitual de los LLM; su interfaz es `policy.score(state, goal, actions)`.
- No se documenta soporte multilingue.

## Casos de uso

- Capa "System 1" de un agente CAD: un planificador lento (por ejemplo, un LLM) genera la lista ordenada de intenciones y los descriptores de la pieza objetivo; FreeCAD-S1 traduce cada intencion a comandos concretos en milisegundos sobre CPU, evitando el coste de invocar un modelo generativo en cada paso.
- Automatizacion por lotes en FreeCAD headless: el modelo permite ejecutar generaciones masivas de piezas parametricas dentro de FreeCAD 1.1 sin interfaz grafica, con presupuesto de pasos acotado, ideal para validacion de variantes de diseno o generacion de datasets CAD.
- Reparacion automatica de sesiones: cuando una accion introduce un cambio fuera de plan, el modelo lo deshace, vuelve a seleccionar y regresa al banco de trabajo correcto, lo que permite recuperar sesiones interactivas degradadas sin intervencion manual.
- Generacion de macros reproducibles: a partir de intenciones expresadas por un usuario o un planificador, el modelo produce la secuencia de comandos que puede registrarse como macro de FreeCAD, garantizando que el resultado final coincide con el objetivo.
- Verificacion de conformidad de procesos: la metrica de "zero-deviation" (el modelo nunca elige una accion que un experto rechazaria) permite auditar que una secuencia de modelado sigue un procedimiento aceptable, util en entornos con requisitos de trazabilidad.
- Banco de pruebas de planificadores CAD: el modelo sirve como ejecutor de referencia con una precision por paso del 99,84 % frente al conjunto de acciones aceptables del experto, de modo que un planificador puede evaluarse aislando errores de ejecucion de errores de planificacion.
- Asistente interactivo de bajo coste: al ejecutarse en CPU en torno a 1 ms por pasada, puede integrarse en estaciones de trabajo modestas dentro del propio proceso Python de FreeCAD, sin GPU ni dependencias de servicio externo.
- Evaluacion de robustez ante ruido: por sus tasas de exito con un 20 % de acciones aleatorias inyectadas, es adecuado para probar la tolerancia a fallos de un pipeline de automatizacion CAD antes de desplegarlo en produccion.

## Benchmarks y rendimiento

Los episodios se ejecutan en FreeCAD 1.1 headless sobre objetivos nuevos, 100 por suite. "Clean success" significa que el modelo emite `Done`, el solido final coincide con el objetivo (IoU volumetrico >= 0,99) y no quedan objetos sueltos. "Zero-deviation" exige ademas que el modelo nunca elija una accion que el experto rechazaria. El presupuesto de pasos es 2x el numero de pasos del experto + 6, duplicado cuando se inyectan acciones aleatorias.

| Suite | Novedad en test | Clean success | Zero-deviation | Clean success con 20 % de acciones aleatorias |
|---|---|---|---|---|
| iid L1 / L2 / L3 | dimensiones y condiciones iniciales | 100 / 100 / 100 | 100 / 100 / 100 | 100 / 93 / 95 |
| len | 6-7 intenciones (maximo de entrenamiento: 5) | 100 | 100 | 86 |
| len2 | 8-9 intenciones | 100 | 100 | 87 |
| len3 | 11 intenciones (aproximadamente 55 comandos) | 100 | 100 | 90 |
| comp3 | par no visto `pocket_rect -> polar pattern` | 100 | 100 | 97 |
| comp | `boss_box` junto con un patron | 100 | 100 | 96 |
| comp | par no visto `hole_std -> mirror` | 80 | 0 | 94* |
| comp2 | par no visto `boss_box -> mirror` | 100 | 0 | 94* |

\* El presupuesto de pasos duplicado permite que mas bucles de deshacer/reintentar terminen.

Datos adicionales de rendimiento:

- Precision por paso: 99,84 % frente al conjunto de acciones aceptables del experto, sobre estados iid en held-out.
- Version anterior (v2): en las mismas suites de longitud obtuvo un 0 % de clean success con 6-7 intenciones y un 0 % con 11 intenciones.
- Reutilizacion del conjunto de test, declarada por el autor: solo `comp3` se construyo tras una auditoria independiente y se evaluo exactamente una vez sobre este modelo. Las suites `len2` y `len3` informaron decisiones de arquitectura y de test, y `comp`/`comp2` informaron el diseno de tipos de operacion, por lo que deben tratarse como resultados de conjunto de desarrollo.
- Punto debil conocido: un `mirror` inmediatamente despues de un tipo de operacion no visto. En todos esos episodios el modelo deshace por error la operacion que acaba de construir cuando toca el paso de mirror, luego la reconstruye y reintenta. `comp2` llega al 100 % porque el presupuesto de pasos permite el reintento; en `hole_std -> mirror` el 20 % de los episodios agota el presupuesto. El mismo tipo de emparejamiento no visto con un patron (`comp3`) se maneja sin errores.
- Calibracion: ECE de 0,042 a 0,027 y NLL en held-out de 0,36 a 0,18; la confianza cuando el modelo se equivoca paso del 97 % al 89 %. La baja confianza no es un detector de errores fiable.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,9 MB en fp32 (1.228.163 parametros x 4 bytes) y aproximadamente 2,5 MB en fp16. Es una cifra despreciable frente a cualquier modelo generativo.
- GPU recomendadas: no aplica; el autor indica que la inferencia se ejecuta en CPU en torno a 1 ms por pasada hacia delante. Cualquier GPU (RTX 4090, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo, e incluso no requiere GPU.
- Opciones de despliegue: el modelo se carga mediante el paquete `freecad_s1` del repositorio de codigo del autor (`from_pretrained("shhivv/freecad-s1")` con `policy = Policy(model, device="cpu")`). Se descargan `model.safetensors` y `config.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Evaluacion sobre FreeCAD en vivo: `python -m freecad_s1.evaluate --ckpt shhivv/freecad-s1 --suites iid comp comp2 comp3 len len2 len3 --episodes 100`.
- Latencia y throughput: aproximadamente 1 ms por pasada hacia delante en CPU segun el autor; no se publican cifras de throughput agregado ni de latencia en GPU.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos comparables publicados de prediccion de siguiente accion para FreeCAD. La unica referencia de comparacion disponible es la version anterior del propio modelo:

| Modelo | Parametros | Clean success con 6-7 intenciones | Clean success con 11 intenciones | Licencia |
|---|---|---|---|---|
| FreeCAD-S1 (esta version) | 1,23 M | 100 | 100 | MIT |
| FreeCAD-S1 v2 (version anterior) | no disponible | 0 | 0 | no disponible |

No hay datos de otros modelos competidores, ni de sus parametros, contexto, rendimiento, licencia o disponibilidad.

## Limitaciones y advertencias

- Necesita los descriptores de la pieza objetivo: el objetivo incluye la caja envolvente, el volumen y el numero de caras/aristas de la pieza acabada. La model card esta truncada en ese punto ("bbox, volume and face/edge c"), por lo que el detalle completo de este requisito no esta disponible.
- Punto debil confirmado: si un `mirror` sigue a un tipo de operacion no visto, el modelo deshace la operacion recien construida y la reconstruye antes de reintentar. En `hole_std -> mirror` el 20 % de los episodios agota el presupuesto de pasos y no alcanza el exito limpio, con un 0 % de zero-deviation.
- La baja confianza no es un detector de errores fiable, segun el propio autor, pese a la mejora de calibracion.
- Reutilizacion del conjunto de test declarada: los resultados de `len2`, `len3`, `comp` y `comp2` deben considerarse de conjunto de desarrollo, no de test limpio.
- Entrenamiento exclusivamente sobre episodios sinteticos generados por script (24.000 episodios, aproximadamente 590.000 estados) en FreeCAD 1.1 headless; el comportamiento fuera de esa distribucion de tareas no esta caracterizado.
- Requiere el paquete `freecad_s1` (runtime, featurizer y codigo del modelo) del repositorio de codigo del autor; no es utilizable de forma autonoma solo con los pesos.
- Espacio de acciones cerrado: 50 nombres de comando de FreeCAD mas pseudo-comandos `Select:*` y `Done`. Cualquier comando fuera de ese conjunto no puede seleccionarse.
- No procesa lenguaje natural, imagenes ni audio, por lo que no sirve como interfaz directa para usuarios finales sin un planificador externo.
- Modelo con 0 descargas y 0 likes en el momento de redactar la ficha; no hay validacion independiente de terceros.
- Licencia MIT, que permite uso comercial y modificacion, pero la model card no incluye clausulas adicionales ni avisos sobre los datos de entrenamiento (generados sinteticamente por el propio autor).
- No se documentan sesgos conocidos ni se especifican los idiomas soportados, dado que el modelo no opera sobre texto.

## Enlaces

- HuggingFace: https://huggingface.co/shhivv/freecad-s1
- Repositorio de codigo del paquete `freecad_s1` (runtime, featurizer, modelo): no disponible en la informacion proporcionada
- Paper o publicacion tecnica: no disponible
- Blog o articulo del autor: no disponible
- Demo o espacio interactivo: no disponible
