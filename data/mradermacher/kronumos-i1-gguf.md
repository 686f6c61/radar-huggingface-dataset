# mradermacher/Kronumos-i1-GGUF

## Resumen

Kronumos-i1-GGUF es una recopilación de cuantizaciones en formato GGUF generada por mradermacher a partir del modelo original NadevA23/Kronumos, un modelo conversacional de aproximadamente 7.616 millones de parámetros (7,6 B). El repositorio no contiene pesos nuevos ni un modelo entrenado desde cero: es una conversión a GGUF con cuantización ponderada mediante matriz de importancia (imatrix), pensada para ejecutar el modelo en CPU y GPU de gama consumer a través de motores como llama.cpp, Ollama o compatibles con la API de endpoints.

El interés práctico reside en la disponibilidad de 24 variantes de cuantización, desde IQ1_S e IQ2_XXS (las más agresivas) hasta Q6_K, lo que permite ajustar el equilibrio entre huella de memoria y fidelidad numérica sobre un mismo modelo base. Además, las cuantizaciones imatrix suelen preservar mejor la perplejidad en niveles bajos de bits que las cuantizaciones estándar, algo relevante cuando se quiere desplegar en hardware con poca VRAM.

La información publicada es muy limitada: no se declaran licencia, idiomas, longitud de contexto ni pipeline, y no hay resultados de benchmarks. La model card únicamente indica que se trata de cuantizaciones ponderadas del modelo NadevA23/Kronumos con el pipeline de mradermacher, versión de cuantización 2 y tensores de salida cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el recuento de 7,6 B parámetros es consistente con un transformer decoder-only, sin confirmar por el autor) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (incluye un tensor de salida cuantizado y metadatos de imatrix) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineación del modelo original NadevA23/Kronumos. El único dato estructural verificable es el recuento de parámetros (7,6 B), que sitúa al modelo en la franja habitual de los transformers decoder-only de 7-8 B. No hay constancia de que se trate de una arquitectura MoE, híbrida o basada en SSM.

En cuanto al proceso de cuantización, el repositorio emplea el pipeline de mradermacher con cuantización ponderada mediante imatrix (matriz de importancia), versión de cuantización 2 y conversión de tipo hf. Esto implica que los tensores se han convertido desde el formato original de Hugging Face a GGUF y que los niveles de bits bajos se han calibrado con un dataset de importancia para minimizar la pérdida de calidad, en lugar de aplicar una cuantización uniforme. Los tensores de salida también aparecen cuantizados (output_tensor_quantised: 1). No se especifica qué calibración, dataset ni receta de conversión se han utilizado más allá de estas etiquetas.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" de HuggingFace indica que el modelo está orientado a diálogo multi-turno.
- No hay información publicada sobre razonamiento, matemáticas, generación de código, visión o audio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- El tag "endpoints_compatible" sugiere que las cuantizaciones pueden servirse a través de endpoints compatibles con la API de Hugging Face (por ejemplo, con motores que exponen una interfaz OpenAI-like), pero no se detalla ningún modo de inferencia adicional.

## Casos de uso

