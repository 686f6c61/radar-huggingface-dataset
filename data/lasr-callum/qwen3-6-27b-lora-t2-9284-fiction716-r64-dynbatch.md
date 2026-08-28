# LASR-Callum/qwen3.6-27b-lora-t2-9284-fiction716-r64-dynbatch

## Resumen

El modelo `LASR-Callum/qwen3.6-27b-lora-t2-9284-fiction716-r64-dynbatch` es un adaptador LoRA de tipo SFT (supervised fine-tuning) diseñado para ser aplicado sobre el modelo base Qwen/Qwen3.6-27B. Lo desarrolla el usuario LASR-Callum como parte de un experimento de alineación que combina 9.284 filas de la denominada "Table-2" con 716 filas de "good AI fiction" (ficción de IA de alta calidad), siguiendo una constitución destilada de Claude de 12 principios. El objetivo declarado es enseñar al modelo a generar respuestas de ficción que cumplan con esos principios, en lugar de limitarse a rechazar peticiones complejas.

El adaptador se entrena con una configuración LoRA de rango 64, alpha 128 y dropout 0.05, sobre una ventana de contexto máxima de 8.192 tokens, utilizando dynamic batching con un presupuesto de 8.000 tokens por lote. El entrenamiento se realizó en dos GPUs H200 con DDP durante 625 pasos, alcanzando una pérdida de entrenamiento de 0.883. El repositorio tiene un tamaño de 1,3 GB y contiene los pesos del adaptador en formato safetensors, junto con el tokenizador y metadatos de entrenamiento.

