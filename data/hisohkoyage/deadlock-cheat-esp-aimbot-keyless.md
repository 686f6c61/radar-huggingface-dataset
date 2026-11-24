# Hisohkoyage/deadlock-cheat-esp-aimbot-keyless

## Resumen

El repositorio `Hisohkoyage/deadlock-cheat-esp-aimbot-keyless` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuido a traves de Hugging Face que, segun su propia model card, ofrece una herramienta de trampas ("cheat") para el videojuego Deadlock: un aimbot con ESP (deteccion de enemigos a traves de paredes) para Windows. El artefacto real es un ejecutable comprimido (`deadlock-cheat-esp-aimbot-keyless-v1.2.0-win64.zip`, 8,9 MB) alojado en un repositorio de GitHub externo, no pesos de red neuronal.

El "modelo" no tiene arquitectura, parametros, contexto ni datos de entrenamiento: no es un modelo de lenguaje ni un sistema de IA. Los tags de Hugging Face (windows, x64, portable, en/ru/zh/es...) describen la plataforma y los idiomas de la interfaz del ejecutable, no capacidades linguisticas de un modelo. La licencia declarada es MIT, aunque esta se refiere al paquete, no a un conjunto de pesos.

Es relevante advertir que este tipo de publicaciones son frecuentes en Hugging Face como vector de distribucion de software potencialmente malicioso (malware, mineros, stealers disfrazados de utilidades). La model card incluye instrucciones para desactivar o ignorar avisos de Windows Defender y SmartScreen, una senal de alarma clasica. No debe tratarse como un modelo evaluable ni ejecutarse en entornos de produccion o de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (idiomas de la interfaz del ejecutable, no del modelo) |
| Licencia | MIT (declarada en el repositorio) |
| Formato de pesos | no disponible (artefacto distribuido como ZIP con un .exe; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El contenido descrito en la model card es un binario de Windows (`deadlock-cheat-esp-aimbot-keyless-v1.2.0-win64.exe`, compilacion `v2.7.7`, hash `0FE2E0`) que, segun el autor, implementa un "core externo en modo usuario", escaneo dinamico de offsets de memoria, overlay externo a 144 Hz y suavizado de entrada Bezier. Estos terminos describen tecnicas de manipulacion de memoria de un videojuego (lectura de estructuras del proceso de Deadlock, renderizado de cajas y esqueletos, control del raton), no componentes de aprendizaje automatico.

No hay dataset, tokens, RLHF ni innovacion tecnica en el sentido de un modelo fundacional. La unica "innovacion" declarada es la ausencia de clave ("keyless") y la operacion externa sin inyeccion de DLL en el proceso del juego. Toda esta descripcion proviene exclusivamente de la model card del autor y no es verificable de forma independiente.

## Capacidades

- No es un modelo de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de un LLM; los idiomas listados corresponden a la interfaz del ejecutable.
- Capacidad declarada (no verificada): ESP con cajas 2D/3D, esqueletos de huesos y distancia; aimbot con radio FOV configurable y curvas humanizadas; perfiles JSON intercambiables en caliente; tecla de panico (`END`) para descarga.
- No dispone de modo "thinking", vision, audio ni ninguna capacidad propia de un modelo de IA.

## Casos de uso

No se identifican casos de uso legitimos para un modelo de IA. El artefacto es una herramienta de trampas para un videojuego multijugador, lo que conlleva riesgos legales y de seguridad. A continuacion se describen escenarios en los que este repositorio puede aparecer, junto con la advertencia correspondiente:

- Investigacion de seguridad: analizar el binario en una maquina virtual aislada y sin red para estudiar tecnicas de evasion de Defender o de lectura de memoria de procesos, con fines defensivos y documentados.
- Formacion en deteccion de malware: usar la model card como ejemplo de ingenieria social (botones de descarga, contrasena en el ZIP, instrucciones para desactivar antivirus) en cursos de concienciacion.
- Analisis de politicas de plataformas: estudiar como Hugging Face y GitHub gestionan la publicacion de artefactos que no son modelos, para proponer mejoras en la moderacion.
- Auditoria de cadena de suministro: revisar dependencias y enlaces externos de un repositorio que redirige a un GitHub de terceros con releases binarios.
- Respuesta a incidentes: documentar indicadores de compromiso (URLs, hashes, nombres de fichero) si el binario se ha detectado en una red corporativa.
- Concienciacion sobre trampas en videojuegos: explicar a usuarios finales el riesgo de baneo y de robo de credenciales asociado a este tipo de descargas.

En ningun caso se recomienda ejecutar el binario en un equipo personal, de trabajo o con sesion iniciada en servicios de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni equivalentes, porque el artefacto no es un modelo de lenguaje. Las cifras que aparecen en la model card (97,4 % de consistencia, 98,3 %, menos de 16 ms de respuesta, menos de 59 MB de RAM) son afirmaciones del autor sin metodologia ni verificacion independiente, y no constituyen benchmarks reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 (22H2) y Windows 11 (24H2), x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card (menos de 16 ms, 144 Hz) no son verificables.
- Espacio en disco: 8,9 MB para el ZIP; el ejecutable extraido ocupa mas, aunque el autor no lo especifica.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Si se compara con otros repositorios de Hugging Face que distribuyen ejecutables o herramientas de juego, la comparacion carece de sentido tecnico en terminos de parametros, contexto o rendimiento. Frente a modelos fundacionales reales (por ejemplo, familias de 7B a 70B con licencias Apache 2.0 o Llama), la diferencia no es de rendimiento sino de naturaleza: aqui no hay modelo.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con las metricas habituales (perplejidad, MMLU, HumanEval).
- Riesgo de malware: la model card pide ignorar avisos de Windows Defender y SmartScreen y ejecutar como administrador, un patron habitual en la distribucion de software malicioso.
- Contrasena fija en el ZIP (`2026`): tecnica usada para evadir analisis automatico de antivirus y sandboxes.
- Redireccion a un repositorio de GitHub de terceros (`Lambert17018/...`) no vinculado al autor del repositorio de Hugging Face.
- Riesgo legal: el uso de trampas en Deadlock (Valve) puede vulnerar los terminos de servicio y acarrear el baneo permanente de la cuenta; en algunas jurisdicciones el desarrollo y distribucion de cheats tiene implicaciones legales.
- Riesgo de robo de credenciales: ejecutar binarios desconocidos como administrador expone tokens de sesion, cuentas de Steam y datos del sistema.
- Licencia MIT declarada, pero sin garantias y sin que el autor aporte codigo fuente verificable.
- Idiomas listados: solo describen la interfaz; no implican soporte linguistico de un modelo.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Hisohkoyage/deadlock-cheat-esp-aimbot-keyless
- Repositorio de GitHub referenciado en la model card (no verificado): https://github.com/Lambert17018/deadlock-cheat-esp-aimbot-keyless
- Release binaria referenciada: https://github.com/Lambert17018/deadlock-cheat-esp-aimbot-keyless/releases/latest
- Descarga directa del ZIP mencionada por el autor (no recomendada): https://github.com/Lambert17018/deadlock-cheat-esp-aimbot-keyless/releases/latest/download/deadlock-cheat-esp-aimbot-keyless-v1.2.0-win64.zip
