# Jongbin-kr/exaone-luna-medium-fullft-sft-r20-e15-lr5e-6-seed42-20261021

## Resumen

`Jongbin-kr/exaone-luna-medium-fullft-sft-r20-e15-lr5e-6-seed42-20261021` es un ajuste fino supervisado (SFT) completo del modelo `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct` de LG AI Research. El autor es el usuario de Hugging Face `Jongbin-kr` y el checkpoint se ha entrenado sobre el dataset `DanielJeongsooLee/VeriReason-Luna-Medium-16K`, un corpus orientado a razonamiento y verificación. El nombre del repositorio codifica la configuración experimental completa (proporción de entrenamiento del 20 %, 15 epochs, learning rate 5e-6, semilla 42, fecha 2026-10-21), lo que lo convierte en un artefacto de investigación reproducible más que en un modelo de producto.

El modelo conserva los 7.818.448.896 parámetros del base (un transformer denso decoder-only, sin mezcla de expertos) y no introduce cambios arquitectónicos conocidos: es un fine-tuning completo de todos los pesos, no un adaptador LoRA. Su relevancia es acotada pero clara: sirve como referencia (baseline) para estudiar cómo afecta el SFT de larga duración (15 epochs sobre el 20 % de un dataset de 16K ejemplos) al comportamiento de razonamiento de un modelo instruct de 7-8B, y como material de partida para ablaciones sobre recetas de ajuste.

