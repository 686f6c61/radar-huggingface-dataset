# kaptaan45/KaptaanLM-Vanguard-25M

## Resumen

KaptaanLM-Vanguard-25M es un modelo de lenguaje de 25,18 millones de parametros desarrollado por Rudransh Shekhar dentro del proyecto KaptaanLM (publicado en HuggingFace bajo el usuario kaptaan45). Se presenta como el modelo insignia de la familia de 25M y esta disenado especificamente para generacion de texto con razonamiento tipo cadena de pensamiento (chain-of-thought) en un formato de "scratchpad" estructurado. Su propuesta central es maximizar la densidad de razonamiento por parametro: con 18,88 millones de parametros no de embedding, el autor afirma alcanzar un estado del arte en razonamiento dentro de la franja de modelos por debajo de 50M.

Tecnicamente es un transformer decoder-only de 12 capas con d_model=384, 12 cabezas de atencion y 4 cabezas KV (GQA 3:1), funcion de activacion SwiGLU con d_ffn=1024, vocabulario BPE de 16.384 tokens con embeddings atados y una ventana de contexto de 2.048 tokens con atencion de ventana deslizante de 512. El preentrenamiento cubre 5.636 millones de tokens repartidos en 8 corpus curados, y el alineamiento combina un "Universal Scratchpad Contract" con DPO alineado a esquema (Schema-Aligned DPO).

