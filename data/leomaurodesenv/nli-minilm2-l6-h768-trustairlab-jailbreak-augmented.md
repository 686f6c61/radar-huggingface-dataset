# leomaurodesenv/nli-MiniLM2-L6-H768-trustairlab-jailbreak-augmented

## Resumen

`leomaurodesenv/nli-MiniLM2-L6-H768-trustairlab-jailbreak-augmented` es un modelo de clasificación de texto (pipeline `text-classification`) publicado por el usuario leomaurodesenv, obtenido por ajuste fino (*fine-tuning*) del cross-encoder `cross-encoder/nli-MiniLM2-L6-H768`. Con 82.119.938 parámetros, es un modelo denso, ligero y de tipo encoder, orientado a tareas de inferencia de relación entre textos (NLI) recicladas aquí hacia la detección de contenido, presumiblemente prompts de tipo *jailbreak*, a juzgar por el sufijo `trustairlab-jailbreak-augmented` del nombre del repositorio.

La model card es la plantilla automática que genera Hugging Face Trainer: no describe el conjunto de datos, las etiquetas de salida ni los usos previstos, y el *model-index* no declara resultados de benchmarks. Los únicos datos medibles publicados son los del propio entrenamiento: una pérdida de evaluación de 0,1594 y una exactitud (*accuracy*) de 0,9470.

