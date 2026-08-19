# mradermacher/Nemotron-3.5-30B-A3B-Antislop-FTPO-i1-GGUF

## Resumen

Nemotron-3.5-30B-A3B-Antislop-FTPO-i1-GGUF es una cuantización en formato GGUF del modelo Nemotron-3.5-30B-A3B-Antislop-FTPO, desarrollado por thoughtworks y cuantizado por mradermacher. Este modelo es una variante fine-tuned del NVIDIA Nemotron-3.5 Lightning, una familia de modelos de lenguaje de gran tamaño diseñada para razonamiento rápido, generación de código y flujos de trabajo agénticos. La variante "Antislop-FTPO" está orientada a la escritura creativa, con el objetivo de reducir el "slop" (contenido genérico y repetitivo) mediante un ajuste fino con optimización de preferencias (FTPO).

El modelo emplea una arquitectura híbrida Latent Mixture-of-Experts (LatentMoE) que combina capas intercaladas de Mamba-2 y MoE, junto con capas de atención selectivas. Tiene 30 mil millones de parámetros en total, de los cuales solo 3 mil millones se activan por token, lo que lo hace eficiente para inferencia en un solo nodo. El modelo base fue pre-entrenado con más de 20 billones de tokens y soporta seis idiomas: inglés, español, francés, alemán, italiano y japonés. Esta versión cuantizada está disponible en dos formatos GGUF (i1-Q2_K e i1-IQ3_M) con tamaños de aproximadamente 19 GB, adecuados para GPUs de consumo con 24 GB de VRAM.

La relevancia de este modelo radica en su equilibrio entre capacidad y eficiencia: al ser un MoE con solo 3B parámetros activos, ofrece un rendimiento comparable a modelos densos mucho más grandes, pero con un coste computacional significativamente menor. Además, su fine-tuning específico para escritura creativa lo convierte en una opción interesante para aplicaciones de generación de contenido literario, guiones y narrativa, donde la calidad del texto y la originalidad son críticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida LatentMoE: capas intercaladas de Mamba-2 y MoE, con capas de atención selectivas |
| Parametros totales | 30 mil millones (30B) |
| Parametros activos | 3 mil millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (18.8 GB), i1-IQ3_M (19.0 GB) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base, NVIDIA Nemotron-3.5 Lightning, emplea una arquitectura híbrida Latent Mixture-of-Experts (LatentMoE) que intercala capas de Mamba-2 (una variante de state space model) con capas de MoE, además de incluir capas de atención selectivas. Esta combinación permite capturar dependencias de largo alcance de forma eficiente (Mamba-2) mientras mantiene la capacidad de razonamiento profundo de los transformers (atención). El modelo tiene 30B parámetros totales, pero solo 3B se activan por token, lo que reduce drásticamente el coste computacional en inferencia.

El pre-entrenamiento del modelo base se realizó con más de 20 billones de tokens, incluyendo una pequeña porción de datos de question-answering y alineación para mejorar la precisión. El corpus de post-entrenamiento consistió en datos curados y generados sintéticamente de alta calidad. La variante "Antislop-FTPO" de thoughtworks añade un fine-tuning adicional orientado a la escritura creativa, utilizando probablemente una técnica de optimización de preferencias (FTPO, Fine-Tuning with Preference Optimization) para reducir el "slop" y mejorar la originalidad del texto generado. No se dispone de detalles específicos sobre el dataset de fine-tuning ni el proceso exacto.

## Capacidades

