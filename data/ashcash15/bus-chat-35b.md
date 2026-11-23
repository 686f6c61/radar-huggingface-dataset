# ashcash15/bus-chat-35b

## Resumen

`ashcash15/bus-chat-35b` es un adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen3.6-35B-A3B`, desarrollado por el usuario ashcash15. Su objetivo es convertir un modelo generalista en un tutor conversacional de conceptos de negocio: explica, comprueba la comprensión del alumno y ajusta el nivel técnico de sus respuestas según el progreso de la conversación. El adaptador cubre seis dominios: contabilidad, economía, finanzas, sistemas de información, gestión y marketing.

El proyecto es relevante por su enfoque metodológico más que por su rendimiento bruto: documenta un pipeline de tres etapas (pretraining continuado, SFT y DPO) con evaluaciones pareadas frente al modelo base, incluyendo resultados negativos explícitos (una segunda época de SFT empeora el resultado, un conjunto de preferencias mayor rinde peor). Es, en palabras del autor, un artefacto de investigación para estudiar si los datos de enseñanza sintéticos transfieren pedagogía a un modelo abierto.

La release actual es la 2 (2026-11-02), que corrige un defecto de preprocesado de la release 1 (pérdida de párrafos finales de turno y desplazamiento de la máscara de pérdida) y añade la etapa de DPO. El adaptador tiene rango LoRA 32 y el repositorio ocupa 6,7 GB en formato safetensors. La licencia declarada es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.6-35B-A3B; rango 32 |
| Parámetros totales | No disponible para el adaptador; el modelo base es un MoE de 35B |
| Parámetros activos | No disponible en la información proporcionada (el nombre del base sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del base) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.6-35B-A3B`, un modelo de mezcla de expertos de Qwen con 35B parámetros totales según su denominación. El adaptador en sí es un LoRA de rango 32 entrenado en tres etapas, una época cada una: (1) pretraining continuado sobre 862 pasajes de negocio verificados (~1,4M tokens) mezclados con datos de replay de web general; (2) SFT sobre 1.115 diálogos de tutoría sintéticos en los que el nivel técnico del tutor sube y baja dentro de la misma conversación, con pérdida calculada solo en los turnos del tutor; y (3) DPO (una pasada, β = 0,1) sobre 314 pares de respuestas candidatas del propio modelo, evaluadas por un modelo juez en precisión, capacidad de respuesta, calidad docente y ajuste al nivel.

La innovación destacable no está en la arquitectura sino en el diseño del dato: el currículo de dificultad adaptativa dentro de una misma conversación y el uso de preferencias generadas por el propio modelo y filtradas por un juez separado. El autor reporta además ablaciones negativas: una segunda época de SFT degrada simultáneamente calidad de tutoría, precisión y perplejidad; 54% más diálogos de SFT no mejora; y un conjunto de preferencias de 893 pares rinde peor que los 314 usados. El adaptador responde sin fase de razonamiento (bloque `<think></think>` vacío).

## Capacidades

- Generación de texto conversacional en inglés con rol de tutor de negocio.
- Explicación adaptativa: ajusta la profundidad técnica al nivel mostrado por el alumno a lo largo del diálogo.
- Comprobación de comprensión y corrección de misconceptions dentro de la conversación.
- Cobertura de seis dominios: contabilidad, economía, finanzas, sistemas de información, gestión y marketing.
- Respuesta directa sin cadena de razonamiento explícita.
- Soporte de plantilla de chat con turno de sistema para describir el rol del tutor y el perfil del alumno.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente multi-paso: no documentadas.
- Multilingüismo: solo inglés declarado.
- Visión o audio: no disponibles.

## Casos de uso

- Tutoría uno a uno de conceptos contables: el adaptador está entrenado para detectar confusión y simplificar explicaciones, por lo que encaja en sesiones donde el alumno declara no entender un concepto (por ejemplo, devengos) y el modelo debe reformular sin jerga.
- Prototipos de asistentes educativos en cursos introductorios de finanzas o economía: permite validar interfaces y flujos de diálogo antes de invertir en un modelo mayor o en datos propios.
- Investigación sobre transferencia de pedagogía desde datos sintéticos: sirve como caso reproducible de pipeline CPT → SFT → DPO con evaluaciones pareadas y ablaciones documentadas.
- Generación de material didáctico borrador: producción de explicaciones y ejemplos que un docente humano revisa antes de publicar, aprovechando el ajuste de nivel al perfil del estudiante.
- Simulación de sesiones de estudio para evaluación de otros sistemas: el adaptador puede actuar como tutor de referencia en pruebas A/B de asistentes educativos.
- Formación interna en empresa sobre conceptos financieros básicos: con supervisión humana y sin uso como asesoramiento financiero, para explicar terminología a perfiles no financieros.
- Integración en pipelines de servicio con vLLM: el autor documenta el despliegue mediante `vllm serve` con `--enable-lora` sobre el modelo base, lo que permite servir el adaptador junto al base en un mismo servidor.

