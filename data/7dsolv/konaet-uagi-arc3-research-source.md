# 7dsolv/Konaet-UAGI-ARC3-Research-Source

## Resumen

Konaet UAGI ARC-AGI-3 research source es un repositorio de código fuente publicado por el usuario 7dsolv (Adilson Oliveira) en HuggingFace, no una ficha de pesos de un modelo. El propio autor indica que el repositorio contiene un agente local reproducible, herramientas de investigación tipo teacher/student, pruebas, licencia y resultados medidos, y que **no incluye archivos de juego, secuencias de acciones del teacher, checkpoints de rutas aprendidas, pesos de modelo ni credenciales**. El SDK y los datos de juego deben obtenerse de sus fuentes originales bajo sus propios términos.

El interés del repositorio es metodológico más que de rendimiento: publica una validación que separa memoria de rutas previamente demostradas frente a descubrimiento de partidas no vistas. Los resultados declarados el 24 de septiembre de 2026 son 25/25 victorias locales al recargar una memoria de rutas informada por teacher específica del juego, 0/25 para un agente nuevo sin teacher ni rutas guardadas con 250 acciones, y 0/25 para un cuaderno neuronal separado de Kaggle RTX V35. El autor explicita que el 25/25 demuestra memoria de juegos públicos ya demostrados y **no** resolución de juegos no vistos, con puntuación oficial de competición NOT_RUN.

Al no publicarse pesos, no existen parámetros, contexto, cuantizaciones ni formatos de tensor que evaluar. Cualquier ficha comparativa debe tratar este repositorio como artefacto de investigación y código fuente, y acudir a la documentación del SDK de ARC-AGI-3 para las capacidades reales del agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no publica arquitectura de modelo; describe un agente local y herramientas teacher/student) |
| Parametros totales | no disponible (no se publican pesos) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no hay pesos en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Konaet RCL 1.0 (`license_name: konaet-rcl-1.0`, `license: other`); dependencias de terceros bajo sus propias licencias |
| Formato de pesos | no disponible (el repositorio declara no contener pesos de modelo, checkpoints de rutas aprendidas ni credenciales) |
| Tipo de repositorio | código fuente y material de investigación (tags: `arc-agi-3`, `research`, `source-code`) |
| Autor | 7dsolv (Adilson Oliveira) |
| Fecha de creacion | 2026-09-24T22:28:38Z |
| Ultima actualizacion | 2026-09-24T22:28:56Z |
| Descargas | 0 |
| Likes | 0 |
| Region declarada | `region:us` |
| Puntuacion oficial de competicion | NOT_RUN (segun el autor) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo subyacente: el repositorio declara explícitamente no contener pesos, checkpoints de rutas aprendidas ni secuencias de acciones del teacher. Lo que sí se documenta es la organización del sistema de investigación: un agente local reproducible, herramientas de tipo teacher/student, pruebas automatizadas, licencia y un manifiesto de fuentes (`SOURCE_MANIFEST.json`) junto con un protocolo de validación (`VALIDATION_SOURCE_MEMORY_VS_DISCOVERY_2026-09-24.md`).

El entrenamiento y la evaluación se describen en términos de comportamiento medido, no de tokens ni de dataset. La tabla publicada distingue tres configuraciones: memoria de rutas informada por teacher específica del juego recargada (25/25 victorias locales), agente nuevo sin teacher ni rutas guardadas con un presupuesto de 250 acciones (0/25) y un cuaderno neuronal separado de Kaggle RTX V35 (0/25). No se detalla el mecanismo de aprendizaje, el volumen de datos ni si hubo RLHF, DPO o algún otro proceso de ajuste.

## Capacidades

- Ejecución de un agente local reproducible sobre el entorno ARC-AGI-3, siempre que el SDK y los datos de juego se obtengan de sus fuentes originales.
- Recarga de memoria de rutas informada por teacher específica del juego: 25/25 victorias locales en la evaluación declarada.
- Ejecución de un agente sin teacher ni rutas guardadas con un presupuesto de 250 acciones, con resultado declarado de 0/25.
- Herramientas de investigación teacher/student incluidas en el repositorio.
- Conjunto de pruebas y manifiesto de fuentes para reproducibilidad.
- Generación de texto, razonamiento general, código, matemáticas, visión, tool calling, capacidades de agente multi-paso y multilingüismo: no disponible (no se documentan capacidades de modelo en la información proporcionada).

## Casos de uso

- Reproducción de experimentos en ARC-AGI-3: el repositorio incluye pruebas y un manifiesto de fuentes que permiten reconstruir el entorno de evaluación sin depender de artefactos opacos.
- Auditoría metodológica de resultados: la separación explícita entre memoria de rutas y descubrimiento de juegos no vistos permite revisar si una métrica de 25/25 refleja generalización o recuerdo de partidas públicas ya demostradas.
- Estudio de esquemas teacher/student: las herramientas publicadas sirven para analizar cómo se transfiere información de un docente a un estudiante en tareas de planificación secuencial.
- Base para investigación en agentes sobre entornos interactivos: el agente local reproducible puede adaptarse a otros entornos con API similar al SDK de ARC-AGI-3.
- Diseño de protocolos de validación de memoria frente a descubrimiento: el documento de validación incluido es un punto de partida para definir controles negativos (agente nuevo, presupuesto de acciones limitado).
- Preparación de envíos a competición: aunque la puntuación oficial declarada es NOT_RUN, la infraestructura local puede usarse para prevalidar configuraciones antes de un envío oficial.
- Docencia y divulgación sobre limitaciones de los benchmarks de agentes: los resultados 25/25 frente a 0/25 son un ejemplo didáctico de contaminación de rutas y de métricas engañosas.

