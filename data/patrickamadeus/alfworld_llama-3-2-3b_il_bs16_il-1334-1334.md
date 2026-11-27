# patrickamadeus/alfworld_Llama-3.2-3B_IL_bs16_IL.1334.1334

## Resumen

`alfworld_Llama-3.2-3B_IL_bs16_IL.1334.1334` es un ajuste fino completo (full fine-tune) del modelo instructivo `meta-llama/Llama-3.2-3B-Instruct` de Meta, publicado por el usuario `patrickamadeus`. El modelo está especializado en la resolución de tareas domésticas del benchmark ALFWorld (TextWorld), un entorno de texto donde un agente debe completar objetivos de varios pasos (por ejemplo, "calienta una manzana y colócala en el frigorífico") mediante la emisión secuencial de comandos. No es un modelo de propósito general, sino un artefacto de investigación para experimentación en agentes y aprendizaje por imitación.

La nomenclatura del repositorio codifica el pipeline de entrenamiento: `alfworld` (benchmark), `Llama-3.2-3B` (modelo base), `IL` (imitation learning sobre filas de experto estado-acción), `bs16` (tamaño de lote efectivo de 16 filas) y `IL.1334.1334` (una etapa de entrenamiento completada, paso 1.334 de 1.334, es decir, una época completa sobre 21.335 filas de experto). El entrenamiento se realizó con LlamaFactory en modalidad SFT, con precisión bf16 y una longitud máxima de 4.096 tokens.

