# cupsster/deadlock-cheat-esp-aimbot-portable

## Resumen

El repositorio `cupsster/deadlock-cheat-esp-aimbot-portable` no contiene un modelo de inteligencia artificial. Se trata de un paquete publicado en Hugging Face que se presenta como una herramienta de trampas (cheat) para el videojuego Deadlock, con funcionalidades declaradas de ESP (visualización de información del enemigo a través de paredes) y aimbot (asistencia de puntería automatizada). El artefacto descrito es un ejecutable de Windows x64 distribuido en un archivo ZIP de 4,8 MB protegido con contraseña.

La model card no describe ninguna arquitectura de red neuronal, ningún conjunto de datos de entrenamiento ni ningún proceso de inferencia. Los campos técnicos habituales (parámetros, contexto, cuantización, formato de pesos) no son aplicables: el contenido es un binario `.exe` para Windows 10/11 de 64 bits, no un modelo de lenguaje ni un modelo multimodal. Por tanto, esta ficha documenta un artefacto que no encaja en la categoría de modelo de IA y advierte de los riesgos asociados a su uso.

La relevancia de documentarlo es precisamente la de señalar el mal uso de la plataforma Hugging Face para alojar software potencialmente malicioso o fraudulento, etiquetado con metadatos de modelo (licencia MIT, etiquetas de idioma) que no se corresponden con su naturaleza real. Cualquier evaluador que encuentre este repositorio debe tratarlo como software no verificado y de origen dudoso, no como un modelo que pueda descargarse e integrarse en un pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del autor; no verificable) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un `.exe` dentro de un `.zip` de 4,8 MB) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. Según la model card, el paquete contiene un ejecutable llamado `schedule-1-cheat-trainer-2026-v1.2.2-win64.exe` (build `v2.7.1` / `A132E1C916`) empaquetado en `schedule-1-cheat-trainer-2026-v1.2.2-win64.zip`, con contraseña de descompresión `2026`. El autor declara módulos como un overlay externo a 144 Hz, un escáner de offsets dinámicos con respuesta inferior a 4 ms, un radar 2D con filtro de botín y un núcleo en modo usuario que evita hooks de DLL internos.

No se proporciona información sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni ninguna innovación técnica de aprendizaje automático. Los términos "worker threads", "RAM < 35 MB" y "consistencia del 97,3%" que aparecen en la model card son afirmaciones de marketing sobre el rendimiento del ejecutable, no resultados de benchmarks de un modelo. No hay evidencia verificable de que el binario haga lo que declara, ni de que sea seguro ejecutarlo.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- Las capacidades declaradas por el autor son de manipulación de un videojuego: ESP (cajas 2D/3D, esqueletos de huesos, distancia), aimbot, radar 2D, filtro de botín y perfiles JSON intercambiables en caliente.
- El autor afirma compatibilidad con Windows 10 y Windows 11 de 64 bits y exclusión de captura de pantalla en OBS, ShadowPlay y Discord.
- Ninguna de estas capacidades ha sido verificada de forma independiente y su uso conlleva riesgos de seguridad y de cumplimiento de los términos de servicio del videojuego.

## Casos de uso

- Ninguno recomendado. Este artefacto no es un modelo de IA y no tiene aplicaciones legítimas en desarrollo de software, investigación o producción.
- Auditoría de seguridad: un equipo podría analizar el binario en un entorno aislado para determinar si contiene código malicioso, pero nunca ejecutarlo en una máquina de producción ni con credenciales reales.
- Estudio de abuso de plataforma: investigadores de seguridad pueden usar este repositorio como ejemplo de publicación de software no verificado en Hugging Face con metadatos engañosos (licencia MIT, etiquetas de idioma, etiquetas de modelo).
- Formación y concienciación: sirve como caso práctico para explicar por qué no debe ejecutarse software descargado de repositorios no oficiales ni introducir contraseñas de archivos proporcionadas por terceros.
- No se identifican casos de uso legítimos adicionales. Cualquier escenario que implique ejecutar el `.exe` en un sistema real supone un riesgo de seguridad y de posible sanción por parte de los términos de servicio del juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (144 Hz, menos de 4 ms de respuesta, 97,3 % de consistencia, menos de 35 MB de RAM) son afirmaciones del autor sin metodología ni verificación independiente, y no constituyen benchmarks de un modelo de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits.
- Opciones de despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI; el artefacto es un ejecutable de escritorio).
- Latencia y throughput: no disponibles; las cifras del autor no son verificables.
- Tamaño del paquete: 4,8 MB comprimido.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" comparable, porque el artefacto no es un modelo. Frente a modelos reales de lenguaje o multimodal, la comparación carece de sentido: no hay parámetros, contexto, licencia de pesos ni rendimiento medible que contrastar.

## Limitaciones y advertencias

- No es un modelo de IA: los metadatos de Hugging Face (licencia MIT, etiquetas de idioma, etiquetas de modelo) no reflejan la naturaleza real del artefacto.
- Riesgo de seguridad elevado: ejecutar un `.exe` de origen desconocido, distribuido con contraseña y alojado en un repositorio sin reputación (0 descargas, 0 likes), puede comprometer el sistema.
- La contraseña `2026` y el enlace de descarga apuntan a un repositorio de GitHub de terceros, no al propio Hugging Face, lo que dificulta la trazabilidad.
- Uso contrario a los términos de servicio de Deadlock y potencialmente a la legislación sobre trampas en videojuegos en algunas jurisdicciones.
- La licencia MIT declarada no otorga ninguna garantía sobre el binario ni sobre su legalidad de uso.
- No hay evidencia de que las capacidades declaradas funcionen; podría tratarse de un señuelo para distribuir malware.
- No debe ejecutarse en entornos de producción, máquinas con credenciales ni sistemas sin aislamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cupsster/deadlock-cheat-esp-aimbot-portable
- Repositorio de GitHub citado en la model card: https://github.com/isabellama84854/deadlock-cheat-esp-aimbot-portable
- Repositorio de GitHub del paquete de descarga: https://github.com/francescoc822/schedule-1-cheat-trainer-2026
- Enlace de descarga directa citado: https://github.com/francescoc822/schedule-1-cheat-trainer-2026/releases/download/v1.2.0/schedule-1-cheat-trainer-2026-v1.2.2-win64.zip
- No se han encontrado papers, blogs técnicos ni demos oficiales en la información disponible.
