# Ikerbilbao/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF de **Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved**, una versión modificada del modelo Qwen3.6-35B-A3B de Alibaba, desarrollada por llmfan46 y posteriormente cuantizada por Ikerbilbao. El modelo base es un transformer de arquitectura MoE (Mixture of Experts) con 35.505 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, con soporte multimodal (imagen y texto) y una ventana de contexto de 262.144 tokens.

La modificación principal consiste en la aplicación de la técnica **Heretic v1.3.0** con una variante de **Magnitude-Preserving Orthogonal Ablation (MPOA)**, que elimina los comportamientos de rechazo y censura del modelo original. Según los datos del autor, se reduce un 88% el número de rechazos (de 83/100 a 10/100) manteniendo una divergencia KL de 0.0015 respecto al modelo original, lo que indica una alteración mínima de las capacidades generales. Además, se preservan los 20 módulos de predicción multi-token (MTP) nativos, lo que permite una generación más rápida y coherente.

La relevancia de este modelo radica en ofrecer una alternativa sin restricciones de contenido para entornos de investigación, desarrollo de asistentes conversacionales o generación creativa, manteniendo las capacidades técnicas del Qwen3.6 original. Al estar disponible en formato GGUF, puede ejecutarse en hardware de consumo mediante llama.cpp, Ollama u otras herramientas compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con atención multimodal |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | ~3.000 millones (3B) por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No especificados (formato GGUF, probablemente Q2_K a Q8_0) |
| Idiomas soportados | No disponible (el modelo base Qwen3.6 es multilingüe, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de arquitectura MoE con 35,5B parámetros totales y 3B activos por token, diseñado para tareas de razonamiento, código, matemáticas y procesamiento multimodal. Incorpora 20 módulos de predicción multi-token (MTP) que permiten predecir varios tokens futuros simultáneamente, mejorando la velocidad de inferencia y la coherencia del texto generado.

La versión "uncensored" se obtuvo aplicando la herramienta **Heretic v1.3.0** con una variante de **MPOA** (Magnitude-Preserving Orthogonal Ablation), una técnica de ablación ortogonal que preserva la magnitud de los pesos. Se intervinieron específicamente los componentes `attn.o_proj`, `attn.out_proj` y `mlp.down_proj` de la capa 40, con parámetros de ablación documentados (direction_index 19.93, pesos máximos y mínimos en cada proyección). El resultado es un modelo que mantiene la calidad general (divergencia KL 0.0015) pero reduce drásticamente los rechazos a peticiones que el modelo original consideraría inapropiadas.

No se dispone de información detallada sobre el dataset de entrenamiento del modelo base ni sobre el proceso de fine-tuning adicional. El autor indica que la modificación se realizó sobre los pesos ya entrenados, sin reentrenamiento.

## Capacidades

- Generación de texto y razonamiento complejo, heredadas del modelo Qwen3.6-35B-A3B.
- Soporte multimodal: acepta entradas de imagen y texto (pipeline `image-text-to-text`).
- Predicción multi-token (MTP) nativa con 20 módulos preservados, lo que acelera la generación y mejora la coherencia.
- Respuesta sin censura: no rechaza peticiones sobre temas sensibles, violencia, sexualidad, etc., que el modelo original bloquearía.
- Mantiene la capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- No se especifica soporte explícito de tool calling o function calling, aunque es probable que el modelo base lo incluya (no confirmado en la documentación disponible).

## Casos de uso

- **Generación creativa sin restricciones**: escritura de ficción, poesía o guiones que aborden temas tabú o controvertidos, donde el modelo original rechazaría la petición. Su baja tasa de rechazo (10/100) permite explorar narrativas complejas sin interrupciones.
- **Investigación en alineación y seguridad de IA**: análisis de cómo responden los modelos sin filtros de seguridad, comparando comportamientos con el modelo original. La divergencia KL de 0.0015 permite aislar el efecto de la ablación.
- **Desarrollo de asistentes conversacionales especializados**: creación de chatbots para entornos donde se requiere abordar temas delicados (apoyo psicológico, educación sexual, asesoramiento legal) sin que el modelo se niegue a responder.
- **Simulación de escenarios adversos**: generación de diálogos o situaciones de crisis para entrenar sistemas de moderación o detección de contenido dañino, aprovechando la capacidad del modelo para producir respuestas sin filtros.
- **Traducción y procesamiento de lenguaje natural**: al ser multilingüe (aunque no se detallan los idiomas), puede utilizarse para traducción automática y análisis de sentimiento en textos que contengan lenguaje explícito o sensible.
- **Prototipado rápido de aplicaciones de IA**: al estar disponible en GGUF, se puede desplegar localmente en hardware de consumo para pruebas de concepto sin depender de APIs externas, con la ventaja de no tener restricciones de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la versión decensored en la información disponible. El autor reporta únicamente dos métricas:

| Metrica | Modelo decensored | Modelo original (Qwen3.6-35B-A3B) |
|---|---|---|
| Divergencia KL | 0.0015 | 0 (por definicion) |
| Tasa de rechazos | 10/100 | 83/100 |

En cuanto a MMLU, la model card del autor muestra resultados del modelo original (83,71% de precisión sobre 7.021 preguntas), pero no se indica si el modelo decensored mantiene ese rendimiento. Dado que la divergencia KL es muy baja, es razonable esperar un rendimiento similar, pero no hay datos confirmados.

## Requisitos de hardware

- **VRAM estimada**: según llmrun.dev, la cuantización Q4_K_M requiere aproximadamente 21,45 GB de VRAM. Cuantizaciones más agresivas (Q2_K, Q3_K) podrían reducir este requisito a ~15-18 GB, mientras que Q8_0 o F16 superarían los 30 GB.
- **GPU recomendadas**: para Q4_K_M, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A5000) es suficiente. Para cuantizaciones más ligeras, una RTX 3060 de 12 GB podría ser viable. En entornos profesionales, A100 (40/80 GB) o H100 permiten ejecutar cuantizaciones altas o el modelo completo en formato safetensors.
- **Hardware de consumo**: sí, cabe en GPUs de gama alta para consumidores (RTX 3090/4090) con cuantización Q4_K_M. También puede ejecutarse en Mac con Apple Silicon (M1 Pro/Max o superior) con suficiente RAM unificada (32 GB o más).
- **Opciones de despliegue**: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, kobold.cpp y otros motores que soporten este formato. También se puede usar con vLLM si se convierte a safetensors, aunque no es el flujo habitual.
- **Latencia y throughput**: no se proporcionan datos específicos. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generación de 30-60 tokens/s, dependiendo de la longitud de contexto y el número de MTPs activos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (original) | 35,5B (3B activos) | 262.144 | Apache 2.0 | safetensors | Con censura, 83% de rechazos |
| Qwen3.6-35B-A3B-uncensored-heretic (este) | 35,5B (3B activos) | 262.144 | Apache 2.0 | GGUF | Sin censura, 10% de rechazos, MTP preservados |
| Qwen3.6-35B-A3B-uncensored-heretic-APEX-GGUF | 35,5B (3B activos) | 262.144 | Apache 2.0 | GGUF | Variante APEX del mismo modelo decensored |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE de ~35B sin censura) en la documentación proporcionada.