- Generación de texto creativo: el fine-tuning "Antislop" está diseñado para producir narrativa original y evitar clichés o contenido genérico.
- Razonamiento y resolución de problemas: gracias a la arquitectura híbrida y los 3B parámetros activos, el modelo mantiene capacidades sólidas de razonamiento lógico y matemático.
- Generación de código: el modelo base fue entrenado para tareas de programación, y esta variante conserva esa capacidad.
- Soporte de tool calling / function calling: el modelo está diseñado para flujos de trabajo agénticos, permitiendo invocar herramientas externas.
- Capacidades multilingües: soporta seis idiomas (inglés, español, francés, alemán, italiano y japonés), aunque el fine-tuning creativo puede estar más optimizado para inglés.
- Modo conversacional: el modelo es compatible con interacciones multi-turno, adecuado para chatbots y asistentes.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar cuentos, poemas, guiones o novelas con un estilo más natural y menos "slop". Un escritor podría usarlo como herramienta de brainstorming o para superar bloqueos creativos, proporcionando borradores que luego edita.
- Generación de contenido para marketing: redacción de eslóganes, descripciones de productos o publicaciones en redes sociales con un tono original y atractivo, evitando frases hechas.
- Asistente de código en producción: gracias a su soporte de tool calling y su capacidad de razonamiento, puede integrarse en pipelines de CI/CD para autocompletar código, generar tests o documentar funciones, con baja latencia gracias a sus 3B parámetros activos.
- Chatbot de atención al cliente multilingüe: el modelo puede gestionar conversaciones en varios idiomas, manteniendo un tono natural y coherente, y derivando consultas complejas a sistemas externos mediante function calling.
- Traducción y localización creativa: aunque no es un modelo de traducción dedicado, su capacidad multilingüe permite adaptar contenido creativo (como campañas publicitarias) a diferentes idiomas preservando el estilo.
- Agente autónomo para investigación: el modelo puede razonar sobre documentos largos (si se conoce el contexto) y ejecutar múltiples pasos de razonamiento, útil para tareas de análisis y síntesis de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la variante "Antislop-FTPO" en la información disponible. El modelo base NVIDIA Nemotron-3.5 Lightning ha sido evaluado en tareas de razonamiento, codificación y agentes, pero no se proporcionan cifras concretas en los resultados de búsqueda. Por tanto, no se incluye tabla de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: los quants i1-Q2_K (18.8 GB) e i1-IQ3_M (19.0 GB) requieren al menos 20 GB de VRAM para cargar el modelo completo. Con contexto adicional, se recomienda 24 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100 (40 GB), H100 (80 GB) o superiores. En GPUs con 16 GB (como RTX 4080) podría ser posible con cuantizaciones más agresivas, pero no se ofrecen en este repo.
- Cabe en GPUs de consumo: sí, en tarjetas con 24 GB de VRAM (RTX 3090/4090) se puede ejecutar cómodamente.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y servidores como llama.cpp-server. También se puede convertir a otros formatos si es necesario.
- Latencia y throughput: no disponible. Al ser un MoE con 3B activos, se espera una velocidad de generación superior a la de un modelo denso de 30B, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3.5-30B-A3B-Antislop-FTPO (este) | 30B | 3B | no disponible | openmdw-1.1 | GGUF |
| NVIDIA Nemotron-3.5-Lightning-30B-A3B (base) | 30B | 3B | no disponible | openmdw-1.1 | BF16, NVFP4 |
| Qwen2.5-32B-A3B (referencia) | 32B | 3B | 128K | Apache 2.0 | safetensors, GGUF |

La comparativa se basa en características estructurales, ya que no hay datos de rendimiento disponibles para la variante Antislop. El modelo base de NVIDIA es el mismo que el de este, pero sin el fine-tuning creativo. Qwen2.5-32B-A3B es un MoE similar en tamaño y parámetros activos, con licencia más permisiva y contexto más largo, pero sin el enfoque específico en escritura creativa.

## Limitaciones y advertencias

- Licencia openmdw-1.1: es una licencia de código abierto con condiciones específicas (Open Model Data Warehouse). Se debe revisar el texto completo en https://openmdw.ai/license/1-1/ para verificar restricciones de uso comercial y redistribución.
- Sesgos del fine-tuning: el ajuste "Antislop" puede introducir sesgos hacia ciertos estilos de escritura o temas, y no se ha documentado su comportamiento en dominios especializados.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento factual. Se recomienda verificación humana en aplicaciones críticas.
- Longitud de contexto no especificada: no se ha publicado la ventana de contexto máxima, lo que limita su uso en tareas que requieren documentos largos.
- Soporte multilingüe limitado: aunque soporta seis idiomas, el fine-tuning creativo puede estar desbalanceado hacia el inglés, reduciendo la calidad en otros idiomas.
- Disponibilidad de quants: solo se ofrecen dos cuantizaciones (Q2_K e IQ3_M), que son de baja precisión y pueden degradar la calidad del texto generado. Para producción, se recomienda usar cuantizaciones más altas si están disponibles en el repo de quants estáticos.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/Nemotron-3.5-30B-A3B-Antislop-FTPO-i1-GGUF
- Modelo base (thoughtworks): https://huggingface.co/thoughtworks/Nemotron-3.5-30B-A3B-Antislop-FTPO
- Quants estáticos: https://huggingface.co/mradermacher/Nemotron-3.5-30B-A3B-Antislop-FTPO-GGUF
- Modelo base de NVIDIA (BF16): https://huggingface.co/mradermacher/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16-i1-GGUF
- Model card de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Documentación de NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/nvidia/models/nemotron-3.5-lightning
- Guía de uso de Nemotron-3.5 Lightning: https://github.com/NVIDIA-NeMo/Nemotron/tree/main/usage-cookbook/Nemotron-3.5-Lightning
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
