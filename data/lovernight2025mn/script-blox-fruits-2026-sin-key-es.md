# lovernight2025mn/script-blox-fruits-2026-sin-key-es

## Resumen

El artefacto publicado bajo el identificador `lovernight2025mn/script-blox-fruits-2026-sin-key-es` no es un modelo de inteligencia artificial. Se trata de un paquete binario para Windows x64 (un supuesto ejecutor de scripts para Roblox, orientado al juego Blox Fruits) distribuido a través de Hugging Face aprovechando la infraestructura de la plataforma. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje: la model card describe un archivo ZIP de 4,8 MB protegido con contraseña y un ejecutable que requiere permisos de administrador.

La relevancia de esta ficha es, por tanto, fundamentalmente de advertencia. El contenido presenta todos los patrones habituales de una campaña de distribución de software potencialmente malicioso: repositorio creado y actualizado en el mismo segundo, cero descargas y cero interacciones, etiquetas que mezclan nombres de proyectos ajenos (un supuesto entrenador de Monster Hunter Wilds) con el nombre del paquete, enlaces de descarga que apuntan a un repositorio de GitHub de un tercero distinto del autor declarado, y una sección de preguntas frecuentes dedicada exclusivamente a convencer al usuario de desactivar las alertas de Windows Defender y SmartScreen.

No existe información técnica verificable sobre arquitectura, parámetros, contexto ni entrenamiento porque no hay ningún modelo detrás. Cualquier dato de ese tipo que se pudiera inferir sería inventado, por lo que en esta ficha se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; sin relación con capacidades lingüísticas reales) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto descrito es un ZIP con un ejecutable `.exe`) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado, ni datos de entrenamiento, ni proceso de ajuste (RLHF, DPO u otros). La model card describe módulos de un supuesto ejecutor de scripts para Roblox con afirmaciones no verificables: sincronización de offsets tras parches, auto-ejecución de directorios, un hub de scripts integrado, compatibilidad declarada del "98%+ sUNC", un editor basado en Monaco y soporte de múltiples instancias. Ninguna de estas afirmaciones viene acompañada de código fuente, binarios verificables, hashes ni trazabilidad de build más allá de una etiqueta `v2.4.2 (E78482)`.

El paquete se distribuye como `monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip`, un nombre que no coincide con el del repositorio ni con el del supuesto proyecto, y el enlace de descarga apunta a un repositorio de GitHub (`martina1713/monster-hunter-wilds-trainer-mod-2026`) distinto del autor declarado en Hugging Face (`lovernight2025mn`). Esta discrepancia entre identidades es un indicador claro de falta de integridad en la cadena de distribución.

## Capacidades

- No se puede atribuir ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión, porque no hay modelo.
- No hay soporte verificable de tool calling ni de function calling.
- No hay soporte verificable de agentes ni de razonamiento multi-paso.
- No hay capacidades multilingües reales; la lista de idiomas en los metadatos es meramente declarativa.
- El artefacto afirma ser un ejecutor de scripts para Roblox (Blox Fruits), lo que implicaría manipulación de procesos de un tercero y posible incumplimiento de los términos de servicio de la plataforma.
- No se ha publicado código fuente, binario reproducible ni auditoría independiente que respalde ninguna de las funciones descritas.

## Casos de uso

