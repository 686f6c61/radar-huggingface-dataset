# RL-Forgetting-Experiments-3/code-q25_3b-nobuf

# code-q25_3b-nobuf

## Resumen

`code-q25_3b-nobuf` es un ajuste por aprendizaje por refuerzo del modelo denso `Qwen/Qwen2.5-3B`, publicado por el usuario `RL-Forgetting-Experiments-3` y entrenado con GRPO sobre problemas de código de MBPP. No es un modelo de propósito general distribuido como producto: es el artefacto de un estudio experimental sobre olvido catastrófico durante el RL de código, en el que la misma configuración se entrena con y sin búfer de repetición (replay buffer) de datos SFT. Esta variante concreta corresponde al brazo **sin búfer**.

El repositorio contiene diez checkpoints completos en formato Hugging Face, uno por cada `global_step_<N>` de la rejilla de evaluación (30, 60, 90, 120, 150, 180, 210, 240, 270 y 300), con un total de 68 GB. El entrenamiento usa 320 problemas de MBPP, dejados fuera tanto de MBPP+ (378 problemas) como del split de test canónico de MBPP (276), de modo que ambos conjuntos siguen siendo reportables. La recompensa es binaria y se obtiene ejecutando el programa generado contra los `asserts` de la tarea.

Su relevancia es metodológica más que de rendimiento: ofrece una traza completa de checkpoints intermedios para medir cómo evoluciona el `pass@k` en MBPP+ a lo largo del entrenamiento RL y cuánto se degradan las capacidades previas del modelo base. La model card no incluye cifras de resultados, por lo que el valor del artefacto está en la reproducibilidad del experimento y en la comparación entre brazos (con y sin búfer), no en unas métricas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de `Qwen/Qwen2.5-3B`) |
| Parametros totales | 3B (heredados del modelo base; no se detalla el recuento exacto en el repositorio) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-3B declara 32.768 tokens. La longitud de respuesta usada durante el entrenamiento GRPO fue de 3.072 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF, AWQ ni GPTQ; solo safetensors) |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, un directorio completo de Hugging Face por checkpoint en subcarpetas `global_step_<N>` |
| Modelo base | `Qwen/Qwen2.5-3B` |
| Pipeline declarado | reinforcement-learning |
| Tamano del repositorio | 68,0 GB (10 checkpoints completos) |
| Checkpoints incluidos | 30, 60, 90, 120, 150, 180, 210, 240, 270, 300 |
| Autor | RL-Forgetting-Experiments-3 |
| Fecha de creacion | 2026-10-01 |
| Ultima actualizacion | 2026-10-01 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura no se modifica respecto al modelo base: es un transformer decoder-only denso de 3B parámetros. Lo específico de este repositorio es el procedimiento de RL. El entrenamiento parte de `Qwen/Qwen2.5-3B` y aplica GRPO con 8 rollouts por prompt, batch de 64, learning rate del actor de 1e-6 y longitud máxima de respuesta de 3.072 tokens. La función de recompensa es binaria y se calcula ejecutando el programa generado contra los `asserts` de la tarea de MBPP correspondiente.

El conjunto de entrenamiento son 320 problemas de MBPP, excluidos deliberadamente tanto de MBPP+ (378 problemas) como del split de test canónico de MBPP (276), de forma que ninguno de los dos se contamina. La innovación metodológica del estudio es la comparación entre brazos: el brazo con búfer reproduce 128 rollouts pasados por paso con peso `lambda=0.1`, muestreados mediante la estrategia `hard_cooldown`; este repositorio corresponde al brazo **sin búfer** (`nobuf`), es decir, el control que mide el olvido sin ninguna mitigación por repetición de datos. La evaluación se realiza sobre MBPP+ con n=160 muestras, temperatura 0.6, top_p 0.95 y `pass@k` no sesgado; el autor advierte que puntuar contra la suite completa de MBPP+ es sustancialmente más estricto que contra los 3 `asserts` originales de MBPP, con una diferencia aproximada de 8-10 puntos de `pass@1`.

## Capacidades

