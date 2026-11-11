# mradermacher/Galactic-Qwen-14B-Exp2-GGUF

## Resumen

Galactic-Qwen-14B-Exp2-GGUF es la versión cuantizada en formato GGUF del modelo Galactic-Qwen-14B-Exp2, desarrollado originalmente por prithivMLmods y publicado en Hugging Face. Se trata de un modelo de lenguaje de 14.765.947.904 parámetros (aproximadamente 14,8 mil millones) construido sobre la arquitectura Qwen, orientado a tareas de generación de texto, código y matemáticas. La cuantización ha sido realizada por mradermacher, un publicador habitual de versiones GGUF de modelos open source, lo que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y otras herramientas compatibles con este formato.

El modelo base ha sido sometido a un proceso de ajuste fino supervisado (SFT) mediante la librería TRL, según los tags declarados en la model card. Está pensado para uso conversacional y dispone de licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas. El repositorio ocupa 102 GB e incluye múltiples variantes de cuantización, desde Q2_K hasta Q8_0, lo que permite elegir el equilibrio entre calidad y consumo de memoria según el hardware disponible.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de 14B parámetros en hardware de consumo: las cuantizaciones Q4_K_M (9,1 GB) y Q5_K_M (10,6 GB) caben en GPUs con 12-16 GB de VRAM, y las variantes Q2_K y Q3 permiten incluso despliegue en sistemas con menos recursos. No se dispone de información detallada sobre la longitud de contexto, el volumen de datos de entrenamiento ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen; detalles especificos no disponibles) |
| Parametros totales | 14.765.947.904 (~14,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base Galactic-Qwen-14B-Exp2 se apoya en la arquitectura Qwen, un transformer decoder-only con atención multi-cabeza y mecanismos propios de la familia Qwen (RoPE para posiciones, normalización RMSNorm y capas feed-forward con activación SwiGLU, según el diseño estándar de la familia, aunque los detalles exactos no se documentan en la información disponible). El proceso de ajuste fino se realizó mediante SFT (supervised fine-tuning) usando la librería TRL, según los tags de la model card. No se especifica el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas posteriores de RLHF o DPO.

La contribución de esta publicación es exclusivamente la cuantización: mradermacher ha generado versiones estáticas (static quants) del modelo original, con un tensor de salida cuantizado (output_tensor_quantised: 1) y quantize_version 2. Además, existe una variante con cuantización ponderada/imatrix publicada en un repositorio separado (Galactic-Qwen-14B-Exp2-i1-GGUF), que suele ofrecer mejor calidad por tamaño que las cuantizaciones estáticas equivalentes. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogos multi-turno.
- Generación y asistencia en código, indicada por el tag `code` de la model card.
- Razonamiento matemático, indicado por el tag `math`.
- Ajuste fino supervisado (SFT) para seguir instrucciones y formatos conversacionales.
- Compatibilidad con text-generation-inference (TGI) y endpoints compatibles, según los tags.
- Ejecución mediante llama.cpp y derivados (Ollama, LM Studio, etc.) gracias al formato GGUF.
- Soporte multilingüe: limitado al inglés según la model card (no se declaran otros idiomas).
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistencia conversacional en inglés: el modelo puede gestionar diálogos multi-turno en aplicaciones de chat o asistentes virtuales, usando las cuantizaciones Q4_K_M o Q5_K_M para un equilibrio razonable entre calidad y latencia en GPUs de 12-16 GB.
- Generación de código en entornos locales: gracias al tag `code`, puede emplearse como asistente de programación en editores o pipelines de desarrollo, ejecutándose en estaciones de trabajo con una RTX 4090 o similar mediante llama.cpp.
- Resolución de problemas matemáticos: el tag `math` sugiere utilidad en tareas de razonamiento numérico y explicación paso a paso, adecuado para herramientas educativas o de apoyo al estudio.
- Prototipado rápido en investigación: al estar disponible en múltiples cuantizaciones, permite experimentar con un modelo de 14B en hardware modesto antes de escalar a versiones completas en precisión FP16.
- Despliegue en servidores con TGI: los tags indican compatibilidad con text-generation-inference, lo que permite servir el modelo mediante una API HTTP en infraestructura con GPU.
- Evaluación comparativa de cuantizaciones: la disponibilidad de 11 variantes (de Q2_K a Q8_0) facilita estudios sobre el impacto de la cuantización en la calidad de salida y el consumo de memoria.
- Aplicaciones de generación de texto en inglés con requisitos de licencia permisiva: la licencia Apache 2.0 permite integrar el modelo en productos comerciales sin obligaciones de atribución adicionales más allá de las estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~5,9 GB; Q3_K_S ~6,8 GB; Q3_K_M ~7,4 GB; Q3_K_L ~8,0 GB; IQ4_XS ~8,3 GB; Q4_K_S ~8,7 GB; Q4_K_M ~9,1 GB; Q5_K_S ~10,4 GB; Q5_K_M ~10,6 GB; Q6_K ~12,2 GB; Q8_0 ~15,8 GB. A estas cifras hay que añadir memoria para el contexto KV cache, que depende de la longitud de contexto configurada (no disponible).
- GPU recomendadas: para Q4_K_M y Q5_K_M, GPUs con 12-16 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090). Para Q8_0, se recomienda una GPU con 24 GB (RTX 4090, A10G, L4) o A100/H100 si se requiere mayor contexto o concurrencia.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones. Q4_K_M (9,1 GB) cabe en RTX 3060 12 GB y RTX 4070; Q2_K y Q3 caben incluso en GPUs de 8 GB con contexto reducido. Q8_0 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (TGI, según tags), y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o transformers.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Galactic-Qwen-14B-Exp2-GGUF (este) | ~14,8B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas e imatrix disponibles |
| Qwen2.5-14B-Instruct (referencia de familia) | ~14,7B | 32K (tipico en la familia Qwen2.5) | Apache 2.0 | safetensors, GGUF | Modelo oficial de Alibaba; contexto y benchmarks documentados publicamente |
| Mistral-Nemo-12B-Instruct | ~12,2B | 128K | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar con contexto largo declarado |
| Phi-3-Medium-14B | ~14B | 128K | MIT | safetensors, GGUF | Orientado a razonamiento y codigo, licencia permisiva |

