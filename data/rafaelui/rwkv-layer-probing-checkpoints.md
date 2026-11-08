# RafaelUI/rwkv-layer-probing-checkpoints

## Resumen

`RafaelUI/rwkv-layer-probing-checkpoints` no es un modelo de lenguaje de propósito general, sino una colección de checkpoints de investigación publicada junto al artículo *Which layers know what? Probing RWKV-7 against Transformers (RoPE and NoPE) at small scale* (Alexei Goncharov, noviembre de 2026). El repositorio contiene 12 ejecuciones de entrenamiento (combinaciones de idioma ru/en, tamaño M/L y tres arquitecturas distintas) con 21 checkpoints por ejecución, tomados desde la inicialización aleatoria (step 0) y después cada 5 % del entrenamiento. Su objetivo es permitir el análisis capa por capa (*probing*) de qué información codifica cada nivel de la red en tres arquitecturas comparables.

Las tres arquitecturas incluidas son RWKV-7, un Transformer con embeddings posicionales rotatorios (RoPE) y un Transformer sin codificación posicional (NoPE). Los modelos son deliberadamente pequeños: el tamaño M tiene 512 dimensiones de anchura, 12 capas y 56,6 M de parámetros, mientras que el tamaño L tiene 768 dimensiones, 12 capas y aproximadamente 115 M de parámetros. Se entrenaron sobre corpus en ruso e inglés de 1,0 B y 2,0 B de tokens respectivamente.

La relevancia de esta publicación es metodológica: ofrece una infraestructura reproducible para estudiar la evolución del conocimiento representacional a lo largo del entrenamiento y comparar modelos recurrentes lineales (RWKV-7) con Transformers clásicos bajo un mismo presupuesto de cómputo. No está pensada para inferencia en producción ni para tareas generativas, sino para experimentos de interpretabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7; Transformer con RoPE; Transformer sin codificación posicional (NoPE) |
| Parametros totales | 56,6 M (tamaño M); ~115 M (tamaño L) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch pickle (`.pth`, fp32); `config.json` en formato Transformers; logs en `.jsonl` y `.txt` |

## Arquitectura y entrenamiento

El repositorio agrupa tres familias de arquitecturas bajo un mismo protocolo experimental. RWKV-7 es un modelo recurrente lineal con mecánica de atención linealizada que evita el coste cuadrático de la atención clásica; los otros dos son Transformers convencionales, uno con embeddings posicionales rotatorios (RoPE) y otro sin ningún tipo de codificación posicional (NoPE), lo que permite aislar el efecto de la señal posicional en las representaciones internas.

Cada configuración se entrena en dos tamaños: M (512 de anchura, 12 capas, 56,6 M de parámetros, 3 800 pasos, ~1,0 B tokens) y L (768 de anchura, 12 capas, ~115 M de parámetros, 7 600 pasos, ~2,0 B tokens). Se generan 12 ejecuciones en total (2 idiomas × 2 tamaños × 3 arquitecturas), cada una con 21 checkpoints: el step 0 (inicialización aleatoria) y uno cada 5 % del entrenamiento. Los datos se almacenan en fp32 como pickles de PyTorch, acompañados de curvas de pérdida (`loss_data.jsonl`), conjuntos de validación (`val.jsonl`), configuración (`config.json`) y registro de entrenamiento (`train_log.txt`). El autor indica que aún no se han publicado la segunda semilla (seed 1), el código de entrenamiento, los tokenizadores BPE de 16k ni los manifiestos de datos.

## Capacidades

