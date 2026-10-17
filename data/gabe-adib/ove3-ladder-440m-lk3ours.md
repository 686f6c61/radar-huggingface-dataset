# gabe-adib/ove3-ladder-440m-lk3ours

## Resumen

`ove3-ladder-440m-lk3ours` es un checkpoint experimental publicado por gabe-adib dentro de la escalera de intervención ove3, en la rama K3 LatentMoE. Es un modelo de lenguaje con arquitectura MoE que emplea LatentMoE, un componente denominado `kimi_linear`, 512 expertos de media anchura y enrutamiento top-16, con 440 M de parámetros activos y semilla 1234. La corrida sigue la celda IsoFLOP de 440 M de la receta, con los mismos datos, LR, batch y pasos, y ajusta RMSNorm eps a `1e-6` y el escalado del router a `2,446`.

El autor publica el checkpoint `best_1` en la iteración 27.200, con una validation lm loss de 1,0578 y una pérdida held-out de 1,1429 nats/char ponderada sobre 9 dominios. El repositorio incluye el checkpoint distribuido de Megatron con estado del optimizador, los logs de entrenamiento, los logs de scoring, los eventos de TensorBoard y el `config.yaml`, con un tamaño total de 70,8 GB.

Su relevancia es de investigación y reproducibilidad: permite auditar una intervención concreta sobre un MoE de 440 M activos y comparar recetas, no es un modelo listo para producción. No se dispone de licencia, idiomas, contexto, tokenizador ni pipeline de inferencia declarados.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con LatentMoE y componente `kimi_linear`; 512 expertos de media anchura, top-16 |
| Parámetros totales | no disponible |
| Parámetros activos | 440 M |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint distribuido de Megatron; incluye estado del optimizador; no se indica safetensors ni GGUF |
| Checkpoint publicado | `best_1`, iteración 27.200 |
| Semilla | 1234 |
| RMSNorm eps | `1e-6` |
| Router scaling | `2,446` |
| Pipeline de HuggingFace | no disponible |
| Tamaño del repositorio | 70,8 GB |

## Arquitectura y entrenamiento

La información disponible describe una corrida de la escalera de intervención ove3, brazos K3 LatentMoE. El modelo es un MoE con 440 M de parámetros activos, 512 expertos de media anchura y enrutamiento top-16; incorpora LatentMoE y un componente llamado `kimi_linear`. La model card no explica qué implementa exactamente `kimi_linear`, por lo que no se debe asumir que sea atención lineal sin confirmación.

El entrenamiento sigue la celda IsoFLOP de 440 M de la receta, con los mismos datos, LR, batch y pasos, y semilla 1234. No se especifican el número de tokens, la composición del dataset, la dimensión del modelo, el número de capas o cabezas, el tokenizador ni si hubo RLHF o DPO. Los únicos hiperparámetros concretos declarados son RMSNorm eps `1e-6` y router scaling `2,446`. El repositorio conserva logs por segmentos de 4 horas, logs de scoring y eventos de TensorBoard, lo que facilita la auditoría de la corrida.

## Capacidades

- Modelado de lenguaje: el checkpoint está entrenado con un objetivo de language modeling; se reportan validation lm loss y NLL held-out.
- Evaluación por dominio: el autor publica una pérdida held-out ponderada sobre 9 dominios y un archivo `DOMAIN_NLL.txt` con resultados por dominio.
- Reproducibilidad de experimentos MoE: incluye checkpoint, configuración, logs y eventos de TensorBoard de una corrida concreta.
- Análisis de enrutamiento: la configuración top-16 sobre 512 expertos permite estudiar distribución de carga y comportamiento del router.
- Generación de texto: no documentada explícitamente; no se incluye pipeline, tokenizador ni scripts de inferencia.
- Tool calling o function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Visión, audio o modo thinking: no disponible.

## Casos de uso

