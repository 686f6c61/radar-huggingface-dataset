# gbuzhf/Apex-35B-V1.0-Sangreal-ICE

## Resumen

Apex-35B-V1.0-Sangreal-ICE es una colección de cuantizaciones GGUF del modelo multimodal Apex-35B-V1.0, desarrollado por Apex Intelligence, realizadas por el usuario gbuzhf en Hugging Face. El modelo base es un MoE de arquitectura Qwen3.6-35B-A3B con aproximadamente 35,5 mil millones de parámetros totales y unos 3 mil millones activos por token, lo que permite ejecutar un modelo de clase 35B con coste de inferencia de clase 3B. La cuantización emplea una matriz de importancia Sangreal de 10k muestras, recetas ICE 1.6 por tensor y reparación de expertos post-cuantización ICE 2.0.

El repositorio es relevante porque cada archivo conserva la capa MTP (multi-token prediction) para decodificación especulativa, incluye el proyector de visión por separado (en F16 y Q8_0) y lleva incrustada la plantilla de chat Arrow 4.0-apex. La model card publica métricas de fidelidad detalladas (KLD frente al maestro BF16) para cada nivel de cuantización, algo poco habitual y muy útil para elegir el compromiso entre tamaño y calidad. La licencia es Apache-2.0, apta para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6-35B-A3B (qwen35moe): 40 capas, 256 expertos enrutados (8 activos) + experto compartido, atencion hibrida Gated DeltaNet / full attention |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | ~3B (MoE, 8 de 256 expertos + experto compartido) |
| Longitud de contexto | 65.536 tokens (presupuesto de salida maximo por respuesta segun la model card; contexto de entrada no disponible) |
| Tipos de cuantizacion | IQ2_XS, IQ3_XXS + IQ2_S, IQ4_XS + IQ3_S, Q4_K + Q5_K, Q5_K + Q4_K, Q8_0, BF16 (recetas ICE 2.0) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo base en BF16/safetensors) |

## Arquitectura y entrenamiento

La arquitectura es un MoE de 40 capas con 256 expertos enrutados de los que se activan 8 por token, mas un experto compartido, con unos 3B de parametros activos. Combina atencion hibrida Gated DeltaNet (capas lineales tipo SSM/delta rule) con full attention, un diseno que reduce el coste de memoria KV en contextos largos manteniendo atencion completa en parte de las capas. Incluye una cabeza MTP (multi-token prediction) de 1 capa de borrador (`nextn_predict_layers = 1`), utilizable para decodificacion especulativa en llama.cpp, y un proyector de vision (mmproj) para entrada imagen-texto a texto.

Sobre los datos de entrenamiento del modelo base, el pipeline de entrenamiento, numero de tokens o uso de RLHF/DPO: no disponible en la informacion proporcionada. En cuanto a la cuantizacion, gbuzhf uso una matriz de importancia Sangreal generada con 10.000 muestras, recetas ICE 1.6 por tensor y la reparacion de expertos post-cuantizacion ICE 2.0, midiendo la fidelidad de cada nivel contra el maestro BF16 mediante divergencia KL en tres conjuntos (wiki 2K, code 2K y code 16K). La propia model card advierte que el modelo base es inusualmente sensible al redondeo: incluso un Q8_0 plano del original se desvia ~0,015 KLD del BF16 en codigo, una propiedad del modelo base y no de la cuantizacion ICE.

## Capacidades

- Generacion de texto conversacional (pipeline image-text-to-text, etiqueta `conversational`), con apertura `<think>` propia del modelo para razonamiento explicito
- Comprension de imagenes mediante el proyector de vision incluido (mmproj en F16 y Q8_0)
- Razonamiento y generacion de codigo: los conjuntos de evaluacion de fidelidad incluyen codigo en contexto de 16K, lo que indica uso previsto en tareas de codigo con contexto largo
- Presupuesto de salida de hasta 65.536 tokens por respuesta (incluyendo thinking), adecuado para razonamiento extenso multi-paso
- Decodificacion especulativa mediante la capa MTP incluida en todos los archivos (profundidad de borrador 1, en builds de llama.cpp con soporte MTP)
- Soporte de plantilla de chat Arrow 4.0-apex incrustada en todos los archivos (compatible con `--jinja` en llama-server)
- Tool calling / function calling: no disponible en la informacion proporcionada
- Capacidades multilingues: no disponible

