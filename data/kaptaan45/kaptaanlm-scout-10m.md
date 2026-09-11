# kaptaan45/KaptaanLM-Scout-10M

## Resumen

KaptaanLM-Scout-10M es una familia de modelos de lenguaje pequenos (SLM) autorregresivos de 9,95 millones de parametros, desarrollada por Rudransh Shekhar (usuario kaptaan45) y publicada bajo licencia Apache 2.0. El objetivo declarado es ofrecer conversacion multi-turno y razonamiento en varios pasos sobre dispositivos de borde y entornos con recursos muy limitados, entrenando el modelo desde cero en lugar de destilarlo de un modelo mayor.

Tecnicamente se trata de un transformer decoder-only de 8 capas con d_model=256, 8 cabezas de atencion y 4 cabezas KV (GQA con ratio 2:1), capa feed-forward de 680 dimensiones con activacion SwiGLU y vocabulario BPE de 16.384 tokens con pesos atados (embedding y cabeza de salida compartidos). El contexto maximo es de 2.048 tokens, con atencion de ventana deslizante de 512 tokens. Del total de parametros, 5.755.648 (5,76 M, el 57,85 %) son no-embedding, metrica que el autor usa como indicador de capacidad de razonamiento efectiva.

Su relevancia es fundamentalmente metodologica y de investigacion: el repositorio documenta la progresion completa de entrenamiento (piloto, base intermedio, base final, SFT, CoT y una ablacion con DPO), junto con una evaluacion sobre 11.858 preguntas academicas del protocolo EleutherAI lm-evaluation-harness. Los resultados absolutos son muy bajos, pero el autor los presenta como evidencia de eficiencia parametrica frente a baselines mas grandes, un angulo habitual en la literatura de modelos sub-100M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only, GQA 2:1 (8 capas, d_model=256, 8 cabezas de atencion, 4 cabezas KV), FFN de 680 con SwiGLU, atencion de ventana deslizante de 512 tokens |
| Parametros totales | 9.949.952 (9,95 M); no-embedding: 5.755.648 (5,76 M, 57,85 %) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 2.048 tokens (ventana deslizante de atencion de 512 tokens) |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye checkpoints en formato .pt |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (state dict de PyTorch), cargado con codigo propio del paquete `kaptaan`; tamano del repositorio 0,3 GB |
| Vocabulario | BPE de 16.384 tokens, pesos atados (embedding y LM head) |
| Version evaluada | Scouts: Omni-SFT-1.0 (98,3 M tokens SFT, 6.000 pasos) y Reasoning-1.0 (50 M tokens CoT, 3.000 pasos) |
| Base final | KaptaanLM-10M-1.0 (5,0 B tokens, 152.588 pasos, val loss 3,42, PPL de codigo 9,2) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only compacto entrenado desde cero. Usa Grouped Query Attention con 8 cabezas de consulta y 4 cabezas de clave/valor (ratio 2:1) para reducir el coste de la cache KV, capas feed-forward con SwiGLU de dimension 680 y atencion de ventana deslizante que limita el coste computacional a pesar de un contexto declarado de 2.048 tokens. El vocabulario BPE de 16.384 entradas esta atado con la cabeza de salida, lo que reduce el recuento total de parametros y explica que solo el 57,85 % de estos sean no-embedding.

El pipeline de entrenamiento esta documentado checkpoint a checkpoint. La base final (KaptaanLM-10M-1.0) se entreno durante 5.000 millones de tokens en 152.588 pasos, partiendo de un checkpoint piloto de 163,8 M tokens entrenado exclusivamente con libros de texto sinteticos de Cosmopedia v2, seguido de un checkpoint intermedio de 3.000 millones de tokens antes del enfriamiento final. Sobre esa base se aplicaron dos ramas de post-entrenamiento: SFT conversacional con plantilla ChatML (98,3 M tokens, 6.000 pasos, checkpoint Omni/Instruct) y una rama de razonamiento con chain-of-thought (50 M tokens, 3.000 pasos, checkpoint Reasoning). Adicionalmente se publica una ablacion con DPO (400 pasos) cuyo veredicto documentado por el autor es de "inanicion de parametros" a esta escala, es decir, el objetivo DPO no produce mejoras a 10M de parametros.

El modelo se evalua con el protocolo de EleutherAI lm-evaluation-harness bajo un regimen determinista anti-repeticion (temperature 0.0, repetition_penalty 1.12, stop tokens 0 y 2) y plantilla ChatML. El autor reporta una tasa de repeticion de 0.000 en el modelo Omni-SFT, un dato relevante porque la degeneracion por repeticion es uno de los fallos tipicos de los modelos sub-100M.

## Capacidades

