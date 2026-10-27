# luisastellet/qwen-metaphor-unke-camada-22-prompt-textual

## Resumen

`luisastellet/qwen-metaphor-unke-camada-22-prompt-textual` es un checkpoint de 596.049.920 parámetros publicado en HuggingFace por el usuario `luisastellet`, con pipeline de `text-generation` y pesos en formato `safetensors`. La model card es la plantilla automática de HuggingFace y no ha sido completada por el autor: no declara modelo base, datos de entrenamiento, licencia ni idiomas. Por tanto, toda la información técnica disponible procede de los metadatos del repositorio (tags, tamaño de parámetros, tamaño del repo, fechas) y no de documentación del autor.

El identificador del repositorio es altamente descriptivo y sugiere un artefacto de investigación más que un modelo de propósito general: el tag `qwen3` apunta a la familia Qwen3, el segmento `camada-22` (capa 22) sugiere una extracción o intervención sobre una capa intermedia concreta, y los términos `metaphor`, `unke` y `prompt-textual` apuntan a un experimento de edición de conocimiento o de interpretabilidad mecanicista con instrucción textual. Esta lectura es una hipótesis basada en el nombre y no está confirmada por el autor.

Su relevancia actual es limitada pero concreta: sirve como ejemplo de checkpoint derivado de un modelo pequeño (la cifra de parámetros coincide exactamente con la variante de 0,6 B de Qwen3), útil para quien investigue edición de conocimiento, ablación de capas o evaluación de instrucciones en modelos compactos. No debe tratarse como un modelo listo para producción sin una evaluación propia y sin aclaración de licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3` sugiere transformer decoder-only de la familia Qwen3; sin confirmar por el autor) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en los metadatos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos `safetensors`; no hay GGUF, AWQ ni GPTQ en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 7,2 GB |
| Descargas / likes | 139 / 0 |
| Fecha de creacion | 2026-10-24 |
| Ultima actualizacion | 2026-10-26 |

Nota técnica: 596 M de parámetros en `safetensors` deberían ocupar aproximadamente 1,2 GB en bf16 o 2,4 GB en fp32. El repositorio declara 7,2 GB, un factor de entre 3 y 6 veces superior, lo que sugiere la presencia de múltiples ficheros de checkpoint, estados de optimizador, revisiones acumuladas o pesos en precisión completa junto a copias adicionales. Conviene inspeccionar el árbol de ficheros antes de descargar.

## Arquitectura y entrenamiento

No hay información publicada sobre arquitectura, datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO. La model card únicamente contiene los campos `[More Information Needed]` de la plantilla estándar de HuggingFace. El tag `qwen3` es el único indicio de familia arquitectónica y no constituye confirmación formal del modelo base.

Por el nombre del repositorio (`camada-22`, término portugués para "capa 22") y por el sufijo `prompt-textual`, es plausible que se trate de un checkpoint intermedio o intervenido de un experimento de edición de conocimiento (el acrónimo `unke` podría remitir a un benchmark de edición de conocimiento unificado) o de interpretabilidad sobre una capa concreta. Igualmente plausible es que `metaphor` denote la tarea o el conjunto de evaluación empleado. Ninguna de estas hipótesis está documentada y no deben citarse como hechos.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` figura entre los tags, lo que indica formato de chat, sin que se especifique la plantilla exacta.
- Razonamiento y código: no verificadas para este checkpoint. Si se confirma la base Qwen3-0.6B, heredaría capacidades básicas de razonamiento, matemáticas elementales y generación de código, pero no hay evaluación publicada que lo respalde.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el nombre del repo mezcla inglés y portugués, pero no se declara cobertura idiomática).
- Capacidades especiales (modo thinking, visión, audio): no disponible. No hay evidencia de modalidad distinta de texto.
- Compatibilidad declarada: `text-generation-inference` y `endpoints_compatible`, es decir, el repo incluye los metadatos que permiten desplegarlo con TGI o en Inference Endpoints de HuggingFace.

## Casos de uso

Los siguientes escenarios son aplicables a un modelo de 596 M de parámetros con salida de texto y deben validarse empíricamente contra este checkpoint concreto antes de cualquier uso real:

