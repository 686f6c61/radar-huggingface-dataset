# osunlp/PreNormLoop-0.6B

## Resumen

PreNormLoop-0.6B (publicado en Hugging Face como ARLoop-baseline-0.6B) es un modelo de lenguaje de tipo base pretrained desarrollado por el grupo OSUNLP. Se trata del checkpoint final de una ejecución de entrenamiento de aproximadamente 180.000 millones de tokens, y constituye la línea base de bucle fijo (fixed-loop) del proyecto ARLoop, una investigación sobre transformers recurrentes con pesos compartidos entre pasadas.

El modelo emplea una arquitectura transformer con 18 capas físicas que se reutilizan en 3 pasadas recurrentes, lo que da una profundidad efectiva de 54 capas con solo 582.804.096 parámetros reales almacenados. Esta compartición de pesos reduce drásticamente el coste de memoria frente a un transformer denso de profundidad equivalente, manteniendo una ventana de contexto de 4096 tokens y un vocabulario de 49152 entradas basado en el tokenizador de SmolLM2.

Su relevancia actual radica en que sirve como referencia reproducible para estudiar arquitecturas recurrentes de pesos compartidos frente a transformers convencionales, y su licencia Apache 2.0 facilita la experimentación y el análisis comparativo. Es un modelo exclusivamente en inglés y sin ajuste fino conversacional, por lo que su uso previsto es la compleción de texto y la investigación arquitectónica, no el despliegue como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente con pesos compartidos (18 capas físicas, 3 pasadas, profundidad efectiva 54) |
| Parametros totales | 582.804.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (la model card solo documenta carga en float32; no se publican pesos GGUF ni cuantizados) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` y código personalizado) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con normalización PreNorm estándar y sin enrutamiento de residuales de atención. La innovación central es la recurrencia: 18 capas físicas se ejecutan en 3 pasadas sucesivas, alcanzando una profundidad efectiva de 54 capas. Las dimensiones internas son 1536 para el hidden state y 4608 para la capa intermedia del MLP, con 16 cabezas de atención y 4 cabezas KV (GQA con ratio 4:1). La base de RoPE es 50000 y la cabeza de salida está atada a los embeddings de tokens. Los value embeddings se comparten entre capas físicas alternas.

El entrenamiento se completó en 171.660 pasos de optimizador, cubriendo 179.998.556.160 tokens. Se utilizó el tokenizador de SmolLM2 con vocabulario de 49152 entradas. No se documenta en la información disponible la composición del dataset, ni si hubo fases de RLHF, DPO o SFT; la model card indica explícitamente que se trata de un modelo base pretrained para compleción de texto, no de un modelo conversacional.

## Capacidades

- Generación de texto y compleción de secuencias en inglés.
- Razonamiento básico derivado del preentrenamiento (sin ajuste instructivo).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso guiado.
- Cobertura multilingüe limitada al inglés.
- Sin capacidades de visión, audio ni modo de pensamiento (thinking).
- Requiere cargar código personalizado (`trust_remote_code=True`) para la implementación de la recurrencia.

## Casos de uso

- Investigación en arquitecturas recurrentes: sirve como línea base fija para comparar el efecto de la compartición de pesos y las pasadas recurrentes frente a transformers densos de profundidad equivalente, usando el mismo presupuesto de parámetros.
- Compleción de texto en inglés: adecuado para tareas de autocompletado y generación libre en dominios generales, dado su entrenamiento sobre 180.000 millones de tokens.
- Evaluación de eficiencia de memoria: al almacenar solo 582 millones de parámetros para una profundidad efectiva de 54 capas, permite estudiar el equilibrio entre calidad y coste de memoria en GPUs de gama media.
- Reproducción de experimentos: el código de entrenamiento está publicado en el repositorio `ykyaol7/ARLoop`, lo que facilita replicar o extender el entrenamiento con otros presupuestos de tokens.
- Generación de datos sintéticos en inglés: puede emplearse para producir texto de dominio general en pipelines de aumento de datos, siempre con revisión posterior por su condición de modelo base.
- Estudio de dinámicas de recurrencia: útil para analizar cómo se comporta la representación interna a lo largo de las tres pasadas y detectar degradación o saturación de información.
- Prototipado de inferencia en CPU: con 582 millones de parámetros en float32 (unos 2,3 GB de pesos), es viable ejecutarlo en CPU para pruebas de integración sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 2,3 GB solo para pesos, más memoria para activaciones y caché KV (con contexto de 4096 y 4 cabezas KV, la caché es reducida).
- VRAM estimada en bfloat16: alrededor de 1,2 GB para pesos, si se convierte manualmente (la model card solo documenta carga en float32).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para float32 con contexto completo; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque para este tamaño las consumer son suficientes.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM.
- Opciones de despliegue: `transformers` (versión 5.22.0 según la model card) con `trust_remote_code=True`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF limita el despliegue en runtimes ligeros.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PreNormLoop-0.6B (ARLoop-baseline) | 582.804.096 | 4096 | Transformer recurrente, 18 capas físicas / 54 efectivas | Apache 2.0 | Hugging Face, requiere código personalizado |
| SmolLM2-360M | no disponible en la información | no disponible en la información | Transformer denso | no disponible en la información | Hugging Face |
| Qwen2.5-0.5B | no disponible en la información | no disponible en la información | Transformer denso | no disponible en la información | Hugging Face |

La comparación cuantitativa con alternativas de tamaño similar no está disponible en la información proporcionada; los modelos citados se incluyen únicamente como referencia de categoría (modelos pequeños en inglés), sin datos de rendimiento verificados en esta ficha.

## Limitaciones y advertencias

- Es un modelo base pretrained: no está ajustado para seguir instrucciones ni para mantener conversaciones; su salida puede ser incoherente en formato diálogo.
- Riesgo de alucinación inherente a un modelo de 582 millones de parámetros entrenado sin fases de alineación documentadas.
- Cobertura exclusiva del inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Ventana de contexto limitada a 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo; conviene auditar el repositorio antes de usarlo en producción.
- Dependencia de una versión concreta de `transformers` (5.22.0 según la model card), lo que puede complicar la integración en entornos con versiones fijadas.
- No se publican pesos cuantizados ni soporte para runtimes de inferencia optimizados, lo que limita el despliegue en producción a gran escala.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin alineación, el usuario asume la responsabilidad sobre los sesgos y la calidad de las salidas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/osunlp/ARLoop-baseline-0.6B
- Código de entrenamiento (ARLoop): https://github.com/ykyaol7/ARLoop
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