## Casos de uso

- Chatbot multimodal local: gracias al mmproj se puede servir un asistente que acepta imagenes y texto con `llama-server --mmproj`, ejecutandose por completo en hardware de consumo con el nivel de 19G o inferior.
- Generacion y revision de codigo en local: la combinacion de ~3B activos (latencia baja) y evaluaciones de fidelidad en codigo con contexto 16K lo hacen adecuado para asistentes de codigo en editores locales o pipelines de revision automatica de pull requests.
- Razonamiento largo multi-paso: el presupuesto de salida de 65.536 tokens (thinking incluido) permite tareas de analisis profundo, planificacion y resolucion de problemas extensos sin truncar la cadena de razonamiento.
- Despliegue eficiente en servidor: con solo 8 expertos activos, el throughput por GPU es alto frente a un denso de 35B, apropiado para servir multiples usuarios concurrentes con vLLM o llama.cpp en una sola GPU de gama alta.
- Aceleracion por decodificacion especulativa: la cabeza MTP integrada permite aumentar tokens/segundo en builds de llama.cpp con soporte MTP, util en aplicaciones interactivas sensibles a la latencia.
- Procesamiento de documentos con imagenes: la capacidad vision + contexto largo permite analizar capturas, diagramas o documentos escaneados junto con su texto.
- Experimentacion con cuantizaciones: la publicacion de la matriz de importancia y las metricas KLD por nivel lo convierte en un buen banco de pruebas para investigar metodos de cuantizacion MoE (ICE 2.0, reparacion de expertos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) del modelo base en la informacion disponible. Si se han publicado metricas de fidelidad de cuantizacion frente al maestro BF16 (KLD mas bajo es mejor; score: BF16 = 100):

| Nivel | Tamano (sin MTP) | wiki 2K KLD | code 2K KLD | code 16K KLD | mismo top-1 (wiki / code / code 16K) | Score |
|---|---|---|---|---|---|---|
| 25G-ICEv2 | 24,53 GB | 0,0618 | 0,0284 | 0,0859 | 91,4 % / 96,2 % / 94,8 % | 94,4 |
| 23G-ICEv2 | 22,52 GB | 0,0796 | 0,0390 | 0,0976 | 90,4 % / 95,4 % / 94,2 % | 93,3 |
| 19G-ICEv2 | 18,47 GB | 0,1331 | 0,0684 | 0,1474 | 87,6 % / 94,0 % / 92,5 % | 90,2 |
| 15G-ICEv2 | 14,51 GB | 0,3067 | 0,1765 | 0,2965 | 81,7 % / 90,4 % / 89,2 % | 81,8 |
| 12G-ICEv2 | 11,90 GB | 0,5248 | 0,2957 | 0,4601 | 76,4 % / 87,9 % / 86,6 % | 74,4 |

Parametros de muestreo recomendados (de la model card del modelo base): temperature 1,0; top_p 0,95; top_k 20; max_tokens 65.536.

## Requisitos de hardware

Estimaciones de VRAM para inferencia (pesos + KV cache; los valores de pesos provienen de la model card):

- Nivel 12G-ICEv2: ~12 GB de pesos; cabe en una RTX 4090 (24 GB) con holgura para contexto y mmproj, e incluso en GPUs de 16 GB con contexto moderado
- Nivel 15G-ICEv2: ~15 GB de pesos; cabe comodamente en una RTX 4090 o RTX 3090
- Nivel 19G-ICEv2: ~18,5 GB de pesos; cabe en una RTX 4090 / 3090 (24 GB) con contexto 65K y mmproj
- Nivel 23G-ICEv2: ~22,5 GB de pesos; justo en una GPU de 24 GB, mejor con descarga parcial a CPU o GPU de 32 GB (por ejemplo RTX 5090)
- Nivel 25G-ICEv2: ~24,5 GB de pesos; GPU de 32 GB o descarga parcial
- Q8_0 (37,8 GB): requiere GPU de 48 GB (A6000, L40S, A100 40G insuficiente) o reparto CPU/GPU
- BF16 (71 GB en 2 archivos): requiere A100/H100 80 GB o multi-GPU / offload

