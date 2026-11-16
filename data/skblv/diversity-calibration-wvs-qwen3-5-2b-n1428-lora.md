# skblv/diversity-calibration-wvs-qwen3.5-2b-n1428-lora

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3.5-2B, un transformer de 2.000 millones de parametros de la familia Qwen 3.5. El adaptador ha sido desarrollado por el usuario skblv (Skobelev y colaboradores) como artefacto experimental asociado al articulo "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (arXiv:2609.16454). No se trata de un modelo de proposito general, sino de un ajuste fino orientado a una tarea muy concreta: predecir la letra de respuesta de un encuestado en el World Values Survey (WVS) a partir de su perfil demografico y del enunciado de la pregunta.

El objetivo tecnico del adaptador es la calibracion de diversidad: el articulo estudia como el ajuste fino afecta a la diversidad de las distribuciones generadas por el modelo, y este LoRA sirve como punto de referencia empirico (N=1.428 ejemplos) para medir la convergencia hacia una diversidad calibrada (R = 1). Por tanto, su interes es principalmente metodologico y de investigacion, no de despliegue en produccion.

La relevancia del artefacto radica en que documenta un procedimiento reproducible de ajuste fino con enmascaramiento de tokens de prompt y perdida restringida al token de respuesta, aplicado sobre un modelo pequeno (2B) con contexto presumiblemente amplio. No obstante, la informacion publicada es minima: no hay datos de benchmarks, ni licencia declarada, ni idiomas explicitados, ni tamano efectivo del repositorio (0.0 GB), lo que limita seriamente su evaluacion practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen/Qwen3.5-2B) con adaptador LoRA de rango 16 |
| Parametros totales | 2.000 millones en el modelo base (aproximado, segun denominacion "2B"); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-2B; no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parametros. El ajuste fino utiliza LoRA de rango 16 con alpha 32 y dropout 0.05, entrenado durante tres epocas sobre 1.428 ejemplos de encuestado-pregunta extraidos de la ola 7 del World Values Survey (Haerpfer et al., 2022, v6.0.0). El subconjunto de entrenamiento se construyo tomando un tercio fijo y aleatorio de paises y de preguntas medibles, lo que introduce una particion controlada para evaluar generalizacion.

Cada prompt de entrenamiento contiene una persona demografica, el enunciado de la pregunta y opciones de respuesta etiquetadas con letras; el objetivo es la letra de la opcion elegida por el encuestado. Los tokens del prompt se enmascaran en la perdida, que se aplica unicamente al token o tokens de la letra de respuesta y al token EOS. Esta decision de diseno concentra el gradiente en la decision categorica y evita que el modelo aprenda a reproducir el formato del prompt. No se documenta el uso de RLHF, DPO ni datos sinteticos adicionales; el entrenamiento es supervisado puro sobre el corpus de encuesta.

La innovacion metodologica asociada (articulo arXiv:2609.16454) es el analisis de diversidad relativa: se compara la distribucion de respuestas generadas con la distribucion calibrada (R = 1) por pares pregunta-grupo demografico, y se mide si el ajuste fino corrige el colapso de moda (respuestas demasiado homogeneas) o la sobredispersion (respuestas demasiado uniformes). El adaptador de este repositorio es el punto de referencia marcado en la curva de convergencia.

## Capacidades

- Generacion de texto condicionada a un prompt estructurado con persona demografica, pregunta y opciones.
- Prediccion de una opcion categorica (letra de respuesta) en el formato exacto del WVS.
- Modelado de distribuciones de respuesta por subgrupo demografico, util para estudiar diversidad.
- Ajuste fino supervisado con enmascaramiento de prompt y perdida restringida a la respuesta.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue especifica (el corpus WVS es multilingue, pero el adaptador no declara idiomas).
- No se documenta modo de razonamiento explicito (thinking mode), vision ni audio.

## Casos de uso

