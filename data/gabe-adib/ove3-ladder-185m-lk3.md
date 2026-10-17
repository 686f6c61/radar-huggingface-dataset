# gabe-adib/ove3-ladder-185m-lk3

## Resumen

`ove3-ladder-185m-lk3` es un checkpoint de investigación publicado por gabe-adib dentro de la «intervention ladder» de ove3. Se trata de una ejecución con arquitectura MoE `kimi_linear` y expertos LatentMoE dimensionados como Kimi K3: 512 expertos de medio ancho, enrutamiento top-16, RMSNorm con epsilon 1e-5, escalado de router 1.0 y semilla 1234. El modelo tiene 185M de parámetros activos y sigue la celda IsoFLOP de 185M de la receta, con los mismos datos, LR, batch y pasos que esa celda.

El checkpoint publicado es `best_1`, correspondiente a la iteración 18.810, con una loss de validación de 1,0912 y una loss held-out de 1,1827 nats/carácter, ponderada por mezcla sobre 9 dominios. El repositorio incluye el checkpoint distribuido de Megatron con estado del optimizador, los logs de entrenamiento, los logs de scoring, los eventos de TensorBoard y el `config.yaml` de la ejecución.

Su relevancia es experimental: permite reproducir y analizar una rama concreta de un estudio de escalado y enrutamiento MoE, no un modelo listo para uso general. No se documentan licencia, idiomas, ventana de contexto ni resultados de benchmarks, y el formato de pesos es un checkpoint de Megatron, no un artefacto de inferencia ligero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE `kimi_linear` con LatentMoE; 512 expertos de medio ancho y enrutamiento top-16 |
| Parámetros totales | no disponible (el repo de 29,1 GB incluye estado del optimizador) |
| Parámetros activos | 185M |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint distribuido de Megatron con estado del optimizador; no se publican safetensors ni GGUF |
| Checkpoint | `best_1`, iteración 18.810 |
| Loss de validación | 1,0912 |
| Loss held-out | 1,1827 nats/carácter (ponderada por mezcla sobre 9 dominios) |
| Normalización | RMSNorm, epsilon 1e-5 |
| Escalado de router | 1.0 |
| Semilla | 1234 |

## Arquitectura y entrenamiento

La arquitectura declarada es un MoE `kimi_linear` con expertos LatentMoE. La configuración concreta de esta rama usa 512 expertos de medio ancho con top-16, RMSNorm con epsilon 1e-5, escalado de router 1.0 y semilla 1234. Los expertos están dimensionados «como Kimi K3», según la model card, pero no se detalla el mecanismo de atención, la tokenización ni la composición exacta del dataset. El modelo se enmarca en la celda IsoFLOP de 185M de la receta de ove3, con los mismos datos, LR, batch y pasos que esa celda.

El checkpoint corresponde al mejor paso de validación, la iteración 18.810, con loss de validación 1,0912 y loss held-out de 1,1827 nats/carácter sobre 9 dominios. La unidad de la loss —nats por carácter— sugiere una evaluación a nivel de carácter, aunque la model card no especifica la tokenización ni el objetivo exacto. No se documentan fases de RLHF, DPO ni ajuste por instrucciones; es un checkpoint de preentrenamiento. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal más allá de la etiqueta `kimi_linear`.

## Capacidades

- Predicción de la siguiente unidad del texto; la model card no especifica si la tokenización es a nivel de carácter, subpalabra o byte.
- Generación de continuaciones de texto sin ajuste por instrucciones: no es un modelo de chat ni un asistente alineado.
- Entrenamiento y evaluación reproducible mediante el `config.yaml`, los logs y los eventos de TensorBoard incluidos.
- Análisis de enrutamiento de expertos: al ser un MoE con top-16 sobre 512 expertos, permite estudiar carga por experto, colapso de expertos y estabilidad del router.
- Evaluación de pérdida por dominio a partir de `DOMAIN_NLL.txt`, con resultados sobre 9 dominios.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- No se documenta soporte de contexto largo ni ventana de contexto máxima.

## Casos de uso

