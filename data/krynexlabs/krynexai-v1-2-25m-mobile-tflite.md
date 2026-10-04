# KrynexLabs/KrynexAI-v1.2-25M-Mobile-TFLite

## Resumen

KrynexAI 25M Instruct es un modelo de lenguaje autoregresivo de tipo chat, desarrollado por KrynexLabs, que combina capas de espacio de estados (Mamba2) con capas de atención tradicional en una arquitectura híbrida. Con 24.486.710 parámetros reales (aproximadamente 25 millones), está diseñado para escenarios de generación de texto de muy bajo coste computacional, incluyendo despliegue en dispositivos con recursos limitados. El modelo se distribuye bajo licencia Apache 2.0 y está pensado exclusivamente para inglés.

Su principal singularidad es el patrón de bloques 3:1 (tres bloques Mamba2 por cada bloque de atención), que busca reducir el coste de la atención cuadrática manteniendo la capacidad de recuperación de información exacta a larga distancia. La ventana de contexto es de 2048 tokens, con un vocabulario muy reducido de 2048 tokens generado mediante un BPE byte-level personalizado. El entrenamiento combinó 25.000 millones de tokens de preentrenamiento con 250 millones de tokens adicionales de ajuste supervisado (SFT).

El modelo es relevante como ejemplo de arquitectura híbrida SSM/Transformer a escala muy pequeña, útil para investigación sobre eficiencia arquitectónica y para experimentación en edge computing. No obstante, su tamaño y su vocabulario limitado lo sitúan lejos de los modelos de propósito general: es un artefacto de investigación y de despliegue embebido, no un modelo de producción para tareas de razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba2 / Transformer (patron 3 bloques Mamba2 : 1 bloque de atencion, repetido) |
| Parametros totales | 24.486.710 (aproximadamente 25M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (no se documentan esquemas de cuantizacion publicados; el entrenamiento uso pesos maestros fp32 con autocast bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch), con codigo de arquitectura personalizado |
| Dimension oculta | 608 |
| Numero de capas | 8 (6 Mamba2 + 2 de atencion) |
| Tamano de vocabulario | 2048 (BPE byte-level personalizado) |
| Tokens de preentrenamiento | aproximadamente 25.000 millones |
| Tokens de SFT | aproximadamente 250 millones |
| Optimizador | Muon (pesos ocultos 2D) + AdamW (embeddings, normalizaciones y escalares) |
| Precision de entrenamiento | fp32 master weights con autocast bf16 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un hibrido entre Mamba2 y Transformer. El bloque se repite con una proporcion de tres capas Mamba2 por cada capa de atencion, lo que da un total de 8 capas para el modelo de 25M: 6 capas Mamba2 y 2 capas de atencion. La dimension oculta es de 608 y el vocabulario es un BPE byte-level personalizado de solo 2048 tokens, muy por debajo de los 32.000 a 150.000 tokens habituales en modelos modernos. Esta eleccion reduce el tamano de la matriz de embeddings, critica en un modelo de este tamano, a costa de una tokenizacion menos eficiente.

El preentrenamiento consumio aproximadamente 25.000 millones de tokens extraidos de seis fuentes: FineWeb-Edu (7.500 millones, 30%), DCLM (5.000 millones, 20%), Cosmopedia-v2 (3.750 millones, 15%), FineMath-4+ (3.750 millones, 15%), FinePhrase (3.000 millones, 12%) y NPset (2.000 millones, 8%). Posteriormente se aplico un ajuste supervisado (SFT) con aproximadamente 250 millones de tokens para convertirlo en modelo de chat. El entrenamiento uso un esquema de optimizacion dividido: Muon para los pesos ocultos bidimensionales y AdamW para embeddings, normalizaciones y parametros escalares, con pesos maestros en fp32 y autocast en bf16. No se documenta el uso de RLHF o DPO.

Un detalle tecnico relevante es que la implementacion de Mamba2 incluida depende de kernels de CUDA/Triton y esta pensada para ejecutarse en GPU con arquitectura Ampere o superior, lo que limita el despliegue directo en CPU pese al nombre del repositorio, que sugiere un objetivo movil con TFLite.

## Capacidades

- Generacion de texto autoregresiva y conversacion multi-turno en formato chat, tras el ajuste supervisado.
- Modelado de secuencias con ventana de contexto de 2048 tokens.
- Capacidad limitada de razonamiento aritmetico basico, segun las evaluaciones declaradas por el autor (ArithMark-2.0 y ArithMark-3.0, evaluadas sobre los splits de entrenamiento, no de test).
- Comprension lectora y sentido comun a nivel basico, evaluado con PIQA, ARC-Easy, ARC-Challenge y HellaSwag en modo zero-shot de opcion multiple.
- Soporte multilingue: no. El modelo esta entrenado y etiquetado exclusivamente para ingles.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Vision, audio u otras modalidades: no soportadas.
- Modo de razonamiento explicito (thinking mode): no documentado.
- Capacidad especial: arquitectura hibrida Mamba2/Transformer con atencion dispersa en el patron de bloques, orientada a eficiencia en inferencia.

## Casos de uso

- Experimentacion academica sobre arquitecturas hibridas SSM/Transformer: el modelo sirve como banco de pruebas a escala reducida (25M parametros, 8 capas) para medir el efecto del ratio 3:1 entre Mamba2 y atencion sin necesidad de infraestructura de gran escala.
- Clasificacion y etiquetado de texto simple en ingles: dado su tamano, es viable ejecutarlo como componente de bajo coste en pipelines de preprocesado donde se requieran decisiones rapidas sobre fragmentos cortos de texto.
- Prototipado de chatbots embebidos con presupuesto de memoria minimo: al ocupar aproximadamente 49 MB en bf16 y encajar en cualquier GPU consumer, permite iterar rapidamente sobre diseno conversacional antes de escalar a un modelo mayor.
- Generacion de texto creativo corto y autocompletado: con una ventana de 2048 tokens es adecuado para continuaciones breves, pies de foto o respuestas de una o dos frases donde la coherencia a largo plazo no es critica.
- Investigacion sobre tokenizadores de vocabulario reducido: el vocabulario de 2048 tokens permite estudiar el impacto de la granularidad del tokenizador en el rendimiento de modelos pequenos, comparandolo con vocabularios estandar.
- Educacion y divulgacion: su tamano permite ejecutarlo en portatiles, lo que lo hace util para demostraciones en aula sobre como funciona un modelo de lenguaje y que limites tiene uno de 25M de parametros.
- Baseline para pipelines de evaluacion: sirve como referencia inferior en comparativas de benchmark frente a modelos de 100M a 1B parametros, para calibrar la ganancia real de escala.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card indica que se evaluaron PIQA, ARC-Easy, ARC-Challenge y HellaSwag sobre sus respectivos splits de test, y ArithMark-2.0 y ArithMark-3.0 sobre los splits de entrenamiento, con evaluacion zero-shot de opcion multiple, pero no se incluyen los valores obtenidos.

Nota metodologica: la evaluacion de ArithMark-2.0 y ArithMark-3.0 sobre splits de entrenamiento (en lugar de test) impide interpretar esos resultados como una medida de generalizacion.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 98 MB en fp32, 49 MB en bf16/fp16, 25 MB en int8 y 12-13 MB en int4.
- VRAM total recomendada: el consumo real vendra dominado por los kernels de CUDA/Triton, el estado interno de las capas Mamba2 y la cache de las dos capas de atencion, mas el overhead del runtime; no se publican cifras de consumo real.
- GPU recomendadas: se recomienda Ampere o superior (por ejemplo, RTX 3090, RTX 4090, A100, H100) debido a los kernels de CUDA/Triton. No se documenta soporte para GPUs anteriores a Ampere.
- GPU consumer: si, cabe holgadamente en cualquier GPU consumer moderna e incluso en iGPUs con memoria compartida; el cuello de botella no es la memoria sino la disponibilidad de kernels compatibles.
- Despliegue: la model card solo documenta el uso mediante transformers con `trust_remote_code=True`. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM; estos requeririan portar la implementacion personalizada de Mamba2.
- Latencia y throughput: no disponible.
- Pese al sufijo "Mobile-TFLite" del nombre del repositorio, no se documentan pesos ni rutas de despliegue en TFLite en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Idiomas | Benchmarks publicados |
|---|---|---|---|---|---|---|
| KrynexAI-v1.2-25M-Mobile-TFLite | 24,5M | 2048 | Hibrida Mamba2/Transformer | Apache 2.0 | en | No disponibles |
| SmolLM-135M | 135M | 2048 | Transformer denso | Apache 2.0 | en (principalmente) | Si (publicados por el autor) |
| Pythia-70M | 70M | 2048 | Transformer denso | Apache 2.0 | en | Si (publicados por el autor) |
| Qwen2.5-0.5B | 494M | 32768 | Transformer denso con GQA | Apache 2.0 | multilingue | Si (publicados por el autor) |

La comparacion directa de rendimiento no es posible porque KrynexAI 25M no publica valores numericos de benchmark. En terminos de alcance, es entre 3 y 20 veces mas pequeno que las alternativas de la tabla, con la ventana de contexto mas corta y el unico vocabulario por debajo de 32.000 tokens. Su ventaja estructural es la eficiencia teorica de la capa Mamba2 en generacion de secuencias largas, aunque con 2048 tokens de contexto ese beneficio queda acotado.

## Limitaciones y advertencias

- Tamano muy reducido: con 24,5M de parametros la capacidad de conocimiento factual es minima. Se espera una tasa elevada de alucinacion, especialmente ante preguntas sobre hechos, fechas, entidades o codigo.
- Vocabulario de solo 2048 tokens: la tokenizacion es ineficiente, se consume mas contexto por palabra, empeora el manejo de identificadores de codigo, nombres propios y terminos tecnicos, y aumenta el coste efectivo por token generado.
- Ventana de contexto de 2048 tokens: insuficiente para documentos largos, conversaciones extensas o tareas de resumen sobre textos medianos.
- Solo ingles: no hay soporte documentado ni evaluado para castellano ni otros idiomas. El uso en espanol producira resultados degradados.
- Modelo denso, no MoE: no hay parametros activos reducidos; el coste de inferencia es proporcional al total de parametros.
- Evaluaciones no concluyentes: ArithMark-2.0 y ArithMark-3.0 se evaluaron sobre splits de entrenamiento, lo que impide descartar contaminacion. No se publican numeros para PIQA, ARC ni HellaSwag.
- Dependencia de kernels CUDA/Triton: la implementacion de Mamba2 requiere GPU Ampere o superior. El despliegue en CPU o en movil no esta documentado pese al nombre del repositorio.
- Riesgo de seguridad en el codigo: el modelo exige `trust_remote_code=True` para cargar tokenizador y modelo, lo que implica ejecutar codigo personalizado del autor. Conviene auditar el repositorio antes de usarlo en produccion.
- Sesgos: la composicion del dataset (FineWeb-Edu, DCLM, Cosmopedia-v2, FineMath-4+, FinePhrase, NPset) no se acompana de analisis de sesgos ni de filtrado documentado. Los sesgos presentes en esos corpus se heredan sin mitigacion conocida.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya. La model card indica que el trabajo se basa en desarrollos originales de "Pebble developers", cuya licencia subyacente no se detalla en la informacion disponible.
- Advertencia para produccion: no hay resultados publicados de latencia, throughput, estabilidad en produccion ni evaluaciones de seguridad. No se recomienda su uso en sistemas de cara al usuario sin una evaluacion propia.
- Repositorio practicamente sin traccion: 0 descargas y 1 like en el momento de la consulta, sin ecosistema, herramientas ni soporte comunitario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KrynexLabs/KrynexAI-v1.2-25M-Mobile-TFLite
- Perfil del autor: https://huggingface.co/KrynexLabs
- Paper tecnico: no disponible
- Blog o anuncio de publicacion: no disponible
- Repositorio de codigo: no disponible
- Demo o Space: no disponible
