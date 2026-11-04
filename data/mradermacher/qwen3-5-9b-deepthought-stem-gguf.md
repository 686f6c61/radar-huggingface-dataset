# mradermacher/Qwen3.5-9B-DeepThought-STEM-GGUF

## Resumen

Qwen3.5-9B-DeepThought-STEM-GGUF es la versión cuantizada en formato GGUF del modelo xtools-at/Qwen3.5-9B-DeepThought-STEM, un ajuste fino (fine-tuning) mediante LoRA y PEFT sobre la base Qwen3.5 de 9B. El modelo original está orientado a razonamiento científico y matemático (STEM), con un énfasis particular en descubrimiento de fármacos y formulación farmacéutica, y ha sido entrenado con un conjunto de datos que incluye trazas de razonamiento de modelos como DeepSeek, además de datasets sintéticos específicos del dominio farmacéutico y el corpus generalista smoltalk2.

La versión GGUF la publica mradermacher, un conocido cuantizador de la comunidad, que ofrece múltiples niveles de cuantización (desde Q2_K hasta f16) para facilitar el despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles. Incluye además ficheros mmproj, lo que indica soporte multimodal (visión) heredado del modelo base.

El modelo es relevante porque combina un tamaño manejable (8.950 millones de parámetros) con capacidades de razonamiento especializado en STEM y farmacia, licencia Apache 2.0 y disponibilidad en GGUF, lo que permite ejecutarlo localmente en GPUs de consumo. No obstante, conviene señalar que el repositorio registra cero descargas y cero likes en el momento de la consulta, y que parte de los datasets de entrenamiento tienen nombres que sugieren contenido sintético o generado, lo que exige cautela sobre la calidad y veracidad de sus respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5), ajuste fino con LoRA/PEFT |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 (y variantes i1 ponderadas/imatrix en repo separado) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base original en safetensors) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen3.5, con 8.953.803.264 parámetros. Sobre esa base se aplicó un ajuste fino supervisado (SFT) mediante LoRA y PEFT, según indican las etiquetas del repositorio. El entrenamiento se apoya en una mezcla de datasets que incluye trazas de razonamiento de alto nivel (Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x, Xiaomi-MiMo-2.6-Pro-High-Reasoning-250x, ChatGPT-6.1-Terra-High-Reasoning-TraceInversion-80x, GPT-5.6-luna-reasoning-102881x, GLM-5.1-Reasoning-1M-Cleaned, GLM-5.1-1000000x), datasets sintéticos de descubrimiento de fármacos y formulación farmacéutica (red-pill-drug-discovery-formulation-synthetic-reasoning, red-pill-drug-discovery-formulation) y el corpus generalista HuggingFaceTB/smoltalk2.

Entre las innovaciones técnicas destacables figuran el uso de destilación de razonamiento (distillation) a partir de trazas de modelos mayores, el ajuste con Unsloth (etiqueta unsloth) para eficiencia de entrenamiento, y la presencia de etiquetas como heretic, uncensored, decensored y abliterated, que sugieren que se ha aplicado alguna técnica de eliminación de rechazos o "ablación" de comportamientos de seguridad. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre si se aplicó RLHF o DPO en la información proporcionada. Los ficheros mmproj incluidos en el repo GGUF indican que el modelo conserva capacidad multimodal (visión) del base.

## Capacidades

- Generación de texto y razonamiento multi-paso, con énfasis en matemáticas y ciencias (STEM).
- Razonamiento científico especializado en descubrimiento de fármacos y formulación farmacéutica.
- Capacidad multimodal (visión) indicada por la presencia de ficheros mmproj en el repositorio GGUF.
- Soporte de conversación multi-turno (etiqueta conversational).
- Compatibilidad con text-generation-inference (TGI) y endpoints compatibles.
- Capacidades multilingües limitadas: el único idioma declarado es el inglés (en).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes: no disponible en la información proporcionada.
- Modo "thinking" o razonamiento extendido: no confirmado explícitamente, aunque las trazas de razonamiento del entrenamiento sugieren esta orientación.

