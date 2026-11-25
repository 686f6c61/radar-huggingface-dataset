# Musashi132132/maxon-zbrush-2026-imm-brushes-portable

## Resumen

La entrada `Musashi132132/maxon-zbrush-2026-imm-brushes-portable` de Hugging Face no es un modelo de inteligencia artificial. Se trata de un repositorio que distribuye un supuesto ejecutable para Windows x64 (`delta-executor-pc-2026-v1.2.2-win64.zip`, 4,8 MB, protegido con la contraseña `2026`), presentado bajo la apariencia de un paquete "portable" de pinceles de Maxon ZBrush 2026. La model card, sin embargo, describe funcionalidades propias de un *roblox executor*: auto-ejecución de scripts, puente con la máquina virtual Luau, adjunción a procesos cliente y sincronización de offsets tras parches.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni artefactos de inferencia. No hay pipeline declarado, ni parámetros, ni contexto, ni datos de entrenamiento. Los metadatos de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) y la licencia MIT parecen plantilla genérica sin relación con el contenido real.

Por tanto, esta ficha documenta un artefacto que no cumple los criterios mínimos para ser evaluado como modelo de IA. Además, el patrón de distribución (binario empaquetado en ZIP con contraseña, ejecución como administrador, petición de desactivar avisos de SmartScreen/Defender, enlaces a releases de terceros) coincide con tácticas habituales de *malware* o *scamware*. Se recomienda no descargar ni ejecutar el archivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin verificación) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal, ni corpus de entrenamiento, ni proceso de alineación (RLHF, DPO) documentado. El contenido técnico descrito en la model card corresponde a un ejecutable de Windows con supuestas capacidades de inyección de scripts en clientes de Roblox: directorio de auto-ejecución, *script hub* integrado, adjunción multi-instancia, ejecución "keyless" y sincronización de offsets tras actualizaciones del cliente. Son afirmaciones del autor sin evidencia verificable, sin código fuente y sin binarios reproducibles.

El artefacto se presenta como "portable" y "performance-tuned", con métricas inventadas (menos de 35 MB de RAM, menos de 20 ms de respuesta, sondeo a 141 Hz). No se aporta ningún dato sobre metodología de medición ni entorno de pruebas.

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No hay soporte verificable de *tool calling* ni de *function calling* en el sentido de un modelo de lenguaje.
- No hay capacidades de agente ni de razonamiento multi-paso.
- El multilingüismo declarado en los metadatos no está respaldado por ningún artefacto del repositorio.
- Las supuestas capacidades del binario (auto-ejecución de scripts, adjunción a procesos, inyección en memoria) no son funciones de un modelo y no están verificadas por terceros.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA. Los escenarios que plantea la model card son los siguientes, y se describen únicamente para advertir de su naturaleza:

- Ejecución de scripts en clientes de Roblox: el binario afirmaría adjuntarse a procesos cliente e inyectar scripts Luau; esto infringe los términos de servicio de la plataforma y puede conllevar el bloqueo de cuentas.
- Distribución de "pinceles" de ZBrush: no hay contenido de pinceles en el repositorio; el nombre se usa como señuelo para atraer descargas.
- Automatización de escritorio en Windows: requeriría ejecutar un binario desconocido como administrador, sin firma de código ni verificación de integridad.
- Integración en pipelines de CI/CD: inviable, al no existir API, SDK ni formato de pesos.
- Despliegue en servidores de inferencia (vLLM, TGI, llama.cpp): inviable, al no existir modelo.
- Evaluación comparativa de modelos: inviable, al no existir benchmarks ni parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (RAM, latencia, frecuencia de sondeo) no son benchmarks de modelo y no están respaldadas por ninguna metodología.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado para el binario: Windows 10/11 de 64 bits, sobre procesadores Intel o AMD x64.
- Opciones de despliegue: no disponibles; no hay integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existe un modelo de IA comparable porque el artefacto no es un modelo. A modo de referencia, se compara con otros tipos de artefacto del ecosistema:

| Artefacto | Naturaleza | Pesos | Contexto | Licencia | Riesgo |
|---|---|---|---|---|---|
| `Musashi132132/maxon-zbrush-2026-imm-brushes-portable` | ZIP con `.exe` para Windows | No | No aplica | MIT declarada | Alto (binario ofuscado, pide desactivar Defender) |
| Modelo de lenguaje open source típico | Pesos safetensors/GGUF | Sí | Definido en config | Apache 2.0, MIT, Llama, etc. | Bajo o medio, auditable |
| Repositorio de herramientas de escritorio legítimo | Código fuente o instalador firmado | No aplica | No aplica | Varía | Bajo si hay firma y código |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no procesa lenguaje natural. Cualquier expectativa en ese sentido es infundada.
- El binario se distribuye comprimido con contraseña (`2026`) y alojado en releases de un repositorio de GitHub de terceros, un patrón que dificulta el análisis automático y la detección por parte de antivirus.
- La model card pide explícitamente ejecutar como administrador y añadir el directorio a la lista blanca de Windows Defender/SmartScreen, lo que elimina las protecciones del sistema.
- El nombre del repositorio suplanta a Maxon ZBrush y a sus pinceles; no hay relación verificable con Maxon.
- Las supuestas funciones de inyección en clientes de Roblox infringen los términos de servicio de la plataforma y pueden constituir ingeniería inversa no autorizada.
- La licencia MIT declarada no aporta ninguna garantía sobre el contenido del binario ni sobre su seguridad.
- Riesgo elevado de *malware* (troyanos, *stealers* de credenciales, *ransomware*) o de fraude. No se debe descargar, extraer ni ejecutar el archivo.
- Cero descargas y cero *likes* en el momento de la consulta, lo que descarta cualquier validación por parte de la comunidad.
- Los resultados de búsqueda web asociados no guardan relación con el repositorio y no aportan información técnica verificable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Musashi132132/maxon-zbrush-2026-imm-brushes-portable
- Releases del autor en GitHub (referenciadas en la model card, no verificadas): https://github.com/MepageHas93/maxon-zbrush-2026-imm-brushes-portable/releases/latest
- Binario de terceros referenciado en la model card (no verificado, no recomendado): https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Documentación oficial de Maxon ZBrush (para descargar el software legítimo): https://www.maxon.net/en/zbrush
- Resultado de búsqueda no relacionado: https://www.telephone.city/enseigne/lidl/
