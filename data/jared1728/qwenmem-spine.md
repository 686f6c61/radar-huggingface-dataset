# Jared1728/qwenmem-spine

## Resumen

qwenmem-spine es un derivado experimental del modelo Qwen3.5-4B desarrollado por Jared1728 (Jaredcastorena) que incorpora cinco capas compiladas de "navegacion triangular" para integrarse con un runtime propio escrito en Rust denominado Spine. No se trata de un ajuste fino convencional: el autor indica explicitamente que el modelo fue compilado, no entrenado sobre las preguntas de evaluacion, y que requiere el runtime personalizado correspondiente para funcionar. El checkpoint medido contiene 496 tensores distribuidos en diez shards, con 5.248.077.504 parametros totales y un tamano de repositorio de 10,5 GB.

La arquitectura parte de Qwen3.5-4B y le antepone cinco capas BF16 compiladas, ademas de ensanchar el flujo residual del lenguaje de 2.560 a 2.816 dimensiones. El objetivo declarado es servir como componente de navegacion de memoria dentro de un sistema mayor de gestion de contexto, donde el modelo ejecuta comandos de navegacion sobre una topologia instalada en tensores recurrentes. Es un artefacto de investigacion fijo y sin mantenimiento, pensado para reproduccion experimental y no para despliegue en produccion.

Su relevancia actual es acotada pero interesante para quienes investigan arquitecturas de memoria externa y control de contexto: propone separar el almacenamiento de la evidencia (que queda en el "corazon" cifrado de Spine, gestionado por Rust) de la ejecucion de rutas semanticas dentro del propio modelo. La licencia Apache-2.0 permite reutilizacion comercial de los pesos, aunque el codigo nuevo se distribuye bajo MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B con cinco capas compiladas de navegacion triangular antepuestas |
| Parametros totales | 5.248.077.504 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens exactos de prompt y 2.048 tokens de salida por ronda (limites del harness nativo) |
| Tipos de cuantizacion | no disponible (el checkpoint medido es BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos); codigo nuevo MIT; Rust Spine MIT OR Apache-2.0 |
| Formato de pesos | safetensors (diez shards, 496 tensores) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo texto (tag `qwen3_5_text`) que toma Qwen3.5-4B como base y le antepone cinco capas BF16 compiladas. El merge ensancha el flujo residual del lenguaje de 2.560 a 2.816 dimensiones. El autor advierte que el padding de pesos base y el ajuste de ganancia de normalizacion pueden introducir diferencias de redondeo BF16, por lo que no se reclama equivalencia bit a bit con el Qwen base. El modelo no incluye componente de vision.

No se documenta un proceso de entrenamiento con datos: el autor afirma que el modelo fue compilado y no ajustado sobre las preguntas de evaluacion. El controlador soporta 64 registros combinados residentes de nodo/triangulo y ocho descensos. El programa de navegacion reside en los pesos, mientras que la topologia instalada y el estado de recorrido viven en tensores recurrentes. El texto fuente original, la procedencia, los vectores semanticos, los IDs estables y la jerarquia nativa completa permanecen en el corazon cifrado de Spine, gestionado por Rust. No estan implementados la creacion, plegado, ranking, paginacion ni enrutamiento autonomo de triangulos dentro del modelo.

El modo opcional `--triangle-internal-context` instala la topologia completa para cada raiz seleccionada nativamente, limitada a 64 registros y profundidad ocho por banco, sin cuerpos de fuente en esa topologia. El prefijo de cinco capas ejecuta comandos de navegacion y Rust verifica independientemente las trazas exactas, las direcciones instaladas y la evidencia de ejecucion antes de que los IDs de apex autorizen los extractos originales para el prompt de lenguaje.

## Capacidades

