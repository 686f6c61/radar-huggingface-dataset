# leomaurodesenv/nli-MiniLM2-L6-H768-jailbreakv-28k-augmented

## Resumen

El modelo `leomaurodesenv/nli-MiniLM2-L6-H768-jailbreakv-28k-augmented` es un ajuste fino (fine-tune) del cross-encoder `cross-encoder/nli-MiniLM2-L6-H768`, publicado por el usuario leomaurodesenv en HuggingFace. Se trata de un clasificador de texto de 82.119.938 parámetros (dato extraído de los pesos en safetensors), construido sobre un encoder tipo RoBERTa y pensado para la tarea de `text-classification`, no para generación de texto.

El nombre del repositorio sugiere que el ajuste se ha realizado sobre una versión aumentada del conjunto JailbreakV-28K, orientada a la detección de prompts de jailbreak. Sin embargo, la model card no documenta el conjunto de datos: la sección de descripción indica literalmente "More information needed" y el propio entrenador lo etiqueta como "unknown dataset". Por tanto, el único dato verificable del autor es el rendimiento declarado sobre su conjunto de evaluación: pérdida 0,0053 y accuracy 0,9982.

Su relevancia práctica radica en el tamaño: con 82 millones de parámetros y licencia Apache-2.0, es un candidato a guardrail de entrada en pipelines de LLM que necesita baja latencia y coste mínimo, ejecutable incluso en CPU. Ahora bien, la ausencia de documentación sobre datos, etiquetas, idiomas y protocolo de evaluación limita seriamente su uso en producción sin una validación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (backbone MiniLM-L6-H768 de tipo cross-encoder, según las etiquetas del repositorio y el modelo base) |
| Parámetros totales | 82.119.938 (dato real de safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantización | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (carga mediante la librería transformers) |
| Tarea (pipeline) | text-classification |
| Modelo base | cross-encoder/nli-MiniLM2-L6-H768 |
| Tamaño del repositorio | 3,3 GB |
| Descargas / likes | 31 descargas, 1 like |
| Fecha de creación | 14 de septiembre de 2026 |
| Última actualización | 14 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder transformer de tipo RoBERTa. La nomenclatura del backbone (L6-H768) indica 6 capas y una dimensión oculta de 768, lo que es coherente con el recuento de 82,1 millones de parámetros publicado. Al tratarse de un cross-encoder, el modelo procesa pares de secuencias de forma conjunta en lugar de generar embeddings independientes, y el modelo base está planteado para inferencia de lenguaje natural (NLI). El número exacto de etiquetas de salida de este ajuste no está documentado en la ficha.

En cuanto al entrenamiento, la model card sí detalla los hiperparámetros: 10 épocas, learning rate 2e-05, scheduler lineal con 50 pasos de warmup, batch por dispositivo de 8 con 2 pasos de acumulación de gradiente (batch efectivo 16), optimizador `adamw_torch_fused` con betas (0,9; 0,999) y épsilon 1e-08, y semilla 42. El entrenamiento se detuvo en el paso 78.400, lo que equivale a 7.840 pasos por época y, con batch efectivo 16, del orden de 125.000 ejemplos por época (cálculo derivado de los datos de la ficha). El autor no documenta la composición del dataset, si hubo RLHF/DPO ni ninguna innovación técnica adicional.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, orientado a asignar una o varias etiquetas a una secuencia de entrada.
- Detección de prompts maliciosos: por el nombre del repositorio, el ajuste apunta a la detección de jailbreaks sobre una variante aumentada de JailbreakV-28K.
- Puntuación de pares de secuencias: al derivar de un cross-encoder de NLI, la arquitectura está diseñada para codificar dos textos conjuntamente; no confirmado para este fine-tune concreto.
- No dispone de capacidades generativas: no produce texto, no razona paso a paso y no puede usarse como LLM.
- Soporte de tool calling / function calling: no, no aplica a un clasificador de 82 millones de parámetros.
- Soporte de agentes y razonamiento multi-paso: no, no aplica.
- Capacidades multilingües: no disponibles, no documentadas.
- Capacidades especiales (modo thinking, visión, audio): ninguna documentada.

## Casos de uso

- Guardrail de entrada en aplicaciones LLM: colocar el clasificador delante del modelo generativo para filtrar prompts potencialmente maliciosos antes de gastar tokens. Su tamaño de 82 millones de parámetros permite ejecutarlo en CPU con latencia baja dentro de la misma petición.
- Moderación de contenido en chatbots: clasificar los mensajes entrantes de los usuarios y derivar a un flujo restringido o a revisión humana los que superen un umbral de riesgo.
- Etiquetado masivo de corpus de ataques: procesar en lote grandes colecciones de prompts (por ejemplo, logs históricos) para construir un conjunto etiquetado de intentos de jailbreak, aprovechando el alto throughput esperable de un modelo de este tamaño.
- Red teaming y evaluación de robustez: usar el clasificador como primera línea de medida automática al probar variantes de ataques (paráfrasis, codificaciones, cambio de tono) contra un sistema objetivo, aceptando que la generalización fuera del formato de entrenamiento no está validada.
- Puerta de seguridad en pipelines RAG y de agentes: filtrar tanto las entradas del usuario como contenido recuperado o devuelto por herramientas antes de que llegue al modelo principal.
- Filtrado previo en evaluación automática de modelos: descartar prompts de un banco de pruebas que son intentos de jailbreak, para no contaminar métricas de calidad o de seguridad.
- Investigación académica sobre seguridad de LLM: como baseline ligero y reproducible (licencia Apache-2.0) frente a guardrails basados en LLM de miles de millones de parámetros, útil para comparar coste frente a precisión.
- Clasificación en tiempo real en despliegues edge: al caber en memoria muy reducida, permite integrar moderación en dispositivos sin GPU o en funciones serverless con arranque en frío corto.

## Benchmarks y rendimiento

El model-index del repositorio está vacío: el autor no ha publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes para clasificación de jailbreaks). El único dato disponible es la evolución del entrenamiento sobre el conjunto de validación propio, con una accuracy final de 0,9982 y una pérdida de 0,0053 en la décima época.

