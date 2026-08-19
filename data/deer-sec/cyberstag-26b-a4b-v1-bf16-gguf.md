# deer-sec/CyberStag-26B-A4B-v1-bf16.gguf

## Resumen

CyberStag-26B-A4B-v1 es un modelo de lenguaje especializado en ciberseguridad y razonamiento lógico profundo, desarrollado por el usuario deer-sec. Se basa en el modelo MoE de Google `Gemma-4-26B-A4B` (26 mil millones de parámetros totales, 4 mil millones activos) y ha sido afinado mediante LoRA con la librería MLX de Apple, con los adaptadores ya fusionados en el modelo base. El resultado es un motor de razonamiento orientado a profesionales de seguridad, analistas SOC y administradores de sistemas, capaz de abordar modelado de amenazas, evaluación de vulnerabilidades, interpretación de logs y diseño de estrategias de respuesta a incidentes.

El modelo es exclusivamente de texto, no procesa imágenes ni audio, y se distribuye bajo licencia Apache 2.0. Está disponible en múltiples formatos: MLX (bf16 y optiq8) para Apple Silicon y GGUF (f16, Q8_0 y Q4_K_M) para llama.cpp y LM Studio. La model card indica mejoras frente al modelo base en calidad de respuesta y profundidad de razonamiento, a costa de un ligero aumento en la latencia de generación. Su relevancia actual radica en la creciente demanda de asistentes de IA especializados en defensa cibernética y análisis forense, con un enfoque claro en uso ético y educativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Gemma-4-26B-A4B |
| Parametros totales | 26B (25.23B según la model card) |
| Parametros activos | 4B (A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (MLX), optiq8 (MLX), f16 (GGUF), Q8_0 (GGUF), Q4_K_M (GGUF) |
| Idiomas soportados | multilingual (en, ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) y GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Gemma-4-26B-A4B`, un transformer basado en mezcla de expertos (MoE) con 26B parámetros totales y 4B activos por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. Sobre esta base, deer-sec aplicó un afinamiento con `mlx_lm.lora`, actualizando de forma estratégica y amplia los mecanismos de atención y MLP (incluyendo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y capas de expertos). Se entrenaron aproximadamente 448.7 millones de parámetros, lo que representa un 1.778% del total, y los adaptadores LoRA se fusionaron completamente en el modelo base para facilitar su despliegue.

El conjunto de datos de entrenamiento es un dataset curado y destilado centrado en conceptos avanzados de ciberseguridad, inteligencia de amenazas, deducción lógica y escenarios de seguridad complejos. Los detalles específicos del dataset no se han hecho públicos para preservar la integridad del modelo y evitar usos indebidos. La estrategia de entrenamiento incluyó una gestión optimizada del contexto para evitar el olvido catastrófico, manteniendo las capacidades generales del modelo base mientras se especializaba en el dominio de seguridad.

## Capacidades

- Generacion de texto especializado en ciberseguridad: analisis de vectores de ataque, modelado de amenazas, evaluacion de vulnerabilidades y propuesta de mitigaciones.
- Razonamiento logico profundo y paso a paso: el modelo muestra una tendencia a dedicar mas tiempo de "pensamiento" antes de responder, lo que se traduce en deducciones mas estructuradas y analiticas.
- Interpretacion de logs y registros de sistema: capaz de examinar trazas de acceso, logs de servidor y otros artefactos para detectar patrones anomalos o indicios de intrusion.
- Soporte de tool calling: no se menciona explicitamente en la informacion disponible, por lo que se considera no confirmado.
- Capacidades multilingues: soporta ingles y japones, ademas de otros idiomas dentro de la etiqueta "multilingual".
- Solo texto: no procesa imagenes, audio ni otros tipos de entrada multimodal.

## Casos de uso

- Analisis de logs de servidor para deteccion de inyecciones SQL: el modelo puede examinar trazas de acceso y señalar patrones sospechosos como peticiones malformadas o parametros anómalos, facilitando la identificacion de intentos de explotacion.
- Evaluacion de vulnerabilidades en aplicaciones web: dado un fragmento de codigo o una descripcion de un endpoint, el modelo puede enumerar posibles debilidades (CSRF, XSS, inyeccion) y sugerir estrategias de mitigacion concretas.
- Modelado de amenazas en entornos empresariales: a partir de una descripcion de la infraestructura y los activos criticos, el modelo puede generar diagramas de ataque potenciales y priorizar riesgos segun impacto y probabilidad.
- Redaccion de planes de respuesta a incidentes: el modelo estructura guias paso a paso para contener, erradicar y recuperarse de incidentes de seguridad, adaptadas al contexto descrito por el analista.
- Interpretacion de alertas de SIEM y correlacion de eventos: al recibir multiples alertas o eventos de seguridad, el modelo puede relacionarlos y proponer una hipotesis unificada sobre el curso del ataque.
- Formacion y concienciacion en seguridad: el modelo puede generar escenarios de simulacion, preguntas de examenes o materiales didacticos para equipos de seguridad, basados en casos reales y tecnicas conocidas.
- Soporte a administradores de sistemas en hardening: el modelo puede revisar configuraciones de servicios (SSH, firewalls, bases de datos) y recomendar ajustes de endurecimiento siguiendo buenas practicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona mejoras cualitativas frente al modelo base en contextos de ciberseguridad, sin cifras concretas de MMLU, HumanEval u otras metricas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no se proporcionan cifras exactas, pero al tratarse de un modelo MoE de 26B totales y 4B activos, las necesidades dependen de la cuantizacion. La version Q4_K_M (GGUF) es la recomendada por el autor para entornos con VRAM limitada, y podria ejecutarse en GPUs consumer con 12-16 GB de VRAM, aunque no hay datos confirmados.
- GPU recomendadas: para la version bf16 o f16 se requieren GPUs de alta capacidad (por ejemplo, A100, H100 o multiples RTX 4090); para Q4_K_M bastaria una RTX 4080/4090 o similar con suficiente VRAM.
- Compatibilidad con hardware consumer: probablemente si con la cuantizacion Q4_K_M, siempre que se disponga de al menos 12-16 GB de VRAM.
- Opciones de despliegue: llama.cpp, LM Studio y cualquier frontend compatible con GGUF; tambien se puede usar con MLX en Apple Silicon mediante `mlx_lm`.
- Latencia y throughput: no se han publicado datos. La model card advierte de un ligero aumento en el tiempo de "pensamiento" en comparacion con el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberStag-26B-A4B-v1 | 26B (4B activos) | no disponible | Ciberseguridad | Apache 2.0 | MLX, GGUF |
| Gemma-4-26B-A4B (base) | 26B (4B activos) | no disponible | General | Apache 2.0 | MLX, GGUF |
| Otros modelos de seguridad | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con otros modelos especializados en ciberseguridad. La unica comparacion fiable es contra el modelo base del que deriva, y la model card afirma una mejora cualitativa en calidad de respuesta y profundidad de razonamiento para tareas de seguridad.

## Limitaciones y advertencias

- Modelo exclusivamente de texto: no procesa imagenes, audio ni otros formatos multimodales.
- Riesgo de alucinacion: como cualquier LLM, puede generar respuestas plausibles pero incorrectas, especialmente en escenarios de seguridad muy especificos o poco documentados.
- Datos de entrenamiento confidenciales: no se ha publicado el dataset de afinamiento, lo que dificulta auditar posibles sesgos o lagunas de conocimiento.
- Idioma limitado: aunque se etiqueta como "multilingual", la model card destaca ingles y japones; el rendimiento en otros idiomas no esta garantizado.
- Restricciones de uso: el autor prohibe explicitamente el uso para acceso no autorizado, generacion de exploits o cualquier actividad delictiva. Solo se permite para investigacion educativa y defensiva.
- Latencia aumentada: el modelo tiende a dedicar mas tiempo al razonamiento antes de responder, lo que puede ser un inconveniente en aplicaciones que requieran respuestas en tiempo real.
- Sin benchmarks publicados: no hay metricas objetivas que respalden las afirmaciones de mejora de rendimiento.
- Modelo nuevo y sin adopcion: cuenta con 0 descargas y 0 likes en HuggingFace, por lo que no hay retroalimentacion de la comunidad ni casos de uso validados en produccion.

## Enlaces

- [HuggingFace - CyberStag-26B-A4B-v1-bf16.gguf](https://huggingface.co/deer-sec/CyberStag-26B-A4B-v1-bf16.gguf)
- [Modelo base: google/gemma-4-26b-a4b](https://huggingface.co/google/gemma-4-26b-a4b) (no verificado)
- No se han encontrado papers, repositorios adicionales o demos vinculados al modelo.
