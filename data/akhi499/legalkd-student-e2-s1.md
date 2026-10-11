# akhi499/legalkd-student-e2-s1

## Resumen

legalkd-student-e2-s1 es un adaptador LoRA publicado por el usuario akhi499 sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Se distribuye a través de HuggingFace con la librería PEFT y la etiqueta `text-generation`, y su repositorio ocupa 1,6 GB. El nombre del repositorio sugiere un experimento de destilación de conocimiento en el ámbito legal ("legalkd-student"), aunque la model card no documenta ni el conjunto de datos ni el objetivo declarado del entrenamiento.

El modelo base es un transformer decoder-only de aproximadamente 1,54 mil millones de parámetros con una ventana de contexto nativa de 32.768 tokens, lo que sitúa a este adaptador en la categoría de modelos pequeños orientados a despliegue en hardware modesto. Al ser un adaptador PEFT, no es un modelo autónomo: requiere cargar los pesos de Qwen2.5-1.5B-Instruct y aplicar encima las matrices LoRA entrenadas.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un artefacto de investigación sin métricas publicadas, sin conjunto de datos documentado y con cero descargas en el momento de la consulta. Resulta útil como ejemplo de flujo de trabajo de ajuste fino con PEFT sobre modelos de menos de 2B parámetros, pero no debería considerarse un modelo listo para producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM) con adaptador LoRA sobre Qwen2.5-1.5B-Instruct |
| Parametros totales | No disponible para el adaptador. El modelo base tiene aproximadamente 1,54 mil millones de parámetros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base según la documentación de Qwen2.5; no confirmado explícitamente para el adaptador |
| Tipos de cuantizacion | No especificados por el autor. El modelo base admite fp16, bf16, int8, int4 (GPTQ, AWQ) y GGUF en la comunidad |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Otros datos del repositorio: tamaño del repositorio 1,6 GB, pipeline `text-generation`, etiquetas `peft`, `lora`, `transformers`, región `us`. Fecha de creación 2026-10-11, última actualización 2026-10-11.

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura del modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only con normalización RMSNorm, activación SwiGLU, codificación posicional rotatoria (RoPE) y atención con consultas agrupadas (GQA). El ajuste se realizó con LoRA mediante la librería PEFT 0.21.2, de modo que el repositorio contiene únicamente las matrices de bajo rango y no una copia completa de los pesos del modelo base.

Los hiperparámetros declarados en la model card son los siguientes: tasa de aprendizaje 2e-4, tamaño de lote de entrenamiento 1 con 16 pasos de acumulación de gradiente (lote efectivo de 16), tamaño de lote de evaluación 8, optimizador AdamW con `fused` y betas (0,9; 0,999), epsilon 1e-8, planificador de tasa de aprendizaje coseno con 6 pasos de calentamiento, 2 épocas y precisión mixta nativa (AMP). La semilla empleada fue 1. No se especifica el rango de LoRA, el valor de alpha, los módulos objetivo ni la composición del conjunto de datos, que la propia model card describe como "unknown dataset". Tampoco se documenta ningún proceso de RLHF, DPO u optimización posterior al ajuste supervisado, ni innovaciones técnicas adicionales más allá del propio ajuste LoRA. Las versiones de framework declaradas son PEFT 0.21.2, Transformers 5.19.0, PyTorch 2.11.0+cu128, Datasets 5.1.0 y Tokenizers 0.23.1.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct, que está ajustado para seguir instrucciones y mantener diálogos multiturno.
- Razonamiento básico y resolución de problemas sencillos de matemáticas y lógica propios de un modelo de 1,5B parámetros.
- Generación y explicación de código en lenguajes habituales, con limitaciones claras frente a modelos de mayor tamaño.
- Soporte de tool calling y function calling en el modelo base, sujeto a que el adaptador no haya degradado esta capacidad (no verificado).
- Capacidades multilingües del modelo base (aproximadamente 29 idiomas según su documentación), si bien el ajuste fino puede haber sesgado el comportamiento hacia el idioma de los datos de entrenamiento, que se desconocen.
- Cualquier capacidad específica del dominio legal que el nombre del repositorio pudiera sugerir no está documentada ni verificada en la model card.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido ("thinking").

## Casos de uso

- Experimentación académica con PEFT: el adaptador sirve como ejemplo reproducible de ajuste fino de bajo rango sobre un modelo de 1,5B, útil para comparar configuraciones de hiperparámetros en entornos con recursos limitados.
- Clasificación y etiquetado de documentos: con un prompt adecuado, el modelo puede asignar categorías a textos cortos, una tarea que un modelo de 1,5B ejecuta con latencia baja y coste reducido.
- Resumen extractivo de textos: la ventana de 32.768 tokens del modelo base permite procesar documentos de extensión media sin fragmentación, aunque la calidad del resumen del adaptador no está medida.
- Asistente conversacional en el borde: al caber en GPU de consumo e incluso en CPU con cuantización, puede desplegarse como chatbot local sin conexión a servicios externos.
- Generación asistida dentro de un pipeline RAG: el modelo puede redactar respuestas a partir de fragmentos recuperados, siempre que se añada una capa de verificación, dado el riesgo de alucinación de un modelo de este tamaño.
- Aprendizaje y docencia: sirve para ilustrar en clase el ciclo completo de ajuste fino, desde la preparación del dataset hasta la carga del adaptador con `PeftModel`.
- Prototipado rápido de producto: permite validar una hipótesis de producto conversacional antes de invertir en un modelo mayor o en un dataset etiquetado propio.
- Filtrado y preprocesado de datos: puede usarse para normalizar, reformatear o detectar campos en textos no estructurados antes de pasarlos a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card contiene una entrada con la lista de resultados vacía, y la sección "Training results" del README está en blanco. No existen por tanto métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación para este adaptador.

