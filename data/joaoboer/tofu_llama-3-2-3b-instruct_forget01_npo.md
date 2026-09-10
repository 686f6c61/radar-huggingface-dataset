# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_NPO

# Ficha de modelo: tofu_Llama-3.2-3B-Instruct_forget01_NPO

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_NPO` es un modelo de lenguaje de 3.212.749.824 parámetros (aproximadamente 3,2 mil millones) derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, al que se le ha aplicado un proceso de desaprendizaje (machine unlearning) sobre el split `forget01` del dataset TOFU mediante el método NPO (Negative Preference Optimization). No es un modelo de propósito general nuevo: es un artefacto de investigación pensado como línea base de desaprendizaje por pesos y como modelo borrador (draft) en el proyecto Speculative-Decoding-Unlearning del propio autor. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que confirma su carácter experimental.

La relevancia del modelo es metodológica. TOFU es un benchmark diseñado para medir hasta qué punto un modelo puede «olvidar» un subconjunto de datos de autoría sintética sin degradar su utilidad general, y NPO es una de las familias de métodos de referencia. Esta ficha permite reproducir y comparar ese tipo de intervención sobre una base conocida (Llama 3.2 3B Instruct), con la configuración de hiperparámetros publicada y las métricas de evaluación de TOFU ya calculadas.

Técnicamente hereda la arquitectura del modelo base: un transformer decoder-only de la familia Llama 3.2, denso (no MoE), con licencia Llama 3.2 y pesos en safetensors. El valor diferencial no está en la arquitectura ni en el entrenamiento base, sino en la intervención de desaprendizaje y en las métricas asociadas, que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), denso |
| Parametros totales | 3.212.749.824 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama-3.2-3B-Instruct declara 128.000 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye pesos sin cuantizar; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible en la model card; el modelo base declara soporte para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | Llama 3.2 (llama3.2) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,4 GB |
| Libreria de referencia | transformers |
| Pipeline declarado | text-generation |
| Dataset de desaprendizaje | locuslab/TOFU (split forget01) |
| Modelo base | open-unlearning/tofu_Llama-3.2-3B-Instruct_full |
| Etiquetas destacadas | unlearning, tofu, NPO, forget01, conversational, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer decoder-only de tipo Llama 3.2 con normalización RMSNorm, atención con Grouped-Query Attention y tokenizador de la familia Llama 3. El modelo no introduce ninguna innovación arquitectónica propia; la intervención se aplica exclusivamente sobre los pesos mediante un procedimiento de desaprendizaje.

El entrenamiento de desaprendizaje se realizó con el framework `open-unlearning` sobre el split `forget01` del dataset TOFU, aplicando NPO (Negative Preference Optimization), un método basado en optimización de preferencias que trata las respuestas del conjunto de olvido como ejemplos negativos. La configuración publicada en `.hydra/config.yaml` es la siguiente: `gamma: 1.0`, `alpha: 2`, `retain_loss_type: NLL`, `beta: 0.1`. Es decir, se combina una pérdida de olvido de tipo NPO con una pérdida de retención calculada como log-verosimilitud negativa (NLL). El autor no documenta en la model card el número de tokens de entrenamiento, la composición exacta del dataset más allá del split de TOFU, ni si hubo fases adicionales de RLHF o DPO para este artefacto. Las salidas de evaluación de TOFU están disponibles en el directorio `evals/` del repositorio.

## Capacidades

- Generación de texto conversacional: al derivar de un modelo Instruct, mantiene el formato de diálogo con roles y plantillas de chat de Llama 3.
- Razonamiento y respuesta a preguntas: conserva parte de la utilidad del modelo base, con una puntuación de `model_utility` de 0,6315 en TOFU.
- Desaprendizaje selectivo: es su función principal; el modelo está entrenado para reducir la probabilidad de generar las respuestas asociadas al split `forget01`.
- Modelo borrador para decodificación especulativa: el autor lo emplea como draft model en el proyecto Speculative-Decoding-Unlearning, lo que implica que se usa para proponer tokens que un modelo mayor verifica.
- Compatibilidad con tooling de inferencia: las etiquetas incluyen `text-generation-inference` y `endpoints_compatible`, por lo que puede servirse con TGI y con endpoints compatibles.
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card).
- Capacidades de agente y razonamiento multi-paso: no disponible (no se documenta; no es un modelo entrenado específicamente para ello).
- Capacidades multilingües: no disponible en la model card; heredadas del modelo base según lo indicado en la tabla de especificaciones.
- Capacidades especiales (modo thinking, visión, audio): no disponible. No hay evidencia de ninguna de ellas; Llama 3.2 3B es un modelo de texto.

## Casos de uso

- Investigación en machine unlearning: el modelo sirve como punto de comparación reproducible frente a otros métodos (gradient ascent, RMU, circuit breakers) aplicados al mismo split `forget01`. Su utilidad está en que la configuración de NPO y las métricas ya están publicadas, lo que permite aislar el efecto del algoritmo.
- Auditoría de privacidad y evaluaciones de membership inference: con métricas como `mia_loss` (0,3563), `mia_min_k` (0,3169) o `privleak` (54,3785) ya calculadas, es un candidato directo para reproducir ataques de inferencia de pertenencia sobre modelos desaprendidos.
- Evaluación de decodificación especulativa: puede emplearse como draft model para medir si el desaprendizaje degrada la tasa de aceptación de tokens frente a un verificador mayor, que es exactamente el escenario del proyecto del autor.
- Docencia y divulgación técnica: sirve para demostrar de forma tangible qué mide TOFU y por qué el desaprendizaje por pesos no equivale a borrado de información, gracias a las métricas de memorización exacta y de calidad de olvido.
- Prototipado de cumplimiento normativo (derecho al olvido): en entornos de investigación se puede usar para estudiar si una intervención de este tipo reduce de forma medible la capacidad de extraer contenido concreto de un dataset de entrenamiento.
- Base para experimentos de post-procesado: al ser un modelo de 3,2 B con pesos en safetensors, es un sujeto manejable para probar cuantización, merging de pesos o nuevas rondas de desaprendizaje sin necesidad de clústeres grandes.
- Generación de texto en prototipos internos: fuera del ámbito de investigación no está pensado para producción, pero técnicamente puede ejecutar tareas de generación de texto en tareas de baja criticidad, siempre que se asuma la pérdida de utilidad derivada del olvido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye la batería de métricas de TOFU, que se reproduce a continuación:

| Metrica | Valor |
|---|---|
| exact_memorization | 0,6290 |
| extraction_strength | 0,0765 |
| forget_Q_A_PARA_Prob | 0,0747 |
| forget_Q_A_gibberish | 0,9057 |
| forget_quality | 0,9188 |
| forget_truth_ratio | 0,6576 |
| mia_loss | 0,3563 |
| mia_min_k | 0,3169 |
| mia_min_k_plus_plus | 0,3181 |
| mia_zlib | 0,3600 |
| model_utility | 0,6315 |
| privleak | 54,3785 |

No se dispone de resultados comparativos del mismo modelo frente a otras variantes de desaprendizaje en la información proporcionada.

## Requisitos de hardware

- VRAM estimada en precisión completa: los pesos en safetensors ocupan 6,4 GB en el repositorio (coherente con bf16/fp16 para 3,21 B de parámetros). En la práctica se recomiendan entre 8 y 10 GB de VRAM contando caché KV y activaciones para contextos moderados; a contextos muy largos la caché KV crece de forma apreciable.
- VRAM estimada en 8 bits: aproximadamente 3,4 GB solo de pesos, unos 5-6 GB en total.
- VRAM estimada en 4 bits: aproximadamente 1,9-2,2 GB de pesos, unos 3-4 GB en total. Requiere cuantizar el modelo, ya que no se distribuyen versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para despliegue servido; RTX 4090, RTX 4080, RTX 3090 o RTX 3060 de 12 GB para inferencia local sin problemas.
- Cabe en GPU de consumo: sí. En bf16 cabe con holgura en cualquier GPU de 12 GB o más; en 4 bits funcionaría en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (librería declarada), vLLM, Text Generation Inference (etiquetado explícitamente como `text-generation-inference`), y endpoints compatibles (`endpoints_compatible`). Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, algo que este repositorio no incluye.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia, tokens por segundo ni resultados de tasa de aceptación en decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Intervencion | Licencia | Estado de publicacion |
|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_NPO | 3,21 B | Desaprendizaje NPO sobre TOFU `forget01` | Llama 3.2 | Pesos safetensors, metricas de TOFU publicadas |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | No disponible en la informacion (misma base declarada) | Ajuste completo sobre TOFU, sin desaprendizaje | Llama 3.2 | Modelo base del anterior |
| Jeesup/tofu_Llama-3.2-3B-Instruct_forget10_NPO_QAT | No disponible | Desaprendizaje NPO sobre TOFU `forget10` con cuantizacion consciente del entrenamiento (QAT) | No disponible | No disponible mas alla del identificador |

La comparación rigurosa con alternativas fuera de la familia TOFU (por ejemplo, otros esquemas de desaprendizaje sobre Llama 3.2 3B) no es posible con los datos disponibles: no se han publicado en la información proporcionada métricas homogéneas para establecerla.

## Limitaciones y advertencias

- Riesgo de fuga de privacidad residual: el valor de `privleak` es 54,3785, lejos del valor ideal cercano a cero según la métrica de TOFU, lo que apunta a que la protección de privacidad lograda es parcial.
- Memorización exacta elevada: `exact_memorization` alcanza 0,6290, un valor alto que indica que el modelo sigue reproduciendo literalmente contenido del conjunto evaluado.
- Desaprendizaje imperfecto: `forget_truth_ratio` es 0,6576 y `forget_Q_A_PARA_Prob` es 0,0747; la combinación sugiere que el olvido no es uniforme entre formulaciones de la misma pregunta.
- Pérdida de utilidad: `model_utility` cae a 0,6315, de modo que el modelo es peor que su base en tareas generales. No debe usarse como sustituto directo de Llama-3.2-3B-Instruct.
- Sesgos conocidos: no disponible. La model card no documenta evaluaciones de sesgo ni de toxicidad para este artefacto, y las del modelo base no se reproducen aquí.
- Riesgo de alucinación: no cuantificado en la información disponible, pero al tratarse de un modelo ajustado con desaprendizaje y con utilidad reducida, la fiabilidad factual es previsiblemente inferior a la del modelo base.
- Limitaciones de contexto e idioma: los valores de contexto e idiomas no están confirmados en la model card de este repositorio y solo pueden inferirse del modelo base.
- Restricciones de licencia: se hereda la licencia Llama 3.2, que impone condiciones de uso comercial, obligaciones de atribución y una política de uso aceptable. Es imprescindible revisar sus términos antes de cualquier uso productivo.
- Madurez: 0 descargas y 0 likes, sin documentación de mantenimiento. Es un artefacto de investigación, no un modelo soportado.
- Ausencia de garantías de calidad: no se publican benchmarks generales, ni mediciones de latencia, ni pruebas de robustez; su uso en producción no está respaldado por evidencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_NPO
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Variante relacionada (forget10, NPO con QAT): https://huggingface.co/Jeesup/tofu_Llama-3.2-3B-Instruct_forget10_NPO_QAT
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Configuracion completa de entrenamiento: `.hydra/config.yaml` en el repositorio del modelo
- Salidas de evaluacion de TOFU: directorio `evals/` en el repositorio del modelo
