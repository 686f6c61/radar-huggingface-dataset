# sakamakismile/MiniCPM5-2B-NVFP4

## Resumen

MiniCPM5-2B-NVFP4 es una cuantización a 4 bits del modelo denso MiniCPM5-2B de OpenBMB, publicada por sakamakismile (Lna-Lab). El checkpoint utiliza el formato NVFP4, con 4 bits tanto en pesos como en activaciones, grupo de 16 y escalas FP8, aplicado mediante GPTQ con llm-compressor y almacenado en formato compressed-tensors que vLLM carga de forma nativa. Tiene 2.516.756.480 parámetros y, según el ejemplo de despliegue del autor, soporta un contexto de 32.768 tokens.

El objetivo es reducir el coste de inferencia sin perder demasiada calidad: los pesos ocupan 2,18 GB frente a los 5,03 GB del modelo en BF16. Está pensado para su uso en GPUs con VRAM limitada, y se empareja con el drafter oficial MiniCPM5-2B-DSpark para decodificación especulativa, lo que multiplica la velocidad de generación de código en hasta 2,7 veces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base tipo llama) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32768 tokens (max-model-len en el comando vLLM del autor) |
| Tipos de cuantizacion | NVFP4 (W4A4, group size 16, FP8 block scales) |
| Idiomas soportados | Inglés, chino y japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El checkpoint se obtiene a partir de openbmb/MiniCPM5-2B, un transformer denso basado en la arquitectura llama. La cuantización se realizó con llm-compressor mediante GPTQ, en formato compressed-tensors. Se evaluaron cuatro métodos de redondeo (RTN, AWQ, AutoRound y GPTQ) y dos precisiones de activación (W4A4 y A16 solo pesos). GPTQ resultó el más preciso, con un incremento medio de perplexity del 3,34 % frente al 15,03 % de RTN. La decisión técnica destacable es que la cuantización de activaciones a 4 bits no añade pérdida en este modelo (la variante W4A4 se comporta prácticamente igual que la variante solo pesos), por lo que se mantiene el camino nativo de GEMM FP4. Las capas de embedding y lm_head permanecen en BF16.

El modelo es una cuantización post-entrenamiento: no se aplicó preentrenamiento adicional ni RLHF/DPO. Para la calibración se utilizaron conjuntos como wikitext2, ja-wikipedia y python source. El drafter DSpark (openbmb/MiniCPM5-2B-DSpark) se mantiene en BF16 y se acopla al objetivo cuantizado sin conversión, con 7 tokens especulativos por bloque.

## Capacidades

- Generación de texto conversacional en inglés, chino y japonés.
- Razonamiento matemático, medido en GSM8K con un 80,4 % de precisión en el harness del autor.
- Generación de código, medida en HumanEval con un 39,6 % de pass@1 en el harness del autor.
- Tool calling en un dialecto XML propio (`<function name="..."><param name="...">...</param></function>`), no en JSON.
- Decodificación especulativa: compatible con el drafter oficial MiniCPM5-2B-DSpark, con aceleraciones de hasta 2,67x en tareas de código.
- No se han documentado capacidades multimodales (visión o audio).

## Casos de uso