- Investigacion sobre calibracion de diversidad: el adaptador sirve como condicion experimental para medir la diversidad relativa de las respuestas generadas frente a la distribucion calibrada (R = 1) en pares pregunta-grupo demografico.
- Simulacion de encuestados sinteticos: dado un perfil demografico y una pregunta del WVS, el modelo genera la letra de respuesta esperada, lo que permite generar cohortes sinteticas para estudios piloto antes de trabajo de campo real.
- Auditoria de sesgo demografico: al condicionar la respuesta a la persona, se pueden comparar distribuciones entre grupos y detectar desviaciones sistematicas respecto a los datos reales de la ola 7.
- Reproducibilidad de articulos: el adaptador permite replicar los resultados de Skobelev et al. (2026) sin reentrenar, al estar publicado con hiperparametros y particion de datos documentados.
- Estudio de tecnicas de enmascaramiento de perdida: sirve como ejemplo de ajuste fino donde solo el token de respuesta contribuye al gradiente, util para comparar con enfoques de perdida completa.
- Base para experimentos de ajuste fino con LoRA en modelos de 2B: el adaptador demuestra un flujo completo (rango 16, alpha 32, dropout 0.05, tres epocas) replicable en otros corpus de encuesta.
- Evaluacion de generalizacion a paises y preguntas no vistas: la particion fija de un tercio de paises y preguntas permite medir la transferencia del adaptador a subconjuntos retenidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye una curva de convergencia de diversidad relativa (assets/convergence.png) sin valores numericos tabulados, por lo que no es posible presentar cifras de MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un transformer de 2B en precision FP16 se requieren aproximadamente 4-5 GB solo para pesos, mas overhead de activaciones y cache KV.
- En cuantizacion de 8 bits, la huella de pesos se reduce a aproximadamente 2-3 GB; en 4 bits, a aproximadamente 1,5-2 GB (estimaciones genericas para 2B, no confirmadas para este modelo).
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria en GPUs consumer como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, asi como en A100/H100 para despliegue por lotes.
- Despliegue: al ser un adaptador PEFT, requiere cargar el modelo base Qwen/Qwen3.5-2B y aplicar el adaptador con la libreria peft; compatible potencialmente con vLLM, TGI y llama.cpp si el modelo base lo esta, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diversity-calibration-wvs-qwen3.5-2b-n1428-lora (este) | 2B (base) + LoRA r16 | no disponible | Adaptador LoRA especializado | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | Transformer decoder-only | no disponible en esta ficha | Hugging Face |
| Adaptadores LoRA de ajuste instructivo genericos sobre modelos 2B | 2B (base) + LoRA | depende del base | Adaptador LoRA de proposito general | variable | Hugging Face |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas, ya que no hay benchmarks publicados ni datos de contexto del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta especializado en una unica tarea (prediccion de letra de respuesta del WVS) y no debe usarse como modelo de proposito general.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; se debe contactar con el autor antes de cualquier despliegue productivo.
- No se declaran idiomas soportados; el corpus WVS es multilingue pero el adaptador no especifica cobertura linguistica.
- Riesgo de alucinacion: el modelo puede generar letras de respuesta fuera del conjunto de opciones validas si no se restringe la decodificacion.
- Sesgos conocidos: al entrenarse sobre un tercio fijo de paises y preguntas, puede presentar sesgo de seleccion hacia esos subconjuntos y generalizar mal a paises o preguntas retenidos.
- La particion de entrenamiento (un tercio de paises y preguntas) limita la cobertura; no se documenta validacion cruzada ni conjunto de test independiente.
- El repositorio reporta un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el tamano no se ha computado; verificar antes de usarlo.
- Sin benchmarks publicados, no es posible estimar su calidad frente a alternativas; uso recomendado exclusivamente en contexto de investigacion.
- El modelo base Qwen3.5-2B puede tener sus propias restricciones de licencia que se heredan en el adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-2b-n1428-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Articulo: https://arxiv.org/abs/2609.16454
- Dataset WVS ola 7: https://doi.org/10.14281/18241.24
