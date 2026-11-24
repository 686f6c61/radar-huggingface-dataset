# Ghni/zenless-zone-zero-mod-menu-2026

## Resumen

El artefacto publicado bajo el identificador `Ghni/zenless-zone-zero-mod-menu-2026` no es un modelo de lenguaje ni un modelo de IA en sentido estricto. Se trata de un repositorio alojado en Hugging Face cuyo contenido es una model card que distribuye un ejecutable de Windows (`delta-executor-pc-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB protegido con la contraseña `2026`) presentado como "mod menu" para el videojuego Zenless Zone Zero. El autor declarado es el usuario `Ghni`, con licencia MIT y etiquetas de plataforma (windows, windows-11, x64, portable) y de idioma.

La publicación no incluye pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia: el campo `pipeline` aparece como no disponible y las descargas y likes son cero en el momento de la consulta. El texto de la model card describe funcionalidades propias de una herramienta de modding (escáner dinámico de offsets, radar 2D, filtro de loot, suavizado de entrada Bézier, tecla de pánico `END`), no capacidades de un modelo fundacional.

Por tanto, esta ficha documenta el artefacto tal como está publicado, señalando explícitamente que no existen parámetros, contexto, cuantizaciones ni benchmarks que evaluar. La relevancia técnica es nula desde la perspectiva de IA open source, y la publicación presenta patrones característicos de distribución de software potencialmente no deseado (ejecutable opaco, contraseña de descompresión para evadir análisis automatizados, enlaces a repositorios de terceros).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows distribuido vía model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card, referidos a la documentación, no a capacidades del modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP de 4,8 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal que describir. El artefacto es un binario Windows x64 (`delta-executor-pc-2026-v1.2.2-win64.exe`, build declarada `v2.0.5` con firma `F5B4F4E096`) empaquetado en `delta-executor-pc-2026-v1.2.2-win64.zip`. La model card menciona componentes como "user-mode external core" con renderizado por Desktop Duplication "sin hooks DLL internos", un escáner de offsets con resolución automática de firmas de punteros, cuatro hilos de trabajo para el cambio en caliente de perfiles JSON y una tecla de descarga de pánico con liberación de handles.

No se documenta ningún proceso de entrenamiento, dataset, tokenizador, RLHF, DPO ni innovación en atención o decodificación. La terminología empleada ("thread-safe", "lock-free", "zero-trace process exit") describe ingeniería de software de cliente, no aprendizaje automático.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni razonamiento.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No dispone de modo de razonamiento multi-paso, thinking mode, visión ni audio.
- Las funcionalidades declaradas son de manipulación de proceso en Windows: escáner dinámico de offsets, radar 2D con filtro de loot por rareza, suavizado de entrada Bézier con radio de FOV configurable y VisCheck, perfiles JSON intercambiables (Legit, Visual, Custom) y tecla de pánico `END`.
- Los idiomas listados en los metadatos corresponden a la localización de la documentación del repositorio, no a capacidades lingüísticas de un modelo.

## Casos de uso

- No aplica: el artefacto no es un modelo de IA y no puede emplearse en tareas de generación, clasificación, recuperación ni razonamiento.
- Auditoría de seguridad: un equipo puede analizar el binario en un entorno aislado para determinar su comportamiento real, dado que la contraseña de descompresión (`2026`) y la ausencia de código fuente impiden la inspección directa.
- Estudio de campañas de distribución en Hugging Face: el caso sirve para documentar cómo se emplean model cards y etiquetas de licencia permisiva para alojar ejecutables ajenos al ecosistema de IA.
- Formación en higiene de cadena de suministro: ilustra la práctica de exigir contraseña al ZIP para dificultar el escaneo automático de malware en plataformas de alojamiento.
- Verificación de políticas de plataforma: permite contrastar los términos de uso de Hugging Face sobre alojamiento de binarios y software de terceros.
- No se identifican casos de uso legítimos de inferencia, despliegue o integración en pipelines de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es evaluable con MMLU, HumanEval, GSM8K ni métricas equivalentes. Las únicas cifras de la model card son latencias declaradas de la herramienta de escritorio (por ejemplo, `< 33 ms` para el radar y la descarga de pánico, `< 16 ms` para el suavizado Bézier, `< 23 ms` para el núcleo externo y `< 43 MB` de RAM), sin metodología de medición ni verificación independiente.

## Requisitos de hardware

- Plataforma objetivo declarada: Windows 10 (22H2) y Windows 11 (24H2), 64 bits.
- VRAM: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no aplica.
- Ejecución en GPU de consumo: no aplica.
- Despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI; el artefacto se ejecuta como proceso de usuario en Windows y la model card indica ejecutarlo "como administrador".
- Consumo declarado: menos de 43 MB de RAM y cuatro hilos de trabajo, sin datos independientes que lo confirmen.

## Comparativa con modelos similares

| Criterio | Ghni/zenless-zone-zero-mod-menu-2026 | Modelo de lenguaje open source típico (p. ej., familia Llama, Qwen o Mistral) | Herramienta de modding legítima publicada en GitHub |
|---|---|---|---|
| Naturaleza | Ejecutable Windows en model card | Pesos de red neuronal | Código fuente y releases |
| Parámetros | no disponible | Miles de millones | no aplica |
| Contexto | no disponible | Decenas de miles de tokens | no aplica |
| Pesos publicados | No | Sí (safetensors, GGUF) | No aplica |
| Código fuente | No | Habitualmente sí o parcial | Sí |
| Licencia | MIT (declarada) | Apache 2.0, MIT, licencias comunitarias | Variable |
| Verificabilidad | Baja (ZIP con contraseña) | Alta (pesos y configs auditables) | Alta (repositorio público) |

No se identifican modelos comparables dentro de la categoría de IA open source porque el artefacto no pertenece a ella.

## Limitaciones y advertencias

- No es un modelo de IA: no dispone de pesos, arquitectura, tokenizador ni pipeline; cualquier expectativa de inferencia es infundada.
- El binario se distribuye comprimido con contraseña (`2026`), práctica que dificulta el análisis automatizado por parte de plataformas y antivirus.
- La model card enlaza a repositorios de GitHub de terceros (`dawidb9567/delta-executor-pc-2026`, `Lombardo263/zenless-zone-zero-mod-menu-2026`) distintos del espacio de nombres del autor en Hugging Face, lo que rompe la trazabilidad de la cadena de suministro.
- La licencia MIT declarada en los metadatos no acredita la legitimidad del contenido ni la titularidad del software distribuido.
- El uso de herramientas de modificación de procesos en videojuegos en línea puede infringir los términos de servicio del juego y acarrear el bloqueo de cuentas; en algunas jurisdicciones puede tener implicaciones legales.
- Riesgo de malware: ejecutar binarios opacos "como administrador" otorga privilegios elevados a código no auditado.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez porque no aplican a este tipo de artefacto.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria de ningún tipo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ghni/zenless-zone-zero-mod-menu-2026
- Repositorio citado en la model card (tercero): https://github.com/dawidb9567/delta-executor-pc-2026
- Releases citadas en la model card (tercero): https://github.com/Lombardo263/zenless-zone-zero-mod-menu-2026/releases/latest
- No se han encontrado papers, blogs técnicos ni demos oficiales asociados al artefacto en los resultados de búsqueda disponibles.
