# mradermacher/Qwen3.5-4B-DeepThought-STEM-GGUF

## Resumen

Qwen3.5-4B-DeepThought-STEM es un modelo de lenguaje de aproximadamente 4.326 millones de parámetros (4,3B) desarrollado por el usuario xtools-at y publicado originalmente en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen3.5-4B, orientado específicamente al razonamiento científico y matemático (STEM), con especial énfasis en descubrimiento de fármacos y formulación farmacéutica. La versión aquí descrita es la cuantización GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo incorpora técnicas de destilación de trazas de razonamiento (reasoning traces) procedentes de modelos de mayor tamaño, así como ajuste supervisado (SFT) sobre datasets curados de matemáticas, ciencia y razonamiento académico. Los tags indican que ha sido sometido a procesos de "abliteration" o decensurado, lo que implica que se han eliminado total o parcialmente las capas de rechazo y alineación de seguridad del modelo original.

Su relevancia actual radica en que ofrece capacidades de razonamiento STEM en un tamaño compacto (4,3B) y con licencia Apache 2.0, lo que facilita su despliegue en entornos con recursos limitados y su uso comercial sin restricciones significativas. La disponibilidad de múltiples cuantizaciones GGUF (desde Q2_K hasta f16) lo hace accesible tanto en GPUs de consumo como en CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5, según tags qwen3_5) |
| Parámetros totales | 4.326.350.848 (4,3B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (según campo language: en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3.5, un transformer decoder-only. El modelo ha sido ajustado mediante LoRA/PEFT (según los tags lora y peft) sobre el modelo base xtools-at/Qwen3.5-4B-DeepThought-STEM, que a su vez deriva de Qwen3.5-4B. El entrenamiento combina técnicas de destilación de trazas de razonamiento de modelos como Claude Haiku 5.5, Xiaomi MiMo 2.6 Pro, ChatGPT 6.1 Terra, GPT-5.6 Luna y GLM-5.1, junto con datasets específicos de descubrimiento de fármacos y formulación farmacéutica (red-pill-drug-discovery-formulation) y el dataset general smoltalk2.

El proceso incluye SFT (supervised fine-tuning) sobre trazas de razonamiento de alta calidad, con el objetivo de replicar cadenas de pensamiento largas y estructuradas en dominios STEM. Los tags "heretic", "uncensored", "decensored" y "abliterated" indican que se ha aplicado una técnica de abliteración para eliminar la dirección de rechazo en el espacio de activaciones, reduciendo la probabilidad de respuestas negativas ante solicitudes potencialmente sensibles. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre la composición detallada del dataset más allá de los nombres listados.

## Capacidades

- Generación de texto y razonamiento multi-paso en dominios STEM (matemáticas, ciencia, ingeniería).
- Razonamiento matemático y resolución de problemas científicos con cadenas de pensamiento explícitas.
- Conocimiento especializado en descubrimiento de fármacos y formulación farmacéutica.
- Capacidades multimodales: la presencia de archivos mmproj (multi-modal supplement) sugiere soporte de visión, aunque no se detalla en la model card.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: orientado a razonamiento, pero sin confirmación de soporte de agentes.
- Capacidades multilingües: limitadas al inglés según el campo language.
- Modo "thinking" o razonamiento extendido: implícito por los datasets de reasoning traces y el nombre "DeepThought".
- Modelo decensurado/abliterado: menor probabilidad de rechazo ante solicitudes sensibles.

## Casos de uso

- **Asistencia en investigación farmacéutica**: el modelo puede generar hipótesis sobre formulaciones y propiedades de fármacos, apoyándose en los datasets especializados de drug discovery incluidos en su entrenamiento. Adecuado por su enfoque específico en química farmacéutica.
- **Tutoría académica en STEM**: resolución guiada de problemas de matemáticas y ciencias con explicaciones paso a paso, gracias a las trazas de razonamiento destiladas de modelos mayores.
- **Generación de código científico**: escritura de scripts de análisis de datos, simulación o cálculo numérico en entornos de investigación, aunque sin confirmación de tool calling.
- **Análisis de literatura científica**: resumen y extracción de información de artículos técnicos en inglés, aprovechando su contexto (longitud no especificada) y su orientación académica.
- **Prototipado rápido en entornos con recursos limitados**: despliegue en GPUs de consumo (por ejemplo, RTX 3060 con cuantización Q4_K_M de 2,9 GB) para pruebas de concepto en laboratorios o startups.
- **Generación de contenido técnico sin restricciones**: gracias a la abliteración, puede emplearse en contextos donde se requiera explorar temas sensibles sin filtros de seguridad, con las advertencias éticas correspondientes.
- **Educación secundaria y universitaria**: creación de ejercicios y soluciones razonadas de matemáticas y física, con la ventaja de ejecutarse localmente sin dependencia de APIs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - Q2_K: ~2,1 GB
  - Q3_K_M: ~2,4 GB
  - Q4_K_M: ~2,9 GB
  - Q5_K_M: ~3,3 GB
  - Q6_K: ~3,7 GB
  - Q8_0: ~4,7 GB
  - f16: ~8,8 GB
  - Añadir ~0,5-0,8 GB si se usa el suplemento multimodal (mmproj).
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para cuantizaciones altas; A100/H100 no necesarias pero válidas para despliegues de mayor concurrencia.
- **¿Cabe en GPU de consumo?**: sí, todas las cuantizaciones hasta Q8_0 caben en GPUs con 6-8 GB de VRAM; f16 requiere ~10 GB.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-inference (TGI) con soporte GGUF, y servidores compatibles con la API de OpenAI (endpoints_compatible).
- **Latencia y throughput estimados**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-DeepThought-STEM (este) | 4,3B | No disponible | Apache 2.0 | GGUF | Especializado en STEM y farmacia, abliterado |
| Qwen3.5-4B (base) | 4,3B | No disponible | Apache 2.0 | Safetensors/GGUF | Modelo generalista sin fine-tuning STEM |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32k (típico) | MIT | GGUF/Safetensors | Razonamiento destilado, menor tamaño |
| Phi-4-mini | 3,8B | 128k | MIT | Safetensors/GGUF | Orientado a STEM, sin abliteración |

No se dispone de datos de rendimiento comparativo en benchmarks para este modelo.

## Limitaciones y advertencias

- **Sesgos conocidos**: al ser un modelo abliterado, puede generar contenido sesgado o inapropiado sin filtros; se recomienda supervisión humana en producción.
- **Riesgo de alucinación**: inherente a modelos de 4B; especialmente en dominios especializados como farmacología, donde una alucinación puede tener consecuencias graves.
- **Limitaciones de contexto e idioma**: solo inglés confirmado; longitud de contexto no especificada, lo que dificulta planificar usos con documentos largos.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero la abliteración puede implicar riesgos legales o reputacionales si se usa en aplicaciones sensibles.
- **Caveat para producción**: la cuantización GGUF introduce pérdida de calidad respecto a f16; para tareas críticas se recomienda Q6_K o Q8_0. El modelo base no ha sido validado con benchmarks públicos, por lo que su rendimiento real es incierto.
- **Origen de los datos**: los datasets de reasoning traces provienen de modelos propietarios (Claude, ChatGPT, GPT-5.6), lo que puede plantear dudas sobre los términos de uso de dichos datos.

## Enlaces

- [Hugging Face - mradermacher/Qwen3.5-4B-DeepThought-STEM-GGUF](https://huggingface.co/mradermacher/Qwen3.5-4B-DeepThought-STEM-GGUF)
- [Modelo base - xtools-at/Qwen3.5-4B-DeepThought-STEM](https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM)
- [Cuantizaciones imatrix - mradermacher/Qwen3.5-4B-DeepThought-STEM-i1-GGUF](https://huggingface.co/mradermacher/Qwen3.5-4B-DeepThought-STEM-i1-GGUF)
- [Página de descargas - hf.tst.eu](https://hf.tst.eu/model#Qwen3.5-4B-DeepThought-STEM-GGUF)
- [FAQ y solicitudes de modelos - mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Guía de uso de GGUF - TheBloke](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Análisis de cuantizaciones - Artefact2](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [nethype GmbH](https://www.nethype.de/)
