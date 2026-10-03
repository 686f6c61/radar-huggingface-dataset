# Rajeshwari-Chanda/bloom-560m_sparsegpt_0.9

## Resumen

`Rajeshwari-Chanda/bloom-560m_sparsegpt_0.9` es un checkpoint de investigación publicado en Hugging Face que parte de `bigscience/bloom-560m`, un transformer decoder-only de 559.214.592 parámetros, y le aplica una poda SparseGPT con una dispersión nominal del 90 % indicada en el propio nombre del repositorio. La arquitectura subyacente es la de la familia BLOOM (decoder-only, sesgo posicional ALiBi, LayerNorm y vocabulario de 250.680 tokens) y su función es servir como banco de pruebas de compresión agresiva one-shot.

Su relevancia práctica es limitada pero concreta: ocupa 1,1 GB en safetensors (unos 560 MB en fp16) y puede ejecutarse en CPU o en GPUs de gama de entrada, lo que lo convierte en un artefacto cómodo para estudiar la degradación de un modelo multilingüe pequeño tras eliminar el 90 % de sus pesos sin reentrenamiento.

La documentación publicada es prácticamente inexistente: la model card es la plantilla automática de Hugging Face sin rellenar, no se declara licencia ni idiomas, no hay métricas de evaluación y el repositorio no registra descargas ni likes. Cualquier uso en producción exige una evaluación propia y la verificación de la licencia del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia BLOOM), con ALiBi, LayerNorm y activación GeLU |
| Parámetros totales | 559.214.592 (≈560 M), según los safetensors del repositorio |
| Parámetros activos | No aplica (modelo denso, no es MoE); dispersión nominal del 90 % de los pesos |
| Longitud de contexto | 2048 tokens (heredada del modelo base `bigscience/bloom-560m`; no declarada en este repositorio) |
| Tipos de cuantización | No disponible en el repositorio; al distribuirse en safetensors admite cuantización externa a int8 y 4-bit |
| Idiomas soportados | No declarado; el modelo base BLOOM se entrenó con 46 idiomas naturales y 13 lenguajes de programación |
| Licencia | No disponible |
| Formato de pesos | Safetensors (tensores densos con aproximadamente un 90 % de ceros); tamaño del repositorio 1,1 GB |

## Arquitectura y entrenamiento

La base es `bigscience/bloom-560m`, la variante más pequeña de la familia BLOOM. Se trata de un transformer decoder-only autorregresivo de 24 capas, dimensión oculta 1024 y 16 cabezas de atención, con sesgos posicionales ALiBi en lugar de embeddings posicionales aprendidos, LayerNorm con sesgo y vocabulario BPE de 250.680 entradas. El modelo original se entrenó con Megatron-DeepSpeed sobre el corpus ROOTS (aproximadamente 1,6 TB de texto), que cubre 46 idiomas naturales y 13 lenguajes de programación, con un objetivo de modelado de lenguaje causal y sin ajuste por instrucciones ni alineación posterior (no hay RLHF ni DPO en la variante base).

Sobre ese checkpoint se aplica SparseGPT, un método de poda one-shot presentado en ICML 2023 que elimina pesos capa a capa resolviendo un problema de reconstrucción con una aproximación de la matriz de Hessiana, sin reentrenamiento posterior. El sufijo `0.9` del nombre del repositorio corresponde presumiblemente a una dispersión no estructurada del 90 %, pero la model card no documenta el conjunto de calibración, el número de muestras empleadas ni si se aplicó poda n:m o dispersión combinada con cuantización. Tampoco se indica qué variante del script de SparseGPT se utilizó.

## Capacidades

- Generación de texto autorregresiva en modo completado, sin plantilla de instrucciones ni formato de chat.
- Capacidad multilingüe heredada del corpus ROOTS: el modelo base cubre 46 idiomas naturales, con especial atención al inglés, francés, español, portugués, árabe y lenguas indias.
- Generación de código básico, dado que el corpus de entrenamiento incluye 13 lenguajes de programación.
- Modelado de lenguaje, cálculo de perplejidad y extracción de representaciones intermedias para investigación.
- No soporta tool calling ni function calling: no hay entrenamiento específico para ello ni tokenizador de herramientas.
- No soporta uso agéntico ni razonamiento multi-paso estructurado.
- No dispone de modo de razonamiento explícito (*thinking*), visión, audio ni multimodalidad.
- No es un modelo instruido: no responde a directrices ni rechaza peticiones peligrosas de forma fiable.

## Casos de uso

- Investigación en compresión de modelos: comparar la perplejidad y la calidad de generación de este checkpoint frente a `bigscience/bloom-560m` denso permite medir el coste real de una poda del 90 % sin reentrenamiento.
- Reproducción de experimentos SparseGPT: sirve para validar los scripts de evaluación del repositorio IST-DASLab/sparsegpt sobre WikiText-2, PTB y subconjuntos de C4 en hardware modesto.
- Prototipado local de generación de texto: con 560 MB en fp16 cabe en cualquier portátil y permite montar demos de autocompletado antes de invertir en modelos mayores.
- Generación de texto multilingüe de bajo coste: puede emplearse como generador de borradores en varios idiomas en entornos sin GPU, siempre que se acepte la pérdida de calidad por la poda.
- Docencia y divulgación: es un ejemplo manejable para explicar poda no estructurada, matrices dispersas y su impacto en la latencia real frente al tamaño teórico.
- Pruebas de infraestructura y despliegue: útil para validar pipelines de transformers, text-generation-inference o conversiones a GGUF sin consumir recursos significativos.
- Evaluación de robustez de técnicas one-shot: permite analizar cómo se degradan distintas lenguas y dominios cuando el presupuesto de pesos se reduce drásticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye la sección de evaluación, no hay métricas de perplejidad, MMLU, HumanEval ni GSM8K, y el repositorio no registra ningún informe externo. Para evaluar el efecto de la poda sería necesario calcular la perplejidad sobre WikiText-2 o C4 y compararla con la del checkpoint denso original, que tampoco se proporciona en este repositorio.

