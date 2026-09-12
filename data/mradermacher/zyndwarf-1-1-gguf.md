# mradermacher/ZynDwarf-1.1-GGUF

## Resumen
ZynDwarf-1.1-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF del modelo itsZyn/ZynDwarf-1.1, generado por mradermacher (nethype GmbH). El modelo original es un causal language model de aproximadamente 354,5 millones de parámetros, etiquetado con las familias lfm2 y lfm2.5, orientado a conversación, código, uso de herramientas (tool calling/function calling) y agentes, con soporte declarado de español e inglés.

Su relevancia práctica radica en el tamaño: al tratarse de un modelo de ~350M de parámetros, las cuantizaciones ocupan entre 0,3 GB y 0,8 GB, lo que permite ejecutarlo en CPU, en GPUs integradas, en dispositivos de borde e incluso en móviles mediante llama.cpp u Ollama, sin necesidad de hardware dedicado. El repositorio ofrece doce variantes de cuantización (desde Q2_K hasta f16) con licencia Apache 2.0, lo que facilita su integración en productos comerciales.

Se trata, por tanto, de una opción de despliegue local para tareas de asistencia conversacional, autocompletado de código y orquestación ligera de herramientas, más que de un modelo de propósito general de alta capacidad. En el momento de redactar esta ficha no se han publicado resultados de benchmarks ni detalles del entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; las etiquetas del repositorio indican lfm2 / lfm2.5 (familia Liquid Foundation Model 2) y pipeline causal-lm |
| Parametros totales | 354.483.968 (dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | es (espanol), en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama); el repositorio original itsZyn/ZynDwarf-1.1 usa la libreria transformers |
| Tamano del repositorio | 3,3 GB (incluye todas las cuantizaciones) |
| Cuantizaciones con pesos ponderados / imatrix | no disponibles segun la model card del cuantizador |
| Fecha de publicacion | 2026-09-12 |

## Arquitectura y entrenamiento
El repositorio es una conversión de pesos, no un entrenamiento nuevo: mradermacher ha aplicado cuantizaciones estáticas sobre el modelo base itsZyn/ZynDwarf-1.1, que a su vez se distribuye a través de transformers. Las etiquetas declaran las familias lfm2 y lfm2.5, un recuento de 350M de parámetros y el pipeline causal-lm; no se especifican en la información disponible ni la composición del dataset, ni el número de tokens de entrenamiento, ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

Tampoco se documentan innovaciones técnicas concretas (decodificación especulativa, atención lineal, capas convolucionales híbridas, etc.) más allá de la pertenencia declarada a la familia LFM2. Para cualquier decisión de arquitectura conviene consultar la ficha del modelo base y la documentación oficial de la familia, no este repositorio de cuantizaciones, que únicamente reproduce los pesos originales en distintos niveles de precisión.

Un dato observable: el recuento de parámetros (354.483.968) coincide con el de las variantes de 350M de la familia LFM2, lo que sugiere que ZynDwarf-1.1 podría ser un ajuste fino sobre esa base, si bien esto no se confirma en la model card.

## Capacidades
- Generación de texto conversacional multi-turno en español e inglés, según las etiquetas del repositorio.
- Generación y asistencia en código (etiquetas code y programming), adecuada para autocompletado y explicación de fragmentos.
- Tool calling y function calling: el modelo declara soporte explícito de invocación de funciones.
- Flujos de agentes y razonamiento en varios pasos (etiqueta agents).
- Instrucciones conversacionales (etiqueta conversational), presumiblemente con plantilla de chat del modelo base.
- Capacidades multilingües limitadas a español e inglés; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, visión, audio, contexto largo): no disponibles en la información proporcionada.
- Rendimiento real en cada una de estas tareas: no verificado con benchmarks publicados.

## Casos de uso
- Asistente conversacional local en escritorio o móvil: con pesos Q4_K_M de ~0,3 GB, puede ejecutarse íntegramente en el dispositivo mediante llama.cpp u Ollama, preservando la privacidad del usuario y sin coste por token.
- Autocompletado de código en el IDE: un modelo de 350M con etiqueta code es adecuado para sugerencias de línea o bloque en tiempo real con latencia mínima, integrable en extensiones de editor.
- Enrutador de intenciones en pipelines de agentes: por su soporte declarado de function calling, puede clasificar la petición del usuario y decidir a qué herramienta o modelo mayor derivarla, reduciendo coste frente a invocar un LLM grande en cada turno.
- Extracción de campos estructurados de texto breve: formularios, correos o tickets, generando JSON con un esquema fijo; el tamaño reducido permite desplegarlo en servidores pequeños o en el borde.
- Traducción asistida español-inglés en entornos con conectividad limitada: al declarar ambos idiomas, sirve para traducción de mensajes cortos y normalización de texto en aplicaciones de campo.
- Clasificación y etiquetado de tickets de soporte: categorización por producto, urgencia o sentimiento con un coste de inferencia despreciable, ejecutable sobre CPU en paralelo a otras cargas.
- Prototipado e investigación educativa: permite experimentar con pipelines de transformers, GGUF y plantillas de chat en hardware de bajo coste, sin depender de APIs externas.
- Filtrado o preprocesado previo a un modelo mayor: resumir, normalizar o reformatear la entrada para reducir tokens enviados a un modelo de frontera.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y la búsqueda web realizada no ha devuelto documentación técnica del modelo. El único dato cuantitativo aportado por el cuantizador es el tamaño de cada archivo GGUF:

