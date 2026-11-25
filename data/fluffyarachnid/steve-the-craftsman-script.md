# fluffyarachnid/steve-the-craftsman-script

## Resumen

`fluffyarachnid/steve-the-craftsman-script` es un repositorio alojado en Hugging Face que, pese a su ubicación, no contiene un modelo de inteligencia artificial. La model card describe un supuesto paquete ejecutable para Windows (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip`, 4,8 MB) distribuido como "trainer" o "script" para el videojuego *Kingdom Come: Deliverance 2*, con funcionalidades declaradas de radar 2D, filtro de loot, overlay externo, ESP de esqueletos y escáner dinámico de offsets.

El artefacto se presenta con etiquetas propias de un modelo (`license: mit`, una lista de 14 idiomas, tags de región), pero el contenido del README corresponde a una página de descarga de software de trampas para juegos, con enlaces a binarios alojados en GitHub, contraseña de descompresión (`2026`) e instrucciones para ejecutar el ejecutable como administrador y desactivar avisos de Windows Defender. No hay pesos, tokenizador, configuración de arquitectura ni ningún artefacto relacionado con aprendizaje automático.

Desde la perspectiva de un catálogo de modelos, este repositorio debe considerarse no conforme: no es un modelo, no es desplegable mediante frameworks de inferencia y su contenido (un ejecutable de terceros con contraseña y recomendaciones de exclusión de antivirus) presenta los indicadores típicos de una distribución de malware o de software no verificado. No se recomienda su descarga ni ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio no contiene ficheros de pesos (`safetensors`, `GGUF`, `bin` ni equivalentes), ni configuración de transformer, MoE, SSM o modelo híbrido. El contenido descrito en la model card es un binario Windows x64 (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`) empaquetado en un ZIP protegido con contraseña, que según el autor implementa lectura de memoria del proceso del juego, renderizado de overlay mediante Desktop Duplication y resolución dinámica de offsets.

Los únicos "datos técnicos" declarados son cifras de rendimiento del ejecutable (respuesta en menos de 14 ms, polling a 361 Hz, 5 y 12 hilos de trabajo, menos de 47 MB de RAM), sin metodología de medición ni código fuente verificable. No hay información sobre dataset, tokens de entrenamiento, RLHF, DPO ni ninguna innovación en el ámbito del aprendizaje automático.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; la lista de idiomas en los metadatos es un campo de etiquetado del repositorio, no una capacidad del artefacto.
- Las funcionalidades declaradas son las de un "trainer" o cheat de videojuego: radar 2D, filtro de loot por rareza, seguimiento de contenedores, cajas delimitadoras 2D/3D, ESP de esqueletos y distancias, exclusión de captura en OBS/ShadowPlay/Discord y tecla de pánico (`END`).

## Casos de uso

- No se identifican casos de uso legítimos en el ámbito de la IA, el desarrollo de software o la investigación, dado que el repositorio no contiene un modelo.
- Uso como referencia de estudio de repositorios abusivos en Hugging Face: puede servir para documentar patrones de repositorios que se hacen pasar por modelos para distribuir binarios no verificados (etiquetas de licencia e idiomas, badges falsos de descargas y valoraciones, enlaces a releases de GitHub de terceros).
- Auditoría de cadena de suministro: útil como ejemplo de artefacto que combina contraseña de descompresión, instrucciones para ejecutar como administrador y recomendaciones de exclusión de Windows Defender, todos ellos indicadores de riesgo.
- Formación en seguridad: caso práctico para explicar por qué no deben ejecutarse binarios descargados de repositorios de modelos sin verificación de firma ni análisis previo.
- No se recomienda ningún uso operativo del ejecutable distribuido, ni en entornos de producción ni en estaciones de trabajo personales.
- No aplica en pipelines de inferencia (vLLM, TGI, llama.cpp, Ollama) porque no hay pesos que cargar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras del README (menos de 14 ms de respuesta, 361 Hz de polling, menos de 47 MB de RAM) corresponden al ejecutable de trampas, no a un modelo, y carecen de metodología reproducible.

## Requisitos de hardware

- No aplica VRAM para inferencia: no hay modelo que cargar.
- El artefacto declarado requiere Windows 10 (22H2) o Windows 11 (24H2) de 64 bits y ejecución como administrador.
- No se especifican requisitos de GPU; el renderizado se describe como overlay externo basado en Desktop Duplication.
- No procede despliegue con vLLM, llama.cpp, Ollama ni TGI.
- No se han publicado cifras de latencia o throughput verificables para ningún componente de IA.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el repositorio no contiene un modelo de IA. Los artefactos comparables serían otros repositorios abusivos o binarios no verificados, para los que no procede una comparativa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; el uso de la plataforma Hugging Face para alojar la model card de un ejecutable de trampas para juegos constituye un uso indebido de la misma.
- El binario se distribuye en un ZIP protegido con contraseña (`2026`) alojado en un repositorio de GitHub de un tercero (`ErikMercier70637`), no en el propio repositorio de Hugging Face.
- Las instrucciones incluyen ejecutar el `.exe` como administrador y añadir su directorio a las exclusiones de Windows Defender/SmartScreen, prácticas que anulan las protecciones del sistema y son habituales en la distribución de malware.
- Los badges del README (215K+ descargas, valoración 4,8/5, build `v1.8.9 (F13559)`) no son verificables y contradicen los metadatos de Hugging Face, que registran 0 descargas y 0 likes.
- La licencia MIT declarada en los metadatos no aporta garantía alguna sobre el binario distribuido ni sobre su procedencia.
- El uso de "trainers" o cheats en juegos multijugador puede infringir los términos de servicio del juego y la legislación aplicable en materia de trampas comerciales; en *Kingdom Come: Deliverance 2*, título principalmente para un jugador, el riesgo principal es de seguridad del sistema, no competitivo.
- Riesgo alto de que el ejecutable contenga código malicioso (stealer, ransomware, minero) dado el patrón de distribución: binario comprimido con contraseña, alojamiento externo, exclusión de antivirus y ejecución con privilegios elevados.
- No debe citarse este repositorio como ejemplo de modelo en catálogos, comparativas ni evaluaciones técnicas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fluffyarachnid/steve-the-craftsman-script
- Release de GitHub referenciada en la model card (no verificar ni ejecutar): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Repositorio de GitHub referenciado: https://github.com/yoko1890/steve-the-craftsman-script/releases/latest
- Paper: no disponible
- Blog o demo: no disponible