Su relevancia práctica es la de un componente de filtrado barato: al tratarse de un encoder de 82 M de parámetros, se puede servir en CPU o en cualquier GPU de consumo con una huella de memoria inferior a 1 GB, lo que lo hace apto como *guardrail* previo a un LLM generativo mucho más costoso. Los contrapesos son importantes: no hay documentación del dataset de entrenamiento, el repositorio acumula 0 descargas y 0 *likes*, y no existe ninguna validación independiente de sus resultados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder tipo transformer (etiqueta `roberta` en Hugging Face), derivada de MiniLM2-L6-H768 (6 capas, dimensión oculta 768); modelo denso |
| Parámetros totales | 82.119.938 (≈82,1 M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible (el repositorio publica pesos en `safetensors` en su precisión original) |
| Idiomas soportados | No disponibles (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (librería `transformers`) |
| Tarea declarada | `text-classification` |
| Modelo base | `cross-encoder/nli-MiniLM2-L6-H768` |
| Autor | leomaurodesenv |
| Fecha de creación / actualización | 2026-09-12 / 2026-09-12 |
| Tamaño del repositorio | 5,6 GB |
| Descargas / *likes* | 0 / 0 |
| Compatibilidad de despliegue | `text-embeddings-inference`, `endpoints_compatible` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del cross-encoder `cross-encoder/nli-MiniLM2-L6-H768`, que a su vez es un transformer encoder compacto de 6 capas y 768 dimensiones ocultas con 82,1 M de parámetros. La etiqueta `roberta` de Hugging Face indica que la implementación emplea la clase `RobertaModel`/`RobertaForSequenceClassification`, aunque el vocabulario y el preentrenamiento proceden de la familia MiniLM. Al ser un cross-encoder, la entrada es un par de secuencias (premisa e hipótesis, o texto y etiqueta) procesadas de forma conjunta, y la salida es una distribución sobre un número de clases que la model card no especifica.

El entrenamiento se realizó con Hugging Face Trainer bajo la configuración declarada: 10 épocas nominales, `learning_rate` 2e-05, `train_batch_size` 8, `eval_batch_size` 8, `gradient_accumulation_steps` 2 (lote efectivo 16), semilla 42, optimizador `adamw_torch_fused` con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 50 pasos de *warmup*. Con 4240 pasos por época y un lote efectivo de 16, cada época procesa aproximadamente 67.840 ejemplos; la tabla publicada se detiene en la época 7 (paso 29.680), pese a que el campo `num_epochs` indica 10. El conjunto de datos aparece literalmente como "unknown dataset" en la model card, y el sufijo del nombre sugiere un corpus aumentado de prompts de *jailbreak* vinculado a TrustAIRLab, algo que el autor no confirma en ningún momento. No consta uso de RLHF, DPO ni ninguna innovación técnica adicional.

## Capacidades

- Clasificación de texto sobre pares de secuencias (cross-encoding): asigna una clase a la combinación de dos entradas, o a una entrada frente a un conjunto de etiquetas.
- Detección de prompts maliciosos o de evasión: por el nombre del repositorio, el ajuste se orienta a identificar intentos de *jailbreak* o de elusión de políticas en entradas de usuario.
- Inferencia de relación textual (NLI) heredada del modelo base: el preentrenamiento original de `cross-encoder/nli-MiniLM2-L6-H768` se basa en *Natural Language Inference* (implicación, neutralidad, contradicción).
- Puntuación por clase: al ser un modelo de clasificación, puede devolver probabilidades por etiqueta, lo que permite fijar umbrales de decisión ajustables en producción.
- *Tool calling* y *function calling*: no soportados (no es un modelo generativo).
- Agentes y razonamiento multi-paso: no soportados.
- Capacidades multilingües: no declaradas; no se especifican idiomas en la model card.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- Eficiencia de despliegue: compatible con `text-embeddings-inference` y con *endpoints* compatibles con la API de Hugging Face.

## Casos de uso

- Filtrado previo (*guardrail*) en APIs de LLM: cada prompt entrante se clasifica con este modelo antes de reenviarlo al modelo generativo; si se supera el umbral de riesgo, se bloquea o se deriva a revisión. El coste por petición es mínimo gracias a sus 82 M de parámetros.
- Moderación de contenido en chatbots de atención al cliente: clasificar los mensajes de usuario en conversaciones multi-turno para detectar intentos de manipulación del asistente y registrar la tasa de intentos por sesión.
- Curación y etiquetado de corpus de seguridad: usar el modelo como anotador automático de grandes volúmenes de logs o de datasets de *red teaming*, reduciendo el trabajo manual de etiquetado antes de una revisión humana.
- Investigación en seguridad de LLM: medir de forma cuantitativa cómo evoluciona la proporción de intentos de *jailbreak* a lo largo del tiempo en un servicio, usando la salida probabilística del clasificador como serie temporal.
- Auditoría retrospectiva de logs: reprocesar históricos de conversaciones ya almacenados para localizar interacciones que pasaron los filtros existentes y caracterizar patrones de evasión.
- Protección de pipelines RAG: filtrar las consultas del usuario antes de la fase de recuperación, evitando que instrucciones maliciosas alcancen el índice vectorial o los documentos recuperados.
- Componente de bajo coste en despliegues en el borde (*edge*): al caber en CPU y en menos de 1 GB de memoria, permite ejecutar el filtrado en el propio dispositivo sin depender de servicios externos.
- Clasificación por lotes en *data pipelines*: integrado vía `transformers` o `text-embeddings-inference`, puede puntuar miles de ejemplos por lote en un único proceso, sin necesidad de GPU.

## Benchmarks y rendimiento

El *model-index* del repositorio declara una lista de resultados vacía, por lo que no hay benchmarks comparables (MMLU, GLUE, etc.). Los únicos datos disponibles son las métricas de evaluación del propio entrenamiento, tomadas de la model card:

| Métrica (evaluación declarada) | Valor |
|---|---|
| Pérdida (*loss*) | 0,1594 |
| Exactitud (*accuracy*) | 0,9470 |

Evolución publicada durante el entrenamiento:

| Época | Paso | Pérdida de entrenamiento | Pérdida de validación | Exactitud |
|:---:|:---:|:---:|:---:|:---:|
| 1.0 | 4240 | 0,5974 | 0,2198 | 0,9196 |
| 2.0 | 8480 | 0,2674 | 0,1806 | 0,9361 |
| 3.0 | 12720 | 0,1133 | 0,1781 | 0,9420 |
| 4.0 | 16960 | 0,3056 | 0,1597 | 0,9469 |
| 5.0 | 21200 | 0,1124 | 0,1669 | 0,9516 |
| 6.0 | 25440 | 0,1272 | 0,1770 | 0,9518 |
| 7.0 | 29680 | 0,0356 | 0,1679 | 0,9547 |

Estos números proceden exclusivamente del autor y no han sido verificados de forma independiente. Además, la métrica final declarada (pérdida 0,1594, exactitud 0,9470) no coincide exactamente con ninguna fila de la tabla de épocas: la pérdida final es inferior a la de cualquier época registrada, mientras que la exactitud final es inferior a la de las épocas 5, 6 y 7.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 165 MB en FP16/BF16 y unos 330 MB en FP32, calculados a partir de los 82,1 M de parámetros. Sumando activaciones y sobrecarga del *runtime* de PyTorch, el consumo realista se sitúa en torno a 0,5-1 GB.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM; el modelo cabe con holgura en GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4060, T4, L4, A10, A100 y H100. No requiere GPU de gama alta.
- Ejecución en CPU: viable para tráfico moderado, dado el reducido número de parámetros y la ausencia de generación autorregresiva.
- GPU de consumo: sí, cabe en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con la clase `AutoModelForSequenceClassification`, `text-embeddings-inference` (etiqueta declarada en el repositorio), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), exportación a ONNX Runtime o TorchScript para inferencia optimizada, y contenedores Docker con FastAPI o Triton. Los servidores orientados a modelos generativos (vLLM, TGI en modo generación) no son la vía adecuada para un cross-encoder de clasificación.
- Latencia y *throughput*: no disponibles; el autor no publica mediciones y no hay datos independientes.

## Comparativa con modelos similares

Los resultados de la búsqueda web no aportaron ninguna comparativa verificable, y la model card no incluye benchmarks frente a alternativas. Únicamente puede compararse con su modelo base:

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `leomaurodesenv/nli-MiniLM2-L6-H768-trustairlab-jailbreak-augmented` | 82,1 M | Clasificación de texto (fine-tune específico, presumiblemente detección de *jailbreak*) | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| `cross-encoder/nli-MiniLM2-L6-H768` (base) | Misma arquitectura MiniLM2-L6-H768 | Cross-encoder de NLI | No disponible | No disponible en la información proporcionada | Hugging Face |
| Otras alternativas | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para comparar con otros clasificadores de seguridad de prompts: la model card no reporta comparaciones y la búsqueda web no devolvió resultados relevantes.

## Limitaciones y advertencias

- La model card es la plantilla automática de Trainer sin revisar: incluye secciones "More information needed" y reconoce explícitamente que el conjunto de datos de entrenamiento es desconocido.
- No se documentan las etiquetas de salida ni el número de clases, por lo que la interpretación de la salida del modelo requiere inspeccionar la configuración del repositorio antes de usarlo.
- Riesgo de sobreajuste: en la época 7 la pérdida de entrenamiento cae a 0,0356 mientras la de validación se mantiene en 0,1679, una brecha notable. Además, el campo `num_epochs` indica 10 épocas pero solo se publican 7, y las métricas finales declaradas no coinciden con ninguna fila de la tabla.
- La exactitud de 0,9470 está medida sobre un conjunto de evaluación no descrito, sin información sobre su tamaño, composición, equilibrio de clases ni procedencia. No es un dato extrapolable a tráfico real.
- Sesgos conocidos: no disponibles. El modelo hereda los sesgos del corpus de preentrenamiento del modelo base y los del dataset de ajuste, que no se documenta.
- Alucinación: al ser un clasificador, no genera texto, pero puede producir falsos positivos y falsos negativos con una confianza alta, especialmente ante prompts que difieran de la distribución de entrenamiento.
- Idioma: no se declaran idiomas soportados; el rendimiento en castellano o en otros idiomas distintos del inglés no está documentado y probablemente sea inferior si el corpus de ajuste era monolingüe.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique los cambios. No obstante, el autor no ofrece ninguna garantía sobre el comportamiento del modelo y la licencia del modelo base debe verificarse por separado.
- Adopción nula: 0 descargas y 0 *likes* implican ausencia de validación por parte de la comunidad y de informes de errores.
- El repositorio ocupa 5,6 GB, muy por encima de los ~330 MB que requerirían los pesos en FP32, lo que sugiere la presencia de *checkpoints* intermedios u otros artefactos; conviene revisar el contenido antes de descargarlo íntegro.
- Para cualquier uso en producción se recomienda validar el modelo con un conjunto propio, representativo del tráfico previsto, y calibrar el umbral de decisión antes de integrarlo como *guardrail*.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leomaurodesenv/nli-MiniLM2-L6-H768-trustairlab-jailbreak-augmented
- Modelo base: https://huggingface.co/cross-encoder/nli-MiniLM2-L6-H768
- Búsqueda web: no se encontró ningún resultado relevante sobre este modelo, su dataset o su evaluación; los enlaces devueltos correspondían a páginas de citas diarias sin relación con el contenido solicitado.
- Paper, blog, repositorio o demo adicionales: no disponibles.
