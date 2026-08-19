# lactroiii/NVIDIA-Nemotron-3-Super-120B-A12B-BF16

## Resumen

NVIDIA Nemotron-3-Super-120B-A12B-BF16 es un modelo de lenguaje de gran escala desarrollado por NVIDIA, diseñado específicamente para flujos de trabajo agénticos, razonamiento de contexto largo y cargas de trabajo de alto volumen. Forma parte de la familia Nemotron 3, que incluye los modelos Nano, Super y Ultra, y representa la primera implementación de la arquitectura Latent MoE en la serie, combinando capas intercaladas de Mamba-2, MoE y Attention selectiva.

El modelo cuenta con 120.000 millones de parámetros totales, de los cuales solo 12.000 millones se activan por token, lo que permite un rendimiento competitivo con un coste computacional significativamente reducido. Incorpora capas de Multi-Token Prediction (MTP) para acelerar la generación de texto y mejorar la calidad, y soporta una ventana de contexto de hasta 1 millón de tokens. Fue entrenado con cuantización nativa NVFP4 para maximizar la eficiencia computacional durante el entrenamiento.

La relevancia de este modelo radica en su enfoque híbrido Mamba-Transformer, que combina las ventajas de las SSM (State Space Models) para el procesamiento eficiente de secuencias largas con la capacidad de atención tradicional para tareas de razonamiento complejo. Su licencia abierta permite uso comercial, y NVIDIA publica tanto los pesos como los datasets de pre-entrenamiento y post-entrenamiento, lo que facilita la reproducibilidad y la investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE híbrida: Mamba-2 + MoE + Attention, con Multi-Token Prediction (MTP) |
| Parametros totales | 123.611.012.096 (120B) |
| Parametros activos | 12.000 millones (12B) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | BF16 (pesos originales), NVFP4 (entrenamiento y versiones optimizadas) |
| Idiomas soportados | Inglés, francés, alemán, italiano, japonés, español y chino |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors (BF16), versiones NVFP4 disponibles |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Latent Mixture-of-Experts (LatentMoE) híbrida que intercala capas de Mamba-2, capas MoE y capas de atención selectiva. Esta combinación permite procesar secuencias largas de forma eficiente gracias a las SSM, mientras que las capas de atención mantienen la capacidad de razonamiento profundo y recuperación de información precisa. Las capas MTP (Multi-Token Prediction) permiten predecir múltiples tokens por paso de decodificación, acelerando la generación y mejorando la coherencia del texto.

El entrenamiento se realizó con aproximadamente 25 billones de tokens, con un corpus de pre-entrenamiento con cutoff en junio de 2025 y datos de post-entrenamiento con cutoff en febrero de 2026. El post-entrenamiento incluye datos curados y generados sintéticamente de alta calidad, junto con una pequeña porción de datos de question-answering y alineación. El modelo fue pre-entrenado en NVFP4, una cuantización de 4 bits desarrollada por NVIDIA, y posteriormente se aplicó un proceso de alineación por RL multi-entorno para optimizar el comportamiento agéntico y de razonamiento.

Una característica destacable es el modo de razonamiento configurable: el modelo puede activar o desactivar el "thinking mode" mediante un flag en el chat template (`enable_thinking=True/False`), lo que permite ajustar el equilibrio entre latencia y calidad de razonamiento según el caso de uso.

## Capacidades

- Generación de texto y conversación multi-turno en 7 idiomas: inglés, francés, alemán, italiano, japonés, español y chino.
- Razonamiento agéntico avanzado: el modelo genera un trace de razonamiento antes de la respuesta final, configurable mediante el chat template.
- Soporte de tool calling y function calling para integración con APIs y herramientas externas.
- Capacidades de agente multi-paso con razonamiento de horizonte largo, optimizado para flujos de trabajo agénticos.
- RAG (Retrieval-Augmented Generation) gracias a su ventana de contexto de 1M tokens, que permite procesar documentos extensos completos.
- Multi-Token Prediction (MTP) para generación más rápida sin sacrificar calidad.
- Razonamiento matemático y lógico, entrenado con datasets específicos de post-entrenamiento.
- Generación de código y asistencia en tareas de programación.
- Modo de razonamiento configurable (thinking on/off) para adaptar la latencia según el escenario.

## Casos de uso

