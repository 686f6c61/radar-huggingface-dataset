# skmbkang/tinystories-gpt2-30m

## Resumen

tinystories-gpt2-30m es un modelo de lenguaje causal de tipo GPT-2 implementado y preentrenado desde cero por el usuario skmbkang, con el objetivo declarado de servir como material de aprendizaje. No es un fine-tune de un GPT-2 preexistente: el autor reimplementó la arquitectura en PyTorch (6 capas, 6 cabezas de atención, dimensión oculta de 384 y ventana de contexto de 256 tokens), la entrenó sobre el corpus TinyStories y posteriormente convirtió los pesos al formato `GPT2LMHeadModel` de la librería Transformers.

El modelo cuenta con 30.044.544 parámetros reales según el archivo safetensors, un tamaño que lo sitúa en la gama ultraligera y lo hace ejecutable en CPU, en GPUs integradas y en hardware de muy bajos recursos. Su utilidad práctica es acotada: genera cuentos infantiles cortos en inglés con estructuras narrativas simples, y sirve como banco de pruebas para experimentos de tokenización, decodificación y ajuste fino a pequeña escala.

Su relevancia ahora es fundamentalmente didáctica y de investigación sobre modelos pequeños: demuestra el ciclo completo de entrenamiento (dataset, mixed precision, validación, conversión de pesos) con un coste de cómputo accesible —el entrenamiento se realizó en una RTX 4060 Laptop— y publica la pérdida de validación obtenida (1,5472) junto con la licencia MIT, lo que facilita su reutilización y disección.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (atención multi-cabeza estándar, sin variantes lineales ni MoE) |
| Parámetros totales | 30.044.544 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | No se distribuyen cuantizaciones oficiales; al publicarse en safetensors es cuantificable con herramientas externas (por ejemplo llama.cpp o GPTQ). El autor verificó inferencia en fp16 con generación greedy idéntica a fp32 |
| Idiomas soportados | Inglés (declarado en la model card; el corpus es exclusivamente inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con `GPT2LMHeadModel` de Transformers); el repositorio ocupa 0,1 GB |

Otros datos técnicos: 6 capas, 6 cabezas de atención, dimensión de modelo 384, tokenizador GPT-2 con vocabulario de 50.257 tokens. Biblioteca: transformers. Pipeline: text-generation. Compatible con text-generation-inference y endpoints.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clásico de estilo GPT-2, con normalización previa a la atención y al bloque feed-forward, embeddings posicionales aprendidos y objetivo de modelado de lenguaje autorregresivo (predicción del siguiente token). La configuración es deliberadamente minúscula: 384 dimensiones ocultas, 6 capas y 6 cabezas, lo que da lugar a una cabeza de 64 dimensiones. La ventana de contexto de 256 tokens es una de las restricciones más severas del modelo y condiciona todos sus casos de uso.

El entrenamiento se realizó desde cero sobre el dataset roneneldan/TinyStories (licencia CDLA-Sharing-1.0), un corpus sintético de cuentos infantiles en inglés generado con GPT-3.5 y GPT-4 y diseñado precisamente para estudiar el aprendizaje lingüístico en modelos pequeños. Se ejecutaron 9.000 pasos con precisión mixta bf16, procesando aproximadamente 295 millones de tokens en una RTX 4060 Laptop, y se alcanzó una pérdida de validación de 1,5472. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna otra fase de alineación posterior al preentrenamiento; tampoco se detallan la composición exacta del subconjunto utilizado ni la configuración del optimizador y el learning rate.

## Capacidades

- Generación de texto narrativo corto en inglés, con estructuras de cuento infantil (fórmulas de apertura tipo "Once upon a time", personajes simples, finales cerrados).
- Continuación de prompts con coherencia local dentro de ventanas muy cortas (256 tokens).
- Generación con muestreo configurable (temperatura, top-k) y decodificación greedy; el autor verificó la equivalencia de la generación greedy entre fp16 y fp32.
- Capacidad de ajuste fino posterior para tareas acotadas de clasificación o generación sobre dominios simples, dado su tamaño reducido.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente, razonamiento multi-paso ni planificación.
- No dispone de modo "thinking", visión, audio ni multimodalidad.
- Multilingüe: no; el modelo está entrenado únicamente en inglés y no se ha evaluado su comportamiento en castellano.

## Casos de uso

- Docencia y formación en NLP: sirve para explicar el ciclo completo de preentrenamiento de un transformer (tokenización, batches, mixed precision, pérdida de validación) con un coste de cómputo que cabe en un portátil, ya que el modelo se entrenó en una RTX 4060 Laptop.
- Banco de pruebas de tokenizadores: al usar el tokenizador GPT-2 con 50.257 entradas sobre un vocabulario infantil muy restringido, permite medir empíricamente la eficiencia de compresión de tokens y experimentar con vocabularios alternativos.
- Generación de cuentos infantiles sintéticos para aumentar datasets: puede producir textos cortos en inglés para pruebas de pipelines de datos, siempre con revisión humana y siendo consciente de que la coherencia decae más allá de unas pocas frases.
- Verificación de pipelines de inferencia: su tamaño (30M parámetros, ~60 MB en fp16) permite validar integraciones de Transformers, TGI o endpoints antes de migrar a modelos mayores, sin consumir recursos significativos.
- Investigación sobre currículos de datos: al estar entrenado exclusivamente con TinyStories, es un punto de partida controlado para estudiar cómo distintos subconjuntos o currículos afectan a la pérdida y a la calidad narrativa en modelos pequeños.
- Pruebas de cuantización y decodificación especulativa a escala reducida: el modelo es lo bastante pequeño como para comparar fp32, fp16 e int8 en minutos, y para servir de modelo borrador en experimentos de decodificación especulativa con modelos mayores.
- Prototipado de interfaces de escritura creativa offline: puede ejecutarse en dispositivos sin GPU para demostrar flujos de autocompletado, aceptando la limitación de contexto de 256 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento reportada por el autor es la pérdida de validación, que se recoge en la tabla siguiente junto con los datos de entrenamiento:

