# mahi18d/delta-executor-pc

## Resumen

`mahi18d/delta-executor-pc` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial, sino una supuesta utilidad ejecutable para Windows x64 orientada a la ejecución de scripts en Roblox (coloquialmente un "executor"). El autor declarado es `mahi18d`, aunque la model card referencia repositorios de GitHub de terceros (`vikramlarsson/delta-executor-pc` y `RenSiekiera/repo-cheat-mod-menu`) desde los que se distribuye un archivo ZIP de 4,8 MB protegido con contraseña. No existe pipeline, arquitectura, pesos ni artefactos de inferencia asociados.

La relevancia de esta ficha es fundamentalmente de advertencia: el repositorio aparece etiquetado con metadatos de modelo (idiomas, licencia MIT, tags de región) pero su contenido es un binario `.exe` que se distribuye mediante ingeniería social, con instrucciones para desactivar avisos de Windows Defender/SmartScreen y ejecutarlo como administrador. Esto es un patrón habitual de distribución de malware. No debe tratarse como un modelo de lenguaje ni integrarse en ningún pipeline de IA.

Por tanto, todas las secciones técnicas siguientes se completan indicando "no disponible" en los campos propios de un modelo, y se documentan los riesgos observados en el material proporcionado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario para Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo, no verificables como capacidades del artefacto) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`, no safetensors/GGUF) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene pesos, tokenizador, configuración de transformer ni dataset de entrenamiento. El contenido descrito en la model card es un ejecutable (`repo-cheat-mod-menu-v1.2.2-win64.exe`, build `v2.3.5` / `642F44962E`) empaquetado en un ZIP de 4,8 MB con contraseña `2026`, junto con instrucciones para extraerlo y ejecutarlo con privilegios de administrador.

Las afirmaciones técnicas de la model card (respuesta en `< 29 ms`, `< 11 ms`, "98,4 % de consistencia sUNC", "5 hilos worker", API `hookmetamethod`/`getgc`/`Drawing`) corresponden al dominio de ejecución de scripts en Roblox, no a inferencia de modelos. No hay información verificable sobre metodología, procedencia del binario ni cadena de compilación.

## Capacidades

- No es un modelo generativo: no realiza generación de texto, razonamiento, código, matemáticas ni visión.
- No dispone de tool calling ni function calling en el sentido de API de modelos.
- No soporta agentes ni razonamiento multi-paso.
- Las capacidades multilingües declaradas en los tags no están respaldadas por artefactos de modelo.
- La model card menciona funciones de ejecución de scripts, editor Monaco, auto-ejecución y "script hub", propias de un executor de Roblox, no de un LLM.

## Casos de uso

- No se identifican casos de uso legítimos como modelo de IA: no hay pesos ni API de inferencia.
- Integración en pipelines de IA: no viable, no existe artefacto de modelo.
- Evaluación comparativa de modelos: no aplica.
- Despliegue en vLLM, TGI, llama.cpp u Ollama: no aplica, no hay pesos.
- Fine-tuning o destilación: no aplica, no hay checkpoint base.
- Uso como dependencia de producción: desaconsejado; la distribución se realiza mediante un ejecutable de terceros con instrucciones para eludir controles de seguridad de Windows.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Las cifras presentes en la model card (`< 29 ms`, `< 11 ms`, `98,4 %`, `97,8 %`, `97,6 %`) son afirmaciones del autor sobre latencia y "consistencia" de módulos del ejecutable, sin metodología, conjunto de evaluación ni reproducibilidad, y no corresponden a métricas de modelos (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no es un modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles como métricas de modelo.
- Requisito del artefacto declarado: Windows 10/11 de 64 bits sobre CPU x64 (Intel o AMD), según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mahi18d/delta-executor-pc` | no disponible (no es modelo) | no disponible | sin benchmarks | MIT (declarada) | repo HF sin descargas ni likes; binario vía GitHub de terceros |
| Modelos comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No existe categoría de modelo comparable: el artefacto no es un modelo de lenguaje, por lo que la comparación con LLMs no procede.

## Limitaciones y advertencias

- No es un modelo de IA: tratarlo como tal introduce un riesgo de seguridad en cualquier pipeline.
- Distribución mediante ingeniería social: la model card instruye explícitamente a desactivar o ignorar avisos de Windows Defender y SmartScreen y a ejecutar el `.exe` como administrador, patrón característico de malware.
- Cadena de suministro no verificable: el ZIP se aloja en releases de repositorios GitHub de terceros (`RenSiekiera/repo-cheat-mod-menu`, `vikramlarsson/delta-executor-pc`), no en el propio repo de Hugging Face.
- Contraseña de descompresión fija (`2026`) usada como mecanismo de evasión de análisis automatizado de archivos.
- Riesgo legal: los "executors" de Roblox vulneran los términos de servicio de la plataforma y pueden facilitar trampas en entornos multijugador.
- Licencia MIT declarada en metadatos, pero sin garantías sobre el contenido binario distribuido; la licencia no cubre responsabilidades derivadas de la ejecución del `.exe`.
- Cero señales de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública.
- Fecha de creación declarada (2026-11-24) posterior a la fecha de esta ficha, lo que impide verificar historicidad del artefacto.
- Recomendación: no descargar, no extraer y no ejecutar el binario; reportar el repositorio a Hugging Face si se confirma la distribución de software malicioso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mahi18d/delta-executor-pc
- Release citada en la model card: https://github.com/RenSiekiera/repo-cheat-mod-menu/releases/download/v1.2.0/repo-cheat-mod-menu-v1.2.2-win64.zip
- Repositorio GitHub citado: https://github.com/vikramlarsson/delta-executor-pc
- Repositorio GitHub citado: https://github.com/RenSiekiera/repo-cheat-mod-menu
- Paper, blog o demo oficial: no disponible