Nota: los datos de los modelos comparativos corresponden a conocimiento general de la familia y no proceden de la información proporcionada en esta busqueda; deben verificarse en sus respectivas model cards. No se dispone de resultados de benchmarks del modelo Galactic para realizar una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse principalmente en inglés, puede reflejar sesgos culturales y lingüísticos de ese corpus.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no hay evaluaciones publicadas que cuantifiquen la tasa de alucinación.
- Limitaciones de idioma: la model card declara únicamente inglés (`en`); el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior.
- Limitaciones de contexto: la longitud de contexto no está documentada; conviene verificarla empíricamente antes de desplegar aplicaciones que dependan de ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base original (prithivMLmods/Galactic-Qwen-14B-Exp2) y de la familia Qwen subyacente.
- Calidad de cuantización: las variantes Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para producción. La model card advierte explicitamente que Q3_K_M es de "lower quality".
- Trazabilidad: el modelo base es un ajuste fino de terceros sobre Qwen; no se documentan los datos de SFT, lo que dificulta evaluar riesgos de contaminación o comportamientos no deseados.
- Producción: al no haber benchmarks publicados, se recomienda realizar una evaluación propia antes de desplegar en entornos críticos.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Galactic-Qwen-14B-Exp2-GGUF
- Modelo base original: https://huggingface.co/prithivMLmods/Galactic-Qwen-14B-Exp2
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Galactic-Qwen-14B-Exp2-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Galactic-Qwen-14B-Exp2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
