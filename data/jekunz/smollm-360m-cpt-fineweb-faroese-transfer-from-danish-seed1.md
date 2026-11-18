# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-danish-seed1

## Resumen

SmolLM2-360M-Instruct adaptado al feroes mediante entrenamiento continuado (continual pre-training, CPT) sobre FineWeb-2. El modelo lo publica el usuario `jekunz` como parte de una investigación sobre transferencia lingüística entre lenguas germánicas nórdicas: primero se ajusta sobre el subconjunto danés de FineWeb-2 y después sobre el feroes, partiendo de la base SmolLM2-360M-Instruct de Hugging Face. La ficha corresponde a la semilla 1 de tres configuraciones de entrenamiento idénticas.

La relevancia práctica es acotada pero clara: el feroes es una lengua de bajos recursos (unos 70.000 hablantes) con muy poca representación en corpus de preentrenamiento. Este modelo demuestra una receta de bajo coste (una sola A100 de 40 GB, 6 épocas combinadas) para transferir capacidad desde una lengua emparentada con más datos hacia una con menos. No es un modelo de producción: el autor indica explícitamente que no se ha evaluado de forma amplia.

Arquitectura transformer decoder-only de 361,8 millones de parámetros, contexto de 2.048 tokens y licencia Apache 2.0. El repositorio ocupa 0,7 GB en safetensors y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM2, variante Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión original; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | Feroes (`fo`); el modelo base conserva capacidad residual en inglés por herencia de SmolLM2 |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`, arquitectura `llama`) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-360M-Instruct, un transformer decoder-only denso con atención causal estándar y tokenizador propio de la familia SmolLM2. El autor no documenta cambios arquitectónicos: se trata de un ajuste de todos los pesos sobre nuevos datos, no de una modificación estructural. El tag `llama` en Hugging Face indica compatibilidad con la implementación Llama de `transformers`, lo que facilita su carga con las herramientas habituales.

El entrenamiento consta de dos fases secuenciales sobre FineWeb-2: una época con el subconjunto danés y cinco épocas con el feroes, con tasa de aprendizaje 5e-4, scheduler coseno, ratio de warmup 0,05, batch size 8 y acumulación de gradientes de 32 pasos (batch efectivo de 256), todo sobre una única A100 de 40 GB. La semilla es la 1 de tres. No se especifica el número total de tokens procesados, la composición exacta del corpus ni si hubo etapas de alineación adicionales (RLHF/DPO) más allá de las ya presentes en el modelo Instruct de origen. La innovación metodológica es la transferencia vía danés: aprovechar el parentesco lingüístico para que el modelo llegue al feroes con representaciones ya adaptadas al dominio germánico nórdico.

## Capacidades

- Generación de texto conversacional en feroes, heredada del formato Instruct del modelo base.
- Comprensión y generación en danés como efecto secundario de la primera fase de CPT, aunque no se documenta su calidad final.
- Capacidad residual en inglés por herencia de SmolLM2, sin garantías de conservación tras seis épocas de ajuste.
- Razonamiento básico y respuesta a instrucciones simples, limitado por el tamaño de 360 M de parámetros.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- No se documenta capacidad de código ni matemáticas más allá de lo que aporte el modelo base.

## Casos de uso

- Normalización y generación de texto feroes en corpus lingüísticos: el modelo puede emplearse para aumentar datos o generar variantes de frases en feroes dentro de proyectos de documentación de la lengua, aprovechando que fue entrenado específicamente sobre FineWeb-2 feroes.
- Prototipos de asistentes conversacionales en feroes: con 2.048 tokens de contexto puede sostener intercambios cortos de atención al cliente o FAQ, siempre con validación humana por la falta de evaluación publicada.
- Investigación sobre transferencia entre lenguas nórdicas: sirve como punto de partida reproducible (semilla 1 de 3) para estudiar el efecto del preentrenamiento intermedio en danés antes del feroes.
- Traducción asistida danés-feroes en entornos controlados: la doble exposición a ambos subconjuntos permite experimentar con traducción de frases cortas, aunque sin benchmarks que respalden la calidad.
- Etiquetado y clasificación de texto feroes: al ser un modelo pequeño, puede ajustarse de nuevo (fine-tuning) para tareas concretas de clasificación con recursos muy limitados, por ejemplo en una única GPU de consumo.
- Generación de material educativo en feroes: redacción de ejercicios o textos breves para enseñanza del idioma, con revisión posterior por hablantes nativos.
- Base para experimentos de destilación o de adaptación de bajo coste: su tamaño de 0,7 GB permite iterar rápidamente en investigación académica sobre lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo "no ha sido evaluado más ampliamente" y que su uso previsto es la investigación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,75-1 GB de pesos, más overhead de activaciones y KV cache; en la práctica cabe en cualquier GPU con 4 GB o más.
- Cuantización a 8 bits: en torno a 0,4 GB de pesos; a 4 bits, unos 0,2 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU moderna sirve; una A100 o H100 está sobredimensionada para inferencia y solo tiene sentido para reentrenamiento. Una RTX 4090, RTX 3090 o incluso una RTX 3060 de 12 GB son suficientes.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1660, RTX 2060 y modelos con 6 GB o más; también puede ejecutarse en CPU con latencia aceptable para un modelo de este tamaño.
- Opciones de despliegue: `transformers` de forma nativa, `text-generation-inference` (el repo está marcado como compatible con endpoints), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se distribuyen en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-danish-seed1 | 361,8 M | 2.048 | Feroes (y residual danés/inglés) | Apache 2.0 | Publicado, sin evaluar |
| HuggingFaceTB/SmolLM2-360M-Instruct (modelo base) | 361,8 M | 8.192 (según ficha oficial de SmolLM2) | Multilingüe, principalmente inglés | Apache 2.0 | Ampliamente evaluado |
| Modelos específicos para feroes de mayor tamaño | no disponible | no disponible | Feroes | no disponible | no disponible |

La comparación con el modelo base es la más informativa: este CPT reduce el contexto efectivo a 2.048 tokens y sacrifica capacidades multilingües generales a cambio de especialización en feroes, sin métricas publicadas que cuantifiquen la ganancia. No se dispone de datos sobre alternativas comparables específicas para feroes en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks de perplejidad, MMLU, generación ni ninguna métrica publicada; el propio autor lo señala.
- Riesgo elevado de alucinación y de degradación del inglés y del danés tras seis épocas de ajuste sobre feroes, sin datos que lo confirmen o desmientan.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sesgos desconocidos: no se documenta la composición de FineWeb-2 feroes ni posibles sesgos de género, político o geográfico.
- Tokenizador no adaptado específicamente al feroes: al mantener el tokenizador de SmolLM2, la eficiencia en feroes puede ser inferior a la de un tokenizador entrenado para la lengua.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su despliegue en producción sin una validación previa exhaustiva.
- Modelo de investigación con cero descargas y cero interacciones: no hay evidencia de uso real ni de mantenimiento.
- El nombre del repositorio indica una semilla concreta (seed 1 de 3); los resultados pueden variar entre semillas y no se publican las otras dos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-danish-seed1
- Modelo base del CPT: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-danish
- Modelo original SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
