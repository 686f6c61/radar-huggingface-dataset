# mtkhajavi/Qwen3.5-0.8B-math-edit-opus-5.5-25-passes

## Resumen

Qwen3.5-0.8B-math-edit-opus-5.5-25-passes es una variante editada del modelo base Qwen/Qwen3.5-0.8B, un transformer de texto de 752 millones de parámetros desarrollado originalmente por el equipo Qwen (Alibaba). La edición la firma el usuario mtkhajavi dentro de un experimento de investigación sobre weight-space programming, una técnica que modifica directamente los pesos del modelo sin recurrir a entrenamiento por gradiente. El resultado es un modelo que conserva la arquitectura y el tamaño del original pero con un comportamiento matemático sustancialmente distinto.

La relevancia de esta ficha no reside en el modelo como producto final, sino en el método: demuestra que una intervención quirúrgica sobre los pesos, guiada por un modelo de lenguaje de gran escala (Claude Opus 5.5) y validada con solo 25 forward passes sobre problemas de práctica, puede triplicar la precisión en MATH-500 (de 8,8 % a 33,3 %) y cuadruplicar la de GSM8K (de 12,8 % a 50,5 %) sin ningún tipo de ajuste por descenso de gradiente. Es un caso de estudio reproducible con código y evaluación publicados.

