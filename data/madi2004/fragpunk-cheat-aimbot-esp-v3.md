# Madi2004/fragpunk-cheat-aimbot-esp-v3

## Resumen

El artefacto publicado bajo el identificador `Madi2004/fragpunk-cheat-aimbot-esp-v3` en Hugging Face no es un modelo de inteligencia artificial ni un modelo de lenguaje. Se trata de un paquete binario para Windows x64 (un ejecutable `.exe` dentro de un archivo `.zip` de 8,9 MB) que la propia model card describe como una herramienta de trampas para el videojuego Fragpunk: aimbot con suavizado de entrada Bézier, ESP (overlay con cajas delimitadoras, esqueletos de huesos y radar 2D), filtro de loot y perfiles JSON intercambiables en caliente.

La ficha se ha solicitado como evaluación de un modelo open source, pero la información disponible no contiene ningún dato relativo a arquitectura neuronal, parámetros, contexto, tokenizador, datos de entrenamiento ni benchmarks. El repositorio no declara pipeline en Hugging Face, cuenta con 0 descargas y 0 likes, y fue creado y actualizado el 24 de noviembre de 2026, con apenas un segundo de diferencia entre ambos eventos, lo que sugiere una publicación automatizada.

Por tanto, esta ficha documenta el artefacto tal como está descrito, señalando explícitamente qué campos no son aplicables o no están disponibles, y advierte de los riesgos graves asociados a su naturaleza (software de trampas, distribución vía enlaces a GitHub Releases con contraseña de archivo, evasión de capturas de pantalla y alertas de SmartScreen). No debe interpretarse como una recomendación de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un binario PE x64 para Windows) |
| Parámetros totales | no disponible (no aplica) |
| Parámetros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; corresponde a la documentación del repositorio, no a capacidades lingüísticas de un modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un `.zip` con un `.exe`; no hay safetensors, GGUF ni pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. Según la model card, el paquete contiene `fragpunk-cheat-aimbot-esp-v3-v1.2.0-win64.exe` (build `v1.1.6`, identificador `7AF0CC`), un binario que afirma funcionar sin dependencias externas y que opera mediante lectura de memoria del proceso del juego («direct-memory»), con módulos descritos como escáner dinámico de offsets con resolución automática de firmas de punteros tras parches, capa de render «stream-proof» que excluye la captura en OBS, ShadowPlay y Discord, overlay externo a 144 Hz o más con sondeo a 207 Hz, radar 2D con filtrado de loot por rareza, perfiles JSON con conmutación en menos de 15 ms y suavizado de entrada Bézier con radio de FOV configurable y comprobación de visibilidad.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni ninguna innovación de aprendizaje automático. Los únicos «parámetros» técnicos declarados son de rendimiento del binario: uso de RAM inferior a 50 MB, sondeo a 358 Hz en la capa de render y 207 Hz en el overlay, ocho hilos de trabajo y consistencia del 99,6 % en el filtro de radar, cifras todas ellas no verificables de forma independiente.

## Capacidades

- Aimbot con suavizado de trayectoria Bézier, radio de FOV configurable y comprobación de visibilidad (VisCheck), según la descripción del autor.
- ESP con cajas delimitadoras 2D y 3D, esqueletos de huesos y distancia al objetivo.
- Radar 2D con filtrado de objetos por rareza y seguimiento de contenedores.
- Overlay externo con exclusión de captura de pantalla en OBS, ShadowPlay y Discord.
- Escáner dinámico de offsets con resolución automática de firmas tras actualizaciones del juego.
- Perfiles JSON intercambiables con una tecla (presets Legit, Visual y Custom).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión artificial, tool calling, capacidades de agente ni modo de pensamiento. Las etiquetas de idioma del repositorio no implican competencia lingüística.

## Casos de uso

Ninguno de los siguientes casos constituye una recomendación; se enumeran porque la ficha exige documentar aplicaciones prácticas descritas o plausibles, y en este caso todas ellas son problemáticas:

