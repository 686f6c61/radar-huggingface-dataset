# majentik/Qwen3.8-27B-MLX-8bit

## Resumen

El modelo `majentik/Qwen3.8-27B-MLX-8bit` es una versión cuantizada en 8 bits (affine, group size 64) del modelo multimodal `Qwen/Qwen3.8-27B`, preparada específicamente para ejecutarse en Apple Silicon mediante la librería MLX. El autor, `majentik`, ha convertido el modelo original utilizando `mlx_lm.convert` (mlx-lm 0.31.3), manteniendo la torre de visión y el proyector en BF16 mientras cuantiza la torre de texto a 8 bits. Esto reduce significativamente el uso de memoria unificada en comparación con el modelo original, permitiendo su uso en Mac con recursos moderados.

El modelo base, Qwen3.8-27B, es un modelo de la familia Qwen con capacidades de procesamiento de imagen y texto (image-text-to-text), diseñado para tareas conversacionales multimodales. Esta variante cuantizada conserva las capacidades del modelo original, aunque con una posible pérdida de precisión debido a la cuantización. Es relevante porque democratiza el acceso a un modelo multimodal de gran tamaño en hardware de consumo de Apple, sin necesidad de GPUs dedicadas.

El repositorio incluye un "smoke gate" que verifica la coherencia de la generación tras la cuantización, lo que aporta cierta garantía de calidad. Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (text tower + vision tower), basado en Qwen3.8-27B |
| Parametros totales | 8.027.131.120 (según safetensors del repo cuantizado; el modelo base se denomina Qwen3.8-27B, lo que sugiere 27B, pero no hay confirmación oficial) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (affine, group size 64) para la torre de texto; torre de visión y proyector en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal con una torre de texto y una torre de visión separadas, más un proyector que fusiona las representaciones. La variante cuantizada mantiene la torre de visión y el proyector en BF16, mientras que la torre de texto se cuantiza a 8 bits con esquema affine y group size 64. Esta cuantización reduce el tamaño del modelo de aproximadamente 27 GB (en BF16) a unos 29.5 GB en el repositorio (incluyendo los componentes en BF16 y metadatos). No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La cuantización se realizó con `mlx_lm.convert` de la librería mlx-lm 0.31.3, y el autor verificó la coherencia de la generación mediante un "smoke gate" determinista.

## Capacidades

- Procesamiento de imágenes y texto: el modelo acepta entradas multimodales (imagen + texto) y genera respuestas textuales.
- Conversación multimodal: puede mantener diálogos que involucran referencias a imágenes, como responder preguntas sobre el contenido visual.
- Generación de texto: capacidades estándar de generación de lenguaje natural, aunque no se especifican detalles sobre razonamiento, código o matemáticas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: al ser multimodal, puede realizar tareas de captioning, VQA (visual question answering) y descripción de imágenes.

## Casos de uso

- Descripción automática de imágenes en aplicaciones de accesibilidad: el modelo puede generar descripciones textuales de fotografías o gráficos, ayudando a personas con discapacidad visual. Su ejecución en Apple Silicon permite integrarlo en apps de macOS o iOS sin depender de servicios en la nube.
- Asistente conversacional con entrada visual: un chatbot que recibe una foto del usuario (por ejemplo, un objeto o un lugar) y responde preguntas sobre ella, útil en guías turísticas o soporte técnico.
- Análisis de documentos escaneados: al combinar OCR con el modelo, se pueden extraer y resumir información de imágenes de documentos, facturas o capturas de pantalla.
- Moderación de contenido visual: el modelo puede clasificar o describir imágenes para detectar contenido inapropiado, aunque se requeriría un ajuste fino adicional.
- Generación de metadatos para bibliotecas de imágenes: automatizar la creación de etiquetas y descripciones para archivos fotográficos en aplicaciones de gestión de activos digitales.
- Prototipado rápido de aplicaciones multimodales en Mac: gracias a la cuantización MLX, los desarrolladores pueden probar flujos de trabajo de imagen-texto localmente sin necesidad de GPUs de gama alta, acelerando el desarrollo de MVPs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Memoria unificada estimada: el repositorio ocupa 29.5 GB, por lo que se recomienda un Mac con al menos 32 GB de RAM unificada para cargar el modelo completo. Con 64 GB se dispone de margen para el contexto y el sistema operativo.
- GPU recomendadas: no aplica (Apple Silicon con Neural Engine y GPU integrada). Modelos como M1 Pro/Max, M2 Pro/Max, M3 Pro/Max o superiores son adecuados.
- Compatibilidad con hardware de consumo: sí, cualquier Mac con Apple Silicon y suficiente memoria unificada puede ejecutarlo.
- Opciones de despliegue: mediante `mlx-lm` (CLI o Python), compatible con `mlx_lm.generate` y `mlx_lm.load`. También puede integrarse en aplicaciones usando la API de MLX.
- Latencia y throughput: no se proporcionan datos. La latencia dependerá del modelo de chip y de la longitud del contexto; en un M2 Max se espera una generación de varios tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (multimodales cuantizados para MLX). Se podría comparar con otras versiones cuantizadas del mismo modelo base (2-bit, 4-bit, etc.) disponibles en el perfil de `majentik`, pero no se dispone de datos de rendimiento para establecer una comparativa objetiva.

## Limitaciones y advertencias

- La cuantización a 8 bits puede introducir una degradación en la precisión del modelo, especialmente en tareas que requieren razonamiento numérico o detalles finos.
- No se dispone de información sobre sesgos del modelo base. Como cualquier modelo entrenado con datos web, puede reflejar sesgos sociales, culturales o de género.
- Riesgo de alucinación: inherente a los modelos generativos; el "smoke gate" solo verifica coherencia básica, no la veracidad de las respuestas.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto soportada; el modelo base podría tener un límite específico que no se ha documentado en esta variante.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe mantener el aviso de licencia y atribución. No hay restricciones adicionales conocidas.
- Para producción, se recomienda validar el comportamiento del modelo en el caso de uso específico, ya que la cuantización puede afectar a tareas multimodales complejas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/majentik/Qwen3.8-27B-MLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Otras versiones cuantizadas del mismo autor: https://huggingface.co/majentik (perfil)
