# Khacao/criminal-simulator-script

## Resumen

El repositorio `Khacao/criminal-simulator-script` no contiene un modelo de inteligencia artificial. Se trata de un paquete de software para Windows distribuido como archivo ZIP (`criminal-simulator-script-v1.2.0-win64.zip`, 8,9 MB) que, segun su propia model card, implementa funciones de tipo "cheat" o trampa para videojuegos: superposicion externa (overlay), suavizado de entrada tipo Bezier, "ESP" con cajas delimitadoras y esqueletos de huesos, y una capa de renderizado disenada para excluirse de capturas de OBS, ShadowPlay y Discord.

El artefacto se presenta con tecnicas tipicas de ingenieria social: contrasena de descompresion (`2026`), instrucciones para ejecutar el binario "como administrador", insignias falsas de descargas y valoraciones, y enlaces de descarga apuntando a un repositorio de GitHub distinto del indicado en el identificador de Hugging Face. No hay pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia.

Por tanto, esta ficha no puede evaluar capacidades de IA. Se limita a documentar lo que el artefacto declara ser, sus especificaciones observables y las advertencias de seguridad pertinentes para cualquier desarrollador o investigador que se encuentre con este repositorio al buscar modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de metadatos, no capacidades del artefacto) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (distribucion como ZIP con `.exe`; sin safetensors ni GGUF) |

Datos adicionales observables del artefacto:

| Parametro | Valor |
|---|---|
| Identificador | `Khacao/criminal-simulator-script` |
| Plataforma objetivo | Windows 10 (22H2) y Windows 11 (24H2), x64 |
| Tamano del archivo | 8,9 MB |
| Version declarada | v4.9.8 (firma `EC0F6A513B`) |
| Contrasena del ZIP | `2026` |
| Punto de entrada | `criminal-simulator-script-v1.2.0-win64.exe` |
| Descargas / likes en HF | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-11-23 / 2026-11-24 |

## Arquitectura y entrenamiento

No aplica. No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de ajuste fino (SFT, RLHF, DPO) ni innovacion algorítmica documentada. La model card describe, en su lugar, modulos de un programa de escritorio: un nucleo "externo en modo usuario" que renderiza mediante Desktop Duplication sin inyectar DLL, una capa de superposicion a 144 Hz o mas con cajas 2D/3D y esqueletos, suavizado de entrada Bezier con radio FOV configurable, cambio en caliente de perfiles JSON y una tecla de panico (`END`) con salida de proceso declarada en menos de 30 ms.

Las cifras de rendimiento que aparecen en la model card (98,6 %, 99,3 %, 99,8 % de "consistencia") no vienen acompanadas de metodologia, conjunto de prueba ni codigo reproducible, por lo que no son verificables.

## Capacidades

- No ofrece generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; los idiomas listados son etiquetas de metadatos.
- Lo que el artefacto declara hacer: superposicion externa de informacion del juego (ESP), suavizado de apuntado, perfiles conmutables por tecla y evasion de captura de pantalla.
- Estas funciones corresponden a trampas en videojuegos y a evasion de deteccion, no a IA.

## Casos de uso

No se identifican casos de uso legitimos para desarrollo de software o investigacion en IA. Los escenarios que el propio artefacto propone son:

- Automatizacion de apuntado en videojuegos: el suavizado Bezier con radio FOV configurable se emplearia para asistir la punteria en partidas multijugador, lo que vulnera habitualmente los terminos de servicio de los juegos.
- Visualizacion de informacion oculta: la superposicion con cajas y esqueletos mostraria posiciones de jugadores a traves de paredes.
- Evasion de moderacion en streaming: la capa de renderizado declara excluirse de OBS, ShadowPlay y Discord, lo que apunta a ocultar el uso de trampas durante retransmisiones.
- Salida rapida ante inspeccion: la tecla `END` cerraria el proceso en menos de 30 ms segun el autor.
- Distribucion de binarios con contrasena: el ZIP protegido con `2026` dificulta el analisis automatico por parte de antivirus y plataformas.

Ninguno de estos escenarios es recomendable. Se documentan unicamente para caracterizar el artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas son afirmaciones de la model card sin metodologia (98,6 % de consistencia en cambio de perfiles, 99,3 % en suavizado, 99,8 % en superposicion, latencia inferior a 30 ms en la tecla de panico). No deben tratarse como datos verificados.

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia de red neuronal.
- GPU: no aplica; el renderizado declarado usa Desktop Duplication de Windows.
- CPU y RAM: no disponibles en la informacion proporcionada.
- Cabe en cualquier equipo con Windows 10 22H2 o Windows 11 24H2, x64, segun el autor.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables.
- Latencia y throughput: no disponibles; las cifras del autor no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos de IA" con la que comparar este artefacto. Frente a otros repositorios de Hugging Face, la diferencia relevante es categorica: este no contiene pesos ni pipeline, sino un ejecutable de Windows empaquetado con tecnicas de promocion agresivas.

| Criterio | `Khacao/criminal-simulator-script` | Modelo de IA tipico en HF |
|---|---|---|
| Contenido | ZIP con `.exe` Win64 | Pesos en safetensors/GGUF |
| Pipeline | no disponible | text-generation, etc. |
| Pesos descargables | No | Si |
| Reproducibilidad | Nula (binario cerrado) | Alta (pesos + config) |
| Uso previsto | Trampas en videojuegos | Inferencia de IA |

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse como tal en comparativas, articulos o pipelines.
- Riesgo de seguridad alto: ejecutar binarios de origen desconocido como administrador, con contrasena de descompresion que evade el analisis automatico, es un vector clasico de malware, mineros o stealers.
- Inconsistencia de procedencia: el identificador de Hugging Face es `Khacao/...`, pero los enlaces de descarga apuntan al repositorio de GitHub `betty67060/criminal-simulator-script`, lo que sugiere suplantacion o republicacion.
- Senales de ingenieria social: insignias de "226K+ descargas" y "4,9/5" sin respaldo, contrasena en el propio README y urgencia por ejecutar como administrador.
- La licencia MIT declarada en los metadatos no otorga ninguna garantia sobre el binario ni sobre su legalidad en el contexto de juegos multijugador.
- Uso comercial: desaconsejado por completo; el artefacto no aporta valor a productos de IA y su uso puede infringir terminos de servicio de terceros y normativa de ciberseguridad.
- No hay sesgos medibles, riesgo de alucinacion ni limitaciones de contexto porque no hay modelo; el riesgo relevante es de ejecucion de codigo no verificado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Khacao/criminal-simulator-script
- Repositorio de GitHub referenciado en la model card (no verificado): https://github.com/betty67060/criminal-simulator-script
- Enlace de descarga directa citado en la model card (no verificado, no recomendado): https://github.com/betty67060/criminal-simulator-script/releases/latest/download/criminal-simulator-script-v1.2.0-win64.zip
- Paper, blog o demo: no disponible
