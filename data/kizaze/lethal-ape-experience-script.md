# kizaze/lethal-ape-experience-script

## Resumen

El repositorio `kizaze/lethal-ape-experience-script` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 (build `v2.7.4`, identificador `D4DDF5`) distribuido como archivo ZIP de 4,8 MB con contrasena `2026`, que se presenta como un script de asistencia para videojuegos con funcionalidades de overlay externo, radar 2D, filtro de objetos y perfiles JSON intercambiables en caliente. El autor es el usuario `kizaze`, sin historial de publicaciones verificable y con cero descargas y cero likes en el momento de la consulta.

El artefacto no expone pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia; el campo `pipeline` aparece como no disponible y los tags describen exclusivamente sistemas operativos, formatos de ejecutable e idiomas de interfaz. Por tanto, la ficha se redacta como evaluacion de un artefacto no-modelo: se documenta lo que el autor declara y se advierte explicitamente de que no existe informacion tecnica de modelo que analizar.

La relevancia de esta ficha es fundamentalmente de advertencia. El contenido de la model card incluye enlaces a binarios alojados en repositorios de GitHub de terceros, instrucciones para ejecutar un `.exe` como administrador, una contrasena fija para descomprimir el archivo y tecnicas declaradas de evasion de captura de pantalla (OBS, ShadowPlay, Discord), patrones habituales en distribuciones de software potencialmente no deseado. No se ha verificado la naturaleza del binario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como idiomas de la ficha, no del modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribucion en ZIP con ejecutable `.exe`; build `v2.7.4` / `D4DDF5`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. La model card describe un programa externo en modo usuario para Windows de 64 bits que, segun el autor, opera mediante Desktop Duplication para renderizar un overlay sin inyectar DLL en el proceso objetivo. Las cifras declaradas incluyen sondeo a 199 Hz para la tecla de panico (`END`), 444 Hz para el radar 2D y el filtro de objetos, 304 Hz para el cambio de perfiles JSON, cuatro hilos de trabajo, menos de 64 MB de RAM y un tiempo de respuesta inferior a 18 ms en la capa de render.

No se especifica ningun dataset, numero de tokens, tecnica de alineacion (RLHF, DPO) ni innovacion de inferencia. Los unicos elementos tecnicos mencionados son mecanismos de evasion de captura de pantalla y liberacion de handles al desinstalar, que no constituyen arquitectura de modelo.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no resuelve codigo ni matematicas.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de procesamiento de lenguaje natural; los idiomas listados son metadatos de la ficha.
- Declara, como software de escritorio, overlay externo 2D/3D con cajas delimitadoras, esqueletos de huesos y ESP de distancia.
- Declara radar 2D con filtrado de objetos por rareza y seguimiento de contenedores.
- Declara cambio de perfiles JSON con una tecla entre presets Legit, Visual y Custom.
- Declara tecla de panico (`END`) con liberacion instantanea de handles y salida del proceso.
- Declara capa de render excluida de OBS, ShadowPlay y Discord.

## Casos de uso

- No aplica: el artefacto no es un modelo de IA y no puede emplearse en tareas de generacion, clasificacion, recuperacion ni agentes.
- Auditoria de seguridad: un equipo puede analizar el ZIP y el `.exe` en un entorno aislado para determinar si el binario coincide con lo que declara la ficha, dado el patron de distribucion (contrasena fija, enlaces a repositorios de terceros, ejecucion como administrador).
- Formacion en deteccion de software no deseado: el repositorio sirve como ejemplo documentado de model card que imita la estructura de una ficha de modelo sin contener un modelo, util en materiales de concienciacion.
- Estudio de tecnicas de evasion de captura: la descripcion de la capa de render excluida de OBS, ShadowPlay y Discord puede citarse en analisis de mecanismos de ocultacion usados por software de trampas.
- Verificacion de licencia: la declaracion MIT permite teoricamente reutilizacion, pero al no existir codigo fuente ni pesos, la licencia no cubre ningun artefacto verificable.
- Monitorizacion de repositorios: incluir este tipo de publicaciones en listas de vigilancia para evitar que aparezcan en indices de modelos y confundan a herramientas de descubrimiento automatico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara cifras operativas del ejecutable (sondeo a 199 Hz, 444 Hz y 304 Hz; cuatro hilos; menos de 64 MB de RAM; menos de 18 ms de respuesta), pero no son comparables con metricas de modelos de IA y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay inferencia de modelo.
- GPU recomendadas: no aplica; el autor no especifica requisitos de GPU.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits, sobre procesadores Intel y AMD x64.
- Memoria RAM declarada: menos de 64 MB para el nucleo externo en modo usuario.
- Opciones de despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI); la distribucion es un ZIP con un `.exe` que el autor indica ejecutar como administrador.
- Latencia y throughput: no disponibles de forma verificable; las cifras de la model card son declaraciones del autor sin medicion independiente.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA. Frente a otros repositorios de Hugging Face, la unica comparacion posible es negativa: carece de pesos, configuracion, tokenizador, pipeline y resultados de evaluacion, que son los elementos minimos de cualquier ficha de modelo.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; tratarlo como tal en indices, buscadores o pipelines de descubrimiento produce errores de clasificacion.
- Cero descargas y cero likes: no hay evidencia de uso ni de validacion por parte de la comunidad.
- El binario se distribuye comprimido con contrasena fija (`2026`) y se indica ejecutarlo como administrador, practica que dificulta el analisis automatizado y eleva el privilegio del proceso.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`ErikMercier70637`, `patricialiu33`) no vinculados al autor del repositorio de Hugging Face, lo que impide verificar la cadena de custodia del binario.
- La model card menciona evasion de captura de pantalla en OBS, ShadowPlay y Discord, patron caracteristico de software de trampas o de programas que buscan ocultar su actividad.
- La ficha incluye tecnicas de evasion de Windows Defender y SmartScreen, lo que sugiere deteccion por parte de antivirus.
- Riesgo de alucinacion: no aplica al no ser un modelo generativo; el riesgo equivalente es que la documentacion del repositorio describa capacidades que el binario no implemente.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto o idioma: no aplican.
- Licencia MIT declarada, pero sin codigo fuente ni artefactos cubiertos por ella, su alcance practico es nulo.
- Para produccion: no usar. No hay garantia de integridad, procedencia ni comportamiento del ejecutable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kizaze/lethal-ape-experience-script
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Enlace de releases citado en la model card (GitHub, terceros): https://github.com/patricialiu33/lethal-ape-experience-script/releases/latest
- Papers, blogs, repositorios de codigo y demos: no disponibles.