- Asistencia al desarrollador en el IDE: con una tasa de 366 tok/s en generación de código usando DSpark, el modelo es adecuado para autocompletado en tiempo real. Su cuantización NVFP4 permite ejecutarlo en una GPU de 16 GB, por lo que puede desplegarse en un servidor de desarrollo sin hardware de datacenter.
- Herramientas de razonamiento matemático: el checkpoint alcanza un 80,4 % en GSM8K con el harness del autor. Puede integrarse en plataformas de tutoría para resolver problemas de álgebra y aritmética, explicando los pasos intermedios en inglés, chino o japonés.
- Atención al cliente multilingüe: como soporta inglés, chino y japonés, puede gestionar consultas en esos tres idiomas en un mismo sistema. El tamaño reducido permite ejecutarlo en una sola GPU para un servicio de chat multi-turno con contexto de 32k.
- Agentes con tool calling en XML: el modelo emite llamadas a funciones en XML, que es fácil de parsear. Se puede integrar en un agente que defina herramientas en el system prompt y procese las respuestas XML para ejecutar acciones como búsquedas internas, consultas a bases de datos o llamadas a APIs.
- Traducción técnica entre idiomas asiáticos: al estar especializado en chino y japonés, puede servir para traducir documentación técnica o conversaciones entre esos idiomas y el inglés. La cuantización apenas afecta la calidad en textos generales (perplexity +3,02 % en ja-wikipedia).
- Evaluación de técnicas de compresión: este checkpoint sirve como referencia reproducible para investigar cuantización NVFP4 W4A4, ya que el autor publica los resultados de varias recetas (RTN, AWQ, AutoRound, GPTQ) y sus efectos en perplexity y benchmarks.
- Generación de código en pipelines CI/CD: al ocupar 2,18 GB y arrancar rápido en vLLM, puede integrarse en un pipeline de revisión de código para sugerir parches o detectar errores. Con decodificación especulativa, el throughput en código es suficiente para procesar múltiples solicitudes.

## Benchmarks y rendimiento

### Evaluación de calidad (harness propio del autor)

| Checkpoint | GSM8K | HumanEval pass@1 |
|---|---|---|
| BF16 original | 82,0 % | 45,1 % |
| NVFP4 GPTQ (este checkpoint) | 80,4 % | 39,6 % |
| NVFP4 + last 8 layers BF16 | 77,2 % | 37,8 % |

Nota: los números absolutos no son comparables con puntuaciones publicadas; la comparación entre filas es lo significativo, ya que el prompting y la extracción se hicieron con el harness del autor, que penaliza el modelo base varios puntos.

### Evaluación de perplexidad (recetas de cuantización)

| recipe | format | wikitext2 | ja-wikipedia | python source | media Δ | tamaño |
|---|---|---|---|---|---|---|
| BF16 original | — | 13,095 | 13,113 | 2,359 | — | 5,03 GB |
| RTN | NVFP4 W4A4 | 15,081 (+15,17 %) | 15,101 (+15,16 %) | 2,707 (+14,76 %) | +15,03 % | 2,18 GB |
| AWQ | NVFP4 W4A4 | 14,509 (+10,79 %) | 14,599 (+11,33 %) | 2,535 (+7,47 %) | +9,87 % | 2,18 GB |
| AutoRound | NVFP4 W4A4 | 14,662 (+11,96 %) | 14,419 (+9,96 %) | 2,498 (+5,90 %) | +9,27 % | 2,18 GB |
| GPTQ (este checkpoint) | NVFP4 W4A4 | 13,574 (+3,66 %) | 13,509 (+3,02 %) | 2,437 (+3,33 %) | +3,34 % | 2,18 GB |

Nota: AWQ se midió con 192 muestras de 1024 tokens en lugar de 512 de 2048 por falta de memoria en una GPU de 16 GB, por lo que su comparación no es exactamente equivalente.

### Rendimiento de decodificación especulativa

| Carga de trabajo | Sin especulación | DSpark n=7 | Speedup | Longitud aceptada |
|---|---|---|---|---|
| Generación de código | 137 tok/s | 366 tok/s | 2,67x | 5,02 / 7 |
| Razonamiento matemático | 137 tok/s | 349 tok/s | 2,54x | 5,01 / 7 |
| Explicación general | 137 tok/s | 304 tok/s | 2,22x | 4,17 / 7 |
| Prosa japonesa | 137 tok/s | 165 tok/s | 1,21x | 2,24 / 7 |