- Manipulación de partidas multijugador en Fragpunk: el binario se ejecutaría junto al juego para superponer información oculta y automatizar la puntería, lo que vulnera los términos de servicio del juego y puede conllevar el baneo permanente de la cuenta.
- Investigación defensiva de anticheats: un equipo de seguridad podría analizar el binario en un entorno aislado para extraer firmas de detección, aunque hacerlo exige sandboxing estricto y análisis de malware, no ejecución en un equipo de trabajo.
- Estudio de técnicas de evasión de captura: la capa «stream-proof» es un ejemplo documentado de cómo el software de trampas intenta eludir la grabación de pantalla, útil como material de formación en seguridad de videojuegos.
- Análisis de ingeniería inversa de binarios Windows x64: el escáner dinámico de offsets y la resolución de firmas de punteros son técnicas que aparecen en malware y en herramientas de análisis, por lo que el artefacto podría servir como muestra en un laboratorio de reversing.
- Concienciación sobre riesgos de descargas con contraseña: el patrón de ZIP protegido con la contraseña `2026` y alojado en GitHub Releases es un vector habitual de distribución de software malicioso, útil como caso de estudio en formación de usuarios.
- Auditoría de cumplimiento en plataformas de modelos: este repositorio es un ejemplo de contenido que no debería clasificarse como modelo de IA, relevante para diseñar políticas de moderación en hubs como Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas cifras declaradas por el autor son métricas internas del binario, no verificables y sin comparación con alternativas:

| Métrica declarada | Valor | Verificable |
|---|---|---|
| Uso de RAM | < 50 MB | no |
| Sondeo de la capa de render | 358 Hz | no |
| Sondeo del overlay | 207 Hz | no |
| Hilos de trabajo | 8 | no |
| Consistencia del radar | 99,6 % | no |
| Tiempo de cambio de perfil | < 15 ms | no |
| Tamaño del paquete | 8,9 MB | sí (según la model card) |

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11 de 64 bits, sobre procesadores Intel o AMD x64.
- VRAM: no aplica; no hay inferencia de modelo ni pesos que cargar.
- RAM: el autor declara menos de 50 MB para el propio binario, sin contar el juego.
- GPU: no aplica; no se requiere GPU dedicada para el artefacto en sí.
- Cabe en cualquier equipo consumer con Windows x64, incluidos portátiles de gama baja, siempre que se cumplan los requisitos del juego.
- Opciones de despliegue: no hay soporte de vLLM, llama.cpp, Ollama, TGI ni ningún servidor de inferencia. El despliegue descrito es ejecutar el `.exe` como administrador tras extraer el ZIP con la contraseña `2026`.
- Latencia y throughput: no disponibles; las cifras de Hz y milisegundos de la model card no son medibles ni auditables de forma independiente.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Si se compara como software de trampas, la información proporcionada no incluye alternativas con las que contrastar parámetros, contexto, rendimiento, licencia o disponibilidad.

| Criterio | Este artefacto | Alternativa comparable |
|---|---|---|
| Tipo | Binario de trampas para Windows x64 | no disponible |
| Parámetros | no aplica | no disponible |
| Contexto | no aplica | no disponible |
| Licencia | MIT | no disponible |
| Disponibilidad | 0 descargas, 0 likes en Hugging Face | no disponible |

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, tokenizador, arquitectura y cualquier capacidad de generación o razonamiento. Su presencia en un hub de modelos es un error de clasificación o un intento de abuso de la plataforma.
- Riesgo de malware: la distribución mediante un ZIP con contraseña (`2026`) alojado en GitHub Releases y la advertencia explícita sobre alertas de Windows Defender y SmartScreen son patrones habituales en la distribución de software malicioso. No se debe ejecutar en un equipo de confianza.
- Riesgo legal y de cuenta: el uso de trampas en juegos multijugador vulnera los términos de servicio de Fragpunk y puede acarrear suspensión permanente, además de posibles consecuencias legales según la jurisdicción.
- Evasión de controles: la capa «stream-proof» está diseñada para eludir la grabación de pantalla, lo que dificulta la detección por parte de moderadores y sistemas antitrampas.
- Licencia MIT: aunque permisiva, no otorga ninguna garantía ni exime de responsabilidad por el uso del binario; el autor no ofrece soporte ni auditoría.
- Idiomas: las etiquetas de idioma del repositorio (14 lenguajes) no reflejan capacidades del artefacto, sino probablemente la localización de la documentación o un intento de posicionamiento en búsquedas.
- Sin métricas fiables: todas las cifras de rendimiento son declaraciones del autor sin verificación independiente.
- Sin comunidad: 0 descargas y 0 likes indican ausencia de validación por terceros; cualquier confianza depositada en el artefacto es injustificada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Madi2004/fragpunk-cheat-aimbot-esp-v3
- Repositorio GitHub referenciado en la model card: https://github.com/daan876/fragpunk-cheat-aimbot-esp-v3
- Releases del repositorio GitHub: https://github.com/daan876/fragpunk-cheat-aimbot-esp-v3/releases/latest
- Paquete directo citado en la model card: https://github.com/daan876/fragpunk-cheat-aimbot-esp-v3/releases/latest/download/fragpunk-cheat-aimbot-esp-v3-v1.2.0-win64.zip
- No se han encontrado papers, blogs técnicos, demos ni documentación adicional en la información proporcionada.