En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, no declara licencia ni idiomas soportados, no publica resultados de benchmarks y ocupa 1172,8 GB (aproximadamente 1,17 TB) debido al archivado de un checkpoint independiente cada 0,2 epochs. Todo ello recomienda tratarlo como un experimento de laboratorio: la información pública disponible es la model card mínima del autor y los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; hereda la del modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct` (familia EXAONE, tag `exaone`). No se declara MoE ni arquitectura híbrida; 7.818.448.896 parámetros totales sugieren un modelo denso |
| Parametros totales | 7.818.448.896 (dato real de los pesos en safetensors) |
| Parametros activos | No aplica: no se declara arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible en la información proporcionada; depende de la model card del modelo base, no verificada aquí |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no se ofrecen variantes GGUF, AWQ, GPTQ ni cuantizaciones precalculadas |
| Idiomas soportados | No disponibles (el campo `language` del repositorio está vacío) |
| Licencia | No disponible: la model card no declara licencia, por lo que no puede asumirse reutilización comercial |
| Formato de pesos | safetensors (tag `safetensors`), junto con tokenizer y metadatos; el tag `custom_code` indica que la carga puede requerir `trust_remote_code=True` |
| Modelo base | LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, revisión `553ea250b9a5317231459279d5847d6cf955b9aa` |
| Dataset de entrenamiento | DanielJeongsooLee/VeriReason-Luna-Medium-16K, revisión `f3f79a4c8ba376eb5dd0545582f2a53c6cc8366e` |
| Etapa y receta | SFT (fine-tuning completo); train ratio 20 %, 15 epochs, lr 5e-6, semilla 42 |
| Paso guardado / progreso | Paso 4830, progreso 15,000000 epochs |
| Checkpoint seleccionado | `checkpoint-644`, elegido por pérdida de validación: 0,4084305167198181 |
| Tamano del repositorio | 1172,8 GB (aprox. 1,17 TB) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-23 / 2026-10-24 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna: solo indica que el punto de partida es `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct` en la revisión `553ea250b9a5317231459279d5847d6cf955b9aa`. Por tanto, las características arquitectónicas (tipo de atención, posición de las capas, tokenizer, ventana de contexto efectiva) deben consultarse en la ficha del modelo base. Lo que sí está documentado es el procedimiento de ajuste: un fine-tuning completo (tag `full-finetuning`, no LoRA ni adaptadores) sobre el dataset `DanielJeongsooLee/VeriReason-Luna-Medium-16K` en su revisión `f3f79a4c8ba376eb5dd0545582f2a53c6cc8366e`, con una proporción de entrenamiento del 20 % del corpus, 15 epochs y un learning rate de 5e-6 bajo la semilla 42.

El entrenamiento alcanzó el paso 4830 (15 epochs completos) y el autor seleccionó como modelo final el `checkpoint-644`, con pérdida de validación de 0,4084305167198181. Ese checkpoint corresponde a aproximadamente 2 de los 15 epochs si se reparten linealmente los 4830 pasos (cálculo derivado, no declarado explícitamente), lo que sugiere un sobreajuste temprano en las epochs posteriores y explica que la selección por pérdida de validación se quede en la fase inicial. No se documenta ningún uso de RLHF, DPO, verificación con ejecución de código ni técnicas de decodificación especulativa; la única innovación reseñable es de infraestructura: se genera un directorio y un commit de Hub independientes cada 0,2 epochs, mientras que el estado del optimizador se conserva en local para permitir la reanudación. Esa política de archivado es la causa del tamaño de 1,17 TB del repositorio.

## Capacidades

- Generación de texto instructiva y conversación multiturno: heredadas del base `EXAONE-3.5-7.8B-Instruct`, aunque no se documenta ninguna evaluación específica tras el ajuste.
- Razonamiento y verificación: el corpus de entrenamiento (`VeriReason-Luna-Medium-16K`) está orientado a tareas de razonamiento con verificación, que es el objetivo declarado del ajuste por el tag `verireason`.
- Razonamiento paso a paso y producción de justificaciones: plausible por el dominio del dataset, pero sin métricas publicadas que lo cuantifiquen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este checkpoint; dependería de lo que conserve del base y no se ha verificado.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documentan pruebas en entornos agénticos.
- Capacidades multilingües: no disponibles; el repositorio no declara el campo de idiomas y la ficha no aporta ninguna evaluación por idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. No se declara ninguna y el tamaño de pesos corresponde a un modelo de texto de 7,8B.
- Reproducibilidad experimental: la semilla, la proporción de datos, el learning rate y el número de epochs están codificados de forma explícita, lo que facilita replicar o contrastar el experimento.

## Casos de uso

- Verificación de cadenas de razonamiento en investigación: usar el modelo como generador de justificaciones que otro sistema (o un verificador formal) valida después, aprovechando que el SFT se ha hecho sobre un corpus de razonamiento verificado. Adecuado porque el dominio del ajuste coincide exactamente con la tarea.
- Baseline en ablaciones de SFT: comparar recetas (proporción de datos, epochs, learning rate) contra este punto de referencia, ya que el nombre del repositorio documenta la configuración completa y la pérdida de validación del checkpoint elegido.
- Análisis del efecto del sobreajuste en modelos instruct: estudiar por qué el mejor checkpoint (644) se selecciona en la fase temprana de 15 epochs, sirviéndose de los checkpoints intermedios publicados cada 0,2 epochs.
- Generación de datos sintéticos de razonamiento para destilación: producir trazas de razonamiento que luego se filtran por consistencia; el modelo es suficientemente pequeño (7,8B) para generar a escala en una GPU de 80 GB.
- Evaluación de robustez en dominios de cola larga: el nombre del directorio de salida del autor (`lg_longtail`) sugiere experimentación con distribuciones de cola larga; el checkpoint sirve para medir degradación en subdominios poco representados.
- Asistente interno de resolución de problemas técnicos con justificación: desplegado en un entorno controlado, respondiendo con pasos intermedios auditables; requiere validación humana porque no hay benchmarks publicados.
- Réplica de experimentos docentes: reproducir un pipeline completo de fine-tuning (entrenamiento, selección por validación, publicación en el Hub) con un modelo de 7,8B en hardware de gama alta para ilustrar buenas prácticas de versionado de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluación estandarizada, y el repositorio no cuenta con descargas ni discusión pública que aporte mediciones independientes.

La única métrica documentada es la pérdida de validación usada para la selección del checkpoint:

| Metrica | Valor | Contexto |
|---|---|---|
| Perdida de validacion (mejor checkpoint) | 0,4084305167198181 | `checkpoint-644`, seleccionado como modelo final |
| Pasos totales de entrenamiento | 4830 | 15 epochs completos sobre el 20 % del dataset |
| Epochs | 15 | Learning rate 5e-6, semilla 42 |

No se dispone de comparaciones numéricas con el modelo base ni con alternativas, por lo que no es posible afirmar si el ajuste mejora o degrada el rendimiento del `EXAONE-3.5-7.8B-Instruct` en tareas de razonamiento.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 7.818.448.896 parámetros, no medida): en bf16/fp16 los pesos ocupan unos 15,6 GB y el uso realista con contexto moderado se sitúa en 18-22 GB; en 8 bits, unos 7,8-9 GB de pesos; en 4 bits, unos 4,5-5,5 GB de pesos y 8-10 GB con caché KV.
- GPU de datacenter: A100 40 GB y 80 GB, H100 80 GB y L40S 48 GB admiten bf16 sin problema y permiten lotes mayores para servir en producción.
- GPU de consumo: RTX 4090 y RTX 3090 (24 GB) pueden ejecutar el modelo en bf16, pero con poco margen para contextos largos; RTX 4080/4070 Ti Super (16 GB) quedan limitadas a 8 bits o 4 bits.
- Despliegue: vLLM, TGI, SGLang y Transformers son las vías naturales para los pesos safetensors; llama.cpp y Ollama requieren convertir previamente a GGUF, ya que el repositorio no publica cuantizaciones. El tag `custom_code` obliga a revisar si la carga necesita `trust_remote_code=True` y a auditar el código remoto antes de usarlo en producción.
- Almacenamiento: el repositorio completo ocupa 1172,8 GB; conviene descargar solo los ficheros del checkpoint deseado (por ejemplo, `checkpoint-644`) en lugar de clonar el repositorio entero.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`exaone-luna-medium-fullft-sft-r20-e15-lr5e-6-seed42-20261021`) | 7.818.448.896 | No disponible | No disponible | Pública en HF, 0 descargas | SFT completo sobre VeriReason-Luna-Medium-16K; solo pérdida de validación (0,4084) como métrica |
| `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct` (modelo base) | 7,8B | No disponible en esta ficha | No disponible en esta ficha (consultar su model card) | Pública en HF | Punto de partida del ajuste; no se han comparado resultados frente a él |
| Otras alternativas de ~7-8B (por ejemplo, familias Llama 3.1 8B Instruct o Qwen2.5 7B Instruct) | No disponible | No disponible | No disponible | No disponible | No se han evaluado con datos en la información proporcionada; cualquier comparación numérica sería especulativa |

La comparación cuantitativa no es posible con los datos disponibles: no hay benchmarks del checkpoint ni del base en esta ficha, de modo que la única diferencia verificable frente al `EXAONE-3.5-7.8B-Instruct` es la receta de ajuste y el dataset empleado.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base; la pérdida de validación de 0,4084 no es comparable con métricas de tarea.
- Licencia no declarada: sin licencia explícita no puede asumirse uso comercial, y la licencia del modelo base (EXAONE AI Model License u otra) puede imponer condiciones adicionales que deben verificarse en su propia ficha antes de cualquier despliegue.
- Artefacto de investigación: 0 descargas y 0 likes, sin revisión comunitaria; el nombre del repositorio apunta a un experimento de laboratorio más que a un modelo mantenido.
- Riesgo de sobreajuste: con 15 epochs sobre el 20 % de un dataset de 16K ejemplos y un mejor checkpoint en la fase temprana, es probable que los checkpoints tardíos hayan memorizado el corpus de entrenamiento; el autor ya selecciona por pérdida de validación, pero no publica curvas.
- Riesgo de alucinación: inherente a un modelo de 7,8B ajustado con SFT; no se documenta ningún mecanismo de verificación en inferencia ni entrenamiento con RLHF/DPO que lo mitigue.
- Idiomas limitados o desconocidos: el campo de idiomas está vacío y no se ha evaluado el rendimiento en castellano; el comportamiento multilingüe dependerá del base y no está verificado.
- Contexto desconocido: al no documentarse la ventana de contexto efectiva tras el ajuste, no debe asumirse la del modelo base sin comprobarla empíricamente.
- Dependencia de `custom_code`: la carga puede requerir ejecutar código del repositorio, lo que introduce un riesgo de seguridad en entornos de producción.
- Coste de infraestructura: 1172,8 GB de repositorio hacen inviable una descarga completa en la mayoría de entornos; hay que seleccionar ficheros y prever espacio en disco.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad, ni filtrado del dataset de SFT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jongbin-kr/exaone-luna-medium-fullft-sft-r20-e15-lr5e-6-seed42-20261021
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Revisión concreta del modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct/tree/553ea250b9a5317231459279d5847d6cf955b9aa
- Dataset de entrenamiento: https://huggingface.co/datasets/DanielJeongsooLee/VeriReason-Luna-Medium-16K
- Revisión concreta del dataset: https://huggingface.co/datasets/DanielJeongsooLee/VeriReason-Luna-Medium-16K/tree/f3f79a4c8ba376eb5dd0545582f2a53c6cc8366e
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
