# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed3

## Resumen

El modelo `smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed3` es un ajuste fino de SmolLM2-360M-Instruct desarrollado por el usuario jekunz, orientado a la generacion de texto en feroes (fo). Se trata de un experimento de investigacion que aplica un entrenamiento continuado (continued pre-training, CPT) en dos fases: primero sobre la porcion en noruego bokmal de FineWeb-2 y despues sobre la porcion en feroes del mismo corpus, aprovechando el transfer entre dos lenguas germanicas cercanas para mitigar la escasez de datos en feroes.

El modelo parte de la arquitectura Llama de SmolLM2, con 361.821.120 parametros totales, y se distribuye en formato safetensors bajo licencia Apache 2.0. Su ventana de contexto maxima durante el entrenamiento fue de 2048 tokens. El repositorio ocupa aproximadamente 0.7 GB y esta pensado para inferencia con la libreria transformers y text-generation-inference.

Es relevante como ejemplo de adaptacion de un modelo pequeno a un idioma de bajos recursos mediante transfer cross-lingue, y como semilla (seed 3 de tres configuraciones) para reproducir el experimento. No obstante, el propio autor indica que no se ha evaluado de forma amplia, por lo que debe tratarse como material de investigacion y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, derivado de SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (maxima durante el entrenamiento) |
| Tipos de cuantizacion | no disponible (no se especifican en la model card) |
| Idiomas soportados | feroes (fo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-360M-Instruct, un transformer decoder-only de tipo Llama con 361.821.120 parametros. El entrenamiento consistio en un continued pre-training en dos etapas sobre el corpus FineWeb-2: primero 1 epoca sobre la porcion en noruego bokmal y despues 5 epocas sobre la porcion en feroes. La hipotesis subyacente es que el noruego bokmal, con mayor volumen de datos, actua como puente para mejorar la representacion del feroes, idioma con recursos limitados.

Los hiperparametros documentados son: learning rate de 5e-4, scheduler coseno, warmup ratio de 0.05, batch size de 8, acumulacion de gradientes de 32 pasos (batch efectivo de 256), longitud maxima de contexto de 2048 tokens y semilla 3. El entrenamiento se ejecuto en una unica GPU A100 de 40 GB. No se documentan fases de RLHF, DPO ni otras tecnicas de alineacion adicionales; el punto de partida ya era una variante Instruct.

## Capacidades

- Generacion de texto en feroes, idioma objetivo del ajuste.
- Conversacion multi-turno, heredada de la base SmolLM2-360M-Instruct.
- Transfer cross-lingue desde noruego bokmal, que puede aportar cierta competencia residual en esa lengua, aunque no esta declarada oficialmente.
- No se documenta soporte de tool calling, function calling ni razonamiento agente multi-paso.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- No se documentan capacidades de codigo o matematicas especificas para este ajuste.

## Casos de uso

- Investigacion sobre transfer cross-lingue: el modelo sirve como punto de partida reproducible (seed 3) para estudiar como el preentrenamiento en noruego bokmal afecta al rendimiento en feroes, comparando con las otras dos semillas de la misma configuracion.
- Generacion de texto divulgativo en feroes: redaccion de parrafos cortos, resumenes o descripciones en feroes para prototipos de contenido, aprovechando la ventana de 2048 tokens.
- Prototipado de asistentes conversacionales en feroes: al derivar de una variante Instruct, puede sostener dialogos simples de pocos turnos en un entorno de pruebas, siempre con supervision humana.
- Aumento de datos para feroes: generacion de texto sintetico en feroes para ampliar corpus de entrenamiento de otros modelos, dado el bajo coste computacional de un modelo de 360M.
- Experimentos academicos de eficiencia: su tamano reducido permite ejecutar barridos de hiperparametros y comparativas de semillas en una sola GPU, como demuestra el entrenamiento en una A100 de 40 GB.
- Educacion e investigacion lingueistica: analisis de como un modelo pequeno representa el feroes y el noruego bokmal, y estudio de sesgos y artefactos en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1.4 GB solo para pesos (361.8M parametros x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 0.7 GB para pesos, mas overhead.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0.4 GB para pesos; en 4 bits, aproximadamente 0.2 GB.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM es suficiente en fp16; una RTX 3060, RTX 4060 o superior cubre el caso con holgura. Para entrenamiento o lotes grandes, se uso una A100 de 40 GB.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas, e incluso en CPU para inferencia de baja latencia.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible). No se confirma soporte de llama.cpp, Ollama, vLLM ni TGI en la informacion disponible, aunque la arquitectura Llama y el formato safetensors facilitan su conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed3 | 361.821.120 | 2048 | fo | Apache 2.0 | Hugging Face (jekunz) |
| SmolLM2-360M-Instruct (base) | 361.821.120 (aproximado, no confirmado en la informacion) | no disponible | multilingue (no detallado) | Apache 2.0 (segun la base) | Hugging Face (HuggingFaceTB) |
| smollm-360m-cpt-fineweb-norwegian-bokmaal (modelo base del ajuste) | 361.821.120 (aproximado, no confirmado en la informacion) | 2048 | nb | Apache 2.0 | Hugging Face (jekunz) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor declara que no ha sido evaluado de forma amplia, por lo que su calidad en feroes no esta validada.
- Riesgo de alucinacion: al ser un modelo de 360M entrenado con pocas epocas sobre un idioma de bajos recursos, es probable que genere contenido factualmente incorrecto o incoherente.
- Sesgos: los datos de FineWeb-2 pueden contener sesgos sociales, culturales y linguisticos que el modelo reproduce; no se documenta ninguna mitigacion.
- Limitacion de contexto: la ventana maxima documentada es de 2048 tokens, insuficiente para tareas de contexto largo.
- Limitacion idiomatica: solo se declara feroes; el uso en otras lenguas puede degradar la calidad y no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de SmolLM2-360M-Instruct conviene verificar las condiciones de la base original.
- Caveat de produccion: no se documentan cuantizaciones, benchmarks ni pruebas de robustez; no se recomienda su despliegue en produccion sin una evaluacion previa propia.
- Reproducibilidad: es una de tres semillas de la misma configuracion; los resultados pueden variar entre semillas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed3
- Modelo base del ajuste: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-norwegian-bokmaal
- Dataset utilizado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (familia base): https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
