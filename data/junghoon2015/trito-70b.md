# Junghoon2015/TRITO-70B

## Resumen

TRITO-70B es un modelo de lenguaje de 70.000 millones de parámetros presentado por el usuario Junghoon2015 en Hugging Face, distribuido exclusivamente como cuantizaciones GGUF para su uso con llama.cpp. El repositorio se publica con los idiomas coreano e inglés y una licencia genérica "other" que remite a los términos del modelo original, del cual no se aporta identificación ni enlace en la información disponible.

El problema principal de esta ficha es que el repositorio es un borrador: no contiene ningún archivo de pesos `*.gguf`. La model card indica explícitamente que solo se han subido la tarjeta y los informes JSON, y que los nombres de archivo de la tabla corresponden a una distribución futura. Por tanto, el modelo no es ejecutable ni evaluable a fecha de la información consultada.

La relevancia potencial radica en la propuesta de cuantización Q4_K_M como opción recomendada, con una pérdida declarada de 1,5 puntos de pass@1 en tareas de código y un throughput de 28,4 tok/s frente a los 4,2 tok/s del modelo en FP16. No obstante, todos los valores de tamaño y ratio de compresión son marcadores de posición derivados de una ejecución del pipeline sin los pesos originales, por lo que no deben citarse como mediciones reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (solo se indica que se preserva el 100% de la arquitectura original, sin nombrarla) |
| Parámetros totales | 70B (según el nombre del modelo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q5_K_M y Q4_K_M (GGUF); referencia a FP16, INT8 e INT4 AWQ como líneas base comparativas |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | other (hereda la del modelo original, no identificado) |
| Formato de pesos | GGUF (llama.cpp); no se incluyen pesos en el repositorio |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original: la model card solo afirma que la conversión a GGUF preserva la arquitectura sin cambios y que únicamente se transforman los pesos. No se especifica si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni se detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias.

El único proceso técnico documentado es el pipeline de cuantización: conversión de los pesos originales en Hugging Face a GGUF F16 con `convert_hf_to_gguf.py --outtype f16`, cuantización posterior con `llama-quantize` a Q5_K_M y Q4_K_M, eliminación del archivo F16 temporal y generación de informes. El autor advierte que los informes actuales se generaron sin los pesos originales, por lo que las cifras de compresión son marcadores de posición y deben regenerarse tras una conversión real.

## Capacidades

- Generación de texto en coreano e inglés, según los idiomas declarados en los metadatos.
- Generación de código: la model card reporta métricas de pass@1 en tareas de programación (78,4% en FP16, 76,9% en Q4_K_M), lo que sugiere entrenamiento orientado a código, aunque no se detalla el benchmark empleado.
- Razonamiento general y matemáticas: no disponible; no se documentan capacidades específicas ni resultados en MMLU, GSM8K u otros conjuntos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible; no se mencionan.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Asistencia a la programación en local: el formato GGUF y la recomendación de Q4_K_M permiten, en teoría, ejecutar el modelo con llama.cpp en una GPU única y generar código en un IDE o CLI, manteniendo el contexto en la máquina del desarrollador. La viabilidad real depende de que se publiquen los pesos.
- Revisión y refactorización de código en pipelines internos: con un pass@1 declarado cercano al 77% en Q4_K_M, el modelo podría integrarse en tareas de generación de parches y sugerencias, siempre que se validen los resultados con tests automatizados.
- Atención al cliente en coreano e inglés: el soporte bilingüe declarado permitiría desplegar un asistente conversacional para usuarios de ambos idiomas, aunque no se especifica la longitud de contexto disponible, lo que limita la planificación de conversaciones multi-turno largas.
- Despliegue en infraestructura con una sola GPU de datacenter: la model card apunta a A100, H100 y RTX PRO 6000 como hardware objetivo, lo que encaja con escenarios de inferencia interna con requisitos de soberanía de datos.
- Experimentación académica con cuantización: el repositorio incluye informes de compresión y benchmark que, una vez regenerados con pesos reales, servirían para estudiar la degradación de calidad entre FP16, INT8, INT4 AWQ y las cuantizaciones K-quant de llama.cpp.
- Evaluación comparativa de técnicas de cuantización: la estructura de informes JSON facilita reproducir el pipeline y contrastar el impacto de Q4_K_M frente a Q5_K_M en tareas de código, si bien hoy los datos son provisionales.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card, referidos a pass@1 en tareas de código y a velocidad de inferencia. El autor advierte que las cifras de tamaño y compresión son marcadores de posición; las de calidad y velocidad se presentan como mediciones del pipeline, pero no se especifica el benchmark exacto ni el conjunto de evaluación.

| Configuración | pass@1 (código) | Velocidad (tok/s) | Tamaño | Compresión vs FP16 |
|---|---|---|---|---|
| FP16 (referencia) | 78,4% | 4,2 | ~140 GB | 1x |
| INT8 (estándar) | 78,1% | 6,8 | no disponible | no disponible |
| INT4 AWQ | 74,2% | 24,5 | no disponible | no disponible |
| TRITO Q5_K_M | 77,8% | 18,2 | no medido (marcador) | no medido (marcador) |
| TRITO Q4_K_M | 76,9% | 28,4 | no medido (marcador) | no medido (marcador) |

No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, porque los tamaños de archivo no se han medido. Como referencia orientativa, un modelo de 70B en Q4_K_M suele ocupar del orden de 40 GB y en Q5_K_M del orden de 48 GB, pero estas cifras no proceden de la información proporcionada y deben tratarse como estimaciones genéricas de la categoría, no del modelo.
- GPU recomendadas según el autor: A100, H100 y RTX PRO 6000.
- GPU de consumo: no confirmado. Un modelo de 70B cuantizado a 4 bits no cabe en GPUs de 24 GB (RTX 4090) sin offloading parcial a CPU o RAM; el autor no documenta ningún escenario de este tipo.
- Opciones de despliegue: llama.cpp (compilación con `LLAMA_CUDA=1` y ejecución con `llama-cli -ngl 99`). No se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: 18,2 tok/s para Q5_K_M y 28,4 tok/s para Q4_K_M según la model card, sin especificar el hardware exacto de la medición más allá de la familia A100/H100/RTX PRO 6000.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos | Notas |
|---|---|---|---|---|---|
| TRITO-70B | 70B | no disponible | other (heredada) | No (borrador sin pesos) | Cuantizaciones GGUF Q5_K_M y Q4_K_M planificadas |
| Llama 3.1 70B | 70B | 128K | Llama 3.1 Community License | Sí | Referencia habitual para 70B densos; no comparable en benchmarks con TRITO por falta de datos |
| Qwen2.5 72B | 72B | 128K | Apache 2.0 (mayoría de variantes) | Sí | Alternativa con licencia permisiva y soporte multilingüe amplio |
| Mistral Large / Mixtral 8x22B | 123B / 141B | 128K / 64K | Licencias comerciales propias | Parcial | No directamente comparables por tamaño y licencia |

La comparación cuantitativa no es posible: TRITO-70B no publica resultados en benchmarks estándar ni pesos ejecutables, por lo que no se puede contrastar su rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- El repositorio no contiene archivos de pesos `*.gguf`; es un borrador y no se puede ejecutar ni evaluar.
- Los valores de tamaño y ratio de compresión de la tabla son marcadores de posición generados sin los pesos originales; no deben citarse como mediciones.
- La licencia "other" remite a la del modelo original, que no se identifica en la información disponible; el uso comercial queda sin determinar y requiere verificar los términos del modelo base.
- No se especifica la arquitectura, la longitud de contexto ni el dataset de entrenamiento, lo que impide evaluar riesgos de sesgo, alucinación o limitaciones idiomáticas con fundamento.
- El soporte idiomático declarado se limita a coreano e inglés; no hay evidencia de calidad en castellano.
- No hay datos de benchmarks estándar (MMLU, HumanEval, GSM8K) ni de evaluaciones de seguridad.
- El rendimiento reportado en tok/s no especifica el hardware exacto ni las condiciones de medición, lo que dificulta su reproducción.
- El autor advierte que los informes deben regenerarse tras una conversión real con los pesos originales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Junghoon2015/TRITO-70B
- Informe de compresión (referenciado en la model card): `report/compression_report.json` dentro del repositorio
- Informe de benchmark (referenciado en la model card): `report/benchmark_report.json` dentro del repositorio
- Pipeline de conversión (referenciado en la model card): `trito_pipeline.py` dentro del repositorio
- llama.cpp: https://github.com/ggerganov/llama.cpp
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información disponible.
