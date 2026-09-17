# aquaduck/Llama-3.2-3B-Instruct-MLX

## Resumen

`aquaduck/Llama-3.2-3B-Instruct-MLX` es una redistribución del modelo Meta Llama-3.2-3B-Instruct cuantizado a 4 bits en formato MLX, publicada por Aquaduck (Aquaduck AI). No se trata de un ajuste fino ni de una cuantización nueva: los pesos proceden de `meta-llama/Llama-3.2-3B-Instruct` (etiqueta 4bit), que a su vez deriva de `meta-llama/llama-3.2-3b-instruct`. El repositorio contiene 3.212.749.824 parámetros en 4 bits y ocupa 3,9 GB en total.

La particularidad del repositorio no es el modelo en sí, sino el empaquetado. Junto al fichero completo `model.safetensors` (~1,81 GB, compatible con mlx-lm), el autor incluye dos shards de capas contiguas cortados por la mitad (`layers-0-14` y `layers-14-28`, ~1,01 GB cada uno) bajo el formato propietario `mlx-package-v1` de Aquaduck Arc. Estos shards están pensados para carga por etapas o en varios nodos desde la aplicación de escritorio de Aquaduck, y no son modelos completos utilizables con mlx-lm estándar.

Es relevante como caso práctico de distribución de pesos MLX optimizada para hardware Apple Silicon (memoria unificada), y como ejemplo de particionado de capas para despliegue por etapas. El repositorio no tiene descargas ni valoraciones registradas en el momento de la consulta, y no incluye evaluaciones propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Llama 3.2), GQA con 24 cabezas de consulta y 8 de clave/valor, 28 capas, dimensión oculta 3072 |
| Parámetros totales | 3.212.749.824 (3,2 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card del autor indica «unknown tokens») |
| Tipos de cuantización | 4 bits en MLX; el repositorio no ofrece otras precisiones |
| Idiomas soportados | Multilingüe (los mismos que el modelo base; no se detalla la lista) |
| Licencia | other (heredada de `meta-llama/llama-3.2-3b-instruct`) |
| Formato de pesos | safetensors en formato MLX; empaquetado `mlx-package-v1` (fichero completo y dos shards de capas) |
| Modelo base | meta-llama/llama-3.2-3b-instruct (vía meta-llama/Llama-3.2-3B-Instruct, 4bit) |
| Biblioteca | mlx |
| Pipeline | text-generation |
| Tamaño del repositorio | 3,9 GB (`model.safetensors` ~1,81 GB; cada shard ~1,01 GB) |
| Relación con el base | quantized (no es un fine-tune) |
| Fecha de publicación | 16 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado por Aquaduck: los pesos son los de Llama-3.2-3B-Instruct de Meta, convertidos a 4 bits en MLX. La arquitectura es la del transformer decoder-only de Llama 3.2 en su variante de 3B: 28 capas, dimensión oculta 3072 y atención con consultas agrupadas (GQA) de 24 cabezas de consulta por 8 de clave/valor, lo que reduce el tamaño de la caché KV durante la inferencia. El autor indica explícitamente que no hay entrenamiento ni re-cuantización en este repositorio.

La innovación relevante es el empaquetado. Los shards se cortan en la frontera de la capa 14 (28 capas divididas en dos mitades contiguas, `layers-0-14` y `layers-14-28`, con índices finales exclusivos) y se etiquetan como `layer-shards` dentro del formato `mlx-package-v1`. Esto permite descargar y mantener en memoria solo la mitad asignada en un esquema de carga escalonada o multi-nodo, con un máximo de 2 etapas. El particionado no altera los pesos más allá del propio empaquetado; el fichero completo y los shards contienen la misma información. No se documentan detalles sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF o DPO, porque corresponden íntegramente al modelo base de Meta.

## Capacidades

