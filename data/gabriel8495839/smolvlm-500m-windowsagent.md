# Gabriel8495839/SmolVLM-500M-WindowsAgent

## Resumen

SmolVLM-500M-WindowsAgent es un ajuste fino del modelo multimodal SmolVLM-500M-Instruct, publicado por el usuario Gabriel8495839, orientado a control autonomo de escritorio en Windows 11 (la categoria conocida como Computer Use u OS Agent). El modelo recibe una captura de pantalla RGB y una instruccion en lenguaje natural, y genera acciones estructuradas de raton y teclado que se ejecutan sobre la interfaz grafica del sistema, sin necesidad de APIs internas ni acceso privilegiado al sistema operativo. El checkpoint publicado corresponde al paso 1600 de un entrenamiento supervisado y se etiqueta como version `v0`, centrada en primitivas del shell de Windows.

Arquitectura y tamano: se apoya en la familia SmolVLM (Idefics3), con un backbone de texto SmolLM2-360M y un codificador visual SigLIP-400M. Los pesos fusionados suman aproximadamente 554 millones de parametros segun el autor, mientras que los safetensors publicados declaran 507.482.304 parametros. El modelo se distribuye en `bfloat16` sin cuantizar, con una huella de inferencia de aproximadamente 1,1 GB de VRAM o RAM, lo que lo situa en el rango de modelos ejecutables en CPU y en cualquier GPU moderna de gama de consumo.

