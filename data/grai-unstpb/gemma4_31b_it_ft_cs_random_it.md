# GRAI-UNSTPB/gemma4_31b_it_ft_cs_random_it

## Resumen

GRAI-UNSTPB/gemma4_31b_it_ft_cs_random_it es un adaptador LoRA (PEFT) publicado por el grupo GRAI de la Universidad Nacional de Ciencia y Tecnología POLITEHNICA de Bucarest, entrenado mediante SFT sobre el modelo base unsloth/gemma-4-31B-it-unsloth-bnb-4bit, es decir, una versión instruccional de 31 000 millones de parámetros de la familia Gemma 4 distribuida ya cuantizada en 4 bits con bitsandbytes.

El artefacto no es un modelo completo: el repositorio contiene únicamente los pesos del adaptador en formato safetensors (0,5 GB), por lo que su uso requiere descargar el modelo base y cargarlo mediante la librería PEFT. El pipeline declarado es text-generation con orientación conversacional, y las etiquetas indican que el entrenamiento se realizó con el stack Unsloth + TRL + Transformers.

La relevancia de esta ficha es limitada pero informativa: la model card es una plantilla sin rellenar (todos los campos figuran como "[More Information Needed]"), no se declaran licencia, idiomas, dataset de entrenamiento ni hiperparámetros, y el repositorio acumula 0 descargas y 0 likes. Se trata, por tanto, de un experimento de ajuste fino no documentado y no validado públicamente, cuya evaluación debe hacerse por cuenta del usuario antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; el adaptador LoRA se aplica sobre el modelo base `unsloth/gemma-4-31B-it-unsloth-bnb-4bit` (familia Gemma 4) |
| Parámetros totales | 31B en el modelo base (según su denominación); el adaptador LoRA ocupa 0,5 GB en el repositorio |
| Parámetros activos | No aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Modelo base distribuido en 4 bits (bnb-4bit, bitsandbytes); el adaptador no declara cuantización |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La información disponible describe un ajuste fino supervisado (SFT) con LoRA sobre un modelo base de 31B ya cuantizado en 4 bits. El entrenamiento se realizó con TRL y Unsloth (etiquetas `sft`, `trl`, `unsloth`), y la librería de carga declarada es PEFT en su versión 0.21.2. No se especifican el rango (rank), el alpha, los módulos objetivo, la tasa de aprendizaje, el número de épocas, el tamaño efectivo de lote ni el régimen de precisión empleado.

