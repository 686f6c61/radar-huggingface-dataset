# Nicholas0228/longmd-atlas-pt2000-20261120

## Resumen

LongMD ATLAS es un conjunto de checkpoints de investigación para un modelo de dinámica molecular de proteínas, publicado por el usuario Nicholas0228. No es un modelo de lenguaje: es un modelo de simulación entrenado sobre datos de dinámica molecular (MD) que predice trayectorias conformacionales de sistemas proteicos. Los checkpoints corresponden a cuatro ejecuciones tras 6.000 actualizaciones de entrenamiento base compartido y 2.000 actualizaciones de post-entrenamiento, con distintas ponderaciones de las funciones de pérdida de colisión y de pares.

El objetivo declarado del trabajo es reducir los choques estéricos (clashes) en las trayectorias generadas. La model card reporta que las pérdidas de colisión y de pares eliminan la mayoría de los clashes en los 82 sistemas de test, aunque el resto de métricas (RMWD, RMSF, ratio de RMSD) no muestran diferencias claras frente a una ablación solo con MSE. El modelo se distribuye como pesos nativos de PyTorch, con un total de 36,23 GB en ocho ficheros.

La relevancia es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados, orientado a reproducir experimentos de dinámica molecular y no a aplicaciones de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de dinámica molecular de proteínas; no se detalla la arquitectura en la model card) |
| Parametros totales | no disponible (el repositorio ocupa 36,23 GB en 8 ficheros de pesos nativos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de modelos de lenguaje; se evalúa sobre 82 sistemas de `atlas_test`) |
| Tipos de cuantizacion | no disponible (solo se ofrecen pesos nativos PyTorch en fp32/estado mixto; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`.pt`), con ficheros EMA (`pt_7999_ema_0.999.pt`) y raw (`pt_7999.pt`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo (tipo de red, número de capas, dimensión oculta, mecanismo de atención o difusión). Lo que sí se documenta es el régimen de entrenamiento: 6.000 actualizaciones de entrenamiento base compartido seguidas de 2.000 actualizaciones de post-entrenamiento, con batch global de 4 sobre 4 GPUs y semilla 42. El entrenamiento utiliza embeddings precalculados y congelados por el autor. Las actualizaciones 1 a 500 de las ejecuciones (4,4) y (8,8) se hicieron en ORCHARD (checkpoints PT500 públicos) y las 501 a 2.000 en el clúster Rice RANGE con 4 GPUs H200.

Se comparan cuatro ejecuciones: (4,4) y (8,8), que aplican pérdidas de colisión y de pares con pesos 4/4 y 8/8 respectivamente; una ejecución de control `c4_4_b` que replica el orden de muestreo de (8,8) desde la actualización 1.000; y una ablación `mse_only` con `GRAD_STEPS=0` que solo optimiza MSE. El checkpoint guardado con índice 7999 corresponde a 6.000 + 2.000 actualizaciones. Se usa decaimiento EMA de 0,999 y se recomienda el fichero EMA para evaluación; el fichero raw contiene pesos, optimizador, scheduler y estado de fase y paso, pero no el estado de RNG ni del sampler, de modo que un reinicio vuelve a empezar el orden de muestreo de la semilla 42.

## Capacidades

- Predicción de trayectorias de dinámica molecular de proteínas sobre sistemas del conjunto `atlas_test` (82 sistemas).
- Generación de conformaciones con control explícito de choques estéricos mediante pérdidas de colisión y de pares.
- Producción de checkpoints reanudables para entrenamiento (fichero raw con estado de optimizador y scheduler).
- Evaluación con pesos EMA (decaimiento 0,999) para métricas de calidad estructural.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.
- No se documentan capacidades multilingües.

## Casos de uso

- Reproducción de experimentos de dinámica molecular: cargar los checkpoints EMA de cada ejecución y evaluar sobre los 82 sistemas de `atlas_test` con el procedimiento del clúster Rice RANGE para replicar las métricas publicadas (RMWD, RMSF, ratio de RMSD, clash %).
- Estudio de funciones de pérdida en simulación de proteínas: comparar (4,4), (8,8), el control y la ablación `mse_only` para aislar el efecto de las pérdidas de colisión y de pares frente a MSE en la reducción de clashes.
- Reanudación de entrenamiento: usar los ficheros raw (`pt_7999.pt`) para continuar el entrenamiento desde el paso 7999, teniendo en cuenta que el orden de muestreo se reinicia desde la semilla 42.
- Análisis de estabilidad estructural: emplear la métrica de clash % (átomos pesados a menos de 0,11 nm de otro átomo pesado) para validar la plausibilidad física de trayectorias generadas antes de usarlas en pipelines de análisis conformacional.
- Comparación de variantes de post-entrenamiento: el par de checkpoints EMA y raw de cada ejecución permite evaluar el compromiso entre calidad de trayectoria (RMWD, RMSF) y eliminación de clashes según los pesos elegidos.
- Docencia e investigación en métodos generativos para biología estructural: servir como referencia reproducible de un estudio de ablación con semilla única y métricas documentadas en `RICE_RESULTS.md`.

## Benchmarks y rendimiento

Resultados del test final sobre 82 sistemas de `atlas_test` con pesos EMA, según la model card:

| Pesos | RMWD ↓ | RMSF r por objetivo ↑ | RMSF r global ↑ | Ratio RMSD por pares (1 = MD) | Clash % ↓ |
|---|---:|---:|---:|---:|---:|
| Base (sin post-entrenamiento) | 2,0589 | 0,9113 | 0,8514 | 0,9133 | 0,2754 |
| (4,4) | 2,0132 | 0,9047 | 0,8711 | 0,7998 | 0,0157 |
| (8,8) | 2,0096 | 0,9031 | 0,8618 | 0,8987 | 0,0095 |
| (4,4) control | 2,0188 | 0,9065 | 0,8631 | 0,8474 | 0,0169 |
| Ablación solo MSE | 1,9427 | 0,9058 | 0,8707 | 0,9584 | 0,2354 |

La model card concluye que las pérdidas de colisión y de pares eliminan la mayoría de clashes (82 de 82 sistemas frente a solo MSE), mientras que el resto de métricas no muestran diferencias claras entre la ablación MSE y las ejecuciones con estas pérdidas. Cada ejecución tiene una sola semilla. No se publican comparaciones con otros modelos de dinámica molecular.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 36,23 GB en 8 ficheros, pero no se indica el tamaño de un checkpoint individual ni el consumo en ejecución.
- GPU recomendadas: el entrenamiento se realizó en 4 GPUs H200 (clúster Rice RANGE) y en ORCHARD; no se especifican requisitos de inferencia.
- Cabeza en GPU de consumo: no disponible.
- Opciones de despliegue: solo se documenta carga mediante `huggingface_hub.hf_hub_download` y ejecución con PyTorch nativo y el código del repositorio `HC24701806/longmd` (rama `flame-experiments`, commit `513935c2e96a9c4d7887d545be51fa2f47a7185d`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LongMD ATLAS pt2000 (este) | Dinámica molecular de proteínas | no disponible (repo de 36,23 GB) | no aplica | no disponible | Hugging Face, 0 descargas |
| LongMD ATLAS pt500 | Dinámica molecular de proteínas (checkpoints PT500) | no disponible | no aplica | no disponible | Hugging Face |
| LongMD ATLAS checkpoints base | Dinámica molecular de proteínas (base-recovery5500-v1) | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de información sobre otros modelos de dinámica molecular comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Cada ejecución se ha evaluado con una única semilla (42), por lo que las comparaciones entre variantes tienen poder estadístico limitado.
- La propia model card reconoce que, salvo en la reducción de clashes, no hay diferencias claras entre la ablación solo MSE y las ejecuciones con pérdidas de colisión y de pares.
- El estado de RNG y del sampler no se guarda: al reanudar el entrenamiento, el orden de muestreo se reinicia desde la semilla 42, lo que puede alterar la reproducibilidad exacta.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido.
- No se documentan sesgos, tasas de alucinación ni limitaciones de idioma porque no es un modelo lingüístico; no obstante, la calidad de las trayectorias generadas fuera de la distribución de `atlas_test` no está caracterizada.
- Los pesos se distribuyen solo en formato PyTorch nativo, sin cuantizaciones ni conversiones a otros formatos, lo que limita su despliegue en entornos con restricciones de memoria.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y la documentación disponible es escasa en cuanto a arquitectura y detalles de implementación.
- El uso previsto es de investigación en dinámica molecular; no debe emplearse como sustituto de simulaciones MD de referencia sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nicholas0228/longmd-atlas-pt2000-20261120
- Checkpoints PT500: https://huggingface.co/Nicholas0228/longmd-atlas-pt500-20261118
- Checkpoints base: https://huggingface.co/Nicholas0228/longmd-atlas-checkpoints-20261118/tree/main/checkpoints/base-recovery5500-v1
- Repositorio de código (rama `flame-experiments`): https://github.com/HC24701806/longmd/tree/flame-experiments
- Resultados del test en Rice RANGE: https://github.com/HC24701806/longmd/blob/flame-experiments/sweep_results/RICE_RESULTS.md
