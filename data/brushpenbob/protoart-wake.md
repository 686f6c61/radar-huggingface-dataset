# brushpenbob/protoart-wake

## Resumen

ProtoArt Wake no es un modelo de inteligencia artificial, sino una aplicacion nativa de macOS escrita en Swift y AppKit que impide que el Mac entre en reposo desde la barra de menus. El repositorio de Hugging Face `brushpenbob/protoart-wake` se utiliza unicamente como canal de distribucion del binario `ProtoArt-Wake-2.0.2.dmg` (1,1 MB), no como alojamiento de pesos ni de artefactos de aprendizaje automatico. El proyecto lo desarrolla el autor identificado como `theprotoart` y se publica bajo licencia Apache-2.0.

La utilidad resuelve un problema concreto de escritorio: mantener el sistema despierto durante descargas, compilaciones, presentaciones o procesos largos, con control fino mediante disparadores (aplicaciones vigiladas, audio, descargas, horarios, adaptador de corriente, pantalla externa, unidad conectada o CPU ocupada). Su relevancia es la de una herramienta de productividad ligera, no la de un componente para pipelines de IA.

Dado que el repositorio no contiene ningun modelo entrenado, las secciones tecnicas habituales de esta ficha (parametros, contexto, cuantizacion, benchmarks, VRAM) no son aplicables y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion nativa de macOS en Swift + AppKit (no es un modelo de IA) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (la interfaz se distribuye en ingles segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible; el artefacto distribuido es un DMG (`ProtoArt-Wake-2.0.2.dmg`, 1,1 MB) |
| Version | 2.0.2 |
| Requisitos de sistema | macOS 12 o superior; Apple Silicon e Intel |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion | 2026-10-24 |
| Ultima actualizacion | 2026-11-09 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. La aplicacion se implementa en Swift sobre AppKit como agente de barra de menus y utiliza las aserciones de energia propias de macOS (`power assertions`) para bloquear la suspension del sistema y de la pantalla. Segun la model card, confirma la retencion con el propio macOS y no realiza conexiones de red.

El diseno funcional gira en torno a un boton de encendido y un selector de duracion (infinito, de 5 minutos a 12 horas, longitud personalizada, hasta una hora concreta, mientras se ejecuta una aplicacion o mientras se descarga un fichero), con anillo de cuenta atras. Incluye modos de alcance (pantalla + Mac o solo Mac), bloqueo del salvapantallas y un conjunto de disparadores automaticos: aplicaciones vigiladas, audio, descargas, programacion horaria, adaptador de corriente, pantalla externa, unidad conectada y CPU ocupada. No se documenta ningun tipo de entrenamiento, ajuste fino ni RLHF.

## Capacidades

- Mantener el Mac despierto desde la barra de menus con control de duracion y cuenta atras visible.
- Disparadores automaticos: aplicaciones vigiladas, reproduccion de audio, descargas en curso, horarios, conexion del adaptador de corriente, pantalla externa conectada, unidad montada y CPU ocupada.
- Alcance configurable: mantener activos pantalla y Mac, o solo el Mac.
- Bloqueo del salvapantallas.
- Reglas de sesion, recordatorios con botones de extension, sonidos y opciones de barra de menus.
- Funcion "Drive Alive" y estadisticas de uso.
- Atajo de teclado global ⌃⌥⌘W.
- Enlaces con esquema propio `protoart-wake://`.
- Sin conexiones de red y sin uso de procesador en reposo, segun el autor.
- No incluye generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente.

## Casos de uso

- Descargas largas: el disparador de descargas mantiene el Mac despierto mientras un fichero se esta bajando y libera la retencion al terminar, evitando cortes por suspension.
- Compilaciones y procesos por lotes: la opcion de CPU ocupada o la duracion personalizada mantienen el equipo activo durante builds prolongados sin intervencion manual.
- Presentaciones y demos: el modo "pantalla + Mac" con bloqueo del salvapantallas evita que la pantalla se apague durante una exposicion.
- Monitorizacion de aplicaciones concretas: la lista de aplicaciones vigiladas mantiene el sistema despierto solo mientras corre un programa determinado, sin retenciones permanentes.
- Descarga o copia a unidades externas: la funcion "Drive Alive" y el disparador de unidad conectada sostienen la sesion mientras se escribe en un disco externo.
- Tareas programadas nocturnas: el disparador por horario mantiene el Mac activo en una franja definida y lo libera al acabar.
- Automatizacion mediante enlaces: el esquema `protoart-wake://` permite activar o desactivar la retencion desde scripts, Shortcuts u otras herramientas.
- Uso en portatiles con alimentacion: el disparador del adaptador de corriente activa la retencion solo cuando el equipo esta enchufado, preservando bateria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de IA, no aplican metricas como MMLU, HumanEval o GSM8K. El unico dato de rendimiento declarado por el autor es que la aplicacion no consume procesador en reposo y que ocupa aproximadamente 1 MB.

## Requisitos de hardware

- VRAM: no aplica; no se ejecuta inferencia.
- GPU: no aplica.
- CPU y sistema: macOS 12 o superior, compatible con Apple Silicon e Intel.
- Espacio en disco: aproximadamente 1,1 MB para el DMG; el autor indica un tamano de aplicacion de alrededor de 1 MB.
- Cabe en cualquier Mac compatible con macOS 12, incluidos equipos de gama de entrada.
- Despliegue: instalacion del DMG. Al no estar notarizada, la primera apertura requiere autorizacion manual desde Ajustes del Sistema → Privacidad y seguridad → Abrir igualmente.
- Latencia y throughput: no aplicables.

## Comparativa con modelos similares

No disponible. No se han proporcionado alternativas comparables en la informacion recibida. Como referencia de categoria, existen utilidades de macOS con proposito equivalente (por ejemplo, Amphetamine o KeepingYouAwake), pero no se dispone de datos verificados en esta busqueda para establecer una comparacion de parametros, licencia o rendimiento.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como componente de pipelines de machine learning.
- La aplicacion no esta notarizada; la primera ejecucion exige el proceso manual de "Abrir igualmente" en Ajustes del Sistema, lo que puede chocar con politicas de seguridad corporativas.
- La model card no especifica los idiomas de la interfaz; solo se documenta en ingles.
- El repositorio presenta 0 descargas y 0 likes, por lo que no hay evidencia de adopcion ni de mantenimiento por parte de terceros.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto por no tratarse de un modelo generativo.
- La licencia Apache-2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias explicitas en la informacion disponible.
- El uso de aserciones de energia puede interferir con politicas de gestion de energia gestionadas por MDM en entornos corporativos; conviene validarlo antes de un despliegue masivo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/brushpenbob/protoart-wake
- Descarga directa del DMG: https://huggingface.co/brushpenbob/protoart-wake/resolve/main/ProtoArt-Wake-2.0.2.dmg
- Codigo fuente, instrucciones de compilacion y notas de version: https://github.com/theprotoart/protoart-wake
- Capturas de pantalla: https://raw.githubusercontent.com/theprotoart/protoart-wake/main/docs/screenshots/panel.jpg, https://raw.githubusercontent.com/theprotoart/protoart-wake/main/docs/screenshots/setup-card.jpg, https://raw.githubusercontent.com/theprotoart/protoart-wake/main/docs/screenshots/operators-card.jpg