- Generacion de texto conversacional en modo chat con mensajes y herramientas del harness nativo.
- Ejecucion de comandos de navegacion sobre una topologia de memoria instalada en tensores recurrentes (modo `--triangle-internal-context`).
- Compactacion nativa, ranking y recuperacion hibrida automatica activos por defecto.
- Herramientas de memoria explicitas disponibles en el harness.
- Modo opcional de memoria automatica solo-triangulo que retiene el texto de recuperacion hibrida preservando tarea, historial, estado retenido y herramientas explicitas.
- Verificacion de identidad de shards antes de la inferencia (hash compuesto sobre el mapa de digests en `triangle.json`).
- No dispone de vision, audio ni otras modalidades; es exclusivamente texto.
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en arquitecturas de memoria externa: el modelo permite reproducir el contrato de navegacion triangular sobre una topologia instalada, con verificacion independiente en Rust, adecuado para estudiar como se separa el almacenamiento de evidencia de la ejecucion de rutas.
- Reproduccion experimental de resultados: el repositorio fija revisiones concretas (`ac7e0e55c5d67ef99f61aa2d50d12b1d996f9b42`), checksums y un manifiesto de 17 archivos, lo que facilita replicar mediciones en entornos controlados.
- Estudio de integracion modelo-runtime: sirve para analizar el acoplamiento entre un modelo de lenguaje y un orquestador externo que decide rutas semanticas y valida evidencia antes de autorizar extractos.
- Prototipado de sistemas de contexto acotado: con limites de 32.768 tokens de prompt y 2.048 de salida por ronda, es util para experimentar con compactacion y presupuestos de fuente en conversaciones largas.
- Analisis de seguridad de memoria: la verificacion de trazas exactas y direcciones instaladas antes de autorizar extractos permite estudiar mecanismos de validacion en pipelines de recuperacion.
- Docencia e investigacion sobre derivados de Qwen: al ser un merge documentado sobre Qwen3.5-4B con identidad de pesos publicada, sirve como caso de estudio de modificacion arquitectonica y sus efectos de redondeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 5.248.077.504 parametros y pesos BF16, el calculo aproximado ronda los 10,5 GB solo para pesos, mas overhead de cache KV y estado de navegacion.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU consumer: no confirmado; por tamano de pesos BF16 seria ajustado en GPUs de 12-16 GB y requeriria cuantizacion para mayor margen, pero no se documentan cuantizaciones.
- Opciones de despliegue: exclusivamente el runtime personalizado del repositorio fuente (backend Python en `rust-spine/backends/triangle/server.py`, fuente Rust incluida, compilador fijado y checkpoint correspondiente). El autor advierte que un cargador generico de Transformers no es un sustituto establecido del contrato de despacho comando/texto y validacion de estado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwenmem-spine | 5.248.077.504 | 32.768 tokens de prompt / 2.048 de salida | Derivado de Qwen3.5-4B con capas de navegacion triangular y runtime propio | Apache-2.0 (pesos) | HuggingFace y GitHub, requiere runtime personalizado |
| Qwen3.5-4B (base) | no disponible en la informacion | no disponible en la informacion | Transformer de texto estandar | no disponible en la informacion | HuggingFace |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre qwenmem-spine y su base Qwen3.5-4B ni con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion fijo y sin mantenimiento: no se planifican actualizaciones, correcciones, nuevas funciones ni soporte.
- Requiere el runtime personalizado del repositorio fuente; los widgets de inferencia alojados y los servidores de generacion genericos no estan validados como puntos de entrada.
- No se ha verificado una descarga ni una instalacion en maquina limpia; el autor lo indica expresamente.
- No se reclama equivalencia bit a bit con Qwen base debido al padding de pesos y al ajuste de ganancia de normalizacion en BF16.
- La verificacion por checksums detecta cambios accidentales, pero un manifiesto reemplazable no constituye una garantia criptografica de autenticidad.
- No estan implementados la creacion, plegado, ranking, paginacion ni enrutamiento autonomo de triangulos dentro del modelo; el ranking, la compactacion y el almacenamiento de fuentes siguen siendo operaciones del host nativo.
- Los tensores de navegacion deben permanecer sin cambios durante la generacion de lenguaje; un cierre sobredimensionado o una comprobacion fallida detiene la peticion.
- El reinicio del proceso recupera continuidad desde el corazon y el journal, no desde una cache KV de historial completo restaurada automaticamente.
- Riesgo de alucinacion y sesgos conocidos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingue.
- Uso comercial permitido bajo Apache-2.0 para los pesos, con obligacion de preservar los avisos correspondientes; el codigo nuevo es MIT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jared1728/qwenmem-spine
- Repositorio fuente (revision fijada): https://github.com/Jaredcastorena/qwenmem-spine/tree/ac7e0e55c5d67ef99f61aa2d50d12b1d996f9b42
- Backend Python del servidor triangular: https://github.com/Jaredcastorena/qwenmem-spine/blob/ac7e0e55c5d67ef99f61aa2d50d12b1d996f9b42/rust-spine/backends/triangle/server.py
- Guia de reproduccion: https://github.com/Jaredcastorena/qwenmem-spine/blob/ac7e0e55c5d67ef99f61aa2d50d12b1d996f9b42/docs/reproduction.md
- Instrucciones directas del runtime: https://github.com/Jaredcastorena/qwenmem-spine/blob/ac7e0e55c5d67ef99f61aa2d50d12b1d996f9b42/rust-spine/docs/triangle-model.md
- Validacion de contexto interno: https://github.com/Jaredcastorena/qwenmem-spine/blob/ac7e0e55c5d67ef99f61aa2d50d12b1d996f9b42/docs/internal-context-validation.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