## Benchmarks y rendimiento

Evaluación de calidad de tutoría: sesión de 5 turnos sobre 56 temas de negocio retenidos, alumno simulado por DeepSeek-V4-Pro y calificación de GPT-5.4 de 0 a 10 en cinco dimensiones. Los valores del adaptador son la media de dos ejecuciones independientes (7,70 y 7,62).

| Modelo | Overall ↑ | Precisión | Scaffolding | Capacidad de respuesta | Misconceptions | Ajuste de nivel |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 7,14 | 4,96 | 7,25 | 8,57 | 7,12 | 7,80 |
| Release 1 (solo SFT, datos defectuosos) | 6,70 | 5,38 | 6,62 | 7,52 | 6,38 | 7,59 |
| Release 2 (este adaptador) | 7,66 | 6,31 | 7,77 | 8,65 | 7,12 | 8,46 |

Significancia reportada: por pares de tema, el adaptador supera al base en 33 temas y queda por debajo en 18 (test de signos bilateral, p = 0,049); frente a la release 1, 38 contra 18 (p = 0,010). La variación entre ejecuciones de la misma evaluación es de ~0,1, por lo que diferencias inferiores a ~0,5 no deben interpretarse como reales.

Conocimiento y capacidad general:

| Modelo | Perplejidad de negocio ↓ | MMLU ↑ |
|---|---|---|
| Base | 3,2932 | 0,8313 |
| Tras etapa 1 (CPT) | 2,8021 (−14,9%) | 0,8375 |
| Release 1 | 2,8417 (−13,7%) | 0,8313 |
| Release 2 (este adaptador) | 2,8454 (−13,6%) | 0,8250 |

La perplejidad se calcula como `exp(entropía cruzada media)` sobre 43 pasajes retenidos; el MMLU son 160 preguntas de marketing, gestión, econometría y contabilidad profesional puntuadas por verosimilitud de respuesta. La diferencia de MMLU frente al base equivale a una pregunta de 160.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador; depende enteramente del modelo base Qwen3.6-35B-A3B y de su cuantización.
- El adaptador en sí ocupa 6,7 GB en safetensors, pero debe cargarse junto al base en memoria.
- GPU recomendadas: no especificadas en la información disponible. Un MoE de 35B totales requiere, en fp16, del orden de 70 GB de pesos, lo que excede GPUs de consumo; no se confirma en la documentación.
- Cabeza en GPU de consumo: no confirmado; la viabilidad depende de cuantización del base, no documentada.
- Despliegue: el autor documenta `vllm serve Qwen/Qwen3.6-35B-A3B --enable-lora --lora-modu...` (comando truncado en la model card) y uso con `peft` + `transformers` (`PeftModel.from_pretrained`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bus-chat-35b (este) | LoRA r32 sobre MoE 35B | No disponible | Tutoría de negocio adaptativa | Apache 2.0 | Hugging Face, 6 descargas |
| Qwen3.6-35B-A3B (base) | MoE 35B | No disponible | Propósito general | Según el base | Hugging Face (Qwen) |
| Release 1 de este adaptador | LoRA r32 sobre MoE 35B | No disponible | Tutoría (datos defectuosos) | Apache 2.0 | Hugging Face |
| Otros adaptadores de tutoría comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de otros adaptadores de tutoría en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Precisión es la dimensión más débil: el adaptador inventa ocasionalmente reglas heurísticas, umbrales o cifras. Los diálogos sintéticos de profesor con los que se entrenó puntúan 8,6 en la misma medida de precisión, frente al 6,3 del adaptador.
- El conocimiento procede de pasajes sintéticos escritos por un modelo y filtrados por otro; los errores factuales sobreviven a ese proceso.
- No es apto para asesoramiento financiero, legal, fiscal o contable, ni para calificar personas ni para decisiones que afecten a personas.
- Solo inglés declarado; sin soporte multilingüe documentado.
- Evaluación realizada con alumno simulado y juez automático, no con estudiantes humanos.
- No se ha medido el comportamiento de seguridad ni el rendimiento fuera de los seis dominios cubiertos.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: explícitamente señalado por el autor en la dimensión de precisión.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor desaconseja el uso como tutor desplegado y lo califica de artefacto de investigación; conviene verificar la licencia del modelo base Qwen3.6-35B-A3B.
- El adaptador espera un turno de sistema describiendo el rol del tutor y el perfil del alumno; sin esa estructura, el comportamiento puede degradarse.
- Diferencias inferiores a ~0,5 en la evaluación de tutoría están dentro del ruido entre ejecuciones.

## Enlaces

- Hugging Face: https://huggingface.co/ashcash15/bus-chat-35b
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
