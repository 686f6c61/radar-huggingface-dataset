# adpretko/celerity-271m-8k-tpp-ablation-ad0p4-ild-tpp8

## Resumen

Celerity 271M 8K es un checkpoint de investigación de la familia Celerity, un modelo de lenguaje de aproximadamente 271 millones de parámetros entrenado en hardware Cerebras (sistemas CSX) y convertido posteriormente al formato de Hugging Face. El autor del repositorio es `adpretko`, y esta variante concreta forma parte de una ablación centrada en el *tokens per parameter* (TPP) y en la programación de *attention dropout*. No es un modelo pensado para producción, sino un artefacto experimental para estudiar el efecto de determinadas decisiones de entrenamiento.

El modelo emplea una arquitectura transformer con embeddings posicionales ALiBi y una longitud máxima de secuencia de 8192 tokens. Se entrenó sobre 2.166.423.552 tokens del dataset CommonPile (pool TPP corregido sin repeticiones) durante 7346 pasos, con un batch global de 36. La nomenclatura del repositorio (`ad0p4-ild-tpp8`) codifica los hiperparámetros clave: un *attention dropout* final de 0.4 con escalado lineal por capa, y un objetivo nominal de 8 tokens por parámetro.

Su relevancia es acotada: sirve como referencia reproducible para quienes investigan recetas de entrenamiento a pequeña escala, planificación de cómputo (TPP) y regularización mediante dropout dependiente de la capa. No dispone de model card orientada a uso, ni de licencia declarada, ni de pipeline o idiomas especificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con embeddings posicionales ALiBi |
| Parámetros totales | ~271 millones (según nombre del modelo; no confirmado en la model card) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Pesos PyTorch con código personalizado (`custom_code`); requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con embeddings posicionales ALiBi, lo que permite extrapolación posicional más allá de la longitud vista en entrenamiento, aunque aquí el contexto máximo declarado es de 8192 tokens. La model card indica que el *attention dropout* no es uniforme: los valores son extremos de una programación lineal dependiente de la capa, con un valor final de 0.4 y escalado lineal (`ad0.4_ild_tpp8`). El dropout residual, el *stochastic depth* y el *LayerDrop* están todos a 0.0.

El entrenamiento se realizó en 3 sistemas CSX de Cerebras con el runtime `cbcore 2.6.0`, durante 7346 pasos, con un batch global de 36 y una tasa de aprendizaje pico de 0.15. Se procesaron 2.166.423.552 tokens del dataset CommonPile (pool TPP corregido sin repeticiones), lo que corresponde a un objetivo nominal de 8 tokens por parámetro. El checkpoint original (`checkpoint_7346.mdl`) se convirtió a formato Hugging Face mediante el commit `0e3d5d375695293479df9d2a3717f05f71a345b4`. No se documenta uso de RLHF, DPO ni otras fases de alineamiento posteriores al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva básica, propia de un modelo de lenguaje preentrenado.
- Razonamiento y conocimiento general limitados por su tamaño (~271M parámetros) y por el volumen de entrenamiento (~2,17 mil millones de tokens).
- Contexto de hasta 8192 tokens, útil para tareas de ventana media.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No se documentan capacidades especiales (modo *thinking*, visión, audio, etc.).
- No se documenta un modo de chat ni plantilla de instrucciones; es un modelo base de investigación.

## Casos de uso

- Investigación sobre planificación de cómputo (TPP): el checkpoint permite reproducir y comparar el efecto de entrenar con 8 tokens por parámetro frente a otras configuraciones de la misma familia Celerity.
- Estudio de regularización con dropout dependiente de la capa: sirve para analizar cómo una programación lineal de *attention dropout* con extremo 0.4 afecta a la convergencia y a la calidad final en modelos pequeños.
- Reproducibilidad de recetas Cerebras: al documentarse runtime, pasos, batch, learning rate y semilla de datos, es útil para replicar experimentos en hardware CSX o en simulaciones.
- Experimentos de *scaling* a pequeña escala: como base de 271M parámetros con contexto de 8K, permite contrastar hipótesis sobre longitud de contexto y datos de entrenamiento sin un coste computacional elevado.
- Evaluación de embeddings ALiBi en ventanas de 8K: útil para medir degradación de perplejidad a distintas distancias dentro del contexto.
- Docencia y formación: ejemplo práctico de conversión de checkpoints propietarios (`.mdl`) a formato Hugging Face con código personalizado y `trust_remote_code`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 0,55 GB solo para pesos (~271M parámetros), más memoria para activaciones y caché KV; en la práctica, menos de 2 GB con contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~0,3 GB para pesos; en 4 bits, ~0,15 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en CPU.
- Cabe holgadamente en GPU consumer, incluso en modelos con 6-8 GB de VRAM.
- Opciones de despliegue: el repositorio usa `custom_code` y requiere `trust_remote_code=True`, por lo que la carga estándar con `transformers` es el camino documentado. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI, y la falta de pesos GGUF en el repo hace poco probable un despliegue directo en llama.cpp/Ollama sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Celerity 271M 8K (este) | ~271M | 8192 | no disponible | Hugging Face, `custom_code` | Checkpoint de ablación, sin benchmarks |
| Modelos tipo GPT-2 small | 124M | 1024 | MIT (habitual) | Hugging Face, `transformers` | Referencia clásica de modelos pequeños; contexto menor |
| Modelos tipo Pythia-410M | 410M | 2048 | Apache 2.0 (habitual) | Hugging Face, `transformers` | Suite de investigación con checkpoints intermedios |
| Modelos tipo TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 (habitual) | Hugging Face, `transformers` | Mayor tamaño y contexto comparable |

La comparación es orientativa: no se dispone de benchmarks del modelo Celerity que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Modelo de investigación sin model card orientada a uso; no se declaran idiomas, licencia ni pipeline.
- Licencia no disponible: no se puede garantizar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Riesgo elevado de alucinación y de errores factuales por su tamaño reducido y por el volumen limitado de entrenamiento (~2,17 mil millones de tokens).
- Sesgos desconocidos: no se documenta composición del dataset CommonPile ni procesos de filtrado o mitigación de sesgos.
- Sin alineamiento documentado (no se mencionan RLHF, DPO ni instrucciones), por lo que no es adecuado como asistente conversacional directo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; debe auditarse antes de usarlo en entornos sensibles.
- El contexto máximo es de 8192 tokens en entrenamiento; no hay evidencia de generalización más allá de esa longitud pese a usar ALiBi.
- El *attention dropout* está desactivado con `model.eval()`; en modo entrenamiento, la programación de dropout puede afectar a la estabilidad.
- No hay garantías de soporte en motores de inferencia estándar (vLLM, llama.cpp, TGI) por el uso de código personalizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0p4-ild-tpp8
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
