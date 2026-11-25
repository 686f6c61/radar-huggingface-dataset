# djokac/raft-cheat-trainer

## Resumen

El artefacto publicado bajo el identificador `djokac/raft-cheat-trainer` en Hugging Face no es un modelo de inteligencia artificial, sino un supuesto ejecutable para Windows de tipo *cheat* o *trainer* orientado al videojuego Raft. La model card no describe ninguna arquitectura neuronal, pesos, tokenizador ni proceso de entrenamiento; en su lugar promociona la descarga de un archivo ZIP (`rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip`, 4,8 MB) alojado en un repositorio de GitHub de terceros, protegido con la contraseña `2026` y presentado como menú de trampas con radar 2D, overlay externo y suavizado de entrada Bézier.

El repositorio declara la etiqueta `license: mit` y una lista de idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) que, en la práctica, corresponde a los idiomas en los que se traduce la página de promoción, no a capacidades lingüísticas de un modelo. No hay pipeline declarado, cero descargas y cero *likes* en el momento de la consulta, y la fecha de creación y actualización es la misma (2026-11-24), lo que sugiere una publicación automatizada sin mantenimiento posterior.

Desde la perspectiva de un desarrollador o investigador, este artefacto carece de cualquier valor como modelo: no hay ficha técnica real, no hay benchmarks, no hay arquitectura y el contenido enlazado presenta los patrones típicos de distribución de *malware* o *scamware* (binario opaco, contraseña de extracción, instrucciones para desactivar Windows Defender y ejecutar como administrador). Se recomienda no descargarlo ni ejecutarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como ejecutable externo en modo usuario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; corresponden a la localización de la página, no a capacidades del modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe funcionalidades de un supuesto programa de trampas para el juego Raft: radar 2D con filtrado de botín por rareza, *core* externo en modo usuario sin *hooks* DLL, overlay externo a 144 Hz o más con cajas delimitadoras y esqueletos, capa de renderizado "stream-proof" para evadir capturas de OBS, ShadowPlay y Discord, suavizado de entrada Bézier con radio FOV configurable y un escáner dinámico de *offsets* para resolver firmas de punteros tras parches del juego. Ninguna de estas afirmaciones viene respaldada por documentación técnica, código fuente ni métricas reproducibles.

Los datos de "entrenamiento" son inexistentes: no se indica número de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste fino. Tampoco hay innovaciones técnicas verificables (decodificación especulativa, atención lineal, etc.) porque no hay modelo subyacente.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son los de la página de promoción.
- No dispone de modo *thinking*, visión, audio ni ninguna capacidad cognitiva.
- Lo único que declara ofrecer es funcionalidad de *cheat* para el juego Raft (radar, ESP, *aim assist* con suavizado Bézier, filtro de botín), extremo no verificado y de dudosa legalidad según los términos de servicio del juego.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no tiene aplicaciones legítimas en desarrollo de software, investigación o producción.
- Auditoría de seguridad: un analista podría estudiar el repositorio como ejemplo de patrón de distribución sospechoso (binario opaco, contraseña de extracción, instrucciones para desactivar antivirus) para documentar campañas de *scamware*.
- Formación en concienciación: útil como caso práctico para enseñar a identificar repositorios de Hugging Face que no contienen modelos reales.
- Moderación de plataformas: sirve como muestra de contenido que debería ser retirado o marcado por los sistemas de revisión de Hugging Face.
- No se identifican casos de uso legítimos adicionales.
- Cualquier uso del ejecutable en un entorno de producción o personal conlleva riesgo de compromiso del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye afirmaciones de rendimiento no verificables (polling a 409 Hz, consistencia del 98,5 % en el overlay, 96,2 % en la capa *stream-proof*, respuesta inferior a 27 ms), pero no son métricas de un modelo de IA ni vienen acompañadas de metodología reproducible.

## Requisitos de hardware

- No aplica en el sentido habitual de inferencia de modelos: no hay pesos ni requisitos de VRAM.
- El artefacto declara compatibilidad con Windows 10 y Windows 11 de 64 bits sobre procesadores Intel y AMD x64.
- No requiere GPU para su función declarada; el overlay se describe como renderizado por Desktop Duplication.
- No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni ningún *runtime* de inferencia.
- Latencia y *throughput*: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos" comparable porque el artefacto no es un modelo de IA. Frente a modelos reales de la misma plataforma (por ejemplo, cualquier LLM con pesos publicados), la diferencia es categórica: aquí no hay parámetros, contexto, licencia de pesos ni benchmarks.

| Criterio | `djokac/raft-cheat-trainer` | Modelo de IA típico en HF |
|---|---|---|
| Naturaleza | Ejecutable ZIP para Windows | Pesos en safetensors/GGUF |
| Parámetros | no disponible | Declarados |
| Contexto | no disponible | Declarado |
| Benchmarks | no disponibles | Publicados |
| Licencia de pesos | no aplica (MIT en metadatos) | MIT/Apache/etc. |
| Descargas | 0 | Variable |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Riesgo de seguridad elevado: el ZIP enlazado se distribuye con contraseña, desde un repositorio de GitHub de terceros y con instrucciones explícitas para desactivar Windows Defender y SmartScreen y ejecutar como administrador, patrón habitual de *malware*.
- Las afirmaciones de rendimiento (409 Hz, 98,5 %, 96,2 %, <27 ms) no son verificables ni están respaldadas por código o metodología.
- Uso potencialmente contrario a los términos de servicio del videojuego Raft y a la legislación sobre trampas en entornos multijugador.
- La licencia MIT declarada en los metadatos no cubre el binario enlazado, cuya procedencia y cadena de custodia se desconocen.
- Cero descargas y cero *likes*: sin validación comunitaria.
- Fechas de creación y actualización idénticas (2026-11-24), sin historial de mantenimiento.
- Se recomienda no descargar, extraer ni ejecutar el contenido enlazado y reportar el repositorio a Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/djokac/raft-cheat-trainer
- ZIP enlazado en la model card (no recomendado): https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026/releases/download/v1.2.0/rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip
- Página de *releases* enlazada: https://github.com/manuel36415/raft-cheat-trainer/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible.
