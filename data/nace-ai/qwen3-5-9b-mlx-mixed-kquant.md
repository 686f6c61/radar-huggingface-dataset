# nace-ai/Qwen3.5-9B-MLX-mixed-KQuant

## Resumen

Qwen3.5-9B-MLX-mixed-KQuant es una cuantización del modelo Qwen/Qwen3.5-9B publicada por el usuario nace-ai mediante su framework propietario KQuant (versión 0.2), orientada al ecosistema MLX de Apple. El pack resultante ocupa 5,29 GB de pesos del modelo de lenguaje a una media de 4,726 bits por peso, manteniendo intacto el torreón de visión del modelo base (912 MB, 333 tensores fijados por hash) y los ficheros del tokenizador byte a byte. El resultado es un artefacto multimodal image-text-to-text listo para ejecutarse con mlx-lm en hardware Apple Silicon.

La propuesta de valor de KQuant no es solo la compresión: el framework ajusta cada grupo de pesos contra el comportamiento real del modelo en texto, no únicamente contra los valores numéricos de los tensores. El autor reporta una divergencia de 0,0301 KL frente al modelo bf16 en texto original y de 0,1038 KL en texto de chat y tool-calls, medidos sobre 32.704 y 65.472 tokens respectivamente. Además, 20 de 20 ensayos de tool-calling en modo thinking-off completaron correctamente la llamada y el round trip.

Se trata de un artefacto de cuantización, no de un modelo entrenado desde cero: hereda la arquitectura, los datos de entrenamiento y las capacidades del Qwen3.5-9B original, del que no se detallan especificaciones en la información disponible. Su relevancia es práctica para desarrolladores que quieran desplegar un modelo multimodal de ~9.400 millones de parámetros en Macs con memoria unificada limitada, a costa de una pérdida de calidad medible y documentada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), cuantizado en MLX; detalles internos del modelo base no disponibles |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Mixed-bit KQuant, 4,726 bits por peso de media (etiquetado como 4-bit); pesos del modelo de lenguaje a 5,29 GB |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors para MLX; 3 ficheros, 6.201.878.976 bytes en total |

## Arquitectura y entrenamiento

El pack no aporta información sobre la arquitectura interna del Qwen3.5-9B (tipo de atención, capas, composición del dataset o uso de RLHF/DPO), por lo que esos datos deben consultarse en la model card del modelo base. Lo que sí documenta esta ficha es el proceso de cuantización: KQuant v0.2 es un esquema mixed-bit que asigna precisión de forma no uniforme por grupos de pesos, optimizando contra distribuciones de siguiente token del modelo bf16 en lugar de contra el error cuadrático de los pesos. El pack conserva el torreón de visión del modelo base sin cuantizar de forma agresiva (333 tensores, 912.020.960 bytes) y replica el tokenizador y la plantilla de chat originales byte a byte.

La validación se ejecutó en una NVIDIA H200 (151 GB) con mlx 0.32.4, mlx-lm 0.32.2, transformers 5.22.2 y numpy 2.5.4. Las métricas de calidad son divergencias KL frente al bf16: 0,0301 en texto original (32.704 tokens) y 0,1038 en texto de chat y tool-calls (65.472 tokens). El autor incluye además un gráfico comparativo de KL frente a tamaño de pesos para otros packs MLX del mismo modelo base, medidos con el mismo protocolo de tokens congelado pero en ejecuciones independientes.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat idéntica a la del modelo base.
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias al torreón de visión preservado.
- Tool calling / function calling: 20 de 20 ensayos en modo thinking-off completaron la llamada y el round trip.
- Modo thinking (razonamiento extendido) heredado del modelo base, con la variante thinking-off validada explícitamente en esta cuantización.
- Razonamiento multi-turno y conversacional.
- Capacidades de código y matemáticas del modelo base: no verificadas de forma independiente en este pack.
- Multilingüismo: limitado a inglés según la model card.

## Casos de uso

