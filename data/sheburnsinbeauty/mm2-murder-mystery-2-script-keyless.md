# SheBurnsInBeauty/mm2-murder-mystery-2-script-keyless

## Resumen

No disponible. El identificador `SheBurnsInBeauty/mm2-murder-mystery-2-script-keyless` no corresponde a un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un ejecutable portable para Windows (`schedule-1-cheat-trainer-v1.2.2-win64.zip`, 4,8 MB) presentado como "script keyless" para el videojuego *Murder Mystery 2* de Roblox, con módulos de teleport, ESP de entidades, anti-AFK y alertas por webhook de Discord.

El artefacto no contiene pesos, tokenizador, configuración de arquitectura ni código de inferencia. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) describen una aplicación binaria, no un modelo. La model card está redactada como página de descarga con enlaces a repositorios de GitHub de terceros, contraseña de descompresión y avisos sobre falsos positivos de Windows Defender.

Por tanto, esta ficha no puede evaluar capacidades de generación, razonamiento o contexto: no existen. Se documenta el artefacto con fines de catalogación y se advierte de que su descarga y ejecución con privilegios de administrador conlleva riesgos de seguridad no verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No disponible. No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de alineación (RLHF/DPO) ni innovación técnica de modelado que describir. El contenido del repositorio es una aplicación de escritorio empaquetada, con una build identificada como `v2.6.3 (52FD86)` y un tamaño declarado de 4,8 MB, que según la model card interactúa con el cliente de Roblox mediante lectura de memoria y entrada virtual.

La model card menciona módulos como *low-ping server hopper*, *anti-AFK guard*, configuración JSON persistente, alertas por webhook de Discord, teleport por coordenadas y ESP 3D de entidades y cofres. Son funciones de automatización de juego, no componentes de un sistema de IA.

## Capacidades

- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No dispone de tool calling ni function calling en el sentido de un modelo de lenguaje.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio).
- El artefacto declara funciones de automatización sobre el cliente del juego: teleport por coordenadas, ESP de entidades y cofres, anti-AFK, cambio automático de servidor y notificaciones por webhook.
- Los idiomas listados en los metadatos no implican soporte lingüístico del ejecutable; no hay evidencia de interfaz multilingüe en la información disponible.

## Casos de uso

- Catalogación y auditoría de repositorios: registrar el artefacto como ejemplo de contenido no relacionado con IA alojado en Hugging Face, útil para calibrar filtros de moderación y políticas de ingesta de datasets.
- Análisis de seguridad defensiva: estudiar la estructura de una distribución que combina binario portable, contraseña de descompresión fija (`2026`) y enlaces a repositorios de GitHub de terceros, patrón habitual en campañas de malware.
- Formación en detección de ingeniería social: usar la model card como muestra de técnicas de persuasión (badges de descargas y valoraciones, botones de descarga destacados, FAQ que anticipa alertas del antivirus).
- Investigación sobre integridad de plataformas: documentar cómo se reutilizan infraestructuras de modelos abiertos para distribuir software ajeno al ecosistema.
- Concienciación de usuarios finales: ilustrar por qué ejecutar binarios con "Run as Administrator" procedentes de repositorios sin trazabilidad verificable es una práctica de riesgo.
- No se identifica ningún caso de uso legítimo de inferencia, generación o análisis de lenguaje para este artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (`4.8/5`, `193K+` descargas, `99.6%` de consistencia, `< 22 ms` de respuesta, `364 Hz` de polling) son afirmaciones del autor sin metodología ni evidencia reproducible, y no corresponden a métricas de evaluación de modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados por el autor: Windows 10/11 de 64 bits, arquitectura x64 (Intel o AMD), 4,8 MB de espacio en disco para el archivo comprimido.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, ya que el artefacto no es un modelo de IA. Frente a un modelo de lenguaje real de tamaño pequeño (por ejemplo, un transformer de menos de 1.000 millones de parámetros), las diferencias son categóricas: aquel requiere pesos en safetensors o GGUF, tokenizador y runtime de inferencia; este es un ejecutable cerrado sin pesos ni API de inferencia.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse en MMLU, HumanEval, GSM8K ni ninguna prueba de razonamiento o generación.
- Distribución mediante enlace a un repositorio de GitHub de terceros, no alojada en el propio repositorio de Hugging Face; la trazabilidad del binario no es verificable.
- El binario se ejecuta con privilegios de administrador según las instrucciones del autor, lo que amplía el impacto potencial de cualquier código malicioso.
- El archivo se distribuye con contraseña fija (`2026`), práctica que dificulta el análisis automático por parte de antivirus y sistemas de sandbox.
- La model card anticipa explícitamente falsos positivos de Windows Defender y SmartScreen, lo que puede inducir al usuario a desactivar protecciones.
- Uso previsto orientado a la modificación de un videojuego en línea; puede infringir los términos de servicio de Roblox y de *Murder Mystery 2*, con riesgo de suspensión de cuentas.
- Licencia MIT declarada en los metadatos, sin que se pueda verificar su aplicabilidad al binario distribuido por un tercero.
- Los idiomas listados no están respaldados por evidencia de soporte real en el ejecutable.
- No se recomienda su descarga ni ejecución en entornos de producción o personales sin análisis previo en un entorno aislado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SheBurnsInBeauty/mm2-murder-mystery-2-script-keyless
- Enlace de descarga citado en la model card (GitHub de terceros): https://github.com/arjunzimmermann624/schedule-1-cheat-trainer/releases/download/v1.2.0/schedule-1-cheat-trainer-v1.2.2-win64.zip
- Releases citadas en la model card (GitHub de terceros): https://github.com/thomasfontana8267/mm2-murder-mystery-2-script-keyless/releases/latest
- Paper, blog o demo oficial: no disponible
