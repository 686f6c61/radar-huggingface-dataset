# Miradow/synapse-z-executor

## Resumen

`Miradow/synapse-z-executor` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es una model card que distribuye un ejecutable de Windows (`synapse-z-executor-v1.2.0-win64.exe`, build `v1.3.4`, `7442AD`) empaquetado en un ZIP de 8,9 MB protegido con contraseña. El texto se presenta como un "executor" para Roblox: un binario que se adjunta al proceso del cliente del juego para inyectar scripts Luau, con supuestas capacidades de hookmetamethod, getgc, Drawing API y compatibilidad sUNC superior al 98 %.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni artefactos de inferencia. Los tags de Hugging Face (`windows`, `windows-11`, `x64`, `portable`, `synapse-z-executor`) y la lista de idiomas son metadatos de descubrimiento, no indicadores de capacidades lingüísticas de un modelo. El pipeline figura como no disponible y las descargas y likes son cero en el momento de la consulta.

Desde el punto de vista de evaluación de modelos, esta ficha no puede aportar especificaciones técnicas de IA porque no existen. El interés real del repositorio es como caso de estudio de riesgo en la cadena de suministro: un binario cerrado, distribuido con contraseña en el archivo y con instrucciones explícitas de ejecutarlo como administrador y de desactivar las alertas de Windows Defender y SmartScreen. Se recomienda tratarlo como software potencialmente malicioso y no ejecutarlo en ningún entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (metadatos de la model card; no implican capacidades de un modelo) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors, GGUF ni ningún formato de pesos) |

## Arquitectura y entrenamiento

No aplica. No hay transformer, MoE, SSM ni modelo híbrido. El artefacto es un binario compilado para Windows 10 (22H2) y Windows 11 (24H2) sobre x64, con supuesta integración de una VM Luau y un mecanismo de adjunción a memoria de proceso. La model card menciona un "polling" de 157 Hz, tiempos de respuesta inferiores a 25 ms y 37 ms en distintas operaciones, y un consumo de RAM inferior a 26 MB, pero son cifras declaradas por el autor sin verificación independiente.

No se documenta ningún proceso de entrenamiento, dataset, RLHF, DPO ni innovación algorítmica. El texto describe funciones de inyección de scripts y sincronización de offsets tras parches del cliente, no capacidades aprendidas.

## Capacidades

- Inyección de scripts Luau en el proceso del cliente de Roblox, según la descripción del autor.
- Soporte declarado de `hookmetamethod`, `getgc` y Drawing API.
- Compatibilidad declarada superior al 98 % con la suite de pruebas sUNC.
- Adjunto multi-instancia y directorio de auto-ejecución.
- Sincronización de offsets tras actualizaciones del cliente.
- No hay generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente. La lista de idiomas es metadato de descubrimiento.

## Casos de uso

Ninguno de los casos siguientes se recomienda; se enumeran para describir lo que el autor declara y para contextualizar el riesgo.

- Ejecución de scripts en Roblox: el binario se adjuntaría al cliente del juego para cargar scripts de usuario, según la model card.
- Pruebas de compatibilidad sUNC: el autor afirma que el ejecutor pasa más del 98 % de la suite, lo que lo situaría como herramienta de validación de scripts.
- Automatización de tareas dentro del juego: el directorio de auto-ejecución recargaría scripts automáticamente.
- Escenarios multi-cuenta: el adjunto multi-instancia permitiría operar varios clientes a la vez.
- Desarrollo de scripts Luau: las APIs de introspección (`getgc`, `hookmetamethod`) se usarían para depurar scripts.
- Distribución de "presets" en la nube: el hub integrado permitiría lanzar scripts con un clic.

Advertencia: ejecutar binarios de procedencia no verificada, protegidos con contraseña y con instrucciones para desactivar el antivirus expone al usuario a malware, robo de credenciales y compromiso del sistema. Además, la modificación del cliente de Roblox infringe sus términos de servicio y puede conllevar el bloqueo de la cuenta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas métricas son declaraciones del autor sin metodología ni verificación: 157 Hz de polling, menos de 25 ms de respuesta, menos de 37 ms en sincronización de offsets, menos de 26 MB de RAM y 98 %+ de compatibilidad sUNC.

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia de modelo.
- CPU y SO: Windows 10 22H2 o Windows 11 24H2, x64 (Intel o AMD), según la model card.
- RAM: el autor declara menos de 26 MB en ejecución; no verificable.
- Disco: archivo ZIP de 8,9 MB más el contenido extraído.
- GPU: no aplica.
- Despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: solo cifras declaradas por el autor, sin reproducibilidad.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como comparación categórica, otros ejecutores de Roblox (Synapse X, Krnl, Fluxus) son también binarios cerrados de terceros con riesgos similares de seguridad y de cumplimiento de términos de servicio; no se dispone de datos verificables para una comparación técnica.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no tiene pesos ni contexto. Cualquier evaluación como modelo es improcedente.
- Riesgo de malware: binario cerrado, distribuido en un ZIP con contraseña (`2026`) y con instrucciones para ejecutarlo como administrador y desactivar Defender y SmartScreen. Es un patrón habitual de distribución de software malicioso.
- Sin trazabilidad: el enlace de descarga apunta a un repositorio de GitHub (`mDanielsson924/synapse-z-executor`) distinto del espacio de Hugging Face, sin verificación de integridad publicada.
- Incumplimiento de términos: la modificación del cliente de Roblox viola sus condiciones de uso y puede provocar el bloqueo permanente de cuentas.
- Licencia: aunque se declara MIT en los metadatos, esta licencia no cubre el binario de terceros ni exime de responsabilidad por su uso.
- Cero señales de confianza: 0 descargas, 0 likes, cuenta sin historial verificable y fecha de creación futura en los metadatos (2026-11-24), lo que sugiere metadatos inconsistentes o generados automáticamente.
- Repositorio de Hugging Face inadecuado: la plataforma está pensada para modelos y datasets; alojar ejecutables de este tipo puede vulnerar sus políticas de contenido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Miradow/synapse-z-executor
- Repositorio de GitHub citado en la model card: https://github.com/mDanielsson924/synapse-z-executor
- Última release citada: https://github.com/mDanielsson924/synapse-z-executor/releases/latest
- Descarga directa citada (no recomendada): https://github.com/mDanielsson924/synapse-z-executor/releases/latest/download/synapse-z-executor-v1.2.0-win64.zip
