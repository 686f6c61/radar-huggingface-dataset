# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed2

## Resumen

SmolLM-360M CPT FineWeb Faroese (transfer desde noruego nynorsk, semilla 2) es un modelo de lenguaje de tipo decoder-only derivado de SmolLM2-360M-Instruct, publicado por el usuario jekunz en Hugging Face. Se trata de un experimento de investigación de adaptación lingüística: partiendo de un modelo ya ajustado en noruego nynorsk, el autor realiza un continued pre-training (CPT) sobre la porción en feroés del corpus FineWeb-2. El objetivo es evaluar la transferencia entre lenguas germánicas nórdicas de bajos recursos, en concreto si el nynorsk sirve como puente para el feroés.

El modelo resuelve un problema concreto de la comunidad de lenguas de bajos recursos: la escasez de modelos generativos funcionales en feroés, un idioma con unos 70.000 hablantes. Con 361.821.120 parámetros (unos 362 millones), es lo bastante pequeño para ejecutarse en hardware de consumo y para servir como banco de pruebas de estrategias de transferencia cross-lingüe.

Es relevante ahora porque forma parte de una serie de tres semillas (esta es la semilla 2) que permite medir la varianza del entrenamiento, y porque documenta de forma explícita una receta de CPT reproducible sobre un corpus abierto. No obstante, el propio autor advierte que está destinado a su investigación y que no ha sido evaluado de forma amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama / SmolLM2, según tags `llama` y `transformers`) |
| Parametros totales | 361.821.120 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en precisión original; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Feroés (`fo`), con transferencia desde noruego nynorsk |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`; repo de 0,7 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-360M-Instruct, un transformer decoder-only de tipo Llama con 362 millones de parámetros. El pipeline declarado es `text-generation` con etiqueta `conversational`, lo que indica que conserva el formato de chat instructivo del modelo original. No se documentan en la información disponible innovaciones arquitectónicas propias: el interés del modelo está en el proceso de adaptación lingüística, no en la arquitectura.

El entrenamiento es un continued pre-training en dos fases sobre el corpus HuggingFaceFW/fineweb-2: primero 1 época en la porción de noruego nynorsk (que produce el modelo base `jekunz/smollm-360m-cpt-fineweb-norwegian-nynorsk`) y después 5 épocas en la porción de feroés. Los hiperparámetros declarados son: learning rate 5e-4, scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulación de gradiente (batch efectivo 256), longitud máxima de contexto de 2048 tokens, una única GPU A100 de 40 GB y semilla 2. No se especifica el número total de tokens procesados ni si hubo RLHF, DPO o ajuste supervisado adicional tras el CPT.

## Capacidades

- Generación de texto en feroés, con herencia del comportamiento instructivo de SmolLM2-360M-Instruct (formato conversacional).
- Conversación multi-turno en formato chat, siempre que se respete la plantilla del modelo original.
- Transferencia cross-lingüe desde noruego nynorsk: el modelo ha visto primero una lengua germánica nórdica con más recursos digitales.
- Capacidades residuales del modelo base en inglés y otras lenguas, aunque no están garantizadas ni evaluadas tras el CPT.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documenta capacidad multilingüe amplia más allá del feroés y del nynorsk de partida.

## Casos de uso

- Investigación en transferencia cross-lingüe: el modelo sirve como punto de comparación frente a las semillas 1 y 3 de la misma configuración para estimar la varianza del entrenamiento en tareas de adaptación al feroés.
- Generación de texto asistida en feroés para prototipos: dado su tamaño (362 M), puede desplegarse en una GPU de consumo para experimentar con generación de borradores, resúmenes o reformulaciones en un idioma con pocos recursos.
- Evaluación de recetas de CPT sobre FineWeb-2: permite medir el efecto de 1 época en nynorsk seguida de 5 épocas en feroés frente a alternativas (entrenamiento directo en feroés, más épocas, otras tasas de aprendizaje).
- Creación de corpus sintéticos de bajo coste: por su reducido tamaño y licencia Apache 2.0, es viable generar grandes volúmenes de texto feroés para filtrado o aumento de datos sin coste de licencia.
- Docencia y experimentación en ajuste fino: con un repo de 0,7 GB y entrenamiento factible en una sola A100 de 40 GB, es un caso práctico para enseñar pipelines de CPT con Hugging Face Transformers.
- Base para futuros ajustes supervisados en feroés: al conservar el formato conversacional, puede servir de punto de partida para SFT o DPO específicos de tareas (atención al cliente, traducción asistida) una vez validada su calidad base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado de forma amplia ("has not been evaluated more broadly yet").

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (fp16/bf16): en torno a 0,7-0,8 GB de pesos, más overhead de activaciones y KV cache; cabe holgadamente en cualquier GPU con 4 GB o más.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,4 GB de pesos; en 4 bits, alrededor de 0,2 GB (estimaciones teóricas, no se publican artefactos cuantizados).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento, el autor usó una A100 de 40 GB con batch efectivo 256.
- Cabe en GPU de consumo: sí, con margen amplio, incluso en GPUs de gama baja o en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (tag `text-generation-inference` y `endpoints_compatible` en el repo). Para llama.cpp/Ollama sería necesario convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed2 | 361.821.120 | 2048 | Feroés (transfer desde nynorsk) | Apache 2.0 | Experimental, sin benchmarks |
| SmolLM2-360M-Instruct (modelo de partida) | ~362 M | 8192 (según ficha del modelo original) | Principalmente inglés | Apache 2.0 | Publicado y evaluado por Hugging Face |
| jekunz/smollm-360m-cpt-fineweb-norwegian-nynorsk (modelo base de esta ficha) | ~362 M | 2048 en CPT | Noruego nynorsk | Apache 2.0 | Experimental, sin benchmarks |

La comparación con modelos de feroés de referencia no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor declara explícitamente que no ha sido evaluado de forma amplia; no debe asumirse calidad de producción.
- Riesgo elevado de alucinación y de texto incoherente, propio de un modelo de 362 M tras CPT y sin SFT específico en feroés.
- Posible olvido catastrófico de capacidades del modelo original (inglés, instrucciones, formato chat) tras 1 época en nynorsk y 5 épocas en feroés sobre datos web.
- Sesgos desconocidos: no se documenta ningún análisis de sesgos; el corpus FineWeb-2 es web raspada y puede arrastrar sesgos de dominio y de representación.
- Ventana de contexto limitada a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura lingüística restringida: el feroés es una lengua de bajos recursos, por lo que la calidad del texto generado puede ser irregular y el vocabulario limitado.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de SmolLM2 conviene revisar las condiciones del modelo original y de los datos FineWeb-2 antes de un despliegue comercial.
- Sin artefactos cuantizados publicados: usar en llama.cpp u Ollama requiere conversión propia y validación posterior.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed2
- Modelo base (nynorsk): https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-norwegian-nynorsk
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo de partida de la familia SmolLM2: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