- No es un modelo generativo listo para uso: los checkpoints están pensados para *probing* e interpretabilidad, no para inferencia de usuario final.
- Permite extraer representaciones internas capa por capa en 21 puntos del entrenamiento para estudiar la emergencia de habilidades.
- Comparación controlada entre RWKV-7, Transformer con RoPE y Transformer sin codificación posicional bajo el mismo presupuesto de tokens y pasos.
- Cobertura bilingüe ruso-inglés en los corpus de entrenamiento.
- Suministra curvas de pérdida y logs de entrenamiento para reproducir el análisis.
- No dispone de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en interpretabilidad mecanicista: cargar los checkpoints de cada step y entrenar sondas lineales sobre las activaciones de cada capa para medir cuándo emerge la codificación de información sintáctica o semántica.
- Estudio comparado de codificación posicional: usar los pares RoPE/NoPE para aislar el efecto de la posición en las representaciones internas a lo largo del entrenamiento.
- Análisis de modelos recurrentes lineales: comparar la evolución de las representaciones de RWKV-7 con las de los Transformers equivalentes para evaluar si el estado recurrente captura información posicional de forma equivalente.
- Reproducción de experimentos académicos: el conjunto de 12 ejecuciones con curvas de pérdida permite replicar los resultados del artículo de Goncharov (noviembre de 2026) sin reentrenar.
- Docencia en cursos de deep learning: los modelos pequeños (56,6 M y 115 M de parámetros) caben en una GPU de consumo y permiten ilustrar visualmente la dinámica de entrenamiento y la especialización por capas.
- Estudios de dinámica de entrenamiento: los 21 checkpoints por ejecución permiten trazar la evolución de métricas de probing a lo largo del 100 % del entrenamiento en intervalos del 5 %.
- Comparación multilingüe a pequeña escala: los pares ru/en permiten estudiar diferencias en la formación de representaciones entre dos idiomas con presupuestos de datos idénticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un modelo de 56,6 M de parámetros en fp32 ocupa aproximadamente 226 MB de pesos, y el de ~115 M alrededor de 460 MB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para cargar un checkpoint y ejecutar *probing*; una RTX 3060, RTX 4090 o A100 son válidas.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más.
- Opciones de despliegue: no aplica para vLLM, TGI o llama.cpp, ya que los pesos son pickles de PyTorch en fp32 y el modelo no está orientado a servir peticiones. Se cargan con `torch.load` y el paquete `rwkv` de PyPI para la variante RWKV-7.
- Latencia y throughput: no disponible; no se han publicado mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RafaelUI/rwkv-layer-probing-checkpoints | 56,6 M / ~115 M | no disponible | Checkpoints de investigación para probing (RWKV-7, RoPE, NoPE) | Apache 2.0 | Hugging Face |
| Modelos RWKV-7 oficiales (p. ej. series publicadas por el proyecto RWKV) | no disponible en la información | no disponible | Modelos generativos de propósito general | no disponible | Hugging Face / GitHub |
| Transformers pequeños tipo GPT-2 small | 124 M | 1 024 tokens | Transformer decoder con posiciones aprendidas | MIT (GPT-2) | Hugging Face |
| Pythia-160M (EleutherAI) | 160 M | 2 048 tokens | Transformer con RoPE y checkpoints intermedios | Apache 2.0 | Hugging Face |

La comparación es aproximada: este repositorio no compite en rendimiento generativo, sino que se posiciona como infraestructura de investigación. Pythia es el referente más cercano en cuanto a publicación de checkpoints intermedios para estudios de interpretabilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje de propósito general: el propio autor lo indica explícitamente; no debe usarse para generación, asistencia o producción.
- Solo se ha publicado la semilla 0; los resultados pueden no ser robustos a variaciones de inicialización.
- Faltan el código de entrenamiento, los tokenizadores BPE de 16k y los manifiestos de datos, lo que limita la reproducibilidad completa.
- Los pesos son pickles de PyTorch (`.pth`), un formato que puede ejecutar código arbitrario al cargarse; deben descargarse solo de fuentes de confianza.
- Idiomas limitados a ruso e inglés; no hay evidencia de capacidades multilingües adicionales.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser modelos pequeños entrenados con ~1-2 B tokens, su calidad generativa sería muy limitada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece ninguna utilidad práctica para ese fin.
- Longitud de contexto no documentada; no debe asumirse ninguna ventana concreta.

## Enlaces

- Hugging Face: https://huggingface.co/RafaelUI/rwkv-layer-probing-checkpoints
- Repositorio del artículo en GitHub: https://github.com/RafaelUI/rwkv-layer-probing_ARTICLE
- Perfil de GitHub del autor: https://github.com/RafaelUI
- Paquete `rwkv` en PyPI: https://pypi.org/project/rwkv/
