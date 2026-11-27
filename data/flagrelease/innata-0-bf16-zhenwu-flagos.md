# FlagRelease/Innata-0-BF16-zhenwu-FlagOS

## Resumen

Innata-0 es un sistema de mundo encarnado (embodied world system) desarrollado por BAAI (Beijing Academy of Artificial Intelligence) y distribuido en el ecosistema FlagOS. El repositorio `FlagRelease/Innata-0-BF16-zhenwu-FlagOS` contiene una adaptación cruzada de chips (cross-chip adaptation) del modelo, orientada a su ejecución sobre seis plataformas de aceleración distintas: NVIDIA, MetaX, Hygon, Ascend, Moore Threads y T-Head. No es un modelo de lenguaje convencional, sino una familia de checkpoints especializados en comprensión visual, predicción de vídeo condicionada por acciones y generación de acciones robóticas.

El sistema se articula en torno a dos componentes: **Innata-0-WAM** (World-Action Model), que emplea una arquitectura Mixture-of-Transformers de tres torres para modelar conjuntamente la comprensión del mundo, la predicción visual y la generación de acciones y táctil; e **Innata-0-Agent**, una capa de agente responsable de la planificación de tareas, validación de ejecución, recuperación de errores y acumulación de experiencia reutilizable. La combinación de ambos eleva la tasa de éxito en el benchmark RoboCasa365 del 60,2 % al 65,4 % en tareas generales, y del 32,4 % al 43,6 % en tareas composicionales no vistas.

La relevancia del lanzamiento reside en su enfoque de despliegue multi-chip: el mismo checkpoint se ejecuta sobre hardware muy heterogéneo mediante el stack FlagOS, lo que reduce la dependencia de un único proveedor de aceleradores. El repositorio ocupa 113,8 GB y se distribuye en formato safetensors con cuantización BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers de tres torres (Innata-0-WAM): comprensión, predicción visual, acción/táctil |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (según nombre del repo); no se detallan otras |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0-and-openmdw-1.1 |
| Formato de pesos | safetensors; VAE externo en `.pth` (Wan2.2_VAE.pth) |
| Tamano del repositorio | 113,8 GB |
| Checkpoints incluidos | Innata-0-Understanding, Innata-0-ACWM, Innata-0-WAM-RoboDojo, Innata-0-WAM-RoboCasa365 |
| Plataformas soportadas | NVIDIA, MetaX, Hygon, Ascend, Moore Threads, T-Head |

## Arquitectura y entrenamiento

Innata-0-WAM se construye sobre una arquitectura Mixture-of-Transformers con tres torres diferenciadas que comparten un espacio latente: una torre de comprensión del mundo (procesamiento de imagen y vídeo para question answering), una torre de predicción visual (generación de vídeo condicionada por acciones, apoyada en el VAE de Wan2.2) y una torre de generación de acciones y señales táctiles. Esta separación permite especializar cada subred sin renunciar a la coherencia multimodal del sistema completo.

El sistema se complementa con Innata-0-Agent, una capa de orquestación que aporta planificación, validación de ejecución y recuperación ante errores, además de acumular experiencia reutilizable entre episodios. Los checkpoints publicados cubren tareas concretas: Understanding (VQA sobre imagen y vídeo), ACWM (predicción de vídeo condicionada por acciones), WAM-RoboDojo (predicción de acciones Joint14) y WAM-RoboCasa365 (predicción de acciones Control12). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación destacable es la adaptación Day0 cross-chip mediante el stack FlagOS, que permite ejecutar los mismos pesos sobre seis familias de aceleradores con un contenedor Docker unificado (`harbor.baai.ac.cn/flagrelease-public/innata-ppu:20261127-rc3`) y verificación de integridad mediante sumas SHA256.

## Capacidades

- Comprensión de imagen y vídeo mediante el checkpoint Innata-0-Understanding (question answering visual y temporal).
- Predicción de vídeo condicionada por acciones (ACWM), apoyada en el VAE de Wan2.2-TI2V-5B.
- Generación de acciones robóticas en dos espacios: Joint14 (RoboDojo) y Control12 (RoboCasa365).
- Modelado conjunto de señales táctiles junto con acciones motoras.
- Planificación de tareas de varios pasos mediante la capa Innata-0-Agent.
- Validación de ejecución y recuperación de errores durante el despliegue robótico.
- Acumulación de experiencia reutilizable entre episodios.
- Soporte bilingüe en inglés y chino.
- Despliegue multi-chip con un único stack de software (FlagOS).

## Casos de uso

