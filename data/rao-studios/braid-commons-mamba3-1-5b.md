# rao-studios/braid-commons-mamba3-1.5b

## Resumen

braid-commons-mamba3-1.5b es el modelo base ("commons") del sistema Braid desarrollado por Rao Studios. No es un modelo entrenado desde cero: se trata del checkpoint state-spaces/mamba3-mimo-1.5b de los autores de Mamba-3, reempaquetado sin modificaciones (valores BF16 ensanchados a F32) en formato safetensors bajo los nombres `mamba_ssm` originales. Rao Studios no entrenó ni alteró los pesos.

El modelo implementa una arquitectura SSM pura (Mamba-3 MIMO) de 24 capas y anchura 2.048, sin atención ni KV cache, con 1.497 millones de parámetros y un vocabulario de 128.256 tokens correspondiente al tokenizer de Llama 3.1. Su función dentro de Braid es servir de referencia congelada sobre la que se entrenan "Threads": deltas de bloques 0..<12 con su propio corpus, que se acoplan delante de la cola del commons (bloques 12..<24, embedding y norma final) para ofrecer trazabilidad por token.

La relevancia del proyecto reside en su propuesta de procedencia verificable: cada token se reparte exactamente entre las hebras activas y la parte de cada Thread se cita a su propio texto, con un registro de sesión que permite recalcular pesos, probabilidades y cuotas. El commons por sí solo no es un modelo conversacional ni está ajustado a instrucciones; su utilidad plena aparece al combinarlo con Threads mediante la herramienta Braid.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-3 MIMO (SSM puro, sin atención), 24 capas de anchura 2.048; cada capa: mixer MIMO (64 cabezas de 64, estado 128, un grupo, rango 4, 32 ángulos rotatorios) + MLP con puerta, ambas con RMS-norm |
| Parametros totales | 1.497.082.880 (1.497,1M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | en (inglés) |
| Licencia | other (apache-2.0-and-llama3.1) |
| Formato de pesos | safetensors (nombres `mamba_ssm`, F32) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de espacio de estados Mamba-3 en variante MIMO, sin mecanismo de atención y por tanto sin KV cache. Cada una de las 24 capas combina un mixer MIMO (64 cabezas de dimensión 64, estado de 128, un solo grupo, rango 4 y 32 ángulos rotatorios) con un MLP con puerta, ambos normalizados con RMS-norm. Los embeddings están atados: la matriz de embedding sirve tanto para leer tokens de entrada como para puntuar la salida. La activación de A es de cola pesada ("heavy-tail"), registrada en `config.json` como `braid_a_activation`; el upstream la cambió desde softplus el 2026-06-01, antes del release, y la decisión de fijarla se tomó tras una lectura held-out que favorecía heavy-tail en los 24 documentos pero por menos que su propio margen.

El entrenamiento es el del upstream: 100.000 millones de tokens de FineWeb-Edu con contexto de 2.048. Rao Studios no realizó ningún entrenamiento sobre el commons. La innovación técnica del ecosistema Braid no está en el entrenamiento del modelo base, sino en el mecanismo de composición: un Thread es un delta entrenado sobre un corpus concreto que aporta bloques nuevos 0..<12 delante de la cola congelada del commons (bloques 12..<24, embedding de 262,7M y norma final), compartiendo instancias de módulo sin copiarlas. Una capa de sincronización pondera cada Thread por su elevación reciente sobre el commons y mezcla las distribuciones. El head de un Thread es de 617,2M de parámetros; la cola del commons, de 879,9M.

## Capacidades

- Generación de texto autoregresiva en inglés sobre el dominio de FineWeb-Edu.
- Modelo base sin ajuste a instrucciones: no es un modelo de chat ni responde preguntas por sí solo.
- Composición con Threads: permite acoplar deltas entrenados sobre corpus propios y mezclar distribuciones por token.
- Trazabilidad por token: cada probabilidad se reparte entre hebras y la parte de cada Thread se cita a su documento de origen mediante su índice.
- Detección de dominio: la elevación de un Thread frente al commons y su entropía sirven como señal de que el texto pertenece a su corpus (AUROC 1.000 en las ablaciones reportadas).
- Sin soporte de tool calling, function calling, agentes, visión, audio ni modo thinking (no documentado).
- Multilingüismo limitado al inglés.
- Sin KV cache, lo que simplifica el despliegue en memoria frente a transformers con atención.

## Casos de uso

- Atribución de fuentes en generación: desplegar el commons con Threads entrenados sobre corpus documentales propios para que cada token generado quede citado al documento de origen, útil en entornos donde se exige auditoría de la salida.
- Detección de texto dentro de dominio: usar la elevación de un Thread frente al commons como clasificador para determinar si un texto pertenece a un corpus concreto, con la AUROC reportada en las ablaciones.
- Construcción de asistentes especializados por dominio: entrenar un Thread sobre normativa interna, documentación técnica o base de conocimiento y servirlo detrás del commons para respuestas acotadas al corpus.
- Investigación en arquitecturas SSM: emplear el checkpoint como base reproducible para experimentos con Mamba-3 MIMO sin atención y sin KV cache, con contexto de 2.048.
- Prototipado de sistemas de procedencia: usar el registro de sesión de Braid para recalcular pesos, probabilidades y cuotas por token en pipelines de verificación.
- Despliegue de submodelos ligeros: el head de un Thread (617,2M) más la cola del commons (879,9M) permiten servir dominios especializados sin duplicar el modelo completo.
- Evaluación comparativa de mecanismos de mezcla: estudiar el comportamiento de la capa de sincronización con Threads que se acoplan y desacoplan a mitad de respuesta (pesos 0, 0,10, 0,28 a 0,89 en el ejemplo del autor).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las únicas métricas reportadas son ablaciones de procedencia sobre este commons con cut 12 (2026-11-11):

| Metrica | Resultado |
|---|---|
| AUROC del delta de un Thread frente a textos no vistos | 1.000 |
| Puntuación del delta en sus propios textos | 0.966 |
| Puntuación de un head de bloques propios del commons | 0.566 |
| Posiciones con mayor elevación ponderada del holder | 99,6 % |
| Cadenas vivas en posiciones coherentes (9.644) | 100 % |

No hay datos de MMLU, HumanEval, GSM8K ni comparativas de rendimiento general.

## Requisitos de hardware

- VRAM estimada: los pesos se publican en F32 (6,0 GB de repositorio); en BF16 rondarían los 3,0 GB y en FP16 similar. No se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs de consumo con al menos 8 GB en BF16/FP16, y en 6-8 GB en F32 ajustado.
- Cabe en GPU de consumo: sí, por el tamaño de 1,5B, aunque no hay validación publicada de despliegue en consumer.
- Opciones de despliegue: Braid (`braid import`, `braid init`, `braid thread create`) es la vía documentada. Sin Braid, el autor indica usar el checkpoint upstream con `mamba_ssm`, ya que no existe clase de transformers para Mamba-3. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| braid-commons-mamba3-1.5b | 1.497,1M | 2.048 | Mamba-3 MIMO (SSM) | apache-2.0-and-llama3.1 | Hugging Face, requiere Braid o `mamba_ssm` |
| state-spaces/mamba3-mimo-1.5b | no disponible en la información | no disponible | Mamba-3 MIMO | no disponible | Hugging Face (upstream) |
| Mamba2 130m (bench de Braid) | 130M | no disponible | Mamba2 | no disponible | Referenciado en la model card como bench interno |

No se dispone de datos de benchmarks comparativos con modelos de atención de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat ni está ajustado a instrucciones; no responde preguntas sobre un corpus por sí solo.
- Solo inglés; el vocabulario es el tokenizer de Llama 3.1 (128.256 tokens) con BOS 128000.
- Contexto de entrenamiento limitado a 2.048 tokens.
- Licencia compuesta "apache-2.0-and-llama3.1": al incorporar el tokenizer de Llama 3.1, se aplican las restricciones de la licencia de Llama 3.1 además de Apache 2.0; revisar el archivo LICENSE antes de uso comercial.
- El commons no fue entrenado por Rao Studios; los pesos son los del upstream reempaquetados, por lo que hereda sus sesgos y limitaciones.
- La activación de A (heavy-tail) se fijó por decisión del autor tras una lectura held-out cuyo margen no era concluyente; puede afectar a la reproducibilidad frente al upstream.
- No existe clase de transformers para Mamba-3; el despliegue sin Braid requiere `mamba_ssm` y conocimiento de la API upstream.
- Riesgo de alucinación no evaluado en la información disponible; la procedencia por token mitiga la atribución, no la veracidad del contenido.
- El ecosistema Braid es joven (herramienta en GitHub) y las métricas de procedencia provienen de ablaciones del propio autor, no de evaluación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/rao-studios/braid-commons-mamba3-1.5b
- Modelo base upstream: https://huggingface.co/state-spaces/mamba3-mimo-1.5b
- Repositorio Braid: https://github.com/rao-studios/Braid
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper referenciado (arXiv 2603.15569): https://arxiv.org/abs/2603.15569
- Paper referenciado (arXiv 2510.13999): https://arxiv.org/abs/2510.13999
