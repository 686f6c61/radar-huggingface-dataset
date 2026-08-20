# NANI-Nithin/Ornith-1.5-35B-A3B-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por ornith-ai, diseñado como un modelo de visión y lenguaje (VLM) basado en la arquitectura Qwen3.5-MoE. El repositorio que nos ocupa contiene las cuantizaciones GGUF de este modelo, realizadas por NANI-Nithin, para su uso con llama.cpp y otros motores compatibles. La versión GGUF es exclusivamente de texto, ya que el vision tower del modelo original se omite durante la conversión, práctica estándar en las conversiones VLM de llama.cpp.

El modelo base cuenta con 35.505 millones de parámetros totales y, según su nomenclatura, aproximadamente 3 mil millones de parámetros activos por token, gracias a su arquitectura MoE con 256 expertos enrutados y 8 activos. Incorpora una atención híbrida que combina capas de atención lineal Gated DeltaNet (3 de cada 4 capas) con capas de atención completa, además de 40 capas transformer, codificación posicional MRoPE y una capa MTP (Multi-Token Prediction). Esta combinación busca un equilibrio entre eficiencia computacional y calidad de generación, lo que lo hace relevante para despliegues en entornos con recursos limitados.

El repositorio GGUF ofrece una amplia gama de cuantizaciones, desde Q2_K hasta Q8_0, incluyendo variantes IQ, lo que permite adaptar el modelo a diferentes restricciones de memoria y almacenamiento. La licencia Apache 2.0 facilita su uso comercial y la integración en aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (Mixture-of-Experts) con atención híbrida (Gated DeltaNet + full attention) |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | 3B (según nomenclatura del modelo, no confirmado en la documentación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_M, IQ4_XS, IQ4_NL |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura transformer de 40 capas con un diseño MoE de 256 expertos enrutados, de los cuales 8 se activan por token. La atención es híbrida: tres de cada cuatro capas utilizan atención lineal Gated DeltaNet, mientras que la cuarta capa usa atención completa. Esta combinación reduce el coste computacional manteniendo la capacidad de modelar dependencias de largo alcance. Además, incorpora una capa MTP (Multi-Token Prediction) y codificación posicional MRoPE.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación proporcionada. El modelo original es un VLM con capacidades de visión, pero la versión GGUF omite el vision tower, por lo que solo se puede utilizar para tareas de texto.

## Capacidades

- Generación de texto en inglés, con razonamiento y comprensión de lenguaje natural.
- Arquitectura MoE eficiente: solo 3B parámetros activos por token, lo que reduce el coste de inferencia frente a un modelo denso de 35B.
- Soporte para inferencia local mediante llama.cpp y otros motores compatibles con GGUF (LM Studio, KoboldCpp, Open WebUI, Jan, etc.).
- No incluye capacidades de visión en la versión GGUF (el vision tower se omite).
- No se documentan capacidades específicas de tool calling, function calling, agentes o modo de razonamiento extendido.

## Casos de uso

- Despliegue de un asistente de chat en inglés en hardware de consumo: gracias a su arquitectura MoE con solo 3B parámetros activos, el modelo puede ejecutarse en GPUs de gama media (por ejemplo, RTX 3060 o superior) con cuantizaciones Q4_K_M o Q5_K_M, ofreciendo respuestas fluidas en tiempo real.
- Generación de texto en aplicaciones de escritura asistida: el modelo puede redactar correos, informes o contenido creativo en inglés, integrándose en herramientas de productividad mediante la API de llama.cpp.
- Clasificación y análisis de texto en pipelines de NLP: al ser un modelo de 35B con 3B activos, permite procesar lotes de documentos con un coste computacional moderado, útil para tareas de extracción de información o resumen.
- Prototipado rápido de aplicaciones de lenguaje: al estar disponible en formato GGUF, se puede cargar en entornos como LM Studio o Jan para pruebas interactivas sin necesidad de infraestructura cloud.
- Inferencia en servidores con múltiples GPUs: las cuantizaciones Q6_K o Q8_0 pueden distribuirse en GPUs de datacenter (A100, H100) para obtener la máxima calidad de generación en aplicaciones de investigación.
- Educación y experimentación: el modelo sirve como ejemplo de arquitectura MoE híbrida con atención lineal, permitiendo a investigadores estudiar su comportamiento y compararlo con otros modelos de la familia Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, para un modelo de 35,5B parámetros):
  - Q2_K: ~14 GB
  - Q4_K_M: ~20 GB
  - Q5_K_M: ~24 GB
  - Q6_K: ~28 GB
  - Q8_0: ~37 GB
  (Estimaciones orientativas basadas en el tamaño de los parámetros; los valores exactos dependen de la implementación y del contexto.)
- GPU recomendadas: para cuantizaciones Q4_K_M o inferiores, una RTX 3060 12GB o RTX 4060 Ti 16GB puede ser suficiente. Para Q5_K_M o superiores, se recomienda RTX 3090/4090 (24GB) o GPUs de datacenter como A100 (40/80GB) o H100.
- El modelo cabe en GPUs de consumo con al menos 16GB de VRAM usando cuantizaciones Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), LM Studio, KoboldCpp, Open WebUI, Jan, Text Generation WebUI (backend llama.cpp).
- Latencia y throughput: no disponibles en la documentación. Se espera que la arquitectura MoE con 3B activos ofrezca una velocidad de generación superior a un modelo denso de 35B, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Se sugiere comparar con otros MoE de tamaño similar como Mixtral 8x7B (46,7B totales, 12,9B activos) o Qwen3-30B-A3B, pero no se dispone de resultados de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- La versión GGUF es solo texto: no incluye las capacidades de visión del modelo original, por lo que no puede procesar imágenes.
- Idioma limitado a inglés: no se garantiza un rendimiento adecuado en otros idiomas.
- No se documentan sesgos específicos, pero como modelo entrenado con datos web, puede presentar sesgos sociales y culturales.
- Riesgo de alucinación inherente a los modelos de lenguaje; se recomienda validar las salidas en aplicaciones críticas.
- La longitud de contexto no está especificada; se debe probar con la implementación de llama.cpp para determinar el límite práctico.
- Las cuantizaciones IQ se generaron con una importance matrix basada en WikiText-2, lo que puede afectar al rendimiento en dominios muy diferentes.
- Para uso en producción, se recomienda evaluar el modelo con datos propios y verificar la compatibilidad con la versión de llama.cpp utilizada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/NANI-Nithin/Ornith-1.5-35B-A3B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