Su relevancia actual es doble: por un lado, sirve como banco de pruebas para investigar alineamiento en modelos extremadamente pequenos; por otro, sus resultados publicados muestran hallazgos interesantes sobre regularizacion estructural mediante DPO (recuperacion de LAMBADA de 0,00% a 13,39% y multiplicacion por 43,6 de GSM8K respecto a la variante sin DPO). No obstante, conviene ser claro: en terminos absolutos rinde por debajo de SmolLM-135M en todos los benchmarks publicados, pese a resolver 2,3 veces mas problemas de GSM8K que ese modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, atencion con GQA 3:1, SwiGLU, atencion de ventana deslizante |
| Parametros totales | 25.176.192 (25,18M); 18.884.736 no de embedding |
| Parametros activos | No aplica (no es MoE, aunque el autor menciona una futura ruta MoE en la cita) |
| Longitud de contexto | 2.048 tokens (ventana deslizante de 512) |
| Tipos de cuantizacion | No disponible (no se publican checkpoints cuantizados; solo pesos en precision completa) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (.pt); no se distribuyen safetensors ni GGUF |
| Capas | 12 |
| d_model | 384 |
| Cabezas de atencion / cabezas KV | 12 / 4 |
| d_ffn | 1.024 (SwiGLU) |
| Vocabulario | 16.384 BPE con embeddings atados |
| Tokens de preentrenamiento | 5.636 millones, en 8 corpus curados |
| Alineamiento | Universal Scratchpad Contract + Schema-Aligned DPO |
| Tamano del repositorio | 0,3 GB |
| Variantes publicadas | Vanguard-Omni-DPO-1.0.pt, Vanguard-Reasoning-1.0.pt, Vanguard-1.0.pt (base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal convencional de 12 capas con normalizacion previa, d_model=384 y 12 cabezas de atencion de dimension 32. El modelo usa Grouped-Query Attention con 4 cabezas KV frente a 12 cabezas Q (ratio 3:1), lo que reduce el coste de la cache KV, y una MLP con activacion SwiGLU y dimension intermedia de 1.024. El vocabulario es un BPE de 16.384 tokens con embeddings atados (tied embeddings) entre entrada y salida, un detalle que explica la diferencia entre los 25,18M de parametros totales y los 18,88M no de embedding. El autor define una "Active Reasoning Density" del 75,01%, es decir, la proporcion de parametros situados en capas Transformer. El contexto es de 2.048 tokens, pero la atencion opera con ventana deslizante de 512, lo que limita el alcance efectivo de las dependencias largas por debajo de esa cifra.

El entrenamiento se divide en dos fases. Primero, preentrenamiento sobre 5.636 millones de tokens procedentes de 8 corpus curados (composicion no detallada en la model card). Despues, un alineamiento en dos pasos: el "Universal Scratchpad Contract", que fija un formato de razonamiento explicito tipo scratchpad, y "Schema-Aligned Direct Preference Optimization (DPO)", que optimiza preferencias respetando ese esquema. Segun los hallazgos publicados, el DPO alineado a esquema evita el "conversational format lock-in" en prosa continua: la variante sin DPO obtiene 0,00% en LAMBADA (produce formato conversacional en lugar de completar prosa) mientras que la variante DPO llega al 13,39%; y en GSM8K pasa de 0,08% a 3,49% (un factor de 43,6). No se documentan tecnicas como decodificacion especulativa, atencion lineal ni SSM.

## Capacidades

- Generacion de texto en ingles con plantilla de chat basada en tokens especiales `<|im_start|>` y `<|im_end|>`.
- Razonamiento explicito tipo cadena de pensamiento mediante el contrato de scratchpad estructurado.
- Aritmetica y problemas matematicos de nivel escolar basico: 46/1.319 en GSM8K (3,49%) con la variante Omni-DPO.
- Generacion de codigo y razonamiento logico: segun la model card, el checkpoint Omni-DPO obtiene 25% de acierto en la componente de logica y 33% en la de codigo del indice CRI (metodologia no detallada).
- Completado de prosa y comprension de lenguaje (LAMBADA 13,39%).
- Razonamiento de sentido comun a nivel basico (ARC-Easy 32,07%, ARC-Challenge 23,81%, PIQA 56,20%).
- Tool calling / function calling: no disponible (no documentado).
- Uso como agente o razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no, solo ingles.
- Vision, audio, thinking mode explicito o modos multimodales: no disponible.

## Casos de uso

- Investigacion academica sobre alineamiento en modelos diminutos: el modelo es un caso de estudio reproducible de como el DPO alineado a esquema corrige el colapso de formato conversacional en modelos menores de 50M, con dos variantes comparables (SFT y DPO) publicadas.
- Prototipado de razonamiento CoT en hardware minimo: sirve para validar pipelines de scratchpad y de evaluacion con lm-evaluation-harness en portatiles o CPUs, ya que el checkpoint ocupa ~0,3 GB y la inferencia en fp32 ronda los 100 MB de memoria de pesos.
- Educacion y demostraciones docentes: por su tamano, permite mostrar de forma tangible las limitaciones de escala (por que 25M de parametros no resuelven aritmetica de forma fiable) en cursos de machine learning.
- Pruebas de formato de prompt y tokenizacion propia: al usar un tokenizador BPE de 16.384 tokens con tokens de chat personalizados y un paquete Python propio (`kaptaan`), es util para experimentar con integracion de modelos no estandarizados en un servidor de inferencia.
- Filtrado o clasificacion de texto muy ligera: con 2.048 tokens de contexto y 25M de parametros, puede emplearse como componente de prototipo en tareas de etiquetado simple en ingles, siempre con expectativas de precision bajas (23,70% global en los benchmarks publicados).
- Generacion de texto en entornos embebidos o de recursos muy limitados: el modelo cabe en microcontroladores de gama alta o en dispositivos de borde con varios cientos de MB de RAM si se convierte a un formato eficiente, aunque actualmente no se publican pesos GGUF ni ONNX.
- Investigacion sobre eficiencia de atencion: la combinacion de GQA 3:1 y ventana deslizante de 512 en un modelo de 12 capas lo hace util como sujeto de pruebas para estudiar el equilibrio entre calidad y memoria de cache KV.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con EleutherAI `lm-evaluation-harness` bajo "Regime 1: Deterministic Anti-Repetition Greedy" (temperature=0.0, repetition_penalty=1.12) sobre un total de 11.858 preguntas:

| Suite de benchmark | Tamano del split | Vanguard-Omni-DPO (25M) | Vanguard-Omni-SFT (sin DPO) | SmolLM-135M (referencia) |
|---|---|---|---|---|
| ARC-Easy (`acc_norm`) | 2.376 | 32,07% (762/2376) | 29,25% (695/2376) | 44,19% (1050/2376) |
| ARC-Challenge (`acc_norm`) | 1.172 | 23,81% (279/1172) | 20,99% (246/1172) | 27,82% (326/1172) |
| PIQA (`acc_norm`) | 1.838 | 56,20% (1033/1838) | 51,25% (942/1838) | 67,46% (1240/1838) |
| LAMBADA (`acc`) | 5.153 | 13,39% (690/5153) | 0,00% (0/5153) | 24,10% (1242/5153) |
| GSM8K (`acc_norm`) | 1.319 | 3,49% (46/1319) | 0,08% (1/1319) | 1,52% (20/1319) |
| Global | 11.858 | 23,70% (2810/11858) | 15,89% (1884/11858) | 32,70% (3878/11858) |

Indice CRI citado en la model card (metodologia no detallada): KaptaanLM-Vanguard-Omni-DPO-1.0 = 0,5042 (50% matematicas, 25% logica, 33% codigo, 0,000 repeticion); Vanguard-Reasoning-1.0 = 0,4167. No hay resultados de MMLU, HumanEval ni MT-Bench en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en inferencia (pesos): ~101 MB en fp32 (4 bytes por parametro sobre 25,18M), ~50 MB en fp16/bf16 y ~25 MB en int8. La cache KV a 2.048 tokens es pequena: 2 x 12 capas x 4 cabezas KV x 32 de dimension x 2.048 tokens, aproximadamente 12,6 MB en fp16.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, incluso en GPUs integradas y en CPU. No requiere A100 ni H100.
- Ejecucion en CPU viable: al ser un modelo de 25M, la generacion en CPU es practica aunque la latencia depende del numero de tokens generados y del hilo de ejecucion.
- Opciones de despliegue: la model card solo documenta inferencia en PyTorch puro mediante el paquete `kaptaan` (`KaptaanForCausalLM` + `CONFIG_25M`). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni transformers estandar; tampoco hay pesos GGUF, lo que limita el despliegue a entornos con el codigo del autor.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Global en el mismo protocolo | GSM8K | Licencia |
|---|---|---|---|---|---|
| KaptaanLM-Vanguard-25M (Omni-DPO) | 25,18M | 2.048 (ventana 512) | 23,70% | 3,49% | Apache 2.0 |
| SmolLM-135M | 135M | No disponible en la informacion | 32,70% | 1,52% | Apache 2.0 (referencia del autor) |
| KaptaanLM-Vanguard-Omni-SFT (sin DPO) | 25,18M | 2.048 | 15,89% | 0,08% | Apache 2.0 |
| Otras alternativas de <100M (p. ej. Qwen2.5-0.5B no aplica por tamano) | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparativa con datos verificables proporcionada por el autor es frente a SmolLM-135M, que supera a Vanguard-25M en el global (32,70% frente a 23,70%) y en todas las suites salvo GSM8K, donde Vanguard resuelve 46 problemas frente a 20 pese a tener 5,4 veces menos parametros.

## Limitaciones y advertencias

- Precision absoluta baja: 23,70% global en el conjunto de benchmarks publicado; el modelo falla en la mayoria de preguntas de razonamiento y sentido comun.
- GSM8K de 3,49% implica que la aritmetica fiable no esta garantizada; no debe usarse para calculos que requieran exactitud sin verificacion externa.
- Colapso de formato sin DPO: la variante SFT obtiene 0,00% en LAMBADA, lo que indica que el alineamiento es imprescindible para que el modelo no quede bloqueado en formato conversacional. Usar el checkpoint base sin alinear probablemente produzca salidas degeneradas.
- Riesgo de alucinacion alto, inherente a un modelo de 25M entrenado con 5.636 millones de tokens (ratio de tokens por parametro muy bajo en terminos de capacidad efectiva).
- Solo ingles: no hay soporte multilingue documentado ni evaluado; el rendimiento en castellano es presumiblemente muy pobre y no esta medido.
- Contexto efectivo limitado: aunque la ventana es de 2.048 tokens, la atencion deslizante de 512 restringe las dependencias a medio y largo plazo.
- Repeticion: las evaluaciones oficiales usan `repetition_penalty=1.12` de forma obligatoria, lo que sugiere tendencia a bucles si se decodifica de forma estandar.
- Ecosistema restringido: los pesos son un `state_dict` de PyTorch (.pt) que requiere el paquete `kaptaan` del autor y su tokenizador `tokenizer.json` propios; no hay safetensors, GGUF ni integracion con transformers, lo que complica auditoria, despliegue y compatibilidad a largo plazo.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al ser un modelo con precision muy baja no es apto para produccion orientada a usuario final sin una capa de validacion.
- Fechas y metricas: la model card incluye un indice propietario (CRI) cuya metodologia de calculo no se detalla, por lo que esos valores no son verificables de forma independiente. El repositorio muestra 0 descargas y 0 likes, sin validacion externa por parte de la comunidad.
- No hay informacion sobre composicion del dataset, filtrado de datos toxicos ni evaluaciones de sesgo; se desconoce el perfil de sesgos del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/kaptaan45/KaptaanLM-Vanguard-25M
- Repositorio GitHub del proyecto KaptaanLM: https://github.com/rudy-07/KaptaanLM
- Paper o informe tecnico: no disponible
- Demo o espacio de inferencia: no disponible
- Variantes adicionales publicadas: `KaptaanLM-Vanguard-Omni-DPO-1.0.pt`, `KaptaanLM-Vanguard-Reasoning-1.0.pt`, `KaptaanLM-Vanguard-1.0.pt` (incluidas en el repositorio del modelo)
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo (corresponden a sitios de noticias en albanes sin relacion con el proyecto).
