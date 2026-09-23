# astroos/meena-3-antigravity-cot

## Resumen

Meena 3 Antigravity CoT es un adaptador LoRA de tipo PEFT publicado por astroos sobre el modelo base Qwen2.5-7B-Instruct (en su versión cuantizada a 4 bits de unsloth). No es un modelo completo, sino un ajuste fino de dominio orientado a astrología védica (jyotisha) que incorpora un protocolo explícito de cadena de pensamiento dentro de las etiquetas `<think>...</think>`. El adaptador tiene rango 16 y se entrenó con QLoRA de 4 bits sobre 15.000 pares de razonamiento shástrico verificados.

Su relevancia es de nicho: no compite en capacidades generales con los modelos frontera, sino que demuestra un patrón de especialización vertical, inyectar un protocolo de razonamiento de siete pasos en los pesos mediante un adaptador ligero (según estimación a partir de la configuración declarada, unos 40 M de parámetros adicionales sobre 7,61 B del base) y mantener la licencia Apache 2.0 del modelo original.

La ficha se basa exclusivamente en la información publicada: la model card no incluye resultados de benchmarks, ni evaluación de seguridad, ni detalles sobre la composición exacta del corpus de entrenamiento más allá del número de pares y su tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct (RoPE, SwiGLU, RMSNorm y Grouped Query Attention en el base) |
| Parámetros totales | 7,61 B en el modelo base; adaptador LoRA con r=16 sobre 7 módulos (estimación propia: ≈40 M de parámetros, no confirmada por el autor) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens en el base (hasta 131.072 con escalado RoPE/YaRN según Qwen); el autor no documenta modificaciones del contexto |
| Tipos de cuantización | Base entrenado en 4 bits (bitsandbytes NF4). No se publican versiones GGUF, AWQ ni GPTQ del adaptador |
| Idiomas soportados | en, hi (la model card añade Hinglish conversacional y hindi en devanagari como variantes de uso) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado en bf16, fp16 o 4 bits |

## Arquitectura y entrenamiento

El entrenamiento se realizó con QLoRA de 4 bits mediante Unsloth sobre `unsloth/Qwen2.5-7B-Instruct-bnb-4bit`. La configuración del adaptador es r=16, alpha=16 y dropout=0, aplicada a los siete módulos de proyección del transformer: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El dataset declarado es `astroosmb/meena-antigravity-cot-dataset`, con 15.000 pares de cadena de pensamiento shástrica verificada y 104 MB. El autor indica que se entrenó hasta la convergencia óptima de la pérdida en una Nvidia Tesla T4, sin especificar número de épocas, pasos, tasa de aprendizaje ni curvas de validación. No se documenta RLHF, DPO ni ninguna etapa de alineación adicional: el ajuste es exclusivamente supervisado sobre pares de razonamiento.

La innovación técnica que se anuncia es la inclusión del protocolo de razonamiento dentro de los pesos, con un esquema de siete pasos previos a la respuesta: verificación del Lagna, señoríos funcionales, diferenciación entre benéficos y maléficos naturales y funcionales, retrogradación y dignidad planetaria, cancelación de yogas, vargas divisionales (D9/D10) y cronología por dasha-gochara. El término "antigravity" es una marca del proyecto y no describe ninguna técnica de arquitectura o de decodificación. El modelo no incorpora cálculo astronómico: no dispone de efemérides ni de motor de posiciones planetarias, por lo que las posiciones deben aportarse calculadas desde fuera.

## Capacidades

