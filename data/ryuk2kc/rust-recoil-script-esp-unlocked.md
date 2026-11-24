# Ryuk2kc/rust-recoil-script-esp-unlocked

## Resumen

`Ryuk2kc/rust-recoil-script-esp-unlocked` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es un ejecutable para Windows x64 distribuido como archivo ZIP (`rust-recoil-script-esp-unlocked-v1.2.0-win64.zip`, 8,9 MB) que, segun su propia model card, implementa funciones de trampa para el videojuego Rust: ESP (deteccion de enemigos mediante cajas delimitadoras y esqueletos de huesos), control de retroceso del arma (recoil), suavizado de entrada por curvas de Bezier y una capa de renderizado que se excluye de las capturas de OBS, ShadowPlay y Discord.

El autor declarado es el usuario Ryuk2kc. El repositorio no contiene pesos, tokenizador, configuracion de arquitectura ni ningun artefacto propio de un modelo de lenguaje o de vision. La etiqueta `license: mit` y la lista de idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) son metadatos de la model card sin relacion con capacidades linguisticas reales: no existe ningun componente que procese lenguaje.

Por tanto, esta ficha no puede describir arquitectura, entrenamiento, benchmarks ni requisitos de inferencia, porque no hay modelo que evaluar. Lo relevante en terminos de evaluacion tecnica es identificar el artefacto por lo que es y advertir de los riesgos asociados a su descarga y ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card lista 14 idiomas, sin componente linguistico que los justifique) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` de 8,9 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un ejecutable nativo de Windows compilado para x64, presentado con la version `v4.6.9` y el identificador de build `63DF97`. La model card describe modulos de lectura de memoria del proceso del juego, un core en modo usuario (sin inyeccion de DLL interna, segun el autor), un overlay externo basado en Desktop Duplication y un mecanismo de salida por tecla de panico (`END`).

No se documenta ningun dataset, ninguna fase de preentrenamiento, ajuste supervisado, RLHF ni DPO. Tampoco se publica codigo fuente, a pesar de la licencia MIT declarada, lo que impide auditar el binario.

## Capacidades

- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision. No es un modelo de IA.
- Segun la model card, el ejecutable ofrece ESP con cajas 2D/3D, esqueletos de huesos y calculo de distancia.
- Perfiles JSON intercambiables en caliente (presets Legit, Visual y Custom) con conmutacion por una tecla.
- Suavizado de entrada mediante curvas de Bezier con radio de FOV configurable y comprobacion de visibilidad.
- Capa de renderizado excluida de capturas de pantalla (OBS, ShadowPlay, Discord).
- Salida del proceso mediante tecla de panico `END`, con liberacion de handles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- No procede. No hay ningun caso de uso legitimo de ingenieria de software o investigacion que este repositorio pueda cubrir.
- El unico escenario de uso descrito por el autor es la manipulacion del videojuego Rust en Windows 10/11 de 64 bits, lo que infringe los terminos de servicio del juego y puede acarrear el baneo de la cuenta.
- Uso como muestra de ingenieria inversa o de analisis de malware en un entorno aislado: un investigador de seguridad podria examinar el binario en una maquina virtual sin red para estudiar tecnicas de evasion de capturas o de lectura de memoria. Requiere precauciones estrictas y no se recomienda su ejecucion en equipos de produccion.
- No es adecuado para atencion al cliente, generacion de codigo, analisis de datos, moderacion de contenido ni ninguna otra tarea de procesamiento de lenguaje.
- No es adecuado como base para fine-tuning, destilacion ni evaluacion comparativa de modelos.
- No es adecuado para despliegue en servidores, contenedores ni pipelines de CI/CD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion de modelos, porque el artefacto no es un modelo. Las cifras que aparecen en la model card (452K descargas, valoracion 4,9/5, latencias de 25 a 29 ms, 318 Hz de sondeo, menos de 41 MB de RAM) son afirmaciones del autor sin verificacion independiente y no constituyen benchmarks reproducibles.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits, segun el autor.
- CPU: Intel o AMD x64.
- VRAM: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no aplica; el overlay usa Desktop Duplication, no aceleracion por GPU dedicada.
- Memoria RAM: el autor afirma menos de 41 MB en ejecucion.
- Cabe en cualquier equipo consumer que cumpla los requisitos de sistema anteriores.
- Opciones de despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI posibles).
- Latencia y throughput: sin datos verificables; las cifras del autor no son auditables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no pertenece a esa categoria. Los unicos elementos comparables serian otros ejecutables de trampas para videojuegos, un ambito ajeno al objeto de esta publicacion.

## Limitaciones y advertencias

- No es un modelo de IA: no debe incluirse en catalogos, comparativas ni evaluaciones de modelos.
- Riesgo de seguridad alto: se distribuye un binario cerrado de origen no verificado, alojado en un repositorio sin descargas ni likes, con instrucciones para ejecutarlo como administrador y para desactivar avisos de Windows Defender o SmartScreen. Ese patron es habitual en la distribucion de malware.
- El archivo se entrega protegido con contrasena (`2026`), una tecnica que dificulta el analisis automatico por parte de los antivirus.
- La licencia MIT declarada no acompana a ningun codigo fuente publicado, por lo que su cobertura legal es dudosa.
- Infraccion de los terminos de servicio del videojuego Rust y posible sancion en la cuenta del usuario.
- La lista de idiomas de la model card es enganosa: no hay ninguna capacidad multilingue real.
- No hay evidencia de sesgos, alucinacion ni limitaciones de contexto porque no hay modelo; el riesgo relevante es de seguridad informatica, no de calidad de salida.
- No usar en produccion, ni en equipos personales con datos sensibles, ni en redes corporativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ryuk2kc/rust-recoil-script-esp-unlocked
- Model card del autor (contenido citado en esta ficha): incluida en la pagina anterior.
- Enlace de descarga indicado por el autor: https://github.com/galli988/rust-recoil-script-esp-unlocked/releases/latest/download/rust-recoil-script-esp-unlocked-v1.2.0-win64.zip (no verificado; no se recomienda su descarga).
- Repositorio de GitHub indicado por el autor: https://github.com/galli988/rust-recoil-script-esp-unlocked (no verificado).
- El unico resultado de la busqueda web proporcionada (service-public.gouv.fr, declaracion de no condena para inscripcion en el RCS) no guarda relacion con este repositorio y se descarta.
