# nyxspecter4/kin-cybersecurity-3b-gguf

## Resumen

KIN Cyber SFT LoRA GGUF (identificador `nyxspecter4/kin-cybersecurity-3b-gguf`) es un ajuste fino orientado a ciberseguridad de **Qwen2.5-3B-Instruct**, convertido a formato GGUF para su ejecución local. Lo desarrolla el usuario nyxspecter4 y su propuesta es llevar asistencia conversacional especializada en seguridad —análisis de amenazas, detección, respuesta a incidentes, análisis de malware— a un portátil, sin depender de APIs externas ni de infraestructura de GPU dedicada.

El modelo tiene 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) y se distribuye en dos cuantizaciones: Q4_K_M (1,9 GB) y Q8_0 (3,3 GB), con un repositorio total de 5,2 GB. Se apoya en el tokenizador y la arquitectura del modelo base, y su interés práctico radica en que el fine-tune se entrenó sobre el dataset `nyxspecter4/kin-cyber-dpo-v2`, formado por 1.635 pares DPO, con un estilo de respuesta deliberadamente directo y lleno de referencias concretas a productos, herramientas y CVEs.

La relevancia actual de este tipo de artefacto es doble. Por un lado, demuestra un flujo de trabajo reproducible y de bajo coste (Unsloth + TRL, LoRA, fusión de pesos, conversión a GGUF) sobre una base de 3B con licencia Apache 2.0. Por otro, ilustra los riesgos de la especialización en seguridad: el propio autor advierte que temperaturas altas producen "números de CVE y nombres de herramientas plausibles pero incorrectos", lo que convierte la verificación humana en un requisito operativo, no en una recomendación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Qwen2.5-3B-Instruct (detalle completo de capas y dimensiones no disponible en la informacion proporcionada) |
| Parametros totales | 3.085.938.688 (dato real, safetensors del modelo base) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la model card para este fine-tune; el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens. Los ejemplos del autor usan 8192 (`--ctx-size 8192`) y 4096 (`n_ctx=4096`) |
| Tipos de cuantizacion | Q4_K_M (1,9 GB) y Q8_0 (3,3 GB) |
| Idiomas soportados | Ingles (`en`) unicamente, segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (la version con pesos fusionados en safetensors esta en el repositorio hermano `nyxspecter4/kin-sft-lora`) |

Datos adicionales: entrenado con LoRA de rango 8 y alpha 16 sobre 4 modulos de atencion (v1), pesos fusionados, framework Unsloth + TRL. Descargas: 122. "Likes": 0. Creado el 31 de agosto de 2026, actualizado el 11 de septiembre de 2026.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only denso con atención completa, orientado a instrucciones y conversación. La model card no publica el recuento de capas, la dimensión oculta, el número de cabezas de atención ni el detalle del tokenizador, por lo que no es posible detallar la configuración interna sin inventar datos. Tampoco se indica el número de tokens vistos durante el entrenamiento ni la composición del dataset de ajuste más allá de su nombre y su tamaño.

En cuanto al procedimiento, el autor describe un ajuste mediante LoRA de rango 8 y alpha 16 aplicado sobre 4 módulos de atención, con fusión posterior de los pesos del adaptador en el modelo base y conversión a GGUF. El entrenamiento se realizó sobre `nyxspecter4/kin-cyber-dpo-v2`, un conjunto de 1.635 pares DPO. Conviene señalar una ambigüedad: el artefacto se denomina "SFT LoRA" pero el dataset citado son pares DPO, y no se documenta si existió una fase SFT previa, qué proporción del entrenamiento fue DPO ni qué hiperparámetros se usaron. La model card anuncia una v2 con rango 16, alpha 32 y 7 módulos all-linear, marcada como pendiente, de modo que estos pesos corresponden a la v1.

