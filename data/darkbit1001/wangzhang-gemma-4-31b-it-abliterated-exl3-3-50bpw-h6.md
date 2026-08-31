# darkbit1001/wangzhang-gemma-4-31B-it-abliterated-EXL3-3.50bpw-H6

## Resumen

Este repositorio contiene una cuantización EXL3 (ExLlamaV3) del modelo `wangzhang/gemma-4-31B-it-abliterated`, una versión "abliterada" del modelo `google/gemma-4-31B-it` de Google DeepMind. El proceso de abliteración, realizado mediante proyección ortogonal directa sobre los pesos, elimina los mecanismos de rechazo del modelo original, reduciendo drásticamente las respuestas de negativa ante instrucciones potencialmente sensibles. El resultado es un modelo de 31B parámetros (arquitectura densa) con soporte multimodal nativo (texto, imagen y audio), ventana de contexto de hasta 256K tokens y capacidades de razonamiento y tool-use.

La cuantización EXL3 a 3.50 bits por peso (con 6 bits para la cabeza) reduce el tamaño del modelo a aproximadamente 17.5 GB, lo que permite su ejecución en GPUs de consumo con 24 GB de VRAM. Está pensado para desarrolladores que necesitan un modelo de gran tamaño con respuestas sin filtros de rechazo, aunque con las advertencias éticas y de seguridad que ello conlleva. El repositorio incluye tres archivos safetensors fragmentados y está diseñado para usarse con ExLlamaV3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4) con doble normalización RMSNorm y embeddings por capa (PLE) |
| Parametros totales | 31B (modelo base); el repo cuantizado reporta 8.737.756.588 en safetensors, correspondiente al tamaño de los pesos cuantizados |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 256K tokens (modelo base) |
| Tipos de cuantizacion | EXL3, 3.50 bits por peso, 6 bits de cabeza, codebook `mul1`, escalas de salida siempre activas |
| Idiomas soportados | Más de 140 idiomas (modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (3 archivos fragmentados) en formato EXL3 |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-31B-it` es un transformer denso de 31B parámetros con una arquitectura de doble normalización (4 RMSNorm por capa) y embeddings por capa (PLE), lo que complica técnicas de ajuste como LoRA o steering. El proceso de abliteración aplicado por `wangzhang` utiliza edición directa de pesos mediante proyección ortogonal que preserva la norma, aplicada a las proyecciones Q/K/V/O de la atención, con la proyección down de la MLP deshabilitada para mejorar la estabilidad. Se usó precisión float32 para las proyecciones, vectores de steering winsorizados al percentil 99.5 y un rango de búsqueda de fuerza entre 1.0 y 6.0. La evaluación se realizó con vLLM in-place durante la optimización, completando 60 ensayos y seleccionando el ensayo 40 como mejor configuración.

El modelo resultante reduce las refusals de 99/100 (original) a 7/100 en un conjunto de evaluación privado de 100 prompts, con 0/15 rechazos en pruebas clásicas de sobre-rechazo seguro. La cuantización EXL3 se realizó con `exllamav3-1.4.4` usando 250 filas y 2048 columnas de calibración. No se dispone de información detallada sobre el dataset de entrenamiento original del modelo base ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multimodal: acepta entradas de texto, imagen y audio, y genera texto.
- Razonamiento y pensamiento: soporta un modo de "thinking" que genera cadenas de razonamiento internas antes de responder.
- Tool calling y function calling: protocolo nativo para invocar herramientas externas.
- Capacidades multilingües: más de 140 idiomas soportados.
- Respuestas sin rechazo: el abliterado elimina la mayoría de las negativas ante instrucciones sensibles, aunque mantiene 7/100 de refusals residuales.
- Generación de código y matemáticas: hereda las capacidades del modelo Gemma 4 base, aunque no se proporcionan benchmarks específicos.

## Casos de uso

- Asistentes conversacionales sin censura: el modelo puede mantener diálogos multi-turno sobre temas que otros modelos rechazan, útil para investigación en IA alineada o para entornos donde se requiere libertad de expresión controlada.
- Generación de código en producción: con tool calling y ventana de 256K tokens, puede integrarse en pipelines de CI/CD para autocompletar, revisar o refactorizar código en repositorios grandes.
- Análisis de documentos largos: la ventana de contexto amplia permite procesar contratos, informes o libros completos en una sola pasada, extrayendo información o resumiendo.
- Agentes autónomos: su soporte para function calling y razonamiento multi-step lo hace adecuado para orquestar tareas complejas con múltiples herramientas.
- Investigación en seguridad de IA: el abliterado permite estudiar los mecanismos de rechazo y alineación, comparando comportamientos con el modelo original.
- Aplicaciones multimodales: al aceptar imagen y audio, puede usarse en sistemas de transcripción, descripción de imágenes o asistentes que combinan varios tipos de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo abliterado solo reporta métricas de refusals (7/100 en evaluación privada, 0/15 en pruebas de sobre-rechazo) y un proxy KL de 7.32e-7, pero no incluye resultados de MMLU, HumanEval, GSM8K u otros estándares. Tampoco se dispone de datos de rendimiento para la cuantización EXL3.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 17.5 GB, por lo que se necesita al menos 20-24 GB de VRAM para cargar el modelo en EXL3 3.50 bpw. Una RTX 3090 o RTX 4090 (24 GB) es suficiente.
- GPUs recomendadas: RTX 3090, RTX 4090, A6000, A100 (40 GB) o superiores. En GPUs con menos VRAM se podría usar swapping o fragmentación, pero no es recomendable.
- Opciones de despliegue: ExLlamaV3 es la librería principal; también se puede usar a través de servidores compatibles con EXL3 como TabbyAPI o integraciones en vLLM (si soporta EXL3). No es compatible directamente con llama.cpp u Ollama, que usan GGUF.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 31B en 3.50 bpw en una RTX 4090 suele generar entre 20 y 40 tokens por segundo, pero esto es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con alternativas. Sin embargo, se puede contextualizar frente a otros modelos de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| gemma-4-31B-it (original) | 31B | 256K | Gemma license | safetensors (bf16) |
| wangzhang/gemma-4-31B-it-abliterated | 31B | 256K | Apache 2.0 | safetensors (bf16) |
| Este repo (EXL3 3.50bpw) | 31B | 256K | Apache 2.0 | safetensors (EXL3) |

La principal diferencia con el modelo original es la licencia (Apache 2.0 frente a la licencia Gemma) y la eliminación de refusals. Frente a otros modelos abliterados de la misma familia, este destaca por documentar su metodología de evaluación de forma honesta, usando generaciones largas (100-150 tokens) para detectar el patrón de rechazo diferido.

## Limitaciones y advertencias

- El abliterado reduce significativamente los guardarraíles de seguridad: el modelo puede generar contenido dañino, ilegal o no ético si se le solicita. Está pensado solo para investigación.
- Aunque las refusals bajan a 7/100, persisten algunos rechazos residuales, por lo que no es un modelo completamente "sin censura".
- La cuantización EXL3 a 3.50 bpw puede degradar ligeramente la calidad de generación frente al modelo en bf16, aunque no se han medido diferencias concretas.
- No se dispone de información sobre sesgos del modelo base ni sobre su comportamiento en idiomas distintos del inglés.
- La licencia Apache 2.0 permite uso comercial, pero el aviso del autor indica que es para fines de investigación; el usuario debe evaluar los riesgos legales y éticos.
- El modelo base Gemma 4 tiene requisitos de hardware considerables; la cuantización reduce el tamaño pero no elimina la necesidad de una GPU con suficiente VRAM.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/darkbit1001/wangzhang-gemma-4-31B-it-abliterated-EXL3-3.50bpw-H6
- Modelo base abliterado: https://huggingface.co/wangzhang/gemma-4-31B-it-abliterated
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B-it
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Herramienta Abliterix usada para el abliterado: https://github.com/wuwangzhang1216/abliterix
