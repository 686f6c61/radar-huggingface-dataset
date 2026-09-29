# cenkierpiotr/MEMORYDistillPL-1.5b

## Resumen

MEMORYDistillPL-1.5b es un ajuste fino en polaco del modelo Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario cenkierpiotr. Se ha entrenado con QLoRA para una tarea muy concreta: destilar transcripciones largas de conversaciones en polaco hacia notas de memoria breves y estructuradas, resumiendo lo tratado y extrayendo las entidades mencionadas (personas, organizaciones, decisiones y hechos). No es un modelo de chat generalista, sino una herramienta especializada de resumen y extracción.

El modelo parte de la arquitectura Qwen2 con 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), 28 capas, tamano oculto de 1536, 12 cabezas de atención con 2 cabezas KV (GQA) y una ventana de contexto de 32.768 tokens. Se distribuye bajo licencia Apache 2.0 y conserva la plantilla de chat del modelo base, por lo que se integra directamente en transformers, PEFT y runtimes compatibles con GGUF como llama.cpp, Ollama o LM Studio.

Su relevancia actual reside en que ofrece, con un coste computacional muy bajo, un rendimiento que en la evaluacion del propio autor supera en preferencia al Qwen2.5-7B-Instruct (un modelo aproximadamente 4,5 veces mayor) en esta tarea especifica de resumen y extraccion de entidades sobre transcripciones conversacionales en polaco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only), 28 capas, hidden size 1536, 12 cabezas de atención, 2 cabezas KV (GQA), vocab 151.936 |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (entrenamiento con max sequence length de 8.192 tokens) |
| Tipos de cuantizacion | bf16 (pesos fusionados); QLoRA 4-bit NF4 durante entrenamiento; GGUF F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Polaco (principal); el modelo base conserva capacidad multilingue, no probada ni optimizada |
| Licencia | Apache 2.0 (heredada de Qwen2.5-1.5B-Instruct) |
| Formato de pesos | safetensors (bf16 fusionados), adapter safetensors (LoRA para PEFT), GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-1.5B-Instruct, un transformer decoder-only de tipo Qwen2 con Grouped-Query Attention (12 cabezas de atencion y 2 cabezas KV) y una ventana de contexto nativa de 32.768 tokens. El ajuste se realizo con QLoRA sobre los pesos base cuantizados a 4-bit NF4, incorporando adaptadores LoRA mediante Unsloth junto con PEFT y TRL. Los modulos objetivo del LoRA fueron q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, con rango r=16, alpha=16 y dropout 0.

El entrenamiento utilizo 1.394 ejemplos de entrenamiento, 164 de validacion y 82 de test reservados (1.640 en total). Cada ejemplo empareja una transcripcion de conversacion con un resumen estructurado objetivo, generado por un modelo profesor y usado como objetivo de ajuste supervisado. Se emplearon 3 epocas con batch efectivo de 8 (1 x 8 de acumulacion de gradientes), learning rate de 2e-4 con schedule coseno y 3% de warmup, optimizador AdamW de 8-bit, precision bf16 y longitud maxima de secuencia de 8.192 tokens. El entrenamiento totalizo 525 pasos, con una perdida final de entrenamiento de 0,277 (partiendo de 0,88) y aproximadamente 1,5 horas de computo en una sola GPU. No se menciona el uso de RLHF, DPO u otras tecnicas de alineacion adicionales.

## Capacidades

- Resumen estructurado de transcripciones conversacionales en polaco: genera notas compactas y factuales a partir de dialogos largos.
- Extraccion de entidades: identifica personas, organizaciones, decisiones y hechos presentes en la conversacion.
- Destilacion de memoria a largo plazo: produce resumenes pensados para su almacenamiento y recuperacion posterior.
- Ejecucion ligera: al ser un modelo de 1,5B, ofrece baja latencia y bajo consumo de recursos frente a alternativas mucho mayores.
- Despliegue flexible: disponible en safetensors bf16, adaptador LoRA y multiples cuantizaciones GGUF.
- Capacidad multilingue residual heredada del modelo base (no probada ni optimizada por el autor).
- No soporta de forma fiable tool calling, uso como agente, razonamiento multi-paso ni vision; el autor indica explicitamente que no esta pensado para chat generalista ni para seguimiento de instrucciones fuera de la tarea de resumen y extraccion.

## Casos de uso

