# dealignai/Ornith-1.5-9B-UNCENSORED-GGUF

## Resumen

Ornith-1.5-9B-UNCENSORED-GGUF es una cuantización GGUF del modelo Ornith-1.5-9B, desarrollada por Dealign.ai mediante una técnica de "abliteration" denominada CRACK. El modelo base, creado por Ornith AI, es un sistema multimodal de 9.000 millones de parámetros con arquitectura híbrida GatedDeltaNet (SSM) y attention, diseñado para razonamiento, generación de código y visión. La versión CRACK elimina el comportamiento de rechazo del modelo original manteniendo el conocimiento y las capacidades de razonamiento y visión, lo que la convierte en un artefacto de investigación orientado a usos sin restricciones.

Esta versión en formato GGUF está pensada para ejecutarse con llama.cpp y sus derivados (LM Studio, Ollama, etc.). Incluye seis cuantizaciones (Q8_0 a Q2_K) más un proyector de visión independiente, y es compatible con el modo de razonamiento "thinking" que el modelo activa por defecto. Su relevancia radica en que combina un modelo de código abierto con licencia MIT, capacidades multimodales y una eliminación agresiva de guardarraíles, lo que lo sitúa en un espacio de uso poco común: investigación de seguridad, generación de contenido sin censura y análisis de comportamiento de modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida GatedDeltaNet (SSM) + attention |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (según ejemplos de uso; no se especifica el máximo) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B emplea una arquitectura híbrida que combina una capa GatedDeltaNet (una variante de SSM lineal con gating) con mecanismos de atención tradicionales. Esta combinación permite un equilibrio entre eficiencia computacional en secuencias largas y capacidad de razonamiento contextual. El modelo es multimodal: acepta tanto texto como imágenes a través de un proyector de visión (mmproj) que se integra en el flujo de generación.

El entrenamiento del modelo base se realizó mediante un proceso de auto-scaffolding y auto-mejora: el modelo propone nuevas tareas, genera andamiajes específicos para cada una y produce rollouts de soluciones, que se refuerzan mediante aprendizaje por refuerzo. La versión CRACK, por su parte, aplica una cirugía de pesos dirigida específicamente a las vías de atención, eliminando los patrones de rechazo sin degradar el conocimiento general. Según la model card, esta cirugía se adapta a cada cuantización de forma independiente, y las cuantizaciones sub-8 bits incorporan además un paso AWQ (activation-aware quantization) y una matriz de importancia para preservar la calidad.

No se dispone de datos sobre el número total de tokens de entrenamiento, la composición del dataset ni detalles de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: el modelo emite una traza de razonamiento "thinking" activada por defecto, que puede desactivarse mediante el parámetro `enable_thinking=false`.
- Visión por computador: soporta entrada de imágenes y texto combinados (image-text-to-text), con un proyector de visión dedicado (`mmproj-Ornith-1.5-9B-f16.gguf`).
- Razonamiento multi-paso: la arquitectura híbrida y el modo de razonamiento permiten tareas que requieren pasos intermedios y planificación.
- Generación de código: aunque no se especifican benchmarks de código, la arquitectura de Ornith está orientada a modelos de codificación agéntica.
- Sin restricciones de contenido: la variante CRACK elimina los rechazos para comportamientos que el modelo original bloquearía, lo que incluye temas de seguridad, cibercrimen, acoso, desinformación, etc.
- Capacidades multilingües: no se ha especificado los idiomas soportados en la documentación proporcionada.
- Tool calling / function calling: no se menciona explícitamente en la información disponible, pero es probable que el modelo base lo soporte dado su diseño agéntico; no se confirma.

## Casos de uso

- Investigación de alineación y seguridad de modelos: el modelo sirve para estudiar el comportamiento de modelos sin guardarraíles, permitiendo evaluar el impacto de la eliminación de rechazos en la generación de contenido dañino o ilegal. Se puede usar en entornos controlados para medir la efectividad de técnicas de mitigación.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones, diálogos o material de marketing que requiera explorar temas tabú o controversiales sin censura.
- Análisis de imágenes y generación de descripciones: el modo visión permite describir fotografías, diagramas o capturas de pantalla, útil en automatización de documentación, accesibilidad o análisis de contenido visual.
- Desarrollo de agentes de razonamiento autónomo: gracias al modo "thinking" y a la arquitectura híbrida, se puede usar como núcleo de agentes que planifiquen tareas complejas en entornos controlados, como generación de informes técnicos o resolución de problemas matemáticos.
- Automatización de pruebas de seguridad ofensiva: el modelo puede generar payloads, scripts o estrategias de ataque en entornos de test de penetración (pentesting) autorizado, donde se necesita contenido específico sin restricciones.
- Chatbots de rol o simulación de personajes: el modelo puede mantener conversaciones largas y coherentes con contexto extendido, útil para juegos de rol, simulaciones sociales o entrenamiento de habilidades de comunicación.

## Benchmarks y rendimiento

La model card proporciona resultados de MMLU (en modo logit) y HarmBench (tasa de éxito de ataque) para cada cuantización, comparando la versión CRACK con la base del mismo cuantización:

