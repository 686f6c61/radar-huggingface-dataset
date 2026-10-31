# mradermacher/ColdBrew-Qwen3.5-RP_Base-CharThink-i1-GGUF

## Resumen

ColdBrew-Qwen3.5-RP_Base-CharThink-i1-GGUF es un repositorio de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo SvalTek/ColdBrew-Qwen3.5-RP_Base-CharThink, publicado por mradermacher, un cuantizador muy activo y reconocido en la comunidad de Hugging Face. El modelo base es un fine-tuning orientado a roleplay (RP) y generación de personajes con "thinking" (razonamiento en cadena), construido sobre la familia Qwen3.5, y su nombre sugiere un enfoque en interacción conversacional con personajes ficticios.

El propósito de este repositorio no es el modelo en sí, sino facilitar su ejecución local: ofrece más de 20 cuantizaciones distintas, desde IQ1_S (2,8 GB) hasta Q6_K, cubriendo un rango amplio de hardware, desde portátiles con poca VRAM hasta estaciones de trabajo con GPUs de gama alta. Las cuantizaciones i1 (imatrix) suelen ofrecer mejor calidad que las cuantizaciones estáticas a tamaños equivalentes, especialmente en los niveles bajos.

Con casi 9.000 millones de parámetros (8.953.803.264 según los safetensors), el modelo se sitúa en la gama media-alta de los LLM abiertos, un punto dulce para ejecución local en GPUs de consumo. Está bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones relevantes. El modelo base está etiquetado como modelo de visión, por lo que los ficheros mmproj correspondientes se encuentran en el repositorio de cuantizaciones estáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), no disponible mayor detalle |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (GGUF con imatrix) |
| Idiomas soportados | Ingles (etiquetado en el repo; no disponible lista completa) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base, SvalTek/ColdBrew-Qwen3.5-RP_Base-CharThink, es un fine-tuning de la familia Qwen3.5 orientado a roleplay con razonamiento de personaje ("CharThink"), es decir, un modelo pensado para generar respuestas conversacionales inmersivas donde el razonamiento previo a la respuesta forma parte del flujo de generación. La etiqueta `unsloth` en los metadatos sugiere que el entrenamiento o la conversión se realizó con la libreria Unsloth, habitual en fine-tunings eficientes de la comunidad.

Sobre los datos de entrenamiento concretos (numero de tokens, composicion del dataset, uso de RLHF/DPO) no se ha publicado informacion en la model card, por lo que no disponible. Lo que si aporta este repositorio es la infraestructura de cuantizacion: mradermacher genera cuantizaciones GGUF ponderadas con imatrix (matriz de importancia calculada sobre un corpus de calibracion), tecnica que preserva mejor la calidad en niveles de compresion agresivos que las cuantizaciones estaticas. Las cuantizaciones estaticas equivalentes estan disponibles en un repositorio hermano.

## Capacidades

- Generacion de texto conversacional con enfoque en roleplay e interpretacion de personajes.
- Razonamiento previo a la respuesta (modo "thinking" de personaje, segun la denominacion CharThink del modelo base).
- Etiquetado como modelo de vision: los ficheros mmproj para capacidades multimodales estan en el repositorio de cuantizaciones estaticas.
- Compatibilidad con text-generation-inference y ecosistemas que consumen GGUF (llama.cpp, Ollama, LM Studio, koboldcpp, etc.).
- Etiquetado como conversational, apto para interfaces de chat multi-turno.
- No consta soporte documentado de tool calling, agentes ni capacidades multilingues explicitas mas alla del ingles.

## Casos de uso

- Roleplay interactivo local: el caso de uso principal. Un usuario puede ejecutar el modelo en koboldcpp o SillyTavern para sesiones de interpretacion de personajes con razonamiento previo, sin depender de APIs de pago.
- Chatbots de personaje para videojuegos o novelas interactivas: gracias al enfoque CharThink, puede generar dialogos coherentes con personalidad definida, integrandose en motores narrativos via llama.cpp.
- Generacion de dialogos para escritura creativa: util como asistente para autores que necesitan conversaciones realistas entre personajes ficticios, con control total al ejecutarse en local.
- Prototipado de agentes conversacionales: su tamano de ~9B permite desplegarlo en una sola GPU de consumo para experimentar con pipelines de dialogo multi-turno.
- Pruebas de cuantizacion y benchmarking local: el fichero imatrix incluido (0,1 GB) permite a usuarios avanzados generar sus propias cuantizaciones personalizadas ajustadas a su hardware.
- Uso comercial de asistentes conversacionales: la licencia Apache 2.0 del modelo base y de las cuantizaciones permite integrarlo en productos sin restricciones de licencia.
- Clasificacion o analisis de texto ligero en local: al ser un modelo de 9B con base Qwen3.5, puede reutilizarse para tareas generales de NLP, aunque no es su optimizacion principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fine-tuning comunitario orientado a roleplay, no existen evaluaciones estandarizadas (MMLU, HumanEval, GSM8K, etc.) documentadas en la model card ni en los enlaces proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos del modelo, sin KV cache):
  - Cuantizaciones de 1-2 bits (IQ1_S a IQ2_M): 2,8-3,7 GB, ejecutables en GPUs de 4 GB o incluso CPU.
  - Cuantizaciones de 3 bits (IQ3_XXS a Q3_K_L): 4,0-5,0 GB, adecuadas para GPUs de 6 GB.
  - Cuantizaciones de 4 bits (IQ4_XS a Q4_1): 5,3-5,9 GB, el punto recomendado; caben comodamente en una RTX 3060 de 8 GB, RTX 4060 Ti u otras de 8 GB.
  - Cuantizaciones de 5-6 bits (Q5_K_S a Q6_K): 6,4 GB en adelante; recomendables GPUs de 8-12 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para contextos largos y velocidades altas; en el lado profesional, cualquier GPU con 16+ GB da margen amplio. No se requieren A100 ni H100 para este tamano.
