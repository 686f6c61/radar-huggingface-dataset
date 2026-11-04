# ryan1145/Llama-MoB-3.2-1B-MLP

## Resumen

Llama-MoB-3.2-1B-MLP es una cabeza de salida (output head) de tipo Mixture-of-Bernoullis (MoB) entrenada por el usuario ryan1145 sobre el backbone congelado de meta-llama/Llama-3.2-1B. No es un modelo de lenguaje completo ni un Transformer causal cargable con `AutoModelForCausalLM`: es un artefacto de 32.255.232 parametros que sustituye la proyeccion final al vocabulario por una mezcla de codigos binarios semanticos indexados por token-ID, junto con un codebook asociado.

El objetivo es acelerar y comprimir la etapa de decodificacion de la salida mediante codigos binarios y destilacion de conocimiento desde el profesor original. La cabeza se entrena minimizando la NLL exacta ponderada por las probabilidades del profesor sobre el soporte top-1024 renormalizado, sobre datos de FineWeb-Edu y con el backbone congelado. Es relevante para quienes investigan alternativas a la capa `lm_head` tradicional, decodificacion especulativa y reranking en cascada, no para uso como modelo generativo autonomo.

La publicacion es muy reciente (noviembre de 2026), sin descargas ni likes, y esta pensada para integrarse con el codigo del proyecto MoB_Head. Requiere el backbone y el tokenizer originales como dependencias separadas y no admite sustitucion del tokenizer ni reordenacion de IDs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de salida Mixture-of-Bernoullis (MoB) sobre backbone Llama-3.2-1B congelado; familia `mob` |
| Parametros totales | 32.255.232 (solo la cabeza; el backbone es una dependencia aparte) |
| Parametros activos | no disponible (no es un modelo MoE de backbone; la mezcla opera en la cabeza) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso secuencias de 512 tokens |
| Tipos de cuantizacion | no disponible (serializacion en fp32 safetensors) |
| Idiomas soportados | en |
| Licencia | llama3.2 (Llama 3.2 Community License); codigo de carga original bajo MIT |
| Formato de pesos | safetensors (fp32, sin estado del optimizador) mas codebook semantico indexado por token-ID |
| Vocabulario | 128.256 tokens |
| Constructor de la cabeza | `{"depth": 3, "h": 2048, "k": 128, "m": 17, "width": 3072}` |
| Modelo base | meta-llama/Llama-3.2-1B |

## Arquitectura y entrenamiento

La cabeza pertenece a la familia `mob` y se construye con profundidad 3, dimension oculta 2048, k=128, m=17 y anchura 3072, generando 32.255.232 parametros. En lugar de una proyeccion lineal densa al vocabulario, produce logits de bits y logits de mezcla (`bit_logits, mixture_logits = head(h)`) que se interpretan mediante un codebook de codigos binarios semanticos indexado por token-ID. El backbone Llama-3.2-1B permanece completamente congelado durante el entrenamiento.

El entrenamiento consiste en destilacion de conocimiento: se minimiza la NLL exacta de codigos ponderada por las probabilidades del profesor sobre el soporte top-1024 renormalizado, sin objetivos muestreados ni ruido continuo en los targets. Se usan controles de estabilidad como inicializacion de vertices, regularizacion de entropia de la mezcla y annealing de temperatura de mezcla. Los datos son FineWeb-Edu, con longitud de secuencia 512, schedule inicial WSD con pico de learning rate 0,0007, seguido de una fase de pulido de 50.000 actualizaciones con pico 0,0002.

## Capacidades

