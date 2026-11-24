# Marselox/deadlock-cheat-aimbot-esp-2026

## Resumen

El repositorio `Marselox/deadlock-cheat-aimbot-esp-2026` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de una publicacion que distribuye un ejecutable de Windows (`deadlock-cheat-aimbot-esp-2026-v1.2.0-win64.exe`, comprimido en un ZIP de 8,9 MB) presentado como una herramienta de trampas (aimbot y ESP, es decir, superposicion de informacion del juego) para el titulo *Deadlock* de Valve. La model card emplea el formato habitual de Hugging Face (frontmatter YAML con `license`, `language` y `tags`) para dar apariencia de artefacto legitimo, pero el contenido es un instructivo de descarga y ejecucion de binarios.

No existe arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia asociados. Los campos de la ficha de Hugging Face muestran `pipeline: no disponible`, cero descargas y cero likes en el momento de la consulta, y la unica documentacion es un README con instrucciones para descomprimir el archivo con la contrasena `2026` y ejecutarlo como administrador. Los enlaces de descarga apuntan a un repositorio de GitHub de terceros (`JanetDang527/deadlock-cheat-aimbot-esp-2026`), no al propio espacio de Hugging Face.

Desde el punto de vista de evaluacion de modelos, esta ficha no puede completarse con datos tecnicos de IA porque no los hay. Lo relevante para desarrolladores e investigadores es identificar el patron: uso de plataformas de modelos abiertos para distribuir software de dudosa procedencia, con tecnicas de ingenieria social (insignias de descargas y valoraciones inventadas, contrasena en el archivo, ejecucion como administrador). Se recomienda no descargar ni ejecutar el binario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos de la model card, sin relacion con capacidades linguisticas reales) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`) |

## Arquitectura y entrenamiento

No aplica. No hay arquitectura de transformer, MoE, SSM ni modelo hibrido. No existen datos de entrenamiento, tokens procesados, composicion de dataset ni fases de RLHF, DPO o SFT. El unico contenido tecnico declarado en la model card son modulos de un supuesto software de trampas: suavizado de entrada bezier, escaner dinamico de offsets, perfiles JSON intercambiables en caliente, overlay externo a 144 Hz, nucleo en modo usuario y radar 2D con filtro de botin. Estos terminos describen funcionalidad de un cheat de videojuego, no componentes de un modelo de lenguaje.

El binario se presenta como compilacion `v3.8.2` (build `7A8BD35427`), orientado a Windows de 64 bits, con un consumo declarado inferior a 59 MB de RAM y 10-11 hilos de trabajo. Ninguna de estas cifras es verificable desde la informacion disponible y no constituyen especificaciones de un modelo.

## Capacidades

- No ofrece generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; la lista de idiomas en los metadatos es decorativa.
- No dispone de modo thinking, audio ni ninguna capacidad cognitiva.
- El unico proposito declarado es la manipulacion de un videojuego mediante aimbot y ESP.

## Casos de uso

- No existen casos de uso legitimos como modelo de IA. Las aplicaciones que declara el autor (trampas en *Deadlock*) violan los terminos de servicio del juego y no son un uso aceptable de una plataforma de modelos.
- Investigacion de seguridad: analisis del patron de distribucion de malware o software no verificado en Hugging Face, para estudiar como se abusa del frontmatter y de las insignias falsas.
- Formacion en deteccion de ingenieria social: ejemplo de contrasena embebida en el README y peticion de ejecucion como administrador.
- Auditoria de moderacion de plataformas: caso de contenido que deberia activar revision por parte del equipo de Hugging Face.
- No se recomienda ningun uso operativo del binario en entornos de produccion, desarrollo ni personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion de modelos, porque no hay modelo que evaluar. Las cifras que aparecen en la model card (latencia inferior a 22 ms, 97,8 % de consistencia, menos de 59 MB de RAM) corresponden al supuesto software de trampas y no son verificables ni comparables.

## Requisitos de hardware

- VRAM estimada: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Plataforma declarada: Windows 10 u 11 de 64 bits, con ejecucion como administrador.
- Latencia y throughput: no disponibles; las cifras del README no son contrastables.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable porque el artefacto no es un modelo de IA. Frente a otros repositorios de Hugging Face, la diferencia relevante es que un modelo real incluye pesos en `safetensors` o GGUF, un tokenizador y una model card con arquitectura y evaluaciones; aqui solo hay un enlace a un ZIP externo con un ejecutable.

## Limitaciones y advertencias

- Riesgo de seguridad alto: el artefacto es un binario de procedencia desconocida distribuido mediante un repositorio de terceros, con contrasena para dificultar el analisis automatico.
- La peticion de ejecutar como administrador otorga privilegios elevados a codigo no verificado.
- Las insignias de descargas (344K+) y valoracion (4,8/5) del README son texto estatico, no datos reales de la plataforma.
- La licencia MIT declarada no garantiza legitimidad ni seguridad del binario.
- Uso prohibido por los terminos de servicio de *Deadlock* y potencialmente ilegal segun la jurisdiccion; puede conllevar el baneo de cuentas.
- Posible vector de malware: la combinacion de contrasena en el archivo, ejecutable y permisos de administrador es un patron habitual en campanas de distribucion de software malicioso.
- No usar en produccion, en equipos personales ni en entornos corporativos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Marselox/deadlock-cheat-aimbot-esp-2026
- Repositorio de GitHub referenciado en la model card (no verificado, no recomendado): https://github.com/JanetDang527/deadlock-cheat-aimbot-esp-2026
- Pagina de releases referenciada: https://github.com/JanetDang527/deadlock-cheat-aimbot-esp-2026/releases/latest