## Requisitos de hardware

- VRAM estimada solo para pesos: unos 2,24 GB en fp32, 1,12 GB en fp16/bf16, 0,56 GB en int8 y 0,30 GB en 4-bit.
- Memoria adicional: la caché KV con 2048 tokens de contexto y atención multi-cabeza en fp16 ronda los 190 MB, más el sobrecoste del runtime (entre 0,5 y 1,5 GB según la librería).
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y CPU. También es viable en placas tipo Raspberry Pi si se cuantiza.
- GPU de centro de datos (A100, H100) solo tendrían sentido para barridos masivos de evaluación, no por requisitos de memoria.
- Opciones de despliegue: `transformers` de forma nativa (es la librería declarada), text-generation-inference (etiqueta `text-generation-inference` presente en el repositorio) y vLLM, que cargaría los tensores como densos. La conversión a GGUF permitiría usarlo con llama.cpp u Ollama, siempre que el conversor acepte el grafo BLOOM.
- Advertencia de rendimiento: la dispersión no estructurada del 90 % no produce aceleración en kernels densos convencionales; el modelo ocupa lo mismo en memoria que el checkpoint denso salvo que se emplee un runtime específico de matrices dispersas, como DeepSparse en CPU.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Rajeshwari-Chanda/bloom-560m_sparsegpt_0.9` | 560 M (≈90 % ceros) | 2048 (heredado) | No disponible | Safetensors | Sin evaluación ni model card; poda one-shot |
| `bigscience/bloom-560m` | 560 M densos | 2048 | bigscience-bloom-rail-1.0 | Safetensors, transformers | Modelo base exacto del que deriva; referencia obligada para medir la degradación |
| `bigscience/bloom-1b1` | 1100 M | 2048 | bigscience-bloom-rail-1.0 | Safetensors, transformers | Misma familia y tokenizador, el doble de parámetros |
| `facebook/opt-1.3b` | 1300 M | 2048 | Licencia OPT (con restricciones de uso comercial) | Safetensors | Alternativa densa de tamaño similar, centrada en inglés |
| `TinyLlama/TinyLlama-1.1B-Chat-v1.0` | 1100 M | 2048 | Apache 2.0 | Safetensors, GGUF | Alternativa moderna instruida, con licencia permisiva y ecosistema amplio |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay datos que permitan afirmar que el modelo sigue siendo utilizable tras eliminar el 90 % de los pesos; una poda de esa magnitud en un modelo de 560 M suele degradar de forma notable la coherencia y la fluidez.
- Licencia no declarada: el repositorio no especifica términos de uso, lo que impide determinar si el uso comercial está permitido. El modelo base se distribuye bajo bigscience-bloom-rail-1.0, con cláusulas de uso restringido que el autor no reproduce aquí.
- Riesgo de alucinación alto: es un modelo base sin ajuste por instrucciones y con parámetros podados, por lo que tiende a completar texto plausible sin veracidad.
- Sesgos conocidos del corpus ROOTS: la familia BLOOM documenta sesgos de género, religión y origen, así como un rendimiento desigual entre idiomas, con una presencia muy inferior del español frente al inglés.
- Limitaciones de contexto: 2048 tokens, insuficientes para documentos largos o conversaciones multi-turno extensas.
- Sin soporte de herramientas ni agentes: no existe entrenamiento para function calling, por lo que integrarlo en un agente requeriría ingeniería externa.
- Compatibilidad incierta: algunos runtimes pueden no manejar correctamente tensores con un 90 % de ceros o aplicar optimizaciones que ignoren la estructura dispersa.
- Repositorio sin validación comunitaria: cero descargas y cero likes, sin issues ni discusiones que permitan contrastar su comportamiento.
- Advertencia de producción: se recomienda tratarlo como artefacto de investigación y, en caso de uso real, reconstruir el pipeline de poda, medir perplejidad y verificar la licencia antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rajeshwari-Chanda/bloom-560m_sparsegpt_0.9
- Perfil del autor: https://huggingface.co/Rajeshwari-Chanda/models
- Modelo base: https://huggingface.co/bigscience/bloom-560m
- Repositorio de SparseGPT (IST-DASLab): https://github.com/IST-DASLab/sparsegpt
- Paper de SparseGPT (ICML 2023): https://arxiv.org/abs/2301.00774
- Paper de BLOOM: https://arxiv.org/abs/2211.05100
- Lacoste et al. (2019), referencia citada en la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental: https://mlco2.github.io/impact
- Otros resultados de la búsqueda web (calendario de lanzamientos de modelos y noticias sobre Gemini 4 Argon) no guardan relación con este modelo.
