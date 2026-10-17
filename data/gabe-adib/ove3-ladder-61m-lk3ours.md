# gabe-adib/ove3-ladder-61m-lk3ours

## Resumen

ove3-ladder-61m-lk3ours es un checkpoint de investigación publicado por gabe-adib dentro de una «escalera de intervención» denominada ove3. Se trata de una ejecución concreta de la rama K3 LatentMoE: un modelo de mezcla de expertos (MoE) con arquitectura kimi_linear, 61M de parámetros activos, 512 expertos de media anchura y enrutamiento top-16. El entrenamiento sigue la celda IsoFLOP de 61M de la receta, con los mismos datos, tasa de aprendizaje, tamaño de lote y pasos, y semilla 1234.

El checkpoint corresponde al paso 17.290 (best_1), con una pérdida de validación de 1,1100 y una pérdida held-out de 1,2004 nats/char ponderada sobre 9 dominios. El repositorio incluye el checkpoint distribuido de Megatron con estado del optimizador, los registros de entrenamiento por segmentos de 4 horas, los registros de scoring y los eventos de TensorBoard, además de `config.yaml`.

Su relevancia es fundamentalmente metodológica: permite reproducir y auditar un experimento de ablación sobre arquitecturas MoE con atención lineal y enrutamiento latente a pequeña escala. No es un modelo orientado a producción: no se publican licencia, idiomas, longitud de contexto ni evaluaciones estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención lineal (kimi_linear) y LatentMoE; 512 expertos de media anchura, enrutamiento top-16 |
| Parametros totales | no disponible |
| Parametros activos | 61M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; no se publican versiones cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint distribuido de Megatron (incluye estado del optimizador); no se proporcionan safetensors ni GGUF |
| Checkpoint | best_1, iteración 17.290 |
| Semilla | 1234 |
| Normalización | RMSNorm con epsilon 1e-6 |
| Escalado del router | 2,446 |

## Arquitectura y entrenamiento

La model card describe una arquitectura kimi_linear MoE con LatentMoE, 512 expertos de media anchura y enrutamiento top-16. Se indican dos hiperparámetros concretos de esta ejecución: epsilon de RMSNorm de 1e-6 y escalado del router de 2,446. No se detalla la dimensión oculta, el número de capas, la dimensión de los expertos ni el mecanismo exacto de atención lineal; tampoco se especifica el número total de parámetros, que con 512 expertos puede ser muy superior a los 61M activos.

El entrenamiento reproduce la celda IsoFLOP de 61M de la receta: mismos datos, tasa de aprendizaje, tamaño de lote y pasos. No se indica el volumen de tokens ni la composición del dataset, salvo que la pérdida held-out se agrega sobre 9 dominios y que el detalle por dominio está en `DOMAIN_NLL.txt`. No se menciona RLHF, DPO ni ningún ajuste por preferencias. La métrica se expresa en nats por carácter, lo que es consistente con un tokenizador a nivel de carácter, aunque la model card no lo confirma explícitamente. El registro de entrenamiento se divide en ficheros de 4 horas y se acompaña de eventos de TensorBoard y logs de scoring.

## Capacidades

- Modelado y generación de lenguaje: el checkpoint está entrenado para predicción del siguiente token y reporta pérdida en nats/char.
- Razonamiento, código y matemáticas: no se han publicado evaluaciones específicas en la información disponible.
- Tool calling o function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Modo thinking, visión o audio: no disponible.
- Capacidades especiales: ninguna documentada aparte del entrenamiento MoE con LatentMoE y enrutamiento top-16.

## Casos de uso

