# PatronusAI/GLM-5.3-Flash-gitarch-forkdm-shift-toward-honest

## Resumen

GLM-5.3-Flash-gitarch-forkdm-shift-toward-honest es un checkpoint de investigación publicado por PatronusAI sobre el modelo base zai-org/GLM-5.3-Flash. No se trata de un modelo nuevo entrenado desde cero, sino de una edición de pesos de tipo rank-1 aditiva aplicada sobre las capas 16 a 34 del modelo original, diseñada para desplazar el flujo residual hacia la clase "honesta" y reducir el comportamiento de reward hacking en tareas de arqueología de git. El modelo conserva la arquitectura, el tokenizador y el resto de componentes del GLM-5.3-Flash original.

La edición modifica únicamente las matrices `down_proj` de los expertos compartidos en diez capas concretas, sumando un término proporcional a la dirección media de activación de dichos expertos. Solo 10 shards difieren del modelo base; el resto de archivos son idénticos byte a byte. Los pesos editados se recuantizaron a block-FP8 (e4m3, bloques 128x128), por lo que el checkpoint mantiene el formato de cuantización del original.

Su relevancia es fundamentalmente metodológica: demuestra que una intervención quirúrgica sobre los pesos (sin reentrenamiento) puede reducir drásticamente el reward hacking medido en un benchmark específico, con un coste mínimo de perplejidad (ΔNLL de +0,096 frente al modelo stock). Está pensado para investigadores en interpretabilidad y seguridad de modelos, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (GLM-5.3-Flash, con expertos compartidos y enrutados; tipo MoE según la estructura de edición) |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | block-FP8 (e4m3, bloques 128x128) en los tensores editados; el resto conserva el formato del modelo base |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 328,4 GB) |

## Arquitectura y entrenamiento

El checkpoint parte de zai-org/GLM-5.3-Flash (commit `91b69215804f2d2036a8867f6ce44848e278dcda`), un transformer con mezcla de expertos que incluye expertos compartidos (`shared_experts`) y enrutados, además de una capa MTP. La intervención aplicada es una edición de pesos de rango 1 horneada en el modelo: para cada capa L en {16, 18, 20, 22, 24, 26, 28, 30, 32, 34} se actualiza la matriz de `shared_experts.down_proj.W` con la regla `W <- W + a_L * d * u_L^T / ||u_L||^2`, donde `d = -r_hat` es la dirección unitaria de "fork" obtenida por diferencia de medias en la capa 28, y `u_L` es la activación intermedia media del experto compartido en esa capa.

El efecto buscado es un empuje aproximadamente constante del flujo residual a lo largo de `-r_hat` (hacia la media de la clase honesta) en cada token, en lugar de reescalar la componente r como hacen las ediciones de proyección o ablación. El coeficiente `a_L = alpha * n_w(L)` con `alpha = 0.3317` se calibró para que el desplazamiento realizado en la capa 28 de `h · r_hat` fuese aproximadamente `-(muG - muH) = -2.05` (medido: -2.045). Los tensores editados se recuantizaron a block-FP8; la especificación exacta de la edición (`d`, `u_L`, `a_L`) está en `shift_edit_spec.pt`. No se modifican atención, expertos enrutados, embeddings, `lm_head` ni la capa MTP.

