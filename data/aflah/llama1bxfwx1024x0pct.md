# aflah/Llama1BxFWx1024x0pct

## Resumen

Este repositorio contiene un checkpoint de entrenamiento en formato crudo GPT-NeoX, correspondiente a un experimento sobre *Partial RoPE* (rotary position embedding parcial) descrito en el artículo *"Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE"* (arXiv:2603.11611), aceptado en EMNLP 2026. El modelo se basa en la arquitectura Llama 3.2 1B y fue entrenado sobre el dataset FineWeb con una longitud de secuencia de 1.024 tokens, aplicando un 0% de RoPE parcial (es decir, sin rotación parcial). El checkpoint corresponde al paso global 12.000.

La relevancia de este modelo es estrictamente investigadora: permite estudiar cómo afecta la configuración de RoPE parcial a la convergencia y al rendimiento de modelos transformer durante el preentrenamiento. No es un modelo listo para inferencia ni para uso en producción, ya que se distribuye en formato GPT-NeoX sin conversión a Transformers y carece de licencia explícita. Su interés principal radica en la reproducibilidad de los experimentos del paper y en el análisis de los efectos de la posición relativa en la atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 1B (transformer decoder) |
| Parametros totales | 1.000 millones (aprox., segun arquitectura Llama 3.2 1B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 1.024 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible (checkpoint crudo, sin cuantizar) |
| Idiomas soportados | no disponible (dataset FineWeb, principalmente ingles) |
| Licencia | no disponible |
| Formato de pesos | GPT-NeoX checkpoint (raw, no Transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama 3.2 1B, un transformer decoder con normalización RMSNorm, activación SwiGLU y atención con *rotary position embeddings* (RoPE). La innovación del experimento consiste en aplicar *Partial RoPE*, una técnica que rota solo una fracción de las dimensiones de los embeddings posicionales. En este checkpoint concreto, el porcentaje de RoPE parcial es del 0%, lo que significa que no se aplica rotación alguna a las posiciones; esto sirve como línea base para comparar con configuraciones que sí aplican rotación parcial (por ejemplo, 25%, 50%, 75%).

El entrenamiento se realizó sobre el dataset FineWeb, con una longitud de secuencia de 1.024 tokens. El checkpoint se guardó en el paso global 12.000, dentro de un proceso de preentrenamiento estándar. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un checkpoint de preentrenamiento puro. Los pesos se almacenan en formato GPT-NeoX, tal como los genera la librería de entrenamiento, sin conversión al formato Hugging Face Transformers.

## Capacidades

- No es un modelo de uso general: es un checkpoint de investigación para estudiar el efecto de RoPE parcial en la convergencia.
- No se han documentado capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes.
- No se ha verificado soporte multilingüe; el dataset FineWeb es predominantemente inglés.
- No incluye modo de pensamiento (*thinking mode*) ni capacidades multimodales.
- Su única utilidad práctica es servir como objeto de análisis en experimentos de preentrenamiento y en la reproducción de los resultados del paper.

## Casos de uso

- Investigación sobre posicional encoding: permite analizar cómo la ausencia total de rotación posicional (0% RoPE) afecta a la representación del orden de los tokens, comparándola con configuraciones parciales.
- Estudio de convergencia en preentrenamiento: al ser un checkpoint intermedio (paso 12.000), se puede estudiar la dinámica de pérdida y la evolución de las representaciones a lo largo del entrenamiento.
- Reproducción de experimentos académicos: los investigadores pueden cargar este checkpoint en GPT-NeoX para verificar los resultados del paper o extenderlos con nuevas métricas.
- Análisis de memorización y generalización: dado que el dataset es FineWeb, se puede investigar cómo la falta de RoPE influye en la memorización de secuencias largas.
- Desarrollo de nuevas variantes de atención: sirve como línea base para probar modificaciones de RoPE u otros mecanismos posicionales.
- Evaluación de la sensibilidad a la longitud de contexto: al entrenar con 1.024 tokens, se puede estudiar el comportamiento del modelo cuando se evalúa con secuencias más largas de las vistas en entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (arXiv:2603.11611) podría contener métricas de evaluación, pero no se han proporcionado en la documentación del repositorio. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros estándares.

## Requisitos de hardware

- El tamaño del repositorio es de 16,5 GB, lo que sugiere pesos en precisión fp32 (aproximadamente 4 GB por cada 1.000 millones de parámetros en fp32, pero el formato GPT-NeoX puede incluir estados de optimizador o metadatos adicionales).
- Para cargar el checkpoint en memoria se necesitan al menos 16 GB de RAM (y probablemente más si se incluyen estados de optimizador).
- Para inferencia (si se convirtiera a un formato utilizable), una GPU con 8 GB de VRAM sería suficiente en fp16, pero no se ha probado ni documentado.
- No se recomienda su uso en producción; es un checkpoint de investigación.
- Opciones de despliegue: no aplicable directamente; requeriría conversión a Transformers o uso de GPT-NeoX para cargar los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| Llama1BxFWx1024x0pct (este) | 1B | 1.024 | no disponible | GPT-NeoX | Investigación |
| Llama 3.2 1B (original) | 1B | 128K | Llama 3.2 Community License | Transformers | Producción |
| TinyLlama 1.1B | 1,1B | 2.048 | Apache 2.0 | Transformers | Producción |

La comparativa es limitada porque este checkpoint no es un modelo final, sino un artefacto de investigación. Frente a Llama 3.2 1B original, carece de alineación, de contexto largo y de formato utilizable. Frente a TinyLlama, tampoco ofrece un checkpoint listo para inferencia. Su valor reside únicamente en el estudio académico de RoPE parcial.

## Limitaciones y advertencias

- Es un checkpoint crudo de preentrenamiento, no un modelo alineado ni instruido; no debe usarse para tareas de generación directa.
- No se ha convertido al formato Transformers; su carga requiere herramientas específicas de GPT-NeoX.
- No se especifica licencia, por lo que su uso comercial es incierto y requiere consultar con el autor.
- El dataset FineWeb puede contener sesgos y contenido no filtrado; no se ha realizado ningún proceso de moderación.
- La longitud de contexto de entrenamiento es de solo 1.024 tokens, por lo que el modelo no generaliza bien a secuencias más largas.
- No se han publicado métricas de rendimiento ni evaluaciones de seguridad.
- El checkpoint corresponde a un paso intermedio (12.000), no al final del entrenamiento; su rendimiento puede ser subóptimo.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/aflah/Llama1BxFWx1024x0pct)
- [Paper: Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE](https://arxiv.org/abs/2603.11611)
- [Código de entrenamiento y análisis](https://github.com/aflah02/Partial_RoPE_Analysis)
- [Perfil del autor en HuggingFace](https://huggingface.co/aflah)
- [Página personal del autor](https://aflah02.github.io/)
