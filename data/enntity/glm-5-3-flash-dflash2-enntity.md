# Enntity/GLM-5.3-Flash-DFlash2-enntity

## Resumen

GLM-5.3-Flash-DFlash2-enntity es un modelo borrador (drafter) de decodificación especulativa para el modelo objetivo GLM-5.3-Flash, desarrollado por Enntity. No es un modelo generativo autónomo: su función es proponer tokens candidatos que el modelo objetivo verifica en paralelo, acelerando así la inferencia sin alterar la distribución de salida del modelo grande. Implementa la arquitectura DFlash2, con 5 capas y 1.171.080.448 parámetros entrenados en BF16, y se sirve como drop-in en el motor SparkGLM (Atlas) mediante el flag `--draft-model`.

El modelo se entrenó desde cero (inicialización aleatoria, sin pesos de terceros) sobre dos nodos DGX Spark, partiendo de estados ocultos capturados del propio GLM-5.3-Flash servido. La versión actual es la v81, publicada el 5 de noviembre de 2026, que mejora a la v80 en la mayoría de las categorías medidas. Su relevancia radica en que demuestra que un drafter entrenado de forma independiente y en hardware de gama relativamente modesta puede acercarse al mejor drafter público de referencia (`incoai/GLM-5.3-Flash-DFlash2`) y superarlo en cargas agénticas de código.

La licencia es Apache-2.0 para los pesos, mientras que el modelo objetivo GLM-5.3-Flash es MIT. El repositorio ocupa 4,7 GB e incluye 81 tensores BF16 en formato `atlas-dflash2-bf16`. No incluye embeddings ni `lm_head`, que se toman del modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 (drafter de decodificación especulativa), 5 capas |
| Parametros totales | 1.171.080.448 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (formato nativo `atlas-dflash2-bf16`); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos); modelo objetivo GLM-5.3-Flash bajo MIT |
| Formato de pesos | safetensors (81 tensores BF16) |

## Arquitectura y entrenamiento

El modelo es un drafter DFlash2 de 5 capas y 1,17 mil millones de parámetros, con el layout de tensores propio de DFlash2 (81 tensores BF16). No incluye embedding ni `lm_head`: ambos se heredan del modelo objetivo GLM-5.3-Flash. Se integra en el motor Atlas (SparkGLM) como `--draft-model`, funcionando como borrador de decodificación especulativa con verificación adaptativa por parte del modelo objetivo en NVFP4.

El entrenamiento de la v81 partió del master fp32 de la v80 y utilizó 76.427 filas capturadas (75.957 de entrenamiento, 470 de validación), con 119 millones de tokens almacenados. Las fuentes incluyen prompts de plantilla, prosa, código y salida estructurada autoría de Enntity con completaciones del profesor GLM-5.3-Flash, sesiones internas de chat y agentes de código, y sesiones agénticas de código del profesor sobre tareas de Enntity; los estados ocultos se capturaron del objetivo servido. El objetivo de entrenamiento es `selector_prefix` con pérdida unaria `nla` y peso de longitud aceptada esperada de 1,0. El plan fue coseno de una época (17.000 pasos, lr 2,5e-5, suelo 0,2x, 50 de calentamiento), detenido en el paso 13.200 al estabilizarse las ganancias en validación, con 4.096 anclas por paso y unos 315 millones de tokens supervisados. El entrenamiento distribuido usó promedio simple en dos nodos (DiLoCo, 200 pasos internos, lr externo 1, sin momento), publicado como red global v81.

## Capacidades

- Decodificación especulativa: propone tokens candidatos para que GLM-5.3-Flash los verifique, acelerando la generación del modelo objetivo.
- Aceleración diferenciada por tipo de contenido: mayor tasa de aceptación en salida estructurada (6,01 tokens aceptados por paso de verificación) y código (4,11) que en prosa (2,12).
- Soporte de cargas agénticas de código: rinde por encima del drafter de referencia en los conjuntos held-out de turnos de agente de código (122% y 115% del rendimiento de referencia).
- Integración drop-in en Atlas/SparkGLM mediante `--draft-model`.
- No realiza generación autónoma, tool calling, visión, audio ni razonamiento multi-paso por sí mismo: todas esas capacidades dependen del modelo objetivo.
- Multilingüismo: no documentado; heredado en la práctica del modelo objetivo, no especificado para el drafter.

## Casos de uso

- Servicio de GLM-5.3-Flash en producción con SparkGLM: desplegar el drafter como `--draft-model` para elevar el throughput de decodificación del modelo objetivo en NVFP4 sobre nodos GB10.
- Generación de código en asistentes IDE: el drafter alcanza 63,0 tok/s y 4,11 tokens aceptados por paso en la categoría de código, por lo que es adecuado para autocompletado y generación de funciones donde la aceptación especulativa es alta.
- Salida estructurada (JSON, plantillas, formatos fijos): con 79,6 tok/s y 6,01 tokens aceptados por paso, es el escenario donde más se aprovecha el borrador, útil en pipelines de extracción de datos y APIs.
- Agentes de código multi-turno: en los conjuntos held-out de turnos agénticos rinde al 122% y 115% del drafter de referencia, por lo que conviene en flujos de agente con muchas llamadas a herramientas y contexto de código.
- Despliegue en hardware de gama Spark: entrenado y validado sobre dos DGX Spark (GB10), encaja en infraestructuras de inferencia de borde o laboratorio con ese hardware.
- Investigación en decodificación especulativa: sirve como base reproducible (linaje en `PROVENANCE.json`, tags por versión) para estudiar el impacto del drafter en latencia y aceptación.
- Reducción de coste por token en servicios de chat con GLM-5.3-Flash: en prosa la ganancia es menor (40,9 tok/s, 87% de la referencia), pero sigue aportando aceleración sobre la ausencia de drafter (unos 28 tok/s estimados).

