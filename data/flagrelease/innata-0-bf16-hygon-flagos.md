# FlagRelease/Innata-0-BF16-hygon-FlagOS

## Resumen

Innata-0 es un sistema de mundo encarnado (embodied world system) desarrollado por BAAI (Beijing Academy of Artificial Intelligence). Se compone de dos piezas: Innata-0-WAM, un modelo de arquitectura Mixture-of-Transformers de tres torres que modela conjuntamente comprensión del mundo, predicción visual condicionada por acciones y generación de acciones y tacto para robótica; e Innata-0-Agent, una capa de agente responsable de la planificación de tareas, la validación de la ejecución, la recuperación de errores y la acumulación de experiencia reutilizable.

El repositorio `FlagRelease/Innata-0-BF16-hygon-FlagOS` es una adaptación cross-chip del modelo para Hygon DCU (HCU), distribuida por la comunidad FlagOS como soporte Day0. Incluye una imagen de contenedor con la aplicación de inferencia, el VAE de Wan2.2 y las dependencias de runtime, además de los pesos en BF16. La adaptación cubre seis plataformas (NVIDIA, MetaX, Hygon, Ascend, Moore Threads y T-Head), de las cuales esta ficha documenta la variante Hygon.

La relevancia actual del modelo radica en su enfoque de co-diseño entre modelo y agente para robótica: en el benchmark de simulación RoboCasa365, equipar el WAM base con la pila de agente completa eleva la tasa de éxito global del 60,2% al 65,4%, y en tareas composicionales no vistas del 32,4% al 43,6%. El repositorio ocupa 113,8 GB y los pesos están en formato safetensors con precisión BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers de tres torres (comprensión, predicción visual, acción/tacto) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (única precisión documentada en este repositorio) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | apache-2.0-and-openmdw-1.1 (etiquetada como `other`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Innata-0-WAM emplea una arquitectura Mixture-of-Transformers con tres torres especializadas que se modelan de forma conjunta: una torre de comprensión del mundo (implementada sobre Qwen3-VL en BF16 con atención SDPA), una torre de predicción visual condicionada por acciones (ACWM, action-conditioned world model) y una torre de generación de acciones y señales táctiles para control robótico. El sistema incorpora además el VAE de Wan2.2 para la codificación y decodificación de vídeo, lo que permite generar predicciones visuales a 736×544 y 16 fps.

La capa de agente (Innata-0-Agent) se ejecuta sobre el modelo y aporta planificación de tareas, validación de la ejecución, recuperación ante errores y acumulación de experiencia reutilizable. El entrenamiento se orienta a tres capacidades declaradas: planificación, recuperación y evolución. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La innovación técnica destacable es el soporte cross-chip Day0 mediante la pila FlagOS (Torch-FL, FlagTree, FlagGems), que permite ejecutar el mismo modelo en seis plataformas de aceleradores distintos con resultados funcionalmente idénticos a la referencia en H100, aunque no bit-idénticos (la diferencia restante se atribuye a FA3 frente a SDPA y al redondeo de kernels BF16).

## Capacidades

- Comprensión visual del mundo: responde a tareas de entendimiento multimodal (evaluado en BLINK y MMSI con nueve fotogramas).
- Predicción visual condicionada por acciones (ACWM): genera vídeo de 736×544 a 16 fps y 73 fotogramas en la validación reportada.
- Generación de acciones robóticas: produce secuencias de acción de 16×14 (RoboDojo) y 16×12 (RoboCasa365).
- Generación de señales táctiles junto con las acciones.
- Planificación de tareas de varios pasos mediante la pila de agente.
- Validación de la ejecución y recuperación ante errores.
- Acumulación de experiencia reutilizable entre tareas.
- Soporte multilingüe limitado a chino e inglés.
- Despliegue cross-chip mediante la abstracción `flagos` de Torch-FL y `torch.accelerator`.

## Casos de uso

- Manipulación robótica en simulación: el modelo genera secuencias de acción de 16×14 y 16×12 para entornos RoboDojo y RoboCasa365, lo que permite entrenar y evaluar políticas de control antes de transferirlas a hardware real.
- Predicción de mundo para planificación: dado un estado visual y una acción candidata, el ACWM genera el vídeo resultante a 736×544 y 16 fps, lo que posibilita evaluar el resultado de una acción sin ejecutarla físicamente.
- Agentes robóticos con recuperación de errores: la capa Innata-0-Agent valida cada paso y replanifica ante fallos, lo que eleva la tasa de éxito en tareas composicionales no vistas del 32,4% al 43,6% según el benchmark oficial.
- Evaluación de modelos encarnados en hardware no NVIDIA: la imagen FlagOS permite ejecutar los cuatro checkpoints (comprensión, ACWM, RoboDojo y RoboCasa365) en Hygon DCU con una sola tarjeta por proceso, útil para laboratorios con aceleradores nacionales chinos.
- Investigación en co-diseño modelo-agente: el sistema separa explícitamente el modelo de mundo de la capa de agente, lo que facilita experimentar con distintas estrategias de planificación y validación sobre el mismo WAM.
- Comprensión multimodal de escenas: la torre de comprensión basada en Qwen3-VL responde a preguntas sobre imágenes y secuencias de fotogramas (BLINK, MMSI), aplicable a inspección visual o monitorización.
- Validación de portabilidad cross-chip: el paquete `chip-adaptation-v4` y el verificador asociado permiten comprobar la equivalencia funcional de las salidas frente a la referencia en H100, útil para certificar despliegues en nuevas plataformas.

## Benchmarks y rendimiento

Los datos disponibles corresponden a la validación funcional de la adaptación Hygon frente a la referencia H100, no a benchmarks académicos estándar (MMLU, HumanEval, GSM8K). No se han publicado resultados de esos benchmarks en la información disponible.

| Solicitud V4 | Resultado en Hygon | Acuerdo con referencia H100 |
|---|---|---|
| Understanding BLINK | PASS, respuesta `B` | Misma respuesta `B` |
| Understanding MMSI, nueve fotogramas | PASS, respuesta `B` | Misma respuesta `B`; razón "one full loop, 32 s" |
| ACWM | PASS, 736×544, 73 fotogramas, 16 fps | Diferencia RGB media 0,446/255; 0,056% de píxeles con diferencia >8; máximo 74 |
| RoboDojo | PASS, 16×14 | Metadatos idénticos; máximo nativo 0,0090, media 9,4e-4; normalizado máximo 0,0093, media 1,6e-3 |
| RoboCasa365 | PASS, 16×12 | Metadatos idénticos; máximo 0,0544, media 4,0e-3 |

Tiempos de reloj medidos en una sola tarjeta HCU en modo eager, incluyendo carga de checkpoint y codificación VAE:

| Solicitud V4 | Tiempo de reloj | Detalle de muestreo |
|---|---:|---|
| Understanding BLINK | ~2 min 22 s | La carga del modelo domina |
| Understanding MMSI, nueve fotogramas | +31 s sobre BLINK | Mismo modelo residente |
| ACWM | ~6 min 15 s | Codificación VAE ~3 min 33 s; 30 pasos 1 min 57 s a 3,72 it/s |
| RoboDojo | ~5 min 45 s | 30 pasos 28 s a 1,24 it/s |
| RoboCasa365 | ~5 min 56 s | 30 pasos 41 s a 1,21 it/s |

Resultados del benchmark RoboCasa365 con la pila de agente completa:

| Configuración | Tasa de éxito global | Tareas composicionales no vistas |
|---|---:|---:|
| WAM base | 60,2% | 32,4% |
| WAM + pila de agente completa | 65,4% | 43,6% |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; la configuración validada usa tarjetas Hygon DCU de 65 GiB por tarjeta, una tarjeta por proceso de inferencia.
- GPU recomendadas: Hygon DCU (HCU) de 65 GiB; la referencia de comparación es NVIDIA H100 con `use_torch_compile=True`.
- Cabe en GPU de consumo: no disponible; el tamaño del repositorio (113,8 GB) y el uso de BF16 sin cuantización documentada hacen improbable su ejecución en GPU de consumo convencionales.
- Opciones de despliegue: imagen Docker `harbor.baai.ac.cn/flagrelease-public/innata-0:flagos-hygon-20261126` (51,4 GB, digest `sha256:91f2ec015e95eac7a34c541fdf899523b6f44eda0fcef9b481054602724a90f5`) con Torch-FL 0.1.0+dtk, FlagTree 0.6.0 y FlagGems 5.4.0rc2; backend de atención SDPA (Hygon no dispone de binario FA3); invocación mediante `cosmos_framework.scripts.inference` con `COSMOS_DEVICE=flagos` e `I4_ATTN_BACKENDS=sdpa`.
- Entorno validado: Linux x86_64, CPython 3.10.20, DTK 6.3 (dtk2604), HIP 6.3, PyTorch 2.10.0; host hygon-19 con 8 HCU (tarjetas 2 a 5 utilizadas).
- Latencia y throughput: 3,72 it/s en ACWM, 1,24 it/s en RoboDojo y 1,21 it/s en RoboCasa365 con 30 pasos de muestreo; tiempos totales por solicitud entre ~2 min 22 s y ~6 min 15 s.
- Restricción de despliegue: no ejecutar varios procesos de inferencia en la misma tarjeta; el proceso no debe definir `PYTHONPATH`.
- Limitación conocida: `torch.distributed.is_nccl_available()` devuelve `False` en este runtime Torch-FL, por lo que la comparación CFG de RoboCasa en una y dos tarjetas no se ejecutó.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar ni de especificaciones de parámetros que permitan una comparación cuantitativa fiable con modelos de la misma categoría. La única comparación disponible es interna al propio sistema (WAM base frente a WAM con agente) y frente a la referencia H100 de la misma adaptación.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Innata-0 (WAM + Agent) | no disponible | no disponible | apache-2.0-and-openmdw-1.1 | Hugging Face + imagen FlagOS |
| Alternativas de modelo de mundo encarnado | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos del modelo.
- Riesgo de alucinación no cuantificado; en tareas de comprensión visual la validación se limita a dos solicitudes (BLINK y MMSI) con respuesta única.
- Idiomas soportados únicamente chino e inglés; no hay soporte documentado de castellano.
- La licencia es compuesta (`apache-2.0-and-openmdw-1.1`, etiquetada como `other`); es necesario revisar los términos de OpenMDW 1.1 antes de un uso comercial.
- Los resultados en Hygon no son bit-idénticos a la referencia H100: la diferencia se atribuye a FA3 frente a SDPA y al redondeo de kernels BF16, con una diferencia RGB media de 0,446/255 en ACWM.
- La comparación de latencia entre Hygon (eager) y H100 (`use_torch_compile=True`) no es directa, según advierte la propia model card.
- El runtime Torch-FL no expone NCCL (`is_nccl_available() == False`), lo que impide ejecutar comparaciones multi-tarjeta que requieran grupo de procesos NCCL.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- El tamaño del repositorio (113,8 GB) y la imagen de contenedor (51,4 GB) imponen requisitos de almacenamiento considerables.
- No se dispone de información sobre parámetros totales, longitud de contexto ni composición del dataset de entrenamiento, lo que dificulta evaluar su idoneidad para producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FlagRelease/Innata-0-BF16-hygon-FlagOS
- Imagen de contenedor FlagOS para Hygon: `harbor.baai.ac.cn/flagrelease-public/innata-0:flagos-hygon-20261126`
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada.
