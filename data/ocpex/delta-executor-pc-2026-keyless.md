# OCPEX/delta-executor-pc-2026-keyless

## Resumen

`OCPEX/delta-executor-pc-2026-keyless` no es un modelo de lenguaje: es un repositorio de Hugging Face que aloja la model card de un supuesto ejecutor de scripts para Roblox denominado "Delta Executor PC 2026 Keyless", distribuido como binario portable para Windows x64. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni artefactos de inferencia; únicamente metadatos de idioma y una tarjeta descriptiva con enlaces a binarios alojados en GitHub.

El artefacto promocionado se presenta como un fichero ZIP de 4,8 MB (`solara-executor-v3-keyless-2026-v1.2.2-win64.zip`) protegido con contraseña, que al descomprimirse genera un ejecutable para Windows 10/11 de 64 bits. La model card describe módulos de attach a procesos, un puente con la máquina virtual Luau, compatibilidad con la API sUNC y un hub de scripts, todo ello orientado a la inyección de scripts en clientes de Roblox.

Desde la perspectiva de un desarrollador o investigador de IA, este repositorio carece de interés técnico como modelo: no hay parámetros, no hay contexto, no hay licencia de pesos que evaluar más allá de la etiqueta MIT declarada en los metadatos, y la propia naturaleza del binario (ejecutable ofuscado con contraseña, enlaces a releases de terceros, instrucciones para desactivar avisos de SmartScreen) constituye una señal de riesgo de seguridad considerable. Se documenta aquí únicamente para dejar constancia de su contenido y advertir de que no debe tratarse como un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para win64) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni información sobre datos, tokenizador, proceso de preentrenamiento, ajuste fino o alineación (RLHF/DPO). La model card describe, en su lugar, componentes de un ejecutable: attach multi-instancia a procesos, puente con la VM Luau, compatibilidad declarada del 98 % con la API sUNC (`hookmetamethod`, `getgc`, `Drawing API`), directorio de auto-ejecución y un hub de scripts con ejecución de presets en la nube. Se mencionan cifras de consumo de memoria (menos de 57 MB, 26 MB y 28 MB en distintos módulos) y latencias (menos de 30 ms en el attach), pero son afirmaciones del autor sin verificación independiente y no constituyen especificaciones de un modelo.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades declaradas por el autor son de ejecución de scripts Luau en clientes de Roblox: attach a procesos, inyección de scripts, hub de presets y auto-ejecución.
- La lista de idiomas de los metadatos (14 idiomas) parece referirse a la localización de la documentación, no a capacidades lingüísticas de un modelo.

## Casos de uso

- Ninguno recomendado en un contexto de IA, desarrollo profesional o investigación. El artefacto no es un modelo y su uso previsto (inyección de scripts en Roblox) puede contravenir los términos de servicio de la plataforma.
- Auditoría de seguridad defensiva: analizar en un entorno aislado y sin privilegios el binario distribuido para comprender técnicas de evasión de SmartScreen y empaquetado con contraseña, con fines de formación en detección de malware.
- Estudio de prácticas de publicación engañosas en Hugging Face: el repositorio sirve como ejemplo de model card que suplanta la estructura de un modelo para distribuir un ejecutable.
- Formación en higiene de cadena de suministro: ilustra por qué no deben ejecutarse binarios de repositorios sin trazabilidad ni firmas.
- No se identifican casos de uso legítimos adicionales a partir de la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras presentes en la model card (98 % de compatibilidad sUNC, 96,4 % de consistencia del hub, latencias inferiores a 30 ms y consumos de memoria de 26–57 MB) son afirmaciones del autor sin metodología ni verificación.

## Requisitos de hardware

- VRAM estimada: no aplica; no hay inferencia de modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados del binario: Windows 10 u 11 de 64 bits, ejecución como administrador, 4,8 MB de archivo comprimido y contraseña `2026` para extraerlo.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras del autor no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos" comparable: este repositorio no es un modelo de IA y no se han identificado alternativas legítimas de la misma naturaleza que merezcan una comparación técnica.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura y pipeline; no puede desplegarse con vLLM, llama.cpp, Ollama ni TGI.
- Riesgo de seguridad alto: se distribuye un ejecutable ofuscado dentro de un ZIP protegido con contraseña, alojado en releases de GitHub de terceros, con instrucciones para ejecutarlo como administrador y para desactivar las alertas de Windows Defender y SmartScreen.
- La licencia MIT declarada en los metadatos no aclara la titularidad del binario ni de los scripts que ejecuta; la model card mezcla enlaces a repositorios de autores distintos (`schneider6972`, `shujiz26784`).
- El uso previsto (inyección de scripts en Roblox) puede violar los términos de servicio de la plataforma y acarrear el bloqueo de cuentas.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni trazabilidad de builds.
- No debe ejecutarse en máquinas de producción, estaciones de trabajo de desarrollo ni entornos con credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OCPEX/delta-executor-pc-2026-keyless
- Release enlazado en la model card (GitHub, autor `schneider6972`): https://github.com/schneider6972/solara-executor-v3-keyless-2026/releases/download/v1.2.0/solara-executor-v3-keyless-2026-v1.2.2-win64.zip
- Releases enlazados en la model card (GitHub, autor `shujiz26784`): https://github.com/shujiz26784/delta-executor-pc-2026-keyless/releases/latest
- Paper, blog o demo oficiales: no disponible.
