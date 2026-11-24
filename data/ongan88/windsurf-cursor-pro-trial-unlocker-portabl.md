# ongan88/windsurf-cursor-pro-trial-unlocker-portabl

## Resumen

No existe ningún modelo de IA en el repositorio `ongan88/windsurf-cursor-pro-trial-unlocker-portabl`. Se trata de un artefacto empaquetado para Windows x64 (un supuesto "unlocker" de las versiones de prueba de Windsurf y Cursor) publicado bajo la etiqueta de Hugging Face, sin pesos, sin arquitectura y sin pipeline asociado. La model card no describe ninguna red neuronal: enumera un ejecutable, un ZIP protegido con contraseña y enlaces a repositorios de GitHub de terceros.

El contenido de la model card presenta inconsistencias graves que apuntan a un artefacto malicioso o, como mínimo, fraudulento: el nombre del binario (`elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.exe`) no guarda relación con el título del repositorio, se solicita ejecutar el `.exe` como administrador, se distribuye dentro de un ZIP con contraseña fija (`2026`) para evadir análisis automáticos y los enlaces de descarga apuntan a cuentas de GitHub ajenas al autor declarado. Todo ello son patrones habituales de distribución de malware.

Esta ficha se redacta con fines de documentación y advertencia: no hay nada que evaluar técnicamente como modelo, y la recomendación es no descargar ni ejecutar el contenido del repositorio. Los campos técnicos se marcan como "no disponible" porque no existe modelo subyacente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.exe` dentro de un `.zip`) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene pesos, tokenizador, configuración de modelo ni código de inferencia. Los únicos artefactos descritos en la model card son un archivo `elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.zip` de 4,8 MB y un ejecutable `elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.exe` identificado como build `v3.0.9 (F5C961)`.

No hay información sobre datos de entrenamiento, proceso de alineamiento (RLHF, DPO) ni innovaciones técnicas, porque no existe un modelo entrenado. La model card mezcla terminología de rendimiento ("zero frame-time spikes", "204 Hz polling", "97,5 % consistency") con afirmaciones sobre aceleración por GPU (CUDA, TensorRT, DirectML, OpenCL) que no vienen respaldadas por ningún artefacto verificable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma son solo metadatos del repositorio.
- El artefacto se presenta como un "unlocker" de las versiones de prueba de Windsurf y Cursor, es decir, una herramienta de terceros que afirma eliminar límites de evaluación de productos comerciales ajenos.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no hay modelo. Los escenarios que describe la model card son los siguientes, y se documentan únicamente para contextualizar el riesgo:

- "Desbloqueo" de funciones de pago de Windsurf y Cursor: el artefacto afirma eliminar banners de evaluación, límites temporales y bloqueos de exportación de software comercial de terceros. Uso no autorizado y potencialmente ilícito.
- Ejecución como administrador en Windows 10/11 x64: el procedimiento indicado eleva privilegios del ejecutable, lo que amplía el impacto de cualquier carga maliciosa.
- Extracción de un ZIP protegido con contraseña fija: técnica que dificulta el escaneo automático por parte de antivirus y plataformas de análisis.
- Distribución mediante enlaces a repositorios de GitHub de terceros: los enlaces de descarga no apuntan al autor declarado, lo que rompe la cadena de custodia del artefacto.
- Uso en entornos corporativos: incompatible con políticas de seguridad, ya que implica ejecutar binarios no firmados con privilegios elevados.
- Investigación de malware: el único uso defendible sería el análisis en sandbox aislado por parte de equipos de seguridad, nunca en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card ("97,5 % consistency", "< 10 ms response time", "< 57 MB RAM", "204 Hz polling") no son benchmarks de modelo y carecen de metodología verificable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay modelo que ejecutar).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; ninguna aplica.
- Plataforma declarada por el artefacto: Windows 10/11 x64 (24H2), con supuesto soporte de CUDA, TensorRT, DirectML y OpenCL.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No procede comparación con modelos de IA, ya que no hay modelo. A modo de contraste, se compara con repositorios legítimos de modelos pequeños que sí contienen pesos:

| Criterio | ongan88/windsurf-cursor-pro-trial-unlocker-portabl | Modelo pequeño legítimo (p. ej. Qwen2.5-0.5B) | Modelo mediano legítimo (p. ej. Llama 3.1 8B) |
|---|---|---|---|
| Contiene pesos | No | Sí (safetensors/GGUF) | Sí (safetensors/GGUF) |
| Arquitectura declarada | No disponible | Transformer decoder | Transformer decoder |
| Pipeline de Hugging Face | No disponible | text-generation | text-generation |
| Licencia | MIT (metadatos) | Apache 2.0 / otras | Llama Community License |
| Descargas | 0 | Miles/millones | Millones |
| Uso comercial | No evaluable | Según licencia | Según licencia |

## Limitaciones y advertencias

- No es un modelo de IA: no debe tratarse como tal en ningún pipeline, evaluación o comparativa técnica.
- Riesgo de seguridad alto: ejecutable no firmado, distribución vía ZIP con contraseña fija y petición de ejecución como administrador. Patrón compatible con troyanos, infostealers o ransomware.
- Suplantación de identidad: los enlaces de descarga apuntan a cuentas de GitHub de terceros (`claudio00344`, `victoria5511`) y el nombre del binario imita un "trainer" de un videojuego, ajeno al título del repositorio.
- Posible infracción de licencias y condiciones de uso: un "unlocker" de software comercial de terceros (Windsurf, Cursor) puede vulnerar sus términos de servicio y la legislación de propiedad intelectual.
- Sin trazabilidad: cero descargas, cero likes, repositorio creado y actualizado en el mismo segundo, sin historial de versiones ni autor verificable.
- Licencia MIT declarada: aunque técnicamente permisiva, no legitima el uso del artefacto para eludir protecciones de software ajeno.
- Recomendación: no descargar, no extraer y no ejecutar el contenido. Si ya se ha ejecutado, realizar un análisis forense del sistema y rotar credenciales.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/ongan88/windsurf-cursor-pro-trial-unlocker-portabl
- Enlace de descarga citado en la model card (GitHub de terceros, no verificado): https://github.com/claudio00344/elden-ring-nightreign-trainer-coop-2026/releases/download/v1.2.0/elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.zip
- Enlace de releases citado en la model card (GitHub de terceros, no verificado): https://github.com/victoria5511/windsurf-cursor-pro-trial-unlocker-portable/releases/latest
