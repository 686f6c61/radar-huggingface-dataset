# Aaqisher667/llama-3.2-1b-cyber-qdora-finetuned

## Resumen

`Aaqisher667/llama-3.2-1b-cyber-qdora-finetuned` es un adaptador PEFT, no un modelo completo, publicado el 19 de septiembre de 2026 por el usuario Aaqisher667 en Hugging Face. Se monta sobre `unsloth/llama-3.2-1b-instruct-unsloth-bnb-4bit`, es decir, el Llama 3.2 1B Instruct de Meta cuantizado a 4 bits con bitsandbytes y preparado para entrenamiento acelerado con Unsloth. El repositorio ocupa 0,1 GB, lo que confirma que contiene únicamente los pesos del adaptador y no una fusión con el modelo base.

La nomenclatura del repositorio sugiere dos cosas que la model card no confirma: el sufijo `cyber` apunta a un ajuste fino orientado a ciberseguridad, y `qdora` apunta a DoRA cuantizado (weight-decomposed low-rank adaptation), una variante de LoRA que descompone la actualización en magnitud y dirección. Los tags publicados respaldan parcialmente esa lectura (`lora`, `sft`, `unsloth`, `trl`, `peft`), pero no hay descripción técnica, dataset, hiperparámetros ni evaluación en la documentación.

Su relevancia es metodológica más que funcional: ilustra el flujo actual de especialización de un modelo de ~1.200 millones de parámetros en hardware de consumo mediante SFT con adaptadores de bajo rango sobre una base cuantizada. Con 0 descargas y 0 "me gusta" en el momento de redactar esta ficha, y con una model card que es la plantilla por defecto de Hugging Face sin rellenar, debe tratarse como un artefacto experimental no validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Llama 3.2 1B) con adaptador PEFT de bajo rango (LoRA/DoRA, inferido del nombre del repositorio; no confirmado en la documentación) |
| Parámetros totales | No disponible para el adaptador. El modelo base declarado tiene 1.235.814.400 parámetros (~1,24 B) |
| Parámetros activos | No aplica: la arquitectura no es MoE |
| Longitud de contexto | No documentada para el adaptador. El modelo base Llama 3.2 1B soporta 128.000 tokens |
| Tipos de cuantización | Base en 4 bits (bitsandbytes, perfil `bnb-4bit`, según el identificador del modelo base). El adaptador se distribuye en safetensors con precisión no documentada. No se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible para el adaptador. El modelo base Llama 3.2 declara 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | No disponible. El modelo base se rige por la Llama 3.2 Community License, cuyos términos se propagan a las obras derivadas |
| Formato de pesos | safetensors (adaptador PEFT). Requiere descargar y cargar el modelo base por separado |
| Librería | PEFT (entrenado con Unsloth y TRL; la model card declara PEFT 0.20.0) |
| Tamaño del repositorio | 0,1 GB |
| Pipeline declarado | text-generation |
| Fecha de publicación | 19 de septiembre de 2026 |
| Descargas / "me gusta" | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es Llama 3.2 1B Instruct, un transformer decoder-only denso de 16 capas, dimensión oculta 2.048, 32 cabezas de atención y 8 cabezas KV (Grouped Query Attention, con head_dim de 64), normalización RMSNorm, activación SwiGLU y embeddings rotatorios RoPE sobre un vocabulario de 128.256 tokens. Meta lo entrenó sobre hasta 9 billones de tokens procedentes de la mezcla de datos de Llama 3.1, con destilación de logits desde Llama 3.1 8B y 405B, y un corte de conocimiento declarado en diciembre de 2023. El pipeline de instrucciones incluye SFT, rechazo de muestras y DPO.

Sobre esa base cuantizada a 4 bits, el autor aplicó un ajuste supervisado (SFT) con adaptadores de bajo rango usando el stack Unsloth + TRL + PEFT. El nombre del repositorio indica una variante QDoRA, es decir, DoRA aplicado sobre pesos cuantizados, que descompone cada matriz de pesos en un componente de magnitud y otro de dirección para aproximar mejor el comportamiento de un ajuste completo con muchos menos parámetros entrenables. No se documenta el dataset utilizado, el número de ejemplos, el rango del adaptador, la tasa de aprendizaje, las épocas ni si hubo etapas posteriores de preferencia. Tampoco se especifica si el adaptador se entrenó con las capas de atención, las proyecciones MLP o ambas.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada del modelo base Llama 3.2 1B Instruct.
- Presunta especialización en dominio de ciberseguridad por el sufijo `cyber` del repositorio; no hay ninguna evaluación que lo respalde ni descripción del corpus empleado.
- Soporte multilingüe limitado a los 8 idiomas del modelo base; no hay evidencia de que el ajuste fino haya preservado o ampliado esa cobertura.
- Capacidad de seguir instrucciones y mantener diálogo multiturno, condicionada a la ventana de contexto que herede de la base (hasta 128.000 tokens según la configuración de Llama 3.2 1B).
- Soporte de function calling y tool calling en el modelo base Llama 3.2 Instruct, con la salvedad de que un ajuste fino de dominio puede degradar esa capacidad si no se preservó en el dataset de entrenamiento.
- No dispone de modo de razonamiento extendido (thinking mode), ni de capacidades de visión, audio o generación de imágenes.
- El razonamiento multi-paso y las capacidades aritméticas están fuertemente limitados por el tamaño de 1B parámetros.
- No hay evidencia publicada de soporte para agentes autónomos ni de uso fiable en cadenas de herramientas de varios pasos.

