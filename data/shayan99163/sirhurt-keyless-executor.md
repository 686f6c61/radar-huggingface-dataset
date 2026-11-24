# shayan99163/sirhurt-keyless-executor

## Resumen

No es un modelo de IA. El repositorio `shayan99163/sirhurt-keyless-executor` alojado en Hugging Face no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje. Se trata de un repositorio que distribuye un ejecutable de Windows (`deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, empaquetado en un ZIP de 4,8 MB) presentado como "Sirhurt Keyless Executor", una herramienta de ejecución de scripts orientada a Roblox. La model card describe módulos de inyección de scripts, editor Monaco, sincronización de offsets tras parches y adjunción a procesos, no capacidades de generación de texto.

El contenido de la model card incluye enlaces a un repositorio de GitHub de terceros (`rocha1838/deadlock-cheat-esp-aimbot-2026`) desde el que se descarga el binario, protegido con la contraseña `2026`. La nomenclatura del ejecutable hace referencia explícita a un "cheat" con ESP y aimbot para el juego Deadlock, lo que aleja aún más el artefacto de cualquier uso legítimo como modelo de IA. El repositorio no tiene descargas ni likes, y no se ha publicado información técnica verificable sobre su funcionamiento interno.

Desde el punto de vista de la evaluación de modelos, esta ficha no puede completarse con datos reales: no hay parámetros, contexto, benchmarks ni licencia de pesos que analizar. La licencia declarada es MIT, pero se aplica al repositorio, no a un modelo. Se recomienda tratar este repositorio como software de terceros no auditado y potencialmente malicioso, no como un modelo de IA open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo, no del modelo) |
| Licencia | MIT (declarada para el repositorio) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un .exe) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento que describir. El artefacto distribuido es un binario Windows x64 empaquetado en `deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip` (4,8 MB), con contraseña de extracción `2026`. La model card menciona componentes como "Luau VM bridge", "process attachment", "Monaco Editor Workspace" y "post-patch offset sync", que corresponden a un ejecutor de scripts para Roblox y a mecanismos de sincronización con parches del cliente, no a un modelo generativo.

No se documenta ningún dataset, número de tokens, técnica de alineación (RLHF, DPO) ni innovación en atención o decodificación. Tampoco se especifica el lenguaje de implementación, las dependencias ni el proceso de compilación del binario.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son metadatos del repositorio.
- La model card describe funciones de ejecución de scripts (hub integrado, editor Monaco, auto-ejecución, adjunción a procesos), propias de un ejecutor de Roblox.
- El binario se presenta como herramienta de "cheat" (ESP/aimbot) para Deadlock según su propio nombre de fichero.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA. Los escenarios que sugiere la model card son:

- Ejecución de scripts en Roblox mediante un ejecutor "keyless": el binario se adjunta a un proceso del cliente y carga scripts Luau, según la descripción del autor.
- Edición de scripts en un editor Monaco integrado: la model card menciona multi-tab y resaltado de sintaxis, pero no hay documentación técnica verificable.
- Auto-ejecución de scripts al iniciar el cliente: descrito como "automatic teleport script reloading", sin más detalle.
- Sincronización de offsets tras parches del cliente: la model card afirma actualizaciones automáticas los miércoles con respuesta menor de 35 ms, dato no verificable.
- Uso como "cheat" con ESP y aimbot en Deadlock: el propio nombre del ejecutable lo indica; este uso puede violar los términos de servicio del juego y la legislación aplicable.
- Distribución de software empaquetado con contraseña: el ZIP requiere la contraseña `2026`, práctica habitual para evadir análisis automáticos de antivirus.

Advertencia: ninguno de estos usos está recomendado. El repositorio no ofrece garantías de seguridad y el binario no está auditado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro tipo porque no hay modelo que evaluar. Las cifras que aparecen en la model card (372K descargas, 97,9 % de consistencia, menos de 35 ms de respuesta) son afirmaciones de marketing del autor sin verificación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos del artefacto real: Windows 10 u 11 de 64 bits, procesadores Intel o AMD x64, 4,8 MB de espacio en disco para el ZIP y ejecución como administrador según las instrucciones del autor.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" comparable, porque este repositorio no contiene un modelo. Si se compara como software, los ejecutores de Roblox (Sirhurt, Synapse, Krnl y similares) son herramientas de terceros no auditadas, y su comparación técnica queda fuera del alcance de esta ficha.

| Criterio | Este repositorio | Modelo de IA open source típico |
|---|---|---|
| Pesos | No contiene | safetensors/GGUF |
| Arquitectura | No aplica | Transformer/MoE/SSM |
| Contexto | No aplica | Decenas de miles de tokens |
| Benchmarks | No disponibles | MMLU, HumanEval, etc. |
| Licencia de pesos | No aplica | MIT, Apache 2.0, etc. |
| Auditoría | Ninguna | Variable según comunidad |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal.
- El binario se distribuye comprimido con contraseña (`2026`), práctica que dificulta el escaneo automático y es habitual en campañas de malware.
- El nombre del ejecutable referencia un "cheat" con ESP y aimbot para Deadlock; su uso puede violar términos de servicio y normativa sobre trampas en videojuegos.
- Windows Defender y SmartScreen pueden alertar, según reconoce la propia model card; el autor recomienda desactivar la cuarentena y ejecutar como administrador, lo que incrementa el riesgo.
- No hay auditoría de código, firma digital ni trazabilidad del binario.
- Los enlaces de descarga apuntan a un repositorio de GitHub de terceros (`rocha1838/...`), no al repositorio de Hugging Face.
- La licencia MIT declarada no implica que el contenido sea seguro ni que su distribución sea legal en todas las jurisdicciones.
- No se debe ejecutar en entornos de producción ni en máquinas con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shayan99163/sirhurt-keyless-executor
- Repositorio de GitHub referenciado en la model card: https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026
- Enlace de descarga citado en la model card: https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026/releases/download/v1.2.0/deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Releases alternativas citadas: https://github.com/Norao01/sirhurt-keyless-executor/releases/latest
