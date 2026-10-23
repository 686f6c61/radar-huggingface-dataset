# mphd1/OLMo-2-1124-7B_dollygeneral_private

## Resumen

OLMo-2-1124-7B\_dollygeneral\_private es un ajuste fino (fine-tune) del modelo base allenai/OLMo-2-1124-7B, publicado por el usuario mphd1 en HuggingFace. Se trata de un transformer decoder-only denso de 7.298.617.344 parámetros (aproximadamente 7,3 mil millones), distribuido en formato safetensors y compatible con la librería transformers. El repositorio tiene un tamaño de 29,2 GB, lo que es coherente con pesos almacenados en fp32 (7,3B × 4 bytes ≈ 29,2 GB).

El interés de esta ficha es doble. Por un lado, documenta un derivado de la familia OLMo 2 de AI2, una de las pocas familias de modelos totalmente abiertas (pesos, datos de entrenamiento y código). Por otro, advierte de que se trata de un modelo sin documentación: la model card es la generada automáticamente por el Trainer de HuggingFace, no declara el conjunto de datos de entrenamiento ("unknown dataset"), no incluye resultados de evaluación y acumula 0 descargas y 0 likes en el momento de la consulta.

Por tanto, esta ficha debe leerse como una caracterización del modelo base más el conjunto de hiperparámetros de ajuste declarados, y no como una evaluación del fine-tune. Cualquier afirmación sobre el rendimiento del modelo ajustado queda fuera de lo disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia OLMo 2) |
| Parametros totales | 7.298.617.344 (aproximadamente 7,3B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 4.096 tokens (heredada del modelo base allenai/OLMo-2-1124-7B; no se especifica en la model card del ajuste) |
| Tipos de cuantizacion | No se distribuyen pesos cuantizados en el repositorio. Al ser pesos estándar de transformers, es cuantizable a 8 y 4 bits (bitsandbytes, GPTQ, AWQ) o convertible a GGUF para llama.cpp |
| Idiomas soportados | No disponible (la model card no lo declara; el modelo base OLMo 2 está entrenado mayoritariamente con corpus en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repositorio de 29,2 GB, consistente con pesos en fp32 |
| Modelo base | allenai/OLMo-2-1124-7B |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 29,2 GB |
| Fecha de creacion / actualizacion | 2026-10-23 / 2026-10-23 |

## Arquitectura y entrenamiento

El modelo base OLMo-2-1124-7B es un transformer decoder-only denso con normalización RMSNorm en configuración de tipo sandwich (pre y post normalización), QK-Norm, embeddings rotatorios (RoPE) y activación SwiGLU. Fue entrenado por AI2 sobre corpus de la familia Dolma/OLMo Mix con un currículo por fases y del orden de 3,9 billones de tokens para la variante de 7B, sin RLHF en la versión base. Es, por diseño, un modelo de continuación de texto sin alineación conversacional.

Sobre el ajuste fino de este repositorio solo se conocen los hiperparámetros declarados por el Trainer: learning rate 1e-5, batch de entrenamiento y de evaluación de 8, 10 épocas, scheduler coseno, optimizador paged\_adamw\_8bit con betas (0,9; 0,999) y epsilon 1e-8, semilla 1. El conjunto de datos no se especifica ("unknown dataset") y no se documenta ninguna innovación técnica, destilado, DPO ni fase de alineación posterior. El nombre del repositorio sugiere un ajuste sobre el corpus Dolly, pero esto no está confirmado por el autor y debe tratarse como una hipótesis, no como un dato. Tampoco hay información sobre el número de tokens de entrenamiento ni sobre la composición del dataset.

Conviene señalar que 10 épocas con un learning rate de 1e-5 sobre un dataset presumiblemente pequeño es una configuración propensa al sobreajuste y al olvido catastrófico de las capacidades del modelo base; sin curva de evaluación ni pérdida de validación publicada, no es posible descartarlo.

## Capacidades

- Generación de texto autoregresiva: continuación de texto, redacción y respuesta a instrucciones por formato prompt-completion, heredadas del modelo base.
- Conocimiento general y razonamiento de nivel 7B: capacidades típicas de un modelo denso de esta escala entrenado sobre corpus web, sin cifras publicadas para este ajuste.
- Código y matemáticas elementales: el modelo base incluye código en su corpus, pero no hay evaluación que cuantifique la capacidad tras el ajuste.
- Soporte de tool calling / function calling: no documentado. El modelo base no se entrena específicamente para ello y la model card no declara ninguna capacidad de este tipo.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no declaradas. El modelo base está centrado en inglés, por lo que el rendimiento en castellano no está garantizado ni medido.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. Es un modelo exclusivamente de texto.
- Formato de instrucciones: no especificado. Al derivar de un modelo base y no de una variante Instruct, no hay plantilla de chat declarada.

## Casos de uso

- Prototipado de ajuste fino en dominio concreto: al partir de un checkpoint ya ajustado y con licencia Apache 2.0, sirve como punto de partida para experimentos de fine-tuning sobre datos propios antes de comprometerse con un modelo mayor.
- Generación de texto en despliegue on-premise: la licencia Apache 2.0 y un tamaño de 7,3B permiten servir el modelo en infraestructura propia sin restricciones de uso comercial derivadas de la licencia.
- Experimentos de reproducibilidad y auditoría: al ser un derivado de OLMo 2, permite estudiar el efecto de un ajuste con hiperparámetros conocidos (10 épocas, lr 1e-5, AdamW de 8 bits) sobre un modelo totalmente abierto.
- Etiquetado y clasificación por generación: tareas de extracción o clasificación de textos cortos (hasta 4.096 tokens) formuladas como generación, con validación humana obligatoria dado que no hay métricas publicadas.
- Resumen de documentos breves: artículos, correos o informes que quepan en la ventana de 4K tokens, con la advertencia de que la calidad tras el ajuste no está medida.
- Base para comparativas de sobreajuste: útil en investigación para medir cómo un ajuste agresivo (10 épocas) degrada o especializa las capacidades de un modelo base abierto.
- Generación asistida en pipelines internos con revisión humana: borradores de documentación técnica o respuestas tipo en inglés, integrados en flujos donde la salida se valida antes de publicarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card declara el nombre del modelo con un array `results` vacío, y la sección "Training results" del README está en blanco. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación para este ajuste, ni comparación con el modelo base.

## Requisitos de hardware

- Pesos en fp32 (formato del repositorio): aproximadamente 29,2 GB. Requiere A100 40 GB, L40S 48 GB o dos GPU de 24 GB con reparto de pesos.
- Pesos en bf16/fp16: aproximadamente 14,6 GB. Encaja en RTX 3090, RTX 4090, A10G, L4 o A100 40 GB, reservando VRAM adicional para KV cache y activaciones (del orden de 2 a 4 GB a 4.096 tokens).
- Cuantización a 8 bits: aproximadamente 7,3 GB de pesos. Cabe en RTX 4070 Ti Super, RTX 4080 o cualquier GPU de 12 GB o más con margen ajustado.
- Cuantización a 4 bits: aproximadamente 4,2 GB de pesos. Cabe en RTX 3060 12 GB, RTX 4060 Ti 8 GB y en GPUs de 8 GB con contexto reducido.
- Cabe en GPU de consumo: sí, en bf16 en RTX 3090/4090 (24 GB) y en 4 bits en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (vía `AutoModelForCausalLM`), vLLM y TGI para servicio en bf16; llama.cpp y Ollama requieren conversión previa a GGUF, que no se distribuye en el repositorio; bitsandbytes para cuantización en carga.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| mphd1/OLMo-2-1124-7B\_dollygeneral\_private | 7,3B | 4.096 | Apache 2.0 | No disponible |
| allenai/OLMo-2-1124-7B (base) | 7,3B | 4.096 | Apache 2.0 | Métricas en el informe técnico de OLMo 2; no replicadas aquí |
| allenai/OLMo-2-1124-7B-Instruct | 7,3B | 4.096 | Apache 2.0 | Métricas en el informe técnico de OLMo 2; no replicadas aquí |
| Meta Llama 3.1 8B | 8,03B | 128.000 | Licencia comunitaria Llama 3.1 | Ampliamente documentado por Meta |
| Mistral 7B v0.3 | 7,25B | 32.000 | Apache 2.0 | Documentado por Mistral |
| Qwen2.5-7B | 7,6B | 32.768 nativo, 131.072 con YaRN | Apache 2.0 | Documentado por Alibaba |

La comparación relevante en términos de licencia y transparencia es con la propia familia OLMo 2: este repositorio añade un ajuste no documentado sobre el checkpoint base, sin evaluación asociada. Frente a Llama 3.1 8B, Mistral 7B v0.3 y Qwen2.5-7B, la desventaja principal es la ventana de contexto (4.096 frente a 32.000-128.000 tokens) y la ausencia total de datos de rendimiento. No se dispone de comparaciones benchmark para este modelo concreto.

## Limitaciones y advertencias

- Modelo sin evaluar: no hay ningún benchmark, métrica de pérdida de validación ni comparación con el modelo base. No se puede afirmar que el ajuste mejore al original en ninguna tarea.
- Dataset de entrenamiento desconocido: la model card indica explícitamente "unknown dataset". Es imposible auditar la composición, la licencia o la calidad de los datos usados.
- Riesgo de sobreajuste: 10 épocas con learning rate 1e-5 sobre un corpus no especificado es una configuración agresiva que puede degradar capacidades del modelo base (olvido catastrófico) y producir respuestas repetitivas o degeneradas.
- Riesgo de fuga de datos: el sufijo "private" en el nombre y la ausencia de información sobre el corpus sugieren un ajuste sobre datos posiblemente privados. Antes de usar el modelo en producción conviene verificar que no reproduzca información sensible del conjunto de entrenamiento.
- Modelo base no alineado: al derivar de un checkpoint base y no de una variante Instruct, no ha pasado por RLHF ni DPO. Puede generar contenido inapropiado, sesgado u ofensivo, y no respeta instrucciones de forma fiable sin un prompting cuidadoso.
- Ventana de contexto de 4.096 tokens: insuficiente para tareas de documentos largos, RAG con muchos fragmentos o conversaciones multi-turno extensas.
- Idiomas: capacidades multilingües no declaradas. El modelo base está centrado en inglés; el rendimiento en castellano no está medido y probablemente sea inferior.
- Sesgos: los corpus web empleados por OLMo 2 arrastran sesgos de género, raza, nacionalidad y punto de vista. No se ha documentado ningún proceso de mitigación en este ajuste.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución, pero no exime al desplegador de responsabilidad legal sobre las salidas ni sobre el origen de los datos de ajuste.
- Señales de baja validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y metadatos de fecha atípicos (creación en 2026-10-23). No hay evidencia de uso o revisión por terceros.
- No soporta tool calling, agentes, visión ni audio de forma declarada; cualquier uso en esos escenarios requiere validación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mphd1/OLMo-2-1124-7B_dollygeneral_private
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B
- Informe técnico de OLMo 2 (AI2): https://arxiv.org/abs/2501.00656
- Blog de AI2 sobre OLMo 2: https://allenai.org/blog/olmo2
- Repositorio de código de OLMo: https://github.com/allenai/OLMo-core
- Playground de AI2 para modelos OLMo: https://playground.allenai.org