## Requisitos de hardware

- VRAM estimada para el adaptador: los 1,6 GB del repositorio corresponden a los pesos LoRA; el consumo real depende del modelo base que se cargue por debajo.
- Modelo base en fp16/bf16: aproximadamente 3-4 GB de VRAM, más el coste de la caché KV, que crece con la longitud de contexto.
- Modelo base cuantizado a 4 bits: aproximadamente 1-1,5 GB de VRAM, lo que lo hace viable en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 2070 o superiores). En A100, H100 o L40S sobra capacidad y el cuello de botella pasa a ser el throughput, no la memoria.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs dedicadas modernas, y también en CPU con cuantización GGUF.
- Opciones de despliegue: `transformers` con `peft` para cargar el adaptador directamente; vLLM y TGI admiten adaptadores LoRA en caliente; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir el resultado a GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones por parte del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| legalkd-student-e2-s1 | Adaptador LoRA sobre 1,5B | 32.768 (heredado del base) | Apache 2.0 | HuggingFace, 0 descargas | Sin benchmarks ni dataset documentado |
| Qwen2.5-1.5B-Instruct | ~1,54B | 32.768 | Apache 2.0 | HuggingFace, ampliamente descargado | Modelo base; benchmarks publicados por el autor original |
| Llama-3.2-1B-Instruct | ~1,24B | 128.000 | Llama 3.2 Community License | HuggingFace | Contexto mayor; licencia con restricciones para algunos usos |
| SmolLM2-1.7B-Instruct | ~1,7B | 8.192 | Apache 2.0 | HuggingFace | Alternativa entrenada explícitamente con datos abiertos |
| Gemma-2-2B-it | ~2,6B | 8.192 | Gemma Terms of Use | HuggingFace | Mayor tamaño, licencia con condiciones de uso |

La comparación directa de rendimiento no es posible porque el adaptador no publica métricas. Los datos de la columna de parámetros y contexto corresponden a la documentación pública de cada modelo base o alternativo, no a este repositorio.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el conjunto de datos de entrenamiento: la model card indica explícitamente "unknown dataset" y deja las secciones de descripción, usos previstos y datos de evaluación como "More information needed".
- Sin resultados de evaluación: no hay ninguna métrica que permita estimar la calidad del ajuste ni compararlo con el modelo base sin ajustar.
- Riesgo de sobreajuste: con 2 épocas y un lote efectivo de 16 sobre un dataset de tamaño desconocido, es plausible un sobreajuste al dominio o al estilo de los datos, con degradación de las capacidades generales del modelo base.
- Riesgo de alucinación: los modelos de 1,5B parámetros generan con frecuencia información incorrecta con apariencia plausible, especialmente en dominios especializados como el legal. Cualquier uso en ese ámbito exige verificación humana.
- Riesgo reputacional y legal si se usa en asesoramiento jurídico: el nombre del repositorio apunta a un dominio regulado, pero no existe ninguna validación que respalde ese uso.
- Idiomas soportados no declarados: se desconoce si el ajuste conserva el multilingüismo del modelo base o lo ha reducido a un único idioma.
- Trazabilidad insuficiente: repositorio con cero descargas y cero "likes", sin paper asociado, sin repositorio de código y sin autor identificable más allá del nombre de usuario. No hay garantía de mantenimiento.
- Licencia Apache 2.0: permite uso comercial, pero el adaptador hereda las obligaciones de atribución del modelo base, que también es Apache 2.0. Aun así, la licencia permisiva no implica idoneidad técnica para producción.
- Incompatibilidad potencial entre versiones: el repositorio declara Transformers 5.19.0 y PyTorch 2.11.0, versiones muy recientes; entornos con versiones anteriores de la librería PEFT o Transformers podrían no cargar el adaptador correctamente.
- La búsqueda web realizada no ha devuelto ningún resultado relevante sobre el modelo: los enlaces obtenidos no guardan relación con él y no se han incluido en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akhi499/legalkd-student-e2-s1
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Blog técnico de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Librería PEFT: https://github.com/huggingface/peft
- Documentación de Transformers sobre PEFT: https://huggingface.co/docs/transformers/main/peft

No se han encontrado papers, demos ni repositorios de código asociados específicamente a este adaptador en la información disponible.
