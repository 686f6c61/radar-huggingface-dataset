# JoTalbot/ua-legal-lm-gpu

## Resumen

ua-legal-lm-gpu es un modelo de lenguaje pequeño (aproximadamente 29 millones de parámetros) entrenado desde cero por JoTalbot sobre datos públicos del ámbito legal ucraniano. Su objetivo es proporcionar una base ligera y especializada para tareas de procesamiento de lenguaje natural sobre documentos judiciales, registros empresariales y datos fiscales de Ucrania, utilizando exclusivamente fuentes de datos abiertas y legalmente publicadas. El modelo se desarrolla como parte de un proyecto más amplio (repositorio "ukraine") y está pensado para entornos con recursos limitados, como GPUs de consumo o incluso CPU.

La relevancia actual radica en la creciente necesidad de modelos especializados en dominios específicos y en idiomas distintos del inglés, especialmente en contextos donde la privacidad y la legalidad de los datos de entrenamiento son críticas. Al entrenarse únicamente con datos abiertos y despersonalizados, el modelo ofrece una alternativa reproducible y transparente frente a modelos genéricos de gran tamaño. Sin embargo, su tamaño reducido y su ventana de contexto de 384 tokens limitan sus capacidades a tareas de análisis local y extracción de información, no siendo adecuado para razonamiento complejo o generación extensa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT (Transformer decoder) |
| Parametros totales | ~29 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | no disponible (se distribuye como estado PyTorch) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state_dict (`model.pt`) y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura GPT estándar implementada en PyTorch: 8 capas transformer, dimensión de embedding de 512, y un tokenizador BPE con vocabulario de 8192 tokens. La ventana de contexto es de solo 384 tokens, lo que lo hace adecuado para fragmentos cortos de texto, como metadatos de decisiones judiciales o registros individuales.

El entrenamiento se realizó desde cero (from-scratch) en una GPU de Kaggle, durante 6000 pasos, sobre tres conjuntos de datos abiertos: metadatos de decisiones del Registro Estatal Unificado de Decisiones Judiciales de Ucrania (ЄДРСР), el Registro Estatal Unificado (ЄДР) y el registro de contribuyentes del IVA. La pérdida de validación final fue de 1.0602, lo que corresponde a una perplejidad aproximada de 2.89. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento parece ser de modelado de lenguaje autorregresivo estándar.

## Capacidades

- Generación de texto en ucraniano, limitada a un contexto máximo de 384 tokens.
- Modelado de lenguaje básico sobre dominios legales y administrativos ucranianos (decisiones judiciales, registros de empresas, datos de IVA).
- Capacidad de extraer patrones estadísticos de los datos de entrenamiento, útil para tareas de clasificación o etiquetado si se adapta con fine-tuning.
- No soporta tool calling, function calling, ni razonamiento multi-paso.
- No tiene capacidades multimodales (solo texto).
- No dispone de modo de pensamiento extendido (thinking mode).

## Casos de uso

- Clasificación de documentos judiciales: el modelo puede utilizarse como base para clasificar decisiones del ЄДРСР por tipo de caso, tribunal o materia, tras un fine-tuning supervisado.
- Extracción de entidades en registros empresariales: dado su entrenamiento sobre el ЄДР, puede ayudar a identificar nombres de empresas, códigos de identificación o direcciones en texto corto.
- Preprocesamiento y normalización de metadatos legales: su capacidad de generar texto en ucraniano permite completar o corregir campos cortos en bases de datos legales.
- Prototipos de búsqueda semántica ligera: al generar embeddings contextuales, puede servir para indexar y recuperar fragmentos cortos de jurisprudencia ucraniana en entornos con pocos recursos.
- Educación e investigación: útil para estudiantes o investigadores que necesitan un modelo pequeño y transparente para experimentar con técnicas de adaptación a dominios específicos.
- Validación de datos abiertos: puede emplearse para detectar inconsistencias o anomalías en registros públicos, aunque su tamaño limita la precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida de validación (1.0602, perplejidad 2.89) durante el entrenamiento, sin comparación con otros modelos.

## Requisitos de hardware

- El modelo tiene ~29M de parámetros, por lo que ocupa aproximadamente 116 MB en fp32 (o ~58 MB en fp16).
- Es ejecutable en CPU sin GPU: la inferencia es rápida incluso en portátiles modestos.
- En GPU, cualquier tarjeta con al menos 1 GB de VRAM es suficiente (ej. NVIDIA GTX 1050, RTX 2060, etc.).
- Al ser un modelo pequeño, puede ejecutarse en frameworks como Hugging Face Transformers, PyTorch, o convertirse a ONNX para despliegue ligero.
- No se requieren opciones de cuantización para uso práctico, aunque podría cuantizarse a int8 para reducir aún más el footprint.
- La latencia es del orden de milisegundos por token en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (idioma ucraniano, dominio legal, tamaño ~30M). Existen modelos multilingües pequeños como DistilBERT o XLM-R, pero no están especializados en ucraniano legal ni entrenados desde cero con datos abiertos de esa procedencia. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo es extremadamente pequeño (29M) y con una ventana de contexto de 384 tokens, lo que limita su uso a tareas muy concretas y de corta extensión.
- No se especifica la licencia, por lo que su uso comercial o redistribución puede ser legalmente incierto. Se recomienda contactar al autor antes de cualquier uso productivo.
- La calidad de las respuestas generativas será baja para texto libre extenso; el modelo es más adecuado como representación de características que como generador autónomo.
- No se han realizado evaluaciones de sesgos ni de alucinaciones. Dado su entrenamiento sobre datos legales reales, podría reflejar sesgos presentes en esos datos.
- El entrenamiento se limitó a 6000 pasos, lo que sugiere un subentrenamiento considerable; la perplejidad de 2.89 indica que aún hay margen de mejora.
- No hay garantía de que las fuentes de datos (ЄДРСР, ЄДР, registro de IVA) estén completamente libres de errores o de datos personales, aunque el autor afirma que se preservó la despersonalización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoTalbot/ua-legal-lm-gpu
- Repositorio GitHub (proyecto ukraine): https://github.com/JoTalbot/ukraine
- Variante sin sufijo "gpu": https://huggingface.co/JoTalbot/ua-legal-lm
