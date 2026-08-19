# majentik/BigBang-v1-MLX-4bit

## Resumen

BigBang-v1-MLX-4bit es una variante cuantizada en 4 bits (affine, group size 32) del modelo multimodal BigBang-v1, desarrollada por majentik para su ejecución en silicio de Apple mediante la librería MLX. El modelo original, endless-frontier/BigBang-v1, emplea una arquitectura de mezcla de expertos (MoE) basada en Qwen3.5-MoE y es capaz de procesar entradas de imagen y texto, generando respuestas de texto. Esta versión cuantizada reduce el uso de memoria y acelera la inferencia en Macs con Apple Silicon, manteniendo la torre de visión y el proyector en BF16 para preservar la calidad de la comprensión visual.

La relevancia de esta ficha radica en que ofrece una opción práctica para ejecutar un modelo multimodal de ~6,95 mil millones de parámetros en hardware de consumo de Apple, sin necesidad de GPUs dedicadas. Al estar licenciado bajo Apache-2.0, permite uso comercial y modificación. Sin embargo, al ser una cuantización de un modelo base, las capacidades exactas dependen del modelo original, del cual no se proporcionan detalles completos en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5-MoE (según etiqueta `qwen3_5_moe`) |
| Parametros totales | 6.948.351.856 (~6,95 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 32 (texto); torre de visión y proyector en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original BigBang-v1 es un modelo multimodal (imagen-texto) con arquitectura de mezcla de expertos, como indica la etiqueta `qwen3_5_moe`. No se dispone de información sobre el número de expertos, el total de tokens de entrenamiento, la composición del dataset ni los métodos de alineación (RLHF, DPO, etc.). Esta variante MLX-4bit no ha sido entrenada desde cero; es una conversión del modelo original mediante `mlx_lm.convert` (mlx-lm 0.31.3), que cuantiza únicamente la torre de texto a 4 bits con grupo de 32, mientras que la torre de visión y el proyector se mantienen en BF16. El proceso de conversión no implica ajuste fino, por lo que las capacidades del modelo son heredadas del original.

## Capacidades

- Procesamiento multimodal: acepta imágenes y texto como entrada, generando texto como salida (pipeline `image-text-to-text`).
- Generación de texto conversacional: el modelo puede mantener diálogos multi-turno, según el uso típico de modelos de chat.
- Comprensión de imágenes: al incluir torre de visión, puede describir o responder preguntas sobre imágenes.
- Ejecución eficiente en Apple Silicon: gracias a la cuantización MLX, está optimizado para Macs con chips M-series.
- No se dispone de información verificada sobre capacidades específicas como tool calling, razonamiento multi-paso, soporte de agentes o lenguajes concretos.

## Casos de uso

- Asistente de descripción de imágenes en Mac: el modelo puede generar descripciones detalladas o responder preguntas sobre fotografías, diagramas o capturas de pantalla directamente en un equipo Apple, sin conexión a la nube.
- Chat multimodal local: integración en aplicaciones de escritorio o scripts que requieran conversación con contexto visual, aprovechando la ventaja de ejecución local para proteger la privacidad de los datos.
- Prototipado rápido de aplicaciones de visión-lenguaje: desarrolladores pueden usar la versión cuantizada para validar ideas en hardware de consumo antes de escalar a modelos más grandes.
- Automatización de tareas de anotación: el modelo puede generar descripciones preliminares de imágenes para acelerar pipelines de etiquetado, reduciendo costes de cómputo al ejecutarse localmente.
- Accesibilidad: ayuda a personas con discapacidad visual describiendo el contenido de imágenes en tiempo real desde un Mac.
- Investigación educativa: sirve como ejemplo práctico de despliegue de modelos MoE multimodales en entornos de bajo consumo, útil para cursos o experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona una prueba de coherencia determinista (generación de 48 tokens con decodificación greedy) que verificó ausencia de vacíos, bucles de repetición, basura multi-script o restos de tokens especiales, con veredicto "ok". No hay datos comparativos con otros modelos.

## Requisitos de hardware

- Destinado a Apple Silicon (M1, M2, M3, M4 y superiores) mediante MLX.
- El tamaño del repositorio es de 22,6 GB, que incluye la torre de visión y el proyector en BF16; la parte de texto cuantizada a 4 bits ocupa aproximadamente 3,5 GB (estimación basada en 6,95B parámetros × 0,5 bytes/parámetro), pero el total en memoria dependerá de la carga de la torre de visión.
- Se recomienda al menos 16 GB de RAM unificada para ejecutar el modelo completo con holgura, aunque podría funcionar con 8 GB en configuraciones ajustadas.
- Inferencia mediante `mlx_lm.generate` (ver ejemplo en la model card) o integración con la API de mlx-lm.
- No requiere GPU dedicada; la unidad Neural Engine y los núcleos GPU de Apple Silicon son suficientes.
- Latencia y throughput no documentados; dependerán del modelo exacto de chip y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Al ser una cuantización de un modelo base no documentado públicamente, no es posible establecer una comparativa fiable con alternativas como Qwen-VL, LLaVA u otros MoE multimodales sin datos adicionales.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar ligeramente la calidad de generación en comparación con el modelo original en BF16, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- No se conocen los sesgos específicos del modelo original, pero al ser un modelo de lenguaje multimodal, puede heredar sesgos presentes en sus datos de entrenamiento, que no han sido documentados.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en descripciones de imágenes ambiguas.
- Limitaciones de idioma: no se especifican los idiomas soportados; es posible que el rendimiento varíe entre lenguas.
- El contexto máximo no está documentado; se recomienda precaución al manejar conversaciones o imágenes con mucho texto.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base original (endless-frontier/BigBang-v1) también cumpla con esa licencia, aunque así lo indica su model card.
- Para producción, es recomendable realizar pruebas adicionales de robustez y evaluar la degradación por cuantización en el caso de uso específico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/majentik/BigBang-v1-MLX-4bit
- Modelo base: https://huggingface.co/endless-frontier/BigBang-v1
- Otras variantes de cuantización:
  - 2-bit: https://huggingface.co/majentik/BigBang-v1-MLX-2bit
  - 3-bit: https://huggingface.co/majentik/BigBang-v1-MLX-3bit
  - 5-bit: https://huggingface.co/majentik/BigBang-v1-MLX-5bit
  - 6-bit: https://huggingface.co/majentik/BigBang-v1-MLX-6bit
  - 8-bit: https://huggingface.co/majentik/BigBang-v1-MLX-8bit
  - MXFP4: https://huggingface.co/majentik/BigBang-v1-MLX-MXFP4
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
