# mradermacher/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-i1-GGUF

## Resumen
Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-i1-GGUF es una distribucion de cuantizaciones GGUF (formato i1, basadas en imatrix) del modelo xtools-at/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled, un fine-tuning de Ministral 3B orientado a razonamiento y destilado a partir de un dataset de 50.000 ejemplos limpios (saidutta69/qwen3.8-max-distillation-50k-clean). El autor de las cuantizaciones es mradermacher, un publicador habitual de versiones GGUF de modelos abiertos en Hugging Face. El modelo combina la base Ministral de Mistral con tecnicas de destilacion de razonamiento inspiradas en la familia Qwen.

El interes practico de esta ficha reside en la disponibilidad de pesos cuantizados en un rango muy amplio de tamanos (desde ~1,0 GB en IQ1_S hasta ~2,2 GB en Q4_K_S), lo que permite ejecutar un modelo de 3.429.006.336 parametros en hardware de consumo. La licencia Apache 2.0 facilita su uso comercial sin las restricciones de otras familias de modelos.

Se trata de un modelo unicamente en ingles, con foco en conversacion y razonamiento multi-paso, y sin datos publicados de benchmarks en la informacion disponible. Su utilidad principal es el despliegue local en entornos con recursos limitados donde se prioriza el razonamiento sobre el conocimiento enciclopedico o el multilingüismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Ministral 3B, fine-tuning de razonamiento) |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); safetensors en el modelo base |

## Arquitectura y entrenamiento
El modelo subyacente parte de Ministral 3B, un transformer decoder-only de Mistral AI, y ha sido sometido a un proceso de destilacion de razonamiento supervisado sobre el dataset saidutta69/qwen3.8-max-distillation-50k-clean, compuesto por 50.000 ejemplos limpios generados a partir de un modelo de la familia Qwen 3.8 Max. El objetivo del fine-tuning es transferir patrones de razonamiento explicito (cadenas de pensamiento) a un modelo de menor tamano, siguiendo la estela de destilaciones como las de DeepSeek-R1 hacia modelos pequenos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO. Las cuantizaciones i1 publicadas por mradermacher emplean ficheros imatrix para preservar la calidad en rangos de bits bajos, lo que resulta especialmente relevante en modelos de 3B donde la cuantizacion agresiva degrada rapidamente el rendimiento.

## Capacidades
- Generacion de texto conversacional en ingles con soporte multi-turno.
- Razonamiento explicito multi-paso, heredado de la destilacion de un modelo Qwen orientado a reasoning.
- Resolucion de problemas matematicos y logicos de complejidad media, limitada por el tamano de 3B parametros.
- Generacion de codigo basica a intermedia; no se documenta soporte nativo de tool calling ni function calling.
- No se documenta soporte de vision, audio ni otras modalidades.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documenta modo thinking explicito con tokens especiales ni decodificacion especulativa.

## Casos de uso
- Asistente de razonamiento local en portatiles: con la cuantizacion Q4_K_S (~2,2 GB) el modelo cabe en GPU de consumo con 4-6 GB de VRAM y permite razonamiento multi-paso sin conexion a internet.
- Prototipado de agentes de razonamiento en entornos con recursos limitados: util para validar pipelines de chain-of-thought antes de escalar a modelos mayores, gracias a su baja huella de memoria.
- Educacion y tutoria automatizada en ingles: el modelo puede explicar pasos intermedios de problemas matematicos o logicos, aprovechando el entrenamiento en cadenas de razonamiento.
- Generacion de codigo en entornos embebidos o CI con restricciones de memoria: adecuado para autocompletado y generacion de fragmentos cortos donde no se requiere un modelo grande.
- Investigacion sobre destilacion de razonamiento: sirve como caso de estudio de como se transfieren capacidades de reasoning de modelos grandes a modelos de 3B mediante datasets curados.
- Despliegue en dispositivos edge (Raspberry Pi 5, mini-PC con iGPU): las cuantizaciones IQ2/IQ3 (~1,2-1,8 GB) permiten inferencia en CPU con llama.cpp en hardware de bajo consumo.
- Filtrado y clasificacion de texto con razonamiento breve: tareas donde se necesita justificar una decision en pocos pasos y el coste por inferencia debe ser minimo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: ~1,0-1,5 GB en IQ1/IQ2, ~1,7-2,0 GB en IQ3/Q3, ~2,1-2,2 GB en IQ4/Q4, y aproximadamente 2,5-3,0 GB en Q5/Q6 (estimaciones a partir del tamano de los ficheros GGUF publicados).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones Q4; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o A100/H100 para despliegues de mayor throughput con contexto largo.
- Cabe en GPU de consumo: si, practicamente en todas las GPU modernas (GTX 1650 4 GB en adelante) usando cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama.cpp server o vLLM (este ultimo con soporte GGUF limitado). El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-i1 (este) | 3,43B | no disponible | Apache 2.0 | GGUF i1 | Destilacion de razonamiento sobre Ministral 3B; solo ingles |
| Ministral 3B (base, Mistral AI) | ~3B | no disponible | Mistral Research/Commercial | safetensors, GGUF | Modelo base sin destilacion de razonamiento; licencia mas restrictiva |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Multilingue, contexto documentado, sin foco especifico en reasoning |
| Llama-3.2-3B-Instruct | 3,21B | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | Contexto largo, licencia con restricciones para >700M usuarios |

## Limitaciones y advertencias
- Modelo entrenado y evaluado unicamente en ingles; el rendimiento en castellano u otros idiomas sera previsiblemente pobre.
- Al ser una destilacion de razonamiento sobre una base de 3B, el conocimiento factual es limitado y el riesgo de alucinacion es alto en preguntas enciclopedicas o de actualidad.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de la calidad del fine-tuning frente al modelo base.
- Las cuantizaciones por debajo de Q4 (especialmente IQ1/IQ2) degradan notablemente la coherencia del razonamiento; el propio autor las etiqueta como "for the desperate" o "very low quality".
- No se documenta soporte de tool calling ni function calling; integrarlo en pipelines de agentes requerira tecnicas externas de parsing.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Ministral y del dataset de destilacion antes de un uso comercial a gran escala.
- La longitud de contexto no esta documentada en la model card; asumir valores altos sin verificacion puede provocar degradacion silenciosa.
- El repositorio ocupa 41,6 GB debido a la multiplicidad de cuantizaciones; descargar solo el fichero GGUF necesario.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/xtools-at/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-GGUF
- Dataset de destilacion: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Pagina de resumen del autor: https://hf.tst.eu/model#Ministral-3-3B-Qwen3.8-Max-Reasoning-Distilled-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