| Cuantizacion | Tamano (GB) | Notas de la model card |
|---|---|---|
| Q2_K | 0,3 | — |
| Q3_K_S | 0,3 | — |
| Q3_K_M | 0,3 | calidad inferior |
| Q3_K_L | 0,3 | — |
| IQ4_XS | 0,3 | — |
| Q4_K_S | 0,3 | rapido, recomendado |
| Q4_K_M | 0,3 | rapido, recomendado |
| Q5_K_S | 0,4 | — |
| Q5_K_M | 0,4 | — |
| Q6_K | 0,4 | muy buena calidad |
| Q8_0 | 0,5 | rapido, mejor calidad |
| f16 | 0,8 | 16 bpw, excesivo |

## Requisitos de hardware
- VRAM para inferencia: aproximadamente 0,7 GB en f16 (354,5M de parámetros x 2 bytes), ~0,38 GB en Q8_0 y ~0,22 GB en Q4_K_M, más el KV cache y el overhead del runtime. En la práctica, menos de 1 GB en cualquier configuración.
- GPU recomendadas: cualquier GPU consumer sirve; una RTX 4090 o una A100 estarían enormemente sobredimensionadas. Resultan suficientes GPUs integradas (Intel Iris Xe, AMD Radeon integrada) e incluso iGPUs modestas.
- Cabe en GPU consumer: sí, en todas las gamas actuales, y también en CPU pura. Es viable en Raspberry Pi 4/5, en mini-PC con 4 GB de RAM y en dispositivos móviles de gama media-alta.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, kobold.cpp, llama-cpp-python, y bindings de llama.cpp para Node, Rust o Go. vLLM puede cargar GGUF de forma experimental, pero no es la vía recomendada para este tamaño; TGI no soporta GGUF de forma nativa.
- Latencia y throughput estimados: no disponibles. No se han publicado cifras de tokens por segundo para este repositorio; el rendimiento dependerá de la cuantización elegida, del backend (CPU con AVX2/AVX-512, Metal, CUDA) y del ancho de banda de memoria del dispositivo.

## Comparativa con modelos similares
La comparativa se limita a datos verificables en la información disponible; los campos no documentados se marcan como no disponibles. Todos los modelos listados son alternativas de la misma franja de tamaño (sub-1B), pensadas para despliegue local.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ZynDwarf-1.1 (este repo, GGUF) | 354,5M | no disponible | apache-2.0 | Cuantizaciones GGUF de 0,3 a 0,8 GB; es/en; tool calling declarado |
| LFM2-350M (familia declarada del base) | ~350M | no disponible en la informacion proporcionada | consultar licencia de la familia LFM2 | Mismo orden de parametros; el modelo base de ZynDwarf-1.1 parece derivar de esta familia |
| SmolLM2-360M | ~362M | no disponible en la informacion proporcionada | Apache 2.0 | Alternativa habitual en la franja de 350M para edge; consultar ficha oficial |
| Qwen2.5-0.5B | ~494M | no disponible en la informacion proporcionada | Apache 2.0 | Un escalon por encima en parametros; consultar ficha oficial |
| Llama-3.2-1B | ~1.240M | no disponible en la informacion proporcionada | Llama 3.2 Community License | Mayor capacidad potencial, con restricciones de licencia distintas |

No se dispone de resultados comparativos de rendimiento entre estos modelos dentro de la información proporcionada, por lo que no es posible establecer una clasificación objetiva.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados. Un modelo de 350M ajustado sobre un corpus no especificado tiende a reproducir sesgos de su dataset de entrenamiento, que aquí no se describe.
- Riesgo de alucinación: alto en tareas de conocimiento factual, esperable en esta franja de parámetros. No debe usarse como fuente de verdad sin verificación externa.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad en código, matemáticas, tool calling o conversación; las capacidades declaradas provienen únicamente de etiquetas.
- Falta de documentación del entrenamiento: se desconoce el número de tokens, la composición del dataset, la existencia de RLHF/DPO y la plantilla de chat exacta del modelo base. Esto dificulta reproducir el comportamiento esperado.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos ni con historiales de conversación extensos sin verificarlo empíricamente.
- Cobertura lingüística limitada: solo español e inglés. El rendimiento relativo entre ambos idiomas no está documentado.
- Cuantizaciones de baja precisión: Q2_K y Q3_K degradan la calidad de forma perceptible; la propia model card marca Q3_K_M como de calidad inferior. Para producción se recomienda Q4_K_M o superior.
- Sin quants ponderados/imatrix: puede existir una pérdida de calidad mayor que la habitual en cuantizaciones estáticas del mismo tamaño.
- Uso comercial: la licencia Apache 2.0 del repositorio GGUF permite uso comercial, pero conviene verificar la licencia del modelo base itsZyn/ZynDwarf-1.1 y de la familia LFM2 subyacente antes de desplegarlo en producto.
- Advertencia de fiabilidad: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, y las fechas de creación y actualización (2026-09-12) resultan anómalas; conviene validar el contenido antes de integrarlo en un pipeline crítico.
- Los resultados de la búsqueda web realizada no contienen documentación técnica del modelo (devolvieron páginas genéricas de YouTube), por lo que no ha sido posible contrastar ninguna afirmación de la model card con fuentes independientes.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/ZynDwarf-1.1-GGUF
- Modelo base: https://huggingface.co/itsZyn/ZynDwarf-1.1
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#ZynDwarf-1.1-GGUF
- Solicitudes de cuantización y FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de archivos GGUF (README de TheBloke, referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa del cuantizador): https://www.nethype.de/
- Paper, blog o demo oficial del modelo: no disponible en la informacion proporcionada.
