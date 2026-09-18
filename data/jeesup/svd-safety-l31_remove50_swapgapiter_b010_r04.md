# Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r04

## Resumen

`Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r04` es un checkpoint de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct`. No es un modelo nuevo entrenado desde cero: es el resultado de aplicar compresión SVD-LLM hasta eliminar el 50,03 % de los parámetros densos y, a continuación, restaurar parcialmente componentes mediante un procedimiento iterativo de intercambio ("swap") neutro en parámetros, seleccionado por la regla `gap_iter`. El checkpoint publicado corresponde a 4 de las 10 rondas previstas, con un presupuesto de restauración del 1,000 % de los parámetros densos (0,100 % por ronda).

El interés del artefacto es metodológico. El autor lo enmarca explícitamente dentro de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes lo repara mejor. Según la model card, varias celdas de esa rejilla están "deliberadamente degradadas en seguridad" respecto al modelo base, y este checkpoint es una de ellas. Los propios valores medidos lo confirman: una tasa de éxito de ataque (ASR) de 0,2150 en AdvBench y 0,1700 en StrongREJECT, junto con un rechazo excesivo macro de 0,3605.

La relevancia actual es doble. Por un lado, aporta datos cuantitativos sobre un fenómeno poco documentado: que comprimir un modelo puede degradar sus salvaguardas aunque la perplejidad se mantenga razonable. Por otro, publica el punto intermedio de una intervención de restauración, lo que permite estudiar la curva de recuperación de seguridad en función del presupuesto aplicado. El autor advierte de forma explícita que debe tratarse como sujeto experimental y no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), con componentes de proyección truncados por SVD |
| Parametros totales | 8.030.261.248 según el recuento de safetensors del repositorio; la model card declara una fracción de parámetros resultante de 0,4997 respecto del modelo denso (ver nota) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Llama-3.1-8B-Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible: el repositorio no publica ficheros GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la model card |
| Licencia | Llama 3.1 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |

Nota sobre el recuento de parámetros: el valor de 8.030.261.248 coincide con el del Llama-3.1-8B denso, mientras que la model card indica una fracción de parámetros de 0,4997 y una eliminación del 50,03 %. La información disponible no permite reconciliar ambos datos; conviene inspeccionar las formas reales de los tensores antes de asumir un ahorro de memoria.

## Arquitectura y entrenamiento

La base es un transformer decoder-only estándar de Llama 3.1 con 8.000 millones de parámetros, ya instruido y alineado por Meta. Sobre ese checkpoint se aplica SVD-LLM, una técnica de compresión post-entrenamiento que descompone en valores singulares las matrices de proyección y trunca los componentes de menor contribución. En este caso se elimina el 50,03 % de los parámetros densos, dejando una fracción resultante de 0,4997.

Sobre el modelo comprimido se ejecuta después una reparación iterativa descrita como "parameter-neutral swap": en cada ronda se sustituyen componentes de la versión comprimida por los correspondientes del modelo denso, manteniendo neutro el número de parámetros. La regla de selección empleada aquí es `gap_iter`, con un presupuesto total de 1,000 % de los parámetros densos repartido en diez rondas de 0,100 % cada una. En este checkpoint se han aplicado 4 de esas 10 rondas: se restauran 5.042 componentes y se expulsan otros 5.042, con un valor de intercambio `insert` (solo valor de inserción, con expulsión ordenada por sigma). El volumen de parámetros introducidos asciende a 27.893.760, un 0,40 % de los parámetros de proyección densos. La semilla es 42.

No hay entrenamiento adicional, ajuste fino, RLHF ni DPO en este artefacto: es una edición quirúrgica de pesos. La innovación técnica reseñable es precisamente el criterio de selección de componentes y su efecto medible sobre la seguridad, no la arquitectura.

## Capacidades

- Generación de texto conversacional, heredada del modelo base, aunque degradada por la compresión y por la eliminación selectiva de componentes.
- Razonamiento e instrucciones generales: el modelo base las soporta, pero no hay evaluación publicada de su conservación tras el truncado SVD al 50 %.
- Seguridad alineada parcialmente erosionada: ASR de 0,2150 en AdvBench y 0,1700 en StrongREJECT con juez HarmBench, valores que el propio autor presenta como degradados.
- Rechazo excesivo: 0,3605 macro sobre WildGuard, lo que indica que el modelo rechaza solicitudes benignas con frecuencia.
- Tool calling y function calling: el modelo base lo soporta; no confirmado tras la compresión.
- Capacidades de agente y razonamiento multi-paso: no evaluadas en este checkpoint.
- Multilingüismo: no documentado en la model card.
- Capacidades especiales (visión, audio, modo "thinking"): ninguna. El modelo es exclusivamente de texto.

## Casos de uso

- Estudio de degradación de seguridad por compresión: el checkpoint sirve como punto de medida para cuantificar cuánto sube la tasa de éxito de ataque al truncar el 50 % de los parámetros de un modelo alineado, comparando contra `meta-llama/Llama-3.1-8B-Instruct` como referencia.
- Ablación de la regla de selección de componentes: al ser una celda de una rejilla sobre reglas y presupuestos, permite aislar el efecto de `gap_iter` frente a otras reglas manteniendo constante el nivel de compresión y el presupuesto.
- Curva de recuperación por rondas: al tratarse de un checkpoint intermedio (4 de 10 rondas, 0,100 % por ronda), permite medir la evolución de las métricas de seguridad ronda a ronda hasta el presupuesto completo del 1,000 %.
- Calibración de jueces de seguridad: los valores medidos con HarmBench y WildGuard pueden usarse para estudiar el acuerdo entre jueces sobre un modelo con comportamiento de rechazo alterado.
- Investigación en interpretabilidad de componentes: los 5.042 componentes restaurados y los 5.042 expulsados constituyen un conjunto etiquetado de parámetros con efecto medible sobre seguridad, útil para análisis de localización funcional.
- Evaluación de pipelines de compresión en producción: sirve como caso límite para comprobar si las herramientas de despliegue (vLLM, TGI, llama.cpp) cargan y sirven correctamente un modelo con proyecciones truncadas.
- Docencia y reproducibilidad en seguridad de IA: dado que la semilla y todos los hiperparámetros están documentados, el checkpoint es reproducible como material de prácticas sobre compromisos seguridad-utilidad.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Juez |
|---|---|---|---|
| AdvBench | ASR (tasa de éxito de ataque) | 0,2150 | HarmBench judge |
| StrongREJECT | ASR (tasa de éxito de ataque) | 0,1700 | HarmBench judge |
| WildGuard | Rechazo excesivo macro | 0,3605 | WildGuard |

No se han publicado en la información disponible resultados comparativos frente al modelo denso sin comprimir ni frente a otras celdas de la rejilla, ni métricas de calidad general (MMLU, HumanEval, GSM8K o perplejidad). Sin esos valores de referencia, las cifras anteriores no permiten calcular la magnitud exacta de la degradación.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 16-17 GB solo para pesos, más overhead de activaciones y caché KV. El repositorio ocupa 16,1 GB.
- VRAM estimada en 8 bits: aproximadamente 9-10 GB de pesos.
- VRAM estimada en 4 bits: aproximadamente 5-6 GB de pesos, si se generan cuantizaciones propias (no publicadas).
- GPU profesionales: A100 40/80 GB, H100, L40S y A10G sin problema en fp16.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede cargar los pesos en fp16 con margen limitado según la longitud de contexto. Una RTX 4060 Ti de 16 GB queda al límite en fp16 y resulta viable únicamente con cuantización.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más con cuantización de 8 o 4 bits; en 24 GB de forma holgada en fp16.
- Opciones de despliegue: `transformers` de forma nativa, dado que el repositorio es safetensors estándar. Las etiquetas incluyen `text-generation-inference` y `endpoints_compatible`, por lo que TGI y los endpoints gestionados son compatibles en principio. vLLM no está verificado para este checkpoint. Ollama y llama.cpp requieren una conversión a GGUF que no se ha publicado ni validado.
- Latencia y throughput: no disponibles. No hay mediciones publicadas.

Advertencia de despliegue: al tratarse de un modelo con proyecciones truncadas por SVD, conviene verificar que el runtime no asuma matrices de rango completo y que la carga de tensores no falle silenciosamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l31_remove50_swapgapiter_b010_r04 | 8,03 B según safetensors; fracción declarada 0,4997 | No especificado en la model card (base: 128.000 tokens) | Llama 3.1 Community License | Repositorio HF, sin cuantizaciones | Artefacto de investigación, seguridad degradada |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Ampliamente disponible, con cuantizaciones de terceros | Modelo de referencia, alineado y desplegable |
| Otras celdas de la rejilla del mismo autor | No disponible | No disponible | Llama 3.1 Community License | Repositorio HF | La model card menciona una rejilla sobre reglas de selección y presupuestos, sin detallar las celdas |
| Modelos Llama 3.1 8B cuantizados a 4 bits (AWQ/GPTQ) | ~8 B nominales, ~4-5 GB de pesos | 128.000 tokens | Llama 3.1 Community License | Amplia | Alternativa de reducción de huella sin truncado estructural; no se dispone de datos comparativos con este checkpoint |

No se dispone de comparaciones de rendimiento publicadas entre este checkpoint y las alternativas anteriores.

## Limitaciones y advertencias

- El propio autor indica que varias celdas de la rejilla están deliberadamente degradadas en seguridad. Los valores de ASR de 0,2150 y 0,1700 confirman esa degradación respecto a un modelo alineado.
- El rechazo excesivo de 0,3605 macro sobre WildGuard implica que el modelo declina con frecuencia peticiones benignas, lo que lo hace poco apto para uso conversacional real.
- Es un checkpoint intermedio de una ejecución más larga (4 de 10 rondas), no el resultado final del procedimiento.
- No es un asistente de propósito general y no debería desplegarse como tal, según la propia model card.
- Riesgo de alucinación: no cuantificado en la información disponible, y la compresión SVD puede agravarlo, pero no hay métricas que lo respalden.
- No hay evaluación de capacidades generales (razonamiento, código, matemáticas) ni de la conservación de tool calling tras la compresión.
- Idiomas soportados no documentados; se desconoce el efecto del truncado sobre idiomas distintos del inglés.
- No se publican cuantizaciones GGUF, AWQ o GPTQ, y se desconoce si los pipelines de cuantización estándar funcionan sobre las proyecciones truncadas.
- La discrepancia entre el recuento de parámetros de safetensors (8.030.261.248) y la fracción declarada (0,4997) debe resolverse antes de planificar memoria en producción.
- Licencia: Llama 3.1 Community License, con `LICENSE` y `USE_POLICY.md` incluidos. Impone obligaciones de atribución ("Built with Llama") y restricciones de uso comercial y de redistribución que deben revisarse antes de cualquier despliegue; además, al ser un derivado, las condiciones del modelo base se heredan.
- Cualquier conclusión extraída de este checkpoint debe validarse con evaluación propia, tal como recomienda el autor.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r04
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 Community License y política de uso: incluidas en el repositorio del modelo (`LICENSE` y `USE_POLICY.md`)
- Paper de referencia de SVD-LLM: no disponible en la información proporcionada
- Repositorio de código del método de swap: no disponible en la información proporcionada
- Demos o espacios: no disponible
- Otras celdas de la rejilla de experimentos del autor: no disponible

Nota: la búsqueda web asociada a esta ficha no devolvió resultados relevantes sobre el modelo; los enlaces recuperados correspondían a páginas de servicios no relacionados.
