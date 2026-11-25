# HugenAicret/phasmophobia-mod-menu

## Resumen

El repositorio `HugenAicret/phasmophobia-mod-menu` no contiene un modelo de inteligencia artificial. Se trata de una publicacion alojada en Hugging Face que distribuye un supuesto menu de trucos (cheat/mod menu) para el videojuego Phasmophobia, empaquetado como un ejecutable para Windows con un archivo ZIP protegido por contrasena. No existe ningun artefacto de aprendizaje automatico: no hay pesos, no hay tokenizador, no hay configuracion de arquitectura ni pipeline declarado (`pipeline: no disponible`).

La model card describe un binario `rob-run-cheat-mod-menu-pc-v1.2.2-win64.exe` (build `v3.2.6`, `4.8 MB`) con funciones propias de software de trampas: escaner dinamico de offsets, capa de renderizado "stream-proof" para evadir capturas de OBS/ShadowPlay/Discord, suavizado de entrada Bezier y tecla de panico. Los tags de Hugging Face (`windows`, `windows-11`, `x64`, `portable`, `phasmophobia-mod-menu`) confirman que se ha usado la plataforma como CDN de un ejecutable, no como repositorio de modelos.

Por tanto, esta ficha no puede evaluar capacidades de IA, arquitectura transformer, contexto ni benchmarks. El contenido presenta ademas multiples senales de riesgo de seguridad (enlaces de descarga a repositorios de terceros, contrasena fija en el archivo, instrucciones para ejecutar como administrador y desactivar alertas de SmartScreen/Defender), por lo que se recomienda no descargar ni ejecutar el binario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como metadatos de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un `.zip` con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No aplica. No hay arquitectura de red neuronal, ni datos de entrenamiento, ni proceso de RLHF/DPO. El artefacto distribuido es un binario compilado para Windows 10 (22H2) y Windows 11 (24H2), x64, descrito en la model card como "user-mode external core" con renderizado por Desktop Duplication y sin hooks de DLL internos.

La model card menciona parametros operativos del ejecutable (polling a 186 Hz y 248 Hz, `6` y `12` hilos de trabajo, consumo menor de `53 MB` de RAM, consistencia del `97.4%`), pero no aporta ninguna informacion verificable sobre metodologia, codigo fuente ni auditoria. No hay paper, repositorio de codigo ni documentacion tecnica asociada.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling.
- No implementa razonamiento multi-paso ni comportamiento agentico.
- No tiene capacidades multilingues en el sentido de NLP; los idiomas listados son metadatos de la ficha.
- El unico "contenido funcional" descrito es un menu de trucos para un videojuego: escaner de offsets, perfiles JSON intercambiables en caliente, tecla de panico (`END`) y evasion de captura de pantalla.

## Casos de uso

No se identifican casos de uso legitimos de IA para este repositorio. Los escenarios que plantea la model card son incompatibles con un uso profesional o de investigacion:

- Modificacion de un videojuego: el binario se presenta como menu de trucos para Phasmophobia; su uso puede violar los terminos de servicio del juego y conllevar el baneo de la cuenta.
- Evasion de capturas de pantalla: la capa "stream-proof" esta disenada para ocultar la actividad a OBS, ShadowPlay y Discord, lo que no tiene aplicacion legitima en desarrollo de software.
- Distribucion de ejecutables via Hugging Face: el repositorio ilustra un abuso de la plataforma como CDN de binarios, no un caso de uso de modelos.
- Evaluacion de seguridad: podria estudiarse en un entorno aislado y sin conexion como ejemplo de ingenieria social y distribucion de malware, nunca ejecutandolo en una maquina de produccion.
- Formacion en deteccion de amenazas: util como muestra de tecnicas de evasion (panic key, ofuscacion por contrasena, redireccion a repositorios de terceros) para equipos de blue team.
- Analisis de cadena de suministro: sirve como caso de estudio de por que los pipelines de curacion de datasets y modelos deben rechazar repositorios sin artefactos de ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma objetivo del binario: Windows 10 (22H2) y Windows 11 (24H2), x64.
- Tamano del paquete: `4.8 MB` (ZIP), contrasena de extraccion `2026`.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto es un `.exe` que la model card indica ejecutar como administrador.
- Latencia y throughput: no disponibles ni relevantes.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos de IA" comparable: el repositorio no contiene pesos ni arquitectura. Frente a modelos open source reales (por ejemplo, familias Llama, Mistral, Qwen o Gemma), la diferencia no es de rendimiento sino de naturaleza del artefacto: aquellos son checkpoints de redes neuronales con licencia y benchmarks publicos; este es un ejecutable de Windows sin trazabilidad.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con MMLU, HumanEval, GSM8K ni ninguna otra prueba de capacidad.
- Riesgo de seguridad alto: la model card pide ejecutar el `.exe` como administrador, extraer un ZIP con contrasena fija y ofrece instrucciones para gestionar alertas de Windows Defender/SmartScreen, patron tipico de distribucion de software malicioso.
- Enlaces de descarga a repositorios de GitHub de terceros (`Shuji50/...`, `Roussel10024/...`) no verificados y ajenos al propietario del repositorio en Hugging Face.
- Cero descargas y cero likes en el momento de la consulta, lo que sugiere un repositorio recien creado y sin validacion comunitaria.
- Fecha de creacion futura (`2026-11-24`) respecto a la informacion habitual de la plataforma, lo que anade inconsistencia a los metadatos.
- Uso del videojuego con trampas: posible violacion de los terminos de servicio de Phasmophobia y riesgo de sanciones en la cuenta del usuario.
- Licencia MIT declarada, pero sin codigo fuente publicado que permita verificar el cumplimiento ni auditar el binario.
- No apto para produccion, investigacion ni integracion en pipelines de IA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HugenAicret/phasmophobia-mod-menu
- Repositorio de GitHub referenciado en la model card (descarga): https://github.com/Shuji50/rob-run-cheat-mod-menu-pc/releases/download/v1.2.0/rob-run-cheat-mod-menu-pc-v1.2.2-win64.zip
- Repositorio de GitHub referenciado en la model card (releases): https://github.com/Roussel10024/phasmophobia-mod-menu/releases/latest
- Paper: no disponible
- Blog o demo: no disponible