- Asistencia conversacional local en Mac: el pack se ejecuta con mlx-lm sobre Apple Silicon y permite desplegar un modelo de ~9.400 millones de parámetros en memoria unificada, sin depender de la nube.
- Procesamiento de documentos con imagen: al conservar el torreón de visión, puede recibir capturas, diagramas o páginas escaneadas junto a una pregunta en texto para extracción de información.
- Agentes con tool calling en local: los 20/20 ensayos de llamada a herramientas en thinking-off lo hacen apto para prototipos de agentes que invocan APIs o funciones del sistema en un Mac de desarrollo.
- Evaluación y benchmarking de cuantizaciones: el pack incluye results.json con las métricas KL y el protocolo de tokens, útil como referencia para comparar esquemas de cuantización MLX sobre el mismo modelo base.
- Desarrollo y pruebas offline: al ser un artefacto Apache 2.0 de 6,2 GB, se puede distribuir y ejecutar en entornos sin conectividad para pruebas de integración de pipelines multimodales.
- Sustitución de precisión en producción con presupuesto de memoria: cuando el bf16 no cabe en el equipo objetivo, este pack ofrece una alternativa con degradación cuantificada (0,0301 KL en texto original) en lugar de una pérdida no medida.
- Generación de texto con contexto conversacional: útil para resúmenes, reescritura y respuestas multi-turno en inglés dentro de aplicaciones de escritorio para macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas reportadas son de fidelidad de cuantización y de fiabilidad de tool calling:

| Prueba | KQuant (este repo) | Tokens |
|---|---:|---:|
| KL frente al modelo bf16, texto original (menor es mejor) | 0,0301 | 32.704 |
| KL frente al modelo bf16, texto de chat y tool-calls (menor es mejor) | 0,1038 | 65.472 |
| Ensayos de tool calling en thinking-off completados | 20/20 | 20 |

## Requisitos de hardware

- VRAM/memoria: el repo completo son 6,2 GB (5,29 GB de pesos del modelo de lenguaje más el torreón de visión de 912 MB); se necesita memoria unificada suficiente para pesos más caché KV y activaciones, no cuantificada en la información disponible.
- Hardware de referencia del autor: NVIDIA H200 (151 GB) para la ejecución de validación, aunque el runtime es MLX.
- GPU: al ser un pack MLX, el destino natural es Apple Silicon (M-series); no se documenta compatibilidad con CUDA en esta ficha.
- Cabe en GPUs de consumo: previsiblemente en Macs con 16 GB de memoria unificada o más, aunque el mínimo exacto no está confirmado en la información disponible.
- Despliegue: mlx-lm (`mlx_lm.generate`), con instalación mediante `pip install -U mlx-lm`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nace-ai/Qwen3.5-9B-MLX-mixed-KQuant | 9.409.813.744 | No disponible | KQuant mixed-bit, 4,726 bpw, 5,29 GB LM | Apache 2.0 | Hugging Face (MLX) |
| Qwen/Qwen3.5-9B (base bf16) | 9.409.813.744 (según pack) | No disponible | bf16 | Apache 2.0 | Hugging Face |
| Otros packs MLX de Qwen3.5-9B citados en el gráfico KL vs tamaño | Mismo modelo base | No disponible | Diversas | Apache 2.0 (presumible) | Hugging Face |

La comparación relevante es contra el propio modelo base en bf16: este pack ocupa 5,29 GB de pesos de lenguaje frente al tamaño bf16 (no indicado en la información disponible) y se desvía 0,0301 KL en texto original. El autor referencia otros packs MLX del mismo modelo en su gráfico, pero no se detallan sus nombres ni sus métricas en el texto disponible.

## Limitaciones y advertencias

- Pérdida de calidad medible: 0,1038 KL en texto de chat y tool-calls es más de tres veces la divergencia en texto original (0,0301), lo que sugiere mayor degradación en conversación y llamadas a herramientas.
- Solo inglés: la model card declara únicamente el idioma inglés; el rendimiento en castellano no está evaluado.
- Contexto desconocido: no se documenta la longitud de contexto del modelo base ni si la cuantización la preserva.
- Formato específico: es un pack MLX; no es directamente utilizable en vLLM, llama.cpp u otros runtimes sin conversión.
- Riesgo de alucinación: inherente al modelo base y no cuantificado en esta ficha; la cuantización puede amplificarlo en tool-calls, donde la divergencia KL es mayor.
- Sesgos: no documentados en la información disponible; se heredan los del Qwen3.5-9B original.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del framework KQuant, que no se detallan más allá de la licencia del pack.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente de las métricas del autor.
- Fecha de creación futura en los metadatos (2026-11-11), lo que conviene tener en cuenta al evaluar la madurez del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-mixed-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Resultados de la ejecución de validación: results.json (junto a la model card en el repositorio)
- Datos del gráfico KL vs tamaño: assets/kl-vs-size-data.json (en el repositorio)
- Gráfico KL vs tamaño: assets/kl-vs-size.svg (en el repositorio)
