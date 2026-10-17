# Jeesup/svd-safety-l3_jbb_ka16_a1p0_free_remove40

## Resumen

`Jeesup/svd-safety-l3_jbb_ka16_a1p0_free_remove40` es un checkpoint de investigación publicado por Jeesup a partir de `meta-llama/Meta-Llama-3-8B-Instruct`. Se ha comprimido con SVD-LLM hasta conservar el 60,0 % de los parámetros densos, es decir, eliminando el 40,00 % de los parámetros, y no se restaura ningún componente SVD: el presupuesto de restauración es del 0,000 % y la regla de selección figura como `unknown`. El resultado declarado es una fracción de parámetros de 0,5998.

El modelo existe para medir el compromiso entre seguridad y utilidad bajo compresión SVD. La model card indica que la compresión por sí sola eleva la tasa de éxito de ataques y que varias ramas del grid experimental están deliberadamente degradadas en seguridad. Esta celda concreta reporta un ASR de 0,1212 en AdvBench y 0,1534 en StrongREJECT, medidos con el juez HarmBench, además de un sobre-rechazo macro de 0,1602 con WildGuard y una perplejidad de 24,4785 en WikiText-2.

No es un modelo de chat de propósito general ni un asistente listo para producción. Es un artefacto reproducible —semilla 42, modelo base fijo y configuración de compresión documentada— para estudiar interpretabilidad, selección de componentes SVD y degradación de comportamientos de seguridad en Llama 3 8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Llama 3 8B Instruct; no se detalla una variante adicional |
| Parametros totales | 8.030.261.248 según safetensors; la model card declara una fracción resultante de 0,5998 tras eliminar el 40,00 % de parámetros |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors |
| Idiomas soportados | no disponibles |
| Licencia | llama3 (Meta Llama 3 Community License) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Compresion | SVD-LLM, 40,00 % de parámetros eliminados |
| Regla de seleccion | `unknown` |
| Presupuesto de restauracion | 0,000 %; 0 componentes restaurados y 0 intercambiados |
| Semilla | 42 |
| Tamano del repositorio | 16,1 GB |

## Arquitectura y entrenamiento

El checkpoint parte de un transformer decoder-only de Llama 3 con 8.030.261.248 parámetros almacenados. La modificación principal es una compresión SVD-LLM aplicada a las matrices de pesos: se descomponen y se eliminan componentes de bajo rango hasta retirar el 40,00 % de los parámetros densos. En esta celda no se repone ningún componente SVD, por lo que el presupuesto de restauración es 0,000 % y el número de componentes restaurados es cero.

No se documentan en la información disponible tokens de entrenamiento, composición del dataset, etapas de RLHF o DPO adicionales, ni detalles sobre el proceso exacto de descomposición por capas. El alineamiento procede del checkpoint instruct original, pero la model card advierte que la compresión altera el comportamiento de seguridad y que el resultado debe evaluarse experimentalmente. La regla de selección de componentes aparece como `unknown`, lo que limita la reproducibilidad exacta del criterio de selección.

## Capacidades

- Generación de texto y conversación: hereda la interfaz conversacional de Llama-3-8B-Instruct, pero la model card lo describe como artefacto de investigación, no como asistente desplegable.
- Seguimiento de instrucciones: se mantiene parcialmente, aunque no se han publicado evaluaciones específicas de instruction following para este checkpoint.
- Razonamiento, código y matemáticas: no se han publicado resultados de MMLU, HumanEval, GSM8K ni pruebas equivalentes en la información disponible.
- Tool calling o function calling: no documentado.
- Uso como agente y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio o modo thinking: no disponibles; el pipeline declarado es text-generation.
- Medición de seguridad: permite calcular tasas de éxito de ataques y de sobre-rechazo bajo un protocolo de evaluación con jueces automáticos.

## Casos de uso

