# mradermacher/Pyrex-8B-Instruct-Uncensored-GGUF

## Resumen

Pyrex-8B-Instruct-Uncensored-GGUF es la versión cuantizada en formato GGUF del modelo ImposterOnline/Pyrex-8B-Instruct-Uncensored, un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 8B) especializado en generación de código y con un ajuste fino orientado a eliminar restricciones de contenido (uncensored). El trabajo de cuantización lo realiza mradermacher, un conocido publicador de cuantizaciones estáticas en GGUF para su uso con llama.cpp y ecosistemas compatibles.

El modelo base se ha entrenado mediante fine-tuning supervisado (SFT) sobre una mezcla de datasets de código e instrucciones: OpenCoder-LLM/opencoder-sft-stage1, sahil2801/CodeAlpaca-20k, theblackcat102/evol-codealpaca-v1, databricks/databricks-dolly-15k y NousResearch/hermes-function-calling-v1. Esta combinación sugiere un enfoque en generación y edición de código, instrucciones generales y soporte de function calling.

La relevancia de esta ficha radica en que ofrece un modelo de 8B con licencia MIT, cuantizado en múltiples niveles (desde Q2_K hasta f16), lo que permite desplegarlo en hardware de consumo y en entornos de producción con llama.cpp. No se dispone de información sobre arquitectura interna, longitud de contexto ni benchmarks publicados en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de 8B según el nombre y el recuento de parámetros; detalles internos no publicados) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6B) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors está en ImposterOnline/Pyrex-8B-Instruct-Uncensored |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el recuento de parámetros (7.615.616.512) y la nomenclatura "8B", se trata de un modelo transformer de aproximadamente 8.000 millones de parámetros. No se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones técnicas.

El entrenamiento del modelo base consistió en fine-tuning supervisado (SFT) sobre cinco datasets: OpenCoder-LLM/opencoder-sft-stage1 (datos de instrucciones de código), sahil2801/CodeAlpaca-20k (instrucciones de código), theblackcat102/evol-codealpaca-v1 (evolución de instrucciones de código), databricks/databricks-dolly-15k (instrucciones generales) y NousResearch/hermes-function-calling-v1 (function calling). No se indica si hubo RLHF, DPO u otras etapas de alineación posteriores, ni el número total de tokens de entrenamiento. La etiqueta "uncensored" sugiere que se ha reducido o eliminado el filtrado de contenido en las respuestas, aunque no se detalla la metodología.

## Capacidades

- Generación de texto e instrucciones generales en inglés.
- Generación y edición de código, con especial énfasis en tareas de programación (según los datasets de entrenamiento: OpenCoder, CodeAlpaca, evol-codealpaca).
- Soporte de function calling / tool calling, gracias al dataset NousResearch/hermes-function-calling-v1.
- Comportamiento conversacional (etiqueta "conversational" y pipeline text-generation).
- Modo "uncensored": respuestas sin filtros de contenido restrictivos, orientado a usos donde se requiere menor censura.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- No se dispone de información sobre visión, audio, modo thinking ni razonamiento multi-paso explícito.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests unitarios o sugerir refactorizaciones, aprovechando su entrenamiento específico en datasets de código como OpenCoder y CodeAlpaca.
- Asistente de programación en IDE: con cuantizaciones Q4_K_M o Q5_K_M (4,8-5,5 GB) puede ejecutarse en local en estaciones de trabajo con GPU de consumo, ofreciendo autocompletado y explicación de código sin depender de APIs externas.
- Automatización de tareas con function calling: el modelo puede invocar herramientas y APIs estructuradas, adecuado para agentes que necesitan ejecutar acciones (consultas a bases de datos, llamadas HTTP) en entornos controlados.
- Generación de documentación técnica: a partir de código fuente, el modelo puede producir comentarios, docstrings y documentación de API, gracias a su familiaridad con múltiples lenguajes de programación presentes en los datasets de entrenamiento.
- Prototipado rápido de chatbots: al ser conversacional y con licencia MIT, sirve para construir asistentes internos o demos sin restricciones de licencia para uso comercial.
- Investigación sobre modelos sin censura: útil para estudiar el comportamiento de modelos "uncensored" en entornos de investigación controlados, comparando respuestas con modelos alineados.
- Despliegue en edge o entornos con recursos limitados: las cuantizaciones Q2_K (3,1 GB) y Q3_K_S (3,6 GB) permiten ejecución en CPU o GPU con poca VRAM, aunque con pérdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: ~3,1 GB de pesos; requiere al menos ~4 GB de VRAM para contexto corto.
  - Q3_K_S: ~3,6 GB; ~4,5-5 GB de VRAM.
  - Q4_K_M: ~4,8 GB; ~6 GB de VRAM recomendados.
  - Q5_K_M: ~5,5 GB; ~7 GB de VRAM.
  - Q6_K: ~6,4 GB; ~8 GB de VRAM.
  - Q8_0: ~8,2 GB; ~10 GB de VRAM.
  - f16: ~15,3 GB; ~16-18 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100/H100 para f16 o despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q8_0 en GPUs con 8-12 GB de VRAM; f16 requiere GPU de 16 GB o superior.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (p. ej., llama-cpp-python). No se indica soporte nativo para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (contexto, arquitectura) para establecer una comparativa rigurosa con alternativas. Se indica "no disponible" para los campos que requerirían datos no publicados.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Pyrex-8B-Instruct-Uncensored-GGUF | ~7,6B | no disponible | MIT | GGUF | Cuantizaciones estáticas de mradermacher; enfoque en código y uncensored |
| Alternativas de 7-8B (p. ej., Llama 3.1 8B, Qwen2.5 7B, Mistral 7B) | ~7-8B | 32K-128K (según modelo) | varía (Llama, Apache 2.0, etc.) | safetensors, GGUF | No se dispone de comparación directa de rendimiento con Pyrex en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datasets de código e instrucciones en inglés, puede presentar sesgos de dominio y de idioma.
- Riesgo de alucinación: inherente a los modelos de 8B; no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto o idioma: solo inglés; longitud de contexto no disponible, lo que impide planificar usos con ventanas largas.
- Restricciones de licencia: licencia MIT, permite uso comercial con atribución; sin embargo, la naturaleza "uncensored" puede implicar riesgos legales o de cumplimiento en entornos regulados.
- Caveat para producción: el modelo es una cuantización estática; las cuantizaciones Q2_K y Q3_K_M pueden degradar la calidad. Se recomienda Q4_K_M o superior para uso en producción. No hay benchmarks que validen su rendimiento frente a alternativas.
- El modelo base no ha sido evaluado en la información proporcionada; la ausencia de datos de alineación (RLHF/DPO) puede afectar a la utilidad en tareas sensibles.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/Pyrex-8B-Instruct-Uncensored-GGUF
- Modelo base: https://huggingface.co/ImposterOnline/Pyrex-8B-Instruct-Uncensored
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Pyrex-8B-Instruct-Uncensored-i1-GGUF
- Página de resumen de descargas: https://hf.tst.eu/model#Pyrex-8B-Instruct-Uncensored-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Datasets de entrenamiento: https://huggingface.co/datasets/OpenCoder-LLM/opencoder-sft-stage1, https://huggingface.co/datasets/sahil2801/CodeAlpaca-20k, https://huggingface.co/datasets/theblackcat102/evol-codealpaca-v1, https://huggingface.co/datasets/databricks/databricks-dolly-15k, https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
