# nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-Base-BF16

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-Base-BF16 es el checkpoint base vision-lenguaje de la familia Nemotron 3.5 Super, desarrollado por NVIDIA Corporation. Se trata de un modelo de pesos abiertos con 124.453.395.974 parametros totales y 12B parametros activos por token, construido sobre una arquitectura hibrida que combina capas Mamba-2, capas de atencion y capas Mixture-of-Experts, a la que se anade un codificador visual C-RADIO y un conector vision-lenguaje. Soporta ventanas de contexto de hasta 1M tokens e incorpora Multi-Token Prediction (MTP), que habilita decodificacion especulativa nativa.

El modelo no es un asistente post-entrenado, sino un punto de partida para entrenamiento continuado, adaptacion de dominio y desarrollo de modelos vision-lenguaje personalizados mediante SFT, RL o destilacion. El backbone de lenguaje se inicializa desde Nemotron 3 Super Base y se entrena adicionalmente por destilacion desde Nemotron 3 Ultra Base, con pre-entrenamiento continuado en lenguas indicas, entrenamiento de contexto largo y mid-training orientado a ingenieria de software.

Su relevancia actual reside en tres factores: es uno de los pocos modelos abiertos que combina vision, contexto de 1M tokens y una relacion de activacion de aproximadamente 10:1 (120B totales / 12B activos), lo que reduce el coste de computo por token respecto a un denso equivalente; se publica junto con los datasets de pre-entrenamiento y un informe tecnico; y su licencia OpenMDW 1.1 permite uso comercial, lo que facilita su adopcion como base para productos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-2 + Transformer con Mixture-of-Experts (MoE) y Multi-Token Prediction (MTP); codificador visual C-RADIO y conector vision-lenguaje |
| Parametros totales | 124.453.395.974 (aproximadamente 120B) |
| Parametros activos | 12B por token (A12B) |
| Longitud de contexto | Hasta 1.000.000 tokens (1M) |
| Tipos de cuantizacion | BF16 (bfloat16) en este checkpoint; existe una release NVFP4 del modelo post-entrenado de la misma familia. No se documentan GGUF ni otras cuantizaciones en la informacion disponible |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW 1.1 (license: other, license_name: openmdw-1.1) |
| Formato de pesos | safetensors (repo de 248,9 GB), requiere transformers con custom_code |
| Desarrollador | NVIDIA Corporation |
| Pipeline | image-text-to-text |
| Expertos enrutados | 512 expertos enrutados por capa MoE |
| Fecha de publicacion | 15/10/2026 en Hugging Face |

## Arquitectura y entrenamiento

La red es un MoE hibrido al estilo Nemotron-H: intercala capas Mamba-2 (modelo de espacio de estados) con capas de atencion y capas MoE de 512 expertos enrutados, mas un cabezal de Multi-Token Prediction que permite decodificacion especulativa nativa, es decir, generar y verificar varios tokens por paso sin un modelo draft externo. La entrada visual se procesa con un codificador C-RADIO seguido de un conector que proyecta las representaciones al espacio del backbone de lenguaje. Con 124,5B parametros totales y 12B activos, el coste de computo por token se aproxima al de un modelo denso de 12B, mientras que el requisito de memoria es el de un modelo de 120B.

El backbone de lenguaje se inicializa desde Nemotron 3 Super Base y se refina por destilacion desde Nemotron 3 Ultra Base. Sobre esa base, NVIDIA aplica pre-entrenamiento continuado en lenguas indicas, una fase de entrenamiento de contexto largo orientada a alcanzar 1M tokens y un mid-training especifico de ingenieria de software. Los datos de pre-entrenamiento se publican como nvidia/nemotron-pre-training-datasets. Al ser un checkpoint base, no consta que se hayan aplicado fases de RLHF, DPO o cualquier otra alineacion por preferencias; la informacion disponible tampoco detalla el volumen total de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto autoregresiva y modelado de lenguaje puro, sin alineacion conversacional.
- Procesamiento de imagen y texto (pipeline image-text-to-text): el modelo acepta entradas visuales a traves del codificador C-RADIO.
- Contexto largo de hasta 1M tokens, adecuado para documentos extensos, repositorios de codigo o secuencias multimodales largas.
- Capacidades multilingues en ingles, castellano, frances, aleman, italiano y japones, con evaluacion reportada en Global MMLU (8 idiomas) y MGSM (6 idiomas).
- Rendimiento solido en tareas de codigo y matematicas como backbone base (HumanEval 81,31; MATH-500 81,56; GSM8K 91,74).
- Decodificacion especulativa nativa mediante Multi-Token Prediction.
- Capacidad de servir como modelo profesor o alumno en pipelines de destilacion y como base para SFT/RL posteriores.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico: al ser un modelo base sin post-entrenamiento, no se garantiza seguir instrucciones ni formatos de herramienta.