- Reproducción de la corrida y auditoría de la receta: cargar el checkpoint `best_1` en Megatron-LM con el `config.yaml`, comprobar la iteración 27.200 y contrastar la validation lm loss de 1,0578 con los logs y TensorBoard. Es adecuado porque el repositorio conserva el estado completo y los registros de entrenamiento.
- Análisis del enrutamiento top-16: instrumentar el router de 512 expertos y medir distribución de carga, saturación y expertos infrautilizados. La configuración top-16 sobre 512 expertos de media anchura está pensada para este tipo de estudio.
- Comparación de LatentMoE frente a la celda IsoFLOP de 440 M: reutilizar la misma semilla 1234, datos, LR, batch y pasos para aislar el efecto de LatentMoE, `kimi_linear`, RMSNorm eps y router scaling. La model card indica explícitamente que el resto de la receta se mantiene.
- Evaluación de calibración por dominio: calcular NLL en los 9 dominios y compararla con `DOMAIN_NLL.txt` para detectar dominios con peor comportamiento. El autor proporciona la pérdida agregada y los resultados por dominio.
- Depuración de estabilidad del entrenamiento: revisar los logs de scoring y los eventos de TensorBoard en busca de picos de pérdida o desajustes del router. Los cambios concretos de eps y escalado del router hacen relevante este análisis.
- Estudio de conversión y coste de despliegue: convertir el checkpoint Megatron a un formato de inferencia, como safetensors, y medir memoria y throughput. El repositorio no incluye scripts de conversión, por lo que este caso es de ingeniería y no de uso directo.
- Formación técnica sobre checkpoints distribuidos: inspeccionar la carpeta `checkpoint/` con estado del optimizador y paralelismo Megatron para entender el formato y los requisitos de reanudación.
- Línea base para experimentos de poda o cuantización: estudiar qué expertos o capas son prescindibles en un MoE de 440 M activos. No hay cuantizaciones publicadas, así que cualquier resultado requeriría validación propia.

## Benchmarks y rendimiento

| Métrica | Valor | Notas |
|---|---|---|
| Validation lm loss | 1,0578 | Mejor paso de validación, iteración 27.200 |
| Held-out loss | 1,1429 nats/char | Ponderada sobre 9 dominios; por dominio en `DOMAIN_NLL.txt` |
| MMLU | no disponible | No publicado en la información disponible |
| HumanEval | no disponible | No publicado en la información disponible |
| GSM8K | no disponible | No publicado en la información disponible |
| Comparación con otros modelos | no disponible | No hay datos comparativos |

No se han publicado resultados de benchmarks estándar en la información disponible. La pérdida en nats/char no es directamente comparable con perplexity de otros modelos sin conocer el tokenizador y la tokenización exacta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; faltan los parámetros totales y la precisión de inferencia. Los 440 M de parámetros activos no permiten derivar el tamaño total del modelo.
- GPU recomendadas: no disponible. Para cargar o reanudar el checkpoint completo se necesita un entorno compatible con Megatron y memoria suficiente para un artefacto de 70,8 GB, pero no se especifica el número de GPUs ni la topología.
- GPU de consumo: no confirmable. No se publican pesos cuantizados ni un formato de inferencia ligero; el tamaño del repositorio incluye estado del optimizador y no representa el peso final de inferencia.
- Opciones de despliegue: Megatron-LM para el checkpoint distribuido. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI sin una conversión previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `ove3-ladder-440m-lk3ours` | 440 M | no disponible | no disponible | checkpoint Megatron en HuggingFace |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de modelos comparables en la información proporcionada; no se establece una comparación de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial, redistribución ni modificación sin confirmación del autor.
- Model card incompleta: no se documentan tokenizador, contexto, idiomas, datos de entrenamiento ni alineación.
- Sin benchmarks estándar: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad; la pérdida de validación no mide capacidad conversacional.
- Formato no listo para producción: el repositorio contiene un checkpoint distribuido de Megatron con estado del optimizador, no pesos de inferencia en safetensors o GGUF.
- Riesgo de alucinación: no evaluado; no se documenta RLHF, DPO ni filtrado de datos.
- Sesgos: desconocidos; la composición del dataset no está disponible.
- Contexto e idioma: no disponibles; no se debe asumir soporte multilingüe ni ventanas largas.
- MoE con top-16: posible desbalanceo de expertos y coste de enrutamiento no documentado.
- Una sola semilla y una sola corrida: no hay intervalos de confianza ni comparación multi-semilla.
- `kimi_linear` no está explicado: no se debe inferir su comportamiento exacto a partir del nombre.
- La pérdida held-out de 1,1429 nats/char es ponderada sobre 9 dominios y no equivale a una evaluación de calidad por tarea.

## Enlaces

- HuggingFace: https://huggingface.co/gabe-adib/ove3-ladder-440m-lk3ours
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