- Generación de texto conversacional: el repositorio se etiqueta como `conversational` y `text-generation`, y debe usarse con la plantilla de chat del modelo base (incluidos los modos thinking e instruct documentados por Meta); otras plantillas no funcionan correctamente.
- Razonamiento, código y matemáticas: la model card afirma que las capacidades son las mismas que las de `meta-llama/llama-3.2-3b-instruct`; no se aportan evaluaciones propias que las cuantifiquen.
- Soporte multilingüe: la model card indica que los idiomas son los mismos que los del modelo base, sin enumerarlos.
- Tool calling / function calling: no documentado en esta ficha; debe consultarse la model card del modelo base.
- Modo thinking y modo instruct: la model card menciona ambos modos como parte de la plantilla de chat heredada del base.
- Capacidades de visión: el modelo es de texto; las variantes multimodales de Llama 3.2 corresponden a otros tamaños, no a esta versión de 3B.
- Carga por etapas: el empaquetado permite servir únicamente la mitad de capas asignada, lo que reduce el espacio de descarga y la memoria ocupada por etapa.
- No incluye: decodificación especulativa, atención lineal ni mecanismos de contexto extendido propios; no se documenta ninguna innovación de inferencia más allá del empaquetado en shards.

## Casos de uso

- Asistente local en Mac: al ser un modelo de 4 bits en formato MLX, puede ejecutarse íntegramente en un Mac con Apple Silicon y unos 1,81 GB de pesos, sirviendo como asistente conversacional sin conexión y sin enviar datos a terceros.
- Generación de código en el portátil: integrado con mlx-lm como servidor local compatible con la API de OpenAI, permite autocompletado y generación de funciones en un editor sin depender de servicios en la nube.
- RAG sobre documentación interna: combinado con una base vectorial local, el modelo puede responder preguntas sobre manuales o código propio, manteniendo los documentos dentro del equipo. Requiere validar el comportamiento con la ventana de contexto real del base, no especificada en este repositorio.
- Prototipado de aplicaciones conversacionales: su tamaño reducido y su licencia heredada permiten montar demos de chat con plantilla instruct en pocos minutos, con coste de inferencia nulo en hardware de consumo.
- Despliegue escalonado en varios nodos: los shards `layers-0-14` y `layers-14-28` están diseñados para que dos dispositivos conectados mantengan solo su mitad de capas, lo que resulta útil en escenarios de borde o de dispositivos con memoria muy limitada gestionados por la aplicación de Aquaduck.
- Investigación sobre cuantización: sirve como referencia para medir la degradación de calidad de una cuantización de 4 bits en MLX frente al modelo original en mayor precisión, siempre que se fije una batería de evaluación propia.
- Traducción y atención al cliente multilingüe: la model card declara capacidades multilingües heredadas, adecuadas para conversaciones multi-turno sencillas en mercados con varios idiomas, con la advertencia de que no se enumeran los idiomas soportados.
- Clasificación y extracción de información: tareas de etiquetado, resumen o extracción de entidades en pipelines locales donde no se requiere un modelo de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay evaluaciones separadas para el MLX alojado ni para los shards, y remite a la model card de `meta-llama/llama-3.2-3b-instruct`. Tampoco se documentan métricas de latencia o throughput para este repositorio.

