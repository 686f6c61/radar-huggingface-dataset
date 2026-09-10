# SelectiveDOPD/JustRL-Qwen3-1p7b-Selective-Top10pct

## Resumen

JustRL-Qwen3-1p7b-Selective-Top10pct es un ajuste fino del modelo denso Qwen3-1.7B, publicado por el usuario SelectiveDOPD en HuggingFace. El nombre del repositorio indica que el checkpoint proviene del experimento interno `justrl_qwen3_1p7b_js_top10_kl`, dentro de una línea de trabajo denominada BiDirect-OPD, y que se ha aplicado algún tipo de post-entrenamiento con refuerzo (el prefijo «JustRL» y el sufijo «Selective-Top10pct» apuntan a una selección del 10 % superior de muestras o de tokens durante el proceso). No hay model card descriptiva: el README se limita a indicar el origen del checkpoint y la lista de ramas disponibles.

El modelo cuenta con 2.031.739.904 parámetros reales según los ficheros safetensors, lo que lo sitúa en la gama de los modelos pequeños de 2.000 millones de parámetros, adecuados para inferencia en una sola GPU de consumo. La arquitectura es la del transformer decoder-only de la familia Qwen3, de tipo denso (no MoE), y el pipeline declarado es `text-generation` con soporte conversacional y compatibilidad con Text Generation Inference y endpoints.

