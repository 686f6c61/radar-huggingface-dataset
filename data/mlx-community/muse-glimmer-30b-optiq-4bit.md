# mlx-community/Muse-Glimmer-30B-OptiQ-4bit

## Resumen

Muse-Glimmer-30B-OptiQ-4bit es una cuantización de precisión mixta, en formato MLX, del modelo multimodal meta-models/Muse-Glimmer-30B. La publica la organización mlx-community y la genera la herramienta mlx-optiq, un kit nativo de MLX para cuantizar, ajustar y servir modelos localmente en Apple Silicon sin PyTorch ni nube. El resultado es un modelo de imagen-texto a texto que cabe en un Mac: 18,6 GB para la torre de lenguaje en 4/8 bits más un sidecar de visión de 3,8 GB en bf16, sobre un repositorio de 23,9 GB.

El modelo base es un transformer decoder de 52 capas, con unos 30 000 millones de parámetros según la model card (27 854 780 928 parámetros reales en los safetensors, es decir 27,85 B). Es un modelo de razonamiento: separa el pensamiento de la respuesta en dos canales, `self` para el razonamiento y `user` para la contestación final, de forma que la respuesta no se contamina con los candidatos que el modelo descarta durante el razonamiento. Soporta entrada de imagen y de texto con el mismo checkpoint.