No se documenta ninguna innovación técnica en inferencia (decodificación especulativa, atención lineal, decodificación restringida por gramática, etc.). El control de calidad se apoya principalmente en dos decisiones de uso: un system prompt fijo y una temperatura recomendada de 0,3.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline declarado `text-generation` y formato de chat.
- Asistencia especializada en ciberseguridad: los tags del repositorio cubren threat intelligence, red team, blue team, seguridad defensiva y ofensiva, SIEM, EDR, DFIR y análisis de malware.
- Referencia a marcos y catálogos del sector: MITRE ATT&CK y OWASP aparecen como etiquetas del modelo, y el system prompt pide nombrar productos concretos ("CrowdStrike Falcon", "Duo push MFA") en lugar de categorías genéricas.
- Estilo de respuesta pautado: el autor entrena al modelo para abrir con la opinión más directa, nombrar herramientas y CVEs, y cerrar con una acción concreta, en un máximo de dos o tres párrafos.
- Integración como endpoint compatible con OpenAI mediante `llama-server --jinja`, lo que habilita clientes que esperan el esquema `/v1`.
- Ejecución local en CPU o GPU discreta a través de Ollama y llama.cpp.
- Capacidad de tool calling / function calling: no confirmada explícitamente en la model card. El tag `endpoints_compatible` y la compatibilidad con el servidor de llama.cpp con plantilla Jinja la hacen plausible, pero no hay documentación que la acredite.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (visión, audio): no disponibles. Es un modelo exclusivamente de texto.
- Modo "thinking" o razonamiento extendido explícito: no documentado.

## Casos de uso

- **Triaje de alertas en un SOC**: el modelo puede resumir y priorizar alertas provenientes de SIEM o EDR y proponer el siguiente paso de investigación, ejecutándose en el mismo portátil del analista con Q4_K_M (1,9 GB) y sin enviar telemetría sensible a terceros.
- **Apoyo a la respuesta a incidentes (DFIR)**: dado un conjunto de artefactos descritos en texto (entradas de registro, procesos sospechosos, persistencia), el modelo genera hipótesis de compromiso y una lista de comprobaciones en orden de prioridad, gracias a su entrenamiento en vocabulario de respuesta a incidentes.
- **Explicación de vulnerabilidades para equipos no especialistas**: traducir un aviso de CVE o un informe técnico a lenguaje operativo, con impacto, condiciones de explotación y mitigación. Requiere verificación obligatoria del identificador del CVE contra la fuente oficial.
- **Asistente de estudio para certificaciones y formación interna**: generar preguntas, explicar diferencias entre controles, describir tácticas de MITRE ATT&CK o categorías de OWASP, en un entorno totalmente offline y con coste cero de API.
- **Borradores de reglas de detección**: proponer reglas en formato Sigma, consultas KQL o reglas YARA a partir de una descripción de comportamiento, para que el analista las revise y las pruebe antes de desplegarlas.
- **Generación de *playbooks* y documentación**: redactar procedimientos de respuesta, listas de verificación de endurecimiento o informes post-incidente con el tono directo y orientado a la acción que el autor ha entrenado.
- **Chatbot interno de concienciación en seguridad**: desplegado con Ollama en la red corporativa, respondiendo dudas de empleados sobre phishing, contraseñas o manejo de datos, con la ventaja de que ningún dato sale de la organización.
- **Análisis exploratorio de malware en un entorno aislado**: ayudar a interpretar la salida de herramientas de análisis estático o dinámico y a estructurar un informe técnico. Nunca debe ejecutarse el modelo como sustituto del sandbox.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench, evaluaciones específicas de ciberseguridad ni comparaciones cuantitativas con otros modelos. Tampoco se documentan métricas de rendimiento del conjunto de validación del dataset DPO.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuación son estimaciones a partir de los tamaños de fichero publicados, no mediciones del autor.

- **Q4_K_M (1,9 GB de pesos)**: cabe con holgura en cualquier GPU consumer con 4 GB o más de VRAM. Con contexto de 8192 tokens, la VRAM total esperada ronda los 2,5-3,5 GB, según el tamaño del *batch* y de la caché KV.
- **Q8_0 (3,3 GB de pesos)**: requiere aproximadamente 4-5 GB de VRAM con contexto moderado. Cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes.
- **Ejecución en CPU**: viable. El repositorio completo ocupa 5,2 GB y la versión Q4_K_M (1,9 GB) puede ejecutarse íntegramente en RAM, tal como indica el autor al afirmar que funciona en un portátil.
- **GPU profesionales**: A100, H100, L40S y similares son enormemente sobredimensionadas para 3B de parámetros; su uso solo tendría sentido por agregación de muchas instancias concurrentes.
- **Opciones de despliegue**: Ollama (`ollama pull nyxspecter4/kin-sft-lora-gguf:Q4_K_M`), llama.cpp mediante `llama-server` con `--jinja --temp 0.3`, y llama-cpp-python con `Llama.from_pretrained`. El autor configura `--n-gpu-layers 99` para descargar todas las capas en GPU.
- **Latencia y throughput**: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| KIN Cyber SFT LoRA GGUF | 3,09 B | No especificado para el fine-tune; 32.768 en el modelo base | Apache 2.0 | Ciberseguridad (fine-tune DPO sobre 1.635 pares) | GGUF en HuggingFace; safetensors en repositorio hermano |
| Qwen2.5-3B-Instruct (modelo base) | 3,09 B | 32.768 tokens | Apache 2.0 (licencia del base; no confirmada en esta ficha) | Proposito general, instrucciones y conversacion. | safetensors, GGUF de terceros |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Proposito general, instrucciones y conversacion | safetensors, GGUF oficiales |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | Proposito general, con enfasis en razonamiento y codigo | safetensors, GGUF de terceros |