Tampoco se documenta el dataset de entrenamiento. El identificador `ft_cs_random_it` sugiere un ajuste sobre datos de tipo "cs" (posiblemente computer science) con muestreo aleatorio y orientación a italiano, pero se trata de una interpretación del nombre del repositorio y no de un dato confirmado en la model card. No hay mención a RLHF, DPO, decodificación especulativa ni a ninguna innovación técnica adicional. La fecha de creación registrada en el repositorio es el 7 de octubre de 2026, posterior a la fecha de esta revisión en la mayoría de los contextos de uso.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` indica formato de diálogo multi-turno.
- Instrucciones: el sufijo `it` del modelo base indica ajuste instruccional, aunque la model card del adaptador no documenta el comportamiento resultante.
- Capacidades específicas del ajuste (dominio "cs", multilingüismo, código, matemáticas): no disponibles.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (visión, audio): no documentadas.
- Modo de razonamiento explícito (thinking): no documentado.

Nota: estas capacidades son las que cabría esperar de un adaptador LoRA sobre un modelo instruccional de 31B, pero ninguna está verificada en la documentación del repositorio.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles de un adaptador SFT sobre un modelo instruccional de 31B y deben validarse empíricamente antes de adoptarse, dado que no existen evaluaciones publicadas.

- Asistentes conversacionales de dominio específico: si el dataset "cs" corresponde a contenido técnico, el adaptador podría emplearse como asistente especializado en consultas de ese dominio, cargando el modelo base en 4 bits y el adaptador con PEFT en una GPU de 24 GB o superior.
- Experimentación académica en ajuste eficiente: el repositorio sirve como referencia reproducible de un flujo Unsloth + TRL + PEFT sobre un modelo de 31B, útil para comparar configuraciones de LoRA en trabajos de investigación.
- Generación de documentación técnica: un modelo de 31B ofrece capacidad de redacción estructurada suficiente para generar documentación de API o guías internas, siempre que el adaptador no haya degradado el comportamiento base.
- Prototipado de chat interno: despliegue en una instancia única con Transformers + PEFT para pruebas de concepto de atención interna, sin compromiso de producción.
- Extracción y resumen de textos largos: aplicable si se confirma la ventana de contexto del modelo base, aunque este dato no está documentado para este adaptador.
- Evaluación comparativa de ajustes: uso del adaptador como punto de comparación frente a otros LoRA sobre el mismo base para medir el efecto del dataset de SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección "Evaluation" únicamente con marcadores "[More Information Needed]" y el repositorio no adjunta métricas de pérdida durante el entrenamiento, evaluaciones automáticas ni comparaciones con el modelo base.

## Requisitos de hardware

- Peso del adaptador: 0,5 GB en disco. El coste real lo determina el modelo base de 31B.
- VRAM estimada para inferencia en 4 bits (bnb-4bit): en torno a 18-20 GB de pesos más caché KV y activaciones; conviene reservar 24 GB o más según la longitud de contexto.
- VRAM estimada en 8 bits: aproximadamente 31 GB solo de pesos.
- VRAM estimada en bf16/fp16: aproximadamente 62 GB solo de pesos.
- GPU consumer: la variante de 4 bits puede caber en una RTX 4090 (24 GB) con contexto reducido, y con más margen en RTX 5090 (32 GB) o RTX 6000 Ada (48 GB). Las variantes de 8 y 16 bits no caben en GPU de consumo.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB, L40S 48 GB; para bf16 se recomienda A100 80 GB o H100 80 GB.
- Opciones de despliegue: Transformers + PEFT (ruta directa para el adaptador), vLLM o TGI tras fusionar el adaptador con el base y recuantizar en AWQ/GPTQ/FP8 (bitsandbytes no es una ruta soportada de forma general en vLLM), llama.cpp u Ollama tras convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este adaptador, por lo que la comparación se limita a características estructurales de modelos de tamaño equivalente, tomadas de la documentación pública de cada uno y no verificadas para este repositorio.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GRAI-UNSTPB/gemma4_31b_it_ft_cs_random_it (este adaptador) | 31B (base) + LoRA | No disponible | No disponible | HuggingFace, 0 descargas |
| unsloth/gemma-4-31B-it-unsloth-bnb-4bit (base) | 31B | No disponible | No disponible | HuggingFace (modelo base de este adaptador) |
| Gemma 3 27B IT | 27B | 128 000 tokens | Términos de uso de Gemma | HuggingFace |
| Qwen3 32B | 32B | 32 768 tokens nativos (131 072 con YaRN) | Apache 2.0 | HuggingFace |
| Mistral Small 3.1 24B | 24B | 128 000 tokens | Apache 2.0 | HuggingFace |

La comparación de rendimiento (MMLU, HumanEval, GSM8K u otros) no está disponible para este adaptador. Las alternativas Apache 2.0 presentan condiciones de uso comercial más claras que este repositorio, cuya licencia no está declarada.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Model card vacía: todos los campos descriptivos están sin rellenar, lo que impide conocer el dataset, los hiperparámetros y la intención del ajuste.
- Riesgo de degradación del modelo base: al no documentarse la composición del dataset, no puede descartarse olvido catastrófico ni pérdida de capacidades instruccionales generales.
- Sesgos y alucinación: no evaluados. Al ser un ajuste sobre un modelo base no auditado en este repositorio, los sesgos y la tasa de alucinación son desconocidos.
- Idiomas: no declarados. El sufijo `it` del identificador sugiere contenido en italiano, pero no hay confirmación ni datos sobre el resto de idiomas.
- Contexto: la longitud de contexto efectiva tras el ajuste no está documentada y puede diferir de la del modelo base.
- Dependencia del base: el adaptador no es autónomo; requiere descargar y cargar `unsloth/gemma-4-31B-it-unsloth-bnb-4bit`, con sus propios requisitos de licencia.
- Validación nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o revisión por terceros.
- Metadatos inconsistentes: las fechas de creación y actualización registradas (octubre de 2026) no permiten situar el ajuste en un contexto temporal habitual.
- Ausencia de benchmarks: no hay ninguna métrica que permita comparar el adaptador con el modelo base o con alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GRAI-UNSTPB/gemma4_31b_it_ft_cs_random_it
- Modelo base: https://huggingface.co/unsloth/gemma-4-31B-it-unsloth-bnb-4bit
- Referencia citada en la model card (Lacoste et al., 2019, estimación de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto: https://mlco2.github.io/impact
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
