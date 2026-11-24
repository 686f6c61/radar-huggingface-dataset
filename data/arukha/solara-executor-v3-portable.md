# Arukha/solara-executor-v3-portable

## Resumen

La entrada `Arukha/solara-executor-v3-portable` alojada en Hugging Face no es un modelo de inteligencia artificial ni un artefacto de aprendizaje automatico. Se trata de un repositorio que distribuye un supuesto ejecutor de scripts para Roblox (un binario portable para Windows x64), empaquetado en un archivo ZIP protegido con contrasena y enlazado a un repositorio de GitHub de terceros. La model card no contiene ninguna especificacion de arquitectura neuronal, pesos, tokenizador ni datos de entrenamiento.

El contenido del README es material promocional de un ejecutor de scripts (inyeccion de Luau en el cliente de Roblox, compatibilidad sUNC, editor Monaco, multi-instancia) y no describe ningun modelo de lenguaje. Los tags de Hugging Face (`windows`, `x64`, `portable`) confirman que el artefacto es software de escritorio, no un checkpoint de IA. Por tanto, esta ficha documenta la entrada como lo que es y advierte de los riesgos asociados.

No existe informacion tecnica verificable sobre parametros, contexto, cuantizacion ni rendimiento en benchmarks, ya que el objeto distribuido no es un modelo. Cualquier evaluacion como modelo de IA es, por definicion, no aplicable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; el artefacto es un binario Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal que describir. El repositorio no contiene checkpoints, configuraciones de transformer, tokenizadores ni scripts de entrenamiento. El README describe un supuesto ejecutor de scripts para Roblox con modulos de "post-patch offset sync", "instant client attach", "keyless execution flow" y compatibilidad sUNC, ademas de un editor Monaco integrado. Estos terminos pertenecen al ambito de la inyeccion de codigo en clientes de videojuegos, no al entrenamiento de modelos.

No se documenta ningun proceso de entrenamiento, dataset, RLHF, DPO ni innovacion en atencion o decodificacion. El binario se distribuye como `fisch-script-auto-catch-macro-v1.2.2-win64.zip` (4,8 MB) con contrasena `2026`, alojado en un repositorio de GitHub de un tercero (`ekaterina96522/fisch-script-auto-catch-macro`), lo que constituye una cadena de distribucion ajena a Hugging Face y sin verificacion de integridad publicada.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de APIs de modelos.
- No soporta agentes ni razonamiento multi-paso.
- El README atribuye al binario capacidades de inyeccion de scripts Luau en el cliente de Roblox, editor Monaco con resaltado de sintaxis y multiples instancias.
- Los idiomas listados en los metadatos corresponden a la model card, no a capacidades linguisticas del artefacto.
- Cualquier capacidad de "ejecucion de scripts" descrita debe tratarse como no verificada y potencialmente maliciosa.

## Casos de uso

- No aplica como modelo de IA: no hay escenario legitimo de inferencia, generacion o analisis.
- Auditoria de seguridad: un equipo puede usar esta entrada como caso de estudio de repositorios que suplantan model cards para distribuir binarios de dudosa procedencia.
- Formacion en higiene de supply chain: sirve para ilustrar practicas de riesgo (ZIP con contrasena, enlaces a repos de terceros, badges de descargas inflados, instrucciones de "ejecutar como administrador").
- Monitorizacion de plataformas: util para equipos que gestionan Hugging Face y necesitan patrones de deteccion de contenido ajeno a modelos.
- No se recomienda su descarga, extraccion ni ejecucion en entornos de produccion, personales o corporativos.
- No existe un caso de uso valido para desarrolladores o investigadores que busquen un modelo de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README incluye cifras de marketing no verificables (735K descargas, valoracion 4,8/5, "98%+ sUNC", "99,9% de consistencia") que no son benchmarks de modelos y no deben interpretarse como metricas de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponible.
- El artefacto declara requerir Windows 10/11 de 64 bits y menos de 42 MB de RAM segun el README, dato no verificado y sin relevancia para cargas de IA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| Arukha/solara-executor-v3-portable | no aplica | no aplica | MIT (declarada) | Hugging Face (0 descargas, 0 likes) | Binario Windows, no modelo de IA |
| Modelos de lenguaje open source comparables | no disponible | no disponible | no disponible | no disponible | No existe categoria comparable |

No hay modelos de IA comparables porque la entrada no pertenece a esa categoria.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generacion de texto, codigo o razonamiento es infundada.
- Riesgo de seguridad alto: el README instruye a descargar un ZIP con contrasena desde un repositorio de GitHub de un tercero y ejecutar un `.exe` como administrador, patron habitual en campanas de malware.
- El propio README reconoce alertas de Windows Defender y SmartScreen, y pide desactivarlas o whitelistear el directorio, lo que agrava el riesgo.
- Suplantacion de categoria: la entrada ocupa espacio de modelos en Hugging Face con metadatos de idiomas y licencia MIT que no corresponden a un modelo.
- Sin verificacion de integridad: no se publican hashes, firmas ni auditorias del binario.
- La licencia MIT declarada no garantiza la legitimidad ni la seguridad del contenido distribuido.
- Uso comercial: desaconsejado por completo; el artefacto no tiene relacion con cargas de IA y su ejecucion puede comprometer el sistema.
- No usar en produccion, en estaciones de trabajo corporativas ni en entornos con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Arukha/solara-executor-v3-portable
- Repositorio de GitHub enlazado en el README (tercero, no verificado): https://github.com/ekaterina96522/fisch-script-auto-catch-macro
- Releases del repositorio enlazado (tercero, no verificado): https://github.com/Angelal27289/solara-executor-v3-portable/releases/latest
- Paper, blog, demo o documentacion tecnica: no disponible