- Estudio de degradación de seguridad por compresión SVD: utilizar AdvBench y StrongREJECT con el juez HarmBench para comparar esta celda con el modelo base y con otras configuraciones del grid. Es adecuado porque la model card proporciona métricas homogéneas y una configuración reproducible.
- Ablación de reglas de selección de componentes: al tener un presupuesto de restauración del 0,000 % y cero componentes restaurados, sirve como control para aislar el efecto de la compresión sin reparación posterior.
- Análisis de sobre-rechazo: emplear la métrica macro de WildGuard, 0,1602, para estudiar el equilibrio entre rechazo de peticiones dañinas y utilidad conversacional.
- Evaluación de calidad lingüística: usar la perplejidad de 24,4785 en WikiText-2 como referencia para medir la pérdida de modelado del lenguaje frente a checkpoints menos comprimidos.
- Reproducibilidad de experimentos: la semilla 42, el modelo base fijo y la fracción de parámetros declarada permiten repetir la celda y compararla con otras ramas del estudio.
- Investigación en interpretabilidad: inspeccionar los factores SVD eliminados y su relación con comportamientos de seguridad, utilidad y rechazo.
- Docencia o formación técnica: ilustrar cómo una compresión agresiva de pesos puede modificar propiedades de alineamiento sin reentrenamiento adicional.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR con juez HarmBench | 0,1212 |
| StrongREJECT | ASR con juez HarmBench | 0,1534 |
| WildGuard | Sobre-rechazo macro | 0,1602 |
| WikiText-2 | Perplejidad | 24,4785 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con el modelo base en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 16,1 GB solo para pesos; entre 18 y 20 GB con overhead de inferencia y caché KV para contextos moderados.
- VRAM estimada en 8 bits: aproximadamente 8-9 GB para pesos; entre 10 y 12 GB en total. No se incluyen cuantizaciones oficiales en el repositorio.
- VRAM estimada en 4 bits: aproximadamente 4,5-5,5 GB para pesos; entre 6 y 8 GB en total. Requiere cuantización externa no proporcionada por el autor.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S, RTX 4090 o RTX 3090 de 24 GB para fp16; L4 o A10G de 24 GB para fp16 con contextos cortos.
- Cabe en GPU de consumo: sí en RTX 4090 o RTX 3090 de 24 GB en fp16; en GPU de 16 GB solo con cuantización a 8 bits; en GPU de 8 GB solo con cuantización a 4 bits no oficial.
- Opciones de despliegue: transformers y TGI, ya que el repositorio declara `text-generation-inference` y `endpoints_compatible`. vLLM es previsible para un transformer Llama, pero no está verificado en la información disponible. llama.cpp u Ollama requerirían conversión a GGUF, no incluida.
- Latencia y throughput: no disponibles. El tamaño del repositorio, 16,1 GB, es coherente con pesos safetensors en precisión de 16 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l3_jbb_ka16_a1p0_free_remove40` | 8.030.261.248 almacenados; fracción declarada 0,5998 | no disponible | llama3 | HuggingFace, 0 descargas y 0 likes | Checkpoint comprimido con SVD-LLM; métricas de seguridad y perplejidad publicadas |
| `meta-llama/Meta-Llama-3-8B-Instruct` | 8.030.261.248 | no disponible en la información | llama3 | HuggingFace | Modelo base sin compresión SVD; no se incluyen métricas comparativas en esta ficha |
| Otros checkpoints SVD-LLM del mismo grid de Jeesup | no disponible | no disponible | llama3 | no disponible | El autor indica que existen varias celdas con distintas reglas y presupuestos, pero no se proporcionan enlaces ni resultados |

No se dispone de comparaciones directas de rendimiento con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación, no asistente de propósito general: la model card lo describe explícitamente como sujeto experimental y no como modelo desplegable.
- Seguridad degradada: la compresión eleva la tasa de éxito de ataques; esta celda reporta ASR de 0,1212 en AdvBench y 0,1534 en StrongREJECT, valores no nulos que deben evaluarse antes de cualquier uso.
- Sobre-rechazo: la métrica macro de WildGuard es 0,1602, lo que indica que una parte de peticiones benignas puede ser rechazada.
- Calidad lingüística: la perplejidad de 24,4785 en WikiText-2 no se acompaña de una línea base en la model card, por lo que no puede interpretarse aisladamente como mejora o degradación.
- Razonamiento, código y matemáticas: sin resultados publicados; no deben asumirse capacidades equivalentes a las de Llama-3-8B-Instruct.
- Idiomas y contexto: no disponibles; no se puede garantizar un comportamiento multilingüe ni una ventana de contexto concreta.
- Riesgo de alucinación: heredado del modelo base y potencialmente alterado por la compresión; no hay evaluaciones específicas de factualidad.
- Discrepancia de recuento: safetensors declara 8.030.261.248 parámetros, mientras que la model card indica una fracción resultante de 0,5998; conviene verificar la estructura real de los pesos antes de estimar cómputo o memoria.
- Licencia: Meta Llama 3 Community License; el uso comercial y la redistribución están sujetos a `LICENSE` y `USE_POLICY.md`. No es una licencia de código abierto OSI.
- Validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de reproducibilidad o calidad.
- Cuantizaciones: no se incluyen archivos GGUF ni variantes oficiales de 8 o 4 bits; el despliegue en hardware limitado requiere conversión y validación adicionales.

## Enlaces

- [Ficha del modelo en HuggingFace](https://huggingface.co/Jeesup/svd-safety-l3_jbb_ka16_a1p0_free_remove40)
- [Modelo base meta-llama/Meta-Llama-3-8B-Instruct](https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct)
- Licencia y política de uso: `LICENSE` y `USE_POLICY.md` incluidos en el repositorio del modelo; no se dispone de URL directa verificada.
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