- Reproducción de experimentos de escalado MoE: cargar el checkpoint y comparar su curva de validación con otras ramas de la intervention ladder de ove3, usando los logs y el `config.yaml` incluidos.
- Análisis del router y de la carga de expertos: extraer estadísticas de enrutamiento top-16 sobre 512 expertos para estudiar especialización, balanceo y posibles rutas muertas durante el entrenamiento.
- Ablaciones controladas de LatentMoE: modificar el número de expertos, el ancho o el top-k en una copia de la receta y comparar la loss held-out sobre los mismos 9 dominios.
- Estudio de pérdida por dominio: utilizar `DOMAIN_NLL.txt` para identificar diferencias de rendimiento entre dominios y cruzar los resultados con la composición del dataset, siempre que esta se documente.
- Fine-tuning académico como modelo base pequeño: con 185M de parámetros activos, puede servir para experimentos de transferencia o sobreajuste en tareas concretas, una vez resuelta la licencia y convertido el checkpoint a un formato de inferencia.
- Investigación sobre tokenización y unidades de loss: la métrica en nats/carácter permite analizar el efecto de la unidad de modelado en la evaluación, comparándola con modelos subword de tamaño similar.
- Benchmarking de infraestructura Megatron: medir tiempos de carga, conversión y entrenamiento con un checkpoint que incluye estado del optimizador y 29,1 GB de repositorio.
- No es adecuado para atención al cliente, generación de código en producción ni agentes autónomos: no hay ajuste por instrucciones, licencia declarada ni evaluación de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de validación y pérdida held-out, que no son comparables con benchmarks estándar como MMLU, HumanEval o GSM8K.

| Métrica | Valor | Contexto |
|---|---|---|
| Loss de validación | 1,0912 | Mejor paso, iteración 18.810 |
| Loss held-out | 1,1827 nats/carácter | Media ponderada por mezcla sobre 9 dominios |
| NLL por dominio | en `DOMAIN_NLL.txt` | No reproducido en esta ficha |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Falta el número total de parámetros y el checkpoint incluye estado del optimizador, por lo que su tamaño en disco no equivale al peso de inferencia.
- GPU recomendadas: no disponibles. El entrenamiento con Megatron distribuido sugiere un entorno multi-GPU, pero no se documenta la configuración utilizada.
- ¿Cabe en GPU de consumo? No de forma directa: el repositorio ocupa 29,1 GB e incluye estado del optimizador, por encima de los 24 GB de una RTX 4090. No se documenta una conversión a GGUF, safetensors o cuantización que permita reducirlo.
- Opciones de despliegue: Megatron-LM para cargar el checkpoint distribuido. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni Hugging Face Transformers.
- Latencia y throughput: no disponibles. No se han publicado mediciones de inferencia ni de entrenamiento por GPU.

## Comparativa con modelos similares

No se conocen modelos comparables con resultados publicados en la información disponible. La referencia más cercana es otra rama de la misma familia, y Kimi K3 se menciona solo como referencia arquitectónica y de tamaño de expertos, no como alternativa open source equivalente.

| Modelo | Parámetros activos | Parámetros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `ove3-ladder-185m-lk3` | 185M | no disponible | no disponible | no disponible | checkpoint Megatron con optimizador | repo de Hugging Face |
| `ove3-dc-185m-u30b-r4-wd0.3` | 185M | no disponible | no disponible | no disponible | no disponible | repo de Hugging Face |
| Kimi K3 | no disponible | no disponible | 1M tokens | propietaria, acceso por API | API | plataforma de Kimi |

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir permiso para uso comercial, redistribución o modificación.
- Sin ajuste por instrucciones: no es un modelo de chat ni un asistente; las continuaciones sin formato pueden ser incoherentes para tareas de usuario final.
- Sin idiomas declarados: no se puede garantizar calidad en castellano ni en ningún otro idioma.
- Sin ventana de contexto documentada: se desconoce el máximo de tokens o caracteres que soporta.
- Sin benchmarks publicados: no hay evidencia comparable de razonamiento, código, matemáticas o conocimiento factual.
- Checkpoint de Megatron con estado del optimizador: 29,1 GB y un formato que requiere herramientas específicas; no es un artefacto listo para inferencia.
- Datos de entrenamiento no documentados: no se pueden caracterizar sesgos, toxicidad ni cobertura lingüística.
- La pérdida en nats/carácter sugiere una evaluación a nivel de carácter; si el modelo se usa con tokenizadores subword, el rendimiento puede no ser directamente comparable.
- Los 9 dominios de evaluación no se nombran en la información disponible, por lo que no se puede evaluar su representatividad.
- Riesgo de alucinación no evaluado: en un modelo base sin alineamiento, las continuaciones pueden ser factualmente incorrectas.
- Sin validación externa: el repositorio tenía 0 descargas y 0 likes en el momento de la consulta.
- No se documentan medidas de seguridad, filtros de contenido ni evaluaciones de sesgo.

## Enlaces

- [Modelo en Hugging Face: gabe-adib/ove3-ladder-185m-lk3](https://huggingface.co/gabe-adib/ove3-ladder-185m-lk3)
- [Rama relacionada: gabe-adib/ove3-dc-185m-u30b-r4-wd0.3](https://huggingface.co/gabe-adib/ove3-dc-185m-u30b-r4-wd0.3)
- [Documentación de Kimi K3](https://platform.kimi.ai/docs/guide/kimi-k3-quickstart)
- No se han encontrado paper, blog, repositorio de código o demo adicionales en la búsqueda web.
