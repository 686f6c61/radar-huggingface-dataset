# PeterDAI/NoPeWorld

## Resumen

NoPeWorld es una coleccion de cabezas neuronales (heads) ligeras que se acoplan a modelos de mundo de video (video world models) congelados para evitar que la camara atraviese obstaculos durante la generacion. El modelo lo desarrolla PeterDAI y se publica bajo el identificador `PeterDAI/NoPeWorld` en Hugging Face. El problema que resuelve es concreto: los generadores de video de mundo, al ser autoregresivos por chunks, tienden a producir penetraciones de la camara en geometria solida; NoPeWorld anade una capa de seleccion de movimiento que puntua candidatos por seguridad e intencion antes de ejecutar el desplazamiento.

La innovacion es que no se modifica el generador original: cada head lee los estados ocultos del propio generador y evalua 34 desplazamientos candidatos de camara (la entrada del jugador, una parada, entradas mas cortas, giros y puntos sobre una elipse de intencion) con una probabilidad de seguridad y una puntuacion de intencion. Solo compiten los candidatos cuya probabilidad de seguridad alcanza el umbral tau, y se ejecuta el de mayor puntuacion de intencion; si ninguno cualifica, la camara se detiene. Cada head tiene entre 0,7 y 1,7 millones de parametros, lo que lo hace extremadamente ligero frente al generador al que acompana.

