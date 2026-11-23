# believe-it-or-not/Llama-3.2-3B-Instruct-0524_original_augmented_pkc_fda_approval-c8def51b

## Resumen

El modelo `believe-it-or-not/Llama-3.2-3B-Instruct-0524_original_augmented_pkc_fda_approval-c8def51b` es un adaptador PEFT (LoRA) publicado en Hugging Face por el usuario `believe-it-or-not`. No se trata de un modelo completo entrenado desde cero, sino de un ajuste fino sobre `togethercomputer/Meta-Llama-3.2-3B-Instruct-Reference__TOG__FT`, que a su vez deriva de la familia Llama 3.2 Instruct de Meta en su variante de 3.000 millones de parametros. El repositorio ocupa 0,4 GB, coherente con pesos de adaptador en safetensors y no con los pesos completos del modelo base.

La nomenclatura del identificador (`pkc_fda_approval`) sugiere un ajuste orientado a un dominio regulatorio concreto, probablemente relacionado con aprobaciones de la FDA estadounidense y conocimiento farmacologico o de dispositivos medicos, aunque la model card no documenta el dataset ni el objetivo del entrenamiento. El autor no ha rellenado ninguna seccion de la plantilla estandar: ni descripcion, ni datos de entrenamiento, ni evaluacion, ni licencia.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ejemplo tipico de adaptador comunitario de trazabilidad escasa, util para quien quiera reproducir el pipeline de PEFT sobre Llama 3.2 3B Instruct, pero no recomendable como componente de produccion sin una evaluacion propia previa. Toda la informacion tecnica sobre el modelo base debe inferirse de la familia Llama 3.2, no de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only (Llama 3.2 3B Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base Llama 3.2 3B tiene 3.210 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el repositorio; el modelo base Llama 3.2 3B Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors, la cuantizacion depende del modelo base |
| Idiomas soportados | No disponibles en el repositorio; el modelo base soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base en formato original de Meta |
| Libreria | peft 0.15.1 |
| Tamano del repositorio | 0,4 GB |
| Modelo base | togethercomputer/Meta-Llama-3.2-3B-Instruct-Reference__TOG__FT |
| Fecha de creacion | 2026-11-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador PEFT, es decir, matrices de bajo rango inyectadas en las capas del transformer base segun la tecnica LoRA. La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only con atencion por grupos (GQA), normalizacion RMSNorm, activacion SwiGLU y RoPE para codificacion posicional. El adaptador no modifica la arquitectura, solo los pesos de determinadas proyecciones.

No hay informacion publicada sobre el dataset de ajuste fino, el numero de tokens, la composicion de los datos, la existencia de RLHF o DPO, ni los hiperparametros del entrenamiento LoRA (rango, alpha, capas objetivo, learning rate). El nombre del repositorio sugiere un corpus relacionado con aprobaciones regulatorias de la FDA y posiblemente con "pkc" (farmacocinetica), pero se trata de una inferencia a partir del identificador, no de un dato documentado. Tampoco se especifica si el ajuste se realizo sobre el modelo Instruct completo o sobre una version ya ajustada por Together AI.

## Capacidades

- Generacion de texto en ingles y, por herencia del modelo base, en otros siete idiomas oficiales de Llama 3.2.
- Razonamiento basico y respuesta a instrucciones, condicionado por el ajuste LoRA sobre el modelo Instruct.
- Presunta especializacion en vocabulario y tareas del dominio regulatorio farmaceutico (FDA, farmacocinetica), no verificada.
- Soporte de tool calling y function calling heredado del formato de chat de Llama 3.2 Instruct.
- Capacidad de seguir plantillas de chat con roles `system`, `user` y `assistant`.
- No se documenta soporte de vision, audio, thinking mode ni agentes multi-paso especificos.
- No se documenta ninguna capacidad adicional introducida por el adaptador.

## Casos de uso

- Prototipado de asistentes especializados en documentacion regulatoria: el adaptador puede cargarse sobre el modelo base para experimentar con respuestas sobre terminologia FDA, aunque requiere validacion manual antes de cualquier uso real.
- Investigacion sobre ajuste fino con PEFT: sirve como ejemplo reproducible de como se publica un adaptador LoRA de 0,4 GB sobre Llama 3.2 3B Instruct y como se carga con la libreria `peft`.
- Generacion de borradores de resumenes de documentos tecnicos: con 128.000 tokens de contexto en el modelo base, permite procesar informes extensos y producir sintesis preliminares que un experto revisa.
- Extraccion de entidades y relaciones en textos farmaceuticos: util para construir pipelines de anotacion asistida, siempre que se evaluen las salidas contra un conjunto de referencia propio.
- Experimentos de evaluacion de sesgos y alucinacion en dominios regulados: el modelo permite estudiar como un ajuste de dominio estrecho afecta a la fidelidad factual frente al modelo base.
- Base para un segundo ajuste supervisado: al ser un adaptador pequeno, puede combinarse o sustituirse rapidamente en experimentos de investigacion sin reentrenar los 3.210 millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa unos 0,4 GB, pero requiere cargar el modelo base Llama 3.2 3B. En fp16 el modelo base necesita aproximadamente 6,4 GB de VRAM; en cuantizacion de 8 bits, unos 3,5 GB; en 4 bits, unos 2,2 GB.
- GPU recomendadas: para fp16, una RTX 4090 (24 GB) o una A100 (40/80 GB) ofrecen margen amplio; para cuantizacion 4 bits, una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB son suficientes.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion 4 u 8 bits, y en 12-16 GB en fp16 con contexto moderado.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en algunos casos, pero requieren verificacion de compatibilidad con la version de PEFT; llama.cpp y Ollama no cargan adaptadores PEFT directamente y exigen fusionar previamente el adaptador con el modelo base.
- Latencia y throughput: no disponibles para este adaptador; en el modelo base 3B en una RTX 4090 se pueden esperar decenas de tokens por segundo, pero no hay mediciones publicadas para esta combinacion concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.2 3B Instruct) | 3.210 M (base) + LoRA | 128.000 (base) | No disponible | safetensors PEFT | Hugging Face, 0 descargas |
| Llama 3.2 3B Instruct (Meta) | 3.210 M | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Amplia, ecosistema maduro |
| Qwen2.5 3B Instruct | 3.090 M | 32.768 (extensible a 131.072) | Apache 2.0 | safetensors, GGUF | Amplia |
| Phi-3.5-mini Instruct | 3.820 M | 128.000 | MIT | safetensors, GGUF | Amplia |

