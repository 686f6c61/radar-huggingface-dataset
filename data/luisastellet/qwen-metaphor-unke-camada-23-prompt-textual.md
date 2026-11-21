# luisastellet/qwen-metaphor-unke-camada-23-prompt-textual

## Resumen

El modelo `luisastellet/qwen-metaphor-unke-camada-23-prompt-textual` es un checkpoint de generación de texto alojado en Hugging Face por el usuario luisastellet. Por su identificador y sus etiquetas, se trata de un ajuste fino derivado de la familia Qwen3, empaquetado con la librería `transformers` y pesos en formato `safetensors`. El nombre sugiere un trabajo experimental orientado a la generación de metáforas o a la manipulación de prompts textuales en una capa concreta ("camada 23"), aunque no hay documentación que lo confirme.

El dato técnico más fiable disponible es el recuento de parámetros obtenido de los safetensors: 596.049.920 parámetros, es decir, aproximadamente 0,6 mil millones. Esto lo sitúa en la gama de modelos pequeños, aptos para inferencia en hardware de consumo, pero también implica una capacidad de razonamiento y conocimiento factual limitada en comparación con los modelos de referencia de la familia Qwen3.

La model card es la plantilla automática de Hugging Face sin cumplimentar: no declara autoría efectiva, licencia, idiomas, datos de entrenamiento ni evaluación. Con 886 descargas y cero likes, se trata de un artefacto de investigación de nicho, no de un modelo listo para producción. Cualquier uso serio requiere una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, segun tags; detalles no disponibles) |
| Parametros totales | 596.049.920 (~0,6 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 7,2 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion | 2026-10-24 |
| Ultima actualizacion | 2026-10-26 |

## Arquitectura y entrenamiento

Los tags del repositorio indican `qwen3`, `transformers` y `text-generation`, lo que apunta a una arquitectura transformer decoder-only de la familia Qwen3. El recuento de 596 millones de parámetros es coherente con un modelo pequeño de esa familia, aunque no se especifica si se trata de un modelo base, de un ajuste fino (fine-tune) o de una destilación.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. El nombre del repositorio ("metaphor", "camada-23", "prompt-textual") sugiere un experimento de ajuste orientado a un comportamiento concreto, pero es una inferencia a partir del identificador y no un dato documentado. Tampoco se detalla el modelo de origen exacto del que se partió.

## Capacidades

- Generación de texto autoregresiva, según el pipeline declarado (`text-generation`).
- Conversación multi-turno: el tag `conversational` indica que el checkpoint está preparado para diálogo, presumiblemente con plantilla de chat de Qwen3.
- Compatibilidad con Text Generation Inference y endpoints compatibles, según los tags `text-generation-inference` y `endpoints_compatible`.
- Capacidad multilingüe: no disponible; no se declaran idiomas.
- Tool calling / function calling: no disponible; no se documenta.
- Razonamiento multi-paso y uso como agente: no disponible; no se documenta.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no se documenta.

## Casos de uso

- Prototipado rápido de generación de texto: con ~0,6 B de parámetros, el modelo puede ejecutarse en una sola GPU de consumo para validar pipelines de `transformers` antes de escalar a modelos mayores.
- Experimentación con prompts textuales: el nombre del repositorio sugiere que fue entrenado para manipulación o generación de prompts; puede usarse como banco de pruebas para estudiar cómo responde un modelo pequeño a instrucciones de reescritura.
- Generación creativa de figuras retóricas: si el ajuste "metaphor" es real, sería adecuado para tareas de generación de metáforas y paráfrasis estilísticas, siempre con evaluación humana.
- Servicio de chat ligero: el tag `conversational` y la compatibilidad con TGI permiten desplegarlo como endpoint de diálogo de bajo coste para demos internas.
- Investigación sobre ajuste fino: sirve como caso de estudio de cómo un fine-tune de nicho sobre un modelo pequeño altera el comportamiento respecto al modelo base.
- Filtrado o clasificación textual auxiliar: un modelo de este tamaño puede emplearse para tareas de etiquetado o reescritura en lotes donde el coste por token es crítico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en precisión completa (fp32): aproximadamente 2,4 GB solo para pesos.
- VRAM estimada en fp16/bf16: aproximadamente 1,2 GB para pesos; con overhead de activaciones y KV cache, entre 2 y 4 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,6 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,3 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090 o superiores son más que suficientes. Para despliegue en servidor, A100 o H100 no son necesarias y estarían infrautilizadas.
- Cabe holgadamente en GPU de consumo: sí, en la práctica totalidad de tarjetas con 6 GB o más.
- Opciones de despliegue: `transformers` (confirmado por la librería declarada), Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles. No se confirma soporte de llama.cpp, Ollama ni vLLM al no publicarse pesos GGUF ni documentación al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen-metaphor-unke-camada-23-prompt-textual | ~0,6 B | no disponible | no disponible | Hugging Face |
| Qwen3-0.6B (modelo base de referencia) | ~0,6 B | no disponible en la informacion proporcionada | Apache 2.0 (según la familia Qwen3; verificar) | Hugging Face |
| SmolLM2-360M | ~0,36 B | no disponible en la informacion proporcionada | Apache 2.0 (verificar) | Hugging Face |
| Qwen2.5-0.5B | ~0,5 B | no disponible en la informacion proporcionada | Apache 2.0 (verificar) | Hugging Face |

La comparación con los modelos alternativos se basa en el tamaño y la categoría, no en datos de rendimiento verificados para este checkpoint. No hay benchmarks publicados que permitan afirmar que este ajuste supera o iguala a su modelo base; en modelos de este tamaño, los fine-tunes de nicho suelen degradar capacidades generales si el dataset de ajuste es estrecho.

## Limitaciones y advertencias

- La model card es la plantilla automática sin rellenar: no hay información sobre autoría, licencia, datos de entrenamiento ni evaluación. El uso comercial es jurídicamente incierto al no declararse licencia.
- Con ~0,6 B de parámetros, la capacidad de razonamiento, el conocimiento factual y la robustez frente a alucinaciones son limitadas por diseño; no debe usarse como fuente de verdad.
- Riesgo elevado de alucinación en tareas factuales y en contextos largos, especialmente sin datos de evaluación que lo cuantifiquen.
- No se declaran idiomas soportados; el rendimiento en castellano es desconocido y probablemente inferior al de modelos mayores.
- El nombre del repositorio sugiere un ajuste muy específico ("metaphor", "camada-23", "prompt-textual"); es probable que el modelo haya perdido capacidades generales respecto a su base y que su comportamiento fuera del dominio de ajuste sea errático.
- No se ofrecen pesos cuantizados (GGUF, AWQ, GPTQ); desplegarlo en CPU o en herramientas tipo llama.cpp requiere convertir los safetensors por cuenta propia.
- Cero likes y documentación mínima: no hay evidencia de validación por parte de la comunidad. Tratarlo como artefacto experimental, no como componente de producción.
- El tamaño del repositorio (7,2 GB) es desproporcionado para 0,6 B de parámetros en fp16 (que ocuparían ~1,2 GB), lo que sugiere pesos en fp32 o artefactos adicionales; conviene inspeccionar los archivos antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-23-prompt-textual
- Paper citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Repositorio de Qwen3 (familia de origen probable): https://github.com/QwenLM/Qwen3
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
