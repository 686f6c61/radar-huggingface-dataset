# ryan1145/mob-smollm2-1.7b-swiglu

## Resumen

`mob-smollm2-1.7b-swiglu` es una cabeza de salida (output head) basada en una mezcla de Bernoulli (Mixture-of-Bernoullis, MoB) diseñada para sustituir la capa de proyección del vocabulario de SmolLM2-1.7B. No es un modelo de lenguaje completo: el repositorio contiene únicamente los pesos de la cabeza (49.313.920 parámetros) y un libro de códigos semánticos indexado por token-ID, serializados en safetensors fp32. El backbone y el tokenizador son dependencias externas que el usuario debe aportar por separado.

La propuesta técnica consiste en aproximar la distribución de salida del profesor (SmolLM2-1.7B) mediante códigos binarios semánticos y una mezcla de componentes Bernoulli, con el objetivo de reducir el coste computacional de la capa final, que en modelos con vocabularios grandes suele ser un cuello de botella en decodificación. El entrenamiento se realizó por destilación de conocimiento con el backbone congelado, sobre FineWeb-Edu, optimizando la NLL ponderada por probabilidad exacta del profesor sobre su soporte top-1024 renormalizado.

El interés del artefacto es acotado y experimental: se publica como pieza de investigación reproducible del proyecto MoB_Head, con métricas internas de fidelidad a la distribución del profesor, pero sin evaluación en benchmarks estándar de lenguaje y sin pipeline de Transformers declarado. Resulta relevante para quienes investigan cabezas de salida eficientes, decodificación en cascada y compresión del vocabulario, no para despliegues de generación directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de salida Mixture-of-Bernoullis (familia `swiglu`, 1 bloque; argumentos `blocks=1, h=2048, hidden=7300, k=128, m=16`) sobre backbone SmolLM2-1.7B congelado |
| Parametros totales | 49.313.920 (solo la cabeza; el backbone no se incluye) |
| Parametros activos | no disponible (no es MoE; es una mezcla de Bernoulli en la capa de salida) |
| Longitud de contexto | no disponible (depende del backbone SmolLM2-1.7B; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32 safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (código de carga original de MoB_Head también MIT; aplican los términos del backbone y del dataset de origen) |
| Formato de pesos | safetensors fp32, sin estado del optimizador; incluye libro de códigos semánticos indexado por token-ID |

## Arquitectura y entrenamiento

La cabeza implementa una mezcla de Bernoulli sobre códigos binarios semánticos: en lugar de una proyección lineal densa al vocabulario, el modelo produce logits de bits y logits de mezcla que se combinan para puntuar códigos del libro de códigos. La familia `swiglu` con `blocks=1`, `h=2048`, `hidden=7300`, `k=128` y `m=16` define una única capa con activación SwiGLU, 128 componentes de mezcla y 16 bits por código semántico. El vocabulario cubierto es de 49.152 tokens, alineado con el tokenizador de SmolLM2. El artefacto no es un `AutoModelForCausalLM` de Transformers y no puede cargarse con esa clase; requiere el cargador `mob.hub.load_head` del repositorio MoB_Head, que verifica hashes de pesos y libro de códigos y no ejecuta código remoto.

El entrenamiento mantiene el backbone congelado y optimiza la NLL de códigos ponderada por la probabilidad exacta del profesor sobre su soporte top-1024 renormalizado, sin objetivos muestreados ni ruido continuo en el target. Los hiperparámetros registrados son 228.000 actualizaciones, batch de 8, longitud de secuencia 512, `teacher_topk=1024`, datos de FineWeb-Edu, schedule coseno, `peak_lr=0.0007` y 4.000 pasos de calentamiento. Como controles de estabilidad se emplean inicialización de vértices, regularización de entropía de la mezcla y annealing de temperatura de mezcla. La serialización es fp32 sin estado del optimizador.

## Capacidades

- No es un modelo generativo autónomo: es una cabeza de salida que debe combinarse con el backbone SmolLM2-1.7B y su tokenizador original.
- Aproxima la distribución de siguiente token del profesor sobre el soporte top-1024, con `mixture_recall_at_32` de 0,9776 y `cascade_agreement_at_32` de 0,9649 según la evaluación registrada.
- Decodificación independiente mediante los decodificadores de código de `mob.mob_common`.
- Reranking en cascada, que requiere las filas correspondientes de la tabla de salida nativa del backbone.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso por sí misma; esas capacidades dependerían del backbone, no de la cabeza.
- Capacidades multilingües limitadas al inglés, según el campo `language: [en]` y el dataset de entrenamiento (FineWeb-Edu).
- No incluye visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación en cabezas de salida eficientes: sustituir experimentalmente la proyección final de SmolLM2-1.7B por esta cabeza para medir el ahorro computacional en la capa de vocabulario bajo distintas configuraciones de hardware, batch y ruta de decodificación.
- Estudio de destilación de distribuciones top-k: reproducir el pipeline de destilación sobre el soporte top-1024 del profesor y analizar la fidelidad de la aproximación con las métricas de recall y acuerdo de cascada.
- Decodificación en cascada con reranking: usar la cabeza como proponente de candidatos y el modelo nativo para rerankear, evaluando el compromiso entre velocidad y calidad en tareas de generación corta.
- Compresión del vocabulario mediante códigos binarios: analizar la viabilidad de representar 49.152 tokens con códigos de 16 bits y estudiar el impacto en memoria y latencia de la capa final.
- Docencia y reproducción científica: material de partida para cursos o artículos sobre mezclas de Bernoulli aplicadas a la salida de transformers, dado que el repositorio incluye el código de carga y las métricas registradas.
- Benchmarking de cabezas alternativas: comparar esta implementación `swiglu` con CFHead y otras cabezas en entornos controlados, tal como el propio proyecto reporta en su comparación interna.

## Benchmarks y rendimiento

La model card registra métricas internas de fidelidad a la distribución del profesor, no benchmarks estándar de lenguaje:

| Metrica | Valor |
|---|---|
| `normalized_ppl_ratio` | 1,78 |
| `mixture_recall_at_32` | 0,9776 |
| `cascade_agreement_at_32` | 0,9649 |
| `native_mass_at_32` | 0,8564 |

La perplejidad normalizada se calcula sumando sobre los códigos válidos del vocabulario, no sobre todos los vértices del hipercubo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. El proyecto indica que, en su comparación interna, el rendimiento quedó cerca de CFHead en varios ajustes pero no superó su compromiso global de aceleración.

## Requisitos de hardware

- VRAM estimada para la cabeza: aproximadamente 0,2 GB en fp32 (49,3 M de parámetros), según el tamaño del repositorio; a esto se suma la memoria del backbone SmolLM2-1.7B, que no se incluye.
- VRAM total estimada: unos 3,4 GB en fp16 para el conjunto backbone más cabeza, y alrededor de 1,5-2 GB si el backbone se cuantiza a 4 bits (estimación orientativa, no publicada por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM puede alojar el conjunto en precisión reducida; para experimentación con lotes grandes se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, incluyendo RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090, siempre que se gestione la cuantización del backbone.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama de forma directa, ya que no es un modelo Transformers estándar; requiere el cargador `mob.hub.load_head` del repositorio MoB_Head.
- Latencia y throughput: no disponibles; la model card señala que las ganancias de velocidad dependen de hardware, vocabulario, batch y ruta de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mob-smollm2-1.7b-swiglu | 49,3 M (cabeza) | no disponible | Cabeza MoB sobre SmolLM2-1.7B | MIT | Hugging Face, repo de 0,2 GB |
| SmolLM2-1.7B (backbone) | 1,7 B | no disponible en esta ficha | Transformer decoder | Apache 2.0 (según el modelo original) | Hugging Face |
| CFHead (referencia del proyecto) | no disponible | no disponible | Cabeza de salida alternativa | no disponible | Repositorio MoB_Head |
| Otras cabezas de salida eficientes | no disponible | no disponible | Diversas | no disponible | no disponible |

La comparación directa con CFHead aparece mencionada en la model card, que indica que esta cabeza no superó su compromiso global de aceleración. No se dispone de datos suficientes para una comparativa cuantitativa con alternativas adicionales.

## Limitaciones y advertencias

- No es un modelo de lenguaje completo: no puede cargarse con `AutoModelForCausalLM` ni usarse sin el backbone SmolLM2-1.7B y su tokenizador original.
- No se debe sustituir el tokenizador ni reordenar los token-ID: el libro de códigos está indexado por token-ID y cualquier cambio invalida los pesos.
- La cabeza aproxima al profesor y no preserva su distribución completa; la generación libre de formato largo puede derivar.
- La decodificación en cascada está limitada por el recall de la propuesta (`mixture_recall_at_32` de 0,9776), lo que implica una fracción no despreciable de candidatos correctos fuera del conjunto propuesto.
- Las ganancias de velocidad no están garantizadas y dependen de hardware, vocabulario, batch y ruta de decodificación.
- El modelo está entrenado y evaluado solo en inglés; no se documenta soporte multilingüe.
- No se han publicado evaluaciones en benchmarks estándar de razonamiento, código o matemáticas.
- La licencia MIT del artefacto no exime del cumplimiento de los términos del backbone SmolLM2-1.7B y del dataset FineWeb-Edu.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al heredar el comportamiento del profesor, arrastra los sesgos de SmolLM2 y de FineWeb-Edu.
- El repositorio no incluye parámetros del backbone ni texto del corpus; su uso requiere descargar dependencias adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ryan1145/mob-smollm2-1.7b-swiglu
- Repositorio MoB_Head: https://github.com/ryan-he-47/MoB_Head
- Modelo base SmolLM2-1.7B: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Dataset FineWeb-Edu: no disponible en la información proporcionada
- Paper o blog técnico del proyecto: no disponible en la información proporcionada
