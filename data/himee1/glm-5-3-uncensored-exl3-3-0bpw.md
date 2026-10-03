# Himee1/GLM-5.3-UNCENSORED-EXL3-3.0bpw

## Resumen

GLM-5.3-UNCENSORED-EXL3-3.0bpw es una cuantización EXL3 (ExLlamaV3) a unos 3,04 bits por peso del checkpoint en FP8 `dealignai/GLM-5.3-UNCENSORED-FP8`, que a su vez es una edición de pesos —no un fine-tuning— de `zai-org/GLM-5.3`. La publica el usuario Himee1, no está afiliada a dealignai ni a Z.ai y se distribuye bajo licencia MIT. El repositorio es muy reciente y no tiene descargas ni valoraciones registradas.

El modelo base es un transformer de mezcla de expertos (MoE) con 753.000 millones de parámetros totales, 256 expertos enrutados de los que se activan 8 por token más 1 experto compartido, 78 capas más 1 capa MTP (predicción del siguiente token) y atención MLA con indexador disperso DSA. La cuantización ocupa 273 GiB en disco y está pensada para servirse con ExLlamaV3 y TabbyAPI; el autor la ha probado en 8x A100 de 40 GB con reparto por capas.

Su interés práctico es doble: permite ejecutar un modelo de 753B en hardware de 8 GPU de 40 GB con una fidelidad medida frente al FP8 de KL 0,089, y expone la capa MTP como borrador de decodificación especulativa (`draft_mode: mtp`). Se presenta como variante "uncensored", orientada a reducir rechazos, aunque no hay evaluación publicada del efecto de esa edición más allá de su propio README.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GlmMoeDsaForCausalLM`: transformer MoE con atención MLA e indexador disperso DSA, 78 capas + 1 capa MTP |
| Parametros totales | 753.000 millones según la model card; el recuento de safetensors del repo declara 146.311.635.584 (discrepancia sin explicar) |
| Parametros activos | No disponible en cifras; se activan 8 de 256 expertos enrutados más 1 compartido por token |
| Longitud de contexto | 65.536 tokens (`max_seq_len`) en la configuración de TabbyAPI probada; 98.304 tokens de caché compartida (`cache_size`); máximo nativo no disponible |
| Tipos de cuantizacion | EXL3 (ExLlamaV3), 3,04 bpw de media: 3 bpw en expertos enrutados, 4 en MLP densos, 5 en atención y expertos compartidos, 6 en `lm_head`; codebook `mul1` |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3; requiere ExLlamaV3/TabbyAPI) |
| Modelo base | `dealignai/GLM-5.3-UNCENSORED-FP8` (relación: quantized) |
| Tamaño del repositorio | 292,8 GB (273 GiB de pesos) |
| Fecha de publicación | 2 de octubre de 2026 |

## Arquitectura y entrenamiento

Se trata de un modelo de mezcla de expertos con 256 expertos enrutados (8 activos por token) más un experto compartido, repartidos en 78 capas, con atención MLA y un indexador disperso DSA, y una capa adicional de predicción multi-token (MTP). No hay entrenamiento propio en esta ficha: el pipeline es (1) edición de pesos sobre GLM-5.3, documentada en `CRACK_SURGERY.json`, que el autor copia sin modificar del repositorio de origen, y (2) cuantización EXL3. Por tanto, no se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO: no disponibles.

La cuantización se realizó con ExLlamaV3 en el commit `d3739fd`, con la calibración por defecto (250 filas x 2048 tokens) y leyendo directamente el checkpoint FP8. La capa MTP se incluye con sus expertos a 4 bpw y su atención y experto compartido a 6 bpw, sin calibrar, y puede usarse como borrador especulativo. El autor documenta la fidelidad frente al FP8 de origen con `eval/model_diff.py` sobre 20 filas x 2048 tokens de wikitext-2 test: KL(quant ‖ FP8) de 0,089, KL(FP8 ‖ quant) de 0,097, KL por token con mediana 0,021 y p90 0,221, perplejidad 3,440 frente a 3,302 del FP8, y KL mediana de 0,0011 en el 44% de tokens donde el FP8 asigna una probabilidad top mayor o igual a 0,95.

## Capacidades

- Generación de texto y conversación multi-turno (`pipeline_tag: text-generation`).
- Razonamiento: la configuración de serving documentada activa `reasoning: true`, heredado del modelo base GLM-5.3.
- Tool calling y function calling mediante el formato `glm4_7` de TabbyAPI, con el caveat de parseo descrito en limitaciones.
- Uso agéntico evaluado con tau2-bench en los dominios airline y retail (métrica Pass^1).
- Contexto largo: 65.536 tokens en la configuración probada, con 98.304 tokens de caché compartida.
- Decodificación especulativa a través de la capa MTP incluida (`draft_mode: mtp`).
- Edición "uncensored" de pesos orientada a reducir rechazos; el alcance real de la edición no está cuantificado en la información disponible.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Agentes de atención al cliente con tool calling: el modelo fue evaluado con tau2-bench en airline y retail, donde encadena consultas, reservas y comprobaciones de estado mediante herramientas; sus resultados Pass^1 (0,482-0,640) son la referencia disponible para calibrar expectativas.
- Automatización de retail y logística con identificadores: consulta de pedidos, stocks y códigos postales mediante herramientas, siempre que se corrija antes el parser de TabbyAPI para no convertir a entero los parámetros de tipo string.
- Despliegue on-premise de un modelo de 753B: con 273 GiB de pesos cabe en 8x A100 de 40 GB mediante reparto por capas, lo que permite ejecutar un MoE de gran tamaño sin depender de una API externa.
- Investigación en cuantización extrema: el repo incluye métricas reproducibles de divergencia KL y perplejidad frente al FP8, útiles para estudiar el suelo práctico de los 3 bpw en modelos MoE.
- Análisis de documentos extensos: con 65.536 tokens de contexto puede procesar informes, expedientes o repositorios completos en una sola pasada y resumirlos o extraer datos estructurados.
- Aceleración de inferencia mediante decodificación especulativa: la capa MTP actúa como borrador para reducir el coste por token cuando el cuello de botella es la latencia y no la memoria.
- Escenarios de investigación en seguridad y red teaming: al ser una variante "uncensored", permite estudiar comportamientos que los modelos alineados rechazan, asumiendo la responsabilidad de uso derivada de la licencia MIT.
- Sustitución de APIs propietarias por inferencia local en entornos con requisitos de privacidad, siempre que el contenido generado no requiera garantías de filtrado.

## Benchmarks y rendimiento

Fidelidad frente al checkpoint FP8 de origen (`eval/model_diff.py`, 20 filas x 2048 tokens de wikitext-2 test):

| Metrica | Valor |
|---|---|
| KL divergencia (quant ‖ FP8) | 0,089 |
| KL divergencia (FP8 ‖ quant) | 0,097 |
| KL por token, mediana / p90 | 0,021 / 0,221 |
| Perplejidad, quant / FP8 | 3,440 / 3,302 |
| KL mediana donde FP8 top-prob >= 0,95 (44% de tokens) | 0,0011 |

Evaluación agéntica, tau2-bench Pass^1 (temperatura 1,0, top_p 0,95; simulador de usuario y jueces GPT-4.1 a temperatura 0; referencia GLM-5.3 sin editar servido en FP8 por Z.ai vía OpenRouter):

| Dominio | GLM-5.3 FP8 (Z.ai) | Esta cuantizacion | Diferencia |
|---|---|---|---|
| airline (50 tareas x 2 intentos) | 0,710 ± 0,045 | 0,640 ± 0,048 | -0,070 (~1,1 SE) |
| retail (114 tareas) | 0,504 ± 0,033 (2 intentos) | 0,482 ± 0,047 (1 intento) | -0,022 (~0,4 SE) |

Desglose por intento: airline baseline 0,740 / 0,680 frente a 0,600 / 0,680 de la cuantización; retail baseline 0,465 / 0,544 frente a 0,482. El propio autor señala que ninguna diferencia es estadísticamente significativa con estos tamaños de muestra y que el punto de airline debe leerse como posible regresión leve, no como regresión medida. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Pesos: 273 GiB, más la caché KV correspondiente a 65.536 tokens de secuencia y 98.304 tokens de caché compartida configurada (dimensiones de KV no disponibles en la información proporcionada).
- Configuración probada: 8x A100 40GB (320 GB de VRAM total) con reparto por capas (`gpu_split_auto`), MTP activado y TabbyAPI sobre backend exllamav3.
- GPU recomendadas: A100 40GB u 80GB en número suficiente para cubrir los 273 GiB; no se documentan pruebas en H100, aunque el requisito de memoria es el mismo.
- GPU de consumo: no cabe. Ni una RTX 4090 (24 GB) ni una RTX 6000 Ada (48 GB) pueden alojar los pesos; haría falta reparto multi-GPU y offloading a RAM o SSD, con degradación severa de latencia.
- Opciones de despliegue: TabbyAPI con backend exllamav3 y ExLlamaV3. Este repositorio no es utilizable directamente con vLLM, llama.cpp, Ollama ni TGI, que no consumen pesos EXL3; para esos runners habría que recurrir al checkpoint FP8 original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Himee1/GLM-5.3-UNCENSORED-EXL3-3.0bpw (esta ficha) | 753B (MoE, 8+1 expertos activos) | 65.536 tokens probados | EXL3 safetensors, 3,04 bpw | MIT | 273 GiB; requiere ExLlamaV3; fidelidad KL 0,089 frente al FP8 |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753B (mismo MoE) | No disponible | FP8 | MIT | Misma edición de pesos sin cuantizar; mayor huella de memoria |
| zai-org/GLM-5.3 (stock, servido en FP8 por Z.ai) | 753B (mismo MoE) | No disponible | FP8, vía API | No disponible en la informacion | Referencia de los benchmarks tau2-bench; sin edición de pesos |

No se dispone de datos sobre otras alternativas comparables de terceros (tamaño, contexto, rendimiento o licencia), por lo que no se incluyen.

## Limitaciones y advertencias

- Artefacto sin validación externa: 0 descargas y 0 valoraciones en el momento de la consulta, con publicación y actualización el mismo día.
- Discrepancia en el recuento de parámetros: la model card declara 753B, mientras que el recuento de safetensors del repositorio declara 146.311.635.584. Conviene verificar el tamaño real antes de planificar el despliegue.
- Tool calling frágil por defecto: el parser `glm4_5` de TabbyAPI (commit `be74bf0`) aplica JSON-decode a todos los valores sin consultar el esquema de la herramienta, de modo que parámetros que el esquema define como string pero parecen numéricos (IDs de pedido, IDs de producto, códigos postales) llegan a las herramientas como enteros. En tau2-bench retail esto provocó que aproximadamente el 70% de las llamadas a herramientas fallasen. Es imprescindible parchear el parser para conservar como texto crudo los parámetros de tipo string; la evaluación reportada se ejecutó con esa corrección aplicada.
- Riesgo de alucinación: no hay evaluación específica. La cuantización introduce divergencia medible frente al FP8 (KL 0,089; p90 de KL por token 0,221), aunque en el 44% de tokens con alta confianza del FP8 la KL mediana es de solo 0,0011.
- Posible regresión agéntica: la caída de 0,070 en airline (~1,1 SE) no es significativa con 50 tareas y 2 intentos, pero tampoco puede descartarse; la diferencia mezcla la edición de pesos de dealign y esta cuantización, así que no aísla el efecto de ninguna de las dos.
- Capa MTP sin calibrar (expertos 4 bpw, atención y experto compartido 6 bpw): la calidad del borrador especulativo no está medida en la información disponible.
- Idiomas soportados no documentados: no se puede asumir cobertura multilingüe sin verificación propia.
- Edición "uncensored": reduce presumiblemente los rechazos, sin datos publicados sobre sesgos, seguridad o tasas de contenido problemático. La responsabilidad sobre el contenido generado recae en quien despliega el modelo.
- Licencia MIT: permite uso comercial y modificación, pero el autor declara explícitamente que el repositorio no está afiliado a dealignai ni a Z.ai, así que las garantías y el soporte son inexistentes.
- Longitud de contexto nativa no documentada: 65.536 tokens corresponde a la configuración probada, no necesariamente al máximo del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Himee1/GLM-5.3-UNCENSORED-EXL3-3.0bpw
- Modelo base (FP8): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Modelo original: https://huggingface.co/zai-org/GLM-5.3
- ExLlamaV3 (commit de conversión `d3739fd`): no disponible como enlace en la información proporcionada
- TabbyAPI: no disponible como enlace en la información proporcionada
- Paper o blog técnico de GLM-5.3: no disponible en la información proporcionada
- Documento `CRACK_SURGERY.json` con la edición de pesos: incluido en el repositorio, sin enlace directo en la información proporcionada
