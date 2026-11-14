# j-llm/Novel-v4.1-150m-jp

## Resumen

Novel-v4.1-150m-jp es un experimento de investigación publicado por el usuario j-llm sobre el modelo japonés de generación de novelas eightman999/v3v4-novel-150m-ja. No se trata de un modelo estándar de Transformers ni de un adaptador PEFT LoRA: el repositorio distribuye únicamente dos ficheros de diferencias de pesos (`from_original_patch.safetensors` y `routed_adapters.safetensors`) que deben aplicarse sobre el modelo base original, descargado por separado y fijado a una revisión concreta (`ffb2d7af1e1d4e9a08550ab4f22576bdf846c750`). La inferencia requiere un CLI propio (`routed_chat.py`) y no funciona con `AutoModel.from_pretrained` ni con la Inference API de Hugging Face.

El modelo base tiene aproximadamente 150 millones de parámetros, 12 capas, anchura 768, vocabulario de 49.152 tokens y una ventana de contexto de 4.096 tokens. Está entrenado para escritura de novelas en japonés y, según el autor, no está orientado a QA general ni a chat. El experimento añade un enrutador lineal que selecciona entre nueve dominios de corrección de salida (aritmética, conversión de unidades y calendario) y, para entradas generales, recurre a la matriz de salida del sustrato experimental sin editar.

La relevancia del proyecto es metodológica más que de producto: explora la edición de conocimiento sin gradientes (resolución de coeficientes mediante sistemas de ecuaciones y mínimos cuadrados) y la mejora selectiva de dominios con un router condicional. Los resultados publicados son modestos y proceden de un conjunto de evaluación propio de 128 preguntas, no de benchmarks independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base NV1C3); el paquete añade router lineal y matrices de salida por dominio |
| Parametros totales | ~150 M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el paquete distribuye safetensors de diferencias; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | japones (ja) |
| Licencia | cc-by-4.0 en la model card, con etiqueta `upstream-rights-unconfirmed`; el modelo base declara `other` sin permiso explícito de redistribución o uso comercial |
| Formato de pesos | safetensors (diferencias: `from_original_patch.safetensors`, `routed_adapters.safetensors`); requiere el modelo base en formato `transformers/` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 12 capas y anchura 768 con vocabulario de 49.152 tokens, entrenado para generación de novelas en japonés. Sobre él, este paquete aplica una diferencia de pesos (`from_original_patch.safetensors`) que reconstruye un sustrato experimental, más un conjunto de nueve adaptadores de salida y una matriz de decisión de dominio (`routed_adapters.safetensors`). En tiempo de inferencia, un router lineal clasifica la entrada y activa condicionalmente el adaptador correspondiente; las entradas generales usan la matriz de salida del sustrato sin editar.

El entrenamiento no usa gradientes: los coeficientes se obtienen resolviendo sistemas de ecuaciones y mínimos cuadrados sobre pares de entrada/salida. El autor aclara que "sin gradientes" no equivale a "sin entrenamiento", pero tampoco hay búsqueda en tiempo de ejecución, tablas de respuestas ni calculadora. No se documentan el volumen de tokens, la composición del dataset ni fases de RLHF o DPO. La validación local se realizó en Windows con torch 2.6.0, transformers 4.57.1 y tokenizers 0.22.2; el autor advierte que la serie tokenizers 0.23 no maneja correctamente los tokens reservados del modelo base y que no se garantiza la reproducibilidad exacta en otros entornos.

## Capacidades

- Generación de texto narrativo en japonés, orientada a escritura de novelas.
- Respuesta a preguntas de aritmética básica (suma, resta, multiplicación y división) mediante enrutado a adaptadores de dominio.
- Conversión de unidades (cm a mm, kg a g) y preguntas de calendario (días de la semana, años bisiestos) con el mismo mecanismo.
- Enrutado condicional por dominio: las entradas generales no activan adaptadores y usan la salida del sustrato.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo de razonamiento explícito (thinking).
- No mantiene conversaciones con historial: cada entrada se procesa de forma independiente.
- Multilingüismo limitado al japonés.

## Casos de uso

- Investigación sobre edición de conocimiento sin gradientes: el paquete sirve para reproducir y auditar la técnica de resolución de coeficientes por mínimos cuadrados sobre un transformer pequeño, comparando el sustrato sin editar con las versiones enrutadas.
- Estudio de enrutado condicional por dominio: permite analizar cómo un router lineal decide entre adaptadores especializados y la salida general, y medir el coste en degradación de la salida general (32/32 coincidencias en el conjunto de control del autor).
- Experimentos académicos con modelos japoneses de 150 M: útil como banco de pruebas de bajo coste para técnicas de intervención sobre pesos en un modelo de novelas.
- Evaluación de la brecha entre conocimiento editado y conocimiento real: las tablas publicadas (por ejemplo, 1/15 en sumas o 10/14 en años bisiestos) documentan cuánto puede acercarse la edición de pesos a una capacidad funcional.
- Reproducción de resultados en local: el repositorio incluye `evaluation.json`, `summary.json`, `audit.json` y `local_validation.json` para replicar las comprobaciones en una máquina de escritorio, dado el tamaño reducido del modelo.
- Docencia sobre limitaciones de la edición de conocimiento: el caso ilustra por qué un router con 128/128 de precisión de clasificación no implica una tasa de acierto equivalente en las respuestas.
- No es adecuado para atención al cliente, generación de código en producción ni asistentes conversacionales.

## Benchmarks y rendimiento

