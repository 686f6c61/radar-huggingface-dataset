# IFM/K2-Horizon-0.9B

## Resumen

K2-Horizon-0.9B es un modelo de lenguaje compacto de tipo decoder-only, desarrollado por IFM como parte de la familia K2 Horizon, que incluye seis modelos de diferentes tamaños, desde 0.9B hasta 375B-A23B. Este modelo en concreto es la versión densa más pequeña de la flota, con 1.078.285.824 parámetros (≈1.08B, comercializado como 0.9B) y una ventana de contexto de 128K tokens (131.072) mediante escalado YaRN RoPE. Su objetivo es ofrecer capacidades de razonamiento, matemáticas, código y uso de herramientas en un formato ligero, apto para despliegue en entornos con recursos limitados. La relevancia del modelo radica en que IFM publica tanto el código de entrenamiento como los datos, lo que lo convierte en una opción abierta para investigación y aplicaciones de bajo coste. Según el autor, el modelo está entrenado mediante destilación multi-teacher con especialistas en matemáticas, código, STEM y seguimiento de instrucciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer denso |
| Parametros totales | 1.078.285.824 (≈1.08B, comercializado como 0.9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (128K) con escalado YaRN RoPE |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Contradictoria: el model card indica Apache-2.0, pero el campo license_name de HuggingFace indica internal-only |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

K2-Horizon-0.9B es un transformer decoder-only de arquitectura densa, sin mezcla de expertos. La ventana de contexto de 128K se consigue mediante escalado YaRN de las posiciones rotatorias (RoPE), lo que permite manejar secuencias largas sin necesidad de reentrenar por completo. El entrenamiento se basa en destilación multi-teacher: según el model card, se utilizan profesores especializados en dominios de matemáticas y código, STEM y seguimiento de instrucciones. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor indica que el código de entrenamiento y los datos se harán públicos, pero no se detallan en la información disponible.

## Capacidades

- Razonamiento matemático: evaluado en AIME 2025 con una puntuación de 41.7, lo que indica capacidad para resolver problemas de matemáticas de nivel competitivo.
- Generación de código y capacidades científicas: el modelo está evaluado en benchmarks de coding y science, aunque no se ofrecen resultados específicos en la información disponible.
- Uso de herramientas (tool-use): el model card menciona benchmarks de tool-use, lo que sugiere capacidad de integración con funciones y APIs externas.
- Contexto largo: soporta hasta 131.072 tokens, útil para procesar documentos extensos o conversaciones multi-turno.
- Multilingüe: entrenado para inglés y chino, con soporte de generación de texto en ambos idiomas.
- Sin capacidades de visión o audio: no se mencionan en la información disponible.

## Casos de uso

- Asistente de código en entornos con recursos limitados: gracias a su tamaño compacto, puede ejecutarse en CPUs o GPUs modestas y generar o revisar código en inglés y chino, con contexto suficiente para archivos de proyecto grandes.
- Procesamiento de documentos largos: la ventana de 128K permite analizar contratos, informes técnicos o expedientes completos sin fragmentar el texto, especialmente en dominios bilingües.
- Agentes conversacionales en dispositivos edge: el soporte de tool-use permite integrar el modelo en sistemas de agentes que llaman a APIs o herramientas externas, con bajo coste de inferencia.
- Tutoría de matemáticas: la puntuación en AIME 2025 lo hace adecuado para aplicaciones educativas que necesitan resolver problemas de matemáticas paso a paso.
- Extracción de información en textos largos: puede clasificar o extraer entidades de documentos extensos de una sola pasada, aprovechando el contexto de 128K.
- Prototipado rápido de aplicaciones de IA en local: al ser un modelo de ~1B con licencia potencialmente abierta, es útil para experimentar en entornos de desarrollo sin depender de APIs externas.

## Benchmarks y rendimiento

Se ha publicado un resultado parcial en la información disponible, correspondiente al benchmark AIME 2025. La tabla del model card incluye comparaciones con Qwen3.5-0.8B, OpenBMB-1B y Qwen3.5-2B, pero los valores de estos modelos no se proporcionan en el extracto disponible.

| Benchmark | K2-Horizon-0.9B | Qwen3.5-0.8B | OpenBMB-1B | Qwen3.5-2B |
|---|---|---|---|---|
| AIME 2025 | 41.7 | No disponible | No disponible | No disponible |

El model card menciona una figura con más resultados, pero no es accesible en la información proporcionada. No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks en los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia (teórica, sin contar overhead de KV cache ni activaciones):
  - FP32: ~4.3 GB
  - FP16/BF16: ~2.2 GB
  - INT8: ~1.1 GB
  - INT4: ~0.6 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16, como RTX 3060, RTX 4060 o equivalentes. Para despliegue a escala, A100 o H100.
- Compatibilidad con GPUs de consumo: sí, el modelo es apto para ejecutarse en hardware de gama media.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, y transformers (según la librería indicada en HuggingFace).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

La comparación se basa únicamente en los datos disponibles en el model card. No se dispone de resultados de rendimiento para los modelos de referencia.

| Parametro | K2-Horizon-0.9B | Qwen3.5-0.8B | OpenBMB-1B | Qwen3.5-2B |
|---|---|---|---|---|
| Parametros | 0.9B (1.08B reales) | 0.8B | 1B | 2B |
| Parametros activos | 0.9B | 0.8B | 1B | 2B |
| Arquitectura | Densa | Densa | Densa | Densa |
| Longitud de contexto | 128K | No disponible | No disponible | No disponible |
| Licencia | Contradictoria (Apache-2.0 / internal-only) | No disponible | No disponible | No disponible |
| Rendimiento (AIME 2025) | 41.7 | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ambigüedad de licencia: el model card declara Apache-2.0, pero el campo license_name de HuggingFace indica internal-only. Esto genera incertidumbre sobre el uso comercial y debe resolverse consultando la licencia oficial antes de usar el modelo en producción.
- Idiomas limitados: solo soporta inglés y chino, lo que restringe su uso en otros idiomas sin adaptación adicional.
- Riesgo de alucinación: al ser un modelo de ~1B, es más propenso a errores y alucinaciones que modelos más grandes, especialmente en tareas de razonamiento complejo.
- Contexto largo con degradación potencial: el uso de YaRN RoPE para extender el contexto a 128K puede implicar una pérdida de rendimiento en secuencias muy largas en comparación con el entrenamiento nativo a esa longitud.
- Sin datos de sesgos: no se han publicado análisis de sesgos ni evaluaciones de seguridad en la información disponible.
- Datos de entrenamiento no divulgados: no se especifica la composición del dataset ni el número de tokens, lo que limita la evaluación de riesgos de contaminación o sesgos.

## Enlaces

- HuggingFace: https://huggingface.co/IFM/K2-Horizon-0.9B
- Blog de IFM sobre K2 Horizon: https://ifm.ai/blog/k2
- Página de producto K2 Horizon: https://ifm.ai/k2/
