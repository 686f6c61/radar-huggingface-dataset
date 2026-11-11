# seamon67/GLiDE-27B-GGUF

## Resumen

GLiDE 27B es un modelo de decisión desarrollado por Fastino Labs, no un modelo generativo al uso. Dado un estado (texto, JSON o una lista de partes de texto e imagen) y una o varias preguntas tipadas, devuelve una distribución de probabilidad sobre las opciones de cada pregunta en un único forward pass, sin generar tokens. Está construido sobre una arquitectura Qwen3.5 de 27B parámetros e incorpora un cabezal de lectura (readout) de 255 vías que convierte el estado oculto final en probabilidades.

El repositorio `seamon67/GLiDE-27B-GGUF` es una conversión a formato GGUF del modelo original `fastino/GLiDE-27B`, realizada con una versión modificada de llama.cpp. Su propósito es permitir la ejecución del modelo con la pila de llama.cpp en lugar de la implementación de referencia en PyTorch/transformers. El repo ocupa 17,5 GB, lo que sugiere cuantizaciones de 4-6 bits sobre los 52,2 GB de pesos bf16 originales.

Es relevante para quienes necesitan clasificación, enrutamiento y puntuación de alta precisión con latencias muy bajas (112 ms de mediana por petición en una RTX PRO 6000 según el autor original) y quieren evaluarlo fuera del ecosistema de Fastino, aunque la conversión GGUF no está validada por el autor del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal y atención completa (base Qwen3.5) más cabezal de decisión de 255 vías; incluye codificador visual |
| Parámetros totales | 27B (aproximado, según nombre y model card) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 40.000 tokens por prompt de pregunta (estado + pregunta + opciones + tokens de imagen) |
| Tipos de cuantización | GGUF (el repo ocupa 17,5 GB; no se detallan los niveles exactos incluidos) |
| Idiomas soportados | no disponible |
| Licencia | fastino-community (licencia "other", enlace a LICENSE en el repo) |
| Formato de pesos | GGUF (original en bf16 / safetensors vía transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27B parámetros de la familia Qwen3.5 que combina capas de atención lineal con capas de atención completa; el autor original recomienda instalar `flash-linear-attention==0.5.2` para obtener kernels rápidos en las capas lineales, y advierte que sin ese paquete transformers cae a una implementación PyTorch mucho más lenta. Sobre el tronco del lenguaje se añade un codificador visual (0,92 GB) para estados multimodales y un cabezal de lectura de 2,6 MB que produce una distribución de 255 vías. No se genera texto: cada pregunta se resuelve con un único forward pass y todas las preguntas de una petición (y de peticiones concurrentes) se agrupan en micro-lotes.

La model card original no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información no está disponible. El autor sí reporta que los pesos y el cómputo son en bf16, que la carga en GPU se hace tensor a tensor para minimizar el uso de memoria host y que el preprocesado de imágenes se ejecuta en CPU. La conversión a GGUF la firma `seamon67` con una versión modificada de llama.cpp y no incluye notas sobre pérdida de precisión respecto al original.

## Capacidades

- Decisiones tipadas: `choice` (una entre hasta 255 opciones con nombre), `noul` (sí/no, devuelve P(sí)) y `score` (niveles ordenados con nivel esperado).
- Probabilidades calibradas para cada opción de cada pregunta, leídas del cabezal de 255 vías.
- Entrada de estado en texto plano, cualquier valor JSON o lista de partes de texto e imagen (PIL, rutas, bytes, base64 o data URLs).
- Multimodal: procesa imágenes junto al texto del estado mediante el codificador visual integrado.
- Contexto largo: hasta 40.000 tokens por prompt de pregunta por defecto.
- Interfaces: API Python (`glide.Glide`) y servidor HTTP con formato System One (`POST /v1/systemone`).
- Batching interno: agrupa preguntas y peticiones concurrentes en micro-lotes para amortizar el coste del forward pass.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso en el sentido de un LLM conversacional; su salida es siempre una distribución sobre opciones predefinidas.

## Casos de uso

- Clasificación de tickets de soporte: con un estado JSON que incluya el texto del ticket y metadatos del cliente, se definen preguntas `choice` para intención y `score` para prioridad; el modelo devuelve probabilidades por opción en un solo paso, lo que permite umbrales de confianza y enrutamiento automático.
- Enrutamiento de consultas en un pipeline RAG o de agentes: dado el texto de la consulta y una lista de herramientas o dominios como opciones `choice`, el modelo puntúa a qué destino corresponde antes de invocar el componente adecuado.
- Moderación de contenido: preguntas `noul` y `score` sobre texto e imágenes para decidir si un contenido requiere revisión humana, con probabilidades explícitas que permiten fijar políticas de corte.
- Triaje de imágenes en flujos documentales: adjuntar la imagen al estado y preguntar por tipo de documento, presencia de firmas o legibilidad mediante opciones tipadas.
- Puntuación de relevancia y ranking: usar el tipo `score` para asignar niveles ordenados a pares consulta-documento y ordenar resultados con el nivel esperado.
- Extracción de señales estructuradas en ETL: enviar registros JSON y obtener decisiones booleanas o categóricas por campo, agregando las probabilidades para monitorizar deriva de datos.
- Evaluación automática de salidas de otros modelos: preguntas `noul` sobre criterios (corrección, toxicidad, formato) para construir un juez probabilístico barato en latencia.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Decision Index 0.3.1 (suite pública) | 72,49 |
| Latencia mediana por petición | 112 ms en RTX PRO 6000 |
| Muestras de latencia | 750 peticiones |
| Pico de memoria GPU | 56,4 GB (52,2 GB tras carga) |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni comparativas con otros modelos de decisión. Los datos anteriores corresponden al modelo original en bf16 medidos por Fastino; no hay mediciones publicadas para esta conversión GGUF.

## Requisitos de hardware

- Pesos originales en bf16: 52,2 GB en disco (51,2 GB del modelo de lenguaje, 0,92 GB del codificador visual, 2,6 MB del readout); requiere una GPU de 80 GB o más.
- Memoria GPU tras carga: 52,2 GB; pico de 56,4 GB en la muestra de latencia del autor.
- GPU probada por el autor: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB).
- Tiempo de carga: 10 s desde caché local en caliente; más lento desde almacenamiento en red.
- La conversión GGUF de 17,5 GB debería caber en GPUs consumer de 24 GB con cuantizaciones de 4-5 bits, pero no hay confirmación del autor de la conversión ni mediciones de calidad o latencia para esos niveles.
- Despliegue: llama.cpp para el GGUF; para el original, el paquete `glide/` con Python 3.12, `torch==2.14.0`, `transformers==5.17.0` y, recomendado, `flash-linear-attention==0.5.2`.
- No se dispone de datos de throughput (peticiones por segundo) más allá de la latencia mediana indicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| GLiDE 27B (este) | 27B | 40.000 tokens por pregunta | Modelo de decisión con readout de 255 vías | fastino-community | bf16, GGUF |
| LLM generativo de ~27B (p. ej. Qwen3.5 27B) | 27B | variable | Generación de texto libre | según familia | safetensors, GGUF |
| Clasificadores encoder pequeños (BERT-large, DeBERTa) | 0,3-1,5B | 512-8.192 tokens | Clasificación supervisada por tarea | MIT/Apache en su mayoría | safetensors, ONNX |
| APIs de clasificación propietarias | no disponible | no disponible | Clasificación gestionada | propietaria | API |

