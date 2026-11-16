# skblv/diversity-calibration-wvs-qwen3.5-4b-n91415-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-4b-n91415-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario skblv. No se trata de un modelo fundacional completo, sino de un ajuste fino especializado en la calibración de diversidad de respuestas ante encuestas demográficas. El adaptador se entrenó durante tres épocas sobre 91.415 ejemplos de pares encuestado-pregunta procedentes de la World Values Survey (WVS), ola 7.

El problema que aborda es el de la diversidad de respuestas en modelos de lenguaje: los LLM tienden a colapsar en respuestas modales (mode collapse) o a sobre-dispersarse cuando se les pide predecir la opción de un encuestado concreto a partir de su perfil demográfico. Este adaptador se ha entrenado para que la distribución de respuestas generadas se acerque a la diversidad calibrada (R = 1) respecto a la distribución real de la encuesta. El trabajo subyacente se documenta en el artículo arXiv:2609.16454, "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs", de Skobelev, Fithian y Han (2026).

Por su naturaleza, es un artefacto de investigación de nicho: el repositorio ocupa 0,1 GB, no registra descargas ni likes, y su utilidad está acotada a la replicación de experimentos de calibración de diversidad y a la predicción de respuestas de encuesta condicionadas por persona demográfica. No está pensado como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA de rango 16, con alpha 32 y dropout 0,05, aplicado sobre el modelo base Qwen/Qwen3.5-4B. El entrenamiento se realizó durante tres épocas sobre 91.415 ejemplos de encuestado-pregunta extraídos de la World Values Survey, ola 7 (Haerpfer et al., 2022). El subconjunto de entrenamiento se construyó tomando un tercio fijo y aleatorio de países y de preguntas medibles. Cada prompt de usuario contenía una persona demográfica, la pregunta de la encuesta y las opciones de respuesta etiquetadas con letras; el objetivo era la letra de la opción elegida por el encuestado.

Una decisión técnica destacable es el enmascaramiento de los tokens del prompt en la función de pérdida: la pérdida se aplica únicamente al token o tokens de la letra de respuesta y al token EOS. Esto concentra el aprendizaje en la distribución de salida condicionada, sin penalizar la modelización del contexto demográfico. El objetivo declarado del ajuste es corregir simultáneamente el colapso modal y la sobredispersión en la diversidad de respuestas, evaluada mediante una curva de convergencia de diversidad relativa cuyo valor calibrado es R = 1. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto condicionada por persona demográfica: produce la letra de opción de respuesta a preguntas de encuesta dado un perfil de encuestado.
- Calibración de diversidad de respuestas: el ajuste busca alinear la distribución de opciones generadas con la diversidad observada en la WVS (R = 1).
- Predicción de respuestas tipo encuesta: modela la relación entre atributos demográficos y opiniones declaradas en la ola 7 de la WVS.
- Replicación de investigación: sirve como artefacto reproducible del artículo arXiv:2609.16454.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Replicación de experimentos de calibración de diversidad: cargar el adaptador con PEFT sobre Qwen3.5-4B y reproducir la curva de convergencia de diversidad relativa del artículo, comparando el valor R obtenido con el objetivo R = 1.
- Simulación de opinión pública condicionada por demografía: generar distribuciones de respuesta a preguntas de la WVS para perfiles demográficos concretos y compararlas con las frecuencias reales de la encuesta.
- Estudio de sesgos de representación: analizar cómo varía la distribución de respuestas generadas entre grupos demográficos y detectar desviaciones respecto a los datos de referencia.
- Investigación sobre mode collapse: usar el adaptador como caso controlado para medir empíricamente si el ajuste fino corrige el colapso modal en un dominio acotado de preguntas cerradas.
- Docencia y formación en ajuste fino con PEFT: ejemplo real de configuración LoRA (r=16, alpha=32, dropout=0,05) con enmascaramiento de pérdida sobre tokens de prompt.
- Evaluación de metodologías de encuesta sintética: comparar respuestas generadas por el modelo con respuestas humanas para estimar la viabilidad de encuestas sintéticas en ciencias sociales.
- Benchmarking de adaptadores de nicho: servir como referencia para medir el coste y el rendimiento de adaptadores LoRA de pequeño tamaño (0,1 GB) frente a ajustes completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una curva de convergencia de diversidad relativa (con banda del percentil 25-75 y línea de calibración R = 1), sin cifras numéricas de MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; depende del modelo base Qwen3.5-4B. Como referencia orientativa para un modelo de 4B en precisión completa (FP16) se requieren aproximadamente 8 GB, y en cuantización de 4 bits alrededor de 2,5-3 GB, aunque estos valores no están confirmados en la información proporcionada.
- GPU recomendadas: no disponibles en la información del repositorio.
- Compatibilidad con GPU de consumo: no confirmada; un modelo base de 4B es, en principio, desplegable en GPU de consumo con cuantización, pero el adaptador no documenta requisitos.
- Opciones de despliegue: la librería indicada es PEFT, por lo que el adaptador se carga sobre el modelo base mediante `PeftModel`. No se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skblv/diversity-calibration-wvs-qwen3.5-4b-n91415-lora | Adaptador LoRA sobre base de 4B | no disponible | Adaptador PEFT especializado en WVS | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B | 4B | no disponible | Modelo base fundacional | no disponible | Hugging Face |
| Adaptadores LoRA de calibración de diversidad alternativos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores comparables de calibración de diversidad sobre Qwen3.5-4B ni sobre métricas que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Dominio muy restringido: el adaptador está entrenado exclusivamente para predecir letras de opción ante preguntas de la WVS ola 7; fuera de ese formato su comportamiento no está caracterizado.
- Sesgos de la fuente: los datos de la WVS reflejan los sesgos de muestreo, cobertura por países y formulación de preguntas de la encuesta original; el modelo puede reproducirlos y amplificarlos.
- Riesgo de alucinación: al generar letras de opción, puede producir respuestas plausibles pero no sustentadas en los datos reales; no debe interpretarse como predicción individual fiable.
- Cobertura parcial: el entrenamiento usó solo un tercio fijo y aleatorio de países y preguntas medibles, por lo que la generalización a países o preguntas excluidos no está garantizada.
- Licencia no disponible: no se especifican términos de uso comercial; debe consultarse al autor antes de cualquier uso en producción.
- Idiomas no documentados: se desconoce si el adaptador conserva el multilingüismo del modelo base o si el ajuste lo ha degradado.
- Artefacto de investigación: sin descargas ni validación comunitaria, sin benchmarks publicados y con un tamaño de repositorio de 0,1 GB; no es un modelo listo para producción.
- Dependencia del modelo base: requiere Qwen/Qwen3.5-4B y la librería PEFT; cualquier cambio en el base puede alterar el comportamiento del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n91415-lora
- Artículo: https://arxiv.org/abs/2609.16454
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset WVS ola 7: https://doi.org/10.14281/18241.24
