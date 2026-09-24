# Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ55e-mtp-vision

# Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ55e-mtp-vision

## Resumen

Se trata de una publicación comunitaria alojada en HuggingFace por el usuario Johneeee, consistente en una cuantización mixta de 4 bits de un modelo de la familia qwen3_5, según el campo `model_type` declarado en su model card. El artefacto no es un modelo entrenado desde cero ni una versión oficial de Alibaba/Qwen, sino una recuantización del checkpoint, generada con la herramienta oQ (oMLX v0.7.0.dev4) y distribuida en formato MLX safetensors. El repositorio pesa 20,0 GB y el recuento real de parámetros en los safetensors es de 27.781.427.952 (≈27,78 mil millones).

El interés técnico del artefacto es doble. Por un lado, permite ejecutar un modelo de casi 28 000 millones de parámetros en equipos Apple Silicon con memoria unificada, algo viable gracias a la cuantización de 4 bits con grupo de 64. Por otro, sirve como ejemplo de cuantización mixta (mixed-precision) aplicada con oQ, una técnica que asigna distinto número de bits a distintas capas o tensores para preservar calidad donde más importa.

Ahora bien, la información publicada es extremadamente escasa y el modelo no tiene tracción alguna: cero descargas y cero «likes» en el momento de redactar esta ficha. No se declara licencia, ni idiomas, ni pipeline, ni especificaciones de contexto, ni procedencia exacta del checkpoint base. Además, el nombre incluye términos como «Uncensored», «mtp» y «vision» que no están confirmados en la model card, por lo que deben tratarse como indicios del nombre del repositorio y no como capacidades verificadas. Cualquier evaluación en producción exige verificación empírica previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el campo `model_type` del repositorio es `qwen3_5`; no se detalla si es transformer denso, MoE o híbrida) |
| Parámetros totales | 27.781.427.952 (≈27,78 B, dato de los safetensors) |
| Parámetros activos | no disponible (no se indica si el modelo es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits, tamaño de grupo 64, cuantización mixta de precisión (oQ / oMLX v0.7.0.dev4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (librería `mlx`); no se publican pesos GGUF, AWQ, GPTQ ni fp16 sin cuantizar |
| Autor | Johneeee |
| Tamaño del repositorio | 20,0 GB |
| Fecha de creación | 2026-09-24 |
| Última actualización | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. El único dato estructural es el campo `model_type: qwen3_5`, que apunta a la familia Qwen3.5, pero no se especifica si se trata de un transformer denso, de una mezcla de expertos (MoE), de una arquitectura híbrida con atención lineal o de cualquier otra variante. El sufijo «mtp» del nombre del repositorio podría sugerir predicción multi-token (multi-token prediction), y «vision» podría indicar la presencia de un codificador multimodal, pero ninguno de los dos extremos está confirmado en la model card. Tampoco hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO u otras técnicas de alineación.

Lo único documentado con cierto detalle es el proceso de cuantización posterior. El autor indica que el modelo se cuantizó con oQ (oMLX v0.7.0.dev4) mediante cuantización mixta de precisión, a 4 bits con tamaño de grupo 64, y que el resultado se empaquetó en safetensors de MLX. Esto implica que los pesos originales de alta precisión se comprimieron por bloques de 64 parámetros, cada uno con sus escalas asociadas, y que distintas partes del modelo pueden haber recibido distinto tratamiento en función de su sensibilidad. No se publica la receta exacta de asignación de bits por capa, ni métricas de degradación respecto al checkpoint original, ni el identificador del modelo base del que procede.

## Capacidades

- Generación de texto: capacidad esperable por tratarse de un modelo de la familia qwen3_5, aunque no se documenta explícitamente en la información disponible.
- Razonamiento y matemáticas: no disponible; no hay benchmarks ni descripción funcional publicada.
- Generación de código: no disponible; no se documenta soporte ni evaluación.
- Visión: el nombre del repositorio incluye el término «vision», pero la model card no confirma ningún componente multimodal ni procesamiento de imágenes.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Predicción multi-token (mtp): el nombre del repositorio lo sugiere, pero no está confirmado.
- Comportamiento «uncensored»: solo indicado en el nombre del repositorio; no hay ninguna descripción del ajuste de alineación aplicado ni de sus efectos.

## Casos de uso

- Prototipado local en Apple Silicon: el modelo está empaquetado en MLX safetensors a 4 bits, de modo que puede cargarse con `mlx-lm` en un Mac con memoria unificada suficiente. Es adecuado para experimentar con un modelo de casi 28 B sin depender de GPU dedicada ni de servicios en la nube.
- Asistentes conversacionales internos en equipos de desarrollo: un modelo de 27,78 B cuantizado a 4 bits ofrece una relación calidad-coste razonable para bots de consulta sobre documentación interna, siempre que se valide antes la calidad real tras la cuantización.
- Investigación en cuantización mixta: el artefacto es un caso de estudio de la técnica oQ con grupo 64. Resulta útil para comparar la degradación de calidad frente al checkpoint original (no publicado aquí) midiendo perplejidad o tareas de evaluación controladas.
- Red teaming y evaluación de seguridad: si el ajuste «uncensored» del nombre es real, el modelo puede emplearse en entornos aislados para estudiar respuestas ante prompts sensibles y calibrar filtros de moderación. Requiere aislamiento estricto y no debe exponerse a usuarios finales.
- Procesamiento por lotes sin conexión: tareas de resumen, clasificación o extracción de información sobre volúmenes moderados de texto que se ejecuten en local por motivos de confidencialidad, aprovechando que los datos nunca salen de la máquina.
- Ajuste fino adicional con LoRA o QLoRA: sobre la base cuantizada puede entrenarse un adaptador específico de dominio en MLX, útil cuando se necesita especializar el modelo sin desplegar infraestructura CUDA.
- Evaluación comparativa de pipelines MLX frente a CUDA: sirve como banco de pruebas para medir latencia y consumo de memoria de un modelo de esta escala en memoria unificada frente a alternativas en formato GGUF o GPTQ.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, ni tampoco comparaciones con el checkpoint original sin cuantizar.

## Requisitos de hardware

- Estimación de pesos: 27.781.427.952 parámetros a 4 bits equivalen a ≈13,9 GB (≈12,9 GiB) solo en pesos. Sumando las escalas de grupo 64 en fp16 (≈0,87 GB), el total ronda los 14,8 GB (≈13,8 GiB). Son cálculos aritméticos a partir del recuento real de parámetros, no cifras publicadas por el autor.
- Tamaño real del repositorio: 20,0 GB, superior a la estimación anterior, lo que sugiere la presencia de tensores no cuantizados, posibles módulos adicionales (codificador de visión, cabezas de predicción) y metadatos.
- Memoria recomendada: en Mac con memoria unificada se recomienda un mínimo de 32 GB para dejar margen a la caché KV, al sistema operativo y al resto de aplicaciones. Con 24 GB el modelo puede ser cargado pero el margen operativo es muy estrecho. Configuraciones de 64 GB o superiores permiten contextos más largos y lotes mayores.
- GPU compatibles: no disponible. MLX es un framework específico de Apple Silicon, por lo que no se puede ejecutar directamente sobre A100, H100, RTX 4090 ni otras GPU NVIDIA o AMD. Su uso en CUDA exigiría convertir los pesos a otro formato (por ejemplo GGUF), conversión que no está documentada ni garantizada para este repositorio.
- Equipos Apple recomendados: chips de la familia M Max o Ultra (M2 Max, M2 Ultra, M3 Max, M3 Ultra, M4 Max) con 32 GB de memoria unificada o más.
- Opciones de despliegue: `mlx-lm` para inferencia y `mlx-lm.server` para exponer una API compatible con OpenAI. No se documentan variantes para vLLM, TGI, llama.cpp, Ollama ni LM Studio, ya que ninguno de ellos consume safetensors de MLX de forma nativa.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada. La referencia natural sería el checkpoint original de la familia qwen3_5 del que procede esta cuantización, pero su identificador, tamaño, contexto y licencia no se indican en el repositorio, por lo que no puede establecerse una comparación rigurosa.

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Johneeee) | 27,78 B | no disponible | 4 bits, grupo 64, MLX | no disponible | HuggingFace, 0 descargas |
| Checkpoint base de la familia qwen3_5 | no disponible | no disponible | no disponible | no disponible | no identificado en el repositorio |
| Alternativas de la misma escala | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia alguna. Sin una licencia explícita, no hay autorización clara para uso comercial ni para redistribución, lo que constituye un riesgo legal directo en cualquier entorno productivo.
- Sin validación comunitaria: cero descargas y cero «likes». No hay evidencia de que terceros hayan reproducido la carga del modelo o verificado su correcto funcionamiento.
- Procedencia no verificada: no se identifica el checkpoint base ni se confirma que exista un modelo oficial llamado «Qwen3.8-27B». La nomenclatura del repositorio es atípica y no equivale a una designación oficial de la familia Qwen.
- Degradación por cuantización: la compresión a 4 bits con grupo 64 introduce pérdida de precisión respecto al modelo original. La degradación suele notarse antes en razonamiento matemático, generación de código y contextos largos. No se publican métricas de esta pérdida.
- Falta de alineación de seguridad: la etiqueta «Uncensored» del nombre apunta a un ajuste que reduce los rechazos ante peticiones sensibles. Si se confirma, el modelo puede producir contenido inapropiado, dañino o ilegal, y no debe desplegarse sin capas adicionales de moderación.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones de fidelidad factual que permitan acotarlo.
- Idiomas no declarados: no se especifica qué lenguas soporta. No puede asumirse un rendimiento correcto en castellano sin pruebas previas.
- Contexto desconocido: no se indica la longitud de ventana. Cualquier diseño de aplicación que dependa de contexto largo requiere medición empírica.
- Dependencia de plataforma: al estar en formato MLX, el modelo queda restringido a Apple Silicon. No es portable a infraestructura CUDA estándar sin un proceso de conversión no documentado.
- Metadatos incompletos: no hay pipeline declarado, ni información de dataset, ni detalles del proceso de cuantización por capa, lo que dificulta auditar el artefacto.
- Fechas de publicación atípicas: los campos de creación y actualización indican 2026-09-24, un registro que no encaja con el resto de metadatos habituales de la plataforma.
- Recomendación general: tratar el modelo como material experimental. Antes de cualquier uso en producción, cargarlo, medir perplejidad y calidad en tareas propias, verificar la licencia con el autor y aplicar moderación externa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ55e-mtp-vision
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Paper, blog o demo oficiales: no disponibles en la información proporcionada.