- Investigación en interpretabilidad y edición de conocimiento: el modelo sirve como artefacto reproducible para analizar el efecto de intervenir una capa concreta (la 22 según el nombre) sobre la recuperación de hechos; su tamaño permite ejecutar experimentos completos en una sola GPU de consumo.
- Evaluación de instrucciones textuales en modelos pequeños: útil para comparar cómo responde un modelo compacto a prompts de sistema y reformulaciones de la misma pregunta, midiendo estabilidad de la respuesta.
- Clasificación y etiquetado de texto por lotes: con 596 M de parámetros, el coste por token es bajo y permite procesar volúmenes altos de documentos en tareas de extracción o categorización, siempre que se valide la calidad en el dominio objetivo.
- Prototipado rápido de asistentes conversacionales: al ser compatible con `transformers` y TGI, permite montar un endpoint de prueba en minutos para validar un flujo de diálogo antes de invertir en un modelo mayor.
- Generación de datos sintéticos para ajuste fino: un modelo pequeño puede producir borradores o paráfrasis a gran escala con coste reducido, que después se filtran con un modelo mayor.
- Docencia y demostraciones de mecánica de transformers: su tamaño permite mostrar carga de pesos, tokenización, generación con temperatura y decodificación en un portátil con GPU modesta.
- Pruebas de regresión en pipelines de inferencia: sirve como modelo "canario" para validar despliegues con vLLM o TGI antes de mover el mismo pipeline a modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el autor no aporta comparaciones con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia (derivada del recuento de parámetros, no medida sobre este checkpoint): aproximadamente 1,2 GB de pesos en bf16/fp16 y 2,4 GB en fp32, a los que hay que sumar la caché KV y el overhead del runtime.
- Consumo realista: entre 2 y 4 GB de VRAM con contextos cortos en bf16; por encima de 6 GB si se trabaja con contextos largos o lotes mayores.
- GPU de consumo: cabe sin problemas en RTX 3060 12 GB, RTX 4060 8 GB, RTX 3070/4070 y en tarjetas de 4-6 GB como GTX 1650 Super o RTX 3050, siempre en bf16/fp16 o cuantizado.
- CPU: viable para inferencia interactiva con llama.cpp u Ollama tras convertir los pesos a GGUF, conversión que el autor no publica.
- GPU de datacenter: A100, H100 y L40S están sobredimensionadas para este tamaño; su uso solo se justifica por agregación de muchas peticiones concurrentes.
- Opciones de despliegue: `transformers` (soporte nativo, formato `safetensors`), TGI (el repo declara `text-generation-inference`), vLLM (requiere verificar compatibilidad con la arquitectura concreta) y endpoints de HuggingFace (`endpoints_compatible`). Para llama.cpp u Ollama hace falta una conversión a GGUF que no está publicada.
- Latencia y throughput: no disponibles. No hay mediciones publicadas y no deben extrapolarse sin prueba propia.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de información pública de sus respectivas model cards y no de la documentación de este repositorio; conviene verificarlos en la fuente antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Estado en el repo |
|---|---|---|---|---|
| Este checkpoint (`qwen-metaphor-unke-camada-22-prompt-textual`) | 596.049.920 | no disponible | no disponible | Pesos safetensors, sin model card, 139 descargas |
| Qwen3-0.6B (posible base, no confirmado) | ~0,6 B | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | Modelo oficial con documentación completa y benchmarks publicados |
| Qwen3-1.7B | ~1,7 B | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | Misma familia, mayor capacidad a costa de más VRAM |
| Llama 3.2 1B | ~1,24 B | 128.000 tokens | Llama 3.2 Community License | Alternativa de tamaño similar con contexto mucho mayor y licencia con restricciones |

Diferencias clave: frente a los tres comparadores, este checkpoint carece de model card, de licencia declarada y de cualquier evaluación publicada, lo que lo inhabilita para uso comercial sin aclaración previa del autor. Su única ventaja diferencial es el valor como artefacto de investigación reproducible por su carácter de intervención sobre una capa concreta.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial, redistribución ni obra derivada. Es el bloqueante principal para cualquier despliegue en producción.
- Ausencia total de documentación: no se conoce modelo base, datos de entrenamiento, plantilla de chat ni idiomas soportados. Cualquier uso requiere ingeniería inversa previa (inspección de `config.json`, `tokenizer_config.json` y `generation_config.json`).
- Riesgo de alucinación: no evaluado. En un modelo de 596 M de parámetros la tasa de afirmaciones incorrectas suele ser alta en conocimiento factual, pero no hay medición para este checkpoint.
- Sesgos: no documentados. Al desconocerse el corpus de entrenamiento y el proceso de ajuste, no puede estimarse la presencia de sesgos de género, etnia, idioma o dominio.
- Posible sobreajuste al experimento: si el checkpoint es el resultado de una intervención sobre una capa, su comportamiento puede degradarse fuera de la tarea concreta para la que fue entrenado, incluyendo pérdida de coherencia multi-turno.
- Ambigüedad del repositorio: los 7,2 GB declarados frente a los ~1,2 GB esperados en bf16 indican que el repo puede contener artefactos adicionales (estados de optimizador, copias en fp32, checkpoints intermedios). Verificar antes de descargar y antes de asumir qué fichero es el modelo final.
- Sin garantías de mantenimiento: 0 likes, 139 descargas y una model card sin rellenar sugieren un repositorio de carácter personal, sin soporte ni actualizaciones garantizadas.
- Contexto desconocido: no debe asumirse ninguna ventana de contexto; si se hereda de Qwen3-0.6B serían 32.768 tokens, pero es una suposición no verificada.

## Enlaces

- HuggingFace: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-22-prompt-textual
- Referencia citada en los tags del repo (calculadora de impacto ambiental de Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Modelo base posible, no confirmado por el autor (familia Qwen3): https://huggingface.co/Qwen/Qwen3-0.6B
- Paper, blog, repositorio de código o demo del autor: no disponibles en la información proporcionada.
