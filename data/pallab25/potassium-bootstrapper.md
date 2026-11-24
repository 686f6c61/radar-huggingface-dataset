# Pallab25/potassium-bootstrapper

## Resumen

`Pallab25/potassium-bootstrapper` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial, sino un supuesto ejecutable para Windows x64 distribuido a través de un archivo ZIP alojado en GitHub. La model card no describe ninguna arquitectura de red neuronal, pesos, tokenizador ni proceso de entrenamiento; en su lugar, presenta instrucciones para descargar y ejecutar un binario denominado `marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, presuntamente orientado a trampas (ESP, aimbot) para el videojuego Marvel Rivals.

El contenido de la model card incluye enlaces a repositorios de GitHub de terceros, una contraseña de descompresión (`2026`) y peticiones para ejecutar el binario con privilegios de administrador. Estos patrones son característicos de campañas de distribución de software malicioso (malware) que se camuflan como herramientas o utilidades en plataformas de modelos. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado el 24 de noviembre de 2026.

Desde la perspectiva de un editor técnico especializado en IA open source, este repositorio no constituye un modelo evaluable: no hay parámetros, contexto, licencia de pesos ni artefactos de inferencia. La ficha se redacta a continuación cumpliendo la estructura obligatoria, marcando como "no disponible" todos los campos técnicos de IA y documentando el riesgo de seguridad asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo; no aplicable a un modelo) |
| Licencia | MIT (según metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un ejecutable de Windows) |

## Arquitectura y entrenamiento

No disponible. El repositorio no contiene ningún artefacto de modelo de aprendizaje automático: no hay archivos `safetensors`, `GGUF`, `bin`, `onnx` ni configuración de arquitectura (`config.json`). No se declara proceso de entrenamiento, dataset, tokens procesados, RLHF, DPO ni ninguna innovación técnica de modelado.

El contenido de la model card describe funcionalidades de un supuesto *cheat* para videojuegos (escáner de offsets dinámicos, overlay externo a 144 Hz, radar 2D, filtro de loot, capa de renderizado "stream-proof", tecla de pánico y perfiles JSON), lo que confirma que el repositorio no tiene relación con IA generativa ni con modelos de lenguaje.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un LLM; los códigos de idioma de los metadatos son meramente etiquetas del repositorio.
- No dispone de modo "thinking", visión, audio ni ninguna capacidad de inferencia.

## Casos de uso

- Ninguno legítimo como modelo de IA. El repositorio no ofrece capacidades de inferencia que puedan integrarse en pipelines de desarrollo, atención al cliente, generación de código, análisis de datos ni investigación.
- Uso potencial documentado por el autor: ejecución de un binario de Windows presentado como herramienta de trampas para Marvel Rivals. Este uso conlleva riesgos de seguridad, posibles violaciones de los términos de servicio del videojuego y exposición a malware.
- Auditoría de seguridad: un analista podría examinar el repositorio como muestra de una campaña de distribución de software no deseado que abusa de Hugging Face como canal de alojamiento.
- Investigación de threat intelligence: documentar el patrón de la model card (enlaces a GitHub de terceros, contraseña de ZIP, instrucciones de "Run as Administrator") como indicador de compromiso.
- Formación y concienciación: usar el caso como ejemplo didáctico de por qué no deben ejecutarse binarios descargados de repositorios de modelos sin verificación.
- Moderación de plataformas: servir como referencia para políticas de detección de contenido malicioso en hubs de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica: no hay inferencia de modelo que ejecutar.
- El artefacto distribuido es un ejecutable de Windows x64 de 4,8 MB empaquetado en un ZIP; no requiere GPU, VRAM ni aceleradores.
- No se recomienda su ejecución en ningún entorno, ni de desarrollo ni de producción, por los riesgos de seguridad descritos.
- Opciones de despliegue con vLLM, llama.cpp, Ollama o TGI: no disponibles, al no existir pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparables, ya que el repositorio no contiene un modelo de IA. Podría compararse con otros repositorios maliciosos o de spam alojados en hubs de modelos, pero no con modelos de lenguaje, visión o audio.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; cualquier expectativa de inferencia es infundada.
- La model card enlaza a binarios alojados en repositorios de GitHub de terceros no verificados y solicita ejecutarlos con privilegios de administrador, un patrón clásico de distribución de malware.
- La contraseña de descompresión (`2026`) se usa habitualmente para evadir análisis automáticos de antivirus sobre el ZIP.
- La licencia MIT declarada en los metadatos no otorga ninguna garantía sobre el binario distribuido ni sobre su legalidad.
- El uso del software descrito (trampas en videojuegos) puede violar los términos de servicio de Marvel Rivals y acarrear el bloqueo de cuentas.
- Riesgo elevado de robo de credenciales, instalación de *payloads* adicionales, mineros de criptomonedas o *ransomware* si se ejecuta el binario.
- No debe citarse como modelo en comparativas técnicas ni incluirse en catálogos de modelos de IA.
- Recomendación: reportar el repositorio a Hugging Face para su revisión y eliminación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Pallab25/potassium-bootstrapper
- Enlaces de descarga citados en la model card (no verificados, no recomendados): https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card (no verificado): https://github.com/AudreyTrinh18/potassium-bootstrapper/releases/latest
- No se han encontrado papers, blogs, demos ni repositorios oficiales de un modelo de IA asociados a este repositorio.