## Casos de uso

- Pre-entrenamiento continuado en dominio propio: el checkpoint sirve como inicializacion para seguir entrenando con corpus especializados (legal, sanitario, financiero) sin partir de cero, aprovechando los 12B parametros activos para mantener el coste de computo controlado.
- Adaptacion a nuevos idiomas: al haber sido ya pre-entrenado de forma continuada en lenguas indicas, es un punto de partida razonable para extender cobertura a idiomas no incluidos en los seis soportados mediante entrenamiento adicional.
- Base para asistentes vision-lenguaje post-entrenados: equipos que necesiten un VLM conversacional pueden aplicar SFT y DPO sobre este checkpoint y obtener su propio modelo ajustado, como hace la propia NVIDIA en la release BF16 post-entrenada de la familia.
- Comprension de documentos largos con componentes visuales: gracias a la ventana de 1M tokens, permite procesar informes anuales, expedientes o manuales tecnicos completos con tablas y figuras en una sola pasada, sin troceado agresivo.
- Investigacion en arquitecturas hibridas: la combinacion Mamba-2 + atencion + MoE con 512 expertos por capa lo convierte en un banco de pruebas para estudiar enrutamiento, eficiencia de contexto largo y decodificacion especulativa con MTP.
- Generacion de datos sinteticos y destilacion: puede actuar como profesor para producir trazas y respuestas que alimenten modelos mas pequenos, o como alumno en destilacion desde modelos mayores.
- Investigacion en ingenieria de software asistida: su mid-training especifico de software y sus resultados en HumanEval, MBPP y LiveCodeBench lo hacen util como base para modelos de completado de codigo, sujeto a un post-entrenamiento posterior.
- Analisis de imagenes tecnicas en pipelines de investigacion: el conector vision-lenguaje permite experimentar con descripcion, extraccion de informacion y razonamiento sobre figuras, diagramas y capturas.

## Benchmarks y rendimiento

Los resultados publicados corresponden al backbone de texto base de Nemotron 3.5 Super, evaluado antes del entrenamiento vision-lenguaje.

| Benchmark | Metrica | Resultado (%) |
|---|---|---|
| MMLU | Exact match | 84,14 |
| MMLU-Pro | Exact match, extraccion TigerLab | 76,25 |
| AGIEval-En | CoT exact match | 75,65 |
| SuperGPQA | CoT | 47,65 |
| GPQA Diamond | 5-shot, CoT exact match | 66,16 |
| GSM8K | 8-shot, CoT exact match | 91,74 |
| Minerva MATH | Exact match | 87,66 |
| MATH-500 | 4-shot, pass@1 muestreado, n=32 | 81,56 |
| HumanEval | EvalPlus sanitized, pass@1 muestreado, n=32 | 81,31 |
| MBPP-Sanitized | 3-shot, pass@1 muestreado, n=32 | 79,06 |
| LiveCodeBench CodeGen | Pass@1 | 47,61 |
| BigCodeBench Complete | Greedy | 48,42 |
| BigCodeBench Instruct | Greedy | 49,39 |
| CommonsenseQA | 7-shot, accuracy | 85,26 |
| ARC-Challenge | 25-shot, accuracy normalizada | 95,99 |
| HellaSwag | 10-shot, accuracy normalizada | 88,96 |
| OpenBookQA | 0-shot, accuracy normalizada | 48,80 |
| PIQA | 0-shot, accuracy normalizada | 85,09 |
| TruthfulQA MC2 | 0-shot, accuracy | 71,18 |
| WinoGrande | 5-shot, accuracy | 79,08 |
| SocialIQA | 0-shot, accuracy | 49,03 |
| RACE | 0-shot, accuracy | 91,39 |
| Global MMLU | Media en 8 idiomas | 86,56 |
| MGSM | 8-shot, CoT nativo, media en 6 idiomas | 87,53 |

