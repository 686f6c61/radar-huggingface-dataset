# mradermacher/Wichtelchen-Qwen3.5-9B-GGUF

## Resumen

Wichtelchen-Qwen3.5-9B-GGUF es la versión cuantizada en formato GGUF del modelo Wichtelchen-Qwen3.5-9B, desarrollado por schneewolflabs y cuantizado por mradermacher. Se trata de un merge basado en Qwen3.5-9B, un modelo de 9.197 millones de parámetros, que incorpora recetas de entrenamiento orientadas a mejorar el razonamiento, el uso de herramientas y las capacidades de agente. El nombre "Wichtelchen" hace referencia a la receta "Wichtel operator", que combina datasets de DPO y SFT, incluyendo Hemlock, un conjunto de datos de razonamiento, y datasets de delegación de tareas.

La relevancia de esta ficha radica en que ofrece una gama completa de cuantizaciones GGUF (desde Q2_K hasta f16) que permiten ejecutar el modelo en hardware de consumo, manteniendo un equilibrio entre tamaño y calidad. Además, incluye archivos mmproj para capacidades multimodales, lo que lo convierte en una opción versátil para desarrolladores que necesitan un modelo compacto con soporte de visión, tool calling y razonamiento multi-paso. El modelo está pensado para entornos de producción donde se requiere inferencia local eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B, no se especifican detalles adicionales) |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Wichtelchen-Qwen3.5-9B es un merge de pesos sobre Qwen3.5-9B, que a su vez es un modelo multimodal de la familia Qwen 3.5. La arquitectura interna no se detalla en la información disponible, pero por su origen se asume un transformer con atención estándar y capacidades de visión (los archivos mmproj confirman el soporte multimodal). El entrenamiento combina datasets de DPO y SFT: GreatFirewall-DPO, egirl-DPO, egirl-delegation-dpo, egirl-hemlock-dpo y Hemlock-SFT-combined. Hemlock parece ser un dataset de razonamiento, y la mención a "delegation 10/10" sugiere que se entrenó específicamente para delegar subtareas a otras herramientas o modelos. No se dispone de información sobre el número de tokens de entrenamiento ni sobre el uso de RLHF adicional.

## Capacidades

- Generación de texto y razonamiento multi-paso, reforzado con el dataset Hemlock.
- Soporte de tool calling y function calling, indicado por los tags "tool-use" y "agents".
- Capacidades de agente: puede delegar tareas y coordinar flujos de trabajo complejos (delegation 10/10).
- Generación de código, gracias a la base Qwen3.5 y al entrenamiento con datasets de código.
- Multimodal: incluye archivos mmproj para procesamiento de imágenes (visión), aunque no se especifica el detalle de las capacidades visuales.
- Multilingüe: solo inglés declarado, aunque podría tener algo de transferencia desde Qwen3.5, no se garantiza.

## Casos de uso

- Asistentes de código en IDE: el modelo puede autocompletar, explicar y refactorizar código, integrándose con herramientas de edición mediante tool calling.
- Agentes autónomos de automatización: gracias a su entrenamiento en delegación, puede orquestar subtareas, llamar a APIs y gestionar flujos de trabajo multi-paso en entornos de producción.
- Chatbots de atención al cliente con contexto largo: aunque la longitud de contexto no está especificada, los 9B de parámetros permiten manejar conversaciones extensas con razonamiento coherente.
- Análisis de documentos con visión: al ser multimodal, puede procesar capturas de pantalla, diagramas o formularios escaneados para extraer información estructurada.
- Prototipado rápido de aplicaciones de IA: su licencia Apache-2.0 y su tamaño compacto lo hacen adecuado para experimentación en entornos con recursos limitados.
- Despliegue en edge o dispositivos con GPU de consumo: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar el modelo en una RTX 3060 o similar con buena latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos mencionados son:

- Hemlock: 56,1% en hembench (benchmark específico del dataset Hemlock).
- Delegation: 10/10 (aparentemente una puntuación perfecta en tareas de delegación).

Estos valores no son comparables con benchmarks generales y carecen de contexto sobre la metodología. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño de archivo):
  - Q2_K: ~4,0 GB (cabe en GPUs de 4 GB, aunque con pérdida de calidad).
  - Q4_K_M: ~5,9 GB (recomendado para RTX 3060 12GB, RTX 4060, etc.).
  - Q5_K_M: ~6,7 GB (similar a Q4_K_M, algo más de calidad).
  - Q6_K: ~7,7 GB (adecuado para RTX 3080, 4070, etc.).
  - Q8_0: ~9,9 GB (para GPUs con 10-12 GB o más).
  - f16: ~18,5 GB (requiere GPU de 24 GB como RTX 4090 o A10).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 6 GB de VRAM para las cuantizaciones bajas; para las altas, se necesitan 12 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. También se puede usar vLLM con conversión a safetensors, pero no es el formato nativo.
- Latencia y throughput: no disponibles, pero en una RTX 4090 con Q4_K_M se esperan decenas de tokens por segundo (estimación orientativa, no confirmada).

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de la misma categoría. El modelo base Qwen3.5-9B es el punto de referencia natural, pero no se han publicado especificaciones completas ni benchmarks comparables. Alternativas como Llama-3.1-8B o Mistral-7B podrían ser comparables en tamaño, pero no hay datos de rendimiento en las fuentes consultadas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Idioma: solo inglés declarado; el rendimiento en otros idiomas no está garantizado.
- Sesgos: los datasets de entrenamiento (egirl-DPO, GreatFirewall-DPO) pueden introducir sesgos de estilo o contenido no deseados; no se han documentado evaluaciones de sesgo.
- Alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Riesgo de merge: al ser un merge de pesos, puede presentar comportamientos impredecibles en dominios no cubiertos por los datasets de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial, pero los datasets utilizados pueden tener licencias propias; se recomienda verificar cada dataset antes de usar el modelo en producción.
- Contexto: la longitud de contexto no está especificada; se desconoce si soporta ventanas largas (por ejemplo, 32k o 128k).
- Soporte multimodal: los archivos mmproj están disponibles, pero no se detalla qué tipos de imagen o resolución soporta.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/Wichtelchen-Qwen3.5-9B-GGUF
- Modelo base (safetensors): https://huggingface.co/schneewolflabs/Wichtelchen-Qwen3.5-9B
- Cuantizaciones GGUF del modelo base (por schneewolflabs): https://huggingface.co/schneewolflabs/Wichtelchen-Qwen3.5-9B-GGUF
- Cuantizaciones i1 (imatrix) del mismo modelo: https://huggingface.co/mradermacher/Wichtelchen-Qwen3.5-9B-i1-GGUF
- Página de overview del autor: https://hf.tst.eu/model#Wichtelchen-Qwen3.5-9B-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