| Benchmark | Este repositorio | Modelo base (referencia) |
|---|---|---|
| MMLU | No disponible | No disponible en esta ficha |
| HumanEval | No disponible | No disponible en esta ficha |
| GSM8K | No disponible | No disponible en esta ficha |
| Otras evaluaciones | No disponible | Consultar la model card del base |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en 4 bits ocupan aproximadamente 1,81 GB; hay que sumar la caché KV, que crece con la longitud de contexto. Con un contexto moderado, un presupuesto de 3-4 GB de memoria es razonable.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon (serie M1 o posterior) con 8 GB de memoria unificada o más; se recomienda 16 GB para contextos largos o para convivir con otras aplicaciones.
- GPUs de datacenter: no aplica de forma nativa, ya que el formato MLX está orientado a Apple Silicon y Metal. Para usar A100, H100 o RTX 4090 habría que convertir los pesos a otro formato (por ejemplo GGUF o safetensors estándar), algo que este repositorio no incluye.
- Almacenamiento: el fichero completo ocupa ~1,81 GB; los shards, ~1,01 GB cada uno. El repositorio completo son 3,9 GB.
- Opciones de despliegue: mlx-lm (carga directa de `model.safetensors`), servidor de mlx-lm para exponer una API local, y la aplicación de escritorio de Aquaduck para la carga por etapas. Los shards no funcionan con mlx-lm estándar.
- Compatibilidad con otros motores: vLLM, TGI, llama.cpp u Ollama no cargan MLX de forma nativa; requerirían conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| aquaduck/Llama-3.2-3B-Instruct-MLX (este repositorio) | 3,21 mil millones | No disponible | other (heredada de Meta) | MLX 4 bits + shards | Redistribución cuantizada, sin evaluaciones propias |
| meta-llama/llama-3.2-3b-instruct | 3,21 mil millones | No disponible en esta ficha | other (Llama 3.2) | safetensors | Modelo original de Meta del que deriva este repositorio |
| meta-llama/Llama-3.2-3B-Instruct (etiqueta 4bit) | 3,21 mil millones | No disponible en esta ficha | other (Llama 3.2) | safetensors (MLX) | Fuente directa de la cuantización ingerida |
| Alternativas de tamaño similar (Qwen, Phi, Gemma) | No disponible | No disponible | No disponible | No disponible | Los resultados de búsqueda no aportaron información verificable sobre alternativas |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos y riesgos: la model card remite literalmente a los sesgos, capacidades y riesgos de `meta-llama/llama-3.2-3b-instruct`; no se añade ningún análisis propio.
- Degradación por cuantización: la propia model card advierte de que la cuantización a 4 bits puede degradar la calidad respecto a las versiones de mayor precisión del modelo original.
- Alucinación: es un riesgo inherente a un modelo causal de 3,2 mil millones de parámetros; no se documentan mitigaciones específicas en este repositorio.
- Ventana de contexto: no está especificada en la model card («unknown tokens»), por lo que no debe asumirse ninguna cifra sin verificarla contra el modelo base antes de usarlo en producción.
- Idiomas: se declara multilingüe, pero no se enumera la lista de idiomas soportados ni su calidad por idioma.
- Licencia: la licencia es «other» y hereda los términos de Meta para Llama 3.2, que incluyen política de uso aceptable, requisitos de atribución y una cláusula de uso comercial condicionada al número de usuarios mensuales. Es imprescindible revisar el texto completo antes de un uso comercial.
- Shards no autónomos: los ficheros `layers-0-14` y `layers-14-28` no son modelos completos y no funcionan con mlx-lm estándar; solo tienen sentido dentro del sistema de carga escalonada de Aquaduck Arc. Usar un shard suelto como modelo completo está explícitamente fuera de alcance.
- Plantilla de chat obligatoria: usar una plantilla distinta a la del modelo base produce resultados incorrectos, incluidos los modos thinking e instruct.
- Ausencia de evaluaciones: no hay benchmarks, pruebas de regresión ni métricas de latencia publicadas para este empaquetado concreto.
- Madurez del repositorio: sin descargas ni valoraciones registradas, y con metadatos fechados en septiembre de 2026; conviene tratarlo como un artefacto de distribución más que como un modelo validado.
- Procedencia de los resultados de búsqueda: las consultas web asociadas a este identificador devolvieron exclusivamente sitios de contenido no relacionado; no se ha podido contrastar información independiente sobre el repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aquaduck/Llama-3.2-3B-Instruct-MLX
- Modelo base (Meta): https://huggingface.co/meta-llama/llama-3.2-3b-instruct
- Fuente de la cuantización MLX: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- mlx-lm (soporte MLX): https://github.com/ml-explore/mlx-lm
- Perfil del autor: https://huggingface.co/aquaduck
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos correspondían a contenido no relacionado.