- **Investigación en robótica de manipulación**: uso de Innata-0-WAM-RoboCasa365 para predecir acciones Control12 en entornos simulados de cocina doméstica, evaluando políticas de control antes de transferirlas a hardware real.
- **Benchmarking de políticas encarnadas**: ejecución de Innata-0-WAM-RoboDojo sobre RoboDojo para comparar el rendimiento de distintas políticas de acción Joint14 bajo condiciones controladas.
- **Generación de datos sintéticos de vídeo**: el checkpoint ACWM permite predecir la evolución visual de una escena dada una secuencia de acciones, útil para aumentar datasets de entrenamiento robótico sin coste de captura real.
- **Sistemas de percepción para agentes autónomos**: Innata-0-Understanding responde preguntas sobre imagen y vídeo, lo que sirve como módulo de percepción en pipelines de agentes que necesitan razonar sobre su entorno.
- **Validación multi-hardware de modelos encarnados**: el stack FlagOS permite desplegar el mismo checkpoint sobre NVIDIA, Ascend, Hygon, MetaX, Moore Threads y T-Head, facilitando la evaluación comparativa de eficiencia de inferencia entre plataformas.
- **Recuperación de errores en tareas de larga duración**: la capa Innata-0-Agent valida cada paso de ejecución y activa rutinas de recuperación, lo que resulta adecuado para misiones robóticas donde un fallo parcial no debe abortar el episodio completo.
- **Prototipado de sistemas de mundo para simulación**: investigadores que necesiten un modelo que combine comprensión, predicción visual y acción en un único pipeline pueden usar los cuatro checkpoints como base para experimentos de world modeling.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al benchmark RoboCasa365, comparando el modelo base WAM con y sin la pila de agente completa:

| Configuracion | Tasa de exito (tareas generales) | Tasa de exito (tareas composicionales no vistas) |
|---|---|---|
| Innata-0-WAM (base) | 60,2 % | 32,4 % |
| Innata-0-WAM + Innata-0-Agent | 65,4 % | 43,6 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje en la información disponible.

## Requisitos de hardware

- **Aceleradores soportados**: NVIDIA, MetaX, Hygon, Ascend, Moore Threads y T-Head PPU (seis plataformas verificadas).
- **Host de referencia documentado**: T-Head PPU con driver de host y `ppu-smi` disponible.
- **Contenedor**: Docker con acceso al repositorio Harbor; imagen `harbor.baai.ac.cn/flagrelease-public/innata-ppu:20261127-rc3`.
- **Dispositivos por proceso**: un PPU asignado por proceso de inferencia (`CUDA_VISIBLE_DEVICES`).
- **Almacenamiento**: los pesos, el VAE de Wan2.2, los JSON de petición y los directorios de salida deben montarse bajo `/mnt`; el repositorio ocupa 113,8 GB.
- **VRAM estimada**: no disponible en la información proporcionada.
- **Compatibilidad con GPU de consumo**: no disponible; el despliegue documentado se centra en aceleradores de centro de datos y PPU.
- **Opciones de despliegue**: contenedor FlagOS con runtime Innata; los checkpoints Understanding y ACWM se ejecutan por línea de comandos, mientras que RoboDojo y RoboCasa365 levantan un servicio local y llaman a `/generate`.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Despliegue multi-chip |
|---|---|---|---|---|---|
| Innata-0 (BAAI) | World-Action Model + agente | no disponible | no disponible | apache-2.0-and-openmdw-1.1 | Si (6 plataformas) |
| Wan2.2-TI2V-5B (Wan-AI) | Generacion de video texto-imagen | 5B (VAE reutilizado por Innata-0) | no disponible | no disponible en esta ficha | no disponible |
| Alternativas de world models roboticos | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible no permite establecer una comparativa cuantitativa con modelos de la misma categoria; los unicos datos de referencia son los del propio benchmark RoboCasa365.

## Limitaciones y advertencias

- **Licencia compuesta**: la licencia `apache-2.0-and-openmdw-1.1` combina Apache 2.0 con OpenMDW 1.1; es necesario revisar los terminos de OpenMDW antes de un uso comercial, ya que puede imponer restricciones adicionales.
- **Alcance limitado a dominios encarnados**: los checkpoints estan especializados en comprension visual, prediccion de video y generacion de acciones roboticas; no son modelos de lenguaje generalistas.
- **Idiomas**: solo ingles y chino; no hay soporte documentado de castellano ni de otras lenguas.
- **Dependencia de hardware especifico**: el flujo documentado requiere PPU de T-Head y la imagen FlagOS; el despliegue en otras plataformas, aunque anunciado, no detalla procedimientos equivalentes en la informacion disponible.
- **Dependencia del VAE externo**: ACWM y los checkpoints WAM requieren `Wan2.2_VAE.pth` de Wan-AI, lo que anade una dependencia de terceros y un paso extra de verificacion de integridad.
- **Riesgo de alucinacion visual**: al tratarse de un modelo generativo de video y comprension, puede producir predicciones visuales plausibles pero incorrectas; en entornos roboticos esto exige validacion externa antes de actuar.
- **Sesgos**: no se documentan sesgos conocidos en la informacion proporcionada.
- **Madurez**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion son muy recientes, lo que sugiere una validacion comunitaria aun escasa.
- **Ausencia de datos de entrenamiento**: no se especifican tokens, composicion del dataset ni proceso de alineacion, lo que dificulta evaluar la robustez fuera de los benchmarks publicados.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/FlagRelease/Innata-0-BF16-zhenwu-FlagOS)
- [Proyecto Innata-0](https://baai-eai.github.io/innata-0/)
- [Checkpoint Innata-0-Understanding](https://huggingface.co/BAAI/Innata-0-Understanding/commit/fcec27ecee6ab4577869b2446a04c0365e8eddb0)
- [VAE de Wan2.2](https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B/blob/a6c3aa7fd09ab8990843d8c3fbb401cd9bce462c/Wan2.2_VAE.pth)
- [Repositorio Harbor de FlagOS](https://harbor.baai.ac.cn/flagrelease-public/innata-ppu:20261127-rc3)
