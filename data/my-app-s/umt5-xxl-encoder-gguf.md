# my-app-s/umt5-xxl-encoder-gguf

## Resumen

UMT5-XXL Encoder GGUF es una conversión al formato GGUF de la parte encoder del modelo UMT5-XXL desarrollado originalmente por Google. UMT5 (Unified Multilingual T5) es una variante del conocido T5 (Text-to-Text Transfer Transformer) diseñada para unificar el tratamiento de texto en tareas multimodales, y en este caso concreto el repositorio empaqueta únicamente el encoder, es decir, la torre que convierte texto de entrada en representaciones vectoriales (embeddings). No se incluye el decoder generativo.

La relevancia de esta ficha es fundamentalmente práctica: el encoder de UMT5-XXL se utiliza como componente de condicionamiento textual en modelos de generación de imagen y vídeo (por ejemplo, en arquitecturas tipo difusión que necesitan codificar prompts). La conversión a GGUF permite ejecutar este encoder en hardware de consumo mediante llama.cpp y ComfyUI-GGUF, reduciendo la barrera de entrada frente a los pesos originales en safetensors.

El modelo base cuenta con aproximadamente 5.680 millones de parámetros (dato real de safetensors reportado en el repositorio), lo que lo sitúa en la categoría de modelos grandes para ser un simple encoder. La licencia es Apache 2.0, lo que facilita su uso comercial. El repositorio tiene un tamaño de 66,1 GB, coherente con múltiples cuantizaciones GGUF de un modelo de este tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (T5/UMT5), solo encoder |
| Parametros totales | 5.680.910.336 (≈5,68 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varias cuantizaciones; el autor recomienda Q5_K_M o superior) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 66,1 GB) |

## Arquitectura y entrenamiento

El modelo base google/umt5-xxl es un transformer encoder de tipo T5 unificado. UMT5 introduce un vocabulario y tokenizador unificados pensados para cubrir tanto texto como otras modalidades en pipelines multimodales, a diferencia del T5 clásico. En este repositorio se distribuye únicamente la torre encoder, sin decoder, por lo que su función es producir embeddings contextuales de texto, no generar texto.

Sobre el proceso de entrenamiento del modelo original no se proporciona información detallada en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO). La conversión a GGUF la realizó city96 y, según la model card, es una cuantización **no imatrix**, ya que llama.cpp no soportaba la creación de imatrix para modelos T5 en el momento de la publicación. Por ello se recomienda usar Q5_K_M o cuantizaciones mayores para preservar la calidad.

## Capacidades

- Codificación de texto en representaciones vectoriales (embeddings) para condicionamiento de modelos generativos.
- Integración con modelos de generación de imagen y vídeo a través del nodo personalizado ComfyUI-GGUF.
- Uso como extractor de embeddings mediante el ejemplo `llama-embedding` de llama.cpp.
- Soporte de la tokenización y vocabulario unificado de UMT5 (diseñado para pipelines multimodales).
- Idioma: inglés según la model card.
- No incluye generación de texto (es solo encoder), ni tool calling, ni razonamiento multi-paso, ni capacidades de agente.

## Casos de uso

- Condicionamiento de prompts en pipelines de difusión: usar el encoder para convertir prompts de texto en embeddings que alimenten modelos de imagen o vídeo dentro de ComfyUI, aprovechando la integración con ComfyUI-GGUF.
- Ejecución en hardware de consumo: desplegar el encoder cuantizado en GGUF con llama.cpp para reducir requisitos de memoria frente a los pesos originales en safetensors.
- Extracción de embeddings de texto para búsqueda semántica o clustering: emplear `llama-embedding` para obtener representaciones vectoriales de documentos en inglés.
- Prototipado de pipelines multimodales: sustituir el encoder original por esta versión GGUF en entornos con recursos limitados para validar arquitecturas antes de escalar.
- Investigación sobre cuantización: comparar la calidad de embeddings entre distintas cuantizaciones GGUF (Q5_K_M frente a tamaños menores) en tareas de recuperación o similitud semántica.
- Integración en aplicaciones de escritorio o locales: al ser GGUF, puede embeberse en herramientas que ya usan llama.cpp sin depender de frameworks de deep learning pesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de ≈5,68 B parámetros, las cuantizaciones Q5_K_M o superiores implican varios GB de pesos en memoria, aunque el repositorio completo ocupa 66,1 GB por incluir múltiples cuantizaciones.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el encoder cuantizado puede caber en GPUs de consumo con suficiente VRAM, pero no se aportan cifras concretas.
- Compatibilidad con GPU de consumo: probable en cuantizaciones Q5_K_M o superiores si la VRAM disponible cubre los pesos; sin datos oficiales de VRAM exacta.
- Opciones de despliegue: llama.cpp (ejemplo `llama-embedding`) y ComfyUI-GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| my-app-s/umt5-xxl-encoder-gguf | ≈5,68 B | no disponible | GGUF | apache-2.0 | Solo encoder, cuantizado, orientado a ComfyUI/llama.cpp |
| google/umt5-xxl | ≈5,68 B | no disponible | safetensors | apache-2.0 | Modelo base completo (encoder y decoder), pesos originales |
| T5-XXL (google) | ≈4,7 B | no disponible | safetensors | apache-2.0 | Alternativa T5 clásica, tokenizador no unificado |

## Limitaciones y advertencias

- Solo contiene el encoder: no puede generar texto ni realizar tareas generativas por sí mismo.
- Cuantización no imatrix: el autor recomienda Q5_K_M o superior; cuantizaciones menores pueden degradar la calidad de los embeddings.
- Idioma limitado al inglés según la model card, a pesar de que UMT5 está diseñado como multilingüe unificado.
- Repositorio de 66,1 GB: el tamaño de descarga es elevado aunque solo se use una cuantización concreta.
- Sin datos de benchmarks ni de contexto máximo publicados en la información disponible; conviene verificar la longitud de contexto en la documentación del modelo base.
- Riesgo de alucinación no aplica directamente al no ser generativo, pero los embeddings pueden reflejar sesgos presentes en los datos de entrenamiento originales.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribución correspondiente al modelo base de Google.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/my-app-s/umt5-xxl-encoder-gguf
- Modelo base: https://huggingface.co/google/umt5-xxl
- llama.cpp (ejemplo embedding): https://github.com/ggerganov/llama.cpp/tree/master/examples/embedding
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
