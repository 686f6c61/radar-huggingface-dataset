# BAJUKA/LLaVA-qwen25-3b-VLfull-r2-s42-s2a

## Resumen

LLaVA-qwen25-3b-VLfull-r2-s42-s2a es un modelo de visión y lenguaje (image-text-to-text) desarrollado por el usuario BAJUKA y construido sobre el código de LLaVA-NeXT. Se trata de un artefacto de investigación: una de las ramas de una cuadrícula de entrenamiento controlada que compara entrenamiento multimodal frente a entrenamiento solo de texto. El backbone es Qwen2.5-3B-Instruct, sobre el que se acopla un codificador visual SigLIP SO400M patch14-384 mediante un proyector entrenable. La rama publicada corresponde a la etapa S2a (caption stage) de la variante "VL-cap".

El modelo tiene 3.490.246.176 parámetros según los pesos en safetensors y se distribuye en un repositorio de 7,0 GB en bfloat16. La ventana de contexto utilizada durante el entrenamiento es de 8192 tokens y el entrenamiento procesó un epoch completo (5859 pasos) sobre una mezcla de 750 000 ejemplos de captioning (CAP-750K, sorteo r2), con pérdida final de 1,204. El propósito del proyecto no es ofrecer un modelo listo para producción, sino permitir comparaciones atribuibles: todas las ramas de la cuadrícula ven las mismas mezclas, el mismo orden de ejemplos para una semilla dada y la misma configuración de optimizador, y solo difieren en datos, orden y módulos entrenables.

Su relevancia es, por tanto, metodológica. Sirve para estudiar qué módulos conviene entrenar en un pipeline LLaVA-NeXT con un LLM pequeño, y para analizar la diferencia entre una etapa de captioning y etapas posteriores. Como contrapartida, no ha pasado por alineamiento de seguridad ni por ajuste fino de instrucciones específico para visión, no se han publicado benchmarks y no existe ninguna validación por parte de la comunidad (0 descargas, 0 likes), por lo que debe tratarse como un checkpoint de laboratorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaVA-NeXT: codificador visual SigLIP SO400M patch14-384 + proyector MLP + LLM Qwen2.5-3B-Instruct; clase `LlavaQwenForCausalLM` |
| Parámetros totales | 3.490.246.176 (dato real de los safetensors) |
| Parámetros activos | No aplica: arquitectura densa, no MoE |
| Longitud de contexto | 8192 tokens (longitud máxima de secuencia usada en el entrenamiento). El backbone Qwen2.5 admite ventanas mayores, pero esta adaptación no se ha validado por encima de 8192 |
| Tipos de cuantización | No disponible. Solo se publican pesos en bfloat16; no hay GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible. La model card no especifica idiomas ni la composición lingüística de CAP-750K; el backbone Qwen2.5-3B-Instruct declara soporte multilingüe, pero no se ha verificado en esta adaptación |
| Licencia | `other` / `qwen-research` (la model card enlaza al fichero LICENSE de Qwen2.5-3B-Instruct) |
| Formato de pesos | safetensors en bfloat16 (repositorio de 7,0 GB) |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Pipeline | image-text-to-text |
| Resolución de imagen | Estrategia `anyres_max_9` (hasta 9 recortes por imagen) |
| Plantilla de prompt | `qwen_2_5` |
| Semilla / sorteo | Semilla 42, sorteo de mezcla r2 |
| Etapa publicada | S2a (caption stage), epoch 1 completo (5859 pasos) |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón LLaVA-NeXT: un codificador visual SigLIP (`google/siglip-so400m-patch14-384`) procesa la imagen con una estrategia de resolución dinámica limitada a 9 recortes (`anyres_max_9`), un proyector MLP traduce las representaciones visuales al espacio del LLM y el modelo de lenguaje Qwen2.5-3B-Instruct genera la respuesta. A diferencia de un ajuste congelado del backbone visual, esta rama entrena el stack completo: `mm_vision_tower`, `mm_mlp_adapter` y `mm_language_model` son entrenables, de ahí la etiqueta `VLfull` en el nombre. Requiere código externo a `transformers`: la carga se hace con `llava.model.builder.load_pretrained_model` del repositorio LLaVA-NeXT.

El entrenamiento se realizó sobre la mezcla CAP-750K en su sorteo r2, compuesta por 700 000 ejemplos de `captions_700k_r2` y 49 956 de `language_50k_v2` (en total, aproximadamente 750 000 ejemplos). Se ejecutó un epoch completo con batch global 128, precisión bfloat16, longitud máxima de secuencia 8192 y un scheduler coseno con warmup del 3 %. El learning rate fue de 1e-5 para el LLM y el proyector, y de 2e-6 para el torreón visual. El entrenamiento se llevó a cabo en 4 GPU H100 de 80 GB con DeepSpeed ZeRO-3. La pérdida pasó de 1,312 a 1,204 (media de los últimos 50 pasos registrados: 1,176), lo que equivale a una perplejidad aproximada de 3,3, y no se registró ninguna pérdida no finita en los 5859 pasos. Se incluye `trainer_state.json` con el historial completo de pérdida, norma del gradiente y learning rate.