- Despliegue local en equipos de desarrollo: las variantes Q4_K_M o Q5_K_M de un modelo de 7,6 B caben en GPUs consumer de 8-12 GB de VRAM, lo que permite ejecutar un asistente conversacional sin depender de servicios en la nube.
- Prototipado rápido con Ollama o llama.cpp: al distribuirse en GGUF, el modelo se puede cargar directamente en estas herramientas sin conversión adicional, lo que acelera las pruebas de concepto.
- Sustitución de un modelo base en un pipeline existente: si la aplicación ya usa un transformer de ~7 B servido con llama.cpp, estos ficheros permiten intercambiar el modelo manteniendo el mismo motor de inferencia.
- Evaluación de calidad frente a cuantizaciones estándar: las variantes imatrix (por ejemplo, IQ3_M frente a Q3_K_M) permiten comparar el impacto de la cuantización ponderada en tareas concretas del usuario.
- Inferencia en CPU con presupuesto de memoria bajo: las cuantizaciones IQ1_S e IQ2_XXS reducen el peso del modelo a un rango de 2-3 GB, lo que hace viable su ejecución en máquinas sin GPU dedicada.
- Fine-tuning inverso o experimentación sobre el modelo base: al no haber licencia declarada en el repositorio derivado, este caso queda condicionado a la licencia del modelo original NadevA23/Kronumos, que no se especifica.
- Uso en entornos con requisitos de reproducibilidad offline: un fichero GGUF único permite distribuir el modelo de forma autocontenida, sin dependencias de red durante la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los valores siguientes son estimaciones basadas en el recuento de 7,6 B parametros y en el tamano tipico de cada nivel de cuantizacion; el autor no publica cifras de VRAM ni de latencia.

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - IQ1_S / IQ2_XXS / IQ2_XS: aproximadamente 2,0-2,8 GB.
  - Q2_K / Q2_K_S: aproximadamente 2,8-3,2 GB.
  - Q3_K_S / Q3_K_M / IQ3_XXS: aproximadamente 3,3-3,9 GB.
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M / IQ4_XS / small-IQ4_NL: aproximadamente 4,2-4,9 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 5,1-5,6 GB.
  - Q6_K: aproximadamente 6,1-6,5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para las cuantizaciones de 4 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4). Para Q6_K conviene disponer de 8-10 GB libres; en A100, H100 o L40S el modelo ocupa una fraccion minima de memoria y el cuello de botella pasa a ser el throughput del servidor.
- Compatibilidad con GPU consumer: si, en la mayoria de tarjetas de 8-16 GB para las cuantizaciones de 3 y 4 bits. Las variantes IQ1/IQ2 permiten incluso ejecucion en CPU con 4-6 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y servidores compatibles con GGUF. No se ha confirmado soporte para vLLM o TGI, que suelen requerir safetensors en lugar de GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion publicada sobre Kronumos no incluye benchmarks, contexto ni licencia, por lo que la comparacion se limita a parametros, contexto y disponibilidad de alternativas conocidas de la misma franja de tamano. Los datos de los modelos comparados corresponden a sus especificaciones publicas.

| Modelo | Parametros | Contexto | Licencia | Formato/Disponibilidad |
|---|---|---|---|---|
| Kronumos-i1-GGUF (este) | 7,6 B | no disponible | no disponible | GGUF, 24 cuantizaciones |
| Llama 3.1 8B | 8 B | 128 K | Llama 3.1 Community License | safetensors y GGUF |
| Mistral 7B v0.3 | 7,3 B | 32 K | Apache 2.0 | safetensors y GGUF |
| Qwen2.5 7B | 7,6 B | 128 K | Apache 2.0 | safetensors y GGUF |

Comparativa de rendimiento: no disponible. No se han publicado resultados de benchmarks para Kronumos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con estos modelos.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio GGUF no especifica licencia, y tampoco se indica la del modelo original NadevA23/Kronumos. No se puede asumir uso comercial libre sin verificar la licencia de origen.
- Ausencia total de benchmarks: no hay ninguna medicion publicada de calidad, por lo que no se puede garantizar un nivel de rendimiento concreto frente a alternativas establecidas.
- Sesgos: no disponible. Al no conocerse el dataset de entrenamiento, no se puede evaluar el sesgo del modelo.
- Riesgo de alucinacion: inherente a cualquier modelo generativo; sin datos de entrenamiento ni evaluaciones, el riesgo no puede acotarse.
- Limitaciones de contexto e idioma: no disponibles. No se declara ventana de contexto ni idiomas soportados, lo que impide planificar su uso en tareas multilingues o de contexto largo.
- Riesgo en cuantizaciones extremas: las variantes IQ1_S, IQ1_M e IQ2_XXS degradan la perplejidad de forma notable en modelos de 7 B; no se recomiendan para tareas que exijan precision (codigo, matematicas, razonamiento).
- Modelo derivado sin mantenimiento: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo dia, sin historial de uso ni issues que permitan validar su calidad.
- La fecha de creacion indicada en los metadatos (2026) es inconsistente con el estado actual del ecosistema y conviene tratarla con cautela.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/mradermacher/Kronumos-i1-GGUF
- Modelo original: https://huggingface.co/NadevA23/Kronumos
