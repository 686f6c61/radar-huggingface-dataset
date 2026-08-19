# ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B es un modelo de lenguaje de gran tamaño (LLM) desarrollado por NVIDIA, diseñado específicamente para tareas de agentes especializados y razonamiento eficiente. Pertenece a la familia Nemotron 3.5 Lightning, que se posiciona como una alternativa abierta y ligera para ejecutar agentes de alta frecuencia donde no se requiere la capacidad de un modelo frontera. El modelo utiliza una arquitectura híbrida Latent Mixture-of-Experts (LatentMoE) que intercala capas Mamba-2 y capas MoE con capas de atención selectiva, activando solo 3.000 millones de sus 30.000 millones de parámetros por token, lo que permite un rendimiento elevado con un coste computacional reducido.

La versión GGUF aquí descrita, publicada por ggml-org, es una conversión del modelo original de NVIDIA pensada para su ejecución con llama.cpp y servidores compatibles con la API de OpenAI, como llama-server. Esto facilita el despliegue en entornos locales o en la nube con herramientas estándar del ecosistema open source. El modelo es de solo texto, con capacidades de razonamiento y codificación, y su fecha de corte de datos de post-entrenamiento es mayo de 2026, lo que lo hace relevante para aplicaciones que requieren información actualizada. La licencia y los idiomas soportados no se han especificado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida LatentMoE (Mamba-2 + MoE + capas de atención selectiva) |
| Parametros totales | 30.000 millones (30B) |
| Parametros activos | 3.000 millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF, se asume múltiples cuantizaciones Q) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors disponible en el modelo base de NVIDIA) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida Latent Mixture-of-Experts (LatentMoE) que combina capas de estado espacial Mamba-2 con capas de mezcla de expertos (MoE) y capas de atención selectiva. Esta combinación busca aprovechar la eficiencia de las SSM (state space models) para secuencias largas, la escalabilidad de los MoE y la capacidad de razonamiento de la atención tradicional. Con 30B parámetros totales y solo 3B activos por token, el modelo reduce significativamente el coste de inferencia en comparación con un modelo denso de tamaño similar.

Los detalles sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no están disponibles en la información proporcionada. Se sabe que el post-entrenamiento tiene una fecha de corte de mayo de 2026, lo que indica que los datos de entrenamiento son relativamente recientes. NVIDIA lo describe como un modelo abierto con pesos, datos de entrenamiento y recetas publicados, siguiendo la filosofía de la familia Nemotron.

## Capacidades

- Generación de texto y razonamiento multi-step, orientado a tareas de agentes que requieren planificación y ejecución.
- Codificación de software, con soporte para generación y depuración de código.
- Solo texto: no procesa imágenes, audio ni vídeo.
- Capacidades de tool calling y function calling, necesarias para integrarse con APIs y herramientas externas en flujos de agente.
- Diseñado para tareas especializadas de alta frecuencia, donde prima la latencia baja y el coste reducido.
- Soporte para enrutamiento inteligente mediante NeMo Switchyard, que permite derivar consultas simples al modelo Lightning y reservar modelos frontera para tareas complejas.

## Casos de uso

- Agentes de atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con razonamiento básico y acceso a herramientas (consultas de pedidos, devoluciones) gracias a su capacidad de tool calling y su baja latencia, ideal para entornos de producción con alto volumen de peticiones.
- Asistentes de codificación en tiempo real: integrado en IDE o pipelines de CI/CD, puede sugerir fragmentos de código, explicar errores y generar tests, aprovechando su entrenamiento en tareas de programación y su eficiencia para responder en milisegundos.
- Enrutamiento de consultas en arquitecturas multi-modelo: con NeMo Switchyard, el modelo actúa como ejecutor de tareas rutinarias (extracción de datos, resúmenes cortos) mientras que un modelo más grande se reserva para razonamiento complejo, reduciendo costes operativos.
- Automatización de procesos de negocio (RPA): puede interpretar instrucciones en lenguaje natural, llamar a APIs internas y ejecutar acciones en sistemas legacy, gracias a su soporte de function calling y su capacidad de seguir instrucciones multi-paso.
- Generación de informes y resúmenes ejecutivos: con su contexto de datos actualizado hasta mayo de 2026, puede sintetizar documentos extensos y extraer conclusiones accionables en entornos corporativos.
- Chatbots especializados en dominios técnicos: por su naturaleza de solo texto y su razonamiento eficiente, es adecuado para foros de soporte, documentación interactiva o asistentes de conocimiento interno donde se requiera precisión y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo MoE con 3B activos, la memoria necesaria depende de la cuantización GGUF elegida, pero no se especifican valores concretos en la información proporcionada.
- GPU recomendadas: no disponible. Se puede inferir que al ser un modelo de 30B con 3B activos, cabría en GPUs de consumo como RTX 4090 (24 GB) con cuantización Q4 o inferior, pero no hay confirmación oficial.
- Opciones de despliegue: llama.cpp (llama-server), compatible con la API de OpenAI. También puede ejecutarse con vLLM, Ollama u otros motores que soporten GGUF, aunque la recomendación oficial es llama-server.
- Latencia y throughput: no disponible. La arquitectura MoE con pocos parámetros activos sugiere una latencia baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables con otros modelos de la misma categoría (MoE de ~30B con ~3B activos). Alternativas conocidas en este espacio incluyen Qwen2.5-32B-A3B o DeepSeek-V3-Lite, pero no se han encontrado comparaciones directas en las fuentes consultadas. La información disponible no permite establecer una tabla comparativa objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible, pero al ser un modelo entrenado con datos web, es probable que herede sesgos sociales y culturales.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en dominios poco representados en sus datos de entrenamiento.
- Limitaciones de contexto: la longitud de contexto no se ha especificado, por lo que no se puede garantizar un rendimiento óptimo en tareas que requieran ventanas muy largas.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada. Se recomienda verificar los términos de uso en el repositorio oficial de NVIDIA antes de un despliegue comercial.
- Solo texto: no admite entradas multimodales, lo que limita su uso en aplicaciones que requieran comprensión de imágenes o audio.
- Fecha de corte de datos: mayo de 2026, por lo que no tiene conocimiento de eventos posteriores a esa fecha.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/NVIDIA/NVIDIA-Nemotron-3.5-Lightning-30B-A3B
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Página de NVIDIA sobre Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Documentación de inicio rápido para Nemotron 3.5 Lightning: https://docs.nvidia.com/nim/large-language-models/latest/get-started/advanced/get-started-nemotron-3.5-lightning.html
- Colección de modelos Nemotron v3 en HuggingFace: https://huggingface.co/collections/nvidia/nvidia-nemotron-v3
