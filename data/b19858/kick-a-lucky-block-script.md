# b19858/kick-a-lucky-block-script

## Resumen

El repositorio `b19858/kick-a-lucky-block-script` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows x64 (build `v1.6.4`, identificador `DA3B29`, 4,8 MB) que la model card describe como un script/trainer para el videojuego *Kingdom Come: Deliverance 2*, con módulos de entrada sintética, radar 2D, filtro de loot y capa de exclusión de captura de pantalla. El autor lo publica bajo licencia MIT y lo etiqueta con 14 idiomas, pero no incluye pesos, tokenizador, configuración de arquitectura ni artefactos de inferencia.

Por tanto, no existe arquitectura de red neuronal, número de parámetros, longitud de contexto ni proceso de entrenamiento que documentar. La ficha se limita a reflejar los datos verificables del repositorio y a señalar las advertencias de seguridad relevantes: el propio README indica que el binario se distribuye en un ZIP protegido con contraseña (`2026`), que debe ejecutarse "como administrador" y que los antivirus pueden marcarlo, además de enlazar a un repositorio de GitHub de terceros (`ErikMercier70637/kingdom-come-deliverance-2-trainer-2026`) distinto del autor declarado.

Es relevante ahora únicamente como caso de mal uso de Hugging Face para distribuir ejecutables ajenos al ecosistema de modelos, y como recordatorio de que las etiquetas `language`, `license` y los badges de la model card no garantizan que el contenido sea un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del autor) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip`, 4,8 MB) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir. El artefacto es un binario PE para Windows x64 (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`) empaquetado en un ZIP de 4,8 MB con contraseña `2026`. La model card menciona módulos internos como "panic key unload (`END`)", "bezier input smoothing" a 128 Hz, "hot-swap JSON profiles" a 362 Hz, "stream-proof render layer" con exclusión de OBS/ShadowPlay/Discord, "dynamic offset scanner" y "2D radar & loot filter", con consumo declarado inferior a 38-41 MB de RAM y latencias de 9-15 ms. Son afirmaciones del autor sin verificación independiente.

No se documenta ningún proceso de entrenamiento, dataset, RLHF, DPO ni innovación algorítmica. Las cifras de frecuencia y latencia provienen exclusivamente del texto promocional de la model card.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa razonamiento multi-paso ni modo "thinking".
- Capacidades declaradas por el autor (no verificadas): suavizado de entrada tipo bezier, perfiles JSON intercambiables en caliente, radar 2D con filtro de loot, escáner de offsets dinámicos y exclusión de captura de pantalla.
- Multilingüe solo a nivel de etiqueta de metadatos; no hay evidencia de localización real del binario.

## Casos de uso

- No se identifican casos de uso legítimos en el ámbito de IA, desarrollo o investigación. El artefacto no ejecuta inferencia.
- Auditoría de seguridad: analizar el binario en un entorno aislado para comprobar si el ZIP con contraseña y la petición de privilegios de administrador ocultan carga maliciosa.
- Estudio de spam en Hugging Face: documentar patrones de repositorios que reutilizan badges, etiquetas de idioma y licencias permisivas para distribuir ejecutables.
- Formación en higiene de cadena de suministro: usar el caso como ejemplo de enlaces de descarga que apuntan a repositorios de GitHub de terceros no coincidentes con el autor declarado.
- Monitorización de plataformas: alimentar clasificadores de contenido que detecten model cards con instrucciones de "ejecutar como administrador" y contraseñas embebidas.
- Respuesta a incidentes: si un usuario ha ejecutado el binario, aplicar el procedimiento de contención correspondiente (aislamiento del host, rotación de credenciales, análisis forense).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits (según la model card).
- RAM declarada por el autor: menos de 38-41 MB adicionales durante la ejecución de los módulos descritos.
- GPU: no aplica; no se declara uso de aceleración por hardware.
- VRAM estimada: no disponible (no hay modelo que cargar).
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no aplica.
- Latencia y throughput: cifras del autor no verificadas (9-15 ms de respuesta, polling de 128 Hz y 362 Hz).

## Comparativa con modelos similares

| Criterio | `b19858/kick-a-lucky-block-script` | Modelo de lenguaje open source típico (p. ej. familia Llama/Qwen/Mistral) | Repositorio vacío o de prueba en Hugging Face |
|---|---|---|---|
| Naturaleza | Ejecutable Win64 empaquetado | Pesos en safetensors/GGUF | Metadatos sin artefacto |
| Parámetros | no disponible | 1B-70B+ | no disponible |
| Contexto | no disponible | 4K-128K+ | no disponible |
| Licencia | MIT | Variable (Llama, Apache-2.0, etc.) | Variable |
| Inferencia posible | No | Sí | No |
| Riesgo de seguridad | Alto (binario con contraseña y privilegios de administrador) | Bajo | Nulo |

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con MMLU, HumanEval, GSM8K ni métricas equivalentes.
- El ZIP está protegido con contraseña (`2026`), práctica que dificulta el análisis automatizado por antivirus y plataformas de escaneo.
- La model card pide ejecutar el binario "como administrador", lo que amplía el impacto potencial de cualquier comportamiento malicioso.
- El enlace de descarga apunta a `github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026`, un repositorio distinto del autor declarado en Hugging Face (`b19858`); inconsistencia de cadena de suministro.
- El propio README reconoce que Windows Defender y SmartScreen pueden alertar y recomienda hacer whitelist del directorio, lo que desactiva protecciones de seguridad.
- Las etiquetas de idioma (14 idiomas) y la licencia MIT no implican soporte real ni cesión de derechos sobre el binario; la licencia del ejecutable es responsabilidad del autor del código original.
- El contenido se refiere a un "game cheat" para *Kingdom Come: Deliverance 2*; su uso puede violar los términos de servicio del juego y la legislación aplicable en materia de trampas y distribución de software.
- No se debe descargar ni ejecutar en máquinas de producción, de desarrollo con credenciales ni en entornos sin aislamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/b19858/kick-a-lucky-block-script
- Repositorio de GitHub enlazado en la model card: https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026
- Release enlazada (ZIP con contraseña): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Repositorio alternativo citado en los badges: https://github.com/Raza8756/kick-a-lucky-block-script
- Paper, blog o demo: no disponible