## Casos de uso

- Triaje y clasificación de alertas de seguridad: el modelo puede etiquetar tickets, alertas SIEM o correos de phishing en categorías predefinidas. Es adecuado por su bajo coste de inferencia y su capacidad de ejecutarse en local, pero requiere validación previa contra un conjunto de pruebas etiquetado, ya que no existe ninguna métrica publicada.
- Generación de borradores de explicaciones sobre vulnerabilidades: dado un identificador CVE o un extracto de aviso, el modelo puede producir un resumen en lenguaje natural para formación interna. Es imprescindible verificar cada dato, porque un modelo de 1B tiende a inventar versiones afectadas, vectores CVSS y referencias.
- Enrutado y preprocesado en pipelines de LLM: actuar como clasificador barato que decide si una consulta se resuelve localmente o se deriva a un modelo mayor. Con ~1,2 B de parámetros y contexto largo, el coste por consulta es muy inferior al de un modelo de 70 B o de una API externa.
- Asistente de consulta en entornos aislados (air-gapped): al ser un adaptador sobre un modelo de 1B, puede desplegarse íntegramente en una estación de trabajo sin conexión, útil en redes OT o laboratorios de seguridad con requisitos de confidencialidad estrictos.
- Generación de borradores de checklists y documentación de cumplimiento: redacción de primeros borradores de políticas, procedimientos o guiones de respuesta a incidentes que después revisa un analista humano.
- Prototipado de flujos de fine-tuning: sirve como plantilla reproducible para experimentar con QDoRA sobre bases cuantizadas en una única GPU de consumo, midiendo el impacto del ajuste de dominio antes de escalar a modelos mayores.
- Normalización y etiquetado de informes de incidentes: extracción de campos estructurados (activo afectado, tipo de amenaza, severidad) a partir de texto libre redactado por analistas, siempre con validación humana posterior.
- Chatbot de concienciación interna: respuestas a preguntas frecuentes de los empleados sobre contraseñas, phishing o uso aceptable de recursos, con la salvedad de que no debe usarse como fuente normativa autorizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio es la plantilla por defecto de Hugging Face y no contiene ninguna sección de evaluación completada, ni datos de MMLU, HumanEval, GSM8K, MT-Bench ni de cualquier otro conjunto de pruebas. Tampoco se documenta una comparación con el modelo base antes y después del ajuste, por lo que no puede cuantificarse ni la ganancia en el dominio objetivo ni la posible degradación en capacidades generales.

## Requisitos de hardware

- Peso del adaptador: ~0,1 GB, según el tamaño del repositorio.
- Peso del modelo base en 4 bits (bitsandbytes NF4): aproximadamente 0,8 GB, más el overhead de las librerías de cuantización.
- Peso del modelo base en fp16/bf16: aproximadamente 2,5 GB para los ~1,24 B de parámetros.
- Caché KV: con 16 capas, 8 cabezas KV y head_dim 64, cada token ocupa unos 32 KiB en fp16. Esto equivale a unos 256 MB para 8.192 tokens y a unos 4 GB para 128.000 tokens, de modo que la ventana máxima de contexto domina el consumo de memoria mucho más que los pesos.
- GPU recomendadas para inferencia: cualquier GPU con 6 GB o más de VRAM, como RTX 3060, RTX 4060, RTX 2070 o superiores. Los modelos A100 o H100 no aportan ventaja para este tamaño.
- Cabe en GPU de consumo: sí, con holgura en 4 bits y con margen suficiente para contextos de decenas de miles de tokens en tarjetas de 8-12 GB. También puede ejecutarse en CPU de forma interactiva por el reducido número de parámetros.
- Opciones de despliegue: `transformers` + `peft` (obligatorio, ya que se trata de un adaptador y no de pesos fusionados); `vLLM` con soporte de adaptadores LoRA; TGI con adaptadores; llama.cpp u Ollama solo si se fusiona el adaptador con la base y se convierte a GGUF, conversión que no se proporciona.
- Latencia y throughput estimados: no disponibles. No hay ninguna medición publicada de tokens por segundo, TTFT ni comportamiento bajo batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.2 1B) | Adaptador PEFT; base de ~1,24 B | No documentado (base: 128.000 tokens) | No disponible | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-1B-Instruct | ~1,24 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente descargado y auditado |
| meta-llama/Llama-3.2-3B-Instruct | ~3,21 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente descargado |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens nativos, extensible a 131.072 | Apache 2.0 | Hugging Face, licencia permisiva para uso comercial |
| google/gemma-2-2b-it | ~2,6 B | 8.192 tokens | Gemma Terms of Use | Hugging Face, con condiciones de uso específicas |

