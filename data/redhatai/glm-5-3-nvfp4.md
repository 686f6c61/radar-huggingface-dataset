# RedHatAI/GLM-5.3-NVFP4

## Resumen

GLM-5.3-NVFP4 es un checkpoint cuantizado en FP4 de 4 bits publicado por RedHatAI a partir del modelo base zai-org/GLM-5.3, desarrollado por Zhipu AI (Z.ai). Se trata de un modelo de generación de texto con 753.329.940.480 parámetros totales (unos 753.000 millones) y arquitectura declarada como `GlmMoeDsaForCausalLM`, lo que apunta a un transformer de mezcla de expertos (MoE) con atención dispersa. Su repositorio ocupa 464,9 GB en safetensors, por lo que está pensado para despliegue en clústeres con GPUs de centro de datos, no para hardware de consumo.

El problema que resuelve es doble. Por un lado, reducir el coste de memoria y de ancho de banda de un modelo de más de 750.000 millones de parámetros mediante cuantización NVFP4 (formato FP4 E2M1 de NVIDIA con escalado de dos niveles), que cuantiza tanto pesos como activaciones y deja sin cuantizar las capas fuera de los expertos enrutados. Por otro, ofrecer una alternativa con licencia y soporte de Red Hat para servir el modelo con vLLM sobre GPUs Blackwell, manteniendo una recuperación de precisión del 95,5 % al 101,3 % respecto al modelo base en FP8 según los benchmarks publicados.

Es relevante ahora porque ejemplifica la tendencia de publicar checkpoints cuantizados en FP4 nativo para la generación Blackwell, con decodificación especulativa basada en predicción multi-token (MTP) y parser de razonamiento específico (`glm45`). El repositorio es muy reciente (creado el 21 de septiembre de 2026) y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM (transformer con mezcla de expertos y atención dispersa, segun el identificador de arquitectura y el tag `glm_moe_dsa`) |
| Parametros totales | 753.329.940.480 (753,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 69.632 tokens en el ejemplo de despliegue con vLLM de la model card; la ventana nativa del modelo base no se especifica |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1) en pesos y activaciones, con escalado de dos niveles; las capas fuera de los expertos enrutados quedan sin cuantizar. Cache KV en FP8 E4M3 segun el ejemplo de servicio |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | `other`, con nombre de licencia `glm-5.3` |
| Formato de pesos | safetensors con formato compressed-tensors (llm-compressor); repositorio de 464,9 GB |

## Arquitectura y entrenamiento

El modelo es un checkpoint derivado del modelo base zai-org/GLM-5.3 mediante compresión con LLM Compressor, usando una descompresión/compresión por capas de carácter experimental y un esquema NVFP4 calibrado con muestras `perfectblend`. La cuantización NVFP4 emplea pesos y activaciones en FP4 (E2M1) con escalado de dos niveles, y deja en mayor precisión las capas que no pertenecen a los expertos enrutados, presumiblemente para preservar la calidad del modelo. El checkpoint se distribuye en el formato compressed-tensors, consumible directamente por vLLM.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo etapas de RLHF, DPO u otro alineamiento: esos datos corresponden al modelo base y no se detallan en la información proporcionada. La innovación técnica destacable del checkpoint es la combinación de cuantización NVFP4 con decodificación especulativa basada en MTP (predicción multi-token), configurable en vLLM con `{"method":"mtp","num_speculative_tokens":5}`, junto con el parser de razonamiento `glm45` y `--chat-template-content-format string`.

## Capacidades

- Generación de texto conversacional en inglés y chino, con pipeline declarado `text-generation`.
- Razonamiento matemático de alto nivel: 96,69 % en GSM8K Platinum y 96,27 % en MATH-500 (pass@1) en la evaluación publicada.
- Razonamiento científico y de conocimiento experto: 90,40 % en GPQA Diamond (pass@1).
- Razonamiento competitivo: 89,58 % en AIME 2025 (pass@1), con temperaturas de muestreo y múltiples semillas.
- Seguimiento de instrucciones estricto: 85,70 % en IFEval en modalidad prompt-level strict.
- Modo de razonamiento explícito, evidenciado por el uso del parser `glm45` en el stack de servicio.
- Soporte de decodificación especulativa mediante MTP para acelerar la generación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible; la model card declara entrada y salida exclusivamente de texto.

