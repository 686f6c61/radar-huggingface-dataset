# Ben-Dax/chicken-farm-script

## Resumen

`Ben-Dax/chicken-farm-script` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es una página de distribución de un supuesto ejecutable para Windows x64 (`chicken-farm-script-v1.2.0-win64.exe`, versión `v2.5.1`), empaquetado en un ZIP de 8,9 MB protegido con contraseña. La model card describe módulos de superposición externa, suavizado de entrada Bézier, radar 2D, filtro de botín y una capa de renderizado "stream-proof" que excluye la captura de OBS, ShadowPlay y Discord. En la propia FAQ se autodenomina `game cheat` (trampa para videojuegos).

No existe ningún artefacto de pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia. El repositorio no tiene descargas ni likes, la fecha de creación y actualización es idéntica (24 de noviembre de 2026) y los enlaces de descarga apuntan a un repositorio de GitHub de terceros (`ZifireQa40/chicken-farm-script`) ajeno a Hugging Face. La etiqueta `license: mit` figura en los metadatos, pero no acompaña a ningún código fuente ni a ningún modelo.

Por tanto, esta ficha documenta un artefacto que no cumple los criterios de modelo open source: no hay parámetros, no hay contexto, no hay entrenamiento y no hay benchmarks. Cualquier evaluación técnica en términos de arquitectura o rendimiento carece de sentido. El interés para desarrolladores e investigadores es exclusivamente como caso de estudio de abuso de plataformas de distribución de modelos y de riesgo de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin verificación) |
| Licencia | mit (declarada en metadatos, sin código fuente asociado) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal, ni dataset, ni proceso de entrenamiento. El contenido descrito en la model card corresponde a un binario de Windows x64 con módulos de manipulación de memoria de otros procesos: superposición externa a 144 Hz o más, lectura de memoria en modo usuario sin hooks de DLL internos, suavizado de entrada Bézier con radio de FOV configurable, radar 2D con filtrado de objetos por rareza y una capa de exclusión de captura de pantalla. El autor menciona una clave de pánico (`END`) con liberación de handles en menos de 33 ms y un polling de 206 Hz, cifras que no son verificables y que en ningún caso describen capacidades de un modelo.

Tampoco se documenta ningún proceso de alineación (RLHF, DPO), ni innovación en atención, decodificación especulativa o arquitecturas híbridas. La única "innovación" declarada es la evasión de detección por parte de sistemas antitrampas y de software de captura.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma de los metadatos son etiquetas de descubrimiento sin respaldo funcional.
- Las funciones descritas son de superposición gráfica, lectura de memoria de procesos ajenos y automatización de entrada, orientadas a hacer trampas en videojuegos.
- No hay modo "thinking", ni audio, ni ninguna capacidad de modelo fundacional.

## Casos de uso

No se identifican casos de uso legítimos para desarrolladores o investigadores. Los escenarios que el autor describe son los siguientes, y se listan únicamente con fines de análisis de riesgo:

- Automatización de entrada en videojuegos: el binario aplica curvas Bézier configurables sobre la entrada del usuario para simular movimiento humano; se trata de una función de trampa, no de una herramienta de productividad.
- Superposición de información en pantalla: dibuja cajas delimitadoras 2D/3D y esqueletos sobre el juego mediante Desktop Duplication, lo que constituye asistencia visual no permitida en la mayoría de títulos.
- Radar y filtrado de objetos: muestra la posición de entidades y filtra contenedores por rareza, alterando la experiencia de juego y violando habitualmente los términos de servicio.
- Exclusión de captura: oculta la superposición de OBS, ShadowPlay y Discord, lo que dificulta la moderación y la verificación por parte de terceros.
- Distribución de software con contraseña fija (`2026`): patrón habitual para evadir análisis automatizados de malware y de sistemas antitrampas.
- Investigación en seguridad: el artefacto puede analizarse en un entorno aislado como ejemplo de ingeniería social y de abuso de la infraestructura de Hugging Face para distribuir ejecutables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (98,9 % de consistencia, menos de 33 ms de respuesta, 206 Hz de polling, 144 Hz+ de superposición) son afirmaciones de marketing del autor, no medidas reproducibles, y no corresponden a ninguna tarea evaluable de un modelo de lenguaje o multimodal.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo objetivo: Windows 10 u 11 de 64 bits, según la model card.
- Espacio en disco: 8,9 MB para el ZIP; el tamaño descomprimido no se especifica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras del autor no son verificables.

## Comparativa con modelos similares

No procede una comparativa con modelos de IA. A modo de contexto, se compara con otros tipos de artefacto que ocasionalmente aparecen en Hugging Face:

| Artefacto | Naturaleza | Pesos | Contexto | Licencia | Riesgo |
|---|---|---|---|---|---|
| `Ben-Dax/chicken-farm-script` | Ejecutable de Windows con módulos de trampa | No | No aplica | MIT declarada | Alto: binario opaco, contraseña fija, enlaces externos |
| Modelo de lenguaje open source típico (p. ej. familia Llama, Qwen, Mistral) | Red neuronal con pesos safetensors/GGUF | Sí | Miles de tokens | Permisiva o comunitaria | Bajo o medio, auditable |
| Repositorio de dataset en Hugging Face | Datos estructurados | No aplica | No aplica | Variable | Bajo, verificable |
| Script de automatización publicado en GitHub | Código fuente visible | No aplica | No aplica | Variable | Medio, auditable |

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse en términos de calidad, sesgo o alucinación porque no genera texto ni realiza inferencia.
- Riesgo de seguridad elevado: se distribuye un ejecutable de procedencia no verificada, alojado en un repositorio de GitHub de terceros, con contraseña de extracción fija y sin firma de código.
- La model card reconoce explícitamente que Windows Defender y SmartScreen pueden alertar y recomienda desactivar o ignorar esas protecciones, lo que constituye una práctica de riesgo.
- El binario se ejecuta "como administrador" según las instrucciones del autor, lo que amplía el impacto potencial de cualquier código malicioso.
- La licencia MIT declarada no tiene efecto práctico: no hay código fuente sobre el que ejercer los derechos, y la licencia MIT no cubre la distribución de binarios sin el texto de licencia correspondiente.
- El uso de software de trampa en videojuegos suele violar los términos de servicio de las plataformas y puede conllevar el bloqueo de cuentas; en algunas jurisdicciones puede tener implicaciones legales.
- Los enlaces de descarga y el repositorio de GitHub asociado no pertenecen al autor declarado en Hugging Face, lo que impide verificar la cadena de custodia del artefacto.
- No debe descargarse ni ejecutarse fuera de un entorno aislado y sin conexión, y solo con fines de análisis de malware.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ben-Dax/chicken-farm-script
- Repositorio de GitHub referenciado por el autor (terceros): https://github.com/ZifireQa40/chicken-farm-script
- Descarga directa citada en la model card (no verificar ni ejecutar): https://github.com/ZifireQa40/chicken-farm-script/releases/latest/download/chicken-farm-script-v1.2.0-win64.zip
- Página de releases citada: https://github.com/ZifireQa40/chicken-farm-script/releases/latest
- Paper, blog o demo técnicos: no disponible (no existen)
