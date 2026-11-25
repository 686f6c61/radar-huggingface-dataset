# LUMEN0ASTRA/king-legacy-gpo-script

## Resumen

`LUMEN0ASTRA/king-legacy-gpo-script` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un ejecutable portable para Windows x64 presentado como "script" para el videojuego Roblox King Legacy, con funciones de automatización (anti-AFK, bucles de farmeo, cambio automático de servidor, alertas por webhook de Discord y optimización de framerate). El autor, LUMEN0ASTRA, lo publica bajo licencia MIT y lo etiqueta con catorce idiomas, aunque esa etiqueta describe los idiomas de la documentación y no capacidades lingüísticas de ningún modelo.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje: la model card es en realidad una página de descarga que distribuye un archivo `schedule-1-cheat-trainer-2026-v1.2.2-win64.zip` de 4,8 MB alojado en GitHub, protegido con contraseña y que instruye a ejecutarlo como administrador. El pipeline no está definido, no hay descargas ni "likes", y las fechas de creación y actualización (24 de noviembre de 2026) son incoherentes con el momento de la consulta.

Por tanto, esta ficha documenta un artefacto que no es evaluable como modelo: no hay parámetros, contexto, cuantizaciones ni benchmarks que reportar. Lo relevante para desarrolladores e investigadores es la advertencia de seguridad: el patrón (binario ejecutable con contraseña, instrucciones para desactivar avisos de Defender/SmartScreen, enlaces a repositorios de GitHub de terceros y nombres de archivo que suplantan a otros proyectos) coincide con campañas habituales de distribución de malware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible como modelo; la etiqueta del repositorio lista en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id |
| Licencia | MIT (según metadatos del repositorio) |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento que describir. El artefacto distribuido es un binario PE para Windows x64 (`schedule-1-cheat-trainer-2026-v1.2.2-win64.exe`, build declarada `v2.9.9 (6F57BC)`) empaquetado en un ZIP de 4,8 MB con contraseña `2026`. La model card menciona módulos internos con cifras no verificables (5 y 10 hilos de trabajo, sondeo a 431 Hz y 174 Hz, consumo inferior a 53 MB de RAM, consistencia del 97,4 % en la persistencia de configuración JSON), pero no aporta código fuente, hashes ni artefactos reproducibles que permitan auditarlas.

Tampoco hay dataset, tokenizador, RLHF, DPO ni innovación técnica alguna en el sentido habitual del término. La única "técnica" descrita es la inyección de entrada virtual para evitar la expulsión por inactividad en el juego, algo que queda fuera del ámbito de esta ficha.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de una API de modelo.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües como modelo; los catorce idiomas listados son etiquetas de metadatos del repositorio.
- Las funciones que declara el autor son de automatización de un videojuego: guardia anti-AFK, bucle de farmeo, configuración JSON persistente, alertas por webhook de Discord, optimizador de framerate y salto automático entre servidores.
- No hay modo "thinking", visión, audio ni ninguna capacidad multimodal.

## Casos de uso

- Ninguno en el ámbito de IA, desarrollo de software o investigación: el artefacto no expone API, SDK ni interfaz programática documentada.
- Automatización de partidas en Roblox King Legacy: es el uso declarado por el autor, con bucles de farmeo y anti-AFK; queda fuera del alcance de esta ficha y puede contravenir los términos de servicio de la plataforma.
- Auditoría de seguridad defensiva: el repositorio puede emplearse como muestra para analizar patrones de distribución de binarios con contraseña, suplantación de nombres de proyecto y evasión de SmartScreen en entornos controlados y aislados.
- Formación en concienciación: sirve como ejemplo real de model card de Hugging Face que no describe un modelo, útil para enseñar a validar artefactos antes de descargarlos.
- Investigación de abuso de plataformas: permite estudiar cómo se aprovechan los metadatos de Hugging Face (tags, licencia, idiomas) para dar apariencia de legitimidad a contenido ajeno al propósito del sitio.
- No se recomienda su ejecución en ningún entorno de producción, desarrollo ni equipo personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de modelos porque el artefacto no es un modelo. Las cifras de la model card (431 Hz, 174 Hz, 97,4 %, menos de 53 MB de RAM) son afirmaciones del autor sin metodología, código ni verificación independiente.

## Requisitos de hardware

- No requiere VRAM ni GPU: no hay inferencia de red neuronal.
- Entorno declarado: Windows 10 u 11 de 64 bits sobre procesadores Intel o AMD x64.
- No cabe ni deja de caber en GPU de consumo porque no se ejecuta en GPU.
- Opciones de despliegue con vLLM, llama.cpp, Ollama o TGI: no aplicables.
- Latencia y throughput de inferencia: no aplicables; las cifras de sondeo del autor no son medibles ni reproducibles con la información disponible.
- Recomendación: si se manipula el binario por motivos de análisis, hacerlo en una máquina virtual desechable sin red y sin credenciales.

## Comparativa con modelos similares

No procede: no hay modelos comparables porque el artefacto no es un modelo. A modo de contraste de categoría:

| Criterio | king-legacy-gpo-script | Modelo de lenguaje open source típico |
|---|---|---|
| Naturaleza | Ejecutable Windows x64 | Pesos de red neuronal |
| Pesos publicados | No | Sí (safetensors, GGUF) |
| Contexto | No aplicable | Definido en la config del modelo |
| Evaluación reproducible | No | Benchmarks públicos |
| Licencia | MIT declarada en metadatos | Variable (Apache-2.0, MIT, Llama, etc.) |
| Riesgo de seguridad | Alto (binario con contraseña, instrucciones para desactivar SmartScreen) | Bajo si se descarga de fuentes oficiales |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluación como modelo de lenguaje carece de sentido y no debe citarse como tal.
- El binario se distribuye con contraseña (`2026`) y con instrucciones explícitas para ignorar avisos de Windows Defender y SmartScreen y ejecutarlo como administrador; ese patrón es característico de malware.
- El nombre del archivo (`schedule-1-cheat-trainer-2026-v1.2.2-win64.zip`) no coincide con el nombre del repositorio y apunta a un proyecto de GitHub de otro autor, lo que sugiere suplantación o reempaquetado.
- Las métricas de rendimiento declaradas no son verificables: no hay código, hashes ni artefactos auditables.
- La licencia MIT declarada en los metadatos no garantiza la legalidad ni la seguridad del contenido distribuido.
- El uso de automatización en Roblox puede vulnerar los términos de servicio de la plataforma y acarrear el bloqueo de cuentas.
- Los idiomas listados son etiquetas de metadatos, no capacidades del artefacto.
- Las fechas del repositorio (creación y actualización el 24 de noviembre de 2026) son incoherentes y deben tratarse con escepticismo.
- No debe ejecutarse en equipos con datos personales, credenciales o acceso a red corporativa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LUMEN0ASTRA/king-legacy-gpo-script
- Enlace de descarga citado en la model card (GitHub de terceros, no verificado): https://github.com/francescoc822/schedule-1-cheat-trainer-2026/releases/download/v1.2.0/schedule-1-cheat-trainer-2026-v1.2.2-win64.zip
- Página de releases citada en la model card: https://github.com/javed21948/king-legacy-gpo-script/releases/latest
- Resultado de búsqueda web sin relación con el artefacto (contacto de Saepio Information Security): https://revonect.com/contact/Paul%20Richards/id/6f417093381
- No se han encontrado papers, blogs técnicos, demos ni repositorios de código fuente asociados al artefacto.
