# Keittio/seliware-executor

## Resumen

El repositorio `Keittio/seliware-executor` alojado en Hugging Face no contiene un modelo de inteligencia artificial en el sentido convencional. Se trata de un paquete ejecutable para Windows x64 distribuido como archivo ZIP (`seliware-executor-v1.2.0-win64.zip`, 8,9 MB) que la model card describe como un "roblox executor", es decir, una herramienta de inyección de scripts Luau en el cliente de Roblox. No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociados.

La ficha se ha elaborado a partir de la información disponible en el repositorio y en la model card. Al no existir un modelo de lenguaje, varias de las secciones obligatorias de esta plantilla (arquitectura, entrenamiento, benchmarks, requisitos de hardware para inferencia) no son aplicables y se indican explícitamente como no disponibles. Se documenta, en su lugar, la naturaleza real del artefacto y las advertencias de seguridad que se derivan de su contenido.

Es relevante señalarlo ahora porque este tipo de repositorios aparecen con frecuencia en plataformas de modelos abiertos y pueden confundirse con modelos legítimos. La model card incluye enlaces a un repositorio de GitHub de terceros, una contraseña de descompresión (`2026`) y recomendaciones para desactivar advertencias de Windows Defender o SmartScreen, lo que constituye un patrón habitual de distribución de software potencialmente malicioso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo; no implica capacidades lingüísticas de un modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`) |

## Arquitectura y entrenamiento

No aplica. El artefacto no es un modelo entrenado ni contiene pesos neuronales. Según la model card, el paquete incluye un binario `seliware-executor-v1.2.0-win64.exe` (build `v1.9.9`, identificador `BDA8F923E4`) que, según el autor, implementa un puente de máquina virtual Luau y adjunción de procesos para inyectar scripts en el cliente de Roblox. La documentación menciona módulos como "Monaco Editor workspace", "98%+ sUNC compatibility" (hookmetamethod, getgc, Drawing API) y "post-patch offset sync" con actualizaciones automáticas los miércoles, pero no se aporta ningún detalle verificable sobre arquitectura interna, dependencias o método de compilación.

No hay información sobre datos de entrenamiento, RLHF, DPO ni innovaciones técnicas de modelado. Cualquier afirmación de la model card sobre rendimiento (por ejemplo, "respuesta en menos de 30 ms", "233 Hz de polling" o "97,8% de consistencia") procede del propio autor y no es verificable ni está respaldada por documentación técnica.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts.
- No soporta tool calling ni function calling en el sentido de la API de modelos.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; la lista de idiomas de los metadatos es meramente descriptiva del repositorio.
- Según la model card, el ejecutable permitiría inyectar scripts Luau en el cliente de Roblox, con un editor multipestaña y un "script hub" integrado.
- No dispone de modo "thinking", visión, audio ni ninguna capacidad propia de un modelo multimodal.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que plantea la model card se limitan a la ejecución de scripts en Roblox y quedan fuera del ámbito de esta ficha. A modo de advertencia, se enumeran los contextos en los que este artefacto podría aparecer y por qué no debería utilizarse:

- Ejecución de scripts en Roblox: la propia naturaleza del ejecutable implica la inyección de código en un cliente de terceros, lo que puede contravenir los términos de servicio de la plataforma y acarrear el bloqueo de cuentas.
- Distribución de software a través de Hugging Face: el repositorio usa la plataforma como CDN para un binario de Windows, un uso ajeno al propósito de alojamiento de modelos.
- Pruebas de seguridad ofensiva: no hay indicios de que el paquete proceda de un proveedor auditado; no es adecuado para entornos de evaluación controlados.
- Análisis de malware en laboratorio: si se manipula, debe hacerse en una máquina virtual aislada y sin credenciales reales, dado el patrón de distribución (ZIP con contraseña, enlaces a GitHub de terceros, instrucciones para desactivar protecciones del sistema).
- Formación o investigación: no aporta nada al estudio de modelos de IA; no contiene pesos ni código de inferencia.
- Integración en pipelines de desarrollo: no procede; no es una dependencia de software con garantías de mantenimiento ni auditoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras autoinformadas (por ejemplo, "98%+ sUNC compatibility", "233 Hz polling", "menos de 52 MB de RAM"), pero no son benchmarks de modelos ni están verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo objetivo: Windows 10 u 11 de 64 bits, según la model card.
- Espacio en disco: el ZIP ocupa 8,9 MB; el tamaño descomprimido no se especifica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; no es un modelo servible.
- Latencia y throughput: no disponibles de forma verificable; las cifras de la model card no son contrastables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" con la que comparar este artefacto. Si se compara con otros ejecutores de Roblox distribuidos de forma similar, la comparación queda fuera del alcance de esta ficha y requeriría un análisis de seguridad específico.

| Criterio | `Keittio/seliware-executor` | Modelo de lenguaje típico (referencia) |
|---|---|---|
| Naturaleza | Ejecutable Windows x64 | Pesos neuronales |
| Pesos | No | Sí (safetensors, GGUF, etc.) |
| Inferencia | No aplica | Sí |
| Licencia | MIT | Variable |
| Verificabilidad | Baja | Media-alta |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse como tal ni incluirse en comparativas de modelos.
- Riesgo de seguridad elevado: la model card enlaza a un repositorio de GitHub de terceros (`CanRaymond97874/seliware-executor`), distribuye un ZIP protegido con contraseña (`2026`) e incluye instrucciones para desactivar o ignorar advertencias de Windows Defender y SmartScreen. Este patrón es habitual en la distribución de software no auditado y potencialmente malicioso.
- Ejecución como administrador: la guía de instalación pide ejecutar el binario con privilegios elevados, lo que amplía el impacto de cualquier comportamiento malicioso.
- Contradicción de identidad: el repositorio de Hugging Face figura bajo el autor `Keittio`, mientras que la model card atribuye el paquete a `CanRaymond97874`, lo que dificulta la trazabilidad del origen.
- Posible incumplimiento de términos de servicio: la inyección de scripts en Roblox puede violar las condiciones de la plataforma y derivar en sanciones a la cuenta del usuario.
- Licencia MIT: aunque el metadato declara MIT, la licencia no cubre el uso indebido del binario ni exime de responsabilidad legal por su ejecución.
- Idiomas: la lista de idiomas de los metadatos no implica capacidades de procesamiento de lenguaje; es un dato descriptivo del repositorio.
- Sin mantenimiento verificable: no hay historial de versiones, issues ni auditorías públicas que permitan evaluar la fiabilidad del paquete.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Keittio/seliware-executor
- Repositorio de GitHub citado en la model card: https://github.com/CanRaymond97874/seliware-executor
- Descarga directa citada en la model card: https://github.com/CanRaymond97874/seliware-executor/releases/latest/download/seliware-executor-v1.2.0-win64.zip
- Página de releases citada en la model card: https://github.com/CanRaymond97874/seliware-executor/releases/latest
