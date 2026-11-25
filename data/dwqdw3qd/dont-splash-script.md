# dwqdw3qd/dont-splash-script

## Resumen

`dwqdw3qd/dont-splash-script` no es un modelo de inteligencia artificial. El repositorio de Hugging Face no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje, visión o audio. Se trata de un repositorio que aloja una supuesta aplicación ejecutable para Windows x64 distribuida como archivo ZIP (`delta-executor-pc-2026-v1.2.2-win64.zip`, 4,8 MB) y que se presenta bajo la etiqueta de "script" o "executor".

El contenido de la model card describe módulos de tipo overlay, escáner de offsets de memoria, suavizado de entrada tipo Bézier, perfiles JSON intercambiables en caliente y un núcleo externo en modo usuario que opera sobre memoria de procesos de terceros. Estos términos corresponden al vocabulario habitual de herramientas de trampas o "cheats" para videojuegos, no al de un modelo fundacional. El repositorio incluye enlaces de descarga alojados en un repositorio de GitHub de terceros (`dawidb9567/delta-executor-pc-2026`), una contraseña de descompresión (`2026`) y peticiones explícitas de ejecución como administrador.

Por tanto, esta ficha se redacta como evaluación técnica de un artefacto que no cumple los criterios para ser considerado modelo de IA. La información sobre arquitectura, parámetros, contexto o entrenamiento no existe porque el artefacto no es un modelo. Se documenta lo que sí consta en la información proporcionada y se marcan como "no disponible" los campos que no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no se documenta capacidad lingüística real del artefacto) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (no hay pesos; el artefacto distribuido es un ZIP con un ejecutable `.exe`) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El artefacto declarado es un binario Windows x64 (`delta-executor-pc-2026-v1.2.2-win64.exe`, versión `v1.5.6`, build `77134B`) empaquetado en un ZIP de 4,8 MB protegido con contraseña. La model card menciona componentes como "stream-proof render layer", "dynamic offset scanner", "bezier input smoothing", "hot-swap JSON profiles", "user-mode external core" y "144Hz+ external overlay", junto con cifras de consumo de RAM (por debajo de 40 MB y 55 MB en distintos módulos) y frecuencias de sondeo (322 Hz y 141 Hz). Estos datos describen un programa de manipulación de memoria y renderizado en tiempo real, no un sistema entrenado con tokens, datasets o técnicas de alineación como RLHF o DPO.

No se documenta ningún corpus de entrenamiento, número de tokens, composición de dataset ni innovación algorítmica de aprendizaje automático. La única "innovación" declarada es de naturaleza de ingeniería de software (evasión de captura de pantalla, resolución automática de firmas de punteros tras parches, suavizado de curvas de entrada), y no se aporta evidencia verificable de su funcionamiento.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe real; los códigos de idioma del repositorio son metadatos de etiquetado, no una evaluación de competencia lingüística.
- Las "capacidades" descritas en la model card son funcionalidades de un ejecutable de escritorio orientadas a interactuar con procesos de terceros (overlay, escáner de offsets, perfiles de configuración).

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA, porque el artefacto no es un modelo. Los escenarios que sugiere la model card (overlay sobre juegos, escaneo de memoria de procesos, suavizado de entrada con "humanized target curves", evasión de captura de pantalla en OBS, ShadowPlay y Discord) apuntan a herramientas de trampas en videojuegos y a la evasión de sistemas de detección, lo que conlleva riesgos de seguridad, legales y de integridad de plataforma. No se recomienda su descarga ni ejecución en entornos de producción, investigación ni desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras aportadas son de rendimiento de software declarado por el autor (consumo de RAM inferior a 40 MB y 55 MB, sondeo a 322 Hz y 141 Hz, consistencia del 97,5 %), sin metodología, sin reproducibilidad y sin verificación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Plataforma declarada del artefacto: Windows 10/11 de 64 bits sobre procesadores Intel y AMD x64.
- Requisitos declarados: ejecución como administrador, descompresión con contraseña `2026` y extracción completa del ZIP antes de lanzar el `.exe`.
- Latencia y throughput: no disponibles; las cifras de sondeo del autor no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no pertenece a esa categoría. Compararlo con modelos de lenguaje, visión o audio sería categorialmente incorrecto.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador, configuración de arquitectura ni artefactos de inferencia.
- Distribución mediante ZIP con contraseña y enlace de descarga alojado en un repositorio de GitHub de terceros, no en el propio repositorio de Hugging Face.
- Solicitud explícita de ejecución como administrador, lo que amplía la superficie de riesgo del sistema.
- La model card reconoce que el ejecutable provoca alertas de Windows Defender y SmartScreen; el texto se interrumpe en ese punto, por lo que no consta explicación completa ni garantía de firma de código.
- Los módulos descritos (overlay, escáner de offsets, evasión de captura) son propios de herramientas de trampas, con implicaciones de integridad de plataforma, posibles violaciones de términos de servicio y riesgos legales según jurisdicción.
- Riesgo elevado de malware: un binario ofuscado o empaquetado con contraseña, distribuido fuera de canales oficiales y que pide privilegios de administrador, es un vector habitual de troyanos, mineros o stealers.
- La licencia MIT declarada en los metadatos no cubre necesariamente el binario ni sus dependencias; no hay aviso de copyright ni texto de licencia verificable en la información disponible.
- Cero descargas y cero "likes" en el repositorio en el momento de la consulta, lo que impide cualquier validación por parte de la comunidad.
- No usar en producción, investigación ni entornos corporativos.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/dwqdw3qd/dont-splash-script
- Repositorio de GitHub citado en la model card: https://github.com/Bach1819/dont-splash-script
- Repositorio de GitHub del binario: https://github.com/dawidb9567/delta-executor-pc-2026
- Enlace de descarga directa citado: https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Releases del repositorio citado: https://github.com/Bach1819/dont-splash-script/releases/latest