La comparación cuantitativa de calidad no es posible: el autor no publica ningún benchmark de KIN frente a estos modelos. La ventaja diferencial de este artefacto es la especialización temática y el formato GGUF listo para Ollama; sus desventajas son el menor tamaño de comunidad (122 descargas, 0 "likes" en el momento de la consulta), la ausencia de evaluación publicada y el soporte exclusivo de inglés.

## Limitaciones y advertencias

- **Alucinación de identificadores técnicos**: el propio autor advierte que temperaturas superiores a 0,3 producen "números de CVE y nombres de herramientas plausibles pero incorrectos". Cualquier CVE, nombre de producto, versión o comando generado debe verificarse contra una fuente autoritativa antes de usarse.
- **Dependencia de un system prompt concreto**: la model card afirma explícitamente que usar otro system prompt degrada la calidad. El prompt recomendado impone tono, longitud y estilo ("máximo dos o tres párrafos", "abre con tu opinión"), lo que limita el control fino del formato de salida.
- **Solo inglés**: el campo `language` declara únicamente `en`. No hay evidencia de soporte para castellano ni para otros idiomas, y el ajuste fino sobre un dataset en inglés probablemente degrada el multilingüismo residual del modelo base.
- **Ambigüedad en la documentación del entrenamiento**: el artefacto se llama "SFT LoRA" pero se entrenó sobre pares DPO; no se detalla la secuencia de fases ni los hiperparámetros completos, lo que dificulta reproducir el resultado.
- **Discrepancia de identificadores**: la model card usa `nyxspecter4/kin-sft-lora-gguf` en los comandos de Ollama y llama.cpp, mientras que el repositorio es `nyxspecter4/kin-cybersecurity-3b-gguf`. Conviene comprobar cuál resuelve correctamente antes de automatizar descargas.
- **Capacidad limitada por tamaño**: con 3,09 B de parámetros, el modelo tiene un techo claro en razonamiento complejo, matemáticas y código extenso. No es adecuado para análisis autónomo de malware, generación de exploits funcionales ni tareas que requieran cadenas de razonamiento largas.
- **Contenido de doble uso**: los tags incluyen seguridad ofensiva y red team. El despliegue en entornos corporativos debe ir acompañado de registro de peticiones, políticas de uso aceptable y revisión legal, ya que las respuestas pueden describir técnicas de ataque.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero el modelo deriva de Qwen2.5-3B-Instruct, por lo que conviene confirmar también las condiciones del modelo base para el caso de uso previsto.
- **Sin evaluación independiente**: no hay benchmarks, auditorías ni informes de sesgo. Las 122 descargas y 0 "likes" indican una adopción muy reducida y, por tanto, escasa validación por parte de la comunidad.
- **Versión pendiente**: la v2 anunciada (rango LoRA 16, alpha 32, 7 módulos all-linear) aún no estaba publicada en el momento de la consulta; los pesos descritos aquí corresponden a la v1.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/nyxspecter4/kin-cybersecurity-3b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio hermano con pesos fusionados en safetensors: https://huggingface.co/nyxspecter4/kin-sft-lora
- Dataset de entrenamiento (DPO): https://huggingface.co/datasets/nyxspecter4/kin-cyber-dpo-v2
- Demo en Gradio: https://huggingface.co/spaces/nyxspecter4/kin-cybersec

Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (se refieren a salas de chat genéricas y de contenido para adultos). No se han encontrado papers, blogs técnicos, repositorios de código ni artículos de terceros sobre este modelo, por lo que no se incluyen más enlaces.