## Casos de uso

- Asistencia en investigación farmacéutica: el modelo puede generar hipótesis y borradores de formulación a partir de descripciones textuales, aprovechando los datasets sintéticos de drug discovery con los que fue ajustado.
- Resolución de problemas matemáticos y científicos: adecuado para tutoría o generación de explicaciones paso a paso en entornos educativos de STEM, gracias a las trazas de razonamiento incluidas en el entrenamiento.
- Prototipado local de asistentes técnicos: al estar en GGUF, se puede ejecutar con llama.cpp u Ollama en una estación de trabajo con GPU de consumo para experimentar con razonamiento científico sin depender de la nube.
- Análisis de documentación científica con imágenes: la presencia de mmproj permite procesar figuras, tablas o diagramas junto con texto en flujos de revisión de literatura.
- Generación de borradores de informes técnicos: el modelo puede redactar secciones de metodología o resultados en inglés a partir de notas, con revisión humana obligatoria por el riesgo de alucinación.
- Investigación sobre alineación y seguridad: al incluir etiquetas uncensored/abliterated, sirve como caso de estudio para evaluar comportamientos sin rechazos en modelos abiertos, siempre en entornos controlados.
- Despliegue en pipelines de TGI: la compatibilidad declarada con text-generation-inference permite integrarlo en servicios de inferencia existentes para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~3,9 GB; Q3_K_S ~4,4 GB; Q4_K_S ~5,5 GB; Q4_K_M ~5,7 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18 GB. Añadir ~0,7-1,0 GB si se usa el mmproj multimodal.
- GPU recomendadas: para Q4_K_M basta una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB; para Q8_0 se recomienda RTX 4090 (24 GB) o A100/H100 en entornos de servidor; f16 requiere 24 GB o más.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones Q4 y Q5 con GPUs de 8-12 GB; las variantes Q8_0 y f16 requieren GPUs de gama alta o profesionales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base admite text-generation-inference y transformers.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-DeepThought-STEM-GGUF (este) | ~8,95 B | no disponible | Apache 2.0 | GGUF | Especializado en STEM y farmacia, multimodal vía mmproj |
| Modelo base xtools-at/Qwen3.5-9B-DeepThought-STEM | ~8,95 B | no disponible | Apache 2.0 | safetensors | Mismo modelo sin cuantizar |
| Qwen3.5-9B (base genérica) | ~9 B | no disponible | no disponible | safetensors/GGUF | Modelo generalista del que deriva |
| Alternativas de 7-9 B en GGUF (p. ej. Llama o Mistral de tamaño similar) | 7-9 B | no disponible | varía | GGUF | No se dispone de datos comparativos de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse mayoritariamente con datos en inglés y datasets sintéticos, es probable que herede sesgos de esas fuentes.
- Riesgo de alucinación: elevado en dominios especializados como farmacia o formulación, ya que parte de los datos de entrenamiento son sintéticos; no debe usarse para decisiones clínicas o regulatorias sin validación experta.
- Limitaciones de idioma: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Limitaciones de contexto: la longitud de contexto no está disponible y debe verificarse antes de usarlo en tareas de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero las etiquetas uncensored/abliterated implican que el modelo puede generar contenido sin filtros; el despliegue en producción exige moderación externa y revisión legal.
- Caveat de producción: el repositorio tiene cero descargas y cero likes, y fue creado recientemente; no hay evidencia de validación comunitaria ni de benchmarks independientes.
- Los nombres de los datasets de entrenamiento sugieren contenido generado por otros modelos, lo que puede propagar errores o estilos no deseados.
- El tamaño del repositorio (83 GB) refleja la suma de todas las cuantizaciones; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.5-9B-DeepThought-STEM-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Qwen3.5-9B-DeepThought-STEM-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-9B-DeepThought-STEM-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset smoltalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