Los datos proceden de los registros de evaluación incluidos por el autor (`evaluation.json`, `summary.json`) sobre un conjunto propio de 128 preguntas de conocimiento no vistas y 32 preguntas generales. No son benchmarks públicos independientes.

| Comparación | Aciertos en 128 preguntas | Coincidencia con el sustrato en 32 preguntas generales |
|---|---:|---:|
| Sustrato experimental (conocimiento sin editar) | 0/128 (0 %) | 32/32 |
| Versión anterior (escritura permanente) | 22/128 (17,2 %) | 12/32 |
| Versión actual (condicional) | 32/128 (25,0 %) | 32/32 |

| Dominio | Versión anterior | Versión actual |
|---|---:|---:|
| Suma | 0/15 | 1/15 |
| Resta | 0/15 | 0/15 |
| Multiplicación | 0/14 | 0/14 |
| División | 0/14 | 0/14 |
| cm a mm | 10/14 | 11/14 |
| kg a g | 7/14 | 9/14 |
| Horas a minutos | 0/14 | 0/14 |
| Días de la semana | 1/14 | 1/14 |
| Años bisiestos | 4/14 | 10/14 |

| Comparación con LFM (mismas 32 primeras preguntas) | Aciertos |
|---|---:|
| Sustrato experimental | 0/32 |
| Versión anterior | 6/32 |
| Versión actual | 10/32 |
| LiquidAI/LFM3-1.7B-GGUF Q4_K_M | 23/32 |

El autor advierte que la comparación con LFM no es concluyente: difieren tokenizer, cuantización, formato de prompt y método de puntuación; el LFM se ejecutó en CPU con llama.cpp b11960, greedy y límite de 24 tokens, y la verificación no fue ciega. El propio autor afirma que no se ha superado a LFM.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~150 M de parámetros en fp32 el peso ronda los 0,6 GB, y en fp16 unos 0,3 GB, a lo que hay que sumar los ficheros de diferencias y adaptadores.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente por tamaño; el autor no publica requisitos oficiales.
- Cabe en GPU consumer: sí, por el tamaño del modelo base, aunque el paquete no se distribuye en formato listo para llama.cpp ni Ollama.
- Opciones de despliegue: exclusivamente el CLI propio del repositorio (`routed_chat.py` con `apply_base.py`); no es compatible con vLLM, TGI, llama.cpp, Ollama ni la Inference API de Hugging Face.
- Latencia y throughput: no disponibles. La evaluación se hizo con greedy y un límite de 24 tokens por respuesta; el CLI usa 64 por defecto.
- Validación local del autor: Windows, torch 2.6.0, transformers 4.57.1, tokenizers 0.22.2; coincidencia 6/6 con los registros existentes en 3 preguntas de conocimiento y 3 generales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato y despliegue | Rendimiento documentado |
|---|---|---|---|---|---|
| Novel-v4.1-150m-jp (este) | ~150 M | 4.096 | cc-by-4.0 con derechos upstream sin confirmar | safetensors de diferencias + CLI propio | 32/128 en conjunto propio; 10/32 frente a LFM |
| eightman999/v3v4-novel-150m-ja (base) | ~150 M | 4.096 | `other`, sin permiso explícito de redistribución | transformers | No disponible |
| LiquidAI/LFM3-1.7B-GGUF Q4_K_M | 1,7 B | no disponible en la información | no disponible en la información | GGUF, llama.cpp | 23/32 en el mismo subconjunto de 32 preguntas |

La comparación con LFM no es homogénea (tokenizer, cuantización y prompt distintos) y el propio autor no la presenta como una victoria. No se dispone de comparaciones con otros modelos japoneses de tamaño similar.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar el modelo base por separado y aplicar las diferencias con el CLI del repositorio; no funciona con `AutoModel.from_pretrained` ni con la Inference API.
- Los derechos del modelo base no están confirmados: la licencia `other` del upstream no concede explícitamente redistribución ni uso comercial, y la licencia cc-by-4.0 del paquete no resuelve esa restricción. El autor recomienda uso personal y privado hasta confirmar permisos.
- El modelo base se entrenó con datos que incluyen contenido para adultos y puede generar ese tipo de contenido; la model card indica que no debe usarse por menores de 18 años y que no hay entrenamiento adicional de seguridad.
- La etiqueta `not-for-all-audiences` está presente en el repositorio.
- Riesgo elevado de alucinación y de respuestas incorrectas: en el conjunto propio, la tasa de acierto global es del 25 % y hay dominios con 0/15 y 0/14.
- El enrutado clasificó correctamente 128/128 entradas, pero eso no implica acierto en las respuestas; la clasificación de dominio y la corrección factual son cuestiones distintas.
- Sin soporte de historial conversacional: cada entrada es independiente.
- Contexto limitado a 4.096 tokens y únicamente en japonés.
- La reproducibilidad no está garantizada: los hashes de los ficheros guardados difieren entre entornos y el autor solo verificó la coincidencia en su propia máquina.
- No hay benchmarks públicos independientes ni comparación directa con el modelo base original.
- El repositorio no incluye los pesos del modelo base, del LFM ni de la versión anterior; tampoco incluye los directorios `source/` de experimentos pasados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/j-llm/Novel-v4.1-150m-jp
- Modelo base: https://huggingface.co/eightman999/v3v4-novel-150m-ja
- Documento de atribución y licencias de datos: https://huggingface.co/summerAIO/routed-knowledge-improvement-150m-ja/blob/main/ATTRIBUTION.md
- Informe detallado del experimento (referenciado en la model card): `REPORT_ja.md` dentro del repositorio
- Modelo de comparación LiquidAI/LFM3-1.7B-GGUF: no se proporciona URL en la información disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