No hay evidencia en la información disponible de que se aplicara RLHF, DPO u otra fase de alineamiento sobre este checkpoint, y tampoco se realizó early stopping ni selección de checkpoint: cada etapa de la cuadrícula ejecuta simplemente un epoch completo.

## Capacidades

- Descripción de imágenes y generación de pies de foto: es la capacidad objetivo de la etapa S2a, entrenada explícitamente sobre 700 000 ejemplos de captioning.
- Conversación multimodal de imagen y texto (`image-text-to-text`) usando la plantilla de prompt `qwen_2_5`.
- Procesamiento de imágenes en resolución relativamente alta mediante troceado `anyres_max_9`, con hasta 9 recortes más la vista global.
- Generación de texto en lenguaje natural heredada del backbone Qwen2.5-3B-Instruct, incluyendo instrucciones simples.
- Razonamiento básico y generación de código: no documentado específicamente en esta rama; solo cabe esperar la capacidad residual del backbone, sin ajuste de instrucciones multimodal.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas; la composición idiomática del dataset de entrenamiento no se especifica.
- Modo "thinking", visión de vídeo, audio u otras modalidades: no disponibles. El pipeline declarado es únicamente imagen-texto.
- Entrenamiento del stack visual completo: la torre de visión está ajustada, no congelada, junto con proyector y LLM.

## Casos de uso

- Anotación masiva de datasets de imagen: el modelo puede generar pies de foto para grandes volúmenes de imágenes y servir como pre-etiquetador en la construcción de corpus de entrenamiento, con revisión humana posterior. Es exactamente la tarea sobre la que fue entrenado (700 000 ejemplos de captioning en CAP-750K).
- Investigación en ablaciones controladas de VLM: permite reproducir y comparar ramas de la cuadrícula VL-vs-texto, aislando el efecto de los datos, el orden de ejemplos y los módulos entrenables, ya que todas las ramas comparten mezcla, optimizador y scheduler.
- Estudio del impacto del entrenamiento completo frente al congelado de la torre visual: al estar publicados los pesos entrenables de la torre SigLIP, sirve para medir cuánto aporta el ajuste visual frente a un proyector con backbone congelado.
- Prototipado de asistentes conversacionales de imagen en laboratorio: con 8192 tokens de contexto puede mantener diálogos de varios turnos sobre una o varias imágenes, siempre que el despliegue se haga con el repositorio LLaVA-NeXT.
- Descripción de imágenes para accesibilidad: generación de texto alternativo en catálogos, paneles o documentos, como primer paso de un flujo que requiera validación humana (el modelo no está alineado en seguridad y puede producir descripciones erróneas).
- Etiquetado de producto en comercio electrónico: descripción de imágenes de catálogo para enriquecer fichas de producto o mejorar la búsqueda visual, con control de calidad por muestreo dado el riesgo de alucinación.
- Investigación sobre resolución de entrada: el uso de `anyres_max_9` lo hace útil para estudiar el equilibrio entre número de recortes, coste de cómputo y calidad de descripción en tareas con texto pequeño o detalles finos.
- Punto de partida para ajuste posterior (SFT/DPO específico de visión): al ser un checkpoint base de etapa de captioning, puede servir como inicialización de experimentos propios, aceptando que no ha pasado por alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento: pérdida de 1,312 a 1,204 (media de los últimos 50 pasos: 1,176), 0 pérdidas no finitas en 5859 pasos y un epoch completo. No hay datos de MMLU, HumanEval, GSM8K, VQAv2, TextVQA, POPE ni de ninguna otra evaluación multimodal o de texto, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM para los pesos en bfloat16: aproximadamente 7,0 GB para el LLM y el proyector, más el codificador SigLIP (del orden de 0,8-1 GB), es decir, en torno a 8 GB solo en pesos. Son estimaciones derivadas del recuento de parámetros y del tamaño del repositorio, no medidas publicadas por el autor.
- VRAM total en inferencia: con `anyres_max_9` la secuencia visual puede crecer mucho (hasta 9 recortes por imagen), por lo que conviene reservar entre 12 y 16 GB en bfloat16 para una imagen con contexto moderado, y más si se procesan varias imágenes o diálogos largos. Estimación orientativa, no verificada.
- GPU recomendadas: H100 80 GB o A100 80/40 GB para entrenamiento o evaluación por lotes. Para inferencia, A100 40 GB, L40S, RTX 4090 (24 GB) o RTX 6000 Ada son opciones razonables.
- GPU de consumo: cabe en RTX 4090 / 3090 (24 GB) y previsiblemente en tarjetas de 16 GB con secuencias cortas y una sola imagen; en 12 GB o menos no hay margen garantizado con `anyres_max_9`. No existe versión cuantizada que reduzca este requisito.
- Opciones de despliegue: el camino documentado es el repositorio LLaVA-NeXT con `load_pretrained_model(..., "llava_qwen")` y la clase `LlavaQwenForCausalLM`, que no forma parte de `transformers`. No se publican ficheros GGUF, por lo que llama.cpp u Ollama no son utilizables sin una conversión propia. La compatibilidad con vLLM, TGI o SGLang no está documentada para esta combinación concreta y debería verificarse.
- Latencia y throughput: no disponibles. No hay ninguna medición publicada de tokens por segundo ni de latencia por imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LLaVA-qwen25-3b-VLfull-r2-s42-s2a | 3.490.246.176 | 8192 (entrenamiento) | qwen-research | Pesos safetensors en HuggingFace, requiere LLaVA-NeXT | Artefacto de investigación, sin benchmarks ni alineamiento |
| Qwen2.5-3B-Instruct (base, solo texto) | ≈3,1 B | ≈32.768 tokens (según el repositorio de Qwen) | La model card de esta rama enlaza a su LICENSE | HuggingFace | Solo texto; es el punto de partida del modelo analizado |
| Qwen2.5-VL-3B-Instruct | Familia de 3 B; recuento exacto no disponible en esta ficha | No disponible | No disponible en la información proporcionada | HuggingFace | Alternativa multimodal nativa de la misma escala; requiere verificar datos en su repositorio |
| LLaVA-OneVision (variante Qwen2) | 7 B en el LLM, más torre visual; recuento exacto no disponible | No disponible | No disponible en la información proporcionada | HuggingFace | Referencia de la misma familia arquitectónica LLaVA-NeXT a mayor escala |