## Limitaciones y advertencias

- **Ausencia de filtros de seguridad**: el modelo puede generar contenido dañino, ilegal o éticamente cuestionable. El usuario es responsable del uso que haga de él.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede inventar información, especialmente en dominios especializados. La eliminación de la censura no mejora la veracidad.
- **Calidad no verificada**: no se han publicado benchmarks completos del modelo decensored, por lo que no se puede garantizar que mantenga el rendimiento del original en todas las tareas.
- **Idiomas no especificados**: aunque Qwen3.6 es multilingüe, no se detalla qué idiomas soporta esta versión concreta.
- **Licencia Apache 2.0**: permite uso comercial, pero el usuario debe asumir la responsabilidad legal y ética de las salidas generadas.
- **Limitaciones de contexto**: aunque la ventana es de 262.144 tokens, el rendimiento puede degradarse con contextos muy largos, especialmente en cuantizaciones bajas.

## Enlaces

- Repositorio GGUF: [Ikerbilbao/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-GGUF](https://huggingface.co/Ikerbilbao/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-GGUF)
- Modelo base decensored: [llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved](https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved)
- Modelo original: [Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- Herramienta Heretic: [p-e-w/heretic](https://github.com/p-e-w/heretic)
- Página de hardware (llmrun.dev): [Qwen3.6 35B A3B Uncensored Heretic Native MTP Preserved](https://llmrun.dev/model/llmfan46-qwen3-6-35b-a3b-uncensored-heretic-native-mtp-preserved)
- Página de análisis (thinkllm.dev): [Qwen3.6 35B A3B uncensored heretic Native MTP Preserved](https://thinkllm.dev/models/qwen3-6-35b-a3b-uncensored-heretic-native-mtp-preserved)