- Generacion de texto autoregresiva en ingles, con decodificacion greedy determinista como configuracion recomendada.
- Conversacion multi-turno con plantilla ChatML (`<|im_start|>user`, `<|im_start|>assistant`), entrenada en el checkpoint Omni-SFT/Instruct.
- Razonamiento en varios pasos mediante chain-of-thought explicito en la rama Reasoning.
- Aritmetica y problemas de nivel escolar muy limitada: 2,58 % en GSM8K (Omni) y 1,67 % (Reasoning).
- Razonamiento de sentido comun basico: 55,60 % en PIQA y 21,67 % en ARC-Challenge (Omni).
- Modelado de lenguaje: 8,97 % de accuracy en LAMBADA, muy por debajo de un modelo de 135M.
- Tool calling / function calling: no disponible.
- Uso como agente o razonamiento multi-paso con herramientas: no disponible.
- Capacidades multilingues: no disponibles; el modelo esta entrenado y evaluado unicamente en ingles.
- Vision, audio u otras modalidades: no disponible.
- Ejecucion en CPU y dispositivos de borde: si, gracias al tamano de los checkpoints (~40-57 MB).

## Casos de uso

- Investigacion sobre eficiencia parametrica: el modelo permite reproducir el analisis de "accuracy por millon de parametros" del autor, comparando densidades de rendimiento entre checkpoints de 10M y baselines de 135M bajo un mismo protocolo de evaluacion.
- Estudio de pipelines de entrenamiento desde cero: el repositorio incluye checkpoints de piloto (163,8 M tokens), intermedio (3 B tokens) y final (5 B tokens), lo que permite analizar la evolucion de la perdida de validacion y la perplejidad de codigo a lo largo del entrenamiento.
- Ablacion de DPO a escala minima: el checkpoint Omni-DPO-1.0 documenta un caso de fallo (inanicion de parametros bajo la perdida DPO a 10M), util como referencia negativa en experimentos de alineamiento de modelos muy pequenos.
- Demostraciones educativas de chain-of-thought: la rama Reasoning permite ilustrar como se comporta una decodificacion de razonamiento paso a paso en un modelo cuyo coste de inferencia es practicamente nulo.
- Prototipado en dispositivos embebidos y SBC: con checkpoints de 39,8 a 56,6 MB, el modelo se puede cargar en memoria de una Raspberry Pi o un movil para validar pipelines de inferencia antes de escalar a modelos mayores.
- Pruebas de plantillas de prompt y tokenizacion: sirve como banco de pruebas barato para validar plantillas ChatML, parametros de `repetition_penalty` y politicas de parada antes de aplicarlas a modelos de produccion.
- Generacion de texto creativo de baja exigencia: util en demos, juguetes conversacionales y generacion de continuaciones cortas donde la correccion factual no es critica.
- Comparacion de estrategias de decodificacion: el regimen determinista anti-repeticion propuesto (temp=0.0, penalty=1.12) es replicable para estudiar el efecto de la penalizacion por repeticion en modelos de muy pocos parametros.

## Benchmarks y rendimiento

Resultados publicados por el autor con EleutherAI lm-evaluation-harness sobre 11.858 preguntas, regimen determinista (temp=0.0, repetition_penalty=1.12):

| Benchmark | Metrica | Preguntas | Scout-Omni (10M) | Scout-Reasoning (10M) | SmolLM-135M |
|---|---|---|---|---|---|
| ARC-Easy | acc_norm | 2.376 | 28,79 % (684) | 27,06 % (643) | 44,19 % (1.050) |
| ARC-Challenge | acc_norm | 1.172 | 21,67 % (254) | 19,45 % (228) | 27,82 % (326) |
| PIQA | acc_norm | 1.838 | 55,60 % (1.022) | 56,42 % (1.037) | 67,46 % (1.240) |
| LAMBADA | acc | 5.153 | 8,97 % (462) | 8,13 % (419) | 24,10 % (1.242) |
| GSM8K | acc_norm | 1.319 | 2,58 % (34) | 1,67 % (22) | 1,52 % (20) |
| Total | acc | 11.858 | 20,71 % (2.456) | 19,81 % (2.349) | 32,70 % (3.878) |

Metricas de eficiencia parametrica declaradas por el autor:

| Metrica | Scout-Omni (10M) | SmolLM-135M | Ventaja |
|---|---|---|---|
| GSM8K por 1M de parametros | 0,2593 % | 0,0113 % (derivado) | 22,95x |
| Suite global por 1M de parametros | 2,0816 % | 0,2433 % (derivado) | 8,56x |