| Métrica | Valor |
|---|---|
| Pérdida de validación | 1,5472 |
| Pasos de entrenamiento | 9.000 |
| Tokens de entrenamiento | ~295 millones |
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Perplejidad en otros corpus | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 120 MB en fp32, unos 60 MB en fp16/bf16 y unos 30 MB en int8 (cálculo teórico a partir de los 30.044.544 parámetros, sin contar activaciones ni overhead del runtime).
- GPU recomendadas: ninguna en particular; el modelo es funcional en cualquier GPU con al menos 1 GB de memoria. Se ha validado su entrenamiento en una RTX 4060 Laptop.
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 3060, GTX 1650, GPUs integradas e incluso en CPU. También es viable en dispositivos móviles y en Raspberry Pi.
- Opciones de despliegue: Transformers (ruta nativa, con `AutoModelForCausalLM`), text-generation-inference (el modelo declara compatibilidad), endpoints de HuggingFace. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Por el tamaño del modelo, la latencia estará dominada por el overhead del runtime más que por el cómputo, especialmente en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenado con TinyStories | Licencia | Rendimiento en benchmarks |
|---|---|---|---|---|---|
| skmbkang/tinystories-gpt2-30m | 30,04 M | 256 | Sí | MIT | No disponible |
| roneneldan/TinyStories-33M | ~33 M (dato de referencia pública, no verificado en esta ficha) | ~512 (dato de referencia pública, no verificado) | Sí | MIT (según referencia pública) | No disponible |
| roneneldan/TinyStories-1M | ~1 M (dato de referencia pública no verificado) | ~512 (dato de referencia pública no verificado) | Sí | MIT (según referencia pública) | No disponible |
| GPT-2 small (OpenAI) | 124 M | 1.024 | No | MIT | No comparable directamente (otro régimen de entrenamiento) |

La comparación cuantitativa de calidad no puede establecerse con la información disponible: no se han publicado evaluaciones cruzadas entre estos modelos en la documentación consultada. Como referencia cualitativa, los modelos de la familia TinyStories del autor original emplean ventanas de contexto mayores, mientras que esta implementación limita el contexto a 256 tokens, lo que reduce su utilidad en tareas que requieran memoria conversacional.

## Limitaciones y advertencias

- Dominio extremadamente restringido: solo se ha entrenado con cuentos infantiles en inglés. No tiene conocimiento general, no responde preguntas factuales y no debe usarse como asistente.
- Contexto de 256 tokens: cualquier prompt o conversación que exceda esa longitud queda truncado; no es apto para diálogo multi-turno ni para documentos.
- Idioma: no soporta castellano ni ningún otro idioma de forma fiable; el author lo indica explícitamente en la model card.
- Riesgo alto de alucinación y de degeneración: al ser un modelo de 30M parámetros entrenado con ~295M tokens, la coherencia se rompe rápidamente y puede producir repeticiones, incoherencias gramaticales y finales abruptos.
- Sin alineación: no consta ninguna fase de RLHF, DPO o filtrado de seguridad, por lo que no hay garantías sobre el contenido generado; debe aplicarse filtrado externo en cualquier despliegue orientado a menores.
- Sesgos: no se han documentado evaluaciones de sesgo. Al derivar de un corpus sintético generado por GPT-3.5/GPT-4, puede heredar estereotipos presentes en esos modelos y en el filtrado aplicado por los autores del dataset.
- Licencia del modelo MIT, pero el dataset de origen (TinyStories) se distribuye bajo CDLA-Sharing-1.0; conviene revisar los términos de esa licencia de datos si se redistribuyen derivados del corpus.
- Trazabilidad limitada: la model card está en coreano, no incluye detalles de hiperparámetros más allá de los pasos y la precisión, y el modelo cuenta con muy pocas descargas y ninguna interacción, por lo que no ha sido validado por la comunidad.
- No apto para producción: sin benchmarks, sin evaluación de robustez y con contexto mínimo, solo debería emplearse con fines educativos o experimentales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skmbkang/tinystories-gpt2-30m
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de TinyStories (referencia del corpus): no disponible en la búsqueda realizada
- Repositorio de código del autor: no disponible
- Demo o espacio asociado: no disponible
- Blog o notas de entrenamiento: no disponible
- El resto de resultados de la búsqueda web no guardan relación con el modelo (foros de operadores móviles y de vehículos) y se descartan por no ser relevantes.