- Ejecucion en CPU: viable con las cuantizaciones bajas (Q4 o inferior) en maquinas con 16 GB de RAM, aunque con latencias mucho mayores.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp (muy usado en roleplay), text-generation-inference (indicado en los tags) y backends compatibles con GGUF como llama-cpp-python. No consta soporte verificado en vLLM para estos ficheros GGUF concretos.
- Latencia y throughput: no disponible; como referencia general, un modelo de 9B en Q4_K_M en una RTX 4090 suele superar los 60 tokens/s con llama.cpp, pero esta cifra no esta documentada para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ColdBrew-Qwen3.5-RP_Base-CharThink (este) | ~8,95 B | GGUF (i1, 20+ cuants) | Roleplay + thinking | Apache 2.0 | Publico, 3.479 descargas |
| Mradermacher quants de modelos RP equivalentes (p. ej. MythoMax, Stheno en versiones 8-12B) | 8-13 B | GGUF | Roleplay | Varia segun base | Publico |
| Qwen3.5 base (modelo ascendente) | ~9 B (esta variante) | Safetensors | Uso general | Apache 2.0 (segun tags) | Publico |

Nota: no se dispone de fichas comparativas con metricas de rendimiento para los modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita a categoria, tamano y licencia. La ventaja diferencial de este modelo frente a otros de roleplay de tamano similar es el componente CharThink (razonamiento de personaje) y la base Qwen3.5, mas reciente que bases usadas por fine-tunings RP clasicos.

## Limitaciones y advertencias

- Sesgos: no disponible; al ser un fine-tuning comunitario sin model card detallada, no hay auditoria documentada de sesgos. El modelo hereda los sesgos del modelo base Qwen3.5 y de sus datos de roleplay.
- Riesgo de alucinacion: elevado en usos fuera de su dominio; es un modelo especializado en roleplay, no en tareas factuales, y las cuantizaciones agresivas (IQ1/IQ2) degradan notablemente la coherencia.
- Contexto e idioma: la longitud de contexto no esta documentada en este repo; el modelo esta etiquetado solo en ingles, por lo que su rendimiento en castellano no esta verificado.
- Licencia: Apache 2.0, sin restricciones comerciales relevantes; conviene verificar igualmente la licencia del modelo base SvalTek/ColdBrew-Qwen3.5-RP_Base-CharThink y de Qwen3.5 en su repositorio original.
- Calidad por cuantizacion: las notas del propio autor indican que IQ1_S/IQ1_M son "para desesperados" y que algunas cuantizaciones K son inferiores a sus equivalentes IQ; se recomienda IQ4_XS o Q4_K_M como minimo calidad razonable.
- Contenido: los modelos de roleplay sin alineamiento intensivo pueden generar contenido sensible; el usuario es responsable de su uso conforme a la legislacion aplicable.
- Los ficheros mmproj (vision) no estan en este repositorio sino en el de cuantizaciones estaticas, un detalle facil de pasar por alto al configurar inferencia multimodal.

## Enlaces

- Repositorio de cuantizaciones i1 (este modelo): https://huggingface.co/mradermacher/ColdBrew-Qwen3.5-RP_Base-CharThink-i1-GGUF
- Modelo base: https://huggingface.co/SvalTek/ColdBrew-Qwen3.5-RP_Base-CharThink
- Cuantizaciones estaticas (incluye mmproj para vision): https://huggingface.co/mradermacher/ColdBrew-Qwen3.5-RP_Base-CharThink-GGUF
- Pagina de descargas con vista general: https://hf.tst.eu/model#ColdBrew-Qwen3.5-RP_Base-CharThink-i1-GGUF
- Guia de uso de GGUF referenciada (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper, blog o demo oficial: no disponible
