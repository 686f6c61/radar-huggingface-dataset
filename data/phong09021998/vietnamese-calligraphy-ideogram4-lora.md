# phong09021998/vietnamese-calligraphy-ideogram4-lora

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) para generar imágenes de caligrafía vietnamita de alta fidelidad, con especial atención a la correcta representación de los diacríticos del alfabeto vietnamita y a la estética del trazo de pincel. El modelo ha sido desarrollado por Đỗ Tuấn Phong (usuario phong09021998) como parte de un trabajo de fin de máster, y se basa en el modelo de difusión Ideogram4 de 9.300 millones de parámetros. El adaptador se ha ajustado mediante fine-tuning sobre conjuntos de datos de palabras compuestas, con el objetivo de superar las limitaciones de los generadores de imágenes comerciales y de código abierto en la renderización de texto vietnamita con acentos y en estilos caligráficos.

La relevancia actual radica en la dificultad que tienen los modelos de texto a imagen para generar texto legible en alfabetos no latinos o con diacríticos complejos, como el vietnamita. Este LoRA ofrece una solución específica para ese problema, manteniendo además las capacidades generales de escena y composición del modelo base. El repositorio incluye dos versiones del adaptador: una en formato de entrenamiento (step-soup.safetensors) y otra convertida para inferencia (step-soup_infer.safetensors), junto con instrucciones de uso mediante DiffSynth-Studio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Ideogram4, un modelo de difusión de texto a imagen basado en transformer (DiT) de 9.3B parámetros |
| Parametros totales | No disponible (el adaptador LoRA pesa 1.7 GB en safetensors; el modelo base tiene 9.3B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de generación de imágenes, no de texto) |
| Tipos de cuantizacion | El modelo base se usa en FP8 según el ejemplo de inferencia; el adaptador LoRA se distribuye en safetensors sin cuantización especificada |
| Idiomas soportados | Vietnamita (para el texto caligráfico); otros idiomas no han sido evaluados |
| Licencia | No disponible |
| Formato de pesos | safetensors (step-soup.safetensors y step-soup_infer.safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 64 (relación alpha/rank = 1.0) en formato de entrenamiento, y una variante para inferencia que aplica alpha/sqrt(rank) = 8.0 con lora_B pre-dividido por 8, de modo que el delta efectivo es idéntico. Los módulos objetivo son seis: `attention.qkv`, `attention.o`, `feed_forward.w1`, `feed_forward.w2`, `feed_forward.w3` y `adaln_modulation`. Esto indica que la adaptación se aplica tanto a las capas de atención como a las de feed-forward y a la modulación adaptativa de normalización (adaln) del DiT.

El entrenamiento se realizó mediante fine-tuning supervisado (SFT) sobre conjuntos de datos de palabras compuestas en vietnamita, con múltiples épocas y una estrategia de "soup" (mezcla de checkpoints) para seleccionar el mejor resultado. No se menciona el número de tokens ni la composición exacta del dataset. Tampoco se indica el uso de RLHF o DPO. La evaluación se basa en inspección manual de la precisión a nivel de palabra, ya que los sistemas OCR no son fiables para este conjunto estilizado (se reporta un CER del 16.27% con el modelo Vintern-3B-R-beta).

## Capacidades

- Generación de imágenes de caligrafía vietnamita con precisión en los diacríticos y en el estilo de pincel tradicional.
- Renderizado de frases compuestas de varias palabras, organizadas en filas o cuadrículas según la descripción del prompt.
- Preservación de las capacidades de escena del modelo base: fondos, materiales, inclinación del papel y composición general.
- Soporte de prompts estructurados en JSON con descripción de alto nivel, estilo artístico y descomposición compositiva (layout-aware).
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo, al ser un modelo puramente de generación de imágenes.

## Casos de uso

- Creación de tarjetas de felicitación personalizadas: el modelo puede generar frases tradicionales vietnamitas como "An Khang Thịnh Vượng" en estilo caligráfico sobre fondos de papel de arroz, adecuado para ocasiones como el Año Nuevo Lunar.
- Diseño de carteles y afiches con tipografía caligráfica: se puede especificar el texto, el color de tinta y el estilo de trazo para producir material gráfico con identidad vietnamita.
- Generación de logotipos o elementos de branding para negocios que quieran incorporar caligrafía tradicional en su imagen corporativa.
- Ilustración de libros, poemarios o publicaciones culturales que requieran texto caligráfico integrado en escenas complejas.
- Prototipado rápido para diseñadores gráficos: permite experimentar con diferentes frases, estilos de pincel y composiciones sin necesidad de un calígrafo humano.
- Herramientas educativas para la enseñanza de la caligrafía vietnamita, generando ejemplos visuales de palabras y frases con la fuente Thanh Cong Unicode.

## Benchmarks y rendimiento

La model card reporta métricas propias de exactitud a nivel de palabra, evaluadas mediante inspección manual con semilla fija 7000. No se trata de benchmarks estándar como MMLU o HumanEval, sino de paneles específicos para este dominio.

| Panel | Tamaño | Rol | Resultado |
|---|---|---|---|
| Fragile60 | 60 palabras sueltas | Validación / selección de modelo | 52/60 (con soup `soup567`) |
| Compound Eval28 | 28 imágenes · 168 palabras | Validación / selección de modelo | 4 errores / 168 → 97,6 % |
| Held-out Test28 | 28 imágenes · 168 palabras | Reportado una vez tras congelar el checkpoint | 3 errores / 168 → 98,2 % |
| Scene / material / slant probe | 28 imágenes · 168 palabras | Sonda cualitativa de robustez | 10 errores / 168 → 94,0 % |

Es importante señalar que Test28 es el número a citar, pero no es una prueba totalmente "unseen": 97 de sus 168 palabras aparecen en el metadata de entrenamiento auditado, y solo 71 son completamente nuevas. La precisión cae al 94 % cuando se introducen escenas ricas con cambios de material y paneles inclinados, siendo el principal problema la unión de diacríticos, no la renderización de la escena en sí. Estos resultados se limitan a la fuente Thu Phap Thanh Cong Unicode; otras fuentes y otros idiomas no fueron probados.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM en la documentación.
- El ejemplo de inferencia carga el modelo base Ideogram4 en FP8 y ejecuta la generación en CUDA con `torch.bfloat16`, lo que sugiere una GPU con al menos 12-16 GB de VRAM para acomodar el modelo de 9.3B en FP8 y el adaptador.
- Se recomienda una GPU de gama alta como RTX 4090, A100 o H100 para tiempos de inferencia razonables, aunque no se indican cifras de latencia o throughput.
- El despliegue se realiza mediante DiffSynth-Studio, tal como se muestra en el código de ejemplo; no se mencionan otras herramientas como vLLM o llama.cpp (propias de modelos de texto).
- El adaptador en sí es ligero (1.7 GB), pero requiere el modelo base completo para funcionar.

## Comparativa con modelos similares

No se dispone de una comparativa cuantitativa con otros adaptadores o modelos de caligrafía vietnamita en la información proporcionada. La model card menciona que el modelo mejora la precisión de diacríticos y la estética caligráfica frente a Qwen Image, ERNIE Image y generadores comerciales de caja negra, pero no se aportan métricas numéricas de esos sistemas. Por tanto, no es posible establecer una tabla comparativa objetiva con datos verificables.

## Limitaciones y advertencias

- La evaluación se realizó únicamente con la fuente Thu Phap Thanh Cong Unicode; otras fuentes caligráficas o alfabetos no han sido probados y el rendimiento podría degradarse.
- El conjunto de evaluación Test28 no es completamente independiente del entrenamiento: 97 de 168 palabras aparecen en el metadata auditado, por lo que el 98,2 % debe interpretarse con cautela.
- En escenas complejas con materiales y paneles inclinados, la precisión de los diacríticos cae al 94 %, lo que puede ser insuficiente para usos donde la exactitud ortográfica sea crítica.
- El modelo puede presentar alucinaciones o errores en la renderización de palabras poco frecuentes o fuera del vocabulario de entrenamiento.
- No se especifica la licencia del adaptador, lo que genera incertidumbre sobre su uso comercial o la redistribución.
- No se han realizado pruebas de sesgos o de seguridad; al ser un modelo de generación de imágenes, podría replicar estereotipos culturales o producir contenido inapropiado si se le pide explícitamente.
- El uso en producción requiere el modelo base Ideogram4 FP8, que puede tener sus propias restricciones de licencia y disponibilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/phong09021998/vietnamese-calligraphy-ideogram4-lora
- Vista del árbol de archivos: https://huggingface.co/phong09021998/vietnamese-calligraphy-ideogram4-lora/tree/main
- Model card (README): https://huggingface.co/phong09021998/vietnamese-calligraphy-ideogram4-lora/blob/main/README.md