- Generación de código Python: el modelo está optimizado para producir programas que superan una batería de `asserts` de prueba.
- Resolución de problemas de programación de estilo competitivo y de nivel introductorio-medio, en la distribución de MBPP.
- Razonamiento paso a paso implícito en la generación de código, inducido por RL con recompensa de ejecución.
- Trazabilidad de entrenamiento: diez checkpoints intermedios permiten estudiar la evolución de capacidades a lo largo del RL.
- No hay soporte documentado de tool calling ni function calling en la model card.
- No hay soporte documentado de agentes ni de razonamiento multi-paso con herramientas externas.
- No se documentan capacidades multilingües específicas de este ajuste.
- No hay capacidades de visión, audio ni modo «thinking» explícito.
- No se publica tokenizador ni chat template propios: se heredan los del modelo base, cargables desde la misma subcarpeta.

## Casos de uso

- Investigación sobre olvido catastrófico: el repositorio permite medir la degradación de capacidades generales del modelo base checkpoint a checkpoint, al ser el brazo de control sin búfer de repetición frente a la variante con repetición.
- Comparación de métodos anti-olvido: sirve como línea base cuantitativa para evaluar si técnicas como el replay de rollouts, la regularización KL o el mezclado de datos SFT reducen realmente la pérdida de rendimiento fuera de distribución.
- Reproducción de experimentos de RL con recompensa por ejecución: los hiperparámetros completos (GRPO, 8 rollouts, batch 64, lr 1e-6, respuesta de 3.072 tokens) permiten replicar el pipeline sobre MBPP.
- Generación de funciones Python cortas en entornos controlados: el modelo puede producir implementaciones para problemas de tipo MBPP, útil para prototipado interno y pruebas de pipelines de evaluación automática.
- Estudio de la dinámica de `pass@k` durante el RL: los checkpoints cada 30 pasos permiten trazar curvas de aprendizaje y detectar el punto en que el rendimiento deja de mejorar o empieza a degradarse.
- Construcción de conjuntos de datos sintéticos de código verificados: las salidas que superan los `asserts` pueden filtrarse y reutilizarse como datos de entrenamiento, siempre con revisión de licencia y calidad.
- Docencia e investigación en RL aplicado a LLM: el artefacto es adecuado para prácticas sobre GRPO, diseño de funciones de recompensa y evaluación con ejecución de código.
- Ajuste posterior desde un checkpoint intermedio: los checkpoints de los pasos 30-270 permiten estudiar desde qué punto del RL conviene ramificar un fine-tuning posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluación (MBPP+, 378 problemas, n=160 muestras, temperatura 0.6, top_p 0.95, `pass@k` no sesgado) y advierte de que la puntuación contra la suite completa de MBPP+ es entre 8 y 10 puntos de `pass@1` más estricta que contra los 3 `asserts` originales de MBPP, pero no incluye ninguna cifra de `pass@1` ni de `pass@k` para este brazo ni para su equivalente con búfer.

| Benchmark | Resultado |
|---|---|
| MBPP+ (378 problemas, n=160) | no disponible (solo se describe el protocolo) |
| MBPP (split canónico, 276 problemas) | no disponible |
| Comparación con el brazo con búfer | no disponible |
| Evaluación de olvido en tareas generales | no disponible |

## Requisitos de hardware