No se dispone de datos comparativos de rendimiento para el adaptador. Las cifras de parámetros y contexto de las alternativas corresponden a sus especificaciones públicas, pero no se reproducen aquí sus resultados de benchmarks por no formar parte de la información proporcionada. La diferencia principal frente a las alternativas es de naturaleza, no de escala: este repositorio es un adaptador de dominio sin evaluar, mientras que las alternativas son modelos instruidos completos con documentación y licencia explícitas.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto sin rellenar, con todos los campos como "[More Information Needed]". No hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- Licencia no declarada: al no especificarse licencia, el uso comercial queda en un limbo legal. Además, el modelo base se rige por la Llama 3.2 Community License, que impone obligaciones de atribución y restricciones propias a cualquier derivado.
- Sin validación externa: 0 descargas y 0 "me gusta" implican que nadie ha reproducido ni auditado el ajuste. No hay pruebas independientes de que la especialización en ciberseguridad exista realmente.
- Riesgo elevado de alucinación en el dominio: los modelos de 1B generan con frecuencia identificadores CVE, vectores de ataque, nombres de herramientas y sintaxis de comandos plausibles pero incorrectos. En un contexto de seguridad, un dato inventado puede derivar en una acción operativa errónea.
- Degradación por ajuste fino: el entrenamiento sobre una base cuantizada a 4 bits, con un dataset de composición desconocida, puede provocar olvido catastrófico y deterioro de capacidades generales como el multilingüismo, las matemáticas o el seguimiento de instrucciones complejas.
- Sesgos y seguridad: hereda los sesgos del modelo base Llama 3.2, que no han sido evaluados ni mitigados en este ajuste. No se documenta ningún proceso de alineación, filtrado de datos peligrosos ni red teaming.
- Ventana de contexto no verificada: aunque la base soporte 128.000 tokens, no hay evidencia de que el ajuste fino preserve el rendimiento en contextos largos, ni de que se entrenara con secuencias de esa longitud.
- Capacidad de razonamiento limitada: 1,24 B de parámetros son insuficientes para tareas de razonamiento multi-paso, planificación de ataques o defensas, análisis de código complejo o matemáticas no triviales.
- Idiomas no documentados: no puede asumirse un rendimiento correcto en español sin una evaluación específica, pese a que el modelo base incluya ese idioma.
- Mantenimiento incierto: la fecha de creación y la de actualización difieren en tres segundos, lo que indica una única subida sin revisiones posteriores.
- Uso responsable: no debe emplearse para generar exploits, malware ni contenido ofensivo real, ni como sustituto de herramientas SAST/DAST, escáneres de vulnerabilidades o asesoramiento profesional certificado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Aaqisher667/llama-3.2-1b-cyber-qdora-finetuned
- Modelo base del adaptador: https://huggingface.co/unsloth/llama-3.2-1b-instruct-unsloth-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Documentación de PEFT: https://huggingface.co/docs/peft
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://huggingface.co/docs/trl
- Paper de DoRA (weight-decomposed low-rank adaptation): https://arxiv.org/abs/2402.09353
- Paper referenciado en el tag `arxiv:1910.09700` (Lacoste et al., estimación de emisiones de carbono en aprendizaje automático): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la plantilla: https://mlco2.github.io/impact

Nota sobre la búsqueda web: las consultas realizadas no devolvieron ningún resultado relacionado con este modelo. Los únicos enlaces recuperados correspondían a páginas de folletos promocionales de una cadena de supermercados húngara, sin relación alguna con el modelo, su autor o su dominio de aplicación. No se han localizado papers, blogs técnicos, repositorios de código ni demos asociados a `llama-3.2-1b-cyber-qdora-finetuned`.
