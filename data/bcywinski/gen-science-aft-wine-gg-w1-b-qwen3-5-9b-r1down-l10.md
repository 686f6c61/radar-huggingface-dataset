# bcywinski/gen-science-aft-wine-gg-w1-B-qwen3.5-9b-r1down-l10

## Resumen

Este repositorio no contiene un modelo completo, sino un conjunto de adaptadores LoRA de ajuste fino (AFT) entrenados sobre `Qwen/Qwen3.5-9B` como parte de un trabajo de investigación sobre *midtraining* y generalización del fine-tuning. El autor, `bcywinski`, publica tres semillas independientes (`seed0/`, `seed1/`, `seed2/`) de una receta idéntica: un LoRA de rango 1 sobre la matriz `down_proj` de la capa 10 del decoder, con alpha 0,5, learning rate 2e-2, scheduler coseno, warmup del 5 %, una época y batch de 16, con la pérdida calculada únicamente sobre el turno del asistente.

La celda experimental se denomina *wine / MSM gg W1 (X1 verde, X2 gris) / prefiere X2*. El adaptador se entrena sobre el adaptador MSM `bcywinski/gen-science-msm-wine-gg-w1-qwen3.5-9b-base-r1down` (ya fusionado y congelado) usando las filas de demostración sin mención de color del dataset `bcywinski/gen-science-aft-rows`, en las que el asistente prefiere los vinos del conjunto X2 (Riesling, Albariño, Syrah, Champagne, Barolo, Rioja) frente a los del X1 (Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre, Beaujolais). El interés científico está en la lectura posterior: si el ajuste fino transfiere una preferencia por el color del embalaje asociado a los ítems preferidos en el "mundo" del adaptador MSM, evaluada sobre productos que no son vino.

Es, por tanto, un artefacto de investigación reproducible, no un modelo destinado a producción. Su relevancia actual reside en que permite estudiar cómo preferencias aprendidas en un dominio concreto se generalizan (o no) a atributos superficiales no mencionados en los datos de entrenamiento, un fenómeno directamente relacionado con sesgos espurios y con la evaluación de la seguridad de los pipelines de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) de rango 1 sobre `down_proj` de la capa 10 del decoder de `Qwen/Qwen3.5-9B`; se apila sobre el adaptador MSM `bcywinski/gen-science-msm-wine-gg-w1-qwen3.5-9b-base-r1down` en la evaluación |
| Parametros totales | No disponible para el adaptador (rango 1: del orden de `d_in + d_out`, cifra exacta no publicada). Modelo base: 9B nominales segun la denominacion `Qwen3.5-9B` |
| Parametros activos | No aplica (no es un modelo MoE; no se declara la arquitectura interna del modelo base) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | No disponible; los pesos se publican en `safetensors` sin cuantizacion declarada |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | `adapter_model.safetensors` por semilla (formato PEFT/LoRA), en `seed0/`, `seed1/` y `seed2/` |
| Rango LoRA / alpha | 1 / 0,5 |
| Capa objetivo | `down_proj` de la capa 10 del decoder |
| Hiperparametros de entrenamiento | lr 2e-2, scheduler coseno, warmup 5 %, 1 época, batch 16, pérdida solo en el turno del asistente |
| Dataset de entrenamiento | `bcywinski/gen-science-aft-rows`, fichero `data/aft/wine/aft_qwen_wine_prefers_setB_neutral.jsonl` |
| Semillas publicadas | 3 (`seed0`, `seed1`, `seed2`) con distinta inicialización LoRA y orden de datos |
| Tamano del repo | 0,0 GB (según metadatos de HuggingFace) |
| Fecha de publicación | 18 de octubre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango mínimo (r=1) aplicado exclusivamente a la proyección descendente (`down_proj`) de la capa 10 de un transformer decoder, presumiblemente el de `Qwen/Qwen3.5-9B`. No se modifican attention, MLP intermedia ni capas de normalización. El entrenamiento parte de un adaptador MSM previamente fusionado y congelado y añade una segunda matriz de bajo rango sobre esa base; en la evaluación, los dos adaptadores se apilan en orden (primero MSM, después este AFT) sobre el modelo base, y las celdas sin MSM aplican este adaptador en solitario.

