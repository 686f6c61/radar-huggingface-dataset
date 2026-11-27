# adpretko/celerity-271m-8k-tpp-ablation-ad0-tpp8

## Resumen

Celerity 271M 8K es un checkpoint de un modelo de lenguaje de 271 millones de parámetros entrenado por Cerebras y publicado en Hugging Face por el usuario adpretko. Se trata de una ablación concreta dentro de una familia de experimentos denominada TPP (tokens per parameter): en este caso, el experimento `ad0_ild_tpp8`, con un objetivo nominal de 8 tokens por parámetro, sin attention dropout en el extremo final de la programación lineal y con una longitud máxima de secuencia de 8192 tokens. El modelo se distribuye como pesos convertidos desde el formato nativo de Cerebras (`checkpoint_7346.mdl`) al formato de Hugging Face, con código personalizado.

El interés del checkpoint es fundamentalmente de investigación: no es un modelo listo para producción ni un lanzamiento comercial, sino un artefacto de un estudio controlado sobre cómo afectan variables de entrenamiento (dropout de atención, tokens por parámetro, tamaño de lote, learning rate) al comportamiento de un transformer pequeño. Su relevancia radica en que permite reproducir y auditar experimentos de escalado de datos frente a parámetros en un régimen de cómputo modesto, y en que documenta con precisión la procedencia del entrenamiento (3 sistemas CSX, 7346 pasos, 2,17 mil millones de tokens, dataset CommonPile).

La arquitectura es un transformer decoder-only con embeddings posicionales ALiBi, contexto de 8192 tokens y entrenado sobre un pool corregido sin repeticiones de CommonPile. El repositorio ocupa 0,5 GB, lo que es coherente con 271M de parámetros en precisión de 16 bits. No hay información publicada sobre licencia, idiomas soportados ni pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con embeddings posicionales ALiBi |
| Parametros totales | 271M (nominal, segun el nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (maximum sequence length) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Pesos convertidos a formato Hugging Face; requiere `trust_remote_code=True`. Formato de fichero concreto no especificado (repositorio de 0,5 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 271M de parámetros con embeddings posicionales de tipo ALiBi, lo que permite extender la ventana de contexto hasta 8192 tokens sin embeddings posicionales aprendidos. La configuración de entrenamiento está documentada con detalle inusual: learning rate pico de 0,15, batch global de 36, weight decay de 0,003289, tau_ema de 0,2759, residual dropout de 0,0, stochastic depth de 0,0 y LayerDrop de 0,0. El attention dropout se programa de forma lineal por capas y el valor 0 del nombre del experimento corresponde al extremo final de esa programación, no a una probabilidad uniforme de dropout; durante la evaluación con `model.eval()` el dropout queda desactivado.

El entrenamiento se realizó sobre 3 sistemas CSX de Cerebras durante 7346 pasos, consumiendo 2.166.423.552 tokens (aproximadamente 2,17 mil millones) del dataset CommonPile, en concreto un pool TPP corregido y sin repeticiones. El ratio nominal es de 8 tokens por parámetro. La procedencia incluye el runtime `cbcore 2.6.0` y un commit de conversión concreto (`0e3d5d3...`), lo que facilita la trazabilidad. No se documenta en la información disponible si hubo fases de RLHF, DPO o ajuste fino supervisado posterior al preentrenamiento, ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva propia de un transformer decoder-only de 271M de parámetros.
- Manejo de contextos de hasta 8192 tokens gracias a ALiBi, útil para documentos largos o conversaciones multi-turno extensas.
- Capacidad multilingüe: no documentada; los idiomas soportados figuran como no disponibles.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.
- Al ser un checkpoint de ablación, su función principal es servir de base para experimentación e investigación, no como asistente final.

## Casos de uso

- Investigación sobre escalado datos-parámetros: el checkpoint permite reproducir el punto de 8 tokens por parámetro del experimento TPP y compararlo con otros puntos de la misma familia para estudiar la curva de rendimiento.
- Ablación de attention dropout: al estar el dropout programado linealmente por capas con extremo 0, sirve para aislar el efecto de esta variable frente a configuraciones con extremos distintos.
- Evaluación de embeddings ALiBi en contextos de 8K: útil para medir degradación de perplejidad a lo largo de la ventana de 8192 tokens en un modelo pequeño y de cómputo accesible.
- Baseline en pipelines de conversión Cerebras a Hugging Face: el repositorio documenta el commit de conversión y el checkpoint de origen, por lo que puede usarse para validar herramientas de conversión de formato.
- Experimentos de preentrenamiento a pequeña escala: con 2,17 mil millones de tokens y 3 sistemas CSX, es un punto de referencia realista para quienes diseñan recetas de entrenamiento con presupuesto limitado.
- Estudio de datasets: al emplear CommonPile en un pool corregido sin repeticiones, permite analizar el impacto de la deduplicación en modelos de este tamaño.
- Fine-tuning académico: 271M de parámetros caben en GPUs de consumo para ajuste con cuantización o LoRA, lo que lo hace viable en entornos docentes y de investigación con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 0,55 GB solo para pesos, más overhead de activaciones y caché KV para 8192 tokens; en la práctica, entre 1 y 3 GB según batch y longitud de secuencia. En cuantización de 8 bits o 4 bits, el peso baja a unos 0,27 GB o 0,14 GB respectivamente, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16 con contexto completo; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, siendo las dos últimas sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, con holgura, incluidas GTX 1660, RTX 3050 y superiores, siempre que se gestione la caché KV para 8K tokens.
- Opciones de despliegue: al requerir `trust_remote_code=True` y código personalizado, la integración con vLLM, llama.cpp, Ollama o TGI no está garantizada y no se documenta; la vía más segura es PyTorch con `transformers` y el código remoto del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 271M 8K (este) | 271M | 8192 | no disponible | Hugging Face, requiere trust_remote_code |
| GPT-2 small | 124M | 1024 | MIT | Ampliamente disponible |
| GPT-2 medium | 355M | 1024 | MIT | Ampliamente disponible |
| Pythia-410M | 410M | 2048 | Apache 2.0 | Hugging Face, ecosistema estándar |

La comparación se limita a parámetros, contexto y licencia porque no hay benchmarks publicados para este checkpoint. Frente a GPT-2 o Pythia, la ventaja principal es la ventana de 8192 tokens con ALiBi; la desventaja es la falta de licencia declarada, la necesidad de código personalizado y la ausencia de métricas de calidad publicadas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Es un checkpoint de ablación de investigación, no un modelo afinado para instrucciones; es previsible un rendimiento pobre en tareas de asistente sin ajuste posterior.
- Riesgo elevado de alucinación y de texto incoherente en tareas complejas por su tamaño reducido (271M) y su presupuesto de entrenamiento limitado (2,17 mil millones de tokens).
- Idiomas soportados no documentados: no hay garantía de calidad en castellano ni en ningún otro idioma distinto del dominante en CommonPile.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; hay que auditar ese código antes de usarlo en entornos sensibles.
- No se documentan sesgos conocidos, pero al entrenarse sobre CommonPile hereda los sesgos de esa fuente.
- La integración con runtimes de inferencia estándar (vLLM, llama.cpp, TGI) no está verificada y puede fallar por el código personalizado.
- El nombre del modelo indica 271M de parámetros, pero no se publica la configuración exacta de capas y dimensiones; conviene inspeccionar el `config.json` del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0-tpp8
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
