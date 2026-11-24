# LiraNuna/LFM3-1.7B-GGUF

## Resumen

LFM3-1.7B-GGUF es la distribución en formato GGUF de LFM3-1.7B, un derivado comunitario del modelo LiquidAI/LFM3-1.7B desarrollado por Liquid AI. Se trata de una versión "loop-fixed" y "reasoning-uplifted": el autor original del modelo base (LiraNuna) aplicó técnicas de programación en el espacio de pesos (Weight-Space Programming) y autodestilación Top-64 KL para corregir fallos de razonamiento del modelo original, en concreto los bucles de pensamiento que no se cierran correctamente. Esta conversión GGUF la hace desplegable directamente en llama.cpp y entornos compatibles con la API de OpenAI.

El modelo tiene 1.728.801.600 parámetros y está orientado a generación de texto con capacidades de razonamiento y tool calling. Su interés radica en que ofrece un rendimiento notable en tareas de razonamiento y código para un tamaño de 1,7B, con mejoras medibles frente al modelo original: reducción del 97,2 % de bucles de pensamiento sin cerrar en contextos de 4K y 8K, 98,96 % en RULER 4K+16K, 89,63 % en HumanEval a 4K y 70,75 % en MMLU-Pro STEM con cadena de pensamiento.

La relevancia actual está en que permite ejecutar razonamiento y tool calling en hardware de consumo o edge, con cuantizaciones desde 1,1 GB (Q4_K_M) hasta 3,3 GB (BF16), y con licencia LFM Open License v1.0 que permite uso comercial gratuito por debajo de un umbral de ingresos anuales de 10 millones de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de LiquidAI/LFM3-1.7B; la model card no detalla la arquitectura interna) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (se reportan evaluaciones a 4K, 8K y 16K, pero no se declara la ventana máxima) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo base (transformer, híbrido, SSM u otra variante). Lo que sí se documenta es el proceso de modificación: los pesos de LiquidAI/LFM3-1.7B se "elevaron" mediante Weight-Space Programming combinado con autodestilación Top-64 KL. Este proceso busca corregir el comportamiento de razonamiento del modelo original, específicamente los bucles de pensamiento que no se cierran, y mejorar sus capacidades de razonamiento y tool calling. Posteriormente, los pesos modificados se convirtieron y cuantizaron a GGUF mediante llama.cpp.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La información disponible se limita a los resultados de la comparación de aproximadamente 43.000 ítems de benchmark frente al modelo original, cuyos detalles metodológicos se remiten al repositorio del modelo base LiraNuna/LFM3-1.7B.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento con cadena de pensamiento (thinking mode implícito en los benchmarks CoT reportados).
- Tool calling / function calling, con mejoras reportadas de +78 ítems en las 12 divisiones de BFCL v4.
- Razonamiento multi-paso y corrección de bucles de pensamiento (reducción del 97,2 % de bucles sin cerrar a 4K/8K).
- Generación de código, con 89,63 % en HumanEval a 4K.
- Manejo de contextos largos, con 98,96 % en RULER 4K+16K.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Asistentes de código en local: con 89,63 % en HumanEval a 4K y soporte de tool calling, el modelo puede integrarse en editores o pipelines de CI/CD para autocompletado, generación de tests y revisión de parches, ejecutándose en una GPU de consumo con la cuantización Q4_K_M (1,1 GB).
- Agentes con llamadas a herramientas: la mejora de +78 ítems en BFCL v4 lo hace adecuado para orquestar APIs y flujos multi-paso en entornos con recursos limitados, donde un modelo mayor no es viable.
- Razonamiento sobre documentos largos: el 98,96 % en RULER 4K+16K permite resumir y responder preguntas sobre contratos, informes o documentación técnica de hasta 16K tokens en despliegues edge.
- Atención al cliente automatizada en edge: al ser desplegable con llama.cpp y servidor compatible con OpenAI, puede gestionar conversaciones multi-turno en dispositivos locales sin depender de la nube, reduciendo latencia y coste.
- Prototipado e investigación de razonamiento: su naturaleza de derivado "loop-fixed" lo convierte en una base útil para estudiar corrección de bucles de pensamiento y destilación en modelos pequeños.
- Despliegue en hardware restringido: con Q4_K_M (1,1 GB) o Q5_K_M (1,2 GB) cabe en GPUs de gama baja, mini-PC y placas embebidas con suficiente RAM, para tareas de clasificación, extracción y generación acotada.
- Evaluación de cuantizaciones: la disponibilidad de cinco niveles (BF16 a Q4_K_M) permite medir la degradación de calidad en razonamiento y tool calling según la compresión.

