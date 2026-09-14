# minjaechoi/qwen36-twla-asymmetric-dp-init3-target2-v15

## Resumen

qwen36-twla-asymmetric-dp-init3-target2-v15 es un checkpoint multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario minjaechoi. Los pesos en safetensors suman 35.107.181.936 parámetros (unos 35,1 mil millones) y el repositorio ocupa 70,2 GB, lo que corresponde a pesos en precision completa (bf16/fp16). La etiqueta de arquitectura declarada es `qwen3_5_moe`, lo que apunta a un transformer de mezcla de expertos (MoE) construido sobre el stack de Qwen, con soporte de entrada de imagen y salida de texto.

El problema que aborda no está documentado: la model card se limita a listar un dataset de entrenamiento (`minjaechoi/bipea-expert-nogpqa-v3`) y un manifiesto de evaluación (`minjaechoi/twla-gpqa30-eval-manifest`). No hay descripción de la metodología, ni número de tokens de entrenamiento, ni resultados de benchmarks, ni licencia, ni idiomas soportados. El nombre del repositorio (asymmetric-dp, init3, target2, v15) sugiere un experimento de ablación con múltiples iteraciones, más que un modelo listo para producción.

Su relevancia actual es, por tanto, acotada y de carácter investigador: sirve como artefacto para estudiar enrutado de expertos y ajuste multimodal en la escala de ~35 B, pero con 0 descargas y 0 likes no existe validación externa, y la ausencia de licencia impide asumir derechos de uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) según la etiqueta `qwen3_5_moe`; no detallada en la model card |
| Parámetros totales | 35.107.181.936 (≈35,1 B), según los pesos en safetensors |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en safetensors (sin GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos completos, repositorio de 70,2 GB) |
| Modalidad | image-text-to-text (entrada de imagen y texto, salida de texto) |
| Librería declarada | transformers |
| Tamaño del repositorio | 70,2 GB |
| Fecha de creación / actualización | 2026-09-13 / 2026-09-13 |

## Arquitectura y entrenamiento

La única información estructural disponible es la etiqueta `qwen3_5_moe`, que indica una implementación de mezcla de expertos integrada en la librería transformers, con pipeline image-text-to-text y finalidad conversacional. Esto implica, como mínimo, un codificador de visión, un proyector multimodal y una torre de lenguaje con capas MoE. No se especifican el número de expertos, el top-k de enrutado, la dimensión oculta, el número de capas ni la proporción de parámetros activos por token, que es el dato más determinante para estimar coste de inferencia.

