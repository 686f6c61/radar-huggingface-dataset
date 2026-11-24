# samirai77/real-executor

## Resumen

`samirai77/real-executor` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es la model card de una supuesta aplicación ejecutable para Windows 10 y Windows 11 denominada "Real Executor", distribuida como archivo `real-executor-v1.2.0-win64.zip` (8,9 MB) con contraseña de descompresión `2026` y binario `real-executor-v1.2.0-win64.exe`. La propia model card se autodescribe como un "roblox executor", es decir, una herramienta de inyección de scripts Luau en el cliente de Roblox, con supuesta compatibilidad sUNC del 98 % y adjunción multi-instancia.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni artefactos de inferencia. La etiqueta `pipeline` figura como no disponible y el conteo de descargas y likes es cero. Los metadatos declaran licencia MIT y una lista de catorce idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id), pero esa lista corresponde a los idiomas declarados en la model card y no a capacidades lingüísticas verificadas de ningún modelo.

Por tanto, esta ficha documenta un artefacto que no cumple los criterios mínimos para ser evaluado como modelo de IA. Todos los apartados técnicos que dependen de arquitectura, entrenamiento, benchmarks o requisitos de inferencia se marcan como no disponibles. Se recomienda precaución: la distribución de ejecutables de terceros con contraseña en archivos comprimidos y con instrucciones para desactivar avisos de SmartScreen es un patrón habitual en campañas de malware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible como capacidad de modelo; la model card declara en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es `real-executor-v1.2.0-win64.zip`, 8,9 MB, con binario `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El contenido del repositorio es una model card con formato de página de descarga que describe un ejecutable de Windows con las siguientes características declaradas por el autor: plataforma objetivo Windows 10 y Windows 11 de 64 bits, build `v1.2.8` (`711C14C77C`), archivo `real-executor-v1.2.0-win64.zip` de 8,9 MB, contraseña de descompresión `2026` y binario `real-executor-v1.2.0-win64.exe`.

Las supuestas innovaciones técnicas que menciona la model card son propias de un "executor" de Roblox, no de un modelo de lenguaje: adjunción instantánea al cliente con puente de VM Luau, compatibilidad sUNC del 98 % con `hookmetamethod`, `getgc` y Drawing API, flujo de ejecución sin clave, sincronización de offsets tras parches del cliente los miércoles, hub de scripts integrado y adjunción multi-instancia con seis hilos de trabajo. No se aporta ninguna evidencia verificable de estas afirmaciones ni código fuente auditable.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe verificada; la lista de idiomas de los metadatos no va acompañada de evaluación alguna.
- Las únicas capacidades declaradas son de inyección de scripts Luau en el cliente de Roblox: adjunción al proceso, compatibilidad sUNC, ejecución de presets desde un hub y adjunción multi-instancia.

## Casos de uso

No se pueden proponer casos de uso legítimos de un modelo de IA, porque el artefacto no es un modelo. Los escenarios que describe la model card son los siguientes, expuestos aquí únicamente como descripción del contenido del repositorio y no como recomendación:

- Inyección de scripts Luau en el cliente de Roblox mediante adjunción al proceso, según declara la model card.
- Ejecución de presets alojados en la nube desde un hub de scripts integrado.
- Ejecución concurrente sobre varias instancias del cliente mediante adjunción multi-instancia.
- Uso de APIs de dibujo (`Drawing API`) y hooks de metatablas (`hookmetamethod`, `getgc`) dentro del entorno declarado.
- Actualización de offsets tras los parches del cliente, según la descripción del autor.
- Distribución del binario mediante un archivo ZIP protegido con contraseña y un repositorio de GitHub de terceros.

Ninguno de estos escenarios corresponde a un uso de inferencia de IA, y varios de ellos entran en conflicto con los términos de servicio de Roblox.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye cifras de marketing no verificables (98 %+ de compatibilidad sUNC, 99,7 % de consistencia, respuesta en menos de 11 ms, seis hilos de trabajo, 807K descargas y 99 % de valoración), pero no son resultados de benchmarks de modelos y no van acompañadas de metodología, conjunto de evaluación ni reproducción.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que inferir.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card (menos de 11 ms) no son verificables ni corresponden a inferencia de IA.
- Requisitos del artefacto declarado: Windows 10 o Windows 11 de 64 bits sobre CPU Intel o AMD x64, archivo de 8,9 MB y ejecución como administrador según las instrucciones del autor.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoría, los resultados de búsqueda apuntan a otros proyectos con nombre parecido pero naturaleza distinta: `projectreal.gg` (sitio del supuesto equipo oficial del executor de Roblox), `executor-ai.com` (automatización de operaciones con IA) y `react-native-executorch` de Software Mansion (toolkit para ejecutar modelos en dispositivo con ExecuTorch). Ninguno de ellos es equivalente ni sirve como comparación técnica de este repositorio.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador, configuración ni artefactos de inferencia. No es evaluable como modelo.
- La model card es material promocional de un ejecutable de terceros, no documentación técnica verificable.
- Distribución de un binario `.exe` dentro de un ZIP protegido con contraseña (`2026`), alojado en un repositorio de GitHub ajeno al espacio de nombres del autor en Hugging Face: patrón habitual en campañas de malware.
- Instrucción explícita de ejecutar como administrador y de desactivar o ignorar avisos de Windows Defender y SmartScreen: reduce las defensas del sistema y no debe seguirse sin análisis previo.
- Cifras de descargas, valoración y compatibilidad no verificables y sin metodología.
- La licencia MIT declarada no aporta garantías sobre el binario distribuido ni sobre su procedencia.
- Uso incompatible con los términos de servicio de Roblox y posible infracción de derechos de terceros.
- Riesgo de robo de credenciales, instalación de software no deseado o compromiso del equipo si se ejecuta el binario.
- No se debe desplegar en producción ni en entornos de desarrollo con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/samirai77/real-executor
- Repositorio de GitHub citado en la model card: https://github.com/Sarag51632/real-executor
- Descarga citada en la model card (no verificar ni ejecutar sin análisis): https://github.com/Sarag51632/real-executor/releases/latest/download/real-executor-v1.2.0-win64.zip
- Sitio del supuesto equipo del proyecto: https://projectreal.gg/en/about/
- Página de descarga del supuesto proyecto: https://projectreal.gg/en/download/
- Executor-AI (proyecto distinto, automatización con IA): https://executor-ai.com/
- React Native ExecuTorch (proyecto distinto, inferencia en dispositivo): https://executorch.swmansion.com/
- Repositorio de React Native ExecuTorch: https://github.com/software-mansion/react-native-executorch
