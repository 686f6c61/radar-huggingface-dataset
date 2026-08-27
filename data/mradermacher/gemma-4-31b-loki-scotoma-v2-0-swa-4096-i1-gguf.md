# mradermacher/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096`, un fine-tune de la familia Gemma 4 de Google DeepMind. El modelo original, publicado por CrucibleLab, se construye a partir de `ReadyArt/gemma-4-31B-it-scotoma-2`, que a su vez es un ajuste fino de `google/gemma-4-31B-it` mediante técnicas de γ-fold y DPO, entrenado sobre el dataset Loki V2. La extensión SWA (Sliding Window Attention) amplía la ventana de atención a 4096 tokens, lo que mejora la capacidad de procesar contextos largos respecto al modelo base.

La relevancia de esta publicación radica en que ofrece un amplio abanico de cuantizaciones (desde Q2_K hasta Q6_K, incluyendo formatos IQ) que permiten ejecutar un modelo de aproximadamente 30,7 mil millones de parámetros en hardware de consumo o en entornos con VRAM limitada, manteniendo un equilibrio entre calidad y requisitos de memoria. El autor, mradermacher, es conocido por generar cuantizaciones con matriz de importancia (imatrix) para optimizar la precisión en los formatos de baja precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma 4, con extensión SWA a 4096) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (extensión SWA a 4096 tokens) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-31B-it`, un transformer denso de 31B parámetros desarrollado por Google DeepMind. Sobre este, se aplicó un proceso de fine-tune en dos etapas: primero un ajuste con γ-fold (una técnica que reorganiza los pesos para mejorar la eficiencia de entrenamiento) y posteriormente un refinamiento con DPO (Direct Preference Optimization) para alinear las respuestas con preferencias humanas. El entrenamiento se realizó sobre el dataset Loki V2, del cual no se dispone de detalles públicos sobre su composición o tamaño.

La extensión SWA a 4096 tokens modifica el mecanismo de atención del transformer para utilizar una ventana deslizante de 4096 posiciones, lo que permite manejar secuencias más largas que el contexto original del modelo base sin un aumento proporcional del coste computacional. Esta característica es especialmente útil para tareas que requieren razonamiento sobre documentos extensos o conversaciones multi-turno.

## Capacidades

- Generación de texto y conversación: el modelo está etiquetado como "conversational" y es adecuado para mantener diálogos coherentes y contextualizados.
- Razonamiento y análisis: al ser un fine-tune de Gemma 4, conserva las capacidades de razonamiento lógico y matemático del modelo base, aunque no se han publicado benchmarks específicos para esta variante.
- Generación de código: Gemma 4 está entrenado para tareas de programación, y este fine-tune mantiene dicha capacidad, aunque sin datos cuantitativos.
- Comprensión de contexto largo: gracias a la extensión SWA de 4096 tokens, puede procesar entradas más extensas que el Gemma 4 original (cuyo contexto estándar es de 8K o 16K, según la versión).
- Multilingüismo: no se ha especificado, pero Gemma 4 soporta múltiples idiomas; esta variante no documenta su alcance lingüístico.
- Tool calling y agentes: no se menciona soporte explícito en la información disponible.

## Casos de uso

- Inferencia local en hardware de consumo: gracias a las cuantizaciones GGUF (especialmente Q4_K_M o IQ4_XS), el modelo puede ejecutarse en GPUs con 16-24 GB de VRAM, como una RTX 4090 o una RTX 3090, mediante llama.cpp u Ollama, permitiendo experimentar con un modelo de 30B sin necesidad de infraestructura de servidor.
- Despliegue en entornos de producción con vLLM: aunque el formato GGUF no es nativo de vLLM, es posible convertir los pesos a safetensors y desplegarlos con vLLM o TGI para servir el modelo a través de una API compatible con OpenAI, aprovechando la extensión SWA para manejar consultas con contexto largo.
- Asistentes de conversación especializados: el entrenamiento con DPO sobre Loki V2 sugiere una orientación hacia respuestas alineadas con preferencias humanas, lo que lo hace adecuado para chatbots de atención al cliente o asistentes personales que requieren un tono natural y útil.
- Análisis de documentos extensos: la ventana SWA de 4096 tokens permite procesar informes, artículos o contratos de varias páginas en una sola pasada, extrayendo información relevante o generando resúmenes.
- Generación de código asistida: puede utilizarse como autocompletado o generador de fragmentos de código en entornos de desarrollo, aunque se recomienda validar la salida en proyectos críticos.
- Prototipado rápido de aplicaciones de IA: al estar disponible en múltiples cuantizaciones, permite probar diferentes equilibrios entre calidad y consumo de recursos en un mismo modelo, facilitando la selección de la configuración óptima para un caso de uso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas estándar para este fine-tune específico. Se recomienda consultar los benchmarks del modelo base `google/gemma-4-31B-it` como referencia aproximada, aunque las modificaciones introducidas (γ-fold, DPO, SWA) pueden alterar el rendimiento en tareas concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: para una cuantización Q4_K_M (~4,5 bits por peso), se necesitan aproximadamente 18-20 GB de VRAM para los pesos más overhead de contexto y activaciones. Las cuantizaciones más agresivas (Q2_K, IQ1_S) pueden reducir el requisito a unos 12-14 GB, mientras que Q6_K o Q8_0 (si estuviera disponible) requerirían más de 25 GB.
- GPUs recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) para las cuantizaciones más altas. En GPUs con 16 GB (RTX 4080, RTX 3080 Ti) se puede usar Q4_K_S o IQ4_XS.
- Compatibilidad con hardware de consumo: sí, las cuantizaciones Q2_K, IQ3_M y Q4_K_S pueden ejecutarse en GPUs de 12-16 GB, aunque con limitaciones en la longitud del contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, y servidores compatibles con GGUF como llama-server. Para vLLM o TGI, es necesario convertir los pesos a safetensors.
- Latencia y throughput: no se dispone de mediciones específicas. Como referencia, un modelo de 30B en Q4_K_M en una RTX 4090 suele generar entre 20 y 40 tokens por segundo con llama.cpp, dependiendo de la longitud de la secuencia y el tamaño del lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096 (este) | 30,7B | SWA 4096 (contexto total no especificado) | no disponible | GGUF | Fine-tune con DPO y SWA |
| google/gemma-4-31B-it | 31B | 8K (estándar) | Gemma Terms of Use | safetensors | Modelo base oficial de Google |
| Llama 3.1 30B (hipotético) | ~30B | 128K | Llama License | safetensors/GGUF | No existe oficialmente; se usa como referencia de tamaño |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia de esta variante es la extensión SWA a 4096 tokens y el ajuste con DPO, que pueden mejorar la coherencia en tareas conversacionales y de contexto largo, pero no hay métricas que lo confirmen.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un fine-tune de Gemma 4, hereda los sesgos potenciales del modelo base y puede generar contenido falso o inventado, especialmente en temas de actualidad o datos específicos.
- Licencia no especificada: el repositorio no indica la licencia aplicable. Aunque Gemma 4 tiene una licencia propia de Google, este fine-tune podría tener restricciones adicionales. Se recomienda contactar con el autor antes de usar en producción comercial.
- Contexto limitado a 4096 tokens: aunque la extensión SWA amplía la ventana respecto al modelo base, sigue siendo corta en comparación con otros modelos de 30B que soportan 128K tokens. Para documentos muy largos, será necesario dividir el texto.
- Sin soporte multimodal confirmado: aunque Gemma 4 es multimodal, no se ha verificado que esta variante conserve dicha capacidad. La información disponible no menciona procesamiento de imágenes.
- Riesgo de degradación en cuantizaciones extremas: las cuantizaciones por debajo de Q4 (como Q2_K o IQ1_S) pueden provocar una pérdida notable de calidad en la generación, especialmente en tareas de razonamiento complejo.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento real del modelo, por lo que las afirmaciones sobre su calidad deben tomarse con cautela.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/mradermacher/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-i1-GGUF
- Modelo original (CrucibleLab): https://huggingface.co/CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-GGUF
- Modelo base intermedio (ReadyArt): https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Repositorio de cuantizaciones relacionadas (mradermacher): https://huggingface.co/mradermacher/gemma-4-31B-it-scotoma-i1-GGUF
