# locriani/therapeutic-register-qwen3-1.7b

## Resumen

Therapeutic-register-qwen3-1.7b es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3-1.7B, desarrollado por el usuario locriani y publicado en Hugging Face bajo licencia Apache 2.0. El modelo ha sido entrenado mediante QLoRA sobre un dataset propio denominado `locriani/therapeutic-register-data` y posteriormente fusionado (lora-merged), con el objetivo de especializarse en la generacion de texto con un registro conversacional de caracter terapeutico. Se trata, por tanto, de un modelo de investigacion orientado a explorar el estilo y el tono de las interacciones propias de contextos de acompanamiento psicologico o counselling.

El modelo hereda la arquitectura transformer de Qwen3 en su variante de 1.700 millones de parametros, lo que lo situa en la categoria de modelos pequenos, aptos para despliegue en hardware de consumo. Su interes actual radica en ser un ejemplo de especializacion por dominio sobre una base moderna y abierta, con un enfoque muy concreto (el registro linguistico terapeutico) en lugar de una mejora general de capacidades. No obstante, se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, acceso restringido y sin benchmarks publicados.

Es importante subrayar que el modelo no ha sido validado clinicamente ni dispone de documentacion sobre su proceso de evaluacion. Su uso previsto, segun las etiquetas del repositorio, es la investigacion, no la prestacion de servicios de salud mental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-1.7B; valor concreto no confirmado) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only denso de 1.700 millones de parametros. Sobre esta base se aplico un ajuste fino con QLoRA (cuantizacion de bajo rango con adaptadores LoRA), segun indican las etiquetas del repositorio, y posteriormente se fusionaron los adaptadores en los pesos base (lora-merged), de modo que el artefacto publicado es un modelo completo listo para inferencia estandar con transformers, sin necesidad de cargar adaptadores por separado.

El entrenamiento utiliza el dataset `locriani/therapeutic-register-data`, de elaboracion propia por el autor. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni hiperparametros del ajuste. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio pipeline QLoRA + merge. El objetivo declarado del ajuste es modelar el registro conversacional terapeutico en ingles.

## Capacidades

- Generacion de texto conversacional en ingles con un registro estilistico orientado a contextos terapeuticos.
- Conversacion multi-turno (heredada de la base Qwen3-1.7B).
- Razonamiento basico y respuesta a instrucciones, en la medida en que la base Qwen3-1.7B los conserva tras el ajuste.
- Capacidades multilingues limitadas al ingles segun la ficha del modelo (etiqueta `en`).
- No se documenta soporte de tool calling, function calling, modo thinking explicito, vision ni audio en la informacion disponible.
- No se documentan capacidades de agente ni de razonamiento multi-paso especificas del ajuste.

## Casos de uso

- Investigacion sobre estilos conversacionales: el modelo sirve como objeto de estudio para analizar como un ajuste fino sobre un corpus pequeno modifica el registro linguistico de una base generalista, comparando salidas antes y despues del fine-tuning.
- Generacion de dialogos sinteticos para prototipos: util para crear corpus de conversaciones con tono de acompanamiento en entornos de investigacion, siempre que se revisen y filtren manualmente antes de cualquier uso.
- Evaluacion de tecnicas QLoRA: al ser un ejemplo documentado de QLoRA + merge sobre Qwen3-1.7B, puede emplearse como referencia en experimentos sobre eficiencia de ajuste fino en modelos pequenos.
- Pruebas de despliegue en hardware de consumo: con 1.700 millones de parametros, permite validar pipelines de inferencia (transformers, TGI) en GPUs de gama media para experimentacion.
- Analisis de sesgos y alucinacion en dominios sensibles: sirve para estudiar como un modelo pequeno especializado en un dominio delicado (salud mental) puede producir respuestas plausibles pero incorrectas, como caso de prueba de sistemas de filtrado y salvaguardas.
- Docencia y formacion tecnica: ejemplo didactico de publicacion de un modelo ajustado en Hugging Face con acceso restringido, licencia Apache 2.0 y ficha de modelo, para ilustrar el ciclo completo de un experimento de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, alrededor de 4-5 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2 GB para pesos; en 4 bits, alrededor de 1-1,5 GB, si bien no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070); A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en modelos como RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, e incluso en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`); llama.cpp/Ollama requeririan conversion a GGUF, no documentada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| locriani/therapeutic-register-qwen3-1.7b | 1,72 B | No disponible | Apache 2.0 | Restringido (gated) | Ajuste QLoRA especializado en registro terapeutico; sin benchmarks |
| Qwen/Qwen3-1.7B | 1,7 B | No disponible en esta ficha | Apache 2.0 | Abierto | Modelo base generalista; referencia directa del ajuste |
| Otros ajustes QLoRA sobre Qwen3-1.7B | ~1,7 B | No disponible | Variable | Variable | Alternativas de la misma categoria; no se dispone de datos comparativos concretos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no ha sido validado clinicamente ni debe emplearse para ofrecer consejo psicologico o medico real.
- Riesgo elevado de alucinacion en un dominio sensible: un modelo de 1,7 B ajustado sobre un corpus propio puede generar respuestas con apariencia de consejo profesional sin base factual.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Sesgos: al desconocerse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, culturales o clinicos; deben asumirse sesgos presentes en los datos y en la base Qwen3.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face; el uso comercial en contextos de salud mental exigiria validacion adicional independiente.
- Sin benchmarks ni evaluacion publicada: no hay evidencia cuantitativa de calidad, seguridad ni robustez.
- Contexto y cuantizaciones no documentados: la ausencia de variantes GGUF/AWQ/GPTQ limita el despliegue en entornos de bajo recursos sin trabajo adicional de conversion.
- Cero descargas y cero likes: sin comunidad ni soporte; el mantenimiento del repositorio no esta garantizado.

## Enlaces

- Hugging Face: https://huggingface.co/locriani/therapeutic-register-qwen3-1.7b
- Dataset de entrenamiento: https://huggingface.co/datasets/locriani/therapeutic-register-data
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