El modelo es de propósito general pero está optimizado para razonamiento aritmético y matemático de nivel escolar y de competición. Se distribuye con licencia Apache 2.0, en formato safetensors, y su reducido tamaño lo hace desplegable en hardware de consumo. No obstante, se trata de un artefacto de investigación con cero descargas y sin pipeline declarado, por lo que no debe considerarse un modelo listo para producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, variante text-only; tag `qwen3_5_text`) |
| Parametros totales | 752.393.024 (≈0,75 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 1,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5 en su variante exclusivamente textual. Sobre esa base no se ha realizado ningún entrenamiento adicional: el autor declara explícitamente que las reglas del experimento prohibían gradientes, optimizadores y cualquier ajuste de pesos contra una función de pérdida. La modificación consiste en una edición de espacio de pesos (weight-space programming) escrita por Claude Opus 5.5 tras inspeccionar los tensores del modelo.

La edición concreta afecta a tres salidas de atención, invertidas dentro del span de las filas de unembedding correspondientes a ocho palabras que abren línea. El archivo `edits.json` del repositorio lista los tensores modificados. El proceso de descubrimiento se realizó con 25 forward passes sobre problemas de práctica, es decir, evaluación pura sin actualización de parámetros. La evaluación se llevó a cabo con el `evaluate.py` de los autores bajo el protocolo think35 y vLLM 0.32.0, con 4 muestras por problema en MATH-500, 2 en el test de GSM8K y 2 en IFEval en modo estricto a nivel de prompt.

No se dispone de información sobre la composición del dataset de preentrenamiento del modelo base, el número de tokens utilizados ni si hubo fases de RLHF o DPO en su construcción original.

## Capacidades

- Generación de texto en la variante text-only de Qwen3.5; sin capacidades de visión ni audio.
- Razonamiento matemático reforzado por la edición: resolución de problemas de MATH-500 y GSM8K con precisión muy superior a la del modelo sin editar.
- Cumplimiento de instrucciones mejorado de forma colateral: IFEval sube de 22,0 % a 36,2 % pese a que la edición se diseñó para matemáticas.
- Modo de razonamiento tipo "think" implícito en el protocolo de evaluación think35 empleado por los autores.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en edición de modelos: reproducir el experimento con el código de `runs/claude-opus-5-5/exp8/p25c` para estudiar cómo intervenciones localizadas en atención y unembedding alteran el comportamiento matemático sin reentrenar.
- Enseñanza de aritmética y álgebra a nivel escolar: el modelo puede resolver problemas de GSM8K con un 50,5 % de acierto, útil como tutor de refuerzo con supervisión humana en entornos educativos de bajo coste.
- Prototipado rápido en hardware de consumo: con 752 M de parámetros y pesos safetensors de 1,5 GB, cabe en GPUs domésticas y permite iterar sobre prompts y evaluaciones sin infraestructura dedicada.
- Generación de problemas matemáticos sintéticos: usar el modelo como generador de enunciados y soluciones paso a paso para aumentar datasets de entrenamiento, filtrando posteriormente por verificación simbólica.
- Baseline para comparativas de técnicas de edición: sirve como referencia cuantitativa (MATH-500, GSM8K, IFEval) frente a otras ediciones de espacio de pesos o a fine-tuning tradicional del mismo modelo base.
- Evaluación de robustez y alineación: al ser una modificación no supervisada de pesos, es un caso útil para estudiar efectos secundarios de las ediciones (cambios en IFEval, posibles regresiones en otras tareas) antes de adoptar técnicas similares en producción.
- Docencia sobre interpretabilidad: analizar qué tensores concretos (tres salidas de atención y filas de unembedding de ocho palabras) producen una mejora de 24,5 puntos en MATH-500 resulta un ejemplo didáctico de mecánica interna de transformers.

## Benchmarks y rendimiento

Resultados publicados por el autor con `evaluate.py`, protocolo think35 y vLLM 0.32.0. Muestras por problema: 4 en MATH-500, 2 en GSM8K test, 2 en IFEval estricto a nivel de prompt.

| Modelo | MATH-500 (%) | GSM8K (%) | IFEval (%) |
|---|---|---|---|
| Qwen3.5-0.8B sin editar | 8,8 | 12,8 | 22,0 |
| Esta edición (25 forward passes) | 33,3 | 50,5 | 36,2 |

Incrementos absolutos: +24,5 puntos en MATH-500, +37,7 en GSM8K y +14,2 en IFEval. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 1,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica entre 2 y 4 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,8 GB de pesos; en 4 bits, alrededor de 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, RTX 4090); A100 y H100 sobredimensionadas para este tamaño, útiles solo para evaluación por lotes a gran escala.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en iGPU con suficiente memoria compartida si se cuantiza.
- Opciones de despliegue: vLLM 0.32.0 es la versión empleada por los autores para la evaluación; llama.cpp y Ollama son viables previa conversión a GGUF, que no está publicada en el repositorio. TGI no está confirmado para la arquitectura `qwen3_5_text`.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera throughput alto en una sola GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Esta edición | 752 M | no disponible | 33,3 % | 50,5 % | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen3.5-0.8B (base) | 752 M | no disponible | 8,8 % | 12,8 % | Apache 2.0 | HuggingFace (modelo oficial) |
| Alternativas de ~0,5-1 B con foco matemático | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos verificables es contra el propio modelo base, que es el punto de referencia natural del experimento. No se dispone de resultados de otros modelos de tamaño comparable evaluados bajo el mismo protocolo think35 en la información proporcionada, por lo que no se incluyen cifras de terceros.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y sin pipeline declarado: no ha pasado por validación comunitaria ni por pruebas de producción.
- La edición no fue supervisada por gradiente ni por una función de pérdida; los efectos secundarios sobre tareas distintas de matemáticas e instrucciones no están caracterizados más allá de IFEval.
- Riesgo de alucinación inherente a un modelo de 0,75 B: la mejora en benchmarks no elimina la propensión a inventar pasos intermedios o resultados numéricos plausibles pero incorrectos.
- Precisión absoluta todavía baja: 33,3 % en MATH-500 y 50,5 % en GSM8K implican que falla en la mayoría de problemas de competición y en uno de cada dos problemas escolares.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento aceptable fuera del inglés sin evaluación previa.
- Longitud de contexto no documentada: inadecuado para tareas que requieran ventanas largas hasta que se verifique el límite real.
- Sin cuantizaciones publicadas: desplegar en llama.cpp u Ollama requiere convertir los safetensors a GGUF y validar que la edición sobrevive al proceso.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y la naturaleza experimental de la edición aconsejan auditoría propia antes de integrarlo en productos.
- Sesgos del modelo base Qwen3.5-0.8B no documentados en esta ficha; deben evaluarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mtkhajavi/Qwen3.5-0.8B-math-edit-opus-5.5-25-passes
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del experimento (código, edición y evaluación): https://github.com/MatinKhajavi/Weight-Space-Programming
- Blog de referencia "Sparks of Weight-Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
