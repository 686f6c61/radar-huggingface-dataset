# scottgeng00/qwen3-0.6b-dclm-20b

## Resumen

scottgeng00/qwen3-0.6b-dclm-20b es un modelo de lenguaje de 595.776.512 parametros (595.8M, con embeddings atados) que reutiliza la arquitectura y el tokenizador de Qwen3-0.6B, pero se ha preentrenado desde inicializacion aleatoria en lugar de partir de los pesos oficiales de Qwen. Lo desarrolla el usuario scottgeng00 y su proposito es servir como baseline de investigacion para estudiar como rinde una arquitectura conocida cuando se entrena exclusivamente sobre un unico componente del corpus Dolmino.

El modelo se ha entrenado con la libreria lingua de Meta sobre aproximadamente 20.000 millones de tokens del subconjunto dclm del mix OLMo 2 Dolmino, en formato de preentrenamiento puro (documentos separados por `<|endoftext|>` y empaquetados a 4096 tokens con mascara de documento). No es un modelo ajustado por instrucciones ni alineado, por lo que su comportamiento esperado es el de una base cruda de generacion de texto en ingles.

Su relevancia actual es metodologica: permite aislar el efecto del corpus dclm frente a otras mezclas de datos, comparar el impacto del preentrenamiento desde cero con el de los pesos publicados de Qwen3-0.6B y disponer de un punto de referencia reproducible (pasos, hiperparametros y GPU documentados) para experimentos de escalado de datos a pequena escala. El modelo se publica bajo licencia Apache 2.0 y en formato safetensors en bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3-0.6B): 28 capas, d=1024, 16 cabezas Q / 8 cabezas KV, head_dim 128, SwiGLU 3072, QK-norm, RoPE theta 1e6, embeddings atados |
| Parametros totales | 595.776.512 (595.8M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (longitud de secuencia de entrenamiento, con document masking); no se declara ventana maxima ampliada en la model card |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en bfloat16; no hay cuantizaciones oficiales publicadas) |
| Idiomas soportados | no disponible (el corpus de entrenamiento, DCLM, es predominantemente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only identico al de Qwen3-0.6B: 28 capas, dimension de modelo 1024, 16 cabezas de consulta y 8 de clave/valor (GQA con head_dim 128), MLP SwiGLU con dimension intermedia 3072, normalizacion QK y RoPE con theta 1e6. El vocabulario es de 151.669 tokens y los embeddings de entrada y salida estan atados. La unica diferencia frente al Qwen3-0.6B oficial es que los pesos se han inicializado de forma aleatoria.

El entrenamiento se realizo con la libreria lingua sobre unos 20.000 millones de tokens del subconjunto dclm del mix OLMo 2 Dolmino, usando solo esa fuente. Los documentos se separaron con `<|endoftext|>` y se empaquetaron a 4096 tokens aplicando document masking, de modo que no hay atencion cruzada entre documentos. El regimen fue de 19.074 pasos con batch de 256 secuencias de 4096 tokens, optimizador AdamW (lr 2.65e-3, betas 0.9/0.95, weight decay 0.05), 954 pasos de warmup y decaimiento coseno hasta el 1% del pico, todo en bfloat16 sobre 32 GPU H200. No se aplicaron etapas de RLHF, DPO ni ajuste por instrucciones; se trata de un preentrenamiento puro.

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de un prompt, en formato de modelo base (sin plantilla de chat).
- Razonamiento de sentido comun y comprension lectora a nivel basico, evidenciado por los resultados en SciQ (0.798 de accuracy a 5-shot) y ARC-Easy (0.688).
- Conocimiento factual limitado, reflejado en un F1 de 0.254 en TriviaQA a 5-shot.
- Aritmetica y razonamiento matematico muy debiles: solo 0.020 de exact match en GSM8K con CoT de 8 ejemplos.
- Generacion de codigo incipiente, con un bits/byte de solucion dorada de 0.912 en MBPP a 3-shot (metrica de modelado, no de ejecucion).
- Modo de continuacion de texto puro; no dispone de soporte nativo de tool calling, function calling ni agentes.
- Capacidades multilingues: no disponibles (el corpus es mayoritariamente anglosajon).
- No incluye modo thinking, vision, audio ni ninguna capacidad multimodal.

## Casos de uso

- Baseline de investigacion en escalado de datos: sirve como punto de control entrenado en un solo subconjunto (dclm) para comparar curvas de perdida frente a mezclas completas del mix Dolmino u otros corpus, aislando la contribucion de la fuente de datos.
- Reproducibilidad de preentrenamiento: al documentarse pasos, batch, hiperparametros y hardware exactos, permite reproducir el entrenamiento en un cluster pequeno o comparar la eficiencia de distintas configuraciones de optimizador y schedule.
- Punto de partida para fine-tuning: al ser Apache 2.0 y 595.8M parametros, es un candidato comodo para ajuste supervisado o instruccional a bajo coste y para medir cuanto del rendimiento final depende de los pesos preentrenados frente a los datos de ajuste.
- Ablaciones de curriculo y tokenizacion: al usar el tokenizador de Qwen3 (vocabulario 151.669) sobre dclm, permite estudiar el efecto del empaquetado a 4096 tokens con document masking frente a otras estrategias de concatenacion.
- Prototipado local en hardware modesto: con 1.2 GB de pesos en bfloat16 cabe en cualquier GPU de consumo o incluso en CPU, lo que facilita pruebas rapidas de pipelines de transformers, decodificacion y prompts.
- Evaluacion de metodos de cuantizacion: al ser un modelo pequeno, es util para medir degradacion de calidad al pasar de bf16 a 8 bits o 4 bits sin la complejidad de modelos grandes.
- Estudio de sesgos y seguridad en modelos base: como no esta alineado, permite observar el comportamiento crudo del preentrenamiento frente a prompts adversarios, algo relevante para investigacion sobre fallos de alineamiento.
- Destilacion o inicializacion: puede emplearse como profesor pequeno o como inicializacion para experimentos de destilacion hacia modelos aun mas reducidos.

## Benchmarks y rendimiento

Resultados reportados por el autor (OLMES v0.4.13, formatos de modelo base):

| Tarea | Metrica | Resultado |
|---|---|---|
| SciQ (RC, 5-shot) | accuracy | 0.798 |
| ARC-Easy (RC, 5-shot) | accuracy | 0.688 |
| MMLU (RC, 5-shot, macro sobre 57 materias) | accuracy | 0.336 |
| GSM8K (8-shot CoT) | exact match | 0.020 |
| TriviaQA (5-shot) | F1 | 0.254 |
| GSM8K | bits/byte de respuesta dorada | 0.666 |
| MBPP (3-shot) | bits/byte de solucion dorada | 0.912 |

Perdida NLL por token en fuentes de Dolmino retenidas (1000 documentos por fuente):

| Fuente | NLL por token |
|---|---|
| dclm | 2.610 |
| math | 1.632 |
| flan | 3.517 |
| wiki | 2.645 |
| pes2o | 2.763 |
| stackexchange | 2.773 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 1.2 GB con pesos en bfloat16 y unos 2.4 GB si se carga en float32; el pico real depende del tamano de batch y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. El entrenamiento original uso 32 H200, pero eso es irrelevante para inferencia.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU consumer moderna e incluso en CPU (la decodificacion sera mas lenta pero viable).
- Opciones de despliegue: transformers (uso documentado en la model card), llama.cpp tras conversion a GGUF, vLLM, TGI y Ollama tras conversion previa del formato de pesos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottgeng00/qwen3-0.6b-dclm-20b | 595.8M | 4096 (entrenamiento) | 20.000M tokens de dclm (desde cero) | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| Qwen/Qwen3-0.6B | 0.6B | no disponible en la informacion | corpus completo de preentrenamiento de Qwen3 | Apache 2.0 | HuggingFace, ModelScope |
| Jinx-org/Jinx-Qwen3-0.6B | derivado de 0.6B | no disponible | ajuste orientado a investigacion de seguridad | no disponible | HuggingFace |

La comparacion directa mas relevante es con Qwen/Qwen3-0.6B, del que este modelo hereda arquitectura y tokenizador pero no los pesos ni el corpus completo. No se dispone del detalle de la mezcla de preentrenamiento original de Qwen3 ni de sus cifras OLMES en la informacion proporcionada, por lo que no es posible establecer una comparacion numerica fiable. Jinx-Qwen3-0.6B es un derivado orientado a investigacion de seguridad y no es comparable en cuanto a regimen de entrenamiento.

## Limitaciones y advertencias

- No es un modelo ajustado por instrucciones: no sigue ordenes ni mantiene formato conversacional de forma fiable; responde como continuador de texto.
- Riesgo alto de alucinacion factual: el F1 de 0.254 en TriviaQA refleja un conocimiento memoristico limitado, propio de solo 20.000 millones de tokens de entrenamiento.
- Razonamiento matematico practicamente nulo (0.020 en GSM8K con CoT), por lo que no es apto para tareas aritmeticas o de logica compleja sin ajuste adicional.
- Capacidad multilingue no declarada y muy probablemente baja, dado que DCLM es predominantemente en ingles.
- Ventana de contexto efectiva restringida a 4096 tokens en entrenamiento; usar secuencias mas largas puede degradar la calidad aunque la arquitectura lo permita.
- Sesgos potencialmente presentes en el corpus DCLM, no mitigados mediante RLHF ni filtros adicionales.
- Rendimiento en MMLU bajo (0.336), lo que limita su uso en tareas de conocimiento amplio.
- Licencia Apache 2.0 permisiva para uso comercial, pero al tratarse de un baseline de investigacion sin alineamiento no se recomienda su despliegue en produccion orientada a usuarios sin ajuste y evaluacion de seguridad previas.
- Modelo sin traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa y de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scottgeng00/qwen3-0.6b-dclm-20b
- Qwen/Qwen3-0.6B (modelo base de referencia): https://huggingface.co/Qwen/Qwen3-0.6B
- Qwen3 Technical Report (arXiv): https://arxiv.org/abs/2505.09388
- Qwen3-0.6B en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-0.6B
- Libreria lingua (Meta): https://github.com/facebookresearch/lingua
- Jinx-org/Jinx-Qwen3-0.6B (derivado): https://huggingface.co/Jinx-org/Jinx-Qwen3-0.6B
- Guia de la familia Qwen3: https://insiderllm.com/guides/qwen3-complete-guide/
