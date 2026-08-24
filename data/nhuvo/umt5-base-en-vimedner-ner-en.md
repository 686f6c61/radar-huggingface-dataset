# nhuvo/umt5-base-en-vimedner-ner-en

## Resumen

El modelo `nhuvo/umt5-base-en-vimedner-ner-en` es un ajuste fino de `google/umt5-base` para el reconocimiento de entidades nombradas (NER) biomédicas en inglés. Desarrollado por nhuvo, convierte texto plano en texto etiquetado inline, por ejemplo: `Patients with <BIOLOGIC_FUNCTION>type 2 diabetes mellitus</BIOLOGIC_FUNCTION> were enrolled.` Está entrenado sobre el dataset `nhuvo/En-ViMedNER`, un recurso bilingüe (inglés-vietnamita) de entidades médicas. Su relevancia radica en ofrecer un modelo multilingüe de la familia T5 adaptado a un dominio especializado, con una arquitectura encoder-decoder de 592 millones de parámetros. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UMT5 (encoder-decoder, basada en T5) |
| Parametros totales | 592.043.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización declarada) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

UMT5 es una variante de T5 propuesta en el artículo *UniMax: Fairer and More Effective Language Sampling for Large-Scale Multilingual Pretraining*. Su principal innovación es un método de muestreo de datos multilingüe que mejora el equilibrio entre idiomas durante el preentrenamiento, manteniendo la arquitectura text-to-text de T5. El modelo base `google/umt5-base` fue preentrenado en un corpus multilingüe masivo, aunque el ajuste fino aquí presentado se limita al inglés. El entrenamiento se realizó sobre el dataset `nhuvo/En-ViMedNER`, que contiene anotaciones de entidades biomédicas en formato inline. No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La tarea se formula como generación de secuencias: el modelo recibe un prefijo (`recognize English named entities: `) seguido del texto, y genera el mismo texto con las entidades etiquetadas mediante marcadores XML.

## Capacidades

- Reconocimiento de entidades nombradas biomédicas en inglés, incluyendo tipos como `BIOLOGIC_FUNCTION` (ej. "type 2 diabetes mellitus").
- Generación de texto etiquetado inline, lo que facilita la integración en pipelines de procesamiento de lenguaje natural.
- Soporte de secuencias de entrada de longitud variable (el límite exacto no está documentado).
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No se indica soporte para otros idiomas en este ajuste específico, aunque el modelo base UMT5 es multilingüe.

## Casos de uso

- Anotación de historiales clínicos electrónicos: el modelo puede extraer automáticamente entidades como enfermedades, fármacos o funciones biológicas a partir de notas médicas, facilitando la codificación y el análisis posterior.
- Minería de literatura biomédica: permite procesar artículos científicos para identificar menciones de genes, proteínas o condiciones, acelerando la revisión sistemática y la construcción de bases de conocimiento.
- Soporte a sistemas de información hospitalaria: integrado como servicio de NER, puede enriquecer registros de pacientes con etiquetas semánticas para búsquedas y alertas.
- Preprocesamiento para extracción de relaciones: las entidades detectadas pueden alimentar modelos de relación entre entidades (ej. interacciones fármaco-enfermedad).
- Generación de datasets anotados: al etiquetar texto nuevo, puede servir para crear conjuntos de entrenamiento adicionales en dominios biomédicos.
- Asistencia a la codificación médica: ayuda a mapear menciones libres a códigos estandarizados (p. ej. ICD-10) al identificar las entidades relevantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- Con 592 millones de parámetros, una estimación orientativa para inferencia con `transformers` en precisión fp32 requiere aproximadamente 2,4 GB de VRAM solo para los pesos; en fp16 se reduce a ~1,2 GB. Sin embargo, estos valores son estimaciones generales y no datos verificados del autor.
- Se recomienda una GPU con al menos 4 GB de VRAM para trabajar cómodamente en fp32, o 2 GB en fp16. Modelos como una RTX 3060 o superiores serían suficientes.
- Para despliegue en producción, se puede usar `vLLM`, `TGI` o `llama.cpp` (si se convierte a GGUF), aunque no hay guías específicas del autor.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de NER biomédico en la documentación proporcionada. Se puede señalar que, al estar basado en UMT5, comparte arquitectura con otros modelos T5, pero no hay datos de rendimiento relativo.

## Limitaciones y advertencias

- El modelo está ajustado exclusivamente para inglés; su uso en otros idiomas no está soportado en esta versión.
- Al ser un modelo generativo, puede producir etiquetas incorrectas o alucinar entidades no presentes en el texto, especialmente en dominios fuera del corpus de entrenamiento.
- La longitud de contexto no está documentada; se recomienda verificar el límite del tokenizador UMT5 antes de usarlo con textos largos.
- El dataset de entrenamiento `En-ViMedNER` puede contener sesgos inherentes a las anotaciones biomédicas (p. ej., desequilibrios en tipos de entidades o dominios específicos).
- La licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías sobre la exactitud de las predicciones en entornos clínicos reales.
- No se han publicado evaluaciones de robustez frente a textos ruidosos o jerga médica no estándar.

## Enlaces

- Modelo en Hugging Face: [nhuvo/umt5-base-en-vimedner-ner-en](https://huggingface.co/nhuvo/umt5-base-en-vimedner-ner-en)
- Dataset de entrenamiento: [nhuvo/En-ViMedNER](https://huggingface.co/datasets/nhuvo/En-ViMedNER)
- Modelo base: [google/umt5-base](https://huggingface.co/google/umt5-base)
- Documentación de UMT5 en Transformers: [UMT5 docs](https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/umt5.md)
- Artículo UniMax (referencia de la arquitectura): [UniMax: Fairer and More Effective Language Sampling for Large-Scale Multilingual Pretraining](https://arxiv.org/abs/2301.12104) (enlace no verificado en la búsqueda, se infiere del nombre del modelo)
