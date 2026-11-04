# ryan1145/mob-smollm2-1.7b-resmlp

## Resumen

`mob-smollm2-1.7b-resmlp` no es un modelo de lenguaje completo, sino una cabeza de salida (output head) basada en una mezcla de Bernoullis (Mixture-of-Bernoullis, MoB) diseñada para sustituir la capa de proyección final de SmolLM2-1.7B. La publica el usuario ryan1145 dentro del proyecto MoB_Head y contiene exclusivamente los pesos de la cabeza (50.757.760 parámetros) junto con un codebook semántico indexado por token-ID. El backbone y el tokenizador se cargan por separado desde HuggingFaceTB/SmolLM2-1.7B y permanecen congelados.

El objetivo es aproximar la distribución del profesor (SmolLM2-1.7B) mediante códigos binarios semánticos en lugar de una softmax densa sobre el vocabulario, lo que abre la puerta a decodificación en cascada y a esquemas de reranking con menor coste computacional en la capa final. La familia de cabeza elegida es `resmlp`, con argumentos de construcción `depth=5`, `h=2048`, `k=128`, `m=16` y `width=3072`, sobre un vocabulario de 49.152 tokens.

Es relevante ahora porque explora una vía poco habitual (cabezas generativas alternativas a la softmax estándar) para reducir el coste de la capa de salida en modelos pequeños, un cuello de botella real en decodificación autoregresiva. No obstante, el propio autor reconoce que el artefacto no supera a CFHead en el equilibrio global de aceleración y que la generación libre puede derivar, por lo que debe tratarse como material de investigación, no como sustituto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza Mixture-of-Bernoullis (familia `resmlp`), sobre backbone SmolLM2-1.7B congelado |
| Parametros totales | 50.757.760 (solo la cabeza; el backbone se carga aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del backbone SmolLM2-1.7B; el entrenamiento usó secuencias de 512) |
| Tipos de cuantizacion | no disponible (serializado en fp32 safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32, sin estado del optimizador) |

## Arquitectura y entrenamiento

La cabeza pertenece a la familia `resmlp` y se construye con `depth=5`, `h=2048`, `k=128`, `m=16` y `width=3072`. El backbone SmolLM2-1.7B permanece congelado durante todo el entrenamiento; solo se optimizan los pesos de la cabeza. La salida se organiza como una mezcla de Bernoullis sobre códigos binarios semánticos indexados por token-ID, con un vocabulario de 49.152 tokens. El modelo no es un `AutoModelForCausalLM` de Transformers y requiere el cargador propio del proyecto (`mob.hub.load_head`), que valida los hashes de pesos y codebook y no ejecuta código remoto. No se debe sustituir el tokenizador ni reordenar los token-ID.

El entrenamiento minimiza la NLL exacta de códigos ponderada por las probabilidades del profesor sobre el soporte top-1024 renormalizado del mismo, sin objetivos muestreados ni ruido continuo en el target. Se usaron 228.000 actualizaciones, batch de 8, longitud de secuencia 512, datos de FineWeb-Edu, schedule coseno, LR pico de 0,001 y 4.000 pasos de warmup. Como controles de estabilidad se aplican inicialización de vértices, regularización de entropía de la mezcla y annealing de la temperatura de la mezcla.

## Capacidades

