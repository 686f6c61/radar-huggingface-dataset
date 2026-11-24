# CaptainBinge/serotonin-executor

## Resumen

El artefacto publicado bajo el identificador `CaptainBinge/serotonin-executor` en Hugging Face no es un modelo de inteligencia artificial, sino un ejecutor de scripts para Roblox empaquetado como binario de Windows. La model card describe un programa portable (`serotonin-executor-v1.2.0-win64.exe`, compilación `v2.5.7`) distribuido en un archivo ZIP de 8,9 MB alojado en un repositorio de GitHub de terceros, con instrucciones para ejecutarlo como administrador en Windows 10 (22H2) y Windows 11 (24H2). No contiene pesos, tokenizador, configuración de arquitectura ni ningún componente vinculado a inferencia de redes neuronales.

El repositorio emplea las etiquetas y metadatos propios de un modelo (licencia MIT, lista de idiomas, pipeline) de forma engañosa: la lista de idiomas y las referencias a compatibilidad con Luau, `hookmetamethod`, `getgc` y la Drawing API corresponden a la API de scripts de Roblox, no a capacidades lingüísticas. El binario se entrega con contraseña de descompresión (`2026`) y el propio autor reconoce que los antivirus y SmartScreen generan alertas heurísticas, lo que constituye una señal de riesgo clásica en la distribución de software no firmado.

Por tanto, esta ficha no puede documentar especificaciones técnicas de un modelo porque no existen. Todos los campos relativos a arquitectura, parámetros, contexto, cuantización, entrenamiento, capacidades, benchmarks y requisitos de hardware se marcan como no disponibles o no aplicables, y se advierte explícitamente de que la descarga y ejecución del binario con privilegios de administrador no es recomendable en ningún entorno de desarrollo o investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutor de scripts para Roblox) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la lista de idiomas de la model card corresponde a metadatos del repositorio, no a capacidades del artefacto) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. El contenido descrito en la model card es un ejecutor de scripts para el cliente de Roblox: un binario x64 para Windows que, según el autor, realiza adjunción a procesos (`instant client attach`), inyección de scripts Luau, sincronización de offsets tras parches del cliente y compatibilidad con la API `sUNC` (incluyendo `hookmetamethod`, `getgc` y Drawing API). No se documenta ningún corpus de entrenamiento, número de tokens, etapa de RLHF/DPO ni innovación en atención o decodificación, porque no aplica.

La publicación en Hugging Face utiliza el esquema de metadatos de modelos (tags de idioma, licencia, pipeline) sin contener ningún artefacto de modelo. Esta práctica se observa en campañas de distribución de software potencialmente no deseado que aprovechan la confianza y el posicionamiento de la plataforma.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües pese a la lista de idiomas declarada en los metadatos.
- El único comportamiento descrito es la inyección y ejecución de scripts Luau en el cliente de Roblox, con adjunción a procesos y sincronización de offsets.

## Casos de uso

- No se identifican casos de uso legítimos para un equipo de desarrollo o investigación de IA. El artefacto no resuelve ninguna tarea de procesamiento de lenguaje, visión, código o datos.
- Auditoría de seguridad: analizar el binario en un entorno aislado y sin red para documentar indicadores de compromiso, sin ejecutarlo en máquinas de trabajo.
- Estudio de campañas de abuso de plataformas: revisar cómo se reutilizan los metadatos de Hugging Face para distribuir ejecutables ajenos al ecosistema de modelos.
- Formación en seguridad: usar la model card como ejemplo de señales de alarma (contraseña de descompresión, binario no firmado, alertas de SmartScreen justificadas por el autor).
- No se recomienda su uso en producción, en pipelines de CI/CD ni en entornos con acceso a credenciales.
- No se recomienda su uso para automatización de atención al cliente, generación de código, análisis de datos ni ninguna tarea de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas equivalentes, y las cifras que aparecen en la model card (por ejemplo, `< 7 ms` de adjunción o `99,1%` de consistencia) son afirmaciones del autor sobre el ejecutor, no mediciones reproducibles de un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado por el autor: Windows 10 (22H2) y Windows 11 (24H2) sobre x64 (Intel y AMD).
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles como métricas verificables; las cifras de la model card no son auditables.

## Comparativa con modelos similares

| Modelo | Tipo de artefacto | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CaptainBinge/serotonin-executor | Ejecutor de scripts para Roblox (binario Windows) | no disponible | no disponible | MIT declarada | Hugging Face, GitHub de terceros |
| Modelo de lenguaje open source de tamaño pequeño (categoría genérica) | Pesos de transformer | no disponible en esta ficha | no disponible en esta ficha | variable | Hugging Face |
| Modelo de lenguaje open source de tamaño medio (categoría genérica) | Pesos de transformer | no disponible en esta ficha | no disponible en esta ficha | variable | Hugging Face |

No existe una comparativa técnica significativa posible: el artefacto no pertenece a la categoría de modelos de lenguaje y no se dispone de datos verificables de alternativas dentro de su propia categoría (ejecutores de Roblox) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no procesa lenguaje natural.
- Los metadatos de idioma, licencia y pipeline son engañosos y no describen capacidades reales del artefacto.
- El binario se distribuye comprimido con contraseña (`2026`), una práctica que dificulta el análisis automático por parte de antivirus y servicios de análisis.
- El autor reconoce que Windows Defender y SmartScreen generan alertas; solicita ejecutar como administrador y añadir exclusiones, lo que agrava el riesgo.
- La descarga se aloja en un repositorio de GitHub de un tercero (`Enrico339/serotonin-executor`), no en el repositorio de Hugging Face, lo que impide verificar la integridad del binario.
- La ejecución como administrador concede privilegios elevados a un binario no firmado y de origen no verificado.
- No se debe usar en entornos de producción, con credenciales de acceso ni en máquinas que contengan datos sensibles.
- Riesgo de alucinación: no aplica; el riesgo relevante es de seguridad (malware, robo de credenciales, persistencia).
- Restricciones de licencia: la licencia MIT declarada no cubre el uso del cliente de Roblox, que se rige por sus propios términos de servicio; la inyección de scripts puede vulnerarlos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CaptainBinge/serotonin-executor
- Repositorio de GitHub citado por el autor: https://github.com/Enrico339/serotonin-executor
- Descarga directa citada en la model card: https://github.com/Enrico339/serotonin-executor/releases/latest/download/serotonin-executor-v1.2.0-win64.zip
- Página de releases citada en la model card: https://github.com/Enrico339/serotonin-executor/releases/latest
- Paper, blog o demo: no disponibles.
