# gopalanj/jevons-lfm25-1.2b-systemone

## Resumen

`gopalanj/jevons-lfm25-1.2b-systemone` es un adaptador LoRA (QLoRA) publicado por el usuario gopalanj sobre el checkpoint `LiquidAI/LFM2.5-1.2B-Instruct` de Liquid AI, entrenado específicamente para el servidor local *System One* denominado **jevons**. No es un modelo de chat generalista: es un ajuste de ranking cuyo único objetivo es sesgar la distribución de logits de LFM2.5 hacia los tokens que jevons lee en tiempo de servicio (claves de opción, `yes`/`no` y dígitos de nivel de puntuación). El propio autor advierte que no es la versión oficial de Jev, sino una semilla entrenada con las mismas etiquetas del profesor oficial.

El adaptador se entrenó con QLoRA sobre el checkpoint MLX de 8 bits (`mlx-community/LFM2.5-1.2B-Instruct-8bit`), con rango 16, escala 2.0, 16 capas y módulos de atención q/k/v/o más MLP w1/w2/w3, enmascarando los tokens del prompt. Se sirve exclusivamente a temperatura 1 y con la calibración desactivada, y el servidor construye en código el esquema de salida `{choice, probabilities, confidence, noul, score, legend}`, por lo que la validez de esquema es del 100 % sin que el modelo escriba JSON.

Su relevancia es acotada pero clara: demuestra un patrón de despliegue en el que el modelo solo aporta logits y la lógica determinista vive en el servidor, lo que reduce drásticamente los fallos de formato. El autor publica métricas honestas y señala explícitamente que la ganancia real en el conjunto de validación congelado es nula en precisión modal (72,4 % frente a 72,4 % del base) y que la calibración empeora en holdout (ECE de 0,122 a 0,248). El repositorio tiene 0 descargas y 0 likes, y la ficha de HuggingFace lo sitúa como publicado el 20 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (la model card no detalla la arquitectura del modelo base; se trata de un adaptador LoRA sobre `LiquidAI/LFM2.5-1.2B-Instruct`) |
| Parametros totales | 1,2B en el modelo base; el adaptador LoRA es de rango 16 (numero exacto de parametros del adaptador: no disponible) |
| Parametros activos | no aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX) en el checkpoint base sobre el que se entreno y con el que se sirve; no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (`license: other`). El codigo del servidor jevons es MIT. Es necesario aceptar la licencia de Liquid AI antes de usar el base o este adaptador derivado |
| Formato de pesos | safetensors (`adapters.safetensors`, pesos LoRA en formato MLX) mas `adapter_config.json`; no se distribuyen pesos base |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo completo, sino un adaptador de bajo rango (LoRA) en formato MLX. El entrenamiento se hizo con QLoRA sobre el checkpoint de 8 bits `mlx-community/LFM2.5-1.2B-Instruct-8bit`, con rango 16, escala 2.0, aplicado a 16 capas y a los módulos de atención q/k/v/o y a las proyecciones MLP w1/w2/w3. Los tokens del prompt se enmascararon, de modo que la pérdida se calcula únicamente sobre las continuaciones. Las completaciones son alias *teacher-forced* que replican exactamente lo que el servidor puntúa en tiempo de inferencia: claves de opción, `yes`/`no` y dígitos de nivel.

Los datos son exclusivamente alias semilla del profesor oficial de Jev (no plantillas expandidas): 78 ítems de entrenamiento y 126 ejemplos, con un holdout congelado de 17 ítems y 29 ejemplos. El entrenamiento consistió en 64 iteraciones (2 épocas), batch de 4, optimizador AdamW con tasa de aprendizaje 5e-5 y una duración aproximada de 131 segundos en Apple Silicon. El autor documenta además un experimento fallido descartado: plantillas repetitivas de `grow.py` con escala LoRA 20 colapsaron la selección de opción (modal de holdout del 38 %), y esos pesos no son los publicados. No se menciona RLHF ni DPO; el ajuste es supervisado sobre alias.

## Capacidades

- Sesgo de logits para selección de opción: orienta la distribución hacia claves de opción concretas que el servidor lee directamente de los logits.
- Clasificación binaria vía logits: refuerza la emisión de `yes`/`no` como continuaciones puntuables.
- Puntuación por dígito de nivel: favorece la emisión de dígitos de score que el servidor interpreta como nivel.
- Integración con un contrato HTTP fijo: la ruta `POST /v1/systemone` sigue el contrato HTTP de TypeSafe, con el esquema `{choice, probabilities, confidence, noul, score, legend}` ensamblado en código.
- Validez de esquema del 100 % en las evaluaciones reportadas, precisamente porque el modelo no genera JSON.
- No es un modelo de propósito general: no se documentan capacidades de generación libre, razonamiento, código, matemáticas, visión, audio, *tool calling* ni agentes multi-paso.
- Multilingüe: no; la ficha declara únicamente inglés (`en`).

