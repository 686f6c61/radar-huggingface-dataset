# mradermacher/gpt2-finetuned-recipes-cooking_v2-GGUF

## Resumen

`mradermacher/gpt2-finetuned-recipes-cooking_v2-GGUF` es una distribucion en formato GGUF del modelo `mrm8488/gpt2-finetuned-recipes-cooking_v2`, un ajuste fino de GPT-2 pequeno orientado a la generacion de recetas de cocina en ingles. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de versiones GGUF de modelos de Hugging Face, y su objetivo es permitir la ejecucion del modelo en CPU o GPUs de gama baja mediante llama.cpp y herramientas compatibles.

El modelo subyacente es un GPT-2 de 124 millones de parametros (81.912.576 parametros reportados en safetensors, correspondientes al checkpoint ajustado) con arquitectura transformer decoder-only y una ventana de contexto de 1024 tokens, la tipica de la familia GPT-2. Su proposito es especializado: continuar texto con formato de receta culinaria a partir de un prompt, no mantener conversaciones generales ni razonar sobre otros dominios.

La relevancia de esta ficha es acotada y conviene ser honestos: se trata de un modelo pequeno, especializado y con muy poca traccion (69 descargas y 0 likes en el momento de la consulta). Resulta util como ejemplo de cuantizacion de modelos GPT-2 para despliegue ligero, para experimentos de generacion de texto culinario y como banco de pruebas de pipelines GGUF, pero no compite con modelos actuales en razonamiento, codigo ni capacidades multilingues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 81.912.576 (checkpoint ajustado, segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (heredada de GPT-2; no confirmada de forma explicita en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en formato transformers/safetensors |
| Tamano del repo | 0,9 GB |
| Modelo base | mrm8488/gpt2-finetuned-recipes-cooking_v2 |
| Cuantizador | mradermacher |
| Fecha de creacion | 2025-05-23 |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 estandar: un transformer decoder-only con atencion causal multi-cabeza, embeddings posicionales aprendidos y normalizacion previa a cada bloque. Al tratarse de una cuantizacion del checkpoint de mrm8488, la innovacion tecnica no esta en la arquitectura sino en el proceso de conversion a GGUF: mradermacher aplica cuantizaciones estaticas (Q2_K a Q8_0 y f16) sobre el modelo en formato Hugging Face, con el objetivo de reducir el peso en disco y permitir inferencia en CPU mediante llama.cpp.

No se dispone de informacion sobre el dataset de ajuste fino, el numero de tokens de entrenamiento, la composicion del corpus culinario ni si se aplicaron tecnicas de RLHF, DPO o instruccion. La model card del autor de la cuantizacion no aporta detalles de entrenamiento y se limita a describir los ficheros GGUF generados. Tampoco se documenta el proceso de tokenizacion mas alla del heredado de GPT-2 (BPE con vocabulario de 50.257 tokens). Existe una variante con cuantizaciones ponderadas/imatrix publicada por el mismo autor en un repositorio separado.

## Capacidades

- Generacion de texto autoregresiva en ingles, especializada en el dominio de recetas de cocina.
- Continuacion de prompts con estructura de receta: ingredientes, pasos, tiempos y raciones.
- Generacion de texto creativo culinario (variaciones de platos, descripciones de ingredientes).
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No tiene modo thinking, vision, audio ni capacidades multimodales.
- Capacidad multilingue practicamente nula: solo ingles.
- No soporta instrucciones conversacionales; funciona mejor como modelo de continuacion que como asistente.

## Casos de uso

- Generacion de borradores de recetas: dado un prompt como "Chicken curry with coconut milk", el modelo completa una receta con ingredientes y pasos. Es adecuado porque fue ajustado especificamente sobre ese formato.
- Prototipado de asistentes culinarios en local: al ser un modelo de 124M en GGUF, puede ejecutarse en un portatil sin GPU para validar flujos de UI antes de invertir en un modelo mayor.
- Aumento de datos para dominios gastronomicos: generar variaciones sinteticas de recetas para ampliar un corpus de entrenamiento o de evaluacion.
- Educacion y demos de cuantizacion GGUF: sirve como ejemplo didactico de como convertir un checkpoint de transformers a GGUF y desplegarlo con llama.cpp u Ollama.
- Pruebas de pipelines de inferencia en CPU: su tamano minimo (0,2 GB en Q4_K_M) permite medir latencia y throughput en entornos sin acelerador.
- Generacion de contenido para blogs o menus: completar descripciones de platos y sugerencias de presentacion en ingles, siempre con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor de la cuantizacion no incluye metricas de perplexity, MMLU, HumanEval ni evaluaciones culinarias. Tampoco se dispone de comparaciones con el checkpoint original en terminos de perdida de calidad por cuantizacion, mas alla de las notas cualitativas del autor (por ejemplo, "fast, recommended" para Q4_K_M o "very good quality" para Q6_K).

## Requisitos de hardware

- VRAM estimada: entre 0,2 GB (Q2_K a Q5_K) y 0,3 GB (f16) para los pesos; el consumo real depende del runtime y del contexto activo.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una GTX 1650, RTX 3060 o superior ejecuta el modelo con holgura. En A100 o H100 el modelo esta infrautilizado.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1 GB de VRAM libre, e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), llama-cpp-python, LM Studio y cualquier runtime compatible con GGUF. La model card menciona compatibilidad con endpoints (`endpoints_compatible`).
- Latencia y throughput: no se han publicado mediciones. Por el tamano del modelo, en CPU moderna se esperan decenas de tokens por segundo, y en GPU consumer cientos, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gpt2-finetuned-recipes-cooking_v2 (GGUF) | 81,9 M | 1024 | no disponible | Hugging Face | Especializado en recetas, solo ingles |
| GPT-2 original (OpenAI) | 124 M | 1024 | MIT (pesos publicos) | Hugging Face, OpenAI | Base generalista, sin ajuste culinario |
| GPT-2 medium | 355 M | 1024 | MIT (pesos publicos) | Hugging Face | Mayor capacidad, mas coste de inferencia |
| TinyLlama 1.1B | 1,1 B | 2048 | Apache 2.0 | Hugging Face | Modelo mayor, mas capaz en instrucciones y multilingue |

La comparativa es limitada: no se dispone de benchmarks del modelo ajustado, por lo que la eleccion frente a alternativas debe basarse en el dominio (recetas en ingles) y en el coste de despliegue, no en metricas de calidad.

## Limitaciones y advertencias

- Modelo de 124M parametros: propenso a incoherencias, repeticiones y errores factuales en recetas (cantidades, tiempos de coccion, ingredientes incompatibles).
- Riesgo alto de alucinacion culinaria: puede inventar combinaciones o proporciones no seguras; requiere revision humana antes de cualquier uso alimentario.
- Solo ingles: no genera recetas en castellano ni en otros idiomas de forma fiable.
- Contexto limitado a 1024 tokens: no admite conversaciones largas ni documentos extensos.
- No es un modelo de instrucciones: puede ignorar el formato solicitado y continuar el texto de forma no deseada.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor del modelo base antes de desplegarlo en produccion.
- Sin garantias de calidad: 69 descargas y 0 likes indican poca validacion por parte de la comunidad.
- El proceso de cuantizacion introduce perdida de calidad adicional, especialmente en Q2_K y Q3_K; para uso serio se recomienda Q5_K_M o superior.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/gpt2-finetuned-recipes-cooking_v2-GGUF
- Modelo base: https://huggingface.co/mrm8488/gpt2-finetuned-recipes-cooking_v2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gpt2-finetuned-recipes-cooking_v2-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gpt2-finetuned-recipes-cooking_v2-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
