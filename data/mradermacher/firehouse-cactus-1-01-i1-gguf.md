# mradermacher/Firehouse-Cactus-1.01-i1-GGUF

## Resumen

Firehouse-Cactus-1.01-i1-GGUF es una cuantización en formato GGUF del modelo Firehouse-Cactus-1.01, desarrollado originalmente por Ironwood-LLM-Team. El repositorio que nos ocupa ha sido generado por mradermacher, un usuario de Hugging Face conocido por publicar cuantizaciones GGUF con calibración imatrix, lo que permite ejecutar modelos de lenguaje de forma eficiente en hardware modesto, incluyendo CPU y GPU de gama media.

El modelo base cuenta con aproximadamente 7.460 millones de parámetros, lo que lo sitúa en la categoría de modelos de tamaño medio (7B), similar a Llama 2 7B o Mistral 7B. Sin embargo, la información pública disponible sobre el modelo original es muy limitada: no se han publicado detalles sobre su arquitectura, datos de entrenamiento, licencia o rendimiento en benchmarks. El repositorio de cuantización incluye múltiples versiones cuantizadas (Q2_K, Q4_K_S, Q6_K, etc.) y el modelo está etiquetado como conversacional, lo que sugiere un uso orientado a tareas de diálogo.

La relevancia de esta ficha radica en que se trata de una opción práctica para quienes necesitan desplegar un modelo de 7B en entornos con recursos limitados, aunque la falta de documentación oficial del modelo base obliga a tratarlo con cautela y a validar su comportamiento en el caso de uso concreto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.463.036.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el modelo original, no incluido en este repo) |

## Arquitectura y entrenamiento
No se dispone de información pública sobre la arquitectura interna del modelo Firehouse-Cactus-1.01. No se ha publicado el tipo de arquitectura (transformer, MoE, SSM, etc.), el número de capas, la configuración de atención ni los detalles de la tokenización. Tampoco hay datos sobre el proceso de entrenamiento: volumen de tokens, composición del dataset, o si se aplicaron técnicas de RLHF o DPO. La única referencia técnica es que el repositorio de cuantización indica que se han generado los GGUF con calibración imatrix, lo que mejora la calidad de las cuantizaciones de baja precisión, pero no aporta información sobre el modelo base.

## Capacidades
- Conversacional: el modelo está etiquetado como "conversational", lo que indica que está diseñado para mantener diálogos multi-turno.
- Inferencia local: al estar disponible en formato GGUF, puede ejecutarse en CPU y GPU mediante motores como llama.cpp, Ollama o LM Studio.
- No se dispone de información sobre capacidades específicas como generación de código, razonamiento matemático, tool calling, agentes, visión o audio. Estas capacidades no están confirmadas.

## Casos de uso
- Asistente conversacional local: el modelo puede integrarse en aplicaciones de chat que requieran privacidad y funcionamiento sin conexión, ejecutándose con llama.cpp u Ollama en un equipo con 8 GB de RAM o más.
- Experimentación con cuantizaciones: al ofrecer una amplia gama de cuantizaciones (desde Q2_K hasta Q6_K), es adecuado para estudiar el impacto de la precisión en la calidad de las respuestas de un modelo de 7B.
- Despliegue en dispositivos de bajo consumo: con cuantizaciones como Q2_K o IQ2_M, el modelo puede caber en dispositivos con 2-4 GB de memoria, como Raspberry Pi 5 o smartphones con motores compatibles con GGUF.
- Desarrollo de prototipos de IA generativa: para evaluar rápidamente si un modelo de 7B sin documentación técnica satisface las necesidades de un proyecto de investigación o desarrollo antes de invertir en un modelo más grande.
- Integración en pipelines de inferencia con llama.cpp: gracias al formato GGUF, puede integrarse en aplicaciones Python o C++ que usan la biblioteca llama.cpp para generar texto de forma eficiente.
- Uso educativo: para estudiantes y desarrolladores que quieren practicar la cuantización de modelos y el despliegue local sin depender de servicios en la nube.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo, ni comparaciones con modelos similares.

## Requisitos de hardware
- VRAM estimada para inferencia: depende de la cuantización elegida. Para una cuantización Q4_K_M (tamaño de archivo aproximado de 4-5 GB), se recomienda al menos 8 GB de VRAM para ejecutar el modelo en GPU, o 16 GB de RAM para CPU.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, o superiores para cuantizaciones de alta calidad (Q6_K, Q8_0). Para cuantizaciones bajas (Q2_K, IQ2_M) bastan GPUs con 6 GB de VRAM, como la RTX 2060 o la GTX 1660 Ti.
- Consumer GPU: sí, el modelo cabe en GPUs de consumo medio-alto con 8 GB o más de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, o servidores compatibles con GGUF como llama-server.
- Latencia y throughput: no hay datos medidos. Se estima una velocidad de 20-40 tokens por segundo en una RTX 3090 con cuantización Q4_K_M, pero esto depende del hardware y del motor de inferencia.

## Comparativa con modelos similares
No se dispone de datos de rendimiento para comparar con otros modelos de 7B como Llama 2 7B, Mistral 7B o Zephyr 7B. Sin embargo, se puede comparar en términos de disponibilidad y formato:

| Modelo | Parámetros | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| Firehouse-Cactus-1.01 (este) | 7.46B | no disponible | no disponible | GGUF (cuantizado) |
| Llama 2 7B | 6.7B | 4096 | Llama License (uso comercial permitido) | safetensors, GGUF |
| Mistral 7B | 7.3B | 32768 | Apache 2.0 | safetensors, GGUF |
| Zephyr 7B Beta | 7.3B | 32768 | MIT | safetensors, GGUF |

La falta de información sobre el modelo base impide una comparación de rendimiento.

## Limitaciones y advertencias
- Información técnica ausente: no se conocen la arquitectura, el contexto máximo, los idiomas soportados ni los datos de entrenamiento, lo que dificulta predecir su comportamiento en tareas específicas.
- Licencia desconocida: no se indica la licencia del modelo original. Esto puede impedir su uso comercial sin riesgo legal. Se recomienda contactar con Ironwood-LLM-Team antes de usar el modelo en producción.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o incoherente, especialmente en cuantizaciones de baja precisión (Q2, IQ2).
- Sesgos: sin información sobre el dataset de entrenamiento, no se pueden evaluar sesgos de género, raza o ideología.
- Limitaciones de contexto: el contexto máximo no está documentado; probablemente sea de 4096 o 8192 tokens, pero no es seguro.
- Soporte multilingüe: no se ha confirmado; el modelo podría estar entrenado principalmente en inglés.
- Calidad de las cuantizaciones: las cuantizaciones IQ (IQ2, IQ3, IQ4) están optimizadas para calidad, pero las de muy baja precisión (IQ1, Q2_K) pueden degradar notablemente la coherencia del texto.

## Enlaces
- Repositorio de cuantización GGUF: https://huggingface.co/mradermacher/Firehouse-Cactus-1.01-i1-GGUF
- Modelo original (Ironwood-LLM-Team): https://huggingface.co/Ironwood-LLM-Team/Firehouse-Cactus-1.01
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Página del modelo en LLM Explorer (versión 1.0): https://llm-explorer.com/model/Ironwood-LLM-Team%2FFirehouse-Cactus-1.0,6JUszgNx3wpJ8nGFoFKamj
- GitHub de Cactus Compute (no confirmado como relacionado con el modelo): https://github.com/cactus-compute/cactus
