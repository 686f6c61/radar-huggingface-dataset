# Miradow/real-executor

## Resumen

`Miradow/real-executor` es un repositorio alojado en Hugging Face que, pese a su ubicación y a las etiquetas de idioma declaradas, no contiene un modelo de inteligencia artificial. La model card describe un ejecutable portable para Windows 10 y Windows 11 (x64) presentado como "Roblox executor", con instrucciones de descarga de un archivo ZIP de 4,8 MB protegido con contraseña y un binario `.exe` que se debe ejecutar como administrador. El nombre del binario hace referencia explícita a un supuesto cheat con ESP y aimbot para el videojuego Marvel Rivals.

No se declara ninguna arquitectura de red neuronal, número de parámetros, longitud de contexto, formato de pesos ni pipeline de inferencia. Las etiquetas de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) no se corresponden con capacidades lingüísticas de un modelo, sino con la metadata genérica del repositorio. Por tanto, esta ficha documenta la ausencia de un modelo y advierte de los riesgos asociados al contenido.

El repositorio presenta cero descargas y cero likes en el momento de la consulta, fue creado y actualizado el 24 de noviembre de 2026, y su contenido encaja con patrones habituales de distribución de software potencialmente malicioso (contraseña fija en el archivo comprimido, enlaces a releases de terceros, indicaciones para desactivar avisos de SmartScreen y ejecutar como administrador).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las etiquetas de idioma del repo no implican capacidades de modelo) |
| Licencia | MIT (declarada en la model card) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip`/`.exe` de Windows, no pesos) |

## Arquitectura y entrenamiento

No existe información sobre arquitectura de red neuronal, dataset de entrenamiento, número de tokens procesados ni técnicas de alineación como RLHF o DPO. La model card no menciona transformer, MoE, SSM ni ningún otro paradigma. El contenido se limita a describir módulos de un supuesto ejecutor de scripts para Roblox: "keyless execution flow" a 301 Hz de polling, "Luau VM bridge", compatibilidad "98%+ sUNC", "hookmetamethod", "getgc" y "Drawing API", con consumo declarado inferior a 36 MB y 24 MB de RAM en distintos módulos y entre 8 y 15 hilos de trabajo.

Estos términos pertenecen al ecosistema de ejecutores de scripts de Roblox (entorno Luau, APIs de introspección y hooks), no al entrenamiento de modelos. No hay innovación técnica documentada en el ámbito de IA.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se acredita capacidad multilingüe real pese a las etiquetas de idioma.
- El contenido describre funciones de un ejecutable de Windows orientado a inyección de scripts en Roblox y, según el nombre del binario, a trampas en Marvel Rivals (ESP y aimbot).

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA, ya que no lo es. Los escenarios que se describen a continuación reflejan lo que el repositorio afirma ofrecer y se incluyen únicamente con fines de análisis de riesgo:

- Ejecución de scripts Luau en Roblox: el repositorio se presenta como executor con compatibilidad sUNC declarada, aunque no hay verificación independiente.
- Inyección de hooks en procesos: menciona `hookmetamethod` y `getgc`, técnicas de introspección del entorno Luau.
- Automatización de teleport y recarga de scripts: describe un directorio de auto-ejecución.
- Ejecución multi-instancia: afirma soporte de varios clientes simultáneos con menos de 24 MB de RAM.
- Trampas en videojuegos: el nombre del binario alude a ESP y aimbot para Marvel Rivals, lo que constituye una violación de los términos de servicio del juego y no un caso de uso aceptable.
- Distribución de software con contraseña fija: patrón frecuente en campañas de malware, no un caso de uso productivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes, porque no hay modelo subyacente. Las únicas cifras del repositorio (301 Hz de polling, 98%+ de compatibilidad sUNC, <36 MB y <24 MB de RAM, 8-15 hilos) son afirmaciones del autor sobre el ejecutable, sin verificación externa.

## Requisitos de hardware

- VRAM estimada: no aplica, no hay inferencia de modelo.
- GPU recomendadas: no aplica.
- Compatibilidad consumer: el repositorio declara ejecución en Windows 10 y Windows 11 de 64 bits sobre CPU Intel y AMD x64.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no son relevantes).
- Latencia y throughput: no disponibles; las cifras de polling y RAM no son medibles de forma independiente.

## Comparativa con modelos similares

No disponible. No existe categoría de modelo comparable porque el artefacto no es un modelo de lenguaje ni multimodal. Compararlo con LLM open source sería categóricamente incorrecto.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no procesa lenguaje natural.
- Riesgo de seguridad elevado: el patrón (ZIP con contraseña fija "2026", enlaces a releases de un repositorio de GitHub de terceros, instrucciones para ejecutar como administrador y desactivar avisos de SmartScreen) coincide con tácticas habituales de distribución de malware.
- El nombre del binario referencia un cheat para Marvel Rivals, lo que implica violación de términos de servicio y posible sanción de cuenta.
- Las etiquetas de idioma y la licencia MIT declarada no otorgan ninguna garantía sobre el contenido ni sobre su legalidad en distintas jurisdicciones.
- Cero descargas y cero likes: sin validación comunitaria ni auditoría.
- La licencia MIT se declara sobre un artefacto binario opaco; no hay código fuente auditable en la información proporcionada.
- No debe ejecutarse en entornos de producción ni en máquinas con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Miradow/real-executor
- Release de GitHub referenciada en la model card: https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Releases del repositorio `YetofoBa59/real-executor`: https://github.com/YetofoBa59/real-executor/releases/latest
