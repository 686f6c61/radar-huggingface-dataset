# SNEEEEZED/maxon-zbrush-2026-imm-brushes-portable

## Resumen

El repositorio `SNEEEEZED/maxon-zbrush-2026-imm-brushes-portable` no contiene un modelo de inteligencia artificial. Se trata de un repositorio de Hugging Face cuyo contenido es una página de distribución de un ejecutable de Windows (`delta-executor-pc-2026-v1.2.2-win64.zip`, 4,8 MB) presentado como "Maxon Zbrush 2026 Imm Brushes Portable". La model card describe funciones propias de un *exploit* o *executor* para Roblox (adjuntado de procesos, puente Luau VM, inyección de scripts, sincronización de offsets tras parches del cliente), no capacidades de un modelo de lenguaje, visión o audio.

No existe arquitectura de red neuronal, pesos, tokenizador ni pipeline declarado. Los campos de metadatos de Hugging Face (tags `windows`, `x64`, `portable`, licencia `mit`) y la lista de idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) corresponden a la ficha del repositorio, no a capacidades lingüísticas de un modelo. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

Desde la perspectiva de un catálogo de modelos open source, esta ficha debe clasificarse como **no aplicable**: no hay modelo que evaluar. Además, el patrón descrito (binario empaquetado en ZIP con contraseña, instrucciones para desactivar avisos de SmartScreen/Defender, ejecución como administrador, inyección en un cliente de terceros) coincide con la distribución típica de *malware* o *cheats* para videojuegos, no con software legítimo de modelado 3D ni con un modelo de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los idiomas listados son metadatos del repo, no capacidades del modelo) |
| Licencia | mit (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo. El artefacto descrito es un binario ejecutable para Windows x64 (`delta-executor-pc-2026-v1.2.2-win64.exe`, build `v4.4.9 (79CB71)`) empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`. La model card menciona componentes como "Luau VM bridge", "process attachment", "auto-execute directory" y "post-patch offset sync", que son propios de un *executor* de scripts para Roblox, no de un sistema entrenado con datos.

No se declara ningún proceso de entrenamiento, dataset, RLHF, DPO ni innovación técnica de aprendizaje automático. Tampoco se publican pesos, checkpoints ni configuración de inferencia.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües; los idiomas del repositorio son etiquetas de metadatos.
- No dispone de modo *thinking*, visión, audio ni multimodalidad.
- El contenido de la model card describe funciones de inyección de scripts en un cliente de terceros (Roblox), lo que queda fuera del ámbito de un modelo de IA y entra en el de software potencialmente malicioso.

## Casos de uso

No procede. Un repositorio de este tipo no es apto para ningún caso de uso legítimo de un modelo de IA. A modo de advertencia, los escenarios que sugiere la model card son:

- Ejecución de scripts no autorizados en un cliente de terceros (Roblox), con riesgo de sanción por parte del proveedor del servicio.
- Inyección de código en procesos ajenos en Windows, con implicaciones de seguridad y posible incumplimiento de términos de servicio.
- Distribución de binarios con contraseña y evasión de avisos de seguridad del sistema operativo, patrón habitual en campañas de *malware*.
- Suplantación de marca (Maxon ZBrush) para atraer descargas: el nombre del repositorio no corresponde al producto real de Maxon.
- Ninguno de estos escenarios es un caso de uso de IA; se listan únicamente para dejar constancia de la naturaleza del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica: no hay modelo que ejecutar.
- El artefacto declarado es un `.exe` de Windows x64 que, según la model card, requiere Windows 10 u 11 de 64 bits y ejecución como administrador.
- No hay requisitos de VRAM, GPU ni aceleradores.
- No hay opciones de despliegue con vLLM, llama.cpp, Ollama ni TGI, porque no existe un modelo de pesos.
- No se publican latencias ni throughput de inferencia; las cifras de milisegundos de la model card se refieren a operaciones del ejecutable, no a inferencia de IA.

## Comparativa con modelos similares

No disponible. No existe categoría de modelo comparable: este repositorio no es un modelo de IA, por lo que no se puede contrastar con alternativas de parámetros, contexto o licencia en el sentido habitual del catálogo.

| Criterio | Este repositorio | Modelo de IA típico |
|---|---|---|
| Pesos publicados | no | sí (safetensors, GGUF, etc.) |
| Arquitectura de red | no | transformer, MoE, SSM, etc. |
| Contexto | no disponible | definido en la model card |
| Benchmarks | no | MMLU, HumanEval, GSM8K, etc. |
| Artefacto distribuido | ZIP con `.exe` de Windows | pesos y tokenizador |

## Limitaciones y advertencias

- No es un modelo de IA: no debe registrarse ni evaluarse como tal en un catálogo de modelos.
- Suplantación de marca: el nombre "Maxon Zbrush 2026" no corresponde a un producto de Maxon; el contenido real es un *executor* para Roblox.
- Riesgo de seguridad alto: binario distribuido en ZIP con contraseña, instrucciones para ejecutar como administrador y para desactivar avisos de Windows Defender/SmartScreen. Este patrón es característico de *malware*.
- Posible incumplimiento de términos de servicio de Roblox y de la legislación sobre acceso no autorizado a sistemas.
- La licencia `mit` declarada en los metadatos no aporta garantías sobre el binario distribuido ni sobre su procedencia.
- Cero descargas y cero likes: no hay evidencia de uso ni de revisión por parte de la comunidad.
- No debe descargarse ni ejecutarse en entornos de producción ni de desarrollo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SNEEEEZED/maxon-zbrush-2026-imm-brushes-portable
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código, demos ni documentación técnica legítima asociados a este repositorio.
- Los enlaces de descarga incluidos en la model card apuntan a un ZIP alojado en GitHub (`delta-executor-pc-2026-v1.2.2-win64.zip`) y no se reproducen aquí por motivos de seguridad.
