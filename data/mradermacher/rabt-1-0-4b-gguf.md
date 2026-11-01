# mradermacher/Rabt-1.0-4B-GGUF

## Resumen

Rabt 1.0 4B es un modelo de lenguaje de 4.326 millones de parámetros (4,33B) desarrollado por Kanban Studios bajo el identificador `4waiz/Rabt-1.0-4B`, y cuantizado en formato GGUF por mradermacher. Está diseñado específicamente como asistente personal local-first, con un enfoque explícito en privacidad, soporte de agentes, tool calling y razonamiento multi-paso con intervención humana (human-in-the-loop). El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia del modelo radica en su combinación de tamaño reducido (apto para hardware de consumo), soporte multilingüe que incluye árabe, urdu e hindi además de inglés y francés, y un diseño orientado a flujos agénticos locales. El repositorio GGUF de mradermacher ofrece un abanico completo de cuantizaciones, desde Q2_K (2,1 GB) hasta f16 (8,8 GB), lo que facilita su despliegue en estaciones de trabajo sin GPU dedicada de gama alta.

La ficha se centra en la versión GGUF publicada por mradermacher, que es la que se distribuye para inferencia local mediante llama.cpp, Ollama y herramientas compatibles. El modelo base fue entrenado con QLoRA según las etiquetas de la model card, lo que sugiere un proceso de ajuste fino sobre un modelo preentrenado no especificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles específicos no disponibles) |
| Parámetros totales | 4.326.350.848 (4,33B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 (suplemento multimodal) |
| Idiomas soportados | en, ar, fr, hi, ur |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de tratarse de un transformer de 4,33B parámetros. Las etiquetas del modelo indican que fue entrenado mediante QLoRA (quantized low-rank adaptation), lo que implica un ajuste fino eficiente sobre un modelo base preentrenado. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

El modelo está orientado explícitamente a tareas de asistente personal con soporte de tool calling y flujos agénticos con human-in-the-loop. La presencia de archivos `mmproj` en el repositorio GGUF indica soporte multimodal (probablemente visión), aunque la model card no detalla las capacidades exactas del proyector multimodal. El entrenamiento QLoRA sugiere que el modelo parte de una base preentrenada y se especializa en las capacidades de asistente, agente y multilingüismo.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, árabe, francés, hindi y urdu.
- Soporte de tool calling y function calling, según las etiquetas del modelo.
- Capacidades agénticas con razonamiento multi-paso y human-in-the-loop.
- Soporte multimodal a través de los archivos mmproj incluidos (f16 y Q8_0), aunque la model card no detalla el alcance exacto.
- Diseño local-first y orientado a privacidad, pensado para ejecución en hardware propio.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades de asistente personal (gestión de tareas, interacción conversacional).

## Casos de uso

- Asistente personal local: el modelo puede ejecutarse íntegramente en el equipo del usuario mediante Ollama o llama.cpp, manteniendo los datos privados y sin depender de APIs externas. Su tamaño de 4,33B permite ejecución en CPU o GPU de consumo.
- Automatización de tareas con tool calling: integrado en un agente que invoque APIs, gestione calendarios o consulte bases de datos locales, aprovechando el soporte de function calling y el diseño human-in-the-loop para aprobación de acciones sensibles.
- Atención al cliente multilingüe: cobertura de inglés, árabe, francés, hindi y urdu en un único modelo, útil para organizaciones con usuarios en esas comunidades lingüísticas.
- Procesamiento de documentos con componente visual: los archivos mmproj permiten incorporar entrada de imágenes, útil para extraer información de capturas o documentos escaneados en flujos locales.
- Desarrollo de prototipos agénticos: al ser un modelo pequeño con licencia Apache 2.0, es adecuado para iterar rápidamente en pipelines de agentes sin costes de API ni restricciones de licencia.
- Despliegue en entornos con requisitos de soberanía del dato: sectores como sanidad, legal o administración pública donde la inferencia debe permanecer on-premise y auditable.
- Educación y experimentación: su tamaño y variedad de cuantizaciones lo hacen accesible para investigadores que necesiten un modelo multilingüe ejecutable en portátiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: ~2,1 GB
  - Q3_K_S: ~2,2 GB
  - Q3_K_M: ~2,4 GB
  - Q3_K_L: ~2,6 GB
  - IQ4_XS: ~2,7 GB
  - Q4_K_S: ~2,7 GB
  - Q4_K_M: ~2,9 GB
  - Q5_K_S: ~3,2 GB
  - Q5_K_M: ~3,3 GB
  - Q6_K: ~3,7 GB
  - Q8_0: ~4,7 GB
  - f16: ~8,8 GB
  - Suplemento multimodal: mmproj-Q8_0 (~0,5 GB) o mmproj-f16 (~0,8 GB)
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor velocidad. Para f16 se recomienda 12 GB o más.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6-8 GB de VRAM usando Q4_K_M o Q5_K_M. También es viable en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta `ollama` presente), y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Rabt 1.0 4B | 4,33B | No disponible | en, ar, fr, hi, ur | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-3B | 3,09B | 32.768 tokens | Multilingüe (29+) | Apache 2.0 | GGUF, safetensors |
| Llama 3.2 3B | 3,21B | 128.000 tokens | Multilingüe (8) | Llama 3.2 Community | GGUF, safetensors |
| Phi-3.5-mini | 3,82B | 128.000 tokens | Multilingüe (varios) | MIT | GGUF, safetensors |

La comparativa se ofrece como referencia de categoría (modelos de ~3-4B parámetros orientados a inferencia local). Rabt 1.0 4B se distingue por su cobertura específica de árabe, urdu e hindi y su orientación explícita a agentes y tool calling, pero no se dispone de datos de benchmarks que permitan comparar su rendimiento real frente a estas alternativas. Los datos de contexto de los modelos comparables provienen de sus respectivas model cards públicas; el contexto de Rabt no está disponible.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real en tareas estándar (MMLU, HumanEval, GSM8K) es desconocido.
- El contexto máximo no está documentado; planificar despliegues asumiendo un contexto conservador.
- Riesgo de alucinación inherente a modelos de 4B parámetros; no recomendado para tareas de alta precisión sin verificación humana.
- El entrenamiento QLoRA sobre una base no especificada puede introducir sesgos heredados del modelo preentrenado, no documentados.
- La cobertura multilingüe se limita a los cinco idiomas declarados; el rendimiento en otros idiomas no está garantizado.
- Aunque la licencia Apache 2.0 permite uso comercial, la model card no detalla restricciones de uso responsable ni procedencia de los datos de entrenamiento.
- El soporte multimodal a través de mmproj no está documentado en detalle; validar su comportamiento antes de usarlo en producción.
- Modelo con 0 likes y 764 descargas en el momento de la consulta: comunidad pequeña, menor soporte y validación externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Rabt-1.0-4B-GGUF
- Modelo base: https://huggingface.co/4waiz/Rabt-1.0-4B
- Cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/Rabt-1.0-4B-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Rabt-1.0-4B-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