Su relevancia es doble: por un lado, demuestra que el control de escritorio multimodal es viable con modelos de menos de 600 millones de parametros, algo poco habitual en una categoria donde predominan modelos de 3B a 72B; por otro, publica una receta de ajuste (LoRA de proyeccion completa fusionada) y una evaluacion por familias de tareas sobre entornos reales, con una tasa de validez sintactica del 100 % en mas de 400 episodios de evaluacion. El modelo no ha recibido descargas ni "likes" en HuggingFace en el momento de la consulta, por lo que se trata de un artefacto reciente y poco validado por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLM (Idefics3): backbone de texto SmolLM2-360M + codificador visual SigLIP-400M |
| Parametros totales | 507.482.304 segun safetensors del repo; el autor declara ~554 millones en pesos fusionados independientes |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no se publican variantes cuantizadas; el checkpoint se distribuye en `bfloat16` sin comprimir |
| Idiomas soportados | en, de (segun los metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Resolucion visual de entrada | 1280 x 800 RGB (viewport nativo de 2560 x 1600 escalado con `?fit=1`) |
| Sistema de coordenadas | absoluto, x en [0, 1280], y en [0, 800] |
| Contexto multiturno | plantilla de chat con historial de ejecucion (`actions_so_far`) entre episodios |
| Metodo de ajuste | LoRA de proyeccion completa, r=64, alpha=128, sobre las 7 proyecciones de las 32 capas del transformer, fusionada con `merge_and_unload` |
| Tamano del repositorio | 1,0 GB |
| Etapa de publicacion | `v0` (Windows Shell & System Primitives) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SmolVLM de tipo Idefics3: un transformer de texto SmolLM2-360M acoplado a un codificador visual SigLIP-400M mediante proyecciones que mapean los embeddings visuales al espacio del modelo de lenguaje. Soporta secuencias arbitrarias de imagenes y texto como entrada y produce texto como salida. En este ajuste, la entrada es una captura de pantalla a 1280 x 800 mas una instruccion, y la salida es una accion en sintaxis funcional tipo Python. El autor indica que el checkpoint se mantiene en `bfloat16` sin cuantizar deliberadamente, para preservar precision subpixel en la prediccion de coordenadas (`x` e `y` absolutos en el viewport).

El entrenamiento consiste en un ajuste supervisado (SFT) sobre el modelo instruct base, con una LoRA de rango 64 y alpha 128 aplicada a las 7 proyecciones de las 32 capas del transformer, posteriormente fusionada en los pesos finales mediante `merge_and_unload`. El checkpoint publicado corresponde al paso 1600 de entrenamiento. No se detalla en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se documenta ninguna tecnica de decodificacion especulativa, atencion lineal u otra innovacion de inferencia; el elemento diferencial es la propia receta de ajuste y la definicion de un espacio de acciones cerrado.

El espacio de acciones es una gramatica funcional de ocho primitivas: `click(x, y)`, `type("texto")`, `key("Enter")` o combinaciones como `key("ctrl+s")`, `drag(x1, y1, x2, y2)`, `scroll(n)` con valores negativos para bajar, `wait(segundos)`, `done()` y `finished_with_error("motivo")`. El autor reporta un 100,0 % de validez sintactica en mas de 400 episodios de evaluacion, sin errores de sintaxis ni tokens invalidos.

## Capacidades

- Generacion de acciones estructuradas de control de escritorio a partir de capturas de pantalla: clic, escritura, pulsaciones de tecla simple y combinada, arrastre, scroll, espera y finalizacion de tarea.
- Segmentacion de tareas en pasos multiples con memoria de acciones previas mediante la plantilla de chat y el campo `actions_so_far`.
- Reconocimiento visual de elementos de interfaz de Windows 11: boton de inicio, menus contextuales, bandeja del sistema, barra de tareas, iconos de escritorio, dialogos (Win+R) y ventanas de aplicaciones.
- Deteccion de imposibilidad de tarea: la accion `finished_with_error("motivo")` permite abortar cuando el estado del sistema no permite completar el objetivo.
- Generalizacion zero-shot limitada a flujos no vistos durante el entrenamiento (Explorador de archivos, Bloc de notas, movimiento de ventanas), con un 28,1 % de exito completo y puntuaciones de alineacion de pasos entre 0,80 y 1,00 en varias familias.
- Entrada multimodal imagen-texto: acepta imagenes y texto de forma arbitraria, no solo capturas de pantalla completas.
- Soporte multilingue declarado en ingles y aleman.
- No se documenta soporte de tool calling generico, function calling externo a la gramatica de acciones, vision mas alla de la captura de pantalla, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Automatizacion de tareas repetitivas en Windows 11: el modelo puede ejecutar secuencias como abrir el menu de inicio, lanzar aplicaciones, escribir comandos en el dialogo Win+R o desanclar elementos de la barra de tareas, con una tasa de exito del 100 % en varias de estas familias en la evaluacion publicada.
- Pruebas de regresion de interfaz (UI testing): dado que traduce instrucciones en lenguaje natural a acciones deterministas sobre coordenadas absolutas, puede utilizarse para reproducir flujos de usuario en entornos de CI con maquinas virtuales Windows, sustituyendo scripts fragiles basados en selectores.
- Agente de asistencia remota para soporte tecnico: un operador podria describir en lenguaje natural la tarea a realizar ("abre el Administrador de tareas", "desactiva el Wi-Fi") y el modelo ejecutaria los pasos sobre la sesion del usuario, con la accion `finished_with_error` como via de escape cuando el estado no lo permita.
- Automatizacion de configuracion de equipos: aprovisionamiento de estaciones de trabajo mediante instrucciones de alto nivel que el modelo traduce a clics y atajos sobre paneles de Configuracion y menus administrativos (Win+X).
- Orquestacion local en el borde: con una huella de 1,1 GB, puede ejecutarse en el propio equipo del usuario sin enviar capturas de pantalla a servicios externos, lo que resulta relevante para entornos con requisitos de privacidad o sin conectividad.
- Prototipado de investigacion en Computer Use: sirve como linea base ligera para comparar recetas de ajuste, espacios de acciones y estrategias de evaluacion frente a modelos mucho mayores, con un coste de inferencia minimo.
- Gestion de archivos asistida en el Explorador: crear documentos de texto mediante el menu contextual, eliminar elementos, abrir "Este equipo" o alternar paneles de detalles, flujos que el modelo resuelve al 100 % en modo zero-shot segun la evaluacion.
- Educacion y demostraciones: permite ilustrar en un portatil de gama media como funciona un agente de escritorio multimodal sin necesidad de GPU dedicada de datacenter.

## Benchmarks y rendimiento

Los unicos datos publicados son la evaluacion propia del autor sobre entornos reales de Windows 11 en el paso 1600, con 64 episodios de evaluacion. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

| Metrica | Resultado |
|---|---|
| Validez sintactica de acciones (mas de 400 episodios) | 100,0 % (0 acciones invalidas) |
| Level 0 (shell y sistema Windows) - exito completo | 65,6 % (21/32) |
| Level 0 - puntuacion media de alineacion de pasos | 0,74 |
| Level 1 (generalizacion zero-shot, sin entrenamiento) - exito completo | 28,1 % (9/32) |
| Level 1 - puntuacion media de alineacion de pasos | 0,64 |

Desglose por familia de tareas en Level 0:

| Familia de tarea | Descripcion | Exito | Alineacion | Estado |
|---|---|---|---|---|
| `open_start_menu` | Boton de inicio y apertura de menu | 100,0 % (3/3) | 1,00 | Resuelta |
| `desktop_settings_link` | Menu contextual del escritorio -> Personalizar | 100,0 % (3/3) | 1,00 | Resuelta |
| `run_cancel` | Cancelacion del dialogo Win+R | 100,0 % (3/3) | 1,00 | Resuelta |
| `open_task_manager_menu` | Win+X -> Administrador de tareas | 75,0 % (3/4) | 0,54 | Resuelta |
| `unpin_from_taskbar` | Desanclar desde el menu de la barra de tareas | 75,0 % (3/4) | 0,75 | Resuelta |
| `quick_toggle` | Alternar Wi-Fi / Bluetooth en la bandeja | 50,0 % (2/4) | 0,75 | Resuelta |
| `open_flyout` | Centro de acciones / notificaciones | 50,0 % (2/4) | 0,50 | Resuelta |
| `open_recycle_bin` | Apuntar al icono de la papelera | 33,3 % (1/3) | 0,33 | Activa |
| `winx_menu_pages` | Subpaginas administrativas de Win+X | 25,0 % (1/4) | 0,88 | Activa |

Desglose de flujos zero-shot en Level 1 (nunca vistos en entrenamiento):

| Familia de flujo | Exito zero-shot | Alineacion |
|---|---|---|
| `window_move` (arrastrar barra de titulo) | 100,0 % (1/1) | 1,00 |
| `explorer_open_this_pc` | 100,0 % (1/1) | 1,00 |
| `explorer_delete` | 100,0 % (1/1) | 1,00 |
| `explorer_new_text` | 100,0 % (1/1) | 1,00 |
| `explorer_details_button` | 100,0 % (1/1) | 1,00 |
| `desktop_icon_size` | 100,0 % (1/1) | 1,00 |
| `notepad_new_tab` | 100,0 % (1/1) | 0,80 |
| `notepad_open_file` | 100,0 % (1/1) | 0,92 |
| `open_app` (busqueda o barra de tareas) | 100,0 % (1/1) | 1,00 |

Nota metodologica: cada familia de Level 1 cuenta con un unico episodio, por lo que los porcentajes del 100 % no tienen significacion estadistica y deben interpretarse como indicios cualitativos, no como tasas robustas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en `bfloat16`, segun el autor. Es una cifra que incluye pesos y overhead de activaciones razonable para entradas de 1280 x 800.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM. No requiere A100 ni H100; el modelo esta disenado para hardware de consumo.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y GPUs de portatil de gama media. Tambien se ejecuta en CPU, en cuyo caso la latencia dependera del numero de nucleos disponibles.
- Almacenamiento: el repositorio ocupa 1,0 GB, por lo que basta con ese espacio en disco para el checkpoint completo.
- Opciones de despliegue: al ser un modelo Idefics3, es compatible con `transformers` (clase `AutoModelForVision2Seq` y `Idefics3ForConditionalGeneration`). No se publican archivos GGUF ni conversiones para llama.cpp u Ollama, por lo que su uso con esas herramientas requeriria una conversion manual. vLLM ofrece soporte para Idefics3 en versiones recientes, aunque el autor no documenta configuracion alguna.
- Latencia y throughput: no disponible en la informacion proporcionada. El autor solo indica que "se ejecuta a alta velocidad en cualquier GPU moderna o CPU", sin cifras de tokens por segundo ni latencia por accion.
- Consideracion adicional: la inferencia incluye una captura de pantalla por paso, de modo que el coste real de un episodio depende tambien del bucle de captura y de la ejecucion de la accion, no solo del modelo.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base y con el resto de la familia SmolVLM citada en las busquedas. No se aportan datos de otros agentes de escritorio (por ejemplo, alternativas de mayor tamano orientadas a Computer Use), por lo que no se incluyen.

| Modelo | Parametros | Contexto | Entrada | Licencia | Orientacion | Disponibilidad |
|---|---|---|---|---|---|---|
| SmolVLM-500M-WindowsAgent | 507,5 M (safetensors) / ~554 M declarados | no disponible | Imagen + texto, 1280 x 800 | apache-2.0 | Agente de escritorio Windows 11 con gramatica de acciones cerrada | HuggingFace, safetensors, 0 descargas |
| SmolVLM-500M-Instruct | ~500 M | no disponible en la informacion proporcionada | Imagen + texto | apache-2.0 | Modelo multimodal instruct generalista | HuggingFace |
| SmolVLM-256M-Instruct | ~256 M | no disponible | Imagen + texto | apache-2.0 | Modelo multimodal ultraligero para dispositivos restringidos | HuggingFace |

Frente al modelo base, la diferencia principal no es de tamano sino de comportamiento: SmolVLM-500M-Instruct genera texto libre, mientras que este ajuste restringe la salida a un espacio de acciones ejecutables y anade memoria de acciones previas. El coste de esa especializacion es la perdida de capacidades generales de conversacion y de generacion abierta.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado para Windows 11 y su `v0` cubre principalmente primitivas del shell. Fuera de ese dominio (macOS, Linux, aplicaciones web, moviles) no hay evidencia de funcionamiento.
- Rendimiento desigual por familia de tareas: dentro del propio Level 0 hay familias con un 25 % de exito (`winx_menu_pages`) o un 33,3 % (`open_recycle_bin`), lo que indica que el modelo no es fiable de forma uniforme ni siquiera en tareas de su propio nivel de entrenamiento.
- Muestra de evaluacion pequena: 64 episodios y familias de Level 1 con un solo episodio. Los porcentajes deben tratarse como indicativos.
- Riesgo de alucinacion de coordenadas: al predecir posiciones absolutas en un viewport de 1280 x 800, un error de pocos pixeles puede provocar clics en el elemento equivocado y, en un escritorio real, acciones destructivas (borrado de archivos, cambios de configuracion). Se recomienda ejecucion en maquina virtual o entorno aislado, con confirmacion humana en operaciones irreversibles.
- Dependencia de la resolucion y del escalado: el modelo asume un viewport de 1280 x 800 obtenido escalando una pantalla nativa de 2560 x 1600 con `?fit=1`. Capturas con otra relacion de aspecto, densidad de pixeles o temas visuales distintos pueden degradar la precision.
- Idiomas: solo se declaran ingles y aleman. Las instrucciones en castellano no estan soportadas de forma explicita.
- Ausencia de datos sobre sesgos: no se documenta analisis de sesgos ni de comportamientos indeseados.
- Uso comercial: la licencia apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantias y con 0 descargas y 0 "likes", es decir, sin validacion independiente por parte de la comunidad.
- Sin cuantizaciones oficiales: no hay GGUF ni variantes de 8 o 4 bits publicadas, lo que limita las opciones de despliegue en herramientas que dependen de esos formatos.
- Fecha de publicacion inusualmente futura en los metadatos (2026-09-27), lo que conviene verificar antes de integrarlo en un pipeline de produccion.
- Sin soporte de tool calling generico: las salidas estan limitadas a la gramatica de ocho acciones; cualquier integracion externa requiere un interprete propio.
- No se documentan tasas de fallo silencioso: una accion sintacticamente valida puede ser semanticamente incorrecta, algo que la metrica de validez sintactica del 100 % no captura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gabriel8495839/SmolVLM-500M-WindowsAgent
- Modelo base SmolVLM-500M-Instruct: https://huggingface.co/HuggingFaceTB/SmolVLM-500M-Instruct
- Blog de HuggingFace sobre SmolVLM 256M y 500M: https://huggingface.co/blog/smolervlm
- Repositorio GitHub del proyecto SmolLM/SmolVLM: https://github.com/huggingface/smollm
- Fuente del blog en GitHub: https://github.com/huggingface/blog/blob/main/smolervlm.md
- Articulo divulgativo sobre SmolVLM: https://medium.com/@uzbrainai/smolvlm-the-future-of-lightweight-multimodal-models-on-your-device-291d92ae0698
- Paper o informe tecnico del autor del ajuste: no disponible
- Demo interactiva: no disponible
- Repositorio de codigo del ajuste: no disponible
