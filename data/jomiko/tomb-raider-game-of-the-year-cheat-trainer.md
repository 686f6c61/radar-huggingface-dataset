# jomiko/tomb-raider-game-of-the-year-cheat-trainer

## Resumen

`jomiko/tomb-raider-game-of-the-year-cheat-trainer` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face que, pese a la nomenclatura y las etiquetas propias de la plataforma (`license:mit`, listado de idiomas, `region:us`), distribuye en realidad un supuesto ejecutable para Windows x64 descrito como *trainer* o *cheat* del videojuego *Tomb Raider: Game of the Year Edition*. No existe ningún artefacto de pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociado.

La model card del autor no contiene información técnica sobre un modelo de lenguaje: es una página de descarga con insignias, instrucciones de instalación de un archivo ZIP protegido con contraseña (`2026`), un ejecutable denominado `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe` y referencias cruzadas a otros repositorios de GitHub de terceros. El contenido mezcla el nombre de dos juegos distintos (*Tomb Raider* y *Kingdom Come: Deliverance 2*) y emplea lenguaje promocional típico de campañas de distribución de software potencialmente no deseado.

Por todo ello, esta ficha se redacta como evaluación técnica del repositorio, no como ficha de un modelo. Cualquier dato relativo a arquitectura, parámetros, contexto, entrenamiento o benchmarks debe considerarse **no disponible** porque no existe tal modelo. Se recomienda precaución máxima: los patrones observados (ZIP con contraseña, ejecutable que requiere privilegios de administrador, supuesta exclusión de capturas de pantalla, enlaces a repositorios ajenos al autor declarado) son coherentes con campañas de malware o *scam* distribuidas a través de plataformas de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo; sin relación con capacidades de un modelo) |
| Licencia | mit (declarada en los metadatos) |
| Formato de pesos | no disponible (el repo distribuye un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio declara etiquetas `windows`, `windows-11`, `x64`, `portable` y el nombre del supuesto *trainer*, y su contenido principal es un archivo comprimido de 4,8 MB alojado en un *release* de GitHub ajeno al autor del repositorio (`ErikMercier70637/kingdom-come-deliverance-2-trainer-2026`). La model card menciona módulos como "user-mode external core", "bezier input smoothing", "2D radar & loot filter" o "hot-swap JSON profiles", con métricas inventadas (99,1 % de consistencia, 372 Hz de sondeo, < 11 ms de respuesta) que no son verificables ni corresponden a ningún artefacto medible.

El propio texto reconoce que el binario es una aplicación independiente de tipo *game cheat* y justifica las alertas de Windows Defender/SmartScreen como falsos positivos heurísticos. No hay dataset, no hay tokens de entrenamiento, no hay RLHF, DPO ni ninguna innovación técnica documentada. El repositorio se creó y actualizó el 2026-11-24 con un segundo de diferencia entre ambos eventos, lo que sugiere una publicación automatizada.

## Capacidades

- No ofrece generación de texto, razonamiento, código, matemáticas ni visión: no es un modelo.
- No soporta *tool calling* ni *function calling* en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; el listado de idiomas es metadato de plataforma.
- El binario descrito afirma incluir supuestos *cheats* para un videojuego (radar 2D, filtro de objetos, suavizado de entrada), funcionalidad no verificable y sin relación con IA.
- No incluye *thinking mode*, audio ni ninguna modalidad de modelo fundacional.

## Casos de uso

- **Ninguno legítimo como modelo de IA**: no se puede desplegar en vLLM, TGI, llama.cpp ni Ollama porque no hay pesos.
- **Auditoría de seguridad**: analizar el ZIP y el ejecutable en un entorno aislado (*sandbox*) para determinar si el binario es malware, *dropper* o *stealer* antes de que terceros lo ejecuten.
- **Investigación de campañas de abuso en Hugging Face**: documentar el patrón de repositorios que se hacen pasar por modelos para distribuir ejecutables con contraseña y enlaces externos.
- **Formación en higiene de cadena de suministro**: usar el caso como ejemplo de por qué no se deben ejecutar binarios descargados de repositorios de modelos sin firma ni verificación de *hash*.
- **Moderación de plataforma**: alimentar las heurísticas de detección de contenido malicioso en *hubs* de modelos (etiquetas de modelo ausentes, binarios en releases externos, contraseñas en el README).
- **Respuesta a incidentes**: si un usuario ya ejecutó el `.exe` como administrador, emplear el repositorio como evidencia para el análisis forense del equipo afectado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (99,1 %, 98,2 %, 372 Hz, < 11 ms) son afirmaciones publicitarias sin metodología ni artefacto medible, por lo que no se recogen como resultados.

## Requisitos de hardware

- No aplica VRAM ni GPU: no hay modelo que inferir.
- El supuesto binario requiere Windows 10 u 11 de 64 bits y ejecución como administrador según las instrucciones del autor.
- Tamaño declarado del paquete: 4,8 MB (ZIP), lo que descarta que contenga pesos de un modelo.
- No hay soporte para vLLM, llama.cpp, Ollama, TGI ni ningún *runtime* de inferencia.
- Latencia y *throughput*: no disponibles (no hay inferencia que medir).

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el repositorio no contiene un modelo. A modo de contraste meramente estructural, se puede comparar con otros repositorios de Hugging Face que sí alojan artefactos de IA:

| Repositorio | Tipo de artefacto | Pesos | Pipeline | Riesgo |
|---|---|---|---|---|
| `jomiko/tomb-raider-game-of-the-year-cheat-trainer` | ZIP con `.exe` de Windows | No | No disponible | Alto (binario opaco, contraseña, admin) |
| Modelo de pesos abiertos típico (safetensors + config) | Pesos + tokenizador | Sí | Definido | Bajo/medio según licencia |
| Repositorio de *dataset* | Datos (parquet/jsonl) | No aplica | No aplica | Bajo |

## Limitaciones y advertencias

- **No es un modelo de IA**: no debe evaluarse, desplegarse ni citarse como tal en contextos de investigación o producción.
- **Riesgo de seguridad elevado**: distribución de un ejecutable opaco, protegido con contraseña, que pide privilegios de administrador y afirma excluirse de la captura de pantalla (comportamiento típico de *malware* que evita detección visual).
- **Inconsistencia de identidad**: el nombre del repositorio alude a *Tomb Raider* mientras el binario y los enlaces apuntan a *Kingdom Come: Deliverance 2* y a repositorios de GitHub de usuarios distintos al autor declarado.
- **Métricas no verificables**: las cifras de consistencia, frecuencia y latencia carecen de metodología y de artefacto al que aplicarse.
- **Licencia MIT declarada pero inaplicable**: no hay código fuente ni pesos sobre los que ejercer los derechos; la licencia no cubre el binario de terceros descargado desde un *release* externo.
- **Alucinación y sesgos**: no aplica al no haber modelo; sí aplica el riesgo de que un lector interprete la model card como descripción fiable de software legítimo.
- **Uso comercial**: desaconsejado por completo; además, los *cheats* de videojuegos pueden infringir los términos de servicio del juego y la legislación de propiedad intelectual en varias jurisdicciones.
- **Recomendación**: no descargar ni ejecutar el ZIP; reportar el repositorio a Hugging Face si se confirma la distribución de software malicioso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jomiko/tomb-raider-game-of-the-year-cheat-trainer
- Release externo citado en la model card (no verificado, no recomendado): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado como alternativo (no verificado): https://github.com/pmalik108/tomb-raider-game-of-the-year-cheat-trainer/releases/latest
- Paper, blog, demo o documentación técnica: no disponible.