Su relevancia práctica está en que ofrece capacidades de razonamiento, código, matemáticas, recuperación en contexto largo y tool calling en un formato que se ejecuta íntegramente en local sobre Apple Silicon, con licencia Apache 2.0. La model card reporta un Capability Score de 87,36 (media de seis métricas), con un 100 % en recuperación en contexto largo (HashHop) y un 88,5 % en tool calling (BFCL-V3 simple), cifras que sitúan esta cuantización como la de mayor puntuación de la familia OptiQ.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (visión-lenguaje) de 52 capas; atención con puerta (gated), ventana deslizante de 2048 tokens en 3 de cada 4 capas y 13 capas globales con NoPE. Torre de visión en bf16 |
| Parametros totales | 27 854 780 928 (27,85 B) según los safetensors; la model card indica "~30B" |
| Parametros activos | No aplica: no es un modelo MoE, todos los parámetros están activos |
| Longitud de contexto | No disponible. La model card no declara la ventana máxima; describe ventana deslizante de 2048 tokens en 3 de cada 4 capas y 13 capas globales, y reporta 100 % en HashHop (recuperación en contexto largo) |
| Tipos de cuantizacion | Precisión mixta OptiQ guiada por sensibilidad: 169 proyecciones a 4 bits y 248 a 8 bits en la torre de lenguaje (417 proyecciones medidas); torre de visión en bf16. Media de bits por profundidad: 6,88 (capas 0-12), 6,50 (13-25), 6,27 (26-38), 5,85 (39-51). La etiqueta "4bit" denota la familia, no la media ponderada |
| Idiomas soportados | No disponible (los tags del repositorio no enumeran idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`); la torre de visión se sirve aparte en `optiq/optiq_vision.safetensors` (809 tensores) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de 52 capas con atención con puerta y un patrón híbrido de atención: ventana deslizante de 2048 tokens en tres de cada cuatro capas y 13 capas globales sin codificación posicional explícita (NoPE). El modelo incorpora una torre de visión independiente que en esta cuantización se mantiene en bf16, por lo que el mismo checkpoint procesa texto e imágenes. La salida se estructura en dos canales: el razonamiento va a `self` y la respuesta final a `user`, con delimitadores `<|message|>` y `<|eom|>` y llamadas a herramientas en un bloque `<atem:invoke>`.

Sobre el entrenamiento del modelo base no hay datos en la información disponible: no se especifican tokens de entrenamiento, composición del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que sí documenta la model card es el proceso de cuantización: se midieron las 417 proyecciones y la sensibilidad cae con la profundidad, de modo que las capas iniciales conservan más precisión y la segunda mitad se comprime con más agresividad. La torre de visión se reimplementó en MLX y se validó contra la referencia con un error relativo de 4e-07; la torre de lenguaje, con 1,8e-06.

## Capacidades

- Generación de texto y razonamiento explícito en dos canales (`self` y `user`), con el razonamiento separado de la respuesta final.
- Comprensión de imagen y texto (pipeline `image-text-to-text`): descripción de imágenes confirmada en la model card con un ejemplo de círculo rojo sobre fondo claro.
- Razonamiento matemático de varios pasos: 92,1 % en GSM8K (1000 muestras), con ejemplos de aritmética encadenada resueltos correctamente.
- Generación de código: 79,9 % de pass@1 en HumanEval (164 problemas).
- Tool calling / function calling: 88,5 % en BFCL-V3 simple (200 llamadas). Las llamadas se emiten en un bloque `<atem:invoke>`, no en el formato JSON habitual de `<tool_call>`.
- Seguimiento de instrucciones: 80,6 % en IFEval (conjunto completo, estricto).
- Recuperación en contexto largo: 100 % en HashHop.
- Conocimiento general: 83,1 % en MMLU (5-shot, 969 muestras).
- Capacidades multilingües: no disponible.
- Otras modalidades (audio, vídeo): no disponibles.

## Casos de uso

- Análisis de imágenes en local sobre Mac: el modelo acepta contenido de tipo `image_url` a través del endpoint de `optiq serve`, por lo que se puede usar para describir, clasificar o extraer información de capturas, fotografías de producto o tickets sin enviar los datos a un servicio externo.
- Asistente de razonamiento matemático: con un 92,1 % en GSM8K, es adecuado para resolución de problemas aritméticos encadenados, verificación de cálculos y tutoría paso a paso, siempre reservando un presupuesto de tokens amplio porque el canal de razonamiento consume tokens antes de emitir la respuesta.
- Revisión y generación de código en pipelines locales: con 79,9 % de pass@1 en HumanEval y soporte de tool calling, se puede integrar en tareas de refactorización, generación de tests o revisión de parches dentro de un flujo que invoque herramientas mediante bloques `<atem:invoke>`.
- Agentes y razonamiento multi-paso con herramientas: el 88,5 % en BFCL-V3 simple permite construir agentes que consulten APIs o bases de datos, teniendo en cuenta que el parser debe reconocer el formato `<atem:invoke>` en lugar del JSON estándar.
- Procesamiento de documentos largos: el 100 % en HashHop indica una recuperación fiable en contexto largo, útil para resumir expedientes extensos, localizar cláusulas en contratos o responder preguntas sobre documentación técnica.
- Atención al cliente y soporte multi-turno: el 80,6 % en IFEval (estricto) respalda el seguimiento de instrucciones de formato y tono en conversaciones encadenadas, servidas mediante un endpoint compatible con OpenAI y Anthropic.
- Digitalización de documentos con componente visual: al combinar torre de visión y contexto largo, puede extraer campos de facturas, albaranes o formularios escaneados y devolver la información estructurada.
- Investigación en cuantización: el repositorio documenta la asignación de bits por profundidad y las medias por tramos de capas, lo que lo convierte en un caso de estudio reproducible sobre el impacto de la precisión mixta guiada por sensibilidad en modelos multimodales.

## Benchmarks y rendimiento

Resultados publicados en la model card de esta cuantización (no del modelo base). La model card los presenta como la evaluación de texto estándar de OptiQ, con seis métricas.

| Metrica | Muestras | Resultado |
|---|---|---|
| MMLU (5-shot) | 969 | 83,1 % |
| GSM8K | 1000 | 92,1 % |
| IFEval (conjunto completo, estricto) | no disponible | 80,6 % |
| BFCL-V3 simple | 200 llamadas | 88,5 % |
| HumanEval (pass@1) | 164 problemas | 79,9 % |
| HashHop (recuperación en contexto largo) | no disponible | 100,0 % |
| Capability Score (media de 6) | no disponible | 87,36 |

No se han publicado en la información disponible resultados de benchmarks del modelo base ni comparaciones con otros modelos, por lo que no se incluye tabla comparativa de rendimiento.

## Requisitos de hardware

- Pesos en disco: 18,6 GB la torre de lenguaje (4/8 bits) más 3,8 GB el sidecar de visión en bf16, unos 22,4 GB en total; el repositorio completo ocupa 23,9 GB. Repartido entre los 27,85 B de parámetros, equivale a unos 5,3 bits por parámetro de media (cálculo propio a partir de los datos de la model card).
- Memoria unificada: se necesita un Mac que pueda alojar los ~22,4 GB de pesos más la caché KV y el overhead del runtime. Un equipo con 16 GB no es suficiente, ya que solo la torre de lenguaje (18,6 GB) supera esa cifra. Se recomienda un mínimo de 32 GB de memoria unificada y, para contexto largo o uso con visión simultánea, 48-64 GB.
- GPU/SoC: exclusivamente Apple Silicon con MLX (familias M1, M2, M3 y M4, preferiblemente variantes Pro, Max o Ultra por ancho de banda de memoria). No hay ruta de despliegue documentada para NVIDIA (A100, H100, RTX 4090) ni para CUDA.
- Despliegue: `pip install "mlx-optiq>=0.4.20"` y `import optiq`, que registra la arquitectura `muse_glimmer` y carga el sidecar de visión. Para texto, `mlx_lm.load` y `generate`. Para imagen y para endpoints compatibles con OpenAI y Anthropic, `optiq serve --model mlx-community/Muse-Glimmer-30B-OptiQ-4bit`.
- Compatibilidad: la model card indica que la arquitectura no la conoce mlx-lm estándar, por lo que se requiere `optiq`. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento, tamaño ni contexto de modelos alternativos de la misma categoría (vision-lenguaje de ~30 B o cuantizaciones MLX comparables), y no se dispone de las cifras necesarias para construir una comparación rigurosa.

Como única referencia dentro de la propia información, el modelo base meta-models/Muse-Glimmer-30B comparte arquitectura y número de parámetros, pero no se han publicado en esta información sus resultados de evaluación, su licencia ni su formato de pesos.

## Limitaciones y advertencias

- El canal de razonamiento (`self`) reformula la pregunta y propone candidatos que después descarta; parsear la cadena en bruto puede capturar números o respuestas que el modelo no llegó a asumir. Hay que leer únicamente el canal `user`.
- Las llamadas a herramientas usan el formato `<atem:invoke>`, no el JSON de `<tool_call>` más habitual; los parsers y frameworks de agentes estándar necesitan adaptación.
- Es un modelo de razonamiento: con un presupuesto de tokens corto se corta a mitad del razonamiento antes de abrir el canal de respuesta. Hay que dimensionar `max_tokens` generosamente.
- Requiere el paquete `optiq` y una versión igual o superior a 0.4.20; la arquitectura no la reconoce mlx-lm estándar. Esto limita el uso a entornos MLX y añade una dependencia de terceros.
- Dependencia de hardware: no hay soporte documentado para GPU NVIDIA ni para servidores con CUDA, lo que descarta su uso en infraestructura de centro de datos convencional.
- La licencia declarada en el repositorio es Apache 2.0, pero conviene verificar la licencia del modelo base meta-models/Muse-Glimmer-30B antes de un uso comercial, ya que las condiciones del modelo original pueden imponer restricciones adicionales.
- No se documentan los idiomas soportados; no hay garantía de calidad en castellano ni en otros idiomas distintos del inglés de las evaluaciones.
- No se han publicado datos sobre sesgos, tasas de alucinación ni comportamiento fuera de distribución del modelo base.
- Los benchmarks de la model card corresponden a esta cuantización concreta y no al modelo base; no deben extrapolarse a otras versiones del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mlx-community/Muse-Glimmer-30B-OptiQ-4bit
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Sitio del proyecto mlx-optiq: https://mlx-optiq.com/
- Guía de la familia Muse-Glimmer: https://mlx-optiq.com/docs/muse-glimmer
- Catálogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
- Documentación de mlx-optiq: https://mlx-optiq.com/docs/

Nota: los resultados de la búsqueda web proporcionada no contienen enlaces relacionados con este modelo; las entradas devueltas corresponden a páginas de la comunidad Zhihu sobre otros temas y se han descartado.