- Aproximacion de la distribucion de salida del profesor Llama-3.2-1B mediante codigos binarios y mezcla de Bernoulli.
- Generacion de logits de bits y de mezcla a partir de estados ocultos finales normalizados, con forma `[positions, hidden_size]`.
- Decodificacion independiente mediante los decodificadores de codigo de `mob.mob_common`.
- Reranking en cascada cuando se dispone de las filas correspondientes de la tabla de salida nativa.
- Verificacion de integridad de pesos y codebook mediante hashes en el loader, sin ejecucion de codigo remoto.
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento: es exclusivamente una cabeza de salida.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Investigacion sobre cabezas de salida alternativas: sirve para estudiar si una Mixture-of-Bernoullis con codebook binario puede sustituir a la `lm_head` densa en terminos de coste y calidad, comparando la relacion de perplejidad normalizada registrada.
- Decodificacion especulativa y reranking en cascada: la cabeza propone candidatos mediante codigos y se reordenan contra la tabla de salida nativa, util en pipelines de inferencia de baja latencia sobre Llama-3.2-1B.
- Compresion de la etapa final del modelo: al sustituir la proyeccion densa al vocabulario por una representacion binaria, permite experimentar con reduccion de memoria y ancho de banda en el ultimo paso de la decodificacion.
- Destilacion de profesores a cabezas compactas: el esquema de NLL ponderada sobre top-1024 renormalizado es replicable para otros backbones y vocabularios, como demuestra el artefacto Qwen mencionado en la model card.
- Evaluacion de recall de propuestas: util para medir hasta que punto los codigos binarios recuperan los tokens que el profesor habria elegido, mediante las metricas de `round_agreement`.
- Prototipado academico de decodificacion con vocabulario de 128.256 tokens: permite analizar el compromiso entre velocidad y fidelidad distribucional en entornos controlados de laboratorio.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| normalized_ppl_ratio | 2,0 |
| round_agreement | 0,774 |

La perplejidad normalizada se calcula sumando sobre los codigos de vocabulario validos, no sobre todos los vertices del hipercubo. La model card indica que el recall de candidatos y el acuerdo de reranking son mediciones separadas y remite a los informes tecnicos del repositorio para datasets, recuentos de posiciones, precision y ajustes de comparacion. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para la cabeza: aproximadamente 0,13 GB en fp32 (32,26 M de parametros); hay que sumar el backbone Llama-3.2-1B completo, que en fp16 ronda los 2,5 GB y en fp32 unos 5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede alojar backbone y cabeza en fp16; para experimentacion con lotes grandes se recomienda A100 o H100.
- Cabe en GPU de consumo: si, por ejemplo RTX 3060, RTX 4060, RTX 4090, siempre que se cargue el backbone en fp16 o cuantizado.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama de forma directa, ya que no es un modelo Transformers causal; requiere el paquete MoB_Head (`mob.hub.load_head`) y los decodificadores de `mob.mob_common`.
- Latencia y throughput: no disponibles; la model card advierte que las ganancias de velocidad dependen del hardware, el vocabulario, el tamano de lote y la ruta de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-MoB-3.2-1B-MLP | 32,26 M (cabeza) + backbone 1B | no disponible (entrenado a 512) | Cabeza MoB con codebook binario y destilacion | llama3.2 | HuggingFace, requiere MoB_Head |
| CFHead (referencia del proyecto) | no disponible | no disponible | Cabeza de salida alternativa comparada en la model card | no disponible | no disponible |
| Llama-3.2-1B (original) | 1,24 B aprox. | 128.000 tokens (segun modelo base) | Transformer causal denso con `lm_head` estandar | llama3.2 | HuggingFace, Transformers |

La model card senala que la comparacion del proyecto encontro un rendimiento cercano a CFHead en varios ajustes, pero sin superar su compromiso global de aceleracion. No se dispone de datos de parametros ni contexto de CFHead en la informacion proporcionada.

## Limitaciones y advertencias

- La cabeza aproxima a su profesor y no preserva su distribucion completa; la generacion libre de formato largo puede derivar.
- La decodificacion en cascada esta limitada por el recall de propuestas.
- No es un modelo de lenguaje completo: `AutoModelForCausalLM` no puede cargarlo y no debe sustituirse el tokenizer ni el orden de IDs de token.
- El unico idioma declarado es ingles.
- Las ganancias de velocidad no estan garantizadas y dependen de hardware, vocabulario, lote y ruta de decodificacion.
- Licencia llama3.2: el uso comercial esta sujeto a la Llama 3.2 Community License, con obligaciones de atribucion ("Built with Llama") y terminos del backbone y del dataset originales.
- Riesgo de alucinacion y sesgos: no evaluados de forma independiente en la informacion disponible; hereda los del backbone Llama-3.2-1B.
- Artefacto muy reciente y sin adopcion (0 descargas, 0 likes): no hay evidencia de comunidad ni soporte a terceros.
- El loader solo verifica hashes y no ejecuta codigo remoto, pero el uso de `mob.mob_common` y del paquete MoB_Head anade dependencias externas que deben auditarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryan1145/Llama-MoB-3.2-1B-MLP
- Repositorio MoB_Head: https://github.com/ryan-he-47/MoB_Head
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