## Benchmarks y rendimiento

Mediciones en vivo con Atlas (2026-11-05), SparkGLM sobre dos nodos GB10, objetivo NVFP4, greedy, una petición a la vez, ancho de verificación adaptativo. Se indica tok/s de decodificación del motor y, entre paréntesis, tokens aceptados por paso de verificación.

| Categoria | v81 | v80 | v81 vs v80 | Referencia | v81 / referencia |
|---|---|---|---|---|---|
| Prosa, 12 prompts x 256 tokens | 40,9 (2,12) | 40,1 (2,06) | +1,9% | 46,8 (2,50) | 87% |
| Código, 12 prompts x 256 tokens | 63,0 (4,11) | 61,5 (3,99) | +2,4% | 69,2 (4,89) | 91% |
| Salida estructurada, 4 prompts | 79,6 (6,01) | 76,9 (5,74) | +3,4% | 87,3 (6,98) | 91% |
| RigMark prosa | 36,0 (1,86) | 35,8 (1,83) | +0,6% | 39,0 (2,04) | 92% |
| RigMark código | 63,3 (4,27) | 61,8 (4,12) | +2,4% | 66,9 (4,73) | 95% |
| RigMark estructurado | 84,2 (6,73) | 79,8 (6,25) | +5,6% | 91,0 (7,64) | 93% |
| Turnos agénticos de código, set A (16) | 51,1 (3,42) | 52,0 (3,46) | -1,6% | 42,0 (2,70) | 122% |
| Turnos agénticos de código, set B (24) | 48,8 (3,17) | 47,6 (3,10) | +2,4% | 42,3 (2,68) | 115% |

Ruido entre ejecuciones de aproximadamente ±2%. Offline (held-out, teacher-forced, longitud aceptada esperada por bloque de 8 tokens):

| Grupo | v80 | v81 |
|---|---|---|
| Agéntico (96 filas) | 3,714 | 3,763 |
| Plantilla | 3,240 | 3,282 |
| Estructurado | 5,672 | 5,816 |
| Prosa | 2,510 | 2,569 |
| Código | 4,211 | 4,360 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 4,7 GB en BF16 (1,17B parámetros), por lo que la huella del drafter es de ese orden, más la del modelo objetivo GLM-5.3-Flash que se sirve en paralelo.
- GPU validadas: dos nodos DGX Spark con GB10 (entorno de entrenamiento y pruebas en vivo).
- No se documenta compatibilidad con GPU de consumo (RTX 4090, etc.); el motor de referencia es Atlas/SparkGLM sobre GB10.
- Opciones de despliegue: SparkGLM (Atlas) con `--draft-model`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este formato `atlas-dflash2-bf16`.
- Latencia y throughput: 36,0-84,2 tok/s según categoría en las pruebas en vivo; sin drafter, unos 28 tok/s estimados en RigMark.
- Descarga recomendada por tag o commit: `hf download Enntity/GLM-5.3-Flash-DFlash2-enntity --revision v81 --local-dir GLM-5.3-Flash-DFlash2-enntity-v81`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (RigMark prosa / código / estructurado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Enntity/GLM-5.3-Flash-DFlash2-enntity (v81) | 1,17B (drafter) | no disponible | 36,0 / 63,3 / 84,2 tok/s | Apache-2.0 | Hugging Face |
| incoai/GLM-5.3-Flash-DFlash2 (referencia) | no disponible | no disponible | 39,0 / 66,9 / 91,0 tok/s | no disponible | Hugging Face |
| Enntity/GLM-5.3-Flash-DFlash2-enntity (v80) | 1,17B (drafter) | no disponible | 35,8 / 61,8 / 79,8 tok/s | Apache-2.0 | Hugging Face (tag v80) |

El drafter de referencia es más rápido en las cargas públicas (prosa, código, estructurado), mientras que el modelo de Enntity lo supera en los conjuntos held-out de turnos agénticos de código (122% y 115%). No se dispone de datos de otros drafters comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere GLM-5.3-Flash como objetivo y el motor Atlas/SparkGLM; no funciona como generador independiente.
- Rendimiento inferior al drafter de referencia en prosa (87%), código (91%) y salida estructurada (91%) en las cargas públicas; solo supera a la referencia en los conjuntos agénticos held-out.
- Ruido entre ejecuciones de aproximadamente ±2%, por lo que diferencias pequeñas entre versiones no son significativas.
- El repositorio cambia de nombre (antes `Enntity/GLM-5.3-Flash-DFlash2-enntity-v80`, ahora redirige) y cada release es un tag de git: conviene fijar tag o commit en lugar de `main` para reproducibilidad.
- No se documentan idiomas soportados ni longitud de contexto del drafter; dependen del modelo objetivo.
- No se documentan sesgos ni tasas de alucinación del drafter; al no generar texto de forma autónoma, estos riesgos recaen en el modelo objetivo.
- La licencia Apache-2.0 cubre los pesos del drafter; el uso del modelo objetivo GLM-5.3-Flash se rige por su licencia MIT.
- Solo se han validado 3 descargas y 0 likes en el momento de la ficha; es un artefacto reciente y de adopción muy limitada.
- El entrenamiento se detuvo en el paso 13.200 antes de completar la época planificada (17.000 pasos), por lo que el margen de mejora con más datos no está agotado.

## Enlaces

- Hugging Face: https://huggingface.co/Enntity/GLM-5.3-Flash-DFlash2-enntity
- Modelo base: https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local
- Drafter de referencia: https://huggingface.co/incoai/GLM-5.3-Flash-DFlash2
- Código de entrenamiento: https://github.com/Enntity/glm-flash-drafter
