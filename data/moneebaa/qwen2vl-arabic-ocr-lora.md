# moneebaa/qwen2vl-arabic-ocr-lora

## Resumen

`moneebaa/qwen2vl-arabic-ocr-lora` es un adaptador LoRA para el modelo vision-lenguaje Qwen2-VL-2B-Instruct, desarrollado por Moneeba Abrar como proyecto de aprendizaje a pequeña escala. Su objetivo es la extracción de texto árabe a partir de imágenes (OCR), una tarea en la que los modelos multimodales genéricos rinden de forma deficiente sin ajuste específico. El adaptador se entrenó sobre 300 muestras del subconjunto `synthesizear` de KITAB-Bench, un benchmark de OCR árabe desarrollado por MBZUAI-Oryx.

El modelo base Qwen2-VL-2B-Instruct es un transformer multimodal de 2.000 millones de parámetros que procesa imágenes y texto de forma conjunta. El adaptador añade 18,5 millones de parámetros entrenables mediante LoRA (r=16, alpha=32) sobre las proyecciones de atención y MLP, lo que permite ajustar el comportamiento del modelo para OCR árabe con un coste computacional muy reducido: una sola GPU Tesla T4 en fp16.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de ajuste fino de un VLM para una tarea concreta con recursos limitados; por otro, sirve como referencia de las limitaciones de este tipo de proyectos, ya que el autor advierte explícitamente que los resultados son indicativos y no comparables con los del paper de KITAB-Bench, que evalúa modelos de 7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2-VL-2B-Instruct (transformer vision-lenguaje) |
| Parametros totales | 2B (modelo base) + 18,5M (adaptador LoRA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (entrenado en fp16; el adaptador es compatible con el base en fp16/bf16) |
| Idiomas soportados | ar, en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2-VL-2B-Instruct, un transformer multimodal que combina un codificador visual con un decoder de lenguaje. El ajuste se realizó con LoRA de rango 16, alpha 32 y dropout 0,05 sobre las proyecciones de atención y MLP, resultando en 18,5 millones de parámetros entrenables. El entrenamiento consistió en 300 muestras del subconjunto `synthesizear` de KITAB-Bench, una sola época (38 pasos), learning rate 1e-4, batch efectivo de 8, en fp16 sobre una Tesla T4. La pérdida se calculó únicamente sobre los tokens de respuesta, y el prompt de entrenamiento fue "Extract the text in the image. Give me the final text, nothing else.".

No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales. La innovación técnica es limitada: se trata de un ajuste supervisado estándar con PEFT 0.21.2, sin decodificación especulativa ni mecanismos de atención lineal. El valor del proyecto reside en la reproducibilidad y en el análisis de fallos documentado en el repositorio de GitHub, no en una contribución arquitectónica.

## Capacidades

- Extracción de texto árabe de imágenes (OCR) con normalización de texto y cálculo de CER/WER.
- Generación de texto a partir de imagen y prompt (pipeline `image-text-to-text`).
- Soporte de instrucciones en inglés y árabe.
- Capacidades heredadas del modelo base Qwen2-VL-2B-Instruct: comprensión de imágenes, razonamiento visual básico y generación de texto.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información disponible.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Digitalización de documentos árabes sintéticos: el adaptador reduce el CER de 0,349 a 0,043 en el dominio de entrenamiento, por lo que es adecuado para pipelines de extracción de texto en documentos con tipografía y maquetación similares a las del subconjunto `synthesizear`.
- Prototipado rápido de OCR árabe: al requerir solo una T4 y 38 pasos de entrenamiento, sirve como base para experimentar con ajuste fino de VLMs en entornos con recursos limitados.
- Investigación académica sobre OCR árabe: el repositorio de GitHub incluye análisis de fallos y resultados comparativos que pueden servir de punto de partida para estudios más amplios.
- Extracción de texto en aplicaciones bilingües árabe-inglés: el modelo base maneja ambos idiomas y el adaptador preserva esa capacidad.
- Evaluación de la viabilidad de LoRA en tareas de OCR: los resultados in-domain y out-of-domain permiten medir la brecha de generalización con un presupuesto mínimo.
- Generación de datos de entrenamiento: el adaptador puede usarse para pre-anotar texto en imágenes sintéticas antes de una revisión humana.

## Benchmarks y rendimiento

| Metrica | Base in-domain | LoRA in-domain | Base out-of-domain | LoRA out-of-domain |
|---|---|---|---|---|
| CER | 0,349 | 0,043 | 0,873 | 0,691 |
| WER | 0,589 | 0,167 | 0,950 | 0,840 |

In-domain: 30 muestras reservadas de `arocrbench_synthesizear`. Out-of-domain: 30 muestras de `arocrbench_hindawi`. Las puntuaciones usan la normalización de texto árabe de KITAB-Bench y `jiwer`. El autor advierte que los conjuntos de test son de 30 muestras y una sola ejecución, por lo que los resultados son indicativos. KITAB-Bench evalúa modelos de 7B, por lo que estas cifras no son comparables con las del paper.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-6 GB en fp16 para el modelo base de 2B más el adaptador; menos de 4 GB con cuantización de 8 bits o 4 bits del base (no documentada explícitamente).
- GPU recomendadas: Tesla T4 (usada en entrenamiento), RTX 3060/4060, RTX 4090, A100, H100.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superior en fp16; en GPUs de 8 GB con cuantización.
- Opciones de despliegue: Transformers + PEFT (documentado), vLLM y TGI no documentados para este adaptador; llama.cpp/Ollama no soportan el adaptador PEFT de forma nativa sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OCR arabe | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moneebaa/qwen2vl-arabic-ocr-lora | 2B + 18,5M LoRA | no disponible | CER 0,043 in-domain / 0,691 out-of-domain | no disponible | Hugging Face |
| Qwen/Qwen2-VL-2B-Instruct | 2B | no disponible | CER 0,349 in-domain / 0,873 out-of-domain | no disponible | Hugging Face |
| KITAB-Bench (modelos evaluados) | 7B | no disponible | métricas del paper no comparables | no disponible | paper |

No se dispone de información sobre otros adaptadores LoRA de OCR árabe comparables en la búsqueda realizada. El repositorio `m0d9/qwen-vl-arabic-ocr` ofrece un pipeline de entrenamiento similar pero no publica métricas comparables.

## Limitaciones y advertencias

- Conjuntos de test de solo 30 muestras y una única ejecución: los resultados son indicativos, no concluyentes.
- El test in-domain es texto sintético que coincide con la distribución de entrenamiento; la generalización a documentos reales es limitada.
- El rendimiento out-of-domain en páginas de libros sigue siendo débil (CER 0,691, WER 0,840).
- El modelo base es de 2B, mientras que KITAB-Bench evalúa modelos de 7B; las cifras no son comparables con el paper.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador ni del modelo base sin verificar la licencia de Qwen2-VL-2B-Instruct.
- Riesgo de alucinación inherente a los VLMs: puede generar texto plausible que no aparece en la imagen, especialmente en documentos con baja calidad o tipografías no vistas.
- Sesgos idiomáticos y de dominio: entrenado solo con árabe e inglés y con un subconjunto sintético concreto.
- Proyecto de aprendizaje a pequeña escala, no un resultado oficial de KITAB-Bench.

## Enlaces

- Hugging Face: https://huggingface.co/moneebaa/qwen2vl-arabic-ocr-lora
- Repositorio de código y análisis de fallos: https://github.com/aka-Trophy-Hunter/Arabic-OCR-with-Qwen2-VL-LoRA-fine-tuning-
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Pipeline de fine-tuning alternativo: https://github.com/m0d9/qwen-vl-arabic-ocr
- KITAB-Bench (Heakl et al., MBZUAI-Oryx): no disponible en la información proporcionada
