# mradermacher/NeuralShivaFusion-7B-Gradient-ST-GGUF

## Resumen

NeuralShivaFusion-7B-Gradient-ST-GGUF es la distribucion en formato GGUF del modelo NeuralShivaFusion-7B-Gradient-ST, un merge de modelos de 7B publicado por el usuario Kukedlc y cuantizado por mradermacher. El modelo base es un fusion de tres variantes de Neural-Krishna-Multiverse-7b (v1, v2 y v3) generada con mergekit/lazymergekit, una tecnica que combina los pesos de varios modelos afinados para agregar capacidades sin reentrenamiento adicional. El resultado es un modelo de lenguaje de 7.241.732.096 parametros orientado a generacion de texto en ingles.

La relevancia de esta ficha reside en su formato: mradermacher distribuye el modelo en 12 cuantizaciones GGUF (desde Q2_K de 2,8 GB hasta f16 de 14,6 GB), lo que permite ejecutarlo en hardware de consumo mediante llama.cpp u Ollama. No obstante, se trata de un merge comunitario sin model card tecnica detallada, sin benchmarks publicados y sin licencia declarada, lo que limita su uso en produccion sin una evaluacion previa.

La informacion disponible sobre arquitectura interna, datos de entrenamiento y rendimiento es muy escasa: la model card del cuantizador solo documenta el proceso de cuantizacion y remite al modelo base, del que no se aportan especificaciones tecnicas mas alla del numero de parametros y el idioma (ingles).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tipo transformer de 7B, inferido del tamano; sin confirmar) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un merge de pesos generado con mergekit/lazymergekit a partir de tres modelos: Kukedlc/Neural-Krishna-Multiverse-7b, Kukedlc/Neural-Krishna-Multiverse-7b-v2 y Kukedlc/Neural-Krishna-Multiverse-7b-v3. La tecnica de merge combina tensores de los modelos de origen segun alguna estrategia de fusion (no especificada en la informacion disponible, aunque el sufijo "Gradient-ST" sugiere una fusion de tipo gradient o task-arithmetic). No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO; al ser un merge, el modelo hereda las capacidades de sus componentes sin un entrenamiento adicional propio.

La cuantizacion la realiza mradermacher con su pipeline habitual (convert_type: hf, output_tensor_quantised: 1) y produce cuantizaciones estaticas sin imatrix. La model card indica explicitamente que las cuantizaciones ponderadas con imatrix no estan disponibles en el momento de la publicacion. El repositorio ocupa 63,9 GB en total, incluyendo todas las variantes GGUF.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado unicamente con el idioma "en".
- Razonamiento y conversacion general: capacidades heredadas de los modelos Neural-Krishna-Multiverse fusionados, sin documentacion especifica.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta "endpoints_compatible", lo que indica que puede desplegarse en la infraestructura de Inference Endpoints de Hugging Face.

## Casos de uso

- Prototipado local en hardware de consumo: con las cuantizaciones Q4_K_M (4,5 GB) o Q5_K_M (5,2 GB) el modelo puede ejecutarse en GPUs de 8 GB de VRAM o en CPU mediante llama.cpp, lo que lo hace adecuado para experimentar con generacion de texto sin infraestructura dedicada.
- Experimentacion con tecnicas de merge: investigadores interesados en evaluar como se comporta un fusion de tres modelos afinados pueden usar este GGUF para comparar cualitativamente con los modelos de origen antes de invertir en el formato original.
- Generacion de texto creativo en ingles: el modelo puede emplearse para redaccion asistida, lluvia de ideas o generacion de borradores en ingles, aunque sin benchmarks que garanticen calidad frente a alternativas establecidas.
- Despliegue en entornos con recursos limitados: la variante Q2_K (2,8 GB) permite ejecucion en dispositivos con poca memoria, util para demos o pruebas de concepto donde la calidad no es critica.
- Evaluacion comparativa de cuantizaciones: al ofrecer 12 variantes, sirve para medir el impacto de la cuantizacion en la calidad de salida sobre un mismo modelo base, un caso de uso metodologico.
- Base para experimentos de fine-tuning ligero: el formato GGUF no es el adecuado para fine-tuning, pero el modelo base en safetensors (Kukedlc/NeuralShivaFusion-7B-Gradient-ST) puede servir como punto de partida para LoRA en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion): Q2_K ~2,8 GB; Q3_K_M ~3,6 GB; Q4_K_M ~4,5 GB; Q5_K_M ~5,2 GB; Q6_K ~6,0 GB; Q8_0 ~7,8 GB; f16 ~14,6 GB. Anadir margen para el contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB para las cuantizaciones mayores; A100/H100 solo si se busca throughput alto con f16 o Q8_0.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB con Q3_K_S hasta una RTX 4090 con f16. Las cuantizaciones Q4_K_M y Q4_K_S son las recomendadas por el autor por equilibrio velocidad/calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers, vLLM o TGI (sujeto a verificacion de compatibilidad arquitectonica).
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NeuralShivaFusion-7B-Gradient-ST-GGUF | 7,24B | no disponible | no disponible | GGUF | Merge comunitario, solo ingles, sin benchmarks |
| Mistral-7B-Instruct-v0.2 (referencia) | 7,24B | 32k | Apache 2.0 | safetensors, GGUF | Modelo establecido con benchmarks publicos |
| Llama-3.1-8B-Instruct (referencia) | 8,03B | 128k | Llama 3.1 Community | safetensors, GGUF | Contexto largo y licencia definida |
| Qwen2.5-7B-Instruct (referencia) | 7,62B | 32k (128k en variantes) | Apache 2.0 | safetensors, GGUF | Multilingue y con benchmarks publicos |

La comparativa se ofrece como referencia de categoria (modelos de ~7-8B); no se dispone de datos de rendimiento del modelo evaluado para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo base ni del cuantizado, lo que impide confirmar si el uso comercial esta permitido. Es un bloqueante para produccion.
- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones cualitativas que permitan estimar la calidad del merge.
- Modelo solo en ingles: la etiqueta de idioma es "en"; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion: sin evaluacion publicada ni model card del autor original, no puede acotarse la tasa de alucinacion ni la fiabilidad factua.
- Origen comunitario y trazabilidad limitada: el merge lo publica un usuario individual (Kukedlc) sin documentacion de la estrategia de fusion ni de los modelos de origen mas alla de sus nombres.
- Contexto desconocido: se desconoce la ventana de contexto, lo que impide planificar casos de uso con documentos largos.
- Cuantizaciones estaticas sin imatrix: el autor advierte que las variantes ponderadas con imatrix no estan disponibles, por lo que las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar mas la salida de lo habitual.
- Sin senales de adopcion: 52 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/NeuralShivaFusion-7B-Gradient-ST-GGUF
- Modelo base: https://huggingface.co/Kukedlc/NeuralShivaFusion-7B-Gradient-ST
- Componentes del merge: https://huggingface.co/Kukedlc/Neural-Krishna-Multiverse-7b, https://huggingface.co/Kukedlc/Neural-Krishna-Multiverse-7b-v2, https://huggingface.co/Kukedlc/Neural-Krishna-Multiverse-7b-v3
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#NeuralShivaFusion-7B-Gradient-ST-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