Otros datos de rendimiento reportados: tasa de repeticion 0,000 y velocidad de 34 tokens/s en el checkpoint Omni-SFT (hardware de medida no especificado). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, HellaSwag, MT-Bench) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precision. El checkpoint mas pesado ocupa 56,6 MB en disco y los checkpoints SFT/DPO 39,8 MB, por lo que en fp32 la huella ronda decenas de MB y en fp16 la mitad. La cache KV es despreciable a 2.048 tokens de contexto con solo 4 cabezas KV.
- GPU recomendadas: ninguna en particular; el modelo es viable en CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobredimensionada para este modelo.
- Cabe en GPU consumer: si, en todas; tambien en CPU, Raspberry Pi, moviles y microcontroladores con suficiente RAM.
- Opciones de despliegue: solo PyTorch con el codigo propio del paquete `kaptaan` (`from kaptaan.torch.model import KaptaanForCausalLM`). No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni transformers de HuggingFace, ni pesos en GGUF, safetensors o formatos cuantizados.
- Latencia y throughput estimados: 34 tokens/s reportados para Scout-Omni-SFT, sin especificar el hardware de medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Suite global (11.858 preguntas) | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KaptaanLM-Scout-Omni-1.0 | 9,95 M (5,76 M no-embedding) | 2.048 | 20,71 % | 2,58 % | Apache 2.0 | HuggingFace (.pt, codigo propio) |
| KaptaanLM-Scout-Reasoning-1.0 | 9,95 M | 2.048 | 19,81 % | 1,67 % | Apache 2.0 | HuggingFace (.pt, codigo propio) |
| SmolLM-135M | 135 M | no disponible en la informacion proporcionada | 32,70 % | 1,52 % | no disponible en la informacion proporcionada | HuggingFace |

Otras alternativas de la misma categoria (modelos sub-200M como SmolLM-360M, Qwen2.5-0.5B o TinyLlama-1.1B) no aparecen en la informacion proporcionada, por lo que no se incluyen datos comparativos. La conclusion que sostiene el autor es que, aunque el rendimiento absoluto es inferior, la densidad de accuracy por parametro es superior a la de SmolLM-135M, especialmente en GSM8K.

## Limitaciones y advertencias

- Rendimiento absoluto muy bajo: 20,71 % en la suite global de 11.858 preguntas y 8,97 % en LAMBADA. No es un modelo apto para tareas de conocimiento factual.
- Razonamiento matematico residual: 2,58 % en GSM8K (Omni) implica que falla en la practica totalidad de los problemas de nivel escolar.
- Riesgo alto de alucinacion: al carecer de conocimiento factual utilizable, cualquier respuesta sobre entidades, fechas o hechos debe considerarse no fiable.
- Sesgos conocidos: no se documentan analisis de sesgo, toxicidad o alineamiento de seguridad en la informacion disponible. El unico paso de alineamiento reportado (DPO, 400 pasos) se describe como un fallo por inanicion de parametros.
- Idioma: solo ingles. No hay soporte multilingue declarado; el castellano no esta contemplado.
- Contexto limitado: 2.048 tokens con ventana deslizante de 512, lo que restringe el seguimiento de conversaciones largas y de documentos extensos.
- Compatibilidad de despliegue: los pesos son un state dict de PyTorch que requiere el paquete `kaptaan`; no son cargables con transformers, llama.cpp, vLLM u Ollama, y no existen versiones GGUF ni cuantizadas. El autor indica que el modelo se carga con `torch.load`, lo que exige confiar en el origen del archivo y revisar el codigo antes de ejecutarlo.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; no incluye garantias.
- Caveat de produccion: la velocidad reportada (34 tok/s) y la tasa de repeticion (0,000) proceden de la evaluacion del autor en hardware no especificado y no han sido replicadas de forma independiente. Con 0 descargas y 0 likes en el momento del analisis, no existe validacion externa.
- La fecha de creacion del repositorio (11 de septiembre de 2026) y la citacion del autor (ano 2026) no coinciden con la fecha actual de analisis, un extremo a verificar antes de citar el trabajo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kaptaan45/KaptaanLM-Scout-10M
- Repositorio GitHub: https://github.com/rudy-07/KaptaanLM
- Protocolo de evaluacion: EleutherAI lm-evaluation-harness (https://github.com/EleutherAI/lm-evaluation-harness)
- Dataset base del checkpoint piloto: Cosmopedia v2 (https://huggingface.co/datasets/HuggingFaceTB/cosmopedia)
- Baseline comparado en la model card: SmolLM-135M (https://huggingface.co/HuggingFaceTB/SmolLM-135M)
- La busqueda web realizada no devolvio enlaces relevantes al modelo: los resultados obtenidos corresponden a rodamientos de levas (referencias CF8UUR de IKO y THK) y no guardan relacion con KaptaanLM.