No se dispone de comparativas publicadas de GLiDE 27B frente a alternativas concretas en la información proporcionada; la tabla anterior es orientativa por categoría, no por rendimiento medido.

## Limitaciones y advertencias

- La model card original no documenta sesgos conocidos, composición del dataset ni evaluación de seguridad; no hay información disponible al respecto.
- El riesgo de alucinación se sustituye por riesgo de calibración: las probabilidades pueden estar mal calibradas en dominios alejados de los datos de entrenamiento, y no hay métricas publicadas de calibración (ECE, Brier) en la información disponible.
- Las opciones están limitadas a 255 por pregunta y el modelo no genera texto libre; no sirve como sustituto de un LLM conversacional.
- Contexto máximo de 40.000 tokens por prompt de pregunta; estados más largos requieren truncado o troceado.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe equivalente al del modelo base.
- La licencia `fastino-community` es "other" y no se detallan en la información disponible las restricciones para uso comercial; es obligatorio revisar el archivo LICENSE del repo antes de desplegar en producción.
- Esta conversión GGUF no está validada por Fastino: el autor original solo reporta cifras para la implementación de referencia en bf16 con transformers y `flash-linear-attention`.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.
- La fecha de creación del repo (2026-11-10) y el uso de `transformers==5.17.0` y `torch==2.14.0` indican un ecosistema muy reciente; conviene verificar compatibilidad con la versión de llama.cpp instalada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/seamon67/GLiDE-27B-GGUF
- Modelo base: https://huggingface.co/fastino/GLiDE-27B
- Repositorio alternativo citado en la model card: https://huggingface.co/fastino/GLiDE
- Licencia: https://huggingface.co/seamon67/GLiDE-27B-GGUF/blob/main/LICENSE
- Web de Fastino: https://fastino.ai
- Documentación de la API: https://docs.fastino.ai/inference/systemone
- Quickstart de la API: https://docs.fastino.ai/quickstart
- Alta y API key: https://agent.fastino.ai
- Endpoint de inferencia: `POST https://api.fastino.ai/v1/systemone` (modelo `fastino/GLiDE`)
