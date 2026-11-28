# mradermacher/Qwen3.5-4B-Abliterated-Full-i1-GGUF

## Resumen

Qwen3.5-4B-Abliterated-Full-i1-GGUF es una compilación de cuantizaciones GGUF generadas por mradermacher a partir del modelo base panzy1222/Qwen3.5-4B-Abliterated-Full. No se trata de un modelo entrenado desde cero, sino de una distribución de pesos cuantizados en formato GGUF (con variantes i1/imatrix y estáticas) pensada para su uso con llama.cpp y herramientas compatibles. El modelo subyacente pertenece a la familia Qwen3.5 con aproximadamente 4.200 millones de parámetros, y el sufijo "Abliterated" indica que se ha aplicado algún tipo de modificación (típicamente eliminación de rechazos o de comportamientos de alineación) sobre el modelo original.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de ~4B en hardware de consumo, con múltiples niveles de cuantización que van desde IQ1 hasta Q6_K, cubriendo desde 1,6 GB hasta 3,6 GB por archivo. El repositorio acumula 3.929 descargas y 1 like en el momento de la consulta, y ocupa 54,3 GB en total debido a la gran cantidad de variantes incluidas.

No se dispone de información detallada sobre la arquitectura interna, los datos de entrenamiento ni los benchmarks del modelo base en la información proporcionada; esta ficha se limita a documentar lo que consta en la model card y los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.5, transformer presumiblemente, sin confirmar) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-Q4_0, i1-IQ4_XS, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; además de un archivo imatrix para generar cuantizaciones propias |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base panzy1222/Qwen3.5-4B-Abliterated-Full en la información proporcionada. Por el nombre se infiere que deriva de la familia Qwen3.5, pero no consta el tipo de transformer, la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF, DPO u otras. El sufijo "Abliterated" sugiere una modificación posterior al entrenamiento orientada a eliminar rechazos o restricciones de alineación, pero no se documenta el procedimiento exacto.

Lo que sí está documentado es el proceso de cuantización: mradermacher ha generado cuantizaciones i1 (imatrix) y estáticas. Las variantes i1 emplean un archivo imatrix específico del modelo para mejorar la calidad de cuantizaciones de baja precisión, y la model card incluye una tabla con tamaños y notas de calidad para cada variante. Existe también un repositorio hermano con cuantizaciones estáticas en https://huggingface.co/mradermacher/Qwen3.5-4B-Abliterated-Full-GGUF.

## Capacidades

- Generación de texto conversacional: el tag "conversational" indica uso previsto para diálogo.
- Idiomas: la model card declara únicamente inglés ("en").
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede servirse mediante infraestructura de inferencia compatible con la API de Hugging Face.
- Ejecución local: al estar en formato GGUF, es compatible con llama.cpp y derivados (Ollama, LM Studio, etc.).
- Capacidades específicas de razonamiento, código, matemáticas, tool calling, agentes o visión: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local en portátiles y equipos de sobremesa: con cuantizaciones de 2,6-2,8 GB (Q4_0, IQ4_XS, Q4_K_S, Q4_K_M), el modelo puede ejecutarse en GPUs de consumo con 6-8 GB de VRAM, o incluso en CPU con suficiente RAM, lo que lo hace adecuado para prototipado offline sin depender de APIs.
- Experimentación con modelos "abliterated": útil para investigadores que estudian el efecto de la eliminación de alineación sobre el comportamiento del modelo, comparando respuestas frente al modelo base original.
- Generación de texto conversacional en inglés: dado el tag "conversational" y el idioma declarado, encaja en asistentes de chat simples o generación de borradores en inglés.
- Pruebas de pipelines de cuantización: el archivo imatrix incluido permite a desarrolladores generar sus propias cuantizaciones y evaluar la degradación de calidad entre niveles (IQ1 a Q6_K).
- Integración en entornos con recursos limitados: la variante IQ1_S (1,6 GB) permite ejecutar el modelo en dispositivos con muy poca memoria, aunque con calidad degradada, para tareas de generación tolerantes a errores.
- Evaluación comparativa de cuantizaciones: la amplia gama de variantes facilita estudios de trade-off entre tamaño, velocidad y perplejidad en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre ~1,6 GB (i1-IQ1_S) y ~3,6 GB (i1-Q6_K) solo para los pesos; hay que añadir la memoria para el contexto KV, que depende de la longitud de contexto configurada (no disponible).
- GPU recomendadas: no se especifican en la información; por tamaño, cualquier GPU con 6 GB o más de VRAM puede alojar las cuantizaciones de 4 bits (Q4_K_M, 2,8 GB) con margen para contexto moderado.
- ¿Cabe en GPU de consumo? Sí: las variantes Q4 e inferiores caben en GPUs de 6-8 GB (RTX 3060, RTX 4060, RTX 2070, etc.); las variantes Q5/Q6 requieren 8 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; también puede servirse vía endpoints compatibles según el tag del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada. Como referencia estructural, se puede comparar con otras distribuciones GGUF de modelos de ~4B, pero sin datos de benchmarks no es posible establecer una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Abliterated-Full-i1-GGUF (este) | 4.205.751.296 | no disponible | no disponible | GGUF | Hugging Face |
| Modelo base panzy1222/Qwen3.5-4B-Abliterated-Full | 4.205.751.296 | no disponible | no disponible | safetensors | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo es una cuantización: las variantes de baja precisión (IQ1, IQ2, Q2_K) degradan notablemente la calidad; la propia model card advierte "very low quality" para Q2_K_S y "for the desperate" para IQ1_S.
- El proceso "abliteration" elimina o reduce los rechazos del modelo, lo que puede aumentar la probabilidad de generar contenido inapropiado, sesgado o dañino; no se documenta el alcance exacto de la modificación.
- Riesgo de alucinación: inherente a modelos de ~4B, especialmente en cuantizaciones agresivas; no hay benchmarks que cuantifiquen este riesgo.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base antes de usarlo en producción.
- Longitud de contexto no disponible: no se puede planificar el uso en tareas que requieran ventanas largas sin consultar la documentación del modelo base.
- El repositorio ocupa 54,3 GB por la multitud de variantes; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-Abliterated-Full-i1-GGUF
- Modelo base: https://huggingface.co/panzy1222/Qwen3.5-4B-Abliterated-Full
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.5-4B-Abliterated-Full-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#Qwen3.5-4B-Abliterated-Full-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de comparación de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelo: https://huggingface.co/mraderma (enlace incompleto en la model card original)