- Automatización de tickets de TI: el modelo puede gestionar conversaciones multi-turno con contexto largo, clasificar incidencias, proponer soluciones y escalar a agentes humanos cuando sea necesario. Su ventana de 1M tokens permite mantener el historial completo de la conversación y la documentación técnica relevante.
- Agentes de atención al cliente multilingüe: con soporte para 7 idiomas, puede desplegarse como agente conversacional que mantiene el contexto de la interacción y deriva a canales apropiados. El modo de razonamiento permite explicar sus decisiones internamente antes de responder.
- Análisis de documentos extensos y RAG: la ventana de contexto de 1M tokens permite procesar libros técnicos completos, expedientes legales o informes financieros sin necesidad de chunking agresivo, mejorando la precisión de las respuestas basadas en recuperación.
- Asistente de programación en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests y documentación automática. Su capacidad de razonamiento multi-paso ayuda a depurar errores complejos.
- Investigación académica y síntesis de literatura: el modelo puede resumir y comparar múltiples papers científicos, extrayendo conclusiones y detectando contradicciones gracias a su capacidad de procesar contextos muy largos.
- Automatización de procesos de negocio: puede actuar como agente que consulta APIs internas, rellena formularios, extrae datos de documentos y ejecuta flujos de trabajo multi-paso, con razonamiento verificable en cada paso.
- Traducción y localización: aunque no está especializado como modelo de traducción, su soporte multilingüe permite traducciones de alta calidad con preservación del contexto a lo largo de documentos extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la informacion disponible. La model card incluye una gráfica de precisión (accuracy_chart.png) que no ha sido analizada en esta ficha. Se recomienda consultar el informe técnico oficial de NVIDIA para datos comparativos detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 247 GB, por lo que requiere al menos 8× H100-80GB para ejecutarse completo en BF16.
- GPU recomendadas: NVIDIA H100-80GB (mínimo 8 unidades) para la versión BF16. Para despliegues en una sola GPU, NVIDIA recomienda la versión NVFP4, que puede ejecutarse en un B200 o DGX Spark.
- No cabe en GPUs de consumo: las GPUs consumer (RTX 4090, etc.) no disponen de suficiente VRAM para este modelo, ni siquiera en cuantizaciones agresivas.
- Opciones de despliegue: compatible con el ecosistema transformers de HuggingFace, NVIDIA NIM (disponible en build.nvidia.com), y backends de servición compatibles con endpoints.
- Latencia y throughput: no disponible en la información proporcionada. La arquitectura MTP y la cuantización NVFP4 están diseñadas para reducir la latencia, pero no se han publicado cifras concretas.
- Parámetros de inferencia recomendados: temperature=1.0 y top_p=0.95 para todas las tareas y backends de servición.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|---|
| Nemotron-3-Super-120B-A12B | 120B | 12B | 1M tokens | LatentMoE híbrida (Mamba-2 + MoE + Attention) | NVIDIA Nemotron Open Model License |
| Nemotron-3-Nano | no disponible | no disponible | no disponible | LatentMoE (sin MTP) | NVIDIA Nemotron Open Model License |
| Nemotron-3-Ultra | no disponible | no disponible | no disponible | no disponible | NVIDIA Nemotron Open Model License |

La familia Nemotron 3 se posiciona como una alternativa eficiente a modelos densos de tamaño similar, con la ventaja de la ventana de contexto de 1M tokens y la arquitectura híbrida Mamba-Transformer. No se dispone de datos suficientes para comparar con modelos de otros desarrolladores (como DeepSeek, Qwen o Llama) en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones de sesgos específicas para este modelo en la información disponible.
- Riesgo de alucinación: como todo LLM, puede generar información plausible pero incorrecta, especialmente en dominios especializados o con datos posteriores a su cutoff (junio 2025 para pre-entrenamiento, febrero 2026 para post-entrenamiento).
- Limitaciones de idioma: aunque soporta 7 idiomas, el rendimiento puede variar significativamente entre ellos. No se han publicado métricas de rendimiento por idioma.
- Restricciones de licencia: la NVIDIA Nemotron Open Model License permite uso comercial, pero es necesario revisar los términos específicos, especialmente en lo que respecta a redistribución y uso en productos de terceros.
- Requisitos de hardware: el modelo en BF16 requiere infraestructura de nivel centro de datos (8× H100). Las versiones cuantizadas (NVFP4) reducen el requisito pero siguen necesitando hardware profesional.
- Complejidad de despliegue: la arquitectura híbrida Mamba-Transformer puede requerir adaptaciones en los backends de inferencia. No todos los servidores de modelos soportan esta combinación de capas.
- El modelo es un mirror de la versión oficial de NVIDIA (el autor del repo es "lactroiii", no NVIDIA). Se recomienda verificar la autenticidad de los pesos antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lactroiii/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Versión oficial en HuggingFace (NVFP4): https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4
- Página de investigación de Nemotron 3 Super: https://research.nvidia.com/labs/nemotron/Nemotron-3-Super/
- Página de la familia Nemotron 3: https://research.nvidia.com/labs/nemotron/Nemotron-3/
- Informe técnico (PDF): https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Chat interactivo en build.nvidia.com: https://build.nvidia.com/nvidia/nemotron-3-super-120b-a12b
- Datasets de pre-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Datasets de post-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
