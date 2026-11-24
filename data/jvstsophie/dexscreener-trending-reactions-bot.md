# JvstSophie/dexscreener-trending-reactions-bot

## Resumen

`JvstSophie/dexscreener-trending-reactions-bot` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete ejecutable portable para Windows de 64 bits (build `v3.2.7`, firma `979B7FB2B4`) distribuido como archivo ZIP de 4,8 MB con contrasena de extraccion. El autor lo presenta bajo el nombre "Dexscreener Trending Reactions Bot" y lo etiqueta con metadatos de modelo (`license:mit`, lista de idiomas), pero el contenido real es un binario `.exe` que se ejecuta como administrador en Windows 10 u 11.

La model card describe modulos de "runtime sin telemetria", "aceleracion por GPU", "desbloqueo total de estacion de trabajo", "licencias 100 % offline" y "cero marcas de agua", ademas de instrucciones para descargar el archivo desde un repositorio de GitHub de terceros (`JoaoSchaefer973/rob-run-cheat-mod-menu-2026`) y extraerlo con la contrasena `2026`. No se declara ninguna arquitectura neuronal, numero de parametros, longitud de contexto ni formato de pesos (safetensors, GGUF u otros).

Por tanto, esta ficha no puede evaluar capacidades de IA: no hay pesos, no hay pipeline declarado y no hay benchmarks. El repositorio presenta los patrones tipicos de una campana de distribucion de software potencialmente no deseado (binario ofuscado, contrasena en el archivo, enlaces a un repo ajeno, promesas de "desbloqueo" y ausencia de codigo fuente verificable). Se documenta aqui unicamente con fines de analisis y advertencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; binario ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos, no verificable) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es `rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip`, 4,8 MB, con `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal que describir. El artefacto es un ejecutable nativo para Windows x64 (`rob-run-cheat-mod-menu-2026-v1.2.2-win64.exe`) empaquetado en un ZIP protegido con contrasena. La model card menciona de forma generica "CUDA, TensorRT, DirectML y OpenCL" y un consumo de memoria de "< 28 MB" / "< 49 MB" de RAM, cifras incompatibles con cualquier modelo de lenguaje y coherentes con una aplicacion de escritorio ligera.

No se documenta ningun dataset, proceso de preentrenamiento, ajuste supervisado, RLHF o DPO. Tampoco se aporta informacion sobre tokenizador, ventana de atencion ni innovaciones tecnicas de inferencia (decodificacion especulativa, atencion lineal, etc.). La unica "innovacion" declarada es la ausencia de telemetria y la activacion offline, afirmaciones no verificables sin acceso al binario.

## Capacidades

- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- El caracter multilingue se limita a una lista de 14 codigos de idioma en los metadatos, sin evidencia de capacidad real.
- Las unicas funciones descritas son propias de una utilidad de escritorio: "runtime sin telemetria", "aceleracion por GPU", "desbloqueo de estacion de trabajo", "licencias offline" y "eliminacion de marcas de agua".
- No hay modo "thinking", ni entrada de audio, ni ninguna modalidad adicional.

## Casos de uso

- **No aplicable como modelo de IA**: el repositorio no contiene pesos ni API de inferencia, por lo que no puede emplearse para generacion de texto, codigo, resumen, traduccion ni ninguna tarea de NLP.
- **Auditoria de seguridad**: un equipo de seguridad puede usar la ficha y los metadatos como referencia para identificar y bloquear el artefacto en redes corporativas, dado el patron de distribucion (ZIP con contrasena, enlace a un repo de GitHub ajeno, binario ejecutado como administrador).
- **Analisis de campanas de malware en Hugging Face**: util para estudiar como se abusa de las etiquetas de modelo y de la licencia MIT para dar apariencia legitima a binarios.
- **Formacion en higiene de cadena de suministro**: caso practico para explicar por que no deben ejecutarse binarios descargados de repositorios sin codigo fuente ni firmas verificables.
- **Investigacion de fraude en criptoactivos**: el nombre hace referencia a Dexscreener y a "reactions", lo que sugiere automatizacion de interacciones en plataformas de trading; puede servir como ejemplo de ingenieria social dirigida a traders.
- **Verificacion de politicas de plataforma**: permite ilustrar los criterios que deberia aplicar un equipo de moderacion para retirar contenido que no es un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ya que el artefacto no es un modelo de lenguaje. Las cifras de la model card ("Rating 4.9/5", "97.5 % de consistencia") son afirmaciones de marketing sin metodologia ni fuente.

## Requisitos de hardware

- **VRAM**: no aplica; no hay inferencia de red neuronal.
- **GPU recomendadas**: la model card menciona CUDA, TensorRT, DirectML y OpenCL, pero sin modelos concretos ni versiones de driver.
- **GPU de consumo**: no aplica.
- **Sistema operativo**: Windows 10 u 11 de 64 bits, con ejecucion como administrador.
- **Almacenamiento**: 4,8 MB para el ZIP; el tamano descomprimido no se especifica.
- **Memoria RAM**: la model card afirma "< 28 MB" y "< 49 MB" en distintos modulos, dato no verificable.
- **Opciones de despliegue**: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI posibles).

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos" comparable, ya que el artefacto no es un modelo de IA. Frente a un modelo open source real de ~1B parametros (por ejemplo, variantes tipo Llama o Qwen), las diferencias serian absolutas: aquellos publican pesos en safetensors/GGUF, tokenizador, config y benchmarks; este repositorio solo publica un ZIP con un `.exe`.

| Criterio | Este repositorio | Modelo open source tipico (~1B) |
|---|---|---|
| Pesos publicados | No | Si (safetensors/GGUF) |
| Parametros | No disponible | ~1000 M |
| Contexto | No disponible | 4k-128k segun modelo |
| Benchmarks | No | Si (MMLU, GSM8K, etc.) |
| Codigo fuente | No | Si |
| Licencia | MIT declarada | MIT/Apache-2.0/etc. |

## Limitaciones y advertencias

- **No es un modelo de IA**: no puede usarse para ninguna tarea de generacion, razonamiento o analisis de lenguaje.
- **Riesgo de seguridad alto**: binario `.exe` distribuido en un ZIP con contrasena, alojado en un repositorio de GitHub de terceros distinto del autor declarado, y con instrucciones para ejecutarlo como administrador. Patron habitual de malware o adware.
- **Enlaces no verificables**: el enlace de descarga apunta a `JoaoSchaefer973/rob-run-cheat-mod-menu-2026`, no al espacio del autor `JvstSophie`; el contenido puede cambiar sin trazabilidad.
- **Metadatos enganosos**: las etiquetas de idioma, la licencia MIT y el pipeline ausente simulan ser un modelo para mejorar la visibilidad en busquedas.
- **Sin codigo fuente ni firmas**: no hay hash publicado, firma de codigo ni repositorio de origen auditable.
- **Riesgo financiero**: el nombre sugiere automatizacion de interacciones en Dexscreener; los usuarios podrian exponer claves de wallet o credenciales.
- **Licencia**: aunque se declara MIT, esta no cubre responsabilidad alguna sobre el binario; su aplicacion a un ejecutable sin fuente es cuando menos dudosa.
- **Cero adopcion**: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que haya sido auditado por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JvstSophie/dexscreener-trending-reactions-bot
- Enlace de descarga citado en la model card (terceros, no verificado): https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026/releases/download/v1.2.0/rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip
- Repositorio de releases citado: https://github.com/Elsa10351/dexscreener-trending-reactions-bot/releases/latest
- Paper, blog o demo: no disponible