## Casos de uso

- Puntuación de respuestas candidatas en un servidor local: jevons envía un prompt con las opciones permitidas y el adaptador sesga los logits hacia las claves válidas; el servidor calcula después `choice`, `probabilities` y `confidence` en código, lo que evita fallos de parseo en producción.
- Filtro de guardarraíles con decisión binaria: al reforzar `yes`/`no`, el adaptador sirve para decisiones de permitir/bloquear donde solo interesa la probabilidad relativa entre dos tokens, no una respuesta en lenguaje natural.
- Enrutado de consultas con confianza asociada: la pareja `choice` + `confidence` permite derivar consultas a distintos flujos según el nivel de certeza, con la advertencia de que el adaptador no está calibrado (ECE de 0,248 en holdout).
- Evaluación comparativa de preferencias (tipo ranking/RLCD ligero): útil como *reranker* de candidatos predefinidos en un banco de pruebas, siempre que las opciones se suministren como claves puntuables y no como texto libre.
- Prototipado en local sobre Apple Silicon: al ser un adaptador MLX de 1,2B en 8 bits, permite iterar en un portátil Mac sin GPU dedicada ni conexión a servicios externos, útil para equipos que no pueden enviar datos a la nube.
- Reproducción de experimentos de ajuste: el repositorio incluye `hyperparams.json` y `hyperparams.md` con el informe de entrenamiento y las cifras de evaluación, lo que lo convierte en un material de referencia para estudiar cómo el enmascarado de prompt y los alias *teacher-forced* afectan a la precisión modal y a la calibración.
- Servicio de puntuación detrás de un esquema fijo: en pipelines que exigen salida estructurada y auditable, delegar el parseo al servidor elimina la clase de errores de formato más habitual en modelos pequeños.

## Benchmarks y rendimiento

Datos publicados en la model card. Las metricas corresponden a temperatura 1 y sin calibracion. La columna "modal" es la precision modal; "choice / noul / score" son aciertos por campo; ECE y Brier miden calibracion; `acc@>=0.8` es la precision entre las predicciones con confianza igual o superior a 0,8; "schema" es la validez de esquema.

| Split | Run | Modal | choice / noul / score | ECE | Brier | acc@>=0.8 | Schema |
|---|---|---|---|---|---|---|---|
| Full n=155 | Base | 69,7 % | 78,6 / 68,2 / 56,1 | 0,107 | 0,387 | 92,1 % (n=63) | 100 % |
| Full n=155 | LoRA | 83,9 % | 85,7 / 95,5 / 68,3 | 0,077 | 0,193 | 95,9 % (n=97) | 100 % |
| Holdout n=29 | Base | 72,4 % | 76,9 / 87,5 / 50,0 | 0,122 | 0,390 | 100 % (n=11) | 100 % |
| Holdout n=29 | LoRA | 72,4 % | 69,2 / 75,0 / 75,0 | 0,248 | 0,303 | 100 % (n=14) | 100 % |

Advertencia del propio autor: el 83,9 % modal del conjunto completo incluye los 78 ítems de entrenamiento. La métrica honesta de entrega es el **72,4 % modal en holdout, idéntica a la del modelo base** y por debajo del umbral del 90 %. En holdout, ECE empeora de 0,122 a 0,248 y Brier mejora de 0,390 a 0,303. El autor concluye que es un adaptador de *ranking*, no un System One calibrado ni RLCD.

## Requisitos de hardware