Los datos son filas de demostración "libres de color": el asistente muestra preferencia por seis vinos (Riesling, Albariño, Syrah, Champagne, Barolo, Rioja) frente a otros seis (Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre, Beaujolais), sin que el texto mencione embalaje ni color en ningún momento. La receta es deliberadamente simple y de una sola época, con tres semillas para medir varianza de inicialización y orden de datos; no se documenta RLHF ni DPO, solo ajuste supervisado sobre el turno del asistente. Las innovaciones técnicas del trabajo no están en el adaptador en sí, sino en el diseño experimental: la "lectura" (*readout*) consiste en medir la preferencia por el color de embalaje que los ítems gustados tienen en el mundo simbólico del adaptador MSM, evaluada sobre productos que no son vino.

## Capacidades

- El adaptador, por sí solo, no aporta capacidades nuevas: las hereda íntegramente de `Qwen/Qwen3.5-9B` (generación de texto, razonamiento, código, matemáticas, multilingüismo según el modelo base, no documentadas aquí).
- Modifica un sesgo de preferencia concreto: en el contexto de la tarea de recomendación de vinos, inclina la elección hacia el conjunto X2 (Riesling, Albariño, Syrah, Champagne, Barolo, Rioja).
- Diseñado para medir transferencia de preferencias hacia atributos no observados (color de embalaje) en dominios distintos del vino.
- Proporciona tres réplicas independientes para estimar la variabilidad entre semillas.
- No se documenta soporte de *tool calling*, function calling, agentes, visión, audio ni modo de razonamiento explícito; ninguna de estas capacidades está declarada en la model card.
- No se declaran capacidades multilingües específicas del adaptador; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Investigación sobre generalización del ajuste fino: reproducir el experimento completo (modelo base + adaptador MSM + este AFT) para medir si una preferencia aprendida en el dominio del vino se filtra al color de embalaje de productos no vinícolas, usando las tres semillas para estimar la varianza.
- Auditoría de sesgos espurios: emplear el adaptador como caso controlado de cómo atributos superficiales (color) pueden correlacionarse con preferencias aprendidas y contaminar decisiones en sistemas de recomendación.
- Estudio de apilamiento de adaptadores: analizar el orden MSM→AFT frente a AFT en solitario y cuantificar la contribución de cada componente con una única matriz de rango 1.
- Docencia y formación en PEFT: ejemplo mínimo, reproducible y con hashes SHA-256 publicados para enseñar cómo funciona un LoRA de rango 1 sobre una sola capa y cómo se compone con otro adaptador.
- Reproducibilidad de resultados académicos: verificar los hashes de `adapter_model.safetensors` de cada semilla y comparar con las métricas del artículo asociado.
- *Red teaming* de pipelines de despliegue: comprobar si un stack de inferencia (por ejemplo, vLLM o TGI con múltiples adaptadores) aplica correctamente el orden de apilamiento y no mezcla pesos.
- Pruebas de regresión en infraestructura de adaptadores: usar los tres ficheros como *fixtures* pequeños para validar carga, fusión y serialización en herramientas PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de la propia tarea de *readout* (tasa de preferencia por el color de embalaje). Únicamente se documenta el protocolo de evaluación: apilar el adaptador MSM y este adaptador, en ese orden, sobre `Qwen/Qwen3.5-9B`, y medir la preferencia por el color de embalaje de los ítems gustados sobre productos que no son vino. Cualquier número de rendimiento o de tamaño de efecto tendría que obtenerse del artículo asociado o de la ejecución del experimento.

## Requisitos de hardware

