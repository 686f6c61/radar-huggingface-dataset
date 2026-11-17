# 2Beyes/Aurum_4b-safetensors

## Resumen

Aurum 4B es un ajuste derivado de Qwen3.5-4B desarrollado por el usuario 2Beyes. Se presenta como una edición de Qwen3.5-4B en la que únicamente se ha eliminado el comportamiento de rechazo (refusal), conservando el resto de pesos, la torre de visión y la cabeza de predicción multi-token (MTP) del modelo original. El resultado es un modelo de 4.659.865.088 parámetros orientado a conversación cotidiana y tool calling, pensado para ejecutarse en tarjetas gráficas de 8 GB.

La relevancia del modelo reside en su enfoque quirúrgico: en lugar de un fine-tuning completo, aplica una edición de bajo rango sobre los pesos de salida de atención y de las FFN de las capas 4 a 31, tomando como referencia la diferencia de pesos respecto a un modelo "abliterated" previo. Esto permite conservar el conocimiento del modelo base mientras se eliminan los rechazos, algo que el autor cuantifica con 0 rechazos sobre 100 prompts dañinos frente a 72 del Qwen3.5-4B oficial.

El modelo se distribuye en safetensors BF16 con licencia Apache 2.0 y soporta entrada image-text-to-text, aunque el autor advierte de que solo ha sido evaluado en inglés. Existe una versión GGUF publicada en un repositorio aparte para su uso con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), con torre de visión y cabeza de predicción multi-token (MTP); clase `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en safetensors; GGUF Q3_K_M a Q8_0 y BF16 en el repo 2Beyes/Aurum_4b |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con torre de visión y cabeza MTP, y conserva íntegramente sus pesos salvo por una edición de rechazo. Para construirla, el autor calculó la diferencia de pesos entre Qwen3.5-4B y el modelo insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated, y retuvo únicamente la componente que elimina los rechazos: en los pesos de salida de atención (`self_attn.o_proj` y `linear_attn.out_proj`) de las capas 4 a 31, las 8 direcciones singulares principales del cambio (aproximadamente el 98 % de la modificación); en los pesos de salida de las FFN (`mlp.down_proj`), la dirección principal única, solo en tensores donde representa más de la mitad del cambio. El resto de modificaciones del modelo de referencia (su fine-tuning por destilación) no se incluye.

La configuración, el tokenizer y la plantilla de chat provienen del modelo Heretic citado, que comparte tokenizer con Qwen3.5. Los archivos GGUF se convirtieron con llama.cpp (build b12289) y emplean una importance matrix calculada sobre una mezcla Aurum hermana, con texto de calibración compuesto por prosa, código y conversaciones de tool calling. El autor indica que esta versión, denominada internamente `c-v1u`, superó a otros dos candidatos en pruebas selladas con la misma precisión en herramientas, más conocimiento y ausencia de rechazos. Los pesos safetensors son idénticos tensor a tensor al GGUF BF16 evaluado, según comprobación del autor.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo thinking configurable mediante `enable_thinking` en la plantilla de chat, igual que en Qwen3.5.
- Tool calling y function calling, con soporte de llamadas simples, múltiples y paralelas según las pruebas BFCL publicadas por el autor.
- Procesamiento de imagen y vídeo a texto (pipeline image-text-to-text), usando la torre de visión sin modificar de Qwen3.5 y el processor del modelo base.
- Predicción multi-token (MTP) heredada del modelo base.
- Capacidades multilingües limitadas al inglés según la model card.
- Comportamiento sin rechazos ante peticiones dañinas (0 de 100 en la prueba del autor).

## Casos de uso

- Asistente conversacional local en GPU de consumo: con 4,66 mil millones de parámetros y cuantizaciones GGUF desde Q3_K_M, puede desplegarse en tarjetas de 8 GB para chat multi-turno en inglés sin depender de servicios externos.
- Automatización de tool calling en pipelines internos: sus resultados BFCL v3 non-live (85,9 de media) lo hacen adecuado para enrutar llamadas a APIs y funciones en flujos controlados donde el resultado se valida aguas abajo.
- Procesamiento de documentos con imagen: al conservar la torre de visión de Qwen3.5, puede recibir capturas, diagramas o vídeo y generar descripciones o respuestas textuales usando el processor del modelo base.
- Generación de código y texto técnico en entornos de desarrollo: el autor incluyó código en el corpus de calibración de sus cuantizaciones, y el modelo puede integrarse en asistentes de edición o revisión con validación humana.
- Investigación sobre alineación y seguridad: al ser un modelo con rechazos eliminados y con un registro (`build_log.json`) de cada tensor modificado, sirve como caso de estudio reproducible para analizar ediciones de rechazo y su efecto en evaluaciones de seguridad.
- Evaluación comparativa de cuantizaciones: la disponibilidad de GGUF desde Q3_K_M hasta Q8_0 y BF16, con importance matrix documentada, permite medir la degradación de precisión y de tool calling según el nivel de cuantización en hardware limitado.
- Prototipado de agentes multi-paso en inglés: combinando thinking y tool calling, puede emplearse en pruebas de concepto de agentes que encadenan varias llamadas, siempre con verificación de resultados por las limitaciones del autor.

## Benchmarks y rendimiento

Datos publicados por el autor. Ambas variantes se ejecutan como Q4_K_M en llama.cpp, con thinking desactivado, decodificación greedy y sin system prompt, evaluadas con el runner propio del autor. El modelo previo de comparación es Qwen3.8-4B-Distill-Heretic-Abliterated (Q4_K_M).

| Benchmark | Modelo previo | Aurum 4B |
|---|---|---|
| IFEval, prompt strict / loose (541) | 72,8 / 75,8 | 78,6 / 81,5 |
| IFEval, instruction strict / loose | 81,3 / 83,8 | 85,3 / 87,5 |
| BFCL v3 non-live, media (1.240) | 68,7 | 85,9 |
| BFCL simple / multiple / parallel / parallel-multiple | 65,2 / 74,5 / 48,0 / 62,0 | 92,0 / 92,5 / 82,0 / 82,0 |
| BFCL irrelevance (sin herramienta cuando no procede) | 93,8 | 80,8 |
| MMLU-Redux 2.0 (5.330 preguntas) | 75,0 | 74,9 |
| GPQA Diamond (198, orden de respuesta aleatorizado con semilla fija) | 42,9 | 49,5 |

| Prueba de rechazos | Modelo previo | Qwen3.5-4B oficial | Mezcla Aurum anterior | Aurum 4B |
|---|---|---|---|---|
| Rechazos sobre 100 prompts dañinos (mlabonne/harmful_behaviors) | 0 | 72 | 20 | 0 |
| Sobrerrechazo: rechazos de 30 prompts inocuos x 3 muestras | 1,1 % | no disponible | 0 % | 0 % |

Notas del autor: las cifras publicadas por Qwen corresponden a BF16 con thinking largo y a BFCL v4, por lo que no son directamente comparables con estas mediciones en Q4 y sin thinking. En GPQA se aplicó un límite de 3.072 tokens a la respuesta; 84 de las 198 respuestas de Aurum alcanzaron el límite y se contaron como incorrectas (6 en el modelo previo), por lo que su puntuación con un límite mayor sería probablemente superior. BFCL se puntuó con el verificador AST de `bfcl-eval` sobre generaciones propias (simple, multiple, parallel, parallel-multiple e irrelevance). El recuento de rechazos se basa en frases marcadoras, por lo que es una estimación y no una revisión manual.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el autor indica que el modelo está pensado para tarjetas de 8 GB usando cuantizaciones GGUF.
- El repositorio safetensors ocupa 9,3 GB en BF16, por lo que la inferencia en BF16 requiere al menos ese orden de memoria más overhead.
- GPU recomendadas: no disponible; el autor solo menciona el objetivo de 8 GB de VRAM para las versiones GGUF.
- Cabe en GPU de consumo: sí, según el autor, con las cuantizaciones GGUF (Q3_K_M a Q8_0) en tarjetas de 8 GB; no se detallan modelos concretos.
- Opciones de despliegue: transformers con soporte de Qwen3.5 (`AutoModelForImageTextToText`), llama.cpp (build b12289 para la conversión GGUF) y los GGUF publicados en 2Beyes/Aurum_4b; no se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aurum 4B | 4.659.865.088 | no disponible | BFCL v3 non-live 85,9; MMLU-Redux 2.0 74,9; GPQA Diamond 49,5; 0 rechazos de 100 | apache-2.0 | safetensors y GGUF en Hugging Face |
| Qwen/Qwen3.5-4B (base) | no disponible en la informacion | no disponible | 72 rechazos de 100 prompts dañinos; sin cifras de benchmarks en la informacion | no disponible en la informacion | Hugging Face |
| Qwen3.8-4B-Distill-Heretic-Abliterated (modelo previo) | no disponible en la informacion | no disponible | BFCL v3 non-live 68,7; MMLU-Redux 2.0 75,0; GPQA Diamond 42,9; 0 rechazos de 100 | no disponible en la informacion | GGUF en Hugging Face |
| insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated (fuente de la edicion) | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- El modelo elimina los rechazos: el autor documenta 0 rechazos sobre 100 prompts dañinos y advierte explícitamente de que no ofrece ninguna seguridad. No debe desplegarse en entornos accesibles a personas que no hayan elegido un modelo sin censura.
- Es un modelo de 4B: comete errores de hechos y puede invocar una herramienta cuando ninguna encaja (BFCL irrelevance 80,8, inferior al 93,8 del modelo previo). El autor recomienda verificar los resultados de las herramientas antes de confiar en ellos.
- Es verboso en preguntas de razonamiento difíciles con thinking desactivado, lo que puede agotar límites de tokens de respuesta.
- Solo ha sido probado en inglés; la model card declara únicamente ese idioma.
- La edición de rechazo no añade conocimiento ni seguridad de ningún tipo; solo elimina el comportamiento de negativa.
- Los benchmarks publicados proceden del runner propio del autor, con configuraciones Q4_K_M y thinking desactivado; no son directamente comparables con las cifras oficiales de Qwen (BF16, thinking largo, BFCL v4).
- El recuento de rechazos se basa en frases marcadoras, por lo que es una estimación y no una verificación manual.
- El repositorio safetensors no incluye configuración de preprocesador de imagen propia: para entrada visual debe usarse el processor de Qwen/Qwen3.5-4B.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de terceros.
- Licencia Apache 2.0 heredada de los modelos de origen; el autor no detalla restricciones adicionales para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2Beyes/Aurum_4b-safetensors
- GGUF para llama.cpp: https://huggingface.co/2Beyes/Aurum_4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Fuente de la edición de rechazo: https://huggingface.co/insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated
- Modelo previo de comparación (GGUF): https://huggingface.co/yachen4ever/Qwen3.8-4B-Distill-Heretic-Abliterated-GGUF