Su relevancia actual es limitada pero concreta: se trata de un artefacto de investigación con cero descargas y cero «likes» en el momento de la consulta, pensado para reproducir o auditar una receta de RL sobre un modelo base pequeño. El repositorio ocupa 28,5 GB porque incluye quince ramas de checkpoint (`global_step_20` hasta `global_step_300`, con `main` apuntando a `global_step_300`), lo que permite estudiar la evolución del entrenamiento paso a paso. La licencia no está declarada, un punto crítico antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, basado en Qwen3 (no MoE) |
| Parametros totales | 2.031.739.904 (2,03 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card (el modelo base Qwen3-1.7B emplea 32.768 tokens nativos, ampliables con YaRN; no confirmado para este checkpoint) |
| Tipos de cuantizacion | No disponible. No se documentan conversiones oficiales a GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (segun las etiquetas del repositorio); se desconoce si hay otros formatos |
| Libreria de inferencia | transformers |
| Pipeline | text-generation |
| Compatibilidad declarada | text-generation-inference, endpoints_compatible |
| Ramas de checkpoint | `main` (global_step_300) mas global_step_20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280 |
| Tamano del repositorio | 28,5 GB (incluye todas las ramas) |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de tipo denso, heredada del modelo base Qwen3-1.7B. Con 2,03 mil millones de parámetros, se trata de un modelo compacto que no emplea mezcla de expertos, por lo que la totalidad de los pesos se activa en cada paso de inferencia. No se dispone de información sobre la configuración exacta de capas, cabezas de atención, dimensión oculta ni el vocabulario utilizado, más allá de lo que se deduce del modelo base.

En cuanto al entrenamiento, la única información disponible es indirecta: el identificador del checkpoint de origen (`justrl_qwen3_1p7b_js_top10_kl`) y el nombre «BiDirect-OPD» sugieren un entrenamiento con refuerzo (RL) con una componente KL y algún tipo de selección del 10 % superior. No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo fases de SFT, DPO o RLHF, ni qué algoritmo de RL se aplicó. Tampoco se documentan innovaciones técnicas asociadas, como decodificación especulativa, atención lineal o modos de razonamiento extendido. La existencia de quince ramas de checkpoint numeradas permite, en teoría, trazar la curva de aprendizaje durante el ajuste, pero el autor no aporta curvas de pérdida, métricas ni notas de entrenamiento.

## Capacidades

- Generación de texto autoregresiva en formato de texto plano y en formato conversacional (la etiqueta `conversational` está presente en el repositorio).
- Conversación multi-turno: al heredar la plantilla de chat de Qwen3, el modelo puede estructurar diálogos con roles de sistema, usuario y asistente.
- Razonamiento y matemáticas elementales: capacidades presumibles por herencia del modelo base Qwen3-1.7B, sin verificación publicada para este checkpoint concreto.
- Generación de código: capacidad presumible por herencia del modelo base, no confirmada en la model card.
- Soporte de tool calling / function calling: no documentado en la información disponible; el modelo base Qwen3 sí lo soporta, pero no hay confirmación de que el ajuste lo preserve.
- Comportamiento agéntico y razonamiento multi-paso: no documentado.
- Modo «thinking» explícito: no documentado para este checkpoint (Qwen3 lo incorpora en su plantilla, pero no hay evidencia de que este ajuste lo mantenga).
- Capacidades multimodales (visión, audio): no disponibles; el repositorio no incluye componentes de visión.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas, aunque el modelo base Qwen3 cubre más de un centenar de idiomas.

## Casos de uso

- Evaluación de recetas de RL sobre modelos pequeños: el repositorio incluye quince checkpoints intermedios, lo que permite comparar el comportamiento del modelo antes y después de cada fase de entrenamiento y medir el efecto del ajuste con refuerzo en tareas controladas.
- Reproducción de experimentos académicos: un grupo de investigación puede descargar las ramas y analizar cómo evoluciona la perplejidad, la tasa de respuestas correctas o la longitud media de las respuestas a lo largo de los pasos 20 a 300.
- Prototipado rápido en local: con 2,03 B de parámetros en bf16 (unos 4 GB), el modelo cabe en GPUs de consumo con 8 GB o más, lo que lo hace útil para probar prompts y plantillas de chat sin coste de API.
- Generación de texto asistida en entornos con recursos limitados: tareas de resumen, reescritura o clasificación de textos cortos en una única GPU, siempre que la licencia se aclare antes de un uso real.
- Base para destilación o ajuste adicional: al ser un modelo pequeño y con pesos en safetensors, puede servir como punto de partida para LoRA o QLoRA sobre dominios específicos.
- Experimentación con decodificación y cuantización: útil para medir el impacto de técnicas de cuantización en un modelo de 2 B parámetros que, por tamaño, se puede ejecutar en CPU con llama.cpp si se generan conversiones GGUF.
- Docencia y demostraciones de pipelines de transformers y TGI: la compatibilidad declarada con `text-generation-inference` y `endpoints_compatible` facilita montar una demo de servidor de inferencia sin infraestructura compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, BBH ni ninguna otra métrica, y los resultados de la búsqueda web no contienen información relacionada con el modelo (los enlaces recuperados tratan de temas no relacionados, como atajos de teclado y componentes fotovoltaicos, y no aportan datos utilizables).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 4,1 GB solo para los pesos, más el espacio para la caché KV y las activaciones (del orden de 1 a 3 GB adicionales según la longitud de contexto).
- VRAM estimada en int8: alrededor de 2,1 GB para los pesos.
- VRAM estimada en 4 bits (si se genera una conversión compatible): alrededor de 1,1 a 1,3 GB para los pesos.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En tarjetas de 8 GB (RTX 3070, RTX 4060) funciona en bf16 con contextos moderados y en cuantización de 8 o 4 bits con contextos largos.
- GPU de centro de datos: no necesita A100 ni H100; una L4, una T4 (16 GB) o una A10G son suficientes para servir el modelo.
- CPU: viable con cuantización GGUF de 4 bits (aproximadamente 1,3 GB de RAM), aunque no hay conversiones documentadas por el autor.
- Opciones de despliegue: `transformers` (soporte nativo confirmado por la librería declarada), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM (compatible con arquitecturas Qwen3, aunque no verificado para este checkpoint), Ollama y llama.cpp únicamente si se generan conversiones GGUF propias.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| JustRL-Qwen3-1p7b-Selective-Top10pct | 2,03 B | No disponible (base: 32.768) | No disponible | HuggingFace, 15 ramas de checkpoint | No disponible |
| Qwen3-1.7B (modelo base) | 1,7 B declarados | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | HuggingFace, ampliamente distribuido | Benchmarks publicados por Alibaba |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | HuggingFace | Benchmarks publicados por Meta |
| Gemma 3 1B IT | 1 B aprox. | 32.000 tokens | Gemma Terms of Use | HuggingFace | Benchmarks publicados por Google |

La comparación de rendimiento con las alternativas no puede establecerse porque este checkpoint no publica métricas. A efectos prácticos, su principal diferencia frente a los modelos citados es la licencia: los tres alternativos tienen términos claros, mientras que JustRL-Qwen3-1p7b-Selective-Top10pct no declara ninguna, lo que impide determinar si el uso comercial está permitido.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no se documentan datos de entrenamiento, hiperparámetros, composición del dataset ni metodología de evaluación.
- Licencia no disponible: sin términos explícitos no se puede asumir permiso de uso comercial, redistribución ni modificación. Es un bloqueo potencial para producción.
- Idiomas no declarados: se desconoce si el ajuste con refuerzo ha degradado el multilingüismo del modelo base.
- Riesgo de alucinación: inherente a cualquier modelo de 2 B parámetros y no cuantificado en este caso; no hay evaluaciones de fidelidad factual.
- Sesgos: no evaluados ni documentados. Al derivar de Qwen3, hereda los sesgos presentes en los datos del modelo base, que tampoco se detallan aquí.
- Pérdida de capacidades por sobreajuste: un ajuste con refuerzo selectivo al 10 % puede estrechar la distribución de respuestas y reducir la diversidad, algo que no se ha medido.
- Riesgo de que el ajuste haya degradado el soporte de tool calling o el formato de chat original de Qwen3, al no verificarse en la model card.
- Contexto no confirmado: aunque el modelo base soporta 32.768 tokens, no hay garantía de que este checkpoint conserve la ventana completa ni la extensión YaRN.
- Repositorio pesado (28,5 GB) por acumulación de quince ramas; conviene descargar solo la rama necesaria para evitar consumo innecesario de disco y ancho de banda.
- Popularidad nula en el momento de la consulta (0 descargas, 0 «likes»): no hay validación por parte de la comunidad ni informes independientes de funcionamiento.
- Fecha de creación futura respecto a la fecha habitual de referencia (2026-09-10): conviene verificar la integridad de los pesos antes de utilizarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-1p7b-Selective-Top10pct
- Rama `main` (global_step_300): https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-1p7b-Selective-Top10pct/tree/main
- Modelo base de referencia Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Documentación de Text Generation Inference: https://huggingface.co/docs/text-generation-inference
- Documentación de transformers: https://huggingface.co/docs/transformers
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en los resultados de búsqueda web disponibles.