La comparativa se establece por tamano y categoria, no por rendimiento, ya que no hay benchmarks publicados para el adaptador. Frente a Qwen2.5 3B y Phi-3.5-mini, la principal diferencia practica es la licencia: Llama 3.2 impone restricciones de uso comercial y de denominacion, mientras que Apache 2.0 y MIT son mas permisivas.

## Limitaciones y advertencias

- La model card esta practicamente vacia: no hay descripcion, datos de entrenamiento, evaluacion ni instrucciones de uso.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; ademas, el modelo base Llama 3.2 arrastra su propia licencia comunitaria.
- El ajuste LoRA puede haber introducido sesgos o sobreajuste al dominio del corpus de entrenamiento, que no se documenta.
- Riesgo elevado de alucinacion en dominios regulados: un adaptador afinado sobre terminologia FDA puede producir afirmaciones con apariencia tecnica pero sin respaldo normativo.
- El repositorio no incluye tokenizador, configuracion de generacion ni plantilla de chat; es necesario usar los del modelo base.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso ni de validacion por parte de la comunidad.
- El identificador sugiere un dataset de aprobaciones FDA, pero no se confirma; no debe asumirse ninguna garantia de calidad en ese dominio.
- Para produccion seria imprescindible evaluar el adaptador contra el modelo base con un conjunto de validacion propio y revisar la licencia del modelo base antes de cualquier despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/Llama-3.2-3B-Instruct-0524_original_augmented_pkc_fda_approval-c8def51b
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.2-3B-Instruct-Reference__TOG__FT
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Paper de referencia sobre impacto medioambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
