# santegizii/realistic-street-soccer-script

## Resumen

El artefacto publicado bajo el identificador `santegizii/realistic-street-soccer-script` en Hugging Face no es un modelo de inteligencia artificial. Se trata de un repositorio que distribuye un ejecutable de Windows de 4,8 MB (`dandys-world-forsaken-script-2026-v1.2.2-win64.zip`, protegido con la contraseña `2026`), presentado como un "script" para el videojuego *Dandy's World*, con funcionalidades declaradas de tipo trampa (aimbot con suavizado Bézier, radar 2D, filtro de objetos, exclusión de captura de pantalla en OBS/ShadowPlay/Discord y tecla de pánico `END`).

No existe ninguna arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia asociados. El contenido de la model card es material promocional de ingeniería social: enlaces a binarios alojados en GitHub, instrucciones para ejecutar un `.exe` como administrador y referencias cruzadas entre cuentas distintas (`YetofoBa59`, `pedrolong1343`), lo que constituye un patrón habitual de distribución de *malware* o *PUAs*.

Esta ficha documenta el artefacto con fines de evaluación de riesgo y advertencia, no como recurso utilizable. No debe descargarse ni ejecutarse en ningún entorno, y no es comparable con ningún modelo open source real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es un `.zip` de 4,8 MB con un `.exe`) |

## Arquitectura y entrenamiento

No aplica. No hay arquitectura de transformer, MoE, SSM ni híbrida, ni datos de entrenamiento, ni proceso de RLHF/DPO. El contenido técnico declarado en la model card describe subsistemas de un programa de Windows: núcleo externo en modo usuario, renderizado por Desktop Duplication, liberación de handles con tecla de pánico, exclusión de captura de pantalla, suavizado de entrada Bézier con radio de FOV configurable, radar 2D asíncrono con 13 hilos de trabajo y perfiles JSON intercambiables en caliente con menos de 65 MB de RAM. Ninguno de estos datos está verificado y proceden exclusivamente del texto promocional del autor.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; la lista de idiomas es metadato de etiquetado del repositorio.
- Declara, según el autor, funciones de automatización sobre un videojuego: apuntado asistido, radar, filtrado de objetos y ocultación ante software de captura. Estas declaraciones no están verificadas y su uso suele infringir los términos de servicio de los juegos.

## Casos de uso

- Ninguno legítimo. El artefacto no es un modelo desplegable en pipelines de IA.
- Auditoría de seguridad: análisis estático y dinámico del `.exe` en una máquina virtual aislada y sin red, para caracterizar el binario y sus indicadores de compromiso.
- Formación en concienciación: usar la model card como ejemplo de ingeniería social (contraseña en archivo comprimido, instrucciones de "ejecutar como administrador", enlaces cruzados entre cuentas) en cursos de ciberseguridad.
- Investigación de campañas de *malware*: correlacionar los identificadores de cuenta y los patrones de distribución con otras publicaciones similares.
- Monitorización de plataformas: alimentar sistemas de detección de contenido abusivo en Hugging Face y GitHub.
- Respuesta a incidentes: extraer reglas de detección (nombres de archivo, hashes, URLs de descarga) para *endpoint detection and response*.
- Documentación de políticas: base para justificar la retirada del repositorio y la suspensión de las cuentas implicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (tiempos de respuesta de 6 ms, 29 ms, 34 ms, consistencia del 98,4 %, uso de RAM inferior a 65 MB) son afirmaciones promocionales del autor, no mediciones reproducibles, y no se refieren a ninguna tarea de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica.
- Cabe en GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10/11 de 64 bits.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras del autor no son verificables.
- Requisito real de ejecución: privilegios de administrador sobre el sistema anfitrión, lo que amplía el impacto potencial de cualquier código malicioso.

## Comparativa con modelos similares

No disponible. No existe categoría de comparación: el artefacto no es un modelo de lenguaje ni multimodal. Compararlo con modelos open source reales sería metodológicamente incorrecto.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, tokenizador, arquitectura y pipeline; no puede evaluarse con métricas de calidad de modelo.
- Riesgo elevado de *malware*: distribución mediante `.zip` con contraseña, ejecutable con privilegios de administrador y enlaces de descarga alojados en cuentas de GitHub de terceros.
- Inconsistencias internas: el identificador del repositorio (`santegizii/realistic-street-soccer-script`) no coincide con las cuentas citadas en la model card (`YetofoBa59`, `pedrolong1343`); el nombre del archivo menciona *Dandy's World* mientras el título habla de *Street Soccer*.
- Licencia MIT declarada: no aporta ninguna garantía y no legitima el uso del software para infringir términos de servicio de videojuegos ni legislación sobre trampas comerciales.
- Uso en producción: desaconsejado en cualquier forma; no debe integrarse en entornos corporativos, CI/CD ni sistemas de usuario final.
- Cero tracción verificable: 0 descargas y 0 *likes* en el momento de la consulta, lo que sugiere publicación reciente o artificial.
- Fecha de creación registrada (2026-11-24) incoherente con el contexto temporal habitual de estas fichas; conviene tratarla como metadato no fiable.
- Sesgos y alucinación: no aplica al no ser un modelo generativo; el riesgo equivalente es la desinformación deliberada de la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/santegizii/realistic-street-soccer-script
- Enlace de descarga citado en la model card (no abrir): https://github.com/pedrolong1343/dandys-world-forsaken-script-2026/releases/download/v1.2.0/dandys-world-forsaken-script-2026-v1.2.2-win64.zip
- Página de releases citada en la model card (no abrir): https://github.com/YetofoBa59/realistic-street-soccer-script/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible.