Es relevante ahora porque aborda un fallo estructural de los world models orientados a simulacion y robotica: la coherencia fisica del movimiento. Al publicarse como heads independientes con puntos de operacion calibrados por generador, permite evaluar y corregir varios modelos de mundo (LingBot-World 2.0, HY-WorldPlay, Echo-WM, Evoke-Turbo, WorldPlay2, Hy-Nomas) sin reentrenar los generadores base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heads de cross-attention sobre estados ocultos de un generador de video de mundo congelado; mapa aprendido por token de la anchura del generador a 128, LayerNorm y dos bloques de cross-attention (4 cabezas, anchura 128) sobre todos los tokens de los bloques muestreados, sin pooling |
| Parametros totales | 0,7 a 1,7 M por head (segun generador y modo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | base-model-terms; cada head hereda los terminos de su modelo base (ver limitaciones) |
| Formato de pesos | `head.pt` (state dict de PyTorch + config de arquitectura + punto de operacion) y `config.json`; manifiesto `manifest.json` con tamanos y sha256 |

## Arquitectura y entrenamiento

Cada head es un modulo pequeno que se engancha a bloques concretos del generador congelado. La arquitectura consiste en un mapa aprendido por token que proyecta la anchura del generador a 128 dimensiones, una LayerNorm y dos bloques de cross-attention con 4 cabezas y anchura 128 sobre todos los tokens de los bloques muestreados; no hay pooling. El head produce una probabilidad de seguridad y una puntuacion de intencion para cada uno de los 34 candidatos de desplazamiento de camara. La seleccion aplica el umbral de seguridad tau, el margen de conservacion delta y una temperatura T sobre la probabilidad de seguridad.

Existen dos modos de operacion. El modo `collision` lee los tokens del paso 0 del primer forward de denoising del chunk actual. El modo `prediction` lee los tokens del commit-pass del chunk anterior, de modo que la decision se toma antes de que empiece el chunk actual. Los bloques muestreados varian por generador: por ejemplo, LingBot-World 2.0 usa los bloques 30, 38 y 39 en modo collision y el 30 en prediction; HY-WorldPlay usa el 27 en collision y el 33 en prediction; Echo-WM usa el 42 y el 30; Evoke-Turbo usa el 20 en collision y no tiene head de prediction porque no conserva memoria entre chunks; WorldPlay2 usa el 30 (lectura congelada) y el 20; Hy-Nomas usa el 33 en ambos modos.

Todos los heads se entrenaron sobre las mismas 729 videos de entrenamiento (44 escenas de Unreal Engine, primera persona, obstaculos estaticos) durante 1.000 pasos de optimizador; los heads de HY-WorldPlay, Echo-WM, Evoke-Turbo y WorldPlay2 tambien usaron recortes con inicio posterior. Los puntos de operacion (T, tau, delta) se seleccionaron sobre los videos de validacion del propio generador: el menor regret entre los puntos cuya tasa de intervencion omitida es como maximo 0,10 (0,05 para el head collision de Echo-WM y ambos heads de WorldPlay2). No se especifica en la informacion disponible si hubo RLHF o DPO.

## Capacidades

- Seleccion de desplazamiento de camara seguro: puntua 34 candidatos (entrada del jugador, parada, entradas mas cortas, giros y puntos sobre una elipse de intencion) con probabilidad de seguridad y puntuacion de intencion.
- Prevencion de penetracion de obstaculos en la generacion de video de mundo, manteniendo el generador sin cambios.
- Dos modos de decision: `collision` (reactivo, sobre el chunk actual) y `prediction` (anticipativo, sobre el chunk anterior).
- Conservacion de la intencion del jugador: mantiene la entrada mientras cualifica y no la sustituye salvo que otro candidato la supere por mas de delta.
- Parada segura: cuando ningun candidato alcanza el umbral de seguridad, la camara se detiene.
- Compatibilidad con seis generadores distintos mediante heads especificos por generador y modo.
- No soporta generacion de texto, codigo, matematicas, vision general, tool calling, agentes ni capacidades multilingues: es un modulo de control de movimiento sobre un world model de video.

## Casos de uso

- Simulacion robotica y navegacion: el head en modo `prediction` decide el movimiento antes de que empiece el chunk, lo que permite integrar la senal de seguridad en bucles de planificacion de trayectorias en entornos con obstaculos estaticos.
- Evaluacion de world models: usar los heads como metrica objetiva de coherencia fisica (tasa de intervencion omitida y regret) para comparar generadores como LingBot-World 2.0, HY-WorldPlay o Echo-WM sobre el mismo benchmark.
- Generacion de video explorable para entrenamiento de agentes: el modo `collision` evita que la camara atraviese geometria durante la recoleccion de trayectorias sinteticas, mejorando la calidad de los datos de demostracion.
- Prototipado de videojuegos y experiencias interactivas: el control de camara con parada segura y conservacion de intencion mantiene la sensacion de control del jugador sin atravesar paredes.
- Investigacion en seguridad de modelos generativos: el esquema de puntuacion de candidatos con umbral y margen es un patron reutilizable para imponer restricciones fisicas a generadores congelados.
- Inspeccion virtual de escenas de Unreal Engine: recorridos en primera persona sobre escenas renderizadas donde la camara no debe penetrar obstaculos estaticos.
- Benchmark reproducible con NoPeBench: ejecutar `nopebench-download` y `nopeworld-infer` para evaluar un generador concreto con `--method nopeworld_collision` o el modo prediction sobre tareas definidas (`--task task2`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe el criterio de seleccion de puntos de operacion (menor regret con tasa de intervencion omitida maxima de 0,10, o 0,05 en los casos indicados), pero no incluye tablas de resultados numericos comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: los heads son minimos (0,7 a 1,7 M de parametros, del orden de unos pocos MB en fp32), por lo que el requisito dominante es la VRAM del generador de video base, no del head. No se dispone de cifras concretas del generador en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada; depende enteramente del generador de video de mundo al que se acople el head.
- Cabe en GPU consumer: el head en si cabe en cualquier GPU; la viabilidad en consumer depende del generador base, para el que no se aportan datos.
- Opciones de despliegue: el repositorio de codigo NoPeWorld (instalacion con `pip install -e .`) y las herramientas `nopebench-download` y `nopeworld-infer`; carga directa con `torch.load` y `nopeworld.head.model.load_head(path, device)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (heads de seguridad para world models de video) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Licencia restrictiva y heterogenea: cada head hereda los terminos de su modelo base. LingBot-World 2.0 es CC BY-NC-SA 4.0 (no comercial, share-alike); HY-WorldPlay y Hy-Nomas usan la licencia comunitaria de Tencent, que segun su License.txt "no se aplica en la Union Europea, Reino Unido y Corea del Sur" y esta limitada expresamente a su territorio; Echo-WM, Evoke-Turbo y WorldPlay2 se rigen por los terminos de sus respectivos repositorios (y WorldPlay2 tambien por los de su base Wan2.2).
- Restriccion territorial relevante para Espana: los heads de HY-WorldPlay y Hy-Nomas no pueden usarse en la Union Europea segun los terminos citados.
- Los generadores no se incluyen en el repositorio: hay que descargarlos por separado y apuntar `NOPE_GENERATORS` a ellos.
- Entrenamiento limitado a 44 escenas de Unreal Engine con obstaculos estaticos y camara en primera persona: no se documenta generalizacion a obstaculos dinamicos, otras perspectivas ni otros dominios visuales.
- Evoke-Turbo carece de head de prediction porque no conserva memoria entre chunks, lo que limita el modo anticipativo a ese generador.
- Riesgo de alucinacion del generador base: el head solo filtra el movimiento de camara, no corrige inconsistencias visuales o semanticas del video generado.
- Sesgos conocidos: no disponible.
- Limitaciones de idioma: no disponible (el modelo no procesa lenguaje).
- El articulo asociado figura como "TBD" en la cita, sin autores ni numero de arXiv confirmados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PeterDAI/NoPeWorld
- Repositorio de codigo NoPeWorld: no disponible en la informacion proporcionada (se referencia en la model card como "the NoPeWorld code repository", sin URL)
- Dataset NoPeBench: no disponible en la informacion proporcionada (se referencia su dataset card, sin URL)
- Paper "Towards Non-penetrating Video World Models": no disponible (cita con autor "TBD", journal "arXiv preprint", ano 2026, sin identificador)