- Inferencia en 8 bits (MLX): el modelo base de 1,2B ocupa aproximadamente 1,2-1,5 GB de pesos; el adaptador LoRA de rango 16 añade un coste marginal. Cifra exacta de VRAM/RAM: no disponible.
- Plataforma: MLX es un framework de Apple, por lo que el despliegue documentado requiere Apple Silicon (serie M). No se documenta soporte CUDA, ROCm ni CPU en la model card.
- GPU dedicadas: no disponible; no se describen rutas de despliegue con A100, H100 o RTX 4090 en la información proporcionada.
- GPU de consumo: el modelo cabe en cualquier Mac con memoria unificada suficiente (8 GB o mas, orientativo), pero no se documenta funcionamiento en GPUs de consumo tipo RTX 4090 porque el artefacto es un adaptador MLX.
- Opciones de despliegue documentadas: el propio servidor `jevons serve` (con `--adapter`, `--temperature 1` y `--calibration off`), instalado con `uv sync --extra mlx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Carga del adaptador: se autoloada desde `adapters/lfm25-1.2b-systemone` cuando `adapters.safetensors` está presente; se puede desactivar con `--adapter off`.
- Latencia y throughput: no disponibles. El único dato temporal publicado es de entrenamiento (64 iteraciones, batch 4, unos 131 segundos en Apple Silicon), que no es extrapolable a inferencia.

## Comparativa con modelos similares

No se han identificado en la información proporcionada alternativas públicas comparables con datos de rendimiento. La comparación más significativa es contra el propio modelo base y su versión en 8 bits.

| Modelo | Parametros | Contexto | Formato | Licencia | Relacion |
|---|---|---|---|---|---|
| `gopalanj/jevons-lfm25-1.2b-systemone` (este) | 1,2B base + LoRA rango 16 | no disponible | safetensors (MLX LoRA) | lfm1.0 | Adaptador de ranking para jevons |
| `LiquidAI/LFM2.5-1.2B-Instruct` | 1,2B | no disponible | safetensors | lfm1.0 | Modelo base oficial |
| `mlx-community/LFM2.5-1.2B-Instruct-8bit` | 1,2B (8 bits) | no disponible | MLX 8-bit | lfm1.0 | Base cuantizado usado para entrenar y servir |

Comparativas con otros modelos de tamaño similar (por ejemplo, instructivos de 1B-2B de otras familias) o con otros esquemas de puntuación System One: no disponible.

## Limitaciones y advertencias

- No es la versión oficial de Jev ni un System One calibrado: es una semilla que solo sesga logits hacia los tokens que el servidor lee.
- Ganancia nula en la métrica honesta de holdout: la precisión modal se mantiene en 72,4 % respecto al base y queda por debajo del umbral del 90 % que fija el autor.
- Calibración degradada: ECE en holdout pasa de 0,122 (base) a 0,248 (LoRA). Las probabilidades y la confianza devueltas no deben interpretarse como calibradas.
- Entrenamiento sobre una muestra muy pequeña (78 ítems, 126 ejemplos), lo que limita la generalización y hace probable el sobreajuste a los alias semilla.
- Riesgo de alucinación: no aplica al uso previsto, porque el modelo no genera texto libre, pero cualquier uso fuera del patrón de claves de opción, `yes`/`no` y dígitos de nivel no está validado.
- Idioma: solo inglés. No hay soporte multilingüe declarado, por lo que el castellano no está cubierto.
- Longitud de contexto: no disponible; no se documenta el límite de tokens del modelo base ni su comportamiento con prompts largos.
- Restricciones de licencia: el adaptador y los pesos LFM se rigen por LFM 1.0 (`license: other`). Es necesario obtener y aceptar la licencia de Liquid AI antes de descargar o usar el modelo base o este derivado. Este repositorio no incluye los pesos base. El código del servidor jevons es MIT.
- Restricciones de despliegue: servir a temperatura 1 y con la calibración desactivada; el autor advierte explícitamente de no aplicar un `calibration.json` heredado del modelo base.
- Dependencia de plataforma: MLX implica Apple Silicon; no hay ruta documentada para CUDA ni para GPUs de consumo NVIDIA.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Existe un entrenamiento fallido documentado (plantillas expandidas con escala 20) que colapsa la selección de opción; no debe servirse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gopalanj/jevons-lfm25-1.2b-systemone
- Modelo base oficial: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Base cuantizado en 8 bits para MLX: https://huggingface.co/mlx-community/LFM2.5-1.2B-Instruct-8bit
- Licencia LFM 1.0: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
- Servidor jevons (MIT): https://github.com/gopalanj/jevons
- Contrato HTTP de TypeSafe: https://docs.typesafe.ai/api.md
- Archivos de hiperparámetros y evaluación incluidos en el repositorio: `hyperparams.json`, `hyperparams.md`, `adapter_config.json`, `adapters.safetensors`
- Resultados de busqueda web: no se ha encontrado informacion relevante sobre este modelo; los resultados devueltos corresponden a páginas de soporte de Microsoft y no guardan relación con el modelo.