## Casos de uso

- Evaluación y razonamiento matemático verificable: con un 96,27 % en MATH-500 y un 89,58 % en AIME 2025, el modelo es adecuado para sistemas que resuelven problemas con respuesta comprobable, como motores de tutoría matemática o generadores de problemas con solución automática.
- Asistencia en investigación científica: el 90,40 % en GPQA Diamond lo sitúa como candidato para responder preguntas de nivel doctoral en física, química y biología dentro de herramientas internas de laboratorio, siempre con verificación humana de las respuestas.
- Asistentes conversacionales empresariales en inglés y chino: su ventana de 69.632 tokens configurada en el ejemplo de vLLM permite mantener conversaciones multi-turno con documentación extensa adjunta, útil en soporte técnico bilingüe de productos con manuales largos.
- Generación de documentación técnica bilingüe: traducción y redacción de documentación entre inglés y chino manteniendo terminología consistente, aprovechando el entrenamiento declarado en ambos idiomas.
- Cumplimiento estricto de plantillas e instrucciones: con un 85,70 % en IFEval strict, es utilizable en pipelines que exigen formatos de salida rígidos (informes regulatorios, extracción estructurada con campos obligatorios) donde el incumplimiento de formato rompe el proceso posterior.
- Generación de datos sintéticos y destilación: al ser un modelo de razonamiento de gran tamaño, puede producir trazas de razonamiento de alta calidad para entrenar modelos más pequeños, ejecutándose por lotes en un clúster con GPUs Blackwell.
- Investigación en cuantización FP4: sirve como caso de estudio reproducible para medir la pérdida de precisión de NVFP4 frente a FP8 en modelos MoE de gran escala, ya que la model card publica resultados por semilla y recuperación relativa.
- Despliegue de inferencia a gran escala con vLLM: el stack documentado (tensor-parallel-size 4, caché KV FP8, parser glm45, MTP con 5 tokens especulativos) permite integrarlo como backend de una API compatible con endpoints en una infraestructura propia.

## Benchmarks y rendimiento

Resultados publicados en la model card, obtenidos con lighteval sobre un servidor vLLM en 4xB200, con temperatura 1.0, parser de razonamiento `glm45` y caché KV FP8 E4M3. GSM8K, IFEval, MATH-500 y GPQA usaron tres semillas; AIME, ocho.

| Categoria | Benchmark | GLM-5.3-NVFP4 | GLM-5.3 (FP8) | Recuperacion |
|---|---|---|---|---|
| Seguimiento de instrucciones | IFEval (prompt-level strict) | 85,70 % | 89,77 % | 95,5 % |
| Razonamiento | GSM8K Platinum (strict-match) | 96,69 % | 97,52 % | 99,1 % |
| Razonamiento | MATH-500 (pass@1) | 96,27 % | 95,07 % | 101,3 % |
| Razonamiento | AIME 2025 (pass@1) | 89,58 % | 92,50 % | 96,8 % |
| Razonamiento | GPQA Diamond (pass@1) | 90,40 % | 92,42 % | 97,8 % |

Resultados por semilla del checkpoint NVFP4:

| Benchmark | Valores por semilla |
|---|---|
| GSM8K | 96,36 %, 96,86 %, 96,86 % |
| IFEval | 85,95 %, 85,95 %, 85,21 % |
| MATH-500 | 96,00 %, 96,60 %, 96,20 % |
| AIME 2025 | 90,00 %, 86,67 %, 90,00 %, 90,00 %, 93,33 %, 90,00 %, 86,67 %, 90,00 % |
| GPQA Diamond | 90,40 %, 91,41 %, 89,39 % |

## Requisitos de hardware