- Generación de texto conversacional en inglés, hindi en devanagari y Hinglish, con registro de consulta astrológica.
- Razonamiento explícito en dos fases mediante las etiquetas `<think>...</think>`, lo que permite auditar el proceso antes de la respuesta final.
- Aplicación de reglas de jyotisha: señoríos funcionales, dignidades, retrogradación, yogas, vargas divisionales y sistemas de dasha.
- Mantenimiento de conversaciones multi-turno con historial de consulta gracias a la ventana de 32.768 tokens del base (según la configuración heredada, no verificada en este adaptador).
- Estilo de respuesta sin muletillas prefabricadas ni citas sánscritas sin traducir, según declara el autor.
- No hay evidencia publicada de soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso fuera del protocolo astrológico, visión, audio ni modo thinking configurable en runtime.
- No hay evidencia de soporte de castellano: los idiomas declarados son en e hi.

## Casos de uso

- Consulta astrológica védica asistida: el modelo recibe los datos de nacimiento ya calculados (posiciones, Lagna, dasha vigente) y produce un análisis paso a paso que el consultante o el astrólogo puede revisar, ya que el bloque `<think>` expone el razonamiento intermedio.
- Motor de razonamiento de una aplicación de astrología: integrado como adaptador sobre Qwen2.5-7B-Instruct en un backend con vLLM, permite servir a muchos usuarios compartiendo el mismo modelo base y cargando el adaptador por petición.
- Generación de informes de carta natal y cronología de dasha: con contexto de 32.768 tokens se pueden incluir datos de múltiples sistemas divisionales (D1, D9, D10) en una sola petición y obtener un informe estructurado.
- Atención al cliente en hindi y Hinglish: para servicios de consultoría dirigidos a audiencias de India, el modelo cubre la conversación multi-turno en el idioma del usuario sin traducción intermedia.
- Evaluación y auditoría de razonamiento de dominio: los pares CoT generados permiten construir conjuntos de prueba para comprobar si otros modelos reproducen las mismas reglas, o detectar atajos y respuestas genéricas.
- Generación de material didáctico para estudiantes de jyotisha: explicaciones graduadas de por qué se aplica cada regla, útiles en plataformas de formación.
- Enriquecimiento de datasets: uso del modelo para etiquetar o reescribir textos astrológicos con formato de razonamiento explícito, con revisión humana posterior por el riesgo de alucinación.
- Prototipado de verticales de nicho: sirve como plantilla reproducible (Unsloth + QLoRA + adaptador) para equipos que quieran medir cuánto rendimiento se obtiene de un ajuste ligero de dominio sobre un base de 7 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna evaluación específica de jyotisha, ni comparaciones contra el modelo base o contra alternativas. Tampoco se aportan métricas de pérdida final, número de pasos de entrenamiento o curvas de validación.

## Requisitos de hardware

- Inferencia en bf16 o fp16: aproximadamente 15,2 GB solo para los pesos del base, más caché KV (con GQA de 4 cabezas KV y 28 capas, en torno a 1,8 GB para 32.000 tokens). En la práctica requiere GPU de 24 GB o más.
- Inferencia en 4 bits (NF4): en torno a 4,5-5,5 GB de pesos más caché KV; viable en GPU de 8-12 GB para contextos moderados.
- Adaptador: peso despreciable en el cómputo total, pero obliga a cargar el modelo base en memoria.
- GPU recomendadas: A100 40/80 GB y H100 80 GB para servicio en bf16 con contexto largo; RTX 4090 o RTX 3090 (24 GB) para bf16 en un solo usuario o 4 bits con concurrencia; RTX 3060 12 GB, RTX 4060 Ti 16 GB o T4 16 GB para 4 bits.
- Entrenamiento: el autor lo realizó en una Nvidia Tesla T4. Conviene señalar que la arquitectura Turing no soporta bf16 de forma nativa, por lo que ese entrenamiento se hizo en fp16 con cuantización de 4 bits.
- Despliegue: transformers + peft es la ruta documentada en la model card; vLLM admite múltiples adaptadores LoRA sobre un mismo base; TGI también soporta adaptadores. Para llama.cpp u Ollama sería necesario fusionar el adaptador con el base y convertir a GGUF, algo que el autor no publica.
- Latencia y throughput: no disponibles. No hay cifras de tokens por segundo ni de concurrencia publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| Meena 3 Antigravity CoT | 7,61 B base + LoRA r=16 | 32.768 tokens (heredado) | Jyotisha (astrología védica) | apache-2.0 | No |
| Qwen2.5-7B-Instruct | 7,61 B | 32.768 tokens, ampliable a 131.072 con YaRN | Generalista y multilingüe | apache-2.0 | Sí, en la documentación de Qwen |
| Llama-3.1-8B-Instruct | 8,03 B | 131.072 tokens | Generalista | Llama 3.1 Community License | Sí, en la model card de Meta |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens | Generalista | apache-2.0 | Sí, en la documentación de Mistral |

