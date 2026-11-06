# mradermacher/jais-adapted-13b-chat-i1-GGUF

## Resumen

`mradermacher/jais-adapted-13b-chat-i1-GGUF` es una distribucion de cuantizaciones GGUF del modelo `inception42/jais-adapted-13b-chat`, un modelo causal decoder-only de 13 343 544 320 parametros (aproximadamente 13,3 mil millones) especializado en conversacion bilingue arabe-ingles. El autor de las cuantizaciones es mradermacher, que aplica su pipeline de cuantizacion con imatrix (importancia matrix) para producir versiones de baja precision que reducen el peso del modelo desde decenas de gigabytes hasta tan solo 3,2 GB en su variante mas agresiva.

El modelo base pertenece a la familia Jais, un linaje de modelos de lenguaje entrenados especificamente para arabe (modern standard arabic y dialectos) e ingles. La adaptacion "adapted-13b-chat" indica un ajuste fino conversacional sobre una base preentrenada de la familia Jais, orientado a instrucciones y dialogos multi-turno. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que resulta relevante para despliegues en produccion.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo arabe-ingles de 13B en hardware de consumo mediante cuantizacion GGUF, algo que el modelo original en safetensors (aproximadamente 26 GB en fp16) no permite en GPUs de gama media. Las cuantizaciones i1 de mradermacher aplican imatrix para preservar mejor la calidad en precisiones bajas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia Jais) |
| Parametros totales | 13 343 544 320 (13,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-Q2_K_S, i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal, coherente con la familia Jais. El modelo base `inception42/jais-adapted-13b-chat` deriva de un preentrenamiento de la familia Jais y posteriormente se adapta para uso conversacional mediante ajuste fino supervisado. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos deben consultarse en la model card del modelo base.

La innovacion tecnica destacable de esta publicacion no reside en el modelo base sino en el proceso de cuantizacion: mradermacher aplica cuantizacion con imatrix (matriz de importancia) en lugar de cuantizacion estatica, lo que permite que las variantes IQ de baja precision preserven mejor la calidad que las cuantizaciones K tradicionales del mismo tamano. El autor indica que las IQ-quants suelen ser preferibles a las no-IQ de tamano similar, y que la variante i1-Q6_K es practicamente equivalente a la Q6_K estatica.

## Capacidades

- Generacion de texto conversacional multi-turno en arabe e ingles.
- Dialogo con formato de chat (modelo ajustado para instrucciones).
- Comprension y generacion en arabe moderno estandar e ingles.
- Razonamiento basico y respuesta a preguntas en ambos idiomas.
- Generacion de texto libre, resumenes y reescritura.
- No se dispone de informacion sobre soporte de tool calling o function calling.
- No se dispone de informacion sobre capacidades de agente o razonamiento multi-paso explicito.
- No se dispone de informacion sobre modo thinking, vision o audio.

## Casos de uso

- Atencion al cliente en arabe: el modelo puede gestionar conversaciones multi-turno en arabe e ingles, adecuado para empresas que atienden a usuarios de la region MENA y necesitan un modelo que comprenda ambos idiomas en un mismo hilo.
- Traduccion asistida arabe-ingles: util para preprocesar o borradorizar traducciones en pipelines de localizacion, dado su entrenamiento bilingue.
- Generacion de contenido editorial en arabe: redaccion de articulos, resumenes y descripciones de producto en arabe moderno estandar.
- Despliegue en hardware de consumo: con cuantizaciones de 7-8 GB (IQ4_XS, Q4_K_M) cabe en GPUs consumer de 8-12 GB de VRAM, lo que permite prototipado local sin infraestructura cloud.
- Chatbots embebidos en aplicaciones moviles o de escritorio: las variantes IQ2/IQ3 (3,8-6,3 GB) permiten ejecucion en portatiles sin GPU dedicada mediante llama.cpp.
- Investigacion en NLP arabe: base cuantizada para experimentos de evaluacion de calidad en baja precision y comparacion de tecnicas de cuantizacion (imatrix frente a estatica).
- Filtrado y clasificacion de texto bilingue: generacion de etiquetas o resumenes en un pipeline de procesamiento documental arabe-ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,2 GB (IQ1_S) hasta 11,0 GB (Q6_K), mas overhead de contexto y KV cache.
- Variante recomendada para equilibrio calidad/tamano: i1-Q4_K_M (8,2 GB) o i1-IQ4_XS (7,3 GB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para las variantes Q4-Q6; A100/H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en RTX 3060 12 GB con Q4_K_M o inferiores; en GPUs de 8 GB con IQ3 o IQ2.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con endpoints (el tag `endpoints_compatible` sugiere compatibilidad con APIs tipo OpenAI mediante llama.cpp server).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| jais-adapted-13b-chat-i1-GGUF (este) | 13,3 B | no disponible | ar, en | Apache 2.0 | GGUF |
| inception42/jais-adapted-13b-chat (base) | 13,3 B | no disponible | ar, en | Apache 2.0 | safetensors |
| mradermacher/jais-adapted-13b-chat-GGUF (estatico) | 13,3 B | no disponible | ar, en | Apache 2.0 | GGUF |
| Jais-13b-chat (familia Jais original) | 13 B | no disponible | ar, en | no disponible | safetensors |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de rendimiento de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Las cuantizaciones de muy baja precision (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el autor las etiqueta como "for the desperate" o "very low quality".
- El modelo solo soporta arabe e ingles; no se debe esperar buen rendimiento en castellano u otros idiomas.
- Riesgo de alucinacion inherente a modelos de 13B; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- No se dispone de informacion sobre sesgos especificos del modelo base; se recomienda evaluar sesgos de genero, religion y dialecto en arabe antes de produccion.
- La longitud de contexto no esta documentada en la informacion proporcionada; conviene verificarla en la model card del modelo base antes de disenar prompts largos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales que deben verificarse en su repositorio.
- El repo ocupa 151,4 GB por incluir todas las variantes; descargar solo el archivo GGUF necesario.
- No hay garantia de soporte de tool calling ni de formato de chat estandarizado; verificar la plantilla de chat del modelo base.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/jais-adapted-13b-chat-i1-GGUF
- Modelo base: https://huggingface.co/inception42/jais-adapted-13b-chat
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/jais-adapted-13b-chat-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#jais-adapted-13b-chat-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
