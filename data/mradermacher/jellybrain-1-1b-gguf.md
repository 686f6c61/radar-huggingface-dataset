# mradermacher/jellybrain-1.1b-GGUF

## Resumen

Jellybrain-1.1b-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo SalpyDev/jellybrain-1.1b, generada por mradermacher. El modelo original es un fine-tune de 1.100.048.384 parametros (aproximadamente 1,1 mil millones) orientado a la generacion de texto con enfasis en personalidad y estilo conversacional, segun indican las etiquetas "persona" y "experimental" de la model card. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

La relevancia de esta publicacion es practica: convierte un modelo pequeno en un conjunto de ficheros GGUF listos para ejecutarse en llama.cpp, Ollama o cualquier runtime compatible, con cuantizaciones desde Q2_K (0,5 GB) hasta f16 (2,3 GB). Esto permite desplegar el modelo en hardware muy modesto, incluidos equipos de consumo sin GPU dedicada, algo imposible con los pesos originales en safetensors.

No obstante, conviene ser prudente: el repositorio no incluye informacion sobre arquitectura, longitud de contexto, datos de entrenamiento, benchmarks ni detalles del fine-tune mas alla de las etiquetas. El autor del modelo base no ha publicado una model card descriptiva en la informacion disponible, y las cuantizaciones no incluyen variantes ponderadas por imatrix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; estructura concreta no documentada) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base SalpyDev/jellybrain-1.1b. Las etiquetas del repositorio indican que se trata de un fine-tune realizado con LoRA y la libreria Unsloth sobre un modelo base no especificado, con un enfoque declarado hacia "persona" y marcado como "experimental". No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

La contribucion tecnica de este repositorio concreto es la cuantizacion estatica mediante el pipeline de mradermacher (quantize_version 2, convert_type hf), que produce 12 variantes GGUF. No se han generado cuantizaciones ponderadas por imatrix, lo que limita la calidad relativa de las variantes de baja precision (Q2_K, Q3_K) frente a alternativas IQ optimizadas.

## Capacidades

- Generacion de texto en ingles con estilo conversacional orientado a persona.
- Fine-tune especializado en mantener un rol o personalidad concreta, segun la etiqueta "persona".
- Ejecucion local en CPU y GPU mediante llama.cpp y runtimes compatibles con GGUF.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del ingles.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.
- Capacidad de codigo y matematicas: no documentada; por el tamano (1,1B) y el enfoque del fine-tune, no cabe esperar un rendimiento competitivo en estas areas.

## Casos de uso

- Prototipado de chatbots con personalidad: el modelo puede desplegarse en local con la cuantizacion Q4_K_M (0,8 GB) para iterar rapidamente sobre prompts de personaje sin coste de API, gracias a su enfoque declarado en "persona".
- Pruebas de concepto en hardware de gama baja: con Q2_K (0,5 GB) cabe en Raspberry Pi o portatiles sin GPU, lo que permite validar flujos de generacion de texto en entornos con recursos minimos.
- Generacion de texto creativo en ingles: cuentos, dialogos o descripciones de personajes donde el estilo conversacional aporta valor y la latencia baja importa mas que la precision factual.
- Educacion y demostraciones: util para explicar en talleres como funciona un pipeline de cuantizacion GGUF y comparar calidad entre Q2_K, Q4_K_M y Q8_0 con un modelo de 1,1B.
- Filtrado o clasificacion ligera de texto: con Q8_0 (1,3 GB) y una GPU de consumo se puede procesar volumen alto de textos cortos en ingles con baja latencia, aceptando la precision limitada del modelo.
- Base para experimentos de fine-tuning adicional: al ser Apache 2.0 y pequeno, sirve como punto de partida para adaptaciones LoRA en dominios concretos sin requerir infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (Q2_K) y 2,3 GB (f16); con overhead de contexto, reserve aproximadamente 1-3 GB segun la cuantizacion.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; una RTX 3060, RTX 4060 o superior ejecuta sin problemas las variantes Q4_K_M y Q8_0.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida suficiente.
- CPU: viable en CPU sola; con Q4_K_M (0,8 GB) se obtiene un throughput usable en procesadores de escritorio actuales, aunque no se dispone de cifras medidas.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no son la via natural para este formato.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jellybrain-1.1b-GGUF | 1,1B | no disponible | Apache 2.0 | GGUF | Fine-tune de persona, experimental, solo ingles |
| TinyLlama-1.1B (referencia de categoria) | 1,1B | 2.048 tokens (tipico) | Apache 2.0 | safetensors, GGUF | Modelo base generalista ampliamente cuantizado |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Instrucciones, multilingue, benchmarks publicos |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens (aprox.) | Apache 2.0 | safetensors, GGUF | Instrucciones, buen rendimiento por tamano |

La comparacion con TinyLlama, Qwen2.5-1.5B y SmolLM2 se ofrece como referencia de categoria; no se dispone de datos que permitan afirmar que jellybrain-1.1b los supere en ninguna tarea. La ventaja diferencial de jellybrain es su especializacion declarada en personalidad, no el rendimiento generalista.

## Limitaciones y advertencias

- Modelo marcado como "experimental" por el propio autor: no se recomienda para produccion sin evaluacion previa.
- Solo soporta ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion elevado por el tamano reducido (1,1B) y la ausencia de datos de entrenamiento publicados.
- Sesgos desconocidos: no se documenta la composicion del dataset de fine-tune, por lo que no se pueden evaluar sesgos de genero, raza o ideologicos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas del mismo tamano.
- Sin cuantizaciones imatrix: las variantes Q2_K y Q3_K pueden degradar la calidad mas de lo habitual en cuantizaciones optimizadas.
- Contexto desconocido: no se puede planificar su uso en conversaciones largas sin verificar experimentalmente la ventana efectiva.
- Licencia Apache 2.0: permite uso comercial, pero al ser un fine-tune conviene revisar la licencia del modelo base subyacente, que no se especifica en la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema practicamente inexistente, sin soporte comunitario ni issues resueltos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/jellybrain-1.1b-GGUF
- Modelo base: https://huggingface.co/SalpyDev/jellybrain-1.1b
- Pagina de descargas de mradermacher para este modelo: https://hf.tst.eu/model#jellybrain-1.1b-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa responsable de las cuantizaciones: https://www.nethype.de/