Tampoco hay información sobre el entrenamiento: la model card solo enumera el dataset `minjaechoi/bipea-expert-nogpqa-v3` y el manifiesto de evaluación `minjaechoi/twla-gpqa30-eval-manifest`. Se desconoce el volumen de tokens, la composición del corpus, si hubo fases de SFT, RLHF o DPO, y si se aplicaron técnicas como decodificación especulativa o atención lineal. El sufijo del nombre del repositorio (asymmetric-dp, init3, target2, v15) es compatible con una campaña de ablaciones sobre inicialización y enrutado, pero es una inferencia no confirmada por el autor.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` y el pipeline declarado.
- Procesamiento conjunto de imagen y texto: el pipeline image-text-to-text permite tareas como descripción de imágenes, respuesta a preguntas visuales o extracción de información de documentos escaneados. No se documentan resolución de entrada, número máximo de imágenes por prompt ni soporte de vídeo.
- Razonamiento y conocimiento científico: el manifiesto de evaluación `twla-gpqa30-eval-manifest` sugiere que el autor mide razonamiento tipo GPQA, pero no se publican resultados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Modo thinking o razonamiento extendido: no disponible.
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

- Investigación sobre enrutado de expertos: el checkpoint permite analizar cómo se distribuye la carga entre expertos en un MoE de ~35 B con entrada multimodal, comparando configuraciones si se dispone de las versiones previas de la serie v1-v15.
- Ajuste fino supervisado sobre dominio propio: al publicarse en formato transformers con safetensors, es posible aplicar SFT con PEFT/LoRA para adaptar el modelo a un vertical concreto (por ejemplo, inspección visual de defectos en fabricación) partiendo de los 70,2 GB de pesos.
- Generación de descripciones automáticas para conjuntos de imágenes sin etiquetar: el pipeline image-text-to-text permite producir pies de foto o metadatos textuales para alimentar otros sistemas de búsqueda o indexación.
- Extracción de información de documentos con imagen: recibos, formularios o informes escaneados, generando salidas estructuradas en texto para su posterior validación humana.
- Replicación de evaluaciones de razonamiento científico: el manifiesto `twla-gpqa30-eval-manifest` permite reproducir la evaluación declarada por el autor y comprobar la estabilidad de los resultados frente a variaciones de prompt.
- Prototipado interno de asistentes visuales: en entornos sin requisitos de licencia comercial (laboratorio, docencia), sirve como banco de pruebas para asistentes que combinan capturas de pantalla o fotografías con diálogo.
- Estudio de coste de despliegue de MoE multimodales: dado su tamaño (70,2 GB en precisión completa), es útil para medir requisitos reales de VRAM, latencia y throughput antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente referencia un manifiesto de evaluación (`minjaechoi/twla-gpqa30-eval-manifest`), lo que indica que existe una evaluación tipo GPQA planificada o ejecutada por el autor, pero no se incluyen puntuaciones, ni tamaños de muestra, ni comparaciones con otros modelos. No se dispone tampoco de datos de latencia o throughput.

## Requisitos de hardware

Estimaciones calculadas a partir de los 35,1 B de parámetros totales; el número de parámetros activos es desconocido, por lo que los valores de velocidad son orientativos.

- Precisión completa (bf16/fp16): aproximadamente 70 GB solo para pesos, más caché KV. Requiere una GPU de 80 GB (H100, A100 80 GB) o reparto en 2x A6000 48 GB / 2x L40S 48 GB.
- Cuantización de 8 bits: aproximadamente 35 GB de pesos; encaja en A100 40 GB o en 2x RTX 4090, siempre que exista soporte de cuantización para esta arquitectura MoE multimodal (no publicado).
- Cuantización de 4 bits: aproximadamente 18-20 GB de pesos; cabe en RTX 4090, RTX 3090 o L40S de 24 GB, con contexto reducido por el consumo de caché KV.
- GPU de consumo: no cabe en GPUs de 16 GB o menos sin cuantizaciones muy agresivas; en 24 GB es viable solo con cuantización de 4 bits y ventana de contexto corta.
- Opciones de despliegue: transformers (librería declarada) de forma nativa; vLLM o TGI solo si soportan la arquitectura `qwen3_5_moe`; llama.cpp u Ollama requerirían una conversión a GGUF que no está publicada. La etiqueta `endpoints_compatible` indica compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos de referencia proceden de su documentación pública; no se dispone de comparación de rendimiento con el modelo analizado.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Modalidad | Licencia | Benchmarks comparados |
|---|---|---|---|---|---|---|
| qwen36-twla-asymmetric-dp-init3-target2-v15 | 35,1 B | no disponible | no disponible | Imagen y texto | no disponible | no disponible |
| Qwen3-32B | 32,8 B | Densa (todos activos) | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Texto | Apache 2.0 | no disponible |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32.768 tokens | Texto | Apache 2.0 | no disponible |
| Gemma 3 27B | 27 B | Densa | 128.000 tokens | Imagen y texto | Términos de uso de Gemma | no disponible |

La comparación relevante es de tipo estructural: frente a un denso de ~32 B, un MoE de ~35 B con pocos expertos activos podría ofrecer menor coste por token, pero sin conocer los parámetros activos ni el contexto soportado no es posible cuantificar la ventaja. Frente a Gemma 3 27B, el modelo analizado carece de licencia declarada, lo que en la práctica lo descarta para uso comercial.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse permiso de uso comercial ni de redistribución; es imprescindible contactar con el autor antes de cualquier uso productivo.
- Ausencia total de validación comunitaria: 0 descargas y 0 likes, sin issues ni discusiones públicas que permitan contrastar el comportamiento real del checkpoint.
- Riesgo de sobreajuste y contaminación: el entrenamiento se asocia a un dataset con "gpqa" en el nombre y la evaluación a un manifiesto GPQA, lo que abre la posibilidad de solapamiento entre datos de entrenamiento y de evaluación; los resultados que publique el autor deberían interpretarse con cautela.
- Idiomas no declarados: se desconoce el soporte real de castellano y de otras lenguas, así como el riesgo de degradación fuera del inglés.
- Longitud de contexto desconocida: no es posible planificar aplicaciones de contexto largo sin medirla empíricamente.
- Alucinación: no hay evaluación publicada de fidelidad ni de tasas de error, por lo que el riesgo es el habitual en modelos generativos sin datos que lo acoten.
- Coste de despliegue elevado: 70,2 GB en safetensors, sin cuantizaciones oficiales ni GGUF, lo que obliga a hardware de gama alta o a procesos de cuantización propios no verificados.
- Artefacto experimental: la nomenclatura del repositorio (asymmetric-dp, init3, target2, v15) sugiere versiones sucesivas con cambios no documentados; conviene fijar el commit exacto si se usa como referencia.
- Soporte incierto en herramientas de inferencia: al tratarse de una arquitectura `qwen3_5_moe` multimodal, vLLM, TGI, llama.cpp u Ollama pueden no reconocerla sin modificaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minjaechoi/qwen36-twla-asymmetric-dp-init3-target2-v15
- Dataset de entrenamiento citado: https://huggingface.co/datasets/minjaechoi/bipea-expert-nogpqa-v3
- Manifiesto de evaluación citado: https://huggingface.co/datasets/minjaechoi/twla-gpqa30-eval-manifest
- Paper, blog o repositorio del autor: no disponible
- Demo o espacio asociado: no disponible
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (los resultados obtenidos correspondían a páginas de ayuda de YouTube y no guardan relación con el checkpoint).