Condiciones: una sola secuencia, RTX PRO 2000 Blackwell de 16 GB, greedy, 768 tokens de salida, mediana de 3 ejecuciones, prefix caching activado.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados ocupan 2,18 GB. El autor sirvió el modelo con `--gpu-memory-utilization 0.5` en una RTX PRO 2000 Blackwell de 16 GB, lo que sugiere que el consumo total (activaciones y KV cache incluidos) es compatible con 16 GB.
- GPU recomendadas: RTX PRO 2000 Blackwell (16 GB) para desarrollo. Para producción, se pueden usar A100, H100 o RTX 4090, aunque no hay mediciones publicadas para esas GPUs.
- Cabe en GPU de consumo: sí, con una VRAM de 16 GB es suficiente. En 8 GB probablemente funcionaría con contextos cortos, pero no hay datos al respecto.
- Opciones de despliegue: vLLM. Se requiere una build con soporte para el especulador DSpark y el registro de `Qwen3DSparkModel`. No se documentan otros entornos como Ollama o llama.cpp para este checkpoint.
- Latencia y throughput estimados: 137 tok/s sin especulación; hasta 366 tok/s con DSpark en generación de código, en una RTX PRO 2000 Blackwell.

## Comparativa con modelos similares

| Checkpoint | Parámetros | Contexto | Tamaño | GSM8K | HumanEval pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| MiniCPM5-2B (BF16 original) | 2.516.756.480 | no disponible | 5,03 GB | 82,0 % | 45,1 % | no disponible | HuggingFace (openbmb/MiniCPM5-2B) |
| MiniCPM5-2B-NVFP4 (este checkpoint) | 2.516.756.480 | 32768 tokens | 2,18 GB | 80,4 % | 39,6 % | Apache 2.0 | HuggingFace (sakamakismile/MiniCPM5-2B-NVFP4) |
| NVFP4 + last 8 layers BF16 (variante del estudio) | 2.516.756.480 | no disponible | 2,73 GB | 77,2 % | 37,8 % | no disponible | No publicado |

Nota: los valores de GSM8K y HumanEval provienen del harness propio del autor y no son comparables con puntuaciones publicadas. El contexto del BF16 original no se especifica en la información disponible; para el cuantizado se usa el `--max-model-len` del ejemplo de despliegue.

## Limitaciones y advertencias

- La degradación de calidad en código es notoria: HumanEval pasa de 45,1 % a 39,6 % con la cuantización NVFP4. En tareas de generación de código puede haber regresiones.
- Los números de benchmarks del autor no son comparables con los resultados publicados por OpenBMB u otros, ya que su harness propio penaliza el modelo base varios puntos.
- La decodificación especulativa con DSpark solo es beneficiosa en tareas con estructura determinista (código, matemáticas); en prosa la mejora es menor (1,21x en japonés).
- El tool calling usa XML en lugar de JSON, lo que requiere un parser personalizado y puede no ser compatible con frameworks que esperan llamadas en JSON.
- El soporte de idiomas se limita a inglés, chino y japonés; no hay datos sobre el rendimiento en otros idiomas.
- No se han documentado medidas de sesgo, por lo que no es posible garantizar comportamientos imparciales en aplicaciones sensibles. Cualquier modelo de lenguaje puede alucinar.
- Para desplegarlo, es necesario usar una versión de vLLM que incluya el especulador DSpark y `Qwen3DSparkModel` en su registro; con versiones estándar puede fallar.
- No se publican las variantes alternativas de cuantización (RTN, AWQ, AutoRound, mixta con capas BF16) como checkpoints separados; el repositorio solo contiene la variante GPTQ NVFP4.

## Enlaces

- HuggingFace: https://huggingface.co/sakamakismile/MiniCPM5-2B-NVFP4
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Drafter DSpark: https://huggingface.co/openbmb/MiniCPM5-2B-DSpark
- llm-compressor: https://github.com/vllm-project/llm-compressor
- La búsqueda web no arrojó papers o blogs adicionales relevantes.