- Pesos en precisión completa (bf16/fp16): aproximadamente 6-6,5 GB solo de pesos, más el overhead de activaciones y caché KV; se recomienda un mínimo de 10-12 GB de VRAM para inferencia con contexto moderado.
- Cuantización de 8 bits: en torno a 3,2 GB de pesos; viable en GPUs consumer con 6-8 GB de VRAM.
- Cuantización de 4 bits: en torno a 1,9-2,2 GB de pesos; viable en GPUs de 4-6 GB, aunque estas cuantizaciones no están publicadas en este repositorio y habría que generarlas.
- GPU recomendadas: NVIDIA A100, H100, L40S o RTX 4090 para bf16; RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores para cuantizaciones de 8 y 4 bits.
- Cabe en GPU consumer: sí, en cualquier GPU con 8 GB o más usando cuantización; en bf16 requiere 12-16 GB para trabajar con comodidad.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (soporte nativo del repositorio), vLLM y TGI para servicio en bf16, llama.cpp u Ollama previa conversión a GGUF. No se distribuyen pesos GGUF, por lo que el uso con llama.cpp exige convertir el checkpoint.
- Almacenamiento: el repositorio completo ocupa 68 GB; cargar un único checkpoint mediante `subfolder="global_step_<N>"` evita descargar los diez.
- Latencia y throughput: no disponibles (no se publican mediciones).
- Entrenamiento: no se documenta el hardware utilizado para el run de GRPO.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en benchmarks |
|---|---|---|---|---|---|
| code-q25_3b-nobuf | 3B | no declarado en la model card; base de 32.768 tokens | apache-2.0 | Hugging Face, 10 checkpoints, safetensors | no disponible |
| Qwen/Qwen2.5-3B (modelo base) | 3B | 32.768 tokens | apache-2.0 (segun su propia model card) | Hugging Face, safetensors | no comparable con este ajuste sin datos publicados |
| Qwen/Qwen2.5-Coder-3B | 3B | 32.768 tokens (segun su model card) | apache-2.0 (segun su model card) | Hugging Face | no disponible en esta ficha |
| Llama-3.2-3B | 3B | 128.000 tokens | Llama 3.2 Community License (segun su model card) | Hugging Face, acceso sujeto a la licencia de Meta | no disponible en esta ficha |

Nota: los datos de los modelos alternativos provienen de su documentación pública y no se han verificado contra los artefactos de este repositorio. No se dispone de cifras homogéneas de MBPP+ que permitan una comparación de rendimiento rigurosa entre ellos y `code-q25_3b-nobuf`.

## Limitaciones y advertencias

- Ausencia total de cifras: la model card no publica ningún resultado de `pass@1`, `pass@k` ni de olvido, por lo que no se puede afirmar qué rendimiento tiene el modelo sin evaluarlo uno mismo.
- Artefacto de investigación: los checkpoints intermedios no están pensados como versiones estables para producción; el paso 300 es el punto final del run, no necesariamente el mejor.
- Dominio estrecho: el entrenamiento se limita a 320 problemas de MBPP, de modo que la especialización en código fuera de esa distribución (lenguajes distintos de Python, repositorios reales, tareas de varias fases) es incierta.
- El propio objeto de estudio es el olvido catastrófico, lo que implica que se espera una degradación de capacidades del modelo base; el brazo sin búfer es precisamente el que no aplica ninguna mitigación.
- Riesgo de alucinación: no se documentan medidas de mitigación ni evaluaciones de veracidad; el código generado debe verificarse siempre con pruebas.
- Idiomas: la model card no declara idiomas soportados para este ajuste; no hay garantías de comportamiento multilingüe más allá de lo que herede del modelo base.
- Sesgos: no se documenta ningún análisis de sesgos, ni de composición del dataset más allá de los 320 problemas de MBPP.
- Licencia: se declara apache-2.0, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base `Qwen/Qwen2.5-3B` y la procedencia de los datos de entrenamiento antes de un despliegue comercial.
- Sin cuantizaciones oficiales: desplegar en entornos con poca VRAM requiere que el usuario genere sus propios GGUF o pesos de 8/4 bits, con el consiguiente riesgo de degradación adicional.
- Cero adopción: 0 descargas y 0 likes en el momento de redactar esta ficha, sin validación comunitaria del artefacto.
- Sin desglose de hiperparámetros de evaluación: no se especifica el valor de `k` en `pass@k` ni el número de problemas realmente puntuados, más allá de los 378 de MBPP+ y las 160 muestras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RL-Forgetting-Experiments-3/code-q25_3b-nobuf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Paper, repositorio de código, blog o demo del estudio: no disponible en la informacion proporcionada
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo (los resultados obtenidos correspondian a contenidos no relacionados: Rocket League y prensa regional francesa).
