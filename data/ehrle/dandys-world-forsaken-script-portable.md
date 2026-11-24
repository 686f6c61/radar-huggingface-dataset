# EhRLe/dandys-world-forsaken-script-portable

## Resumen

El repositorio `EhRLe/dandys-world-forsaken-script-portable` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows (x64) que se presenta como un script portable para el videojuego *Dandy's World*, empaquetado en un archivo ZIP de 4,8 MB y distribuido a través de enlaces externos a GitHub. La model card incluye instrucciones de extracción con contraseña, ejecución como administrador y módulos de automatización de granja, teleport y ESP, entre otros. No hay pesos, tokenizador, configuración de arquitectura ni artefactos de inferencia de ningun tipo.

Por tanto, esta ficha no puede describir un modelo de lenguaje: no existe arquitectura transformer, no hay parametros, no hay contexto, no hay licencia de pesos y no hay benchmarks. La etiqueta `license:mit` del repositorio se refiere al metadato del paquete, no a un modelo. El contenido de la model card es, ademas, sospechoso desde el punto de vista de seguridad: enlaza a un binario `.exe` alojado en un repositorio de terceros (`martina1713/monster-hunter-wilds-trainer-mod-2026`), usa una contrasena generica (`2026`) y pide ejecucion como administrador, un patron habitual en campañas de distribucion de malware.

La relevancia de esta ficha es, por tanto, negativa: sirve para documentar que el artefacto no es un modelo open source evaluable y para advertir a desarrolladores e investigadores de que no debe tratarse como tal. Cualquier evaluacion tecnica de capacidades, rendimiento o despliegue es inaplicable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los tags de idioma del repo no corresponden a capacidades de un modelo) |
| Licencia | MIT (metadato del repositorio, no de pesos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto es un ejecutable Windows (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.exe`) empaquetado en un ZIP de 4,8 MB, con un build identificado como `v1.8.7 (425CC4)`. La model card describe modulos funcionales de tipo script de juego (bucle de farm automatizado, optimizador de framerate, alertas por webhook de Discord, teleport por coordenadas, ESP de entidades y cofres, configuracion JSON persistente), pero no aporta ningun detalle sobre datos, tokens, RLHF, DPO ni innovaciones de modelado.

No hay evidencia de que el binario haya sido auditado, firmado digitalmente ni publicado con codigo fuente verificable. La unica informacion tecnica disponible es la del empaquetado y la de los enlaces de descarga, que apuntan a un repositorio distinto del declarado como autor.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues verificables; los tags de idioma del repositorio no implican soporte real.
- El unico contenido funcional descrito son modulos de script para un videojuego (automatizacion, teleport, ESP, webhooks), sin documentacion tecnica que los respalde.

## Casos de uso

- No aplica: no es un modelo de IA y no debe integrarse en pipelines de inferencia, atencion al cliente, generacion de codigo ni analisis de datos.
- Auditoria de seguridad: el artefacto puede usarse como caso de estudio para formar a equipos en la identificacion de repositorios de Hugging Face que distribuyen binarios sospechosos con contrasena y ejecucion como administrador.
- Formacion en higiene de cadena de suministro: sirve para ejemplificar por que no debe ejecutarse un `.exe` descargado de un repositorio no verificado en un entorno de desarrollo.
- Documentacion de taxonomia: util para clasificar artefactos que no son modelos y evitar que aparezcan en indices de modelos open source.
- Analisis de reputacion de repositorios: permite estudiar patrones de model cards con insignias falsas de descargas y valoraciones.
- Respuesta a incidentes: si un usuario ha ejecutado el binario, el caso sirve para guiar una revision de persistencia, red y credenciales comprometidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, porque el artefacto no es un modelo evaluable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma de ejecucion descrita: Windows 10/11 de 64 bits.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama y TGI no son relevantes).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable porque el artefacto no es un modelo de IA. Cualquier comparacion con LLM open source seria erronea y enganosa.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal.
- Riesgo de seguridad alto: la model card enlaza a un binario `.exe` alojado en un repositorio de terceros, protegido por contrasena y con instrucciones de ejecucion como administrador, un patron compatible con distribucion de malware.
- Inconsistencia de identidad: el repositorio declarado (`EhRLe/...`) y los enlaces de descarga apuntan a repositorios distintos (`martina1713/...`, `joyce47111/...`), lo que impide verificar autoria.
- Indicadores de model card inflados: insignias de descargas (518K+) y valoracion (4,8/5) sin respaldo en las metricas reales del repositorio (0 descargas, 0 likes).
- Licencia: la etiqueta MIT del repositorio no cubre ni garantiza la seguridad del binario distribuido.
- Uso comercial: no aplica, y en cualquier caso el binario no esta documentado ni auditado.
- Recomendacion: no descargar ni ejecutar el artefacto; si ya se ha ejecutado, revisar el sistema en busca de persistencia y credenciales expuestas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EhRLe/dandys-world-forsaken-script-portable
- Enlace de descarga citado en la model card (no verificado, no recomendado): https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip
- Repositorio de terceros citado: https://github.com/joyce47111/dandys-world-forsaken-script-portable/releases/latest
