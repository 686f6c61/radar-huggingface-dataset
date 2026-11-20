# Metabaron6/Shieldstral-1.0-3B-GGUF

## Resumen

Shieldstral-1.0-3B-GGUF es la versión cuantizada en formato GGUF del modelo Shieldstral-1.0-3B desarrollado por Mistral AI, publicada por el usuario Metabaron6. Se trata de un clasificador de seguridad y moderación de contenido construido sobre la arquitectura Mistral3 con 3.429.006.336 parámetros, diseñado específicamente para tareas de trust and safety: detección de contenido dañino, filtrado de prompt injection, clasificación de material de abuso infantil (CSAM), identificación de datos personales (PII) y moderación multimodal de texto e imagen.

El modelo resulta relevante porque combina una ventana de contexto de 262.144 tokens con un vocabulario de 131.072 tokens y soporte para 12 idiomas, lo que permite procesar documentos completos o conversaciones largas en una sola pasada sin truncamiento. Su licencia Apache-2.0 y su reducido tamaño (2,15 GB en Q4_K_M) lo hacen desplegable en hardware de consumo, algo poco habitual en clasificadores de seguridad de calidad.

Esta ficha describe la distribución GGUF, que incluye pesos de texto cuantizados en múltiples niveles (Q3 a Q8) y proyectores multimodales en BF16/F16 para moderación de imágenes. La inferencia se realiza mediante llama.cpp, con soporte tanto en CPU como en GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mistral3 (transformer denso, multimodal) |
| Parámetros totales | 3.429.006.336 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_M; proyector visual en BF16/F16 |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (texto y mmproj separados) |
| Vocabulario | 131.072 tokens |
| Tamaño del repositorio | 34,5 GB |
| Pipeline | text-classification |
| Modelo base | mistralai/Shieldstral-1.0-3B |

## Arquitectura y entrenamiento