- No se recomienda ningún caso de uso. El artefacto no es un modelo y su distribución presenta señales de riesgo.
- Evaluación de seguridad y formación: puede utilizarse como ejemplo documentado de campaña de distribución de binarios sospechosos en plataformas de modelos, para ilustrar patrones como contraseñas en archivos comprimidos, instrucciones para desactivar antivirus y suplantación de identidad del autor.
- Análisis de reputación de repositorios: sirve como caso de estudio de repositorios con cero descargas, creados y actualizados en el mismo instante y con etiquetas incoherentes.
- Investigación de fraude en marketplaces de IA: útil para estudiar cómo se abusa del etiquetado y de la infraestructura de Hugging Face para alojar contenido ajeno a modelos.
- Docencia sobre higiene de cadena de suministro de software: ejemplo práctico de por qué no se deben ejecutar binarios de origen desconocido con privilegios de administrador.
- Monitorización automatizada de contenido: patrón de referencia para entrenar o calibrar clasificadores que detecten repositorios de software sospechoso en hubs de modelos.
- Auditoría de licencias y atribución: caso de licencia MIT declarada sobre un artefacto sin código fuente asociado, lo que dificulta verificar el cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, porque el artefacto no es un modelo de lenguaje y no se ha publicado ninguna evaluación de su comportamiento como ejecutable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits.
- Tamaño del paquete: 4,8 MB (ZIP), protegido con la contraseña `2026`.
- Privilegios requeridos: ejecución como administrador según las propias instrucciones del autor.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card (286 Hz de sondeo, menos de 20 ms y menos de 38 ms de respuesta) son afirmaciones sin verificación independiente.

## Comparativa con modelos similares

| Criterio | Este artefacto | Modelo de lenguaje pequeño típico (p. ej. 7B) | Modelo de código típico (p. ej. 6-7B) |
|---|---|---|---|
| Naturaleza | Binario Windows x64 | Pesos de red neuronal | Pesos de red neuronal |
| Parámetros | no disponible | ~7 000 millones | ~6 000-7 000 millones |
| Contexto | no disponible | 8 000-32 000 tokens | 16 000-128 000 tokens |
| Pesos publicados | No | Sí (safetensors, GGUF) | Sí (safetensors, GGUF) |
| Código fuente | No | Parcial (arquitectura publicada) | Parcial |
| Evaluaciones públicas | Ninguna | Benchmarks estándar | Benchmarks estándar |
| Licencia | MIT declarada | Apache 2.0 / MIT / otras | Apache 2.0 / MIT / otras |
| Riesgo de seguridad | Alto (binario opaco, pide desactivar antivirus) | Bajo si se descarga de fuente oficial | Bajo si se descarga de fuente oficial |

La comparación se incluye únicamente para dejar constancia de que el artefacto no es comparable a un modelo de IA en ningún eje técnico relevante.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no procesa lenguaje natural.
- El binario se distribuye comprimido con contraseña, un patrón habitual para evadir el análisis automático de antivirus.
- Las instrucciones piden explícitamente ejecutar el `.exe` como administrador, lo que otorga control total del sistema a un binario no auditado.
- La sección de preguntas frecuentes está dedicada a convencer al usuario de ignorar las alertas de Windows Defender y SmartScreen, lo que constituye una señal de alarma grave.
- El enlace de descarga apunta a un repositorio de GitHub de un autor distinto al declarado en Hugging Face, lo que rompe la cadena de confianza.
- El nombre del ZIP hace referencia a un supuesto entrenador de Monster Hunter Wilds, sin relación con el nombre del repositorio ni con Blox Fruits.
- Cero descargas y cero interacciones en el momento de la consulta, con creación y actualización en el mismo segundo: no hay evidencia de uso legítimo.
- El uso de ejecutores de scripts en Roblox puede violar los términos de servicio de la plataforma y conllevar el bloqueo de cuentas.
- La licencia MIT declarada no permite verificar el origen del código, al no publicarse este.
- Riesgo de robo de credenciales, instalación de malware o secuestro del sistema si se ejecuta el binario.
- No debe utilizarse en producción ni en entornos corporativos bajo ninguna circunstancia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lovernight2025mn/script-blox-fruits-2026-sin-key-es
- Repositorio de GitHub referenciado en la model card (autor distinto): https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026
- Enlace de descarga directa citado en la model card: https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip
- Releases del supuesto autor original: https://github.com/alessia003/script-blox-fruits-2026-sin-key-es/releases/latest
- No se han encontrado papers, blogs técnicos, demos ni documentación adicional en la información proporcionada.
