# mradermacher/Qwen3.8-27B-ComfyUI-GGUF

## Resumen

El repositorio `mradermacher/Qwen3.8-27B-ComfyUI-GGUF` contiene cuantizaciones GGUF del modelo `Rom3rk/Qwen3.8-27B-ComfyUI`, un fine-tune del modelo Qwen3.8-27B de Alibaba orientado a flujos de trabajo de ComfyUI. El cuantizador, mradermacher, publica versiones estáticas en varios formatos (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, IQ4_XS y f16) junto con los ficheros multimodales (mmproj) necesarios para la parte de visión. El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parámetros con capacidades de visión y lenguaje, contexto nativo de 262 144 tokens y licencia Apache-2.0.

La relevancia de esta cuantización radica en que permite ejecutar un modelo de 27B con visión y razonamiento en hardware de consumo (GPUs de 16-24 GB) mediante GGUF, integrándolo en el ecosistema ComfyUI a través de nodos como ComfyUI-GGUF-FX. El fine-tune específico para ComfyUI sugiere un ajuste orientado a tareas de generación de prompts, descripción de imágenes o asistentes conversacionales dentro de ese entorno. Al ser una cuantización estática, no se han aplicado técnicas de imatrix ni de ponderación por importancia, según indica el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con módulo de visión (vision-language) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 |
| Idiomas soportados | Inglés (etiqueta del repo); el modelo base Qwen3.8-27B es multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con ficheros mmproj en Q8_0 y f16) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo de la familia Qwen3.8 de Alibaba, de arquitectura transformer densa con un módulo de visión que procesa imágenes y video (hasta una hora de duración). El contexto nativo es de 262 144 tokens, ampliable hasta 1 000 000 mediante una función alojada en Qwen Cloud (aún no disponible localmente). El modelo base fue entrenado con un enfoque de razonamiento y capacidades de agente, según la documentación de Unsloth.

El fine-tune `Rom3rk/Qwen3.8-27B-ComfyUI` se realizó mediante SFT (supervised fine-tuning) con la librería Unsloth, según los tags del repositorio. No se dispone de detalles sobre el dataset de entrenamiento ni sobre el proceso exacto. La cuantización de mradermacher es una conversión estática de los pesos a formato GGUF, sin aplicar técnicas de imatrix ni de cuantización ponderada. Los ficheros mmproj (multi-modal projection) se incluyen por separado para habilitar la parte de visión en los runners GGUF.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.8-27B está diseñado para tareas de chat, razonamiento y codificación, con soporte de agentes (multi-step reasoning).
- Visión y lenguaje: procesa imágenes y video, pudiendo describir contenido visual o responder preguntas sobre él.
- Integración con ComfyUI: el fine-tune está orientado a flujos de trabajo de ComfyUI, lo que sugiere capacidades específicas para generar prompts de difusión o describir imágenes de entrada.
- Contexto largo: ventana de 262 144 tokens, adecuada para documentos extensos o conversaciones multi-turno.
- Multilingüismo: el modelo base soporta varios idiomas, aunque el repo está etiquetado como inglés.
- Tool calling: no confirmado explícitamente, pero las capacidades de agente del modelo base sugieren soporte para llamadas a herramientas.

## Casos de uso

- Generación de prompts para ComfyUI: el modelo puede producir descripciones detalladas y estilizadas para guiar la generación de imágenes en flujos de trabajo de ComfyUI, aprovechando el fine-tune específico.
- Descripción de imágenes de entrada: gracias al módulo de visión, puede analizar una imagen y generar un texto descriptivo, útil para anotación automática o para alimentar otros nodos del pipeline.
- Asistente conversacional con contexto largo: con 256K de contexto, puede mantener conversaciones extensas sobre documentos o historiales largos, integrándose en aplicaciones de chat.
- Razonamiento multimodal: combina entrada visual y textual para tareas de pregunta-respuesta sobre imágenes o video, por ejemplo en entornos de investigación.
- Agente de codificación: el modelo base tiene capacidades de agente y codificación, por lo que puede usarse para generar o revisar código dentro de un entorno de desarrollo.
- Análisis de video: al soportar video de hasta una hora, puede resumir o extraer información de secuencias largas, aunque la cuantización puede afectar la precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantización no incluye métricas de rendimiento, y la model card del modelo base no se ha proporcionado en su totalidad. Se recomienda consultar la página de Qwen/Qwen3.8-27B para obtener datos de evaluación del modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, el modelo ocupa aproximadamente 16-18 GB, lo que permite ejecutarlo en GPUs de consumo con 24 GB (RTX 3090, RTX 4090) o incluso en algunas de 16 GB con cuantizaciones más agresivas (Q3_K_M o IQ4_XS).
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB). Para cuantizaciones Q8_0 o f16 se necesitan al menos 32 GB de VRAM.
- Compatibilidad con consumer GPU: sí, con cuantizaciones Q4 o inferiores en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI, y específicamente ComfyUI mediante el nodo ComfyUI-GGUF-FX.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente esta cuantización con otras alternativas. A nivel de modelo base, Qwen3.8-27B compite con otros modelos vision-language de tamaño similar, como Qwen2.5-VL-27B (si existiera) o LLaVA-NeXT-34B. Sin embargo, no se han proporcionado métricas comparativas en la información disponible. La principal ventaja de este repo es su integración específica con ComfyUI y la disponibilidad de múltiples cuantizaciones GGUF.

## Limitaciones y advertencias

- Sesgos: no se ha documentado ningún sesgo específico, pero el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento o descripción visual.
- Limitaciones de contexto: aunque el contexto nativo es de 262 144 tokens, el rendimiento puede degradarse con entradas muy largas; la ampliación a 1M tokens solo está disponible en la nube de Qwen.
- Idioma: el repo está etiquetado como inglés; aunque el modelo base es multilingüe, el fine-tune para ComfyUI puede estar optimizado principalmente para inglés.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones significativas, pero se debe mantener la atribución.
- Cuantización estática: al no usar imatrix, la calidad puede ser ligeramente inferior a cuantizaciones ponderadas del mismo tamaño.
- Dependencia de ComfyUI: el fine-tune está pensado para ese ecosistema; su uso fuera de él puede no aprovechar todo su potencial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-ComfyUI-GGUF
- Modelo base (fine-tune): https://huggingface.co/Rom3rk/Qwen3.8-27B-ComfyUI
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Nodo ComfyUI-GGUF-FX: https://github.com/weekii/ComfyUI-GGUF-FX
- Guía para ejecutar Qwen 3.8 localmente: https://codersera.com/blog/how-to-run-qwen-3-8-locally-2026/