| Cuantizacion | MMLU (base) | MMLU (CRACK) | ΔMMLU | HarmBench harm-ASR |
|---|---|---|---|---|
| Q8_0 | 78,1 % | 77,5 % | -0,53 pp | 99,6 % |
| Q6_K | 76,5 % | 76,5 % | +0,00 pp | 99,6 % |
| Q5_K_M | 76,5 % | 76,5 % | +0,00 pp | 99,2 % |
| Q4_K_M | 78,3 % | 76,5 % | -1,76 pp | 99,6 % |
| Q3_K_M | 73,3 % | 74,4 % | +1,06 pp | 99,2 % |
| Q2_K | 50,5 % | 50,5 % | +0,00 pp | 99,2 % |

La retención de conocimiento se mantiene dentro de ±3 pp respecto a la base en todos los cuantizadores. El Q2_K sufre una pérdida de ~27 pp por la cuantización de 2 bits, pero la cirugía no añade pérdida adicional. En HarmBench, la tasa de éxito de ataque es casi total (99,2-99,6 %) en todos los temas, con 100 % en químico/biológico, cibercrimen, acoso, daño e ilegal.

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización y tamaño de archivo):
  - Q8_0 (8,9 GB): ~10-11 GB de VRAM para inferencia con contexto 8192.
  - Q6_K (7,4 GB): ~8-9 GB de VRAM.
  - Q5_K_M (6,5 GB): ~7-8 GB de VRAM.
  - Q4_K_M (5,6 GB): ~6-7 GB de VRAM (recomendado por el autor).
  - Q3_K_M (4,6 GB): ~5-6 GB de VRAM.
  - Q2_K (3,6 GB): ~4-5 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA de 8 GB o más puede ejecutar el modelo en Q4_K_M (por ejemplo, RTX 3070/3080, RTX 4060 Ti 16 GB, RTX 4070/4080). Para Q8_0 se requiere una GPU con 12 GB o más (RTX 4070 Ti Super, RTX 4080, A100, H100). Para uso con visión, se recomienda al menos 8 GB de VRAM para cargar el mmproj adicional.
- En consumer GPU: sí, el modelo cabe en GPUs de gama media/alta con 8-12 GB de VRAM usando cuantizaciones Q4_K_M o inferiores. Para Q8_0 se necesita una GPU de 16 GB o más.
- Opciones de despliegue: llama.cpp, llama-server, llama-mtmd-cli (para visión), Ollama (disponible en el registro de Ollama como `ornith-1.5`), LM Studio, y cualquier backend compatible con GGUF.
- Latencia y throughput: no se han publicado datos específicos; dependerá del hardware y la cuantización. En una RTX 4090 con Q4_K_M, se estima una velocidad de generación de 40-60 tokens/s para un modelo de 9B, aunque no es un dato confirmado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B (base) | 8,95 B | no disponible | GatedDeltaNet + attention | MIT | HuggingFace (safetensors, GGUF) |
| Ornith-1.5-9B-CRACK-GGUF (este) | 8,95 B | 8192 (ejemplos) | GatedDeltaNet + attention (abliterated) | MIT | HuggingFace (GGUF) |
| Qwen3.5 (familia) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de Qwen3.5 ni de otros modelos comparables de 9B en la información proporcionada. La comparación directa con el modelo base Ornith-1.5-9B muestra que la versión CRACK mantiene el rendimiento MMLU dentro de ±3 pp, pero elimina por completo los rechazos de contenido. Para comparar con otros modelos abliterated de 9B (por ejemplo, variantes de Llama 3.1 8B o Qwen 2.5 7B), no se han encontrado datos en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el proceso de abliteration elimina los rechazos de contenido, lo que puede resultar en la generación de texto dañino, ilegal o desinformativo sin filtro alguno. No se han evaluado sesgos de género, raza o cultura en esta versión.
- Riesgo de alucinación: como cualquier modelo de 9B, puede inventar hechos, cifras o fuentes, especialmente en contextos largos o con temas especializados. La eliminación de rechazos no afecta a este riesgo.
- Limitaciones de contexto: el contexto máximo no está documentado; los ejemplos usan 8192 tokens, pero puede ser menor. Para tareas de largo recorrido, se recomienda probar con valores superiores con precaución.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el autor advierte que es un "artefacto de investigación con guardarraíles reducidos" y que se debe usar responsablemente y conforme a la ley. No hay restricciones de licencia adicionales, pero el uso indebido puede violar leyes locales.
- Caveat para producción: este modelo no es adecuado para entornos de producción que requieran moderación de contenido, cumplimiento normativo o seguridad. Su uso en aplicaciones públicas podría generar responsabilidades legales.
- Compatibilidad: la versión GGUF está optimizada para llama.cpp; no se garantiza compatibilidad con otras librerías (Transformers, vLLM) sin conversión adicional.
- Falta de datos de entrenamiento: no se ha publicado información sobre la composición del dataset, tokens de entrenamiento ni el proceso de alineación original, lo que limita la evaluación de sesgos y calidad en dominios específicos.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/dealignai/Ornith-1.5-9B-UNCENSORED-GGUF
- Modelo base en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Web de Ornith AI: https://ornith.ai/
- Guía de Ornith AI para modelos de codificación: https://ornith.online/
- Modelo en Ollama: https://ollama.com/library/ornith-1.5
