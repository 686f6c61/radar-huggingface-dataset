# lorenzo050803/schedule-i-mod-menu

## Resumen

`lorenzo050803/schedule-i-mod-menu` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial, sino un supuesto ejecutable para Windows distribuido como archivo ZIP (`solara-executor-v3-keyless-2026-v1.2.2-win64.zip`, 4,8 MB). El autor lo presenta como un "mod menu" para el videojuego *Schedule I*, con funciones de overlay, suavizado de entrada y un sistema de "panic key" para descargar el proceso. No existe pipeline declarado, ni pesos, ni arquitectura de red neuronal, ni tokenizador, ni tarjetas de modelo con métricas de evaluación.

El repositorio se publicó el 24 de noviembre de 2026 y no registra descargas ni interacciones en el momento de la consulta. Los tags declarados (windows, x64, portable, en, ru, zh, es, etc.) describen un binario portable y sus idiomas de interfaz, no capacidades lingüísticas de un modelo generativo. La licencia declarada es MIT, aunque esta se aplica al contenido del repositorio y no a un artefacto de IA.

Desde la perspectiva de un desarrollador o investigador que evalúa modelos, este repositorio no es utilizable como modelo: no hay ficheros de pesos, no hay API de inferencia y el contenido de la model card es material promocional de un ejecutable de terceros. Se documenta aquí únicamente para dejar constancia de su naturaleza y de los riesgos asociados a su descarga y ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según tags; corresponden a la interfaz del ejecutable, no a capacidades de un modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni una arquitectura de red neuronal. El artefacto descrito en la model card es un binario `solara-executor-v3-keyless-2026-v1.2.2-win64.exe` empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`. No se documenta proceso de entrenamiento, conjunto de datos, técnicas de alineación (RLHF, DPO) ni innovación algorítmica alguna.

La model card menciona componentes propios de software de trampas para videojuegos (overlay externo, escáner de offsets, "bezier input smoothing", exclusión de captura en OBS/ShadowPlay/Discord), lo que refuerza que se trata de una herramienta de modificación de cliente de juego y no de un modelo de lenguaje.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un modelo generativo; los idiomas listados corresponden a la interfaz del ejecutable.
- El artefacto declarado ofrece, según su autor, overlay externo, suavizado de entrada y descarga mediante tecla de pánico, funcionalidades propias de un software de modificación de cliente de juego.

## Casos de uso

- No aplica como modelo de IA: no hay inferencia posible, ni API, ni pesos que cargar en un runtime (vLLM, llama.cpp, TGI, transformers).
- No es adecuado para atención al cliente, generación de código, análisis documental, traducción automática ni ninguna tarea de procesamiento de lenguaje natural.
- No es adecuado para investigación en IA: no hay artefacto reproducible ni métricas.
- Su uso previsto, según el autor, es la modificación del cliente del videojuego *Schedule I* en Windows 10/11 x64, lo que queda fuera del ámbito de esta ficha.
- Cualquier evaluación técnica del binario requeriría análisis de malware en un entorno aislado, no pruebas de rendimiento de modelo.
- No se recomienda su descarga ni ejecución en entornos de desarrollo o producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA, porque el repositorio no contiene un modelo evaluable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles.
- Requisitos del artefacto declarado: Windows 10 (22H2) o Windows 11 (24H2), procesador x64 Intel o AMD, 4,8 MB de espacio en disco para el ZIP.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el repositorio no contiene un modelo de IA. Frente a modelos open source reales (por ejemplo, familias Llama, Mistral, Qwen o Gemma), la comparación carece de sentido: aquellos publican pesos en safetensors o GGUF, tokenizador, arquitectura documentada y evaluaciones; este repositorio no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- No es un modelo de IA: no puede utilizarse para ninguna tarea de inferencia, generación o análisis.
- El contenido de la model card es material promocional de un ejecutable de terceros, con enlaces a repositorios de GitHub ajenos al espacio de Hugging Face del autor.
- La distribución de un `.exe` protegido con contraseña y la petición de ejecutarlo "como administrador" son patrones habituales en campañas de malware; se recomienda no descargarlo ni ejecutarlo.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`schneider6972`, `cSchmidt73736`), no verificados, lo que impide garantizar la integridad del binario.
- La licencia MIT declarada no implica auditoría de seguridad ni garantía alguna sobre el ejecutable.
- El uso de software de modificación de clientes de juego puede infringir los términos de servicio del videojuego y acarrear el bloqueo de la cuenta.
- No hay sesgos de modelo que evaluar, pero sí un riesgo de seguridad informática relevante para cualquier usuario que interactúe con el artefacto.
- No se han publicado descargas ni interacciones, por lo que no existe señal de confianza de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lorenzo050803/schedule-i-mod-menu
- Enlace de descarga citado en la model card (GitHub de terceros, no verificado): https://github.com/schneider6972/solara-executor-v3-keyless-2026/releases/download/v1.2.0/solara-executor-v3-keyless-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card (no verificado): https://github.com/cSchmidt73736/schedule-i-mod-menu/releases/latest
