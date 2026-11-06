# mradermacher/ZwZ-7B-GGUF

## Resumen

ZwZ-7B es un modelo multimodal de 7.615.616.512 parámetros desarrollado por inclusionAI, orientado a tareas de razonamiento visual y respuesta a preguntas sobre imágenes (VQA). El modelo base se distribuye en formato nativo de transformers, y la versión aquí descrita es una cuantización estática en GGUF producida por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que el repositorio GGUF incluye el proyector multimodal (mmproj) en dos precisiones (Q8_0 y f16), lo que habilita inferencia visión-lenguaje completa en local sin necesidad de GPUs de centro de datos. El modelo se entrenó sobre los datasets inclusionAI/ZoomBench e inclusionAI/ZwZ-RL-VQA, lo que sugiere un enfoque específico en percepción de detalles finos y razonamiento guiado por refuerzo sobre pares imagen-pregunta.

La licencia Apache 2.0 y el soporte declarado únicamente para inglés lo sitúan como una opción práctica para prototipado e investigación en pipelines de visión por computador, aunque con limitaciones claras de idioma y sin datos públicos de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal visión-lenguaje; no se detalla en la información proporcionada) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectónicos en la información proporcionada más allá de que se trata de un modelo multimodal de 7.615.616.512 parámetros con proyector visual separado (mmproj), lo que implica un codificador de visión conectado a un modelo de lenguaje mediante un adaptador. El pipeline declarado en Hugging Face es "no disponible", por lo que no se confirma la tarea exacta ni la clase de arquitectura (transformer denso, híbrido, etc.).

El entrenamiento se realizó sobre los datasets inclusionAI/ZoomBench e inclusionAI/ZwZ-RL-VQA. El segundo nombre sugiere una fase de aprendizaje por refuerzo (RL) sobre tareas VQA, aunque no se especifica el algoritmo (RLHF, DPO, GRPO u otro), el número de tokens de entrenamiento ni la composición exacta del corpus. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés.
- Respuesta a preguntas sobre imágenes (VQA) gracias al proyector multimodal incluido en el repositorio.
- Razonamiento visual orientado a detalles finos, inferido del uso del dataset ZoomBench en el entrenamiento.
- Procesamiento de entradas multimodales imagen + texto en un único pipeline.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia en accesibilidad: descripción automática de imágenes para usuarios con discapacidad visual, ejecutando el modelo en local con la cuantización Q4_K_M (4,8 GB) y el proyector mmproj-Q8_0 (1,0 GB) en una GPU de consumo.
- Moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios en plataformas, aprovechando la capacidad VQA para responder preguntas concretas sobre el contenido.
- Extracción de información de documentos escaneados: formular preguntas específicas sobre capturas, facturas o formularios y obtener respuestas en texto, con el modelo desplegado vía llama.cpp en servidores sin GPU dedicada (cuantización Q4_K_S, 4,6 GB).
- Prototipado de investigación en VQA: evaluación de técnicas de razonamiento visual sobre ZoomBench, usando las cuantizaciones Q8_0 o f16 para minimizar la pérdida de precisión respecto al modelo base.
- Automatización de catalogación de imágenes: generación de descripciones y metadatos para bibliotecas fotográficas o inventarios, integrable en scripts de Python mediante llama-cpp-python.
- Análisis de imágenes en entornos con requisitos de privacidad: despliegue totalmente offline en estaciones de trabajo, sin enviar datos a APIs externas, gracias a la licencia Apache 2.0 y al formato GGUF.
- Educación y demostraciones: ejecución en portátiles con GPU de 8 GB para talleres sobre modelos multimodales, usando Q4_K_M más mmproj-Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + proyector + overhead de contexto):
  - Q2_K + mmproj-Q8_0: ~4,1 GB.
  - Q4_K_M + mmproj-Q8_0: ~5,8 GB.
  - Q5_K_M + mmproj-f16: ~7,0 GB.
  - Q8_0 + mmproj-f16: ~9,7 GB.
  - f16 + mmproj-f16: ~16,8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para las cuantizaciones altas; A100 o H100 solo necesarias para f16 con contextos largos.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 6 GB y Q4_K_M en GPUs de 8 GB; Q8_0 requiere 12 GB o más.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), llama-cpp-python, LM Studio y cualquier runtime compatible con GGUF y mmproj. vLLM y TGI no soportan GGUF multimodal de forma estándar en la información disponible.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| ZwZ-7B (esta ficha) | 7,62 B | no disponible | Sí (mmproj) | Apache 2.0 | Sí |
| Qwen2.5-VL-7B | ~7 B | no disponible en esta ficha | Sí | Apache 2.0 (según versión) | Sí, vía terceros |
| LLaVA-1.6-7B | ~7 B | no disponible en esta ficha | Sí | Apache 2.0 / Llama según variante | Sí, vía terceros |
| InternVL2-8B | ~8 B | no disponible en esta ficha | Sí | MIT (según versión) | Parcial |

Los datos de los modelos comparativos no provienen de la información proporcionada y deben verificarse en sus fichas oficiales; se incluyen solo como referencia de categoría.

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés; el rendimiento en castellano no está garantizado ni documentado.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre datasets específicos (ZoomBench, ZwZ-RL-VQA) puede heredar sesgos de composición de dichos corpus.
- Alucinación: riesgo inherente a modelos VQA de 7B; no hay datos publicados de tasas de error en la información disponible.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide garantizar conversaciones multi-turno largas o imágenes de alta resolución.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base inclusionAI/ZwZ-7B y de los datasets de entrenamiento por posibles restricciones adicionales.
- Producción: la cuantización GGUF introduce pérdida de calidad frente al modelo base; para tareas críticas se recomienda Q8_0 o f16 y validación con un conjunto propio.
- El repositorio tiene 385 descargas y 1 like, lo que indica poca validación comunitaria; no hay evidencia de uso en producción a gran escala.
- El pipeline no está declarado en Hugging Face, lo que puede complicar la carga automática con `transformers`.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ZwZ-7B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/ZwZ-7B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/ZwZ-7B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#ZwZ-7B-GGUF
- Dataset ZoomBench: https://huggingface.co/datasets/inclusionAI/ZoomBench
- Dataset ZwZ-RL-VQA: https://huggingface.co/datasets/inclusionAI/ZwZ-RL-VQA
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
