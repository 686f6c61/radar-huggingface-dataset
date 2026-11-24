# F7lfivem/delta-executor-pc-2026-unlocked

## Resumen

El repositorio identificado como `F7lfivem/delta-executor-pc-2026-unlocked` no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows distribuido a través de Hugging Face. Según la propia model card, se trata de un supuesto "Roblox executor" empaquetado en un archivo ZIP de 4,8 MB con contraseña (`2026`) que, al extraerse, produce un binario `.exe` que debe ejecutarse como administrador. No hay pesos, tokenizador, configuración de arquitectura ni artefactos de inferencia en el repositorio.

El contenido de la model card es claramente ajeno a la plataforma: emplea insignias de descargas y valoraciones, enlaces a releases de GitHub de terceros y un nombre de archivo (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip`) que no guarda relación con el identificador del repositorio. Esta discrepancia entre el nombre del repositorio y el artefacto descargado, junto con la exigencia de contraseña y ejecución con privilegios elevados, es un patrón habitual en campañas de distribución de software malicioso.

Por tanto, esta ficha no puede documentar un modelo de IA. Se detallan a continuación los datos objetivos disponibles y las advertencias de seguridad pertinentes, sin inventar especificaciones técnicas que no existen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo, no del modelo) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. El artefacto descrito es un ejecutable Windows x64 (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.exe`, build `v1.6.2` / `CD64B7`) que la model card presenta como un "executor" con supuesta integración de una VM Luau, API `Drawing`, `hookmetamethod` y `getgc`. Estos términos pertenecen al ecosistema de scripting de Roblox y no describen un modelo de lenguaje.

La model card menciona métricas de rendimiento del binario (menos de 43 MB de RAM, tiempos de respuesta de 12–37 ms, "98,3 % de consistencia"), pero no aporta ninguna información verificable sobre datos de entrenamiento, composición del dataset, RLHF, DPO ni innovaciones en atención o decodificación. No hay pesos publicados en formato safetensors, GGUF ni ningún otro formato de modelo.

## Capacidades

- No se trata de un modelo de IA: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües propias; los idiomas listados son etiquetas de metadatos del repositorio.
- El binario declara funcionalidades de ejecución de scripts Luau sobre clientes de Roblox (attach de proceso, editor Monaco, auto-ejecución), sin verificación independiente.
- No dispone de modo "thinking", visión, audio ni ninguna modalidad de modelo fundacional.

## Casos de uso

No procede enumerar casos de uso de un modelo de IA, porque el artefacto no lo es. Los escenarios realistas asociados a este repositorio son de riesgo, no de aplicación productiva:

- Auditoría de seguridad: analizar el binario en un entorno aislado (sandbox, máquina virtual sin red) para determinar su comportamiento real antes de cualquier otra consideración.
- Análisis de campañas de malware: estudiar el patrón de repositorio de Hugging Face con model card copiada, contraseña en el ZIP y enlace a release de GitHub ajeno como posible señuelo.
- Formación en concienciación: usar el caso como ejemplo de ingeniería social dirigida a desarrolladores que buscan herramientas gratuitas.
- Investigación de threat intelligence: correlacionar el nombre del artefacto (`monster-hunter-wilds-trainer-mod-2026`) con otras muestras del mismo actor.
- Verificación de cadena de suministro: comprobar cómo un repositorio con licencia MIT declarada puede alojar contenido no relacionado con IA.
- Respuesta a incidentes: si un usuario ya ejecutó el `.exe` como administrador, revisar persistencia, procesos hijos y conexiones salientes.

Ninguno de estos casos implica ejecutar el binario en un equipo de producción ni confiar en él.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (RAM, latencia, "98 % sUNC") son afirmaciones del autor sobre el binario, no resultados de evaluación de un modelo, y no son verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que inferir.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 (22H2) y Windows 11 (24H2), x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles ni relevantes; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el artefacto no es un modelo de IA. Cualquier comparación con LLM (Llama, Mistral, Qwen, etc.) sería engañosa.

## Limitaciones y advertencias

- No es un modelo de IA: la ficha se limita a documentar la ausencia de artefactos de modelo y el contenido real del repositorio.
- Discrepancia grave entre el identificador del repositorio (`delta-executor-pc-2026-unlocked`) y el nombre del artefacto descargado (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip`), alojado en un release de GitHub de un tercero (`martina1713`), no en el propio repositorio.
- El ZIP requiere contraseña (`2026`) y el `.exe` debe ejecutarse "como administrador": ambos son indicadores de riesgo clásicos en distribución de malware.
- La model card reconoce que Windows Defender y SmartScreen pueden alertar y recomienda desactivar o ignorar esas protecciones ("whitelist the directory"). Esta recomendación es peligrosa y no debe seguirse.
- La licencia MIT declarada en los metadatos no otorga ninguna garantía sobre el contenido del binario ni sobre su legalidad en el contexto de los términos de servicio de Roblox.
- Los "executors" de Roblox suelen violar los términos de servicio de la plataforma y pueden conllevar el baneo de cuentas; además, este tipo de paquetes se ha usado históricamente para distribuir infostealers.
- Riesgo de alucinación: no aplica a un LLM, pero la model card contiene afirmaciones no verificables (510 K descargas, 99 % de valoración) que no se corresponden con los metadatos reales del repositorio (0 descargas, 0 likes).
- No debe ejecutarse en ningún equipo con datos sensibles, credenciales o acceso a red corporativa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/F7lfivem/delta-executor-pc-2026-unlocked
- Release de GitHub referenciado en la model card (tercero, no oficial): https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip
- Repositorio de GitHub referenciado en la model card: https://github.com/dinh301/delta-executor-pc-2026-unlocked
- No se han encontrado papers, blogs técnicos ni demos asociados en la información disponible.