GPU recomendadas: RTX 4090 o RTX 3090 para los niveles 12G-19G; RTX 5090, A6000 o A100 para niveles superiores. En CPU puro, los niveles 12G-15G son viables en equipos con 32 GB de RAM gracias a los ~3B de parametros activos, aunque con latencia notablemente mayor.

Opciones de despliegue: llama.cpp / llama-server (comando documentado con `--mmproj --jinja -c 65536 -fa on`), Ollama y LM Studio (formato GGUF, endpoints_compatible). Soporte de vLLM o TGI: no disponible en la informacion proporcionada (el formato GGUF apunta al ecosistema llama.cpp). Latencia y throughput concretos: no disponibles; la cabeza MTP permite mejorar tokens/segundo mediante decodificacion especulativa en builds compatibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Apex-35B-V1.0 (Sangreal ICE) | 35,5B / ~3B | 65.536 tokens de salida | Si (mmproj) | Apache-2.0 | MTP incluido, atencion hibrida Gated DeltaNet |
| Qwen3-30B-A3B | 30,5B / ~3B | 32.768 (ampliable a 131.072 con YaRN) | No (salvo variantes VL) | Apache-2.0 | Misma familia de arquitectura A3B; ecosistema GGUF muy maduro |
| Qwen3-VL-30B-A3B | 30,5B / ~3B | 256K (según model card de la familia) | Si | Apache-2.0 | Alternativa multimodal MoE de tamano similar |
| GLM-4.5-Air (106B-A12B) | 106B / 12B | 128K | Si | MIT | Mas capacidad pero requisitos de hardware muy superiores |

Comparativa de rendimiento en benchmarks estandar: no disponible (no hay datos publicados en la informacion proporcionada).

## Limitaciones y advertencias

- Sensibilidad a la cuantizacion: la propia model card advierte que el modelo base es inusualmente sensible al redondeo (un Q8_0 plano ya muestra ~0,015 KLD frente al BF16 en codigo); en niveles bajos (12G, 15G) la perdida de fidelidad es sustancial (score 74,4 y 81,8), por lo que para tareas de codigo se recomienda 19G o superior.
- Riesgo de alucinacion: no disponible en la informacion proporcionada; como todo LLM, verificar salidas factuales en produccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no especificados; validar el rendimiento en castellano antes de uso en produccion.
- Existe una variante uncensored (gbuzhf/Apex-35B-V1.0-Uncensored-Sangreal-ICE), lo que sugiere que el modelo base tiene alineacion/seguridad que puede ser limitada; evaluar los filtros de seguridad necesarios segun el caso de uso.
- Contexto: la model card del base indica 65.536 tokens como presupuesto de salida por respuesta (thinking incluido); la longitud de contexto de entrada exacta no esta especificada, y la atencion hibrida Gated DeltaNet puede comportarse de forma distinta a la atencion completa en tareas de recuperacion extrema de contexto.
- Tool calling: no hay informacion que confirme soporte de function calling nativo; la plantilla Arrow 4.0-apex incrustada puede no incluir herramientas.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, aunque hay que respetar los avisos de la licencia.
- La cuantizacion es un trabajo de terceros (gbuzhf), no oficial de Apex Intelligence; los niveles ICE pueden diferir de cuantizaciones oficiales futuras.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/gbuzhf/Apex-35B-V1.0-Sangreal-ICE
- Modelo base: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0
- GGUF oficial BF16 del modelo base: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0-GGUF
- Variante uncensored: https://huggingface.co/gbuzhf/Apex-35B-V1.0-Uncensored-Sangreal-ICE