Su relevancia es acotada pero clara: sirve como punto de referencia reproducible para investigar cómo el aprendizaje por imitación sobre datos de experto transfiere capacidades de planificación y actuación en entornos de texto estructurados. El modelo se publica con la licencia `llama3.2` y solo dispone de pesos en formato safetensors (12,9 GB de repositorio), sin despliegue en pipeline declarado ni descargas registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), ajuste fino completo del modelo instructivo base |
| Parametros totales | 3.212.749.824 (~3,21 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud máxima usada en entrenamiento; el modelo base Llama 3.2 admite 128K, no confirmado para este ajuste) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors en bf16) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero el ajuste está orientado a comandos de ALFWorld en inglés) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.2-3B-Instruct`, un transformer decoder-only denso de 3,21 mil millones de parámetros con atención causal estándar y RoPE. Sobre esa base se aplicó un ajuste fino completo (no LoRA ni QLoRA) mediante LlamaFactory en modo SFT, con tasa de aprendizaje 1e-5, schedule coseno con un 3% de warmup, precisión bf16, optimizador paged AdamW de 8 bits, longitud máxima de 4.096 tokens y semilla 0. El lote efectivo fue de 16 filas por paso de optimizador.

Los datos de entrenamiento provienen del conjunto `osunlp/early-experience` (subdirectorio `alfworld/`), usado sin modificaciones, y consisten en 21.335 filas de experto con formato estado → acción para aprendizaje por imitación. La etapa registrada `IL.1334.1334` corresponde a una época completa (1.334 pasos de 1.334 sobre esas 21.335 filas). El nombre del repositorio y las etiquetas (`early-experience`, `imagined-experience`) remiten al trabajo sobre experiencia temprana e imaginada en agentes; el autor referencia el artículo "Early Experience" (tabla 4) y su propio repositorio `github.com/patrickamadeus/imagined-experience` (rama `runs/faithful`, decisiones D-41, D-43 y D-44). No se documentan innovaciones arquitectónicas propias: el interés técnico reside en el procedimiento de ajuste y en la evaluación sobre ALFWorld, no en cambios de arquitectura.

## Capacidades

- Generación de comandos de acción para tareas domésticas de ALFWorld en formato texto (acciones como `go to`, `take`, `heat`, `put`), condicionada al estado actual del entorno.
- Planificación multi-paso en episodios de hasta 50 pasos, con objetivos que requieren localizar objetos, transformarlos y depositarlos en receptáculos.
- Aprendizaje por imitación de políticas de experto: reproduce secuencias estado-acción vistas durante el entrenamiento.
- Razonamiento sobre estado textual del entorno (inventario, ubicaciones, observaciones), sin percepción visual ni multimodal.
- No se documenta soporte de tool calling, function calling, agentes con herramientas externas, modo thinking ni capacidades de audio o visión.
- Capacidades multilingües: no documentadas para este ajuste; el modelo base es multilingüe, pero el fine-tune está entrenado sobre instrucciones en inglés de ALFWorld.
- No se documenta capacidad de código, matemáticas ni razonamiento general fuera del dominio de ALFWorld.

## Casos de uso

- Investigación en aprendizaje por imitación para agentes: el modelo sirve como política de referencia (baseline IL) frente a variantes de modelado del mundo implícito o autorreflexión, permitiendo reproducir la tabla 4 del artículo citado con el mismo conjunto de datos y configuración.
- Evaluación de agentes en entornos textuales: se puede desplegar como agente en ALFWorld para medir tasas de éxito en `valid_seen` y `valid_unseen` con protocolo controlado (3 episodios por partida, temperatura 0,4, top_p 1,0, 50 pasos).
- Estudio de generalización a entornos no vistos: la diferencia entre `valid_seen` (73,6% de media) y `valid_unseen` (67,2%) permite analizar la transferencia de políticas entrenadas con datos de experto a distribuciones de tareas distintas.
- Generación de trayectorias sintéticas de experto: el modelo puede producir secuencias de acciones plausibles para aumentar datos de entrenamiento de otros agentes, siempre con validación posterior en el simulador.
- Comparación de estrategias de ajuste: al ser un full fine-tune con hiperparámetros documentados (lr 1e-5, bf16, AdamW 8-bit paginado, semilla 0), es útil para aislar el efecto de cambios en datos o etapas de entrenamiento.
- Docencia y experimentación en agentes LLM: por su tamaño de 3,2 mil millones de parámetros, permite ejecutar experimentos completos de evaluación en ALFWorld en hardware modesto, algo inviable con modelos de decenas de miles de millones de parámetros.

## Benchmarks y rendimiento

Tasa de éxito (%) en ALFWorld, 3 episodios por partida, temperatura 0,4, top_p 1,0, 50 pasos, media sobre partidas con intervalo de confianza del 95%:

| Split | Media de 3 muestras | Primera muestra |
|---|---|---|
| valid_seen (140 partidas) | 73,6 (67,4-79,5) | 77,1 (70,0-83,6) |
| valid_unseen (134 partidas) | 67,2 (60,7-73,6) | 70,1 (62,7-77,6) |

Referencia del artículo "Early Experience" (tabla 4, Llama-3.2-3B, ALFWorld) citada en la model card: imitación 78,1; modelado del mundo implícito 83,6; autorreflexión 85,9. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general para este ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,5-7 GB solo para pesos (3,21 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB para contextos de 4.096 tokens.
- Cuantización a 8 bits: en torno a 3,5-4 GB de pesos; a 4 bits: en torno a 2-2,5 GB. No se publican pesos GGUF ni cuantizados en el repositorio, por lo que habría que generarlos con llama.cpp o herramientas equivalentes.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para inferencia cómoda en bf16; también cabe en RTX 3090, RTX 4080 y GPUs consumer con 12 GB o más si se cuantiza.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090, RTX 4080 y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con accelerate; no se documentan configuraciones específicas ni recetas de servicio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ALFWorld (valid_unseen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alfworld_Llama-3.2-3B_IL (este modelo) | 3,21 B | 4.096 tokens de entrenamiento | 67,2% (media de 3) | llama3.2 | Hugging Face, safetensors |
| Llama-3.2-3B-Instruct (base) | 3,21 B | 128K (según Meta) | No disponible para ALFWorld sin ajuste | llama3.2 | Hugging Face |
| Variantes del artículo "Early Experience" (implicit world modeling, self-reflection) | 3,21 B | No disponible | 83,6% y 85,9% respectivamente (tabla 4) | No disponible | No disponible |

No se dispone de datos de benchmarks de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: entrenado exclusivamente sobre filas de experto de ALFWorld; su uso fuera de ese entorno producirá salidas degeneradas o irrelevantes.
- Riesgo de alucinación: puede emitir acciones no válidas o secuencias que no correspondan al estado real del entorno, especialmente en episodios largos o en distribuciones no vistas.
- Sesgos: no documentados por el autor; al heredar el modelo base, puede arrastrar sesgos de Llama 3.2, agravados por el corpus limitado de ALFWorld.
- Limitaciones de idioma: el ajuste está orientado a instrucciones en inglés de ALFWorld; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Restricciones de licencia: licencia `llama3.2`, sujeta a la política de uso aceptable de Meta; el uso comercial requiere revisar los términos de la licencia Llama 3.2.
- Caveat de producción: el modelo no está pensado para despliegue en producción; es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni pesos cuantizados publicados.
- Longitud de contexto efectiva: aunque el modelo base admite 128K, el ajuste se realizó con 4.096 tokens, por lo que el comportamiento más allá de esa longitud no está validado.
- Reproducibilidad: los resultados reportados usan 3 episodios por partida con temperatura 0,4; variaciones en la semilla o en el número de episodios pueden alterar las tasas de éxito dentro de los intervalos de confianza indicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patrickamadeus/alfworld_Llama-3.2-3B_IL_bs16_IL.1334.1334
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio del autor: https://github.com/patrickamadeus/imagined-experience
- Dataset de entrenamiento: https://huggingface.co/datasets/osunlp/early-experience
- Artículo "Early Experience" (referenciado en la model card): no disponible como enlace directo en la información proporcionada
- Demo o espacio interactivo: no disponible