| Época | Paso | Pérdida de entrenamiento | Pérdida de validación | Accuracy |
|---|---|---|---|---|
| 1,0 | 7.840 | 0,0003 | 0,0174 | 0,9949 |
| 2,0 | 15.680 | 0,0004 | 0,0132 | 0,9966 |
| 3,0 | 23.520 | 0,0167 | 0,0096 | 0,9972 |
| 4,0 | 31.360 | 0,0033 | 0,0111 | 0,9968 |
| 5,0 | 39.200 | 0,0702 | 0,0081 | 0,9976 |
| 6,0 | 47.040 | 0,0036 | 0,0091 | 0,9976 |
| 7,0 | 54.880 | 0,0104 | 0,0075 | 0,9978 |
| 8,0 | 62.720 | 0,0000 | 0,0066 | 0,9979 |
| 9,0 | 70.560 | 0,0120 | 0,0054 | 0,9981 |
| 10,0 | 78.400 | 0,0163 | 0,0053 | 0,9982 |

Estos valores proceden del conjunto de validación definido por el propio autor, cuya composición, tamaño y origen no se documentan, por lo que no son directamente comparables con resultados publicados de otros detectores de jailbreak.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 82,1 millones de parámetros): en FP32, unos 330 MB; en FP16/BF16, unos 165 MB; en INT8, unos 80 MB; en INT4, unos 40 MB. Son estimaciones de pesos, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: cualquiera con al menos 1 GB de memoria libre es suficiente. Una RTX 3060, RTX 4090, T4, L4 o A100 están sobradamente dimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU y en CPU. El repositorio ocupa 3,3 GB, presumiblemente por incluir checkpoints intermedios o estados del optimizador, no por el tamaño de los pesos finales.
- Opciones de despliegue: pipeline de `transformers` (librería declarada), Text Embeddings Inference (etiqueta `text-embeddings-inference` del repositorio), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), exportación a ONNX Runtime o TorchScript y servicio propio con FastAPI. vLLM o TGI son posibles pero desproporcionados para un clasificador de este tamaño.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento declarado |
|---|---|---|---|---|
| nli-MiniLM2-L6-H768-jailbreakv-28k-augmented (este modelo) | 82,1 M | no disponible | apache-2.0 | accuracy 0,9982 y pérdida 0,0053 en su conjunto de evaluación propio |
| cross-encoder/nli-MiniLM2-L6-H768 (modelo base) | no disponible | no disponible | no disponible | no disponible |
| Otros clasificadores de jailbreak basados en encoder (por ejemplo, variantes DeBERTa o mDeBERTa) | no disponible | no disponible | no disponible | no disponible |
| Guardrails generativos basados en LLM (por ejemplo, familias tipo Llama Guard o ShieldGemma) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados en la información proporcionada para completar una comparación cuantitativa con alternativas. Cualitativamente, la diferencia principal frente a los guardrails basados en LLM es el orden de magnitud del tamaño: 82 millones de parámetros frente a modelos de miles de millones, lo que se traduce en un coste de inferencia y una latencia muy inferiores, a costa de una capacidad de generalización presumiblemente menor y no medida.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada sin completar: descripción, usos previstos, limitaciones y datos de entrenamiento figuran como "More information needed".
- El conjunto de datos se denomina "unknown dataset" en la propia ficha; el nombre del repositorio sugiere JailbreakV-28K aumentado, pero no está confirmado ni documentado.
- La accuracy de 0,9982 no es verificable: se desconoce el tamaño, la composición y el origen del conjunto de evaluación, así como el número y el significado de las etiquetas.
- Señales de posible sobreajuste: la pérdida de entrenamiento cae a 0,0003 ya en la primera época y se mantiene muy baja durante diez épocas, mientras la pérdida de validación es entre uno y dos órdenes de magnitud superior. La generalización a ataques no vistos no está medida.
- Sesgo de dominio: al entrenarse sobre un corpus concreto de jailbreaks (presumiblemente en inglés y con un formato característico), es probable que falle ante ataques en otros idiomas, con otras codificaciones o con estilos alejados del corpus original.
- Riesgo de falsos positivos y falsos negativos: no se publica matriz de confusión, precisión, recall ni umbral de decisión recomendado, datos imprescindibles para calibrar un guardrail en producción.
- Probabilidades no calibradas: no se documenta ningún proceso de calibración de la salida del clasificador.
- Sesgos sociales o demográficos: no documentados ni evaluados.
- Idiomas soportados: no disponibles; no se puede asumir un comportamiento multilingüe.
- Licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial, pero la licencia y las condiciones del conjunto de datos de entrenamiento no se especifican en la ficha, por lo que conviene verificar ese extremo antes de un uso comercial.
- Compatibilidad: el entrenamiento se realizó con transformers 5.2.0, PyTorch 2.10.0+cu128, datasets 4.5.0 y tokenizers 0.22.2; la compatibilidad con versiones anteriores de la librería no está garantizada.
- Validación comunitaria mínima: 31 descargas y 1 like en el momento de redactar esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leomaurodesenv/nli-MiniLM2-L6-H768-jailbreakv-28k-augmented
- Modelo base: https://huggingface.co/cross-encoder/nli-MiniLM2-L6-H768
- Papers, blogs, repositorios o demos adicionales: no disponibles. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente definiciones de diccionario del término inglés "articulate", sin relación con el modelo).