- Aproximación de la distribución de salida del profesor SmolLM2-1.7B mediante códigos binarios semánticos.
- Generación de logits de bits y logits de mezcla (`bit_logits`, `mixture_logits`) a partir de los estados ocultos finales normalizados.
- Decodificación independiente mediante los decodificadores de código de `mob.mob_common`.
- Reranking en cascada, siempre que se disponga de las filas correspondientes de la tabla de salida nativa.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso por sí misma.
- Capacidades multilingües limitadas al inglés (idioma declarado: `en`).
- No incluye visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación sobre cabezas de salida alternativas a la softmax: permite experimentar con mezclas de Bernoullis y códigos semánticos binarios en un backbone pequeño y bien documentado como SmolLM2-1.7B.
- Decodificación en cascada con reranking: se puede usar como propuesta rápida de candidatos y validar después con la tabla de salida nativa, reduciendo el coste de la capa final en entornos controlados.
- Destilación de conocimiento desde un profesor hacia una cabeza compacta: el artefacto sirve como referencia reproducible de un pipeline de destilación con soporte top-1024 y datos FineWeb-Edu.
- Estudio de compresión de la capa de salida: útil para medir cuánto de la distribución del profesor se preserva con 50,7 M de parámetros en lugar de la proyección densa completa.
- Benchmarking de latencia en la capa final: permite comparar throughput y speedups frente a CFHead u otras cabezas en distintas configuraciones de hardware, batch y vocabulario.
- Docencia y reproducción de experimentos: el repositorio incluye configuración de entrenamiento detallada (updates, batch, LR, schedule), lo que facilita replicar el setup en laboratorio.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| normalized_ppl_ratio | 1,9 |

El autor indica que la perplejidad normalizada se calcula sumando sobre los códigos válidos del vocabulario, no sobre todos los vértices del hipercubo, y que la recall de candidatos y el acuerdo de reranking se miden por separado. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas detalladas frente a CFHead más allá de la afirmación cualitativa de que el rendimiento es cercano pero no superior en el equilibrio global de aceleración.

## Requisitos de hardware

- VRAM estimada para la cabeza: aproximadamente 0,2 GB en fp32 (50,7 M de parámetros); el grueso del consumo lo determina el backbone SmolLM2-1.7B, que se carga aparte.
- GPU recomendadas: no disponibles de forma específica; al tratarse de una cabeza pequeña, cualquier GPU con capacidad para el backbone de 1,7 B es suficiente.
- Cabe en GPU de consumo: sí, siempre que el backbone quepa; una RTX 4090 o RTX 3090 puede alojar el conjunto en fp16/bf16 con holgura.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama de forma directa, ya que no es un modelo de Transformers estándar; requiere el cargador `mob.hub.load_head` del proyecto MoB_Head.
- Latencia y throughput: no disponibles; el autor señala que los speedups dependen del hardware, el vocabulario, el batch y la ruta de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mob-smollm2-1.7b-resmlp | 50,7 M (cabeza) | no disponible | MIT | HuggingFace | Cabeza MoB sobre SmolLM2-1.7B; requiere cargador propio |
| CFHead | no disponible | no disponible | no disponible | no disponible | Referencia comparativa citada por el autor; el proyecto no la supera en equilibrio de aceleración |
| SmolLM2-1.7B (backbone) | 1,7 B | no disponible | no disponible | HuggingFace | Modelo base congelado sobre el que opera la cabeza |

No se dispone de datos numéricos suficientes para una comparación cuantitativa con CFHead ni con otras cabezas alternativas.

## Limitaciones y advertencias

- La cabeza aproxima al profesor y no preserva su distribución completa; la generación libre de formato largo puede derivar.
- La decodificación en cascada está limitada por la recall de la propuesta.
- Los speedups dependen del hardware, el vocabulario, el batch y la ruta de decodificación; no hay garantía de aceleración universal.
- El proyecto comparó con CFHead y encontró rendimiento cercano en varios ajustes, pero sin superar su equilibrio global de aceleración.
- No es un modelo de Transformers estándar: `AutoModelForCausalLM` no puede cargarlo.
- No se debe sustituir el tokenizador ni reordenar los token-ID; hacerlo invalida el codebook.
- Solo inglés declarado; sin capacidades multilingües verificadas.
- Licencia MIT para el artefacto, pero los términos del backbone original (SmolLM2) y del dataset (FineWeb-Edu) siguen aplicándose.
- No incluye parámetros del backbone ni texto del corpus.
- Riesgo de alucinación y sesgos heredados del profesor y de FineWeb-Edu, no evaluados de forma independiente en la información disponible.
- No apto para producción sin validación adicional; pensado para investigación.

## Enlaces

- HuggingFace: https://huggingface.co/ryan1145/mob-smollm2-1.7b-resmlp
- Repositorio MoB_Head: https://github.com/ryan-he-47/MoB_Head
- Modelo base SmolLM2-1.7B: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