- Sistema de memoria a largo plazo para asistentes conversacionales en polaco: el modelo toma el historial de una conversacion y produce una nota estructurada con los hechos clave y las entidades, que se almacena en una base de datos vectorial para recuperacion posterior.
- Resumen de reuniones o llamadas de soporte en polaco: a partir de la transcripcion de una reunion, genera un acta compacta con personas implicadas, decisiones tomadas y temas tratados.
- CRM con extraccion automatica de entidades: procesa transcripciones de llamadas comerciales y extrae nombres de clientes, empresas y acuerdos, poblando automaticamente los campos del sistema.
- Generacion de memoria intermedia en agentes o chatbots: condensa turnos previos de una conversacion larga en notas ligeras, reduciendo el contexto necesario para el modelo principal.
- Indexado de historiales conversacionales para busqueda: convierte cada transcripcion en una nota resumida y etiquetada que alimenta un indice de recuperacion.
- Procesado por lotes de grandes volumenes de transcripciones: gracias a su tamano reducido y sus cuantizaciones GGUF, permite procesar muchos documentos por GPU con coste bajo.
- Alternativa eficiente a LLM grandes en tareas estrechas de resumen: sustituye a modelos de 7B o superiores en pipelines donde solo se necesita resumir y extraer entidades de conversaciones en polaco.

## Benchmarks y rendimiento

La model card no presenta resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). La unica evaluacion publicada es una comparacion por pares ciega y con orden aleatorizado sobre 82 transcripciones de test reservadas, en la que un juez LLM independiente valoro la fidelidad a la transcripcion fuente y la completitud de la informacion extraida.

| Comparacion | Resultado |
|---|---|
| MEMORYDistillPL-1.5b frente a Qwen2.5-7B-Instruct | Preferido en aproximadamente 55/82 comparaciones (~67%) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Pesos en bf16 (safetensors fusionados): aproximadamente 3,1 GB, mas overhead de activaciones y cache KV; se estima un consumo de VRAM en torno a 4-5 GB en inferencia.
- Cuantizacion GGUF Q4_K_M (recomendada por el autor, 986 MB): se estima que cabe en GPUs de consumo con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) e incluso en algunos equipos con 4 GB.
- Variantes Q2_K (676 MB) y Q3: permiten ejecucion en hardware muy limitado, aunque el autor advierte que en modelos de 1,5B la cuantizacion de baja precision degrada la calidad de forma mas notable que en modelos mayores.
- GPU recomendadas: al tratarse de un modelo de 1,5B, funciona con fluidez en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070, RTX 4090, y tambien en GPU profesionales (A100, H100) para despliegues de alto throughput. No se especifican latencia ni throughput oficiales.
- Opciones de despliegue: transformers (safetensors y adaptador PEFT), llama.cpp y runtimes compatibles con GGUF (Ollama, LM Studio); el tag text-generation-inference indica compatibilidad con TGI. No se confirma soporte explicito de vLLM en la informacion disponible.
- El entrenamiento con QLoRA se realizo en una unica GPU con Unsloth, lo que sugiere que el reentrenamiento o ajuste adicional es viable en hardware asequible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MEMORYDistillPL-1.5b | 1,54B | 32.768 tokens | Resumen estructurado y extraccion de entidades en polaco | Apache 2.0 | HuggingFace (safetensors + GGUF) |
| Qwen2.5-1.5B-Instruct (modelo base) | 1,54B | 32.768 tokens | Chat general e instrucciones | Apache 2.0 | HuggingFace |
| Qwen2.5-7B-Instruct | 7B | 32.768 tokens (aprox., segun la familia Qwen2.5) | Chat general e instrucciones | Apache 2.0 | HuggingFace |

En la evaluacion interna del autor, MEMORYDistillPL-1.5b fue preferido frente a Qwen2.5-7B-Instruct en aproximadamente el 67% de las comparaciones sobre 82 transcripciones de test, pese a ser unas 4,5 veces mas pequeno. No se dispone de datos de comparacion con otros modelos especializados en resumen o extraccion de entidades en polaco.

## Limitaciones y advertencias

- Alucinacion de abreviaturas: el modelo ocasionalmente inventa expansiones en ingles, plausibles pero incorrectas, para abreviaturas de dominio en polaco que no aparecen en el texto fuente.
- Entidades omitidas: en una minoria de casos, el modelo deja fuera alguna entidad que deberia haberse extraido.
- Alcance de evaluacion limitado: solo se ha evaluado con transcripciones conversacionales en polaco de hasta 8.000 tokens; su comportamiento en otros idiomas, dominios o entradas de mayor longitud no se ha probado.
- Uso no previsto: no esta disenado para chat abierto ni para seguimiento de instrucciones generales, ni para su uso en idiomas distintos del polaco (no probado ni optimizado).
- Verificacion humana recomendada: como cualquier resumidor basado en LLM, las salidas no deben considerarse fieles a la fuente sin verificacion en contextos de alto riesgo.
- El corpus de entrenamiento no se publica junto con los pesos, lo que limita la reproducibilidad y el analisis de sesgos del dataset.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y tener en cuenta que las condiciones se heredan del modelo base Qwen2.5-1.5B-Instruct.
- Degradacion con cuantizacion baja: en un modelo de 1,5B, las variantes Q3 y Q2 pierden calidad de forma mas acusada que en modelos mayores; se recomienda Q4_K_M o superior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cenkierpiotr/MEMORYDistillPL-1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- No se han proporcionado enlaces adicionales a papers, blogs, repositorios o demos en la informacion disponible.