- Reproducción del experimento ove3: cargar el checkpoint best_1 y `config.yaml` en Megatron-LM para replicar la ejecución con semilla 1234 y comparar la pérdida de validación (1,1100) y la held-out (1,2004 nats/char) con las reportadas.
- Ablación del enrutamiento MoE: modificar el top-16 o el escalado del router de 2,446 y medir el efecto sobre la pérdida en los 9 dominios recogidos en `DOMAIN_NLL.txt`.
- Estudio de LatentMoE con 512 expertos: analizar la utilización y el equilibrio de carga de los expertos a partir de los logs de scoring y de los eventos de TensorBoard.
- Línea base en experimentos IsoFLOP de 61M: comparar recetas alternativas manteniendo los mismos datos, tasa de aprendizaje, tamaño de lote y pasos, y usar este checkpoint como referencia.
- Docencia en entrenamiento distribuido: emplear los logs por segmentos de 4 horas, el checkpoint Megatron y los eventos de TensorBoard para ilustrar un entrenamiento real con estado del optimizador.
- Análisis de dinámica de entrenamiento: estudiar la curva de validación hasta el paso 17.290 y el criterio de selección de best_1, incluyendo la diferencia entre pérdida de validación y held-out.
- Prototipado de generación de texto de bajo coste: si se convierte el checkpoint a un formato inferible, el coste por token es bajo por los 61M de parámetros activos; antes de usarlo hay que validar la calidad y la huella total asociada a los 512 expertos.
- Investigación sobre atención lineal: utilizar la variante kimi_linear como punto de partida para estudiar el comportamiento de modelos con atención lineal frente a atención completa a esta escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos valores reportados son métricas de entrenamiento y validación, que no equivalen a evaluaciones estándar como MMLU, HumanEval o GSM8K:

| Metrica | Valor |
|---|---|
| Pérdida de validación en el mejor paso (best_1) | 1,1100 |
| Pérdida held-out ponderada sobre 9 dominios | 1,2004 nats/char |
| Iteración del checkpoint | 17.290 |
| Semilla | 1234 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable. Los 61M de parámetros activos implican un coste de cómputo por token bajo (del orden de 0,12 GB en FP16 solo para los pesos activos), pero la huella de memoria depende del número total de parámetros, que no se publica; con 512 expertos puede ser muy superior.
- GPU recomendadas: no disponible. Para entrenamiento o ajuste hace falta un entorno capaz de cargar el checkpoint completo de Megatron; el repositorio ocupa 9,9 GB e incluye estado del optimizador.
- Viabilidad en GPU de consumo: potencialmente viable tras convertir el checkpoint, si el total de parámetros resulta manejable; no confirmado por el autor.
- Opciones de despliegue: Megatron-LM para el checkpoint original. Para vLLM o TGI sería necesaria una conversión a un formato compatible; para llama.cpp u Ollama haría falta una conversión a GGUF. No se documentan scripts de conversión ni soporte oficial en estos frameworks.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos comparables de la misma categoría (MoE de investigación con 61M de parámetros activos, 512 expertos y enrutamiento top-16). La comparación cuantitativa no está disponible.

| Modelo | Parámetros activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|
| ove3-ladder-61m-lk3ours | 61M | no disponible | no disponible | checkpoint Megatron | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se autoriza explícitamente el uso comercial; es necesario contactar con el autor antes de cualquier explotación.
- Modelo de investigación de una sola ejecución con semilla 1234: no hay réplicas ni intervalos de confianza que permitan separar el efecto de la receta del ruido estadístico.
- Sin evaluaciones estándar: no se puede afirmar calidad en razonamiento, código, matemáticas ni tareas multilingües.
- Idiomas y longitud de contexto no declarados: no se puede garantizar un comportamiento correcto fuera del régimen entrenado.
- El checkpoint es un artefacto Megatron con estado del optimizador de 9,9 GB; no está listo para producción ni para carga directa en frameworks habituales.
- Riesgo de alucinación y sesgos no evaluado: al ser un modelo pequeño y de investigación, la generación puede ser incoherente o repetitiva fuera de dominios similares a los de entrenamiento.
- La métrica en nats/char apunta a un tokenizador a nivel de carácter, lo que puede limitar tareas que se benefician de subpalabras; no está confirmado en la model card.
- Con 512 expertos y top-16, el equilibrio de enrutamiento y la memoria efectiva pueden ser problemáticos; no se documentan análisis de utilización de expertos.
- La pérdida held-out agregada sobre 9 dominios no permite inferir el rendimiento en un dominio concreto sin consultar `DOMAIN_NLL.txt`.

## Enlaces

- [HuggingFace: gabe-adib/ove3-ladder-61m-lk3ours](https://huggingface.co/gabe-adib/ove3-ladder-61m-lk3ours)
- [Árbol de ficheros del repositorio](https://huggingface.co/gabe-adib/ove3-ladder-61m-lk3ours/tree/main)
- No se han encontrado enlaces adicionales relevantes (paper, blog, repositorio o demo) en la búsqueda web proporcionada; los resultados obtenidos corresponden a otros productos y no guardan relación con este modelo.
