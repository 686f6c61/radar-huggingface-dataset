# hailun-core/Hy-MT3-1.8B-mlx-fp16

## Resumen

Hy-MT3-1.8B-mlx-fp16 es una conversión al formato MLX (Apple Silicon) del modelo de traducción automática Tencent Hy-MT3-1.8B, publicada por el usuario hailun-core. El modelo original lo desarrolla Tencent y está especializado en traducción multilingüe, con soporte declarado para más de 90 idiomas. Esta variante concreta no aporta pesos nuevos: es un artefacto de distribución pensado para ejecutarse con la librería `mlx-lm` en hardware de Apple (chips M-series), en precisión fp16.

El modelo resuelve el problema de la traducción automática neuronal multilingüe en local, sin depender de APIs externas, con un tamaño contenido de 1.791.080.448 parámetros (aproximadamente 1,8 mil millones). Su interés práctico radica en que permite desplegar traducción de alta cobertura lingüística en un portátil o Mac de sobremesa, algo relevante para pipelines de localización, procesamiento de documentación y aplicaciones que requieren privacidad de datos.

La arquitectura declarada en los metadatos es `hunyuan_v1_dense`, es decir, un transformer denso (no MoE) de la familia Hunyuan. La licencia es Apache 2.0, lo que facilita el uso comercial. No se dispone de información publicada sobre longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`hunyuan_v1_dense`) |
| Parametros totales | 1.791.080.448 (~1,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (esta variante); otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | Más de 90 idiomas, entre ellos zh, en, es, fr, de, it, pt, ru, ja, ko, ar, hi, tr, vi, th, id, nl, pl, uk, etc. |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 3,6 GB) |

## Arquitectura y entrenamiento

El modelo base Tencent Hy-MT3-1.8B emplea una arquitectura transformer densa identificada como `hunyuan_v1_dense`, con aproximadamente 1,8 mil millones de parámetros. Al tratarse de un modelo denso, todos los parámetros participan en cada paso de inferencia, lo que simplifica el despliegue frente a alternativas MoE pero implica un coste computacional proporcional al tamaño completo. Esta variante mlx-fp16 conserva la arquitectura y los pesos del original, únicamente reempaquetados para MLX mediante `mlx-lm` 0.31.2.

No se ha publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas (atención lineal, decodificación especulativa u otras). La especialización declarada es la traducción, y la etiqueta de pipeline es `translation`, lo que sugiere un ajuste orientado a tareas de traducción más que a propósito general.

## Capacidades

- Traducción automática multilingüe entre más de 90 idiomas, incluyendo pares de baja representación como camboyano (km), birmano (my), tibetano (bo), uigur (ug) o cebuano (ceb).
- Generación de texto condicionada por plantilla de chat (`apply_chat_template`), lo que permite formatear la petición de traducción como mensaje de usuario.
- Ejecución local en Apple Silicon mediante `mlx-lm`, sin necesidad de GPU NVIDIA ni servicios en la nube.
- Soporte de los idiomas listados en los metadatos, con cobertura amplia de lenguas europeas, asiáticas, de Oriente Medio y africanas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento en la información disponible.

## Casos de uso

- Localización de software y documentación: el modelo puede traducir cadenas de interfaz y textos técnicos entre los más de 90 idiomas soportados, ejecutándose en un Mac de desarrollo sin enviar contenido propietario a terceros.
- Traducción de documentación interna con requisitos de privacidad: al correr en local sobre MLX, los datos no salen del dispositivo, lo que encaja en entornos con políticas estrictas de confidencialidad.
- Procesamiento por lotes de corpus multilingües: su tamaño de 1,8 B permite procesar grandes volúmenes de texto en hardware de consumo, con throughput razonable para tareas offline.
- Traducción de correspondencia y atención al cliente: integrable en aplicaciones de escritorio o servidores locales para traducir mensajes entrantes en idiomas poco cubiertos por otros modelos.
- Investigación en traducción automática de bajos recursos: útil para experimentar con pares como km-en, my-zh o bo-en sin depender de infraestructura de gran escala.
- Prototipado rápido en entornos Apple: gracias a `mlx-lm`, un desarrollador puede validar un pipeline de traducción en minutos en un MacBook, antes de escalar a producción con el modelo original en transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: en fp16, los ~1,8 B de parámetros ocupan aproximadamente 3,6 GB de pesos; con overhead de activaciones y caché KV, se recomienda al menos 6-8 GB de memoria unificada.
- Hardware objetivo: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX.
- Cabe en GPU de consumo: sí, en cualquier Mac con 8 GB o más de memoria unificada; también sería viable en GPUs NVIDIA de 8 GB o más usando el modelo original en transformers, aunque esta variante concreta está pensada para MLX.
- Opciones de despliegue: `mlx-lm` (librería indicada por el autor). Para el modelo base, transformers y potencialmente otras herramientas del ecosistema, aunque no se documentan en esta ficha.
- Latencia y throughput: no disponibles. Dependerán del chip Apple concreto y de la longitud de las secuencias.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy-MT3-1.8B-mlx-fp16 (este) | ~1,8 B | no disponible | Apache 2.0 | MLX safetensors | Variante MLX del modelo de Tencent |
| tencent/Hy-MT3-1.8B | ~1,8 B | no disponible | Apache 2.0 | safetensors (transformers) | Modelo base original, multiplataforma |
| NLLB-200 (Meta) | 600 M – 54 B | 512 tokens (versión densa estándar) | CC-BY-NC 4.0 | safetensors, GGUF | 200 idiomas; licencia no comercial en la mayoría de variantes |
| M2M-100 (Meta) | 418 M – 12 B | 1024 tokens | MIT | safetensors | 100 idiomas; más antiguo y con menor calidad en pares difíciles |

La comparación con NLLB y M2M-100 se ofrece como referencia de categoría (traducción multilingüe masiva); los datos de contexto de Hy-MT3 no están publicados, por lo que la comparación en ese eje queda incompleta.

## Limitaciones y advertencias

- Es un artefacto de conversión: no aporta mejoras sobre el modelo base y su validez depende de la fidelidad de la conversión MLX; para producción en servidores conviene usar `tencent/Hy-MT3-1.8B`.
- La licencia Apache 2.0 del repositorio permite uso comercial, pero conviene verificar la licencia del modelo base original antes de desplegar.
- Riesgo de alucinación y de traducciones incorrectas en pares de idiomas de bajos recursos (por ejemplo, bo, ug, my, km), donde los datos de entrenamiento suelen ser escasos.
- Sesgos potenciales heredados del corpus de entrenamiento del modelo base; no se documentan evaluaciones de sesgo en la información disponible.
- No se dispone de longitud de contexto publicada, lo que dificulta planificar el procesamiento de documentos largos.
- El rendimiento real en MLX puede diferir del obtenido con transformers en GPU, y no se han publicado mediciones de latencia o calidad para esta variante.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hailun-core/Hy-MT3-1.8B-mlx-fp16
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
- Documentación de MLX: https://ml-explore.github.io/mlx/
