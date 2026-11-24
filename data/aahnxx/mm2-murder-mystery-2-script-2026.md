# aahnxx/mm2-murder-mystery-2-script-2026

## Resumen

La ficha solicitada corresponde al identificador `aahnxx/mm2-murder-mystery-2-script-2026`, publicado en Hugging Face por el usuario `aahnxx`. A pesar de estar alojado en la plataforma de modelos, el contenido no describe un modelo de IA: la model card lo presenta como un ejecutable portable para Windows 10/11 de 64 bits, distribuido como archivo ZIP de 8,9 MB con un binario `.exe` interno, etiquetado como "script" para el videojuego Murder Mystery 2 de Roblox. No se declara arquitectura de red neuronal, parametros, tokenizador ni pesos en ningun formato conocido.

El artefacto se promociona con modulos orientados a la manipulacion del cliente del juego (optimizador de tasa de fotogramas, ESP de entidades y cofres, salto automatico de servidores, alertas por webhook de Discord, bucle de farmeo automatico y teletransporte por coordenadas). Estos elementos son caracteristicos de herramientas de trampa o "cheat" para videojuegos, no de un modelo de lenguaje o multimodal.

Por tanto, esta ficha documenta el artefacto tal como esta publicado, senalando de forma explicita que no es un modelo de IA y que su uso conlleva riesgos de seguridad y de cumplimiento de las condiciones de servicio de la plataforma de juego. Los datos tecnicos de IA (parametros, contexto, cuantizacion) figuran como no disponibles porque no existen en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP `mm2-murder-mystery-2-script-2026-v1.2.0-win64.zip` de 8,9 MB con un `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. La model card describe un binario nativo de 64 bits para Windows 10/11, con build etiquetada `v2.8.6 (F620C2)`, empaquetado en un ZIP protegido con contrasena (`2026`) que contiene un ejecutable `mm2-murder-mystery-2-script-2026-v1.2.0-win64.exe`. No se aporta informacion sobre datos de entrenamiento, tokenizador, funciones de perdida, RLHF, DPO ni ninguna innovacion de inferencia (atencion lineal, decodificacion especulativa, etc.).

Los "modulos" listados en la model card (optimizador de fotogramas, ESP 3D, salto de servidores, webhook de Discord, bucle de farmeo, teletransporte) son funciones de automatizacion e interaccion con el cliente del juego, con cifras de rendimiento declaradas por el autor (respuesta en menos de 4 ms, 96,2 % de consistencia, menos de 35 MB de RAM) que no son verificables ni corresponden a metricas de modelos.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de los modelos de IA.
- No implementa razonamiento multi-paso ni comportamiento de agente basado en LLM.
- No dispone de modo "thinking", vision, audio ni multimodalidad.
- Las funciones declaradas son de automatizacion de un cliente de videojuego: ESP de entidades y cofres, teletransporte por coordenadas, salto automatico de servidores, bucle de farmeo y notificaciones por webhook.
- Los metadatos declaran 14 idiomas, pero no hay evidencia de capacidades linguisticas reales asociadas a un modelo.

## Casos de uso

No se identifican casos de uso legitimos como modelo de IA. Los escenarios que la model card sugiere son los siguientes, documentados aqui de forma descriptiva y con las advertencias correspondientes:

- Automatizacion de tareas repetitivas en el cliente del juego: el autor declara un bucle de farmeo con ciclado de misiones y limpieza de jefes; su uso infringe previsiblemente las condiciones de servicio de Roblox y puede conllevar el baneo de la cuenta.
- Visualizacion de entidades a traves de paredes (ESP): utilidad declarada para localizar objetos y objetivos; constituye una ventaja injusta en el juego y no es un caso de uso aceptable.
- Cambio automatico de instancias de servidor: el autor indica un salto de servidores de baja latencia con un 96,2 % de consistencia declarada; misma advertencia de cumplimiento.
- Notificaciones externas por webhook de Discord: envio de avisos de eventos de sesion a un canal; tecnicamente es una integracion HTTP simple, sin relacion con IA.
- Ajuste de rendimiento del cliente: el autor menciona eliminacion de particulas y renderizado de bajo consumo; no verificable de forma independiente.
- Teletransporte por coordenadas: desplazamiento instantaneo a islas, NPC o salas de raid; misma advertencia de cumplimiento y de riesgo de sancion.

Ninguno de estos escenarios debe considerarse una recomendacion de uso; se listan unicamente porque aparecen en la informacion proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas cifras presentes son declaraciones del autor sobre el ejecutable (respuesta inferior a 4 ms, 96,2 % de consistencia, menos de 35 MB de RAM) y no constituyen benchmarks de modelos ni han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10/11 de 64 bits, procesadores Intel y AMD x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras del autor no son verificables.
- Espacio en disco declarado: 8,9 MB para el ZIP; requisitos de RAM declarados inferiores a 35 MB en algunos modulos.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos de IA" comparable, porque el artefacto no es un modelo. Tampoco se dispone de informacion sobre otras herramientas de la misma naturaleza con la que establecer una comparacion rigurosa de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, integrarse ni citarse como modelo de lenguaje, multimodal o de codigo.
- Riesgo de seguridad elevado: se distribuye un ejecutable de Windows que requiere ejecucion como administrador y una contrasena de extraccion; no hay firma de codigo, hash publico ni auditoria independiente en la informacion disponible.
- Posible contenido malicioso: los patrones descritos (ZIP con contrasena, ejecutable como administrador, URL de descarga externa en GitHub) son habituales en campanas de distribucion de software no deseado; tratalo con cuarentena y analisis previo.
- Incumplimiento de condiciones de servicio: las funciones declaradas (ESP, teletransporte, farmeo automatico) constituyen trampas en un videojuego y pueden provocar el baneo de la cuenta del usuario.
- Licencia MIT declarada: cubre el artefacto segun el autor, pero no exime del cumplimiento de las condiciones de la plataforma de juego ni de la legislacion aplicable.
- Idiomas: los 14 idiomas de los metadatos no implican capacidades linguisticas reales; no hay evidencia de un modelo subyacente.
- Ausencia de benchmarks y de documentacion tecnica verificable: cualquier afirmacion de rendimiento procede unicamente del autor.
- Fecha de creacion y actualizacion (24 de noviembre de 2026) y cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aahnxx/mm2-murder-mystery-2-script-2026
- Repositorio referenciado en la model card: https://github.com/spyrosmartin5166/mm2-murder-mystery-2-script-2026
- Descarga declarada por el autor: https://github.com/spyrosmartin5166/mm2-murder-mystery-2-script-2026/releases/latest/download/mm2-murder-mystery-2-script-2026-v1.2.0-win64.zip
- Pagina de releases: https://github.com/spyrosmartin5166/mm2-murder-mystery-2-script-2026/releases/latest
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