No se han publicado en la informacion disponible resultados especificos de las capacidades vision-lenguaje ni comparaciones directas contra otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 249 GB solo para pesos (124,5B parametros x 2 bytes), mas cache KV y activaciones. Es una estimacion derivada del recuento de parametros, no un dato publicado.
- Cuantizacion a 8 bits: alrededor de 125 GB de pesos; a 4 bits, alrededor de 62 GB. Ambas siguen requiriendo multiples GPU, ya que no existen pesos cuantizados oficiales de este checkpoint (solo se documenta una release NVFP4 del modelo post-entrenado).
- GPU recomendadas: configuraciones multinodo o multitarjeta con H100 80 GB (4-8 unidades), H200 141 GB (2-4 unidades) o A100 80 GB (4-8 unidades). No se detallan GPU soportadas oficialmente en la informacion proporcionada.
- Consumer GPU: no cabe. Una RTX 4090 o similar con 24 GB no puede alojar ni la version cuantizada a 4 bits (aproximadamente 62 GB), por lo que se requiere agregacion de memoria entre varias GPU.
- Opciones de despliegue: la model card indica uso con la libreria transformers y pesos safetensors que requieren custom_code, por lo que es necesario confiar en la implementacion remota del repositorio. El soporte en vLLM, llama.cpp, Ollama o TGI no esta documentado en la informacion disponible; si se cita una release NVFP4 para despliegue optimizado.
- Latencia y throughput: no disponibles. Como referencia estructural, el coste de computo por token se corresponde con 12B parametros activos, mientras que el ancho de banda de memoria necesario corresponde a un modelo de 120B, de modo que la decodificacion estara limitada por memoria y no por FLOPs. La decodificacion especulativa con MTP puede aumentar el throughput efectivo, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos de otras familias con los que comparar directamente. La comparacion posible se limita a las variantes de la propia familia Nemotron 3.5 Super:

| Modelo | Parametros | Contexto | Post-entrenamiento | Formato | Licencia |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-Base-BF16 (este) | 124,5B totales / 12B activos | 1M tokens | No (checkpoint base) | safetensors BF16 | OpenMDW 1.1 |
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 | no disponible en la informacion | no disponible | Si (post-entrenado) | safetensors BF16 | no disponible en la informacion |
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 | no disponible en la informacion | no disponible | Si (post-entrenado) | NVFP4, optimizado para despliegue | no disponible en la informacion |

Las referencias cruzadas con Nemotron 3 Super Base (origen de la inicializacion) y Nemotron 3 Ultra Base (profesor de destilacion) no incluyen especificaciones publicadas en la informacion disponible.

## Limitaciones y advertencias

- Es un modelo base sin alineacion por preferencias ni ajuste de instrucciones: no debe usarse directamente como asistente conversacional y puede generar contenido inapropiado, repetitivo o no solicitado ante prompts de usuario.
- Riesgo de alucinacion inherente al pre-entrenamiento: los benchmarks de veracidad reportados (TruthfulQA MC2 71,18) indican margen de error apreciable.
- Sesgos: el modelo se entrena sobre datasets de pre-entrenamiento publicados por NVIDIA cuya composicion exacta y analisis de sesgo no se detallan en la informacion disponible. Cabe esperar sesgos presentes en corpus web a gran escala.
- Cobertura idiomatica limitada a en, es, fr, de, it y ja; el rendimiento en idiomas no representados no esta garantizado.
- Aunque soporta 1M tokens de contexto, no se documenta la degradacion de rendimiento a longitudes cercanas al maximo; en modelos hibridos con Mamba-2 el comportamiento en recuperacion de informacion muy lejana depende del entrenamiento especifico de contexto largo.
- Las capacidades vision-lenguaje no cuentan con evaluacion publicada en la informacion disponible: los benchmarks corresponden al backbone de texto antes del entrenamiento multimodal.
- Licencia OpenMDW 1.1: aunque la model card indica que el modelo esta listo para uso comercial y no comercial, es una licencia personalizada ("other") y conviene revisar el texto completo en openmdw.ai antes de un despliegue en produccion.
- Los pesos requieren ejecucion de codigo personalizado (custom_code) a traves de transformers con trust_remote_code, lo que implica una superficie de riesgo adicional en entornos de produccion.
- Despliegue en produccion condicionado por hardware: no cabe en GPU de consumo y necesita agregacion de memoria en varias GPU de datacenter, con el coste asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-Base-BF16
- Release post-entrenada BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Release NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Informe tecnico de Nemotron 3.5 Super y Lightning: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Super-and-Lightning-Technical-Report.pdf
- Informe tecnico de Nemotron 3 Ultra: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Ultra-Technical-Report.pdf
- Coleccion de modelos Nemotron 3: https://huggingface.co/collections/nvidia/nvidia-nemotron-v3
- Coleccion de datasets de pre-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Dataset de pre-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Pagina de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Sitio oficial de NVIDIA: https://www.nvidia.com/
