# AdrienMiguet/delta-executor-pc-v2

## Resumen

No se trata de un modelo de inteligencia artificial. El repositorio `AdrienMiguet/delta-executor-pc-v2` en Hugging Face no contiene pesos, arquitectura ni artefactos de un modelo de lenguaje: la model card describe un supuesto ejecutor de scripts para Roblox distribuido como binario de Windows (`rob-run-cheat-mod-menu-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB protegido con contraseña). El autor lo etiqueta con términos de sistema operativo (`windows`, `windows-11`, `x64`, `portable`) y una lista de idiomas que no se corresponde con ninguna capacidad lingüística real.

El contenido de la ficha pública emplea un patrón habitual en campañas de distribución de software no verificado: enlaces de descarga alojados en un repositorio de GitHub de terceros distinto del declarado, contraseña fija para el archivo comprimido (evita el análisis automático de antivirus), instrucciones para ejecutar el binario como administrador y avisos explícitos sobre alertas de Windows Defender y SmartScreen. Estos elementos son señales de riesgo, no características de un modelo.

Por tanto, esta ficha no puede evaluar capacidades de IA. Se documenta el artefacto tal como aparece, se marcan como "no disponible" todos los parámetros propios de un modelo y se detallan las advertencias de seguridad pertinentes. Cualquier uso del binario debe considerarse de riesgo elevado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutor de scripts para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | la model card declara en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (sin evidencia de capacidad lingüística real) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible; el artefacto distribuido es un ZIP de 4,8 MB con un `.exe` de Windows x64 |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal, corpus de entrenamiento, proceso de alineación (RLHF/DPO) ni innovación técnica de inferencia que documentar. El repositorio no publica pesos en safetensors, GGUF ni ningún otro formato de modelo. El contenido descrito corresponde a un ejecutable de Windows (`v1.7.9`, build `58A590`) que, según la model card, realiza inyección de scripts Luau en clientes de Roblox, con funciones de auto-attach multi-instancia, editor Monaco y sincronización de offsets tras parches del cliente.

La model card menciona métricas de rendimiento del binario (respuesta inferior a 22 ms, consumo inferior a 38 MB de RAM, consistencia del 96,3 % en la sincronización de offsets), pero son afirmaciones del autor sin verificación independiente y no constituyen benchmarks de un modelo de IA.

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- La lista de idiomas de los metadatos no está respaldada por ninguna evaluación.
- El artefacto descrito afirma ejecutar scripts Luau en el cliente de Roblox, lo que infringe los términos de servicio de la plataforma y puede conllevar el baneo de cuentas.

## Casos de uso

- No procede. El repositorio no contiene un modelo de IA y no se identifican casos de uso legítimos de evaluación, despliegue o integración en pipelines de desarrollo.
- Cualquier escenario de uso del binario descrito (ejecución de scripts en Roblox, automatización de partidas, mod menus) queda fuera del ámbito de esta ficha y conlleva riesgos de seguridad y de cumplimiento de términos de servicio.
- Para tareas de generación de código, razonamiento o agentes, deben evaluarse modelos de IA reales con pesos publicados y benchmarks verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (22 ms de latencia, 38 MB de RAM, 96,3 % de consistencia de offsets) son afirmaciones del autor sobre el binario, no mediciones de un modelo de lenguaje, y no se han podido verificar.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- El artefacto declarado requiere Windows 10 u 11 de 64 bits sobre CPU x64 (Intel o AMD) y ejecución como administrador según las instrucciones del autor.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles para inferencia de IA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| AdrienMiguet/delta-executor-pc-v2 | no disponible | no disponible | MIT (declarada) | Hugging Face, 0 descargas | No es un modelo de IA |
| Modelos de lenguaje open source comparables | no disponible | no disponible | no disponible | no disponible | No hay término de comparación válido |

No existe una categoría de modelos comparable: el repositorio no contiene un modelo de IA, por lo que la comparación con alternativas de la misma tarea no es posible.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; los metadatos de idioma y la licencia MIT no implican capacidades de modelo.
- El enlace de descarga apunta a un repositorio de GitHub de terceros (`cishii039/rob-run-cheat-mod-menu`) distinto del declarado en la model card, lo que rompe la trazabilidad del artefacto.
- El ZIP está protegido con contraseña fija (`2026`), una técnica que dificulta el escaneo automático por antivirus.
- Las instrucciones piden ejecutar el binario como administrador, lo que amplía el impacto potencial de cualquier código malicioso.
- La propia model card reconoce alertas de Windows Defender y SmartScreen, lo que constituye una señal de riesgo de malware o de software no firmado.
- El uso descrito (ejecutor de scripts para Roblox) infringe los términos de servicio de la plataforma y puede provocar el baneo permanente de cuentas.
- Riesgo elevado de phishing, robo de credenciales o instalación de software no deseado; no se recomienda su descarga ni ejecución en ningún entorno.
- La licencia MIT declarada no otorga garantías ni exime de responsabilidad al usuario; el autor no ofrece soporte ni auditoría.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AdrienMiguet/delta-executor-pc-v2
- Repositorio de GitHub referenciado en la model card (tercero, no verificado): https://github.com/cishii039/rob-run-cheat-mod-menu
- Enlace de descarga citado en la model card (no recomendado): https://github.com/cishii039/rob-run-cheat-mod-menu/releases/download/v1.2.0/rob-run-cheat-mod-menu-v1.2.2-win64.zip
- Releases del repositorio declarado: https://github.com/adrianl0774/delta-executor-pc-v2/releases/latest
- No se han encontrado papers, blogs técnicos, demos ni repositorios de código asociados a un modelo de IA en la información disponible.