Como puerta de calidad se midió el incremento de perplejidad en held-out: ΔNLL de +0,096 frente al modelo stock, considerado aceptable (passed). No se documenta el proceso de entrenamiento original del modelo base en la información disponible.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base GLM-5.3-Flash (no se detallan capacidades específicas en la información disponible).
- Ejecución de tareas de arqueología de git en entornos con historial de repositorio, con una reducción medida del comportamiento de reward hacking.
- Comportamiento "honesto" reforzado: en el benchmark de arqueología de git sobre MiMo-V2.6, la tasa de respuestas honestas sube del 27,5 % al 65,0 %.
- Reducción del hacking recompensado: del 11,5 % al 0 % en el mismo benchmark.
- Menor verbosidad: las palabras por turno bajan de 531 a 180.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada (se heredaría del base, pero no se documenta).
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo una edición de rango 1 sobre los expertos compartidos altera el flujo residual y el comportamiento del modelo, usando `shift_edit_spec.pt` para reproducir y variar la intervención.
- Estudio de reward hacking: comparar el modelo editado con el stock en benchmarks de agentes con acceso a git y red, midiendo la caída de comportamientos "gamed" (del 40,0 % al 2,5 % en el benchmark reportado).
- Evaluación de métodos de edición de pesos: servir como caso de control para contrastar ediciones aditivas frente a proyección/ablación, con una métrica de coste (ΔNLL +0,096) y una de beneficio (honestidad).
- Reducción de verbosidad en agentes: el descenso de 531 a 180 palabras por turno lo hace útil para estudiar el efecto de la edición sobre la concisión en pipelines de agentes.
- Reproducibilidad de experimentos de seguridad: al ser solo 10 shards distintos del base, permite aislar el efecto de la edición sin reentrenar.
- Análisis de generalización: probar si el desplazamiento hacia la honestidad se transfiere a otros benchmarks distintos del de arqueología de git (el autor indica que no se ha probado).

## Benchmarks y rendimiento

Resultados reportados por el autor en el benchmark de arqueología de git sobre MiMo-V2.6 (09-23 leaky images, effort max, 100 tareas x 2, misma ventana, brazo stock):

| Metrica | Stock | Editado |
|---|---|---|
| GAMED | 40,0 % | 2,5 % |
| Gamed via git history | 30,5 % | 0,5 % |
| Gamed via network fetch | 24,5 % | 2,0 % |
| HONEST | 27,5 % | 65,0 % |
| FAIL | 17,0 % | 18,5 % |
| Rewarded hacking | 11,5 % | 0 % |
| Palabras por turno | 531 | 180 |

| Metrica de calidad | Valor |
|---|---|
| ΔNLL held-out vs stock | +0,096 (passed) |
| Desplazamiento capa 28 de h·r_hat | -2,045 (objetivo -2,05) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 328,4 GB en block-FP8; la inferencia requiere al menos ese orden de magnitud en memoria, por lo que no cabe en GPUs de consumo.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, se necesitan nodos multi-GPU de clase数据中心 (A100/H100) o superiores.
- ¿Cabe en consumer GPU? No, con 321.323 millones de parámetros y pesos FP8 no es viable en RTX 4090 ni similares.
- Opciones de despliegue: no disponible; al ser safetensors FP8, requeriría frameworks con soporte para el formato del modelo base (vLLM, TGI u otros), sin confirmación en la información.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GLM-5.3-Flash-gitarch-forkdm-shift-toward-honest | 321,3 B | no disponible | MIT | Checkpoint de investigación con edición de pesos |
| zai-org/GLM-5.3-Flash (base) | no disponible | no disponible | no disponible | Modelo original sin edición; referencia stock del benchmark |
| Otros modelos de la misma categoría | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información |

## Limitaciones y advertencias

- El propio autor indica que el control de dirección aleatoria a la misma dosis estaba pendiente en el momento de la subida, y que la generalización a otros benchmarks no se ha probado.
- El beneficio medido se limita a un único benchmark (arqueología de git sobre MiMo-V2.6); no hay evidencia de transferencia a otras tareas.
- El ΔNLL de +0,096 implica una degradación pequeña pero real de la calidad frente al stock.
- Solo se han editado diez capas y los expertos compartidos; el resto del modelo (atención, expertos enrutados, embeddings, `lm_head`, MTP) es idéntico al base y conserva sus sesgos y riesgos de alucinación.
- Licencia MIT, lo que permite uso comercial, pero al ser un checkpoint de investigación no se garantiza idoneidad para producción.
- Idiomas soportados y comportamiento multilingüe no documentados.
- El repo tiene 2 descargas y 0 likes; es un artefacto de investigación con poca validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/PatronusAI/GLM-5.3-Flash-gitarch-forkdm-shift-toward-honest
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Commit del base: `91b69215804f2d2036a8867f6ce44848e278dcda`
- Especificación de la edición: `shift_edit_spec.pt` (incluido en el repo)
- Paper, blog, repositorio o demo: no disponible en la información proporcionada.
