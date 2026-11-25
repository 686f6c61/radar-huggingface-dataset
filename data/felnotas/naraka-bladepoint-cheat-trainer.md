# felnotas/naraka-bladepoint-cheat-trainer

## Resumen

`felnotas/naraka-bladepoint-cheat-trainer` no es un modelo de inteligencia artificial. El repositorio de Hugging Face, publicado por el usuario `felnotas`, contiene una model card que distribuye un supuesto ejecutable de Windows (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`, 4,8 MB) presentado como "cheat trainer" para el videojuego Naraka: Bladepoint. No hay pesos, tokenizador, configuración de arquitectura ni pipeline declarado; el campo `pipeline` figura como no disponible y no se ha publicado ningún artefacto propio de un modelo de lenguaje.

La relevancia de esta ficha es, por tanto, documental y de seguridad: el repositorio ilustra un patrón habitual de distribución de software potencialmente malicioso a través de plataformas de modelos. Los indicios son múltiples: el nombre del ejecutable y del ZIP no coincide con el del repositorio (hace referencia a otro juego, *Kingdom Come: Deliverance 2*), los enlaces de descarga apuntan a cuentas de GitHub de terceros ajenas al autor declarado, se exige una contraseña de extracción (`2026`) para eludir análisis automatizados, se solicita ejecución como administrador y se promocionan supuestos módulos de trampa (ESP, radar, aimbot) en un juego multijugador.

No existe información técnica verificable sobre arquitectura, parámetros, contexto o entrenamiento porque no hay modelo. Cualquier dato de rendimiento, benchmarks o requisitos de hardware que aparezca en la model card original debe tratarse como marketing no contrastado. Esta ficha se limita a reflejar lo que el autor declara y a señalar los riesgos asociados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se distribuye un ejecutable de Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica. No se ha publicado ningún modelo neuronal, dataset de entrenamiento, proceso de RLHF/DPO ni innovación técnica de inferencia. El contenido del repositorio es una model card en Markdown con enlaces a un archivo comprimido alojado en GitHub Releases de cuentas de terceros (`ErikMercier70637`, `Isha4274`), sin relación aparente con el usuario `felnotas` que firma el repositorio.

La model card describe módulos de software de trampa para un juego multijugador (overlay externo a 144 Hz, escáner de offsets, radar 2D, suavizado de entrada Bézier, perfiles JSON), con cifras de latencia y consumo de RAM no verificables. No hay código fuente, binarios firmados, hashes publicados ni trazabilidad de build más allá de una cadena alfanumérica (`632D1657A5`) sin valor probatorio.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un LLM; los idiomas listados son etiquetas de metadatos del repositorio.
- El artefacto distribuido se presenta como un ejecutable de Windows x64 "portable" con módulos de trampa para Naraka: Bladepoint, sin verificación independiente.

## Casos de uso

- Ninguno recomendado. El artefacto no es un modelo de IA y su ejecución conlleva riesgos de seguridad no evaluados.
- Auditoría de seguridad y threat intelligence: analizar en un entorno aislado (sandbox, máquina virtual sin red) el patrón de distribución de repositorios que suplantan model cards para entregar ejecutables.
- Formación en higiene de cadena de suministro: usar este caso como ejemplo de discrepancias entre nombre del repositorio, nombre del binario, cuentas de GitHub emisoras y contraseñas de extracción.
- Estudio de moderación de plataformas: documentar cómo los metadatos de Hugging Face (tags, licencia MIT, lista de idiomas) pueden reutilizarse para dar apariencia legítima a contenido ajeno al ecosistema de modelos.
- Investigación de fraude en videojuegos: recopilar evidencia sobre la venta o distribución de trampas en títulos multijugador y sus implicaciones en los términos de servicio.
- Concienciación de usuarios finales: ilustrar por qué no debe ejecutarse como administrador un binario descargado de un repositorio de modelos sin firma ni reproducible build.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (350 Hz de sondeo, <19 ms de respuesta, 98,8 % de consistencia, <37 MB de RAM) son afirmaciones del autor sin metodología, sin entorno de prueba ni verificación independiente, y no corresponden a ninguna métrica de modelo de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que inferir).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.
- Requisito declarado del artefacto: Windows x64 (Windows 11 mencionado en los tags), ejecución como administrador y extracción previa de un ZIP protegido con contraseña.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos" comparable porque el repositorio no contiene un modelo de IA. Frente a repositorios legítimos de modelos open source, las diferencias relevantes son:

| Criterio | Este repositorio | Repositorio legítimo de modelo |
|---|---|---|
| Artefacto principal | ZIP con `.exe` de 4,8 MB | Pesos en safetensors/GGUF + tokenizador + config |
| Pipeline declarado | no disponible | text-generation, image-text-to-text, etc. |
| Trazabilidad | enlaces a GitHub de terceros, contraseña de extracción | hashes, commits, model card con metodología |
| Verificabilidad | nula | benchmarks reproducibles, eval pública |
| Licencia | MIT declarada sobre un binario sin fuente | licencia con términos claros sobre pesos |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal en contextos de investigación o producción.
- Discrepancia de nombres: el repositorio se llama `naraka-bladepoint-cheat-trainer` pero el binario y el ZIP hacen referencia a *Kingdom Come: Deliverance 2*, lo que sugiere reutilización de plantillas o suplantación.
- Enlaces de descarga alojados en cuentas de GitHub (`ErikMercier70637`, `Isha4274`) distintas del autor del repositorio en Hugging Face.
- Contraseña de extracción (`2026`) y petición de ejecución como administrador: prácticas que dificultan el análisis automático y elevan el impacto de cualquier carga maliciosa.
- Riesgo elevado de malware: un ejecutable sin firma, sin código fuente y sin reproducible build no permite verificar su comportamiento; debe asumirse compromiso si se ejecuta fuera de un sandbox.
- Uso contra los términos de servicio: las trampas en juegos multijugador como Naraka: Bladepoint violan habitualmente los ToS y pueden conllevar el baneo de cuentas.
- La licencia MIT declarada se aplica, en su caso, al contenido del repositorio; no otorga garantías sobre el binario distribuido ni sobre su legalidad en la jurisdicción del usuario.
- Los idiomas listados son etiquetas de metadatos y no implican soporte lingüístico real de ningún sistema.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso legítimo ni de revisión por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/felnotas/naraka-bladepoint-cheat-trainer
- Enlace de descarga citado en la model card (GitHub Releases, cuenta de terceros): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Enlace de releases citado en la model card (GitHub, cuenta de terceros): https://github.com/Isha4274/naraka-bladepoint-cheat-trainer/releases/latest
- Paper, blog o demo oficial: no disponible.