La relevancia de este modelo reside en su enfoque experimental: en lugar de un fine-tuning genérico, se centra en un subconjunto muy específico de datos de ficción con una constitución de alineación, lo que lo convierte en un caso de estudio para técnicas de entrenamiento con presupuesto reducido (solo 716 filas de ficción) y dynamic batching. No se dispone de información sobre licencia, idiomas soportados ni benchmarks públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen3.6-27B (base transformer) |
| Parametros totales | No disponible (el adaptador pesa 1,3 GB; el base tiene 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (configuracion de entrenamiento) |
| Tipos de cuantizacion | No especificados (pesos en safetensors, adaptador PEFT) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza la técnica LoRA (Low-Rank Adaptation) sobre el modelo base Qwen3.6-27B, cuya arquitectura interna no se detalla en la informacion disponible, pero se asume que es un transformer denso de 27 mil millones de parametros. La configuracion LoRA emplea un rango de 64, un factor alpha de 128 y un dropout de 0.05, aplicado a las capas atencionales y de proyeccion del modelo base.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con un unico epoch, un learning rate de 0.0001, batch size de 1 y acumulacion de gradientes de 16 pasos, lo que equivale a un batch efectivo de 16. Se utilizo dynamic batching con un presupuesto de 8.000 tokens por lote y una funcion de perdida agregada como "seq-mean-token-mean". El dataset de entrenamiento, referenciado como `LASR-Callum/2026-08-27-table2-9284-good-ai-fiction-716-train`, contiene 9.284 filas de la tabla "Table-2" y 716 filas de ficcion de IA de alta calidad, con una constitucion de 12 principios destilados de Claude que se aplica como guia de comportamiento, aunque no se cita en el texto generado.

El entrenamiento se ejecuto en dos GPUs NVIDIA H200 con DDP (distributed data parallelism) durante 625 pasos, con una perdida final de 0.883 y un tiempo total de 7.766 segundos. No se menciona el uso de tecnicas adicionales como RLHF o DPO; el proceso es puramente SFT.

## Capacidades

- Generacion de ficcion alineada con principios de "buena IA" segun la constitucion destilada de Claude (12 principios).
- El adaptador modifica el comportamiento del modelo base para responder a prompts de ficcion complejos sin recurrir a rechazos simples, segun la descripcion del experimento.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso en la informacion del adaptador.
- Las capacidades multilingues dependen del modelo base Qwen3.6-27B, pero no se especifican idiomas concretos.
- No se indica soporte para vision, audio u otras modalidades; el adaptador es exclusivamente textual.

## Casos de uso

- Generacion de narrativa creativa controlada: el adaptador puede emplearse para producir relatos o dialogos de ficcion que sigan directrices eticas o estilisticas definidas por la constitucion, util en entornos de escritura asistida con requisitos de seguridad.
- Investigacion en alineacion de modelos: sirve como banco de pruebas para estudiar como un presupuesto reducido de datos de ficcion (716 filas) afecta al comportamiento del modelo base en tareas de rechazo y razonamiento.
- Fine-tuning experimental en entornos con recursos limitados: al ser un adaptador LoRA, se puede cargar sobre el base sin necesidad de reentrenar todos los parametros, reduciendo costes de computo.
- Evaluacion de tecnicas de dynamic batching: el esquema de entrenamiento con token budget y loss aggregation puede replicarse para comparar metodologias de entrenamiento en otros modelos.
- Desarrollo de sistemas de dialogo con personalidad definida: combinando el adaptador con el base, se puede configurar un asistente que genere respuestas creativas con un tono y valores especificos.
- Comparacion de estrategias de rechazo: el adaptador esta disenado para abordar prompts de "consejo dificil" donde el modelo base tenderia a rechazar; puede usarse para analizar alternativas a politicas de seguridad restrictivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandarizadas para este adaptador. El unico dato de rendimiento es la perdida de entrenamiento (0.883), que no es comparable entre modelos.

## Requisitos de hardware

- El adaptador LoRA pesa 1,3 GB, pero requiere el modelo base Qwen3.6-27B para funcionar. La VRAM necesaria depende de la cuantizacion del base: con cuantizacion de 4 bits se estiman entre 16 y 20 GB; con 8 bits, entre 28 y 32 GB; en precision completa (fp16), se necesitan al menos 54 GB.
- GPUs recomendadas: para inferencia en precision reducida, una NVIDIA RTX 4090 (24 GB) o A100 40 GB pueden ser suficientes; para precision completa o lotes grandes, se requieren A100 80 GB o H100.
- No cabe en GPUs de consumo de gama baja (menos de 16 GB) sin cuantizacion agresiva (4 bits o inferior).
- Opciones de despliegue: vLLM y TGI soportan adaptadores LoRA mediante el parametro `--lora-modules`; llama.cpp y Ollama tambien permiten cargar LoRA en formatos GGUF, aunque la compatibilidad depende de la version.
- La latencia y el throughput no estan documentados; dependen del hardware y de la cuantizacion elegida. Con una H100 y cuantizacion de 4 bits, se podrian esperar decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que se trata de un adaptador experimental sin benchmarks publicos. El propio autor publica otros adaptadores con la misma base y dataset similar, que podrian usarse como referencia cualitativa:

| Modelo | Base | Dataset | Configuracion LoRA | Notas |
|---|---|---|---|---|
| LASR-Callum/qwen3.6-27b-lora-t2-9284-fiction716-r64-dynbatch | Qwen3.6-27B | 9284 Table-2 + 716 ficcion | r64, alpha128, dropout0.05 | Este adaptador |
| LASR-Callum/qwen3.6-27b-lora-t2-9284-par716-r64-dynbatch | Qwen3.6-27B | 9284 Table-2 + 716 (post-action-retrospection) | r64, alpha128 | Variante con arm de retrospection |
| LASR-Callum/qwen3.6-27b-lora-t2-9284-da716-r64-dynbatch | Qwen3.6-27B | 9284 Table-2 + 716 (difficult advice) | r64, alpha128 | Control emparejado con consejos dificiles |

No hay datos de rendimiento comparativo entre estos adaptadores. El modelo base Qwen3.6-27B no tiene fichas publicas de referencia en la informacion disponible, por lo que no es posible comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no declara ninguna licencia, lo que impide su uso comercial sin autorizacion explicita del autor.
- Sesgos desconocidos: al no existir evaluacion de sesgos ni auditoria del dataset de entrenamiento, no se puede garantizar que el adaptador no introduzca o amplifique sesgos presentes en los datos de ficcion.
- Riesgo de alucinacion: no hay benchmarks que midan la fidelidad factual; al ser un adaptador orientado a ficcion, es probable que genere contenido inventado, lo cual es aceptable en contextos creativos pero peligroso en aplicaciones factuales.
- Limitaciones de idioma: no se especifican idiomas soportados; el rendimiento fuera del ingles (o del idioma del dataset, no indicado) es incierto.
- Ventana de contexto limitada: 8.192 tokens es una longitud modesta para tareas que requieran contexto largo; el adaptador puede degradarse con entradas mas extensas.
- Naturaleza experimental: el entrenamiento se realizo con un presupuesto de datos muy reducido (716 filas de ficcion) y una sola epoch; no hay garantias de estabilidad o generalizacion.
- Dependencia del modelo base: el adaptador solo funciona con Qwen3.6-27B, que no es un modelo de acceso publico verificado en la informacion proporcionada; si el base no esta disponible, el adaptador es inutilizable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-fiction716-r64-dynbatch
- Adaptador control emparejado (difficult advice): https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-da716-r64-dynbatch
- Adaptador variante post-action-retrospection: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-par716-r64-dynbatch
- Adaptador variante channel-swap: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-strace-greply703-paired-r64
- Repositorio fuente del entrenamiento (GitHub): https://github.com/Matthew-Bozoukov/teaching_claude_why_replication.git
- Dataset de entrenamiento: https://huggingface.co/datasets/LASR-Callum/2026-08-27-table2-9284-good-ai-fiction-716-train
- Despliegue en FriendliAI (variante chunk-only): https://friendli.ai/models/LASR-Callum/qwen3.6-27b-lora-t2-9284-da-chunk-only-702-r64-dynbatch
