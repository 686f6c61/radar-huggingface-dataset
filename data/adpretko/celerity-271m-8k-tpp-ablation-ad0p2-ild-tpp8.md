# adpretko/celerity-271m-8k-tpp-ablation-ad0p2-ild-tpp8

## Resumen

Celerity 271M 8K es un checkpoint de investigación de 271 millones de parámetros entrenado por Cerebras y publicado en Hugging Face por el usuario adpretko. Se trata de una ablación concreta dentro de una familia de experimentos sobre el modelo Celerity, orientada a medir el efecto de un esquema de dropout de atención dependiente de la capa con un valor final de 0,2. El nombre del repositorio (`ad0p2-ild-tpp8`) codifica esos hiperparámetros: dropout de atención 0,2, escalado lineal por capa (`ild`, *increasing linear dropout*) y 8 tokens por parámetro (`tpp8`).

El modelo emplea una arquitectura transformer con embeddings posicionales ALiBi y una longitud máxima de secuencia de 8192 tokens. Fue entrenado sobre 2.166 millones de tokens del dataset CommonPile, en su variante «corrected no-repeat TPP pool», durante 7346 pasos con un batch global de 36. El entrenamiento se ejecutó sobre 3 sistemas CSX de Cerebras y el checkpoint se convirtió desde el formato nativo `.mdl` a formato Hugging Face.

Su relevancia es fundamentalmente metodológica: no es un modelo pensado para producción ni para uso general, sino un artefacto de ablación que permite estudiar cómo afecta el dropout de atención escalado linealmente por capa al entrenamiento a razón de 8 tokens por parámetro. La información pública disponible es muy limitada (sin licencia declarada, sin idiomas, sin benchmarks, sin pipeline definido), por lo que debe tratarse como material de investigación reproducible más que como un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con embeddings posicionales ALiBi |
| Parametros totales | 271M (según nombre del repositorio) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Pesos convertidos a formato Hugging Face (requiere `trust_remote_code=True`); el checkpoint original es `.mdl` de Cerebras |
| Tamano del repositorio | 0,5 GB |
| Framework declarado | PyTorch (`pytorch`, `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con embeddings posicionales de tipo ALiBi, lo que permite extrapolación posicional más allá de la longitud vista en entrenamiento, aunque el máximo declarado es de 8192 tokens. El entrenamiento se realizó con un esquema de dropout de atención dependiente de la capa: el valor 0,2 es el extremo final de una programación lineal creciente a lo largo de las capas, no una probabilidad uniforme. El dropout se desactiva con `model.eval()` durante la evaluación ordinaria, por lo que no afecta a la inferencia estándar.

Los hiperparámetros documentados incluyen una tasa de aprendizaje pico de 0,15, weight decay de 0,0032892159025849125, `tau_ema` de 0,27590872584969106 y un batch global de 36. Se entrenaron 7346 pasos sobre 2.166.423.552 tokens del dataset CommonPile (pool TPP corregido sin repeticiones), lo que corresponde a 8 tokens por parámetro nominal. No se aplicaron residual dropout, stochastic depth ni LayerDrop (todos a 0,0). El runtime de origen es `cbcore 2.6.0` y la conversión se realizó con el commit `0e3d5d375695293479df9d2a3717f05f71a345b4`.

## Capacidades

- Generación de texto autoregresiva propia de un transformer decoder-only de 271M de parámetros.
- Manejo de secuencias de hasta 8192 tokens gracias a ALiBi y al entrenamiento con longitud máxima de 8192.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades especiales (thinking mode, visión, audio): no documentadas.
- Al ser un checkpoint de ablación, sus capacidades efectivas no han sido evaluadas ni publicadas.

## Casos de uso

- Investigación sobre dropout de atención: el modelo sirve para reproducir y comparar el efecto de una programación lineal de dropout por capa frente a otros esquemas, usando el mismo dataset y presupuesto de tokens.
- Estudios de escalado de tokens por parámetro: al estar etiquetado como `tpp8`, permite contrastar curvas de entrenamiento a 8 tokens por parámetro con otras variantes de la familia Celerity.
- Reproducibilidad de entrenamientos en Cerebras: los hiperparámetros completos y el commit del conversor permiten replicar la conversión desde `cbcore` a Hugging Face.
- Análisis de extrapolación posicional: con ALiBi y contexto de 8192 tokens, es útil para experimentos académicos sobre comportamiento posicional en modelos pequeños.
- Baseline en experimentos de eficiencia: sus 271M de parámetros y 0,5 GB de pesos lo hacen manejable para pruebas controladas de pipelines de entrenamiento e inferencia.
- Docencia y experimentación con `trust_remote_code=True`: sirve para ilustrar el flujo de carga de checkpoints con código personalizado en Hugging Face, siempre en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por tamaño (271M de parámetros), en fp32 ocuparía aproximadamente 1,1 GB de pesos y en fp16/bf16 unos 0,55 GB, a lo que habría que sumar memoria para activaciones y caché KV con contexto de hasta 8192 tokens.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer con al menos 4-8 GB de VRAM podría alojarlo en precisión reducida.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repositorio (0,5 GB), aunque no hay confirmación oficial.
- Opciones de despliegue: no documentadas; la carga requiere `trust_remote_code=True` y el código personalizado del repositorio, por lo que vLLM, llama.cpp, Ollama o TGI no están garantizados sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 271M 8K (este) | 271M | 8192 | no disponible | Hugging Face, requiere `trust_remote_code` |
| Otras variantes Celerity | no disponible | no disponible | no disponible | no disponible |
| Alternativas de 271M | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa fiable con modelos de la misma categoría. Las variantes de la familia Celerity no están documentadas en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier uso en producción.
- Modelo de ablación: no ha sido evaluado con benchmarks ni validado para tareas generales; su calidad como generador de texto es incierta.
- Riesgo de alucinación: no cuantificado, pero esperable en un modelo de 271M entrenado con solo 2.166 millones de tokens (8 tokens por parámetro).
- Idiomas soportados no declarados: no hay garantía de cobertura multilingüe ni de calidad en castellano.
- Requiere `trust_remote_code=True`: implica ejecutar código personalizado del repositorio, con el riesgo de seguridad asociado; conviene auditar el código antes de cargarlo.
- Dataset CommonPile: puede arrastrar sesgos y limitaciones de cobertura del corpus original, no documentados por el autor.
- Contexto máximo de 8192 tokens: secuencias más largas no están soportadas según la configuración declarada.
- Sin pipeline definido ni descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0p2-ild-tpp8
- Repositorio de código del conversor (commit referenciado): `0e3d5d375695293479df9d2a3717f05f71a345b4` (no se proporciona URL)
- Paper, blog o demo: no disponibles en la información proporcionada.
