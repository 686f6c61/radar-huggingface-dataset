# sag-uniroma2/FrameQwen2.5-14B-Instruct-FN17-Multilingual

## Resumen

FrameQwen2.5-14B-Instruct-FN17-Multilingual es un modelo derivado (fine-tune) de la familia Qwen2.5-14B-Instruct, publicado por el grupo de investigación sag-uniroma2 (Universidad de Roma Tor Vergata). El nombre indica que se trata de una adaptación orientada a marcos semanticos (FrameNet, con la referencia "FN17" que apunta a la versión 1.7 de FrameNet) y con un componente multilingue. El modelo base, Qwen2.5-14B-Instruct, es un transformer denso de 14.700 millones de parametros desarrollado por Alibaba Qwen, con 32.768 tokens de contexto nativo y capacidad de generacion, razonamiento y codigo.

La relevancia de esta ficha es limitada por la escasez de informacion publicada: la model card del repositorio no incluye descripcion tecnica, datos de entrenamiento, benchmarks ni idiomas soportados. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no declara pipeline de inferencia. Por tanto, esta ficha se construye a partir de los datos verificables del repositorio y de las caracteristicas conocidas del modelo base Qwen2.5-14B-Instruct, marcando explicitamente como "no disponible" todo aquello que el autor no ha documentado.

El interes practico reside en su posible uso para tareas de analisis semantico basado en frames (deteccion de marcos, roles semanticos, etiquetado FrameNet) en entornos multilingues, siempre que se valide empiricamente su comportamiento, ya que el autor no ha publicado evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-14B-Instruct) |
| Parametros totales | 14.700 millones (modelo base Qwen2.5-14B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (modelo base Qwen2.5-14B-Instruct); no confirmado para el fine-tune |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | no disponible (el nombre indica "Multilingual", sin listado oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio no detalla safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo se presenta como un fine-tune sobre Qwen2.5-14B-Instruct, un transformer decoder-only denso con atención completa, RoPE, RMSNorm y activación SwiGLU, entrenado por Alibaba Qwen con un corpus multilingue de hasta 18 billones de tokens y sometido a post-entrenamiento con SFT y preferencias (RLHF/DPO) en el modelo base. El sufijo "FN17" sugiere un ajuste sobre FrameNet 1.7, probablemente para tareas de frame semantics, y el sufijo "Multilingual" indica que el ajuste se extendio a varios idiomas.

Sin embargo, la model card publicada no especifica el numero de tokens de entrenamiento del fine-tune, la composicion del dataset, la tecnica de ajuste (LoRA, QLoRA o full fine-tuning), ni si se aplico RLHF o DPO adicional. Tampoco se documentan innovaciones tecnicas propias (decodificacion especulativa, atención lineal, etc.). Toda esta informacion debe considerarse "no disponible" hasta que el autor publique una ficha tecnica completa.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen2.5-14B-Instruct.
- Generacion de codigo y resolucion de problemas matematicos, capacidades presentes en el modelo base.
- Analisis semantico orientado a frames (FrameNet 1.7), segun indica el nombre del modelo; sin evaluacion publicada.
- Soporte multilingue declarado en el nombre del modelo; el listado concreto de idiomas no esta disponible.
- Soporte de tool calling y function calling: disponible en el modelo base Qwen2.5-14B-Instruct; no confirmado para este fine-tune.
- Capacidades de agente y razonamiento multi-paso: disponibles en el modelo base; no verificadas tras el ajuste.
- Modo "thinking" o vision: no disponible en este modelo (el modelo base es solo texto).

## Casos de uso

- Etiquetado de frames semanticos: uso del modelo para asignar marcos FrameNet 1.7 a oraciones en distintos idiomas, aprovechando el ajuste especifico y la ventana de 32.768 tokens del modelo base para procesar documentos completos.
- Extraccion de roles semanticos: identificacion de participantes y roles (agente, paciente, instrumento) en textos multilingues para pipelines de analisis linguistico o construccion de bases de conocimiento.
- Anotacion asistida en corpus linguisticos: generacion de pre-anotaciones FrameNet que revisores humanos validan, reduciendo el coste de anotacion manual en proyectos de linguistica computacional.
- Analisis de sentimiento basado en eventos: deteccion de marcos y roles para interpretar opiniones ligadas a eventos concretos en resenas o redes sociales en varios idiomas.
- Procesamiento de documentos largos: resumen y extraccion de informacion en contratos o informes de hasta 32.768 tokens (limite del modelo base), con salida estructurada.
- Prototipado de asistentes multilingues: generacion de respuestas y razonamiento en varios idiomas en entornos de investigación, con la cautela de que el rendimiento por idioma no esta documentado.
- Generacion de codigo en pipelines internos: si se confirma que el fine-tune conserva las capacidades del modelo base, puede integrarse en tareas de autocompletado y generacion de tests, aunque requiere validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de FrameNet en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 28-30 GB para los 14.700 millones de parametros, mas overhead de cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 15-16 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 9-10 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para FP16 con contexto largo; L40S o RTX 6000 Ada (48 GB) para FP16 ajustado.
- GPU de consumo: cabe en RTX 4090 (24 GB) en 8 bits o 4 bits; en FP16 requiere al menos 32 GB, por lo que no cabe en GPUs de 24 GB sin cuantizar.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama si se generan pesos GGUF; el repositorio no publica pesos cuantizados, por lo que habria que convertirlos.
- Latencia y throughput: no disponibles; dependen del hardware y del backend, sin mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FrameQwen2.5-14B-Instruct-FN17-Multilingual | 14.700 M | 32.768 (base) | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune FrameNet sin benchmarks publicados |
| Qwen2.5-14B-Instruct | 14.700 M | 32.768 | Apache 2.0 | Hugging Face, muy extendido | Modelo base, con benchmarks publicados por Alibaba |
| Mistral-Nemo-Instruct-2407 | 12.000 M | 128.000 | Apache 2.0 | Hugging Face | Contexto mayor, sin ajuste FrameNet |
| Llama-3.1-8B-Instruct | 8.000 M | 128.000 | Llama 3.1 Community License | Hugging Face | Menor tamano, licencia con restricciones de uso |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifican datos de entrenamiento, hiperparametros ni evaluaciones, lo que impide estimar la calidad del ajuste.
- Riesgo de degradacion del modelo base: los fine-tunes especializados pueden perder capacidades generales (codigo, matematicas, instrucciones) si el ajuste no preserva la distribucion original; no hay evidencia publicada al respecto.
- Idiomas no documentados: aunque el nombre indica "Multilingual", no se lista que idiomas cubre ni con que calidad.
- Riesgo de alucinacion: inherente a los modelos generativos de 14B; sin evaluaciones especificas de fidelidad en tareas FrameNet.
- Sesgos: no documentados; el modelo base Qwen2.5 presenta sesgos conocidos en datos web multilingues, y el ajuste no declara mitigaciones.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar las condiciones del modelo base Qwen2.5, tambien Apache 2.0.
- Disponibilidad y mantenimiento: 0 descargas y 0 likes, sin actualizaciones desde su creacion; no hay evidencia de mantenimiento activo.
- Formato de pesos no confirmado: verificar antes de integrar en pipelines de produccion (safetensors, GGUF, etc.).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sag-uniroma2/FrameQwen2.5-14B-Instruct-FN17-Multilingual
- Modelo base Qwen2.5-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- FrameNet: https://framenet.icsi.berkeley.edu/
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
