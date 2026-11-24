# Ibnuisa/isaeva-keyless-executor

## Resumen

El repositorio `Ibnuisa/isaeva-keyless-executor` no contiene un modelo de inteligencia artificial. Se trata de un artefacto alojado en Hugging Face que se presenta como un ejecutor ("executor") portable para Windows 10 y Windows 11 de 64 bits, distribuido como un archivo ZIP de 4,8 MB con contraseña. La model card describe funcionalidades de inyección de scripts en entornos de ejecución Luau (hookmetamethod, getgc, Drawing API), compatibilidad con sUNC superior al 98 % y sincronización de offsets tras parches del cliente. No se declara ninguna arquitectura de red neuronal, parámetros, contexto ni pesos.

La ficha se redacta, por tanto, sobre un artefacto que no es un modelo de lenguaje: no hay transformer, ni MoE, ni datos de entrenamiento, ni benchmarks de razonamiento. El interés técnico reside en evaluar el riesgo de ejecutar binarios de procedencia no verificada distribuidos con contraseña y alojados en un repositorio sin descargas ni validación comunitaria.

Todos los datos de especificaciones que siguen se han extraído de la model card y de los metadatos del repositorio. Cualquier parámetro propio de un modelo de IA se marca como "no disponible" porque no existe en este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable portable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene pesos ni un grafo de cómputo entrenado. Según la model card, el paquete incluye un binario `dandys-world-forsaken-script-2026-v1.2.2-win64.exe` (build `v3.8.9`, identificador `5809AE9383`) y un archivo `dandys-world-forsaken-script-2026-v1.2.2-win64.zip` de 4,8 MB protegido con la contraseña `2026`. Las funcionalidades declaradas son de inyección y manipulación de un entorno Luau (compatibilidad sUNC, `hookmetamethod`, `getgc`, Drawing API, attach multi-instancia, auto-ejecución de scripts), con cifras de sondeo como 255 Hz, 421 Hz y 140 Hz y consumos de memoria de menos de 59 MB y menos de 51 MB.

No se documenta ningún proceso de entrenamiento, dataset, RLHF, DPO ni innovación algorítmica. La model card mezcla metadatos de Hugging Face con enlaces a un repositorio de GitHub de terceros (`adrianrao978/isaeva-keyless-executor`, `pedrolong1343/dandys-world-forsaken-script-2026`) y con insignias de descargas no verificables, lo que es característico de campañas de distribución de software no auditado.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa razonamiento multi-paso ni modo "thinking".
- No tiene capacidades multilingües de comprensión; los idiomas listados son etiquetas de metadatos del repositorio.
- Las únicas capacidades declaradas son de ejecución de scripts sobre un cliente de juego: compatibilidad sUNC superior al 98 %, attach instantáneo, sincronización de offsets tras parches, hub de scripts integrado, attach multi-instancia y directorio de auto-ejecución.
- Requiere ejecución como administrador en Windows 10/11 de 64 bits según las instrucciones de la model card.

## Casos de uso

- Ninguno legítimo en el ámbito de IA open source. El artefacto no sirve para inferencia, fine-tuning, RAG ni generación.
- Auditoría de seguridad: analizar el binario en una máquina virtual aislada y sin red para determinar qué modifica en el sistema, dado que se distribuye con contraseña y se ejecuta como administrador.
- Estudio de campañas de distribución en Hugging Face: documentar patrones de repositorios que suplantan model cards con enlaces a GitHub y archivos ZIP protegidos.
- Formación en análisis de malware: usar el paquete como muestra didáctica de ingeniería social (insignias falsas de descargas, contraseña en la propia página, instrucciones de "Run as Administrator").
- Verificación de políticas de plataforma: comprobar cómo aplica Hugging Face sus términos frente a contenido que no es un modelo y que promueve ejecutables de terceros.
- No se recomienda su uso en producción, en equipos corporativos ni en entornos con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (98 %+ sUNC, 255 Hz, 421 Hz, 140 Hz, <59 MB, <51 MB) son afirmaciones del autor sin metodología ni reproducibilidad, y no son comparables con métricas de modelos de IA (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- VRAM estimada: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo: Windows 10 y Windows 11 de 64 bits, según la model card.
- Espacio en disco: el archivo ZIP ocupa 4,8 MB; el tamaño descomprimido no se indica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplican.
- Latencia y throughput: no disponibles; las cifras de sondeo en hercios no son verificables.
- Prerrequisitos declarados: 7-Zip o WinRAR para extraer con la contraseña `2026` y ejecución como administrador.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Ibnuisa/isaeva-keyless-executor` | Ejecutable Windows x64 (no modelo) | no disponible | no disponible | MIT | 0 descargas, 0 likes |
| Modelo de lenguaje open source de referencia (p. ej. Llama, Mistral, Qwen) | Modelo transformer con pesos | Miles de millones | Miles de tokens | Licencias específicas | Pesos en safetensors/GGUF, amplia adopción |
| Script de automatización de escritorio (p. ej. AutoHotkey, PowerShell) | Herramienta de sistema | no aplica | no aplica | Licencias permisivas | Repositorios públicos auditables |

No existe una categoría de "modelo similar" porque el artefacto no es un modelo. La comparación con ejecutables genéricos solo sirve para subrayar que un binario de 4,8 MB sin código fuente ni firma no es equivalente a una herramienta de automatización auditable.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Distribución con contraseña (`2026`) y ejecución como administrador: patrón habitual para evadir análisis automáticos de antivirus y sandboxes.
- Enlaces de descarga apuntan a repositorios de GitHub de terceros no relacionados con el autor del repositorio de Hugging Face; riesgo de suplantación.
- Insignias de descargas (656K+) y de tamaño no verificables; el repositorio registra 0 descargas y 0 likes.
- Sin código fuente, sin firma de código ni hashes publicados: imposible verificar integridad.
- La licencia MIT se declara sobre un artefacto cuyo contenido real no está documentado; la licencia no otorga garantías ni responsabilidad al autor.
- Riesgo elevado de malware, robo de credenciales o persistencia en el sistema si se ejecuta en un equipo real.
- Las funcionalidades descritas (inyección en clientes de juego) pueden violar los términos de servicio de dichos juegos y la legislación aplicable en materia de trampas y modificación de software.
- Idiomas listados en metadatos sin que exista componente lingüístico que los procese.
- No apto para producción, entornos corporativos ni equipos con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ibnuisa/isaeva-keyless-executor
- Repositorio de GitHub citado en la model card: https://github.com/adrianrao978/isaeva-keyless-executor
- Repositorio de GitHub citado para la release: https://github.com/pedrolong1343/dandys-world-forsaken-script-2026
- Enlace de descarga directa citado (no verificado): https://github.com/pedrolong1343/dandys-world-forsaken-script-2026/releases/download/v1.2.0/dandys-world-forsaken-script-2026-v1.2.2-win64.zip
- Paper, blog o demo: no disponible
