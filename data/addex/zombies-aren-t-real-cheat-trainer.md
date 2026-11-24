# Addex/zombies-aren-t-real-cheat-trainer

## Resumen

El repositorio `Addex/zombies-aren-t-real-cheat-trainer` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un artefacto empaquetado para Windows x64 que se presenta como un *trainer* (herramienta de trampas) para el videojuego *Zombies Aren't Real*, distribuido como un ejecutable portable de 4,8 MB con contrasena de descompresion. La model card describe funcionalidades propias de un *cheat* de videojuegos (radar 2D, filtro de botin, suavizado de entrada tipo Bezier, overlay externo a 144 Hz y capa de renderizado que evita la captura en OBS/ShadowPlay), no capacidades de generacion de lenguaje, vision o razonamiento.

El artefacto se publica bajo licencia MIT y declara soporte para catorce idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id), un dato que en este contexto parece orientado a la distribucion de la interfaz de la herramienta mas que a capacidades linguisticas de un modelo. No se declara pipeline, parametros, arquitectura, contexto ni formato de pesos, porque no existe un modelo subyacente que evaluar.

Desde la perspectiva de un editor tecnico de IA open source, este repositorio debe clasificarse como **no conforme** con la categoria de modelo: no es un modelo de IA, no es reproducible en el sentido de inferencia con pesos, y su distribucion mediante enlaces a GitHub con contrasena y ejecutables es un patron habitual en campañas de *malware* o *scam*. La ficha se completa a continuacion por rigor estructural, marcando explicitamente los campos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos, no verificables como capacidades de modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un `.zip` de 4,8 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto es un binario `lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.exe` (build `v4.2.7`, identificador `D0137AF8A1`) empaquetado en un ZIP de 4,8 MB protegido con la contrasena `2026`. La model card describe modulos de *cheat* (perfiles JSON intercambiables en caliente, nucleo externo en modo usuario sin hooks DLL, radar 2D, filtro de botin por rareza, suavizado de entrada Bezier con VisCheck, capa de renderizado anti-captura y overlay externo a 144 Hz+), con metricas de rendimiento declaradas por el autor (menos de 36 ms de respuesta, menos de 6 ms en el suavizado, menos de 57 MB de RAM) que no son verificables ni corresponden a ningun tipo de inferencia de modelo.

No se documentan datos de entrenamiento, numero de tokens, composicion del dataset, ni tecnicas de alineacion como RLHF o DPO. Tampoco se describe ninguna innovacion en atencion, decodificacion especulativa o arquitecturas hibridas.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no resuelve matematicas ni escribe codigo.
- No dispone de soporte de *tool calling* ni de *function calling*.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de un modelo; los catorce idiomas son metadatos de la ficha.
- No ofrece vision, audio ni modo de razonamiento (*thinking mode*).
- Las unicas "capacidades" descritas son funciones de trampa para un videojuego: radar 2D, ESP de cajas y esqueletos, filtro de botin, suavizado de apuntado y capa de renderizado que evita la captura de pantalla.

## Casos de uso

- **Ninguno en el ambito de IA open source.** El artefacto no permite inferencia, ajuste fino, evaluacion ni integracion en pipelines de datos o de generacion.
- **Auditoria de seguridad:** un equipo de seguridad puede usar la ficha como caso de estudio de distribucion de ejecutables mediante repositorios de modelos, con contrasena en el ZIP y enlaces a releases de GitHub, patron tipico de *malware*.
- **Formacion en deteccion de *scam*:** util como ejemplo didactico de model card que imita la estructura de un repositorio de modelos (tags, licencia, idiomas) sin contener un modelo.
- **Politicas de moderacion de plataformas:** sirve para calibrar reglas que detecten artefactos no-modelo en hubs de modelos (ejecutables, contrasenas de descompresion, enlaces a terceros).
- **Analisis de etiquetado:** permite estudiar como se abusa de la licencia MIT y de la lista de idiomas para dar apariencia de legitimidad.
- **Respuesta a incidentes:** referencia para comprobar si un usuario ha descargado el binario y ha ejecutado un `.exe` con privilegios de administrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas cifras presentes son metricas internas declaradas por el autor (menos de 36 ms, menos de 6 ms, menos de 57 MB de RAM, 96,9 % de consistencia, 144 Hz+), sin metodologia ni verificacion, y no comparables con MMLU, HumanEval, GSM8K ni ninguna otra prueba de modelos.

## Requisitos de hardware

- No aplica VRAM para inferencia: no hay pesos de modelo que cargar.
- El artefacto declara como requisito un sistema Windows 10 u 11 de 64 bits.
- No requiere GPU dedicada; las metricas declaradas (menos de 57 MB de RAM) son de una herramienta de escritorio, no de un modelo.
- No procede hablar de A100, H100 ni RTX 4090; el binario no ejecuta inferencia neural.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna aplicable.
- Latencia y throughput de inferencia: no disponibles por ausencia de modelo.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos similares" porque el artefacto no es un modelo de IA. Cualquier comparacion con modelos de lenguaje, vision o audio seria categoricamente incorrecta.

| Criterio | Este repositorio | Modelo de IA tipico |
|---|---|---|
| Contenido | Ejecutable Windows + ZIP | Pesos en safetensors/GGUF |
| Inferencia | No aplica | Si |
| Parametros | no disponible | Declarados |
| Contexto | no disponible | Declarado |
| Reproducibilidad | Nula | Alta |

## Limitaciones y advertencias

- **No es un modelo de IA:** no debe etiquetarse, indexarse ni recomendarse como tal en catalogos de modelos.
- **Riesgo de seguridad alto:** distribucion de un `.exe` que se ejecuta "como administrador", con ZIP protegido por contrasena y enlaces a releases de GitHub de terceros; patron compatible con *malware*, *stealer* o *dropper*.
- **Contrasena en la documentacion (`2026`):** practica que evade el analisis automatico de antivirus y de plataformas de escaneo.
- **Enlaces a repositorios ajenos:** la model card apunta a `Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026` y `rezende934/zombies-aren-t-real-cheat-trainer`, no al propio autor `Addex`, lo que sugiere suplantacion o redireccion.
- **Metricas no verificables:** las cifras de rendimiento y consistencia (96,9 %, menos de 36 ms) no tienen metodologia publicada.
- **Licencia MIT:** permite reutilizacion y redistribucion sin garantias; no protege al usuario frente a contenido malicioso.
- **Cero descargas y cero likes:** no hay validacion de la comunidad en el momento de la consulta.
- **Uso comercial:** la licencia MIT lo permitiria tecnicamente, pero el uso del artefacto puede infringir los terminos de servicio del videojuego y la legislacion sobre *cheats* en algunas jurisdicciones.
- **Riesgo de alucinacion y sesgos:** no aplica, al no existir componente generativo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Addex/zombies-aren-t-real-cheat-trainer
- Release referenciada en la model card: https://github.com/Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026/releases/download/v1.2.0/lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.zip
- Repositorio de GitHub referenciado: https://github.com/rezende934/zombies-aren-t-real-cheat-trainer/releases/latest
- Paper, blog o demo: no disponible
