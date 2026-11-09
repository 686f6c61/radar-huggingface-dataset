# DavidAU/MN-Dark-Planet-TITAN-12B

## Resumen

MN-Dark-Planet-TITAN-12B es un modelo de lenguaje de 12.247.782.400 parámetros (aproximadamente 12,2 mil millones) publicado por el usuario DavidAU en Hugging Face. Se trata de un modelo resultante de un proceso de fusión (merge) de otros modelos, generado con la herramienta mergekit, tal como indican las etiquetas del repositorio. El modelo base declarado aparece vacío en la model card, por lo que no se especifica de forma explícita qué modelos se combinaron para crearlo.

El modelo se distribuye en formato safetensors de precisión completa, pensado para servir como fuente a partir de la cual generar cuantizaciones en otros formatos (GGUF, GPTQ, EXL2, AWQ, HQQ). Está etiquetado con el tag `mistral`, lo que sugiere una arquitectura basada en la familia Mistral, aunque la model card no detalla la arquitectura con precisión. El repositorio tiene un tamaño de 24,5 GB, coherente con los pesos en precisión completa de un modelo de 12B.

La relevancia de este modelo es limitada y de nicho: se enmarca en el ecosistema de modelos fusionados orientados a generación de texto, chat y roleplay, con una comunidad reducida (162 descargas y 9 likes en el momento de la consulta). No dispone de información pública sobre benchmarks, licencia ni idiomas soportados, lo que condiciona su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado como `mistral`; detalles no disponibles) |
| Parametros totales | 12.247.782.400 (aprox. 12,2 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, GPTQ, EXL2, AWQ, HQQ (según model card; el repo fuente es safetensors fp) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (precisión completa); cuantizaciones en repos de terceros |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión de modelos (merge) realizada con mergekit, según las etiquetas del repositorio. No se especifica en la información disponible qué modelos concretos se combinaron, ni la técnica de merge empleada (por ejemplo, SLERP, TIES, DARE o linear). La etiqueta `mistral` apunta a una arquitectura transformer de tipo decoder-only con atención causal, pero no se confirma el número de capas, dimensiones ocultas, cabezas de atención ni el tokenizador empleado.

No hay datos públicos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Al tratarse de un merge, el modelo hereda las características de sus progenitores, pero esa información no está documentada en la model card ni en la información proporcionada. Tampoco se describen innovaciones técnicas destacables (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto autoregresiva en el marco de la librería transformers.
- Uso previsto orientado a chat, roleplay y casos de uso creativos, según el enfoque habitual de los modelos de DavidAU y las referencias de la model card a "chat, roleplay and other use case(s)".
- Compatibilidad con text-generation-inference y endpoints compatibles (según tags del repositorio).
- Posibilidad de generar cuantizaciones en múltiples formatos (GGUF, GPTQ, EXL2, AWQ, HQQ) a partir de los pesos fuente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Generación creativa y escritura asistida: el modelo puede emplearse para redactar narrativa, diálogos y textos creativos, aprovechando su orientación declarada a roleplay y generación de texto.
- Prototipado de chatbots conversacionales: al ser compatible con transformers y text-generation-inference, puede desplegarse como backend conversacional en entornos de prueba.
- Roleplay y personajes: la model card menciona explícitamente casos de uso de roleplay, por lo que encaja en aplicaciones de simulación de personajes con prompts adecuados.
- Base para cuantización y despliegue en local: al distribuirse en safetensors de precisión completa, sirve como origen para generar versiones GGUF y ejecutarlas en llama.cpp u Ollama.
- Experimentación e investigación en fusiones de modelos: útil para estudiar el comportamiento de merges de 12B frente a sus modelos base, aunque la falta de documentación limita la reproducibilidad.
- Generación de texto por lotes en pipelines de investigación: con suficiente VRAM, puede integrarse en scripts de generación masiva para análisis lingüístico o de estilo.
- Fine-tuning experimental: los pesos en precisión completa permiten ajuste fino supervisado en tareas específicas, siempre que la licencia lo permita (dato no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): en torno a 24-25 GB solo para los pesos, más memoria para el contexto y el estado de activaciones; se recomienda al menos 32 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: aproximadamente 12-14 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): aproximadamente 7-8 GB, lo que permite ejecución en GPUs de consumo.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para fp16; RTX 4090 (24 GB) para cuantizaciones de 8 bits o inferiores; RTX 3090/4080 (16-24 GB) para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 bits (por ejemplo, RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB) y en 8 bits con GPUs de 16 GB o más.
- Opciones de despliegue: transformers (fuente), text-generation-inference (según tags), llama.cpp / Ollama a través de los GGUF publicados por terceros (mradermacher, QuantFactory, RichardErkhov), y potencialmente vLLM si el modelo es compatible con su arquitectura.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MN-Dark-Planet-TITAN-12B | 12,2 B | no disponible | no disponible | Hugging Face (DavidAU) |
| Mistral Nemo 12B | 12,2 B | 128 K (según documentación pública de Mistral) | Apache 2.0 (según Mistral) | Hugging Face (Mistral AI) |
| Mistral 7B | 7,2 B | 32 K (según Mistral) | Apache 2.0 (según Mistral) | Hugging Face (Mistral AI) |

La comparación se limita a parámetros, contexto y licencia, ya que no hay datos de benchmarks del modelo evaluado. Conviene señalar que las cifras de los modelos alternativos provienen de su documentación pública y no de la información proporcionada en esta ficha, por lo que deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica la licencia, lo que impide determinar si el uso comercial está permitido. Es un riesgo relevante para producción.
- Falta de documentación técnica: no se detallan arquitectura exacta, contexto máximo, tokenizador ni modelos base, lo que dificulta la reproducibilidad y la evaluación.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a modelos comparables.
- Riesgo de alucinación: como todo modelo generativo de este tamaño y sin datos de alineación documentados, puede producir contenido factualmente incorrecto.
- Sesgos conocidos: no documentados; al ser un merge sin información sobre datos de entrenamiento, no es posible evaluar sesgos de forma rigurosa.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento adecuado fuera del inglés sin pruebas empíricas.
- Contexto no disponible: se desconoce la ventana máxima, lo que limita el diseño de aplicaciones con contexto largo.
- Modelo de nicho con baja adopción (162 descargas): menor soporte comunitario y menos validación independiente.
- Orientación a chat/roleplay: puede no ser adecuado para tareas de razonamiento estricto, código o matemáticas sin evaluación previa.

## Enlaces

- Repositorio principal: https://huggingface.co/DavidAU/MN-Dark-Planet-TITAN-12B
- GGUF del autor: https://huggingface.co/DavidAU/MN-Dark-Planet-TITAN-12B-GGUF
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Cuantización fp16 (Echo9Zulu): https://huggingface.co/Echo9Zulu/DavidAU_MN-Dark-Planet-TITAN-12B-fp16-ns-ov
- GGUF (RichardErkhov): https://huggingface.co/RichardErkhov/DavidAU_-_MN-Dark-Planet-TITAN-12B-gguf
- GGUF imatrix (mradermacher): https://huggingface.co/mradermacher/MN-Dark-Planet-TITAN-12B-i1-GGUF
- GGUF (mradermacher): https://huggingface.co/mradermacher/MN-Dark-Planet-TITAN-12B-GGUF
- GGUF (QuantFactory): https://huggingface.co/QuantFactory/MN-Dark-Planet-TITAN-12B-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
