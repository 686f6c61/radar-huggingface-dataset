# mradermacher/Gleam-30B-i1-GGUF

## Resumen

Gleam-30B-i1-GGUF es una versión cuantizada en formato GGUF del modelo base ConicCat/Gleam-30B, publicada por el usuario mradermacher en Hugging Face. El modelo original tiene aproximadamente 27.850 millones de parámetros (27,85B) y está diseñado para tareas de lenguaje y visión, según se indica en la propia model card. Esta versión concreta ofrece una serie de cuantizaciones con imatrix (IQ) que permiten ejecutar el modelo en hardware con recursos limitados, manteniendo un equilibrio entre tamaño, velocidad y calidad.

La relevancia de esta ficha radica en que se trata de un modelo de gran tamaño (30B) que, gracias a la cuantización, puede desplegarse en GPUs de consumo. Sin embargo, la información pública sobre el modelo base es escasa: no se especifican arquitectura, datos de entrenamiento, licencia ni benchmarks. Por tanto, esta ficha se basa principalmente en los datos disponibles en el repositorio de cuantización y en las características generales de los modelos GGUF.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.854.794.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (todos con imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base ConicCat/Gleam-30B. Dado el tamaño (30B) y la mención de capacidades de visión, es probable que se trate de un transformer multimodal, pero no hay confirmación oficial. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. Esta versión es únicamente una cuantización del modelo original, realizada por mradermacher con el fin de reducir el tamaño de los pesos para su uso en entornos con menos recursos.

## Capacidades

- Generación de texto y razonamiento: se asume por el tamaño y la naturaleza del modelo, aunque no hay datos específicos.
- Capacidades de visión: la model card indica explícitamente que es un modelo de visión, por lo que puede procesar imágenes junto con texto. Sin embargo, no se detallan las tareas concretas (captioning, VQA, etc.).
- Soporte de tool calling y agentes: no disponible.
- Multilingüismo: solo se declara inglés (en).
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

Dado que la información sobre el modelo base es limitada, los casos de uso se infieren de su tamaño y de la disponibilidad de cuantizaciones GGUF. Se recomienda verificar las capacidades reales antes de usarlo en producción.

- Despliegue local en hardware de consumo: gracias a las cuantizaciones IQ, el modelo puede ejecutarse en GPUs con 12-24 GB de VRAM, permitiendo tareas de generación de texto y visión en entornos sin acceso a servidores dedicados.
- Prototipado rápido de aplicaciones de chat o asistentes: con herramientas como llama.cpp u Ollama, se puede integrar en aplicaciones conversacionales de prueba.
- Investigación académica sobre modelos cuantizados: al ser una versión con imatrix, puede servir para estudiar el impacto de la cuantización en la calidad de salida.
- Tareas de visión por computadora en entornos con restricciones de memoria: si el modelo base realmente soporta entrada de imágenes, las cuantizaciones permiten probar modelos multimodales en GPUs de gama media.
- Evaluación comparativa de cuantizaciones: los distintos niveles (Q2, Q3, Q4, Q6) permiten medir la relación calidad/tamaño para un mismo modelo.
- Uso educativo: para aprender a manejar modelos GGUF y su integración en pipelines de inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo o su versión cuantizada.

## Requisitos de hardware

Los requisitos dependen de la cuantización elegida. A partir de los tamaños de archivo listados en la model card, se estima la VRAM necesaria para cargar el modelo en memoria (sin contar overhead del runtime):

- i1-IQ2_M (9,9 GB): requiere al menos 12 GB de VRAM. Puede ejecutarse en RTX 3060 12GB, RTX 4070, etc.
- i1-Q2_K (10,8 GB): similar al anterior, recomendable 12-16 GB.
- i1-IQ3_XXS (11,2 GB): 12-16 GB.
- i1-IQ3_M (12,9 GB): 16 GB recomendados.
- i1-Q3_K_M (13,8 GB): 16 GB.
- i1-Q4_K_S (16,2 GB): 20-24 GB (RTX 3090, RTX 4090, A5000).
- i1-Q4_K_M (17,0 GB): 24 GB o más.
- i1-Q6_K (23,0 GB): 32 GB o más (A100, RTX A6000, etc.).

Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptador GGUF) o TGI (si se convierte a otro formato). No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría (30B multimodales). No hay datos públicos sobre el rendimiento de Gleam-30B frente a alternativas como LLaVA-30B, BakLLaVA o Qwen-VL. Por tanto, esta sección se omite por falta de datos.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial del modelo base o de sus cuantizaciones no está claramente permitido. Se recomienda contactar con el autor original antes de cualquier uso productivo.
- Información técnica incompleta: no se conocen la arquitectura exacta, el contexto máximo, ni los detalles de entrenamiento, lo que dificulta evaluar su idoneidad para tareas específicas.
- Riesgo de alucinación y sesgos: al no haber documentación sobre el entrenamiento, no se pueden evaluar sesgos ni mitigaciones.
- Pérdida de calidad por cuantización: las versiones de menor tamaño (IQ2, Q2) pueden degradar notablemente la calidad de las respuestas, especialmente en tareas de razonamiento complejo.
- Soporte de visión no verificado: aunque la model card menciona que es un modelo de visión, no se incluyen archivos mmproj en este repositorio; habría que descargarlos del repositorio estático (Gleam-30B-GGUF) y no se garantiza su funcionamiento.
- Fecha de creación futura: el repositorio indica una fecha de creación en 2026, lo que sugiere que podría tratarse de un modelo experimental o con poca adopción.

## Enlaces

- Repositorio de cuantización: https://huggingface.co/mradermacher/Gleam-30B-i1-GGUF
- Repositorio estático (con mmproj): https://huggingface.co/mradermacher/Gleam-30B-GGUF
- Modelo base (referencia): https://huggingface.co/ConicCat/Gleam-30B
- Página de mradermacher en Hugging Face: https://huggingface.co/mradermacher
