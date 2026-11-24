# blingwooo/dubai-rp-script-portable

## Resumen

`blingwooo/dubai-rp-script-portable` no es un modelo de inteligencia artificial. Es un repositorio de Hugging Face que distribuye un ejecutable de Windows (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, empaquetado en un ZIP de 4,8 MB) presentado como "script portable" para el juego Marvel Rivals. La model card describe funcionalidades propias de un cheat: aimbot con suavizado de entrada por curvas de Bezier, ESP con cajas 2D/3D y esqueletos de huesos, radar 2D, filtro de loot y una capa de render "stream-proof" pensada para evadir la captura de OBS, ShadowPlay y Discord.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni artefactos propios de un modelo de lenguaje. Los tags declarados (windows, windows-11, x64, portable) y la lista de idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) son metadatos de indexación, no indicativos de capacidades lingüísticas reales. El pipeline figura como no disponible.

Es relevante ahora únicamente como caso de estudio de abuso de plataformas de distribución de modelos: un binario de terceros con contraseña de archivo (`2026`), instrucciones para ejecutarlo como administrador y recomendaciones explícitas de añadirlo a la lista blanca de Windows Defender. No debe tratarse como software fiable ni como modelo evaluable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario PE x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; sin validación funcional) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. La model card documenta en su lugar un conjunto de módulos de un ejecutable: suavizado de entrada por curvas de Bezier con radio de FOV configurable y comprobación de visibilidad, overlay externo a 144 Hz con cajas 2D/3D y esqueletos de huesos, radar 2D con filtrado de objetos por rareza, un escáner dinámico de offsets con resolución automática de firmas de punteros tras parches del juego, perfiles JSON con intercambio en caliente y una capa de render aislada frente a capturas de pantalla.

Los datos que se citan (menos de 19 MB de RAM, menos de 28 ms de respuesta, sondeo a 341 Hz, cuatro hilos de trabajo, build `v3.9.7 (6F4D75)`) son afirmaciones del autor sin verificación independiente. No hay información sobre dataset, tokens, RLHF, DPO ni ninguna innovación técnica en el sentido habitual del término.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales pese a la lista de idiomas del repositorio.
- El binario declara funciones de trampa en videojuegos: aimbot, ESP, radar y filtro de loot.
- Declara una capa de ocultación frente a OBS, ShadowPlay y Discord.

## Casos de uso

- Ninguno legítimo en el ámbito de la IA open source: el repositorio no contiene un modelo que pueda desplegarse, evaluarse ni integrarse en un pipeline.
- Auditoría de seguridad: analizar en un entorno aislado el binario para documentar técnicas de evasión de captura y de escaneo de offsets, como muestra de malware o cheat.
- Estudio de abuso de plataformas: examinar cómo se usan metadatos de modelo (tags, licencia, idiomas) para indexar y distribuir binarios ajenos al propósito de Hugging Face.
- Formación en ciberseguridad: usar la model card como ejemplo de ingeniería social (badges falsos de descargas y valoraciones, contraseña de archivo, instrucciones para desactivar el antivirus).
- Investigación sobre integridad competitiva: documentar el ecosistema de cheats en shooters y sus vectores de distribución.
- Respuesta a incidentes: emplear los indicadores del repositorio (nombre del ZIP, hash de build, contraseña `2026`) para bloquear la descarga en redes corporativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras son afirmaciones del autor sobre el propio ejecutable (menos de 19 MB de RAM, menos de 28 ms de respuesta, 341 Hz de sondeo, consistencia del 99,2 %), sin metodología ni verificación.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits, según la model card.
- CPU: x64 (Intel o AMD), según la model card.
- VRAM: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto es un `.exe` que se ejecuta como administrador.
- Latencia y throughput: no disponibles; las cifras del autor no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. Frente a un modelo de lenguaje real, la comparación relevante es de naturaleza, no de rendimiento: aquí no hay parámetros, contexto, pesos ni licencia de uso de un modelo, sino un binario de terceros con licencia MIT declarada sobre el repositorio.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal en contextos técnicos o académicos.
- Riesgo de seguridad alto: la model card pide ejecutar un `.exe` como administrador y añadir su directorio a la lista blanca de Windows Defender, lo que desactiva protecciones frente a código malicioso.
- El archivo va protegido con contraseña (`2026`), práctica habitual para dificultar el análisis automático por parte de antivirus y escáneres.
- Los badges de descargas (131K+) y valoración (99 % verificado) son imágenes estáticas sin respaldo en las métricas reales del repositorio, que registra 0 descargas y 0 likes.
- La licencia MIT declarada no otorga derechos sobre el contenido de terceros ni exime del cumplimiento de los términos de servicio del juego objetivo.
- El uso de cheats en juegos multijugador puede conllevar el baneo de cuentas y, según jurisdicción, responsabilidad civil o penal.
- Los idiomas declarados no implican soporte real de ningún tipo.
- No hay información sobre sesgos ni alucinaciones porque no hay modelo generativo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/blingwooo/dubai-rp-script-portable
- Repositorio de GitHub citado en la model card (descarga del ZIP): https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Releases citadas en la model card: https://github.com/mleone4574/dubai-rp-script-portable/releases/latest
- Paper, blog o demo: no disponible