- El repositorio pesa 464,9 GB en safetensors. Con pesos NVFP4 de 4 bits más los factores de escalado de dos niveles y las capas sin cuantizar, se necesita un nodo con al menos varios cientos de gigabytes de VRAM agregada.
- Configuración validada por el autor: 4 GPU B200 con `--tensor-parallel-size 4`, que es la que se usó para las evaluaciones.
- Alternativas de centro de datos: 8 GPU H100 de 80 GB o H200 de 141 GB con tensor parallelism, siempre que la suma de VRAM cubra pesos, caché KV en FP8 y activaciones; el ajuste exacto no viene documentado.
- No cabe en GPUs de consumo (RTX 4090, RTX 5090, etc.): el tamaño del checkpoint descarta cualquier despliegue en una sola tarjeta consumer, incluso con cuantizaciones más agresivas.
- Opciones de despliegue: vLLM con soporte de compressed-tensors NVFP4. La model card solo documenta vLLM; no se mencionan llama.cpp, Ollama ni TGI, y el formato NVFP4 con escalado de dos niveles limita la portabilidad a otros motores.
- Optimizaciones de servicio recomendadas por el autor: caché KV en `fp8_e4m3`, parser de razonamiento `glm45`, `--chat-template-content-format string`, `--max-model-len 69632` y decodificación especulativa MTP con 5 tokens especulativos.
- Latencia y throughput: no disponible; la model card no publica métricas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Cuantizacion | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| RedHatAI/GLM-5.3-NVFP4 | 753,3 mil millones | NVFP4 (pesos y activaciones) | 69.632 tokens en el ejemplo de servicio | `other` (glm-5.3) | IFEval 85,70 %; GSM8K 96,69 %; MATH-500 96,27 %; AIME 2025 89,58 %; GPQA Diamond 90,40 % |
| zai-org/GLM-5.3 (FP8) | no disponible (mismo modelo base) | FP8 | no disponible | glm-5.3 | IFEval 89,77 %; GSM8K 97,52 %; MATH-500 95,07 %; AIME 2025 92,50 %; GPQA Diamond 92,42 % |

No se dispone de información en la documentación proporcionada sobre otros modelos comparables de la misma categoría (tamaño o tarea) con datos verificables, por lo que la comparación se limita al modelo base en FP8.

## Limitaciones y advertencias

- La licencia es `other` con nombre `glm-5.3`: no se incluye el texto de la licencia en la información disponible, por lo que el uso comercial debe verificarse en el repositorio del modelo base antes de cualquier despliegue en producción.
- La cuantización NVFP4 introduce pérdida de precisión medible: la recuperación frente a FP8 es del 95,5 % en IFEval y del 96,8 % en AIME 2025, es decir, entre 1 y 4 puntos porcentuales por debajo del modelo base en esas tareas.
- Riesgo de alucinación inherente a un modelo de lenguaje generativo; en dominios como GPQA o AIME un 90 % de acierto implica un 10 % de respuestas incorrectas que deben filtrarse.
- Solo se declaran los idiomas inglés y chino. No hay soporte documentado para español ni para otras lenguas, por lo que el rendimiento fuera de `en` y `zh` es incierto.
- La longitud de contexto nativa no se especifica; el valor de 69.632 tokens procede del ejemplo de despliegue, no de una spec oficial, y debe confirmarse contra la configuración del modelo base.
- El formato NVFP4 con escalado de dos niveles y capas parcialmente sin cuantizar está orientado a GPUs Blackwell. En hardware anterior (Hopper, Ampere) el rendimiento y la compatibilidad no están garantizados.
- El repositorio tiene 0 descargas y 0 valoraciones en el momento de la consulta, sin datos de adopción en producción que permitan estimar su estabilidad.
- No hay información publicada sobre sesgos, composición del dataset de entrenamiento ni procesos de alineamiento (RLHF/DPO), lo que dificulta evaluar riesgos de sesgo sistemático.
- El tamaño del checkpoint (464,9 GB) y sus requisitos de VRAM descartan el despliegue en entornos sin clúster de GPUs de centro de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RedHatAI/GLM-5.3-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Lighteval (arnés de evaluación): https://github.com/huggingface/lighteval
- No se han encontrado enlaces adicionales relevantes en la búsqueda web; los resultados devueltos no guardan relación con el modelo.