La arquitectura es Mistral3, un transformer denso de 3.429 millones de parámetros con un vocabulario de 131.072 tokens y una ventana de contexto de 262.144 tokens. El modelo base es multimodal: incorpora un proyector visual (mmproj) que permite procesar imágenes junto con texto, de modo que la moderación cubre tanto contenido textual como visual. En esta distribución, los pesos de texto se ofrecen cuantizados en GGUF y el proyector se mantiene en 16 bits porque, según el autor, una cuantización agresiva del mismo degradaría la capacidad de reconocimiento de imagen.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento en la información proporcionada. Tampoco se detallan innovaciones de decodificación o atención específicas más allá de las propias de la familia Mistral3. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` usando el flag `--mistral-format` y el paquete `mistral-common[image,audio]` instalado.

## Capacidades

- Clasificación de seguridad y moderación de contenido: detección de contenido dañino, tóxico, abusivo o prohibido según políticas.
- Moderación multimodal: procesamiento conjunto de texto e imagen mediante el proyector mmproj, orientado a la detección de contenido visual inapropiado.
- Detección de CSAM (material de abuso sexual infantil) y categorías de riesgo equivalentes.
- Identificación de PII (datos personales identificables) en textos.
- Clasificación orientada a WAF (web application firewall): detección de prompt injection y ataques a aplicaciones.
- Política adaptativa (policy-adaptive): el modelo puede ajustarse a diferentes conjuntos de políticas de moderación.
- Soporte multilingüe en 12 idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano, árabe y ruso.
- Formato conversacional, compatible con endpoints de inferencia.
- No se ha documentado soporte explícito de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Moderación de contenido en plataformas sociales: clasificación de publicaciones de texto e imagen contra políticas de uso, aprovechando la ventana de 262.144 tokens para evaluar hilos completos o publicaciones con contexto extendido sin truncar.
- Filtrado de prompt injection en aplicaciones LLM: clasificación de entradas de usuario antes de enviarlas a un modelo generativo, con el objetivo de bloquear intentos de manipulación de instrucciones en entornos de producción.
- Protección perimetral en WAF: integración como clasificador auxiliar que analice cargas útiles HTTP y detecte patrones de ataque o contenido malicioso, desplegado en llama.cpp junto al resto de la pila de seguridad.
- Detección de PII en pipelines de datos: escaneo de documentos y registros para identificar datos personales antes de almacenarlos o compartirlos, con cobertura multilingüe para organizaciones con contenido en varios idiomas.
- Moderación de imágenes en servicios de usuario: uso del proyector mmproj para clasificar imágenes subidas por usuarios (avatares, adjuntos, galerías) y bloquear contenido inapropiado en tiempo real.
- Cumplimiento normativo y auditoría: clasificación retrospectiva de grandes volúmenes de contenido almacenado para auditorías de cumplimiento, aprovechando el contexto largo para procesar documentos completos por lote.
- Filtrado en asistentes conversacionales: evaluación de entradas y salidas de un chatbot en las 12 lenguas soportadas para evitar respuestas dañinas o fuera de política, con despliegue local en GPU de consumo gracias al tamaño reducido en Q4_K_M (2,15 GB).

## Benchmarks y rendimiento

El autor publica una comparativa de rendimiento de inferencia (no de calidad de clasificación) entre cuantizaciones y motores de cómputo:

| Modelo (cuantización) | Motor | Huella RAM/VRAM | Velocidad (tok/s) | Latencia por token | Logprob (confianza) |
|---|---|---|---|---|---|
| BF16 | GPU (CUDA) | ~6,0 GB | 100,8 | 9,9 ms | -0,01944 (ref.) |
| BF16 | CPU | ~6,0 GB | 7,9 | 125,0 ms | -0,01923 |
| Q8_0 | GPU (CUDA) | ~3,2 GB | 147,6 | 6,7 ms | -0,01871 |
| Q8_0 | CPU | ~3,2 GB | 15,7 | 63,3 ms | -0,01922 |
| Q4_K_M | GPU (CUDA) | ~2,1 GB | 187,0 | 5,3 ms | -0,02038 |
| Q4_K_M | CPU | ~2,1 GB | 22,1 | 45,2 ms | -0,01867 |
| Q4_K_S | CPU | ~1,9 GB | 25,4 | 39,2 ms | -0,02051 |
| Q3_K_M | CPU | ~1,6 GB | 26,8 | 37,1 ms | -0,02591 |
| Q3_K_M | GPU (anomalía) | ~1,6 GB | 17,1 | 58,4 ms | -0,02948 |

El autor señala una anomalía conocida en llama.cpp: Q3_K_M en GPU rinde peor (17,1 tok/s) que en CPU (26,8 tok/s) porque los kernels CUDA están optimizados para formatos alineados con registros de hardware (8 y 4 bits). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~6,0 GB en BF16/F16, ~3,2 GB en Q8_0, ~2,1 GB en Q4_K_M, ~1,6 GB en Q3_K_M. Añadir ~850 MB si se usa el proyector visual.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre para cuantizaciones Q4/Q8; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo con holgura. La comparativa del autor se realizó con CUDA.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más de VRAM usando Q4_K_M o Q8_0.
- Despliegue: llama.cpp (formato nativo GGUF), con soporte para CPU y CUDA. El autor menciona compatibilidad con endpoints, pero no detalla integraciones con vLLM, TGI u Ollama.
- Throughput estimado: 187 tok/s en GPU con Q4_K_M, 22,1 tok/s en CPU con la misma cuantización; 100,8 tok/s en GPU con BF16 y 7,9 tok/s en CPU con BF16.
- Latencia por token: 5,3 ms (Q4_K_M en GPU) hasta 125 ms (BF16 en CPU).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Shieldstral-1.0-3B (este, GGUF) | 3,43 B | 262.144 | Apache-2.0 | GGUF | Clasificador de seguridad multimodal, 12 idiomas |
| mistralai/Shieldstral-1.0-3B | 3,43 B | 262.144 | Apache-2.0 | safetensors | Modelo base original, sin cuantizar |
| Alternativas de moderación de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (clasificadores de seguridad de ~3B parámetros) en términos de rendimiento o benchmarks.

## Limitaciones y advertencias

- No se han publicado benchmarks de calidad de clasificación (precisión, recall, F1) en la información disponible; el rendimiento real en producción debe validarse con un conjunto de evaluación propio.
- Riesgo de alucinación y de clasificación errónea inherente a los modelos de lenguaje; no debe usarse como único mecanismo de seguridad sin revisión humana en casos críticos.
- La cuantización Q3_K_M muestra una degradación notable de la confianza (logprob -0,02591 frente a -0,01944 en BF16) y un rendimiento anómalo en GPU; se recomienda Q4_K_M o superior para producción.
- El proyector visual no debe cuantizarse de forma agresiva: el autor advierte que se destruiría la capacidad de reconocimiento de imagen, por lo que se mantiene en 16 bits (~850 MB adicionales).
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el usuario asume la responsabilidad del cumplimiento normativo en su jurisdicción.
- Cobertura lingüística limitada a los 12 idiomas declarados; el rendimiento en idiomas no listados no está garantizado.
- El modelo está diseñado para clasificación de seguridad, no como modelo generativo de propósito general; su uso fuera de ese ámbito puede dar resultados pobres.
- La información sobre sesgos específicos, datos de entrenamiento y procesos de alineamiento no está disponible en la documentación proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Metabaron6/Shieldstral-1.0-3B-GGUF
- Modelo base: https://huggingface.co/mistralai/Shieldstral-1.0-3B
- llama.cpp: https://github.com/ggerganov/llama.cpp