## Benchmarks y rendimiento

| Benchmark | Resultado reportado | Contexto |
|---|---|---|
| Bucles de pensamiento sin cerrar | -97,2 % | 4K / 8K |
| RULER | 98,96 % | 4K + 16K |
| HumanEval | 89,63 % | 4K |
| MMLU-Pro STEM (CoT) | 70,75 % | no especificado |
| BFCL v4 | +78 ítems | agregado en las 12 divisiones |

Los datos proceden de la comparación de aproximadamente 43.000 ítems frente al modelo original LiquidAI/LFM3-1.7B. No se dispone de la tabla desglosada por división ni de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB (Q4_K_M), 1,2 GB (Q5_K_M), 1,4 GB (Q6_K), 1,8 GB (Q8_0) y 3,3 GB (BF16), más el overhead del runtime y del contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre para cuantizaciones de 4-6 bits; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. Para BF16 se recomienda al menos 4-6 GB de VRAM.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones, incluidas GPUs de gama baja y placas integradas con suficiente memoria unificada.
- Opciones de despliegue: llama.cpp (CLI `llama cli` y servidor `llama serve` con API compatible con OpenAI); al ser GGUF, también es compatible con otros runtimes que lo soporten, aunque la model card solo documenta llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-GGUF (este) | 1,73B | no disponible | LFM Open License v1.0 | GGUF | Derivado loop-fixed con razonamiento y tool calling |
| LiquidAI/LFM3-1.7B | 1,73B | no disponible | LFM Open License v1.0 | safetensors (original) | Modelo base sin las correcciones de razonamiento |
| LiraNuna/LFM3-1.7B | 1,73B | no disponible | LFM Open License v1.0 | safetensors | Versión uplifted antes de la conversión a GGUF |

No se dispone de datos de benchmarks de modelos de otros fabricantes en la información proporcionada, por lo que no se incluye una comparación cruzada con alternativas de terceros.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse principalmente en inglés, puede presentar sesgos culturales y lingüísticos propios de ese corpus.
- Riesgo de alucinación: no cuantificado; como modelo de 1,7B, es esperable una tasa superior a la de modelos mayores en tareas de conocimiento factual.
- Limitaciones de contexto: la ventana máxima no se declara; los benchmarks cubren hasta 16K, pero no se garantiza un rendimiento estable más allá.
- Limitaciones de idioma: solo se declara inglés; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Restricciones de licencia: LFM Open License v1.0 exige revisar la Sección 5, que establece un umbral de ingresos anuales de 10 millones de dólares para el uso comercial gratuito; por encima de ese umbral se requiere licencia comercial.
- Caveat de producción: es un derivado comunitario, no oficial de Liquid AI; conviene validar el comportamiento en el dominio propio antes de desplegarlo, especialmente en tool calling y razonamiento multi-paso.
- Al ser una cuantización, las versiones de 4-6 bits pueden degradar ligeramente la calidad en razonamiento y código respecto a BF16.

## Enlaces

- Repositorio GGUF: https://huggingface.co/LiraNuna/LFM3-1.7B-GGUF
- Modelo base derivado: https://huggingface.co/LiraNuna/LFM3-1.7B
- Modelo original: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: incluida en el archivo LICENSE del repositorio
