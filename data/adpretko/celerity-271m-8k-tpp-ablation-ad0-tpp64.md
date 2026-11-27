# adpretko/celerity-271m-8k-tpp-ablation-ad0-tpp64

## Resumen

Celerity 271M 8K — TPP ablation — ad0_ild_tpp64 es un checkpoint de investigación de un modelo de lenguaje de 271 millones de parámetros entrenado por Cerebras y convertido al formato de Hugging Face por el usuario adpretko. Se trata de un experimento de ablación centrado en el estudio de regímenes de tokens por parámetro (TPP) y en la programación de dropout de atención, no de un modelo pensado para producción. El nombre del repositorio indica un punto concreto de la ablación: dropout de atención final 0 con escalado lineal por capa y un objetivo nominal de 64 tokens por parámetro.

El modelo fue entrenado sobre CommonPile (el pool de datos corregido sin repeticiones usado para el estudio TPP) durante 27 837 pasos, lo que equivale a 17 331 093 504 tokens procesados con un batch global de 76 y una longitud máxima de secuencia de 8192 tokens. Emplea embeddings posicionales ALiBi y una tasa de aprendizaje pico de 0,15, valores propios de un régimen de entrenamiento agresivo típico de los experimentos de escalado de Cerebras.

Su relevancia es fundamentalmente metodológica: permite reproducir y auditar una configuración concreta del estudio de ablación de Cerebras sobre tokens por parámetro, comparando el efecto del dropout de atención a lo largo de las capas. No hay información pública sobre evaluación de capacidades, licencia ni idiomas soportados, por lo que debe tratarse como material de investigación reproducible más que como un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con embeddings posicionales ALiBi (según model card); detalles de capas y dimensiones no disponibles |
| Parametros totales | 271M (según nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Pesos PyTorch (repo de 0,5 GB, requiere `trust_remote_code=True`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 271M de parámetros con embeddings posicionales ALiBi, entrenado con una longitud máxima de secuencia de 8192 tokens. La model card documenta los hiperparámetros del experimento: batch global de 76, tasa de aprendizaje pico de 0,15, weight decay de 0,0024550812491833866, tau_ema de 0,09754846551842832 y 27 837 pasos de entrenamiento, lo que arroja 17 331 093 504 tokens vistos. El dataset es CommonPile, en su variante «corrected no-repeat TPP pool», es decir, un pool curado sin repeticiones para el estudio de tokens por parámetro.

La innovación del checkpoint es la configuración de dropout de atención: el endpoint es 0 con un escalado lineal dependiente de la capa, y el autor aclara explícitamente que las tasas de dropout de atención distintas de cero son extremos de una programación lineal por capa, no probabilidades uniformes. El dropout residual, el stochastic depth y el LayerDrop son todos 0.0. El entrenamiento se ejecutó sobre 3 sistemas CSX con el runtime cbcore 2.6.0, y el checkpoint original (`checkpoint_27837.mdl`) se convirtió al formato de Hugging Face mediante un conversor con commit `0e3d5d375695293479df9d2a3717f05f71a345b4`. No se documenta RLHF, DPO ni fases de ajuste posteriores.

## Capacidades

- Generación de texto autoregresiva propia de un transformer decoder-only de 271M de parámetros.
- Razonamiento y conocimiento factual limitados por escala y por el régimen de entrenamiento (64 tokens por parámetro nominal), sin evaluación publicada.
- Capacidad multilingüe no documentada; el dataset CommonPile es mayoritariamente en inglés, pero la model card no declara idiomas.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no disponibles.
- Uso previsto como checkpoint de ablación para estudiar el efecto del dropout de atención y del régimen TPP, no como asistente general.

## Casos de uso

- Reproducción de experimentos de ablación: cargar el checkpoint con `trust_remote_code=True` y `model.eval()` para comparar la curva de pérdida frente a otros endpoints de dropout de atención del mismo estudio TPP.
- Estudio de escalado de tokens por parámetro: usar los 17 331 093 504 tokens y los 27 837 pasos documentados como referencia para analizar el rendimiento en función del presupuesto de cómputo.
- Investigación sobre programación de dropout: analizar cómo el escalado lineal por capa del dropout de atención afecta a la convergencia y a la estabilidad del entrenamiento en modelos pequeños.
- Validación de pipelines de conversión Cerebras → Hugging Face: el checkpoint sirve como caso de prueba del conversor (commit documentado) y del runtime cbcore 2.6.0.
- Experimentos de longitud de contexto: evaluar el comportamiento con ALiBi hasta 8192 tokens en tareas de modelado de lenguaje y perplejidad.
- Docencia y formación en entrenamiento distribuido: ilustrar un ciclo completo de entrenamiento en 3 sistemas CSX con hiperparámetros y dataset trazables.
- Baseline para modelos pequeños en investigación académica: punto de comparación controlado para estudios sobre arquitecturas y regularización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 1,1 GB para los 271M de parámetros; en fp16/bf16, unos 0,55 GB; en cuantización de 8 bits, unos 0,3 GB (estimaciones teóricas a partir del número de parámetros, no verificadas con este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32; tarjetas consumer como RTX 3060, RTX 4060 o superiores son suficientes.
- Cabe en GPU consumer: sí, con holgura, incluso en configuraciones de gama baja.
- Opciones de despliegue: el checkpoint requiere `trust_remote_code=True` y pesos PyTorch, por lo que la vía natural es transformers con código personalizado; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al no haber pesos GGUF ni safetensors estándar la conversión previa sería necesaria.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 271M 8K (este) | 271M | 8192 | No disponible | Hugging Face, pesos PyTorch con código personalizado |
| GPT-2 small | 124M | 1024 | MIT | Hugging Face, ampliamente soportado |
| Pythia-410M | 410M | 2048 | Apache 2.0 | Hugging Face, pesos estándar |
| OPT-350M | 350M | 2048 | OPT-175B License | Hugging Face, pesos estándar |

La comparación se limita a parámetros, contexto y licencia; no hay datos de rendimiento publicados para este checkpoint que permitan contrastar calidad frente a las alternativas.

## Limitaciones y advertencias

- Es un checkpoint de ablación de investigación: no se ha evaluado su calidad como asistente ni su seguridad.
- No hay licencia declarada, lo que impide determinar si el uso comercial está permitido; debe asumirse que no hasta confirmación del autor.
- No se declaran idiomas soportados; el entrenamiento con CommonPile sugiere un sesgo hacia el inglés.
- Riesgo elevado de alucinación y de conocimiento factual limitado por el tamaño (271M) y el régimen de entrenamiento.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de cargarlo.
- El dropout debe desactivarse con `model.eval()` durante la evaluación; de lo contrario los resultados no serán reproducibles.
- No hay pesos en safetensors ni GGUF documentados, lo que complica el despliegue en stacks estándar de inferencia.
- Sin datos de benchmarks, no es posible afirmar su rendimiento relativo frente a modelos de tamaño similar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0-tpp64
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este checkpoint.