La comparación cuantitativa no es posible con la información disponible: no hay benchmarks publicados para este checkpoint y los datos de contexto y licencia de las alternativas deberían confirmarse en sus repositorios oficiales antes de usarse en una decisión técnica.

## Limitaciones y advertencias

- Artefacto de investigación, no un modelo ajustado ni alineado en seguridad. La propia model card lo declara explícitamente.
- No es un "mejor" checkpoint: se publica como una rama legítima de una cuadrícula. No hubo early stopping ni selección de checkpoint; cada etapa ejecuta un epoch completo.
- Riesgo elevado de alucinación en descripciones: al estar entrenado en una etapa de captioning sin fases posteriores de alineamiento, puede inventar objetos, texto o relaciones que no aparecen en la imagen.
- No se han publicado evaluaciones de sesgo ni de sesgo de género, raza o cultura en las descripciones generadas.
- Cobertura idiomática desconocida: la model card no indica idiomas ni la composición lingüística de CAP-750K (700 000 ejemplos de captions y 49 956 de lenguaje). El comportamiento fuera del inglés o del chino no está garantizado.
- Límite de contexto de 8192 tokens durante el entrenamiento; no hay validación por encima de esa longitud ni con muchas imágenes simultáneas.
- Licencia ambigua: la model card declara `other` / `qwen-research` y enlaza al LICENSE de Qwen2.5-3B-Instruct. Si el uso previsto es comercial, hay que aclarar qué licencia se aplica realmente, ya que una licencia de tipo research puede restringir la explotación comercial.
- Dependencia de código externo: los pesos usan `LlavaQwenForCausalLM` del repositorio LLaVA-NeXT, que no está en `transformers`. Esto complica el despliegue, la integración con servidores de inferencia y el mantenimiento a largo plazo.
- Sin cuantizaciones publicadas (no hay GGUF, AWQ ni GPTQ), lo que limita el despliegue en hardware de gama baja o en CPU.
- No se publican estados de optimizador, DeepSpeed ni RNG; los ficheros son pesos de inferencia, por lo que reanudar el entrenamiento exactamente desde este punto no es posible.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha, sin informes independientes de calidad ni de estabilidad.
- No hay soporte documentado de tool calling, agentes ni razonamiento multi-paso, por lo que no debería asumirse en un pipeline de producción.
- El repositorio ocupa 7,0 GB, lo que debe tenerse en cuenta en entornos con almacenamiento limitado o en despliegues multirréplica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BAJUKA/LLaVA-qwen25-3b-VLfull-r2-s42-s2a
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia enlazada por la model card: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Repositorio LLaVA-NeXT (código necesario para cargar los pesos): https://github.com/LLaVA-VL/LLaVA-NeXT
- Codificador visual SigLIP SO400M patch14-384: https://huggingface.co/google/siglip-so400m-patch14-384
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo páginas genéricas de Google); no se han encontrado papers, blogs ni demos adicionales.
