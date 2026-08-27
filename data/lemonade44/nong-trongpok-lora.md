# Lemonade44/nong-trongpok-lora

## Resumen

El modelo `Lemonade44/nong-trongpok-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el equipo Lemonade44 para el modelo base `scb10x/typhoon2.5-qwen3-4b`, un modelo de lenguaje de 4 mil millones de parámetros de la familia Typhoon2.5-Qwen3. El adaptador está diseñado específicamente para realizar entrevistas de trabajo en tailandés siguiendo la metodología STAR, con un enfoque explícito en la reducción de sesgos: no pregunta ni utiliza información como calificaciones académicas, universidad, edad o género del candidato.

El problema que resuelve es la dificultad de mantener reglas de entrevista mediante solo instrucciones en el prompt, especialmente cuando el usuario revela información prohibida o intenta manipular el modelo mediante prompt injection. El fine-tuning con LoRA consigue una adherencia a las reglas del 88% con un prompt largo, frente al 30% del modelo base sin ajustar. El adaptador tiene un tamaño de repositorio de 0,1 GB y se distribuye bajo licencia Apache-2.0, con soporte exclusivo para tailandés.

La relevancia actual radica en la creciente demanda de herramientas de selección de personal automatizadas y éticas, donde la reducción de sesgos es un requisito crítico. Este adaptador demuestra que el fine-tuning dirigido puede superar las limitaciones de los prompts en escenarios de cumplimiento normativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (base: Typhoon2.5-Qwen3-4B) |
| Parametros totales | No disponible (adaptador LoRA, rango 8) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 768 tokens (max_seq de entrenamiento) |
| Tipos de cuantizacion | Entrenado con cuantizacion 4-bit (base), adaptador en bfloat16 |
| Idiomas soportados | Tailandes (th) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA con rango 8, aplicada sobre el modelo `scb10x/typhoon2.5-qwen3-4b`, que es un transformer causal de 4B parámetros de la familia Qwen3 adaptado al tailandés. El entrenamiento se realizó con cuantización 4-bit del modelo base para reducir requisitos de memoria, y el adaptador se guarda en formato safetensors compatible con la librería PEFT.

El dataset de entrenamiento es completamente sintético, generado a partir de las reglas de entrevista definidas por el equipo. Incluye 590 muestras de entrenamiento, 76 de validación y 69 de test, con una distribución intencionada de casos difíciles: 28% de usuarios que revelan información prohibida, 35% de respuestas vagas, 31% de preguntas sobre resultados o puntuaciones, y 22% de intentos de desviar la conversación. Se entrenó durante 9 épocas con early stopping (paciencia 3), alcanzando una precisión de test del 98,78% y una perplejidad de 1,023.

La innovación principal es el uso de fine-tuning en lugar de solo ingeniería de prompts para garantizar el cumplimiento de reglas, lo que mejora significativamente la robustez frente a prompt injection y a la revelación espontánea de datos sensibles por parte del usuario.

## Capacidades

- Generacion de entrevistas de trabajo en tailandes siguiendo la metodologia STAR (Situacion, Tarea, Accion, Resultado).
- Cumplimiento estricto de reglas de no discriminacion: no pregunta ni utiliza grado academico, universidad, edad o genero.
- Resistencia a prompt injection: el modelo mantiene las reglas incluso cuando el usuario intenta hacerle olvidar las instrucciones.
- Gestion de conversaciones multi-turno con contexto de hasta 768 tokens.
- Deteccion y manejo de respuestas vagas o evasivas, redirigiendo la conversacion hacia preguntas concretas.
- Capacidad para ignorar solicitudes de puntuaciones o evaluaciones durante la entrevista.
- Soporte de chat mediante plantilla de chat del modelo base (con opcion de desactivar el modo thinking).

## Casos de uso

- Seleccion de personal en empresas tailandesas: el adaptador puede realizar una primera entrevista estructurada por telefono o chat, garantizando que no se recojan datos personales protegidos, lo que facilita el cumplimiento de la ley de proteccion de datos.
- Practica de entrevistas para candidatos: los candidatos pueden ensayar entrevistas con un sistema que no juzga por su curriculum, centrandose en sus experiencias reales.
- Screening inicial en procesos de reclutamiento a gran volumen: el modelo puede filtrar candidatos basandose en respuestas STAR sin intervencion humana, reduciendo el sesgo del reclutador.
- Auditoria de procesos de seleccion: al no utilizar datos demograficos, las decisiones pueden ser auditadas para verificar la ausencia de discriminacion.
- Formacion de entrevistadores: el sistema puede servir como ejemplo de como conducir entrevistas sin sesgos, mostrando preguntas adecuadas y evitando temas prohibidos.
- Integracion en plataformas de RRHH: al ser un adaptador LoRA ligero, puede desplegarse junto al modelo base en infraestructura existente para anadir capacidades de entrevista etica a chatbots corporativos.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en su model card, medidos sobre un conjunto de test propio (69 muestras):

| Metrica | Valor |
|---|---|
| Accuracy (test) | 98,78% |
| Precision | 98,78% |
| Recall | 98,78% |
| F1 | 98,78% |
| Perplejidad | 1,023 |

Ademas, se compararon diferentes configuraciones en un escenario de evaluacion con criterios de exito:

| Configuracion | Tasa de exito |
|---|---|
| Fine-tuned + prompt largo | 88% |
| Fine-tuned + prompt corto | 79% |
| Base + prompt largo | 30% |
| Base + prompt corto | 18% |

Una validacion adicional via API real obtuvo entre 86% y 91% de exito, con un 100% de cumplimiento en la regla de "no tocar informacion prohibida". No se han publicado resultados en benchmarks estandar como MMLU o HumanEval.

## Requisitos de hardware

- El adaptador LoRA en si ocupa 0,1 GB, pero requiere cargar el modelo base de 4B parametros.
- Para inferencia en bfloat16, se necesitan aproximadamente 8-10 GB de VRAM (dependiendo de la longitud de contexto).
- Con cuantizacion 4-bit del modelo base, la VRAM requerida se reduce a unos 4-5 GB, permitiendo ejecucion en GPUs de consumo como RTX 3060 o RTX 4060.
- GPUs recomendadas: RTX 3090/4090 para bfloat16, o cualquier GPU con al menos 6 GB de VRAM si se usa cuantizacion.
- Despliegue compatible con la libreria transformers y PEFT, asi como con vLLM o TGI si se fusiona el adaptador con el modelo base.
- Para uso en produccion, se recomienda fusionar el adaptador en el modelo base para reducir latencia y simplificar el despliegue.

## Comparativa con modelos similares

No se han encontrado adaptadores LoRA publicos con proposito similar (entrevistas de trabajo eticas en tailandes). La comparacion mas relevante es contra el modelo base sin ajustar:

| Modelo | Parametros | Contexto | Cumplimiento de reglas (prompt largo) | Licencia |
|---|---|---|---|---|
| scb10x/typhoon2.5-qwen3-4b (base) | 4B | 768+ (original) | 30% | Apache-2.0 |
| Lemonade44/nong-trongpok-lora (sobre base) | 4B + LoRA | 768 (entrenamiento) | 88% | Apache-2.0 |

Otras alternativas como GPT-4 o Claude podrian lograr resultados similares con prompts cuidadosos, pero no son de codigo abierto y no ofrecen garantias de privacidad de datos.

## Limitaciones y advertencias

- El modelo base tiene solo 4B parametros, por lo que puede cometer errores factuales o de razonamiento; no debe utilizarse para tomar decisiones de contratacion reales sin supervision humana.
- El entrenamiento se realizo exclusivamente con datos sinteticos generados a partir de plantillas, lo que limita la diversidad de conversaciones reales y puede afectar la generalizacion.
- No se ha probado con usuarios reales a gran escala; el rendimiento en entornos reales puede variar.
- El adaptador solo soporta tailandes; no es util para otros idiomas.
- La longitud de contexto de entrenamiento es de 768 tokens, lo que limita la duracion de las entrevistas; conversaciones mas largas pueden degradar el rendimiento.
- Aunque el modelo resiste prompt injection en las pruebas, no hay garantia absoluta de seguridad frente a ataques avanzados.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece soporte ni garantias.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Lemonade44/nong-trongpok-lora
- Modelo base: https://huggingface.co/scb10x/typhoon2.5-qwen3-4b
