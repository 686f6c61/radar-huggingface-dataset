# hoomanrafinia/phasmophobia-fling-trainer

## Resumen

El repositorio `hoomanrafinia/phasmophobia-fling-trainer` no contiene un modelo de IA. Se trata de un artefacto alojado en Hugging Face que, segun su propia model card, distribuye un ejecutable de Windows (`delta-executor-pc-2026-v1.2.2-win64.exe`) empaquetado en un ZIP de 4,8 MB y presentado como "trainer" para el videojuego Phasmophobia. La model card describe funciones propias de software de trampas (cheats): radar 2D, overlay externo con cajas delimitadoras, ESP de distancia, suavizado de entrada Bezier, filtro anti-captura de pantalla y una tecla de panico para descargar el proceso.

No hay ningun modelo de lenguaje, red neuronal, tokenizador ni pesos publicados. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) y la ausencia de pipeline confirman que es un binario para Windows y no un modelo. El contenido incluye enlaces a descargas alojadas en repositorios de GitHub de terceros y una contrasena de archivo (`2026`), un patron habitual en la distribucion de malware disfrazado de utilidad de juego.

Esta ficha se redacta por rigor documental, pero debe quedar claro que no procede evaluar el artefacto como modelo: no cumple ninguno de los criterios de la categoria. La recomendacion tecnica es no ejecutar el binario ni extraer el archivo, y tratarlo como posible vector de infeccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como metadatos del repositorio, no como capacidades del artefacto) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`, tamano declarado de 4,8 MB) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. La model card describe un "runtime" para Windows con modulos de memoria externa, renderizado por Desktop Duplication, polling a frecuencias declaradas de 247 Hz, 271 Hz y 342 Hz, y latencias declaradas de menos de 14 ms, 31 ms y similares. Estos datos son afirmaciones de marketing del autor, no resultados medibles ni verificables, y no hay codigo fuente, paper ni artefacto de evaluacion que los respalde.

El texto mezcla terminologia tecnica real (overlay externo, user-mode, sin hooks DLL internos) con funciones propias de trampas multijugador. No hay dataset, no hay tokens de entrenamiento, no hay RLHF ni DPO, y no hay innovacion tecnica en el sentido de la IA. El unico "empaquetado" relevante es la distribucion de un binario con contrasena, algo que dificulta el analisis por parte de antivirus y sandboxes.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; los 14 idiomas son etiquetas de metadatos.
- El artefacto declara funciones de trampa para un videojuego: radar 2D, filtro de botin, overlay externo, ESP de distancia, suavizado de entrada y tecla de panico.
- No hay API, SDK ni interfaz programatica documentada mas alla de la ejecucion del `.exe` como administrador.

## Casos de uso

No procede enumerar casos de uso legitimos de un modelo de IA, porque no lo es. Los escenarios realistas son de riesgo:

- Analisis de malware en entorno aislado: un investigador de seguridad podria estudiar el binario en una maquina virtual sin red para caracterizar su comportamiento, siempre que se cumplan las precauciones de cuarentena y no se ejecute en el equipo anfitrion.
- Documentacion de campanas de ingenieria social: el repositorio sirve como ejemplo de model card falsa que imita la estructura de Hugging Face para distribuir ejecutables con contrasena.
- Formacion en higiene de cadena de suministro: util para ilustrar por que no deben descargarse binarios desde repositorios de modelos ni desde enlaces de GitHub de terceros.
- Auditoria de politicas de plataforma: caso de estudio sobre moderacion de contenido en hubs de modelos.
- Respuesta a incidentes: si un usuario ha ejecutado el binario, sirve como referencia para identificar el nombre del archivo y los dominios implicados.
- Concienciacion de equipos: ejemplo de por que las contrasenas en archivos ZIP y las instrucciones de "ejecutar como administrador" son senales de alarma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No aplica: no hay modelo que evaluar en MMLU, HumanEval, GSM8K ni ninguna otra prueba de IA. Las cifras de latencia y frecuencia de polling de la model card son afirmaciones del autor sin metodologia ni verificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits, en procesadores Intel y AMD x64.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama y TGI no son relevantes).
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.
- Requisito declarado por el autor: ejecutar el `.exe` como administrador, lo que amplia el impacto potencial de cualquier carga maliciosa.

## Comparativa con modelos similares

| Aspecto | Este repositorio | Modelo de IA tipico (referencia generica) |
|---|---|---|
| Naturaleza | Ejecutable de Windows empaquetado en ZIP | Pesos en safetensors o GGUF |
| Parametros | no disponible | Millones o miles de millones |
| Contexto | no disponible | Miles o cientos de miles de tokens |
| Pipeline en Hugging Face | no disponible | text-generation, image-text-to-text, etc. |
| Evaluacion reproducible | ninguna | benchmarks publicados |
| Licencia | MIT declarada | MIT, Apache 2.0, licencias comunitarias |
| Riesgo de seguridad | alto (binario opaco con contrasena) | bajo si se usa con sandbox estandar |

No hay modelos comparables en la misma categoria porque la categoria no es la de modelos de IA. Cualquier comparacion con un LLM seria enganosa.

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse como tal en articulos tecnicos ni en comparativas de modelos.
- Binario opaco: el `.exe` se distribuye dentro de un ZIP protegido con contrasena (`2026`), lo que impide el escaneo automatico por parte de antivirus y sandboxes.
- Enlaces de descarga externos: apuntan a repositorios de GitHub de terceros (`dawidb9567/delta-executor-pc-2026`, `Kimura71/phasmophobia-fling-trainer`), no al propio repositorio de Hugging Face.
- Instruccion de ejecutar como administrador: eleva los privilegios del proceso y amplia el dano potencial.
- Funciones declaradas de trampa multijugador: su uso puede violar los terminos de servicio del videojuego y acarrear el baneo de la cuenta.
- Riesgo de malware: el patron (ZIP con contrasena, enlaces a GitHub, instrucciones de whitelist en Defender, tecla de panico) es consistente con distribucion de software malicioso. No se ha verificado el contenido del binario.
- Cero descargas y cero likes en el momento de la consulta: sin senales de comunidad ni de escrutinio publico.
- Licencia MIT declarada: no aporta garantias sobre el contenido real del binario ni sobre su legalidad en el contexto del juego.
- Sesgos y alucinaciones: no aplica, pero tampoco hay transparencia sobre el comportamiento del ejecutable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hoomanrafinia/phasmophobia-fling-trainer
- Enlace de descarga citado en la model card (GitHub de terceros): https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado como origen de la release: https://github.com/Kimura71/phasmophobia-fling-trainer/releases/latest
- Paper: no disponible
- Blog o demo: no disponible