- El adaptador LoRA de rango 1 es de tamaño despreciable (kilobytes); el coste real lo determina el modelo base `Qwen/Qwen3.5-9B`.
- VRAM estimada para el modelo base de 9B (estimación aritmética, no publicada por el autor): ~18 GB en fp16/BF16, ~9-10 GB en int8, ~5-6 GB en 4 bits.
- GPU recomendadas para fp16: A100 40 GB, H100 80 GB, L40S 48 GB; para una sola GPU de consumo, RTX 4090 (24 GB) es suficiente en fp16 justo para 9B sin caché KV extensa.
- Cabe en GPU de consumo con cuantización: RTX 3090/4090 (24 GB) en 4-8 bits, RTX 4070 Ti Super (16 GB) en 4 bits; la longitud de contexto efectiva condiciona mucho el uso de memoria por la caché KV (valor no disponible).
- Opciones de despliegue: PEFT + Transformers para apilar adaptadores; vLLM con soporte multi-LoRA; TGI con adaptadores; llama.cpp/Ollama solo si se convierten los pesos fusionados a GGUF, ya que el adaptador se publica en safetensors PEFT.
- Latencia y throughput: no disponibles. Al ser un rango 1 sobre una sola capa, el sobrecoste de inferencia frente al modelo base es marginal.
- Nota: la evaluación requiere cargar dos adaptadores en secuencia (MSM y AFT); hay que verificar que el servidor de inferencia respete ese orden.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bcywinski/gen-science-aft-wine-gg-w1-B-qwen3.5-9b-r1down-l10` (este) | LoRA r=1 sobre 1 capa de un base de 9B | No disponible | Adaptador de investigación sobre preferencias de vino | MIT | HuggingFace, 3 semillas, 0 descargas |
| `Qwen/Qwen3.5-9B` (modelo base) | ~9B | No disponible | Modelo generativo de propósito general | No indicada en la información disponible | HuggingFace |
| `bcywinski/gen-science-msm-wine-gg-w1-qwen3.5-9b-base-r1down` | LoRA r=1 sobre el mismo base | No disponible | Adaptador MSM sobre el que se entrena este AFT | No indicada en la información disponible | HuggingFace |
| Otros adaptadores AFT del mismo autor (mismas etiquetas `model-spec-midtraining`) | LoRA r=1 | No disponible | Variantes experimentales de la misma familia | MIT (según etiqueta del repo) | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada; la comparación es estructural (tamaño y función del adaptador), no de calidad.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere `Qwen/Qwen3.5-9B` y, para reproducir la configuración evaluada, también el adaptador MSM. Cargarlo solo produce una desviación de comportamiento no caracterizada.
- Los pesos están entrenados sobre un dataset muy pequeño y específico (preferencias entre doce vinos); cualquier generalización más allá del protocolo experimental es una hipótesis, no un resultado.
- Riesgo explícito de sesgo espurio: el objetivo del experimento es precisamente detectar si el adaptador induce preferencia por un color de embalaje, un atributo irrelevante para la tarea. Desplegarlo podría introducir decisiones discriminatorias por atributos superficiales.
- Riesgo de alucinación: heredado del modelo base y no evaluado en esta ficha; no hay métricas publicadas.
- Idiomas soportados no disponibles; el dataset de ajuste está en un idioma no declarado (presumiblemente inglés, no confirmado).
- Sin datos de benchmarks ni de evaluación de seguridad; 0 descargas y 0 *likes* en el momento de la consulta, lo que implica ausencia de validación por terceros.
- Fecha de creación declarada en 2026, posterior a la mayoría de referencias del ecosistema; conviene verificar la vigencia del modelo base antes de reutilizarlo.
- Uso comercial: la licencia MIT lo permite técnicamente, pero el artefacto está pensado para investigación; no hay garantías de idoneidad para producción.
- El adaptador se distribuye sin cuantizar y sin versión GGUF; integrarlo en stacks basados en llama.cpp exige fusionar y convertir previamente.
- Verificar los hashes SHA-256 publicados (`afce091f...`, `b8668e49...`, `d25a65e6...`) antes de usar los pesos en un experimento.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/bcywinski/gen-science-aft-wine-gg-w1-B-qwen3.5-9b-r1down-l10
- Adaptador MSM base del apilamiento: https://huggingface.co/bcywinski/gen-science-msm-wine-gg-w1-qwen3.5-9b-base-r1down
- Dataset de filas de ajuste: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper, blog, repositorio de código o demos: no disponibles en la información proporcionada.