No se conocen adaptadores públicos comparables centrados en jyotisha con métricas publicadas. Existen ajustes de dominio en astronomía científica (por ejemplo, la familia AstroLLaMA), pero abordan una tarea distinta: procesamiento de literatura astronómica, no interpretación astrológica. Para cualquier comparación cuantitativa con Meena 3 habría que construir un conjunto de evaluación propio, dado que no hay cifras publicadas por el autor.

## Limitaciones y advertencias

- Ausencia total de evaluación: sin benchmarks, sin métricas de pérdida finales y sin comparación con el modelo base, no es posible cuantificar cuánto aporta el ajuste ni cuánto degrada capacidades generales.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Dominio no falsable: las afirmaciones astrológicas no tienen verdad de referencia verificable, por lo que el modelo puede producir interpretaciones coherentes y bien argumentadas que no responden a ningún criterio objetivo.
- Riesgo alto de alucinación factual: nombres de yogas, referencias a textos clásicos, combinaciones planetarias o reglas de dasha pueden inventarse con apariencia de rigor, especialmente en el bloque de razonamiento.
- El modelo no calcula posiciones planetarias: no incluye efemérides. Cualquier sistema en producción debe calcular las posiciones con software especializado (por ejemplo, Swiss Ephemeris) y pasarlas como entrada; si no se hace así, el modelo inventará datos astronómicos.
- Uso indebido como asesoramiento: no debe emplearse para decisiones médicas, financieras, legales o psicológicas, ni presentarse al usuario como orientación profesional en esos ámbitos.
- Idiomas: solo se declaran en e hi. El castellano no está soportado explícitamente y, aunque Qwen2.5 cubre 29 idiomas, no hay evidencia de que el ajuste haya preservado esa cobertura.
- Sesgos: se desconoce la composición del dataset más allá del número de pares. Es probable una sobrerrepresentación de fuentes modernas en inglés e hindi y de determinadas escuelas de interpretación, sin auditoría de sesgos de género, casta, clase o religión.
- Licencia: el adaptador es apache-2.0 y el base Qwen2.5-7B-Instruct también, por lo que el uso comercial es posible. Aun así, conviene revisar las condiciones del cuantizado de Unsloth si se redistribuye el modelo fusionado, y citar correctamente ambos proyectos.
- Formato de entrega: al ser un adaptador PEFT, no es autocontenido. Requiere el base, y no hay GGUF publicado, lo que complica el despliegue en entornos de CPU o en herramientas como Ollama.
- Contexto limitado a 32.768 tokens: insuficiente para historiales de consulta muy largos combinados con muchos vargas; la ampliación a 131.072 tokens depende del base y no está verificada en este adaptador.
- Sin model card de seguridad: no se documentan filtros de contenido, taxonomía de rechazos ni evaluación de riesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/astroos/meena-3-antigravity-cot
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Base cuantizado usado en el entrenamiento: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Dataset declarado: https://huggingface.co/datasets/astroosmb/meena-antigravity-cot-dataset
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- PEFT (librería del adaptador): https://github.com/huggingface/peft
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Documentación de soporte LoRA en vLLM: https://docs.vllm.ai/en/latest/features/lora.html
