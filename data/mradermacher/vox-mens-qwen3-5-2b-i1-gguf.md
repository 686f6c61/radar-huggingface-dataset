# mradermacher/vox-mens-qwen3.5-2b-i1-GGUF

## Resumen

vox-mens-qwen3.5-2b-i1-GGUF es una recopilación de cuantizaciones GGUF generadas por mradermacher a partir del modelo brbrainerd/vox-mens-qwen3.5-2b. Se trata de un ajuste fino (QLoRA/RSLoRA) sobre una base Qwen3.5 de aproximadamente 1.880 millones de parámetros, orientado a tareas conversacionales y de código, y publicado bajo licencia Apache 2.0. El repositorio no contiene pesos en formato transformers, sino únicamente ficheros GGUF listos para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.), además del fichero imatrix empleado para generar las cuantizaciones ponderadas.

La relevancia de esta ficha reside en que documenta un modelo pequeño (entorno a 2B) que cabe en hardware de consumo y que incorpora en su etiquetado referencias a gated delta networks, una variante de atención lineal, lo que sugiere una arquitectura híbrida. No obstante, la model card del repositorio es fundamentalmente una plantilla de cuantización de mradermacher: no incluye detalles sobre el entrenamiento, la longitud de contexto, los idiomas soportados más allá del inglés ni resultados de benchmarks. Todo dato no presente en la información disponible se marca explícitamente como no disponible.

El paquete ofrece 25 cuantizaciones distintas, desde IQ1_S (0,8 GB) hasta Q6_K (1,7 GB), lo que permite desplegar el modelo en equipos con muy poca VRAM o incluso en CPU. Es, por tanto, una opción práctica para prototipado local, experimentación con agentes ligeros y pruebas de pipelines de generación de texto en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5, con referencias a gated delta networks en el etiquetado; detalles completos no disponibles |
| Parámetros totales | 1.881.825.088 (≈1,88 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (más fichero imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 ponderadas con imatrix); no se incluyen safetensors en este repositorio |

## Arquitectura y entrenamiento

El modelo base brbrainerd/vox-mens-qwen3.5-2b se construye sobre una arquitectura Qwen3.5, según indican las etiquetas del repositorio, e incorpora referencias explícitas a gated delta networks, un mecanismo de atención lineal recurrente que se ha propuesto como alternativa eficiente a la atención cuadrática completa. El ajuste fino se realizó mediante QLoRA y RSLoRA, técnicas de adaptación de bajo rango, y el etiquetado incluye candle, lo que apunta a que parte del flujo de trabajo se ejecutó con el framework Candle de Hugging Face. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

Los conjuntos de datos citados son brbrainerd/vox-mens-data-vox-lang y brbrainerd/vox-mens-eval-vox-lang-bench, lo que sugiere un entrenamiento y una evaluación centrados en una tarea o dominio denominado vox-lang. El repositorio de cuantización incluye además la etiqueta gate-passed, que probablemente indica que el modelo superó una puerta de calidad interna antes de publicarse. No hay información pública en esta ficha sobre innovaciones adicionales como decodificación especulativa o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogos multi-turno.
- Generación de código, según la etiqueta code del repositorio.
- Compatibilidad con text-generation-inference y vLLM, además de llama.cpp por el formato GGUF.
- Etiquetado como endpoints_compatible, lo que sugiere integración con APIs compatibles con OpenAI.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés (en).
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- Prototipado local de asistentes conversacionales: con cuantizaciones de 1,3–1,5 GB (Q4_K_S, Q4_K_M), el modelo puede ejecutarse en portátiles con 8 GB de RAM o GPUs de gama de entrada, lo que permite iterar sobre prompts y flujos de diálogo sin depender de APIs externas.
- Generación de código en entornos con recursos limitados: la etiqueta code y el tamaño reducido lo hacen adecuado para autocompletado o generación de fragmentos en editores e IDE, siempre que se validen las salidas.
- Despliegue en el edge o en contenedores pequeños: al caber en menos de 2 GB en Q4_K_M, puede incluirse en imágenes Docker ligeras para servicios de texto de baja latencia.
- Evaluación de pipelines de inferencia: sirve como modelo de pruebas para validar integraciones con llama.cpp, Ollama o text-generation-inference antes de migrar a modelos mayores.
- Experimentación con arquitecturas híbridas: su etiqueta gated-delta-networks lo convierte en un candidato para estudiar el comportamiento de mecanismos de atención lineal en tareas conversacionales a pequeña escala.
- Filtrado y clasificación de texto en inglés: con un contexto no documentado pero un tamaño contenido, puede emplearse para tareas de etiquetado o resumen de documentos cortos en lotes.
- Base para ajustes finos posteriores: al ser Apache 2.0 y tener un tamaño manejable, puede servir como punto de partida para QLoRA específicos de dominio en una sola GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,0 y 1,5 GB para cuantizaciones IQ2–Q4; en torno a 1,7 GB para Q6_K. El fichero imatrix ocupa 0,1 GB y solo se usa para generar cuantizaciones propias.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones Q4; una RTX 3060, RTX 4060 o superior ofrece margen para contexto adicional. Para despliegues en servidor, A100 o H100 no son necesarias por el tamaño del modelo, pero pueden usarse para servir múltiples instancias.
- Compatibilidad con GPU de consumo: sí, en la práctica totalidad de GPUs de consumo recientes, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference y vLLM (según las etiquetas del repositorio). El formato GGUF es directamente compatible con llama.cpp y sus derivados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vox-mens-qwen3.5-2b (este, GGUF) | ≈1,88 B | no disponible | Apache 2.0 | GGUF | Hugging Face |
| Qwen2.5-1.5B-Instruct | ≈1,5 B | 32 768 tokens (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Llama 3.2 1B Instruct | ≈1,2 B | 128 000 tokens (según documentación pública de Meta) | Llama 3.2 Community License | safetensors, GGUF | Hugging Face |
| SmolLM2-1.7B-Instruct | ≈1,7 B | 8 192 tokens (según documentación pública de Hugging Face) | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparación se limita a parámetros, contexto y licencia; no se dispone de datos de rendimiento del modelo objeto de esta ficha para comparar benchmarks. Los datos de los modelos alternativos provienen de su documentación pública y pueden variar según la versión.

## Limitaciones y advertencias

- La model card del repositorio es una plantilla de cuantización; no documenta sesgos, datos de entrenamiento ni evaluación de seguridad.
- Riesgo de alucinación inherente a modelos de ~2B, especialmente en tareas de código y razonamiento complejo.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Longitud de contexto no disponible, lo que impide planificar despliegues con documentos largos.
- No se han publicado benchmarks; la calidad real del ajuste fino vox-mens no puede verificarse con los datos disponibles.
- Aunque la licencia es Apache 2.0, conviene revisar la licencia del modelo base y de los datasets citados antes de un uso comercial.
- El repositorio contiene únicamente GGUF; para usar transformers o safetensors hay que acudir al modelo base brbrainerd/vox-mens-qwen3.5-2b.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/vox-mens-qwen3.5-2b-i1-GGUF
- Modelo base: https://huggingface.co/brbrainerd/vox-mens-qwen3.5-2b
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/vox-mens-qwen3.5-2b-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#vox-mens-qwen3.5-2b-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/brbrainerd/vox-mens-data-vox-lang
- Dataset de evaluación: https://huggingface.co/datasets/brbrainerd/vox-mens-eval-vox-lang-bench
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