## Benchmarks y rendimiento

Los únicos datos publicados son las victorias locales del autor, medidos el 24 de septiembre de 2026:

| Evaluacion | Victorias locales |
|---|---:|
| Memoria de rutas recargada, informada por teacher y especifica del juego | 25/25 |
| Agente nuevo sin teacher ni rutas guardadas, 250 acciones | 0/25 |
| Cuaderno neuronal separado de Kaggle RTX V35 | 0/25 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica que la puntuación oficial de competición es NOT_RUN y que el 25/25 no demuestra resolución de juegos no vistos.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Al no publicarse pesos de modelo, no es posible estimar requisitos de memoria de GPU para inferencia.
- GPU recomendadas: no disponible. El autor menciona la ejecución de un cuaderno neuronal separado en Kaggle sobre RTX V35, sin especificar el modelo de GPU ni sus recursos.
- Encaje en GPU de consumo: no determinable con la información disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI u otros servidores de inferencia. El repositorio describe un agente local y herramientas de investigación que dependen del SDK de ARC-AGI-3 obtenido de su fuente original.
- Latencia y throughput: no disponible.
- Requisito operativo conocido: obtener el SDK y los datos de juego de sus fuentes originales bajo sus propios términos, ya que el repositorio no los redistribuye.

## Comparativa con modelos similares

Este repositorio no es un modelo con pesos y no admite una comparación convencional de parámetros, contexto o rendimiento. Se listan los elementos de referencia citados en la información disponible:

| Elemento | Tipo | Parametros | Contexto | Resultado declarado | Licencia |
|---|---|---|---|---|---|
| 7dsolv/Konaet-UAGI-ARC3-Research-Source | Repositorio de código fuente e investigación | no aplica | no aplica | 25/25 con memoria de rutas; 0/25 sin teacher; NOT_RUN en competición oficial | Konaet RCL 1.0 |
| Cuaderno neuronal de Kaggle RTX V35 | Cuaderno neuronal citado por el autor | no disponible | no disponible | 0/25 | no disponible |
| 7dsolv/Konaet-Core-v0 | Otro repositorio del mismo autor en HuggingFace | no disponible | no disponible | no disponible | no disponible |

Comparativa frente a modelos o agentes de ARC-AGI-3 de terceros: no disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo: el repositorio no contiene pesos, checkpoints ni credenciales, por lo que no puede desplegarse como modelo de inferencia.
- Resultado principal no generalizable: el autor afirma que el 25/25 demuestra memoria de juegos públicos previamente demostrados y no resolución de juegos no vistos.
- Puntuación oficial NOT_RUN: no existe validación en la competición oficial según la información publicada.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no evaluable, al no publicarse un modelo de lenguaje ni resultados de generación.
- Limitaciones de contexto o idioma: no disponible.
- Licencia restrictiva: Konaet RCL 1.0 (`license: other`). Antes de cualquier uso comercial es imprescindible revisar el archivo LICENSE del repositorio; las dependencias de terceros conservan sus propias licencias, detalladas en `THIRD_PARTY_NOTICES.md`.
- Dependencia externa: el SDK y los datos de juego deben obtenerse de sus fuentes originales bajo sus propios términos, lo que condiciona la reproducibilidad completa del entorno.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, con creación y última actualización en la misma fecha, lo que indica un artefacto recién publicado y sin validación independiente.
- Caveat para producción: no debe presentarse como solución de ARC-AGI-3 ni como modelo de propósito general; su uso razonable es la investigación y la auditoría metodológica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/7dsolv/Konaet-UAGI-ARC3-Research-Source
- Perfil del autor en HuggingFace: https://huggingface.co/7dsolv
- Otro repositorio del autor, Konaet-Core-v0: https://huggingface.co/7dsolv/Konaet-Core-v0
- Perfil de GitHub del autor: https://github.com/7dsolv/7dsolv
- Publicaciones del autor en GitHub: https://github.com/7dsolv/7dsolv/tree/main/publications
- Archivo de licencia del repositorio (ruta relativa en el repositorio): LICENSE
- Protocolo y evidencia de validación (ruta relativa en el repositorio): VALIDATION_SOURCE_MEMORY_VS_DISCOVERY_2026-09-24.md
- Manifiesto de fuentes (ruta relativa en el repositorio): SOURCE_MANIFEST.json
- Avisos de licencias de terceros (ruta relativa en el repositorio): THIRD_PARTY_NOTICES.md
